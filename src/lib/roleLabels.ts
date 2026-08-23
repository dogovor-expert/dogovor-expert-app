// Композиция пользовательских лейблов формы из единого реестра ролей
// (roleRegistry.ts). Подключается ТОЛЬКО для шаблонов из ROLE_COMPOSE_TEMPLATES
// — миграция идёт партиями по 20–30 шаблонов, чтобы не сломать 367 форм разом.
//
// Два escape-hatch'а (см. оговорки к Варианту 1):
//   LABEL_OVERRIDES — кастомный лейбл конкретного поля `${tplId}:${fieldId}`;
//   ROLE_OVERRIDES  — переопределение роли для шаблона `${tplId}:${prefix}`
//                      (префикс перегружен: `agent` = «Представитель» в
//                      доверенности, но «Агент» в агентском договоре).

import type { TemplateField } from "@/data/types";
import { ROLE_REGISTRY, type RoleMeta } from "./roleRegistry";

/** Шаблоны, чьи лейблы ролей собираются из реестра (миграция партиями). */
export const ROLE_COMPOSE_TEMPLATES = new Set<string>([
  // ── Партия 1: семейство доверенностей (исходный баг-репорт) ──
  "power-of-attorney-auto",
  "power-attorney",
  "power-attorney-interests",
  "power-attorney-mail",
  "power-of-attorney-car",
  "power-of-attorney-docs",
  "postal-power-of-attorney",
  "court-power-of-attorney",
  "goods-power-of-attorney",
  "sign-power-of-attorney",

  // ── Партия 2: вся категория auto.ts ──
  "dkp-auto",
  "act-transfer-auto",
  "gibdd-reg-app",
  "rental-auto",
  "auto-lease",
  "car-installment",
  "gift-car",
  "towing-services",
  "car-lease-buyout",
  "dkp-trailer",
  "dkp-car-credit",
  "car-rental-daily",
  "car-lease-crew",
  "dkp-moto",
  "dkp-atv",
  "car-repair",
  "car-storage",
  "car-free-use",
  "car-trade-in",
  "car-commission",
  "dkp-truck",
  "dkp-bus",
  "dkp-watercraft",
  "taxi-lease",
  "car-leasing",
  "car-relocation",
  "spouse-consent-car-sale",
  "car-warranty-order",
  "car-selection",
  "car-buyout",
  "car-pledge",
  "dkp-moped",
  "car-insurance-claim",
  "car-detailing",
  "car-equipment-install",
  "auto-condition-act",
  "dkp-auto-short",

  // ── Партия 3: бизнес / услуги / корп. ──
  "service-agreement",
  "contract-works",
  "supply-contract",
  "agreement-confidentiality",
  "it-development",
  "employment-contract",
  "gpa-contract",
  "act-services",
  "act-works",
  "photo-shoot-agreement",
  "llc-share-purchase",
  "consulting-services",
  "info-services",
  "household-contract",
  "subcontract",
  "parttime-contract",
  "remote-contract",
  "equipment-supply",
  "goods-sale",
  "retail-sale",
  "agency-contract",
  "commission-contract",
  "mandate-contract",
  "license-contract",
  "author-order",
  "goods-power-of-attorney",
  "sign-power-of-attorney",
  "addendum-generic",
  "termination-agreement",
  "refuse-notice",
  "pupil-contract",
  "ds-transfer",
  "supply-spare-parts",
  "supply-b2b",
  "supply-products",
  "services-b2b",
  "commission-sale",
  "agent-goods-sale",
  "public-offer",
  "charter-llc",
  "corporate-agreement",
  "sole-member-decision",
  "llc-meeting-minutes",
  "ip-assignment",
  "sublicense",
  "specification-supply",
  "torg-12",
  "goods-acceptance-act",
  "ds-purchase",
  "ds-services",
  "terminate-supply",
  "legal-services-contract",
  "accounting-services",
  "cleaning-services",
  "security-services",
  "advertising-services",
  "event-organization",
  "medical-services",
  "website-support",
  "franchise-agreement",
  "rental-contract",
  "reconciliation-statement",
  "transfer-order-t5",
  "liability-agreement",
  "business-trip-order",
  "tutor-contract",
  "seo-contract",
  "courier-contract",
  "translator-contract",
  "audit-contract",
  "recruiting-contract",
  "warehouse-storage",
  "freight-transport",
  "simple-partnership",
  "barter-agreement",
  "equipment-rental",
  "maintenance-service",
  "outsourcing-contract",
  "appraiser-contract",
  "furniture-custom",
  "repair-appliance",
  "installation-works",
  "project-design",
  "survey-works",
  "landscaping-works",
  "exhibition-participation",
  "corporate-training",
  "marketing-services",
  "pr-services",
  "content-services",
  "mobile-app-dev",
  "api-integration",
  "distributor-agreement",
  "exclusive-dealer",
  "logistics-contract",
  "financial-lease",

  // ── Партия 4: претензии / договоры / корп. / семья / финансы / HR ──
  "claim-rent",
  "claim-loan",
  "claim-sale",
  "claim-works",
  "claim-supply",
  "claim-services",
  "terminate-dkp-realty",
  "terminate-gift",
  "terminate-loan",
  "terminate-sale",
  "terminate-works",
  "terminate-services",
  "refuse-rent",
  "refuse-lease",
  "refuse-works",
  "refuse-services",
  "selfemployed-contract",
  "contract-personal",
  "house-repair",
  "roof-repair",
  "contract-construction",
  "transport-services",
  "design-dev",
  "loan-use",
  "nda-employee",
  "user-agreement",
  "cookie-policy",
  "website-development",
  "design-development",
  "power-attorney",
  "power-attorney-interests",
  "power-attorney-mail",
  "letter-of-intent",
  "llc-establishment",
  "collective-agreement",
  "site-acceptance-act",
  "spouse-consent-sell",
  "marriage-contract",
  "alimony-agreement",
  "gift-agreement",
  "child-travel-consent",
  "property-division",
  "nanny-agreement",
  "spouse-consent-purchase",
  "guardianship-agreement",
  "spouse-consent-pledge",
  "pension-app",
  "maternity-payment-app",
  "family-budget-note",
  "maternity-capital-app",
  "adoption-consent",
  "upd",
  "loan-graph",
  "container-spec",
  "task-services",
  "work-plan",
  "customer-order",
  "services-list",
  "property-list",
  "ds-loan",
  "ds-works",
  "ds-supply",
  "ds-rent-extend",
  "akt-naym",
  "raspiska-money",
  "raspiska-generic",
  "invoice",
  "loan-agreement",
  "loan-company",
  "guarantee-agreement",
  "credit-agreement",
  "percent-loan",
  "zero-loan",
  "cession-contract",
  "money-return-receipt",
  "loan-individuals",
  "refuse-loan-notice",
  "leasing-agreement",
  "novation-agreement",
  "compensation-agreement",
  "donation-agreement",
  "mortgage-loan",
  "debt-restructuring",
  "payment-deferral",
  "offset-agreement",
  "debt-acknowledgment",
  "currency-exchange",
  "bank-deposit-agreement",
  "loan-employee",
  "pledge-agreement",
  "debt-transfer-agreement",
  "movable-pledge",
  "job-description",
  "director-contract",
  "foreign-employee-contract",
  "internal-rules",
  "termination-employment",
  "pdn-policy",

  // ── Партия 5: судебные / миграция / прочие / почтовые / недвижимость / аренда / продажи ──
  "claim-generic",
  "court-order-app",
  "refund-claim",
  "debt-lawsuit",
  "objection-debt-claim",
  "divorce-lawsuit",
  "consumer-lawsuit",
  "appeal-complaint",
  "ddu-penalty-lawsuit",
  "bankruptcy-app",
  "cassation-complaint",
  "counterclaim",
  "claim-labor",
  "inheritance-claim",
  "eviction-claim",
  "alimony-claim",
  "property-claim",
  "housing-claim",
  "recovery-loss-claim",
  "court-power-of-attorney",
  "renunciation-inheritance",
  "paternity-claim",
  "child-residence-claim",
  "invalid-transaction-claim",
  "private-complaint",
  "enforcement-suspension-app",
  "visa-invitation",
  "migration-notification",
  "temp-registration-consent",
  "temporary-residence-app",
  "citizenship-app",
  "patent-app",
  "residence-permit-app",
  "passport-intl-app",
  "inn-application",
  "storage-agreement",
  "transport-agreement",
  "power-of-attorney-docs",
  "privacy-policy",
  "equipment-lease",
  "transport-expedition",
  "waste-removal",
  "passport-replace-app",
  "tax-deduction-app",
  "guarantee-letter",
  "self-employed-registration",
  "ip-registration",
  "personal-data-consent",
  "resignation-letter",
  "postal-power-of-attorney",
  "postal-search-app",
  "mail-notice",
  "mail-return-app",
  "dkp-flat",
  "rental-flat",
  "dsp",
  "rental-commercial",
  "exchange-agreement",
  "akt-priema-kvartiry",
  "lease-house",
  "parking-lease",
  "realty-services",
  "repair-contract",
  "dkp-nonresidential",
  "gift-flat",
  "gift-land",
  "gift-house",
  "land-lease",
  "sublease",
  "tenancy-room",
  "tenancy-house",
  "free-use-contract",
  "tenancy-flat",
  "mandate-realty-sale",
  "land-acceptance-act",
  "ds-rent",
  "terminate-rent",
  "terminate-sublease",
  "preliminary-sale",
  "deposit-agreement",
  "rent-contract",
  "gift-share",
  "garage-lease",
  "garage-sale",
  "dacha-lease",
  "retail-space-lease",
  "dkp-apartment",
  "dkp-room",
  "dkp-house",
  "dkp-land",
  "dogovor-zadatka",
  "dogovor-avansa",
  "rental-residential",
  "dogovor-arendy-kvartiry",
  "rental-garage",
  "realty-agency",
  "free-use-apartment",
  "mortgage-rent",
  "realty-option",
  "notice-rent-termination",
  "rent-agreement",
  "rental-office",
  "rental-warehouse",
  "rental-workplace",
  "rental-daily",
  "assign-rent-land",
  "sublease-flat",
  "rental-car",
  "rental-movable",
  "rental-general",
  "sublease-ts",
  "dkp-parking",
  "dkp-share-flat",
  "dkp-building",
  "dkp-property-general",
  "prelim-house",
  "prelim-land",
  "dkp-equipment",
  "international-sale",
  "gift-money",
]);

/** Кастомный лейбл поля: `${templateId}:${fieldId}` → текст. */
export const LABEL_OVERRIDES: Record<string, string> = {
  // напр. "power-of-attorney-auto:agent_special": "Паспорт представителя, действующего по доверенности №…"
};

/** Переопределение роли для шаблона: `${templateId}:${prefix}` → метаданные. */
export const ROLE_OVERRIDES: Record<string, Partial<RoleMeta>> = {
  // В доверенностях префикс `owner` = «Доверитель» (перегружен: в аренде/ГИБДД
  // это «Владелец»). override действует на ВСЕ каналы (форма, сканер,
  // «Сохранённые лица», signingMeta — через getRoleMetaFor).
  "power-of-attorney-auto:owner": { label: "Доверителя", nominative: "Доверитель" },
  "power-attorney:owner": { label: "Доверителя", nominative: "Доверитель" },
  "power-attorney-interests:owner": { label: "Доверителя", nominative: "Доверитель" },
  "power-attorney-mail:owner": { label: "Доверителя", nominative: "Доверитель" },
  "power-of-attorney-car:owner": { label: "Доверителя", nominative: "Доверитель" },
  "power-of-attorney-docs:owner": { label: "Доверителя", nominative: "Доверитель" },
  "postal-power-of-attorney:owner": { label: "Доверителя", nominative: "Доверитель" },
  "court-power-of-attorney:owner": { label: "Доверителя", nominative: "Доверитель" },
  "goods-power-of-attorney:owner": { label: "Доверителя", nominative: "Доверитель" },
  "sign-power-of-attorney:owner": { label: "Доверителя", nominative: "Доверитель" },

  // В агентском договоре `agent` = «Агент» (перегружен: в доверенностях
  // это «Представитель»). override действует на ВСЕ каналы.
  "agency-contract:agent": { label: "Агента", nominative: "Агент" },
};

/**
 * Только «ядро» идентификационных полей собирается из реестра. Всё остальное
 * (ИНН, ОГРН, «организации», «ИП», «кем выдан» и т.п.) остаётся со своими
 * авторскими лейблами — это гарантирует, что композиция никогда не порождает
 * мусор («Прочее…») и не сливает разные поля в один и тот же лейбл.
 */
const CORE_FIELD_WORDS: Record<string, string> = {
  fio: "ФИО",
  full_name: "ФИО",
  passport: "Паспорт",
  passport_series: "Серия паспорта",
  passport_number: "Номер паспорта",
  passport_issued_by: "Кем выдан паспорт",
  passport_code: "Код подразделения",
  address: "Адрес",
  living_address: "Адрес проживания",
  registration: "Адрес регистрации",
  birthday: "Дата рождения",
  birth_date: "Дата рождения",
  dob: "Дата рождения",
  phone: "Телефон",
  email: "E-mail",
};

/** Метаданные роли с учётом переопределения для конкретного шаблона. */
export function getRoleMetaFor(
  templateId: string,
  prefix: string
): RoleMeta | undefined {
  const override = ROLE_OVERRIDES[`${templateId}:${prefix}`];
  const base = ROLE_REGISTRY[prefix];
  if (!base && !override) return undefined;
  return { ...base, ...override } as RoleMeta;
}

/** «ФИО Доверителя» и т.п. Возвращает null, если поле — не ролевое ядро. */
function composeFieldLabel(
  templateId: string,
  field: TemplateField
): string | null {
  const m = field.id.match(/^([a-zA-Zа-яА-Я0-9]+)_(.+)$/);
  if (!m) return null;
  const prefix = m[1].toLowerCase();
  const suffix = m[2];
  const meta = getRoleMetaFor(templateId, prefix);
  if (!meta) return null;
  const word = CORE_FIELD_WORDS[suffix];
  if (!word) return null;
  return `${word} ${meta.label}`;
}

/**
 * Итоговый лейбл поля для формы. Для opt-in шаблонов: сперва кастомный
 * override, затем композиция из реестра, иначе — статичный field.label.
 * Для остальных шаблонов возвращает field.label без изменений.
 */
export function resolveFieldLabel(
  templateId: string,
  field: TemplateField
): string {
  if (ROLE_COMPOSE_TEMPLATES.has(templateId)) {
    const override = LABEL_OVERRIDES[`${templateId}:${field.id}`];
    if (override) return override;
    const composed = composeFieldLabel(templateId, field);
    if (composed) return composed;
  }
  return field.label;
}

/**
 * Заголовок секции/вкладки формы по category поля. Для opt-in шаблонов ролевые
 * категории берутся из реестра (именительный падеж), остальные — из fallback.
 */
export function tabRoleLabel(
  templateId: string,
  category: string,
  fallback: string
): string {
  if (ROLE_COMPOSE_TEMPLATES.has(templateId)) {
    const meta = getRoleMetaFor(templateId, category);
    if (meta?.nominative) return meta.nominative;
  }
  return fallback;
}
