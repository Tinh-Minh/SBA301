# KẾ HOẠCH KIỂM THỬ TOÀN DIỆN (TEST PLAN)
## DỰ ÁN CAR RENTAL MARKETPLACE & SHOWCASE (Nhánh `car-slot`)

---

## 1. TỔNG QUAN HỆ THỐNG & CÁC VAI TRÒ (ROLES)

Hệ thống hoạt động theo mô hình Sàn giao dịch cho thuê xe kết hợp gói đăng tin và quy trình giao nhận xe an toàn.

### 1.1. Danh sách các vai trò (Roles & Actor Matrix)
1. **GUEST (Khách vãng lai / Chưa đăng nhập):**
   - Xem trang chủ, tìm kiếm xe, lọc danh sách xe, xem chi tiết xe (biển số và giấy tờ bị ẩn).
   - Xem báo giá thuê xe (`quote`), lịch bận (`availability`), hồ sơ an toàn tóm tắt (`safety`), đánh giá của xe (`reviews`).
   - Xem danh sách gói đăng tin công khai (`/api/packages`).
   - Đăng ký tài khoản, đăng nhập, xác minh email, gửi lại mã xác minh.
   - Nhận phản hồi thanh toán từ cổng VNPay (`/return`, `/ipn`).
   - Tải ảnh công khai (`/api/uploads/files/{name}`).

2. **CUSTOMER (Khách hàng đã đăng nhập, chưa được duyệt KYC làm Chủ xe):**
   - Quản lý hồ sơ cá nhân: đổi thông tin liên lạc (Zalo, ghi chú liên hệ), đổi mật khẩu.
   - Nộp hồ sơ danh tính (CCCD / GPLX / Hộ chiếu) kèm ảnh 2 mặt để yêu cầu xét duyệt KYC.
   - Đặt xe trực tuyến: gửi yêu cầu thuê xe cho chủ xe, xem danh sách đơn thuê của mình (`/trips`).
   - Xác nhận hoặc phản hồi biên bản bàn giao nhận xe / trả xe của chủ xe.
   - Viết đánh giá cho xe sau khi hoàn thành chuyến đi.
   - **Ràng buộc:** Bị chặn truy cập các trang `/owner/*` và các API dành riêng cho chủ xe (trả về 403 Forbidden).

3. **OWNER (Chủ xe - Đã xác minh KYC thành công và nâng cấp vai trò OWNER):**
   - Đầy đủ quyền của CUSTOMER.
   - Đăng ký xe mới (`POST /api/cars`), cập nhật thông tin xe, quản lý ảnh và giấy tờ xe.
   - Quản lý trạng thái bật/tắt hiển thị xe (`ACTIVE` <-> `INACTIVE`) cho xe đã được duyệt.
   - Mua gói đăng tin cho xe (`PKG_BASIC`, `PKG_STANDARD`, `PKG_VIP`), áp dụng mã giảm giá (voucher).
   - Thanh toán gói đăng tin qua VNPay hoặc giả lập thanh toán (khi được kích hoạt môi trường dev).
   - Quản lý yêu cầu thuê xe: liên hệ khách, chấp nhận, từ chối đơn thuê.
   - Lập và chỉnh sửa biên bản bàn giao nhận xe (pickup) và trả xe (return) kèm 7 góc ảnh hiện trạng xe.
   - Quản lý hồ sơ an toàn xe: đăng kiểm, bảo hiểm, nhật ký bảo dưỡng, sửa chữa.
   - Xem Dashboard chủ xe và giao dịch gói tin.

4. **ADMIN (Quản trị viên toàn hệ thống):**
   - Quản lý người dùng: xem danh sách tài khoản, khóa/mở khóa (`ACTIVE` <-> `SUSPENDED`), đổi vai trò tài khoản.
   - Xét duyệt KYC người dùng: duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) giấy tờ tuỳ thân; tự động nâng cấp khách hàng lên `OWNER` khi duyệt căn cước hợp lệ.
   - Xét duyệt xe: duyệt (`ACTIVE`) hoặc từ chối (`REJECTED`) kèm lý do đối với xe chủ xe gửi duyệt.
   - Xét duyệt giấy tờ xe và hồ sơ an toàn của xe (đăng kiểm, bảo hiểm).
   - Quản lý cấu hình gói cước đăng tin (`listing_packages`): tạo mới, cập nhật giá, số ngày hiển thị, trạng thái.
   - Quản lý mã giảm giá (Vouchers): tạo voucher, kích hoạt/ngừng kích hoạt, giới hạn số lượt và tỷ lệ giảm.
   - Giám sát toàn bộ đơn thuê xe, giao dịch thanh toán gói, và kiểm duyệt/gỡ đánh giá vi phạm.
   - Xem báo cáo doanh thu và bảng số liệu quản trị.

---

## 2. BẢN ĐỒ GIAO DIỆN (FRONTEND PAGES & ROUTES)

| Nhóm | Đường dẫn (URL) | Component Page | Vai trò cho phép | Chức năng chính |
|---|---|---|---|---|
| **Public** | `/` | `HomePage` | All | Trang chủ, banner tìm kiếm xe, danh sách xe nổi bật VIP |
| **Public** | `/explore` | `ExploreCarsPage` | All | Tìm kiếm xe với bộ lọc địa điểm, hãng, loại xe, số chỗ, giá, ngày giờ |
| **Public** | `/cars/:id` | `CarDetailPage` | All | Xem chi tiết thông số xe, giá, đánh giá, an toàn, đặt xe |
| **Public** | `/packages` (alias `/pricing`) | `PackagePricingPage` | All | Giới thiệu 3 gói đăng tin (Cơ bản, Tiêu chuẩn, VIP) |
| **Public** | `/login` | `LoginPage` | All | Đăng nhập bằng Email & Mật khẩu |
| **Public** | `/register` | `RegisterPage` | All | Đăng ký tài khoản cá nhân mới |
| **Public** | `/verify-email` | `VerifyEmailPage` | All | Xác minh tài khoản bằng mã gửi về email |
| **Public** | `/payment/success` | `PaymentSuccessPage` | All | Thông báo kết quả thanh toán VNPay thành công |
| **Public** | `/payment/failed` | `PaymentFailedPage` | All | Thông báo kết quả thanh toán VNPay thất bại / hủy |
| **Customer** | `/account` | `ProfilePage` | CUSTOMER, OWNER, ADMIN | Xem và cập nhật thông tin cá nhân, số điện thoại Zalo, đổi mật khẩu |
| **Customer** | `/account/verification` | `VerificationPage` | CUSTOMER, OWNER, ADMIN | Tải lên giấy tờ tùy thân (CCCD/GPLX/Hộ chiếu) để xác minh KYC |
| **Customer** | `/trips` (alias `/account/orders`) | `MyTripsPage` | CUSTOMER, OWNER | Quản lý danh sách các chuyến đi / đơn thuê của khách hàng |
| **Customer** | `/trips/:id` (alias `/orders/:id`) | `TripDetailPage` | CUSTOMER, OWNER, ADMIN | Chi tiết đơn thuê, thông tin chủ xe, xác nhận biên bản bàn giao xe |
| **Customer** | `/my-trips` (alias `/reviews`) | `MyReviewsPage` | CUSTOMER, OWNER | Xem các đánh giá của bản thân đã gửi |
| **Customer** | `/payment` | `PaymentPage` | CUSTOMER, OWNER | Trang tiến hành thanh toán |
| **Owner** | `/owner/dashboard` | `OwnerDashboardPage` | OWNER | Bảng điều khiển chủ xe: tổng quan doanh thu, xe, đơn thuê |
| **Owner** | `/owner/vehicles` | `OwnerVehiclesPage` | OWNER | Danh sách xe của chủ, trạng thái duyệt, bật/tắt hiển thị xe |
| **Owner** | `/owner/vehicles/new` | `OwnerVehicleNewPage` | OWNER (Verified) | Đăng ký thông tin và tải ảnh, giấy tờ cho xe mới |
| **Owner** | `/owner/vehicles/edit/:id` | `OwnerVehicleEditPage` | OWNER (Owner của xe) | Chỉnh sửa thông tin giá, mô tả, tiện ích của xe |
| **Owner** | `/owner/vehicles/:id/overview` | `OwnerCarOverviewPage` | OWNER (Owner của xe) | Theo dõi chi tiết, hồ sơ an toàn, nhật ký bảo dưỡng theo từng xe |
| **Owner** | `/owner/calendar` | `OwnerCalendarPage` | OWNER | Lịch bận và lịch hiển thị tin đăng |
| **Owner** | `/owner/subscriptions` | `MySubscriptionsPage` | OWNER | Quản lý lịch sử các gói đăng tin đã mua, hủy yêu cầu chưa trả |
| **Owner** | `/owner/subscriptions/new` | `BuySubscriptionPage` | OWNER | Chọn xe, chọn gói tin, nhập voucher và tạo đơn mua |
| **Owner** | `/owner/subscriptions/:id` | `SubscriptionDetailPage` | OWNER | Xem trạng thái gói, lấy link VNPay hoặc giả lập thanh toán |
| **Owner** | `/owner/bookings` (alias `/owner/requests`) | `OwnerBookingsPage` | OWNER | Danh sách đơn khách đặt xe, xác nhận liên hệ, duyệt/từ chối, lập biên bản |
| **Owner** | `/owner/payouts` | `OwnerPayoutsPage` | OWNER | Danh sách lịch sử giao dịch nộp tiền mua gói tin |
| **Admin** | `/admin/dashboard` | `AdminDashboardPage` | ADMIN | Bảng điều khiển quản trị, doanh thu toàn sàn |
| **Admin** | `/admin/users` | `AdminUsersPage` | ADMIN | Quản lý người dùng, khóa tài khoản, đổi role, duyệt/từ chối KYC |
| **Admin** | `/admin/vehicles` | `AdminVehiclesPage` | ADMIN | Duyệt xe mới, từ chối xe vi phạm, xác minh giấy tờ xe |
| **Admin** | `/admin/bookings` | `AdminBookingsPage` | ADMIN | Giám sát tất cả đơn thuê xe trên toàn hệ thống |
| **Admin** | `/admin/safety` | `AdminSafetyPage` | ADMIN | Duyệt hồ sơ an toàn (đăng kiểm, bảo hiểm) của các xe |
| **Admin** | `/admin/vouchers` | `AdminVouchersPage` | ADMIN | Quản lý mã giảm giá: tạo mới, cập nhật số lượng, kích hoạt |
| **Admin** | `/admin/packages` | `AdminPackagesPage` | ADMIN | Quản lý bảng cấu hình 3 gói đăng tin sàn |
| **Admin** | `/admin/subscriptions` | `AdminSubscriptionsPage`| ADMIN | Theo dõi tất cả gói tin đã mua trên hệ thống |
| **Admin** | `/admin/payouts` | `AdminPayoutsPage` | ADMIN | Quản trị giao dịch và thanh toán |
| **Admin** | `/admin/reviews` | `AdminReviewsPage` | ADMIN | Kiểm duyệt và xóa đánh giá rác / khiếu nại |

---

## 3. DANH SÁCH TOÀN BỘ API ENDPOINTS (BACKEND REST API)

### 3.1. Phân hệ Xác thực & Tài khoản (`AuthController`, `CustomerController`)
- `GET /api/health` — [Public] Kiểm tra tình trạng backend.
- `POST /api/auth/register` — [Public] Đăng ký tài khoản (họ tên, email, sđt, mật khẩu).
- `POST /api/auth/login` — [Public] Đăng nhập nhận JWT Access Token.
- `POST /api/auth/verify-email` — [Public] Xác minh email qua token/mã.
- `POST /api/auth/resend-verification` — [Public] Gửi lại mã xác minh.
- `POST /api/auth/logout` — [Authenticated] Đăng xuất.
- `POST /api/auth/change-password` — [Authenticated] Đổi mật khẩu.
- `GET /api/customers/me` — [Authenticated] Xem thông tin cá nhân tài khoản hiện tại.
- `GET /api/customers/me/kyc` — [Authenticated] Xem tình trạng xác minh KYC cá nhân.
- `PATCH /api/customers/me` — [Authenticated] Cập nhật thông tin cá nhân (Zalo, ghi chú liên hệ).
- `PUT /api/customers/me` — [Authenticated] Cập nhật thông tin cá nhân (chuẩn PUT).
- `GET /api/customers` — [ADMIN] Danh sách người dùng hệ thống (tìm kiếm, phân trang, lọc theo status/role).
- `GET /api/customers/{id}` — [ADMIN] Xem thông tin chi tiết một người dùng.
- `GET /api/customers/{id}/kyc` — [ADMIN] Xem trạng thái KYC của người dùng.
- `PATCH /api/customers/{id}/status` — [ADMIN] Khóa hoặc mở khóa tài khoản người dùng (`ACTIVE` / `SUSPENDED`).
- `PATCH /api/customers/{id}/role` — [ADMIN] Thay đổi vai trò người dùng (`CUSTOMER` <-> `OWNER`).

### 3.2. Phân hệ Giấy tờ tùy thân & Xác minh KYC (`UserDocumentController`)
- `POST /api/user-documents` — [Authenticated] Nộp hồ sơ giấy tờ danh tính (multipart: file mặt trước, mặt sau, số giấy tờ, ngày hết hạn).
- `GET /api/user-documents` — [Authenticated] Danh sách giấy tờ cá nhân đã nộp (Admin xem được của tất cả).
- `GET /api/user-documents/{id}` — [Authenticated] Chi tiết một giấy tờ đã nộp.
- `GET /api/user-documents/{id}/files/{side}` — [Authenticated] Tải/xem ảnh giấy tờ bảo mật (chỉ chủ sở hữu hoặc Admin).
- `PATCH /api/user-documents/{id}/review` — [ADMIN] Duyệt (`APPROVED`) hoặc từ chối (`REJECTED`) giấy tờ; tự động nâng cấp vai trò `OWNER` khi CCCD hợp lệ.

### 3.3. Phân hệ Xe & Quản lý xe (`CarController`, `AdminCarController`, `CarSafetyController`)
- `GET /api/cars/search` — [Public] Tìm kiếm xe niêm yết đang hoạt động (`LISTED` + `ACTIVE`), lọc theo tỉnh thành, loại xe, hãng, giá, số chỗ, thời gian rảnh.
- `GET /api/cars/{id}` — [Public] Xem chi tiết xe (GUEST xem bản ẩn biển số, OWNER/ADMIN xem đầy đủ).
- `GET /api/cars/my-cars` — [OWNER] Danh sách xe của chủ xe đăng nhập.
- `POST /api/cars` — [OWNER Verified] Đăng ký xe mới đưa vào trạng thái chờ duyệt (`PENDING_APPROVAL`).
- `PUT /api/cars/{id}` — [OWNER] Cập nhật thông tin chi tiết xe.
- `PATCH /api/cars/{id}/status` — [OWNER] Tạm dừng/kích hoạt lại hiển thị xe (`ACTIVE` <-> `INACTIVE`) chỉ áp dụng cho xe đã duyệt.
- `POST /api/cars/{id}/images` — [OWNER] Thêm danh sách ảnh cho xe.
- `DELETE /api/cars/{id}/images/{imageId}` — [OWNER] Xóa một ảnh xe.
- `PATCH /api/cars/{id}/images/{imageId}/primary` — [OWNER] Đặt ảnh làm ảnh đại diện chính của xe.
- `POST /api/cars/{id}/documents` — [OWNER] Nộp giấy tờ xe (đăng ký xe, đăng kiểm, bảo hiểm).
- `GET /api/cars/{id}/documents` — [OWNER, ADMIN] Danh sách giấy tờ của xe.
- `GET /api/admin/cars` — [ADMIN] Danh sách xe toàn hệ thống kèm bộ lọc trạng thái duyệt.
- `POST /api/admin/cars/{id}/approve` — [ADMIN] Duyệt xe mới chuyển sang `ACTIVE`.
- `POST /api/admin/cars/{id}/reject` — [ADMIN] Từ chối duyệt xe kèm lý do.
- `PATCH /api/admin/cars/{id}/documents/{docId}/verify` — [ADMIN] Xác minh duyệt hoặc từ chối giấy tờ xe.
- `GET /api/cars/{carId}/safety` — [Public] Tóm tắt hồ sơ an toàn của xe (đăng kiểm, bảo hiểm, bảo dưỡng, số km).
- `POST /api/cars/{carId}/safety-records` — [OWNER] Thêm bản ghi an toàn (đăng kiểm, bảo hiểm, sửa chữa).
- `PUT /api/cars/{carId}/safety-records/{recordId}` — [OWNER] Cập nhật bản ghi an toàn.
- `DELETE /api/cars/{carId}/safety-records/{recordId}` — [OWNER] Xóa bản ghi an toàn.
- `GET /api/admin/safety-records` — [ADMIN] Danh sách bản ghi an toàn chờ xác minh.
- `PATCH /api/admin/cars/{carId}/safety-records/{recordId}/verify` — [ADMIN] Xác minh bản ghi an toàn.

### 3.4. Phân hệ Gói đăng tin & Voucher (`ListingPackageController`, `CarSubscriptionController`, `AdminSubscriptionController`, `VoucherController`, `VoucherCatalogController`)
- `GET /api/packages` — [Public] Danh sách các gói đăng tin đang hoạt động công khai.
- `GET /api/admin/packages` — [ADMIN] Danh sách tất cả gói cước bao gồm gói tắt kích hoạt.
- `GET /api/admin/packages/{id}` — [ADMIN] Xem thông tin cấu hình một gói cước.
- `POST /api/admin/packages` — [ADMIN] Tạo mới gói cước đăng tin.
- `PUT /api/admin/packages/{id}` — [ADMIN] Cập nhật cấu hình gói cước.
- `GET /api/subscriptions/packages` — [OWNER] Lấy danh sách gói dành cho chủ xe mua tin.
- `POST /api/subscriptions/quote` — [OWNER] Báo giá gói đăng tin (tính toán chiết khấu voucher).
- `POST /api/subscriptions` — [OWNER] Tạo yêu cầu mua gói đăng tin cho xe.
- `GET /api/subscriptions/my-subscriptions` — [OWNER] Lịch sử mua gói của chủ xe.
- `GET /api/subscriptions/{id}` — [OWNER, ADMIN] Chi tiết đơn mua gói tin.
- `POST /api/subscriptions/{id}/activate-slot` — [OWNER, ADMIN] Kích hoạt slot hiển thị tiếp theo của gói.
- `PUT /api/subscriptions/{id}/cancel` — [OWNER, ADMIN] Hủy đơn mua gói chưa thanh toán.
- `GET /api/admin/subscriptions` — [ADMIN] Danh sách gói đăng tin toàn sàn theo trạng thái.
- `GET /api/vouchers/available` — [Authenticated] Danh sách voucher khả dụng cho một gói cụ thể.
- `POST /api/vouchers` — [ADMIN] Tạo voucher khuyến mãi mới.
- `GET /api/vouchers` — [ADMIN] Danh sách voucher hệ thống.
- `GET /api/vouchers/{id}` — [ADMIN] Chi tiết một voucher.
- `PUT /api/vouchers/{id}` — [ADMIN] Cập nhật thông tin voucher.
- `PATCH /api/vouchers/{id}/status` — [ADMIN] Đổi trạng thái voucher (`ACTIVE` / `INACTIVE`).

### 3.5. Phân hệ Thanh toán & Giao dịch (`TransactionController`, `VNPayCallbackController`, `UploadController`)
- `POST /api/transactions/package-payment` — [OWNER] Khởi tạo giao dịch thanh toán mua gói qua VNPay.
- `GET /api/transactions/{id}/vnpay-url` — [OWNER] Tạo URL chuyển hướng sang cổng thanh toán VNPay Sandbox.
- `GET /api/transactions/{id}` — [OWNER, ADMIN] Xem thông tin chi tiết một giao dịch.
- `POST /api/transactions/{id}/simulate-gateway` — [OWNER, ADMIN] Giả lập phản hồi thanh toán thành công/thất bại (môi trường dev/test).
- `GET /api/transactions` — [OWNER, ADMIN] Lịch sử giao dịch thanh toán phân trang.
- `GET /api/payments/vnpay/return` — [Public] URL nhận kết quả thanh toán từ VNPay redirect về.
- `GET /api/payments/vnpay/ipn` — [Public] Webhook tiếp nhận kết quả thanh toán ngầm từ VNPay.
- `POST /api/uploads/images` — [Public/Authenticated] Tải ảnh lên máy chủ (ảnh bàn giao xe, ảnh xe, biên bản).
- `GET /api/uploads/files/{name}` — [Public] Xem/tải ảnh công khai.

### 3.6. Phân hệ Đơn thuê xe, Bàn giao & Đánh giá (`BookingController`, `ReviewController`, `AdminDashboardController`)
- `GET /api/cars/{carId}/quote` — [Public] Tính toán báo giá thuê xe theo thời gian nhận/trả.
- `GET /api/cars/{carId}/availability` — [Public] Xem các khoảng thời gian xe đã kín lịch.
- `POST /api/bookings` — [CUSTOMER, OWNER] Gửi yêu cầu đặt thuê xe.
- `GET /api/bookings/my` — [CUSTOMER, OWNER] Danh sách đơn thuê xe của bản thân (với tư cách khách thuê).
- `GET /api/bookings/owner` — [OWNER] Danh sách đơn khách đặt thuê xe của mình.
- `GET /api/bookings/{id}` — [Authenticated] Xem chi tiết một đơn thuê.
- `POST /api/bookings/{id}/cancel` — [Authenticated] Hủy đơn thuê xe kèm lý do.
- `POST /api/bookings/{id}/contacted` — [OWNER] Chủ xe đánh dấu đã liên hệ khách trao đổi.
- `POST /api/bookings/{id}/accept` — [OWNER] Chủ xe chấp nhận đơn thuê.
- `POST /api/bookings/{id}/reject` — [OWNER] Chủ xe từ chối đơn thuê kèm lý do.
- `POST /api/bookings/{id}/handovers/{type}` — [OWNER] Gửi biên bản bàn giao xe (nhận xe/trả xe) kèm 7 góc ảnh và số km, xăng.
- `PUT /api/bookings/{id}/handovers/{type}` — [OWNER] Chỉnh sửa lại biên bản bàn giao khi khách yêu cầu.
- `POST /api/bookings/{id}/handovers/{type}/respond` — [CUSTOMER, OWNER] Khách hàng xác nhận hoặc từ chối từng hạng mục trong biên bản.
- `GET /api/admin/bookings` — [ADMIN] Quản trị viên xem tất cả đơn thuê xe.
- `GET /api/dashboards/owner` — [OWNER] Bảng số liệu thống kê của chủ xe.
- `GET /api/dashboards/customer` — [CUSTOMER, OWNER] Bảng số liệu thống kê chuyến đi của khách.
- `GET /api/admin/bookings/stats` — [ADMIN] Thống kê tổng hợp tình hình đơn thuê toàn sàn.
- `GET /api/admin/dashboard/revenue` — [ADMIN] Báo cáo doanh thu bán gói tin cho Admin.
- `POST /api/reviews` — [CUSTOMER, OWNER] Đăng đánh giá và số sao cho xe sau chuyến đi.
- `GET /api/cars/{carId}/reviews` — [Public] Tóm tắt và danh sách đánh giá của một xe.
- `GET /api/reviews/{id}` — [Public] Xem chi tiết một bài đánh giá.
- `GET /api/reviews` — [Public] Danh sách tất cả bài đánh giá phân trang.
- `DELETE /api/admin/reviews/{id}` — [ADMIN] Xóa gỡ bài đánh giá vi phạm.

---

## 4. MA TRẬN KỊCH BẢN KIỂM THỬ (TEST SCENARIO MATRIX)

Mỗi chức năng phải được kiểm thử qua 8 nhóm điều kiện khắt khe:

| Mã kiểm thử | Nhóm kịch bản | Yêu cầu kiểm tra & Kỳ vọng |
|---|---|---|
| **SC-01** | **Luồng đúng (Happy Path)** | Nhập đầy đủ thông tin chuẩn, đúng định dạng -> Hệ thống xử lý thành công, trả status 200/201, dữ liệu nhất quán trong DB. |
| **SC-02** | **Dữ liệu rỗng (Empty Data)** | Gửi body rỗng `{}`, danh sách rỗng `[]`, trường bắt buộc mang chuỗi trống `""` -> Hệ thống bắt lỗi Validation, trả 400 Bad Request kèm thông báo rõ ràng, không văng lỗi 500. |
| **SC-03** | **Dữ liệu sai (Bad Data / Invalid Format)** | Gửi email sai cú pháp, giá âm, số chỗ < 1, ngày kết thúc trước ngày bắt đầu, chuỗi vượt quá độ dài quy định -> Báo lỗi 400 rõ ràng. |
| **SC-04** | **Thiếu trường (Missing Required Fields)** | Bỏ sót các trường `@NotNull` / `@NotBlank` (như thiếu mật khẩu khi đăng ký, thiếu biển số khi tạo xe) -> Trả 400 Bad Request. |
| **SC-05** | **Trùng dữ liệu (Duplicates / Idempotency)** | Đăng ký trùng email đã có; tạo xe trùng biển số xe; nộp trùng giấy tờ KYC cùng loại khi đơn cũ đang `PENDING`; tạo trùng mã voucher/gói cước -> Báo lỗi 409 Conflict hoặc 400 thích hợp. |
| **SC-06** | **Sai quyền (Wrong Role / Forbidden)** | Khách hàng (CUSTOMER) gọi API Owner (`POST /api/cars`, mua gói), gọi API Admin (`/api/admin/*`, duyệt xe, đổi role) -> Bị chặn 403 Forbidden. |
| **SC-07** | **Chưa đăng nhập (Unauthenticated)** | Không gửi Bearer Token vào các endpoint yêu cầu xác thực -> Trả 401 Unauthorized với format chuẩn JSON. |
| **SC-08** | **Token hết hạn / Token giả mạo** | Gửi Bearer token hết hạn (TTL quá hạn) hoặc sai secret key -> Trả 401 Unauthorized, không cho phép truy cập. |

---

## 5. KẾ HOẠCH TEST GIAO DIỆN (PLAYWRIGHT BROWSER E2E)

Sử dụng Playwright để tự động hóa kiểm thử trên trình duyệt Chromium:
1. **Luồng Khách hàng:**
   - Đăng ký tài khoản mới -> Đăng nhập thành công -> Lưu session token.
   - Vào `/account` cập nhật Zalo -> Vào `/account/verification` kiểm tra giao diện nộp CCCD.
   - Vào `/explore` tìm kiếm xe -> Chọn 1 xe vào `/cars/:id` -> Chọn ngày thuê và gửi đơn đặt xe.
   - Vào `/trips` kiểm tra đơn thuê xuất hiện ở trạng thái `SUBMITTED`.
2. **Luồng Chủ xe:**
   - Đăng nhập bằng tài khoản Chủ xe (`binh@gmail.com`).
   - Vào `/owner/vehicles` kiểm tra danh sách xe của mình.
   - Thử mở trang `/owner/vehicles/new` kiểm tra form đăng ký xe.
   - Vào `/owner/bookings` kiểm tra đơn khách vừa đặt -> Đánh dấu liên hệ -> Chấp nhận đơn.
   - Thao tác lập biên bản nhận xe (Handover pickup).
   - Vào `/owner/subscriptions/new` kiểm tra chọn gói tin và áp mã voucher.
3. **Luồng Quản trị viên:**
   - Đăng nhập tài khoản Admin (`admin@carrental.vn`).
   - Truy cập `/admin/dashboard`, `/admin/users`, `/admin/vehicles`, `/admin/bookings`, `/admin/safety`, `/admin/vouchers`, `/admin/packages`.
   - Kiểm tra các bảng dữ liệu load đúng, không bị crash JS hoặc màn hình trắng.
4. **Kiểm tra phân quyền trên URL (Route Guards):**
   - Đăng nhập tài khoản CUSTOMER chưa KYC -> Gõ thẳng URL `/owner/dashboard` -> Hệ thống phải hiển thị màn hình cảnh báo "Cần xác minh giấy tờ để trở thành Chủ xe" và chặn không cho vào nội dung quản trị.
   - Gõ thẳng URL `/admin/dashboard` khi chưa phải ADMIN -> Bị chặn với cảnh báo "Chỉ dành cho quản trị viên".
