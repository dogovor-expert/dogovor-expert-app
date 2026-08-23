/**
 * Генератор src/data/signingMeta.ts (аудит №1, Фаза 6).
 * Извлекает подписантов (роль + поле формы) из отрендеренных шаблонов
 * и классифицирует шаблоны по способу подписания (A–E).
 * Запуск: npx tsx scripts/generate-signing-meta.mts
 */
import { writeFileSync } from "node:fs";
import { LEGAL_TEMPLATES } from "../src/data/templates";
import { renderTemplateDocument } from "../src/lib/renderDocument";
import type { SigningClass, TemplateSigner } from "../src/data/types";

const NAME_RE = /_(fio|name|company|org)$/;
const SKIP_LABELS = new Set([
  "подпись", "инн", "адрес", "телефон", "дата", "город", "паспорт",
  "подпись и расшифровка", "образец подписи",
]);

/** Эвристика: роль в блоке подписей → кандидат поля со значением. */
const ROLE_TO_FIELDS: Record<string, string[]> = {
  "продавец": ["seller_fio", "seller_name"],
  "покупатель": ["buyer_fio", "buyer_name"],
  "заявитель": ["applicant_fio", "applicant_name", "sender_name", "sender_fio"],
  "доверитель": ["owner_fio", "principal_fio", "party1_name"],
  "исполнитель": ["executor_name"],
  "подрядчик": ["contractor_name"],
  "заказчик": ["customer_name", "customer_org"],
  "поставщик": ["supplier_org", "supplier_name"],
  "наймодатель": ["landlord_name"],
  "наниматель": ["tenant_name"],
  "арендодатель": ["lessor_name", "landlord_name"],
  "арендатор": ["lessee_name", "tenant_name"],
  "заимодавец": ["lender_name"],
  "займодавец": ["lender_name"],
  "заёмщик": ["borrower_name"],
  "заемщик": ["borrower_name"],
  "завещатель": ["testator_fio"],
  "наследник": ["heir_fio"],
  "даритель": ["donor_fio"],
  "одаряемый": ["donee_fio"],
};

function sampleValues(t: (typeof LEGAL_TEMPLATES)[number]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const f of t.fields) {
    if (f.type === "repeating") continue;
    values[f.id] = f.defaultValue || `X_${f.id}`;
    if (!values[f.id]) values[f.id] = `X_${f.id}`;
  }
  return values;
}

/** Извлечь пары (роль, поле) из отрендеренного HTML блока подписей. */
function extractSigners(
  html: string,
  fieldIds: Set<string>
): TemplateSigner[] {
  const found = new Map<string, string>();
  const resolve = (role: string): string | null => {
    for (const cand of ROLE_TO_FIELDS[role.toLowerCase()] ?? []) {
      if (fieldIds.has(cand)) return cand;
    }
    return null;
  };
  // Все отрендеренные значения полей-имён с позициями.
  const tokens = [...html.matchAll(/>(X_[a-z0-9_]+)</g)].map((m) => ({
    id: m[1].slice(2),
    pos: m.index ?? 0,
  }));
  for (const tok of tokens) {
    if (!NAME_RE.test(tok.id) || found.has(tok.id)) continue;
    // Метка ДО значения: последний заголовок колонки «РОЛЬ:</div>|Роль:</p>» рядом со значением.
    const before = html.slice(Math.max(0, tok.pos - 400), tok.pos);
    let role = "";
    let bestIdx = -1;
    for (const m of before.matchAll(/>([^<>{}]{2,45}):<\/(?:div|p)>/g)) {
      const idx = m.index ?? 0;
      if (before.length - idx > 220) continue;
      if (idx > bestIdx) {
        bestIdx = idx;
        role = m[1].trim();
      }
    }
    // Метка в том же абзаце: «Завещатель: X_testator_fio».
    if (!role) {
      const tail = before.replace(/<[^>]*$/, "").slice(-80);
      const m = tail.match(/([А-ЯЁA-Z][^<>:{}\/]{1,38}):\s*$/u);
      if (m) role = m[1].trim();
    }
    // Метка ПОСЛЕ значения (signPairLeft): имя, линия, мелкая подпись роли.
    if (!role) {
      const after = html.slice(tok.pos, tok.pos + 300);
      const m = after.match(
        /<\/p>\s*<div class="border-b[^"]*"><\/div>\s*<p class="text-zinc-400 text-\[10px\]">([^<>{}]{2,45})<\/p>/
      );
      if (m) role = m[1].trim();
    }
    if (!role) continue;
    const norm = role.replace(/:$/, "").trim();
    if (SKIP_LABELS.has(norm.toLowerCase())) continue;
    if (/^X_/.test(norm)) continue;
    found.set(tok.id, norm);
  }
  // Подписи-строки без значения: «Продавец:</p><div линия…>» в хвосте документа.
  const tailStart = Math.max(0, html.length - 1500);
  const tail = html.slice(tailStart);
  for (const m of tail.matchAll(/<p>([А-ЯЁA-Z][^<>{}]{2,40}):<\/p>/g)) {
    const norm = m[1].replace(/:$/, "").trim();
    if (SKIP_LABELS.has(norm.toLowerCase())) continue;
    const fid = resolve(norm);
    if (fid && !found.has(fid)) found.set(fid, norm);
  }
  return [...found.entries()].map(([fieldId, role]) => ({ fieldId, role }));
}

/** Классификация шаблона по способу подписания. */
function classify(
  t: (typeof LEGAL_TEMPLATES)[number],
  signers: TemplateSigner[]
): SigningClass {
  const hay = `${t.name} ${t.description}`.toLowerCase();
  const name = t.name.toLowerCase();
  // Нотариальная форма: сильные маркеры в любом тексте либо семейно-правовые
  // конструкции в самом названии («согласие супруга» в описании ДКП — не повод).
  if (
    /нотариальн|завещан|отказ от наследства|рента|пожизненн.*содержан/i.test(hay) ||
    /согласи[ея] супруг|брачн|дол[яию].*(обществ|ооо)/i.test(name)
  )
    return "B";
  const oneSigner = signers.length <= 1;
  if (
    oneSigner &&
    /доверенност|претенз|расписк|заявлен|уведомлен|жалоб|объяснен|аванс|отказ/i.test(hay)
  )
    return /заявлен|жалоб/.test(hay) ? "D" : "C";
  if (
    oneSigner &&
    /гибдд|госорган|фнс|налогов|пенсионн|соцзащит|росреестр|мвд|следственн|прокуратур|вуз|школ|поликлин/i.test(hay)
  )
    return "D";
  const ids = t.fields.map((f) => f.id);
  // Сторона «организационно-способна» только если есть реквизиты юрлица/ИП
  // и НЕТ переключателя статуса (partyFields даёт выбор «физлицо/ИП/организация»,
  // такие договоры остаются классом A — физлица допустимы).
  const hasOrg = (p: string) =>
    (ids.includes(`${p}_company`) || ids.includes(`${p}_inn`)) &&
    !ids.includes(`${p}_status`);
  const b2bPairs: [string, string][] = [
    ["seller", "buyer"], ["executor", "customer"], ["supplier", "buyer"],
    ["contractor", "customer"], ["landlord", "tenant"], ["lessor", "lessee"],
    ["lender", "borrower"], ["party1", "party2"],
  ];
  for (const [a, b] of b2bPairs) {
    if (hasOrg(a) && hasOrg(b)) return "E";
  }
  if (oneSigner) return "C";
  return "A";
}

const entries: string[] = [];
const stats: Record<SigningClass, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
const noSigners: string[] = [];

for (const t of LEGAL_TEMPLATES) {
  const html = renderTemplateDocument(t, sampleValues(t));
  const fieldIds = new Set(t.fields.map((f) => f.id));
  const signers = extractSigners(html, fieldIds);
  const signingClass = classify(t, signers);
  stats[signingClass] += 1;
  if (signers.length === 0) noSigners.push(t.id);
  const signersLit = signers
    .map((s) => `{ role: ${JSON.stringify(s.role)}, fieldId: ${JSON.stringify(s.fieldId)} }`)
    .join(", ");
  entries.push(`  ${JSON.stringify(t.id)}: { signingClass: "${signingClass}", signers: [${signersLit}] },`);
}

const file = `// АВТОГЕНЕРАЦИЯ — scripts/generate-signing-meta.mts. Не редактировать вручную.
import type { TemplateSigning } from "./types";

export const SIGNING_META: Record<string, TemplateSigning> = {
${entries.join("\n")}
};

const FALLBACK: TemplateSigning = { signingClass: "A", signers: [] };

export function getSigning(templateId: string): TemplateSigning {
  return SIGNING_META[templateId] ?? FALLBACK;
}

/** Лист подписания (образец соглашения о ПЭП) доступен только для класса E. */
export function canShowSignSheet(templateId: string): boolean {
  return getSigning(templateId).signingClass === "E";
}
`;
writeFileSync(new URL("../src/data/signingMeta.ts", import.meta.url), file, "utf8");
console.log(
  `classes=${JSON.stringify(stats)} total=${LEGAL_TEMPLATES.length} noSigners=${noSigners.length}`
);
if (noSigners.length) console.log("noSigners:", noSigners.join(","));
