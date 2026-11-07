# 13 — Review giấy tờ và KYC hiện tại (P06)

Trạng thái: **P01–P09 APPROVED** theo [review P09-FIX-01](reviews/P09_FIX_01_REVIEW.md). P10 CHANGES_REQUESTED; P10-FIX-01 READY_FOR_REVIEW, đồng bộ contract/docs với runtime và giữ snapshot/current/locks/schema/history. Workflow/static spec phân biệt P05 submission fields và U-13 approval prerequisites. Evidence: [P10 report](reports/P10_REPORT.md) và [fix report](reports/P10_FIX_01_REPORT.md).

## 1. Phạm vi và policy

P06 chỉ review giấy tờ `user_documents` và tổng hợp identity KYC của `customers`. Không làm driver, renewal/revoke, lịch sử audit bền vững, expiry job, eligibility F2/F3/P07 hoặc thay đổi P05 private storage.

User xác nhận các policy sau ngày 2026-10-14:

| Quy tắc | Contract |
|---|---|
| U-11 — self-review | ADMIN không được APPROVE hoặc REJECT document thuộc chính tài khoản ADMIN đó; trả 403. |
| U-12 — identity KYC | `CITIZEN_ID` (CCCD) hoặc `PASSPORT` là proof identity. `DRIVER_LICENSE` được xử lý riêng cho eligibility driver/P07, không nâng/hạ identity KYC. |
| U-13 — approve prerequisites | Cả ba loại cần full name, date of birth, issue place và issue date. CCCD/GPLX cần front+back; passport cần front. GPLX cần license class và expiry; expiry của CCCD/passport có thể NULL. |

Các baseline P06 khác là lựa chọn triển khai cần tách khỏi policy đã xác nhận: expiry inclusive trong ngày (`expiresAt >= today`); chỉ PENDING có thể review, terminal command là 409; owner LOCKED được ADMIN khác review nhưng không được unlock; KYC precedence VERIFIED → PENDING → REJECTED → NONE; index APPROVED leader vẫn chặn trùng `(doc_type, doc_number)` kể cả cùng owner. Đây không phải kết luận pháp lý.

## 2. Review command

`PATCH /api/user-documents/{id}/review` yêu cầu ADMIN ACTIVE, Bearer token và JSON. `id` phải dương; query string bị từ chối.

```json
{"verifyStatus":"APPROVED"}
```

```json
{"verifyStatus":"REJECTED","rejectReason":"Thông tin trên giấy tờ chưa đầy đủ"}
```

Request chỉ nhận `verifyStatus` và `rejectReason`, exact uppercase string. Unknown/duplicate fields, helper/internal flags, null/missing/PENDING/unknown status, sai kiểu hoặc coercion đều 400 `INVALID_REQUEST`. REJECTED yêu cầu reason trim nonblank ≤500; APPROVED chỉ chấp nhận reason omitted/null. Reason được lưu sau trim nhưng không xuất hiện trong success/error logs. Error body không echo giá trị client gửi.

| Kết quả | HTTP / code |
|---|---|
| Review thành công | 200 `OK` |
| CUSTOMER hoặc ADMIN tự review | 403 `ACCESS_DENIED` hoặc `DOCUMENT_SELF_REVIEW_FORBIDDEN` |
| Thiếu/invalid body, query, id không dương | 400 `INVALID_REQUEST` |
| Không tìm thấy document | 404 `RESOURCE_NOT_FOUND` |
| Document đã APPROVED/REJECTED | 409 `DOCUMENT_ALREADY_REVIEWED` |
| Approve thiếu metadata/ngày/mặt ảnh | 409 `DOCUMENT_NOT_APPROVABLE` |
| Số giấy tờ đã được APPROVED | 409 `APPROVED_DOCUMENT_CONFLICT` |
| Storage disabled/unavailable | 503 `DEPENDENCY_UNAVAILABLE` |
| Stored image thiếu/hỏng/locator không an toàn | 500 `INTERNAL_ERROR` |

Response `ApiResponse<UserDocumentReviewResponse>` chứa:

```json
{
  "document": {"id": 17, "customerId": 8, "verifyStatus": "APPROVED", "hasFrontImage": true, "hasBackImage": true},
  "kycStatus": "VERIFIED",
  "evaluatedOn": "2026-10-14"
}
```

Ví dụ rút gọn; `document` dùng `UserDocumentDetailResponse` allowlist hiện có. Không trả locator, filesystem path, raw bytes, password hoặc token. Response mang `Cache-Control: no-store` và trace envelope/header.

## 3. Transaction và locking

Review chạy qua service proxy trong transaction duy nhất và dùng shared `CustomerStatusLock` protocol:

1. Validate command fields thuần dữ liệu.
2. Acquire global transaction advisory lock.
3. Lock actor row rồi recheck role ADMIN/status ACTIVE trong DB; JWT role/status không thay cho lần recheck này.
4. Discover owner bằng scalar ID projection, không load unlocked document entity.
5. Lock owner row rồi document row; xác nhận owner hiện hành và state PENDING.
6. Check self-review. Owner LOCKED vẫn có thể được xử lý nhưng account status không đổi.
7. Thực hiện approve/reject; flush document. Tính current identity KYC từ một database statement trong cùng transaction; cập nhật/flush `customers.kyc_status` chỉ khi value đổi.
8. Tạo response và đăng ký review log after-commit. Bất kỳ lỗi trước commit rollback document + customer snapshot; không có success log.

Lock order là **global advisory → actor row → owner row → document row**, tương thích P04 account-status writer (`global → actor → target`) và P05 upload/profile owner-row writer. Shared global lock giảm throughput giữa các command F1; đây là baseline hiện tại, không thêm lock namespace/schema. Không giữ database transaction để gọi mạng.

### Approve

- Name, DOB, place/date of issue phải có; DOB/issueDate không tương lai; issueDate không sau expiry; expiry hôm qua không hợp lệ, hôm nay còn hiệu lực.
- GPLX yêu cầu licenseClass, expiresAt và hai mặt. CCCD cần hai mặt; passport chỉ cần mặt trước. CCCD/passport được expiresAt NULL.
- Dùng `PrivateDocumentStorage` và `DocumentImageInspector` để mở/kiểm tra actual stored image bytes; chỉ cột locator không đủ. Disabled/unavailable trả 503; missing/corrupt/invalid stored evidence trả lỗi an toàn, không mutate row/KYC và không log success.
- Có precheck trùng để đưa lỗi thân thiện. PostgreSQL partial unique index `uq_user_doc_approved` trên `(doc_type, doc_number) WHERE verify_status='APPROVED'` là authority cuối cùng. Chỉ exact constraint name + SQLState23505 được chuyển thành 409. Không chuyển mọi integrity error thành conflict.
- Set `APPROVED`, clear reject reason, lưu actor DB vào `verified_by`, thời gian local từ injected `Clock`; không đổi document owner/type/number/ảnh/profile/account.

### Reject

Chỉ cần actor/state và reason hợp lệ. Không yêu cầu metadata approve, file readable hoặc storage enabled; không xóa/rewrite ảnh. Set `REJECTED`, reason đã trim, verifier và thời gian. Customer snapshot được tính lại theo toàn bộ proof identity, không phải chỉ document vừa reject.

## 4. Current KYC và persisted snapshot

`KycPolicy` dùng chung cho review-time snapshot và current reads. Với `today = LocalDate.now(Clock)` và chỉ giấy tờ `CITIZEN_ID`/`PASSPORT`:

1. Có APPROVED chưa hết hạn (`expiresAt IS NULL OR expiresAt >= today`) → `VERIFIED`.
2. Nếu không, có `PENDING` → `PENDING`.
3. Nếu không, có `REJECTED` → `REJECTED`.
4. Còn lại → `NONE`.

GPLX-only cho identity KYC `NONE`. Approved identity hết hạn không bị tự đổi status. Một pending/rejected mới không hạ VERIFIED khi vẫn còn proof identity approved hợp lệ.

`customers.kyc_status` và profile/admin DTO giữ **snapshot tại lần review command gần nhất**, được ghi cùng transaction. P05 submission không đổi snapshot. Khi ngày lịch thay đổi hoặc có submission mới, snapshot có thể cũ. F2/F3/P07 không được dùng snapshot đơn lẻ để quyết định eligibility hiện tại.

Current-state endpoints:

| Method | Scope | Data |
|---|---|---|
| `GET /api/customers/me/kyc` | Principal owner, account phải ACTIVE | `customerId`, `accountStatus`, current `kycStatus`, `evaluatedOn` |
| `GET /api/customers/{id}/kyc` | ADMIN ACTIVE; target có thể LOCKED | Cùng bốn field; không có account/document PII |

Mỗi endpoint truy vấn một aggregate projection statement trong read-only transaction; GET không backfill snapshot, không chạm audit, không đọc file ảnh hoặc toàn bộ entity list. Account ACTIVE là điều kiện quyền riêng, độc lập với KYC status. Cả hai response no-store/trace.

## 5. Frontend / function integration

- Admin UI gọi PATCH bằng bearer token và hai field cho phép; chỉ gửi `rejectReason` khi REJECTED. Dùng `evaluatedOn` để hiển thị ngày đánh giá; xử lý `DOCUMENT_ALREADY_REVIEWED` bằng refresh thay vì tự retry cùng command.
- User xem tình trạng hiện thời qua `/api/customers/me/kyc`; admin dùng route theo customer ID. Profile `kycStatus` vẫn là snapshot và có thể khác current summary sau ngày expiry.
- Private images tiếp tục được lấy qua P05 authenticated binary endpoint; không dùng locator trong response PATCH, browser public URL hoặc JWT query parameter.
- P07 phải kiểm tra GPLX còn hợp lệ và driver state riêng. F2/F3 phải dùng current KYC/internal policy thích hợp, không giả rằng identity KYC kích hoạt driver, đặt xe hoặc quyền thanh toán.

## 6. Giới hạn và bước kế tiếp

- Không có durable review history: `verifiedBy`, `verifiedAt` và `rejectReason` chỉ là trạng thái quyết định hiện tại. Q-09/audit event table vẫn ngoài scope.
- Không có renewal/revoke hoặc trạng thái lịch sử nhiều lần; gửi bản mới dùng P05. Unique index leader có thể buộc phải reject/điều phối duplicate trước khi approve.
- Current GET phản ánh metadata/status/expiry, không mở lại các ảnh đã approved.
- Không có expiry scheduler, snapshot backfill, shared database migration hoặc schema change.
- Filesystem và PostgreSQL không thể atomic khi process/OS mất điện; P05 retention/reconciliation/ACL và backup vẫn là vận hành riêng.
- PostgreSQL 15.13 Testcontainers, HTTP/concurrency và failure barriers được kiểm tra trong [P06 report](reports/P06_REPORT.md). Production DB, Windows ACL matrix, multi-node deployment, crash/power-loss và throughput chưa được chứng minh.

P06-FIX-01 bổ sung safe `document-review-failure` diagnostics có trace/action/category/error code/IDs và exception type tĩnh cho stored-evidence 500, storage 503, cùng caught exact `uq_user_doc_approved`/23505 (chỉ log tên constraint đã allowlist). Không ghi throwable/message/cause, locator, dữ liệu giấy tờ hay reason; lỗi vẫn rollback hoặc rethrow/translate với cause được giữ. Regression HTTP/PostgreSQL xác nhận log dương, trace khớp, không lộ sentinel và không mutation khi lỗi.

Test upload/review cũ được giữ đúng file-stage overlap. New metadata transaction test giữ upload sau flush/precommit,observer xác nhận holder PID 62 block waiter PID 61 trong reviewer run; upload row chưa visible/review chưa xong trước release. Sau commit upload 201/review 200,snapshot/current PENDING,metadata/audit/files/download/log privacy đạt. [Review FIX-01](reviews/P06_FIX_01_REVIEW.md) đóng R1/R2/P06 APPROVED; report lịch sử giữ. Tại thời điểm review đó P07 mới là prompt; implementation hiện tại ở trạng thái trong [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md). Lock/KYC/schema giữ.
