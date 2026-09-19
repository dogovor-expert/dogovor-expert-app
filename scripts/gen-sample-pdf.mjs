// Генерирует статический пример PDF для главной страницы («Скачать пример»).
// Запуск: node scripts/gen-sample-pdf.mjs
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const A4 = { w: 595.28, h: 841.89 };
const M = 56.7;
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.87, 0.9);
const ACCENT = rgb(0.11, 0.31, 0.85);

const doc = await PDFDocument.create();
doc.registerFontkit(fontkit);

const fontBytes = await readFile(join(root, "public/fonts/times.ttf"));
const boldBytes = await readFile(join(root, "public/fonts/timesbd.ttf")).catch(() => null);
const font = await doc.embedFont(fontBytes, { subset: true });
const bold = boldBytes ? await doc.embedFont(boldBytes, { subset: true }) : font;

const page = doc.addPage([A4.w, A4.h]);
let y = A4.h - M;

const text = (s, { x = M, size = 11, f = font, color = INK } = {}) => {
  page.drawText(s, { x, y, size, font: f, color });
};

const line = (x1, x2, yy, color = LINE) =>
  page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness: 0.7, color });

// --- шапка ---
page.drawRectangle({ x: M, y: y - 8, width: 34, height: 34, color: ACCENT, borderWidth: 0 });
page.drawText("D", { x: M + 10, y: y + 2, size: 20, font: bold, color: rgb(1, 1, 1) });
text("ДОГОВОР № 101", { x: M + 46, y: y + 12, size: 9, f: bold, color: MUTED });
text("Расписка в получении денег", { x: M + 46, y: y, size: 15, f: bold });
y -= 46;
line(M, A4.w - M, y);

// --- пояснение ---
y -= 26;
text("Образец документа. Заполнен для демонстрации.", { size: 9, color: MUTED });
text("Итоговый файл формируется в браузере — данные не отправляются на сервер.", { size: 9, color: MUTED, x: M, f: font });
y -= 10;

const fields = [
  ["Город", "Москва"],
  ["Дата", "19 сентября 2026 г."],
  ["Заимодавец", "Иванов Иван Иванович"],
  ["Паспорт заимодавца", "45 12 № 345678, выдан ОВД Хамовники"],
  ["Заёмщик", "Петров Пётр Петрович"],
  ["Паспорт заёмщика", "45 13 № 987654, выдан ОВД Арбат"],
  ["Сумма займа", "150 000 (сто пятьдесят тысяч) рублей"],
  ["Проценты", "Без процентов"],
  ["Срок возврата", "до 19 марта 2027 года"],
];

y -= 16;
for (const [label, value] of fields) {
  text(label, { size: 9.5, f: bold, color: MUTED });
  text(value, { y: y - 15, size: 11.5 });
  y -= 24;
  line(M, A4.w - M, y + 4, LINE);
  y -= 8;
}

// --- текст расписки ---
y -= 12;
const body = [
  "Я, Петров Пётр Петрович, получил от Иванова Ивана Ивановича денежные средства",
  "в размере 150 000 (сто пятьдесят тысяч) рублей и обязуюсь вернуть указанную",
  "сумму в срок до 19 марта 2027 года.",
];
for (const b of body) {
  text(b, { size: 11 });
  y -= 17;
}

// --- чек-лист ---
y -= 12;
text("Проверено перед подписанием:", { size: 10, f: bold });
y -= 15;
for (const c of ["Паспортные данные сторон", "Сумма прописью и цифрами", "Дата возврата займа", "Подписи сторон"]) {
  page.drawText("+", { x: M + 2, y, size: 10, font: bold, color: rgb(0.02, 0.59, 0.41) });
  text(c, { x: M + 16, size: 10, color: MUTED });
  y -= 15;
}

// --- подписи ---
y -= 26;
line(M, M + 150, y);
line(A4.w - M - 150, A4.w - M, y);
text("Заимодавец", { y: y - 13, size: 9, color: MUTED });
text("Заёмщик", { x: A4.w - M - 150, y: y - 13, size: 9, color: MUTED });

// --- футер ---
page.drawText("dogovor.expert — образец документа", {
  x: M,
  y: M - 22,
  size: 8.5,
  font: font,
  color: MUTED,
});

const bytes = await doc.save();
const outDir = join(root, "public/samples");
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "primernaya-raspiska.pdf");
await writeFile(outPath, bytes);
console.log(`OK: ${outPath} (${bytes.length} bytes)`);
