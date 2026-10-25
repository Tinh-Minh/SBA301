# Review P08 — APPROVED

Ngày review: **2026-10-14**. **P08 APPROVED**, không có finding chặn trong phạm vi được giao. Reviewer đối chiếu code/prompt/U-16/U-17/U-18, chạy lại **137/137 tests**, packaging/actual Boot JAR/health và probe HTTP riêng trên production classes/PostgreSQL cô lập. [Report Agent](../reports/P08_REPORT.md) giữ nguyên lịch sử.

## 1. Bằng chứng reviewer

| Kiểm tra | Kết quả |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; 2 phút 21 giây; **137/137**, 0 failure/error/skip |
| Surefire / Failsafe | 38 / 99, gồm BankAccountPostgresIT 11/11 và actual Boot JAR root IT |
| Packaging | PASS; local/key/bootstrap/document markers, root path và test Boot helper không vào JAR |
| Health HTTP/PostgreSQL trong P08 suite | 200/UP; trace body/header `dd7cf8c6-86a1-4e54-8fff-98fb96ce2862` khớp |
| Probe riêng — create/masking | Omitted makeDefault=false; `******5678`, full number absent; trace đúng |
| Probe riêng — ownership/ingress | ADMIN đọc foreign bank404; multipart PATCH400, default không đổi |
| Probe riêng — FK/delete | Referenced DELETE409 BANK_ACCOUNT_IN_USE, giữ row/default; bỏ reference tổng hợp rồi DELETE200, zero defaults/peer retained |
| Probe riêng — health | 200/UP, trace `9cff158f-8198-4415-92e3-e97326e02f2e` |
| Git trước viết review docs | BE; HEAD=origin/BE=`2fe712eed12a2af3b61f0a5311bdd3901f614029`; 228 đường dẫn untracked, không staged/tracked diff |

Logs reviewer ở `C:\Users\FPTSHOP\AppData\Local\Temp\`:

- `sba301-p08-review-verify.log`
- `sba301-p08-review-packaging.log`
- `sba301-p08-review-http-probe.log`

Helper `sba301-p08-review-probe\BankAccountHttpProbe.java` nằm ngoài repo. Nó compile/nạp production classes, loại target/test-classes khỏi classpath, chạy app HTTP thật với PostgreSQL15.13/RSA keys/accounts tổng hợp. FK fixture là table payouts tối thiểu chỉ để thử composite reference; không phải full F4. App/container/temporary keys được đóng/dọn. Không dùng dữ liệu hoặc DB thật.

## 2. Code và policy đã kiểm chứng

- **U-16:** first account không tự default; chỉ explicit true thay default. **U-17:** xóa unreferenced default để zero, không promote peer. **U-18:** không có endpoint update payee fields; thông tin nhận tiền giữ bất biến.
- CUSTOMER/ADMIN ACTIVE chỉ truy cập own bank. Queries scope id+owner/page+count ngay trong DB; ADMIN không bypass owner. Strict JSON/boolean/unknown/duplicate/internal flags, query/sort/ID, mọi byte body ở default/delete có automated HTTP regressions.
- HTTP mapper chỉ có masked number, account ngắn được che toàn bộ, Unicode/leading zeros được giữ đúng; internal payee DTO riêng và redacted toString. Trusted lookup xác minh bankId+recipientId, không tạo full-number endpoint hoặc payout service.
- Create/default/delete dùng shared advisory → own customer → bank rows theo ID, recheck actor/status sau chờ. Clear/flush trước set/insert default trong cùng transaction. No-op không mutation log, rollback giữ default cũ; bank chỉ createdAt theo schema.
- Actual23505 được phân loại theo đúng duplicate/default index, unrelated constraint500; exact composite FK23503409 ở delete. Safe diagnostic dương và absence of PII/raw Throwable/SQL detail có assertions. Success chỉ after commit; 55P03 giữ dependency503.

## 3. PostgreSQL concurrency đã chạy lại

| Case | Backend evidence reviewer | Kết quả |
|---|---|---|
| Hai default commands | Holder61, waiter62, blockers `[61]` | Intermediate state không visible; commit tuần tự, cuối chỉ một default |
| Reference insert / delete | Holder63, waiter61, blockers `[63]` | Sau reference commit DELETE409, bank/default/reference giữ đúng |
| Default / delete cùng row | Holder61, waiter62, blockers `[61]` | Set200 rồi delete200; target bị xóa, zero defaults đúng U-17 |
| Lock timeout/retry | Blocker63, waiter62, blockers `[63]` | Actual55P03→503/rollback; release→retry200 |
| P04 khóa actor / bank request | Holder63, P04 waiter62, bank waiter61; blockers `[63]` và `[63,62]` | P04 commit LOCKED; bank JWT cũ401, không mutation |

Các test dùng bounded gates, actual SQL/flush/commit và PostgreSQL observer, không chỉ overlap requests hoặc mock exceptions. Synthetic FK fixture cũng kiểm tra wrong recipient bị chặn; kết quả chỉ chứng minh composite FK/integrity handling.

## 4. Hashes, phạm vi và giới hạn

| File | SHA-256 giữ nguyên |
|---|---|
| schema.sql | `49098BE02DCADFD83BF0EF540BE4DA25C3F04F5E95A899BC7101E53660FAB3C8` |
| BACKEND_CONVENTIONS.md reference | `737EB4501C7CEAA88F21AB2F8B3149A2E2620C0C4C7CDB9368616218990A9518` |
| car_rental_conceptual.drawio reference | `C26032E49918B5E40A8C6C38C34E41901EC1EFAA6005215A71B3CED35079E46E` |
| V1__function1_leader_baseline.sql | `6D074251060975A2811436F6CE944D3C5D56190C33364C81F97D6B03768B0FA4` |
| BankAccount.java | `FA03F0D8330342EF595DE140BCFD0E475B0AE071AE5F1EDD32C21B4D96CE2B35` |
| P08_REPORT.md | `51D898EF4CAE3AF2D8A7866EEB19F94D01D0201ADE6A72F0E209DA6CD322B8DD` |

P01–P07, security/trace/storage/KYC/driver và schema giữ nguyên. Production DB/config/ACL, multi-node, full F4 payout flow, crash consistency và throughput chưa được kiểm chứng. Partial unique/FK giữ DB invariants; writer ngoài app phải phối hợp protocol khi tích hợp. Lookup DTO chỉ snapshot, không reservation hoặc authorization chuyển tiền.

Reviewer chỉ đọc/kiểm tra source, chạy verification/probe cô lập và viết docs. Không sửa production source/tests/schema/reference/report lịch sử, stage/commit/push hoặc dùng DB chung. User chốt U-19/U-20/U-21 cho voucher; **[P09 — 9 bước](../prompts/P09_ADMIN_VOUCHERS.md) PROMPT_READY**, chưa triển khai. P10 NOT_STARTED.
