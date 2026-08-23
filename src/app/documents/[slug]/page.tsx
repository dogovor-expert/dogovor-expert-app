import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Download, FileText, ShieldCheck, ChevronRight, Check, Sparkles } from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqForTemplate, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/faq";
import { buildIntro, fieldsSummary } from "@/lib/seo/intro";

const YEAR = new Date().getFullYear();
const SITE_URL = "https://dogovor.expert";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_TEMPLATES.map((t) => ({ slug: t.id }));
}

function slugToTemplate(slug: string): LegalTemplate | undefined {
  return LEGAL_TEMPLATES.find((t) => t.id === slug);
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(async ({ slug }) => {
    const t = slugToTemplate(slug);
    if (!t) return {};
    const desc = `${t.description} Заполнение онлайн за 5 минут: PDF и DOCX, без регистрации, бесплатно. Образец ${YEAR} года.`;
    const url = `/documents/${t.id}`;
    return {
      title: `${t.name} — образец ${YEAR}: составить и скачать бесплатно`,
      description: truncateWord(desc, 155),
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
      alternates: { canonical: url },
      openGraph: {
        title: `${t.name} — образец ${YEAR}`,
        description: truncateWord(desc, 155),
        url,
        type: "website",
      },
    };
  });
}

function truncateWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : text.slice(0, max)) + "…";
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
  const faq = faqForTemplate(t.category);
  const related = (t.suggestedDocs || [])
    .map((id) => LEGAL_TEMPLATES.find((x) => x.id === id))
    .filter((x): x is LegalTemplate => Boolean(x))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог шаблонов", path: "/templates" },
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
        <Link href="/templates" className="hover:text-brand-600">Каталог шаблонов</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{t.name}</span>
      </nav>

      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 flex-shrink-0">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 mb-1">
            Бесплатно · Без регистрации · {t.actSource}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.name}</h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            Образец {YEAR} года: заполните форму — документ сформируется автоматически.
            Печать на листе А4, экспорт в PDF и DOCX.
          </p>
        </div>
        <Link
          href={`/builder?template=${t.id}`}
          className="sm:ml-auto inline-flex items-center gap-2 px-5 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-sm transition cursor-pointer flex-shrink-0"
        >
          Составить документ
          <ChevronRight className="w-4 h-4" />
        </Link>
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

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Что входит в документ
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

      <section className="bg-indigo-600 rounded-2xl px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white">
          Составьте документ за 5 минут
        </h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Никакой регистрации: откройте форму, введите данные — документ готов к печати.
        </p>
        <Link
          href={`/builder?template=${t.id}`}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Составить документ бесплатно
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}