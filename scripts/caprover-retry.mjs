#!/usr/bin/env node
/**
 * caprover-retry: перезапуск сборки БЕЗ нового пуша (для случаев, когда сборка
 * упала по внешней причине — обрыв git clone, таймаут сети — а код в ветке корректен).
 * Эмулирует GitHub push-webhook для текущего типа origin/production.
 * Использование: node scripts/caprover-retry.mjs [appName] [--sha <sha>]
 * Env: CAPROVER_MACHINE (default "vds").
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const MACHINE = process.env.CAPROVER_MACHINE || "vds";
const args = process.argv.slice(2).filter((a) => a !== "--sha");
const APP = args[0] && !args[0].startsWith("-") ? args[0] : "dogovor-prod";
const shaIdx = process.argv.indexOf("--sha");
let sha = shaIdx >= 0 ? process.argv[shaIdx + 1] : "";
if (!sha) {
  // Сначала локальный tracking-ref (без сети — важно при флапающем прокси),
  // затем живой запрос к origin.
  try {
    sha = execFileSync("git", ["rev-parse", "origin/production"], { encoding: "utf8" }).trim();
  } catch {
    sha = execFileSync("git", ["ls-remote", "origin", "production"], { encoding: "utf8" }).split(/\s/)[0];
  }
}
if (!/^[0-9a-f]{40}$/.test(sha)) {
  console.error(`Cannot resolve production sha (got: ${sha})`);
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(join(homedir(), ".config", "configstore", "caprover.json"), "utf8"));
const machine = cfg.CapMachines.find((m) => m.name === MACHINE) ?? cfg.CapMachines[0];
if (!machine?.authToken) {
  console.error(`No caprover auth for machine "${MACHINE}". Run: caprover login`);
  process.exit(2);
}
const base = machine.baseUrl.replace(/\/+$/, "");
// См. caprover-status.mjs: панель на хосте прокси — ходим напрямую.
{
  const host = new URL(base).hostname;
  const no = (process.env.NO_PROXY || process.env.no_proxy || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!no.includes(host)) {
    process.env.NO_PROXY = [...no, host].join(",");
    process.env.no_proxy = process.env.NO_PROXY;
  }
}
const headers = { "x-captain-auth": machine.authToken, "Content-Type": "application/json" };

const defsRes = await fetch(base + "/api/v2/user/apps/appDefinitions/", { headers, signal: AbortSignal.timeout(30000) });
const defs = await defsRes.json();
const app = defs.data.appDefinitions.find((a) => a.appName === APP);
const hookToken = app?.appPushWebhook?.pushWebhookToken;
if (!hookToken) {
  console.error(`No push webhook token for "${APP}"`);
  process.exit(2);
}

const payload = {
  ref: "refs/heads/production",
  head_commit: { id: sha },
  repository: {
    full_name: "dogovor-expert/dogovor-expert-app",
    clone_url: "https://github.com/dogovor-expert/dogovor-expert-app.git",
  },
};
const r = await fetch(
  `${base}/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&token=${hookToken}`,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(60000) }
);
const body = await r.json();
console.log(`app=${APP} sha=${sha.slice(0, 8)} triggerStatus=${body.status} desc=${body.description}`);
if (body.status !== 100) process.exit(1);
