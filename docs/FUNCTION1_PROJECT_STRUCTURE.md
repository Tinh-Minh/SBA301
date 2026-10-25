# Cấu trúc dự án và chức năng Function 1

Tài liệu này mô tả **source hiện có** trong `carrental-BE` trên nhánh `feature/function_01`, được rà soát ngày 25/10/2026. Đây là phần backend Function 1 trong dự án nhóm; các class dùng chung với Function 2–4 được đánh dấu riêng, không tính là Entity/nghiệp vụ do Function 1 sở hữu.

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
    │   │   │   ├── UserDocumentMapper.java
    │   │   │   └── VoucherMapper.java
    │   │   ├── repository/
    │   │   │   ├── ActionLogRepository.java         # dùng chung
    │   │   │   ├── BankAccountRepository.java
    │   │   │   ├── CustomerRepository.java
    │   │   │   ├── CustomerStatusLock.java          # khóa nghiệp vụ theo customer
    │   │   │   ├── DriverEligibilityProjection.java
    │   │   │   ├── DriverRepository.java
    │   │   │   ├── KycEvidenceProjection.java
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
    │   │   │   ├── AuthService.java
    │   │   │   ├── BankAccountChangeLogger.java
    │   │   │   ├── BankAccountService.java
    │   │   │   ├── CustomerService.java
    │   │   │   ├── CustomerStatusChangeLogger.java
    │   │   │   ├── DocumentReviewLogger.java
    │   │   │   ├── DriverChangeLogger.java
    │   │   │   ├── DriverEligibilityPolicy.java
    │   │   │   ├── DriverEligibilityService.java
    │   │   │   ├── DriverService.java
    │   │   │   ├── KycPolicy.java
    │   │   │   ├── KycService.java
    │   │   │   ├── UserDocumentService.java
    │   │   │   ├── VoucherChangeLogger.java
    │   │   │   └── VoucherService.java
    │   │   ├── service/impl/
    │   │   │   ├── ActionLogServiceImpl.java          # log dùng chung
    │   │   │   ├── AdminBootstrapService.java
    │   │   │   ├── AuthServiceImpl.java
    │   │   │   ├── BankAccountServiceImpl.java
    │   │   │   ├── CustomerServiceImpl.java
    │   │   │   ├── DriverEligibilityServiceImpl.java
    │   │   │   ├── DriverServiceImpl.java
    │   │   │   ├── KycServiceImpl.java
    │   │   │   ├── UserDocumentServiceImpl.java
    │   │   │   └── VoucherServiceImpl.java
    │   │   ├── storage/
    │   │   │   ├── CanonicalDocumentImage.java
    │   │   │   ├── DocumentImageFormat.java
    │   │   │   ├── DocumentImageInspector.java
    │   │   │   ├── ImageStructureValidator.java
    │   │   │   ├── LocalPrivateDocumentStorage.java
    │   │   │   ├── PrivateDocumentFile.java
    │   │   │   ├── PrivateDocumentReceipt.java
    │   │   │   ├── PrivateDocumentStorage.java
    │   │   │   ├── StorageRootPolicy.java
    │   │   │   └── UploadedDocumentImage.java
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

`AuthServiceImpl` kiểm tra trùng email/số điện thoại, chuẩn hóa dữ liệu, hash BCrypt và dùng `CustomerMapper` tạo Entity với `CUSTOMER`, `ACTIVE`, `KYC NONE`, `emailVerified=false`. Database unique constraint là chốt cuối cho đăng ký đồng thời. Đăng nhập ký JWT HS256; `JwtProperties` bind cấu hình dưới `app.security.jwt` (gồm `secret-key` và `access-token-ttl`, hiện đặt `PT30M`). Decoder kiểm tra chữ ký/claims và `CurrentAccountJwtAuthenticationConverter` đọc Customer hiện tại từ DB để lấy role/status cho mỗi bearer request. Tài khoản không ACTIVE, gồm `LOCKED`, không dùng token cũ để tiếp tục gọi API.

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
| Mapper | 4 mapper trong `mapper/` | Request/Entity/response mapping, allowlist response, masking bank fields; mapping driver đơn giản nằm trong `DriverResponse.from`. |
| Repository | 6 repository (5 bảng F1 và `ActionLog` dùng chung), `CustomerStatusLock`, `DriverEligibilityProjection`, `KycEvidenceProjection` | Spring Data JPA truy xuất dữ liệu; lock và projection phục vụ các đường ghi/đọc nghiệp vụ cụ thể. |
| Security | `SecurityConfiguration`, `JwtConfiguration`, `JwtProperties`, `CurrentAccount*`, authentication handlers | Bearer JWT HS256; secret lấy qua `app.security.jwt.secret-key` từ `JWT_SECRET`, TTL qua `app.security.jwt.access-token-ttl`; login đọc Customer từ repository và kiểm tra BCrypt trực tiếp, role/status/current principal vẫn lấy từ DB, cùng CORS và lỗi xác thực. |
| Storage | `PrivateDocumentStorage`, `LocalPrivateDocumentStorage`, `StorageRootPolicy`, `DocumentImageInspector`, `ImageStructureValidator`, `CanonicalDocumentImage`, `DocumentImageFormat`, `PrivateDocumentFile`, `PrivateDocumentReceipt`, `UploadedDocumentImage` | Lưu/mở/xóa ảnh giấy tờ private; kiểm tra cấu hình root và ảnh, giữ metadata/receipt cho vòng đời file. |
| Validation/web | `ValidPassword`, `PasswordPolicyValidator`, `RequestTraceFilter`, `UserDocumentMultipartReader` | Chính sách mật khẩu, trace header, kiểm tra và đọc multipart. |
| Exception/config | `AppException`, `ErrorCode`, `GlobalExceptionHandler`, config/property classes | Lỗi API, giới hạn request, clock, cấu hình JSON/security/document. |
| Policy và logger F1 | `DriverEligibilityPolicy`, `KycPolicy`, `BankAccountChangeLogger`, `CustomerStatusChangeLogger`, `DocumentReviewLogger`, `DriverChangeLogger`, `VoucherChangeLogger` | Tách quy tắc eligibility/KYC và ghi log nghiệp vụ của Function 1; các service F1 hiện đang gọi trực tiếp. |
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
- Source hiện tại của `VerificationStatus` vẫn chứa `canTransitionTo` và `validateTransitionTo(AppException)`. Điều này còn lệch với chỉ thị trước đó về enum thuần; cần người review quyết định/chuyển logic nếu chỉ thị đó vẫn áp dụng.
- `docs/20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md` mô tả profile PATCH chỉ có `fullName`, `dateOfBirth`, `address`, trong khi `UpdateProfileRequest` và `CustomerMapper` hiện còn cho phép `email`, `phone`, `avatarUrl`. File này ghi theo source thực tế; cần xác nhận với Leader nếu ba trường bổ sung chưa được chấp thuận.
- `SecurityConfig` còn giữ lớp cấu hình scheduling có `@EnableScheduling`; `SecurityConfiguration` ở `config/security` cấu hình Spring Security/JWT. Đây là hai lớp khác mục đích.
- Cấu hình DB/JWT/private storage nằm ở `application.properties` cùng biến môi trường `.env`; SQL baseline ở `db/migration/function1/`. Không đồng nghĩa rằng schema/runtime Supabase thực đã được xác minh trong tài liệu này.

Để review chi tiết từng cột, xem [đối chiếu 59 cột Entity](22_ENTITY_SCHEMA_FIELD_MAP.md). Luồng tuần tự từng API có ở [sơ đồ Function 1](21_FUNCTION_1_FLOWS.md); trạng thái refactor gần nhất ở [báo cáo tinh giản](reports/FUNCTION1_SIMPLIFICATION_2026-10-24.md).
