import Link from "next/link";
import {
  Briefcase,
  Car,
  Coins,
  FileStack,
  Gavel,
  Home as HomeIcon,
  ScrollText,
  Stamp,
  Users,
} from "lucide-react";

export interface TemplateCategory {
  id: string;
  title: string;
  count: number;
  docs: string[];
}

const CATEGORY_ICON: Record<string, typeof HomeIcon> = {
  realty: HomeIcon,
  auto: Car,
  business: Briefcase,
  finance: Coins,
  family: Users,
  legal: Gavel,
  migpost: Stamp,
  other: FileStack,
};

interface HomeTemplatesProps {
  categories: TemplateCategory[];
  totalTemplates: number;
}

/** Библиотека документов — 8 категорий с живыми счётчиками. */
export default function HomeTemplates({ categories, totalTemplates }: HomeTemplatesProps) {
  return (
    <section id="templates" className="scroll-mt-4 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Библиотека документов</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {totalTemplates}+ шаблонов на все случаи
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Составлены и регулярно обновляются юристами с учётом изменений законодательства.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Открыть весь каталог из {totalTemplates}+ шаблонов
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICON[cat.id] ?? FileStack;
            return (
              <Link
                key={cat.id}
                href="/templates"
                className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                    {cat.count}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{cat.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-500">
                  {cat.docs.map((d) => (
                    <li key={d} className="flex items-center gap-1.5">
                      <ScrollText className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      <span className="truncate">{d}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 text-sm font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
                  Смотреть все →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
