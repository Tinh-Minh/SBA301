# Review P06 — CHANGES_REQUESTED

Ngày review: **2026-10-14**. **P06 CHANGES_REQUESTED**, chưa chuyển P07. Reviewer chạy lại 105/105 và packaging/health PASS; còn **R1: thiếu diagnostic log cho server/dependency failures đã được bọc thành AppException**, **R2: test review/upload chưa chứng minh contention trong metadata transactions**. [Báo cáo Agent](../reports/P06_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS, khoảng 1 phút 26 giây; **105/105**, 0 failure/error/skip |
| Surefire |36: bộ 32 cũ + 4 KycPolicy tests |
| Failsafe |69: bộ 55 cũ + 14 UserDocumentReviewPostgresIT |
| Packaging probe | PASS; local/key/bootstrap/document/root markers và test helper không vào JAR |
| P06 health HTTP/PostgreSQL |200/UP, body/header trace khớp `d54f5081-303f-4463-a0d1-18ba121d59a6` |
| Probe HTTP missing stored evidence |500 INTERNAL_ERROR, trace khớp, document PENDING/KYC NONE; **traceLogEvents=0, warnErrorEvents=0** |
| Probe HTTP disabled storage |503 DEPENDENCY_UNAVAILABLE, trace khớp, document PENDING/KYC NONE; **traceLogEvents=0, warnErrorEvents=0** |
| Git trước review docs |BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`;186 file untracked, không staged changes |

Logs trong `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p06-review-verify.log`
- `sba301-p06-review-packaging.log`
- `sba301-p06-review-error-probe.log`

Probe source/classes nằm ngoài repo tại `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p06-review-probe\`. Nó nạp production classes, loại `target/test-classes` khỏi classpath, dùng app HTTP thật/PostgreSQL15.13/RSA accounts/images tổng hợp và root tạm. File evidence tổng hợp được xóa có kiểm tra parent để tái hiện missing-file; storage flag chỉ đổi trong probe context, không local config thật. Capture root Logback events gồm MDC/level; app/container/files/key được đóng/dọn.

Schema/conventions/drawio/migration SHA-256 giữ nguyên lần lượt:

```text
49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8
737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518
C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E
6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4
```

## 2. Findings cần sửa

### R1 — [P2] Review server/dependency failure trả error nhưng không có diagnostic event theo trace

**Vị trí:** `src/main/java/com/carrental/service/impl/UserDocumentServiceImpl.java:339–352` và catch unique constraint `:276–281`; `src/main/java/com/carrental/exception/GlobalExceptionHandler.java:29–35`.

`validateStoredImage` catch AppException/runtime failure rồi bọc thành INTERNAL_ERROR nhưng không safe log. Disabled-storage path ném DEPENDENCY_UNAVAILABLE cũng không có review diagnostic. Global handler cho AppException chỉ trả envelope, không ghi event, nên các lỗi này không đi qua generic500 logger. Catch exact23505 cũng chỉ translate/rethrow; chưa giữ diagnostic metadata như prompt yêu cầu.

Reviewer tạo PASSPORT PENDING đủ prerequisites, actual canonical front image rồi xóa đúng synthetic receipt file; ADMIN HTTP approve trả500. Case tiếp theo có ảnh hợp lệ nhưng adapter disabled trả503. Cả hai responses/rollback đúng, song capture không có event chứa request trace hoặc WARN/ERROR nào:

```text
MISSING_STORED_EVIDENCE status=500 code=INTERNAL_ERROR traceMatches=true
trace=de033076-27b8-470a-a1c3-1bbb6a07bddf traceLogEvents=0 warnErrorEvents=0
documentStatus=PENDING kycSnapshot=NONE
DISABLED_PRIVATE_STORAGE status=503 code=DEPENDENCY_UNAVAILABLE traceMatches=true
trace=11d6fbb6-8598-40b3-9b8c-ff697abdc894 traceLogEvents=0 warnErrorEvents=0
documentStatus=PENDING kycSnapshot=NONE
```

P06 prompt bước6 yêu cầu safe error log rồi throw giữ cause. Khi private evidence lỗi, trace trả cho client hiện không có diagnostic tương ứng để tìm operation/document/failure category. Test chỉ assert sentinel vắng mặt có thể đạt vì hoàn toàn không có log; cần assert positive diagnostic event nữa.

**Sửa:** ghi safe review failure event cho500/503 và caught DB23505 translation ở boundary phù hợp, giữ primary/cause/rollback/trace. Action/actor/document/owner IDs nếu đã biết, errorCode/exceptionType/constraint allowlist là đủ; không raw throwable/message/cause/path/locator/docNumber/reason. Không cần log mọi domain400/403/terminal409 thành ERROR, không bật lại Hibernate JDBC/SQL logging hoặc thêm durable audit. Regression bắt cả message/throwable chain, có positive event và privacy assertions.

### R2 — [P2] Test review/upload tạo overlap trước transaction, chưa chứng minh owner-row serialization khi cả hai writers đang ở DB

**Vị trí:** `src/test/java/com/carrental/UserDocumentReviewPostgresIT.java:612–655`, test `reviewOwnerAndNewSubmissionSerializeWithoutLosingSnapshotOrPendingSubmission`.

Test giữ upload ngay trong `storage.store`, trước khi submission gọi TransactionTemplate/owner row lock. Nó cho HTTP review commit hoàn toàn, rồi mới release upload để bắt đầu metadata transaction. Hai requests overlap ở file stage, nhưng hai metadata transactions chạy tuần tự do latch. Assertion VERIFIED sau review APPROVED rồi thêm PENDING vẫn đúng kể cả chưa chứng minh contention hay aggregate đã thấy submission commit trước review evaluation.

Existing owner-row timeout test đã chứng minh review có row lock thật, nhưng dùng connection blocker riêng và không kiểm tra hai F1 mutations/KYC precedence qua commit boundary. R2 là evidence/regression gap của prompt bước8; review không khẳng định source hiện mất dữ liệu.

**Bổ sung:** actual upload transaction giữ owner lock sau persist/flush, launch review và chứng minh nó đang chờ đúng backend PID/owner lock trước release; commit upload rồi cho review reject existing PENDING. Vì còn submission PENDING mới, snapshot/current phải PENDING, không REJECTED. Kiểm tra metadata/audit/files/reviewer/log đúng cả hai. Có thể dùng `pg_backend_pid()`/`pg_blocking_pids()` với bounded polling trên DB test để xác nhận blocker; [PostgreSQL15 session information functions](https://www.postgresql.org/docs/15/functions-info.html#FUNCTIONS-INFO-SESSION-TABLE).

Giữ original pre-transaction overlap test và mô tả đúng evidence của nó. Không fake repository/transaction/receipts hoặc đòi cả hai callbacks vượt cùng exclusive owner lock. Test-only hooks chỉ ép timing/fault, actual query/flush/commit vẫn chạy. Không đổi production lock/KYC behavior để né testcase.

## 3. Phần đạt và giới hạn

- Strict DTO/internal keys/duplicates/query, ADMIN/self-review, transaction-time actor recheck và terminal switch có implementation/regression.
- Prerequisites U-13, storage validation, reject khi storage disabled, partial unique index thật/23505, rollback document+customer và afterCommit success event có evidence đạt.
- Single-statement current KYC projection có account/status/identity aggregates, Clock expiry boundary và GET không write; snapshot/P05 submission semantics đúng scope đã đặc tả.
- Same-document/cross-owner review races, actor-lock recheck và owner-row timeout/retry đã chạy đạt. R2 không phủ nhận các test này.
- P01–P05, U-11/U-12/U-13, schema/reference, production config/OS/multi-node/crash limitations giữ nguyên. Không mở renewal/revoke/driver/audit schema.

Lượt reviewer không sửa production source/tests trong repo, stage/commit/push hoặc DB chung. Thực hiện **[P06-FIX-01](../prompts/P06_FIX_01.md)**, báo READY_FOR_REVIEW rồi dừng; P07 NOT_STARTED.
