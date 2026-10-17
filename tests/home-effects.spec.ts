import { test, expect } from "@playwright/test";

test("Hero uses full-frame footage without information overlays", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".hero-car-video");
  await expect(video).toHaveAttribute("src", "/videos/hero-car-rain.mp4");
  await expect.poll(() => video.evaluate(el => (el as HTMLVideoElement).currentTime)).toBeGreaterThan(.1);
  expect(await video.evaluate(el => (el as HTMLVideoElement).muted)).toBe(true);
  await expect(page.locator(".hero-car-card")).toHaveText("");
  await expect(page.locator(".hero-car-hud,.hero-car-effects")).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Hero respects reduced motion and pauses outside viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const video = page.locator(".hero-car-video");
  await expect(video).toHaveAttribute("poster", "/images/hero-car-rain.webp");
  expect(await video.evaluate(el => (el as HTMLVideoElement).paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => video.evaluate(el => (el as HTMLVideoElement).currentTime)).toBeGreaterThan(.1);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate(el => (el as HTMLVideoElement).paused)).toBe(true);
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
  const photo = (await page.locator(".hero-car-video").boundingBox())!;
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
