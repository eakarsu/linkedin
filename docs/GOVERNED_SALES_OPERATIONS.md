# Governed sales operations

## Bounded journey

The implemented journey starts with a licensed CRM source event and ends with conversion or suppression. It covers deduplicated lead intake, enrichment, channel consent, ownership and lifecycle transitions, independent human approval, scheduled email delivery, provider retry/evidence, calendar engagement, conversion metrics, and signed provider opt-out.

It does not send AI-authored content, scrape profiles, infer consent from a connection, or certify a particular external provider. Real provider tenants and regional retention/deletion execution remain deployment responsibilities.

## Roles and lifecycle

Every operation is scoped to an active `SalesMembership`. Operators ingest and manage assigned leads, managers control ownership and observe metrics, and reviewers approve/reject outreach. A reviewer cannot approve their own submission. State changes use expected versions and the explicit lifecycle graph; handoffs are recorded separately from lifecycle changes.

## Source and connector contract

Inbound sources provide a stable source event ID, source-observed timestamp, and typed payload. Exact replay is safe, conflicting reuse is rejected, and stale CRM revisions cannot overwrite newer state. External CRM identities and source event identities are unique inside a workspace.

Outbound records are transactional outbox jobs. Workers lease due jobs with `SKIP LOCKED`, preserve the same idempotency key across retries, capture provider event/message identifiers, and dead-letter permanent or exhausted failures. Connector endpoints must be public HTTPS destinations and credential references resolve only to `SALES_CONNECTOR_TOKEN_*` environment variables.

## Outreach controls

Only email is enabled for the bounded delivery journey. Before submission, the service requires a qualified, owned lead; current `SALES_OUTREACH` email consent; no active email/all-channel suppression; a supported regional policy; a future send time; and room within the submitter's UTC-day limit. Approval must be independent. Signed provider opt-outs immediately create suppression evidence and cancel unsent outreach.

## Evidence and metrics

Source sync, consent, provider, and sales audit evidence is append-only in PostgreSQL. Audit events are SHA-256 hash chained and minimize copied personal content. Dashboard totals, conversions, conversion rate, missing attribution, and dead letters come from persisted records. See [OPERATIONS.md](OPERATIONS.md) for scheduling, signing, alerts, staging acceptance, rollback, and the dependency exception.
