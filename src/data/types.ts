export interface TemplateFieldOption {
  label: string;
  value: string;
}

export interface TemplateFieldDependency {
  fieldId: string;
  value?: string;
  values?: string[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "radio" | "checkbox" | "textarea" | "repeating";
  placeholder?: string;
  defaultValue: string;
  category:
    | "seller"
    | "buyer"
    | "vehicle"
    | "contract"
    | "other"
    | "sts"
    | "pts"
    | "grz"
    | "owner"
    | "representative"
    | "insurance"
    | "payment"
    | "items"
    | "realty"
    | "business"
    | "family"
    | "landlord"
    | "tenant"
    | "driver"
    | "object"
    | "recipient"
    | "sender"
    | "lender"
    | "borrower"
    | "executor"
    | "customer"
    | "contractor"
    | "spouse"
    | "applicant"
    | "invoice"
    | "employer"
    | "employee"
    | "donor"
    | "donee"
    | "agent"
    | "principal"
    | "guarantor"
    | "court"
    | "testator"
    | "heir"
    | "property"
    | "notary"
    | "payer"
    | "child"
    | "spouse1"
    | "spouse2";
  options?: TemplateFieldOption[] | string[];
  rows?: number;
  /** Значения select/radio, которые считаются устаревшими (для версий бланков). */
  obsoleteValues?: string[];
  /** Подсказки для автокомплита (нативный <datalist>). */
  suggestions?: string[];
  /** Одна или несколько зависимостей: поле видно, только если выполнены ВСЕ зависимости. */
  dependsOn?: TemplateFieldDependency | TemplateFieldDependency[];
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    helpText?: string;
  };
  /** Юридическая/методическая подсказка к полю (напр. ссылка на статью закона). */
  hint?: string;
  repeatingFields?: {
    id: string;
    label: string;
    type: "text" | "number";
    defaultValue?: string;
    width?: string;
  }[];
}

export interface TemplateVersion {
  id: string;
  label: string;
  previewTemplate?: string;
}

/**
 * Класс подписания шаблона (см. PRODUCTION-READINESS-AUDIT.md, Фаза 6):
 * A — простая письменная форма, двусторонняя/многосторонняя рукописная;
 * B — нотариальная форма (доверенность нотариуса не заменит лист ПЭП);
 * C — односторонний документ (один подписант);
 * D — бланк/заявление в госорган по установленной форме;
 * E — допускает ЭДО (обе стороны юрлица/ИП) — лист подписания доступен opt-in.
 */
export type SigningClass = "A" | "B" | "C" | "D" | "E";

export interface TemplateSigner {
  /** Роль подписанта, как в блоке подписей документа («Продавец», «Доверитель»…). */
  role: string;
  /** id поля формы со значением подписанта (ФИО/наименование). */
  fieldId: string;
}

export interface TemplateSigning {
  signingClass: SigningClass;
  signers: TemplateSigner[];
}

export interface LegalTemplate {
  id: string;
  name: string;
  category: "auto" | "realty" | "business" | "finance" | "migration" | "postal" | "other" | "family" | "legal";
  actSource: string;
  lastUpdated: string;
  description: string;
  fields: TemplateField[];
  previewTemplate?: string;
  suggestedDocs: string[];
  supportsOcr?: boolean;
  versions?: TemplateVersion[];
  printInstruction?: string;
}
