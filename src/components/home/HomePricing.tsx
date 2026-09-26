import Link from "next/link";
import { Check } from "lucide-react";
import { formatRub } from "@/lib/pricing";
import { AI_PLAN_PRICE_RUB, AI_PLAN_QUESTIONS } from "@/lib/ai/pricing";

interface HomePricingProps {
  totalTemplates: number;
  proPrice: number;
  proOldPrice: number | null;
}

function cn(...parts: Array<string | false>): string {
  return parts.filter(Boolean).join(" ");
}

/** Тарифы — только реальные планы: бесплатно, PRO, AI-юрист. */
export default function HomePricing({ totalTemplates, proPrice, proOldPrice }: HomePricingProps) {
  const plans = [
    {
      name: "Бесплатно",
      price: "0 ₽",
      period: "навсегда",
      desc: "Чтобы попробовать конструктор и скачать первый документ.",
      features: [
        `${totalTemplates}+ шаблонов документов`,
        "Экспорт в PDF и DOCX",
        "23 правовых калькулятора",
        "Без регистрации и карты",
      ],
      cta: "Начать бесплатно",
      href: "/builder",
      highlighted: false,
    },
    {
      name: "PRO",
      price: formatRub(proPrice),
      period: "в месяц",
      desc: "Для тех, кто регулярно работает с документами и подписью.",
      features: [
        `Все ${totalTemplates}+ шаблонов`,
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
      name: "AI-юрист",
      price: formatRub(AI_PLAN_PRICE_RUB),
      period: "в месяц",
      desc: "Ответы по действующим законам со ссылками на статьи.",
      features: [
        `${AI_PLAN_QUESTIONS} вопросов в месяц`,
        "Цитаты статей НПА",
        "Экспорт диалога в PDF и DOCX",
        "Приоритетная поддержка",
      ],
      cta: "Попробовать AI-юриста",
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

              <Link
                href={plan.href}
                className={cn(
                  "mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
                  plan.highlighted
                    ? "bg-white text-indigo-700 shadow-lg hover:bg-indigo-50"
                    : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
