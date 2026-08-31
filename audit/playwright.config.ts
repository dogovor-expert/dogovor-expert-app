import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";

const here = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  testDir: here,
  timeout: 240000,
  expect: { timeout: 25000 },
  reporter: [["list"]],
  fullyParallel: true,
  use: {
    baseURL: process.env.AUDIT_BASE || "https://dogovor.expert",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [{ name: "audit", use: {} }],
});