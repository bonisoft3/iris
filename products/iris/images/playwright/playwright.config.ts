import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          ignoreDefaultArgs: ['--headless'],
          args: [
           '--headless=new',
           '--unsafely-treat-insecure-origin-as-secure="http://guis-web-svc:8080"',
           '--allow-running-insecure-content' ,
           "--use-fake-device-for-media-stream",
          ]
        },
        permissions: ["camera", "geolocation"],
        geolocation: { latitude: 10, longitude: 10 },
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            // use fake audio and video media
            "media.navigator.streams.fake": true,
            "permissions.default.microphone": 1,
            "permissions.default.camera": 1,
          },
        },
     },
    },
  ]
});
