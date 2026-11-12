# BÁO CÁO TỔNG KẾT KIỂM THỬ VÀ HOÀN TẤT DỰ ÁN - FINAL_REPORT.md

**Dự án**: SBA Car Rental Platform  
**Nhánh Git**: `fix/upload-kyc-upgrade-issues` (tách từ `car-slot` @ `d6d081d`)  
**Ngày hoàn thành**: 2026-11-12  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ SAU KHI RESET DB & BUILD LẠI

| Hạng mục kiểm thử | Công cụ / Lệnh thực thi | Tổng số ca | Đạt (Pass) | Thất bại (Fail) | Ghi chú |
|---|---|---|---|---|---|
| **Backend Unit & Integration Tests** | Maven Surefire (`.\mvnw.cmd test`) trên H2 | 111 | 111 | 0 | Bao gồm 9 test mới thêm cho 3 vấn đề (kể cả `WEBPVP8L`) |
| **Frontend Production Build** | Vite (`npm run build`) | 1 build | Thành công | 0 | Build sạch `dist/` (1.83s) |
| **Kiểm thử hồi quy toàn hệ thống** | `node d:\SBA\run_comprehensive_suite.cjs` (60 API/E2E + 6 Playwright Edge) | 66 | 66 | 0 | Chạy trên PostgreSQL 18 vừa `DB_RESET_ON_STARTUP=true` & `vite preview` |
| **Kiểm thử chuyên sâu 3 vấn đề** | `node d:\SBA\test_issues_1_2_3.cjs` (19 API + 18 Playwright Edge) | 37 | 37 | 0 | Bao gồm `.jpg`/`.webp`, batch >11MB, `OwnerVehicleEditPage`, xe mồ côi & thứ tự ảnh chính |
| **Kiểm thử SMTP sống & chịu lỗi mail** | `node d:\SBA\test_live_smtp_mail.cjs` (Tomcat BE + Mock SMTP `127.0.0.1:2525`) | 6 | 6 | 0 | Gửi mail thật qua TCP SMTP cho approve/reject + kịch bản SMTP `550` không rollback DB |
| **TỔNG CỘNG CA TEST TỰ ĐỘNG** | | **220** | **220** | **0** | **100% PASS** |

---

## 2. KẾT QUẢ CHI TIẾT THEO 3 VẤN ĐỀ YÊU CẦU

### Vấn đề 1: Upload ảnh xe từ máy cục bộ, validate, preview & hiển thị (`73525ed`, `8499e5a`) — PASS
- **API (`I1-API-01` → `I1-API-09`)**:
  - Upload đơn ảnh qua `POST /api/uploads/images` và nhiều ảnh qua `POST /api/uploads/images/batch` trả về đường dẫn `/api/uploads/files/{uuid}.png`, truy cập công khai HTTP 200.
  - Upload tệp `.jpg` và `.webp` thực tế thành công và truy cập công khai HTTP 200; upload nhiều ảnh 3 x 4.2MB (> 11MB tổng, mỗi file <= 5MB) thành công HTTP 200 sau khi nâng `spring.servlet.multipart.max-request-size=55MB`.
  - Upload trực tiếp lên xe qua `POST /api/cars/{id}/images` (multipart `files` + `primaryIndex`) lưu đúng URL vào DB.
  - Từ chối tệp sai định dạng `.txt` (HTTP 415), từ chối byte rác giả mạo `.jpg` (HTTP 415), từ chối ảnh vượt quá 5MB (HTTP 413).
- **Giao diện Playwright (`I1-UI-01` → `I1-UI-10`)**:
  - Bước 1 tạo xe: chặn `.txt`, hiển thị preview `blob:` cục bộ trước khi lưu.
  - Bước 4 tạo xe: chặn ảnh > 5MB, chọn nhiều ảnh cùng lúc và hiển thị đồng thời các preview `blob:` trước khi lưu.
  - Khi ảnh tải lên giả mạo `.jpg` bị BE từ chối 415, luồng upload-trước-tạo-sau không tạo xe "mồ côi" trong DB; khi sửa lại file hợp lệ và trộn slot URL (chính) + File cục bộ (phụ), xe lưu thành công và giữ đúng ảnh đầu làm `isPrimary=true`.
  - Gửi tạo xe thành công chuyển hướng `/owner/vehicles`, dữ liệu DB lưu đúng `/api/uploads/files/...`, ảnh tải thành công (`naturalWidth > 0`) trên **Quản lý xe của chủ xe**, **Chi tiết xe** (kèm click thumbnail chuyển ảnh chính), và **Explore** sau khi duyệt & niêm yết.
  - Trang chỉnh sửa xe (`OwnerVehicleEditPage`): chọn tệp `.webp` hiển thị `blob:` preview trước khi lưu, tải lên, đặt làm ảnh chính (`Đặt ảnh chính`), và xóa ảnh hoạt động đúng trên trình duyệt.

### Vấn đề 2: Luồng user xin nâng cấp chủ xe (`0b9d5aa`, `297b034`) — PASS
- **API & Unit Test (`I2-API-01` → `I2-API-06`, `SMTP-01` → `SMTP-05`, `OwnerUpgradeLimitAndEmailTest`)**:
  - Chặn gửi yêu cầu mới (kể cả khác loại giấy tờ `PASSPORT` khi `CITIZEN_ID` đang `PENDING`) với `409 DOCUMENT_PENDING_EXISTS`.
  - Tính cả các lần đã bị `REJECTED`: sau 3 lần gửi bị từ chối, lần thứ 4 bị chặn tại Backend với `400 OWNER_UPGRADE_LIMIT_EXCEEDED` kèm thông báo rõ ràng.
  - Duyệt hợp lệ (`APPROVED`) tự động nâng role từ `CUSTOMER` lên `OWNER`.
  - Gửi email thông báo qua SMTP thật khi duyệt (chúc mừng nâng cấp OWNER) và từ chối (kèm lý do tiếng Việt & lượt còn lại) đã được xác minh cả bằng unit test Mockito (`OwnerUpgradeLimitAndEmailTest`) **và** trên server Tomcat thực kết nối tới TCP Mock SMTP (`test_live_smtp_mail.cjs`), bao gồm cả kịch bản SMTP trả mã lỗi `550` (review vẫn HTTP 200, `rejectReason` lưu đầy đủ trong DB, không rò rỉ email hay lý do vào log BE).
- **Giao diện Playwright (`I2-UI-01`, `I2-UI-02`)**:
  - Khi đang có hồ sơ `PENDING`: banner khóa hiển thị, các trường nhập và nút gửi bị `disabled`.
  - Khi đã dùng hết 3/3 lượt: hiển thị thông báo hết lượt và vô hiệu hóa biểu mẫu/nút gửi.

### Vấn đề 3: Lý do từ chối của Admin hiển thị phía User & hạn mức lượt (`664f32c`) — PASS
- **API & Unit Test (`I3-API-01` → `I3-API-04`, `UserDocumentSummaryReasonTest`)**:
  - Admin từ chối thiếu `rejectReason` bị chặn HTTP 400.
  - Admin từ chối kèm lý do lưu DB và `GET /api/user-documents?scope=mine` trả về đúng `rejectReason`; `GET /api/customers/me/kyc` trả về `upgradeAttemptsUsed`, `maxUpgradeAttempts=3`, `upgradeAttemptsRemaining`, `hasPendingUpgradeRequest`.
- **Giao diện Playwright (`I3-UI-01` → `I3-UI-03`)**:
  - Trang duyệt phía Admin vô hiệu hóa nút xác nhận từ chối khi chưa nhập lý do và hiển thị lý do sau khi từ chối.
  - Trang `/account/verification` của người dùng hiển thị rõ lý do từ chối màu đỏ và huy hiệu số lượt (`Đã gửi X/3 lần • Còn lại Y lần`), đồng thời mở lại form cho phép nộp lại khi còn lượt.

---

## 3. KIỂM THỬ HỒI QUY TOÀN BỘ HỆ THỐNG (`run_comprehensive_suite.cjs` — 66/66 PASS)

Toàn bộ 7 phân hệ hiện có trên cơ sở dữ liệu PostgreSQL vừa reset sạch đều đạt 100%:
1. Xác thực, JWT hết hạn & phân quyền (`TC-AUTH-01` → `TC-AUTH-14`): **16/16 PASS**
2. Hồ sơ người dùng & KYC (`TC-CUST-01` → `TC-CUST-05`, `TC-KYC-01` → `TC-KYC-03`): **8/8 PASS**
3. Xe & tìm kiếm xe (`TC-CAR-01` → `TC-CAR-10`): **10/10 PASS**
4. Gói đăng tin, voucher & thanh toán VNPAY (`TC-PKG-01`, `TC-VOU-01`, `TC-SUB-01`, `TC-SUB-02`, `TC-TXN-01` → `TC-TXN-03`, `TC-CAR-11`): **8/8 PASS**
5. Đặt xe, khiếu nại/chỉnh sửa biên bản giao nhận & đánh giá (`TC-BKG-01` → `TC-BKG-08`, `TC-REV-01`, `TC-REV-02`): **12/12 PASS**
6. Hồ sơ an toàn kỹ thuật & Dashboard (`TC-SAF-01` → `TC-SAF-03`, `TC-DASH-01` → `TC-DASH-03`): **6/6 PASS**
7. Giao diện Playwright tổng quát (`TC-UI-01` → `TC-UI-06`): **6/6 PASS**

Nhật ký Backend (`carrental-BE`) trong suốt quá trình chạy các bộ test ghi nhận 0 lỗi hệ thống bất thường (`ERROR`), chỉ có các cảnh báo dự kiến (`WARN`) cho ca test âm tính và ca giả lập lỗi SMTP `550`.

---

## 4. HẠN CHẾ / PHẠM VI CHƯA THỬ TRÊN MÔI TRƯỜNG THẬT

1. **Gửi email qua dịch vụ Mailjet Cloud bên thứ ba**: Biến môi trường `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` để trống ở local `.env`. Việc truyền tải SMTP thực từ Tomcat (`JavaMailSender` → TCP port 2525) và chịu lỗi `550` đã được kiểm thử sống qua `test_live_smtp_mail.cjs`, riêng việc kết nối tới server Mailjet thật ngoài Internet chưa chạy do không có API key sản xuất.
2. **Upload cloud (S3/Cloudinary)**: Dự án sử dụng lưu trữ cục bộ (`/api/uploads/files/...`) sẵn có từ `UploadController`, không tích hợp dịch vụ cloud ngoài.
3. **Cảnh báo kích thước bundle Vite**: Chunk `RegisterPage` (chứa zxcvbn) và `carScrollScene` vẫn > 500kB (tồn đọng từ trước, không làm lỗi build).
