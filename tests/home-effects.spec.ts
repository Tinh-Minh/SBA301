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
