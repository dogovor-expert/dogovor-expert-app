import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Shield,
} from "lucide-react";
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

interface TabProgress {
  required: number;
  filled: number;
}

interface FormSectionProps {
  template: LegalTemplate;
  tabs: TemplateField["category"][];
  activeTab: TemplateField["category"];
  onTabChange: (tab: TemplateField["category"]) => void;
  formValues: Record<string, string>;
  liveAudit: AuditResult[];
  demoDismissed: Record<string, boolean>;
  onFieldChange: (fieldId: string, value: string) => void;
  onDismissDemo: (fieldId: string) => void;
  onBlurNormalize: (fieldId: string) => void;
  onInnBlur: (fieldId: string) => void;
  onGoToPreview: () => void;
  onAudit: () => void;
  tabProgress: (tab: TemplateField["category"]) => TabProgress;
}

export default function FormSection({
  template,
  tabs,
  activeTab,
  onTabChange,
  formValues,
  liveAudit,
  demoDismissed,
  onFieldChange,
  onDismissDemo,
  onBlurNormalize,
  onInnBlur,
  onGoToPreview,
  onAudit,
  tabProgress,
}: FormSectionProps) {
  const errorCount = liveAudit.filter((r) => r.type === "error" && r.field !== "_all").length;
  const visibleFields = template.fields.filter((f) => isFieldVisible(f, formValues));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 pt-4 flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const { required, filled } = tabProgress(tab);
          const done = required > 0 && filled === required;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-brand-50 text-brand-700 border-brand-500"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {TAB_LABELS[tab] || tab}
              {required > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                  title={
                    done
                      ? "Все обязательные поля заполнены"
                      : `Заполнено ${filled} из ${required} обязательных`
                  }
                >
                  {done ? "✓" : `${filled}/${required}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleFields
            .filter((f) => f.category === activeTab)
            .map((field) => (
              <FormField
                key={field.id}
                field={field}
                value={formValues[field.id] || ""}
                audit={liveAudit.filter((r) => r.field === field.id)}
                isDemo={
                  !demoDismissed[field.id] &&
                  field.defaultValue !== "" &&
                  formValues[field.id] === field.defaultValue &&
                  field.type !== "checkbox" &&
                  field.type !== "radio" &&
                  field.type !== "repeating"
                }
                onChange={onFieldChange}
                onDismissDemo={onDismissDemo}
                onBlurNormalize={onBlurNormalize}
                onInnBlur={onInnBlur}
              />
            ))}
        </div>
      </div>
      <div className="px-5 pb-5 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {
            visibleFields.filter(
              (f) => f.validation?.required && formValues[f.id]?.trim()
            ).length
          }{" "}
          /{" "}
          {
            visibleFields.filter(
              (f) => f.validation?.required
            ).length
          }{" "}
          обязательных
        </span>
        <div className="flex items-center gap-2">
          {tabs.indexOf(activeTab) > 0 && (
            <button
              onClick={() => onTabChange(tabs[tabs.indexOf(activeTab) - 1])}
              className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
          )}
          {tabs.indexOf(activeTab) < tabs.length - 1 && (
            <button
              onClick={() => onTabChange(tabs[tabs.indexOf(activeTab) + 1])}
              className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
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
          <div className="relative group">
            <button
              onClick={onAudit}
              className="inline-flex items-center justify-center font-medium transition-all px-4 py-2 text-sm rounded-xl gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            >
              <Shield className="w-4 h-4" />
              Проверить документ
            </button>
            <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-900 text-gray-100 text-xs leading-relaxed rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              Проверяет заполнение обязательных полей, корректность форматов
              (VIN, паспорт, код подразделения) и правовые подсказки: пороги
              для расписки, декларации 3-НДФЛ и даты в будущем.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
