import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Exercise the frontend's error and authentication states without a backend.
  await page.route("**/api/**", route => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ success: false, message: "Backend unavailable for frontend test" }),
  }));
});

test("public, customer, owner and admin routes render after direct visits and reloads", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const routes = [
    "/", "/pricing", "/login", "/register", "/explore", "/cars/42?slotId=7",
    "/account", "/account/orders", "/account/history", "/account/bank", "/account/driver",
    "/account/verification", "/booking/confirm?slotId=7", "/my-trips", "/orders/42",
    "/payment?orderId=42", "/reviews?orderId=42", "/disputes?orderId=42",
    "/payment/success", "/payment/failed", "/design/banks", "/components/navigation",
    "/contact", "/privacy", "/terms", "/forgot-password",
    "/owner/dashboard", "/owner/vehicles", "/owner/vehicles/new", "/owner/vehicles/edit/42",
    "/owner/calendar", "/owner/requests", "/owner/trips", "/owner/payouts",
    "/admin/dashboard", "/admin/users", "/admin/vehicles", "/admin/vouchers",
    "/admin/orders", "/admin/payouts", "/admin/disputes",
  ];
  for (const route of routes) {
    expect((await page.goto(route)).status(), route).toBe(200);
    await expect(page.getByText("Đang tải trang…", { exact: true }), route).toHaveCount(0);
    await expect(page.locator("main").first(), route).toBeVisible();
    await expect(page.getByText("Unexpected Application Error!"), route).toHaveCount(0);
  }
  await page.reload();
  await expect(page.getByRole("heading", { name: "Đăng nhập tài khoản quản trị" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("aliases preserve query strings and hashes, including dynamic IDs", async ({ page }) => {
  await page.goto("/cach-tinh-gia?city=HCM#pricing");
  await expect(page).toHaveURL(/\/pricing\?city=HCM#pricing$/);
  await expect(page).toHaveTitle("Cách tính giá thuê xe | CarDB");
  await page.goto("/xe/42?slotId=7");
  await expect(page).toHaveURL(/\/cars\/42\?slotId=7$/);
  await page.goto("/don-thue/42?created=1");
  await expect(page).toHaveURL(/\/orders\/42\?created=1$/);
});

test("React links and browser history navigate without reloading the document", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("#view-login")).toBeVisible();
  await page.evaluate(() => { window.routingMarker = "same-document"; });
  await page.locator('a[href="/register"]').first().click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator("#view-register")).toBeVisible();
  expect(await page.evaluate(() => window.routingMarker)).toBe("same-document");
  await page.goBack();
  await expect(page.locator("#view-login")).toBeVisible();
  expect(await page.evaluate(() => window.routingMarker)).toBe("same-document");
});

test("unknown routes and invalid vehicle IDs use the intended fallback", async ({ page }) => {
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Chưa tìm thấy trang này" })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("cardb:session:v2", JSON.stringify({
    accessToken: "frontend-test-token", account: { id: 1, fullName: "Test Owner", role: "CUSTOMER" },
  })));
  await page.goto("/owner/vehicles/edit/invalid");
  await expect(page.getByRole("heading", { name: "Chưa tìm thấy trang này" })).toBeVisible();
  await page.goto("/cars/invalid");
  await expect(page).toHaveURL(/\/explore$/);
});
