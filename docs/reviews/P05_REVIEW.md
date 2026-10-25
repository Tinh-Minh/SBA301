# Review P05 — CHANGES_REQUESTED

Ngày review: **2026-10-14**. Reviewer đọc implementation/tests/report, chạy lại full verification/packaging và bổ sung probes. **P05 CHANGES_REQUESTED**: R1/R2/R3 đã tái hiện; R4 là hai regression đồng thời bắt buộc còn thiếu. P01–P04 giữ APPROVED, P06 chưa được giao. [Report Agent](../reports/P05_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| Full `.\mvnw.cmd -B clean verify -Ppostgres-it` sau Docker sẵn sàng | BUILD SUCCESS, khoảng 1 phút 07 giây; **72/72**, 0 failures/errors/skipped |
| Surefire | 24: PlatformHttpTest 13, JwtConfigurationTest 4, CustomerPropertiesTest 1, CustomerStatusLockTest 1, PrivateDocumentStorageTest 5 |
| Failsafe | 48: AuthSecurityPostgresIT 14, CustomerManagementPostgresIT 17, Function1PostgresIT 7, UserDocumentPostgresIT 10 |
| Packaging probe | PASS; local/private-key/bootstrap/private-document markers và storage-root path không có trong JAR |
| Health app/PostgreSQL thật | 200/UP, trace body/header khớp: `d66e5807-39ec-49fe-9780-813b1f340af1` |
| Hashes | Schema/conventions/drawio/migration không đổi so với đầu vào/report |
| Git | BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 158 file untracked trước review docs, không stage/commit/push |

Lần full verify đầu thất bại ở Testcontainers vì Docker daemon chưa chạy: Surefire24 đạt, các suite integration không khởi tạo được. Reviewer khởi động Docker Desktop bằng process hidden, xác nhận daemon 28.5.2 rồi chạy lại toàn bộ và đạt72. Không tính lần Docker unavailable là lỗi code hoặc skipped test đã đạt. Packaging build riêng skip tests không thay full verify.

Logs/probe tại máy reviewer:

- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-verify-docker-unavailable.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-verify.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-packaging.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-image-root.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-http-probe.log`

Probe sources nằm ngoài repository tại `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p05-review-probe\`. HTTP probe khởi động production app/classes, loại target/test-classes khỏi classpath, PostgreSQL15.13 Testcontainers và RSA keys/account/ảnh tổng hợp. Probe temp root/files/key/app/container được đóng và dọn; không ảnh thật/credential thật/DB chung. Root-configuration probe chỉ gọi constructor/check metadata directory, không ghi vào repository/config.

## 2. Findings

### R1 — [P2] JPEG bị cắt vẫn được nhận và tạo hồ sơ201

**Vị trí:** `src/main/java/com/carrental/storage/DocumentImageInspector.java:47–65,80–110`.

ImageReader có thể phục hồi dữ liệu JPEG không hoàn chỉnh, trả BufferedImage cùng warning. Code hiện chỉ xét exception/null/dimensions và bỏ warning, nên không chứng minh input đã được decode đầy đủ trước canonicalization.

Probe dùng JPEG RGB 160×120 tổng hợp dài 12,307 bytes. Bản nguyên vẹn hợp lệ. Các bản bỏ 2 bytes EOI, 64 bytes hoặc 4,102 bytes cuối (khoảng 1/3 nội dung) đều được inspector nhận. HTTP với bản mất khoảng 1/3 trả:

```text
TRUNCATED_JPEG status=201 code=OK traceMatches=true
TRUNCATED_JPEG_DB rows=1
```

Hệ thống ghi một ảnh được decoder phục hồi thay cho evidence nguyên vẹn đã gửi; không đúng yêu cầu P05 reject corrupted/truncated image. Không có evidence thực thi code từ ảnh hoặc vượt quyền; lỗi là integrity/validation của giấy tờ.

**Cần sửa:** phát hiện incomplete/corrupt decode trước store/metadata; kiểm chứng cả JPEG/PNG và stored-file validation. Có thể kiểm tra structure và warning listener với policy rõ; không phụ thuộc message cảnh báo theo ngôn ngữ. Không chỉ kiểm tra bytes cuối vì valid image có appended data vẫn cần canonicalize/loại phần nối theo hợp đồng. Giữ valid JPEG/PNG, dimensions/pixel/byte/output caps và metadata stripping. [Java21 ImageReader warning listener](https://docs.oracle.com/en/java/javase/21/docs/api/java.desktop/javax/imageio/ImageReader.html#addIIOReadWarningListener(javax.imageio.event.IIOReadWarningListener)).

### R2 — [P2] Đoán UNKNOWN bằng loại exception làm bỏ cleanup khi rollback đã rõ

**Vị trí:** `UserDocumentServiceImpl.java:70–108,217–224`; `UserDocumentPostgresIT.unknownTransactionOutcomeKeepsItsReceiptFileForSafeReconciliation`.

hasUnknownCommitOutcome nhận mọi Hibernate JDBCException/TransactionSystemException/DataAccessResourceFailureException là không chắc, kể cả failure bên trong callback trước commit. Nó không dùng outcome của transaction. Test UNKNOWN hiện throw TransactionSystemException ngay tại saveAndFlush callback rồi DB rollback; đây không phải mô phỏng commit UNKNOWN đúng pha, và lại assert giữ orphan cho rollback đã xác định.

Reviewer giữ row owner bằng connection PostgreSQL khác, cấu hình lock_timeout 250ms cho datasource probe rồi gửi PNG hợp lệ. Request lưu file trước, thất bại khi query findByIdForUpdate trong callback, trước tạo metadata/commit. PostgreSQL rollback; nhưng code đi nhánh UNKNOWN do Hibernate cause:

```text
User document transaction outcome unknown ... exceptionType=CannotAcquireLockException
KNOWN_CALLBACK_LOCK_TIMEOUT status=503 code=DEPENDENCY_UNAVAILABLE traceMatches=true
KNOWN_CALLBACK_LOCK_TIMEOUT_DB rows=0 orphanDelta=1
AFTER_ROW_LOCK_RELEASE status=201 code=OK traceMatches=true
```

Mỗi lỗi contention đã rollback vẫn giữ thêm ảnh riêng tư không có row và không có sweeper; đây không phải giới hạn crash/commit ambiguity được chấp nhận. HTTP503/trace và retry hiện đúng; cần sửa phân loại cleanup, không bỏ bảo vệ files của commit thật không chắc.

**Cần sửa:** theo outcome/phase transaction có kiểm chứng, ví dụ afterCompletion STATUS_COMMITTED/ROLLED_BACK/UNKNOWN, kết hợp receipt lifetime. Rollback xác định dọn receipt; committed không xóa vì lỗi sau commit; UNKNOWN thật giữ file để recovery. Không dùng exception class/message làm nguồn quyết định duy nhất. Giữ cause/primary error và safe log nếu cleanup thất bại. [Spring TransactionSynchronization completion status](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/support/TransactionSynchronization.html).

### R3 — [P2] Root nằm trong application/repository được chấp nhận khi CWD khác

**Vị trí:** `LocalPrivateDocumentStorage.java:130–143`.

Validator dùng user.dir như application tree. CWD không nhất thiết là chỗ chứa app/repository. Probe constructor production đổi user.dir sang temp directory ngoài app rồi cấu hình root là `C:\Users\FPTSHOP\Desktop\SBA301_RentCar\config` đang có. Kết quả:

```text
APPLICATION_CONFIG_ROOT_FROM_OTHER_CWD result=ACCEPTED
```

Probe không ghi file vào config; chỉ xác nhận root prohibited theo hợp đồng đã bị nhận. Blacklist tên resources/public/target không bắt config hoặc folder tùy tên khác trong app. Khi chạy JAR từ directory khác như hướng dẫn local cho phép, safety guard không đảm bảo ngoài application/repository. Không tuyên bố folder config đang được web server serve công khai; vấn đề là root-policy không phụ thuộc vị trí thật của app.

**Cần sửa:** xác định protected application/artifact/repository roots độc lập CWD (CodeSource/resource hoặc explicit protected-root config validated). Kiểm chứng exploded classes và JAR chạy từ CWD khác, các folder tùy tên trong app bị chặn; root temp hợp lệ ngoài app vẫn được nhận. Giữ canonical/regular-file/locator checks; không giải quyết bằng blacklist một tên config hoặc hard-code path máy người dùng. [Java21 CodeSource location](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/security/CodeSource.html#getLocation()).

### R4 — [P2] Chưa có hai race tests bắt buộc của receipt/owner recheck

**Vị trí:** UserDocumentPostgresIT và report mục6.

Prompt P05 bước8 yêu cầu hai submissions đồng thời với failure một request không xóa file của peer, và upload đang diễn ra gặp admin khóa owner trước metadata check. Report xác nhận chưa chạy cả hai. Existing stale-principal test khóa account trước gọi service; chưa chứng minh HTTP đã qua auth, đang upload rồi bị khóa, cũng chưa chứng minh receipt isolation giữa hai concurrent requests.

**Cần bổ sung:** real HTTP/filesystem/PostgreSQL tests với barriers ở điểm xác định; storage/repository spy chỉ dùng giữ thời điểm/inject failure, không thay actual receipts/IO/query/locks. Assert row/file/audit của request sống sót nguyên vẹn, request failed không còn file khi rollback rõ; owner bị khóa trước metadata check không tạo row/file. Không thay bằng hai lệnh chạy tuần tự hoặc sleep may rủi.

## 3. Phần đạt và giới hạn không buộc đổi scope

- Strict scalar multipart/owner/status defaults, mine/all database query/count, DTO mask/locator privacy, owner/admin download, headers/trace và file-size cap có tests thật.
- Storage interface, UUID receipt, CREATE_NEW và locator grammar/traversal checks có implementation; packaging bảo vệ marker/root path đạt.
- Không sửa schema, KYC hay P06; PENDING không được coi là đã xác minh.
- Byte-array download được bounded bởi file/pixel caps; không nhất thiết phải refactor streaming chỉ để đạt review này.
- Chưa kiểm tra thay ACL Windows, mọi decoder payload có thể có hoặc process/power-loss thật. Không yêu cầu đổi ACL hệ thống người dùng, thêm antivirus/cloud/sweeper/migration để đóng findings. Cần một matrix tối thiểu có ca JPEG/PNG/control/corrupt/MIME/format/size/output/path theo prompt, không tuyên bố “mọi payload” an toàn.

Reviewer không sửa production source/tests trong repo, schema/reference, commit/push hoặc DB chung. Sửa [P05-FIX-01](../prompts/P05_FIX_01.md), chạy lại verification, báo READY_FOR_REVIEW rồi dừng. P06 chưa được giao.
