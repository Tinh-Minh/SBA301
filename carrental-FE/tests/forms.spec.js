import { test, expect } from "@playwright/test";

const token = {
  accessToken: "test-token", expiresIn: 3600,
  account: { id: 1, fullName: "Test Customer", email: "test@example.com", role: "CUSTOMER" },
};

test("login validates fields locally and keeps password visibility working", async ({ page }) => {
  const requests = [];
  await page.route("**/api/auth/login", route => { requests.push(route.request()); return route.abort(); });
  await page.goto("/login");
  const form = page.locator("#view-login form");
  await form.locator('[type="submit"]').click();
  await expect(form.getByRole("alert")).toContainText("Vui lòng nhập email hợp lệ.");
  await expect(form.getByRole("alert")).toContainText("Vui lòng nhập mật khẩu.");
  await page.locator("#login-password").fill("secret123");
  await form.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu" }).click();
  await expect(page.locator("#login-password")).toHaveAttribute("type", "text");
  expect(requests).toHaveLength(0);
  await expect(page.locator("#view-register")).toHaveCount(0);
});

test("login submits normalized values once, persists the session, and honors next", async ({ page }) => {
  const requests = [];
  let release;
  const responseReady = new Promise(resolve => { release = resolve; });
  await page.route("**/api/auth/login", async route => {
    requests.push(route.request().postDataJSON());
    await responseReady;
    await route.fulfill({ json: { success: true, data: token } });
  });
  await page.goto("/login?next=/pricing");
  await page.locator("#login-account").fill("  test@example.com  ");
  await page.locator("#login-password").fill("secret123");
  const submit = page.locator("#view-login form [type=submit]");
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect.poll(() => requests.length).toBe(1);
  release();
  await expect(page).toHaveURL(/\/pricing$/);
  expect(requests).toEqual([{ email: "test@example.com", password: "secret123" }]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("cardb:session:v2")).accessToken)).toBe("test-token");
});

test("registration validates confirmation and terms before making requests", async ({ page }) => {
  const requests = [];
  await page.route("**/api/auth/register", route => { requests.push(route.request()); return route.abort(); });
  await page.goto("/register");
  await page.locator("#reg-fullname").fill("Test Customer");
  await page.locator("#reg-email").fill("test@example.com");
  await page.locator("#reg-phone").fill("0912 345 678");
  await page.locator("#reg-password").fill("secret123");
  await page.locator("#reg-confirm-password").fill("different123");
  const form = page.locator("#view-register form");
  await form.locator('[type="submit"]').click();
  await expect(form.getByRole("alert")).toContainText("Mật khẩu xác nhận chưa khớp.");
  await page.locator("#reg-confirm-password").fill("secret123");
  await page.locator("#reg-terms").uncheck();
  await form.locator('[type="submit"]').click();
  await expect(form.getByRole("alert")).toContainText("Vui lòng đồng ý với điều khoản sử dụng.");
  expect(requests).toHaveLength(0);
  await expect(page.locator("#view-login")).toHaveCount(0);
});

test("registration submits only API fields and then logs in", async ({ page }) => {
  const requests = [];
  await page.route("**/api/**", route => route.fulfill({ status: 503, json: { message: "Test backend unavailable" } }));
  await page.route("**/api/auth/register", route => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true, data: token.account } });
  });
  await page.route("**/api/auth/login", route => route.fulfill({ json: { success: true, data: token } }));
  await page.goto("/register");
  for (const [id, value] of Object.entries({ "reg-fullname": " Test Customer ", "reg-email": "test@example.com", "reg-phone": "0912 345 678", "reg-password": "secret123", "reg-confirm-password": "secret123" })) {
    await page.locator(`#${id}`).fill(value);
  }
  await page.locator("#view-register form [type=submit]").click();
  await expect(page).toHaveURL(/\/account$/);
  expect(requests).toEqual([{ fullName: "Test Customer", email: "test@example.com", phone: "0912345678", password: "secret123" }]);
});

test("API authentication errors remain visible and permit retry", async ({ page }) => {
  await page.route("**/api/auth/login", route => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  await page.goto("/login");
  await page.locator("#login-account").fill("test@example.com");
  await page.locator("#login-password").fill("secret123");
  await page.locator("#view-login form [type=submit]").click();
  await expect(page.getByRole("alert")).toContainText("Email hoặc mật khẩu không đúng.");
  await expect(page.locator("#view-login form [type=submit]")).toBeEnabled();
});
