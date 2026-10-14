# Function 3 – Đặt xe và vòng đời đơn

Bảng phụ trách: `rental_orders`, `action_logs`, `order_handovers`, `handover_images`.

## Vòng đời đơn

```
PENDING ──chủ xe xác nhận──> CONFIRMED ──biên bản PICKUP đủ 2 bên──> ONGOING ──biên bản RETURN đủ 2 bên──> COMPLETED
   │                             │
   ├─chủ xe từ chối──> REJECTED  └─huỷ (người thuê/chủ xe/admin)──> CANCELLED
   ├─huỷ──> CANCELLED
   └─quá hạn xác nhận (job mỗi phút)──> EXPIRED
```

- Mỗi lần đổi trạng thái / lập / xác nhận biên bản đều ghi `action_logs` (actor NULL = hệ thống).
- Hạn xác nhận `expires_at` = min(tạo đơn + `app.order.confirm-timeout-minutes`, giờ nhận xe).
- Chống trùng lịch: service kiểm tra trước, DB còn `EXCLUDE rental_orders_no_overlap` (lỗi được trả về 409).

## Tính tiền

- HOURLY: số giờ làm tròn lên; DAILY: số ngày 24h làm tròn lên. Đơn giá lấy từ `car_slots`.
- Voucher: ACTIVE, trong thời gian hiệu lực, đạt `min_order_amount`, còn `usage_limit`, chưa vượt `per_user_limit`.
  PERCENT làm tròn xuống tới đồng và không vượt `max_discount`; FIXED không vượt tiền thuê.
- `used_count` tăng khi tạo đơn, giảm lại khi đơn REJECTED / CANCELLED / EXPIRED.
- `deposit_amount` chụp từ `cars.deposit_amount`; `commission_rate` chụp từ `app.order.commission-rate`.

## API (Swagger: http://localhost:8080/swagger-ui/index.html)

| Method | Path | Ai gọi |
|---|---|---|
| POST | `/api/orders/quote` | Người thuê – báo giá |
| POST | `/api/orders` | Người thuê – tạo đơn |
| GET | `/api/orders/{id}` | Người thuê / chủ xe / admin |
| GET | `/api/orders/my-rentals?status&page&size&sortBy&direction` | Người thuê |
| GET | `/api/orders/my-cars?...` | Chủ xe |
| GET | `/api/orders?...` | Admin |
| PUT | `/api/orders/{id}/confirm` | Chủ xe |
| PUT | `/api/orders/{id}/reject` `{reason}` | Chủ xe (bắt buộc lý do) |
| PUT | `/api/orders/{id}/cancel` `{reason}` | Người thuê / chủ xe / admin (chủ xe, admin bắt buộc lý do) |
| GET | `/api/orders/{id}/logs` | Người thuê / chủ xe / admin |
| POST | `/api/orders/{id}/handovers` | Người thuê / chủ xe – lập biên bản PICKUP/RETURN |
| GET | `/api/orders/{id}/handovers` | Người thuê / chủ xe / admin |
| PUT | `/api/handovers/{id}/confirm` | Bên còn lại xác nhận biên bản |

Mọi response theo `ApiResponseDTO { status, message, data }`.

## Phần TẠM THỜI cần thay khi merge (đã đánh dấu "TẠM THỜI" trong code)

| File | Thay bởi |
|---|---|
| `repository/CustomerRepository` | Function 1 |
| `repository/VoucherRepository` (giữ `increaseUsage`, `decreaseUsage`) | Function 1 |
| `repository/CarSlotRepository` | Function 2 |
| `service/impl/HeaderCurrentUserServiceImpl` (header `X-User-Id`) | Function 1: cài `CurrentUserService` đọc từ JWT |
| `config/TempSecurityConfig`, `config/TempSwaggerHeaderConfig` | Function 1: SecurityConfig + SwaggerConfig thật |
| FE: ô "User ID (tạm)" trên `AppNavbar`, header `X-User-Id` trong `services/api.js` | Function 1: trang đăng nhập, lưu `token` |

Entity và enum dùng chung (`Customer`, `Car`, `CarSlot`, `Voucher`, `RentalOrder`, `ActionLog`, `OrderHandover`, `HandoverImage`...) lấy từ nhánh `BE` của Minh, Function 3 không sửa. Quy tắc chuyển trạng thái đơn nằm ở `service/OrderStatusRules`; ảnh bàn giao lưu qua `HandoverImageRepository`.

## Cấu hình (`application.properties`)

```
app.order.confirm-timeout-minutes=1440
app.order.commission-rate=10.00
app.order.pickup-early-minutes=60
app.order.require-payment-before-pickup=false   # bật khi Function 4 cập nhật payment_status
app.order.expire-check-ms=60000
```

## Test

`./mvnw test` chạy trên H2 trong bộ nhớ (`src/test/resources/application.properties`), không đụng DB Supabase chung.
