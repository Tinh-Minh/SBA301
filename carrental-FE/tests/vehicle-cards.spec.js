import { test, expect } from "@playwright/test";
for (const width of [320, 375, 768, 1024, 1280, 1440]) {
    test(`Vehicle listing cards fit their labels and open as one target at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/kham-pha-xe");
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('[data-vehicle-card]')).toHaveCount(6);
        await expect(page.getByRole("link", { name: "Xem chi tiết", exact: true })).toHaveCount(0);
        const issues = await page.locator('[data-vehicle-card]').evaluateAll(cards => cards.flatMap(card => {
            const messages = [];
            const labels = card.querySelectorAll('.vehicle-card-badges > span');
            if (labels.length === 2 && labels[0].getBoundingClientRect().right > labels[1].getBoundingClientRect().left - 3) messages.push('Badges overlap');
            for (const span of card.querySelectorAll('span')) {
                if (span.children.length || !/\d[\d.,]*₫/.test(span.textContent)) continue;
                const bounds = span.getBoundingClientRect();
                const cardBounds = card.getBoundingClientRect();
                if (bounds.right > cardBounds.right - 4) messages.push('Price overflows');
            }
            return messages;
        }));
        expect(issues).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.locator('[data-vehicle-card] h3').first().click();
        await expect(page).toHaveURL(/xe\/vinfast-vf8-plus-2024$/);
    });
}
test("Home vehicle cards open on click while favorites remain independent", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const card = page.locator('[data-vehicle-card]').first();
    await card.getByRole("button", { name: "Lưu xe yêu thích", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(card.locator('[data-favorite="true"]')).toHaveCount(1);
    await expect(card.getByRole("button", { name: "Xem chi tiết", exact: true })).toHaveCount(0);
    await card.locator("h3").click();
    await expect(page).toHaveURL(/xe\/vinfast-vf8-plus-2024$/);
});
