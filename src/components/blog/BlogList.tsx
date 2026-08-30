import Link from "next/link";
import { Home, Car, Briefcase, Wallet, Scale, ChevronRight, FileText, ChevronLeft } from "lucide-react";
import type { BlogPost } from "@/data/blog/posts";

const ICONS: Record<string, typeof Home> = {
  аренда: Home,
  авто: Car,
  бизнес: Briefcase,
  финансы: Wallet,
  право: Scale,
};

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const fmt = (d: string) => {
  const [y, m, day] = d.split("-");
  return `${+day} ${MONTHS[+m - 1]}`;
};
const read = (d: string) => Math.max(3, Math.round(d.length / 150) + 3) + " мин";

interface BlogListProps {
  allPosts: BlogPost[];
  currentPosts: BlogPost[];
  currentPage: number;
  totalPages: number;
  postsPerPage: number;
  currentCategory: string;
  labels: Record<string, string>;
  prevUrl?: string;
  nextUrl?: string | null;
}

export default function BlogList({
  allPosts,
  currentPosts,
  currentPage,
  totalPages,
  postsPerPage,
  currentCategory,
  labels,
  prevUrl,
  nextUrl,
}: BlogListProps) {
  const cats = Array.from(new Set(allPosts.map((p) => p.category)));
  const Icon = (c: string) => ICONS[c] || Home;

  const buildCatUrl = (cat: string) =>
    cat === "all" ? "/blog" : `/blog?cat=${cat}`;

  const buildPageUrl = (page: number, cat: string) => {
    if (page <= 1) return buildCatUrl(cat);
    return cat === "all" ? `/blog/page/${page}` : `/blog/page/${page}?cat=${cat}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-7 lg:h-full lg:overflow-hidden">
      {/* Левая панель: статьи (независимая прокрутка) */}
      <div className="lg:h-full lg:overflow-y-auto lg:pr-1 lg:min-h-0 lg:scrollbar-hide">
        <nav className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap mb-6">
          <Link href="/" className="hover:text-brand-600">Главная</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Блог</span>
        </nav>

        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600 mb-2">
            Блог о договорах
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Как составить договор и не потерять деньги
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
            Инструкции по аренде, ГПХ, распискам, доверенностям и сделкам с авто — простым языком и со
            ссылками на нормы ГК РФ, ТК РФ и НК РФ.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={buildCatUrl("all")}
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition ${
              currentCategory === "all"
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-slate-600 border-slate-200 hover:text-brand-700 hover:border-brand-200"
            }`}
          >
            Все материалы
          </Link>
          {cats.map((c) => (
            <Link
              key={c}
              href={buildCatUrl(c)}
              className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition ${
                currentCategory === c
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-600 border-slate-200 hover:text-brand-700 hover:border-brand-200"
              }`}
            >
              {labels[c] || c}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {currentPosts.map((p) => {
            const C = Icon(p.category);
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_8px_24px_rgba(29,78,216,0.10)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1">
                    {labels[p.category] || p.category}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                    <C className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-brand-700 transition-colors">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">{p.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <span>{fmt(p.date)}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{read(p.description)} чтения</span>
                </div>
              </Link>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Пагинация">
            {prevUrl && (
              <Link
                href={prevUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </Link>
            )}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (totalPages <= 7) {
                  return (
                    <Link
                      key={p}
                      href={buildPageUrl(p, currentCategory)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-xl transition ${
                        p === currentPage
                          ? "bg-brand-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </Link>
                  );
                }
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <Link
                      key={p}
                      href={buildPageUrl(p, currentCategory)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-xl transition ${
                        p === currentPage
                          ? "bg-brand-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </Link>
                  );
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                  return <span key={p} className="w-10 h-10 flex items-center justify-center text-slate-400">…</span>;
                }
                return null;
              })}
            </div>
            {nextUrl && (
              <Link
                href={nextUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition"
              >
                Вперёд
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </nav>
        )}

        <section className="mt-12 bg-brand-600 rounded-3xl px-6 py-9 text-center">
          <h2 className="text-2xl font-bold text-white">Нужен сам договор, а не статья?</h2>
          <p className="mt-2 text-sm text-brand-100 max-w-xl mx-auto">
            В каталоге — более 350 шаблонов документов: заполните онлайн за 5 минут и скачайте PDF или DOCX.
          </p>
          <Link
            href="/templates"
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Перейти к шаблонам
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      {/* Правая панель: рейл (независимая прокрутка) */}
      <aside className="hidden lg:block lg:h-full lg:overflow-y-auto lg:pl-1 lg:min-h-0 lg:scrollbar-hide">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">Популярное</h4>
          {allPosts.slice(0, 5).map((p, i) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="flex gap-3 py-2.5 border-b border-slate-100 last:border-0 group"
            >
              <span className="text-lg font-extrabold text-brand-600 min-w-[22px]">{i + 1}</span>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 leading-snug">
                {p.title}
              </span>
            </Link>
          ))}

          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-1 mt-5">Категории</h4>
          {cats.map((c) => (
            <Link
              key={c}
              href={buildCatUrl(c)}
              className="w-full flex items-center justify-between py-2 border-b border-slate-100 last:border-0 group text-left"
            >
              <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">{labels[c] || c}</span>
              <span className="text-xs text-slate-600">{allPosts.filter((p) => p.category === c).length}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}