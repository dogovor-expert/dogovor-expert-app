"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Scale,
  Search,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { BlogPost } from "@/data/blog/posts";
import { formatShortDate, postReadMinutes } from "@/lib/blog";
import { AdSlot } from "@/components/ads/AdSlot";
import BlogLiveCta from "@/components/blog/BlogLiveCta";

interface BlogListProps {
  posts: BlogPost[];
  labels: Record<string, string>;
  order?: string[];
  templatesCount: number;
}

const PAGE_SIZE = 10;

const CATEGORY_ICON: Record<string, LucideIcon> = {
  аренда: Home,
  авто: Car,
  бизнес: Briefcase,
  финансы: Wallet,
  право: Scale,
};

function norm(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е");
}

export default function BlogList({ posts, labels, order, templatesCount }: BlogListProps) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("cat");
    if (fromUrl && Object.prototype.hasOwnProperty.call(labels, fromUrl)) setCat(fromUrl);
  }, [labels]);

  useEffect(() => {
    setPage(1);
  }, [cat, query]);

  const cats = useMemo(() => {
    const ids = order && order.length > 0 ? order.filter((id) => labels[id]) : Object.keys(labels);
    return ids
      .map((id) => ({ id, label: labels[id] ?? id, count: posts.filter((p) => p.category === id).length }))
      .filter((c) => c.count > 0);
  }, [posts, labels, order]);

  const sorted = useMemo(() => [...posts].sort((a, b) => (a.date < b.date ? 1 : -1)), [posts]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return sorted.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q) return true;
      const hay = norm(`${p.title} ${p.description} ${p.sections.map((s) => s.h).join(" ")}`);
      return hay.includes(q);
    });
  }, [sorted, cat, query]);

  const isFlat = cat === "all" && !query.trim();
  const featured = isFlat ? sorted[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;

  const pages = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const pageItems = gridPosts.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const grid: ReactNode[] = [];
  pageItems.forEach((p, i) => {
    grid.push(<PostCard key={p.slug} post={p} labels={labels} />);
    if (i === 3 && pageItems.length > 4) {
      grid.push(
        <AdSlot
          key="ad-infeed"
          id="BLOG_INFEED"
          className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
        />
      );
    }
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-brand-600">Главная</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">Блог</span>
          </nav>

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
              Блог о договорах
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Как составить договор и не потерять деньги
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              Разборы юристов с нормами ГК РФ, ТК РФ и НК РФ: аренда, ГПХ и
              самозанятость, расписки, доверенности, ДКП авто.
            </p>
          </div>

          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти статью по названию или вопросу"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={cat === "all"} onClick={() => setCat("all")} label="Все статьи" />
            {cats.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.label} />
            ))}
          </div>

          {query.trim() === "" && gridPosts.length > 0 && (
            <p className="mt-3 text-xs text-gray-400">
              {cat === "all" ? "Все статьи" : labels[cat]} · {gridPosts.length}{" "}
              {plural(gridPosts.length, "статья", "статьи", "статей")}
            </p>
          )}

          {featured && (
            <FeaturedCard className="mt-5" post={featured} labels={labels} />
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">{grid}</div>

          {gridPosts.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-700">Ничего не найдено</p>
              <p className="mt-1 text-xs text-gray-500">
                Попробуйте изменить запрос или сбросить категорию.
              </p>
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5">
              <PagerButton disabled={cur === 1} onClick={() => setPage(cur - 1)} ariaLabel="Предыдущая страница">
                <ChevronLeft className="h-4 w-4" />
              </PagerButton>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === cur ? "page" : undefined}
                  className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                    n === cur
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <PagerButton disabled={cur === pages} onClick={() => setPage(cur + 1)} ariaLabel="Следующая страница">
                <ChevronRight className="h-4 w-4" />
              </PagerButton>
            </div>
          )}

          <BlogLiveCta templatesCount={templatesCount} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Свежие статьи</h3>
              <ol className="mt-4 space-y-3">
                {sorted.slice(0, 5).map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="group flex gap-3">
                      <span className="w-5 shrink-0 pt-px text-xs font-black text-gray-300 transition group-hover:text-brand-500">
                        {i + 1}
                      </span>
                      <span className="text-[13px] font-medium leading-snug text-gray-700 transition group-hover:text-brand-700 line-clamp-2">
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Категории</h3>
              <ul className="mt-3 space-y-0.5">
                {cats.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setCat(c.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition ${
                        cat === c.id
                          ? "bg-brand-50 font-semibold text-brand-700"
                          : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className="text-xs text-gray-400">{c.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <AdSlot
              id="BLOG_SIDEBAR"
              className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
        active
          ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
          : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );
}

function PagerButton({
  disabled,
  onClick,
  ariaLabel,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PostCard({ post, labels }: { post: BlogPost; labels: Record<string, string> }) {
  const Icon = CATEGORY_ICON[post.category] ?? FileText;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
          {labels[post.category] ?? post.category}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-bold leading-snug text-slate-900 transition group-hover:text-brand-700 line-clamp-2">
        {post.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500 line-clamp-3">{post.description}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
        <span>{formatShortDate(post.date)}</span>
        <span className="text-gray-300">·</span>
        <span>{postReadMinutes(post)} мин чтения</span>
      </div>
    </Link>
  );
}

function FeaturedCard({ post, labels, className }: { post: BlogPost; labels: Record<string, string>; className?: string }) {
  const Icon = CATEGORY_ICON[post.category] ?? FileText;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg lg:grid-cols-[1.05fr_0.95fr] ${className ?? ""}`}
    >
      <div className="relative min-h-[190px] overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-purple-600 p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-sm"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-purple-400/20 blur-md"
        />
        <div className="relative flex h-full flex-col justify-between">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Новое · обновлено недавно
          </span>
          <Icon className="h-12 w-12 text-white/30" aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col p-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          {labels[post.category] ?? post.category}
        </p>
        <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-900 transition group-hover:text-brand-700 sm:text-2xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500">{post.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatShortDate(post.date)}</span>
            <span className="text-gray-300">·</span>
            <span>{postReadMinutes(post)} мин чтения</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition group-hover:gap-2">
            Читать <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        </div>
      </Link>
  );
}