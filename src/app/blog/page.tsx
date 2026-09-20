import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog/posts";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/blog";
import BlogList from "@/components/blog/BlogList";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

const YEAR = new Date().getFullYear();

export function generateMetadata(): Metadata {
  return withSeo({
    title: `Блог о договорах — ${YEAR}`,
    description:
      "Статьи юристов о договорах: аренда, ГПХ и самозанятость, расписки, доверенности, ДКП авто. Разбор с нормами ГК РФ, ТК РФ и НК РФ.",
    path: "/blog",
  });
}

export default function BlogPage() {
  const breadcrumbs = [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
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
      <BlogList
        posts={BLOG_POSTS}
        labels={CATEGORY_LABELS}
        order={CATEGORY_ORDER}
        templatesCount={LEGAL_TEMPLATES.length}
      />
    </div>
  );
}