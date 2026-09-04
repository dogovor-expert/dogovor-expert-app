import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog/posts";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import BlogList from "@/components/blog/BlogList";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600; // ISR: пересборка каждый час.

const YEAR = new Date().getFullYear();
const POSTS_PER_PAGE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  аренда: "Аренда жилья",
  авто: "Автомобили",
  бизнес: "Бизнес и ГПХ",
  финансы: "Долги и расписки",
  право: "Право",
};

interface BlogPageProps {
  searchParams: Promise<{ cat?: string }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const categoryLabel = cat ? CATEGORY_LABELS[cat] || cat : "Все материалы";
  return withSeo({
    title: `Блог о договорах: ${categoryLabel} — ${YEAR}`,
    description:
      "Статьи юристов о договорах: аренда, ГПХ и самозанятость, расписки, доверенности, ДКП авто. Разбор с нормами ГК РФ, ТК РФ и НК РФ.",
    path: cat ? `/blog?cat=${cat}` : `/blog`,
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { cat } = await searchParams;
  const filtered = cat ? BLOG_POSTS.filter((p) => p.category === cat) : BLOG_POSTS;
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const currentPosts = filtered.slice(0, POSTS_PER_PAGE);
  const categoryLabel = cat ? CATEGORY_LABELS[cat] || cat : "Все материалы";
  const nextUrl = totalPages > 1 ? (cat ? `/blog/page/2?cat=${cat}` : `/blog/page/2`) : null;

  const breadcrumbs = [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
    { name: categoryLabel, path: cat ? `/blog?cat=${cat}` : `/blog` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:min-h-0 lg:h-full lg:overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:h-full">
        <JsonLd
          data={[
            breadcrumbJsonLd(breadcrumbs),
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `Блог о договорах: ${categoryLabel}`,
              description:
                "Статьи о договорах: аренда, ГПХ, расписки, доверенности, ДКП авто.",
              url: `${SITE_URL}${cat ? `/blog?cat=${cat}` : `/blog`}`,
              inLanguage: "ru",
            },
          ]}
        />
        <BlogList
          allPosts={BLOG_POSTS}
          currentPosts={currentPosts}
          currentPage={1}
          totalPages={totalPages}
          postsPerPage={POSTS_PER_PAGE}
          currentCategory={cat || "all"}
          labels={CATEGORY_LABELS}
          prevUrl={undefined}
          nextUrl={nextUrl}
        />
      </div>
    </div>
  );
}