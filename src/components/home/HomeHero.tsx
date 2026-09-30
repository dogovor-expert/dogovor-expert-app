import Link from "next/link";
import { CheckCircle2, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import HeroDocument from "@/components/home/HeroDocument";

interface HomeHeroProps {
  totalTemplates: number;
}

const TRUST_POINTS = ["Без банковской карты", "Юридическая сила УКЭП", "Соответствие 152-ФЗ"];

/**
 * Hero главной по макету: бейдж, H1, подзаголовок, 2 CTA,
 * trust-поинты, живые счётчики и мокап конструктора.
 */
export default function HomeHero({ totalTemplates }: HomeHeroProps) {
  const stats = [
    { value: `${totalTemplates}+`, label: "юридических шаблонов" },
    { value: "23", label: "правовых калькулятора" },
    { value: "5 мин", label: "на составление документа" },
    { value: "800+", label: "unit-тестов качества" },
  ];
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-24 sm:pt-14 sm:pb-32">
      {/* Декоративный фон */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-12rem] h-[38rem] w-[68rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100 via-blue-50 to-transparent blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]">
          <defs>
            <pattern id="home-hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgb(226 232 240)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-hero-grid)" />
        </svg>
      </div>

      {/* Две колонки только с xl: на 1024–1280 текст (text-6xl) и карточка
          не влезают рядом — карточка обрезалась правым краем. Ниже xl — стек. */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 xl:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            <Sparkles className="h-4 w-4" />
            Каждый шаблон проверен юристом
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Договор, иск или жалоба —{" "}
            <span className="relative mx-2 inline-block whitespace-nowrap text-indigo-600">
              за 5 минут
              <svg
                className="absolute -bottom-2 left-0 w-full text-amber-400"
                viewBox="0 0 200 9"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M1 6.5C40 2 120 1 199 5.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            без юриста
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Соберите юридически значимый документ из {totalTemplates}+ шаблонов, подпишите усиленной
            квалифицированной электронной подписью прямо в браузере и отправьте контрагенту —
            без визитов к юристу и очередей в МФЦ.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/builder"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/25 transition hover:shadow-indigo-600/40 hover:brightness-110"
            >
              Составить документ бесплатно
              <span className="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Как это работает
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {TRUST_POINTS.map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="order-2 mt-0.5 text-xs font-medium text-slate-500">{stat.label}</dt>
                <dd className="order-1 text-2xl font-extrabold text-slate-900">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Мокап конструктора */}
        <div className="relative xl:justify-self-end">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-blue-100/40 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 sm:max-w-lg xl:mx-0">
            <div className="flex items-center gap-1.5 rounded-t-2xl border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-500 shadow-inner">
                dogovor.expert/builder
              </span>
            </div>
            <div className="space-y-4 p-6">
              <HeroDocument />
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                  <FileCheck2 className="h-4 w-4" />
                  Готово к подписанию УКЭП
                </div>
                <Link
                  href="/builder"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                >
                  Открыть конструктор
                </Link>
              </div>
            </div>
          </div>

          {/* Бейдж 152-ФЗ: был слева внизу и наезжал на тёмную пилюлю
              «Экспорт в PDF и Word», а на sm–lg наполовину обрезался краем
              секции. Верхний правый угол свободен на всех ширинах. */}
          <div className="absolute -right-3 top-6 hidden w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:block">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900">Проверка по 152-ФЗ</div>
                <div className="text-[11px] text-slate-400">Данные остаются в браузере</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
