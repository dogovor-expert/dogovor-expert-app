"use client";
import { useState } from "react";
import {
  Landmark, Check, X as XIcon, Calculator, Hash,
  Scale, Percent, Banknote, Home, Baby, FileWarning, TrendingUp, ShieldCheck,
  Briefcase, Wallet, Store, Plane, Car, CarFront, Fingerprint, Hash as HashIcon, CalendarDays, Recycle, Ship, CarTaxiFront, ShieldQuestion
} from "lucide-react";
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

const GROUPS: { id: string; label: string; tools: { id: string; label: string; icon: React.ElementType; desc: string; comp: React.ElementType | null }[] }[] = [
  {
    id: "law",
    label: "Юридические",
    tools: [
      { id: "docs", label: "Быстрые", icon: Landmark, desc: "ИНН, реквизиты", comp: null },
      { id: "nds", label: "НДС", icon: Percent, desc: "Начислить / выделить 22%", comp: Nds },
      { id: "fee", label: "Госпошлина", icon: Scale, desc: "Ст. 333.19 НК", comp: CourtFee },
      { id: "395", label: "395 ГК", icon: Percent, desc: "Пользование чужими деньгами", comp: Interest395 },
      { id: "236", label: "236 ТК", icon: Banknote, desc: "Задержка зарплаты", comp: SalaryDelay236 },
      { id: "zhkh", label: "Пени ЖКХ и капремонт", icon: Home, desc: "Ч. 14, 14.1 ст. 155 ЖК", comp: ZhkhPenalty },
      { id: "alimony", label: "Алименты", icon: Baby, desc: "Доли и пени (СК РФ)", comp: Alimony },
      { id: "penalty", label: "Неустойка", icon: FileWarning, desc: "Договорная и законная", comp: ContractPenalty },
      { id: "index", label: "Индексация", icon: TrendingUp, desc: "Ст. 208 ГПК", comp: Indexation208 },
    ],
  },
  {
    id: "fin",
    label: "Финансы и авто",
    tools: [
      { id: "ipfees", label: "Взносы ИП", icon: Briefcase, desc: "Ст. 430 НК, 1% свыше 300 тыс.", comp: FeesIp },
      { id: "ndfl", label: "НДФЛ", icon: Wallet, desc: "Шкала 13–22%, вычеты", comp: Ndfl },
      { id: "ndflsale", label: "3-НДФЛ: продажа авто", icon: CarTaxiFront, desc: "Вычет 250 тыс., срок владения", comp: NdflSale },
      { id: "usnnpd", label: "УСН / НПД", icon: Store, desc: "Налоги ИП и самозанятых", comp: UsnNpd },
      { id: "vacation", label: "Отпускные", icon: Plane, desc: "29,3 — ст. 139 ТК", comp: Vacation },
      { id: "transport", label: "Транспортный налог", icon: Car, desc: "Ст. 361–362 НК", comp: TransportTax },
      { id: "pdd", label: "Штрафы ГИБДД", icon: CarFront, desc: "Гл. 12 КоАП, скидка 50%", comp: PddFines },
      { id: "utilsb", label: "Утильсбор", icon: Recycle, desc: "ПП № 1291, физлица и юрлица", comp: UtilSb },
      { id: "customs", label: "Растаможка авто", icon: Ship, desc: "Пошлины, акциз, НДС, утильсбор", comp: CustomsDuty },
      { id: "kasko", label: "КАСКО-квиз", icon: ShieldQuestion, desc: "Оценка премии за 30 секунд", comp: KaskoQuote },
    ],
  },
  {
    id: "ref",
    label: "Справочники",
    tools: [
      { id: "valid", label: "Проверка реквизитов", icon: Fingerprint, desc: "СНИЛС, ОГРН, БИК, счёт, карта", comp: Validators },
      { id: "words", label: "Сумма прописью", icon: HashIcon, desc: "Для договоров и расписок", comp: SumWords },
      { id: "days", label: "Сроки и дни", icon: CalendarDays, desc: "Календарные и рабочие дни", comp: DayCounter },
    ],
  },
];

function DocsTools() {
  const [inn, setInn] = useState("");
  const [innResult, setInnResult] = useState<null | { valid: boolean; type: string }>(null);

  const checkInn = () => {
    if (inn.length !== 10 && inn.length !== 12) { setInnResult({ valid: false, type: "Неверная длина" }); return; }
    const n = inn.split("").map(Number);
    if (n.length === 10) {
      const checksum = (n[0] * 2 + n[1] * 4 + n[2] * 10 + n[3] * 3 + n[4] * 5 + n[5] * 9 + n[6] * 4 + n[7] * 6 + n[8] * 8) % 11 % 10;
      setInnResult({ valid: checksum === n[9], type: "Юридическое лицо" });
    } else {
      const s1 = (n[0] * 7 + n[1] * 2 + n[2] * 4 + n[3] * 10 + n[4] * 3 + n[5] * 5 + n[6] * 9 + n[7] * 4 + n[8] * 6 + n[9] * 8) % 11 % 10;
      const s2 = (n[0] * 3 + n[1] * 7 + n[2] * 2 + n[3] * 4 + n[4] * 10 + n[5] * 3 + n[6] * 5 + n[7] * 9 + n[8] * 4 + n[9] * 6 + n[10] * 8) % 11 % 10;
      setInnResult({ valid: s1 === n[10] && s2 === n[11], type: "ИП / Физлицо" });
    }
  };

return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
          <Hash {...{ className: "w-4 h-4 text-indigo-500" }} /> Валидатор ИНН
        </h3>
        <div className="flex gap-2">
          <input type="text" placeholder="10 или 12 цифр" value={inn} maxLength={12}
            onChange={(e) => { setInn(e.target.value.replace(/\D/g, "")); setInnResult(null); }}
            className="flex-1 bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
          />
          <button onClick={checkInn}
            className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
            Проверить
          </button>
        </div>
        {innResult && (
          <div className={`rounded-xl p-3 flex items-center gap-2.5 text-xs ${
            innResult.valid ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {innResult.valid ? <Check className="w-4 h-4 text-emerald-500" /> : <XIcon className="w-4 h-4 text-red-500" />}
            <span>{innResult.valid ? `ИНН корректен (${innResult.type})` : `ИНН некорректен — ${innResult.type}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UtilsPage() {
  const [group, setGroup] = useState("law");
  const [active, setActive] = useState("docs");
  const currentGroup = GROUPS.find((g) => g.id === group)!;
  const current = currentGroup.tools.find((t) => t.id === active)!;
  const Icon = current.icon;

  const selectTool = (gid: string, tid: string) => {
    setGroup(gid);
    setActive(tid);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Калькуляторы и проверки</h1>
          <p className="text-sm text-gray-500">Юридические, финансовые и справочные инструменты</p>
        </div>
      </div>

      <div className="rounded-xl p-3 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
        <span>
          <b>Актуальные данные на {new Date().toLocaleDateString("ru-RU")}:</b> ключевая ставка ЦБ (сейчас 14,00%), взносы ИП 2026 (57 390 ₽), МРОТ 27 093 ₽, НДС 22% (с 2026), ставки по НК/TK/ЖК/СК РФ.
        </span>
      </div>

      {GROUPS.map((g) => (
        <div key={g.id}>
          <p className="text-[10px] font-mono text-gray-400 uppercase mb-2">{g.label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {g.tools.map((t) => {
              const TIcon = t.icon;
              const isActive = group === g.id && active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTool(g.id, t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "border-brand-500 bg-brand-50 shadow-soft"
                      : "border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50"
                  }`}
                >
                  <TIcon className={`w-5 h-5 mb-2 ${isActive ? "text-brand-600" : "text-gray-400"}`} />
                  <p className={`text-xs font-semibold ${isActive ? "text-brand-700" : "text-gray-800"}`}>{t.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-bold text-gray-900">{current.label}</h2>
        </div>
        {active === "docs" && <DocsTools />}
        {current.comp && <current.comp />}
      </div>

      <div className="text-xs text-gray-400 leading-relaxed">
        <p className="font-semibold text-gray-500 mb-1">Как использовать:</p>
        <p>
          • Рассчитайте неустойку или проценты — и сразу составьте претензию или иск по шаблону<br />
          • Проверьте госпошлину перед подачей заявления в суд<br />
          • Расчёты носят справочный характер: окончательные суммы определяет суд/налоговый орган
        </p>
      </div>
    </div>
  );
}