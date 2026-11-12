# 10 — P03 Authentication and Security baseline

Status on 2026-10-15: **P01–P09 APPROVED** after [P09-FIX-01 review](reviews/P09_FIX_01_REVIEW.md). P10 is CHANGES_REQUESTED; P10-FIX-01 updates docs/spec and regression coverage only, with 150/150 full tests and packaging PASS. Duplicate-member behavior remains DTO-specific; auth parser/security behavior is unchanged. P10-FIX-01 is READY_FOR_REVIEW with R1/R2 awaiting reviewer confirmation. See the [handoff](17_FUNCTION_1_HANDOFF.md), [P10 report](reports/P10_REPORT.md) and [fix report](reports/P10_FIX_01_REPORT.md). Exact decimal ingress/schema/history stay unchanged.

## API contract

| Method / route | Access | Success | Errors |
|---|---|---|---|
| `GET /api/health` | Public | 200 `ApiResponse<HealthResponse>`; `data.status=UP` | P01 transport errors |
| `POST /api/auth/register` | Public | 201 `ApiResponse<CustomerProfileResponse>`; no token is issued | 400 validation/unknown JSON property; 409 `ACCOUNT_ALREADY_EXISTS` |
| `POST /api/auth/login` | Public | 200 `ApiResponse<TokenResponse>` | 400 validation; generic 401 `AUTHENTICATION_FAILED`; safe 503 `DEPENDENCY_UNAVAILABLE` for authentication data-source failure |
| `GET /api/customers/me` | Active CUSTOMER or ADMIN | 200 own `CustomerProfileResponse` | 401 missing/invalid bearer; 403 method authorization; safe 503 if current-account lookup is unavailable |
| `PATCH /api/customers/me` | Active CUSTOMER or ADMIN | 200 own `CustomerProfileResponse` | P04 allowlist update under row lock; cache disabled |
| `GET /api/customers` | Active ADMIN | 200 `PageResponse<CustomerSummaryResponse>` | P04 database filters/count/page, allowlisted sort |
| `GET /api/customers/{id}` | Active ADMIN | 200 `CustomerAdminResponse` | P04 detail allowlist; missing positive ID is 404 |
| `PATCH /api/customers/{id}/status` | Active ADMIN | 200 `CustomerAdminResponse` | P04 status transaction/advisory lock and confirmed admin policy |

Register accepts only `fullName`, `email`, `phone`, and `password`. Login accepts only `email` and `password`. Unknown properties are rejected with 400 `INVALID_REQUEST`, including attempts to submit role/status/KYC/email verification, ID, audit, owner, or customer fields. Request classes are separate from JPA entities and do not generate secret-bearing `toString()` output.

Register sets `role=CUSTOMER`, `status=ACTIVE`, `kycStatus=NONE`, and `emailVerified=false`. It hashes the password and flushes before mapping the response. Existing email or phone conflicts share one 409 code/message; the database unique index/constraint remains the final concurrency guard. Only SQLState `23505` for `uq_customers_email_lower` or `customers_phone_key` maps to that conflict. Other persistence failures remain server errors.

Email is trimmed and lowercased with `Locale.ROOT` before validation, lookup, and save. `fullName` and `phone` are trimmed; phone otherwise stays a string without an invented country-code/format rule. Password is not trimmed or normalized. Development config defaults to a minimum of 8 Unicode code points, a maximum of 72 UTF-8 bytes, and BCrypt strength 10. The byte guard prevents BCrypt truncation. Passwords use `BCryptPasswordEncoder` directly; stored hashes use standard `$2a$`/`$2b$`/`$2y$` forms with cost 4–31 and no `{bcrypt}` prefix or plaintext fallback. Malformed hashes, prefixed values, and plaintext storage return the same generic 401 as invalid credentials. Seeded databases using the old `{bcrypt}` prefix must be reseeded; the hash suffix itself is unchanged.

`CustomerProfileResponse` contains only the documented profile/status/audit fields and never a password hash or association. `TokenResponse` contains a bearer access token, configured expiry seconds and an account summary with ID/name/role; it has no refresh token. Register, login, and me set `Cache-Control: no-store`.

## JWT and per-request account lookup

- Signing algorithm is pinned to HS256. The `app.security.jwt.secret-key` property is supplied through `JWT_SECRET`, has no committed default, and must contain at least 32 UTF-8 bytes; startup fails if it is missing or too short. Rotate the previously committed secret before using this configuration outside tests.
- Access JWT claims are `sub` (positive decimal customer ID), `iss`, `aud`, `iat`, and `exp`. `exp-iat` exactly equals the whole-second configured TTL. No password, email, phone, document, bank, or role authority claim is emitted.
- The decoder verifies the signature and HS256 algorithm, exact issuer String value, configured audience, `exp`/`nbf` with configured skew, required claim presence/types, `exp > iat`, positive long `sub`, and rejects `iat` beyond the skew window. An issuer is treated as a JWT StringOrURI identifier; validation does not coerce it through a URL getter. A configured non-HTTP-URL issuer works when it matches exactly; empty, wrong-type, missing or mismatched issuer inputs in the regression matrix produce the normal invalid-token response with matching trace.
- After JWT validation, every request loads the account row by `sub`. A missing or `LOCKED` row is 401 `INVALID_TOKEN`; an `ACTIVE` row receives `ROLE_CUSTOMER` or `ROLE_ADMIN` from the database. No role/status cache is used. Changing or deleting the row affects the next request with an otherwise valid token.
- `CurrentAccount` is immutable and contains only customer ID and the current database role. `/api/customers/me` has no owner ID input and maps a DTO inside a read-only service transaction.

## Security, errors and CORS

The chain is stateless, disables form/basic login and CSRF because this baseline uses bearer headers rather than auth cookies. Only `GET /api/health`, `POST /api/auth/register`, and `POST /api/auth/login` are public; preflight is handled before authentication. All other routes require a bearer token. Method security is enabled. The ADMIN-only integration fixture exists only in test sources.

| Condition | HTTP / code |
|---|---|
| Missing bearer on protected route | 401 `AUTHENTICATION_FAILED` |
| Login unknown/wrong password/locked | 401 `AUTHENTICATION_FAILED` with one message |
| Authentication repository/provider unavailable during login | 503 `DEPENDENCY_UNAVAILABLE`; safe trace and exception type only |
| Present malformed, expired, wrongly signed token, or inactive/missing current account | 401 `INVALID_TOKEN` |
| Authenticated account lacks method role | 403 `ACCESS_DENIED` |
| Duplicate registration email or phone | 409 `ACCOUNT_ALREADY_EXISTS` |
| Current-account DB lookup unavailable before controller | 503 `DEPENDENCY_UNAVAILABLE`, not an invalid-token response |
| PostgreSQL advisory status lock returns SQLState `55P03` | 503 `DEPENDENCY_UNAVAILABLE`; classification is limited to the lock-acquisition statement and keeps the SQL cause internal |

Security 401/403 and MVC errors use the same `ApiResponse` shape (`success=false`, `data=null`, `errors=[]`, `traceId`). The trace filter creates a server UUID and removes MDC in `finally`. Hibernate `hibernate.jdbc.log.errors` and `.warnings` are explicitly false because raw database exception detail can contain input values; SQL display is also false. The service still logs registration conflict trace ID and allowlisted constraint name without the exception/cause. Regression tests capture Logback formatted events and throwable causes during real PostgreSQL email/phone conflicts, assert the generated candidate hashes and a valid test bearer token are absent, and assert trace plus safe constraint metadata remain. Invalid issuer values are returned through the normal 401 entry point with body/header trace equality and no servlet conversion exception. Missing-bearer responses have `WWW-Authenticate: Bearer`; invalid-bearer responses use `Bearer error="invalid_token"`.

CORS uses exact configured HTTP(S) origins, explicit methods/headers including PATCH, exposes `X-Request-ID`, and never enables credentials. Defaults have no allowed origins. During the P03 integration probe, an allowed preflight returned 2xx, an allowed origin without a token returned 401 with that origin's CORS header, and a disallowed origin returned **403 with body `Invalid CORS request` and no `Access-Control-Allow-Origin`**. P04 also verifies an allowed PATCH preflight and a CUSTOMER's allowed-origin 403. A framework CORS rejection is not an account authorization result.

## Configuration and bootstrap

JWT issuer, audience, TTL, skew, and secret are bound from `app.security.jwt.*`; all are validated at startup. The access-token TTL is 30 minutes by default. Password settings are under `app.security.password.*`; CORS lists are under `app.security.cors.*`. See [local setup](LOCAL_DEVELOPMENT.md) and `config/application-local.properties.example`. Example local defaults (`PT30M`, `PT30S`, strength 10, minimum length 8) are configurable technical baselines, not production decisions. The real frontend origin and production issuer/audience/secret have not been supplied.

Bootstrap admin is disabled by default. When explicitly enabled, runtime must receive valid full name/email/phone/password configuration. It creates an ADMIN/ACTIVE/NONE/unverified row through a separate transactional service and the same password encoder. An existing ADMIN/ACTIVE row with the normalized email is idempotently left untouched, including password/profile/role. Existing CUSTOMER, locked admin, or phone conflict fails safely; no account is promoted, unlocked, or reset. Test bootstrap uses only isolated PostgreSQL.

## Scope boundary

No refresh/revocation table, logout, password reset/change, OTP, email verification, role CRUD, migration/schema change, document/KYC/driver/bank/voucher workflow, or P05 endpoint was added. P03's PostgreSQL auth/security suite and P04's customer management suite use real HTTP, isolated Testcontainers PostgreSQL 15.13, the unchanged Flyway baseline and test-only HS256 JWT fixtures. P01/P02/P03 regression suites remain in the full verify.
