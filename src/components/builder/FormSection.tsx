import type { LegalTemplate, TemplateField } from "@/data/types";
import { isFieldVisible, type AuditResult } from "@/lib/validation";
import { resolveFieldLabel, tabRoleLabel } from "@/lib/roleLabels";
import FormField from "./FormField";

const TAB_LABELS: Record<string, string> = {
  seller: "Продавец",
  buyer: "Покупатель",
  vehicle: "Транспортное средство",
  contract: "Условия договора",
  other: "Прочее",
  sts: "СТС",
  pts: "ПТС",
  grz: "ГРЗ",
  owner: "Владелец",
  representative: "Представитель",
  insurance: "Страхование",
  payment: "Оплата",
  items: "Товары",
  realty: "Недвижимость",
  business: "Бизнес/Услуги",
  family: "Семейные",
  landlord: "Арендодатель",
  tenant: "Арендатор",
  driver: "Водитель",
  object: "Объект",
  recipient: "Получатель",
  sender: "Отправитель",
  lender: "Заимодавец",
  borrower: "Заёмщик",
  executor: "Исполнитель",
  customer: "Заказчик",
  contractor: "Подрядчик",
  spouse: "Супруг(а)",
  applicant: "Заявитель",
  invoice: "Счёт",
  employer: "Работодатель",
  employee: "Работник",
  donor: "Даритель",
  donee: "Одаряемый",
  agent: "Агент",
  principal: "Принципал",
  guarantor: "Поручитель",
  court: "Суд",
  testator: "Наследодатель",
  heir: "Наследники",
  property: "Имущество",
  notary: "Нотариус",
  payer: "Плательщик",
  child: "Ребёнок",
  spouse1: "Супруг 1",
  spouse2: "Супруг 2",
};

interface FormSectionProps {
  template: LegalTemplate;
  formValues: Record<string, string>;
  liveAudit: AuditResult[];
  onFieldChange: (fieldId: string, value: string) => void;
  onBlurNormalize: (fieldId: string) => void;
  onInnBlur: (fieldId: string) => void;
  onGoToPreview: () => void;
  onAudit: () => void;
  onSuggestFill?: (pairs: Record<string, string>) => void;
}

export default function FormSection({
  template,
  formValues,
  liveAudit,
  onFieldChange,
  onBlurNormalize,
  onInnBlur,
  onSuggestFill,
}: FormSectionProps) {
  const visibleFields = template.fields.filter((f) =>
    isFieldVisible(f, formValues)
  );
  const tabs = Array.from(
    new Set(template.fields.map((f) => f.category))
  );

  const renderFields = (fields: TemplateField[]) =>
    fields.map((field) => (
      <FormField
        key={field.id}
        field={{ ...field, label: resolveFieldLabel(template.id, field) }}
        value={formValues[field.id] || ""}
        audit={liveAudit.filter((r) => r.field === field.id)}
        onChange={onFieldChange}
        onBlurNormalize={onBlurNormalize}
        onInnBlur={onInnBlur}
        onSuggestFill={onSuggestFill}
      />
    ));

  const sectionStats = tabs.map((tab) => {
    const fields = visibleFields.filter((f) => f.category === tab);
    const required = fields.filter((f) => f.validation?.required);
    const filled = required.filter((f) => formValues[f.id]?.trim());
    return {
      tab,
      required: required.length,
      filled: filled.length,
      done: required.length > 0 && filled.length === required.length,
      missing: required
        .filter((f) => !formValues[f.id]?.trim())
        .map((f) => resolveFieldLabel(template.id, f)),
      heading: tabRoleLabel(template.id, tab, TAB_LABELS[tab] || tab),
    };
  });
  // «Текущий» раздел — первый незавершённый (подсвечивается как now).
  const nowIndex = sectionStats.findIndex((s) => !s.done);

  const sectionHeading = (index: number) => {
    const s = sectionStats[index];
    return (
      <div className="flex items-center gap-2.5 mb-1">
        <h2 className="text-base font-bold" style={{ color: "var(--a2-ink)" }}>
          {s.heading}
        </h2>
        {s.required > 0 && (
          <span className={`a2-pill ${s.done ? "ok" : "mid"}`}>
            {s.done ? "Готово" : `${s.filled} из ${s.required}`}
          </span>
        )}
      </div>
    );
  };

  const sectionHint = (index: number) => {
    const s = sectionStats[index];
    if (s.done) return "Раздел заполнен — можно двигаться дальше.";
    if (index === nowIndex && s.missing.length > 0) {
      const names = s.missing.slice(0, 2).join(", ");
      const rest = s.missing.length > 2 ? ` и ещё ${s.missing.length - 2}` : "";
      return `Осталось: ${names}${rest}.`;
    }
    return null;
  };

  return (
    <div className="a2-tl">
      {sectionStats.map((s, i) => (
        <section
          key={s.tab}
          aria-label={s.heading}
          className={`a2-sec mb-4 p-[22px] pl-6 ${
            s.done ? "done" : i === nowIndex ? "now" : ""
          }`}
        >
          <span className="a2-node" aria-hidden="true">
            {s.done ? "✓" : i + 1}
          </span>
          {sectionHeading(i)}
          {sectionHint(i) && <p className="a2-hint mb-3.5">{sectionHint(i)}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderFields(visibleFields.filter((f) => f.category === s.tab))}
          </div>
        </section>
      ))}
    </div>
  );
}