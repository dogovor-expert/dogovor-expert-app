import type { MetadataRoute } from "next";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { DOC_VARIATIONS } from "@/data/docVariations";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import { BLOG_POSTS } from "@/data/blog/posts";
import { CONVERTER_TOOLS } from "@/data/converter-tools";
import { CALCULATOR_TOOLS } from "@/data/calculator-tools";
import { SITE_URL } from "@/lib/site";
import { parseLastUpdated } from "@/lib/dates";

export { parseLastUpdated };

const POPULAR = new Set(POPULAR_TEMPLATE_IDS);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/templates`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/dkp`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/osago`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/autoteka`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/tahograph`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/techosmotr`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/converter`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/utils`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/sravnenie-dogovorov`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    // /security — личный кабинет «Безопасность аккаунта» (noindex, follow=false):
    // в sitemap не включаем (аудит 2026-09-22: раньше был конфликт sitemap↔noindex).
    { url: `${SITE_URL}/legal/trademark`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contacts`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blanks`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/zayavleniya`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/resume`, changeFrequency: "weekly", priority: 0.9 },
    // /ai-yurist — публичный лендинг AI-юриста (robots index:true, canonical /ai-yurist).
    { url: `${SITE_URL}/ai-yurist`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/epts`, changeFrequency: "monthly", priority: 0.6 },
  // /redactor — обезличивание документов (раздел «Дополнительные инструменты»).
  // Высокий приоритет: запрос «закрасить личные данные в pdf» и «обезличить
  // документ» — частый и конверсионный, инструмент полностью бесплатный.
  { url: `${SITE_URL}/redactor`, changeFrequency: "monthly", priority: 0.8 },
  // /notary — Контроль оферт (раздел «Дополнительные инструменты»).
  // Фиксация версий документов и сравнение текстов, полностью бесплатно.
  { url: `${SITE_URL}/notary`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const documents: MetadataRoute.Sitemap = LEGAL_TEMPLATES.map((t) => ({
    url: `${SITE_URL}/documents/${t.id}`,
    // 8.5 (аудит): популярные шаблоны — приоритет 0.8 и недельный crawl,
    // остальные — 0.6 / monthly. Список популярных общий с /blanks (data/popular.ts).
    changeFrequency: (POPULAR.has(t.id) ? "weekly" : "monthly"),
    priority: POPULAR.has(t.id) ? 0.8 : 0.6,
    lastModified: parseLastUpdated(t.lastUpdated),
  }));

  const variations: MetadataRoute.Sitemap = DOC_VARIATIONS.map((v) => ({
    url: `${SITE_URL}/documents/v/${v.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blog: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: parseLastUpdated(p.updatedAt),
  }));

  const converterTools: MetadataRoute.Sitemap = CONVERTER_TOOLS.map((t) => ({
    url: `${SITE_URL}/converter/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 9.1 (аудит): 22 калькулятора получили отдельные SEO-страницы /utils/{slug}.
  // Приоритет 0.7/weekly — под высокочастотные запросы «калькулятор …».
  const calculatorTools: MetadataRoute.Sitemap = CALCULATOR_TOOLS.map((t) => ({
    url: `${SITE_URL}/utils/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 8.3 (аудит): страницы /blanks/{slug} исключены из sitemap — они
  // cross-canonical'ятся на /documents/{slug} (см. generateMetadata
  // blanks/[slug]). В индексе должна быть только каноническая страница;
  // базовый каталог /blanks остаётся (у него свой листинг-контент).
  return [...staticPages, ...documents, ...variations, ...converterTools, ...calculatorTools, ...blog];
}