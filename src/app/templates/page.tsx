"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { Search, Star, ArrowRight, Grid3X3, List } from "lucide-react";

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

  useEffect(() => {
    setFavorites(loadFavorites());
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

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

  const sorted = [...LEGAL_TEMPLATES].sort((a, b) => {
    const fa = favorites.has(a.id) ? 0 : 1;
    const fb = favorites.has(b.id) ? 0 : 1;
    return fa - fb;
  });

  const filtered = sorted.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUseTemplate = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Каталог шаблонов</h1>
          <p className="text-gray-500 mt-1">
            {LEGAL_TEMPLATES.length} готовых шаблонов для создания документов
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск шаблонов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin [scrollbar-width:thin]">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const count =
              cat.id === "all"
                ? LEGAL_TEMPLATES.length
                : LEGAL_TEMPLATES.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
                }`}
              >
                {cat.label}
                <span
                  className={`px-1.5 py-0.5 text-[11px] rounded-full font-semibold ${
                    activeCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
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
            className={`p-2 rounded-md ${
              viewMode === "grid"
                ? "bg-brand-100 text-brand-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${
              viewMode === "list"
                ? "bg-brand-100 text-brand-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12 items-stretch">
          {filtered.map((t) => {
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
                  {t.fields.length > 30 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-amber-600">
                        Расширенный: {t.fields.length} полей
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
                    {t.name}
                    {["legal", "migration"].includes(t.category) && (
                      <span className="ml-2 align-middle text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                        проверьте у юриста
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2" title={t.description}>
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {t.actSource.split(",")[0]}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge}`}>
                      {catLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400" title="Обновлено">
                      {t.lastUpdated}
                    </span>
                    <span className="text-[10px] text-gray-400">{t.fields.length} полей</span>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(t.id)}
                    className="mt-auto pt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-600"
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
            {filtered.map((t) => {
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
                      {t.name}
                      {["legal", "migration"].includes(t.category) && (
                        <span className="ml-2 align-middle text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">
                          проверьте у юриста
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate" title={t.description}>
                      {t.description}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge}`}>
                    {catLabel}
                  </span>
                  <span className="text-xs text-gray-400">{t.fields.length} полей</span>
                  <span className="text-[10px] text-gray-400" title="Обновлено">
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

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 mb-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Ничего не найдено
          </h3>
          <p className="text-sm text-gray-500">
            Попробуйте изменить запрос или выбрать другую категорию
          </p>
        </div>
      )}
    </div>
  );
}
