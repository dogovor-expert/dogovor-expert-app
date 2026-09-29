"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Lock } from "lucide-react";
import { formatRub } from "@/lib/pricing";
import { AI_PLAN_PRICE_RUB, AI_PLAN_QUESTIONS } from "@/lib/ai/pricing";
import { cn } from "@/lib/utils";

/** CSRF-токен для POST-запросов (тот же контракт, что у /api/ai/topup). */
async function fetchCsrf(): Promise<string> {
  const res = await fetch("/api/csrf", { credentials: "same-origin" });
  const data = (await res.json().catch(() => ({}))) as { token?: string };
  return data.token ?? "";
}

interface HomePricingProps {
  totalTemplates: number;
  proPrice: number;
  proOldPrice: number | null;
}

type PlanKey = "free" | "pro" | "ai";

// Раньше здесь была локальная копия cn() без tailwind-merge, из-за чего
// конфликтующие фоновые классы не вытесняли друг друга. Используем общий
// помощник — он разрешает конфликты (см. src/lib/utils.ts).

/**
 * Тарифы на главной: бесплатно, PRO (299 ₽), AI-юрист (690 ₽).
 *
 * Раньше карточки были обычными <Link> на /billing и /ai-yurist, из-за чего
 * у посетителя не было кнопки покупки: по клику его сначала выкидывало на
 * страницу логина, а сам платёжный сценарий был спрятан на /billing.
 * Теперь оплата запускается прямо отсюда, а гость без аккаунта получает
 * понятный вход/регистрацию с возвратом обратно к тарифу.
 */
export default function HomePricing({ totalTemplates, proPrice, proOldPrice }: HomePricingProps) {
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const buy = useCallback(async (plan: Exclude<PlanKey, "free">) => {
    setMsg(null);
    setBusy(plan);
    try {
      const token = await fetchCsrf();
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ plan }),
      });
      const d = (await res.json().catch(() => null)) as
        | { confirmation_url?: string; error?: string; detail?: string }
        | null;
      if (d?.confirmation_url) {
        window.location.href = d.confirmation_url;
        return;
      }
      if (res.status === 401 || d?.error === "unauthorized") {
        // Гость: уводим на вход/регистрацию и возвращаем обратно к тарифам.
        const back = encodeURIComponent("/#pricing");
        setMsg({ kind: "info", text: "Войдите или зарегистрируйтесь, чтобы оформить подписку." });
        window.setTimeout(() => {
          window.location.href = `/login?next=${back}`;
        }, 1200);
      } else if (res.status === 503) {
        setMsg({ kind: "error", text: "Оплата временно недоступна. Попробуйте позже." });
      } else {
        setMsg({
          kind: "error",
          text: d?.detail
            ? `Не удалось создать платёж: ${d.detail}`
            : "Не удалось создать платёж. Попробуйте позже.",
        });
      }
    } catch {
      setMsg({ kind: "error", text: "Сервис временно недоступен. Попробуйте ещё раз." });
    } finally {
      setBusy(null);
    }
  }, []);

  const plans = [
    {
      key: "free" as const,
      name: "Бесплатно",
      price: "0 ₽",
      period: "навсегда",
      desc: "Чтобы попробовать конструктор и скачать первый документ.",
      features: [
        `${totalTemplates}+ шаблонов документов`,
        "Экспорт в PDF",
        "23 правовых калькулятора",
        "Без регистрации и карты",
      ],
      cta: "Начать бесплатно",
      href: "/builder",
      highlighted: false,
    },
    {
      key: "pro" as const,
      name: "PRO",
      price: formatRub(proPrice),
      period: "в месяц",
      desc: "Для тех, кто регулярно работает с документами и подписью.",
      features: [
        `Все ${totalTemplates}+ шаблонов`,
        "Экспорт в DOCX (Word)",
        "УКЭП-подписание в браузере",
        "OCR и конвертеры файлов",
        "DaData-автозаполнение",
        "Приоритетная поддержка",
      ],
      cta: "Оформить PRO",
      href: "/billing",
      highlighted: true,
      oldPrice: proOldPrice !== null ? formatRub(proOldPrice) : null,
    },
    {
      key: "ai" as const,
      name: "AI-юрист",
      price: formatRub(AI_PLAN_PRICE_RUB),
      period: "в месяц",
      desc: "Ответы по действующим законам со ссылками на статьи.",
      features: [
        `${AI_PLAN_QUESTIONS} вопросов в месяц`,
        "Цитаты статей НПА",
        "Разбор договоров и документов",
        "Экспорт диалога в PDF и DOCX",
        "Приоритетная поддержка",
      ],
      cta: "Оформить AI-юриста",
      href: "/ai-yurist",
      highlighted: false,
    },
  ];
  return (
    <section id="pricing" className="scroll-mt-4 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Тарифы</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Прозрачные цены без скрытых платежей
          </h2>
          <p className="mt-4 text-lg text-slate-500">Отменить подписку можно в любой момент в один клик.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-8",
                plan.highlighted
                  ? "border-indigo-600 bg-gradient-to-b from-indigo-600 to-blue-700 text-white shadow-2xl shadow-indigo-600/30 lg:-translate-y-4"
                  : "border-slate-200 bg-white shadow-sm",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-md">
                  Популярный выбор
                </span>
              )}
              <h3 className={cn("text-lg font-bold", plan.highlighted ? "text-white" : "text-slate-900")}>
                {plan.name}
              </h3>
              <p className={cn("mt-1 text-sm", plan.highlighted ? "text-indigo-100" : "text-slate-500")}>
                {plan.desc}
              </p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className={cn("text-4xl font-extrabold tracking-tight", plan.highlighted ? "text-white" : "text-slate-900")}>
                  {plan.price}
                </span>
                <span className={cn("text-sm font-medium", plan.highlighted ? "text-indigo-100" : "text-slate-400")}>
                  {plan.period}
                </span>
                {plan.oldPrice && (
                  <span className="ml-2 text-lg font-semibold text-indigo-200 line-through">{plan.oldPrice}</span>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn("mt-0.5 h-4 w-4 shrink-0", plan.highlighted ? "text-amber-300" : "text-emerald-500")}
                    />
                    <span className={plan.highlighted ? "text-indigo-50" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.key === "free" ? (
                <Link
                  href={plan.href}
                  className={cn(
                    "mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
                    "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { void buy(plan.key); }}
                  disabled={busy !== null}
                  aria-busy={busy === plan.key}
                  className={cn(
                    "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-70",
                    plan.highlighted
                      ? "bg-white text-indigo-700 shadow-lg hover:bg-indigo-50"
                      : "bg-indigo-600 text-white shadow-lg hover:bg-indigo-500",
                  )}
                >
                  {busy === plan.key ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Создаём платёж…
                    </>
                  ) : (
                    <>
                      {plan.cta} · {plan.price}
                    </>
                  )}
                </button>
              )}

              {plan.key !== "free" && (
                <p
                  className={cn(
                    "mt-3 flex items-start justify-center gap-1.5 text-center text-[11px]",
                    plan.highlighted ? "text-indigo-100" : "text-slate-500",
                  )}
                >
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  Оплата картой МИР, Visa, Mastercard или СБП через ЮKassa. Отмена в любой момент.
                </p>
              )}
            </div>
          ))}
        </div>

        {msg && (
          <p
            role="status"
            aria-live="polite"
            className={cn(
              "mx-auto mt-6 max-w-2xl rounded-xl border px-4 py-3 text-center text-sm",
              msg.kind === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-800",
            )}
          >
            {msg.text}
            {msg.kind === "info" && (
              <>
                {" "}
                <Link href="/login?next=%2F%23pricing" className="font-semibold underline">
                  Войти
                </Link>{" "}
                или{" "}
                <Link href="/login?mode=register&next=%2F%23pricing" className="font-semibold underline">
                  зарегистрироваться
                </Link>
                .
              </>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
