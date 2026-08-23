import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog/posts";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import BlogList from "@/components/blog/BlogList";

const SITE_URL = "https://dogovor.expert";
const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Блог о договорах: инструкции, налоги, риски — ${YEAR}`,
  description:
    "Статьи юристов о договорах: аренда, ГПХ и самозанятость, расписки, доверенности, ДКП авто. Разбор с нормами ГК РФ, ТК РФ и НК РФ.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Блог о договорах — ${YEAR}`,
    description:
      "Инструкции по договорам: аренда, ГПХ, расписки, доверенности. Простым языком, с нормами закона.",
    url: "/blog",
    type: "website",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  аренда: "Аренда жилья",
  авто: "Автомобили",
  бизнес: "Бизнес и ГПХ",
  финансы: "Долги и расписки",
  право: "Право",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 lg:min-h-0 lg:h-full lg:overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:h-full">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Блог", path: "/blog" },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Блог о договорах",
              description:
                "Статьи о договорах: аренда, ГПХ, расписки, доверенности, ДКП авто.",
              url: `${SITE_URL}/blog`,
              inLanguage: "ru",
            },
          ]}
        />
        <BlogList posts={BLOG_POSTS} labels={CATEGORY_LABELS} />
      </div>
    </div>
  );
}
