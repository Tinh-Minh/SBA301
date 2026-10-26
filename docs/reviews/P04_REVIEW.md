# Review P04 — CHANGES_REQUESTED

Ngày: 2026-10-13. Reviewer đọc source/tests/report và chạy lại kiểm tra tại workspace Desktop, nhánh BE. **P04 CHANGES_REQUESTED** vì hai finding đã tái hiện qua HTTP thật. P01–P03 giữ APPROVED; P05 chưa được giao.

## 1. Kết quả kiểm chứng

| Kiểm tra | Kết quả reviewer |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS, khoảng 1 phút 26 giây; **55/55**, 0 failures/errors/skipped |
| Surefire | PlatformHttpTest 13, JwtConfigurationTest 4, CustomerPropertiesTest 1 |
| Failsafe | AuthSecurityPostgresIT 14, CustomerManagementPostgresIT 16, Function1PostgresIT 7 |
| Packaging probe | PASS; local config/private key entries và config/key/bootstrap markers không có trong JAR |
| Health server thật + PostgreSQL | 200/UP, trace body/header khớp: `693c9a45-6a85-492e-af53-7346a263d790` |
| Reference/migration | Schema, conventions, drawio và migration hash khớp báo cáo/đầu vào |
| Git | BE, HEAD = origin/BE = `2fe712eed12a2af3b61f0a5311bdd3901f614029`; source/docs vẫn untracked, không commit/push |

Logs reviewer:

- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-review-verify.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-review-packaging.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-review-http-probe.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-review-http-probe-confirm.log`

Probe source nằm ngoài repository tại `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-review-probe\`. Probe HTTP khởi động production application với PostgreSQL15.13 Testcontainers/schema baseline cô lập, temporary RSA keys và dữ liệu tổng hợp; loại `target/test-classes` khỏi classpath để không nạp fixtures. Không mock request/DTO/lock translation. Container/app được đóng, key files tạm được xóa. Packaging probe dùng bản sao riêng skip tests, không tính vào 55 test.

## 2. Findings cần sửa

### R1 — [P2] Client bind được presence flags và vượt allowlist/duplicate guard

**Vị trí:** `src/main/java/com/carrental/dto/request/customer/UpdateProfileRequest.java:10–12,43–45`; `ChangeCustomerStatusRequest.java:11–12,48–49`.

Các public `isXPresent()` accessor khiến Jackson phát hiện logical property `xPresent` và suy ra private field mutator. Những key này không đi vào JsonAnySetter rejectUnknownField; client được phép sửa state nội bộ phục vụ PATCH presence/duplicate validation.

Đã tái hiện với mapper đang có trong application và HTTP thật:

| Body | Hiện tại | Tác động DB |
|---|---|---|
| `{"dateOfBirthPresent":true,"address":"Flag clear request"}` | 200 OK | Xóa date_of_birth đang là 1990-01-01 dù body không có dateOfBirth |
| `{"fullName":"First","fullNamePresent":false,"fullName":"Second"}` | 200 OK | full_name thành Second; duplicate setter guard bị reset |
| `{"status":"ACTIVE","statusPresent":false,"status":"LOCKED","reason":"Synthetic review"}` | 200 OK cho ADMIN | Account target bị LOCKED từ command có property lạ và status trùng |

Cả ba response vẫn có trace body/header khớp; đây là lỗi allowlist/PATCH semantics, không phải lỗi trace. Không có evidence CUSTOMER vượt quyền admin hoặc thay account người khác: quyền HTTP/service hiện vẫn được áp dụng. Tuy nhiên input bị hợp đồng yêu cầu reject lại có thể thay DB.

Nguyên nhân phù hợp cơ chế [Jackson MapperFeature.INFER_PROPERTY_MUTATORS](https://javadoc.io/static/tools.jackson.core/jackson-databind/3.1.0/tools.jackson.databind/tools/jackson/databind/MapperFeature.html#INFER_PROPERTY_MUTATORS): visible accessor có thể khiến field không public được dùng để bind. Assertion field lạ hiện có chỉ thử id/passwordHash/role; chưa thử các field nội bộ khớp accessor.

**Cần sửa:** request JSON chỉ bind đúng allowlist; presence state hoàn toàn do parser/setter quản lý, không nhận từ client. Các `*Present` và helper property ngoài hợp đồng phải trả 400 INVALID_REQUEST, không âm thầm ignore. Duplicate allowed keys vẫn phải bị reject kể cả khi xen field lạ hoặc đổi thứ tự. Giữ omitted/null/type rules. Dùng config/deserializer phù hợp Jackson3, ưu tiên giới hạn ở hai DTO; không bật field visibility rộng hoặc nới lỗi unknown. Thêm regression HTTP thật và so sánh toàn row/audit không đổi cho input rejected.

### R2 — [P2] Timeout advisory lock thật đi vào 500 thay vì 503

**Vị trí:** `src/main/java/com/carrental/repository/CustomerStatusLock.java:26–40`; `GlobalExceptionHandler.java:54–69`; test `CustomerManagementPostgresIT.statusLockDependencyFailureReturnsSafe503AndDoesNotMutateAccount`.

Regression hiện inject CannotAcquireLockException từ spy và do đó kiểm tra handler của exception đã chọn, chưa chứng minh JdbcTemplate translate lỗi PostgreSQL thật vào loại đó.

Reviewer mở một connection khác, giữ `pg_advisory_xact_lock` với đúng namespace, đặt status-lock-timeout-ms=300 trên app test, rồi gọi HTTP status command. Kết quả thực tế:

```text
REAL_ADVISORY_TIMEOUT status=500 code=INTERNAL_ERROR traceMatches=true
GlobalExceptionHandler exceptionType=UncategorizedSQLException
REAL_ADVISORY_TIMEOUT_EXCEPTION type=UncategorizedSQLException sqlState=55P03
```

Lỗi PostgreSQL lock timeout ở đường JdbcTemplate này không được các handler PessimisticLockingFailureException/DataAccessResourceFailureException bắt. Probe xác nhận thêm trực tiếp CustomerStatusLock trong transaction có exception UncategorizedSQLException/cause SQLState 55P03. API/operations và prompt P04 cam kết 503 DEPENDENCY_UNAVAILABLE cho lock contention timeout; hiện implementation không đáp ứng với driver/translator thật. Response vẫn an toàn và trace đúng; target vẫn ACTIVE sau timeout, retry sau blocker rollback trả 200. Không có evidence partial status change hay lộ reason.

**Cần sửa:** phân loại lock acquisition failure ở ranh giới thích hợp bằng exception/SQLState cụ thể, giữ cause và rollback; trả 503 an toàn. Không đổi tất cả UncategorizedSQLException/DataAccessException thành 503, không chuyển mọi lỗi SQL thành lock failure hoặc match exception message. PostgreSQL công bố `55P03` là lock_not_available tại [bảng SQLState chính thức](https://www.postgresql.org/docs/15/errcodes-appendix.html); phải kiểm chứng SQLState/translation thực tế bằng test blocked lock. [Spring SQLExceptionSubclassTranslator](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/support/SQLExceptionSubclassTranslator.html) có fallback theo SQLState; không giả định exception do spy tạo chính là exception driver sẽ tạo.

## 3. Phần đạt và giới hạn

- Controller/service theo tài nguyên, DTO response allowlist, owner từ principal; admin query/filter/count/sort/escaping thực thi trên PostgreSQL.
- Transaction advisory lock, actor đọc lại dưới lock, row locking và hai-admin race có test barrier sau authentication. Không phát hiện mất invariant ADMIN ACTIVE trong các ca đã kiểm tra.
- No-op/audit và after-commit safe log, rollback fault injection, CORS PATCH và regression P01–P03 đều đạt.
- Test profile/status concurrent hiện bắt đầu HTTP cùng lúc nhưng chưa ép điểm overlap trong service. Đây là độ mạnh coverage cần giữ đúng mô tả; không dùng kết quả đó để chứng nhận mọi ordering. Không phải finding chặn riêng ở review này.
- Lịch sử status/reason bền vững chưa có là giới hạn schema/phạm vi đã ghi, không phải lỗi mới buộc thêm bảng.
- Deprecation compiler note không làm build fail và không phải finding chặn. Không nâng dependency chỉ để xóa note trong lượt sửa.

Reviewer chỉ chạy kiểm tra/probes cô lập và viết review/prompt/tài liệu trạng thái; không sửa production source, schema/reference, commit/push hay DB chung. Giữ [báo cáo Agent P04](../reports/P04_REPORT.md) làm lịch sử trước review. Thực hiện [P04-FIX-01](../prompts/P04_FIX_01.md), báo READY_FOR_REVIEW rồi dừng; chưa chuyển P05.
