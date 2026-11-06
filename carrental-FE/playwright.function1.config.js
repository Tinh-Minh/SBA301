import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    testMatch: "function1-browser-e2e.spec.js",
    timeout: 300_000,
    expect: { timeout: 20_000 },
    workers: 1,
    fullyParallel: false,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:3000",
        browserName: "chromium",
        headless: true,
        viewport: { width: 1440, height: 1000 },
        timezoneId: "Asia/Ho_Chi_Minh",
        launchOptions: {
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            args: ["--no-sandbox"],
        },
    },
});
