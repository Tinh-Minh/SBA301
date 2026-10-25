# 06 — Kế hoạch thực hiện Function 1

Kế hoạch cho lần triển khai tiếp theo, không phải danh sách đã hoàn thành. Thứ tự ưu tiên là dựng nền tảng → hoàn thành từng use case → kiểm tra điểm giao. Chỉ cần làm rõ Q-* khi bắt đầu phần phụ thuộc.

Từ yêu cầu giao việc từng lượt ngày 2026-10-13, kế hoạch này được chia thành [10 prompt](08_PROMPT_ROADMAP.md). P01 làm khung Web MVC và HTTP dùng chung; P02 thêm database/entity/migration; P03 thêm Security/JWT/CORS. M4 được tách upload và duyệt KYC để review riêng. M0–M8 vẫn là các mốc nghiệp vụ tổng thể; số prompt không tương đương số mốc.

## M0 — Chốt baseline kỹ thuật và quyền sở hữu migration

**Việc làm:** xác nhận vẫn ở folder Desktop/nhánh BE; đọc working tree; thống nhất phiên bản nguồn Java 21/Boot 4.0.8; kiểm tra JDK/Maven khả dụng; xác định DB mới hay đã tồn tại; người quản lý migration chung; nội dung API/DTO dùng chung với nhóm.

**Đầu ra:** quyết định môi trường và kế hoạch migration; config example không có secret; xác nhận phần việc chỉ 5 bảng F1. Không cần quyết định vòng đời đơn thuê để làm bước này.

**Đạt khi:** biết schema thực tế lấy từ đâu, quy trình tạo admin ở môi trường dev, key JWT và cấu hình CORS sẽ được cung cấp bằng cách nào. Giá trị chưa có được ghi placeholder, không bịa thành cấu hình production.

## M1 — Scaffold và nền tảng database

**Thứ tự:**

1. Tạo Maven Spring Boot app và wrapper theo Java 21/Boot 4.0.8; dùng dependency BOM tương thích. Dependency dự kiến: web MVC, validation, JPA, security, OAuth2 resource server/JWT, PostgreSQL, migration, Lombok; chọn chính xác artifact Boot 4 khi scaffold.
2. Tạo cấu hình môi trường, `.gitignore`, `application-local.properties.example` không có credential; inject Clock theo giờ VN.
3. P02 trích baseline F1 đúng schema leader để chạy trên PostgreSQL cô lập; migration database chung do leader phối hợp. Đề xuất bank_accounts.updated_at có backfill/trigger chưa được giao thực hiện; map hiện trạng bằng base phù hợp.
4. Map đúng 5 entity F1 và enums; base entity không nhận cột chưa tồn tại. Bật schema validation.
5. Tạo ApiResponse/PageResponse/ErrorCode/AppException/handler; thống nhất HTTP và validation.

**Đầu ra:** ứng dụng tối thiểu khởi động với DB phát triển hợp lệ, migration và mapping F1 có thể tái lập. Không tạo controller/service rỗng cho F2–F4.

**Kiểm tra phù hợp P02:** baseline trên DB test trống, chạy lại qua Flyway history không mất dữ liệu; audit 4 bảng đầy đủ và bank chỉ created_at; mapping enum/identity và constraint thật. Backfill updated_at chỉ kiểm tra khi migration đó được giao sau này; không dùng H2 để xác nhận partial unique/RLS/trigger PostgreSQL.

## M2 — Register, login, JWT và phân quyền

**Việc làm:** AuthService/interface/implementation, DTO register/login, PasswordEncoder, authentication manager, token encoder/decoder, CurrentAccount, security filter chain, method security, CORS và handler 401/403.

**Luồng đạt được:** đăng ký CUSTOMER → đăng nhập → dùng access token truy cập `/customers/me` → tài khoản bị khóa không dùng token cũ tiếp tục truy cập.

**Các ca kiểm tra trọng yếu:**

- Đăng ký hợp lệ; password không lưu plaintext hoặc xuất hiện trong response/log.
- Email khác hoa thường/space chuẩn hóa và phone trùng; hai đăng ký đồng thời cùng email chỉ tạo một account.
- Gửi role=ADMIN/status/kyc trong request không thể tăng quyền.
- Login sai, account khóa, token giả chữ ký, sai audience/issuer, hết hạn đều bị từ chối đúng HTTP.
- CUSTOMER gọi admin endpoint nhận 403; lỗi security cùng envelope, không HTML mặc định.
- CORS cho đúng origin và preflight; origin khác không được cấp quyền trình duyệt. Kiểm tra đồng thời API vẫn bảo vệ authentication vì CORS không phải cơ chế khóa server.

**Q liên quan:** Q-01 (giá trị môi trường/bootstrap). Không tự thêm refresh/OTP để hoàn tất M2.

## M3 — Hồ sơ và quản trị tài khoản

**Việc làm:** CustomerService, sửa hồ sơ bằng allowlist, query admin có filter/page, command khóa/mở với transition; cấm xóa cứng qua CRUD chung.

**Ca kiểm tra:** sửa profile không đổi role/status/audit/emailVerified; xử lý PATCH bỏ qua field khác NULL; ngày sinh tương lai; phân trang/sort sai; tài khoản A không truy cập được dữ liệu riêng của B qua URL; quy tắc bảo vệ admin cuối cùng sau khi đã chốt.

**Đầu ra:** hồ sơ cá nhân và quản lý account với quyền rõ; API không lộ passwordHash hoặc tập giấy tờ/ngân hàng liên quan.

## M4 — Upload, duyệt giấy tờ và KYC

**Trạng thái:** P01–P09 APPROVED theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md), R1 CLOSED. P10 đã triển khai đủ 9 bước và READY_FOR_REVIEW; xem [report](reports/P10_REPORT.md) và [acceptance matrix](18_FUNCTION_1_ACCEPTANCE.md). Schema/U-19/U-20/U-21 giữ; reviewer chưa nghiệm thu cuối.

P06 cung cấp strict `PATCH /api/user-documents/{id}/review`, PENDING→APPROVED/REJECTED, actor/status DB recheck, shared advisory→actor→owner→document lock order, exact partial-index handling, stored-image checks, snapshot cùng transaction, current KYC aggregate reads theo Clock, after-commit safe logging. U-11/U-12/U-13 là user-confirmed; expiry boundary, terminal409, owner-locked review, KYC precedence/unique handling là baseline kỹ thuật được ghi trong [P06 contract](13_DOCUMENT_REVIEW_KYC.md). P06 không tự đổi driver; P07 hiện triển khai riêng.

**Ca kiểm tra P05 đã thêm:**

- Hồ sơ hợp lệ qua multipart HTTP/PostgreSQL; duplicate/unknown parts, thiếu licenseClass, ngày sai, file quá lớn và MIME/type mismatch bị từ chối.
- Account A không đọc metadata/ảnh giấy tờ B; ADMIN ACTIVE có thể list/detail/download hồ sơ của customer bị LOCKED.
- Row mới PENDING, reviewer fields NULL; KYC/account/profile/driver không đổi; summary mask số giấy tờ.
- Filesystem temporary root thật; rollback definite cleanup receipt; UNKNOWN giữ receipt để tránh xóa file DB có thể đã commit. Locator `private-local` không phải URL public.

P06 HTTP/PostgreSQL tests kiểm chứng review race,unique constraint,current KYC,rollback và row-lock timeout. Original upload/review case chỉ overlap trong file stage rồi metadata chạy tuần tự; P06-FIX-01 bổ sung transaction upload holder, HTTP review waiter được chứng minh qua `pg_blocking_pids`, rồi KYC PENDING sau commit. Positive safe diagnostics cho caught server/dependency/index failures có sentinel privacy assertions. History/renewal/revoke/driver vẫn ngoài scope.

**Đầu ra P05:** nhận hồ sơ PENDING và truy xuất an toàn. Duyệt/từ chối chờ P06; gia hạn/thu hồi giấy tờ APPROVED chỉ làm nếu Q-03 được mở rộng.

## M5 — Driver profile

**Trạng thái M5:** P07 APPROVED/R1 CLOSED theo [review FIX-01](reviews/P07_FIX_01_REVIEW.md). API profile/create/list/status/current eligibility, one-query projection và internal F2 interface giữ U-14/U-15/schema. Reviewer 126/126 và same-helper probe xác nhận Java strip parity; [reports](reports/P07_FIX_01_REPORT.md) giữ lịch sử.

**Ca kiểm tra:** tạo trùng profile; ACTIVE khi chưa có GPLX/đang PENDING/REJECTED/hết hạn; biên ngày hết hạn bằng Clock cố định; account bị khóa; suspend/reactivate; KYC identity VERIFIED nhưng không có GPLX vẫn không đủ điều kiện lái.

**Đầu ra:** hồ sơ tài xế quản lý được; F2 có `DriverEligibilityService.evaluateForCustomer(customerId)` snapshot để kiểm tra tại action, không có code gán xe trong F1. P08 triển khai bank account owner-scoped; P09 tiếp tục triển khai voucher admin.

## M6 — Tài khoản ngân hàng

**Trạng thái M6:** P08 APPROVED theo [review](reviews/P08_REVIEW.md). Giữ U-16/U-17/U-18, masked owner-only API, shared locks/rollback/FK/internal F4 snapshot và schema.

**Việc làm:** thêm bank account của chính mình, che số ở response, đổi default có row lock/flush, chính sách immutable thông tin nhận tiền, xóa khi không được tham chiếu theo Q-04.

**Ca kiểm tra:** số 0 đầu được giữ; trùng customer/bank/number; giả customerId; truy cập chéo; hai request đổi default đồng thời vẫn tối đa một default; transaction lỗi không mất trạng thái trước đó; delete bank account có payout bị 409.

Ca referenced delete chạy ở Testcontainer riêng với test-only composite FK fixture đúng leader hoặc schema tích hợp cô lập. Không dùng DB chung, thêm production migration/entity/module payout hoặc gọi fixture đó là full F4 đã test.

**Đầu ra:** quyền và default đúng; hợp đồng `requireOwnedBankAccount` đủ cho F4, không triển khai payout.

## M7 — Voucher admin

**Trạng thái M7:** P09 APPROVED/R1 CLOSED theo [review FIX-01](reviews/P09_FIX_01_REVIEW.md), sau reviewer 144/144/packaging/Boot/health/probe. Exact decimal ingress/latest counter/locks/ADMIN/U-19/U-20/U-21/schema giữ; reports/reviews gốc giữ lịch sử.

**Ca kiểm tra:** CUSTOMER bị từ chối; phần trăm >100/âm/số lẻ VND; ngày đảo; usageLimit nhỏ hơn usedCount; quota NULL không giới hạn; maxDiscount=0 giữ đúng nghĩa; client không ghi usedCount; hai thao tác quota cùng lúc không làm hỏng dữ liệu.

**Điểm giao:** P09 kiểm chứng admin update/status chờ counter writer JDBC tổng hợp, đọc latest count và không overwrite. F3 chủ trì meaning used_count/reserve-release/per-user/price, lock order và order snapshot; full reservation integration chỉ khi F3 có code. Không gọi fixture counter là full F3 đã test.

**Đầu ra:** admin quản lý được voucher; không có API apply-voucher/order trong commit F1.

## M8 — Hoàn thiện và bàn giao

**P10 CHANGES_REQUESTED; P10-FIX-01 READY_FOR_REVIEW:** P10 đã triển khai 9 bước bàn giao; fix đồng bộ spec/docs/regressions với runtime đã duyệt, full verify 150/150 và packaging PASS. Xem [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md), cùng [FE/F2/F3/F4 handoff](17_FUNCTION_1_HANDOFF.md) và [acceptance matrix](18_FUNCTION_1_ACCEPTANCE.md). R1/R2 chờ reviewer; chưa nghiệm thu toàn F1.

- Kiểm tra một vòng luồng liên kết: tạo account → login → hồ sơ → gửi giấy tờ → admin duyệt → đăng ký/kích hoạt driver → thêm/đổi ngân hàng → admin tạo/quản lý voucher.
- Ghi OpenAPI 3.1 JSON tĩnh và request mẫu cho FE, gồm multipart/binary/error/security; kiểm tra parity với actual MVC mappings và response examples. Không thêm Swagger runtime/dependency để hoàn thành P10.
- Thống nhất format ID, thời gian VN, role, API envelope, error code với nhóm.
- Bàn giao F2 eligibility; F3 account/KYC + định nghĩa voucher; F4 ownership bank account. Mọi DTO giao tiếp chỉ chứa dữ liệu cần dùng.
- Kiểm tra Git diff/secret/config, migration order và docs. Không đánh dấu các phần stub/mock là hoàn thành tích hợp thật.

## Ma trận nghiệm thu tối thiểu

| Mã | Luật phải bảo vệ | Nơi kiểm tra |
|---|---|---|
| AC-01 | Registration chỉ sinh CUSTOMER, unique email/phone bền vững | Service + PostgreSQL integration |
| AC-02 | JWT và account khóa được kiểm tra đúng | Security integration |
| AC-03 | Ownership cho document/driver/bank và phân trang có scope | API integration bằng ít nhất hai account |
| AC-04 | P06 review/KYC cùng transaction,afterCommit logs,actual upload-holder/review-waiter visibility | APPROVED theo reviewer 106/106,diagnosticprobe và PostgreSQLcontention |
| AC-05 | GPLX hợp lệ tại thời điểm kiểm tra, không chỉ dựa status lưu | P07 APPROVED/R1 CLOSED; Java strip parity, current policy và actual HTTP/PostgreSQL probe đạt |
| AC-06 | Tối đa một default/customer, không sửa nhầm người khác | PostgreSQL concurrency + API |
| AC-07 | Voucher admin không ghi usedCount và không hạ quota sai | Service + DB; phối hợp F3 khi tích hợp |
| AC-08 | File riêng tư và lỗi upload được xử lý | Storage adapter + API |
| AC-09 | Audit khớp DB, không lộ PII/secret qua response/log | Mapping/response review và kiểm tra phù hợp |

Không viết test chỉ cho getter/setter hoặc lặp implementation. Evidence AC-01–AC-09 của P10 và giới hạn hiện tại nằm trong [acceptance matrix](18_FUNCTION_1_ACCEPTANCE.md) và [report](reports/P10_REPORT.md). READY_FOR_REVIEW không đồng nghĩa reviewer đã nghiệm thu toàn F1.
