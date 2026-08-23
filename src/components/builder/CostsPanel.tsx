import type { CostItem } from "@/lib/calculator";

interface CostsPanelProps {
  costCalc: { items: CostItem[] };
  ownershipYears: string;
  onOwnershipYearsChange: (v: string) => void;
}

export default function CostsPanel({
  costCalc,
  ownershipYears,
  onOwnershipYearsChange,
}: CostsPanelProps) {
  return (
    <>
      <div className="mb-3">
        <label className="block text-[10px] font-medium text-gray-600 mb-1">
          Срок владения (лет)
        </label>
        <select
          value={ownershipYears}
          onChange={(e) => onOwnershipYearsChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Не указано</option>
          <option value="1">1 год</option>
          <option value="2">2 года</option>
          <option value="3">3 года</option>
          <option value="4">4+ лет</option>
          <option value="5">5+ лет</option>
        </select>
      </div>
      <div className="space-y-2">
        {costCalc.items.map((item, i) => (
          <div
            key={i}
            title={item.pending ? item.note : undefined}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              item.type === "total"
                ? "bg-brand-50 font-medium"
                : "bg-gray-50"
            }`}
          >
            <span
              className={`text-xs ${
                item.type === "total"
                  ? "text-brand-900"
                  : "text-gray-700"
              }`}
            >
              {item.label}
              {item.pending && (
                <span className="block text-[10px] text-amber-700 font-normal">
                  {item.note}
                </span>
              )}
            </span>
            <span
              className={`text-xs font-semibold ${
                item.type === "total"
                  ? "text-brand-700"
                  : item.pending
                    ? "text-amber-700"
                    : item.amount === 0
                      ? "text-emerald-600"
                      : "text-gray-900"
              }`}
            >
              {item.pending ? "—" : `${item.amount.toLocaleString("ru-RU")} ₽`}
            </span>
          </div>
        ))}
      </div>
      {costCalc.items.some((item) => item.pending) && (
        <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700">
          Укажите срок владения, чтобы рассчитать НДФЛ
        </div>
      )}
    </>
  );
}
