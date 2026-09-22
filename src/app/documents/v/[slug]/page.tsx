import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, FileText, Sparkles } from "lucide-react";
import { DOC_VARIATIONS, getVariation, type DocVariation } from "@/data/docVariations";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { truncateWord } from "@/lib/seo/docMeta";
import { SITE_URL } from "@/lib/site";
import { AdSlot } from "@/components/ads/AdSlot";

const YEAR = new Date().getFullYear();

export const dynamicParams = false;
export const revalidate = 3600;
export const dynamic = "force-static";

export function generateStaticParams() {
  return DOC_VARIATIONS.map((v) => ({ slug: v.id }));
}

function slugToVariation(slug: string): DocVariation | undefined {
  return getVariation(slug);
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const v = slugToVariation(slug);
    if (!v) return {};
    const parent = LEGAL_TEMPLATES.find((t) => t.id === v.templateId);
    const url = `/documents/v/${v.id}`;
    return withSeo({
      path: url,
      title: truncateWord(`${v.title} ${YEAR}`, 60),
      description: truncateWord(v.description, 160),
      ogType: "article",
      modifiedTime: parent?.lastUpdated,
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
      alternates: { canonical: `${SITE_URL}${url}` },
    });
  });
}

export default async function DocumentVariationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = slugToVariation(slug);
  if (!v) notFound();

  const parent = LEGAL_TEMPLATES.find((t) => t.id === v.templateId);
  if (!parent) notFound();

  const url = `/documents/v/${v.id}`;
  const related: LegalTemplate[] = [];

  const relatedIds: string[] = [];
  for (const id of [
    parent.id,
    ...(parent.suggestedDocs || []).slice(0, 5),
    ...(v.relatedTemplateIds || []),
  ]) {
    if (!relatedIds.includes(id)) relatedIds.push(id);
  }
  for (const id of relatedIds) {
    const t = LEGAL_TEMPLATES.find((x) => x.id === id);
    if (t) related.push(t);
  }
  const relatedCards = related.slice(0, 8);

  const normParagraphs = v.normNotes.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Документы", path: "/templates" },
            { name: parent.name, path: `/documents/${parent.id}` },
            { name: v.h1, path: url },
          ]),
          faqJsonLd(v.faq),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: v.h1,
            description: v.description,
            url: `${SITE_URL}${url}`,
            inLanguage: "ru",
            dateModified: parent.lastUpdated,
          },
        ]}
      />

      <nav className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/templates" className="hover:text-brand-600">Документы</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/documents/${parent.id}`} className="hover:text-brand-600">
          {parent.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{v.h1}</span>
      </nav>

      <section className="flex flex-col items-start gap-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          Вариация: {v.angle}
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{v.h1}</h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            Особый случай составления документа «{parent.name}»: учитывает специфику «{v.angle}».
            Заполните форму — документ сформируется автоматически, экспорт в PDF и DOCX.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/builder?template=${parent.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition cursor-pointer"
          >
            Составить документ
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/documents/${parent.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Открыть исходный шаблон
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Особенности вариации</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          {v.specifics.map((s) => (
            <p key={s} className="text-sm text-gray-700 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              {s}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Нормы и правовая справка</h2>
        {normParagraphs.map((p, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Частые вопросы</h2>
        <div className="space-y-2.5">
          {v.faq.map((f) => (
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

      {relatedCards.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Связанные документы</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedCards.map((r) => (
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

      <AdSlot id="DOC_TEMPLATE_FOOTER" />

      <section className="bg-indigo-600 rounded-2xl px-6 py-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white mt-4">
          Составьте документ за 5 минут
        </h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Никакой регистрации: откройте форму, введите данные — документ готов к печати.
        </p>
        <Link
          href={`/builder?template=${parent.id}`}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Составить документ бесплатно
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}