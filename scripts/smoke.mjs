#!/usr/bin/env node
/**
 * SMOKE TEST runner (AGENTS.md Quality Gate).
 *
 * Запускает 5 базовых сценариев из e2e/smoke.spec.ts.
 * Используется как часть Quality Gate перед сдачей работы.
 *
 * Использование:
 *   node scripts/smoke.mjs               # на localhost:3100
 *   node scripts/smoke.mjs --prod        # на https://dogovor.expert
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const ROOT = process.cwd();
const prod = process.argv.includes("--prod");
const base = prod ? "https://dogovor.expert" : "http://localhost:3100";

const args = [
  "playwright",
  "test",
  "e2e/smoke.spec.ts",
  "--reporter=line",
  "--grep-invert=skip",
  prod ? "--project=chromium-desktop-1440" : "--project=chromium-desktop-1440",
];
if (prod) {
  process.env.E2E_BASE_URL = base;
} else {
  args.push(`--config=playwright.config.ts`);
}

// На Windows npx — это npx.cmd, spawn("npx") без shell падает с ENOENT.
const isWin = process.platform === "win32";
const proc = spawn(isWin ? "npx.cmd" : "npx", args, {
  stdio: "inherit",
  cwd: ROOT,
  env: process.env,
  shell: isWin,
});
proc.on("exit", (code) => process.exit(code ?? 1));
