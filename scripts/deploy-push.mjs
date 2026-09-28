#!/usr/bin/env node
/**
 * deploy-push: отправляет master в локальное git-зеркало на VDS и инициирует
 * деплой в Dokploy.
 *
 * Новая схема (2026-09-28): CapRover заменён на Dokploy. Dokploy не может
 * тянуть код с GitHub — с VDS GitHub отдаёт ~1 КБ/с (клиент клонируется
 * десятки минут и рвётся). Поэтому репозиторий зеркалится на самом сервере:
 *   ssh://root@<VDS>/etc/dokploy/git/dogovor.git
 * и Dokploy собирает ветку `master` из этого зеркала.
 *
 * Использование:
 *   node scripts/deploy-push.mjs            # push + redeploy
 *   node scripts/deploy-push.mjs --no-push  # только перезапуск сборки
 *   node scripts/deploy-push.mjs --dry-run  # показать план, ничего не делать
 *
 * Env:
 *   DOKPLOY_URL     — URL панели Dokploy. При запуске ЛОКАЛЬНО: http://82.146.35.220:3000;
 *                     на самом VDS: http://127.0.0.1:3000 (дефолт)
 *   DOKPLOY_API_KEY — API-ключ Dokploy (Settings → API Access). Нужен для
 *                     автоматического редеплоя; без него скрипт только пушит
 *                     и печатает инструкцию.
 *   VDS_SSH         — user@host для SSH (по умолчанию root@82.146.35.220)
 *   DOKPLOY_APP_ID  — applicationId приложения в Dokploy
 */
import { execFileSync, execFileSync as run } from "node:child_process";

const DRY = process.argv.includes("--dry-run");
const NO_PUSH = process.argv.includes("--no-push");
const REMOTE = "vds";
const BRANCH = "master";
const VDS_SSH = process.env.VDS_SSH || "root@82.146.35.220";
const DOKPLOY_URL = process.env.DOKPLOY_URL || "http://127.0.0.1:3000";
const DOKPLOY_APP_ID = process.env.DOKPLOY_APP_ID || "X5picK5oquEqTHQzlKeAL";
const KEY = process.env.DOKPLOY_API_KEY || "";

const log = (...a) => console.log(...a);
const sh = (cmd, args, opts = {}) =>
  run(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });

/** 1. Проверить, что рабочее дерево чистое и мы на master. */
function preflight() {
  const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
  if (branch !== BRANCH) {
    console.error(`✗ Ветка «${branch}», а деплоить нужно из «${BRANCH}».`);
    process.exit(2);
  }
  const status = sh("git", ["status", "--porcelain"]).trim();
  if (status) {
    console.error("✗ Есть незакоммиченные изменения — закоммитьте их или отмените:");
    console.error(status.split("\n").slice(0, 10).join("\n"));
    process.exit(2);
  }
  log(`✓ Ветка ${BRANCH}, дерево чистое, HEAD=${sh("git", ["rev-parse", "--short", "HEAD"]).trim()}`);
}

/** 2. Запушить master в зеркало на VDS. */
function push() {
  log(`→ push ${BRANCH} → ${REMOTE} (зеркало на VDS)…`);
  try {
    sh("git", ["push", REMOTE, `${BRANCH}:${BRANCH}`], { stdio: ["ignore", "pipe", "inherit"] });
    const sha = sh("git", ["rev-parse", "HEAD"]).trim();
    log(`✓ Запушено. SHA=${sha.slice(0, 8)}`);
  } catch {
    console.error("✗ Push в зеркало не удался.");
    console.error("  Проверьте: git remote -v | grep " + REMOTE);
    console.error("  SSH-ключ должен быть в ~/.ssh (id_ed25519_dokploy) и разрешён на VDS.");
    process.exit(1);
  }
}

/** 3. Заказать пересборку в Dokploy через API (если есть ключ). */
async function redeploy() {
  if (!KEY) {
    log("⚠ DOKPLOY_API_KEY не задан — автозапуск сборки пропущен.");
    log("  Запустите вручную: Dokploy UI → Applications → dogovor-prod → Deploy");
    return;
  }
  const r = await fetch(`${DOKPLOY_URL}/api/application.deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": KEY },
    body: JSON.stringify({ applicationId: DOKPLOY_APP_ID }),
    signal: AbortSignal.timeout(60000),
  });
  const body = await r.text();
  if (!r.ok) {
    console.error(`✗ Dokploy API ${r.status}: ${body.slice(0, 300)}`);
    process.exit(1);
  }
  log("✓ Сборка запущена в Dokploy.");
}

if (DRY) {
  log("DRY RUN — ничего не выполняю.");
  log(`  remote ${REMOTE}: ${sh("git", ["remote", "get-url", REMOTE]).trim()}`);
  log(`  ветка:  ${BRANCH} @ ${sh("git", ["rev-parse", "--short", "HEAD"]).trim()}`);
  log(`  Dokploy: ${DOKPLOY_URL} app=${DOKPLOY_APP_ID} api_key=${KEY ? "есть" : "НЕТ (ручной Deploy)"}`);
  process.exit(0);
}

preflight();
if (!NO_PUSH) push();
await redeploy();
log("");
log("Следить за сборкой: Dokploy UI → dogovor-prod → Deployments");
log("Проверка прода:     node scripts/deploy-watch.mjs && npm run deploy:content");
