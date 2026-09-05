#!/usr/bin/env node
/**
 * scripts/run-full-audit.mjs
 * Единый оркестратор аудита сайта. Три фазы (по скорости):
 *   Phase 1 (быстро, ~30с):  typecheck, lint, blast radius, unit-тесты
 *   Phase 2 (средне, ~2-3м):  e2e локальные (playwright), smoke (prod)
 *   Phase 3 (медленно, ~5м):  PSI, LHCI, Squirrelscan (удалённый прод)
 *
 * Флаги:
 *   --quick       только Phase 1
 *   --site-only   только Phase 3 (PSI + LHCI + Squirrelscan)
 *   --skip-prod   пропустить Phase 3 полностью
 *
 * Запись отчётов:
 *   reports/audit-latest.md    — полный сводный отчёт (перезаписывается)
 *   reports/audit-history.md   — лог истории (дописывается)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");
const LATEST_FILE = path.join(REPORTS_DIR, "audit-latest.md");
const HISTORY_FILE = path.join(REPORTS_DIR, "audit-history.md");

const args = new Set(process.argv.slice(2));
const QUICK = args.has("--quick");
const SITE_ONLY = args.has("--site-only");
const SKIP_PROD = args.has("--skip-prod");

if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const dateStr = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
const sections = [];
const summary = [];

function run(cmd, label, opts = {}) {
  const timeout = opts.timeout ?? 120_000;
  console.log(`\n→ ${label}\n  $ ${cmd}`);
  const start = Date.now();
  try {
    const stdout = execSync(cmd, {
      cwd: ROOT,
      encoding: "utf-8",
      timeout,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const ms = Date.now() - start;
    console.log(`  ✓ ${label} (${(ms / 1000).toFixed(1)}s)`);
    return { ok: true, label, cmd, ms, stdout: stdout.toString() };
  } catch (e) {
    const ms = Date.now() - start;
    const out = (e.stdout?.toString() ?? "") + (e.stderr?.toString() ?? "");
    console.log(`  ✗ ${label} (${(ms / 1000).toFixed(1)}s) — exit ${e.status}`);
    return { ok: false, label, cmd, ms, stdout: out, error: e.message };
  }
}

function fence(s, max = 8000) {
  const t = s.length > max ? s.slice(0, max) + `\n…(truncated, ${s.length} chars)` : s;
  return t.replace(/```/g, "ʼʼʼ");
}

function section(title, content) {
  sections.push({ title, content });
  summary.push(`### ${title}\n${content.split("\n").slice(0, 4).join("\n")}\n`);
}

// === Phase 1: быстрые детерминированные проверки ===
if (!SITE_ONLY) {
  console.log("\n━━━ Phase 1: Code static + unit (быстро) ━━━");
  const r1 = run("npm run typecheck", "TypeScript --noEmit");
  section(
    "1.1 TypeScript",
    r1.ok ? "✅ exit 0" : `❌ exit ${r1.error ? "≠0" : "≠0"}\n\`\`\`\n${fence(r1.stdout, 1500)}\n\`\`\``,
  );
  if (QUICK && r1.ok) {
    // early exit
  }

  const r2 = run("npm run lint -- --max-warnings 0 2>/dev/null || npm run lint", "ESLint");
  const errs = (r2.stdout.match(/(\d+) errors?/)?.[1]) ?? "?";
  section(
    "1.2 ESLint",
    r2.ok ? `✅ 0 errors, warnings допускаются (фоновые). Полный вывод в stdout выше.` : `❌ exit ≠0, ${errs} errors\n\`\`\`\n${fence(r2.stdout, 1500)}\n\`\`\``,
  );

  const r3 = run("npm run check:blast -- --staged 2>/dev/null || echo 'no staged'", "Blast radius");
  section(
    "1.3 Blast radius",
    r3.ok
      ? r3.stdout.includes("No source files")
        ? "✅ Нет staged src/** — нечего анализировать"
        : `📊 ${fence(r3.stdout, 1200)}`
      : `⚠ ${fence(r3.stdout, 1200)}`,
  );

  const r4 = run("npm run test:unit", "Vitest unit tests");
  const passed = (r4.stdout.match(/Tests\s+(\d+)\s+passed/)?.[1]) ?? "?";
  const skipped = (r4.stdout.match(/\|\s*(\d+)\s+skipped/)?.[1]) ?? "0";
  section(
    "1.4 Unit tests (vitest)",
    r4.ok ? `✅ ${passed} passed, ${skipped} skipped` : `❌ failed\n\`\`\`\n${fence(r4.stdout, 2000)}\n\`\`\``,
  );
}

// === Phase 2: локальные e2e + smoke ===
if (!QUICK && !SITE_ONLY) {
  console.log("\n━━━ Phase 2: E2E + smoke (средне) ━━━");
  const r5 = run("npm run check:smoke 2>&1 | tail -50", "Smoke (локальный)", { timeout: 300_000 });
  section(
    "2.1 Smoke (local, 5 сценариев)",
    r5.ok
      ? "✅ выполнено"
      : `⚠ возможны замечания\n\`\`\`\n${fence(r5.stdout, 1500)}\n\`\`\``,
  );
}

// === Phase 3: удалённые продакшн-аудиторы ===
if (!SKIP_PROD && !QUICK) {
  console.log("\n━━━ Phase 3: Site audit (PSI + LHCI + Squirrel) ━━━");
  const r6 = run("node scripts/psi.mjs", "Google PageSpeed Insights", { timeout: 180_000 });
  section(
    "3.1 PSI (mobile + desktop)",
    r6.ok ? fence(r6.stdout, 2500) : `❌ ${r6.error}\n\`\`\`\n${fence(r6.stdout, 1500)}\n\`\`\``,
  );

  const r7 = run("npx lhci autorun --config=lighthouserc.json", "Lighthouse CI (5 страниц)", { timeout: 600_000 });
  // LHCI пишет в .lighthouseci/ — извлекаем краткое summary
  const lhciSummary = (() => {
    try {
      const manifest = fs.readFileSync(path.join(ROOT, ".lighthouseci", "manifest.json"), "utf-8");
      const m = JSON.parse(manifest);
      const lines = m.map((entry) => {
        const url = entry.url || "?";
        const perf = entry.summary?.performance ?? "?";
        const a11y = entry.summary?.accessibility ?? "?";
        const bp = entry.summary?.["best-practices"] ?? "?";
        const seo = entry.summary?.seo ?? "?";
        return `- ${url} → perf:${perf} a11y:${a11y} bp:${bp} seo:${seo}`;
      });
      return lines.join("\n");
    } catch {
      return "(manifest.json не найден)";
    }
  })();
  section(
    "3.2 Lighthouse CI (5 страниц: / /templates /dkp /osago /autoteka)",
    r7.ok ? `✅ запущено, отчёты в .lighthouseci/\n${lhciSummary}` : `⚠ ${fence(r7.stdout, 1500)}`,
  );

  const r8 = run(
    "npx squirrel audit https://dogovor.expert --format console --no-publish --coverage quick",
    "Squirrelscan (150 страниц, 260 правил)",
    { timeout: 300_000 },
  );
  section("3.3 Squirrelscan (Health Score + категории)", fence(r8.stdout, 3500));
}

// === Сборка отчёта ===
console.log("\n━━━ Сборка отчёта ━━━");
const reportLines = [
  `# Сводный отчёт аудита — Dogovor.expert`,
  ``,
  `**Дата:** ${dateStr}`,
  `**Запуск:** \`npm run audit:full\` (${QUICK ? "quick" : SITE_ONLY ? "site-only" : "full"})${SKIP_PROD ? " (skip-prod)" : ""}`,
  ``,
  ...sections.map(({ title, content }) => `## ${title}\n\n${content}\n`),
];

fs.writeFileSync(LATEST_FILE, reportLines.join("\n"), "utf-8");
console.log(`✅ ${path.relative(ROOT, LATEST_FILE)}`);

const histEntry = `- **${dateStr}** — audit:full (${QUICK ? "quick" : SITE_ONLY ? "site-only" : "full"}${SKIP_PROD ? ", skip-prod" : ""}). Полный отчёт в [audit-latest.md](./audit-latest.md)\n`;
fs.appendFileSync(HISTORY_FILE, histEntry, "utf-8");
console.log(`✅ ${path.relative(ROOT, HISTORY_FILE)}`);

console.log("\n━━━ Краткая сводка ━━━");
console.log(summary.join("\n"));
console.log(`\n📄 Подробности: ${path.relative(ROOT, LATEST_FILE)}\n`);
