import { test, expect } from "@playwright/test";
import routes from "./routes.json" with { type: "json" };
for (const width of [375, 768, 1440]) {
    test(`All CarDB screens render at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        for (const route of routes) {
            const response = await page.goto(route);
            expect(response?.status(), route).toBe(200);
            await expect(page.locator("main").first(), route).toBeVisible();
            const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
            expect(dimensions.scroll, route + JSON.stringify(dimensions)).toBeLessThanOrEqual(width + 1);
            await expect(page.locator("html")).toHaveAttribute("lang", "vi");
            const broken = await page.locator("main img").evaluateAll(images => images.filter(image => image.complete && !image.naturalWidth).map(image => image.src));
            expect(broken, route).toEqual([]);
        }
        expect(errors).toEqual([]);
    });
}
test("Mobile menu and homepage search navigate", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Mở menu", exact: true }).click();
    await page.locator("#mobile-navigation").getByRole("link", { name: "Khám phá xe", exact: true }).click();
    await expect(page).toHaveURL(/kham-pha-xe/);
    await page.goto("/");
    await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
    await expect(page).toHaveURL(/kham-pha-xe\?location=/);
});
test("Demo auth updates account navigation and persists", async ({ page }) => {
    await page.goto("/dang-nhap");
    await page.locator("#login-account").fill("demo");
    await page.locator("#login-password").fill("123");
    await page.locator("#view-login button[type='submit']").click();
    await expect(page).toHaveURL(/tai-khoan$/);
    const account = page.locator("header").getByRole("button", { name: "Tài khoản Nguyễn Hoàng Minh", exact: true });
    await expect(account).toBeVisible();
    await page.reload();
    await expect(account).toBeVisible();
    await account.click();
    await page.locator("#account-menu").getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await expect(page.locator("header").getByRole("link", { name: "Đăng nhập", exact: true })).toBeVisible();
});
test("FAQ, favorites, vehicle filters, and gallery work", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("details").first();
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");
    await page.locator('[data-action="favorite"]').first().click();
    await expect(page.locator('[data-favorite="true"]')).toHaveCount(1);
    await page.goto("/kham-pha-xe");
    await page.getByRole("button", { name: "Áp dụng bộ lọc", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Đã áp dụng bộ lọc" })).toBeVisible();
    await page.goto("/xe/vinfast-vf8-plus-2024");
    await page.locator("main img").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("Rental request connects to success and order pages", async ({ page }) => {
    await page.goto("/xe/vinfast-vf8-plus-2024");
    await page.getByRole("link", { name: "Tiến hành đặt xe ngay", exact: true }).click();
    await expect(page).toHaveURL(/dat-xe\/xac-nhan/);
    await page.locator("#btn-submit-booking").click();
    await expect(page).toHaveURL(/dat-xe\/thanh-cong/);
    await page.goto("/don-thue/CDB-ORD-20261026-904/da-xac-nhan");
    await page.getByRole("link", { name: /Thanh toán ngay/ }).click();
    await expect(page).toHaveURL(/thanh-toan$/);
});
test("Payment requires holding, early release never confirms", async ({ page }) => {
    let dialogs = 0;
    page.on("dialog", async (dialog) => { dialogs++; await dialog.dismiss(); });
    await page.goto("/thanh-toan");
    const confirm = page.getByRole("button", { name: "Giữ để xác nhận thanh toán", exact: true });
    await confirm.click();
    await expect(page).toHaveURL(/thanh-toan$/);
    await confirm.focus();
    await page.keyboard.down("Enter");
    await page.waitForTimeout(1800);
    await page.keyboard.up("Enter");
    await expect(page).toHaveURL(/thanh-toan\/thanh-cong/);
    expect(dialogs).toBe(0);
    await page.goto("/thanh-toan");
    const cancel = page.getByRole("button", { name: "Giữ để hủy đặt xe", exact: true });
    await cancel.focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(1800);
    await page.keyboard.up("Space");
    await expect(page).toHaveURL(/tai-khoan\/don-thue\?cancelled=1/);
});
test("Pointer hold confirms payment on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/thanh-toan");
    const button = page.getByRole("button", { name: "Giữ để xác nhận thanh toán", exact: true });
    await button.scrollIntoViewIfNeeded();
    const box = (await button.boundingBox());
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(400);
    await page.mouse.up();
    await expect(page).toHaveURL(/thanh-toan$/);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    await page.mouse.up();
    await expect(page).toHaveURL(/thanh-toan\/thanh-cong/);
});
test("Bank dialog, review, and dispute flows respond", async ({ page }) => {
    await page.goto("/tai-khoan/ngan-hang/them");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator("#account-number").fill("0123456789");
    await page.getByRole("button", { name: "Lưu tài khoản", exact: true }).click();
    await expect(page).toHaveURL(/tai-khoan\/ngan-hang$/);
    await page.goto("/danh-gia");
    await page.locator('[data-star="5"]').click();
    await page.locator("#review-content").fill("Xe sạch, nhận xe đúng giờ.");
    await page.locator("#submit-review-btn").click();
    await expect(page).toHaveURL(/tai-khoan\/lich-su$/);
    await page.goto("/tranh-chap");
    await page.locator("#dispute-detail").fill("Đề nghị đối chiếu lại ảnh bàn giao và khoản phí vệ sinh.");
    await page.locator("#submit-dispute-btn").click();
    await expect(page).toHaveURL(/don-thue\/CDB-ORD-20261026-904$/);
});
test("Document sections expand and order cancellation requires hold", async ({ page }) => {
    await page.goto("/tai-khoan/xac-minh/thu-gon");
    const card = page.locator("#card-cccd");
    const section = card.locator(".card-content");
    const toggle = card.getByRole("button").first();
    await expect(section).toBeHidden();
    await toggle.click();
    await expect(section).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.goto("/don-thue/CDB-ORD-20261026-904");
    await page.locator('[data-handler="toggleCancelModal"][data-args="true"]').first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const cancel = dialog.getByRole("button", { name: "Giữ để hủy đặt xe", exact: true });
    await cancel.click();
    await expect(dialog).toBeVisible();
    await cancel.focus();
    await page.keyboard.down("Enter");
    await page.waitForTimeout(1800);
    await page.keyboard.up("Enter");
    await expect(page).toHaveURL(/tai-khoan\/don-thue\?cancelled=1/);
});
test("Mobile discovery reaches checkout through vehicle booking", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
    await expect(page).toHaveURL(/kham-pha-xe/);
    await page.locator('a[href="/xe/vinfast-vf8-plus-2024"]').first().click();
    await page.getByRole("link", { name: "Tiến hành đặt xe ngay", exact: true }).click();
    await expect(page).toHaveURL(/dat-xe\/xac-nhan/);
    await expect(page.locator("#btn-submit-booking")).toBeVisible();
});
test("Profile navigation shares verification styling and selected route", async ({ page }) => {
    for (const width of [375, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/tai-khoan");
        for (const [name, path] of [["Thông tin cá nhân", "/tai-khoan"], ["Xác minh giấy tờ", "/tai-khoan/xac-minh"], ["Hồ sơ tài xế", "/tai-khoan/ho-so-tai-xe"], ["Tài khoản ngân hàng", "/tai-khoan/ngan-hang"], ["Đơn thuê xe", "/tai-khoan/don-thue"], ["Lịch sử chuyến đi", "/tai-khoan/lich-su"]]) {
            const nav = page.getByRole("navigation", { name: "Hồ sơ và tài khoản", exact: true });
            await nav.getByRole("link", { name: new RegExp(name) }).click();
            await expect(page).toHaveURL(new RegExp(path + "$"));
            await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute("href", path);
            await expect(nav.getByRole("link")).toHaveCount(6);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
    }
});
