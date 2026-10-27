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

Mọi response theo `ApiResponse { success, code, message, data, errors, traceId }`. API tạo mới (đơn, biên bản) trả 201.
Danh sách dùng `PageRequestFactory` chung: tối đa 50 dòng/trang, `sortBy` chỉ nhận `createdAt, startTime, endTime, totalAmount, status, orderCode` (giá trị khác dùng `createdAt`).

## Mã lỗi

| HTTP | Khi nào |
|---|---|
| 400 | Dữ liệu sai, thiếu lý do, ngoài slot, voucher không hợp lệ, chuyển trạng thái không hợp lệ (luật trong `OrderStatus.validateTransitionTo`) |
| 401 / 403 | Chưa đăng nhập / không phải người thuê, chủ xe hoặc admin của đơn |
| 404 | Không có đơn, slot hoặc biên bản |
| 409 | Trùng lịch, đơn quá hạn xác nhận, huỷ đơn đã nhận xe, biên bản đã có hoặc đã xác nhận, dữ liệu vừa bị người khác sửa (`@Version`) |

## Cấu trúc code

| Phần | Ở đâu |
|---|---|
| Controller | `RentalOrderController`, `HandoverController` (trả `ApiResponse`, admin kiểm tra bằng `@PreAuthorize`) |
| Service | `RentalOrderServiceImpl`, `HandoverServiceImpl` (`@Slf4j`, try/catch qua hàm `run`), `PricingServiceImpl`, `ActionLogServiceImpl` |
| Job hết hạn | `scheduling/OrderExpirationScheduler` (bật/tắt bằng `app.scheduling.enabled`) |
| Luật trạng thái | enum `OrderStatus` (`canTransitionTo`, `validateTransitionTo`, `HOLDING_SCHEDULE` = trạng thái giữ lịch) |
| Thao tác ghi log | enum `OrderAction` |
| Quyền theo đơn | `RentalOrder.isRenter(user)`, `RentalOrder.isOwner(user)`, `CurrentUserService.isAdmin(user)` |
| Cấu hình | `config/OrderProperties` (`app.order.*`) |
| DTO | request: `QuoteRequest`, `CreateOrderRequest`, `OrderActionRequest`, `CreateHandoverRequest`, `HandoverImageRequest`; response (record): `PriceQuoteResponse`, `OrderResponse`, `HandoverResponse`, `ActionLogResponse` |
| Mã đơn | `util/OrderCodeGenerator` |
| Truy vấn | `RentalOrderRepository.search` (một truy vấn cho cả 3 danh sách) và `findWithDetailsById`, đều dùng `@EntityGraph` để tránh N+1 |

Danh tính người dùng lấy từ JWT qua `CurrentUserService` (Function 1). Ảnh bàn giao lưu qua `HandoverImageRequest` → `HandoverImageRepository`.

## Việc còn mở (cần thống nhất với nhóm)

- Function 4: bật `app.order.require-payment-before-pickup` khi luồng thanh toán ổn định; hoàn tiền/cọc khi đơn đã thanh toán bị huỷ, từ chối hoặc hết hạn.
- Function 1: đưa quy tắc voucher (còn hạn, đơn tối thiểu, lượt dùng, giới hạn mỗi người) về một hàm bên VoucherService.
- Biên bản lập xong mà bên kia không xác nhận, hoặc đơn CONFIRMED quá giờ trả mà chưa nhận xe: cần quy tắc hết hạn hoặc cho admin xử lý.
- `GET /api/orders/{id}/logs` và `/handovers` trả danh sách không phân trang (mỗi đơn chỉ vài dòng); cần nhóm chấp nhận ngoại lệ hoặc thêm phân trang.

## Cấu hình (`application.properties`)

```
app.order.confirm-timeout-minutes=1440
app.order.commission-rate=10.00
app.order.pickup-early-minutes=60
app.order.require-payment-before-pickup=false   # bật khi Function 4 cập nhật payment_status
app.order.expire-check-ms=60000
# app.scheduling.enabled mặc định true; test đặt false để tắt job
```

## Test

`./mvnw test` chạy trên H2 trong bộ nhớ (`src/test/resources/application.properties`), không đụng DB Supabase chung.
Test F3: `PricingServiceImplTest` (tính giá, voucher), `enums/OrderStatusTest` (luật trạng thái), `controller/RentalOrderFlowIntegrationTest` (luồng API, phân quyền, hết hạn, không N+1).
