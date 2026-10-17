import { test, expect } from "@playwright/test";

test("Account dropdown supports keyboard navigation, Escape, and outside clicks", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cardb:session:v1", "demo"));
    await page.goto("/tai-khoan");
    const toggle = page.locator("header").getByRole("button", { name: "Tài khoản Nguyễn Hoàng Minh", exact: true });
    const menu = page.locator("#account-menu");
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(menu).toBeVisible();
    const profile = menu.getByRole("link", { name: "Hồ sơ cá nhân", exact: true });
    await expect(profile).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("link", { name: "Đơn thuê xe", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(menu).toBeVisible();
    await page.locator(".profile-columns").click({ position: { x: 5, y: 5 } });
    await expect(menu).toBeHidden();
});

for (const width of [375, 1440]) {
    test(`Modal traps focus and restores it when dismissed at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/tai-khoan/don-thue?status=pending");
        const trigger = page.getByRole("link", { name: "Chi tiết đơn thuê VinFast VF 9 Plus AWD", exact: true });
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleName("Chi tiết đơn thuê");
        const bounds = await dialog.locator(".modal-content").boundingBox();
        expect(bounds.width).toBeLessThanOrEqual(width - 30);
        expect(bounds.x).toBeGreaterThanOrEqual(15);
        for (let i = 0; i < 4; i++) {
            await page.keyboard.press("Tab");
            await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
        }
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.locator(".cardb-modal").click({ position: { x: 3, y: 3 } });
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
    });
}
