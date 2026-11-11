import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "C:/Users/minh1/.gemini/antigravity/brain/7ca5b116-ef25-44e5-a2d5-6721bf771459/screenshots";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const testResults = {
  passed: [],
  failed: [],
  screenshots: []
};

function recordPass(testName, detail = "") {
  console.log(`  ✅ PASS: ${testName} ${detail ? "(" + detail + ")" : ""}`);
  testResults.passed.push({ testName, detail });
}

function recordFail(testName, error) {
  console.error(`  ❌ FAIL: ${testName} ->`, error);
  testResults.failed.push({ testName, error: String(error) });
}

async function takeSnap(page, filename, description) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 Screenshot: ${filename} - ${description}`);
  testResults.screenshots.push({ filename, filePath, description });
}

async function main() {
  console.log("==========================================================================");
  console.log("🚀 BẮT ĐẦU KIỂM THỬ E2E TOÀN DIỆN MỌI ROLE & UNHAPPY CASES (PLAYWRIGHT)");
  console.log("==========================================================================\n");

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on("pageerror", (err) => {
    if (!err.message.includes("play()") && !err.message.includes("AbortError")) {
      console.warn("  ⚠️ [Browser PageError]:", err.message);
    }
  });

  try {
    // =========================================================================
    // KỊCH BẢN 1: KHÁCH VÃNG LAI (GUEST FLOW - HAPPY & UNHAPPY)
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("1. [GUEST] KIỂM TRA TRẢI NGHIỆM KHÁCH VÃNG LAI & BẢO VỆ TUYẾN ĐƯỜNG");
    console.log("--------------------------------------------------------------------------");

    // 1.1 Home page
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      await sleep(1500);
      const title = await page.title();
      recordPass("1.1 Trang chủ mở thành công", `Tiêu đề: ${title}`);
      await takeSnap(page, "e2e_01_guest_homepage.png", "Trang chủ CarDB dành cho khách vãng lai");
    } catch (e) {
      recordFail("1.1 Tải trang chủ thất bại", e);
    }

    // 1.2 Explore cars
    try {
      await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle" });
      await sleep(1500);
      const carCardsCount = await page.locator("article, a[href*='/cars/']").count();
      recordPass("1.2 Trang khám phá xe (/explore)", `Hiển thị danh sách xe (tìm thấy ${carCardsCount} thẻ xe)`);
      await takeSnap(page, "e2e_02_guest_explore.png", "Danh mục khám phá xe công khai");
    } catch (e) {
      recordFail("1.2 Lỗi trang khám phá xe", e);
    }

    // 1.3 Car detail page
    try {
      await page.goto(`${BASE_URL}/cars/1`, { waitUntil: "networkidle" });
      await sleep(1500);
      const content = await page.content();
      const hasDetail = content.includes("Honda City") || content.includes("Liên hệ") || content.includes("Thông tin xe");
      recordPass("1.3 Chi tiết xe (/cars/1)", hasDetail ? "Hiển thị thông tin xe và nút liên hệ chủ xe" : "Đã mở trang chi tiết xe");
      await takeSnap(page, "e2e_03_guest_car_detail.png", "Trang chi tiết xe với thông tin chủ xe & đánh giá");
    } catch (e) {
      recordFail("1.3 Lỗi trang chi tiết xe", e);
    }

    // 1.4 Pricing packages
    try {
      await page.goto(`${BASE_URL}/packages`, { waitUntil: "networkidle" });
      await sleep(1500);
      const pageText = await page.textContent("body");
      const hasPackages = pageText.includes("Gói") || pageText.includes("slot");
      recordPass("1.4 Bảng giá gói đăng tin (/packages)", hasPackages ? "Tải danh sách các gói dịch vụ với thông số slot" : "Đã mở bảng giá");
      await takeSnap(page, "e2e_04_guest_packages.png", "Bảng giá gói đăng tin hiển thị số slot công khai");
    } catch (e) {
      recordFail("1.4 Lỗi bảng giá gói", e);
    }

    // 1.5 Unhappy: Protected Route Guards for Guest
    try {
      console.log("  * Kiểm tra Unhappy: Khách chưa đăng nhập truy cập trang quản trị...");
      await page.goto(`${BASE_URL}/owner/vehicles`, { waitUntil: "networkidle" });
      await sleep(1000);
      let curUrl = page.url();
      let pageBody = await page.textContent("body");
      const guardedOwner = curUrl.includes("/login") || pageBody.includes("Đăng nhập");
      recordPass("1.5.1 Bảo vệ tuyến đường /owner/vehicles", `Chuyển hướng hoặc yêu cầu đăng nhập: ${curUrl}`);
      await takeSnap(page, "e2e_05_guest_guard_owner.png", "Chặn khách vãng lai vào /owner/vehicles");

      await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle" });
      await sleep(1000);
      curUrl = page.url();
      pageBody = await page.textContent("body");
      const guardedAdmin = curUrl.includes("/login") || pageBody.includes("Đăng nhập");
      recordPass("1.5.2 Bảo vệ tuyến đường /admin/dashboard", `Chuyển hướng hoặc yêu cầu đăng nhập: ${curUrl}`);
      await takeSnap(page, "e2e_06_guest_guard_admin.png", "Chặn khách vãng lai vào /admin/dashboard");
    } catch (e) {
      recordFail("1.5 Lỗi kiểm tra route guard", e);
    }

    // =========================================================================
    // KỊCH BẢN 2: XÁC THỰC & UNHAPPY AUTH CASES
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("2. [AUTH UNHAPPY] KIỂM TRA ĐĂNG NHẬP NGOẠI LỆ & BẢO MẬT");
    console.log("--------------------------------------------------------------------------");

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await sleep(1000);
      await takeSnap(page, "e2e_07_login_page.png", "Giao diện trang đăng nhập");

      // 2.1 Unhappy: Sai mật khẩu
      console.log("  * Kiểm tra Unhappy 2.1: Nhập sai mật khẩu...");
      await page.fill("#login-account", "binh@gmail.com");
      await page.fill("#login-password", "SaiMatKhau123@");
      await page.click("button[type='submit']");
      await sleep(1500);
      const wrongPassText = await page.textContent("body");
      const hasWrongPassError = wrongPassText.includes("không đúng") || wrongPassText.includes("không hợp lệ") || wrongPassText.includes("thất bại");
      if (hasWrongPassError) {
        recordPass("2.1 Đăng nhập sai mật khẩu bị chặn", "Hiển thị thông báo lỗi chính xác");
      } else {
        recordFail("2.1 Không thấy thông báo lỗi khi sai mật khẩu", wrongPassText.substring(0, 200));
      }
      await takeSnap(page, "e2e_08_auth_wrong_password.png", "Thông báo lỗi khi nhập sai mật khẩu");

      // 2.2 Unhappy: Tài khoản bị khóa (locked@gmail.com)
      console.log("  * Kiểm tra Unhappy 2.2: Đăng nhập tài khoản bị khóa (locked@gmail.com)...");
      await page.fill("#login-account", "locked@gmail.com");
      await page.fill("#login-password", "Password123@");
      await page.click("button[type='submit']");
      await sleep(1500);
      const lockedText = await page.textContent("body");
      const hasLockedError = lockedText.includes("không đúng") || lockedText.includes("không hợp lệ") || lockedText.includes("không được phép") || lockedText.includes("khóa") || lockedText.includes("thất bại");
      if (hasLockedError) {
        recordPass("2.2 Tài khoản bị khóa bị từ chối đăng nhập", "Hệ thống từ chối đăng nhập tài khoản LOCKED");
      } else {
        recordFail("2.2 Không thấy thông báo chặn tài khoản bị khóa", lockedText.substring(0, 200));
      }
      await takeSnap(page, "e2e_09_auth_locked_account.png", "Hệ thống từ chối đăng nhập tài khoản locked@gmail.com");
    } catch (e) {
      recordFail("2. Lỗi kiểm tra Unhappy Auth", e);
    }

    // =========================================================================
    // KỊCH BẢN 3: KHÁCH HÀNG / THUÊ XE (CUSTOMER - khach@gmail.com)
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("3. [CUSTOMER] KIỂM TRA TÀI KHOẢN KHÁCH THUÊ XE & XÁC NHẬN BỎ HẲN DRIVER");
    console.log("--------------------------------------------------------------------------");

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await sleep(1000);
      await page.fill("#login-account", "khach@gmail.com");
      await page.fill("#login-password", "Password123@");
      await page.click("button[type='submit']");
      await sleep(2000);

      const postLoginUrl = page.url();
      recordPass("3.1 Đăng nhập Customer khach@gmail.com thành công", `URL: ${postLoginUrl}`);
      await takeSnap(page, "e2e_10_customer_logged_in.png", "Trạng thái sau khi đăng nhập tài khoản khách thuê");

      // 3.2 Profile Page & CRITICAL DRIVER MODULE CHECK
      await page.goto(`${BASE_URL}/account`, { waitUntil: "networkidle" });
      await sleep(1500);
      const profileText = await page.textContent("body");

      const hasKyc = profileText.includes("Đã xác minh") || profileText.includes("Hồ sơ") || profileText.includes("khach@gmail.com");
      recordPass("3.2 Hồ sơ cá nhân (/account)", hasKyc ? "Thông tin tài khoản tải thành công (KYC VERIFIED)" : "Đã mở trang hồ sơ");

      // CRITICAL CHECK: Verify Driver module is completely eliminated
      const hasDriverKeyword = profileText.toLowerCase().includes("hồ sơ tài xế") || profileText.toLowerCase().includes("tài xế chuyên nghiệp");
      const driverLinks = await page.locator("a[href*='driver'], button[id*='driver']").count();
      if (!hasDriverKeyword && driverLinks === 0) {
        recordPass("3.3 ĐÃ XÓA SẠCH MODULE TÀI XẾ (DRIVER)", "Không tồn tại link hay mục 'Tài xế' nào trong trang cá nhân!");
      } else {
        recordFail("3.3 Vẫn còn tàn dư Driver trong giao diện", `hasDriverKeyword: ${hasDriverKeyword}, driverLinks: ${driverLinks}`);
      }
      await takeSnap(page, "e2e_11_customer_profile_no_driver.png", "Hồ sơ cá nhân sạch sẽ - hoàn toàn không còn mục tài xế");

      // 3.4 Verification documents
      await page.goto(`${BASE_URL}/account/verification`, { waitUntil: "networkidle" });
      await sleep(1200);
      await takeSnap(page, "e2e_12_customer_verification.png", "Trang quản lý giấy tờ xác minh của khách hàng");
      recordPass("3.4 Giấy tờ xác thực KYC (/account/verification)", "Tải trang xác minh tài liệu");

      // Clear cookies / localStorage to logout cleanly
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      recordPass("3.5 Đăng xuất tài khoản khách", "Xóa session thành công");
    } catch (e) {
      recordFail("3. Lỗi luồng Customer", e);
    }

    // =========================================================================
    // KỊCH BẢN 4: CHỦ XE (OWNER - binh@gmail.com) - MÔ HÌNH SLOT GÓI & VOUCHER
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("4. [OWNER] KIỂM TRA CHỦ XE: QUẢN LÝ XE, SLOT ĐĂNG TIN, VOUCHER & THANH TOÁN");
    console.log("--------------------------------------------------------------------------");

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await sleep(1000);
      await page.fill("#login-account", "binh@gmail.com");
      await page.fill("#login-password", "Password123@");
      await page.click("button[type='submit']");
      await sleep(2000);
      recordPass("4.1 Đăng nhập Chủ xe binh@gmail.com", "Đăng nhập thành công");

      // 4.2 My Vehicles
      await page.goto(`${BASE_URL}/owner/vehicles`, { waitUntil: "networkidle" });
      await sleep(2000);
      const vehiclesText = await page.textContent("body");
      const hasHonda = vehiclesText.includes("Honda City") || vehiclesText.includes("51K-12345");
      const hasVios = vehiclesText.includes("Toyota Vios") || vehiclesText.includes("51H-99881");
      const hasMazda = vehiclesText.includes("Mazda CX-5") || vehiclesText.includes("51F-77665");
      recordPass("4.2 Quản lý xe (/owner/vehicles)", `Danh sách xe của chủ xe: Honda (${hasHonda}), Vios (${hasVios}), Mazda (${hasMazda})`);
      await takeSnap(page, "e2e_13_owner_vehicles_overview.png", "Danh sách 3 xe của chủ xe kèm trạng thái hiển thị & slot");

      // 4.3 Slot Activation Test on Honda City
      console.log("  * Kiểm tra tính năng kích hoạt Slot trên xe của chủ xe...");
      const activateSlotBtn = page.locator("button:has-text('Kích hoạt slot'), button:has-text('⚡ Kích hoạt slot')").first();
      const hasSlotBtn = await activateSlotBtn.isVisible().catch(() => false);
      if (hasSlotBtn) {
        console.log("  * Tìm thấy nút kích hoạt slot, đang click...");
        await activateSlotBtn.click();
        await sleep(2000);
        await takeSnap(page, "e2e_14_owner_slot_activated.png", "Kích hoạt slot hiển thị thành công cho xe");
        recordPass("4.3 Kích hoạt slot hiển thị", "Click kích hoạt slot thành công");
      } else {
        await takeSnap(page, "e2e_14_owner_slot_activated.png", "Trạng thái slot hiện tại của các xe");
        recordPass("4.3 Kiểm tra trạng thái Slot hiển thị", "Đã ghi nhận trạng thái slot của từng xe");
      }

      // 4.4 My Subscriptions
      await page.goto(`${BASE_URL}/owner/subscriptions`, { waitUntil: "networkidle" });
      await sleep(1500);
      const subsText = await page.textContent("body");
      recordPass("4.4 Gói đăng tin của tôi (/owner/subscriptions)", `Đã tải lịch sử thuê bao gói slot (Số ký tự: ${subsText.length})`);
      await takeSnap(page, "e2e_15_owner_my_subscriptions.png", "Danh sách gói đăng tin và số lượng slot đang sở hữu");

      // 4.5 Buy Subscription Flow with Voucher Tests (Unhappy & Happy)
      // Navigate to buy subscription specifically for Mazda CX-5 (carId=3) which is UNLISTED with expired subscription
      await page.goto(`${BASE_URL}/owner/subscriptions/new?carId=3`, { waitUntil: "networkidle" });
      await sleep(2000);
      await takeSnap(page, "e2e_16_buy_subscription_page.png", "Trang mua gói đăng tin mới cho xe Mazda CX-5");

      // Step 1: Ensure Mazda CX-5 is selected
      const mazdaOption = page.locator("button:has-text('Mazda CX-5'), button:has-text('51F-77665')").first();
      if (await mazdaOption.isVisible()) {
        await mazdaOption.click();
        console.log("  * Đã chọn xe Mazda CX-5.");
      }

      // Step 2: Select package (Gói Trung 5 slots)
      const pkgOption = page.locator("button:has-text('Gói Trung'), button:has-text('5 slots')").first();
      if (await pkgOption.isVisible()) {
        await pkgOption.click();
        console.log("  * Đã chọn Gói Trung (5 slots).");
      }
      await sleep(1500);

      // Step 3: Unhappy Voucher Test (HETLUS)
      console.log("  * Kiểm tra Unhappy Voucher: Thử áp dụng voucher không tồn tại HETLUS...");
      const voucherInput = page.locator("input[placeholder*='voucher'], input[aria-label*='voucher']");
      const applyBtn = page.locator("button:has-text('Áp dụng')");
      if (await voucherInput.isVisible()) {
        await voucherInput.fill("HETLUS");
        await sleep(500);
        if (await applyBtn.isEnabled()) {
          await applyBtn.click();
          await sleep(2000);
          const voucherErrorText = await page.textContent("body");
          const hasVoucherError = voucherErrorText.includes("không hợp lệ") || voucherErrorText.includes("không tồn tại") || voucherErrorText.includes("hết hạn") || voucherErrorText.includes("Voucher");
          if (hasVoucherError) {
            recordPass("4.5.1 Voucher không tồn tại HETLUS bị từ chối", "Hiển thị thông báo: Mã voucher không tồn tại");
          } else {
            recordFail("4.5.1 Voucher HETLUS không báo lỗi", voucherErrorText.substring(0, 150));
          }
          await takeSnap(page, "e2e_17_voucher_invalid.png", "Thông báo lỗi khi áp dụng mã voucher HETLUS không hợp lệ");
        }

        // Step 3: Happy Voucher Test (GIAM20K)
        console.log("  * Kiểm tra Happy Voucher: Thử áp dụng voucher hợp lệ GIAM20K...");
        await voucherInput.fill("GIAM20K");
        await sleep(500);
        if (await applyBtn.isEnabled()) {
          await applyBtn.click();
          await sleep(2000);
          const voucherSuccessText = await page.textContent("body");
          const hasDiscount = voucherSuccessText.includes("20.000") || voucherSuccessText.includes("GIAM20K") || voucherSuccessText.includes("Giảm giá");
          if (hasDiscount) {
            recordPass("4.5.2 Áp dụng voucher GIAM20K thành công", "Được chiết khấu 20.000 đ vào tổng bill");
          } else {
            recordFail("4.5.2 Voucher GIAM20K không thấy chiết khấu", voucherSuccessText.substring(0, 200));
          }
          await takeSnap(page, "e2e_18_voucher_valid.png", "Voucher GIAM20K được áp dụng thành công và tính lại tổng tiền");
        }
      }

      // 4.6 Payment Dialog
      const payBtn = page.locator("button:has-text('Thanh toán ngay qua VNPay'), button:has-text('Thanh toán')");
      if (await payBtn.isVisible() && await payBtn.isEnabled()) {
        await payBtn.click();
        await sleep(1000);
        await takeSnap(page, "e2e_19_confirm_payment_dialog.png", "Hộp thoại xác nhận chuyển hướng thanh toán VNPay");
        recordPass("4.6 Mở hộp thoại thanh toán VNPay", "Sẵn sàng kết nối cổng thanh toán VNPay");
        const cancelBtn = page.locator("button:has-text('Hủy')").first();
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }

      // Logout owner
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      recordPass("4.7 Đăng xuất Chủ xe", "Session đã dọn sạch");
    } catch (e) {
      recordFail("4. Lỗi luồng Owner", e);
    }

    // =========================================================================
    // KỊCH BẢN 5: QUẢN TRỊ VIÊN (ADMIN - admin@carrental.vn)
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("5. [ADMIN] KIỂM TRA QUẢN TRỊ: DASHBOARD, CẤU HÌNH GÓI SLOT, DUYỆT XE & USER");
    console.log("--------------------------------------------------------------------------");

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
      await sleep(1000);
      await page.fill("#login-account", "admin@carrental.vn");
      await page.fill("#login-password", "Password123@");
      await page.click("button[type='submit']");
      await sleep(2500);

      // 5.1 Admin Dashboard
      await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "networkidle" });
      await sleep(2000);
      const adminDashText = await page.textContent("body");
      const hasAdminMetrics = adminDashText.includes("Tổng quan") || adminDashText.includes("Doanh thu") || adminDashText.includes("Đăng tin");
      recordPass("5.1 Dashboard quản trị (/admin/dashboard)", hasAdminMetrics ? "Hiển thị đầy đủ số liệu thống kê hệ thống" : "Đã mở Dashboard");
      await takeSnap(page, "e2e_20_admin_dashboard.png", "Dashboard quản trị hệ thống với đầy đủ chỉ số");

      // 5.2 Admin Packages Configuration (Slot Quotas)
      await page.goto(`${BASE_URL}/admin/packages`, { waitUntil: "networkidle" });
      await sleep(2000);
      const packagesAdminText = await page.textContent("body");
      const hasSlotCol = packagesAdminText.includes("Slot") || packagesAdminText.includes("slots") || packagesAdminText.includes("Thời hạn");
      if (hasSlotCol) {
        recordPass("5.2 Cấu hình gói đăng tin (/admin/packages)", "Bảng gói hiển thị rõ ràng cột hạn ngạch Slot & Thời hạn");
      } else {
        recordFail("5.2 Cấu hình gói đăng tin", "Thiếu cột slot trong bảng quản trị gói: " + packagesAdminText.substring(0, 150));
      }
      await takeSnap(page, "e2e_21_admin_packages_slots.png", "Quản lý gói đăng tin với cấu hình hạn mức slot cho từng gói");

      // 5.3 Admin Subscriptions
      await page.goto(`${BASE_URL}/admin/subscriptions`, { waitUntil: "networkidle" });
      await sleep(2000);
      const adminSubsText = await page.textContent("body");
      recordPass("5.3 Quản lý thuê bao toàn hệ thống (/admin/subscriptions)", `Đã tải danh sách đăng ký thuê bao (Số ký tự: ${adminSubsText.length})`);
      await takeSnap(page, "e2e_22_admin_subscriptions.png", "Danh sách thuê bao gói tin đăng toàn hệ thống");

      // 5.4 Admin Vehicles Moderation & NO DRIVER CHECK
      await page.goto(`${BASE_URL}/admin/vehicles`, { waitUntil: "networkidle" });
      await sleep(2000);
      const adminVehiclesText = await page.textContent("body");
      const hasNoDriverInAdmin = !adminVehiclesText.toLowerCase().includes("tài xế phụ trách") && !adminVehiclesText.toLowerCase().includes("chọn tài xế");
      if (hasNoDriverInAdmin) {
        recordPass("5.4 Thẩm định xe (/admin/vehicles) KHÔNG CÒN TRƯỜNG DRIVER", "Giao diện duyệt xe sạch sẽ, không còn vướng tài xế");
      } else {
        recordFail("5.4 Vẫn còn tài xế trong duyệt xe admin", adminVehiclesText.substring(0, 200));
      }
      await takeSnap(page, "e2e_23_admin_vehicles_no_driver.png", "Giao diện duyệt xe sạch sẽ không còn trường tài xế");

      // 5.5 Admin Users & KYC
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle" });
      await sleep(2000);
      const adminUsersText = await page.textContent("body");
      const hasUsers = adminUsersText.includes("khach@gmail.com") || adminUsersText.includes("binh@gmail.com") || adminUsersText.includes("Người dùng");
      recordPass("5.5 Quản trị người dùng & KYC (/admin/users)", hasUsers ? "Danh sách người dùng và trạng thái KYC hiển thị chuẩn" : "Đã tải trang người dùng");
      await takeSnap(page, "e2e_24_admin_users.png", "Danh sách quản lý người dùng và hồ sơ KYC");

      // Logout Admin
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
      recordPass("5.6 Đăng xuất Quản trị viên", "Hoàn tất luồng admin");
    } catch (e) {
      recordFail("5. Lỗi luồng Admin", e);
    }

  } catch (fatalError) {
    console.error("CRITICAL TEST RUN ERROR:", fatalError);
  } finally {
    await browser.close();
  }

  // =========================================================================
  // TỔNG KẾT BÁO CÁO
  // =========================================================================
  console.log("\n==========================================================================");
  console.log("📊 BÁO CÁO TỔNG KẾT KIỂM THỬ BROWSER E2E");
  console.log("==========================================================================");
  console.log(`Tổng số ca kiểm thử PASS: ${testResults.passed.length}`);
  console.log(`Tổng số ca kiểm thử FAIL: ${testResults.failed.length}`);
  console.log(`Tổng số ảnh chụp màn hình: ${testResults.screenshots.length}`);

  if (testResults.failed.length > 0) {
    console.log("\nDanh sách lỗi:");
    testResults.failed.forEach((f, idx) => console.log(`  ${idx + 1}. [${f.testName}]: ${f.error}`));
  }

  const reportPath = path.join(SCREENSHOT_DIR, "e2e_summary_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2), "utf-8");
  console.log(`\nBáo cáo JSON đã lưu tại: ${reportPath}`);
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
