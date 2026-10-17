import { test, expect } from "@playwright/test";

test("Hero animates independently of the stationary photograph", async ({ page }) => {
  await page.goto("/");
  const photo = page.locator(".hero-car-photo");
  const wheel = page.locator(".hero-wheel-spin").first();
  await expect(photo).toHaveCSS("animation-name", "none");
  await expect(photo).toHaveCSS("transform", "none");
  await expect(wheel).toHaveCSS("animation-name", "hero-wheel-turn");
  const bounds = await photo.boundingBox();
  await page.getByRole("button", { name: "Dừng chuyển động" }).click();
  await expect(wheel).toHaveCSS("animation-play-state", "paused");
  await expect(page.locator(".hero-headlight").first()).toHaveCSS("animation-play-state", "paused");
  expect(await photo.boundingBox()).toEqual(bounds);
  await page.getByRole("button", { name: "Bật chuyển động" }).click();
  await expect(wheel).toHaveCSS("animation-play-state", "running");
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(page.locator(".hero-motion-toggle")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Hero respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-wheel-spin").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-headlight").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-wind")).toBeHidden();
  await expect(page.locator(".hero-motion-toggle")).toBeHidden();
});

test("Grid lights orange under cursor and fades on exit", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#interactive-grid-zone");
  await grid.scrollIntoViewIfNeeded();
  const bounds = (await grid.boundingBox())!;
  await page.mouse.move(bounds.x + 48, bounds.y + 24);
  await expect(grid).toHaveAttribute("data-glowing", "true");
  await expect(page.locator(".grid-active-cell")).toHaveCSS("opacity", "1");
  expect(await grid.evaluate(el => el.style.getPropertyValue("--cell-x"))).toBe("32px");
  expect(await grid.evaluate(el => el.style.getPropertyValue("--cell-y"))).toBe("0px");
  await page.mouse.move(1, 1);
  await expect(grid).toHaveAttribute("data-glowing", "false");
  await expect(page.locator(".grid-active-cell")).toHaveCSS("opacity", "0");
  await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
  await expect(page).toHaveURL(/kham-pha-xe\?location=/);
});
