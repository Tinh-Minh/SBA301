# Review P07 — CHANGES_REQUESTED

Ngày review: **2026-10-14**. Reviewer chạy lại **124/124 test**, packaging và health đạt. Probe HTTP bổ sung xác nhận **R1: predicate hạng GPLX không blank khác P05/P06**, khiến GPLX APPROVED chỉ chứa TAB hoặc EM SPACE vẫn cho kích hoạt và trả current eligibility hợp lệ. **P07 CHANGES_REQUESTED; P08 NOT_STARTED.** [Báo cáo Agent](../reports/P07_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; 2 phút 21 giây; **124/124**, 0 failure/error/skip |
| Surefire | 38 test |
| Failsafe | 86 test, gồm các PostgreSQL IT và actual Boot JAR root IT |
| P07 suites | DriverProfilePostgresIT 10/10; DriverConcurrencyPostgresIT 6/6; hai driver policy unit tests đạt |
| Packaging probe với JDK 21 | PASS; local config, key, bootstrap/document markers, storage-root path và test helper đều không vào JAR |
| Health HTTP/PostgreSQL | 200, `data.status=UP`; trace body/header khớp `55edac54-4c55-46f6-adb0-4086ab4bb622` |
| Probe GPLX blank | ASCII space bị chặn; TAB và EM SPACE sai: activation 200, stored ACTIVE, current `eligibleNow=true` |
| Git trước viết review docs | BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 210 đường dẫn untracked; không staged hoặc tracked diff |

Logs tại `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p07-review-verify.log`
- `sba301-p07-review-packaging.log`
- `sba301-p07-review-blank-class-probe.log`

Helper reviewer nằm ngoài repository ở `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p07-review-probe\DriverBlankClassProbe.java`. Nó nạp production classes, loại `target/test-classes` khỏi classpath, chạy application HTTP thật và PostgreSQL 15.13 Testcontainers với RSA keys/accounts/documents tổng hợp. Migration leader giữ nguyên. Application/container/keys được đóng và dọn sau probe. Lần chạy helper đầu lỗi kiểu tham số SQL trong fixture; chỉ sửa helper TEMP thành cast `bigint` rồi chạy lại, không sửa source repository. Log fixture lỗi giữ riêng, không được tính là finding của ứng dụng.

## 2. R1 — [P2] GPLX có hạng chỉ chứa whitespace vẫn được coi là hợp lệ

**Vị trí:** `src/main/java/com/carrental/repository/CustomerRepository.java:59`, trong `findDriverEligibility`; regression hiện có ở `src/test/java/com/carrental/DriverProfilePostgresIT.java:293`.

Predicate hiện tại:

```sql
d.verify_status = 'APPROVED' and d.expires_at is not null
and d.expires_at >= :today and nullif(btrim(d.license_class), '') is not null
```

`btrim(text)` mặc định loại space ở hai đầu, nên TAB (`U+0009`) và EM SPACE (`U+2003`) vẫn tạo chuỗi khác rỗng. [PostgreSQL 15 — String functions, Table 9.10](https://www.postgresql.org/docs/15/functions-string.html). P05 normalizes bằng `strip()` và P06 `notBlank` dùng `value != null && !value.strip().isEmpty()`. Java `strip()` dựa trên whitespace theo `Character.isWhitespace`; hai ký tự trên là blank theo policy đang dùng. [Java 21 — String.strip](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#strip()).

Projection này được dùng chung cho activation và current eligibility, vì vậy cả hai trả sai trên dữ liệu APPROVED có hạng blank. CHECK của leader chỉ yêu cầu `license_class IS NOT NULL` cho GPLX; các giá trị này hợp lệ về cấu trúc DB. P07 contract yêu cầu hạng không blank; không thể dựa vào P05/P06 để bỏ kiểm tra current data.

### Tái hiện trên application thật

Mỗi fixture có account ACTIVE, PASSPORT APPROVED còn hiệu lực, driver PENDING và GPLX còn hạn của đúng owner. Đối với các hạng blank, reviewer gọi P06 approve trước: cả ba đều trả **409 DOCUMENT_NOT_APPROVABLE**. Sau đó helper chỉ trong DB Testcontainer chuyển bản GPLX tổng hợp sang APPROVED để mô hình hóa dữ liệu legacy/import hợp lệ theo schema. Tiếp theo gọi owner GET eligibility, ADMIN khác PATCH driver ACTIVE rồi owner GET eligibility lần nữa.

| Hạng tổng hợp | Java strip blank | `hasValidDriverLicense` trước activation | HTTP activation / code | Stored driver sau request | `eligibleNow` sau request |
|---|---|---|---|---|---|
| ASCII SPACE `U+0020` | true | false | 409 / DRIVER_NOT_ELIGIBLE | PENDING | false |
| TAB `U+0009` | true | **true** | **200 / OK** | **ACTIVE** | **true** |
| EM SPACE `U+2003` | true | **true** | **200 / OK** | **ACTIVE** | **true** |
| `B` | false | true | 200 / OK | ACTIVE | true |

Current KYC là VERIFIED ở cả bốn fixture; trace body/header khớp. Đây là lỗi P07 khi đọc dữ liệu APPROVED được schema cho phép. Probe không chứng minh customer có thể tự đổi status giấy tờ hoặc vượt P06 approval bằng HTTP; P06 đã từ chối đúng các hạng blank.

Existing `blank-class` regression chỉ seed ASCII space, nên 124 test vẫn đạt. Cần thống nhất predicate SQL với semantics nonblank của P05/P06, giữ một aggregate statement và áp dụng cùng kết quả cho activation, owner/admin GET và internal F2 evaluation. Không chỉ blacklist TAB/EM SPACE hoặc thêm danh sách hạng hợp pháp. Kiểm tra các nhóm Java whitespace, mixed whitespace, chuỗi có hạng thực và trường hợp một GPLX hợp lệ trong nhiều bản.

Đối với PENDING/SUSPENDED, activation khi chỉ có blank GPLX phải 409, không đổi driver/audit hoặc phát committed event. Với driver đã ACTIVE, GET phải ineligible theo GPLX; ACTIVE→ACTIVE vẫn revalidate và trả 409, không tự suspend. Reason precedence hiện có giữ nguyên.

## 3. Phần đạt và giới hạn

- API create không body/query, strict status DTO, ownership, admin paging và safe responses có implementation và regression đạt.
- U-15 cấm ADMIN self-status, gồm no-op; command đọc lại actor/owner trong transaction và dùng shared advisory → actor → owner → driver locks. Actual PostgreSQL blocking/timeout/retry và actor-state races trong P07 suites đạt.
- Current identity KYC theo Clock, snapshot/current separation, expiry hôm nay, GPLX đúng owner/type/status/hạn và một valid proof trong nhiều bản đã có kiểm tra. R1 giới hạn ở predicate whitespace của hạng GPLX.
- Stored ACTIVE khác current eligibility; GET không autosuspend hoặc sửa audit/KYC. F2 interface trả snapshot và cần recheck khi action; không mở nghiệp vụ xe/slot.
- P01–P06 regressions, actual Boot JAR root và packaging đạt; không bổ sung finding chặn nào khác trong lượt này.
- Production config/DB, Windows ACL, multi-node, throughput và crash consistency chưa được kiểm chứng; không mở rộng claim từ isolated tests.

## 4. Bảo toàn nguồn và bước tiếp theo

SHA-256 giữ nguyên:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `docs/reports/P07_REPORT.md` | `3D18C28E4C3FAEB6117FE3937622B3CE84CC9E12A7C4A5CB23FFB26A25E3B05B` |

Reviewer chỉ kiểm tra implementation, chạy verification/probe cô lập và viết review/prompt/current docs. Không sửa production source/tests, schema/reference, stage/commit/push hoặc chạy SQL lên DB chung. Thực hiện **[P07-FIX-01 — 5 bước](../prompts/P07_FIX_01.md)**, tạo báo cáo thực tế và dừng ở READY_FOR_REVIEW; P08 chưa bắt đầu.
