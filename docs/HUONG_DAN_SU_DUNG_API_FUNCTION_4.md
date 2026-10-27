# HƯỚNG DẪN SỬ DỤNG 5 NHÓM API TRỌNG TÂM (FUNCTION 4)
## SBA301 - Nền tảng Cho Thuê Xe Tự Lái (Car Rental Marketplace)

> 📄 **File Word (.docx):** [`HUONG_DAN_SU_DUNG_API_FUNCTION_4.docx`](file:///d:/Study/SBA302/project/SBA301/docs/HUONG_DAN_SU_DUNG_API_FUNCTION_4.docx)  
> 🎯 **5 Nghiệp vụ trọng tâm:** `Deposit` (Đặt cọc), `Extra-Fees` (Phụ phí), `Disputes` (Khiếu nại), `Payouts` (Chi trả), `Reviews` (Đánh giá)  
> 👤 **Người dùng hệ thống:** Khách thuê (Renter), Chủ xe (Owner), Quản trị viên (Admin), Kế toán sàn  
> 💳 **Tài khoản test:** `admin@carrental.com` / `123456`

---

## BẢNG TỔNG QUAN: THỜI ĐIỂM SỬ DỤNG 5 NHÓM API

| Nhóm API | Endpoint chính | Người gọi | Thời điểm kích hoạt trong quy trình | Mục đích nghiệp vụ |
| :--- | :--- | :---: | :--- | :--- |
| **1. DEPOSIT**<br>(Đặt cọc & Hoàn cọc) | `/api/transactions/deposit`<br>`/api/transactions/refund` | Khách thuê /<br>Admin | **Ngay sau khi Chủ xe duyệt đơn (`CONFIRMED`)** và trước khi nhận xe | Ký quỹ giữ xe an toàn trên sàn; hoàn lại 100% khi kết thúc chuyến đi xe nguyên vẹn |
| **2. EXTRA-FEES**<br>(Phí phát sinh) | `/api/extra-fees`<br>`/api/extra-fees/{id}/pay`<br>`/api/extra-fees/{id}/waive` | Chủ xe /<br>Khách thuê | **Lúc trả xe (`Return Handover`)** phát hiện vi phạm (xe bẩn, trễ giờ, quá số km) | Thu thêm phụ phí thực tế hoặc miễn trừ phụ phí nếu chủ xe thông cảm |
| **3. DISPUTES**<br>(Khiếu nại / Tranh chấp) | `/api/disputes`<br>`/api/disputes/{id}/evidences`<br>`/api/disputes/{id}/resolve` | Khách / Chủ xe<br>(Admin xử) | **Khi phát sinh bất đồng** về tiền cọc, phụ phí hoặc tình trạng xe bàn giao | Trọng tài Admin phân xử công bằng dựa trên ảnh/bằng chứng, giải phóng dòng tiền |
| **4. PAYOUTS**<br>(Chi trả chủ xe) | `/api/payouts`<br>`/api/payouts/{id}/process` | Sàn / Kế toán | **Sau khi chuyến đi hoàn tất (`COMPLETED`)** và không còn khiếu nại tranh chấp | Quyết toán tiền thuê (khấu trừ 10% phí sàn) chuyển vào STK ngân hàng của chủ xe |
| **5. REVIEWS**<br>(Đánh giá chuyến đi) | `/api/reviews` | Khách thuê | **Sau khi kết thúc chuyến đi (`COMPLETED`)** và khách đã nhận lại tiền cọc | Chấm điểm 1 - 5 sao và viết nhận xét thực tế về chất lượng xe và thái độ chủ xe |

---

## 1. NHÓM API ĐẶT CỌC & HOÀN CỌC (DEPOSIT & REFUND)

### ⏰ Khi nào dùng API này?
1. **Khi nào tạo Đặt cọc (`POST /api/transactions/deposit`):**
   - Sau khi chủ xe đã duyệt đơn (`orderStatus = CONFIRMED`).
   - Trước thời hạn hết hạn thanh toán (`expiresAt` - thường trong vòng 2 tiếng sau duyệt).
   - Khách thuê bắt buộc phải đặt cọc số tiền quy định (ví dụ: 2,000,000 VND) để giữ xe chắc chắn.
2. **Khi nào hoàn tiền cọc (`POST /api/transactions/refund`):**
   - **TH1 (Bình thường):** Khách trả xe nguyên vẹn, biên bản trả xe đã ký xong (`OrderStatus = COMPLETED`). Admin gọi API hoàn 100% tiền cọc cho khách.
   - **TH2 (Hủy chuyến):** Hủy đơn hợp lệ trước ngày đi, Admin gọi hoàn cọc cho khách.
   - **TH3 (Sau khiếu nại):** Admin phân xử khiếu nại xong, kích hoạt hoàn cọc theo tỷ lệ phán quyết.

### API & Dữ liệu mẫu:
* **Tạo cọc:** `POST /api/transactions/deposit`
  ```json
  {
    "orderId": 1,
    "amount": 2000000,
    "method": "VNPAY"
  }
  ```
  *(Backend trả về `paymentUrl` đưa sang cổng VNPay Sandbox nhập thẻ test OTP 123456)*
* **Hoàn cọc:** `POST /api/transactions/refund` (Role: Admin)
  ```json
  {
    "parentTransactionId": 102,
    "amount": 2000000,
    "reason": "Hoàn tiền cọc sau chuyến đi khi kiểm tra xe nguyên vẹn"
  }
  ```

---

## 2. NHÓM API PHÍ PHÁT SINH (EXTRA-FEES)

### ⏰ Khi nào dùng API này?
1. **Khi nào tạo phí phát sinh (`POST /api/extra-fees`):**
   - Diễn ra vào thời điểm **Bàn giao trả xe (`Return Handover`)** khi kết thúc chuyến đi.
   - Chủ xe kiểm tra hiện trạng xe và phát hiện các trường hợp:
     - Khách trả xe bẩn (bùn đất, mùi hải sản, thức ăn) -> Tạo phí vệ sinh (`CLEANING`, vd: 150,000 VND).
     - Khách trả xe trễ giờ so với đăng ký -> Tạo phí quá giờ (`LATE_RETURN`, vd: 100,000 VND/giờ).
     - Số km vượt quá định mức (vd > 300km/ngày) -> Tạo phí quá km (`EXTRA_KM`, 5,000 VND/km).
     - Va quẹt trầy xước nhẹ -> Tạo phí khắc phục (`DAMAGE`).
2. **Khi nào thanh toán phụ phí (`POST /api/extra-fees/{id}/pay` - Hỗ trợ cả 2 phương thức):**
   - **Phương thức 1: Thanh toán qua VNPay (`method = "VNPAY"`)**: Khách thuê thanh toán trực tuyến qua cổng VNPay. Hệ thống tạo giao dịch `PENDING` và trả về link VNPay (`paymentUrl`). Khi VNPay IPN callback thành công, phụ phí tự động đổi sang `PAID`.
   - **Phương thức 2: Trả tiền mặt trực tiếp cho chủ xe lúc trả xe (`method = "CASH"` hoặc `"DIRECT"`)**: Khách đưa tiền mặt trực tiếp cho chủ xe khi trả xe. Chủ xe (hoặc Admin) bấm xác nhận đã nhận tiền mặt -> Hệ thống đổi phụ phí sang `PAID` và ghi nhận giao dịch `SUCCESS` ngay lập tức.
3. **Khi nào miễn trừ phụ phí (`PUT /api/extra-fees/{id}/waive`):**
   - Chủ xe/Admin thông cảm bỏ qua (khách quen, trễ ít phút do tắc đường hoặc khách tự rửa sạch).

### API & Dữ liệu mẫu:
* **Chủ xe tạo phí:** `POST /api/extra-fees`
  ```json
  {
    "orderId": 1,
    "feeType": "CLEANING",
    "amount": 150000,
    "description": "Xe bị dính bùn đất nội thất, cần vệ sinh khử mùi"
  }
  ```
* **Khách trả phí (hoặc chủ xe xác nhận tiền mặt):** `POST /api/extra-fees/{id}/pay`
  ```json
  // Thanh toán VNPay:
  { "method": "VNPAY" }

  // Hoặc xác nhận đã nhận tiền mặt lúc trả xe:
  { "method": "CASH" }
  ```
* **Miễn trừ:** `PUT /api/extra-fees/{id}/waive?note=Khach+hang+than+thiet`

---

## 3. NHÓM API KHIẾU NẠI & TRANH CHẤP (DISPUTES)

### ⏰ Khi nào dùng API này?
1. **Khi nào mở khiếu nại (`POST /api/disputes`):**
   - Khi Khách thuê và Chủ xe **bất đồng quan điểm, không thỏa thuận được**:
     - *Ví dụ 1:* Chủ xe đòi thu phí xước sơn nhưng khách khẳng định vết xước đã có từ trước khi nhận xe.
     - *Ví dụ 2:* Khách đã trả xe nguyên vẹn nhưng chủ xe chần chừ không chịu xác nhận để khách lấy lại tiền cọc.
     - *Ví dụ 3:* Xe bị hư hỏng giữa đường do xe cũ của chủ xe.
2. **Khi nào bổ sung bằng chứng (`POST /api/disputes/{id}/evidences`):**
   - Ngay sau khi mở khiếu nại, hai bên gửi ảnh chụp biên bản lúc nhận xe, video quay vòng quanh xe, ảnh đồng hồ xăng/ODO để chứng minh mình đúng.
3. **Khi nào Admin phân xử & Tự động kích hoạt hoàn tiền (`PUT /api/disputes/{id}/resolve`):**
   - Admin làm trọng tài xem xét bằng chứng từ 2 bên và đưa ra phán quyết ràng buộc.
   - **Tự động hoàn tiền:** Khi Admin phê duyệt bồi hoàn số tiền `approvedAmount > 0`, hệ thống **tự động kích hoạt tạo giao dịch `REFUND` hoàn trả tiền cho khách hàng** ngay lập tức từ giao dịch gốc của đơn hàng, đồng thời tự động miễn trừ (`WAIVED`) phụ phí tranh chấp nếu còn ở trạng thái `PENDING`.

### API & Dữ liệu mẫu:
* **Mở khiếu nại:** `POST /api/disputes`
  ```json
  {
    "orderId": 1,
    "extraFeeId": 43,
    "reason": "Không đồng ý với phí vệ sinh nội thất vì khi nhận xe sàn đã dơ sẵn"
  }
  ```
* **Bổ sung bằng chứng:** `POST /api/disputes/{id}/evidences`
  ```json
  {
    "fileUrl": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
    "description": "Ảnh chụp sàn xe lúc nhận xe lưu trong biên bản Pickup"
  }
  ```
* **Admin phán quyết & Tự động hoàn tiền:** `PUT /api/disputes/{id}/resolve`
  ```json
  {
    "status": "RESOLVED",
    "resolutionNote": "Admin xác nhận vết bẩn có từ trước, chấp thuận bồi hoàn 150,000 VND cho khách",
    "approvedAmount": 150000
  }
  ```

---

## 4. NHÓM API CHI TRẢ DOANH THU CHỦ XE (PAYOUTS)

### ⏰ Khi nào dùng API này?
1. **Khi nào tạo lệnh chi trả (`POST /api/payouts`):**
   - Sau khi chuyến đi đã kết thúc hoàn tất (bắt buộc `OrderStatus = COMPLETED`).
   - Kiểm tra trùng lặp: Mỗi đơn hàng chỉ được tạo chi trả 1 lần duy nhất.
   - Hệ thống tự động tính toán từ đơn hàng:
     $$\text{netAmount} = \text{grossAmount} - \text{platformFee}$$
     *(Ví dụ: Tiền thuê 1,750,000 VND, phí sàn 10% = 175,000 VND $\rightarrow$ Chủ xe thực nhận 1,575,000 VND)*
2. **Khi nào xử lý chi trả (`PUT /api/payouts/{id}/process`):**
   - Kế toán sàn thực hiện lệnh chuyển khoản ngân hàng về số tài khoản của chủ xe (`bankAccountId`).
   - Sau khi chuyển tiền thành công, gọi API cập nhật trạng thái Payout sang `PAID`.

### API & Dữ liệu mẫu:
* **Tạo Payout:** `POST /api/payouts`
  ```json
  {
    "orderId": 1,
    "note": "Chi trả tiền thuê đơn ORD-2026-001 (khấu trừ 10% phí hoa hồng sàn)"
  }
  ```
* **Xác nhận đã chuyển khoản:** `PUT /api/payouts/{id}/process`
  *(Chuyển trạng thái sang `PAID` $\rightarrow$ Hoàn tất 100% chu trình tài chính của chuyến đi)*

---

## 5. NHÓM API ĐÁNH GIÁ CHUYẾN ĐI (REVIEWS)

### ⏰ Khi nào dùng API này?
1. **Khi nào khách đánh giá (`POST /api/reviews`):**
   - Kích hoạt khi chuyến đi đã hoàn tất (`OrderStatus = COMPLETED`) và khách đã trả xe.
   - Khách thuê đánh giá chất lượng trải nghiệm:
     - Chấm điểm sao từ 1 đến 5 sao.
     - Nhận xét chi tiết về tình trạng xe (sạch sẽ, máy êm, xăng đầy) và thái độ phục vụ của chủ xe.
2. **Ràng buộc nghiệp vụ quan trọng:**
   - Mỗi đơn thuê xe (`orderId`) **chỉ được đánh giá duy nhất 1 lần** (ngăn chặn spam đánh giá).
   - Nếu khách đã đánh giá rồi mà gửi lại, hệ thống trả về lỗi `400 Bad Request: "Bạn đã gửi đánh giá cho đơn thuê này rồi"`.

### API & Dữ liệu mẫu:
* **Gửi đánh giá:** `POST /api/reviews`
  ```json
  {
    "orderId": 1,
    "reviewerId": 1,
    "revieweeId": 2,
    "carId": 3,
    "rating": 5,
    "comment": "Xe đi rất êm, máy bốc và tiết kiệm xăng. Chủ xe hỗ trợ nhiệt tình, giao xe đúng giờ. Rất hài lòng!"
  }
  ```

---

## 🧪 KIỂM THỬ TỰ ĐỘNG BẰNG POSTMAN & NEWMAN

Cả 5 nhóm API này đã sẵn sàng trong file [carrental_postman_collection.json](file:///d:/Study/SBA302/project/SBA301/docs/carrental_postman_collection.json). Chạy kiểm thử tự động toàn bộ bằng CLI:

```powershell
cd d:\Study\SBA302\project\SBA301\carrental-BE
npx --yes newman run carrental_postman_collection.json
```
- **Kết quả:** 26/26 requests thành công, 40/40 assertions passed 100%.
