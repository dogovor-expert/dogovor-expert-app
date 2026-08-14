import { ArrowRight, Eye, Shield } from "lucide-react";
import type { LegalTemplate, TemplateField } from "@/data/types";
import { isFieldVisible, type AuditResult } from "@/lib/validation";
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
}

export default function FormSection({
  template,
  formValues,
  liveAudit,
  onFieldChange,
  onBlurNormalize,
  onInnBlur,
  onGoToPreview,
  onAudit,
}: FormSectionProps) {
  const errorCount = liveAudit.filter(
    (r) => r.type === "error" && r.field !== "_all"
  ).length;
  const visibleFields = template.fields.filter((f) =>
    isFieldVisible(f, formValues)
  );
  const tabs = Array.from(
    new Set(template.fields.map((f) => f.category))
  ) as TemplateField["category"][];
  const simple = template.fields.length <= 20;

  const progress = visibleFields.filter(
    (f) => f.validation?.required && formValues[f.id]?.trim()
  ).length;
  const progressTotal = visibleFields.filter(
    (f) => f.validation?.required
  ).length;

  const renderFields = (fields: TemplateField[]) =>
    fields.map((field) => (
      <FormField
        key={field.id}
        field={field}
        value={formValues[field.id] || ""}
        audit={liveAudit.filter((r) => r.field === field.id)}
        onChange={onFieldChange}
        onBlurNormalize={onBlurNormalize}
        onInnBlur={onInnBlur}
      />
    ));

  const sectionHeading = (tab: TemplateField["category"]) => {
    const fields = visibleFields.filter((f) => f.category === tab);
    const required = fields.filter((f) => f.validation?.required);
    const filled = required.filter((f) => formValues[f.id]?.trim());
    const done = required.length > 0 && filled.length === required.length;
    return (
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        {TAB_LABELS[tab] || tab}
        {required.length > 0 && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              done
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {done ? "✓" : `${filled.length}/${required.length}`}
          </span>
        )}
      </h3>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-5">
        {simple ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderFields(visibleFields)}
          </div>
        ) : (
          <div className="space-y-6">
            {tabs.map((tab) => (
              <section key={tab} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-4 rounded-full bg-brand-400" />
                  {sectionHeading(tab)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderFields(visibleFields.filter((f) => f.category === tab))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <div className="px-5 pb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-gray-400">
          {progress} / {progressTotal} обязательных
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onAudit}
            className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          >
            <Shield className="w-4 h-4" />
            Проверить документ
          </button>
          <button
            onClick={onGoToPreview}
            className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-brand-500 text-white hover:bg-brand-600"
          >
            <Eye className="w-4 h-4" />
            Предпросмотр документа
            {errorCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] leading-none font-bold">
                {errorCount}
              </span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}