import { Search, Star } from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Все", color: "brand" },
  { id: "auto", label: "Авто", color: "blue" },
  { id: "realty", label: "Недвижимость", color: "amber" },
  { id: "business", label: "Бизнес", color: "emerald" },
  { id: "finance", label: "Финансы", color: "green" },
  { id: "family", label: "Семейные", color: "pink" },
  { id: "legal", label: "Судебные", color: "purple" },
  { id: "migration", label: "Миграция", color: "gray" },
  { id: "postal", label: "Почта России", color: "gray" },
  { id: "other", label: "Прочее", color: "gray" },
] as const;

const HIGH_RISK_CATEGORIES = new Set(["legal", "migration"]);

const CATEGORY_COLORS: Record<string, { gradient: string; badge: string }> = {
  auto: { gradient: "from-blue-500 to-indigo-600", badge: "bg-blue-50 text-blue-700" },
  realty: { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700" },
  business: { gradient: "from-emerald-500 to-green-600", badge: "bg-emerald-50 text-emerald-700" },
  finance: { gradient: "from-green-500 to-emerald-600", badge: "bg-green-50 text-green-700" },
  family: { gradient: "from-pink-500 to-rose-600", badge: "bg-pink-50 text-pink-700" },
  legal: { gradient: "from-purple-500 to-violet-600", badge: "bg-purple-50 text-purple-700" },
  other: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
  migration: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
  postal: { gradient: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
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

interface TemplateSelectorProps {
  templateCategory: string;
  onCategoryChange: (id: string) => void;
  templateSearch: string;
  onSearchChange: (q: string) => void;
  selectedTemplateId: string;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectTemplate: (id: string) => void;
}

export default function TemplateSelector({
  templateCategory,
  onCategoryChange,
  templateSearch,
  onSearchChange,
  selectedTemplateId,
  favorites,
  onToggleFavorite,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const filteredTemplates = LEGAL_TEMPLATES.filter((t) => {
    const matchCategory = templateCategory === "all" || t.category === templateCategory;
    const matchSearch = templateSearch === "" ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    const fa = favorites.has(a.id) ? 0 : 1;
    const fb = favorites.has(b.id) ? 0 : 1;
    return fa - fb;
  });

  return (
    <div className="mb-6">
      {/* Step 1: Category Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
        <h2 className="text-sm font-semibold text-gray-900">Выберите категорию документа</h2>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin [scrollbar-width:thin]">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const count = cat.id === "all"
            ? LEGAL_TEMPLATES.length
            : LEGAL_TEMPLATES.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                templateCategory === cat.id
                  ? "bg-brand-50 text-brand-700 border-brand-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
              }`}
            >
              {cat.label}
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                templateCategory === cat.id ? "bg-brand-200 text-brand-800" : "bg-gray-100 text-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step 2: Template Grid */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
        <h2 className="text-sm font-semibold text-gray-900">Выберите шаблон документа</h2>
        <span className="text-xs text-gray-400">— {filteredTemplates.length} готовых шаблонов</span>
        {favorites.size > 0 && (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {favorites.size} в избранном, показаны первыми
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Найти шаблон... например, ДКП, аренда, доверенность"
          value={templateSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </div>

      {/* Template Cards — compact chips */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin [scrollbar-width:thin]">
        {filteredTemplates.map((t) => {
          const colors = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;
          const isSelected = selectedTemplateId === t.id;
          return (
            <button
              key={t.id}
              title={`${t.name}${HIGH_RISK_CATEGORIES.has(t.category) ? " — проверьте у юриста" : ""}${t.description ? `\n${t.description}` : ""}`}
              onClick={() => onSelectTemplate(t.id)}
              className={`relative flex flex-col items-center justify-center gap-2 w-[160px] px-3 py-4 rounded-xl border-2 transition-all flex-shrink-0 ${
                isSelected
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm"
              }`}
            >
              <span className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-base flex-shrink-0`}>
                {CATEGORY_ICONS[t.category] || "📄"}
              </span>
              <span className={`text-xs font-medium text-center leading-snug line-clamp-2 min-h-[2em] ${isSelected ? "text-brand-700" : "text-gray-600"}`}>
                {t.name}
              </span>
              {HIGH_RISK_CATEGORIES.has(t.category) && (
                <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded px-1 py-0.5 flex-shrink-0">
                  проверьте у юриста
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(t.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(t.id);
                  }
                }}
                className={`absolute top-1.5 right-1.5 p-0.5 rounded transition-colors cursor-pointer ${
                  favorites.has(t.id) ? "text-amber-400" : "text-gray-300 hover:text-amber-400"
                }`}
                title={favorites.has(t.id) ? "Убрать из избранного" : "В избранное"}
              >
                <Star className={`w-3.5 h-3.5 ${favorites.has(t.id) ? "fill-amber-400" : ""}`} />
              </span>
            </button>
          );
        })}
        <a
          href="/templates"
          className="flex flex-col items-center justify-center gap-2 w-[160px] px-3 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-300 hover:text-brand-600 whitespace-nowrap flex-shrink-0"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-xs font-medium">Выбрать из каталога</span>
        </a>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Ничего не найдено</h3>
          <p className="text-sm text-gray-500">Попробуйте изменить запрос или выбрать другую категорию</p>
        </div>
      )}
    </div>
  );
}
