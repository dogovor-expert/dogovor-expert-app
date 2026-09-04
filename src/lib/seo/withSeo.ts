/**
 * Централизованный конструктор SEO-метаданных.
 *
 * Устраняет повторение openGraph + twitter + canonical на 7+ страницах и
 * добавляет siteName / locale / images в OG, которые без него теряются.
 *
 * Использование:
 *   export const metadata = withSeo({
 *     path: "/utils",
 *     title: "Юридические калькуляторы",
 *     description: "Госпошлина, проценты 395 ГК, неустойка…",
 *   });
 *
 * OG-image по умолчанию — /og-image.png (1200×630, есть в public/).
 * og:type — "website" по умолчанию, для конкретных документов — "article".
 */
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "Dogovor.expert — конструктор договоров",
};

export type WithSeoOptions = {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  /** Полный OG-image (если у страницы есть своя миниатюра). По умолчанию — корневая. */
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  publishedTime?: string;
  modifiedTime?: string;
  /** Доп. OG/Twitter-поля. */
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
  /** Полные override'ы. */
  robots?: Metadata["robots"];
  alternates?: Metadata["alternates"];
  keywords?: string[];
};

export function withSeo(opts: WithSeoOptions): Metadata {
  const fullUrl = opts.path.startsWith("http") ? opts.path : `${SITE_URL}${opts.path}`;
  const images = opts.images ?? [OG_IMAGE];

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    ...(opts.robots ? { robots: opts.robots } : {}),
    alternates: opts.alternates ?? { canonical: opts.path },
    openGraph: {
      type: opts.ogType ?? "website",
      siteName: SITE_NAME,
      locale: "ru_RU",
      url: fullUrl,
      title: opts.title,
      description: opts.description,
      images,
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
      ...opts.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: images.map((i) => i.url),
      ...opts.twitter,
    },
  };
}
