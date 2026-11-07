# PROMPT P05 — Gửi giấy tờ và storage local private

Bạn là Agent code tiếp tục Function 1 tại `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh **BE**. Đọc và thực hiện toàn bộ prompt, kiểm tra, viết report rồi dừng để review. **Chỉ làm P05, chưa làm P06.**

P01–P04 đã APPROVED theo các review; đọc [review P04-FIX-01](../reviews/P04_FIX_01_REVIEW.md). Đầu vào có **57/57 test** và packaging PASS, cần giữ regression khi thêm multipart/storage. **Người dùng đã chọn:** local private ngoài thư mục public/JAR, có storage interface để thay provider sau. Không tự chuyển Supabase Storage hoặc gọi cloud/shared DB.

## 1. Phạm vi và 9 bước thực hiện

P05 đạt luồng: account ACTIVE gửi metadata/ảnh → tạo user_documents PENDING → xem danh sách/detail có quyền → tải ảnh qua API có JWT. Các bước: đọc hiện trạng; hợp đồng multipart; storage/config; kiểm tra ảnh; transaction/cleanup; list/detail/download; security/errors/log; kiểm tra; tài liệu/report.

Thêm UserDocumentController, UserDocumentService/interface/Impl, request/response/query/mapper và private-storage adapter phù hợp. Giữ Java21/Boot4.0.8/Jackson3, entity/repository/schema leader. Không đổi bảng/cột/index/trigger/Flyway, thêm @Version hoặc audit table. Không làm review APPROVED/REJECTED, tính/đổi customers.kyc_status, kích hoạt driver, renewal/revoke/delete giấy tờ, OCR, role hoặc function khác.

Không stage/commit/push, đổi branch, reset/clean/stash, sửa docs/reference/historical review/report hoặc chạy database chung. Tests dùng PostgreSQL/key/file tổng hợp trong thư mục tạm; không dùng ảnh CCCD/GPLX thật từ máy người dùng để kiểm tra.

## 2. Bước 1 — Đọc và kiểm tra hiện trạng

Đọc AGENTS, IMPLEMENTATION_STATUS, docs/01–03, docs/05, docs/07, docs/09–11, reviews P03-FIX-01/P04-FIX-01. Kiểm tra branch/HEAD/status; source/docs đang untracked nên git diff rỗng không chứng minh không có thay đổi.

Đọc UserDocument entity/repository/type/status, CustomerRepository/row lock, CurrentAccount/security/error/trace, CustomerListQuery/DTO strict input và các test hiện có. Schema có nullable back image và phần metadata; unique index chỉ trên `(doc_type,doc_number)` khi APPROVED. Không bịa thêm unique pending/owner-type hoặc regex/case normalization của CCCD/GPLX.

Lập checklist endpoint/DTO, file lifetime, transaction cleanup và tests trước code. Đừng tạo mọi class P06 rỗng hoặc review endpoint giả để test admin.

## 3. Bước 2 — Hợp đồng HTTP và multipart chặt chẽ

| Method / endpoint | Quyền | Success |
|---|---|---|
| POST /api/user-documents | ACTIVE CUSTOMER/ADMIN, cho chính mình | 201 ApiResponse<UserDocumentDetailResponse>, Location tới detail |
| GET /api/user-documents | ACTIVE; scope mặc định mine, all chỉ ADMIN | 200 ApiResponse<PageResponse<UserDocumentSummaryResponse>> |
| GET /api/user-documents/{id} | Chủ bản ghi hoặc ADMIN ACTIVE | 200 detail envelope |
| GET /api/user-documents/{id}/files/{side} | Chủ bản ghi hoặc ADMIN ACTIVE; front/back | 200 bytes ảnh đã kiểm tra qua authenticated API |

Các route thuộc cùng UserDocumentController. Method security/service kiểm tra quyền; không phân controller theo role. POST chỉ consumes multipart/form-data. Giữ **các scalar multipart fields** đã đề xuất, không bind entity hoặc generic ModelAttribute với mass assignment:

| Part | Hợp đồng |
|---|---|
| docType | Bắt buộc exact CITIZEN_ID / DRIVER_LICENSE / PASSPORT |
| docNumber | Bắt buộc, trim/nonblank, String <=50; giữ số0 đầu/case/nội dung, không convert numeric |
| fullNameOnDoc | Optional, trim, <=150; blank thànhNULL |
| dateOfBirthOnDoc | Optional ISO yyyy-MM-dd; blank thànhNULL, không tương lai theo Clock VN |
| issuePlace | Optional, trim, <=200; blank thànhNULL |
| issueDate | Optional ISO date; blank thànhNULL |
| expiresAt | Optional ISO date; blank thànhNULL; nếu cả issueDate/expiresAt có giá trị thì issueDate<=expiresAt |
| licenseClass | Bắt buộc nonblank khi DRIVER_LICENSE, <=10; loại khác optional theo schema, không bịa danh sách hạng |
| frontImage | Đúng một file bắt buộc, không rỗng |
| backImage | Tối đa một file optional; có part thì phải có nội dung ảnh hợp lệ |

Back image chưa bị bắt buộc theo loại ở P05; policy KYC/duyệt P06 còn Q-02. Optional expiry NULL hoặc giấy tờ hết hạn không tự quyết định eligibility/KYC; P05 chỉ tiếp nhận bằng chứng và kiểm tra cấu trúc/ngày cấp<=hạn. Không suy ra hồ sơ đủ điều kiện thuê/lái từ PENDING.

Mỗi part nhận tối đa một lần. Reject part trùng, field/part lạ (kể cả customerId/ownerId/id/status/verifyStatus/KYC/reviewer/audit/frontImageUrl/backImageUrl và helper flags), file vào scalar slot, scalar vào file slot, malformed multipart và tham số query cho POST. Không silent ignore hoặc chọn first/last value. Dùng toàn bộ parameter/part inventory để kiểm tra, không chỉ collection đã được binder lọc. Parse typed request sau allowlist/presence kiểm tra. Chú ý file part filename rỗng có thể được container phân loại khác: test qua HTTP thật.

Scalar field có length/date/type/enum lỗi trả400 safe; field lạ/part lặp trả400 INVALID_REQUEST. Missing/nonempty file validation trả400 với message tĩnh. Input nội bộ không có setter/helper có thể bind ngoài hợp đồng, giữ bài học P04-FIX-01. Không log MultipartFile/DTO/toString/body.

Server luôn gán owner từ principal, verifyStatus=PENDING, rejectReason/verifiedBy/verifiedAt=NULL; audit từ DB. **Không thay KYC/account/driver khi nộp.** Mỗi submission hợp lệ là row mới; không cập nhật/ghi đè record APPROVED/REJECTED/PENDING đã có. Schema cho phép nhiều pending submissions: không tự đặt one-pending/one-per-type rule hoặc chuyển status cũ. Row mới không tự thay thế/thu hồi giấy tờ đã duyệt; việc giải quyết approval conflicts/gia hạn thuộc P06/Q-03.

DTO response:

- Summary: id, docType, docNumberMasked, verifyStatus, hasFrontImage, hasBackImage, createdAt, updatedAt. ADMIN scope=all có customerId để phân biệt owner; mine response cũng có thể giữ cùng customerId nhưng không thêm profile/email/phone.
- Detail: id, customerId, docType, docNumber đầy đủ, fullNameOnDoc, dateOfBirthOnDoc, issuePlace, issueDate, expiresAt, licenseClass, verifyStatus, rejectReason, verifiedById, verifiedAt, hasFrontImage/hasBackImage, createdAt/updatedAt.
- Mask helper che toàn bộ nếu docNumber<=4 ký tự; dài hơn chỉ giữ tối đa4 ký tự cuối, phần còn lại mask. Đây là baseline hiển thị cấu hình/constant có nghĩa, không luật định dạng giấy tờ. Không include số đầy đủ trong summary hoặc keyword search.
- Không trả entity, raw storage locator/path/frontImageUrl/backImageUrl hoặc public file URL. Quyền detail đầy đủ là owner/admin như bảng, không public.

## 4. Bước 3 — Private storage interface và cấu hình

Tạo PrivateDocumentStorage/interface và LocalPrivateDocumentStorage adapter; abstractions tập trung store/open/delete và opaque receipt/locator. Không tạo service riêng cho từng ảnh, dùng path client cung cấp hoặc đưa Spring Resource có absolute path ra JSON.

Properties validated, baseline kỹ thuật có thể cấu hình:

| Property | Baseline |
|---|---|
| app.document.storage.enabled | false mặc định |
| app.document.storage.root | Không mặc định; bắt buộc absolute path nếu enabled=true |
| app.document.upload.max-file-size | 5MiB/file, configurable |
| app.document.upload.max-request-size | 11MiB/request, configurable, đủ2file+fields |
| app.document.upload.max-image-pixels | 20,000,000, configurable |
| app.document.upload.max-image-dimension | 10,000 mỗi chiều, configurable |
| app.document.list.default-page-size / max-page-size | 20 /100, validated |

Các defaults là baseline kỹ thuật giới hạn tài nguyên, không tuyên bố nhóm đã chốt chúng làm policy sản phẩm. Validate >0, default page<=max, tổng size/overflow nhất quán. Allowed image formats ở P05 là JPEG/PNG; mở rộng PDF/HEIC/GIF/SVG không thuộc lượt này. Đồng bộ giới hạn Spring Servlet multipart với app properties; không chỉ đọc file rồi kiểm tra size sau khi đã giữ allocation khổng lồ.

Nếu dùng Spring DataSize binding, cấu hình `5MB`/`11MB` (tương ứng 5/11×1024×1024 bytes) và kiểm tra syntax supported ở phiên bản đang dùng; ký hiệu MiB trong bảng mô tả đơn vị binary, không yêu cầu parser nhận literal `5MiB`. [Spring DataSize](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/util/unit/DataSize.html).

Nếu disabled: app/P01–P04 vẫn start, không sinh folder/file hoặc fallback public/in-memory; authorized upload/download trả 503 DEPENDENCY_UNAVAILABLE, list/detail DB vẫn dùng được. Nếu enabled: root missing/relative/unsafe/unwritable phải fail startup rõ nhưng không in secret/path vào HTTP. Không auto chọn cwd/target/src/main/resources/static/public hoặc copy files vào JAR.

Ví dụ root local: `C:\Users\FPTSHOP\AppData\Local\SBA301_RentCar_Private\user-documents`. Chỉ ghi cấu hình/path vào example/docs; không dùng các giấy tờ thật hoặc tự đổi ACL hệ thống. Giải thích quyền thư mục dành cho account chạy app trong hướng dẫn local/deploy. Filesystem admin có quyền OS vẫn đọc được; local private không phải mã hóa/backup/multi-node shared storage.

Root được normalize/canonicalize và kiểm tra không nằm trong repository/public/classpath/build resources. UUID filename do server sinh, không chứa docNumber/email/name/id do client gửi. Có thể lưu locator versioned `private-local:<uuid>.jpg`/`.png` trong **cột URL hiện có**, <=500; document đây là locator nội bộ, không web URL. Prefix/UUID/extension grammar phải strict khi resolve, root/locator không expose API.

Read/write/delete chỉ thao tác filename đã kiểm tra dưới root; không absolute/traversal/encoded traversal/Windows drive/UNC/alternate data stream do request chọn. Từ chối symlink/reparse escape nếu xuất hiện; kiểm tra canonical containment/regular file phù hợp Windows. Không theo locator HTTP/file URI hoặc tải nội dung từ URL. Chứng minh các test path không thể đọc/xóa file ngoài root.

Tạo file mới không overwrite (CREATE_NEW), tên độc lập cho front/back; dùng staging/promotion hợp lý và đóng streams. Cleanup/delete chỉ keys sinh ở submission hiện tại với receipt kiểm chứng, không recursive delete folder. Root và artifacts không nằm trong Git/JAR; thêm packaging regression dummy private-document marker nếu cần để bảo vệ nhầm vị trí.

## 5. Bước 4 — Kiểm tra ảnh theo nội dung và giới hạn decode

Tối thiểu pipeline:

1. Giới hạn byte stream tại ingress và app, không chỉ tin declared Content-Length/MultipartFile size; reject empty/too large.
2. Kiểm tra filename nếu có cho JPEG/PNG extension và tên hợp lệ; không dùng nó làm tên lưu. Filename traversal, double-extension/ADS/NUL/control/CRLF bị từ chối an toàn.
3. Xác định JPEG/PNG bằng bytes/signature và decoder, không tin Content-Type hoặc extension. MIME/extension mâu thuẫn với nội dung phải reject; không nhận HTML/SVG/script/ZIP/PDF dù đặt .jpg.
4. Đọc dimensions từ ImageReader trước full decode, long multiplication chống overflow; reject vượt pixel/dimension cap. Không decode ảnh khổng lồ rồi mới kiểm tra. Reader/input/output/resources được dispose/close.
5. Decode đủ và re-encode canonical JPEG/PNG, không mang metadata/EXIF/comments/nội dung appended theo input; giữ dimensions, không tự crop/resize/OCR. Bounded output size, không ghi vô hạn file re-encoded lớn hơn cap. Kiểm tra chất lượng ảnh test sau decode lại.
6. Lưu chỉ bytes canonical đã kiểm tra; front/back đều validate trước metadata commit. Ảnh thứ hai lỗi không để ảnh thứ nhất tồn tại vĩnh viễn.

Dùng ImageIO/JDK21 nếu đủ, không thêm image toolkit/native process ngẫu nhiên. Không execute shell với filename hay gọi dịch vụ OCR/scan ngoài. Đây là kiểm tra/re-encode ảnh, không tuyên bố đã có antivirus hoặc mọi decoder exploit đều được loại trừ. [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) là nguồn cho giới hạn byte, type validation, server-generated filename và ngoài webroot; [Java21 Files](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html) cho filesystem APIs.

## 6. Bước 5 — Transaction, account row lock và cleanup

DB và local filesystem không có atomic transaction chung. Thiết kế coordinator có outcome rõ và cleanup tracked files. Có thể dùng TransactionTemplate để orchestration nhìn thấy commit outcome hoặc TransactionSynchronization phù hợp; không chỉ catch trong @Transactional method rồi bỏ sót lỗi commit xảy ra sau proxy return.

Các bảo đảm cần đạt:

- Account ID từ authentication, lock/đọc lại Customer row trong DB transaction **trước khi lưu metadata**, xác nhận tồn tại/ACTIVE; actor vừa bị LOCKED trong lúc upload không tạo row. Thiếu/LOCKED401 INVALID_TOKEN. Không tin principal status snapshot để ghi.
- Tạo metadata trên locked owner, server PENDING, reviewer fieldsNULL, audit DB; flush/map DTO trong transaction. Không chạm customers.kyc_status/updatedAt hoặc entity khác.
- Mỗi submission có receipt của files nó đã tạo; success chỉ khi metadata commit hoàn tất và files cuối cùng tồn tại. Chọn thứ tự/promote giúp không commit row trỏ tới file chưa tồn tại.
- Validation/storage/file thứ hai thất bại: không có metadata và không để partial files.
- Constraint/flush/definite rollback hoặc commit failure biết chắc rollback: xóa files của submission, không xóa file của request khác. No-op phương thức cleanup idempotent, không bỏ cause lỗi gốc.
- Cleanup thất bại: preserve primary exception/cause, safe log trace/action/receipt ID, không raw path/PII; report files cần recovery. Không trả201 hoặc âm thầm coi cleanup đã thành công.
- Commit outcome **UNKNOWN**/mất kết nối: không xóa mù file có thể đã được metadata committed tham chiếu. Dùng xác minh bằng transaction mới nếu khả dụng hoặc giữ receipt/orphan cho recovery và báo đúng limitation. Không gọi filesystem+DB là fully atomic trong crash/power-loss.
- Exception ở mapping/serialization sau successful commit không phải lý do xóa file đã committed. Lifecycle receipt chỉ được final hóa dựa trên DB outcome, không “catch mọi exception rồi xóa”.

Giữ lock protocol P04: profile/submission chỉ lock own customer row; status command lấy advisory rồi lock actor/target. Submission không lấy advisory lock sau khi giữ customer row để tránh đảo thứ tự. Nếu validation/re-encode/storage nằm trước row lock, khóa account vẫn được recheck tại metadata write; nếu I/O nằm trong transaction phải bounded và giải thích thời gian giữ lock. Không self-invocation bypass transaction.

Không thêm scheduled orphan sweeper/delete toàn folder hoặc migration chỉ để hoàn thành P05. Ghi procedure recovery/crash limitations; các failure paths xác định ở tests phải cleanup thật. Nếu không có cách đảm bảo một trường hợp, báo chính xác và không giả PASS.

## 7. Bước 6 — List, detail và download có quyền

List query allowlist: scope=mine mặc định; scope=all chỉ ACTIVE ADMIN, customerId chỉ ADMIN với all; optional docType/verifyStatus; page/size/sort. Sort allowlist id/createdAt/updatedAt/docType/verifyStatus, một field,direction, default createdAt,desc + id tie-break. Giới hạn page/int/size/repeated scalars/unknown query tương tự P04; database filter/count trước pagination.

CUSTOMER dùng scope=all hoặc customerId filter trả403 ACCESS_DENIED trước query. ADMIN scope=mine vẫn chỉ của mình; all có thể xem mọi owner, kể cả owner LOCKED để phục vụ quản lý. scope=mine kèm customerId không hợp lệ; không biến mine thành all âm thầm. Không keyword tìm số giấy tờ. Summary không chứa full docNumber/path/link/ảnh/profile.

Detail và file: CUSTOMER query theo `(documentId,currentCustomerId)`; ADMIN query theo ID sau quyền ACTIVE/admin. Không có/ngoài owner scope trả404 RESOURCE_NOT_FOUND giống nhau. Không tải file rồi mới kiểm tra owner, không queryall/filterJava hoặc leak metadata ở error. ID dương/side front-back validated400 nếu sai; optional back không có404. Không nhận storageKey/path/customerId trong query download.

**Local download contract P05:** thành công trả binary JPEG/PNG qua route file có bearer header, không trả PrivateFileAccessResponse/signed public URL. Đây là điều chỉnh thiết kế API đề xuất để phù hợp local private đã chọn; cập nhật docs/03/architecture/plan nhất quán. FE dùng authenticated fetch→Blob, không đưa JWT vào query URL hoặc local path vào img.src.

Headers: Content-Type đúng bytes canonical, Content-Length khi biết, Content-Disposition attachment với tên server-safe như document-<id>-front.jpg, Cache-Control:no-store, X-Content-Type-Options:nosniff, X-Request-ID. Không filename client/PII trong header, không Location file:// hoặc redirect public. API metadata success vẫn JSON envelope; binary success không có ApiResponse body, nhưng lỗi **trước khi gửi bytes** vẫn JSON error envelope/trace. Class-level produces application/json không được làm binary route406 ngoài ý muốn.

Không giữ DB transaction/row lock suốt network streaming. Open/read resource đã authorization, kiểm tra missing/corrupt locator trước body; close stream khi hoàn tất/client disconnect. Authenticated request đã được chấp nhận trước commit khóa không bị thu hồi mid-stream; request kế tiếp bị chặn theo P03. Metadata/file missing trả404; invalid internal locator/data corruption trả server error an toàn, không đọc arbitrary path. Không auto recreate metadata/file thiếu.

## 8. Bước 7 — Security, HTTP errors và logging

Giữ stateless JWT, public allowlist P03, CORS exact origins/methods đang có (GET/POST/PATCH/OPTIONS đủ P05), no credentials/wildcard. Method security ở UserDocumentService; controller không là nguồn quyền duy nhất. Storage không có HTTP static handler/public mapping. Giữ raw JDBC log protections và DTO fix P04.

Mã lỗi cần có/hợp đồng:

- 400 INVALID_REQUEST/VALIDATION_ERROR cho part/schema/enum/date/filename/content không hợp lệ theo phân loại đã ghi.
- 413 PAYLOAD_TOO_LARGE cho byte/request cap; lỗi multipart framework phải trả envelope/trace an toàn nếu app xử lý được. Ghi rõ container rejection ngoài app nếu có; không claim tất cả proxy413 đều có trace.
- 415 UNSUPPORTED_MEDIA_TYPE cho request media hoặc image format không được hỗ trợ; corrupt allowed image400 validation.
- 401/403/404 như quyền/scope;503 DEPENDENCY_UNAVAILABLE cho storage disabled/unavailable thực sự;500 INTERNAL_ERROR cho bug/invariant/internal locator hỏng. Không catch mọi IOException/runtime thành400 hoặc401.

Handler không log DTO, multipart filename/path/bytes, docNumber/full name/DOB/issuePlace/rejectReason, locator/URL/password/JWT/hash hoặc raw SQL/cause Detail. Có safe trace/action/account/document ID/type/status/count/exception class/opaque receipt ID để debug; không user-supplied strings. Không success log trước commit. Log regression phải bắt message/MDC/throwable/cause/suppressed và có positive safe-log assertion.

Tài liệu product/API không expose mechanics filesystem/key/SQL cho người dùng; error message phải giúp người gửi biết yêu cầu invalid/ảnh quá lớn/dịch vụ tạm lỗi mà không lộ implementation.

## 9. Bước 8 — Kiểm tra HTTP, filesystem và PostgreSQL thật

Thêm PostgreSQL IT với real HTTP multipart/bearer, root @TempDir ngoài repo và image bytes tổng hợp; giữ57 regression. Test storageadapter thực write/read/delete, không chỉ mock storage và tuyên bố privatefiles/cleanup đã đúng. Có unit/helpers để kiểm tra caps/path, nhưng integration phải kiểm chứng thực.

| Nhóm | Bằng chứng cần đạt |
|---|---|
| Config | Disabled không tạo root/files và old app vẫn start; enabled missing/relative/public/classpath/unwritable root fail đúng; valid temp root; caps/config invalid fail-safe |
| Submission | JPEG/PNG thật POST201/Location/trace, front/back lifecycle, đúng owner/PENDING/reviewerNULL/audit; detail/map sau commit; KYC/account/driver không đổi |
| Multipart strict | Missing/empty/duplicate file/scalar, unknown/helper/audit/status/URL/owner keys, file vào scalar/scalar vào file, wrong date/type/license, giữ docNumber số0/case; rejected input không rows/files |
| Image validation | Fake extension/MIME, SVG/HTML/ZIP/PDF disguised, corrupted/truncated image, malicious filename/ADS/CRLF, byte cap/request cap/output cap/pixel/dimension overflow; metadata/comments/appended sentinel không có trong canonical stored output |
| Privacy/paths | Outside root marker không thể đọc/xóa qua locator/traversal/symlink; predictable public paths không phục vụ file; artifact không chứa marker/private upload; file root/path không có trong JSON/headers/log |
| Query/owner | Mine/all admin/customer, owner A không list/detail/download B (404 cho detail/file), count filter đúng, customer scopeall/filter403, stable paging/sort/repeatedinvalid queries, summary mask |
| Download | Authorized owner/admin nhận đúng bytes/headers; missingback/missingfile404, invalid locator safe500; missing/locked JWT401, customer khác404; content-type/Accept/binary errors trace phù hợp |
| Cleanup | Second-file write failure, metadata flush/definite rollback failure, commit failure xác định: toàn row/files/audit đúng và không dangling references; primary cause giữ khi cleanup failure; recovery limitation UNKNOWN được ghi/test phù hợp |
| Concurrency | Two simultaneous submissions receipt độc lập; failure một request không xóa file request còn lại; barrier upload vs admin lock trước metadata check: đã LOCKED không tạo row, files được cleanup |
| Regressions |57 P01–P04 đạt; health app/PostgreSQL200/UP, trace, packaging, schema/reference hashes nguyên trạng |

Fault injection có thể dùng spy để ép failure đúng điểm nhưng actual file IO/DB transaction phải chạy; report rõ phần inject. Không dùng ảnh giấy tờ thật. Test timeout/latches/resources bounded, cleanup temp root đúng resolved path, không delete/move thư mục dự án. Không thử sửa ACL/xóa file thật của người dùng để tạo failure.

Full commands khi hoàn tất:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
.\scripts\verify-local-config-packaging.ps1
```

Không cố định số test mới để chạy theo count. Báo suite/failure/error/skip thật; thiếu Docker/permission/HTTP case phải ghi limitation, không giả PASS. Probe packaging skip-tests không thay full verify.

## 10. Bước 9 — Tài liệu/report và dừng

1. Tạo `docs/12_PRIVATE_DOCUMENT_STORAGE.md`: API/parts/query/DTO/error examples; filesystem/config/ACL vận hành; locator contract trong cột URL; authenticated binary download/FE fetch Blob; size/type/pixel limits; transaction/cleanup/outcome UNKNOWN/crash limits; ownership và policy KYC chưa có.
2. Cập nhật docs/03, docs/02, docs/06, docs/07, docs/09, LOCAL_DEVELOPMENT, README/AGENTS/mục lục phù hợp. Giữ docs/reference và lịch sử. Đừng giữ signed-URL promise cũ như implementation local.
3. Tạo `docs/reports/P05_REPORT.md` sau thực thi: scope/files/implementation, multipart matrix, true file/DB tests vs inject, cleanup proof/failure limits, commands/counts/health/trace/packaging/hashes và Git branch/HEAD/status/untracked. Không đưa image/PII thật, credentials/keys hoặc absolute locator nhạy cảm vào report.
4. IMPLEMENTATION_STATUS P05 READY_FOR_REVIEW nếu đủ bằng chứng, P01–P04 APPROVED theo review, P06 chưa bắt đầu; Agent không tự APPROVED.
5. Dừng để người dùng gửi report về reviewer, không commit/push/migrateDBchung hoặc chuyển P06.

Các nguồn kỹ thuật để tham khảo implementation: [Spring Multipart](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html), [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Java21 Files](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html). Tài liệu nguồn giúp chọn API đúng; yêu cầu user và leader schema vẫn quyết định scope.
