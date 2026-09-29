// Извлечение текстового слоя PDF через ToUnicode CMap.
// Проверяет две вещи: текст действительно извлекается (а не обведён
// контурами — важно для ATS) и читается как ожидается.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const SRC = "C:\\Users\\alikpc\\seo-tmp\\exports";

function inflate(buf, start, end) {
  try {
    return inflateSync(buf.subarray(start, end)).toString("latin1");
  } catch {
    return null;
  }
}

/** Строит карту code -> unicode из потоков ToUnicode. */
function buildCMap(all) {
  const map = new Map();
  for (const t of all) {
    for (const block of t.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
      for (const m of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        map.set(parseInt(m[1], 16), String.fromCharCode(...m[2].match(/.{1,4}/g).map((h) => parseInt(h, 16))));
      }
    }
    for (const block of t.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      for (const m of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        const lo = parseInt(m[1], 16);
        const hi = parseInt(m[2], 16);
        const dst = parseInt(m[3], 16);
        for (let c = lo; c <= hi; c++) map.set(c, String.fromCharCode(dst + (c - lo)));
      }
    }
  }
  return map;
}

const only = process.argv[2];
const files = (await readdir(SRC)).filter((f) => f.endsWith(".pdf")).sort();
for (const f of files) {
  if (only && !f.includes(only)) continue;
  const buf = await readFile(join(SRC, f));
  const raw = buf.toString("latin1");
  const streams = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const start = m.index + m[0].length;
    const end = raw.indexOf("endstream", start);
    if (end < 0) continue;
    const t = inflate(buf, start, end);
    if (t) streams.push(t);
  }
  const cmap = buildCMap(streams);
  const content = streams.find((s) => s.includes("BT")) || "";
  // Собираем строки из hex-строк оператора Tj.
  const out = [];
  for (const m of content.matchAll(/<([0-9A-Fa-f]{4,})>\s*Tj/g)) {
    const hex = m[1];
    let s = "";
    for (let i = 0; i + 3 < hex.length + 1; i += 4) {
      const code = parseInt(hex.slice(i, i + 4), 16);
      s += cmap.get(code) ?? "";
    }
    out.push(s.trim());
  }
  const first = out.filter(Boolean).slice(0, 3).join(" | ");
  console.log(`\n### ${f}  (строк: ${out.filter(Boolean).length}, символов CMap: ${cmap.size})`);
  console.log("   " + (first || "(текст не извлекается!)"));
}

