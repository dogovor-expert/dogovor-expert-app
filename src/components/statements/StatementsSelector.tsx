"use client";

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
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { parseLastUpdated } from "@/lib/dates";
import Highlight from "@/components/ui/Highlight";
import { tokenGroups, scoreText, textMatchesTokens } from "@/lib/search";

/* ---------- Группы = разделы заявлений (аналог TEMPLATE_CATEGORIES в builder) ---------- */

const STATEMENT_GROUPS = [
  { id: "all", label: "Все" },
  { id: "fssp", label: "Приставам (ФССП)" },
  { id: "courts", label: "В суды" },
  { id: "hr", label: "Работодателю" },
  { id: "housing", label: "ЖКХ и УК" },
  { id: "police", label: "В полицию" },
  { id: "oversight", label: "Жалобы в надзоры" },
  { id: "military", label: "Военкомат" },
  { id: "official-forms", label: "Госорганы (формы)" },
] as const;

const GROUP_ICONS: Record<string, typeof Fire> = {
  all: SquaresFour,
  fssp: ClockCounterClockwise,
  courts: Eye,
  hr: Star,
  housing: SquaresFour,
  police: ChatsCircle,
  oversight: Fire,
  military: Star,
  "official-forms": SquaresFour,
};

const PAGE_SIZE = 24;

type TabId = "all" | "popular" | "favorites";
type SortId = "popular" | "new" | "fast" | "az";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "all", label: "Все заявления" },
  { id: "popular", label: "Популярное" },
  { id: "favorites", label: "Избранное" },
];

const SORTS: Array<{ id: SortId; label: string }> = [
  { id: "popular", label: "Сначала популярные" },
  { id: "new", label: "Новизна" },
  { id: "fast", label: "Быстрые (по времени)" },
  { id: "az", label: "По алфавиту" },
];

/** Оценка времени заполнения: ~12 полей в минуту, минимум 3 мин (как в builder). */
export function estimateMinutes(fieldCount: number): number {
  return Math.max(3, Math.round(fieldCount / 12));
}

function updatedISO(t: { lastUpdated?: string }): string | undefined {
  return parseLastUpdated(t.lastUpdated ?? "");
}

function stmts(): LegalTemplate[] {
  return LEGAL_TEMPLATES.filter((t) => t.kind === "statement");
}

const groupOf = (t: LegalTemplate) => t.statementGroup ?? "official-forms";

export default function StatementsSelector({
  favorites,
  onToggleFavorite,
}: {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  // mounted-гейт: тяжёлая сетка не рендерится на сервере (как P0.2 в builder).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [tab, setTab] = useState<TabId>("all");
  const [sort, setSort] = useState<SortId>("popular");
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [quizOpen, setQuizOpen] = useState(false);
  const [preview, setPreview] = useState<LegalTemplate | null>(null);

  const all = useMemo(() => stmts(), []);
  const metaById = useMemo(() => new Map(TEMPLATE_META.map((m) => [m.id, m])), []);

  // Сброс пагинации при смене фильтров.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [tab, sort, group, query]);

  const filtered = useMemo(() => {
    const tokens = tokenGroups(query);
    let list = all.filter((t) => {
      if (tab === "favorites" && !favorites.has(t.id)) return false;
      if (group !== "all" && groupOf(t) !== group) return false;
      if (tokens.length > 0) {
        return textMatchesTokens(
          `${t.name} ${t.description} ${t.submitTo?.where ?? ""} ${t.actSource}`,
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
      list = [...list].sort(
        (a, b) =>
          estimateMinutes(metaById.get(a.id)?.fieldCount ?? 60) -
          estimateMinutes(metaById.get(b.id)?.fieldCount ?? 60)
      );
    } else if (sort === "new") {
      list = [...list].sort((a, b) => (updatedISO(b) ?? "").localeCompare(updatedISO(a) ?? ""));
    } else {
      list = [...list].sort((a, b) => {
        const rank = (t: LegalTemplate) => (favorites.has(t.id) ? 0 : 1);
        return rank(a) - rank(b) || a.name.localeCompare(b.name, "ru");
      });
    }
    return list;
  }, [all, tab, sort, group, query, favorites, metaById]);

  const shown = filtered.slice(0, visible);
  const searching = query.trim().length > 0;

  const groupCount = (id: string) =>
    id === "all" ? all.length : all.filter((t) => groupOf(t) === id).length;

  return (
    <div className="mb-6">
      {/* Табы */}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Разделы заявлений">
        {TABS.map((t) => {
          const Icon = t.id === "popular" ? Fire : t.id === "favorites" ? Star : SquaresFour;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
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

      <div className="grid items-start gap-4 lg:grid-cols-[250px_1fr]">
        {/* Split-сайдбар (десктоп) */}
        <aside className="sticky top-4 hidden rounded-2xl border border-gray-200 bg-white p-3 lg:block" aria-label="Группы заявлений">
          <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Группы · {STATEMENT_GROUPS.length - 1}
          </p>
          {STATEMENT_GROUPS.map((g) => {
            const GIcon = GROUP_ICONS[g.id] ?? SquaresFour;
            const active = group === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGroup(g.id)}
                aria-current={active ? "true" : undefined}
                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                  active ? "bg-brand-50 font-bold text-brand-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <GIcon size={17} weight="fill" />
                </span>
                {g.id === "all" ? "Все заявления" : g.label}
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white text-brand-700" : "bg-gray-100 text-gray-500"}`}>
                  {groupCount(g.id)}
                </span>
              </button>
            );
          })}
          <div className="mt-2 border-t border-dashed border-gray-200 pt-3">
            <button
              onClick={() => setQuizOpen(true)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 px-3 py-2.5 text-[12.5px] font-bold text-brand-700 hover:bg-brand-50"
            >
              <Sparkle size={18} weight="fill" />
              Не знаете какое нужно? Подобрать за 3 шага
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Chips-группы (мобила/планшет) */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Группы заявлений">
            {STATEMENT_GROUPS.map((g) => {
              const active = group === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGroup(g.id)}
                  className={`flex min-h-[40px] flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-2 px-3.5 py-2 text-[13px] font-medium ${
                    active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {g.id === "all" ? "Все" : g.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-brand-200 text-brand-800" : "bg-gray-100 text-gray-500"}`}>
                    {groupCount(g.id)}
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
                placeholder="Найти заявление... например, отпуск, пристав, прокуратура"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Поиск заявления"
                enterKeyHint="search"
                className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-base outline-none focus:border-brand-500 sm:text-sm"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              aria-label="Сортировка заявлений"
              className="min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2.5 text-[13px] text-gray-600 outline-none focus:border-brand-500 sm:flex-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setQuizOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-dashed border-brand-300 px-3 py-2.5 text-[13px] font-bold text-brand-700 lg:hidden"
            >
              <Sparkle size={16} weight="fill" /> Подобрать
            </button>
          </div>
          <p className="mb-2 text-xs text-gray-500" role="status">
            Найдено <b className="text-gray-900">{filtered.length} из {all.length}</b>
            {group !== "all" && <> · группа «{STATEMENT_GROUPS.find((g) => g.id === group)?.label}»</>}
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
              shown.map((t) => (
                <StatementCard
                  key={t.id}
                  t={t}
                  search={query}
                  fav={favorites.has(t.id)}
                  onFav={() => onToggleFavorite(t.id)}
                  onPreview={() => setPreview(t)}
                />
              ))}
          </div>

          {mounted && visible < filtered.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-3 block min-h-[48px] w-full rounded-xl border border-gray-200 bg-white py-3 text-[13.5px] font-semibold text-brand-700 hover:border-brand-400"
            >
              Показать ещё {Math.min(PAGE_SIZE, filtered.length - visible)} · осталось {filtered.length - visible}
            </button>
          )}

          {/* Не нашли */}
          {mounted && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 text-center sm:p-6">
              <ChatsCircle size={32} weight="regular" className="mx-auto text-brand-500" />
              <h3 className="mb-1 mt-2 text-[15px] font-bold">Не нашли нужное заявление?</h3>
              <p className="mx-auto mb-3.5 max-w-md text-[13px] text-gray-500">
                Опишите ситуацию своими словами — AI-юрист подберёт заявление или составим индивидуально
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <Link
                  href="/ai-yurist"
                  className="inline-flex min-h-[44px] items-center rounded-[10px] bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700"
                >
                  Спросить AI-юриста — бесплатно
                </Link>
                <button
                  onClick={() => setQuizOpen(true)}
                  className="min-h-[44px] rounded-[10px] border border-gray-200 bg-white px-5 py-2.5 text-[13.5px] font-semibold text-gray-600 hover:border-brand-300"
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
                  ? `Ничего не найдено по запросу «${query.trim()}»`
                  : tab === "favorites"
                    ? "В избранном пока пусто"
                    : "Нет заявлений в группе"}
              </h3>
              <p className="mx-auto mb-4 max-w-md text-[13px] text-gray-500">
                {searching
                  ? "Попробуйте другие слова: отпуск, пристав, прокуратура. Или спросите AI-юриста — подберёт за секунды."
                  : tab === "favorites"
                    ? "Нажимайте на звёздочку у заявления — оно появится здесь."
                    : "Выберите другую группу"}
              </p>
              {searching && (
                <Link
                  href="/ai-yurist"
                  className="inline-flex min-h-[44px] items-center rounded-[10px] bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700"
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
          all={all}
          onClose={() => setQuizOpen(false)}
        />
      )}
      {preview && (
        <PreviewModal
          t={preview}
          fav={favorites.has(preview.id)}
          onClose={() => setPreview(null)}
          onFav={() => onToggleFavorite(preview.id)}
        />
      )}
    </div>
  );
}

/* ---------- Карточка заявления: выбор + просмотр ---------- */

function StatementCard({
  t,
  search,
  fav,
  onFav,
  onPreview,
}: {
  t: LegalTemplate;
  search: string;
  fav: boolean;
  onFav: () => void;
  onPreview: () => void;
}) {
  const minutes = estimateMinutes(t.fields.length);
  return (
    <article className="relative rounded-2xl border-2 border-gray-200 bg-white p-3.5 transition-colors hover:border-brand-300">
      <Link href={`/documents/${t.id}`} className="mb-2 flex items-center gap-2.5">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Fire size={21} weight="fill" />
        </span>
        <h3 className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-gray-900">
          <Highlight text={t.name} query={search} />
        </h3>
      </Link>
      {t.description && <p className="mb-2 line-clamp-2 min-h-[2.5em] text-[11.5px] text-gray-500">{t.description}</p>}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-gray-400">
        <span>~{minutes} мин</span>
        {t.submitTo && <span>· {t.submitTo.where}</span>}
        {t.lastUpdated?.includes("2026") && <span className="font-semibold text-emerald-600">Обновлён 2026</span>}
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <Link
          href={`/documents/${t.id}`}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg bg-brand-600 px-3 py-2 text-[12.5px] font-bold text-white"
        >
          Открыть →
        </Link>
        <button
          onClick={onPreview}
          title="Быстрый просмотр"
          aria-label={`Быстрый просмотр: ${t.name}`}
          className="grid min-h-[40px] w-10 min-w-[40px] flex-shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600"
        >
          <Eye size={18} weight="regular" />
        </button>
        <button
          onClick={onFav}
          title={fav ? "Убрать из избранного" : "В избранное"}
          aria-label={fav ? `Убрать из избранного: ${t.name}` : `В избранное: ${t.name}`}
          aria-pressed={fav}
          className={`grid min-h-[40px] w-10 min-w-[40px] flex-shrink-0 place-items-center rounded-lg border ${
            fav ? "border-amber-200 text-amber-400" : "border-gray-200 text-gray-300 hover:text-amber-400"
          }`}
        >
          <Star size={18} weight={fav ? "fill" : "regular"} />
        </button>
      </div>
    </article>
  );
}

/* ---------- Квиз «за 3 шага» по группам заявлений ---------- */

interface QuizSituation {
  label: string;
  group: string;
  options: Array<{ label: string; query: string }>;
}

const QUIZ: QuizSituation[] = [
  {
    label: "Долги и приставы",
    group: "fssp",
    options: [
      { label: "Возбудить производство", query: "возбуждение исполнительное" },
      { label: "Жалоба на пристава", query: "жалоба пристав" },
    ],
  },
  {
    label: "Суд",
    group: "courts",
    options: [
      { label: "Отложить заседание", query: "отложение заседание" },
      { label: "Иск / ходатайство", query: "иск ходатайство" },
    ],
  },
  {
    label: "Работа",
    group: "hr",
    options: [
      { label: "Отпуск", query: "отпуск" },
      { label: "Увольнение", query: "увольнение" },
    ],
  },
  {
    label: "ЖКХ",
    group: "housing",
    options: [
      { label: "Перерасчёт", query: "перерасчет" },
      { label: "Залив / качество", query: "залив качество" },
    ],
  },
  {
    label: "Жалоба в надзор",
    group: "oversight",
    options: [
      { label: "Прокуратура", query: "прокуратура" },
      { label: "Роспотребнадзор / ГЖИ", query: "жалоба надзор" },
    ],
  },
  {
    label: "Полиция / военкомат",
    group: "police",
    options: [
      { label: "Заявление в полицию", query: "полиция кража" },
      { label: "Военкомат", query: "отсрочка военкомат" },
    ],
  },
];

function QuizModal({ all, onClose }: { all: LegalTemplate[]; onClose: () => void }) {
  const [sit, setSit] = useState<QuizSituation | null>(null);
  const [opt, setOpt] = useState<{ label: string; query: string } | null>(null);

  const results = useMemo(() => {
    if (!sit || !opt) return [];
    const tokens = tokenGroups(opt.query);
    return all
      .filter((t) => groupOf(t) === sit.group)
      .map((t) => ({
        t,
        score: Math.max(scoreText(t.name, tokens, 0), scoreText(t.description, tokens, 20)),
      }))
      .sort((a, b) => b.score - a.score || a.t.name.localeCompare(b.t.name, "ru"))
      .slice(0, 3)
      .map((r) => r.t);
  }, [all, sit, opt]);

  const step = !sit ? 1 : !opt ? 2 : 3;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Подбор заявления">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-extrabold">Подбор заявления · шаг {step} из 3</h3>
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
            <p className="mb-2.5 text-[13px] text-gray-500">Куда обращаетесь?</p>
            <div className="grid gap-2">
              {QUIZ.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setSit(q)}
                  className="min-h-[48px] rounded-xl border border-gray-200 px-4 py-3 text-left text-[13.5px] font-semibold hover:border-brand-400"
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
                  className="min-h-[48px] rounded-xl border border-gray-200 px-4 py-3 text-left text-[13.5px] font-semibold hover:border-brand-400"
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
              {results.map((t) => (
                <Link
                  key={t.id}
                  href={`/documents/${t.id}`}
                  className="flex min-h-[56px] items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-3 text-left hover:border-brand-500 hover:bg-brand-50/50"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                    <Fire size={18} weight="fill" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold">{t.name}</span>
                    <span className="text-[11px] text-gray-500">~{estimateMinutes(t.fields.length)} мин</span>
                  </span>
                </Link>
              ))}
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
  fav,
  onClose,
  onFav,
}: {
  t: LegalTemplate;
  fav: boolean;
  onClose: () => void;
  onFav: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Быстрый просмотр: ${t.name}`}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Fire size={22} weight="fill" />
          </span>
          <button onClick={onClose} aria-label="Закрыть" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={20} weight="bold" />
          </button>
        </div>
        <h3 className="text-[16px] font-extrabold">{t.name}</h3>
        <p className="mt-1 text-[13px] text-gray-500">
          ~{estimateMinutes(t.fields.length)} мин · полей: {t.fields.length}
          {t.submitTo && <> · {t.submitTo.where}</>}
          {t.lastUpdated?.includes("2026") && <span className="font-semibold text-emerald-600"> · обновлён 2026</span>}
        </p>
        {t.description && <p className="mt-2.5 text-[13.5px] text-gray-600">{t.description}</p>}
        {t.submitTo && (
          <p className="mt-2 text-[12px] text-gray-400">
            Куда подавать: {t.submitTo.where} · срок {t.submitTo.term} · {t.submitTo.fee}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href={`/documents/${t.id}`} className="min-h-[48px] flex-1 rounded-[10px] bg-brand-600 px-4 py-3 text-center text-[13.5px] font-bold text-white hover:bg-brand-700">
            Открыть образец →
          </Link>
          <button onClick={onFav} className="min-h-[48px] rounded-[10px] border border-gray-200 px-4 py-3 text-[13.5px] font-semibold text-gray-600">
            {fav ? "★ В избранном" : "☆ В избранное"}
          </button>
        </div>
      </div>
    </div>
  );
}
