# 08 — Lộ trình giao việc cho Agent code

Ngày lập 2026-10-13; trạng thái cập nhật 2026-10-15. Người dùng giao từng prompt → Agent báo cáo → review → prompt tiếp theo. **P01–P10 APPROVED**, R1/R2 P10 CLOSED theo [review cuối](reviews/P10_FIX_01_REVIEW.md). Implementation Function 1 theo scope đã nghiệm thu; P11 Postman bổ sung hiện READY_FOR_REVIEW sau 32/32 route parity và hai Newman runs, chưa được reviewer duyệt.

## 1. Số prompt và cách thực hiện

Đề xuất **10 prompt chính, tương ứng 10 bước triển khai** cho riêng Function 1. Đây là kế hoạch ban đầu; có thể phát sinh prompt sửa lỗi sau review. Không coi số 10 là cam kết bỏ qua lỗi để chạy cho hết danh sách.

Mỗi lượt có bốn hoạt động: giao prompt → Agent triển khai và báo cáo → review code/kết quả kiểm tra → sửa lỗi cần thiết hoặc chuyển prompt tiếp theo. Agent không tự chạy cả chuỗi vì thấy roadmap.

| Prompt | Nội dung | Đầu ra để review | Đối chiếu kế hoạch M0–M8 |
|---|---|---|---|
| **P01** | Scaffold, cấu hình tối thiểu, response/error/trace chung, health endpoint | App web build và chạy được không cần DB; kiểm tra nền tảng; báo cáo P01 | M0 và phần khung chung M1 |
| **P02** | Database, migration, audit, 5 entity, enum và repository F1 | Mapping khớp schema; kế hoạch migration an toàn; PostgreSQL checks phù hợp môi trường | Phần database còn lại của M1 |
| **P03** | Register/login JWT, Security, CurrentAccount, CORS, bootstrap admin được kiểm soát | Đăng nhập và phân quyền thật; token sai/khóa account bị chặn | M2 |
| **P04** | Hồ sơ cá nhân, danh sách admin, khóa/mở account | Allowlist update, ownership, phân trang, bảo vệ admin theo policy đã chốt | M3 |
| **P05** | Gửi giấy tờ, storage private, danh sách/detail/file access | Upload và quyền đọc đúng, cleanup khi lỗi; chưa tự quyết định KYC | Nửa đầu M4 |
| **P06** | Duyệt giấy tờ và tổng hợp KYC | Transition, metadata duyệt, transaction và kiểm tra đồng thời | Nửa sau M4 |
| **P07** | Hồ sơ tài xế và eligibility | GPLX/account được kiểm tra tại thời điểm dùng; hợp đồng với F2 | M5 |
| **P08** | Tài khoản ngân hàng | Ownership, che dữ liệu, đổi default đồng thời, quy tắc xóa/sửa | M6 |
| **P09** | Quản trị voucher | Validate, list/filter/page, quota/status update; hợp đồng với F3 | M7 |
| **P10** | Kiểm tra xuyên suốt, sửa vấn đề tích hợp, OpenAPI và bàn giao | Bộ F1 có bằng chứng kiểm tra và tài liệu FE/F2/F3/F4 rõ ràng | M8 |
| **P11 bổ sung** | User yêu cầu mới ngày 2026-10-15: Postman collection JSON, synthetic data và ảnh fixtures | Đủ 32 operations, assertions, guide và actual runner verification; không thêm backend API | Bàn giao sau M8 |

Mỗi prompt sau dựa trên code thực tế. P01–P10 APPROVED; P11 là bộ kiểm thử bàn giao mới do user yêu cầu sau 10 prompt implementation. Deployment/Git publication vẫn cần yêu cầu riêng của user.

## 2. Ranh giới giữa P01, P02 và P03

P01 chỉ thêm dependency cho Web MVC, validation, logging/DTO và test. P02 bổ sung JPA/PostgreSQL/Flyway cùng persistence Function 1; từ P02, ứng dụng runtime cần PostgreSQL có schema tương thích. Security/JWT/CORS vẫn thuộc P03.

P01 chỉ expose health kỹ thuật và không có API tài khoản/nghiệp vụ. Không tạo tài khoản giả, authentication giả hay cấu hình mở tất cả endpoint để mô phỏng phần việc chưa làm. Nền tảng hoàn chỉnh vẫn phải đạt Security/JWT ở P03.

Các package/controller/repository được bổ sung theo đúng prompt đang thực hiện, không tạo mọi class rỗng từ đầu. Phạm vi P02 giữ đúng 5 bảng. P01-FIX-01 đã làm trên `codex/function-1-p01-fix-01`; trước P02, HEAD đã được so sánh với BE và trùng khớp nên có thể chuyển về BE mà không stash/reset/clean.

## 3. Khi nào cần thông tin bổ sung

- P01: có thể thực hiện mà chưa biết Supabase credential, JWT secret hay luật KYC. Kiểm tra công cụ ở máy Agent và báo đúng hạn chế.
- P02: map đúng schema leader theo xác nhận mới nhất; kiểm tra PostgreSQL cô lập không cần xác nhận DB chung đang trống hay đã có schema. Trước khi áp dụng lên DB chung, cần leader xác nhận schema/history và thứ tự migration; không tự chạy schema nguồn lên Supabase.
- P03: JWT keys/issuer/audience/TTL và origin FE thật lấy từ cấu hình; tests dùng RSA keys/DB tạm. Bootstrap disabled mặc định, không cần bịa credential hoặc thay schema. Giá trị production vẫn cần nhóm cung cấp.
- P04: người dùng đã chốt cấm ADMIN tự khóa và cấm khóa ADMIN ACTIVE cuối cùng. P06 có policy self-review riêng theo U-11, được xác nhận sau P04; không suy rộng U-09 sang nghiệp vụ review.
- P05: user chọn local private ngoài public/JAR, interface storage để thay provider sau. Upload/read được soạn không cần policy KYC hoàn chỉnh; file limits là baseline kỹ thuật có cấu hình.
- P06: U-11/U-12/U-13 chốt self-review/identity KYC/prerequisites. Implementation và evidence hiện tại ở [P06 contract](13_DOCUMENT_REVIEW_KYC.md) và [P06 report](reports/P06_REPORT.md); date/lock/terminal/current-query là baseline phân loại riêng. Renewal/revoke chưa giao.
- P08 đã tạo internal bank ownership lookup và giữ composite FK boundary cho F4; việc tích hợp payout transaction/lock protocol vẫn cần phối hợp khi F4 được giao. Không buộc người làm F1 chốt vòng đời đơn/thanh toán.

Chi tiết câu hỏi Q-* nằm trong [sổ quyết định](07_DECISIONS_AND_OPEN_QUESTIONS.md).

## 4. Quy tắc review giữa các prompt

- Agent ghi báo cáo ở `docs/reports/Pxx_REPORT.md`, gồm thay đổi, file, lệnh thực sự đã chạy, kết quả pass/fail/skip, hạn chế và điểm cần quyết định.
- File report chỉ được tạo sau khi làm prompt đó; không tạo báo cáo giả với kết quả dự kiến.
- Agent đặt trạng thái `READY_FOR_REVIEW` nếu đủ bằng chứng; không tự đặt `APPROVED` thay reviewer.
- Reviewer kiểm tra code/diff và bằng chứng phù hợp, không chỉ dựa vào câu “BUILD SUCCESS”.
- Lỗi làm build fail, sai dữ liệu, sai quyền hoặc sai phạm vi phải sửa trước phần phụ thuộc. Ghi rõ các hạn chế không chặn phần tiếp theo.
- Người dùng nhận prompt tiếp theo sau khi gửi kết quả review; không tự chuyển công việc sang chat/agent khác.
- Nếu Agent chạy ở máy/workspace khác, cần gửi thay đổi thực tế hoặc diff liên quan cùng báo cáo; không gửi credential hay file local chứa secret.

## 5. Tài liệu của lượt hiện tại

- [Prompt 01 — đầy đủ để gửi Agent](prompts/P01_FOUNDATION.md).
- [Review P01](reviews/P01_REVIEW.md) và [prompt sửa P01-FIX-01](prompts/P01_FIX_01.md): ghi lại hai finding; trạng thái thực tế của bản sửa nằm trong [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) và [báo cáo P01-FIX-01](reports/P01_FIX_01_REPORT.md).
- [Review bản sửa P01](reviews/P01_FIX_01_REVIEW.md): APPROVED sau kiểm chứng lại.
- [Prompt P02 — đầy đủ](prompts/P02_DATABASE_FOUNDATION.md): đã APPROVED theo [review P02](reviews/P02_REVIEW.md); [báo cáo Agent](reports/P02_REPORT.md) giữ làm lịch sử.
- [Prompt P03 — đầy đủ](prompts/P03_AUTH_SECURITY.md): đã triển khai, [báo cáo](reports/P03_REPORT.md) giữ làm lịch sử; [review P03](reviews/P03_REVIEW.md) CHANGES_REQUESTED.
- [P03-FIX-01](prompts/P03_FIX_01.md): ba finding R1/R2/R3 CLOSED theo [review bản sửa](reviews/P03_FIX_01_REVIEW.md), 38/38 test và packaging PASS; [báo cáo Agent](reports/P03_FIX_01_REPORT.md) giữ lịch sử.
- [Prompt P04 đầy đủ](prompts/P04_CUSTOMER_PROFILE_ADMIN.md): đã triển khai; [report](reports/P04_REPORT.md) giữ lịch sử. [Review P04](reviews/P04_REVIEW.md) CHANGES_REQUESTED, hai finding R1/R2 tái hiện qua HTTP thật.
- [P04-FIX-01](prompts/P04_FIX_01.md): R1/R2 CLOSED theo [review bản sửa](reviews/P04_FIX_01_REVIEW.md),57 test/packaging/HTTP probes; [báo cáo Agent](reports/P04_FIX_01_REPORT.md) giữ lịch sử.
- [P05 đầy đủ](prompts/P05_PRIVATE_DOCUMENTS.md): đã triển khai; [report Agent](reports/P05_REPORT.md) giữ lịch sử. [Review P05](reviews/P05_REVIEW.md) giữ bằng chứng CHANGES_REQUESTED ban đầu.
- [P05-FIX-01](prompts/P05_FIX_01.md): [báo cáo](reports/P05_FIX_01_REPORT.md) giữ lịch sử; [review bản sửa](reviews/P05_FIX_01_REVIEW.md) xác nhận 83/83/packaging, R1/R2/R4 CLOSED nhưng R3 Boot JAR OPEN.
- [P05-FIX-02](prompts/P05_FIX_02.md): [review bản sửa](reviews/P05_FIX_02_REVIEW.md) APPROVED sau 87/87/packaging/health và same-helper probes,R3 CLOSED; report giữ lịch sử.
- [P06 đầy đủ](prompts/P06_DOCUMENT_REVIEW_KYC.md): 9 bước đã triển khai,[report](reports/P06_REPORT.md) và [review](reviews/P06_REVIEW.md) giữ lịch sử.
- [P06-FIX-01](prompts/P06_FIX_01.md): [review bản sửa](reviews/P06_FIX_01_REVIEW.md) APPROVED/R1/R2 CLOSED sau 106/106/packaging/health/probe; báo cáo Agent giữ lịch sử.
- [P07 đầy đủ](prompts/P07_DRIVER_PROFILE_ELIGIBILITY.md): 9 bước đã triển khai theo U-14/U-15; [P07 report](reports/P07_REPORT.md) giữ lịch sử, trạng thái cuối APPROVED theo review FIX-01.
- [Review P07](reviews/P07_REVIEW.md) và [P07-FIX-01](prompts/P07_FIX_01.md) giữ lịch sử; [review FIX-01](reviews/P07_FIX_01_REVIEW.md) APPROVED/R1 CLOSED sau reviewer 126/126/packaging/health/same-helper probe.
- [P08 ngân hàng](prompts/P08_BANK_ACCOUNTS.md): APPROVED theo [review](reviews/P08_REVIEW.md), reviewer 137/137/packaging/Boot/health/probe; contract/report giữ lịch sử và giới hạn F4.
- [P09 voucher admin](prompts/P09_ADMIN_VOUCHERS.md) và [report](reports/P09_REPORT.md) giữ lịch sử; [review P09](reviews/P09_REVIEW.md) CHANGES_REQUESTED/R1 sau 143/143 và HTTP numeric probe.
- [P09-FIX-01](prompts/P09_FIX_01.md) và report giữ lịch sử; [review bản sửa](reviews/P09_FIX_01_REVIEW.md) APPROVED/R1 CLOSED sau reviewer 144/144/packaging/Boot/health/same-helper probe.
- [P10 kiểm tra và bàn giao](prompts/P10_FUNCTION_1_HANDOFF.md): APPROVED sau [review P10-FIX-01](reviews/P10_FIX_01_REVIEW.md), R1/R2 CLOSED; reviewer 150/150/packaging/workflow/JAR/HTTP probe PASS, implementation F1 theo scope đã nghiệm thu.
- [P11 Postman](prompts/P11_POSTMAN_FUNCTION_1.md): bộ [collection](postman/SBA301_Function1.postman_collection.json), [fixtures/guide](postman/README.md), và [report](reports/P11_POSTMAN_REPORT.md) hoàn thành; 32/32 operation parity, hai Newman runs 112 request/564 assertion PASS; READY_FOR_REVIEW, không đổi backend/schema.
- [Trạng thái triển khai](IMPLEMENTATION_STATUS.md).

## 6. Trạng thái thực thi cập nhật

- P01 và P02 đã được reviewer duyệt; bằng chứng nằm trong `docs/reviews/`.
- P03 APPROVED sau P03-FIX-01; reviewer kiểm chứng lại 38/38 test và packaging, đóng R1/R2/R3.
- P01–P10 APPROVED, implementation F1 theo scope đã nghiệm thu; P11 Postman READY_FOR_REVIEW, chưa reviewer-APPROVED. Reports/reviews/prompts cũ giữ nguyên lịch sử. Production/full F2–F4 và Git publication ngoài evidence hiện tại.

Tại thời điểm tạo roadmap, P01 mới được soạn. Sau đó P01 đã được triển khai; trạng thái và kết quả kiểm tra thực tế hiện nằm trong [sổ trạng thái](IMPLEMENTATION_STATUS.md) và [báo cáo P01](reports/P01_REPORT.md). Roadmap không tự giao P02 trở đi.
