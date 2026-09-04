/**
 * Планировщик распознавания (Фаза 5): связывает OCR-результат с полями шаблона.
 *
 * Расширенная логика поверх базового сканера:
 *  1) Определяет тип документа по OCR-тексту (passport / ИНН / ОГРН / СНИЛС /
 *     выписка ЕГРЮЛ / ЕГРИП / банковские реквизиты).
 *  2) Для каждой роли шаблона (включая роли БЕЗ *_passport — ИП/ООО, где
 *     раньше не было OCR-слота) находит, какие поля документ заполняет.
 *  3) Возвращает список значений для подстановки в форму.
 */

import type { LegalTemplate } from "@/data/types";
import { allRolePrefixes, DOC_PROFILES, detectAllProfiles, type detectProfile } from "@/lib/docProfiles";
import { normalizeVin, isValidInn } from "@/lib/ocrPostprocess";

export interface PlannedValue {
  fieldId: string;
  value: string;
}

export interface PlanResult {
  /** Определённый тип документа (или null, если не распознан). */
  profile: ReturnType<typeof detectProfile>;
  /** Поля, которые можно заполнить (уникальные по fieldId). */
  values: PlannedValue[];
  /** Поля шаблона, которые остались незаполненными (для подсветки). */
  missing: string[];
}

/**
 * Для данной роли собирает ВСЕ поля шаблона с этим префиксом —
 * значения, которые можно получить из OCR-документа.
 */
function roleFields(template: LegalTemplate, role: string): string[] {
  const ids = template.fields.map((f) => f.id);
  return ids.filter(
    (id) => id === `${role}_inn` ||
      id === `${role}_ogrn` ||
      id === `${role}_snils` ||
      id === `${role}_lastname` ||
      id === `${role}_surname` ||
      id === `${role}_name` ||
      id === `${role}_company` ||
      id === `${role}_bank_account` ||
      id === `${role}_bank_bik` ||
      id === `${role}_director` ||
      id === `${role}_passport` ||
      id.startsWith(`${role}_passport_`)
  );
}

/**
 * Главная функция: по OCR-тексту планирует заполнение полей шаблона.
 *
 * Приоритеты:
 *  - ищем профиль документа по тексту;
 *  - применяем его extract() ко всем подходящим ролям;
 *  - дополнительно нормализуем ИНН/СНИЛС/ВРН валидаторами.
 */
export function planFromScan(
  template: LegalTemplate,
  text: string,
  opts: { activeRole?: string; filledFields?: Set<string> } = {}
): PlanResult {
  const profiles = detectAllProfiles(text);
  const values: PlannedValue[] = [];
  const valueMap = new Map<string, string>();
  const roles = allRolePrefixes(template);
  const filled = opts.filledFields ?? new Set<string>();

  for (const profile of profiles) {
    for (const role of roles) {
      if (opts.activeRole && role !== opts.activeRole) continue;
      if (!profile.applicable(template, role)) continue;
      const extracted = profile.extract(text, role);
      for (const ex of extracted) {
        const target = ex.fieldId;
        if (filled.has(target)) continue;
        const exists = template.fields.some((f) => f.id === target);
        if (!exists) continue;
        valueMap.set(target, ex.value);
        values.push({ fieldId: target, value: ex.value });
      }
    }
  }

  // Нормализация/валидация известных полей (независимо от профиля).
  for (const role of roles) {
    const inn = valueMap.get(`${role}_inn`);
    if (inn && isValidInn(inn)) {
      valueMap.set(`${role}_inn`, inn);
    }
    const vin = valueMap.get(`${role}_vin`);
    if (vin && normalizeVin(vin)) {
      valueMap.set(`${role}_vin`, normalizeVin(vin)!);
    }
  }

  // missing: поля ролей, которые не были заполнены (до 6 шт. для подсветки).
  const allFilled = new Set([...filled, ...valueMap.keys()]);
  const missing: string[] = [];
  for (const role of roles) {
    for (const f of roleFields(template, role)) {
      if (!allFilled.has(f)) missing.push(f);
    }
  }

  return {
    profile: profiles[0] ?? null,
    values,
    missing: missing.slice(0, 6),
  };
}
