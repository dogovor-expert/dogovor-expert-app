import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CalendarDays, FileText, Sparkles } from "lucide-react";
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "@/data/blog/posts";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = false;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getBlogPost(slug);
    if (!post) return {};
    return withSeo({
      title: post.metaTitle,
      description: (post.description || post.metaTitle || "Статьи о договорах и законе").slice(0, 155),
      path: `/blog/${post.slug}`,
      ogType: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
    });
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = `/blog/${post.slug}`;
  const related = getRelatedPosts(post.slug);
  const relatedDocs = (post.relatedDocs || [])
    .map((id) => LEGAL_TEMPLATES.find((t) => t.id === id))
    .filter((t): t is LegalTemplate => Boolean(t))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Блог", path: "/blog" },
            { name: post.title, path: url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updatedAt,
            inLanguage: "ru",
            mainEntityOfPage: `${SITE_URL}${url}`,
            author: {
              "@type": "Organization",
              name: "Dogovor.expert",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "Dogovor.expert",
              url: SITE_URL,
            },
          },
        ]}
      />

      <nav className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-brand-600">Блог</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600">{post.title}</span>
      </nav>

      <header>
        <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-2">
          <CalendarDays className="w-3.5 h-3.5" />
          {post.date}
          {post.updatedAt !== post.date && (
            <span className="text-gray-300">· обновлено {post.updatedAt}</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {post.description}
        </p>
      </header>

      <article className="space-y-8">
        {post.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{s.h}</h2>
            <div className="space-y-3">
              {s.p.map((p, j) => (
                <p key={j} className="text-sm text-gray-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      {relatedDocs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Составьте документ по статье
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedDocs.map((r) => (
              <Link
                key={r.id}
                href={`/documents/${r.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
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
          {post.faq.map((f) => (
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

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Читайте также</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group block bg-white border border-gray-200 rounded-xl px-4 py-4 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 leading-snug">
                  {r.title}
                </p>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                  {r.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-indigo-600 rounded-2xl px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white">
          Нужен готовый документ?
        </h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Заполните шаблон онлайн за 5 минут — документ сформируется автоматически,
          бесплатно и без регистрации.
        </p>
        <Link
          href="/templates"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Открыть каталог шаблонов
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}