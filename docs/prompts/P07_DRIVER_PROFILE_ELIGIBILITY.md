# PROMPT P07 — Hồ sơ tài xế và điều kiện sử dụng hiện tại

Bạn là Agent code triển khai **P07** tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. P01–P06 đã APPROVED theo docs/reviews. Thực hiện **9 bước**, báo `READY_FOR_REVIEW` rồi dừng; chưa làm P08.

## 0. Phạm vi và policy đã xác nhận

Triển khai `drivers`, đọc `customers`/`user_documents` để xét điều kiện. Driver theo leader chỉ có id, customer_id UNIQUE, status PENDING/ACTIVE/SUSPENDED, createdAt/updatedAt. GPLX nằm ở user_documents; không thêm license, role, statusReason hoặc verifiedBy vào driver entity/table. Giữ schema/entities/migration/reference.

Không làm xe/slot/gán tài xế F2, đơn/thanh toán, bank/voucher, renewal/revoke, expiry job hoặc audit table.

User xác nhận ngày **2026-10-14**:

- **U-14:** kích hoạt cần account ACTIVE, **KYC hiện tại VERIFIED** và GPLX `DRIVER_LICENSE` APPROVED còn hạn.
- **U-15:** ADMIN không được tự kích hoạt/đình chỉ hồ sơ tài xế của mình; ADMIN khác xử lý. Đây là quyết định mới, không suy từ self-review P06.

Giữ U-11/U-12/U-13: identity chỉ CCCD/PASSPORT; GPLX xét riêng; prerequisites ảnh/metadata khi approve thuộc P06. KYC current phải tính theo Clock/aggregate, không dùng riêng customer snapshot. Stored driver ACTIVE không đảm bảo đủ điều kiện sau ngày giấy tờ hết hạn hoặc account bị khóa.

Các baseline còn lại là đề xuất, ghi rõ trong docs/report:

| Chủ đề | Baseline |
|---|---|
| Tạo profile | CUSTOMER/ADMIN ACTIVE đăng ký cho mình, mặc định PENDING; chưa cần đủ giấy tờ tại create |
| Transition | PENDING → ACTIVE, ACTIVE → SUSPENDED, SUSPENDED → ACTIVE; không reset PENDING, không PENDING → SUSPENDED |
| No-op | ACTIVE → ACTIVE phải kiểm tra prerequisites lại; đủ thì 200 không audit/log, thiếu thì 409. SUSPENDED → SUSPENDED trả 200 không audit/log |
| Reason | SUSPENDED cần trim/nonblank ≤500; ACTIVE chỉ omitted/null. Không persist/log text vì schema không có cột |
| Owner LOCKED | Không activate/reactivate; ADMIN khác vẫn suspend profile ACTIVE của owner LOCKED được, không unlock account |
| Hạn GPLX | NONNULL và `expiresAt >= today`, inclusive ngày theo Clock như P06 |
| Hết điều kiện khi đọc | Current eligibility false/reason code; không tự sửa ACTIVE thành SUSPENDED |

Không thêm tuổi, regex/hạng bằng, TTL hoặc quy tắc pháp lý ngoài nguồn/policy đã chốt.

## 1. Bước 1 — Đọc và bảo toàn

Đọc AGENTS, IMPLEMENTATION_STATUS, docs/01/03/04/05/07/13, review P06-FIX-01, leader SQL, Driver/Customer/UserDocument repositories, KycPolicy/KycService, CustomerStatusLock và strict DTO/logger patterns. Kiểm tra BE/HEAD/status; HEAD đã biết `2fe712eed12a2af3b61f0a5311bdd3901f614029`. Project untracked; diff trống không chứng minh workspace sạch.

Không stage/commit/push/đổi nhánh/reset/clean/stash/DB chung; giữ mọi file sẵn có và lịch sử reports/reviews/prompts.

Đầu ra: DriverController theo tài nguyên, DriverService/Impl, DriverEligibilityService/Impl hoặc facade có interface, DTO/projection/mapping, pagination, locks/logs, tests và docs/report. Không tạo Customer/Document service thứ hai hoặc copy KYC policy vào controller/enum.

## 2. Bước 2 — API create/read/list

| API | Quyền/contract |
|---|---|
| `POST /api/drivers` | Account ACTIVE, PENDING cho principal; 201 + Location + DriverResponse; đã có profile 409 |
| `GET /api/drivers/me` | Account ACTIVE, own profile; chưa có 404 |
| `GET /api/drivers/{id}` | Owner ACTIVE hoặc ADMIN ACTIVE; foreign/missing đều 404 |
| `GET /api/drivers` | ADMIN ACTIVE; page/filter/sort/count trong database |
| `PATCH /api/drivers/{id}/status` | ADMIN ACTIVE, transaction-time recheck, U-15; strict DTO bước 3 |
| `GET /api/drivers/me/eligibility` | Account ACTIVE; own current result, chưa có profile vẫn 200/false/missing reason |
| `GET /api/drivers/{id}/eligibility` | Owner ACTIVE hoặc ADMIN ACTIVE; foreign/missing đều 404 |

Create không có business body/query. Reject **mọi byte body**, kể cả `{}`, whitespace, JSON/form/multipart/chunked, bằng kiểm tra bounded; không chỉ nhìn Content-Length/header hoặc allocate không giới hạn. Body rỗng được nhận, server chọn owner/default state/audit. Không nhận customerId/status/role/ảnh/license/KYC.

Literal me/eligibility phải route rõ với numeric id; nonpositive id 400. DriverResponse/summary chỉ `id, customerId, status, createdAt, updatedAt`; không association/entity/profile/email/phone/docNumber/licenseClass/image/locator/reason. Stored status khác current eligibility. No-store/trace như P01–P06; không JWT query/public URL.

Admin list query allowlist `status, customerId, page, size, sort`: customerId positive, status exact enum, page≥0, size default 20/max 100 qua config validated. Sort id/createdAt/updatedAt/status, asc/desc, thêm id tie-breaker. Unknown/duplicate/multi-sort/invalid/oversize 400 trước query; count/filter cùng DB predicate. Không filter eligibleNow/PII hoặc load mọi rows rồi Java filter. CUSTOMER list 403; detail scoped query tránh tiết lộ record của người khác.

## 3. Bước 3 — Strict status command và transition

JSON chỉ hai keys:

```json
{"status":"ACTIVE"}
```

```json
{"status":"SUSPENDED","reason":"Tạm đình chỉ theo yêu cầu quản trị"}
```

ChangeDriverStatusRequest nhận exact string ACTIVE/SUSPENDED; PENDING/missing/null/unknown/wrong type/coercion 400. Unknown/duplicate/helper/presence/owner/license/audit keys 400; giữ parser-state accessors non-JavaBean như P04/P06. Id positive, query string command bị reject.

SUSPENDED reason trim/nonblank≤500; ACTIVE chỉ omitted/null, text kể cả blank bị reject. Không persist/log text hoặc thêm audit field giả.

U-15: actor customerId bằng ownerId trả 403 `DRIVER_SELF_STATUS_CHANGE_FORBIDDEN`, kể cả no-op, trước mutation. CUSTOMER 403, token/actor LOCKED 401. Thành công 200 DriverResponse/no-store/trace.

Service dùng `switch` stored state:

- PENDING: ACTIVE khi đủ U-14; SUSPENDED 409 `INVALID_DRIVER_STATUS_TRANSITION`.
- ACTIVE: SUSPENDED được dù owner LOCKED/license expired, không unlock owner. ACTIVE no-op cần prerequisites hiện tại; thiếu 409 `DRIVER_NOT_ELIGIBLE`, stored ACTIVE giữ.
- SUSPENDED: ACTIVE recheck U-14; SUSPENDED no-op 200 không audit/success event. Không reset PENDING.

Messages/reason codes an toàn, không serialize raw eligibility input/license/SQL/cause.

## 4. Bước 4 — Transaction/locks/unique authority

Mọi write qua service interface/proxy `@Transactional`. **Reuse shared CustomerStatusLock advisory protocol trước row locks**, serialize driver commands cùng P04 status/P06 review. Không row→advisory ngược thứ tự. Ghi throughput tradeoff; không refactor P04/P06 hoặc thêm namespace/schema.

Create: advisory→lock principal customer→recheck ACTIVE/role→scoped exists→persist driver PENDING/flush. Không sửa customer/KYC/documents/audit của owner. Concurrent create tối đa một profile; PostgreSQL UNIQUE customer_id là authority. Xác nhận exact constraint name từ unchanged migration/test DB (thường drivers_customer_id_key, phải kiểm chứng). Chỉ exact23505+constraint translate 409 `DRIVER_PROFILE_ALREADY_EXISTS`, safe diagnostic/cause/rollback; không query trong aborted transaction hoặc sửa index.

Status: pure validation→advisory→lock/read actor DB ACTIVE/ADMIN→scalar owner discovery không hydrate unlocked driver→lock/read owner→lock/read driver→ownership/state recheck→U-15/switch/prerequisites→mutate/flush→map/register afterCommit. Actor LOCKED 401/role đổi 403; không trust principal/entity cache đã đọc trước wait. Clock date chốt một lần trong command; account/file metadata giữ.

Activation đọc identity/license **sau owner lock trong cùng transaction**. P06 review cũng advisory/owner; P05 submission owner lock. Projection phải thấy commit trước nó, không stale cache. Reuse KycPolicy, không external IO/đọc ảnh hoặc bypass approval P06.

DB timeout/availability 503 trace/rollback theo handler hiện có; narrow55P03 giữ. Không sửa production timeout để test qua.

## 5. Bước 5 — Current eligibility và hợp đồng F2

Một nguồn evaluation chung cho prerequisites và current reads. `today=LocalDate.now(applicationClock)`; GPLX valid khi đúng owner, DRIVER_LICENSE, APPROVED, expiry NONNULL≥today, licenseClass nonblank. Một valid trong nhiều GPLX đủ; expired/pending/rejected khác không che proof valid. Không copy license metadata vào driver/response, dùng identity VERIFIED thay GPLX hoặc thêm tuổi/hạng/match fullname ngoài policy.

**Activation prerequisites**: account ACTIVE + current identity VERIFIED + valid license, không yêu cầu driver đã ACTIVE. **Current eligibility** còn cần profile tồn tại và stored driver ACTIVE. Tách hai predicates nhưng reuse evidence/policy, tránh profile PENDING không bao giờ activate được.

DriverEligibilityResponse allowlist: customerId, driverId nullable khi own missing profile, accountStatus, driverStatus nullable khi missing, current kycStatus, hasValidDriverLicense, eligibleNow, ineligibilityReasonCode, evaluatedOn. Reason precedence:

`ACCOUNT_NOT_ACTIVE` → `DRIVER_PROFILE_MISSING` → `DRIVER_NOT_ACTIVE` → `IDENTITY_NOT_VERIFIED` → `VALID_DRIVER_LICENSE_REQUIRED`.

Eligible true thì reason NULL; chỉ safe code/enum. Owner/admin scope ở bước 2; own missing profile 200/false khác GET me 404. Principal account missing 401; admin missing resource 404. Read-only không touch audits, expiry job/backfill/autosuspend.

Query dùng **một statement/projection** gồm account/status/driver và identity/license aggregates để cùng snapshot. Không load mọi document entities hoặc join làm duplicate rows/count. Reuse KycPolicy P06 từ flags; refactor helper không đổi P06 contract/tests. `readOnly=true` đơn lẻ không cho ba exists queries cùng snapshot READ_COMMITTED.

Expose internal evaluate theo **customerId rõ tên** cho F2, tránh lẫn customerId/driverId; không HTTP arbitrary-customer endpoint cho CUSTOMER. DTO là snapshot tại evaluatedOn, **không reservation/quyền gán xe**. F2 check lại tại action/transaction phù hợp và bảo vệ schedule/capacity riêng. F1 không write F2 tables/gánxe, cache eligibility theo JWT hoặc persist boolean/time.

Clock ngày sau có thể false dù stored ACTIVE/snapshot KYC còn VERIFIED; đây là hành vi đúng.

## 6. Bước 6 — Audit/logs/errors/privacy

Create audit P02/DB; mutation giữ createdAt/touch updatedAt; no-op giữ audit. Không sửa owner/KYC/document audit, role/profile/emailVerified. Reason không durable history theo schema; ghi limitation, không order action_logs/cột mới.

AfterCommit safe events action=driver-create/driver-status, trace, actor/owner/driver IDs, old/new status, reasonProvided boolean. Caught backend/constraint failures có positive safe diagnostic như P06-FIX-01; không Throwable/message/cause/suppressed/reason/PII/SQL detail/token/key. Preserve primary/cause/rollback; không mọi integrity error 409 hoặc DB failure 400/credentials.

Codes:400 INVALID_REQUEST/VALIDATION_ERROR; 401 INVALID_TOKEN/security envelope; 403 ACCESS_DENIED/DRIVER_SELF_STATUS_CHANGE_FORBIDDEN; 404 RESOURCE_NOT_FOUND; 409 DRIVER_PROFILE_ALREADY_EXISTS/INVALID_DRIVER_STATUS_TRANSITION/DRIVER_NOT_ELIGIBLE; 503 DEPENDENCY_UNAVAILABLE; 500 INTERNAL_ERROR. Body/header trace consistent, messages không echo input/path/locator/entity.

## 7. Bước 7 — Unit/HTTP/PostgreSQL checks

Thêm pure policy/MutableClock và DriverPostgresIT real HTTP/security/PostgreSQL15.13/migration unchanged/synthetic accounts/docs/keys. Không mock service thay contract. Tối thiểu:

1. Create 201 PENDING/Location/no-store/audit/own-only; missing/locked 401; body/query invalid 400/no row/owner audit change. Chưa đủ KYC/license vẫn create PENDING; ADMIN own create được nhưng self-status 403.
2. Duplicate 409 và real23505 fallback: test-only precheck fault miss, actual flush/index; positive safe diagnostic/cause/rollback. Foreign/missing 404, ADMIN đọc owner LOCKED được; CUSTOMER list/status/admin scopes 403.
3. Admin DB page/count/filter/tie-breaker nhiều owners/status; invalid queries 400; DTO không entity/PII/license/files. Strict status internal/duplicate/wrong/null/PENDING keys 400/rows unchanged.
4. U-14 activation đủ account/current identity/license. Snapshot VERIFIED nhưng identity expired không đủ; license NULL expiry/hôm qua/pending/rejected/wrong type/wrong owner/missing class không valid; today success, một valid trong nhiều proofs success.
5. State/no-op matrix, U-15 activate/suspend/self no-op; owner LOCKED activation 409/suspend allowed; audits/unrelated rows/files giữ. No-op không event/audit change.
6. Clock advance identity/license expiry: stored ACTIVE/snapshot VERIFIED có thể giữ nhưng current false. Account LOCKED/profile SUSPENDED false; GET không audit write/IO ảnh. Driver evaluation không sửa KYC.
7. Force rollback sau flush/before commit giữ rows/audit, no committed event, safe trace. Positive afterCommit/failure events và privacy captures cả ThrowableProxy/cause/suppressed/sentinels; không chỉ assert capture rỗng.
8. Aggregate consistency/missing profile/scope, internal customerId contract khi driverId khác customerId; P05/P06 contract không đổi.

Fixtures phân biệt SQL seeds với HTTP approval. Ít nhất **một end-to-end**: P05 upload→ADMIN khác P06 approve identity/GPLX→P07 create/activate→eligible true, không fake KYC/roles hoặc skip filters. Không production secrets/DB.

## 8. Bước 8 — Concurrency/locks thật

Bounded barriers, actual queries/flush/commit; hooks chỉ timing/fault. Dùng pg_blocking_pids khi cần xác nhận DB wait; không chỉ start latch rồi claim mọi ordering được ép.

- Hai create cùng owner: HTTP overlap trước shared lock; một 201/một 409, một row/one success event/owner unchanged. Exact unique fallback có case riêng.
- Actor lock vs status: request đã auth giữ trước advisory; ADMIN khác khóa actor/commit rồi release→401/no mutation/success event. Không chỉ lock trước send.
- Owner lock vs activation: kiểm tra hai orderings. Lock commit trước activation→409/no ACTIVE; activation commit trước lock→stored ACTIVE/account LOCKED/current false. Chứng minh common serialization, không autosuspend.
- P06 license approval vs P07 activation: identity valid/profile PENDING/license PENDING. Actual review giữ transaction/advisory trước commit, activation waiter bịblock. Release approval→activation thấy APPROVED vàsuccess; không mock/cached result. P06 files/privacy/afterCommit giữ.
- Hai status commands: hai ADMIN activate/suspend, ordering ép/assertions khớp transitions/commits. Không yêu cầu cả hai thắng nếu suspend trênPENDING là invalid.
- Timeout/retry: connection PostgreSQL khác block advisory/owner/driver row, fixture timeout hẹp; 503/trace/no mutation, release rồi retry đúng. Không mocked exception hoặc đổi mọi SQL fail 409.

Finally release/close resources dù assert fail; không infinite joins/sleep may rủi. Contention fixture có thể tăng lockwait riêng bounded observer; explicit timeout case vẫnshort. Report PID/wait/commit evidence; không claim multi-node capacity/scheduling F2.

## 9. Bước 9 — Full verify/docs/report và dừng

Targeted khi sửa, cuối cùng:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

**106 regression tests hiện có** vẫn chạy; P07 không skip/bỏ assertions. Actual Boot native-root/helper packaging đạt; health HTTP 200/UP/trace trên app/PostgreSQL/key tạm. Leader schema/reference/Flyway/entities hashes giữ; không sharedDB/backfill/deploy/secrets.

Viết docs/14_DRIVER_PROFILE_ELIGIBILITY.md, cập nhật API/architecture/plan/decisions/README/index/roadmap/AGENTS/localguide/status: stored/current distinction, U-14/U-15 vs baselines, state/reason/history, query/locks/errors/FE/F2 contract, limitations. Không P07 APPROVED; historical reports/reviews/prompts/reference giữ.

Chỉ sau code tạo **docs/reports/P07_REPORT.md**:inventory, lệnh/counts/pass/fail/skip, HTTP traces, real unique/locks/race/PIDs, Clock/audit/rollback/privacy, hashes/Git/untracked/no staging vàlimits production/ACL/crash/history/throughput/F2. Không fake expected report hoặc kết quả artifact cũ.

Đủ evidence: **P07 READY_FOR_REVIEW, P08 NOT_STARTED**. Gửi report và dừng; không commit/push/đổi nhánh/tự code P08.
