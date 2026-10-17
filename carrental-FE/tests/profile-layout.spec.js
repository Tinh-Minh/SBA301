import { test, expect } from "@playwright/test";
const routes = ["/tai-khoan/xac-minh", "/tai-khoan", "/tai-khoan/ho-so-tai-xe", "/tai-khoan/ngan-hang", "/tai-khoan/don-thue", "/tai-khoan/lich-su", "/tai-khoan/xac-minh/thu-gon", "/mau-thiet-ke/ngan-hang", "/tai-khoan/ngan-hang/them", "/tai-khoan/ngan-hang/mac-dinh"];
for (const width of [375, 1024, 1440]) {
    test(`Profile tabs share verification spacing at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        let reference;
        for (const route of routes) {
            await page.goto(route);
            await expect(page.locator(".profile-layout h1")).toHaveCount(1);
            await expect(page.locator('[aria-label="Hồ sơ và tài khoản"] [aria-current="page"]')).toHaveCount(1);
            const geometry = await page.locator(".profile-layout").evaluate(main => {
                const columns = main.querySelector(".profile-columns");
                const sidebar = columns.querySelector("aside");
                const content = columns.querySelector(".profile-content");
                const heading = main.querySelector(".profile-heading");
                const container = getComputedStyle(main.firstElementChild);
                const headingStyle = getComputedStyle(heading);
                const titleStyle = getComputedStyle(heading.querySelector("h1"));
                return {
                    containerPadding: [container.paddingLeft, container.paddingRight, container.paddingTop],
                    columnsWidth: columns.getBoundingClientRect().width,
                    sidebarWidth: sidebar.getBoundingClientRect().width,
                    contentWidth: content.getBoundingClientRect().width,
                    gap: getComputedStyle(columns).gap,
                    contentGap: getComputedStyle(content).gap,
                    contentPadding: getComputedStyle(content).paddingTop,
                    headingGap: headingStyle.gap,
                    headingMargin: headingStyle.marginBottom,
                    title: [titleStyle.fontSize, titleStyle.fontWeight, titleStyle.lineHeight],
                };
            });
            if (!reference)
                reference = geometry;
            expect(geometry, route).toEqual(reference);
            if (width >= 1024) {
                const sidebar = (await page.locator('.profile-columns > aside').boundingBox());
                const content = (await page.locator('.profile-content').boundingBox());
                expect(Math.abs(sidebar.y - content.y), route).toBeLessThan(1);
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
        }
    });
}

test("Profile intro is removed while each page keeps its accessible heading and actions", async ({ page }) => {
    for (const [route, title] of [["/tai-khoan/ngan-hang", "Tài khoản ngân hàng"], ["/tai-khoan/don-thue", "Đơn thuê xe"], ["/tai-khoan/xac-minh", "Xác minh giấy tờ"]]) {
        await page.goto(route);
        const heading = page.locator(".profile-heading");
        await expect(heading.locator("h1")).toHaveText(title);
        await expect(heading.locator("h1")).toHaveClass(/sr-only/);
        await expect(heading.getByText("Thành viên cao cấp", { exact: true })).toHaveCount(0);
        await expect(heading.locator("p")).toHaveCount(0);
    }
});

test("OCR status belongs to the document footer and add-bank action follows the linked accounts", async ({ page }) => {
    await page.goto("/tai-khoan/xac-minh");
    await expect(page.locator(".profile-heading")).not.toContainText("Auto-OCR");
    const ocr = page.locator('[data-purpose="verification-ocr-status"]');
    await expect(ocr).toBeVisible();
    const documents = await page.locator('[data-purpose="verification-documents"]').boundingBox();
    expect((await ocr.boundingBox()).y).toBeGreaterThan(documents.y + documents.height);
    await page.goto("/tai-khoan/ngan-hang");
    const action = page.locator('[data-purpose="add-bank-action"]');
    await expect(action.getByRole("button", { name: "+ Thêm tài khoản ngân hàng", exact: true })).toBeVisible();
    const cards = await page.locator('[data-purpose="bank-cards-list"]').boundingBox();
    expect((await action.boundingBox()).y).toBeGreaterThanOrEqual(cards.y + cards.height);
    await expect(page.locator(".profile-heading button")).toHaveCount(0);
});
