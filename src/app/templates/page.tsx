"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { Search, Star, ArrowRight, Grid3X3, List, X } from "lucide-react";
import Highlight from "@/components/ui/Highlight";
import { scoreText, tokenGroups, textMatchesTokens } from "@/lib/search";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Все" },
  { id: "auto", label: "Авто" },
  { id: "realty", label: "Недвижимость" },
  { id: "business", label: "Бизнес" },
  { id: "finance", label: "Финансы" },
  { id: "family", label: "Семейные" },
  { id: "legal", label: "Судебные" },
  { id: "migration", label: "Миграция" },
  { id: "postal", label: "Почта России" },
  { id: "other", label: "Прочее" },
];

const CATEGORY_COLORS: Record<string, string> = {
  auto: "from-blue-500 to-indigo-600",
  realty: "from-amber-500 to-orange-600",
  business: "from-emerald-500 to-green-600",
  finance: "from-green-500 to-emerald-600",
  family: "from-pink-500 to-rose-600",
  legal: "from-purple-500 to-violet-600",
  other: "from-gray-500 to-slate-600",
  migration: "from-gray-500 to-slate-600",
  postal: "from-gray-500 to-slate-600",
};

const CATEGORY_ICONS: Record<string, string> = {
  auto: "🚗",
  realty: "🏠",
  business: "💼",
  finance: "💰",
  family: "❤️",
  legal: "⚖️",
  other: "📄",
  migration: "📄",
  postal: "📄",
};

const CATEGORY_BADGE: Record<string, string> = {
  auto: "bg-blue-50 text-blue-700",
  realty: "bg-amber-50 text-amber-700",
  business: "bg-emerald-50 text-emerald-700",
  finance: "bg-green-50 text-green-700",
  family: "bg-pink-50 text-pink-700",
  legal: "bg-purple-50 text-purple-700",
  other: "bg-gray-100 text-gray-600",
  migration: "bg-gray-100 text-gray-600",
  postal: "bg-gray-100 text-gray-600",
};

const FAVORITES_KEY = "dogovor_favorites";

// P0.1: каталог пагинируется — при SSR рендерится только первый экран
// (первые 24 карточки), остальные шаблоны подгружаются кнопкой «Показать ещё».
// Это сокращает HTML-ответ /templates с ~1.1 MB до нескольких сотен КБ,
// не ломая SEO (первые 24 карточки видны поисковикам) и поиск (работает по всем).
const INITIAL_VISIBLE = 24;
const PAGE_SIZE = 24;

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function TemplatesPage() {
  return <TemplatesContent />;
}

function TemplatesContent() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // Сколько карточек показано. При SSR (пустой поиск, категория «все») — только
  // первый экран для SEO + быстрый LCP; остальное — по кнопке «Показать ещё».
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // Фильтр/поиск показываем целиком (не пагинируем результат поиска),
  // чтобы интерактив не усложнялся; начальный HTML при этом мал, т.к.
  // в SSR поиск/категория пустые, а visibleCount = INITIAL_VISIBLE.
  useEffect(() => {
    if (search.trim() || activeCategory !== "all") {
      setVisibleCount(Number.POSITIVE_INFINITY);
    } else {
      setVisibleCount(INITIAL_VISIBLE);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    setFavorites(loadFavorites());
    // №10 аудита: состояние каталога восстанавливается из URL (q/cat/view).
    const params = new URLSearchParams(window.location.search);
    // Алиас ?category= → ?cat= (SEO: Google мог проиндексировать ?category=)
    const categoryAlias = params.get("category");
    if (categoryAlias) {
      params.delete("category");
      params.set("cat", categoryAlias);
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `?${qs}` : window.location.pathname,
      );
    }
    const q = params.get("q");
    if (q) setSearch(q);
    const cat = params.get("cat");
    if (cat) setActiveCategory(cat);
    const view = params.get("view");
    if (view === "list" || view === "grid") setViewMode(view);
  }, []);

  useEffect(() => {
    // №10 аудита: поиск/категория/вид синхронизируются в URL — ссылка
    // «шаблоны недвижимости списком» открывает то же состояние.
    const params = new URLSearchParams(window.location.search);
    if (search.trim()) params.set("q", search.trim());
    else params.delete("q");
    if (activeCategory !== "all") params.set("cat", activeCategory);
    else params.delete("cat");
    if (viewMode !== "grid") params.set("view", viewMode);
    else params.delete("view");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [search, activeCategory, viewMode]);

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const sorted = [...TEMPLATE_META].sort((a, b) => {
    const fa = favorites.has(a.id) ? 0 : 1;
    const fb = favorites.has(b.id) ? 0 : 1;
    return fa - fb;
  });

  const filtered = useMemo(() => {
    const tokens = tokenGroups(search);
    const results = sorted
      .filter((t) => activeCategory === "all" || t.category === activeCategory)
      .filter((t) => {
        if (tokens.length === 0) return true;
        const searchable =
          `${t.name} ${t.description} ${(t.suggestedDocs || []).join(" ")} ${t.actSource}`;
        return textMatchesTokens(searchable, tokens);
      })
      .map((t) => ({
        t,
        score: tokens.length === 0
          ? 0
          : Math.max(scoreText(t.name, tokens, 0), scoreText(t.description, tokens, 20)),
      }));
    if (tokens.length > 0) {
      results.sort((a, b) => b.score - a.score);
    }
    return results;
  }, [sorted, search, activeCategory]);

  const hasActiveSearch = search.trim() !== "";

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || filtered.length > 0) return;
    try {
      const raw = localStorage.getItem("dogovor_zero_queries");
      const list = raw ? JSON.parse(raw) : [];
      if (list.length === 0 || list[list.length - 1].q !== q) {
        list.push({ q, ts: Date.now() });
        localStorage.setItem("dogovor_zero_queries", JSON.stringify(list.slice(-50)));
      }
    } catch {
      // ignore
    }
  }, [search, filtered.length]);

  const clearSearch = () => {
    setSearch("");
    router.replace("/templates", { scroll: false });
  };

  const handleUseTemplate = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Каталог шаблонов</h1>
          {hasActiveSearch ? (
            <p className="text-sm text-gray-600 mt-1">
              Найдено: {filtered.length}
            </p>
          ) : (
            <p className="text-gray-600 mt-1">
              {TEMPLATE_META.length} готовых шаблонов для создания документов
            </p>
          )}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Поиск шаблонов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {hasActiveSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-600 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Очистить поиск"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin [scrollbar-width:thin]">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const count =
              cat.id === "all"
                ? TEMPLATE_META.length
                : TEMPLATE_META.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
                }`}
              >
                {cat.label}
                <span
                  className={`px-1.5 py-0.5 text-[11px] rounded-full font-semibold ${
                    activeCategory === cat.id
                      ? "bg-white text-brand-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Вид: сетка"
            className={`p-2 rounded-md ${
              viewMode === "grid"
                ? "bg-brand-100 text-brand-700"
                : "text-gray-600 hover:text-gray-600"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            aria-label="Вид: список"
            className={`p-2 rounded-md ${
              viewMode === "list"
                ? "bg-brand-100 text-brand-700"
                : "text-gray-600 hover:text-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12 items-stretch">
          {filtered.slice(0, visibleCount).map(({ t }) => {
            const gradient = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;
            const icon = CATEGORY_ICONS[t.category] || "📄";
            const badge = CATEGORY_BADGE[t.category] || "bg-gray-100 text-gray-600";
            const catLabel =
              TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.label ||
              t.category;
            return (
              <div
                key={t.id}
                title={`${t.name} — ${t.description}`}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col min-h-[320px]"
              >
                <div className={`h-2 bg-gradient-to-r ${gradient} shrink-0`} />
                <div className="p-5 flex flex-col flex-1">
                  {t.fieldCount > 30 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-amber-700">
                        Расширенный: {t.fieldCount} полей
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(t.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
                      favorites.has(t.id)
                        ? "text-amber-400 hover:bg-amber-50"
                        : "text-gray-300 hover:text-amber-400 hover:bg-gray-50"
                    }`}
                    title={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
                    aria-label={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(t.id) ? "fill-amber-400" : ""}`} />
                  </button>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0`}
                  >
                    <span className="text-2xl">{icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug" title={t.name}>
                    <Link href={`/documents/${t.id}`} className="hover:text-brand-600 transition-colors">
                      <Highlight text={t.name} query={search} />
                    </Link>
                    {["legal", "migration"].includes(t.category) && (
                      <span className="ml-2 align-middle text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                        проверьте у юриста
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2" title={t.description}>
                    <Highlight text={t.description} query={search} />
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-600" title={t.actSource}>
                      {t.actSource}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge}`}>
                      {catLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-600" title="Обновлено">
                      {t.lastUpdated}
                    </span>
                    <span className="text-[10px] text-gray-600">{t.fieldCount} полей</span>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(t.id)}
                    className="mt-auto pt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 transition-all hover:bg-brand-600"
                  >
                    Использовать <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-12">
          <div className="divide-y divide-gray-100">
            {filtered.slice(0, visibleCount).map(({ t }) => {
              const gradient = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;
              const icon = CATEGORY_ICONS[t.category] || "📄";
              const badge = CATEGORY_BADGE[t.category] || "bg-gray-100 text-gray-600";
              const catLabel =
                TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.label ||
                t.category;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900" title={t.name}>
                      <Link href={`/documents/${t.id}`} className="hover:text-brand-600 transition-colors">
                        <Highlight text={t.name} query={search} />
                      </Link>
                      {["legal", "migration"].includes(t.category) && (
                        <span className="ml-2 align-middle text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">
                          проверьте у юриста
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 truncate" title={t.description}>
                      <Highlight text={t.description} query={search} />
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge}`}>
                    {catLabel}
                  </span>
                  <span className="text-xs text-gray-600">{t.fieldCount} полей</span>
                  <span className="text-[10px] text-gray-600" title="Обновлено">
                    {t.lastUpdated}
                  </span>
                  <button
                    onClick={() => toggleFavorite(t.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      favorites.has(t.id)
                        ? "text-amber-400"
                        : "text-gray-300 hover:text-amber-400"
                    }`}
                    title={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
                    aria-label={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(t.id) ? "fill-amber-400" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(t.id)}
                    className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    Использовать
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Number.isFinite(visibleCount) &&
        visibleCount < filtered.length && (
          <div className="text-center pb-14">
            <button
              onClick={() =>
                setVisibleCount((n) =>
                  Math.min(n + PAGE_SIZE, filtered.length)
                )
              }
              className="px-6 py-3 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors"
            >
              Показать ещё ({filtered.length - visibleCount})
            </button>
          </div>
        )}

      {filtered.length === 0 && (
        <section className="text-center py-14 bg-white rounded-2xl border border-gray-200 mb-12 px-6">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {hasActiveSearch ? `Ничего не найдено по запросу «${search.trim()}»` : "Нет шаблонов в категории"}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {hasActiveSearch
              ? "Попробуйте другие слова или сбросьте фильтры"
              : "Выберите другую категорию"}
          </p>
          {hasActiveSearch && (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="text-xs text-gray-600">Популярные запросы:</span>
                {["купли-продажи", "аренда", "доверенность", "расписка", "займ"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearch(s)}
                    className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" /> Сбросить поиск
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
