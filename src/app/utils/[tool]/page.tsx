import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Baby,
  Banknote,
  Briefcase,
  CalendarDays,
  Car,
  CarFront,
  CarTaxiFront,
  ChevronRight,
  FileWarning,
  Fingerprint,
  Hash,
  Home,
  Landmark,
  Percent,
  Plane,
  Recycle,
  Scale,
  ShieldCheck,
  Ship,
  ShieldQuestion,
  Store,
  TrendingUp,
  Wallet,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import CalculatorRunner from "@/components/calculator/CalculatorRunner";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";
import { CALCULATOR_TOOLS, calcToolBySlug } from "@/data/calculator-tools";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

export const dynamicParams = false;
export const revalidate = 3600;
export const dynamic = "force-static";

const ICONS: Record<string, LucideIcon> = {
  Landmark,
  Percent,
  Scale,
  Banknote,
  Home,
  Baby,
  FileWarning,
  TrendingUp,
  Briefcase,
  Wallet,
  CarTaxiFront,
  Store,
  Plane,
  Car,
  CarFront,
  Recycle,
  Ship,
  ShieldQuestion,
  Fingerprint,
  Hash,
  CalendarDays,
  FileSpreadsheet,
};

export function generateStaticParams() {
  return CALCULATOR_TOOLS.map((t) => ({ tool: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  return params.then(({ tool }) => {
    const t = calcToolBySlug(tool);
    if (!t) return {};
    return withSeo({
      path: `/utils/${t.slug}`,
      title: t.title,
      description: t.description,
      keywords: t.keywords,
      robots: { index: true, follow: true },
    });
  });
}

export default async function CalculatorToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const t = calcToolBySlug(tool);
  if (!t) notFound();

  const Icon = ICONS[t.iconName] ?? Landmark;
  const related = t.related
    .map((slug) => calcToolBySlug(slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const ctaTemplate = t.ctaTemplateId
    ? LEGAL_TEMPLATES.find((x) => x.id === t.ctaTemplateId)
    : undefined;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Калькуляторы и проверки", path: "/utils" },
            { name: t.label, path: `/utils/${t.slug}` },
          ]),
          faqJsonLd(t.faq),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.h1,
            url: `${SITE_URL}/utils/${t.slug}`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
          },
        ]}
      />

      <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/utils" className="hover:text-gray-900">
          Калькуляторы
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">{t.label}</span>
      </nav>

      <header className="mt-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-brand-200 text-brand-600 shadow-soft grid place-items-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">{t.h1}</h1>
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{t.intro}</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[12px] text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Расчёт выполняется в браузере — данные не отправляются на сервер
          </p>
        </div>
      </header>

      <section aria-label={t.h1} className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-soft p-4 sm:p-5">
        <CalculatorRunner id={t.id} />
      </section>

      <section className="mt-10" aria-labelledby="how-calc">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Методика</p>
        <h2 id="how-calc" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">
          Как считается
        </h2>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">Формула</p>
            <ul className="mt-2 space-y-2">
              {t.formula.map((f) => (
                <li key={f.slice(0, 32)} className="flex items-start gap-2 text-[13px] text-gray-700 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">Правовое основание</p>
            <ul className="mt-2 space-y-2">
              {t.norms.map((n) => (
                <li key={n.slice(0, 32)} className="text-[12.5px] text-gray-600 leading-relaxed">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="how-use">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Инструкция</p>
        <h2 id="how-use" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">
          Как пользоваться калькулятором
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {t.howTo.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
              <span className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 text-brand-700 grid place-items-center text-xs font-bold">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-[12.5px] text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="details">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Подробнее</p>
        <h2 id="details" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">
          О расчёте
        </h2>
        <div className="mt-3 space-y-3">
          {t.seoText.map((p) => (
            <p key={p.slice(0, 32)} className="text-[13.5px] text-gray-600 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="faq-heading">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Вопросы и ответы</p>
        <h2 id="faq-heading" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">
          Частые вопросы
        </h2>
        <div className="mt-4 rounded-2xl bg-white border border-gray-200 shadow-soft divide-y divide-gray-100 overflow-hidden">
          {t.faq.map((item, i) => (
            <details key={item.q} className="group p-4 sm:p-5 open:bg-gray-50/60 transition-colors">
              <summary className="cursor-pointer text-sm font-semibold text-gray-900 flex items-start gap-2.5 list-none">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="flex-1">{item.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-2 pl-[30px] text-[13px] text-gray-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <AdSlot id="CALC_RESULT" />

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related">
          <h2 id="related" className="text-xl font-extrabold tracking-tight text-gray-900">
            Другие калькуляторы
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => {
              const RIcon = ICONS[r.iconName] ?? Landmark;
              return (
                <Link
                  key={r.slug}
                  href={`/utils/${r.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-soft transition hover:border-brand-300"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-600">
                    <RIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-900">{r.label}</span>
                    <span className="block text-[12px] text-gray-500 truncate">{r.short}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 p-6 sm:p-7 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Нужен документ по результатам расчёта?</h2>
          <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
            {ctaTemplate
              ? `Откройте «${ctaTemplate.name}» в конструкторе: форма документа уже выбрана, останется заполнить реквизиты и скачать готовый файл.`
              : "В конструкторе доступны шаблоны претензий, исковых заявлений, расписок и договоров. Суммы и периоды из калькулятора подставляются в документ автоматически."}
          </p>
          <p className="mt-2 text-[12.5px] text-gray-500">
            Нужен другой инструмент?{" "}
            <Link href="/utils" className="font-semibold text-brand-600 hover:underline">
              Все калькуляторы и проверки
            </Link>
          </p>
        </div>
        {ctaTemplate ? (
          <Link
            href={`/builder?template=${ctaTemplate.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold text-sm transition shrink-0 shadow-sm text-center"
          >
            Открыть «{ctaTemplate.name}» →
          </Link>
        ) : (
          <Link
            href="/builder"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold text-sm transition shrink-0 shadow-sm"
          >
            Перейти к конструктору →
          </Link>
        )}
      </section>

      <p className="mt-6 text-xs text-gray-500 text-center">
        Расчёты носят справочный характер. Окончательные суммы определяет суд, налоговый орган или иное уполномоченное
        лицо.
      </p>
    </div>
  );
}
