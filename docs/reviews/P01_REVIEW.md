# Review P01 — CHANGES_REQUESTED

Ngày review: **2026-10-13**. Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, branch `BE`.

Đã đọc báo cáo Agent, toàn bộ code production/test của P01, pom/config/wrapper và hướng dẫn local. Đã chạy lại build cùng 11 test, kiểm tra HTTP loopback và hai probe riêng. **Chưa duyệt P01** vì có hai vấn đề đã tái hiện; cần [P01-FIX-01](../prompts/P01_FIX_01.md) trước P02.

## 1. Findings

### R1 — [P1] File cấu hình local được đóng gói vào JAR

**Vị trí:** `docs/LOCAL_DEVELOPMENT.md:32–36`, `pom.xml:48–55`, `.gitignore:10` tại bản được review.

Hướng dẫn local yêu cầu tạo `src/main/resources/application-local.properties`. File bị Git ignore nhưng pom chưa có cơ chế loại file local khỏi resources/JAR. Hai cơ chế này độc lập.

**Đã tái hiện:** tạo bản sao tạm của pom và src/main, thêm duy nhất một cấu hình giả:

```properties
review.fake.secret=SENTINEL_FAKE_CREDENTIAL_FOR_PACKAGE_REVIEW
```

Đóng gói bản sao đó bằng Maven `package`, rồi mở executable JAR. Kết quả:

```text
LOCAL_CONFIG_PACKAGED=True
BOOT-INF/classes/application-local.properties
review.fake.secret=SENTINEL_FAKE_CREDENTIAL_FOR_PACKAGE_REVIEW
```

Đây là dữ liệu giả trong thư mục tạm; **không có bằng chứng secret thật đã bị lộ**. Tuy nhiên, khi người phát triển làm theo hướng dẫn và đặt credential DB/JWT trong local file, artifact sẽ mang theo nội dung đó. Phải sửa trước khi P02 đưa cấu hình DB vào dự án.

**Hướng sửa:** để file local thật ngoài `src/main/resources` (đề xuất `config/application-local.properties` ở root), giữ example không có secret và tài liệu kích hoạt profile đúng. Thêm bảo vệ build để không đóng gói local file nếu ai đó vẫn đặt nhầm trong resources. Kiểm chứng bằng artifact có marker giả ở một bản sao tạm, đồng thời chứng minh local profile ngoài JAR vẫn được nạp.

Maven hỗ trợ include/exclude resources; Spring Boot hỗ trợ cấu hình ngoài JAR. [Maven Resources](https://maven.apache.org/plugins/maven-resources-plugin/examples/include-exclude.html), [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/4.0/reference/features/external-config.html).

### R2 — [P2] Binding error trả lại raw rejected value

**Vị trí:** `src/main/java/com/carrental/exception/GlobalExceptionHandler.java:85–87` tại bản được review.

`toFieldError` trả thẳng `FieldError.getDefaultMessage()`. Test hiện tại chỉ dùng Bean Validation `@Size` với message do lập trình viên đặt; chưa bao phủ message do binder sinh khi chuyển kiểu thất bại.

**Đã tái hiện:** controller probe chỉ tồn tại ngoài source của dự án, nhận form với thuộc tính `Integer count` qua `@Valid @ModelAttribute`. Gửi `application/x-www-form-urlencoded`:

```text
count=SENTINEL_PRIVATE_FIELD_REVIEW
```

HTTP 400 trả lỗi field có message:

```text
Failed to convert property value of type 'java.lang.String' to required type 'java.lang.Integer' for property 'count'; For input string: "SENTINEL_PRIVATE_FIELD_REVIEW"
```

Như vậy envelope trả cả marker đầu vào và chi tiết kiểu Java. Việc DTO không có field `rejectedValue` chưa đủ bảo đảm không phản chiếu dữ liệu nhạy cảm qua message.

**Hướng sửa:** nhận diện lỗi binding/type mismatch, trả thông báo được kiểm soát thay cho defaultMessage thô. Giữ message validation an toàn đã được ứng dụng kiểm soát; không dùng phép replace duy nhất chuỗi marker của test. Thêm regression test form binding thật, kiểm tra marker và nội dung chẩn đoán framework không xuất hiện trong response, HTTP/status/envelope/trace vẫn đúng.

Spring phân biệt binding failure và validation failure trong `FieldError`; có thể dùng thông tin đó làm căn cứ phân loại. [FieldError API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/validation/FieldError.html).

## 2. Phần đã kiểm chứng đạt

- Java 21 / Spring Boot 4.0.8; Maven Wrapper pin 3.9.11; app ở root, branch BE.
- Dependency hiện tại đúng phạm vi MVC/validation/test, chưa thêm DB hoặc Security giả.
- Chạy lại `.\mvnw.cmd -B clean verify` với JAVA_HOME trong tiến trình: **11 tests, 0 failures, 0 errors, 0 skipped**, BUILD SUCCESS.
- App khởi động trong probe loopback; health trả HTTP 200 và cùng request ID trong header/body.
- Test hiện có bao phủ các ca health, JSON validation, malformed JSON, AppException, 500, 404/405/415, Clock và trace/MDC được mô tả trong báo cáo.
- Fixture test ở src/test; ba nguồn tham khảo vẫn khớp SHA-256 đã ghi ở `docs/reference/README.md`.

11 test đạt chứng minh các ca đã có; hai probe bổ sung phát hiện các trường hợp chưa được bao phủ. Không sửa source code để làm probe hoặc tự chữa implementation trong lượt reviewer này.

## 3. Bằng chứng và cách tái hiện

### Baseline

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify
```

- Surefire: `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml` tại thời điểm review.
- Build log: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p01-review-build-53e7e932bbaf403db562532fe69ff3e1.log`.

### HTTP probe R2

- Thư mục tạm: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p01-http-probe-399a2983737742a9bd7467312b90fe7b`.
- `P01HttpProbe.java` được compile với classpath của build vừa kiểm tra, loại test-classes khỏi classpath; thêm một controller probe ngoài package ứng dụng và source repository.
- App bind loopback với port do OS cấp; context tự đóng khi probe kết thúc.
- Kết quả: health 200; form 400; `REVIEW_FORM_LEAKS_MARKER=true`.

### Packaging probe R1

- Bản sao tạm: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p01-package-probe-424cb4de51924ab5b6d5a8166809bd0d`.
- Chỉ sao chép pom và src/main; thêm local properties giả trong bản sao.
- Chạy wrapper với `-f <pom-của-bản-sao> -Dmaven.test.skip=true package`; kiểm tra entry trong executable JAR.
- Việc skip test ở đây chỉ phục vụ probe đóng gói độc lập, **không phải bằng chứng test đạt**. Baseline full clean verify ở trên đã chạy đầy đủ 11 test.

Các đường dẫn tạm hỗ trợ tái hiện tại máy hiện tại, không phải thành phần cần commit hay bảo đảm tồn tại lâu dài. Prompt sửa phải bổ sung regression checks có thể chạy lại trong dự án hoặc script kiểm tra được lưu thích hợp.

## 4. Kết luận và bước tiếp theo

- P01: **CHANGES_REQUESTED** — sửa R1 và R2.
- P02: **NOT_STARTED**, chờ review lại bản sửa.
- Không yêu cầu thêm DB/JWT/KYC trong bản sửa này.
- Sau khi Agent gửi `P01_FIX_01_REPORT.md`, review lại hai finding và kết quả regression; chỉ duyệt khi có bằng chứng tương ứng.
