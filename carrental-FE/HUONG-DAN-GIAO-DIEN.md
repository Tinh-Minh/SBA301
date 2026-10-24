# Hướng dẫn đọc giao diện CarDB

File này dành cho người không làm frontend. Mục tiêu: thầy bảo sửa một chữ hoặc một màu trên màn hình thì biết mở đúng file.

Toàn bộ giao diện nằm trong thư mục `carrental-FE`. Chạy web bằng lệnh:

```powershell
cd D:\SBA\CarDB\carrental-FE
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`.

## Cách tìm chỗ sửa trong 30 giây

1. Nhìn thanh địa chỉ. Ví dụ `localhost:3000/admin/dashboard` thì đường dẫn là `/admin/dashboard`.
2. Tra bảng bên dưới để ra tên file.
3. Trong Cursor bấm `Ctrl+P`, dán tên file, mở ra.
4. Bấm `Ctrl+F`, dán **đúng chữ đang hiện trên màn hình**. Sửa chữ đó rồi lưu. Trình duyệt tự cập nhật.

Nếu không nhớ file, bấm `Ctrl+Shift+F` và dán nguyên câu chữ trên màn hình. Cursor chỉ ra file chứa câu đó.

## Ba tầng, chỉ cần nhớ tầng giữa

| Tầng | Thư mục | Việc của nó |
| --- | --- | --- |
| Cửa vào | `src/app/.../page.jsx` | Chỉ nối địa chỉ web với màn hình. Tiêu đề tab trình duyệt cũng nằm ở đây. Hầu như không chứa chữ trên trang. |
| Màn hình | `src/views/...` | Chữ, nút, bảng, thẻ số. **Sửa giao diện thì vào đây.** |
| Dùng chung | `src/components/...` | Thanh trên cùng, chân trang, menu trái của chủ xe và admin. Sửa một lần thì mọi trang cùng loại đều đổi. |

Ví dụ `/admin/dashboard`:

- Cửa vào: `src/app/admin/dashboard/page.jsx` (chỉ ghi tiêu đề tab "Tổng quan quản trị").
- Màn hình thật: `src/views/admin/AdminDashboard.jsx` (chữ "GMV tháng 10", "1.280 Tr VND", danh sách đơn).

## Đổi màu

Màu cam thương hiệu là `#FC6C26`. Chữ chính `#292929`. Chữ phụ `#666666`. Nền xám nhạt `#F7F7F5`. Viền `#E9E9E7`.

Có hai kiểu ghi màu trong code:

- Tên có sẵn, ví dụ `bg-brand-accent` (nền cam), `text-brand-accent` (chữ cam), `text-charcoal` (chữ đen), `bg-section-bg` (nền xám). Đổi màu này trong `src/styles/colors.css`, dòng `--color-brand-accent`, `--color-charcoal`, `--color-page-bg`. Mọi chỗ dùng tên đó sẽ đổi theo.
- Mã màu viết thẳng, ví dụ `bg-[#FC6C26]` hoặc `text-[#292929]`. Admin hay viết kiểu này. Phải sửa đúng trong file màn hình đó. `Ctrl+Shift+F` từ khóa `#FC6C26` sẽ liệt kê hết nút cam.

Nút cam của admin còn nằm ở `src/components/admin/admin-ui.jsx`, hàm `PrimaryButton`. Menu trái đang chọn của admin nằm ở `src/components/admin/admin-sidebar.jsx`, chỗ `bg-[#FC6C26]`.

## Đổi chữ ở thanh trên và chân trang

Những chữ này không nằm trong từng màn:

| Thấy trên web | File |
| --- | --- |
| Menu Khám phá xe, Chuyến xe của tôi, Cho thuê xe, Cách tính giá, Quản trị | `src/components/header.jsx`, dòng `navigation` |
| Hotline 1900 8899, nút Đăng nhập / Đăng ký | cùng file `header.jsx` |
| Tên Nguyễn Hoàng Minh, mã CDB-VN-88492 trên góc phải | cùng file `header.jsx` |
| Logo chữ CarDB | `src/components/site-brand.jsx` |
| Cột link ở chân trang | `src/components/reference-footer.jsx` |
| Menu trái của chủ xe (Tổng quan, Xe của tôi, …) | `src/lib/owner/routes.js`, mảng `ownerNavigation` |
| Menu trái của admin (A01–A07) | `src/lib/admin/routes.js`, mảng `adminNavigation` |
| Tên Lê Minh Quân trên menu admin | `src/components/admin/admin-sidebar.jsx` |

## Đổi cách ghi số tiền

| Muốn | File |
| --- | --- |
| `16,95 Tr VND` (số lớn rút gọn) | `src/lib/owner/finance.js`, hàm `formatTrVnd` |
| `16.950.000 đ` (ghi đủ đồng) | cùng file, hàm `formatVnd` |
| Một ô tiền trên màn chủ xe hoặc admin | trong file màn hình, thẻ `<Money .../>`. Có chữ `compact` thì đang dùng kiểu Tr VND. Bỏ `compact` thì hiện đủ đồng. |

Công thức phí 10% cũng nằm trong `finance.js`. Sửa chữ hiển thị thì đừng đụng `calculatePlatformFee` và `calculatePayout`.

Tên khách, biển số, số tiền mẫu không lấy từ server. Admin đọc `src/services/mock/admin-db.js`. Chủ xe đọc `src/services/mock/owner-db.js`. Đổi tên "Trần Đức Nam" hoặc đơn `CDB-ORD-20261026-904` thì sửa trong hai file này, rồi chỗ nào đang ghi cứng cùng chữ trong file màn hình.

## Màn khách thuê

Địa chỉ kiểu `/kham-pha-xe` không có thư mục riêng. Một cửa chung `src/app/[[...slug]]/page.jsx` nhìn bảng `src/lib/screens.js` rồi gọi file trong `src/views`.

| Địa chỉ | Màn hình | File sửa chữ |
| --- | --- | --- |
| `/` | Trang chủ | `src/views/Home.jsx` |
| `/kham-pha-xe` | Khám phá xe | `src/views/Explore.jsx` |
| `/xe/vinfast-vf8-plus-2024` | Chi tiết một xe | `src/views/Vehicle.jsx` |
| `/cach-tinh-gia` | Cách tính giá | `src/views/Pricing.jsx` |
| `/dang-nhap` | Đăng nhập | `src/views/Login.jsx` |
| `/dang-ky` | Đăng ký | `src/views/Register.jsx` |
| `/tai-khoan` | Hồ sơ cá nhân | `src/views/Account.jsx` |
| `/tai-khoan/don-thue` | Đơn thuê của khách | `src/views/AccountOrders.jsx` |
| `/tai-khoan/lich-su` | Lịch sử chuyến | `src/views/History.jsx` |
| `/tai-khoan/xac-minh` | Xác minh giấy tờ | `src/views/Verification.jsx` |
| `/tai-khoan/xac-minh/thu-gon` | Xác minh dạng thu gọn | `src/views/VerificationCollapsed.jsx` |
| `/tai-khoan/ho-so-tai-xe` | Hồ sơ tài xế | `src/views/DriverProfile.jsx` |
| `/tai-khoan/ngan-hang` | Tài khoản ngân hàng | `src/views/Banks.jsx` |
| `/tai-khoan/ngan-hang/them` | Thêm ngân hàng | `src/views/AddBank.jsx` |
| `/tai-khoan/ngan-hang/mac-dinh` | Đổi tài khoản mặc định | `src/views/DefaultBank.jsx` |
| `/dat-xe/xac-nhan` | Xác nhận đặt xe | `src/views/Checkout.jsx` |
| `/dat-xe/thanh-cong` | Gửi yêu cầu xong | `src/views/RequestSuccess.jsx` |
| `/chuyen-xe-cua-toi` | Chuyến xe của tôi | `src/views/Trips.jsx` |
| `/don-thue/CDB-ORD-20261026-904` | Chi tiết đơn | `src/views/Order.jsx` |
| `/don-thue/CDB-ORD-20261026-904/da-xac-nhan` | Đơn đã xác nhận | `src/views/ConfirmedOrder.jsx` |
| `/thanh-toan` | Thanh toán | `src/views/Payment.jsx` |
| `/thanh-toan/thanh-cong` | Thanh toán thành công | `src/views/PaymentSuccess.jsx` |
| `/thanh-toan/that-bai` | Thanh toán thất bại | `src/views/PaymentFailed.jsx` |
| `/ban-giao/nhan-xe` | Biên bản nhận xe | `src/views/Handover.jsx` |
| `/ban-giao/tra-xe` | Biên bản trả xe | `src/views/Return.jsx` |
| `/danh-gia` | Đánh giá chuyến | `src/views/Review.jsx` |
| `/tranh-chap` | Tranh chấp phía khách | `src/views/Dispute.jsx` |

Tiêu đề tab của nhóm này nằm trong `src/lib/pages.js`, object `pageTitles`.

Các trang chữ thuần như Liên hệ, Câu hỏi thường gặp, Chính sách bảo mật, Điều khoản, Hợp đồng mẫu dùng chung một file: `src/components/information-page.jsx`. Đoạn văn dài nằm trong object `details` đầu file đó. Tiêu đề trang vẫn ở `src/lib/pages.js`.

## Màn chủ xe

Menu trái hiện trên mọi trang `/owner/...`. Muốn sửa nhãn menu thì vào `src/lib/owner/routes.js`. Muốn sửa nội dung trang thì vào file view.

| Địa chỉ | Màn hình | File sửa chữ |
| --- | --- | --- |
| `/owner/dashboard` | Tổng quan chủ xe | `src/views/owner/OwnerDashboard.jsx` |
| `/owner/vehicles` | Xe của tôi | `src/views/owner/OwnerVehicles.jsx` |
| `/owner/vehicles/new` | Đăng xe mới | `src/views/owner/OwnerVehicleNew.jsx` |
| `/owner/vehicles/edit/1` | Sửa một xe | `src/views/owner/OwnerVehicleEdit.jsx` |
| `/owner/calendar` | Lịch cho thuê | `src/views/owner/OwnerCalendar.jsx` |
| `/owner/requests` | Yêu cầu thuê | `src/views/owner/OwnerRequests.jsx` |
| `/owner/trips` | Quản lý chuyến | `src/views/owner/OwnerTrips.jsx` |
| `/owner/payouts` | Doanh thu và chi trả | `src/views/owner/OwnerPayouts.jsx` |

Tên chủ xe, xe, đơn, số tiền của các màn này lấy từ `src/services/mock/owner-db.js`.

## Màn quản trị

| Địa chỉ | Mã | Màn hình | File sửa chữ |
| --- | --- | --- | --- |
| `/admin/dashboard` | A01 | Tổng quan, GMV, phí 10% | `src/views/admin/AdminDashboard.jsx` |
| `/admin/users` | A02 | Duyệt eKYC | `src/views/admin/AdminUsers.jsx` |
| `/admin/vehicles` | A03 | Duyệt xe niêm yết | `src/views/admin/AdminVehicles.jsx` |
| `/admin/vouchers` | A04 | Voucher | `src/views/admin/AdminVouchers.jsx` |
| `/admin/orders` | A05 | Đơn thuê toàn hệ thống | `src/views/admin/AdminOrders.jsx` |
| `/admin/payouts` | A06 | Chi trả cho chủ xe | `src/views/admin/AdminPayouts.jsx` |
| `/admin/disputes` | A07 | Tranh chấp | `src/views/admin/AdminDisputes.jsx` |

Nút "Phê duyệt", hộp thoại từ chối, nhãn trạng thái dùng chung nằm ở `src/components/admin/admin-ui.jsx`. Dữ liệu mẫu (khách, xe, voucher, đơn) nằm ở `src/services/mock/admin-db.js`.

Bấm duyệt hoặc từ chối chỉ đổi trên trình duyệt. Tải lại trang là dữ liệu mẫu hiện lại.

## Trong file màn hình, chữ và màu nằm chỗ nào

Một file `.jsx` là HTML viết trong JavaScript. Chỗ thầy hay bảo sửa trông như thế này:

```jsx
<h1 className="text-2xl font-bold text-[#292929]">Doanh thu & Chi trả</h1>
```

- Phần giữa hai dấu `>` và `<` là chữ hiện ra: `Doanh thu & Chi trả`.
- `className="..."` là kiểu dáng. `text-2xl` là cỡ chữ, `font-bold` là đậm, `text-[#292929]` là màu chữ.
- `bg-[#FC6C26]` là nền cam. `rounded-xl` là góc bo. `px-4 py-3` là khoảng đệm trong.

Sửa chữ thì sửa phần giữa hai dấu ngoặc. Sửa màu thì sửa mã trong `className`, hoặc sửa `colors.css` nếu class đang dùng tên như `text-brand-accent`.
