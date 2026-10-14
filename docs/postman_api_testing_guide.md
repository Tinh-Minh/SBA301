# Hướng dẫn kiểm thử API trên Postman – SBA301 Car Rental (Function 4)

Tài liệu này hướng dẫn chi tiết cách thiết lập, gửi Request và kiểm tra Response chuẩn cho toàn bộ các API thuộc **Function 4**:
- Thanh toán & Cọc (`transactions`)
- Giả lập cổng thanh toán (`simulate-gateway`)
- Hoàn tiền (`refund`)
- Chi trả cho chủ xe (`payouts`)
- Phí phát sinh (`extra_fees`)
- Tranh chấp & Bằng chứng (`disputes`, `dispute_evidences`)
- Đánh giá sau chuyến (`reviews`)

---

## I. Chuẩn bị môi trường & Dữ liệu mồi

### 1. Khởi động Backend
- **IDE:** Mở project `carrental-BE` trong IntelliJ IDEA và bấm **Run `CarrentalApplication`**.
- **CLI:** Chạy lệnh `.\mvnw.cmd spring-boot:run` tại thư mục `carrental-BE`.
- **Cổng mặc định:** `http://localhost:8080`.

### 2. Dữ liệu mồi trong Database (PostgreSQL `carrental`)
Vì các API liên kết khóa ngoại với đơn thuê (`rental_orders`) và khách hàng (`customers`), hãy mở pgAdmin (Query Tool) chạy đoạn SQL sau để chuẩn bị dữ liệu test:

```sql
-- 1. Tạo 2 khách hàng test (Người thuê và Chủ xe)
INSERT INTO customers (id, full_name, email, phone, password_hash, email_verified, kyc_status, role, status)
VALUES 
(1, 'Nguyen Van Khach', 'khach@gmail.com', '0901234567', 'hash123', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE'),
(2, 'Tran Van ChuXe', 'chuxe@gmail.com', '0909876543', 'hash123', true, 'VERIFIED', 'OWNER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Tạo xe và slot xe cơ bản
INSERT INTO cars (id, owner_id, license_plate, brand, model, manufacture_year, car_type)
VALUES (1, 2, '51H-99999', 'Toyota', 'Vios', 2022, 'SEDAN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO car_slots (id, car_id, start_time, end_time, price_per_hour, price_per_day, rental_option, min_rental_hours, status)
VALUES (1, 1, NOW(), NOW() + interval '3 days', 50000, 600000, 'DAY', 1, 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- 3. Tạo 1 đơn thuê xe
INSERT INTO rental_orders (id, order_code, customer_id, car_slots_id, rental_type, start_time, end_time, unit_price, quantity, rental_amount, discount_amount, total_amount, deposit_amount, status, payment_status, commission_rate, version)
VALUES (1, 'ORD-2026-001', 1, 1, 'DAY', NOW(), NOW() + interval '2 days', 600000, 2, 1200000, 0, 1200000, 2000000, 'CONFIRMED', 'UNPAID', 10.00, 0)
ON CONFLICT (id) DO NOTHING;
```

### 3. Cấu hình Headers chung trong Postman
Tất cả các request `POST` và `PUT` đều cần Header:
- `Content-Type`: `application/json`

---

## II. Chi tiết Request & Response từng API

---

### 1. Luồng Thanh toán, Cọc & Cổng thanh toán (`/api/transactions`)

#### 1.1. Tạo giao dịch Đặt cọc (Deposit)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/transactions/deposit`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "amount": 2000000,
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Tạo giao dịch đặt cọc thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "orderCode": "ORD-2026-001",
      "parentTransactionId": null,
      "transactionType": "DEPOSIT",
      "amount": 2000000,
      "method": "MOCK_GATEWAY",
      "status": "PENDING",
      "providerRef": null,
      "paidAt": null,
      "createdAt": "2026-10-13T09:50:00Z"
    }
  }
  ```

---

#### 1.2. Giả lập Cổng thanh toán xử lý thành công (Simulate Gateway)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/transactions/1/simulate-gateway`
- **Body (raw JSON):**
  ```json
  {
    "simulateSuccess": true,
    "providerRef": "VNPAY_TRANS_8888"
  }
  ```
- **Response đúng (HTTP 200):**
  *(Giao dịch chuyển sang `SUCCESS`, cập nhật `paidAt`, đồng thời tự đổi trạng thái đơn thuê sang `DEPOSITED`)*
  ```json
  {
    "success": true,
    "message": "Xử lý cổng thanh toán thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "orderCode": "ORD-2026-001",
      "transactionType": "DEPOSIT",
      "amount": 2000000,
      "status": "SUCCESS",
      "providerRef": "VNPAY_TRANS_8888",
      "paidAt": "2026-10-13T09:51:00Z"
    }
  }
  ```

---

#### 1.3. Thanh toán tiền thuê (Payment)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/transactions/payment`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "amount": 1200000,
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response đúng (HTTP 200):**
  *(Giao dịch thanh toán được tạo với `status: "PENDING"`, sau đó có thể gọi lại API `simulate-gateway` với id tương ứng để hoàn tất thanh toán tiền thuê).*

---

#### 1.4. Hoàn tiền cọc sau chuyến đi (Refund)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/transactions/refund`
- **Body (raw JSON):**
  ```json
  {
    "parentTransactionId": 1,
    "amount": 2000000,
    "reason": "Hoàn đủ cọc xe sau khi khách trả xe nguyên vẹn"
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Hoàn tiền thành công",
    "data": {
      "id": 3,
      "orderId": 1,
      "parentTransactionId": 1,
      "transactionType": "REFUND",
      "amount": 2000000,
      "status": "SUCCESS"
    }
  }
  ```

---

#### 1.5. Lấy danh sách giao dịch (Phân trang)
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/transactions?orderId=1&page=0&size=10&sort=id,desc`
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "OK",
    "data": {
      "content": [
        { "id": 3, "transactionType": "REFUND", "status": "SUCCESS" },
        { "id": 2, "transactionType": "PAYMENT", "status": "PENDING" },
        { "id": 1, "transactionType": "DEPOSIT", "status": "SUCCESS" }
      ],
      "page": 0,
      "size": 10,
      "totalElements": 3,
      "totalPages": 1
    }
  }
  ```

---

### 2. Luồng Chi trả cho chủ xe (`/api/payouts`)

#### 2.1. Tạo yêu cầu chi trả
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/payouts`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "recipientId": 2,
    "grossAmount": 1200000,
    "platformFee": 120000,
    "note": "Chi trả tiền thuê chuyến đi ORD-2026-001 (khấu trừ 10% phí sàn)"
  }
  ```
- **Response đúng (HTTP 200):**
  *(Hệ thống tự tính `netAmount` = `grossAmount` - `platformFee` = 1,080,000)*
  ```json
  {
    "success": true,
    "message": "Tạo yêu cầu chi trả thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "recipientId": 2,
      "recipientName": "Tran Van ChuXe",
      "grossAmount": 1200000,
      "platformFee": 120000,
      "netAmount": 1080000,
      "status": "PENDING"
    }
  }
  ```

---

#### 2.2. Xử lý chuyển đổi trạng thái chi trả
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/payouts/1/process`
- **Body (raw JSON) - Bước 1: Đang duyệt:**
  ```json
  {
    "status": "PROCESSING",
    "note": "Kế toán đang tiến hành lệnh chuyển khoản"
  }
  ```
- **Body (raw JSON) - Bước 2: Hoàn tất:**
  ```json
  {
    "status": "COMPLETED",
    "note": "Đã chuyển tiền vào tài khoản chủ xe thành công"
  }
  ```
- **Response đúng (HTTP 200):** Trả về `status: "COMPLETED"`, cập nhật thời gian `paidAt`.

---

#### 2.3. Lấy danh sách chi trả của chủ xe (Phân trang)
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/payouts?recipientId=2&page=0&size=10`
- **Response đúng (HTTP 200):** Trả về cấu trúc `PageResponse` chứa các bản ghi chi trả.

---

### 3. Luồng Phí phát sinh (`/api/extra-fees`)

#### 3.1. Tạo phí phát sinh
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/extra-fees`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "createdById": 2,
    "feeType": "CLEANING",
    "amount": 150000,
    "description": "Phí rửa xe do khoang hành khách bám bùn đất"
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Tạo phí phát sinh thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "createdById": 2,
      "feeType": "CLEANING",
      "amount": 150000,
      "status": "PENDING"
    }
  }
  ```

---

#### 3.2. Thanh toán phí phát sinh
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/extra-fees/1/pay`
- **Body (raw JSON):**
  ```json
  {
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response đúng (HTTP 200):**
  *(Trạng thái phí đổi sang `PAID`, đồng thời tự động sinh thêm 1 bản ghi `Transaction` loại `EXTRA_FEE` tương ứng)*
  ```json
  {
    "success": true,
    "message": "Thanh toán phí phát sinh thành công",
    "data": {
      "id": 1,
      "status": "PAID"
    }
  }
  ```

---

#### 3.3. Hoặc Miễn trừ phí phát sinh (Waive)
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/extra-fees/1/waive?note=Khách thân thiết hỗ trợ miễn phí`
- **Response đúng (HTTP 200):** Trả về `status: "WAIVED"`.

---

### 4. Luồng Khiếu nại & Bằng chứng (`/api/disputes`)

#### 4.1. Mở khiếu nại (kèm bằng chứng ban đầu)
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/disputes`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "extraFeeId": 1,
    "raisedById": 1,
    "reason": "Phí vệ sinh không hợp lý",
    "description": "Lúc nhận xe ghế đã có vết ố sẵn từ trước",
    "evidences": [
      {
        "uploadedById": 1,
        "fileUrl": "https://storage.carrental.vn/evidence/photo_before_trip.jpg",
        "fileType": "IMAGE",
        "description": "Ảnh chụp thảm xe lúc bàn giao"
      }
    ]
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Mở khiếu nại thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "raisedById": 1,
      "reason": "Phí vệ sinh không hợp lý",
      "status": "OPEN",
      "evidences": [
        {
          "id": 1,
          "disputeId": 1,
          "fileUrl": "https://storage.carrental.vn/evidence/photo_before_trip.jpg",
          "fileType": "IMAGE"
        }
      ]
    }
  }
  ```

---

#### 4.2. Bổ sung thêm bằng chứng vào khiếu nại
*(Theo Quy ước 5: bảng con `dispute_evidences` được quản lý trực tiếp qua `DisputeController`)*
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/disputes/1/evidences`
- **Body (raw JSON):**
  ```json
  {
    "uploadedById": 1,
    "fileUrl": "https://storage.carrental.vn/evidence/handover_video.mp4",
    "fileType": "VIDEO",
    "description": "Video quay cận cảnh lúc nhận xe"
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Thêm bằng chứng khiếu nại thành công",
    "data": {
      "id": 2,
      "disputeId": 1,
      "fileUrl": "https://storage.carrental.vn/evidence/handover_video.mp4",
      "fileType": "VIDEO"
    }
  }
  ```

---

#### 4.3. Giải quyết khiếu nại
- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/disputes/1/resolve`
- **Body (raw JSON):**
  ```json
  {
    "status": "RESOLVED_REFUND",
    "resolutionNote": "Đã xem bằng chứng video, chấp nhận hủy phí vệ sinh cho khách",
    "resolvedById": 2
  }
  ```
- **Response đúng (HTTP 200):** Khiếu nại chuyển trạng thái `RESOLVED_REFUND` (hoặc `RESOLVED_PAYOUT`, `REJECTED`), cập nhật `resolutionNote` và `resolvedAt`.

---

### 5. Luồng Đánh giá sau chuyến (`/api/reviews`)

#### 5.1. Gửi đánh giá
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/reviews`
- **Body (raw JSON):**
  ```json
  {
    "orderId": 1,
    "reviewerId": 1,
    "revieweeId": 2,
    "rating": 5,
    "comment": "Chủ xe giao xe đúng giờ, nhiệt tình, xe đi rất êm và tiết kiệm xăng!"
  }
  ```
- **Response đúng (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Gửi đánh giá thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "orderCode": "ORD-2026-001",
      "reviewerId": 1,
      "reviewerName": "Nguyen Van Khach",
      "revieweeId": 2,
      "revieweeName": "Tran Van ChuXe",
      "rating": 5,
      "comment": "Chủ xe giao xe đúng giờ, nhiệt tình, xe đi rất êm và tiết kiệm xăng!",
      "createdAt": "2026-10-13T09:55:00Z"
    }
  }
  ```

> [!NOTE]
> Hệ thống có kiểm tra chống gửi đánh giá trùng: Nếu cùng 1 `reviewerId` gửi đánh giá lần 2 trên cùng 1 `orderId`, API sẽ trả về lỗi HTTP 400: `"Bạn đã gửi đánh giá cho đơn thuê này rồi"`.

---

#### 5.2. Lấy danh sách đánh giá của chủ xe (Phân trang)
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/reviews?revieweeId=2&page=0&size=10`
- **Response đúng (HTTP 200):** Trả về `PageResponse<ReviewResponse>`.
