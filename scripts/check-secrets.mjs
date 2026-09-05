#!/usr/bin/env node
/**
 * Gitleaks wrapper для pre-commit hook.
 * Запускает gitleaks на staged-файлах. Если найдены секреты — коммит блокируется.
 *
 * Использование:
 *   node scripts/check-secrets.mjs           # все staged
 *   node scripts/check-secrets.mjs --all     # вся git history
 *
 * Требует: gitleaks binary (https://github.com/gitleaks/gitleaks/releases)
 *   Windows: scoop install gitleaks / choco install gitleaks / GitHub release
 *   Linux/macOS: brew install gitleaks / apt install gitleaks
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const mode = process.argv.includes("--all") ? "--all" : "--staged";

// Проверяем наличие gitleaks
const version = spawn("gitleaks", ["version"], { stdio: "pipe" });
let out = "";
version.stdout.on("data", (d) => (out += d));
version.on("error", () => {
  console.error("❌ gitleaks не найден. Установите:");
  console.error("   Windows: scoop install gitleaks");
  console.error("   macOS:   brew install gitleaks");
  console.error("   Linux:   см. https://github.com/gitleaks/gitleaks/releases");
  process.exit(1);
});
version.on("exit", (code) => {
  if (code !== 0) {
    console.error("❌ gitleaks не найден. Установите:");
    console.error("   Windows: scoop install gitleaks");
    console.error("   macOS:   brew install gitleaks");
    console.error("   Linux:   см. https://github.com/gitleaks/gitleaks/releases");
    process.exit(1);
  }
});

const args = [
  "protect",
  mode === "--staged" ? "--staged" : "",
  "--config",
  resolve(ROOT, ".gitleaks.toml"),
  "--no-banner",
  "--redact",
  ...(existsSync(resolve(ROOT, ".gitleaksignore"))
    ? ["--gitleaks-ignore-path", resolve(ROOT, ".gitleaksignore")]
    : []),
].filter(Boolean);

const proc = spawn("gitleaks", args, { stdio: "inherit", cwd: ROOT });
proc.on("exit", (code) => {
  if (code === 0) {
    console.log("✅ No secrets found");
  } else {
    console.error("❌ SECRETS DETECTED — коммит заблокирован");
    console.error("   Если это false positive, добавьте в .gitleaksignore");
  }
  process.exit(code ?? 1);
});
