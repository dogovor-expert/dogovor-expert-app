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
}

export const TEMPLATE_META: TemplateMeta[] = ${body};
`;
fs.writeFileSync(path.resolve("src/data/templatesMeta.ts"), out, "utf8");
console.log(`templatesMeta.ts: ${meta.length} шаблонов`);
