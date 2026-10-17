# CarDB – carrental-FE

Giao diện thuê xe bằng tiếng Việt cho dự án SBA301, dựng từ bộ thiết kế CarDB. Theo hướng dẫn của môn học: **React 19 + Vite**, điều hướng bằng **react-router-dom**, gọi API bằng **axios**, viết bằng **TypeScript** và tạo style bằng **Tailwind CSS 4**.

## Chạy dự án

```sh
npm install
npm run dev
```

Mở http://localhost:5173. Các lệnh khác:

```sh
npm run typecheck   # kiểm tra kiểu TypeScript
npm run build       # typecheck + build ra thư mục dist/
npm run preview     # chạy thử bản build
```

Gọi backend: copy `.env.example` thành `.env` và chỉnh `VITE_API_BASE_URL` (mặc định `http://localhost:8080/api`).

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

Sắp xếp theo yêu cầu của môn học:

```
carrental-FE/
├── index.html        # Trang HTML gốc của Vite
├── vite.config.ts    # Cấu hình Vite: plugin React, Tailwind, alias "@" -> src
├── tsconfig.json     # Cấu hình TypeScript
├── package.json      # Thư viện và lệnh npm
├── .env.example      # Mẫu biến môi trường (VITE_API_BASE_URL)
├── public/           # Ảnh WebP, video, font Be Vietnam Pro, icon
└── src/
    ├── main.tsx      # Điểm vào: bọc App trong BrowserRouter
    ├── App.tsx       # Bố cục chung (header, footer) + khai báo Routes
    ├── components/   # Thành phần dùng lại: header, footer, sidebar hồ sơ, tương tác, nút giữ...
    ├── pages/        # Các màn hình (Home, Explore, Order, Handover, NotFound...) + index.ts nối đường dẫn -> màn hình
    ├── services/     # Xử lý dữ liệu và gọi API: api.ts (axios), orderService.ts (Function 3), pricingService.ts, pageService.ts
    ├── interfaces/   # Kiểu TypeScript, tương đương DTO của backend: api.ts, order.ts, auth.ts, pricing.ts...
    ├── hooks/        # Custom hook: useAuth, useDocumentTitle, useScrollToTop
    └── styles/       # style.css (file style duy nhất: màu, font, nền) + tokens.json + tailwind.config.ts
```

- `src/styles/style.css` gom toàn bộ màu, font và style chung, dùng cùng Tailwind (`tokens.json` -> `tailwind.config.ts`) để giao diện nhất quán.
- Mỗi màn hình trong `src/pages` được tải riêng khi mở (`React.lazy`), nên trang đầu tải nhanh.

Thiết kế dùng nền trắng/đá ấm, chữ than và cam chủ đạo. Lưới sáng phản hồi con trỏ, ảnh xe phóng nhẹ, gallery/lightbox, nền toàn trang và bề mặt kính mờ. Tôn trọng `prefers-reduced-motion`.

Video trang chủ: [Erik Mclean trên Pexels](https://www.pexels.com/video/a-white-car-parked-in-the-pouring-rain-at-night-16815341/), theo [giấy phép Pexels](https://www.pexels.com/license/). Bản MP4 tự lưu trữ được nén xuống 1280 × 536, bỏ âm thanh; ảnh WebP lấy từ khung hình đầu. Video tự dừng khi ra khỏi màn hình hoặc bật chế độ giảm chuyển động.

Điều hướng hồ sơ dùng chung thành phần từ màn hình xác minh giấy tờ. Trang chủ mở đầu bằng video trên nền đen, lưới cam hiện dần, sau đó ánh sáng và nội dung xuất hiện; chế độ giảm chuyển động bỏ qua hiệu ứng này. Thao tác cuộn bằng chuột, cảm ứng, thanh cuộn hoặc bàn phím lập tức hoàn tất phần mở đầu và hiển thị nội dung, không khóa cuộn trang.

## Hành vi prototype

Đăng nhập bằng thông tin bất kỳ. Trạng thái được lưu trên trình duyệt và cập nhật thanh điều hướng; mật khẩu không được lưu. Hồ sơ có thể chỉnh sửa, chọn ngân hàng, lọc xe, lưu yêu thích, xem ảnh, gửi yêu cầu, chấm sao và tải tệp vào bản xem trước.

Thanh toán và hủy yêu cầu phải giữ nút 1,6 giây bằng chuột, cảm ứng hoặc Enter/Space. Thả sớm sẽ dừng thao tác. Thông báo nằm trong trang; không sử dụng `alert()`, `confirm()` hoặc `prompt()`.

Website không kết nối máy chủ xác thực, email/SMS, thanh toán hoặc đặt xe thực tế. Thông tin ngân hàng và giao dịch là dữ liệu mẫu; tệp chỉ được chọn trên thiết bị.

Phân trang phản hồi lựa chọn trên bộ dữ liệu mẫu; chưa tải thêm trang từ máy chủ. Ảnh 360° và video kiểm định chưa có tài nguyên tương ứng, nên nút mở thông báo và hướng dẫn xem thư viện ảnh. Xuất báo cáo hiện dùng CSV tương thích Excel.

Trang cách tính giá có lọc phân khúc, hình thức thuê và dự toán từng khoản. Dữ liệu minh họa giảm 10% tiền thuê từ 7 ngày, 25% từ 30 ngày (không cộng dồn), cộng tài xế/dịch vụ tùy chọn rồi tính thuế minh họa 8%. Cọc thế chấp không cộng vào tổng chi phí. Ảnh sedan lấy từ mẫu HTML do chủ dự án cung cấp; các ảnh khác dùng lại tài nguyên của dự án.
