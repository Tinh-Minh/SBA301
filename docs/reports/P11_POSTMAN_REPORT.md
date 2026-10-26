# P11 — Postman Function 1 Report

**Trạng thái: READY_FOR_REVIEW** (chưa reviewer-APPROVED). Thực hiện trên `BE`, HEAD `2fe712eed12a2af3b61f0a5311bdd3901f614029`. P11 chỉ thêm bộ Postman và tài liệu hướng dẫn/trạng thái; không sửa backend, test source, POM/dependency, OpenAPI, schema/entity/migration hoặc `docs/reference/`. Không stage, commit, push, deploy hay sử dụng database chung. P01–P10 vẫn giữ trạng thái APPROVED đã được reviewer ghi nhận; P11 không đồng nghĩa Function 1 được đánh dấu hoàn tất.

## Bàn giao

- Collection import chính: [SBA301_Function1.postman_collection.json](../postman/SBA301_Function1.postman_collection.json), Postman Collection v2.1.0 JSON, 112 request/scenario trong 7 folder.
- Fixtures thật, ảnh tổng hợp 96×64 và fixture text negative: [fixtures/](../postman/fixtures/).
- Hướng dẫn tiếng Việt, cấu hình, thứ tự chạy, route coverage và giới hạn: [Postman README](../postman/README.md).
- Bộ sưu tập có đủ 32 method/path trong OpenAPI. `POST /api/health` chỉ là method probe 405, không tính là operation nghiệp vụ/API thứ 33.

Collection có kích thước 968,509 byte, SHA-256 `F2423D200BEF469CC185874852E8A0BA9C6D3678F6CA8EAE5969925EC4544143`. README có kích thước 11,230 byte, SHA-256 `3C7C9C2BA399B81BFE0F843B6B8927FBE3FC17938AF35DEDA0FE8A3CA8F0ACFC`.

Collection chứa dữ liệu synthetic tự sinh theo mỗi lượt `runId`; customer/peer được đăng ký qua HTTP. Người chạy nhập `baseUrl` (mặc định `http://127.0.0.1:8080`) và ADMIN test đã provision (`adminEmail`, `adminPassword`, để trống mặc định). Token và ID sinh runtime, không có credential hay token hardcode trong JSON. Newman/Postman file upload đã chạy từ working directory `docs/postman`; file part dùng đường dẫn tương đối `fixtures/...`.

| Fixture | Byte | SHA-256 |
|---|---:|---|
| `synthetic-front.png` | 17225 | `1C5DFD0490A9487B6AC6DA95EA710454D52571260572B96AB9EBE5B938DF6016` |
| `synthetic-back.png` | 17231 | `3D1E1C3066DFFEC12206F2972379E8479DB99FC25362BFF46270EEDD821B246B` |
| `synthetic-front.jpg` | 1909 | `8F40D7DC4D063071C12576CCE477C79B8B0CE49CCDBC5D2CC64B232C24A1E5A9` |
| `synthetic-back.jpg` | 1836 | `B09285F53A684AB91CF2873FF401455D90188943F50246C39B2450A9D1AB9EA2` |
| `not-an-image.txt` | 56 | `834D92CDD2AC00A8FBCFB51B1CDFA79089F0DC1C8DDDCA5610B4FFA5E8EB9908` |

## Môi trường ban đầu

- Repository `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; HEAD và `origin/BE` cùng `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Git trước khi làm: 264 đường dẫn untracked từ trạng thái dự án có trước, không có staged hoặc tracked diff. Các file đó được bảo toàn; trạng thái Git trống về tracked diff không được xem là repository trống.
- Java 21.0.8, Docker 28.5.2, Node.js 22.20.0. `JAVA_HOME` ban đầu chưa đặt; lần gọi Maven Wrapper không có biến này thất bại trước khi build. Đặt `JAVA_HOME=C:\Program Files\Java\jdk-21` theo phạm vi lệnh thì Wrapper dùng Maven 3.9.11 và Java 21 hoạt động.
- Newman chưa cài lúc bắt đầu. Newman 6.2.3 và AJV 8.20.0 (`ajv-formats` 3.0.1, `ajv-draft-04` 1.0.0) được dùng ngoài project/runtime POM; official Postman Collection v2.1 schema cũng được lấy vào tooling tạm. PostgreSQL test chạy bằng container PostgreSQL 15.13.

## Thay đổi và file

Tạo collection 112 request với positive flow và negative case cho auth, customer/profile/admin, documents/KYC, drivers/eligibility, bank accounts và admin vouchers; request có actor/auth riêng, body/query cụ thể, token/ID nối bằng collection variables. Scripts kiểm tra status chính xác, content type, envelope/code, trace header/body, cache header khi hợp đồng hiện hành bảo đảm, cùng response fields/side effects. Binary download được kiểm tra riêng theo bytes, media type, disposition, nosniff, no-store và request ID. Collection dùng raw URL string để tương thích Newman/Postman v2.1; near-integer voucher token giữ ở JSON literal, không đi qua JavaScript Number.

Các file đã tạo/sửa trong P11:

- `docs/postman/SBA301_Function1.postman_collection.json` — collection import.
- `docs/postman/fixtures/synthetic-front.png`, `synthetic-back.png`, `synthetic-front.jpg`, `synthetic-back.jpg`, `not-an-image.txt` — file multipart synthetic có thật.
- `docs/postman/README.md` — hướng dẫn tiếng Việt và matrix coverage 32 route.
- `docs/reports/P11_POSTMAN_REPORT.md` — báo cáo này và appendix Git.
- `AGENTS.md`, `README.md`, `docs/README.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/IMPLEMENTATION_STATUS.md` — trạng thái/mục lục cập nhật tới P11 READY_FOR_REVIEW.

Không sửa tài liệu nguồn `docs/reference/` hoặc report/review/prompt cũ. Không thêm endpoint, seed production hoặc test helper vào backend.

## Kiểm tra cấu trúc và bảo toàn

Các command/kiểm tra thực tế:

| Kiểm tra | Kết quả |
|---|---|
| Parse collection JSON và validate official Postman Collection v2.1 schema bằng AJV draft-04 | **PASS** |
| Parse/syntax mọi pre-request/test script; 112 request | **PASS**, 224 script blocks |
| OpenAPI parity bằng normalized method/path set | **PASS**, 32/32; không thiếu operation; chỉ có method probe `POST /api/health` ngoài tập API |
| File fixture paths, không hardcode absolute local path, và scan secret/default credentials | **PASS** |
| `scripts/verify-local-config-packaging.ps1` | **PASS** sau khi cung cấp JDK 21 qua `JAVA_HOME`; các marker config/key/bootstrap/private storage/helper không được đóng gói |

SHA-256 đối chiếu trước/sau theo các baseline được chụp khi bắt đầu P11 (hash tree được tính trên danh sách file sắp theo relative path và hash SHA-256 của từng file; với file đơn ghi hash file):

| Vùng/tệp được bảo vệ | Baseline | Sau P11 | Kết quả |
|---|---|---|---|
| `src/main/java` + `src/main/resources` | `1486309F5542F841AB8B571C6E0E4FE80180717A63BB02F60006CF5EB98FBC27` | giống baseline | Không đổi |
| `docs/api/openapi-function1.json` | `404A76702F41E34CB73AEE718C2C4C5A86CB04564FEFDECFF8EF52DB629FC7DC` | giống baseline | Không đổi |
| `docs/api/function1-examples.http` | `BF06A8C5CC9F42EA4B224421D8641ACF120421CAC7D3676D18EE14DC1CAAEDBE` | giống baseline | Không đổi |
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` | giống baseline | Không đổi |
| toàn `docs/reference/` | `383784A40D96E9BDEBC514671FB4CF87D6F10EF938A3CBE153126ADC9C2208CC` | giống baseline | Không đổi |
| `src/main/java/com/carrental/entity/` | `5505E40D16424B6474FC808F61C7C925BFDBA8BC76990CA835C4E77E2DCF5F06` | giống baseline | Không đổi |
| migrations | `BB7AD55B7D9D15BE6A71F85231D9012B5E30B57C9DFBF7AACFDA1285B3823993` | giống baseline | Không đổi |
| `pom.xml` | `9E7243FF673B6D98FF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219` | giống baseline | Không đổi |
| Maven scripts/wrapper | `DCF1A1B6E57A5B69BD26E1C5E2ABA46E02FA8F867EC798DFB517F3D02986FEF1` | giống baseline | Không đổi |
| `docs/prompts/`, `docs/reports/`, `docs/reviews/` (loại report mới P11 khi tính) | `FE1BFE485B37B39A6AB932276A6421A0F8E401A3CC18D5BCC878BDFB390C6E9C` | `FE1BFE485B37B39A6AB932276A6421A0F8E401A3CC18D5BCC878BDFB390C6E9C` | Lịch sử cũ không đổi |
| `P10_FIX_01_REPORT.md` | `CDCA7F03C8A4B8D75EE9C02734218A8CFDC3CCCDD8B87A1E79E71DDCDFFD8DC2` | giống baseline | Không đổi |
| `P10_FIX_01_REVIEW.md` | `659ADA8BEEF0D51DE1E6E34685F8D0968611B0267B5FF77C6EE445141DFCDE55` | giống baseline | Không đổi |
| `P11_POSTMAN_FUNCTION_1.md` | `32418E314E6CDAB29F804D8B301F102B0887F8A9740EE71A2E57E6A784BED757` | giống baseline | Không đổi |

## Kiểm tra runtime và regression

Đã chạy `.\mvnw.cmd -B clean verify -Ppostgres-it` với `JAVA_HOME`/`Path` trỏ JDK 21:

- Build **PASS**.
- Surefire: 42 test; Failsafe/PostgreSQL integration: 108 test.
- Tổng: **150/150**, 0 failure, 0 error, 0 skipped.
- Regression P01–P10 chạy trong suite hiện hữu; PostgreSQL là Testcontainers 15.13 cô lập.

Đã khởi động executable Boot JAR chuẩn từ output Maven với external local config/RSA key/private storage, bootstrap ADMIN synthetic và PostgreSQL container riêng chỉ có Function 1 leader baseline. Không dùng endpoint giả/test fixture endpoint, không chạy database chung. Sau khi reset về database baseline sạch, hai lượt Newman mới chạy tuần tự trên cùng database; mỗi lượt tạo `runId`/dữ liệu mới. Cả hai dùng runner thật Newman 6.2.3, working directory `docs/postman`, collection file upload thật:

| Lượt | Requests executed | Test scripts | Pre-request scripts | Assertions | Failed | Skipped | Thời lượng |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 112 | 112 | 112 | 564 | 0 | 0 | 12 s |
| 2 | 112 | 112 | 112 | 564 | 0 | 0 | 11.2 s |

Newman command (environment file/ADMIN credentials được giữ ngoài repository và không đưa vào command/output report):

```powershell
newman run docs/postman/SBA301_Function1.postman_collection.json `
  --environment <TEMP-only local test environment file> `
  --working-dir docs/postman --reporters cli `
  --timeout-request 30000 --timeout-script 10000 --color off
```

Ứng dụng chạy từ executable JAR thật; health probe quan sát được **HTTP 200**, `code=OK`, `data.status=UP`, và `X-Request-ID` bằng `traceId`. Response đã che trace runtime:

```json
{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"<redacted>"}
```

Packaging probe PASS và marker local config, private key, bootstrap secret, private storage path cùng helper test không xuất hiện trong JAR. Build/runner tool và fixture không được thêm vào POM/runtime dependency.

## Chưa chạy trong collection / hạn chế

Các trường hợp cần thay cấu hình/môi trường riêng vẫn là **MANUAL / NOT_RUN trong Postman**: storage disabled → 503; file quá giới hạn → 413; PostgreSQL lock-timeout/concurrency probe từ client; cấm khóa ADMIN ACTIVE cuối cùng với fixture nhiều ADMIN; JWT expiry/clock skew; bank account bị payout tham chiếu. Một số invariant concurrency/security có regression Maven/PostgreSQL hiện hữu, nhưng không được tính là Newman coverage. Payout thuộc Function 4, không tạo endpoint hoặc dữ liệu giả để mô phỏng. Collection không gồm apply/redeem voucher hoặc APIs Function 2–4.

`GET /api/health` chỉ chứng minh web process trả lời, không xác nhận DB/JWT/storage readiness. Khi import, người dùng cần đặt `baseUrl` và ADMIN test đã provision; để chạy upload từ Postman Desktop cần chọn `docs/postman` làm Working Directory. Xem README cho local DB/schema, external config, bootstrap ADMIN an toàn, runner order, giữ local collection variables và xử lý lỗi setup. Không export/share collection có runtime values sau khi chạy.

Lần đầu `mvnw -version` không có `JAVA_HOME` thất bại; tất cả build/probe được chạy lại với JDK 21. Đã dừng executable app và disposable PostgreSQL container sau lần chạy cuối. Tuy nhiên, môi trường tự động chặn lệnh recursive cleanup. Hai thư mục TEMP do lượt này tạo vẫn còn tại `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p11-run-20261015` (runtime config/key/fixtures/logs) và `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p11-tools-20261015` (Newman/schema validation tooling). App/container đã dừng; không thử xóa qua shell/interpreter khác hoặc sửa policy. Đây là residue local ngoài repository, không nằm trong artifact bàn giao và không được chứa trong Git.

## Git và inventory

`git diff --stat` và `git diff --cached --stat` đều rỗng vì repository vốn có các nội dung chưa track; không stage file. `git status --short --untracked-files=all` tại thời điểm report ghi nhận **272 untracked paths**, 0 tracked modifications, 0 staged changes. Inventory đầy đủ bên dưới gồm cả file đã tồn tại từ trước và sản phẩm P11; không coi toàn bộ 272 file là do P11 tạo.

```text
- .gitignore
- .mvn/wrapper/maven-wrapper.jar
- .mvn/wrapper/maven-wrapper.properties
- AGENTS.md
- README.md
- config/application-local.properties.example
- docs/01_FUNCTION_1_SCOPE.md
- docs/02_FUNCTION_1_ARCHITECTURE.md
- docs/03_FUNCTION_1_API.md
- docs/04_DATABASE_REVIEW.md
- docs/05_BACKEND_CONVENTIONS.md
- docs/06_IMPLEMENTATION_PLAN.md
- docs/07_DECISIONS_AND_OPEN_QUESTIONS.md
- docs/08_PROMPT_ROADMAP.md
- docs/09_FUNCTION_1_PERSISTENCE.md
- docs/10_AUTH_SECURITY.md
- docs/11_CUSTOMER_PROFILE_ADMIN.md
- docs/12_PRIVATE_DOCUMENT_STORAGE.md
- docs/13_DOCUMENT_REVIEW_KYC.md
- docs/14_DRIVER_PROFILE_ELIGIBILITY.md
- docs/15_BANK_ACCOUNTS.md
- docs/16_ADMIN_VOUCHERS.md
- docs/17_FUNCTION_1_HANDOFF.md
- docs/18_FUNCTION_1_ACCEPTANCE.md
- docs/19_FUNCTION_1_RUNBOOK.md
- docs/IMPLEMENTATION_STATUS.md
- docs/LOCAL_DEVELOPMENT.md
- docs/README.md
- docs/api/function1-examples.http
- docs/api/openapi-function1.json
- docs/postman/README.md
- docs/postman/SBA301_Function1.postman_collection.json
- docs/postman/fixtures/not-an-image.txt
- docs/postman/fixtures/synthetic-back.jpg
- docs/postman/fixtures/synthetic-back.png
- docs/postman/fixtures/synthetic-front.jpg
- docs/postman/fixtures/synthetic-front.png
- docs/prompts/P01_FIX_01.md
- docs/prompts/P01_FOUNDATION.md
- docs/prompts/P02_DATABASE_FOUNDATION.md
- docs/prompts/P03_AUTH_SECURITY.md
- docs/prompts/P03_FIX_01.md
- docs/prompts/P04_CUSTOMER_PROFILE_ADMIN.md
- docs/prompts/P04_FIX_01.md
- docs/prompts/P05_FIX_01.md
- docs/prompts/P05_FIX_02.md
- docs/prompts/P05_PRIVATE_DOCUMENTS.md
- docs/prompts/P06_DOCUMENT_REVIEW_KYC.md
- docs/prompts/P06_FIX_01.md
- docs/prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md
- docs/prompts/P07_FIX_01.md
- docs/prompts/P08_BANK_ACCOUNTS.md
- docs/prompts/P09_ADMIN_VOUCHERS.md
- docs/prompts/P09_FIX_01.md
- docs/prompts/P10_FIX_01.md
- docs/prompts/P10_FUNCTION_1_HANDOFF.md
- docs/prompts/P11_POSTMAN_FUNCTION_1.md
- docs/reference/BACKEND_CONVENTIONS.md
- docs/reference/MENTOR_NOTES.md
- docs/reference/README.md
- docs/reference/car_rental_conceptual.drawio
- docs/reference/schema.sql
- docs/reports/P01_FIX_01_REPORT.md
- docs/reports/P01_REPORT.md
- docs/reports/P02_REPORT.md
- docs/reports/P03_FIX_01_REPORT.md
- docs/reports/P03_REPORT.md
- docs/reports/P04_FIX_01_REPORT.md
- docs/reports/P04_REPORT.md
- docs/reports/P05_FIX_01_REPORT.md
- docs/reports/P05_FIX_02_REPORT.md
- docs/reports/P05_REPORT.md
- docs/reports/P06_FIX_01_REPORT.md
- docs/reports/P06_REPORT.md
- docs/reports/P07_FIX_01_REPORT.md
- docs/reports/P07_REPORT.md
- docs/reports/P08_REPORT.md
- docs/reports/P09_FIX_01_REPORT.md
- docs/reports/P09_REPORT.md
- docs/reports/P10_FIX_01_REPORT.md
- docs/reports/P10_REPORT.md
- docs/reports/P11_POSTMAN_REPORT.md
- docs/reviews/P01_FIX_01_REVIEW.md
- docs/reviews/P01_REVIEW.md
- docs/reviews/P02_REVIEW.md
- docs/reviews/P03_FIX_01_REVIEW.md
- docs/reviews/P03_REVIEW.md
- docs/reviews/P04_FIX_01_REVIEW.md
- docs/reviews/P04_REVIEW.md
- docs/reviews/P05_FIX_01_REVIEW.md
- docs/reviews/P05_FIX_02_REVIEW.md
- docs/reviews/P05_REVIEW.md
- docs/reviews/P06_FIX_01_REVIEW.md
- docs/reviews/P06_REVIEW.md
- docs/reviews/P07_FIX_01_REVIEW.md
- docs/reviews/P07_REVIEW.md
- docs/reviews/P08_REVIEW.md
- docs/reviews/P09_FIX_01_REVIEW.md
- docs/reviews/P09_REVIEW.md
- docs/reviews/P10_FIX_01_REVIEW.md
- docs/reviews/P10_REVIEW.md
- mvnw
- mvnw.cmd
- pom.xml
- scripts/verify-local-config-packaging.ps1
- src/main/java/com/carrental/CarRentalApplication.java
- src/main/java/com/carrental/config/ClockConfig.java
- src/main/java/com/carrental/config/CustomerProperties.java
- src/main/java/com/carrental/config/DocumentConfiguration.java
- src/main/java/com/carrental/config/DocumentProperties.java
- src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java
- src/main/java/com/carrental/config/security/AdminBootstrapRunner.java
- src/main/java/com/carrental/config/security/BootstrapAdminProperties.java
- src/main/java/com/carrental/config/security/CorsProperties.java
- src/main/java/com/carrental/config/security/JwtConfiguration.java
- src/main/java/com/carrental/config/security/JwtKeyLoader.java
- src/main/java/com/carrental/config/security/JwtKeyMaterial.java
- src/main/java/com/carrental/config/security/JwtProperties.java
- src/main/java/com/carrental/config/security/PasswordPolicyProperties.java
- src/main/java/com/carrental/config/security/SecurityConfiguration.java
- src/main/java/com/carrental/controller/AuthController.java
- src/main/java/com/carrental/controller/BankAccountController.java
- src/main/java/com/carrental/controller/CustomerController.java
- src/main/java/com/carrental/controller/DriverController.java
- src/main/java/com/carrental/controller/HealthController.java
- src/main/java/com/carrental/controller/UserDocumentController.java
- src/main/java/com/carrental/controller/VoucherController.java
- src/main/java/com/carrental/dto/internal/BankAccountPayeeDetails.java
- src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java
- src/main/java/com/carrental/dto/request/auth/LoginRequest.java
- src/main/java/com/carrental/dto/request/auth/RegisterRequest.java
- src/main/java/com/carrental/dto/request/bankaccount/BankAccountListQuery.java
- src/main/java/com/carrental/dto/request/bankaccount/CreateBankAccountRequest.java
- src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java
- src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java
- src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java
- src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java
- src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java
- src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java
- src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java
- src/main/java/com/carrental/dto/request/driver/ChangeDriverStatusRequest.java
- src/main/java/com/carrental/dto/request/driver/DriverListQuery.java
- src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java
- src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java
- src/main/java/com/carrental/dto/request/voucher/UpdateVoucherAdminRequest.java
- src/main/java/com/carrental/dto/request/voucher/VoucherListQuery.java
- src/main/java/com/carrental/dto/response/ApiResponse.java
- src/main/java/com/carrental/dto/response/BankAccountResponse.java
- src/main/java/com/carrental/dto/response/CustomerAdminResponse.java
- src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
- src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java
- src/main/java/com/carrental/dto/response/DriverEligibilityReasonCode.java
- src/main/java/com/carrental/dto/response/DriverEligibilityResponse.java
- src/main/java/com/carrental/dto/response/DriverResponse.java
- src/main/java/com/carrental/dto/response/FieldErrorResponse.java
- src/main/java/com/carrental/dto/response/HealthResponse.java
- src/main/java/com/carrental/dto/response/KycSummaryResponse.java
- src/main/java/com/carrental/dto/response/PageResponse.java
- src/main/java/com/carrental/dto/response/TokenResponse.java
- src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java
- src/main/java/com/carrental/dto/response/UserDocumentReviewResponse.java
- src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java
- src/main/java/com/carrental/dto/response/VoucherResponse.java
- src/main/java/com/carrental/dto/response/VoucherWindowState.java
- src/main/java/com/carrental/entity/BankAccount.java
- src/main/java/com/carrental/entity/Customer.java
- src/main/java/com/carrental/entity/Driver.java
- src/main/java/com/carrental/entity/UserDocument.java
- src/main/java/com/carrental/entity/Voucher.java
- src/main/java/com/carrental/entity/base/AuditedEntity.java
- src/main/java/com/carrental/entity/base/BaseEntity.java
- src/main/java/com/carrental/enums/CustomerStatus.java
- src/main/java/com/carrental/enums/DiscountType.java
- src/main/java/com/carrental/enums/DocumentVerifyStatus.java
- src/main/java/com/carrental/enums/DriverStatus.java
- src/main/java/com/carrental/enums/KycStatus.java
- src/main/java/com/carrental/enums/Role.java
- src/main/java/com/carrental/enums/UserDocumentType.java
- src/main/java/com/carrental/enums/VoucherStatus.java
- src/main/java/com/carrental/exception/AppException.java
- src/main/java/com/carrental/exception/ErrorCode.java
- src/main/java/com/carrental/exception/GlobalExceptionHandler.java
- src/main/java/com/carrental/mapper/BankAccountMapper.java
- src/main/java/com/carrental/mapper/CustomerMapper.java
- src/main/java/com/carrental/mapper/DriverMapper.java
- src/main/java/com/carrental/mapper/UserDocumentMapper.java
- src/main/java/com/carrental/mapper/VoucherMapper.java
- src/main/java/com/carrental/repository/BankAccountRepository.java
- src/main/java/com/carrental/repository/CustomerRepository.java
- src/main/java/com/carrental/repository/CustomerStatusLock.java
- src/main/java/com/carrental/repository/DriverEligibilityProjection.java
- src/main/java/com/carrental/repository/DriverRepository.java
- src/main/java/com/carrental/repository/KycEvidenceProjection.java
- src/main/java/com/carrental/repository/UserDocumentRepository.java
- src/main/java/com/carrental/repository/VoucherRepository.java
- src/main/java/com/carrental/security/AccountUserDetails.java
- src/main/java/com/carrental/security/ApiAccessDeniedHandler.java
- src/main/java/com/carrental/security/ApiAuthenticationEntryPoint.java
- src/main/java/com/carrental/security/CurrentAccount.java
- src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java
- src/main/java/com/carrental/security/CustomerUserDetailsService.java
- src/main/java/com/carrental/security/InvalidCurrentAccountException.java
- src/main/java/com/carrental/security/SecurityErrorResponses.java
- src/main/java/com/carrental/service/AuthService.java
- src/main/java/com/carrental/service/BankAccountChangeLogger.java
- src/main/java/com/carrental/service/BankAccountLookupService.java
- src/main/java/com/carrental/service/BankAccountService.java
- src/main/java/com/carrental/service/CustomerService.java
- src/main/java/com/carrental/service/CustomerStatusChangeLogger.java
- src/main/java/com/carrental/service/DocumentReviewLogger.java
- src/main/java/com/carrental/service/DriverChangeLogger.java
- src/main/java/com/carrental/service/DriverEligibilityPolicy.java
- src/main/java/com/carrental/service/DriverEligibilityService.java
- src/main/java/com/carrental/service/DriverService.java
- src/main/java/com/carrental/service/KycPolicy.java
- src/main/java/com/carrental/service/KycService.java
- src/main/java/com/carrental/service/UserDocumentService.java
- src/main/java/com/carrental/service/VoucherChangeLogger.java
- src/main/java/com/carrental/service/VoucherService.java
- src/main/java/com/carrental/service/impl/AdminBootstrapService.java
- src/main/java/com/carrental/service/impl/AuthServiceImpl.java
- src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java
- src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
- src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java
- src/main/java/com/carrental/service/impl/DriverServiceImpl.java
- src/main/java/com/carrental/service/impl/KycServiceImpl.java
- src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java
- src/main/java/com/carrental/service/impl/VoucherServiceImpl.java
- src/main/java/com/carrental/storage/CanonicalDocumentImage.java
- src/main/java/com/carrental/storage/DocumentImageFormat.java
- src/main/java/com/carrental/storage/DocumentImageInspector.java
- src/main/java/com/carrental/storage/ImageStructureValidator.java
- src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java
- src/main/java/com/carrental/storage/PrivateDocumentFile.java
- src/main/java/com/carrental/storage/PrivateDocumentReceipt.java
- src/main/java/com/carrental/storage/PrivateDocumentStorage.java
- src/main/java/com/carrental/storage/StorageRootPolicy.java
- src/main/java/com/carrental/storage/UploadedDocumentImage.java
- src/main/java/com/carrental/validation/PasswordPolicyValidator.java
- src/main/java/com/carrental/validation/ValidPassword.java
- src/main/java/com/carrental/web/RequestTraceFilter.java
- src/main/java/com/carrental/web/UserDocumentMultipartReader.java
- src/main/resources/application.properties
- src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql
- src/test/java/com/carrental/AuthSecurityPostgresIT.java
- src/test/java/com/carrental/AuthSecurityTestFixtures.java
- src/test/java/com/carrental/BankAccountPostgresIT.java
- src/test/java/com/carrental/CustomerManagementPostgresIT.java
- src/test/java/com/carrental/CustomerPropertiesTest.java
- src/test/java/com/carrental/DriverConcurrencyPostgresIT.java
- src/test/java/com/carrental/DriverEligibilityPolicyTest.java
- src/test/java/com/carrental/DriverProfilePostgresIT.java
- src/test/java/com/carrental/Function1ExecutableJarSmokeIT.java
- src/test/java/com/carrental/Function1OpenApiContractTest.java
- src/test/java/com/carrental/Function1PostgresIT.java
- src/test/java/com/carrental/Function1WorkflowPostgresIT.java
- src/test/java/com/carrental/JwtConfigurationTest.java
- src/test/java/com/carrental/KycPolicyTest.java
- src/test/java/com/carrental/MutableTestClock.java
- src/test/java/com/carrental/PlatformHttpTest.java
- src/test/java/com/carrental/PlatformTestFixtures.java
- src/test/java/com/carrental/PrivateDocumentStorageTest.java
- src/test/java/com/carrental/TestJwtKeys.java
- src/test/java/com/carrental/UserDocumentPostgresIT.java
- src/test/java/com/carrental/UserDocumentReviewPostgresIT.java
- src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java
- src/test/java/com/carrental/VoucherAdminPostgresIT.java
- src/test/java/com/carrental/repository/CustomerStatusLockTest.java
- src/test/java/com/carrental/storage/StorageRootBootJarIT.java
- src/test/java/com/carrental/storage/StorageRootBootJarProbe.java
- src/test/java/com/carrental/storage/StorageRootJarProbe.java
- src/test/java/com/carrental/storage/StorageRootPolicyTest.java
```

Không commit/push/deploy. P11 đặt `READY_FOR_REVIEW` để reviewer kiểm tra collection/runtime evidence; dừng tại đây, chưa triển khai prompt tiếp theo và không tự ghi APPROVED.
