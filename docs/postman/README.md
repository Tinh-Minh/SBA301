# Postman — Function 1

Bộ sưu tập bổ sung cho Function 1 đã được nghiệm thu ở P01–P10. Đây là **READY_FOR_REVIEW** cho P11; collection chưa được reviewer phê duyệt và không chứng minh production readiness hay Function 2–4.

## Tệp và cấu hình người chạy

- Import [`SBA301_Function1.postman_collection.json`](SBA301_Function1.postman_collection.json) theo Collection v2.1 JSON.
- Chọn **No Environment**. Nếu cần environment để thay `baseUrl`, `adminEmail`, `adminPassword`, chỉ tạo đúng ba biến cấu hình đó; không tạo biến `p11_*` trong Environment/Globals vì có thể làm token/ID cũ ghi đè dữ liệu runtime.
- Mở collection → Variables và nhập:
  - `baseUrl`: mặc định `http://127.0.0.1:8080`.
  - `adminEmail`, `adminPassword`: credential của **ADMIN test đã provision**. Hai giá trị mặc định để trống. Không dùng credential production và không export/share runtime values.
- Customer, peer, mật khẩu synthetic, run ID, mã giấy tờ/voucher, token và mọi resource ID đều sinh/lấy tự động khi chạy. Không cần CSV, data JSON hay environment JSON để chạy luồng Postman Desktop.

## Backend chạy với Supabase cần sẵn sàng

Collection gọi backend thật. Trước khi chạy:

1. Làm theo [Supabase setup](../SUPABASE_SETUP.md): dùng project/database test có schema đúng bản leader đã giao. Collection tạo và sửa dữ liệu thật; không chạy toàn collection trên dữ liệu production hoặc database nhóm chưa thống nhất dùng để test. Không tự chạy baseline SQL lên Supabase.
2. Điền `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` trong `.env` tại repository root. Script `scripts/setup-supabase.ps1` tạo key JWT và private storage ngoài repo, giữ cấu hình đã có. Profile `supabase` tự đọc `.env`; schema chỉ được validate, ứng dụng không tự migrate schema. Chi tiết JWT/storage/CORS ở hướng dẫn setup.
3. Nếu database test chưa có ADMIN, dùng bootstrap ADMIN có sẵn (`BOOTSTRAP_ADMIN_ENABLED=true` và `BOOTSTRAP_ADMIN_FULL_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PHONE`, `BOOTSTRAP_ADMIN_PASSWORD`) **chỉ trong lần khởi tạo identity mới**. Điền trong `.env` ignored, không ghi password vào source/collection/report. Sau khi tạo ADMIN, đặt bootstrap `false` và restart app. Không đăng ký CUSTOMER rồi promote, reset hoặc mở khóa tài khoản đã có. Nếu đã có ADMIN ACTIVE test thì dùng tài khoản đó.
4. Dùng Java 21, chọn IntelliJ configuration **SBA301 Supabase**, working directory là repository root; hoặc chạy PowerShell `.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=supabase'` tại root. Giữ backend chạy trong khi dùng Postman. Cách chạy này không cần Docker/PostgreSQL local; Docker dành cho regression Testcontainers riêng.

`GET /api/health` trả `data.status=UP` để xác nhận web process đang chạy; đây không phải readiness check cho PostgreSQL, JWT key hay storage. Khi request cần các dependency ấy, xử lý lỗi theo trace ID trả về.

## Fixtures và working directory

Collection có file upload thật, chỉ là ảnh tổng hợp 96×64, không chứa giấy tờ cá nhân:

- `fixtures/synthetic-front.png`
- `fixtures/synthetic-back.png`
- `fixtures/synthetic-front.jpg`
- `fixtures/synthetic-back.jpg`
- `fixtures/not-an-image.txt` — dùng cho negative upload.

Trong Postman Desktop đặt **Settings → General → Working Directory** là thư mục `<repository>/docs/postman`. Các file upload trong form-data dùng path tương đối dưới đó. Không upload collection/fixtures lên cloud workspace. Nếu bản Postman đang dùng không resolve path tự động, mở từng request upload và chọn fixture trong thư mục đi kèm, sau đó kiểm tra lại đủ `frontImage`/`backImage` trước khi chạy.

## Chạy theo thứ tự

1. Mở Collection Runner, chạy toàn collection từ folder đầu tới cuối, một iteration. Không chỉ chọn folder con khi cần flow đầu-cuối. Dùng Postman Desktop/local agent để file đính kèm đọc được.
2. Request `00. Khởi tạo dữ liệu và health` tạo `runId` mới, dữ liệu thời gian theo `Asia/Ho_Chi_Minh`, password/email/phone và code duy nhất cho lượt đó. Request tiếp theo đăng nhập ADMIN, đăng ký CUSTOMER và peer qua API, lấy token/ID vào Collection runtime variables.
3. Giữ local variable values khi Runner hỏi. Không share/export collection sau khi đã chạy vì runtime variables chứa bearer token. Script sẽ dừng sớm nếu chưa khởi tạo flow, thiếu ADMIN config hoặc phát hiện `p11_*` trùng Environment/Globals.
4. Các request cần có owner/token chạy sau phần đăng ký/đăng nhập; binary file requests chạy sau upload. Muốn chạy riêng một request, trước hết chạy các request prerequisite tương ứng và không xóa runtime variables của lượt hiện tại.
5. Chạy lại toàn collection để sinh `runId`/dữ liệu mới. Dữ liệu synthetic được giữ lại trong DB và private storage để người dùng quan sát; flow không chạy SQL cleanup. Cuối flow CUSTOMER được unlock lại bằng admin command; ADMIN không bị khóa. Một bank account unreferenced bị xóa theo chính API; các resource còn lại được giữ.

Runner lỗi setup ADMIN: kiểm tra `adminEmail`/`adminPassword` có phải tài khoản ADMIN ACTIVE đã provision. Lỗi file: kiểm tra Working Directory và `src` của `frontImage`/`backImage`. Lỗi 401: kiểm tra ADMIN/customer đã active, clock/token expiry và chạy lại từ đầu để tạo token mới. Ghi lại trace ID, không gửi token/password.

## Coverage và kết quả kỳ vọng

Collection có **112 request/scenario** trong 7 folder, bao phủ đủ 32 method/path của OpenAPI. Mỗi API operation trong bảng có ít nhất một request positive có script kiểm tra status/code/envelope/trace; request negative là kịch bản bổ sung. Mọi JSON response kiểm tra `X-Request-ID == traceId`; success còn kiểm tra `Cache-Control: no-store` ở route bảo đảm header này. Binary download kiểm tra HTTP, ảnh có bytes, media type, attachment, nosniff, no-store và request ID mà không parse ảnh như JSON.

| Method / route | Request positive | Actor | Expected |
|---|---|---|---|
| GET `/api/health` | 00. Khởi tạo dữ liệu và health | Public | 200 `OK`, `UP` |
| POST `/api/auth/register` | 10. Đăng ký CUSTOMER chính; 14. Đăng ký peer CUSTOMER | Public | 201 `OK`, CUSTOMER ACTIVE |
| POST `/api/auth/login` | 01. ADMIN; 11. Customer; 15. Peer | Public | 200 `OK`, token/role đúng |
| GET `/api/customers/me` | 02, 16, 120, 124, 128 | ADMIN/CUSTOMER | 200 `OK`, owner/status đúng |
| PATCH `/api/customers/me` | 17, 18, 20 | CUSTOMER | 200 `OK`; 300 ký tự/null được xử lý đúng |
| GET `/api/customers/me/kyc` | 22, 50 | CUSTOMER | 200 `OK`; sau review current KYC `VERIFIED` |
| GET `/api/customers` | 23 | ADMIN | 200 `OK`, page/filter |
| GET `/api/customers/{id}` | 24 | ADMIN | 200 `OK` |
| GET `/api/customers/{id}/kyc` | 25 | ADMIN | 200 `OK` |
| PATCH `/api/customers/{id}/status` | 125, 127 | ADMIN | 200 `OK`, LOCKED rồi ACTIVE |
| POST `/api/user-documents` | 30, 31 | CUSTOMER | 201 `OK`, PENDING + ảnh thật |
| GET `/api/user-documents` | 36, 37 | CUSTOMER/ADMIN | 200 `OK`, scope/filter/page |
| GET `/api/user-documents/{id}` | 38 | Owner | 200 `OK` |
| GET `/api/user-documents/{id}/files/{side}` | 40, 41 | Owner/ADMIN | 200 binary; front PNG/back JPEG |
| PATCH `/api/user-documents/{id}/review` | 48, 49 | ADMIN | 200 `OK`, passport/GPLX APPROVED |
| POST `/api/drivers` | 60 | CUSTOMER | 201 `OK`, stored PENDING |
| GET `/api/drivers` | 63 | ADMIN | 200 `OK`, page/filter |
| GET `/api/drivers/me` | 62 | CUSTOMER | 200 `OK` |
| GET `/api/drivers/me/eligibility` | 67; 69a sau activation | CUSTOMER | 200 `OK`; KYC/GPLX hợp lệ nhưng stored PENDING → false; ACTIVE → true |
| GET `/api/drivers/{id}` | 65 | Owner | 200 `OK` |
| GET `/api/drivers/{id}/eligibility` | 68; 69b sau activation | Owner | 200 `OK`, current eligibility; false khi PENDING, true khi ACTIVE |
| PATCH `/api/drivers/{id}/status` | 69, 71, 73 | ADMIN | 200 `OK`, ACTIVE→SUSPENDED→ACTIVE |
| POST `/api/bank-accounts` | 80, 81 | CUSTOMER | 201 `OK`, omitted default=false / explicit default=true |
| GET `/api/bank-accounts` | 83, 90 | CUSTOMER | 200 `OK`, masked, default count checked |
| GET `/api/bank-accounts/{id}` | 84 | Owner | 200 `OK`, full number absent |
| DELETE `/api/bank-accounts/{id}` | 89 | Owner | 200 `OK`, `data:null` |
| PATCH `/api/bank-accounts/{id}/default` | 87, 88 | CUSTOMER | 200 `OK`, body/query trống, no-op |
| POST `/api/vouchers` | 100, 101 | ADMIN | 201 `OK`, FIXED/PERCENT; usedCount=0 |
| GET `/api/vouchers` | 104 | ADMIN | 200 `OK`, exact-code/type/status/window filter |
| GET `/api/vouchers/{id}` | 103 | ADMIN | 200 `OK` |
| PUT `/api/vouchers/{id}` | 105 | ADMIN | 200 `OK`, hai field mutable, counter giữ0 |
| PATCH `/api/vouchers/{id}/status` | 114, 115 | ADMIN | 200 `OK`, INACTIVE rồi ACTIVE |

Negative requests bổ sung bao gồm auth 401, role 403, owner foreign 404, ID invalid/không tồn tại, framework 405/415, unknown body/query và duplicate query, profile length/null, thiếu licenseClass, file text giả ảnh, document not approvable/self-review/terminal, driver duplicate/conditional reason/invalid enum, bank duplicate/foreign/wrong type/unknown field, voucher duplicate/fractional/near-integer/PERCENT101/quota 0/1.0/1e0/timestamp/PUT allowlist, và lock/unlock account.

### Các kiểm tra cần điều khiển riêng

Không chạy trong workflow Postman thường: storage disabled → 503; upload vượt giới hạn → 413; PostgreSQL lock contention/concurrency, last ACTIVE ADMIN, JWT expiry/clock skew và bank account bị tham chiếu bởi payout. Chúng là **MANUAL/NOT_RUN trong collection**; dùng regression Maven/PostgreSQL hiện hữu hoặc môi trường test chuyên biệt theo report P11. Không diễn giải chúng là Postman PASS. Cũng không có apply/redeem voucher hay APIs của Function 2–4.

## Newman local (tùy chọn)

Collection v2.1 có thể chạy với Newman 6.x. Cài runner ngoài project runtime (`npm install --global newman@6`) hoặc dùng Postman Desktop. Giữ `adminEmail`/`adminPassword` trong local Postman variables; không truyền password/token trên command line, không lưu environment có credential trong repository. Đặt `--working-dir` thành `docs/postman` để Newman tìm file fixture.

Tham khảo hướng dẫn chính thức: [Postman collection schemas](https://schema.postman.com/), [Newman options và working directory](https://learning.postman.com/docs/collections/using-newman-cli/newman-options), [file upload với Newman](https://learning.postman.com/docs/collections/using-newman-cli/newman-file-uploads), [working directory trong Postman](https://learning.postman.com/docs/getting-started/installation/settings/working-directory).
