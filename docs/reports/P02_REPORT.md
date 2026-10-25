# P02 report — Function 1 persistence

**Status: READY_FOR_REVIEW** (2026-10-13). P02 is implemented on branch `BE`; no P03 work, commit, push, deployment, shared-database migration, or Supabase SQL was performed.

## Result

Implemented persistence for `customers`, `user_documents`, `drivers`, `bank_accounts`, and `vouchers` according to `docs/reference/schema.sql`. The final required command `.\mvnw.cmd -B clean verify -Ppostgres-it` passed. Surefire reports **13 tests, 0 failures, 0 errors, 0 skipped**; Failsafe reports **7 PostgreSQL integration tests, 0 failures, 0 errors, 0 skipped**. The packaging probe also passed.

The temporary test database ran PostgreSQL **15.13** in Testcontainers **2.0.5**. Flyway applied V1 to an empty schema; Flyway validation and Hibernate `ddl-auto=validate` both passed. The checks observed exactly five Function 1 business tables plus `flyway_schema_history`, four update triggers, the named indexes, RLS on exactly the five tables, no policies, and no `bank_accounts.updated_at` column. A second Flyway migrate/validate preserved an inserted marker row and did not apply another migration.

## Initial repository and environment

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; Windows 11 x64.
- Before switching, the P01-FIX-01 branch was `codex/function-1-p01-fix-01`. Its HEAD and `BE` were both `2fe712eed12a2af3b61f0a5311bdd3901f614029`. The working tree contained pre-existing untracked files; I did not stage, stash, reset, or clean them. I then ran `git switch BE` and verified the existing untracked files remained.
- Final branch remains `BE`, at the same HEAD. Final status is `## BE...origin/BE` with untracked files only; `git diff --stat` is empty because this working tree's project files are not tracked by the branch. The complete untracked list is below.
- Java on `PATH`: Oracle JDK **21.0.8**. Maven Wrapper: **3.9.11**. Docker Engine: **28.5.2**. Maven requires `JAVA_HOME`; it was set for each Maven command to `C:\Program Files\Java\jdk-21`. Calling `mvnw.cmd -v` without that process variable returned the wrapper's `JAVA_HOME not found` error; the same command with the variable set passed.
- P01 was previously approved in `docs/reviews/P01_FIX_01_REVIEW.md` (13/13 tests and packaging review); P01 sources and review history were preserved.

## Implementation and files

### Added for P02

- `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` — isolated Function 1 baseline, explicit DDL, functions, indexes, four triggers, and five RLS enables. No other schema tables, policy, grant, or `IF NOT EXISTS` shortcut.
- `src/main/java/com/carrental/entity/base/BaseEntity.java`, `AuditedEntity.java` — identity and DB-generated audit mapping. `BankAccount` only inherits `createdAt`; audited entities map both generated timestamps with Hibernate `@Generated`.
- Entity files: `Customer.java`, `UserDocument.java`, `Driver.java`, `BankAccount.java`, and `Voucher.java`.
- Enum files: `Role.java`, `CustomerStatus.java`, `KycStatus.java`, `UserDocumentType.java`, `DocumentVerifyStatus.java`, `DriverStatus.java`, `DiscountType.java`, and `VoucherStatus.java`. Enum values use string persistence and match the schema CHECK sets.
- Repository files: `CustomerRepository.java`, `UserDocumentRepository.java`, `DriverRepository.java`, `BankAccountRepository.java`, and `VoucherRepository.java`. Queries include owner filters, paged owner document lists, lower-case email operations, and caller-transaction pessimistic locks for customer/voucher rows.
- `src/test/java/com/carrental/Function1PostgresIT.java` — seven Testcontainers PostgreSQL integration tests, named `*IT` for Failsafe.
- `docs/09_FUNCTION_1_PERSISTENCE.md` — field map, schema constraints, audit, migration operation, repository contract, and outstanding security/business boundaries.
- `README.md` — repository entry point and verification commands.

### Updated for P02

- `pom.xml` — Boot-managed JPA, PostgreSQL, Flyway, Testcontainers dependencies and the `postgres-it` Failsafe profile.
- `src/main/resources/application.properties` — external datasource placeholders, `ddl-auto=validate`, no open-in-view or SQL init, and Flyway disabled by default at the Function 1 location.
- `config/application-local.properties.example` — environment-variable references only; no credential values.
- `src/test/java/com/carrental/PlatformHttpTest.java` — excludes JPA/Flyway/datasource auto-configuration from P01 HTTP regression and checks external Clock config without a database.
- `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/README.md`, `docs/08_PROMPT_ROADMAP.md`, and `docs/LOCAL_DEVELOPMENT.md` — current P02 scope/status and safe local instructions.

Existing P01 files and the original `docs/reference/` inputs were left in place; no file under `docs/reference/` was edited. The P01 response/error/trace/health code was not expanded with business or authentication endpoints.

## Schema and mapping decisions

All five table/column mappings, nullability, defaults, identity keys, relations, lengths, numeric precision/scale, enum values, unique/check constraints, and F1 indexes/triggers follow the leader SQL. There are **no intended schema differences**. In particular, `bank_accounts` has only `created_at`; no `updated_at` field, column, or trigger was added. RLS is enabled on the five tables without inventing policies or grants.

The eight enums are `Role (CUSTOMER, ADMIN)`, `CustomerStatus (ACTIVE, LOCKED)`, `KycStatus (NONE, PENDING, VERIFIED, REJECTED)`, `UserDocumentType (CITIZEN_ID, DRIVER_LICENSE, PASSPORT)`, `DocumentVerifyStatus (PENDING, APPROVED, REJECTED)`, `DriverStatus (PENDING, ACTIVE, SUSPENDED)`, `DiscountType (PERCENT, FIXED)`, and `VoucherStatus (ACTIVE, INACTIVE)`. Enum values are VARCHAR strings; no PostgreSQL native enum or ordinal persistence was introduced.

Hibernate version managed by Boot in the verified build was **7.2.24.Final**; Flyway was **11.14.1**. Generated audit values are excluded from SQL INSERT/UPDATE writes and are read back by Hibernate. Integration checks cover generated audit after insert and ORM update, trigger updates on each audited table, stable `created_at`, defaults, and `vn_now()` while the session timezone is UTC. Bank audit columns were checked against PostgreSQL metadata.

## Commands and observed results

| Command / check | Result |
|---|---|
| `java -version` | PASS — Java 21.0.8 |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -v` | PASS — Maven Wrapper 3.9.11, Java 21.0.8, Windows 11 |
| `docker version --format 'Docker server {{.Server.Version}}'` | PASS — Docker server 28.5.2 |
| `.\mvnw.cmd -B -DskipTests test-compile` | PASS — main and test sources compiled |
| `.\mvnw.cmd -B clean verify` | PASS — P01 suite 13/13, 0 skipped; package built |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` (final run) | PASS — Surefire 13/13; Failsafe 7/7; total 20, 0 failures/errors/skips; `BUILD SUCCESS` |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\scripts\verify-local-config-packaging.ps1` | PASS — temporary executable JAR built; local config entry and fake marker both reported `False` for packaged |

Reports: `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml` and `target/failsafe-reports/TEST-com.carrental.Function1PostgresIT.xml`.

The PostgreSQL integration assertions cover: empty-schema migration and second migrate; JPA schema validation; all five entities' generated IDs and value round trips; dates, nullable fields, numeric values and leading-zero bank account strings; defaults and audit; every enum CHECK family and required FK/unique/check behaviors; RLS/index/trigger metadata; owner-scoped detail and page totals with two customers; exact approved-document lookup; and transactional customer/voucher row locks. Constraint failures run in separate rollback transactions.

The required full command was first run while shaping the tests: an initial run exposed two incorrect test expectations, which were corrected; one subsequent container start timed out. A packaging-probe invocation without `JAVA_HOME` also failed fast with the wrapper's environment error. The final full clean verification and the packaging probe both completed successfully after setting the process-local JDK path. These intermediate attempts did not change application behavior or touch a shared database.

### Live health result against the test database

`Function1PostgresIT` starts the actual Spring Boot embedded Tomcat server on a random port while Flyway and Hibernate are connected to the same PostgreSQL 15.13 Testcontainers database. Its HTTP client called `GET /api/health` and observed HTTP **200**, JSON content type, and the successful response below. The UUID is request-specific; the test asserted that the JSON `traceId` equals response header `X-Request-ID`.

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"7c8a69b1-8c61-44b6-97de-b0ae429e15a4"}
```

The captured request's `X-Request-ID` header had the same value, `7c8a69b1-8c61-44b6-97de-b0ae429e15a4`.

This health response is evidence that the web app responded. Flyway migration and Hibernate schema validation were separately observed at startup; health alone is not evidence of database validation.

## Limitations and next step

- No shared/local Supabase database was connected or migrated. The V1 file is an isolated new-database baseline; leader coordination is required before any shared-database history or deployment plan.
- PostgreSQL test runs as database owner, which bypasses RLS; no CUSTOMER/ADMIN policies or grants exist. Runtime authorization, Security/JWT/CORS, registration, KYC, driver eligibility, document storage, bank-account changes, voucher APIs, and quota concurrency remain future prompts.
- The app requires a PostgreSQL datasource at runtime after P02; P01 regression tests explicitly exclude DB auto-configuration so the HTTP foundation remains independently verifiable.
- P03 has not been started. Stop here for review; do not mark P02 approved.

## Final Git status

Branch: `BE`, HEAD `2fe712eed12a2af3b61f0a5311bdd3901f614029`; it matches `origin/BE`. `git diff --stat` is empty. `git status --short --branch` shows only `??` entries; all project files below are untracked in this working tree, including pre-existing P01 and reference files. No file was staged.

```text
.gitignore
.mvn/wrapper/maven-wrapper.jar
.mvn/wrapper/maven-wrapper.properties
AGENTS.md
README.md
config/application-local.properties.example
docs/01_FUNCTION_1_SCOPE.md
docs/02_FUNCTION_1_ARCHITECTURE.md
docs/03_FUNCTION_1_API.md
docs/04_DATABASE_REVIEW.md
docs/05_BACKEND_CONVENTIONS.md
docs/06_IMPLEMENTATION_PLAN.md
docs/07_DECISIONS_AND_OPEN_QUESTIONS.md
docs/08_PROMPT_ROADMAP.md
docs/09_FUNCTION_1_PERSISTENCE.md
docs/IMPLEMENTATION_STATUS.md
docs/LOCAL_DEVELOPMENT.md
docs/README.md
docs/prompts/P01_FIX_01.md
docs/prompts/P01_FOUNDATION.md
docs/prompts/P02_DATABASE_FOUNDATION.md
docs/reference/BACKEND_CONVENTIONS.md
docs/reference/MENTOR_NOTES.md
docs/reference/README.md
docs/reference/car_rental_conceptual.drawio
docs/reference/schema.sql
docs/reports/P01_FIX_01_REPORT.md
docs/reports/P01_REPORT.md
docs/reports/P02_REPORT.md
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
mvnw
mvnw.cmd
pom.xml
scripts/verify-local-config-packaging.ps1
src/main/java/com/carrental/CarRentalApplication.java
src/main/java/com/carrental/config/ClockConfig.java
src/main/java/com/carrental/controller/HealthController.java
src/main/java/com/carrental/dto/response/ApiResponse.java
src/main/java/com/carrental/dto/response/FieldErrorResponse.java
src/main/java/com/carrental/dto/response/HealthResponse.java
src/main/java/com/carrental/dto/response/PageResponse.java
src/main/java/com/carrental/entity/BankAccount.java
src/main/java/com/carrental/entity/Customer.java
src/main/java/com/carrental/entity/Driver.java
src/main/java/com/carrental/entity/UserDocument.java
src/main/java/com/carrental/entity/Voucher.java
src/main/java/com/carrental/entity/base/AuditedEntity.java
src/main/java/com/carrental/entity/base/BaseEntity.java
src/main/java/com/carrental/enums/CustomerStatus.java
src/main/java/com/carrental/enums/DiscountType.java
src/main/java/com/carrental/enums/DocumentVerifyStatus.java
src/main/java/com/carrental/enums/DriverStatus.java
src/main/java/com/carrental/enums/KycStatus.java
src/main/java/com/carrental/enums/Role.java
src/main/java/com/carrental/enums/UserDocumentType.java
src/main/java/com/carrental/enums/VoucherStatus.java
src/main/java/com/carrental/exception/AppException.java
src/main/java/com/carrental/exception/ErrorCode.java
src/main/java/com/carrental/exception/GlobalExceptionHandler.java
src/main/java/com/carrental/repository/BankAccountRepository.java
src/main/java/com/carrental/repository/CustomerRepository.java
src/main/java/com/carrental/repository/DriverRepository.java
src/main/java/com/carrental/repository/UserDocumentRepository.java
src/main/java/com/carrental/repository/VoucherRepository.java
src/main/java/com/carrental/web/RequestTraceFilter.java
src/main/resources/application.properties
src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql
src/test/java/com/carrental/Function1PostgresIT.java
src/test/java/com/carrental/PlatformHttpTest.java
src/test/java/com/carrental/PlatformTestFixtures.java
```
