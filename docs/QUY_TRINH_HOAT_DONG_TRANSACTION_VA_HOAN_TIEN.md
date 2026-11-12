# TÀI LIỆU ĐẶC TẢ LUỒNG HOẠT ĐỘNG GIAO DỊCH & HOÀN TIỀN
## SBA301 - Nền tảng Cho Thuê Xe Tự Lái (Car Rental Marketplace)

> 📄 **File Word (.docx):** [`QUY_TRINH_HOAT_DONG_TRANSACTION_VA_HOAN_TIEN.docx`](file:///d:/Study/SBA302/project/SBA301/docs/QUY_TRINH_HOAT_DONG_TRANSACTION_VA_HOAN_TIEN.docx)  
> 🏷️ **Phân hệ phụ trách:** Function 3 (Đơn thuê & Vòng đời) và Function 4 (Thanh toán, Chi trả & Hoàn tiền)  
> 💳 **Cổng thanh toán:** VNPay Sandbox Payment Gateway & Mock Gateway giả lập  
> 📅 **Phiên bản:** 1.0 (Tháng 10/2026)

---

## I. Tổng quan Kiến trúc Giao dịch (Transaction)

Hệ thống quản lý dòng tiền theo mô hình **Ký quỹ / Đảm bảo giao dịch (Escrow Model)**:
1. **Tiền đặt cọc giữ xe (`DEPOSIT`):** Thu riêng theo quy định từng loại xe (ví dụ 2,000,000 VND). Sàn giữ khoản này trong suốt chuyến đi và **hoàn lại 100% cho khách khi trả xe nguyên vẹn**.
2. **Tiền thuê xe (`RENTAL_PAYMENT`):** Tiền thuê theo giờ/ngày sau khi trừ voucher. Chuyển vào tài khoản trung gian của hệ thống và **chỉ chi trả cho chủ xe sau khi chuyến đi hoàn tất**.
3. **Phí phát sinh (`EXTRA_FEE`):** Các khoản phụ thu được phát hiện lúc trả xe (vệ sinh xe, trễ giờ, quá số km, va quẹt nhẹ).
4. **Hoàn tiền (`REFUND`):** Giao dịch hoàn cọc hoặc hoàn tiền thuê khi huỷ đơn/giải quyết tranh chấp. Luôn liên kết trực tiếp với giao dịch gốc (`parentTransactionId`).
5. **Chi trả chủ xe (`PAYOUT`):** Lệnh chuyển khoản quyết toán doanh thu về tài khoản ngân hàng của chủ xe sau khi khấu trừ phí dịch vụ sàn (10%).

---

## II. Bảng tổng hợp các API theo thứ tự thực thi

| Bước | Tên thao tác | Method | Endpoint API | Role gọi | Mục đích / Trạng thái mới |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **0** | Đăng nhập | `POST` | `/api/auth/login` | Mọi Role | Lấy JWT Bearer Token |
| **1** | Báo giá trước | `POST` | `/api/orders/quote` | Renter | Tính tiền thuê & tiền cọc dự kiến |
| **2** | Tạo đơn thuê xe | `POST` | `/api/orders` | Renter | `orderStatus = PENDING`, `paymentStatus = UNPAID` |
| **3** | Chủ xe duyệt đơn | `PUT` | `/api/orders/{id}/confirm` | Owner | `orderStatus = CONFIRMED` |
| **4** | Tạo giao dịch Đặt cọc | `POST` | `/api/transactions/deposit` | Renter | Tạo Giao dịch `DEPOSIT`, `status = PENDING` |
| **5a**| Thanh toán cọc VNPay | `GET` | `/api/transactions/{id}/vnpay-url` | Renter | Nhập thẻ test cổng VNPay Sandbox |
| **5b**| Giả lập cổng cọc | `POST` | `/api/transactions/{id}/simulate-gateway`| Renter/Dev | Giao dịch `DEPOSIT` chuyển sang `SUCCESS` |
| **6** | Tạo giao dịch Tiền thuê | `POST` | `/api/transactions/payment` | Renter | Tạo Giao dịch `RENTAL_PAYMENT` |
| **7** | Thanh toán tiền thuê | `POST/GET`| `/simulate-gateway` hoặc VNPay | Renter | Giao dịch chuyển `SUCCESS`, `order.paymentStatus = PAID` |
| **8** | Nhận xe (Pickup Handover)| `POST/PUT`| `/api/orders/{id}/handovers` & `/confirm` | Cả 2 bên | Ký biên bản nhận xe -> `orderStatus = ONGOING` |
| **9** | Trả xe (Return Handover) | `POST/PUT`| `/api/orders/{id}/handovers` & `/confirm` | Cả 2 bên | Ký biên bản trả xe -> `orderStatus = COMPLETED` |
| **10**| Phí phát sinh (nếu có) | `POST` | `/api/extra-fees` | Owner/Admin | Ghi nhận phí rửa xe, trễ giờ, quá km... |
| **11**| Thanh toán phụ phí | `POST` | `/api/extra-fees/{id}/pay` | Renter | Tạo Giao dịch `EXTRA_FEE` -> `SUCCESS` |
| **12**| **HOÀN TIỀN CỌC (Refund)**| `POST` | `/api/transactions/refund` | Admin | **Tạo Giao dịch `REFUND` -> Hoàn tiền cọc cho khách** |
| **13**| Chi trả tiền cho Chủ xe | `POST/PUT`| `/api/payouts` & `/process` | Admin/Sàn | Chuyển khoản tiền thuê về STK chủ xe (`PAID`) |
| **14**| Đánh giá chuyến đi | `POST` | `/api/reviews` | Renter | Chấm điểm sao và gửi nhận xét chất lượng xe |

---

## III. Chi tiết luồng nghiệp vụ từ Đặt xe đến Hoàn tiền

### Bước 1: Khách yêu cầu báo giá (`POST /api/orders/quote`)
- **Body:**
  ```json
  {
    "carId": 3,
    "startDateTime": "2026-11-01T08:00:00",
    "endDateTime": "2026-11-03T20:00:00",
    "voucherCode": "GIAM50K"
  }
  ```
- **Kết quả:** Trả về chi tiết `rentalPricePerDay`, `depositAmount` (2,000,000 VND), `totalAmount` (1,750,000 VND).

### Bước 2: Khách tạo đơn thuê xe (`POST /api/orders`)
- Hệ thống kiểm tra xe trống, lưu đơn thuê:
  - `OrderStatus` = `PENDING` (chờ chủ xe xác nhận).
  - `PaymentStatus` = `UNPAID`.
  - Có hạn thanh toán `expiresAt` (2 giờ).

### Bước 3: Chủ xe duyệt đơn (`PUT /api/orders/{orderId}/confirm`)
- Chủ xe kiểm tra và xác nhận nhận cuốc.
- `OrderStatus` chuyển sang `CONFIRMED`.

### Bước 4 & 5: Đặt cọc giữ xe (`POST /api/transactions/deposit`)
- **Body:**
  ```json
  {
    "orderId": 1,
    "amount": 2000000,
    "method": "VNPAY"
  }
  ```
- Backend sinh `paymentUrl` đưa khách sang cổng thanh toán VNPay Sandbox.
- Sau khi nhập mã OTP 123456 thành công (hoặc gọi API simulate gateway): Transaction `DEPOSIT` chuyển sang `SUCCESS`.

### Bước 6 & 7: Thanh toán tiền thuê xe (`POST /api/transactions/payment`)
- **Body:**
  ```json
  {
    "orderId": 1,
    "amount": 1750000,
    "method": "VNPAY"
  }
  ```
- Khi thanh toán thành công: Sự kiện `PaymentCompletedEvent` được kích hoạt, tự động cập nhật `order.paymentStatus = PAID`.

### Bước 8 & 9: Bàn giao xe (Handover)
1. **Nhận xe (Pickup):** Tạo biên bản qua `POST /api/orders/{orderId}/handovers`, khách xác nhận qua `PUT /api/handovers/{id}/confirm` -> `OrderStatus = ONGOING`.
2. **Trả xe (Return):** Tạo biên bản trả xe, ghi nhận ODO, mức xăng, tình trạng xe -> Cả 2 bên xác nhận -> `OrderStatus = COMPLETED`.

---

## IV. Chi tiết 3 Kịch bản Hoàn tiền (Refund Scenarios)

### Kịch bản 1: Hoàn tiền đặt cọc sau chuyến đi hoàn tất (Standard Deposit Refund)
Sau khi trả xe nguyên vẹn, đơn thuê đã `COMPLETED`, Admin hoặc hệ thống gọi API hoàn cọc:
- **API:** `POST /api/transactions/refund`
- **Request Body:**
  ```json
  {
    "parentTransactionId": 102,
    "amount": 2000000,
    "reason": "Hoàn tiền cọc sau chuyến đi khi kiểm tra xe nguyên vẹn"
  }
  ```
- **Xử lý:**
  - Hệ thống kiểm tra giao dịch gốc `102` phải là `SUCCESS`.
  - Kiểm tra số tiền hoàn <= số tiền cọc gốc.
  - Tạo một Transaction mới loại `REFUND`, `status = SUCCESS`, gắn `refundOfId = 102`.
  - Cập nhật `order.paymentStatus = REFUNDED`.

### Kịch bản 2: Hoàn tiền khi Huỷ đơn (Cancellation Refund)
- Khách hoặc chủ xe huỷ đơn (`PUT /api/orders/{orderId}/cancel`).
- Nếu khách đã thanh toán/cọc trước đó: Admin gọi `POST /api/transactions/refund` để hoàn 100% (nếu huỷ đúng hạn hoặc lỗi từ chủ xe) hoặc hoàn một phần tiền thuê sau khi trừ phí huỷ muộn.

### Kịch bản 3: Hoàn tiền sau khi giải quyết tranh chấp (Dispute Resolution Refund)
- Khi có bất đồng về phụ phí hay tiền cọc: Khách mở khiếu nại (`POST /api/disputes`), cung cấp bằng chứng (`POST /api/disputes/{id}/evidences`).
- Admin phân xử (`PUT /api/disputes/{id}/resolve`) và kích hoạt hoàn tiền với số tiền theo phán quyết.

---

## V. 5 Cơ chế kiểm soát an toàn trong Backend

1. **Phân quyền nghiêm ngặt (RBAC):** Chỉ `ROLE_ADMIN` hoặc worker hệ thống mới có quyền kích hoạt lệnh hoàn tiền.
2. **Kiểm tra giao dịch gốc:** Bắt buộc `parentTransaction.status == SUCCESS`.
3. **Chống hoàn lồng nhau (Anti-Recursive):** Không cho phép hoàn tiền cho một giao dịch vốn là `REFUND`.
4. **Kiểm soát trần số tiền hoàn (Cumulative Cap):** `alreadyRefunded + refundAmount <= parent.amount`. Ngăn chặn hoàn tiền vượt mức gốc.
5. **Khóa chống tranh chấp đồng thời (Pessimistic Lock):** Áp dụng `findByIdForUpdate` ngăn chặn Race Condition và Double-Refund.
