# Báo cáo P09-FIX-01 — Exact decimal từ JSON ingress

Ngày thực hiện: **2026-10-14**  
Trạng thái: **READY_FOR_REVIEW** — R1 đã xử lý, chờ reviewer xác nhận. P09 gốc và review gốc giữ làm lịch sử. P10 **NOT_STARTED**.

## Kết quả

Đã sửa R1 bằng cách cấu hình chính `JsonMapper` do Spring Boot MVC sử dụng với Jackson `USE_BIG_DECIMAL_FOR_FLOATS`. JSON floating-point token giờ được lưu thành exact BigDecimal-backed `JsonNode` trước khi các setter của DTO chạy. `CreateVoucherRequest.decimal(...)` tiếp tục nhận JSON number nghiêm ngặt và đọc bằng `decimalValue()`; phần lẻ/underflow không còn bị mất qua `DoubleNode` trước kiểm tra `NUMERIC(14,0)`.

Giữ nguyên schema leader, entity, migration, U-19/U-20/U-21, routes, defaults/null/presence semantics, duplicate/unknown/type guards, quota locks, counter protocol, authorization, audit và boundary Function 3. Không thêm dependency. Thay đổi mapper có phạm vi dùng chung cho JSON floating-point khi binding generic/tree; DTO kiểu số nguyên vẫn giữ quy tắc token integral.

## Thực hiện theo 5 bước

1. **Hiện trạng/bảo toàn:** xác nhận repository Desktop, branch `BE`, `HEAD` và `origin/BE` cùng là `2fe712eed12a2af3b61f0a5311bdd3901f614029`. JDK 21.0.8, Maven Wrapper 3.9.11, Docker Server 28.5.2; Windows 11. `JAVA_HOME` được đặt riêng trong process chạy lệnh Maven. Lúc bắt đầu có 246 đường dẫn untracked từ project/history trước đó, không có tracked/staged diff. Không reset, clean Git, stash, stage, commit, push hay thay nhánh.
2. **Exact ingress:** thêm Boot `JsonMapperBuilderCustomizer` dùng `USE_BIG_DECIMAL_FOR_FLOATS`. Không chuyển JSON token qua `double`, không round/scale raw input, không đổi kiểu API hoặc schema.
3. **Regression fixtures:** sửa numeric test fixtures để mỗi field xuất hiện đúng một lần; deliberate duplicate-key fixture vẫn là ca riêng. Bổ sung mapper→JsonNode/DTO assertions và ma trận HTTP/PostgreSQL.
4. **Xác minh:** targeted test, `clean verify -Ppostgres-it`, executable Boot JAR/CWD regression, packaging probe và health HTTP đều chạy. PostgreSQL chỉ là Testcontainers PostgreSQL 15.13 cô lập; không dùng DB chung.
5. **Tài liệu/report:** cập nhật contract, API/architecture, local guide, plan/status/index, AGENTS/README, decisions/roadmap và tài liệu P01–P08 đang theo dõi trạng thái hiện hành. Tài liệu nguồn `docs/reference/`, schema và report/review gốc không sửa.

## Bằng chứng R1 và regression

Ma trận chạy qua application mapper thực, DTO `CreateVoucherRequest`, endpoint `POST /api/vouchers` và PostgreSQL Testcontainers. Mỗi invalid request trả HTTP 400 `VALIDATION_ERROR`, header `X-Request-ID` trùng `traceId`, không tạo row/mã voucher, tổng row count không đổi và không phát committed change event. Response `message`/`errors` và log không chứa sentinel hoặc raw numeric token; trace UUID được bỏ khỏi phép so token trong log để tránh chuỗi `-1` trùng dấu phân tách trace.

| Dữ liệu kiểm tra | Kết quả thực tế mong đợi và quan sát |
|---|---|
| `discountValue`: `1.00000000000000001`, `99999999999999.00001`, PERCENT `100.00000000000000001`, `12.5`, `1.25e1`, `1e-400`, `-1`, `-1e-400` | 400; không row/event; exact DTO binding được đối chiếu trước HTTP |
| `maxDiscount`: `1e-400`, `99999999999999.00001`, `-1`, `-1e-400` | 400; không row/event |
| `minOrderAmount`: `-1e-400`, `-1`, `1e-400`, `99999999999999.00001` | 400; không row/event |
| JSON string/null không nullable/boolean/array/object/NaN/Infinity | 400; giữ strict JSON type contract |
| `usageLimit`/`perUserLimit`: `1.0`, `1e0`, integer overflow | 400; integer type/range guard không bị thay đổi |
| Positive `1`, `1.0`, `1e3`, NUMERIC(14,0) max `99999999999999`, PERCENT `100.0`; nullable max và default/zero controls | HTTP 201; giá trị PostgreSQL exact; defaults/null giữ nguyên |

Các test hiện có cho duplicate/unknown/internal `status`/`usedCount`/actor fields vẫn chạy; duplicate-code fixture cố ý tiếp tục bị từ chối riêng. Kết quả giữ semantics rằng decimal có phần lẻ khác 0 bị từ chối chứ không bị PostgreSQL scale-round.

## Lệnh đã chạy và kết quả

Môi trường được xác nhận bằng `java -version`, `.\mvnw.cmd -v`, `docker version --format '{{.Server.Version}}'`. Kết quả: Oracle JDK `21.0.8`, Maven `3.9.11`, Docker `28.5.2`.

| Lệnh | Kết quả |
|---|---|
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B -Ppostgres-it '-Dit.test=VoucherAdminPostgresIT#jsonMapperAndHttpPreserveExactVoucherDecimalTokens' test-compile failsafe:integration-test failsafe:verify` | Cuối cùng PASS **1/1**, 0 failure/error/skip; Testcontainers PostgreSQL 15.13, actual mapper/HTTP/database assertions |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify -Ppostgres-it` | Final PASS **144/144**: Surefire **38**, Failsafe **106**, 0 failure/error/skip; tổng thời gian Maven **3:02**. Bao gồm actual Boot JAR/CWD test và P01–P08 regressions |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1` | PASS; tạo executable JAR trong temp clone. Tất cả marker `LOCAL_CONFIG_ENTRY`, fake local config/key/bootstrap/private document, storage root, private key và test Boot helper đều `False` |

### Các lượt kiểm tra đã sửa trong quá trình làm

- Một lần `test-compile` ban đầu thất bại vì Jackson 3 `JsonNode` không có `remove(String)`; test được đổi sang assert riêng `message`/`errors` và so trace với header.
- Lượt `clean verify` đầu tiên có **1 failure** trong assertion: raw token `-1` bị phát hiện như một phần của UUID trace trong response body; production response không echo giá trị. Assertion được sửa để so các trường message/error độc lập với trace.
- Sau đó focused test và full suite PASS. Trước lần verify cuối, log assertion được tăng cường để kiểm tra mọi token của ma trận sau khi loại trace UUID; focused test chạy lại PASS **1/1**, rồi chạy lại clean full suite.
- Lượt `clean verify` cuối cùng sau tất cả thay đổi PASS **144/144**. Không có test nào bị bỏ qua; lượt lỗi đầu không được tính là pass.

Full verify log cuối: `%TEMP%\sba301-p09-fix01-clean-verify-final2-20261014.log`. Lượt verify đầu được giữ tại `%TEMP%\sba301-p09-fix01-clean-verify-20261014.log`. Các log nằm ngoài repo/`target`.

## Health và Boot JAR thực tế

`Function1PostgresIT.runningWebApplicationServesHealthWithMatchingRequestTrace` gọi HTTP thực vào ứng dụng chạy với PostgreSQL test; assertion kiểm tra JSON response và message UTF-8 `Thành công`:

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"2abc42f1-475a-4158-9eaf-2078e9b85cdd"}
```

Quan sát: HTTP **200**, `Content-Type: application/json`, `data.status=UP`, `X-Request-ID=2abc42f1-475a-4158-9eaf-2078e9b85cdd` trùng body `traceId`. Endpoint chỉ xác nhận web application đang chạy; test không xem đây là database/auth/storage readiness endpoint.

Trong cùng full verify, `StorageRootBootJarIT` chạy actual Spring Boot executable JAR bằng child JVM từ CWD khác: physical application/config/public/target roots bị từ chối, external root được chấp nhận, disabled storage khởi tạo không cần root, path Unicode/space/percent đạt. Đây là test actual JAR riêng; health HTTP evidence ở trên là application + PostgreSQL integration test.

## File tạo/sửa

| File | Vai trò |
|---|---|
| `src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java` | Bean customizer cho application `JsonMapper` của Boot; bảo toàn JSON float token thành BigDecimal-backed tree node |
| `src/test/java/com/carrental/VoucherAdminPostgresIT.java` | Numeric fixtures unique-field, exact DTO/HTTP/PostgreSQL matrix, positive controls, strict integer/type checks, no-row/event/privacy/log assertions |
| `AGENTS.md`, `README.md` | Trạng thái P09-FIX-01 và quy tắc exact decimal hiện hành |
| `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/16_ADMIN_VOUCHERS.md` | Cập nhật giải pháp mapper/binding và current status; schema/contract semantics giữ |
| `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/README.md` | Theo dõi tiến độ, quyết định và lịch sử; P09 gốc vẫn CHANGES_REQUESTED lịch sử, FIX chờ review, P10 chưa bắt đầu |
| `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md`, `docs/14_DRIVER_PROFILE_ELIGIBILITY.md`, `docs/15_BANK_ACCOUNTS.md`, `docs/LOCAL_DEVELOPMENT.md` | Cập nhật ghi chú current implementation và regression liên phiên bản |
| `docs/reports/P09_FIX_01_REPORT.md` | Báo cáo bằng chứng lượt sửa này |

Không sửa `docs/reference/`, schema, entity, migration, `docs/reports/P09_REPORT.md`, `docs/reviews/P09_REVIEW.md` hay prompt nguồn. Không thêm dependency.

## Hash bảo toàn

| File | SHA-256 quan sát |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `src/main/java/com/carrental/entity/Voucher.java` | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |
| `docs/reports/P09_REPORT.md` | `85D654CB5C9F446C17DBF9C32C595A017DEF8912DC6D86017E0351B75E2E8DB4` |
| `docs/reviews/P09_REVIEW.md` | `130F473E875D4C3EEF62AAB23BCAC3EEA0191CF3C86AFED287F677DC816566E9` |

Schema/conventions/diagram/migration/entity/report hashes khớp với bằng chứng trước đó của reviewer. Review file được đọc nhưng không sửa trong lượt này.

## Git snapshot và giới hạn

- Branch `BE`, `HEAD=origin/BE=2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- `git diff --stat` và `git diff --cached --stat` rỗng; không có staged/tracked diff. Repo vốn có toàn bộ project/history ở trạng thái untracked (246 path lúc bắt đầu); sau thêm mapper có 247; sau tạo report có **248 đường dẫn untracked**.
- `git status --short` tiếp tục liệt kê các nhóm untracked đã có: `.gitignore`, `.mvn/`, `AGENTS.md`, `README.md`, `config/`, `docs/`, `mvnw`, `mvnw.cmd`, `pom.xml`, `scripts/`, `src/`. Các file mới riêng lượt này là mapper config và report; test/source/docs khác đã ở trong cây untracked hiện có. Không stage/commit/push.
- Hành vi exact-decimal được chứng minh trên HTTP/PostgreSQL cô lập; không chạy SQL hoặc probe trên database chung/production.
- Không tích hợp Function 3 consumption/pricing/order/reservation; quota writer evidence vẫn là regression synthetic đã có. Không thay schema, scale, policy hoặc U-19/U-20/U-21.
- P09-FIX-01 chỉ đặt **READY_FOR_REVIEW**; R1 chưa được tự đánh dấu CLOSED/APPROVED. P10 **NOT_STARTED**.
