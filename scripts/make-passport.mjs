// Создаёт реалистичное фото паспорта РФ (PNG) с известными данными.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 1200, H = 1700;
const lines = [
  "ПАСПОРТ",
  "РОССИЙСКОЙ ФЕДЕРАЦИИ",
  "",
  "Фамилия: ИВАНОВ",
  "Имя: ИВАН",
  "Отчество: ИВАНОВИЧ",
  "Пол: МУЖ",
  "Дата рождения: 12.05.1985",
  "Место рождения: г. Москва",
  "",
  "Серия 4512    Номер 123456",
  "",
  "Кем выдан: ОВД района Арбат г. Москвы",
  "Дата выдачи: 15.06.2010",
  "Код подразделения: 770-123",
];
const lineH = 50;
const startY = 80;
const fs = 40;

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#fdfaf0"/>
  <g font-family="DejaVu Sans, Arial, sans-serif" font-size="${fs}" fill="#1a1a1a" font-weight="500">
${lines.map((t, i) => `    <text x="60" y="${startY + i * lineH}">${escape(t)}</text>`).join("\n")}
  </g>
</svg>`;

const out = process.argv[2] || "C:\\Users\\alikpc\\AppData\\Local\\Temp\\opencode\\docs\\passport-synthetic.png";
const buf = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(out, buf);
console.log("Saved:", out, "(", buf.length, "bytes )");
