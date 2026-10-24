import { test, expect } from "@playwright/test";
import { parseVndInput } from "../src/utils/inputParser.js";
import { vehiclePricingSchema, vehicleCreateSchema } from "../src/validation/vehicle.js";

const car = {
  id: 42, ownerId: 1, brand: "VinFast", model: "VF 9", licensePlate: "51K-12345",
  manufactureYear: 2024, seats: 7, carType: "SUV", transmission: "AUTOMATIC", fuelType: "ELECTRIC",
  city: "TP. Hồ Chí Minh", pickupAddress: "128 Thảo Điền", status: "ACTIVE",
  pricePerDay: 1000000, pricePerHour: 100000, depositAmount: 0, kmLimitPerDay: 350, extraKmFee: 5000,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cardb:session:v2", JSON.stringify({
    accessToken: "test-token", account: { id: 1, fullName: "Test Owner", role: "CUSTOMER" },
  })));
  await page.route("**/api/**", route => route.fulfill({ status: 503, json: { message: "Test backend unavailable" } }));
});

test("money parsing distinguishes empty values from an explicit zero and rejects overflow", () => {
  expect(parseVndInput("1.250.000")).toBe(1250000);
  expect(parseVndInput("0")).toBe(0);
  for (const value of ["", " ", "abc", "-100", "9007199254740992"]) expect(parseVndInput(value)).toBeNull();
  expect(vehiclePricingSchema.safeParse({ pricePerDay: "1000000", depositAmount: "0", kmLimitPerDay: "350", extraKmFee: "5000" }).success).toBe(true);
  expect(vehiclePricingSchema.safeParse({ pricePerDay: "0", depositAmount: "", kmLimitPerDay: "350", extraKmFee: "5000" }).success).toBe(false);
  const vehicle = { ...car, weekendPrice: "1200000", registrationUrl: "", inspectionUrl: "", photos: {}, agreed: true };
  expect(vehicleCreateSchema.safeParse(vehicle).success).toBe(true);
  expect(vehicleCreateSchema.safeParse({ ...vehicle, seats: 61 }).success).toBe(false);
  expect(vehicleCreateSchema.safeParse({ ...vehicle, manufactureYear: "" }).success).toBe(false);
  expect(vehicleCreateSchema.safeParse({ ...vehicle, photos: { front: { url: "invalid" } } }).success).toBe(false);
});

test("vehicle registration validates each step, restores a draft, and submits numeric prices", async ({ page }) => {
  const payloads = [];
  const documents = [];
  await page.route("**/api/cars", route => {
    payloads.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true, data: car } });
  });
  await page.route("**/api/cars/42", route => route.fulfill({ json: { success: true, data: car } }));
  await page.route("**/api/cars/42/documents", route => {
    documents.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true, data: {} } });
  });
  await page.goto("/owner/vehicles/new");
  const next = () => page.getByRole("button", { name: /^Tiếp tục:/ });
  await expect(next()).toBeDisabled();
  await page.getByLabel("Biển kiểm soát").fill("51k-12345");
  await page.getByLabel("Địa chỉ bãi xe cố định").fill("128 Thảo Điền");
  await page.getByLabel("Giấy đăng ký xe (cavet)").fill("invalid");
  await expect(next()).toBeDisabled();
  await page.getByLabel("Giấy đăng ký xe (cavet)").fill("https://example.com/registration.pdf");
  await next().click();
  await next().click();
  await expect(page.getByRole("heading", { name: /Cài đặt bảng giá và tiền cọc/ })).toBeVisible();
  await expect(next()).toBeDisabled();
  await page.getByLabel("Đơn giá ngày thường (VND)").fill("1.250.000");
  await page.getByLabel("Đơn giá cuối tuần (VND)").fill("1.500.000");
  await page.getByLabel("Tiền cọc thế chấp (VND)").fill("0");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await page.reload();
  await expect(page.getByLabel("Đơn giá ngày thường (VND)")).toHaveValue("1.250.000");
  await next().click();
  const submit = page.getByRole("button", { name: "Gửi BQL CarDB thẩm định" });
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page).toHaveURL(/\/owner\/vehicles$/);
  expect(payloads).toHaveLength(1);
  expect(payloads[0]).toMatchObject({ pricePerDay: 1250000, depositAmount: 0, seats: 7, manufactureYear: 2024, licensePlate: "51K-12345" });
  expect(documents).toEqual([{ docType: "REGISTRATION", fileUrl: "https://example.com/registration.pdf", expiresAt: null }]);
  expect(await page.evaluate(() => localStorage.getItem("cardb-vehicle-draft"))).toBeNull();
});

test("vehicle pricing uses controlled fields, blocks invalid input, and saves a normalized payload", async ({ page }) => {
  const payloads = [];
  await page.route("**/api/cars/42", route => {
    if (route.request().method() === "PUT") payloads.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true, data: car } });
  });
  await page.goto("/owner/vehicles/edit/42");
  const price = page.getByLabel(/Đơn giá thuê theo ngày/);
  const save = page.getByRole("button", { name: /Lưu bảng giá/ });
  await expect(price).toHaveValue("1.000.000");
  await price.fill("");
  await expect(save).toBeDisabled();
  await price.fill("1.750.000");
  await page.getByLabel(/Tiền cọc thế chấp/).fill("0");
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByText("Đã lưu bảng giá.")).toBeVisible();
  expect(payloads).toHaveLength(1);
  expect(payloads[0]).toMatchObject({ pricePerDay: 1750000, depositAmount: 0, kmLimitPerDay: 350, extraKmFee: 5000 });
});
