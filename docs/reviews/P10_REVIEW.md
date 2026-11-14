# Review P10 — CHANGES_REQUESTED

Ngày review: **2026-10-15**. **R1/R2 OPEN; P10 CHANGES_REQUESTED. P01–P09 giữ APPROVED.** Reviewer chạy lại 147/147 tests, packaging, workflow và executable JAR đều đạt. Hai finding thuộc hợp đồng bàn giao; chưa nghiệm thu toàn Function 1. Thực hiện [P10-FIX-01](../prompts/P10_FIX_01.md), báo READY_FOR_REVIEW rồi dừng.

[Report P10 gốc](../reports/P10_REPORT.md) được giữ nguyên. Reviewer chỉ kiểm tra, chạy probe cô lập và viết tài liệu; không sửa production code/tests/OpenAPI, schema/reference/entity/pom, Git history hoặc database chung.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả thực tế |
|---|---|
| Lần `clean verify -Ppostgres-it` đầu | Không hoàn tất: Docker chưa chạy, Testcontainers báo không tìm thấy Docker environment. Đây là lỗi môi trường, không được ghi PASS. |
| Khởi động Docker | Docker Desktop được khởi động hidden; daemon sau đó trả server 28.5.2. Không đổi datasource sang DB chung/local có sẵn. |
| Full verify chạy lại | **BUILD SUCCESS, 2 phút 46 giây; 147/147**, 39 Surefire + 108 Failsafe, không failure/error/skip. |
| OpenAPI/MVC parity | 32 operations; contract test hiện có PASS. Reviewer duyệt thêm toàn tài liệu: 274 local `$ref` occurrences, không reference thiếu. Chưa dùng full semantic OAS validator. |
| Workflow PostgreSQL/HTTP | PASS; customer/peer đăng ký qua HTTP, upload/review, driver, bank, voucher, lock/unlock và advance Clock như report. Stored driver ACTIVE/current eligible false/current KYC VERIFIED/window ENDED. |
| Standard executable JAR | PASS; `java -jar`, CWD có Unicode/space, external config/keys/private root; health/register/login/me/private upload/download/foreign denial/voucher đạt. |
| Artifact trong full verify của reviewer | SHA-256 `494CD500863BC5F7883FB4A86E8027D68E774602DEAFAD23867329EC4D6FA3F2`. Rebuild có thể khác hash artifact của Agent; không đồng nghĩa source bị đổi. |
| Packaging probe | PASS; local config, fake config/key/bootstrap/document markers, private root path, private key entry và Boot helper đều không được đóng gói. |
| Independent production-class HTTP/PostgreSQL probe | PASS cho các kết quả ở bảng R1/R2; classpath bỏ `target/test-classes`, PostgreSQL 15.13/RSA/account dữ liệu tổng hợp. Không seed outcome qua schema mới. |
| Health riêng của probe | HTTP 200/UP; trace body/header `a7c46240-542e-42f7-97ab-38d04dec1fae` khớp. |
| Git trước ghi review | BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 259 paths untracked; không staged/tracked diff. |

Log reviewer ngoài repository tại `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p10-review-verify.log` — lần Docker unavailable, giữ đúng kết quả lỗi.
- `sba301-p10-review-verify-final.log` — full 147/147 PASS.
- `sba301-p10-review-packaging.log` — isolated packaging PASS.
- `sba301-p10-review-contract-probe.log` — HTTP probe không in token/key/password.
- Helper tổng hợp: `sba301-p10-review-probe/ContractProbe.java`; production classes + dependency classpath, không test fixture controller/helper trên classpath ứng dụng.

## 2. R1 [P2] OPEN — OpenAPI cho phép nhiều request bị implementation từ chối

**Vị trí:** `docs/api/openapi-function1.json`, đặc biệt dòng 3239–3248, 5706–5715, 7087–7135, 7138 trở đi, 7218–7238 và 7268 trở đi; coverage ở `Function1OpenApiContractTest`.

Đây là spec FE sẽ import để sinh client/form. Các enum/nullable/required/length/numeric constraints đang mô tả rộng hơn validation thật; request hợp lệ theo schema có thể nhận 400 ngay cả khi account/quyền/DB đều hợp lệ. Các sai lệch sau được tái hiện qua HTTP production classes và PostgreSQL thật:

| Trường hợp | OpenAPI hiện tại | Runtime đã quan sát |
|---|---|---|
| `GET /api/drivers?status=LOCKED` hoặc `INACTIVE` | Enum query chứa cả hai | 400 `INVALID_REQUEST`; DriverStatus chỉ PENDING/ACTIVE/SUSPENDED. Positive PENDING trả 200. |
| `GET /api/vouchers?status=PENDING` hoặc `SUSPENDED` | Enum query chứa cả hai, cả LOCKED | 400 `INVALID_REQUEST`; VoucherStatus chỉ ACTIVE/INACTIVE. Positive ACTIVE trả 200. |
| `PATCH /api/customers/me`, `{"fullName":null}` | ProfilePatch cho phép null | 400 `VALIDATION_ERROR`; fullName có thể omitted nhưng không được null khi có mặt. |
| Profile address gồm 301 ký tự ASCII `A` | `maxLength:500` | 400 `VALIDATION_ERROR`; 300 ký tự trả 200. Service giới hạn 300 sau strip. |
| Customer status `{"status":"LOCKED"}` | Chỉ status required | 400 `INVALID_REQUEST`; reason cũng required. |
| Customer status có `"reason":null` | Reason nullable | 400 `VALIDATION_ERROR`; reason phải nonblank. Không đổi status customer khi bị từ chối. |
| Voucher FIXED `discountValue:12.5` | Type number, bounds; thiếu integral constraint | 400 `VALIDATION_ERROR`, zero row. `multipleOf:1` hoặc integer theo nghĩa toán học biểu đạt được điều kiện integral; đây không phải giới hạn lexical `1.0/1e0` của INT quotas. |

Đối chiếu source còn cho thấy:

- `DriverStatusRequest` phải thể hiện điều kiện: SUSPENDED cần reason nonblank; ACTIVE chỉ omitted/null reason, không nhận text. Schema hiện tại cho mọi combination.
- `DocumentUpload` mô tả metadata có thể bỏ qua nhưng `licenseClass` đã bắt buộc **ngay lúc submit DRIVER_LICENSE**, theo `UserDocumentSubmissionRequest.parse`. Điều này khác các metadata/ảnh/hạn bắt buộc bổ sung khi APPROVED. Không biến toàn bộ prerequisites duyệt thành fields required ở mọi upload.
- Ba decimal amount fields phải integral; PERCENT discountValue tối đa 100, cùng điều kiện liên quan discount type/cap theo validator hiện tại. Đối chiếu toàn bộ request schemas thay vì chỉ sửa một enum.

**Vì sao test vẫn PASS:** contract test hiện so sánh method/path/consumes/bodyless và một số required keys viết tay. Nó không so sánh enum query với enum/parser thực, không kiểm tra các nullable/required/length/numeric conditions trên, cũng không nối schema vào HTTP matrix. Vì vậy 32 operations parity không chứng minh client contract chính xác.

**Yêu cầu đóng R1:** sửa spec theo implementation đã APPROVED, thêm regression phát hiện đúng các sai lệch và positive controls. Giữ 1.0/1e0 hợp lệ cho amount integral, giữ INT quotas lexical strict; phản ánh conditional fields bằng schema phù hợp và mô tả rõ các quy tắc runtime không thể biểu đạt đầy đủ. Không đổi production validation/policy/schema để làm request sai trở nên hợp lệ. Không bắt buộc thêm dependency runtime hoặc full external validator.

## 3. R2 [P2] OPEN — Handoff khẳng định duplicate-key rejection cho cả auth nhưng runtime không bảo đảm

**Vị trí:** `docs/17_FUNCTION_1_HANDOFF.md:56`: “All request JSON DTOs … duplicate keys are rejected”, và câu tiếp theo quy toàn bộ hành vi đó cho mapper/HTTP regressions.

Reviewer gửi login public có hai key email cùng giá trị synthetic hợp lệ và một password synthetic. Actual application JsonMapper/MVC trả **200 OK**, token hợp lệ được trả trong memory probe, không in vào log. `LoginRequest` dùng String setters, không presence/duplicate guard; mapper production chỉ cấu hình exact decimal, không global strict duplicate detection. `RegisterRequest` cũng không có per-field duplicate guard. Unknown-field rejection và duplicate-key rejection là hai tính chất riêng.

Đây là mô tả bàn giao sai, không phải bằng chứng cần thay đổi auth policy P03. JSON Schema object không giữ duplicate keys; không thể sửa mô tả chỉ bằng `additionalProperties:false`.

**Yêu cầu đóng R2:** mô tả chính xác theo nhóm endpoint/DTO và parser thực, bỏ khẳng định toàn cục. Thêm regression ghi nhận behavior auth hiện tại cùng positive control cho duplicate rejection tại command có guard (profile/status/bank/voucher…). Không bật global parser strict hoặc đổi production auth trong lượt sửa docs/contracts này. Nếu đề xuất hardening mới, ghi thành đề xuất cần nhiệm vụ riêng, không gọi đó là yêu cầu user đã chốt.

## 4. Ghi chú bổ sung, không phải finding chặn mới

### N1 — POM checksum trong report có sai khác

P10 report dòng 27 ghi `9E7243FF673B6D98BF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219`; hash reviewer đọc từ file là **`9E7243FF673B6D98FF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219`**. Không có snapshot pom trước P10 độc lập trong lượt review để kết luận file đã bị thay đổi trước đó. Hash không khớp là sai khác bằng chứng cần erratum, không được tự suy ra source bị sửa hoặc sửa lại pom theo hash báo cáo. Giữ report gốc, ghi đính chính trong report FIX mới.

Schema, ba reference files, migration, năm entities, P09 report/review/FIX report khớp các giá trị đã ghi ở review trước. Reviewer chụp 232 file source/test/reference/history/scripts/wrapper trước khi viết docs và kiểm tra bảo toàn cuối lượt.

### N2 — TEMP cleanup vẫn bị policy chặn

Reviewer xác nhận đúng sáu thư mục cũ là direct children của TEMP, ngoài repository, không reparse point; chỉ kiểm tra metadata, không đọc key/token/evidence contents:

- `sba301-p10-config-6027217552336866762`
- `sba301-p10-config-9971155495230811732`
- `sba301-p10-jar-17787760648092423892`
- `sba301-p10-jar-8367741168530536375`
- `sba301-p10-storage-456267405934003659`
- `sba301-p10-storage-9689080637910311073`

Automatic command policy **từ chối cả phương án xóa từng file bằng LiteralPath rồi xóa directory rỗng**, sau guard exact names/paths/no reparse. Thông báo trả về chỉ có `blocked by policy`, không giải thích chi tiết. Không lặp lại qua shell/interpreter khác hay đổi ACL để vượt policy. Sáu thư mục giữ nguyên.

Lần reviewer đầu với Docker unavailable còn tạo một **thư mục rỗng** `sba301-p10-workflow-private-1377507395452970899` lúc 08:45:32, zero children, vì static workflow fixture được khởi tạo trước container. Phân biệt residue của reviewer với sáu thư mục cũ của Agent. Lần full verify thành công dọn own JAR/config/storage và workflow root mới; không có token/key thật trong dữ liệu thử.

### N3 — Chỉnh tính nhất quán của hướng dẫn

Runbook 19 đưa self-lock vào hàng 403, trong khi customer self-lock là conflict 409 theo P04; self-review/self-driver-status mới thuộc 403. Manual multipart example chỉ có dữ liệu đủ submit PASSPORT nhưng request APPROVED ngay sau cần đủ U-13; nên ghi rõ upload tối thiểu không thể approve, hoặc bổ sung một mẫu đủ approval. Kiểm tra thêm variable placeholders để chúng không tự tham chiếu và che environment values trong HTTP client được chọn. Không cần thêm real token hoặc binary fixture vào repo.

## 5. Kết luận

**P10 CHANGES_REQUESTED; R1/R2 OPEN.** Phần runtime regression/workflow/standard JAR đã có bằng chứng tốt trong phạm vi F1. Sửa hợp đồng, lời mô tả và coverage bằng [P10-FIX-01 — 5 bước](../prompts/P10_FIX_01.md); Agent báo READY_FOR_REVIEW, reviewer mới quyết định đóng R1/R2 và nghiệm thu F1.

Không triển khai P11, mở rộng F2–F4, publish Git, deploy hoặc migration trên database chung. Production/shared DB/RLS/ACL, multi-node, crash recovery và tích hợp đầy đủ F2/F3/F4 vẫn ngoài evidence hiện tại.

Kiểm tra cuối lượt: 232 file protected trong snapshot reviewer không đổi; chỉ thêm review/prompt mới và cập nhật tài liệu trạng thái hiện hành. Kiểm tra local links ở 10 Markdown files đã viết/cập nhật không có target thiếu. Git vẫn BE/HEAD=origin/BE như trên, 261 paths untracked sau thêm hai file, không staged/tracked diff; không container thử nghiệm còn chạy.
