# Kế hoạch backend — Function 1

## Đọc trước — hướng hiện hành 2026-10-15

1. [Chạy Supabase và .env](SUPABASE_SETUP.md) — runtime không cần Docker; schema do leader quản lý.
2. [Checklist scope và phần đã bỏ](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md).
3. [Sơ đồ từng luồng để user review](21_FUNCTION_1_FLOWS.md).
4. [Đối chiếu59 trường entity/SQL](22_ENTITY_SCHEMA_FIELD_MAP.md).
5. [Report audit/tinh gọn](reports/SCOPE_SUPABASE_AUDIT_REPORT.md).

Các trạng thái P01–P11 bên dưới là lịch sử implementation/test. Yêu cầu mới nhất đã bỏ helper full-payee F4 và chuyển Flyway sang test scope; không khôi phục chúng theo report/prompt cũ. Supabase thật chờ user điền credentials trong `.env`.

Cập nhật: **2026-10-15**. **P01–P10 APPROVED**, R1/R2 P10 CLOSED theo [review P10-FIX-01](reviews/P10_FIX_01_REVIEW.md), reviewer 150/150/packaging/workflow/standard JAR/HTTP probe PASS. P11 Postman collection/fixtures/guide đã tạo, hai Newman run 112/112 requests và 564/564 assertions PASS, trạng thái [READY_FOR_REVIEW](reports/P11_POSTMAN_REPORT.md). Chưa được reviewer duyệt; production/full F2–F4/Git publication ngoài kết quả này.

## Đọc theo thứ tự

| Tài liệu | Mục đích |
|---|---|
| [01 — Phạm vi](01_FUNCTION_1_SCOPE.md) | Khóa đúng 5 bảng và trách nhiệm của bạn; xác định việc giao cho các thành viên khác |
| [02 — Kiến trúc](02_FUNCTION_1_ARCHITECTURE.md) | Cấu trúc Spring Boot, service/interface, bảo mật, luồng xử lý và phối hợp |
| [03 — API và quyền](03_FUNCTION_1_API.md) | Endpoint, DTO, quyền truy cập, phân trang và mã lỗi đề xuất |
| [04 — Rà soát database](04_DATABASE_REVIEW.md) | Schema thực tế trong file, vấn đề cần sửa và migration cần cân nhắc |
| [05 — Quy ước backend](05_BACKEND_CONVENTIONS.md) | Đối chiếu lời mentor với tài liệu gốc và chọn cách áp dụng |
| [06 — Kế hoạch thực hiện](06_IMPLEMENTATION_PLAN.md) | Thứ tự làm, đầu ra, tiêu chí nghiệm thu, ca kiểm tra cần thiết |
| [07 — Quyết định và câu hỏi mở](07_DECISIONS_AND_OPEN_QUESTIONS.md) | Phân biệt yêu cầu đã xác nhận, lựa chọn kỹ thuật và nghiệp vụ chưa chốt |
| [08 — Lộ trình 10 prompt](08_PROMPT_ROADMAP.md) | Giao từng prompt cho Agent code, review kết quả rồi chuyển bước |
| [Prompt 01 đầy đủ](prompts/P01_FOUNDATION.md) | Khởi tạo nền tảng HTTP, build/test và báo cáo review |
| [Review P01](reviews/P01_REVIEW.md) | Lịch sử hai finding R1/R2 đã tái hiện |
| [Prompt sửa P01-FIX-01](prompts/P01_FIX_01.md) | Bảo vệ local config khi đóng gói và thông báo lỗi form binding |
| [Review P01-FIX-01](reviews/P01_FIX_01_REVIEW.md) | APPROVED, R1/R2 đã kiểm chứng đóng |
| [Prompt P02 đầy đủ](prompts/P02_DATABASE_FOUNDATION.md) | Persistence của 5 bảng đúng schema leader, kiểm tra PostgreSQL cô lập |
| [Function 1 persistence](09_FUNCTION_1_PERSISTENCE.md) | Field mapping, migration baseline cô lập, audit, repository và các giới hạn |
| [Local development](LOCAL_DEVELOPMENT.md) | Java/Maven, PostgreSQL integration tests, runtime config và health check |
| [Báo cáo P02](reports/P02_REPORT.md) | Bằng chứng thực tế, file, lệnh, test và Git state của lượt triển khai |
| [Review P02](reviews/P02_REVIEW.md) | APPROVED sau chạy lại 20/20 tests, packaging và đối chiếu schema |
| [Prompt P03 đầy đủ](prompts/P03_AUTH_SECURITY.md) | 9 bước register/login/JWT, quyền theo DB, CORS và bootstrap admin |
| [P03 auth/security baseline](10_AUTH_SECURITY.md) | Hợp đồng API, config JWT, authority, lỗi Security, CORS và bootstrap |
| [Báo cáo P03](reports/P03_REPORT.md) | Kết quả kiểm tra thực tế, Git state và giới hạn sau triển khai |
| [Review P03](reviews/P03_REVIEW.md) | CHANGES_REQUESTED dù 35 test đạt; ba lỗi tái hiện bằng log/probe |
| [Prompt P03-FIX-01](prompts/P03_FIX_01.md) | Sửa raw JDBC logging, issuer/trace và malformed stored hash |
| [Báo cáo P03-FIX-01](reports/P03_FIX_01_REPORT.md) | Báo cáo Agent giữ làm lịch sử, trước reviewer kiểm chứng lại |
| [Review P03-FIX-01](reviews/P03_FIX_01_REVIEW.md) | APPROVED sau 38/38 test và packaging; R1/R2/R3 CLOSED |
| [Prompt P04 đầy đủ](prompts/P04_CUSTOMER_PROFILE_ADMIN.md) | Đặc tả triển khai 8 bước đã thực hiện; policy và concurrency |
| [Review P04](reviews/P04_REVIEW.md) | Lịch sử CHANGES_REQUESTED: presence flags bind được và timeout lock thật500 |
| [Prompt P04-FIX-01](prompts/P04_FIX_01.md) | Sửa R1/R2 với regression JSON allowlist và blocked PostgreSQL advisory lock thật |
| [Báo cáo P04-FIX-01](reports/P04_FIX_01_REPORT.md) | Bằng chứng Agent trước review, giữ làm lịch sử |
| [Review P04-FIX-01](reviews/P04_FIX_01_REVIEW.md) | APPROVED sau 57/57/packaging/probe HTTP thật, R1/R2 CLOSED |
| [Prompt P05 đầy đủ](prompts/P05_PRIVATE_DOCUMENTS.md) | Đặc tả 9 bước upload giấy tờ, local private, quyền đọc/cleanup và kiểm tra |
| [P05 private document storage](12_PRIVATE_DOCUMENT_STORAGE.md) | API multipart, binary download, local root, limits và recovery behavior đã triển khai |
| [Báo cáo P05](reports/P05_REPORT.md) | Evidence full verify, P05 HTTP/PostgreSQL/filesystem tests và packaging probe |
| [Review P05](reviews/P05_REVIEW.md) | Lịch sử CHANGES_REQUESTED ban đầu: ba lỗi tái hiện và hai race tests chưa có |
| [Prompt P05-FIX-01](prompts/P05_FIX_01.md) | Đặc tả sửa R1–R4, kiểm tra và report |
| [Báo cáo P05-FIX-01](reports/P05_FIX_01_REPORT.md) | Báo cáo Agent trước review; 83/83 tests và packaging probe PASS, giữ nguyên lịch sử |
| [Review P05-FIX-01](reviews/P05_FIX_01_REVIEW.md) | CHANGES_REQUESTED: R1/R2/R4 CLOSED, R3 tái hiện trên actual Boot JAR |
| [Prompt P05-FIX-02](prompts/P05_FIX_02.md) | 5 bước đã triển khai; actual Boot `java -jar` root regression, external-root health/trace, 87/87 full verify và packaging PASS |
| [Báo cáo P05-FIX-02](reports/P05_FIX_02_REPORT.md) | Báo cáo Agent trước review, giữ lịch sử về root/verification/legacy probe |
| [Review P05-FIX-02](reviews/P05_FIX_02_REVIEW.md) | APPROVED,R3 CLOSED sau 87/87/packaging và same-helper Boot comparison |
| [Prompt P06 — Duyệt giấy tờ/KYC](prompts/P06_DOCUMENT_REVIEW_KYC.md) | Đặc tả 9 bước theo U-11/U-12/U-13 |
| [P06 review và KYC](13_DOCUMENT_REVIEW_KYC.md) | API, policy, lock order, snapshot/current summary, FE contract và giới hạn |
| [Báo cáo P06](reports/P06_REPORT.md) | Kết quả kiểm tra thật, test counts, PostgreSQL/HTTP/concurrency evidence và Git state |
| [Review P06](reviews/P06_REVIEW.md) | CHANGES_REQUESTED ban đầu sau 105/105/packaging; history giữ nguyên |
| [Prompt P06-FIX-01](prompts/P06_FIX_01.md) | 5 bước sửa R1/R2, giữ policy/lock/KYC/storage/schema |
| [Báo cáo P06-FIX-01](reports/P06_FIX_01_REPORT.md) | Báo cáo Agent trước review, giữ lịch sử106 tests/logs/contention |
| [Review P06-FIX-01](reviews/P06_FIX_01_REVIEW.md) | APPROVED,R1/R2 CLOSED sau reviewer 106/106/packaging/health/probe |
| [Prompt P07](prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md) |9 bước driver profile/current eligibility theo U-14/U-15 |
| [P07 contract](14_DRIVER_PROFILE_ELIGIBILITY.md) |API, stored status/current eligibility, lock order và hợp đồng F2 |
| [Báo cáo P07](reports/P07_REPORT.md) | Báo cáo Agent trước review, giữ lịch sử READY_FOR_REVIEW/verify/PostgreSQL/packaging/health |
| [Review P07](reviews/P07_REVIEW.md) | CHANGES_REQUESTED; R1 predicate hạng GPLX blank, tái hiện HTTP/DB sau 124/124 |
| [Prompt P07-FIX-01](prompts/P07_FIX_01.md) | 5 bước sửa R1 và bổ sung whitespace/activation/current eligibility regression |
| [Báo cáo P07-FIX-01](reports/P07_FIX_01_REPORT.md) | Báo cáo Agent trước review; giữ lịch sử 126/126/packaging/health/READY_FOR_REVIEW |
| [Review P07-FIX-01](reviews/P07_FIX_01_REVIEW.md) | APPROVED, R1 CLOSED sau reviewer 126/126/packaging/health và probe trước/sau |
| [Prompt P08 ngân hàng](prompts/P08_BANK_ACCOUNTS.md) | Prompt 9 bước đã triển khai; U-16/U-17/U-18 và F4 FK boundary giữ nguyên |
| [P08 bank contract](15_BANK_ACCOUNTS.md) | Endpoint, request/response masking, lock/error semantics và giới hạn tích hợp F4 |
| [P08 report](reports/P08_REPORT.md) | Full verify, packaging, health, PostgreSQL/HTTP/concurrency evidence và Git status |
| [Review P08](reviews/P08_REVIEW.md) | APPROVED sau reviewer 137/137/packaging/Boot/health và probe riêng; không finding chặn |
| [P09 voucher admin](16_ADMIN_VOUCHERS.md) | API/definition/quota/status và F3 boundary; APPROVED sau review FIX-01, R1 CLOSED |
| [Report P09](reports/P09_REPORT.md) | Báo cáo Agent trước review, giữ lịch sử 143/143/READY_FOR_REVIEW |
| [Review P09](reviews/P09_REVIEW.md) | R1 numeric ingress qua DoubleNode mất precision/underflow, tái hiện actual HTTP/PostgreSQL |
| [Prompt P09-FIX-01](prompts/P09_FIX_01.md) | 5 bước sửa exact decimal binding và regression không duplicate che lỗi |
| [Report P09-FIX-01](reports/P09_FIX_01_REPORT.md) | Mapper/DTO/HTTP numeric matrix, PostgreSQL outcomes, full verification, packaging/health/Git evidence |
| [Review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md) | APPROVED, R1 CLOSED sau reviewer 144/144/packaging/Boot/health và same-helper probe |
| [Prompt P10 kiểm tra/bàn giao](prompts/P10_FUNCTION_1_HANDOFF.md) | Đặc tả 9 bước gốc; đã triển khai, trạng thái review hiện tại CHANGES_REQUESTED |
| [P10 API handoff](17_FUNCTION_1_HANDOFF.md) | Canonical inventory 32 operations, quyền/DTO/state distinction và hợp đồng FE/F2/F3/F4 |
| [P10 acceptance matrix](18_FUNCTION_1_ACCEPTANCE.md) | AC-01–AC-09, bằng chứng kiểm tra và giới hạn |
| [P10 local runbook](19_FUNCTION_1_RUNBOOK.md) | Lệnh chạy/test và xử lý lỗi local |
| [P10 report](reports/P10_REPORT.md) | Báo cáo Agent trước review, giữ lịch sử READY_FOR_REVIEW; kết quả review ở file riêng |
| [Review P10](reviews/P10_REVIEW.md) | CHANGES_REQUESTED, R1/R2 OPEN; reviewer 147/147/packaging/Boot/workflow và independent HTTP probe |
| [Prompt P10-FIX-01](prompts/P10_FIX_01.md) | 5 bước đồng bộ spec/handoff/tests theo runtime đã duyệt; PROMPT_READY |
| [Report P10-FIX-01](reports/P10_FIX_01_REPORT.md) | Sửa R1/R2, regression contract/HTTP/PostgreSQL, full verification/packaging và Git inventory; READY_FOR_REVIEW |
| [Review P10-FIX-01](reviews/P10_FIX_01_REVIEW.md) | APPROVED, R1/R2 CLOSED; reviewer 150/150/packaging/workflow/standard JAR và same-helper HTTP probe |
| [Prompt P11 Postman](prompts/P11_POSTMAN_FUNCTION_1.md) | Yêu cầu mới của user: 7 bước tạo collection JSON đủ 32 operations, data/fixtures/assertions và runner verification; PROMPT_READY |
| [P11 collection](postman/SBA301_Function1.postman_collection.json) | Importable Collection v2.1, 32 operations, 112 request/scenario; hai Newman run PASS |
| [P11 hướng dẫn](postman/README.md) | Import, local config/bootstrap ADMIN, fixture working directory, thứ tự chạy, coverage và giới hạn |
| [P11 report](reports/P11_POSTMAN_REPORT.md) | Schema/parity, actual Newman/full verify/packaging/health, hashes và Git inventory; READY_FOR_REVIEW |
| [P04 profile/admin operations](11_CUSTOMER_PROFILE_ADMIN.md) | Endpoint, DTO, filter/sort, locks, policy, CORS, logging và semantics token |
| [Báo cáo P04](reports/P04_REPORT.md) | Full verify, PostgreSQL concurrency, packaging, Git state và hạn chế |
| [Trạng thái triển khai](IMPLEMENTATION_STATUS.md) | Bằng chứng triển khai và review từng prompt |
| [Tài liệu đầu vào](reference/README.md) | Bản sao nguyên trạng 3 tài liệu người dùng gửi và nguồn kỹ thuật chính thức |
| [AGENTS.md](../AGENTS.md) | Hướng dẫn ngắn cho AI khi tiếp tục làm việc trong repository |

## Cách hiểu mức độ xác nhận

- **Đã xác nhận:** người dùng chỉ làm Function 1; 5 bảng được phân công; đăng ký, JWT, Security, CORS, gửi/duyệt giấy tờ, tài xế, ngân hàng, quản trị voucher; `CUSTOMER`, `ADMIN`.
- **Theo nguồn:** điều SQL hoặc ERD đang thể hiện, ví dụ khóa ngoại, enum, kiểu dữ liệu. Đây chưa phải kết quả kiểm tra một database đang chạy.
- **Đề xuất kỹ thuật:** phương án dùng để triển khai nhất quán, có lý do và có thể đổi theo yêu cầu mới.
- **Cần chốt (`Q-*`):** luật nghiệp vụ hoặc mở rộng chưa có căn cứ, không tự đưa vào code như yêu cầu chính thức.

Các API ngoài implementation vẫn là thiết kế đề xuất. P01–P10 APPROVED; P11 là bộ Postman bổ sung ở READY_FOR_REVIEW, chưa được duyệt. Q-* quản lý tại tài liệu 07; full F2/F3/F4 và production readiness không được suy ra từ regression F1 cô lập.

## Kết luận phân tích quan trọng

1. Schema có **19 bảng**, khớp cách chia 4 function; phần của bạn gồm đúng **5 bảng**.
2. `customers` đang có một role trong hai giá trị `CUSTOMER`, `ADMIN`. Role động là lời mentor tham khảo, cần mở rộng schema nếu nhóm quyết định áp dụng.
3. Bốn bảng Function 1 có đủ hai cột audit; `bank_accounts` thiếu `updated_at`. P02 map đúng hiện trạng leader giao; đề xuất thêm cột chưa được thực hiện, base phải phù hợp từng bảng.
4. Xác minh email khác xác minh giấy tờ. Có `email_verified` không đồng nghĩa đã có luồng OTP/email trong phạm vi.
5. `drivers` là hồ sơ bổ sung của customer. Đã có quy định phải kiểm tra GPLX được duyệt và còn hạn để kích hoạt; cấp quyền tài xế không chỉ dựa vào nhãn KYC.
6. Quản trị voucher thuộc Function 1; tính giảm giá, giữ/nhả lượt dùng và gắn voucher vào đơn thuộc Function 3. Cần thống nhất cách bảo vệ `used_count` khi tích hợp.

## Kết quả hiện tại

- Đã đọc schema SQL, XML ERD và toàn bộ quy ước gốc.
- Đã lưu bản sao nguồn và viết hướng làm chi tiết cho Function 1.
- P01 đã tạo project Spring Boot 4.0.8/Java 21, Maven Wrapper, nền tảng HTTP dùng chung, trace, Clock và `GET /api/health`; `clean verify` và kiểm tra health qua loopback đã đạt. Xem [trạng thái](IMPLEMENTATION_STATUS.md) và [báo cáo P01](reports/P01_REPORT.md).
- P01-FIX-01 đã được reviewer kiểm tra lại: 13/13 test, packaging probe và external local config/health đạt; P01 **APPROVED** theo [review bản sửa](reviews/P01_FIX_01_REVIEW.md). [Review gốc](reviews/P01_REVIEW.md) và [báo cáo sửa](reports/P01_FIX_01_REPORT.md) giữ làm lịch sử.
- P02 đã APPROVED theo [review P02](reviews/P02_REVIEW.md): reviewer chạy lại 13 HTTP + 7 PostgreSQL IT và packaging probe đều đạt, đối chiếu 5 DDL khớp leader. Baseline chỉ dùng trên PostgreSQL Testcontainers cô lập; không chạy trên Supabase/database chung.
- P03 APPROVED theo [review bản sửa](reviews/P03_FIX_01_REVIEW.md): reviewer chạy lại 38/38 test và packaging PASS, đóng R1/R2/R3. Review gốc và báo cáo Agent giữ lịch sử. Issuer/key/TTL production và origin FE vẫn cần cấu hình do nhóm cung cấp.
- P04 APPROVED sau [review bản sửa](reviews/P04_FIX_01_REVIEW.md); reviewer chạy 57 test/packaging/probes, R1/R2 CLOSED. User policy tự khóa/last-admin và schema leader giữ nguyên.
- P01–P10 APPROVED theo [review cuối](reviews/P10_FIX_01_REVIEW.md), R1/R2 CLOSED; implementation Function 1 theo scope đã nghiệm thu sau reviewer 150/150/packaging/workflow/JAR/HTTP probe. P11 Postman có collection/fixtures/guide/report và đang READY_FOR_REVIEW; chưa reviewer-APPROVED. Reports/reviews cũ giữ lịch sử; không tự publish/deploy/đổi policy production.
- Nghiệp vụ xác nhận đơn/thanh toán được để cho Function 3–4 quyết định; câu hỏi trước đó về vòng đời đơn không còn là việc cần bạn trả lời để làm Function 1.
