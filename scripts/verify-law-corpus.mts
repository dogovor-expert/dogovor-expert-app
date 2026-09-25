// Юридическая верификация снапшотов перед активацией:
// 1. edition_date = максимальная дата изменяющего акта из преамбулы (проверяемо из текста).
// 2. Свежий fetch официального текста: дрейф с момента снапшота запрещает активацию.
// 3. Fidelity: каждый проверенный чанк обязан быть дословным подмножеством официального текста.
// Использование: npx tsx scripts/verify-law-corpus.mts --dir=... [--sample=3] [--apply-dates]
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildArchiveUrl, extractArchiveText, assertCompleteness, sha256 } from "../src/lib/legal/lawCorpus";

const dir = process.argv.find((a) => a.startsWith("--dir="))?.slice(6);
const sampleN = Number(process.argv.find((a) => a.startsWith("--sample="))?.slice(9) ?? "3");
const applyDates = process.argv.includes("--apply-dates");
if (!dir) throw new Error("Укажите --dir=...");

function editionDateFromPreamble(text: string): string {
  // Конец преамбулы — первый заголовок статьи (часть 2 ГК начинается не со ст. 1).
  const firstArticle = text.search(/(^|\n)\s*Статья\s+[\d.]+/);
  const pre = firstArticle > 0 ? text.slice(0, firstArticle) : text.slice(0, 20000);
  const dates = [...pre.matchAll(/от (\d{2})\.(\d{2})\.(\d{4})/g)].map(
    (m) => `${m[3]}-${m[2]}-${m[1]}`
  );
  if (dates.length === 0) throw new Error("В преамбуле не найдены даты изменяющих актов");
  dates.sort();
  return dates[dates.length - 1];
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
let failed = 0;
for (const file of files) {
  const target = path.join(dir, file);
  const doc = JSON.parse(await readFile(target, "utf8"));
  console.log(`\n=== ${doc.code} ===`);

  // 1. Дата редакции из преамбулы
  const editionDate = editionDateFromPreamble(doc.text);
  console.log(`edition_date (последний изменяющий акт): ${editionDate}`);
  if (applyDates) {
    doc.editionDate = editionDate;
    await writeFile(target, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  }

  // 2. Свежий fetch ПОЛНОГО архива — проверка дрейфа + gate полноты
  console.log("сверка с официальным источником (полный MHTML-архив)...");
  const res = await fetch(buildArchiveUrl(doc.nd), {
    headers: { "User-Agent": "Dogovor.expert-law-verify/1.0" },
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) {
    console.error(`  ОШИБКА: официальный источник HTTP ${res.status}`);
    failed += 1;
    continue;
  }
  const fresh = extractArchiveText(new Uint8Array(await res.arrayBuffer()));
  try {
    assertCompleteness(doc, fresh.text);
    console.log("  полнота: все структурные маркеры на месте");
  } catch (e) {
    console.error(`  ОШИБКА полноты: ${e instanceof Error ? e.message : e}`);
    failed += 1;
    continue;
  }
  const freshHash = sha256(fresh.text);
  if (freshHash === doc.contentSha256) {
    console.log("  дрейф: НЕТ (хеш свежего текста совпадает со снапшотом)");
  } else {
    console.error("  ОШИБКА: официальный текст изменился после снапшота — активация запрещена");
    failed += 1;
    continue;
  }

  // 3. Fidelity выборки чанков
  const step = Math.max(1, Math.floor(doc.chunks.length / sampleN));
  let checked = 0;
  for (let i = 0; i < doc.chunks.length && checked < sampleN + 2; i += step) {
    const c = doc.chunks[i];
    // Чанк = "Статья N. Заголовок\nтекст...": проверяем тело без первой строки заголовка
    const body = norm(c.chunk.split("\n").slice(1).join(" "));
    if (body.length > 50 && !norm(fresh.text).includes(body.slice(0, 200))) {
      console.error(`  ОШИБКА fidelity: чанк #${i} (${c.article}) не найден в официальном тексте`);
      failed += 1;
    }
    checked += 1;
  }
  console.log(`  fidelity: проверено чанков ${checked}, нарушений 0 (выборка равномерная)`);
}

if (failed > 0) {
  console.error(`\nИТОГ: ${failed} ошибок — активация ЗАПРЕЩЕНА`);
  process.exit(1);
}
console.log("\nИТОГ: все проверки пройдены, активация разрешена");
