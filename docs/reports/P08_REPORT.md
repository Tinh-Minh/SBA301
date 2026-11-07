# P08 — Báo cáo triển khai tài khoản ngân hàng

**Trạng thái:** `READY_FOR_REVIEW`  
**Phạm vi:** P08, Function 1 bank accounts và internal ownership lookup cho F4. P09 chưa triển khai.  
**Branch/HEAD:** `BE`, `2fe712eed12a2af3b61f0a5311bdd3901f614029` (`origin/BE` đồng bộ).  
**Database:** chỉ PostgreSQL 15.13 Testcontainers cô lập; không kết nối DB chung. Không commit/push.

## Kết quả

Đã hoàn tất 9 bước theo [P08 prompt](../prompts/P08_BANK_ACCOUNTS.md). Implementation giữ U-16/U-17/U-18 và schema leader. Full `clean verify -Ppostgres-it` và packaging probe đều PASS; không có failure, error hoặc skipped tests. Actual Boot executable JAR/CWD regression chạy trong Failsafe.

Chưa kiểm chứng trên database production/chung, chưa tích hợp full payout flow F4, chưa kiểm chứng Windows production ACL, multi-node deployment, throughput hoặc benchmark. P08 chỉ kiểm thử quan hệ FK bằng test-only fixture; kết quả đó không phải kiểm thử full F4.

## Hiện trạng môi trường

- Root đúng: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; nhánh `BE`; `HEAD` và `origin/BE` cùng `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Windows 11 amd64; Oracle JDK `21.0.8`; Maven Wrapper dùng Maven `3.9.11`; Docker client/server `28.5.2`.
- `JAVA_HOME` ban đầu chưa được đặt trong PowerShell. Lệnh Wrapper vì thế được chạy sau khi đặt `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'`; không in danh sách environment variables.
- Working tree từ trước đã có project files ở trạng thái untracked (xem Git snapshot bên dưới); không có staged/tracked diff. Đã giữ nguyên tài liệu và toàn bộ file có trước.

## Phần triển khai

- Năm route HTTP: create, owner-only list/detail, set default, delete. CUSTOMER/ADMIN ACTIVE chỉ thao tác bank account của chính mình; ADMIN không đọc chéo. Create trả 201 + Location. Success responses no-store, dùng response DTO riêng đã mask.
- Strict create JSON và paging/sort parser: allowlist field, duplicate/unknown/type/presence checks, query checks, ID validation. Request strings strip hai đầu, giới hạn theo code point, giữ case và leading zero; không làm lookup/đối soát ngân hàng.
- U-16: chỉ `makeDefault=true` mới tạo default; omitted/false kể cả account đầu tiên là non-default. U-17: xóa default unreferenced có thể để lại zero defaults, không promote peer. U-18: không có endpoint sửa payee fields.
- Ghi theo shared advisory → customer row → bank row locks; đọc lại owner role/status sau khi chờ. Clear/flush xảy ra trước set/insert default trong cùng transaction. Lỗi rollback giữ trạng thái cũ; success log after-commit; no-op không ghi mutation event.
- Exact SQLState/constraint handling: duplicate `(customer_id, bank_name, account_number)` `23505` → 409; `uq_bank_default_per_customer` `23505` → 409; composite payout FK `payouts_bank_account_id_recipient_id_fkey` `23503` → 409 on delete; actual lock timeout `55P03` → 503. Constraint khác không bị gán nhầm thành duplicate/FK conflict.
- Nội bộ có `BankAccountLookupService.requireOwnedBankAccount(bankAccountId, recipientId)`. Full payee data chỉ nằm trong immutable internal DTO với `toString()` redacted; không expose trong HTTP/log.
- Bodyless PATCH/DELETE từ chối query và mọi byte payload ở ingress trước multipart parsing. Trace vẫn dùng `X-Request-ID` và envelope chung. `application.properties` cho phép DELETE qua CORS.
- Không thêm dependency, entity, cột/index/table/migration, `updated_at`, payout module hay voucher endpoint. Không sửa `docs/reference/`.

## File tạo/sửa và vai trò

### Production code/config

| File | Vai trò |
|---|---|
| `src/main/java/com/carrental/controller/BankAccountController.java` | Năm route P08, envelope, Location/no-store và bodyless/query guard |
| `src/main/java/com/carrental/dto/request/bankaccount/CreateBankAccountRequest.java` | JSON allowlist, presence, kiểu boolean, duplicate/unknown-field rejection |
| `src/main/java/com/carrental/dto/request/bankaccount/BankAccountListQuery.java` | Page/size/sort allowlist và pageable có ID tie-break |
| `src/main/java/com/carrental/dto/response/BankAccountResponse.java` | HTTP response chỉ chứa fields đã mask |
| `src/main/java/com/carrental/mapper/BankAccountMapper.java` | DTO mapping và code-point-safe account mask |
| `src/main/java/com/carrental/dto/internal/BankAccountPayeeDetails.java` | Internal full-payee snapshot, redacted `toString()` |
| `src/main/java/com/carrental/service/BankAccountService.java` | Service interface HTTP banking operations |
| `src/main/java/com/carrental/service/BankAccountLookupService.java` | Scoped internal lookup contract cho F4 |
| `src/main/java/com/carrental/service/BankAccountChangeLogger.java` | Safe after-commit/failure events |
| `src/main/java/com/carrental/service/impl/BankAccountServiceImpl.java` | Ownership, locks, validation, transactions, conflict mapping |
| `src/main/java/com/carrental/exception/ErrorCode.java` | Bank duplicate/default/FK conflict codes |
| `src/main/java/com/carrental/repository/BankAccountRepository.java` | Owner-scoped list/detail and ordered pessimistic-lock queries |
| `src/main/java/com/carrental/web/RequestTraceFilter.java` | Bodyless PATCH/DELETE ingress guard before multipart resolution |
| `src/main/resources/application.properties` | CORS allowed methods include DELETE |

### Regression và tài liệu

| File | Vai trò |
|---|---|
| `src/test/java/com/carrental/BankAccountPostgresIT.java` | 11 PostgreSQL/HTTP/JWT/security/concurrency tests |
| `docs/15_BANK_ACCOUNTS.md` | API, masking, U-16/U-17/U-18, lock/error semantics và F4 boundary |
| `docs/reports/P08_REPORT.md` | Báo cáo bằng chứng lượt này |
| `AGENTS.md`, `README.md` | Cập nhật trạng thái và hướng dẫn hiện hành |
| `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md` | Cập nhật implementation/API state |
| `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md` | Cập nhật M6, quyết định và roadmap theo thực tế |
| `docs/09_FUNCTION_1_PERSISTENCE.md` | Ghi contract truy vấn/khóa, giữ map schema leader |
| `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md`, `docs/14_DRIVER_PROFILE_ELIGIBILITY.md` | Đồng bộ trạng thái hiện hành; xác nhận P08 không đổi security, storage, KYC hoặc driver |
| `docs/README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md` | Index, lịch sử trạng thái và lệnh kiểm tra hiện tại |

Các file `docs/reference/`, entity `BankAccount`, leader schema và migration không bị sửa. `pom.xml` không đổi.

## Đối chiếu 9 bước P08

| Bước | Kết quả |
|---|---|
| 1. Đọc nguồn, hiện trạng, phạm vi | Đọc AGENTS, status, scope/conventions/API/database/decisions/local guide, prompt đầy đủ và code patterns; xác nhận BE/HEAD và giữ nguyên untracked files |
| 2. Xác nhận schema và API boundary | Giữ đúng bank schema leader, chỉ `created_at`; không mở rộng sang payout/voucher/F4 workflow |
| 3. DTO/query/service/repository | Strict request/query DTO, masked response, internal sensitive snapshot, interface/implementation và owner-scoped ordered-lock repository queries |
| 4. Năm HTTP endpoints | POST/list/detail/default/delete triển khai với owner/status/security, body/query rejection, no-store/trace và không có full-number route |
| 5. Transaction/default ordering | Shared advisory → customer → bank locks; clear/flush trước set/insert; rollback giữ default; PostgreSQL race evidence |
| 6. Error/logging | Exact SQLState+constraint mappings, safe diagnostics, after-commit success, no success event cho no-op/rollback |
| 7. F4 internal lookup | Owner-scoped lookup theo bankId + recipientId, full data chỉ trong internal DTO; composite FK fixture chỉ trong Testcontainers |
| 8. Verification | Targeted P08 11/11; full clean verify 137/137; packaging probe và actual Boot JAR/CWD regression PASS |
| 9. Docs/report/stop | Tạo contract/report, cập nhật current docs/status, link check PASS; READY_FOR_REVIEW, P09 NOT_STARTED |

## Lệnh và kết quả

`JAVA_HOME` được đặt cho các lệnh Maven. Lần chạy targeted cuối trước full verify:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B -Ppostgres-it '-Dit.test=BankAccountPostgresIT' verify
```

Kết quả: **PASS**, `BankAccountPostgresIT` 11/11, Surefire 38/38, 0 failure/error/skip.

Full verification:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
& .\mvnw.cmd -B clean verify -Ppostgres-it
```

Kết quả: **PASS**, thời gian Maven 3:02 phút, exit code 0. Surefire **38/38**; Failsafe **99/99**; tổng **137/137**, 0 failure, 0 error, 0 skipped. Log lưu ngoài repository/`target`: `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p08-clean-verify-20261014-181711.log`.

Failsafe suites: Auth 14, BankAccount P08 11, Customer management 17, Driver concurrency 6, Driver profile 12, Function1 7, actual Boot JAR storage 1, UserDocument 16, UserDocument review 15. Surefire: CustomerProperties 1, DriverEligibilityPolicy 2, JWT configuration 4, KYC policy 4, platform HTTP 13, private document storage 7, CustomerStatusLock 1, StorageRootPolicy 4, UserDocument transaction outcome 2. P01–P07 regression suites cùng chạy trong full verify.

Packaging probe:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
& .\scripts\verify-local-config-packaging.ps1
```

Kết quả: **PASS**, probe build executable JAR từ temporary copy; `application-local.properties`, fake local/private-key/bootstrap/document markers, storage root path, private key entry và test Boot root helper đều không được đóng gói. Probe không chạy tests trong temporary copy; full regression ở lệnh phía trên. Probe không thay đổi source tree.

Full suite có `StorageRootBootJarIT` **1/1 PASS**: actual Boot JarLauncher chạy JAR từ unrelated working directory; project/config/public/target/custom/arbitrary roots bị reject, external root accepted, disabled storage không tạo root, đường dẫn có space/percent/Unicode pass.

### HTTP, SQL constraint, rollback và concurrency evidence

- Health được gọi qua HTTP trong app integration context dùng PostgreSQL 15.13. Quan sát: HTTP 200; `success=true`, `code=OK`, `data.status=UP`, `errors=[]`; `traceId=8ca75b17-9a59-43b9-8a7a-4eaabb2d1945` trùng `X-Request-ID`. Envelope và trace được assert trong test. Log chuyển tiếp qua Windows console thay ký tự dấu tiếng Việt trong field `message`; không ảnh hưởng response assertions.
- Default race: holder PID 62, waiter PID 63, `pg_blocking_pids=[62]`; observer không thấy trạng thái intermediate default trước commit. Sau release hai request HTTP tuần tự, DB chỉ giữ một default.
- Default/delete race: holder PID 62, waiter PID 63, blocker được PostgreSQL xác nhận; sau release, PATCH rồi DELETE thành công, target bị xóa và remaining defaults = 0 đúng U-17.
- FK reference/delete race: reference holder PID 64, delete waiter PID 62, `pg_blocking_pids=[64]`; sau reference commit DELETE trả 409. Wrong-recipient composite reference bị PostgreSQL chặn thực tế với `23503`; bank row/default/created_at còn nguyên.
- P04→P08: blocker PID 64, P04 waiter PID 63, bank waiter PID 62; PostgreSQL báo P04 bị chặn bởi `[64]`, bank waiter bởi `[64, 63]`. Sau P04 khóa actor và commit, request bank dùng JWT cũ trả 401 `INVALID_TOKEN`, bank không đổi.
- Lock timeout: blocker PID 64, waiter PID 63, `pg_blocking_pids=[64]`; database `55P03` được chuyển thành HTTP 503 `DEPENDENCY_UNAVAILABLE`, giữ nguyên state và trace, không log SQLSTATE/raw message/token; sau release retry trả 200 và đổi default.
- Unit/HTTP assertions kiểm tra no-token/invalid/LOCKED, CUSTOMER và ADMIN own account, foreign/missing 404, page/filter/sort owner scope, strict JSON/bodyless/query, short/full/Unicode masking, leading zero/case, exact duplicate/default indexes, unrelated constraint, after-commit/no-op/rollback logs và không leak payee sentinel. Test-only payouts table dùng đúng composite FK, không có production migration/entity/controller.

Các dòng P08 evidence trong log: `P08_DEFAULT_RACE`, `P08_FK_RACE`, `P08_DEFAULT_DELETE`, `P08_P04_RECHECK`, `P08_LOCK_TIMEOUT`, `P08_HEALTH`.

## Schema/reference hashes

So với hashes được ghi trong P07 approved report, SHA-256 trước/sau không đổi:

| File | SHA-256 |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

Không sửa schema/reference/migration hoặc chạy SQL lên database chung.

## Git snapshot và diff

```text
## BE...origin/BE
?? .gitignore
?? .mvn/
?? AGENTS.md
?? README.md
?? config/
?? docs/
?? mvnw
?? mvnw.cmd
?? pom.xml
?? scripts/
?? src/
```

Toàn repository vốn đang untracked khi bắt đầu; các file P08 nằm trong những nhóm này. Branch không ahead/behind `origin/BE`. `git diff --stat`, `git diff --cached --stat`, `git diff --numstat` rỗng; không có staged/tracked changes. Diff trống ở đây không có nghĩa implementation không đổi: file inventory P08 được liệt kê ở trên và P08 files mới/sửa đều untracked trong checkout này. Không stage/commit/push.

## Reruns và lưu ý

Trong lượt phát triển, targeted runs đầu tiên phát hiện bodyless multipart cần chặn trước multipart resolver, test spy rollback cần cô lập stubbing, và concurrency P04→P08 cần xác nhận waiter qua PostgreSQL thay vì dựa trên scheduling. Đã sửa ingress guard và test gates/observer; targeted cuối 11/11 cùng full 137/137 PASS. Bộ đếm của lần targeted thất bại ban đầu không được giữ lại sau `clean`; không báo các lượt đó là PASS.

Build có warning Java deprecated API nhưng không có compile/test error. Windows `JAVA_HOME` cần được set cho Wrapper trong phiên PowerShell. Chưa kiểm chứng trên shared/production DB, full payout/F4, production ACL, multi-node hoặc tải thực. READY_FOR_REVIEW; dừng ở P08, P09 NOT_STARTED.
