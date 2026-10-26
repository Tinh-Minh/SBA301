# Báo cáo triển khai P01 — Foundation HTTP

Ngày thực hiện: **2026-10-13**  
Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`  
Branch: `BE`  
Trạng thái: **READY_FOR_REVIEW**

## 1. Trạng thái và phạm vi

P01 đã tạo scaffold Spring MVC, response/error envelope, request tracing, Clock cấu hình được, `GET /api/health`, test tự động và hướng dẫn chạy local. Build, toàn bộ 11 test và health check loopback đều đạt.

Database, entity, repository, migration, Security, JWT, CORS và API nghiệp vụ chưa được triển khai. Không kết nối Supabase, chạy SQL, commit, push hoặc deploy. P02 chưa bắt đầu; chưa có nội dung nào cần xem là đã được reviewer phê duyệt.

## 2. Hiện trạng ban đầu

- Đúng thư mục Desktop; branch `BE`, theo dõi `origin/BE`.
- Working tree ban đầu không có thay đổi tracked; đã có `.idea/`, `AGENTS.md` và `docs/` ở trạng thái untracked. Không xóa hoặc reset các nội dung này. `.idea/` vẫn còn nguyên và được `.gitignore` mới bỏ qua.
- Chưa có `pom.xml`, Maven Wrapper, `src/` hoặc backend code. Root `README` đã tồn tại và không bị sửa.
- Windows 11; `java -version`: Oracle Java 21.0.8 LTS. `mvn -version`: Maven hệ thống 3.9.11.
- `JAVA_HOME` chưa có trong tiến trình PowerShell ban đầu nên wrapper chuẩn báo thiếu `JAVA_HOME`. Các lần chạy wrapper đạt dùng `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'` chỉ trong tiến trình kiểm tra; không sửa môi trường toàn máy. Không in hàng loạt biến môi trường hay giá trị bí mật.

## 3. Nội dung đã triển khai

- Maven project root `com.carrental:carrental-be`, Java 21, Spring Boot 4.0.8; chỉ dùng MVC servlet, Bean Validation và các module test phù hợp Boot 4. Không thêm DB, Security, JWT, OpenAPI hoặc storage dependency.
- Maven Wrapper Apache 3.3.4 loại `bin`, pin Maven 3.9.11; `mvnw.cmd` và wrapper binary thật chạy được trên Windows khi `JAVA_HOME` trỏ tới JDK.
- `ApiResponse<T>` có `success`, `code`, `message`, `data`, `errors`, `traceId`; lỗi validation chỉ trả `field`/`message`. `PageResponse<T>` dùng Java thuần, không phụ thuộc Spring Data.
- `ErrorCode`, `AppException` giữ cause, và `GlobalExceptionHandler` trả envelope an toàn cho lỗi ứng dụng/framework. Mã 404/500 là `RESOURCE_NOT_FOUND`/`INTERNAL_ERROR` theo bảng mã API. Handler giữ status/header HTTP của Spring, gồm `Allow` của 405. Lỗi bất ngờ được log một lần cùng trace ID; response 500 không lộ message/exception class.
- `RequestTraceFilter` tạo UUID server-side cho mỗi request, không tin `X-Request-ID` đầu vào, đồng bộ response header/JSON/MDC và xóa MDC trong `finally`.
- `Clock` dùng `app.time.zone`, mặc định `Asia/Ho_Chi_Minh`. `GET /api/health` trả `data.status=UP` và chỉ biểu thị ứng dụng web đang chạy.
- `application.properties`, local example không chứa credential và `.gitignore` cho build, IDE, local config, env files và private keys.
- Fixture controller chỉ có trong `src/test`; không được đóng gói trong ứng dụng thật.

## 4. Files tạo/sửa

### Tạo trong lượt P01

| File | Vai trò |
|---|---|
| `.gitignore` | Bỏ qua build output, IDE metadata và config/keys local |
| `pom.xml` | Build coordinates, Boot 4.0.8, Java 21, MVC/validation/test dependencies |
| `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`, `.mvn/wrapper/maven-wrapper.jar` | Maven Wrapper Apache 3.3.4, pin Maven 3.9.11 |
| `src/main/java/com/carrental/CarRentalApplication.java` | Spring Boot entry point |
| `src/main/java/com/carrental/config/ClockConfig.java` | Clock bean theo zone cấu hình |
| `src/main/java/com/carrental/controller/HealthController.java` | `GET /api/health` |
| `src/main/java/com/carrental/dto/response/ApiResponse.java` | Envelope response thành công/lỗi |
| `src/main/java/com/carrental/dto/response/FieldErrorResponse.java` | Field/message, không có rejected value |
| `src/main/java/com/carrental/dto/response/PageResponse.java` | DTO phân trang Java thuần |
| `src/main/java/com/carrental/dto/response/HealthResponse.java` | Payload `status=UP` |
| `src/main/java/com/carrental/exception/ErrorCode.java` | Mã lỗi nền tảng, status và thông báo an toàn |
| `src/main/java/com/carrental/exception/AppException.java` | Lỗi ứng dụng có mã lỗi và cause |
| `src/main/java/com/carrental/exception/GlobalExceptionHandler.java` | HTTP error mapping và fallback 500 |
| `src/main/java/com/carrental/web/RequestTraceFilter.java` | Header, MDC, trace ID và cleanup |
| `src/main/resources/application.properties` | Tên app, port, timezone và logging pattern |
| `src/main/resources/application-local.properties.example` | Mẫu cấu hình local không có secret |
| `src/test/java/com/carrental/PlatformHttpTest.java` | 11 kiểm tra nền tảng HTTP/config |
| `src/test/java/com/carrental/PlatformTestFixtures.java` | Endpoint lỗi/validation chỉ dùng trong test |
| `docs/LOCAL_DEVELOPMENT.md` | Hướng dẫn Java, wrapper, profile và health |
| `docs/reports/P01_REPORT.md` | Báo cáo P01 này |

### Sửa tài liệu đã có trước trong working tree

`AGENTS.md`, `docs/README.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md`: cập nhật trạng thái P01, ghi endpoint health và trỏ tới báo cáo này. Chúng đã là file untracked trước lượt làm; không sửa nội dung khác trong `docs/reference/`.

## 5. Kiểm tra và kết quả

| Lệnh/kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| `java -version` | PASS | Java 21.0.8 LTS |
| `mvn -version` | PASS | Maven hệ thống 3.9.11 |
| Sinh wrapper bằng `mvn -N 'org.apache.maven.plugins:maven-wrapper-plugin:3.3.4:wrapper' '-Dtype=bin' '-Dmaven=3.9.11'` | PASS | Tải wrapper distribution chính thức; wrapper pin 3.9.11 |
| `.\mvnw.cmd -v` với `JAVA_HOME` tiến trình trỏ JDK 21 | PASS | Wrapper chạy Maven 3.9.11, Java 21.0.8 |
| `.\mvnw.cmd -B clean verify` với `JAVA_HOME` tiến trình trỏ JDK 21 | PASS | `BUILD SUCCESS`; 11 tests, 0 failures, 0 errors, 0 skipped |
| Context Spring Boot không DB/credential | PASS | Tạo trong test `@SpringBootTest`; Clock mặc định và override đều được xác nhận |
| Health, validation, malformed JSON, AppException, 500, 404/405/415, trace và MDC | PASS | 11 test qua MockMvc; fixture chỉ trong test |
| Khởi chạy executable JAR và gọi loopback health | PASS | Cổng động do OS cấp; process do lượt này tạo đã dừng |
| Quét tên file cấu hình/credential cục bộ | PASS | 0 file ứng viên; đường dẫn `application-local.properties` bị ignore, example không bị ignore |
| Kiểm tra JAR và fixture test | PASS | Không có fixture/controller test trong executable JAR |
| `git diff --check` | PASS | Không báo whitespace error; mọi thay đổi của lượt này vẫn untracked |
| Test bị skip | PASS | Không có test bị skip |
| DB/Supabase, Security/JWT/CORS và nghiệp vụ | SKIPPED | Ngoài phạm vi P01; chưa được bắt đầu |

Các lỗi trong lúc thiết lập đã được sửa và kiểm tra lại: PowerShell tách version khi tham số Maven Wrapper chưa quote; wrapper ban đầu yêu cầu `JAVA_HOME`; các vòng compile/test đầu tìm ra import `AutoConfigureMockMvc` của Boot 4, khai báo checked exception trong test helper và kỳ vọng error code cũ sau khi khớp mã 404/500 với API; một lần `clean` không xóa được log vì log được đặt trong `target`. Lệnh cuối dùng tham số đã quote, `JAVA_HOME` theo tiến trình và log ngoài `target`; lần cuối `clean verify` đạt. Không có test nào bị nới hoặc skip để làm build xanh.

Surefire lưu kết quả trong `target/surefire-reports/` (build output bị ignore).

## 6. Bằng chứng HTTP/JSON

JAR vừa build nhận request loopback thực tế:

```text
HTTP_STATUS=200
CONTENT_TYPE=application/json
X-Request-ID=1825b499-6629-44a3-ba3e-23f64a828375
```

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"1825b499-6629-44a3-ba3e-23f64a828375"}
```

Test validation xác nhận HTTP 400 và so sánh toàn bộ envelope sau khi chuẩn hóa UUID động:

```json
{"success":false,"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","data":null,"errors":[{"field":"name","message":"Tối đa 3 ký tự"}],"traceId":"<UUID>"}
```

Test còn xác nhận input bị từ chối và tên exception không xuất hiện trong JSON. MockMvc dùng để kiểm tra các status lỗi; chỉ health được gọi qua server loopback thực tế.

## 7. Quyết định kỹ thuật

- Dùng `spring-boot-starter-webmvc`, `spring-boot-starter-validation`, `spring-boot-starter-test` và `spring-boot-starter-webmvc-test`, không dùng starter reactive. Boot 4 tách package MVC test; import tương ứng là `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`.
- Dùng `ResponseEntityExceptionHandler` để giữ status và header framework, đồng thời thay body bằng envelope chung.
- Trace ID là UUID do server tạo; client header bị bỏ qua. P01 là servlet đồng bộ, chưa xây distributed tracing.
- `Clock` nhận `app.time.zone`; test kiểm tra mặc định VN và override `Asia/Bangkok`.
- Dùng wrapper plugin 3.3.4 để sinh wrapper Apache loại `bin`; Maven distribution được pin ở 3.9.11.
- Không khác phạm vi P01 đã giao. Không có lựa chọn DB, security hay nghiệp vụ được thêm.

## 8. Vấn đề còn lại và Git

- Khi dùng wrapper trên máy chưa đặt `JAVA_HOME`, cần đặt biến này trong phiên PowerShell trỏ tới JDK 21. Không đổi môi trường hệ thống trong lượt này.
- Test mạng thực chỉ áp dụng cho health; các lỗi HTTP được kiểm tra bằng MockMvc để fixture không xuất hiện trong app production.
- Trước P02 cần xác nhận database hiện có hay mới, người quản lý thứ tự migration chung và PostgreSQL test environment. Không cần đưa credential vào repository hoặc báo cáo này.
- Branch vẫn là `BE...origin/BE`. Không có thay đổi tracked; `git diff --stat` rỗng và `git diff --check` không báo lỗi. Các file bên dưới đều hiện `??` trong status, gồm tài liệu đã untracked từ đầu và file mới. Vì Git không diff nội dung untracked, phần trên phân biệt file P01 tạo mới với tài liệu sẵn có đã sửa. Không commit/push.
- `.idea/` đã có từ đầu, vẫn còn nguyên và hiện bị `.gitignore` bỏ qua.

```text
?? .gitignore
?? .mvn/wrapper/maven-wrapper.jar
?? .mvn/wrapper/maven-wrapper.properties
?? AGENTS.md
?? docs/01_FUNCTION_1_SCOPE.md
?? docs/02_FUNCTION_1_ARCHITECTURE.md
?? docs/03_FUNCTION_1_API.md
?? docs/04_DATABASE_REVIEW.md
?? docs/05_BACKEND_CONVENTIONS.md
?? docs/06_IMPLEMENTATION_PLAN.md
?? docs/07_DECISIONS_AND_OPEN_QUESTIONS.md
?? docs/08_PROMPT_ROADMAP.md
?? docs/IMPLEMENTATION_STATUS.md
?? docs/LOCAL_DEVELOPMENT.md
?? docs/README.md
?? docs/prompts/P01_FOUNDATION.md
?? docs/reference/BACKEND_CONVENTIONS.md
?? docs/reference/MENTOR_NOTES.md
?? docs/reference/README.md
?? docs/reference/car_rental_conceptual.drawio
?? docs/reference/schema.sql
?? docs/reports/P01_REPORT.md
?? mvnw
?? mvnw.cmd
?? pom.xml
?? src/main/java/com/carrental/CarRentalApplication.java
?? src/main/java/com/carrental/config/ClockConfig.java
?? src/main/java/com/carrental/controller/HealthController.java
?? src/main/java/com/carrental/dto/response/ApiResponse.java
?? src/main/java/com/carrental/dto/response/FieldErrorResponse.java
?? src/main/java/com/carrental/dto/response/HealthResponse.java
?? src/main/java/com/carrental/dto/response/PageResponse.java
?? src/main/java/com/carrental/exception/AppException.java
?? src/main/java/com/carrental/exception/ErrorCode.java
?? src/main/java/com/carrental/exception/GlobalExceptionHandler.java
?? src/main/java/com/carrental/web/RequestTraceFilter.java
?? src/main/resources/application-local.properties.example
?? src/main/resources/application.properties
?? src/test/java/com/carrental/PlatformHttpTest.java
?? src/test/java/com/carrental/PlatformTestFixtures.java
```

## 9. Điểm dừng

P01 đã dừng tại đây với trạng thái **READY_FOR_REVIEW**. Chờ người dùng review và giao prompt tiếp theo; không tự làm P02.

