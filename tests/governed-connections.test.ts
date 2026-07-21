import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { PrismaClient } from '@prisma/client';
import {
  createConnectionRequest,
  decideConnectionRequest,
  setOutreachPreference,
  verifyConnectionAudit,
  withdrawConnectionRequest,
  WorkflowError,
} from '../lib/governed-connections.ts';

const db = new PrismaClient();

async function addUser(label: string): Promise<string> {
  const id = randomUUID();
  await db.$executeRaw`
    INSERT INTO "User" ("id", "name", "email", "password", "updatedAt")
    VALUES (${id}, ${label}, ${`${label}-${id}@example.test`}, ${'not-used-in-workflow-tests'}, CURRENT_TIMESTAMP)
  `;
  return id;
}

async function expectWorkflowError(
  action: () => Promise<unknown>,
  status: number,
  code: string,
): Promise<void> {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof WorkflowError);
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

test('governed request lifecycle enforces consent, authority, replay, rate and audit controls', async () => {
  await db.$executeRawUnsafe('TRUNCATE TABLE "ConnectionAuditEvent", "ConnectionIdempotency", "OutreachPreference", "Connection", "User" CASCADE');
  const sender = await addUser('sender');
  const recipient = await addUser('recipient');
  const intruder = await addUser('intruder');

  const optedOut = await setOutreachPreference(db, {
    actorId: recipient,
    allowConnectionRequests: false,
    suppressionReason: 'user_opt_out',
    expectedVersion: 0,
    idempotencyKey: 'preference-opt-out-1',
  });
  assert.equal(optedOut.status, 200);
  await expectWorkflowError(
    () => createConnectionRequest(db, {
      actorId: sender,
      recipientId: recipient,
      purpose: 'sales_introduction',
      message: 'May we discuss a relevant product?',
      idempotencyKey: 'suppressed-create-1',
    }),
    403,
    'RECIPIENT_SUPPRESSED',
  );

  await setOutreachPreference(db, {
    actorId: recipient,
    allowConnectionRequests: true,
    expectedVersion: 1,
    idempotencyKey: 'preference-opt-in-1',
  });

  const created = await createConnectionRequest(db, {
    actorId: sender,
    recipientId: recipient,
    purpose: 'sales_introduction',
    message: 'May we discuss a relevant product?',
    idempotencyKey: 'create-request-0001',
  });
  assert.equal(created.status, 201);
  const createdConnection = created.body.connection as { id: string; status: string; version: number };
  assert.equal(createdConnection.status, 'pending');
  assert.equal(createdConnection.version, 1);

  const replay = await createConnectionRequest(db, {
    actorId: sender,
    recipientId: recipient,
    purpose: 'sales_introduction',
    message: 'May we discuss a relevant product?',
    idempotencyKey: 'create-request-0001',
  });
  assert.deepEqual(replay, created);
  assert.equal(await db.connection.count(), 1);

  const concurrentSender = await addUser('concurrent-sender');
  const concurrentRecipient = await addUser('concurrent-recipient');
  const concurrentInput = {
    actorId: concurrentSender,
    recipientId: concurrentRecipient,
    idempotencyKey: 'concurrent-create-0001',
  };
  const concurrent = await Promise.all([
    createConnectionRequest(db, concurrentInput),
    createConnectionRequest(db, concurrentInput),
  ]);
  assert.deepEqual(concurrent[0], concurrent[1]);
  assert.equal(await db.connection.count({ where: { userId: concurrentSender } }), 1);

  await expectWorkflowError(
    () => createConnectionRequest(db, {
      actorId: sender,
      recipientId: recipient,
      purpose: 'sales_introduction',
      message: 'Changed payload',
      idempotencyKey: 'create-request-0001',
    }),
    409,
    'IDEMPOTENCY_CONFLICT',
  );
  await expectWorkflowError(
    () => decideConnectionRequest(db, {
      actorId: intruder,
      connectionId: createdConnection.id,
      action: 'accept',
      expectedVersion: 1,
      idempotencyKey: 'intruder-decision-1',
    }),
    403,
    'RECIPIENT_ONLY',
  );

  const accepted = await decideConnectionRequest(db, {
    actorId: recipient,
    connectionId: createdConnection.id,
    action: 'accept',
    expectedVersion: 1,
    idempotencyKey: 'recipient-accept-1',
  });
  assert.equal(accepted.status, 200);
  assert.equal((accepted.body.connection as { status: string }).status, 'accepted');
  assert.equal((accepted.body.connection as { version: number }).version, 2);

  const audit = await verifyConnectionAudit(db, sender, createdConnection.id);
  assert.equal(audit.valid, true);
  assert.deepEqual(audit.events.map((event) => event.eventType), ['REQUEST_CREATED', 'REQUEST_ACCEPTED']);
  await expectWorkflowError(
    () => verifyConnectionAudit(db, intruder, createdConnection.id),
    403,
    'PARTICIPANT_ONLY',
  );

  const auditId = audit.events[0].id as string;
  await assert.rejects(
    () => db.$executeRaw`UPDATE "ConnectionAuditEvent" SET "eventType" = 'TAMPERED' WHERE "id" = ${auditId}`,
    /append-only/,
  );
  await assert.rejects(
    () => db.$executeRaw`DELETE FROM "ConnectionIdempotency" WHERE "actorId" = ${sender}`,
    /append-only/,
  );
  await assert.rejects(
    () => db.$executeRaw`UPDATE "Connection" SET "status" = 'pending', "version" = 3, "respondedAt" = NULL WHERE "id" = ${createdConnection.id}`,
    /illegal connection lifecycle transition/,
  );

  const withdrawalRecipient = await addUser('withdrawal-recipient');
  const withdrawal = await createConnectionRequest(db, {
    actorId: sender,
    recipientId: withdrawalRecipient,
    idempotencyKey: 'create-for-withdrawal-1',
  });
  const withdrawalConnection = withdrawal.body.connection as { id: string };
  const withdrawn = await withdrawConnectionRequest(db, {
    actorId: sender,
    connectionId: withdrawalConnection.id,
    expectedVersion: 1,
    idempotencyKey: 'withdraw-request-0001',
  });
  assert.equal((withdrawn.body.connection as { status: string }).status, 'withdrawn');

  const expiringSender = await addUser('expiring-sender');
  const expiringRecipient = await addUser('expiring-recipient');
  const expiring = await createConnectionRequest(db, {
    actorId: expiringSender,
    recipientId: expiringRecipient,
    idempotencyKey: 'create-expiring-0001',
  });
  const expiringConnection = expiring.body.connection as { id: string; expiresAt: string };
  const expiringId = expiringConnection.id;
  const expired = await decideConnectionRequest(db, {
    actorId: expiringRecipient,
    connectionId: expiringId,
    action: 'accept',
    expectedVersion: 1,
    idempotencyKey: 'expire-decision-0001',
  }, { now: new Date(new Date(expiringConnection.expiresAt).getTime() + 1) });
  assert.equal(expired.status, 409);
  assert.equal(expired.body.code, 'REQUEST_EXPIRED');
  assert.equal((await db.connection.findUniqueOrThrow({ where: { id: expiringId } })).status, 'expired');

  const rateSender = await addUser('rate-sender');
  const rateRecipientOne = await addUser('rate-recipient-one');
  const rateRecipientTwo = await addUser('rate-recipient-two');
  process.env.CONNECTION_RATE_LIMIT = '1';
  try {
    const rateResults = await Promise.allSettled([
      createConnectionRequest(db, {
        actorId: rateSender,
        recipientId: rateRecipientOne,
        idempotencyKey: 'rate-create-first-1',
      }),
      createConnectionRequest(db, {
        actorId: rateSender,
        recipientId: rateRecipientTwo,
        idempotencyKey: 'rate-create-second-1',
      }),
    ]);
    assert.equal(rateResults.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = rateResults.find((result) => result.status === 'rejected');
    assert.ok(rejected?.status === 'rejected');
    assert.ok(rejected.reason instanceof WorkflowError);
    assert.equal(rejected.reason.code, 'RATE_LIMITED');
    assert.equal(await db.connection.count({ where: { userId: rateSender } }), 1);
  } finally {
    delete process.env.CONNECTION_RATE_LIMIT;
  }
});

test.after(async () => {
  await db.$disconnect();
});
