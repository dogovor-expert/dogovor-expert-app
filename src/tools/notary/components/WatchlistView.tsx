import { useMemo, useState } from "react";
import type { WatchedPage } from "../lib/types";
import { formatCount, formatRelative, shortenHash } from "../lib/format";
import { AlertOctagon, ArrowRight, Bell, Filter, GitCompareArrows, Search, ShieldCheck } from "lucide-react";

interface WatchlistViewProps {
  pages: WatchedPage[];
  onOpenPage: (pageId: string) => void;
  onOpenDiff: (pageId: string) => void;
}

const categoryFilters = [
  "Все",
  "Маркетплейс",
  "Банк",
  "SaaS",
  "Сервис доставки",
  "Каршеринг",
  "Оператор связи",
] as const;

type CategoryFilter = (typeof categoryFilters)[number];

export const WatchlistView = ({ pages, onOpenPage, onOpenDiff }: WatchlistViewProps) => {
  const [category, setCategory] = useState<CategoryFilter>("Все");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return pages.filter((page) => {
      if (category !== "Все" && page.category !== category) return false;
      if (!lowered) return true;
      return (
        page.service.toLowerCase().includes(lowered) ||
        page.documentTitle.toLowerCase().includes(lowered) ||
        page.url.toLowerCase().includes(lowered)
      );
    });
  }, [pages, category, query]);

  return (
    <section className="paper-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-line-soft)] pb-5">
        <div>
          <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Ваш архив
          </div>
          <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-[22px]">
            Отслеживаемые страницы
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
            Оферты, тарифы и правила, за которыми Chronoleaf присматривает. Каждый пересохранённый слепок остаётся у вас: сравнивайте, скачивайте и предъявляйте как доказательство.
          </p>
        </div>
        <div className="chip chip--gold">
          <Bell size={12} strokeWidth={1.9} />
          Тихая проверка каждые 6 часов
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-3 py-2">
          <Search size={15} strokeWidth={1.7} className="text-[color:var(--color-ink-mute)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти сервис, документ или URL"
            className="w-full bg-transparent text-[13px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-mute)]"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="mono flex items-center gap-1 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
            <Filter size={11} strokeWidth={1.9} /> Категория
          </span>
          <div className="flex items-center gap-1">
            {categoryFilters.map((item) => {
              const active = item === category;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-[8px] border px-2.5 py-1.5 text-[11.5px] transition ${
                    active
                      ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                      : "border-[color:var(--color-line)] bg-[color:var(--color-paper)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/25"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((page) => {
          const latest = page.snapshots[0];
          const previous = page.snapshots[1];
          const risks = latest.risks.length;
          return (
            <article
              key={page.id}
              className="flex flex-col gap-3 rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4 transition hover:border-[color:var(--color-ink)]/25 hover:shadow-[0_16px_38px_-24px_rgba(27,36,56,0.35)]"
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-[10px] text-[14px] font-semibold text-white"
                  style={{ background: page.color }}
                  aria-hidden
                >
                  {page.favicon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                    {page.category}
                  </div>
                  <div className="truncate text-[14px] font-semibold text-[color:var(--color-ink)]">
                    {page.service}
                  </div>
                  <div className="mono truncate text-[11px] text-[color:var(--color-ink-mute)]">
                    {page.url}
                  </div>
                </div>
                {risks > 0 ? (
                  <span className="chip chip--critical">
                    <AlertOctagon size={11} strokeWidth={1.9} /> {risks}
                  </span>
                ) : (
                  <span className="chip chip--safe">
                    <ShieldCheck size={11} strokeWidth={1.9} /> ок
                  </span>
                )}
              </div>

              <div className="rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] p-3">
                <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  {page.documentTitle}
                </div>
                <div className="mt-1 text-[13px] leading-snug text-[color:var(--color-ink-soft)]">
                  {latest.summary}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--color-ink-mute)]">
                  <span>{page.snapshots.length} слепков</span>
                  <span>·</span>
                  <span>Последний {formatRelative(latest.capturedAt)}</span>
                  <span className="mono ml-auto rounded-[6px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-2 py-[2px] text-[10.5px] uppercase tracking-[0.16em]">
                    SHA {shortenHash(latest.hash, 5, 4)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
                  <Bell size={11} strokeWidth={1.9} />
                  {formatCount(page.followers)} наблюдателей
                </div>
                <div className="flex items-center gap-1.5">
                  {previous && (
                    <button
                      type="button"
                      onClick={() => onOpenDiff(page.id)}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/30"
                    >
                      <GitCompareArrows size={12} strokeWidth={1.9} />
                      Diff
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenPage(page.id)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[color:var(--color-ink)] px-2.5 py-1.5 text-[11.5px] text-[color:var(--color-paper)] hover:bg-[color:var(--color-ink)]/90"
                  >
                    Открыть
                    <ArrowRight size={12} strokeWidth={1.9} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-[12px] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-paper)] px-6 py-8 text-center text-[13px] text-[color:var(--color-ink-mute)]">
          Ничего не нашлось. Попробуйте изменить фильтры или строку поиска.
        </div>
      )}
    </section>
  );
};
