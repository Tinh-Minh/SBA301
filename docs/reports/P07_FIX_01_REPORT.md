# Báo cáo P07-FIX-01 — Predicate GPLX nonblank

Ngày: 2026-10-14  
Trạng thái: **READY_FOR_REVIEW**  
Finding R1: **addressed, chờ reviewer xác nhận**. P07 chưa được đánh dấu APPROVED; P08 chưa triển khai.

## Kết quả

Đã sửa điều kiện `license_class` trong projection current eligibility để khớp chính xác với Java 21 `!value.strip().isEmpty()`. Thay đổi giữ một aggregate SQL statement; không hydrate mọi giấy tờ, không thêm query, không sửa schema/entity/migration/reference, P06 approval rules, U-14/U-15, lock/transaction, Clock, API, stored driver status hoặc current eligibility policy.

Java tạo một lần tập gồm **25 code point** thỏa `Character.isWhitespace(int)` và truyền tập này vào PostgreSQL `btrim(text, characters)`. Vì dùng đúng JDK semantics, TAB, EM SPACE và các Java whitespace khác được loại; NBSP không bị trim, giống `String.strip()`. Đây không phải locale/POSIX `\s` và không phải danh sách vá riêng hai ký tự của probe.

## Hiện trạng và môi trường

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`.
- HEAD và `origin/BE`: `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Java: Oracle JDK 21.0.8; Maven Wrapper: 3.9.11; Docker Engine: 28.5.2. Integration tests dùng PostgreSQL 15.13 Testcontainers cô lập.
- Trước khi tạo report, `git status --short --branch` cho `## BE...origin/BE` và các nhóm root `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/` ở trạng thái untracked. Repository vốn được reviewer xác nhận chưa track; không dùng `git diff` trống để suy ra không có implementation.
- Không có thay đổi staged hoặc tracked diff; giữ nguyên toàn bộ file và lịch sử sẵn có. Không commit/push, không đổi branch, không dùng DB chung.

## Thay đổi

| File | Vai trò |
|---|---|
| `src/main/java/com/carrental/repository/CustomerRepository.java` | Giữ aggregate projection; thay `btrim` mặc định bằng trim character set truyền vào query. Các predicate owner/type/status/expiry và `bool_or` không đổi. |
| `src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java` | Tạo tập Unicode bằng `Character.isWhitespace` trên Java 21 và bind vào đúng query hiện hữu. |
| `src/test/java/com/carrental/DriverProfilePostgresIT.java` | Thêm ma trận projection PostgreSQL theo `String.strip()` và HTTP regression cho PENDING/ACTIVE/SUSPENDED; kiểm tra trace, reason, audit, event và storage. |
| `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/README.md` | Cập nhật trạng thái hiện tại và chỉ dẫn tiếp tục; P07-FIX-01 READY_FOR_REVIEW, P08 NOT_STARTED. |
| `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md` | Đồng bộ trạng thái/hợp đồng triển khai hiện hành; giữ lịch sử và chính sách liên quan. |
| `docs/14_DRIVER_PROFILE_ELIGIBILITY.md` | Ghi semantics Java strip, ranh giới NBSP và single-query projection đã sửa. |
| `docs/LOCAL_DEVELOPMENT.md` | Cập nhật hướng dẫn fixture cô lập và trạng thái fix. |
| `docs/reports/P07_FIX_01_REPORT.md` | Báo cáo hiện tại; không sửa `P07_REPORT.md` hoặc review/prompt lịch sử. |

## Finding R1 và regression

Review P07 đã ghi nhận trước sửa: predicate mặc định `btrim(d.license_class)` chỉ trim ASCII space; GPLX APPROVED legacy/import có class TAB hoặc EM SPACE có thể làm activation thành công và current eligibility sai. ASCII space bị từ chối đúng. Đây là dữ liệu đã được seed trực tiếp vào PostgreSQL test theo schema leader; không phải P06 HTTP approval bypass. P06 approval tiếp tục từ chối hồ sơ blank theo rules đã duyệt.

`DriverProfilePostgresIT.postgresProjectionMatchesJava21StripForWhitespaceMatrixAndPositiveControls` gọi production `DriverEligibilityService`/repository trên PostgreSQL thật, không copy SQL vào test. Ma trận có 32 giá trị: 25 Java `Character.isWhitespace` code point riêng lẻ; chuỗi rỗng và ba chuỗi whitespace ghép (trong đó có TAB+EM SPACE, CR/LF/form-feed, U+1680/U+2028/U+2029/U+3000); cùng `B`, whitespace quanh `B` và NBSP. Tất cả đều vừa giới hạn `varchar(10)`/CHECK của schema. Có 29 input values là blank theo Java; `B`, ` B ` và NBSP đúng là nonblank theo Java. Mỗi kết quả SQL được so với `!licenseClass.strip().isEmpty()`. Một GPLX blank xen cùng một proof ` B ` hợp lệ vẫn trả true.

`DriverProfilePostgresIT.blankApprovedLegacyLicenseCannotActivateOrAppearCurrentlyEligible` seed trực tiếp các GPLX legacy APPROVED TAB/EM SPACE chỉ trong Testcontainers. Bằng HTTP thật, owner/admin/internal evaluation đều thấy current flag false. Với profile PENDING, owner GET trả `hasValidDriverLicense=false`, `eligibleNow=false`, reason `DRIVER_NOT_ACTIVE`; ADMIN khác PATCH ACTIVE trả **409 `DRIVER_NOT_ELIGIBLE`**, trace trong body bằng `X-Request-ID`, profile vẫn PENDING. Với stored ACTIVE, owner/admin/internal đều false với reason `VALID_DRIVER_LICENSE_REQUIRED`; ACTIVE→ACTIVE trả 409 và không tự suspend hay sửa audit. SUSPENDED→ACTIVE cũng trả 409.

Regression kiểm tra `created_at`/`updated_at` của customer, driver và documents không đổi; không có committed driver event theo trace lỗi; private storage spy không bị gọi. Positive P05 upload → P06 HTTP approval → P07 activation flow hiện có vẫn chạy trong full suite và kết thúc `201` create, ACTIVE, current eligible true. Ma trận marker quan sát được: `P07_FIX_01_STRIP_MATRIX cases=32 javaWhitespaceCases=29 ... multipleProof=true`; HTTP marker xác nhận PENDING/ACTIVE/SUSPENDED, owner/admin/internal, audit ổn định, không event/storage.

## Lệnh thực tế và kết quả

1. Targeted command:

   ```powershell
   $env:JAVA_HOME='C:\Program Files\Java\jdk-21'
   .\mvnw.cmd -B '-Dit.test=DriverProfilePostgresIT' verify -Ppostgres-it
   ```

   **PASS** — Surefire 38/38 và `DriverProfilePostgresIT` 12/12; 0 failure/error/skip. Có cả hai regression mới.

2. Lần đầu chạy `clean verify` với log redirect bên trong `target` đã dừng tại Maven Clean vì tiến trình đang giữ file log. Không có test chạy trong lần đó. Đây là lỗi vị trí file log của lệnh, không phải lỗi source. Tôi chuyển log ra `%TEMP%` và chạy lại:

   ```powershell
   $env:JAVA_HOME='C:\Program Files\Java\jdk-21'
   $verifyLog=Join-Path $env:TEMP 'SBA301_P07_FIX_01_clean_verify.log'
   .\mvnw.cmd -B clean verify -Ppostgres-it *> $verifyLog
   ```

   **PASS, exit 0** — Surefire **38/38**, Failsafe **88/88**, tổng **126/126**, 0 failure/error/skip; `BUILD SUCCESS`. Failsafe breakdown: `AuthSecurityPostgresIT` 14, `CustomerManagementPostgresIT` 17, `DriverConcurrencyPostgresIT` 6, `DriverProfilePostgresIT` 12, `Function1PostgresIT` 7, `StorageRootBootJarIT` 1, `UserDocumentPostgresIT` 16, `UserDocumentReviewPostgresIT` 15. Actual Boot JAR test `StorageRootBootJarIT.actualBootJarProtectsPhysicalApplicationTreeAndAcceptsExternalRootFromAnotherWorkingDirectory` chạy JAR từ unrelated CWD, từ chối project/config/public/target roots, chấp nhận external root; disabled storage khởi động không cần root.

3. Packaging probe đúng helper của repository:

   ```powershell
   $env:JAVA_HOME='C:\Program Files\Java\jdk-21'
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
   ```

   **PASS, exit 0** — isolated Maven build thành công. `application-local.properties`, fake local config/private-key/bootstrap/document markers, private storage root path, private key entry và test Boot root helper đều báo `False` (không đóng gói vào JAR). Probe cố ý skip tests trong bản sao; full verification ở lệnh trên chạy toàn bộ tests.

4. Health HTTP thực tế chạy trong `UserDocumentReviewPostgresIT.healthIsUpOverHttpWithPostgresContextAndMatchingTrace` với PostgreSQL 15.13: **HTTP 200**, `data.status=UP`, `postgresContext=true`, trace body/header bằng nhau. Response body và header quan sát được:

   ```json
   X-Request-ID: `9a202640-1dc8-44fc-8efc-6af1f88a857c`
   {"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"9a202640-1dc8-44fc-8efc-6af1f88a857c"}
   ```

## Schema/reference và lịch sử

SHA-256 được lấy sau verification; các file nguồn và lịch sử giữ nguyên:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `docs/reference/MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `docs/reports/P07_REPORT.md` | `3D18C28E4C3FAEB6117FE3937622B3CE84CC9E12A7C4A5CB23FFB26A25E3B05B` |

## Trạng thái, khác biệt và hạn chế

- **PASS:** source fix; targeted test; full clean verify; packaging; actual Boot JAR from different CWD; HTTP health/trace; schema/reference/history hash preservation.
- **FAIL:** lần `clean` đầu chỉ vì log mở trong `target`; lần chạy lại toàn bộ PASS như ghi trên.
- **SKIPPED:** không có test bị skip trong targeted/full verification. Packaging probe cố ý không chạy tests trong thư mục sao chép, sau khi full verification đã qua.
- Không có sai khác với U-14/U-15 hoặc schema. PostgreSQL expression là cách triển khai cụ thể được prompt cho phép: JDK-derived explicit trim set trong cùng query.
- Chỉ kiểm chứng bằng Testcontainers và temporary test resources; không chạy SQL trên DB chung/production, không triển khai P08, không commit/push. R1 được **addressed**, chưa được reviewer xác nhận CLOSED.

## Git status và inventory

Branch `BE`, HEAD `2fe712eed12a2af3b61f0a5311bdd3901f614029` (`origin/BE`); staged count 0; `git diff --stat` và `git diff --cached --stat` trống vì repository vốn chưa track project files. Sau khi thêm báo cáo này, toàn bộ **213** đường dẫn bên dưới vẫn là **untracked** (báo cáo đã được tính). Danh sách đầy đủ được chụp bằng `git ls-files --others --exclude-standard`:

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
- ``docs/12_PRIVATE_DOCUMENT_STORAGE.md``
- ``docs/13_DOCUMENT_REVIEW_KYC.md``
- ``docs/14_DRIVER_PROFILE_ELIGIBILITY.md``
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
- ``docs/prompts/P05_FIX_01.md``
- ``docs/prompts/P05_FIX_02.md``
- ``docs/prompts/P05_PRIVATE_DOCUMENTS.md``
- ``docs/prompts/P06_DOCUMENT_REVIEW_KYC.md``
- ``docs/prompts/P06_FIX_01.md``
- ``docs/prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md``
- ``docs/prompts/P07_FIX_01.md``
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
- ``docs/reports/P05_FIX_01_REPORT.md``
- ``docs/reports/P05_FIX_02_REPORT.md``
- ``docs/reports/P05_REPORT.md``
- ``docs/reports/P06_FIX_01_REPORT.md``
- ``docs/reports/P06_REPORT.md``
- ``docs/reports/P07_FIX_01_REPORT.md``
- ``docs/reports/P07_REPORT.md``
- ``docs/reviews/P01_FIX_01_REVIEW.md``
- ``docs/reviews/P01_REVIEW.md``
- ``docs/reviews/P02_REVIEW.md``
- ``docs/reviews/P03_FIX_01_REVIEW.md``
- ``docs/reviews/P03_REVIEW.md``
- ``docs/reviews/P04_FIX_01_REVIEW.md``
- ``docs/reviews/P04_REVIEW.md``
- ``docs/reviews/P05_FIX_01_REVIEW.md``
- ``docs/reviews/P05_FIX_02_REVIEW.md``
- ``docs/reviews/P05_REVIEW.md``
- ``docs/reviews/P06_FIX_01_REVIEW.md``
- ``docs/reviews/P06_REVIEW.md``
- ``docs/reviews/P07_REVIEW.md``
- ``mvnw``
- ``mvnw.cmd``
- ``pom.xml``
- ``scripts/verify-local-config-packaging.ps1``
- ``src/main/java/com/carrental/CarRentalApplication.java``
- ``src/main/java/com/carrental/config/ClockConfig.java``
- ``src/main/java/com/carrental/config/CustomerProperties.java``
- ``src/main/java/com/carrental/config/DocumentConfiguration.java``
- ``src/main/java/com/carrental/config/DocumentProperties.java``
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
- ``src/main/java/com/carrental/controller/DriverController.java``
- ``src/main/java/com/carrental/controller/HealthController.java``
- ``src/main/java/com/carrental/controller/UserDocumentController.java``
- ``src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java``
- ``src/main/java/com/carrental/dto/request/auth/LoginRequest.java``
- ``src/main/java/com/carrental/dto/request/auth/RegisterRequest.java``
- ``src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java``
- ``src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java``
- ``src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java``
- ``src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java``
- ``src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java``
- ``src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java``
- ``src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java``
- ``src/main/java/com/carrental/dto/request/driver/ChangeDriverStatusRequest.java``
- ``src/main/java/com/carrental/dto/request/driver/DriverListQuery.java``
- ``src/main/java/com/carrental/dto/response/ApiResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerAdminResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerProfileResponse.java``
- ``src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java``
- ``src/main/java/com/carrental/dto/response/DriverEligibilityReasonCode.java``
- ``src/main/java/com/carrental/dto/response/DriverEligibilityResponse.java``
- ``src/main/java/com/carrental/dto/response/DriverResponse.java``
- ``src/main/java/com/carrental/dto/response/FieldErrorResponse.java``
- ``src/main/java/com/carrental/dto/response/HealthResponse.java``
- ``src/main/java/com/carrental/dto/response/KycSummaryResponse.java``
- ``src/main/java/com/carrental/dto/response/PageResponse.java``
- ``src/main/java/com/carrental/dto/response/TokenResponse.java``
- ``src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java``
- ``src/main/java/com/carrental/dto/response/UserDocumentReviewResponse.java``
- ``src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java``
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
- ``src/main/java/com/carrental/mapper/DriverMapper.java``
- ``src/main/java/com/carrental/mapper/UserDocumentMapper.java``
- ``src/main/java/com/carrental/repository/BankAccountRepository.java``
- ``src/main/java/com/carrental/repository/CustomerRepository.java``
- ``src/main/java/com/carrental/repository/CustomerStatusLock.java``
- ``src/main/java/com/carrental/repository/DriverEligibilityProjection.java``
- ``src/main/java/com/carrental/repository/DriverRepository.java``
- ``src/main/java/com/carrental/repository/KycEvidenceProjection.java``
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
- ``src/main/java/com/carrental/service/DocumentReviewLogger.java``
- ``src/main/java/com/carrental/service/DriverChangeLogger.java``
- ``src/main/java/com/carrental/service/DriverEligibilityPolicy.java``
- ``src/main/java/com/carrental/service/DriverEligibilityService.java``
- ``src/main/java/com/carrental/service/DriverService.java``
- ``src/main/java/com/carrental/service/KycPolicy.java``
- ``src/main/java/com/carrental/service/KycService.java``
- ``src/main/java/com/carrental/service/UserDocumentService.java``
- ``src/main/java/com/carrental/service/impl/AdminBootstrapService.java``
- ``src/main/java/com/carrental/service/impl/AuthServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/CustomerServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/DriverServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/KycServiceImpl.java``
- ``src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java``
- ``src/main/java/com/carrental/storage/CanonicalDocumentImage.java``
- ``src/main/java/com/carrental/storage/DocumentImageFormat.java``
- ``src/main/java/com/carrental/storage/DocumentImageInspector.java``
- ``src/main/java/com/carrental/storage/ImageStructureValidator.java``
- ``src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java``
- ``src/main/java/com/carrental/storage/PrivateDocumentFile.java``
- ``src/main/java/com/carrental/storage/PrivateDocumentReceipt.java``
- ``src/main/java/com/carrental/storage/PrivateDocumentStorage.java``
- ``src/main/java/com/carrental/storage/StorageRootPolicy.java``
- ``src/main/java/com/carrental/storage/UploadedDocumentImage.java``
- ``src/main/java/com/carrental/validation/PasswordPolicyValidator.java``
- ``src/main/java/com/carrental/validation/ValidPassword.java``
- ``src/main/java/com/carrental/web/RequestTraceFilter.java``
- ``src/main/java/com/carrental/web/UserDocumentMultipartReader.java``
- ``src/main/resources/application.properties``
- ``src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql``
- ``src/test/java/com/carrental/AuthSecurityPostgresIT.java``
- ``src/test/java/com/carrental/AuthSecurityTestFixtures.java``
- ``src/test/java/com/carrental/CustomerManagementPostgresIT.java``
- ``src/test/java/com/carrental/CustomerPropertiesTest.java``
- ``src/test/java/com/carrental/DriverConcurrencyPostgresIT.java``
- ``src/test/java/com/carrental/DriverEligibilityPolicyTest.java``
- ``src/test/java/com/carrental/DriverProfilePostgresIT.java``
- ``src/test/java/com/carrental/Function1PostgresIT.java``
- ``src/test/java/com/carrental/JwtConfigurationTest.java``
- ``src/test/java/com/carrental/KycPolicyTest.java``
- ``src/test/java/com/carrental/MutableTestClock.java``
- ``src/test/java/com/carrental/PlatformHttpTest.java``
- ``src/test/java/com/carrental/PlatformTestFixtures.java``
- ``src/test/java/com/carrental/PrivateDocumentStorageTest.java``
- ``src/test/java/com/carrental/TestJwtKeys.java``
- ``src/test/java/com/carrental/UserDocumentPostgresIT.java``
- ``src/test/java/com/carrental/UserDocumentReviewPostgresIT.java``
- ``src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java``
- ``src/test/java/com/carrental/repository/CustomerStatusLockTest.java``
- ``src/test/java/com/carrental/storage/StorageRootBootJarIT.java``
- ``src/test/java/com/carrental/storage/StorageRootBootJarProbe.java``
- ``src/test/java/com/carrental/storage/StorageRootJarProbe.java``
- ``src/test/java/com/carrental/storage/StorageRootPolicyTest.java``
