# Review P03 — CHANGES_REQUESTED

Ngày review: **2026-10-13**. Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, branch **BE**.

Reviewer đã đọc code/auth/config/test, chạy lại full verification và packaging probe. **35/35 test hiện có đạt**, nhưng kiểm tra log và probe bổ sung tái hiện ba lỗi. P03 chưa APPROVED; cần [P03-FIX-01](../prompts/P03_FIX_01.md) trước P04.

## 1. Findings

### R1 — [P2] Hibernate ghi nguyên email vào log khi registration race

**Vị trí:** `src/main/resources/application.properties:27–40`; `src/main/java/com/carrental/service/impl/AuthServiceImpl.java:88–94`.

Log service chỉ ghi constraint đã allowlist, nhưng Hibernate ghi SQLException trước khi catch ở service chạy. Default config chưa ngăn raw JDBC error logging. Reviewer chạy lại đúng test concurrentRegistrationUsesThePostgresUniqueIndexAsTheFinalGuard và quan sát logger `org.hibernate.orm.jdbc.error`:

```text
ERROR: duplicate key value violates unique constraint "uq_customers_email_lower"
Detail: Key (lower(email::text))=(race-92861ecd1ca743aa93eceb593acc9173@example.test) already exists.
```

Đây là email giả của test, không phải dữ liệu người dùng thật. Tuy vậy cùng đường ghi sẽ đưa email thật vào log khi registration race xảy ra. Chỉ che log.info trong AuthServiceImpl và chỉ assert body HTTP không chứng minh log toàn ứng dụng an toàn.

**Cần sửa:** kiểm soát raw JDBC errors tại nguồn/framework hoặc tầng logging phù hợp, vẫn giữ log lỗi có trace/SQLState/constraint an toàn. Thêm regression capture log thực sự, gồm formatted message và Throwable/cause từ cả service/framework, với collision PostgreSQL thật. Không chỉ tắt logging trong test hoặc tắt root logger.

Hibernate 7.2 có cấu hình `hibernate.jdbc.log.errors` và category JDBC error riêng; đối chiếu phiên bản thực trước dùng. [Hibernate JdbcSettings](https://docs.hibernate.org/orm/7.2/javadocs/org/hibernate/cfg/JdbcSettings.html#LOG_JDBC_ERRORS).

### R2 — [P2] Issuer bất thường làm validator throw và mất body trace

**Vị trí:** `src/main/java/com/carrental/config/security/JwtConfiguration.java:75–80`.

Validator dùng `jwt.getIssuer()` để kiểm tra presence. Getter này chuyển claim thành URL, có thể throw IllegalArgumentException với chuỗi không phải URL hoặc rỗng. Đường exception vượt khỏi validator/security authentication failure thông thường, đi qua servlet error dispatch; response cuối vẫn 401 nhưng mất correlation ID trong body.

**Đã tái hiện** bằng token ký RS256 đúng key tạm, các claim khác hợp lệ, thay riêng issuer:

```text
REVIEW_ISSUER=VALID   HTTP=200 CODE=OK            BODY_TRACE_NULL=false HEADER_TRACE_PRESENT=true TRACE_MATCH=true
REVIEW_ISSUER=NON_URL HTTP=401 CODE=INVALID_TOKEN BODY_TRACE_NULL=true  HEADER_TRACE_PRESENT=true TRACE_MATCH=false
REVIEW_ISSUER=EMPTY   HTTP=401 CODE=INVALID_TOKEN BODY_TRACE_NULL=true  HEADER_TRACE_PRESENT=true TRACE_MATCH=false
```

Server còn ghi uncaught `IllegalArgumentException: Unable to convert claim 'iss' ... to URL.` từ JwtClaimAccessor.getIssuer. Test issuer sai hiện tại chỉ dùng URL có host khác, nên chưa bắt trường hợp này.

**Cần sửa:** kiểm tra presence/type/value issuer bằng String/raw claim phù hợp, trả OAuth2TokenValidatorResult failure cho input lỗi; không gọi getter URL chỉ để kiểm tra có claim. Issuer comparison vẫn phải chính xác, không bỏ validator issuer/audience/signature/expiry. Không sửa bằng tạo trace mới khi error dispatch hoặc catch mọi lỗi hạ tầng thành INVALID_TOKEN.

Issuer là StringOrURI theo JWT; không có lý do dùng URL getter để ép mọi issuer thành URL chỉ nhằm kiểm tra presence. [RFC 7519, issuer](https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1.1), [Spring JwtClaimAccessor](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/jwt/JwtClaimAccessor.html#getIssuer()).

### R3 — [P2] Stored BCrypt hash sai cost gây 500 thay vì generic login failure

**Vị trí:** `src/main/java/com/carrental/security/CustomerUserDetailsService.java:15,27–30`; `src/main/java/com/carrental/service/impl/AuthServiceImpl.java:105–110`.

Regex chỉ yêu cầu cost có hai chữ số, chưa kiểm tra giá trị BCrypt hợp lệ. Hash malformed vẫn qua gate rồi PasswordEncoder throw IllegalArgumentException; login không chuyển trường hợp dữ liệu xác thực không hỗ trợ này thành generic failure như hợp đồng P03.

**Đã tái hiện:** account giả ở PostgreSQL test, field password_hash được đặt bằng chuỗi giả:

```java
"{bcrypt}$2a$99$" + "A".repeat(53)
```

POST login với email/password hợp lệ về input trả:

```text
REVIEW_MALFORMED_BCRYPT_HTTP=500 CODE=INTERNAL_ERROR
```

Schema leader không có CHECK định dạng password_hash, nên app cần từ chối format không hỗ trợ có kiểm soát. Hợp đồng/docs P03 hiện tuyên bố unsupported hash cho generic authentication failure; ca này chưa được test.

**Cần sửa:** xác minh format/cost BCrypt đủ trước khi trao cho encoder hoặc chuyển đúng lỗi parse hash được nhận diện thành BadCredentials. Trả cùng401 AUTHENTICATION_FAILED/message như email không có/password sai/LOCKED. Không bật plaintext/NoOp fallback, reset dữ liệu hoặc catch toàn bộ exception thành401. Không che DB/network failure thành credentials failure.

## 2. Kiểm tra hiện có đã đạt

- Full `.\mvnw.cmd -B clean verify -Ppostgres-it`: **35 tests**, 0 failures/errors/skipped, BUILD SUCCESS. Surefire17 = JWT config4 + P01 HTTP13; Failsafe18 = auth/security11 + P02 persistence7.
- Packaging probe: PASS; local config, private-key fixture và các marker giả không có trong JAR.
- Registration defaults/hash/normalization và unique race; decoder signature/claim matrix hiện có; authority/status theo DB; bootstrap/CORS và DB lookup503 có bằng chứng test tương ứng.
- Health qua app HTTP/DB/Security trong test: 200/UP, trace khớp; reviewer quan sát `97d281d4-0c6f-47c1-8775-715499b31fc8`.
- Branch BE, HEAD khớp origin/BE; trước khi reviewer viết tài liệu có 110 untracked files. Schema/reference SHA-256 vẫn nguyên trạng.

35 test đạt chỉ chứng minh coverage hiện có. AuthSecurityPostgresIT chưa capture appender/output/cause để assert privacy của log; body assertion không thay thế log assertion. Không có evidence rằng dữ liệu production thật đã bị lộ; tất cả probes dùng dữ liệu/key/DB giả.

## 3. Bằng chứng tái hiện

- Baseline log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-review-verify.log`; raw email nằm ở dòng 195/201/203/205/207/209/211 tại lượt chạy này.
- Packaging log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-review-packaging.log`.
- Probe source/log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-review-extra-1791892484862\P03ReviewProbe.java`, `probe-final.log`.

Probe compile/run ngoài repository, dùng production classes và dependencies từ classpath test sau build, loại target/test-classes; tự tạo RSA keys ngoài classpath và container PostgreSQL15.13. App bind loopback/port ngẫu nhiên; không dùng credential/config local thật. Context/container đóng và key tạm được xóa khi kết thúc.

Probe cũng kiểm tra đóng datasource của chính context test: login nhận500 INTERNAL_ERROR an toàn. Đó không phải finding; không được đổi mọi lỗi login thành401 để chữa R3. Đường DB lookup của token vẫn phải giữ503 đã kiểm chứng.

Đường dẫn/log tạm hỗ trợ kiểm tra tại máy hiện tại, không phải thành phần cần commit hoặc bảo đảm tồn tại lâu dài. Bản sửa phải bổ sung regression tests tái lập trong dự án.

## 4. Kết luận

- P03: **CHANGES_REQUESTED**, sửa R1/R2/R3.
- P04: **NOT_STARTED**, chờ review bản sửa.
- Reviewer không sửa implementation, schema/DB chung, commit/push hoặc triển khai feature P04 trong lượt này.
