import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/data/blog/posts";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import BlogList from "@/components/blog/BlogList";
import { SITE_URL } from "@/lib/site";

const YEAR = new Date().getFullYear();
const POSTS_PER_PAGE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  аренда: "Аренда жилья",
  авто: "Автомобили",
  бизнес: "Бизнес и ГПХ",
  финансы: "Долги и расписки",
  право: "Право",
};

export function generateStaticParams() {
  const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
  const params = [];
  const maxPagesByCategory: Record<string, number> = {};
  for (const cat of categories) {
    const count = BLOG_POSTS.filter((p) => p.category === cat).length;
    maxPagesByCategory[cat] = Math.ceil(count / POSTS_PER_PAGE);
  }
  for (const cat of categories) {
    for (let page = 2; page <= maxPagesByCategory[cat]; page++) {
      params.push({ page: String(page), cat: cat });
    }
  }
  const allCount = BLOG_POSTS.length;
  const maxAllPages = Math.ceil(allCount / POSTS_PER_PAGE);
  for (let page = 2; page <= maxAllPages; page++) {
    params.push({ page: String(page), cat: undefined });
  }
  return params.map((p) => ({
    page: p.page,
    cat: p.cat,
  }));
}

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ cat?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { page: pageStr } = await params;
  const { cat } = await searchParams;
  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 2) return {};

  const categoryLabel = cat ? CATEGORY_LABELS[cat] || cat : "Все материалы";
  const title = `${categoryLabel} — страница ${page} | Блог dogovor.expert`;
  const description = `Страница ${page} блога: ${categoryLabel.toLowerCase()}. Инструкции по договорам с нормами закона.`;

  return {
    title,
    description,
    alternates: {
      canonical: cat ? `/blog/page/${page}?cat=${cat}` : `/blog/page/${page}`,
    },
    openGraph: {
      title,
      description,
      url: cat ? `/blog/page/${page}?cat=${cat}` : `/blog/page/${page}`,
      type: "website",
    },
  };
}

export default async function BlogPagePaginated({ params, searchParams }: PageProps) {
  const { page: pageStr } = await params;
  const { cat } = await searchParams;
  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 2) notFound();

  const filtered = cat ? BLOG_POSTS.filter((p) => p.category === cat) : BLOG_POSTS;
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  if (page > totalPages) notFound();

  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const paginatedPosts = filtered.slice(start, end);

  const categoryLabel = cat ? CATEGORY_LABELS[cat] || cat : "Все материалы";
  const prevUrl = page === 2
    ? (cat ? `/blog?cat=${cat}` : `/blog`)
    : (cat ? `/blog/page/${page - 1}?cat=${cat}` : `/blog/page/${page - 1}`);
  const nextUrl = page < totalPages
    ? (cat ? `/blog/page/${page + 1}?cat=${cat}` : `/blog/page/${page + 1}`)
    : null;

  const breadcrumbs = [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
    { name: `${categoryLabel} — стр. ${page}`, path: cat ? `/blog/page/${page}?cat=${cat}` : `/blog/page/${page}` },
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
              name: `Блог: ${categoryLabel} — страница ${page}`,
              description: `Страница ${page} блога: ${categoryLabel.toLowerCase()}.`,
              url: `${SITE_URL}${cat ? `/blog/page/${page}?cat=${cat}` : `/blog/page/${page}`}`,
              inLanguage: "ru",
            },
          ]}
        />
        <BlogList
          allPosts={BLOG_POSTS}
          currentPosts={paginatedPosts}
          currentPage={page}
          totalPages={totalPages}
          postsPerPage={POSTS_PER_PAGE}
          currentCategory={cat || "all"}
          labels={CATEGORY_LABELS}
          prevUrl={prevUrl}
          nextUrl={nextUrl}
        />
      </div>
    </div>
  );
}