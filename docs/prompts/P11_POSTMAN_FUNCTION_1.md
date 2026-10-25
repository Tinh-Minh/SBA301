# PROMPT P11 — Bộ Postman đầy đủ cho Function 1

Bạn là Agent code tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. **P01–P10 APPROVED**, R1/R2 P10 CLOSED theo [review P10-FIX-01](../reviews/P10_FIX_01_REVIEW.md). User yêu cầu một file JSON import vào Postman, đầy đủ API và dữ liệu để test Function1. Đây là đầu việc bàn giao bổ sung sau10 prompt backend, không thêm nghiệp vụ hoặc endpoint.

Thực hiện đủ **7 bước**, gửi READY_FOR_REVIEW rồi dừng. Không tự APPROVED bộ Postman, commit/push/deploy hoặc thao tác database chung.

## Đầu ra bắt buộc

1. **`docs/postman/SBA301_Function1.postman_collection.json`** — file chính user import, **Postman Collection v2.1.0 JSON**, đủ32 method/path operations và các kịch bản positive/negative có dữ liệu cụ thể. Collection có variables và scripts, không chỉ chuyển OpenAPI thành32 request rỗng.
2. **`docs/postman/fixtures/`** — ảnh PNG/JPEG tổng hợp hợp lệ cho mặt trước/sau, cùng fixture text giả ảnh nếu dùng negative case. Có files thật đủ để upload; không chỉ đường dẫn placeholder đến file không tồn tại. Không ảnh giấy tờ cá nhân thật.
3. **`docs/postman/README.md`** — hướng dẫn tiếng Việt import/config/chạy theo thứ tự, working directory, ADMIN setup, dữ liệu sinh tự động, coverage32 routes, expected status và giới hạn.
4. **`docs/reports/P11_POSTMAN_REPORT.md`** — file inventory, commands/tools/versions, structural parity, runner evidence thực tế, test counts/failures/skips, hai lần chạy mới dữ liệu và preservation/Git.

Chỉ **một JSON collection bắt buộc**. Dữ liệu text mặc định và variables nằm trong collection, không bắt user tự viết thêm CSV/data JSON/environment để chạy luồng chính. Environment JSON chỉ là tùy chọn nếu có lý do rõ; không thay yêu cầu một file collection import được. File upload dùng fixtures kèm theo vì collection lưu file paths, không nhúng ảnh vào JSON body khi API yêu cầu multipart.

## Bước 1 — Đọc source, bảo toàn và lập coverage

Đọc AGENTS/status, scope/conventions/decisions, API source, [handoff17](../17_FUNCTION_1_HANDOFF.md), acceptance18/runbook19, OpenAPI đã sửa, contracts10–16, HTTP examples, review/report P10-FIX-01 và workflow/JAR tests. Source/validator đã duyệt quyết định request contract.

Xác nhận branch/HEAD/Git. Baseline HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; phần lớn project vốn untracked. Ghi inventory thực tế, không coi tracked diff trống là không có code. Chụp hashes production tree, schema/reference/entity/migration/pom/scripts/wrapper và report/review/prompt lịch sử trước/sau.

Giữ production source/resources/config/policy/API/OpenAPI/schema/entity/migration/pom/dependencies. Không tạo auth/admin/test-helper endpoints, sửa validation, thêm seed vào production resources, bật global duplicate parser hoặc dùng shared DB để collection chạy qua. Không Git stage/reset/clean/stash/switch/commit/push. Lệnh Maven clean là build, vẫn dùng được.

Đối chiếu **đủ32 operations**, không tính request duplicates/implicit HEAD/OPTIONS/framework error là API mới:

| Nhóm | Operations bắt buộc |
|---|---|
| Health (1) | GET `/api/health` |
| Auth (2) | POST `/api/auth/register`; POST `/api/auth/login` |
| Customers (7) | GET/PATCH `/api/customers/me`; GET `/api/customers/me/kyc`; GET `/api/customers`; GET `/api/customers/{id}`; GET `/api/customers/{id}/kyc`; PATCH `/api/customers/{id}/status` |
| Documents (5) | POST/GET `/api/user-documents`; GET `/api/user-documents/{id}`; GET `/api/user-documents/{id}/files/{side}`; PATCH `/api/user-documents/{id}/review` |
| Drivers (7) | POST/GET `/api/drivers`; GET `/api/drivers/me`; GET `/api/drivers/me/eligibility`; GET `/api/drivers/{id}`; GET `/api/drivers/{id}/eligibility`; PATCH `/api/drivers/{id}/status` |
| Bank accounts (5) | POST/GET `/api/bank-accounts`; GET/DELETE `/api/bank-accounts/{id}`; PATCH `/api/bank-accounts/{id}/default` |
| Vouchers (5) | POST/GET `/api/vouchers`; GET/PUT `/api/vouchers/{id}`; PATCH `/api/vouchers/{id}/status` |

Trong README/coverage ghi mỗi operation → request name/folder → actor → input → expected response → actual execution evidence. Mỗi operation có ít nhất một positive request executable trong main workflow; negative requests bổ sung không thay positive coverage.

## Bước 2 — Collection variables, dữ liệu hoàn chỉnh và fixtures

### Cấu hình user nhập

- `baseUrl` mặc định `http://127.0.0.1:8080`, cho sửa port.
- `adminEmail`, `adminPassword` rỗng mặc định; user nhập **tài khoản ADMIN test đã provision**. Token/ID ban đầu rỗng, lấy tự động khi chạy.
- Tài liệu chỉ rõ runtime app cần external DB/JWT config, DB local disposable đã có đúng schema, storage enabled và root private hợp lệ. Health UP không tự chứng minh mọi dependency sẵn sàng.
- Nếu chưa có ADMIN: hướng dẫn dùng **bootstrap ADMIN hiện có** trên external local profile của DB test mới, với synthetic fullName/email/phone/password mẫu; tắt bootstrap lại sau setup. Không register rồi promote CUSTOMER, không reset/unlock account đã có, không hardcode credentials demo thành mặc định production. Không chạy setup SQL vào DB nhóm.

### Dữ liệu collection tự chuẩn bị

Tạo `runId` mới khi bắt đầu mỗi lượt, clear token/resource variables cũ của lượt trước, giữ cấu hình user đã nhập. Primary CUSTOMER và peer CUSTOMER phải register qua API; không seed SQL outcomes để thay flow.

Chuẩn bị sẵn:

- Customer/peer fullName/email/phone/password synthetic, đúng length/password UTF-8 constraints; email `@example.test`, email/phone unique mỗi run, khác nhau giữa hai account. Không mẫu phone vượt20 ký tự.
- DOB ví dụ1990-01-02; address synthetic≤300. Danh tính và GPLX có docNumber unique≤50, fullNameOnDoc, DOB, issuePlace, issueDate hợp lệ; GPLX `licenseClass=B2`, expiry tương lai, hai mặt ảnh; passport đủ approval metadata, expiry có thể omitted theo U-13.
- Hai bank accounts với số synthetic khác nhau và giữ zero đầu; bankName/accountHolder đúng giới hạn. Một create omitted makeDefault, một true để kiểm tra U-16/U-17.
- FIXED/PERCENT vouchers code unique giữ case, amount nguyên VND, quota INT tokens, description rõ synthetic. Ví dụ FIXED1000/maxDiscount0/minOrderAmount0/usageLimit10/perUserLimit1; PERCENT10/maxDiscount50000. Generate start/end quanh thời điểm chạy để window CURRENT, end>start. Timestamp local Việt Nam, không thêm Z/offset và không đóng băng tháng/ngày khiến collection lỗi sau vài hôm.
- Variables runtime `adminToken/adminId`, `customerToken/customerId`, `peerToken/peerId`, `passportId/licenseId/rejectedDocumentId`, `driverId`, `bankAccountOneId/bankAccountTwoId`, `voucherId` và code/time values. Không dùng ID cố định1/2/3 hoặc yêu cầu user copy ID qua mỗi request.

Tạo synthetic front/back PNG/JPEG hợp lệ bằng code; file paths relative như `fixtures/synthetic-front.png`, nằm dưới `docs/postman/`. Không data URI/base64 thay file part; không hardcode absolute path máy tác giả trong export. Postman working directory đặt `docs/postman/` để resolve fixtures. Desktop/client file upload phải thực sự kiểm chứng; không yêu cầu upload lên cloud/team workspace.

Chọn scope variables nhất quán. User có environment cùng tên có thể override collection variables: README giải thích dùng No Environment hoặc đúng environment, scripts kiểm tra resolved inputs tránh stale tokens/IDs. Không dùng placeholders tự tham chiếu. Không log token/password hoặc xuất runtime secrets vào collection/environment committed.

## Bước 3 — Chuỗi request đầy đủ, chạy đúng thứ tự

Đặt tên request/folder tiếng Việt dễ đọc, có thứ tự số. Collection main run phải bao phủ toàn32 operations. Mỗi request có description actor, prerequisites, payload đầy đủ, expected status và side effects. Tối thiểu workflow sau:

1. **Init/health/admin login:** sinh data và validate cấu hình; health200/UP; login ADMIN rồi GETme kiểm tra đúng role/status. Missing ADMIN credential phải báo lỗi setup rõ, không gửi mutations với placeholder và không skip để giả PASS.
2. **Register/login:** primary + peer qua HTTP; tự lưu token/IDs sau response success; verify roleCUSTOMER/statusACTIVE. Có wrong-password401 và duplicate identity409, không overwrite token thành rỗng sau negative response.
3. **Customer/admin:** me, PATCH hợp lệ/nullable clear, current KYC; ADMIN list/page/filter/getById/getKyc; CUSTOMER gọi admin route403. Account LOCKED test đặt gần cuối để không phá các flow sau.
4. **Documents/KYC:** submit primary PASSPORT đủ approval metadata, upload GPLX hai mặt/class/expiry; list mine + admin all/filter; get detail; owner/admin binary front/back; peer foreign404; ADMIN approve identity/GPLX, current KYC VERIFIED. Dùng một document PENDING riêng để REJECTED có rejectReason, assert không sửa terminal document; minimal PASSPORT là case riêng không gọi là đủ approval. Không lẫn ID PASSPORT với GPLX.
5. **Drivers:** create own bodyless→PENDING, duplicate409; own me/detail/current eligibility theo cả me và ID; ADMIN list, activate khi identity/GPLX hợp lệ, eligibleNow true; suspend với reason và reactivate đúng; invalid reason/type/status được400. Peer foreign404. Nếu test ADMIN self-status403 thì chuẩn bị/reuse đúng profile **của dedicated test ADMIN**, không nhầm driver của customer; setup phải rerun được nếu profile admin đã tồn tại.
6. **Bank:** create first omitted default→false, second true→default; list/get masked; switch default và no-op; verify at most one default qua response list; peer/ADMIN foreign404; duplicate409; delete unreferenced default→data:null và còn zero defaults theo U-17. Không auto-promote peer account; không sửa payee fields qua API không tồn tại. Đặt delete sau các get/default assertions cần ID đó.
7. **Vouchers:** ADMIN create/get/list/page/filter, code exact case, FIXED/PERCENT, PUT đủ description+usageLimit, deactivate/reactivate; usedCount giữ0, fields bất biến giữ. CUSTOMER admin route403, duplicate exact code409. Không apply/redeem, reserve quota, tính tiền/order hoặc sửa usedCount.
8. **Account lock/unlock:** chứng minh customer token còn hợp lệ qua GETme; ADMIN lock customer với reason, cùng token sau lock401; ADMIN unlock với reason, same token hoạt động lại theo baseline. Không tự khóa ADMIN. Self-lock admin request riêng expected409/no status mutation; thử lại admin me để chứng minh actor vẫn ACTIVE.
9. **Summary:** chỉ số actual requests/assertions/failures; trạng thái cuối và những resource synthetic còn lại. Không xóa customer/docs/driver/voucher bằng endpoint không tồn tại, không SQL cleanup mù; giữ data cho user xem DB/response. Lần run sau tạo identifiers mới và không bị duplicate ngoài deliberate negative cases.

Sắp thứ tự thực tế để các prerequisites có trước, negative cases không phá main state. Có thể dùng helper scripts/pm.sendRequest có kiểm soát cho setup, nhưng32 operations phải có request rõ trong collection và coverage; không giấu phần lớn API trong script khó dùng tay. Tránh vòng lặp/auto-login không giới hạn. Public requests/401 probes có `noauth` rõ; admin/customer/peer dùng đúng token, không để inherited auth biến401 thành200.

## Bước 4 — Assertions và negative data có ý nghĩa

Mỗi JSON request kiểm tra **expected HTTP status cụ thể**, content-type, success/code, envelope fields, traceId khớp X-Request-ID và no-store khi controller/handler thực tế bảo đảm. Không dùng list chung `[200,400,401,403,409]` để mọi kết quả đều xanh. Negative case phải kiểm chứng đúng lỗi muốn test, account/quyền hợp lệ trước khi gửi malformed input.

Positive responses kiểm tra ID/owner/status/default/field allowlist và side effect quan sát được. Re-fetch sau negative mutation để chứng minh row/status/audit không đổi khi API cho quan sát; không claim DB-row-count hoặc transaction guarantee chỉ từ collection nếu không có evidence DB. Existing PostgreSQL tests vẫn là bằng chứng concurrency/constraints nội bộ.

Binary downloads tách test JSON: JPEG/PNG content-type, nonempty bytes, attachment/nosniff/no-store/X-Request-ID. Không gọi pm.response.json() toàn cục cho ảnh. Binary errors vẫn kiểm tra JSON envelope/trace. Không đòi binary có JSON traceId trong body.

Negative scenarios tối thiểu, dùng data hợp lệ ở mọi field ngoài field cố ý sai:

- Missing/invalid JWT401, role403 và ownership404; IDs invalid400/missing404 theo handler thật.
- Unknown query/body keys, duplicate query keys; sort/paging/enum sai. Driver list LOCKED/INACTIVE và voucher list PENDING/SUSPENDED/LOCKED→400; valid enums→200.
- Profile fullName:null/blank, address301 ASCII→400; address300→200, omitted field và nullable clearing đúng.
- Customer status missing/null/blank reason400; driver ACTIVE+text reason400, SUSPENDED thiếu/null/blank reason400; valid conditional commands positive. Không đổi U-09/U-15 để test dễ hơn.
- GPLX thiếu licenseClass khi submit400; document approval thiếu U-13 evidence409; reject thiếu reason400; review terminal409. ADMIN self-review403 dùng document thuộc đúng admin, không dùng foreign customer document.
- Bank unknown immutable-edit fields400, makeDefault sai type400, duplicate409 và foreign404; bodyless driver create/bank default/delete không query/body bytes. Lỗi bank FK/payout không được tạo module F4 chỉ để có test409.
- Voucher fractional12.5, near-integer `1.00000000000000001`, PERCENT101, timestamps sai, quota0/1.0/1e0, PUT thiếu một key, immutable fields/usedCount400; positive amount1.0/1e0 và quota integer. **Near-integer/underflow payload phải giữ raw JSON token bằng chuỗi literal**; không qua JS Number/JSON.stringify làm tròn trước khi gửi. Mỗi field chỉ xuất hiện một lần trừ deliberate duplicate test. Duplicate login email cùng giá trị hiện200, duplicate guarded command400; không hứa auth global duplicate rejection.

Cases cần control môi trường như storage disabled503, oversized413, actual DB lock timeout503/concurrency, last ACTIVE ADMIN với nhiều ADMIN fixture, expiry Clock/JWT time và referenced payout409: nếu không thực thi an toàn trong main run, README ghi rõ setup thủ công/evidence Maven hiện có và **NOT_RUN/MANUAL**, không ghi collection đã PASS. Không thêm test routes, clock override production hoặc bỏ auth để mô phỏng. Không cần clone toàn bộ150 Maven tests vào Postman; bộ collection bao phủ32 HTTP operations và các behaviors quan trọng có thể chạy thật từ client.

Scripts nên fail rõ khi missing dependency/variable/file, không test PASS rỗng, không catch rồi bỏ qua assertion. Không log whole request/response login, Authorization hoặc raw evidence/bank numbers. Dữ liệu file synthetic vẫn không đưa vào public resource/JAR.

## Bước 5 — Hướng dẫn user chạy được

README tiếng Việt phải trả lời đủ:

1. File JSON nào import, chọn format collection2.1; Postman bản mới có format3.0 khác nhưng user yêu cầu JSON portable, không thay file chính bằng YAML3.0.
2. Mở app local với external config/schema/JWT/storage đúng; ADMIN test đã tồn tại hoặc bootstrap local như bước2, không đoán credential. Chỉ rõ **user nhập baseUrl/adminEmail/adminPassword**, còn customer/peer/token/ID/data test tự sinh.
3. Set Postman working directory đến `docs/postman`, fixtures sẵn trong package; nếu UI phiên bản đó không resolve src tự động, hướng dẫn chọn lại các file đính kèm và kiểm chứng đường đi. Không yêu cầu tạo ảnh giấy tờ hay viết JSON từ đầu.
4. Cách Run whole main workflow trong Collection Runner, dùng No Environment hoặc environment đúng, bật/giữ local variable values phù hợp; cách chạy riêng request khi đã có prerequisites. Không export/share runtime tokens.
5. Cách chạy lại tạo runId mới; resource nào còn để kiểm tra DB; account phải được unlock cuối flow. Cách nhận lỗi setup ADMIN/storage/file path/token expired với trace để sửa đúng.
6. Coverage32 routes + positive/negative cases, actual runner evidence và MANUAL/NOT_RUN cases. Không nhầm backend complete với bộ Postman đã review hoặc full rental/production readiness.

## Bước 6 — Validate và chạy thật collection trước báo hoàn tất

- Parse JSON, validate **Postman2.1 official schema** bằng tool phù hợp ngoài runtime pom. Kiểm tra mọi pre-request/test JS syntax, variables/IDs/references, body modes/form-data parts/query/auth, file src tồn tại và no hardcoded secrets/local absolute paths.
- Automated parity flatten requests: normalize variable path segments đúng map `{id}/{side}`, compare unique method/path set bằng32 operations OpenAPI/source. Không so substring hoặc chỉ đếm tổng request; report missing/extra operations và tổng số test scenarios riêng.
- Chạy **actual Newman2.1-compatible hoặc Postman runner** với production app thật + disposable PostgreSQL15.13/external key/config/private root; provision dedicated synthetic ADMIN bằng fixture/bootstrap local, primary/peer register qua HTTP. Không chạy trên DB nhóm. Có thể dùng helper chỉ ngoài repo/test tooling; không đổi Start-Class artifact thành helper để gọi là production app.
- Chạy **hai lượt mới trên cùng DB test**, dữ liệu unique mỗi lượt, tất cả32 operations được thực thi và assertions đạt. Đừng chỉ parse JSON hoặc gửi health rồi gọi whole collection PASS. Ghi runner version/commands/counts/failures/skips và unresolved/manual limits. Nếu request fail, sửa collection/data/order/fixture theo source trước, không sửa production cho vừa collection.
- Chạy/giữ regression backend150 tests và packaging nếu thay scripts/tests hoặc cần xác nhận delivery cuối; không thêm runtime deps. Không tự tạo tests mới trong backend khi chỉ cần collection validation; tests/Postman checks đã được user yêu cầu cho đầu việc này.
- Runners có thể in response/variables vào report: dùng output summary/sanitized reporting, không publish JWT/adminPassword/key path/private data. Không dùng `--suppress-exit-code` để che failures; giữ exit code thật. Dùng bounded startup/process cleanup, guards cho TEMP paths mới của chính lượt này.

Nguồn chính thức để đối chiếu format/tooling, ghi version đã dùng:

- [Postman collection schemas](https://schema.postman.com/) — v2.1 JSON schema.
- [Postman schema versions](https://learning.postman.com/docs/use/use-collections/collections-schemas) — format3.0 và khả năng Newman chạy2.1.
- [Working directory và file paths](https://learning.postman.com/docs/getting-started/installation/settings/working-directory).
- [Newman command reference](https://learning.postman.com/docs/reference/newman-cli/newman-options/) — working-dir, folder, timeouts, exit status.

Không upload spec/collection/data/keys lên cloud để validate; không cài plugin hoặc thay version dependency backend. Dev runner tạm ngoài runtime project được phép để thực thi yêu cầu test.

## Bước 7 — Report và dừng

Tạo report P11 gồm:

- File chính/fixtures/guide, inventory32 operations + scenario counts/roles/expected codes/data variables.
- User phải nhập gì và phần nào đã chuẩn bị sẵn; ADMIN không sinh được từ public register. Ghi rõ ảnh fixtures thật và working directory đã test.
- Structural schema/parity/script checks và actual runner evidence **hai lượt**, resource IDs có thể redacted, counts/request/assertions/failures/skips, manual cases; không fabricated PASS.
- SHA protected before/after, production/schema/history không đổi, Git branch/HEAD/status và inventory untracked đầy đủ. Không stage/commit/push/deploy hoặc dùng shared DB.
- Giữ P01–P10 APPROVED; riêng P11 **READY_FOR_REVIEW**, không tự APPROVED. Cập nhật status/docs index liên quan, không đổi report/review/prompt cũ.
- TEMP residue cũ bị automatic policy chặn vẫn là giới hạn lịch sử; không retry qua interpreter/shell khác, sửa ACL hoặc bypass policy. Cleanup tài nguyên test mới đúng phạm vi đã kiểm tra và ghi rõ nếu còn residue.

Kết thúc gửi link **collection JSON + fixtures/README + report**, chỉ rõ các thao tác user cần làm để import/run. Dừng để user chuyển kết quả cho reviewer; không chuyển sang việc khác.
