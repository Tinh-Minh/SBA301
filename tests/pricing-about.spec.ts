import { test, expect } from "@playwright/test";

test("Price calculator itemizes extras and discount boundaries", async ({ page }) => {
  await page.goto("/cach-tinh-gia");
  const total = page.locator("#estimate-total");
  const days = page.getByLabel("Số ngày thuê", { exact: true });
  await expect(total).toHaveText("4.050.000 đ");
  await days.fill("6");
  await expect(total).toHaveText("8.100.000 đ");
  await days.fill("7");
  await expect(total).toHaveText("8.505.000 đ");
  await days.fill("29");
  await expect(total).toHaveText("35.235.000 đ");
  await page.getByRole("button", { name: "Thuê theo tháng", exact: true }).click();
  await expect(days).toHaveValue("30");
  await expect(total).toHaveText("30.375.000 đ");
  await page.getByRole("button", { name: "Kèm tài xế", exact: true }).click();
  await days.fill("3");
  await expect(total).toHaveText("5.184.000 đ");
  await page.getByLabel("Bảo hiểm nâng cao").check();
  await page.getByLabel("Giao xe sân bay").check();
  await expect(total).toHaveText("5.666.760 đ");
  await page.getByLabel("Phân khúc xe", { exact: true }).selectOption("sedan");
  await expect(total).toHaveText("4.046.760 đ");
  await expect(page.getByText("Cọc thế chấp giữ riêng", { exact: true })).toBeVisible();
});

test("Rental modes and category filters update price cards", async ({ page }) => {
  await page.goto("/cach-tinh-gia");
  await expect(page.locator("[data-price-card]")).toHaveCount(5);
  await page.getByRole("group", { name: "Lọc phân khúc" }).getByRole("button", { name: "Xe điện VinFast", exact: true }).click();
  const card = page.locator('[data-price-card="electric"]');
  await expect(page.locator("[data-price-card]")).toHaveCount(1);
  await expect(card.getByText("1.250.000 đ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kèm tài xế", exact: true }).click();
  await expect(card.getByText("1.600.000 đ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Thuê theo tháng", exact: true }).click();
  await expect(card.getByText("28.125.000 đ", { exact: true })).toBeVisible();
  await card.getByRole("link", { name: "Khám phá đội xe" }).click();
  await expect(page).toHaveURL(/kham-pha-xe$/);
});

for (const width of [375, 1024, 1440]) {
  test(`Pricing and about navigation works at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => localStorage.setItem("cardb:session:v1", "demo"));
    await page.goto("/ve-cardb");
    const header = page.locator("header.site-header").first();
    const desktop = width === 1440;
    if (!desktop) await header.getByRole("button", { name: "Mở menu", exact: true }).click();
    await header.getByRole("link", { name: "Cách tính giá", exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/cach-tinh-gia$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chi phí thuê xe");
    if (!desktop) await header.getByRole("button", { name: "Mở menu", exact: true }).click();
    await expect(header.locator('a[aria-current="page"]').filter({ visible: true })).toHaveText("Cách tính giá");
    await header.getByRole("link", { name: "Về CarDB", exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/ve-cardb$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Để việc thuê xe");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.locator("main .material-symbols-outlined").evaluateAll(elements => elements.every(element => element.getBoundingClientRect().width <= 32))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const headerFits = await header.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return [...element.querySelectorAll("a,button")].filter(node => node.getClientRects().length).every(node => {
        const rect = node.getBoundingClientRect();
        return rect.left >= bounds.left && rect.right <= bounds.right;
      });
    });
    expect(headerFits).toBe(true);
  });
}
