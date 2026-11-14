# Review P06-FIX-01 — APPROVED

Ngày review: **2026-10-14**. **R1/R2 CLOSED; P06 APPROVED.** Reviewer đã đọc source/tests/report, chạy lại full verification/packaging và HTTP probe trước đây. Không có finding chặn còn lại trong phạm vi P06. [Review P06 gốc](P06_REVIEW.md), [report gốc](../reports/P06_REPORT.md) và [report bản sửa](../reports/P06_FIX_01_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS, khoảng 1 phút 28 giây; **106/106**, 0 failure/error/skip |
| Surefire/Failsafe |36 + 70, gồm 15 UserDocumentReviewPostgresIT; các regression P01–P05 giữ |
| Packaging probe | PASS; local/key/bootstrap/document/root markers và test helper không vào JAR |
| Health P06 app/PostgreSQL | 200/UP, body/header trace khớp `8afdd11f-968e-41ff-9d6b-937bead4015d` |
| Missing evidence HTTP probe | 500/trace khớp; **traceLogEvents=1, warnErrorEvents=1**, document PENDING/customer NONE |
| Disabled storage HTTP probe | 503/trace khớp; **traceLogEvents=1, warnErrorEvents=1**, document PENDING/customer NONE |
| Actual metadata contention |holder PID 62/waiter PID 61, PostgreSQL blocking confirmed; upload uncommitted invisible/review chưa hoàn tất trước release |
| Sau release/commit |upload 201/PENDING, review 200/REJECTED, customer snapshot/current KYC PENDING; 1 committed review event, metadata/audit/files/download đúng |
| Git trước review docs |BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 189 untracked paths, không staged changes |

Docker28.5.2 có sẵn; PostgreSQL15.13 Testcontainers cô lập. Logs tại `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p06-fix01-review-verify.log`
- `sba301-p06-fix01-review-packaging.log`
- `sba301-p06-fix01-review-error-probe.log`

HTTP probe dùng production classes, loại test-classes khỏi classpath, app/PostgreSQL/RSA/account/images/root tạm. Source helper vẫn ngoài repo ở `sba301-p06-review-probe`; context/container/key/files được đóng/dọn. Không ảnh thật/key thật/DB chung.

## 2. R1 — CLOSED: diagnostic dương và privacy/rollback giữ

Service boundary `validateStoredEvidence`/`validateStoredImage` ghi safe action=document-review-failure cho disabled/unavailable 503, invalid/missing/corrupt 500. Catch exact23505 `uq_user_doc_approved` ghi safe conflict diagnostic rồi giữ cause khi translate 409. Logs có trace/category/errorCode/actor/owner/document IDs/exceptionType và constraint name allowlisted khi cần; không Throwable argument/raw message/path/locator/metadata/reason/SQL detail. Generic handler không log lại AppException để tránh duplicate/context loss.

Full IT asserts exactly 1 diagnostic event theo trace, IDs/category/code/type, no ThrowableProxy và không sentinel trong message/cause-rendered output; gồm real missing file, corrupt image, disabled và injected IO-unavailable, actual index conflict. Primary/cause/exception classification/rollback giữ, không committed success log trên failures.

Reviewer chạy lại **cùng HTTP probe trước sửa**, với synthetic PASSPORT đủ prerequisites:

```text
MISSING_STORED_EVIDENCE status=500 code=INTERNAL_ERROR traceMatches=true
trace=f69ece9b-c411-401a-9e10-61d894d5e66b traceLogEvents=1 warnErrorEvents=1
documentStatus=PENDING kycSnapshot=NONE
DISABLED_PRIVATE_STORAGE status=503 code=DEPENDENCY_UNAVAILABLE traceMatches=true
trace=f3485d91-e1cf-439a-93df-a71d97481246 traceLogEvents=1 warnErrorEvents=1
documentStatus=PENDING kycSnapshot=NONE
```

Trước sửa cả hai cases có0 trace/WARN/ERROR event; sau sửa có1 event chứa đúng trace/category/IDs. Response error code/trace/rollback không thay. Probe kiểm chứng missing/disabled production paths; full IT bổ sung corruption/unavailable/constraint và privacy assertions, không nhầm injected exception thành OS ACL/network production failure.

## 3. R2 — CLOSED: upload holder/review waiter là hai metadata transactions thật

Test `uploadTransactionOwnerLockBlocksReviewUntilPendingProofCommits` giữ upload tại transaction-manager **commit boundary sau actual persist/flush**, chỉ khi transaction-local query thấy row mới và capture backend PID trên cùng connection. Hook gọi actual commit sau release; không fake row/receipt/repository/transaction.

Review HTTP thực lấy advisory lock rồi capture waiterPID, đi tiếp tới owner lock. Observer connection hỏi `pg_blocking_pids` xác nhận upload PID blocker; submission row chưa visible/review future chưa hoàn tất trước release. Reviewer run:

```text
holderPid=62 waiterPid=61 pgBlockingPidsConfirmed=true waiterBlockedMillis=36
uncommittedSubmissionInvisible=true reviewIncompleteBeforeRelease=true
upload=201_PENDING review=200_REJECTED snapshot=PENDING current=PENDING
oldCreatedAtPreserved=true metadataAuditFilesDownloads=true reviewAfterCommitLog=1 piiFree=true
```

Reject document cũ sau upload commit phải thấy proof PENDING mới trong aggregate, vì vậy result PENDING kiểm chứng visibility/precedence qua transaction ordering. Assertions kiểm tra old/new document metadata/audit/reviewer, unrelated account fields, peer files và authenticated downloads, exactly 1 committed event không PII. Test timeout riêng vẫn 503/retry 200. Test cũ được giữ/tên sửa thành pre-transaction file-stage overlap; không dùng nó làm chứng minh DB contention nữa.

Fixture lock timeout5s chỉ cho observer bounded window, test finally release/close resources; production timeout/config/lock algorithm không đổi. Kết quả là concurrency evidence trên PostgreSQL thật, các giới hạn throughput/multi-node vẫn chưa kiểm chứng.

## 4. Hashes, scope và bước tiếp theo

Schema/conventions/drawio/migration hashes giữ:

```text
49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8
737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518
C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E
6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4
```

U-11/U-12/U-13, API/DTO/Clock/KYC snapshot/current-query, private storage và P01–P05 không đổi. Production DB/config/ACL, mọi filesystem topology, crash atomicity, durable history, renewal/revoke và throughput chưa kiểm chứng; các giới hạn này không mở scope P06.

Reviewer chỉ chạy checks/probes và viết docs, không sửa production source/tests/schema/reference, stage/commit/push/DB chung. **[P07](../prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md)** được soạn riêng cho driver profile/eligibility; chưa implementation. User đã xác nhận điều kiện ACTIVE+current identity VERIFIED+GPLX APPROVED còn hạn và cấm ADMIN tự đổi driver status; không suy các quyết định này từ policy P06.
