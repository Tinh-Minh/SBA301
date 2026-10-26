# PROMPT P09 — Quản trị voucher và hợp đồng với Function 3

Bạn là Agent code tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. **P01–P08 APPROVED** theo [review P08](../reviews/P08_REVIEW.md). Triển khai đủ **9 bước P09**, tạo báo cáo thực tế và dừng tại READY_FOR_REVIEW. **P10 chưa làm; không commit/push hoặc dùng DB chung.**

## 1. Bước 1 — Đọc và bảo toàn scope/schema

Đọc AGENTS.md, status, scope F1, conventions, API, database review, decisions, roadmap/local guide và review mới nhất. Đọc `Voucher`, `VoucherRepository`, `VoucherStatus`, `DiscountType`, `AuditedEntity`, current-account/security, strict DTO/page parsing, shared advisory lock, error handlers và after-commit logger patterns hiện có.

Xác nhận BE/HEAD/working tree. HEAD=origin/BE đã xác minh `2fe712eed12a2af3b61f0a5311bdd3901f614029`; project đang untracked từ trước. Giữ mọi code/docs/history; diff trống không thay file inventory. Không đổi branch, stage/stash/reset/clean/commit/push.

Phạm vi: ADMIN tạo, đọc/list, sửa description/quota và bật/tắt **vouchers**. F3 phụ trách tính giảm, điều kiện đơn, per-user usage, reserve/release và gắn voucher vào rental_orders. Không viết pricing/order/payment/usage-reservation module hoặc public/customer voucher endpoint. Không sửa entity mapping/schema/migration/reference, thêm version/index/status/history/table hoặc dependency để đổi mô hình leader.

### Schema leader

| Nhóm | Theo nguồn |
|---|---|
| Text | code VARCHAR(50) NOT NULL UNIQUE, description VARCHAR(300) nullable |
| Discount | type PERCENT/FIXED; value NUMERIC(14,0)>0; PERCENT≤100; max_discount nullable≥0; min_order_amount≥0 default0 |
| Time | start_at/end_at TIMESTAMP, end_at>start_at; không chuyển sang timestamptz |
| Quota | usage_limit nullable/>0; per_user_limit INT>0 default1; used_count INT≥0 default0; used_count≤usage_limit khi quota không null |
| State/audit | ACTIVE/INACTIVE, defaultACTIVE; created_at/updated_at theo vn_now/trigger hiện có |

Read reference không có nghĩa được chạy source SQL lên database chung.

## 2. Bước 2 — Khóa quyết định người dùng và phân loại baseline

| Mã | Người dùng chọn ngày 2026-10-14 |
|---|---|
| U-19 | Sau create chỉ sửa **description và usageLimit**; code, mức giảm, điều kiện và thời hạn bất biến |
| U-20 | Ngừng voucher bằng **INACTIVE**, giữ bản ghi bảo toàn tham chiếu đơn; không hard-delete endpoint |
| U-21 | Code giữ nguyên case và so khớp chính xác theo schema; chỉ `strip()` hai đầu |

Baseline kỹ thuật của prompt, không gọi là policy mới do user xác nhận:

- Create luôn ACTIVE/usedCount0. Client không đặt status/usedCount/audit/id/actor; status command riêng.
- description optional/nullable, strip; blank→null. usageLimit omitted/null→unlimited; minOrderAmount omitted→0, perUserLimit omitted→1; explicit null cho hai fields non-null này400.
- PUT nhận **đủ hai keys description/usageLimit**, null có nghĩa clear/unlimited. Không biến PUT thành partial PATCH để ambiguity giữa omitted/null.
- Không thêm yêu cầu start/end ở tương lai: valid lịch quá khứ vẫn được lưu để quản trị/lịch sử, chỉ enforce end>start. Stored ACTIVE khác còn trong cửa sổ hiệu lực.
- Read window dùng start inclusive/end exclusive: UPCOMING nếu now<start, CURRENT nếu start≤now<end, ENDED nếu now≥end. Đây là nhãn read theo Clock, không kết luận người thuê đủ điều kiện hoặc trạng thái DB mới.
- Không đòi maxDiscount cho PERCENT, không đổi maxDiscount0 thành null, không bỏ cap theo FIXED hoặc đặt thêm quan hệ value/max/min ngoài CHECK. F3 quyết định cách tính; F1 quản lý định nghĩa đúng schema.
- Code không lowercase/uppercase/collapse space/ép regex danh sách ký tự ngoài yêu cầu. Case-distinct codes được xử lý theo equality/UNIQUE DB; document yêu cầu mọi writer/FE/F3 giữ semantics U-21.

Không áp policy driver/KYC/bank-owner lên vouchers; đây là tài nguyên chung do ADMIN quản trị, không có customer_id/owner field.

## 3. Bước 3 — DTO strict, số và thời gian chính xác

Tạo `VoucherService`/`VoucherServiceImpl`, `VoucherController`, mapper, request/response DTO riêng. Reuse envelope/trace/no-store/security/page helpers; không trả entity hoặc dùng builder trong service. Validation không echo rejected input trong errors/logs.

### CreateVoucherRequest

Allowlist: code, description, discountType, discountValue, maxDiscount, minOrderAmount, startAt, endAt, usageLimit, perUserLimit.

- Bắt buộc code/type/value/start/end. String đúng kiểu, code strip/nonblank/max50 code point, description max300 sau strip; code từ chối control characters, mọi text từ chối NUL không lưu được vào PostgreSQL. Không đổi case U-21.
- discountType exact String PERCENT/FIXED; không ordinal/case coercion. Numeric fields chỉ JSON number, không string/boolean/array/object hoặc NaN/Infinity tokens.
- Dùng **BigDecimal**, validate integral numeric value và precision NUMERIC(14,0) trước persist. Giá trị có phần lẻ khác0 như12.5 phải400, không ROUND rồi persist; 1.0 có thể canonical về integer bằng thao tác exact. DiscountValue>0, PERCENT≤100; max/min≥0 và đúng nullable/default semantics. Kiểm tra upper bound theo precision, không double/float/int cast overflow.
- usageLimit/perUserLimit chỉ integral JSON integer trong range PostgreSQL INT, >0 khi có; không nhận1.5/1.0/string. Create usedCount luôn0 và không bind từ client.
- startAt/endAt là String ISO local date-time gồm date, T, giờ/phút/giây, optional fraction tối đa6 chữ số; dùng calendar parsing strict, năm0001–9999, không offset/Z/timezone strings. Lưu LocalDateTime theo thời gian Việt Nam của schema; không auto-convert UTC hoặc silently round nano precision. End>start sau parse; invalid date/leap day/fraction overflow400 trước DB.
- Unknown/duplicate/internal/presence/getter-helper/status/usedCount/id/customerId/audit keys400. Không tạo JavaBean helpers làm trạng thái parser bind được. Query string trên create400.

PostgreSQL NUMERIC scale0 có thể round input trước lưu, nên service không được dựa vào DB để từ chối phần lẻ. [PostgreSQL15 — numeric](https://www.postgresql.org/docs/15/datatype-numeric.html). TIMESTAMP là không timezone và precision tối đa microseconds theo baseline transport. [PostgreSQL15 — datetime](https://www.postgresql.org/docs/15/datatype-datetime.html).

### UpdateVoucherAdminRequest / ChangeVoucherStatusRequest

- PUT: chỉ description và usageLimit, **cả hai phải có key**; null được phép đúng nghĩa trên. Validate string/INT/limits trước write; unknown/duplicate/missing/helpers400.
- Status PATCH: chỉ status, exact ACTIVE/INACTIVE, required non-null String; mọi field khác400. Không reason/history/audit fields chưa có trong schema.
- Query trên PUT/status400; strict enums/type và error envelope theo nền tảng. No-op khi giá trị thực không đổi: giữ updatedAt, không mutation event.

### Response

`VoucherResponse` là DTO gồm fields định nghĩa, usageLimit/perUserLimit/usedCount read-only, status, createdAt/updatedAt và windowState/evaluatedAt theo Clock chung cho admin UI. WindowState chỉ là UPCOMING/CURRENT/ENDED theo khoảng thời gian, không là eligibility/per-user quota hay authorization áp voucher. Không trả entity/internal flags hoặc thông tin đơn/customer ngoài scope.

## 4. Bước 4 — Năm API ADMIN và list filters tại DB

| Endpoint | Kết quả |
|---|---|
| POST `/api/vouchers` | ADMIN ACTIVE; 201 + Location + DTO, ACTIVE/usedCount0 |
| GET `/api/vouchers` | ADMIN ACTIVE; strict filters/page/count/sort tại DB |
| GET `/api/vouchers/{id}` | ADMIN ACTIVE; 200 DTO, positive ID, missing404 |
| PUT `/api/vouchers/{id}` | ADMIN ACTIVE; full two-field update description/usageLimit, 200 DTO |
| PATCH `/api/vouchers/{id}/status` | ADMIN ACTIVE; ACTIVE↔INACTIVE, 200 DTO/no-op |

Mọi endpoint CUSTOMER403, no token/invalid/LOCKED401; authority lấy DB hiện tại, không trust JWT role claim. Cùng controller theo resource, service method authority guards; không public listing/redeem/validate/quote endpoint hoặc DELETE.

List allowlist: **code, status, discountType, window, page, size, sort**. Code filter là exact U-21 sau strip, không LIKE/wildcard/contains; blank code400. Status/type exact enum; window UPCOMING/CURRENT/ENDED. Page0/size20/max100 theo properties hiện có hoặc config tương ứng, overflow/negative/duplicate/coercion/multi-sort/unknown400. Sort allowlist id/code/createdAt/updatedAt/startAt/endAt/usedCount với ID tie-break.

WHERE filters và count phải ở PostgreSQL trước pagination, không tải all/filter Java. Capture `LocalDateTime.now(applicationClock)` một lần cho cả window predicates/DTO trong operation; window tách stored status, ACTIVE expired vẫn list được. Query dates/type/status không nối chuỗi raw SQL. Code `%`/`_` nếu hợp lệ theo text input là literal exact filter, không wildcard.

GET detail chỉ path ID, query lạ400; create/PUT/status rejects query. Responses no-store/trace/CORS hiện có; wrong ID/type/media/method dùng error mapper chung. Tránh matcher admin route vô tình mở voucher endpoints cho CUSTOMER.

## 5. Bước 5 — Transactions, locks, quota và immutable definition

Create/update/status `@Transactional`. Lock protocol **shared global advisory → actor customer row → target voucher row**. Recheck actor ACTIVE+ADMIN sau chờ, không dùng token/current-account snapshot để quyết mutation. Giữ lock_timeout/classification của P04; không new in-memory mutex hoặc schema @Version.

- Create: actor recheck, code precheck exact để readability; insert/flush để UNIQUE thật quyết race. Không normalize upper để tránh code conflict giả; U-21 giữ case. SQLState23505+actual `vouchers_code_key` mới map code409.
- Update: acquire voucher row pessimistic-write **trước đọc usedCount để kiểm tra quota**. Không preload managed Voucher rồi coi SELECT lock luôn refresh cache; lấy fresh state dưới lock. Không query F3 order/reservation để chốt quota nghĩa khác.
- UsageLimit null unlimited; positive quota mới không nhỏ hơn **usedCount hiện tại dưới lock**; bằng usedCount được phép nhưng không còn total capacity. Nếu thấp hơn trả409 VOUCHER_USAGE_LIMIT_CONFLICT, không sửa description/audit. Không reset/decrement usedCount hoặc chuyển status để né CHECK.
- Update chỉ gán hai allowed fields; code/type/value/max/min/start/end/perUserLimit/usedCount/status/createdAt giữ nguyên. Entity SQL có thể viết nhiều columns khi flush, vì vậy phải giữ state mới nhất dưới lock và không overwrite F3 counter từ stale entity.
- Status dùng switch ACTIVE↔INACTIVE; cùng state200 no-op không audit/event. Không reset quota/counter/date, không expire job; có thể ACTIVE dù window ended vì stored status và window khác nhau.
- Flush transaction, map audit đã được DB generated/trigger phản ánh đúng. CreatedAt giữ; UpdatedAt đổi chỉ khi mutation; fault/constraint rollback không để partial changes.

Global lock giữ actor-status serialization với P04, voucher row lock giữ quota/counter serialization với F3 writer dùng protocol đúng. Không yêu cầu F3 lấy global admin lock để consume voucher. F3 phải thống nhất resource-lock order khi ghép orders; P09 không thiết kế lại transactions F3. [PostgreSQL15 — explicit locks](https://www.postgresql.org/docs/15/explicit-locking.html).

## 6. Bước 6 — Error codes và safe positive diagnostics

Tối thiểu bổ sung `VOUCHER_CODE_ALREADY_EXISTS`409, `VOUCHER_USAGE_LIMIT_CONFLICT`409. Reuse400 validation/request,401 invalid token,403 access denied,404 not found,503 dependency/lock timeout và500 unexpected. Không echo code/description/numeric/date input trong errors.

- Exact SQLState23505+vouchers_code_key → code409; preserve cause, safe caught-conflict diagnostic với allowlisted constraint. Precheck domain409 không cần raw Throwable. Unknown integrity không bị map duplicate; không dựa vào SQL message substring.
- Quota thấp hơn current count là domain409 dưới lock. DB CHECK violations ngoài expected path không bị giả code duplicate/quota; validate trước persist và giữ generic fallback. 55P03 thật503, không catch rộng đổi DB errors thành400.
- Unexpected/resource/lock failures có safe diagnostic dương: action/category/errorCode/trace/actorId/voucherId khi biết/exceptionType và constraint allowlist. Không raw SQL/message/cause/suppressed/Throwable, code/description/token/account data; Hibernate JDBC errors/SQL show tiếp tục disabled.
- Success create/update/status logs chỉ **after commit**, IDs/action/old/new status khi phù hợp, không description/code/amounts từ request. No-op/rollback không committed-change event. Không durable audit table/history hoặc finally rỗng.
- Handler trace body/header khớp; preserve primary/cause và transaction rollback, không query tiếp trong transaction aborted.

## 7. Bước 7 — Hợp đồng F3, không triển khai tiêu hao voucher

Viết rõ integration boundary:

- F1 quản trị definition; U-19/U-20/U-21 giữ stable fields/code/reference. F3 lookup code exact case, đọc status/start/end/min amount/max cap/perUserLimit và tự quyết eligibility/price/rounding theo đơn.
- used_count là counter do F3 quản lý. P09 không định nghĩa pending order có tiêu hao hay reserve/release diễn ra lúc nào; phần đó còn Q-06 và do chủ F3 chốt. ADMIN DTO không sửa counter.
- F3 dùng voucher row lock trong transaction phù hợp hoặc atomic conditional update có CHECK để bảo vệ capacity; không read-modify-save detached entity hoặc query count rồi ghi. P09 admin quota/status dùng cùng row resource và kiểm tra current state dưới lock.
- `VoucherRepository.findByIdForUpdate` hiện có là building block nội bộ cho transactions F3; nếu cần definition DTO lookup, tạo trusted immutable snapshot/service interface nhỏ và không mở public endpoint. Không viết `VoucherUsageService`, increment/decrement API, order repository/entity/module để hoàn thành prompt này.
- perUserLimit không thể được F1 xác nhận từ used_count toàn cục; F3 cần dữ liệu đơn/user đúng transaction. WindowState trong admin DTO không bảo đảm voucher áp được hoặc còn quota cho một user.
- INACTIVE giữ tham chiếu voucher_id trên orders; không null/delete các references. Lookup/read snapshot không reservation; F3 recheck ở action/commit phù hợp, giữ FK và snapshot giá của đơn theo thiết kế F3.

Regression có writer JDBC tổng hợp thay F3 để kiểm tra row locks/counter preservation, không gọi đó là full F3 pricing/order/reservation đã triển khai.

## 8. Bước 8 — PostgreSQL/HTTP/concurrency và full verify

Dùng PostgreSQL15.13 Testcontainers, app HTTP/JWT/JPA thật, keys/admin/customer/codes tổng hợp, fixed Clock và resource cleanup. Giữ schema migration; tests không thêm production data/index/migration hoặc gọi DB chung.

### Contract, schema và privacy

- Create default/null semantics, all schema fields/audit, ACTIVE/usedCount0, PERCENT/FIXED, maxDiscount0/null, precision14 và integer bounds. Fraction12.5/overflow/negative/invalidenum/type/unknown/duplicate/internal/usedCount/audit/status inputs400, không row mutation.
- Strict date-time format/calendars/end>start/precision; valid past window vẫn create; end boundary tests before/start/inside/exact-end/after, storedACTIVE không tự đổi. No timezone conversion hoặc silently rounded microseconds.
- U-21: strip nhưng case giữ, exact code lookup/filter và `%`/`_` literal; case-distinct codes theo schema, exact duplicate409. Actual23505/constraint diagnostic dương/privacy; unrelated integrity không bị code409. Không mock database exception để thay evidence unique.
- ADMIN only, token/LOCKED/revoked role từ DB, CUSTOMER403 toàn bộ verbs; IDs/query/filters/page/count/sort allowlist. Tất cả keys PUT phải present; null meanings/immutable field rejection; status switch/no-op; DELETE unsupported.
- PUT quota dưới/equal/above usedCount/null; below409 không sửa description/audit, equal hợp lệ. Counter/immutable/status/createdAt giữ; update audit đúng. Rollback fault sau flush và after-commit event assertions, no success event khi fail/no-op. Error/log capture render cả Throwable proxy và sentinels trong code/description/raw cause.

### Hai transactions thật, không stale-counter overwrite

1. Voucher có quota5/count2. JDBC writer tổng hợp F3 giữ actual row lock, UPDATE count4 chưa commit. Launch ADMIN HTTP PUT quota3/description mới, observer xác nhận holderPID block waiterPID bằng `pg_blocking_pids`; request chưa complete trước release. Holder commit → PUT409, count vẫn4, quota5 và description gốc giữ, không overwrite count2. Audit của writer commit giữ, không thêm admin mutation/event.
2. Sau đó PUT quota4/description mới200, count4 vẫn giữ; nullable unlimited path cũng đạt. Thêm status change chờ row writer để kiểm chứng status không reset/overwrite latest counter; no-op vẫn không audit/event.
3. Hai ADMIN updates/status commands cùng voucher có actual locking/commit order và đúng final fields. Có thể dùng case ở trên phối hợp để giữ test gọn, nhưng cần chứng minh waited read thấy current DB state.
4. P04 khóa ADMIN trước waiter voucher write đọc lại actor dưới global lock: old JWT request401/no mutation. Reuse bounded P08 observer/gates, không fake auth/repository result.
5. Advisory/row timeout thật55P03→503/trace/rollback, release→retry200. Counter/schema constraints vẫn giữ. finally release/close executors/connections/hooks dù assert fail; không infinite polling/sleep may rủi hoặc barrier deadlock.

P09 chỉ kiểm chứng concurrent counter writer đúng schema, không mô phỏng reserve/release hay sửa F3 tables. Tests gọi production service/repository qua actual HTTP; test-only fault/timing hooks phải call real SQL/flush/commit, không mock row/projection hoặc giảm assertions cũ.

Sau targeted chạy full:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

Xác định JDK21 thật, logs đặt TEMP ngoài target. Toàn bộ **137 tests hiện có** và P09 tests phải chạy,0 failures/errors/skips. Packaging/local/key/private-data markers/test helpers absent; actual Boot JAR/CWD regression giữ. HTTP health trong PostgreSQL context200/UP/trace thật. Ghi đúng count/log/lệnh/reruns, không gọi targeted/probe là full verify.

## 9. Bước 9 — Docs/report và dừng

Tạo `docs/16_ADMIN_VOUCHERS.md` sau implementation:5 endpoints/DTOs, U-19/U-20/U-21, numeric/time/null/case semantics, stored status/window, lock/audit/error/log contract và F3 counter/price/per-user boundary. Update current API/architecture/plan/decisions/status/index/AGENTS/roadmap/local guide; giữ historical reports/reviews/prompts/reference. Không đổi tài liệu cũ để biến proposal thành evidence đã chạy.

Chỉ sau làm tạo **`docs/reports/P09_REPORT.md`**, gồm:

- Đủ9 bước/file inventory/schema map, scope admin definition và immutable fields/counter preserved.
- Policy U-19/U-20/U-21, strict numeric/date DTO/list/rights/no-op/audit và actual constraints/privacy evidence.
- Holder/waiter PIDs/blocking/commit timeline, count2→4 rồi admin quota3 bị409, compatible quota/status không overwrite; P04 actor recheck/55P03/retry/rollback.
- Targeted/full test counts/failures/errors/skips, logs/lệnh/env errors/reruns, packaging/Boot/CWD/helper checks và health response/header trace.
- Hash schema/reference/entity/migration trước/sau, Git branch/HEAD/untracked/staged; không shared DB hoặc commit/push. Limitations production/F3 full usage/ACL/multi-node/benchmark đúng thực tế.

Đủ evidence đặt **P09 READY_FOR_REVIEW; P10 NOT_STARTED**, gửi report và dừng. Agent không tự APPROVED, không triển khai P10 hoặc Function3.
