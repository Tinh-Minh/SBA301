import { test, expect } from "@playwright/test";

const customer = { id: 1, fullName: "Chủ Xe", email: "owner@example.com", phone: "0912345678", role: "OWNER", status: "ACTIVE", kycStatus: "APPROVED" };
const car = (id, plate, status, listingStatus) => ({ id, ownerId: 1, brand: "Toyota", model: `Xe${id}`, licensePlate: plate, manufactureYear: 2024, seats: 5, carType: "SUV", transmission: "AUTOMATIC", fuelType: "GASOLINE", city: "HCM", pickupAddress: "1 Lê Lợi", pricePerDay: 800000, status, listingStatus, images: [], documents: [] });
const cars = [car(1, "51K-00001", "ACTIVE", "LISTED"), car(2, "51K-00002", "ACTIVE", "UNLISTED"), car(3, "51K-00003", "ACTIVE", "EXPIRED"), car(4, "51K-00004", "PENDING_APPROVAL", "UNLISTED")];
const subscription = (id, carId, status, daysRemaining = null) => ({ id, subscriptionCode: `SUB-20261107-00${id}`, customerId: 1, customerName: customer.fullName, carId, carName: `Toyota Xe${carId}`, licensePlate: `51K-0000${carId}`, packageId: 2, packageName: "Gói Tiêu Chuẩn", durationDays: 30, badgeLabel: "NỔI BẬT", voucherCode: null, packagePrice: 180000, discountAmount: 0, totalAmount: 180000, status, paymentStatus: status === "ACTIVE" ? "PAID" : "UNPAID", startDate: null, endDate: null, activatedAt: null, createdAt: "2026-11-07T08:00:00", daysRemaining });
const packages = [
  { id: 3, code: "PKG_VIP", name: "Gói VIP", price: 450000, durationDays: 90, priorityLevel: 3, badgeLabel: "VIP PRO", description: null },
  { id: 2, code: "PKG_STANDARD", name: "Gói Tiêu Chuẩn", price: 180000, durationDays: 30, priorityLevel: 2, badgeLabel: "NỔI BẬT", description: null },
  { id: 1, code: "PKG_BASIC", name: "Gói Cơ Bản", price: 50000, durationDays: 7, priorityLevel: 1, badgeLabel: "THƯỜNG", description: null },
];
const pageOf = content => ({ content, page: 0, size: 50, totalElements: content.length, totalPages: 1 });

async function backend(page, { mine = [], all = mine } = {}) {
  const calls = [];
  await page.addInitScript(account => localStorage.setItem("cardb:session:v2", JSON.stringify({ accessToken: "token", account })), customer);
  await page.route("https://pay.test/**", route => route.fulfill({ contentType: "text/html", body: "<h1>VNPay</h1>" }));
  await page.route("**/api/**", route => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const body = request.postDataJSON?.();
    calls.push({ method: request.method(), pathname, body });
    const ok = data => route.fulfill({ json: { success: true, data } });
    if (pathname === "/api/customers/me") return ok(customer);
    if (pathname === "/api/cars/my-cars") return ok(pageOf(cars));
    const carMatch = pathname.match(/^\/api\/cars\/(\d+)$/);
    if (carMatch) return ok(cars.find(item => item.id === Number(carMatch[1])));
    if (pathname === "/api/subscriptions/my-subscriptions") return ok(pageOf(mine));
    if (pathname === "/api/subscriptions/packages") return ok(packages);
    if (pathname === "/api/admin/subscriptions") return ok(pageOf(all));
    if (pathname === "/api/subscriptions/quote") {
      if (body.voucherCode === "SAI") return route.fulfill({ status: 400, json: { success: false, message: "Mã voucher không tồn tại" } });
      const discountAmount = body.voucherCode === "GIAM10" ? 18000 : 0;
      return ok({ carId: body.carId, packageId: body.packageId, packageName: "Gói Tiêu Chuẩn", durationDays: 30, voucherCode: body.voucherCode ?? null, packagePrice: 180000, discountAmount, totalAmount: 180000 - discountAmount });
    }
    if (pathname === "/api/subscriptions") return route.fulfill({ status: 201, json: { success: true, data: subscription(9, body.carId, "PENDING_PAYMENT") } });
    if (pathname === "/api/transactions/package-payment") return ok({ id: 5, status: "PENDING", paymentUrl: "https://pay.test/vnpay" });
    if (pathname === "/api/subscriptions/9/cancel") return ok(subscription(9, 2, "CANCELLED"));
    return ok(pageOf([]));
  });
  return calls;
}

test("owner vehicles show the listing status of each approved car", async ({ page }) => {
  await backend(page, { mine: [subscription(1, 1, "ACTIVE", 18)] });
  await page.goto("/owner/vehicles");
  const bars = page.getByTestId("listing-status");
  await expect(bars).toHaveCount(3);
  await expect(bars.nth(0)).toContainText("Còn 18 ngày hiển thị");
  await expect(bars.nth(1).getByRole("link", { name: "Mua gói đăng tin" })).toHaveAttribute("href", "/owner/subscriptions/new?carId=2");
  await expect(bars.nth(2).getByRole("link", { name: "Gia hạn ngay" })).toHaveAttribute("href", "/owner/subscriptions/new?carId=3");
});

test("owner buys a package with a voucher and goes to VNPay", async ({ page }) => {
  const calls = await backend(page);
  await page.goto("/owner/subscriptions/new?carId=2");
  await expect(page.getByRole("button", { name: /Xe4/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Xe2/ })).toHaveAttribute("aria-pressed", "true");
  const pay = page.getByRole("button", { name: "Thanh toán ngay qua VNPay" });
  await expect(pay).toBeDisabled();

  await page.getByRole("button", { name: /Gói Tiêu Chuẩn/ }).click();
  await expect(page.getByText("180.000 đ").last()).toBeVisible();
  await page.getByLabel("Mã voucher").fill("SAI");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page.getByRole("alert")).toContainText("Mã voucher không tồn tại");

  await page.getByLabel("Mã voucher").fill("GIAM10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
  await expect(page.getByText("162.000 đ")).toBeVisible();

  await pay.click();
  await expect(page).toHaveURL("https://pay.test/vnpay");
  expect(calls.find(call => call.method === "POST" && call.pathname === "/api/subscriptions").body).toEqual({ carId: 2, packageId: 2, voucherCode: "GIAM10" });
  expect(calls.find(call => call.pathname === "/api/transactions/package-payment").body).toEqual({ subscriptionId: 9, method: "VNPAY" });
});

test("owner sees purchase history and can cancel an unpaid request", async ({ page }) => {
  const calls = await backend(page, { mine: [subscription(9, 2, "PENDING_PAYMENT"), subscription(1, 1, "ACTIVE", 18)] });
  await page.goto("/owner/subscriptions");
  await expect(page.getByText("Còn 18 ngày hiển thị")).toBeVisible();
  await expect(page.getByRole("button", { name: "Huỷ yêu cầu" })).toHaveCount(1);
  await page.getByRole("button", { name: "Huỷ yêu cầu" }).click();
  await expect.poll(() => calls.some(call => call.method === "PUT" && call.pathname === "/api/subscriptions/9/cancel")).toBe(true);
});
