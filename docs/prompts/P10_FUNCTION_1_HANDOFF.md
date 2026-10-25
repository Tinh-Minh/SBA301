# PROMPT P10 — Kiểm tra xuyên suốt, OpenAPI và bàn giao Function 1

Bạn là Agent code tại **`C:\Users\FPTSHOP\Desktop\SBA301_RentCar`**, nhánh **BE**. **P01–P09 APPROVED** theo [review P09-FIX-01](../reviews/P09_FIX_01_REVIEW.md), R1 CLOSED sau reviewer 144/144, packaging/Boot/health và cùng numeric probe. Thực hiện đủ **9 bước P10**, báo READY_FOR_REVIEW rồi dừng để reviewer nghiệm thu cuối. **Không tự APPROVED/đánh dấu F1 hoàn tất, commit/push/deploy hoặc dùng database chung.**

## 1. Bước 1 — Đọc, chụp hiện trạng và lập ma trận nghiệm thu

Đọc AGENTS.md, status, scope/conventions, API/database/persistence, decisions/roadmap/local guide, contracts 10–16, reviews cuối P01–P09 và reports liên quan. Đọc controller mappings/security/DTO/parser/service/error/log/config/tests trước khi viết hợp đồng. Spec mô tả implementation đã review; không chép proposal cũ hoặc lời mentor thành luật mới.

Xác nhận BE/HEAD/working tree. Baseline reviewer HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`, 248 paths untracked trước thêm docs reviewer. Giữ mọi thay đổi có trước; diff trống không thay file inventory. Ghi SHA-256 **trước sửa** cho reference/schema/migration, năm entities, pom và source/config liên quan; so sau để chứng minh bảo toàn hoặc liệt kê file changed thật. Không Git reset/clean/stash/stage/commit/push/branch switch.

Lập ma trận AC-01–AC-09 và các U-* đã xác nhận: luật/endpoint → source → test/evidence → giới hạn. P10 gồm docs/contracts/tests/verification và fixes nhỏ cho lỗi integration có bằng chứng trong F1. Nếu thấy bug thật, ghi repro/root cause và regression rồi sửa trong scope; không refactor diện rộng hoặc đổi policy để hợp tài liệu. Finding cần schema/phạm vi/yêu cầu mới phải báo rõ, không tự mở rộng.

Phạm vi đúng năm bảng customers/user_documents/drivers/bank_accounts/vouchers. Không thêm role/OTP/reset-password/refresh-token/email-verification, renewal/revoke, cloud/sweeper/history tables hoặc modules xe/slot/order/payment/payout/dispute/review. Không sửa leader schema/entity mapping/migration/reference/currency/timezone hoặc nâng dependency runtime để hoàn thành bàn giao.

## 2. Bước 2 — Inventory API và quyền từ source thực tế

Lập bảng canonical trong tài liệu bàn giao: method/path, media type/request schema, required/nullable/defaults, quyền CUSTOMER/ADMIN/owner, side effects, success/error codes, response/no-store/trace và test evidence. Bao phủ health, auth, customer profile/admin/current KYC, document upload/list/detail/binary/review, driver profile/status/current eligibility, bank năm routes và voucher năm routes.

Lấy method/path pairs từ actual MVC `RequestMappingHandlerMapping`; không coi implicit HEAD/OPTIONS hoặc `/error` là endpoint F1 mới. Không bỏ route vì một controller chứa nhiều quyền. Các khác biệt phải mô tả đúng:

- Health/register/login public theo Security; còn lại JWT. Role/status lấy DB hiện tại. ADMIN bypass owner chỉ ở resource đã cho phép; **bank owner-only cả ADMIN**. Driver profile không phải role.
- Current KYC theo Clock khác stored customers.kyc_status; driver ACTIVE khác eligibleNow; voucher status khác windowState và không đồng nghĩa người thuê áp được voucher.
- Media type theo **actual consumes**. Auth hiện JSON, không đổi thành form vì lời mentor. Driver POST/bank default/delete không byte body; strict query/type/presence mỗi route theo code, không sửa controllers để đồng nhất ngoài requirement.
- Fields optional ở P05 submission khác prerequisites APPROVED ở P06. BackImage optional khi upload nhưng U-13 yêu cầu các mặt ảnh/metadata lúc duyệt; không làm OpenAPI upload bắt buộc tất cả fields của bước approval.
- Binary document success là JPEG/PNG bytes với Content-Disposition/no-store/nosniff/X-Request-ID; lỗi là JSON envelope. Không bọc binary thành data/base64 hoặc expose locator/path/public URL.
- INT quotas cần integer JSON token; decimal amounts integral cho phép 1.0 nhưng reject phần lẻ exact. JSON Schema không biểu đạt mọi lexical distinction như 1.0/1e0 ở INT; ghi description/extension và regression, không claim schema một mình enforce.
- IDs hiện là JSON long numbers, không tự đổi thành strings. Ghi lưu ý FE về safe integer nếu IDs tương lai vượt giới hạn JS. Dates/local date-times theo contract, không thêm UTC Z cho LocalDateTime.
- Error precedence khi vừa body/query sai vừa thiếu token có thể khác vì ingress/security; không hứa mọi input luôn cùng status nếu chưa kiểm chứng.

Không hardcode danh sách IDs/test accounts vào API sản phẩm. Error codes lấy từ enum/handlers hiện tại; inventory phải dựa trên cả source và tests đã chạy.

## 3. Bước 3 — OpenAPI tĩnh và kiểm tra đồng bộ

Tạo **`docs/api/openapi-function1.json`**, dùng **OpenAPI 3.1.0**, để FE import cục bộ. Giữ API/runtime dependencies; không thêm Swagger UI/springdoc runtime endpoint/security bypass. Công cụ validate bên ngoài nếu dùng phải ghi version/lệnh; không upload spec hoặc dữ liệu thật lên dịch vụ web.

Spec phải có:

- Info/tags, unique operationIds, relative/local server hợp lệ và toàn bộ actual method/path F1. Không fake deployment URL, proposal endpoints, F2–F4 methods hoặc internal sensitive lookup thành HTTP route.
- Bearer JWT/global security; health/register/login override public đúng code. Roles/ownership dùng description hoặc `x-required-roles`/policy extension; không giả OAuth scopes.
- Request media schemas/parameter allowlists/page/sort/enums/IDs/defaults/presence. additionalProperties theo implementation; duplicate-key rejection ghi description/tests vì JSON Schema object không giữ duplicate tokens.
- OAS 3.1 nullable đúng version: union type/anyOf, không trộn nullable của 3.0. Numeric bounds/INT range/text limits theo validator thực. Local timestamp không được mô tả như RFC3339 có offset. Password byte cap, code-point/UTF-16 length semantics lấy từ code, không tự bịa regex.
- Multipart scalar/file/date/type/media/limits và dynamic prerequisites; binary success image/jpeg,image/png, JSON errors. Bodyless routes không requestBody, ghi rõ mọi byte bị từ chối.
- Envelope theo từng data type, PageResponse/errors/trace, response readOnly và request sensitive fields. Không response passwordHash/key/document locator/raw bank number. TokenResponse có accessToken là contract auth; examples chỉ placeholder tổng hợp.
- HTTP codes thực theo operation: 200/201/400/401/403/404/409/413/415/503 khi phù hợp, Location/trace/content headers. Không paste runtime JWT/keys/PII/local storage paths vào examples.

Nguồn cấu trúc: [OpenAPI 3.1.0 specification](https://spec.openapis.org/oas/v3.1.0.html). JSON parse được không tự chứng minh mọi schema đúng.

Thêm automated contract check dùng libraries test hiện có: parse JSON, resolve local `$ref`, operationIds unique, method/path set **bằng inventory MVC thật** của controllers F1, security/media/bodyless/required key semantics chính. Đối chiếu serializers/HTTP responses thực với representative DTO/envelope field sets và binary headers. Không chỉ test spec với một bản copy danh sách tự viết khác. Nếu chưa có full OAS validator, báo đúng mức structural/parity/examples; không gọi parser đơn thuần là full OpenAPI validation. Spec/test helper ở docs/tests, không production resources/JAR hoặc public route.

## 4. Bước 4 — Workflow HTTP xuyên suốt trên PostgreSQL cô lập

Thêm `Function1WorkflowPostgresIT` hoặc tên rõ tương đương: app HTTP/JWT/Security/JPA thật, PostgreSQL 15.13 Testcontainers, Clock test có kiểm soát, RSA keys tạm và external private root thật. Tạo synthetic JPEG/PNG hợp lệ bằng code, không giấy tờ cá nhân. Reset Clock/close resources trong finally dù assert fail.

Timeline bắt buộc:

1. Provision ADMIN qua fixture SQL/bootstrap cô lập đã có; nói rõ đây là setup test, không admin self-register API. CUSTOMER và peer **register qua HTTP**, login JWT, assert server role/status/defaults và safe profile; PATCH profile chỉ fields allowed, DB/audit đúng.
2. Customer multipart submit PASSPORT và GPLX đủ metadata/expiry/class/front/back để ADMIN khác approve theo U-11/U-12/U-13. Owner download bytes đúng canonical format/headers, peer404. Review response/metadata/snapshot/current KYC và traces đúng.
3. Customer POST driver không body → PENDING; ADMIN activate theo U-14/U-15; current KYC VERIFIED và driver eligible true. Workflow chính không seed SQL approval/status để bypass transitions.
4. Customer create bank omitted/false → non-default, thứ hai true → default; đổi default/no-op rồi xóa unreferenced default → zero theo U-16/U-17. Peer/foreign ADMIN404, trusted lookup chỉ đúng bankId+recipient. Không payout/bank API thật.
5. ADMIN create voucher code giữ case/amount exact/hạn theo Clock; PUT đủ description/quota, status disable/reactivate, list/filter/window. CUSTOMER403; near-integer decimal400/no row. Workflow này không mutate F3 counter để giả redeem.
6. ADMIN lock CUSTOMER qua P04, old JWT401/no mutation; unlock rồi request hoạt động theo behavior hiện có. Trước lock chứng minh JWT vẫn hợp lệ và không hết hạn để401 thật sự do account LOCKED. Docs/driver/bank không tự xóa/suspend/rewrite; giữ U-09 last-admin/self-lock.
7. Advance Clock qua GPLX expiry và voucher end: PASSPORT vẫn valid (expiry null theo policy), KYC giữ VERIFIED; driver current-ineligible dù stored ACTIVE, GET không sửa audit. Voucher window ENDED nhưng stored status giữ. Khi đổi Clock phải dùng credential hợp lệ tại thời điểm mới; không nhận401 do token expired rồi gọi là expiry eligibility test. Có thể dùng fixture token issuance/decoder clock phù hợp tests hiện có, không nới production token TTL/security. Record thời điểm token/Clock và reset sau test.

Capture IDs từ actual responses, không số cố định. JSON responses có trace body/header; binary kiểm tra header riêng. Capture positive after-commit events và negative privacy; không chỉ assert absence trên log rỗng. Snapshot DB/files trước/sau negative requests; new workflow không thay existing race suites hoặc seed outcome thay endpoints.

Đây là workflow F1 chứng minh các module dùng chung account/identity/storage/security/Clock đúng; không gọi là full rental/payment integration F2–F4.

## 5. Bước 5 — Smoke standard executable JAR với config ngoài/CWD khác

Thêm packaged-app smoke IT riêng hoặc extend evidence phù hợp: **standard executable production JAR** chạy `java -jar`, không đổi Start-Class thành test helper cho ca smoke mới. Giữ StorageRootBootJarIT chuyên root policy.

- JAR từ Maven verify, copy TEMP nếu cần; run từ CWD khác có space/Unicode. Config/key/private root ở TEMP **ngoài protected artifact/repository tree**. PostgreSQL Testcontainer riêng, baseline cô lập, RSA/config tạm; không DB local/shared.
- Load external application-local config/profile đúng LocalDevelopment; startup schema validate. Test-only Flyway enable chỉ disposable DB. Không source schema.sql nhóm, keys ở resources hoặc secret config trong JAR.
- Child process không mở UI window; startup/port wait có timeout/exit fail-fast, không arbitrary sleep/infinite wait. Log TEMP không dump config/key/JWT. finally stop child/container và cleanup đúng TEMP paths đã kiểm tra, không recursive delete computed path chưa xác minh.
- Actual HTTP health200/UP/trace, register/login/me, synthetic private upload/download khi storage enabled với owner checks. ADMIN fixture login rồi positive voucher create và invalid fractional POST400/rows0 để chứng minh mapper hiện diện trong artifact/MVC thật.
- Source production JAR không test helper/fixtures/local config/key/marker; không mutate manifest hoặc nhét test class để claim standard app smoke. Record artifact SHA, launch mode/CWD/profile, external config evidence và outcomes an toàn.

Health là web liveness; startup dùng DB không biến GET health thành readiness mọi dependency. Không đổi health contract/thêm Actuator/monitoring chỉ vì bàn giao.

## 6. Bước 6 — Request mẫu và tài liệu FE/F2/F3/F4

Tạo **`docs/17_FUNCTION_1_HANDOFF.md`** và **`docs/api/function1-examples.http`**, variables/placeholders cho baseUrl/adminToken/customerToken/peerToken/IDs/image paths. Không token/secret thật hoặc request tới shared DB. Placeholders nhìn rõ; mẫu không là script tự chạy mutations tới URL tùy ý.

Nội dung cần có:

- Setup/build/test/local run, JDK21/Docker/external config/keys/private root/DB schema responsibility. Link LocalDevelopment thay chép hai bộ config. Bootstrap disabled mặc định; ADMIN thật do nhóm provision, không tự promote/reset/unlock.
- API matrix/rights/DTO/errors/trace, media/paging/sort/code/time/currency/IDs. Ví dụ JSON/bodyless/multipart/binary và situations 401/403/404/409/413/415/503 thực; không ghi fabricated outputs là đã chạy.
- FE: bearer/CORS exact origins/no-store/trace khi lỗi, authenticated binary download không public img URL, snapshot/current KYC, stored/current driver, bank mask/full internal và exact voucher code/decimal/window. Token storage phía FE là quyết định FE, không frontend redesign.
- F2: current DriverEligibilityService snapshot, expiry/identity-license separation, recheck tại action/transaction; không allocation/reservation guarantee.
- F3: current account/KYC và voucher definition/row locks/U-19/U-20/U-21, latest admin quota. Meaning usedCount/per-user/reserve-release/order pricing thuộc F3; synthetic counter fixture không full integration, không public apply endpoint.
- F4: bankId+recipient lookup, full payee DTO/toString redacted, immutable fields/composite FK/zero default và snapshot limitation. F4 money transactions/policy/locks riêng; FK fixture không full payout.
- User U-decisions, technical baselines và deferred Q phân biệt rõ. Bank không updatedAt, durable audit thiếu; OTP/email verification, renewal/revoke/jobs/cloud/production RLS/keys/root/ACL/shared schema/deployment/multi-node/crash limits chưa giao hoặc chưa test. Không gọi deferred scope là bug mới bắt buộc hoặc tuyên bố production ready.

Docs/spec/errors phải nhất quán; current headers không để P09 CHANGES_REQUESTED sau review FIX đã duyệt. Historical reports/reviews/prompts giữ nguyên. Roadmap kế hoạch không phải bằng chứng implementation.

## 7. Bước 7 — Secret/config/artifact review và tái lập

Review Git inventory gồm untracked, ignore/packaging exclusions, production resources/config defaults, fixtures và docs/examples/spec. Quét targeted known synthetic markers/sensitive file types; không in keys/JWT/password/DB secret contents. Nếu thấy real secret, báo file/location an toàn, không paste nội dung hoặc xóa rộng file user.

Kiểm tra:

- JWT issuer/audience/TTL/keys/CORS/root/DB không generated-key hoặc default credential fallback. Example dùng env references; bootstrap/storage/Flyway disabled theo baseline.
- JAR không local config/private keys/raw evidence/test helpers/private-root path/temp markers. Smoke dùng external config; production resources chỉ baseline được phép.
- Hash schema/entities/migration/reference trước/sau giữ; không Hibernate DDL writes hoặc Flyway shared DB. DDL/fixtures mới chỉ test scope, không production JAR.
- Logs TEMP ngoài target, child processes/container cleanup hoàn tất; không skip tests để pass. Links/spec refs/sample variables hợp lệ, code/naming/semantics nhất quán.
- Inventory thật thuộc F1, không stub/mock endpoints được nói đã hoàn tất. Không stage/commit/push để dọn untracked; Git publication chờ user yêu cầu sau review.

Có thể thêm **`docs/18_FUNCTION_1_ACCEPTANCE.md`** cho AC matrix/evidence/hashes/gaps và **`docs/19_FUNCTION_1_RUNBOOK.md`** cho startup/log/troubleshoot. Tránh duplicate contracts; dùng links và commands cụ thể. Nêu nhóm cần cấp config gì khi deploy, không yêu cầu secret vào chat để test cô lập.

## 8. Bước 8 — Full regression cuối và evidence

Chạy targeted workflow/OpenAPI parity/standard JAR smoke, rồi:

```powershell
Set-Location 'C:\Users\FPTSHOP\Desktop\SBA301_RentCar'
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
.\mvnw.cmd -B clean verify -Ppostgres-it
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-local-config-packaging.ps1
```

Xác định JDK21 thật; toàn bộ **144 tests hiện có và tests mới** chạy 0 failure/error/skip. Ghi actual Surefire/Failsafe/class/workflow/contract/JAR counts, không dự kiến. Spec structural parser không tự là full semantic validation; diff trống không thay inventory.

Giữ all reviewed regressions: auth/issuer/hash/raw DB logging, trace/strict DTO/presence, self-lock/last-admin/concurrency, P05 images/receipts/native Boot root/rollback/UNKNOWN, P06 diagnostics/actual upload-review contention, P07 Java whitespace/current Clock/U-15, P08 default/FK/owner/privacy, P09 exact decimal/latest counter/actor/status/timeouts. Không hạ security/constraints/timeout để qua.

Record actual packaged HTTP startup/config/outcomes; shared DB/F3/F4 full flows chưa chạy vẫn limitation. Ghi lệnh/log/reruns/resource cleanup thật, không giấu fixture/environment failures. Nếu sửa source sau full verify, chạy lại targeted và final full suite cho state cuối.

## 9. Bước 9 — Report, status và chờ reviewer nghiệm thu

Sau thực hiện tạo **`docs/reports/P10_REPORT.md`**, gồm:

- Chín bước/files/code fixes nếu có cùng repro/regression; scope/schema/U-decisions giữ. Actual API inventory/OpenAPI operation count/parity và mức validation.
- Workflow HTTP timeline/IDs/traces/status/DB/audit/files/security/Clock outcomes; standard JAR mode/profile/CWD/external config/health/private upload/numeric smoke evidence.
- AC-01–AC-09 mapping và limitations; artifacts FE/F2/F3/F4, phần đã có và cần joint integration. Không claim orders/payments hoàn tất hoặc production readiness.
- Targeted/full counts/failures/errors/skips, packaging checks, logs/artifact SHA, config review, schema/entity/reference/history hashes trước/sau.
- Git BE/HEAD/staged/untracked đầy đủ, source changes thật. Nếu thiếu evidence ghi phần nào chưa xong, không giả PASS/APPROVED.

Update AGENTS/index/README/API/architecture/decisions/plan/roadmap/status/local guide: **P10 READY_FOR_REVIEW, P01–P09 APPROVED**, handoff links đúng, historical docs nguyên trạng. Chưa có review P10 thì chưa ghi toàn Function 1 COMPLETE/APPROVED/production ready.

Gửi report và dừng. Không tự tạo P11/chuyển F2–F4, stage/commit/push/deploy/SQL shared DB. Reviewer xác nhận nghiệm thu F1 sau kiểm tra P10; Git publication/deploy vẫn cần yêu cầu người dùng.
