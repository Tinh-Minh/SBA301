import { test, expect } from "@playwright/test";

async function scrollTo(page, top) {
    await expect(page.locator("[data-trip-card]").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), top);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(top);
}

for (const width of [375, 1440]) {
    test(`Trip filters and details keep the current scroll position at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto("/tai-khoan/don-thue");
        await scrollTo(page, 160);
        // Dispatch without Playwright scrolling the filter into view first.
        await page.getByRole("button", { name: "Đã xác nhận (2)", exact: true }).dispatchEvent("click");
        await expect(page.locator("[data-trip-card]")).toHaveCount(2);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(160);
        await page.locator("[data-trip-card] h2 a").first().dispatchEvent("click");
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(160);
    });
}

test("Returning through profile navigation and reloading restores each page position", async ({ page }) => {
    await page.goto("/tai-khoan/don-thue");
    await expect(page.locator("[data-trip-toolbar]")).toBeVisible();
    expect(await page.locator("[data-trip-toolbar]").evaluate(el => Boolean(el.nextElementSibling.querySelector("[data-trip-card]")))).toBe(true);
    await scrollTo(page, 320);
    await page.locator('[data-purpose="account-sidebar"] a[href="/tai-khoan/lich-su"]').dispatchEvent("click");
    await expect(page).toHaveURL(/tai-khoan\/lich-su$/);
    await scrollTo(page, 120);
    await page.locator('[data-purpose="account-sidebar"] a[href="/tai-khoan/don-thue"]').dispatchEvent("click");
    await expect(page).toHaveURL(/tai-khoan\/don-thue$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(320);
    await page.goBack();
    await expect(page).toHaveURL(/tai-khoan\/lich-su$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(120);
    await page.reload();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(120);
});
