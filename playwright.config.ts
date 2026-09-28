import { defineConfig, devices } from "@playwright/test";

const viewports = [
  { name: "mobile-360", width: 360, height: 640 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const browsers = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];

const projects = browsers.flatMap((browser) =>
  viewports.map((vp) => ({
    name: `${browser.name}-${vp.name}`,
    use: { ...browser.use, viewport: { width: vp.width, height: vp.height } },
  }))
);

// Мобильные пресеты: touch + реальные deviceScaleFactor/viewport (в т.ч. «чёлка» iPhone).
// Отдельные проекты только для responsive-спеков (см. testMatch), чтобы не умножать все e2e.
const mobileDevices = [
  { name: "mobile-chromium-pixel7", use: { ...devices["Pixel 7"] } },
  { name: "mobile-webkit-iphone14", use: { ...devices["iPhone 13"] } },
];

const mobileProjects = mobileDevices.map((d) => ({
  name: d.name,
  testMatch: /responsive\.spec\.ts|overflow-diag\.spec\.ts|no-horizontal-overflow\.spec\.ts/,
  use: d.use,
}));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [...projects, ...mobileProjects],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    port: 3100,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
