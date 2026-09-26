"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";

interface FormState {
  vin: string;
  epts: string;
  email: string;
  phone: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
const EPTS_RE = /^[0-9]{15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,15}$/;

const EMPTY: FormState = { vin: "", epts: "", email: "", phone: "" };

function validate(v: FormState): Errors {
  const e: Errors = {};
  if (!VIN_RE.test(v.vin.trim().toUpperCase())) e.vin = "VIN — 17 символов (без I, O, Q)";
  if (!EPTS_RE.test(v.epts.trim())) e.epts = "Номер ЭПТС — 15 цифр";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Укажите корректный email";
  if (!PHONE_RE.test(v.phone.replace(/[^0-9+]/g, ""))) e.phone = "Укажите корректный телефон";
  return e;
}

export default function EptsOrder() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "redirecting" | "paid">("idle");
  const [serverError, setServerError] = useState("");

  // Возврат со страницы ЮKassa: return_url уводит на /epts?success=1
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("success") === "1") {
      setStatus("paid");
    }
  }, []);

  const set = (key: keyof FormState, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setServerError("");
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/epts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: values.vin.trim().toUpperCase(),
          epts: values.epts.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setServerError(data?.error || "Не удалось отправить заявку. Попробуйте ещё раз.");
        setStatus("idle");
        return;
      }
      const data = (await res.json().catch(() => null)) as { confirmation_url?: string } | null;
      if (!data?.confirmation_url) {
        setServerError("Не удалось получить ссылку на оплату. Попробуйте ещё раз.");
        setStatus("idle");
        return;
      }
      setStatus("redirecting");
      window.location.assign(data.confirmation_url);
    } catch {
      setServerError("Сеть недоступна. Проверьте соединение и повторите.");
      setStatus("idle");
    }
  };

  if (status === "paid") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Оплата получена</h3>
        <p className="mt-1 text-sm text-gray-600">
          Заявка на выписку из ЭПТС оплачена. Оператор оформляет документ и пришлёт готовый PDF
          на указанный email — обычно в течение 10 минут в рабочее время.
        </p>
      </div>
    );
  }

  if (status === "redirecting") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-soft">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-brand-600" aria-hidden />
        <h3 className="text-base font-bold text-gray-900">Перенаправляем на оплату</h3>
        <p className="mt-1 text-sm text-gray-600">
          Заявка отправлена. Открываем защищённую страницу оплаты ЮKassa…
        </p>
      </div>
    );
  }

  const field = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    inputProps: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-800">{label}</span>
      <input
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[key])}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
          errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        }`}
        {...inputProps}
      />
      {errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]}</span>}
    </label>
  );

  return (
    <form id="epts-order-form" aria-label="Заявка на выписку из ЭПТС с оплатой" onSubmit={(ev) => { void submit(ev); }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft" noValidate>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Заявка на выписку</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Оператор онлайн
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {field("vin", "VIN автомобиля", "XTA219000K0123456", { maxLength: 17, style: { textTransform: "uppercase", fontFamily: "var(--font-jetbrains), monospace" } })}
        {field("epts", "Номер ЭПТС", "1640000123456789", { maxLength: 15, inputMode: "numeric" })}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {field("email", "Email для документа", "you@mail.ru", { type: "email", inputMode: "email" })}
        {field("phone", "Телефон для связи", "+7 (999) 123-45-67", { type: "tel", inputMode: "tel" })}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-gray-200 pt-4">
        <div>
          <div className="text-sm text-gray-500 line-through">1 200 ₽</div>
          <div className="text-2xl font-extrabold tracking-tight text-gray-900">
            800 <span className="text-base font-semibold text-gray-500">₽</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5 disabled:opacity-70"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CreditCard className="h-4 w-4" aria-hidden />}
          {status === "sending" ? "Отправляем…" : "Оставить заявку и оплатить"}
        </button>
      </div>

      {serverError && <p className="mt-3 text-xs text-red-600">{serverError}</p>}

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-gray-500">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-gray-500" aria-hidden />
        Оплата 800 ₽ проходит на защищённой странице ЮKassa сразу после отправки заявки. Отправляя
        заявку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}