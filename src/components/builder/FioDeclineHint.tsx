import { useMemo } from "react";
import { declineFullFio, type FioCases } from "@/lib/decline";

export default function FioDeclineHint({ fio }: { fio: string }) {
  const cases = useMemo(() => declineFullFio(fio), [fio]);
  const items: [string, keyof FioCases][] = [
    ["Родительный", "gen"],
    ["Дательный", "dat"],
    ["Винительный", "acc"],
    ["Творительный", "ins"],
    ["Предложный", "pre"],
  ];
  return (
    <div className="mt-1.5 p-2 rounded-lg bg-purple-50 border border-purple-100">
      <p className="text-[10px] font-medium text-purple-700 mb-1">
        Склонение ФИО для текста документа:
      </p>
      <div className="space-y-0.5">
        {items.map(([label, key]) => (
          <button
            key={key}
            onClick={() => navigator.clipboard.writeText(cases[key])}
            title="Нажмите, чтобы скопировать"
            className="w-full flex items-baseline justify-between gap-2 text-[11px] text-gray-600 hover:text-purple-700 hover:bg-white rounded px-1 py-0.5 transition-colors"
          >
            <span className="text-gray-400 flex-shrink-0">{label}</span>
            <span className="truncate">{cases[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
