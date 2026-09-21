import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlignLeft,
  Archive,
  ChevronRight,
  Droplets,
  FileDown,
  FileImage,
  FileText,
  Files,
  FileUp,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  PenLine,
  ScanText,
  Scissors,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import ConverterRunner from "@/components/converter/ConverterRunner";
import { AdSlot } from "@/components/ads/AdSlot";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";
import { CONVERTER_TOOLS, toolBySlug } from "@/data/converter-tools";

export const dynamicParams = false;
export const revalidate = 3600;
export const dynamic = "force-static";

const ICONS: Record<string, LucideIcon> = {
  Files,
  Scissors,
  LayoutGrid,
  Archive,
  Image: ImageIcon,
  FileImage,
  FileText,
  AlignLeft,
  FileDown,
  ScanText,
  PenLine,
  FileUp,
  Droplets,
  Hash,
};

export function generateStaticParams() {
  return CONVERTER_TOOLS.map((t) => ({ tool: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  return params.then(({ tool }) => {
    const t = toolBySlug(tool);
    if (!t) return {};
    return withSeo({
      path: `/converter/${t.slug}`,
      title: t.title,
      description: t.description,
      keywords: t.keywords,
      robots: { index: true, follow: true },
    });
  });
}

export default async function ConverterToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const t = toolBySlug(tool);
  if (!t) notFound();

  const Icon = ICONS[t.iconName] ?? Files;
  const related = t.related
    .map((slug) => toolBySlug(slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Конвертер", path: "/converter" },
            { name: t.label, path: `/converter/${t.slug}` },
          ]),
          faqJsonLd(t.faq),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.h1,
            url: `${SITE_URL}/converter/${t.slug}`,
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
        <Link href="/converter" className="hover:text-gray-900">
          Конвертер
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">{t.label}</span>
      </nav>

      <header className="space-y-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t.h1}</h1>
        <p className="text-gray-600">{t.intro}</p>
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Файлы обрабатываются в браузере и не загружаются на сервер
        </p>
      </header>

      <section aria-label={t.h1}>
        <ConverterRunner id={t.id} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Как это работает</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {t.howTo.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                {i + 1}
              </span>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="mt-1 text-sm text-gray-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Частые вопросы</h2>
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {t.faq.map((item) => (
            <details key={item.q} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
                {item.q}
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Подробнее</h2>
        {t.seoText.map((p) => (
          <p key={p.slice(0, 32)} className="text-gray-600">
            {p}
          </p>
        ))}
      </section>

      <AdSlot id="CONVERTER_FOOTER" />

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Другие инструменты</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => {
              const RIcon = ICONS[r.iconName] ?? Files;
              return (
                <Link
                  key={r.slug}
                  href={`/converter/${r.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <RIcon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-medium text-gray-900">{r.label}</span>
                    <span className="block text-sm text-gray-500">{r.short}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <AdSlot id="CONVERTER_RELATED" />

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Нужен готовый документ?</h2>
        <p className="mt-1 text-sm text-gray-600">
          В конструкторе — 369 шаблонов договоров, заявлений и согласий с автоматическим заполнением.
        </p>
        <Link
          href="/builder"
          className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Создать документ
        </Link>
      </section>

      <p className="text-xs text-gray-400">
        Сервис предоставляется «как есть». Перед использованием проверяйте результат — особенно для
        юридически значимых документов.
      </p>
    </div>
  );
}
