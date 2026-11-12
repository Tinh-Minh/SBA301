# P10-FIX-01 — Báo cáo sửa R1/R2

Ngày: **2026-10-15**  
Trạng thái: **READY_FOR_REVIEW** — R1/R2 đã được xử lý trong đặc tả, tài liệu và regression; **chờ reviewer xác nhận**, không tự đánh dấu CLOSED/APPROVED. P10 vẫn CHANGES_REQUESTED cho đến khi reviewer quyết định. Function 1 chưa được đánh dấu hoàn tất.

## 1. Kết quả

| Finding | Sửa đổi | Bằng chứng regression | Trạng thái |
|---|---|---|---|
| R1 — OpenAPI request contract lệch runtime | Cập nhật enum, required/nullability, conditional request rules, string/numeric bounds và mô tả các giới hạn phụ thuộc Java/Clock/parser. Bổ sung parity coverage nối schema với DTO/parser/enum/record thực tế. | `Function1OpenApiContractTest` 4/4; `Function1WorkflowPostgresIT` kiểm tra HTTP với PostgreSQL 15.13 cô lập; full suite 150/150. | Đã sửa; chờ reviewer |
| R2 — Handoff tuyên bố mọi JSON đều từ chối duplicate key | Handoff/runbook/API docs nêu duplicate behavior theo DTO/parser. Không bật global strict parser hoặc thay auth runtime. | Login có hai key `email` giống nhau trả HTTP 200 trong regression; command voucher có duplicate `code` bị HTTP 400 `INVALID_REQUEST`, không tạo row. | Đã sửa; chờ reviewer |

## 2. Các thay đổi

### Spec và regression

- `docs/api/openapi-function1.json`: driver query enum chỉ `PENDING/ACTIVE/SUSPENDED`; voucher query enum chỉ `ACTIVE/INACTIVE`; profile nullable/required/length; customer và driver status condition; upload class và U-13 distinction; exact integral voucher amounts, PERCENT limit và quota token caveat; request/response field parity. OpenAPI vẫn 3.1.0, không thêm runtime dependency.
- `src/test/java/com/carrental/Function1OpenApiContractTest.java`: xác nhận `$ref` toàn tài liệu; đối chiếu request fields, multipart/parser allowlists, query parser fields/enums, response record fields và enums. Validator regression tự viết chỉ tuyên bố subset JSON Schema được hỗ trợ và fail rõ khi gặp assertion keyword ngoài subset.
- `src/test/java/com/carrental/Function1WorkflowPostgresIT.java`: thêm/giữ HTTP cases cho hai query enum, profile null/length, status required/conditional reason, PASSPORT tối thiểu và GPLX class, voucher integral/fraction/quota/default/PUT và duplicate field; kiểm tra response trace, không echo input nhạy cảm và không mutation khi request bị từ chối.

### Handoff, ví dụ và trạng thái

- `docs/17_FUNCTION_1_HANDOFF.md`: sửa duplicate-key guarantee theo DTO; ghi rõ normalization, length, status reason, upload/approval và exact-vs-lexical numeric behavior.
- `docs/18_FUNCTION_1_ACCEPTANCE.md`: bổ sung contract/HTTP regression evidence và giới hạn validator; dẫn đến report run này.
- `docs/19_FUNCTION_1_RUNBOOK.md`: phân biệt customer self-lock `409` với self-review/self-driver-status `403`; bổ sung duplicate, profile, upload và voucher notes.
- `docs/api/function1-examples.http`: placeholders lấy từ process environment của VS Code REST Client, không tự tham chiếu token; PASSPORT được ghi rõ là PENDING cho đến khi có U-13 approval metadata; GPLX gửi `licenseClass` khi submit.
- `docs/11_CUSTOMER_PROFILE_ADMIN.md`: sửa câu mô tả presence fields đã lỗi thời, ghi rõ hành vi profile hiện tại.
- Các trang trạng thái/định hướng được đồng bộ: `AGENTS.md`, `README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/README.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md`, `docs/14_DRIVER_PROFILE_ELIGIBILITY.md`, `docs/15_BANK_ACCOUNTS.md`, `docs/16_ADMIN_VOUCHERS.md`.
- Tài liệu nguồn `docs/reference/`, prompt, review và report P10 lịch sử không bị sửa.

## 3. Ma trận kiểm chứng

| Kiểm tra | Kết quả thực tế |
|---|---|
| OpenAPI focused contract | **PASS 4/4**, 0 failure/error/skip. Request schema được nối tới DTO/parser/enum thật; response fields/required đối chiếu Java record components. Đây không phải full semantic OpenAPI validator. |
| Focused PostgreSQL workflow | **PASS 1/1** trên Testcontainers PostgreSQL `15.13-alpine`; Docker server `28.5.2`. Kiểm tra các HTTP cases mới và regression P10 trước đó. |
| Full unit/contract suite (Surefire) | **PASS 42 tests**, 0 failure/error/skip. |
| Full PostgreSQL/HTTP integration suite (Failsafe) | **PASS 108 tests**, 0 failure/error/skip. Tổng `clean verify`: **150/150**. |
| Standard executable-JAR smoke | **PASS** trong Failsafe: JAR chạy bằng `java -jar` từ working directory Unicode/có khoảng trắng với external profile/config/key/private root và PostgreSQL cô lập. `Function1ExecutableJarSmokeIT` báo health 200, trace, auth/document/voucher paths đạt; artifact SHA-256 quan sát trong log test: `2023351EE9AB6CED7EC85728BC58522CE4AF0394214C96045C04A162D38AFC5A`. |
| Packaging probe | **PASS**. Probe build thành công; local config, fake local-config/private-key/bootstrap-secret/private-document markers, private storage root path, private key entry và test Boot helper đều không có trong executable JAR. |
| Health HTTP trong workflow | **PASS**, HTTP 200. Test parse body dạng `{"success":true,"code":"OK","message":"Thành công","data":{"status":"UP"},"errors":[],"traceId":"<UUID>"}`; giá trị trace được ẩn ở đây, `X-Request-ID` trong response thực tế bằng `traceId`. Endpoint chỉ báo web app đáp ứng, không tuyên bố DB/storage/security dependency health. |
| Git/build isolation | **PASS**: nhánh `BE`; không stage/commit/push/deploy; PostgreSQL chỉ từ Testcontainers, không dùng DB chung. |

### Lệnh đã chạy

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B '-Dtest=Function1OpenApiContractTest' test
.\mvnw.cmd -B '-Dtest=none' '-Dsurefire.failIfNoSpecifiedTests=false' '-Dit.test=Function1WorkflowPostgresIT' verify '-Ppostgres-it'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

Kết quả full verify: **BUILD SUCCESS**, 2 phút 22 giây; Surefire 42/42 và Failsafe 108/108. Packaging probe kết thúc `PROBE_BUILD=PASS`; mọi marker/đường dẫn cần loại khỏi JAR đều `False` ở kiểm tra packaged. Health evidence là response HTTP thật của workflow/smoke trong PostgreSQL Testcontainers, không phải suy luận từ compile.

### Các lần chạy chưa đạt trước lần chạy đúng

- Một lần gọi focused contract trong PowerShell process không có `JAVA_HOME` dừng trước khi Maven khởi chạy; lần gọi thiết lập JDK 21 chạy lại đạt 4/4.
- Lần đầu `SchemaSubsetValidator` mới thêm chưa duyệt nested `properties`, nên một contract test fail; sửa chính test validator để đi vào nested schemas và lần focused cuối đạt 4/4.
- PowerShell tách một `-D` argument trong lần gọi focused workflow đầu tiên, Maven hiểu `.failIfNoSpecifiedTests=false` là lifecycle phase và không chạy test. Quote các `-D` arguments rồi chạy lại `Function1WorkflowPostgresIT`; đạt 1/1. Không có lỗi runtime bị che hoặc test bị skip trong full verify cuối.

## 4. Kết quả runtime/contract cụ thể

- Driver list chấp nhận `PENDING/ACTIVE/SUSPENDED`, từ chối `LOCKED/INACTIVE` với 400. Voucher list chấp nhận `ACTIVE/INACTIVE`, từ chối `PENDING/SUSPENDED/LOCKED` với 400.
- Profile: omitted `fullName` được phép, `fullName:null` trả 400; address 301 ASCII ký tự trả 400, 300 được nhận, nullable clear giữ được.
- Customer status thiếu/null/blank/quá dài reason và driver status sai reason trả 400, không đổi status/audit. Driver `SUSPENDED` cần reason không blank; `ACTIVE` chỉ omitted/null reason.
- PASSPORT tối thiểu tạo document PENDING; GPLX cần `licenseClass` ngay khi submit. Metadata/ảnh/hạn cho APPROVED vẫn là điều kiện U-13 riêng.
- Voucher amount fields chấp nhận giá trị toán học integral như `1.0`/`1e0`, từ chối fractional amounts/PERCENT >100; quota INT tokens `1.0`/`1e0` bị từ chối. Duplicate `code` trên command trả 400, không ghi voucher.
- Login chứa cùng `email` JSON key hai lần tiếp tục trả 200 theo auth runtime đã được duyệt; response chỉ kiểm tra success/token type/trace trong test, bearer token không được ghi ra log/report.

## 5. Quyết định, giới hạn và việc còn lại

- R1/R2 chỉ yêu cầu đồng bộ contract/handoff/tests với runtime đã duyệt. Không sửa production Java/config/policy, POM/dependencies, schema, entity, migration, `docs/reference/` hoặc auth duplicate-key parser.
- OpenAPI/JSON Schema không thể thể hiện đầy đủ duplicate JSON member names, Java `String.length()` UTF-16 semantics, strip normalization, Clock/current database state, authorization/transition, hoặc token lexical rule cho quota. Các trường hợp này được mô tả và có HTTP regression; subset validator không được gọi là full OAS validation.
- R1 và R2 đang chờ reviewer chạy/đánh giá lại. Không tự đóng findings hoặc chuyển P10 sang APPROVED. F2/F3/F4 integration đầy đủ, production/shared DB, production ACL/RLS, multi-node storage, crash recovery và deployment vẫn ngoài phạm vi kiểm chứng.
- Review ghi sáu TEMP directory cũ cùng một workflow root rỗng từ lần Docker unavailable. Lượt này chỉ đọc metadata và vẫn thấy: `sba301-p10-config-6027217552336866762`, `sba301-p10-config-9971155495230811732`, `sba301-p10-jar-17787760648092423892`, `sba301-p10-jar-8367741168530536375`, `sba301-p10-storage-456267405934003659`, `sba301-p10-storage-9689080637910311073`, và workflow root `sba301-p10-workflow-private-1377507395452970899`. Cũng còn `sba301-p10-review-probe` từ reviewer. Không đọc nội dung nhạy cảm và không thử xóa/bypass policy. Testcontainers dừng theo lifecycle của test; packaging script báo probe build PASS.

## 6. Bảo toàn và checksum

Baseline đầu lượt: `BE`, `HEAD = origin/BE = 2fe712eed12a2af3b61f0a5311bdd3901f614029`. Repository có **261 paths untracked** trước khi tạo report này; không có staged hay tracked diff. Giữ lại toàn bộ file đó; một số tài liệu/test được cập nhật theo danh sách ở trên, không xóa hay stage file nào. Vì các file nguồn vốn untracked nên `git diff --stat` và `git diff --cached --stat` đều rỗng, không phải bằng chứng rằng không có nội dung được sửa. Final status có 262 untracked paths, gồm 261 paths ban đầu và report mới.

Các hash SHA-256 sau không đổi giữa baseline và lần kiểm tra cuối:

| File/nhóm được bảo vệ | SHA-256 trước và sau |
|---|---|
| `src/main/java/**` + `src/main/resources/**` sorted path/hash manifest | `1486309F5542F841AB8B571C6E0E4FE80180717A63BB02F60006CF5EB98FBC27` |
| `pom.xml` | `9E7243FF673B6D98FF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219` |
| `docs/reports/P10_REPORT.md` | `22B013F60498F23FA20FC2E7D8AB907B04276EBF7A10CAC5ABEB8E8F41140903` |
| `docs/reviews/P10_REVIEW.md` | `9606F84BEA338B8FB0735880F28680D50BBE88ECD76FD3413E7BB66637499CB4` |
| `docs/prompts/P10_FUNCTION_1_HANDOFF.md` | `AE174DB519FAB7EAE6242937FFE5E18D367279A4CB39F26009400B8BD88F9882` |
| `docs/prompts/P10_FIX_01.md` | `6DED3768DD7ACD7F326527D5E690367DD23E954E3E3E767B20349AC3158C6ED1` |
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| Function 1 leader migration | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| Five Function 1 entity files | Customer `F687C5212FE64E06D58729D13EE2CBB4D5CC8055D270BCDB22BFF51DF587A193`; UserDocument `B7B7BD665DC41994553EC9557CF8326EAE1263AD367F793EE8B2B3B0E2E7A006`; Driver `9F92C965A075ADFE32EEA92FC562FDD092A0EBD1CEE14ADAA7606CB492AE6817`; BankAccount `FA03F0D8330342EF595DE140BCFD0E475B0AE071AE5F1EDD32C21B4D96CE2B35`; Voucher `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |
| Packaging script and Maven wrapper | Script `D2D99488811B3DCF7103DD928FC60AFA09491942962D54A92D14AEC826527470`; wrapper JAR `4E2FBF6554BC8A4702CDFDD3BEF464F423393D784DDBB037216320CE55D5E4E1`; wrapper properties `071FE81D69071C8C43431AA2C507B640CD5424C7005EB3E64D5F25E66099B4FD` |

**POM hash erratum:** P10 report ghi một checksum khác `pom.xml` một ký tự; file hiện tại và baseline lượt này cùng hash `9E7243FF673B6D98FF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219`, đúng với review. Không có snapshot POM độc lập trước P10 để kết luận thời điểm sai khác; giữ nguyên POM và report cũ.

## 7. Git và dừng review

- Branch `BE`; HEAD và `origin/BE` giữ nguyên `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Staged: 0. Tracked diff: 0. Untracked: 262 paths sau khi thêm report; inventory đầy đủ ở Appendix A. Không stage/commit/push/reset/clean/switch branch.
- Không deploy, không chạy SQL/migration hoặc dùng database chung. Không triển khai P11. READY_FOR_REVIEW; chờ reviewer quyết định R1/R2 và P10.

## Appendix A — Toàn bộ inventory untracked sau lượt sửa

Danh sách đầy đủ tại thời điểm tạo report:

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
?? docs/09_FUNCTION_1_PERSISTENCE.md
?? docs/10_AUTH_SECURITY.md
?? docs/11_CUSTOMER_PROFILE_ADMIN.md
?? docs/12_PRIVATE_DOCUMENT_STORAGE.md
?? docs/13_DOCUMENT_REVIEW_KYC.md
?? docs/14_DRIVER_PROFILE_ELIGIBILITY.md
?? docs/15_BANK_ACCOUNTS.md
?? docs/16_ADMIN_VOUCHERS.md
?? docs/17_FUNCTION_1_HANDOFF.md
?? docs/18_FUNCTION_1_ACCEPTANCE.md
?? docs/19_FUNCTION_1_RUNBOOK.md
?? docs/api/function1-examples.http
?? docs/api/openapi-function1.json
?? docs/IMPLEMENTATION_STATUS.md
?? docs/LOCAL_DEVELOPMENT.md
?? docs/prompts/P01_FIX_01.md
?? docs/prompts/P01_FOUNDATION.md
?? docs/prompts/P02_DATABASE_FOUNDATION.md
?? docs/prompts/P03_AUTH_SECURITY.md
?? docs/prompts/P03_FIX_01.md
?? docs/prompts/P04_CUSTOMER_PROFILE_ADMIN.md
?? docs/prompts/P04_FIX_01.md
?? docs/prompts/P05_FIX_01.md
?? docs/prompts/P05_FIX_02.md
?? docs/prompts/P05_PRIVATE_DOCUMENTS.md
?? docs/prompts/P06_DOCUMENT_REVIEW_KYC.md
?? docs/prompts/P06_FIX_01.md
?? docs/prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md
?? docs/prompts/P07_FIX_01.md
?? docs/prompts/P08_BANK_ACCOUNTS.md
?? docs/prompts/P09_ADMIN_VOUCHERS.md
?? docs/prompts/P09_FIX_01.md
?? docs/prompts/P10_FIX_01.md
?? docs/prompts/P10_FUNCTION_1_HANDOFF.md
?? docs/README.md
?? docs/reference/BACKEND_CONVENTIONS.md
?? docs/reference/car_rental_conceptual.drawio
?? docs/reference/MENTOR_NOTES.md
?? docs/reference/README.md
?? docs/reference/schema.sql
?? docs/reports/P01_FIX_01_REPORT.md
?? docs/reports/P01_REPORT.md
?? docs/reports/P02_REPORT.md
?? docs/reports/P03_FIX_01_REPORT.md
?? docs/reports/P03_REPORT.md
?? docs/reports/P04_FIX_01_REPORT.md
?? docs/reports/P04_REPORT.md
?? docs/reports/P05_FIX_01_REPORT.md
?? docs/reports/P05_FIX_02_REPORT.md
?? docs/reports/P05_REPORT.md
?? docs/reports/P06_FIX_01_REPORT.md
?? docs/reports/P06_REPORT.md
?? docs/reports/P07_FIX_01_REPORT.md
?? docs/reports/P07_REPORT.md
?? docs/reports/P08_REPORT.md
?? docs/reports/P09_FIX_01_REPORT.md
?? docs/reports/P09_REPORT.md
?? docs/reports/P10_FIX_01_REPORT.md
?? docs/reports/P10_REPORT.md
?? docs/reviews/P01_FIX_01_REVIEW.md
?? docs/reviews/P01_REVIEW.md
?? docs/reviews/P02_REVIEW.md
?? docs/reviews/P03_FIX_01_REVIEW.md
?? docs/reviews/P03_REVIEW.md
?? docs/reviews/P04_FIX_01_REVIEW.md
?? docs/reviews/P04_REVIEW.md
?? docs/reviews/P05_FIX_01_REVIEW.md
?? docs/reviews/P05_FIX_02_REVIEW.md
?? docs/reviews/P05_REVIEW.md
?? docs/reviews/P06_FIX_01_REVIEW.md
?? docs/reviews/P06_REVIEW.md
?? docs/reviews/P07_FIX_01_REVIEW.md
?? docs/reviews/P07_REVIEW.md
?? docs/reviews/P08_REVIEW.md
?? docs/reviews/P09_FIX_01_REVIEW.md
?? docs/reviews/P09_REVIEW.md
?? docs/reviews/P10_REVIEW.md
?? mvnw
?? mvnw.cmd
?? pom.xml
?? README.md
?? scripts/verify-local-config-packaging.ps1
?? src/main/java/com/carrental/CarRentalApplication.java
?? src/main/java/com/carrental/config/ClockConfig.java
?? src/main/java/com/carrental/config/CustomerProperties.java
?? src/main/java/com/carrental/config/DocumentConfiguration.java
?? src/main/java/com/carrental/config/DocumentProperties.java
?? src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java
?? src/main/java/com/carrental/config/security/AdminBootstrapRunner.java
?? src/main/java/com/carrental/config/security/BootstrapAdminProperties.java
?? src/main/java/com/carrental/config/security/CorsProperties.java
?? src/main/java/com/carrental/config/security/JwtConfiguration.java
?? src/main/java/com/carrental/config/security/JwtKeyLoader.java
?? src/main/java/com/carrental/config/security/JwtKeyMaterial.java
?? src/main/java/com/carrental/config/security/JwtProperties.java
?? src/main/java/com/carrental/config/security/PasswordPolicyProperties.java
?? src/main/java/com/carrental/config/security/SecurityConfiguration.java
?? src/main/java/com/carrental/controller/AuthController.java
?? src/main/java/com/carrental/controller/BankAccountController.java
?? src/main/java/com/carrental/controller/CustomerController.java
?? src/main/java/com/carrental/controller/DriverController.java
?? src/main/java/com/carrental/controller/HealthController.java
?? src/main/java/com/carrental/controller/UserDocumentController.java
?? src/main/java/com/carrental/controller/VoucherController.java
?? src/main/java/com/carrental/dto/internal/BankAccountPayeeDetails.java
?? src/main/java/com/carrental/dto/request/auth/AuthInputNormalizer.java
?? src/main/java/com/carrental/dto/request/auth/LoginRequest.java
?? src/main/java/com/carrental/dto/request/auth/RegisterRequest.java
?? src/main/java/com/carrental/dto/request/bankaccount/BankAccountListQuery.java
?? src/main/java/com/carrental/dto/request/bankaccount/CreateBankAccountRequest.java
?? src/main/java/com/carrental/dto/request/customer/ChangeCustomerStatusRequest.java
?? src/main/java/com/carrental/dto/request/customer/CustomerListQuery.java
?? src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java
?? src/main/java/com/carrental/dto/request/document/ReviewUserDocumentRequest.java
?? src/main/java/com/carrental/dto/request/document/UserDocumentListQuery.java
?? src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java
?? src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionRequest.java
?? src/main/java/com/carrental/dto/request/driver/ChangeDriverStatusRequest.java
?? src/main/java/com/carrental/dto/request/driver/DriverListQuery.java
?? src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java
?? src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java
?? src/main/java/com/carrental/dto/request/voucher/UpdateVoucherAdminRequest.java
?? src/main/java/com/carrental/dto/request/voucher/VoucherListQuery.java
?? src/main/java/com/carrental/dto/response/ApiResponse.java
?? src/main/java/com/carrental/dto/response/BankAccountResponse.java
?? src/main/java/com/carrental/dto/response/CustomerAdminResponse.java
?? src/main/java/com/carrental/dto/response/CustomerProfileResponse.java
?? src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java
?? src/main/java/com/carrental/dto/response/DriverEligibilityReasonCode.java
?? src/main/java/com/carrental/dto/response/DriverEligibilityResponse.java
?? src/main/java/com/carrental/dto/response/DriverResponse.java
?? src/main/java/com/carrental/dto/response/FieldErrorResponse.java
?? src/main/java/com/carrental/dto/response/HealthResponse.java
?? src/main/java/com/carrental/dto/response/KycSummaryResponse.java
?? src/main/java/com/carrental/dto/response/PageResponse.java
?? src/main/java/com/carrental/dto/response/TokenResponse.java
?? src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java
?? src/main/java/com/carrental/dto/response/UserDocumentReviewResponse.java
?? src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java
?? src/main/java/com/carrental/dto/response/VoucherResponse.java
?? src/main/java/com/carrental/dto/response/VoucherWindowState.java
?? src/main/java/com/carrental/entity/BankAccount.java
?? src/main/java/com/carrental/entity/base/AuditedEntity.java
?? src/main/java/com/carrental/entity/base/BaseEntity.java
?? src/main/java/com/carrental/entity/Customer.java
?? src/main/java/com/carrental/entity/Driver.java
?? src/main/java/com/carrental/entity/UserDocument.java
?? src/main/java/com/carrental/entity/Voucher.java
?? src/main/java/com/carrental/enums/CustomerStatus.java
?? src/main/java/com/carrental/enums/DiscountType.java
?? src/main/java/com/carrental/enums/DocumentVerifyStatus.java
?? src/main/java/com/carrental/enums/DriverStatus.java
?? src/main/java/com/carrental/enums/KycStatus.java
?? src/main/java/com/carrental/enums/Role.java
?? src/main/java/com/carrental/enums/UserDocumentType.java
?? src/main/java/com/carrental/enums/VoucherStatus.java
?? src/main/java/com/carrental/exception/AppException.java
?? src/main/java/com/carrental/exception/ErrorCode.java
?? src/main/java/com/carrental/exception/GlobalExceptionHandler.java
?? src/main/java/com/carrental/mapper/BankAccountMapper.java
?? src/main/java/com/carrental/mapper/CustomerMapper.java
?? src/main/java/com/carrental/mapper/DriverMapper.java
?? src/main/java/com/carrental/mapper/UserDocumentMapper.java
?? src/main/java/com/carrental/mapper/VoucherMapper.java
?? src/main/java/com/carrental/repository/BankAccountRepository.java
?? src/main/java/com/carrental/repository/CustomerRepository.java
?? src/main/java/com/carrental/repository/CustomerStatusLock.java
?? src/main/java/com/carrental/repository/DriverEligibilityProjection.java
?? src/main/java/com/carrental/repository/DriverRepository.java
?? src/main/java/com/carrental/repository/KycEvidenceProjection.java
?? src/main/java/com/carrental/repository/UserDocumentRepository.java
?? src/main/java/com/carrental/repository/VoucherRepository.java
?? src/main/java/com/carrental/security/AccountUserDetails.java
?? src/main/java/com/carrental/security/ApiAccessDeniedHandler.java
?? src/main/java/com/carrental/security/ApiAuthenticationEntryPoint.java
?? src/main/java/com/carrental/security/CurrentAccount.java
?? src/main/java/com/carrental/security/CurrentAccountJwtAuthenticationConverter.java
?? src/main/java/com/carrental/security/CustomerUserDetailsService.java
?? src/main/java/com/carrental/security/InvalidCurrentAccountException.java
?? src/main/java/com/carrental/security/SecurityErrorResponses.java
?? src/main/java/com/carrental/service/AuthService.java
?? src/main/java/com/carrental/service/BankAccountChangeLogger.java
?? src/main/java/com/carrental/service/BankAccountLookupService.java
?? src/main/java/com/carrental/service/BankAccountService.java
?? src/main/java/com/carrental/service/CustomerService.java
?? src/main/java/com/carrental/service/CustomerStatusChangeLogger.java
?? src/main/java/com/carrental/service/DocumentReviewLogger.java
?? src/main/java/com/carrental/service/DriverChangeLogger.java
?? src/main/java/com/carrental/service/DriverEligibilityPolicy.java
?? src/main/java/com/carrental/service/DriverEligibilityService.java
?? src/main/java/com/carrental/service/DriverService.java
?? src/main/java/com/carrental/service/impl/AdminBootstrapService.java
?? src/main/java/com/carrental/service/impl/AuthServiceImpl.java
?? src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java
?? src/main/java/com/carrental/service/impl/CustomerServiceImpl.java
?? src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java
?? src/main/java/com/carrental/service/impl/DriverServiceImpl.java
?? src/main/java/com/carrental/service/impl/KycServiceImpl.java
?? src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java
?? src/main/java/com/carrental/service/impl/VoucherServiceImpl.java
?? src/main/java/com/carrental/service/KycPolicy.java
?? src/main/java/com/carrental/service/KycService.java
?? src/main/java/com/carrental/service/UserDocumentService.java
?? src/main/java/com/carrental/service/VoucherChangeLogger.java
?? src/main/java/com/carrental/service/VoucherService.java
?? src/main/java/com/carrental/storage/CanonicalDocumentImage.java
?? src/main/java/com/carrental/storage/DocumentImageFormat.java
?? src/main/java/com/carrental/storage/DocumentImageInspector.java
?? src/main/java/com/carrental/storage/ImageStructureValidator.java
?? src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java
?? src/main/java/com/carrental/storage/PrivateDocumentFile.java
?? src/main/java/com/carrental/storage/PrivateDocumentReceipt.java
?? src/main/java/com/carrental/storage/PrivateDocumentStorage.java
?? src/main/java/com/carrental/storage/StorageRootPolicy.java
?? src/main/java/com/carrental/storage/UploadedDocumentImage.java
?? src/main/java/com/carrental/validation/PasswordPolicyValidator.java
?? src/main/java/com/carrental/validation/ValidPassword.java
?? src/main/java/com/carrental/web/RequestTraceFilter.java
?? src/main/java/com/carrental/web/UserDocumentMultipartReader.java
?? src/main/resources/application.properties
?? src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql
?? src/test/java/com/carrental/AuthSecurityPostgresIT.java
?? src/test/java/com/carrental/AuthSecurityTestFixtures.java
?? src/test/java/com/carrental/BankAccountPostgresIT.java
?? src/test/java/com/carrental/CustomerManagementPostgresIT.java
?? src/test/java/com/carrental/CustomerPropertiesTest.java
?? src/test/java/com/carrental/DriverConcurrencyPostgresIT.java
?? src/test/java/com/carrental/DriverEligibilityPolicyTest.java
?? src/test/java/com/carrental/DriverProfilePostgresIT.java
?? src/test/java/com/carrental/Function1ExecutableJarSmokeIT.java
?? src/test/java/com/carrental/Function1OpenApiContractTest.java
?? src/test/java/com/carrental/Function1PostgresIT.java
?? src/test/java/com/carrental/Function1WorkflowPostgresIT.java
?? src/test/java/com/carrental/JwtConfigurationTest.java
?? src/test/java/com/carrental/KycPolicyTest.java
?? src/test/java/com/carrental/MutableTestClock.java
?? src/test/java/com/carrental/PlatformHttpTest.java
?? src/test/java/com/carrental/PlatformTestFixtures.java
?? src/test/java/com/carrental/PrivateDocumentStorageTest.java
?? src/test/java/com/carrental/repository/CustomerStatusLockTest.java
?? src/test/java/com/carrental/storage/StorageRootBootJarIT.java
?? src/test/java/com/carrental/storage/StorageRootBootJarProbe.java
?? src/test/java/com/carrental/storage/StorageRootJarProbe.java
?? src/test/java/com/carrental/storage/StorageRootPolicyTest.java
?? src/test/java/com/carrental/TestJwtKeys.java
?? src/test/java/com/carrental/UserDocumentPostgresIT.java
?? src/test/java/com/carrental/UserDocumentReviewPostgresIT.java
?? src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java
?? src/test/java/com/carrental/VoucherAdminPostgresIT.java
```
