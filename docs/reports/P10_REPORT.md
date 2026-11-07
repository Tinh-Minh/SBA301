# P10 — Function 1 verification and handoff report

**Status: READY_FOR_REVIEW** (2026-10-15). P01–P09 remain APPROVED. P10 is awaiting final review; Function 1 is not marked COMPLETE/APPROVED. No commit, push, deployment, shared-database access, schema/reference edits, or P11 work was performed.

## 1. Initial environment and preservation

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; HEAD `2fe712eed12a2af3b61f0a5311bdd3901f614029`, equal to `origin/BE` at inspection.
- Initial working tree had no staged or tracked diff and 248 pre-existing untracked paths. Those paths were preserved. No reset, clean, stash, branch switch, stage, commit, or push was run.
- Windows 11; Oracle JDK `21.0.8`; Maven Wrapper `3.9.11`; Docker server `28.5.2`. Integration databases used PostgreSQL `15.13` Testcontainers only.
- Scope stayed at `customers`, `user_documents`, `drivers`, `bank_accounts`, `vouchers` plus static API/docs/tests. No production controller/service/entity/migration/pom change was made.

### Leader and reviewed-file SHA-256 comparison

The before-work values recorded from the P10 baseline and the final values below match:

| File | SHA-256 before and after |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `src/main/java/com/carrental/entity/Customer.java` | `F687C5212FE64E06D58729D13EE2CBB4D5CC8055D270BCDB22BFF51DF587A193` |
| `src/main/java/com/carrental/entity/UserDocument.java` | `B7B7BD665DC41994553EC9557CF8326EAE1263AD367F793EE8B2B3B0E2E7A006` |
| `src/main/java/com/carrental/entity/Driver.java` | `9F92C965A075ADFE32EEA92FC562FDD092A0EBD1CEE14ADAA7606CB492AE6817` |
| `src/main/java/com/carrental/entity/BankAccount.java` | `FA03F0D8330342EF595DE140BCFD0E475B0AE071AE5F1EDD32C21B4D96CE2B35` |
| `src/main/java/com/carrental/entity/Voucher.java` | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |
| `pom.xml` | `9E7243FF673B6D98BF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219` |
| `docs/reports/P09_REPORT.md` | `85D654CB5C9F446C17DBF9C32C595A017DEF8912DC6D86017E0351B75E2E8DB4` |
| `docs/reviews/P09_REVIEW.md` | `130F473E875D4C3EEF62AAB23BCAC3EEA0191CF3C86AFED287F677DC816566E9` |

## 2. P10 steps and implementation

1. **Baseline and acceptance matrix:** confirmed branch/HEAD/environment and preserved untracked baseline. Added [AC-01–AC-09 matrix](../18_FUNCTION_1_ACCEPTANCE.md) with links from each criterion to actual coverage and limits.
2. **Source-derived endpoint/rights inventory:** inspected the actual controllers, DTOs, security rules and responses. [Canonical handoff](../17_FUNCTION_1_HANDOFF.md) records all routes, roles/ownership, media, bodyless requests, paging, side effects, errors, trace/no-store and handoff boundaries. The live controller mapping contains **32** F1 method/path pairs across health/auth/customer/documents/driver/bank/voucher. No implicit HEAD/OPTIONS or framework `/error` route is advertised.
3. **Static OpenAPI and parity:** added [OpenAPI 3.1.0 JSON](../api/openapi-function1.json) and `Function1OpenApiContractTest`. It resolves local refs, checks unique operation IDs and compares the method/path set, actual consumes/bodyless and security semantics against `RequestMappingHandlerMapping`; it also checks representative required keys/response field shapes and document binary media/headers. The contract suite is structural/parity validation with existing libraries; no independent full semantic OpenAPI validator was run. No Swagger runtime dependency/endpoint was added.
4. **PostgreSQL/HTTP workflow:** added `Function1WorkflowPostgresIT`, using the real Spring HTTP/JWT/security/JPA stack, PostgreSQL 15.13 Testcontainers, controlled Clock, temporary keys and external private storage. It exercises customer/peer registration and profile patch, passport and license upload/review, private download ownership, driver activation, bank default/lookup/delete, voucher create/update/status/list and lock/unlock. Test output captured actual IDs: customer `2`, peer `3`, passport `1`, license `2`, driver `1`, banks `2,3`, voucher `1` (disposable test database only). At Clock base `2026-10-14`, review current KYC was VERIFIED; at `2026-10-16`, passport KYC remained VERIFIED, stored driver stayed ACTIVE while current eligibility became false, and active voucher window became ENDED. Read-only eligibility did not mutate driver audit. Old unexpired token received 401 after account lock and worked again after unlock. Traces matched response/header; foreign document/customer-bank/admin-bank returned 404; CUSTOMER voucher call returned 403; fractional voucher amount returned 400 with zero row; positive committed audit events were present and privacy assertions passed.
5. **Standard executable JAR:** `Function1ExecutableJarSmokeIT` launched the Maven production artifact using `java -jar` from a working directory with spaces and Unicode. Profile/config, RSA keys, private storage and PostgreSQL were external/disposable. Actual results: health 200/`data.status=UP` with matching trace, register 201, login/me 200, synthetic private upload 201, owner download 200, peer download 404, valid integral-decimal voucher 201, fractional voucher 400/zero row. The executable artifact SHA-256 from the final full run is `E33C63FD458C67E3E02B83748F0F1091D64A2E70591C60D485BC0B9D97117635`. Test logs contain no bearer token/password; no token or key material is included here.
6. **FE/F2/F3/F4 handoff:** added [manual request collection](../api/function1-examples.http), [API handoff](../17_FUNCTION_1_HANDOFF.md), and [local runbook](../19_FUNCTION_1_RUNBOOK.md). They preserve current-vs-stored KYC/driver states, exact voucher amount behavior, authenticated binary/no-store downloads, internal bank payee lookup, lock/current-state rechecks, and each downstream function's limits. Examples use placeholders/synthetic values.
7. **Configuration/artifact/privacy review:** no runtime dependencies, production API or config defaults changed. The existing packaging probe reported all marker checks false: local profile, fake config/key/bootstrap/document markers, storage-root path, private-key entry and Boot test helper. Reference/schema/migration/entity/pom and prior P09 report/review hashes match. No source files in `docs/reference/` were modified.
8. **Verification:** final full command and packaging probe below both passed. Existing P01–P09 auth/HTTP/PostgreSQL/concurrency/storage/KYC/driver/bank/voucher regression suites all ran as part of the final full suite. A transient Windows temp-file cleanup failure during an earlier full run was fixed in the JAR test with bounded cleanup retry; the focused JAR test and final full suite then passed.
9. **Report/status:** created this report, acceptance matrix, and updated current indexes/status to READY_FOR_REVIEW. Historical prompts/reports/reviews were left intact. No P02+ scope was added.

### Observed health response

The standard JAR and PostgreSQL workflow each received HTTP `200`. Sanitized observed response (the runtime trace is redacted; it exactly equalled `X-Request-ID`):

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: <runtime-trace-redacted>

{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"<same-runtime-trace-redacted>"}
```

The health endpoint reports web liveness only.

## 3. Commands actually run and results

| Command | Result |
|---|---|
| `java -version` | PASS — Oracle JDK 21.0.8 |
| `.\mvnw.cmd -version` | PASS — Maven Wrapper 3.9.11 |
| `docker version --format 'Docker server {{.Server.Version}}'` | PASS — Docker server 28.5.2 |
| `.\mvnw.cmd -B -Dtest=Function1OpenApiContractTest test` | Final targeted PASS, 1/1. An earlier compile exposed an invalid `Collection.forEachRemaining` call in the new workflow test; fixed to `Collection.forEach` before final runs. |
| `.\mvnw.cmd -B -Dtest=none -Dsurefire.failIfNoSpecifiedTests=false -Dit.test=Function1WorkflowPostgresIT verify -Ppostgres-it` | PASS, 1/1 against PostgreSQL 15.13. The first invocation was parsed incorrectly by PowerShell; the quoted-argument rerun completed successfully. |
| `.\mvnw.cmd -B -Dtest=none -Dsurefire.failIfNoSpecifiedTests=false -Dit.test=Function1ExecutableJarSmokeIT verify -Ppostgres-it` | Final targeted PASS, 1/1; actual `java -jar` HTTP results above. An earlier full run hit a Windows file lock while deleting the child log; bounded retry was added, then this focused run passed. |
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | Final PASS in 2:36 — **147/147** (39 Surefire + 108 Failsafe; 0 failures, 0 errors, 0 skipped). |
| `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` | Final PASS after setting `JAVA_HOME` to JDK 21. Build PASS; every reported local config/key/bootstrap/private-document/storage-root/test-helper marker was `False`. Initial invocation without `JAVA_HOME` stopped at the script precondition and did not run the probe. |
| Relative links and targeted literal scan over current handoff/spec/examples/report docs | PASS — 21 Markdown files' local links resolved; no private-key block, JWT-looking bearer literal, or credential assignment found. |

The generated full-suite JAR smoke line was `mode=java-jar`, profile `p10-smoke`, Unicode/space CWD true, external config/keys true, health 200, register 201, login/me 200, upload 201, owner download 200, peer download 404, valid voucher 201 and fractional voucher 400/0 rows. The hash is recorded above. Tests used isolated containers only; no local/shared DB URL was used.

## 4. Files created or updated

**P10 artifacts and tests added:**

- `docs/api/openapi-function1.json` — static importable OpenAPI contract.
- `docs/api/function1-examples.http` — manual requests with placeholders.
- `docs/17_FUNCTION_1_HANDOFF.md` — canonical endpoint/rights/data and integration contract.
- `docs/18_FUNCTION_1_ACCEPTANCE.md` — AC evidence and limits.
- `docs/19_FUNCTION_1_RUNBOOK.md` — local-only run instructions/troubleshooting.
- `src/test/java/com/carrental/Function1OpenApiContractTest.java` — actual MVC/spec parity and schema checks.
- `src/test/java/com/carrental/Function1WorkflowPostgresIT.java` — isolated real HTTP/PostgreSQL workflow.
- `src/test/java/com/carrental/Function1ExecutableJarSmokeIT.java` — actual production JAR smoke with external resources.
- `docs/reports/P10_REPORT.md` — this report.

**Current documentation updated:** `AGENTS.md`, `README.md`, `docs/README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md`, `docs/14_DRIVER_PROFILE_ELIGIBILITY.md`, `docs/15_BANK_ACCOUNTS.md`, `docs/16_ADMIN_VOUCHERS.md`, and `docs/LOCAL_DEVELOPMENT.md`. These updates describe current P10 evidence; historical reports/reviews/prompts are unchanged.

No production Java code, entity, migration, schema/reference file, or dependency changed.

## 5. Limitations and remaining work

- P10 remains READY_FOR_REVIEW until the reviewer checks this report, OpenAPI contract, tests and handoff. No claim is made that all of F2/F3/F4 or production readiness is complete.
- OpenAPI validation did not use a full external semantic validator; current evidence is JSON parsing, local reference resolution, MVC parity, required/media/security assertions and representative response checks.
- Tests do not access the shared database or prove production RLS/ACL, multi-node private storage, crash recovery, deployment key provisioning, full F3 voucher redemption/price/order, or F4 payout transactions.
- One early full-suite failure left six directories under `%TEMP%` with prefix `sba301-p10-(jar|config|storage)-`; these are synthetic test artifacts from failed cleanup attempts, not repository files. After verifying all six paths were direct children of TEMP and outside the repository, the shell command to recursively delete them was rejected by command policy. The final successful JAR run cleaned its own directories. No key/file contents were logged or copied into this report. This cleanup limitation is the only known local residue.
- Maven emitted existing deprecation/unchecked and Mockito dynamic-agent warnings; they did not fail the final build.

## 6. Git status and complete untracked inventory

- Branch: `BE`; HEAD: `2fe712eed12a2af3b61f0a5311bdd3901f614029`; `origin/BE` was at the same hash at initial inspection.
- Staged files: none. Tracked diff: none. All repository files remain untracked, as at the initial P10 state; no files were staged to conceal that baseline.
- The complete `git status --short --untracked-files=all` inventory is appended below after this report and the status updates were written. It includes the pre-existing untracked tree and all P10 additions, including this report.

### Complete untracked file inventory

Snapshot: branch BE, HEAD 2fe712eed12a2af3b61f0a5311bdd3901f614029; 259 untracked paths; staged 0; tracked diff 0.

- `.gitignore`
- `.mvn/wrapper/maven-wrapper.jar`
- `.mvn/wrapper/maven-wrapper.properties`
- `AGENTS.md`
- `config/application-local.properties.example`
- `docs/01_FUNCTION_1_SCOPE.md`
- `docs/02_FUNCTION_1_ARCHITECTURE.md`
- `docs/03_FUNCTION_1_API.md`
- `docs/04_DATABASE_REVIEW.md`
- `docs/05_BACKEND_CONVENTIONS.md`
- `docs/06_IMPLEMENTATION_PLAN.md`
- `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`
- `docs/08_PROMPT_ROADMAP.md`
- `docs/09_FUNCTION_1_PERSISTENCE.md`
- `docs/10_AUTH_SECURITY.md`
- `docs/11_CUSTOMER_PROFILE_ADMIN.md`
- `docs/12_PRIVATE_DOCUMENT_STORAGE.md`
- `docs/13_DOCUMENT_REVIEW_KYC.md`
- `docs/14_DRIVER_PROFILE_ELIGIBILITY.md`
- `docs/15_BANK_ACCOUNTS.md`
- `docs/16_ADMIN_VOUCHERS.md`
- `docs/17_FUNCTION_1_HANDOFF.md`
- `docs/18_FUNCTION_1_ACCEPTANCE.md`
- `docs/19_FUNCTION_1_RUNBOOK.md`
- `docs/api/function1-examples.http`
- `docs/api/openapi-function1.json`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/LOCAL_DEVELOPMENT.md`
- `docs/prompts/P01_FIX_01.md`
- `docs/prompts/P01_FOUNDATION.md`
- `docs/prompts/P02_DATABASE_FOUNDATION.md`
- `docs/prompts/P03_AUTH_SECURITY.md`
- `docs/prompts/P03_FIX_01.md`
- `docs/prompts/P04_CUSTOMER_PROFILE_ADMIN.md`
- `docs/prompts/P04_FIX_01.md`
- `docs/prompts/P05_FIX_01.md`
- `docs/prompts/P05_FIX_02.md`
- `docs/prompts/P05_PRIVATE_DOCUMENTS.md`
- `docs/prompts/P06_DOCUMENT_REVIEW_KYC.md`
- `docs/prompts/P06_FIX_01.md`
- `docs/prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md`
- `docs/prompts/P07_FIX_01.md`
- `docs/prompts/P08_BANK_ACCOUNTS.md`
- `docs/prompts/P09_ADMIN_VOUCHERS.md`
- `docs/prompts/P09_FIX_01.md`
- `docs/prompts/P10_FUNCTION_1_HANDOFF.md`
- `docs/README.md`
- `docs/reference/BACKEND_CONVENTIONS.md`
- `docs/reference/car_rental_conceptual.drawio`
- `docs/reference/MENTOR_NOTES.md`
- `docs/reference/README.md`
- `docs/reference/schema.sql`
- `docs/reports/P01_FIX_01_REPORT.md`
- `docs/reports/P01_REPORT.md`
- `docs/reports/P02_REPORT.md`
- `docs/reports/P03_FIX_01_REPORT.md`
- `docs/reports/P03_REPORT.md`
- `docs/reports/P04_FIX_01_REPORT.md`
- `docs/reports/P04_REPORT.md`
- `docs/reports/P05_FIX_01_REPORT.md`
- `docs/reports/P05_FIX_02_REPORT.md`
- `docs/reports/P05_REPORT.md`
- `docs/reports/P06_FIX_01_REPORT.md`
- `docs/reports/P06_REPORT.md`
- `docs/reports/P07_FIX_01_REPORT.md`
- `docs/reports/P07_REPORT.md`
- `docs/reports/P08_REPORT.md`
- `docs/reports/P09_FIX_01_REPORT.md`
- `docs/reports/P09_REPORT.md`
- `docs/reports/P10_REPORT.md`
- `docs/reviews/P01_FIX_01_REVIEW.md`
- `docs/reviews/P01_REVIEW.md`
- `docs/reviews/P02_REVIEW.md`
- `docs/reviews/P03_FIX_01_REVIEW.md`
- `docs/reviews/P03_REVIEW.md`
- `docs/reviews/P04_FIX_01_REVIEW.md`
- `docs/reviews/P04_REVIEW.md`
- `docs/reviews/P05_FIX_01_REVIEW.md`
- `docs/reviews/P05_FIX_02_REVIEW.md`
- `docs/reviews/P05_REVIEW.md`
- `docs/reviews/P06_FIX_01_REVIEW.md`
- `docs/reviews/P06_REVIEW.md`
- `docs/reviews/P07_FIX_01_REVIEW.md`
- `docs/reviews/P07_REVIEW.md`
- `docs/reviews/P08_REVIEW.md`
- `docs/reviews/P09_FIX_01_REVIEW.md`
- `docs/reviews/P09_REVIEW.md`
- `mvnw`
- `mvnw.cmd`
- `pom.xml`
- `README.md`
- `scripts/verify-local-config-packaging.ps1`
- `src/main/java/com/carrental/CarRentalApplication.java`
- `src/main/java/com/carrental/config/ClockConfig.java`
- `src/main/java/com/carrental/config/CustomerProperties.java`
- `src/main/java/com/carrental/config/DocumentConfiguration.java`
- `src/main/java/com/carrental/config/DocumentProperties.java`
- `src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java`
- `src/main/java/com/carrental/config/security/AdminBootstrapRunner.java`
- `src/main/java/com/carrental/config/security/BootstrapAdminProperties.java`
- `src/main/java/com/carrental/config/security/CorsProperties.java`
- `src/main/java/com/carrental/config/security/JwtConfiguration.java`
- `src/main/java/com/carrental/config/security/JwtKeyLoader.java`
- `src/main/java/com/carrental/config/security/JwtKeyMaterial.java`
- `src/main/java/com/carrental/config/security/JwtProperties.java`
- `src/main/java/com/carrental/config/security/PasswordPolicyProperties.java`
- `src/main/java/com/carrental/config/security/SecurityConfiguration.java`
- `src/main/java/com/carrental/controller/AuthController.java`
- `src/main/java/com/carrental/controller/BankAccountController.java`
- `src/main/java/com/carrental/controller/CustomerController.java`
- `src/main/java/com/carrental/controller/DriverController.java`
- `src/main/java/com/carrental/controller/HealthController.java`
- `src/main/java/com/carrental/controller/UserDocumentController.java`
- `src/main/java/com/carrental/controller/VoucherController.java`
- `src/main/java/com/carrental/dto/internal/BankAccountPayeeDetails.java`
- `src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java`
- `src/main/java/com/carrental/dto/request/auth/LoginRequest.java`
- `src/main/java/com/carrental/dto/request/auth/RegisterRequest.java`
- `src/main/java/com/carrental/dto/request/bankaccount/BankAccountListQuery.java`
- `src/main/java/com/carrental/dto/request/bankaccount/CreateBankAccountRequest.java`
- `src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java`
- `src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java`
- `src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java`
- `src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java`
- `src/main/java/com/carrental/dto/request/driver/ChangeDriverStatusRequest.java`
- `src/main/java/com/carrental/dto/request/driver/DriverListQuery.java`
- `src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java`
- `src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java`
- `src/main/java/com/carrental/dto/request/voucher/UpdateVoucherAdminRequest.java`
- `src/main/java/com/carrental/dto/request/voucher/VoucherListQuery.java`
- `src/main/java/com/carrental/dto/response/ApiResponse.java`
- `src/main/java/com/carrental/dto/response/BankAccountResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerAdminResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerProfileResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java`
- `src/main/java/com/carrental/dto/response/DriverEligibilityReasonCode.java`
- `src/main/java/com/carrental/dto/response/DriverEligibilityResponse.java`
- `src/main/java/com/carrental/dto/response/DriverResponse.java`
- `src/main/java/com/carrental/dto/response/FieldErrorResponse.java`
- `src/main/java/com/carrental/dto/response/HealthResponse.java`
- `src/main/java/com/carrental/dto/response/KycSummaryResponse.java`
- `src/main/java/com/carrental/dto/response/PageResponse.java`
- `src/main/java/com/carrental/dto/response/TokenResponse.java`
- `src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java`
- `src/main/java/com/carrental/dto/response/UserDocumentReviewResponse.java`
- `src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java`
- `src/main/java/com/carrental/dto/response/VoucherResponse.java`
- `src/main/java/com/carrental/dto/response/VoucherWindowState.java`
- `src/main/java/com/carrental/entity/BankAccount.java`
- `src/main/java/com/carrental/entity/base/AuditedEntity.java`
- `src/main/java/com/carrental/entity/base/BaseEntity.java`
- `src/main/java/com/carrental/entity/Customer.java`
- `src/main/java/com/carrental/entity/Driver.java`
- `src/main/java/com/carrental/entity/UserDocument.java`
- `src/main/java/com/carrental/entity/Voucher.java`
- `src/main/java/com/carrental/enums/CustomerStatus.java`
- `src/main/java/com/carrental/enums/DiscountType.java`
- `src/main/java/com/carrental/enums/DocumentVerifyStatus.java`
- `src/main/java/com/carrental/enums/DriverStatus.java`
- `src/main/java/com/carrental/enums/KycStatus.java`
- `src/main/java/com/carrental/enums/Role.java`
- `src/main/java/com/carrental/enums/UserDocumentType.java`
- `src/main/java/com/carrental/enums/VoucherStatus.java`
- `src/main/java/com/carrental/exception/AppException.java`
- `src/main/java/com/carrental/exception/ErrorCode.java`
- `src/main/java/com/carrental/exception/GlobalExceptionHandler.java`
- `src/main/java/com/carrental/mapper/BankAccountMapper.java`
- `src/main/java/com/carrental/mapper/CustomerMapper.java`
- `src/main/java/com/carrental/mapper/DriverMapper.java`
- `src/main/java/com/carrental/mapper/UserDocumentMapper.java`
- `src/main/java/com/carrental/mapper/VoucherMapper.java`
- `src/main/java/com/carrental/repository/BankAccountRepository.java`
- `src/main/java/com/carrental/repository/CustomerRepository.java`
- `src/main/java/com/carrental/repository/CustomerStatusLock.java`
- `src/main/java/com/carrental/repository/DriverEligibilityProjection.java`
- `src/main/java/com/carrental/repository/DriverRepository.java`
- `src/main/java/com/carrental/repository/KycEvidenceProjection.java`
- `src/main/java/com/carrental/repository/UserDocumentRepository.java`
- `src/main/java/com/carrental/repository/VoucherRepository.java`
- `src/main/java/com/carrental/security/AccountUserDetails.java`
- `src/main/java/com/carrental/security/ApiAccessDeniedHandler.java`
- `src/main/java/com/carrental/security/ApiAuthenticationEntryPoint.java`
- `src/main/java/com/carrental/security/CurrentAccount.java`
- `src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java`
- `src/main/java/com/carrental/security/CustomerUserDetailsService.java`
- `src/main/java/com/carrental/security/InvalidCurrentAccountException.java`
- `src/main/java/com/carrental/security/SecurityErrorResponses.java`
- `src/main/java/com/carrental/service/AuthService.java`
- `src/main/java/com/carrental/service/BankAccountChangeLogger.java`
- `src/main/java/com/carrental/service/BankAccountLookupService.java`
- `src/main/java/com/carrental/service/BankAccountService.java`
- `src/main/java/com/carrental/service/CustomerService.java`
- `src/main/java/com/carrental/service/CustomerStatusChangeLogger.java`
- `src/main/java/com/carrental/service/DocumentReviewLogger.java`
- `src/main/java/com/carrental/service/DriverChangeLogger.java`
- `src/main/java/com/carrental/service/DriverEligibilityPolicy.java`
- `src/main/java/com/carrental/service/DriverEligibilityService.java`
- `src/main/java/com/carrental/service/DriverService.java`
- `src/main/java/com/carrental/service/impl/AdminBootstrapService.java`
- `src/main/java/com/carrental/service/impl/AuthServiceImpl.java`
- `src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java`
- `src/main/java/com/carrental/service/impl/CustomerServiceImpl.java`
- `src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java`
- `src/main/java/com/carrental/service/impl/DriverServiceImpl.java`
- `src/main/java/com/carrental/service/impl/KycServiceImpl.java`
- `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`
- `src/main/java/com/carrental/service/impl/VoucherServiceImpl.java`
- `src/main/java/com/carrental/service/KycPolicy.java`
- `src/main/java/com/carrental/service/KycService.java`
- `src/main/java/com/carrental/service/UserDocumentService.java`
- `src/main/java/com/carrental/service/VoucherChangeLogger.java`
- `src/main/java/com/carrental/service/VoucherService.java`
- `src/main/java/com/carrental/storage/CanonicalDocumentImage.java`
- `src/main/java/com/carrental/storage/DocumentImageFormat.java`
- `src/main/java/com/carrental/storage/DocumentImageInspector.java`
- `src/main/java/com/carrental/storage/ImageStructureValidator.java`
- `src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java`
- `src/main/java/com/carrental/storage/PrivateDocumentFile.java`
- `src/main/java/com/carrental/storage/PrivateDocumentReceipt.java`
- `src/main/java/com/carrental/storage/PrivateDocumentStorage.java`
- `src/main/java/com/carrental/storage/StorageRootPolicy.java`
- `src/main/java/com/carrental/storage/UploadedDocumentImage.java`
- `src/main/java/com/carrental/validation/PasswordPolicyValidator.java`
- `src/main/java/com/carrental/validation/ValidPassword.java`
- `src/main/java/com/carrental/web/RequestTraceFilter.java`
- `src/main/java/com/carrental/web/UserDocumentMultipartReader.java`
- `src/main/resources/application.properties`
- `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql`
- `src/test/java/com/carrental/AuthSecurityPostgresIT.java`
- `src/test/java/com/carrental/AuthSecurityTestFixtures.java`
- `src/test/java/com/carrental/BankAccountPostgresIT.java`
- `src/test/java/com/carrental/CustomerManagementPostgresIT.java`
- `src/test/java/com/carrental/CustomerPropertiesTest.java`
- `src/test/java/com/carrental/DriverConcurrencyPostgresIT.java`
- `src/test/java/com/carrental/DriverEligibilityPolicyTest.java`
- `src/test/java/com/carrental/DriverProfilePostgresIT.java`
- `src/test/java/com/carrental/Function1ExecutableJarSmokeIT.java`
- `src/test/java/com/carrental/Function1OpenApiContractTest.java`
- `src/test/java/com/carrental/Function1PostgresIT.java`
- `src/test/java/com/carrental/Function1WorkflowPostgresIT.java`
- `src/test/java/com/carrental/JwtConfigurationTest.java`
- `src/test/java/com/carrental/KycPolicyTest.java`
- `src/test/java/com/carrental/MutableTestClock.java`
- `src/test/java/com/carrental/PlatformHttpTest.java`
- `src/test/java/com/carrental/PlatformTestFixtures.java`
- `src/test/java/com/carrental/PrivateDocumentStorageTest.java`
- `src/test/java/com/carrental/repository/CustomerStatusLockTest.java`
- `src/test/java/com/carrental/storage/StorageRootBootJarIT.java`
- `src/test/java/com/carrental/storage/StorageRootBootJarProbe.java`
- `src/test/java/com/carrental/storage/StorageRootJarProbe.java`
- `src/test/java/com/carrental/storage/StorageRootPolicyTest.java`
- `src/test/java/com/carrental/TestJwtKeys.java`
- `src/test/java/com/carrental/UserDocumentPostgresIT.java`
- `src/test/java/com/carrental/UserDocumentReviewPostgresIT.java`
- `src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java`
- `src/test/java/com/carrental/VoucherAdminPostgresIT.java`