-- Governed connection-request workflow. This migration is additive for existing
-- installations and deliberately removes the unsafe password fallback.
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

ALTER TABLE "Connection"
  ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'professional_networking',
  ADD COLUMN "message" TEXT,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '14 days'),
  ADD COLUMN "respondedAt" TIMESTAMP(3),
  ADD COLUMN "withdrawnAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Connection"
  ADD CONSTRAINT "Connection_status_check"
  CHECK ("status" IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  ADD CONSTRAINT "Connection_distinct_participants_check"
  CHECK ("userId" <> "connectedId"),
  ADD CONSTRAINT "Connection_version_check" CHECK ("version" > 0),
  ADD CONSTRAINT "Connection_message_length_check"
  CHECK ("message" IS NULL OR char_length("message") <= 500);

CREATE INDEX "Connection_userId_createdAt_idx" ON "Connection"("userId", "createdAt");
CREATE INDEX "Connection_connectedId_status_idx" ON "Connection"("connectedId", "status");

CREATE TABLE "OutreachPreference" (
  "userId" TEXT NOT NULL,
  "allowConnectionRequests" BOOLEAN NOT NULL DEFAULT true,
  "suppressionReason" TEXT,
  "suppressedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OutreachPreference_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "OutreachPreference_version_check" CHECK ("version" > 0),
  CONSTRAINT "OutreachPreference_suppression_check" CHECK (
    ("allowConnectionRequests" = true AND "suppressedAt" IS NULL)
    OR ("allowConnectionRequests" = false AND "suppressedAt" IS NOT NULL AND "suppressionReason" IS NOT NULL)
  )
);

CREATE TABLE "ConnectionIdempotency" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "responseStatus" INTEGER NOT NULL,
  "responseBody" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConnectionIdempotency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConnectionIdempotency_actorId_operation_key_key"
  ON "ConnectionIdempotency"("actorId", "operation", "key");
CREATE INDEX "ConnectionIdempotency_createdAt_idx" ON "ConnectionIdempotency"("createdAt");

CREATE TABLE "ConnectionAuditEvent" (
  "id" TEXT NOT NULL,
  "connectionId" TEXT,
  "subjectUserId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "previousHash" TEXT,
  "eventHash" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConnectionAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConnectionAuditEvent_eventHash_key" ON "ConnectionAuditEvent"("eventHash");
CREATE INDEX "ConnectionAuditEvent_connectionId_occurredAt_idx"
  ON "ConnectionAuditEvent"("connectionId", "occurredAt");
CREATE INDEX "ConnectionAuditEvent_subjectUserId_occurredAt_idx"
  ON "ConnectionAuditEvent"("subjectUserId", "occurredAt");

ALTER TABLE "OutreachPreference"
  ADD CONSTRAINT "OutreachPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectionIdempotency"
  ADD CONSTRAINT "ConnectionIdempotency_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConnectionAuditEvent"
  ADD CONSTRAINT "ConnectionAuditEvent_connectionId_fkey"
  FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConnectionAuditEvent"
  ADD CONSTRAINT "ConnectionAuditEvent_subjectUserId_fkey"
  FOREIGN KEY ("subjectUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ConnectionAuditEvent"
  ADD CONSTRAINT "ConnectionAuditEvent_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Audit/idempotency evidence is append-only, even for application roles with
-- ordinary table write permission.
CREATE FUNCTION reject_connection_evidence_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ConnectionAuditEvent_append_only"
  BEFORE UPDATE OR DELETE ON "ConnectionAuditEvent"
  FOR EACH ROW EXECUTE FUNCTION reject_connection_evidence_mutation();
CREATE TRIGGER "ConnectionIdempotency_append_only"
  BEFORE UPDATE OR DELETE ON "ConnectionIdempotency"
  FOR EACH ROW EXECUTE FUNCTION reject_connection_evidence_mutation();
