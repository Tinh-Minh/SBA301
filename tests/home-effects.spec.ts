import { test, expect } from "@playwright/test";

test("Hero animates independently of the stationary photograph", async ({ page }) => {
  await page.goto("/");
  const photo = page.locator(".hero-car-photo");
  const wheel = page.locator(".hero-wheel-spin").first();
  await expect(photo).toHaveCSS("animation-name", "none");
  await expect(photo).toHaveCSS("transform", "none");
  await expect(wheel).toHaveCSS("animation-name", "hero-wheel-turn");
  await expect(page.locator(".hero-headlight").first()).toHaveCSS("animation-name", "hero-lights");
  await expect(page.getByRole("button", { name: /chuyển động/ })).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Hero respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-wheel-spin").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-headlight").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-wind")).toBeHidden();
});

test("Grid lights orange under cursor and fades on exit", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#interactive-grid-zone");
  await expect(grid.locator("#hero-section")).toBeVisible();
  await expect(grid.locator("#home-search")).toBeVisible();
  await grid.scrollIntoViewIfNeeded();
  const bounds = (await grid.boundingBox())!;
  await page.mouse.move(bounds.x + 72, bounds.y + 240);
  await expect(grid).toHaveAttribute("data-glowing", "true");
  await expect(page.locator(".grid-reveal")).toHaveCSS("opacity", "1");
  expect(await grid.evaluate(el => el.style.getPropertyValue("--grid-x"))).toBe("72px");
  expect(await grid.evaluate(el => el.style.getPropertyValue("--grid-y"))).toBe("240px");
  const photo = (await page.locator(".hero-car-photo").boundingBox())!;
  await page.mouse.move(photo.x + photo.width / 2, photo.y + photo.height / 2);
  await expect(grid).toHaveAttribute("data-glowing", "true");
  await page.mouse.move(1, 1);
  await expect(grid).toHaveAttribute("data-glowing", "false");
  await expect(page.locator(".grid-reveal")).toHaveCSS("opacity", "0");
  await page.getByRole("button", { name: "Tìm xe ngay", exact: true }).click();
  await expect(page).toHaveURL(/kham-pha-xe\?location=/);
});

test("Grid follows page scrolling beneath a stationary cursor", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#interactive-grid-zone");
  await expect(grid).toHaveAttribute("data-glowing", "false");
  await page.mouse.move(80, 350);
  await expect(grid).toHaveAttribute("data-glowing", "true");
  await page.evaluate(() => window.scrollTo({ top: 150, behavior: "instant" }));
  await expect.poll(() => grid.evaluate(el => Number.parseFloat(el.style.getPropertyValue("--grid-y"))))
    .toBeCloseTo(350 - (await grid.boundingBox())!.y, 0);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(grid).toHaveAttribute("data-glowing", "false");
  await expect(page.locator(".grid-reveal")).toHaveCSS("opacity", "0");
});
