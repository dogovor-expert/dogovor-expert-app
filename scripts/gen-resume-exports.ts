// Генерация реальных PDF/DOC по всем шаблонам для визуальной проверки.
// Запуск: npx tsx scripts/gen-resume-exports.ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { TEMPLATES, demoForCategory } from "@/lib/resume/data";
import { buildResumeDocHtml } from "@/lib/resume/render";
import type { ResumeData } from "@/lib/resume/types";

// Шрифты лежат в public/fonts — подменяем fetch на чтение с диска,
// чтобы не упираться в сеть.
// ВАЖНО: data:-URL (фото) передаём настоящему fetch, иначе фото не вставится
// в PDF и визуальная проверка покажет ложный дефект.
const FONT_ROOT = join(process.cwd(), "public", "fonts");
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: unknown) => {
  const href = String(url);
  if (href.startsWith("data:")) return realFetch(href);
  const name = href.split("/").pop() ?? "";
  return new Response(await readFile(join(FONT_ROOT, name)));
}) as typeof fetch;

const OUT = "C:\\Users\\alikpc\\seo-tmp\\exports";
await mkdir(OUT, { recursive: true });

// Настоящее фото 320x320: 1x1-пиксель нечитаем в растеризованном PDF,
// из-за чего вставку фото невозможно проверить глазами.
// Объявлено через let и вызывается ниже — после инициализации crc32.
let PHOTO = "";

/** Генерирует видимое фото-градиент как data:image/png (без внешних файлов). */
async function makePhoto(): Promise<string> {
  const zlib = await import("node:zlib");
  const W = 320;
  const H = 320;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    const row = y * (1 + W * 3);
    raw[row] = 0; // filter: none
    for (let x = 0; x < W; x++) {
      const i = row + 1 + x * 3;
      // Сине-серый градиент + светлый «овал» вместо лица.
      const oval = ((x - 160) / 92) ** 2 + ((y - 150) / 116) ** 2 < 1;
      raw[i] = oval ? 232 : 70 + Math.floor((x / W) * 60);
      raw[i + 1] = oval ? 226 : 84 + Math.floor((y / H) * 50);
      raw[i + 2] = oval ? 214 : 122;
    }
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

let CRC_TABLE: number[] | null = null;
function crc32(buf: Buffer): number {
  if (!CRC_TABLE) {
    CRC_TABLE = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

PHOTO = await makePhoto();

const { renderResumePdf } = await import("@/lib/resume/resumePdf");

let ok = 0;
const problems: string[] = [];

for (const t of TEMPLATES) {
  const base: ResumeData = demoForCategory(t.category);
  const data: ResumeData = { ...base, personal: { ...base.personal, photo: PHOTO } };
  try {
    const blob = await renderResumePdf(data, t.id);
    const buf = Buffer.from(await blob.arrayBuffer());
    const head = buf.subarray(0, 5).toString("latin1");
    const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    await writeFile(join(OUT, `${t.id}.pdf`), buf);
    if (head !== "%PDF-") problems.push(`${t.id}: не PDF (${head})`);
    else if (buf.length < 20000) problems.push(`${t.id}: подозрительно мал ${buf.length} Б`);
    ok++;
    console.log(`OK  ${t.id.padEnd(18)} ${String(buf.length).padStart(7)} Б  страниц:${pages}`);
  } catch (e) {
    problems.push(`${t.id}: PDF-ошибка ${String(e).slice(0, 120)}`);
    console.log(`ERR ${t.id}: ${String(e).slice(0, 120)}`);
  }

  try {
    const html = buildResumeDocHtml(data, t.id);
    await writeFile(join(OUT, `${t.id}.doc.html`), "\ufeff" + html, "utf8");
    if (!/<html/i.test(html)) problems.push(`${t.id}: DOC без html-обёртки`);
  } catch (e) {
    problems.push(`${t.id}: DOC-ошибка ${String(e).slice(0, 120)}`);
  }
}

globalThis.fetch = realFetch;
console.log(`\nPDF успешно: ${ok}/${TEMPLATES.length}`);
if (problems.length) {
  console.log("ПРОБЛЕМЫ:");
  problems.forEach((p) => console.log("  - " + p));
} else {
  console.log("Проблем при генерации нет.");
}
