# Báo cáo P01-FIX-01 — Sửa finding R1/R2

Ngày thực hiện: **2026-10-13**  
Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`  
Nhánh nền: `BE`  
Nhánh triển khai theo yêu cầu người dùng: `codex/function-1-p01-fix-01`  
Trạng thái: **READY_FOR_REVIEW**

## 1. Trạng thái và phạm vi

Đã sửa hai finding trong review P01, bổ sung regression checks, cập nhật hướng dẫn cấu hình local và chạy `clean verify`. P01 đang chờ reviewer kiểm tra lại; đây không phải trạng thái APPROVED. Review gốc tại `docs/reviews/P01_REVIEW.md` được giữ nguyên làm lịch sử.

Chỉ sửa phạm vi P01-FIX-01. P02 chưa bắt đầu; không thêm database/entity/migration, Supabase, Security/JWT/CORS hay nghiệp vụ. Không commit, push hoặc deploy. Không sửa `docs/reference/`.

## 2. Finding đã sửa

| Finding | Nguyên nhân | Thay đổi | Bằng chứng |
|---|---|---|---|
| R1 — local config lọt vào JAR | Example/hướng dẫn đặt `application-local.properties` trong classpath resources; Git ignore không ngăn Maven đóng gói | Chuyển example ra `config/application-local.properties.example`; file local thật dùng `config/application-local.properties` ngoài classpath. POM loại chính xác `**/application-local.properties` khỏi resources nếu bị đặt nhầm trong `src/main/resources`. Local profile được kích hoạt tường minh. | Script tạo bản sao nguồn cô lập, chèn file local có marker giả, đóng gói rồi mở JAR: `LOCAL_CONFIG_ENTRY_PACKAGED=False`, `FAKE_MARKER_PACKAGED=False`. Test và live process xác nhận profile local nạp cấu hình ngoài JAR. `config/application-local.properties` bị ignore; example không bị ignore. |
| R2 — binding error phản chiếu rejected value | Handler trả thẳng `FieldError.getDefaultMessage()`, nơi binder ghi giá trị lỗi và tên kiểu Java | `GlobalExceptionHandler` nhận diện `FieldError.isBindingFailure()` và trả message cố định `Giá trị không hợp lệ`; message Bean Validation do ứng dụng cung cấp vẫn được giữ nguyên. Fixture form và endpoint chỉ nằm trong test. | Regression test gửi `count=SENTINEL_PRIVATE_FIELD_REVIEW` bằng form-urlencoded; nhận HTTP 400 / `VALIDATION_ERROR`, field `count`, message an toàn và trace khớp header. Assertion loại marker, rejected value, `java.lang.*` và thông báo convert của framework. |

## 3. Môi trường và hiện trạng ban đầu

- Thư mục đúng là Desktop repository nêu trên. Ban đầu đang ở `BE`, theo dõi `origin/BE`; working tree không có tracked diff nhưng toàn bộ P01 source/docs đã có sẵn dưới dạng untracked. Không xóa, reset hoặc ghi đè các file đó.
- Tạo nhánh `codex/function-1-p01-fix-01` từ HEAD của `BE` theo yêu cầu mới nhất; toàn bộ P01 file untracked vẫn được giữ sau khi chuyển nhánh.
- `java -version`: Oracle Java 21.0.8 LTS. `mvnw.cmd -v`: Apache Maven 3.9.11 trên Windows 11. Wrapper được chạy với `JAVA_HOME=C:\Program Files\Java\jdk-21` đặt trong tiến trình PowerShell; không sửa biến môi trường toàn máy.
- Trước khi chuyển example, `config/` và `config/application-local.properties` chưa tồn tại. Không có file cấu hình local thật nào bị đọc hoặc ghi đè. Probe dùng duy nhất giá trị giả/vô hại trong thư mục tạm.

## 4. File tạo/sửa trong P01-FIX-01

| File | Vai trò |
|---|---|
| `pom.xml` | Loại `application-local.properties` khỏi main resources để bảo vệ artifact khi file bị đặt nhầm. |
| `src/main/java/com/carrental/exception/GlobalExceptionHandler.java` | Trả message an toàn riêng cho binding/type-conversion failure; giữ message Bean Validation an toàn. |
| `src/test/java/com/carrental/PlatformHttpTest.java` | Thêm test profile local với file config ở `@TempDir`, test form binding marker và assertion JSON chính xác. Các test nền P01 trước đó vẫn giữ. |
| `src/test/java/com/carrental/PlatformTestFixtures.java` | Thêm DTO `Integer count` và endpoint `@Valid @ModelAttribute` chỉ cho test. |
| `src/main/resources/application-local.properties.example` | Đã chuyển khỏi classpath resources. |
| `config/application-local.properties.example` | Example cấu hình local mới, không chứa credential và không bị ignore. |
| `scripts/verify-local-config-packaging.ps1` | Tạo bản sao tạm an toàn, chèn marker giả, build executable JAR, kiểm tra entry/nội dung rồi dọn đúng thư mục do script tạo. |
| `docs/LOCAL_DEVELOPMENT.md` | Hướng dẫn file ngoài JAR, kích hoạt profile, chạy từ root/chỉ định location và chạy packaging probe. |
| `AGENTS.md` | Cập nhật nhánh riêng và trạng thái P01-FIX-01 chờ review. |
| `docs/README.md` | Cập nhật trạng thái hai finding và liên kết report. |
| `docs/IMPLEMENTATION_STATUS.md` | Đưa P01 về `READY_FOR_REVIEW`; P02 vẫn `NOT_STARTED`. |
| `docs/08_PROMPT_ROADMAP.md` | Ghi nhận nhánh riêng theo yêu cầu và trỏ tới trạng thái/report cập nhật. |
| `docs/reports/P01_FIX_01_REPORT.md` | Báo cáo lượt sửa này. |

`docs/reports/P01_REPORT.md`, prompt, review gốc và toàn bộ tài liệu `docs/reference/` được giữ nguyên. Tất cả source/docs P01 cũ vẫn untracked như trạng thái ban đầu.

## 5. Lệnh và kết quả kiểm tra

| Lệnh/kiểm tra thực tế | Kết quả | Ghi chú |
|---|---|---|
| `java -version` | PASS | Java 21.0.8 LTS. |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\mvnw.cmd -B clean verify` | PASS | Chạy sau assertion cuối; BUILD SUCCESS, **13 tests, 0 failures, 0 errors, 0 skipped**. Surefire: `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml`. |
| `.scriptserify-local-config-packaging.ps1` — lần đầu | FAIL, đã sửa | PowerShell tách `-Dmaven.test.skip=true` khi gọi `.cmd`; Maven báo lifecycle phase `.test.skip=true`. Đã quote đối số trong script rồi chạy lại. |
| `$env:JAVA_HOME='C:\Program Files\Java\jdk-21'; .\scripts\verify-local-config-packaging.ps1` | PASS | Probe build chỉ chạy package trên bản sao tạm với `-Dmaven.test.skip=true`; đây không phải full verification. Mở executable JAR và xác nhận không có entry local/marker. Thư mục probe được xóa sau kiểm tra. |
| Test `localProfileLoadsConfigurationFromOutsideClasspath` trong `clean verify` | PASS | Khởi tạo app context với profile `local`, file external tạm có `app.time.zone=Asia/Bangkok`; bean `Clock` thực tế có zone Asia/Bangkok. Dùng `spring.config.location` cô lập, không đọc config local của repo. |
| Test `formBindingFailureDoesNotReturnRejectedValueOrFrameworkDiagnostics` trong `clean verify` | PASS | Form-urlencoded với marker giả; status, envelope, field, message, trace/header và nội dung nhạy cảm được assert. |
| Chạy executable JAR với `--spring.profiles.active=local` và `--spring.config.additional-location=file:<temp>/` | PASS | File external tạm đặt `server.port` vào cổng khả dụng do OS cấp và zone Bangkok. Log xác nhận profile local cùng cổng override. Process do lượt kiểm tra khởi tạo đã được dừng; temp directory được dọn. |
| `Invoke-WebRequest http://127.0.0.1:<port>/api/health` | PASS | HTTP 200, JSON envelope, `data.status=UP`, trace header khớp JSON. JSON quan sát được nằm ở mục 6. |
| `git check-ignore --no-index config/application-local.properties` / kiểm tra example | PASS | File local bị ignore; example không bị ignore. Không tạo file local thật trong repository. |
| `git diff --check` | PASS | Không có whitespace diagnostic. `git diff --stat` rỗng vì source/docs P01 và lượt sửa đều untracked; xem Git status đầy đủ bên dưới. |
| Database/Supabase, P02 và các phần ngoài P01 | SKIPPED | Ngoài phạm vi lượt này; không có migration hoặc kết nối nào được thực hiện. |

Các kiểm tra HTTP regression còn lại của P01 — JSON validation, malformed JSON, `AppException`, 500, 404/405/415, Clock mặc định/override, trace và MDC — nằm trong cùng 13 test đã đạt; không có assertion nào bị nới hoặc test nào bị skip.

## 6. JSON quan sát/assert sau sửa

Regression test gửi:

```text
count=SENTINEL_PRIVATE_FIELD_REVIEW
```

Body được assert chính xác sau khi chuẩn hóa UUID động:

```json
{"success":false,"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","data":null,"errors":[{"field":"count","message":"Giá trị không hợp lệ"}],"traceId":"<UUID>"}
```

Marker `SENTINEL_PRIVATE_FIELD_REVIEW`, rejected value, `java.lang.*`, `Failed to convert property value` và `rejectedValue` đều không xuất hiện trong body.

Health được gọi qua loopback từ executable JAR chạy với external local profile:

```text
HTTP_STATUS=200
CONTENT_TYPE=application/json
X-Request-ID=3ef2e5e0-c24a-4022-b0bf-4a5d77436497
```

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"3ef2e5e0-c24a-4022-b0bf-4a5d77436497"}
```

## 7. Quyết định và giới hạn còn lại

- Dùng `config/application-local.properties` vì Spring Boot tự tìm `config/` từ working directory; tài liệu cũng nêu cách truyền `spring.config.additional-location` khi chạy từ nơi khác. Maven exclude đúng file `application-local.properties`, không loại `application.properties` hay tài nguyên khác.
- Binding failure được phân loại theo `FieldError.isBindingFailure()`. Message Bean Validation do ứng dụng định nghĩa tiếp tục được trả như trước; các validation message mới vẫn cần được viết an toàn, không tự nội suy dữ liệu người dùng.
- Packaging probe cố ý skip test trên project copy để chỉ kiểm tra resource/JAR. Bằng chứng build/test đầy đủ là lệnh `clean verify` độc lập phía trên.
- Không kiểm thử datasource/credential vì P01 không có DB. Không có ảnh hưởng nào cần người dùng chốt trước review.

## 8. Git status và phạm vi

Nhánh hiện tại: `codex/function-1-p01-fix-01` (tạo từ `BE`). Không có commit hoặc push. `git diff --stat` rỗng do các file project đang untracked; không được hiểu là không có thay đổi. Status cuối lượt gồm toàn bộ file P01 có trước và file mới/sửa trong lượt này:

```text
?? .gitignore
?? .mvn/wrapper/maven-wrapper.jar
?? .mvn/wrapper/maven-wrapper.properties
?? AGENTS.md
?? config/application-local.properties.example
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
?? docs/prompts/P01_FIX_01.md
?? docs/prompts/P01_FOUNDATION.md
?? docs/reference/BACKEND_CONVENTIONS.md
?? docs/reference/MENTOR_NOTES.md
?? docs/reference/README.md
?? docs/reference/car_rental_conceptual.drawio
?? docs/reference/schema.sql
?? docs/reports/P01_FIX_01_REPORT.md
?? docs/reports/P01_REPORT.md
?? docs/reviews/P01_REVIEW.md
?? mvnw
?? mvnw.cmd
?? pom.xml
?? scripts/verify-local-config-packaging.ps1
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
?? src/main/resources/application.properties
?? src/test/java/com/carrental/PlatformHttpTest.java
?? src/test/java/com/carrental/PlatformTestFixtures.java
```

P01-FIX-01 hoàn tất và dừng ở **READY_FOR_REVIEW**; chờ reviewer. Không tự chuyển sang P02.
