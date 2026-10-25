# Local development — SBA301 Car Rental backend

> **Cập nhật 2026-10-15:** runtime chính đã chuyển sang Supabase + native `.env`, không cần Docker/local PostgreSQL. Làm theo [SUPABASE_SETUP.md](SUPABASE_SETUP.md). Phần bên dưới chủ yếu giữ mô tả lịch sử/test fixtures; không dùng hướng dẫn bật Flyway để khởi tạo Supabase. Flyway giờ chỉ test scope, không nằm trong executable JAR. Current scope/flows tại [audit](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md) và [sơ đồ](21_FUNCTION_1_FLOWS.md).

P01 provides the Spring MVC foundation, P02 adds Function 1 persistence, P03 implements register/login and RS256 bearer security, P04 adds profile/admin management, P05 adds private user-document submission/access, P06 adds document review/current KYC, P07 adds driver profile/current eligibility, P08 adds owner-scoped bank accounts, and P09 adds ADMIN voucher definition management. The application runtime needs a PostgreSQL database whose schema matches the unchanged Function 1 migration and external JWT key files. P05–P09 add no schema objects. Private storage is disabled by default.

## Requirements

- Windows PowerShell, JDK 21, and the Maven Wrapper (Maven 3.9.11).
- Docker Desktop for PostgreSQL integration tests. The tests use a disposable Testcontainers database and do not connect to a configured local or shared database.
- For an application run, a local PostgreSQL database configured with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`, plus JWT issuer/audience and external RS256 key file locations.
- OpenSSL (or an equivalent key provisioning tool) only if you need to create a new development RSA keypair.

If needed, set `JAVA_HOME` for the current PowerShell process:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
```

## PostgreSQL integration tests

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

The first command runs P01 HTTP regression and configuration tests, then PostgreSQL 15.13 Testcontainers tests through Maven Failsafe. The Failsafe tests create isolated databases, run the Function 1 Flyway baseline, start a real HTTP server with temporary RSA test keys, and remove their containers after the test process. Docker must be available. Reports are under `target/surefire-reports` and `target/failsafe-reports`.

P04 adds real-HTTP/PostgreSQL checks for profile presence/null rules, query-bound admin pagination, customer status serialization and policy, and concurrency with temporary RSA keys. The isolated baseline remains the leader's Function 1 schema; it is not applied to a shared database.

P05 adds `UserDocumentPostgresIT` with a separate PostgreSQL 15.13 Testcontainers database, bearer HTTP multipart requests, synthetic JPEG/PNG data and a temporary private root outside the repository. P05-FIX-01 adds truncation/CRC/warning and stored-file checks, appended-data canonicalization, output-cap evidence, an actual PostgreSQL row-lock timeout/retry, outcome-boundary fault injection, concurrent receipt isolation and upload-vs-admin-lock barriers. The integration test gives Tomcat a larger form-post limit than the app multipart limit and unlimited swallow only in this fixture so the app's traced 413 contract can be observed; production caps remain 5 MiB/file and 11 MiB/request. Do not use real identity documents as fixtures. Storage configuration tests use temp directories; a Windows ACL is not modified by tests.

P06 adds `UserDocumentReviewPostgresIT` with PostgreSQL15.13 Testcontainers,real HTTP/JPA/security,synthetic keys/images/external root and bounded barriers. It checks actual23505,row-lock timeout/retry,review races,actor recheck,rollback and Clock-sensitive KYC. The original review/upload test is explicitly pre-transaction file-stage overlap. P06-FIX-01 adds a separate actual DB contention case: upload holds the owner row lock after `saveAndFlush` and before commit; an authenticated review request waits on that PID, confirmed through PostgreSQL `pg_blocking_pids`, then evaluates current KYC after upload commit. Failure diagnostics cover missing/corrupt evidence, disabled/injected unavailable storage and exact 23505 without logging request values or throwable chains. See [report](reports/P06_FIX_01_REPORT.md). Focused command:

```powershell
.\mvnw.cmd -B '-Dtest=none' '-Dsurefire.failIfNoSpecifiedTests=false' '-Dit.test=UserDocumentReviewPostgresIT' -Ppostgres-it verify
```

Do not connect these tests to a configured local/shared database or use real identity data. `KycPolicyTest` covers the shared precedence helper with deterministic inputs; clock-sensitive HTTP tests use the test-only fixed Clock.

P07 adds `DriverProfilePostgresIT` and `DriverConcurrencyPostgresIT` on isolated PostgreSQL 15.13 Testcontainers. They exercise real HTTP/security/JPA for bodyless profile creation, strict status commands, scoped admin paging, current KYC/GPLX and Clock boundaries, actual unique conflict, P05→P06→P07 flow, rollback/after-commit privacy, plus actual advisory/row-lock contention and retry. Concurrency fixtures use bounded gates and confirm database waits with `pg_blocking_pids`; no shared DB or production secrets are used. Focused command:

```powershell
.\mvnw.cmd -B '-Dit.test=DriverProfilePostgresIT,DriverConcurrencyPostgresIT' verify -Ppostgres-it
```

The P07 current eligibility contract and F2 boundary are described in [14 — Driver profile and eligibility](14_DRIVER_PROFILE_ELIGIBILITY.md). [P07-FIX-01 review](reviews/P07_FIX_01_REVIEW.md) APPROVED P07 and closed R1 after reviewer 126/126, packaging/health and the same HTTP probe before/after. Keep whitespace legacy fixtures isolated; never seed them into a local/shared runtime DB. Reports are preserved as history.

The packaging probe builds in a temporary copy and checks that `application-local.properties`, a private-key-shaped file, fake local/bootstrap/document markers, storage root path and test-only Boot root helper are absent from the executable JAR. It skips tests in that isolated copy; the full verification is the preceding command. The full Failsafe suite also runs the actual Boot `JarLauncher` root probe using a temporary JAR copy and different CWD.

## Local application database

The application uses `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. Runtime defaults are `spring.jpa.hibernate.ddl-auto=validate`, `spring.jpa.open-in-view=false`, `spring.jpa.show-sql=false`, Hibernate JDBC error/warning logging disabled, `spring.sql.init.mode=never`, and Flyway disabled. Raw JDBC exception details can include submitted email/phone, so application conflict logs retain trace and allowlisted constraint only. Ordinary startup validates a database that already has the expected schema; it does not create or alter tables. JWT issuer, audience, TTL, skew, and matching RSA keys are required at startup. Issuer is an exact JWT StringOrURI identifier and is not restricted to an HTTP URL. There is no generated-key fallback.

For a **new, disposable, local-only database**, Flyway can be explicitly enabled to apply `classpath:db/migration/function1`. Do not use that baseline on a shared database or one that already has application tables; coordinate shared migration history and ordering with the database leader.

```powershell
$env:DB_URL = 'jdbc:postgresql://localhost:5432/carrental_local'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = '<local-only-password>'
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.flyway.enabled=true"
```

Once the isolated schema has been created, ordinary local starts can omit the Flyway override. If no Flyway schema exists, `ddl-auto=validate` intentionally prevents startup.

`config/application-local.properties.example` contains environment-variable references only. Copy it to `config/application-local.properties` for local profile settings; the copy is Git-ignored and Maven excludes `application-local.properties` from resources/JARs. Provision the keypair under the ignored `config/keys/` directory, or point at files mounted elsewhere. The command below does not overwrite a file already present:

```powershell
if (-not (Test-Path 'config/application-local.properties')) {
    Copy-Item 'config/application-local.properties.example' 'config/application-local.properties'
}
```

For a disposable development keypair, from the repository root:

```powershell
New-Item -ItemType Directory -Path 'config/keys' -Force | Out-Null
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out 'config/keys/private_key.pem'
openssl pkey -in 'config/keys/private_key.pem' -pubout -out 'config/keys/public_key.pem'
$env:JWT_PRIVATE_KEY_LOCATION = ([System.Uri](Resolve-Path 'config/keys/private_key.pem').Path).AbsoluteUri
$env:JWT_PUBLIC_KEY_LOCATION = ([System.Uri](Resolve-Path 'config/keys/public_key.pem').Path).AbsoluteUri
```

The private file must be PKCS#8 PEM; the public file must be SubjectPublicKeyInfo PEM. The application checks RSA size and that both keys match. Do not put either file under `src/main/resources`. Protect and provision production private keys outside source control; never copy real key contents into this repository or a report.

Set `JWT_ISSUER`, `JWT_AUDIENCE`, and, if needed, `JWT_ACCESS_TOKEN_TTL` / `JWT_CLOCK_SKEW` in the current PowerShell process or a local secret/configuration manager. The example defaults `PT30M` TTL, `PT30S` skew, BCrypt strength `10`, and registration minimum `8` code points as configurable development baselines. Password input is limited to 72 UTF-8 bytes for BCrypt. `CORS_ALLOWED_ORIGINS` is a comma-separated exact-origin allowlist; an empty value denies cross-origin browser calls. These defaults do not represent production decisions.

`BOOTSTRAP_ADMIN_ENABLED` defaults to `false`. When explicitly enabled for an isolated local database, set full name/email/phone/password through environment variables. An existing ACTIVE ADMIN with the normalized email is left unchanged; an existing customer, locked admin, or conflicting phone fails startup without promotion/unlock/reset.

Customer administration limits are configurable with `CUSTOMER_DEFAULT_PAGE_SIZE` (20), `CUSTOMER_MAX_PAGE_SIZE` (100), `CUSTOMER_STATUS_REASON_MAX_LENGTH` (500), and `CUSTOMER_STATUS_LOCK_TIMEOUT_MS` (5000). Defaults and their validation are described in [P04](11_CUSTOMER_PROFILE_ADMIN.md). CORS methods include PATCH; configured origins remain exact and credentials remain disabled.

For P05, `APP_DOCUMENT_STORAGE_ENABLED` defaults to `false`. Disabled storage creates no directory and authorized uploads/downloads return503; list/detail continue to use PostgreSQL. An enabled root must be an existing absolute directory outside the repository, application artifact tree and public/static resources. `StorageRootPolicy` resolves file/standard-JAR/Boot-nested locations to the native physical artifact using the Boot `NestedLocation` parser where needed; it protects the artifact,parent,nearest build/repository tree and fails closed on unsupported/provider-mismatch paths. [P05-FIX-02 review](reviews/P05_FIX_02_REVIEW.md) approved P05 after 87/87,packaging/health and same-helper Boot comparison; R3 CLOSED. Keep actual-JAR regressions when upgrading Boot. The app does not create a root or change ACLs; the example contains no real path or secret.

Upload caps/config and P05 behavior stay as documented above. P01–P08 are APPROVED after [P08 review](reviews/P08_REVIEW.md), reviewer 137/137/packaging/Boot/health/probe. Run the complete regression suite and packaging probe with:

```powershell
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

P01–P09 are APPROVED after [P09-FIX-01 review](reviews/P09_FIX_01_REVIEW.md), reviewer 144/144/packaging/Boot/health/probe. P10 was CHANGES_REQUESTED; P10-FIX-01 has synchronized OpenAPI/handoff and regressions with the approved runtime. Its `clean verify -Ppostgres-it` passed 150/150 (42 Surefire + 108 Failsafe), and packaging probe passed. P10-FIX-01 is READY_FOR_REVIEW; R1/R2 still await reviewer confirmation. See the [fix report](reports/P10_FIX_01_REPORT.md), [P10 report](reports/P10_REPORT.md), and [handoff](17_FUNCTION_1_HANDOFF.md). Exact decimal app JsonMapper, strict integer tokens, banking/FK and counter/locking regressions remain covered; synthetic fixtures are not full F3/F4 integration. Keep logs in TEMP and all resources isolated; do not use a shared DB.

The profile file is external to the classpath. When running the JAR from another directory, provide its location explicitly:

```powershell
java -jar 'C:/path/to/carrental-be-0.0.1-SNAPSHOT.jar' `
    --spring.profiles.active=local `
    --spring.config.additional-location='file:C:/path/to/SBA301_RentCar/config/'
```

Keep the trailing `/` and never store credentials in the example or repository. `SERVER_PORT` sets the HTTP port (default `8080`); `APP_TIME_ZONE` configures the `Clock` bean (default `Asia/Ho_Chi_Minh`).

## Run and health check

```powershell
.\mvnw.cmd spring-boot:run
```

With the configured PostgreSQL schema, JWT issuer/audience, key files and CORS allowlist available, the app listens on port `8080`. In another PowerShell window:

```powershell
Invoke-WebRequest 'http://127.0.0.1:8080/api/health' | Select-Object StatusCode, Headers, Content
```

The endpoint returns HTTP 200 and `data.status=UP`; it reports that the web application is running. Schema validation is a separate startup check. It does not mean that security, storage, or other services are healthy.
