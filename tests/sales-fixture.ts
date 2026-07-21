import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';

export const salesIds = {
  workspace: '91000000-0000-4000-8000-000000000001',
  otherWorkspace: '91000000-0000-4000-8000-000000000002',
  operator: '92000000-0000-4000-8000-000000000001',
  reviewer: '92000000-0000-4000-8000-000000000002',
  manager: '92000000-0000-4000-8000-000000000003',
  outsider: '92000000-0000-4000-8000-000000000004',
};

export async function resetSalesFixture(db: PrismaClient) {
  await db.$executeRawUnsafe(`TRUNCATE TABLE
    "SalesAuditEvent", "SalesProviderEvent", "SalesOutbox", "SalesOutreach",
    "SalesEngagement", "SalesSuppression", "SalesConsentEvent", "SalesSyncEvent",
    "SalesLead", "SalesConnector", "SalesMembership", "SalesWorkspace", "User"
    RESTART IDENTITY CASCADE`);
  for (const [label, id] of Object.entries({
    operator: salesIds.operator,
    reviewer: salesIds.reviewer,
    manager: salesIds.manager,
    outsider: salesIds.outsider,
  })) {
    await db.user.create({
      data: {
        id,
        name: label,
        email: `${label}-${randomUUID()}@example.test`,
        password: 'not-used-by-sales-tests',
      },
    });
  }
  await db.salesWorkspace.createMany({
    data: [
      { id: salesIds.workspace, slug: 'governed-sales', name: 'Governed Sales' },
      { id: salesIds.otherWorkspace, slug: 'other-sales', name: 'Other Sales' },
    ],
  });
  await db.salesMembership.createMany({
    data: [
      { workspaceId: salesIds.workspace, userId: salesIds.operator, role: 'OPERATOR' },
      { workspaceId: salesIds.workspace, userId: salesIds.reviewer, role: 'REVIEWER' },
      { workspaceId: salesIds.workspace, userId: salesIds.manager, role: 'MANAGER' },
      { workspaceId: salesIds.otherWorkspace, userId: salesIds.outsider, role: 'MANAGER' },
    ],
  });
  await db.salesConnector.createMany({
    data: [
      { workspaceId: salesIds.workspace, kind: 'CRM', provider: 'crm-test', endpoint: 'https://crm.example.test/events', credentialReference: 'crm_test', sourceContractReference: 'contract://crm/v1' },
      { workspaceId: salesIds.workspace, kind: 'EMAIL', provider: 'mail-test', endpoint: 'https://mail.example.test/events', credentialReference: 'mail_test', sourceContractReference: 'contract://mail/v1' },
      { workspaceId: salesIds.workspace, kind: 'ENRICHMENT', provider: 'enrich-test', endpoint: 'https://enrich.example.test/events', credentialReference: 'enrich_test', sourceContractReference: 'contract://enrichment/v1' },
    ],
  });
}

export function crmLead(overrides: Record<string, unknown> = {}) {
  return {
    eventId: randomUUID(),
    externalCrmId: `CRM-${randomUUID()}`,
    displayName: 'Ada Lovelace',
    contactReference: `vault://contacts/${randomUUID()}`,
    region: 'EU',
    sourceSystem: 'licensed-crm',
    sourceRevision: 'revision-1',
    sourceObservedAt: new Date().toISOString(),
    ownerId: salesIds.operator,
    attribution: { source: 'conference', campaign: 'governed-launch' },
    ...overrides,
  };
}

export const actors = {
  operator: { userId: salesIds.operator, workspaceId: salesIds.workspace },
  reviewer: { userId: salesIds.reviewer, workspaceId: salesIds.workspace },
  manager: { userId: salesIds.manager, workspaceId: salesIds.workspace },
  outsider: { userId: salesIds.outsider, workspaceId: salesIds.otherWorkspace },
};
