import { defineConfig, devices } from "@playwright/test";

// End-to-end tests against the production build (`npm run build` first; CI does it). Desktop Chrome + a phone.
const PORT = 3100;
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // two workers: the scroll/timing checks get flaky when many browsers share a small machine
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: `npx next start -p ${PORT}`, port: PORT, reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
