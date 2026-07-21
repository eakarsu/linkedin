-- CreateTable
CREATE TABLE "SalesWorkspace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesMembership" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "authVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesMembership_pkey" PRIMARY KEY ("workspaceId","userId")
);

-- CreateTable
CREATE TABLE "SalesConnector" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "credentialReference" TEXT NOT NULL,
    "sourceContractReference" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesLead" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "externalCrmId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "contactReference" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lifecycleState" TEXT NOT NULL DEFAULT 'NEW',
    "ownerId" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "sourceRevision" TEXT NOT NULL,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "attribution" JSONB NOT NULL DEFAULT '{}',
    "qualityFlags" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesSyncEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "connectorKind" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "payloadSha256" TEXT NOT NULL,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesSyncEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesConsentEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lawfulBasis" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesConsentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesSuppression" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOutreach" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "failureCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOutbox" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "connectorKind" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseOwner" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesProviderEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadSha256" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesProviderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesEngagement" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceObservedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesAuditEvent" (
    "sequence" BIGSERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "leadId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "previousHash" TEXT NOT NULL,
    "eventHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesAuditEvent_pkey" PRIMARY KEY ("sequence")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesWorkspace_slug_key" ON "SalesWorkspace"("slug");

-- CreateIndex
CREATE INDEX "SalesMembership_userId_active_idx" ON "SalesMembership"("userId", "active");

-- CreateIndex
CREATE INDEX "SalesConnector_workspaceId_kind_enabled_idx" ON "SalesConnector"("workspaceId", "kind", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "SalesConnector_workspaceId_kind_provider_key" ON "SalesConnector"("workspaceId", "kind", "provider");

-- CreateIndex
CREATE INDEX "SalesLead_workspaceId_lifecycleState_updatedAt_idx" ON "SalesLead"("workspaceId", "lifecycleState", "updatedAt");

-- CreateIndex
CREATE INDEX "SalesLead_workspaceId_contactReference_idx" ON "SalesLead"("workspaceId", "contactReference");

-- CreateIndex
CREATE UNIQUE INDEX "SalesLead_workspaceId_externalCrmId_key" ON "SalesLead"("workspaceId", "externalCrmId");

-- CreateIndex
CREATE INDEX "SalesSyncEvent_workspaceId_connectorKind_createdAt_idx" ON "SalesSyncEvent"("workspaceId", "connectorKind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSyncEvent_workspaceId_connectorKind_direction_sourceEv_key" ON "SalesSyncEvent"("workspaceId", "connectorKind", "direction", "sourceEventId");

-- CreateIndex
CREATE INDEX "SalesConsentEvent_leadId_channel_purpose_sourceObservedAt_idx" ON "SalesConsentEvent"("leadId", "channel", "purpose", "sourceObservedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesConsentEvent_sourceSystem_sourceEventId_key" ON "SalesConsentEvent"("sourceSystem", "sourceEventId");

-- CreateIndex
CREATE INDEX "SalesSuppression_leadId_channel_active_idx" ON "SalesSuppression"("leadId", "channel", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SalesSuppression_sourceSystem_sourceEventId_key" ON "SalesSuppression"("sourceSystem", "sourceEventId");

-- CreateIndex
CREATE INDEX "SalesOutreach_leadId_createdAt_idx" ON "SalesOutreach"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesOutreach_workspaceId_state_scheduledAt_idx" ON "SalesOutreach"("workspaceId", "state", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOutreach_workspaceId_idempotencyKey_key" ON "SalesOutreach"("workspaceId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "SalesOutbox_state_nextAttemptAt_idx" ON "SalesOutbox"("state", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOutbox_workspaceId_connectorKind_idempotencyKey_key" ON "SalesOutbox"("workspaceId", "connectorKind", "idempotencyKey");

-- CreateIndex
CREATE INDEX "SalesProviderEvent_workspaceId_createdAt_idx" ON "SalesProviderEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesProviderEvent_workspaceId_provider_providerEventId_key" ON "SalesProviderEvent"("workspaceId", "provider", "providerEventId");

-- CreateIndex
CREATE INDEX "SalesEngagement_leadId_startsAt_idx" ON "SalesEngagement"("leadId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesEngagement_sourceSystem_externalEventId_key" ON "SalesEngagement"("sourceSystem", "externalEventId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesAuditEvent_id_key" ON "SalesAuditEvent"("id");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_workspaceId_sequence_idx" ON "SalesAuditEvent"("workspaceId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "SalesAuditEvent_workspaceId_eventHash_key" ON "SalesAuditEvent"("workspaceId", "eventHash");

-- AddForeignKey
ALTER TABLE "SalesMembership" ADD CONSTRAINT "SalesMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesMembership" ADD CONSTRAINT "SalesMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesConnector" ADD CONSTRAINT "SalesConnector_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSyncEvent" ADD CONSTRAINT "SalesSyncEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesConsentEvent" ADD CONSTRAINT "SalesConsentEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SalesLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSuppression" ADD CONSTRAINT "SalesSuppression_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SalesLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SalesLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutbox" ADD CONSTRAINT "SalesOutbox_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesProviderEvent" ADD CONSTRAINT "SalesProviderEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesEngagement" ADD CONSTRAINT "SalesEngagement_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SalesLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesAuditEvent" ADD CONSTRAINT "SalesAuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "SalesWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesAuditEvent" ADD CONSTRAINT "SalesAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesAuditEvent" ADD CONSTRAINT "SalesAuditEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "SalesLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain constraints remain database-enforced even if a future application
-- path bypasses the governed service.
ALTER TABLE "SalesMembership" ADD CONSTRAINT "SalesMembership_role_check"
  CHECK ("role" IN ('OPERATOR', 'REVIEWER', 'MANAGER', 'AUDITOR'));
ALTER TABLE "SalesMembership" ADD CONSTRAINT "SalesMembership_authVersion_check" CHECK ("authVersion" > 0);
ALTER TABLE "SalesConnector" ADD CONSTRAINT "SalesConnector_kind_check"
  CHECK ("kind" IN ('CRM', 'EMAIL', 'CALENDAR', 'ENRICHMENT', 'CONSENT', 'SUPPRESSION'));
ALTER TABLE "SalesConnector" ADD CONSTRAINT "SalesConnector_endpoint_check" CHECK ("endpoint" ~ '^https://');
ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_region_check" CHECK ("region" IN ('US', 'CA', 'EU', 'UK'));
ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_lifecycle_check"
  CHECK ("lifecycleState" IN ('NEW', 'QUALIFIED', 'OUTREACH_PENDING', 'OUTREACH_APPROVED', 'CONTACTED', 'CONVERTED', 'DISQUALIFIED', 'HANDED_OFF', 'EXCEPTION'));
ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_version_check" CHECK ("version" > 0);
ALTER TABLE "SalesSyncEvent" ADD CONSTRAINT "SalesSyncEvent_kind_check"
  CHECK ("connectorKind" IN ('CRM', 'EMAIL', 'CALENDAR', 'ENRICHMENT', 'CONSENT', 'SUPPRESSION'));
ALTER TABLE "SalesSyncEvent" ADD CONSTRAINT "SalesSyncEvent_direction_check" CHECK ("direction" IN ('INBOUND', 'OUTBOUND'));
ALTER TABLE "SalesSyncEvent" ADD CONSTRAINT "SalesSyncEvent_state_check" CHECK ("state" IN ('APPLIED', 'QUEUED', 'STALE', 'CONFLICT'));
ALTER TABLE "SalesSyncEvent" ADD CONSTRAINT "SalesSyncEvent_hash_check" CHECK ("payloadSha256" ~ '^[0-9a-f]{64}$');
ALTER TABLE "SalesConsentEvent" ADD CONSTRAINT "SalesConsentEvent_channel_check" CHECK ("channel" IN ('EMAIL', 'SMS', 'PHONE'));
ALTER TABLE "SalesConsentEvent" ADD CONSTRAINT "SalesConsentEvent_state_check" CHECK ("state" IN ('GRANTED', 'WITHDRAWN'));
ALTER TABLE "SalesSuppression" ADD CONSTRAINT "SalesSuppression_channel_check" CHECK ("channel" IN ('EMAIL', 'SMS', 'PHONE', 'ALL'));
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_channel_check" CHECK ("channel" IN ('EMAIL', 'SMS', 'PHONE'));
ALTER TABLE "SalesOutreach" ADD CONSTRAINT "SalesOutreach_state_check"
  CHECK ("state" IN ('REVIEW_REQUIRED', 'APPROVED', 'QUEUED', 'SENT', 'SUPPRESSED', 'FAILED', 'CANCELLED'));
ALTER TABLE "SalesOutbox" ADD CONSTRAINT "SalesOutbox_state_check"
  CHECK ("state" IN ('QUEUED', 'PROCESSING', 'RETRY', 'SUCCEEDED', 'DEAD_LETTER'));
ALTER TABLE "SalesProviderEvent" ADD CONSTRAINT "SalesProviderEvent_hash_check" CHECK ("payloadSha256" ~ '^[0-9a-f]{64}$');
ALTER TABLE "SalesEngagement" ADD CONSTRAINT "SalesEngagement_state_check" CHECK ("state" IN ('BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'));
ALTER TABLE "SalesAuditEvent" ADD CONSTRAINT "SalesAuditEvent_hashes_check"
  CHECK ("previousHash" ~ '^[0-9a-f]{64}$' AND "eventHash" ~ '^[0-9a-f]{64}$');

CREATE FUNCTION reject_sales_evidence_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "SalesAuditEvent_append_only"
  BEFORE UPDATE OR DELETE ON "SalesAuditEvent"
  FOR EACH ROW EXECUTE FUNCTION reject_sales_evidence_mutation();
CREATE TRIGGER "SalesSyncEvent_append_only"
  BEFORE UPDATE OR DELETE ON "SalesSyncEvent"
  FOR EACH ROW EXECUTE FUNCTION reject_sales_evidence_mutation();
CREATE TRIGGER "SalesConsentEvent_append_only"
  BEFORE UPDATE OR DELETE ON "SalesConsentEvent"
  FOR EACH ROW EXECUTE FUNCTION reject_sales_evidence_mutation();
CREATE TRIGGER "SalesProviderEvent_append_only"
  BEFORE UPDATE OR DELETE ON "SalesProviderEvent"
  FOR EACH ROW EXECUTE FUNCTION reject_sales_evidence_mutation();
