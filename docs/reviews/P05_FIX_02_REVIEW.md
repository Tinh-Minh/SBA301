# Review P05-FIX-02 — APPROVED

Ngày review: **2026-10-14**. **R3 CLOSED; P05 APPROVED.** R1/R2/R4 giữ CLOSED theo [review P05-FIX-01](P05_FIX_01_REVIEW.md). Reviewer đã đọc resolver/tests/report, chạy lại full verification/packaging và probe trước/sau bằng cùng helper Boot JAR. Không có finding chặn còn lại trong phạm vi P05. [Báo cáo Agent](../reports/P05_FIX_02_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` sau Docker sẵn sàng | BUILD SUCCESS; **87/87**, 0 failure/error/skip, khoảng 1 phút 45 giây |
| Surefire | 32: Platform13, JWT4, customer config1, status lock1, private storage7, root policy4, transaction outcome2 |
| Failsafe | 55: auth14, customer management17, persistence7, Boot root1, user documents16 |
| Actual Boot JarLauncher | Native physical JAR path/provider; 6 application roots reject, external accepted, disabled initialized; CWD khác, spaces/literal `%20`/Unicode đạt |
| Packaging probe | PASS; local config/key/bootstrap/document/root markers và test helper đều không vào artifact |
| Health app/PostgreSQL | 200/UP, trace body/header khớp `8d2144e9-be4c-4003-9097-617921e91e14` |
| P05 external-root health smoke | HTTP 200, `bodyTraceMatchesHeader=true`, temporary external storage root |
| Same-helper legacy fixture | ZipPath(`/`), protected roots `[ / ]`, application config accepted |
| Same-helper fixed policy fixture | Outer physical JAR WindowsPath, project/JAR parent protected, config rejected, external accepted |
| Git trước viết review/docs | BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`;171 untracked paths, không staged changes |

Lượt verify đầu: Docker daemon tắt, Surefire32 và Boot root IT1 đạt;4 suite PostgreSQL không khởi tạo được. Reviewer khởi động Docker Desktop hidden, xác nhận daemon28.5.2 rồi chạy lại toàn bộ đạt 87. Không tính lượt Docker unavailable là regression code hoặc test PostgreSQL đã đạt. Packaging probe build riêng skip tests không thay full verify.

Logs trong `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p05-fix02-review-verify-docker-unavailable.log`
- `sba301-p05-fix02-review-verify.log`
- `sba301-p05-fix02-review-packaging.log`
- `sba301-p05-fix02-review-legacy-fixture.log`
- `sba301-p05-fix02-review-same-helper-fixed.log`

## 2. R3 — CLOSED: physical artifact và containment cùng native filesystem

`StorageRootPolicy` resolve `file:` qua URI, standard `jar:file:` qua JarURLConnection và Boot nested archive qua `NestedLocation.fromUrl(...).path()`. Canonical location phải nằm trên default/native filesystem và là existing directory hoặc regular file. Protected roots giữ artifact/classes, parent của JAR, nearest project/repository; root/config containment chỉ so native paths, không fallback CWD hoặc ZIP entry root. Unsupported/missing/non-native locations fail closed. Adapter disabled không đòi root.

Root unit tests có exploded/plain/standard-JAR URLs, encoding, unsupported/missing location và ZIP filesystem input rejection. Failsafe Boot IT dùng production repackaged JAR copy, actual JarLauncher qua `java -jar`, test Start-Class helper chỉ trong TEMP. Nó assert exact resolved physical path và native provider;project/config/public/target/target-custom/arbitrary bị reject; external control và disabled storage đạt. Source production artifact không chứa helper. Fixture có spaces, literal `%20`, tiếng Việt/Japanese Unicode; child CWD khác app tree, timeout/termination hữu hạn. Đây là actual Boot loader evidence, không chỉ URL unit fixtures.

Reviewer bổ sung comparison bằng fixture của lượt trước:

1. Chạy lại **JAR cũ còn lưu trong TEMP** với đúng helper/CWD/root cũ: `RESOLVED_CODE_LOCATION=/`, `jdk.nio.zipfs.ZipPath`, `BOOT_APPLICATION_CONFIG_ROOT=ACCEPTED`.
2. Copy fixture này sang JAR TEMP mới, chỉ thay entry `StorageRootPolicy.class` bằng class vừa compile trong full verify; giữ helper/layout/dependencies. Chạy lại cùng CWD/config. Kết quả:

```text
APPLICATION_CODE_SOURCE_PROTOCOL=jar
RESOLVED_CODE_LOCATION=C:\...\copied-project\target\boot-root-review-fixed.jar
RESOLVED_CODE_LOCATION_PATH_TYPE=sun.nio.fs.WindowsPath
PROTECTED_ROOTS=[physical project root, physical JAR, physical JAR parent]
BOOT_ROOT_ADAPTER_INIT=PASS
BOOT_APPLICATION_CONFIG_ROOT=REJECTED exceptionType=IllegalStateException
```

Comparison chỉ kiểm tra production policy/adapter constructor, không ghi ảnh vào config. JAR gốc trong repo và legacy fixture không bị sửa. Full current-app validation là bộ 87 và actual Boot IT riêng; không nhầm fixture thay một class thành full app smoke.

## 3. Làm rõ probe legacy của Agent

Agent ghi đúng rằng probe riêng của họ xác nhận nested CodeSource nhưng `Path.of(...)` ném `FileSystemNotFoundException`, nên không tự tái hiện ACCEPTED ở lần đó. Quan sát này được giữ nguyên trong report, không sửa thành PASS tái hiện.

Nó không phủ định evidence của runtime fixture trước: reviewer vừa chạy lại fixture cũ và tái hiện ACCEPTED, sau đó cùng helper với policy mới cho REJECTED/native path. Review không khẳng định mọi invocation legacy sẽ luôn trả ZipPath; kết luận là direct nested URI-to-Path không đảm bảo physical application artifact. Fix mới tránh cả ZIP-root bypass lẫn phụ thuộc filesystem-provider availability ở nhánh cũ. Chưa xác định một nguyên nhân chung cho mọi khác biệt giữa hai legacy harness, không cần suy đoán để đóng R3.

## 4. Hashes và giới hạn

| File | SHA-256 không đổi |
|---|---|
| `docs/reference/schema.sql` | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| `docs/reference/BACKEND_CONVENTIONS.md` | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| `docs/reference/car_rental_conceptual.drawio` | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| `src/main/resources/db/migration/function1/V1__function1_leader_baseline.sql` | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |

Windows ACL-denied, mọi topology filesystem, production deployment và power/process-loss atomicity chưa được kiểm chứng. Boot parser reflection được kiểm chứng trên version4.0.8 hiện tại; khi nâng Boot phải giữ actual-JAR regression, API không còn phù hợp thì fail closed. Local storage vẫn cần quyền OS/backup/retention phù hợp; không mở rộng thành cloud/sweeper/schema trong P05.

Reviewer chỉ đọc source/chạy tests/probes cô lập và viết tài liệu; không sửa production source/tests trong repo, stage/commit/push hoặc DB chung. Kết quả approval thuộc P05; không coi policy KYC/giấy tờ P06 hoặc production config là đã được người dùng chốt.
