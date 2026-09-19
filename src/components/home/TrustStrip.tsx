import { Star, Users, BadgeCheck, ShieldCheck } from "lucide-react";

/** Полоса доверия под hero: рейтинг, объём, проверка юристом. */
export default function TrustStrip() {
  const items = [
    { icon: Star, title: "4,9 из 5", sub: "средняя оценка", grad: "from-amber-400 to-orange-500" },
    { icon: Users, title: "12 480", sub: "документов за месяц", grad: "from-brand-500 to-indigo-600" },
    { icon: BadgeCheck, title: "Проверено юристом", sub: "формулировки по ГК РФ", grad: "from-purple-500 to-purple-700" },
    { icon: ShieldCheck, title: "152-ФЗ", sub: "данные в браузере", grad: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.title}
          className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl bg-gradient-to-br ${it.grad} text-white`}>
            <it.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-bold text-gray-900">{it.title}</span>
            <span className="block truncate text-[11px] text-gray-500">{it.sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
