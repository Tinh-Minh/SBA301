# CarDB

Prototype thuê xe cao cấp bằng tiếng Việt, dựng lại từ bộ thiết kế CarDB cập nhật. React 19.3, React Router 8.4, Vite 8.3.4, Tailwind CSS 4.3.3 và Node.js 24.21.0 LTS. Phiên bản được khóa trong `package-lock.json` và `.nvmrc`.

## Chạy dự án

Chạy các lệnh dưới đây từ thư mục `carrental-FE/`. Thành phần React dùng `.jsx`; module, cấu hình và kiểm tra dùng `.js`, không cần TypeScript.

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Để chạy production và kiểm tra:

```sh
npm run build
npm start
npm test
```

Ứng dụng React chạy trên trình duyệt, không dùng Next.js. Vite tạo các tệp tĩnh trong `dist/`; mỗi màn hình được tải thành một gói riêng. Playwright dùng Chromium hệ thống tại `/usr/bin/chromium`; có thể đặt biến `CHROMIUM_PATH` để dùng vị trí khác.

## Các màn hình

29 màn hình bao gồm cách tính giá, trang chủ, khám phá xe, chi tiết xe, đăng nhập/đăng ký, hồ sơ cá nhân, đơn thuê, lịch sử, xác minh giấy tờ, hồ sơ tài xế, ngân hàng và các hộp thoại, xác nhận yêu cầu, thông báo thành công, chuyến xe, chi tiết đơn, thanh toán/thành công/thất bại, biên bản nhận/trả xe, đánh giá và tranh chấp.

Các đường dẫn chính:

- `/`, `/kham-pha-xe`, `/xe/vinfast-vf8-plus-2024`
- `/cach-tinh-gia`
- `/dang-nhap`, `/dang-ky`, `/tai-khoan`
- `/tai-khoan/don-thue`, `/tai-khoan/lich-su`, `/tai-khoan/xac-minh`, `/tai-khoan/ho-so-tai-xe`
- `/tai-khoan/ngan-hang`, `/tai-khoan/ngan-hang/them`, `/tai-khoan/ngan-hang/mac-dinh`
- `/dat-xe/xac-nhan`, `/dat-xe/thanh-cong`, `/chuyen-xe-cua-toi`
- `/don-thue/CDB-ORD-20261026-904`, `/don-thue/CDB-ORD-20261026-904/da-xac-nhan`
- `/thanh-toan`, `/thanh-toan/thanh-cong`, `/thanh-toan/that-bai`
- `/ban-giao/nhan-xe`, `/ban-giao/tra-xe`, `/danh-gia`, `/tranh-chap`

Các trạng thái bổ sung: `/tai-khoan/xac-minh/thu-gon`, `/mau-thiet-ke/ngan-hang`, `/thanh-phan/dieu-huong`.

## Cấu trúc và thiết kế

Tổ chức thư mục tham chiếu nhánh `F3+F4`: `pages/user`, `pages/auth`, `layouts`, `routes`, `components`, `storage` và `utils`. Các đường dẫn tiếng Việt và hành vi prototype được giữ nguyên.

- `src/pages/user/`: các trang người thuê xe, đặt xe, hồ sơ và thanh toán.
- `src/pages/auth/`: đăng nhập và đăng ký.
- `src/pages/`: trang thông tin, trang không tìm thấy và xem trước điều hướng.
- `src/main.jsx`, `src/App.jsx`: khởi động React và ứng dụng.
- `src/layouts/`: bố cục chính và bố cục hồ sơ dùng chung.
- `src/routes/`: React Router, màn hình tải riêng, tiêu đề trang và các chuyển hướng.
- `src/storage/`: đọc/ghi phiên đăng nhập mẫu trên trình duyệt.
- `src/utils/`: dữ liệu và công thức tính giá thuê.
- `src/components/`: các thành phần tái sử dụng, điều hướng, trạng thái đăng nhập, lightbox và nút giữ.
- `src/styles/`: toàn bộ CSS, bảng màu, phông chữ và cấu hình tiện ích Tailwind.
- `public/`: ảnh WebP, font Be Vietnam Pro và bộ icon tự lưu trữ.
- `tests/`: kiểm tra 29 màn hình ở 375, 768 và 1440 px cùng các luồng tương tác.

Thiết kế dùng nền trắng/đá ấm, chữ than và cam chủ đạo. Lưới sáng phản hồi con trỏ, ảnh xe phóng nhẹ, gallery/lightbox, nền toàn trang và bề mặt kính mờ. Tôn trọng `prefers-reduced-motion`.

Video trang chủ: [Erik Mclean trên Pexels](https://www.pexels.com/video/a-white-car-parked-in-the-pouring-rain-at-night-16815341/), theo [giấy phép Pexels](https://www.pexels.com/license/). Bản MP4 tự lưu trữ được nén xuống 1280 × 536, bỏ âm thanh; ảnh WebP lấy từ khung hình đầu. Video tự dừng khi ra khỏi màn hình hoặc bật chế độ giảm chuyển động.

Điều hướng hồ sơ dùng chung thành phần từ màn hình xác minh giấy tờ. Trang chủ mở đầu bằng video trên nền đen, lưới cam hiện dần, sau đó ánh sáng và nội dung xuất hiện; chế độ giảm chuyển động bỏ qua hiệu ứng này. Thao tác cuộn bằng chuột, cảm ứng, thanh cuộn hoặc bàn phím lập tức hoàn tất phần mở đầu và hiển thị nội dung, không khóa cuộn trang.

### Quy ước CSS

- `src/styles/globals.css`: nhập Tailwind, bảng màu, phông chữ và quy tắc nền dùng toàn ứng dụng. Chỉ nhập một lần trong `main.jsx`.
- `src/styles/colors.css`: màu thương hiệu và vai trò giao diện (chữ, nền, đường viền, trạng thái). Các tên ngữ nghĩa tương đương tham chiếu cùng một giá trị.
- `src/styles/fonts.css`: khai báo phông chữ tự lưu trữ.
- Dùng tiện ích Tailwind cho bố cục, khoảng cách và responsive. Chỉ có ba stylesheet trong `src/styles/`: `globals.css`, `colors.css`, `fonts.css`. CSS tùy chỉnh được nhóm theo thành phần trong `globals.css`, dùng selector giới hạn phạm vi như `.site-header`, `.profile-content`, `.app-interactions` và `.screen-home`. Không tạo stylesheet riêng cho từng component hoặc trang.
- Hiệu ứng trang chủ trong `globals.css` được giới hạn bằng `.screen-home` hoặc `body:has(.screen-home)`. Các animation `home-*` giữ tên ổn định để thao tác cuộn có thể kết thúc toàn bộ phần mở đầu.
- Màu trang trí chỉ dùng một lần có thể nằm trong CSS của component; màu có vai trò giao diện dùng token chung. Không thêm Bootstrap song song với Tailwind.
- `src/styles/tokens.json`: cấu hình tên tiện ích Tailwind cho khoảng cách, cỡ chữ, bo góc và ánh xạ biến màu. Không chứa giá trị màu trực tiếp hoặc quy tắc selector.

## Hành vi prototype

Đăng nhập bằng thông tin bất kỳ. Trạng thái được lưu trên trình duyệt và cập nhật thanh điều hướng; mật khẩu không được lưu. Hồ sơ có thể chỉnh sửa, chọn ngân hàng, lọc xe, lưu yêu thích, xem ảnh, gửi yêu cầu, chấm sao và tải tệp vào bản xem trước.

Thanh toán và hủy yêu cầu phải giữ nút 1,6 giây bằng chuột, cảm ứng hoặc Enter/Space. Thả sớm sẽ dừng thao tác. Thông báo nằm trong trang; không sử dụng `alert()`, `confirm()` hoặc `prompt()`.

Website không kết nối máy chủ xác thực, email/SMS, thanh toán hoặc đặt xe thực tế. Thông tin ngân hàng và giao dịch là dữ liệu mẫu; tệp chỉ được chọn trên thiết bị. Nhánh `prototype` dùng để tích hợp giao diện vào nhánh `FE`.

Các kiểm tra trình duyệt bao gồm đường đi từ tìm xe đến xác nhận thuê, hồ sơ và ngân hàng, giữ nút thanh toán/hủy, đối soát trả xe, tranh chấp, đặt lại xe, mã ưu đãi và xuất báo cáo CSV. Kiểm tra chữ ở 320, 375, 768, 1024 và 1440 px.

Phân trang phản hồi lựa chọn trên bộ dữ liệu mẫu; chưa tải thêm trang từ máy chủ. Ảnh 360° và video kiểm định chưa có tài nguyên tương ứng, nên nút mở thông báo và hướng dẫn xem thư viện ảnh. Xuất báo cáo hiện dùng CSV tương thích Excel.

Trang cách tính giá có lọc phân khúc, hình thức thuê và dự toán từng khoản. Dữ liệu minh họa giảm 10% tiền thuê từ 7 ngày, 25% từ 30 ngày (không cộng dồn), cộng tài xế/dịch vụ tùy chọn rồi tính thuế minh họa 8%. Cọc thế chấp không cộng vào tổng chi phí. Ảnh sedan lấy từ mẫu HTML do chủ dự án cung cấp; các ảnh khác dùng lại tài nguyên của dự án.

## Triển khai

Chạy `npm run build` rồi phục vụ thư mục `dist/` bằng máy chủ tĩnh. Máy chủ cần trả `index.html` cho các đường dẫn ứng dụng (SPA fallback), để tải trực tiếp hoặc làm mới `/tai-khoan/xac-minh` vẫn hoạt động. `vercel.json` cấu hình sẵn fallback cho Vercel; đặt Root Directory của dự án Vercel thành `carrental-FE`. `npm start` chỉ dùng để xem trước bản build trên máy; `npm run dev` phục vụ môi trường phát triển tại cổng 3000. Playwright mở bản build riêng tại cổng 4173.
