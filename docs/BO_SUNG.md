# TÀI LIỆU BỔ SUNG & ĐỒNG BỘ NGHIỆP VỤ HỆ THỐNG
## Phân tích sự khác biệt luồng Đặt cọc (Deposit) & Thanh toán (Payment) giữa Frontend và Backend

---

## 1. Bối cảnh & Hiện trạng phát hiện

Khi rà soát toàn diện giữa mã nguồn Frontend (`carrental-FE`) và Backend (`carrental-BE`), phát hiện sự khác biệt trong việc xử lý luồng **Đặt cọc (Deposit)** và **Thanh toán tiền thuê (Payment)**:

### 1.1. Phía Frontend (`carrental-FE`)
* **Màn hình thanh toán trực tiếp (`src/views/live/PaymentLive.jsx`)**:
  * Chỉ gọi duy nhất API thanh toán tiền thuê `createPayment`:
    ```javascript
    const tx = await transactionService.createPayment({ 
        orderId, 
        amount: Number(detail.data.order.totalAmount), 
        method 
    });
    ```
  * Số tiền thanh toán ở bước này là **`totalAmount`** (toàn bộ tiền thuê xe).
* **Màn hình đặt xe (`src/views/live/Checkout.jsx`)**:
  * Dòng tiền cọc được hiển thị với nhãn: **`Tiền cọc (thu khi nhận xe)`**.
* **Màn hình quản lý chuyến của chủ xe (`src/views/owner/OwnerTrips.jsx`)**:
  * Hiển thị ô tổng kết cọc với chú thích nghiệp vụ:
    > *"Cọc chủ xe đang giữ: Thu khi ký C10-A, không qua escrow"*
* **Tầng Service (`src/services/customer-extra.service.js`)**:
  * Đã được định nghĩa sẵn hàm gọi API `createDeposit`:
    ```javascript
    /** POST /api/transactions/deposit */
    createDeposit: ({ orderId, amount, method = "VNPAY" }) => 
        request("/api/transactions/deposit", { 
            method: "POST", 
            json: { orderId: Number(orderId), amount: amount ?? null, method } 
        }),
    ```
  * Tuy nhiên, trên toàn bộ giao diện người dùng (UI) **chưa có nút bấm hoặc màn hình nào kích hoạt hàm `createDeposit` này**.

### 1.2. Phía Backend (`carrental-BE`)
* Backend cung cấp đầy đủ cả 2 endpoint độc lập trong `TransactionController`:
  1. `POST /api/transactions/deposit`: Tạo giao dịch đặt cọc giữ xe (`TransactionType.DEPOSIT`) theo số tiền `order.getDepositAmount()`.
  2. `POST /api/transactions/payment`: Tạo giao dịch thanh toán tiền thuê (`TransactionType.RENTAL_PAYMENT`) theo số tiền `order.getTotalAmount()`. Khi thanh toán thành công, hệ thống tự động đổi `order.paymentStatus = PAID`.

---

## 2. Nguyên nhân & Bản chất nghiệp vụ

Sự khác biệt này xuất phát từ 2 mô hình vận hành đặt cọc thực tế trong lĩnh vực cho thuê xe tự lái:

| Mô hình | Cách thức thực hiện | Ưu / Nhược điểm |
| :--- | :--- | :--- |
| **Mô hình A: Thu cọc Offline trực tiếp khi giao xe**<br>*(Frontend đang áp dụng)* | Khách chỉ thanh toán online tiền thuê xe (`totalAmount`) qua cổng VNPay.<br>Tiền cọc xe (`depositAmount`, thường 5 - 20 triệu VNĐ hoặc để lại xe máy + cavet gốc) sẽ do **chủ xe thu trực tiếp bằng tiền mặt / chuyển khoản riêng** khi 2 bên gặp nhau ký biên bản bàn giao xe (C10-A). | **Ưu điểm**: Khách không bị giam một khoản tiền quá lớn trên nền tảng; dễ linh động đặt cọc bằng hiện vật.<br>**Nhược điểm**: Hệ thống sàn không kiểm soát được rủi ro tranh chấp tiền cọc. |
| **Mô hình B: Ký quỹ Online (Escrow Deposit qua VNPay)**<br>*(Backend đã xây dựng sẵn)* | Khách thanh toán tiền cọc online ngay sau khi đơn được duyệt (`CONFIRMED`) qua API `POST /api/transactions/deposit`. Nền tảng giữ tiền cọc trong tài khoản trung gian (Escrow). Sau khi trả xe hoàn tất và không có sự cố, hệ thống tự động tạo giao dịch `REFUND` hoàn tiền cọc vào tài khoản khách. | **Ưu điểm**: Bảo vệ quyền lợi cho cả 2 bên, minh bạch 100% trên hệ thống số hóa.<br>**Nhược điểm**: Khách phải thanh toán trước số tiền lớn qua cổng thanh toán điện tử. |

---

## 3. Đánh giá & Hướng xử lý đề xuất

### 3.1. Đối với Backend
* **Giữ nguyên API `POST /api/transactions/deposit`**:
  * Đảm bảo đúng 100% tài liệu đặc tả yêu cầu của đồ án (SRS Function 4: Quản lý giao dịch, cọc, thanh toán và hoàn tiền).
  * Đáp ứng đầy đủ các bài kiểm thử tự động (Unit Test / Integration Test / Postman Test).
  * Backend luôn sẵn sàng phục vụ khi phía Frontend có nhu cầu bật tính năng đặt cọc online.

### 3.2. Đối với Frontend (2 kịch bản tích hợp)

#### Kịch bản 1: Giữ nguyên luồng hiện tại (Khuyên dùng khi báo cáo đồ án)
* Không cần sửa code giao diện Frontend.
* Trong báo cáo đồ án hoặc khi thuyết minh trước hội đồng, giải thích rõ:
  > *"Để tối ưu trải nghiệm người dùng thực tế và tránh việc khách phải thanh toán trước khoản tiền cọc lớn qua mạng, ứng dụng quy định tiền cọc được bàn giao trực tiếp cho chủ xe khi nhận xe và ký biên bản C10-A (như hiển thị tại Checkout và OwnerTrips). API `/api/transactions/deposit` của Backend được xây dựng hoàn chỉnh để dự phòng cho mô hình mở rộng ký quỹ sàn (Escrow) trong tương lai."*

#### Kịch bản 2: Bổ sung nút "Đặt cọc online" vào Frontend (Nếu muốn demo đầy đủ cả 2 API)
Nếu muốn giao diện gọi cả 2 API, có thể bổ sung nút đặt cọc vào trang chi tiết đơn hàng `OrderDetail.jsx` hoặc `PaymentLive.jsx`:
```jsx
// Ví dụ bổ sung nút Đặt cọc vào PaymentLive.jsx
const depositAction = useAsyncAction(async () => {
    const tx = await transactionService.createDeposit({ 
        orderId: order.id, 
        amount: Number(order.depositAmount), 
        method: "VNPAY" 
    });
    if (tx.paymentUrl) {
        window.location.href = tx.paymentUrl;
    }
});

// Giao diện hiển thị khi đơn chưa cọc:
{order.depositAmount > 0 && (
    <button onClick={() => depositAction.run()} className="btn-secondary">
        Đặt cọc giữ xe ({formatMoney(order.depositAmount)})
    </button>
)}
```

---

## 4. Bảng tổng hợp đối chiếu chức năng Function 4 sau khi hoàn thiện

| Chức năng | Endpoint Backend | Trạng thái tích hợp Frontend | Phân quyền truy cập |
| :--- | :--- | :--- | :--- |
| **Thanh toán tiền thuê** | `POST /api/transactions/payment` | Đã tích hợp đầy đủ trong `PaymentLive.jsx` | Chỉ `CUSTOMER` (người thuê của đơn) |
| **Đặt cọc giữ xe** | `POST /api/transactions/deposit` | Service đã có sẵn, UI hỗ trợ thu cọc offline lúc nhận xe | Chỉ `CUSTOMER` (người thuê của đơn) |
| **Cổng thanh toán VNPay** | `/api/payments/vnpay/return`<br>`/api/payments/vnpay/ipn` | Tích hợp xác thực checksum bảo mật cao | Công khai (Xác thực bằng SecureHash) |
| **Tạo phí phát sinh** | `POST /api/extra-fees` | Tích hợp khi kết thúc chuyến đi | Chỉ `CUSTOMER` (chủ xe tạo phí) |
| **Thanh toán phí phát sinh** | `POST /api/extra-fees/{id}/pay` | Hỗ trợ 2 phương thức: VNPay link & Tiền mặt (Cash) | Người thuê trả, chủ xe xác nhận nếu tiền mặt |
| **Khiếu nại (Dispute)** | `POST /api/disputes` | Tích hợp form gửi bằng chứng & khiếu nại phí/đơn | Chỉ `CUSTOMER` (khách thuê tạo) |
| **Giải quyết khiếu nại** | `POST /api/disputes/{id}/resolve` | Giao diện Admin quản trị khiếu nại | Chỉ `ADMIN` (Tự động hoàn tiền nếu phê duyệt) |
| **Thanh toán chủ xe (Payout)**| `POST /api/payouts` | Tích hợp duyệt yêu cầu rút tiền của chủ xe | Chỉ `ADMIN` |
| **Đánh giá chuyến đi** | `POST /api/reviews` | Tích hợp form chấm sao & bình luận sau chuyến đi | Chỉ `CUSTOMER` (người thuê đánh giá) |
