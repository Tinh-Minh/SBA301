import { test, expect } from "@playwright/test";
import routes from "./routes.json" with { type: "json" };

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`Controls and amounts remain readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const allIssues: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) failures.push("Page overflows viewport");
        for (const button of document.querySelectorAll("button")) {
          const label = button.getAttribute("aria-label") ?? "";
          if (!label || label.length > 65 || !button.getClientRects().length || button.closest("header") || button.querySelector("div,p,h2,h3")) continue;
          const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
          const lines: number[] = [];
          const bounds = button.getBoundingClientRect();
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if (!node.textContent?.trim() || node.parentElement?.closest("svg,.material-symbols-outlined,[aria-hidden='true']")) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) {
              if (!rect.width || !rect.height) continue;
              if (!lines.some(y => Math.abs(y - rect.top) < 3)) lines.push(rect.top);
              if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) failures.push(`Clipped button: ${label}`);
            }
          }
          if (lines.length > 1) failures.push(`Wrapped button: ${label}`);
        }
        for (const element of document.querySelectorAll("span,p,strong")) {
          if (element.children.length || !element.getClientRects().length || !/^[-+]?\d[\d.,]*\s*[đĐ]$/.test(element.textContent?.trim() ?? "")) continue;
          const range = document.createRange();
          range.selectNodeContents(element);
          const lines: number[] = [];
          for (const rect of range.getClientRects()) if (rect.width && !lines.some(y => Math.abs(y - rect.top) < 3)) lines.push(rect.top);
          if (lines.length > 1) failures.push(`Wrapped amount: ${element.textContent?.trim()}`);
        }
        return [...new Set(failures)];
      });
      allIssues.push(...issues.map(issue => `${route}: ${issue}`));
    }
    expect(allIssues, `Typography at ${width}px`).toEqual([]);
  });
}
