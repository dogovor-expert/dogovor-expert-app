/**
 * Проверка синхронизации каталога шаблонов (CI).
 *
 * Источник истины — LEGAL_TEMPLATES (src/data/templates). Генерируемые файлы
 * templatesMeta.ts и signingMeta.ts должны совпадать по количеству записей
 * с массивом LEGAL_TEMPLATES, иначе падает сборка/нужно перегенерировать.
 *
 * Запуск: npx tsx scripts/check-template-sync.mts (exit 0 = ОК).
 */
import { LEGAL_TEMPLATES } from "../src/data/templates";
import { TEMPLATE_META } from "../src/data/templatesMeta";
import { SIGNING_META } from "../src/data/signingMeta";

const legal = new Set(LEGAL_TEMPLATES.map((t) => t.id));
const metaIds = TEMPLATE_META.map((t) => t.id);
const signingIds = Object.keys(SIGNING_META);

let failed = false;
const fail = (msg: string) => {
  console.error(`✖ ${msg}`);
  failed = true;
};

// ——— 1. Количество ———
if (TEMPLATE_META.length !== legal.size) {
  fail(
    `templatesMeta имеет ${TEMPLATE_META.length} записей, а LEGAL_TEMPLATES — ${legal.size}`
  );
}
if (signingIds.length !== legal.size) {
  fail(
    `signingMeta имеет ${signingIds.length} записей, а LEGAL_TEMPLATES — ${legal.size}`
  );
}

// ——— 2. Идентичность id ———
for (const id of legal) {
  if (!metaIds.includes(id)) {
    fail(`шаблона «${id}» нет в templatesMeta.ts`);
  }
  if (!signingIds.includes(id)) {
    fail(`шаблона «${id}» нет в signingMeta.ts`);
  }
}
for (const id of metaIds) {
  if (!legal.has(id)) {
    fail(`в templatesMeta.ts есть лишний id «${id}» отсутствующий в LEGAL_TEMPLATES`);
  }
}

if (failed) {
  console.error(
    "\nСинхронизация нарушена. Перегенерируйте метаданные скриптом генерации."
  );
  process.exit(1);
}

console.log(`OK: все ${legal.size} шаблонов синхронизированы`);
