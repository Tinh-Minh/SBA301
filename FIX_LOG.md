# NHẬT KÝ SỬA LỖI - FIX_LOG.md
**Dự án**: SBA Car Rental Platform  
**Phiên bản nhánh**: `fix/mailjet-and-owner-upgrade` (tách từ `car-slot`)  
**Ngày cập nhật**: 2026-11-13  

---

## 1. TỔNG QUAN CÁC VẤN ĐỀ TRÊN NHÁNH `fix/mailjet-and-owner-upgrade`

Dự án tiếp nhận và giải quyết triệt để 2 vấn đề trọng tâm theo yêu cầu của hệ thống:
1. **Vấn đề 1**: Gửi email qua Mailjet gặp lỗi — Nạp cấu hình môi trường `.env`, đồng bộ biến môi trường với Spring Boot, kiểm tra biến thiếu khi khởi động ứng dụng và gửi mail thật qua Mailjet.
2. **Vấn đề 2**: Toàn bộ luồng xét duyệt người dùng xin nâng cấp lên Chủ xe (Owner Upgrade Workflow) không chạy từ FE đến BE — Khám phá hồ sơ KYC phía Admin, xác thực thông tin giấy tờ, ràng buộc tối đa 3 lần gửi, chặn khi đang có yêu cầu PENDING, tự động thăng cấp role sang OWNER khi duyệt và gửi mail thông báo kết quả thẩm định.

---

## 2. CHI TIẾT VẤN ĐỀ 1: GỬI MAIL (MAILJET) VÀ TỰ ĐỘNG NẠP BIẾN MÔI TRƯỜNG `.env`

### Commit Git:
- `51134f3` — `fix(mail): load .env into spring boot, configure Mailjet and add startup check`

### Nguyên nhân gốc:
1. **Spring Boot không tự động đọc file `.env`**: Spring Boot mặc định chỉ nạp `application.properties`/`application.yml` hoặc các biến môi trường của hệ điều hành / JVM system properties (`-D...`). Do đó, file `.env` đặt tại thư mục gốc backend không được tự động đưa vào Spring `Environment`.
2. **Cấu hình Spring Mail chưa map đúng biến Mailjet**: Trong `application.properties`, các thông số mail chưa được liên kết chặt chẽ với các biến chuẩn `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER_EMAIL`.
3. **Thiếu cơ chế cảnh báo khi thiếu biến môi trường lúc khởi động**: Ứng dụng khởi động mà không kiểm tra sự hiện diện của các biến môi trường quan trọng, chỉ phát sinh lỗi khi người dùng thực hiện thao tác gửi mail.

### Giải pháp và các file thay đổi:
- **`carrental-BE/.env`**:
  - Cập nhật đầy đủ các biến môi trường chuẩn:
    ```env
    MAILJET_API_KEY=8a7d24f912dbd6430e420a2f88d37640
    MAILJET_SECRET_KEY=d5ce7633c63e6ef0f6e782be692b10ea
    MAILJET_SENDER_EMAIL=phandoanthequan2004@gmail.com
    FRONTEND_URL=http://localhost:3000
    ```
- **`carrental-BE/src/main/java/com/carrental/config/DotEnvEnvironmentPostProcessor.java`** *(mới)*:
  - Hiện thực giao tiếp `EnvironmentPostProcessor` và đăng ký trong `META-INF/spring.factories`.
  - Tự động tìm kiếm file `.env` tại thư mục hiện tại hoặc các thư mục cha (lên đến 5 cấp) trước khi Spring giải quyết các placeholder cấu hình.
  - Tôn trọng thứ tự ưu tiên: biến hệ điều hành thực tế và JVM `-D` luôn có độ ưu tiên cao hơn giá trị trong `.env`.
- **`carrental-BE/src/main/java/com/carrental/config/MailEnvironmentStartupLogger.java`** *(mới)*:
  - Lắng nghe sự kiện `ApplicationReadyEvent`.
  - Kiểm tra danh sách các biến bắt buộc: `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER_EMAIL`, `FRONTEND_URL`.
  - Nếu thiếu biến, ghi cảnh báo `WARN` chỉ in **tên biến** bị thiếu, tuyệt đối không in giá trị để bảo mật thông tin.
  - Bổ sung hàm tiện ích `summarizeMailFailure` giúp ẩn thông tin nhạy cảm khi log lỗi gửi mail.
- **`carrental-BE/src/main/resources/application.properties`**:
  - Cấu hình SMTP Mailjet:
    ```properties
    spring.mail.host=in-v3.mailjet.com
    spring.mail.port=587
    spring.mail.username=${MAILJET_API_KEY:}
    spring.mail.password=${MAILJET_SECRET_KEY:}
    spring.mail.properties[mail.smtp.auth]=true
    spring.mail.properties[mail.smtp.starttls.enable]=true
    spring.mail.properties[mail.smtp.starttls.required]=true
    spring.mail.properties[mail.smtp.connectiontimeout]=5000
    spring.mail.properties[mail.smtp.timeout]=5000
    spring.mail.properties[mail.smtp.writetimeout]=5000
    app.mail.from=${MAILJET_SENDER_EMAIL:}
    ```
- **Xác nhận thực tế**:
  - Gửi thử nghiệm email thực tế thành công tới hòm thư `phandoanthequan2004@gmail.com` thông qua máy chủ SMTP của Mailjet.

---

## 3. CHI TIẾT VẤN ĐỀ 2: LUỒNG XÁC NHẬN TỪ USER LÊN CHỦ XE (OWNER UPGRADE WORKFLOW)

### Commit Git:
- `62f6b51` — `fix(owner-upgrade): fix admin kyc discovery, submission validation, and owner promotion flow`

### Nguyên nhân gốc:
1. **Admin không tìm thấy hồ sơ người dùng PENDING**: Endpoint `GET /api/customers?kycStatus=PENDING` phía Admin không hoạt động chính xác do DTO `CustomerSummaryResponse` và `CustomerAdminResponse` bị thiếu trường `kycStatus`, đồng thời tầng Service chưa xử lý lọc `kycStatus` trong danh sách khách hàng.
2. **Lỗi xác thực ngày tháng ở Form Frontend**: Component `VerificationForm.jsx` xử lý ngày cấp (`issueDate`) và ngày hết hạn (`expiresAt`) bị sai định dạng `yyyy-MM-dd` khiến request gửi lên BE bị lỗi 400 validation.
3. **Quy tắc giới hạn 3 lần nộp hồ sơ & chặn nộp khi PENDING**: BE và FE chưa đồng bộ kiểm soát số lần nộp (tối đa 3 lần tính cả các lần bị REJECTED) và chưa chặn triệt để khi người dùng đang có hồ sơ PENDING.
4. **Không tự động chuyển vai trò (Role Promotion)**: Khi Admin duyệt `APPROVED` tài liệu CCCD/Hộ chiếu, hệ thống chỉ cập nhật trạng thái tài liệu mà không tự động chuyển `role` của Customer từ `CUSTOMER` thành `OWNER`.
5. **Thông báo email khi duyệt/từ chối**: Thiếu luồng gửi email tự động kèm thông báo chúc mừng hoặc lý do từ chối kèm hạn mức lượt còn lại.

### Giải pháp và các file thay đổi:
- **`carrental-BE/src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java` & `CustomerAdminResponse.java`**:
  - Bổ sung trường `kycStatus` vào DTO trả về cho màn hình quản trị người dùng.
- **`carrental-BE/src/main/java/com/carrental/service/impl/CustomerServiceImpl.java`**:
  - Hỗ trợ lọc danh sách khách hàng theo `kycStatus` trong Specification.
  - Cho phép thăng cấp role sang `OWNER` khi hồ sơ KYC đạt `VERIFIED`.
- **`carrental-BE/src/main/java/com/carrental/repository/UserDocumentRepository.java`**:
  - Thêm phương thức truy vấn `existsByCustomerIdAndDocTypeInAndVerifyStatus` và `countByCustomerIdAndDocTypeIn` để đếm chính xác số lần đã gửi trên nhóm giấy tờ định danh (`CITIZEN_ID`, `PASSPORT`).
- **`carrental-BE/src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`**:
  - Kiểm tra chặt chẽ ở BE:
    - Nếu đang có yêu cầu `PENDING`: ném ngoại lệ `409 DOCUMENT_PENDING_EXISTS`.
    - Nếu tổng số lượt đã gửi >= 3: ném ngoại lệ `400 OWNER_UPGRADE_LIMIT_EXCEEDED` kèm thông báo tiếng Việt rõ ràng.
    - Khi Admin từ chối: bắt buộc phải có `rejectReason` (tối đa 500 ký tự), nếu thiếu trả về `400 INVALID_REQUEST`.
    - Khi Admin duyệt `APPROVED`: tự động nâng role của user từ `CUSTOMER` thành `OWNER`.
    - Sau khi duyệt hoặc từ chối: gọi `sendReviewNotificationEmail` gửi mail chúc mừng hoặc thông báo từ chối kèm lý do và số lượt còn lại. Mọi ngoại lệ gửi mail đều được bắt an toàn (`try-catch`), chỉ ghi log cảnh báo và không rollback giao dịch trong cơ sở dữ liệu.
- **`carrental-FE/src/components/account/VerificationForm.jsx` & `VerificationPage.jsx`**:
  - Chuẩn hóa form nhập liệu, format đúng chuỗi ngày tháng `yyyy-MM-dd`.
  - Hiển thị thông báo banner rõ ràng khi hồ sơ đang PENDING hoặc đã hết 3/3 lượt, đồng thời vô hiệu hóa nút gửi và các ô nhập liệu tương ứng.
  - Hiển thị lý do từ chối của quản trị viên và số lượt còn lại trên giao diện trang hồ sơ cá nhân.

---

## 4. TỔNG HỢP KẾT QUẢ KIỂM THỬ HỆ THỐNG

### 4.1. Backend Unit & Integration Tests (Maven Surefire)
- **Lệnh thực thi**: `.\mvnw.cmd test`
- **Kết quả**: **116/116 test PASS (100%)**, Failures: 0, Errors: 0, Skipped: 0.
- **Thời gian**: ~25.8 giây.
- **Bao gồm các test suite chuyên sâu**:
  - `OwnerUpgradeWorkflowTest` (7 test cases): kiểm tra toàn diện luồng nâng cấp, chặn nộp trùng PENDING, chặn lần thứ 4, từ chối không lý do, thăng cấp role OWNER.
  - `OwnerUpgradeLimitAndEmailTest`: kiểm tra email gửi thật và xử lý chịu lỗi khi dịch vụ mail gặp sự cố.
  - `DotEnvEnvironmentPostProcessorTest`: nạp file .env chính xác vào Spring Environment.
  - `BugFixRegressionIntegrationTest`, `CarImageUploadTest`, `VoucherCatalogServiceImplTest`...

### 4.2. Frontend Production Build (Vite)
- **Lệnh thực thi**: `npm run build`
- **Kết quả**: **BUILD SUCCESS**, 497 modules transformed, không có lỗi cú pháp hay thiếu import.

### 4.3. End-to-End & Playwright Automation Verification (`e2e_verification.mjs`)
- **Lệnh thực thi**: `node e2e_verification.mjs` trên cơ sở dữ liệu PostgreSQL vừa reset sạch bằng `seeddb.sql`.
- **Kết quả**: **33/33 test PASS (100%)**, 0 Failures:
  1. `BE Health UP`: API `/api/health` trả về `UP`.
  2. `Admin Login`: Đăng nhập admin thành công.
  3. `Customer Login`: Đăng nhập customer seed thành công.
  4. `Register new customer & verify email`: Đăng ký tài khoản mới và xác minh email trong DB.
  5. `New customer logged in`: Nhận JWT token hợp lệ.
  6. `Initial KYC check`: `kycStatus=NONE`, số lượt còn lại `3/3`.
  7. `Submission 1 (CITIZEN_ID)`: Nộp CCCD lần 1 thành công, trạng thái `PENDING`.
  8. `Edge case: Submit while PENDING blocked`: BE chặn với `409 DOCUMENT_PENDING_EXISTS`.
  9. `Edge case: Unauthenticated submit blocked`: BE chặn với `401 UNAUTHORIZED`.
  10. `Admin KYC discovery`: Admin tìm thấy user trong danh sách `kycStatus=PENDING`.
  11. `Edge case: Normal user calling admin review blocked`: BE chặn với `403 ACCESS_DENIED`.
  12. `Edge case: Admin reject without reason blocked`: BE chặn với `400 INVALID_REQUEST`.
  13. `Admin reject attempt 1`: Từ chối kèm lý do hợp lệ, gửi mail thông báo.
  14. `User sees REJECTED status & quota 2 remaining`: User thấy trạng thái và còn `2/3` lượt.
  15. `Attempt 2 rejected`: Nộp lần 2 và bị từ chối, còn `1/3` lượt.
  16. `Attempt 3 rejected`: Nộp lần 3 và bị từ chối, còn `0/3` lượt.
  17. `Edge case: 4th submission strictly blocked by BE`: BE chặn với `400 OWNER_UPGRADE_LIMIT_EXCEEDED`.
  18. `Happy path: User submitted valid CCCD`: User mới nộp hồ sơ CCCD hợp lệ.
  19. `Admin approved KYC`: Admin duyệt thành công, gửi email chúc mừng nâng cấp.
  20. `User role upgraded to OWNER in BE`: Role của user tự động chuyển thành `OWNER`.
  21. `UI: Home/Explore loaded`: Trang chủ tải mượt mà.
  22. `UI: Login successful via web interface`: Trình duyệt Playwright đăng nhập thành công.
  23. `UI: User sees Owner verified banner on /account/verification`: Giao diện hiển thị đúng vai trò Chủ xe.
  24. `UI: Upgraded user can access /owner/dashboard without blocker`: User đã nâng cấp truy cập được kênh chủ xe.
  25. `UI: 4th attempt blocked button & quota warning displayed on frontend`: Hiển thị cảnh báo hết lượt nộp và vô hiệu hóa nút gửi.
  26. `UI: Admin Users & KYC page loaded`: Màn hình quản trị người dùng tải chính xác.
  27. `UI Playwright automated session completed successfully`: Toàn bộ kịch bản browser chạy trọn vẹn.
  28. `Regression: Public Cars search`: Tìm kiếm xe công khai trả về danh sách xe.
  29. `Regression: Public Car detail (id=1)`: Xem chi tiết xe thành công.
  30. `Regression: Listing packages catalog (/api/packages)`: Danh mục gói niêm yết hoạt động.
  31. `Regression: Admin vouchers list (/api/vouchers)`: Admin truy vấn danh sách voucher.
  32. `Regression: Customer available vouchers`: Khách hàng xem danh sách voucher áp dụng cho gói.
  33. `Regression: Admin user documents list (scope=all)`: Admin truy vấn toàn bộ giấy tờ người dùng.
