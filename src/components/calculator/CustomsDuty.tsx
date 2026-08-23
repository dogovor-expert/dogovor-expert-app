"use client";
import { useState } from "react";
import { Check, Ship, PhoneCall, ShieldCheck } from "lucide-react";
import { calcImportCosts, FX_RATES, type ImportScenario, type TaxDutyRow } from "@/lib/legal/autoDuty";
import { fmtMoney } from "@/lib/legal/calc";

const SCENARIOS = [
  { id: "individual", label: "Физлицо · для себя" },
  { id: "individualResale", label: "Физлицо · перепродажа" },
  { id: "legal", label: "Юрлицо" },
] as const;

const FUELS = [
  { id: "petrol", label: "Бензин" },
  { id: "diesel", label: "Дизель" },
  { id: "parallelHybrid", label: "Гибрид" },
  { id: "electric", label: "Электромобиль" },
] as const;

const AGES = [
  { id: 2, label: "До 3 лет" },
  { id: 4, label: "3–5 лет" },
  { id: 6, label: "5–7 лет" },
  { id: 10, label: "Старше 7 лет" },
] as const;

const SERVICES = [
  { id: "docs", price: 3990, title: "Комплект документов", desc: "ЭПТС, СБКТС, поручение, декларация" },
  { id: "full", price: 9990, title: "Под ключ", desc: "Весь процесс с сопровождением и подачей" },
] as const;

const LEAD_MODULE_READY = true;

export default function CustomsDuty() {
  const [scenario, setScenario] = useState<ImportScenario["subject"]>("individual");
  const [fuel, setFuel] = useState<ImportScenario["fuel"]>("petrol");
  const [age, setAge] = useState(2);
  const [volume, setVolume] = useState("");
  const [power, setPower] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ rows: TaxDutyRow[]; total: number; carWithDuty: number } | null>(null);
  const [error, setError] = useState("");

  const [service, setService] = useState<(typeof SERVICES)[number]["id"]>("docs");
  const [brand, setBrand] = useState("");
  const [phone, setPhone] = useState("");
  const [leadErr, setLeadErr] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const calc = () => {
    const v = parseFloat(volume);
    if (isNaN(v) || v <= 0) { setError("Укажите объём двигателя"); return; }
    const p = parseFloat(power);
    if (isNaN(p) || p <= 0) { setError("Укажите мощность двигателя"); return; }
    const vl = parseFloat(value);
    if (isNaN(vl) || vl <= 0) { setError("Укажите стоимость автомобиля"); return; }
    const s: ImportScenario = { subject: scenario, fuel, ageYears: age, volumeCm3: v, powerHp: p, valueRub: vl };
    setResult(calcImportCosts(s));
    setError("");
  };

  const sendLead = async () => {
    const digits = phone.replace(/\D/g, "");
    if (!brand.trim()) { setLeadErr("Укажите марку и модель автомобиля"); return; }
    if (digits.length < 10) { setLeadErr("Укажите корректный номер телефона"); return; }
    setSending(true);
    setLeadErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, brand, phone }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setLeadErr(json?.error === "phone is required" ? "Укажите корректный номер телефона" : "Не удалось отправить заявку. Попробуйте ещё раз");
        setSending(false);
        return;
      }
      setSent(true);
      setSending(false);
    } catch {
      setLeadErr("Сервис временно недоступен. Попробуйте ещё раз");
      setSending(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Кто ввозит автомобиль</label>
          <div className="grid grid-cols-3 gap-1.5">
            {SCENARIOS.map((s) => (
              <button key={s.id} onClick={() => { setScenario(s.id); setResult(null); }}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${scenario === s.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Тип двигателя</label>
          <div className="grid grid-cols-4 gap-1.5">
            {FUELS.map((f) => (
              <button key={f.id} onClick={() => { setFuel(f.id); setResult(null); }}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${fuel === f.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Возраст автомобиля</label>
          <div className="grid grid-cols-4 gap-1.5">
            {AGES.map((a) => (
              <button key={a.id} onClick={() => { setAge(a.id); setResult(null); }}
                className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${age === a.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Объём (см³)</label>
            <input type="number" min="0" value={volume} onChange={(e) => setVolume(e.target.value)}
              placeholder="1996"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Мощность (л.с.)</label>
            <input type="number" min="0" value={power} onChange={(e) => setPower(e.target.value)}
              placeholder="150"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Стоимость (₽)</label>
            <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)}
              placeholder="2500000"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
        </div>
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Рассчитать таможенные платежи
        </button>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-600">Расчёт по курсам ЦБ: 1 € = {fmt(FX_RATES.EUR)} ₽ · 1 $ = {fmt(FX_RATES.USD)} ₽</span>
          </div>
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
            {result.rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-800">{r.name}</p>
                  <p className="text-[10px] text-gray-600 truncate">{r.formula}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${r.amount === 0 ? "text-gray-600" : "text-gray-900"}`}>{fmt(r.amount)} ₽</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
            <p className="text-[11px] font-semibold text-indigo-800">Всего платежей</p>
            <p className="text-lg font-bold text-indigo-700">{fmt(result.total)} ₽</p>
          </div>
          <p className="text-[11px] text-gray-600">
            Автомобиль с учётом платежей: <b>{fmt(result.carWithDuty)} ₽</b>
          </p>
        </div>
      )}

      {LEAD_MODULE_READY ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <p className="text-xs font-bold text-brand-700">Растаможка под ключ — оформление документов</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SERVICES.map((s) => (
              <button key={s.id} onClick={() => { setService(s.id); setSent(false); }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${service === s.id ? "border-brand-500 bg-white" : "border-gray-200 bg-white/60 hover:border-brand-300"}`}>
                <p className="text-[11px] font-bold text-gray-800">{s.title}</p>
                <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{s.desc}</p>
                <p className="text-xs font-bold text-brand-600 mt-1">{fmt(s.price)} ₽</p>
              </button>
            ))}
          </div>
          {sent ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-[11px] text-emerald-800">Заявка принята. Специалист свяжется с вами в течение рабочего дня и уточнит детали по выбранному тарифу.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="Марка и модель (например, Toyota Camry 2024)"
                className="w-full bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон (+7 …)"
                className="w-full bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              {leadErr && <p className="text-[11px] text-red-600">{leadErr}</p>}
              <button onClick={sendLead} disabled={sending}
                className="w-full py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold text-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> {sending ? "Отправка…" : "Оставить заявку"}
              </button>
            </div>
          )}
          <p className="text-[10px] text-gray-600">Оформим заявление, оплату пошлины, а для коммерческого ввоза — ЭПТС и СБКТС. Не является публичной офертой.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/40 p-6 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600 text-white text-[11px] font-bold uppercase tracking-widest">
            Скоро
          </span>
          <p className="text-sm font-bold text-gray-800">Растаможка под ключ — оформление документов</p>
          <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed">
            Расчёт уже работает. Оформление документов и подача на таможню — запустим в ближайшее время.
          </p>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Ship className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Пошлины — по единому таможенному тарифу: физлица до 3 лет — от стоимости (54% при цене до 8 500 €, далее 48% с минимумом €/см³), старше 3 лет — 1,5–5,7 €/см³. Юрлица — 15% (до 3 лет) / 20% (3–7 лет) с минимальной пошлиной, старше 7 лет — по объёму. НДС 22% и акциз (ст. 193 НК) — для юрлиц и перепродажи. Таможенный сбор — 11 ступеней: 775–30 000 ₽ (ПП № 342).
      </p>
    </div>
  );
}