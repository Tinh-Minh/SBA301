import { test, expect } from "@playwright/test";
test("Banks show only three trailing digits and support adding and changing defaults", async ({ page }) => {
    await page.goto("/tai-khoan/ngan-hang");
    await expect(page.getByText("••• 982", { exact: true })).toBeVisible();
    await expect(page.getByText("••• 456", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Xem chi tiết", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Chỉnh sửa", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Đặt làm mặc định", exact: true }).click();
    await expect(page).toHaveURL(/ngan-hang\/mac-dinh$/);
    await page.getByRole("button", { name: "Xác nhận thay đổi", exact: true }).click();
    await expect(page).toHaveURL(/tai-khoan\/ngan-hang$/);
    await page.getByRole("button", { name: "+ Thêm tài khoản ngân hàng", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("Thêm tài khoản ngân hàng");
    await expect(page.locator("#account-number")).toBeEditable();
});

test("Return inspection reaches dispute and returns to its order", async ({ page }) => {
    await page.goto("/ban-giao/tra-xe");
    await page.getByRole("button", { name: "Yêu cầu xem xét khoản phí", exact: true }).click();
    await expect(page).toHaveURL(/tranh-chap$/);
    await page.getByRole("button", { name: "Quay lại chi tiết đơn", exact: true }).click();
    await expect(page).toHaveURL(/don-thue\/CDB-ORD-20261026-904$/);
});
test("History supports rebooking and status filtering", async ({ page }) => {
    await page.goto("/tai-khoan/lich-su");
    await page.getByRole("button", { name: "Đã hủy (1)", exact: true }).click();
    await expect(page.locator('[data-trip-card]:visible')).toHaveCount(1);
    await expect(page.locator('[data-trip-card]:visible')).toContainText("Đã hủy");
    await page.getByRole("button", { name: "Tất cả (3)", exact: true }).click();
    await expect(page.locator('[data-trip-card]:visible')).toHaveCount(3);
    await page.getByRole("link", { name: "Đặt lại xe này", exact: true }).first().click();
    await expect(page).toHaveURL(/xe\/vinfast-vf8-plus-2024$/);
});
test("Trips filter statuses and show empty results", async ({ page }) => {
    await page.goto("/chuyen-xe-cua-toi");
    await page.getByRole("button", { name: /^Đã hủy/ }).click();
    await expect(page.locator('[data-trip-card]:visible')).toHaveCount(1);
    await page.getByRole("button", { name: /^Hết hạn/ }).click();
    await expect(page.locator('[data-trip-card]:visible')).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Chưa có chuyến xe");
});
test("Voucher removal and application update checkout amounts", async ({ page }) => {
    await page.goto("/dat-xe/xac-nhan");
    await page.getByRole("button", { name: "Hủy mã", exact: true }).click();
    await expect(page.locator('[data-checkout-total="currency"]')).toHaveText("3.900.000 đ");
    await expect(page.locator("#voucher-status-box")).toBeHidden();
    await page.locator("#voucher-input").fill("CARDBWELCOME");
    await page.locator("#btn-apply-voucher").click();
    await expect(page.locator('[data-checkout-total="currency"]')).toHaveText("3.700.000 đ");
    await expect(page.locator("#voucher-status-box")).toBeVisible();
});
test("Profile breadcrumbs and license link use profile pages", async ({ page }) => {
    await page.goto("/tai-khoan/ho-so-tai-xe");
    await page.getByRole("link", { name: /Xem giấy phép lái xe/ }).click();
    await expect(page).toHaveURL(/tai-khoan\/xac-minh#card-gplx$/);
    await page.getByRole("link", { name: "Hồ sơ & Tài khoản", exact: true }).click();
    await expect(page).toHaveURL(/tai-khoan$/);
});
test("History downloads a report and evidence can be removed", async ({ page }) => {
    await page.goto("/tai-khoan/lich-su");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Xuất CSV", exact: true }).click();
    expect((await download).suggestedFilename()).toBe("cardb-lich-su.csv");
    await page.goto("/tranh-chap");
    await page.getByRole("button", { name: "Xóa tệp", exact: true }).click();
    await expect(page.locator("[data-attachment]")).toHaveCount(0);
    await expect(page.locator("#attachment-count")).toContainText("(0)");
});
