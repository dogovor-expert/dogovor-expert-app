import { defineConfig } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: "D:/Мои сайты/site Dogovor/e2e/a11y",
  timeout: 180000,
  expect: { timeout: 25000 },
  reporter: [["list"]],
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: "a11y", use: {} }],
});
