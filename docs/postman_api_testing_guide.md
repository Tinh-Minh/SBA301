# Hướng dẫn kiểm thử API trên Postman – SBA301 Car Rental (Function 4)

Tài liệu này cung cấp hướng dẫn toàn diện để kiểm thử toàn bộ API thuộc **Function 4 (Thanh toán, Chi trả, Phí phát sinh, Khiếu nại & Đánh giá)**.

> [!TIP]
> **Nhập nhanh vào Postman:** Thư mục này đã có sẵn file bộ sưu tập chuẩn Postman v2.1.0:  
> 📁 **[carrental_postman_collection.json](file:///d:/Study/SBA302/project/SBA301/docs/carrental_postman_collection.json)**  
> Mở Postman -> Chọn **Import** -> Kéo thả file `carrental_postman_collection.json` vào là có đầy đủ toàn bộ 19 Request kèm biến `baseUrl` = `http://localhost:8080`.

---

## I. Chuẩn bị môi trường & Dữ liệu mồi (Database Seeding)

### 1. Khởi động Backend
- **Chạy bằng CLI:**
  ```powershell
  cd d:\Study\SBA302\project\SBA301\carrental-BE
  .\mvnw.cmd spring-boot:run
  ```
- **Cổng mặc định:** `http://localhost:8080`

### 2. Dữ liệu mồi trong Database (PostgreSQL `carrental`)
Vì các API liên kết khóa ngoại với các bảng gốc (`customers`, `cars`, `car_slots`, `rental_orders`, `bank_accounts`), hãy mở pgAdmin (Query Tool) và chạy đoạn SQL sau để đảm bảo đầy đủ các ràng buộc NOT NULL:

```sql
-- 1. Tạo 2 tài khoản khách hàng test (Người thuê xe và Chủ xe)
INSERT INTO customers (full_name, email, phone, password_hash, email_verified, kyc_status, role, status, created_at, updated_at)
VALUES 
('Nguyen Van Khach', 'khach@gmail.com', '0901234567', '$2a$10$hashDemo123', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
('Tran Van ChuXe', 'chuxe@gmail.com', '0909876543', '$2a$10$hashDemo123', true, 'VERIFIED', 'CUSTOMER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, role = 'CUSTOMER';

-- 2. Tạo tài khoản ngân hàng cho Chủ xe (lấy ID chủ xe theo email 'chuxe@gmail.com')
INSERT INTO bank_accounts (customer_id, bank_name, account_number, account_holder, is_default, created_at)
VALUES (
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1),
    'Vietcombank', 
    '0071000888999', 
    'TRAN VAN CHUXE', 
    true, 
    NOW()
)
ON CONFLICT (account_number) DO NOTHING;

-- 3. Tạo xe cho chủ xe
INSERT INTO cars (
    owner_id, license_plate, brand, model, manufacture_year, 
    car_type, seats, transmission, fuel_type, city, pickup_address, 
    price_per_hour, price_per_day, deposit_amount, features, status, created_at, updated_at
)
VALUES (
    (SELECT id FROM customers WHERE email = 'chuxe@gmail.com' LIMIT 1), 
    '51H-99999', 'Toyota', 'Vios', 2022, 
    'SEDAN', 5, 'AUTOMATIC', 'GASOLINE', 'TP. Hồ Chí Minh', '123 Nguyen Van Linh, Quan 7', 
    50000, 600000, 2000000, '["GPS", "Bluetooth", "Camera lùi"]'::jsonb, 'ACTIVE', NOW(), NOW()
)
ON CONFLICT (license_plate) DO UPDATE
SET status = 'ACTIVE';

-- 4. Tạo khung giờ thuê xe (Slot)
INSERT INTO car_slots (
    car_id, start_time, end_time, price_per_hour, price_per_day, rental_option, min_rental_hours, status, created_at, updated_at
)
VALUES (
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    NOW() - interval '1 day', NOW() + interval '5 days', 
    50000, 600000, 'BOTH', 1, 'OPEN', NOW(), NOW()
);

-- 5. Tạo đơn thuê xe test (liên kết qua subquery để đảm bảo đúng ID ngoại khóa)
INSERT INTO rental_orders (
    order_code, customer_id, car_id, car_slot_id, rental_type, 
    start_time, end_time, unit_price, quantity, rental_amount, discount_amount, total_amount, deposit_amount, 
    status, payment_status, commission_rate, version, created_at, updated_at
)
VALUES (
    'ORD-2026-001', 
    (SELECT id FROM customers WHERE email = 'khach@gmail.com' LIMIT 1), 
    (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1), 
    (SELECT id FROM car_slots WHERE car_id = (SELECT id FROM cars WHERE license_plate = '51H-99999' LIMIT 1) ORDER BY id DESC LIMIT 1), 
    'DAILY', 
    NOW(), NOW() + interval '2 days', 600000, 2, 1200000, 0, 1200000, 2000000, 
    'CONFIRMED', 'UNPAID', 10.00, 0, NOW(), NOW()
)
ON CONFLICT (order_code) DO UPDATE 
SET rental_type = 'DAILY', payment_status = 'UNPAID', total_amount = 1200000, deposit_amount = 2000000;
```

---

## II. Chi tiết 19 API Function 4

---

### 1. Phân hệ Giao dịch & Cổng thanh toán (`/api/transactions`)

#### 1.1. Tạo giao dịch Đặt cọc (Deposit)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/transactions/deposit`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "orderId": 1,
    "amount": 2000000,
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response (HTTP 200):**
  ```json
  {
    "success": true,
    "message": "Tạo giao dịch đặt cọc thành công",
    "data": {
      "id": 1,
      "orderId": 1,
      "orderCode": "ORD-2026-001",
      "transactionType": "DEPOSIT",
      "amount": 2000000,
      "method": "MOCK_GATEWAY",
      "status": "PENDING"
    }
  }
  ```

#### 1.2. Giả lập Cổng thanh toán xử lý thành công (Simulate Gateway)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/transactions/1/simulate-gateway`
- **Body:**
  ```json
  {
    "simulateSuccess": true,
    "providerRef": "VNPAY_TRANS_8888"
  }
  ```
- **Response (HTTP 200):** Giao dịch chuyển sang `SUCCESS`, cập nhật `paidAt`, đồng thời tự cập nhật `paymentStatus` của đơn thuê sang `DEPOSITED`.

#### 1.3. Thanh toán tiền thuê (Payment)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/transactions/payment`
- **Body:**
  ```json
  {
    "orderId": 1,
    "amount": 1200000,
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response (HTTP 200):** Tạo giao dịch thanh toán tiền thuê với trạng thái `PENDING`. Có thể gọi `simulate-gateway` để chuyển thành `SUCCESS` (cập nhật đơn thuê sang `PAID`).

#### 1.4. Hoàn tiền cọc sau chuyến đi (Refund)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/transactions/refund`
- **Body:**
  ```json
  {
    "parentTransactionId": 1,
    "amount": 2000000,
    "reason": "Hoàn tiền cọc sau khi kiểm tra xe nguyên vẹn"
  }
  ```
- **Response (HTTP 200):** Tạo giao dịch loại `REFUND`, cập nhật đơn thuê sang `DEPOSIT_REFUNDED`.

#### 1.5. Xem chi tiết giao dịch theo ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/transactions/1`
- **Response (HTTP 200):** Trả về chi tiết bản ghi Transaction.

#### 1.6. Lấy danh sách giao dịch (Phân trang & Bộ lọc)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/transactions?orderId=1&type=DEPOSIT&status=SUCCESS&page=0&size=10&sort=id,desc`

---

### 2. Phân hệ Chi trả cho chủ xe (`/api/payouts`)

#### 2.1. Tạo yêu cầu chi trả
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/payouts`
- **Body:**
  ```json
  {
    "orderId": 1,
    "recipientId": 2,
    "bankAccountId": 1,
    "grossAmount": 1200000,
    "platformFee": 120000,
    "note": "Chi trả tiền thuê chuyến đi ORD-2026-001 (khấu trừ 10% phí sàn)"
  }
  ```
- **Response (HTTP 200):** Tự động tính `netAmount` = `grossAmount` - `platformFee` = `1080000`. Trạng thái: `PENDING`.

#### 2.2. Xử lý chuyển đổi trạng thái chi trả
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/payouts/1/process`
- **Body (Chuyển sang PROCESSING):**
  ```json
  {
    "status": "PROCESSING",
    "note": "Kế toán đang tiến hành lệnh chuyển khoản ngân hàng"
  }
  ```
- **Body (Chuyển sang COMPLETED):**
  ```json
  {
    "status": "COMPLETED",
    "note": "Đã chuyển tiền vào tài khoản chủ xe thành công"
  }
  ```

#### 2.3. Xem chi tiết chi trả theo ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/payouts/1`

#### 2.4. Lấy danh sách chi trả phân trang
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/payouts?recipientId=2&status=COMPLETED&page=0&size=10&sort=id,desc`

---

### 3. Phân hệ Phí phát sinh (`/api/extra-fees`)

#### 3.1. Tạo phí phát sinh
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/extra-fees`
- **Body:**
  ```json
  {
    "orderId": 1,
    "createdById": 2,
    "feeType": "CLEANING",
    "amount": 150000,
    "description": "Phí rửa xe do khoang hành khách bám bùn đất sau chuyến đi"
  }
  ```
- *(Các loại phí hợp lệ trong `feeType`: `LATE_RETURN`, `CLEANING`, `DAMAGE`, `EXTRA_KM`, `OTHER`)*

#### 3.2. Thanh toán phí phát sinh
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/extra-fees/1/pay`
- **Body:**
  ```json
  {
    "method": "MOCK_GATEWAY"
  }
  ```
- **Response (HTTP 200):** Trạng thái phí đổi sang `PAID`, đồng thời tự động sinh thêm 1 bản ghi `Transaction` loại `EXTRA_FEE`.

#### 3.3. Miễn trừ phí phát sinh (Waive)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/extra-fees/1/waive?note=Hỗ trợ khách hàng thân thiết`
- **Response (HTTP 200):** Trạng thái phí đổi sang `WAIVED`.

#### 3.4. Xem chi tiết phí phát sinh theo ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/extra-fees/1`

#### 3.5. Lấy danh sách phí phát sinh phân trang
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/extra-fees?orderId=1&status=PENDING&page=0&size=10&sort=id,desc`

---

### 4. Phân hệ Khiếu nại & Bằng chứng (`/api/disputes`)

#### 4.1. Mở khiếu nại (kèm bằng chứng ban đầu)
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/disputes`
- **Body:**
  ```json
  {
    "orderId": 1,
    "extraFeeId": 1,
    "raisedById": 1,
    "reason": "Phí vệ sinh không hợp lý",
    "description": "Lúc nhận xe ghế đã có vết ố sẵn từ trước, không phải do khách làm dơ",
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
- *(Nếu có `extraFeeId`, phí phát sinh tương ứng sẽ tự động chuyển trạng thái sang `DISPUTED`)*

#### 4.2. Bổ sung thêm bằng chứng vào khiếu nại
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/disputes/1/evidences`
- **Body:**
  ```json
  {
    "uploadedById": 1,
    "fileUrl": "https://storage.carrental.vn/evidence/handover_video.mp4",
    "fileType": "VIDEO",
    "description": "Video quay cận cảnh lúc nhận xe"
  }
  ```

#### 4.3. Giải quyết khiếu nại
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/api/disputes/1/resolve`
- **Body:**
  ```json
  {
    "status": "RESOLVED_REFUND",
    "resolutionNote": "Đã xem bằng chứng video, chấp nhận hủy phí vệ sinh cho khách hàng",
    "resolvedById": 2
  }
  ```
- *(Các trạng thái giải quyết hợp lệ: `RESOLVED_REFUND`, `RESOLVED_PAYOUT`, `REJECTED`)*

#### 4.4. Xem chi tiết khiếu nại theo ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/disputes/1`
- **Response (HTTP 200):** Trả về chi tiết khiếu nại và toàn bộ danh sách bằng chứng (`evidences`) đính kèm.

#### 4.5. Lấy danh sách khiếu nại phân trang
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/disputes?orderId=1&status=OPEN&page=0&size=10&sort=id,desc`

---

### 5. Phân hệ Đánh giá sau chuyến đi (`/api/reviews`)

#### 5.1. Gửi đánh giá
- **Method:** `POST`
- **URL:** `{{baseUrl}}/api/reviews`
- **Body:**
  ```json
  {
    "orderId": 1,
    "reviewerId": 1,
    "revieweeId": 2,
    "rating": 5,
    "comment": "Chủ xe giao xe đúng giờ, nhiệt tình, xe đi rất êm và tiết kiệm nhiên liệu!"
  }
  ```
- **Quy tắc kiểm tra (Anti-duplicate):** Nếu cùng 1 `reviewerId` gửi đánh giá lần thứ 2 cho cùng 1 `orderId`, hệ thống sẽ trả về mã HTTP 400: `"Bạn đã gửi đánh giá cho đơn thuê này rồi"`.

#### 5.2. Xem chi tiết đánh giá theo ID
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/reviews/1`

#### 5.3. Lấy danh sách đánh giá phân trang
- **Method:** `GET`
- **URL:** `{{baseUrl}}/api/reviews?revieweeId=2&page=0&size=10&sort=id,desc`

---

## III. Tóm tắt danh mục Endpoint

| STT | Phân hệ | Phương thức | Endpoint | Chức năng |
|---|---|---|---|---|
| 1 | Transactions | POST | `/api/transactions/deposit` | Tạo giao dịch đặt cọc |
| 2 | Transactions | POST | `/api/transactions/payment` | Tạo giao dịch thanh toán đơn |
| 3 | Transactions | POST | `/api/transactions/{id}/simulate-gateway` | Giả lập cổng thanh toán |
| 4 | Transactions | POST | `/api/transactions/refund` | Hoàn tiền giao dịch |
| 5 | Transactions | GET | `/api/transactions/{id}` | Lấy chi tiết giao dịch |
| 6 | Transactions | GET | `/api/transactions` | Lấy danh sách giao dịch (phân trang) |
| 7 | Payouts | POST | `/api/payouts` | Tạo yêu cầu chi trả |
| 8 | Payouts | PUT | `/api/payouts/{id}/process` | Cập nhật trạng thái chi trả |
| 9 | Payouts | GET | `/api/payouts/{id}` | Lấy chi tiết chi trả |
| 10 | Payouts | GET | `/api/payouts` | Lấy danh sách chi trả (phân trang) |
| 11 | Extra Fees | POST | `/api/extra-fees` | Tạo phí phát sinh |
| 12 | Extra Fees | POST | `/api/extra-fees/{id}/pay` | Thanh toán phí phát sinh |
| 13 | Extra Fees | PUT | `/api/extra-fees/{id}/waive` | Miễn trừ phí phát sinh |
| 14 | Extra Fees | GET | `/api/extra-fees/{id}` | Lấy chi tiết phí phát sinh |
| 15 | Extra Fees | GET | `/api/extra-fees` | Lấy danh sách phí phát sinh (phân trang) |
| 16 | Disputes | POST | `/api/disputes` | Mở khiếu nại (kèm bằng chứng) |
| 17 | Disputes | POST | `/api/disputes/{id}/evidences` | Thêm bằng chứng khiếu nại |
| 18 | Disputes | PUT | `/api/disputes/{id}/resolve` | Giải quyết khiếu nại |
| 19 | Disputes | GET | `/api/disputes/{id}` | Lấy chi tiết khiếu nại & bằng chứng |
| 20 | Disputes | GET | `/api/disputes` | Lấy danh sách khiếu nại (phân trang) |
| 21 | Reviews | POST | `/api/reviews` | Gửi đánh giá sau chuyến đi |
| 22 | Reviews | GET | `/api/reviews/{id}` | Lấy chi tiết đánh giá |
| 23 | Reviews | GET | `/api/reviews` | Lấy danh sách đánh giá (phân trang) |
