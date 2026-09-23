import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { IncompleteField } from "@/lib/builderNav";

interface NextFieldNavProps {
  incomplete: IncompleteField[];
  total: number;
  onJump: (fieldId: string) => void;
}

const SHOWN = 4;

/**
 * Навигация «осталось заполнить»: теги незаполненных обязательных
 * полей. Клик — скролл к полю и фокус (через onJump родителя).
 * Когда всё готово — подтверждающая плашка вместо списка.
 */
export default function NextFieldNav({
  incomplete,
  total,
  onJump,
}: NextFieldNavProps) {
  if (incomplete.length === 0) {
    return (
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-sm text-emerald-800">
          <span className="font-semibold">Всё заполнено ({total} из {total}).</span>{" "}
          Открывайте предпросмотр — документ готов к проверке.
        </p>
      </div>
    );
  }
  const rest = incomplete.length - SHOWN;
  return (
    <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
      <p className="text-sm font-semibold text-gray-900 mb-2">
        Осталось заполнить: {incomplete.length}. Нажмите, чтобы перейти:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {incomplete.slice(0, SHOWN).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onJump(f.id)}
            className="inline-flex items-center gap-1 rounded-full border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            {f.label}
          </button>
        ))}
        {rest > 0 && (
          <span className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500">
            и ещё {rest}
          </span>
        )}
      </div>
    </div>
  );
}
