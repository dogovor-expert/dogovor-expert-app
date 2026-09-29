import { LEGAL_TEMPLATES } from "../src/data/templates";
import fs from "fs";
import path from "path";

const meta = LEGAL_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: t.description,
  actSource: t.actSource,
  lastUpdated: t.lastUpdated,
  suggestedDocs: t.suggestedDocs,
  fieldCount: t.fields.length,
  ...(t.kind ? { kind: t.kind } : {}),
  ...(t.formKind ? { formKind: t.formKind } : {}),
  ...(t.statementGroup ? { statementGroup: t.statementGroup } : {}),
}));

const body = JSON.stringify(meta, null, 2);
const out = `// Сгенерировано scripts/generate-templates-meta.mts — НЕ редактировать вручную.
// Лёгкий индекс шаблонов для клиентских компонентов (поиск, каталог, главная).
// Полные данные (fields, previewTemplate) — в src/data/templates/*.ts.

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  actSource: string;
  lastUpdated: string;
  suggestedDocs: string[];
  fieldCount: number;
  kind?: "contract" | "statement";
  formKind?: "official" | "free";
  statementGroup?: string;
}

export const TEMPLATE_META: TemplateMeta[] = ${body};
`;
fs.writeFileSync(path.resolve("src/data/templatesMeta.ts"), out, "utf8");
console.log(`templatesMeta.ts: ${meta.length} шаблонов`);

// Единый источник числа шаблонов для мест, куда нельзя тащить тяжёлые
// данные (клиентские компоненты, статика): крошечный модуль без зависимостей.
// Использование: import { TEMPLATE_COUNT } from "@/data/templateCount".
// Склонение: `${TEMPLATE_COUNT} ${templateWord(TEMPLATE_COUNT)}`.
fs.writeFileSync(
  path.resolve("src/data/templateCount.ts"),
  `// Сгенерировано scripts/generate-templates-meta.mts — НЕ редактировать вручную.\n` +
    `// Число шаблонов в LEGAL_TEMPLATES на момент генерации.\n` +
    `export const TEMPLATE_COUNT = ${meta.length};\n` +
    `export function templateWord(n: number = TEMPLATE_COUNT): string {\n` +
    `  const m100 = n % 100;\n` +
    `  if (m100 >= 11 && m100 <= 19) return "шаблонов";\n` +
    `  const last = n % 10;\n` +
    `  if (last === 1) return "шаблон";\n` +
    `  if (last >= 2 && last <= 4) return "шаблона";\n` +
    `  return "шаблонов";\n` +
    `}\n`,
  "utf8",
);
console.log(`templateCount.ts: TEMPLATE_COUNT=${meta.length}`);

// public/llms.txt — статичный файл для AI-агентов: обновляем число шаблонов,
// чтобы не врать (аудит 29.09.2026: было захардкожено 369 при 570).
const llmsPath = path.resolve("public/llms.txt");
const llms = fs.readFileSync(llmsPath, "utf8");
const llmsNext = llms.replace(/— \d+ (договоров|шаблонов|документов)/, `— ${meta.length} $1`);
if (llmsNext !== llms) {
  fs.writeFileSync(llmsPath, llmsNext, "utf8");
  console.log(`llms.txt: число обновлено до ${meta.length}`);
} else if (/— \d+ (договоров|шаблонов|документов)/.test(llms)) {
  console.log(`llms.txt: число уже актуально (${meta.length})`);
} else {
  console.log("llms.txt: строка с числом не найдена, пропущено");
}
