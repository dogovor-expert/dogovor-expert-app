"use client";
import { useMemo, useState } from "react";
import { Calculator, Shield, AlertTriangle, Check } from "lucide-react";
import PampaduWidget from "@/components/osago/PampaduWidget";

const TB_MIN = 1399;
const TB_MAX = 8665;

const KT: Record<string, number> = {
  "Москва": 1.8,
  "Санкт-Петербург": 1.64,
  "Новосибирск": 2.34,
  "Казань": 1.7,
  "Мурманск": 1.78,
  "Сургут": 1.7,
  "Челябинск": 1.77,
  "Бердск": 1.86,
  "Другой регион": 1.0,
};

const KBM: Record<number, number> = {
  13: 0.46, 12: 0.52, 11: 0.57, 10: 0.63, 9: 0.68, 8: 0.74, 7: 0.78,
  6: 0.83, 5: 0.91, 4: 1.0, 3: 1.17, 2: 1.76, 1: 2.25, 0: 2.94,
};

const AGE_GROUPS = ["18-21", "22-24", "25-29", "30-34", "35-39", "40-49", "50-59", "60+"];
const EXP_GROUPS = [1, 2, 3, 5, 7, 10, 15, 999] as const;

const KVS: Record<string, number[]> = {
  "18-21": [2.27, 1.92, 1.84, 1.65, 1.62],
  "22-24": [1.88, 1.72, 1.71, 1.13, 1.10, 1.09],
  "25-29": [1.72, 1.60, 1.54, 1.09, 1.08, 1.07, 1.02],
  "30-34": [1.56, 1.50, 1.48, 1.05, 1.04, 1.01, 0.97, 0.95],
  "35-39": [1.54, 1.47, 1.46, 1.00, 0.97, 0.95, 0.94, 0.93],
  "40-49": [1.50, 1.44, 1.43, 0.96, 0.95, 0.94, 0.93, 0.91],
  "50-59": [1.46, 1.40, 1.39, 0.93, 0.92, 0.91, 0.90, 0.86],
  "60+": [1.43, 1.36, 1.35, 0.91, 0.90, 0.89, 0.88, 0.83],
};

function kvsValue(age: string, expYears: number): number | null {
  const row = KVS[age];
  if (!row) return null;
  const exp = expYears < 1 ? 1 : expYears >= 15 ? 999 : expYears;
  const idx = EXP_GROUPS.findIndex((g) => exp < g);
  if (idx === -1 || idx >= row.length) return null;
  return row[idx];
}

function kmValue(hp: number): number {
  if (hp < 50) return 0.6;
  if (hp < 70) return 1.0;
  if (hp < 100) return 1.1;
  if (hp < 120) return 1.2;
  if (hp < 150) return 1.4;
  return 1.6;
}

export default function OsagoPage() {
  const [form, setForm] = useState({
    city: "Москва",
    hp: "150",
    drivers: "limited",
    period: "12",
    kbmClass: "4",
    age: "30-34",
    experience: "10",
  });

  const result = useMemo(() => {
    const hp = Number(form.hp) || 0;
    const expYears = Number(form.experience) || 0;
    const kvs = kvsValue(form.age, expYears);
    if (!kvs) return null;
    const mult =
      KT[form.city] *
      KBM[Number(form.kbmClass)] *
      kvs *
      (form.drivers === "unlimited" ? 1.94 : 1.0) *
      kmValue(hp) *
      (Number(form.period) / 12 || 1);
    return {
      min: Math.round(TB_MIN * mult),
      max: Math.round(TB_MAX * mult),
      kvs,
      kbm: KBM[Number(form.kbmClass)],
      km: kmValue(hp),
      kt: KT[form.city],
      ko: form.drivers === "unlimited" ? 1.94 : 1.0,
    };
  }, [form]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Калькулятор ОСАГО 2026</h1>
          <p className="text-sm text-gray-500">Расчёт по тарифам Указания Банка России № 7204-У (с 09.12.2025)</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">ОСАГО онлайн — расчёт и оформление</h2>
            <p className="text-xs text-gray-500">Сравните предложения страховых компаний и оформите полис за пару минут.</p>
          </div>
        </div>
        <PampaduWidget />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Регион (КТ)</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {Object.keys(KT).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Мощность, л.с. (КМ)</label>
            <input type="number" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Водители (КО)</label>
            <select value={form.drivers} onChange={(e) => setForm({ ...form, drivers: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              <option value="limited">Только вписанные</option>
              <option value="unlimited">Неограниченное число</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Срок (КС)</label>
            <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              <option value="12">12 месяцев (КС 1,0)</option>
              <option value="6">6 месяцев (КС 0,7)</option>
              <option value="3">3 месяца (КС 0,5)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Класс КБМ (безаварийность)</label>
            <select value={form.kbmClass} onChange={(e) => setForm({ ...form, kbmClass: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {Object.entries(KBM).sort((a, b) => Number(b[0]) - Number(a[0])).map(([k, v]) => (
                <option key={k} value={k}>Класс {k} — {v.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Возраст (КВС)</label>
            <select value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Стаж вождения, полных лет</label>
            <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>

        {result ? (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-500">ТБ × КТ × КБМ × КВС × КО × КМ × КС</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {result.min.toLocaleString("ru-RU")} – {result.max.toLocaleString("ru-RU")} ₽
            </p>
            <p className="text-[11px] text-gray-600">Диапазон: базовая ставка страховщика может отличаться от минимальной в пределах коридора (1 399–8 665 ₽).</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600">
              <p>КТ: <b>{result.kt.toFixed(2)}</b></p>
              <p>КБМ: <b>{result.kbm.toFixed(2)}</b></p>
              <p>КВС: <b>{result.kvs.toFixed(2)}</b></p>
              <p>КМ: <b>{result.km.toFixed(2)}</b></p>
              <p>КО: <b>{result.ko.toFixed(2)}</b></p>
              <p>КС: <b>{Number(form.period) / 12}</b></p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            Для возраста {form.age} с таким стажем коэффициент КВС не предусмотрен (нет водителей моложе 18 лет).
          </p>
        )}

        <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
          <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Тарифы — Указание Банка России № 7204-У от 09.10.2025 (в силе с 09.12.2025), КТ Новосибирской области — по № 7349-У (с 22.06.2026). Класс КБМ: 3 — новый водитель, 4 — без аварий 1 год, 13 — максимальная скидка. Точную цену называет страховая компания — расчёт ориентировочный.
        </p>
      </div>
    </div>
  );
}
