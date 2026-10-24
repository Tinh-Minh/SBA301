import { test, expect } from "@playwright/test";

const car = {
  id: 42, ownerId: 1, brand: "Test", model: "Cache", licensePlate: "51K-12345",
  manufactureYear: 2024, seats: 7, carType: "SUV", transmission: "AUTOMATIC", fuelType: "ELECTRIC",
  city: "TP. Hồ Chí Minh", pickupAddress: "128 Thảo Điền", status: "ACTIVE",
  pricePerDay: 1000000, pricePerHour: 100000, depositAmount: 0, kmLimitPerDay: 350, extraKmFee: 5000,
};
const emptyPage = { content: [], totalElements: 0, totalPages: 1 };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");

async function session(page, role = "CUSTOMER") {
  await page.addInitScript(role => localStorage.setItem("cardb:session:v2", JSON.stringify({
    accessToken: "test-token", account: { id: 1, fullName: "Cache Owner", role },
  })), role);
}

async function fleetBackend(page) {
  const state = { car: { ...car }, listCalls: 0 };
  await page.route("**/api/**", route => route.fulfill({ json: { success: true, data: emptyPage } }));
  await page.route("**/api/cars/my-cars?**", route => {
    if (new URL(route.request().url()).searchParams.get("size") === "50") state.listCalls++;
    return route.fulfill({ json: { success: true, data: { content: [state.car], totalPages: 1, totalElements: 1 } } });
  });
  await page.route("**/api/cars/42", route => {
    if (route.request().method() === "PUT") state.car = { ...state.car, ...route.request().postDataJSON() };
    return route.fulfill({ json: { success: true, data: state.car } });
  });
  return state;
}

test("client navigation reuses fresh fleet data", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await session(page);
  const state = await fleetBackend(page);
  await page.goto("/owner/vehicles");
  await expect(page.getByRole("heading", { name: "Test Cache" })).toBeVisible();
  await page.locator('header a[href="/pricing"]').first().click();
  await expect(page).toHaveURL(/\/pricing$/);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Test Cache" })).toBeVisible();
  expect(state.listCalls).toBe(1);
});

test("saving a price invalidates the cached fleet as well as vehicle detail", async ({ page }) => {
  await session(page);
  const state = await fleetBackend(page);
  await page.goto("/owner/vehicles");
  await expect(page.getByRole("heading", { name: "Test Cache" })).toBeVisible();
  await page.locator('a[href="/owner/vehicles/edit/42"]').click();
  await page.getByLabel(/Đơn giá thuê theo ngày/).fill("1.750.000");
  await page.getByRole("button", { name: /Lưu bảng giá/ }).click();
  await expect(page.getByText("Đã lưu bảng giá.")).toBeVisible();
  await page.getByRole("link", { name: /Quay lại Xe của tôi/ }).click();
  await expect(page.locator("main article")).toContainText("1.750.000");
  expect(state.listCalls).toBe(2);
});

test("switching accounts discards previous account query data", async ({ page }) => {
  await session(page);
  await fleetBackend(page);
  await page.route("**/api/cars/42", route => {
    const id = route.request().headers()["x-user-id"];
    return route.fulfill({ json: { success: true, data: { ...car, model: id === "2" ? "Second Account" : "First Account" } } });
  });
  await page.goto("/owner/vehicles");
  await expect(page.getByRole("heading", { name: "Test First Account" })).toBeVisible();
  await page.evaluate(() => {
    localStorage.setItem("cardb:session:v2", JSON.stringify({
      accessToken: "second-token", account: { id: 2, fullName: "Second Owner", role: "CUSTOMER" },
    }));
    window.dispatchEvent(new Event("cardb:session-change"));
  });
  await expect(page.getByRole("heading", { name: "Test Second Account" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Test First Account" })).toHaveCount(0);
});

test("Axios uploads multipart documents and refreshes their query", async ({ page }) => {
  await session(page);
  let upload;
  await page.route("**/api/user-documents**", route => {
    if (route.request().method() === "POST") {
      upload = route.request();
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: { success: true, data: upload ? [{ id: 7, docType: "CITIZEN_ID", verifyStatus: "PENDING" }] : [] } });
  });
  await page.goto("/account/verification");
  await expect(page.getByText("Bạn chưa nộp giấy tờ nào.")).toBeVisible();
  await page.getByLabel("Số giấy tờ").fill("123456789012");
  await page.getByLabel("Ảnh mặt trước").setInputFiles({ name: "front.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Gửi hồ sơ" }).click();
  await expect(page.locator("main article")).toHaveCount(1);
  expect(upload.headers()["content-type"]).toContain("multipart/form-data; boundary=");
  expect(upload.headers().authorization).toBe("Bearer test-token");
  const body = upload.postDataBuffer().toString();
  expect(body).toContain('name="docNumber"');
  expect(body).toContain("123456789012");
  expect(body).toContain('filename="front.png"');
});

test("Axios downloads protected document images as blobs", async ({ page }) => {
  await session(page, "ADMIN");
  let imageHeaders;
  await page.route("**/api/**", route => route.fulfill({ json: { success: true, data: emptyPage } }));
  await page.route("**/api/customers/1", route => route.fulfill({ json: { success: true, data: { id: 1, fullName: "Image Customer", email: "image@example.com", role: "CUSTOMER", status: "ACTIVE" } } }));
  await page.route("**/api/user-documents?**", route => route.fulfill({ json: { success: true, data: { content: [{ id: 7, docType: "CITIZEN_ID", verifyStatus: "PENDING", hasFrontImage: true }] } } }));
  await page.route("**/api/user-documents/7/files/front", route => {
    imageHeaders = route.request().headers();
    return route.fulfill({ contentType: "image/png", body: png });
  });
  await page.goto("/admin/users?id=1");
  await page.getByRole("button", { name: "Xem ảnh giấy tờ" }).click();
  const image = page.getByRole("img", { name: "Ảnh giấy tờ", exact: true });
  await expect(image).toHaveAttribute("src", /^blob:/);
  await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBe(1);
  expect(imageHeaders.authorization).toBe("Bearer test-token");
  expect(imageHeaders["x-user-id"]).toBe("1");
});
