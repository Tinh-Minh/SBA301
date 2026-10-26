import { test, expect } from "@playwright/test";

const customer = { id: 1, fullName: "Structure Customer", email: "structure@example.com", phone: "0912345678", role: "ADMIN", status: "ACTIVE", kycStatus: "APPROVED" };
const car = { id: 42, ownerId: 1, brand: "Structure", model: "SUV", licensePlate: "51K-12345", manufactureYear: 2024, seats: 7, carType: "SUV", transmission: "AUTOMATIC", fuelType: "ELECTRIC", city: "HCM", pickupAddress: "Test pickup", status: "ACTIVE", pricePerDay: 1000000, pricePerHour: 100000, depositAmount: 0, images: [], features: "[]" };
const order = { id: 7, orderCode: "STRUCTURE-007", carId: 42, carName: "Structure SUV", customerId: 1, customerName: customer.fullName, ownerId: 1, ownerName: "Structure Owner", licensePlate: car.licensePlate, rentalType: "DAILY", status: "CONFIRMED", paymentStatus: "UNPAID", unitPrice: 1000000, quantity: 2, rentalAmount: 2000000, totalAmount: 2000000, commissionRate: 10, startTime: "2026-10-25T08:00:00", endTime: "2026-10-27T08:00:00", createdAt: "2026-10-24T08:00:00", expiresAt: "2099-10-25T08:00:00" };
const payout = { id: 3, orderId: 7, recipientId: 1, recipientName: customer.fullName, orderCode: order.orderCode, grossAmount: 2000000, platformFee: 200000, netAmount: 1800000, status: "PENDING", createdAt: order.createdAt };
const pageOf = content => ({ content, totalElements: content.length, totalPages: 1, number: 0, size: 50 });

async function backend(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(customer => localStorage.setItem("cardb:session:v2", JSON.stringify({ accessToken: "structure-token", account: customer })), customer);
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    let data;
    switch (url.pathname) {
      case "/api/customers/me": case "/api/customers/1": data = customer; break;
      case "/api/customers/me/kyc": case "/api/customers/1/kyc": data = { kycStatus: "APPROVED" }; break;
      case "/api/customers": data = pageOf([customer]); break;
      case "/api/cars/42": data = car; break;
      case "/api/cars/my-cars": case "/api/admin/cars": data = pageOf([car]); break;
      case "/api/cars/42/documents": case "/api/orders/7/handovers": case "/api/orders/7/logs": data = []; break;
      case "/api/orders/7": data = order; break;
      case "/api/orders": case "/api/orders/my-rentals": case "/api/orders/my-cars": data = pageOf([order, { ...order, id: 8, orderCode: "STRUCTURE-008", status: "PENDING" }]); break;
      case "/api/bank-accounts": data = pageOf([{ id: 2, bankName: "Structure Bank", accountHolder: customer.fullName, accountNumberMasked: "******1234", isDefault: true }]); break;
      case "/api/drivers/me": data = { id: 1, status: "ACTIVE", createdAt: order.createdAt }; break;
      case "/api/drivers/me/eligibility": data = { eligibleNow: true, kycStatus: "APPROVED", hasValidDriverLicense: true }; break;
      case "/api/payouts": data = pageOf([payout]); break;
      case "/api/slots/car/42": data = pageOf([]); break;
      case "/api/transactions": case "/api/reviews": case "/api/disputes": case "/api/user-documents": case "/api/vouchers": data = pageOf([]); break;
      default: errors.push(`Unexpected API path: ${url.pathname}`); return route.fulfill({ status: 501, json: { message: "Unhandled test endpoint" } });
    }
    return route.fulfill({ json: { success: true, data } });
  });
  return errors;
}

async function visit(page, path, text) {
  await page.goto(path);
  await expect(page.locator("main").first()).toContainText(text);
  await expect(page.getByText("Unexpected Application Error!", { exact: true })).toHaveCount(0);
}

test("account features render loaded profile, bank, and driver data", async ({ page }) => {
  const errors = await backend(page);
  await visit(page, "/account", customer.email);
  await visit(page, "/account/bank", "Structure Bank");
  await visit(page, "/account/driver", "Tài xế #1");
  expect(errors).toEqual([]);
});

test("booking, payment, review, and dispute features render loaded order data", async ({ page }) => {
  const errors = await backend(page);
  for (const path of ["/my-trips", "/orders/7", "/payment?orderId=7", "/reviews?orderId=7", "/disputes?orderId=7"]) {
    await visit(page, path, path.startsWith("/reviews") ? "Structure Owner" : "Structure SUV");
  }
  expect(errors).toEqual([]);
});

test("owner features render loaded vehicles, requests, trips, calendar, and payouts", async ({ page }) => {
  const errors = await backend(page);
  for (const path of ["/owner/dashboard", "/owner/vehicles", "/owner/requests", "/owner/trips", "/owner/calendar", "/owner/payouts"]) {
    await visit(page, path, path.endsWith("/payouts") ? "Structure Bank" : "Structure SUV");
  }
  expect(errors).toEqual([]);
});

test("admin features render loaded users, cars, orders, dashboard, and payouts", async ({ page }) => {
  const errors = await backend(page);
  for (const [path, text] of [["/admin/dashboard", "STRUCTURE-007"], ["/admin/users", customer.email], ["/admin/vehicles", "Structure SUV"], ["/admin/orders", "STRUCTURE-007"], ["/admin/payouts", "STRUCTURE-007"]]) {
    await visit(page, path, text);
  }
  expect(errors).toEqual([]);
});
