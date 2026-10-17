import { test, expect } from "@playwright/test";

test("Legacy trips URL redirects into the profile and keeps filter queries", async ({ page }) => {
    await page.goto("/chuyen-xe-cua-toi?status=confirmed&q=BMW");
    await expect(page).toHaveURL(/tai-khoan\/don-thue\?status=confirmed&q=BMW/);
    await expect(page.locator('[aria-label="Hồ sơ và tài khoản"] a[aria-current="page"]')).toContainText("Đơn thuê xe");
    await expect(page.locator('.site-header nav[aria-label="Điều hướng chính"] a[href="/tai-khoan/don-thue"]')).toHaveCount(0);
    await expect(page.locator('[data-trip-card]')).toHaveCount(1);
    await expect(page.locator('[data-trip-card]')).toContainText("BMW 530i");
    await expect(page.getByRole("link", { name: "Thanh toán ngay", exact: true })).toHaveAttribute("href", /thanh-toan\?order=CDB-ORD-20261102-418/);
    await expect(page.locator('[data-trip-card]')).toContainText("Hạn thanh toán");
});

test("Filters, sorting, real pagination, and reload use the shared booking collection", async ({ page }) => {
    await page.goto("/tai-khoan/don-thue");
    await expect(page.getByRole("button", { name: "Tất cả (7)", exact: true })).toBeVisible();
    await expect(page.locator('[data-trip-card]')).toHaveCount(4);
    await page.getByRole("button", { name: "Trang sau", exact: true }).click();
    await expect(page.locator('[data-trip-card]')).toHaveCount(3);
    await page.getByRole("button", { name: "Đã xác nhận (2)", exact: true }).click();
    await expect(page.locator('[data-trip-card]')).toHaveCount(2);
    await page.getByRole("combobox", { name: "Sắp xếp chuyến xe", exact: true }).selectOption("price");
    await expect(page.locator('[data-trip-card]').first()).toContainText("Porsche Taycan");
    await page.getByRole("combobox", { name: "Thời gian nhận xe", exact: true }).selectOption("2026-11");
    await page.getByRole("searchbox").fill("BMW");
    await page.reload();
    await expect(page.getByRole("searchbox")).toHaveValue("BMW");
    await expect(page.locator('[data-trip-card]')).toHaveCount(1);
    await page.getByRole("searchbox").fill("");
    await page.getByRole("button", { name: "Đang thuê (1)", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Chưa có chuyến xe");
    await page.getByRole("combobox", { name: "Thời gian nhận xe", exact: true }).selectOption("all");
    await expect(page.locator('[data-trip-card]')).toContainText("Nhiên liệu: 85%");
    await expect(page.locator('[data-trip-card]')).toContainText("142 km");
    await expect(page.getByRole("link", { name: "Vị trí & Biên nhận", exact: true })).toBeVisible();
});

test("Trip cards open the matching details and cancellation persists into profile history", async ({ page }) => {
    await page.goto("/tai-khoan/don-thue?status=pending");
    await page.locator('[data-trip-card] h2').click();
    await expect(page.getByRole("dialog")).toContainText("VF 9 Plus AWD");
    await expect(page).toHaveURL(/order=CDB-ORD-20261026-904/);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Hủy yêu cầu", exact: true }).click();
    const hold = page.getByRole("button", { name: "Giữ để hủy đặt xe", exact: true });
    await hold.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await hold.focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(1750);
    await page.keyboard.up("Space");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Chờ xác nhận (0)", exact: true })).toBeVisible();
    await page.goto("/tai-khoan/lich-su?status=cancelled");
    await expect(page.locator('[data-trip-card]')).toHaveCount(2);
    await expect(page.locator('[data-trip-card]').filter({ hasText: "VF 9 Plus AWD" })).toHaveCount(1);
    await page.reload();
    await expect(page.locator('[data-trip-card]')).toHaveCount(2);
});

test("History keeps invoice, return records, review and rebooking; CSV follows filters", async ({ page }) => {
    await page.goto("/tai-khoan/lich-su?status=completed&q=VF%208");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Xuất CSV", exact: true }).click();
    const report = await download;
    expect(report.suggestedFilename()).toBe("cardb-lich-su.csv");
    const stream = await report.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const csv = Buffer.concat(chunks).toString("utf8");
    expect(csv).toContain("CDB-ORD-20261015-883");
    expect(csv).not.toContain("CDB-ORD-20260910-671");
    await page.getByRole("button", { name: "Tải hóa đơn VAT", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("2.500.000 đ");
    await expect(page.getByRole("button", { name: "In / Lưu PDF", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Biên bản trả xe C10-B", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("218 km");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Xem đánh giá 5.0", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("5.0 / 5");
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "Đặt lại xe này", exact: true }).click();
    await expect(page).toHaveURL(/xe\/vinfast-vf8-plus-2024$/);
});
