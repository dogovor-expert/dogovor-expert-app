"use client";
/**
 * Client-часть /utils: интерактивные калькуляторы и валидаторы.
 * Server-rendered обвязка (FAQ, SEO-текст, schema.org) — в page.tsx.
 *
 * Раскладка (Вариант D): слева — компактный список инструментов с поиском,
 * сортировкой, категориями и избранным; справа — панель активного калькулятора.
 */
import { useEffect, useRef, useState } from "react";
import {
  Landmark,
  Scale, Percent, Banknote, Home, Baby, FileWarning, TrendingUp,
  Briefcase, Wallet, Store, Plane, Car, CarFront, Fingerprint, Hash as HashIcon, CalendarDays, Recycle, Ship, CarTaxiFront, ShieldQuestion,
  Search, Star,
} from "lucide-react";
import InnValidator from "@/components/calculator/InnValidator";
import CourtFee from "@/components/calculator/CourtFee";
import Interest395 from "@/components/calculator/Interest395";
import SalaryDelay236 from "@/components/calculator/SalaryDelay236";
import ZhkhPenalty from "@/components/calculator/ZhkhPenalty";
import Alimony from "@/components/calculator/Alimony";
import ContractPenalty from "@/components/calculator/ContractPenalty";
import Indexation208 from "@/components/calculator/Indexation208";
import FeesIp from "@/components/calculator/FeesIp";
import Ndfl from "@/components/calculator/Ndfl";
import UsnNpd from "@/components/calculator/UsnNpd";
import Vacation from "@/components/calculator/Vacation";
import TransportTax from "@/components/calculator/TransportTax";
import Validators from "@/components/calculator/Validators";
import SumWords from "@/components/calculator/SumWords";
import DayCounter from "@/components/calculator/DayCounter";
import Nds from "@/components/calculator/Nds";
import PddFines from "@/components/calculator/PddFines";
import UtilSb from "@/components/calculator/UtilSb";
import CustomsDuty from "@/components/calculator/CustomsDuty";
import NdflSale from "@/components/calculator/NdflSale";
import KaskoQuote from "@/components/calculator/KaskoQuote";

type Tool = {
  id: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  comp: React.ElementType | null;
  /** популярный — выше при сортировке «Популярные» */
  pop?: boolean;
  /** новый инструмент */
  neu?: boolean;
};

const GROUPS: { id: string; label: string; tools: Tool[] }[] = [
  {
    id: "law",
    label: "Юридические",
    tools: [
      { id: "docs", label: "Быстрые проверки", icon: Landmark, desc: "ИНН, реквизиты", comp: null, pop: true },
      { id: "nds", label: "НДС", icon: Percent, desc: "Начислить / выделить 22%", comp: Nds, pop: true },
      { id: "fee", label: "Госпошлина", icon: Scale, desc: "Ст. 333.19 НК", comp: CourtFee, pop: true },
      { id: "395", label: "395 ГК", icon: Percent, desc: "Пользование чужими деньгами", comp: Interest395, pop: true },
      { id: "236", label: "236 ТК", icon: Banknote, desc: "Задержка зарплаты", comp: SalaryDelay236 },
      { id: "zhkh", label: "Пени ЖКХ и капремонт", icon: Home, desc: "Ч. 14, 14.1 ст. 155 ЖК", comp: ZhkhPenalty },
      { id: "alimony", label: "Алименты", icon: Baby, desc: "Доли и пени (СК РФ)", comp: Alimony },
      { id: "penalty", label: "Неустойка", icon: FileWarning, desc: "Договорная и законная", comp: ContractPenalty },
      { id: "index", label: "Индексация", icon: TrendingUp, desc: "Ст. 208 ГПК", comp: Indexation208, neu: true },
    ],
  },
  {
    id: "fin",
    label: "Финансы и авто",
    tools: [
      { id: "ipfees", label: "Взносы ИП", icon: Briefcase, desc: "Ст. 430 НК, 1% свыше 300 тыс.", comp: FeesIp, pop: true },
      { id: "ndfl", label: "НДФЛ", icon: Wallet, desc: "Шкала 13–22%, вычеты", comp: Ndfl, pop: true },
      { id: "ndflsale", label: "3-НДФЛ: продажа авто", icon: CarTaxiFront, desc: "Вычет 250 тыс., срок владения", comp: NdflSale },
      { id: "usnnpd", label: "УСН / НПД", icon: Store, desc: "Налоги ИП и самозанятых", comp: UsnNpd },
      { id: "vacation", label: "Отпускные", icon: Plane, desc: "29,3 — ст. 139 ТК", comp: Vacation },
      { id: "transport", label: "Транспортный налог", icon: Car, desc: "Ст. 361–362 НК", comp: TransportTax },
      { id: "pdd", label: "Штрафы ГИБДД", icon: CarFront, desc: "Гл. 12 КоАП, скидка 50%", comp: PddFines, pop: true },
      { id: "utilsb", label: "Утильсбор", icon: Recycle, desc: "ПП № 1291, физлица и юрлица", comp: UtilSb, neu: true },
      { id: "customs", label: "Растаможка авто", icon: Ship, desc: "Пошлины, акциз, НДС, утильсбор", comp: CustomsDuty, pop: true },
      { id: "kasko", label: "КАСКО-квиз", icon: ShieldQuestion, desc: "Оценка премии за 30 секунд", comp: KaskoQuote, neu: true },
    ],
  },
  {
    id: "ref",
    label: "Справочники",
    tools: [
      { id: "valid", label: "Проверка реквизитов", icon: Fingerprint, desc: "СНИЛС, ОГРН, БИК, счёт, карта", comp: Validators, pop: true },
      { id: "words", label: "Сумма прописью", icon: HashIcon, desc: "Для договоров и расписок", comp: SumWords, neu: true },
      { id: "days", label: "Сроки и дни", icon: CalendarDays, desc: "Календарные и рабочие дни", comp: DayCounter, neu: true },
    ],
  },
];

const LS_KEY = "utils_favorites_v1";
const CATS: { id: string; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "law", label: "Юридические" },
  { id: "fin", label: "Финансы и авто" },
  { id: "ref", label: "Справочники" },
];

const FLAT = GROUPS.flatMap((g) => g.tools.map((t) => ({ tool: t, gid: g.id })));
const ALL_TOOLS = GROUPS.flatMap((g) => g.tools);

export default function UtilsTools() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"popular" | "az" | "new">("popular");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [active, setActive] = useState("nds");
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavs(new Set(parsed.filter((x): x is string => typeof x === "string")));
      }
    } catch { /* ignore */ }
  }, []);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  const matches = (t: Tool, gid: string) => {
    if (cat !== "all" && gid !== cat) return false;
    if (favOnly && !favs.has(t.id)) return false;
    const query = q.trim().toLowerCase();
    if (query && !`${t.label} ${t.desc}`.toLowerCase().includes(query)) return false;
    return true;
  };

  const sortTools = (arr: Tool[]) => {
    const a = [...arr];
    if (sort === "az") a.sort((x, y) => x.label.localeCompare(y.label, "ru"));
    else if (sort === "new") a.sort((x, y) => Number(Boolean(y.neu)) - Number(Boolean(x.neu)));
    else a.sort((x, y) => Number(Boolean(y.pop)) - Number(Boolean(x.pop)));
    return a;
  };

  const catCount = (id: string) => (id === "all" ? ALL_TOOLS.length : (GROUPS.find((g) => g.id === id)?.tools.length ?? 0));
  const visibleCount = FLAT.filter((e) => matches(e.tool, e.gid)).length;

  const currentEntry = FLAT.find((e) => e.tool.id === active) ?? FLAT[0];
  const current = currentEntry.tool;
  const Icon = current.icon;

  const related = [
    ...ALL_TOOLS.filter((t) => t.id !== current.id && FLAT.some((e) => e.tool.id === t.id && e.gid === currentEntry.gid)),
    ...ALL_TOOLS.filter((t) => t.pop && t.id !== current.id),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i).slice(0, 5);

  const selectTool = (id: string) => {
    setActive(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4 sm:p-5">
      {/* Панель управления */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по 22 калькуляторам — НДС, алименты, госпошлина…"
            className="w-full bg-gray-50 border border-gray-200 text-sm py-2.5 pl-9 pr-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "popular" | "az" | "new")}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 py-2.5 px-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
          >
            <option value="popular">Популярные</option>
            <option value="az">По алфавиту</option>
            <option value="new">Новые</option>
          </select>
          <button
            type="button"
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl border transition cursor-pointer ${
              favOnly ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favOnly ? "fill-brand-500 text-brand-500" : "text-gray-400"}`} />
            Избранное{favs.size > 0 ? ` · ${favs.size}` : ""}
          </button>
        </div>
      </div>

      {/* Категории */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {CATS.map((c) => {
          const is = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-full border transition cursor-pointer ${
                is ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              {c.label}
              <span className={`text-[10px] font-mono ${is ? "text-brand-500" : "text-gray-400"}`}>{catCount(c.id)}</span>
            </button>
          );
        })}
        <span className="ml-auto text-[11px] font-mono text-gray-400">{visibleCount} из {ALL_TOOLS.length}</span>
      </div>

      {/* Двухколоночная раскладка */}
      <div className="mt-4 grid lg:grid-cols-5 gap-4 items-start">
        {/* Список инструментов */}
        <aside className="lg:col-span-2 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {GROUPS.map((g) => {
              const tools = sortTools(g.tools.filter((t) => matches(t, g.id)));
              if (tools.length === 0) return null;
              return (
                <div key={g.id} className="mb-1.5 last:mb-0">
                  <p className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wide text-gray-500">{g.label}</p>
                  <div className="space-y-1">
                    {tools.map((t) => {
                      const TIcon = t.icon;
                      const isActive = t.id === active;
                      const fav = favs.has(t.id);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 transition ${
                            isActive ? "border-brand-500 bg-brand-50 shadow-soft" : "border-transparent hover:border-gray-200 hover:bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectTool(t.id)}
                            className="flex flex-1 min-w-0 items-center gap-2.5 text-left cursor-pointer"
                          >
                            <span className={`shrink-0 w-8 h-8 rounded-lg border grid place-items-center ${
                              isActive ? "bg-brand-600 border-transparent text-white" : "bg-white border-gray-200 text-gray-500"
                            }`}>
                              <TIcon className="w-4 h-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-xs font-semibold truncate ${isActive ? "text-brand-800" : "text-gray-800"}`}>{t.label}</span>
                              <span className="block text-[10.5px] text-gray-500 truncate">{t.desc}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFav(t.id)}
                            aria-label={fav ? `Убрать «${t.label}» из избранного` : `Добавить «${t.label}» в избранное`}
                            aria-pressed={fav}
                            className="shrink-0 w-7 h-7 rounded-full grid place-items-center transition cursor-pointer hover:bg-brand-50"
                          >
                            <Star className={`w-3.5 h-3.5 ${fav ? "fill-brand-500 text-brand-500" : "text-gray-300"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {visibleCount === 0 && (
              <p className="p-6 text-center text-xs text-gray-500">Ничего не найдено. Измените запрос или категорию.</p>
            )}
          </div>
        </aside>

        {/* Панель активного инструмента */}
        <section ref={panelRef} className="lg:col-span-3 scroll-mt-20">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft overflow-hidden">
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center">
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-extrabold text-gray-900 truncate">{current.label}</h2>
                <p className="text-[11.5px] text-gray-500 truncate">{current.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFav(current.id)}
                aria-label={favs.has(current.id) ? "Убрать из избранного" : "Добавить в избранное"}
                aria-pressed={favs.has(current.id)}
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center transition cursor-pointer hover:bg-brand-50"
              >
                <Star className={`w-4 h-4 ${favs.has(current.id) ? "fill-brand-500 text-brand-500" : "text-gray-300"}`} />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              {active === "docs" && <InnValidator />}
              {current.comp && <current.comp />}
            </div>
            {related.length > 0 && (
              <div className="px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
                <p className="text-[10px] font-mono uppercase tracking-wide text-gray-500 mb-2">С этим также считают</p>
                <div className="flex flex-wrap gap-1.5">
                  {related.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectTool(t.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-700 px-2.5 py-1.5 rounded-full transition cursor-pointer"
                    >
                      <t.icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
