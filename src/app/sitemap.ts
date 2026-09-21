import type { MetadataRoute } from "next";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { DOC_VARIATIONS } from "@/data/docVariations";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import { BLOG_POSTS } from "@/data/blog/posts";
import { CONVERTER_TOOLS } from "@/data/converter-tools";
import { SITE_URL } from "@/lib/site";

const POPULAR = new Set(POPULAR_TEMPLATE_IDS);
const MONTHS: Record<string, number> = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
  январь: 1, февраль: 2, март: 3, апрель: 4, май: 5, июнь: 6,
  июль: 7, август: 8, сентябрь: 9, октябрь: 10, ноябрь: 11, декабрь: 12,
};

function parseLastUpdated(s: string): string | undefined {
  const m = s.match(/([А-Яа-яё]+)\s+(\d{4})/);
  if (!m) return undefined;
  const month = MONTHS[m[1].toLowerCase()];
  if (!month) return undefined;
  return `${m[2]}-${String(month).padStart(2, "0")}-01`;
}

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
    { url: `${SITE_URL}/utils`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/security`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contacts`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blanks`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/resume`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/epts`, changeFrequency: "monthly", priority: 0.6 },
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

  // 8.3 (аудит): страницы /blanks/{slug} исключены из sitemap — они
  // cross-canonical'ятся на /documents/{slug} (см. generateMetadata
  // blanks/[slug]). В индексе должна быть только каноническая страница;
  // базовый каталог /blanks остаётся (у него свой листинг-контент).
  return [...staticPages, ...documents, ...variations, ...converterTools, ...blog];
}