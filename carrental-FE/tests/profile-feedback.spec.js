import { test, expect } from "@playwright/test";

for (const width of [375, 1440]) {
    test(`Payment action keeps readable text at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/tai-khoan/don-thue?status=confirmed&q=BMW");
        const pay = page.getByRole("link", { name: "Thanh toán ngay", exact: true });
        await expect(pay).toBeVisible();
        await expect(pay).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(pay).toHaveCSS("background-color", "rgb(252, 108, 38)");
        await pay.hover();
        await expect(pay).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(pay).toHaveCSS("background-color", "rgb(229, 91, 27)");
        await pay.click();
        await expect(page).toHaveURL(/thanh-toan\?order=CDB-ORD-20261102-418/);
    });
}

test("Refresh and export use the shared dismissible toast without moving the list", async ({ page }) => {
    await page.goto("/tai-khoan/don-thue");
    const list = page.locator('[data-trip-card]').first();
    const before = await list.boundingBox();
    await page.getByRole("button", { name: "Làm mới", exact: true }).click();
    const toast = page.locator(".app-toast");
    await expect(toast).toHaveText(/Đã làm mới danh sách chuyến xe/);
    expect(await list.boundingBox()).toEqual(before);
    expect(await toast.evaluate(el => el.closest(".profile-content") === null)).toBe(true);
    await toast.getByRole("button", { name: "Đóng thông báo", exact: true }).click();
    await expect(toast).toHaveCount(0);
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "Xuất CSV", exact: true }).click();
    await downloaded;
    await expect(toast).toHaveText(/Đã xuất 4 chuyến xe sang CSV/);
    await expect(toast).toHaveCount(0, { timeout: 6000 });
});
