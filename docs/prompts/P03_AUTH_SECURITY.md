# PROMPT P03 — Đăng ký, đăng nhập JWT, Security và CORS

Bạn là Agent code tiếp tục SBA301 RentCar tại `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh **BE**. Đọc và thực hiện toàn bộ prompt, tạo báo cáo rồi dừng để người dùng gửi review.

P01 và P02 đã APPROVED; xem `docs/reviews/P01_FIX_01_REVIEW.md`, `docs/reviews/P02_REVIEW.md`. P02 có 13 HTTP tests và 7 PostgreSQL IT đã được reviewer chạy lại. Đây là đầu vào được giữ, không phải lý do bỏ kiểm tra khi thêm Security.

## 1. Phạm vi và nguyên tắc

Chỉ Function 1, theo schema leader. P03 đạt luồng:

**Đăng ký CUSTOMER → đăng nhập bằng email/password → nhận JWT → GET hồ sơ của mình → dùng role/status hiện tại từ DB để quyết định quyền.**

Thực hiện 9 bước dưới đây. Đầu ra chính:

- AuthService/interface/implementation, register/login DTO/controller.
- PasswordEncoder và cơ chế xác thực username/password chuẩn Spring Security.
- JwtEncoder/JwtDecoder, cấu hình signing keys ngoài JAR, validators và CurrentAccount bất biến.
- SecurityFilterChain stateless, method security, CORS và JSON 401/403 với trace nhất quán.
- GET /api/customers/me bằng CustomerService/interface, chỉ use case đọc.
- Bootstrap admin từ cấu hình explicit, disabled mặc định, idempotent và không thăng quyền account có sẵn.
- Kiểm tra JWT/Security/registration thật với PostgreSQL và cập nhật tài liệu.

Không thêm refresh token, OTP/email verification, social login, logout/revocation, reset/đổi password, CRUD role, resource server discovery/authorization server mới hoặc migration. Chưa làm PATCH hồ sơ/admin account management, giấy tờ/KYC/driver/bank/voucher nghiệp vụ và function khác. Không viết endpoint admin giả vào production chỉ để kiểm tra quyền.

Giữ customers, CUSTOMER/ADMIN và entity/repository P02. Không thêm password plaintext vào entity/DB. Không yêu cầu emailVerified=true hay KYC VERIFIED để login vì các luồng xác minh đó chưa được giao.

Đọc AGENTS.md, IMPLEMENTATION_STATUS, docs/01–03, docs/05, docs/07, docs/09 và code hiện tại trước khi sửa. Kiểm tra branch/status; bảo toàn untracked files. Không stage/commit/push, chuyển branch, reset/clean, chỉnh docs/reference, Flyway history hoặc database chung. Chỉ chạy test/local probes trên DB cô lập.

## 2. Bước 1 — Dependency, cấu hình và signing keys

Giữ Java 21/Boot 4.0.8 và BOM. Thêm `spring-boot-starter-security`, `spring-boot-starter-security-oauth2-resource-server`, hỗ trợ security test phù hợp Boot 4. Kiểm tra jose/JwtEncoder/JwtDecoder thực có trong dependency tree. Không override Spring Security/Nimbus tùy tiện hoặc dùng JJWT song song với hỗ trợ Spring đã chọn.

Baseline kỹ thuật P03: **RS256**, signing private/public RSA keypair từ cấu hình ngoài JAR. Không sinh signing key mới tự động mỗi lần app startup, dùng key mặc định trong Java, commit key hoặc tải key từ URL do request cung cấp. Không cần một dịch vụ OAuth authorization server để phát token nội bộ.

Tạo ConfigurationProperties có tên/validation rõ cho:

- JWT issuer, audience, access-token TTL, clock skew, private/public key location.
- Password policy và BCrypt strength.
- CORS origins/methods/headers/exposed headers.
- Bootstrap-admin enabled và dữ liệu bootstrap khi bật.

issuer/audience/TTL/keys phải có giá trị hợp lệ ở runtime; thiếu/sai thì fail startup có message an toàn, không fallback sang xác thực yếu. TTL ít nhất 1 giây và nguyên giây để khớp precision JWT/expiresIn; skew >=0. Không đặt TTL trong method Java. Dùng Instant từ Clock của app cho JWT; audit LocalDateTime VN của DB giữ nguyên.

Example ngoài classpath dùng placeholder môi trường, không chứa secret. Có thể ghi giá trị mẫu dev như TTL PT30M/skew PT30S và BCrypt strength10/minLength8 dưới dạng lựa chọn kỹ thuật cấu hình được; không gọi đó là giá trị production người dùng đã chốt. Origin FE thật chưa được cung cấp: để whitelist cấu hình, list trống từ chối cross-origin thay vì tự mở tất cả domain.

Key files đặt ngoài src/main/resources, ví dụ config/keys/ với Git ignore. Dùng định dạng PEM/PKCS8/SPKI được tài liệu hóa; kiểm tra RSA keypair khớp nhau và đủ kích thước theo lựa chọn RS256 (ít nhất 2048 bit). Có thể tạo utility/script dev sinh cặp key mới khi người dùng chạy tường minh; không overwrite key có sẵn hoặc in nội dung key. Test dùng key tạm, không dùng key/credential thật của máy.

Giữ R1: application-local.properties không vào JAR. Kiểm tra thêm private signing key và bootstrap secret không được đưa vào source/resources/artifact. Cấu hình validation và lỗi khởi động không được in raw bootstrap password/key content.

## 3. Bước 2 — DTO, chuẩn hóa và PasswordEncoder

Request:

- RegisterRequest: fullName, email, phone, password.
- LoginRequest: email, password.

Response:

- CustomerProfileResponse: id, fullName, email, phone, dateOfBirth, address, avatarUrl, emailVerified, kycStatus, role, status, createdAt, updatedAt — dùng cho register và me của chính account.
- TokenResponse: accessToken, tokenType=Bearer, expiresIn (giây), account tối thiểu (id/fullName/role). Không có refreshToken hoặc passwordHash.

DTO ở request/response packages riêng, controller không bind entity. Không log DTO chứa password/token; nếu dùng record, kiểm soát toString thay vì để nó trở thành đường log secret.

Chuẩn hóa email trim + lower(Locale.ROOT) nhất quán trước validation/save/lookup. FullName và phone trim; fullName không blank/max150, email hợp lệ/max150, phone không blank/max20 và giữ String. Không đoán regex/số quốc gia hoặc đổi 0 thành +84; Q-08 về định dạng phone vẫn chưa có căn cứ thêm luật mới.

Không trim/lower/normalize password. Policy có cấu hình, thông báo an toàn không nội suy input. Baseline PasswordEncoder dùng BCrypt có salt qua DelegatingPasswordEncoder (id bcrypt); không cho NoOp/plaintext fallback. Validate giới hạn byte UTF-8 của BCrypt để không truncate hoặc biến input quá dài thành 500, kể cả chuỗi Unicode. Mật khẩu chứa khoảng trắng đầu/cuối phải được đối chiếu đúng nguyên văn.

Password hash phải vừa VARCHAR255, chỉ lưu kết quả encoder. Password/confirmPassword không thành field entity. Không tự chuyển/reset password_hash đang có ở DB leader; format không được hỗ trợ phải bị từ chối an toàn, không được coi là plaintext hợp lệ.

Các field role/status/KYC/emailVerified/id/audit/customerId không thuộc auth request. Chọn và tài liệu hóa hành vi unknown fields: khuyến nghị reject400 ở auth DTO; nếu giữ khả năng ignore của mapper hiện tại thì phải chứng minh mọi giá trị server vẫn đúng. Không đổi mapper toàn dự án chỉ để vượt test và không cho field lạ tác động entity.

## 4. Bước 3 — Register trong transaction và chống trùng

AuthController POST /api/auth/register → AuthService.register, response 201 + ApiResponse<CustomerProfileResponse>. Không tự phát JWT khi register; user login qua endpoint riêng.

Service implementation dùng constructor injection và Transactional. Thứ tự:

1. Nhận input đã validate/chuẩn hóa, encode password.
2. Tạo Customer với các field allowlist.
3. Server ấn định CUSTOMER, ACTIVE, NONE, emailVerified=false.
4. Save và flush trong transaction để lấy ID/audit và phát hiện constraint trước khi trả response.
5. Map DTO khi còn transaction; không trả entity hoặc association.

DB UNIQUE là chốt chống hai request đồng thời, pre-check nếu có chỉ để cải thiện lỗi. Nhận diện đúng SQLState23505 và constraint email/phone (uq_customers_email_lower và constraint phone thực tế trong DB). Chỉ các xung đột đó trả 409 ACCOUNT_ALREADY_EXISTS với message chung an toàn; không đổi mọi DataIntegrityViolationException thành trùng account.

Khi constraint fail, ném AppException giữ cause và rollback. Không query tiếp trong transaction PostgreSQL đã abort, catch rồi return success/null hoặc tạo token/account nửa vời.

Log use case/trace và mã lỗi an toàn. PostgreSQL constraint message có thể chứa email/phone đầu vào: không log nguyên message/Throwable chain cho lỗi dữ liệu nhạy cảm. Vẫn giữ cause trong exception nội bộ để chẩn đoán có kiểm soát; log class/SQLState/constraint đã allowlist thay cho PII. Lỗi hạ tầng khác trả INTERNAL_ERROR hoặc dependency code có chủ đích, không giả thành 409/401.

## 5. Bước 4 — Login và phát JWT

POST /api/auth/login public → AuthService.login → AuthenticationManager/DaoAuthenticationProvider, UserDetailsService và PasswordEncoder. Dùng API thật của Spring Security do BOM quản lý; không tự so sánh chuỗi hash hoặc parse JWT thủ công.

Login bằng email chuẩn hóa. Sai password, email không tồn tại hoặc account LOCKED đều trả cùng HTTP401 AUTHENTICATION_FAILED/message chung. Không phân biệt account tồn tại/khóa trong response. Dùng cơ chế chuẩn của provider cho trường hợp user không tồn tại, không tạo đường xác thực giả để chạy test.

Khi thành công, tạo JWT qua JwtEncoder với:

- alg RS256, không thuật toán lấy từ request.
- sub là customer ID dạng chuỗi số dương, không email hoặc role.
- iss, aud đúng cấu hình; iat/exp là Instant từ Clock và TTL.
- Nếu thêm role claim để hiển thị thì chỉ là snapshot; quyền request phải đọc DB như bước 5. Không nhét passwordHash/phone/giấy tờ/ngân hàng vào claims.

TokenResponse.expiresIn là số giây từ cấu hình thực sự dùng; không nhầm milliseconds hoặc dùng số cố định khác exp-iat. Trả Cache-Control:no-store cho register/login/me; không log hoặc đưa bearer token thật vào báo cáo Markdown.

JwtDecoder dùng public key nội bộ đã cấu hình, không discovery theo issuer-uri trỏ tới một authorization server không tồn tại. Validators phải kiểm tra chữ ký/whitelist RS256, issuer, audience, exp/nbf với skew rõ. Bắt buộc sub/iss/aud/iat/exp hợp lệ, exp>iat; xử lý subject không parse được/overflow, missing claims và iat ở tương lai vượt skew an toàn. Không mặc định mọi claim đều bắt buộc chỉ vì đã dùng validator thời gian mặc định.

Một token không được tin chỉ vì decode được payload. Token ký key khác, alg none/thuật toán khác, token sửa payload và các claim sai phải bị từ chối.

## 6. Bước 5 — CurrentAccount và quyền theo DB tại mỗi request

Tạo CurrentAccount bất biến chứa customerId và Role, không JPA entity/password. Sau khi decoder xác minh JWT, converter/provider phù hợp đọc account hiện tại từ CustomerRepository:

- Không có account hoặc status LOCKED → từ chối xác thực401.
- Account ACTIVE → authorities từ role hiện tại trong DB, ROLE_CUSTOMER hoặc ROLE_ADMIN.
- Role claim/scope do token mang không được tự cấp ADMIN.

Không dùng cache role/status dài hạn trong baseline. Khóa account/đổi role có hiệu lực ở request xác thực kế tiếp với token cũ còn hạn. Đây không phải hệ thống logout/token revocation; không thêm token table/blacklist.

Giữ giao diện principal để controller lấy bằng AuthenticationPrincipal hoặc resolver rõ; không nhận customerId của client để chọn account. Đừng convert một token đã xác minh thành Authentication của người khác chỉ từ role claim.

SecurityFilterChain:

- Stateless; tắt formLogin/httpBasic/session login. CSRF disable có lý do là bearer-header API không dùng cookie xác thực tự gửi.
- Public theo method/path chính xác: GET /api/health, POST /api/auth/register, POST /api/auth/login; CORS preflight hợp lệ được xử lý trước auth.
- Mọi request còn lại cần authentication; không permitAll /api/** hoặc bỏ qua toàn bộ filter chain cho public API.
- Bật EnableMethodSecurity; controller/use case nhạy cảm dùng PreAuthorize. CUSTOMER/ADMIN đều được đọc me; method ADMIN test chỉ đặt trong src/test đến khi P04 có API thật.

Tạo CustomerController GET /api/customers/me và CustomerService/CustomerServiceImpl chỉ cho use case read này. Lấy ID từ CurrentAccount, đọc/map profile của chính mình, không serialize Customer. Chưa tạo PATCH/status/list/admin account APIs.

## 7. Bước 6 — Lỗi Security, trace và CORS

Mở rộng ErrorCode tối thiểu: AUTHENTICATION_FAILED401, INVALID_TOKEN401, ACCESS_DENIED403, ACCOUNT_ALREADY_EXISTS409. Giữ code/status/message nền tảng P01.

Login sai và protected request thiếu bearer dùng AUTHENTICATION_FAILED; bearer có mặt nhưng sai/không còn được phép xác thực dùng INVALID_TOKEN; đã xác thực thiếu role dùng ACCESS_DENIED; email/phone registration trùng dùng ACCOUNT_ALREADY_EXISTS. Tài liệu và test phải khớp mapping này.

AuthenticationEntryPoint và AccessDeniedHandler phải trả JSON ApiResponse với success=false/data=null/errors=[], traceId và header khớp nhau. Dùng JSON mapper tương thích Boot 4/MVC hiện tại, không tạo mapper mặc định khác rồi cho ra hợp đồng riêng. Không HTML login redirect, raw token, exception diagnostic hoặc SQL trong response. Giữ WWW-Authenticate phù hợp Bearer khi áp dụng.

GlobalExceptionHandler hiện có catch Exception: bổ sung handling cụ thể cho AuthenticationException/AccessDeniedException trong MVC/method security để không đổi 401/403 thành500. Handler filter và handler MVC dùng cùng cách tạo response, tránh hai format khác nhau.

Lỗi hạ tầng DB trong converter/filter trước controller phải được xử lý ở boundary phù hợp: response500/503 an toàn cùng trace, không bị gọi là token sai401. Không throw AppException từ filter rồi mặc định ControllerAdvice sẽ bắt; không catch mọi Exception thành INVALID_TOKEN. Kiểm tra ca repository lookup lỗi hạ tầng bằng fixture có chủ đích, giữ kiểm tra DB thật cho luồng thông thường.

RequestTraceFilter hiện mặc định thứ tự thấp. Khi thêm Security, bảo đảm filter trace chạy **trước** Spring Security/CORS rejection để cả request bị chặn vẫn có UUID và MDC. Chỉ đăng ký filter một lần; tránh vừa component auto-registration vừa thêm vào SecurityFilterChain gây chạy hai nơi. Dọn MDC trong finally cho success/401/403/exception. Không dùng traceId client gửi làm server ID.

CORS cấu hình theo môi trường:

- Exact origin whitelist (scheme/host/port), không wildcard hoặc null origin mở rộng.
- Method/header allowlist đủ cho API bearer; expose X-Request-ID cho browser.
- allowCredentials=false theo transport không cookie; không thêm cookie auth.
- Preflight origin hợp lệ hoạt động khi chưa có token; origin khác không có allow-origin. CORS không thay authentication.
- Origin hợp lệ gọi endpoint thiếu token vẫn nhận401 JSON cùng CORS headers để FE đọc được lỗi.
- Ghi rõ status/body khi framework từ chối origin; không tuyên bố một CORS denial là account authorization. Lỗi authentication/authorization401403 vẫn phải đúng envelope.

Không xử lý vấn đề CORS bằng mở all origins hoặc disable Security trong runtime.

## 8. Bước 7 — Bootstrap admin được kiểm soát

Tạo runner/service bootstrap từ cấu hình, **disabled mặc định**, không HTTP endpoint. Khi bật, cần fullName/email/phone/password hợp lệ, dùng cùng normalization/encoder, tạo ADMIN/ACTIVE/KYC NONE/emailVerified=false trong customers. Không seed admin/mật khẩu cố định vào migration hoặc test resources production.

Quy tắc:

- Account chưa tồn tại và không trùng phone: tạo một ADMIN.
- Account đã tồn tại đúng email và đã là ADMIN ACTIVE: lần chạy sau không tạo thêm, không đổi password/profile/role.
- Email đã là CUSTOMER, admin LOCKED hoặc phone xung đột: fail an toàn; không tự promote/unlock/reset password để làm startup thành công.
- Enabled=false không yêu cầu các field credential đầy đủ và không thực hiện bootstrap/tạo admin.

Runner gọi public transaction method qua bean khác, tránh self-invocation giả Transactional. Tạo/mapping lỗi giữ atomicity và xử lý race rõ, không nuốt DB lỗi. Thiếu config bootstrap khi bật thì fail với message không chứa password. Không gọi read_only false writer lên DB chung ở lượt P03; kiểm tra bootstrap trên DB test.

Cách bootstrap này là baseline kỹ thuật; chính sách admin tự khóa/tự duyệt/bảo vệ admin cuối cùng vẫn thuộc P04/P06 khi có endpoint, không tự thêm luật đó vào register.

## 9. Bước 8 — Kiểm tra có ý nghĩa với PostgreSQL và JWT thật

Tiếp tục Testcontainers/PostgreSQL15.13, Flyway local baseline, ddl-auto=validate; không dùng database chung. Test keys sinh tạm và dọn đúng tài nguyên test. Sử dụng production encoder/decoder/validators/filter chain, không chỉ MockJwt/WithMockUser để tuyên bố JWT đã đúng.

Có thể thêm AuthSecurityPostgresIT và fixture ADMIN endpoint trong src/test; Spring context/container/key lifecycle phải phù hợp cache của test framework. P01 HTTP suite có thể đổi thành web slice/import rõ để không load các bean auth/DB/key; giải thích điều chỉnh. Không tắt Security ở mọi integration test để giữ các test cũ qua.

| Nhóm | Các ca cần chứng minh |
|---|---|
| Config/keys | Thiếu key/config hoặc keypair không khớp không startup với auth yếu; test key tạm đủ cho encode/decode thật; app không tạo lại key ngầm và artifact không chứa private key |
| Registration | 201/envelope, normalized email, audit, defaults CUSTOMER/ACTIVE/NONE/false; DB chỉ có hash và encoder.matches đúng; input invalid/Unicode password quá byte-limit nhận400 safe |
| Mass assignment | Gửi role=ADMIN/status/KYC/emailVerified/id/audit không thay server defaults; hành vi reject/ignore khớp docs |
| Conflict/race | Email khác hoa thường hoặc phone trùng409; hai HTTP request đăng ký đồng thời cùng normalized email chỉ có một201/một409 và đúng một row, không500/account nửa vời |
| Login | Login đúng nhận token, sub/iss/aud/iat/exp/TTL đúng; password có space giữ nguyên; sai password/email không có/LOCKED trả401 cùng message; không chặn chỉ vì emailVerified=false |
| JWT invalid | Token giả chữ ký, sửa payload, alg khác/none, expired, nbf tương lai, issuer/audience sai hoặc thiếu, thiếu exp/iat/sub, sub sai/overflow đều401; dùng Clock/skew xác định, không sleep đợi token hết hạn |
| DB current state | Token cũ bị401 sau khi DB LOCKED/xóa fixture account; token mang role ADMIN nhưng DB CUSTOMER vẫn403 trên admin fixture; đổi DB ADMIN→CUSTOMER làm token cũ mất quyền ở request kế tiếp |
| Role/method security | Không token401; CUSTOMER gọi fixture ADMIN403; ADMIN hợp lệ200; me không nhận ID chọn owner khác; role đúng từ principal và không trả passwordHash/association |
| Error/trace/log | Filter401, filter403 và method-security403 có envelope/header trace đúng; lỗi DB lookup trước controller trả500/503 an toàn; MDC dọn; unknown/malformed input không phản chiếu password/token; log markers không lộ input nhạy cảm hoặc DB constraint value |
| CORS | Preflight origin cho phép trước auth; origin khác bị từ chối/không ACAO; expose trace; origin cho phép + không token trả401 có CORS headers; non-browser request vẫn phải có JWT ở endpoint protected |
| Bootstrap | Disabled không tạo admin; enabled tạo đúng hash/ADMIN; chạy lại không đổi password/tăng row; CUSTOMER cùng email và trùng phone không được promote; không tự unlock admin |
| Regression | 13 hành vi P01 và 7 hành vi persistence P02 tiếp tục được bảo vệ; health thật với app/DB/Security; packaging probe và schema source vẫn nguyên trạng |

Fixture DB có thể thay status/role/xóa account để kiểm tra quyền hiện tại, nhưng chỉ trong DB test, không tạo admin mutation endpoint ở production. Nếu API chưa có admin resource, báo đúng rằng fixture kiểm tra cơ chế method security, chưa có API P04.

Không yêu cầu số lượng test giả định; nhóm ca có thể parameterized. Giữ test concurrency và constraints thực sự chạy; các test input hash/token sử dụng dữ liệu giả. Khi kiểm tra log, bao gồm exception cause vì PII có thể nằm ở SQLException chứ không chỉ formatted message.

Chạy tối thiểu:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

Bổ sung kiểm tra signing key không vào JAR với fixture giả/bản sao cô lập nếu thêm build rule/script. Probe runtime sử dụng DB/key tạm và không in accessToken/password. Không chạy migration/runner lên DB chung để kiểm tra P03.

## 10. Bước 9 — Tài liệu, báo cáo và điểm dừng

Tạo `docs/10_AUTH_SECURITY.md` gồm API contracts/status/error, principal/role lookup, JWT algorithms/required claims/TTL/skew, normalization/password policy, CORS, cách provision dev keys/bootstrap, config bắt buộc và ranh giới chưa thực hiện. Ghi rõ giá trị dev/technical baseline khác config production do nhóm cung cấp.

Cập nhật docs/03_FUNCTION_1_API.md theo API thực có, docs/02 và docs/07 khi quyết định kỹ thuật cụ thể; LOCAL_DEVELOPMENT/example cho local run; README/AGENTS/status/roadmap. Giữ review/report/reference lịch sử nguyên trạng. Không đánh dấu policy KYC hoặc admin cuối cùng đã được người dùng chốt.

Tạo `docs/reports/P03_REPORT.md` sau triển khai:

1. File mới/sửa và vai trò, danh sách untracked; branch BE và HEAD/status thực tế.
2. Luồng register/login/me, normalization và unknown fields; schema vẫn theo leader, không migration mới.
3. Cấu hình keys/claims/TTL/encoder/CORS/bootstrap thực sự dùng; secret/token phải redact.
4. Lệnh thật, số unit/web/PostgreSQL/security tests riêng, failures/errors/skips, đường dẫn reports; phân biệt packaging skip-tests.
5. Bằng chứng race, invalid JWT, current role/status,401403trace,CORS và bootstrap; hạn chế nào còn thật.
6. JSON register/me/login đã che dữ liệu nhạy cảm, login accessToken thay bằng <redacted>; JSON401403409 có trace minh họa. Không dán token còn dùng được vào báo cáo.
7. Xác nhận health thật và nguồn schema/config packaging; không claim health chứng minh mọi quyền đúng.

Chỉ READY_FOR_REVIEW khi các kiểm tra bắt buộc đạt. Chưa đạt thì ghi phần thiếu và tiếp tục sửa trong phạm vi; không tự APPROVED hoặc triển khai P04. Không commit/push/deploy. Dừng sau báo cáo để user gửi review.

## 11. Nguồn framework chính thức

- [Boot 4.0 managed dependency coordinates](https://docs.spring.io/spring-boot/4.0/appendix/dependency-versions/coordinates.html): module Security/OAuth2/test do BOM quản lý.
- [Spring Security 7.0 JWT](https://docs.spring.io/spring-security/reference/7.0/servlet/oauth2/resource-server/jwt.html): decoder và converter; cấu hình audience/issuer có chủ đích.
- [DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/7.0/servlet/authentication/passwords/dao-authentication-provider.html): xác thực qua UserDetailsService/PasswordEncoder.
- [Password storage](https://docs.spring.io/spring-security/reference/7.0/features/authentication/password-storage.html): encoder và định dạng hash.
- [Method security](https://docs.spring.io/spring-security/reference/7.0/servlet/authorization/method-security.html), [CORS](https://docs.spring.io/spring-security/reference/7.0/servlet/integrations/cors.html): bảo vệ method và tích hợp CORS.

Nguồn framework không quyết định bảng/role/nghiệp vụ của nhóm; những phần đó vẫn theo người dùng và leader.
