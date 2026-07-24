import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient;
type Tx = Prisma.TransactionClient;
type Role = 'OPERATOR' | 'REVIEWER' | 'MANAGER' | 'AUDITOR';
type Actor = { userId: string; workspaceId: string };

const ZERO_HASH = '0'.repeat(64);
const CONNECTOR_KINDS = new Set(['CRM', 'EMAIL', 'CALENDAR', 'ENRICHMENT', 'CONSENT', 'SUPPRESSION']);
const CHANNELS = new Set(['EMAIL', 'SMS', 'PHONE']);
const REGIONS = new Set(['US', 'CA', 'EU', 'UK']);
const TRANSITIONS: Record<string, string[]> = {
  NEW: ['QUALIFIED', 'DISQUALIFIED', 'EXCEPTION'],
  QUALIFIED: ['OUTREACH_PENDING', 'DISQUALIFIED', 'HANDED_OFF', 'EXCEPTION'],
  OUTREACH_PENDING: ['OUTREACH_APPROVED', 'QUALIFIED', 'DISQUALIFIED', 'EXCEPTION'],
  OUTREACH_APPROVED: ['CONTACTED', 'QUALIFIED', 'EXCEPTION'],
  CONTACTED: ['CONVERTED', 'DISQUALIFIED', 'HANDED_OFF', 'EXCEPTION'],
  HANDED_OFF: ['QUALIFIED', 'CONTACTED', 'EXCEPTION'],
  EXCEPTION: ['NEW', 'QUALIFIED', 'DISQUALIFIED'],
  CONVERTED: [],
  DISQUALIFIED: [],
};

export class SalesWorkflowError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'SalesWorkflowError';
  }
}

function canonical(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonical(child)]));
  }
  return value;
}

export function stableJson(value: unknown): string {
  return JSON.stringify(canonical(value));
}

export function salesSha256(value: unknown): string {
  return createHash('sha256').update(typeof value === 'string' ? value : stableJson(value)).digest('hex');
}

function text(value: unknown, field: string, maximum: number, minimum = 1): string {
  if (typeof value !== 'string') throw new SalesWorkflowError(400, 'VALIDATION_FAILED', `${field} must be text`);
  const result = value.trim();
  if (result.length < minimum || result.length > maximum) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', `${field} must be ${minimum}-${maximum} characters`);
  }
  return result;
}

function timestamp(value: unknown, field: string): Date {
  const result = new Date(typeof value === 'string' || value instanceof Date ? value : Number.NaN);
  if (Number.isNaN(result.getTime()) || result.getTime() > Date.now() + 5 * 60_000) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', `${field} must be a non-future timestamp`);
  }
  return result;
}

function integer(value: unknown, field: string, minimum = 1): number {
  if (!Number.isInteger(value) || Number(value) < minimum) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', `${field} must be an integer of at least ${minimum}`);
  }
  return Number(value);
}

async function membership(tx: Tx, actor: Actor, roles: Role[]) {
  const found = await tx.salesMembership.findUnique({
    where: { workspaceId_userId: { workspaceId: actor.workspaceId, userId: actor.userId } },
    include: { workspace: { select: { active: true } } },
  });
  if (!found?.active || !found.workspace.active) {
    throw new SalesWorkflowError(403, 'MEMBERSHIP_REQUIRED', 'An active sales workspace membership is required');
  }
  if (!roles.includes(found.role as Role)) {
    throw new SalesWorkflowError(403, 'ROLE_REQUIRED', 'This sales role cannot perform the operation');
  }
  return found;
}

async function appendAudit(
  tx: Tx,
  input: { workspaceId: string; actorId?: string; leadId?: string; action: string; details: Record<string, unknown> },
) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'sales-audit:' + input.workspaceId}))::text AS "locked"`;
  const previous = await tx.salesAuditEvent.findFirst({
    where: { workspaceId: input.workspaceId },
    orderBy: { sequence: 'desc' },
    select: { eventHash: true, createdAt: true },
  });
  const createdAt = new Date(Math.max(Date.now(), previous ? previous.createdAt.getTime() + 1 : 0));
  const previousHash = previous?.eventHash ?? ZERO_HASH;
  const details = canonical(input.details) as Prisma.InputJsonValue;
  const eventHash = salesSha256({
    workspaceId: input.workspaceId,
    actorId: input.actorId ?? null,
    leadId: input.leadId ?? null,
    action: input.action,
    details,
    previousHash,
    createdAt: createdAt.toISOString(),
  });
  return tx.salesAuditEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      leadId: input.leadId,
      action: input.action,
      details,
      previousHash,
      eventHash,
      createdAt,
    },
  });
}

async function recordSync(
  tx: Tx,
  input: {
    workspaceId: string;
    connectorKind: string;
    direction: 'INBOUND' | 'OUTBOUND';
    sourceEventId: string;
    payload: unknown;
    sourceObservedAt: Date;
    state?: string;
  },
): Promise<boolean> {
  if (!CONNECTOR_KINDS.has(input.connectorKind)) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Unsupported connector kind');
  }
  const payloadSha256 = salesSha256(input.payload);
  const key = {
    workspaceId: input.workspaceId,
    connectorKind: input.connectorKind,
    direction: input.direction,
    sourceEventId: input.sourceEventId,
  };
  const existing = await tx.salesSyncEvent.findUnique({
    where: { workspaceId_connectorKind_direction_sourceEventId: key },
  });
  if (existing) {
    if (existing.payloadSha256 !== payloadSha256) {
      throw new SalesWorkflowError(409, 'SYNC_CONFLICT', 'The source event identifier has a different payload');
    }
    return false;
  }
  await tx.salesSyncEvent.create({
    data: { ...key, payloadSha256, sourceObservedAt: input.sourceObservedAt, state: input.state ?? 'APPLIED' },
  });
  return true;
}

async function queueOutbound(
  tx: Tx,
  input: { workspaceId: string; aggregateId: string; connectorKind: string; eventType: string; idempotencyKey: string; payload: Record<string, unknown> },
) {
  const observedAt = new Date();
  await tx.salesOutbox.upsert({
    where: {
      workspaceId_connectorKind_idempotencyKey: {
        workspaceId: input.workspaceId,
        connectorKind: input.connectorKind,
        idempotencyKey: input.idempotencyKey,
      },
    },
    create: {
      ...input,
      payload: input.payload as Prisma.InputJsonValue,
      state: 'QUEUED',
    },
    update: {},
  });
  await recordSync(tx, {
    workspaceId: input.workspaceId,
    connectorKind: input.connectorKind,
    direction: 'OUTBOUND',
    sourceEventId: input.idempotencyKey,
    payload: input.payload,
    sourceObservedAt: observedAt,
    state: 'QUEUED',
  });
}

export async function ingestCrmLead(
  db: Db,
  actor: Actor,
  raw: {
    eventId?: string; externalCrmId?: string; displayName?: string; contactReference?: string;
    region?: string; sourceSystem?: string; sourceRevision?: string; sourceObservedAt?: string;
    ownerId?: string; attribution?: Record<string, unknown>;
  },
) {
  const input = {
    eventId: text(raw.eventId, 'eventId', 160),
    externalCrmId: text(raw.externalCrmId, 'externalCrmId', 160),
    displayName: text(raw.displayName, 'displayName', 200),
    contactReference: text(raw.contactReference, 'contactReference', 300),
    region: text(raw.region, 'region', 2).toUpperCase(),
    sourceSystem: text(raw.sourceSystem, 'sourceSystem', 80),
    sourceRevision: text(raw.sourceRevision, 'sourceRevision', 120),
    sourceObservedAt: timestamp(raw.sourceObservedAt, 'sourceObservedAt'),
    ownerId: raw.ownerId ? text(raw.ownerId, 'ownerId', 100) : actor.userId,
    attribution: raw.attribution ?? {},
  };
  if (!REGIONS.has(input.region)) throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Unsupported region');
  return db.$transaction(async (tx) => {
    await membership(tx, actor, ['OPERATOR', 'MANAGER']);
    const owner = await tx.salesMembership.findUnique({
      where: { workspaceId_userId: { workspaceId: actor.workspaceId, userId: input.ownerId } },
    });
    if (!owner?.active) throw new SalesWorkflowError(400, 'INVALID_OWNER', 'Owner must be an active workspace member');
    const existing = await tx.salesLead.findUnique({
      where: { workspaceId_externalCrmId: { workspaceId: actor.workspaceId, externalCrmId: input.externalCrmId } },
    });
    const applied = await recordSync(tx, {
      workspaceId: actor.workspaceId,
      connectorKind: 'CRM',
      direction: 'INBOUND',
      sourceEventId: input.eventId,
      payload: raw,
      sourceObservedAt: input.sourceObservedAt,
    });
    if (!applied) return { replayed: true, lead: existing };
    if (existing && existing.sourceObservedAt >= input.sourceObservedAt) {
      throw new SalesWorkflowError(409, 'STALE_SYNC', 'The CRM event does not advance source time');
    }
    const qualityFlags = Object.keys(input.attribution).length ? [] : ['MISSING_ATTRIBUTION'];
    const lead = await tx.salesLead.upsert({
      where: { workspaceId_externalCrmId: { workspaceId: actor.workspaceId, externalCrmId: input.externalCrmId } },
      create: {
        workspaceId: actor.workspaceId,
        externalCrmId: input.externalCrmId,
        displayName: input.displayName,
        contactReference: input.contactReference,
        region: input.region,
        ownerId: input.ownerId,
        sourceSystem: input.sourceSystem,
        sourceRevision: input.sourceRevision,
        sourceObservedAt: input.sourceObservedAt,
        attribution: input.attribution as Prisma.InputJsonValue,
        qualityFlags,
      },
      update: {
        displayName: input.displayName,
        contactReference: input.contactReference,
        region: input.region,
        ownerId: input.ownerId,
        sourceSystem: input.sourceSystem,
        sourceRevision: input.sourceRevision,
        sourceObservedAt: input.sourceObservedAt,
        attribution: input.attribution as Prisma.InputJsonValue,
        qualityFlags,
        version: { increment: 1 },
      },
    });
    if (!existing) {
      await queueOutbound(tx, {
        workspaceId: actor.workspaceId,
        aggregateId: lead.id,
        connectorKind: 'ENRICHMENT',
        eventType: 'LEAD_ENRICHMENT_REQUESTED',
        idempotencyKey: `enrich:${lead.id}:${input.sourceRevision}`,
        payload: { leadId: lead.id, contactReference: lead.contactReference, region: lead.region },
      });
    }
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: lead.id,
      action: existing ? 'LEAD_SYNCED' : 'LEAD_CREATED',
      details: { eventId: input.eventId, sourceSystem: input.sourceSystem, sourceRevision: input.sourceRevision, qualityFlags },
    });
    return { replayed: false, lead };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 30_000, timeout: 30_000 });
}

async function ownedLead(tx: Tx, actor: Actor, leadId: string, roles: Role[]) {
  const member = await membership(tx, actor, roles);
  const lead = await tx.salesLead.findFirst({ where: { id: leadId, workspaceId: actor.workspaceId } });
  if (!lead) throw new SalesWorkflowError(404, 'LEAD_NOT_FOUND', 'Lead not found');
  if (member.role !== 'MANAGER' && lead.ownerId !== actor.userId) {
    throw new SalesWorkflowError(403, 'OWNERSHIP_REQUIRED', 'Only the owner or a manager may change this lead');
  }
  return { lead, member };
}

export async function recordConsent(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; channel?: string; purpose?: string; state?: string; lawfulBasis?: string; sourceSystem?: string; eventId?: string; sourceObservedAt?: string },
) {
  const input = {
    leadId: text(raw.leadId, 'leadId', 100),
    channel: text(raw.channel, 'channel', 20).toUpperCase(),
    purpose: text(raw.purpose, 'purpose', 120),
    state: text(raw.state, 'state', 20).toUpperCase(),
    lawfulBasis: text(raw.lawfulBasis, 'lawfulBasis', 120),
    sourceSystem: text(raw.sourceSystem, 'sourceSystem', 80),
    eventId: text(raw.eventId, 'eventId', 160),
    sourceObservedAt: timestamp(raw.sourceObservedAt, 'sourceObservedAt'),
  };
  if (!CHANNELS.has(input.channel) || !['GRANTED', 'WITHDRAWN'].includes(input.state)) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Invalid consent channel or state');
  }
  return db.$transaction(async (tx) => {
    await ownedLead(tx, actor, input.leadId, ['OPERATOR', 'MANAGER']);
    const applied = await recordSync(tx, {
      workspaceId: actor.workspaceId,
      connectorKind: 'CONSENT',
      direction: 'INBOUND',
      sourceEventId: input.eventId,
      payload: raw,
      sourceObservedAt: input.sourceObservedAt,
    });
    if (!applied) return { replayed: true };
    const latest = await tx.salesConsentEvent.findFirst({
      where: { leadId: input.leadId, channel: input.channel, purpose: input.purpose },
      orderBy: { sourceObservedAt: 'desc' },
    });
    if (latest && latest.sourceObservedAt >= input.sourceObservedAt) {
      throw new SalesWorkflowError(409, 'STALE_SYNC', 'The consent event is stale');
    }
    await tx.salesConsentEvent.create({
      data: {
        leadId: input.leadId,
        channel: input.channel,
        purpose: input.purpose,
        state: input.state,
        lawfulBasis: input.lawfulBasis,
        sourceSystem: input.sourceSystem,
        sourceEventId: input.eventId,
        sourceObservedAt: input.sourceObservedAt,
      },
    });
    if (input.state === 'WITHDRAWN') {
      await tx.salesSuppression.create({
        data: {
          leadId: input.leadId,
          channel: input.channel,
          reason: 'CONSENT_WITHDRAWN',
          sourceSystem: input.sourceSystem,
          sourceEventId: `${input.eventId}:suppression`,
          sourceObservedAt: input.sourceObservedAt,
        },
      });
      await tx.salesOutreach.updateMany({
        where: { leadId: input.leadId, channel: input.channel, state: { in: ['REVIEW_REQUIRED', 'APPROVED', 'QUEUED'] } },
        data: { state: 'CANCELLED', failureCode: 'CONSENT_WITHDRAWN' },
      });
    }
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: input.leadId,
      action: `CONSENT_${input.state}`,
      details: { channel: input.channel, purpose: input.purpose, sourceSystem: input.sourceSystem, eventId: input.eventId },
    });
    return { replayed: false, state: input.state };
  });
}

export async function recordSuppression(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; channel?: string; reason?: string; sourceSystem?: string; eventId?: string; sourceObservedAt?: string },
) {
  const input = {
    leadId: text(raw.leadId, 'leadId', 100),
    channel: text(raw.channel, 'channel', 20).toUpperCase(),
    reason: text(raw.reason, 'reason', 240),
    sourceSystem: text(raw.sourceSystem, 'sourceSystem', 80),
    eventId: text(raw.eventId, 'eventId', 160),
    sourceObservedAt: timestamp(raw.sourceObservedAt, 'sourceObservedAt'),
  };
  if (![...CHANNELS, 'ALL'].includes(input.channel)) throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Invalid suppression channel');
  return db.$transaction(async (tx) => {
    await ownedLead(tx, actor, input.leadId, ['OPERATOR', 'MANAGER']);
    const applied = await recordSync(tx, {
      workspaceId: actor.workspaceId,
      connectorKind: 'SUPPRESSION',
      direction: 'INBOUND',
      sourceEventId: input.eventId,
      payload: raw,
      sourceObservedAt: input.sourceObservedAt,
    });
    if (!applied) return { replayed: true };
    await tx.salesSuppression.create({
      data: {
        leadId: input.leadId,
        channel: input.channel,
        reason: input.reason,
        sourceSystem: input.sourceSystem,
        sourceEventId: input.eventId,
        sourceObservedAt: input.sourceObservedAt,
      },
    });
    await tx.salesOutreach.updateMany({
      where: {
        leadId: input.leadId,
        state: { in: ['REVIEW_REQUIRED', 'APPROVED', 'QUEUED'] },
        ...(input.channel === 'ALL' ? {} : { channel: input.channel }),
      },
      data: { state: 'CANCELLED', failureCode: 'SUPPRESSED' },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: input.leadId,
      action: 'LEAD_SUPPRESSED',
      details: { channel: input.channel, reason: input.reason, eventId: input.eventId },
    });
    return { replayed: false };
  });
}

export async function applyEnrichment(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; eventId?: string; sourceSystem?: string; sourceObservedAt?: string; attributes?: Record<string, unknown>; qualityFlags?: string[] },
) {
  const leadId = text(raw.leadId, 'leadId', 100);
  const eventId = text(raw.eventId, 'eventId', 160);
  const sourceSystem = text(raw.sourceSystem, 'sourceSystem', 80);
  const observedAt = timestamp(raw.sourceObservedAt, 'sourceObservedAt');
  const flags = Array.isArray(raw.qualityFlags) ? raw.qualityFlags.map((flag) => text(flag, 'qualityFlag', 80)) : [];
  return db.$transaction(async (tx) => {
    const { lead } = await ownedLead(tx, actor, leadId, ['OPERATOR', 'MANAGER']);
    const applied = await recordSync(tx, {
      workspaceId: actor.workspaceId,
      connectorKind: 'ENRICHMENT',
      direction: 'INBOUND',
      sourceEventId: eventId,
      payload: raw,
      sourceObservedAt: observedAt,
    });
    if (!applied) return { replayed: true };
    const attribution = { ...(lead.attribution as Record<string, unknown>), enrichment: { sourceSystem, observedAt: observedAt.toISOString(), attributes: raw.attributes ?? {} } };
    const updated = await tx.salesLead.update({
      where: { id: lead.id },
      data: { attribution: attribution as Prisma.InputJsonValue, qualityFlags: flags, version: { increment: 1 } },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId,
      action: 'LEAD_ENRICHED',
      details: { eventId, sourceSystem, qualityFlags: flags },
    });
    return { replayed: false, lead: updated };
  });
}

export async function recordCalendarEngagement(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; eventId?: string; externalEventId?: string; state?: string; startsAt?: string; sourceSystem?: string; sourceObservedAt?: string },
) {
  const input = {
    leadId: text(raw.leadId, 'leadId', 100),
    eventId: text(raw.eventId, 'eventId', 160),
    externalEventId: text(raw.externalEventId, 'externalEventId', 160),
    state: text(raw.state, 'state', 20).toUpperCase(),
    startsAt: timestamp(raw.startsAt, 'startsAt'),
    sourceSystem: text(raw.sourceSystem, 'sourceSystem', 80),
    sourceObservedAt: timestamp(raw.sourceObservedAt, 'sourceObservedAt'),
  };
  if (!['BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(input.state)) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Invalid calendar state');
  }
  return db.$transaction(async (tx) => {
    await ownedLead(tx, actor, input.leadId, ['OPERATOR', 'MANAGER']);
    const applied = await recordSync(tx, {
      workspaceId: actor.workspaceId,
      connectorKind: 'CALENDAR',
      direction: 'INBOUND',
      sourceEventId: input.eventId,
      payload: raw,
      sourceObservedAt: input.sourceObservedAt,
    });
    if (!applied) return { replayed: true };
    const engagement = await tx.salesEngagement.upsert({
      where: { sourceSystem_externalEventId: { sourceSystem: input.sourceSystem, externalEventId: input.externalEventId } },
      create: {
        leadId: input.leadId,
        externalEventId: input.externalEventId,
        state: input.state,
        startsAt: input.startsAt,
        sourceSystem: input.sourceSystem,
        sourceObservedAt: input.sourceObservedAt,
      },
      update: { state: input.state, startsAt: input.startsAt, sourceObservedAt: input.sourceObservedAt },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: input.leadId,
      action: `CALENDAR_${input.state}`,
      details: { eventId: input.eventId, externalEventId: input.externalEventId },
    });
    return { replayed: false, engagement };
  });
}

export async function transitionLead(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; state?: string; expectedVersion?: number; reason?: string },
) {
  const leadId = text(raw.leadId, 'leadId', 100);
  const state = text(raw.state, 'state', 30).toUpperCase();
  const expectedVersion = integer(raw.expectedVersion, 'expectedVersion');
  const reason = text(raw.reason, 'reason', 500);
  return db.$transaction(async (tx) => {
    const { lead } = await ownedLead(tx, actor, leadId, ['OPERATOR', 'MANAGER']);
    if (lead.version !== expectedVersion) throw new SalesWorkflowError(409, 'VERSION_CONFLICT', 'Lead changed; refresh and retry');
    if (!TRANSITIONS[lead.lifecycleState]?.includes(state)) {
      throw new SalesWorkflowError(409, 'INVALID_LIFECYCLE_TRANSITION', `Cannot move ${lead.lifecycleState} to ${state}`);
    }
    const updated = await tx.salesLead.update({
      where: { id: lead.id },
      data: { lifecycleState: state, version: { increment: 1 } },
    });
    await queueOutbound(tx, {
      workspaceId: actor.workspaceId,
      aggregateId: lead.id,
      connectorKind: 'CRM',
      eventType: 'LEAD_LIFECYCLE_CHANGED',
      idempotencyKey: `crm:${lead.id}:v${updated.version}`,
      payload: { leadId: lead.id, externalCrmId: lead.externalCrmId, state, reason, version: updated.version },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: lead.id,
      action: 'LEAD_TRANSITIONED',
      details: { from: lead.lifecycleState, to: state, reason, previousVersion: lead.version, version: updated.version },
    });
    return updated;
  });
}

export async function handoffLead(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; toOwnerId?: string; expectedVersion?: number; reason?: string },
) {
  const leadId = text(raw.leadId, 'leadId', 100);
  const toOwnerId = text(raw.toOwnerId, 'toOwnerId', 100);
  const expectedVersion = integer(raw.expectedVersion, 'expectedVersion');
  const reason = text(raw.reason, 'reason', 500);
  return db.$transaction(async (tx) => {
    const { lead } = await ownedLead(tx, actor, leadId, ['OPERATOR', 'MANAGER']);
    if (lead.version !== expectedVersion) throw new SalesWorkflowError(409, 'VERSION_CONFLICT', 'Lead changed; refresh and retry');
    const newOwner = await tx.salesMembership.findUnique({
      where: { workspaceId_userId: { workspaceId: actor.workspaceId, userId: toOwnerId } },
    });
    if (!newOwner?.active || !['OPERATOR', 'MANAGER'].includes(newOwner.role)) {
      throw new SalesWorkflowError(400, 'INVALID_OWNER', 'New owner must be an active operator or manager');
    }
    const updated = await tx.salesLead.update({
      where: { id: lead.id },
      data: { ownerId: toOwnerId, lifecycleState: 'HANDED_OFF', version: { increment: 1 } },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId,
      action: 'LEAD_HANDED_OFF',
      details: { fromOwnerId: lead.ownerId, toOwnerId, reason, version: updated.version },
    });
    return updated;
  });
}

export async function requestOutreach(
  db: Db,
  actor: Actor,
  raw: { leadId?: string; channel?: string; templateId?: string; campaignId?: string; idempotencyKey?: string; scheduledAt?: string; expectedVersion?: number },
) {
  const input = {
    leadId: text(raw.leadId, 'leadId', 100),
    channel: text(raw.channel, 'channel', 20).toUpperCase(),
    templateId: text(raw.templateId, 'templateId', 120),
    campaignId: text(raw.campaignId, 'campaignId', 120),
    idempotencyKey: text(raw.idempotencyKey, 'idempotencyKey', 128, 8),
    scheduledAt: new Date(typeof raw.scheduledAt === 'string' ? raw.scheduledAt : Number.NaN),
    expectedVersion: integer(raw.expectedVersion, 'expectedVersion'),
  };
  // The bounded production journey has a typed EMAIL connector. Consent and
  // suppression evidence may cover other channels, but they cannot be queued
  // until an equally governed channel adapter exists.
  if (input.channel !== 'EMAIL' || Number.isNaN(input.scheduledAt.getTime()) || input.scheduledAt <= new Date()) {
    throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Outreach channel or scheduledAt is invalid');
  }
  return db.$transaction(async (tx) => {
    const { lead } = await ownedLead(tx, actor, input.leadId, ['OPERATOR', 'MANAGER']);
    const prior = await tx.salesOutreach.findUnique({
      where: { workspaceId_idempotencyKey: { workspaceId: actor.workspaceId, idempotencyKey: input.idempotencyKey } },
    });
    if (prior) {
      const same = prior.leadId === input.leadId && prior.channel === input.channel
        && prior.templateId === input.templateId && prior.campaignId === input.campaignId
        && prior.scheduledAt.getTime() === input.scheduledAt.getTime();
      if (!same) throw new SalesWorkflowError(409, 'IDEMPOTENCY_CONFLICT', 'Outreach key has a different payload');
      return { replayed: true, outreach: prior };
    }
    if (lead.version !== input.expectedVersion) throw new SalesWorkflowError(409, 'VERSION_CONFLICT', 'Lead changed; refresh and retry');
    if (lead.lifecycleState !== 'QUALIFIED') throw new SalesWorkflowError(409, 'LEAD_NOT_QUALIFIED', 'Lead must be qualified');
    const suppression = await tx.salesSuppression.findFirst({
      where: { leadId: lead.id, active: true, channel: { in: [input.channel, 'ALL'] } },
    });
    if (suppression) throw new SalesWorkflowError(409, 'LEAD_SUPPRESSED', 'Active suppression blocks outreach');
    const consent = await tx.salesConsentEvent.findFirst({
      where: { leadId: lead.id, channel: input.channel, purpose: 'SALES_OUTREACH' },
      orderBy: { sourceObservedAt: 'desc' },
    });
    if (consent?.state !== 'GRANTED') throw new SalesWorkflowError(409, 'CONSENT_REQUIRED', 'Current channel consent is required');
    const rateLimit = Number(process.env.SALES_OUTREACH_DAILY_LIMIT ?? 20);
    if (!Number.isInteger(rateLimit) || rateLimit < 1) throw new SalesWorkflowError(500, 'INVALID_RUNTIME_CONFIG', 'SALES_OUTREACH_DAILY_LIMIT is invalid');
    const sentToday = await tx.salesOutreach.count({
      where: { workspaceId: actor.workspaceId, submittedById: actor.userId, createdAt: { gte: new Date(Date.now() - 86_400_000) } },
    });
    if (sentToday >= rateLimit) throw new SalesWorkflowError(429, 'OUTREACH_RATE_LIMITED', 'Daily outreach limit reached');
    const outreach = await tx.salesOutreach.create({
      data: {
        leadId: input.leadId,
        channel: input.channel,
        templateId: input.templateId,
        campaignId: input.campaignId,
        idempotencyKey: input.idempotencyKey,
        scheduledAt: input.scheduledAt,
        workspaceId: actor.workspaceId,
        submittedById: actor.userId,
        state: 'REVIEW_REQUIRED',
      },
    });
    await tx.salesLead.update({ where: { id: lead.id }, data: { lifecycleState: 'OUTREACH_PENDING', version: { increment: 1 } } });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId,
      actorId: actor.userId,
      leadId: lead.id,
      action: 'OUTREACH_REVIEW_REQUESTED',
      details: { outreachId: outreach.id, channel: input.channel, campaignId: input.campaignId, region: lead.region },
    });
    return { replayed: false, outreach };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 30_000, timeout: 30_000 });
}

export async function reviewOutreach(
  db: Db,
  actor: Actor,
  raw: { outreachId?: string; decision?: string; notes?: string },
) {
  const outreachId = text(raw.outreachId, 'outreachId', 100);
  const decision = text(raw.decision, 'decision', 20).toUpperCase();
  const notes = text(raw.notes, 'notes', 1000);
  if (!['APPROVE', 'REJECT'].includes(decision)) throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Invalid decision');
  return db.$transaction(async (tx) => {
    await membership(tx, actor, ['REVIEWER', 'MANAGER']);
    const outreach = await tx.salesOutreach.findFirst({ where: { id: outreachId, workspaceId: actor.workspaceId } });
    if (!outreach) throw new SalesWorkflowError(404, 'OUTREACH_NOT_FOUND', 'Outreach not found');
    if (outreach.state !== 'REVIEW_REQUIRED') throw new SalesWorkflowError(409, 'INVALID_OUTREACH_STATE', 'Outreach is not awaiting review');
    if (outreach.submittedById === actor.userId) throw new SalesWorkflowError(409, 'SEPARATION_OF_DUTIES', 'Submitter cannot review their own outreach');
    if (decision === 'REJECT') {
      const rejected = await tx.salesOutreach.update({
        where: { id: outreach.id },
        data: { state: 'CANCELLED', reviewedById: actor.userId, reviewNotes: notes, failureCode: 'REVIEW_REJECTED' },
      });
      await tx.salesLead.update({ where: { id: outreach.leadId }, data: { lifecycleState: 'QUALIFIED', version: { increment: 1 } } });
      await appendAudit(tx, {
        workspaceId: actor.workspaceId, actorId: actor.userId, leadId: outreach.leadId,
        action: 'OUTREACH_REJECTED', details: { outreachId, notes },
      });
      return rejected;
    }
    const approved = await tx.salesOutreach.update({
      where: { id: outreach.id },
      data: { state: 'QUEUED', reviewedById: actor.userId, reviewNotes: notes },
    });
    await tx.salesLead.update({ where: { id: outreach.leadId }, data: { lifecycleState: 'OUTREACH_APPROVED', version: { increment: 1 } } });
    await queueOutbound(tx, {
      workspaceId: actor.workspaceId,
      aggregateId: outreach.id,
      connectorKind: 'EMAIL',
      eventType: 'OUTREACH_SEND',
      idempotencyKey: `outreach:${outreach.id}`,
      payload: { outreachId: outreach.id, leadId: outreach.leadId, channel: outreach.channel, templateId: outreach.templateId, campaignId: outreach.campaignId },
    });
    await appendAudit(tx, {
      workspaceId: actor.workspaceId, actorId: actor.userId, leadId: outreach.leadId,
      action: 'OUTREACH_APPROVED', details: { outreachId, notes },
    });
    return approved;
  });
}

export type SalesDeliveryAdapter = {
  deliver(input: { workspaceId: string; connectorKind: string; eventType: string; payload: unknown; idempotencyKey: string }): Promise<{
    provider: string; providerEventId: string; providerMessageId?: string;
  }>;
};

export async function processSalesOutbox(db: Db, workerId: string, adapter: SalesDeliveryAdapter) {
  const job = await db.$transaction(async (tx) => {
    const due = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "SalesOutbox"
      WHERE "state" IN ('QUEUED','RETRY') AND "nextAttemptAt" <= CURRENT_TIMESTAMP
        AND ("leaseExpiresAt" IS NULL OR "leaseExpiresAt" < CURRENT_TIMESTAMP)
      ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1`;
    if (!due[0]) return null;
    return tx.salesOutbox.update({
      where: { id: due[0].id },
      data: { state: 'PROCESSING', leaseOwner: workerId, leaseExpiresAt: new Date(Date.now() + 30_000), attempts: { increment: 1 } },
    });
  });
  if (!job) return null;
  try {
    const result = await adapter.deliver({
      workspaceId: job.workspaceId,
      connectorKind: job.connectorKind,
      eventType: job.eventType,
      payload: job.payload,
      idempotencyKey: job.idempotencyKey,
    });
    return db.$transaction(async (tx) => {
      await tx.salesProviderEvent.create({
        data: {
          workspaceId: job.workspaceId,
          provider: text(result.provider, 'provider', 120),
          providerEventId: text(result.providerEventId, 'providerEventId', 200),
          eventType: job.eventType,
          payloadSha256: salesSha256(result),
          occurredAt: new Date(),
        },
      });
      const completed = await tx.salesOutbox.update({
        where: { id: job.id },
        data: { state: 'SUCCEEDED', leaseOwner: null, leaseExpiresAt: null, lastError: null },
      });
      if (job.eventType === 'OUTREACH_SEND') {
        const outreach = await tx.salesOutreach.update({
          where: { id: job.aggregateId },
          data: { state: 'SENT', sentAt: new Date(), providerMessageId: result.providerMessageId ?? result.providerEventId, failureCode: null },
        });
        await tx.salesLead.update({ where: { id: outreach.leadId }, data: { lifecycleState: 'CONTACTED', version: { increment: 1 } } });
        await appendAudit(tx, {
          workspaceId: job.workspaceId, leadId: outreach.leadId, action: 'OUTREACH_SENT',
          details: { outreachId: outreach.id, provider: result.provider, providerEventId: result.providerEventId },
        });
      }
      return completed;
    });
  } catch (error) {
    const retryable = Boolean((error as { retryable?: boolean })?.retryable);
    const terminal = !retryable || job.attempts >= 5;
    await db.$transaction(async (tx) => {
      await tx.salesOutbox.update({
        where: { id: job.id },
        data: {
          state: terminal ? 'DEAD_LETTER' : 'RETRY',
          nextAttemptAt: new Date(Date.now() + Math.min(300_000, 1000 * (2 ** job.attempts))),
          leaseOwner: null,
          leaseExpiresAt: null,
          lastError: text((error as Error)?.message ?? 'connector failure', 'connector error', 500),
        },
      });
      if (job.eventType === 'OUTREACH_SEND') {
        await tx.salesOutreach.update({
          where: { id: job.aggregateId },
          data: { state: terminal ? 'FAILED' : 'QUEUED', failureCode: terminal ? 'DELIVERY_FAILED' : 'DELIVERY_RETRY' },
        });
      }
      await appendAudit(tx, {
        workspaceId: job.workspaceId,
        action: terminal ? 'CONNECTOR_DEAD_LETTERED' : 'CONNECTOR_RETRY_SCHEDULED',
        details: { outboxId: job.id, connectorKind: job.connectorKind, attempts: job.attempts, retryable },
      });
    });
    return { ...job, state: terminal ? 'DEAD_LETTER' : 'RETRY' };
  }
}

export async function recordProviderOptOut(
  db: Db,
  input: { workspaceId: string; provider: string; providerEventId: string; leadId: string; channel: string; occurredAt: string },
) {
  const occurredAt = timestamp(input.occurredAt, 'occurredAt');
  const channel = text(input.channel, 'channel', 20).toUpperCase();
  if (!CHANNELS.has(channel)) throw new SalesWorkflowError(400, 'VALIDATION_FAILED', 'Invalid opt-out channel');
  return db.$transaction(async (tx) => {
    const existing = await tx.salesProviderEvent.findUnique({
      where: { workspaceId_provider_providerEventId: { workspaceId: input.workspaceId, provider: input.provider, providerEventId: input.providerEventId } },
    });
    if (existing) return { replayed: true };
    const lead = await tx.salesLead.findFirst({ where: { id: input.leadId, workspaceId: input.workspaceId } });
    if (!lead) throw new SalesWorkflowError(404, 'LEAD_NOT_FOUND', 'Lead not found');
    await tx.salesProviderEvent.create({
      data: { workspaceId: input.workspaceId, provider: input.provider, providerEventId: input.providerEventId, eventType: 'CONTACT_OPTED_OUT', payloadSha256: salesSha256(input), occurredAt },
    });
    await tx.salesSuppression.create({
      data: { leadId: lead.id, channel, reason: 'PROVIDER_OPT_OUT', sourceSystem: input.provider, sourceEventId: input.providerEventId, sourceObservedAt: occurredAt },
    });
    await tx.salesOutreach.updateMany({
      where: { leadId: lead.id, channel, state: { in: ['REVIEW_REQUIRED', 'APPROVED', 'QUEUED'] } },
      data: { state: 'CANCELLED', failureCode: 'PROVIDER_OPT_OUT' },
    });
    await appendAudit(tx, {
      workspaceId: input.workspaceId, leadId: lead.id, action: 'PROVIDER_OPT_OUT_APPLIED',
      details: { provider: input.provider, providerEventId: input.providerEventId, channel },
    });
    return { replayed: false };
  });
}

export async function salesDashboard(db: Db, actor: Actor) {
  return db.$transaction(async (tx) => {
    await membership(tx, actor, ['OPERATOR', 'REVIEWER', 'MANAGER', 'AUDITOR']);
    const [total, converted, missingAttribution, deadLetters] = await Promise.all([
      tx.salesLead.count({ where: { workspaceId: actor.workspaceId } }),
      tx.salesLead.count({ where: { workspaceId: actor.workspaceId, lifecycleState: 'CONVERTED' } }),
      tx.salesLead.count({ where: { workspaceId: actor.workspaceId, qualityFlags: { array_contains: ['MISSING_ATTRIBUTION'] } } }),
      tx.salesOutbox.count({ where: { workspaceId: actor.workspaceId, state: 'DEAD_LETTER' } }),
    ]);
    return { total, converted, conversionRate: total ? converted / total : 0, missingAttribution, deadLetters };
  });
}

export async function verifySalesAudit(db: Db, actor: Actor) {
  return db.$transaction(async (tx) => {
    await membership(tx, actor, ['MANAGER', 'AUDITOR']);
    const events = await tx.salesAuditEvent.findMany({ where: { workspaceId: actor.workspaceId }, orderBy: { sequence: 'asc' } });
    let previousHash = ZERO_HASH;
    for (const event of events) {
      const expected = salesSha256({
        workspaceId: event.workspaceId,
        actorId: event.actorId,
        leadId: event.leadId,
        action: event.action,
        details: event.details,
        previousHash,
        createdAt: event.createdAt.toISOString(),
      });
      if (event.previousHash !== previousHash || event.eventHash !== expected) {
        return { valid: false, failedSequence: event.sequence.toString(), eventCount: events.length };
      }
      previousHash = event.eventHash;
    }
    return { valid: true, failedSequence: null, eventCount: events.length, headHash: previousHash };
  });
}

export function assertSalesTransition(from: string, to: string) {
  if (!TRANSITIONS[from]?.includes(to)) {
    throw new SalesWorkflowError(409, 'INVALID_LIFECYCLE_TRANSITION', `Cannot move ${from} to ${to}`);
  }
  return true;
}
