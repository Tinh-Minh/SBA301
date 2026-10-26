# Function 1 API handoff

> Current runtime2026-10-15: [Supabase + .env setup](SUPABASE_SETUP.md); see [scope/schema audit](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md) and [flows](21_FUNCTION_1_FLOWS.md). Unused F4 full-payee lookup was removed; 32 HTTP operations remain. Docker/Flyway are test-only tools, not requirements for the Supabase application run.

> Review 2026-10-15: **P10 APPROVED**, R1/R2 CLOSED after [P10-FIX-01 review](reviews/P10_FIX_01_REVIEW.md). Reviewer150/150/packaging/workflow/standard JAR and independent HTTP probe PASS; implementation accepted within Function1 scope. The user separately requested [P11 Postman JSON/data/fixtures](prompts/P11_POSTMAN_FUNCTION_1.md); PROMPT_READY, not delivered yet.

P01–P10 are APPROVED. This document describes the reviewed source contract in `com.carrental`; the static import file is [OpenAPI 3.1](api/openapi-function1.json), and manual request samples are [function1-examples.http](api/function1-examples.http). It covers the five leader tables: `customers`, `user_documents`, `drivers`, `bank_accounts`, and `vouchers` (ADMIN definition management only).

## Start and verify

Use the existing [local development guide](LOCAL_DEVELOPMENT.md) for JDK 21, Maven Wrapper, external database/JWT configuration, local storage, and isolated PostgreSQL tests. A runtime database must already have the unchanged Function 1 schema; the app uses `ddl-auto=validate` and Flyway is disabled by default. Bootstrap ADMIN is disabled by default. The group provisions an administrator; the registration endpoint always creates CUSTOMER and does not promote, unlock, reset, or verify an administrator.

For the synthetic local HTTP sample, configure the local profile, point it only at a disposable local database, set `JWT_SECRET` to a value with at least 32 UTF-8 bytes, and enable a private storage root outside the repo/JAR/public resources. For integration tests, Docker/Testcontainers supplies a disposable PostgreSQL 15.13 database, test-only JWT fixtures, and an external temporary storage root. Do not use real identity images or send examples to a shared database.

## Canonical endpoint inventory

Every authenticated operation requires an HS256 bearer access token from login. The server signs it with `JWT_SECRET`; the token uses the configured issuer, audience, and expiration. The current PostgreSQL account role/status is authoritative on each request. Unless noted, JSON responses (success and error) are `Cache-Control: no-store`; `traceId` equals `X-Request-ID`. Create operations return a `Location` header where the controller defines one. IDs are signed Java `long` / PostgreSQL `BIGINT` values represented as JSON numbers; clients should not assume values above JavaScript's safe integer range remain exactly representable.

| Method and path | Authentication / ownership | Request | Success |
|---|---|---|---|
| `GET /api/health` | Public | No body | `200`, `{data:{status:"UP"}}`; web liveness only |
| `POST /api/auth/register` | Public | JSON `fullName,email,phone,password` | `201`, CUSTOMER profile; no admin self-registration |
| `POST /api/auth/login` | Public | JSON `email,password` | `200`, bearer token and account summary |
| `GET /api/customers/me` | CUSTOMER or ADMIN | No body | `200`, own profile; `kycStatus` is persisted snapshot |
| `GET /api/customers/me/kyc` | CUSTOMER or ADMIN | No body | `200`, current Clock-evaluated KYC |
| `PATCH /api/customers/me` | CUSTOMER or ADMIN | JSON allowlist `fullName,dateOfBirth,address`; omitted differs from explicit `null` | `200`, own profile |
| `GET /api/customers` | ADMIN | Query: `status,kycStatus,keyword,page,size,sort` | `200`, database page |
| `GET /api/customers/{id}` | ADMIN | Positive ID | `200`, admin customer DTO |
| `GET /api/customers/{id}/kyc` | ADMIN | Positive ID | `200`, current KYC summary |
| `PATCH /api/customers/{id}/status` | ADMIN | JSON `status,reason` | `200`; P04 self-lock and last ACTIVE ADMIN policy applies |
| `POST /api/user-documents` | CUSTOMER or ADMIN, own account | `multipart/form-data`; required `docType,docNumber,frontImage`; DRIVER_LICENSE also requires nonblank `licenseClass`; other metadata/backImage can be omitted to create PENDING | `201`, safe document detail |
| `GET /api/user-documents` | CUSTOMER or ADMIN; customer defaults to own rows; ADMIN may request allowed all scope | Query: `scope,customerId,docType,verifyStatus,page,size,sort` | `200`, masked document page |
| `GET /api/user-documents/{id}` | Owner or ADMIN | Positive ID | `200`, safe detail metadata |
| `GET /api/user-documents/{id}/files/{side}` | Owner or ADMIN | `side=front\|back` | `200`, raw canonical JPEG/PNG bytes |
| `PATCH /api/user-documents/{id}/review` | ADMIN; self-review forbidden | JSON `verifyStatus,rejectReason` | `200`, review result and snapshot KYC |
| `POST /api/drivers` | CUSTOMER or ADMIN, own account | **No query or body bytes** | `201`, own driver profile `PENDING` |
| `GET /api/drivers/me` | CUSTOMER or ADMIN | No body | `200`, own driver profile |
| `GET /api/drivers/me/eligibility` | CUSTOMER or ADMIN | No body | `200`, current eligibility snapshot |
| `GET /api/drivers` | ADMIN | Query: `status,customerId,page,size,sort` | `200`, database page |
| `GET /api/drivers/{id}/eligibility` | Owner or ADMIN | Positive ID | `200`, current eligibility snapshot |
| `GET /api/drivers/{id}` | Owner or ADMIN | Positive ID | `200`, safe driver profile |
| `PATCH /api/drivers/{id}/status` | ADMIN; U-15 forbids changing own driver status | JSON `status,reason` | `200`, status result |
| `POST /api/bank-accounts` | CUSTOMER or ADMIN, **own account only** | JSON `bankName,accountNumber,accountHolder,makeDefault?` | `201`, masked account; omitted `makeDefault` means false |
| `GET /api/bank-accounts` | CUSTOMER or ADMIN, own rows only, including ADMIN | Query: `page,size,sort` | `200`, masked page |
| `GET /api/bank-accounts/{id}` | CUSTOMER or ADMIN, own row only, including ADMIN | Positive ID | `200`, masked detail |
| `PATCH /api/bank-accounts/{id}/default` | CUSTOMER or ADMIN, own row only | **No query or body bytes** | `200`, masked detail |
| `DELETE /api/bank-accounts/{id}` | CUSTOMER or ADMIN, own row only | **No query or body bytes** | `200`, `data:null`; may leave zero defaults |
| `POST /api/vouchers` | ADMIN | JSON definition; see P09 contract | `201`, ACTIVE definition, `usedCount=0` |
| `GET /api/vouchers` | ADMIN | Query: `code,status,discountType,window,page,size,sort` | `200`, database page and window state |
| `GET /api/vouchers/{id}` | ADMIN | Positive ID | `200`, definition and window snapshot |
| `PUT /api/vouchers/{id}` | ADMIN | JSON exactly `description,usageLimit` (both keys required) | `200`, definition |
| `PATCH /api/vouchers/{id}/status` | ADMIN | JSON `status=ACTIVE\|INACTIVE` | `200`, retained definition |

List defaults are page `0`, size `20`, and one allowlisted `sort=field,direction` pair; maximum page size is configurable (default 100). Duplicate/unknown query keys, coercion, invalid enums, and multiple sort fields are rejected. Database filters/counts are applied before pagination. See P11–P16 contract documents linked from [docs index](README.md) for each route's exact per-resource filters, sort allowlists, and policy.

## Shared HTTP and data contract

JSON envelope fields are `success,code,message,data,errors,traceId`; errors use `{field,message}` and never echo rejected values, SQL messages, stack traces, key material, tokens, document locators, or full bank numbers. Common codes include `INVALID_REQUEST`, `VALIDATION_ERROR`, `PAYLOAD_TOO_LARGE`, `RESOURCE_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `UNSUPPORTED_MEDIA_TYPE`, `AUTHENTICATION_FAILED`, `INVALID_TOKEN`, `ACCESS_DENIED`, `ACCOUNT_ALREADY_EXISTS`, resource-specific `409` conflicts, `DEPENDENCY_UNAVAILABLE` (`503`), and `INTERNAL_ERROR`. See `ErrorCode` for the exact code/status mapping; not every code applies to every route. Security ingress can determine whether an unauthenticated malformed request reaches MVC parsing, so callers should not assume malformed-body precedence over authentication.

Request allowlists and duplicate handling are separate checks. Unknown properties are rejected by the JSON DTOs, query parsers and multipart parser. Duplicate behavior is specific to the parser/DTO: login and registration use String setters without per-field duplicate guards (a login with the same email member twice is accepted by the current runtime); profile, customer/driver status, document review, bank-account and voucher command DTOs guard repeated known fields; multipart rejects repeated scalar and file names; list query parsers reject repeated query keys. The application does not enable global Jackson duplicate detection. JSON Schema object constraints cannot express duplicate member names.

`PATCH /api/customers/me` distinguishes omitted fields from explicit null only for nullable fields; `fullName` must be non-null/nonblank when supplied. Address is capped at 300 after runtime strip; full name at 150. The Java validators use UTF-16 `String.length()` for these values, while JSON Schema `maxLength` counts Unicode code points and does not encode the preceding strip step. The contract documents those limits and the runtime tests cover ordinary text boundaries. Future birth dates use the configured Clock.

Customer status commands require both status and a nonblank reason (default max 500, configurable); reason is validated but has no durable history column. Driver status commands accept ACTIVE with omitted/null reason only, and require nonblank reason for SUSPENDED; PENDING is not a target. U-15 and current eligibility rules still apply. Neither reason is persisted by the current leader schema.

For multipart submission, `licenseClass` is required immediately for DRIVER_LICENSE. Other approval metadata, front/back image requirements and expiry prerequisites are evaluated separately under U-13 when a reviewer requests APPROVED; a minimal PASSPORT submission can remain PENDING and is not approvable until required evidence is supplied.

JSON types matter: IDs are JSON numbers; voucher NUMERIC amount values must be mathematically integral and within NUMERIC(14,0), so `12.5` is rejected while `1.0` and `1e0` are accepted for amount fields. `usageLimit` and `perUserLimit` are lexical JSON integer-token-only at runtime; `1.0`/`1e0` are rejected even though JSON Schema's `integer` describes mathematical integrality. Amount precision, quota token shape, duplicate JSON members, Clock rules, DB state and authorization are verified by runtime tests rather than fully represented by OpenAPI constraints.

Local dates use `yyyy-MM-dd`. `LocalDateTime` fields use local timestamp text without offset or `Z`; do not silently reinterpret them as UTC. Prices/amounts use exact `BigDecimal` semantics against the leader NUMERIC columns; no F1 endpoint computes a rental price. Voucher codes are case-preserving exact strings. Passwords are never returned and are limited to 72 UTF-8 bytes for BCrypt; configured minimum length uses Unicode code points. Text bounds should be read from each DTO/validator; Java `String.length()` and SQL VARCHAR limits count different units for some Unicode inputs.

For document downloads, send the bearer token as an HTTP header and consume the JPEG/PNG response as bytes/blob. Success has `Content-Type`, `Content-Length`, server-generated `Content-Disposition: attachment`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `X-Request-ID`. A download error is the normal JSON envelope with a trace. Never put a token in a query parameter or use a public image URL/locator.

CORS accepts only exact configured origins; default is no allowed browser origin, credentials are disabled, and `X-Request-ID` is exposed. Set `CORS_ALLOWED_ORIGINS` for the frontend deployment. The FE team chooses its token storage policy; this backend does not prescribe a frontend redesign.

## State distinctions and cross-function handoff

- `customers.kyc_status` on profile/admin DTO is a persisted snapshot. `/api/customers/me/kyc` and admin current-KYC route evaluate identity proof with the injected Vietnam Clock. U-12 means approved CCCD or passport provides identity KYC; a driver license does not.
- Driver stored `status=ACTIVE` is not a permanent eligibility promise. U-14 requires current ACTIVE account, current identity KYC VERIFIED, and an approved unexpired GPLX with nonblank class. Clock evaluation does not auto-suspend the stored driver. U-15 forbids ADMIN self-status changes.
- Voucher stored `status` is separate from `windowState`; `ACTIVE` and a current window do not guarantee quota, per-user eligibility, order-price application, reservation, or redeem behavior. U-19 limits mutable fields to description/usage limit; U-20 deactivates without deleting; U-21 keeps case-exact code semantics.
- Bank REST DTOs mask account numbers and remain owner-only even for ADMIN. The unused internal full-payee lookup was removed in the scope audit2026-10-15; F1 does not ship a payout helper/module. The original composite ownership FK and referenced-delete handling remain.

**F2:** call the current `DriverEligibilityService.evaluateForCustomer(customerId)` in the appropriate action/transaction, then separately protect car/slot capacity and driver assignment. The result is a snapshot, not an allocation or reservation guarantee.

**F3:** read current identity KYC as needed and use exact voucher definitions/row locks; `usedCount` is written by F3's order/usage lifecycle. F3 decides price calculation, rounding, per-user counts, reservation/release, and payment/order semantics. P10 workflow does not change a synthetic usage counter to imitate redemption.

**F4:** implemented by another member, following the leader composite FK and its own money/payout rules. F1 has no full-payee lookup contract after the scope audit. The P08 test-only FK fixture validates bank referenced-delete handling, not a payout module.

## Decisions and deferred limits

Confirmed user policies U-09 (no ADMIN self-lock and no lock of the final ACTIVE ADMIN), U-11–U-13 (no self-review, identity proof separation, approval prerequisites), U-14/U-15 (current driver eligibility and no ADMIN self-change), U-16–U-18 (default/no automatic replacement/immutable payee), and U-19–U-21 (voucher field mutability, retained inactive row, exact case). Detailed user decisions are in [07 decisions](07_DECISIONS_AND_OPEN_QUESTIONS.md).

No OTP/email verification flow, password reset, refresh-token/revocation/renewal, history/audit tables, expiry scheduler, cloud object storage, cleanup sweeper, production RLS/ACL policy, multi-node private storage, car/slot/order/payment/payout/dispute/review, or voucher apply/redeem API is included. Windows ACLs, crash recovery, shared database, production deployment, and complete F2/F3/F4 transactions remain outside the evidence here; the team must assign configuration/provisioning/operation owners before deployment. P10 is a Function 1 handoff, not a claim of full rental integration or production readiness.
