# 15 — Tài khoản ngân hàng (P08)

**Audit scope2026-10-15:** giữ U-16/U-17/U-18, owner-only cả ADMIN, masked REST, zero-default và schema/FK gốc. Đã bỏ full-payee helper/DTO dành trước cho F4; không thêm payout module. Runtime dùng [Supabase/.env](SUPABASE_SETUP.md). Chi tiết tại [checklist audit](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md); reports P08–P10 giữ nguyên lịch sử.

## Phạm vi và dữ liệu

P08 triển khai quản lý các `bank_accounts` do chính principal đăng nhập sở hữu. CUSTOMER và ADMIN đang ACTIVE đều dùng được chức năng này trên tài khoản của mình; ADMIN không có quyền đọc tài khoản người khác. Không có nghiệp vụ chuyển tiền, payout, chỉnh sửa payee, đối soát ngân hàng hoặc KYC tên chủ.

Entity giữ đúng schema leader: `id`, `customer_id`, `bank_name VARCHAR(100)`, `account_number VARCHAR(30)`, `account_holder VARCHAR(150)`, `is_default`, `created_at`. Entity chỉ có `createdAt`; không bổ sung `updated_at`, `@Version`, trạng thái, soft delete hay lịch sử. Các unique/index/FK có sẵn trong baseline vẫn là thẩm quyền cuối của database: unique `(customer_id, bank_name, account_number)`, unique `(id, customer_id)`, và partial unique `uq_bank_default_per_customer`.

## HTTP API

Mọi response thành công dùng envelope chung và `Cache-Control: no-store`. Trace trả trong envelope phải khớp `X-Request-ID`. Các route chỉ cho CUSTOMER/ADMIN ACTIVE; status/role được đọc lại từ DB ở thao tác ghi sau khi lấy khóa.

| Method và route | Hợp đồng |
|---|---|
| `POST /api/bank-accounts` | JSON strict gồm `bankName`, `accountNumber`, `accountHolder` và `makeDefault` tùy chọn; trả 201, Location và masked `BankAccountResponse` |
| `GET /api/bank-accounts?page=0&size=20&sort=createdAt,desc` | Page/masked responses chỉ của principal hiện tại; mặc định page 0, size 20, max size theo customer config (100) |
| `GET /api/bank-accounts/{id}` | Chi tiết đã che số; foreign/missing cùng 404 |
| `PATCH /api/bank-accounts/{id}/default` | Không nhận query hoặc byte body; đặt default và trả masked response |
| `DELETE /api/bank-accounts/{id}` | Không nhận query hoặc byte body; trả `data: null`; bank còn được tham chiếu trả 409 |

Create từ chối field thiếu/null/sai kiểu, duplicate key, unknown field, owner/id/status/audit/helper/presence flag và query string. `makeDefault` chỉ nhận JSON boolean; nếu bỏ qua thì false. List chỉ nhận `page`, `size`, `sort`; sort allowlist là `id`, `createdAt`, `isDefault`, một cặp field/direction, có ID tie-break khi cần. Unknown/duplicate query, số ngoài miền hoặc multi-sort bị từ chối. Path ID phải dương. GET detail cũng từ chối query string.

Bodyless PATCH/DELETE từ chối mọi query và byte đầu tiên của body trước side effect, gồm whitespace, JSON, form, multipart và chunked payload. Không có PUT/PATCH thay đổi payee, clear-default, admin-global-list hay full-number reveal endpoint. Caller không chọn `customerId`.

## Chuẩn hóa, masking và policy

Ba trường chuỗi được `strip()` hai đầu, phải khác rỗng, không chứa ISO control characters và giới hạn theo số Unicode code point tương ứng với VARCHAR (100/30/150). Giữ nguyên case, khoảng trắng ở giữa và số 0 đầu; không biến account number thành số, không uppercase tên ngân hàng/chủ tài khoản, không áp regex ngân hàng hay đối chiếu tên KYC. Database uniqueness vẫn phân biệt theo collation/schema hiện tại.

`BankAccountResponse` chỉ có `id`, `customerId`, `bankName`, `accountNumberMasked`, `accountHolder`, `isDefault`, `createdAt`. Số dài hơn bốn code point giữ tối đa bốn code point cuối; số ngắn không để lộ suffix và được che toàn bộ. Full account number không nằm trong REST DTO. Validation/database errors không echo submitted payee fields hoặc số tài khoản.

- **U-16:** chỉ `makeDefault=true` mới tạo tài khoản default. Omitted/false vẫn non-default, kể cả tài khoản đầu tiên.
- **U-17:** default không bị tham chiếu có thể bị xóa và để lại zero defaults; không tự promote account khác.
- **U-18:** payee fields bất biến sau create; muốn đổi bank/name/number thì tạo row mới, rồi có thể chọn default theo cùng policy.

## Transaction, khóa và lỗi

Create/default/delete chạy transaction theo thứ tự shared `CustomerStatusLock` advisory → customer row lock → các bank row lock theo ID tăng dần. Sau khi chờ, write recheck ACTIVE và role của actor từ database. Mọi list/detail lookup owner-scoped ngay trong query trước khi map/page; tài khoản foreign/missing đều 404 kể cả khi caller là ADMIN.

Khi chọn default khác, implementation clear default cũ và flush trước khi set/insert default mới trong cùng transaction. No-op trên default hiện hành không ghi mutation event. Nếu insert/update/delete lỗi thì transaction rollback; clear trước đó không commit riêng. Partial unique index là authority cho tối đa một default. Delete flushes để FK lỗi xuất hiện trong boundary xử lý; ứng dụng không query hoặc detach payout trong production F1.

| Trường hợp | HTTP/error contract |
|---|---|
| Request/validation không hợp lệ | 400, không echo rejected value |
| Bank account không tìm thấy hoặc foreign | 404 |
| Exact unique `(customer_id, bank_name, account_number)` / `23505` | 409 `BANK_ACCOUNT_ALREADY_EXISTS` |
| Exact `uq_bank_default_per_customer` / `23505` | 409 `BANK_DEFAULT_CONFLICT` |
| Exact payouts composite FK / `23503` khi delete | 409 `BANK_ACCOUNT_IN_USE` |
| Advisory/row-lock timeout hoặc DB unavailable đã phân loại | 503 |
| Integrity/DB failures khác | lỗi tổng quát; không bị gọi nhầm là duplicate hay payout conflict |

Mapping conflict yêu cầu SQLState và tên constraint khớp chính xác; raw DB message không dùng để phân loại. Log failure chỉ giữ trace, action/category, code, actor/bank IDs nếu biết, exception type và allowlisted constraint. Không log payee fields, số đầy đủ, SQL detail, raw message, throwable/cause/suppressed, bearer token. Thành công create/default/delete chỉ log sau commit; rollback và no-op không phát committed-change event.

## Ranh giới với Function 4 — cập nhật audit 2026-10-15

Theo yêu cầu user chỉ giữ Function1, đã bỏ interface/full-payee DTO và method lookup chuẩn bị trước cho F4 vì không có consumer F1. REST ngân hàng vẫn owner-only/masked, không expose số đầy đủ hoặc tạo payout API.

F4 do thành viên khác triển khai khi được giao; cần tuân composite FK `(bank_account_id, recipient_id) → bank_accounts(id, customer_id)` từ schema leader. F1 chỉ giữ xử lý lỗi referenced delete và các invariants của bank_accounts. Không thêm entity/repository/service payout trong F1.

Testcontainer P08 tạo test-only bảng payout tối thiểu với đúng composite FK để chứng minh 23503, lỗi 409 và race reference/delete. Bảng/DDL này không thuộc production resources/JAR hoặc migration; kết quả chỉ chứng minh constraint translation và integrity fixture, không phải kiểm thử full payout.
