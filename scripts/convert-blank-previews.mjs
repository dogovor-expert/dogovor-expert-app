/**
 * E6 (аудит): конвертация public/blank-previews/*.jpg -> *.webp.
 * 471 JPEG (~110 МБ) -> WebP q80 (ожидаемо ~30 МБ) с потерями,
 * визуально неотличимо для превью формата А4.
 *
 * Запуск:  node scripts/convert-blank-previews.mjs
 */
import { readdir, readFile, writeFile, rm } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "blank-previews");

const sharp = (await import("sharp")).default;

const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".jpg"));
let inBytes = 0;
let outBytes = 0;
let done = 0;

for (const f of files) {
  const jpg = join(OUT_DIR, f);
  const webp = join(OUT_DIR, f.replace(/\.jpg$/, ".webp"));
  const buf = await readFile(jpg);
  const webpBuf = await sharp(buf).webp({ quality: 80 }).toBuffer();
  await writeFile(webp, webpBuf);
  await rm(jpg);
  inBytes += buf.length;
  outBytes += webpBuf.length;
  done++;
  if (done % 50 === 0 || done === files.length) {
    const pct = ((1 - outBytes / inBytes) * 100).toFixed(1);
    console.log(`  ${done}/${files.length} — ${pct}% экономии`);
  }
}

console.log(
  `Готово: ${done} файлов, ${(inBytes / 1e6).toFixed(1)} МБ -> ${(outBytes / 1e6).toFixed(1)} МБ`
);
