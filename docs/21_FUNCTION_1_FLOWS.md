# Sơ đồ từng luồng Function 1

Ngày2026-10-15. Đây là luồng implementation hiện tại để user review, không tự thêm feature. Nguồn chính là service/controller/SQL leader; policy U-09–U-21 do user đã chọn được tách khỏi ràng buộc SQL. [Checklist scope](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md), [59 cột entity](22_ENTITY_SCHEMA_FIELD_MAP.md), [chạy Supabase](SUPABASE_SETUP.md).

## 0. Kiến trúc chạy thật

```mermaid
flowchart LR
  Client[FE hoặc Postman] --> Web[Spring Security và Controller]
  Web --> Service[Service interface và implementation]
  Service --> Repo[JPA Repository]
  Repo --> DB[(Supabase PostgreSQL - 5 bảng F1)]
  Service --> Files[Private document storage ngoài repo]
  Env[.env - profile supabase] --> Web
  Keys[Private/public RSA PEM ngoài repo] --> Web
```

Supabase ở đây là database. Không dùng Supabase Auth, không cần anon/service-role API key cho JDBC, chưa chuyển ảnh sang Supabase Storage. Khi chạy test, DB được thay bằng PostgreSQL Testcontainer; Docker không nằm trên đường chạy ứng dụng với Supabase.

### Quan hệ dữ liệu đúng phạm vi

```mermaid
erDiagram
  CUSTOMERS ||--o{ USER_DOCUMENTS : customer_id
  CUSTOMERS |o--o{ USER_DOCUMENTS : verified_by
  CUSTOMERS ||--o| DRIVERS : customer_id_unique
  CUSTOMERS ||--o{ BANK_ACCOUNTS : customer_id
  VOUCHERS {
    bigint id PK
    varchar code UK
  }
```

`vouchers` không có customer_id/created_by trong schema; không vẽ thêm FK đến ADMIN vì ADMIN là người thao tác API. Quan hệ từ orders/payouts đến voucher/bank thuộc schema nhóm nhưng không tạo entity/service của các function đó trong F1.

## 1. Đăng ký — POST /api/auth/register

```mermaid
flowchart TD
  A[fullName, email, phone, password] --> B[Validate, chuẩn hóa email/phone]
  B --> C{Email/phone đã có?}
  C -->|Có| D[409 ACCOUNT_ALREADY_EXISTS]
  C -->|Không| E[Hash BCrypt]
  E --> F[INSERT customers]
  F --> G[CUSTOMER, ACTIVE, NONE, email_verified=false]
  G --> H[201 profile DTO - không password_hash]
```

Chỉ ghi `customers`; ID/created_at/updated_at do DB sinh. Unique DB là chốt cuối cho hai registration đồng thời. Client không được chọn ADMIN/KYC/verified/audit. Không có OTP/email verification trong luồng này.

## 2. Đăng nhập và kiểm tra JWT

```mermaid
flowchart TD
  A[Email và password] --> B[Tìm customers theo email]
  B --> C{Account ACTIVE và BCrypt khớp?}
  C -->|Không| D[401 lỗi credentials chung]
  C -->|Có| E[Ký JWT RS256 bằng private key]
  E --> F[200 accessToken, TTL, account summary]
  F --> G[Client gửi Authorization Bearer]
  G --> H[Verify signature, iss, aud, thời hạn]
  H --> I[Đọc role/status customers hiện tại]
  I --> J{Account tồn tại và ACTIVE?}
  J -->|Không| K[401 INVALID_TOKEN]
  J -->|Có| L[Kiểm tra role và ownership ở API]
  L --> M[Thực thi hoặc 403/404 đúng resource]
```

Login không tạo bảng token/refresh session, không sửa `email_verified`. JWT không phải Supabase Auth token. Account bị khóa bị chặn ở request kế tiếp dù access token chưa hết hạn.

## 3. Hồ sơ cá nhân và admin quản lý account

```mermaid
flowchart TD
  A[Authenticated account] --> B{Thao tác}
  B -->|GET/PATCH me| C[Chỉ own customers row]
  C --> D[Allowlist fullName, dateOfBirth, address]
  D --> E[Validate omitted/null, flush nếu đổi]
  E --> F[200 profile DTO]
  B -->|ADMIN list/detail| G[Role ADMIN, lọc DB trước pagination]
  G --> H[200 admin DTO/page]
  B -->|ADMIN đổi status| I[status + nonblank reason]
  I --> J[Lock, đọc lại actor và target]
  J --> K{Self-lock hoặc last ACTIVE ADMIN?}
  K -->|Có| L[409 không mutation]
  K -->|Không| M[ACTIVE hoặc LOCKED - no-op nếu không đổi]
  M --> N[Commit và safe log]
```

Chỉ ghi fields sẵn trong `customers`. Lý do status được validate nhưng schema không có cột lưu history/reason; không tự tạo thêm bảng. `avatar_url` và `email_verified` vẫn map đúng SQL nhưng chưa có luồng upload avatar/xác minh email.

## 4. Gửi giấy tờ — POST /api/user-documents

```mermaid
flowchart TD
  A[JWT + multipart metadata + ảnh] --> B[Validate allowlist, loại, dates, limits]
  B --> C{DRIVER_LICENSE có licenseClass?}
  C -->|Không| D[400 không ghi row/file]
  C -->|Có hoặc loại khác| E[Kiểm tra JPEG/PNG và canonicalize]
  E --> F[Lưu file private bằng opaque locator]
  F --> G[Transaction lock owner, recheck ACTIVE]
  G --> H[INSERT user_documents PENDING]
  H --> I{DB outcome}
  I -->|Commit| J[201 safe detail DTO]
  I -->|Rollback| K[Dọn file của upload này]
  I -->|Không xác định| L[Giữ receipt, không xóa mù]
```

Ghi `user_documents`, không tự duyệt hoặc đổi snapshot KYC khi upload. frontImage bắt buộc, backImage optional ở submission. Metadata bắt buộc khi APPROVED là bước sau. `front_image_url/back_image_url` lưu locator private đúng cộtVARCHAR500, không tạo cột mới và không expose local path/public URL.

## 5. Xem/list/tải ảnh giấy tờ

```mermaid
flowchart TD
  A[JWT + query hoặc documentId/side] --> B{Owner hoặc ADMIN?}
  B -->|Không| C[404 giống missing resource]
  B -->|Có| D{Kiểu request}
  D -->|List| E[Lọc owner/admin scope ở DB, phân trang]
  D -->|Detail| F[Safe metadata DTO]
  D -->|front/back| G[Mở locator private sau authorization]
  G --> H[200 JPEG/PNG binary attachment]
```

Download có no-store/nosniff/request ID; response lỗi vẫn JSON envelope. Không đưa file vào static resources và không gửi JWT trong URL.

## 6. ADMIN duyệt/từ chối và KYC

```mermaid
flowchart TD
  A[ADMIN + review command] --> B[Lock actor, owner, document và recheck quyền]
  B --> C{Tự review?}
  C -->|Có| D[403]
  C -->|Không| E{Document PENDING?}
  E -->|Không| F[409 terminal]
  E -->|Có| G{Quyết định}
  G -->|APPROVED| H[U-13 metadata, ảnh, ngày/hạn và unique proof]
  H --> I[APPROVED, verified_by, verified_at]
  G -->|REJECTED| J[Nonblank reason và giới hạn độ dài]
  J --> K[REJECTED, reject_reason, verifier, time]
  I --> L[Tính snapshot KYC customer cùng transaction]
  K --> L
  L --> M[Commit - safe log - trả kết quả]
```

U-13 đã chốt: họ tên/DOB/ngày/nơi cấp; CCCD/GPLX hai mặt, passport một mặt; GPLX class và expiry; identity expiry nullable. SQL partial unique `(doc_type,doc_number)` khiAPPROVED là chốt cuối cho duplicate proof.

### Current KYC khi đọc

```mermaid
flowchart TD
  A[Query identity proof tại ngày hiện tại] --> B{Có CCCD/passport APPROVED còn hiệu lực?}
  B -->|Có| V[VERIFIED]
  B -->|Không| C{Có identity PENDING?}
  C -->|Có| P[PENDING]
  C -->|Không| D{Có identity REJECTED?}
  D -->|Có| R[REJECTED]
  D -->|Không| N[NONE]
```

GPLX không tự làm identity KYC VERIFIED (U-12). `customers.kyc_status` là snapshot được review ghi; GET current KYC tính theoClock, không tạo cột `currentKycStatus`, không dùng enumEXPIRED. Hạn ngày có tính inclusive; expired identity APPROVED mà không có proof khác có thể cho currentNONE trong khi snapshot cũVERIFIED.

## 7. Hồ sơ tài xế

```mermaid
flowchart TD
  A[Customer POST drivers - không body/query] --> B{Đã có profile?}
  B -->|Có| C[409 duplicate]
  B -->|Không| D[INSERT drivers PENDING]
  D --> E[ADMIN status command]
  E --> F{ADMIN tự đổi profile mình?}
  F -->|Có| G[403]
  F -->|Không| H{Target status}
  H -->|ACTIVE| I[Account ACTIVE, current KYC VERIFIED, GPLX APPROVED còn hạn/class]
  I --> J{Đủ điều kiện?}
  J -->|Không| K[409 DRIVER_NOT_ELIGIBLE]
  J -->|Có| L[ACTIVE]
  H -->|SUSPENDED| M[Reason bắt buộc, transition hợp lệ]
  M --> N[SUSPENDED]
```

Transition: PENDING→ACTIVE; ACTIVE→SUSPENDED; SUSPENDED→ACTIVE. PENDING→SUSPENDED không hợp lệ. ACTIVE no-op vẫn kiểm tra eligibility; SUSPENDED no-op giữ audit. U-14/U-15 đã chốt, không thêm roleDRIVER hoặc field GPLX vào `drivers`.

GET eligibility trả `eligibleNow=true` khi storedACTIVE + accountACTIVE + currentidentityVERIFIED + validlicense. GPLX hết hạn khiến currentfalse, không auto-write SUSPENDED hoặc thêm scheduler. Không gán xe/slot/tài xế trong F1.

## 8. Tài khoản ngân hàng

```mermaid
flowchart TD
  A[JWT owner] --> B{Thao tác}
  B -->|Create| C[Validate bankName, accountNumber, holder]
  C --> D[Lock owner, INSERT - default chỉ khi true]
  B -->|List/detail| E[Owner query trước paging/map]
  B -->|Set default| F[Lock các bank owner theo thứ tự]
  F --> G[Clear default cũ, flush, set mới cùng transaction]
  B -->|Delete| H{FK còn được tham chiếu?}
  H -->|Có| I[409 BANK_ACCOUNT_IN_USE]
  H -->|Không| J[DELETE, có thể còn zero default]
  D --> K[Response masked]
  E --> K
  G --> K
```

ADMIN không bypass ownership. Số account là String giữzero đầu. Không API sửa bankName/accountNumber/holder saucreate (U-18); thêm row mới. Bank chỉcreated_at, khôngupdated_at. Giữ FK protection của database gốc nhưng **không helper đầy đủ payee/payout F4** sau lượt tinh gọn.

## 9. ADMIN voucher definitions

```mermaid
flowchart TD
  A[JWT ADMIN] --> B{Thao tác}
  B -->|Create| C[Code exact, type, amount integral, dates/quota theo SQL]
  C --> D[INSERT vouchers ACTIVE, used_count=0]
  B -->|List/detail| E[Lọc/page và tính windowState]
  B -->|PUT| F[Chỉ description và usageLimit, đủ hai key]
  F --> G[Lock, đọc used_count mới nhất, quota không thấp hơn count]
  B -->|Status| H[ACTIVE hoặc INACTIVE]
  H --> I[UPDATE status, không hard delete]
  D --> J[Response definition DTO]
  E --> J
  G --> J
  I --> J
```

Tiền NUMERIC(14,0)/BigDecimal, PERCENT≤100. Code strip hai đầu, giữcase (U-21). Amount1.0/1e0 integral hợp lệ, quota cần integer token. Window UPCOMING/CURRENT/ENDED là computed DTO, không thêm cột. F1 không redeem/tínhgiá đơn, không ghi used_count theo request, không tạo rental_orders.

## 10. Điểm user cần review

- Các U-policy trên vẫn là quyết định trước đó của user, không phải cột SQL bắt buộc. Nếu đổi policy, cập nhật decision/test theo thay đổi cụ thể; không tự đổi entity/schema.
- Entity bắt buộc map cả59 cột dù chưa có feature sửa avatar/emailVerified; không xóa cột chỉ vì endpoint không nhận field đó.
- `.env`/Supabase JDBC chỉ thay nơi lấy DB config; không thay schema và không thêm Supabase Auth.
- Chưa kết nối project Supabase thật. Bản SQL gốc khớp entity không chứng minh dữ liệu/schema/RLS đang có trên cloud đã đúng; user điền cấu hình rồi kiểm tra startup và API thực.
