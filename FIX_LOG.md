# NHẬT KÝ SỬA LỖI - FIX_LOG.md
**Dự án**: SBA Car Rental Platform  
**Phiên bản nhánh**: `car-slot`  
**Ngày cập nhật**: 2026-11-13  

---

## 1. CÁC LỖI TRỌNG TÂM ĐÃ XỬ LÝ DỨT ĐIỂM

### Mục 1: Đổi / Cập nhật mật khẩu
- **Nguyên nhân**:
  - Thiếu kiểm tra mật khẩu mới không được trùng mật khẩu cũ.
  - Sau khi đổi mật khẩu, token JWT cũ vẫn còn hiệu lực đến khi hết hạn tự nhiên (`exp`), chưa bị thu hồi.
  - Mã lỗi và thông báo trả về chưa chuẩn hóa theo từng field (`currentPassword`, `newPassword`).
- **File sửa**:
  - `carrental-BE/src/main/java/com/carrental/service/impl/AuthServiceImpl.java`: Kiểm tra BCrypt mật khẩu cũ, kiểm tra password policy mật khẩu mới, kiểm tra trùng mật khẩu cũ (`SAME_AS_OLD_PASSWORD`), cập nhật `tokenInvalidatedAt = Instant.now()`.
  - `carrental-BE/src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java`: Kiểm tra `issuedAt` của JWT với `tokenInvalidatedAt` của Customer, từ chối token cũ nếu phát hành trước thời điểm đổi mật khẩu.
  - `carrental-FE/src/components/account/ProfileEditor.jsx`: Bổ sung form đổi mật khẩu với validate trực quan, hiển thị lỗi đúng field.

---

### Mục 2: Luồng nâng cấp lên Chủ xe (Owner Upgrade)
- **Nguyên nhân**:
  - Admin không tìm thấy hồ sơ `PENDING` khi query `GET /api/customers?kycStatus=PENDING`.
  - Khi Admin duyệt `APPROVED`, chỉ đổi trạng thái tài liệu mà không đổi trường `role` của Customer sang `OWNER`.
  - Thiếu ràng buộc chặn nộp khi đang có hồ sơ `PENDING` và giới hạn tối đa 3 lần nộp.
- **File sửa**:
  - `carrental-BE/src/main/java/com/carrental/service/impl/CustomerServiceImpl.java`: Lọc danh sách theo `kycStatus`, đồng bộ `effectiveKycStatus`.
  - `carrental-BE/src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`:
    - Chặn nộp khi đang PENDING (`409 DOCUMENT_PENDING_EXISTS`).
    - Giới hạn tối đa 3 lần nộp (`400 OWNER_UPGRADE_LIMIT_EXCEEDED`).
    - Khi Admin duyệt: tự động nâng `role = OWNER` và `kycStatus = VERIFIED`.
    - Sau khi duyệt/từ chối: gửi email thông báo kết quả.
  - `carrental-FE/src/components/account/VerificationForm.jsx` & `VerificationPage.jsx`: Khóa form khi đang PENDING hoặc hết 3/3 lượt, hiển thị lý do từ chối.

---

### Mục 3 & 4: Cấu hình Mailjet & Mail thông báo kết quả Owner
- **Nguyên nhân**:
  - Spring Boot không tự nạp file `.env`.
  - Thiếu log cảnh báo khi thiếu biến môi trường lúc khởi động.
  - Thiếu gửi email thông báo cho user khi Admin duyệt/từ chối kèm lý do.
- **File sửa**:
  - `carrental-BE/src/main/java/com/carrental/config/DotEnvEnvironmentPostProcessor.java`: Nạp `.env` vào Spring `Environment` trước khi resolve properties.
  - `carrental-BE/src/main/java/com/carrental/config/MailEnvironmentStartupLogger.java`: Log cảnh báo tên biến thiếu lúc khởi động (không log secret).
  - `carrental-BE/src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`: Gửi mail chúc mừng khi duyệt, gửi mail nêu rõ lý do từ chối và số lượt còn lại; lỗi mail được bắt an toàn không làm hỏng giao dịch duyệt.

---

### Mục 5: Rate limit khi gửi mail
- **Nguyên nhân**:
  - Chưa có cơ chế giới hạn tần suất gửi email, dẫn đến nguy cơ bị spam hoặc cạn quota Mailjet.
- **File sửa**:
  - `carrental-BE/src/main/java/com/carrental/service/MailRateLimiter.java` *(mới)*:
    - Giới hạn tối đa 3 lần gửi trong 10 phút theo email và theo IP.
    - Áp dụng thời gian chờ (cooldown) tối thiểu 60 giây giữa 2 lần gửi liên tiếp.
  - `carrental-BE/src/main/java/com/carrental/controller/AuthController.java`:
    - Bắt chặn tại `POST /api/auth/resend-verification` và các luồng gửi mail xác thực.
    - Trả về HTTP 429 (`TOO_MANY_REQUESTS`) kèm thông báo rõ số giây còn lại cần chờ.
  - `carrental-BE/src/test/java/com/carrental/service/impl/PasswordAndMailRateLimitTest.java` *(mới)*: Unit test kiểm tra trường hợp vượt giới hạn và hết thời gian chờ.

---

### Mục 6: Upload ảnh máy tính & Chặn URL ngoài
- **Nguyên nhân**:
  - Trước đây một số màn hình vẫn còn ô nhập URL ảnh hoặc cho phép truyền URL từ bên ngoài.
  - Phía Backend nhận URL tùy ý từ client, tiềm ẩn nguy cơ SSRF hoặc ảnh rác.
- **File sửa**:
  - **Frontend**:
    - `ProfileEditor.jsx`: Bỏ ô nhập URL avatar, chỉ giữ nút upload ảnh từ máy.
    - `VehicleRegistrationSteps.jsx`: Bỏ các ô nhập URL ảnh xe và giấy tờ, chỉ giữ upload tệp.
    - `DisputeForm.jsx`: Bỏ ô dán URL ảnh khiếu nại, chỉ cho chọn tệp từ máy.
    - `validateInput.js`: Regex `mediaUrlInput` chỉ chấp nhận đường dẫn nội bộ `/api/uploads/files/...` hoặc `blob:`.
  - **Backend**:
    - `CarImageRequest.java`: Chặn regex `^/(?!/)\\S+$`, từ chối `http(s)://`.
    - `CarDocumentRequest.java`: Chặn regex `^/(?!/)\\S+$`, từ chối `http(s)://`.
    - `BookingDtos.java`: Chặn regex ảnh biên bản giao nhận `^/(?!/)\\S+$`.
    - `SafetyDtos.java`: Chặn regex ảnh hồ sơ an toàn kỹ thuật `^$|^/(?!/)\\S+$`.
    - `CustomerServiceImpl.java`: Chặn cập nhật avatar bằng URL ngoài.
    - `PublicImageStorageService.java`: Kiểm tra định dạng (JPG, PNG, WebP), dung lượng tối đa 5MB, magic bytes thực tế, sinh UUID an toàn.

---

### Mục 7: Bảo vệ file `.env`
- **File sửa**:
  - `.gitignore`, `carrental-BE/.gitignore`, `carrental-FE/.gitignore`: Thêm `.env` vào danh sách loại trừ.
  - Đã thực hiện `git rm --cached` để loại bỏ `.env` khỏi lịch sử Git theo dõi.
