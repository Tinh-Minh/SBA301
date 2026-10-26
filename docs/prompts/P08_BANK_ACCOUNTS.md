# PROMPT P08 — Tài khoản ngân hàng, default và hợp đồng F4

Bạn là Agent code tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. P01–P07 đã APPROVED theo [review P07-FIX-01](../reviews/P07_FIX_01_REVIEW.md). Triển khai **P08 bằng đủ 9 bước**, tạo báo cáo thực tế, đặt READY_FOR_REVIEW rồi dừng. **P09 chưa làm; không commit/push.**

## 1. Bước 1 — Đọc nguồn, xác nhận hiện trạng và phạm vi

Đọc AGENTS.md, [status](../IMPLEMENTATION_STATUS.md), [scope F1](../01_FUNCTION_1_SCOPE.md), conventions, [API](../03_FUNCTION_1_API.md), [database review](../04_DATABASE_REVIEW.md), [decisions](../07_DECISIONS_AND_OPEN_QUESTIONS.md), local guide và review mới nhất. Đọc `BankAccount`, `BaseEntity`, `BankAccountRepository`, current-account/security, DTO parsing/paging, shared `CustomerStatusLock`, error classification và after-commit log patterns đang dùng.

Kiểm tra BE/HEAD/working tree. HEAD nguồn đã xác nhận `2fe712eed12a2af3b61f0a5311bdd3901f614029`; project vốn có các file untracked. Giữ tất cả thay đổi của các lượt trước. Không dựa vào diff trống để bỏ qua file inventory.

Phạm vi: CRUD giới hạn của **bank_accounts** và internal ownership/payee lookup cho Function 4. Không viết payout/payment/transaction/order/car modules, entity ngược payouts, transfer giả hoặc gọi ngân hàng thật. Không sửa leader schema/entity mapping/migration/reference, thêm updated_at/@Version/status/soft-delete/history hoặc roles. Không dùng DB chung, credential thật, đổi branch, stage/commit/push/stash/reset/clean. Test DDL chỉ ở Testcontainers như bước 8.

### Nguồn schema phải giữ

| Thành phần | Theo leader |
|---|---|
| Fields | id, customer_id, bank_name VARCHAR(100), account_number VARCHAR(30), account_holder VARCHAR(150), is_default boolean, created_at |
| Audit | **Chỉ createdAt**, không updatedAt; BaseEntity hiện có phù hợp |
| Unique cùng owner | `(customer_id, bank_name, account_number)` |
| Default | Partial unique `uq_bank_default_per_customer` trên customer_id WHERE is_default; tối đa một, có thể không có |
| Tham chiếu F4 | UNIQUE `(id, customer_id)`; payouts FK `(bank_account_id, recipient_id)` → bank_accounts `(id, customer_id)` |

Reference là dữ liệu đầu vào; không chạy toàn bộ schema.sql vì tài liệu có SQL.

## 2. Bước 2 — Khóa policy người dùng đã xác nhận và baseline kỹ thuật

| Mã | Đã được người dùng chọn ngày 2026-10-14 |
|---|---|
| U-16 | Chỉ tạo default khi `makeDefault=true`; request thiếu cờ mặc định false, kể cả tài khoản đầu tiên |
| U-17 | Được xóa tài khoản default chưa bị payout tham chiếu; sau đó không có default, người dùng tự chọn lại |
| U-18 | bankName/accountNumber/accountHolder bất biến sau create; thay đổi bằng cách thêm bản ghi mới, bảo toàn ý nghĩa tham chiếu payout |

Baseline kỹ thuật cho prompt này, không gọi là luật sản phẩm mới do user chốt:

- CUSTOMER và ADMIN ACTIVE dùng API ngân hàng của **chính mình**. ADMIN không tự được đọc/sửa tài khoản người khác; chưa có admin bank-list endpoint. Policy cấm self-status driver/KYC không áp sang create/default ngân hàng.
- Không yêu cầu KYC VERIFIED hoặc driver ACTIVE để lưu ngân hàng; user chưa giao điều kiện đó. Nhận tiền/payout do F4 quyết định.
- Request JSON strict; field lengths theo schema; text strip hai đầu, không tự uppercase bankName/name hoặc xóa số 0 đầu. Không ép accountNumber thành số, đặt regex ngân hàng/hạng tên/match tên KYC, gọi catalog/đối soát thật hoặc coi tên khai là đã xác minh.
- String khác null/nonblank, đúng kiểu, trong giới hạn code point của VARCHAR; từ chối control characters trong dữ liệu nhận tiền như baseline validation. Không collapse space ở giữa hoặc đổi case để giả normalized unique ngoài schema. Document rõ unique vẫn case-sensitive theo DB.
- Response HTTP luôn che accountNumber. Nội dung nhập không được echo trong error/log; owner có thể nhận accountHolder/bankName của mình. Không có endpoint full-number/reveal trong P08.

Giữ các baseline đã có về trace, no-store, error envelope, page limits, schema audit và logs. Nếu phát hiện xung đột thực tế, ghi rõ bằng chứng, tiếp tục phần độc lập; không tự mở nghiệp vụ F4.

## 3. Bước 3 — Thiết kế DTO, masking, query và service interfaces

Tạo `BankAccountService`/`BankAccountServiceImpl`, controller mỏng theo tài nguyên, mapper và DTO request/response tách riêng. Reuse hạ tầng hiện có, không xây response/trace/security/parser thứ hai hoặc dùng entity trực tiếp ở HTTP.

### Create DTO

Chỉ nhận `bankName`, `accountNumber`, `accountHolder`, `makeDefault`:

- Ba String bắt buộc, strip, nonblank, length lần lượt 100/30/150 code point; preserve leading zero và case. Sai type/coercion/null/thiếu trả safe 400; không echo rejected values.
- `makeDefault` chỉ JSON boolean; omitted=false; null/string/number/array/object sai 400.
- Unknown/duplicate keys, owner/customerId/id/default/isDefault/audit/internal/helper/presence flags đều 400. Không thêm JavaBean getters làm private parsing state bind được; giữ regression P04.
- Query string trên create bị từ chối. Không nhận form/multipart thay JSON cho endpoint này hoặc cho caller chọn owner.

### Response và mask

`BankAccountResponse`: id, customerId, bankName, **accountNumberMasked**, accountHolder, isDefault, createdAt. Không có accountNumber đầy đủ, entity/customer graph, updatedAt giả, password/token hoặc payout history.

Mask giữ tối đa bốn code point cuối **chỉ khi độ dài lớn hơn bốn**; với số ngắn ≤4, che toàn bộ. Luôn che ít nhất một ký tự và không làm mất leading zeros ở DB. Ví dụ input tổng hợp `0012345678` → `******5678`; input `1234` → `****`. Logic code-point-safe, test cả số ngắn/Unicode và không leak full value ở response create/detail/list/default. Không đưa full value vào DTO để chỉ trông chờ Jackson annotation.

### Page/query

GET list chỉ `page`, `size`, `sort`; default 0/20, max100 theo cấu hình/page helper hiện có. Sort allowlist id/createdAt/isDefault,asc|desc, một cặp và ID tie-break. Unknown/duplicate/coercion/negative/out-of-range/multi-sort bị từ chối. WHERE customer_id=principal phải nằm trước page/count tại DB, không Java filtering.

Mọi detail/default/delete lookup phải scope id+owner trong query; foreign/missing cùng 404. IDs không dương hoặc sai kiểu 400. Service methods có interface và authority/current-account checks như nền tảng hiện hữu.

## 4. Bước 4 — Triển khai đúng năm HTTP endpoints

| Endpoint | Quyền / kết quả |
|---|---|
| POST `/api/bank-accounts` | Principal ACTIVE; create của mình, 201 envelope + Location + masked DTO |
| GET `/api/bank-accounts` | Principal ACTIVE; page/count chỉ của mình, masked DTOs |
| GET `/api/bank-accounts/{id}` | Principal ACTIVE owner; 200 masked DTO; foreign/missing404 |
| PATCH `/api/bank-accounts/{id}/default` | Principal ACTIVE owner; không body/query, 200 masked DTO; already-default no-op |
| DELETE `/api/bank-accounts/{id}` | Principal ACTIVE owner; không body/query, 200 envelope data=null; missing/foreign404; referenced409 |

Không thêm PUT/PATCH nội dung nhận tiền, clear-default endpoint, admin global read hoặc full-number reveal. Routes mới phải đi qua Spring Security thật; no token/invalid/LOCKED401, ADMIN own data allowed, role ngoài schema không tồn tại. Foreign ADMIN vẫn404 với bank của người khác, không403 cho phép suy existence.

PATCH default và DELETE từ chối **mọi byte body**, gồm whitespace, `{}`, JSON/null, form, multipart hoặc chunked payload, cùng bất kỳ query string. Dùng ingress approach đã kiểm chứng ở P07 hoặc giải pháp tương đương trước side effects; không chỉ check Content-Length/content-type hoặc im lặng bỏ body. Giữ trace/no-store/CORS PATCH/DELETE và strict semantics của endpoints cũ.

GET detail không nhận query tùy chọn chưa đặc tả. Illegal ID/unsupported route/method/content type dùng nền tảng error mapping hiện có. No-op không tạo success event giả mutation; delete request lặp sau xóa trả404 baseline.

## 5. Bước 5 — Transactions, khóa và default ordering

Create/default/delete có `@Transactional`. Dùng **shared CustomerStatusLock** hiện tại trước customer row lock để cùng protocol với P04/P06/P07; không khóa bank rồi mới acquire global/customer. Thứ tự: global advisory → own customer row → bank rows cần thiết theo ID tăng dần. Owner=actor cho HTTP P08, chỉ lock một customer; recheck ACTIVE và role khớp current principal sau khi chờ, không dùng JWT snapshot để quyết định write.

### Create

- Owner từ principal, không DTO. Precheck duplicate có scope để thông báo rõ; UNIQUE thật là authority cuối.
- makeDefault=false: insert false, kể cả owner chưa có default. Không tự chọn first account.
- makeDefault=true: trong cùng transaction, khóa/read lại state owner, clear default cũ và **flush trước khi insert true**. Nếu insert duplicate/failure thì rollback toàn bộ, default cũ vẫn còn.
- Không dùng list ID cố định, in-memory synchronized hoặc REQUIRES_NEW để clear/default commit riêng.

### Set default

- Scoped target tồn tại và thuộc owner; lấy locks trước mutation. Nếu đã default, trả DTO no-op, giữ createdAt/state, không phát committed-change event.
- Nếu khác: clear cũ, flush để unique partial index không va; rồi set target true/flush. Hai phases cùng transaction. Không đặt target true trước clear cũ, không deferred unique workaround hoặc sửa index.
- Nếu bulk update thì đồng bộ persistence context trước map response; tránh DTO entity cũ vẫn báo default. Không cần update field audit không có trong schema.

### Delete

- Chỉ own target, immutable payee fields. Delete+flush để FK failure xuất hiện trong boundary xử lý; không detach/null payout references hoặc cascade xóa payout.
- Xóa default thành công để zero defaults đúng U-17, không promote peer. Xóa non-default không chạm default còn lại.
- FK ghép F4 là authority chặn referenced delete, kể cả reference insert race. Không dùng precheck F4 rồi coi delete chắc chắn an toàn; P08 production không query một bảng payouts có thể chưa triển khai trong baseline F1.
- FK failure rollback giữ bank/default/audit nguyên trạng. Không query recovery trong transaction PostgreSQL đã aborted.

Khóa từ writer ngoài app không được tự giả rằng dùng advisory. Partial unique/FK vẫn bảo vệ cấu trúc DB; document writer protocol cho F4 và giới hạn throughput global lock. [PostgreSQL 15 — row/advisory locks](https://www.postgresql.org/docs/15/explicit-locking.html), [partial unique indexes](https://www.postgresql.org/docs/15/indexes-partial.html).

## 6. Bước 6 — Error classification, safe logs và rollback

Bổ sung tối thiểu codes phù hợp: `BANK_ACCOUNT_ALREADY_EXISTS`409, `BANK_ACCOUNT_IN_USE`409, có thể `BANK_DEFAULT_CONFLICT`409 cho đúng default index collision; giữ INVALID_REQUEST/VALIDATION_ERROR400, RESOURCE_NOT_FOUND404, INVALID_TOKEN401, dependency503 và unexpected500.

- Chỉ SQLState23505 + đúng UNIQUE customer/bank/number → duplicate; 23505 + đúng `uq_bank_default_per_customer` → default conflict. Lấy tên actual từ PostgreSQL/schema, document constants theo nguồn; không catch mọi DataIntegrityViolation thành duplicate.
- Trong delete, SQLState23503 + đúng FK composite payouts/bank theo leader → BANK_ACCOUNT_IN_USE. Xác nhận tên constraint trong integration fixture; nếu F4 đổi tên phải cập nhật hợp đồng có phối hợp, không phân loại bằng raw message/substring. Other integrity failures không được gọi là payout đang dùng.
- 55P03 thật giữ narrow lock-timeout503 nền tảng; không biến 23505/23503 thành503 hoặc repo failure thành400. Preserve exception cause khi wrap/rethrow, không swallow/thử tiếp trên transaction aborted.
- Safe positive diagnostic cho caught DB conflict, lock/dependency/unexpected failures: action/category/errorCode/trace/actorId/bankId nếu biết, allowlisted constraint/exception type; không bankName/accountHolder/accountNumber/raw message/SQL detail/Throwable/cause/suppressed/JWT.
- Success create/default/delete event chỉ after commit, có safe IDs/action/trace; rollback/no-op không phát committed-change event. Log không phải durable history; không thêm bảng/cột audit.
- HTTP errors không echo input/account number, body/header trace phải khớp. Hibernate raw JDBC errors/SQL display vẫn disabled.

## 7. Bước 7 — Hợp đồng nội bộ cho Function 4

Cung cấp interface nhỏ, tên thể hiện scope như `requireOwnedBankAccount(bankAccountId, recipientId)` hoặc `BankAccountLookupService`. Lookup bằng cả id+recipient tại DB, trả immutable DTO/reference; sai owner/missing cùng not-found. Không trả JPA entity hoặc tạo endpoint HTTP arbitrary-customer.

DTO nội bộ có thể chứa bankName/accountNumber đầy đủ/accountHolder để F4 dùng nhận tiền, nhưng không tái sử dụng làm REST response, log/toString hoặc serialize qua controller. Nếu tạo sensitive record, bảo vệ toString khỏi tự lộ số; test HTTP DTO graph không chứa DTO nội bộ. Lookup không thêm mock transfer, payout controller/repository/entity hoặc tự quyết policy nhận tiền cho account LOCKED/KYC; F4 quyết định action policy riêng.

F4 phải dùng **bank ID cùng recipient ID** khi ghi payout, giữ FK composite của leader. Lookup là snapshot, không reservation: bank có thể bị xóa trước khi F4 insert, FK sẽ chặn reference không còn. Nếu F4 cần guarantee qua transaction thì thiết kế lock/protocol thống nhất tại action F4; P08 không cam kết snapshot tự bảo vệ cả payout. Thông tin payee bất biến theo U-18 bảo toàn ý nghĩa row đã tham chiếu. Không chuyển tiền chỉ từ isDefault hoặc từ masked number.

Viết hợp đồng tích hợp trong docs; phần internal full-number là trusted module boundary, không là quyền admin xem mọi ngân hàng qua HTTP.

## 8. Bước 8 — Automated tests và full verification

Kiểm tra bằng PostgreSQL 15.13 Testcontainers + app HTTP/JWT/security/JPA thật, keys/accounts/numbers tổng hợp. Unit tests cho parsing/mask có thể thêm nhưng không thay DB/HTTP evidence.

### HTTP, schema, privacy

- Create false/omitted kể cả first account; true thay default; DB giữ leading zeros/case/code-point lengths/createdAt, không updatedAt. Short/full/Unicode mask không lộ number trên create/detail/list/default hoặc lỗi.
- Strict JSON scalar/null/boolean, unknown/duplicate/helper/presence flags; principal owner không bị DTO sửa. Query rejection và bodyless endpoints: payload `{}`, whitespace, form/multipart/chunked bị400 và rows không mutation.
- No token/invalid/LOCKED401; CUSTOMER/ADMIN own data thành công; foreign/missing404, ADMIN không bypass owner; page/count/sort/filter allowlist không đưa data người khác vào.
- Exact duplicate: cùng owner/bank/number409, bank/customer khác đúng schema vẫn tạo được. Actual23505 với safe positive diagnostic/trace/cause privacy; unrelated integrity không bị map sai. Default index cũng có actual PostgreSQL evidence, không mock SQLException.
- Default no-op, delete non-default/default(U-17), deleted repeat404, immutable-fields endpoint không tồn tại. Rollback fault sau clear+flush nhưng trước set/insert/commit phải phục hồi default cũ; không success event hoặc bank/customer/document mutation ngoài dự kiến.
- Internal ownership lookup đúng/foreign/missing, full details chỉ trong trusted DTO, HTTP/logs không leak; không storage/document calls.

### Concurrency thật

1. Hai HTTP đổi default hoặc create true cùng owner: actual transaction holder sau clear/flush và waiter ở shared lock/customer row. Observer xác nhận đúng holder/waiter qua `pg_blocking_pids` trước release. Sau commit hai kết quả tuần tự đúng, DB tối đa một default, không intermediate clear visible cho peer ngoài transaction.
2. Default vs delete trên cùng row: serialized outcomes theo acquisition order, không cả hai giả success cho row đã bị xóa; cuối state phù hợp U-17. Có thể dùng create true vs delete default nếu fixture rõ equivalence; report timeline thực tế.
3. Request đang chờ, account bị P04 khóa trước khi nó đọc lại actor: request không mutation, trả auth error đúng. Giữ U-09 last-admin policy; không fake auth để ép outcome.
4. Advisory/row lock blocker thật gây55P03 →503 có trace, rollback không mất default; release →retry thành công. Bounded latches/timeouts/observer polling, finally release/close dù fail, không sleep may rủi hoặc gọi hai exclusive holders cùng barrier rồi deadlock.

### FK chặn referenced delete — fixture tích hợp riêng

F1 baseline không có payouts. Testcontainer riêng có thể thêm **test-only FK fixture**: table `payouts` tối thiểu chứa bank_account_id/recipient_id và FK composite đúng từ leader; không thêm production migration/entity/API F4. Để PostgreSQL đặt/xác nhận constraint name như leader, test actual23503 khi HTTP delete referenced bank, 409 BANK_ACCOUNT_IN_USE, trace/privacy/default/createdAt intact. Test wrong recipient reference cũng bị FK chặn và concurrent insert-reference/delete không để dangling reference.

Đây là fixture kiểm chứng composite FK/integrity translation, **không gọi là đã triển khai hoặc kiểm thử full payouts F4**. Nếu chọn full leader schema cho DB tích hợp riêng, vẫn không chạy source SQL trên DB chung và mô tả chính xác dependency fixtures. Test helper/DDL không được vào production resources/JAR; các baseline suites khác không bị fixture làm bẩn. Không chỉ mock FK exception hoặc bỏ ca này vì baseline F1 thiếu payouts. [PostgreSQL 15 — foreign keys](https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-FK).

Sau targeted P08 chạy:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

Xác định đường dẫn JDK21 thật; logs đặt TEMP ngoài target để clean không bị file lock. Toàn bộ **126 tests hiện có** và tests mới phải chạy không failure/error/skip; giữ actual Boot JAR/CWD regression và markers/helper absent. Health HTTP trên app + PostgreSQL test200/UP/trace thật. Ghi lệnh/counts/logs/reruns chính xác, không chỉ summary PASS hoặc test mocked.

## 9. Bước 9 — Docs, report và dừng

Sau implementation tạo `docs/15_BANK_ACCOUNTS.md`: routes/DTOs/mask, U-16/U-17/U-18, normalization/unique/default semantics, locks/flush/rollback, safe error/log contract, internal sensitive DTO/F4 FK boundary và limits. Update current API/architecture/plan/decisions/status/index/AGENTS/roadmap/local guide phù hợp. Phân biệt implementation thật và đề xuất P09/P10; giữ historical reports/reviews/prompts/reference.

Chỉ sau làm tạo **`docs/reports/P08_REPORT.md`**, gồm:

- Chín bước thực hiện, file inventory và endpoint/schema mapping; bank không updatedAt, không nội dung nhận tiền mutation.
- U-16/U-17/U-18 evidence, masked/full internal boundary, strict HTTP/ownership/page/count và DB constraints thật.
- Holder/waiter PIDs + blocking/release outcomes, default rollback/timeout/retry, FK fixture scope/name/23503 và reference race; không gọi chỉ có latch là actual DB contention.
- Safe committed/failure event trace và positive/negative privacy assertions; synthetic markers không lộ trong response/log/JAR.
- Targeted/full counts/failures/errors/skips, actual Boot probe, packaging, health response/header/trace, lệnh/logs và mọi lỗi môi trường/rerun.
- Hash schema/reference/migration trước/sau, Git BE/HEAD/untracked/staged và limitations: DB production/F4 full flow/ACL/multi-node/benchmark chưa kiểm chứng nếu chưa làm.

Đủ evidence đặt **P08 READY_FOR_REVIEW; P09 NOT_STARTED**. Agent không tự ghi APPROVED, không stage/commit/push hoặc chạy migration DB chung. Gửi báo cáo và dừng để người dùng chuyển reviewer.
