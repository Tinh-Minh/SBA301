# Kanow

Website prototype tiếng Việt được dựng lại từ bộ thiết kế Stitch trong file zip gốc. Sử dụng Next.js 16.4.0 (Active LTS), React 19.3 và Tailwind CSS 4.3.3; phiên bản được khóa trong `package-lock.json`.

## Chạy dự án

Yêu cầu Node.js 24.21.0 LTS. Phiên bản Node được khai báo trong `.nvmrc`.

```sh
npm ci
npm run dev
```

Mở http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

Build sử dụng webpack để chạy ổn định trong môi trường hạn chế quyền mở cổng của worker Turbopack.

## Cấu trúc

- `src/views/`: 12 màn hình chính và 4 phương án thiết kế bổ sung từ zip.
- `src/components/`: thanh điều hướng, đăng nhập mẫu, tìm xe, tương tác và nút giữ để xác nhận/hủy.
- `src/styles/colors.css`: toàn bộ màu thương hiệu dùng chung, qua biến CSS RGB hỗ trợ opacity của Tailwind.
- `src/styles/tokens.json`: ánh xạ màu Tailwind, typography, khoảng cách và bo góc.
- `src/styles/fonts.css`: phông Be Vietnam Pro và bộ icon được lưu trên máy chủ của dự án.
- `public/images/`: ảnh gốc được tối ưu WebP, không phụ thuộc CDN hình ảnh.
- `tests/site.spec.ts`: kiểm tra responsive, điều hướng, tìm xe, bảng giá, ưu đãi, đăng nhập và thao tác giữ nút.

Trang chủ `/` liên kết đến `/thue-xe-tu-lai`, `/xe-kem-tai-xe`, `/bang-gia-dong-xe`, `/uu-dai` và `/ve-kanow`. Các trang bổ sung gồm chi tiết VF 8, hồ sơ tài xế, đăng ký, đăng nhập, tài khoản và thanh toán. Bốn phương án tham khảo nằm dưới `/mau-thiet-ke/{trang-chu,tu-lai,tai-xe,bang-gia}`.

## Hành vi prototype

Đăng nhập bằng thông tin bất kỳ; trạng thái đăng nhập mẫu được lưu trong trình duyệt và cập nhật thanh điều hướng. Mật khẩu không được lưu. Hồ sơ mẫu có thể chỉnh sửa và lưu cục bộ. Bộ lọc xe, mã ưu đãi, FAQ và bảng tính giá hoạt động trong giao diện.

Thanh toán và hủy đặt xe yêu cầu giữ nút 1,6 giây. Có thể dùng chuột, cảm ứng hoặc giữ Enter/Space; thả sớm sẽ hủy thao tác. Website không kết nối máy chủ xác thực, SMS, email, cổng thanh toán hay dịch vụ đặt xe thực tế. Thông báo sử dụng giao diện trong trang, không sử dụng `alert()`, `confirm()` hoặc `prompt()`.

## Kiểm tra trình duyệt

```sh
npm run build
npm test
```

Playwright dùng Chromium hệ thống tại `/usr/bin/chromium`. Có thể đặt `CHROMIUM_PATH` nếu trình duyệt nằm ở vị trí khác. Bộ kiểm tra tự khởi động production server nếu chưa có server chạy trên cổng 3000.
