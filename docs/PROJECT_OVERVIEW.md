# SBA301 – Car Rental Marketplace

Tài liệu mô tả tổng quan dự án môn **SBA301**: sàn cho thuê xe tự lái giữa chủ xe và người thuê, có admin quản lý.

---

## 1. Giới thiệu

### 1.1. Bài toán
Chủ xe đăng xe lên sàn và mở các **khung thời gian cho thuê (slot)**. Người thuê tìm slot còn trống, đặt một khoảng thời gian bên trong slot (theo giờ hoặc theo ngày), thanh toán, nhận xe, trả xe và đánh giá. Nền tảng thu hoa hồng trên mỗi đơn và chi trả phần còn lại cho chủ xe.

### 1.2. Vai trò người dùng

| Vai trò | Mô tả |
|---|---|
| **Khách (CUSTOMER)** | Một tài khoản có thể vừa là **người thuê**, vừa là **chủ xe** (khi đăng xe), vừa là **tài xế** (khi có hồ sơ tài xế) |
| **Admin (ADMIN)** | Duyệt giấy tờ người dùng và xe, quản lý voucher, xem toàn bộ đơn, giải quyết tranh chấp, chi trả |

### 1.3. Trục chính: `car_slots`
Mọi giao dịch xoay quanh slot. Slot là khoảng thời gian chủ xe cho phép thuê, kèm giá theo giờ/ngày được **chụp lại từ xe lúc tạo slot**, nên chủ xe sửa giá xe sau đó không làm đổi giá slot đã đăng. Đơn thuê luôn nằm trọn trong một slot.

---

## 2. Công nghệ

| Tầng | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 4.0.8 (Web MVC, Data JPA, Validation, Security), Lombok, springdoc-openapi (Swagger UI) |
| Cơ sở dữ liệu | PostgreSQL 15+ (Supabase), extension `btree_gist` |
| Frontend | React 19 + Vite 8, react-bootstrap / Bootstrap 5, react-router-dom 7, axios |
| Xác thực | JWT (Spring Security + jjwt) – do Function 1 phụ trách |
| Kiểm thử | JUnit 5, Mockito, AssertJ, MockMvc, H2 (in-memory) |
| Quản lý mã nguồn | Git, GitHub: `https://github.com/Tinh-Minh/SBA301` |

---

## 3. Kiến trúc

### 3.1. Tổng thể
Ứng dụng theo mô hình **Client – Server (SPA + REST API)**:

```
┌──────────────────────┐   HTTP/JSON (axios)   ┌─────────────────────────┐   JPA/JDBC   ┌──────────────┐
│  carrental-FE        │ ────────────────────> │  carrental-BE           │ ───────────> │  PostgreSQL  │
│  React + Bootstrap   │ <──────────────────── │  Spring Boot REST API   │ <─────────── │  (Supabase)  │
│  http://localhost:5173│   ApiResponseDTO      │  http://localhost:8080  │              │              │
└──────────────────────┘                       └─────────────────────────┘              └──────────────┘
```

### 3.2. Cấu trúc thư mục

```
SBA301/
├── carrental-BE/                      # Backend Spring Boot
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/carrental/
│       │   ├── config/                # Security, Swagger, CORS, Clock, Scheduling
│       │   ├── controller/            # @RestController
│       │   ├── service/               # Interface service
│       │   │   └── impl/              # Lớp cài đặt (tên có hậu tố Impl)
│       │   ├── repository/            # extends JpaRepository
│       │   ├── entity/                # @Entity map 1-1 với bảng
│       │   ├── dto/request|response/  # DTO vào/ra, có hàm fromEntity
│       │   ├── enums/                 # Enum khớp CHECK constraint trong DB
│       │   └── exception/             # Exception + GlobalExceptionHandler
│       ├── main/resources/application.properties
│       └── test/                      # Unit test + integration test (H2)
├── carrental-FE/                      # Frontend React
│   └── src/
│       ├── services/                  # api.js (axios dùng chung), *Service.js
│       ├── components/                # Component dùng lại
│       ├── pages/                     # Mỗi màn hình một file
│       └── utils/                     # Hàm định dạng
└── docs/                              # Tài liệu
```

### 3.3. Kiến trúc 3 tầng ở backend
**Controller → Service → Repository → Entity**, theo hướng dẫn môn học:
- **Controller** nhận request, validate DTO (`@Valid`), gọi service, trả `ResponseEntity<ApiResponseDTO<T>>`.
- **Service** chứa toàn bộ nghiệp vụ, mở transaction (`@Transactional`), kiểm tra quyền và trạng thái.
- **Repository** truy cập dữ liệu bằng Spring Data JPA (query method hoặc JPQL).
- **Entity** không bao giờ trả thẳng ra ngoài, luôn chuyển qua DTO.

---

## 4. Phân công chức năng

| Function | Người phụ trách | Bảng | Nội dung |
|---|---|---|---|
| **F1** – Tài khoản, xác minh, nền tảng | (nhóm phân công) | `customers`, `user_documents`, `drivers`, `bank_accounts`, `vouchers` | Đăng ký, đăng nhập JWT, Spring Security, phân quyền CUSTOMER/ADMIN, CORS, gửi và duyệt giấy tờ, hồ sơ tài xế, tài khoản ngân hàng, admin quản lý voucher |
| **F2** – Xe và slot (nguồn cung) | (nhóm phân công) | `cars`, `car_images`, `car_documents`, `car_slots` | Chủ xe đăng xe, upload ảnh và giấy tờ xe, admin duyệt xe, tạo/đóng/huỷ slot, tìm slot trống có lọc (thành phố, loại xe, giờ/ngày, giá) và phân trang |
| **F3** – Đặt xe và vòng đời đơn | Trần Nguyễn Bảo Việt | `rental_orders`, `action_logs`, `order_handovers`, `handover_images` | Tính tiền, tạo đơn, chống trùng lịch, chủ xe xác nhận/từ chối, huỷ, tự chuyển EXPIRED, bàn giao nhận/trả xe, ghi log mọi lần đổi trạng thái |
| **F4** – Tiền và hậu kỳ | Lộc | `transactions`, `payouts`, `extra_fees`, `disputes`, `dispute_evidences`, `reviews` | Thanh toán và cọc (giả lập cổng thanh toán), hoàn tiền, chi trả cho chủ xe, phí phát sinh, tranh chấp và bằng chứng, đánh giá sau chuyến |

### 4.1. Phụ thuộc giữa các function

```
F1 (Customer, Voucher, JWT) ──┐
                              ├──> F3 (RentalOrder, Handover) ──> F4 (Transaction, ExtraFee, Payout, Review)
F2 (Car, CarSlot) ────────────┘
```

Thứ tự merge đề xuất: **F1 → F2 → F3 → F4**.

---

## 5. Cơ sở dữ liệu

File định nghĩa: `Document/schema.sql` (PostgreSQL, bản v3). Chạy trên Supabase bằng SQL Editor.

### 5.1. Quy ước chung

| Quy ước | Trong DB | Trong Java |
|---|---|---|
| Khoá chính | `BIGINT GENERATED ALWAYS AS IDENTITY` | `@GeneratedValue(strategy = IDENTITY)`, kiểu `Long` |
| Trạng thái / loại | `VARCHAR` + `CHECK (... IN (...))` | `enum` + `@Enumerated(EnumType.STRING)`, tên hằng **phải trùng** giá trị CHECK |
| Thời gian | `TIMESTAMP` (không múi giờ), lưu **giờ Việt Nam**, hàm `vn_now()` | `LocalDateTime`, lấy từ `Clock` múi `Asia/Ho_Chi_Minh` |
| Tiền | `NUMERIC(14,0)` (VND không có số lẻ) | `BigDecimal` |
| Bảng người dùng | `customers` (tránh từ khoá `user`) | `Customer` |
| Khoá lạc quan | cột `version` ở `car_slots`, `rental_orders`, `payouts` | `@Version` |
| `updated_at` | trigger tự cập nhật | `@PreUpdate` hoặc để DB xử lý |

### 5.2. Danh sách bảng

**Nhóm người dùng (F1)**

| Bảng | Mô tả | Cột chính |
|---|---|---|
| `customers` | Tài khoản | `full_name`, `email` (unique không phân biệt hoa thường), `phone` (unique), `password_hash`, `kyc_status` (NONE/PENDING/VERIFIED/REJECTED), `role` (CUSTOMER/ADMIN), `status` (ACTIVE/LOCKED) |
| `user_documents` | Giấy tờ: CCCD, bằng lái, hộ chiếu | `doc_type`, `doc_number`, ảnh mặt trước/sau, `license_class` (bắt buộc với bằng lái), `verify_status` (PENDING/APPROVED/REJECTED), `verified_by` |
| `drivers` | Hồ sơ tài xế, 1 khách tối đa 1 hồ sơ | `status` (PENDING/ACTIVE/SUSPENDED) |
| `bank_accounts` | Tài khoản nhận tiền | `bank_name`, `account_number`, `is_default` (mỗi người tối đa 1 tài khoản mặc định) |

**Nhóm xe (F2)**

| Bảng | Mô tả | Cột chính |
|---|---|---|
| `cars` | Xe | `owner_id`, `driver_id`, `license_plate` (unique), hãng/model/năm, `car_type`, `seats`, `transmission`, `fuel_type`, `features` (JSONB), địa chỉ và toạ độ, giá giờ/ngày, `deposit_amount`, giới hạn km, `status` (PENDING_APPROVAL/ACTIVE/INACTIVE/REJECTED) |
| `car_images` | Ảnh xe | `image_url`, `is_primary` (mỗi xe tối đa 1 ảnh chính), `sort_order` |
| `car_documents` | Giấy tờ xe | `doc_type` (REGISTRATION/INSPECTION/INSURANCE), `verify_status` |
| `car_slots` | Khung giờ cho thuê | `start_time`, `end_time`, giá giờ/ngày đã chụp, `rental_option` (HOURLY/DAILY/BOTH), `min_rental_hours`, `status` (OPEN/CLOSED/CANCELLED), `version`. Ràng buộc **EXCLUDE**: hai slot chưa huỷ của cùng một xe không được chồng giờ |

**Nhóm đơn thuê (F3)**

| Bảng | Mô tả | Cột chính |
|---|---|---|
| `vouchers` | Mã giảm giá (F1 quản lý, F3 sử dụng) | `code`, `discount_type` (PERCENT/FIXED), `discount_value`, `max_discount`, `min_order_amount`, thời gian hiệu lực, `usage_limit`, `per_user_limit`, `used_count` |
| `rental_orders` | Đơn thuê | `order_code`, người thuê, xe, slot, voucher, `rental_type`, giờ đặt và giờ thực tế, các khoản tiền, `status`, `payment_status`, `expires_at`, thông tin huỷ, `commission_rate`, `version`. Ràng buộc **EXCLUDE**: một xe không có hai đơn PENDING/CONFIRMED/ONGOING chồng giờ |
| `action_logs` | Lịch sử thao tác của đơn | `actor_id` (NULL = hệ thống), `action`, `from_status`, `to_status`, `note` |
| `order_handovers` | Biên bản bàn giao | `handover_type` (PICKUP/RETURN), `odometer_km`, `fuel_percent`, `condition_note`, thời điểm hai bên xác nhận |
| `handover_images` | Ảnh bàn giao | `image_url`, `caption` |

**Nhóm tiền và hậu kỳ (F4)**

| Bảng | Mô tả | Cột chính |
|---|---|---|
| `extra_fees` | Phí phát sinh | `fee_type` (LATE_RETURN/FUEL/CLEANING/DAMAGE/TRAFFIC_FINE/EXTRA_KM/OTHER), `amount`, `status` (PENDING/PAID/DISPUTED/WAIVED), có thể gắn với một biên bản bàn giao |
| `disputes` | Tranh chấp | `reason`, `status` (OPEN/IN_REVIEW/RESOLVED/REJECTED), người giải quyết |
| `dispute_evidences` | Bằng chứng | `file_url`, `file_type` (IMAGE/VIDEO/DOCUMENT) |
| `transactions` | Giao dịch tiền | `transaction_type` (DEPOSIT/RENTAL_PAYMENT/EXTRA_FEE/REFUND), `method` (BANK_TRANSFER/MOMO/VNPAY/CASH), `status` (PENDING/SUCCESS/FAILED), `refund_of_id` |
| `payouts` | Chi trả cho chủ xe | `gross_amount`, `platform_fee`, `net_amount`, `status` (PENDING/PROCESSING/PAID/FAILED), `version` |
| `reviews` | Đánh giá | `rating` 1–5, `comment`. Mỗi người đánh giá một đơn một lần, không tự đánh giá mình |

### 5.3. Sơ đồ quan hệ chính

```
customers ─┬─< user_documents
           ├── drivers ──(0..1)── cars
           ├─< bank_accounts
           └─< cars ─┬─< car_images
                     ├─< car_documents
                     └─< car_slots
                              │
vouchers ──────────┐          │
customers ─────────┼──< rental_orders >── (car_slot_id, car_id)
                   │       ├─< action_logs
                   │       ├─< order_handovers ─< handover_images
                   │       ├─< extra_fees ─< disputes ─< dispute_evidences
                   │       ├─< transactions
                   │       ├─< payouts >── bank_accounts
                   │       └─< reviews
```

### 5.4. Lớp bảo vệ dữ liệu trong DB (trigger)
1. **`trg_order_in_slot`**: đơn phải nằm trọn trong slot, slot phải đang OPEN khi tạo đơn, đúng hình thức thuê, đủ số giờ tối thiểu.
2. **`trg_slot_change`**: không cho thu hẹp hoặc huỷ slot khi còn đơn hiệu lực nằm ngoài khoảng mới.
3. **`set_updated_at`**: tự cập nhật `updated_at` cho mọi bảng có cột này.
4. **Row Level Security** bật cho mọi bảng: chặn truy cập qua Data API của Supabase. Spring Boot kết nối bằng user `postgres` (chủ bảng) nên vẫn đọc/ghi bình thường.

Service vẫn phải kiểm tra các quy tắc này trước. Trigger chỉ là lớp phòng thủ cuối.

---

## 6. Luồng nghiệp vụ chính

### 6.1. Luồng tổng thể

```
[F1] Đăng ký → Đăng nhập → Gửi giấy tờ → Admin duyệt
[F2] Chủ xe đăng xe → Upload ảnh, giấy tờ → Admin duyệt xe → Chủ xe mở slot
[F2] Người thuê tìm slot trống (lọc thành phố, loại xe, giá, thời gian)
[F3] Báo giá → Tạo đơn (PENDING) → Chủ xe xác nhận (CONFIRMED)
[F4] Người thuê thanh toán tiền thuê + cọc
[F3] Bàn giao nhận xe (ONGOING) → Bàn giao trả xe (COMPLETED)
[F4] Phí phát sinh / tranh chấp → Hoàn cọc → Chi trả chủ xe → Hai bên đánh giá
```

### 6.2. Vòng đời đơn thuê (F3)

```
            chủ xe xác nhận            PICKUP đủ 2 bên            RETURN đủ 2 bên
PENDING ───────────────────> CONFIRMED ─────────────────> ONGOING ─────────────────> COMPLETED
   │                             │
   ├── chủ xe từ chối ──> REJECTED
   ├── huỷ ─────────────> CANCELLED <── huỷ (trước khi nhận xe)
   └── quá hạn xác nhận ─> EXPIRED  (job hệ thống, mỗi phút)
```

| Từ | Sang | Ai thực hiện | Điều kiện |
|---|---|---|---|
| — | PENDING | Người thuê | Khoảng thuê hợp lệ, không trùng lịch, voucher hợp lệ |
| PENDING | CONFIRMED | Chủ xe | Chưa quá `expires_at` |
| PENDING | REJECTED | Chủ xe | Bắt buộc lý do |
| PENDING / CONFIRMED | CANCELLED | Người thuê / chủ xe / admin | Chủ xe và admin bắt buộc lý do |
| PENDING | EXPIRED | Hệ thống | `expires_at` đã qua |
| CONFIRMED | ONGOING | Hai bên | Biên bản PICKUP đủ 2 bên xác nhận, không sớm hơn giờ nhận 60 phút |
| ONGOING | COMPLETED | Hai bên | Biên bản RETURN đủ 2 bên xác nhận, số km trả ≥ số km nhận |

REJECTED, EXPIRED, CANCELLED, COMPLETED là trạng thái cuối. Mọi lần chuyển đều ghi `action_logs`.

### 6.3. Quy tắc tính tiền (F3)

| Mục | Công thức |
|---|---|
| Số lượng | HOURLY: số giờ làm tròn lên. DAILY: số ngày 24 giờ làm tròn lên |
| Đơn giá | `price_per_hour` hoặc `price_per_day` của slot |
| Tiền thuê | `rental_amount = unit_price × quantity` |
| Giảm giá | PERCENT: `rental_amount × % ` làm tròn xuống tới đồng, không vượt `max_discount`. FIXED: `discount_value`. Không bao giờ vượt tiền thuê |
| Tổng phải trả | `total_amount = rental_amount − discount_amount` |
| Tiền cọc | `deposit_amount` chụp từ xe, thu riêng, hoàn khi trả xe |
| Hoa hồng | `commission_rate` chụp từ cấu hình (mặc định 10%) |

Ví dụ: thuê theo ngày từ 08:00 ngày 15 đến 10:00 ngày 16 (26 giờ) → 2 ngày × 800.000 = 1.600.000đ; voucher 10% → giảm 160.000đ; tổng 1.440.000đ; cọc 2.000.000đ.

**Voucher hợp lệ khi:** đang ACTIVE, trong thời gian hiệu lực, tiền thuê đạt `min_order_amount`, `used_count` < `usage_limit`, số đơn người này đã dùng < `per_user_limit`. `used_count` tăng khi tạo đơn và được trả lại khi đơn bị từ chối, huỷ hoặc hết hạn.

---

## 7. Quy ước API

### 7.1. Định dạng response
Mọi API trả về `ApiResponseDTO` theo hướng dẫn môn học:

```json
{
  "status": 200,
  "message": "Get order successfully",
  "data": { }
}
```

Lỗi validate trả `data` là map `{ tênField: thông báo }`.

### 7.2. Mã HTTP

| Mã | Khi nào |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu sai, vi phạm quy tắc nghiệp vụ |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Xung đột: trùng lịch, sai trạng thái, bị người khác sửa đồng thời |
| 500 | Lỗi hệ thống |

### 7.3. Phân trang
Query `?page=0&size=10&sortBy=createdAt&direction=desc`. Response `data` gồm `content`, `page`, `size`, `totalElements`, `totalPages`.

### 7.4. Danh sách API của F3

| Method | Đường dẫn | Người dùng | Mô tả |
|---|---|---|---|
| POST | `/api/orders/quote` | Người thuê | Báo giá, chưa tạo đơn |
| POST | `/api/orders` | Người thuê | Tạo đơn |
| GET | `/api/orders/{id}` | Người thuê, chủ xe, admin | Chi tiết đơn |
| GET | `/api/orders/my-rentals` | Người thuê | Đơn mình đã thuê |
| GET | `/api/orders/my-cars` | Chủ xe | Đơn trên xe của mình |
| GET | `/api/orders` | Admin | Tất cả đơn |
| PUT | `/api/orders/{id}/confirm` | Chủ xe | Xác nhận |
| PUT | `/api/orders/{id}/reject` | Chủ xe | Từ chối (body `{ "reason": "..." }`) |
| PUT | `/api/orders/{id}/cancel` | Người thuê, chủ xe, admin | Huỷ |
| GET | `/api/orders/{id}/logs` | Người thuê, chủ xe, admin | Lịch sử đơn |
| POST | `/api/orders/{id}/handovers` | Người thuê, chủ xe | Lập biên bản PICKUP/RETURN |
| GET | `/api/orders/{id}/handovers` | Người thuê, chủ xe, admin | Danh sách biên bản |
| PUT | `/api/handovers/{id}/confirm` | Bên còn lại | Xác nhận biên bản |

Ví dụ tạo đơn:

```http
POST /api/orders
Content-Type: application/json

{
  "carSlotId": 1,
  "rentalType": "DAILY",
  "startTime": "2026-10-15T08:00:00",
  "endTime": "2026-10-16T10:00:00",
  "voucherCode": "GIAM10",
  "note": "Nhận xe tại nhà"
}
```

Tài liệu đầy đủ, có thể gọi thử: **Swagger UI** tại `http://localhost:8080/swagger-ui/index.html`.

---

## 8. Frontend

| Đường dẫn | Màn hình | Function |
|---|---|---|
| `/orders/new?slotId=` | Đặt xe: chọn hình thức, giờ nhận/trả, voucher, xem giá, đặt | F3 |
| `/orders/my-rentals` | Đơn tôi thuê, lọc trạng thái, phân trang | F3 |
| `/orders/my-cars` | Đơn đặt xe của tôi (chủ xe) | F3 |
| `/admin/orders` | Tất cả đơn (admin) | F3 |
| `/orders/:id` | Chi tiết đơn: xác nhận / từ chối / huỷ, biên bản bàn giao, lịch sử | F3 |

Quy ước frontend (theo hướng dẫn môn học):
- Gọi API qua `src/services/api.js` (axios), `baseURL` lấy từ biến `VITE_API_BASE_URL` trong file `.env`.
- Token lưu ở `localStorage` và gửi `Authorization: Bearer <token>`.
- Form validate bằng state `errors`, xác nhận thao tác nguy hiểm bằng `Modal`.

---

## 9. Cài đặt và chạy

### 9.1. Yêu cầu
JDK 21, Node.js 20+, Git. Không cần cài Maven (đã có `mvnw`).

### 9.2. Cơ sở dữ liệu
1. Tạo project Supabase (hoặc PostgreSQL 15+ cài trên máy).
2. Bật extension `btree_gist`.
3. Chạy toàn bộ `Document/schema.sql`.

### 9.3. Backend

```bash
cd carrental-BE
./mvnw spring-boot:run
```

Cấu hình kết nối trong `src/main/resources/application.properties`. Các cấu hình riêng của F3:

```properties
app.order.confirm-timeout-minutes=1440          # thời gian chủ xe được phép xác nhận
app.order.commission-rate=10.00                 # % hoa hồng nền tảng
app.order.pickup-early-minutes=60               # cho nhận xe sớm bao nhiêu phút
app.order.require-payment-before-pickup=false   # bật khi F4 cập nhật payment_status
app.order.expire-check-ms=60000                 # chu kỳ job chuyển EXPIRED
```

### 9.4. Frontend

```bash
cd carrental-FE
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

### 9.5. Kiểm thử

```bash
cd carrental-BE
./mvnw test
```

Test chạy trên H2 trong bộ nhớ (cấu hình ở `src/test/resources/application.properties`), **không** đụng DB dùng chung. F3 hiện có 35 test: tính tiền, chuyển trạng thái và toàn bộ luồng qua API.

---

## 10. Quy trình làm việc với Git

| Nhánh | Mục đích |
|---|---|
| `main` | Bản nộp cuối |
| `DEV` | Nhánh tích hợp, chứa khung dự án chung |
| `Viet-Function-3` | F3 |
| `Loc-Function-4` | F4 |
| `car-slot`, `BE`, `FE`, `Viet-+-Loc` | Nhánh phụ / gộp |

Quy ước commit: `feat(...)`, `fix(...)`, `test(...)`, `docs(...)`, `build:`, `config(...)`, mỗi commit một bước nhỏ, mô tả rõ thay đổi.

---

## 11. Vấn đề đang mở và rủi ro

### 11.1. Cần nhóm chốt
1. Thanh toán trước hay sau khi chủ xe xác nhận? Có cần hạn thanh toán riêng ngoài `expires_at` không?
2. `payment_status` chỉ được nhận UNPAID / PAID / REFUNDED (theo CHECK). Trạng thái "đã cọc" nên suy ra từ `transactions`.
3. Hoàn tiền khi huỷ đơn đã thanh toán: F4 xử lý dựa trên trạng thái CANCELLED.
4. Phí trả trễ: F3 ghi giờ trả thực tế, F4 tạo `extra_fees` loại LATE_RETURN.
5. Người thuê có bắt buộc bằng lái đã duyệt không?
6. Đơn đã CONFIRMED mà khách không đến nhận xe: có tự động huỷ không?

### 11.2. Rủi ro kỹ thuật
- **Mật khẩu DB đang nằm trong `application.properties` trên GitHub.** Cần đổi mật khẩu và chuyển sang biến môi trường.
- `ddl-auto=update` có thể làm Hibernate tự sửa bảng tạo từ `schema.sql`. Nên dùng `validate`.
- Nhiều nhánh đang tự tạo cùng một entity (Customer, Car, CarSlot, Voucher, RentalOrder…). Khi merge phải giữ **một** bản thống nhất theo quy ước ở mục 5.1.
- Hai kiểu response (`ApiResponseDTO` và `ApiResponse`) đang tồn tại song song. Cần thống nhất theo `ApiResponseDTO` của tài liệu môn học.

### 11.3. Phần tạm thời trong F3 (sẽ thay khi merge)
| File | Thay bởi |
|---|---|
| `entity/Customer`, `entity/Voucher` và repository | F1 |
| `entity/Car`, `entity/CarSlot` và repository | F2 |
| `HeaderCurrentUserServiceImpl` (header `X-User-Id`) | F1 – đọc người dùng từ JWT |
| Phần 3, 4 trong `config/Viet_Config` (Security, CORS, ô `X-User-Id` trên Swagger) | F1 – SecurityConfig, SwaggerConfig thật |
| Ô "User ID (tạm)" trên navbar frontend | F1 – trang đăng nhập |

---

## 12. Tài liệu tham khảo
- `Document/schema.sql` – định nghĩa cơ sở dữ liệu
- `docs/FUNCTION3.md` – chi tiết Function 3
- `docs/postman_api_testing_guide.md` (nhánh `Loc-Function-4`) – hướng dẫn test API Function 4
- Tài liệu môn học: *SBA301 – Hướng dẫn tạo Spring RESTful API (V2)*, *Hướng dẫn tạo project React + Bootstrap*, slide Chapter 1–22
