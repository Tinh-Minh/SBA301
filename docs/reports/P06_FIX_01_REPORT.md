# P06-FIX-01 — Báo cáo sửa R1/R2

**Trạng thái: READY_FOR_REVIEW.** R1/R2 đã được triển khai, chờ reviewer xác nhận. P01–P05 vẫn APPROVED; P07 NOT_STARTED. Ngày báo cáo: 2026-10-14.

## 1. Kết quả

- **R1 addressed:** review failures đã được ghi diagnostic an toàn tại service boundary cho stored evidence missing/corrupt/invalid (500), storage disabled/unavailable (503) và caught exact `uq_user_doc_approved`/SQLState `23505` (409). Mỗi event có action, trace, category, error code, actor/document/owner IDs khi đã biết, exception type; unique conflict chỉ ghi constraint name allowlist. Không log throwable, exception message/cause/suppressed, SQL detail/state, locator/path, số/tên/ngày/place trên giấy tờ, reject reason, ảnh, token hoặc password. Cause vẫn được giữ khi wrap, exception dependency được rethrow nguyên, và transaction rollback vẫn nguyên.
- **R2 addressed:** giữ test upload/review cũ với mô tả chính xác là file-stage overlap trước metadata transaction. Thêm test HTTP/PostgreSQL mới chứng minh metadata upload transaction thực giữ owner row lock sau flush; HTTP review transaction khác chờ trên đúng lock đó theo `pg_blocking_pids`. Sau upload commit, review aggregate nhìn thấy hồ sơ PENDING mới và giữ KYC `PENDING`.
- Không sửa API, error code/status, schema, entity, migration, reference, lock order, KYC policy/query, P05 storage contract hoặc policy U-11/U-12/U-13. Không commit/push, không kết nối database chung và không triển khai P07.

## 2. R1 — Diagnostic và regression HTTP

`UserDocumentServiceImpl` phát event an toàn ở các catch/boundary đã biết. `GlobalExceptionHandler` không ghi thêm AppException để tránh mất context/duplicate. Lỗi 500 dùng ERROR; dependency 503 và exact unique conflict 409 dùng WARN. Unique conflict giữ nguyên cause khi chuyển thành `APPROVED_DOCUMENT_CONFLICT`.

PostgreSQL/HTTP regression xác nhận:

| Tình huống | HTTP | Diagnostic evidence | Mutation |
|---|---:|---|---|
| Tạo image thật rồi xóa đúng stored file; approve | 500 `INTERNAL_ERROR` | `stored-evidence-invalid`, trace/actor/owner/document/error/type khớp | Document/KYC/files không bị review thay đổi |
| Ghi bytes hỏng vào image thật; approve | 500 `INTERNAL_ERROR` | `stored-evidence-validation-failed`, exception type tĩnh | Bytes hỏng đã tạo trước request vẫn nguyên; rows/KYC không đổi |
| Storage disabled; approve | 503 `DEPENDENCY_UNAVAILABLE` | `storage-dependency`, WARN | Document/KYC/files không đổi |
| Inject dependency unavailable tại `open`; approve | 503 `DEPENDENCY_UNAVAILABLE` | `storage-dependency`, WARN | Document/KYC/files không đổi |
| Actual partial unique index conflict tại flush | 409 `APPROVED_DOCUMENT_CONFLICT` | `approved-document-unique-conflict`, `constraint=uq_user_doc_approved`; loser vẫn PENDING và KYC của loser không được nâng | DB index PostgreSQL thật, không mock exception/index |

Các trường hợp kiểm tra event dương (đúng một event theo trace), trace header/body, IDs/category/code/type/constraint, absence của `ThrowableProxy`, và absence của sentinel gồm document number/name/place/reason/path/locator/cause/bytes trong response cùng toàn bộ rendered logs. Test không bắt mọi lỗi domain thành ERROR và không bật Hibernate/JDBC SQL/bind logging.

## 3. R2 — Actual upload/review PostgreSQL contention

Test mới `uploadTransactionOwnerLockBlocksReviewUntilPendingProofCommits` dùng owner ACTIVE, customer snapshot NONE, một identity PENDING cũ, và multipart identity PENDING mới. Upload đi qua storage thật, transaction thật, `saveAndFlush` thật. Test-only spy chặn `PlatformTransactionManager.commit` sau flush khi transaction-local query xác nhận row mới đã tồn tại; lấy `pg_backend_pid()` từ cùng transaction connection và giữ owner lock trước commit. Không có repository/row/receipt giả và không thêm production hook.

ADMIN review được gửi qua HTTP bằng transaction thực. Test lấy waiter PID từ cùng transaction sau global advisory lock; bounded observer hỏi PostgreSQL `pg_blocking_pids(waiterPid)` và xác nhận holder PID là blocker. Ở lần full run cuối:

```text
holderPid=63 waiterPid=62 pgBlockingPidsConfirmed=true
waiterBlockedMillis=31 uncommittedSubmissionInvisible=true
reviewIncompleteBeforeRelease=true
```

Observer không thấy row upload trước khi release. Sau khi mở latch, upload commit thật và trả **201/PENDING**; review tiếp tục, từ chối hồ sơ cũ và trả **200/REJECTED**. `customers.kyc_status` snapshot và `GET /api/customers/me/kyc` đều là **PENDING**, chứng minh aggregate đã thấy submission vừa commit. Assertions còn xác nhận:

- Hai document có owner/type/number/status/reviewer/time/reason đúng; old `created_at` giữ nguyên và new row không có reviewer fields/reason.
- Các account fields không liên quan giữ nguyên; file cũ không bị xóa/đổi, upload có một receipt/file mới; authenticated downloads của file cũ/mới khớp bytes trên đĩa.
- Có đúng một review success event sau commit theo review trace, không có reject reason, document number, email/name, locator/path hoặc sentinel trong rendered logs.
- Timeout regression riêng vẫn trả 503/trace và retry sau khi thả blocker vẫn thành công.

Test cũ `reviewAndNewSubmissionOverlapOnlyDuringPreTransactionFileStage` tiếp tục kiểm tra overlap lúc `storage.store` trước transaction; nó không được coi là bằng chứng DB contention.

## 4. Verification thực tế

Môi trường thực tế: Windows 11; Java 21.0.8; Maven Wrapper 3.9.11; Docker Engine 28.5.2; PostgreSQL 15.13-alpine qua disposable Testcontainers. `JAVA_HOME` dùng `C:\Program Files\Java\jdk-21`. Các keys, accounts, ảnh và private root đều tổng hợp/tạm thời.

| Lệnh | Kết quả |
|---|---|
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B -Ppostgres-it '-Dit.test=UserDocumentReviewPostgresIT#uploadTransactionOwnerLockBlocksReviewUntilPendingProofCommits' verify` | PASS; R2 target 1/1, gồm `pg_blocking_pids` bằng PostgreSQL thật |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS; 106/106**, 0 failure/error/skip; Surefire 36/36 + Failsafe 70/70; P06 IT 15/15; elapsed 1m25s |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` | PASS; `PROBE_BUILD=PASS`; local config, local/private-key/bootstrap/document markers, root path, private-key entry và test Boot-root helper đều `False` trong executable JAR |

Full verify log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p06-fix01-clean-verify-final.log`. Packaging log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p06-fix01-packaging-final.log`.

### HTTP health quan sát trong full run

`healthIsUpOverHttpWithPostgresContextAndMatchingTrace` gọi HTTP đến embedded server thật của test application; context kết nối PostgreSQL Testcontainers. Kết quả **200**, envelope thành công, `data.status=UP`, header `X-Request-ID` trùng body trace:

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": { "status": "UP" },
  "errors": [],
  "traceId": "54b5f8c7-925b-4ecd-bbb3-6ecfa160f9b7"
}
```

Đây là HTTP health check trong PostgreSQL integration context; không phải deployment hoặc health test với database dùng chung.

### Iterations và hiệu chỉnh

- Targeted IT ban đầu thất bại do sentinel document number vượt `varchar(50)` và hook thử gọi real method trên Spring Data repository spy. Đã rút ngắn fixture và chuyển barrier sang test-only transaction-manager commit boundary; lần R2 targeted sau đó PASS.
- Lần `clean verify` đầu sau thay đổi test chỉ thất bại ở assertion mới kỳ vọng `NONE` trên một owner đã VERIFIED bởi case trước trong cùng test. Đã dùng hai account cross-owner mới, đúng trạng thái đầu NONE; final full run PASS.
- Packaging probe lần đầu được gọi trong shell mới không đặt `JAVA_HOME` nên script dừng ở tiền điều kiện. Chạy lại với JDK 21 được cấu hình như bảng trên và PASS.

## 5. Files tạo/sửa trong lượt này

| File | Vai trò |
|---|---|
| `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java` | Safe diagnostics cho stored evidence, storage dependency và exact approved-document unique conflict; cause/rethrow/rollback được giữ |
| `src/test/java/com/carrental/UserDocumentReviewPostgresIT.java` | HTTP failure log/privacy regressions, actual PostgreSQL upload holder/review waiter test, giữ và mô tả rõ overlap cũ; test lock timeout 5s để dành thời gian cho bounded observer |
| `AGENTS.md` | Trạng thái P06-FIX-01 và quy tắc review R1/R2 |
| `docs/13_DOCUMENT_REVIEW_KYC.md` | Failure log contract và actual DB contention evidence |
| `docs/LOCAL_DEVELOPMENT.md` | Cách chạy/diễn giải P06 PostgreSQL test và trạng thái mới |
| `docs/03_FUNCTION_1_API.md` | Ghi nhận R1/R2 mà không đổi API/status/error contract |
| `docs/02_FUNCTION_1_ARCHITECTURE.md` | Cập nhật P06 status/evidence |
| `docs/06_IMPLEMENTATION_PLAN.md` | Cập nhật M4 status/evidence |
| `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md` | Nhật ký triển khai FIX-01; policy/schema không đổi |
| `docs/08_PROMPT_ROADMAP.md` | Cập nhật trạng thái prompt và P07 |
| `docs/README.md` | Mục lục/trạng thái/report link |
| `docs/10_AUTH_SECURITY.md` | Trạng thái triển khai mới, không thay đổi Security policy |
| `docs/12_PRIVATE_DOCUMENT_STORAGE.md` | Đồng bộ trạng thái P06, không thay đổi P05 storage behavior |
| `docs/IMPLEMENTATION_STATUS.md` | P06-FIX-01 READY_FOR_REVIEW; full test/package/health evidence |
| `docs/reports/P06_FIX_01_REPORT.md` | Báo cáo lượt fix này |

Giữ nguyên `docs/reports/P06_REPORT.md`, reviews/prompts lịch sử, schema/reference, migration và entity files. Chỉ trong test, Hikari lock timeout đổi từ 800 ms sang 5 s để observer/barriers có bounded window; timeout/retry regression cũ vẫn PASS. Production config không đổi.

## 6. Schema/reference hashes

SHA-256 kiểm tra sau implementation; các giá trị giữ nguyên theo review P06 trước đây:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

## 7. Git state và giới hạn

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; HEAD/upstream: `2fe712eed12a2af3b61f0a5311bdd3901f614029` / `origin/BE`.
- Working tree đã có toàn bộ project là untracked ngay từ trước lượt này. Tại đầu lượt có 188 untracked files (gồm prompt/review P06 được cung cấp trong repository); sau report này có 189. `git status --short --branch` bắt đầu `## BE...origin/BE` và root entries là `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/`.
- `git diff --stat` và `git diff --cached --stat` rỗng vì nội dung dự án chưa được Git track; không stage file nào. Danh sách đầy đủ các file untracked sau report được đính kèm ở appendix dưới đây. Không xóa/clean/reset/stash bất kỳ file nào.
- Chỉ kiểm tra PostgreSQL 15.13 Testcontainers cô lập. Không kiểm tra database production/shared, Windows ACL matrix, multi-node scheduling/throughput, process/OS crash consistency hoặc retention/reconciliation lâu dài. Diagnostic logs không phải durable review history. Không kiểm thử deployment production; KYC/history limits vẫn như P06 contract.
- Không có thay đổi schema/reference hoặc P07. R1/R2 **addressed, pending review**, không tự APPROVED.

### Final untracked file inventory

```text
.gitignore
.mvn/wrapper/maven-wrapper.jar
.mvn/wrapper/maven-wrapper.properties
AGENTS.md
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
docs/prompts/P06_FIX_01.md
docs/README.md
docs/reference/BACKEND_CONVENTIONS.md
docs/reference/car_rental_conceptual.drawio
docs/reference/MENTOR_NOTES.md
docs/reference/README.md
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
docs/reports/P06_FIX_01_REPORT.md
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
docs/reviews/P06_REVIEW.md
mvnw
mvnw.cmd
pom.xml
README.md
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
src/main/java/com/carrental/entity/base/AuditedEntity.java
src/main/java/com/carrental/entity/base/BaseEntity.java
src/main/java/com/carrental/entity/Customer.java
src/main/java/com/carrental/entity/Driver.java
src/main/java/com/carrental/entity/UserDocument.java
src/main/java/com/carrental/entity/Voucher.java
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
src/main/java/com/carrental/service/impl/AdminBootstrapService.java
src/main/java/com/carrental/service/impl/AuthServiceImpl.java
src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
src/main/java/com/carrental/service/impl/KycServiceImpl.java
src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java
src/main/java/com/carrental/service/KycPolicy.java
src/main/java/com/carrental/service/KycService.java
src/main/java/com/carrental/service/UserDocumentService.java
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
src/test/java/com/carrental/repository/CustomerStatusLockTest.java
src/test/java/com/carrental/storage/StorageRootBootJarIT.java
src/test/java/com/carrental/storage/StorageRootBootJarProbe.java
src/test/java/com/carrental/storage/StorageRootJarProbe.java
src/test/java/com/carrental/storage/StorageRootPolicyTest.java
src/test/java/com/carrental/TestJwtKeys.java
src/test/java/com/carrental/UserDocumentPostgresIT.java
src/test/java/com/carrental/UserDocumentReviewPostgresIT.java
src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java
```
