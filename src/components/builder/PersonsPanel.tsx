import { User, X } from "lucide-react";
import type { PersonRole } from "@/lib/docRequirements";

export interface PersonRow {
  id: string;
  fio: string;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_code?: string;
  address?: string;
}

interface PersonsPanelProps {
  roles: PersonRole[];
  persons: PersonRow[] | null;
  personsMsg: string | null;
  meFio: string | null;
  onApplyToRole: (person: PersonRow, prefix: string) => void;
  onApplyMe: (prefix: string) => void;
  onDelete: (id: string) => void;
  onSave: (prefix: string) => void;
}

export default function PersonsPanel({
  roles,
  persons,
  personsMsg,
  meFio,
  onApplyToRole,
  onApplyMe,
  onDelete,
  onSave,
}: PersonsPanelProps) {
  const roleChips = (apply: (prefix: string) => void) => (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <button
          key={r.prefix}
          type="button"
          onClick={() => apply(r.prefix)}
          title={`Подставить как ${r.label.toLowerCase()}`}
          className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 transition-colors"
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-2.5">
      {meFio && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-brand-50/60 border border-brand-100">
          <User className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-gray-800 truncate">
              {meFio}
            </p>
            <p className="text-[10px] text-gray-600 mb-1">Мои данные из профиля</p>
            {roleChips(onApplyMe)}
          </div>
        </div>
      )}
      {persons === null ? (
        <p className="text-[10px] text-gray-600">Загрузка...</p>
      ) : persons.length === 0 ? (
        <p className="text-[10px] text-gray-600">
          Пока нет сохранённых лиц: заполните данные стороны в форме и нажмите
          «Сохранить».
        </p>
      ) : (
        <div className="space-y-1.5">
          {persons.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-800 truncate">
                  {p.fio || "Без ФИО"}
                </p>
                <p className="text-[10px] text-gray-600 truncate mb-1">
                  {p.passport_series && p.passport_number
                    ? `Паспорт ${p.passport_series} ${p.passport_number}`
                    : p.passport_issued_by
                      ? p.passport_issued_by
                      : ""}
                  {p.address ? ` • ${p.address}` : ""}
                </p>
                {roleChips((prefix) => onApplyToRole(p, prefix))}
              </div>
              <button
                onClick={() => onDelete(p.id)}
                title="Удалить"
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        {roles.map((r) => (
          <button
            key={r.prefix}
            onClick={() => onSave(r.prefix)}
            className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-white border border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-600 transition-colors"
          >
            Сохранить {r.label.toLowerCase()}
          </button>
        ))}
      </div>
      {personsMsg && (
        <p className="text-[10px] text-emerald-600">{personsMsg}</p>
      )}
    </div>
  );
}