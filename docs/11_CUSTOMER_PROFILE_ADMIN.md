# P04 — Customer profile and admin account status

P04 remains **APPROVED** after [P04-FIX-01 review](reviews/P04_FIX_01_REVIEW.md). P05–P09 are also APPROVED. P10 was CHANGES_REQUESTED; [P10-FIX-01](reports/P10_FIX_01_REPORT.md) updates the current API contract and awaits review. Function 1 is not marked complete.

## Routes

Every successful response containing account data has **Cache-Control: no-store**, uses the shared ApiResponse envelope, and returns a body traceId that equals X-Request-ID.

| Method and path | Access | Response |
|---|---|---|
| GET /api/customers/me | Active CUSTOMER or ADMIN | CustomerProfileResponse |
| PATCH /api/customers/me | Active CUSTOMER or ADMIN | 200 CustomerProfileResponse |
| GET /api/customers | Active ADMIN | 200 PageResponse<CustomerSummaryResponse> |
| GET /api/customers/{id} | Active ADMIN | 200 CustomerAdminResponse |
| PATCH /api/customers/{id}/status | Active ADMIN | 200 CustomerAdminResponse |

The /me ID always comes from the authenticated principal. It does not accept an owner selector; extra query IDs do not change which row is used. Admin account-detail/status routes reject non-positive IDs and return 404 for an absent positive ID after authorization.

## Profile patch

The request allowlist is exactly fullName, dateOfBirth, and address. Presence state is exposed only through non-JavaBean helper methods; HTTP tests confirm fullNamePresent/dateOfBirthPresent/addressPresent and variants with true/false/null/wrong type are unknown and return 400 INVALID_REQUEST. Duplicate allowed keys remain rejected even when an unknown flag/property is interleaved. The regression snapshots the full customer row and audit fields to confirm rejected input cannot mutate it.

| Input field | Omitted | Explicit null | String value |
|---|---|---|---|
| fullName | Leave unchanged | 400 validation error | Trim; required/nonblank; maximum 150 Java UTF-16 code units |
| dateOfBirth | Leave unchanged | Clear to SQL NULL | ISO yyyy-MM-dd; must not be after LocalDate.now(clock) in the configured zone |
| address | Leave unchanged | Clear to SQL NULL | Trim; maximum 300 Java UTF-16 code units; blank after trim becomes SQL NULL |

The OpenAPI `maxLength` constraints count Unicode code points and cannot express Java `String.length()` after `strip()` exactly. The spec documents this distinction; ordinary text boundaries are covered by HTTP regression.

Examples:

    {"fullName":"Nguyễn Văn An"}

    {"dateOfBirth":null,"address":null}

Only the authenticated ACTIVE account can be changed. The service takes a PostgreSQL pessimistic row lock, rechecks ACTIVE after acquiring it, and mutates only allowlisted fields on the locked entity. It flushes only when a normalized value changed. created_at/updated_at remain database-owned; no-op and rejected requests do not produce an UPDATE or alter audit values.

The response stays CustomerProfileResponse from P03. It does not add account identity, password, role, status, KYC, verification, audit, or association setters to the request.

## Admin list and response DTOs

GET /api/customers accepts only these query parameters:

| Parameter | Contract |
|---|---|
| status | Optional ACTIVE or LOCKED |
| kycStatus | Optional existing schema enum |
| keyword | Trimmed, blank means no filter, maximum 150; case-insensitive contains on fullName OR email only |
| page | Zero-based, default 0, non-negative |
| size | Default 20, maximum 100; both are configurable and validated at startup; over maximum is 400, never clamped |
| sort | One field,direction, default createdAt,desc; allowed fields id, fullName, email, createdAt, updatedAt, status, kycStatus; direction asc/desc |

Repeated scalar parameters, unknown query keys, invalid enums/numbers/sort values, and out-of-range offsets return 400. If the chosen sort field is not id, id with the same direction is appended as a stable tie-breaker. Filters and counts run in PostgreSQL through a bound JPA Specification; the application does not load all customers to filter or page them. Search treats %, _, and \ from the user as literal characters. A page past the last page returns empty content with the filtered totalElements.

The ADMIN summary contains exactly:

id, fullName, email, phone, role, status, kycStatus, emailVerified, createdAt, updatedAt.

Admin detail adds dateOfBirth and address. Neither includes passwordHash, avatarUrl, documents, banks, drivers, vouchers, or other associations. ADMIN sees ACTIVE and LOCKED rows unless a status filter is supplied.

Authorization is checked at the controller boundary before list query parsing and again by the service proxy. CUSTOMER cannot invoke admin service methods or execute the list query; locked/missing accounts are rejected by P03 authentication before the controller.

## Change status command

PATCH /api/customers/{id}/status accepts only:

    {"status":"LOCKED","reason":"Tạm khóa để xử lý yêu cầu quản trị"}

status must be exactly ACTIVE or LOCKED. reason is required, trimmed, nonblank, and bounded by app.customer.status-reason-max-length (default 500). Both fields are validated for no-op commands as well. Unknown, helper/presence, duplicate, and wrong-type keys are rejected by the current strict command DTO and HTTP regression. The database schema has no reason field; the reason is validated but is not stored in address or action_logs or another durable history column.

Transitions:

| Current | Requested | Result |
|---|---|---|
| ACTIVE | LOCKED | Lock after policy guards |
| LOCKED | ACTIVE | Unlock |
| ACTIVE | ACTIVE | 200 no-op |
| LOCKED | LOCKED | 200 no-op |

No-op, rejected, and failed commands do not update audit values or emit a status-change log. Changed commands return the database-triggered updatedAt.

The confirmed policy forbids an ADMIN from locking their own account and forbids reducing the number of ACTIVE ADMIN accounts to zero. Self-lock rejection takes precedence and returns 409 ADMIN_SELF_LOCK_FORBIDDEN; an attempt that violates the last-admin guard returns 409 LAST_ACTIVE_ADMIN_LOCK_FORBIDDEN. An absent target is 404 RESOURCE_NOT_FOUND. The actor is re-read from PostgreSQL after command serialization; an actor who was locked while waiting receives 401 INVALID_TOKEN, and a database role change is checked again. SQLState `55P03` from the advisory lock statement is translated, retaining its SQLException cause, to `CannotAcquireLockException` and safe 503 DEPENDENCY_UNAVAILABLE; unrelated SQLStates are not classified as lock contention. The integration regression holds the production namespace lock on a separate PostgreSQL connection, asserts 503/no mutation/no success log, rolls back the blocker, then verifies a 200 retry and after-commit log.

### Status lock and writer contract

Every API status command takes the PostgreSQL transaction-level advisory lock reserved for sba301:function1:customer-status before reading account rows. The current numeric key is the documented SBA301CS namespace constant. The transaction then locks the actor row and target row in that order, counts active ADMIN accounts, applies the transition, flushes if changed, and keeps the advisory lock through commit/rollback. The database releases this transaction lock automatically. The status lock timeout is app.customer.status-lock-timeout-ms (default 5000 ms).

Profile updates lock only their own customer row and do not request the advisory lock. This keeps the lock order acyclic: profile work can finish while a status command waits for its row. Application writers that later change customer status must follow the same advisory-lock protocol. Direct administrative SQL is outside the concurrency guarantee tested for this API.

Changed status metadata is logged only after commit: action, captured trace ID, actor/target IDs, old/new status, and reasonProvided. The reason string and customer PII are never logged. Q-09 remains open: there is no durable admin reason/status history table.

## Tokens, CORS, and configuration

A lock takes effect on the next request using the token: P03 loads current status/role from PostgreSQL for each request. A request already authorized before the status commit is not revoked mid-flight. Unlocking permits a previously issued token to work again while it remains unexpired; unlock does not mint a token or revoke older tokens permanently.

CORS now allows only explicit GET, POST, PATCH, and OPTIONS defaults, keeps exact configured origins, exposes X-Request-ID, and keeps allowCredentials=false. OPTIONS preflight is handled before bearer authentication; an actual PATCH still requires the correct active account/role.

| Property | Default | Purpose |
|---|---:|---|
| app.customer.default-page-size | 20 | Default admin list size |
| app.customer.max-page-size | 100 | Maximum request page size |
| app.customer.status-reason-max-length | 500 | Request reason bound only; not a database/business limit |
| app.customer.status-lock-timeout-ms | 5000 | Bounded database lock wait |

The paging defaults must be positive and default size must not exceed max size. These defaults are configurable technical baselines, not additional product rules.

## Verification evidence

The P04 integration suite uses real HTTP, PostgreSQL 15.13 Testcontainers, the unchanged Function 1 baseline, and temporary RSA keys. It verifies presence/null behavior, strict JSON, audit/no-op, Clock boundary in Vietnam time, list filtering/count/escaping/tie-breaking, authorization/DTO privacy, status lifecycle and token behavior, self/last-admin invariants, two-admin and same-target races, profile/status concurrency, rollback after flush, safe logging, 503 mapping, and PATCH CORS. See P04 report and implementation status for the complete commands and exact test counts.
