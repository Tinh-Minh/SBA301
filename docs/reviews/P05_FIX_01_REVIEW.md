# Review P05-FIX-01 — CHANGES_REQUESTED

Ngày review: **2026-10-14**. **R1/R2/R4 CLOSED; R3 OPEN. P05 CHANGES_REQUESTED**, chưa chuyển P06. Reviewer đã chạy lại 83/83 test và packaging PASS, nhưng probe trên Spring Boot executable JAR tái hiện root trong application tree vẫn được nhận. [Báo cáo Agent](../reports/P05_FIX_01_REPORT.md) và [review P05 gốc](P05_REVIEW.md) giữ nguyên lịch sử.

## 1. Kết quả kiểm chứng

| Kiểm tra | Kết quả reviewer |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; **83/83**, 0 failure/error/skip, khoảng 1 phút 28 giây |
| Surefire | 30: Platform13, JWT4, customer config1, status lock1, private storage7, root policy2, transaction outcome2 |
| Failsafe/PostgreSQL15.13 | 53: auth14, customer management17, persistence7, user documents15 |
| `scripts/verify-local-config-packaging.ps1` | PASS; local config, private key, bootstrap secret, document marker và storage root path đều không vào JAR |
| Health app/PostgreSQL test | 200/UP; body/header trace khớp `14fa4f40-ca89-4c1c-acbe-ec0b70a367fc` |
| Probe JPEG/HTTP | Valid201; cắt2/64/4102 bytes bị reject; HTTP truncated400/row0/trace khớp |
| Probe PostgreSQL row lock | HTTP503/trace khớp, row0, **orphanDelta0**; release blocker rồi retry201 |
| Root exploded classes, CWD khác | Repository/config bị reject; phần này của R3 đã sửa |
| Root Boot JAR, CWD khác | **FAIL policy**: physical config trong project chứa JAR được nhận; chi tiết mục3 |
| Git trước viết review docs | BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`,166 file untracked, không staged changes |

SHA-256 giữ nguyên:

| File | Hash |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

Logs trong `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p05-fix-review-verify.log`
- `sba301-p05-fix-review-packaging.log`
- `sba301-p05-fix-review-image-root.log`
- `sba301-p05-fix-review-http-probe.log`
- `sba301-p05-fix-review-boot-root-probe.log` (PropertiesLauncher)
- `sba301-p05-fix-review-jarlauncher-root-probe.log` (`java -jar`/JarLauncher)

## 2. Findings đã đóng

### R1 — CLOSED: ảnh bị cắt không được persist/download như ảnh hợp lệ

Inspector dùng structural JPEG/PNG validation và signal decoder warning trước decode/canonicalization, áp dụng cả stored-file validation. Các regression kiểm tra control, EOI/entropy/chunk truncation, CRC, MIME/signature, appended data, caps và stored-file corrupt. Reviewer chạy lại bộ này và probe JPEG12307 bytes: nguyên vẹn accepted; bỏ2/64/4102 bytes rejected `VALIDATION_ERROR`. HTTP bỏ1/3 bytes trả400, không row. Không tuyên bố mọi payload/codec đã an toàn.

### R2 — CLOSED: rollback rõ dọn đúng receipt

Coordinator dùng completion state thay heuristic exception class; transaction submission `REQUIRES_NEW`. Rollback/no database work dọn receipts, COMMITTED/UNKNOWN giữ files. Callback failure sau flush có cleanup, primary error không bị cleanup error thay thế.

Reviewer dùng connection PostgreSQL thứ hai giữ owner row `FOR UPDATE`, datasource probe có `lock_timeout=250ms`. Request đã lưu file rồi callback lock thất bại: HTTP503 `DEPENDENCY_UNAVAILABLE`, trace khớp, row0/file delta0. Release blocker rồi retry201. UNKNOWN/COMMITTED tests fault-inject completion boundary bằng transaction manager kiểm soát trong unit test; đây là evidence xử lý outcome, không phải mô phỏng crash/commit ambiguity trên production database.

### R4 — CLOSED: hai race tests có ordering xác định

Hai submissions HTTP dùng owners khác nhau, actual persist/flush/file IO và barrier trước khi A throw/rollback, B commit. Test assert A không row/file, B giữ metadata/audit/locator/file và authenticated download khớp bytes. Upload-vs-admin-lock chặn sau actual file store; ADMIN HTTP khóa owner và commit trước khi release upload. Upload recheck401, không row/file/success log, account LOCKED và audit/KYC đúng. Cả hai tests đạt trong full verify; spy chỉ ép timing/fault.

## 3. R3 — [P2] OPEN: CodeSource Boot JAR resolve thành ZIP root, bỏ qua protected application tree

**Vị trí:** `src/main/java/com/carrental/storage/StorageRootPolicy.java:42–48`, `:26–30`, `:54–76`. Regression còn thiếu tại `src/test/java/com/carrental/storage/StorageRootPolicyTest.java:46–75`.

`Path.of(location.toURI()).toRealPath()` được dùng trực tiếp với CodeSource. Khi class nằm trong executable Boot JAR, URL là `jar:nested:.../!BOOT-INF/classes/!/`. Ở runtime đã kiểm chứng, lời gọi này **không throw**: nó trả `jdk.nio.zipfs.ZipPath` tại `/` bên trong archive. `protectedRoots` chỉ thu được ZIP root; configured root là native WindowsPath nên `startsWith` không khớp. Adapter nhận root nằm trong project/application tree, trái U-10 và contract P05.

Reviewer kiểm chứng hai cách:

1. PropertiesLauncher nạp production classes trực tiếp từ JAR build trong repo; root `repository/config` accepted. Không ghi file vào config.
2. Copy Boot JAR vào project fixture trong TEMP, giữ nguyên production class entries/dependencies, đổi riêng `Start-Class` thành helper probe và thêm helper dưới `BOOT-INF/classes` trong **bản copy**. Launch bằng `java -jar` qua manifest JarLauncher từ CWD khác. Fixture có `pom.xml`, JAR ở `target` và thư mục `config`. Helper gọi production policy/adapter, chỉ kiểm tra constructor; external root control accepted. Không sửa JAR gốc hoặc production source.

Output thứ hai:

```text
APPLICATION_CODE_SOURCE_PROTOCOL=jar
APPLICATION_CODE_SOURCE=jar:nested:/C:/.../copied-project/target/boot-root-review.jar/!BOOT-INF/classes/!/
RESOLVED_CODE_LOCATION=/
RESOLVED_CODE_LOCATION_PATH_TYPE=jdk.nio.zipfs.ZipPath
PROTECTED_ROOTS=[/]
BOOT_ROOT_ADAPTER_INIT=PASS
BOOT_APPLICATION_CONFIG_ROOT=ACCEPTED
```

Đây là root-configuration bypass đã tái hiện; không có evidence config đang được web server serve hoặc dữ liệu thật đã lộ. Test JAR hiện có là plain manifest JAR chỉ chứa hai class, không có Boot loader/`BOOT-INF` layout. Nó chạy đạt nhưng CodeSource `file:` không đi qua nhánh nested JAR đang lỗi. Exploded/plain-JAR evidence không đóng được packaged Boot case.

Spring Boot mô tả nested JAR URL và khả năng mở JarURLConnection trong [executable JAR specification](https://docs.spring.io/spring-boot/specification/executable-jar/jarfile-class.html). Java21 phân biệt archive filesystem với filesystem chứa physical JAR trong [jdk.zipfs](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.zipfs/module-summary.html). Nguyên nhân cụ thể trên Boot4.0.8/Java21 ở đây được xác nhận bằng runtime probe, không suy ra chỉ từ tài liệu.

**Yêu cầu sửa:** resolve outer physical artifact trên native/default filesystem, canonicalize rồi derive protected roots; xử lý exploded/file/plain JAR/Boot nested đúng, không fallback user.dir hay chỉ blacklist tên config. Reject unsupported/ambiguous location an toàn. Regression phải chạy actual Boot loader từ CWD khác với forbidden config/target/public/folder tùy tên và external control; chứng minh resolved location là physical path.

## 4. Quyết định và phần tiếp theo

Thực hiện **[P05-FIX-02](../prompts/P05_FIX_02.md)**, chỉ sửa R3 và regression/docs liên quan. Giữ R1/R2/R4 và P01–P04, schema/reference, contract owner/admin/PENDING. P06 `NOT_STARTED`; policy KYC/tự duyệt vẫn mở.

Lượt reviewer chỉ đọc implementation, chạy tests/probes cô lập và viết tài liệu. Không sửa production source/tests trong repo, stage/commit/push hoặc chạy DB chung. Probes dùng ảnh/account/RSA keys tổng hợp; HTTP context/container/temp files được đóng/dọn. Boot JAR fixture chứa mã ứng dụng và helper, không secret/tài liệu thật; giữ tại TEMP làm evidence, không đóng gói vào repository.
