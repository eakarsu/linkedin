# Operations

## Release

1. Run CI against a fresh PostgreSQL 17 database.
2. Back up the production database and record the restore point.
3. Build the immutable application and migrator images from the same revision.
4. Run the migrator as a one-shot job: `npx prisma migrate deploy`.
5. Start the non-root, read-only application container.
6. Require `GET /api/health` to return `200 {"status":"ready"}` before traffic.
7. Exercise create/accept and suppression failure paths with non-production test accounts.

Application startup never runs migrations or seed data. The Compose topology makes the migration job explicit and starts the web service only after it succeeds.

## Configuration and secrets

`DATABASE_URL`, `NEXTAUTH_URL`, and a random 32+ character `NEXTAUTH_SECRET` are required. Keep secrets in the deployment secret manager, not image layers or repository files. Rotate the auth secret through a planned session-invalidating release. Public registration is fail-closed.

Connection control defaults are 20 sends per 24 hours and a 14-day request lifetime. Sales outreach defaults to 20 sends per owner per UTC day. Changing these values is a risk decision; record owner, reason, and effective time.

Configure one `SalesConnector` row for each enabled CRM, email, calendar, enrichment, consent, or suppression provider. Store only an environment reference such as `mail-primary` in `credentialReference`, then provide its token as `SALES_CONNECTOR_TOKEN_MAIL_PRIMARY`. Provider endpoints must use public HTTPS addresses; redirects, private/resolved-local targets, oversized responses, and missing provider event identifiers are rejected.

## Sales worker and provider events

Call `POST /api/internal/sales-worker` from a trusted scheduler with `Authorization: Bearer $SALES_WORKER_TOKEN`. Each call leases and processes at most one due outbox item. Schedule calls frequently enough for the required delivery latency and run multiple invocations for backlog drain. Transient failures use bounded exponential retry; permanent failures and exhausted retries become `DEAD_LETTER` and require an operator to correct the connector or payload before a deliberate replay procedure is added.

Inbound opt-outs use `POST /api/sales-ops/webhooks/{provider}` with `X-Sales-Workspace`, `X-Sales-Timestamp`, and `X-Sales-Signature`. The signature is lowercase hex HMAC-SHA256 over `{unixTimestamp}.{rawBody}` using `SALES_WEBHOOK_SECRET_{PROVIDER}`. Events older than five minutes, duplicate identities, invalid signatures, and bodies over the route limit are rejected or safely replayed. Register only provider slugs whose signing secrets are present.

At release time, exercise CRM ingestion, consent, independent approval, one forced provider retry, successful delivery, calendar ingestion, conversion, and signed opt-out using non-production provider tenants. The repository E2E test uses a real PostgreSQL database and deterministic connector double; production credentials and external-provider availability remain deployment gates.

## Monitoring

Alert on readiness failures, HTTP 5xx rate, `RATE_LIMITED`, `RECIPIENT_SUPPRESSED`, `CONSENT_REQUIRED`, `SUPPRESSED`, `VERSION_CONFLICT`, `IDEMPOTENCY_CONFLICT`, outbox retry age, and `DEAD_LETTER` count. Periodically verify both audit chains. Treat any database error containing `append-only` outside a security test as suspicious.

Application logs must not include passwords, session tokens, database URLs, or connection-message bodies. The current workflow logs generic server context and structured public error codes only.

## Rollback and recovery

Migrations are forward-only. If application code must roll back, first confirm the older version tolerates additive columns/tables. Do not delete audit/idempotency evidence. For a damaging data/schema incident, stop writes, retain logs, restore the pre-migration backup into a separate database, validate counts and audit chains, then switch traffic through the normal change process.

## Known dependency finding

As of 2026-07-20, npm reports four entries that all resolve to GHSA-qx2v-qp2m-jg93 in the PostCSS copy bundled by Next.js, for which npm reports no supported override or upstream fix. `scripts/audit-dependencies.mjs` fails on every other advisory and on any severity increase, for production and all dependencies. The previous NextAuth `uuid` finding is remediated with a tested package override. Remove the narrow PostCSS exception when an upstream release is available.
