# Báo cáo kiểm thử – CarDB (nhánh `Test_All_Branches`)

Tài liệu này gộp `BUG_REPORT.md`, `FIX_LOG.md`, `FINAL_REPORT.md` (đợt kiểm thử của Minh, 12–13/11/2026) và đợt kiểm thử, sửa lỗi nghiệp vụ trên nhánh `Test_All_Branches` (13/11/2026). Kế hoạch kiểm thử chi tiết xem [22_TEST_PLAN.md](22_TEST_PLAN.md).

## 1. Kết quả hiện tại

| Hạng mục | Kết quả |
|---|---|
| BE unit + integration test (`mvnw test`) | 135/137 pass. 2 test còn fail (`fullDepositPaymentFlowSuccess`, `depositPaymentFailureAndRetry`) do gọi API `simulate-gateway` đã bị gỡ khi chuyển sang VNPay thật |
| FE build (`npm run build`) | Thành công |
| Kiểm thử API luồng thuê xe đầy đủ trên DB seed sạch | 27/27 mục đạt |

## 2. Đợt 1 – kiểm thử của Minh (12–13/11/2026, nhánh `car-slot`)

| Mã | Nội dung | Kết quả |
|---|---|---|
| BUG-01 | Đăng ký lỗi 503 khi chưa cấu hình Mailjet | Đã sửa: môi trường dev fallback, ghi link xác thực ra log |
| BUG-02 | Thiếu `@EnableScheduling`, job hết hạn gói/đơn không chạy | Đã sửa |
| Mục 1 | Đổi mật khẩu: kiểm tra mật khẩu cũ, policy mật khẩu mới, vô hiệu token cũ | Đạt |
| Mục 2 | Nâng cấp chủ xe: admin duyệt hồ sơ thì role đổi sang `OWNER`, tối đa 3 lần nộp | Đạt |
| Mục 3–5 | Nạp `.env`, mail duyệt/từ chối chủ xe, giới hạn gửi lại mail (3 lần/10 phút, cooldown 60s) | Đạt |
| Mục 6 | Upload ảnh từ máy, chặn URL ngoài | Đạt |

Các ràng buộc đã thẩm định: token hết hạn trả 401; khách chưa KYC bị chặn khỏi `/owner/*`; tranh chấp biên bản bàn giao; khoá chống đặt trùng lịch; chỉ lập biên bản nhận xe trong 24 giờ trước giờ nhận; chống tự đánh giá xe của mình; voucher gói có giá trị tối thiểu.

## 3. Đợt 2 – kiểm thử toàn hệ thống và sửa lỗi (13/11/2026, nhánh `Test_All_Branches`)

### 3.1 Hạ tầng và bảo mật
| Mã | Lỗi | Cách sửa |
|---|---|---|
| SYS-01 | DB mới không khởi động được: `transactions` tham chiếu `bookings` trước khi bảng được tạo | FK được thêm trong `schema_updates.sql` |
| SYS-02 | Thiếu cột `reviews.approved`: mọi API đánh giá và dashboard chủ xe lỗi 500 | Thêm cột vào seed và `schema_updates.sql` |
| SYS-04 | Không giới hạn đăng nhập sai | Sai 5 lần trong 15 phút thì khoá 15 phút (429) |
| SYS-05 | VNPay chấp nhận thiếu `vnp_TransactionStatus`, log ra chữ ký đúng | Bắt buộc `00`, bỏ chữ ký khỏi log |
| SYS-06 | Swagger mở công khai | Tắt mặc định, bật bằng `SWAGGER_ENABLED=true` |
| SYS-07 | Lộ lỗi nội bộ (JSON parse, IPN) | Trả thông báo chung |
| SYS-08 | BE không đọc `.env` nên rơi về mật khẩu DB `1234` | `spring.config.import` nạp `.env` |

### 3.2 Đặt xe
| Mã | Lỗi | Cách sửa |
|---|---|---|
| BK-01 | Khách chưa KYC, không có GPLX vẫn đặt được xe | Bắt buộc KYC đã duyệt và GPLX còn hạn đến ngày trả |
| BK-02 | Không giới hạn số yêu cầu thuê | Tối đa 3 yêu cầu đang chờ mỗi khách |
| BK-03 | Khách khác chờ vô ích với yêu cầu trùng giờ | Chủ xe xác nhận một đơn thì các yêu cầu trùng giờ tự bị từ chối |
| BK-04 | Đơn đã xác nhận chưa cọc giữ lịch xe vô hạn | Quá 2 giờ không cọc thì tự huỷ |
| BK-05 | Giao xe khi khách chưa cọc | Biên bản nhận xe yêu cầu đã cọc |
| BK-06 | Xe miễn cọc bị ghi "đã thanh toán cọc" | Trạng thái `NOT_REQUIRED` |
| BK-08 | Chủ xe bỏ khách phút chót | Không được huỷ đơn đã xác nhận trong 24 giờ trước giờ nhận |
| BK-09 | Huỷ sau giờ nhận xe (no-show) | Không tự huỷ được đơn đã quá giờ nhận |
| BK-11 | Admin huỷ thẳng đơn đang thuê | Chỉ huỷ được đơn chưa giao xe |
| BK-12 | Phí trễ tính theo lúc chủ xe lập biên bản | Tính theo giờ khách báo "Tôi đã trả xe" hoặc lần lập biên bản đầu tiên |
| BK-13 | "Phí khác" không có trần, khách không phản đối được số tiền | Trần bằng tiền thuê gốc; khách phản đối phí, chủ xe sửa và gửi lại |
| BK-15, BK-16 | Ghi đè lịch sử liên hệ; SĐT/lời nhắn/sort không được kiểm tra | Lưu lịch sử liên hệ; validate SĐT, chặn HTML, whitelist sort |

Nhóm **không làm chức năng hoàn tiền**: huỷ đơn và quyết toán không tạo giao dịch hoàn cọc, giao diện ghi rõ "CarDB không hoàn tiền cọc khi huỷ đơn".

### 3.3 Xe và gói đăng tin
| Mã | Lỗi | Cách sửa |
|---|---|---|
| CAR-01 | Xe hết bảo hiểm/đăng kiểm vẫn nhận đặt | Chặn đặt xe có hồ sơ an toàn `UNSAFE` |
| CAR-02 | Kích hoạt slot cho xe tạm dừng / chủ xe bị khoá / gói hết hạn | Kiểm tra trước khi kích hoạt, slot không vượt hạn gói |
| CAR-03 | Sửa xe đã duyệt (hãng, dòng, biển số, giá) không phải duyệt lại | Chuyển về chờ duyệt và ẩn tin |
| CAR-05 | Tin của chủ xe bị khoá vẫn hiển thị | Ẩn tin và chặn đặt xe |
| CAR-06 | Tạm dừng xe vẫn trừ ngày slot | Cộng bù thời gian tạm dừng |
| CAR-07 | Thời hạn gói lệch số slot × số ngày | Bắt buộc khớp, không sửa slot của gói đang dùng |

### 3.4 Voucher, đánh giá, tài khoản
| Mã | Lỗi | Cách sửa |
|---|---|---|
| VR-01 | Voucher của nền tảng trừ vào tiền chủ xe | Nền tảng chịu; doanh thu chủ xe tính theo giá gốc |
| VR-02 | Lượt voucher bị trừ ngay khi gửi yêu cầu | Chỉ trừ khi chủ xe xác nhận đơn |
| VR-03–05 | Tạo được voucher hết hạn, mã có dấu cách, giảm 100% không trần | Chặn khi tạo |
| VR-06 | Mỗi khách chỉ đánh giá một xe một lần vĩnh viễn | Đánh giá theo từng chuyến thuê |
| VR-07 | Đánh giá chờ duyệt vô thời hạn | Tự duyệt sau 48 giờ, hiện trạng thái chờ duyệt |
| VR-08 | Không có đánh giá 2 chiều | Chủ xe trả lời đánh giá và đánh giá khách thuê |
| VR-09 | Ngày sinh 6 tuổi vẫn lưu được | Bắt buộc từ 18 tuổi |
| VR-10, VR-11 | Sort giao dịch lạ lỗi 500; nhận điểm 4.5 | Trả 400 |

### 3.5 Giao diện
Ẩn nút đặt xe khi chưa KYC hoặc xe không đạt an toàn; ẩn nút "Viết đánh giá" với khách chưa thuê; đổi `/my-trips` thành `/my-reviews`; sửa các link chuyển hướng `/admin/disputes`, `/owner/vehicles/:id/edit`; bản nháp đăng xe lưu riêng từng người và xoá khi đăng xuất.

## 4. Tồn đọng đã biết

| Nội dung | Ghi chú |
|---|---|
| File `.env` (JWT secret, khoá Mailjet) được commit chung | Nhóm chủ động giữ để dùng chung cấu hình; cần đổi khoá trước khi triển khai thật |
| 2 integration test gọi `simulate-gateway` | Cần viết lại theo luồng VNPay |
| Giới hạn đăng nhập sai và gửi mail lưu trong bộ nhớ | Chạy nhiều instance cần chuyển sang Redis/DB |
| Gói đăng tin đã mua không huỷ/hoàn | Theo chính sách nhóm: đã mua thì dùng hết |
