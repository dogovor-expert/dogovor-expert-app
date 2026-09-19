import Link from "next/link";
import { Car, Home, Briefcase, Coins, Users, FileStack, Sparkles } from "lucide-react";

const CATS = [
  { id: "auto", label: "Авто", icon: Car },
  { id: "realty", label: "Недвижимость", icon: Home },
  { id: "business", label: "Бизнес", icon: Briefcase },
  { id: "finance", label: "Финансы", icon: Coins },
  { id: "family", label: "Семейные", icon: Users },
  { id: "other", label: "Прочее", icon: FileStack },
];

/** Быстрый выбор популярной категории прямо из hero. */
export default function QuickPick() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        <Sparkles className="h-3.5 w-3.5 text-brand-500" />
        Быстрый выбор:
      </span>
      {CATS.map((c) => (
        <Link
          key={c.id}
          href={`/templates?cat=${c.id}`}
          className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md"
        >
          <c.icon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-brand-600" />
          {c.label}
        </Link>
      ))}
    </div>
  );
}
