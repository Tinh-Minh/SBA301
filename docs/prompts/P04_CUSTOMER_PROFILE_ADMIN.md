# PROMPT P04 — Hồ sơ cá nhân và quản trị trạng thái tài khoản

Bạn là Agent code thực hiện P04 tại `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh **BE**. Đọc toàn bộ prompt, triển khai, kiểm tra, viết báo cáo rồi dừng để người dùng gửi review. **Chỉ làm P04, không tự chuyển P05.**

## 1. Đầu vào, phạm vi và quyết định đã xác nhận

P01/P02/P03 đã APPROVED. Đọc [review P03-FIX-01](../reviews/P03_FIX_01_REVIEW.md); đầu vào hiện có **38 test đạt** và packaging probe PASS. Giữ các regression này khi thêm P04.

P04 thêm bốn use case vào tài nguyên customers:

1. Account ACTIVE cập nhật hồ sơ của chính mình.
2. ADMIN ACTIVE xem danh sách tài khoản có filter/page/sort.
3. ADMIN ACTIVE xem detail tài khoản.
4. ADMIN ACTIVE khóa/mở tài khoản qua command riêng.

**Người dùng đã xác nhận ngày 2026-10-13:** cấm admin tự khóa và cấm khóa admin ACTIVE cuối cùng. ADMIN được quản lý status của CUSTOMER và ADMIN khác theo guard này. Đây là policy P04 đã chốt; không suy rộng thành policy tự duyệt giấy tờ P06.

Giữ nguyên schema leader, customers và hai role CUSTOMER/ADMIN. Chỉ thêm code phục vụ P04; không sửa bảng/cột/index/trigger/Flyway baseline, không thêm @Version hoặc bảng audit. Không thêm quyền OWNER/STAFF, đổi role/email/phone/password/avatar, email verification, refresh/revocation, xóa account hay use case giấy tờ/KYC/driver/bank/voucher. Những phần đó nằm ở prompt khác hoặc ngoài phạm vi được giao.

Không stage/commit/push, đổi branch, stash/reset/clean hoặc chạy SQL lên database chung/Supabase. Không sửa `docs/reference/` hay báo cáo/review lịch sử. Không đọc credential/key thật để đưa vào output; tests dùng DB/key tạm.

## 2. Bước 1 — Kiểm tra workspace và đọc code trước khi sửa

Đọc AGENTS.md, IMPLEMENTATION_STATUS, docs/01–03, docs/05, docs/07, docs/09, docs/10 và review P03-FIX-01. Kiểm tra Git branch/HEAD/status. Các file hiện chưa được theo dõi trong Git; `git diff` rỗng không chứng minh workspace sạch. Bảo toàn toàn bộ file đang có.

Đọc tối thiểu CustomerController, CustomerService/Impl, CustomerRepository, Customer và base audit, CustomerProfileResponse, AuthServiceImpl, CurrentAccount/converter, SecurityConfiguration, CorsProperties, ErrorCode/GlobalExceptionHandler và tests hiện tại. Project dùng Java 21, Boot 4.0.8, Hibernate 7.2, Jackson 3 `tools.jackson.*`; không sao chép ví dụ Jackson 2 không tương thích hoặc override BOM để giải quyết một lỗi import.

Trước code, lập checklist phạm vi/endpoint/DTO/queries/transaction/tests. Không chỉ tạo class trống để báo hoàn thành. Các lựa chọn dưới đây là hợp đồng của lượt P04; nếu có trở ngại kỹ thuật thật, giải thích và xử lý phần độc lập, không thay đổi nghiệp vụ âm thầm.

## 3. Bước 2 — Chốt hợp đồng HTTP và DTO riêng

### 3.1. Endpoint

Tất cả method nằm trong **CustomerController** theo tài nguyên. Mở rộng **CustomerService** và **CustomerServiceImpl**; không tách AdminCustomerController hoặc tạo service CRUD chỉ để nhân đôi cùng tài nguyên.

| Method / endpoint | Quyền | Input | Success |
|---|---|---|---|
| `GET /api/customers/me` | ACTIVE CUSTOMER/ADMIN | CurrentAccount | Giữ hợp đồng P03: profile của mình |
| `PATCH /api/customers/me` | ACTIVE CUSTOMER/ADMIN | UpdateProfileRequest | 200 ApiResponse<CustomerProfileResponse> |
| `GET /api/customers` | ACTIVE ADMIN | query filter/page/sort | 200 ApiResponse<PageResponse<CustomerSummaryResponse>> |
| `GET /api/customers/{id}` | ACTIVE ADMIN | positive Long path ID | 200 ApiResponse<CustomerAdminResponse> |
| `PATCH /api/customers/{id}/status` | ACTIVE ADMIN | ChangeCustomerStatusRequest | 200 ApiResponse<CustomerAdminResponse> |

ID của `/me` luôn từ authentication; không nhận customerId/ownerId ở body/query để chọn người khác. ADMIN cập nhật hồ sơ của mình qua `/me`, không có API admin sửa hồ sơ cá nhân người khác trong P04. ADMIN list/detail xem được cả tài khoản ACTIVE và LOCKED; filter là tùy chọn.

Giữ response envelope và PageResponse hiện có (`content`, `page`, `size`, `totalElements`, `totalPages`), UUID trace body khớp X-Request-ID, Cache-Control: no-store cho mọi response thành công chứa account. Không trả entity, passwordHash, dữ liệu giấy tờ/ngân hàng hoặc associations.

### 3.2. UpdateProfileRequest và PATCH thực sự

Allowlist duy nhất: `fullName`, `dateOfBirth`, `address`. Phải phân biệt **field không có trong JSON** với **field có giá trị null**:

| Field | Không có | Có null | Có giá trị |
|---|---|---|---|
| fullName | Giữ nguyên | 400 VALIDATION_ERROR | Trim; bắt buộc không blank, tối đa 150 theo schema |
| dateOfBirth | Giữ nguyên | Xóa về NULL | ISO LocalDate, không sau ngày hiện tại từ Clock VN |
| address | Giữ nguyên | Xóa về NULL | Trim, tối đa 300; chuỗi rỗng sau trim chuẩn hóa NULL |

Không dùng DTO mọi field mặc định null rồi ghi đè cả ba field, Optional đơn thuần làm mất presence, hoặc copy properties từ request vào entity. Có thể dùng DTO với presence flags và setter typed phù hợp Jackson 3; lựa chọn phải được kiểm chứng bằng HTTP tests. Không thêm dependency PATCH chuyên biệt nếu code nhỏ hiện tại đủ giải quyết.

- `{}` và body JSON `null` trả 400 INVALID_REQUEST; không âm thầm coi là một lần cập nhật thành công.
- JSON top-level array, field sai kiểu, date sai định dạng hoặc JSON hỏng trả 400 an toàn. `fullName:123`, `address:true`, object/array thay scalar phải bị từ chối; kiểm chứng hành vi Jackson coercion thực tế. Nếu phải đổi coercion, giới hạn ở request P04 và giữ regression auth.
- Property ngoài allowlist trả 400 INVALID_REQUEST, kể cả `id`, `customerId`, `email`, `phone`, `password`, `passwordHash`, `role`, `status`, `kycStatus`, `emailVerified`, `avatarUrl`, audit fields; không bỏ qua âm thầm.
- Repeated property trong cùng JSON phải bị từ chối thay vì phụ thuộc thứ tự/last value; test ít nhất duplicate `fullName` hoặc `status`. Nếu cấu hình parser strict dùng chung, chạy lại các kiểm tra đã có và ghi rõ ảnh hưởng.
- Validation không phản chiếu giá trị bị từ chối, không log request DTO/body. Không thêm tuổi tối thiểu cho thuê/đăng ký: user chưa giao luật tuổi đó.

Ví dụ chỉ sửa tên; ngày sinh/địa chỉ giữ nguyên:

```json
{"fullName":"Nguyễn Văn An"}
```

Ví dụ xóa hai field nullable; tên giữ nguyên:

```json
{"dateOfBirth":null,"address":null}
```

### 3.3. DTO đầu ra cho ADMIN

- CustomerSummaryResponse: `id`, `fullName`, `email`, `phone`, `role`, `status`, `kycStatus`, `emailVerified`, `createdAt`, `updatedAt`.
- CustomerAdminResponse: các field summary cộng `dateOfBirth`, `address`. Không tự include avatar URL có thể riêng tư hoặc dữ liệu liên quan chưa có quyền đọc P05.
- CustomerProfileResponse giữ đúng hợp đồng hiện tại. Map DTO trong service transaction; có thể tách CustomerMapper nhỏ dùng chung, chuyển helper `AuthServiceImpl.profile` sang mapper nếu cần để service không phụ thuộc implementation của service khác. Không kéo theo refactor auth ngoài việc mapping chung có regression.

### 3.4. ChangeCustomerStatusRequest

Chỉ nhận `status` và `reason`; `status` là CustomerStatus ACTIVE/LOCKED, bắt buộc; `reason` là String, trim, không blank, có giới hạn từ config. Baseline kỹ thuật đề xuất `app.customer.status-reason-max-length=500`, configurable, không phải giới hạn DB hay luật nghiệp vụ đã xác nhận. Cấu hình phải được validate tại startup. Null/field lạ/enum sai/number/object/array/coercion phải trả 400, không tiết lộ reason trong body/log.

Reason cần được kiểm tra ngay cả khi command là no-op để request contract nhất quán. Schema chưa có cột reason; **không lưu reason vào address hoặc bảng action_logs của order**. Log metadata theo mục 6.3, không log nội dung reason tự do. Tài liệu phải nói rõ chưa có lịch sử reason bền vững theo Q-09.

Ví dụ:

```json
{"status":"LOCKED","reason":"Tạm khóa để xử lý yêu cầu quản trị"}
```

## 4. Bước 3 — Danh sách admin: filter, page, sort trong database

Hợp đồng query:

- `status`: CustomerStatus tùy chọn.
- `kycStatus`: KycStatus tùy chọn theo enum/schema hiện có.
- `keyword`: trim, blank tương đương không lọc, tối đa 150 theo cấu trúc trường tìm kiếm; tìm contains không phân biệt hoa thường trên fullName hoặc email. Không tự tìm phone/document/address.
- `page`: 0-based, không âm.
- `size`: mặc định/configurable, số dương và không quá max/configurable. Baseline kỹ thuật mặc định 20, max 100; config validate default <= max, cả hai > 0. **Input vượt max trả 400**, không âm thầm clamp.
- `sort`: đúng một biểu thức `field,direction`; mặc định `createdAt,desc`. Allowlist `id`, `fullName`, `email`, `createdAt`, `updatedAt`, `status`, `kycStatus`; direction asc/desc không phân biệt hoa thường. Reject field/direction/format lạ, nhiều sort hoặc tham số scalar bị lặp. Thêm `id` cùng direction làm tie-breaker nếu primary không phải id.

Mọi filter kết hợp AND, riêng keyword là `(fullName matches OR email matches)`. Thực thi query và count trên PostgreSQL; không findAll rồi stream/filter/page trong Java. Có thể dùng JpaSpecificationExecutor + Specification hoặc repository custom có parameter binding, không nối input thành SQL/JPQL hay dùng entity property bất kỳ do client cung cấp.

Trong contains search, `%`, `_` và ký tự escape của người dùng được hiểu **như ký tự literal**. Escape LIKE đúng một lần và test thật; không coi chuỗi đặc biệt là SQL pattern. Không log keyword vì nó có thể là email/tên. Page vượt trang cuối trả 200 content rỗng nhưng totalElements/count đúng; không tràn offset hoặc allocation khi page cực lớn, input ngoài phạm vi hỗ trợ trả 400 an toàn.

ADMIN được phép query toàn bộ customers; CUSTOMER bị 403 ngay từ authorization trước khi gọi list query. Detail không tồn tại trả 404 RESOURCE_NOT_FOUND cho ADMIN; CUSTOMER gọi bất kỳ ID vẫn 403. Không có endpoint list tự phục vụ cần scope owner trong P04. Quyền của future resources vẫn theo tài liệu riêng.

## 5. Bước 4 — Service hồ sơ và audit chính xác

Controller mỏng: bind/validate, lấy CurrentAccount, gọi service, bọc DTO/envelope/header. Business policy đặt ở service/interface implementation. Các method đọc dùng readOnly transaction, method ghi dùng @Transactional; method security giữ CUSTOMER/ADMIN phù hợp và chỉ ADMIN cho list/detail/status.

PATCH me:

1. Lấy ID từ CurrentAccount; lock row customer trong transaction bằng PESSIMISTIC_WRITE trước đọc/sửa. Không load entity stale trước lock rồi copy/save toàn bộ row.
2. Kiểm tra account còn tồn tại và ACTIVE tại thời điểm ghi; thiếu/LOCKED trả 401 INVALID_TOKEN. Authentication của filter là snapshot trước transaction, không đủ để bỏ check này.
3. Validate và áp dụng đúng field hiện diện, không thay identity/role/status/KYC/email verification/hash/audit hoặc field khác.
4. Flush khi có thay đổi, map DTO sau khi DB trigger/generated updatedAt được nạp. Giữ createdAt, không gán thời gian Java vào audit field. Không refresh/save chồng làm reset audit.
5. Nếu request hợp lệ nhưng giá trị chuẩn hóa không đổi: trả 200 profile hiện tại, không phát sinh UPDATE/audit mutation.

Lock này còn bảo vệ profile PATCH đồng thời với admin status PATCH: Hibernate không được save một snapshot cũ và bật lại LOCKED account, làm mất profile hay ghi đè status/KYC/hash. Kiểm chứng bằng concurrent transactions trên PostgreSQL.

Date validation dùng Clock đang có; test fixed Clock ở ranh giới ngày Việt Nam. Không dùng LocalDate.now() không có clock để quyết định luật. Không gọi service method qua self-invocation rồi nghĩ @Transactional đã chạy.

## 6. Bước 5 — Chuyển status, policy admin và đồng thời

### 6.1. Transition ở service, một nguồn luật

| Hiện tại | Yêu cầu | Hành vi |
|---|---|---|
| ACTIVE | LOCKED | Thực hiện sau authorization/guard |
| LOCKED | ACTIVE | Thực hiện sau authorization/guard |
| ACTIVE | ACTIVE | 200 no-op, không UPDATE/đổi audit hoặc log một lần đổi status mới |
| LOCKED | LOCKED | 200 no-op với cùng yêu cầu quyền/validation |

Kiểm tra qua switch CustomerStatus trong service; enum chỉ giữ mô tả. Không bổ sung DELETED/INACTIVE/PENDING để biểu diễn ý nghĩa mới. Cấm khóa khi target là chính actor ADMIN và cấm làm số ADMIN ACTIVE xuống 0. Status command không thay role, KYC, driver status, documents, bank hay orders.

Error contract mới:

- Tự khóa: 409 `ADMIN_SELF_LOCK_FORBIDDEN`, message an toàn rõ thao tác không được phép.
- Khóa admin ACTIVE cuối cùng: 409 `LAST_ACTIVE_ADMIN_LOCK_FORBIDDEN`.
- Target không tồn tại: 404 RESOURCE_NOT_FOUND sau xác minh actor ADMIN ACTIVE.
- Actor vừa bị LOCKED/xóa: 401 INVALID_TOKEN; actor hiện tại không còn ADMIN: 403 ACCESS_DENIED. Không tin role trong body/token hoặc CurrentAccount cũ cho phép ghi.
- Lock contention/dependency thật: server error phù hợp 503 DEPENDENCY_UNAVAILABLE, không trả 401/409 nghiệp vụ giả. Mapping cụ thể giới hạn đúng exception liên quan, không catch mọi lỗi thành 503.

Giữ error envelope/trace; không trả constraint name/SQL/reason. Self-lock guard ưu tiên trước last-admin guard khi cùng thỏa cả hai. Trường hợp ADMIN ACTIVE duy nhất tự khóa trả self-lock code; không tạo fixture phi thực tế để ép một response last-admin khác với precedence này.

### 6.2. Transaction và protocol lock

**Không chỉ count ACTIVE admins rồi lock mỗi target riêng. Không dùng synchronized/ReentrantLock trong JVM để bảo vệ nhiều instance.** Cần serialization dùng database cho mọi command đổi customer status, giữ từ trước read/guard đến hết commit/rollback.

Baseline triển khai: **PostgreSQL transaction-level advisory lock chung** cho use case status với namespace có nghĩa, ví dụ `sba301:function1:customer-status`. Repository/custom component lấy lock bằng query tham số hóa; key được dẫn xuất deterministic từ namespace hoặc hằng có giải thích, không hard-code danh sách customer IDs. Không dùng session-level lock cần unlock bằng tay và không thêm table/cột để chứa lock. Advisory lock tồn tại trong transaction trên cùng connection và được DB giải phóng khi transaction kết thúc. [PostgreSQL 15 — advisory locks](https://www.postgresql.org/docs/15/explicit-locking.html#ADVISORY-LOCKS).

Sau khi có lock chung:

1. Đọc lại actor từ DB, kiểm tra ACTIVE/ADMIN; không dùng entity đã được cache trước lock. Chỉ thực hiện count/guard sau khi serialization thành công.
2. Lock target row PESSIMISTIC_WRITE và đọc trạng thái hiện tại. Phối hợp thứ tự lock nhất quán với profile; không lấy target row trước rồi chờ advisory lock ở đường status khác.
3. Áp dụng self-lock/last-active-admin guard và transition; no-op không ghi.
4. Flush thay đổi, map DTO từ audit DB; giữ lock đến hết transaction.
5. Ghi log đã đổi status **sau commit thành công**, hoặc log trước commit phải gọi đúng là attempt. Không log thành công cho transaction sau đó rollback. Có thể dùng event/hook nhỏ có trace/actor/target/old/new được capture an toàn; không làm một hệ thống event/audit lớn.

`@Transactional` chỉ rollback đúng nếu exception được ném ra proxy; không nuốt exception hoặc tiếp tục trong transaction đã rollback-only. Cause được giữ trong exception theo conventions nhưng không in cause SQL/DTO thô. Không thêm finally rỗng; DB transaction lock không cần manual unlock.

Mọi writer production giảm số ACTIVE ADMIN hoặc đổi account status phải tuân thủ protocol này; P04 chỉ có command status. Bootstrap P03 không promote/unlock và chỉ thêm ADMIN, giữ hành vi đó. Viết rõ hợp đồng cho teammate; script/SQL quản trị trực tiếp ngoài protocol không được chứng nhận bởi concurrency test của API.

Với hai ADMIN A/B cùng gửi khóa nhau, request thứ hai phải đọc lại actor sau transaction thứ nhất: không được cho một actor đã LOCKED khóa nốt người còn lại. Test phải ép cả hai đã qua authentication trước khi race ở service/DB; không chỉ gửi tuần tự rồi gọi là concurrency.

Profile chỉ lock own row, không lấy advisory lock rồi chờ theo thứ tự ngược. Trường hợp profile giữ row, status có thể chờ row; profile hoàn tất mà không cần lock chung nên không tạo vòng chờ. Document protocol và test không bị deadlock. Cấu hình timeout kiểm tra/lock phù hợp từ properties nếu cần, không infinite hang trong test hoặc retry vô hạn.

### 6.3. Log và semantics khóa/mở

Log metadata: action, traceId, actor ID, target ID, oldStatus/newStatus, kết quả; nếu cần reason metadata chỉ `reasonProvided`, không nội dung tự do. Không log email/phone/tên/address/keyword/reason/password/token/hash, request object hoặc SQL exception Detail. Capture trace trong request trước khi event/after-commit chạy; không phụ thuộc MDC sẽ còn tồn tại ở worker sau đó.

Giữ toàn bộ cấu hình R1 của P03-FIX-01; test log bắt message/MDC/throwable/cause/suppressed, có assertion log hữu ích tồn tại và không có marker nhạy cảm. Không tắt mọi logging để tests qua.

Khóa account có hiệu lực với **request kế tiếp** dùng JWT còn hạn và login mới. Request đã chạy trước lúc commit khóa không bị thu hồi tự động; các write P04 đọc lại status trong transaction như trên. Mở lại ACTIVE cho phép token cũ còn hạn dùng lại do P03 kiểm tra trạng thái DB mỗi request; **không tuyên bố unlock đã tạo token mới hoặc revoke token cũ vĩnh viễn**. Refresh/revocation/session-version chưa thuộc scope.

No-op và thao tác rejected không đổi audit/row. Lịch sử status/reason bền vững chưa có; kỹ thuật log không thay một bảng audit nghiệp vụ. Không dùng action_logs của rental_orders để giải quyết Q-09.

## 7. Bước 6 — Security, CORS và lỗi HTTP

Giữ SecurityFilterChain stateless và public allowlist P03. Method security áp dụng ở service; controller không phải nơi duy nhất kiểm tra role. Test gọi service qua Spring proxy cho authorization, không chỉ test HTTP routing.

Hiện CORS chỉ có GET/POST/OPTIONS. Thêm **PATCH** đồng bộ vào CorsProperties defaults, `application.properties` và example/docs liên quan. Giữ exact origins, allowCredentials=false, allowed/exposed headers, không thêm `*`. Preflight cho profile và status PATCH phải chạy trước auth; request PATCH thực tế vẫn cần JWT và đúng quyền. Không mở PUT/DELETE hoặc toàn `/api/customers/**` public.

400/401/403/404/409/415/503 và unexpected500 phải dùng envelope/trace an toàn ở đường API tương ứng. Giữ CORS transport rejection đã ghi ở P03; không nhầm 403 Invalid CORS request với 403 ACCESS_DENIED của một CUSTOMER gọi admin API. Safe field errors chỉ field name/message tĩnh, không rejected value/type diagnostic/raw SQL.

Validate path ID, query enum/int/sort và body presence; lỗi overflow/type binding phải 400 có trace, không 500 hoặc phản chiếu sentinel. Không trả exception message tùy tiện trong ErrorCode. Các request không hợp lệ không thay DB.

## 8. Bước 7 — Kiểm tra bằng PostgreSQL và HTTP thật

Tiếp tục PostgreSQL 15.13 Testcontainers, schema leader baseline/validate và temporary RSA keys. Có thể thêm CustomerManagementPostgresIT hoặc mở rộng suite phù hợp; không chỉ Mockito/InMemory/WithMockUser để tuyên bố transactions/JWT/concurrency đã đúng. Fixtures ADMIN chỉ sinh ở DB test; không tạo endpoint promote/test helper trong production.

Các nhóm cần bằng chứng:

| Nhóm | Ca cần kiểm tra |
|---|---|
| Profile ownership | CUSTOMER và ADMIN sửa `/me` đúng row từ principal; body/query ID không thể chọn row khác; người dùng khác và mọi field ngoài allowlist nguyên trạng |
| PATCH presence | Omitted giữ nguyên; null xóa date/address; null name reject; trim/blank/length limits; `{}`/null/array body/unknown/duplicate fields/date future/type coercion invalid an toàn; ranh giới ngày Clock VN |
| Audit/no-op | createdAt không đổi; updatedAt do DB trigger sau thay đổi đúng response/DB; no-op/rejected giữ audit; thiếu/null một field không reset field khác |
| Admin access | Không bearer401, CUSTOMER403 cho list/detail/status kể cả ID không tồn tại, ADMIN ACTIVE200; LOCKED ADMIN401; DB role là nguồn quyền, forged token role không cấp quyền |
| Filters/pages | status/KYC/keyword AND-OR đúng; case-insensitive contains, LIKE escape literal; count đúng sau filter; stable tie-break; page cuối/trang rỗng/invalid hoặc huge query; sort allowlist và repeated scalar query reject |
| DTO privacy | Tập field summary/detail đúng; không có hash/association/document/bank/URL private; Cache-Control no-store; tất cả API envelope/trace khớp |
| Status lifecycle | ACTIVE→LOCKED→ACTIVE; reason/status invalid hoặc field lạ400; target thiếu404; enum transition qua service; no-op không UPDATE/log change; không thay role/KYC/profile/driver/doc/bank |
| Policy admin | Tự khóa409 đúng code; ADMIN duy nhất tự khóa bị chặn; admin khác khóa/mở được khi phù hợp; luôn còn >=1 ACTIVE ADMIN sau các command hợp lệ |
| Race admin | Hai admin khóa nhau từ hai request đã qua auth: tối đa một thành công, request actor đã khóa bị chặn, count cuối>=1; có transaction barrier/probe thật, bounded await và không mock count/status write |
| Race cùng target | Hai command giống nhau chỉ một lần đổi thật, request sau no-op; audit/log thay đổi phản ánh một mutation. Status và profile cập nhật đồng thời không mất profile/không bật lại LOCKED row |
| Token sau status | Token JWT phát trước khóa bị401 khi GET me/admin tiếp theo và login bị401; mở lại cho phép token cũ còn hạn đúng semantics; không cần sleep chờ TTL |
| Rollback/failure | Failure có chủ đích sau DB mutation nhưng trước commit không để partial change/audit/success log; cause không bị nuốt, không generic401; lock được giải phóng và request tiếp theo chạy được |
| Log/error | Sentinels tên/email/phone/address/reason/keyword/password/hash/JWT không vào body lỗi hoặc log; có safe action/trace log thật; cause/suppressed được kiểm tra; safe503 cho lỗi dependency/lock liên quan |
| CORS | PATCH preflight origin hợp lệ 2xx, allow method/header đúng; customer call admin với allowed origin vẫn403 đọc được; forbidden origin bị từ chối, không wildcard/credentials |
| Regression | Giữ 38 ca P01–P03, full verify; health app/DB thật, packaging probe và hashes reference nguyên trạng |

Fixtures mỗi test cô lập/ID động, không phụ thuộc thứ tự chạy. Parallel tests phải dọn mocks/appender/resources trong finally/try-with-resources và đặt timeout; không tạo deadlock cố ý rồi bỏ thread/container treo. Race không được chỉ dựa vào sleep may rủi, cần latch/barrier ở điểm xác định có ý nghĩa. Giải thích fault injection nào dùng spy/mocks để tạo failure; các read/write/constraint/locks cần kiểm chứng vẫn chạy trên PostgreSQL thật.

Lệnh bắt buộc chạy khi hoàn tất:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

Không yêu cầu một con số test P04 cố định để Agent chạy theo số lượng. Báo suite/test/failure/error/skip thực tế; test skip hoặc Docker không chạy phải báo hạn chế, không ghi PASS toàn bộ. Packaging build riêng có skip tests không thay full verification. Có lỗi thì sửa trong phạm vi rồi chạy lại nhóm bị ảnh hưởng và cuối cùng full verify.

## 9. Bước 8 — Tài liệu, báo cáo và bàn giao review

Sau implementation:

1. Tạo `docs/11_CUSTOMER_PROFILE_ADMIN.md`: endpoint/DTO/page/filter/sort/examples/error codes, null/omitted/no-op semantics, admin policy user đã chốt, protocol lock/audit, CORS, config defaults và log/reason limitation, khóa/mở với token cũ; phân biệt triển khai thật với phần chưa có.
2. Cập nhật docs/03 API, docs/07 quyết định, docs/09 repository, docs/10 phần liên quan CORS/integration, LOCAL_DEVELOPMENT, README/mục lục và AGENTS phù hợp. Giữ source/history gốc. Không tạo link đến file chưa có sau khi hoàn tất.
3. Tạo `docs/reports/P04_REPORT.md` gồm: scope; file thêm/sửa; service/controller/DTO/query thực tế; chính sách/admin race và bằng chứng; commands đã chạy/kết quả từng suite; health/trace; packaging; hashes schema/reference; Git branch/HEAD/status và danh sách untracked; hạn chế thật. Không chỉ ghi “BUILD SUCCESS” hoặc test count.
4. IMPLEMENTATION_STATUS: P04 READY_FOR_REVIEW khi hoàn tất đủ bằng chứng; P01–P03 vẫn APPROVED theo review, P05 chưa bắt đầu. Agent không tự cấp APPROVED P04.
5. Dừng và gửi báo cáo để người dùng mang về review. Không commit/push, chạy SQL chung hoặc chuyển prompt tiếp theo.

Checklist nghiệm thu P04:

- Bốn use case mới chạy thật, ownership/role từ authentication và DB.
- PATCH đúng presence/validation/allowlist, audit DB đúng.
- Admin list query/page/count/sort đúng, DTO không vượt quyền.
- Policy tự khóa/last-active-admin được bảo vệ với transactions/races thật, actor được đọc lại.
- Khóa/mở tác động lên JWT như semantics đã ghi; không tự thêm revoke/schema.
- Error/log/trace/CORS giữ chất lượng P03-FIX-01; regression và packaging đạt.
- Tài liệu/report đủ để reviewer kiểm chứng, P04 READY_FOR_REVIEW và dừng.
