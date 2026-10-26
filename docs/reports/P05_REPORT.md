# Báo cáo triển khai P05 — Private documents

**Trạng thái:** `READY_FOR_REVIEW`  
**Ngày:** 2026-10-13  
**Repository/branch:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, `BE`  
**HEAD:** `2fe712eed12a2af3b61f0a5311bdd3901f614029`

P05 triển khai gửi metadata và ảnh giấy tờ mới thành `PENDING`, danh sách/detail có phân quyền owner/admin, và tải ảnh nhị phân qua API có xác thực. Storage là local private ngoài application/public/JAR qua interface có thể thay provider. Không triển khai P06; không sửa schema/entity/migration/reference, không truy cập database chung, không commit/push.

## 1. Hiện trạng ban đầu

- Đã xác nhận repository Desktop được yêu cầu, nhánh `BE`, HEAD ở trên, upstream hiển thị `origin/BE`.
- Java `21.0.8`; project dùng Maven Wrapper `3.9.11`.
- Ngay lần kiểm tra ban đầu, Git đã hiển thị các thư mục/tệp project dưới dạng untracked. Vì vậy `git diff --stat` rỗng không thể phân biệt tệp nào có từ trước và tệp nào được tạo/sửa trong P05. Không stage/reset/clean/stash; toàn bộ snapshot được bảo toàn. Danh sách đầy đủ ở mục 8.
- Các kiểm tra PostgreSQL dùng PostgreSQL 15.13 Testcontainers và dữ liệu/key/ảnh tổng hợp trong test. Không dùng credential thật hoặc database chung.

## 2. Các phần đã triển khai

- **Multipart/API:** `POST /api/user-documents`, `GET /api/user-documents`, `GET /api/user-documents/{id}`, `GET /api/user-documents/{id}/files/{side}`. Kiểm kê part trước khi parse; allowlist scalar/file; từ chối part lạ/lặp, sai slot, query trên POST và input sai. Owner lấy từ principal; mỗi submission tạo row `PENDING` mới, reviewer/reject metadata null. Không sửa KYC, account, driver hoặc bản ghi giấy tờ cũ.
- **Quyền:** CUSTOMER chỉ xem/tải hồ sơ của mình; ADMIN ACTIVE có thể dùng scope all và xem hồ sơ của owner đang LOCKED. Detail/file của owner khác trả 404. Không trả storage locator/path/public URL; summary mask số giấy tờ. Download trả bytes với `no-store`, `nosniff`, content type/length và tên file do server sinh.
- **Storage/ảnh:** `PrivateDocumentStorage` interface cùng local adapter. Mặc định storage tắt; root khi bật phải có sẵn, absolute, writable, không symlink và nằm ngoài application/repository/public/resource/build tree. Adapter dùng UUID, locator grammar chặt, containment/regular-file checks, `CREATE_NEW`, receipts và delete idempotent. Chỉ nhận JPEG/PNG, kiểm tra tên/MIME/signature/decoder, byte/dimension/pixel cap và re-encode canonical bytes để loại phần nối/metadata.
- **Transaction/cleanup:** lưu file trước, khóa và đọc lại owner ACTIVE trong transaction trước khi ghi metadata; trả response sau commit. Rollback xác định dọn receipt của request. Cleanup failure giữ lỗi gốc và ghi log safe context. Outcome không chắc giữ file để tránh xóa nhầm object đã commit; không có distributed transaction/sweeper.
- **Errors/config:** cấu hình `DocumentProperties`, giới hạn multipart Spring đồng bộ với giới hạn app, lỗi payload quá lớn trả `413 PAYLOAD_TOO_LARGE`; lỗi multipart/error HTTP giữ envelope và trace. Không thêm dependency không dùng trong P05.

## 3. File tạo/sửa và vai trò

### Backend và kiểm tra

- `src/main/java/com/carrental/config/DocumentProperties.java`, `DocumentConfiguration.java`, `src/main/resources/application.properties`: storage/upload/list configuration và validation.
- `src/main/java/com/carrental/storage/PrivateDocumentStorage.java`, `LocalPrivateDocumentStorage.java`, `PrivateDocumentReceipt.java`, `PrivateDocumentFile.java`, `UploadedDocumentImage.java`, `DocumentImageFormat.java`, `CanonicalDocumentImage.java`, `DocumentImageInspector.java`: storage abstraction/local adapter, receipt/file model và kiểm tra ảnh.
- `src/main/java/com/carrental/web/UserDocumentMultipartReader.java`: strict multipart inventory/parse.
- `src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java`, `UserDocumentSubmissionCommand.java`, `UserDocumentListQuery.java`; `src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java`, `UserDocumentDetailResponse.java`; `src/main/java/com/carrental/mapper/UserDocumentMapper.java`: hợp đồng request/query/response và mapping.
- `src/main/java/com/carrental/controller/UserDocumentController.java`, `src/main/java/com/carrental/service/UserDocumentService.java`, `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`: HTTP routes, quyền nghiệp vụ, transaction, file lifecycle và query.
- `src/main/java/com/carrental/repository/UserDocumentRepository.java`: database filtering/count/paging extension; không đổi entity/schema.
- `src/main/java/com/carrental/exception/ErrorCode.java`, `GlobalExceptionHandler.java`: 413 và xử lý multipart phù hợp.
- `src/test/java/com/carrental/PrivateDocumentStorageTest.java`, `UserDocumentPostgresIT.java`: storage/image unit tests và HTTP/PostgreSQL/filesystem integration tests.
- `scripts/verify-local-config-packaging.ps1`: packaging probe có synthetic private-document marker và storage-root path marker.

### Tài liệu và cấu hình mẫu

- Tạo `docs/12_PRIVATE_DOCUMENT_STORAGE.md`; cập nhật `docs/03_FUNCTION_1_API.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/10_AUTH_SECURITY.md`, `docs/11_CUSTOMER_PROFILE_ADMIN.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/README.md`, `README.md`, `AGENTS.md`, `config/application-local.properties.example`.
- Cập nhật `docs/IMPLEMENTATION_STATUS.md` thành `READY_FOR_REVIEW` và tạo report này. Không sửa nội dung trong `docs/reference/`, review/report lịch sử hoặc migration.

## 4. Lệnh và kết quả kiểm tra thực tế

| Lệnh | Kết quả |
|---|---|
| `.\mvnw.cmd -B -Dtest=PrivateDocumentStorageTest test` | **PASS** — 5/5 test. |
| `.\mvnw.cmd -B -Ppostgres-it "-Dit.test=UserDocumentPostgresIT" failsafe:integration-test failsafe:verify` | **PASS** — 10/10 P05 PostgreSQL/HTTP integration tests. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS** — `BUILD SUCCESS`; Surefire 24/24, Failsafe 48/48; tổng 72, failures/errors/skipped đều 0. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\scripts\verify-local-config-packaging.ps1` | **PASS** — isolated package build và marker/path scan hoàn tất. |

Phân bổ full verify:

| Suite | Test | Fail | Error | Skip | Kết quả |
|---|---:|---:|---:|---:|---|
| `CustomerPropertiesTest` | 1 | 0 | 0 | 0 | PASS |
| `JwtConfigurationTest` | 4 | 0 | 0 | 0 | PASS |
| `PlatformHttpTest` | 13 | 0 | 0 | 0 | PASS |
| `PrivateDocumentStorageTest` | 5 | 0 | 0 | 0 | PASS |
| `CustomerStatusLockTest` | 1 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` | 14 | 0 | 0 | 0 | PASS |
| `CustomerManagementPostgresIT` | 17 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` | 7 | 0 | 0 | 0 | PASS |
| `UserDocumentPostgresIT` | 10 | 0 | 0 | 0 | PASS |
| **Tổng** | **72** | **0** | **0** | **0** | **PASS** |

P05 integration kiểm chứng HTTP multipart/bearer thật, PNG tổng hợp, file IO thật dưới root tạm ngoài repository, row/status/locator trong PostgreSQL cô lập, download owner/admin, foreign-owner 404, strict duplicate/unknown/mismatch/date errors, file cap 413, lỗi ghi file thứ hai, rollback sau persist/flush thật, recheck account đã LOCKED, unknown transaction outcome và log/cleanup failure. Fault ở storage/service/transaction được inject ở đúng điểm; phần I/O và DB được assert trên filesystem/PostgreSQL thật. `TransactionSystemException` unknown-outcome là mô phỏng bằng fault injection, không phải ngắt kết nối/commit ambiguity thật.

### HTTP health quan sát trong full verify

`Function1PostgresIT` khởi chạy web application trên cổng localhost ngẫu nhiên và gọi `GET /api/health` thật. Quan sát HTTP **200**, `Content-Type: application/json`, envelope `success=true`, `code=OK`, `data.status=UP`; assertion xác nhận `traceId` trong body trùng `X-Request-ID`. Trace quan sát: `365cc68b-2136-4a6f-9456-5be042871796`.

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"365cc68b-2136-4a6f-9456-5be042871796"}
```

Log redirect PowerShell hiển thị sai glyph tiếng Việt ở dòng chẩn đoán (`Th�nh c�ng`); test assertion trên HTTP body UTF-8 đã qua. JSON trên phản ánh body mà assertion kiểm tra, không dùng chuỗi console bị lỗi encoding làm bằng chứng nội dung message.

### Packaging probe

Probe tạo project copy/JAR và synthetic markers trong thư mục tạm; test bị skip bên trong **chỉ probe packaging**. Output thực tế:

```text
PROBE_BUILD=PASS
LOCAL_CONFIG_ENTRY_PACKAGED=False
FAKE_LOCAL_CONFIG_MARKER_PACKAGED=False
FAKE_PRIVATE_KEY_MARKER_PACKAGED=False
FAKE_BOOTSTRAP_SECRET_MARKER_PACKAGED=False
FAKE_PRIVATE_DOCUMENT_MARKER_PACKAGED=False
PRIVATE_STORAGE_ROOT_PATH_PACKAGED=False
PRIVATE_KEY_ENTRY_PACKAGED=False
```

Một lần gọi probe khi shell chưa có `JAVA_HOME` dừng tại precondition, không build; gọi lại với JDK 21 ở trên đã PASS. Probe không thay thế full `clean verify`.

## 5. Schema/reference và quyết định

Không sửa schema leader, entity hoặc Flyway migration. SHA-256 hiện tại khớp với bằng chứng P04-FIX-01:

| File | SHA-256 |
|---|---|
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

Schema không có khác biệt: P05 dùng hai cột locator ảnh hiện có và không thêm unique rule PENDING. Giới hạn JPEG/PNG, dung lượng/pixel, mask và pagination là baseline kỹ thuật cấu hình được, không phải policy KYC/sản phẩm đã duyệt. Khi outcome DB không chắc, file receipt được giữ để đối soát an toàn; đây là quyết định tránh xóa nhầm file có thể đã commit.

## 6. Còn hạn chế/chưa kiểm chứng

- Chưa kiểm tra ACL bị từ chối trên Windows, vì không thay ACL/môi trường người dùng. Root hợp lệ đã được kiểm tra bằng thư mục tạm; local storage deployment vẫn cần operator tạo root ngoài app và cấp quyền tối thiểu.
- Fault-injection bao phủ rollback sau flush và phân nhánh unknown outcome, nhưng không mô phỏng được process kill/network drop đúng thời điểm commit; không có sweeper/reconciliation tool cho orphan sau crash.
- Không chạy đồng thời hai submission có latch xác nhận không giao thoa cleanup; race qua admin lock được kiểm tra bằng stale principal sau khi row đã LOCKED, chưa phải bài test barrier HTTP concurrent.
- Không chạy toàn bộ biến thể payload/image adversarial trong prompt (ví dụ mọi MIME giả, file hỏng/SVG/ZIP/PDF, duplicate cho từng slot, symlink Windows/reparse, output cap). Unit/HTTP tests đã nêu ở mục 4 không được hiểu là PASS cho những case chưa có assertion riêng.
- Storage local không mã hóa dữ liệu, không có antivirus, backup/retention, multi-node coordination hay durable recovery. `413` từ reverse proxy/container nằm ngoài app có thể không có JSON trace; probe xác nhận giới hạn do app xử lý.
- Không dùng ảnh giấy tờ thật, credentials/key/token thật, database chung hoặc cấu hình deploy thật. P06 review/KYC, đổi KYC status, duyệt/từ chối, driver/bank/voucher workflows chưa bắt đầu.

Những giới hạn trên được để reviewer đánh giá; trạng thái P05 là `READY_FOR_REVIEW`, không phải `APPROVED`.

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

`git diff --stat` không có output vì snapshot project hiện ở dạng untracked; không có file nào được stage. Không commit/push. `git ls-files --others --exclude-standard` đầy đủ tại thời điểm báo cáo:

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
docs/reports/P05_REPORT.md
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
docs/reviews/P02_REVIEW.md
docs/reviews/P03_FIX_01_REVIEW.md
docs/reviews/P03_REVIEW.md
docs/reviews/P04_FIX_01_REVIEW.md
docs/reviews/P04_REVIEW.md
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
src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java
src/main/java/com/carrental/storage/PrivateDocumentFile.java
src/main/java/com/carrental/storage/PrivateDocumentReceipt.java
src/main/java/com/carrental/storage/PrivateDocumentStorage.java
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
src/test/java/com/carrental/repository/CustomerStatusLockTest.java
```

