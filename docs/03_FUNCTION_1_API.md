# 03 — Hợp đồng API và phân quyền Function 1

API P01–P09 đã triển khai và APPROVED theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md), R1 CLOSED. Exact decimal ingress/U-19/U-20/U-21/routes/schema giữ. P10 tạo [static OpenAPI 3.1](api/openapi-function1.json) và [canonical source-based handoff](17_FUNCTION_1_HANDOFF.md); P10-FIX-01 đồng bộ request constraints và duplicate-key statements với runtime, regression parity tiếp tục kiểm tra route/DTO/parser/enum/response. `clean verify -Ppostgres-it` 150/150, packaging PASS; P10-FIX-01 READY_FOR_REVIEW, R1/R2 chờ reviewer. Xem [report](reports/P10_FIX_01_REPORT.md).

## Hạ tầng P01

| Method / endpoint | Quyền | Response | Ý nghĩa |
|---|---|---|---|
| `GET /api/health` | Public ở P01 (chưa có Security) | HTTP 200, `ApiResponse<HealthResponse>`, `data.status=UP` | Chỉ xác nhận ứng dụng web đang chạy; không kiểm tra database, authentication hoặc storage |

Mỗi request nhận `X-Request-ID` do server tạo; trường `traceId` trong envelope dùng cùng giá trị. Health là endpoint kỹ thuật, không phải API nghiệp vụ.

Response ví dụ:

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "data": {"status": "UP"},
  "errors": [],
  "traceId": "<giá trị X-Request-ID>"
}
```

## 1. Quy tắc chung

- JSON cho auth/profile/command; multipart cho gửi giấy tờ. Frontend có form không đồng nghĩa backend phải dùng form login của Spring Security.
- Header `Authorization: Bearer <access-token>` cho endpoint cần đăng nhập.
- Principal cung cấp `customerId`; request tự phục vụ không nhận owner/customer ID, role hay audit field.
- Danh sách trả `ApiResponse<PageResponse<T>>`; detail trả `ApiResponse<T>`.
- Trang bắt đầu 0. Giá trị mặc định, giới hạn `size` và sort allowlist lấy từ cấu hình; thêm `id` làm tie-breaker để thứ tự ổn định.
- Query lọc theo quyền trước khi phân trang, kể cả truy vấn `count`; không dùng tổng số bản ghi toàn hệ thống cho trang của một người dùng.
- Tạo thành công: 201 và Location khi có tài nguyên riêng. Login, đọc, cập nhật, command và xóa thành công: 200 với envelope.
- Dữ liệu auth/giấy tờ/ngân hàng không được cache công khai; dùng `Cache-Control: no-store` khi phù hợp.
- Ví dụ field dưới đây là danh sách cho phép; không bind request trực tiếp vào entity.

Envelope đề xuất mở rộng nhất quán từ tài liệu nguồn:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "data": null,
  "errors": [{"field": "email", "message": "Email không hợp lệ"}],
  "traceId": "request-correlation-id"
}
```

Success dùng `success=true`, `code=OK` (hoặc mã thành công được thống nhất), `errors=[]`; `data` là DTO. Page có `content`, `page`, `size`, `totalElements`, `totalPages`. Không đưa stack trace hoặc message SQL trực tiếp ra client. `traceId` do server tạo hoặc kiểm tra trước khi chấp nhận từ upstream.

## 2. Auth và tài khoản

| Method / endpoint | Quyền | Request → response | Quy tắc chính |
|---|---|---|---|
| `POST /api/auth/register` | Public | `RegisterRequest` → `CustomerProfileResponse` | Tạo CUSTOMER; 409 khi trùng email/phone; không tự đăng nhập nếu chưa thống nhất với FE |
| `POST /api/auth/login` | Public | `LoginRequest` → `TokenResponse` | 401 chung cho thông tin xác thực không hợp lệ/không được phép đăng nhập; 503 an toàn khi authentication data source không khả dụng |
| `GET /api/customers/me` | Account ACTIVE | → `CustomerProfileResponse` | ID từ principal |
| `PATCH /api/customers/me` | Account ACTIVE | `UpdateProfileRequest` → profile | Chỉ sửa field trong allowlist, phân biệt bỏ qua field và xóa giá trị nullable |
| `GET /api/customers` | ADMIN | Filter + page → `CustomerSummaryResponse` page | Filter status, KYC, tên/email khi được phép; không trả password/giấy tờ |
| `GET /api/customers/{id}` | ADMIN | → `CustomerAdminResponse` | Chỉ thông tin cần quản lý; giấy tờ qua endpoint có quyền riêng |
| `PATCH /api/customers/{id}/status` | ADMIN | `ChangeCustomerStatusRequest` → admin detail | ACTIVE/LOCKED qua transition; cấm tự khóa và khóa ADMIN ACTIVE cuối cùng theo U-09; log metadata an toàn |

**DTO đầu vào:**

- `RegisterRequest`: `fullName`, `email`, `phone`, `password`. Giới hạn chuỗi khớp DB; password có policy riêng, không log request object.
- `LoginRequest`: `email`, `password`.
- `UpdateProfileRequest`: `fullName`, `dateOfBirth`, `address`. Không cho cập nhật `role`, `status`, `kycStatus`, `emailVerified`, `createdAt`, `updatedAt`. Avatar và thay đổi email/phone cần Q-05/Q-07.
- `ChangeCustomerStatusRequest`: `status`, `reason`. Reason chưa có cột lưu riêng; P04 validate reason nhưng chỉ log metadata thao tác, không nội dung free-text. Nếu cần lịch sử quản trị bền vững, phải có thiết kế audit riêng (Q-09).

**DTO đầu ra:**

- `CustomerProfileResponse`: `id`, `fullName`, `email`, `phone`, `dateOfBirth`, `address`, `avatarUrl`, `emailVerified`, `kycStatus`, `role`, `status`, `createdAt`, `updatedAt` theo đúng quyền của chủ tài khoản.
- `CustomerSummaryResponse`: tập trường tối thiểu cho danh sách admin; không include tài liệu, số ngân hàng hay liên kết nhạy cảm.
- `TokenResponse`: `accessToken`, `tokenType` (`Bearer`), `expiresIn`, thông tin account tối thiểu. Không tự thêm refresh token khi chưa có Q-05.

### Trạng thái thực thi P03

Register/login và GET /api/customers/me đã có implementation trong P03. Auth request chỉ nhận đúng field đã liệt kê; property lạ (kể cả `role`, `status`, `kycStatus`, `emailVerified`, `id` và audit fields) trả 400 `INVALID_REQUEST`. Email được trim + lowercase trước validation/tìm kiếm/lưu; fullName và phone trim, password giữ nguyên khoảng trắng. JWT HS256 có issuer, audience, `sub`, `iat`, `exp`; authority/status luôn lấy từ DB.

`AUTHENTICATION_FAILED` dùng cho login thất bại và protected request thiếu bearer; unsupported/malformed password hash trả cùng lỗi chung như sai password. Lỗi authentication data source/provider là `DEPENDENCY_UNAVAILABLE` 503, không bị đổi thành credentials sai. `INVALID_TOKEN` dùng cho bearer sai/hết hạn hoặc account không còn hoạt động; `ACCESS_DENIED` dùng khi principal đã xác thực nhưng thiếu quyền; `ACCOUNT_ALREADY_EXISTS` dùng cho email/phone trùng. Issuer JWT được so sánh exact như StringOrURI, không ép qua URL getter. CORS origin bị từ chối là lỗi transport của framework: môi trường kiểm tra trả 403 `Invalid CORS request`, không có `Access-Control-Allow-Origin`; đây không phải 403 phân quyền account.

Role/status trong response là thông tin hiển thị; authorization luôn được backend thực hiện.

### Trạng thái thực thi P04 — APPROVED

P04 đã thêm đủ bốn use case: PATCH hồ sơ /me, admin list/detail và PATCH status trong cùng CustomerController/CustomerService. Request profile phân biệt omitted/null, từ chối unknown/duplicate/type coercion và chỉ sửa fullName/dateOfBirth/address. Danh sách dùng filter/page/count PostgreSQL, sort allowlist, escape ký tự LIKE và tie-break ID; DTO summary/detail là allowlist.

P04-FIX-01 xử lý presence-key binding và exact SQLState55P03 advisory timeout. Reviewer chạy lại 57/57 tests/packaging và HTTP probe cũ: input sai 400/row nguyên trạng; timeout thật 503/retry 200. **P04 APPROVED, R1/R2 CLOSED** theo [review](reviews/P04_FIX_01_REVIEW.md); report/review gốc giữ lịch sử.

Policy U-09 được bảo vệ trong transaction: advisory lock chung ở PostgreSQL trước khi đọc lại/lock actor và target; cấm ADMIN tự khóa (409 ADMIN_SELF_LOCK_FORBIDDEN) và cấm đưa số ACTIVE ADMIN về 0 (409 LAST_ACTIVE_ADMIN_LOCK_FORBIDDEN). Thao tác no-op không ghi audit; status reason chỉ được validate và ghi metadata reasonProvided sau commit, không lưu bền vững theo Q-09. PATCH đã thêm vào CORS; lock có hiệu lực ở request kế tiếp, unlock cho phép token cũ còn hạn hoạt động lại theo P03. Chi tiết vận hành, cấu hình và bằng chứng nằm trong [P04 API/operations](11_CUSTOMER_PROFILE_ADMIN.md) và [P04 report](reports/P04_REPORT.md).

## 3. Giấy tờ

| Method / endpoint | Quyền | Request → response | Quy tắc chính |
|---|---|---|---|
| `POST /api/user-documents` | Account ACTIVE | Multipart `SubmitUserDocumentRequest` → `UserDocumentDetailResponse` | customer từ principal; status luôn PENDING |
| `GET /api/user-documents` | Account ACTIVE | `scope=mine` mặc định; admin có thể `scope=all`; page/filter → summary page | Customer không được dùng scope=all hoặc lọc account khác |
| `GET /api/user-documents/{id}` | Chủ bản ghi hoặc ADMIN ACTIVE | → detail | Ngoài phạm vi trả 404; không lộ hồ sơ tồn tại |
| `GET /api/user-documents/{id}/files/{side}` | Chủ bản ghi hoặc ADMIN ACTIVE | `side=front/back` → binary JPEG/PNG có JWT | P05 local private: kiểm tra quyền trước khi đọc; no-store/nosniff; thiếu mặt sau404 |
| `PATCH /api/user-documents/{id}/review` | ADMIN ACTIVE | `ReviewUserDocumentRequest` → `UserDocumentReviewResponse` | PENDING→APPROVED/REJECTED; self-review403, terminal/prerequisite/unique409; strict JSON, trace/no-store |
| `GET /api/customers/me/kyc` | Chủ tài khoản ACTIVE | → `KycSummaryResponse` | Tính KYC identity hiện tại theo Clock; read-only aggregate, không lộ giấy tờ |
| `GET /api/customers/{id}/kyc` | ADMIN ACTIVE | → `KycSummaryResponse` | Có thể xem account LOCKED; account status độc lập với KYC |

**Multipart fields:** `docType`, `docNumber`, `fullNameOnDoc`, `dateOfBirthOnDoc`, `issuePlace`, `issueDate`, `expiresAt`, `licenseClass`, `frontImage`, `backImage`.

- `frontImage` bắt buộc; `backImage` tùy chọn khi upload. Khi approve, U-13 yêu cầu back cho CCCD/GPLX và chỉ front cho hộ chiếu.
- Chỉ JPEG/PNG đầy đủ cấu trúc được nhận; decoder warning, truncation hoặc CRC/chunk sai bị reject trước persist. Byte/file/request/pixel/output limits vẫn được áp dụng; file/request vượt cap trả 413 `PAYLOAD_TOO_LARGE`.
- `licenseClass` bắt buộc khi DRIVER_LICENSE theo CHECK SQL.
- `docNumber` giữ dạng chuỗi; cách chuẩn hóa/kiểm tra theo loại ở Q-08. Không tự dùng regex của một loại cho cả ba loại.
- Ngày cấp không sau hạn; ngày sinh không ở tương lai. Khi approve, U-13 yêu cầu tên/ngày sinh/nơi cấp/ngày cấp; GPLX cần hạng và hạn; CCCD/hộ chiếu được NULL hạn. Hạn bằng hôm nay còn hiệu lực theo Clock.
- Client không gửi `verifyStatus`, `verifiedBy`, `verifiedAt`, customer ID hoặc URL file nguồn.
- `ReviewUserDocumentRequest` chỉ nhận `verifyStatus` và `rejectReason`, từ chối key lạ, duplicate, sai type/coercion và query string. REJECTED cần reason trim nonblank ≤500; APPROVED chỉ chấp nhận reason omitted/null. Trạng thái sai/thiếu là 400 `INVALID_REQUEST`.
- Response review là `ApiResponse<UserDocumentReviewResponse>` gồm document detail allowlist, `kycStatus` tính tại command và `evaluatedOn`. Self-review trả 403 `DOCUMENT_SELF_REVIEW_FORBIDDEN`; terminal trả 409 `DOCUMENT_ALREADY_REVIEWED`; thiếu prerequisite 409 `DOCUMENT_NOT_APPROVABLE`; index xung đột 409 `APPROVED_DOCUMENT_CONFLICT`; storage disabled 503, file hỏng/mất 500 an toàn.
- P05 submission tiếp tục tạo row `PENDING` và không đổi snapshot KYC. P06 review cập nhật customer snapshot nếu thay đổi trong cùng transaction; không kích hoạt/đổi trạng thái driver.
- Summary che số giấy tờ; detail đầy đủ chỉ cho owner/admin ACTIVE. Theo lựa chọn local private U-10, P05 download trả bytes qua authenticated API; không phát signed/public URL, không trả locator/path trong DTO. FE dùng authenticated fetch rồi Blob; không JWT trong query.
- Không cung cấp generic PATCH/DELETE cho bản đã duyệt. Gia hạn, thay thế, thu hồi chưa được biểu diễn đầy đủ; xem Q-03.
- User đã chốt U-11: cấm ADMIN duyệt hoặc từ chối giấy tờ của chính mình. U-12/U-13 chốt identity KYC và prerequisites theo loại; không suy ra các policy này từ U-09 tự khóa.

### P05 — APPROVED sau P05-FIX-02

[Review P05-FIX-02](reviews/P05_FIX_02_REVIEW.md) chạy lại 87/87/packaging/health và cùng helper Boot trước/sau, R3 CLOSED/P05 APPROVED. Giữ owner/admin/PENDING/DTO/file contract và schema; reports/reviews cũ giữ lịch sử.

### P06 — APPROVED sau FIX-01

[Review P06-FIX-01](reviews/P06_FIX_01_REVIEW.md) xác nhận 106/106/packaging/health/probe,R1/R2 CLOSED. Safe failure diagnostics và actual upload-holder/review-waiter visibility đạt; strict API/current KYC/U-11/U-12/U-13/schema không đổi. Reports/reviews giữ; P07 được triển khai riêng theo U-14/U-15.

`GET /api/customers/me/kyc` và admin `GET /api/customers/{id}/kyc` trả current KYC theo Clock qua một aggregate statement read-only. Customer DTO/column kyc_status giữ snapshot lần review,không eligibility thời gian thực. P07 dùng current identity/license/profile evaluation; renewal/revoke chưa giao.

## 4. Hồ sơ tài xế

**P07 APPROVED/R1 CLOSED** theo [review FIX-01](reviews/P07_FIX_01_REVIEW.md), sau reviewer 126/126/packaging/health/probe. Routes/DTO/error codes/U-14/U-15/schema giữ; current aggregate nhất quán Java strip. Contract tại [14](14_DRIVER_PROFILE_ELIGIBILITY.md); reports cũ giữ lịch sử.

| Method / endpoint | Quyền | Request → response | Quy tắc chính |
|---|---|---|---|
| `POST /api/drivers` | Account ACTIVE | Không body/query → `DriverResponse` | Tạo PENDING cho chính mình; đã có profile trả 409 |
| `GET /api/drivers/me` | Account ACTIVE | → `DriverResponse` | Chưa đăng ký trả 404 |
| `GET /api/drivers` | ADMIN ACTIVE | `status, customerId, page, size, sort` → `PageResponse<DriverResponse>` | DB paging/count; query allowlist |
| `GET /api/drivers/{id}` | Owner ACTIVE hoặc ADMIN ACTIVE | → `DriverResponse` | Foreign/missing đều 404 |
| `PATCH /api/drivers/{id}/status` | ADMIN ACTIVE | Strict `ChangeDriverStatusRequest` → `DriverResponse` | Switch transitions, U-15; ACTIVE yêu cầu U-14 |
| `GET /api/drivers/me/eligibility` | Account ACTIVE | Current safe eligibility DTO | Missing ownprofile200false; current Clock,không GETwrite |
| `GET /api/drivers/{id}/eligibility` | Owner ACTIVE hoặc ADMIN | Current safe eligibility DTO | Foreign/missing404; internal F2 evaluate theo customerId rõ tên |

`DriverResponse` chỉ id/customerId/status/audit. Current eligibility DTO riêng có account/driver/current KYC/hasValidLicence/eligibleNow/reasonCode/evaluatedOn,không PII/license number. Create không body/query; command strict status ACTIVE/SUSPENDED/reason. PENDING→ACTIVE/ACTIVE→SUSPENDED/SUSPENDED→ACTIVE và no-op theo prompt; activation current U-14,không snapshot alone. Reason≤500 validate không persist/log text vì schema thiếu cột; durable history Q-09. Internal F2 DTO chỉ snapshot,không quyền assignment/reservation.

## 5. Tài khoản ngân hàng

**P08 APPROVED** theo [review](reviews/P08_REVIEW.md), sau reviewer 137/137/packaging/Boot/health/probe. Chi tiết ở [hợp đồng ngân hàng](15_BANK_ACCOUNTS.md); U-16/U-17/U-18 giữ: explicit default, xóa unreferenced default để zero, immutable payee. CUSTOMER/ADMIN ACTIVE chỉ thao tác own bank.

| Method / endpoint | Quyền | Request → response | Quy tắc chính |
|---|---|---|---|
| `POST /api/bank-accounts` | Account ACTIVE | `CreateBankAccountRequest` → `BankAccountResponse` | Đăng ký cho chính mình; trùng theo UNIQUE trả 409 |
| `GET /api/bank-accounts` | Account ACTIVE | page → bank response page | Chỉ dữ liệu của tôi, số tài khoản che bớt |
| `GET /api/bank-accounts/{id}` | Chủ bản ghi ACTIVE | → masked bank detail | Foreign/missing404 kể cả ADMIN; không full-number reveal trong P08 |
| `PATCH /api/bank-accounts/{id}/default` | Chủ bản ghi | Không body → bank response | Bỏ default cũ, đặt mới trong một transaction có khóa |
| `DELETE /api/bank-accounts/{id}` | Chủ bản ghi | → data null | Chỉ khi chưa bị tham chiếu; 409 nếu payout đang dùng |

`CreateBankAccountRequest` strict JSON chỉ nhận bankName/accountNumber/accountHolder/makeDefault. U-16 xác nhận omitted=false, chỉ true mới đặt default kể cả account đầu tiên; null/sai kiểu/unknown/duplicate/helper/owner/audit keys400. Không query trên create; default/delete không body hoặc query. Text strip/length theo schema, preserve leading zeros/case; không legal bank regex hoặc đối soát thật. U-18 không có update-payee endpoint.

Response gồm id/customerId/bankName/accountNumberMasked/accountHolder/isDefault/createdAt; không full number/updatedAt/entity. Mask giữ tối đa4 cuối khi dài>4, số ngắn che toàn bộ. List WHERE owner trước page/count, query/sort allowlist theo prompt. U-17 xóa default để zero defaults; FK reference409 không unlink payout. Global→customer→bank locks/recheck và clear/flush trước set/insert default cùng transaction; lỗi rollback giữ default cũ.

Không cung cấp API admin liệt kê toàn bộ tài khoản ngân hàng trong đợt F1 nếu chưa có nhu cầu được xác nhận. Function 4 dùng hợp đồng nội bộ được kiểm soát để lấy đúng tài khoản nhận payout.

## 6. Voucher cho admin

**P09 APPROVED/R1 CLOSED** theo [review FIX-01](reviews/P09_FIX_01_REVIEW.md), sau reviewer 144/144/packaging/Boot/health/same-helper probe. Production JsonMapper giữ exact token trước DTO; strict INT/null/type/U-19/U-20/U-21/locks/schema/window giữ. Hợp đồng ở [16](16_ADMIN_VOUCHERS.md); P10 contract test đối chiếu static OpenAPI với actual APIs; [report](reports/P10_REPORT.md) có kết quả workflow/JAR và giới hạn validation.

Tất cả endpoint dưới đây yêu cầu **ADMIN**. Không có API tính giá/áp voucher vào đơn trong F1.

| Method / endpoint | Request → response | Quy tắc chính |
|---|---|---|
| `POST /api/vouchers` | `CreateVoucherRequest` → `VoucherResponse` | Code strip/giữ case U-21; usedCount=0, ACTIVE |
| `GET /api/vouchers` | code/status/discountType/window/page/size/sort → response page | Exact code filter, WHERE/count/page tại DB; status tách window |
| `GET /api/vouchers/{id}` | → response | Có thể hiển thị usedCount chỉ đọc |
| `PUT /api/vouchers/{id}` | `UpdateVoucherAdminRequest` → response | Baseline chỉ description và usageLimit; kiểm tra quota dưới lock |
| `PATCH /api/vouchers/{id}/status` | `ChangeVoucherStatusRequest` → response | ACTIVE/INACTIVE; không reset lượt dùng |

`CreateVoucherRequest`: `code`, `description`, `discountType`, `discountValue`, `maxDiscount`, `minOrderAmount`, `startAt`, `endAt`, `usageLimit`, `perUserLimit`.

- `PERCENT`: `0 < discountValue <= 100`; `FIXED`: discountValue > 0; giá trị VND không nhận phần thập phân.
- `maxDiscount` nullable và >= 0 nếu có. Giá trị 0 có nghĩa giới hạn bằng 0; không tự coi 0 giống NULL hoặc đổi luật SQL.
- `usageLimit` nullable nghĩa không giới hạn; nếu có phải > 0; `perUserLimit > 0`.
- `startAt < endAt`, strict ISO local date-time không offset, precision≤6 theo prompt, thời gian Việt Nam/schema. Baseline không thêm future-only rule; lịch quá khứ vẫn lưu được. Window dùng start inclusive/end exclusive, không auto-change status.
- `UpdateVoucherAdminRequest`: `description`, `usageLimit`. PUT gửi đủ hai field; `usageLimit=null` biểu thị không giới hạn, không mơ hồ như partial update.
- U-19 giữ code/type/value/max/min/start/end/perUserLimit bất biến; ADMIN không bind usedCount. Quota mới kiểm tra với latest usedCount dưới row lock, nhỏ hơn trả409 không đổi description/audit. U-21 không uppercase/lowercase code; numeric NUMERIC(14,0) reject phần lẻ khác0 trước DB, không silently round.
- Vô hiệu hóa dùng command status; không có xóa cứng voucher trong API đề xuất.

## 7. Mã lỗi và quyền dữ liệu

| HTTP | Mã điển hình | Khi nào |
|---|---|---|
| 400 | `INVALID_REQUEST`, `VALIDATION_ERROR`, `INVALID_ENUM`, `INVALID_PAGINATION` | Input sai định dạng, vượt giới hạn, field/status không cho phép |
| 401 | `AUTHENTICATION_FAILED`, `INVALID_TOKEN` | Thiếu/sai/hết hạn token, thông tin đăng nhập không hợp lệ, account bị chặn xác thực |
| 403 | `ACCESS_DENIED`, `DRIVER_SELF_STATUS_CHANGE_FORBIDDEN` | Đã xác thực nhưng thiếu quyền của endpoint hoặc ADMIN tự đổi status driver của mình |
| 404 | `RESOURCE_NOT_FOUND` | Không có tài nguyên trong scope người gọi được phép truy cập |
| 409 | `ACCOUNT_ALREADY_EXISTS`, `DOCUMENT_ALREADY_APPROVED`, `DRIVER_PROFILE_ALREADY_EXISTS`, `INVALID_DRIVER_STATUS_TRANSITION`, `DRIVER_NOT_ELIGIBLE`, `INVALID_STATE`, `RESOURCE_IN_USE`, `VOUCHER_LIMIT_CONFLICT` | Trùng, trạng thái xung đột, thiếu prerequisite hiện tại, bản ghi đang được tham chiếu, quota xung đột |
| 413 | `PAYLOAD_TOO_LARGE` | File/request vượt cấu hình; mapping đồng bộ giữa proxy/server và API |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Loại nội dung upload không được hỗ trợ |
| 422 | `DOCUMENT_NOT_ELIGIBLE` | Input hợp lệ nhưng chưa thỏa điều kiện nghiệp vụ đã chốt |
| 500 | `INTERNAL_ERROR` | Lỗi không dự kiến; log cause ở server |
| 503 | `DEPENDENCY_UNAVAILABLE` | Database/authentication/storage dependency không sẵn sàng; không giả lập thành công hoặc thành credentials sai |

Chỉ chuyển exception DB đã nhận diện sang mã nghiệp vụ tương ứng. Một `DataIntegrityViolationException` bất kỳ không mặc nhiên có nghĩa email trùng. Map theo constraint/SQLState một cách có kiểm soát, không parse rồi trả toàn bộ message database.

## 8. Những API cố ý để ngoài phạm vi hiện tại

Refresh/logout thu hồi token, password reset, OTP email, cấp role động, tạo/sửa xe, slot, đơn thuê, xử lý thanh toán, payout, phí, tranh chấp và review chưa thuộc bộ API triển khai F1 này. Nếu nhóm bổ sung yêu cầu, cập nhật tài liệu 01 và 07 trước khi tạo endpoint mới.
