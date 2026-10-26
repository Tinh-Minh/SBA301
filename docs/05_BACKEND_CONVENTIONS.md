# 05 — Quy ước backend đã đối chiếu

Phạm vi áp dụng hiện tại: Function 1. Tài liệu này là bản đề xuất chuẩn hóa từ [quy ước gốc](reference/BACKEND_CONVENTIONS.md), schema và lời mentor do người dùng cung cấp **để tham khảo**. Không sao chép máy móc các câu có thể nghe/ghi sai.

## 1. Xử lý từng góp ý mentor

| Ý mentor | Cách áp dụng trong dự án |
|---|---|
| `ProviderProductService` dư thừa; đặt tên có nghĩa | Dùng tên khái niệm thực tế: CustomerService, UserDocumentService, DriverService, BankAccountService, VoucherService; tránh tiền tố lặp |
| Đơn có admin/staff/owner, khách chỉ lấy đơn mình, dùng `#list` | Giữ nguyên bài học về role và quyền sở hữu. Trong F1 dùng CUSTOMER/ADMIN, principal và query có scope. `#list` chưa xác định là annotation nào; không tạo annotation tưởng tượng |
| Toàn bộ role nằm trong một controller | Một controller theo tài nguyên, method có quyền khác nhau; không tách CustomerBankController/AdminBankController để nhân đôi logic, cũng không gom cả hệ thống vào một controller |
| Tên `imp` không cần `services` | Câu gốc chưa đủ rõ. Chọn quy ước Java thông dụng `XxxService` / `XxxServiceImpl`, package `service.impl`; không lặp `ServiceService` hoặc viết sai `Imp` theo quán tính |
| Không fix cứng các số | Giá trị nghiệp vụ/thời gian/giới hạn cấu hình có tên và nguồn; không hardcode ID. Hằng toán học hay giới hạn đúng schema không cần đưa tất cả vào DB |
| Không builder ở service | Service gọi constructor/factory/DTO mapping có nghĩa; không rải chuỗi builder để che logic. Lombok Builder nếu dùng cho response chỉ nằm ở DTO/factory và có lý do |
| Tách DTO request và response | Package riêng, DTO riêng từng use case; không reuse entity làm form |
| Bắt buộc createAt/updateAt | Tên chuẩn `createdAt`, `updatedAt`, khớp cột thật. Theo xác nhận mới nhất phải giữ schema leader: bank chỉ có createdAt; bổ sung updated_at là đề xuất chờ leader, không tự migration để đáp ứng lời mentor tham khảo |
| Enum giải thích trạng thái, service dùng switch case | Enum có mô tả ý nghĩa; service kiểm tra transition bằng switch tại một nơi. Thay lựa chọn if/else trong enum của tài liệu gốc để không tồn tại hai bộ luật |
| Phải có enum status | Mỗi khái niệm status có enum thích hợp; STRING khớp CHECK SQL |
| Có OrderService, không có OrderItemService | Bài học về aggregate: ảnh/bản ghi con đơn giản xử lý qua cha. F1 có service giấy tờ/ngân hàng/tài xế vì mỗi phần có use case và phân quyền độc lập |
| Có `@Traditional` | Nhiều khả năng là cách ghi nhầm `@Transactional`. Dùng annotation transaction chuẩn của Spring; đây là diễn giải kỹ thuật, không khẳng định nguyên văn mentor là tên annotation thật |
| Tất cả try/catch/finally; catch có log | Try/catch tại ranh giới use case service để bổ sung context và ném lại. Finally chỉ dùng cho cleanup thật; ưu tiên try-with-resources. Không tạo finally rỗng ở mọi method |
| Service thông qua interface | Controller inject interface, implementation dùng constructor injection |
| Account truyền theo form | Request DTO từ form frontend; JSON cho account/auth, multipart cho file theo hợp đồng. Account đã đăng nhập phải lấy từ security context, không nhận entity Account từ client |
| Role phải thêm động | Hiện user xác nhận CUSTOMER/ADMIN và schema cũng vậy. Role động là thay đổi mô hình riêng Q-10, không tự thêm bảng/permission engine |
| Ghi log phải có throw new exception và function | Log có tên thao tác/ID kỹ thuật; exception nghiệp vụ ném lại nguyên, lỗi hạ tầng được bọc với cause. Không bắt AppException rồi tạo AppException mới làm mất mã lỗi/stack trace |

## 2. Controller và DTO

- Controller chỉ xử lý HTTP: mapping, `@Valid`, principal, pagination và response status.
- Service trả response DTO, controller có thể bọc ApiResponse theo quy ước thống nhất. Không bọc nhiều lần.
- Request tạo mới có `toEntity()` chỉ với trường người dùng được phép đặt; không query DB hay gán trạng thái/role tùy ý trong DTO.
- Với Auth, mật khẩu plaintext không được `toEntity()` gán vào password_hash. Service hash trước và gán giá trị đã encode qua luồng riêng.
- Request update có `applyTo(entity)` chỉ cho trường được phép. Command duyệt/khóa/đổi mặc định phải qua service, không dùng applyTo chung để bỏ qua kiểm tra.
- Response có `from(entity)` hoặc factory phù hợp; map khi transaction còn hiệu lực.
- Không tạo mapper layer mới chỉ cho vài DTO. Nếu thực tế mapping phức tạp thì ghi nhận quyết định thay đổi, tránh đồng thời dùng nhiều phong cách.
- Không serialize Customer entity để rồi trông chờ `@JsonIgnore` là bảo vệ duy nhất cho password/PII.

## 3. Service và chuyển trạng thái

- Mỗi use case ghi có trình tự: xác định actor → tải bản ghi đúng scope → khóa khi cần → kiểm tra điều kiện → chuyển trạng thái/ghi dữ liệu → flush nếu cần bắt lỗi DB → map response.
- Enum chỉ giải thích và định danh trạng thái; không truy vấn repository từ enum.
- Chỉ một nguồn luật transition: switch trong implementation hoặc policy được service sở hữu. Không giữ đồng thời enum.canTransitionTo và một switch khác dễ lệch nhau.
- Chỉ gọi `setStatus` sau kiểm tra. Khởi tạo trạng thái mặc định do server quyết định không phải thao tác chuyển tùy ý của client.
- KYC tổng hợp được tính từ tập giấy tờ và policy thời gian; không cung cấp endpoint set KYC thủ công để bỏ qua duyệt.
- Retry command đã thành công phải có quy tắc rõ: trả lại kết quả hiện tại khi payload có cùng ý nghĩa, hoặc 409 khi khác; không tạo audit/side effect trùng.

## 4. Transaction, lỗi và log

- Dùng `org.springframework.transaction.annotation.Transactional` ở service implementation public; khai báo readOnly cho read use case thích hợp.
- AppException kế thừa RuntimeException, chứa error code, HTTP mapping hoặc thông tin tương đương, thông điệp an toàn và constructor có cause.
- Mặc định transaction Spring rollback với RuntimeException/Error. Do đó phải ném lại lỗi, không log rồi return null. [Nguồn Spring](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html).
- `catch (AppException e)`: log warn theo mã/context, `throw e`; không wrap lần nữa.
- Lỗi hạ tầng được chuyển có chủ đích: mã lỗi rõ ràng, log exception để có stack trace, `throw new AppException(..., e)` giữ cause.
- Không đổi mọi DataIntegrityViolationException thành lỗi trùng email. Không đổi AccessDeniedException/AuthenticationException thành HTTP 500 do catch Exception quá rộng.
- Không khai báo `throws Exception` cho business interface; checked exception của storage/thư viện được xử lý ở adapter hoặc boundary phù hợp.
- Một lỗi được log stack trace ở một boundary chịu trách nhiệm; helper không log rồi ném lên để mọi caller log lại.
- GlobalExceptionHandler map lỗi đã được log; vẫn cần fallback log một lần cho lỗi chưa đi qua boundary, ví dụ lỗi flush/commit phát sinh ở proxy sau khi method service trả về. Quy ước cũ “handler tuyệt đối không log” không bao phủ trường hợp này.
- Lỗi validation/401/403 thông thường không cần stack trace ở mức error; đưa request/correlation ID để tra cứu khi cần.
- Không đặt business action, return hay throw che lỗi gốc trong finally. Tài nguyên framework quản lý không cần tự đóng bằng finally.

## 5. Dữ liệu, log và bảo mật

- SQL là PostgreSQL; không chọn kiểu hay truy vấn chỉ chạy H2 rồi cho rằng tương đương production.
- Tiền dùng BigDecimal, VND scale 0; ngày giờ theo schema nguồn, Clock rõ zone. Không tự đặt 10% commission vào F1 vì cột đó thuộc đơn của F3.
- Chuỗi enum đúng chữ hoa như SQL; không dùng magic string rải rác.
- Log dùng `@Slf4j` và placeholder `{}`; có tên use case, actorId và resourceId khi phù hợp.
- Không log DTO auth, bearer token, private signed URL, số giấy tờ/điện thoại/ngân hàng đầy đủ. Exception hạ tầng có thể chứa dữ liệu đầu vào: phải kiểm soát logger/SQL bind logging ở môi trường thật.
- Tránh SQL bind parameter logs và request body logging cho endpoint nhạy cảm; chỉ che ở log.info của service là chưa đủ.
- Không tin customerId hoặc verifiedBy do client gửi. `@PreAuthorize` kiểm tra quyền cấp method; service/query kiểm tra phạm vi row.
- Cấu hình CORS không thay thế authentication/authorization.

## 6. Git và thay đổi dùng chung

- Công việc hiện tại ở nhánh BE theo người dùng; không tự chuyển nhánh hoặc đổi working directory sang bản Documents cũ.
- Không commit target, .env, credential, JWT private key hoặc application-local.properties có thông tin thật.
- Mẫu config có placeholder; `.gitignore` cần tạo khi scaffold được giao.
- Sửa schema qua migration có thứ tự nhóm thống nhất; không sửa bản nguồn `docs/reference/schema.sql` để giả như đã nâng schema.
- Cập nhật docs cùng thay đổi API/enum/schema. Giữ bảng phân công Function 1–4 và điểm giao rõ ràng.

## 7. Checklist review Function 1

- [ ] Thay đổi đúng phạm vi F1 và yêu cầu hiện tại.
- [ ] API có DTO, validation, HTTP code và quyền dữ liệu cụ thể.
- [ ] Role CUSTOMER/ADMIN; chủ bản ghi từ principal; không mass assignment.
- [ ] Danh sách lọc quyền trước page/count; sort allowlist và giới hạn size.
- [ ] Entity khớp schema thật, enum STRING khớp CHECK, audit đọc đúng sau ghi.
- [ ] Transition được kiểm tra một nơi; KYC/driver tính đúng theo policy đã chốt.
- [ ] Transaction, locks và UNIQUE/CHECK bảo vệ race thực tế.
- [ ] Log an toàn, lỗi không bị nuốt, cause được giữ, không log lặp vô ích.
- [ ] File giấy tờ private, upload lỗi có cleanup, quyền đọc được kiểm tra.
- [ ] Admin không sửa used_count; hợp đồng voucher/F3 không bị phá.
- [ ] Test có ý nghĩa cho phần thay đổi; ghi rõ phần chưa kiểm tra.
- [ ] Không có secret hoặc việc ngoài function được thêm âm thầm.
