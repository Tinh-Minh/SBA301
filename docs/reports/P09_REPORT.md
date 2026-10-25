# Báo cáo P09 — Quản trị voucher

**Trạng thái:** `READY_FOR_REVIEW`  
**Phạm vi:** P09, Function 1 voucher admin theo U-19/U-20/U-21.  
**Branch/HEAD:** `BE`, `2fe712eed12a2af3b61f0a5311bdd3901f614029` (trùng `origin/BE`).  
**Database:** PostgreSQL 15.13 Testcontainers cô lập; không dùng database chung. Không stage/commit/push. P10 chưa triển khai.

## Kết quả và giới hạn

Đã triển khai đủ 9 bước trong [P09 prompt](../prompts/P09_ADMIN_VOUCHERS.md). P09 cung cấp năm route quản trị định nghĩa voucher, parsing body/query nghiêm ngặt, lọc/count/page trong PostgreSQL, kiểm tra quota theo `used_count` hiện tại dưới row lock, xử lý lỗi constraint chính xác và log an toàn. Schema leader, entity, migration và tài liệu `docs/reference/` không bị sửa; không thêm dependency hay module order/usage/pricing.

Full regression chạy thành công: 38 Surefire + 105 Failsafe = **143/143**, 0 failure, 0 error, 0 skipped. Packaging probe, actual Boot executable JAR/CWD regression và health HTTP trong PostgreSQL integration context đều PASS. Chưa kiểm chứng database production/chung, full F3 reserve/release/price/per-user behavior, Windows production ACL, multi-node hoặc benchmark. Synthetic JDBC counter writer chỉ chứng minh locking và counter preservation theo ranh giới P09, không phải integration F3.

## Đối chiếu đủ 9 bước

1. Đọc hướng dẫn/status/review/prompt và source liên quan; xác nhận `BE`/HEAD/tree; giữ nguyên schema và project files untracked có trước.
2. Áp dụng U-19/U-20/U-21 và tách policy đã chốt khỏi baseline kỹ thuật; giữ status/window/code semantics như prompt.
3. Thêm strict request/query DTOs, exact decimal/integer validation và local date-time precision; không echo rejected input.
4. Thêm năm route ADMIN, response DTO/mapper và database-side filter/count/page.
5. Dùng advisory→actor→voucher locking, recheck actor, đọc latest counter cho quota; giữ immutable definition fields và không ghi `used_count`.
6. Ánh xạ chính xác constraint/SQLState, safe failure diagnostics, after-commit success log, rollback/no-op semantics.
7. Ghi hợp đồng F3 và giới hạn; không thêm pricing/order/usage/reservation module.
8. Chạy PostgreSQL/HTTP/concurrency, full clean verify, actual Boot JAR/CWD, health và packaging checks; lưu kết quả/lệnh thực tế bên dưới.
9. Tạo [voucher contract](../16_ADMIN_VOUCHERS.md), cập nhật current docs/status/local guide, viết report này và dừng ở READY_FOR_REVIEW.

## Ánh xạ schema leader

| Nhóm cột hiện hữu | Ánh xạ/kiểm tra P09 |
|---|---|
| `code VARCHAR(50) UNIQUE`, `description VARCHAR(300)` | Case-preserving exact code, nullable normalized description; không tạo index/cột mới |
| `discount_type`, `discount_value NUMERIC(14,0)`, `max_discount`, `min_order_amount` | Enum + exact integer/precision validation; không ROUND hoặc sửa policy fields sau create |
| `start_at`, `end_at TIMESTAMP` | `LocalDateTime` microseconds; end phải sau start; không đổi sang timezone type |
| `usage_limit`, `per_user_limit`, `used_count` | Nullable/positive limits theo schema; quota update đọc counter hiện tại dưới lock; admin không sửa counter |
| `status`, `created_at`, `updated_at` | ACTIVE/INACTIVE; giữ DB audit trigger; không hard-delete/history/status mới |

Entity `Voucher` mapping và Flyway leader baseline giữ nguyên; không sửa/sinh DDL.

## Hiện trạng ban đầu

- Root: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`; branch `BE`; HEAD và `origin/BE` cùng `2fe712eed12a2af3b61f0a5311bdd3901f614029`.
- Windows 11 amd64; Oracle JDK 21.0.8; Maven Wrapper 3.9.11; Docker client/server 28.5.2.
- `JAVA_HOME` chưa đặt trong PowerShell ban đầu. Các lệnh Maven được chạy với `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'`; không dump environment variables.
- Working tree đã có project files untracked từ trước P09. Không có tracked/staged diff. Giữ nguyên các file hiện có, không đổi branch, stash, reset hoặc commit.

## Triển khai

| Mục | Thay đổi |
|---|---|
| Routes | `POST /api/vouchers`, `GET /api/vouchers`, `GET /api/vouchers/{id}`, `PUT /api/vouchers/{id}`, `PATCH /api/vouchers/{id}/status`; yêu cầu ADMIN ACTIVE, không có customer/public/Delete route |
| U-19 | PUT chỉ sửa `description` và `usageLimit`; các field giảm giá/điều kiện/thời gian/code immutable; null semantics theo prompt |
| U-20 | Status dùng ACTIVE/INACTIVE, giữ row; không có hard-delete |
| U-21 | Code `strip()` hai đầu, giữ case và exact equality; `%`/`_` trong filter được coi là ký tự thường |
| DTO/list | Duplicate/unknown/internal keys, sai kiểu, numeric overflow/fraction, date-time sai precision/zone, query/sort sai đều bị từ chối; số exact `NUMERIC(14,0)`, `LocalDateTime` microseconds; DB làm WHERE/count/page |
| Clock/window | Mỗi operation chụp Clock một lần; UPCOMING/CURRENT/ENDED dùng start-inclusive, end-exclusive và tách stored status |
| Locks/quota | Ghi theo shared advisory → actor row → voucher row; đọc lại actor sau wait; so quota với current `used_count` dưới voucher lock; không reset/ghi counter |
| Errors/logs | Chỉ `23505` + `vouchers_code_key` thành 409 duplicate; `55P03` thành 503; lỗi integrity khác không bị phân loại nhầm. Success log after-commit, failure log allowlisted, rejected values/raw DB details không bị ghi |
| F3 boundary | `findByIdForUpdate` là hook nội bộ; không thêm order/usage/reservation/pricing API. Counter writer trong tests là JDBC fixture tổng hợp |

### File tạo mới

- `src/main/java/com/carrental/controller/VoucherController.java` — năm route ADMIN.
- `src/main/java/com/carrental/dto/request/voucher/ChangeVoucherStatusRequest.java`, `CreateVoucherRequest.java`, `UpdateVoucherAdminRequest.java`, `VoucherListQuery.java` — strict request/query parsing.
- `src/main/java/com/carrental/dto/response/VoucherResponse.java`, `VoucherWindowState.java` — response DTO và window snapshot.
- `src/main/java/com/carrental/mapper/VoucherMapper.java` — map entity sang DTO.
- `src/main/java/com/carrental/service/VoucherChangeLogger.java`, `VoucherService.java`, `src/main/java/com/carrental/service/impl/VoucherServiceImpl.java` — safe logging, service contract, transaction/validation/locking.
- `src/test/java/com/carrental/VoucherAdminPostgresIT.java` — sáu PostgreSQL/HTTP/JWT regression tests.
- `docs/16_ADMIN_VOUCHERS.md` — API, semantics, locks, privacy và F3 boundary.
- `docs/reports/P09_REPORT.md` — báo cáo lượt triển khai này.

### File sửa

- `src/main/java/com/carrental/exception/ErrorCode.java` — thêm conflict codes cho duplicate code và quota.
- `src/main/java/com/carrental/repository/VoucherRepository.java` — database-side specification/list support; giữ internal row-lock hook.
- `src/main/resources/application.properties` — cho phép PUT trong CORS methods.
- Current docs/status: `AGENTS.md`, `README.md`, `docs/README.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/LOCAL_DEVELOPMENT.md`, `docs/02_FUNCTION_1_ARCHITECTURE.md`, `docs/03_FUNCTION_1_API.md`, `docs/06_IMPLEMENTATION_PLAN.md`, `docs/07_DECISIONS_AND_OPEN_QUESTIONS.md`, `docs/08_PROMPT_ROADMAP.md`, `docs/09_FUNCTION_1_PERSISTENCE.md`, `docs/10_AUTH_SECURITY.md`, `docs/12_PRIVATE_DOCUMENT_STORAGE.md`, `docs/13_DOCUMENT_REVIEW_KYC.md`, `docs/14_DRIVER_PROFILE_ELIGIBILITY.md`, `docs/15_BANK_ACCOUNTS.md` — đồng bộ trạng thái P09 và link hợp đồng/report. Reports/reviews/prompts lịch sử và `docs/reference/` giữ nguyên.

## Kiểm chứng và lệnh đã chạy

1. Environment/branch checks:

   ```powershell
   git branch --show-current
   git rev-parse HEAD
   git rev-parse origin/BE
   $env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
   .\mvnw.cmd -v
   docker version --format 'Docker client={{.Client.Version}} server={{.Server.Version}}'
   ```

   Kết quả: branch `BE`, hai SHA bằng nhau; JDK 21.0.8, Maven 3.9.11, Docker 28.5.2.

2. Compile checks:

   ```powershell
   .\mvnw.cmd -B -DskipTests compile
   .\mvnw.cmd -B -DskipTests test-compile
   ```

   Cả hai PASS. Build báo warning deprecated API hiện hữu; không có compile failure.

3. Focused final regression checks:

   ```powershell
   .\mvnw.cmd -B -Ppostgres-it '-Dit.test=VoucherAdminPostgresIT#strictCreateDefaultsExactCodePrecisionDateAndSafeErrors' test-compile failsafe:integration-test failsafe:verify
   .\mvnw.cmd -B -Ppostgres-it '-Dit.test=VoucherAdminPostgresIT#concurrentCounterWriterIsObservedByPostgresAndAdminNeverOverwritesLatestValue' test-compile failsafe:integration-test failsafe:verify
   ```

   Cả hai PASS, mỗi lần 1/1. Toàn bộ class `VoucherAdminPostgresIT` trong full build đạt 6/6; gồm strict JSON/numeric/time, query/filter/window, auth/immutability/no-op/soft-disable, actual unique constraint mapping, actor recheck, 55P03/retry và DB contention.

4. Full regression:

   ```powershell
   $env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
   .\mvnw.cmd -B clean verify -Ppostgres-it
   ```

   **PASS**, exit code 0, Maven 2:42 phút. Surefire **38/38**; Failsafe **105/105**; tổng **143/143**, 0 failure/error/skip. Failsafe dùng PostgreSQL 15.13 Testcontainers. Log: `%TEMP%\sba301-p09-clean-verify-20261014.log`. `StorageRootBootJarIT` actual Boot `java -jar`/JarLauncher từ unrelated CWD đạt **1/1**.

5. Packaging probe:

   ```powershell
   $env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
   ```

   **PASS**, exit code 0. Rebuilt executable JAR trong temporary copy. `application-local.properties`, fake local/private-key/bootstrap/document markers, private-storage root path, private-key entry và test Boot root helper đều `PACKAGED=False`. Probe không sửa source tree.

## HTTP, PostgreSQL và concurrency evidence

- Full run ghi health HTTP `200`; body quan sát qua integration HTTP là `{"success":true,"code":"OK","message":"Th�nh c�ng","data":{"status":"UP"},"errors":[],"traceId":"fc9f16d7-09aa-4c71-a5cf-396d848e54ca"}`, header `X-Request-ID=fc9f16d7-09aa-4c71-a5cf-396d848e54ca`. Probe này chạy trong `BankAccountPostgresIT` với PostgreSQL Testcontainers ở cùng lượt full verify. Windows console/log redirection hiển thị mojibake trong phần message tiếng Việt; test parse/assert status và trace thành công.
- `VoucherAdminPostgresIT` xác nhận holder PID **62**, waiter PID **64**, `pg_blocking_pids=[62]`. Counter trước commit là 2; sau holder commit là 4. Admin đang chờ với `usageLimit=3` trả quota conflict; count vẫn 4, không bị stale detached value ghi đè.
- Cùng test xác nhận holder PID **62**, status waiter **63**, admin update waiter **64**; status waiter bị block bởi `[62]`, update waiter bởi `[63]`. Sau serialization, status và description/quota commands hoàn tất với `used_count=5` không đổi.
- Actor recheck test ghi holder PID **62**, waiter PID **63/64**, blockers `[62, 63]`; sau actor bị khóa, request dùng credential cũ bị từ chối và voucher không mutation.
- Lock timeout test ghi holder PID **62**, waiter **63**, `pg_blocking_pids=[62]`; PostgreSQL `55P03` được chuyển thành 503, transaction không mutation và retry sau release thành công.
- Test tạo unique conflict từ PostgreSQL xác nhận đúng `vouchers_code_key` → 409; test-only unrelated unique index vẫn là lỗi server tổng quát. Test rollback/no-op/log capture xác nhận audit/event chỉ phát sau commit và không log input sentinel.

## Schema/reference/entity hashes

Schema/reference/migration after hash trùng các baseline SHA-256 trong [P08 report](P08_REPORT.md); không sửa các file này. Voucher entity không được sửa trong P09; P08 report không lưu hash pre-P09 riêng cho entity, nên chỉ ghi hash hiện tại và không tuyên bố phép so sánh pre/post có bằng chứng số:

| File | Trước P09 | Sau P09 |
|---|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/README.md` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` | `1C240051EBB4A615901F15EF7A3EB1ABF0885E21F06FEFA941C53A0A937A88BC` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| `src/main/java/com/carrental/entity/Voucher.java` | Không được ghi hash tại baseline P08; không sửa trong P09 | `D4F3278632E6BE7D755768C83197FBFA4548D546FE8D885975F47EFB1C511504` |

Không sửa schema, entity, migration hoặc `docs/reference/`; không chạy SQL lên DB chung.

## Git status và diff

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

Status đầu lượt đã có cùng 11 root groups untracked; status sau lượt giữ nguyên nhóm đó. Sau khi thêm report, `git ls-files -o --exclude-standard` đếm **244 untracked files**; các file code/docs P09 được liệt kê đầy đủ trong inventory bên trên và thuộc `docs/`/`src/`. Không có staged changes. `git diff --stat` và `git diff --cached --stat` rỗng vì toàn bộ workspace vốn untracked, không phải vì implementation không đổi. HEAD không ahead/behind `origin/BE`; không stage/commit/push.

## Lượt kiểm tra trung gian và hạn chế

Focused suite đã có các lượt thất bại trong quá trình phát triển; chúng được giữ minh bạch ở đây, không tính là PASS:

| Lượt | Kết quả quan sát | Sửa/rerun |
|---|---|---|
| `-Dit.test=VoucherAdminPostgresIT` lần đầu | 1 lỗi fixture phone helper trong 6 test | Sửa fixture rồi chạy lại suite |
| Lượt suite tiếp theo | 2 assertion fail/6, gồm `%/_` literal filter và kỳ vọng constraint test | Sửa expectation/test fixture và kiểm tra lại |
| Lượt suite tiếp theo | 1 fail/6 ở boundary window dùng fixed Clock; các test còn lại pass | Sửa biên test/Clock và chạy strict case riêng |
| Strict case riêng ban đầu | Token hết hạn vì test Clock tiến hơn một giờ | Tăng TTL test để bao phủ lượt chạy; strict case cuối **1/1 PASS** |
| Concurrency suite sau khi thêm admin thứ hai | Test observer hết timeout 2.5 giây trước khi xác nhận waiter | Tăng timeout có giới hạn, quan sát backend PID/`pg_stat_activity` và `pg_blocking_pids`; focused concurrency cuối **1/1 PASS** |

Các suite run dùng Maven Failsafe với PostgreSQL Testcontainers. Lệnh focused cuối và full clean verify được ghi nguyên văn ở trên; full `clean verify` cuối cùng chạy lại toàn bộ 143 test với 0 failure/error/skip. Không dùng kết quả thất bại trung gian làm bằng chứng PASS.

Chưa kiểm chứng trên DB production/chung, full F3 quota reservation/price/order integration, Windows production ACL, multi-node hoặc tải. Cần reviewer xác nhận implementation và evidence; Agent không tự đánh dấu APPROVED. **P09 `READY_FOR_REVIEW`; dừng ở đây, P10 chưa triển khai.**
