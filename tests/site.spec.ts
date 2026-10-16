import { test, expect } from "@playwright/test";

const pages = ["/", "/thue-xe-tu-lai", "/xe-kem-tai-xe", "/bang-gia-dong-xe", "/uu-dai", "/ve-kanow", "/xe/vinfast-vf8-plus-2024", "/tai-xe/tran-minh-tuan", "/dang-ky", "/dang-nhap", "/thanh-toan-dat-coc", "/tai-khoan", "/mau-thiet-ke/trang-chu", "/mau-thiet-ke/tu-lai", "/mau-thiet-ke/tai-xe", "/mau-thiet-ke/bang-gia"];

for (const width of [375, 768, 1440]) {
  test(`All pages render without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of pages) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", "vi");
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      expect(overflow.scroll, `${route}: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(width + 1);
      const brokenImages = await page.locator("main img").evaluateAll(images => images.filter(image => (image as HTMLImageElement).complete && !(image as HTMLImageElement).naturalWidth).map(image => (image as HTMLImageElement).src));
      expect(brokenImages, route).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("Mobile navigation opens and follows Vietnamese links", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await page.locator("#mobile-navigation").getByRole("link", { name: "Ưu đãi" }).click();
  await expect(page).toHaveURL(/uu-dai/);
  await expect(page.locator("#mobile-navigation")).toHaveCount(0);
});

test("Search validates dates and connects to filtered cars", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Thời gian trả xe" }).count();
  await page.locator('input[name="end"]').fill("2026-10-23T20:00");
  await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
  await expect(page.locator("#search-service-panel [role='alert']")).toContainText("Thời gian trả xe phải sau");
  await page.locator('input[name="end"]').fill("2026-10-27T20:00");
  await page.getByRole("button", { name: "Xe điện (EV)", exact: true }).click();
  await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
  await expect(page).toHaveURL(/thue-xe-tu-lai.*filter=ev/);
  await expect(page.locator('[data-vehicle-card="ev"]')).toBeVisible();
  await expect(page.locator('[data-vehicle-card="sedan"]').first()).toBeHidden();
});

test("Price estimate recalculates, FAQ expands, offers filter", async ({ page }) => {
  await page.goto("/bang-gia-dong-xe");
  const before = await page.locator("#receipt-grand-total").innerText();
  await page.locator("#rental-days-range").fill("10");
  await expect(page.locator("#days-display")).toHaveText("10");
  await expect(page.locator("#receipt-grand-total")).not.toHaveText(before);
  await page.goto("/");
  const faq = page.locator('[data-handler="toggleFaq"]').first();
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#home-answer-0")).toBeVisible();
  await page.goto("/uu-dai");
  await page.getByRole("button", { name: "Khách hàng mới" }).click();
  await expect(page.locator('.voucher-card[data-filter-hidden="false"]')).toHaveCount(2);
});

test("Payment requires holding; early release never confirms", async ({ page }) => {
  let dialogs = 0;
  page.on("dialog", async dialog => { dialogs++; await dialog.dismiss(); });
  await page.goto("/thanh-toan-dat-coc");
  const confirm = page.getByRole("button", { name: "Giữ để xác nhận thanh toán", exact: true });
  await confirm.click();
  await expect(page.getByText("Đã xác nhận thanh toán mẫu", { exact: true })).toHaveCount(0);
  await confirm.focus();
  await page.keyboard.down("Enter");
  await page.waitForTimeout(1800);
  await page.keyboard.up("Enter");
  await expect(page.getByText("Đã xác nhận thanh toán mẫu", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem lại thao tác" }).click();
  const cancel = page.getByRole("button", { name: "Giữ để hủy đặt xe", exact: true });
  await cancel.focus();
  await page.keyboard.down("Space");
  await page.waitForTimeout(1800);
  await page.keyboard.up("Space");
  await expect(page.getByText("Đã hủy đặt xe mẫu", { exact: true })).toBeVisible();
  expect(dialogs).toBe(0);
});

test("Demo login updates navigation, persists on refresh, and logs out", async ({ page }) => {
  await page.goto("/dang-nhap");
  await page.locator("#loginIdentity").fill("demo");
  await page.locator("#loginPassword").fill("123");
  await page.getByRole("button", { name: /Đăng nhập ngay/ }).click();
  await expect(page).toHaveURL(/tai-khoan/);
  await expect(page.locator("header").getByRole("link", { name: "Tài khoản Nguyễn Văn An", exact: true })).toBeVisible();
  await expect(page.locator("header").getByRole("link", { name: "Đăng nhập", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.locator("header").getByRole("link", { name: "Tài khoản Nguyễn Văn An", exact: true })).toBeVisible();
  await page.locator("header").getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(page.locator("header").getByRole("link", { name: "Đăng nhập", exact: true })).toBeVisible();
});

test("Pointer hold confirms only after full duration", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/thanh-toan-dat-coc");
  const button = page.getByRole("button", { name: "Giữ để xác nhận thanh toán", exact: true });
  await button.scrollIntoViewIfNeeded();
  const bounds = (await button.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(400);
  await page.mouse.up();
  await expect(page.getByText("Đã xác nhận thanh toán mẫu", { exact: true })).toHaveCount(0);
  await page.mouse.down();
  await page.waitForTimeout(1800);
  await page.mouse.up();
  await expect(page.getByText("Đã xác nhận thanh toán mẫu", { exact: true })).toBeVisible();
});
