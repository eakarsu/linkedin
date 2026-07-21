# LinkedIn-style professional network

A Next.js/PostgreSQL application with governed connection-request and sales-operations workflows. The sales journey ingests deduplicated CRM leads, enrichment, consent, suppression, and calendar events; enforces ownership and lifecycle transitions; requires independent human review before email outreach; and sends through a leased, retrying transactional outbox. Signed provider opt-outs immediately suppress further outreach.

Every mutation requires source or operation idempotency and expected versions are used for state changes. Lifecycle events are stored in append-only, hash-chained audit logs. Connector credentials are referenced by environment-variable name and never stored in the database.

## Local development

Requirements: Node.js 24, npm, and PostgreSQL 17.

```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Set a real `DATABASE_URL` and generate `NEXTAUTH_SECRET` with `openssl rand -base64 48`. Public registration remains disabled unless `ALLOW_PUBLIC_REGISTRATION=true` is an intentional deployment choice. Startup never seeds, migrates, installs packages, deletes caches, or kills unrelated processes.

## Verification

With `DATABASE_URL` pointing at a disposable migrated test database:

```bash
npm test
npx tsc --noEmit
npm run build
npm run audit:dependencies
```

CI provisions a fresh PostgreSQL service, applies migrations twice to prove repeatability, runs the connection and sales lifecycle/failure-path tests, type-checks, builds, and applies the checked-in dependency advisory policy. Run a trusted scheduler against `POST /api/internal/sales-worker`; see the operations runbook for its authentication and retry contract.

## Documentation

- [Workflow and API contract](docs/GOVERNED_CONNECTION_REQUESTS.md)
- [Governed sales operations contract](docs/GOVERNED_SALES_OPERATIONS.md)
- [Operations and deployment](docs/OPERATIONS.md)
- [Security policy and boundaries](SECURITY.md)
- [Original completeness assessment and dated implementation evidence](_COMPLETENESS_REVIEW.md)
