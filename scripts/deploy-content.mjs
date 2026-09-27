#!/usr/bin/env node
/**
 * deploy-content: проверяет, что прод отдаёт НОВЫЙ код, а не просто HTTP 200.
 * deploy-watch следит только за статусами маршрутов — зелёный статус НЕ означает,
 * что сборка с новым кодом реально live (см. docs/DEPLOY.md, инцидент 2026-09-27:
 * сборка упала на git clone, прод отдавал старую сборку с 200).
 *
 * Использование:
 *   node scripts/deploy-content.mjs "/ai-yurist|Перетащите договор сюда" "/resume|Креатив"
 *   BASE_URL=https://test.dogovor.expert node scripts/deploy-content.mjs "/|Аудит"
 */
const BASE = (process.env.BASE_URL || "https://dogovor.expert").replace(/\/+$/, "");
const pairs = process.argv.slice(2);
if (!pairs.length) {
  console.error('Usage: node scripts/deploy-content.mjs "/path|marker" ...');
  process.exit(2);
}

let failed = 0;
for (const pair of pairs) {
  const i = pair.indexOf("|");
  if (i < 0) {
    console.error(`BAD ARG (need "/path|marker"): ${pair}`);
    failed += 1;
    continue;
  }
  const path = pair.slice(0, i);
  const marker = pair.slice(i + 1);
  try {
    const r = await fetch(BASE + path, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    const body = await r.text();
    if (r.status >= 200 && r.status < 300 && body.includes(marker)) {
      console.log(`OK   ${path} — маркер найден`);
    } else {
      console.log(`FAIL ${path} — status ${r.status}, маркер отсутствует: «${marker.slice(0, 60)}»`);
      failed += 1;
    }
  } catch (e) {
    console.log(`FAIL ${path} — ERR ${String(e.cause?.code || e.message).slice(0, 80)}`);
    failed += 1;
  }
}
process.exit(failed ? 1 : 0);
