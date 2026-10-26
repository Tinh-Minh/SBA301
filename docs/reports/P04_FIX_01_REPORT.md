# P04-FIX-01 report — DTO allowlist and PostgreSQL lock timeout

**Status:** `READY_FOR_REVIEW`  
**Date:** 2026-10-13  
**Repository / branch / HEAD:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar` / `BE` / `2fe712eed12a2af3b61f0a5311bdd3901f614029`

P04 findings R1 and R2 are addressed and have regression evidence. P01–P03 remain APPROVED; P04 is awaiting a reviewer and is not self-approved. P05 has not started. No commit/push, branch change, shared database connection or schema change was made.

## 1. R1 — request-only allowlist and private presence state

Jackson 3 inferred writable private presence fields from the DTO's public `isXPresent()` JavaBean getters. The DTOs now expose parser state through non-bean methods (`fullNameWasProvided`, `dateOfBirthWasProvided`, `addressWasProvided`, `statusWasProvided`, `reasonWasProvided`) and use explicit JSON setters for the allowed request fields. This prevents a JSON property named `fullNamePresent`/`statusPresent` from binding to the internal flags; it reaches the strict `@JsonAnySetter` and is rejected. The service still uses presence state to distinguish omitted from explicit null.

The HTTP/PostgreSQL regression matrix exercises each profile/status presence key with true, false, null and wrong-shaped values, keys combined with allowed values, both flag/duplicate orderings, duplicate allowed keys with null, and unknown fields interleaved with repeated allowed values. The reviewer payload that previously cleared DOB is rejected. Internal/helper/unknown keys return 400 `INVALID_REQUEST`; ordinary missing/invalid business values remain their expected validation errors. Every rejected profile/status input is checked against the full customer row including audit columns. The status tests also capture logs and assert rejected commands emit no after-commit change log or request sentinels.

Existing controls still pass: omitted profile fields are unchanged, explicit null clears only nullable fields, a normal single-key PATCH updates its row, valid status lock/unlock and no-op work, and the existing CUSTOMER-forbidden admin checks remain in the suite.

## 2. R2 — classify only the real advisory-lock timeout

`CustomerStatusLock.acquire()` now catches `SQLException` only around execution of `pg_advisory_xact_lock(?)`. If and only if `SQLException.getSQLState()` equals named PostgreSQL state `55P03` (`lock_not_available`), it raises Spring `CannotAcquireLockException` with the original SQL exception as cause. Other SQLStates are rethrown to Spring's normal JDBC translation. The existing safe handler maps the typed lock failure to 503 `DEPENDENCY_UNAVAILABLE` and logs only trace plus exception type. There is no message-text matching or generic `DataAccessException`/`UncategorizedSQLException` conversion. The production advisory lock key is exposed as a named constant so tests and future status writers use the exact shared namespace.

The new integration test uses a second real PostgreSQL connection with auto-commit disabled to acquire the production transaction-level advisory key, and confirms the application's contending backend PID differs from the blocker. With the test-only lock timeout configured at 350 ms:

1. A direct transactional call to the real lock component times out; it is `CannotAcquireLockException` whose cause is `SQLException` with SQLState `55P03`.
2. While the blocker still holds the lock, a real authenticated HTTP status command returns 503 `DEPENDENCY_UNAVAILABLE`, with body/header trace equality. The target's complete row and audit fields stay unchanged; logs contain a safe dependency event but no success event, SQL state/query, or reason marker.
3. The blocker transaction is rolled back in `finally` and closed. Retrying the same HTTP command returns 200, changes status and DB `updated_at`, and emits the expected after-commit metadata log without the reason marker.

The pre-existing test that injects `CannotAcquireLockException` is retained as a separate handler regression and is not counted as evidence for the real PostgreSQL path. A unit test asserts only SQLState `55P03` is classified as lock unavailable (`23514`, `40001`, missing state and null are not).

## 3. Files changed

**Runtime code and tests:**

- `src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java` — renamed presence/helper methods to avoid Jackson JavaBean introspection of internal state.
- `src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java` — same strict presence-state protection for status/reason.
- `src/main/java/com/carrental/service/impl/CustomerServiceImpl.java` — uses the non-bean presence methods; business semantics unchanged.
- `src/main/java/com/carrental/repository/CustomerStatusLock.java` — narrowly translate PostgreSQL `55P03`, preserve cause, expose production namespace key and centralize the exact SQLState predicate.
- `src/test/java/com/carrental/CustomerManagementPostgresIT.java` — HTTP internal-key matrix/full-row snapshots and real two-connection PostgreSQL timeout/rollback/retry test; requests have bounded timeouts.
- `src/test/java/com/carrental/repository/CustomerStatusLockTest.java` — regression that non-lock SQLStates are not classified as lock unavailable.

**Documentation/status:**

- Updated `AGENTS.md`, `README.md`, `docs/03_FUNCTION_1_API.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/10_AUTH_SECURITY.md`, `docs/11_CUSTOMER_PROFILE_ADMIN.md`, `docs/README.md`, and `docs/IMPLEMENTATION_STATUS.md`.
- Added this report. The earlier `docs/reports/P04_REPORT.md`, `docs/reviews/P04_REVIEW.md`, and prompts are preserved as history/source.
- No changes to `docs/reference/`, POM/dependencies, schema/entity/migration, security roles, admin policy, or P05 code.

## 4. Commands and verification results

Environment: Java `21.0.8`, Maven Wrapper, Docker Desktop server `28.5.2`; PostgreSQL `15.13-alpine` Testcontainers. Maven commands used `JAVA_HOME=C:\Program Files\Java\jdk-21`.

| Command | Result |
|---|---|
| `.\mvnw.cmd -B '-Dtest=CustomerStatusLockTest' '-Dit.test=CustomerManagementPostgresIT#profilePatchRejectsNullEmptyUnknownDuplicateMalformedAndCoercedJsonWithoutMutation+statusCommandValidatesReasonAndEnumRejectsMassAssignmentAndDuplicateProperties+realPostgresAdvisoryLockTimeoutReturns503AndRetrySucceedsAfterBlockerRollback' '-Ppostgres-it' verify` | **PASS**, 1 Surefire + 3 selected PostgreSQL integration tests; 0 failures/errors/skips |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS**, `BUILD SUCCESS`, 56.007 s |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\scripts\verify-local-config-packaging.ps1` | **PASS**; see probe evidence below |

Earlier focused attempts, reported to distinguish test iteration from the final result:

- The first PowerShell invocation passed `-Dtest=... -Dit.test=...` unquoted; PowerShell/Maven split the second property and Maven stopped with `Unknown lifecycle phase ".test=CustomerManagementPostgresIT"` before running tests. The successful focused command above quotes each property argument.
- The first correctly quoted focused build ran `CustomerManagementPostgresIT` (17 tests), but two new assertions incorrectly expected `INVALID_REQUEST` for all validation inputs. The implementation returned the existing `VALIDATION_ERROR` for field-level errors. Assertions were corrected to check HTTP 400 for the broad validation matrix and exact `INVALID_REQUEST` for structural/internal/unknown JSON keys. The corrected focused run and full run then passed.

Full clean verify final reports:

| Suite | Tests | Failures | Errors | Skipped | Result |
|---|---:|---:|---:|---:|---|
| `PlatformHttpTest` (P01) | 13 | 0 | 0 | 0 | PASS |
| `JwtConfigurationTest` (P03) | 4 | 0 | 0 | 0 | PASS |
| `CustomerPropertiesTest` (P04) | 1 | 0 | 0 | 0 | PASS |
| `CustomerStatusLockTest` (P04) | 1 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` (P03/PostgreSQL) | 14 | 0 | 0 | 0 | PASS |
| `CustomerManagementPostgresIT` (P04/PostgreSQL + HTTP) | 17 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` (P02/PostgreSQL) | 7 | 0 | 0 | 0 | PASS |
| **Total** | **57** | **0** | **0** | **0** | **PASS** |

The P04 tests ran against disposable Testcontainers databases and the unchanged Function 1 migration baseline. No production/shared credentials or real token/key material were used. Full verify also ran the HTTP health regression while the isolated database was active.

During the first focused test iteration, the added assertions expected every malformed request (including null required fields and other validation cases) to use `INVALID_REQUEST`. The existing contract correctly returns `VALIDATION_ERROR` for field validation; the tests were narrowed to assert `INVALID_REQUEST` for structural/internal/unknown properties while retaining HTTP 400 assertions for validation cases. The corrected focused run and final clean verify both pass. No production behavior was weakened to resolve that test mismatch.

### Health and trace observed in full verification

`Function1PostgresIT` started the application on an ephemeral local HTTP port (observed port `64308`) with PostgreSQL 15.13 Testcontainers and called `GET /api/health`. It returned HTTP 200, JSON envelope, `data.status=UP`; the test asserted `traceId` equals `X-Request-ID` and the UTF-8 message `Thành công`. Trace observed: `8c0446e8-3038-4050-9296-9d3c1a1c23c6`.

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"3069cdd4-845e-4018-902f-a7398aeb7ad2"}
```

PowerShell redirected output rendered the Vietnamese message as `Th�nh c�ng` in the `LIVE_HEALTH_JSON` diagnostic line; that console rendering is not treated as the response text. The HTTP assertion against the decoded response passed.

The real PostgreSQL timeout response trace observed in the full run was `ac60bcf8-d79f-4dca-8acd-a9d1d416ea9a`; the successful retry trace was `c3ccf236-71f1-45b2-bf9b-c83b51ccde69`. Integration assertions verified each response's body/header trace equality.

### Packaging probe

The required script completed `BUILD SUCCESS` with:

```text
PROBE_BUILD=PASS
LOCAL_CONFIG_ENTRY_PACKAGED=False
FAKE_LOCAL_CONFIG_MARKER_PACKAGED=False
FAKE_PRIVATE_KEY_MARKER_PACKAGED=False
FAKE_BOOTSTRAP_SECRET_MARKER_PACKAGED=False
PRIVATE_KEY_ENTRY_PACKAGED=False
```

As designed, the packaging probe uses an isolated temporary copy and skips tests in that packaging-only build; it does not replace the preceding full 57-test verification.

## 5. Schema/reference hashes

No source reference or schema/migration file was modified. Current SHA-256 evidence:

| File | SHA-256 |
|---|---|
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

## 6. Remaining limits

- No shared/production database or production key/origin configuration was accessed or verified; all DB evidence is from disposable PostgreSQL Testcontainers.
- No change was made to the leader schema/migration; durable status/reason history remains absent by design and P05 remains not started.
- The package-only probe skips tests inside its temporary build; the separate full clean verify ran all 57 tests with zero skipped.
- Compiler still prints the existing Jackson deprecation note for `UpdateProfileRequest`; it does not fail compilation or tests, and no dependency was upgraded for this fix.

## 7. Git status

- Branch remains `BE`; HEAD remains `2fe712eed12a2af3b61f0a5311bdd3901f614029` (same as origin/BE at start).
- Final `git status --short --branch` begins `## BE...origin/BE` and lists repository paths as untracked. This workspace was already untracked before this task, so `git diff --stat` and `git diff --cached --stat` are empty and do not describe the worktree changes.
- No files were staged. No commit/push was made. The complete final `git ls-files --others --exclude-standard` list follows; it includes the original untracked project plus this fix report.

- ``.gitignore``
- ``.mvn/wrapper/maven-wrapper.jar``
- ``.mvn/wrapper/maven-wrapper.properties``
- ``AGENTS.md``
- ``README.md``
- ``config/application-local.properties.example``
- ``docs/01_FUNCTION_1_SCOPE.md``
- ``docs/02_FUNCTION_1_ARCHITECTURE.md``
- ``docs/03_FUNCTION_1_API.md``
- ``docs/04_DATABASE_REVIEW.md``
- ``docs/05_BACKEND_CONVENTIONS.md``
- ``docs/06_IMPLEMENTATION_PLAN.md``
- ``docs/07_DECISIONS_AND_OPEN_QUESTIONS.md``
- ``docs/08_PROMPT_ROADMAP.md``
- ``docs/09_FUNCTION_1_PERSISTENCE.md``
- ``docs/10_AUTH_SECURITY.md``
- ``docs/11_CUSTOMER_PROFILE_ADMIN.md``
- ``docs/IMPLEMENTATION_STATUS.md``
- ``docs/LOCAL_DEVELOPMENT.md``
- ``docs/README.md``
- ``docs/prompts/P01_FIX_01.md``
- ``docs/prompts/P01_FOUNDATION.md``
- ``docs/prompts/P02_DATABASE_FOUNDATION.md``
- ``docs/prompts/P03_AUTH_SECURITY.md``
- ``docs/prompts/P03_FIX_01.md``
- ``docs/prompts/P04_CUSTOMER_PROFILE_ADMIN.md``
- ``docs/prompts/P04_FIX_01.md``
- ``docs/reference/BACKEND_CONVENTIONS.md``
- ``docs/reference/MENTOR_NOTES.md``
- ``docs/reference/README.md``
- ``docs/reference/car_rental_conceptual.drawio``
- ``docs/reference/schema.sql``
- ``docs/reports/P01_FIX_01_REPORT.md``
- ``docs/reports/P01_REPORT.md``
- ``docs/reports/P02_REPORT.md``
- ``docs/reports/P03_FIX_01_REPORT.md``
- ``docs/reports/P03_REPORT.md``
- ``docs/reports/P04_FIX_01_REPORT.md``
- ``docs/reports/P04_REPORT.md``
- ``docs/reviews/P01_FIX_01_REVIEW.md``
- ``docs/reviews/P01_REVIEW.md``
- ``docs/reviews/P02_REVIEW.md``
- ``docs/reviews/P03_FIX_01_REVIEW.md``
- ``docs/reviews/P03_REVIEW.md``
- ``docs/reviews/P04_REVIEW.md``
- ``mvnw``
- ``mvnw.cmd``
- ``pom.xml``
- ``scripts/verify-local-config-packaging.ps1``
- ``src/main/java/com/carrental/CarRentalApplication.java``
- ``src/main/java/com/carrental/config/ClockConfig.java``
- ``src/main/java/com/carrental/config/CustomerProperties.java``
- ``src/main/java/com/carrental/config/security/AdminBootstrapRunner.java``
- ``src/main/java/com/carrental/config/security/BootstrapAdminProperties.java``
- ``src/main/java/com/carrental/config/security/CorsProperties.java``
- ``src/main/java/com/carrental/config/security/JwtConfiguration.java``
- ``src/main/java/com/carrental/config/security/JwtKeyLoader.java``
- ``src/main/java/com/carrental/config/security/JwtKeyMaterial.java``
- ``src/main/java/com/carrental/config/security/JwtProperties.java``
- ``src/main/java/com/carrental/config/security/PasswordPolicyProperties.java``
- ``src/main/java/com/carrental/config/security/SecurityConfiguration.java``
- ``src/main/java/com/carrental/controller/AuthController.java``
- ``src/main/java/com/carrental/controller/CustomerController.java``
- ``src/main/java/com/carrental/controller/HealthController.java``
- ``src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java``
- ``src/main/java/com/carrental/dto/request/auth/LoginRequest.java``
- ``src/main/java/com/carrental/dto/request/auth/RegisterRequest.java``
- ``src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java``
- ``src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java``
- ``src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java``
- ``src/main/java/com/carrental/dto/response/ApiResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerAdminResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerProfileResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java``
- ``src/main/java/com/carrental/dto/response/FieldErrorResponse.java``
- ``src/main/java/com/carrental/dto/response/HealthResponse.java``
- ``src/main/java/com/carrental/dto/response/PageResponse.java``
- ``src/main/java/com/carrental/dto/response/TokenResponse.java``
- ``src/main/java/com/carrental/entity/BankAccount.java``
- ``src/main/java/com/carrental/entity/Customer.java``
- ``src/main/java/com/carrental/entity/Driver.java``
- ``src/main/java/com/carrental/entity/UserDocument.java``
- ``src/main/java/com/carrental/entity/Voucher.java``
- ``src/main/java/com/carrental/entity/base/AuditedEntity.java``
- ``src/main/java/com/carrental/entity/base/BaseEntity.java``
- ``src/main/java/com/carrental/enums/CustomerStatus.java``
- ``src/main/java/com/carrental/enums/DiscountType.java``
- ``src/main/java/com/carrental/enums/DocumentVerifyStatus.java``
- ``src/main/java/com/carrental/enums/DriverStatus.java``
- ``src/main/java/com/carrental/enums/KycStatus.java``
- ``src/main/java/com/carrental/enums/Role.java``
- ``src/main/java/com/carrental/enums/UserDocumentType.java``
- ``src/main/java/com/carrental/enums/VoucherStatus.java``
- ``src/main/java/com/carrental/exception/AppException.java``
- ``src/main/java/com/carrental/exception/ErrorCode.java``
- ``src/main/java/com/carrental/exception/GlobalExceptionHandler.java``
- ``src/main/java/com/carrental/mapper/CustomerMapper.java``
- ``src/main/java/com/carrental/repository/BankAccountRepository.java``
- ``src/main/java/com/carrental/repository/CustomerRepository.java``
- ``src/main/java/com/carrental/repository/CustomerStatusLock.java``
- ``src/main/java/com/carrental/repository/DriverRepository.java``
- ``src/main/java/com/carrental/repository/UserDocumentRepository.java``
- ``src/main/java/com/carrental/repository/VoucherRepository.java``
- ``src/main/java/com/carrental/security/AccountUserDetails.java``
- ``src/main/java/com/carrental/security/ApiAccessDeniedHandler.java``
- ``src/main/java/com/carrental/security/ApiAuthenticationEntryPoint.java``
- ``src/main/java/com/carrental/security/CurrentAccount.java``
- ``src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java``
- ``src/main/java/com/carrental/security/CustomerUserDetailsService.java``
- ``src/main/java/com/carrental/security/InvalidCurrentAccountException.java``
- ``src/main/java/com/carrental/security/SecurityErrorResponses.java``
- ``src/main/java/com/carrental/service/AuthService.java``
- ``src/main/java/com/carrental/service/CustomerService.java``
- ``src/main/java/com/carrental/service/CustomerStatusChangeLogger.java``
- ``src/main/java/com/carrental/service/impl/AdminBootstrapService.java``
- ``src/main/java/com/carrental/service/impl/AuthServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/CustomerServiceImpl.java``
- ``src/main/java/com/carrental/validation/PasswordPolicyValidator.java``
- ``src/main/java/com/carrental/validation/ValidPassword.java``
- ``src/main/java/com/carrental/web/RequestTraceFilter.java``
- ``src/main/resources/application.properties``
- ``src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql``
- ``src/test/java/com/carrental/AuthSecurityPostgresIT.java``
- ``src/test/java/com/carrental/AuthSecurityTestFixtures.java``
- ``src/test/java/com/carrental/CustomerManagementPostgresIT.java``
- ``src/test/java/com/carrental/CustomerPropertiesTest.java``
- ``src/test/java/com/carrental/Function1PostgresIT.java``
- ``src/test/java/com/carrental/JwtConfigurationTest.java``
- ``src/test/java/com/carrental/PlatformHttpTest.java``
- ``src/test/java/com/carrental/PlatformTestFixtures.java``
- ``src/test/java/com/carrental/TestJwtKeys.java``
- ``src/test/java/com/carrental/repository/CustomerStatusLockTest.java``
