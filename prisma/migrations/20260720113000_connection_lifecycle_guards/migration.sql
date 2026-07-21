-- Reject reversed duplicates and illegal lifecycle edits even when a future
-- application path bypasses the governed service.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Connection"
    GROUP BY LEAST("userId", "connectedId"), GREATEST("userId", "connectedId")
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'reversed duplicate connections must be resolved before migration';
  END IF;
END;
$$;

CREATE UNIQUE INDEX "Connection_participant_pair_key"
  ON "Connection" (LEAST("userId", "connectedId"), GREATEST("userId", "connectedId"));

UPDATE "Connection"
SET "respondedAt" = COALESCE("respondedAt", "createdAt")
WHERE "status" IN ('accepted', 'rejected', 'expired');
UPDATE "Connection"
SET "withdrawnAt" = COALESCE("withdrawnAt", "createdAt")
WHERE "status" = 'withdrawn';

ALTER TABLE "Connection"
  ADD CONSTRAINT "Connection_terminal_timestamp_check" CHECK (
    ("status" = 'pending' AND "respondedAt" IS NULL AND "withdrawnAt" IS NULL)
    OR ("status" IN ('accepted', 'rejected', 'expired') AND "respondedAt" IS NOT NULL AND "withdrawnAt" IS NULL)
    OR ("status" = 'withdrawn' AND "withdrawnAt" IS NOT NULL AND "respondedAt" IS NULL)
  );

CREATE FUNCTION enforce_connection_lifecycle() RETURNS trigger AS $$
BEGIN
  IF NEW."userId" <> OLD."userId"
    OR NEW."connectedId" <> OLD."connectedId"
    OR NEW."purpose" <> OLD."purpose"
    OR NEW."message" IS DISTINCT FROM OLD."message"
    OR NEW."expiresAt" <> OLD."expiresAt"
    OR NEW."createdAt" <> OLD."createdAt" THEN
    RAISE EXCEPTION 'connection request identity and content are immutable' USING ERRCODE = '55000';
  END IF;

  IF NEW."status" <> OLD."status" THEN
    IF OLD."status" <> 'pending'
      OR NEW."status" NOT IN ('accepted', 'rejected', 'withdrawn', 'expired') THEN
      RAISE EXCEPTION 'illegal connection lifecycle transition: % -> %', OLD."status", NEW."status"
        USING ERRCODE = '55000';
    END IF;
    IF NEW."version" <> OLD."version" + 1 THEN
      RAISE EXCEPTION 'connection transition must increment version exactly once' USING ERRCODE = '55000';
    END IF;
  ELSIF NEW."version" <> OLD."version" THEN
    RAISE EXCEPTION 'connection version cannot change without a state transition' USING ERRCODE = '55000';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Connection_lifecycle_guard"
  BEFORE UPDATE ON "Connection"
  FOR EACH ROW EXECUTE FUNCTION enforce_connection_lifecycle();
