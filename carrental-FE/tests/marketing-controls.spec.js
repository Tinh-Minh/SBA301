import { test, expect } from "@playwright/test";

test("auth tabs navigate through React links without submitting a form", async ({ page }) => {
  const requests = [];
  await page.route("**/api/auth/**", route => {
    requests.push(route.request().url());
    return route.fulfill({ status: 400, json: { message: "Unexpected form submission" } });
  });
  await page.goto("/login");
  await page.locator("#tab-btn-register").click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator("#view-register form")).toBeVisible();
  await page.locator("#tab-btn-login").click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("#view-login form")).toBeVisible();
  expect(requests).toEqual([]);
});

test("home visual filters and search remain functional after removing legacy handlers", async ({ page }) => {
  await page.route("**/api/**", route => route.fulfill({ json: { success: true, data: { content: [], totalElements: 0, totalPages: 1 } } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Xe điện EV", exact: true }).click();
  await expect(page.locator('[data-vehicle-card="suv"]:visible')).toHaveCount(0);
  await expect(page.locator('[data-vehicle-card="ev"]:visible').first()).toBeVisible();
  await page.getByRole("button", { name: "Tất cả", exact: true }).click();
  const favorite = page.getByRole("button", { name: "Lưu xe yêu thích", exact: true }).first();
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Thời gian nhận xe", { exact: true }).fill("09:00, 01/11/2026");
  await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
  await expect(page).toHaveURL(/\/explore\?/);
  expect(new URL(page.url()).searchParams.get("start")).toBe("09:00, 01/11/2026");
  await expect(page.getByText("Unexpected Application Error!", { exact: true })).toHaveCount(0);
});
