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
  await expect(page.locator(".home-entry-grid")).toBeHidden();
  await expect(page.locator(".site-header")).toHaveCSS("opacity", "1");
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
  await page.mouse.move(-1, -1);
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


test("Entrance shows video on black, then grid, then light", async ({ page }) => {
 await page.goto("/");
 async function frame(time: number) {
  await page.evaluate(value => {
   for (const animation of document.getAnimations()) {
    if (animation instanceof CSSAnimation && animation.animationName.startsWith("home-")) {
     animation.pause(); animation.currentTime = value;
    }
   }
  }, time);
 }
 await frame(350);
 await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
 await expect(page.locator(".site-header")).toHaveCSS("opacity", "0");
 await expect(page.locator(".home-entry-grid")).toHaveCSS("opacity", "0");
 await frame(1200);
 const card = (await page.locator(".hero-car-card").boundingBox())!;
 const viewport = page.viewportSize()!;
 expect(Math.abs(card.x + card.width / 2 - viewport.width / 2)).toBeLessThan(2);
 expect(Math.abs(card.y + card.height / 2 - viewport.height / 2)).toBeLessThan(2);
 await expect(page.locator(".hero-car-card")).toHaveCSS("border-top-width", "0px");
 await expect(page.locator(".hero-car-card")).toHaveCSS("mask-image", "none");
 await expect(page.locator(".hero-car-card")).toHaveCSS("background-color", "rgb(0, 0, 0)");
 await expect(page.locator(".hero-car-video")).toHaveCSS("filter", "none");
 const gridBehindVideo = await page.evaluate(() => {
  const grid = getComputedStyle(document.querySelector(".home-entry-grid")!);
  const hero = getComputedStyle(document.querySelector("#hero-section")!);
  return Number(grid.zIndex) < Number(hero.zIndex);
 });
 expect(gridBehindVideo).toBe(true);
 const gridBounds = (await page.locator(".home-entry-grid").boundingBox())!;
 expect(gridBounds.y).toBe(0);
 expect(gridBounds.width).toBe(viewport.width);
 expect(gridBounds.height).toBeGreaterThanOrEqual(viewport.height);
 await expect(page.locator(".home-entry-grid")).toHaveCSS("mask-image", "none");
 await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
 expect(await page.locator(".home-entry-grid").evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
 await expect(page.locator(".home-entry-light")).toHaveCSS("opacity", "0");
 await frame(2100);
 expect(await page.locator(".home-entry-light").evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.1);
 await frame(3200);
 await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
 await expect(page.locator(".site-header")).toHaveCSS("opacity", "1");
 await expect(page.locator("#home-search")).toHaveCSS("opacity", "1");
 await expect(page.locator(".home-entry-grid")).toHaveCSS("opacity", "0");
});

test("Mobile entrance centers footage and covers the viewport with grid", async ({ page }) => {
 await page.setViewportSize({ width: 375, height: 900 });
 await page.goto("/");
 await expect(page.locator(".hero-car-card")).toHaveAttribute("data-entry-ready", "true");
 await page.evaluate(() => {
  for (const animation of document.getAnimations()) {
   if (animation instanceof CSSAnimation && animation.animationName.startsWith("home-")) {
    animation.pause(); animation.currentTime = 1200;
   }
  }
 });
 const card = (await page.locator(".hero-car-card").boundingBox())!;
 expect(Math.abs(card.x + card.width / 2 - 187.5)).toBeLessThan(2);
 expect(Math.abs(card.y + card.height / 2 - 450)).toBeLessThan(2);
 const grid = (await page.locator(".home-entry-grid").boundingBox())!;
 expect(grid.y).toBe(0);
 expect(grid.height).toBeGreaterThanOrEqual(900);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const input of ["wheel", "keyboard", "touch", "scrollbar"] as const) {
 test(`Scrolling with ${input} immediately completes entrance`, async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-car-card")).toHaveAttribute("data-entry-ready", "true");
  await page.evaluate(() => {
   for (const animation of document.getAnimations()) {
    if (animation instanceof CSSAnimation && animation.animationName.startsWith("home-")) {
     animation.pause(); animation.currentTime = 350;
    }
   }
  });
  await expect(page.locator(".site-header")).toHaveCSS("opacity", "0");
  if (input === "wheel") await page.mouse.wheel(0, 200);
  if (input === "keyboard") await page.keyboard.press("PageDown");
  if (input === "touch") await page.evaluate(() => window.dispatchEvent(new Event("touchmove")));
  if (input === "scrollbar") await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  await expect(page.locator(".site-header")).toHaveCSS("opacity", "1");
  await expect(page.locator("#home-search")).toHaveCSS("opacity", "1");
  await expect(page.locator(".home-entry-grid")).toHaveCSS("opacity", "0");
  await expect(page.locator(".home-entry-light")).toHaveCSS("opacity", "0");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".hero-car-card")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  if (input !== "touch") await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
 });
}
