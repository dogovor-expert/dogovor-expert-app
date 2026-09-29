/**
 * Исправление битых ссылок `suggestedDocs` в каталоге шаблонов.
 *
 * Проблема (аудит 29.09.2026): часть шаблонов ссылается на спутники не по `id`,
 * а по русскому НАЗВАНИЮ («Договор займа», «ТОРГ-12») либо по несуществующему
 * выдуманному id («warehouse-rent», «act-inventory»). Потребители
 * (documents/[slug], blanks/[slug], documents/v/[slug], TemplateSelector,
 * builder) резолвят такие ссылки через
 * `LEGAL_TEMPLATES.find(x => x.id === ref).filter(Boolean)` — то есть битая
 * ссылка МОЛЧА исчезает, и блок «Связанные документы» терит спутников.
 *
 * Скрипт:
 *   1. авто-резолвит ссылку, если она ТОЧНО и ОДНОЗНАЧНО совпадает с name шаблона;
 *   2. применяет ручную карту MANUAL_MAP для остальных (синонимы/опечатки);
 *   3. дропает ссылки, для которых шаблона нет (значение null в MANUAL_MAP);
 *   4. убирает дубли и самоссылки;
 *   5. перезаписывает `suggestedDocs: [...]` в src/data/templates/*.ts.
 *
 * Запуск:
 *   node scripts/fix-suggested-doc-refs.mjs            # dry-run (отчёт)
 *   node scripts/fix-suggested-doc-refs.mjs --write    # применить
 *
 * После применения ОБЯЗАТЕЛЬНО:
 *   npx tsx scripts/generate-templates-meta.mts   # синхронизировать templatesMeta.ts
 *   npx vitest run src/data/__tests__/templates.test.ts src/lib/__tests__/invariants --run
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES_DIR = path.join(ROOT, "src", "data", "templates");

// Ручная карта: `${templateId}|${битая ссылка}` → id шаблона-спутника или null (удалить).
// Ключи сформированы по итогам аульта 29.09.2026.
const MANUAL_MAP = {
  // ── Авто / страхование ────────────────────────────────────────────────
  "car-insurance-claim|spravka-gibdd": null,
  // ── Займы ─────────────────────────────────────────────────────────────
  "loan-individuals|Договор займа": "loan-agreement",
  "refuse-loan-notice|Договор займа": "loan-agreement",
  // ── Наём / аренда ─────────────────────────────────────────────────────
  "tenancy-flat|Расписка": "raspiska-money",
  "terminate-rent|Акт приёма-передачи": "akt-priema-kvartiry",
  "retail-space-lease|lease-contract": "rental-commercial",
  "dogovor-avansa|raspiska": "raspiska-money",
  "notice-rent-termination|rental-agreement": "rental-flat",
  "notice-rent-termination|apartment-rental": "tenancy-flat",
  "warehouse-storage|warehouse-rent": "rental-warehouse",
  // ── Поручение / доверенности ──────────────────────────────────────────
  "mandate-realty-sale|Доверенность": "power-attorney",
  // ── Земля ─────────────────────────────────────────────────────────────
  "land-acceptance-act|ДКП земельного участка": "dkp-land",
  // ── Кадры ─────────────────────────────────────────────────────────────
  "ds-transfer|Приказ о переводе": "transfer-order-t5",
  "foreign-employee-contract|foreign-employee-reg": null,
  "maternity-payment-app|maternity-leave-app": "stmt-hr-maternity",
  // ── Поставка / ТОРГ-12 / спецификации ─────────────────────────────────
  "supply-spare-parts|Договор поставки товара": "supply-contract",
  "supply-spare-parts|Спецификация": "specification-supply",
  "supply-spare-parts|ТОРГ-12": "torg-12",
  "supply-spare-parts|Акт приёма-передачи товара": "goods-acceptance-act",
  "supply-b2b|Договор поставки товара": "supply-contract",
  "supply-b2b|Спецификация": "specification-supply",
  "supply-b2b|ТОРГ-12": "torg-12",
  "supply-products|Договор поставки товара": "supply-contract",
  "supply-products|Спецификация": "specification-supply",
  "supply-products|ТОРГ-12": "torg-12",
  "specification-supply|Договор поставки товара": "supply-contract",
  "specification-supply|ТОРГ-12": "torg-12",
  "torg-12|Договор поставки товара": "supply-contract",
  "torg-12|Спецификация": "specification-supply",
  "torg-12|Акт приёма-передачи товара": "goods-acceptance-act",
  "goods-acceptance-act|Договор поставки товара": "supply-contract",
  "goods-acceptance-act|ТОРГ-12": "torg-12",
  "terminate-supply|Договор поставки товара": "supply-contract",
  "terminate-supply|Уведомление об отказе от договора": "refuse-notice",
  // ── Комиссия / агентские ──────────────────────────────────────────────
  "commission-sale|Отчёт комиссионера": null,
  "agent-goods-sale|Отчёт агента": null,
  // ── Корпоративные ─────────────────────────────────────────────────────
  "charter-llc|Решение единственного участника": "sole-member-decision",
  "charter-llc|Протокол собрания ООО": "llc-meeting-minutes",
  "corporate-agreement|Протокол собрания ООО": "llc-meeting-minutes",
  "sole-member-decision|Протокол собрания ООО": "llc-meeting-minutes",
  "llc-meeting-minutes|Решение единственного участника": "sole-member-decision",
  // ── Прочее ────────────────────────────────────────────────────────────
  "enterprise-sale|act-inventory": "property-list",
  "enterprise-sale|balance-sheet": "reconciliation-statement",
  "enterprise-sale|debt-register": null,
  "inheritance-claim|notary-power-of-attorney": "power-attorney",
  "child-residence-claim|parenting-plan": null,
  "regulation-business-trip|advance-report": null,
};

// Шаблоны, у которых после чистки остаётся пустой список — задаём осмысленный набор.
const FALLBACK_DOCS = {
  "car-insurance-claim": ["auto-condition-act", "stmt-auto-dtp-europrotocol"],
};

const WRITE = process.argv.includes("--write");

/** Читает `suggestedDocs: [...]` у каждого шаблона из TS-исходников. */
function loadSources() {
  const files = readFileSync(path.join(TEMPLATES_DIR, "index.ts"), "utf8")
    .split("\n")
    .filter((l) => l.startsWith("import "))
    .map((l) => l.match(/from\s+"\.\/([^"]+)"/)?.[1])
    .filter(Boolean)
    .map((m) => `${m}.ts`);

  const entries = []; // { file, templateId, raw, refs }
  for (const file of files) {
    const abs = path.join(TEMPLATES_DIR, file);
    const text = readFileSync(abs, "utf8");

    // Границы шаблонов: от `id: "..."` до следующего `id: "..."`.
    const idRe = /\bid:\s*"([^"]+)"/g;
    const positions = [];
    let m;
    while ((m = idRe.exec(text))) positions.push({ id: m[1], at: m.index });
    if (positions.length === 0) continue;

    for (let i = 0; i < positions.length; i++) {
      const from = positions[i].at;
      const to = i + 1 < positions.length ? positions[i + 1].at : text.length;
      const slice = text.slice(from, to);
      const sm = slice.match(/suggestedDocs:\s*\[([^\]]*)\]/);
      if (!sm) continue;
      const refs = sm[1]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      entries.push({ file, templateId: positions[i].id, refs, abs });
    }
  }
  return entries;
}

function main() {
  const entries = loadSources();
  const byId = new Map();
  for (const e of entries) {
    if (!byId.has(e.templateId)) byId.set(e.templateId, []);
    byId.get(e.templateId).push(e);
  }

  const validIds = new Set(byId.keys());
  const byName = new Map();
  for (const e of entries) {
    // name берём из исходника: ближайшая строка `name: "..."` после id.
    const text = readFileSync(e.abs, "utf8");
    const idAt = text.indexOf(`id: "${e.templateId}"`);
    if (idAt < 0) continue;
    const nm = text.slice(idAt, idAt + 400).match(/name:\s*"([^"]+)"/);
    if (!nm) continue;
    if (!byName.has(nm[1])) byName.set(nm[1], []);
    if (!byName.get(nm[1]).includes(e.templateId)) byName.get(nm[1]).push(e.templateId);
  }

  const changes = [];
  const unresolved = [];

  for (const e of entries) {
    const next = [];
    let dirty = false;
    for (const ref of e.refs) {
      if (validIds.has(ref)) {
        next.push(ref);
        continue;
      }
      const key = `${e.templateId}|${ref}`;
      let target;
      if (key in MANUAL_MAP) {
        target = MANUAL_MAP[key];
      } else {
        const byNm = byName.get(ref);
        target = byNm && byNm.length === 1 ? byNm[0] : undefined;
      }
      if (target === undefined) {
        unresolved.push(`${e.templateId} -> ${JSON.stringify(ref)}`);
        continue;
      }
      if (target === null) {
        changes.push(`${e.file} · ${e.templateId}: DROP ${JSON.stringify(ref)}`);
        dirty = true;
        continue;
      }
      changes.push(`${e.file} · ${e.templateId}: ${JSON.stringify(ref)} -> ${target}`);
      next.push(target);
      dirty = true;
    }
    // Дедуп + защита от самоссылки.
    const clean = [...new Set(next)].filter((id) => id !== e.templateId);
    if (clean.length !== next.length) dirty = true;
    if (FALLBACK_DOCS[e.templateId] && clean.length === 0) {
      clean.push(...FALLBACK_DOCS[e.templateId]);
      changes.push(`${e.file} · ${e.templateId}: пусто -> ${FALLBACK_DOCS[e.templateId].join(", ")}`);
      dirty = true;
    }
    if (dirty || clean.length !== e.refs.length) e.nextRefs = clean;
    else e.nextRefs = e.refs;
  }

  if (unresolved.length) {
    console.error(`\n❌ Неразрешённых ссылок: ${unresolved.length}`);
    unresolved.forEach((u) => console.error("   " + u));
    console.error("   Добавь их в MANUAL_MAP (id шаблона) или явно в null (удалить).\n");
    process.exit(1);
  }

  console.log(`\n📋 Изменений: ${changes.length}`);
  changes.forEach((c) => console.log("   " + c));

  if (!WRITE) {
    console.log("\n(dry-run — pass --write чтобы применить)\n");
    return;
  }

  // Применяем: заменяем блок suggestedDocs в пределах каждого шаблона.
  const byFile = new Map();
  for (const e of entries) {
    if (!byFile.has(e.abs)) byFile.set(e.abs, readFileSync(e.abs, "utf8"));
  }

  let patched = 0;
  for (const [abs, text] of byFile) {
    const idRe = /\bid:\s*"([^"]+)"/g;
    const positions = [];
    let m;
    while ((m = idRe.exec(text))) positions.push({ id: m[1], at: m.index });

    let out = "";
    let cursor = 0;
    for (let i = 0; i < positions.length; i++) {
      const from = positions[i].at;
      const to = i + 1 < positions.length ? positions[i + 1].at : text.length;
      const slice = text.slice(from, to);
      const sm = slice.match(/suggestedDocs:\s*\[[^\]]*\]/);
      if (!sm) continue;
      const entry = entries.find((e) => e.abs === abs && e.templateId === positions[i].id);
      if (!entry) continue;

      // Сохраняем стиль разделителя оригинала (с пробелом или без), чтобы дифф
      // не захламлялся косметическими правками в незатронутых шаблонах.
      const sep = sm[0].includes(", ") ? ", " : ",";
      const replacement = `suggestedDocs: [${entry.nextRefs.map((r) => `"${r}"`).join(sep)}]`;
      if (sm[0] === replacement) continue;

      const absStart = from + sm.index;
      const absEnd = absStart + sm[0].length;
      out += text.slice(cursor, absStart) + replacement;
      cursor = absEnd;
      patched++;
    }
    if (out) writeFileSync(abs, out + text.slice(cursor), "utf8");
  }

  console.log(`\n✅ Патчей применено: ${patched}`);
  console.log("⚠️  Теперь запусти: npx tsx scripts/generate-templates-meta.mts\n");
}

main();
