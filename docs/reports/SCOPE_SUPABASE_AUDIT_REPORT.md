# Audit scope, tinh gọn và cấu hình Supabase — READY_FOR_REVIEW

Thực hiện2026-10-15, chốt báo cáo2026-10-16 sau lượt gián đoạn. User yêu cầu audit đúng Function1/schema leader, bỏ phần dư, có sơ đồ từng luồng và runtime Supabase/.env. Đây là thay đổi trực tiếp theo yêu cầu mới; các report/review/prompt trước giữ nguyên lịch sử. User review [checklist](../20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md), [sơ đồ](../21_FUNCTION_1_FLOWS.md), [59 trường](../22_ENTITY_SCHEMA_FIELD_MAP.md) và [setup Supabase](../SUPABASE_SETUP.md).

## 1. Kết quả audit

| Bảng | Cột trong SQL leader | Entity | Kết quả offline |
|---|---:|---|---|
| customers | 14 | Customer | Không thiếu/dư/sai type/length/nullability/enum được kiểm tra |
| user_documents | 18 | UserDocument | FK customer/verifiedBy map đúng, không chép GPLX vào drivers |
| drivers | 5 | Driver | One-to-one customer, không roleDRIVER/car assignment |
| bank_accounts | 7 | BankAccount | Chỉ created_at, account number String, không updated_at |
| vouchers | 15 | Voucher | BigDecimal NUMERIC(14,0), không thêm created_by/customer_id hoặc redeem flow |

**Tổng5 entity/59 cột.** Reflection đọc cả inherited BaseEntity/AuditedEntity; so với SQL gốc về tên field/column, Java/SQL types, length, nullable, precision/scale, enum values và IDENTITY. DDL bodies5 bảng của migration test khớp SQL leader khi normalize comments/whitespace/public qualifier. Entity/schema/migration không bị sửa trong lượt này.

Ba file gốc trên Desktop khớp bản reference SHA256:

- schema.sql: `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8`.
- BACKEND_CONVENTIONS.md: `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518`.
- car_rental_conceptual.drawio: `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E`.

Không có production entity/controller/module cho cars/slots/orders/payments/payouts/disputes/reviews. DTO current eligibility/window/KYC là computed responses, không cột DB bổ sung. Không triển khai OTP/reset/refresh/Supabase Auth/cloud storage chỉ vì có cột hoặc dùng Supabase database.

## 2. Đã bỏ/tinh gọn

- Xóa `src/main/java/com/carrental/service/BankAccountLookupService.java` và `src/main/java/com/carrental/dto/internal/BankAccountPayeeDetails.java`.
- `BankAccountServiceImpl` bỏ interface và method `requireOwnedBankAccount` dành trước cho F4 chưa có consumer F1. Không đổi bank REST API, mask/owner/default/delete hoặc FK guards.
- Bỏ imports/injection/assertions của helper đã xóa trong `BankAccountPostgresIT` và `Function1WorkflowPostgresIT`. Giữ các test cases HTTP/rollback/ownership/FK/reference-delete/race hiện có.
- `pom.xml` chuyển hai Flyway dependencies sang **test scope**; không đổi version. `Function1ExecutableJarSmokeIT` dùng test harness tạo schema trên container trước, child production JAR giữ Flywayfalse. JAR không chứa Flyway/Testcontainers libraries.
- Không thêm Dockerfile/Compose/PostgreSQL local bắt buộc: runtime chính là Supabase. Docker của Agent trước đó phục vụ integration tests với image có sẵn, không là bằng chứng một runtime database đã được provision.

Không xóa ownership/transactions/locks/exact decimal/private-image checks chỉ để giảm file: chúng bảo vệ invariants F1 đã được yêu cầu và có regression lỗi thật. Source Java chính giảm137→135 files; helper Java sinh key nằm ngoài src/main/JAR, chỉ chạy một lần khi setup.

## 3. Đã chuẩn bị cách chạy

- `.env.example`: JDBC/session pooler/SSL, issuer/audience/key locations, CORS/private root, bootstrap ADMIN disabled.
- `.env` thực đã tạo từ template, được Git ignore. DB credentials còn để user cấu hình; báo cáo không đọc/in nội dung secret.
- `src/main/resources/application-supabase.properties`: native import `.env[.properties]`, schema public, validate/Flywayfalse/initnever, pool5/idle1. Không thêm dotenv/Supabase SDK dependency.
- `scripts/setup-supabase.ps1` + `scripts/GenerateJwtKeys.java`: JDK sinh RSA3072 PKCS8/SPKI ngoài repo và tạo private root; giữ key/config có sẵn. Không DB request/SQL/admin seed tự động.
- `.run/SBA301_Supabase.run.xml`: Application run config main class/profile/working directory, không secrets. XML đã parse; chưa tự bấm Run trong IntelliJ.
- `config/application-local.properties.example`: thêm PUT/DELETE vào CORS để không ghi đè thiếu methods.
- `README.md`/`AGENTS.md`: rút gọn điểm vào và khóa hướng Supabase/5 bảng; docs cũ có banner hướng về setup/audit mới. Chỉ cập nhật hợp đồng hiện hành để bỏ lookup F4, giữ mọi report/review/prompt lịch sử.

## 4. Kiểm chứng thực tế

| Kiểm tra | Kết quả |
|---|---|
| Setup script chạy hai lần | PASS; .env ignored, key hashes giữ nguyên qua lần2; không ghi đè config đã điền hoặc gọi database |
| Full verify lần đầu sau bỏ helper | PASS150/150,2:31 phút |
| Full verify cuối sau Flyway test scope | **BUILD SUCCESS150/150**,42 Surefire+108 Failsafe,0 failure/error/skip,2:33 phút; kết thúc2026-10-15 16:38:59 giờVN |
| Standard production JAR smoke | PASS health/auth/private documents/voucher; artifact SHA `63E335D2F8C079E5398E4B1F801DFDB69F566BEA2F0A27299D8D24FAE3C0DFD5` |
| Packaging probe cuối | PASS; local config/key/bootstrap/document markers/root path/private key entry/Boot helper đều không đóng gói |
| JAR entries kiểm tra riêng | Profile supabase có trong artifact; không .env, GenerateJwtKeys, helper F4 đã xóa, Flyway/Testcontainers runtime libs |
| Native .env/profile probe cuối | Standard `java -jar`, external CWD .env, PostgreSQL15.13 fixture do harness tạo trước. App validate/Flywayfalse; health200/UP, register201, CORS preflightPUT/DELETE200, trace `3e9a0a51-db2d-4700-9fd6-e712d39ad0e5` khớp |
| OpenAPI/Postman preservation | OpenAPI vẫn32 operations, collection vẫn112 requests và không bị sửa. Không chạy lại Newman112 mutations vào Supabase; report P11 cũ chưa phải reviewer approval mới |
| XML | POM/shared IntelliJ run config parse PASS |

Logs/probe artifacts ngoài repo trong TEMP:

- `sba301-scope-supabase-verify-final.log`.
- `sba301-scope-supabase-packaging-final.log`.
- `sba301-supabase-profile-probe-final.log`.
- `sba301-supabase-audit/entity-mapping.json` và helper probe tổng hợp.

Ngày2026-10-16 chỉ tiếp tục kiểm tra trạng thái/hash/links và chốt docs. Docker lúc chốt đang không có daemon sẵn sàng; không khởi động lại và không ghi là đã rerun integration ngày16. Kết quả test trên là kết quả thực ngày15, không suy ra connectivity cloud.

## 5. Bảo toàn, Git và giới hạn

- Nhánh BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; không stage/commit/push/deploy/reset/clean/stash/switch. Git files vốn untracked, nên tracked diff trống không đại diện cho thay đổi thực.
- Inventory đầu lượt272 untracked; trước thêm report279; cuối lượt đã kiểm tra **280 untracked**,0 staged/tracked diff. `.env` ignored không nằm trong số đó.
- Snapshot trước/sau của lượt15 xác nhận mọi entity/base entities, schema/reference/migration và report/review/prompt cũ giữ nguyên. Production code cũ chỉ `BankAccountServiceImpl` đổi để bỏ method F4; profile mới và dependency scopes là thay đổi cấu hình có chủ đích. POM hash hiện tại `5A0B0D033A1498E00A8601C7091003DFE78764CE68ED7A4EC093415A593C783B`.
- `.env` không được in hoặc đưa vào report/JAR; keys thật ngoài repo, không token/key contents trong báo cáo. TEMP residue cũ bị policy chặn giữ nguyên, không bypass.
- **Chưa liên hệ Supabase thật, chưa kiểm chứng schema/quyền/RLS/SSL của project thực.** User điền DB_URL/DB_USERNAME/DB_PASSWORD từ Supabase Connect rồi chạy app. Leader quản lý schema; không auto-DDL/baseline lên cloud.
- Storage ảnh hiện vẫn local private theo quyết định trước; Supabase ở đây là database. Không tự chuyển sang Supabase Auth/Storage. Deploy nhiều máy/full F2–F4 là phần việc khác.

Trạng thái: **READY_FOR_REVIEW** cho checklist/luồng/cấu hình mới. Điểm vào duy nhất để chạy là [SUPABASE_SETUP.md](../SUPABASE_SETUP.md); user có thể review [từng luồng](../21_FUNCTION_1_FLOWS.md) trước khi chốt nghiệp vụ tiếp.

Kiểm tra chốt2026-10-16:17 Markdown files có local links hợp lệ;12 Mermaid blocks có code fences cân bằng (không tuyên bố đã render bằng Mermaid CLI); POM/run-config XML parse hợp lệ;5 entity hashes và3 reference hashes vẫn đúng baseline. Không phát hiện .env/key helper/F4 classes/Flyway/Testcontainers libraries trong production JAR. Không chỉnh code thêm sau full verify cuối, chỉ hoàn thiện tài liệu và trạng thái.
