"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, ShieldQuestion, PhoneCall } from "lucide-react";
import { fmtMoney } from "@/lib/legal/calc";
import { formatPhoneRu } from "@/lib/format";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";
import { track, goals } from "@/lib/analytics";

const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY;
const SmartCaptchaWidget = dynamic(() => import("@/components/auth/SmartCaptcha"), {
  ssr: false,
});

function labelOf<T extends { id: string; label: string }>(arr: readonly T[], id: string): string {
  return arr.find((x) => x.id === id)?.label ?? id;
}

const KASKO_READY = false;

const AGES = [
  { id: "young", label: "18–24", adj: 2 },
  { id: "mid", label: "25–35", adj: 0.5 },
  { id: "adult", label: "36–50", adj: 0 },
  { id: "senior", label: "50+", adj: -0.5 },
] as const;

const EXPERIENCES = [
  { id: "low", label: "до 3 лет", adj: 1.5 },
  { id: "mid", label: "3–10 лет", adj: 0.5 },
  { id: "high", label: "10+ лет", adj: 0 },
] as const;

const PRICES = [
  { id: "p3", label: "1–3 млн ₽", value: 2000000 },
  { id: "p5", label: "3–5 млн ₽", value: 4000000 },
  { id: "p8", label: "5–8 млн ₽", value: 6500000 },
  { id: "p8plus", label: "свыше 8 млн ₽", value: 10000000 },
] as const;

const CITIES = [
  { id: "cap", label: "Москва / СПб", adj: 1 },
  { id: "region", label: "Регион", adj: 0 },
] as const;

const FRANCHISES = [
  { id: "none", label: "Без франшизы", adj: 0 },
  { id: "f20", label: "20 000 ₽", adj: -0.8 },
  { id: "f50", label: "50 000 ₽", adj: -1.8 },
  { id: "f100", label: "100 000 ₽", adj: -2.8 },
] as const;

export default function KaskoQuote() {
  const [age, setAge] = useState<(typeof AGES)[number]["id"]>("adult");
  const [exp, setExp] = useState<(typeof EXPERIENCES)[number]["id"]>("mid");
  const [price, setPrice] = useState<(typeof PRICES)[number]["id"]>("p5");
  const [city, setCity] = useState<(typeof CITIES)[number]["id"]>("region");
  const [fran, setFran] = useState<(typeof FRANCHISES)[number]["id"]>("none");
  const [result, setResult] = useState<{ min: number; max: number; rate: number; franLabel: string | null } | null>(null);

  const [phone, setPhone] = useState("");
  const [brand, setBrand] = useState("");
  const [leadErr, setLeadErr] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const captchaRequired = Boolean(CAPTCHA_SITE_KEY);
  const [consent, setConsent] = useState(false);

  const calc = () => {
    const p = PRICES.find((x) => x.id === price)!;
    const adj =
      AGES.find((x) => x.id === age)!.adj +
      EXPERIENCES.find((x) => x.id === exp)!.adj +
      CITIES.find((x) => x.id === city)!.adj +
      FRANCHISES.find((x) => x.id === fran)!.adj;
    const rate = Math.min(11, Math.max(2.5, 6.5 + adj));
    const min = Math.round(p.value * (rate - 0.8) / 100);
    const max = Math.round(p.value * (rate + 0.8) / 100);
    const franObj = FRANCHISES.find((x) => x.id === fran)!;
    setResult({ min, max, rate: Math.round(rate * 10) / 10, franLabel: franObj.id === "none" ? null : franObj.label });
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
        body: JSON.stringify({ service: "kasko", brand, phone, captchaToken }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json?.error === "phone is required" ? "Укажите корректный номер телефона"
          : /робот|Капча/i.test(String(json?.error ?? "")) ? "Капча не пройдена — попробуйте ещё раз"
          : "Не удалось отправить заявку. Попробуйте ещё раз";
        setLeadErr(msg);
        setCaptchaToken(null);
        setCaptchaNonce((n) => n + 1);
        setSending(false);
        return;
      }
      setSent(true);
      setSending(false);
      track(goals.leadSubmitted, { service: "kasko" });
    } catch {
      setLeadErr("Сервис временно недоступен. Попробуйте ещё раз");
      setSending(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {(
          [
            { label: "Ваш возраст", opts: AGES, val: age, set: setAge },
            { label: "Стаж вождения", opts: EXPERIENCES, val: exp, set: setExp },
            { label: "Стоимость автомобиля", opts: PRICES, val: price, set: setPrice },
            { label: "Регион", opts: CITIES, val: city, set: setCity },
            { label: "Франшиза", opts: FRANCHISES, val: fran, set: setFran },
          ] as const
        ).map((q) => (
          <div key={q.label} className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">{q.label}</label>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${q.opts.length}, minmax(0, 1fr))` }}>
              {q.opts.map((o) => (
                <button key={o.id} onClick={() => { q.set(o.id as never); setResult(null); }}
                  className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${q.val === o.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Оценить КАСКО
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">Оценка КАСКО — тариф {result.rate.toLocaleString("ru-RU")}%</span>
            </div>
            <SaveCalcButton
              kind="kasko"
              title={`Оценка КАСКО — ${fmt(result.min)}–${fmt(result.max)} ₽/год`}
              lines={[
                `Возраст водителя: ${labelOf(AGES, age)} · Стаж: ${labelOf(EXPERIENCES, exp)}`,
                `Стоимость авто: ${labelOf(PRICES, price)} · Регион: ${labelOf(CITIES, city)}`,
                `Франшиза: ${result.franLabel ?? "без франшизы"}`,
                `Оценочный тариф: ${result.rate.toLocaleString("ru-RU")}% от стоимости авто`,
                `Диапазон годовой премии: ${fmt(result.min)} – ${fmt(result.max)} ₽`,
                "",
                "Оценка dogovor.expert по усреднённым рыночным тарифам. Точную цену определяет страховая компания.",
              ]}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(result.min)} – {fmt(result.max)} ₽/год</p>
          <p className="text-[11px] text-gray-600">Диапазон по рынку: {fmt(result.min)}…{fmt(result.max)} ₽ в год. Точный тариф устанавливает страховая компания.</p>
          {result.franLabel && (
            <p className="text-[11px] text-gray-600">
              Учтена франшиза <b>{result.franLabel}</b>: при мелком ущербе в пределах франшизы выплату не получаете, но премия ниже.
            </p>
          )}
        </div>
      )}

      {KASKO_READY ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
          <p className="text-xs font-bold text-brand-700">Подобрать КАСКО по лучшей цене</p>
          {sent ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-[11px] text-emerald-800">Заявка принята. Подберём КАСКО от 5 страховых — свяжемся в течение рабочего дня.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="Марка и модель"
                className="w-full bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value ? formatPhoneRu(e.target.value) : "")}
                placeholder="Телефон (+7 …)"
                className="w-full bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              {leadErr && <p className="text-[11px] text-red-600">{leadErr}</p>}
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-brand-600 cursor-pointer" />
                <span className="text-[10px] text-gray-600 leading-snug">
                  Согласен на обработку персональных данных (тел.: {"+"} номер, марка авто) для подбора КАСКО —
                  {" "}<Link href="/privacy" className="underline text-brand-600 hover:text-brand-700">политика</Link>
                </span>
              </label>
              {captchaRequired && (
                <SmartCaptchaWidget key={captchaNonce} onToken={setCaptchaToken} />
              )}
              <button onClick={sendLead} disabled={sending || !consent || (captchaRequired && !captchaToken)}
                className="w-full py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold text-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> {sending ? "Отправка…" : captchaRequired && !captchaToken ? "Подтвердите капчу" : "Подобрать КАСКО"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/40 p-6 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600 text-white text-[11px] font-bold uppercase tracking-widest">
            Скоро
          </span>
          <p className="text-sm font-bold text-gray-800">Подбор КАСКО у партнёров-страховщиков</p>
          <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed">
            Оценка премии уже работает. Подбор полиса от нескольких страховых компаний — запустим в ближайшее время.
          </p>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <ShieldQuestion className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        КАСКО — добровольное страхование от ущерба и хищения. Тариф зависит от возраста и стажа водителя, стоимости авто, региона и франшизы: в среднем 3–11% от стоимости авто в год. Расчёт оценочный, окончательную цену определяет страховая компания.
      </p>
    </div>
  );
}