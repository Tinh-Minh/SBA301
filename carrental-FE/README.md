# CarDB – Frontend (carrental-FE)

React 19 + Vite 8, React Router 8, axios, TanStack Query, Tailwind CSS 4. Gọi backend Spring Boot qua `/api` (Vite proxy sang `API_PROXY_TARGET`, mặc định `http://127.0.0.1:8080`).

## Chạy dự án

```sh
npm ci
npm run dev        # http://localhost:3000
npm run build      # build vào dist/
npm run typecheck  # kiểm tra các file TypeScript trong src/interfaces
npm test           # Playwright
```

Tạo `.env` từ `.env.example`: `API_PROXY_TARGET` (backend khi chạy dev), `VITE_API_URL` (để trống thì gọi cùng origin `/api`).

## Cấu trúc thư mục

```
src/
├── main.jsx          điểm vào, import styles/style.css
├── App.jsx           khung ứng dụng
├── providers.jsx     React Query, đăng nhập
├── routes/           định tuyến: public, customer, owner, admin (+ paths.js, aliases.js)
├── pages/            màn hình theo nhóm: account, auth, bookings, dashboards, disputes, home,
│                     information, payments, payouts, pricing, reviews, vehicles, vouchers
├── components/       thành phần dùng lại: Header, RequireAuth, ...; layouts/; admin/; owner/;
│                     và thư mục theo nhóm (bookings/, vehicles/, ...)
├── services/         gọi API: api.js (axios), endpoints.js, <nhóm>Service.js
├── interfaces/       kiểu TypeScript tương ứng DTO backend (api, order, car, payment, account)
├── hooks/            hook React: useApiQuery, useApiMutation, useBookings, ...
├── context/          AuthProvider
├── utils/            datetime, labels, session, schemas (zod), ...
└── styles/           style.css (Tailwind + màu + font + style chung), tokens.json
```

Quy tắc phân tầng:

- `pages` và `components` không gọi `request()` trực tiếp; dùng hook trong `hooks/` hoặc hàm trong `services/`.
- `hooks/` chỉ chứa hook React (`useXxx`), lấy dữ liệu qua `services/`.
- `services/` là nơi duy nhất gọi API (qua `services/api.js`); kiểu dữ liệu trả về mô tả trong `interfaces/`.
- Style chung chỉ nằm trong `styles/style.css`; màu, font lấy từ `tokens.json` qua `tailwind.config.js`.
