# P03-FIX-01 — Báo cáo sửa R1/R2/R3

Ngày: 2026-10-13  
Trạng thái: **READY_FOR_REVIEW**  
Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`  
Branch: `BE`  
HEAD: `2fe712eed12a2af3b61f0a5311bdd3901f614029` (khớp `origin/BE`)

## 1. Kết quả

Đã sửa ba finding trong [review P03](../reviews/P03_REVIEW.md), thêm regression tests chạy qua application/security stack và PostgreSQL Testcontainers, cập nhật tài liệu, rồi chạy đủ P01/P02/P03 verification. Không thay schema/migration, không sửa `docs/reference/`, không stage/commit/push, không kết nối database chung và chưa triển khai P04.

## 2. Findings và bằng chứng

| Finding | Nguyên nhân | Sửa đổi | Bằng chứng cuối |
|---|---|---|---|
| R1 — raw JDBC log lộ email/phone | Hibernate 7.2.24.Final ghi SQLException/PostgreSQL Detail trước khi lỗi tới service; log service đã che không ngăn được logger framework | Đặt `spring.jpa.properties.hibernate.jdbc.log.errors=false`, `...warnings=false`, `spring.jpa.show-sql=false`. Giữ log conflict có trace ID và constraint allowlist. Regression dùng appender Logback thread-safe, capture formatted message, MDC, ThrowableProxy/cause/suppressed; chỉ gắn trong test và tháo trong `finally` | Email và phone collision đều qua HTTP tới `saveAndFlush` trên PostgreSQL thật; spy chỉ ép pre-check “không tồn tại”. 409 đúng, email/phone/hash/password/token markers không có trong event/cause, không có row thứ hai. Log vẫn có trace cùng `uq_customers_email_lower` / `customers_phone_key`. Appender an toàn khi có concurrent request và được gỡ sau test. Tám request concurrency cũ tiếp tục chạm unique index thật |
| R2 — issuer không phải URL làm body mất trace | `JwtIssuerValidator`/`jwt.getIssuer()` ép `iss` qua URL conversion; lỗi thoát validator và gây servlet error dispatch | So sánh claim raw `iss` theo kiểu String/nonblank và exact configured issuer; bỏ URL getter cho kiểm tra issuer. Test key config dùng issuer identifier `sba301:function1:test-issuer` (không phải HTTP URL) | Login/token hợp lệ với issuer identifier dùng được trên `/api/customers/me` (positive control). Token RS256 đúng key nhưng `iss` non-URL, empty, numeric/wrong type, missing hoặc sai issuer đều trả 401 `INVALID_TOKEN`; từng body `traceId` khớp header `X-Request-ID`. Không có `Unable to convert claim 'iss'` hoặc `Servlet.service()` trong appender capture. Các kiểm tra signature/alg/aud/time/sub hiện có vẫn chạy |
| R3 — stored hash không hợp lệ thành 500 | Regex chấp nhận mọi hai chữ số cost, sau đó encoder có thể ném lỗi; exception từ loader cũng cần đi qua cách map credentials chuẩn | Gate `{bcrypt}` với `$2a/$2b/$2y`, cost 04–31 và chiều dài/check alphabet trước khi `DaoAuthenticationProvider` gọi encoder; hash lỗi phát sinh `UsernameNotFoundException` để provider trả generic credentials failure. Global MVC handler map `AuthenticationServiceException` riêng thành 503 `DEPENDENCY_UNAVAILABLE`, không nhập nhằng với credentials sai | Hash test cost99, cost03, unsupported prefix và plaintext trả cùng 401/code/message/trace; không phản hồi/log hash hoặc password. BCrypt hợp lệ, password whitespace vẫn login 200. Lỗi repository khi login vẫn thành 503, không bị che thành 401; response/log chỉ có trace và exception type, không có marker của cause/email/password |

Thiết lập `hibernate.jdbc.log.errors` theo hợp đồng `LOG_JDBC_ERRORS` của Hibernate 7.2 ([JdbcSettings](https://docs.hibernate.org/orm/7.2/javadocs/org/hibernate/cfg/JdbcSettings.html#LOG_JDBC_ERRORS)); property được kiểm chứng qua log capture trên PostgreSQL thật.

Không bật NoOp/plaintext fallback, không truncate password, reset/rehash account, catch mọi exception thành credentials failure, hoặc sửa dữ liệu để làm login thành công. Lỗi database trong JWT current-account lookup tiếp tục giữ 503 như trước.

## 3. Lệnh đã chạy và kết quả

Lệnh chạy trong PowerShell từ repo. `JAVA_HOME` chỉ đặt trong process của lệnh:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B -DskipTests test-compile
.\mvnw.cmd -B '-Dit.test=AuthSecurityPostgresIT' -Ppostgres-it verify
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

| Kiểm tra cuối | Tests | Failures | Errors | Skips | Kết quả |
|---|---:|---:|---:|---:|---|
| `JwtConfigurationTest` — Surefire | 4 | 0 | 0 | 0 | PASS |
| `PlatformHttpTest` — P01 regression/Surefire | 13 | 0 | 0 | 0 | PASS |
| `AuthSecurityPostgresIT` — P03 + R1/R2/R3/Failsafe | 14 | 0 | 0 | 0 | PASS |
| `Function1PostgresIT` — P02 regression/Failsafe | 7 | 0 | 0 | 0 | PASS |
| **Full run total** | **38** | **0** | **0** | **0** | **PASS** |

`clean verify -Ppostgres-it` kết thúc `BUILD SUCCESS`, tổng 47.901 s. Targeted run kết thúc `BUILD SUCCESS`; 17 Surefire tests cộng với 14 test `AuthSecurityPostgresIT` đều đạt. Test compile PASS. Full run dùng PostgreSQL `15.13-alpine` Testcontainers, Flyway baseline, application HTTP thật và RSA test keys sinh tạm; không dùng DB/key production. Reports: `target/surefire-reports/TEST-com.carrental.JwtConfigurationTest.xml`, `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml`, `target/failsafe-reports/TEST-com.carrental.AuthSecurityPostgresIT.xml`, `target/failsafe-reports/TEST-com.carrental.Function1PostgresIT.xml`.

Packaging probe chạy riêng trên bản sao cô lập, `BUILD SUCCESS`/PASS. `application-local.properties`, private-key-shaped fixture và fake marker local config/private key/bootstrap secret đều vắng khỏi executable JAR. Probe skip tests chỉ ở bản sao đóng gói; không tính vào tổng 38 tests.

Các vòng targeted đầu trong khi sửa từng phát hiện đã được khắc phục: provider ban đầu bọc exception do hash lỗi thành `AuthenticationServiceException`, và handler cũ đổi lỗi repository thành 401. Bản cuối chuyển hash không hỗ trợ qua `UsernameNotFoundException`, map lỗi provider/data source thành 503, rồi targeted run và full clean verify phía trên đều đạt. Kết quả cuối không bỏ/skip test.

Log cuối của các lệnh: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-fix01-final-verify.log`, `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-fix01-final-packaging.log`, `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-fix01-targeted-it-3.log`. Log chứa test data giả; không chứa bearer token có thể dùng lại hoặc private key.

## 4. Bằng chứng HTTP và health

- Các request R1/R2/R3 chạy qua app HTTP trên port ngẫu nhiên. 401/409/503 đều được assert đúng envelope/header trace; malformed issuer không vào servlet conversion/error dispatch.
- Health từ `Function1PostgresIT` qua app HTTP đang kết nối PostgreSQL container: HTTP 200, JSON, `data.status=UP`, header `X-Request-ID` khớp body `traceId`. Trace quan sát lần full run: `5bf9dec7-3066-4e3f-bb9e-098f0dc68bea`. Assertion test xác nhận message `Thành công`; PowerShell redirect log hiện mojibake phần Unicode message, không ảnh hưởng assertion/body.

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"5bf9dec7-3066-4e3f-bb9e-098f0dc68bea"}
```

Health chỉ xác nhận app HTTP hoạt động và test fixture kết nối DB lúc kiểm tra; không chứng minh production configuration hay mọi dependency/authorization policy.

## 5. Tài liệu và file code đã sửa

**Runtime/auth code:**

- `src/main/resources/application.properties` — tắt raw Hibernate JDBC error/warning logging và SQL display.
- `src/main/java/com/carrental/config/security/JwtConfiguration.java` — issuer exact String validation, không dùng URL getter.
- `src/main/java/com/carrental/security/CustomerUserDetailsService.java` — reject hash ngoài BCrypt `$2a/$2b/$2y`, cost 4–31.
- `src/main/java/com/carrental/service/impl/AuthServiceImpl.java` — bỏ regex không còn dùng.
- `src/main/java/com/carrental/exception/GlobalExceptionHandler.java` — authentication service/data-source failure trả 503 an toàn.

**Regression tests:**

- `src/test/java/com/carrental/AuthSecurityPostgresIT.java` — R1 PostgreSQL collision/log/cause/token capture; R2 issuer non-URL/empty/wrong type với trace; R3 malformed hashes và lỗi authentication repository 503.
- `src/test/java/com/carrental/TestJwtKeys.java` — test issuer identifier không phải URL.

**Tài liệu đã cập nhật:** `AGENTS.md`, `README.md`, `docs/03_FUNCTION_1_API.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/10_AUTH_SECURITY.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/README.md`, `docs/IMPLEMENTATION_STATUS.md`. Tạo báo cáo này; giữ nguyên `docs/reports/P03_REPORT.md`, prompt và review lịch sử.

## 6. Git, schema và điểm còn lại

- Branch `BE`; `HEAD=2fe712eed12a2af3b61f0a5311bdd3901f614029`, bằng `origin/BE`. Không stage/commit/push/checkout/reset/clean.
- Từ đầu, repo đã có các project files P01/P02 ở trạng thái untracked; không có tracked baseline hoặc staged diff để Git phân loại phần nào là sửa mới. Toàn bộ hiện trạng untracked được liệt kê đầy đủ ở cuối báo cáo; report này cũng untracked. `git diff --stat` và `git diff --cached --stat` rỗng vì cùng lý do.
- `docs/reference/schema.sql` SHA-256: `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8`, không đổi. Không sửa entity/migration/leader schema hoặc các file trong `docs/reference/` ở lượt này.
- Không có credential production, issuer/audience/key production hoặc origin FE thật để xác minh vận hành production. R1–R3 test dùng dữ liệu marker ngẫu nhiên, token/key tạm và PostgreSQL Testcontainers; không có bằng chứng dữ liệu production bị lộ.
- P03 đặt READY_FOR_REVIEW, không APPROVED. Dừng sau report; P04 chưa triển khai.

### Untracked files

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
docs/prompts/P03_FIX_01.md
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
docs/reviews/P01_FIX_01_REVIEW.md
docs/reviews/P01_REVIEW.md
docs/reviews/P02_REVIEW.md
docs/reviews/P03_REVIEW.md
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

