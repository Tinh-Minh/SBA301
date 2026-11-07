# Review P09 — CHANGES_REQUESTED

Ngày review: **2026-10-14**. Reviewer chạy lại **143/143 test**, packaging/actual Boot JAR/health đạt. Probe application HTTP bổ sung xác nhận **R1: JSON number bị chuyển qua DoubleNode, mất phần lẻ hoặc underflow trước validation**. Voucher không hợp lệ vẫn được tạo 201 và lưu giá trị đã đổi. **P09 CHANGES_REQUESTED; P10 NOT_STARTED.** [Report Agent](../reports/P09_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; 3 phút 11 giây; **143/143**, 0 failure/error/skip |
| Surefire / Failsafe | 38 / 105; VoucherAdminPostgresIT 6/6; actual Boot JAR/CWD regression đạt |
| Packaging | PASS; local/key/bootstrap/document markers, storage-root path và test helper không vào JAR |
| Health HTTP trong PostgreSQL context | 200/UP; trace body/header `20e8880a-a999-407b-832f-c55eb0886a65` khớp |
| Probe numeric thực tế | Năm payload fractional/negative-underflow sai được tạo201, mỗi payload thêm một row; ordinary12.5 bị400, valid1.0 tạo201 |
| Git trước viết review docs | BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 244 đường dẫn untracked; không staged/tracked diff |

Logs ở `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p09-review-verify.log`
- `sba301-p09-review-packaging.log`
- `sba301-p09-review-number-probe.log`

Helper `sba301-p09-review-probe\VoucherNumberProbe.java` ở TEMP, nạp production classes và loại target/test-classes khỏi classpath. Nó chạy app HTTP thật, PostgreSQL15.13 và RSA/admin/codes tổng hợp, dùng JSON numeric literal mỗi field đúng một lần. Nó đọc DTO bằng JsonMapper bean của app để đối chiếu binding rồi gọi HTTP và query row thật. Application/container/temporary keys đã được đóng/dọn; không dữ liệu hoặc DB production.

## 2. R1 — [P2] Exact numeric validation chạy sau khi JSON số đã bị làm tròn hoặc underflow

**Vị trí:** `src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java:154–161`, helper `decimal(...)`; các setters discountValue/maxDiscount/minOrderAmount dùng helper này. `VoucherServiceImpl.numeric14(...)` kiểm tra BigDecimal sau binding nhưng không khôi phục được token gốc.

`decimal(JsonNode)` gọi `value.decimalValue()`. JsonMapper production hiện tạo **DoubleNode** cho JSON floating-point tokens. Tại đây `1.00000000000000001` đã thành `1.0`; convert sang BigDecimal sau đó vẫn là1.0, nên service coi integral và lưu1. Với `-1e-400`, minOrderAmount đã thành0.0 trước sign/scale check. Việc entity/service dùng BigDecimal không bảo đảm exact nếu ingress từng đi qua double.

Jackson mô tả `USE_BIG_DECIMAL_FOR_FLOATS` là cấu hình cho binding floating numbers dưới type generic và mặc định disabled; fix phải áp dụng trước tree/DTO conversion trong application mapper hoặc parsing voucher phù hợp. [Jackson — DeserializationFeature source](https://raw.githubusercontent.com/FasterXML/jackson-databind/3.x/src/main/java/tools/jackson/databind/DeserializationFeature.java). Probe dưới đây là bằng chứng trực tiếp cho cấu hình hiện tại, không suy kết quả chỉ từ default của library.

### HTTP/PostgreSQL observations

Các payload có code riêng, ADMIN ACTIVE, loại/hạn hợp lệ, không unknown/duplicate fields. Kết quả thực tế:

| Field / JSON token | DTO binding quan sát | HTTP / code | Giá trị PostgreSQL | Kết quả cần có |
|---|---|---|---|---|
| FIXED discountValue `1.00000000000000001` | 1.0 | **201 OK** | discount_value=1 | 400, không row |
| FIXED discountValue `99999999999999.00001` | 99999999999999 | **201 OK** | discount_value=99999999999999 | 400, không row |
| PERCENT discountValue `100.00000000000000001` | 100.0 | **201 OK** | discount_value=100 | 400, không row |
| minOrderAmount `-1e-400` | 0.0 | **201 OK** | min_order_amount=0 | 400, không row |
| maxDiscount `1e-400` | 0.0 | **201 OK** | max_discount=0 | 400, không row |
| FIXED discountValue `12.5` | 12.5 | 400 VALIDATION_ERROR | Không row | Đúng |
| FIXED discountValue `1.0` | 1.0 | 201 OK | discount_value=1 | Đúng: integral numeric value |

Mọi trace body/header khớp; mỗi case201 có đúng một row. Năm invalid inputs đã mất thông tin trước DB, không phải PostgreSQL tự round ở lượt persist này. Các values/codes hoàn toàn tổng hợp; không có evidence production bị khai thác.

### Regression hiện có chưa bắt boundary này

Trong `VoucherAdminPostgresIT.java:165–166`, các case fraction/overflow gọi `body(...)` với extra `discountValue`. Helper `:545–552` đã có discountValue trong base và append extra field, tạo **duplicate key**. Response400 của hai fixtures đó không chứng minh numeric validation riêng. Ordinary12.5 vẫn bị production từ chối đúng trong probe không duplicate; thiếu ca gần integer/precision boundary và exponent underflow mới để lọt R1.

**Yêu cầu sửa:** giữ exact decimal từ token vào DTO trước bất kỳ binary floating-point conversion; giữ strict JSON number types và defaults/null/presence/duplicate protections. Không chữa bằng BigDecimal từ DoubleNode.asText hoặc String.valueOf(double), không đổi API sang numeric strings hoặc cấm mọi decimal token1.0 hợp lệ. Thêm regression actual HTTP với unique fields và all three decimal inputs, xác nhận400/no rows/no committed event; positive integer/1.0/exact exponent vẫn đạt. Test integer quota1.0 vẫn400 như contract riêng.

## 3. Phần đạt và checksum entity

- ADMIN authority/status recheck, U-19/U-20/U-21, immutable fields, status/no-op, query/DB pagination và exact code semantics có source/regressions đạt.
- Current counter under row lock đã được reviewer chạy lại: holder61/waiter63 blocks `[61]`, count2→4 commit, quota3 bị409, không overwrite. Status waiter62/update63 thấy count5; actor recheck và55P03/retry đạt. R1 không phủ nhận quota concurrency evidence này.
- Audit/after-commit/no-op/rollback, exact23505/other integrity/privacy, Clock window/start-inclusive/end-exclusive và date parsing có kiểm tra; scope F3 giữ. Không thêm finding chặn khác trong lượt này.
- Report Agent ghi đúng rằng report P08 thiếu checksum entity trước P09. Reviewer có **snapshot hashes do chính reviewer lấy ở lượt P08**; Voucher.java khi đó và hiện tại đều `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504`. Đây là bằng chứng reviewer bổ sung, không sửa report lịch sử hoặc giả rằng Agent đã có checksum trước.

## 4. Bảo toàn và bước tiếp theo

| File | SHA-256 giữ nguyên |
|---|---|
| schema.sql | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| BACKEND_CONVENTIONS.md reference | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| car_rental_conceptual.drawio reference | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| V1__function1_leader_baseline.sql | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| Voucher.java, P08 reviewer baseline và hiện tại | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |
| P09_REPORT.md | `85D654CB5C9F446C17DBF9C32C595A017DEF8912DC6D86017E0351B75E2E8DB4` |

Reviewer chỉ đọc/verify/probe cô lập và viết docs; không sửa production source/tests/entity/schema/reference/report, stage/commit/push hoặc DB chung. Thực hiện **[P09-FIX-01 — 5 bước](../prompts/P09_FIX_01.md)** và báo READY_FOR_REVIEW rồi dừng. P10 chưa soạn/triển khai. Production/F3 full usage/ACL/multi-node/throughput limitations giữ nguyên.
