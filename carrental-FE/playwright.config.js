import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: "http://127.0.0.1:3000",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : "/usr/bin/chromium"),
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: { command: "npm run start", url: "http://127.0.0.1:3000", reuseExistingServer: true },
});
