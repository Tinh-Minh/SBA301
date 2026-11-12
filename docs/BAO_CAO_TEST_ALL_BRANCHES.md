# Báo cáo sửa lỗi & bổ sung chức năng – nhánh `Test_All_Branches`

| | |
|---|---|
| Ngày | 12/11/2026 |
| Nhánh | `Test_All_Branches` (gốc `4c2ffcc`), 44 commit mới – mỗi lỗi / chức năng một commit |
| Môi trường test | Linux, Java 21, PostgreSQL 16 (DB `carrental`), Node 22, Vite :3000, Spring Boot :8080, Chromium (Playwright) |
| Tài khoản mẫu | mật khẩu `Password123@` – admin@carrental.vn, binh@gmail.com (chủ xe), khach@gmail.com / dung@gmail.com (khách) |

## 1. Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| Lỗi trong báo cáo kiểm thử `car-slot` | **31 / 36 đã sửa**, 2 đã kiểm chứng là không lỗi, 3 giữ nguyên có lý do (mục 2.6) |
| Lỗi mới tìm thấy và đã sửa | 5 (lý do từ chối xe bị mất, lệch múi giờ, tràn ngang trên điện thoại, gọi nhầm API 403, trang kết quả VNPay) |
| Chức năng mới | Tìm xe theo ngày nhận/trả, giá quy về **ngày + giờ**, quy trình đặt xe đầy đủ, xác nhận đã liên hệ khách, biên bản nhận/trả xe có ảnh để khách xác nhận từng mục, hồ sơ an toàn xe (đăng kiểm/bảo hiểm/bảo dưỡng/sửa chữa), bảng theo dõi theo từng xe + bảng tổng (chủ xe), bảng chuyến đi (khách), trang admin cho đơn thuê và hồ sơ an toàn, tải ảnh lên máy chủ |
| Test backend (`mvnw test`) | **97/97 đạt** (83 test cũ + 14 test hồi quy mới) |
| Luồng API đặt xe (script) | 24/24 bước đúng kỳ vọng (mục 5.2) |
| Luồng trình duyệt | Khách đặt → chủ xe liên hệ, nhận đơn, lập biên bản 7 ảnh → khách yêu cầu sửa 1 mục → chủ xe sửa → khách xác nhận → bắt đầu thuê: **đạt** |
| Rà soát giao diện | 4 vai trò × 48 trang × 2 kích thước (1366px, 390px): không còn lỗi JS, API lỗi bất thường, ảnh hỏng hay tràn ngang |
| Playwright có sẵn của FE | 14 đạt / 61 lỗi – các test lỗi dò những phần tử không còn trong giao diện hiện tại (mục 5.4) |


## 2. Sửa lỗi trong báo cáo kiểm thử

Nguyên tắc: không đổi luồng nghiệp vụ hiện có, chỉ chặn đúng chỗ sai và thêm kiểm tra.

### 2.1 Nghiêm trọng

| Mã | Đã sửa | Commit |
|---|---|---|
| F2-01 / F3-01 | Chủ xe chỉ được bật/tắt xe **đã được duyệt** (ACTIVE ⇄ INACTIVE). Xe chờ duyệt/bị từ chối trả 409, không mua gói được. | `b01f2f0` |
| F4-01 | `simulate-gateway` **tắt mặc định** (`APP_PAYMENT_SIMULATE_GATEWAY_ENABLED=true` mới bật), đọc đúng `simulateSuccess:false` → FAILED, giao dịch đã kết thúc không giả lập lại được. | `c577b8c` |
| X-01 | Seed chỉ chạy khi DB trống (hoặc `DB_RESET_ON_STARTUP=true`). Restart không còn mất dữ liệu. Thay đổi schema mới nằm trong `schema_updates.sql` (idempotent). | `9cab9de` |
| X-02 | Bỏ `carrental-BE/.env` khỏi git, VNPay `tmn-code`/`hash-secret` đọc từ biến môi trường, xoá secret khỏi Postman collection. **Các secret đã từng push vẫn còn trong lịch sử git → cần đổi toàn bộ.** | `8ea7e96` |

### 2.2 Function 1

| Mã | Đã sửa | Commit |
|---|---|---|
| F1-01 | `seed_data.sql` đồng bộ từ `seeddb.sql` UTF-8 sạch, hết lỗi font | `fe4e19f` |
| F1-02 | Lưu `password_changed_at`; token cấp trước lần đổi mật khẩu bị từ chối (401). Trang hồ sơ tự đăng nhập lại sau khi đổi. | `98bc67b` |
| F1-03 | Ô đăng nhập ghi “Email”, kiểu `email` | `74a3731` |
| F1-04 | Ô đồng ý điều khoản không còn tick sẵn | `11f0925` |
| F1-05 | Quên mật khẩu / liên hệ không còn submit GET làm lộ email lên URL; trang hướng dẫn liên hệ tổng đài | `049cd30` |
| F1-06 | Gửi trùng giấy tờ cùng loại khi đang chờ duyệt → 409 `DOCUMENT_PENDING_EXISTS` | `6138e0e` |
| F1-09 | Ẩn “Gói đăng tin”, “Kênh chủ xe” khỏi menu của khách | `23b08e0` |

### 2.3 Function 2

| Mã | Đã sửa | Commit |
|---|---|---|
| F2-02 | API tìm kiếm công khai luôn chỉ trả xe LISTED | `0a850f5` |
| F2-03 | So trùng biển số sau khi bỏ `-`, `.`, khoảng trắng | `087a9f0` |
| F2-04 | Admin chỉ duyệt được xe khi **giấy đăng ký xe đã xác minh** | `e0a30b3` |
| F2-05 | Lưu giá cuối tuần, tiền cọc, giới hạn km, phí quá km, phí trễ giờ; bỏ “Phí CarDB 10% / payout / C10” | `5a9f24a` |
| F2-06 | URL ảnh / giấy tờ chỉ nhận `http(s)://` hoặc `/…` | `c124a00` |
| F2-07 | `page<0`, `sortBy` lạ, `seats<1`, giá âm, `minPrice>maxPrice` → 400 | `89b3fff` |
| F2-08 | Thêm Toyota, Honda, Kia, Mazda, Mitsubishi, Ford, Suzuki, Nissan… | `b142b48` |
| F2-09 | Bắt buộc ảnh góc trước + giấy đăng ký xe, ghi rõ trên form | `714d731` |
| F2-10 | Xe không tồn tại: thông báo rõ + nút “Tìm xe khác” | `ef9a2f7` |
| F2-11 | Nhãn “Đã duyệt”; sidebar đếm “N xe” | `9f50c42` |
| F2-12 | **Không lỗi** – đã kiểm chứng: `PUT /api/cars/10` với xe bị từ chối → PENDING_APPROVAL. Bổ sung lưu và hiện **lý do từ chối** cho chủ xe | `0d7243a` |

### 2.4 Function 3

| Mã | Đã sửa | Commit |
|---|---|---|
| F3-02 | Thẻ gói trình bày dạng lưới; nút “Kích hoạt slot” chỉ hiện khi slot hiện tại hết hạn; lỗi hiện ngay trong thẻ; ngày giờ định dạng `HH:mm dd/MM/yyyy` | `20ef6d3` |
| F3-03 | Lịch hiển thị tô đậm slot đang chạy, viền nét đứt cho slot dự trữ, có chú thích | `e12c680` |
| F3-04 | Giao dịch của gói đã huỷ hiện “Đã huỷ” | `6cc7134` |
| F3-05 | “Đã chi cho gói đăng tin” thay cho “Đã thu” | `427ff24` |

### 2.5 Function 4

| Mã | Đã sửa | Commit |
|---|---|---|
| F4-02 | Không đánh giá được xe chưa duyệt; **chỉ khách đã hoàn tất chuyến thuê xe đó mới đánh giá được** | `c4793d8`, `b3864f6` |
| F4-03 | Admin gỡ đánh giá (`DELETE /api/admin/reviews/{id}` + nút trên /admin/reviews) | `ca312ce` |
| F4-04 / F4-05 | Thiếu `method` → mặc định VNPAY; gói không tồn tại → 404; người khác → 403 | `1856f2b` |
| F4-06 | Cột thời gian dùng `paidAt` | `6cc7134` |
| F4-07 | Xoá `PaymentForm.jsx`, `usePayments.js`, `createPayment/createDeposit` | `77aa52a` |
| X-05 | Thêm `BugFixRegressionIntegrationTest` (F2-01…F4-05) và `VNPayHtmlRendererTest` | nhiều commit |

### 2.6 Giữ nguyên / ngoài phạm vi repo

| Mã | Lý do |
|---|---|
| F1-07 (duyệt KYC tự đổi CUSTOMER→OWNER) | Là quy tắc nghiệp vụ nhóm đang dùng (commit `dfd6986`); không đổi logic chung. Nhóm cần thống nhất. |
| F1-08 (CCCD chỉ bắt buộc mặt trước) | Như trên – tuỳ quy định. |
| X-03, X-04 | Là thay đổi **chưa commit trên máy bạn** (`application.properties` dòng 46, `pom.xml`), không có trong repo. Khi commit: dùng `${DB_PASSWORD}` không dấu cách và bỏ dependency `graphql-dgs-codegen-gradle`. |

## 3. Lỗi mới tìm thấy và đã sửa

| Lỗi | Sửa | Commit |
|---|---|---|
| Lý do admin từ chối xe chỉ ghi log, chủ xe không biết sửa gì | Lưu `cars.reject_reason`, hiện trên “Xe của tôi” | `0d7243a` |
| Trên máy chủ UTC, `createdAt` lệch 7 giờ so với `Clock` VN → gói chờ thanh toán bị huỷ sai giờ; test `overduePendingIsCancelledAndReturnsVoucher` lỗi | Đặt múi giờ JVM theo `APP_TIME_ZONE`; surefire chạy `-Duser.timezone=Asia/Ho_Chi_Minh` | `314e4ca` |
| 3 trang admin tràn ngang ở 390px; caption `sr-only` thoát khỏi vùng cuộn | Lưới một cột dùng `minmax(0,1fr)`; vùng cuộn `position: relative` | `4a88aff` |
| Trang tài khoản của khách gọi `/api/cars/my-cars` → 403 | Chỉ gọi khi là chủ xe | `4a88aff` |
| Trang kết quả VNPay: dồn một bảng, hiện `PACKAGE_PAYMENT`, link `/my-subscriptions` không tồn tại, không escape HTML | Bố cục theo khối (số tiền → gói → thanh toán → bước tiếp theo), link đúng, escape | `09be125` |

## 4. Chức năng mới

### 4.1 Tìm xe (`/explore`, ô tìm ở trang chủ)
- **Bắt buộc chọn giờ nhận và giờ trả xe.** Kiểm tra giống backend: ít nhất 1 giờ sau hiện tại, thuê tối thiểu 4 giờ, tối đa 30 ngày.
- Chỉ hiện **xe còn trống lịch** trong khoảng đó (loại các xe có đơn đã xác nhận / đang thuê trùng giờ).
- Lọc thêm hộp số, nhiên liệu, khoảng giá; sắp xếp mới / giá tăng / giá giảm / nhiều chỗ.
- Mỗi thẻ xe hiện giá ngày, giá giờ và **tổng ước tính cho “N ngày M giờ”**. Bộ lọc được giữ trên URL.

### 4.2 Quy tắc tính tiền: quy về ngày + giờ
- Tổng thời gian làm tròn lên giờ → **số ngày (khối 24 giờ) + giờ lẻ**.
- Khối 24 giờ bắt đầu vào Thứ 7 / Chủ nhật tính giá cuối tuần (nếu chủ xe đặt).
- Giá giờ = 1/10 giá ngày (làm tròn lên 1.000đ); tiền giờ lẻ không vượt quá giá 1 ngày.
- Km bao gồm = giới hạn km/ngày × số ngày tính phí. Khi trả xe, hệ thống tự tính phí quá km, phí trễ giờ (trễ quá 15 phút, làm tròn lên giờ) và phí khác chủ xe ghi kèm lý do.

### 4.3 Quy trình đặt xe (tham khảo Mioto / Trip.com)

```
Khách gửi yêu cầu (chưa trả tiền trên CarDB)
 → Chủ xe GỌI cho khách và bấm "Tôi xác nhận đã liên hệ" kèm nội dung trao đổi   (bắt buộc trước khi nhận đơn)
 → Chủ xe xác nhận cho thuê  /  từ chối có lý do        (quá giờ nhận xe mà chưa xác nhận → tự hết hạn)
 → Khi giao xe: chủ xe lập BIÊN BẢN NHẬN XE
      số km, % nhiên liệu/pin, ảnh + mô tả cho 7 hạng mục bắt buộc
      (4 phía thân xe, nội thất, đồng hồ, giấy tờ xe) + lốp, phụ kiện, vết trầy (tuỳ chọn)
 → Khách xem TỪNG MỤC: "Đúng hiện trạng" hoặc "Chưa đúng, cần sửa" + ghi rõ cần sửa gì
      → chủ xe phải sửa đúng và đủ các mục đó (chụp lại / mô tả lại) rồi gửi lại
      → lặp lại tới khi mọi mục được khách xác nhận → ĐANG THUÊ
 → Khi nhận lại xe: BIÊN BẢN TRẢ XE (cùng cách xác nhận từng mục) + chốt phụ phí → HOÀN TẤT
 → Khách được đánh giá xe
```
- Chống trùng lịch bằng khoá dòng xe (hai yêu cầu cùng lúc không thể cùng được xác nhận).
- Khách, chủ xe hoặc admin huỷ đơn kèm lý do. Khách và chủ xe huỷ được trước khi bàn giao, admin huỷ được mọi đơn chưa kết thúc.
- Ảnh tải trực tiếp từ camera / thư viện (`POST /api/uploads/images`, kiểm tra nội dung thật là JPEG/PNG/WebP, tối đa 5MB).

### 4.4 Hồ sơ an toàn xe
- Chủ xe khai báo **đăng kiểm** (kết quả đạt/không đạt, hạn), **bảo hiểm** (hạn), **bảo dưỡng** (km, lần tới), **sửa chữa**, kèm ảnh chứng từ. Admin xác minh hoặc từ chối có lý do.
- Bản ghi đã xác minh không thể bị chủ xe xoá; sửa bản ghi thì phải xác minh lại.
- Trang xe hiển thị nhãn **An toàn / Cần lưu ý / Không đạt-hết hạn / Chưa đủ thông tin**, hạn đăng kiểm và bảo hiểm, bảo dưỡng gần nhất, số km, số lần sửa chữa, cảnh báo (sắp hết hạn ≤ 30 ngày, quá 12 tháng chưa bảo dưỡng…) và lịch sử. Nếu chưa có lịch sử thì dùng giấy tờ xe đã nộp khi đăng ký.

### 4.5 Bảng theo dõi
- **Chủ xe – bảng tổng** (`/owner/dashboard`): số xe / đã duyệt / đang hiển thị, việc cần làm, doanh thu cho thuê, sắp thu, chi gói đăng tin, **thực nhận** (doanh thu − chi gói), biểu đồ 6 tháng, bảng từng xe (trạng thái duyệt & hiển thị, mức an toàn, số đơn theo trạng thái, doanh thu, chi gói, đánh giá, lần giao xe kế tiếp).
- **Chủ xe – từng xe** (`/owner/vehicles/:id/overview`): doanh thu, sắp thu, chi gói và lãi, đơn của riêng xe đó, quản lý hồ sơ an toàn.
- **Chủ xe – đơn thuê** (`/owner/bookings`): tab Cần xử lý / Yêu cầu mới / Đã xác nhận / Đang thuê / Hoàn tất / Huỷ.
- **Khách** (`/trips`): sắp tới, đang thuê (kèm tiền cọc đang giữ), hoàn tất (số giờ lái), tổng chi tiêu, biểu đồ chi tiêu 6 tháng, mục “Cần bạn xử lý”, lịch sử theo tab.

### 4.6 Admin
- `/admin/bookings`: thống kê (tổng, chờ chủ xe, đang thuê, **biên bản bị tranh chấp**, giá trị chuyến hoàn tất), lọc theo trạng thái, mã đơn, tên khách/chủ xe, biển số; xem đầy đủ biên bản và huỷ đơn.
- `/admin/safety`: xác minh / từ chối hồ sơ an toàn kèm ảnh chứng từ.
- `/admin/reviews`: gỡ đánh giá. Trang tổng quan admin có thêm số liệu đơn thuê.

### 4.7 API mới

| Phương thức & đường dẫn | Quyền |
|---|---|
| `GET /api/cars/{id}/quote?pickupAt&returnAt`, `GET /api/cars/{id}/availability`, `GET /api/cars/{id}/safety` | công khai |
| `GET /api/cars/search?…&pickupAt&returnAt&transmission&fuelType` | công khai |
| `POST /api/bookings`, `GET /api/bookings/my`, `POST /api/bookings/{id}/handovers/{PICKUP\|RETURN}/respond` | khách / chủ xe |
| `GET /api/bookings/owner`, `POST /api/bookings/{id}/contacted\|accept\|reject`, `POST\|PUT /api/bookings/{id}/handovers/{type}` | chủ xe |
| `GET /api/bookings/{id}`, `POST /api/bookings/{id}/cancel` | các bên liên quan |
| `GET /api/dashboards/owner`, `GET /api/dashboards/customer` | chủ xe / khách |
| `POST\|PUT\|DELETE /api/cars/{id}/safety-records[/{rid}]` | chủ xe |
| `GET /api/admin/bookings[/stats]`, `GET /api/admin/safety-records`, `PATCH /api/admin/cars/{id}/safety-records/{rid}/verify`, `DELETE /api/admin/reviews/{id}` | admin |
| `POST /api/uploads/images`, `GET /api/uploads/files/{name}` | đăng nhập / công khai |

Bảng mới: `bookings`, `handovers`, `handover_items`, `car_safety_records`. Cột mới: `cars` (5 cột điều khoản thuê + `reject_reason`), `customers.password_changed_at`. Tất cả đều được tạo bằng `schema_updates.sql`, **không cần xoá DB cũ**. Dữ liệu mẫu nằm trong `seed_data_extras.sql`.

## 5. Kết quả kiểm thử

### 5.1 Backend (`./mvnw test`)
97 test, 0 lỗi. Trước khi sửa múi giờ, `CarSubscriptionFlowIntegrationTest.overduePendingIsCancelledAndReturnsVoucher` lỗi trên máy chủ UTC (lỗi có sẵn, không do thay đổi lần này).

### 5.2 Luồng API đặt xe (PostgreSQL thật)
Báo giá 2 ngày 5 giờ = 2×700.000 + 5×70.000 ✔ · thuê < 4 giờ bị chặn ✔ · đánh giá khi chưa thuê → 403 ✔ · tạo đơn ✔ · chủ xe tự đặt xe mình bị chặn ✔ · nhận đơn khi chưa liên hệ → 409 ✔ · người ngoài xem đơn → 403 ✔ · xác nhận đã liên hệ ✔ · nhận đơn ✔ · khách khác đặt trùng giờ → 409 ✔ · tìm kiếm ẩn xe đã kín lịch ✔ · biên bản thiếu ảnh giấy tờ bị chặn ✔ · gửi biên bản ✔ · khách yêu cầu sửa 1 mục ✔ · phản hồi lại khi đang chờ sửa → 409 ✔ · chủ xe sửa ✔ · khách xác nhận → IN_PROGRESS ✔ · biên bản trả xe + phí khác ✔ · xác nhận → COMPLETED ✔ · admin xem danh sách ✔ · khách huỷ đơn ✔.

### 5.3 Giao diện
- Luồng trình duyệt đầy đủ (mục 1) đạt.
- Duyệt tự động 48 trang × 4 vai trò × 2 kích thước. Sau khi sửa chỉ còn `GET /api/cars/9 → 404` khi mở xe chưa duyệt, và đây là hành vi đúng.

### 5.4 Playwright có sẵn của FE (`npx playwright test`)
14 đạt, 61 lỗi. Các test lỗi tìm phần tử như `#view-login form`, `.hero-car-video`, `#estimate-total`, luồng ngân hàng / tranh chấp / đơn theo giờ của **giao diện cũ**. Những phần tử này đã không còn từ trước lần sửa này, nên lỗi không do thay đổi lần này. Nhóm nên viết lại hoặc xoá bộ test này.

## 6. Cách chạy

```bash
# backend (lần đầu tự tạo schema + dữ liệu mẫu; dữ liệu được giữ qua các lần restart)
cd carrental-BE && ./mvnw spring-boot:run
# làm lại dữ liệu demo một lần
DB_RESET_ON_STARTUP=true ./mvnw spring-boot:run
# bật giả lập thanh toán khi test nội bộ
APP_PAYMENT_SIMULATE_GATEWAY_ENABLED=true ./mvnw spring-boot:run
```
Biến môi trường mới (xem `.env.example`): `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `APP_PAYMENT_SIMULATE_GATEWAY_ENABLED`, `DB_RESET_ON_STARTUP`, `APP_UPLOAD_ROOT`, `APP_FRONTEND_URL`, `APP_TIME_ZONE`.

## 7. Việc nhóm cần làm tiếp
1. Đổi mật khẩu DB, JWT secret, VNPay hash secret và mật khẩu Supabase cũ, vì chúng vẫn còn trong lịch sử git.
2. Thống nhất quy tắc F1-07 / F1-08.
3. Viết lại bộ test Playwright cũ theo giao diện hiện tại.
4. Thanh toán tiền thuê hiện là trực tiếp giữa hai bên (CarDB lưu biên bản làm bằng chứng). Nếu muốn CarDB thu hộ hoặc giữ cọc thì cần thêm phần thanh toán và hoàn tiền.
