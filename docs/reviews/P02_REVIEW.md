# Review P02 — APPROVED

Ngày review: **2026-10-13**. Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, nhánh **BE**.

Reviewer đã đọc production code, baseline SQL, toàn bộ PostgreSQL IT, phần chỉnh HTTP test/config, script đóng gói và báo cáo Agent. Không phát hiện finding chặn trong phạm vi P02. **P02 APPROVED; P03 đã có prompt, chưa triển khai.**

## 1. Bằng chứng chạy lại

| Kiểm tra | Kết quả reviewer |
|---|---|
| `.\mvnw.cmd -B clean verify -Ppostgres-it` | BUILD SUCCESS; Surefire **13/13**, Failsafe **7/7**, 0 failures/errors/skipped |
| PostgreSQL | Container `postgres:15.13-alpine`, Testcontainers; Flyway V1 và Hibernate schema validation chạy thật |
| Packaging probe | PASS; local config entry và marker giả đều không có trong JAR |
| DDL nguồn đối chiếu baseline | Cả 5 CREATE TABLE khớp sau khi bỏ comment, whitespace và qualification public; reviewer đối chiếu thêm hàm/index/trigger/RLS |
| Git | BE; HEAD khớp origin/BE tại `2fe712eed12a2af3b61f0a5311bdd3901f614029`; 71 untracked files trước khi reviewer thêm tài liệu |
| Reference | SHA-256 của schema, conventions và drawio vẫn khớp bản đầu vào |

JAVA_HOME chỉ được đặt trong tiến trình chạy Maven. Full verification và packaging probe là hai lệnh riêng; skip-tests trong bản sao của packaging probe không được tính vào kết quả 20 test.

Logs tại máy reviewer:

- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p02-review-verify.log`
- `C:\Users\FPTSHOP\AppData\Local\Temp\sba301-p02-review-packaging.log`
- `target/surefire-reports/TEST-com.carrental.PlatformHttpTest.xml`
- `target/failsafe-reports/TEST-com.carrental.Function1PostgresIT.xml`

## 2. Phạm vi đã đạt

- 5 entity và 8 enum đúng schema leader; BankAccount chỉ có createdAt. Không thêm bảng/cột/entity của function khác.
- BaseEntity/AuditedEntity map DB-generated audit, không tự đặt audit từ Java. Các quan hệ tới customer/reviewer dùng LAZY và không cascade xóa qua JPA.
- Flyway local baseline chỉ tạo 5 bảng F1 cùng hạ tầng audit và RLS tương ứng; 4 update trigger, không policy/grant mới. Migrate lần hai giữ marker row và không tạo thêm migration.
- PostgreSQL IT kiểm tra round-trip identity/enum/date/money/null, số 0 đầu ngân hàng, audit/default/constraint, owner filtering trước page/count và lock query trong transaction.
- HTTP health được gọi qua server thật của integration test đang kết nối DB container: 200, UP và trace khớp header. Trace reviewer quan sát: `c754d913-82af-4ea3-ab07-910cec26aefa`.
- Cấu hình mặc định validate schema, tắt Flyway migrate, không bật SQL init/open-in-view. P01 HTTP test cô lập DB, vẫn kiểm tra 13 hành vi đã có.

## 3. Giới hạn không chặn P03

- DB chung/Supabase chưa được kết nối hoặc migrate; file baseline local không phải lịch sử migration chung được leader duyệt.
- Tests dùng DB owner vượt RLS. Metadata RLS có mặt không chứng minh quyền API/customer/admin; Security/ownership use case cần được kiểm tra ở prompt tương ứng.
- Lock test hiện kiểm tra gọi các query có PESSIMISTIC_WRITE trong transaction. Chưa phải bằng chứng các luồng cạnh tranh duyệt/default/quota đã đúng; các service đó chưa tồn tại và vẫn thuộc P06/P08/P09.
- GET ngân hàng dạng page ở API tương lai sẽ được hoàn thiện tại P08; repository List hiện tại có scope owner, chưa expose thành endpoint.

Reviewer chỉ kiểm tra và cập nhật tài liệu/prompt, không sửa implementation, schema nguồn, commit/push hoặc chạy SQL lên database chung. [P03](../prompts/P03_AUTH_SECURITY.md) tiếp tục register/login, JWT, CurrentAccount, CORS và bootstrap admin được kiểm soát, giữ nguyên schema leader.
