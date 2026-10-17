import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  webServer: { command: "npm run start -- --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: false },
});
