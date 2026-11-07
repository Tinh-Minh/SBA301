import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cardb:session:v2", JSON.stringify({
    accessToken: "test-token", account: { id: 1, fullName: "Backend Owner", role: "CUSTOMER" },
  })));
});

test("an empty backend fleet stays empty without demo vehicles", async ({ page }) => {
  const requests = [];
  await page.route(/\/api\/(?!src)/, route => {
    requests.push(new URL(route.request().url()).pathname);
    return route.fulfill({ json: { success: true, data: { content: [], totalElements: 0, totalPages: 1 } } });
  });
  await page.goto("/owner/vehicles");
  await expect(page.getByText("Không có xe nào trong bộ lọc này.")).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Backend Owner" })).toBeVisible();
  expect(requests).toContain("/api/cars/my-cars");
});

test("backend failures display an error instead of a sample fleet", async ({ page }) => {
  await page.route(/\/api\/(?!src)/, route => route.fulfill({ status: 503, json: { message: "Fleet backend unavailable" } }));
  await page.goto("/owner/vehicles");
  await expect(page.getByText("Fleet backend unavailable")).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(0);
  await expect(page.getByText("Không có xe nào trong bộ lọc này.")).toHaveCount(0);
});
