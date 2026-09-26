"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Car,
  FileText,
  type LucideIcon,
  Globe,
  Home,
  Mail,
  PenLine,
  Scale,
  Search,
  Stamp,
  Users,
  Wallet,
} from "lucide-react";
import FormatBadges from "./FormatBadges";

export interface BlankItem {
  id: string;
  name: string;
  description: string;
  category: string;
  lastUpdated: string;
  /** Вид: договор или заявление (опционально — старые вызовы без kind). */
  kind?: "contract" | "statement";
}

export interface BlankCategory {
  id: string;
  label: string;
  count: number;
}

type SortKey = "popular" | "az" | "new";

const PAGE_SIZE = 20;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  realty: Home,
  business: Briefcase,
  auto: Car,
  finance: Wallet,
  family: Users,
  legal: Scale,
  migration: Globe,
  postal: Mail,
  other: FileText,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  realty: "from-teal-500 to-emerald-600",
  business: "from-violet-500 to-purple-600",
  auto: "from-cyan-500 to-sky-600",
  finance: "from-emerald-500 to-teal-600",
  family: "from-pink-500 to-rose-600",
  legal: "from-blue-600 to-indigo-700",
  migration: "from-amber-500 to-orange-600",
  postal: "from-sky-500 to-blue-600",
  other: "from-slate-500 to-slate-700",
};

const RU_MONTHS: Record<string, number> = {
  январь: 1,
  февраль: 2,
  март: 3,
  апрель: 4,
  май: 5,
  июнь: 6,
  июль: 7,
  август: 8,
  сентябрь: 9,
  октябрь: 10,
  ноябрь: 11,
  декабрь: 12,
};

/** «Май 2026» → число вида 202604, пригодное для сортировки «сначала новые». */
function recentKey(s: string): number {
  const m = /([а-яё]+)\s+(\d{4})/iu.exec(s);
  if (!m) return 0;
  const mon = RU_MONTHS[m[1].toLowerCase()] ?? 0;
  return Number(m[2]) * 100 + mon;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").trim();
}

/** Поиск с учётом словоформ: «аренда» находит «аренды», «аренду» и т.п. */
function matchQ(hay: string, q: string): boolean {
  if (hay.includes(q)) return true;
  const stem = q.replace(/[аеёиоуыэюяйьъ]+$/, "");
  return stem.length >= 3 && hay.includes(stem);
}

export default function BlanksBrowser({
  items,
  categories,
  popularIds,
  initialKind = "all",
}: {
  items: BlankItem[];
  categories: BlankCategory[];
  popularIds: readonly string[];
  /** Стартовый таб вида (для ?kind=statement — «Пустые бланки заявлений»). */
  initialKind?: "all" | "contract" | "statement";
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [activeKind, setActiveKind] = useState<"all" | "contract" | "statement">(initialKind);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);

  const q = norm(query);

  const filtered = useMemo(() => {
    const byKind = items.filter(
      (it) =>
        activeKind === "all" ||
        (it.kind ?? "contract") === activeKind
    );
    const byCat = byKind.filter(
      (it) => activeCat === "all" || it.category === activeCat
    );
    if (!q) return byCat;
    return byCat.filter((it) =>
      matchQ(norm(`${it.name} ${it.description} ${it.id}`), q)
    );
  }, [items, activeCat, activeKind, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "az") {
      arr.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } else if (sort === "new") {
      arr.sort(
        (a, b) =>
          recentKey(b.lastUpdated) - recentKey(a.lastUpdated) ||
          a.name.localeCompare(b.name, "ru")
      );
    } else {
      const rank = new Map(popularIds.map((id, i) => [id, i]));
      arr.sort(
        (a, b) =>
          (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return arr;
  }, [filtered, sort, popularIds]);

  // Категории пересчитываются под активный таб вида: счётчики —
  // только договоры/заявления соответственно, пустые скрываются.
  const visibleCategories = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          count: items.filter(
            (it) =>
              it.category === c.id &&
              (activeKind === "all" || (it.kind ?? "contract") === activeKind)
          ).length,
        }))
        .filter((c) => c.count > 0),
    [categories, items, activeKind]
  );

  const labelById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.label])),
    [categories]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, BlankItem[]>();
    for (const it of sorted) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return visibleCategories
      .filter((c) => map.has(c.id))
      .map((c) => ({ ...c, items: map.get(c.id) ?? [] }));
  }, [sorted, visibleCategories]);

  const showGrouped = activeCat === "all" && !q && sort === "popular";
  const totalFlatPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalFlatPages);
  const flatStart = (safePage - 1) * PAGE_SIZE;
  const flatPaged = sorted.slice(flatStart, flatStart + PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setActiveCat("all");
    setActiveKind("all");
    setSort("popular");
    setPage(1);
  };

  const changeCat = (c: string) => {
    setActiveCat(c);
    setPage(1);
  };

  const changeKind = (k: "all" | "contract" | "statement") => {
    setActiveKind(k);
    setActiveCat("all");
    setPage(1);
  };

  const kindCount = (k: "all" | "contract" | "statement") =>
    k === "all" ? items.length : items.filter((it) => (it.kind ?? "contract") === k).length;

  const total = visibleCategories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Найти бланк: договор аренды, расписка, заявление…"
          aria-label="Поиск пустого бланка"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Вид бланков">
        {(
          [
            { id: "all", label: "Все" },
            { id: "contract", label: "Договоры" },
            { id: "statement", label: "Пустые бланки заявлений" },
          ] as const
        ).map((k) => {
          const active = activeKind === k.id;
          return (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeKind(k.id)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              {k.label}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/25" : "bg-gray-100 text-gray-500"}`}>
                {kindCount(k.id)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={activeCat === "all"}
          onClick={() => changeCat("all")}
          label="Все бланки"
          count={total}
        />
        {visibleCategories.map((c) => (
          <FilterPill
            key={c.id}
            active={activeCat === c.id}
            onClick={() => changeCat(c.id)}
            label={c.label}
            count={c.count}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">
            {activeCat === "all" ? "Все бланки" : labelById.get(activeCat) ?? "Бланки"}
          </h2>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-600">
            {sorted.length.toLocaleString("ru-RU")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-gray-500 md:flex">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Сверено с законодательством РФ
          </span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(1);
              }}
              aria-label="Сортировка бланков"
              className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-gray-700 hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="popular">По популярности</option>
              <option value="az">По алфавиту (А—Я)</option>
              <option value="new">Сначала новые</option>
            </select>
            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-4 text-base font-semibold text-gray-700">Бланк не найден</p>
          <p className="mt-1 text-sm text-gray-500">
            Попробуйте другой запрос или выберите категорию «Все бланки».
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 cursor-pointer rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : showGrouped ? (
        byCategory.map((group) => (
          <section key={group.id} className="space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
              {group.label}
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600">
                {group.items.length}
              </span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.items.map((t) => (
                <BlankCard key={t.id} item={t} categoryLabel={labelById.get(t.category) ?? t.category} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <>
          <div
            className="grid gap-4 sm:grid-cols-2"
            aria-live="polite"
            aria-atomic="false"
          >
            {flatPaged.map((t) => (
              <BlankCard key={t.id} item={t} categoryLabel={labelById.get(t.category) ?? t.category} />
            ))}
          </div>
          {totalFlatPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 pt-4"
              aria-label="Пагинация бланков"
            >
              <PageBtn
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                label="Назад"
              />
              <span className="px-3 text-sm text-gray-600">
                {safePage} / {totalFlatPages}
              </span>
              <PageBtn
                disabled={safePage === totalFlatPages}
                onClick={() => setPage((p) => Math.min(totalFlatPages, p + 1))}
                label="Вперёд"
              />
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function PageBtn({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function BlankCard({ item, categoryLabel }: { item: BlankItem; categoryLabel: string }) {
  const accent = CATEGORY_GRADIENT[item.category] ?? "from-slate-500 to-slate-700";
  const Icon = CATEGORY_ICONS[item.category] ?? FileText;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
      <Link
        href={`/blanks/${item.id}`}
        className={`relative block h-40 overflow-hidden bg-gradient-to-br ${accent}`}
        aria-label={item.name}
      >
        <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute left-1/2 top-5 h-32 w-28 -translate-x-1/2 -rotate-2 rounded-[3px] border border-white/60 bg-white p-3 shadow-xl shadow-black/10 transition duration-500 group-hover:-translate-y-1">
          <div className={`h-1.5 w-[62%] rounded-full bg-gradient-to-r ${accent}`} />
          <div className="mt-3 space-y-1.5">
            <div className="h-[3px] w-full rounded-full bg-slate-200" />
            <div className="h-[3px] w-11/12 rounded-full bg-slate-200" />
            <div className="h-[3px] w-4/5 rounded-full bg-slate-200" />
            <div className="h-[3px] w-full rounded-full bg-slate-200" />
            <div className="h-[3px] w-10/12 rounded-full bg-slate-200" />
          </div>
          <Stamp className="absolute bottom-2.5 right-2.5 h-4 w-4 text-slate-200" />
        </div>
        <Icon className="absolute bottom-3 right-3 h-8 w-8 text-white/30" strokeWidth={1.5} />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-sm backdrop-blur">
          {categoryLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/blanks/${item.id}`}
          className="text-sm font-semibold leading-snug text-gray-900 transition hover:text-brand-600"
        >
          {item.name}
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
          {item.description}
        </p>
        <FormatBadges className="mt-3" />
        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <Link
            href={`/blanks/${item.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            <FileText className="h-3.5 w-3.5" />
            Скачать
          </Link>
          <Link
            href={`/builder?template=${item.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <PenLine className="h-3.5 w-3.5" />
            Заполнить
          </Link>
        </div>
      </div>
    </article>
  );
}