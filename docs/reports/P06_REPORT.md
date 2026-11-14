# P06 — Implementation report

**Status: READY_FOR_REVIEW.** P01–P05 remain APPROVED; P07 is NOT_STARTED. No commit/push, schema/reference edit, shared database connection, or P07 work was performed. Report date: 2026-10-14.

## 1. Initial repository and environment

- Working directory: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; HEAD and `origin/BE`: `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- The repository project was already untracked at task start (root `.gitignore`, `.mvn`, `AGENTS.md`, `README.md`, `config`, `docs`, wrappers, `pom.xml`, `scripts`, and `src`). No tracked or staged changes were present. Existing content was preserved; nothing was staged, reset, cleaned, stashed, committed, or pushed.
- Windows 11; Java `21.0.8`; Maven Wrapper `3.9.11`; Docker Engine `28.5.2` available. PostgreSQL checks used disposable Testcontainers PostgreSQL `15.13-alpine` databases.
- P05-FIX-02 review was APPROVED. U-11/U-12/U-13 and schema/reference constraints were read before implementation.

## 2. Implemented

- Added strict `PATCH /api/user-documents/{id}/review` request handling, exact state/reason rules, ADMIN ACTIVE authorization and transaction-time actor recheck.
- Reused the shared advisory lock before actor, owner, and document row locks. Owner discovery uses a scalar projection; owner and document are rechecked under ordered locks.
- Implemented U-13 approval metadata/date/image checks against stored private bytes, rejection without approval metadata/storage dependency, and exact `uq_user_doc_approved` + SQLState `23505` conflict translation.
- Added shared KYC precedence policy, review-time customer snapshot update in the same transaction, and owner/admin current KYC endpoints backed by a single aggregate projection and injected Clock.
- Added no-store responses and after-commit safe review logging. Regression checks cover rollback, trace correlation, sensitive value non-disclosure, lock timeout/retry, and bounded concurrency barriers.
- No database/entity/migration/schema changes were made. P05 submission/storage behavior remains unchanged.

## 3. Verification run

`JAVA_HOME` was set to `C:\Program Files\Java\jdk-21` for the Maven Wrapper commands.

| Command | Result |
|---|---|
| `.\mvnw.cmd -B -DskipTests test-compile` | PASS; production and test sources compiled |
| `.\mvnw.cmd -B '-Dtest=none' '-Dsurefire.failIfNoSpecifiedTests=false' '-Dit.test=UserDocumentReviewPostgresIT' -Ppostgres-it verify` | PASS; P06 HTTP/PostgreSQL integration suite 14/14 |
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | PASS; 105/105, 0 failures, 0 errors, 0 skipped |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` | PASS; `PROBE_BUILD=PASS`; all forbidden marker checks false |

Full verification breakdown: Surefire **36/36** (includes 4 `KycPolicyTest` tests); Failsafe **69/69** (includes 14 `UserDocumentReviewPostgresIT` tests). The prior P01–P05 regression set of 87 remains in the full run and passed. The dedicated P06 suite ran against real HTTP/JPA/PostgreSQL using synthetic accounts, temporary RSA test keys, generated images, an external temporary private root, and bounded barriers.

Packaging probe reported `LOCAL_CONFIG_ENTRY_PACKAGED=False`, local-config/private-key/bootstrap/document markers absent, storage-root path absent, and test Boot-root helper absent from the executable JAR.

### Iteration failures corrected before final verification

- PowerShell split an unquoted `-D...` property and Maven interpreted `.failIfNoSpecifiedTests=false` as a lifecycle phase. The focused command was rerun with quoted properties and passed.
- The first P06 test compile found a checked exception in an executor lambda. The multipart fixture is now constructed before dispatch.
- Early P06 test runs exposed test-fixture issues: attempting to reset a non-mock KYC transaction proxy, a DRIVER_LICENSE row missing the schema-required `license_class`, and an incorrect expectation that a rejected driver license changes identity KYC. The test harness was corrected; later runs passed. The rollback regression now fails in a transaction `beforeCommit` callback after the document and customer snapshot flushes.

## 4. HTTP, PostgreSQL, and concurrency evidence

P06 integration output on the final full run:

- Strict HTTP/auth: self-review 403, CUSTOMER 403, anonymous/locked actor 401; 19 invalid payload cases returned 400 with rows/files unchanged.
- Health was called over HTTP against the application context backed by PostgreSQL Testcontainers: **200**, `success=true`, `code=OK`, `data.status=UP`, empty errors, and response `traceId` equal to `X-Request-ID`.

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": {"status": "UP"},
  "errors": [],
  "traceId": "5644d822-cc49-4b62-8877-72b080eba043"
}
```

- Approval returned 200/APPROVED/VERIFIED; verifier/time and trace matched; files and unrelated account fields were unchanged. Rejection worked for a LOCKED owner with storage disabled and preserved files; repeat review returned 409.
- Approval checks: expiry yesterday 409, today 200; future dates and missing required back/metadata 409; missing stored evidence 500; disabled storage 503. Clock advanced one day changed current KYC VERIFIED→NONE without mutating document or customer snapshot.
- KYC precedence VERIFIED>PENDING>REJECTED>NONE, identity-only behavior, read-only current result, owner/admin scope, and locked target visibility passed.
- Same-document concurrent approve/reject: one 200 and one 409, one committed review event. Cross-owner duplicate approval race: one 200 and one 409. Same-owner forced precheck miss hit the real partial unique index at flush and mapped its exact conflict safely; loser remained PENDING and did not promote KYC.
- Actor locked after authentication was denied after lock/recheck with no document/KYC mutation. Review-vs-submission barrier serialized on owner row; submission remained 201/PENDING and KYC snapshot was retained.
- PostgreSQL owner-row lock timeout returned traced 503; no mutation, then retry after blocker release returned 200. Failure after document and customer flushes rolled both rows back, preserved files, returned safe 500, and emitted no success event.
- HTTP error responses were checked for trace envelope/header equality and sentinel/path non-disclosure. Captured log rendering includes throwable proxy output (causes/suppressed included by Logback rendering); sentinel document number/rejection values were absent.

## 5. Files touched by P06

### Backend

- `src/main/java/com/carrental/controller/CustomerController.java` — current KYC GET routes.
- `src/main/java/com/carrental/controller/UserDocumentController.java` — review PATCH route, strict query handling, no-store response.
- `src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java` — strict JSON allowlist and duplicate/type handling.
- `src/main/java/com/carrental/dto/response/KycSummaryResponse.java`, `UserDocumentReviewResponse.java` — KYC and review result contracts.
- `src/main/java/com/carrental/exception/ErrorCode.java` — self-review, terminal, prerequisite, and approved-duplicate codes.
- `src/main/java/com/carrental/repository/CustomerRepository.java`, `KycEvidenceProjection.java`, `UserDocumentRepository.java` — one-statement KYC aggregates, owner scalar projection, ordered pessimistic row locks.
- `src/main/java/com/carrental/service/DocumentReviewLogger.java`, `KycPolicy.java`, `KycService.java`, `impl/KycServiceImpl.java`, `UserDocumentService.java`, `impl/UserDocumentServiceImpl.java` — review/KYC policy and transaction behavior.

### Tests

- `src/test/java/com/carrental/KycPolicyTest.java`, `MutableTestClock.java` — deterministic policy/time tests.
- `src/test/java/com/carrental/UserDocumentReviewPostgresIT.java` — real PostgreSQL/HTTP/security/storage/concurrency regression.
- `src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java` — constructor/setup regression for review dependencies.

### Documentation

- Created `docs/13_DOCUMENT_REVIEW_KYC.md` and this report.
- Updated `AGENTS.md`, `README.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md`, and `docs/README.md`.

## 6. Schema/reference hashes

These hashes were captured after P06; the leader migration and five entities were not edited in this work.

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368618990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `src/main/java/com/carrental/entity/BankAccount.java` | `FA03F0D8330342EF595DE140BCFD0E475B0AE071AE5F1EDD32C21B4D96CE2B35` |
| `src/main/java/com/carrental/entity/Customer.java` | `F687C5212FE64E06D58729D13EE2CBB4D5CC8055D270BCDB22BFF51DF587A193` |
| `src/main/java/com/carrental/entity/Driver.java` | `9F92C965A075ADFE32EEA92FC562FDD092A0EBD1CEE14ADAA7606CB492AE6817` |
| `src/main/java/com/carrental/entity/UserDocument.java` | `B7B7BD665DC41994553EC9557CF8326EAE1263AD367F793EE8B2B3B0E2E7A006` |
| `src/main/java/com/carrental/entity/Voucher.java` | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |

## 7. Git state and remaining limits

- Final branch remains `BE`, HEAD remains `2fe712eed12a2af3b61f0a5311bdd3901f614029`, upstream remains `origin/BE`.
- Final `git status --short --branch` begins `## BE...origin/BE` and reports untracked root entries `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, and `src/`. `git diff --stat` and `git diff --cached --stat` are empty because the existing project tree was already untracked at task start. All implementation/docs remain untracked; the appendix below is the exact final 186-path `git ls-files --others --exclude-standard` inventory, including pre-existing files and this report. Do not interpret an empty `git diff --stat` as an empty implementation.
- No production/shared PostgreSQL was available or queried. Windows ACL permutations, production key/configuration, multi-node locking/throughput and process/OS crash consistency were not tested. P06 adds no review-history table; expiry/snapshot operations remain as documented. No P07 behavior was implemented.

### Final untracked path inventory

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
docs/10_AUTH_SECURITY.md
docs/11_CUSTOMER_PROFILE_ADMIN.md
docs/12_PRIVATE_DOCUMENT_STORAGE.md
docs/13_DOCUMENT_REVIEW_KYC.md
docs/IMPLEMENTATION_STATUS.md
docs/LOCAL_DEVELOPMENT.md
docs/README.md
docs/prompts/P01_FIX_01.md
docs/prompts/P01_FOUNDATION.md
docs/prompts/P02_DATABASE_FOUNDATION.md
docs/prompts/P03_AUTH_SECURITY.md
docs/prompts/P03_FIX_01.md
docs/prompts/P04_CUSTOMER_PROFILE_ADMIN.md
docs/prompts/P04_FIX_01.md
docs/prompts/P05_FIX_01.md
docs/prompts/P05_FIX_02.md
docs/prompts/P05_PRIVATE_DOCUMENTS.md
docs/prompts/P06_DOCUMENT_REVIEW_KYC.md
docs/reference/BACKEND_CONVENTIONS.md
docs/reference/MENTOR_NOTES.md
docs/reference/README.md
docs/reference/car_rental_conceptual.drawio
docs/reference/schema.sql
docs/reports/P01_FIX_01_REPORT.md
docs/reports/P01_REPORT.md
docs/reports/P02_REPORT.md
docs/reports/P03_FIX_01_REPORT.md
docs/reports/P03_REPORT.md
docs/reports/P04_FIX_01_REPORT.md
docs/reports/P04_REPORT.md
docs/reports/P05_FIX_01_REPORT.md
docs/reports/P05_FIX_02_REPORT.md
docs/reports/P05_REPORT.md
docs/reports/P06_REPORT.md
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
docs/reviews/P02_REVIEW.md
docs/reviews/P03_FIX_01_REVIEW.md
docs/reviews/P03_REVIEW.md
docs/reviews/P04_FIX_01_REVIEW.md
docs/reviews/P04_REVIEW.md
docs/reviews/P05_FIX_01_REVIEW.md
docs/reviews/P05_FIX_02_REVIEW.md
docs/reviews/P05_REVIEW.md
mvnw
mvnw.cmd
pom.xml
scripts/verify-local-config-packaging.ps1
src/main/java/com/carrental/CarRentalApplication.java
src/main/java/com/carrental/config/ClockConfig.java
src/main/java/com/carrental/config/CustomerProperties.java
src/main/java/com/carrental/config/DocumentConfiguration.java
src/main/java/com/carrental/config/DocumentProperties.java
src/main/java/com/carrental/config/security/AdminBootstrapRunner.java
src/main/java/com/carrental/config/security/BootstrapAdminProperties.java
src/main/java/com/carrental/config/security/CorsProperties.java
src/main/java/com/carrental/config/security/JwtConfiguration.java
src/main/java/com/carrental/config/security/JwtKeyLoader.java
src/main/java/com/carrental/config/security/JwtKeyMaterial.java
src/main/java/com/carrental/config/security/JwtProperties.java
src/main/java/com/carrental/config/security/PasswordPolicyProperties.java
src/main/java/com/carrental/config/security/SecurityConfiguration.java
src/main/java/com/carrental/controller/AuthController.java
src/main/java/com/carrental/controller/CustomerController.java
src/main/java/com/carrental/controller/HealthController.java
src/main/java/com/carrental/controller/UserDocumentController.java
src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java
src/main/java/com/carrental/dto/request/auth/LoginRequest.java
src/main/java/com/carrental/dto/request/auth/RegisterRequest.java
src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java
src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java
src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java
src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java
src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java
src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java
src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java
src/main/java/com/carrental/dto/response/ApiResponse.java
src/main/java/com/carrental/dto/response/CustomerAdminResponse.java
src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java
src/main/java/com/carrental/dto/response/FieldErrorResponse.java
src/main/java/com/carrental/dto/response/HealthResponse.java
src/main/java/com/carrental/dto/response/KycSummaryResponse.java
src/main/java/com/carrental/dto/response/PageResponse.java
src/main/java/com/carrental/dto/response/TokenResponse.java
src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java
src/main/java/com/carrental/dto/response/UserDocumentReviewResponse.java
src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java
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
src/main/java/com/carrental/mapper/CustomerMapper.java
src/main/java/com/carrental/mapper/UserDocumentMapper.java
src/main/java/com/carrental/repository/BankAccountRepository.java
src/main/java/com/carrental/repository/CustomerRepository.java
src/main/java/com/carrental/repository/CustomerStatusLock.java
src/main/java/com/carrental/repository/DriverRepository.java
src/main/java/com/carrental/repository/KycEvidenceProjection.java
src/main/java/com/carrental/repository/UserDocumentRepository.java
src/main/java/com/carrental/repository/VoucherRepository.java
src/main/java/com/carrental/security/AccountUserDetails.java
src/main/java/com/carrental/security/ApiAccessDeniedHandler.java
src/main/java/com/carrental/security/ApiAuthenticationEntryPoint.java
src/main/java/com/carrental/security/CurrentAccount.java
src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java
src/main/java/com/carrental/security/CustomerUserDetailsService.java
src/main/java/com/carrental/security/InvalidCurrentAccountException.java
src/main/java/com/carrental/security/SecurityErrorResponses.java
src/main/java/com/carrental/service/AuthService.java
src/main/java/com/carrental/service/CustomerService.java
src/main/java/com/carrental/service/CustomerStatusChangeLogger.java
src/main/java/com/carrental/service/DocumentReviewLogger.java
src/main/java/com/carrental/service/KycPolicy.java
src/main/java/com/carrental/service/KycService.java
src/main/java/com/carrental/service/UserDocumentService.java
src/main/java/com/carrental/service/impl/AdminBootstrapService.java
src/main/java/com/carrental/service/impl/AuthServiceImpl.java
src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
src/main/java/com/carrental/service/impl/KycServiceImpl.java
src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java
src/main/java/com/carrental/storage/CanonicalDocumentImage.java
src/main/java/com/carrental/storage/DocumentImageFormat.java
src/main/java/com/carrental/storage/DocumentImageInspector.java
src/main/java/com/carrental/storage/ImageStructureValidator.java
src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java
src/main/java/com/carrental/storage/PrivateDocumentFile.java
src/main/java/com/carrental/storage/PrivateDocumentReceipt.java
src/main/java/com/carrental/storage/PrivateDocumentStorage.java
src/main/java/com/carrental/storage/StorageRootPolicy.java
src/main/java/com/carrental/storage/UploadedDocumentImage.java
src/main/java/com/carrental/validation/PasswordPolicyValidator.java
src/main/java/com/carrental/validation/ValidPassword.java
src/main/java/com/carrental/web/RequestTraceFilter.java
src/main/java/com/carrental/web/UserDocumentMultipartReader.java
src/main/resources/application.properties
src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql
src/test/java/com/carrental/AuthSecurityPostgresIT.java
src/test/java/com/carrental/AuthSecurityTestFixtures.java
src/test/java/com/carrental/CustomerManagementPostgresIT.java
src/test/java/com/carrental/CustomerPropertiesTest.java
src/test/java/com/carrental/Function1PostgresIT.java
src/test/java/com/carrental/JwtConfigurationTest.java
src/test/java/com/carrental/KycPolicyTest.java
src/test/java/com/carrental/MutableTestClock.java
src/test/java/com/carrental/PlatformHttpTest.java
src/test/java/com/carrental/PlatformTestFixtures.java
src/test/java/com/carrental/PrivateDocumentStorageTest.java
src/test/java/com/carrental/TestJwtKeys.java
src/test/java/com/carrental/UserDocumentPostgresIT.java
src/test/java/com/carrental/UserDocumentReviewPostgresIT.java
src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java
src/test/java/com/carrental/repository/CustomerStatusLockTest.java
src/test/java/com/carrental/storage/StorageRootBootJarIT.java
src/test/java/com/carrental/storage/StorageRootBootJarProbe.java
src/test/java/com/carrental/storage/StorageRootJarProbe.java
src/test/java/com/carrental/storage/StorageRootPolicyTest.java
```
