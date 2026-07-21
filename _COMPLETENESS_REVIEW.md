# Completeness Review: linkedin

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 151 project files (119 source files), 1 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Functional but incomplete**

This is a substantive but unfinished sales/customer operations application, not just an empty scaffold. Inspection found 119 source files across `app/`, `components/`, `prisma/`, `lib/` using Next.js, React, Express, Prisma; however, the checked-in workflow and delivery controls do not yet demonstrate a complete, production-operable product.

## Why it is not complete

- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.
- No environment template documents required configuration and secret boundaries.
- No clear deployment/container configuration demonstrates a reproducible production topology.

## Needed features

1. Integrate CRM, email/calendar, enrichment, consent, and suppression sources with bidirectional, deduplicated sync.
2. Implement explicit lead/account lifecycle, ownership, approvals, attribution, and handoff/retry states.
3. Add deliverability, opt-out, regional privacy, rate-limit, and human-review controls for automated outreach.
4. Measure conversion and data quality with representative end-to-end workflow tests rather than generated sample records.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Weak/fallback secret patterns can permit forged sessions or accidental insecure deployments.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- AI-provider availability, cost, privacy, prompt injection, and unvalidated output are launch risks until bounded and evaluated.

## Evidence inspected

- `README.md`
- `SETUP.md:136`
- `start.sh:97`
- `app/layout.tsx`
- `package.json`
- `start.sh`

## Recommended next action

Choose one real sales/customer operations journey, define acceptance criteria and external contracts, then close its persistence, permission, integration, failure, and test gaps before expanding features.

## Implementation progress (2026-07-20)

The five needed features are now closed for two bounded, production-shaped journeys: governed person-to-person connection requests and a governed CRM-lead-to-conversion sales workflow. This supersedes the static-only assessment above for those journeys; broader social-network and AI surfaces retain the launch gates listed below.

### Implemented

- Replaced all three duplicate connection mutation paths with one governed service and disabled the legacy mutation endpoint. The Network, Search, and Profile interfaces now send idempotency keys and decisions include optimistic versions.
- Added recipient opt-in/opt-out suppression, configurable sender rate windows, supported-purpose validation, a 500-character message bound, bidirectional deduplication, a 14-day expiry, recipient-only accept/reject, and sender-only withdrawal.
- Added serializable transactions with bounded conflict retries, actor/operation idempotency records, legal pending-to-terminal transitions, terminal timestamps, and database lifecycle/unique-pair guards.
- Added append-only SHA-256 hash-chained audit events. Database triggers reject evidence update/delete attempts; participants can retrieve a chain-verification result without duplicating message content into the audit payload.
- Removed the default `changeme` database password and the fallback session secret. Authentication now requires a 32+ character secret, uses a 30-minute JWT lifetime, returns non-enumerating credential errors, and public registration is fail-closed with stronger input/password validation.
- Reconciled the checked-in Prisma schema with migration history, preserving job-application ownership through a column rename and legacy experience levels through a copy-before-drop migration. A clean migrated database now has no schema diff.
- Replaced obsolete MUI Grid imports that prevented production compilation, upgraded Next.js to 16.2.10 and Prisma to 6.19.3, replaced deprecated middleware with the proxy convention, and removed tracked generated build artifacts.
- Added an environment contract, explicit migration/runbooks, security boundaries, a readiness endpoint, non-destructive startup scripts, CI, and a non-root/read-only container topology with a separate one-shot migrator.
- Added workspace-scoped CRM, enrichment, consent, suppression, email, and calendar connector contracts with source-event replay, payload-conflict and stale-revision rejection, cross-workspace isolation, HTTPS/private-network protections, referenced secrets, bounded calls, and bidirectional transactional outbox events.
- Added explicit lead lifecycle/version rules, owner validation, controlled ownership handoff, attribution/data-quality flags, separate operator/manager/reviewer permissions, and independent outreach approval. Illegal state skips and unauthorized ownership changes fail closed.
- Added current-purpose consent and provider suppression checks, regional-policy enforcement, per-owner daily limits, future scheduling, independent human review, leased `SKIP LOCKED` delivery, bounded retry/dead-letter state, provider evidence, and signed/idempotent provider opt-outs that cancel unsent work.
- Added conversion and data-quality metrics backed by persistent lead, engagement, provider, and audit evidence instead of generated sample records. Append-only database triggers protect sync, consent, provider, and hash-chained audit records.
- Added focused unit, real-PostgreSQL integration, and real-PostgreSQL end-to-end coverage. The E2E journey exercises CRM intake, invalid transition, consent failure, idempotent outreach, independent approval, transient provider failure/retry, delivery, conversion, calendar engagement, signed opt-out/replay/rejection, metrics, and audit tamper prevention.

### Verification evidence

- Fresh PostgreSQL 17 database: all six migrations applied successfully; a second `prisma migrate deploy` reported no pending migrations.
- `prisma migrate diff --exit-code`: passed with `No difference detected`.
- `npm test`: 7/7 tests across five files passed. Coverage includes the connection controls plus sales source replay/conflict/staleness, workspace isolation, enrichment, ownership handoff, consent withdrawal, suppression, lifecycle rules, connector credential references, and the complete sales journey described above.
- `npm run lint:workflow`: passed for the governed service, routes, health/proxy code, and tests.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed on Next.js 16.2.10; static generation completed 73/73 and the route manifest includes the sales API, worker, and webhook.
- Standalone runtime smoke: `/api/health` returned `200 {"status":"ready"}` against the migrated PostgreSQL database; unauthenticated `/network` returned the expected `307` login redirect.
- `docker compose config --quiet`: passed. A container image build was not run because the local Docker daemon was unavailable.
- `npm run audit:dependencies`: passed for production and all dependencies. Its checked-in policy permits only four npm report entries resolving to the moderate Next.js-bundled PostCSS advisory GHSA-qx2v-qp2m-jg93, which has no supported override; any other advisory or severity increase fails CI. The earlier NextAuth `uuid` issue is remediated by a tested override.
- CI generates ephemeral validation secrets, deploys migrations twice, checks schema drift, runs all tests/type-check/build/workflow lint, validates the dependency exception, and scans repository history with Gitleaks.

### Remaining gaps and blockers

- The broader repository still fails full `npm run lint` with 188 inherited findings (111 errors, 77 warnings) outside the bounded workflow. CI therefore enforces the clean workflow surface plus full TypeScript/build checks, not a misleading project-wide lint pass.
- Real CRM/email/calendar/enrichment/consent/suppression tenant credentials, provider contract tests, production scheduler operation, regional retention/deletion execution, and staging reconciliation remain deployment gates; the deterministic connector E2E does not certify external services.
- Browser-level authenticated end-to-end tests, load/abuse testing, production database least-privilege roles, TLS/network policy, secret-manager integration, backups/restores, centralized observability, MFA/SSO, and alert routing still require deployment-environment evidence.
- Existing AI and non-connection product paths were not promoted by this work and retain the original assessment's provider, privacy, output-validation, and coverage risks.

### Runtime acceptance follow-up (2026-07-20)

- Added an explicit, idempotent administrator-provisioning command for disposable validation and first-instance setup; it stores a bcrypt hash in PostgreSQL and never embeds credentials in the repository.
- Tightened `start.sh` to honor the caller-assigned port exactly, bind only to loopback, reject an occupied port without terminating its owner, derive the local NextAuth URL from that assigned port when one is not supplied, and use Next's webpack development mode so symlinked isolated runtime fixtures remain supported.
- Runtime startup, credential login, session retrieval, and an authenticated API request passed on PostgreSQL `55691`, API `6182`, and UI allocation `6183`. Two earlier fixture-diagnostic failures remain preserved before the final `API_VERIFIED / startup_login_session_api` row in `_runtime_non_suite_repair_shard2o.tsv`.
