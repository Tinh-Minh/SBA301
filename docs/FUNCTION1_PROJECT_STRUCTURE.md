# Cấu trúc dự án và chức năng Function 1

Tài liệu này mô tả **source hiện có** trong `carrental-BE` trên nhánh làm việc `refactor/function1-restore`, tách từ `feature/function_01` tại `cc136a1`. Tại lần rà ngày 25/10/2026, tip mới nhất `origin/full/carrental` (`5933152`) là tổ tiên của nhánh này. Đây là phần backend Function 1 trong dự án nhóm; các class dùng chung với Function 2–4 được đánh dấu riêng, không tính là Entity/nghiệp vụ do Function 1 sở hữu. Phần 9 ghi lại các thay đổi refactor/auth đã có để có thể báo cáo cho Leader.

## 1. Phạm vi Function 1

Function 1 đảm nhiệm tài khoản và xác thực, hồ sơ khách hàng, giấy tờ định danh/KYC, hồ sơ tài xế và điều kiện đủ lái, tài khoản ngân hàng nhận tiền, cùng việc quản trị định nghĩa voucher. Phần dữ liệu nghiệp vụ chính gồm đúng 5 bảng: `customers`, `user_documents`, `drivers`, `bank_accounts`, `vouchers`.

Function 1 không triển khai quản lý xe/slot (F2), đặt xe và sử dụng voucher trong đơn hàng (F3), hoặc thanh toán/payout/tranh chấp/đánh giá (F4). Một số lớp như `ActionLogService` được các Function dùng chung; chúng không làm thay đổi ranh giới 5 Entity chính.

## 2. Cây file backend liên quan

Các file liệt kê dưới đây là toàn bộ file mã nguồn liên quan trực tiếp hoặc dùng chung cho luồng Function 1. Những file Java của F2–F4 được lược khỏi cây để phần sở hữu không bị hiểu nhầm. `HealthController` và một số lớp nền được ghi là dùng chung.

```text
carrental-BE/
├── pom.xml
├── .mvn/wrapper/                       # Maven Wrapper
├── mvnw, mvnw.cmd
├── openapi/function1.json              # Hợp đồng OpenAPI được test
└── src/
    ├── main/
    │   ├── java/com/carrental/
    │   │   ├── CarRentalApplication.java      # điểm khởi chạy Spring Boot dùng chung
    │   │   ├── config/
    │   │   │   ├── ClockConfig.java
    │   │   │   ├── CustomerProperties.java
    │   │   │   ├── DocumentConfiguration.java
    │   │   │   ├── DocumentProperties.java
    │   │   │   ├── ExactDecimalJsonMapperConfiguration.java
    │   │   │   ├── SecurityConfig.java      # ZoneId và scheduling; giữ @EnableScheduling
    │   │   │   └── security/
    │   │   │       ├── AdminBootstrapRunner.java
    │   │   │       ├── BootstrapAdminProperties.java
    │   │   │       ├── CorsProperties.java
    │   │   │       ├── JwtConfiguration.java
    │   │   │       ├── JwtProperties.java
    │   │   │       ├── PasswordPolicyProperties.java
    │   │   │       └── SecurityConfiguration.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── BankAccountController.java
    │   │   │   ├── CustomerController.java
    │   │   │   ├── DriverController.java
    │   │   │   ├── UserDocumentController.java
    │   │   │   ├── VoucherController.java
    │   │   │   └── HealthController.java       # dùng chung
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   ├── auth/
    │   │   │   │   │   ├── AuthInputNormalizer.java
    │   │   │   │   │   ├── ChangePasswordRequest.java
    │   │   │   │   │   ├── LoginRequest.java
    │   │   │   │   │   └── RegisterRequest.java
    │   │   │   │   ├── customer/
    │   │   │   │   │   ├── ChangeCustomerStatusRequest.java
    │   │   │   │   │   ├── CustomerListQuery.java
    │   │   │   │   │   └── UpdateProfileRequest.java
    │   │   │   │   ├── document/
    │   │   │   │   │   ├── ReviewUserDocumentRequest.java
    │   │   │   │   │   ├── UserDocumentListQuery.java
    │   │   │   │   │   ├── UserDocumentSubmissionCommand.java
    │   │   │   │   │   └── UserDocumentSubmissionRequest.java
    │   │   │   │   ├── driver/
    │   │   │   │   │   ├── ChangeDriverStatusRequest.java
    │   │   │   │   │   └── DriverListQuery.java
    │   │   │   │   ├── bankaccount/
    │   │   │   │   │   ├── BankAccountListQuery.java
    │   │   │   │   │   └── CreateBankAccountRequest.java
    │   │   │   │   └── voucher/
    │   │   │   │       ├── ChangeVoucherStatusRequest.java
    │   │   │   │       ├── CreateVoucherRequest.java
    │   │   │   │       ├── UpdateVoucherAdminRequest.java
    │   │   │   │       └── VoucherListQuery.java
    │   │   │   └── response/
    │   │   │       ├── ApiResponse.java              # envelope dùng chung
    │   │   │       ├── ActionLogDTO.java              # dùng chung cho log Function 3
    │   │   │       ├── BankAccountResponse.java
    │   │   │       ├── CustomerAdminResponse.java
    │   │   │       ├── CustomerProfileResponse.java
    │   │   │       ├── CustomerSummaryResponse.java
    │   │   │       ├── DriverEligibilityReasonCode.java
    │   │   │       ├── DriverEligibilityResponse.java
    │   │   │       ├── DriverResponse.java
    │   │   │       ├── FieldErrorResponse.java       # dùng chung
    │   │   │       ├── HealthResponse.java            # route health dùng chung
    │   │   │       ├── KycSummaryResponse.java
    │   │   │       ├── PageResponse.java             # dùng chung
    │   │   │       ├── TokenResponse.java
    │   │   │       ├── UserDocumentDetailResponse.java
    │   │   │       ├── UserDocumentReviewResponse.java
    │   │   │       ├── UserDocumentSummaryResponse.java
    │   │   │       ├── VoucherResponse.java
    │   │   │       └── VoucherWindowState.java
    │   │   ├── entity/
    │   │   │   ├── BaseEntity.java
    │   │   │   ├── BankAccount.java
    │   │   │   ├── Customer.java
    │   │   │   ├── Driver.java
    │   │   │   ├── UserDocument.java
    │   │   │   ├── Voucher.java
    │   │   │   └── ActionLog.java                 # bảng log dùng chung
    │   │   ├── enums/
    │   │   │   ├── CustomerStatus.java
    │   │   │   ├── DiscountType.java
    │   │   │   ├── DocumentType.java
    │   │   │   ├── DriverStatus.java
    │   │   │   ├── KycStatus.java
    │   │   │   ├── Role.java
    │   │   │   ├── VerificationStatus.java
    │   │   │   └── VoucherStatus.java
    │   │   ├── exception/
    │   │   │   ├── AppException.java
    │   │   │   ├── BadRequestException.java          # exception dùng chung
    │   │   │   ├── ConflictException.java            # exception dùng chung
    │   │   │   ├── ErrorCode.java
    │   │   │   ├── ForbiddenException.java           # exception dùng chung
    │   │   │   ├── ResourceNotFoundException.java    # exception dùng chung
    │   │   │   ├── UnauthorizedException.java        # exception dùng chung
    │   │   │   └── GlobalExceptionHandler.java      # xử lý lỗi API dùng chung
    │   │   ├── mapper/
    │   │   │   ├── BankAccountMapper.java
    │   │   │   ├── CustomerMapper.java
    │   │   │   ├── DriverMapper.java
    │   │   │   ├── UserDocumentMapper.java
    │   │   │   └── VoucherMapper.java
    │   │   ├── repository/
    │   │   │   ├── ActionLogRepository.java         # dùng chung
    │   │   │   ├── BankAccountRepository.java
    │   │   │   ├── CustomerRepository.java
    │   │   │   ├── DriverRepository.java
    │   │   │   ├── UserDocumentRepository.java
    │   │   │   └── VoucherRepository.java
    │   │   ├── security/
    │   │   │   ├── ApiAccessDeniedHandler.java
    │   │   │   ├── ApiAuthenticationEntryPoint.java
    │   │   │   ├── CurrentAccount.java
    │   │   │   ├── CurrentAccountJwtAuthenticationConverter.java
    │   │   │   └── SecurityErrorResponses.java
    │   │   ├── service/
    │   │   │   ├── ActionLogService.java             # interface log dùng chung
    │   │   │   ├── AdminBootstrapService.java
    │   │   │   ├── AuthService.java
    │   │   │   ├── BankAccountService.java
    │   │   │   ├── CustomerService.java
    │   │   │   ├── DriverEligibilityService.java
    │   │   │   ├── DriverService.java
    │   │   │   ├── KycService.java
    │   │   │   ├── UserDocumentService.java
    │   │   │   └── VoucherService.java
    │   │   ├── service/impl/
    │   │   │   ├── ActionLogServiceImpl.java          # log dùng chung
    │   │   │   ├── AdminBootstrapServiceImpl.java
    │   │   │   ├── AuthServiceImpl.java
    │   │   │   ├── BankAccountServiceImpl.java
    │   │   │   ├── CustomerServiceImpl.java
    │   │   │   ├── DriverEligibilityServiceImpl.java
    │   │   │   ├── DriverServiceImpl.java
    │   │   │   ├── KycServiceImpl.java
    │   │   │   ├── UserDocumentServiceImpl.java
    │   │   │   └── VoucherServiceImpl.java
    │   │   ├── storage/
    │   │   │   ├── LocalPrivateDocumentStorage.java
    │   │   │   └── PrivateDocumentStorage.java
    │   │   ├── validation/
    │   │   │   ├── PasswordPolicyValidator.java
    │   │   │   └── ValidPassword.java
    │   │   └── web/
    │   │       ├── RequestTraceFilter.java
    │   │       └── UserDocumentMultipartReader.java
    │   └── resources/
    │       ├── application.properties
    │       ├── db/migration/function1/V1__function1_leader_baseline.sql
    │       └── seed_data.sql                         # dữ liệu seed dùng chung
    └── test/java/com/carrental/
        ├── AuthSecurityPostgresIT.java
        ├── AuthSecurityTestFixtures.java
        ├── BankAccountPostgresIT.java
        ├── CustomerManagementPostgresIT.java
        ├── CustomerPropertiesTest.java
        ├── DriverConcurrencyPostgresIT.java
        ├── DriverProfilePostgresIT.java
        ├── Function1ExecutableJarSmokeIT.java
        ├── Function1OpenApiContractTest.java
        ├── Function1PostgresIT.java
        ├── Function1WorkflowPostgresIT.java
        ├── JwtConfigurationTest.java
        ├── MutableTestClock.java                 # test fixture
        ├── PrivateDocumentStorageTest.java
        ├── SpySupport.java                       # test fixture
        ├── TestJwtKeys.java                      # test fixture
        ├── UserDocumentPostgresIT.java
        ├── UserDocumentReviewPostgresIT.java
        ├── UserDocumentTransactionTest.java
        ├── VoucherAdminPostgresIT.java
        └── service/impl/
            ├── DriverEligibilityServiceTest.java
            └── KycServiceTest.java
```

`carrental-FE/` là frontend riêng trong cùng repository. Cây trên tập trung vào source backend và test gắn với Function 1; không liệt kê các màn hình/code FE của thành viên khác như thể chúng do F1 sở hữu.

### Các màn hình FE đang nối tới luồng Function 1

Đây là các file client có route hoặc gọi API F1 trong source hiện tại; ghi nhận để tham khảo, không khẳng định quyền sở hữu của thành viên:

- Đăng nhập/đăng ký: `carrental-FE/src/views/Login.jsx`, `Register.jsx`, `src/services/auth.service.js`, `src/components/auth-provider.jsx`, `src/lib/session.js`.
- Hồ sơ/KYC/tài xế/ngân hàng: `src/views/live/AccountLive.jsx`, `VerificationLive.jsx`, `DriverLive.jsx`, `BanksLive.jsx`; API client ở `src/services/customer.service.js`, `customer-extra.service.js`, `bank-account.service.js`.
- Quản trị khách hàng/voucher: `src/views/admin/AdminUsers.jsx`, `AdminVouchers.jsx`; API client ở `src/services/admin.service.js`.
- Route mount nằm dưới `src/app/[[...slug]]/`, `src/app/account/`, `src/app/admin/users/`, `src/app/admin/vouchers/`; `src/lib/screens.js`, `src/app/layout.jsx` và `src/services/http.js` là hạ tầng client dùng chung.

## 3. Năm Entity và quan hệ dữ liệu

`BaseEntity` cung cấp `id`, `createdAt`, `updatedAt` cho `Customer`, `UserDocument`, `Driver`, `Voucher`. `BankAccount` tự khai báo khóa và `createdAt` vì bảng này không có `updated_at`. Tổng schema F1 là **59 cột**.

| Entity / bảng | Trường riêng | Trường kế thừa | Vai trò và quan hệ |
|---|---|---|---|
| `Customer` / `customers` (14 cột) | `fullName`, `email`, `phone`, `passwordHash`, `dateOfBirth`, `address`, `avatarUrl`, `emailVerified`, `kycStatus`, `role`, `status` | `id`, `createdAt`, `updatedAt` | Tài khoản CUSTOMER hoặc ADMIN; owner của giấy tờ, driver profile và tài khoản ngân hàng. |
| `UserDocument` / `user_documents` (18 cột) | `customer`, `docType`, `docNumber`, `fullNameOnDoc`, `dateOfBirthOnDoc`, `issuePlace`, `issueDate`, `expiresAt`, `licenseClass`, `frontImageUrl`, `backImageUrl`, `verifyStatus`, `rejectReason`, `verifiedBy`, `verifiedAt` | `id`, `createdAt`, `updatedAt` | Nhiều giấy tờ thuộc một Customer; người duyệt cũng tham chiếu Customer. Locator ảnh lưu ở hai cột URL trong DB. |
| `Driver` / `drivers` (5 cột) | `customer`, `status` | `id`, `createdAt`, `updatedAt` | Một hồ sơ tài xế tối đa cho một Customer; không phải role riêng. |
| `BankAccount` / `bank_accounts` (7 cột) | `id`, `customer`, `bankName`, `accountNumber`, `accountHolder`, `isDefault`, `createdAt` | Không dùng `BaseEntity` | Nhiều tài khoản thuộc một Customer; số tài khoản là chuỗi để giữ số 0 đầu. |
| `Voucher` / `vouchers` (15 cột) | `code`, `description`, `discountType`, `discountValue`, `maxDiscount`, `minOrderAmount`, `startAt`, `endAt`, `usageLimit`, `perUserLimit`, `usedCount`, `status` | `id`, `createdAt`, `updatedAt` | Định nghĩa voucher do ADMIN quản lý; nghiệp vụ áp dụng/ghi lượt dùng nằm ở phần đặt xe. |

`Customer.emailVerified` và `BankAccount.isDefault` là Boolean theo Entity hiện tại. Amount voucher dùng `BigDecimal` tương ứng `NUMERIC(14,0)`; thời gian voucher dùng `LocalDateTime`; ngày sinh/ngày cấp/hết hạn dùng `LocalDate`.

### Enum được các Entity/API F1 dùng

| Enum | Giá trị hiện tại |
|---|---|
| `Role` | `CUSTOMER`, `ADMIN` |
| `CustomerStatus` | `ACTIVE`, `LOCKED` |
| `KycStatus` | `NONE`, `PENDING`, `VERIFIED`, `REJECTED` |
| `DocumentType` | `CITIZEN_ID`, `DRIVER_LICENSE`, `PASSPORT` |
| `VerificationStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `DriverStatus` | `PENDING`, `ACTIVE`, `SUSPENDED` |
| `DiscountType` | `PERCENT`, `FIXED` |
| `VoucherStatus` | `ACTIVE`, `INACTIVE` |

## 4. Controller và HTTP API

Function 1 có 32 route nghiệp vụ. `GET /api/health` là route nền dùng chung, nâng tổng số route trong hợp đồng OpenAPI lên 33.

| Controller | Route | Chức năng |
|---|---|---|
| `AuthController` | `POST /api/auth/register` | Tạo Customer với role/status/KYC mặc định do server quyết định. |
| | `POST /api/auth/login` | Xác thực email/mật khẩu và trả access token. |
| | `POST /api/auth/change-password` | Đổi mật khẩu khi đã đăng nhập, cần mật khẩu hiện tại và mật khẩu mới. |
| `CustomerController` | `GET /api/customers/me` | Đọc hồ sơ của principal hiện tại. |
| | `GET /api/customers/me/kyc` | Đọc tóm tắt KYC hiện tại. |
| | `PATCH /api/customers/me` | Cập nhật hồ sơ bản thân. |
| | `GET /api/customers` | ADMIN tìm kiếm và phân trang danh sách khách hàng. |
| | `GET /api/customers/{id}` | ADMIN xem hồ sơ khách hàng. |
| | `GET /api/customers/{id}/kyc` | ADMIN xem trạng thái KYC khách hàng. |
| | `PATCH /api/customers/{id}/status` | ADMIN khóa/mở khóa; có guard tự khóa và admin hoạt động cuối cùng. |
| `UserDocumentController` | `POST /api/user-documents` | Gửi metadata và multipart ảnh giấy tờ. |
| | `GET /api/user-documents` | Liệt kê giấy tờ theo quyền và phạm vi. |
| | `GET /api/user-documents/{id}` | Xem chi tiết theo owner/admin. |
| | `GET /api/user-documents/{id}/files/{side}` | Tải ảnh `front` hoặc `back` sau kiểm tra quyền. |
| | `PATCH /api/user-documents/{id}/review` | ADMIN duyệt hoặc từ chối, không tự duyệt giấy tờ của mình. |
| `DriverController` | `POST /api/drivers` | Tạo hồ sơ driver cho Customer hiện tại. |
| | `GET /api/drivers/me` | Xem hồ sơ driver bản thân. |
| | `GET /api/drivers/me/eligibility` | Kiểm tra điều kiện driver của bản thân. |
| | `GET /api/drivers` | ADMIN lọc/phân trang driver. |
| | `GET /api/drivers/{id}` | Xem driver theo quyền. |
| | `GET /api/drivers/{id}/eligibility` | Tính điều kiện hiện tại từ account, KYC và GPLX. |
| | `PATCH /api/drivers/{id}/status` | ADMIN kích hoạt/tạm ngưng theo quy tắc nghiệp vụ. |
| `BankAccountController` | `POST /api/bank-accounts` | Tạo bank account của chính mình; tùy chọn đặt mặc định. |
| | `GET /api/bank-accounts` | Danh sách đã che số, chỉ của owner hiện tại. |
| | `GET /api/bank-accounts/{id}` | Chi tiết đã che số, chỉ owner. |
| | `PATCH /api/bank-accounts/{id}/default` | Đặt tài khoản mặc định. |
| | `DELETE /api/bank-accounts/{id}` | Xóa tài khoản chưa bị tham chiếu. |
| `VoucherController` | `POST /api/vouchers` | ADMIN tạo định nghĩa voucher. |
| | `GET /api/vouchers` | ADMIN lọc và phân trang voucher. |
| | `GET /api/vouchers/{id}` | ADMIN xem voucher và trạng thái thời hạn tính toán. |
| | `PUT /api/vouchers/{id}` | ADMIN chỉ sửa `description`, `usageLimit`. |
| | `PATCH /api/vouchers/{id}/status` | ADMIN bật/tắt mềm voucher. |

Các route trả envelope API chung, có trace ID. Các DTO tách khỏi Entity; số bank account được che khi trả ra.

## 5. Luồng nghiệp vụ Function 1

### Đăng ký, đăng nhập và hồ sơ

`AuthServiceImpl` kiểm tra trùng email/số điện thoại, chuẩn hóa dữ liệu, hash BCrypt và dùng `CustomerMapper` tạo Entity với `CUSTOMER`, `ACTIVE`, `KYC NONE`, `emailVerified=false`. Database unique constraint là chốt cuối cho đăng ký đồng thời. Đăng nhập tra Customer theo email, kiểm tra BCrypt và ký JWT HS256; secret lấy từ `JWT_SECRET` (tối thiểu 32 UTF-8 bytes), TTL mặc định 30 phút. Decoder kiểm tra token và `CurrentAccountJwtAuthenticationConverter` đọc account/role/status hiện tại từ DB. Tài khoản bị khóa không được dùng token cũ để tiếp tục gọi API.

`CustomerServiceImpl` xử lý hồ sơ cá nhân, danh sách/admin view, trạng thái. PATCH hiện nhận allowlist sáu trường `fullName`, `dateOfBirth`, `address`, `email`, `phone`, `avatarUrl`; đổi email sẽ đặt lại `emailVerified=false`. Ghi trạng thái ADMIN có guard không tự khóa và không khóa admin ACTIVE cuối cùng.

### Giấy tờ và KYC

`UserDocumentServiceImpl` kiểm tra request, ảnh và trạng thái account, lưu ảnh trong private local storage, sau đó lưu giấy tờ ở trạng thái `PENDING`. Ảnh không được đưa vào public URL. Transaction rollback sẽ dọn file mới tạo; file chỉ được tải qua endpoint đã kiểm tra owner/admin.

Chỉ ADMIN duyệt/từ chối; chủ giấy tờ không thể tự duyệt. Khi duyệt, service xác nhận metadata/ngày hạn/ảnh và uniqueness của giấy tờ approved, cập nhật `verifiedBy/verifiedAt`, rồi tính lại KYC trong cùng transaction. `KycServiceImpl` lấy trạng thái từ giấy tờ CCCD/passport: approved còn hạn cho `VERIFIED`, nếu không thì pending, rejected, hoặc none theo dữ liệu hiện có.

### Driver eligibility

Một Customer có thể tạo một driver profile, mặc định `PENDING`. Chuyển status do ADMIN thực hiện; driver không tự duyệt trạng thái của mình. Kích hoạt cần account ACTIVE, KYC identity VERIFIED và GPLX APPROVED còn hạn với `licenseClass` không rỗng. `GET eligibility` tính điều kiện theo ngày hiện tại; driver status ACTIVE được lưu trong DB không tự động đồng nghĩa đủ điều kiện nếu account hoặc giấy tờ đã hết hiệu lực.

### Bank account

Các thao tác bank account giới hạn theo Customer đang đăng nhập, kể cả caller ADMIN. Có thể có zero hoặc một default; cập nhật default được serialize theo owner. REST chỉ trả số đã mask; không có API sửa payee fields sau khi tạo. Xóa bị từ chối nếu còn quan hệ tham chiếu trong DB.

### Voucher

Chỉ ADMIN quản lý definition. DTO dùng `BigDecimal`, `LocalDateTime` và Bean Validation; service kiểm tra điều kiện chéo như PERCENT tối đa 100, end sau start. Create đặt ACTIVE và `usedCount=0`. Update chỉ đổi description/quota; status dùng ACTIVE/INACTIVE, không xóa hàng. F1 không có redeem, tính tiền đơn, hoặc cho client sửa `usedCount`.

### Log và hạ tầng dùng chung

Các service gọi `ActionLogService`; `ActionLogServiceImpl`, `ActionLogRepository` và `ActionLog` dùng chung cho nhóm/F3. `GlobalExceptionHandler`, `ApiResponse`, `PageResponse`, `RequestTraceFilter`, Spring Security, `ClockConfig` và `CustomerProperties` là hạ tầng được F1 sử dụng.

## 6. Bản đồ lớp theo trách nhiệm

| Nhóm | Class | Trách nhiệm |
|---|---|---|
| Controller | 6 controller F1 ở cây file | Nhận HTTP, principal/request, gọi service và trả response. |
| Service interface | Auth, Customer, KYC, UserDocument, Driver, DriverEligibility, BankAccount, Voucher | Hợp đồng các use case F1. |
| Service implementation | Các `*ServiceImpl` tương ứng | Quyền, quy tắc nghiệp vụ, transaction và repository orchestration. |
| Mapper | 5 mapper trong `mapper/` | Request/Entity/response mapping, allowlist response, masking bank fields. |
| Repository | 5 repository F1 | Spring Data JPA truy xuất 5 bảng; khóa chỉ đặt ở các đường ghi có invariants đồng thời. |
| Security | `SecurityConfiguration`, `JwtConfiguration`, `JwtProperties`, `CurrentAccount*`, authentication handlers | Bearer JWT HS256, secret từ `JWT_SECRET`, BCrypt trực tiếp, role/status/current principal, CORS và lỗi xác thực. |
| Storage | `PrivateDocumentStorage`, `LocalPrivateDocumentStorage` | Lưu/mở/xóa ảnh giấy tờ private; record/enum nhỏ được khai báo bên trong interface. |
| Validation/web | `ValidPassword`, `PasswordPolicyValidator`, `RequestTraceFilter`, `UserDocumentMultipartReader` | Chính sách mật khẩu, trace header, kiểm tra và đọc multipart. |
| Exception/config | `AppException`, `ErrorCode`, `GlobalExceptionHandler`, config/property classes | Lỗi API, giới hạn request, clock, cấu hình JSON/security/document. |
| Logging dùng chung | `ActionLogService`, `ActionLogServiceImpl`, `ActionLogRepository`, `ActionLog` | Ghi audit event các use case F1 và các function khác. |

## 7. Test liên quan

Các test nằm trong `carrental-BE/src/test/java/com/carrental/`:

- API/auth/security: `AuthSecurityPostgresIT`, `AuthSecurityTestFixtures`, `AuthServiceImplTest`, `BCryptPasswordEncoderTest`, `JwtConfigurationTest`.
- Customer/status: `CustomerManagementPostgresIT`, `CustomerPropertiesTest`.
- Driver/KYC: `DriverProfilePostgresIT`, `DriverConcurrencyPostgresIT`, `service/impl/DriverEligibilityServiceTest`, `service/impl/KycServiceTest`.
- Giấy tờ/storage: `UserDocumentPostgresIT`, `UserDocumentReviewPostgresIT`, `UserDocumentTransactionTest`, `PrivateDocumentStorageTest`.
- Bank account: `BankAccountPostgresIT`.
- Voucher: `VoucherAdminPostgresIT`.
- Hợp đồng và tích hợp chung của F1: `Function1OpenApiContractTest`, `Function1PostgresIT`, `Function1WorkflowPostgresIT`, `Function1ExecutableJarSmokeIT`.

## 8. Phạm vi chưa triển khai và ghi chú review

- Không có Entity/controller/service F1 để tạo xe, slot, đơn thuê, thanh toán, payout, dispute hay review chuyến. Các Entity tương ứng khác trong `entity/` thuộc Function khác.
- Không có API redeem voucher; `VoucherWindowState` chỉ là trạng thái thời gian trả về cho admin.
- Không có flow OTP, xác minh email, reset/refresh token, upload avatar, auto-suspend driver hay public URL ảnh giấy tờ.
- `VerificationStatus` vẫn có `canTransitionTo` và `validateTransitionTo(AppException)`. Giữ nguyên vì đây là enum dùng chung và Function 2 đang gọi logic chuyển trạng thái này; không xóa/chuyển nếu chưa kiểm tra consumer ngoài F1.
- `docs/20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md` mô tả profile PATCH chỉ có `fullName`, `dateOfBirth`, `address`, trong khi `UpdateProfileRequest` và `CustomerMapper` hiện còn cho phép `email`, `phone`, `avatarUrl`. File này ghi theo source thực tế; cần xác nhận với Leader nếu ba trường bổ sung chưa được chấp thuận.
- `SecurityConfig` còn giữ lớp cấu hình scheduling có `@EnableScheduling`; `SecurityConfiguration` ở `config/security` cấu hình Spring Security/JWT. Đây là hai lớp khác mục đích.
- Cấu hình DB/JWT/private storage nằm ở `application.properties` cùng biến môi trường `.env`; SQL baseline ở `db/migration/function1/`. Không đồng nghĩa rằng schema/runtime Supabase thực đã được xác minh trong tài liệu này.

Để review chi tiết từng cột, xem [đối chiếu 59 cột Entity](22_ENTITY_SCHEMA_FIELD_MAP.md). Luồng tuần tự từng API có ở [sơ đồ Function 1](21_FUNCTION_1_FLOWS.md); trạng thái refactor gần nhất ở [báo cáo tinh giản](reports/FUNCTION1_SIMPLIFICATION_2026-10-24.md).

## 9. Báo cáo các thay đổi đã thực hiện

### 9.1. Phạm vi và mốc source

Phần dưới tổng hợp thay đổi Function 1 đã có trong source hiện tại, gồm lượt tinh giản trước đó, Bước 1+2 về xác thực và các chỉnh sửa trên nhánh khôi phục. Đây là mô tả source, không phải đề xuất thay đổi tiếp theo. `cc136a1` là mốc nền của `feature/function_01`; các commit khôi phục hiện gồm `4f7704b` (bỏ tiền tố BCrypt ở seed), `c34efe0` (đưa datasource password ra biến môi trường, tắt bootstrap admin mặc định) và `f5ad4c6` (voucher code không phân biệt hoa thường). Nhánh làm việc chưa push. Báo cáo đầy đủ danh sách file của lượt tinh giản nằm tại [FUNCTION1_SIMPLIFICATION_2026-10-24.md](reports/FUNCTION1_SIMPLIFICATION_2026-10-24.md).

### 9.2. DTO, Mapper và Enum

- Request/Response DTO chỉ giữ dữ liệu API và validation; mapping DTO–Entity được đặt trong `CustomerMapper`, `BankAccountMapper`, `UserDocumentMapper`, `DriverMapper` và `VoucherMapper`.
- `CustomerMapper` xử lý đăng ký: chuẩn hóa đầu vào, gán `CUSTOMER`, `ACTIVE`, `KYC NONE`, `emailVerified=false`, và nhận mật khẩu đã encode. `AuthServiceImpl` không còn dựng `Customer` bằng chuỗi setter dài.
- Voucher request chuyển sang POJO với `BigDecimal`, `LocalDateTime` và Jakarta Bean Validation. Ràng buộc liên trường (ví dụ phần trăm giảm tối đa và thời gian kết thúc sau thời gian bắt đầu) được kiểm tra trong service. Cách binding được giới hạn cho các DTO voucher để không làm đổi binding của API khác.
- Các enum nghiệp vụ F1 như `CustomerStatus`, `DriverStatus`, `VoucherStatus` giữ giá trị trạng thái; kiểm tra chuyển trạng thái nằm trong service. `VerificationStatus` là ngoại lệ có chủ đích vì được Function 2 dùng chung.
- `DriverMapper` hiện **vẫn còn** trong source và được `DriverServiceImpl` cùng `DriverEligibilityServiceImpl` gọi. Commit `c281ff5` trên nhánh refactor từng thử gộp mapper vào response, nhưng merge hiện tại giữ mapper vì các call site này vẫn sử dụng nó.

### 9.3. Service, Repository và transaction

- Các service Function 1 xử lý theo luồng quyền → nạp dữ liệu → kiểm tra nghiệp vụ → cập nhật/lưu → mapper trả response. Những khối `catch/log/rethrow` lặp được bỏ để exception handler tập trung xử lý.
- Đăng ký vẫn precheck email/số điện thoại và xử lý unique constraint; lỗi DB không xác định không bị quy chụp thành “trùng tài khoản”. Đăng nhập tra Customer theo email và kiểm tra mật khẩu bằng `PasswordEncoder.matches()`.
- KYC và driver eligibility lấy evidence qua repository rồi tính hạn CCCD/passport/GPLX trong Java theo `Clock`. Luồng duyệt giấy tờ và tính lại KYC vẫn trong cùng transaction; các guard self-review, quyền ADMIN, account ACTIVE và điều kiện giấy tờ còn hiệu lực vẫn được giữ.
- Repository ưu tiên derived query và truy vấn dữ liệu cần thiết. Khóa pessimistic chỉ giữ ở các luồng cần bảo vệ invariant đồng thời: tài khoản ngân hàng mặc định theo owner, cập nhật trạng thái admin cuối cùng, nộp/duyệt giấy tờ và cập nhật trạng thái driver/voucher theo dữ liệu liên quan. Không còn khóa đôi tài khoản ngân hàng.
- Mã voucher được kiểm tra trùng không phân biệt hoa/thường qua `existsByCodeIgnoreCase`; unit test và PostgreSQL integration test kiểm tra trường hợp khác chữ hoa/thường.
- `UserDocumentServiceImpl` dùng `@Transactional`, không còn `TransactionTemplate`/`TransactionOutcome`. Nếu ghi DB thất bại hoặc transaction rollback, file vừa tạo được dọn theo cơ chế tương ứng; trường hợp commit không xác định không xóa file có thể đang được DB tham chiếu.
- Logger theo từng loại nghiệp vụ được tập trung qua `ActionLogService`/`ActionLogServiceImpl`. Các quy tắc KYC và eligibility vẫn nằm trong `KycServiceImpl`/`DriverEligibilityServiceImpl`, không tạo thêm package policy riêng.

### 9.4. Storage ảnh giấy tờ

Storage còn hai lớp chính: `PrivateDocumentStorage` và `LocalPrivateDocumentStorage`. Luồng hiện tại giới hạn kích thước, kiểm tra MIME/định dạng ảnh bằng thư viện chuẩn `ImageIO`, tạo tên file UUID, giữ file ngoài public path và trả locator riêng tư. Tải ảnh đi qua endpoint có kiểm tra owner/admin; ảnh không có public URL.

Các helper tự đọc cấu trúc byte JPEG/PNG/CRC, canonical hóa ảnh, dò nested JAR bằng reflection và record dữ liệu trung gian đã được bỏ. Chi tiết về lớp/test bị xóa hoặc thay thế được ghi trong báo cáo tinh giản đã liên kết ở đầu mục 9; các test nghiệp vụ, quyền và rollback vẫn được giữ.

### 9.5. Authentication/JWT và dữ liệu seed

| Khu vực | Hiện trạng sau refactor |
|---|---|
| Ký token | HS256; `JwtConfiguration` ký và xác minh cùng thuật toán. Token có `exp` và TTL mặc định 30 phút. |
| Secret | `app.security.jwt.secret-key=${JWT_SECRET}`; `JwtProperties` yêu cầu ít nhất 32 byte UTF-8. Không có secret production mặc định trong `application.properties`. |
| Đăng nhập | `AuthServiceImpl` tra Customer qua `CustomerRepository`, kiểm tra trạng thái và `PasswordEncoder.matches()`. Lỗi email/mật khẩu tiếp tục dùng cùng phản hồi công khai để tránh dò tài khoản. |
| Principal | Converter vẫn nạp Customer/role/status hiện tại từ DB mỗi request; tài khoản `LOCKED` bị chặn. `CurrentAccount` và cấu trúc principal được giữ. |
| Password encoder | Dùng `BCryptPasswordEncoder` trực tiếp. Giá trị `customers.password_hash` trong seed là BCrypt hash thuần (`$2a$`/`$2b$`/`$2y$`), không còn tiền tố `{bcrypt}`. |
| Thành phần RSA/DAO cũ | Đã bỏ `JwtKeyLoader`, `JwtKeyMaterial`, `GenerateJwtKeys.java`, `AccountUserDetails`, `CustomerUserDetailsService` và luồng `AuthenticationManager`/DAO provider. Test vẫn giữ ca âm từ chối token RS256. |
| Cấu hình local | `scripts/setup-supabase.ps1` tạo `JWT_SECRET` local khi biến thiếu, rỗng hoặc còn placeholder; giữ secret không rỗng đã có và không in secret. Nếu secret cũ ngắn hơn 32 byte, script không tự thay, nhưng ứng dụng sẽ từ chối khi khởi động. `.env` dùng tại máy; không ghi giá trị secret vào tài liệu này. |
| Mật khẩu datasource/bootstrap | `spring.datasource.password=${DB_PASSWORD}`; mật khẩu không còn hard-code trong `application.properties`. `app.security.bootstrap-admin.enabled=false` là mặc định; không commit mật khẩu bootstrap. |
| Log token | `TokenResponse.toString()` tiếp tục che bearer token. |

`SecurityConfig` được giữ vì chứa `@EnableScheduling`; `SecurityConfiguration` là cấu hình Spring Security/JWT riêng. Các handler lỗi, `AccessGuard`, `CurrentAccount`, `CurrentAccountJwtAuthenticationConverter`, `HeaderCurrentUserServiceImpl` và các API hiện hữu được giữ.

### 9.6. Test và kiểm chứng đã có

| Thời điểm/nhánh | Lệnh | Kết quả đã ghi nhận |
|---|---|---|
| Sau sửa assertion Auth, trên `refactor/function1-buoc-2`, trước merge | `.\mvnw.cmd -Ppostgres-it verify` | 82 test mặc định và 108 integration test Failsafe xanh trên 12 lớp test. Đây là kết quả trước merge, không phải lượt chạy sau merge. |
| Sau merge cục bộ, trên `feature/function_01` tại `cc136a1` | `.\mvnw.cmd clean verify` | 78 test mặc định xanh, 0 failure/error/skip. PostgreSQL IT không được chạy lại sau merge trong lượt xác nhận này. |
| Nhánh khôi phục sau các commit seed/config/voucher | `.\mvnw.cmd clean verify` | 79 test mặc định xanh, 0 failure/error/skip. Số lượng tăng thêm một unit test cho mã voucher phân biệt hoa/thường. |

Chênh lệch 82 → 78 test mặc định xuất phát từ test chuyên cho helper nội bộ đã bỏ: một test `CustomerStatusLockTest` và bốn test `StorageRootPolicyTest` không còn cơ chế tương ứng. Hai test `DriverEligibilityPolicyTest` được thay bằng hai test ở `DriverEligibilityServiceTest`; bốn test `KycPolicyTest` được thay bằng bốn test ở `KycServiceTest`; hai test `UserDocumentTransactionOutcomeTest` được thay bằng ba test `UserDocumentTransactionTest` (thêm một ca rollback). Vì vậy số ròng giảm 4, không phải do bốn test nghiệp vụ bị bỏ.

Probe đăng nhập seed chạy riêng trên PostgreSQL Testcontainers cô lập bằng BCrypt hash đúng từ `seed_values.sql` và mật khẩu admin đang có trong Postman collection: API trả `401 AUTHENTICATION_FAILED`, vì mật khẩu fixture không khớp hash trong seed. Hash suffix không bị đổi theo yêu cầu 8/8; cần nhóm xác nhận mật khẩu seed đúng trước khi khẳng định tài khoản này đăng nhập được.

### 9.7. Ảnh hưởng tương thích và việc cần làm khi triển khai

- Trong phạm vi refactor Bước 1+2, danh sách route, HTTP method/status, tên trường JSON của API và schema PostgreSQL được giữ nguyên. Không thêm migration.
- Các commit trên nhánh khôi phục không đổi schema/API. Mật khẩu datasource chuyển sang `DB_PASSWORD`, bootstrap admin tắt mặc định; muốn dùng bootstrap phải bật có chủ đích và cấp cấu hình qua môi trường.
- Cơ chế token và cách lưu password hash **có thay đổi tương thích dữ liệu**: token RSA cũ không được xác minh bằng cấu hình HS256 mới; các tài khoản seed trong DB đã nạp hash có tiền tố `{bcrypt}` cần reseed hoặc cập nhật theo quy trình được nhóm duyệt.
- Cần đặt `JWT_SECRET` mới, ngẫu nhiên, ít nhất 32 byte UTF-8 cho từng môi trường. Secret cũ từng nằm trong Git nên phải được thay mới; không gửi secret qua chat hoặc đưa vào commit.
- Kết quả Testcontainers không thay thế việc xác nhận kết nối với Supabase/database thật của nhóm. Người triển khai cần cấu hình `.env` local và kiểm tra môi trường đích theo runbook trước khi phát hành.
- Ghi chú còn cần Leader đối chiếu: `docs/20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md` mô tả PATCH profile ít trường hơn DTO/Mapper hiện tại (`email`, `phone`, `avatarUrl` cũng đang được nhận). Tài liệu này phản ánh source; cần xác nhận phạm vi API mong muốn, không tự sửa endpoint trong lượt tài liệu này.
