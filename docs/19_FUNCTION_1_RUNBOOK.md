# Function 1 local runbook

> Runtime hiện hành: [Supabase setup](SUPABASE_SETUP.md), profile `supabase` đọc `.env`, không cần Docker. Schema có sẵn từ leader, Hibernate validate, Flyway chỉ test scope. Các bước local database bên dưới là hướng dẫn cũ/fixture; không apply baseline vào Supabase.

This runbook links to, rather than duplicates, the complete [Local Development Guide](LOCAL_DEVELOPMENT.md). It is for a developer-owned disposable local database and synthetic data; it is not a production/deployment runbook.

## Prerequisites and local startup

1. Use Windows PowerShell, JDK 21, `mvnw.cmd`, and Docker Desktop for integration tests. `java -version` and `./mvnw.cmd -version` should resolve to Java 21/Maven Wrapper.
2. For manual runtime, use only a disposable local PostgreSQL database already provisioned with the unchanged Function 1 schema. Defaults validate schema and leave Flyway disabled. The leader owns shared-database migrations; do not run this local baseline on a shared DB.
3. Put local settings in ignored `config/application-local.properties` (copy the `.example` file without overwriting an existing file). Put RS256 PKCS#8 private and public key files outside source resources. Set issuer, audience, database username/password, and key locations only in that external local configuration or a local secret manager.
4. Bootstrap ADMIN is disabled by default. A real group administrator must be provisioned by the agreed team process. Do not use register to create ADMIN; do not promote, unlock, reset, or verify admin state through local fixtures.
5. If synthetic document upload/download is needed, create a private root first outside the repository, JAR, public/static directories and configured source tree; explicitly enable local private storage. Storage is disabled by default. Keep root path, evidence files and local settings out of docs/reports.
6. Start with the command and profile/config location described in [Local Development](LOCAL_DEVELOPMENT.md), then call `GET /api/health`. It confirms only that the web endpoint responds; schema, database, security keys, and private storage have separate startup/use checks.

Use these commands for local regression:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
./mvnw.cmd -B clean verify -Ppostgres-it
./scripts/verify-local-config-packaging.ps1
```

The PostgreSQL suite runs in disposable Testcontainers instances. It does not use the DB settings in your local profile. The packaging script builds a temporary source copy and scans its executable JAR; neither command deploys or publishes code.

## Readiness and common failures

| Observation | Meaning / response |
|---|---|
| `/api/health` is `200`, `data.status=UP` | HTTP app is responding. It does not claim DB, file storage, admin bootstrap, or every dependency is healthy. |
| Startup fails at JWT key validation | Configure both matching external PEM paths or both Base64 DER values in the ignored local `.env`. Do not paste private key material into a chat/report. |
| Startup reports schema validation failure | Use a new developer-owned DB with the agreed Function 1 schema, or coordinate with the DB leader. Do not turn on Hibernate DDL auto-update or run shared SQL as a workaround. |
| Authenticated routes return `401` | Check token signature/issuer/audience/time and current customer status in the disposable DB. LOCKED accounts are denied at the next request. |
| Admin route returns `403` | Confirm the DB account is an ACTIVE ADMIN. ADMIN self-review and ADMIN self-driver-status changes are forbidden with `403`; customer-status self-lock is a separate `409` conflict. |
| Customer status request returns `409` | Check the U-09 conflict codes, including ADMIN self-lock and locking the last ACTIVE ADMIN. Both status and nonblank reason are required before a state change. |
| Owner-scoped resource returns `404` | Foreign and missing resource IDs intentionally share the same response. For bank accounts this applies to ADMIN too. |
| Upload/download returns `503` | Private storage may be disabled or unavailable. Create and configure a valid external private root locally; never move it into public/JAR/repository resources. |
| Upload returns `413` or `415` | Check configured file/request limits, multipart format, allowed JPEG/PNG content, and synthetic file validity. Do not weaken limits solely to pass a fixture. |
| PostgreSQL ITs cannot start | Docker must be running and Testcontainers must be able to reach it. The tests do not fall back to a configured local/shared database. |
| Packaging probe finds a marker | Inspect the isolated probe output/artifact in TEMP and configuration resource exclusions. Do not copy a real key/secret into the repo to reproduce it. |

Use server-generated trace IDs to correlate API responses and safe application logs. Logs contain IDs and allowlisted action/error metadata; they must not include passwords, access tokens, identity/document fields, complete bank account numbers, storage locators, filesystem paths, or raw database messages. Keep temporary application/test logs outside `target` when running the actual JAR smoke.

## JSON and request contract notes

- Unknown fields are rejected, but duplicate-member handling is DTO-specific. Login/register do not have per-field duplicate guards; an identical duplicate email in login currently returns `200`. Profile, customer/driver status, document-review, bank-account and voucher command DTOs guard repeated known fields; query and multipart parsers separately reject repeated names. OpenAPI object schemas cannot describe duplicate JSON member names.
- `fullName` in profile PATCH cannot be null. `address` can be null and is limited to 300 after runtime strip; the Java length bound counts UTF-16 code units. The OpenAPI `maxLength` is a client-side code-point bound and cannot encode strip/Java-unit semantics exactly.
- Customer status requires a nonblank reason. Driver ACTIVE accepts only omitted/null reason; SUSPENDED requires a nonblank reason. Both are validated with a configurable default maximum of 500 and are not stored in a reason-history column.
- DRIVER_LICENSE upload requires nonblank `licenseClass` at submission. PASSPORT can be submitted with only `docType`, `docNumber` and front image, but that minimal row stays PENDING until a request includes the U-13 approval metadata. Do not infer that successful upload means approvable.
- Voucher NUMERIC amount fields require exact integral value, and accept mathematical amount tokens such as `1.0` and `1e0`. `usageLimit` and `perUserLimit` require integer JSON tokens; `1.0` and `1e0` are rejected at runtime. PERCENT `discountValue` has a maximum of 100.

## Scope boundary

Function 1 provides account/profile, private evidence, current KYC, driver eligibility snapshots, owner-only bank records/internal payee lookup, and ADMIN voucher definitions. It does not provide driver assignment, vehicle availability, rental orders, voucher redemption, price calculation, payment, payout, recovery jobs, secret provisioning, production ACL/RLS, or deployment. Coordinate those behaviors with the F2/F3/F4 and operations owners before integration.
