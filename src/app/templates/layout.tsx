import type { Metadata } from "next";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600; // ISR: пересборка каждый час, без headers() — безопасно с Supabase-сессией.

export const metadata: Metadata = {
  title: "Каталог шаблонов договоров",
  description: `Готовые шаблоны договоров: ДКП авто и квартиры, аренда, подряд, расписка, счёт. Заполнение онлайн, автопроверка, экспорт в PDF и DOCX.`,
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "Каталог шаблонов договоров",
    description: "Готовые шаблоны договоров: ДКП, аренда, подряд, расписка, счёт. Заполнение онлайн, бесплатно, без регистрации.",
    url: `${SITE_URL}/templates`,
    type: "website",
    siteName: "Dogovor.expert — онлайн-конструктор договоров",
    locale: "ru_RU",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Каталог шаблонов договоров" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог шаблонов договоров",
    description: "Готовые шаблоны договоров: ДКП, аренда, подряд, расписка, счёт. Бесплатно, без регистрации.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

const COLLECTION_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Каталог шаблонов договоров",
  description:
    "Готовые шаблоны договоров: ДКП авто и квартиры, аренда, подряд, расписка, счёт. Заполнение онлайн, автопроверка, экспорт в PDF и DOCX.",
  url: `${SITE_URL}/templates`,
  inLanguage: "ru",
  isPartOf: { "@type": "WebSite", name: "Dogovor.expert", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: TEMPLATE_META.length,
    itemListElement: TEMPLATE_META.slice(0, 25).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/documents/${t.id}`,
      name: t.name,
    })),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={COLLECTION_LD} />
      {children}
    </>
  );
}
