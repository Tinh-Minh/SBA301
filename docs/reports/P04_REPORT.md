# P04 report — Customer profile and admin account status

**Trạng thái:** `READY_FOR_REVIEW`  
**Ngày:** 2026-10-13  
**Nhánh / HEAD:** `BE` / `2fe712eed12a2af3b61f0a5311bdd3901f614029`

P04 đã hoàn tất trong phạm vi hồ sơ cá nhân và quản trị tài khoản. P01–P03 tiếp tục ở trạng thái APPROVED theo các review đã có; P04 chờ reviewer, không tự cấp APPROVED. Không bắt đầu P05, không commit/push, không đổi nhánh và không chạy SQL lên database chung/Supabase.

## 1. Hiện trạng và bảo toàn

- Repository được kiểm tra tại `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh `BE`, HEAD `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Khi bắt đầu, `git status --short --branch` báo `## BE...origin/BE` và các thư mục/tệp dự án đang untracked; `git diff` và staged diff rỗng. Vì vậy diff rỗng không có nghĩa là workspace sạch. Không có file nào được stage, reset, clean, stash hoặc checkout trong lượt này.
- Java 21.0.8 và Maven Wrapper của repository được dùng; Docker daemon hoạt động để chạy Testcontainers. Maven được gọi với `JAVA_HOME=C:\Program Files\Java\jdk-21`.
- Không sửa `docs/reference/`, schema leader, Flyway migration, entity mapping hoặc dependency/POM. PostgreSQL 15.13 chỉ chạy trong Testcontainers cô lập.

## 2. Những gì đã triển khai

- `PATCH /api/customers/me` chỉ sửa `fullName`, `dateOfBirth`, `address`; DTO giữ presence của từng field, phân biệt omitted với null, trim/validate đúng hợp đồng và từ chối field lạ/trùng/sai kiểu. Owner lấy từ principal. Service lock row rồi kiểm tra lại ACTIVE; chỉ flush khi giá trị chuẩn hóa đổi.
- ADMIN ACTIVE có thể lọc/xem trang và detail; query/count chạy bằng JPA Specification trong PostgreSQL. Query allowlist, sort allowlist, ID tie-break, count, page boundary và literal LIKE escaping được kiểm tra. Response DTOs có allowlist rõ và account responses dùng `Cache-Control: no-store`.
- `PATCH /api/customers/{id}/status` xác thực status/reason kể cả no-op. User đã xác nhận policy được áp dụng: ADMIN không thể tự khóa và không thể khóa ADMIN ACTIVE cuối cùng. API status command lấy transaction advisory lock PostgreSQL chung trước khi đọc account rows, đọc lại actor từ DB, dùng row lock và trả 409 với error code riêng cho hai policy.
- No-op/rejected/failure không ghi status-change success log. Log đổi trạng thái được phát sau commit và chỉ gồm trace, actor/target ID, status cũ/mới cùng `reasonProvided`; reason và PII không được log hay lưu. Schema không có lịch sử reason; Q-09 vẫn mở.
- PATCH được thêm vào CORS allowlist đã giới hạn. Không thêm endpoint test/provisioning hoặc nghiệp vụ khác.

## 3. Files được thêm hoặc sửa cho P04

**Implementation và tests:**

- Thêm `src/main/java/com/carrental/config/CustomerProperties.java`; đăng ký cấu hình ở `src/main/java/com/carrental/config/security/JwtConfiguration.java`, thêm paging/reason/lock defaults vào `src/main/resources/application.properties` và `config/application-local.properties.example`.
- Sửa `src/main/java/com/carrental/config/security/CorsProperties.java` để cho phép PATCH theo cấu hình CORS hiện có.
- Sửa `src/main/java/com/carrental/controller/CustomerController.java`, `src/main/java/com/carrental/service/CustomerService.java`, `src/main/java/com/carrental/service/impl/CustomerServiceImpl.java` cho profile update, admin list/detail và status command.
- Thêm request DTOs `src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java`, `ChangeCustomerStatusRequest.java`, `CustomerListQuery.java`; response DTOs `src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java`, `CustomerAdminResponse.java`; thêm `src/main/java/com/carrental/mapper/CustomerMapper.java` và chuyển profile mapping dùng chung ở `src/main/java/com/carrental/service/impl/AuthServiceImpl.java`.
- Sửa `src/main/java/com/carrental/repository/CustomerRepository.java`; thêm `src/main/java/com/carrental/repository/CustomerStatusLock.java` cho advisory lock PostgreSQL.
- Thêm `src/main/java/com/carrental/service/CustomerStatusChangeLogger.java` cho log sau commit.
- Sửa `src/main/java/com/carrental/exception/ErrorCode.java`, `AppException.java`, `GlobalExceptionHandler.java` để hỗ trợ code policy, field errors và lỗi lock/dependency an toàn.
- Thêm `src/test/java/com/carrental/CustomerManagementPostgresIT.java` và `src/test/java/com/carrental/CustomerPropertiesTest.java`.

**Tài liệu/trạng thái:**

- Thêm `docs/11_CUSTOMER_PROFILE_ADMIN.md` và báo cáo này.
- Cập nhật `AGENTS.md`, `README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/README.md`, cùng `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/10_AUTH_SECURITY.md`.

Các file này hiện untracked cùng phần repo đã có trước lượt làm việc; danh sách Git hiện tại đầy đủ nằm cuối báo cáo. Git không có baseline tracked/diff để tự xác định từng file untracked có từ trước hay mới được tạo, nên danh sách trên ghi rõ các file P04 được thêm/sửa theo phạm vi công việc, không coi toàn bộ untracked là file mới của P04.

## 4. Kiểm tra và kết quả thực tế

Đã chạy đúng các lệnh bắt buộc:

| Lệnh | Kết quả |
|---|---|
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS**, `BUILD SUCCESS`, khoảng 1 phút 13 giây |
| `.\scripts\verify-local-config-packaging.ps1` (sau khi đặt cùng `JAVA_HOME`) | **PASS**, `PROBE_BUILD=PASS`; local config, fake local/private-key/bootstrap markers và private-key entry đều không có trong executable JAR |

Full verify kết quả theo Surefire/Failsafe reports:

| Suite | Tests | Failures | Errors | Skipped | Kết quả |
|---|---:|---:|---:|---:|---|
| `PlatformHttpTest` (P01) | 13 | 0 | 0 | 0 | PASS |
| `JwtConfigurationTest` (P03) | 4 | 0 | 0 | 0 | PASS |
| `CustomerPropertiesTest` (P04) | 1 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` (P03, PostgreSQL) | 14 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` (P02, PostgreSQL) | 7 | 0 | 0 | 0 | PASS |
| `CustomerManagementPostgresIT` (P04, PostgreSQL/HTTP) | 16 | 0 | 0 | 0 | PASS |
| **Tổng** | **55** | **0** | **0** | **0** | **PASS** |

P04 integration coverage gồm profile ownership/presence/null/normalization/audit/no-op/Clock Việt Nam; malformed/duplicate/unknown JSON; admin authorization, filter/page/count/sort/escaping/DTO privacy; status transitions, token semantics và hai policy đã chốt; race hai ADMIN và race cùng target; đồng thời profile/status; rollback/failure mapping; log privacy và PATCH CORS. Những truy vấn, transaction, row/advisory locks và HTTP requests trên các integration suites chạy thật trên PostgreSQL 15.13 Testcontainers; test dùng RSA keys tạm.

Packaging probe có bước build riêng bỏ qua tests bên trong probe, nhưng đây không được tính làm verification test: full `clean verify -Ppostgres-it` ngay trước đó đã chạy đủ 55 test. Probe PASS và xác nhận các marker giả không nằm trong JAR.

## 5. HTTP health và trace quan sát

Trong `Function1PostgresIT`, ứng dụng HTTP được khởi động trên port ngẫu nhiên khi PostgreSQL container đang hoạt động và test gọi `GET /api/health`. Kết quả thực tế là HTTP 200, `Content-Type: application/json`, envelope `success=true`, `code=OK`, `data.status=UP`, `errors=[]`; assertion xác nhận `traceId` trong JSON bằng `X-Request-ID` header. Trace của lần full verify này là `475165a4-b5f7-4a34-b2ed-77952e41d3a2`.

JSON được test assert trực tiếp gồm message `Thành công`. Bản log do PowerShell redirect hiển thị ký tự tiếng Việt sai encoding (`Th�nh c�ng`), nên không dùng phần message đã mojibake làm bằng chứng nội dung; các assertion HTTP/body/trace vẫn PASS.

## 6. Schema/reference và quyết định

`docs/reference/schema.sql` SHA-256: `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` (khớp hash đã kiểm tra ở lượt trước). Migration hiện có SHA-256: `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4`. Các file `docs/reference/` không được sửa; hash hiện tại:

| File | SHA-256 |
|---|---|
| `BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `MENTOR_NOTES.md` | `FED7B591FC08ED4E507F544F98CA47577457360956A079116528A4E5FB87F61E` |
| `README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |

Để bảo vệ invariant last-active-admin xuyên nhiều instance, status command dùng transaction-level PostgreSQL advisory lock; timeout cấu hình được validate. Không thêm schema hay audit table. Cấu hình paging mặc định 20/tối đa 100, reason 500 ký tự và lock timeout 5000 ms là baseline kỹ thuật có thể cấu hình, không được diễn giải thành policy sản phẩm khác. ADMIN self-lock được kiểm tra trước last-admin guard như policy precedence trong prompt.

## 7. Hạn chế còn lại

- Chưa có bảng/lịch sử bền vững cho lý do và lịch sử status; Q-09 còn mở, đúng phạm vi schema leader hiện tại.
- Concurrency guarantee áp dụng cho status writers tuân protocol advisory lock; thao tác SQL quản trị trực tiếp ngoài transaction protocol không được test/bảo đảm.
- Chưa kiểm tra production database, production keys/CORS/config hoặc triển khai môi trường nào; không cần thiết cho P04 và không được thực hiện.
- Compiler đưa ra deprecation note cho API annotation/Jackson liên quan `UpdateProfileRequest`; build và toàn bộ test vẫn PASS. Không có test bị skip trong full verify.

## 8. Git cuối lượt

- `git status --short --branch`: `## BE...origin/BE`, sau đó các top-level untracked `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/`.
- `git diff --stat`: rỗng; `git diff --cached --stat`: rỗng; không có file staged. Đây là đặc tính của workspace ban đầu (repo files untracked), không phải bằng chứng không có thay đổi.
- Không có commit hoặc push. Danh sách chi tiết `git ls-files --others --exclude-standard` được chốt sau report creation:

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
- ``docs/reports/P04_REPORT.md``
- ``docs/reviews/P01_FIX_01_REVIEW.md``
- ``docs/reviews/P01_REVIEW.md``
- ``docs/reviews/P02_REVIEW.md``
- ``docs/reviews/P03_FIX_01_REVIEW.md``
- ``docs/reviews/P03_REVIEW.md``
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
