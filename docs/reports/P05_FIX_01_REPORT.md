# Báo cáo P05-FIX-01 — Integrity, transaction outcome, storage root và race tests

**Trạng thái:** `READY_FOR_REVIEW` — R1–R4 được xử lý, chờ reviewer xác nhận.  
**Ngày:** 2026-10-14  
**Repository/branch:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, `BE`  
**HEAD:** `2fe712eed12a2af3b61f0a5311bdd3901f614029`

P05-FIX-01 sửa findings của [review P05](../reviews/P05_REVIEW.md). P01–P04 và schema leader được giữ nguyên. Không triển khai P06; không chạy database chung, commit, push hoặc deploy.

## 1. Hiện trạng và môi trường

- Đã xác nhận đúng repository Desktop, nhánh `BE`, HEAD nêu trên; upstream hiển thị `origin/BE`.
- Khi bắt đầu, project đã ở trạng thái untracked theo các thư mục gốc `.mvn/`, `config/`, `docs/`, `scripts/`, `src/` và các file root. Vì vậy `git diff` trống không được dùng làm bằng chứng workspace sạch. Không stage, reset, clean hoặc stash; nội dung sẵn có được bảo toàn.
- Java `21.0.8`; Maven Wrapper `3.9.11`; Docker Desktop `28.5.2`. Các PostgreSQL tests chạy PostgreSQL `15.13` bằng Testcontainers cô lập.
- Không đọc/in hàng loạt environment variables. Không dùng key, password, bearer token, ảnh giấy tờ thật hoặc database chung.

## 2. Findings đã xử lý

### R1 — JPEG/PNG bị cắt và decoder recovery

- Thêm structural validation trước decode: JPEG kiểm tra marker/segment, frame, scan entropy và EOI; PNG kiểm tra signature, IHDR đầu tiên, độ dài chunk, CRC, IDAT và IEND.
- ImageReader warning làm input/stored file bị từ chối bằng signal tĩnh; không so khớp thông điệp localized và không log nội dung warning.
- `inspect` và `validateStored` dùng completeness guard. Một stored image bị cắt không được trả bytes; authorized download trả lỗi 500 JSON/trace an toàn và metadata locator không tự sửa.
- JPEG/PNG hợp lệ vẫn được nhận. Appended sentinel/metadata được canonicalize khỏi output; không chỉ kiểm tra “marker cuối file”. Giữ full decode, byte/pixel/dimension và output-size caps.
- Bằng chứng: synthetic HTTP JPEG/PNG control đọc lại được; JPEG thiếu EOI/cắt giữa entropy, PNG cắt ở cuối/corrupt CRC và MIME/signature giả không tạo row/file; output cap dùng ảnh tổng hợp mà encoder thực sự vượt giới hạn.

### R2 — Dọn file theo transaction completion

- Bỏ phân loại outcome dựa trên exception class/cause. Submission dùng transaction `REQUIRES_NEW` và trạng thái từ `TransactionSynchronization.afterCompletion`: `COMMITTED`, `ROLLED_BACK`, `UNKNOWN` cùng trạng thái chưa bắt đầu/không có DB work.
- Rollback xác nhận hoặc lỗi trước DB transaction dọn đúng receipts của request; commit xác nhận giữ files; completion `UNKNOWN` giữ receipts cho đối soát và chỉ ghi trace/actor/opaque receipt IDs. Cleanup lỗi được thêm suppressed, giữ primary exception và log không đính throwable/path/locator.
- PostgreSQL test giữ owner row bằng connection khác với `FOR UPDATE`, app HTTP đã xác thực và đã ghi file rồi gặp lock timeout 300 ms. Kết quả quan sát/assert: 503 `DEPENDENCY_UNAVAILABLE` có trace, 0 row, file delta 0 sau rollback; sau khi nhả lock, retry trả 201 và row/file khớp.
- Lỗi sau `saveAndFlush` với rollback PostgreSQL đã xác nhận dọn file. Hai test transaction-manager fault-injection phát completion `UNKNOWN` và `COMMITTED` ở commit boundary rồi ném lỗi: receipt được giữ cả hai trường hợp; log unknown chỉ có safe recovery context. Đây là completion injection, không phải mô phỏng process/network crash thật.

### R3 — Protected roots theo vị trí ứng dụng thật

- Thêm `StorageRootPolicy`, lấy app location từ `ProtectionDomain.CodeSource`, không dựa vào `user.dir`. Guard bảo vệ class/artifact location, parent JAR và project/build/Git root gần nhất, nhưng không cấm mọi thư mục tạm chỉ vì CWD rộng.
- Giữ kiểm tra canonical containment, absolute/existing directory, writable và no-symlink root; diagnostic không trả path qua HTTP.
- Tests từ chối app/config, public/resource/build và folder tùy tên trong app tree khi CWD khác; cho phép temp root ngoài app. Probe đóng gói JAR tạm và launch bằng CWD khác, đồng thời kiểm tra exploded source location. Không ghi fixture ảnh vào repo/config.
- ACL Windows không bị thay đổi; kiểm tra ACL-denied được để là limitation.

### R4 — Hai race tests đồng thời

- **Submission A/B:** HTTP requests chạy đồng thời với barrier sau `persist/flush` thật. A được fault-inject rollback; B commit. Assert A không còn row/file; B giữ nguyên metadata, audit, locator trong DB, bytes/download; cleanup của A không xóa file B.
- **Upload/admin lock:** upload đã xác thực và file đã được storage thật ghi; barrier giữ request trước owner transaction. Admin HTTP status command commit `LOCKED`, sau đó request được mở barrier. Upload recheck trả 401 `INVALID_TOKEN`, không row/file/success log; account và audit giữ trạng thái khóa.
- Latches/executors có timeout và nhả barrier trong cleanup; không thay repository/storage/transaction thật bằng receipt/IO giả. Cùng test class còn chạy strict multipart, caps, list/download, storage disabled và corruption matrix.

## 3. Files được tạo/sửa và vai trò

**Production code**

- `src/main/java/com/carrental/storage/ImageStructureValidator.java` — structural JPEG/PNG completeness/CRC checks.
- `src/main/java/com/carrental/storage/DocumentImageInspector.java` — reject decoder warnings và validate upload/stored image trước/sau storage.
- `src/main/java/com/carrental/storage/StorageRootPolicy.java` — derive/protect CodeSource/artifact/project roots.
- `src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java` — dùng root policy mới trong startup validation.
- `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java` — cleanup theo synchronization outcome; safe unknown/commit logs.

**Tests**

- `src/test/java/com/carrental/PrivateDocumentStorageTest.java` — truncated/corrupt/appended image, stored validation và actual encoded output cap.
- `src/test/java/com/carrental/UserDocumentPostgresIT.java` — HTTP/PostgreSQL/file regression, real lock timeout, cap/multipart, rollback, races, admin lock.
- `src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java` — injected UNKNOWN/COMMITTED completion-boundary outcomes và safe log checks.
- `src/test/java/com/carrental/storage/StorageRootPolicyTest.java` — exploded/JAR location, CWD khác, protected tùy tên và valid outside temp root.
- `src/test/java/com/carrental/storage/StorageRootJarProbe.java` — child-process entry point cho JAR root-policy test.

**Tài liệu**

- `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/03_FUNCTION_1_API.md` — cập nhật P05 contracts và evidence.
- `docs/LOCAL_DEVELOPMENT.md`, `config/application-local.properties.example` — mô tả CodeSource protected roots và giới hạn fixture/test.
- `AGENTS.md`, `README.md`, `docs/README.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/10_AUTH_SECURITY.md`, `docs/IMPLEMENTATION_STATUS.md` — trạng thái READY_FOR_REVIEW, P06 vẫn NOT_STARTED.
- `docs/reports/P05_FIX_01_REPORT.md` — báo cáo này; historical `P05_REPORT.md`, review files, `docs/reference/` được giữ nguyên.

## 4. Lệnh thực tế và kiểm tra

| Lệnh | Kết quả |
|---|---|
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B "-Dtest=PrivateDocumentStorageTest,StorageRootPolicyTest,UserDocumentTransactionOutcomeTest" test` | **PASS 11/11** targeted unit tests: private storage 7, root policy 2, transaction outcome 2. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B -Ppostgres-it test-compile "-Dit.test=UserDocumentPostgresIT#frameworkFileSizeLimitReturnsTracedPayloadTooLargeWithoutPersistence" failsafe:integration-test failsafe:verify` | **PASS 1/1** trên PostgreSQL Testcontainers; kiểm tra file/request cap và traced 413. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS — BUILD SUCCESS**, 83/83: Surefire 30/30, Failsafe 53/53; failures 0, errors 0, skipped 0. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\scripts\verify-local-config-packaging.ps1` | **PASS** — isolated JAR packaging probe bên dưới. |

> Một lần chạy Failsafe trực tiếp trước khi gọi `test-compile` đã dùng test bytecode cũ và báo lỗi Mockito ở row-lock test; lượt sau biên dịch lại source. Bài test request-cap toàn request ban đầu gặp socket close của connector khi fixture dùng giới hạn mặc định. Fixture PostgreSQL sau đó đặt Tomcat form-post cap cao hơn app multipart cap và `max-swallow-size=-1` chỉ trong test context; targeted request-cap test và full clean verify đều PASS. Production upload caps không thay đổi. Lần chạy exploratory không được tính là PASS; kết quả cuối được lấy từ clean rebuild ở bảng trên.

### Tổng hợp Surefire/Failsafe cuối cùng

| Suite | Tests | Failures | Errors | Skipped | Kết quả |
|---|---:|---:|---:|---:|---|
| `PlatformHttpTest` | 13 | 0 | 0 | 0 | PASS |
| `JwtConfigurationTest` | 4 | 0 | 0 | 0 | PASS |
| `CustomerPropertiesTest` | 1 | 0 | 0 | 0 | PASS |
| `CustomerStatusLockTest` | 1 | 0 | 0 | 0 | PASS |
| `PrivateDocumentStorageTest` | 7 | 0 | 0 | 0 | PASS |
| `StorageRootPolicyTest` | 2 | 0 | 0 | 0 | PASS |
| `UserDocumentTransactionOutcomeTest` | 2 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` | 14 | 0 | 0 | 0 | PASS |
| `CustomerManagementPostgresIT` | 17 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` | 7 | 0 | 0 | 0 | PASS |
| `UserDocumentPostgresIT` | 15 | 0 | 0 | 0 | PASS |
| **Tổng** | **83** | **0** | **0** | **0** | **PASS** |

### Packaging probe

`verify-local-config-packaging.ps1`: `PROBE_BUILD=PASS`. Các scan kết quả đều `False`: `application-local.properties`, fake local config marker, fake private-key marker, fake bootstrap secret, fake private-document marker, private storage root path và private-key entry không được đóng gói vào executable JAR. Probe build trong temporary copy; không commit marker/secret fixture.

## 5. Schema/reference và quyết định

Không sửa schema leader, entity, Flyway migration hoặc file trong `docs/reference/`. SHA-256 cuối khớp bằng chứng report P05 ban đầu:

| File | SHA-256 |
|---|---|
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

## 6. Hạn chế và phạm vi chưa kiểm chứng

- `UNKNOWN` và lỗi sau `COMMITTED` được chứng minh bằng test-controlled transaction manager gọi đúng `afterCompletion` boundary; không mô phỏng process kill, power loss hoặc network partition trong production.
- PostgreSQL/filesystem không atomic chung; crash giữa file write/DB commit/response vẫn có thể cần đối soát. Không có sweeper hoặc durable recovery table trong P05.
- Chưa kiểm tra Windows ACL bị từ chối; test không đổi ACL. Chưa tuyên bố kiểm tra mọi codec/payload hoặc mọi biến thể symlink/junction trên mọi filesystem.
- Test connector tăng giới hạn form-post và swallow trong riêng fixture để đo được JSON `413` do application multipart cap; proxy/container production có thể tự trả 413/đóng kết nối trước app và không có JSON trace.
- Packaging probe bỏ qua tests trong temporary copy; nó chỉ chứng minh excludes/markers. Full verification riêng chạy trước và đạt 83/83.
- Không có thay đổi runtime limits, API/DTO, owner/admin scope, schema hoặc KYC. P06 chưa bắt đầu.

## 7. Git status và diff summary

Kết quả cuối của `git status --short --branch`:

```text
## BE...origin/BE
?? .gitignore
?? .mvn/
?? AGENTS.md
?? README.md
?? config/
?? docs/
?? mvnw
?? mvnw.cmd
?? pom.xml
?? scripts/
?? src/
```

`git diff --stat` và `git diff --cached --stat` không có output vì toàn bộ project vẫn đang untracked; không có file staged. Không commit/push. `git ls-files --others --exclude-standard` báo 166 file tại thời điểm hoàn tất; danh sách đầy đủ:

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
docs/prompts/P05_PRIVATE_DOCUMENTS.md
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
docs/reports/P05_REPORT.md
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
docs/reviews/P02_REVIEW.md
docs/reviews/P03_FIX_01_REVIEW.md
docs/reviews/P03_REVIEW.md
docs/reviews/P04_FIX_01_REVIEW.md
docs/reviews/P04_REVIEW.md
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
src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java
src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java
src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java
src/main/java/com/carrental/dto/response/ApiResponse.java
src/main/java/com/carrental/dto/response/CustomerAdminResponse.java
src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java
src/main/java/com/carrental/dto/response/FieldErrorResponse.java
src/main/java/com/carrental/dto/response/HealthResponse.java
src/main/java/com/carrental/dto/response/PageResponse.java
src/main/java/com/carrental/dto/response/TokenResponse.java
src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java
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
src/main/java/com/carrental/service/UserDocumentService.java
src/main/java/com/carrental/service/impl/AdminBootstrapService.java
src/main/java/com/carrental/service/impl/AuthServiceImpl.java
src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
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
src/test/java/com/carrental/PlatformHttpTest.java
src/test/java/com/carrental/PlatformTestFixtures.java
src/test/java/com/carrental/PrivateDocumentStorageTest.java
src/test/java/com/carrental/TestJwtKeys.java
src/test/java/com/carrental/UserDocumentPostgresIT.java
src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java
src/test/java/com/carrental/repository/CustomerStatusLockTest.java
src/test/java/com/carrental/storage/StorageRootJarProbe.java
src/test/java/com/carrental/storage/StorageRootPolicyTest.java
```
