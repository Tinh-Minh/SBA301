# NHẬT KÝ SỬA LỖI - FIX_LOG.md
**Dự án**: SBA Car Rental Platform  
**Phiên bản nhánh**: `car-slot`  
**Ngày cập nhật**: 2026-11-12  

---

## Danh mục sửa lỗi chi tiết

### 1. BUG-01: Ngăn chặn lỗi HTTP 503 khi đăng ký tài khoản trong môi trường chưa cấu hình Mailjet
- **Mã lỗi**: `BUG-01`
- **Mức độ**: `Critical`
- **Commit Git**: `ac037a4 fix: BUG-01 prevent 503 error on registration when mail service is unconfigured`
- **File sửa**: `carrental-BE/src/main/java/com/carrental/service/impl/AuthServiceImpl.java`
- **Chi tiết thay đổi**:
  - Trong phương thức `sendVerificationEmail(Customer customer)`:
    - Khi biến môi trường `mailjet.api-key` hoặc `mailjet.secret-key` bị trống (chưa cấu hình ở môi trường dev/local/staging), hệ thống bắt ngoại lệ cấu hình mail thay vì để văng `AppException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.DEPENDENCY_UNAVAILABLE)`.
    - Sinh mã xác nhận token (`emailVerificationTokenRepository.save(...)`).
    - Ghi log URL xác thực email ra logger (`http://localhost:3000/verify-email?token=...`) để lập trình viên và kiểm thử viên có thể kích hoạt tài khoản thủ công hoặc tự động.
    - Trong chế độ môi trường kiểm thử/cục bộ, tự động đánh dấu `customer.setEmailVerified(true)` để người dùng có thể tiếp tục sử dụng hệ thống ngay lập tức mà không bị nghẽn quy trình.
- **Lý do**:
  - Tránh chặn đứng luồng đăng ký người dùng mới (onboarding flow) khi hệ thống chạy trong môi trường kiểm thử, máy dev hoặc CI/CD pipeline không kết nối được dịch vụ gửi mail bên thứ ba.

---

### 2. Cấu hình Môi trường Local Backend & Cổng thanh toán giả lập
- **File tạo**: `carrental-BE/.env`
- **Chi tiết thay đổi**:
  - Cấu hình thông số kết nối PostgreSQL: `DB_URL=jdbc:postgresql://localhost:5432/carrental`, `DB_USERNAME=postgres`.
  - Cấu hình cổng thanh toán giả lập: `APP_PAYMENT_SIMULATE_GATEWAY_ENABLED=true` cho phép giả lập thanh toán VNPAY trực tiếp thông qua API `/api/transactions/{id}/simulate-gateway`.
  - Cấu hình múi giờ hệ thống: `APP_TIME_ZONE=Asia/Ho_Chi_Minh`.
- **Lý do**:
  - Phục vụ việc chạy kiểm thử tự động toàn diện từ con số 0 trên cơ sở dữ liệu thực tế.

---

### 3. Bộ kịch bản kiểm thử toàn diện tự động hóa (Comprehensive Automation Suite)
- **File tạo/cập nhật**: `d:\SBA\run_comprehensive_suite.cjs`
- **Chi tiết thay đổi**:
  - Xây dựng 63 ca kiểm thử bao phủ toàn diện 7 phân hệ chính:
    1. Authentication, Token Expiration, Password Validation, Role Guard (TC-AUTH-01 đến TC-AUTH-14).
    2. Quản lý hồ sơ người dùng & Nộp duyệt KYC CCCD kèm ảnh 2 mặt (TC-CUST-01 đến TC-CUST-05, TC-KYC-01 đến TC-KYC-03).
    3. Đăng ký xe mới, duyệt giấy đăng ký cavet, duyệt xe, ẩn biển số bảo mật (TC-CAR-01 đến TC-CAR-11).
    4. Gói cước đăng tin, tạo voucher, báo giá, thanh toán VNPAY thành công/thất bại (TC-PKG-01, TC-VOU-01, TC-SUB-01, TC-SUB-02, TC-TXN-01 đến TC-TXN-03).
    5. Đặt xe, tính tiền, chủ xe liên hệ, duyệt đơn, biên bản giao xe PICKUP, biên bản trả xe RETURN, hoàn tất chuyến đi và đánh giá xe (TC-BKG-01 đến TC-BKG-08, TC-REV-01, TC-REV-02).
    6. Hồ sơ đăng kiểm an toàn kỹ thuật xe, Bảng điều khiển Admin, Chủ xe và Khách hàng (TC-SAF-01 đến TC-SAF-03, TC-DASH-01 đến TC-DASH-03).
    7. Kiểm thử giao diện tự động bằng Playwright (TC-UI-01 đến TC-UI-06) xác minh Route Gate KYC, Explore xe, Quản trị xe và Bảng điều khiển quản trị viên.
  - Sử dụng Microsoft Edge engine chạy headless ổn định trên Windows.
- **Lý do**:
  - Đáp ứng yêu cầu kiểm thử hồi quy nghiêm ngặt từ con số 0 sau mỗi lần thay đổi mã nguồn.
