# NHẬT KÝ SỬA LỖI - FIX_LOG.md
**Dự án**: SBA Car Rental Platform  
**Phiên bản nhánh**: `fix/upload-kyc-upgrade-issues` (tách từ `car-slot` @ `d6d081d`)  
**Ngày cập nhật**: 2026-11-12  

---

## Phần A: Các thay đổi mới trên nhánh `fix/upload-kyc-upgrade-issues`

### 1. Vấn đề 1 — Upload ảnh xe từ máy cục bộ, validate định dạng/dung lượng, xem trước và hiển thị đồng bộ
- **Commit Git**: `73525ed` — `feat(car-upload): support local multipart image upload, validation, preview and rendering`
- **Nguyên nhân gốc**:
  - Form tạo/sửa xe ở FE chỉ nhập/giả định chuỗi URL, chưa xử lý tải tệp ảnh cục bộ qua multipart khi tạo/cập nhật xe.
  - Upload công khai chưa chuẩn hóa qua một service dùng chung cho kiểm tra kích thước tối đa 5MB, định dạng tệp và magic bytes thực tế trước khi lưu vào đĩa/DB.
- **File thay đổi**:
  - **Backend**:
    - `carrental-BE/src/main/java/com/carrental/service/PublicImageStorageService.java` *(mới)*: Validate tệp không rỗng, dung lượng tối đa `5MB` (`413 PAYLOAD_TOO_LARGE`), phần mở rộng hợp lệ (`jpg`/`jpeg`/`png`/`webp`), magic bytes thực tế (JPEG/PNG/WebP kể cả header RIFF + VP8/VP8L/VP8X, sai trả `415 UNSUPPORTED_MEDIA_TYPE`), lưu tệp UUID vào thư mục uploads và hỗ trợ rollback xóa tệp khi DB thất bại (`storeImages`).
    - `carrental-BE/src/main/java/com/carrental/controller/UploadController.java`: Ủy quyền `/api/uploads/images` và `/api/uploads/files/{fileName}` cho `PublicImageStorageService`, bổ sung `POST /api/uploads/images/batch`.
    - `carrental-BE/src/main/java/com/carrental/service/CarService.java`, `CarServiceImpl.java`, `CarController.java`: Bổ sung endpoint multipart `POST /api/cars/{id}/images` (`consumes = MULTIPART_FORM_DATA_VALUE`) nhận `files` và `primaryIndex`, giữ tương thích endpoint JSON `APPLICATION_JSON_VALUE`, dọn tệp nếu giao dịch DB rollback.
    - `carrental-BE/src/test/java/com/carrental/service/CarImageUploadTest.java` *(mới)*: Kiểm thử 4 ca upload nhiều ảnh, từ chối tệp > 5MB, từ chối sai định dạng / giả mạo extension, và đọc lại qua `/api/uploads/files/{name}`.
  - **Frontend**:
    - `carrental-FE/src/utils/validateInput.js`, `carrental-FE/src/utils/schemas/vehicle.js`: Validate file JPG/PNG/WebP <= 5MB (`validateImageFile`) và chuẩn hóa input media.
    - `carrental-FE/src/utils/labels.js`, `carrental-FE/src/utils/apiResponse.js`: Bổ sung `resolveAssetUrl` và chuẩn hóa URL ảnh xe trong `carImage` / `normalizeCar`.
    - `carrental-FE/src/services/tripService.js`, `carrental-FE/src/services/vehicleService.js`: Thêm hàm upload multipart ảnh xe (`uploadImages`) và tích hợp vào `carService.create` khi tạo xe mới kèm `photoEntries`.
    - `carrental-FE/src/components/vehicles/VehicleRegistrationSteps.jsx`, `OwnerVehicleNewPage.jsx`, `OwnerVehicleEditPage.jsx`: Cho phép chọn nhiều ảnh từ máy, hiển thị ảnh xem trước (`blob:`) **trước khi lưu**, đổi ảnh chính, xóa ảnh, hiển thị cảnh báo lỗi khi chọn sai định dạng hoặc quá 5MB (ở cả Bước 1 giấy tờ xe và Bước 4 bộ ảnh niêm yết).
    - `carrental-FE/src/components/vehicles/VehicleDetails.jsx`: Cho phép click thumbnail ảnh xe để chuyển ảnh chính ở trang chi tiết xe.
- **Lý do**:
  - Đáp ứng trọn vẹn luồng chọn ảnh thật từ máy, validate chặt ở cả FE và BE, xem trước ngay trên giao diện trước khi gửi và hiển thị đúng ở danh sách xe chủ xe, trang Explore và trang chi tiết xe.

---

### 2. Vấn đề 2 — Giới hạn tối đa 3 lần xin nâng cấp chủ xe, chặn gửi khi đang PENDING, gửi mail thông báo khi duyệt/từ chối
- **Commit Git**: `0b9d5aa` — `feat(owner-upgrade): enforce 3-attempt limit, pending lockout, and review email notifications`
- **Nguyên nhân gốc**:
  - BE mới chặn gửi trùng cùng `docType` đang `PENDING`, chưa chặn gửi chéo giữa `CITIZEN_ID` và `PASSPORT` khi đang có yêu cầu nâng cấp `PENDING`, chưa có giới hạn 3 lần gửi yêu cầu nâng cấp chủ xe (tính cả các lần đã bị từ chối), và chưa gửi email thông báo kết quả duyệt/từ chối cho người dùng.
- **File thay đổi**:
  - **Backend**:
    - `carrental-BE/src/main/java/com/carrental/exception/ErrorCode.java`: Thêm mã lỗi `OWNER_UPGRADE_LIMIT_EXCEEDED` (`HTTP 400 Bad Request`).
    - `carrental-BE/src/main/java/com/carrental/repository/UserDocumentRepository.java`: Thêm `existsByCustomerIdAndDocTypeInAndVerifyStatus` và `countByCustomerIdAndDocTypeIn` cho nhóm giấy tờ định danh nâng cấp chủ xe (`CITIZEN_ID`, `PASSPORT`).
    - `carrental-BE/src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java`:
      - Kiểm tra ở tầng BE: nếu đang có yêu cầu nâng cấp `PENDING` (`CITIZEN_ID`/`PASSPORT`) thì trả `409 DOCUMENT_PENDING_EXISTS`; nếu tổng số lần đã gửi >= 3 (tính mọi trạng thái gồm `REJECTED`) thì trả `400 OWNER_UPGRADE_LIMIT_EXCEEDED` kèm thông báo rõ ràng.
      - Khi admin duyệt (`APPROVED`) hoặc từ chối (`REJECTED`), gọi `sendReviewNotificationEmail` qua `JavaMailSender` (duyệt: gửi mail chúc mừng nâng cấp thành chủ xe; từ chối: gửi mail kèm lý do từ chối và số lượt còn lại). Khi chưa cấu hình mail hoặc gửi mail ném ngoại lệ `RuntimeException`, hệ thống bắt lỗi an toàn, ghi log `document-review-email-skipped` / `document-review-email-failed` (không làm lộ email hay lý do trong log) và **không rollback** kết quả duyệt trong DB. Giữ constructor 5 tham số tương thích các unit test cũ.
    - `carrental-BE/src/main/java/com/carrental/dto/response/KycSummaryResponse.java`, `KycServiceImpl.java`: Bổ sung `upgradeAttemptsUsed`, `maxUpgradeAttempts`, `upgradeAttemptsRemaining`, `hasPendingUpgradeRequest`.
    - `carrental-BE/src/test/java/com/carrental/service/impl/OwnerUpgradeLimitAndEmailTest.java` *(mới)*: 4 ca kiểm thử cho chặn `PENDING`, chặn lần thứ 4, gửi mail duyệt/từ chối kèm lý do, và khả năng chịu lỗi khi `MailSendException` xảy ra.
  - **Frontend**:
    - `carrental-FE/src/hooks/useAccount.js`: Bổ sung `useMyKyc`.
    - `carrental-FE/src/components/account/VerificationForm.jsx`, `carrental-FE/src/pages/account/VerificationPage.jsx`: Hiển thị banner thông báo rõ ràng và vô hiệu hóa nút gửi hồ sơ khi đang có yêu cầu `PENDING` hoặc đã dùng hết `3/3` lượt.
- **Lý do**:
  - Đảm bảo quy tắc nghiệp vụ được thực thi cứng ở BE (không chỉ ẩn ở FE), tránh spam yêu cầu và thông báo kịp thời kết quả thẩm định tới người dùng bất kể dịch vụ mail có sự cố tạm thời.

---

### 3. Vấn đề 3 — Lý do từ chối của Admin không hiển thị ở phía User và hiển thị hạn mức lượt gửi
- **Commit Git**: `664f32c` — `fix(kyc-reason): expose rejectReason and upgrade attempt quota on user verification status`
- **Nguyên nhân gốc**:
  - Phía Admin (`AdminUsersPage.jsx` → `UserDetail.jsx`) đã gửi `rejectReason` lên API, BE đã lưu `reject_reason` vào bảng `user_documents` và trả trong `UserDocumentDetailResponse`, **nhưng bị đứt chuỗi ở endpoint danh sách của người dùng**: `VerificationPage.jsx` gọi `GET /api/user-documents?scope=mine` trả về `UserDocumentSummaryResponse`, vốn **không có trường `rejectReason`** (và `verifiedAt`), khiến FE user không nhận được lý do từ chối để render.
- **File thay đổi**:
  - **Backend**:
    - `carrental-BE/src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java`: Bổ sung trường `rejectReason` và `verifiedAt` vào record + mapper `from(...)`.
    - `carrental-BE/src/test/java/com/carrental/service/impl/UserDocumentSummaryReasonTest.java` *(mới)*: Kiểm thử `UserDocumentSummaryResponse.from(...)` bảo toàn đúng `rejectReason` và `verifiedAt`.
  - **Frontend**:
    - `carrental-FE/src/services/accountService.js`: Sắp xếp danh sách hồ sơ của tôi theo `createdAt,desc` để lần gửi mới nhất luôn hiển thị đầu tiên.
    - `carrental-FE/src/pages/account/VerificationPage.jsx`: Hiển thị nổi bật huy hiệu số lượt (`Đã gửi X/3 lần • Còn lại Y lần`) và khung đỏ hiển thị đầy đủ lý do từ chối của quản trị viên trên từng hồ sơ bị `REJECTED`.
    - `carrental-FE/src/components/account/UserDetail.jsx`: Hiển thị `doc.rejectReason` ngay trên chi tiết hồ sơ phía quản trị viên sau khi từ chối.
- **Lý do**:
  - Nối liền chuỗi dữ liệu từ lúc Admin nhập lý do từ chối → lưu DB → trả về DTO cho User → render rõ ràng kèm hạn mức số lần đã gửi/còn lại.

---

### 4. Bộ kiểm thử tự động bổ sung cho 3 vấn đề (`test_issues_1_2_3.cjs`)
- **File tạo/cập nhật**: `d:\SBA\test_issues_1_2_3.cjs`, `d:\SBA\.gitignore`
- **Chi tiết**:
  - Gồm 33 ca kiểm thử (17 ca API + 16 ca Playwright trên Microsoft Edge headless) bao phủ luồng đúng và các ca lỗi: file > 5MB, file sai định dạng / giả mạo nội dung, ảnh xem trước `blob:` trước khi lưu, ảnh hiển thị trên Owner Vehicles / Car Detail (kèm click thumbnail đổi ảnh) / Explore, chặn gửi khi đang `PENDING`, chặn lần thứ 4 ở cả BE & FE, từ chối thiếu lý do bị chặn 400 / nút xác nhận bị vô hiệu hóa, user xem được lý do từ chối và số lượt `X/3`.

---

## Phần B: Nhật ký trước đó trên nhánh `car-slot`

### 1. BUG-01: Ngăn chặn lỗi HTTP 503 khi đăng ký tài khoản trong môi trường chưa cấu hình Mailjet
- **Commit Git**: `ac037a4` — `carrental-BE/src/main/java/com/carrental/service/impl/AuthServiceImpl.java`

### 2. BUG-02: Kích hoạt Scheduling cho các tác vụ ngầm tự động dọn dẹp gói đăng tin và đơn thuê hết hạn
- **Commit Git**: `df84968` — `carrental-BE/src/main/java/com/carrental/CarRentalApplication.java`, `BookingExpirationSchedulerTest.java`

### 3. Cấu hình môi trường local & bộ kiểm thử hồi quy `run_comprehensive_suite.cjs`
- **Commit Git**: `d6d081d` — `run_comprehensive_suite.cjs` (66 ca kiểm thử toàn hệ thống).
