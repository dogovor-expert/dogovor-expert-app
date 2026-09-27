#!/usr/bin/env node
/**
 * caprover-status: read-only диагностика деплоя без панели.
 * Читает локальный CLI-токен (~/.config/configstore/caprover.json), секреты НЕ печатает.
 * Использование: node scripts/caprover-status.mjs [appName]
 * Env: CAPROVER_MACHINE (default "vds").
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MACHINE = process.env.CAPROVER_MACHINE || "vds";
const APP = process.argv[2] || "dogovor-prod";

const cfg = JSON.parse(readFileSync(join(homedir(), ".config", "configstore", "caprover.json"), "utf8"));
const machine = cfg.CapMachines.find((m) => m.name === MACHINE) ?? cfg.CapMachines[0];
if (!machine?.authToken) {
  console.error(`No caprover auth for machine "${MACHINE}". Run: caprover login`);
  process.exit(2);
}
const base = machine.baseUrl.replace(/\/+$/, "");
// Панель живёт на том же хосте, что и прокси из HTTPS_PROXY — прямой коннект,
// иначе запросы ходят в proxy-loop и флапают с таймаутами.
{
  const host = new URL(base).hostname;
  const no = (process.env.NO_PROXY || process.env.no_proxy || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!no.includes(host)) {
    process.env.NO_PROXY = [...no, host].join(",");
    process.env.no_proxy = process.env.NO_PROXY;
  }
}
const headers = { "x-captain-auth": machine.authToken, "Content-Type": "application/json" };

async function api(path) {
  const r = await fetch(base + path, { headers, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} on ${path}`);
  return r.json();
}

const defs = await api("/api/v2/user/apps/appDefinitions/");
if (defs.status !== 100 || !defs.data?.appDefinitions) {
  console.error(`CapRover API error: status=${defs.status} desc=${defs.description || "?"}`);
  process.exit(2);
}
const app = defs.data.appDefinitions.find((a) => a.appName === APP);
if (!app) {
  console.error(`App "${APP}" not found`);
  process.exit(2);
}
const data = await api(`/api/v2/user/apps/appData/${APP}/`);
console.log(`app=${APP} deployedVersion=${app.deployedVersion}`);
console.log(`isAppBuilding=${data.data.isAppBuilding} isBuildFailed=${data.data.isBuildFailed}`);
const lines = (data.data.logs?.lines ?? []).map((l) => String(l).replace(/\0/g, "").trim()).filter(Boolean);
for (const l of lines.slice(-12)) console.log(`LOG: ${l.slice(0, 250)}`);
