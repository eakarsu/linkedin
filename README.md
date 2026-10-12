# LinkedIn-style professional network

A Next.js/PostgreSQL application with governed connection-request and sales-operations workflows. The sales journey ingests deduplicated CRM leads, enrichment, consent, suppression, and calendar events; enforces ownership and lifecycle transitions; requires independent human review before email outreach; and sends through a leased, retrying transactional outbox. Signed provider opt-outs immediately suppress further outreach.

Every mutation requires source or operation idempotency and expected versions are used for state changes. Lifecycle events are stored in append-only, hash-chained audit logs. Connector credentials are referenced by environment-variable name and never stored in the database.

## Local development

The **AI Operations** header button opens `/ai-operations`. Three examples fill the complete native networking-review prompt; **Generate with OpenRouter** makes one explicit request. Answers and saved reports display as readable sections and tables, including nested structured output. Copy and Download export readable text. The saved-report dialog lets you reuse its input with Edit or close with Cancel; provider evidence is retained and Delete is unavailable. This review does not send connection requests or outreach.

Cancel aborts the provider transport and prevents an unfinished result from entering history. Results committed before cancellation remain visible. The existing NextAuth identity and fresh database-user check still control access.

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

AI Operations also exposes **Résumé builder**, **Job match**, and **Content moderation**. Each has three complete examples, one explicit OpenRouter Generate action, real cancellation, readable reports and exports, and owned retained history with Edit/Cancel. Résumé and match requests use the signed-in account’s actual saved profile and omit password/email/internal account data. Content moderation can link only an unchanged post owned by the requester; editing its content turns it into an unlinked draft. Provider errors, malformed scores, missing receipts, changed source facts, and cancellation prevent successful report persistence. A previously committed report remains retained. Moderation appeals are saved against the actual owned assessment and remain pending; no native moderator authority is configured, so this workspace cannot approve appeals or execute content decisions.
