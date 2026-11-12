# 07 — Quyết định, giả định và câu hỏi mở

Cập nhật 2026-10-15. Hướng mới nhất U-23: audit đúng5 bảng/59 cột, bỏ phần chuẩn bị F4 dư và dùng Supabase/.env; xem [checklist](20_FUNCTION_1_SCOPE_SCHEMA_AUDIT.md), [luồng](21_FUNCTION_1_FLOWS.md), [setup](SUPABASE_SETUP.md). P01–P10 là lịch sử đã duyệt; P11 Postman đã có report READY_FOR_REVIEW. Supabase thật chờ user cấu hình, không suy ra cloud connection từ tests local.

## 1. Đã xác nhận từ người dùng

| Mã | Nội dung | Hệ quả |
|---|---|---|
| U-01 | Làm ở `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh BE | Không dùng repository Documents trống trước đó |
| U-02 | Yêu cầu ban đầu là nhận tài liệu, phân tích và viết .md để AI bám hướng | Sau đó user chọn workflow prompt → Agent code → review; trạng thái triển khai thật xem IMPLEMENTATION_STATUS |
| U-03 | Các nhận xét mentor chỉ để tham khảo, áp dụng theo kinh nghiệm | Có thể giải thích/điều chỉnh câu mơ hồ hoặc không phù hợp |
| U-04 | Toàn nhóm chia 4 function với danh sách bảng cụ thể | Giữ bảng phân công và ranh giới tích hợp |
| U-05 | Người dùng chỉ làm Function 1, phần sau do thành viên khác | Chỉ lập kế hoạch thực hiện chi tiết cho 5 bảng F1 và nền tảng |
| U-06 | Function 1 có JWT/Security, CUSTOMER/ADMIN, CORS, giấy tờ, driver, ngân hàng, admin voucher | Không tự mở rộng role STAFF/OWNER hoặc nghiệp vụ đơn/thanh toán |
| U-07 | Người dùng gửi từng prompt cho Agent code, mang kết quả về review rồi nhận prompt tiếp theo | Soạn P01 chi tiết trước; không tự triển khai code ở lượt soạn prompt, không tự gửi cho agent khác |
| U-08 | Người dùng xác nhận database/entity theo leader giao, Function 1 bám file database đó | P02 map đúng schema nguồn; không coi đề xuất bank.updated_at hoặc đổi schema là đã được giao |
| U-09 | Ngày 2026-10-13, người dùng chọn cấm ADMIN tự khóa và cấm khóa ADMIN ACTIVE cuối cùng | P04 bảo vệ policy trong transaction/concurrency thật; chưa quyết định admin tự duyệt KYC |
| U-10 | Ngày 2026-10-13, người dùng chọn local private ngoài public/JAR cho P05, có storage interface | Implement local adapter và tải file qua quyền owner/admin, chưa cần bucket/cloud credential; không tự triển khai Supabase |
| U-11 | Ngày 2026-10-14,user chọn cấm ADMIN tự duyệt hoặc từ chối giấy tờ của chính mình | P06 phải so actor/owner trong transaction; đây là quyết định mới, không suy ra từ U-09 |
| U-12 | Ngày 2026-10-14,user chọn KYC VERIFIED khi có CCCD hoặc hộ chiếu APPROVED còn hiệu lực; GPLX kiểm tra riêng lúc kích hoạt tài xế | Identity policy chỉ CITIZEN_ID/PASSPORT; runtime eligibility phải xét hiệu lực và account, không chỉ snapshot column |
| U-13 | Ngày 2026-10-14,user chọn đủ họ tên,ngày sinh,ngày/nơi cấp; CCCD/GPLX 2 mặt,hộ chiếu 1 mặt; GPLX bắt buộc hạn,CCCD/hộ chiếu cho phép hạn trống | P06 kiểm tra prerequisites trước approve; submission P05 vẫn cho fields optional, hồ sơ thiếu có thể reject/gửi lại |
| U-14 | Ngày 2026-10-14,user chọn kích hoạt driver cần account ACTIVE,current identity KYC VERIFIED và GPLX APPROVED còn hạn | P07 kiểm tra current Clock/evidence,không dùng snapshot KYC hoặc stored driver ACTIVE đơn lẻ |
| U-15 | Ngày 2026-10-14,user cấm ADMIN tự kích hoạt/đình chỉ hồ sơ tài xế của mình,cần ADMIN khác | P07 command recheck actor/owner,U-15 riêng không suy từ U-11 hay role DRIVER |
| U-16 | Ngày 2026-10-14, user chọn chỉ đặt bank default khi makeDefault=true; omitted=false, kể cả tài khoản đầu tiên | Không tự promote first account; PATCH default là command riêng |
| U-17 | Ngày 2026-10-14, user cho xóa bank default chưa bị payout tham chiếu và để zero default | Không tự chọn peer; FK referenced delete vẫn bị chặn |
| U-18 | Ngày 2026-10-14, user chọn bankName/accountNumber/accountHolder bất biến sau create | Thay đổi bằng thêm row mới; không sửa ý nghĩa payee của payout đã tham chiếu |
| U-19 | Ngày 2026-10-14, user chọn voucher chỉ sửa description/usageLimit sau create | Code, mức giảm, điều kiện và thời hạn bất biến; ADMIN không sửa usedCount |
| U-20 | Ngày 2026-10-14, user chọn INACTIVE để ngừng voucher, giữ row/reference | Không hard-delete endpoint hoặc null refs đơn thuê |
| U-21 | Ngày 2026-10-14, user chọn code strip hai đầu/giữ case/exact match theo schema | Thay thế proposal uppercase; FE/F3/writers phải giữ cùng semantics |
| U-22 | Ngày 2026-10-15, user yêu cầu sau nghiệm thu F1 có file JSON để test Postman, đầy đủ API và dữ liệu test | P11 bổ sung collection đủ 32 HTTP operations, synthetic data/ảnh fixtures/assertions/guide; không mở rộng backend hoặc thêm endpoint ADMIN |
| U-23 | Ngày2026-10-15 user yêu cầu audit checklist theo schema leader, bỏ dư/outscope/quá phức tạp, vẽ từng flow và dùng Supabase với .env | Không thêm bảng/field/roles; bỏ unused F4 lookup; runtime Supabase/JDBC/.env, không local-Docker runtime; tests Docker vẫn tùy chọn/cô lập; user review luồng và điền credentials |

## 2. Thông tin theo nguồn và phạm vi runtime đã kiểm tra

| Mã | Nguồn | Thông tin |
|---|---|---|
| S-01 | BACKEND_CONVENTIONS.md gốc | Java 21, Boot 4.0.8, Maven, PostgreSQL/Supabase, Lombok |
| S-02 | schema.sql | 19 bảng, 5 bảng F1; customers là tên table account |
| S-03 | schema.sql | 2 role cố định, driver là profile 0..1; LICENSE nằm ở user_documents |
| S-04 | schema.sql | TIMESTAMP giờ VN, BigDecimal/VND scale 0; audit default + trigger DB |
| S-05 | schema.sql | bank_accounts chưa có updated_at; F1 chưa có cột version |
| S-06 | schema.sql | Email unique lower; số giấy tờ APPROVED unique; một bank default; voucher có quota nhưng không có auto counter |

Các thông tin S-* mô tả file người dùng gửi. P02 đã kiểm chứng mapping/ràng buộc F1 trên PostgreSQL Testcontainers, xem [review P02](reviews/P02_REVIEW.md); vẫn không xác nhận database Supabase đang chứa dữ liệu/cấu trúc nào.

## 3. Lựa chọn kỹ thuật đề xuất làm baseline

| Mã | Lựa chọn | Lý do/giới hạn |
|---|---|---|
| D-01 | Một Spring Boot app, layer theo quy ước gốc, service/interface | Phù hợp phạm vi nhóm; không phát sinh 4 hệ thống triển khai |
| D-02 | Controller theo tài nguyên; DTO riêng request/response | Giảm trùng code và mass assignment |
| D-03 | Transition switch ở service; enum có mô tả | Chọn một nguồn luật, giải quyết mâu thuẫn enum-if trong quy ước gốc với lời mentor |
| D-04 | Try/catch tại use case, rethrow/cause; finally chỉ cleanup | Có context lỗi, rollback đúng, không thêm ceremony vô ích |
| D-05 | CUSTOMER/ADMIN theo schema hiện tại | Đúng phạm vi mới nhất; role động là mở rộng |
| D-06 | Bearer header, Spring JWT support, lấy role/account status hiện tại từ DB | Khóa account có hiệu lực trên token còn hạn; chi phí một lần đọc account/request được chấp nhận cho baseline |
| D-07 | DB làm nguồn audit; Clock VN cho policy | Tận dụng SQL nguồn, tránh hai nguồn audit khác timezone |
| D-08 | Lock customer cho thao tác aggregate F1; lock voucher khi sửa quota | Bảo vệ race khi 5 bảng F1 chưa có version; không tự tạo cột @Version |
| D-09 | Bank nhận tiền bất biến; thêm bản mới khi thay đổi | Đã được user xác nhận U-18; U-16/U-17 chốt default/delete; FK F4 bảo vệ referenced row |
| D-10 | Voucher chỉ sửa description/quota, bật/tắt; trường kinh tế giữ nguyên | Đã chốt U-19/U-20; U-21 code giữ case. F3 meaning counter/reserve-release/per-user vẫn Q-06 |
| D-11 | JSON cho account/auth, multipart cho file | Diễn giải “truyền theo form” phù hợp API; cần thống nhất với FE |
| D-12 | Nguồn lưu nguyên trạng dưới docs/reference | Truy vết đầu vào, không nhầm bản đề xuất với tài liệu gốc |
| D-13 | P02 dùng base id/createdAt và lớp audit thêm updatedAt cho 4 bảng phù hợp | BankAccount giữ đúng schema leader; đề xuất thêm updated_at chờ phối hợp leader |
| D-14 | Trích baseline F1 để kiểm tra PostgreSQL cô lập, chưa áp dụng DB chung | Kiểm chứng mapping không đòi hỏi suy đoán schema/history của Supabase; đây không phải kiến trúc chia database theo function |
| D-15 | P03 triển khai RS256 với RSA keypair ngoài JAR; issuer/audience/TTL/skew có cấu hình | Không sinh lại key ngầm, không discovery tới auth server chưa tồn tại; tests dùng key tạm, giá trị production chưa được cung cấp |
| D-16 | P03 triển khai PasswordEncoder BCrypt có salt/policy cấu hình; không trim password | Register/login kiểm tra byte limit; không có plaintext/NoOp fallback hoặc tự đổi hash DB leader |
| D-17 | P03 bootstrap admin disabled mặc định, idempotent khi admin đã tồn tại | Chỉ từ cấu hình explicit; không tự promote CUSTOMER, unlock hoặc reset password; implementation APPROVED |
| D-18 | P03 implementation dùng RS256 external keypair, BCrypt, exact CORS allowlist, DB-backed CurrentAccount và bootstrap disabled mặc định | Giá trị local/test được ghi trong docs/10 và P03 report; production issuer/audience/keys/origins/TTL/credential chưa được cung cấp; đây không phải chốt policy sản phẩm |
| D-19 | P04 implementation dùng transaction-level PostgreSQL advisory lock chung cho status, row lock actor/target/profile và đọc lại actor sau serialization | Bảo vệ U-09 mà không đổi schema; race/status/profile đã kiểm tra trên PostgreSQL cô lập |
| D-20 | P04 reason free-text được validate nhưng log chỉ metadata; page/reason limits có cấu hình | Không làm lộ PII hoặc giả lịch sử audit chưa có; defaults là baseline kỹ thuật, không luật sản phẩm; P04 APPROVED sau sửa R1/R2 |
| D-21 | P05 implementation dùng local private adapter và authenticated binary download qua API | Theo U-10; scalar multipart allowlist; cột URL lưu opaque locator versioned; không signed/public URL hoặc path trong response |
| D-22 | P05 baseline JPEG/PNG,caps/re-encode,root private và cleanup theo DB outcome | P05 APPROVED sau reviewer 87/87/packaging/health và same-helper Boot comparison; R1–R4 CLOSED. Giữ structural/warning checks,completion synchronization/native physical root và race barriers; UNKNOWN giữ receipt,không sweeper/schema |
| D-23 | P06 review, lock, terminal, owner-locked, expiry, unique | APPROVED sau [review FIX-01](reviews/P06_FIX_01_REVIEW.md); giữ U-11/U-12/U-13 và baseline transition/expiry/sharedlock. R1 diagnostic/R2 actual contention CLOSED,không đổi API/schema |
| D-24 | KYC snapshot và current KYC query theo Clock | Đã triển khai; review ghi snapshot khi thay đổi trong cùng transaction; P05 submission không đổi snapshot; current endpoint/internal service dùng một aggregate statement. Snapshot không phải eligibility thời gian thực; GET không write; không backfill/job/schema. Xem P06 report |
| D-25 | P07 driver profile/status/current eligibility | APPROVED sau review FIX-01, R1 CLOSED; Java 21 strip parity trong một query. U-14/U-15 giữ; transitions/no-op/reason/shared lock là baseline; không durable reason/role/new schema |
| D-26 | Internal driver eligibility cho F2 | `DriverEligibilityService.evaluateForCustomer(customerId)` trả snapshot theo current Clock/account/identity/license/profile,không reservation/assignment authorization. F2 recheck tại action và bảo vệ scheduling riêng; F1 không write xe/slot/driver assignment |
| D-27 | P08 HTTP owner-only, masked number và internal payee DTO riêng | Baseline kỹ thuật trong prompt 9 bước; ADMIN không global read; no full-number reveal. U-16/U-17/U-18 là user-confirmed; normalization/mask/page/lock/error/FK fixture không phải luật ngân hàng |
| D-28 | P08 shared global→customer→bank locks, clear/flush default cùng transaction | Giữ partial unique/FK leader và status recheck; F4 lookup chỉ snapshot/ownership, không reservation. Test-only composite FK fixture không phải implementation full payout |
| D-29 | P09 numeric/time/null DTO và ADMIN routes | APPROVED/R1 CLOSED: application mapper bảo toàn exact tokens trước JsonNode/DTO; strict INT/no-duplicate numeric regressions đạt. Time/window/null/schema policies giữ, không price/usage module |
| D-30 | P09 global→actor→voucher locks, latest counter và window read | ADMIN recheck và quota với current usedCount, F3 writer dùng voucher row/atomic update protocol. Window start-inclusive/end-exclusive tách stored status/per-user eligibility; không expire job |
| D-31 | P10 static OpenAPI 3.1/parity và workflow/JAR/handoff | Đã triển khai theo prompt; không dependency/Swagger runtime/API mới. Standard executable JAR dùng config/key/root/DB test external. READY_FOR_REVIEW; chưa reviewer nghiệm thu |

Các giới hạn phân trang/reason và namespace lock là baseline kỹ thuật, không phải luật sản phẩm do người dùng duyệt. Policy cấm ADMIN tự khóa và khóa ADMIN ACTIVE cuối cùng là yêu cầu người dùng đã xác nhận. Q-09 về lịch sử status/reason bền vững vẫn mở.

## 4. Câu hỏi mở, sắp theo thời điểm cần giải quyết

| Mã | Điểm cần rõ | Đề xuất hiện tại | Khi cần / ai phối hợp |
|---|---|---|---|
| Q-01 | Production JWT/origin FE/bootstrap còn mở; self-review P06 đã chốt | U-11 cấm self-review, U-09 cấm tự khóa/last-admin. Không tự chọn config/secret production | Production runtime; F1 + nhóm |
| Q-02 | U-12/U-13/U-14 chốt identity/GPLX/current KYC; expiry baseline đã ghi | P06/P07 APPROVED, R1 strip consistency CLOSED; không thêm luật pháp/hạng/tuổi. Inclusive expiry là baseline, renewal/revoke ở Q-03 | Phần đã giao hoàn tất; renewal/revoke còn chờ Q-03 |
| Q-03 | Gia hạn/thay thế/thu hồi giấy tờ APPROVED, hiệu lực bản cũ và audit | Không giả nghĩa REJECTED để vượt index; luồng gửi lần đầu và gửi lại bản bị reject làm trước | Chỉ khi yêu cầu renewal/revoke; schema owner + F1 |
| Q-04 | Default/delete/immutable đã chốt U-16/U-17/U-18; đối soát tên chủ chưa giao | P08 APPROVED; FK/internal snapshot giữ, full F4 transaction phối hợp khi tích hợp; không match tên/call bank | Không cần hỏi lại ba policy đã xác nhận |
| Q-05 | Email verification, đổi email/phone, đổi/quên mật khẩu, refresh token/thu hồi token, avatar | Chưa thêm vào phạm vi đã giao. email_verified giữ false cho tới khi có verification thật | Chỉ khi được yêu cầu mở rộng F1 |
| Q-06 | Fields/status/code đã chốt U-19/U-20/U-21; used_count meaning/reserve-release/per-user còn F3 | P09 APPROVED/R1 CLOSED, latest quota protocol/exact ingress giữ; F3 chủ trì usage/price/order snapshot | P10 bàn giao ranh giới, không cần user F1 quyết vòng đời đơn |
| Q-07 | Provider local private đã triển khai; còn root/quyền OS và limits production | Storage disabled mặc định; deploy cần cấp root external, tồn tại/writable và ACL phù hợp account chạy app. Limits JPEG/PNG/5MiB là baseline cấu hình. Không cần bucket/TTL signed URL ở local; cloud/multi-node chỉ khi user mở rộng | Khi cấu hình local/deploy thật; không bắt user cung cấp secret để kiểm thử cô lập |
| Q-08 | Chuẩn hóa email/phone/docs/bank/code theo hợp đồng đã giao | Code U-21 strip/giữ case/exact, không uppercase; không tự regex/catalog/đối soát ngoài schema. Email normalization đã có | Giữ semantics từng tài nguyên; thay đổi cần requirement mới |
| Q-09 | Có cần lịch sử admin/account bền vững ngoài log kỹ thuật không | Không tái sử dụng action_logs của order; nếu cần phải thiết kế audit phù hợp | Khi rubric/nhóm yêu cầu; không tự thêm bảng audit |
| Q-10 | Có thật sự cần thêm role động theo góp ý mentor không | Giữ CUSTOMER/ADMIN hiện tại | Chỉ khi người dùng đổi phạm vi; cần migration và phối hợp cả nhóm |

Mã Q-* không phải một yêu cầu phê duyệt hàng loạt. AI tiếp tục phần độc lập và chỉ hỏi thông tin đang thực sự cần. Không chọn các giá trị bí mật, con số nghiệp vụ hay quy tắc mới bằng cách giả định người dùng đã đồng ý.

## 5. Các câu hỏi thuộc thành viên khác

Thời điểm CONFIRMED so với thanh toán, hạn chờ đơn, phí hủy, cọc, vòng đời slot, refund và payout thuộc F2/F3/F4. Câu hỏi đã hỏi trước khi người dùng thu hẹp phạm vi về CONFIRMED/PENDING **không có câu trả lời nghiệp vụ và không cần trả lời để hoàn tất tài liệu F1**. Không ngầm chọn phương án thanh toán đề xuất trước đó làm luật dự án.

## 6. Quy trình thay đổi sau này

1. Ghi yêu cầu mới, nguồn và phạm vi ảnh hưởng.
2. Đổi Q-* thành quyết định có ngày/người xác nhận khi có căn cứ; không xóa lịch sử để che giả định trước đó.
3. Cập nhật API/architecture/database review/implementation plan cùng thay đổi liên quan.
4. Nếu đổi field dùng chung, thống nhất hợp đồng với chủ function bị ảnh hưởng trước khi merge; không tự nhắn người khác hoặc push để thay cho việc thống nhất.
5. Khi code đã được thực hiện, cập nhật rõ trạng thái thực thi và kết quả kiểm tra, tách khỏi trạng thái chỉ lập kế hoạch hiện tại.

## 7. Nhật ký quyết định

- **2026-10-13:** clone repo và checkout BE trong thư mục Desktop theo yêu cầu.
- **2026-10-13:** tiếp nhận schema v3, quy ước gốc, ERD và lời mentor tham khảo.
- **2026-10-13:** người dùng cung cấp phân công 4 function, sau đó xác nhận chỉ làm Function 1. Bộ tài liệu được thu hẹp tương ứng.
- **2026-10-13:** hoàn tất bản kế hoạch F1 và hướng dẫn AI; chưa triển khai backend, chưa sửa/chạy schema.
- **2026-10-13:** người dùng chọn triển khai theo từng prompt có review. Đề xuất 10 prompt, soạn P01 với 8 bước nội bộ; tách dependency DB sang P02 và Security sang P03. Đây là cách chia việc kỹ thuật, không mở rộng phạm vi F1.
- **2026-10-13:** reviewer duyệt P01 sau P01-FIX-01: 13/13 test và packaging/external-config probes đạt. Soạn P02, chưa triển khai persistence.
- **2026-10-13:** người dùng xác nhận database/entity theo leader giao. P02 giữ đúng schema, không áp dụng đề xuất thêm bank_accounts.updated_at; kiểm tra local dùng phần F1 trích từ nguồn, DB chung vẫn chưa được kiểm tra/chạy SQL.
- **2026-10-13:** reviewer chạy lại P02, 13 HTTP + 7 PostgreSQL IT và packaging probe đạt, 5 DDL khớp leader; APPROVED. Soạn P03 với 9 bước; sau đó P03 được giao, triển khai và đặt `READY_FOR_REVIEW`. D-15/D-16/D-17 là baseline kỹ thuật, không phải giá trị production/policy nghiệp vụ do người dùng đã xác nhận.
- **2026-10-13:** reviewer chạy lại P03, 35 test/packaging đạt nhưng tái hiện 3 lỗi, đặt CHANGES_REQUESTED và soạn P03-FIX-01. P04 chưa được giao. Probes dùng DB/key giả, schema/reference không đổi; config production chưa được cung cấp.
- **2026-10-13:** reviewer chạy lại P03-FIX-01, 38/38 test và packaging PASS, R1/R2/R3 CLOSED, P03 APPROVED. Người dùng chọn U-09; soạn P04 8 bước để Agent triển khai profile/admin status, giữ schema. Tại thời điểm ghi quyết định, P04 chưa code; lần triển khai sau đó được theo dõi ở [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md) và [báo cáo P04](reports/P04_REPORT.md). Không coi config production hoặc policy tự duyệt KYC là đã chốt.
- **2026-10-13:** triển khai P04 profile/admin status theo schema leader không đổi. Full verify/packaging và PostgreSQL concurrency evidence được ghi trong [P04 report](reports/P04_REPORT.md); trạng thái Agent là READY_FOR_REVIEW. P05 chưa bắt đầu; Q-09 durable status/reason history và policy KYC P06 vẫn mở.
- **2026-10-13:** reviewer chạy lại P04 55/55/packaging PASS nhưng HTTP probe tái hiện presence flags bind được và PostgreSQL timeout55P03 trả500. P04 CHANGES_REQUESTED; soạn P04-FIX-01, không sửa schema/implementation trong lượt reviewer. Policy U-09 vẫn giữ, không giao P05.
- **2026-10-13:** P04-FIX-01 đổi presence accessors khỏi JavaBean binding; HTTP tests reject internal keys/duplicates và xác nhận full row/audit không đổi. Blocker transaction advisory lock trên connection PostgreSQL khác tái hiện55P03; API trả 503, rollback blocker cho retry 200. Full verify/packaging và chi tiết Git/hash ghi tại [báo cáo sửa](reports/P04_FIX_01_REPORT.md); chờ review, không bắt đầu P05.
- **2026-10-13:** reviewer chạy lại 57/57/packaging và HTTP probe trước/sau, R1/R2 CLOSED, P04 APPROVED. User chọn U-10 local private; soạn P05 9 bước, PROMPT_READY chưa code. Q-02/Q-03 policy duyệt/KYC và Q-09 history giữ mở; không thay schema hoặc nối DB chung.
- **2026-10-13:** triển khai P05 theo U-10: local private storage interface, multipart image ingest, PENDING metadata và authenticated owner/admin binary access; schema leader giữ nguyên. 10 P05 PostgreSQL/HTTP integration tests và 5 storage/image unit tests đạt trong targeted runs; full verification/packaging evidence ở [P05 report](reports/P05_REPORT.md). READY_FOR_REVIEW; P06 chưa bắt đầu. Q-02/Q-03 và Q-07 vận hành root/ACL còn mở; không chạy DB chung.
- **2026-10-14:** reviewer chạy lại 72/72 sau Docker sẵn sàng, packaging PASS; probe HTTP tái hiện JPEG bị cắt 201, metadata callback row-lock timeout rollback để orphan; root-check probe accepted app/config khi CWD khác. P05 CHANGES_REQUESTED, prompt P05-FIX-01 gồm R1–R4/race evidence. Reviewer không sửa source/schema, dùng dữ liệu/key/container tổng hợp, P06 chưa giao.
- **2026-10-14:** P05-FIX-01 thêm structural image checks, completion outcome cleanup, CodeSource root guard và hai race tests. `clean verify -Ppostgres-it` 83/83, packaging PASS; R1–R4 addressed chờ reviewer xác nhận, P05 READY_FOR_REVIEW, P06 NOT_STARTED. Xem [báo cáo](reports/P05_FIX_01_REPORT.md); schema/reference không đổi.
- **2026-10-14:** reviewer chạy lại 83/83/packaging/health/HTTP, đóng R1/R2/R4; actual Boot JarLauncher từ CWD khác tái hiện R3: ZIP root `/` làm root project/config accepted. P05 CHANGES_REQUESTED; soạn P05-FIX-02 gồm 5 bước chỉ sửa physical root và regression Boot loader. Không sửa source/schema/reference hoặc DB chung; P06 chưa giao.
- **2026-10-14:** triển khai P05-FIX-02; `clean verify -Ppostgres-it` đạt 87/87, Boot `java -jar` root regression từ CWD khác đạt, external-root PostgreSQL health 200/UP trace khớp, packaging PASS. R3 addressed chờ review; R1/R2/R4 giữ CLOSED; P06 NOT_STARTED. Chi tiết ở [report](reports/P05_FIX_02_REPORT.md).
- **2026-10-14:** reviewer chạy lại 87/87 sau bật Docker hidden,packaging/health và same-helper old/new Boot probes đạt,R3 CLOSED/P05 APPROVED. User trả lời3 câu hỏi và chốt U-11/U-12/U-13; soạn P06 gồm 9 bước PROMPT_READY chưa code. Giữ report legacy observation riêng, không sửa reference/schema/source/DB chung/commit/push.
- **2026-10-14:** triển khai P06 review/KYC theo 9 bước; thêm strict review HTTP, shared lock/recheck, actual image validation, exact unique-index mapping, snapshot/current KYC, PostgreSQL HTTP/concurrency regression. Target P06 IT đạt 13/13; full clean verify và packaging evidence ghi trong [P06 report](reports/P06_REPORT.md). Schema/reference/DB chung không đổi; trạng thái READY_FOR_REVIEW, P07 NOT_STARTED.
- **2026-10-14:** reviewer 105/105/packaging/health PASS; missing-file500 và storage-disabled503 không có diagnostic events theo trace. Original upload/review test chỉ overlap file-stage, metadata transactions chưa contention. P06 CHANGES_REQUESTED/R1/R2; soạn P06-FIX-01 gồm 5 bước, không sửa source/schema/reference/DB chung/commit/push, giữ policies đã chốt và P07 NOT_STARTED.
- **2026-10-14:** triển khai P06-FIX-01: failure log an toàn cho missing/corrupt evidence500, storage disabled/unavailable503 và exact `uq_user_doc_approved`/23505; thêm HTTP regression cho positive trace event, không log sentinel/cause/locator/PII, rows/KYC/files không mutate. Giữ original file-stage overlap và thêm actual upload transaction pre-commit holder, actual review HTTP waiter, `pg_blocking_pids` PID evidence, release commit→201/200, snapshot/current PENDING. Full `clean verify -Ppostgres-it` 106/106, packaging PASS, HTTP health 200/UP trace khớp; schema/reference không đổi. P06-FIX-01 READY_FOR_REVIEW, R1/R2 chờ review; P07 NOT_STARTED. Xem [report](reports/P06_FIX_01_REPORT.md).

- **2026-10-14:** reviewer 106/106/packaging/health/probe đạt,R1/R2 CLOSED/P06 APPROVED. User chốt U-14/U-15: account ACTIVE/current identity VERIFIED/approved GPLX còn hạn và cấm ADMIN self-status driver. Soạn P07 gồm 9 bước PROMPT_READY,chưa implementation; schema/F1 scope/history giữ,không DB chung/source change/commit/push.
- **2026-10-14:** triển khai P07 đủ 9 bước: driver profile create/read/admin list/status/current eligibility; một-statement aggregate và Clock; PostgreSQL HTTP/e2e/concurrency regression theo U-14/U-15; full verify/packaging/health được ghi trong [P07 report](reports/P07_REPORT.md). Schema/reference và DB chung không đổi; trạng thái READY_FOR_REVIEW, P08 NOT_STARTED.
- **2026-10-14:** reviewer chạy lại 124/124 (38 Surefire + 86 Failsafe), packaging/health đạt. HTTP/production-class probe trong PostgreSQL cô lập tái hiện GPLX APPROVED legacy hạng TAB/EM SPACE cho activation 200 và current eligible true; P06 HTTP approval blank vẫn từ chối đúng. P07 CHANGES_REQUESTED/R1; soạn P07-FIX-01 gồm 5 bước sửa predicate/test/docs, không đổi policy/schema hoặc source trong lượt reviewer. Reports/history giữ; P08 NOT_STARTED.
- **2026-10-14:** P07-FIX-01 bind Java 21 `Character.isWhitespace` set vào `btrim` trong aggregate SQL; matrix gồm 32 giá trị, trong đó 25 Java whitespace code points và positive controls, cùng HTTP regressions cho legacy approved rows, PENDING/ACTIVE/SUSPENDED, audit/events/storage. Target IT 12/12; full `clean verify -Ppostgres-it` 126/126; packaging and health PASS trên PostgreSQL 15.13 Testcontainers. U-14/U-15, P06 approval, schema/reference giữ; READY_FOR_REVIEW, R1 chờ reviewer, P08 NOT_STARTED. Xem [report](reports/P07_FIX_01_REPORT.md).
- **2026-10-14:** reviewer chạy lại 126/126, packaging/actual Boot JAR/health và cùng helper trước/sau. TAB/EM SPACE409/driver PENDING/current false, B200/ACTIVE/current true; R1 CLOSED/P07 APPROVED. User chốt U-16/U-17/U-18: explicit makeDefault=false khi omitted, xóa unreferenced default để zero, immutable payee details. Soạn P08 gồm 9 bước PROMPT_READY, chưa implementation, không thêm schema/module F4; reviewer chỉ docs/probe TEMP, không source/tests/commit/push/DB chung. Reports/reference/history giữ.
- **2026-10-14:** P08 triển khai 5 route owner-scoped, masked REST DTO, strict request/query parsing, internal full payee lookup và shared global→customer→bank lock protocol. PostgreSQL/HTTP tests dùng Testcontainers riêng cho unique/default/FK constraints, rollback, timeout/retry và blocking PID race; full verify/packaging/health ghi trong [P08 report](reports/P08_REPORT.md). U-16/U-17/U-18 và schema/reference/migration giữ; status READY_FOR_REVIEW, P09 NOT_STARTED. Không dùng DB chung hoặc commit/push.
- **2026-10-14:** P09 triển khai năm admin routes, strict DTO/query parsing, latest-counter quota guard dưới shared advisory→actor→voucher locks, no-op audit handling, safe failure and after-commit logs. Testcontainers PostgreSQL 15.13 HTTP/JWT tests kiểm tra 23505 constraint mapping, unrelated integrity fallback, rollback, 55P03/retry, actor recheck, actual holder/waiter PID và hai admin command ordering. Full clean verify, packaging probe, actual Boot JAR/CWD và health evidence ghi trong [P09 report](reports/P09_REPORT.md). Schema/reference/entity/migration giữ, không dùng DB chung hoặc commit/push. P09 READY_FOR_REVIEW, P10 NOT_STARTED.
- **2026-10-14:** reviewer 143/143/packaging/Boot/health đạt; actual HTTP probe có năm invalid decimal inputs được201/lưu rounded/underflow values do DoubleNode trước validation. Fraction/overflow fixtures cũ có duplicate discountValue nên400 không chứng minh numeric riêng. P09 CHANGES_REQUESTED/R1; P09-FIX-01 gồm 5 bước PROMPT_READY, giữ quota locks/U-19/U-20/U-21/schema. Reviewer snapshot P08 hash Voucher.java khớp hiện tại, bổ sung evidence không sửa report cũ. Chỉ docs/probe TEMP, không production source/tests/DB chung/commit/push; P10 NOT_STARTED.
- **2026-10-14:** P09-FIX-01 cấu hình exact decimal parsing trên Spring Boot application JsonMapper trước JsonNode/DTO binding; thêm actual HTTP/PostgreSQL numeric matrix, exact mapper binding, no-row/no-event assertions, integer-token regressions và positive controls. Schema/U-19/U-20/U-21 giữ; full verification/packaging/report ở [P09-FIX-01 report](reports/P09_FIX_01_REPORT.md). READY_FOR_REVIEW; P10 NOT_STARTED, không DB chung hoặc commit/push.
- **2026-10-14:** reviewer chạy lại 144/144 (38 Surefire + 106 Failsafe), packaging/Boot/health và cùng numeric probe trước/sau. Exact DecimalNode invalid boundaries400/rows0, valid1.0 tạo201/lưu1; R1 CLOSED/P09 APPROVED. P10 gồm 9 bước PROMPT_READY cho static OpenAPI/parity/workflow/standard JAR/handoff/final evidence; chưa triển khai/nghiệm thu toàn F1. Giữ policies/schema/history; reviewer chỉ docs/probe TEMP, không source/tests/entity/DB chung/commit/push.
- **2026-10-15:** P10 thực hiện đủ 9 bước: static OpenAPI/MVC parity 32 operations, PostgreSQL/HTTP account→KYC→driver→bank→voucher→lock/Clock workflow, standard executable JAR smoke từ Unicode/space CWD với external config/key/private root, handoff và acceptance matrix. Final clean verify **147/147** (39 Surefire + 108 Failsafe), packaging PASS; status READY_FOR_REVIEW, chưa nghiệm thu toàn F1. Sáu P10 TEMP directories từ failed cleanup attempts trước còn lại vì shell policy từ chối recursive cleanup. Schema/reference/history giữ; không shared DB, commit/push hoặc deploy. Xem [report](reports/P10_REPORT.md).
- **2026-10-15, review:** reviewer khởi động Docker sau lần unavailable, chạy lại 147/147/packaging/workflow/standard JAR PASS. Independent production-class HTTP/PostgreSQL probe xác nhận OpenAPI enum/required/nullable/length/numeric constraints sai và login duplicate email200 trái handoff toàn cục. P10 CHANGES_REQUESTED/R1/R2 OPEN; [review](reviews/P10_REVIEW.md), [prompt FIX-01](prompts/P10_FIX_01.md) 5 bước PROMPT_READY. Không đổi business policy/auth behavior/source/schema; chỉ docs và probe TEMP. Automatic policy tiếp tục chặn cleanup đã kiểm tra paths; residue/erratum checksum được ghi rõ, không bypass. Chưa nghiệm thu toàn F1.
