# Chạy Function 1 với Supabase

Ngày 2026-10-15. Backend Java 21/Spring Boot chạy trên máy bạn hoặc server; PostgreSQL đặt ở Supabase. **Chạy ứng dụng không cần Docker.** Docker chỉ dùng khi bạn chủ động chạy PostgreSQL integration tests bằng `-Ppostgres-it`.

## 1. Chuẩn bị một lần

Mở PowerShell tại repository:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\scripts\setup-supabase.ps1
```

Script đã được chạy trong lượt audit này: `.env` đã có, key dev đã sinh bên ngoài repo và thư mục giấy tờ private đã được tạo. Chạy lại script giữ nguyên key/config có giá trị. Script dùng JDK để tạo RSA, không cần cài OpenSSL, không liên hệ database, không chạy schema, không ghi đè key có sẵn.

Mặc định key/storage nằm dưới `%LOCALAPPDATA%/SBA301_RentCar`. Đường dẫn thật đã được điền trong `.env`; không cần copy key vào source. `scripts/GenerateJwtKeys.java` chỉ là công cụ dev, không thuộc `src/main` và không vào JAR.

## 2. Điền ba giá trị database

Supabase Dashboard → **Connect → Session pooler → JDBC**. Lấy đúng host, database, port và username được cung cấp, rồi sửa `.env`:

```properties
DB_URL=jdbc:postgresql://YOUR_SESSION_POOLER_HOST:5432/postgres?sslmode=require
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

- Đây là **database password**, không phải anon key/service-role API key, cũng không phải mật khẩu tài khoản customer.
- Giữ password riêng ở `DB_PASSWORD` thay vì chèn vào JDBC URL. Dùng host/username thực từ Dashboard, không để nguyên placeholders.
- Session pooler hỗ trợ IPv4, phù hợp máy dev/backend lâu dài. Direct connection dùng được nếu mạng hỗ trợ địa chỉ mà Supabase cung cấp. Không chọn transaction pooler6543 làm mặc định cho Hibernate hiện tại. [Supabase Spring Boot](https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot), [Database connections](https://supabase.com/docs/guides/database/connecting-to-postgres).
- Profile `supabase` giữ pool tối đa5 connection, idle1. Có thể điều chỉnh theo giới hạn project khi nhóm chốt vận hành.

`.env` được Spring đọc trực tiếp bằng **Java properties syntax**, không phải shell dotenv parser: `KEY=value`, không `export`, không bao giá trị trong dấu nháy. Đường dẫn dùng `/`; nếu tự gõ `\`, cần escape thành `\\`. Không tạo hai bộ credentials khác nhau trong `.env` và file local. Biến môi trường OS và tham số dòng lệnh có thể ghi đè cấu hình file. Profile `supabase` mới import `.env`; integration tests mặc định không đọc file này. [Spring config imports](https://docs.spring.io/spring-boot/reference/features/external-config.html).

## 3. Database và entity

Flyway dependencies hiện chỉ ở **test scope**; executable JAR không ship Flyway migration engine. Integration-test harness chuẩn bị schema cho container trống trước khi khởi động app, không dùng cách đó với Supabase của nhóm.

Leader chịu trách nhiệm schema trên Supabase đã có đúng bản SQL đã giao. Ứng dụng chỉ dùng:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.default_schema=public
spring.flyway.enabled=false
spring.sql.init.mode=never
```

**App không tự tạo/sửa/xóa bảng Supabase hoặc chạy lại baseline.** Thiếu bảng/cột/type/trigger/quyền thì đối chiếu với leader bằng [bảng59 trường](22_ENTITY_SCHEMA_FIELD_MAP.md). Không bật `ddl-auto=update` theo ví dụ quickstart vì dự án đã có schema leader. File migration F1 hiện có phục vụ database test trống; không áp dụng nó lên Supabase đã có dữ liệu.

SQL leader có RLS. Database role trong JDBC phải có quyền phù hợp với mô hình backend của nhóm. Spring JWT CUSTOMER/ADMIN không tự biến thành Supabase `auth.uid()` hoặc PostgreSQL roles. Lỗi permission/RLS cần leader kiểm tra grant/policy/role; không tắt RLS hay tự tạo policy để app chạy qua. Audit hiện tại **chưa kết nối Supabase thật**, vì credentials bạn chưa điền.

## 4. JWT, storage, CORS, ADMIN

- JWT vẫn do Spring backend phát từ bảng `customers`; không chuyển sang Supabase Auth hoặc tạo thêm `auth.users` mapping.
- RS256 dùng đúng một cặp private/public key. Cấu hình mặc định trỏ tới PEM ngoài repo; local dev cũng có thể nhập phần Base64 bên trong hai PEM vào `JWT_PRIVATE_KEY_BASE64` và `JWT_PUBLIC_KEY_BASE64` trong `.env` (mỗi giá trị một dòng). Khi cả hai giá trị inline có mặt, chúng được ưu tiên hơn đường dẫn file. Giữ cùng cặp qua các lần restart. `.env` đã bị loại khỏi Git; không commit, gửi hoặc log các key. FE/Postman nhận token qua login, không cần private key. Không cần JWT secret/API key của Supabase cho cách nối JDBC này.
- Storage ảnh giấy tờ vẫn local private theo lựa chọn trước đó. Supabase ở đây là **database**, chưa tự đổi storage thành Supabase Storage. Khi deploy nhiều máy, storage cần kế hoạch riêng; không tự thêm provider/cloud trong Function1 này.
- `APP_DOCUMENT_STORAGE_ENABLED=true`, root đã setup ngoài repo. Không đặt file giấy tờ trong resources/static/public/target.
- Sửa `CORS_ALLOWED_ORIGINS` đúng origin FE, ví dụ localhost5173. Methods dùng cấu hình chung GET/POST/PUT/PATCH/DELETE/OPTIONS; đã sửa example local bị thiếu PUT/DELETE.
- `BOOTSTRAP_ADMIN_ENABLED=false` mặc định. Nếu nhóm chưa có ADMIN, thống nhất một identity mới để provision bằng cơ chế bootstrap đã có; chỉ bật có chủ đích, điền bốn biến fullName/email/phone/password, rồi tắt lại sau khi tạo. Không dùng register để tạo ADMIN, không reset/promote/unlock bản ghi có sẵn. Chưa tự tạo ADMIN trên Supabase trong lượt này.

## 5. Chạy mỗi ngày

### Maven — không cần Docker

Từ repository root, sau khi điền database thật:

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=supabase'
```

### IntelliJ

Mở `pom.xml`, chọn JDK21. Run main class `com.carrental.CarRentalApplication` với:

Repository có `.run/SBA301_Supabase.run.xml`: có thể chọn configuration **SBA301 Supabase**. Nếu IDE đặt tên module khác `carrental-be`, chọn lại module Maven tương ứng; XML đã parse kiểm tra cấu trúc, chưa tự điều khiển IntelliJ để bấm Run.

- Working directory: repository root.
- Active profile: `supabase`; hoặc program argument `--spring.profiles.active=supabase` nếu dùng Application configuration.
- Không cần dotenv plugin: Spring profile tự import `.env` từ working directory. Tránh env variables cũ trong IDE ghi đè DB_URL/JWT config vừa điền.

### Executable JAR

```powershell
.\mvnw.cmd '-Dmaven.test.skip=true' package
java -jar .\target\carrental-be-0.0.1-SNAPSHOT.jar --spring.profiles.active=supabase
```

Vẫn chạy từ root chứa `.env`. Nếu chuyển CWD, chỉ định import bằng đường dẫn tuyệt đối và extension hint, ví dụ `--spring.config.import=file:C:/path/to/.env[.properties]`; credentials vẫn ở file ngoài JAR.

Health `GET http://127.0.0.1:8080/api/health` xác nhận web liveness. Kiểm tra tiếp login/getMe và upload một ảnh synthetic nếu muốn kiểm tra JWT/storage. Không gọi health UP là bằng chứng mọi quyền/RLS của Supabase đều đúng.

## 6. Test và Postman

- Postman: app đang chạy với `supabase`, điền baseUrl/ADMIN test và dùng [collection hiện có](postman/README.md). Collection tạo dữ liệu thật vào DB đã chọn; dùng project/DB test của nhóm khi chạy112 mutation scenarios. Không tự chạy toàn collection vào DB Supabase của nhóm trong lượt audit.
- Unit/contract tests: `.\mvnw.cmd test`.
- PostgreSQL regression cô lập: `.\mvnw.cmd clean verify -Ppostgres-it` cần Docker vì dùng `postgres:15.13-alpine` do Testcontainers kéo về. Không có Dockerfile của app vẫn đúng.
- `spring-boot:run`, chạy main từ IntelliJ và `java -jar` không gọi Testcontainers. Không cài Docker/Compose/PostgreSQL local chỉ để chạy với Supabase.

## 7. Trạng thái kiểm chứng

Lượt audit đã chạy setup hai lần (key hash không đổi), full150 tests, packaging, và executable JAR profile `supabase` đọc `.env` thật trong CWD test. Probe dùng PostgreSQL cô lập để kiểm chứng config loading/schema validation/health/register/CORS PUT/DELETE. **Đây không phải kết nối tới Supabase thật**. Phần còn lại là bạn điền DB credentials, chạy app và kiểm chứng quyền/schema trên project Supabase đã chọn.
