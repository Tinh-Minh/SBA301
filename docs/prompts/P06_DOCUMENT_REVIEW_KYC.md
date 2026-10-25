# PROMPT P06 — Duyệt giấy tờ và tổng hợp KYC

Bạn là Agent code triển khai **P06** tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. P01–P05 đã APPROVED theo docs/reviews. Thực hiện **9 bước** trong prompt, báo `READY_FOR_REVIEW` rồi dừng; chưa làm P07.

## 0. Phạm vi và mức độ xác nhận

Phạm vi Function 1, lần này chỉ `user_documents`/`customers`, endpoint review và KYC. Schema leader/migration/reference giữ nguyên. Không thêm role/table/column/@Version, workflow driver/xe/order/payment/bank/voucher, renewal/revoke, sweeper hoặc audit table.

Ngày 2026-10-14 người dùng đã xác nhận **U-11/U-12/U-13**: cấm ADMIN self-review; identity KYC bằng CCCD/PASSPORT còn hiệu lực, GPLX riêng cho driver; metadata/ảnh/hạn như 3 dòng đầu bên dưới. Đây là quy tắc sản phẩm đã chọn, không phải quy định pháp luật suy ra từ tên giấy tờ. Các dòng còn lại là baseline kỹ thuật/nghiệp vụ đề xuất cho P06; nếu có yêu cầu trực tiếp mới, cập nhật trước code.

| Policy | Nội dung và mức độ xác nhận |
|---|---|
| Quyền tự review — U-11 | ADMIN không được APPROVE hoặc REJECT giấy tờ của chính mình; user đã xác nhận |
| Identity KYC — U-12 | CCCD (`CITIZEN_ID`) hoặc `PASSPORT` APPROVED còn hiệu lực đủ cho VERIFIED; GPLX là chứng cứ riêng cho P07, không nâng/hạ identity KYC; user đã xác nhận |
| Metadata/ảnh để approve — U-13 | Cả 3 loại cần họ tên, ngày sinh, ngày/nơi cấp; CCCD/GPLX đủ 2 mặt, hộ chiếu mặt trước; GPLX có licenseClass/hạn, CCCD/hộ chiếu được NULL hạn; user đã xác nhận |
| Hiệu lực ngày | Có hạn thì `expiresAt >= today` theo Clock app; có hiệu lực đến hết ngày ghi trên hạn. NULL hạn của identity là không có mốc hết hạn trong baseline; không áp dụng cho GPLX |
| State chuyển | Chỉ PENDING → APPROVED hoặc REJECTED; terminal không sửa/duyệt lại; gửi lại bằng submission P05 mới |
| Owner LOCKED | ADMIN khác vẫn được review để xử lý hồ sơ; review không mở khóa account. KYC và account status độc lập; permission/eligibility vẫn cần ACTIVE |
| Chứng cứ nhiều bản | Không thêm unique theo owner/type. Giữ index leader `(doc_type, doc_number) WHERE APPROVED`, kể cả duplicate cùng owner; không sửa số giấy tờ hoặc REJECT bản cũ để né index |

U-11/U-12/U-13 là yêu cầu đã chốt; không thêm switch cho phép bỏ qua để tests qua. Các baseline còn đề xuất phải ghi rõ trong docs/report; không xây rule engine hay role động. Không dừng phần review/persistence/security độc lập chỉ vì thiếu production secrets.

## 1. Bước 1 — Đọc code và chốt hợp đồng trước khi sửa

Đọc AGENTS, docs/01/03/04/05/07/12, IMPLEMENTATION_STATUS, review P05-FIX-02, schema5 bảng F1 và các service/controller/repository/logger hiện có. Kiểm tra BE/HEAD/status, giữ project untracked; không stage/reset/clean/stash/đổi nhánh/commit/push/DB chung. Không sửa historical reports/reviews/prompts/reference.

Đầu ra cần có: `UserDocumentService.review(...)`, request/response riêng, repository lock/query cần thiết, KYC policy/service theo interface, after-commit safe review log, PostgreSQL/HTTP/concurrency tests và docs/report. Dùng naming có nghĩa; không sinh service cho mọi bảng hoặc controller riêng cho mỗi role.

## 2. Bước 2 — API và DTO strict

### Review command

Thêm vào **UserDocumentController đang có**:

```http
PATCH /api/user-documents/{id}/review
Authorization: Bearer <ADMIN access-token>
Content-Type: application/json

{"verifyStatus":"APPROVED"}
```

Hoặc:

```json
{"verifyStatus":"REJECTED","rejectReason":"Thông tin trên giấy tờ chưa đầy đủ"}
```

- Positive id; ADMIN ACTIVE tại HTTP/method security **và transaction recheck**. CUSTOMER 403, invalid/locked token 401; missing document 404. Query params trên command bị reject 400.
- `ReviewUserDocumentRequest` chỉ nhận 2 keys trên, exact uppercase enum, không coercion number/boolean/array. Missing/null/PENDING/unknown status 400. Duplicate keys (kể cả helper/presence fields)400; không JavaBean getters làm internal parser state bind được, giữ bài học P04.
- REJECTED cần trimmed nonblank reason≤ 500 theo column. APPROVED chỉ cho reason omitted/null, không silently discard text. Không log reason; UI tự hiển thị lỗi an toàn, không raw rejected value.
- Request không quyết định customerId/verifiedBy/verifiedAt/kycStatus/audit/metadata/ảnh/locator. Không bind entity hoặc cho admin sửa số giấy tờ tại endpoint review.
- Response 200 `ApiResponse<UserDocumentReviewResponse>` chứa `document` (existing allowlisted detail DTO), `kycStatus` được tính ở command và `evaluatedOn`. No-store/trace giữ; không locator/path/account credentials/entity.
- Terminal request kể cả cùng decision trả 409 `DOCUMENT_ALREADY_REVIEWED`, không thay verifiedBy/time/reason/audit hoặc ghi success log lần hai.

Dùng error codes cụ thể trong ErrorCode: self-review 403 `DOCUMENT_SELF_REVIEW_FORBIDDEN`; state 409 `DOCUMENT_ALREADY_REVIEWED`; missing review prerequisites 409 `DOCUMENT_NOT_APPROVABLE`; approved uniqueness 409 `APPROVED_DOCUMENT_CONFLICT`. Missing/corrupt stored files và dependency failures giữ 500/503 an toàn theo P05; lỗi binding 400/trace thống nhất.

## 3. Bước 3 — Transaction/locks và recheck quyền

Review là một transaction DB có `@Transactional`, qua interface/service proxy. **Reuse protocol CustomerStatusLock hiện có** để serialize review cùng admin status commands trong baseline F1. Acquire global transaction advisory lock trước mọi customer/document row lock; giữ timeout và exact55P03→503 classification. Ghi rõ shared serialization giảm throughput và scope version đầu, không tự thêm namespace/tables hoặc refactor P04 để vượt review.

Ordering:

1. Validate request thuần dữ liệu, acquire advisory lock.
2. Lock/read lại actor từ DB; ACTIVE/ADMIN hiện tại, không chỉ trust JWT principal snapshot. Actor đã LOCKED 401/role đổi 403, trước mutation/IO.
3. Discover owner bằng scalar/projection query không đưa document entity chưa-lock vào persistence context. Lock/read owner row, sau đó lock/read document row và xác nhận owner/terminal status hiện tại. Không dùng entity stale đã findById trước wait rồi coi lock đồng nghĩa refresh.
4. Check self-review theo policy và `switch` current verifyStatus. PENDING mới được đi tiếp; APPROVED/REJECTED 409. Owner LOCKED không được tự unlock; quyền actor vẫn phải hợp lệ.
5. Approve prerequisites/unique checks, mutate review metadata, flush, tính KYC owner từ current rows trong cùng transaction và persist snapshot nếu thay đổi. Map response và đăng ký safe afterCommit event. Lỗi bất kỳ rollback cả document lẫn customer/audit.

P05 upload/profile chỉ khóa owner row; review global→actor→owner→document phải tương thích P04 global→actor→target, không lấy row rồi quay lại chờ advisory lock. Owner lock serialize KYC evaluation với submission metadata. Không sleep/chọn SERIALIZABLE thay cho protocol có giải thích. Không mở transaction riêng cho customer KYC làm partial commit.

## 4. Bước 4 — Approval/rejection và ràng buộc leader

### APPROVED

- Validate metadata theo policy0. DOB không tương lai, issueDate không tương lai/không sau expiry; expiry hôm qua không approve, today được approve theo Clock. Không đặt tuổi/regex/quốc gia/hạng bằng ngoài schema hoặc tự đồng nhất tên tài khoản với tên giấy tờ bằng exact string.
- Cần ảnh theo loại. Dùng storage interface và inspector P05 để xác nhận actual stored bytes có thể đọc và hợp lệ, với caps/locator/permissions giữ. Không chỉ nhìn cột URL nonnull. Check actor/state trước IO; storage disabled/unavailable 503, missing/corrupt/invalid locator safe 500; không approved row/KYC/success log khi thất bại.
- Existing approved `(docType, docNumber)` conflict 409 không tiết lộ owner/số giấy tờ của record khác. Precheck giúp phản hồi rõ nhưng **unique index PostgreSQL là authority cuối**; không bỏ index hoặc chỉ synchronized Java.
- Set status APPROVED, rejectReasonNULL, verifiedBy actor DB, verifiedAt từ Clock theo timezone app. Không đổi document owner/type/number/ảnh/createdAt hoặc account role/status/emailVerified/profile.

### REJECTED

- Chỉ cần valid rejection reason, actor/state hợp lệ; không đòi metadata approval đầy đủ, ảnh readable hoặc storage enabled để reject hồ sơ xấu.
- Set status REJECTED, reason trimmed, verifiedBy/time như trên. Không xóa files; giữ owner/admin đọc được evidence theo P05. Không sửa giấy tờ APPROVED khác hoặc driver.

### Constraint/rollback

Classify exact SQLState23505 + `uq_user_doc_approved` thành conflict an toàn. Không đổi mọi DataIntegrityViolationException thành 409; unknown integrity errors giữ error handling đúng. Giữ raw JDBC/SQL logging tắt như P03-FIX-01. Không query lại trong transaction PostgreSQL đã aborted để recover; translate/rethrow sao cho rollback vẫn hoàn tất và preserve cause nội bộ. Không log throwable chain/DB detail có docNumber/name/reason; log safe trace/action/exceptionType/constraint-name allowlist.

## 5. Bước 5 — KYC policy và hợp đồng đọc hiện tại

Tách identity KYC khỏi driver eligibility. Dùng một policy/service để command và query cùng tính, không duplicate enum-transition/business rules trong mapper/controller. Không xem GPLX APPROVED là proof identity nếu policy0 không đổi.

Với `today=LocalDate.now(applicationClock)`, baseline thứ tự:

| Ưu tiên | Điều kiện chỉ xét CITIZEN_ID/PASSPORT | KYC hiện tại |
|---|---|---|
| 1 | Có APPROVED và `expiresAt IS NULL OR expiresAt >= today` | VERIFIED |
| 2 | Không đạt1, có PENDING | PENDING |
| 3 | Không đạt1/2, có REJECTED | REJECTED |
| 4 | Không đạt các điều kiện trên | NONE |

NONE ở projection hiện tại nghĩa không có proof identity đang đủ hiệu lực hoặc hồ sơ chờ/từ chối theo precedence. APPROVED đã hết hạn không bị tự đổi REJECTED. Nhiều rows/type/số khác nhau giữ theo SQL; pending/rejected mới không hạ VERIFIED nếu vẫn còn proof approved hợp lệ. Chỉ GPLX thì identity summaryNONE. Không tính dựa vào “row cuối cùng” hoặc decision vừa nhận.

`customers.kyc_status` được ghi **snapshot tại review command** trong cùng transaction. P05 submission vẫn không đổi KYC/account để giữ contract đã duyệt. Snapshot có thể cũ sau submission mới hoặc qua ngày hết hạn, vì schema không có hiệu lực snapshot/job; **không dùng riêng column này cho eligibility F2/F3/P07**.

Để có API current-state đúng mà không GET ghi DB hoặc thêm scheduler, thêm vào CustomerController:

- `GET /api/customers/me/kyc`: account ACTIVE, owner từ principal.
- `GET /api/customers/{id}/kyc`: ADMIN ACTIVE, có thể xem owner LOCKED, 404 nếu không có account.
- `ApiResponse<KycSummaryResponse>` chỉ `customerId`, `accountStatus`, `kycStatus` **đánh giá hiện tại**, `evaluatedOn`; no-store/trace, không full documents/PII/path. Service interface `KycService` lấy account/status và các cờ aggregate identity từ một database statement/projection theo customer trong read-only transaction, không tải mọi documents hoặc cập nhật audit trên GET. `readOnly=true` riêng nó không bảo đảm nhiều statement READ_COMMITTED cùng snapshot; không dùng 3 queries exists rời nhau rồi gọi là đọc nhất quán.
- Customer profile/list/admin DTO hiện có giữ field snapshot và filters hiện có; docs phải ghi rõ semantics khác current KYC endpoint. Không đổi pagination thành Java filter. Current summary endpoint và internal service là contract cho nhóm kiểm tra theo thời điểm; account ACTIVE là điều kiện quyền/eligibility độc lập.

Không tự backfill toàn DB, chạy SQL chung, đổi status theo thời gian trong GET hoặc tạo expiry cron. Snapshot/history limitation phải được report; current-query Clock tests phải chứng minh hôm nay→ngày mai thay kết quả dù không có mutation. Metadata projection đánh giá status/expiry; không đọc lại ảnh của mọi proof ở mỗi GET.

## 6. Bước 6 — Audit, logs và rollback semantics

- Document transition có actor/time/reason theo schema; createdAt giữ, updatedAt theo audit DB/P02. Customer snapshot changed thì updatedAt thay, unchanged thì không force touch. Clock dùng nhất quán; không `LocalDate.now()`/`LocalDateTime.now()` hệ thống rải rác.
- Review success log chỉ **after commit**: action=document-review, traceId, actorId, ownerId, documentId, type, old/new status, old/new KYC, reasonProvided boolean. Không reason/docNumber/name/date/place/filename/path/locator/JWT/raw SQL/throwable cause.
- Error log cần safe trace/action/type và throw lại với cause giữ trong exception nội bộ; không nuốt/finally rỗng. Không gửi raw exception vào logger vì cause chain có thể chứa PII. Capture cả rendered message và throwable/cause/suppressed trong tests.
- Files không được rewrite/delete khi review rollback hoặc rejection. Không đổi P05 receipt cleanup/outcome coordinator, không log success của transaction rollback/terminal retry.
- VerifiedBy/verifiedAt/reason chỉ thể hiện lần review hiện tại, không durable history. Không dùng order action_logs; Q-09/history vẫn ngoài scope.

## 7. Bước 7 — Unit/HTTP/PostgreSQL regression

Tạo `UserDocumentReviewPostgresIT` (hoặc tên tương đương rõ) dùng PostgreSQL15.13 Testcontainers, actual HTTP/security/transactions, synthetic ảnh/key/external root. Tạo pure policy tests với fixed Clock; không chỉ mock service để kiểm tra HTTP contract. Tối thiểu:

1. CUSTOMER 403, unauthenticated/locked 401, nonpositive/missing 404 hoặc 400 đúng; self-review 403 và rows/audit/files unchanged. ADMIN khác review owner LOCKED được nhưng không unlock.
2. Missing/null/invalid/PENDING decision, unknown/helper/internal/actor/KYC keys, duplicate keys, wrong types/query params; reasonblank/oversize/approve-with-text reject 400, sentinel không lộ trong body/log, các rows/audit nguyên trạng.
3. Valid approval/rejection qua HTTP: metadata reviewer/time/status/reason chính xác, document.createdAt và unrelated account fields giữ; KYC/customer cùng commit, response/trace/no-store, files unchanged. Rejection có thể chạy khi storage disabled/corrupt hoặc hồ sơ thiếu metadata.
4. Approval prerequisites cho từng loại/ảnh: missing optional-at-upload fields nay cannot approve 409, missing back khi policy yêu cầu, expiryNULL/type rule, yesterday/today/tomorrow, futureDOB/issueDate; resource missing/corrupt/disabled 500/503 safe, không mutation.
5. Terminal/repeat/mixed retry 409 không đổi actor/time/reason/audit, không success log mới.
6. KYC precedence: approved hợp lệ + pending/rejected vẫnVERIFIED; no valid + pendingPENDING; only rejectedREJECTED; only GPLXNONE; old expired approved không bị đổi trạng thái hoặc coiVERIFIED. Query current-state ở Clock ngày sau đổi result, stored snapshot/audit không bị GET sửa.
7. Actual unique conflict across owners và same owner; safe 409, customer/doc rollback, no file deletion. Có ca **thực sự hit `uq_user_doc_approved`/23505 PostgreSQL**, fault/spy có thể làm precheck miss nhưng phải dùng actual persist/flush/constraint, không chỉ throw mocked DataIntegrityViolationException. Bắt logs/cause có PII sentinel và assert không lộ.
8. Force failure sau document và KYC flush trước commit: cả 2 rollback/audit giữ, không afterCommit success event, files nguyên trạng; không convert lỗi repository nội bộ thành lỗi credentials/validation.
9. KYC GET owner/admin scope, owner không dùng admin path, locked actor/no token denied; no entity/password/documentNumber/file paths; transaction read-only và GET không touch audit. Customer list snapshot filter còn đúng contract.

Không sửa assertions R1/R2/R4/root tests để né failures. Bộ87 P01–P05 vẫn phải chạy; test mới bổ sung P06, báo từng suite/pass/fail/skip thật.

## 8. Bước 8 — Concurrency/timeout thật có barriers

HTTP/filesystem/PostgreSQL với ordering xác định và bounded waits; hook/spy chỉ timing/fault, không fake transactions/IO/repository:

- Hai ADMIN review **cùng PENDING document**, decisions khác: đúng 1 HTTP 200, loser 409; verifiedBy/time/reason/KYC khớp winner, không lost update/audit hoặc success log đôi. Không barrier đòi cả 2 đã vào vùng exclusive lock, vì protocol serialize là chủ đích.
- Hai owners có cùng `(type, number)` approved concurrent: tối đa 1 APPROVED, loser 409; KYC của loser không bị nâng. Thử khác owners để không gọi cùng-owner row serialization là chứng minh unique cross-owner.
- Review đã qua auth bị giữ trước advisory/actor recheck; ADMIN khác khóa actor và commit trước release. Review 401, document/customer/files/log unchanged. Lock target owner đồng thời không được làm review tự unlock hoặc dùng stale actor.
- Review owner cùng lúc submission identity mới: chứng minh owner row protocol không mất metadata/KYC snapshot; current KYC query sau cả 2 commit tính tất cả rows theo precedence. Submission vẫn 201/PENDING và không chạm snapshot theo contract P05.
- Connection PostgreSQL khác giữ advisory hoặc owner/document row; app timeout ngắn trong fixture. HTTP 503 `DEPENDENCY_UNAVAILABLE`/trace, rollback không mutation/file change, release blocker rồi retry thắng đúng. Không mock lock exception thay đường DB thật.

finally release mọi blocker/latch, dọn executor/process/context/container; không infinite join hoặc sleep may rủi. Report timeline và assertions thật, không chỉ “concurrency PASS”.

## 9. Bước 9 — Full verify, tài liệu/report và dừng

Chạy targeted khi sửa rồi:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

Health HTTP 200/UP/trace trên app/PostgreSQL test, key/root tổng hợp. Giữ actual Boot root regression và packaging không local/key/bootstrap/document/root/helper markers. Không production key/ảnh thật/DB chung. Giữ5 leader entities/migration/reference SHA-256; không chạy backfill vì KYC snapshot.

Viết `docs/13_DOCUMENT_REVIEW_KYC.md`, cập nhật API/architecture/plan/decisions/README/roadmap/AGENTS/localguide/status hiện hành; mô tả request/response/errors, policies đề xuất vsuser confirmed, global lock order, unique rule, current vsstored KYC/date boundary, FE fetch, liên kết P07/F2/F3 và history/expiry/OS/crash limitations. Không sửa report/review lịch sử hoặc gọi P06 APPROVED.

Chỉ sau implementation tạo **`docs/reports/P06_REPORT.md`**, gồm file inventory, lệnh thực chạy/test counts/logs, HTTP/traces, DB23505/lock/race evidence, audit/rollback/log-privacy assertions, hashes/Git/untracked và limitations. Không tạo fake report từ expected results. Nếu policy user trả lời mới khác baseline, báo thay đổi đó cụ thể.

Đủ evidence thì **P06 READY_FOR_REVIEW, P07 NOT_STARTED**. Gửi report và dừng; không commit/push/chuyển nhánh hoặc tự triển khai P07.
