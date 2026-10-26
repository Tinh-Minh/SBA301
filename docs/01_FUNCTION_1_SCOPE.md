# 01 — Phạm vi và yêu cầu Function 1

## 1. Phân công của nhóm

Nguồn: người dùng mô tả trực tiếp, sau đó xác nhận **chỉ phụ trách Function 1**.

| Function | Bảng | Ranh giới đối với phần của bạn |
|---|---|---|
| **1 — Tài khoản, xác minh và nền tảng** | `customers`, `user_documents`, `drivers`, `bank_accounts`, `vouchers` | Triển khai 5 bảng này; voucher chỉ phần admin tạo/quản lý |
| 2 — Xe và slot | `cars`, `car_images`, `car_documents`, `car_slots` | Thành viên khác; dùng danh tính, quyền và trạng thái driver do F1 cung cấp |
| 3 — Đặt xe và vòng đời đơn | `rental_orders`, `action_logs`, `order_handovers`, `handover_images` | Thành viên khác; dùng account/KYC và voucher, tự chịu trách nhiệm nghiệp vụ đơn |
| 4 — Tiền và hậu kỳ | `transactions`, `payouts`, `extra_fees`, `disputes`, `dispute_evidences`, `reviews` | Thành viên khác; dùng quyền sở hữu tài khoản ngân hàng và danh tính |

Chia function là phân công nghiệp vụ trong một backend, không phải yêu cầu tạo 4 microservice hoặc 4 database.

## 2. Danh tính và quyền

- `Customer` là tài khoản chung trong bảng `customers`; admin cũng được biểu diễn ở bảng này.
- `CUSTOMER`: quyền người dùng; có thể sở hữu xe theo Function 2.
- `ADMIN`: duyệt giấy tờ, quản lý tài khoản và voucher theo API đã phân quyền.
- `Driver`: hồ sơ nghiệp vụ tùy chọn, một customer tối đa một hồ sơ; không phải một role bổ sung.
- Không tự thêm `STAFF`, `OWNER` hoặc role động từ câu chuyện mentor khi yêu cầu hiện tại chỉ có hai role.
- Quyền tự quản dữ liệu phải so sánh account đăng nhập với chủ bản ghi. Biết ID của người khác không tạo quyền truy cập.

## 3. Các nhóm yêu cầu

### F1-01 — Đăng ký và đăng nhập

- Đăng ký với tên, email, điện thoại, mật khẩu; chuẩn hóa email trước lưu/tìm kiếm.
- Server ấn định `role=CUSTOMER`, `status=ACTIVE`, `kyc_status=NONE`, `email_verified=false`.
- Không để đăng ký nhận `role`, `status`, `passwordHash`, `emailVerified` từ client.
- Hash mật khẩu bằng Spring `PasswordEncoder`; không lưu plaintext.
- Đăng nhập bằng email và mật khẩu, trả access JWT có hạn.
- JWT được kiểm tra chữ ký, thời hạn, issuer/audience theo cấu hình. Tài khoản bị khóa không tiếp tục truy cập API chỉ vì token chưa hết hạn.
- Bootstrap admin là thao tác môi trường được kiểm soát; không có mật khẩu admin cố định trong repository.
- Refresh token, quên mật khẩu, đổi email/điện thoại, OTP và đăng nhập xã hội chưa được yêu cầu; ghi ở Q-05 trước khi mở rộng.

### F1-02 — Nền tảng dùng chung

- Cấu hình Spring Security, method security, CORS theo môi trường và principal chứa accountId đáng tin cậy.
- `ApiResponse`, `PageResponse`, validation, `AppException`, handler lỗi HTTP/security, log an toàn.
- Các API danh sách có phân trang, giới hạn kích thước trang và danh sách field được sort.
- Base entity, thời gian và cấu hình DB được thống nhất với migration, không sinh schema bằng `ddl-auto=update`.

### F1-03 — Hồ sơ tài khoản

- Người dùng xem/sửa các trường hồ sơ cho phép của chính mình.
- Đề xuất tập sửa ban đầu: `fullName`, `dateOfBirth`, `address`; avatar cần dùng storage nếu triển khai.
- Email, phone dùng làm danh tính/liên hệ; thay đổi chúng là luồng riêng cần Q-05, tránh trộn vào cập nhật hồ sơ thông thường.
- Admin xem danh sách tài khoản tối thiểu và khóa/mở khóa. Không cho sửa hàng loạt role/status/KYC qua DTO cập nhật hồ sơ.
- Không cung cấp xóa cứng tài khoản như CRUD chung: nhiều function còn tham chiếu account và lịch sử.

### F1-04 — Giấy tờ và KYC

- Gửi giấy tờ loại `CITIZEN_ID`, `DRIVER_LICENSE`, `PASSPORT`; tải ảnh theo metadata trong schema.
- Bản gửi mới là `PENDING`; admin được `APPROVED` hoặc `REJECTED`, ghi người duyệt và thời gian; từ chối phải có lý do.
- Chủ giấy tờ xem hồ sơ của mình; admin xem để duyệt; thành viên khác chỉ lấy kết quả xác minh cần thiết.
- Sau duyệt, tính lại `customers.kyc_status` trong cùng transaction theo chính sách Q-02 đã được chọn.
- Schema cho phép nhiều giấy tờ trên một tài khoản. Không tự đặt UNIQUE một giấy tờ mỗi loại.
- Giấy tờ được duyệt phải thỏa index duy nhất `(doc_type, doc_number)` cho toàn hệ thống.
- Ảnh giấy tờ dùng storage private; không trả URL công khai lâu dài.
- Nộp lại sau từ chối đề xuất tạo bản `PENDING` mới để giữ lần từ chối cũ. Gia hạn/thay thế giấy tờ từng được duyệt cần Q-03 vì index hiện tại còn giữ cả giấy tờ đã hết hạn.

### F1-05 — Hồ sơ tài xế

- Customer đăng ký một driver profile trạng thái `PENDING`.
- Admin kích hoạt sau khi kiểm tra GPLX `APPROVED`, còn hiệu lực và thông tin cần thiết theo chính sách nhóm.
- `ACTIVE` có thể chuyển `SUSPENDED`; kích hoạt lại phải kiểm tra điều kiện từ đầu.
- Tài xế bị khóa account hoặc GPLX hết hạn không được coi là đủ điều kiện dù dữ liệu status chưa được job cập nhật.
- Gán tài xế cho xe là Function 2; không tạo API gán xe trong Function 1.
- Schema không quy định tài xế phải là chủ xe. Không thêm luật đó vào code.

### F1-06 — Tài khoản ngân hàng

- Customer thêm/xem tài khoản nhận tiền của chính mình, đổi tài khoản mặc định.
- Một tài khoản khách có tối đa một bank account mặc định; SQL không yêu cầu phải có một tài khoản mặc định.
- Mã số tài khoản là chuỗi để giữ số 0 đầu; không log hoặc công khai toàn bộ số.
- Không nhận `customerId` của client để chọn chủ sở hữu.
- Đề xuất không đổi bankName/accountNumber/accountHolder của bản ghi đã dùng: thêm bản ghi mới để tránh đổi ý nghĩa payout cũ.
- Xóa bản ghi đã được `payouts` tham chiếu phải bị từ chối. Quy tắc sửa/xóa, mặc định đầu tiên và hiển thị cho admin nằm ở Q-04.
- Function 4 xác định số tiền và người nhận payout; F1 cung cấp bằng chứng tài khoản ngân hàng thuộc đúng account.

### F1-07 — Voucher do admin quản trị

- Tạo, đọc danh sách/chi tiết, chỉnh sửa được kiểm soát, bật/tắt voucher.
- Loại `PERCENT` hoặc `FIXED`; kiểm tra giá trị, giới hạn giảm, thời gian, lượt tổng và lượt mỗi người theo schema.
- Tạo mới `used_count=0`; client không cập nhật giá trị này.
- Không xóa cứng voucher đã được đơn tham chiếu; ưu tiên `INACTIVE`.
- Admin không sửa chính sách của voucher đang được sử dụng đồng thời mà không có cơ chế khóa chung với F3.
- Việc tính giảm giá, làm tròn, giữ/hoàn lượt dùng, điều kiện đơn và snapshot tiền thuộc F3. F1 không tạo giả bảng `rental_orders` để làm thay.

## 4. Những điều không suy diễn từ đầu vào

- Có `email_verified` chưa xác nhận cần hệ thống gửi email trong đợt này.
- Có `drivers` chưa xác nhận có gói thuê xe kèm tài xế hoặc cơ chế điều phối tài xế.
- KYC `VERIFIED` không tự động chứng minh có GPLX hợp lệ.
- Admin không mặc nhiên được thay mọi thuộc tính của customer hoặc lấy toàn bộ dữ liệu ngân hàng.
- Function 1 không sử dụng `action_logs` của đơn thuê để ghi audit tài khoản.
- Một bảng có khóa ngoại phụ thuộc không tự động cấm service riêng: giấy tờ, tài xế và ngân hàng có use case/phân quyền riêng nên có service có ý nghĩa.

## 5. Điều kiện hoàn thành Function 1 sau khi được giao triển khai

Đầy đủ luồng chính cho 7 nhóm trên, DTO và quyền rõ ràng, migration thuộc phạm vi đã áp dụng ở môi trường kiểm tra, các ca kiểm tra tại tài liệu 06 đạt, hợp đồng F1→F2/F3/F4 được ghi nhận. Những tính năng Q-* chưa được chọn không được đánh dấu là đã hoàn thành.
