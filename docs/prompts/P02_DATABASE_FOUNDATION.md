# PROMPT P02 — Database, entity, enum và repository của Function 1

Bạn là Agent code tiếp tục SBA301 Car Rental tại `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`. Thực hiện đầy đủ prompt này, tạo báo cáo rồi dừng để review.

**P01 đã APPROVED sau P01-FIX-01.** Đọc `docs/reviews/P01_FIX_01_REVIEW.md` để biết phần nền tảng đã kiểm chứng. Lượt này triển khai P02, chưa triển khai P03.

## 1. Yêu cầu mới nhất và nguồn chuẩn

Người dùng xác nhận: **“Database leader đã gửi file đó mà, tôi làm function 1, theo database và entity mà leader giao đó.”**

Lấy `docs/reference/schema.sql` làm chuẩn cấu trúc vật lý. ERD là tài liệu đối chiếu; quy ước và lời mentor không được dùng để tự đổi schema. Không suy luận file SQL chứng minh Supabase đã có schema hoặc đang trống.

Đọc theo thứ tự:

1. `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md` và review P01-FIX-01.
2. `docs/01_FUNCTION_1_SCOPE.md`, phần persistence trong `docs/02_FUNCTION_1_ARCHITECTURE.md`.
3. `docs/04_DATABASE_REVIEW.md`, `docs/05_BACKEND_CONVENTIONS.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`.
4. Các đoạn SQL Function 1 và hàm/index/trigger liên quan; đọc file nguồn trực tiếp trước khi map entity.
5. Code/config/test hiện có, đặc biệt R1/R2 và hướng dẫn local.

**Điểm cần giữ:** bank_accounts trong schema leader chỉ có created_at. P02 map đúng hiện trạng, không tự thêm updated_at hoặc giả lập trường này. Đề xuất migration bổ sung đã nêu trong tài liệu cũ là điểm cần phối hợp leader, không phải một migration được giao ở P02.

## 2. Phạm vi và Git

Đầu ra của P02:

- Cấu hình PostgreSQL/JPA và Flyway phù hợp Boot 4.0.8.
- DDL baseline chỉ gồm phần F1 của schema leader để kiểm tra trên database cô lập.
- 5 entity, các enum đúng CHECK và 5 repository tối thiểu.
- Audit theo default/trigger hiện có; kiểm tra mapping và ràng buộc trên PostgreSQL thật.
- Tài liệu mapping, cách chạy, migration/integration và báo cáo có bằng chứng.

Không thêm service/controller nghiệp vụ, register/login, JWT/Security/CORS, bootstrap admin, storage/upload, KYC policy hoặc API voucher. Không tạo entity/bảng của Function 2–4, accounts/users/roles/permissions, cột version, index nghiệp vụ mới hoặc thay đổi kiểu dữ liệu của leader. Chưa cung cấp CRUD entity ra HTTP.

Nhánh người dùng chọn cho công việc là BE. Hiện có nhánh sửa `codex/function-1-p01-fix-01`; reviewer xác nhận hai HEAD trùng nhau và toàn bộ source/docs đang untracked. Trước khi sửa:

1. Chạy git status --short --branch, git branch và so sánh HEAD với BE.
2. Nếu vẫn cùng HEAD, chuyển về BE bằng git switch BE; giữ toàn bộ file hiện có. Không commit/stage/stash/reset/clean để ép chuyển nhánh.
3. Nếu hiện trạng đã thay đổi và không chuyển an toàn được, báo đúng tình trạng; không dùng switch -f hoặc ghi đè thay đổi.
4. Không tạo thêm nhánh hoặc commit/push/deploy trong P02. Cập nhật docs ghi đúng nhánh thực tế.

## 3. Bước 1 — Kiểm tra môi trường và thêm dependency đúng phiên bản

Giữ Java 21, Boot 4.0.8, Maven Wrapper/Maven hiện có. Dùng dependency management của Boot, không override Hibernate/Flyway/Testcontainers ngẫu nhiên để sửa lỗi tương thích.

Thêm dependency cần thiết:

- `org.springframework.boot:spring-boot-starter-data-jpa`.
- `org.postgresql:postgresql` ở runtime.
- `org.springframework.boot:spring-boot-starter-flyway` và `org.flywaydb:flyway-database-postgresql`.
- Test PostgreSQL: Testcontainers và hỗ trợ Spring Boot theo nhu cầu. BOM hiện tại quản lý artifact Testcontainers 2 có tên `testcontainers-postgresql`, `testcontainers-junit-jupiter`; kiểm tra import/artifact thực tế, tránh chép tên/API từ bản cũ.
- Nếu dùng DataJpaTest, dùng module test/import tương thích Boot 4; có thể chọn SpringBootTest với PostgreSQL để kiểm tra cả Flyway và Hibernate validation.
- Lombok chỉ thêm nếu thực sự dùng và cấu hình annotation processing đúng. Không cần thêm thư viện mapper/OpenAPI/Security trong lượt này.

Kiểm tra Docker bằng docker version. Khi reviewer chạy, Docker CLI đã có nhưng engine chưa hoạt động; đây là quan sát môi trường, không chứng minh mọi lần sau đều như vậy. Có thể khởi động Docker Desktop đã cài để chạy kiểm tra local; nếu dùng Start-Process thì chạy WindowStyle Hidden. Không cài runtime mới hoặc xóa container/volume của người dùng để chữa lỗi. Chỉ tạo/dọn tài nguyên test do lượt này quản lý.

Không dùng H2 thay PostgreSQL cho các ca trigger, partial index, CHECK và expression index. Nếu Docker/PostgreSQL chưa chạy được, vẫn hoàn thành code/test/docs độc lập, báo chính xác phần chưa kiểm chứng và tiếp tục giải quyết môi trường trong phạm vi được giao. Không biến skip thành PASS.

## 4. Bước 2 — Cấu hình runtime và tách kiểm tra HTTP khỏi DB

Thiết lập:

- `spring.jpa.hibernate.ddl-auto=validate`.
- `spring.jpa.open-in-view=false`.
- `spring.sql.init.mode=never`; dùng một cơ chế migration, không đồng thời schema.sql/data.sql tự chạy.
- Cấu hình datasource lấy từ biến môi trường hoặc config local ngoài JAR. Example chỉ có placeholder; giữ bảo vệ đóng gói và Git ignore của P01-FIX-01.
- Tắt Flyway tự migrate mặc định; chỉ bật tường minh trong môi trường PostgreSQL cô lập của P02. Giữ baseline-on-migrate=false, validate-on-migrate=true và clean-disabled=true.
- Chọn location riêng, ví dụ `classpath:db/migration/function1`, và tài liệu hóa rằng baseline này dùng cho DB local/test trống. Không gọi đây là thứ tự migration chung đã được leader duyệt.
- Không log SQL bind parameters, mật khẩu, URL có credential hoặc DTO nhạy cảm.

App có persistence sau P02 cần datasource hợp lệ khi chạy đầy đủ. Không để tài liệu tiếp tục nói bản P02 chạy toàn bộ mà không cần DB.

13 kiểm tra nền tảng P01 phải tiếp tục có ý nghĩa và không phụ thuộc credential DB chung. Có thể cô lập web/Clock test bằng slice hoặc cấu hình test loại riêng auto-configuration DB/Flyway/JPA. Dùng import/tên lớp Boot 4 thật. Test external-config phải tiếp tục chứng minh file ngoài classpath được nạp; điều chỉnh context test nếu cần nhưng giữ assertion và nêu lý do.

Không loại auto-configuration DB ở application production, đặt ddl-auto=none, mock repository trong PostgreSQL tests hoặc tắt validation để che mapping lỗi. Fixture `/__test` chỉ ở test source.

## 5. Bước 3 — Trích baseline F1 chính xác từ SQL leader

Tạo migration local/test mới, ví dụ `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql`. Baseline chỉ chứa:

- Hàm vn_now() và set_updated_at() có cùng semantics như nguồn.
- customers, user_documents, drivers, bank_accounts, vouchers với đủ cột/type/nullability/default/identity/FK/UNIQUE/CHECK của nguồn.
- Các index F1: uq_customers_email_lower, uq_user_doc_approved, uq_bank_default_per_customer, idx_user_documents_customer, idx_bank_accounts_customer; giữ các UNIQUE khác trong table definition.
- Trigger cập nhật updated_at cho đúng 4 bảng đã có cột: customers, user_documents, drivers, vouchers. Dùng tên và hành vi tương ứng nguồn, khai báo từng bảng cụ thể.
- Bật RLS đúng 5 bảng F1 rõ ràng theo nguồn. Không thêm policy/grant hoặc chạy vòng lặp áp dụng cho mọi bảng public. Tài liệu phải ghi owner của DB test thường vượt RLS; test này chưa chứng minh quyền CUSTOMER/ADMIN của API.

Không thêm bank_accounts.updated_at/trigger update audit cho bảng đó. Không cần btree_gist hoặc các trigger/order/slot của function khác. Không copy toàn bộ file schema.sql vào migration rồi chạy.

Không dùng IF NOT EXISTS cho toàn bộ table/index để bỏ qua schema drift. Chạy lại qua Flyway history, không chạy lại DDL trực tiếp. Không sửa docs/reference, tự baseline schema đang có, repair history, bật clean hoặc chạy SQL lên Supabase/database chung.

Kiểm tra baseline trên DB trống do test tạo. Việc kiểm chứng local không chứng minh database chung đã được nâng cấp. Database dùng chung và migration của cả nhóm vẫn do leader phối hợp; báo rõ điều này, không yêu cầu người dùng đổi schema để hoàn tất mapping F1.

## 6. Bước 4 — Map entity và audit đúng cột hiện có

Tạo package entity và entity/base theo cấu trúc dự án. Đề xuất hai mapped superclass nhỏ:

- BaseEntity: Long id identity + LocalDateTime createdAt.
- AuditedEntity extends BaseEntity: thêm LocalDateTime updatedAt.
- Customer, UserDocument, Driver, Voucher extends AuditedEntity.
- BankAccount extends BaseEntity.

Có thể chọn tên khác có nghĩa nếu đơn giản tương đương. Không ép BankAccount kế thừa một cột không tồn tại; không dùng @Transient updatedAt hay gán updatedAt=createdAt để giả audit. Không có setter nhận ID/audit từ client.

| Entity | Những điểm cần kiểm tra kỹ |
|---|---|
| Customer | full_name/email VARCHAR(150), phone(20), password_hash(255), address(300), avatar_url(500); LocalDate dateOfBirth; boolean emailVerified; KYC/role/status tách riêng; không có bảng account khác |
| UserDocument | Quan hệ customer bắt buộc và verifiedBy nullable đều tới customers; doc_number(50), license_class(10), front_image_url bắt buộc/back optional(500); verified_at là LocalDateTime, các ngày còn lại là LocalDate; giữ đầy đủ metadata và reject_reason(500) |
| Driver | customer_id NOT NULL UNIQUE: một customer tối đa một driver. Không thêm số bằng/hạng/hạn vào drivers vì chúng nằm ở user_documents |
| BankAccount | accountNumber là String(30) để giữ số 0 đầu; bankName(100), accountHolder(150); is_default khớp boolean; chỉ created_at; giữ UNIQUE(id, customer_id) phục vụ payout sau này |
| Voucher | code(50), description(300), discountType/status; BigDecimal cho 3 số tiền/value với precision14 scale0; startAt/endAt LocalDateTime; usageLimit nullable, perUserLimit/usedCount bắt buộc; không có association tới order của F3 |

Tất cả field còn lại, nullable/default phải đối chiếu trực tiếp SQL, không chỉ bảng tóm tắt này. ID dùng Long và GenerationType.IDENTITY phù hợp GENERATED ALWAYS AS IDENTITY; không tự gán ID trong fixture JPA.

Quan hệ customer và verifiedBy tải LAZY; driver có thể dùng OneToOne LAZY hoặc ManyToOne LAZY với uniqueness đúng DB. Không thêm collections hai chiều nếu chưa có use case. Không dùng EAGER, cascade REMOVE/ALL hoặc orphanRemoval để tạo đường xóa lịch sử. FK ON DELETE CASCADE trong DB vẫn giữ theo nguồn; P02 không expose customer delete.

Audit do DB sinh qua default/trigger. Map insert/update đúng để Hibernate không gửi null/giá trị tự tạo đè lên default. Dùng cơ chế đọc generated values phù hợp Hibernate do Boot quản lý, ví dụ @Generated với event đúng, hoặc refresh có chủ đích khi ghi; kiểm tra entity nhận audit sau flush, không chỉ nhìn row SQL. Không đồng thời dùng JPA auditing/CreationTimestamp/UpdateTimestamp hay PrePersist tự đặt audit từ Java.

createdAt không thay đổi khi update; updatedAt của 4 bảng được trigger sinh. vn_now() dùng transaction timestamp: không assert updatedAt phải lớn hơn createdAt khi insert/update cùng transaction. Kiểm tra bằng hai transaction khác nhau hoặc fixture lịch sử có thời gian xác định; tránh test phụ thuộc sleep.

Các trạng thái mặc định Java khi tạo entity phải khớp server/DB: Customer CUSTOMER/ACTIVE/NONE/emailVerified=false; UserDocument PENDING; Driver PENDING; BankAccount default=false; Voucher ACTIVE/usedCount=0/minOrderAmount=0/perUserLimit=1. Không tự mặc định trường bắt buộc như password/discountType/thời gian voucher. Default Java không thay thế kiểm tra default SQL.

Không dùng Lombok Data trên entity; toString/equals/hashCode không được kéo LAZY relation, lộ passwordHash/số giấy tờ/số tài khoản hoặc gây đệ quy. Entity không phải request/response DTO. Không thêm JsonIgnore rồi expose entity qua controller.

## 7. Bước 5 — Enum đúng CHECK, chưa viết luật chuyển trạng thái

| Enum | Giá trị đúng nguồn |
|---|---|
| Role | CUSTOMER, ADMIN |
| CustomerStatus | ACTIVE, LOCKED |
| KycStatus | NONE, PENDING, VERIFIED, REJECTED |
| UserDocumentType | CITIZEN_ID, DRIVER_LICENSE, PASSPORT |
| DocumentVerifyStatus | PENDING, APPROVED, REJECTED |
| DriverStatus | PENDING, ACTIVE, SUSPENDED |
| DiscountType | PERCENT, FIXED |
| VoucherStatus | ACTIVE, INACTIVE |

Enum có JavaDoc ngắn giải thích từng giá trị. Dùng EnumType.STRING và mapping tương thích VARCHAR của SQL; nếu Hibernate cần cấu hình để không dùng native PostgreSQL enum, chọn cách rõ ràng và chứng minh bằng schema validation/round-trip. Không đổi DB sang enum native hoặc lưu ordinal.

Không thêm OWNER/STAFF/DRIVER vào Role, EXPIRED/REVOKED vào document hay role động. Enum chỉ định danh; switch kiểm tra transition sẽ được viết tại service ở prompt nghiệp vụ tương ứng, không dựng sẵn luật KYC/driver chưa chốt.

## 8. Bước 6 — Repository tối thiểu có scope và điểm khóa

Tạo CustomerRepository, UserDocumentRepository, DriverRepository, BankAccountRepository, VoucherRepository. Chỉ thêm query đang cần cho nền tảng và các use case F1 đã được mô tả, không generic CRUD service.

- Customer: lookup/exists email không phân biệt hoa thường theo lower(email); exists phone; query findByIdForUpdate với PESSIMISTIC_WRITE để các prompt sau khóa customer. Không tải tất cả account rồi lọc.
- UserDocument: findById và customerId cùng điều kiện; danh sách theo customerId có Pageable; danh sách theo verifyStatus cho admin; điểm query phục vụ kiểm tra giấy tờ APPROVED theo type/number khi cần.
- Driver: lookup theo customerId và lookup theo id cùng owner; giữ uniqueness driver/customer.
- BankAccount: lookup id cùng customerId; danh sách owner, lookup default owner; không có query trả toàn bộ số tài khoản ra HTTP và không triển khai đổi default ở P02.
- Voucher: lookup code, exists code và findByIdForUpdate. Chuẩn hóa code trước persist sẽ ở P09; không tự đổi unique index của leader sang upper(code).

Có thể dùng derived query, JPQL hoặc Specification khi cần. Field/path phải đúng mapping thực tế. Mọi list owner phải lọc trong SQL trước page/count; test bằng hai customer. Lock method cần transaction của caller; không tự gọi transaction và trả entity sau khi lock đã hết rồi tuyên bố đã bảo vệ use case.

Không sửa usedCount, viết reserve/release, query rental_orders, payout hoặc thêm stub entity/bảng để làm repository chạy. Không viết hàng loạt query dự kiến không được dùng/kiểm tra.

## 9. Bước 7 — Kiểm tra trên PostgreSQL thật

Ưu tiên Testcontainers PostgreSQL, pin image theo major 15+ phù hợp schema nguồn và ghi chính xác version đã chạy. Container/DB mới chỉ phục vụ test. Nếu dùng PostgreSQL có sẵn thay thế, phải là DB test cô lập được phép ghi, không dùng credential/database chung từ máy một cách ngầm định.

Unit/web test chạy không cần DB chung. Nếu tách integration tests tên *IT qua Failsafe và profile postgres-it, cấu hình sao cho lệnh sau chạy thực sự tất cả test PostgreSQL:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

Nếu không tách Maven profile, dùng clean verify tương đương và ghi rõ. Không dùng disabledWithoutDocker/assumeTrue để biến việc chưa chạy integration thành kết quả đạt. Nếu lệnh chỉ chạy web/unit, báo riêng phạm vi đó. Không yêu cầu một số test cố định để đạt; test phải kiểm tra hành vi sau:

| Nhóm | Bằng chứng cần có |
|---|---|
| Migration | Migrate DB trống; chỉ đúng 5 table F1 ngoài Flyway history; hàm/index/trigger đúng; bank không có updated_at; migrate lần 2 không làm mất dữ liệu hoặc tạo trùng; validate history đạt |
| Mapping | EntityManagerFactory khởi động với ddl-auto=validate; save/flush/clear/load cả 5 entity, ID do DB sinh, enum đúng, dates/BigDecimal/null fields round-trip; bank account số 0 đầu còn nguyên |
| Audit | DB default và trigger hoạt động cho 4 bảng, createdAt không bị đổi; audit được đọc vào entity sau ghi; bank createdAt tồn tại và schema không có audit giả; vn_now vẫn trả giờ VN khi DB session timezone khác |
| Customer | Email khác hoa thường bị UNIQUE chặn; phone trùng bị chặn; defaults SQL đúng; lookup email và row lock query hoạt động trong transaction |
| Document | Nhiều PENDING cùng type/number được phép; hai APPROVED cùng type/number bị chặn; GPLX thiếu license_class và khoảng ngày sai bị CHECK chặn; customer/verifiedBy FK đúng |
| Driver | Driver thứ hai của cùng customer bị UNIQUE chặn; status mapping đúng |
| Bank | Trùng customer/bank/number bị chặn; hai default cùng owner bị chặn nhưng hai owner được có default riêng; UNIQUE(id, customer_id) tồn tại; 0 hoặc 1 default được phép |
| Voucher | Code trùng bị chặn; percent >100, discount <=0, tiền âm, thời gian đảo, quota không hợp lệ và usedCount vượt usageLimit bị CHECK chặn; nullable quota hợp lệ; maxDiscount=0 giữ nguyên |
| Enum/FK | CHECK từ chối giá trị ngoài tập và FK từ chối owner không tồn tại; kiểm tra bằng SQL khi Java enum không thể biểu diễn giá trị sai |
| Query scope | Hai customer có dữ liệu: scoped detail không trả row người khác; page content và totalElements chỉ đếm owner; query status/lookup trả đúng |
| Regression P01 | Health/envelope/trace/MDC, Clock/external profile, JSON/form validation và 404/405/415/500 vẫn đạt; local file và marker không vào artifact |

Không chỉ test annotation/getter hoặc mock repository trả đúng dữ liệu fixture. Dùng SQL để kiểm tra constraint thật và JPA để kiểm tra mapping thật. Mỗi ca constraint thất bại phải có transaction được rollback/cô lập đúng; đừng tiếp tục dùng một transaction PostgreSQL đã abort rồi coi lỗi kế tiếp là constraint khác.

Không tuyên bố ownership API/security, chống hai admin duyệt, driver eligibility, đổi bank default transaction hay quota reservation đã hoàn tất chỉ vì ràng buộc DB đạt. Các use case đó thuộc P03–P09.

Không assert DB tự từ chối mọi số lẻ chỉ vì NUMERIC(14,0): PostgreSQL có thể làm tròn khi ép scale. Validation request số tiền/phần trăm là phần P09; P02 chứng minh mapping/type và CHECK đang có.

## 10. Bước 8 — Tài liệu, báo cáo và điểm dừng

Tạo `docs/09_FUNCTION_1_PERSISTENCE.md` gồm:

- Ma trận đủ field Java ↔ cột SQL của 5 entity: type, length/precision/scale, nullable/default, enum, relation, audit.
- Danh sách constraint/index/trigger từ leader, phần trích vào local baseline và cách kiểm tra.
- Cách audit DB được đọc sau insert/update; bank chỉ có createdAt, đề xuất updated_at vẫn chờ leader.
- Địa điểm migration, cấu hình bật/tắt, lệnh tạo DB test/cách chạy và phân biệt local baseline với migration chung.
- Hợp đồng repository/lock, owner filtering và những phần nghiệp vụ/security chưa làm.
- Cách tích hợp sau này với DB leader đã có schema: cần đối chiếu schema/history và thứ tự migration do nhóm quản lý; không hướng dẫn baseline-on-migrate=true hoặc chạy V1 tạo lại bảng trên DB đó.

Cập nhật LOCAL_DEVELOPMENT.md và example config theo hành vi thật sau P02. Không ghi credential hoặc tạo file local thật đè file đang có. Cập nhật AGENTS.md, README, roadmap và IMPLEMENTATION_STATUS khi đã làm; không sửa report/review lịch sử hoặc reference.

Tạo `docs/reports/P02_REPORT.md` sau khi thực hiện. Báo cáo phải có:

1. Kết quả từng bước, danh sách file mới/sửa và vai trò, gồm cả untracked files.
2. Mapping 5 bảng và 8 enum; mọi khác biệt so với schema leader. Mục tiêu là không có khác biệt schema; bank chưa thêm updated_at.
3. Runtime/schema PostgreSQL đã dùng, baseline/history/index/trigger thực tế; không in credential.
4. Lệnh thật đã chạy, số unit/web/integration test riêng, failures/errors/skipped, đường dẫn Surefire/Failsafe; phân biệt full verify và packaging probe skip test.
5. Bằng chứng mapping/audit/constraint/query scope và regression P01.
6. Kết quả bật lại app với DB test, health web và trace; DB schema validation là bằng chứng riêng, không suy diễn từ health UP.
7. Git branch/status, danh sách untracked và xác nhận docs/reference nguyên trạng.
8. Hạn chế thật: integration DB chung chưa kiểm tra, RLS role/grant runtime chưa chốt, nghiệp vụ/security chưa triển khai. Không biến những hạn chế này thành yêu cầu mở rộng ngoài Function 1.

Đủ kiểm tra thì P02 READY_FOR_REVIEW. Nếu còn kiểm tra PostgreSQL bắt buộc chưa chạy/không đạt, ghi IN_PROGRESS cùng phần thiếu, không tự APPROVED. Dừng sau báo cáo; P03 chỉ thực hiện khi có prompt tiếp theo.

## 11. Nguồn kỹ thuật chính thức

- [Boot 4.0.8 managed coordinates](https://docs.spring.io/spring-boot/4.0/appendix/dependency-versions/coordinates.html): kiểm tra artifact/version được BOM quản lý, đặc biệt các module Boot 4 và Testcontainers.
- [Spring Boot database initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html): cơ chế Flyway và location; kiểm tra lại package/API đúng version đang dùng.
- [Boot 4.0 Testcontainers](https://docs.spring.io/spring-boot/4.0/reference/testing/testcontainers.html): service connection và vòng đời container theo test context.
- [Hibernate Generated](https://docs.hibernate.org/orm/7.2/javadocs/org/hibernate/annotations/Generated.html): giá trị DB sinh và event insert/update; đối chiếu phiên bản Hibernate thực tế của dependency tree.
- [Flyway baseline-on-migrate](https://documentation.red-gate.com/fd/flyway-baseline-on-migrate-setting-277578974.html): không tự bật baseline cho schema chung chưa được xác nhận.

Những nguồn này hướng dẫn framework; tên bảng/cột/constraint và phạm vi nghiệp vụ vẫn theo leader và người dùng.
