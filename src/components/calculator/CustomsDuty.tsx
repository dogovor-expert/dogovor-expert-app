"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, Ship, PhoneCall, ShieldCheck, RefreshCw } from "lucide-react";
import { calcImportCosts, FX_RATES, type ImportScenario, type TaxDutyRow } from "@/lib/legal/autoDuty";
import { fmtMoney } from "@/lib/legal/calc";
import { formatPhoneRu } from "@/lib/format";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";
import { track, goals } from "@/lib/analytics";

const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY;
const SmartCaptchaWidget = dynamic(() => import("@/components/auth/SmartCaptcha"), {
  ssr: false,
});

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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface RateInfo {
  rates: Record<string, number>;
  source: "cbr" | "fallback";
  actualDate?: string;
}

export default function CustomsDuty() {
  const [scenario, setScenario] = useState<ImportScenario["subject"]>("individual");
  const [fuel, setFuel] = useState<ImportScenario["fuel"]>("petrol");
  const [age, setAge] = useState(2);
  const [volume, setVolume] = useState("");
  const [power, setPower] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ rows: TaxDutyRow[]; total: number; carWithDuty: number } | null>(null);
  const [error, setError] = useState("");

  const [regDate, setRegDate] = useState(todayIso());
  const [rate, setRate] = useState<RateInfo | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const loadRate = useCallback(async (iso: string) => {
    setRateLoading(true);
    try {
      const r = await fetch(`/api/customs-rate?date=${encodeURIComponent(iso)}`);
      if (!r.ok) throw new Error("bad status");
      const json = await r.json();
      setRate({ rates: json.rates, source: json.source, actualDate: json.actualDate });
    } catch {
      setRate({ rates: { ...FX_RATES }, source: "fallback" });
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => { loadRate(regDate); }, [regDate, loadRate]);

  const eur = rate?.rates?.EUR ?? FX_RATES.EUR;
  const usd = rate?.rates?.USD ?? FX_RATES.USD;

  const [service, setService] = useState<(typeof SERVICES)[number]["id"]>("docs");
  const [brand, setBrand] = useState("");
  const [phone, setPhone] = useState("");
  const [leadErr, setLeadErr] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // SmartCaptcha для лид-формы (сервер требует captchaToken, когда настроен).
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const captchaRequired = Boolean(CAPTCHA_SITE_KEY);
  const [consent, setConsent] = useState(false);

  const calc = () => {
    const v = parseFloat(volume);
    if (isNaN(v) || v <= 0) { setError("Укажите объём двигателя"); return; }
    const p = parseFloat(power);
    if (isNaN(p) || p <= 0) { setError("Укажите мощность двигателя"); return; }
    const vl = parseFloat(value);
    if (isNaN(vl) || vl <= 0) { setError("Укажите стоимость автомобиля"); return; }
    const s: ImportScenario = { subject: scenario, fuel, ageYears: age, volumeCm3: v, powerHp: p, valueRub: vl };
    setResult(calcImportCosts(s, rate?.rates));
    setError("");
  };

  const sendLead = async () => {
    const digits = phone.replace(/\D/g, "");
    if (!brand.trim()) { setLeadErr("Укажите марку и модель автомобиля"); return; }
    if (digits.length < 10) { setLeadErr("Укажите корректный номер телефона"); return; }
    if (!consent) { setLeadErr("Нужно согласие на обработку персональных данных"); return; }
    if (captchaRequired && !captchaToken) { setLeadErr("Подтвердите, что вы не робот"); return; }
    setSending(true);
    setLeadErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, brand, phone, captchaToken }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json?.error === "phone is required" ? "Укажите корректный номер телефона"
          : /робот|Капча/i.test(String(json?.error ?? "")) ? "Капча не пройдена — попробуйте ещё раз"
          : "Не удалось отправить заявку. Попробуйте ещё раз";
        setLeadErr(msg);
        // Токен SmartCaptcha одноразовый — после ошибки перевыпускаем виджет.
        setCaptchaToken(null);
        setCaptchaNonce((n) => n + 1);
        setSending(false);
        return;
      }
      setSent(true);
      setSending(false);
      track(goals.leadSubmitted, { service });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="cd-regdate" className="text-[10px] font-mono text-gray-600">Дата регистрации таможенной декларации</label>
            <input id="cd-regdate" type="date" value={regDate} max={todayIso()} onChange={(e) => { setRegDate(e.target.value || todayIso()); setResult(null); }}
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
          </div>
          <div className="flex items-end">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              По ст. 52 ТК ЕАЭС пошлина пересчитывается по курсу ЦБ на день регистрации
              декларации (для выходных — курс предыдущего рабочего дня).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={calc}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
            Рассчитать таможенные платежи
          </button>
          <button onClick={() => loadRate(regDate)} disabled={rateLoading}
            title="Обновить курс ЦБ"
            aria-label="Обновить курс ЦБ"
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600 transition cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${rateLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-[10px] text-gray-500">
          {rateLoading
            ? "Загружаем курс ЦБ…"
            : `Курс для расчёта: 1 € = ${eur.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽${rate?.source === "fallback" ? " (справочно — проверьте на cbr.ru)" : ""}`}
        </p>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-mono text-gray-600">
              Курс ЦБ на {new Date(regDate + "T00:00:00").toLocaleDateString("ru-RU")}: 1 € = {eur.toLocaleString("ru-RU", { maximumFractionDigits: 4 })} ₽ · 1 $ = {usd.toLocaleString("ru-RU", { maximumFractionDigits: 4 })} ₽
              {rate?.source === "cbr" ? " · cbr.ru" : " · справочно"}
            </p>
            <SaveCalcButton
              kind="customs"
              title={`Растаможка — ${fmt(result.total)} ₽`}
              lines={[
                `Ставка: ${{ individual: "физлицо", individualResale: "физлицо (перепродажа)", legal: "юрлицо" }[scenario]} · топливо: ${{ petrol: "бензин", diesel: "дизель", electric: "электро", parallelHybrid: "паралл. гибрид", sequentialHybrid: "послед. гибрид" }[fuel]}`,
                `Возраст авто: ${age === 0 ? "до 3 лет" : age <= 5 ? "3–5 лет" : "старше 5 лет"}`,
                `Объём: ${volume} см³ · Мощность: ${power} л.с. · Стоимость: ${value} €`,
                `Дата регистрации декларации: ${regDate} (курс ЦБ: 1 € = ${eur.toFixed(4).replace(".", ",")} ₽${rate?.source === "fallback" ? ", справочно" : ""})`,
                ...result.rows.map((r) => `${r.name}: ${fmt(r.amount)} ₽ (${r.formula})`),
                `ВСЕГО: ${fmt(result.total)} ₽`,
                `Цена авто с платежами: ${fmt(result.carWithDuty)} ₽`,
                "",
                "Расчёт: dogovor.expert. Ставки — ЕТТ ТС, курс — ст. 52 ТК ЕАЭС (день регистрации ДТ).",
              ]}
            />
          </div>
          {rate?.source === "fallback" && (
            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
              Курс ЦБ временно недоступен — использован справочный снапшот. Перед подачей декларации
              проверьте официальный курс на дату регистрации на cbr.ru.
            </p>
          )}
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
              <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value ? formatPhoneRu(e.target.value) : "")}
                placeholder="Телефон (+7 …)"
                className="w-full bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              {leadErr && <p className="text-[11px] text-red-600">{leadErr}</p>}
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-brand-600 cursor-pointer" />
                <span className="text-[10px] text-gray-600 leading-snug">
                  Согласен на обработку персональных данных (тел.: {"+"} номер, марка авто) в целях ответа на заявку —
                  {" "}<Link href="/privacy" className="underline text-brand-600 hover:text-brand-700">политика</Link>
                </span>
              </label>
              {captchaRequired && (
                <SmartCaptchaWidget key={captchaNonce} onToken={setCaptchaToken} />
              )}
              <button onClick={sendLead} disabled={sending || !consent || (captchaRequired && !captchaToken)}
                className="w-full py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold text-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> {sending ? "Отправка…" : captchaRequired && !captchaToken ? "Подтвердите капчу" : "Оставить заявку"}
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