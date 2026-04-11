import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./playwright-tests",
  testMatch: "**/*.pw.ts",
  use: {
    browserName: "chromium",
    headless: true,
  },
  reporter: "list",
})
