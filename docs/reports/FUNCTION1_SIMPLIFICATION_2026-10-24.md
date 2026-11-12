# Refactor Function 1 — Phan Doan The Quan

Ngày kiểm tra: 24/10/2026. Working tree: `feature/function_01` tại `C:/Users/FPTSHOP/Desktop/SBA301_RentCar`.

## Phạm vi

Thực hiện trên working tree hiện tại, giữ nguyên các thay đổi có sẵn của thành viên khác. Đối chiếu SHA-256 với snapshot đầu lượt sửa: không thay đổi file Entity, nguồn FE, SecurityConfig hoặc SecurityConfiguration. Không stage, commit hay push. Danh sách bên dưới là thay đổi của riêng lượt này, không phải toàn bộ `git diff` đang tồn tại.

## Thay đổi chính

- DTO Function 1 không còn mapping Entity; CustomerMapper, DriverMapper, VoucherMapper và các mapper hiện có xử lý chuyển đổi. CustomerMapper đóng gói chuẩn hóa đăng ký và giá trị mặc định.
- CustomerStatus, DriverStatus, VoucherStatus và VoucherWindowState trở lại enum thuần. Quy tắc chuyển trạng thái và hành vi gọi lặp được giữ trong ServiceImpl. Các enum/DTO của chức năng khác giữ nguyên.
- Voucher dùng POJO BigDecimal/LocalDateTime và Bean Validation. Jackson cấu hình riêng cho ba request voucher để giữ hợp đồng JSON nghiêm ngặt, không đổi cách binding các endpoint khác. PUT voucher vẫn yêu cầu cả description và usageLimit; null có nghĩa xóa giá trị.
- KYC và eligibility đọc repository bằng query đơn giản, tính bằng Java. Bỏ ba projection không cần thiết. Query scalar ngắn lấy owner ID của giấy tờ được giữ để khóa đúng owner trước khi nạp Entity.
- Bỏ các catch/log/rethrow lặp; lỗi DB Function 1 được phân loại và ghi log an toàn ở GlobalExceptionHandler. Chỉ unique constraint đúng tên và SQLSTATE mới được báo trùng dữ liệu; lỗi DB không xác định của Function 1 trả 500. Luồng lỗi các endpoint khác giữ nguyên.
- AuthServiceImpl đăng ký vẫn precheck email/phone và bắt đúng unique constraint. Đăng nhập giữ RS256, BCrypt và tra trạng thái/role hiện tại từ DB. Lỗi dependency khi đăng nhập trả 503. TokenResponse.toString() tiếp tục che accessToken.
- SecurityConfig chứa @EnableScheduling được giữ nguyên. Không đổi định dạng key/env hay cách ký JWT của các thành viên khác.
- Storage còn PrivateDocumentStorage và LocalPrivateDocumentStorage; các record/enum dữ liệu nhỏ nằm trong interface. Kiểm tra dung lượng, MIME, tên file và ảnh bằng ImageIO; lưu tên UUID và locator riêng tư. Bỏ reflection/JAR scan, parser JPEG/PNG/CRC và canonical hóa ảnh tự viết.
- UserDocumentServiceImpl dùng @Transactional. Catch xóa file khi xử lý thất bại; Spring TransactionSynchronization xóa khi rollback ở thời điểm commit. Nếu kết quả commit không xác định thì giữ file và ghi log an toàn để đối soát, tránh xóa ảnh có thể đã được DB tham chiếu. Không còn TransactionOutcome hay TransactionTemplate trong service.

## Các khóa còn giữ và lý do

| Nơi dùng | Mục đích |
|---|---|
| Customer cập nhật hồ sơ/mật khẩu/trạng thái | Khóa đúng dòng được sửa để tránh ghi đè dữ liệu đồng thời |
| Thay đổi trạng thái admin | Khóa nhóm admin theo ID để không khóa mất admin cuối cùng |
| Bank account | Một khóa owner để serialize tạo/xóa/đổi mặc định; không còn khóa đôi các tài khoản ngân hàng |
| Nộp/duyệt giấy tờ | Khóa owner khi lưu metadata và owner + document khi duyệt để đồng bộ KYC, chống duyệt hai lần; không khóa actor |
| Driver status | Khóa driver và owner để quyết định dựa trên giấy tờ/trạng thái khách hàng đã commit; không khóa actor |
| Voucher update/status | Khóa voucher để không ghi đè usedCount do Function 3 cập nhật |

Không thêm package policy/audit/persistence.lock. Các khóa còn lại dùng trực tiếp repository và giao dịch chuẩn Spring.

## Mức tinh giản

| File/nhóm | Trước lượt sửa | Sau lượt sửa |
|---|---:|---:|
| UserDocumentServiceImpl | 504 | 305 |
| VoucherServiceImpl | 396 | 197 |
| DriverServiceImpl | 344 | 247 |
| BankAccountServiceImpl | 327 | 176 |
| AuthServiceImpl | 166 | 134 |
| Toàn bộ package storage | 682 | 172 |

## Kiểm chứng

| Lệnh | Kết quả |
|---|---|
| `.\mvnw.cmd clean compile` | BUILD SUCCESS; biên dịch 260 file Java |
| `.\mvnw.cmd test` | BUILD SUCCESS; 73 test, 0 failure, 0 error, 0 skipped |
| `.\mvnw.cmd -Ppostgres-it verify` | 87/87 IT ngoài Auth qua; Auth có một assertion mới cần sửa, xem ghi chú dưới |
| `.\mvnw.cmd -Ppostgres-it -Dit.test=AuthSecurityPostgresIT verify` | BUILD SUCCESS; chạy lại 73 test thường + 16/16 Auth IT, 0 failure/error/skipped |
| `git diff --check` | Thành công |

**Kết quả mới nhất của từng suite: 73 test thường + 103 integration test đều qua; 0 failure, 0 error, 0 skipped.** Lượt verify toàn bộ có một lỗi trong assertion mới của test đổi mật khẩu: helper đòi danh sách errors rỗng cho lỗi Bean Validation. Đã sửa assertion để kiểm tra đúng field newPassword và chạy lại toàn bộ Auth suite thành công. Không sửa production code giữa hai lượt này; 87 IT còn lại giữ kết quả đã qua. Đây là kết quả tổng hợp theo suite, không mô tả lượt verify toàn bộ trước đó là thành công.

| Integration suite | Test | Failure | Error | Skipped |
|---|---:|---:|---:|---:|
| AuthSecurityPostgresIT | 16 | 0 | 0 | 0 |
| BankAccountPostgresIT | 9 | 0 | 0 | 0 |
| CustomerManagementPostgresIT | 15 | 0 | 0 | 0 |
| DriverConcurrencyPostgresIT | 5 | 0 | 0 | 0 |
| DriverProfilePostgresIT | 12 | 0 | 0 | 0 |
| Function1ExecutableJarSmokeIT | 1 | 0 | 0 | 0 |
| Function1PostgresIT | 7 | 0 | 0 | 0 |
| Function1WorkflowPostgresIT | 1 | 0 | 0 | 0 |
| UserDocumentPostgresIT | 16 | 0 | 0 | 0 |
| UserDocumentReviewPostgresIT | 15 | 0 | 0 | 0 |
| VoucherAdminPostgresIT | 6 | 0 | 0 | 0 |

Chạy bằng JDK 21. Integration test dùng PostgreSQL 15.13 trong Docker/Testcontainers riêng biệt; không dùng DB thật của nhóm.

Giữ các IT kiểm tra nghiệp vụ, quyền, validation, API contract, concurrency, workflow và executable JAR. Chỉ bỏ test/probe chuyên cho StorageRootPolicy/JAR reflection đã xóa. Test TransactionOutcome chuyển thành test callback Spring, giữ kiểm tra rollback/commit không xác định. Test ảnh hỏng dùng dữ liệu pixel không giải mã được bởi ImageIO thay cho kiểm tra trailer/CRC tự viết. Các test log xác nhận traceId, errorCode và không lộ dữ liệu tại handler tập trung; assertion nghiệp vụ và rollback giữ nguyên.

Bổ sung regression test cho che token, đổi mật khẩu, lỗi unique đăng ký không liên quan tài khoản. SpySupport chỉ nằm trong src/test, để spy gọi đúng Spring Data proxy khi test concurrency; không thêm abstraction production.

Cập nhật cả OpenAPI chạy test và bản tài liệu: bổ sung endpoint đổi mật khẩu đã có trước refactor và email/phone/avatarUrl của profile PATCH, giữ kiểm tra đối chiếu controller/DTO.

## Danh sách file thay đổi trong lượt này

### Đã sửa (53)

- [src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/config/ExactDecimalJsonMapperConfiguration.java)
- [src/main/java/com/carrental/controller/UserDocumentController.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/controller/UserDocumentController.java)
- [src/main/java/com/carrental/controller/VoucherController.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/controller/VoucherController.java)
- [src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/request/document/UserDocumentSubmissionCommand.java)
- [src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java)
- [src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/request/voucher/CreateVoucherRequest.java)
- [src/main/java/com/carrental/dto/request/voucher/UpdateVoucherAdminRequest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/request/voucher/UpdateVoucherAdminRequest.java)
- [src/main/java/com/carrental/dto/response/BankAccountResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/BankAccountResponse.java)
- [src/main/java/com/carrental/dto/response/CustomerAdminResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/CustomerAdminResponse.java)
- [src/main/java/com/carrental/dto/response/CustomerProfileResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/CustomerProfileResponse.java)
- [src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/CustomerSummaryResponse.java)
- [src/main/java/com/carrental/dto/response/DriverResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/DriverResponse.java)
- [src/main/java/com/carrental/dto/response/TokenResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/TokenResponse.java)
- [src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/UserDocumentDetailResponse.java)
- [src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/UserDocumentSummaryResponse.java)
- [src/main/java/com/carrental/dto/response/VoucherResponse.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/VoucherResponse.java)
- [src/main/java/com/carrental/dto/response/VoucherWindowState.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/dto/response/VoucherWindowState.java)
- [src/main/java/com/carrental/enums/CustomerStatus.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/enums/CustomerStatus.java)
- [src/main/java/com/carrental/enums/DriverStatus.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/enums/DriverStatus.java)
- [src/main/java/com/carrental/enums/VoucherStatus.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/enums/VoucherStatus.java)
- [src/main/java/com/carrental/exception/ErrorCode.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/exception/ErrorCode.java)
- [src/main/java/com/carrental/exception/GlobalExceptionHandler.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/exception/GlobalExceptionHandler.java)
- [src/main/java/com/carrental/mapper/CustomerMapper.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/mapper/CustomerMapper.java)
- [src/main/java/com/carrental/mapper/DriverMapper.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/mapper/DriverMapper.java)
- [src/main/java/com/carrental/mapper/VoucherMapper.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/mapper/VoucherMapper.java)
- [src/main/java/com/carrental/repository/CustomerRepository.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/repository/CustomerRepository.java)
- [src/main/java/com/carrental/repository/DriverRepository.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/repository/DriverRepository.java)
- [src/main/java/com/carrental/repository/UserDocumentRepository.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/repository/UserDocumentRepository.java)
- [src/main/java/com/carrental/repository/VoucherRepository.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/repository/VoucherRepository.java)
- [src/main/java/com/carrental/service/UserDocumentService.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/UserDocumentService.java)
- [src/main/java/com/carrental/service/impl/AuthServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/AuthServiceImpl.java)
- [src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java)
- [src/main/java/com/carrental/service/impl/CustomerServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/CustomerServiceImpl.java)
- [src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/DriverEligibilityServiceImpl.java)
- [src/main/java/com/carrental/service/impl/DriverServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/DriverServiceImpl.java)
- [src/main/java/com/carrental/service/impl/KycServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/KycServiceImpl.java)
- [src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java)
- [src/main/java/com/carrental/service/impl/VoucherServiceImpl.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/service/impl/VoucherServiceImpl.java)
- [src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/storage/LocalPrivateDocumentStorage.java)
- [src/main/java/com/carrental/storage/PrivateDocumentStorage.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/storage/PrivateDocumentStorage.java)
- [src/main/java/com/carrental/web/UserDocumentMultipartReader.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/main/java/com/carrental/web/UserDocumentMultipartReader.java)
- [src/test/java/com/carrental/AuthSecurityPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/AuthSecurityPostgresIT.java)
- [src/test/java/com/carrental/BankAccountPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/BankAccountPostgresIT.java)
- [src/test/java/com/carrental/CustomerManagementPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/CustomerManagementPostgresIT.java)
- [src/test/java/com/carrental/DriverConcurrencyPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/DriverConcurrencyPostgresIT.java)
- [src/test/java/com/carrental/DriverProfilePostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/DriverProfilePostgresIT.java)
- [src/test/java/com/carrental/Function1OpenApiContractTest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/Function1OpenApiContractTest.java)
- [src/test/java/com/carrental/Function1PostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/Function1PostgresIT.java)
- [src/test/java/com/carrental/JwtConfigurationTest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/JwtConfigurationTest.java)
- [src/test/java/com/carrental/PrivateDocumentStorageTest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/PrivateDocumentStorageTest.java)
- [src/test/java/com/carrental/UserDocumentPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/UserDocumentPostgresIT.java)
- [src/test/java/com/carrental/UserDocumentReviewPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/UserDocumentReviewPostgresIT.java)
- [src/test/java/com/carrental/VoucherAdminPostgresIT.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/VoucherAdminPostgresIT.java)

### Đã thêm (2)

- [src/test/java/com/carrental/SpySupport.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/SpySupport.java)
- [src/test/java/com/carrental/UserDocumentTransactionTest.java](C:/Users/FPTSHOP/Desktop/SBA301_RentCar/carrental-BE/src/test/java/com/carrental/UserDocumentTransactionTest.java)

### Đã xóa hoặc gộp (16)

- `src/main/java/com/carrental/repository/CustomerOwnerIdProjection.java`
- `src/main/java/com/carrental/repository/DriverEligibilityProjection.java`
- `src/main/java/com/carrental/repository/KycEvidenceProjection.java`
- `src/main/java/com/carrental/storage/CanonicalDocumentImage.java`
- `src/main/java/com/carrental/storage/DocumentImageFormat.java`
- `src/main/java/com/carrental/storage/DocumentImageInspector.java`
- `src/main/java/com/carrental/storage/ImageStructureValidator.java`
- `src/main/java/com/carrental/storage/PrivateDocumentFile.java`
- `src/main/java/com/carrental/storage/PrivateDocumentReceipt.java`
- `src/main/java/com/carrental/storage/StorageRootPolicy.java`
- `src/main/java/com/carrental/storage/UploadedDocumentImage.java`
- `src/test/java/com/carrental/UserDocumentTransactionOutcomeTest.java`
- `src/test/java/com/carrental/storage/StorageRootBootJarIT.java`
- `src/test/java/com/carrental/storage/StorageRootBootJarProbe.java`
- `src/test/java/com/carrental/storage/StorageRootJarProbe.java`
- `src/test/java/com/carrental/storage/StorageRootPolicyTest.java`

### Tài liệu

- `carrental-BE/openapi/function1.json`
- `docs/api/openapi-function1.json`
- `docs/reports/FUNCTION1_SIMPLIFICATION_2026-10-24.md`

Các mapper BankAccountMapper/UserDocumentMapper, ActionLogServiceImpl và cấu hình JWT đã có trong working tree được kiểm tra, tái sử dụng; không sửa lại trong lượt này.

## Giới hạn kết luận

Kết quả xác nhận build và các test đã chạy trên dữ liệu tổng hợp, không khẳng định mọi kịch bản production đều không thể lỗi. Không sửa chức năng của thành viên khác. Các DTO/enum/policy thuộc F2–F4 còn có cấu trúc khác được giữ nguyên theo giới hạn phạm vi của yêu cầu.
