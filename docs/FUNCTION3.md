# Function 3 – Gói đăng tin và vòng đời tin đăng

Bảng phụ trách: `car_subscriptions`. Bảng `rental_orders`, `action_logs`, `order_handovers`, `handover_images` đã bỏ theo mô hình đăng tin mới.

## Vòng đời gói

```
              thanh toán thành công (F4)            quá end_date (job mỗi đầu giờ)
PENDING_PAYMENT ─────────────────────────> ACTIVE ─────────────────────────────────> EXPIRED
      │                                       │
      └── chủ xe/admin huỷ, quá hạn thanh toán │── admin huỷ ──> CANCELLED
          (job mỗi đầu giờ) ──> CANCELLED
```

| Trạng thái gói | Tin đăng của xe (`cars.listing_status`) |
|---|---|
| `PENDING_PAYMENT` | Giữ nguyên, chưa hiển thị thêm |
| `ACTIVE` | `LISTED`, `current_subscription_id` trỏ tới gói này |
| `EXPIRED` | `EXPIRED` nếu gói là gói hiện tại của xe |
| `CANCELLED` | `UNLISTED` nếu huỷ gói đang hiển thị; huỷ gói chưa thanh toán thì xe giữ nguyên |

Luật chuyển trạng thái nằm trong enum `SubscriptionStatus`.

## Quy tắc mua gói

- Chỉ chủ xe mua được, và xe phải đã duyệt (`cars.status = ACTIVE`).
- Mỗi xe chỉ có một gói còn sống: đang có gói `ACTIVE` hoặc `PENDING_PAYMENT` thì trả 409, tránh trả tiền hai lần.
- Gia hạn là mua gói mới cho xe đã hết hạn tin; hiệu lực tính từ lúc thanh toán.
- Giá lấy từ `listing_packages` phía server. Voucher: `ACTIVE`, trong thời gian hiệu lực, đạt `min_order_amount`, còn `usage_limit`, chưa vượt `per_user_limit`.
- `used_count` tăng khi tạo yêu cầu, giảm lại khi huỷ gói chưa thanh toán.
- Voucher giảm hết tiền thì gói kích hoạt ngay, vì giao dịch thanh toán phải có `amount > 0`.

## API

| Method | Path | Ai gọi | Việc |
|---|---|---|---|
| GET | `/api/subscriptions/packages` | Chủ xe | Các gói đang bán |
| POST | `/api/subscriptions/quote` | Chủ xe | Tính tiền, không ghi DB |
| POST | `/api/subscriptions` | Chủ xe | Tạo yêu cầu mua gói |
| GET | `/api/subscriptions/my-subscriptions` | Chủ xe | Lịch sử mua gói |
| GET | `/api/subscriptions/{id}` | Chủ xe, Admin | Chi tiết, số ngày còn lại |
| PUT | `/api/subscriptions/{id}/cancel` | Chủ xe, Admin | Chủ xe huỷ gói chưa thanh toán; admin huỷ cả gói `ACTIVE` |
| GET | `/api/admin/subscriptions` | Admin | Toàn bộ gói, lọc theo `status` |

Thanh toán dùng API của F4: `POST /api/transactions/package-payment`.

## Nối với Function 4

`CarSubscriptionService.activateSubscription(id)` là điểm kích hoạt gói sau khi thanh toán thành công: kiểm tra luật chuyển trạng thái, tính `start_date`, `end_date`, chuyển xe sang `LISTED`, và gọi lại với gói đã `ACTIVE` thì không làm gì.

## Cấu trúc code

| Phần | File |
|---|---|
| Nghiệp vụ | `service/CarSubscriptionService`, `service/impl/CarSubscriptionServiceImpl` |
| API | `controller/CarSubscriptionController`, `controller/AdminSubscriptionController` |
| Job | `scheduling/SubscriptionExpirationScheduler` (bật/tắt bằng `app.scheduling.enabled`) |
| Dữ liệu | `entity/CarSubscription`, `repository/CarSubscriptionRepository`, `enums/SubscriptionStatus` |
| FE | `pages/subscriptions/`, `components/subscriptions/ListingStatusBar`, `services/subscriptionService`, `hooks/useSubscriptions`, `interfaces/subscription` |

## Cấu hình (`application.properties`)

```
app.subscription.payment-timeout-minutes=30
# app.scheduling.enabled mặc định true; test đặt false để tắt job
```

## Test

- Backend (`./mvnw test`, H2 trong bộ nhớ): `controller/CarSubscriptionFlowIntegrationTest`, `scheduling/SubscriptionExpirationSchedulerTest`, `enums/SubscriptionStatusTest`.
- Frontend (`npx playwright test`): `tests/subscriptions.spec.js`.
