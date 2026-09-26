import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Download, FileText, ShieldCheck, ChevronRight, Check, Sparkles } from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqForDocument, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/faq";
import { buildIntro, fieldsSummary } from "@/lib/seo/intro";
import { docTitle, docDesc } from "@/lib/seo/docMeta";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";
import { AdSlot } from "@/components/ads/AdSlot";

const YEAR = new Date().getFullYear();

export const dynamicParams = false;
export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG (см. INVARIANTS.md).

export function generateStaticParams() {
  return LEGAL_TEMPLATES.map((t) => ({ slug: t.id }));
}

function slugToTemplate(slug: string): LegalTemplate | undefined {
  return LEGAL_TEMPLATES.find((t) => t.id === slug);
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const t = slugToTemplate(slug);
    if (!t) return {};
    const url = `/documents/${t.id}`;
    return withSeo({
      path: url,
      title: t.seoTitle ?? docTitle(t.name),
      description: docDesc(t.description),
      ogType: "article",
      modifiedTime: t.lastUpdated,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    });
  });
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = slugToTemplate(slug);
  if (!t) notFound();

  const url = `/documents/${t.id}`;
  const intro = buildIntro(t);
  const summary = fieldsSummary(t);
  const faq = faqForDocument(t);
  const isStatement = t.kind === "statement";
  const related = (t.suggestedDocs || [])
    .map((id) => LEGAL_TEMPLATES.find((x) => x.id === id))
    .filter((x): x is LegalTemplate => Boolean(x))
    .slice(0, 5);
  // Sibling-перелинковка: у заявлений — только заявления (та же группа
  // statementGroup, иначе legal-категория подмешает иски к бытовым),
  // у договоров — документы той же категории. Исключаем текущий и related.
  const relatedIds = new Set(related.map((r) => r.id));
  const siblings = isStatement
    ? LEGAL_TEMPLATES.filter(
        (x) =>
          x.kind === "statement" &&
          (x.statementGroup ?? "official-forms") === (t.statementGroup ?? "official-forms") &&
          x.id !== t.id &&
          !relatedIds.has(x.id)
      ).slice(0, 6)
    : LEGAL_TEMPLATES.filter(
        (x) => x.category === t.category && x.id !== t.id && !relatedIds.has(x.id)
      ).slice(0, 6);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            ...(isStatement
              ? [{ name: "Заявления", path: "/zayavleniya" }]
              : [{ name: "Каталог шаблонов", path: "/templates" }]),
            { name: t.name, path: url },
          ]),
          faqJsonLd(faq),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: t.name,
            description: t.description,
            url: `${SITE_URL}${url}`,
            inLanguage: "ru",
            dateModified: t.lastUpdated,
          },
        ]}
      />

      <nav className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        {isStatement ? (
          <Link href="/zayavleniya" className="hover:text-brand-600">Заявления</Link>
        ) : (
          <Link href="/templates" className="hover:text-brand-600">Каталог шаблонов</Link>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{t.name}</span>
      </nav>

      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${isStatement ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-indigo-50 border-indigo-200 text-indigo-500"}`}>
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${isStatement ? "text-emerald-700" : "text-indigo-700"}`}>
            {isStatement ? "Заявление · " : ""}Бесплатно · Без регистрации · {t.actSource}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.name}</h1>
          {isStatement ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                Заявление
              </span>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                {t.formKind === "official" ? "официальная форма" : "свободная форма"}
              </span>
            </div>
          ) : null}
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            {isStatement
              ? `Образец ${YEAR} года: заполните форму — заявление сформируется автоматически. Печать на листе А4, экспорт в PDF и DOCX.`
              : `Образец ${YEAR} года: заполните форму — документ сформируется автоматически. Печать на листе А4, экспорт в PDF и DOCX.`}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/blanks/${t.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Пустой бланк
          </Link>
          <Link
            href={`/builder?template=${t.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition cursor-pointer"
          >
            Составить {isStatement ? "заявление" : "документ"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        {intro.map((p, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: Clock, title: "5 минут", text: "на заполнение" },
          { icon: ShieldCheck, title: "Юридическая сила", text: `по ${t.actSource.split(",")[0]}` },
          { icon: Download, title: "PDF и DOCX", text: "экспорт и печать" },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-gray-200 rounded-xl py-4 px-2">
            <f.icon className="w-5 h-5 mx-auto text-indigo-500" />
            <p className="text-sm font-bold text-gray-900 mt-1.5">{f.title}</p>
            <p className="text-[11px] text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>

      {isStatement && t.submitTo && (
        <section aria-label="Куда подавать" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-bold text-emerald-900 mb-3">📍 Куда подавать</h2>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li><b>Куда:</b> {t.submitTo.where}</li>
            <li><b>Срок:</b> {t.submitTo.term}</li>
            <li><b>Пошлина:</b> {t.submitTo.fee}</li>
            <li><b>Приложить:</b> {t.submitTo.attach}</li>
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {isStatement ? "Что входит в заявление" : "Что входит в документ"}
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          {summary.map((s) => (
            <p key={s} className="text-sm text-gray-700 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              {s}
            </p>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Связанные документы
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/documents/${r.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                  {r.name}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                  {r.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isStatement ? "Другие заявления" : "Другие документы категории"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/documents/${s.id}`}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                {s.name}
              </Link>
            ))}
            <Link
              href={isStatement ? "/zayavleniya" : "/templates"}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs text-indigo-700 hover:bg-indigo-100 transition"
            >
              {isStatement ? "Все заявления →" : "Все шаблоны →"}
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Частые вопросы</h2>
        <div className="space-y-2.5">
          {faq.map((f) => (
            <details
              key={f.q}
              className="group bg-white border border-gray-200 rounded-xl px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer text-sm font-semibold text-gray-800 list-none">
                {f.q}
                <ChevronRight className="w-4 h-4 text-gray-600 transition-transform group-open:rotate-90 flex-shrink-0" />
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <AdSlot id="DOC_TEMPLATE_FOOTER" />

      <section className="bg-indigo-600 rounded-2xl px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white">
          {isStatement ? "Составьте заявление за 5 минут" : "Составьте документ за 5 минут"}
        </h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Никакой регистрации: откройте форму, введите данные — {isStatement ? "заявление" : "документ"} готово к печати.
        </p>
        <Link
          href={`/builder?template=${t.id}`}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Составить {isStatement ? "заявление" : "документ"} бесплатно
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}