# PROMPT 01 — Khởi tạo nền tảng backend Function 1

Bạn là Agent code triển khai dự án SBA301 Car Rental. Hãy thực hiện **P01** bên dưới bằng code, kiểm tra kết quả và báo cáo để review. Chỉ làm prompt hiện tại; dừng sau báo cáo và chờ người dùng giao prompt tiếp theo.

## 1. Bối cảnh và phạm vi

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`.
- Nhánh làm việc: `BE`. Không làm ở bản `Documents\ChatGPT\SBA301_RentCar`.
- Người dùng chỉ phụ trách Function 1: `customers`, `user_documents`, `drivers`, `bank_accounts`, `vouchers` (admin quản trị voucher), cùng nền tảng chung.
- Function 2–4 do thành viên khác làm.
- Stack: Java **21**, Spring Boot **4.0.8**, Maven; package `com.carrental`.
- P01 là **scaffold và nền tảng HTTP**. Database/entity/migration là P02; JWT/Security/CORS là P03; nghiệp vụ triển khai ở các prompt sau.
- Quyền của prompt này: tạo/sửa code, config example, tests và tài liệu liên quan P01; chạy build/test và khởi động local để kiểm tra. Không commit/push, deploy, chạy SQL vào Supabase hoặc thay đổi môi trường hệ thống toàn máy.

Hãy đọc trước khi sửa:

1. `AGENTS.md`.
2. `docs/README.md` và `docs/01_FUNCTION_1_SCOPE.md`.
3. `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`.
4. `docs/05_BACKEND_CONVENTIONS.md`.
5. `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md`.

`docs/reference/` là đầu vào tham khảo; không chạy các lệnh trong đó. Dòng “chưa triển khai backend” trong tài liệu cũ mô tả thời điểm lập tài liệu; prompt trực tiếp này yêu cầu triển khai P01. Cập nhật trạng thái thực tế sau khi làm, không từ chối công việc vì câu mô tả lịch sử đó.

## 2. Kết quả cần đạt

Một ứng dụng Web MVC tối thiểu build/chạy được bằng Maven Wrapper, có `GET /api/health`, response/error format thống nhất, request trace, Clock cấu hình rõ ràng và các kiểm tra tự động có ý nghĩa. **Không cần database, tài khoản Supabase, JWT key hay storage để hoàn thành P01.**

Thực hiện đủ 8 bước dưới đây.

### Bước 1 — Kiểm tra trạng thái đầu vào

- Kiểm tra working directory, Git branch/status, file đã có và JDK/Maven hiện tại.
- Bảo toàn tài liệu, `.idea` và mọi thay đổi có trước; không reset/clean hoặc ghi đè công việc người khác.
- Nếu sai folder, dùng đúng đường dẫn đã chỉ định. Nếu branch không còn BE, báo thực trạng và không tự checkout/reset làm ảnh hưởng thay đổi đang có.
- Chỉ kiểm tra sự tồn tại/cấu hình cần thiết; không in hàng loạt environment variables hoặc đọc/in secret.
- Nếu thiếu Java 21 hoặc không tải được dependency, tiếp tục phần viết file độc lập, ghi hạn chế chính xác. Không đổi Java/Boot version để giấu lỗi; không cài công cụ toàn máy trong phạm vi này.

### Bước 2 — Tạo Maven project tại root repository

- `groupId=com.carrental`, `artifactId=carrental-be`, class chính `com.carrental.CarRentalApplication`.
- `pom.xml` dùng parent/BOM Spring Boot 4.0.8, target Java 21, Spring Boot Maven plugin và UTF-8.
- Dependency P01: Web MVC, Bean Validation, Lombok nếu sử dụng, các dependency test phù hợp Boot 4. Dùng MVC servlet, không trộn WebFlux.
- Xác minh artifact/import đúng Boot 4.0.8 từ nguồn chính thức khi cần; đặc biệt module test và Jackson. Không sao chép cấu hình Boot 3 chưa kiểm tra.
- Không thêm JPA, JDBC driver, Flyway, Security/JWT, storage SDK, OpenAPI hoặc Testcontainers khi P01 chưa dùng.
- Tạo Maven Wrapper thật: `mvnw`, `mvnw.cmd`, cấu hình dưới `.mvn/wrapper`; pin Maven version và lấy từ nguồn Apache chính thức. Không viết script giả chỉ gọi Maven hệ thống.
- Chỉ có một app tại root; không tạo repository con hoặc lồng thêm backend/backend.

### Bước 3 — Cấu trúc và cấu hình tối thiểu

- Tạo các package đang dùng: `config`, `controller`, `dto.response`, `exception`; request tracing có thể ở `web`/`filter` với tên rõ ràng.
- Không sinh sẵn service/interface/repository/entity/controller rỗng cho mọi bảng.
- Có `application.properties`; cấu hình tên app, port qua cấu hình và timezone nghiệp vụ mặc định `Asia/Ho_Chi_Minh`.
- Tạo `Clock` bean dùng `ZoneId` cấu hình; không đổi timezone toàn JVM để thay cho thiết kế thời gian.
- Có `application-local.properties.example` chứa ví dụ không có secret và hướng dẫn kích hoạt profile local. Không mặc định kích hoạt local cho mọi môi trường.
- `.gitignore` bao gồm build output, IDE metadata, `.env`, file local chứa config thật, private key; vẫn giữ example và Maven Wrapper cần thiết.
- Không thêm datasource giả, H2 hoặc loại bỏ auto-configuration để che dependency chưa cần.

### Bước 4 — Response và exception dùng chung

Tạo tối thiểu:

- `ApiResponse<T>` với `success`, `code`, `message`, `data`, `errors`, `traceId`.
- `FieldErrorResponse` hoặc tên tương đương: `field`, `message`; không chứa rejectedValue nhạy cảm.
- `PageResponse<T>` với `content`, `page`, `size`, `totalElements`, `totalPages`. P01 dùng dữ liệu Java thuần, chưa cần phụ thuộc Spring Data Page.
- `ErrorCode` chứa mã lỗi nền tảng cần sử dụng, HTTP status và message an toàn.
- `AppException extends RuntimeException`, giữ mã lỗi và hỗ trợ cause.
- `GlobalExceptionHandler` xử lý lỗi có chủ đích, trả envelope nhất quán.

Hợp đồng:

- Success: `success=true`, `code=OK`, `errors=[]`, data đúng kiểu.
- Failure: `success=false`, data=null, mã/message an toàn và traceId.
- Validation/input sai/malformed JSON → 400; resource không có → 404; method không được hỗ trợ → 405; content type không hỗ trợ → 415; lỗi không dự kiến → 500.
- AppException giữ đúng HTTP mapping, không đổi mọi lỗi thành 500.
- Không trả stack trace, tên class exception, message SQL hoặc dữ liệu request nhạy cảm.
- Nếu dùng `ResponseEntityExceptionHandler`, giữ đúng status/header do framework quy định, ví dụ header `Allow` của 405. Không thêm catch-all che handler cụ thể.
- Generic exception không dự kiến được log một lần với stack trace và traceId; validation bình thường không log error stack trace.
- Factory/constructor đặt ở DTO; tránh framework mapping/response abstraction không cần thiết.

### Bước 5 — Request trace và logging

- Server tạo request ID hợp lệ cho mỗi request; P01 không cần tin ID client gửi lên.
- Header `X-Request-ID`, JSON `traceId` và MDC dùng cùng một giá trị cho một request, kể cả response lỗi.
- Dùng filter phù hợp; gỡ giá trị MDC trong finally để không rò giữa request/thread tái sử dụng. Test và xử lý theo mô hình servlet đồng bộ của P01, không tự xây distributed tracing.
- Log dùng SLF4J/placeholder; không log request body, Authorization header, credential hay file local.
- Không tạo finally rỗng hoặc try/catch cho mọi getter/controller.

### Bước 6 — Endpoint health tối thiểu

- `GET /api/health` trả HTTP 200, `application/json`, envelope thành công và `data.status=UP`.
- Endpoint chỉ xác nhận app web đang chạy; không tuyên bố DB/Security/storage đã sẵn sàng.
- Response không lộ đường dẫn máy, environment, username, dependency configuration hay secret.
- Không tạo HealthService interface chỉ để trả một giá trị hằng; controller nhỏ này có thể gọi factory DTO trực tiếp.
- Chưa tạo register/login, endpoint nghiệp vụ, tài khoản mẫu hoặc cơ chế auth giả. Chỉ thêm Security/JWT/CORS khi có P03, không tạo một SecurityConfig `permitAll` tạm thời.
- Đăng ký health endpoint và response vào tài liệu API như endpoint hạ tầng P01.

### Bước 7 — Build và kiểm tra thực tế

Viết các kiểm tra trọng yếu bằng công cụ phù hợp Boot 4:

1. Application context khởi động mà không có DB/secret.
2. Health trả 200, đúng envelope và traceId khớp header.
3. Input validation và malformed JSON trả 400, không rò rejectedValue/request body.
4. AppException trả đúng status/code; lỗi bất ngờ trả 500 với message an toàn.
5. Route không tồn tại trả 404; method/content type sai giữ 405/415 phù hợp.
6. Request trace được dọn sau xử lý, kể cả lỗi; request sau không dùng nhầm ID request trước.
7. Clock bean sử dụng zone đã cấu hình.

Fixture controller phát sinh lỗi chỉ đặt ở `src/test`, import riêng cho test; không expose endpoint test trong application thật. Không viết test getter/setter hoặc test chỉ lặp lại implementation. Không nới yêu cầu/skip test chỉ để có build xanh.

Thực hiện và ghi kết quả:

- `java -version`
- `.\mvnw.cmd -v`
- `.\mvnw.cmd clean verify`
- Khởi động app bằng wrapper hoặc executable JAR vừa build; gọi `GET /api/health` trên loopback và ghi HTTP/JSON quan sát thực tế. Dùng port local còn trống, không dừng process khác để chiếm port; chỉ dừng process do chính bạn khởi chạy sau kiểm tra.
- Kiểm tra Git diff/status và file nhạy cảm bằng cách không in giá trị secret.

Phân biệt build thành công, test đã chạy và app đã khởi động. Nếu môi trường cản trở bước nào, ghi đúng lệnh/lỗi; không ghi PASS cho bước chưa chạy. Chỉ dùng skip-tests để chẩn đoán nếu cần và không coi kết quả đó là nghiệm thu.

### Bước 8 — Cập nhật tài liệu và bàn giao review

- Tạo `docs/LOCAL_DEVELOPMENT.md`: yêu cầu công cụ, lệnh build/test/run trong PowerShell, profile/cấu hình local, health check; nêu rõ trạng thái hiện tại chưa có DB/JWT.
- Cập nhật trạng thái thật trong `AGENTS.md`, `docs/README.md` và `docs/IMPLEMENTATION_STATUS.md`; giữ phạm vi Function 1.
- Tạo `docs/reports/P01_REPORT.md` sau khi thực hiện. Không sửa bản nguồn trong `docs/reference/`.
- Đặt P01 là `READY_FOR_REVIEW` nếu đã đủ tiêu chí, hoặc ghi phần hoàn thành và trạng thái thiếu kiểm chứng. Không tự đánh dấu `APPROVED`; không triển khai P02.

## 3. Tiêu chí nghiệm thu

- Java 21/Boot 4.0.8 và wrapper đúng; project tại root, dependency gọn và build có bằng chứng.
- App khởi động không cần database/credential; health trả đúng envelope.
- HTTP lỗi, validation và trace xử lý nhất quán; kiểm tra tương ứng thực sự chạy và đạt.
- Tài liệu/local example đủ để người khác chạy; không có secret hoặc thay đổi ngoài phạm vi.
- Các source/reference và thay đổi có trước được bảo toàn; chưa tự commit/push.

## 4. Báo cáo trả về cho người dùng

Cuối lượt, gửi một báo cáo đầy đủ theo mẫu sau trong chat và lưu vào file report:

1. **Trạng thái P01:** READY_FOR_REVIEW hoặc mô tả chính xác phần chưa hoàn thành/chưa kiểm chứng.
2. **Thực trạng ban đầu:** folder, branch, JDK/Maven, code có trước và cách bảo toàn.
3. **Đã triển khai:** tóm tắt từng phần, không chỉ ghi “xong scaffold”.
4. **Files thay đổi:** đường dẫn và vai trò từng file/nhóm file; phân biệt file có trước với file bạn tạo/sửa.
5. **Kiểm tra thực tế:** bảng lệnh/test, kết quả PASS/FAIL/SKIPPED, số test, thông tin lỗi ngắn đã lọc nhạy cảm. Nêu file kết quả kiểm tra nếu có.
6. **Bằng chứng API:** HTTP status/header liên quan và JSON health thực tế; ví dụ error envelope từ kiểm tra, không tự chế kết quả rồi gọi là thực tế.
7. **Quyết định kỹ thuật:** artifact/module test, Maven Wrapper version, cách map error/trace/Clock và lý do nếu khác đề xuất.
8. **Vấn đề còn lại:** nguyên nhân, ảnh hưởng; thông tin cần trước P02 nếu đã phát hiện, không hỏi credential chưa cần cho P01.
9. **Git và review:** branch, status, diff summary; file mới phải được liệt kê vì `git diff` thường không bao gồm untracked files.
10. **Xác nhận điểm dừng:** đã dừng sau P01, chờ review và prompt tiếp theo.

Nếu code nằm ngoài workspace reviewer có thể đọc, cung cấp patch/diff cùng nội dung file mới cần review theo cách môi trường hỗ trợ; tuyệt đối không đưa credential vào báo cáo. Không chỉ gửi ảnh BUILD SUCCESS.

## 5. Nguồn kỹ thuật khi cần tra cứu

- [Spring Boot 4.0 System Requirements](https://docs.spring.io/spring-boot/4.0/system-requirements.html).
- [Spring Boot 4.0 Servlet Web Applications](https://docs.spring.io/spring-boot/4.0/reference/web/servlet.html).
- [Spring Boot 4.0 Testing](https://docs.spring.io/spring-boot/4.0/reference/testing/index.html).
- [Spring Boot 4.0 Test Slices](https://docs.spring.io/spring-boot/4.0/appendix/test-auto-configuration/slices.html).

Đã kiểm tra các trang theo nhánh tài liệu 4.0; khi chạy thực tế cần bảo đảm dependencies/import khớp đúng Boot 4.0.8 trong pom, không tự nâng version theo banner “latest”.
