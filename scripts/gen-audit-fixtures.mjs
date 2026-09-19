// Генератор фикстур для audit/walkthrough.spec.ts.
// Создаёт small.pdf / big.pdf / small.png / big.png / big.docx в переносимой папке
// (по умолчанию <repo>/audit/fixtures, переопределяется AUDIT_FIXTURES_DIR).
//
// Запуск: node scripts/gen-audit-fixtures.mjs
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import { Document, Packer, Paragraph, TextRun } from "docx";

const dir = process.env.AUDIT_FIXTURES_DIR || path.join(process.cwd(), "audit", "fixtures");
fs.mkdirSync(dir, { recursive: true });

async function makePdf(pages) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawText(`Audit fixture — page ${i + 1} of ${pages}`, {
      x: 60,
      y: 780,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText("Audit fixture: converter and print check. Test document.", {
      x: 60,
      y: 750,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  return Buffer.from(await doc.save());
}

async function makePng(size) {
  return sharp({
    create: { width: size, height: size, channels: 3, background: { r: 37, g: 99, b: 235 } },
  })
    .png()
    .toBuffer();
}

async function makeDocx() {
  const children = [];
  children.push(new Paragraph({ children: [new TextRun({ text: "Audit fixture DOCX", bold: true, size: 32 })] }));
  for (let i = 0; i < 40; i++) {
    children.push(new Paragraph({ children: [new TextRun(`Строка ${i + 1}: тестовый абзац для проверки конвертации.`)] }));
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

const targets = [
  ["small.pdf", () => makePdf(1)],
  ["big.pdf", () => makePdf(30)],
  ["small.png", () => makePng(24)],
  ["big.png", () => makePng(1200)],
  ["big.docx", () => makeDocx()],
];

for (const [name, make] of targets) {
  const file = path.join(dir, name);
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(file, await make());
  console.log("created", file);
}
console.log("fixtures ready:", dir);
