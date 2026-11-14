# Review P03-FIX-01 — APPROVED

Ngày review: 2026-10-13. Reviewer đọc implementation, regression tests và báo cáo, rồi chạy lại kiểm tra trên workspace Desktop, nhánh BE. **P03 APPROVED; R1/R2/R3 CLOSED.** Không phát hiện finding chặn trong phạm vi bản sửa. [Review gốc](P03_REVIEW.md) giữ nguyên CHANGES_REQUESTED như lịch sử; [báo cáo Agent](../reports/P03_FIX_01_REPORT.md) không bị viết lại.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS, 56.941 giây; **38/38**, 0 failures/errors/skipped |
| Surefire | PlatformHttpTest 13, JwtConfigurationTest 4 |
| Failsafe | AuthSecurityPostgresIT 14, Function1PostgresIT 7 |
| Database / HTTP | PostgreSQL 15.13 Testcontainers, baseline cô lập, Hibernate validate và server HTTP thật |
| Health | HTTP 200, UP; body/header trace khớp, quan sát `8bc51273-2759-4983-8256-e289edb9571d` |
| Packaging probe | PASS; local config entry, private key entry và cả ba marker config/key/bootstrap đều không có trong JAR |
| Git trước khi viết review | BE, HEAD = origin/BE = `2fe712eed12a2af3b61f0a5311bdd3901f614029`; 113 file untracked |
| Reference | SHA-256 schema, conventions, drawio khớp đầu vào |

Logs của lượt reviewer:

- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-fix-review-verify.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p03-fix-review-packaging.log`
- XML tại `target/surefire-reports/` và `target/failsafe-reports/`.

Packaging chạy trong bản sao tạm và skip test ở bản sao đó. Kết quả 38 test đến từ full verify riêng; không cộng probe vào số test. JAVA_HOME chỉ đặt trong tiến trình kiểm tra.

## 2. Đóng finding

### R1 — CLOSED: log JDBC thô có thể chứa email/phone

`application.properties` tắt SQL display cùng `hibernate.jdbc.log.errors` và `hibernate.jdbc.log.warnings`. Service vẫn log trace và tên constraint nằm trong allowlist, không log exception/cause chứa PostgreSQL Detail.

Regression gọi HTTP thật và vi phạm email/phone unique constraint trên PostgreSQL thật. Spy chỉ bỏ pre-check để ép đi vào đường constraint; `saveAndFlush` vẫn chạy thật, không có mock thay cho lỗi database. Appender bắt formatted message, MDC, throwable/cause/suppressed; assertion có log conflict với trace/tên constraint và không có marker email, phone, password, hashes hay bearer. Truy vấn DB xác nhận không có row thứ hai. Test 8 đăng ký đồng thời được giữ.

### R2 — CLOSED: ép issuer qua URL gây mất trace

JwtConfiguration dùng issuer claim như String và so sánh exact; bỏ JwtIssuerValidator/getIssuer URL ở đường validation này. RS256/signature/audience/time/required claims vẫn được kiểm tra.

Test issuer hợp lệ `sba301:function1:test-issuer` phát token và truy cập me thành công. Matrix token sai chữ ký/algorithm/claims và issuer rỗng, không khớp, sai kiểu, thiếu đều đi qua decoder/filter chain thật: 401 INVALID_TOKEN, trace khớp header, không lộ token. Log không có lỗi URL conversion hoặc Servlet.service. Không dùng cách tạo trace mới tại error dispatch để che lỗi.

### R3 — CLOSED: BCrypt hash sai cost gây 500

UserDetailsService chỉ nhận dạng hash hỗ trợ với cost 4–31, version a/b/y và alphabet/length tương ứng; dữ liệu lưu không hỗ trợ trở thành UsernameNotFoundException để provider trả generic credentials failure. Không reset hash hay thêm plaintext fallback.

Regression kiểm tra cost 99/03, prefix lạ và plaintext đều trả 401 AUTHENTICATION_FAILED, trace đúng và không log hash/password. Control login đúng vẫn 200; sai password vẫn 401. Test lỗi repository dùng fault injection có chủ đích và xác nhận 503 DEPENDENCY_UNAVAILABLE; GlobalExceptionHandler xử lý AuthenticationServiceException riêng, không đổi lỗi dependency thành lỗi credentials.

## 3. Giới hạn và bước tiếp theo

- Kiểm chứng bằng PostgreSQL/key/dữ liệu tổng hợp cô lập; không xác nhận database chung, production keys, issuer, origin FE hay khả năng tải production.
- Log regression kiểm tra đường lỗi được nêu, không phải chứng nhận mọi logger ở mọi cấu hình đều không thể log PII. Cấu hình bảo vệ hiện tại phải được giữ khi thêm use case.
- Lỗi repository login được inject trong regression; các mapping/constraint/JWT/HTTP còn lại chạy thật. Không gọi lỗi inject là một lần mất kết nối PostgreSQL thật.
- Không thay source implementation, schema/reference, stage/commit/push hoặc chạy SQL lên database chung trong lượt reviewer.

P04 đã được soạn tại [prompt hồ sơ và quản trị tài khoản](../prompts/P04_CUSTOMER_PROFILE_ADMIN.md). Trạng thái P04 là PROMPT_READY, chưa có implementation/report P04. Người dùng đã xác nhận cấm ADMIN tự khóa và cấm khóa ADMIN ACTIVE cuối cùng; quyết định U-09 được ghi ở prompt/sổ quyết định. Chưa chốt policy tự duyệt KYC ở P06.
