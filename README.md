# CarDB

Prototype thuê xe cao cấp bằng tiếng Việt, dựng lại từ bộ thiết kế CarDB cập nhật. Next.js 16.4.0 Active LTS, React 19.3, Tailwind CSS 4.3.3 và Node.js 24.21.0 LTS. Phiên bản được khóa trong `package-lock.json` và `.nvmrc`.

## Chạy dự án

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Để chạy production và kiểm tra:

```sh
npm run typecheck
npm run build
npm start
npm test
```

Build sử dụng webpack để tương thích môi trường hạn chế worker Turbopack. Playwright dùng Chromium hệ thống tại `/usr/bin/chromium`; có thể đặt biến `CHROMIUM_PATH` để dùng vị trí khác.

## Các màn hình

28 màn hình bao gồm trang chủ, khám phá xe, chi tiết xe, đăng nhập/đăng ký, hồ sơ cá nhân, đơn thuê, lịch sử, xác minh giấy tờ, hồ sơ tài xế, ngân hàng và các hộp thoại, xác nhận yêu cầu, thông báo thành công, chuyến xe, chi tiết đơn, thanh toán/thành công/thất bại, biên bản nhận/trả xe, đánh giá và tranh chấp.

Các đường dẫn chính:

- `/`, `/kham-pha-xe`, `/xe/vinfast-vf8-plus-2024`
- `/dang-nhap`, `/dang-ky`, `/tai-khoan`
- `/tai-khoan/don-thue`, `/tai-khoan/lich-su`, `/tai-khoan/xac-minh`, `/tai-khoan/ho-so-tai-xe`
- `/tai-khoan/ngan-hang`, `/tai-khoan/ngan-hang/them`, `/tai-khoan/ngan-hang/mac-dinh`
- `/dat-xe/xac-nhan`, `/dat-xe/thanh-cong`, `/chuyen-xe-cua-toi`
- `/don-thue/CDB-ORD-20261026-904`, `/don-thue/CDB-ORD-20261026-904/da-xac-nhan`
- `/thanh-toan`, `/thanh-toan/thanh-cong`, `/thanh-toan/that-bai`
- `/ban-giao/nhan-xe`, `/ban-giao/tra-xe`, `/danh-gia`, `/tranh-chap`

Các trạng thái bổ sung: `/tai-khoan/xac-minh/thu-gon`, `/mau-thiet-ke/ngan-hang`, `/thanh-phan/dieu-huong`.

## Cấu trúc và thiết kế

- `src/views/`: các màn hình React render trên máy chủ.
- `src/lib/screens.ts`: đăng ký màn hình và đường dẫn.
- `src/components/`: điều hướng, trạng thái đăng nhập mẫu, tương tác, lightbox và nút giữ.
- `src/styles/colors.css`: màu dùng chung qua biến RGB, hỗ trợ opacity Tailwind.
- `src/styles/tokens.json`: ánh xạ Tailwind, typography, khoảng cách và bo góc.
- `public/`: ảnh WebP, font Be Vietnam Pro và bộ icon tự lưu trữ.
- `tests/`: kiểm tra 28 màn hình ở 375, 768 và 1440 px cùng các luồng tương tác.

Thiết kế dùng nền trắng/đá ấm, chữ than và cam chủ đạo. Lưới sáng phản hồi con trỏ, ảnh xe phóng nhẹ, gallery/lightbox, nền toàn trang và bề mặt kính mờ. Tôn trọng `prefers-reduced-motion`.

## Hành vi prototype

Đăng nhập bằng thông tin bất kỳ. Trạng thái được lưu trên trình duyệt và cập nhật thanh điều hướng; mật khẩu không được lưu. Hồ sơ có thể chỉnh sửa, chọn ngân hàng, lọc xe, lưu yêu thích, xem ảnh, gửi yêu cầu, chấm sao và tải tệp vào bản xem trước.

Thanh toán và hủy yêu cầu phải giữ nút 1,6 giây bằng chuột, cảm ứng hoặc Enter/Space. Thả sớm sẽ dừng thao tác. Thông báo nằm trong trang; không sử dụng `alert()`, `confirm()` hoặc `prompt()`.

Website không kết nối máy chủ xác thực, email/SMS, thanh toán hoặc đặt xe thực tế. Thông tin ngân hàng và giao dịch là dữ liệu mẫu; tệp chỉ được chọn trên thiết bị. Các commit giữ ở local để chủ dự án tự push.
