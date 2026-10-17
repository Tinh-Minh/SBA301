import { test, expect } from "@playwright/test";

test("Nested routes survive reload and legacy redirects retain query parameters", async ({ page }) => {
  await page.goto("/tai-khoan/ngan-hang/them?edit=1");
  await expect(page.getByRole("dialog")).toContainText("Chỉnh sửa tài khoản ngân hàng");
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText("Chỉnh sửa tài khoản ngân hàng");
  await page.goto("/bang-gia-dong-xe?source=footer");
  await expect(page).toHaveURL(/cach-tinh-gia\?source=footer$/);
  await expect(page).toHaveTitle("Cách tính giá thuê xe | CarDB");
});

test("Browser back and forward restore the selected route and its title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/kham-pha-xe");
  await page.locator("header.site-header").getByRole("link", { name: "Cách tính giá", exact: true }).click();
  await expect(page).toHaveTitle("Cách tính giá thuê xe | CarDB");
  await page.goBack();
  await expect(page).toHaveURL(/kham-pha-xe$/);
  await expect(page).toHaveTitle("Khám phá xe | CarDB");
  await page.goForward();
  await expect(page).toHaveURL(/cach-tinh-gia$/);
  await expect(page.locator("#estimate-total")).toHaveText("4.050.000 đ");
});
