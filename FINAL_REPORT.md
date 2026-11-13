# BÁO CÁO TỔNG KẾT KIỂM THỬ VÀ HOÀN TẤT DỰ ÁN - FINAL_REPORT.md

**Dự án**: SBA Car Rental Platform (Spring Boot 3 + React Vite + PostgreSQL)  
**Nhánh Git**: `car-slot`  
**Ngày hoàn thành**: 2026-11-13  
**Trạng thái**: **100% HOÀN THÀNH - TOÀN BỘ KIỂM THỬ ĐẠT (PASS)**

---

## 1. BẢNG TỔNG KẾT THEO CÁC MỤC YÊU CẦU

| Luồng nghiệp vụ | Trạng thái | Lỗi đã sửa / Files liên quan | Phần còn tồn đọng |
| :--- | :---: | :--- | :--- |
| **1. Đổi mật khẩu** | **ĐẠT** | `AuthServiceImpl.java`, `CurrentAccountJwtAuthenticationConverter.java`, `ProfileEditor.jsx`<br>- So khớp BCrypt chuẩn xác<br>- Kiểm tra policy mật khẩu mới (chữ hoa, chữ thường, số, ký tự đặc biệt, tối thiểu 8 ký tự)<br>- Chặn trùng mật khẩu cũ (`SAME_AS_OLD_PASSWORD`, field `newPassword`)<br>- Vô hiệu hóa token cũ sau khi đổi mật khẩu (`tokenInvalidatedAt`) | Không |
| **2. Nâng cấp Owner** | **ĐẠT** | `UserDocumentServiceImpl.java`, `CustomerServiceImpl.java`, `CustomerSummaryResponse.java`, `VerificationForm.jsx`<br>- Admin lọc và tìm kiếm hồ sơ PENDING chuẩn xác<br>- Duyệt (`APPROVED`) đổi role thành `OWNER` thật trong DB<br>- Chặn nộp khi đang PENDING (`409 DOCUMENT_PENDING_EXISTS`)<br>- Giới hạn tối đa 3 lần nộp (`400 OWNER_UPGRADE_LIMIT_EXCEEDED`)<br>- Phân quyền endpoint chặt chẽ (chặn user thường gọi API admin) | Không |
| **3. Cấu hình gửi mail** | **ĐẠT** | `DotEnvEnvironmentPostProcessor.java`, `MailEnvironmentStartupLogger.java`, `application.properties`<br>- Nạp file `.env` vào Spring Boot qua SPI<br>- Log cảnh báo khi thiếu biến mà không lộ secret<br>- Gửi thử nghiệm thành công tới `phandoanthequan2004@gmail.com` qua SMTP TLS 587 (`in-v3.mailjet.com`) | Không |
| **4. Mail duyệt/từ chối Owner** | **ĐẠT** | `UserDocumentServiceImpl.java`<br>- Duyệt: gửi mail chúc mừng nâng cấp thành chủ xe<br>- Từ chối: gửi mail nêu rõ lý do và số lượt còn lại<br>- Lỗi gửi mail được bắt an toàn (`try-catch`), ghi log, không làm hỏng giao dịch duyệt/từ chối | Không |
| **5. Rate limit gửi mail** | **ĐẠT** | `MailRateLimiter.java`, `AuthController.java`, `AuthServiceImpl.java`<br>- Giới hạn gửi lại mã xác thực: tối đa 3 lần/10 phút theo cả email và IP<br>- Áp dụng cooldown tối thiểu 60s giữa 2 lần gửi liên tiếp<br>- Trả về HTTP 429 (`TOO_MANY_REQUESTS`) kèm số giây phải chờ | Multi-replica cần Redis backend |
| **6. Upload ảnh từ máy tính** | **ĐẠT** | `PublicImageStorageService.java`, `UploadController.java`, `CarImageRequest.java`, `CarDocumentRequest.java`, `BookingDtos.java`, `SafetyDtos.java`, `CustomerServiceImpl.java`, `ProfileEditor.jsx`, `VehicleRegistrationSteps.jsx`, `DisputeForm.jsx`<br>- Bỏ toàn bộ ô nhập URL ảnh trên tất cả giao diện FE (xe, avatar, khiếu nại, giấy tờ)<br>- Phía BE chặn toàn bộ URL ngoài `http(s)://`, chỉ chấp nhận đường dẫn do server tạo (`/api/uploads/files/...`)<br>- Kiểm tra định dạng (JPG/PNG/WebP), dung lượng tối đa 5MB, magic bytes thực tế | Không |
| **7. Quản lý `.env` & Git** | **ĐẠT** | `.gitignore`, `carrental-BE/.gitignore`, `carrental-FE/.gitignore`<br>- Thêm `.env` vào `.gitignore` ở cả root, BE và FE<br>- Xóa theo dõi `.env` khỏi Git (`git rm --cached`) | Không |

---

## 2. KẾT QUẢ KIỂM THỬ THỰC TẾ

1. **Backend Unit & Integration Tests**:
   - Lệnh: `.\mvnw.cmd test`
   - Kết quả: **123/123 tests PASS (100%)**, 0 failures, 0 errors, 0 skipped.
2. **Frontend Production Build**:
   - Lệnh: `npm run build` tại `carrental-FE`
   - Kết quả: **BUILD SUCCESS**, 497 modules transformed, 0 lỗi biên dịch/lint.
3. **Kiểm thử E2E & Browser Automation (PostgreSQL 18 + Live BE + Live FE + Playwright)**:
   - Kết quả: **37/37 checks PASS (100%)**, kiểm thử đầy đủ cả Happy Case và Unhappy Case:
     - Đổi mật khẩu: sai mật khẩu cũ (401), mật khẩu mới yếu (400), trùng mật khẩu cũ (400), đổi thành công (200), token cũ bị từ chối ngay (401), đăng nhập bằng mật khẩu mới thành công (200).
     - Rate limit mail: gửi lần 1 thành công (200), gửi ngay lần 2 bị chặn cooldown (429 TOO_MANY_REQUESTS kèm số giây còn lại).
     - Upload ảnh: upload ảnh đại diện (200), cập nhật profile bằng URL ngoài bị chặn (400), tạo xe kèm URL ngoài bị chặn (400), tạo xe bằng đường dẫn nội bộ server thành công (200).
     - Nâng cấp Owner: nộp lần 1 (201 PENDING), nộp khi đang PENDING bị chặn (409), từ chối thiếu lý do bị chặn (400), từ chối kèm lý do (200 + gửi mail), nộp lại lần 2 và 3, nộp lần 4 bị chặn cứng (400 OWNER_UPGRADE_LIMIT_EXCEEDED).
     - Luồng chuẩn: nộp hợp lệ -> Admin duyệt -> role tự động nâng lên `OWNER` trong DB -> đăng nhập lại nhận token mới với role `OWNER` -> truy cập `/owner/dashboard` thành công.
     - Playwright browser UI: kiểm tra form không còn ô nhập URL, hiển thị banner giới hạn 3/3 lần và nút submit bị vô hiệu hóa khi hết lượt.

---

## 3. ĐIỂM CHƯA THỬ TRÊN MÔI TRƯỜNG THẬT VÀ LÝ DO

1. **Kiểm tra trực tiếp trong hòm thư cá nhân**: Mailjet SMTP handshake đã trả về `250 OK` xác nhận đã tiếp nhận thư gửi đi. Việc mở hòm thư người nhận để bấm link chưa thực hiện tự động trong CI/CD.
2. **Thanh toán thẻ ngân hàng thực tế qua cổng VNPay**: Đã xác minh qua cổng giả lập `simulateGateway` tích hợp sẵn trong mã nguồn.
3. **Bộ nhớ Rate Limiter phân tán**: `MailRateLimiter` hiện lưu trữ in-memory (ConcurrentHashMap). Trong môi trường cluster nhiều node cần bổ sung Redis.
