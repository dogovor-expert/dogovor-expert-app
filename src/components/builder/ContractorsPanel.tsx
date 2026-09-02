import { X } from "lucide-react";
import type { LegalTemplate } from "@/data/types";

interface SavedContractor {
  id: string;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

interface ContractorsPanelProps {
  template: LegalTemplate;
  contractors: SavedContractor[] | null;
  contractorsMsg: string | null;
  onApply: (c: SavedContractor) => void;
  onDelete: (id: string) => void;
  onSave: (prefix: string) => void;
}

export default function ContractorsPanel({
  template,
  contractors,
  contractorsMsg,
  onApply,
  onDelete,
  onSave,
}: ContractorsPanelProps) {
  return (
    <div className="space-y-2.5">
      {contractors === null ? (
        <p className="text-[10px] text-gray-600">Загрузка...</p>
      ) : contractors.length === 0 ? (
        <p className="text-[10px] text-gray-600">
          Пока нет сохранённых контрагентов: заполните реквизиты
          стороны в форме и нажмите «Сохранить».
        </p>
      ) : (
        <div className="space-y-1.5">
          {contractors.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <button
                onClick={() => onApply(c)}
                title="Подставить в форму"
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-[11px] font-medium text-gray-800 truncate">
                  {c.name || "Без названия"}
                </p>
                <p className="text-[10px] text-gray-600 truncate">
                  {c.inn ? `ИНН ${c.inn}` : ""}
                  {c.kpp ? ` • КПП ${c.kpp}` : ""}
                  {c.address ? ` • ${c.address}` : ""}
                </p>
              </button>
              <button
                onClick={() => onDelete(c.id)}
                title="Удалить"
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        {template.fields.some((f) => f.id.startsWith("seller_")) && (
          <button
            onClick={() => onSave("seller")}
            className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600 transition-colors"
          >
            Сохранить продавца
          </button>
        )}
        {template.fields.some((f) => f.id.startsWith("buyer_")) && (
          <button
            onClick={() => onSave("buyer")}
            className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600 transition-colors"
          >
            Сохранить покупателя
          </button>
        )}
      </div>
      {contractorsMsg && (
        <p className="text-[10px] text-emerald-600">{contractorsMsg}</p>
      )}
    </div>
  );
}
