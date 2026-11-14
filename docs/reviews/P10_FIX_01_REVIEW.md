# Review P10-FIX-01 — APPROVED

Ngày **2026-10-15**. **R1/R2 CLOSED; P10 APPROVED. P01–P10 đã được nghiệm thu trong phạm vi triển khai Function 1 đã giao.** Reviewer không phát hiện finding chặn còn lại trong lượt sửa contract/docs này. User vừa yêu cầu bổ sung bộ Postman đầy đủ; [P11 Postman](../prompts/P11_POSTMAN_FUNCTION_1.md) là công việc bàn giao mới, chưa triển khai, không mở rộng API/backend.

[Review P10 gốc](P10_REVIEW.md), [report P10](../reports/P10_REPORT.md), [report FIX-01](../reports/P10_FIX_01_REPORT.md) và các prompt cũ giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra thực chạy | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | **BUILD SUCCESS, 2:26 phút; 150/150**, 42 Surefire + 108 Failsafe; 0 failure/error/skip. Docker server28.5.2, PostgreSQL15.13 Testcontainers cô lập. |
| `Function1OpenApiContractTest` | 4/4 PASS; MVC parity32 operations, local refs cả paths/components, DTO/parser allowlists, query/response enums, required/nullable/conditional/numeric constraints và response record fields. |
| `Function1WorkflowPostgresIT` | 1/1 PASS; thêm HTTP negative/positive controls cho R1/R2, giữ toàn workflow/Clock/ownership/lock trước đó. |
| Standard executable JAR | PASS; java-jar, Unicode/space CWD, external profile/config/keys/private root, actual HTTP health/auth/documents/voucher. Artifact SHA `83E0C41EF72B517D8775BE4D225AF0A0C3E83B7E000EB3EB5A5A8910D05232F9`. |
| Packaging probe | PASS; config/key/bootstrap/document markers, private root path, private key entry và test Boot helper đều không vào JAR. |
| Independent same-helper production HTTP/PostgreSQL probe | PASS. Classpath không `target/test-classes`; các input sai cũ vẫn400, positive list/profile controls200, duplicate-email login200; phù hợp spec/docs sau sửa. Fraction voucher không tạo row; customer status không mutation khi thiếu/null reason. |
| Health probe | HTTP200/UP; body/header trace `c097f212-69c1-4d90-9159-c27e5438c5cf` khớp. |
| Preservation so snapshot review P10 | Trong 232 file protected cũ, chỉ hai test được phép đổi: `Function1OpenApiContractTest.java`, `Function1WorkflowPostgresIT.java`. Production source/resources, schema/reference/entity/migration/pom/scripts/wrapper và report/review/prompt cũ không đổi. |
| Git trước tài liệu reviewer mới | BE, HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 262 untracked, 0 staged/tracked diff; không commit/push/deploy. |

Logs tại `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p10-fix01-review-verify.log`
- `sba301-p10-fix01-review-packaging.log`
- `sba301-p10-fix01-review-contract-probe.log`

## 2. R1 CLOSED — Spec và coverage khớp validation đã duyệt

- Driver/voucher list dùng enum riêng; schema đối chiếu enum/query parser thật.
- Profile fullName optional nhưng non-null/nonblank khi có mặt; address300, nullable clearing đúng; mô tả strip/UTF-16 và giới hạn khác JSON Schema.
- Customer status required reason; driver status conditional reason; document review rejectReason conditional; GPLX licenseClass required ngay lúc submit, tách prerequisites APPROVED.
- Ba amount fields dùng integral constraint, PERCENT≤100; amount1.0/1e0 vẫn hợp lệ, INT quotas vẫn lexical integer-token-only ở runtime. PUT đủ hai key, default/null và exact code semantics giữ.
- Contract tests nối spec với DTO/parser/enum/response record; workflow kiểm chứng actual HTTP/PostgreSQL thay vì chỉ so hai bản danh sách viết tay. Negative cases không bị401/403 hoặc duplicate field che mất validation chính.

Subset schema validator có phạm vi công bố, bỏ qua format/annotations, fail rõ khi gặp assertion keyword chưa hỗ trợ trong schema được kiểm tra. Đây vẫn **không phải full semantic OAS validation**; giới hạn đã mô tả đúng, không còn được dùng để phủ nhận numeric/required/enum checks có thể biểu đạt.

## 3. R2 CLOSED — Duplicate behavior được mô tả đúng từng DTO

Handoff phân biệt unknown-field checks với duplicate checks. Auth String-setter DTO không có guard như command DTO; runtime login với email key lặp cùng giá trị trả200, không còn hứa global duplicate rejection. Workflow ghi nhận login200 và duplicate voucher command400/zero row. Không bật global strict parser hoặc đổi auth policy/source P03.

Runbook đã phân biệt customer self-lock409 với self-review/self-driver-status403. Multipart example có U-13 metadata và GPLX class; ví dụ tối thiểu không bị gọi là đủ duyệt. File references/placeholders vẫn cần dữ liệu ngoài máy khi dùng thủ công; P11 mới sẽ đóng gói collection và synthetic image fixtures đầy đủ hơn cho user.

## 4. Preservation, giới hạn và trạng thái hoàn tất

POM hash đúng hiện tại `9E7243FF673B6D98FF733C5344EB2174520E4E70C69F67EBBB62E2F0AF678219`; report FIX ghi erratum, không sửa pom/report gốc. Schema/reference/entity/migration và policies U-09–U-21 giữ nguyên.

**Hoàn tất ở đây là implementation Function 1 theo phạm vi đã duyệt:** accounts/JWT/security/CORS/profile/admin, private document submission/read/review/current KYC, driver profiles/current eligibility, owner-only bank accounts và ADMIN voucher definitions. Chưa phải bằng chứng production/shared DB/RLS/ACL/deploy, multi-node/crash recovery hoặc tích hợp đầy đủ F2/F3/F4. Git chưa publish; các source files vẫn untracked theo baseline.

TEMP residue của review trước giữ theo mô tả N2 trong review P10; không thử lại hoặc vượt automatic cleanup policy. Đây là giới hạn local test cleanup đã ghi nhận, không finding contract còn mở. Không có credential/evidence thật được dùng.

Reviewer chỉ đọc/chạy verification/probe cô lập và viết docs, không sửa implementation/tests/spec, stage/commit/push hoặc chạy DB chung. **User yêu cầu mới: P11 tạo Postman collection JSON bao phủ đủ32 operations, synthetic test data, image fixtures và assertions; PROMPT_READY, chờ Agent triển khai rồi review riêng.**

Kiểm tra cuối lượt: 235 file protected ở baseline reviewer không đổi; chỉ thêm review này/prompt P11 và cập nhật tài liệu trạng thái hiện hành. Local links trong 10 Markdown files đã kiểm tra không có target thiếu. Git vẫn BE/HEAD=origin/BE như trên, 264 paths untracked sau hai file mới, không staged/tracked diff; không container thử nghiệm còn chạy.
