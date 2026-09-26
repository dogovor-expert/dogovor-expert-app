import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface HomeCalculator {
  slug: string;
  label: string;
  short: string;
}

interface HomeCalculatorsProps {
  calculators: HomeCalculator[];
}

/** Тёмная секция калькуляторов — только реальные инструменты со ссылками. */
export default function HomeCalculators({ calculators }: HomeCalculatorsProps) {
  return (
    <section id="calculators" className="relative scroll-mt-4 overflow-hidden bg-slate-950 py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">Калькуляторы и утилиты</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            23 правовых калькулятора с актуальными ставками
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Расчёты обновляются автоматически: не нужно вручную сверяться со ставками и лимитами.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((c) => (
            <Link
              key={c.slug}
              href={`/utils/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <h3 className="text-base font-bold text-white">{c.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{c.short}</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-300 opacity-0 transition group-hover:opacity-100">
                Открыть калькулятор <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/utils"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Все 23 калькулятора
          </Link>
        </div>
      </div>
    </section>
  );
}
