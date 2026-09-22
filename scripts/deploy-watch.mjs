#!/usr/bin/env node
/**
 * DEPLOY WATCH: проверяет, что прод уже отдаёт сборку из запушенного коммита.
 *
 * Как работает: слаги инструментов читаются из данных ЭТОГО коммита
 * (src/data/converter-tools.ts, src/data/calculator-tools.ts) — если прод
 * всё ещё крутит старую сборку, новые маршруты вернут 404 и скрипт будет
 * ждать; когда все маршруты отвечают 200 — деплой завершён.
 * Секретов не требует, только публичный HTTPS.
 *
 * Env: BASE_URL (default https://dogovor.expert),
 *      WATCH_TIMEOUT_MIN (default 40), WATCH_POLL_SEC (default 90).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.env.BASE_URL || "https://dogovor.expert").replace(/\/+$/, "");
const TIMEOUT_MIN = Number(process.env.WATCH_TIMEOUT_MIN || 40);
const POLL_SEC = Number(process.env.WATCH_POLL_SEC || 90);

function slugs(file) {
  const src = readFileSync(resolve(ROOT, file), "utf8");
  return [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const urls = ["/", "/api/health", "/converter", "/utils"];
for (const s of slugs("src/data/converter-tools.ts")) urls.push(`/converter/${s}`);
for (const s of slugs("src/data/calculator-tools.ts")) urls.push(`/utils/${s}`);
console.log(`watch ${urls.length} urls on ${BASE}, timeout ${TIMEOUT_MIN}min, poll ${POLL_SEC}s`);

async function check(url) {
  try {
    const r = await fetch(BASE + url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    await r.arrayBuffer().catch(() => null);
    return r.status >= 200 && r.status < 300 ? null : `${url} -> ${r.status}`;
  } catch (e) {
    return `${url} -> ERR ${String(e.cause?.code || e.message).slice(0, 60)}`;
  }
}

const deadline = Date.now() + TIMEOUT_MIN * 60_000;
let round = 0;
for (;;) {
  round += 1;
  const bad = [];
  for (const u of urls) {
    const err = await check(u);
    if (err) bad.push(err);
  }
  const ts = new Date().toISOString();
  if (bad.length === 0) {
    console.log(`[${ts}] round ${round}: ALL ${urls.length} OK — deploy is live`);
    process.exit(0);
  }
  console.log(`[${ts}] round ${round}: ${urls.length - bad.length}/${urls.length} ok, missing: ${bad.slice(0, 10).join(", ")}${bad.length > 10 ? ` (+${bad.length - 10})` : ""}`);
  if (Date.now() + POLL_SEC * 1000 > deadline) {
    console.error(`TIMEOUT after ${TIMEOUT_MIN}min. Still failing: ${bad.join(", ")}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, POLL_SEC * 1000));
}
