# P05 — Hồ sơ giấy tờ và local private storage

Trạng thái 2026-10-15: P01–P09 APPROVED theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md). P10 CHANGES_REQUESTED; P10-FIX-01 READY_FOR_REVIEW với R1/R2 chờ xác nhận. P10-FIX chỉ đồng bộ contract/docs/regression; workflow và standard packaged app vẫn dùng synthetic images/external private root, owner download/private response headers và foreign 404 đạt. P05 storage/cleanup/schema/regressions giữ; xem [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md).

## API

Tất cả endpoint yêu cầu `Authorization: Bearer <access-token>`. CUSTOMER và ADMIN ACTIVE có thể tạo hồ sơ cho chính account trong principal. Không nhận `customerId`/owner trong body.

### Tạo hồ sơ

`POST /api/user-documents` dùng `multipart/form-data`, trả `201`, `Location: /api/user-documents/{id}` và `ApiResponse<UserDocumentDetailResponse>`. Các part scalar được phép:

| Part | Hợp đồng |
|---|---|
| `docType` | Bắt buộc, exact `CITIZEN_ID`, `DRIVER_LICENSE` hoặc `PASSPORT` |
| `docNumber` | Bắt buộc, trim/nonblank, tối đa 50 ký tự; lưu dạng String, giữ số 0 đầu và case |
| `fullNameOnDoc` | Tùy chọn, tối đa 150; blank thành NULL |
| `dateOfBirthOnDoc` | Tùy chọn ISO `yyyy-MM-dd`, không ở tương lai theo Clock cấu hình |
| `issuePlace` | Tùy chọn, tối đa 200; blank thành NULL |
| `issueDate`, `expiresAt` | Tùy chọn ISO `yyyy-MM-dd`; nếu có cả hai thì ngày cấp không sau ngày hết hạn |
| `licenseClass` | Tối đa 10; bắt buộc/nonblank nếu `docType=DRIVER_LICENSE`; không áp danh sách hạng ngoài schema |
| `frontImage` | Chính xác một file, bắt buộc và không rỗng |
| `backImage` | Tối đa một file; tùy chọn ở P05, nếu gửi phải hợp lệ |

Không nhận key lạ, duplicate scalar/file, file trong slot scalar, scalar trong slot file, owner/status/reviewer/audit/URL/helper field hoặc query string trên POST. Multipart được kiểm kê trước khi parse. Lỗi input trả 400; file vượt cap trả 413; media type/format không hỗ trợ trả 415.

Mỗi lần gửi thành công tạo một row `PENDING` mới. `verifiedBy`, `verifiedAt`, `rejectReason` là NULL. P05 không sửa customer, `kyc_status`, driver hoặc giấy tờ cũ. Không có unique rule riêng cho PENDING và không suy ra eligibility từ một row PENDING.

### Danh sách, detail và ảnh

`GET /api/user-documents` trả `ApiResponse<PageResponse<UserDocumentSummaryResponse>>`. Query allowlist:

```text
scope=mine|all       (mặc định mine; all chỉ ADMIN ACTIVE)
customerId=<positive> (chỉ ADMIN và scope=all)
docType=CITIZEN_ID|DRIVER_LICENSE|PASSPORT
verifyStatus=PENDING|APPROVED|REJECTED
page=0&size=20&sort=createdAt,desc
```

Sort allowlist là `id`, `createdAt`, `updatedAt`, `docType`, `verifyStatus`; direction `asc|desc`, một field và một direction, thêm `id` làm tie-breaker. `size` mặc định 20, tối đa 100. Filter/count chạy trong PostgreSQL trước pagination. CUSTOMER dùng `scope=all` hoặc customerId bị 403; scope mine kèm customerId bị từ chối. ADMIN scope mine chỉ xem bản thân; scope all có thể xem cả owner LOCKED.

Summary chỉ có id/customerId/docType/số giấy tờ đã che/status/cờ ảnh/audit. Detail trả metadata đầy đủ cho owner hoặc ADMIN ACTIVE. Không trả locator/path, profile/email/phone, ảnh, signed URL hoặc public URL. Với số dài hơn 4 ký tự summary chỉ giữ 4 ký tự cuối; số dài tối đa 4 bị che toàn bộ.

`GET /api/user-documents/{id}` và `GET /api/user-documents/{id}/files/{front|back}` trả 404 giống nhau nếu không có record hoặc nằm ngoài owner scope. Download thành công trả nguyên bytes JPEG/PNG đã canonicalize, không có JSON body; header gồm Content-Type, Content-Length, `Content-Disposition: attachment` với tên do server tạo, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Request-ID`. Lỗi trước khi gửi body vẫn dùng JSON envelope/trace.

Frontend dùng `fetch` kèm Authorization rồi `response.blob()`. Không đặt JWT trong query string, không dùng local path làm `img.src`.

## Ảnh và giới hạn

Chỉ JPEG/PNG. Spring multipart và app cùng giới hạn mỗi file 5 MiB, request 11 MiB; cấu hình được qua `APP_DOCUMENT_MAX_FILE_SIZE` và `APP_DOCUMENT_MAX_REQUEST_SIZE`. Baseline ảnh là 20 triệu pixel và tối đa 10.000 px mỗi chiều (`APP_DOCUMENT_MAX_IMAGE_PIXELS`, `APP_DOCUMENT_MAX_IMAGE_DIMENSION`). Giá trị này là giới hạn kỹ thuật có thể đổi, không phải policy KYC.

App không tin Content-Length, filename, MIME hoặc extension riêng lẻ. Filename chỉ chấp nhận tên đơn an toàn có đuôi `.jpg`, `.jpeg` hoặc `.png`; không dùng tên đó làm key. MIME, signature và decoder phải khớp. Kích thước pixel/chiều được kiểm tra trước full decode; dữ liệu được decode và re-encode giới hạn đầu ra để loại metadata/comment/bytes appended. Không crop, resize hoặc OCR. Đây không phải tuyên bố có antivirus hoặc kiểm soát mọi lỗi decoder.

**R1 CLOSED theo reviewer:** inspector kiểm tra chunk/CRC và kết thúc cấu trúc JPEG/PNG, đồng thời từ chối mọi decoder warning mà không dựa vào localized message. Kiểm tra chạy trước persist và cũng được áp dụng cho file đã lưu khi download. JPEG/PNG hợp lệ có appended data vẫn được chấp nhận rồi re-encode; output bỏ metadata/phần nối. Regression HTTP xác nhận control hợp lệ, truncation trong EOI/entropy/chunk, CRC sai, fake MIME/signature bị từ chối không tạo row/file; file đang lưu bị cắt trả lỗi an toàn có trace. Reviewer probe cắt JPEG2/64/4102 bytes reject; HTTP400/row0. Byte/pixel/dimension và output cap vẫn được kiểm tra.

## Cấu hình local private

Storage mặc định **tắt**. Khi tắt, P01–P04 và list/detail vẫn chạy bình thường; POST/download đã xác thực trả 503 và ứng dụng không tạo root/file fallback.

Khi bật, cấu hình:

```properties
app.document.storage.enabled=true
app.document.storage.root=C:/Users/<account>/AppData/Local/SBA301_RentCar_Private/user-documents
```

Hoặc đặt environment `APP_DOCUMENT_STORAGE_ENABLED=true` và `APP_DOCUMENT_STORAGE_ROOT` thành absolute path. Người vận hành phải tạo thư mục trước, cấp quyền tối thiểu phù hợp cho account chạy ứng dụng và kiểm tra ổ đĩa/dung lượng theo vận hành. App không tự tạo root, không đổi ACL, không chọn thư mục hiện hành, `src/main/resources`, `public`, `static`, `target/classes` hoặc thư mục trong JAR. Root phải tồn tại, là directory writable và ở ngoài repository/application tree; cấu hình sai làm startup thất bại mà không đưa path vào HTTP error. Không commit root local, ảnh kiểm thử hoặc tài liệu thật.

**R3 CLOSED theo reviewer P05-FIX-02:** code location `file:` resolve qua URI; `jar:file:` lấy archive ngoài từ `JarURLConnection`; Boot `jar:nested:` lấy `nested:` URL rồi gọi parser `NestedLocation.fromUrl` của Boot để nhận `Path` outer physical JAR. Canonicalization yêu cầu đúng default/native filesystem và chỉ chấp nhận classes directory hoặc regular artifact file. Không dùng `user.dir`, ZIP entry root hay fallback. Unsupported/missing/non-native resolver fail closed; diagnostics không in path/URL. Root validation xác nhận cùng filesystem trước `startsWith`, bảo vệ classes/JAR, parent JAR và project/repository gần nhất (`pom.xml`/Gradle/Git). Với standalone JAR,parent chứa JAR cũng được bảo vệ; khi nâng Boot giữ actual-JAR regression.

Failsafe `StorageRootBootJarIT` chạy bản copy executable Boot JAR qua `java -jar`/JarLauncher từ CWD khác; test-only Start-Class helper chỉ được chèn vào bản copy dưới TEMP. Fixture có spaces, literal `%20` và Unicode; path resolved được so sánh đúng với native canonical outer JAR. Project/config/public/target/custom/arbitrary roots bị từ chối, external root được nhận, adapter tắt khởi tạo không cần root và không có file được ghi. Source production JAR xác nhận không chứa helper. `StorageRootPolicyTest` bổ sung exploded, plain/standard JAR URL, encoding, unsupported/missing và filesystem-provider regressions.

Health smoke dùng app/PostgreSQL Testcontainers với private root tạm bên ngoài project: HTTP 200, `data.status=UP`, `traceId` body khớp `X-Request-ID`. Đây không phải health process của helper Boot JAR; helper chỉ kiểm chứng actual packaging/loading và root adapter. Probe tiền sửa trong lượt này xác nhận actual CodeSource `jar:nested:`/outer URL `nested:` nhưng minimal launcher path ném `FileSystemNotFoundException`; [review trước](reviews/P05_FIX_01_REVIEW.md) ghi nhận runtime khác resolve ZipPath(`/`) và nhận nhầm project/config root. Không ghi storage vào repo/config; ACL Windows không đổi.

Reviewer lượt P05-FIX-02 chạy lại fixture cũ và vẫn tái hiện ZipPath(`/`)/config accepted. Cùng helper/layout với policy class mới trả native physical JAR/config rejected/external accepted. [Review bản sửa](reviews/P05_FIX_02_REVIEW.md) giữ riêng quan sát legacy của Agent; không khẳng định mọi harness cũ đều có cùng outcome hoặc sửa report lịch sử.

Storage local không mã hóa file, không phải backup hay multi-node shared store. OS administrator hoặc account có quyền đọc thư mục vẫn có thể xem bytes. Cấu hình production, ACL, retention/backup, dung lượng và nhu cầu multi-node cần được owner vận hành chốt.

## Locator và file lifetime

Adapter `PrivateDocumentStorage` che implementation filesystem. Adapter local sinh UUID riêng cho mỗi ảnh và locator nội bộ `private-local:<uuid>.jpg` hoặc `.png` trong `front_image_url`/`back_image_url` hiện có (tối đa 500 ký tự). Locator không phải URL, chỉ được resolve theo grammar UUID/extension chặt; client không chọn key/path. Path được canonicalize dưới root, chỉ regular file không symlink được đọc/xóa, file mới dùng CREATE_NEW.

Bytes ảnh được validate và lưu trước; sau đó transaction DB khóa owner row, đọc lại status/role ACTIVE và tạo metadata PENDING. Request thành công trả sau commit. **R2 CLOSED theo reviewer:** coordinator đăng ký transaction synchronization và quyết định cleanup từ completion `COMMITTED`, `ROLLED_BACK` hoặc `UNKNOWN`, không phân loại theo exception class/SQLState. Lỗi trước transaction/rollback xác định dọn đúng receipts request đó; commit đã xác nhận giữ file; outcome injected UNKNOWN giữ file và log trace/actor/opaque receipt ID an toàn. PostgreSQL thật giữ owner row bằng connection thứ hai; HTTP row-lock timeout trả503/trace, row0/file delta0, rồi retry sau release201 trong reviewer probe. Callback failure sau flush có rollback xác nhận và cleanup. Cleanup failure giữ exception chính và thêm suppressed. UNKNOWN/COMMITTED boundary tests là fault injection có kiểm soát, không evidence crash thực tế.

**R4 CLOSED theo reviewer:** hai submission HTTP đồng thời dùng barrier thật tại flush; request A rollback và dọn receipt riêng, request B commit giữ nguyên row/audit/locator/file/download. Case upload-vs-admin-lock đã qua auth và persist file được giữ trước owner transaction; admin HTTP LOCKED commit trước khi mở barrier; upload recheck trả401 và không tạo row/file/success log. Cả hai regression đạt khi reviewer chạy full verify.

Filesystem và PostgreSQL không có transaction phân tán chung. Khi lỗi transaction có outcome không chắc, implementation **không xóa file mù**; ghi log trace/actor/receipt để đối soát, có thể để orphan. Sau process/power loss giữa file write, DB commit và HTTP response vẫn có cửa sổ orphan hoặc record thiếu file. P05 chưa có sweeper/bảng recovery; vận hành cần đối chiếu log/metadata và kiểm tra receipt có kiểm soát trước khi dọn. Không xóa toàn bộ root để recovery.

## Lỗi và dữ liệu nhạy cảm

- 400 `INVALID_REQUEST` / `VALIDATION_ERROR`: multipart/metadata/date/filename hoặc query không hợp lệ.
- 413 `PAYLOAD_TOO_LARGE`: byte, request hoặc pixel/dimension/output cap.
- 415 `UNSUPPORTED_MEDIA_TYPE`: request media hoặc format ảnh không hỗ trợ.
- 401 `INVALID_TOKEN`, 403 `ACCESS_DENIED`, 404 `RESOURCE_NOT_FOUND` theo security/owner scope.
- 503 `DEPENDENCY_UNAVAILABLE`: storage tắt hoặc filesystem/DB dependency thật không sẵn sàng.
- 500 `INTERNAL_ERROR`: lỗi nội bộ hoặc locator/file metadata hỏng; response không lộ path/cause.

Không log request DTO, document number/name/date/place, filename, raw bytes, storage path/locator, URL, JWT, hash, raw SQL hoặc DB detail. Success log chỉ có trace, actor/document ID, docType và số file; cleanup log chỉ thêm opaque receipt ID. Submission PENDING không phải xác minh/KYC thành công.
