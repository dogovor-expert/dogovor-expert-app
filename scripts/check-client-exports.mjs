#!/usr/bin/env node
/**
 * check-client-exports: ловит причину №1 «ошибки развертывания» (см. docs/DEPLOY.md).
 * "use client" + серверный экспорт (metadata/revalidate/dynamic/...) роняет
 * `next build` на проде с exit code 1, причём локально из тёплого .next-кэша
 * ошибка может НЕ воспроизвестись. Проверка занимает ~1с.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "src");
const SERVER_EXPORTS = [
  "metadata",
  "generateMetadata",
  "generateStaticParams",
  "generateViewport",
  "viewport",
  "revalidate",
  "dynamic",
  "dynamicParams",
  "fetchCache",
  "preferredRegion",
  "maxDuration",
];

const exportRe = new RegExp(
  `export\\s+(?:const|async\\s+function|function)\\s+(${SERVER_EXPORTS.join("|")})\\b`
);
const clientRe = /["']use client["']/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

const bad = [];
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  if (!clientRe.test(src)) continue;
  const m = src.match(exportRe);
  if (m) bad.push(`${file} :: export ${m[1]}`);
}

if (bad.length) {
  console.error(`CLIENT-EXPORTS FAIL: ${bad.length} file(s) with "use client" + server export:`);
  for (const b of bad) console.error(`  - ${b}`);
  console.error("Серверные экспорты — только в layout.tsx сегмента (см. docs/DEPLOY.md, причина №1).");
  process.exit(1);
}
console.log("client-exports OK");
