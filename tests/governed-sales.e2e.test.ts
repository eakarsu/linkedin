import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { after, before, test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import {
  ingestCrmLead,
  processSalesOutbox,
  recordCalendarEngagement,
  recordConsent,
  requestOutreach,
  reviewOutreach,
  salesDashboard,
  SalesWorkflowError,
  transitionLead,
  verifySalesAudit,
} from '../lib/governed-sales';
import { POST as salesWebhook } from '../app/api/sales-ops/webhooks/[provider]/route';
import appPrisma from '../lib/prisma';
import { actors, crmLead, resetSalesFixture, salesIds } from './sales-fixture';

const db = new PrismaClient();

before(async () => resetSalesFixture(db));
after(async () => {
  await db.$disconnect();
  await appPrisma.$disconnect();
});

test('CRM lead completes reviewed outreach, retry, calendar, conversion, opt-out and metrics end to end', async () => {
  const created = await ingestCrmLead(db, actors.operator, crmLead({
    eventId: 'crm-e2e-001',
    externalCrmId: 'CRM-E2E-001',
  }));
  const leadId = created.lead!.id;
  await assert.rejects(() => transitionLead(db, actors.operator, {
    leadId,
    state: 'CONVERTED',
    expectedVersion: 1,
    reason: 'unsafe skip',
  }), (error: unknown) => error instanceof SalesWorkflowError && error.code === 'INVALID_LIFECYCLE_TRANSITION');
  const qualified = await transitionLead(db, actors.operator, {
    leadId,
    state: 'QUALIFIED',
    expectedVersion: 1,
    reason: 'Identity and need verified',
  });
  await assert.rejects(() => requestOutreach(db, actors.operator, {
    leadId,
    channel: 'EMAIL',
    templateId: 'reviewed-template-v1',
    campaignId: 'governed-campaign',
    idempotencyKey: 'outreach-before-consent-001',
    scheduledAt: new Date(Date.now() + 60_000).toISOString(),
    expectedVersion: qualified.version,
  }), (error: unknown) => error instanceof SalesWorkflowError && error.code === 'CONSENT_REQUIRED');
  await recordConsent(db, actors.operator, {
    leadId,
    channel: 'EMAIL',
    purpose: 'SALES_OUTREACH',
    state: 'GRANTED',
    lawfulBasis: 'CONSENT',
    sourceSystem: 'consent-center',
    eventId: 'consent-e2e-001',
    sourceObservedAt: new Date().toISOString(),
  });
  const scheduledAt = new Date(Date.now() + 60_000).toISOString();
  const submitted = await requestOutreach(db, actors.operator, {
    leadId,
    channel: 'EMAIL',
    templateId: 'reviewed-template-v1',
    campaignId: 'governed-campaign',
    idempotencyKey: 'outreach-e2e-001',
    scheduledAt,
    expectedVersion: qualified.version,
  });
  const replay = await requestOutreach(db, actors.operator, {
    leadId,
    channel: 'EMAIL',
    templateId: 'reviewed-template-v1',
    campaignId: 'governed-campaign',
    idempotencyKey: 'outreach-e2e-001',
    scheduledAt,
    expectedVersion: qualified.version,
  });
  assert.equal(replay.replayed, true);
  const approved = await reviewOutreach(db, actors.reviewer, {
    outreachId: submitted.outreach.id,
    decision: 'APPROVE',
    notes: 'Consent, region, purpose and content verified',
  });
  assert.equal(approved.state, 'QUEUED');

  let emailAttempts = 0;
  const adapter = {
    async deliver(input: { connectorKind: string; idempotencyKey: string }) {
      if (input.connectorKind === 'EMAIL') {
        emailAttempts += 1;
        if (emailAttempts === 1) throw Object.assign(new Error('temporary provider outage'), { retryable: true });
      }
      return {
        provider: `${input.connectorKind.toLowerCase()}-test`,
        providerEventId: `${input.idempotencyKey}:${emailAttempts}`,
        providerMessageId: input.connectorKind === 'EMAIL' ? 'message-e2e-001' : undefined,
      };
    },
  };
  const queuedKinds = (await db.salesOutbox.findMany({ select: { connectorKind: true } }))
    .map((job) => job.connectorKind);
  assert.ok(queuedKinds.includes('EMAIL'));
  await db.salesOutbox.updateMany({
    where: { state: 'QUEUED' },
    data: { nextAttemptAt: new Date(0) },
  });
  let sawRetry = false;
  for (let index = 0; index < 6; index += 1) {
    const processed = await processSalesOutbox(db, 'e2e-worker', adapter);
    if (!processed) break;
    if (processed.state === 'RETRY') {
      sawRetry = true;
      break;
    }
  }
  assert.equal(sawRetry, true);
  await db.salesOutbox.updateMany({ where: { state: 'RETRY' }, data: { nextAttemptAt: new Date(0) } });
  const retryJobs = await db.salesOutbox.findMany({ where: { state: 'RETRY' } });
  assert.equal(retryJobs.length, 1);
  assert.equal(retryJobs[0].leaseExpiresAt, null);
  const resumed = await processSalesOutbox(db, 'e2e-worker', adapter);
  assert.equal(resumed?.state, 'SUCCEEDED');
  const contacted = await db.salesLead.findUniqueOrThrow({ where: { id: leadId } });
  assert.equal(contacted.lifecycleState, 'CONTACTED');
  const converted = await transitionLead(db, actors.operator, {
    leadId,
    state: 'CONVERTED',
    expectedVersion: contacted.version,
    reason: 'Signed agreement recorded in the licensed CRM',
  });
  assert.equal(converted.lifecycleState, 'CONVERTED');
  await recordCalendarEngagement(db, actors.operator, {
    leadId,
    eventId: 'calendar-e2e-001',
    externalEventId: 'meeting-e2e-001',
    state: 'COMPLETED',
    startsAt: new Date(Date.now() - 60_000).toISOString(),
    sourceSystem: 'licensed-calendar',
    sourceObservedAt: new Date().toISOString(),
  });
  const webhookBody = JSON.stringify({
    type: 'CONTACT_OPTED_OUT',
    eventId: 'opt-out-e2e-001',
    leadId,
    channel: 'EMAIL',
    occurredAt: new Date().toISOString(),
  });
  const webhookTimestamp = String(Math.floor(Date.now() / 1000));
  process.env.SALES_WEBHOOK_SECRET_MAIL_TEST = 'sales-webhook-test-secret-0123456789abcdef';
  const signature = createHmac('sha256', process.env.SALES_WEBHOOK_SECRET_MAIL_TEST)
    .update(`${webhookTimestamp}.${webhookBody}`).digest('hex');
  const sendWebhook = () => salesWebhook(new Request('http://localhost/api/sales-ops/webhooks/mail-test', {
    method: 'POST',
    headers: {
      'X-Sales-Timestamp': webhookTimestamp,
      'X-Sales-Signature': signature,
      'X-Sales-Workspace': salesIds.workspace,
    },
    body: webhookBody,
  }), { params: Promise.resolve({ provider: 'mail-test' }) });
  assert.deepEqual(await (await sendWebhook()).json(), { replayed: false });
  assert.deepEqual(await (await sendWebhook()).json(), { replayed: true });
  const unsigned = await salesWebhook(new Request('http://localhost/api/sales-ops/webhooks/mail-test', {
    method: 'POST',
    headers: { 'X-Sales-Timestamp': webhookTimestamp, 'X-Sales-Workspace': salesIds.workspace },
    body: webhookBody,
  }), { params: Promise.resolve({ provider: 'mail-test' }) });
  assert.equal(unsigned.status, 401);
  delete process.env.SALES_WEBHOOK_SECRET_MAIL_TEST;
  const dashboard = await salesDashboard(db, actors.manager);
  assert.deepEqual(dashboard, { total: 1, converted: 1, conversionRate: 1, missingAttribution: 0, deadLetters: 0 });
  const audit = await verifySalesAudit(db, actors.manager);
  assert.equal(audit.valid, true);
  assert.ok(audit.eventCount >= 9);
  await assert.rejects(
    () => db.$executeRaw`UPDATE "SalesAuditEvent" SET "action" = 'TAMPERED' WHERE "workspaceId" = ${salesIds.workspace}`,
    /append-only/,
  );
});
