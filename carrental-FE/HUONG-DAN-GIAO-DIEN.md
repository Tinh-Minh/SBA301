# Hướng dẫn đọc giao diện CarDB

File này dành cho người không làm frontend. Mục tiêu: thầy bảo sửa một chữ hoặc một màu trên màn hình thì biết mở đúng file.

Toàn bộ giao diện nằm trong thư mục `carrental-FE`. Chạy web bằng lệnh:

```powershell
cd carrental-FE
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`. Dữ liệu (xe, đơn, khách, số tiền) lấy từ backend qua `/api`, không còn dữ liệu mẫu trong FE.

## Cách tìm chỗ sửa trong 30 giây

1. Nhìn thanh địa chỉ. Ví dụ `localhost:3000/admin/dashboard` thì đường dẫn là `/admin/dashboard`.
2. Tra bảng bên dưới để ra tên file.
3. Trong VS Code/Cursor bấm `Ctrl+P`, dán tên file, mở ra.
4. Bấm `Ctrl+F`, dán **đúng chữ đang hiện trên màn hình**. Sửa chữ đó rồi lưu. Trình duyệt tự cập nhật.

Nếu không nhớ file, bấm `Ctrl+Shift+F` và dán nguyên câu chữ trên màn hình để tìm.

## Các thư mục trong `src`

| Thư mục | Việc của nó |
| --- | --- |
| `routes/` | Nối địa chỉ web với màn hình; tiêu đề tab nằm ở `routes/paths.js`, object `pageTitles`. |
| `pages/` | **Màn hình.** Chữ, nút, bảng của từng trang. Sửa giao diện một trang thì vào đây. |
| `components/` | Phần dùng chung: thanh trên cùng, chân trang, menu trái, hộp thoại, thẻ. Sửa một lần thì mọi trang dùng nó đều đổi. |
| `services/` | Gọi API backend. Không sửa khi chỉ đổi chữ hoặc màu. |
| `hooks/` | Lấy dữ liệu cho màn hình (qua `services/`). |
| `interfaces/` | Kiểu dữ liệu TypeScript tương ứng DTO backend. |
| `utils/` | Định dạng ngày, tiền, nhãn trạng thái. |
| `styles/style.css` | Màu, font và style chung (Tailwind). |

## Đổi màu

Màu cam thương hiệu là `#FC6C26`. Chữ chính `#292929`. Chữ phụ `#666666`. Nền xám nhạt `#F7F7F5`. Viền `#E9E9E7`.

- Tên có sẵn như `bg-brand-accent` (nền cam), `text-brand-accent` (chữ cam), `text-charcoal` (chữ đen): đổi trong `src/styles/style.css`, phần "Màu", các dòng `--color-brand-accent`, `--color-charcoal`… Mọi chỗ dùng tên đó sẽ đổi theo.
- Mã màu viết thẳng như `bg-[#FC6C26]`: phải sửa đúng trong file màn hình đó. `Ctrl+Shift+F` từ khóa `#FC6C26` để liệt kê.

Nút cam của admin: `src/components/admin/AdminUi.jsx`, hàm `PrimaryButton`. Menu trái admin: `src/components/admin/AdminSidebar.jsx`.

## Đổi chữ ở thanh trên, chân trang và menu

| Thấy trên web | File |
| --- | --- |
| Menu Khám phá xe, Chuyến xe của tôi, Cho thuê xe, Cách tính giá, Quản trị | `src/components/Header.jsx`, biến `navigation` |
| Logo chữ CarDB | `src/components/SiteBrand.jsx` |
| Cột link ở chân trang | `src/components/ReferenceFooter.jsx` |
| Menu trái của chủ xe (Tổng quan, Xe của tôi, …) | `src/routes/owner.routes.jsx`, mảng `ownerNavigation` |
| Menu trái của admin (A01–A07) | `src/routes/admin.routes.jsx`, mảng `adminNavigation` |
| Các trang chữ thuần (Liên hệ, Câu hỏi thường gặp, Chính sách…) | `src/components/information/InformationPage.jsx` |

## Đổi cách ghi số tiền

| Muốn | File |
| --- | --- |
| `16,95 Tr VND` (số lớn rút gọn) | `src/utils/owner.js`, hàm `formatTrVnd` |
| `16.950.000 đ` (ghi đủ đồng) | `src/utils/owner.js`, hàm `formatVnd`; trang khách dùng `formatMoney` trong `src/utils/labels.js` |
| Một ô tiền trên màn chủ xe hoặc admin | trong file màn hình, thẻ `<Money .../>` (`src/components/owner/Money.jsx`). Có `compact` thì đang dùng kiểu Tr VND. |

Công thức phí 10% nằm trong `src/utils/owner.js` (`calculatePlatformFee`, `calculatePayout`). Sửa chữ hiển thị thì đừng đụng hai hàm này.

## Màn công khai và khách thuê

| Địa chỉ | Màn hình | File |
| --- | --- | --- |
| `/` | Trang chủ | `src/pages/home/HomePage.jsx` |
| `/explore` | Khám phá xe | `src/pages/vehicles/ExploreCarsPage.jsx` |
| `/cars/:id` | Chi tiết xe | `src/pages/vehicles/CarDetailPage.jsx` |
| `/pricing` | Cách tính giá | `src/pages/pricing/PricingPage.jsx` |
| `/login`, `/register` | Đăng nhập, đăng ký | `src/pages/auth/LoginPage.jsx`, `RegisterPage.jsx` |
| `/account` | Hồ sơ cá nhân | `src/pages/account/ProfilePage.jsx` |
| `/account/verification` | Xác minh giấy tờ | `src/pages/account/VerificationPage.jsx` |
| `/account/driver` | Hồ sơ tài xế | `src/pages/account/DriverProfilePage.jsx` |
| `/account/bank` | Tài khoản ngân hàng | `src/pages/account/BanksPage.jsx` |
| `/my-trips`, `/account/orders`, `/account/history` | Chuyến xe của tôi | `src/pages/bookings/MyRentalsPage.jsx` |
| `/booking/confirm` | Xác nhận đặt xe | `src/pages/bookings/CheckoutPage.jsx` |
| `/orders/:id` | Chi tiết đơn | `src/pages/bookings/OrderDetailPage.jsx` |
| `/payment` | Thanh toán | `src/pages/payments/PaymentPage.jsx` |
| `/payment/success`, `/payment/failed` | Kết quả thanh toán | `src/pages/payments/PaymentSuccessPage.jsx`, `PaymentFailedPage.jsx` |
| `/reviews` | Đánh giá | `src/pages/reviews/OwnerReviewPage.jsx` |
| `/disputes` | Tranh chấp phía khách | `src/pages/disputes/DisputePage.jsx` |

Địa chỉ tiếng Việt cũ (`/kham-pha-xe`, `/thanh-toan`…) và một số địa chỉ cũ khác được chuyển hướng trong `src/routes/aliases.js`.

## Màn chủ xe

| Địa chỉ | Màn hình | File |
| --- | --- | --- |
| `/owner/dashboard` | Tổng quan chủ xe | `src/pages/dashboards/OwnerDashboardPage.jsx` |
| `/owner/vehicles` | Xe của tôi | `src/pages/vehicles/OwnerVehiclesPage.jsx` |
| `/owner/vehicles/new` | Đăng xe mới | `src/pages/vehicles/OwnerVehicleNewPage.jsx` |
| `/owner/vehicles/edit/:id` | Sửa một xe | `src/pages/vehicles/OwnerVehicleEditPage.jsx` |
| `/owner/calendar` | Lịch cho thuê | `src/pages/vehicles/OwnerCalendarPage.jsx` |
| `/owner/requests` | Yêu cầu thuê | `src/pages/bookings/OwnerRequestsPage.jsx` |
| `/owner/trips` | Quản lý chuyến | `src/pages/bookings/OwnerTripsPage.jsx` |
| `/owner/payouts` | Doanh thu và chi trả | `src/pages/payouts/OwnerPayoutsPage.jsx` |

## Màn quản trị

| Địa chỉ | Mã | Màn hình | File |
| --- | --- | --- | --- |
| `/admin/dashboard` | A01 | Tổng quan | `src/pages/dashboards/AdminDashboardPage.jsx` |
| `/admin/users` | A02 | Người dùng, duyệt eKYC | `src/pages/account/AdminUsersPage.jsx` |
| `/admin/vehicles` | A03 | Duyệt xe niêm yết | `src/pages/vehicles/AdminVehiclesPage.jsx` |
| `/admin/vouchers` | A04 | Voucher | `src/pages/vouchers/AdminVouchersPage.jsx` |
| `/admin/orders` | A05 | Đơn thuê toàn hệ thống | `src/pages/bookings/AdminOrdersPage.jsx` |
| `/admin/payouts` | A06 | Chi trả cho chủ xe | `src/pages/payouts/AdminPayoutsPage.jsx` |
| `/admin/disputes` | A07 | Tranh chấp | `src/pages/disputes/AdminDisputesPage.jsx` |

Nút "Phê duyệt", hộp thoại, nhãn trạng thái dùng chung của admin nằm ở `src/components/admin/AdminUi.jsx`.

## Trong file màn hình, chữ và màu nằm chỗ nào

Một file `.jsx` là HTML viết trong JavaScript. Chỗ thầy hay bảo sửa trông như thế này:

```jsx
<h1 className="text-2xl font-bold text-[#292929]">Doanh thu & Chi trả</h1>
```

- Phần giữa hai dấu `>` và `<` là chữ hiện ra: `Doanh thu & Chi trả`.
- `className="..."` là kiểu dáng. `text-2xl` là cỡ chữ, `font-bold` là đậm, `text-[#292929]` là màu chữ.
- `bg-[#FC6C26]` là nền cam. `rounded-xl` là góc bo. `px-4 py-3` là khoảng đệm trong.

Sửa chữ thì sửa phần giữa hai dấu ngoặc. Sửa màu thì sửa mã trong `className`, hoặc sửa `styles/style.css` nếu class đang dùng tên như `text-brand-accent`.
