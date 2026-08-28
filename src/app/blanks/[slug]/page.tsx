import type { Metadata } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Download, FileText, ShieldCheck, ChevronRight, Check, Sparkles } from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqForTemplate, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/faq";
import { buildIntro, fieldsSummary } from "@/lib/seo/intro";
import { renderTemplateDocument } from "@/lib/renderDocument";
import BlankDownloadButtons from "@/components/blank/BlankDownloadButtons";

const YEAR = new Date().getFullYear();
const SITE_URL = "https://dogovor.expert";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_TEMPLATES.map((t) => ({ slug: t.id }));
}

function slugToTemplate(slug: string): LegalTemplate | undefined {
  return LEGAL_TEMPLATES.find((t) => t.id === slug);
}

/**
 * Статические превью-картинки бланка (сгенерированы скриптом
 * scripts/generate-blank-previews.mts из того же buildPdf, что и кнопка
 * «Скачать PDF»). Возвращает список путей по страницам либо [] — тогда
 * страница откатывается на старый HTML-превью (безопасный переход).
 */
function getBlankPreviewImages(slug: string): string[] {
  try {
    const manifestPath = join(process.cwd(), "public", "blank-previews", "index.json");
    if (!existsSync(manifestPath)) return [];
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, number>;
    const n = manifest[slug];
    if (!n) return [];
    const imgs: string[] = [];
    for (let i = 1; i <= n; i++) {
      const rel = `/blank-previews/${slug}-${i}.jpg`;
      if (existsSync(join(process.cwd(), "public", rel))) imgs.push(rel);
    }
    return imgs;
  } catch {
    return [];
  }
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(async ({ slug }) => {
    const t = slugToTemplate(slug);
    if (!t) return {};
    const desc = `Скачайте пустой бланк «${t.name}» бесплатно в PDF и Word. Готовая форма для ручного заполнения с адресом сайта dogovor.expert. ${t.description}`;
    const url = `/blanks/${t.id}`;
    return {
      title: `Скачать пустой бланк «${t.name}» — PDF и Word бесплатно`,
      description: truncateWord(desc, 200),
      keywords: [
        `скачать бланк ${t.name}`,
        `пустой бланк ${t.name}`,
        "бланк договора скачать бесплатно",
        "образец бланка",
      ],
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
      },
      alternates: { canonical: url },
      openGraph: {
        title: `Скачать пустой бланк «${t.name}» — PDF и Word`,
        description: truncateWord(desc, 200),
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

export default async function BlankPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = slugToTemplate(slug);
  if (!t) notFound();

  const url = `/blanks/${t.id}`;
  const { TEMPLATE_PREVIEWS } = await import("@/data/templatePreviews");
  const previewHtml = renderTemplateDocument(t, {}, {
    previewTemplate: TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate,
    blank: true,
    blankMode: "html",
  });

  const previewImages = getBlankPreviewImages(t.id);

  const faq = faqForTemplate(t.category);
  const summary = fieldsSummary(t);
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
            { name: "Бланки", path: "/blanks" },
            { name: t.name, path: url },
          ]),
          faqJsonLd(faq),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Пустой бланк «${t.name}»`,
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
        <Link href="/blanks" className="hover:text-brand-600">Бланки</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{t.name}</span>
      </nav>

      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 flex-shrink-0">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 mb-1">
            Пустой бланк · Бесплатно · {t.actSource}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Пустой бланк «{t.name}»
          </h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            Готовая форма для ручного заполнения. Скачайте в PDF или Word, распечатайте
            и заполните от руки — или откройте на компьютере. На бланке указан адрес
            сайта dogovor.expert.
          </p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Скачать пустой бланк
        </h2>
        <BlankDownloadButtons templateId={t.id} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Предпросмотр бланка
          </h2>
          <span className="text-xs text-gray-400">формат А4</span>
        </div>
        <div className="mx-auto w-full max-w-[794px] bg-white shadow-xl rounded-lg overflow-hidden ring-1 ring-gray-100">
          {previewImages.length > 0 ? (
            <div className="flex flex-col gap-3 p-3 sm:p-4">
              {previewImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Пустой бланк «${t.name}», страница ${i + 1}`}
                  className="w-full h-auto rounded"
                />
              ))}
            </div>
          ) : (
            <div
              className="p-6 sm:p-10 text-[13px] leading-relaxed text-zinc-900"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: Clock, title: "Заполняйте от руки", text: "или на компьютере" },
          { icon: ShieldCheck, title: "Юридическая сила", text: `по ${t.actSource.split(",")[0]}` },
          { icon: Download, title: "PDF и Word", text: "бесплатно, без регистрации" },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-gray-200 rounded-xl py-4 px-2">
            <f.icon className="w-5 h-5 mx-auto text-indigo-500" />
            <p className="text-sm font-bold text-gray-900 mt-1.5">{f.title}</p>
            <p className="text-[11px] text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Что входит в бланк</h2>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Похожие бланки</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blanks/${r.id}`}
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
        <h2 className="text-xl font-bold text-white">Заполнить онлайн за 5 минут</h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Не хотите писать от руки? Откройте конструктор, введите данные — документ
          сформируется автоматически и будет готов к печати.
        </p>
        <Link
          href={`/builder?template=${t.id}`}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Заполнить документ бесплатно
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
