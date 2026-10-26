# Review P04-FIX-01 — APPROVED

Ngày review: 2026-10-13. Reviewer đọc source/tests/report, chạy lại full verification và packaging, rồi chạy lại probe HTTP từng tái hiện lỗi. **P04 APPROVED; R1/R2 CLOSED.** Không phát hiện finding chặn trong phạm vi bản sửa. [Review gốc](P04_REVIEW.md), [report P04](../reports/P04_REPORT.md) và [report bản sửa](../reports/P04_FIX_01_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS, 59.537 giây; **57/57**, 0 failures/errors/skipped |
| Surefire | PlatformHttpTest 13, JwtConfigurationTest 4, CustomerPropertiesTest 1, CustomerStatusLockTest 1 |
| Failsafe | AuthSecurityPostgresIT 14, CustomerManagementPostgresIT 17, Function1PostgresIT 7 |
| HTTP health + PostgreSQL15.13 | 200/UP, body/header trace khớp: `7f4e3da1-4d2a-4e59-aea4-41f461b70b00` |
| Packaging | PASS; local config/private key entries và config/key/bootstrap markers không có trong JAR |
| Probe HTTP riêng | Ba payload R1 đều400 INVALID_REQUEST/không mutation; R2 timeout thật 503, release/retry 200 |
| Git trước review docs | BE, HEAD = origin/BE = `2fe712eed12a2af3b61f0a5311bdd3901f614029`; 132 file untracked |
| Hashes | Schema/conventions/drawio/migration khớp đầu vào và report |

Logs reviewer:

- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-fix-review-verify.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-fix-review-packaging.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p04-fix-review-http-probe.log`
- XML tại `target/surefire-reports/` và `target/failsafe-reports/`.

Probe riêng dùng production app/classes, loại target/test-classes khỏi classpath, PostgreSQL Testcontainers, RSA keys và account tổng hợp. App/container được đóng; key files tạm được xóa. Packaging build nằm ở bản sao tạm skip tests, không tính vào 57 ca full verification.

## 2. Đóng finding

### R1 — CLOSED: presence flags bind được từ JSON

Hai DTO đổi parser-state accessors thành non-JavaBean methods; allowed setters vẫn explicit và unknown fields vẫn đi vào strict JsonAnySetter. Service sử dụng methods mới để giữ omitted/null semantics. Không nới ignoreUnknown, không bỏ duplicate/type validation.

HTTP regression thử internal flags true/false/null/wrong shape, helper/unknown fields, thứ tự khác nhau và duplicate keys xen flags/unknown; so sánh toàn row/audit sau từng rejected request. Controls PATCH hợp lệ/status/no-op và regression quyền vẫn đạt.

Reviewer chạy lại ba payload đã gây lỗi trên app thật:

- `dateOfBirthPresent:true` cùng address → **400 INVALID_REQUEST**, DOB vẫn1990-01-01.
- fullName lặp xen fullNamePresent:false → **400 INVALID_REQUEST**, tên giữ nguyên.
- status lặp xen statusPresent:false → **400 INVALID_REQUEST**, target vẫn ACTIVE, không change log.

Cả ba response có trace body/header khớp. Không sửa bằng âm thầm bỏ qua field nội bộ.

### R2 — CLOSED: timeout advisory lock thật bị500

CustomerStatusLock chỉ bắt SQLException tại execution advisory lock; exact SQLState55P03 chuyển thành CannotAcquireLockException và giữ SQLException cause. SQLStates khác được ném lại cho JDBC translation gốc; không chuyển cả UncategorizedSQLException/DataAccessException thành503. Existing safe handler nhận typed lock failure.

Regression giữ lock từ connection thứ hai, xác nhận backend PID khác nhau, direct transactional failure có SQLException cause55P03, HTTP503/trace đúng/whole row không đổi/no success log; rollback blocker rồi retry 200 và after-commit log đúng. Unit predicate kiểm tra23514/40001/null/missing SQLState không bị nhận nhầm lock failure. Test injected exception vẫn được phân biệt với đường PostgreSQL thật.

Probe HTTP reviewer xác nhận lại:

```text
REAL_ADVISORY_TIMEOUT_EXCEPTION type=CannotAcquireLockException sqlState=55P03
REAL_ADVISORY_TIMEOUT status=503 code=DEPENDENCY_UNAVAILABLE traceMatches=true
REAL_ADVISORY_TIMEOUT_DB status=ACTIVE
AFTER_LOCK_RELEASE status=200 code=OK traceMatches=true
```

## 3. Giới hạn và phần tiếp theo

- Không kiểm chứng DB chung/production config hoặc durable status/reason history; schema không đổi.
- Coverage non-lock SQLState là unit predicate và source narrow catch, không phải mỗi SQLState đều được gây ra trên HTTP thật.
- Private presence state an toàn theo DTO hiện tại; giữ regression nếu sau này thêm JavaBean getters/lombok hoặc thay mapper.
- Reviewer không sửa implementation, commit/push, schema/reference hoặc chạy DB chung.

Người dùng đã chọn P05 dùng **local private ngoài public/JAR**, với storage interface để thay provider sau. [Prompt P05](../prompts/P05_PRIVATE_DOCUMENTS.md) PROMPT_READY; chưa có implementation/report P05. P06 duyệt/KYC và các policy còn mở được giữ đúng phạm vi.
