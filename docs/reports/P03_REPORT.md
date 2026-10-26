# P03 — Báo cáo triển khai Authentication và Security

Ngày: 2026-10-13  
Trạng thái: **READY_FOR_REVIEW**  
Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`  
Branch: `BE`  
HEAD: `2fe712eed12a2af3b61f0a5311bdd3901f614029` (khớp `origin/BE`)

## 1. Kết quả

P03 triển khai đăng ký CUSTOMER, đăng nhập bằng email/password, access JWT RS256, xác thực stateless, phân quyền theo trạng thái/role hiện tại trong `customers`, CORS theo allowlist, bootstrap admin tùy chọn và `GET /api/customers/me`. Không có migration/schema/entity/repository mới ngoài phạm vi. Giữ nguyên schema leader và tài liệu `docs/reference/`.

Không có password, private key hay bearer token thật trong báo cáo. Integration tests dùng dữ liệu giả, khóa RSA tạm và PostgreSQL Testcontainers; không kết nối database chung.

## 2. Hiện trạng và Git

- Đã chạy đúng thư mục Desktop và branch `BE`; HEAD trùng `origin/BE`. Không checkout branch khác, stage, commit hoặc push.
- Java là `21.0.8`, Docker Server là `28.5.2`. `JAVA_HOME` ban đầu chưa được đặt; Maven Wrapper được chạy với `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'` trong riêng tiến trình PowerShell.
- Git ban đầu đã có toàn bộ tài liệu/source P01/P02 dưới dạng untracked; không có staged hay tracked diff để làm baseline so sánh. P02 review trước đó cũng ghi nhận workspace untracked. Vì vậy các file code/docs trong status cuối vẫn hiện `??`; danh sách mở rộng đầy đủ ở cuối report.
- `git diff --stat`: rỗng; `git diff --cached --stat`: rỗng. Đây không có nghĩa là không có thay đổi: các file trong workspace chưa được track bởi Git. Không có thay đổi nào được stage.
- SHA-256 hiện tại của `docs/reference/schema.sql`: `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8`, khớp giá trị đã ghi nhận ở P02; schema leader không bị chỉnh sửa.
- Git status cuối: `## BE...origin/BE`, sau đó là các mục `??` liệt kê ở mục 8. `docs/reports/P03_REPORT.md` cũng là file untracked.

## 3. Triển khai và cấu hình

### API và luồng

- `POST /api/auth/register` nhận allowlist `fullName`, `email`, `phone`, `password`; chuẩn hóa email bằng trim/lowercase `Locale.ROOT`, trim tên/điện thoại, không sửa password. Field lạ bị từ chối 400; response 201 chỉ chứa DTO profile, không tự phát token.
- Register đặt role/status/KYC/email verification từ server (`CUSTOMER`, `ACTIVE`, `NONE`, `false`), lưu BCrypt hash và flush trong transaction. Email/phone conflict chỉ thành 409 khi SQLState `23505` và constraint được allowlist. Unique index trong PostgreSQL xử lý race.
- `POST /api/auth/login` dùng `AuthenticationManager`/`DaoAuthenticationProvider`, `UserDetailsService` và `DelegatingPasswordEncoder` BCrypt; email không tồn tại, sai password hoặc account LOCKED đều cho cùng lỗi xác thực 401. Password được giữ nguyên, kiểm tra tối đa 72 byte UTF-8.
- JWT ký RS256; private PKCS#8 PEM/public SPKI PEM phải nằm ngoài classpath/JAR, cặp key được kiểm tra tương ứng và RSA tối thiểu 2048 bit. Không tự sinh key khi startup. Claims phát hành gồm `sub`, `iss`, `aud`, `iat`, `exp`; `sub` là ID dương, `exp-iat` khớp TTL nguyên giây. Không phát role, password/hash, phone hay dữ liệu giấy tờ/ngân hàng.
- Decoder kiểm tra chữ ký, RS256, issuer/audience, claim bắt buộc, exp/nbf và skew, exp lớn hơn iat, subject số dương trong giới hạn `Long`, iat tương lai và token hỏng/thiếu/sai claims.
- Mỗi request đã xác thực đọc lại account từ PostgreSQL. `LOCKED` hoặc account mất tích bị 401; authority CUSTOMER/ADMIN lấy từ DB, không tin role claim trong JWT. `/api/customers/me` lấy ID từ immutable `CurrentAccount`, không nhận owner ID của client và chỉ trả profile DTO.
- Security stateless; chỉ health, register và login public. CORS xử lý preflight trước auth. CORS nhận origin HTTP(S) exact allowlist, methods/headers tường minh, expose `X-Request-ID`, credentials tắt; mặc định origins trống. Bootstrap admin tắt mặc định, không có HTTP endpoint; khi bật dùng cùng policy/encoder và transactional service riêng, chạy lại với ACTIVE ADMIN không đổi dữ liệu, không promote CUSTOMER hoặc mở khóa account.
- RequestTrace filter chạy trước Security; response `X-Request-ID`, envelope `traceId` và MDC dùng cùng ID. MDC được dọn trong `finally`. Security/MVC errors dùng chung `ApiResponse`; không đưa token, mật khẩu, SQL hay exception diagnostic vào response.

### Giá trị cấu hình trong code

| Cấu hình | Baseline hiện tại | Nguồn/giới hạn |
|---|---|---|
| JWT algorithm | RS256 | Cố định; external file key |
| Access TTL / skew | `PT30M` / `PT30S` | Giá trị dev, cấu hình được; chưa phải production decision |
| Issuer/audience/key paths | Bắt buộc hợp lệ khi app chạy | Qua `app.security.jwt.*` / environment, không có fallback yếu |
| Password | BCrypt strength 10, min 8 code points, max 72 UTF-8 bytes | Cấu hình được; password không trim |
| CORS origins | Empty mặc định | Origin thật của FE chưa được cung cấp; empty từ chối cross-origin |
| Bootstrap admin | Disabled | Enabled cần thông tin đầy đủ qua cấu hình runtime; không lưu credential vào repo |

`pom.xml` thêm Spring Security/OAuth2 resource server và security-test do Spring Boot 4.0.8 BOM quản lý. `mvn dependency:tree` đã xác nhận Spring Security `7.0.7` và Nimbus JOSE `10.4`, không override version. Maven resource rule loại cả `application-local.properties` lẫn `config/keys/**` khỏi resources/JAR. Packaging probe cô lập còn kiểm tra file tên private-key và marker giả cho local config/bootstrap secret.

## 4. Kiểm tra đã chạy

Các lệnh dưới đây chạy trong PowerShell tại repo, với `JAVA_HOME` chỉ đặt cho tiến trình hiện tại:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

Kết quả cuối sau khi bổ sung Maven exclude cho keys: **cả hai lệnh PASS**. `clean verify` kết thúc `BUILD SUCCESS`; Docker/Testcontainers dùng PostgreSQL `15.13-alpine`, Flyway baseline và app HTTP chạy trên port ngẫu nhiên.

| Suite | Tests | Failures | Errors | Skipped | Kết quả |
|---|---:|---:|---:|---:|---|
| `JwtConfigurationTest` (Surefire) | 4 | 0 | 0 | 0 | PASS |
| `PlatformHttpTest` — P01 regression (Surefire) | 13 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` — P03 (Failsafe) | 11 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` — P02 regression (Failsafe) | 7 | 0 | 0 | 0 | PASS |
| **Tổng** | **35** | **0** | **0** | **0** | **PASS** |

JUnit XML thực tế: `target/surefire-reports/TEST-com.carrental.JwtConfigurationTest.xml`, `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml`, `target/failsafe-reports/TEST-com.carrental.AuthSecurityPostgresIT.xml`, `target/failsafe-reports/TEST-com.carrental.Function1PostgresIT.xml`.

Packaging probe PASS trong bản sao tạm, build skip-tests chỉ dành cho probe. Nó xác nhận `application-local.properties`, private-key-shaped file và marker giả của local config/private key/bootstrap secret đều không có trong executable JAR. Probe ban đầu đã phát hiện fixture private key dưới `src/main/resources/config/keys/` sẽ bị Maven đóng gói theo mặc định; đã thêm exclude `**/config/keys/**` vào `pom.xml`, sửa cú pháp PowerShell của probe, rồi chạy lại probe và clean verify thành công. Thư mục tạm được kiểm tra nằm trong temp path và xóa sau probe.

## 5. Bằng chứng HTTP, JWT và PostgreSQL

- Health được gọi qua HTTP server thật trong `Function1PostgresIT`, khi app kết nối PostgreSQL container: HTTP 200, JSON content type, `success=true`, `code=OK`, `data.status=UP`; body trace đúng với header `X-Request-ID`. Trace quan sát được là `1a8e278f-1e8c-4910-a981-77818bc9bfa0`. Assertion xác nhận message Unicode `Thành công`; PowerShell redirection làm mojibake phần message trong log console.
- Luồng đăng ký test kiểm tra email chuẩn hóa, audit/defaults, hash lưu DB và `PasswordEncoder.matches`; mass assignment/Unicode byte limit bị từ chối an toàn; email/phone duplicate thành 409. Tám request HTTP đồng thời cùng email chuẩn hóa tạo đúng một 201, bảy 409 và một row theo unique constraint thật.
- Login test kiểm tra password có whitespace đầu/cuối, `sub`/issuer/audience/iat/exp và TTL; sai password/email không có/LOCKED đều có cùng lỗi 401. Token giả chữ ký, sửa payload, alg sai/none, expiry/nbf, issuer/audience, thiếu/sai claims, subject sai/overflow và iat quá tương lai đều bị từ chối.
- Test đổi/xóa account và đổi DB role/status xác nhận token cũ bị từ chối hoặc mất quyền theo DB ở request tiếp theo. Customer nhận 403 trên fixture ADMIN-only; ADMIN hợp lệ qua fixture. Fixture này chỉ trong `src/test`, không tạo admin endpoint production. `/me` không nhận owner ID tùy chọn.
- Kiểm tra trace bao gồm lỗi 401/403 và method security; lỗi đọc DB trong current-account converter trả 503 an toàn, không biến thành invalid-token 401. Assertion kiểm tra body/log không phản chiếu marker password/token/diagnostic. Log race hiển thị SQLState `23505` và constraint allowlisted, không chứa email/phone trong line lỗi quan sát được.
- CORS: preflight origin cho phép thành công trước auth; origin cho phép nhưng thiếu bearer trả 401 có CORS header; origin cấm trả 403, body thực tế `Invalid CORS request`, không có `Access-Control-Allow-Origin`. Đây là từ chối CORS, không phải kết quả authorization account.
- Bootstrap kiểm tra disabled không tạo admin; enabled tạo ADMIN/hash; gọi lại không đổi hash hoặc row; CUSTOMER cùng email, admin LOCKED, và phone conflict không bị promote/mở khóa/ghi đè.
- `JwtConfigurationTest` kiểm tra thiếu cấu hình/key và cặp key không khớp không khởi động với fallback; test dùng keypair RSA tạm. `Clock` ứng dụng là clock timezone cấu hình, mặc định `Asia/Ho_Chi_Minh`; test claims dựa trên Clock, không chờ token hết hạn bằng sleep.

Health JSON đã quan sát (trace thực, không có thông tin xác thực):

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": { "status": "UP" },
  "errors": [],
  "traceId": "1a8e278f-1e8c-4910-a981-77818bc9bfa0"
}
```

## 6. JSON hợp đồng minh họa đã khử dữ liệu

Các giá trị hồ sơ dưới đây là dữ liệu minh họa, không phải credential hay account thật. `accessToken` được che hoàn toàn.

Register 201 (`ApiResponse<CustomerProfileResponse>`):

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": {
    "id": 123,
    "fullName": "Example Customer",
    "email": "customer@example.test",
    "phone": "0900000000",
    "dateOfBirth": null,
    "address": null,
    "avatarUrl": null,
    "emailVerified": false,
    "kycStatus": "NONE",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2026-10-13T10:00:00",
    "updatedAt": "2026-10-13T10:00:00"
  },
  "errors": [],
  "traceId": "<request-uuid>"
}
```

Login 200 (`accessToken` đã redact):

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": {
    "accessToken": "<redacted>",
    "tokenType": "Bearer",
    "expiresIn": 1800,
    "account": { "id": 123, "fullName": "Example Customer", "role": "CUSTOMER" }
  },
  "errors": [],
  "traceId": "<request-uuid>"
}
```

`GET /api/customers/me` 200 dùng cùng profile shape như register. Các lỗi thực tế cùng envelope (`success=false`, `data=null`, `errors=[]`, `traceId`):

```json
{"success":false,"code":"AUTHENTICATION_FAILED","message":"Thông tin xác thực không hợp lệ hoặc không được phép đăng nhập","data":null,"errors":[],"traceId":"<request-uuid>"}
{"success":false,"code":"ACCESS_DENIED","message":"Bạn không có quyền thực hiện thao tác này","data":null,"errors":[],"traceId":"<request-uuid>"}
{"success":false,"code":"ACCOUNT_ALREADY_EXISTS","message":"Tài khoản đã tồn tại","data":null,"errors":[],"traceId":"<request-uuid>"}
```

## 7. File P03 tạo/sửa và giới hạn

Các thay đổi P03 cụ thể trong workspace:

- **Maven/runtime:** sửa `pom.xml`, `.gitignore`, `src/main/resources/application.properties`, `config/application-local.properties.example`, `scripts/verify-local-config-packaging.ps1`.
- **Security config mới:** `src/main/java/com/carrental/config/security/{AdminBootstrapRunner,BootstrapAdminProperties,CorsProperties,JwtConfiguration,JwtKeyLoader,JwtKeyMaterial,JwtProperties,PasswordPolicyProperties,SecurityConfiguration}.java`.
- **API và DTO mới:** `controller/AuthController.java`, `controller/CustomerController.java`; `dto/request/auth/{AuthInputNormalizer,LoginRequest,RegisterRequest}.java`; `dto/response/{CustomerProfileResponse,TokenResponse}.java`.
- **Security principal/handlers mới:** `security/{AccountUserDetails,ApiAccessDeniedHandler,ApiAuthenticationEntryPoint,CurrentAccount,CurrentAccountJwtAuthenticationConverter,CustomerUserDetailsService,InvalidCurrentAccountException,SecurityErrorResponses}.java`.
- **Services/validation mới:** `service/{AuthService,CustomerService}.java`, `service/impl/{AdminBootstrapService,AuthServiceImpl,CustomerServiceImpl}.java`, `validation/{PasswordPolicyValidator,ValidPassword}.java`.
- **HTTP contract/filter sửa:** `exception/ErrorCode.java`, `exception/GlobalExceptionHandler.java`, `web/RequestTraceFilter.java`.
- **Tests mới/sửa:** mới `src/test/java/com/carrental/{AuthSecurityPostgresIT,AuthSecurityTestFixtures,JwtConfigurationTest,TestJwtKeys}.java`; sửa `PlatformHttpTest.java` và `Function1PostgresIT.java` để tách P01 web slice và cấp test key cho app thật.
- **Tài liệu:** mới `docs/10_AUTH_SECURITY.md` và báo cáo này; cập nhật `AGENTS.md`, `README.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/README.md`.

Giới hạn còn lại: issuer/audience/TTL/key production và FE origin thật chưa được nhóm cung cấp; không có production runtime validation. Tests chứng minh foundation với PostgreSQL/key tạm, không chứng minh chính sách vận hành production. Chưa có API quản trị account, refresh/revocation, OTP/email verification, reset password, workflow KYC/driver/bank/voucher, hoặc P04 trở đi. Không chạy SQL lên Supabase/database chung. Không sửa `docs/reference/`, không commit/push/deploy.

## 8. Git status cuối và danh sách untracked

`git status --short --branch` có header `## BE...origin/BE`, không có staged/tracked changes, và các mục sau (danh sách file untracked đã bung rộng; `docs/reports/P03_REPORT.md` là file báo cáo hiện tại):

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
docs/IMPLEMENTATION_STATUS.md
docs/LOCAL_DEVELOPMENT.md
docs/README.md
docs/prompts/P01_FIX_01.md
docs/prompts/P01_FOUNDATION.md
docs/prompts/P02_DATABASE_FOUNDATION.md
docs/prompts/P03_AUTH_SECURITY.md
docs/reference/BACKEND_CONVENTIONS.md
docs/reference/MENTOR_NOTES.md
docs/reference/README.md
docs/reference/car_rental_conceptual.drawio
docs/reference/schema.sql
docs/reports/P01_FIX_01_REPORT.md
docs/reports/P01_REPORT.md
docs/reports/P02_REPORT.md
docs/reports/P03_REPORT.md
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
docs/reviews/P02_REVIEW.md
mvnw
mvnw.cmd
pom.xml
scripts/verify-local-config-packaging.ps1
src/main/java/com/carrental/CarRentalApplication.java
src/main/java/com/carrental/config/ClockConfig.java
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
src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java
src/main/java/com/carrental/dto/request/auth/LoginRequest.java
src/main/java/com/carrental/dto/request/auth/RegisterRequest.java
src/main/java/com/carrental/dto/response/ApiResponse.java
src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
src/main/java/com/carrental/dto/response/FieldErrorResponse.java
src/main/java/com/carrental/dto/response/HealthResponse.java
src/main/java/com/carrental/dto/response/PageResponse.java
src/main/java/com/carrental/dto/response/TokenResponse.java
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
src/main/java/com/carrental/service/impl/AdminBootstrapService.java
src/main/java/com/carrental/service/impl/AuthServiceImpl.java
src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
src/main/java/com/carrental/validation/PasswordPolicyValidator.java
src/main/java/com/carrental/validation/ValidPassword.java
src/main/java/com/carrental/web/RequestTraceFilter.java
src/main/resources/application.properties
src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql
src/test/java/com/carrental/AuthSecurityPostgresIT.java
src/test/java/com/carrental/AuthSecurityTestFixtures.java
src/test/java/com/carrental/Function1PostgresIT.java
src/test/java/com/carrental/JwtConfigurationTest.java
src/test/java/com/carrental/PlatformHttpTest.java
src/test/java/com/carrental/PlatformTestFixtures.java
src/test/java/com/carrental/TestJwtKeys.java
```

### Kết luận

Các kiểm tra bắt buộc P03 và regression P01/P02 đạt; trạng thái được đặt **READY_FOR_REVIEW**. Dừng ở P03 để chờ reviewer. Không tự đặt APPROVED và chưa làm P04.
