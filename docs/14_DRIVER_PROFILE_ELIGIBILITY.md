# 14 — Driver profile và current eligibility

**P01–P09 APPROVED**, P07 R1 CLOSED và Java 21 strip/current query/U-14/U-15 giữ. P10 CHANGES_REQUESTED; P10-FIX-01 READY_FOR_REVIEW, R1/R2 chờ xác nhận. Clock expiry workflow xác nhận stored ACTIVE khác eligibleNow, không autosuspend hoặc đổi role/schema. Driver là profile, GPLX ở user_documents; xem [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md).

## 1. API

Các API dùng JSON envelope hiện có, trace ID và `Cache-Control: no-store`.

| Method / route | Quyền | Hành vi |
|---|---|---|
| `POST /api/drivers` | CUSTOMER hoặc ADMIN ACTIVE | Tạo profile của principal ở `PENDING`; không nhận query hoặc bất kỳ byte body nào; trả 201, `Location`, `DriverResponse`. Profile đã tồn tại trả 409. |
| `GET /api/drivers/me` | CUSTOMER hoặc ADMIN ACTIVE | Trả profile của principal; thiếu profile trả 404. |
| `GET /api/drivers/me/eligibility` | CUSTOMER hoặc ADMIN ACTIVE | Trả evaluation hiện tại; khi chưa có profile trả 200 với `driverId`/`driverStatus` null và reason phù hợp. |
| `GET /api/drivers/{id}` | Owner ACTIVE hoặc ADMIN ACTIVE | Foreign và missing đều trả 404. ID không dương trả 400. |
| `GET /api/drivers/{id}/eligibility` | Owner ACTIVE hoặc ADMIN ACTIVE | Đánh giá current eligibility; foreign và missing đều trả 404. |
| `GET /api/drivers` | ADMIN ACTIVE | DB page/count, filter/sort allowlist; CUSTOMER bị 403. |
| `PATCH /api/drivers/{id}/status` | ADMIN ACTIVE | Strict JSON status command; recheck actor/owner và policy trong transaction. Query string bị từ chối. |

`DriverResponse` chỉ chứa `id`, `customerId`, `status`, `createdAt`, `updatedAt`. `DriverEligibilityResponse` chứa `customerId`, `driverId`, `accountStatus`, `driverStatus`, current `kycStatus`, `hasValidDriverLicense`, `eligibleNow`, `ineligibilityReasonCode`, `evaluatedOn`. Không trả email/phone, số giấy tờ, license class, ảnh, locator, entity hoặc free-text reason.

Admin list chỉ chấp nhận `status`, `customerId`, `page`, `size`, `sort`. Status exact enum; customerId dương; page từ 0; size mặc định 20, tối đa 100 theo config; sort một cặp allowlist `id|createdAt|updatedAt|status,asc|desc`, có tie-break ID. Duplicate, multi-sort, unknown hoặc sai kiểu/tham số trả 400 trước query. Filter/count chạy tại PostgreSQL, không tải toàn bộ bảng để lọc trong Java.

## 2. Create, status transitions và U-15

Create lấy customer ID/role từ principal, giữ advisory lock chung, khóa và đọc lại customer ACTIVE/role, kiểm tra profile trong scope rồi insert `PENDING`. Precheck dễ đọc; UNIQUE `drivers_customer_id_key` là authority cuối. Chỉ SQLState `23505` cùng đúng constraint này được map thành `409 DRIVER_PROFILE_ALREADY_EXISTS`; lỗi integrity khác không bị biến thành conflict nghiệp vụ.

Command body chỉ nhận `status` và `reason`. Parser từ chối trường lạ, trùng key, null/missing/wrong type/coercion, enum sai hoặc `PENDING`. Transition:

| Stored status | Command | Kết quả |
|---|---|---|
| `PENDING` | `ACTIVE` | Kiểm tra U-14 rồi kích hoạt; nếu chưa đủ trả 409 `DRIVER_NOT_ELIGIBLE`. |
| `PENDING` | `SUSPENDED` | 409 `INVALID_DRIVER_STATUS_TRANSITION`. |
| `ACTIVE` | `SUSPENDED` | Được phép kể cả owner LOCKED hoặc GPLX hết hạn; không mở khóa account. `reason` bắt buộc, trim/nonblank, tối đa theo config (mặc định 500). |
| `ACTIVE` | `ACTIVE` | No-op chỉ sau khi kiểm tra lại U-14; thiếu điều kiện trả 409. Không đổi audit hoặc phát success event. |
| `SUSPENDED` | `ACTIVE` | Kiểm tra U-14 rồi kích hoạt; nếu thiếu điều kiện trả 409. |
| `SUSPENDED` | `SUSPENDED` | 200 no-op, không đổi audit hoặc phát success event. |

U-15 cấm ADMIN đổi trạng thái driver của chính mình, gồm cả no-op; lỗi là 403 `DRIVER_SELF_STATUS_CHANGE_FORBIDDEN`. Cấm này được áp dụng sau khi đọc lại actor/owner đã khóa. ADMIN khác mới được xử lý hồ sơ đó.

Reason cho `SUSPENDED` chỉ validate rồi bỏ; không lưu hoặc log vì leader schema không có cột. Do đó chưa có durable status reason/history; Q-09 còn mở. Success event chạy sau commit. Safe failure events chỉ ghi trace, category/code, actor/owner/driver ID và allowlisted constraint/exception type; không ghi reason, SQL message, throwable chain, token, key hoặc PII.

## 3. Current eligibility và U-14

U-14 yêu cầu đồng thời:

1. Account hiện tại `ACTIVE`.
2. Current identity KYC `VERIFIED`, tính lại bằng `KycPolicy` trên giấy tờ identity theo Clock; snapshot `customers.kyc_status` không đủ làm nguồn duy nhất.
3. Có ít nhất một GPLX thuộc đúng customer, `doc_type=DRIVER_LICENSE`, `verify_status=APPROVED`, `expires_at` non-null và `expires_at >= today`, `license_class` không blank.

Nonblank dùng semantics `value != null && !value.strip().isEmpty()` của P05/P06. Projection bind danh sách code point do Java 21 `Character.isWhitespace(int)` tạo làm ký tự trim cho PostgreSQL `btrim(text, characters)` trong cùng aggregate statement. Điều này khớp `String.strip()` với TAB/EM SPACE và mọi code point Java-whitespace; NBSP, FIGURE SPACE và NARROW NBSP không bị trim vì Java `strip()` cũng không trim chúng. GPLX legacy/import APPROVED có class chỉ từ Java whitespace phải false khi evaluate; một GPLX hợp lệ khác vẫn đủ. Không thêm schema/backfill/luật hạng GPLX hoặc locale-based normalization.

Activation prerequisites không cần profile đã `ACTIVE`; nếu không thì không thể activate profile đang `PENDING`. Current eligibility còn yêu cầu profile tồn tại và stored status `ACTIVE`. Reason precedence là `ACCOUNT_NOT_ACTIVE` → `DRIVER_PROFILE_MISSING` → `DRIVER_NOT_ACTIVE` → `IDENTITY_NOT_VERIFIED` → `VALID_DRIVER_LICENSE_REQUIRED`; eligible trả reason null.

`today` lấy một lần mỗi evaluation/command từ injected `Clock` (`Asia/Ho_Chi_Minh` mặc định). Ngày hết hạn hôm nay còn hợp lệ. Một GPLX hợp lệ trong nhiều bản đủ điều kiện; expired/pending/rejected/loại khác/owner khác/hạn null/hạng trống không che bản hợp lệ khác. Không thêm tuổi, luật/hạng GPLX hoặc match tên ngoài policy xác nhận.

CustomerRepository dùng **một SQL statement aggregate/projection** để đọc account, profile, các cờ tổng hợp identity và cờ GPLX hợp lệ trong cùng snapshot. Không hydrate mọi `UserDocument`, tạo duplicate join rows hoặc chạm file storage. `DriverEligibilityService.evaluateForCustomer(customerId)` và overload ngày nội bộ nêu rõ customerId, trả DTO snapshot; không có endpoint customer tùy chọn ID.

Read-only eligibility không sửa snapshot KYC, audit hoặc stored driver status. Vì vậy account LOCKED hoặc giấy tờ hết hạn có thể làm `eligibleNow=false` dù stored status vẫn `ACTIVE`; hệ thống không auto-suspend. Evaluation là snapshot thời điểm đó, không phải reservation/quyền gán xe.

## 4. Locks và giao tiếp liên function

Write dùng cùng `CustomerStatusLock` advisory protocol với P04/P06 trước row lock; thứ tự status command là global advisory → actor customer → owner customer → driver. Owner được tìm bằng scalar query trước khi khóa; status, role, ownership và account state được recheck dưới lock. Activation đọc current evidence sau owner lock trong transaction, để thấy các P05/P06 writes đã commit và cùng serialize với chúng. Create dùng global advisory → owner lock.

Global advisory lock đơn giản hóa serialization với account/document writers hiện có nhưng giới hạn throughput giữa các write operation dùng chung namespace; không có benchmark production hay multi-node claim ngoài PostgreSQL locking evidence trong report. Không sửa protocol hoặc tăng timeout chỉ để qua test.

F2 có thể gọi internal `DriverEligibilityService.evaluateForCustomer(customerId)` để nhận current snapshot. F2 phải recheck tại action/transaction phù hợp, tự bảo vệ schedule/capacity/assignment, và không xem DTO này là quyền reservation bền vững. P07 không ghi bảng xe/slot/gán driver, không tạo HTTP arbitrary-customer endpoint, cache theo JWT, expiry job, renewal/revoke hoặc audit table.

## 5. Errors và verification

P07 errors gồm 400 `INVALID_REQUEST`/`VALIDATION_ERROR`, 401 token/account không hợp lệ, 403 `ACCESS_DENIED`/`DRIVER_SELF_STATUS_CHANGE_FORBIDDEN`, 404 `RESOURCE_NOT_FOUND`, 409 `DRIVER_PROFILE_ALREADY_EXISTS`/`INVALID_DRIVER_STATUS_TRANSITION`/`DRIVER_NOT_ELIGIBLE`, 503 dependency/lock timeout và 500 lỗi ngoài dự kiến. Envelope/trace dùng nền tảng P01–P06; response không echo input nhạy cảm.

Test evidence, command thực tế, PostgreSQL PID/blocker, packaging, health, file inventory và limitations được ghi trong [P07 report](reports/P07_REPORT.md). Schema, migration và `docs/reference/` không được sửa.
