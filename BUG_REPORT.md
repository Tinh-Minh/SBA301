# BÁO CÁO LỖI HỆ THỐNG - BUG_REPORT.md
**Dự án**: SBA Car Rental Platform (Spring Boot 3 + React Vite + PostgreSQL)  
**Thời gian kiểm thử**: 2026-11-12  
**Môi trường**: Windows 11, Java 21, PostgreSQL 18, Node.js 22, Playwright (Microsoft Edge)  
**Tác giả**: QA Engineer kiêm Developer  

---

## Bảng tổng hợp lỗi phát hiện, phân loại và kết quả xử lý

| ID | Chức năng | Cách tái hiện | Kết quả thực tế | Kết quả mong đợi | Mức độ | File nghi ngờ | Trạng thái |
|---|---|---|---|---|---|---|---|
| **BUG-01** | Đăng ký tài khoản (`POST /api/auth/register`) | Gửi body đăng ký khi biến môi trường `MAILJET_API_KEY` chưa được cấu hình ở môi trường dev/local/staging. | Báo lỗi `HTTP 503 SERVICE_UNAVAILABLE` (mã lỗi `DEPENDENCY_UNAVAILABLE`), chặn toàn bộ luồng đăng ký người dùng mới. | Hệ thống fallback: sinh token xác thực, log đường dẫn verify vào console/logger và kích hoạt tài khoản trong môi trường kiểm thử. | **Critical** | `carrental-BE/src/main/java/com/carrental/service/impl/AuthServiceImpl.java` | **Đã sửa & Commit `ac037a4`** |
| **BUG-02** | Tác vụ lập lịch ngầm tự động hết hạn gói tin & đơn thuê (`@Scheduled`) | Khởi chạy Spring Boot và quan sát các bean lập lịch `SubscriptionExpirationScheduler` và `BookingExpirationScheduler`. | Do thiếu annotation `@EnableScheduling` trên Application/Configuration, Spring không khởi tạo `TaskScheduler`, khiến cả hai tác vụ ngầm quét hết hạn gói tin (`SubscriptionExpirationScheduler`) và đơn thuê quá hạn (`BookingExpirationScheduler`) không bao giờ tự động chạy theo cron. | Spring Boot phải kích hoạt Scheduling để các cron job tự động dọn dẹp các gói tin hết hạn (`ACTIVE -> EXPIRED`, `PENDING_PAYMENT -> CANCELLED`) và đơn thuê quá giờ đón (`REQUESTED -> EXPIRED`). | **High** | `carrental-BE/src/main/java/com/carrental/CarRentalApplication.java` | **Đã sửa & Commit `df84968`** |

---

## Bảng tổng hợp các ràng buộc an ninh & biên nghiệp vụ đã thẩm định (Passed Business Guards)

Ngoài các lỗi đã phát hiện và xử lý ở trên, các biên kiểm thử quan trọng sau đây đã được thẩm định độc lập và kiểm chứng thực tế:

| Phân hệ | Hành vi kiểm tra | Ràng buộc bảo vệ | Trạng thái thẩm định |
|---|---|---|---|
| **Security / JWT** | Gửi token đã hết hạn (`exp < now`) tới endpoint `/api/customers/me` | Trả về `HTTP 401 UNAUTHORIZED` với mã lỗi chuẩn `INVALID_TOKEN` | **Đã kiểm chứng (TC-AUTH-13b: PASS)** |
| **Security / Role Guard** | Customer chưa duyệt KYC truy cập các API hoặc trang `/owner/*` | Bị chặn cả ở Backend (`HTTP 403 FORBIDDEN`) và Frontend UI Route Guard (hiển thị trang Gate KYC) | **Đã kiểm chứng (TC-AUTH-14, TC-UI-03: PASS)** |
| **Booking / Handover Dispute** | Khách từ chối 1 mục hiện trạng xe khi nhận xe (`accepted: false`, có `disputeNote`) | Biên bản chuyển sang `DISPUTED`, đơn giữ `PICKUP_PENDING`. Chủ xe cập nhật lại (`revision=2`), khách xác nhận lại thì đơn mới chuyển sang `IN_PROGRESS` | **Đã kiểm chứng (TC-BKG-05b, TC-BKG-05c, TC-BKG-06: PASS)** |
| **Booking / Race Condition** | Khách tạo đơn trùng lịch với đơn đã duyệt (`HOLDING`) | Hệ thống khoá bi quan (`findWithLockById`) và chặn trùng lặp với `HTTP 409 CONFLICT` | **Đã kiểm chứng (TC-BKG-02: PASS)** |
| **Booking / Lead Time** | Lập biên bản bàn giao nhận xe trước giờ nhận xe > 24 giờ | Bị chặn `HTTP 409 CONFLICT`: "Chỉ lập biên bản nhận xe trong vòng 24 giờ trước giờ nhận xe" | **Đã kiểm chứng (TC-BKG-05: PASS)** |
| **Review / Anti-fraud** | Đánh giá xe khi chưa hoàn tất chuyến đi hoặc đánh giá xe của chính mình | Bị từ chối `HTTP 403 FORBIDDEN` / `HTTP 400 BAD_REQUEST` | **Đã kiểm chứng (TC-REV-01: PASS)** |
| **Subscription / Voucher** | Áp mã voucher có giá trị đơn tối thiểu cao hơn gói cước | Bị từ chối `HTTP 400 BAD_REQUEST`: "Gói chưa đạt giá trị tối thiểu" | **Đã kiểm chứng (TC-SUB-01: PASS)** |
