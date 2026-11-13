# CarDB – Sàn cho thuê xe tự lái (SBA301)

Nền tảng kết nối **chủ xe** và **khách thuê**: chủ xe mua gói đăng tin để hiển thị xe, khách gửi yêu cầu thuê, hai bên bàn giao xe bằng biên bản có ảnh, **admin** duyệt giấy tờ, duyệt xe, quản lý gói và voucher.

## Công nghệ

| Phần | Công nghệ |
|---|---|
| Backend (`carrental-BE`) | Spring Boot 4, Java 21, Spring Security (JWT HS256), JPA/Hibernate, Maven Wrapper |
| Frontend (`carrental-FE`) | React 19, Vite, React Router, TanStack Query, Tailwind CSS |
| Database | PostgreSQL 17 |
| Thanh toán | VNPay (sandbox) – thanh toán gói đăng tin và tiền cọc |
| Email | Mailjet – xác thực email, thông báo duyệt chủ xe |

## Chức năng chính

1. **Tài khoản & KYC** – đăng ký, xác thực email, đổi mật khẩu, nộp CCCD/GPLX, admin duyệt để nâng cấp chủ xe.
2. **Xe** – chủ xe đăng xe kèm ảnh và giấy tờ, admin duyệt; hồ sơ an toàn (đăng kiểm, bảo hiểm).
3. **Gói đăng tin** – chủ xe mua gói (nhiều slot hiển thị), thanh toán VNPay, kích hoạt từng slot.
4. **Thuê xe** – khách gửi yêu cầu, chủ xe liên hệ và xác nhận, khách đặt cọc, biên bản nhận/trả xe có ảnh, quyết toán phí phát sinh.
5. **Đánh giá 2 chiều** – khách đánh giá xe theo từng chuyến, chủ xe trả lời đánh giá và đánh giá khách thuê.
6. **Admin** – dashboard doanh thu, người dùng & KYC, duyệt xe, gói, voucher, đơn thuê, đánh giá.

> CarDB **không hoàn tiền** cọc khi huỷ đơn; gói đăng tin đã mua không huỷ/hoàn.

## Chạy trên máy

**Yêu cầu:** JDK 21, Node.js 20+, PostgreSQL 17 (đã tạo database `carrental`).

### 1. Cấu hình

File `carrental-BE/.env` dùng chung cho cả nhóm và được Spring tự nạp. Mỗi máy chỉ cần sửa cho đúng mật khẩu PostgreSQL của mình:

```
DB_URL=jdbc:postgresql://localhost:5432/carrental
DB_USERNAME=postgres
DB_PASSWORD=<mật khẩu postgres trên máy bạn>
```

Lần chạy đầu (database trống) BE tự tạo bảng và nạp dữ liệu mẫu. Muốn làm sạch dữ liệu, chạy BE một lần với `DB_RESET_ON_STARTUP=true` **và** `DB_RESET_CONFIRM=XOA-TOAN-BO-DU-LIEU` (thiếu chuỗi xác nhận thì dữ liệu được giữ nguyên), hoặc chạy file [`seeddb.sql`](seeddb.sql) bằng pgAdmin/psql.

### 2. Backend – http://localhost:8080

```bash
cd carrental-BE
./mvnw spring-boot:run
```

Swagger UI: http://localhost:8080/swagger-ui/index.html (bật khi `.env` có `SWAGGER_ENABLED=true`).

### 3. Frontend – http://localhost:3000

```bash
cd carrental-FE
npm install
npm run dev
```

### Hoặc dùng Docker

```bash
docker compose up --build
```

Chạy PostgreSQL, backend và frontend cùng lúc (xem [`docker-compose.yml`](docker-compose.yml)).

## Tài khoản mẫu

Mật khẩu chung: `Password123@`

| Vai trò | Email | Ghi chú |
|---|---|---|
| Admin | `admin@carrental.vn` | |
| Chủ xe | `binh@gmail.com`, `an@gmail.com`, `hoang@gmail.com`, `mai@gmail.com`, `cuong@gmail.com` | `hoang` có xe hết bảo hiểm (không nhận đặt) |
| Khách | `khach@gmail.com`, `dung@gmail.com`, `linh@gmail.com` | Đã xác minh KYC và GPLX |
| Khách | `nam@gmail.com` (KYC đang chờ), `khoa@gmail.com` (KYC bị từ chối) | Không thuê được xe |

## Cấu trúc thư mục

```
carrental-BE/            Spring Boot API
  src/main/java/com/carrental/
    config  controller  service  repository  entity  dto  enums  exception  scheduling  security
  src/main/resources/
    seed_data.sql        tạo bảng + dữ liệu mẫu
    schema_updates.sql   cập nhật schema (chạy mỗi lần khởi động, an toàn khi chạy lại)
carrental-FE/            React + Vite
  src/pages  src/components  src/services  src/routes
docs/                    tài liệu thiết kế, quy ước, kế hoạch và báo cáo kiểm thử
seeddb.sql               toàn bộ database (bảng + dữ liệu mẫu) trong một file
docker-compose.yml       chạy cả hệ thống bằng Docker
```

## Kiểm thử

```bash
cd carrental-BE && ./mvnw test
cd carrental-FE && npm run build
```

Kế hoạch và kết quả kiểm thử: [docs/23_TEST_PLAN.md](docs/23_TEST_PLAN.md), [docs/24_TEST_REPORT.md](docs/24_TEST_REPORT.md). Quy ước code backend: [docs/BACKEND_CONVENTIONS.md](docs/BACKEND_CONVENTIONS.md).
