# Function 1 — Playwright End-to-End Report

**Kết quả:** `READY_FOR_REVIEW` — các luồng nghiệp vụ cơ bản trong phạm vi dưới đây PASS trên Chromium thật và PostgreSQL cô lập. Không chạy concurrency KYC theo yêu cầu.

## Môi trường và cách chạy

- Repository: `C:\Users\FPTSHOP\Desktop\SBA301_RentCar`, branch `feature/function_01`.
- Playwright `1.64.0`, Chromium qua Google Chrome cài trên máy; một browser test chạy tuần tự.
- Frontend build được phục vụ ở `127.0.0.1:3000`, proxy API tới backend ở `127.0.0.1:8080`.
- PostgreSQL là Docker container riêng của lượt E2E, database `f1_e2e` trên host port `55438`. Backend chạy bằng cấu hình môi trường test từ thư mục tạm; tài liệu `.env` không được mở hoặc đọc.
- DB cô lập được dựng bằng baseline và các fixture migration đã có trong repository (`V1` cùng test support `V2`–`V4`). Test kiểm tra trạng thái đã lưu qua `psql` chỉ đọc sau mỗi thao tác; không gửi dữ liệu tới Supabase/DB chung và không chạy `sqlnew.md`.
- Trước lượt xác nhận cuối, chỉ các gói/voucher tổng hợp từ những lần chạy thử trước được xóa khỏi DB cô lập; không có subscription nào. Ảnh cuối chỉ còn dữ liệu của lượt PASS.
- Sau test, backend/frontend proxy đã dừng và PostgreSQL container cô lập đã được gỡ. Tự động review chặn xóa đệ quy thư mục tạm (`C:\Users\FPTSHOP\AppData\Local\Temp\SBA301_F1_E2E_mw4ztlb5` và `_private`) với thông báo `blocked by policy`; các thư mục đó còn log và ảnh PNG tổng hợp 169 byte, nằm ngoài repository.
- Frontend production build PASS: Vite `8.3.4`, 438 modules. Dùng config build tạm không nạp `loadEnv`; config tạm đã được xóa sau build.
- Backend health sau khi chạy: HTTP `200`, JSON `data.status = "UP"`.

## Kết quả theo chức năng

| Luồng | Kết quả | Bằng chứng chính |
|---|---|---|
| Đăng ký khách hàng | PASS | HTTP `201`; PostgreSQL có role `CUSTOMER`, status `ACTIVE`, KYC ban đầu `NONE`. |
| Đăng nhập khách hàng | PASS | HTTP `200`; role/status trong PostgreSQL giữ đúng. |
| Cập nhật hồ sơ | PASS | HTTP `200`; `zalo_phone`, `contact_note` lưu đúng, tên và số điện thoại gốc không đổi. |
| Upload KYC | PASS | CCCD, GPLX và hộ chiếu được upload bằng ảnh PNG tổng hợp; các hàng mới được lưu `PENDING`. |
| Admin duyệt KYC | PASS | CCCD và GPLX chuyển `APPROVED`; người duyệt được lưu; KYC khách hàng thành `VERIFIED`; ảnh riêng tư mở được trong trang admin. |
| Admin từ chối KYC | PASS | Hộ chiếu chuyển `REJECTED`; lý do từ chối và KYC trạng thái `REJECTED` được lưu. |
| Hồ sơ tài xế | PASS | Eligibility API nhận KYC `VERIFIED` và GPLX hợp lệ; tạo hồ sơ thành công, DB lưu driver `PENDING`. `eligibleNow` trước khi có hồ sơ là false theo policy hiện tại (`DRIVER_PROFILE_MISSING`). |
| Tài khoản ngân hàng | PASS | Tạo 2 tài khoản; số tài khoản có số 0 đầu được giữ nguyên; chỉ một tài khoản mặc định và chuyển mặc định đúng. |
| Admin gói đăng tin | PASS | Tạo 2 gói active, 1 inactive và cập nhật một gói; DB khớp giá, thời hạn, priority, mô tả và trạng thái. |
| Bảng giá công khai | PASS | Frontend lấy từ API; chỉ hiển thị gói active và xếp theo priority giảm dần. |
| Admin voucher | PASS | Tạo, sửa mô tả/quota, tắt và bật lại; từng thay đổi được xác nhận trong DB. |
| Voucher khả dụng theo gói | PASS | Browser gọi API với session khách hàng: voucher inactive và voucher không đạt giá tối thiểu bị loại; voucher active còn hạn và phù hợp giá gói được trả về. DTO không lộ bộ đếm/quota nội bộ. |
| Hai quyết định KYC đồng thời | SKIPPED theo yêu cầu | Không chạy concurrency test trong lượt này. |

Playwright cuối cùng: **1 test PASS, 0 FAIL**; bộ kiểm tra ghi **25 PASS và 1 SKIPPED** trong [F1_E2E_PLAYWRIGHT_RESULTS.json](F1_E2E_PLAYWRIGHT_RESULTS.json). Maven `clean verify` không chạy trong lượt E2E này nên không đưa ra kết luận về toàn bộ unit/integration suite.

## Lỗi nghiệp vụ đã sửa

Trong lần chạy đầu qua KYC, gửi cùng một ảnh mặt trước cho giấy tờ tiếp theo bị HTTP `400`: sau khi gửi thành công, React xóa state ảnh nhưng input file trong DOM vẫn giữ file cũ. Chọn lại cùng file không phát sự kiện `change`, nên request tiếp theo thiếu `frontImage`.

Đã cập nhật [VerificationForm.jsx](../../carrental-FE/src/components/account/VerificationForm.jsx) để xóa giá trị hai input file khi submission thành công. Frontend đã build lại và toàn bộ Playwright E2E chạy lại PASS. Đây là thay đổi source duy nhất trong lượt này.

Các lần dừng trước đó còn lại do harness: kỳ vọng sai KYC ban đầu (`NONE` theo code/schema), số điện thoại test bị dùng lại, nhầm `404` hồ sơ tài xế chưa tồn tại với eligibility, và dữ liệu voucher/gói còn từ các lần chạy thử trong chính DB cô lập. Đã điều chỉnh fixture/assertion theo hợp đồng ứng dụng; không sửa backend vì các trường hợp đó không phải lỗi nghiệp vụ.

## Ảnh chụp

- [01 — Đăng ký](F1_E2E_Screenshots/01-customer-registered.png)
- [02 — Hồ sơ sau cập nhật](F1_E2E_Screenshots/02-customer-profile-updated.png)
- [03 — KYC chờ duyệt](F1_E2E_Screenshots/03-customer-kyc-pending.png)
- [04 — Admin duyệt KYC](F1_E2E_Screenshots/04-admin-kyc-approved.png)
- [05 — Admin từ chối KYC](F1_E2E_Screenshots/05-admin-kyc-rejected.png)
- [06 — Hồ sơ tài xế](F1_E2E_Screenshots/06-driver-profile.png)
- [07 — Tài khoản ngân hàng](F1_E2E_Screenshots/07-bank-accounts.png)
- [08 — Admin gói đăng tin](F1_E2E_Screenshots/08-admin-packages.png)
- [09 — Bảng giá công khai](F1_E2E_Screenshots/09-public-packages.png)
- [10 — Admin voucher](F1_E2E_Screenshots/10-admin-vouchers.png)
- [11 — Bảng giá sau kiểm tra voucher](F1_E2E_Screenshots/11-public-packages-after-voucher-check.png)

## File được tạo/sửa và lệnh

- Sửa `carrental-FE/src/components/account/VerificationForm.jsx`: reset input file sau submit thành công.
- Tạo `carrental-FE/playwright.function1.config.js`: cấu hình browser test riêng, không tự chạy Vite hay nạp `.env`.
- Tạo `carrental-FE/tests/function1-browser-e2e.spec.js`: thao tác UI và xác nhận dữ liệu DB cô lập.
- Tạo `docs/reports/F1_E2E_PLAYWRIGHT_RESULTS.json`, 11 screenshot và báo cáo này.
- Build (chạy tại `carrental-FE`): `.\node_modules\.bin\vite.cmd build --config vite.f1e2e.config.js` — PASS.
- E2E: trong `carrental-FE`, đặt `F1_E2E_DB_CONTAINER` và `F1_E2E_RUNTIME_DIR` trỏ tới fixture của lượt chạy, sau đó chạy `.\node_modules\.bin\playwright.cmd test --config playwright.function1.config.js tests/function1-browser-e2e.spec.js` — lần cuối PASS, 1/1.
- Health: `Invoke-WebRequest http://127.0.0.1:8080/api/health` — HTTP `200`, `UP`.

## Phạm vi còn chưa kiểm chứng

- Không kiểm thử mua gói, thanh toán hay tạo `car_subscription`; đó là luồng Function 3. Do đó quota voucher sau khi người dùng đã tiêu lượt chưa được E2E này mô phỏng. Với khách hàng test chưa có subscription, API trả voucher phù hợp và không gửi quota nội bộ ra frontend.
- Không chạy Maven full suite và không chạy concurrency/stress KYC. Race khi hai admin cùng quyết định một hồ sơ vẫn là lỗi đã biết, được giữ ngoài phạm vi lượt này.
- Không dùng nhà cung cấp ngân hàng ngoài; tài khoản được xác nhận theo luồng CRUD và dữ liệu local của ứng dụng.

## Git và bảo toàn thay đổi

- Branch vẫn là `feature/function_01`; không commit/push.
- Worktree đã dirty trước khi làm. Các thay đổi có sẵn được giữ nguyên; không reset, checkout, stash hoặc clean.
- Trạng thái cuối khi lập báo cáo: **36 tracked files modified, 34 untracked entries**; trong đó có các file/chức năng F1new đang chờ review cùng các file E2E liệt kê ở trên. `git diff --stat` toàn worktree: 36 tracked files changed, 807 insertions, 103 deletions; thống kê này gồm thay đổi có từ trước, không chỉ lượt E2E.
- Không thay đổi backend source, schema/reference hoặc migration. Không đọc `.env`, không kết nối DB chung, không commit/push.
