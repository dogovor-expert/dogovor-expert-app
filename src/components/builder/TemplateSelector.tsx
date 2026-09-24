import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Star,
  Eye,
  Fire,
  ClockCounterClockwise,
  Sparkle,
  SquaresFour,
  ChatsCircle,
  X,
} from "@phosphor-icons/react";
import { categoryIcon } from "@/components/categoryIcons";
import { TEMPLATE_META, type TemplateMeta } from "@/data/templatesMeta";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import { parseLastUpdated } from "@/lib/dates";
import Highlight from "@/components/ui/Highlight";
import { tokenGroups, scoreText, textMatchesTokens } from "@/lib/search";
import { getAllDrafts } from "@/lib/autosave";
import { AdSlot } from "@/components/ads/AdSlot";

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
] as const;

const HIGH_RISK_CATEGORIES = new Set(["legal", "migration"]);
// Хиты = редакционный список популярных (тот же, что в sitemap и на главной).
const HITS = new Set<string>(POPULAR_TEMPLATE_IDS);
const PAGE_SIZE = 24;
// In-feed реклама видна только при включённом флаге (иначе позицию не занимаем).
const ADS_ON = (process.env.NEXT_PUBLIC_ADS_ENABLED ?? "0") === "1";

type TabId = "all" | "popular" | "favorites";
type SortId = "popular" | "new" | "fast" | "az";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "all", label: "Все шаблоны" },
  { id: "popular", label: "Популярное" },
  { id: "favorites", label: "Избранное" },
];

const SORTS: Array<{ id: SortId; label: string }> = [
  { id: "popular", label: "Сначала популярные" },
  { id: "new", label: "Новизна" },
  { id: "fast", label: "Быстрые (по времени)" },
  { id: "az", label: "По алфавиту" },
];

/** Оценка времени заполнения: ~12 полей в минуту, минимум 3 мин. */
export function estimateMinutes(fieldCount: number): number {
  return Math.max(3, Math.round(fieldCount / 12));
}

function updatedISO(t: TemplateMeta): string | undefined {
  return parseLastUpdated(t.lastUpdated ?? "");
}

/** NEW — обновлён в текущем или прошлом месяце (протухает автоматически). */
function isNewTemplate(t: TemplateMeta, now: Date): boolean {
  const iso = updatedISO(t);
  if (!iso) return false;
  const [y, m] = iso.split("-").map(Number);
  const diff = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  return diff >= 0 && diff <= 1;
}

function relDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

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
  // P0.2: сетка из 369 карточек не рендерится на сервере (иначе раздувает
  // SSR-HTML /builder). mounted-гейт убирает hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const now = useMemo(() => new Date(), []);
  const [tab, setTab] = useState<TabId>("all");
  const [sort, setSort] = useState<SortId>("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [quizOpen, setQuizOpen] = useState(false);
  const [preview, setPreview] = useState<TemplateMeta | null>(null);

  // Сброс пагинации при смене фильтров.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [tab, sort, templateCategory, templateSearch]);

  // «Продолжить»: последние черновики из localStorage (реальные данные).
  const resume = useMemo(() => {
    if (!mounted) return [];
    const byId = new Map(TEMPLATE_META.map((t) => [t.id, t]));
    return getAllDrafts()
      .filter((d) => byId.has(d.templateId))
      .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
      .slice(0, 2)
      .map((d) => {
        const meta = byId.get(d.templateId);
        const filled = Object.values(d.values ?? {}).filter((v) => String(v ?? "").trim() !== "").length;
        // Floor 5%: открытый черновик = начатая работа, 0% вводило бы в заблуждение.
        const pct = meta ? Math.min(99, Math.max(5, Math.round((filled / Math.max(1, meta.fieldCount)) * 100))) : 5;
        return { meta: meta as TemplateMeta, pct, when: relDay(d.savedAt) };
      });
  }, [mounted]);

  const filtered = useMemo(() => {
    const tokens = tokenGroups(templateSearch);
    let list = TEMPLATE_META.filter((t) => {
      if (tab === "favorites" && !favorites.has(t.id)) return false;
      if (tab === "popular" && !HITS.has(t.id)) return false;
      if (templateCategory !== "all" && t.category !== templateCategory) return false;
      if (tokens.length > 0) {
        return textMatchesTokens(
          `${t.name} ${t.description} ${(t.suggestedDocs || []).join(" ")} ${t.actSource}`,
          tokens
        );
      }
      return true;
    });
    if (tokens.length > 0) {
      list = [...list].sort(
        (a, b) =>
          Math.max(scoreText(b.name, tokens, 0), scoreText(b.description, tokens, 20)) -
          Math.max(scoreText(a.name, tokens, 0), scoreText(a.description, tokens, 20))
      );
    } else if (sort === "az") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } else if (sort === "fast") {
      list = [...list].sort((a, b) => estimateMinutes(a.fieldCount) - estimateMinutes(b.fieldCount));
    } else if (sort === "new") {
      list = [...list].sort((a, b) => (updatedISO(b) ?? "").localeCompare(updatedISO(a) ?? ""));
    } else {
      // popular: хиты и избранное первыми, дальше по имени.
      list = [...list].sort((a, b) => {
        const rank = (t: TemplateMeta) => (HITS.has(t.id) ? 0 : favorites.has(t.id) ? 1 : 2);
        return rank(a) - rank(b) || a.name.localeCompare(b.name, "ru");
      });
    }
    return list;
  }, [tab, sort, templateCategory, templateSearch, favorites]);

  const shown = filtered.slice(0, visible);
  const searching = templateSearch.trim().length > 0;
  // In-feed 3-й позицией — только в спокойном просмотре (без поиска).
  const showInfeed = ADS_ON && !searching && tab === "all" && shown.length >= 3;

  const catCount = (id: string) =>
    id === "all" ? TEMPLATE_META.length : TEMPLATE_META.filter((t) => t.category === id).length;

  return (
    <div className="mb-6">
      {/* Табы */}
      <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label="Разделы шаблонов">
        {TABS.map((t) => {
          const Icon = t.id === "popular" ? Fire : t.id === "favorites" ? Star : SquaresFour;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors min-h-[40px] ${
                active
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              <Icon size={15} weight="fill" />
              {t.label}
              {t.id === "favorites" && favorites.size > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/25" : "bg-amber-100 text-amber-700"}`}>
                  {favorites.size}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Продолжить */}
      {mounted && resume.length > 0 && (
        <div className="mb-4 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-emerald-50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
            <ClockCounterClockwise size={15} weight="fill" className="text-brand-600" />
            Продолжить — вы недавно смотрели
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {resume.map(({ meta, pct, when }) => (
              <button
                key={meta.id}
                onClick={() => onSelectTemplate(meta.id)}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-left hover:border-brand-400"
              >
                <span className="block truncate text-[13px] font-bold">{meta.name}</span>
                <span className="text-[11px] text-gray-500">Заполнено ~{pct}% · сохранён {when}</span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <span className="block h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Хиты */}
      {mounted && !searching && tab !== "favorites" && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
            <Fire size={15} weight="fill" className="text-amber-600" />
            Выбирают чаще всего
          </p>
          <div className="grid gap-2 [grid-auto-flow:column] [grid-auto-columns:minmax(220px,1fr)] overflow-x-auto pb-1 sm:[grid-auto-columns:minmax(240px,1fr)]">
            {POPULAR_TEMPLATE_IDS.map((id) => {
              const t = TEMPLATE_META.find((m) => m.id === id);
              if (!t) return null;
              const CatIcon = categoryIcon(t.category);
              return (
                <button
                  key={id}
                  onClick={() => onSelectTemplate(t.id)}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 text-left hover:border-brand-400"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                    <CatIcon size={19} weight="fill" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-bold">{t.name}</span>
                    <span className="text-[11px] text-gray-500">~{estimateMinutes(t.fieldCount)} мин</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[250px_1fr]">
        {/* Split-сайдбар (десктоп) */}
        <aside className="sticky top-4 hidden rounded-2xl border border-gray-200 bg-white p-3 lg:block" aria-label="Разделы шаблонов">
          <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Разделы · {TEMPLATE_CATEGORIES.length - 1}
          </p>
          {TEMPLATE_CATEGORIES.map((cat) => {
            const CatIcon = cat.id === "all" ? SquaresFour : categoryIcon(cat.id);
            const active = templateCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                aria-current={active ? "true" : undefined}
                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                  active ? "bg-brand-50 font-bold text-brand-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <CatIcon size={17} weight="fill" />
                </span>
                {cat.id === "all" ? "Все шаблоны" : cat.label}
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white text-brand-700" : "bg-gray-100 text-gray-500"}`}>
                  {catCount(cat.id)}
                </span>
              </button>
            );
          })}
          <div className="mt-2 border-t border-dashed border-gray-200 pt-3">
            <button
              onClick={() => setQuizOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 px-3 py-2.5 text-[12.5px] font-bold text-brand-700 hover:bg-brand-50 min-h-[48px]"
            >
              <Sparkle size={18} weight="fill" />
              Не знаете какой нужен? Подобрать за 3 шага
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Chips-категории (мобила/планшет) */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Разделы шаблонов">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const active = templateCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-3.5 py-2 text-[13px] font-medium min-h-[40px] ${
                    active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {cat.id === "all" ? "Все" : cat.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-brand-200 text-brand-800" : "bg-gray-100 text-gray-500"}`}>
                    {catCount(cat.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sticky-тулбар */}
          <div className="sticky top-2 z-10 mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2.5 shadow-sm backdrop-blur">
            <div className="relative min-w-0 flex-[1_1_100%] sm:flex-1">
              <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Найти шаблон... например, ДКП, аренда, доверенность"
                value={templateSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Поиск шаблона"
                enterKeyHint="search"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-base outline-none focus:border-brand-500 min-h-[44px] sm:text-sm"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              aria-label="Сортировка шаблонов"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-[13px] text-gray-600 outline-none focus:border-brand-500 min-h-[44px] sm:flex-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setQuizOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 px-3 py-2.5 text-[13px] font-bold text-brand-700 lg:hidden min-h-[44px]"
            >
              <Sparkle size={16} weight="fill" /> Подобрать
            </button>
          </div>
          <p className="mb-2 text-xs text-gray-500" role="status">
            Найдено <b className="text-gray-900">{filtered.length} из {TEMPLATE_META.length}</b>
            {templateCategory !== "all" && <> · раздел «{TEMPLATE_CATEGORIES.find((c) => c.id === templateCategory)?.label}»</>}
            {tab === "favorites" && <> · избранное</>}
            {tab === "popular" && <> · популярное</>}
          </p>

          {/* Сетка карточек */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {!mounted &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-2xl border border-gray-200 p-3.5" aria-hidden="true">
                  <div className="mb-2 h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                  <div className="mb-1.5 h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            {mounted &&
              shown.map((t, idx) => (
                <TemplateCard
                  key={t.id}
                  t={t}
                  now={now}
                  search={templateSearch}
                  selected={selectedTemplateId === t.id}
                  fav={favorites.has(t.id)}
                  onSelect={() => onSelectTemplate(t.id)}
                  onFav={() => onToggleFavorite(t.id)}
                  onPreview={() => setPreview(t)}
                  infeed={showInfeed && idx === 2}
                />
              ))}
          </div>

          {mounted && visible < filtered.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-3 block w-full rounded-xl border border-gray-200 bg-white py-3 text-[13.5px] font-semibold text-brand-700 hover:border-brand-400 min-h-[48px]"
            >
              Показать ещё {Math.min(PAGE_SIZE, filtered.length - visible)} · осталось {filtered.length - visible}
            </button>
          )}

          {/* Не нашли */}
          {mounted && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 text-center sm:p-6">
              <ChatsCircle size={32} weight="regular" className="mx-auto text-brand-500" />
              <h3 className="mb-1 mt-2 text-[15px] font-bold">Не нашли нужный документ?</h3>
              <p className="mx-auto mb-3.5 max-w-md text-[13px] text-gray-500">
                Опишите ситуацию своими словами — AI-юрист подберёт шаблон или составим индивидуально
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <Link
                  href="/ai-yurist"
                  className="inline-flex items-center rounded-[10px] bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700 min-h-[44px]"
                >
                  Спросить AI-юриста — бесплатно
                </Link>
                <button
                  onClick={() => setQuizOpen(true)}
                  className="rounded-[10px] border border-gray-200 bg-white px-5 py-2.5 text-[13.5px] font-semibold text-gray-600 hover:border-brand-300 min-h-[44px]"
                >
                  Подобрать за 3 шага
                </button>
              </div>
            </div>
          )}

          {mounted && filtered.length === 0 && (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center">
              <MagnifyingGlass size={44} weight="light" className="mx-auto mb-3 text-gray-300" />
              <h3 className="mb-1 text-[15px] font-bold">
                {searching
                  ? `Ничего не найдено по запросу «${templateSearch.trim()}»`
                  : tab === "favorites"
                    ? "В избранном пока пусто"
                    : "Нет шаблонов в разделе"}
              </h3>
              <p className="mx-auto mb-4 max-w-md text-[13px] text-gray-500">
                {searching
                  ? "Попробуйте другие слова: ДКП, аренда, доверенность, расписка. Или спросите AI-юриста — подберёт за секунды."
                  : tab === "favorites"
                    ? "Нажимайте на звёздочку у шаблона — он появится здесь."
                    : "Выберите другой раздел"}
              </p>
              {searching && (
                <Link
                  href="/ai-yurist"
                  className="inline-flex items-center rounded-[10px] bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700 min-h-[44px]"
                >
                  Спросить AI-юриста — бесплатно
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {quizOpen && (
        <QuizModal
          onClose={() => setQuizOpen(false)}
          onPick={(t) => {
            setQuizOpen(false);
            onSelectTemplate(t.id);
          }}
        />
      )}
      {preview && (
        <PreviewModal
          t={preview}
          now={now}
          fav={favorites.has(preview.id)}
          onClose={() => setPreview(null)}
          onSelect={() => {
            setPreview(null);
            onSelectTemplate(preview.id);
          }}
          onFav={() => onToggleFavorite(preview.id)}
        />
      )}
    </div>
  );
}

/* ---------- Карточка + in-feed ---------- */

function TemplateCard({
  t,
  now,
  search,
  selected,
  fav,
  onSelect,
  onFav,
  onPreview,
  infeed,
}: {
  t: TemplateMeta;
  now: Date;
  search: string;
  selected: boolean;
  fav: boolean;
  onSelect: () => void;
  onFav: () => void;
  onPreview: () => void;
  infeed: boolean;
}) {
  const CatIcon = categoryIcon(t.category);
  const hit = HITS.has(t.id);
  const isNew = isNewTemplate(t, now);
  return (
    <>
      {infeed && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3">
          <p className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
            <span aria-hidden="true">📢</span> Реклама · Яндекс
          </p>
          <AdSlot id="TEMPLATE_SELECT_FEED" />
        </div>
      )}
      <article
        onClick={onSelect}
        className={`relative cursor-pointer rounded-2xl border-2 bg-white p-3.5 transition-colors ${
          selected ? "border-brand-500 bg-brand-50/50" : "border-gray-200 hover:border-brand-300"
        }`}
      >
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CatIcon size={21} weight="fill" />
          </span>
          <h3 className={`min-w-0 flex-1 text-[13px] font-bold leading-snug ${selected ? "text-brand-700" : "text-gray-900"}`}>
            <Highlight text={t.name} query={search} />
          </h3>
        </div>
        {t.description && <p className="mb-2 line-clamp-2 min-h-[2.5em] text-[11.5px] text-gray-500">{t.description}</p>}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-gray-400">
          <span>~{estimateMinutes(t.fieldCount)} мин</span>
          {t.lastUpdated?.includes("2026") && <span className="font-semibold text-emerald-600">Обновлён 2026</span>}
          {hit && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700">
              <Fire size={11} weight="fill" /> ХИТ
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700">
              <Sparkle size={11} weight="fill" /> NEW
            </span>
          )}
        </div>
        {HIGH_RISK_CATEGORIES.has(t.category) && (
          <p className="mt-1.5 inline-block rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700">
            проверьте у юриста
          </p>
        )}
        <div className="mt-2.5 flex gap-1.5">
          <span className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-[12.5px] font-bold text-white min-h-[40px]">
            {selected ? "Выбран ✓" : "Выбрать"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            title="Быстрый просмотр"
            aria-label={`Быстрый просмотр: ${t.name}`}
            className="grid w-10 flex-shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 min-h-[40px] min-w-[40px]"
          >
            <Eye size={18} weight="regular" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFav();
            }}
            title={fav ? "Убрать из избранного" : "В избранное"}
            aria-label={fav ? `Убрать из избранного: ${t.name}` : `В избранное: ${t.name}`}
            aria-pressed={fav}
            className={`grid w-10 flex-shrink-0 place-items-center rounded-lg border min-h-[40px] min-w-[40px] ${
              fav ? "border-amber-200 text-amber-400" : "border-gray-200 text-gray-300 hover:text-amber-400"
            }`}
          >
            <Star size={18} weight={fav ? "fill" : "regular"} />
          </button>
        </div>
      </article>
    </>
  );
}

/* ---------- Квиз «за 3 шага» ---------- */

interface QuizSituation {
  label: string;
  category: string;
  options: Array<{ label: string; query: string }>;
}

const QUIZ: QuizSituation[] = [
  {
    label: "Купить / продать машину",
    category: "auto",
    options: [
      { label: "Оформляю покупку", query: "дкп купля продажа" },
      { label: "Продаю свою", query: "дкп продажа" },
      { label: "Нужна доверенность", query: "доверенность" },
    ],
  },
  {
    label: "Снять / сдать жильё",
    category: "realty",
    options: [
      { label: "Снимаю квартиру", query: "найм аренда квартиры" },
      { label: "Сдаю квартиру", query: "аренда сдача" },
      { label: "Акт приёма квартиры", query: "акт приема" },
    ],
  },
  {
    label: "Деньги в долг",
    category: "finance",
    options: [
      { label: "Даю в долг", query: "расписка займ" },
      { label: "Беру в долг", query: "займ расписка" },
      { label: "Долг не возвращают", query: "претензия возврат" },
    ],
  },
  {
    label: "Спор, претензия, суд",
    category: "legal",
    options: [
      { label: "Претензия", query: "претензия" },
      { label: "Исковое заявление", query: "иск" },
      { label: "Жалоба", query: "жалоба" },
    ],
  },
  {
    label: "Семья, наследство, алименты",
    category: "family",
    options: [
      { label: "Алименты", query: "алименты" },
      { label: "Наследство", query: "наследство" },
      { label: "Брачный договор", query: "брачный" },
    ],
  },
  {
    label: "Бизнес, сделка, подряд",
    category: "business",
    options: [
      { label: "Подряд / работы", query: "подряд" },
      { label: "Услуги", query: "услуги" },
      { label: "Поставка", query: "поставка" },
    ],
  },
];

function QuizModal({ onClose, onPick }: { onClose: () => void; onPick: (t: TemplateMeta) => void }) {
  const [sit, setSit] = useState<QuizSituation | null>(null);
  const [opt, setOpt] = useState<{ label: string; query: string } | null>(null);

  const results = useMemo(() => {
    if (!sit || !opt) return [];
    const tokens = tokenGroups(opt.query);
    return TEMPLATE_META.filter((t) => t.category === sit.category)
      .map((t) => ({
        t,
        score: Math.max(scoreText(t.name, tokens, 0), scoreText(t.description, tokens, 20)),
      }))
      .sort((a, b) => b.score - a.score || a.t.name.localeCompare(b.t.name, "ru"))
      .slice(0, 3)
      .map((r) => r.t);
  }, [sit, opt]);

  const step = !sit ? 1 : !opt ? 2 : 3;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Подбор шаблона">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-extrabold">Подбор шаблона · шаг {step} из 3</h3>
          <button onClick={onClose} aria-label="Закрыть" className="grid h-10 w-10 place-items-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="mb-4 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-brand-500" : "bg-gray-200"}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <p className="mb-2.5 text-[13px] text-gray-500">Что нужно оформить?</p>
            <div className="grid gap-2">
              {QUIZ.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setSit(q)}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-left text-[13.5px] font-semibold hover:border-brand-400 min-h-[48px]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && sit && (
          <>
            <p className="mb-2.5 text-[13px] text-gray-500">Уточните: {sit.label.toLowerCase()} — что именно?</p>
            <div className="grid gap-2">
              {sit.options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => setOpt(o)}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-left text-[13.5px] font-semibold hover:border-brand-400 min-h-[48px]"
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button onClick={() => setSit(null)} className="mt-2.5 text-[12.5px] text-gray-400 underline">
              ← Назад
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="mb-2.5 text-[13px] text-gray-500">Вот что подходит лучше всего:</p>
            <div className="grid gap-2">
              {results.map((t) => {
                const CatIcon = categoryIcon(t.category);
                return (
                  <button
                    key={t.id}
                    onClick={() => onPick(t)}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-3 text-left hover:border-brand-500 hover:bg-brand-50/50 min-h-[56px]"
                  >
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                      <CatIcon size={18} weight="fill" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">{t.name}</span>
                      <span className="text-[11px] text-gray-500">~{estimateMinutes(t.fieldCount)} мин</span>
                    </span>
                  </button>
                );
              })}
              {results.length === 0 && <p className="text-[13px] text-gray-500">Ничего не подошло — попробуйте другую ситуацию.</p>}
            </div>
            <button onClick={() => { setSit(null); setOpt(null); }} className="mt-2.5 text-[12.5px] text-gray-400 underline">
              ← Начать заново
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Быстрый просмотр ---------- */

function PreviewModal({
  t,
  now,
  fav,
  onClose,
  onSelect,
  onFav,
}: {
  t: TemplateMeta;
  now: Date;
  fav: boolean;
  onClose: () => void;
  onSelect: () => void;
  onFav: () => void;
}) {
  const CatIcon = categoryIcon(t.category);
  const similar = (t.suggestedDocs || [])
    .map((id) => TEMPLATE_META.find((m) => m.id === id))
    .filter((m): m is TemplateMeta => Boolean(m))
    .slice(0, 3);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Быстрый просмотр: ${t.name}`}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CatIcon size={22} weight="fill" />
          </span>
          <button onClick={onClose} aria-label="Закрыть" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={20} weight="bold" />
          </button>
        </div>
        <h3 className="text-[16px] font-extrabold">{t.name}</h3>
        <p className="mt-1 text-[13px] text-gray-500">
          ~{estimateMinutes(t.fieldCount)} мин · полей: {t.fieldCount}
          {t.lastUpdated?.includes("2026") && <> · <span className="font-semibold text-emerald-600">обновлён 2026</span></>}
          {isNewTemplate(t, now) && <> · <span className="font-semibold text-emerald-600">NEW</span></>}
        </p>
        {t.description && <p className="mt-2.5 text-[13.5px] text-gray-600">{t.description}</p>}
        {t.actSource && <p className="mt-2 text-[12px] text-gray-400">Основание: {t.actSource}</p>}
        {similar.length > 0 && (
          <p className="mt-3 text-[12.5px] text-gray-500">
            Похожие: {similar.map((m) => m.name).join(" · ")}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button onClick={onSelect} className="flex-1 rounded-[10px] bg-brand-600 px-4 py-3 text-[13.5px] font-bold text-white hover:bg-brand-700 min-h-[48px]">
            Создать документ →
          </button>
          <button onClick={onFav} className="rounded-[10px] border border-gray-200 px-4 py-3 text-[13.5px] font-semibold text-gray-600 min-h-[48px]">
            {fav ? "★ В избранном" : "☆ В избранное"}
          </button>
        </div>
      </div>
    </div>
  );
}
