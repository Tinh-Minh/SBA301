# 04 — Rà soát database cho Function 1

Nguồn phân tích ban đầu: [schema.sql nguyên trạng](reference/schema.sql), 547 dòng; [ERD](reference/car_rental_conceptual.drawio). Sau đó P02 đã kiểm chứng phần F1 trên PostgreSQL Testcontainers và được [review APPROVED](reviews/P02_REVIEW.md); **database chung/Supabase chưa được kết nối hoặc chạy SQL**. Số dòng tham chiếu bên dưới thuộc bản sao nguồn.

## 1. Ánh xạ đúng 5 bảng

| Bảng | Dòng SQL | Entity đề xuất | Audit hiện có | Ràng buộc đáng chú ý |
|---|---:|---|---|---|
| `customers` | 39–59 | `Customer` | created + updated | Email unique trên lower(email), phone unique; 2 role; KYC và status riêng |
| `user_documents` | 62–88 | `UserDocument` | created + updated | Customer FK; giấy tờ APPROVED unique theo type + number; GPLX phải có license_class |
| `drivers` | 93–100 | `Driver` | created + updated | customer_id UNIQUE; không có license number riêng |
| `bank_accounts` | 102–114 | `BankAccount` | **Chỉ created** | Unique theo customer/bank/number; tối đa một default/customer; cặp id/customer phục vụ payout |
| `vouchers` | 207–226 | `Voucher` | created + updated | Percent <= 100; used_count <= usage_limit; khoảng ngày hợp lệ |

Tổng schema: 19 bảng. Thiếu `updated_at` ở 8 bảng: bank_accounts, car_images, car_documents, action_logs, order_handovers, handover_images, dispute_evidences, reviews. Trong phạm vi của bạn chỉ sửa đề xuất cho **bank_accounts**; những bảng khác giao lại chủ function. Hai bảng ảnh car_images và handover_images còn thiếu cả created_at.

## 2. Enum phải khớp SQL

| Java enum đề xuất | Cột | Giá trị chính xác |
|---|---|---|
| `Role` | customers.role | `CUSTOMER`, `ADMIN` |
| `CustomerStatus` | customers.status | `ACTIVE`, `LOCKED` |
| `KycStatus` | customers.kyc_status | `NONE`, `PENDING`, `VERIFIED`, `REJECTED` |
| `UserDocumentType` | user_documents.doc_type | `CITIZEN_ID`, `DRIVER_LICENSE`, `PASSPORT` |
| `DocumentVerifyStatus` | user_documents.verify_status | `PENDING`, `APPROVED`, `REJECTED` |
| `DriverStatus` | drivers.status | `PENDING`, `ACTIVE`, `SUSPENDED` |
| `DiscountType` | vouchers.discount_type | `PERCENT`, `FIXED` |
| `VoucherStatus` | vouchers.status | `ACTIVE`, `INACTIVE` |

Lưu `EnumType.STRING`, không ordinal. `Role` hiện tại là enum do SQL cố định; nếu thật sự làm role động cần thay mô hình dữ liệu, không chỉ thêm endpoint. `DocumentVerifyStatus` có thể chia sẻ với F2 nếu nhóm thống nhất, nhưng không tự nhận trách nhiệm xử lý giấy tờ xe.

## 3. Phát hiện và hướng xử lý

### DB-F1-01 — BaseEntity và bank_accounts không khớp

- **Bằng chứng:** bank_accounts dòng 102–112 không có updated_at; quy ước gốc yêu cầu mọi entity có cả hai audit field.
- **Hệ quả:** entity kế thừa base đầy đủ có thể validate schema thất bại hoặc phát sinh SQL tìm cột không tồn tại.
- **Đề xuất trước đây:** bổ sung updated_at, backfill từ created_at, đặt default/not null và trigger tương ứng nếu nhóm quyết định chuẩn hóa audit.
- **Cách làm P02 sau xác nhận mới nhất:** theo đúng schema leader, map BankAccount chỉ có createdAt và dùng base phù hợp. Không tự thêm cột; migration đề xuất chỉ thực hiện khi được leader/yêu cầu mới cho phép. Đây không phải lỗi chặn mapping khi entity giữ đúng cột hiện có.
- **Lưu ý:** vòng DO tạo trigger chỉ chạy tại thời điểm chạy script; thêm cột sau đó không tự sinh trigger. Migration phải tạo trigger rõ ràng, tên không trùng.
- Không tạo patch SQL ở đợt tài liệu này; nguồn được giữ nguyên để so sánh.

### DB-F1-02 — Không có role động trong schema

- customers.role chỉ cho CUSTOMER và ADMIN. Không có roles/permissions/customer_roles.
- Đây phù hợp phạm vi người dùng vừa xác nhận. Góp ý mentor về role động là một phương án tương lai, không phải cơ sở để tăng số bảng hiện tại.
- Nếu yêu cầu mới bắt buộc role động: cần migration, seed role, cấp/revoke role, authority mapping, cập nhật JWT/authorization và regression test cho F2–F4. Ghi nhận Q-10 trước khi làm.

### DB-F1-03 — Giấy tờ hết hạn vẫn chiếm index APPROVED

- Index dòng 87–88 chỉ xét verify_status='APPROVED', không xét expires_at hoặc quyền sở hữu account.
- **Đã bảo vệ:** hai account không thể cùng có APPROVED cho cùng type/number.
- **Chưa có:** trạng thái revoked/expired/superseded; phiên bản hiện hành; cơ chế thay thế/gia hạn giấy tờ APPROVED với cùng số.
- Tạo lại một document cùng số và approve có thể xung đột cả khi thuộc cùng customer và bản cũ đã hết hạn.
- Đừng đổi bản cũ thành REJECTED để lách unique index; nghĩa nghiệp vụ bị sai. Chốt Q-03 rồi chọn sửa in-place có audit hoặc thêm mô hình hiệu lực/lịch sử có migration.
- Không đề xuất partial index phụ thuộc `now()` như cách tự động giải quyết hết hạn; hiệu lực theo thời gian cần thiết kế rõ, không phải predicate thời gian trượt trong unique index.

### DB-F1-04 — Nhiều quy tắc duyệt chưa được DB bảo vệ

SQL chưa bắt buộc `verified_by`/`verified_at` khi đã duyệt hoặc reject_reason khi từ chối. KYC summary không được tự tính trong DB; driver ACTIVE không bị CHECK kiểm tra GPLX xuyên bảng.

Service phải kiểm tra và cập nhật cùng transaction. Có thể đề xuất CHECK liên quan review metadata sau khi chốt semantics và kiểm tra dữ liệu cũ. Nếu hệ thống có writer ngoài Spring Boot, phải thống nhất writer đó dùng cùng luật hoặc bổ sung bảo vệ DB phù hợp; không khẳng định service một mình bảo vệ được mọi đường ghi.

### DB-F1-05 — Ngân hàng: default và lịch sử payout

- Partial unique index (dòng 114) bảo đảm **tối đa một** default, không bảo đảm luôn có default.
- Hai request đổi default phải khóa chung customer, clear/flush default cũ trước khi đặt default mới trong một transaction.
- FK ghép của payouts (dòng 410) bảo đảm bank account thuộc recipient. F1 không cần tạo một quan hệ payout ngược chỉ để expose ngân hàng ra API.
- FK ngăn xóa bank account đang được tham chiếu; nhưng không tự ngăn sửa số tài khoản trên row đó. Baseline đề xuất giữ thông tin nhận tiền bất biến, thêm bản ghi mới khi thay đổi.
- Cho phép bỏ chọn default, tự chọn default đầu tiên/tiếp theo, xác minh tên chủ tài khoản chưa có trong schema; Q-04.

### DB-F1-06 — Chuẩn hóa trước UNIQUE

- Email: index lower(email) không trim khoảng trắng. Service trim/lower trước cả save lẫn lookup; chưa có dữ liệu thật nên chưa xác minh có giá trị cần dọn hay không.
- Phone và số giấy tờ hiện unique/so sánh theo chuỗi thô. Chuẩn hóa phải nhất quán với cả các lần duyệt, không chỉ request ban đầu.
- Voucher code UNIQUE theo equality của schema. User chốt U-21: strip hai đầu, giữ case và so khớp exact; đề xuất uppercase ban đầu đã được thay thế. Không đổi index/collation hoặc bịa lookup không phân biệt hoa thường.
- bankName là tên tự do trong schema; không tự dùng regex/mã ngân hàng giả. Chọn catalog hoặc quy tắc tên chuẩn tại Q-08 để tránh một ngân hàng bị viết theo nhiều cách.

### DB-F1-07 — Quota voucher là điểm giao F3

- `used_count` có CHECK nhưng không tự đếm đơn và không tự bảo đảm per_user_limit.
- F1 không cho DTO sửa used_count; F3 phải có một cơ chế atomic reserve/release dùng đúng transaction của đơn.
- Admin chỉnh usage_limit đồng thời với reserve phải dùng cùng giao thức row lock/atomic update. Chỉ đọc số hiện tại rồi ghi lại không đủ chống race.
- discount_value dùng NUMERIC(14,0), nên tỷ lệ như 12.5% không nằm trong thiết kế hiện tại; không đổi scale âm thầm.
- Nếu nhóm cho sửa policy voucher đang được tham chiếu, phải xác định field nào snapshot ở đơn và xử lý giá trị lịch sử; F1 không tự chốt.

### DB-F1-08 — Delete, cascade và dữ liệu nhạy cảm

- customers có con ON DELETE CASCADE cho document/driver/bank, nhưng nhiều bảng ngoài F1 tham chiếu account. Không dùng generic delete customer.
- Nên khóa account cho nghiệp vụ quản trị hiện tại; archive/anonymize/delete dữ liệu là yêu cầu khác nếu sau này được đặt ra.
- Cột URL giấy tờ phải trỏ tới storage private theo thiết kế ứng dụng. Cột VARCHAR không chứng minh tài liệu được bảo mật.

### DB-F1-09 — Audit ứng dụng và audit nghiệp vụ khác nhau

- created_at/updated_at trả lời khi nào row thay đổi, không lưu ai đã sửa mọi trường.
- user_documents có verified_by/at cho kết quả duyệt hiện tại; customers/drivers chưa có lý do khóa/đình chỉ hoặc lịch sử hành động.
- Log kỹ thuật được lọc PII giúp chẩn đoán nhưng không tự thay thế một kho audit bền vững. Nếu rubric yêu cầu lịch sử account/admin đầy đủ, cần Q-09; không dùng bảng action_logs vốn gắn order_id của F3.

## 4. ERD và SQL

- Quan hệ customer 1→n user_documents/bank_accounts và customer 1→0..1 drivers khớp SQL.
- ERD ghi CUSTOMER số ít, SQL dùng customers; tên table vật lý theo SQL.
- ERD có node VOUCHERS nhưng chưa có edge nối rental_order với vouchers; SQL có rental_orders.voucher_id ở dòng 239. Khi vẽ lại ERD chung, bổ sung đường này với người phụ trách F3.
- ERD có một số nhãn bên ngoài F1 như TRANSATIONS bị sai chính tả; không dùng nhãn đó để sinh tên entity/table.
- Không suy luận cascade, trạng thái, index và quyền API chỉ từ đường nối ERD; SQL và yêu cầu nghiệp vụ phải được đối chiếu.

## 5. Migration và Supabase

1. P02 trích đúng 5 bảng và hạ tầng audit từ nguồn làm baseline cho PostgreSQL local/test trống. Không mặc định repo trống đồng nghĩa DB chung trống; không chạy baseline này lên Supabase chung.
2. Thống nhất một người quản lý thứ tự migration toàn nhóm. Đề xuất Flyway và `ddl-auto=validate`; không sửa một migration đã áp dụng.
3. Nếu nhóm tạo schema chung từ bản gốc, baseline phải được rà soát và chạy một lần bởi người được giao. F1 chỉ sở hữu thay đổi các bảng F1 và thành phần nền tảng được thống nhất.
4. Nếu F1 phát triển trên DB riêng, tạo migration các bảng F1 và hàm audit cần thiết theo thiết kế thống nhất; các phần kiểm tra tham chiếu tới F3/F4 được nghiệm thu ở môi trường tích hợp, không tạo bảng giả làm thay thành viên.
5. Script nguồn có CREATE TABLE/CREATE TRIGGER không idempotent và vòng lặp trên toàn public. Không dán/chạy lại toàn file trên DB đang có dữ liệu.
6. Vòng tạo trigger audit và bật RLS cho toàn public nên được thay bằng danh sách bảng ứng dụng rõ ràng trong migration được duyệt; tránh ảnh hưởng bảng khác cùng schema.
7. Không commit mật khẩu Supabase, JWT key, storage key. Dùng biến môi trường hoặc file local được ignore; example chỉ chứa placeholder.

RLS bật mà không có policy sẽ từ chối truy cập cho role chịu RLS; chủ bảng thường bỏ qua RLS, superuser/BYPASSRLS cũng có quyền vượt qua. Vì vậy việc Spring kết nối bằng user đặc quyền không tạo ra phân quyền từng customer. Phải xác định runtime role/grant/policy thật và vẫn kiểm tra quyền ở backend. [Nguồn PostgreSQL về RLS](https://www.postgresql.org/docs/15/ddl-rowsecurity.html).

## 6. Hạng mục schema của F1 trước khi tích hợp

| Hạng mục | Mức cần thiết | Phụ thuộc |
|---|---|---|
| bank_accounts.updated_at + backfill + trigger | Đề xuất chờ leader; P02 giữ schema và chỉ createdAt | Nếu nhóm cho phép thay đổi audit |
| Rà soát normalizing email/phone/doc/voucher code | Cần trước ghi dữ liệu thật | Q-08 và kiểm tra dữ liệu có sẵn |
| CHECK metadata sau duyệt | Đề xuất bổ sung | Semantics duyệt Q-02/Q-03 |
| Index duyệt: user_documents(status, created_at, id), drivers(status, id), vouchers(status, thời gian) | Chỉ thêm khi query/plan chứng minh cần | API danh sách và dữ liệu thật; tránh trùng index |
| Mô hình gia hạn/thu hồi giấy tờ | Chưa làm trong baseline | Q-03 |
| Audit admin bền vững | Chưa làm trong baseline | Q-09 |
| Role động | Ngoài phạm vi hiện tại | Yêu cầu mở rộng Q-10 |

Chưa có thay đổi schema nào trong bảng trên được áp dụng vào database trong lượt lập tài liệu này.
