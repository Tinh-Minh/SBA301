# 16 — Quản trị voucher và giao ước với Function 3

**P09 APPROVED/R1 CLOSED** theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md), sau reviewer 144/144/packaging/Boot/health và cùng numeric probe. Production JsonMapper giữ exact decimal trước JsonNode/DTO; invalid fractions/underflow400/rows0, integral1.0 hợp lệ201. U-19/U-20/U-21/schema/history giữ; P10 CHANGES_REQUESTED; P10-FIX-01 READY_FOR_REVIEW với R1/R2 chờ reviewer. Voucher workflow kiểm tra status/window, decimal integral/fraction, quota token và duplicate code guard. Xem [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md).

Contract NUMERIC(14,0) dùng exact token trước validation, đã được reviewer xác nhận tại application mapper và actual HTTP/PostgreSQL. Giữ USE_BIG_DECIMAL_FOR_FLOATS và fixtures numeric mỗi field một lần; deliberate duplicate guard riêng, strict INT tokens giữ. Routes/defaults/null/U-19/U-20/U-21/quota locks/schema/F3 boundary không đổi.

## Phạm vi API

Năm route yêu cầu ADMIN ACTIVE:

| Method và route | Hành vi |
|---|---|
| `POST /api/vouchers` | Tạo voucher ACTIVE, `usedCount=0`; trả 201 và Location |
| `GET /api/vouchers` | List/filter/page/count tại PostgreSQL |
| `GET /api/vouchers/{id}` | Đọc định nghĩa và window snapshot |
| `PUT /api/vouchers/{id}` | Chỉ thay description và usageLimit; cả hai key phải có |
| `PATCH /api/vouchers/{id}/status` | Chuyển ACTIVE ↔ INACTIVE, không xóa row |

Không có DELETE hoặc public/customer endpoint. CUSTOMER bị 403; thiếu/không hợp lệ/LOCKED token bị 401 theo security chung. Controller dùng `ApiResponse`, trace header/body và `Cache-Control: no-store`; không trả entity JPA.

`VoucherResponse` cho admin gồm các trường định nghĩa schema, `usageLimit`, `perUserLimit`, `usedCount` chỉ đọc, `status`, audit `createdAt`/`updatedAt`, cùng `windowState`/`evaluatedAt`. Không đưa dữ liệu order/customer hoặc cờ nội bộ ra DTO.

## DTO và quy tắc dữ liệu

- Code được `strip()` hai đầu, phải khác rỗng, tối đa 50 code point; giữ nguyên case và so sánh bằng equality chính xác. Không lower/upper, LIKE, thay khoảng trắng giữa, hoặc regex ngoài schema. Ký tự điều khiển trong code và NUL ở text bị từ chối.
- Description nullable; `strip()`, blank thành null, tối đa 300 code point. Create cho phép bỏ description; PUT bắt buộc hai key `description` và `usageLimit`; null lần lượt clear mô tả và bỏ quota.
- Create: discountType chính xác `PERCENT`/`FIXED`; `discountValue` bắt buộc dương; PERCENT không vượt 100; maxDiscount nullable nhưng giữ nguyên giá trị 0; minOrderAmount mặc định 0 và không nullable; usageLimit bỏ/null là unlimited, nếu có phải dương; perUserLimit mặc định 1 và phải dương. Server đặt status ACTIVE và usedCount 0.
- Amount chỉ nhận JSON number, canonical thành số nguyên exact trong miền NUMERIC(14,0); số có phần lẻ khác 0 và overflow bị từ chối trước PostgreSQL. Không ROUND theo scale của cột. Limit chỉ nhận JSON integer trong miền PostgreSQL INT.
- JSON floating-point token được parse thành exact decimal trong application `JsonMapper` trước nested `JsonNode` setters bind. `discountValue`, `maxDiscount`, và `minOrderAmount` dùng token exact đó; không chuyển qua double, round, hoặc nới tolerance. `usageLimit`/`perUserLimit` vẫn phải là integer JSON token; `1.0` và `1e0` tiếp tục bị từ chối.
- startAt/endAt yêu cầu local date-time nghiêm ngặt `yyyy-MM-dd'T'HH:mm:ss[.1-6 chữ số]`, năm 0001–9999, không offset/Z/timezone; End phải sau Start. Cho phép thời hạn hợp lệ trong quá khứ. Persistence là `LocalDateTime`/TIMESTAMP như schema.
- Unknown/duplicate/internal keys, sai kiểu, JSON lỗi, query không cho phép và field thiếu bị từ chối qua error envelope; rejected input không được echo trong message/log.
- No-op PUT/status trả thành công nhưng không đổi `updatedAt` và không ghi committed-change event.

List chỉ nhận `code`, `status`, `discountType`, `window`, `page`, `size`, `sort`. Code exact sau strip; `%`/`_` là ký tự literal. Status/type/window phân biệt hoa thường và phải đúng enum. Page mặc định 0, size mặc định 20, max 100 theo `CustomerProperties`; sort whitelist `id`, `code`, `createdAt`, `updatedAt`, `startAt`, `endAt`, `usedCount`, có ID tie-break. Duplicate, unknown, overflow, multisort và coercion bị từ chối. WHERE, count và page chạy ở DB.

Mỗi operation chụp `Clock` một lần cho `evaluatedAt`; list dùng cùng giá trị ở SQL window predicate và các DTO. UPCOMING nếu `now < startAt`; CURRENT nếu `startAt <= now < endAt`; ENDED nếu `now >= endAt`. Đây là window hiện tại độc lập stored ACTIVE/INACTIVE và không quyết định quyền áp voucher, giá, quota còn lại hoặc giới hạn mỗi người.

## Quyền, khóa và audit

Authority của request xuất phát từ account hiện tại trong DB. Với ghi, thứ tự khóa là global `CustomerStatusLock` advisory → actor customer row → voucher row; service đọc lại actor ACTIVE/ADMIN sau khi advisory lock được cấp. Việc disable account trước đó khiến waiter request trả 401 và không mutation.

Sửa quota khóa voucher trước khi lấy `usedCount`; giá trị hiện tại được materialize dưới row lock sau khi writer trước đó commit. Quota nullable là unlimited. Quota dương nhỏ hơn counter hiện tại trả 409 `VOUCHER_USAGE_LIMIT_CONFLICT`, không thay mô tả hay audit; bằng counter được phép. Không reset/decrement counter. Chỉ description và usageLimit mutable theo U-19; các trường định nghĩa còn lại giữ nguyên.

Status switch dùng `INACTIVE` để ngừng áp dụng nhưng giữ row/references theo U-20. Không có hard delete hoặc expire job. Counter do writer F3 quản lý; P09 admin status/update không sửa `used_count`.

Create flush để unique constraint thật là chốt cuối. Chỉ SQLState `23505` kết hợp constraint `vouchers_code_key` map `VOUCHER_CODE_ALREADY_EXISTS` 409; lỗi integrity khác vẫn là lỗi server chung. Lock timeout `55P03` trả 503. Domain 400/401/403/404/409 không chứa rejected values. Failure diagnostics chỉ gồm trace, category, error code, actor/voucher IDs khi biết, exception type và constraint allowlist; không log throwable, SQL/message hoặc dữ liệu voucher. Success events đăng ký sau commit; rollback/no-op không phát event. DB `created_at`/`updated_at` trigger giữ nguyên audit leader.

## Giao ước Function 3

- F1 cung cấp định nghĩa ổn định để F3 lookup code theo exact case và đọc status, thời hạn, điều kiện đơn, max cap và per-user limit.
- F3 quyết định eligibility, tính tiền/rounding, dùng đơn hàng để xác định per-user count và chốt thời điểm giữ/nhả/ghi nhận lượt dùng. `used_count` là counter thuộc writer F3; P09 không định nghĩa reservation lifecycle hay usage API.
- Writer F3 phải bảo vệ capacity bằng voucher row lock trong transaction phù hợp hoặc atomic conditional update tuân CHECK. Không dùng detached read-modify-save. `VoucherRepository.findByIdForUpdate` là building block nội bộ; P09 không thêm order/usage module hoặc endpoint consume.
- Voucher INACTIVE giữ nguyên row và FK tham chiếu. WindowState admin không đảm bảo đủ quota hoặc user đủ điều kiện. Test JDBC P09 là synthetic counter writer chứng minh locking/counter preservation, không phải full F3 integration.

## Giữ nguyên schema

P09 không đổi entity mapping, migration, schema/reference, version/index/table/status/history, hay dependency. Không áp migration hoặc truy cập database chung. RLS runtime role/ACL, multi-node behavior và price/reservation integration đầy đủ thuộc bước phối hợp sau; P10 không thay đổi ranh giới này.
