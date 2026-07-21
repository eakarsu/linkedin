import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import {
  applyEnrichment,
  handoffLead,
  ingestCrmLead,
  recordConsent,
  recordSuppression,
  SalesWorkflowError,
  transitionLead,
  verifySalesAudit,
} from '../lib/governed-sales';
import { actors, crmLead, resetSalesFixture, salesIds } from './sales-fixture';

const db = new PrismaClient();

before(async () => resetSalesFixture(db));
after(async () => db.$disconnect());

async function expectError(action: () => Promise<unknown>, code: string) {
  await assert.rejects(action, (error: unknown) => {
    assert.ok(error instanceof SalesWorkflowError);
    assert.equal(error.code, code);
    return true;
  });
}

test('connector intake deduplicates, rejects conflicts and stale revisions, and isolates workspaces', async () => {
  const payload = crmLead({ eventId: 'crm-integration-001', externalCrmId: 'CRM-INTEGRATION' });
  const first = await ingestCrmLead(db, actors.operator, payload);
  assert.equal(first.replayed, false);
  const replay = await ingestCrmLead(db, actors.operator, payload);
  assert.equal(replay.replayed, true);
  await expectError(() => ingestCrmLead(db, actors.operator, { ...payload, displayName: 'Different' }), 'SYNC_CONFLICT');
  await expectError(() => ingestCrmLead(db, actors.operator, crmLead({
    eventId: 'crm-integration-stale',
    externalCrmId: 'CRM-INTEGRATION',
    sourceObservedAt: '2020-01-01T00:00:00.000Z',
  })), 'STALE_SYNC');
  await expectError(() => transitionLead(db, actors.outsider, {
    leadId: first.lead?.id,
    state: 'QUALIFIED',
    expectedVersion: 1,
    reason: 'cross-tenant attempt',
  }), 'LEAD_NOT_FOUND');
});

test('enrichment, ownership handoff, consent withdrawal and suppression remain governed', async () => {
  const created = await ingestCrmLead(db, actors.operator, crmLead({ externalCrmId: 'CRM-GOVERNED-2' }));
  const leadId = created.lead!.id;
  const enrichment = {
    leadId,
    eventId: 'enrichment-001',
    sourceSystem: 'licensed-enrichment',
    sourceObservedAt: new Date().toISOString(),
    attributes: { companyVerified: true, employeeBand: '100-250' },
    qualityFlags: ['VERIFIED_COMPANY'],
  };
  assert.equal((await applyEnrichment(db, actors.operator, enrichment)).replayed, false);
  assert.equal((await applyEnrichment(db, actors.operator, enrichment)).replayed, true);
  const current = await db.salesLead.findUniqueOrThrow({ where: { id: leadId } });
  const handedOff = await handoffLead(db, actors.operator, {
    leadId,
    toOwnerId: salesIds.manager,
    expectedVersion: current.version,
    reason: 'Manager specialization is required',
  });
  assert.equal(handedOff.ownerId, salesIds.manager);
  await recordConsent(db, actors.manager, {
    leadId,
    channel: 'EMAIL',
    purpose: 'SALES_OUTREACH',
    state: 'WITHDRAWN',
    lawfulBasis: 'CONSENT',
    sourceSystem: 'consent-center',
    eventId: 'consent-withdrawn-001',
    sourceObservedAt: new Date().toISOString(),
  });
  await recordSuppression(db, actors.manager, {
    leadId,
    channel: 'ALL',
    reason: 'Global opt out',
    sourceSystem: 'suppression-center',
    eventId: 'suppression-001',
    sourceObservedAt: new Date().toISOString(),
  });
  assert.equal(await db.salesSuppression.count({ where: { leadId, active: true } }), 2);
  const audit = await verifySalesAudit(db, actors.manager);
  assert.equal(audit.valid, true);
});
