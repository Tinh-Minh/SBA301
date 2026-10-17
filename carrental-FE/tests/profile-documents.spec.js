import { test, expect } from "@playwright/test";
for (const width of [375, 1440]) {
    test(`Identity documents start compact and collapsed at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/tai-khoan/xac-minh");
        const buttons = page.locator(".document-toggle");
        await expect(buttons).toHaveCount(3);
        for (const button of await buttons.all()) {
            await expect(button).toHaveAttribute("aria-expanded", "false");
            const content = page.locator(`#${await button.getAttribute("aria-controls")}`);
            await expect(content).toBeHidden();
            const geometry = await button.evaluate(el => {
                const title = el.querySelector('[title]');
                const badge = el.children[2];
                return { height: el.getBoundingClientRect().height, titleRight: title.getBoundingClientRect().right, badgeLeft: badge.getBoundingClientRect().left };
            });
            expect(geometry.height).toBeLessThan(90);
            expect(geometry.titleRight).toBeLessThanOrEqual(geometry.badgeLeft);
        }
        const first = buttons.first();
        await first.click();
        await expect(first).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator("#card-cccd-content")).toBeVisible();
        expect((await page.locator("#card-cccd-content img").first().boundingBox()).height).toBeLessThanOrEqual(130);
        await first.click();
        await expect(page.locator("#card-cccd-content")).toBeHidden();
        await page.goto("/tai-khoan/xac-minh/thu-gon");
        await expect(page).toHaveURL(/tai-khoan\/xac-minh$/);
        await expect(buttons.first()).toHaveAttribute("aria-expanded", "false");
    });
}
