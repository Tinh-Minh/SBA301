# Review P09-FIX-01 — APPROVED

Ngày review: **2026-10-14**. **R1 CLOSED; P09 APPROVED.** Reviewer chạy lại **144/144 tests**, packaging, actual Boot JAR/CWD, health và cùng production HTTP/PostgreSQL probe trước/sau. Decimal token được giữ exact trước DTO; invalid fractional/underflow inputs không tạo row. [Report sửa](../reports/P09_FIX_01_REPORT.md), [report gốc](../reports/P09_REPORT.md) và [review gốc](P09_REVIEW.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; 2 phút 40 giây; **144/144**, 0 failure/error/skip |
| Surefire / Failsafe | 38 / 106; VoucherAdminPostgresIT 7/7; P01–P08 regressions giữ |
| Packaging probe | PASS; local/key/bootstrap/document markers, root path và test Boot helper không vào JAR |
| Actual Boot JAR/CWD | StorageRootBootJarIT đạt trong full verify |
| Health HTTP/PostgreSQL | 200/UP; body/header trace `708993dc-854d-4152-b03b-32e0c693b1e3` khớp |
| Same-helper numeric probe | Năm invalid boundary inputs và12.5 trả400 VALIDATION_ERROR, rows0; valid1.0 tạo201 và lưu1 |
| Git trước review docs | BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 248 đường dẫn untracked, không staged/tracked diff |

Logs reviewer tại `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p09-fix01-review-verify.log`
- `sba301-p09-fix01-review-packaging.log`
- `sba301-p09-fix01-review-number-probe.log`

## 2. R1 CLOSED — Source và cùng probe trước/sau

`ExactDecimalJsonMapperConfiguration` đăng ký Boot `JsonMapperBuilderCustomizer` bật `USE_BIG_DECIMAL_FOR_FLOATS`. Bean được application auto-configuration và MVC dùng; nested JsonNode setters nhận DecimalNode trước validation. DTO/service vẫn giữ strict numeric/null/presence/duplicate guards và exact BigDecimal NUMERIC(14,0), không đổi schema/API hoặc đi qua double.

Reviewer compile lại helper TEMP `sba301-p09-review-probe\VoucherNumberProbe.java`, nạp production classes, loại target/test-classes khỏi classpath. Cùng app HTTP thật/PostgreSQL15.13/RSA/admin/codes tổng hợp, payload mỗi field xuất hiện một lần. Helper/context/container/keys được đóng/dọn; không production/shared DB.

| JSON token / field | Trước sửa | Sau sửa binding | Sau sửa HTTP / DB |
|---|---|---|---|
| FIXED discountValue `1.00000000000000001` | DoubleNode1.0, 201/lưu1 | DecimalNode exact `1.00000000000000001` | 400 VALIDATION_ERROR, rows0 |
| discountValue `99999999999999.00001` | Rounded integer,201 | Exact fraction | 400, rows0 |
| PERCENT discountValue `100.00000000000000001` | Rounded100.0,201 | Exact fraction trên100 | 400, rows0 |
| minOrderAmount `-1e-400` | Underflow0.0,201/lưu0 | Exact `-1E-400` | 400, rows0 |
| maxDiscount `1e-400` | Underflow0.0,201/lưu0 | Exact `1E-400` | 400, rows0 |
| discountValue `12.5` | 400 đúng | Exact12.5 | 400, rows0 |
| discountValue `1.0` | 201 đúng | Exact1.0 | 201 OK, lưu1 |

Trace body/header khớp ở mọi case. Probe chứng minh parsing ingress actual app đã sửa, không chỉ mapper riêng trong unit test. Invalid values giữ đủ thông tin rồi bị từ chối trước DB, positive integral-decimal semantics vẫn đúng.

Automated regression dùng application mapper/DTO/actual HTTP/PostgreSQL:16 invalid numeric cases trên cả3 decimal fields, positive integers/1.0/exponent/precision-boundary controls, no-row/no-event/privacy. INT quotas1.0/1e0 vẫn400; unknown/duplicate/internal keys và null/defaults giữ. Numeric fixtures mới mỗi field một lần; duplicate fixture cố ý riêng. UUID trace được kiểm tra độc lập để tránh false positive token `-1` trùng dấu UUID.

Mapper config có tác động chung tới generic/tree JSON floating tokens. Full P01–P08 và voucher counter/locks/audit/type/security regressions đã chạy đạt. R1 CLOSED, không có finding chặn mới trong phạm vi bản sửa.

## 3. Bảo toàn, giới hạn và bước tiếp theo

| File | SHA-256 giữ nguyên |
|---|---|
| schema.sql | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| BACKEND_CONVENTIONS.md reference | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| car_rental_conceptual.drawio reference | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| V1__function1_leader_baseline.sql | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| Voucher.java | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |
| P09_REPORT.md | `85D654CB5C9F446C17DBF9C32C595A017DEF8912DC6D86017E0351B75E2E8DB4` |
| P09_FIX_01_REPORT.md | `04225FB74113D109755C04328C1266BFF0FB200C8338DDC36EF4B54BA8749360` |

U-19/U-20/U-21, schema/locks/latest counter/immutable fields/Clock/window/audit/security và history giữ nguyên. Chưa kiểm chứng production/shared DB, full F3 price/reserve-release/per-user usage, OS production ACL, multi-node, throughput hoặc crash consistency. Health UP là web liveness trong app dùng PostgreSQL test, không readiness cho mọi dependency.

Reviewer chỉ đọc/verify/probe cô lập và viết docs; không sửa source/tests/entity/schema/reference/history, stage/commit/push hoặc dùng DB chung. **[P10 — 9 bước kiểm tra và bàn giao](../prompts/P10_FUNCTION_1_HANDOFF.md) PROMPT_READY**, chưa triển khai. P01–P09 đã được duyệt; chưa tuyên bố toàn bộ Function 1 hoàn tất trước review P10.
