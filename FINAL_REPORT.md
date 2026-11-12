# BÁO CÁO TỔNG KẾT KIỂM THỬ VÀ HOÀN TẤT DỰ ÁN - FINAL_REPORT.md

**Dự án**: SBA Car Rental Platform  
**Nhánh Git**: `fix/upload-kyc-upgrade-issues` (tách từ `car-slot` @ `d6d081d`)  
**Ngày hoàn thành**: 2026-11-12  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ SAU KHI RESET DB & BUILD LẠI

| Hạng mục kiểm thử | Công cụ / Lệnh thực thi | Tổng số ca | Đạt (Pass) | Thất bại (Fail) | Ghi chú |
|---|---|---|---|---|---|
| **Backend Unit & Integration Tests** | Maven Surefire (`.\mvnw.cmd test`) trên H2 | 111 | 111 | 0 | Bao gồm 9 test mới thêm cho 3 vấn đề |
| **Frontend Production Build** | Vite (`npm run build`) | 1 build | Thành công | 0 | Build sạch `dist/` (2.22s) |
| **Kiểm thử hồi quy toàn hệ thống** | `node d:\SBA\run_comprehensive_suite.cjs` (60 API/E2E + 6 Playwright Edge) | 66 | 66 | 0 | Chạy trên PostgreSQL 18 vừa `DB_RESET_ON_STARTUP=true` & `vite preview` |
| **Kiểm thử chuyên sâu 3 vấn đề** | `node d:\SBA\test_issues_1_2_3.cjs` (17 API + 16 Playwright Edge) | 33 | 33 | 0 | Chạy ngay sau vòng hồi quy trên cùng DB sạch |
| **TỔNG CỘNG CA TEST TỰ ĐỘNG** | | **210** | **210** | **0** | **100% PASS** |

---

## 2. KẾT QUẢ CHI TIẾT THEO 3 VẤN ĐỀ YÊU CẦU

### Vấn đề 1: Upload ảnh xe từ máy cục bộ, validate, preview & hiển thị (`73525ed`) — PASS
- **API (`I1-API-01` → `I1-API-07`)**:
  - Upload đơn ảnh qua `POST /api/uploads/images` và nhiều ảnh qua `POST /api/uploads/images/batch` trả về đường dẫn `/api/uploads/files/{uuid}.png`, truy cập công khai HTTP 200.
  - Upload trực tiếp lên xe qua `POST /api/cars/{id}/images` (multipart `files` + `primaryIndex`) lưu đúng URL vào DB.
  - Từ chối tệp sai định dạng `.txt` (HTTP 415), từ chối byte rác giả mạo `.jpg` (HTTP 415), từ chối ảnh vượt quá 5MB (HTTP 413).
- **Giao diện Playwright (`I1-UI-01` → `I1-UI-08`)**:
  - Bước 1 tạo xe: chặn `.txt`, hiển thị preview `blob:` cục bộ trước khi lưu.
  - Bước 4 tạo xe: chặn ảnh > 5MB, chọn nhiều ảnh cùng lúc và hiển thị đồng thời các preview `blob:` trước khi lưu.
  - Gửi tạo xe thành công chuyển hướng `/owner/vehicles`, dữ liệu DB lưu đúng `/api/uploads/files/...`, ảnh tải thành công (`naturalWidth > 0`) trên **Quản lý xe của chủ xe**, **Chi tiết xe** (kèm click thumbnail chuyển ảnh chính), và **Explore** sau khi duyệt & niêm yết.

### Vấn đề 2: Luồng user xin nâng cấp chủ xe (`0b9d5aa`) — PASS
- **API & Unit Test (`I2-API-01` → `I2-API-06`, `OwnerUpgradeLimitAndEmailTest`)**:
  - Chặn gửi yêu cầu mới (kể cả khác loại giấy tờ `PASSPORT` khi `CITIZEN_ID` đang `PENDING`) với `409 DOCUMENT_PENDING_EXISTS`.
  - Tính cả các lần đã bị `REJECTED`: sau 3 lần gửi bị từ chối, lần thứ 4 bị chặn tại Backend với `400 OWNER_UPGRADE_LIMIT_EXCEEDED` kèm thông báo rõ ràng.
  - Duyệt hợp lệ (`APPROVED`) tự động nâng role từ `CUSTOMER` lên `OWNER`.
  - Gửi email thông báo khi duyệt (chúc mừng) và từ chối (kèm lý do & lượt còn lại) được xác minh qua `OwnerUpgradeLimitAndEmailTest` bằng Mockito `JavaMailSender`, bao gồm cả trường hợp `MailSendException` (lỗi gửi mail không làm rollback DB và không rò rỉ email/lý do vào log).
- **Giao diện Playwright (`I2-UI-01`, `I2-UI-02`)**:
  - Khi đang có hồ sơ `PENDING`: banner khóa hiển thị và nút gửi bị `disabled`.
  - Khi đã dùng hết 3/3 lượt: hiển thị thông báo hết lượt và vô hiệu hóa nút gửi.

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

Nhật ký Backend (`carrental-BE`) trong suốt quá trình chạy cả hai bộ test ghi nhận 0 lỗi hệ thống bất thường (`ERROR`).

---

## 4. HẠN CHẾ / PHẠM VI CHƯA THỬ TRÊN MÔI TRƯỜNG THẬT

1. **Gửi email SMTP Mailjet thực tế**: Biến môi trường `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` để trống ở local, nên khi chạy E2E trên Tomcat sống, hệ thống ghi log `document-review-email-skipped reason=mail_unconfigured` và bỏ qua an toàn. Nhánh gửi mail thật và nhánh bắt lỗi `MailSendException` đã được kiểm thử ở tầng unit test (`OwnerUpgradeLimitAndEmailTest` với Mockito), chưa kiểm thử gửi tới hộp thư SMTP thực tế.
2. **Sửa ảnh xe sau khi đã tạo (`OwnerVehicleEditPage.jsx`)**: Đã kiểm tra biên dịch FE và cấu trúc logic upload/preview/primary/delete khớp với trang tạo mới, nhưng Playwright E2E tập trung kiểm tra trang tạo mới (`OwnerVehicleNewPage`), trang quản lý xe, trang chi tiết xe và Explore.
3. **Upload cloud (S3/Cloudinary)**: Dự án sử dụng lưu trữ cục bộ (`/api/uploads/files/...`) sẵn có từ `UploadController`, không tích hợp dịch vụ cloud ngoài.
4. **Cảnh báo kích thước bundle Vite**: Chunk `RegisterPage` (chứa zxcvbn) và `carScrollScene` vẫn > 500kB (tồn đọng từ trước, không làm lỗi build).
