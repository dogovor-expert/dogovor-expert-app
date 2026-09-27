import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Scale, Sparkles } from "lucide-react";
import { withSeo } from "@/lib/seo/withSeo";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/faq";
import { JsonLd } from "@/components/seo/JsonLd";
import DocCompare from "@/components/diff/DocCompare";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  COMPARE_FAQ,
  COMPARE_FEATURES,
  COMPARE_META,
  COMPARE_NORMS,
  COMPARE_RELATED,
  COMPARE_SEO_SECTIONS,
  COMPARE_STEPS,
} from "@/data/doc-compare";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = withSeo({
  path: COMPARE_META.path,
  title: COMPARE_META.title,
  description: COMPARE_META.description,
  keywords: COMPARE_META.keywords,
  robots: { index: true, follow: true },
});

export const dynamic = "force-static";
export const revalidate = 3600;

const CRUMBS = [
  { name: "Главная", path: "/" },
  { name: "Сравнение договоров", path: COMPARE_META.path },
];

export default function CompareDocumentsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
      <JsonLd data={faqJsonLd(COMPARE_FAQ)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Сравнение редакций договора и протокол разногласий",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: `${SITE_URL}${COMPARE_META.path}`,
          description: COMPARE_META.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
        }}
      />

      <div className="p-6 max-w-5xl mx-auto">
        <nav
          aria-label="Хлебные крошки"
          className="flex flex-wrap items-center gap-1 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-brand-600">
            Главная
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">Сравнение договоров</span>
        </nav>

        <header className="mt-4">
          <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">
            Сервис
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Сравнение редакций договора и протокол разногласий
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            Загрузите две редакции договора — сервис найдёт все отличия по
            пунктам и словам, а затем соберёт протокол разногласий с таблицей
            формулировок и подписями сторон. Всё работает в браузере: документы
            не отправляются на сервер.
          </p>
        </header>

        <div className="mt-6">
          <DocCompare />
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            Как это работает
          </h2>
          <ol className="mt-4 grid sm:grid-cols-2 gap-4">
            {COMPARE_STEPS.map((s, i) => (
              <li
                key={s.title}
                className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                  {i + 1}
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {s.title}
                </p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            Возможности
          </h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {COMPARE_FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
              >
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  {f.title}
                </p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
            <Scale className="w-5 h-5 text-brand-600" />
            Правовая основа
          </h2>
          <div className="mt-4 space-y-3">
            {COMPARE_NORMS.map((n) => (
              <div
                key={n.title}
                className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
              >
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {n.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {COMPARE_SEO_SECTIONS.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
              {s.h2}
            </h2>
            <div className="mt-3 space-y-3">
              {s.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            Частые вопросы
          </h2>
          <div className="mt-4 space-y-2">
            {COMPARE_FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-gray-900 list-none flex items-center justify-between gap-3">
                  {f.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            Смотрите также
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {COMPARE_RELATED.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-xl bg-white border border-gray-200 hover:border-brand-300 text-sm text-gray-800 px-3 py-2 transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 p-6">
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
            Нужен сам договор?
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            Соберите документ в конструкторе по готовому шаблону — а разногласия
            согласуйте протоколом.
          </p>
          <Link
            href="/templates"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
          >
            Открыть каталог шаблонов
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
        <div className="mx-auto max-w-3xl px-6 pb-10"><AdSlot id="ARTICLE_FOOTER" /></div>
      </div>
    </>
  );
}
