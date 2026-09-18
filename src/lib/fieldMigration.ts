import type { LegalTemplate } from "@/data/types";

/** Извлекает «роль» из id поля: seller_inn → "seller", owner_phone → "owner",
 *  fio → "default", contract_price → "contract". */
function getRole(id: string): string {
  const m = id.match(/^(seller|buyer|owner|tenant|landlord|driver|carrier|consignee|consignor|principal|agent|representative|guarantor|borrower|lender|seller_signer|buyer_signer)_/);
  return m ? m[1] : "common";
}

/** Извлекает «тип» из id поля: seller_inn → "inn", owner_phone → "phone". */
function getType(id: string): string {
  // Поля без ролевого префикса, например contract_price, contract_date
  if (id.startsWith("contract_")) return id.slice("contract_".length);
  const role = getRole(id);
  const stripped = role === "common" ? id : id.slice(role.length + 1);
  // Срезаем возможные повторные роли (например buyer_signer_fio → "signer_fio")
  const signerMatch = stripped.match(/^signer_(fio|inn|phone|passport_series|passport_number|passport_issued|passport_code|birthday|address)$/);
  if (signerMatch) return `signer_${signerMatch[1]}`;
  return stripped;
}

/** Мигрирует значения из `prev` в `next` шаблон по правилу «роль + тип».
 *  - Точное совпадение id → значение копируется безусловно.
 *  - Совпадение (роль + тип) → значение копируется, если целевое поле пустое.
 *  - Возвращает { migrated, count, examples } для UI-уведомления. */
export interface FieldMigrationResult {
  values: Record<string, string>;
  migratedIds: string[];
  sameTypeCount: number;
  totalNextFields: number;
}

export function migrateFieldValues(
  prev: Record<string, string>,
  prevTemplate: LegalTemplate,
  nextTemplate: LegalTemplate
): FieldMigrationResult {
  // Индексируем prev по (роль, тип) для быстрого поиска
  const prevByKey = new Map<string, string[]>();
  const prevById = new Map<string, string>();
  for (const f of prevTemplate.fields) {
    const v = prev[f.id];
    if (v === undefined || v === "") continue;
    prevById.set(f.id, v);
    const key = `${getRole(f.id)}|${getType(f.id)}`;
    const arr = prevByKey.get(key) || [];
    arr.push(v);
    prevByKey.set(key, arr);
  }

  const migratedIds: string[] = [];
  let sameTypeCount = 0;
  const out: Record<string, string> = {};
  for (const nf of nextTemplate.fields) {
    // 1) точное совпадение id — приоритет
    const exact = prevById.get(nf.id);
    if (exact !== undefined) {
      out[nf.id] = exact;
      migratedIds.push(nf.id);
      sameTypeCount++;
      continue;
    }
    // 2) иначе ищем по (роль, тип). Берём первое непустое совпадение;
    //    если их несколько — выбираем самое длинное (полнее).
    const key = `${getRole(nf.id)}|${getType(nf.id)}`;
    const candidates = prevByKey.get(key);
    if (candidates && candidates.length > 0) {
      const best = candidates.slice().sort((a, b) => b.length - a.length)[0];
      out[nf.id] = best;
      migratedIds.push(nf.id);
    }
    // Межролевая миграция (seller_inn → buyer_inn) намеренно НЕ делается:
    // слишком опасно копировать ИНН одной стороны в ИНН другой. Только
    // точное совпадение id и (роль, тип) с той же ролью. Для «угасающих»
    // полей без роли (например, contract_price) работает точный id.
  }

  return {
    values: out,
    migratedIds,
    sameTypeCount,
    totalNextFields: nextTemplate.fields.length,
  };
}
