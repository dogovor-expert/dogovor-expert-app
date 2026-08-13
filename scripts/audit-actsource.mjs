import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(root, "src", "lib", "legal", "lawRegistry.json"), "utf8"));

const templatesDir = path.join(root, "src", "data", "templates");
const files = fs
  .readdirSync(templatesDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts")
  .sort();
const src = files
  .map((f) => fs.readFileSync(path.join(templatesDir, f), "utf8"))
  .join("\n");
const rx = /\{\r?\n\s*id: "([^"]+)",\r?\n\s*name: "([^"]+)",\r?\n\s*category: "([^"]+)",\r?\n\s*actSource: "([^"]+)"/g;

const normalize = (v) => v.replace(/\s+/g, " ").replace(/[–—]/g, "-").trim();

function resolveAct(seg) {
  const s = seg.toLowerCase();
  for (const k of registry.keywords) {
    if (k.words.some((w) => s.includes(w.toLowerCase()))) return registry.acts.find((a) => a.code === k.code) ?? null;
  }
  const num = s.match(/(?:фз[- №№]*|закон.*?№\s*)(\d{2,4})/);
  if (num) {
    const code = registry.numeric[num[1]];
    if (code) return registry.acts.find((a) => a.code === code) ?? null;
  }
  return registry.acts.find((a) => s.includes(a.code.toLowerCase())) ?? null;
}

const isVeed = (seg) => registry.veed.some((v) => seg.toLowerCase().includes(v.toLowerCase()));

const errors = [];
const warnings = [];
let total = 0;

let m;
while ((m = rx.exec(src))) {
  total++;
  const [, id, name, category, actSource] = m;
  const value = normalize(actSource);
  const segments = value.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  let foundAct = false;
  for (const seg of segments) {
    const act = resolveAct(seg);
    if (act) {
      foundAct = true;
      for (const r of seg.matchAll(/ст(?:ать)?\.?\s*([0-9]+(?:\.[0-9]+)?)\s*([–—-]\s*[0-9]+(?:\.[0-9]+)?)?/g)) {
        const a = parseFloat(r[1]);
        if (Number.isFinite(a) && a > act.max) errors.push(`${id}: ${act.code} ст. ${a} > max ${act.max} («${seg}»)`);
        if (r[2]) {
          const b = parseFloat(r[2].replace(/[–—-]/g, "").trim());
          if (Number.isFinite(b) && b <= a) errors.push(`${id}: диапазон ${a}-${b} некорректен («${seg}»)`);
        }
      }
    }
  }
  const nameL = name.toLowerCase();
  for (const rule of registry.rules) {
    const catOk = !rule.match.category || rule.match.category === category;
    const nameOk = !rule.match.nameHas || rule.match.nameHas.some((k) => nameL.includes(k.toLowerCase()));
    const nameExcluded = rule.match.nameNotHas?.some((k) => nameL.includes(k.toLowerCase())) ?? false;
    if (catOk && nameOk && !nameExcluded && !value.includes(rule.mustInclude)) {
      errors.push(`${id}: «${name}» — требуется ${rule.mustInclude} (${rule.note})`);
    }
  }
  if (!foundAct && !segments.some(isVeed)) warnings.push(`${id}: НПА не распознан («${actSource}») — проверьте вручную`);
}

console.log(`actSource-аудит: ${total} шаблонов, ${errors.length} ошибок, ${warnings.length} предупреждений`);
if (errors.length) {
  console.log("\n== ОШИБКИ ==");
  errors.forEach((e) => console.log("  " + e));
}
if (warnings.length) {
  console.log("\n== ПРЕДУПРЕЖДЕНИЯ ==");
  warnings.forEach((w) => console.log("  " + w));
}
if (errors.length) process.exit(1);
