# Báo cáo P05-FIX-02 — Physical root policy cho executable Boot JAR

**Trạng thái:** `READY_FOR_REVIEW` — R3 đã được xử lý, chờ reviewer xác nhận. R1/R2/R4 giữ trạng thái `CLOSED` theo review P05-FIX-01. P06 `NOT_STARTED`.

**Ngày:** 2026-10-14  
**Repository/branch:** `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, `BE`  
**HEAD:** `2fe712eed12a2af3b61f0a5311bdd3901f614029` (`origin/BE` cùng HEAD)

Không commit/push/stage, không chạy DB chung, không sửa schema/reference và không triển khai P06.

## 1. Hiện trạng và môi trường

- Đã xác nhận đúng repository Desktop, branch `BE` và HEAD nêu trên. Java `21.0.8`; Maven Wrapper `3.9.11`; Windows 11; Docker Desktop `28.5.2`. PostgreSQL integration tests sử dụng PostgreSQL `15.13` qua Testcontainers cô lập.
- Project đã có các thư mục/file untracked từ trước khi làm lượt này. Lúc bắt đầu có 170 untracked path, không có staged changes; vì vậy `git diff` trống không chứng minh workspace sạch. Report này làm tổng số cuối lượt thành 171. Không stage hoặc xóa file sẵn có.
- Review trước xác nhận R1/R2/R4 đã đóng và ghi actual Boot JAR probe cho R3: CodeSource `jar:nested:...!/BOOT-INF/classes/!/`, legacy resolver trả ZipPath `/`, protected roots chỉ gồm `/`, và adapter nhận application `config` root.
- Probe trước sửa trong lượt này xác nhận actual nested CodeSource/outer nested URL; tại lần chạy đó legacy `Path.of(location.toURI()).toRealPath()` ném `FileSystemNotFoundException`, nên lần thử cục bộ này **không độc lập tái hiện được trạng thái `config root ACCEPTED`**. Trạng thái ACCEPTED trước sửa được xác lập bằng bằng chứng actual-runtime trong [review P05-FIX-01](../reviews/P05_FIX_01_REVIEW.md). Không gộp hai quan sát thành một.

## 2. Thay đổi triển khai

`StorageRootPolicy` giờ resolve code location theo scheme: `file:` qua URI; `jar:file:` qua `JarURLConnection` đến archive ngoài; `jar:nested:` qua Boot `NestedLocation.fromUrl(...).path()` đến outer physical JAR. Resolver canonicalize trên default/native filesystem, chỉ nhận classes directory hoặc regular artifact file, và fail closed với location thiếu/không hỗ trợ/non-native. Không dùng `user.dir` hoặc ZIP entry root làm vị trí ứng dụng.

Containment chỉ so sánh path cùng filesystem. Policy tiếp tục bảo vệ classes/JAR, parent của standalone JAR và build/repository root gần nhất; kiểm tra root tồn tại, absolute, canonical, không symlink và writable. External root được chấp nhận; storage disabled khởi tạo mà không cần root. Không đổi receipt/locator, image pipeline, transaction cleanup hoặc API.

| File tạo/sửa trong lượt này | Vai trò |
|---|---|
| `src/main/java/com/carrental/storage/StorageRootPolicy.java` | Unwrap nested CodeSource tới physical artifact và enforce native-filesystem root containment. |
| `src/test/java/com/carrental/storage/StorageRootPolicyTest.java` | Regression exploded classes, `file:`, `jar:file:`, path encoding, unsupported/missing/non-native location và plain JAR. |
| `src/test/java/com/carrental/storage/StorageRootBootJarIT.java` | Failsafe regression trên executable Boot JAR được launch thật bằng `java -jar` từ CWD khác; kiểm tra timeout/process cleanup. |
| `src/test/java/com/carrental/storage/StorageRootBootJarProbe.java` | Test-only main được chèn vào **bản JAR tạm** để gọi production policy/adapter và in diagnostic đã encode. |
| `src/test/java/com/carrental/UserDocumentPostgresIT.java` | Health HTTP smoke trên app/PostgreSQL test với private root tạm bên ngoài và trace body/header khớp. |
| `scripts/verify-local-config-packaging.ps1` | Packaging probe còn xác nhận helper Boot test không lọt vào artifact. |
| `AGENTS.md`, `README.md`, `docs/README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/LOCAL_DEVELOPMENT.md` | Cập nhật trạng thái thực tế và mô tả physical root policy/evidence. |
| `docs/reports/P05_FIX_02_REPORT.md` | Báo cáo lượt này. |

Không sửa `docs/reference/`, schema hoặc migration. Hash SHA-256 cuối lượt:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

## 3. Regression và bằng chứng HTTP/JAR

Targeted root/storage tests đạt 11/11. Actual Boot integration test đạt 1/1 trên built executable JAR. Test xác nhận manifest gốc có production `Start-Class`, production artifact chưa chứa helper, rồi chỉ sửa bản copy trong verified JUnit TEMP fixture: thay Start-Class và thêm helper dưới `BOOT-INF/classes`. Bản production JAR không bị sửa. Fixture nằm dưới đường dẫn có spaces, literal `%20`, tiếng Việt và Japanese Unicode; child JVM thật chạy `java -jar` với CWD riêng `unrelated working directory`, timeout 20 giây và dọn process tree.

Quan sát sau sửa từ Failsafe XML (`target/failsafe-reports/TEST-com.carrental.storage.StorageRootBootJarIT.xml`):

```text
CodeSource: jar:nested:/C:/.../boot fixture space %20 tiếng Việt 日本語/target/carrental-be.jar/!BOOT-INF/classes/!/
JarURLConnection outer: nested:/C:/.../target/carrental-be.jar/!BOOT-INF/classes/
Resolved physical artifact: C:\Users\FPTSHOP\AppData\Local\Temp\...\boot fixture space %20 tiếng Việt 日本語\target\carrental-be.jar
Resolved provider: file (native/default filesystem)
Actual process CWD: ...\unrelated working directory
Forbidden roots rejected: project, config, public, target, target-custom, arbitrary
External root accepted; disabled storage initialized without a root
Spaces/percent/Unicode path round-trip: PASS
```

Các root cấm được xác nhận không đổi nội dung; external root không có file được tạo. Path kết quả là physical JAR trên filesystem native, không phải ZipPath `/`. Đây là actual Boot loader/`java -jar`, tách biệt với unit URI fixtures và plain-JAR test. Packaging probe cũng xác nhận `StorageRootBootJarProbe.class` và `StorageRootBootJarIT.class` không có trong artifact.

App/PostgreSQL Testcontainers health smoke quan sát HTTP `200`, `application/json`, `data.status=UP`, storage root tạm ở ngoài project; assertion xác nhận `traceId` trong body bằng `X-Request-ID`. Body thực tế:

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"16f3d019-9bc3-4393-b060-8754e95851d8"}
```

Marker test: `P05_EXTERNAL_ROOT_HEALTH_HTTP 200 bodyTraceMatchesHeader=true storageRoot=temporary-external`. Logs assertion nằm tại `target/failsafe-reports/TEST-com.carrental.Function1PostgresIT.xml` và `target/failsafe-reports/TEST-com.carrental.UserDocumentPostgresIT.xml`.

## 4. Lệnh đã chạy và kết quả

| Lệnh thực tế | Kết quả |
|---|---|
| `mvnw -B -Dtest=StorageRootPolicyTest,PrivateDocumentStorageTest test` | **PASS 11/11**, 0 failures/errors/skips. |
| `mvnw -B -Dtest=none -Dsurefire.failIfNoSpecifiedTests=false -Dit.test=StorageRootBootJarIT -Ppostgres-it verify` | **PASS 1/1** actual Boot JAR integration regression. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | **PASS — BUILD SUCCESS**, Surefire 32/32 + Failsafe 55/55 = **87/87**, 0 failures/errors/skips; PostgreSQL 15.13 Testcontainers. Thời lượng lượt cuối khoảng 1 phút 38 giây. |
| `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'; powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` | **PASS** isolated packaging probe. `LOCAL_CONFIG_ENTRY_PACKAGED=False`, fake local-config/private-key/bootstrap/document markers `False`, storage root path `False`, private key entry `False`, test helper `False`. |

Full test reports nằm trong `target/surefire-reports/` và `target/failsafe-reports/`; final Boot JAR and health evidence nằm tại các XML đã dẫn ở trên. Các invocation exploratory ban đầu có lỗi quote Maven / thiếu `JAVA_HOME` đã được chạy lại bằng lệnh đúng; chỉ kết quả clean verify và packaging probe cuối được tính là PASS.

## 5. Giới hạn còn lại

- Windows ACL-denied và các cấu hình filesystem đặc biệt không được kiểm thử hoặc thay đổi ACL trong lượt này.
- PostgreSQL Testcontainers không phải DB dùng chung. Không chạy Supabase hoặc SQL lên database của nhóm.
- Local filesystem và PostgreSQL không tạo thành một transaction phân tán; mất tiến trình/thiết bị giữa file I/O và commit cần vận hành/đối soát phù hợp. Trạng thái `UNKNOWN` vẫn giữ receipt theo policy đã duyệt; không thêm sweeper hay schema.
- Chưa xác nhận production storage root/ACL/runtime configuration và chính sách KYC; đây không thuộc R3/P05-FIX-02. P06 chưa bắt đầu.

## 6. Git và inventory untracked

```text
Branch: BE
HEAD: 2fe712eed12a2af3b61f0a5311bdd3901f614029
Upstream: origin/BE at same HEAD
Staged: none
Tracked diff: empty (project tree was already untracked; empty diff is not a clean-tree claim)
Final untracked path count: 171 (includes this report)
Commit/push: not performed
```

`git status --short --branch` hiển thị `## BE...origin/BE` và các root `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/` là untracked. Danh sách path đầy đủ theo `git ls-files --others --exclude-standard` sau khi tạo report:

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
- `docs/reviews/P01_FIX_01_REVIEW.md`
- `docs/reviews/P01_REVIEW.md`
- `docs/reviews/P02_REVIEW.md`
- `docs/reviews/P03_FIX_01_REVIEW.md`
- `docs/reviews/P03_REVIEW.md`
- `docs/reviews/P04_FIX_01_REVIEW.md`
- `docs/reviews/P04_REVIEW.md`
- `docs/reviews/P05_FIX_01_REVIEW.md`
- `docs/reviews/P05_REVIEW.md`
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
- `src/main/java/com/carrental/controller/CustomerController.java`
- `src/main/java/com/carrental/controller/HealthController.java`
- `src/main/java/com/carrental/controller/UserDocumentController.java`
- `src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java`
- `src/main/java/com/carrental/dto/request/auth/LoginRequest.java`
- `src/main/java/com/carrental/dto/request/auth/RegisterRequest.java`
- `src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java`
- `src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java`
- `src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java`
- `src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java`
- `src/main/java/com/carrental/dto/response/ApiResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerAdminResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerProfileResponse.java`
- `src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java`
- `src/main/java/com/carrental/dto/response/FieldErrorResponse.java`
- `src/main/java/com/carrental/dto/response/HealthResponse.java`
- `src/main/java/com/carrental/dto/response/PageResponse.java`
- `src/main/java/com/carrental/dto/response/TokenResponse.java`
- `src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java`
- `src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java`
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
- `src/main/java/com/carrental/mapper/CustomerMapper.java`
- `src/main/java/com/carrental/mapper/UserDocumentMapper.java`
- `src/main/java/com/carrental/repository/BankAccountRepository.java`
- `src/main/java/com/carrental/repository/CustomerRepository.java`
- `src/main/java/com/carrental/repository/CustomerStatusLock.java`
- `src/main/java/com/carrental/repository/DriverRepository.java`
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
- `src/main/java/com/carrental/service/CustomerService.java`
- `src/main/java/com/carrental/service/CustomerStatusChangeLogger.java`
- `src/main/java/com/carrental/service/impl/AdminBootstrapService.java`
- `src/main/java/com/carrental/service/impl/AuthServiceImpl.java`
- `src/main/java/com/carrental/service/impl/CustomerServiceImpl.java`
- `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`
- `src/main/java/com/carrental/service/UserDocumentService.java`
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
- `src/test/java/com/carrental/CustomerManagementPostgresIT.java`
- `src/test/java/com/carrental/CustomerPropertiesTest.java`
- `src/test/java/com/carrental/Function1PostgresIT.java`
- `src/test/java/com/carrental/JwtConfigurationTest.java`
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
- `src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java`

