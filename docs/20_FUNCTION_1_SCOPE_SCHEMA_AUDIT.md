# Audit Function 1 — phạm vi, schema và độ phức tạp

Ngày2026-10-15, theo yêu cầu mới nhất của user: đúng5 bảng, không nghiệp vụ F2–F4, entity theo SQL leader, runtime Supabase và `.env`, có sơ đồ luồng để review.

## 1. Kết luận có bằng chứng

- **Đúng5 entity và59 cột**, không entity/bảng F2/F3/F4. Reflection annotations/base fields đã đối chiếu SQL gốc: type/length/precision/scale/nullability/enum/IDENTITY không có mismatch. [Toàn bộ59 trường](22_ENTITY_SCHEMA_FIELD_MAP.md).
- DDL bodies của5 bảng trong migration test khớp SQL gốc sau khi bỏ comments/whitespace và qualifier `public.`; không đổi cột/check/quan hệ để chiều implementation.
- Ba bản reference có SHA256 khớp file gốc Desktop. Schema source `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` không đổi. Đây là audit offline, chưa chứng minh schema đang có trên Supabase giống file.
- Có phần làm trước F4 không cần cho F1: internal full-payee lookup/DTO. **Đã bỏ**2 file và method riêng, điều chỉnh assertions liên quan. HTTP owner/mask/default/delete/FK protections giữ.
- Runtime trước thiếu một entry point rõ cho Supabase. **Đã thêm** profile `supabase`, native `.env` import, `.env.example`, `.env` ignored để user điền, setup key/storage bằng JDK. Không cần dotenv dependency hoặc Docker Compose.

## 2. Checklist tính năng

| Hạng mục | Bảng | Trạng thái/quyết định | Căn cứ và giới hạn |
|---|---|---|---|
| Đăng ký | customers | GIỮ | CUSTOMER/ACTIVE/NONE/emailVerifiedfalse, BCrypt, unique email/phone; không admin tự đăng ký |
| Đăng nhập JWT | customers | GIỮ | RS256/key ngoài repo, issuer/audience/expiry, current account status; không chuyển qua Supabase Auth |
| Spring Security, CUSTOMER/ADMIN | customers | GIỮ | Chỉ2 roles đúng CHECK; driver là hồ sơ, không role |
| CORS/validation/errors | Nền tảng | GIỮ/SỬA CẤU HÌNH | Exact origins, đủ PUT/DELETE; DTO/handler cần cho API, không thêm business table |
| Hồ sơ cá nhân | customers | GIỮ | Chỉ fullName/DOB/address; avatar_url/email_verified tồn tại trong entity đúng schema nhưng không có avatar/email verification flow |
| Admin list/khóa/mở account | customers | GIỮ | Thuộc quản lý tài khoản, policy tự khóa/last ACTIVE ADMIN user đã chốt U-09; không sửa role tùy ý |
| Gửi/list/detail/download giấy tờ | user_documents | GIỮ | Pending, ảnh private, owner/admin; GPLX class theo CHECK; không public URL |
| Duyệt/từ chối/KYC | user_documents + customers | GIỮ | Transaction document + customer snapshot, current KYC theo Clock; U-11/U-12/U-13 đã chốt |
| Hồ sơ tài xế/trạng thái/eligibility | drivers + identity/GPLX | GIỮ | U-14/U-15 đã chốt; no car assignment, storedACTIVE không tự bảo đảm currenteligible |
| Ngân hàng owner CRUD giới hạn/default | bank_accounts | GIỮ | U-16/U-17/U-18; account number String, mask, owner-only cả ADMIN; không updated_at |
| API/helper full payee cho payout | Chỉ chuẩn bị F4 | **ĐÃ BỎ** | Chưa có consumer F1; không cần shipping trước F4 |
| Admin voucher definition | vouchers | GIỮ | Create/read/page/update description/quota/status; U-19/U-20/U-21; usedCount không nhận từ client |
| Redeem/tính giá/giữ lượt voucher | F3 | KHÔNG TRIỂN KHAI | Không có controller/service/entity đặt xe/pricing |
| Payment/payout/dispute/review chuyến | F4 | KHÔNG TRIỂN KHAI | Không module nguồn; FK guard khi xóa bank vẫn cần tôn trọng DB gốc |
| Xe/slot/gán tài xế | F2 | KHÔNG TRIỂN KHAI | Không cars/car_slots entity/API |
| OTP/reset password/social auth/refresh/dynamic roles | Ngoài yêu cầu | KHÔNG THÊM | email_verified/role columns không là lệnh triển khai thêm feature |
| Docker/Testcontainers | Chỉ tests | GIỮ TÙY CHỌN | Dependencies scope test, PostgreSQL image có sẵn, không cần Dockerfile app; runtime Supabase không dùng Docker |
| Auto migration lên Supabase | Database chung | TẮT | validate/never/Flywayfalse; giữ schema leader |
| Flyway dependencies trong executable JAR | Chỉ dùng để tạo DB test trống | **ĐÃ CHUYỂN SCOPE TEST** | Hai dependencies Flyway chỉ còn test scope; harness tạo schema trước khi chạy standard JAR; không ship engine migration trong runtime |

## 3. Tại sao không xóa các phần bảo vệ chỉ vì nhiều file?

Các guards sau phục vụ trực tiếp feature F1 và đã có regression lỗi thật; giữ để không làm hỏng dữ liệu khi tinh gọn:

- Transaction/row locks và shared PostgreSQL transaction advisory lock: bảo vệ account lock vs writes, một bank default, quota update/usedCount, review race. Không thêm bảng/Redis/queue/distributed service. Global serialization là tradeoff throughput, không cần mở một dự án lock refactor trong lượt audit.
- Exact BigDecimal ingress: NUMERIC(14,0) không được rounded/underflow trước validation.
- Private image validation/canonicalization/rollback cleanup: phục vụ upload giấy tờ; không thể bỏ kiểm tra ownership/storage outcome chỉ để giảm SLOC.
- Current KYC/eligibility query: tránh dùng snapshot VERIFIED/ACTIVE đã hết hạn; là kết quả tính toán/DTO, **không field/cột phụ** trong entity.
- BaseEntity + AuditedEntity: cần tách vì bank_accounts không có updated_at. Không gộp theo ví dụ generic gây sai schema.
- Service interfaces/DTO request-response/mapper/security/storage packages là phân lớp đúng trách nhiệm. Backend trước audit137 Java files/7588 lines; việc chia lớp không tự chứng minh outscope. Lượt này bỏ2 classes nội bộ F4, không refactor dây chuyền phần đã chạy đúng.

Không thêm Dockerfile/Compose/microservice hoặc Supabase SDK/Auth/Storage chỉ để khắc phục cảm giác thiếu cấu hình. Supabase dùng PostgreSQL JDBC; local private storage là quyết định riêng đã chọn.

## 4. Thay đổi thực tế và giữ nguyên

**Bỏ:** `BankAccountLookupService.java`, `BankAccountPayeeDetails.java`, method `requireOwnedBankAccount` trong impl và assertions của interface đã bỏ. Composite FK/ref-delete test vẫn còn vì schema gốc thật có quan hệ đó.

**Thêm:** `.env.example`, `.env` ignored đã chuẩn bị; `application-supabase.properties`; `scripts/setup-supabase.ps1`, `scripts/GenerateJwtKeys.java`; quickstart Supabase, audit59 trường và [sơ đồ từng luồng](21_FUNCTION_1_FLOWS.md). Các key chỉ được tạo ở data directory ngoài repo, không trong JAR.

**Sửa cấu hình:** example local CORS thêmPUT/DELETE. Không đổi JWT algorithm, role/status enums, API signatures, input policies, entity fields hoặc SQL gốc.

**Tinh gọn dependency:** POM chuyển `spring-boot-starter-flyway`/`flyway-database-postgresql` sang test scope; packaged-app test tự chuẩn bị PostgreSQL fixture trước khi khởi động JAR. Không đổi dependency version hoặc bật schema generation ở runtime.

**Giữ:**32 HTTP operations và Postman collection/fixtures; không đổi collection bằng những endpoint tưởng tượng. P11 report READY_FOR_REVIEW vẫn là báo cáo của Agent, chưa tự APPROVED toàn bộ Postman.

## 5. Kiểm chứng lượt này

- Setup native key/storage hai lần: existing key hashes giữ nguyên; `.env` được Git ignore.
- Full `clean verify -Ppostgres-it` cuối ngày2026-10-15 sau khi chuyển Flyway test scope: **150/150**,42 Surefire +108 Failsafe, không failure/error/skip,2:33 phút. Lần trước đó2:31 phút cũng đạt. Không xóa test case để đạt số; bỏ assertions của helper F4 đã loại, giữ HTTP/FK/race/security tests.
- Executable JAR profile `supabase` đọc file `.env` trong CWD test, migrate fixture do probe bên ngoài app thực hiện trước; app giữ validate/Flywayfalse. Probe cuối: health200/UP, register201, CORS preflightPUT/DELETE200; trace `3e9a0a51-db2d-4700-9fd6-e712d39ad0e5` khớp. DataSource là PostgreSQL Testcontainer cô lập, **không Supabase thật**.
- Packaging và checksum/file inventory được ghi ở [report audit](reports/SCOPE_SUPABASE_AUDIT_REPORT.md).

Phần chờ user: review [luồng](21_FUNCTION_1_FLOWS.md), điền DB credentials vào `.env`, chạy profile `supabase`; schema/quyền/RLS/project thực chưa thể xác nhận bằng tests local.
