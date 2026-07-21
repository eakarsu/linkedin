# Governed connection requests

## Scope and acceptance contract

This workflow covers one real customer/sales operation: a person-to-person professional introduction. It is independent from the separately governed CRM-lead-to-conversion journey in [GOVERNED_SALES_OPERATIONS.md](GOVERNED_SALES_OPERATIONS.md); its authorization or consent does not confer permission to send sales outreach.

The workflow is accepted when:

1. A signed-in sender can create one purpose-labelled request for another existing user.
2. Recipient opt-out is checked transactionally before persistence.
3. A configurable sender window limit rejects excess requests.
4. Repeated delivery with the same `Idempotency-Key` returns the original response; a changed body with the same key is rejected.
5. Only the recipient can accept/reject and only the sender can withdraw a pending request.
6. Mutations using a stale `expectedVersion` fail without changing state.
7. Expired requests cannot be accepted and transition to `expired` when a decision is attempted.
8. Every completed state change has a verifiable, append-only, hash-chained audit event.

## Lifecycle

`pending` can transition exactly once to `accepted`, `rejected`, `withdrawn`, or `expired`. Accepted, rejected, withdrawn, and expired are terminal in this implementation. A bidirectional participant lookup prevents duplicate/reversed connection rows.

Supported purposes are `professional_networking`, `sales_introduction`, `recruiting`, and `partnership`. Optional messages are limited to 500 characters; audit events store a message digest rather than copying message content.

## HTTP contract

All mutating routes require an authenticated session, JSON, and an `Idempotency-Key` header of 8-128 URL-safe characters.

| Route | Actor | Contract |
| --- | --- | --- |
| `POST /api/connections/send` | sender | `{ recipientId, purpose?, message? }` |
| `PUT /api/connections/requests/:id` | recipient | `{ action: "accept" | "reject", expectedVersion }` |
| `POST /api/connections/requests/:id/withdraw` | sender | `{ expectedVersion }` |
| `GET /api/connections/requests` | recipient | Returns active pending requests and their versions |
| `GET /api/connections/requests/:id/audit` | either participant | Returns events plus chain validity |
| `GET /api/connections/preferences` | preference owner | Returns default version `0` when unset |
| `PUT /api/connections/preferences` | preference owner | `{ allowConnectionRequests, suppressionReason?, expectedVersion }` |

Errors use `{ error, code }`. Important codes include `RECIPIENT_SUPPRESSED`, `RATE_LIMITED`, `VERSION_CONFLICT`, `IDEMPOTENCY_CONFLICT`, and `REQUEST_EXPIRED`.

## Persistence controls

Pair-scoped PostgreSQL advisory locks and a bidirectional expression index reject reversed/duplicate creates. Mutation transactions run at serializable isolation with bounded conflict retries. `ConnectionIdempotency` stores request hashes and original JSON responses. `ConnectionAuditEvent` chains canonical event data with SHA-256; database triggers reject update/delete attempts on both evidence tables. A separate lifecycle trigger rejects participant/content edits, terminal-state rewrites, and version changes that do not accompany a legal pending-to-terminal transition.

Suppression changes are versioned and audited. Operators should alert on rate-limit volume, repeated authorization failures, invalid audit chains, and database append-only trigger failures.
