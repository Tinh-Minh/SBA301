import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const dbContainer = process.env.F1_E2E_DB_CONTAINER;
const runtimeDir = process.env.F1_E2E_RUNTIME_DIR;
const screenshotDir = resolve(process.cwd(), "../docs/reports/F1_E2E_Screenshots");
const customerPassword = "F1-E2E-Customer-Only-2026!";

function db(sql) {
    if (!dbContainer) throw new Error("F1_E2E_DB_CONTAINER must name the isolated PostgreSQL container");
    return execFileSync("docker", [
        "exec", dbContainer, "psql", "-U", "f1e2e", "-d", "f1_e2e", "-At", "-v", "ON_ERROR_STOP=1", "-c", sql,
    ], { encoding: "utf8", windowsHide: true }).trim();
}

function checkedDatabaseValue(checks, name, sql, expected) {
    const actual = db(sql);
    expect(actual, `${name} persisted value`).toBe(expected);
    checks.push({ name, result: "PASS", database: actual });
    return actual;
}

async function capture(page, name) {
    await page.screenshot({ path: join(screenshotDir, name), fullPage: true });
}

async function fetchAvailableVouchers(page, packageId) {
    return page.evaluate(async ({ packageId }) => {
        const session = JSON.parse(localStorage.getItem("cardb:session:v2") ?? "{}");
        const response = await fetch(`/api/vouchers/available?packageId=${packageId}`, {
            headers: { Authorization: `${session.tokenType ?? "Bearer"} ${session.accessToken ?? ""}` },
        });
        return { status: response.status, payload: await response.json() };
    }, { packageId });
}

async function registerCustomer(page, name, email, phone, checks, label) {
    await page.goto("/register");
    await page.locator("#reg-fullname").fill(name);
    await page.locator("#reg-email").fill(email);
    await page.locator("#reg-phone").fill(phone);
    await page.locator("#reg-password").fill(customerPassword);
    await page.locator("#reg-confirm-password").fill(customerPassword);
    await page.locator("#reg-terms").check();
    const registration = page.waitForResponse(response =>
        new URL(response.url()).pathname === "/api/auth/register" && response.request().method() === "POST");
    await page.getByRole("button", { name: "Đăng ký tài khoản" }).click();
    const response = await registration;
    expect(response.status(), `${label} registration HTTP`).toBe(201);
    await expect(page).toHaveURL(/\/account\/?$/);
    const actual = db(`select id || '|' || role || '|' || status || '|' || kyc_status from customers where email='${email}'`);
    const [idValue, role, status, kycStatus] = actual.split("|");
    expect(role, `${label} stored role`).toBe("CUSTOMER");
    expect(status, `${label} stored status`).toBe("ACTIVE");
    expect(kycStatus, `${label} initial KYC status`).toBe("NONE");
    checks.push({ name: `${label}: registered as an active customer`, result: "PASS", database: actual });
    const id = Number(idValue);
    expect(id).toBeGreaterThan(0);
    return id;
}

async function uploadDocument(page, checks, values, imagePath) {
    const form = page.locator("form").filter({ has: page.getByRole("heading", { name: "Nộp giấy tờ mới" }) });
    await form.getByLabel("Loại giấy tờ").selectOption(values.type);
    await form.getByLabel("Số giấy tờ").fill(values.number);
    await form.getByLabel("Họ tên trên giấy").fill(values.name);
    await form.getByLabel("Ngày sinh trên giấy").fill("1995-05-14");
    await form.getByLabel("Nơi cấp").fill("Hanoi E2E");
    await form.getByLabel("Ngày cấp").fill("2020-01-01");
    await form.getByLabel("Ngày hết hạn").fill("2035-01-01");
    if (values.type === "DRIVER_LICENSE") await form.getByLabel("Hạng bằng").fill("B2");
    const files = form.locator('input[type="file"]');
    await files.nth(0).setInputFiles(imagePath);
    await files.nth(1).setInputFiles(imagePath);
    const submission = page.waitForResponse(response =>
        new URL(response.url()).pathname === "/api/user-documents" && response.request().method() === "POST");
    await form.getByRole("button", { name: "Gửi hồ sơ" }).click();
    const response = await submission;
    const payload = await response.json().catch(() => ({}));
    const errorSummary = payload?.errors?.map(error => `${error.field ?? ""}:${error.message ?? ""}`).join(", ") ?? payload?.code ?? "";
    expect(response.status(), `${values.type} upload HTTP (${errorSummary})`).toBe(201);
    await expect(page.getByText("Chờ duyệt").first()).toBeVisible();
    const stored = db(`select id || '|' || doc_type || '|' || verify_status from user_documents where doc_number='${values.number}'`);
    expect(stored).toMatch(/^\d+\|[A-Z_]+\|PENDING$/);
    checks.push({ name: `${values.type}: upload persisted as PENDING`, result: "PASS", database: stored });
    return Number(stored.split("|")[0]);
}

async function loginAdmin(page) {
    await page.goto("/login");
    await page.locator("#login-account").fill("admin.f1.e2e@example.com");
    await page.locator("#login-password").fill("F1-E2E-Admin-Only-2026!");
    const login = page.waitForResponse(response =>
        new URL(response.url()).pathname === "/api/auth/login" && response.request().method() === "POST");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    const response = await login;
    expect(response.status(), "admin login HTTP").toBe(200);
    await expect(page).toHaveURL(/\/admin\/dashboard\/?$/);
}

test("Function 1 browser-to-PostgreSQL business flows", async ({ browser }) => {
    test.setTimeout(300_000);
    if (!runtimeDir) throw new Error("F1_E2E_RUNTIME_DIR must point to the isolated test runtime directory");
    mkdirSync(screenshotDir, { recursive: true });
    const checks = [];
    const suffix = randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
    const customerName = `F1 E2E Customer ${suffix}`;
    const customerEmail = `f1e2e.customer.${suffix.toLowerCase()}@example.com`;
    const rejectedName = `F1 E2E Reject ${suffix}`;
    const rejectedEmail = `f1e2e.reject.${suffix.toLowerCase()}@example.com`;
    const identityNumber = `E2EID${suffix}`;
    const licenseNumber = `E2ELIC${suffix}`;
    const rejectedDocumentNumber = `E2EPAS${suffix}`;
    const phoneSeed = Number.parseInt(suffix.slice(0, 8), 16) % 99_999_998 + 1;
    const customerPhone = `09${String(phoneSeed).padStart(8, "0")}`;
    const rejectedPhone = `09${String(phoneSeed + 1).padStart(8, "0")}`;
    const imagePath = join(runtimeDir, "synthetic-document.png");
    const customerContext = await browser.newContext();
    const rejectedContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const loginContext = await browser.newContext();
    const customer = await customerContext.newPage();
    const rejectedCustomer = await rejectedContext.newPage();
    const admin = await adminContext.newPage();
    const loginPage = await loginContext.newPage();
    let customerId = 0;
    let rejectedCustomerId = 0;
    let identityDocumentId = 0;
    let licenseDocumentId = 0;
    let rejectedDocumentId = 0;

    try {
        // Create a valid, synthetic PNG in the browser; no real identity image is used.
        const imageBase64 = await customer.evaluate(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const context = canvas.getContext("2d");
            context.fillStyle = "#e85d24";
            context.fillRect(0, 0, 32, 32);
            context.fillStyle = "#ffffff";
            context.fillRect(8, 8, 16, 16);
            return canvas.toDataURL("image/png").split(",")[1];
        });
        writeFileSync(imagePath, Buffer.from(imageBase64, "base64"));

        customerId = await registerCustomer(
            customer, customerName, customerEmail, customerPhone, checks, "Customer A");
        await capture(customer, "01-customer-registered.png");

        await loginPage.goto("/login");
        await loginPage.locator("#login-account").fill(customerEmail);
        await loginPage.locator("#login-password").fill(customerPassword);
        const customerLogin = loginPage.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/auth/login" && response.request().method() === "POST");
        await loginPage.getByRole("button", { name: "Đăng nhập" }).click();
        const customerLoginResponse = await customerLogin;
        expect(customerLoginResponse.status(), "customer login HTTP").toBe(200);
        await expect(loginPage).toHaveURL(/\/explore\/?$/);
        checkedDatabaseValue(
            checks, "Customer A: authenticated account remains active",
            `select role || '|' || status from customers where id=${customerId}`, "CUSTOMER|ACTIVE");

        await customer.goto("/account");
        await expect(customer.getByRole("heading", { name: "Thông tin cá nhân" })).toBeVisible();
        await customer.getByRole("button", { name: "Chỉnh sửa" }).click();
        await customer.locator("#profile-zalo-phone").fill("0905555555");
        await customer.locator("#profile-contact-note").fill("F1 E2E call after 18:00");
        const profileSave = customer.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/customers/me" && response.request().method() === "PUT");
        await customer.getByRole("button", { name: "Lưu thay đổi" }).click();
        expect((await profileSave).status(), "profile update HTTP").toBe(200);
        await expect(customer.getByText("0905555555", { exact: true })).toBeVisible();
        checkedDatabaseValue(
            checks, "Profile: Zalo/contact note persisted without changing name/phone",
            `select coalesce(zalo_phone,'') || '|' || coalesce(contact_note,'') || '|' || full_name || '|' || phone from customers where id=${customerId}`,
            `0905555555|F1 E2E call after 18:00|${customerName}|${customerPhone}`);
        await capture(customer, "02-customer-profile-updated.png");

        await customer.goto("/account/verification");
        await expect(customer.getByRole("heading", { name: "Xác minh giấy tờ" })).toBeVisible();
        identityDocumentId = await uploadDocument(customer, checks, {
            type: "CITIZEN_ID", number: identityNumber, name: customerName,
        }, imagePath);
        licenseDocumentId = await uploadDocument(customer, checks, {
            type: "DRIVER_LICENSE", number: licenseNumber, name: customerName,
        }, imagePath);
        await capture(customer, "03-customer-kyc-pending.png");

        rejectedCustomerId = await registerCustomer(
            rejectedCustomer, rejectedName, rejectedEmail, rejectedPhone, checks, "Customer B");
        await rejectedCustomer.goto("/account/verification");
        rejectedDocumentId = await uploadDocument(rejectedCustomer, checks, {
            type: "PASSPORT", number: rejectedDocumentNumber, name: rejectedName,
        }, imagePath);

        await loginAdmin(admin);
        const adminId = Number(db("select id from customers where email='admin.f1.e2e@example.com' and role='ADMIN'"));
        expect(adminId).toBeGreaterThan(0);

        await admin.goto(`/admin/users?id=${customerId}`);
        const identityCard = admin.getByText("CCCD / CMND", { exact: true }).locator("xpath=../..");
        await expect(identityCard).toBeVisible();
        await identityCard.getByRole("button", { name: "Xem ảnh giấy tờ" }).click();
        await expect(identityCard.getByAltText("Ảnh giấy tờ")).toHaveCount(2);
        const approveIdentity = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/user-documents/${identityDocumentId}/review`
            && response.request().method() === "PATCH");
        await identityCard.getByRole("button", { name: "Duyệt" }).click();
        expect((await approveIdentity).status(), "identity review HTTP").toBe(200);
        await expect(identityCard.getByText("Đã duyệt", { exact: true })).toBeVisible();
        checkedDatabaseValue(
            checks, "Admin: citizen ID approved and KYC promoted",
            `select d.verify_status || '|' || d.verified_by || '|' || c.kyc_status from user_documents d join customers c on c.id=d.customer_id where d.id=${identityDocumentId}`,
            `APPROVED|${adminId}|VERIFIED`);

        const licenseCard = admin.getByText("Giấy phép lái xe", { exact: true }).locator("xpath=../..");
        const approveLicense = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/user-documents/${licenseDocumentId}/review`
            && response.request().method() === "PATCH");
        await licenseCard.getByRole("button", { name: "Duyệt" }).click();
        expect((await approveLicense).status(), "license review HTTP").toBe(200);
        await expect(licenseCard.getByText("Đã duyệt", { exact: true })).toBeVisible();
        checkedDatabaseValue(
            checks, "Admin: driver license approved and stored",
            `select doc_type || '|' || verify_status || '|' || coalesce(license_class,'') from user_documents where id=${licenseDocumentId}`,
            "DRIVER_LICENSE|APPROVED|B2");
        await capture(admin, "04-admin-kyc-approved.png");

        await admin.goto(`/admin/users?id=${rejectedCustomerId}`);
        const passportCard = admin.getByText("Hộ chiếu", { exact: true }).locator("xpath=../..");
        await expect(passportCard).toBeVisible();
        await passportCard.getByRole("button", { name: "Từ chối" }).click();
        await admin.getByLabel("Lý do").fill("Synthetic E2E document mismatch");
        const rejectDocument = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/user-documents/${rejectedDocumentId}/review`
            && response.request().method() === "PATCH");
        await admin.getByRole("button", { name: "Xác nhận" }).click();
        expect((await rejectDocument).status(), "passport rejection HTTP").toBe(200);
        await expect(passportCard.getByText("Bị từ chối", { exact: true })).toBeVisible();
        checkedDatabaseValue(
            checks, "Admin: passport rejection and reason persisted",
            `select d.verify_status || '|' || coalesce(d.reject_reason,'') || '|' || c.kyc_status from user_documents d join customers c on c.id=d.customer_id where d.id=${rejectedDocumentId}`,
            "REJECTED|Synthetic E2E document mismatch|REJECTED");
        await capture(admin, "05-admin-kyc-rejected.png");

        const driverRead = customer.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/drivers/me" && response.request().method() === "GET");
        const eligibilityRead = customer.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/drivers/me/eligibility" && response.request().method() === "GET");
        await customer.goto("/account/driver");
        const [driverView, eligibilityView] = await Promise.all([driverRead, eligibilityRead]);
        expect(driverView.status(), "missing driver profile returns 404 before registration").toBe(404);
        expect(eligibilityView.status(), "driver eligibility HTTP").toBe(200);
        const driverJson = await eligibilityView.json();
        expect(driverJson.data.kycStatus).toBe("VERIFIED");
        expect(driverJson.data.hasValidDriverLicense).toBe(true);
        expect(driverJson.data.ineligibilityReasonCode).toBe("DRIVER_PROFILE_MISSING");
        const driverCreate = customer.waitForResponse(response =>
            new URL(response.url()).pathname.includes("/api/drivers") && response.request().method() === "POST");
        await customer.getByRole("button", { name: "Đăng ký hồ sơ tài xế" }).click();
        expect((await driverCreate).status(), "driver registration HTTP").toBe(201);
        await expect(customer.getByText("Chờ duyệt", { exact: true })).toBeVisible();
        checkedDatabaseValue(
            checks, "Driver: profile persisted as PENDING with approved identity/license",
            `select d.status || '|' || c.kyc_status || '|' || (select verify_status from user_documents where customer_id=c.id and doc_type='DRIVER_LICENSE' order by id desc limit 1) from drivers d join customers c on c.id=d.customer_id where c.id=${customerId}`,
            "PENDING|VERIFIED|APPROVED");
        await capture(customer, "06-driver-profile.png");

        await customer.goto("/account/bank");
        await customer.getByLabel("Ngân hàng").fill("Vietcombank");
        await customer.getByLabel("Số tài khoản").fill("000123456789");
        await customer.getByLabel("Chủ tài khoản").fill("F1 E2E CUSTOMER");
        await customer.getByLabel("Đặt làm tài khoản mặc định").check();
        const firstBankCreate = customer.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/bank-accounts" && response.request().method() === "POST");
        await customer.getByRole("button", { name: "Lưu tài khoản" }).click();
        expect((await firstBankCreate).status(), "first bank account create HTTP").toBe(201);
        checkedDatabaseValue(
            checks, "Bank account: leading-zero account number and default persisted",
            `select account_number || '|' || is_default from bank_accounts where customer_id=${customerId} and bank_name='Vietcombank'`,
            "000123456789|true");
        await expect(customer.getByText(/••••|\*\*\*\*/)).toBeVisible();

        await customer.getByLabel("Ngân hàng").fill("ACB");
        await customer.getByLabel("Số tài khoản").fill("998877665544");
        await customer.getByLabel("Chủ tài khoản").fill("F1 E2E CUSTOMER");
        const secondBankCreate = customer.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/bank-accounts" && response.request().method() === "POST");
        await customer.getByRole("button", { name: "Lưu tài khoản" }).click();
        expect((await secondBankCreate).status(), "second bank account create HTTP").toBe(201);
        checkedDatabaseValue(
            checks, "Bank account: second account stored without replacing current default",
            `select count(*) || '|' || count(*) filter (where is_default) from bank_accounts where customer_id=${customerId}`,
            "2|1");
        const setDefault = customer.waitForResponse(response =>
            new URL(response.url()).pathname.endsWith("/default") && response.request().method() === "PATCH");
        await customer.getByRole("button", { name: "Đặt mặc định" }).click();
        expect((await setDefault).status(), "bank account default update HTTP").toBe(200);
        checkedDatabaseValue(
            checks, "Bank account: default selection switched to ACB",
            `select string_agg(bank_name || ':' || is_default, ',' order by bank_name) from bank_accounts where customer_id=${customerId}`,
            "ACB:true,Vietcombank:false");
        await capture(customer, "07-bank-accounts.png");

        await admin.goto("/admin/packages");
        await expect(admin.getByRole("heading", { name: "Gói đăng tin" })).toBeVisible();
        const packageCodes = {
            base: `E2E_BASE_${suffix}`,
            vip: `E2E_VIP_${suffix}`,
            hidden: `E2E_HIDDEN_${suffix}`,
        };
        async function createPackage(code, name, price, days, priority, active) {
            await admin.getByRole("button", { name: /Tạo gói/ }).click();
            const form = admin.locator("#listing-package-form");
            await form.getByLabel("Tên gói").fill(name);
            await form.getByLabel("Mã gói").fill(code);
            await form.getByLabel("Giá (đ)").fill(String(price));
            await form.getByLabel("Thời hạn (ngày)").fill(String(days));
            await form.getByLabel("Mức ưu tiên").selectOption(String(priority));
            await form.getByLabel("Nhãn huy hiệu").fill(`E2E ${priority}`);
            await form.getByLabel("Mô tả").fill(`Synthetic ${name}`);
            const publicToggle = form.getByLabel("Hiển thị công khai");
            if (active) await publicToggle.check(); else await publicToggle.uncheck();
            const responseWait = admin.waitForResponse(response =>
                new URL(response.url()).pathname === "/api/admin/packages" && response.request().method() === "POST");
            await form.getByRole("button", { name: "Lưu gói" }).click();
            expect((await responseWait).status(), `${code} create HTTP`).toBe(201);
            await expect(admin.getByText(code, { exact: true })).toBeVisible();
            checkedDatabaseValue(
                checks, `Package: ${code} created in PostgreSQL`,
                `select is_active || '|' || priority_level || '|' || price from listing_packages where code='${code}'`,
                `${active}|${priority}|${price}`);
        }
        await createPackage(packageCodes.base, `E2E Base ${suffix}`, 250000, 7, 1, true);
        await createPackage(packageCodes.vip, `E2E VIP ${suffix}`, 500000, 30, 3, true);
        await createPackage(packageCodes.hidden, `E2E Hidden ${suffix}`, 350000, 14, 2, false);
        const basePackageId = Number(db(`select id from listing_packages where code='${packageCodes.base}'`));
        const baseEdit = admin.getByRole("button", { name: `Sửa gói E2E Base ${suffix}` });
        await baseEdit.click();
        const editPackageForm = admin.locator("#listing-package-form");
        await editPackageForm.getByLabel("Giá (đ)").fill("275000");
        await editPackageForm.getByLabel("Thời hạn (ngày)").fill("14");
        await editPackageForm.getByLabel("Mức ưu tiên").selectOption("2");
        await editPackageForm.getByLabel("Mô tả").fill("Synthetic package updated from browser");
        const packageUpdate = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/admin/packages/${basePackageId}` && response.request().method() === "PUT");
        await editPackageForm.getByRole("button", { name: "Lưu gói" }).click();
        expect((await packageUpdate).status(), "package update HTTP").toBe(200);
        checkedDatabaseValue(
            checks, "Package: existing plan update persisted",
            `select is_active || '|' || priority_level || '|' || price || '|' || duration_days || '|' || description from listing_packages where id=${basePackageId}`,
            "true|2|275000|14|Synthetic package updated from browser");
        await capture(admin, "08-admin-packages.png");

        await customer.goto("/packages");
        await expect(customer.getByRole("heading", { name: "Gói đăng tin xe" })).toBeVisible();
        await expect(customer.getByText(`E2E VIP ${suffix}`, { exact: true })).toBeVisible();
        await expect(customer.getByText(`E2E Base ${suffix}`, { exact: true })).toBeVisible();
        await expect(customer.getByText(`E2E Hidden ${suffix}`, { exact: true })).toHaveCount(0);
        const pricingText = await customer.locator("main").innerText();
        expect(pricingText.indexOf(`E2E VIP ${suffix}`)).toBeLessThan(pricingText.indexOf(`E2E Base ${suffix}`));
        const publicPackages = db(`select string_agg(code || ':' || priority_level, ',' order by priority_level desc) from listing_packages where code in ('${packageCodes.base}','${packageCodes.vip}','${packageCodes.hidden}') and is_active`);
        expect(publicPackages).toContain(`${packageCodes.vip}:3`);
        expect(publicPackages).toContain(`${packageCodes.base}:2`);
        expect(publicPackages).not.toContain(packageCodes.hidden);
        checks.push({ name: "Public packages: active plans shown in priority order, inactive plan hidden", result: "PASS", database: publicPackages });
        await capture(customer, "09-public-packages.png");

        await admin.goto("/admin/vouchers");
        await expect(admin.getByRole("heading", { name: "Quản lý voucher" })).toBeVisible();
        await admin.getByRole("button", { name: /Tạo voucher/ }).click();
        const voucherDialog = admin.getByRole("dialog");
        await expect(voucherDialog.getByRole("heading", { name: "Tạo voucher mới" })).toBeVisible();
        const voucherCode = `E2E${suffix}`;
        await voucherDialog.getByLabel("Mã voucher").fill(voucherCode);
        await voucherDialog.getByLabel("Mô tả").fill("F1 E2E listing package voucher");
        await voucherDialog.getByLabel("Giá trị (%)").fill("15");
        await voucherDialog.getByLabel("Giảm tối đa (đ)").fill("50000");
        await voucherDialog.getByLabel("Đơn tối thiểu (đ)").fill("300000");
        await voucherDialog.getByLabel("Tổng lượt dùng").fill("10");
        await voucherDialog.getByLabel("Lượt / khách").fill("1");
        const voucherDates = await admin.evaluate(() => {
            const local = date => [
                date.getFullYear(), "-", String(date.getMonth() + 1).padStart(2, "0"), "-",
                String(date.getDate()).padStart(2, "0"), "T", String(date.getHours()).padStart(2, "0"), ":",
                String(date.getMinutes()).padStart(2, "0"),
            ].join("");
            return { start: local(new Date(Date.now() - 60 * 60 * 1000)), end: local(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) };
        });
        await voucherDialog.getByLabel("Bắt đầu").fill(voucherDates.start);
        await voucherDialog.getByLabel("Kết thúc").fill(voucherDates.end);
        const voucherCreate = admin.waitForResponse(response =>
            new URL(response.url()).pathname === "/api/vouchers" && response.request().method() === "POST");
        await voucherDialog.getByRole("button", { name: "Tạo voucher" }).click();
        expect((await voucherCreate).status(), "voucher create HTTP").toBe(201);
        await expect(admin.getByText(voucherCode, { exact: true })).toBeVisible();
        const voucherId = Number(db(`select id from vouchers where code='${voucherCode}'`));
        expect(voucherId).toBeGreaterThan(0);
        checkedDatabaseValue(
            checks, "Voucher: created active with usage quota",
            `select code || '|' || status || '|' || usage_limit || '|' || used_count from vouchers where id=${voucherId}`,
            `${voucherCode}|ACTIVE|10|0`);

        let voucherRow = admin.getByRole("row").filter({ hasText: voucherCode });
        await voucherRow.getByRole("button", { name: "Sửa" }).click();
        const editDialog = admin.getByRole("dialog");
        await editDialog.getByLabel("Mô tả").fill("F1 E2E voucher updated");
        await editDialog.locator('input[type="number"]').fill("12");
        const voucherUpdate = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/vouchers/${voucherId}` && response.request().method() === "PUT");
        await editDialog.getByRole("button", { name: "Lưu thay đổi" }).click();
        expect((await voucherUpdate).status(), "voucher update HTTP").toBe(200);
        checkedDatabaseValue(
            checks, "Voucher: description and usage quota updated",
            `select description || '|' || usage_limit from vouchers where id=${voucherId}`,
            "F1 E2E voucher updated|12");

        voucherRow = admin.getByRole("row").filter({ hasText: voucherCode });
        const deactivate = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/vouchers/${voucherId}/status` && response.request().method() === "PATCH");
        await voucherRow.getByRole("button", { name: "Tắt" }).click();
        expect((await deactivate).status(), "voucher deactivate HTTP").toBe(200);
        checkedDatabaseValue(
            checks, "Voucher: inactive status persisted",
            `select status from vouchers where id=${voucherId}`, "INACTIVE");
        const packageIds = Object.fromEntries(db(
            `select code || '|' || id from listing_packages where code in ('${packageCodes.base}','${packageCodes.vip}','${packageCodes.hidden}')`
        ).split("\n").map(row => row.split("|")));
        const inactiveVoucherCatalog = await fetchAvailableVouchers(customer, packageIds[packageCodes.vip]);
        expect(inactiveVoucherCatalog.status, "inactive voucher catalog HTTP").toBe(200);
        expect(inactiveVoucherCatalog.payload.data.map(voucher => voucher.code)).not.toContain(voucherCode);
        checks.push({ name: "Voucher catalog: inactive voucher is excluded", result: "PASS", database: "INACTIVE" });
        voucherRow = admin.getByRole("row").filter({ hasText: voucherCode });
        const reactivate = admin.waitForResponse(response =>
            new URL(response.url()).pathname === `/api/vouchers/${voucherId}/status` && response.request().method() === "PATCH");
        await voucherRow.getByRole("button", { name: "Bật" }).click();
        expect((await reactivate).status(), "voucher reactivate HTTP").toBe(200);
        checkedDatabaseValue(
            checks, "Voucher: active status restored",
            `select status from vouchers where id=${voucherId}`, "ACTIVE");
        const tooCheapPackageCatalog = await fetchAvailableVouchers(customer, packageIds[packageCodes.base]);
        expect(tooCheapPackageCatalog.status, "package below voucher minimum HTTP").toBe(200);
        expect(tooCheapPackageCatalog.payload.data.map(voucher => voucher.code)).not.toContain(voucherCode);
        const hiddenPackageCatalog = await fetchAvailableVouchers(customer, packageIds[packageCodes.hidden]);
        expect(hiddenPackageCatalog.status, "inactive package voucher catalog HTTP").toBe(404);
        const eligibleVoucherCatalog = await fetchAvailableVouchers(customer, packageIds[packageCodes.vip]);
        expect(eligibleVoucherCatalog.status, "eligible voucher catalog HTTP").toBe(200);
        expect(eligibleVoucherCatalog.payload.data.map(voucher => voucher.code)).toContain(voucherCode);
        for (const field of ["usedCount", "usageLimit", "perUserLimit", "status"]) {
            expect(eligibleVoucherCatalog.payload.data[0]).not.toHaveProperty(field);
        }
        checks.push({
            name: "Voucher catalog: package price, active window and customer quota allow safe display",
            result: "PASS",
            database: db(`select status || '|' || usage_limit || '|' || per_user_limit || '|' || min_order_amount from vouchers where id=${voucherId}`),
        });
        await capture(admin, "10-admin-vouchers.png");
        await customer.goto("/packages");
        await expect(customer.getByRole("heading", { name: "Gói đăng tin xe" })).toBeVisible();
        await expect(customer.getByText(`E2E VIP ${suffix}`, { exact: true })).toBeVisible();
        await capture(customer, "11-public-packages-after-voucher-check.png");
        checks.push({ name: "Known limitation: simultaneous KYC review race", result: "SKIPPED_AS_REQUESTED" });
    } finally {
        if (runtimeDir) {
            mkdirSync(resolve(process.cwd(), "../docs/reports"), { recursive: true });
            writeFileSync(
                resolve(process.cwd(), "../docs/reports/F1_E2E_PLAYWRIGHT_RESULTS.json"),
                JSON.stringify({ generatedAt: new Date().toISOString(), checks }, null, 2),
            );
        }
        await Promise.allSettled([customerContext.close(), rejectedContext.close(), adminContext.close(), loginContext.close()]);
    }
    expect(checks.length).toBeGreaterThanOrEqual(15);
});
