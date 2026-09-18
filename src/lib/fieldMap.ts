/**
 * Единый декларативный маппер «сущность → поля формы» (Слой 2).
 *
 * OCR возвращает сущности (Слой 1, см. entities.ts): «человек», «машина»,
 * «компания», «удостоверение». Этот модуль решает, в КАКИЕ поля шаблона
 * вставить значение — по маскам fieldId, без хардкода под каждый шаблон.
 *
 * Правила собраны из прежних жёстких кандидатов applyPassportToRole /
 * applyVehicleToTemplate / applyVucToRole / expectedFields, поэтому поведение
 * сохранено 1-в-1, но теперь оно декларативное и расширяемое:
 * новый шаблон с полем tenant_fio подхватывается маской *_fio без нового кода.
 */

import type { LegalTemplate } from "@/data/types";
import type { ExtractedEntity } from "@/lib/entities";

/**
 * Свойство сущности. Ключи сущности (см. entities.ts) задаются строкой —
 * используем string, чтобы не дублировать дискриминант (kind) в каждом правиле.
 */
export type EntityPath = string;

export interface FieldMappingRule {
  /** Свойство сущности (ключ entity, например "fio", "vin", "inn"). */
  entityPath: EntityPath;
  /**
   * Маски fieldId: точная строка или RegExp.
   * {role} — плейсхолдер текущей роли (seller, buyer, tenant…).
   * Строка без {role} — глобальные поля (car_vin, owner_fio и т.п.).
   */
  patterns: (string | RegExp)[];
  /** Составное поле, собираемое из нескольких свойств сущности. */
  combine?: {
    /** Итоговый id (с {role}); значение = properties, склеенные пробелом. */
    field: string;
    properties: EntityPath[];
  };
  /** Трансформация значения перед вставкой. */
  transform?: (value: string) => string;
}

/** Подстановка {role} в строку маски. */
function withRole(tpl: string, role?: string): string {
  return role ? tpl.replace(/\{role\}/g, role) : tpl;
}

/** Достать значение свойства сущности. */
function getPath(entity: ExtractedEntity, path: EntityPath): unknown {
  const rec = entity as Record<string, unknown>;
  return rec[path];
}

/** Безопасно привести скалярное значение к строке (без [object Object]). */
function scalarToString(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

/** Значение составного поля: склейка свойств пробелом. */
function combineValues(
  entity: ExtractedEntity,
  combine: NonNullable<FieldMappingRule["combine"]>
): string | undefined {
  const parts: string[] = [];
  for (const p of combine.properties) {
    const raw = getPath(entity, p);
    if (raw !== undefined && raw !== null && scalarToString(raw).trim() !== "") {
      parts.push(scalarToString(raw));
    }
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Разрешено ли поле для роли: либо роль не задана, либо поле принадлежит этой
 * роли, либо поле глобальное (ТС, владелец, драйвер, банк, документы).
 */
function roleAllowsFieldId(id: string, role?: string): boolean {
  if (!role) return true;
  const lower = id.toLowerCase();
  const r = role.toLowerCase();
  if (lower.startsWith(r + "_")) return true;
  const common = [
    "car_", "vehicle_", "trailer_", "boat_", "owner_", "driver_",
    "osago_", "pts_", "sts_", "epts_",
  ];
  return common.some((c) => lower.startsWith(c));
}

export interface MapOptions {
  /** Текущая роль — берём только поля её префикса + глобальные. */
  rolePrefix?: string;
  /** Уже заполненные поля — не перезаписываем. */
  filledFields?: Set<string>;
}

/**
 * Единая точка маппинга: сущность → поля шаблона.
 * Возвращает Map<fieldId, value> только для существующих и разрешённых полей.
 */
export function mapEntityToFields(
  entity: ExtractedEntity,
  template: LegalTemplate,
  opts: MapOptions = {}
): Map<string, string> {
  const result = new Map<string, string>();
  const filled = opts.filledFields ?? new Set<string>();
  const role = opts.rolePrefix;
  const fieldsById = new Map(template.fields.map((f) => [f.id, f]));

  const trySet = (fieldId: string, value: string): boolean => {
    if (!fieldsById.has(fieldId)) return false;
    if (filled.has(fieldId) || result.has(fieldId)) return false;
    if (!roleAllowsFieldId(fieldId, role)) return false;
    result.set(fieldId, value);
    return true;
  };

  for (const rule of RULES) {
    // Составное поле.
    if (rule.combine) {
      const value = combineValues(entity, rule.combine);
      if (value === undefined) continue;
      const finalId = withRole(rule.combine.field, role);
      trySet(finalId, value);
      continue;
    }

    // Обычное свойство.
    const raw = getPath(entity, rule.entityPath);
    if (raw === undefined || raw === null) continue;
    const str = scalarToString(raw).trim();
    if (str === "") continue;

    for (const pat of rule.patterns) {
      let fieldId: string | null = null;
      if (pat instanceof RegExp) {
        const source = role ? pat.source.replace(/\{role\}/g, role) : pat.source;
        const pattern = new RegExp(source, "i");
        const hit = template.fields.find(
          (f) => pattern.test(f.id) && roleAllowsFieldId(f.id, role)
        );
        fieldId = hit ? hit.id : null;
      } else {
        const tpl = withRole(pat, role);
        fieldId = fieldsById.has(tpl) && roleAllowsFieldId(tpl, role) ? tpl : null;
      }
      if (fieldId) {
        const finalValue = rule.transform ? rule.transform(str) : str;
        if (trySet(fieldId, finalValue)) break;
      }
    }
  }

  return result;
}

/**
 * Правила. Свойства человека/машины — по образцу прежних apply-функций,
 * с точными наборами кандидатов полей (см. expectedFields в docOcr.ts).
 */
export const RULES: FieldMappingRule[] = [
  // ───── Человек / паспорт ─────
  {
    entityPath: "fio",
    patterns: [/^\{role\}_fio$/i, /^\{role\}_full_name$/i, /^\{role\}_name$/i],
  },
  {
    entityPath: "series",
    patterns: [/^\{role\}_passport_series$/i, /^\{role\}_passport_seria$/i, /^\{role\}_passport_ser$/i],
    combine: { field: "{role}_passport", properties: ["series", "number"] },
  },
  {
    entityPath: "number",
    patterns: [/^\{role\}_passport_number$/i, /^\{role\}_passport_num$/i, /^\{role\}_passport_no$/i],
  },
  {
    entityPath: "birthday",
    patterns: [/^\{role\}_birthday$/i, /^\{role\}_birth_date$/i, /^\{role\}_birthdate$/i],
  },
  {
    entityPath: "birthPlace",
    patterns: [/^\{role\}_birth_place$/i, /^\{role\}_birthplace$/i],
  },
  {
    entityPath: "issuedBy",
    patterns: [/^\{role\}_passport_issued_by$/i, /^\{role\}_passport_by$/i, /^\{role\}_passport_issued$/i],
  },
  {
    entityPath: "issuedDate",
    patterns: [/^\{role\}_passport_date$/i, /^\{role\}_passport_issued_date$/i, /^\{role\}_passport_issue_date$/i],
  },
  {
    entityPath: "code",
    patterns: [/^\{role\}_passport_code$/i],
  },
  {
    entityPath: "address",
    patterns: [/^\{role\}_address$/i, /^\{role\}_addr$/i, /^\{role\}_registration$/i, /^\{role\}_living_address$/i],
  },
  { entityPath: "inn", patterns: [/^\{role\}_inn$/i, /^company_inn$/i] },
  { entityPath: "snils", patterns: [/^\{role\}_snils$/i] },

  // ───── Транспортное средство ─────
  {
    entityPath: "vin",
    patterns: [/^car_vin$/i, /^vehicle_vin$/i, /^trailer_vin$/i, /^boat_vin$/i],
    transform: (v) => v.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""),
  },
  {
    entityPath: "plate",
    patterns: [/^car_plate$/i, /^car_grz$/i, /^vehicle_plate$/i],
    transform: (v) => v.toUpperCase().replace(/\s/g, ""),
  },
  {
    entityPath: "brand",
    patterns: [/^car_brand$/i, /^vehicle_brand$/i, /^trailer_brand$/i, /^car_make$/i],
  },
  {
    entityPath: "year",
    patterns: [/^car_year$/i, /^vehicle_year$/i, /^trailer_year$/i],
  },
  {
    entityPath: "engine",
    patterns: [/^car_engine$/i, /^car_engine_number$/i],
  },
  {
    entityPath: "chassis",
    patterns: [/^car_chassis$/i, /^car_chassis_number$/i],
  },
  {
    entityPath: "body",
    patterns: [/^car_body$/i, /^car_body_number$/i],
  },
  {
    entityPath: "color",
    patterns: [/^car_color$/i, /^car_colour$/i],
  },
  {
    entityPath: "powerKw",
    patterns: [/^car_power_kw$/i, /^car_engine_power_kw$/i],
  },
  {
    entityPath: "powerHp",
    patterns: [/^car_power_hp$/i, /^car_engine_power_hp$/i],
  },
  {
    entityPath: "ptsSeries",
    patterns: [/^pts_series$/i],
    combine: { field: "car_pts", properties: ["ptsSeries", "ptsNumber"] },
  },
  { entityPath: "ptsNumber", patterns: [/^pts_number$/i] },
  { entityPath: "ptsDate", patterns: [/^pts_date$/i, /^car_pts_date$/i] },
  { entityPath: "ptsIssuedBy", patterns: [/^pts_issued_by$/i, /^car_pts_issued_by$/i] },
  {
    entityPath: "stsSeries",
    patterns: [/^sts_series$/i],
    combine: { field: "car_sts", properties: ["stsSeries", "stsNumber"] },
  },
  { entityPath: "stsNumber", patterns: [/^sts_number$/i] },
  { entityPath: "eptsNumber", patterns: [/^car_epts$/i, /^epts_number$/i] },
  { entityPath: "ownerFio", patterns: [/^owner_fio$/i, /^car_owner$/i] },

  // ───── Компания / ЕГРИП ─────
  { entityPath: "kpp", patterns: [/^\{role\}_kpp$/i, /^company_kpp$/i] },
  { entityPath: "ogrn", patterns: [/^\{role\}_ogrn$/i, /^company_ogrn$/i] },
  { entityPath: "ogrnip", patterns: [/^\{role\}_ogrnip$/i] },
  { entityPath: "director", patterns: [/^\{role\}_director$/i] },
  { entityPath: "companyName", patterns: [/^\{role\}_company$/i] },
];
