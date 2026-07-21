# Security

Report vulnerabilities privately to the repository owner. Do not include live credentials, session tokens, personal message content, or production database exports in a report.

## Implemented boundaries

- Authentication refuses to load without a 32+ character `NEXTAUTH_SECRET` outside tests; credential failures do not reveal whether an email exists.
- Public registration is disabled unless explicitly enabled, and enabled registration enforces normalized email and a minimum password policy.
- Connection mutations require an authenticated actor, an idempotency key, role checks, and optimistic versions.
- Recipient suppression and sender rate limits are evaluated inside the create transaction.
- Audit and idempotency records are append-only at the database layer. Audit payloads digest optional messages.
- Production containers run as a non-root user with a read-only root filesystem and no-new-privileges.
- Sales mutations require active workspace membership and role checks; lead transitions use optimistic versions, ownership handoffs are explicit, and outreach approval must come from a different authorized reviewer.
- Current consent, provider suppression, regional policy, per-owner rate limits, and a scheduled send time are enforced transactionally before outreach enters the leased outbox.
- Connector calls require public HTTPS destinations, deny redirects and local/private targets, use bounded timeouts and responses, and load credentials only from referenced environment variables.
- Provider opt-outs require a fresh HMAC signature, are idempotent, immediately create suppression evidence, and cancel work that has not been sent.
- Sales sync, consent, provider, and audit evidence is append-only at the database layer; provider payloads are represented by hashes instead of duplicated personal content.

## Boundaries still requiring deployment controls

TLS termination, network policy, database least-privilege roles, backups, centralized logs, alert routing, session-secret storage/rotation, and regional retention/deletion execution are deployment responsibilities. Real CRM, email/calendar, enrichment, consent, and suppression providers require deployment-specific contracts, tenant credentials, threat/privacy review, and staging evidence. The implemented connector boundary and deterministic database E2E test do not certify any external provider. AI-authored outreach remains outside the governed journey and must not bypass human review.
