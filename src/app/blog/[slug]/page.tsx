import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText, Minus, Plus, RefreshCcw } from "lucide-react";
import type { ReactNode } from "react";
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "@/data/blog/posts";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { truncateWord } from "@/lib/seo/docMeta";
import { SITE_URL } from "@/lib/site";
import { CATEGORY_LABELS, formatLongDate, postReadMinutes, postWordCount } from "@/lib/blog";
import { ArticleProgress } from "@/components/blog/ArticleProgress";
import { BlogToc } from "@/components/blog/BlogToc";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 3600;
export const dynamicParams = false;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

const INTRO_RE = /^коротко[:,\s]*/i;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getBlogPost(slug);
    if (!post) return {};
    return withSeo({
      title: post.metaTitle,
      description: truncateWord(
        (post.description || post.metaTitle || "Статьи о договорах и законе").trim(),
        155
      ),
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

  const introIdx = post.sections.findIndex((s) => INTRO_RE.test(s.h));

  // Собираем статьи в уплощённый поток узлов; заголовок «Коротко: …» уходит в callout.
  const toc = post.sections
    .map((s, i) => ({ id: `sec-${i}`, title: s.h, skip: i === introIdx }))
    .filter((s) => !s.skip)
    .map((s) => ({ id: s.id, label: s.title }));

  const nodes: ReactNode[] = [];
  let pCount = 0;
  let adPlaced = false;
  const pushP = (key: string, text: string, dropCap: boolean) => {
    nodes.push(
      <p
        key={key}
        className={
          dropCap
            ? "mt-4 text-base leading-[1.75] text-slate-700 first-letter:float-left first-letter:mr-2.5 first-letter:mt-0.5 first-letter:text-[42px] first-letter:leading-[0.85] first-letter:font-extrabold first-letter:text-brand-600"
            : "mt-4 text-base leading-[1.75] text-slate-700"
        }
      >
        {text}
      </p>
    );
  };

  if (introIdx !== -1) {
    const introParas = post.sections[introIdx].p;
    if (introParas.length > 0) {
      nodes.push(
        <div key="intro" className="mt-6 rounded-r-xl border-l-[3px] border-brand-500 bg-brand-50 px-5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Коротко</span>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{introParas[0]}</p>
        </div>
      );
      pCount += 1;
    }
    for (let k = 1; k < introParas.length; k += 1) {
      pushP(`intro-${k}`, introParas[k], false);
      pCount += 1;
      if (pCount === 4 && !adPlaced) {
        nodes.push(<ArticleInlineAd key="ad-inline" />);
        adPlaced = true;
      }
    }
  }

  post.sections.forEach((sec, i) => {
    if (i === introIdx) return;
    nodes.push(
      <h2 key={`h-${i}`} id={`sec-${i}`} className="mt-9 scroll-mt-24 text-[21px] font-extrabold tracking-tight text-slate-900">
        {sec.h.replace(INTRO_RE, "")}
      </h2>
    );
    sec.p.forEach((text, j) => {
      const dropCap = introIdx === -1 && i === 0 && j === 0;
      pushP(`p-${i}-${j}`, text, dropCap);
      pCount += 1;
      if (pCount === 4 && !adPlaced) {
        nodes.push(<ArticleInlineAd key="ad-inline" />);
        adPlaced = true;
      }
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <ArticleProgress />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Блог", path: "/blog" },
              { name: post.title, path: url },
            ]),
            ...(post.faq.length > 0 ? [faqJsonLd(post.faq)] : []),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updatedAt,
              wordCount: postWordCount(post),
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

        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-600">Главная</Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <Link href="/blog" className="hover:text-brand-600">Блог</Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-700">{post.title}</span>
        </nav>

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">
          <article className="max-w-[720px]">
            <header>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {post.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{post.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-[13px] font-black text-white">
                  ЮР
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">
                    Юридическая редакция Dogovor.expert
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatLongDate(post.date)}
                    {post.updatedAt !== post.date && (
                      <span className="inline-flex items-center gap-1">
                        <span className="mx-1.5 text-gray-300">·</span>
                        <RefreshCcw className="inline h-3 w-3" />
                        обновлено {formatLongDate(post.updatedAt)}
                      </span>
                    )}
                    <span className="mx-1.5 text-gray-300">·</span>
                    {postReadMinutes(post)} мин чтения
                  </p>
                </div>
              </div>
            </header>

            <div className="mt-8">{nodes}</div>

            {post.faq.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-extrabold text-slate-900">Частые вопросы</h2>
                <div className="mt-4 space-y-2.5">
                  {post.faq.map((f) => (
                    <details
                      key={f.q}
                      className="group rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-slate-900">
                        {f.q}
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-gray-400">
                          <Plus className="absolute h-4 w-4 transition group-open:rotate-90 group-open:opacity-0" />
                          <Minus className="absolute h-4 w-4 opacity-0 transition group-open:rotate-180 group-open:opacity-100" />
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {relatedDocs.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-extrabold text-slate-900">Составьте документ по статье</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {relatedDocs.map((r) => (
                    <Link
                      key={r.id}
                      href={`/documents/${r.id}`}
                      className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 transition group-hover:text-brand-700">
                        <FileText className="h-4 w-4 shrink-0 text-brand-500" />
                        {r.name}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {r.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-extrabold text-slate-900">Читайте также</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
                    >
                      <p className="text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-brand-700 line-clamp-2">
                        {r.title}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {r.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-9 text-center shadow-xl shadow-brand-600/20">
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                Нужен готовый документ?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-50">
                Заполните шаблон онлайн за 5 минут — документ сформируется автоматически,
                бесплатно и без регистрации.
              </p>
              <Link
                href="/templates"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition hover:bg-brand-50"
              >
                Открыть каталог шаблонов
                <ChevronRight className="h-4 w-4" />
              </Link>
            </section>
          </article>

          <BlogToc items={toc} className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

function ArticleInlineAd() {
  return (
    <AdSlot
      id="ARTICLE_INLINE"
      className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
    />
  );
}