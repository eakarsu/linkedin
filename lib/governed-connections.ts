import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient;
type Tx = Prisma.TransactionClient;

export type WorkflowResponse<T = Record<string, unknown>> = {
  status: number;
  body: T;
};

export class WorkflowError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    status: number,
    code: string,
    message: string,
  ) {
    super(message);
    this.name = 'WorkflowError';
    this.status = status;
    this.code = code;
  }
}

const PURPOSES = new Set([
  'professional_networking',
  'sales_introduction',
  'recruiting',
  'partnership',
]);

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function requireIdempotencyKey(key: string): string {
  const normalized = key.trim();
  if (normalized.length < 8 || normalized.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(normalized)) {
    throw new WorkflowError(
      400,
      'INVALID_IDEMPOTENCY_KEY',
      'Idempotency-Key must be 8-128 URL-safe characters',
    );
  }
  return normalized;
}

function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new WorkflowError(500, 'INVALID_RUNTIME_CONFIG', `${name} must be a positive integer`);
  }
  return value;
}

async function advisoryLock(tx: Tx, scope: string): Promise<void> {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${scope}))::text AS "locked"`;
}

async function withIdempotency<T extends Record<string, unknown>>(
  db: Db,
  actorId: string,
  operation: string,
  rawKey: string,
  request: Record<string, unknown>,
  mutate: (tx: Tx) => Promise<WorkflowResponse<T>>,
): Promise<WorkflowResponse<T>> {
  const key = requireIdempotencyKey(rawKey);
  const requestHash = sha256(stableJson(request));

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.$transaction(async (tx) => {
        await advisoryLock(tx, `connection-idempotency:${actorId}:${operation}:${key}`);
        const existing = await tx.connectionIdempotency.findUnique({
          where: { actorId_operation_key: { actorId, operation, key } },
          select: { requestHash: true, responseStatus: true, responseBody: true },
        });

        if (existing) {
          if (existing.requestHash !== requestHash) {
            throw new WorkflowError(
              409,
              'IDEMPOTENCY_CONFLICT',
              'This idempotency key was already used with a different request',
            );
          }
          return {
            status: existing.responseStatus,
            body: existing.responseBody as T,
          };
        }

        const response = await mutate(tx);
        await tx.connectionIdempotency.create({
          data: {
            actorId,
            operation,
            key,
            requestHash,
            responseStatus: response.status,
            responseBody: response.body as Prisma.InputJsonValue,
          },
        });
        return response;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10_000 });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError
        && (error.code === 'P2034' || error.code === 'P2002');
      if (!retryable || attempt === 2) throw error;
    }
  }
  throw new WorkflowError(500, 'TRANSACTION_RETRY_EXHAUSTED', 'Transaction retry exhausted');
}

async function appendAuditEvent(
  tx: Tx,
  input: {
    connectionId?: string;
    subjectUserId: string;
    actorId: string;
    eventType: string;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  const scope = input.connectionId ?? `preference:${input.subjectUserId}`;
  await advisoryLock(tx, `connection-audit:${scope}`);
  const previous = await tx.connectionAuditEvent.findFirst({
    where: input.connectionId
      ? { connectionId: input.connectionId }
      : { connectionId: null, subjectUserId: input.subjectUserId },
    select: { eventHash: true, occurredAt: true },
    orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
  });
  const occurredAt = new Date(
    Math.max(Date.now(), previous ? previous.occurredAt.getTime() + 1 : 0),
  );
  const previousHash = previous?.eventHash ?? null;
  const eventHash = sha256(stableJson({
    scope,
    actorId: input.actorId,
    eventType: input.eventType,
    payload: input.payload,
    previousHash,
    occurredAt: occurredAt.toISOString(),
  }));

  await tx.connectionAuditEvent.create({
    data: {
      connectionId: input.connectionId,
      subjectUserId: input.subjectUserId,
      actorId: input.actorId,
      eventType: input.eventType,
      payload: input.payload as Prisma.InputJsonValue,
      previousHash,
      eventHash,
      occurredAt,
    },
  });
}

function connectionBody(connection: {
  id: string;
  userId: string;
  connectedId: string;
  status: string;
  purpose: string;
  message: string | null;
  version: number;
  expiresAt: Date;
  respondedAt: Date | null;
  withdrawnAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...connection,
    expiresAt: connection.expiresAt.toISOString(),
    respondedAt: connection.respondedAt?.toISOString() ?? null,
    withdrawnAt: connection.withdrawnAt?.toISOString() ?? null,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
  };
}

const connectionSelect = {
  id: true,
  userId: true,
  connectedId: true,
  status: true,
  purpose: true,
  message: true,
  version: true,
  expiresAt: true,
  respondedAt: true,
  withdrawnAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ConnectionSelect;

export async function createConnectionRequest(
  db: Db,
  input: {
    actorId: string;
    recipientId: string;
    purpose?: string;
    message?: string;
    idempotencyKey: string;
  },
): Promise<WorkflowResponse> {
  const recipientId = input.recipientId.trim();
  const purpose = (input.purpose ?? 'professional_networking').trim();
  const message = input.message?.trim() || null;
  if (!recipientId) throw new WorkflowError(400, 'RECIPIENT_REQUIRED', 'recipientId is required');
  if (recipientId === input.actorId) {
    throw new WorkflowError(400, 'SELF_CONNECTION', 'You cannot send a request to yourself');
  }
  if (!PURPOSES.has(purpose)) {
    throw new WorkflowError(400, 'INVALID_PURPOSE', 'Unsupported connection request purpose');
  }
  if (message && message.length > 500) {
    throw new WorkflowError(400, 'MESSAGE_TOO_LONG', 'Message must be 500 characters or fewer');
  }

  const request = { recipientId, purpose, message };
  return withIdempotency(db, input.actorId, 'create', input.idempotencyKey, request, async (tx) => {
    const pair = [input.actorId, recipientId].sort().join(':');
    await advisoryLock(tx, `connection-pair:${pair}`);

    const recipient = await tx.user.findUnique({ where: { id: recipientId }, select: { id: true } });
    if (!recipient) throw new WorkflowError(404, 'RECIPIENT_NOT_FOUND', 'Recipient was not found');

    const preference = await tx.outreachPreference.findUnique({
      where: { userId: recipientId },
      select: { allowConnectionRequests: true },
    });
    if (preference?.allowConnectionRequests === false) {
      throw new WorkflowError(
        403,
        'RECIPIENT_SUPPRESSED',
        'The recipient does not allow connection requests',
      );
    }

    const existing = await tx.connection.findFirst({
      where: {
        OR: [
          { userId: input.actorId, connectedId: recipientId },
          { userId: recipientId, connectedId: input.actorId },
        ],
      },
      select: { id: true, status: true },
    });
    if (existing) {
      throw new WorkflowError(409, 'CONNECTION_EXISTS', `A ${existing.status} connection already exists`);
    }

    const windowHours = positiveIntEnv('CONNECTION_RATE_WINDOW_HOURS', 24);
    const limit = positiveIntEnv('CONNECTION_RATE_LIMIT', 20);
    const sentInWindow = await tx.connection.count({
      where: {
        userId: input.actorId,
        createdAt: { gte: new Date(Date.now() - windowHours * 60 * 60 * 1000) },
      },
    });
    if (sentInWindow >= limit) {
      throw new WorkflowError(429, 'RATE_LIMITED', 'Connection request rate limit reached');
    }

    const ttlDays = positiveIntEnv('CONNECTION_REQUEST_TTL_DAYS', 14);
    const connection = await tx.connection.create({
      data: {
        userId: input.actorId,
        connectedId: recipientId,
        status: 'pending',
        purpose,
        message,
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
      select: connectionSelect,
    });
    await appendAuditEvent(tx, {
      connectionId: connection.id,
      subjectUserId: recipientId,
      actorId: input.actorId,
      eventType: 'REQUEST_CREATED',
      payload: {
        purpose,
        messageSha256: message ? sha256(message) : null,
        expiresAt: connection.expiresAt.toISOString(),
        version: connection.version,
      },
    });
    return { status: 201, body: { connection: connectionBody(connection) } };
  });
}

export async function decideConnectionRequest(
  db: Db,
  input: {
    actorId: string;
    connectionId: string;
    action: 'accept' | 'reject';
    expectedVersion: number;
    idempotencyKey: string;
  },
  options: { now?: Date } = {},
): Promise<WorkflowResponse> {
  if (!['accept', 'reject'].includes(input.action)) {
    throw new WorkflowError(400, 'INVALID_ACTION', 'action must be accept or reject');
  }
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    throw new WorkflowError(400, 'EXPECTED_VERSION_REQUIRED', 'expectedVersion must be a positive integer');
  }

  const request = {
    connectionId: input.connectionId,
    action: input.action,
    expectedVersion: input.expectedVersion,
  };
  const now = options.now ?? new Date();
  return withIdempotency<Record<string, unknown>>(
    db,
    input.actorId,
    'decide',
    input.idempotencyKey,
    request,
    async (tx) => {
    await advisoryLock(tx, `connection:${input.connectionId}`);
    const current = await tx.connection.findUnique({
      where: { id: input.connectionId },
      select: connectionSelect,
    });
    if (!current) throw new WorkflowError(404, 'REQUEST_NOT_FOUND', 'Connection request was not found');
    if (current.connectedId !== input.actorId) {
      throw new WorkflowError(403, 'RECIPIENT_ONLY', 'Only the recipient can decide this request');
    }
    if (current.status !== 'pending') {
      throw new WorkflowError(409, 'INVALID_STATE', `Request is already ${current.status}`);
    }
    if (current.version !== input.expectedVersion) {
      throw new WorkflowError(409, 'VERSION_CONFLICT', 'Request changed; refresh and retry');
    }

    if (current.expiresAt.getTime() <= now.getTime()) {
      const expired = await tx.connection.update({
        where: { id: current.id },
        data: { status: 'expired', version: { increment: 1 }, respondedAt: now },
        select: connectionSelect,
      });
      await appendAuditEvent(tx, {
        connectionId: current.id,
        subjectUserId: current.connectedId,
        actorId: input.actorId,
        eventType: 'REQUEST_EXPIRED',
        payload: { previousVersion: current.version, version: expired.version },
      });
      return {
        status: 409,
        body: { error: 'Connection request has expired', code: 'REQUEST_EXPIRED' },
      };
    }

    const status = input.action === 'accept' ? 'accepted' : 'rejected';
    const changed = await tx.connection.updateMany({
      where: { id: current.id, status: 'pending', version: input.expectedVersion },
      data: { status, version: { increment: 1 }, respondedAt: now },
    });
    if (changed.count !== 1) {
      throw new WorkflowError(409, 'VERSION_CONFLICT', 'Request changed; refresh and retry');
    }
    const updated = await tx.connection.findUniqueOrThrow({
      where: { id: current.id },
      select: connectionSelect,
    });
    await appendAuditEvent(tx, {
      connectionId: current.id,
      subjectUserId: current.connectedId,
      actorId: input.actorId,
      eventType: status === 'accepted' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED',
      payload: { previousVersion: current.version, version: updated.version },
    });
      return { status: 200, body: { connection: connectionBody(updated) } };
    },
  );
}

export async function withdrawConnectionRequest(
  db: Db,
  input: {
    actorId: string;
    connectionId: string;
    expectedVersion: number;
    idempotencyKey: string;
  },
): Promise<WorkflowResponse> {
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    throw new WorkflowError(400, 'EXPECTED_VERSION_REQUIRED', 'expectedVersion must be a positive integer');
  }
  const request = { connectionId: input.connectionId, expectedVersion: input.expectedVersion };
  return withIdempotency(db, input.actorId, 'withdraw', input.idempotencyKey, request, async (tx) => {
    await advisoryLock(tx, `connection:${input.connectionId}`);
    const current = await tx.connection.findUnique({
      where: { id: input.connectionId },
      select: connectionSelect,
    });
    if (!current) throw new WorkflowError(404, 'REQUEST_NOT_FOUND', 'Connection request was not found');
    if (current.userId !== input.actorId) {
      throw new WorkflowError(403, 'SENDER_ONLY', 'Only the sender can withdraw this request');
    }
    if (current.status !== 'pending') {
      throw new WorkflowError(409, 'INVALID_STATE', `Request is already ${current.status}`);
    }
    if (current.version !== input.expectedVersion) {
      throw new WorkflowError(409, 'VERSION_CONFLICT', 'Request changed; refresh and retry');
    }
    const updated = await tx.connection.update({
      where: { id: current.id },
      data: { status: 'withdrawn', version: { increment: 1 }, withdrawnAt: new Date() },
      select: connectionSelect,
    });
    await appendAuditEvent(tx, {
      connectionId: current.id,
      subjectUserId: current.connectedId,
      actorId: input.actorId,
      eventType: 'REQUEST_WITHDRAWN',
      payload: { previousVersion: current.version, version: updated.version },
    });
    return { status: 200, body: { connection: connectionBody(updated) } };
  });
}

export async function setOutreachPreference(
  db: Db,
  input: {
    actorId: string;
    allowConnectionRequests: boolean;
    suppressionReason?: string;
    expectedVersion: number;
    idempotencyKey: string;
  },
): Promise<WorkflowResponse> {
  if (typeof input.allowConnectionRequests !== 'boolean') {
    throw new WorkflowError(400, 'INVALID_PREFERENCE', 'allowConnectionRequests must be boolean');
  }
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0) {
    throw new WorkflowError(400, 'EXPECTED_VERSION_REQUIRED', 'expectedVersion must be zero or greater');
  }
  const reason = input.suppressionReason?.trim() || null;
  if (!input.allowConnectionRequests && (!reason || reason.length > 200)) {
    throw new WorkflowError(
      400,
      'SUPPRESSION_REASON_REQUIRED',
      'A suppression reason of 200 characters or fewer is required when opting out',
    );
  }
  const request = {
    allowConnectionRequests: input.allowConnectionRequests,
    suppressionReason: reason,
    expectedVersion: input.expectedVersion,
  };
  return withIdempotency(db, input.actorId, 'preference', input.idempotencyKey, request, async (tx) => {
    await advisoryLock(tx, `connection-preference:${input.actorId}`);
    const current = await tx.outreachPreference.findUnique({ where: { userId: input.actorId } });
    if ((!current && input.expectedVersion !== 0) || (current && current.version !== input.expectedVersion)) {
      throw new WorkflowError(409, 'VERSION_CONFLICT', 'Preference changed; refresh and retry');
    }
    const preference = current
      ? await tx.outreachPreference.update({
          where: { userId: input.actorId },
          data: {
            allowConnectionRequests: input.allowConnectionRequests,
            suppressionReason: input.allowConnectionRequests ? null : reason,
            suppressedAt: input.allowConnectionRequests ? null : new Date(),
            version: { increment: 1 },
          },
        })
      : await tx.outreachPreference.create({
          data: {
            userId: input.actorId,
            allowConnectionRequests: input.allowConnectionRequests,
            suppressionReason: input.allowConnectionRequests ? null : reason,
            suppressedAt: input.allowConnectionRequests ? null : new Date(),
          },
        });
    await appendAuditEvent(tx, {
      subjectUserId: input.actorId,
      actorId: input.actorId,
      eventType: input.allowConnectionRequests ? 'PREFERENCE_OPTED_IN' : 'PREFERENCE_OPTED_OUT',
      payload: {
        suppressionReason: input.allowConnectionRequests ? null : reason,
        previousVersion: current?.version ?? 0,
        version: preference.version,
      },
    });
    return {
      status: 200,
      body: {
        preference: {
          allowConnectionRequests: preference.allowConnectionRequests,
          suppressionReason: preference.suppressionReason,
          suppressedAt: preference.suppressedAt?.toISOString() ?? null,
          version: preference.version,
        },
      },
    };
  });
}

export async function verifyConnectionAudit(
  db: Db,
  actorId: string,
  connectionId: string,
): Promise<{ valid: boolean; events: Array<Record<string, unknown>> }> {
  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    select: { userId: true, connectedId: true },
  });
  if (!connection) throw new WorkflowError(404, 'REQUEST_NOT_FOUND', 'Connection request was not found');
  if (connection.userId !== actorId && connection.connectedId !== actorId) {
    throw new WorkflowError(403, 'PARTICIPANT_ONLY', 'Only request participants may view its audit history');
  }
  const events = await db.connectionAuditEvent.findMany({
    where: { connectionId },
    orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
  });
  let previousHash: string | null = null;
  let valid = true;
  for (const event of events) {
    const expected = sha256(stableJson({
      scope: connectionId,
      actorId: event.actorId,
      eventType: event.eventType,
      payload: event.payload,
      previousHash,
      occurredAt: event.occurredAt.toISOString(),
    }));
    if (event.previousHash !== previousHash || event.eventHash !== expected) valid = false;
    previousHash = event.eventHash;
  }
  return {
    valid,
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      actorId: event.actorId,
      payload: event.payload,
      previousHash: event.previousHash,
      eventHash: event.eventHash,
      occurredAt: event.occurredAt.toISOString(),
    })),
  };
}
