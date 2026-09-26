"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Lock,
  RefreshCw,
  CalendarClock,
  Flame,
  Sparkles,
  FileSearch,
} from "lucide-react";
import { currentProPrice, PRO_PRICE_OLD, PRO_PRICE, PROMO_LABEL, isPromoActive, formatRub } from "@/lib/pricing";
import { AI_PLAN_PRICE_RUB, AI_PLAN_QUESTIONS } from "@/lib/ai/pricing";
import { track, trackMetrikaOnly, goals } from "@/lib/analytics";

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  provider: string;
  meta: { plan?: string } | null;
  created_at: string;
}

interface Feature {
  lead?: string;
  text: string;
}

const FREE_FEATURES: string[] = [
  "Создание и скачивание документов в PDF",
  "Все шаблоны и пустые бланки",
  "Базовые калькуляторы и справочники",
  "DADATA — через ваш собственный ключ",
];

const PRO_FEATURES: Feature[] = [
  { lead: "DADATA на нашем ключе", text: " — автозаполнение по ИНН, адрес, ФИО" },
  { lead: "Сканер документов (OCR)", text: " — паспорт, ПТС, СТС → в поля" },
  { lead: "Экспорт в Word (DOCX)", text: " — PDF доступен всем, DOCX — в подписке" },
  { lead: "Подписание вашей УКЭП", text: " — через установленный КриптоПро, прямо в конструкторе" },
  { lead: "Согласование с контрагентом", text: " — ссылка и правки второй стороной" },
  { lead: "Облачные диски", text: ": Яндекс.Диск, Google Drive, Dropbox" },
  { lead: "Пакет документов за раз", text: ": КП → договор → акт → счёт" },
  { lead: "Проверка авто", text: " — 5 отчётов о проверке авто в месяц" },
  { lead: "Приоритетная поддержка", text: "" },
];

const COMPARISON: { label: string; free: string; pro: string }[] = [
  { label: "Генерация документов", free: "✓", pro: "✓" },
  { label: "Скачивание PDF", free: "✓", pro: "✓" },
  { label: "Экспорт в DOCX (Word)", free: "—", pro: "✓" },
  { label: "DADATA (наш ключ, автозаполнение)", free: "свой ключ", pro: "✓" },
  { label: "Сканер документов (OCR)", free: "—", pro: "✓" },
  { label: "Подписание вашей УКЭП через КриптоПро", free: "—", pro: "✓" },
  { label: "Согласование с контрагентом", free: "—", pro: "✓" },
  { label: "Облачные диски (Яндекс/Google/Dropbox)", free: "—", pro: "✓" },
  { label: "Пакет документов (КП → договор → акт)", free: "—", pro: "✓" },
  { label: "Проверка авто", free: "поштучно", pro: "5/мес" },
  { label: "Приоритетная поддержка", free: "—", pro: "✓" },
];

const TRUST = [
  { icon: ShieldCheck, text: "Защита персональных данных по 152-ФЗ" },
  { icon: CreditCard, text: "Оплата ЮKassa: МИР, Visa, Mastercard, СБП" },
  { icon: FileSearch, text: "570 проверенных шаблонов договоров" },
  { icon: RefreshCw, text: "Отмена подписки в любой момент" },
];

const FAQ = [
  {
    q: "Можно ли отменить подписку?",
    a: "Да, в любой момент в один клик. Доступ сохраняется до конца оплаченного периода.",
  },
  {
    q: "Как работает тариф «AI-юрист»?",
    a: "За 690 ₽ в месяц вы получаете 200 вопросов AI-юристу: ответы со ссылками на статьи законов, экспорт диалога в PDF и DOCX. Неиспользованные вопросы в конце месяца сгорают.",
  },
  {
    q: "Что будет, если вопросы тарифа «AI-юрист» закончатся?",
    a: "Дальнейшие вопросы оплачиваются из баланса кошелька AI-юриста по 19 ₽ за вопрос — так же, как без тарифа. Пополнить баланс можно на странице AI-юриста.",
  },
  {
    q: "Чем отличается DADATA в PRO?",
    a: "В PRO автозаполнение реквизитов работает на нашем ключе автоматически — достаточно ввести ИНН. На бесплатном тарифе нужно подставить свой ключ DADATA.",
  },
  {
    q: "Что делает сканер документов?",
    a: "Сфотографируйте паспорт, ПТС или СТС — система распознает данные и подставит их в нужные поля договора.",
  },
  {
    q: "Что такое подпись УКЭП в PRO?",
    a: "Сервис не выдаёт электронные подписи. В PRO вы можете подписать документ своей квалифицированной электронной подписью (УКЭП) — через установленный на вашем компьютере КриптоПро CSP и браузерный плагин. Юридическую силу придаёт ваш сертификат, выданный аккредитованным удостоверяющим центром.",
  },
  {
    q: "Как работает согласование с контрагентом?",
    a: "Сформируйте ссылку или QR на документ и отправьте второй стороне. Контрагент увидит договор и внесёт правки в защищённом виде — файлы не нужно пересылать по почте.",
  },
  {
    q: "Что такое пакет документов?",
    a: "Один раз заполняете данные сделки — и PRO собирает сразу пакет: коммерческое предложение, договор, акт и счёт. Экономит время на повторном вводе.",
  },
];

export default function BillingPage() {
  const [, setPlan] = useState("free");
  const [plans, setPlans] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [hasMorePayments, setHasMorePayments] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<"30" | "90" | "365" | "all">("30");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const [justRenewed, setJustRenewed] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [togglingAuto, setTogglingAuto] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    const sRes = await fetch("/api/subscription-status").catch(() => null);
    if (sRes?.ok) {
      const s = (await sRes.json()) as {
        plan?: string;
        plans?: string[];
        subscription_active?: boolean;
        period_end?: string | null;
        auto_renewal?: boolean;
        has_payment_method?: boolean;
      };
      setPlan(s.plan ?? "free");
      setPlans(Array.isArray(s.plans) ? s.plans : s.plan ? [s.plan] : []);
      setActive(!!s.subscription_active);
      setPeriodEnd(s.period_end ?? null);
      setAutoRenewal(!!s.auto_renewal);
      setHasPaymentMethod(!!s.has_payment_method);
    }
    const params = new URLSearchParams();
    if (periodFilter !== "all") {
      params.set("from", new Date(Date.now() - Number(periodFilter) * 86400000).toISOString());
    }
    const hRes = await fetch(`/api/billing/history?${params.toString()}`).catch(() => null);
    if (hRes?.ok) {
      const json = (await hRes.json()) as {
        data?: PaymentRow[];
        hasMore?: boolean;
        nextCursor?: string | null;
      };
      setPayments(Array.isArray(json.data) ? json.data : []);
      setHasMorePayments(!!json.hasMore);
      setNextCursor(json.nextCursor ?? null);
    }
    setLoading(false);
  }, [periodFilter]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (periodFilter !== "all") {
        params.set("from", new Date(Date.now() - Number(periodFilter) * 86400000).toISOString());
      }
      if (nextCursor) params.set("cursor", nextCursor);
      const hRes = await fetch(`/api/billing/history?${params.toString()}`).catch(() => null);
      if (hRes?.ok) {
        const json = (await hRes.json()) as {
          data?: PaymentRow[];
          hasMore?: boolean;
          nextCursor?: string | null;
        };
        const data = json.data;
        if (Array.isArray(data)) {
          setPayments((prev) => [...prev, ...data]);
        }
        setHasMorePayments(!!json.hasMore);
        setNextCursor(json.nextCursor ?? null);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, periodFilter]);

  useEffect(() => {
    void load();
    const q = new URLSearchParams(window.location.search);
    if (q.get("success")) {
      setJustPaid(true);
      // Журнал (user_events) пишет сервер из вебхука оплаты — здесь только
      // цель Метрики, чтобы не задваивать события в /admin/analytics.
      trackMetrikaOnly(goals.paymentSuccess);
      window.history.replaceState({}, "", "/billing");
    }
    if (q.get("renewed")) {
      setJustRenewed(true);
      window.history.replaceState({}, "", "/billing");
    }
  }, [load]);

  const pay = async (planArg: "pro" | "ai" = "pro") => {
    setPaying(true);
    try {
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planArg }),
      });
      if (res.status === 503) {
        showToast("Оплата станет доступна совсем скоро — модуль в разработке");
        setPaying(false);
        return;
      }
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        detail?: string;
        confirmation_url?: string;
      } | null;
      if (!res.ok) {
        showToast(json?.error === "unauthorized" ? "Войдите в аккаунт, чтобы оформить подписку" : (json?.detail ? `Ошибка оплаты: ${json.detail}` : "Не удалось создать платёж. Попробуйте позже"));
        setPaying(false);
        return;
      }
      trackMetrikaOnly(goals.paymentCreated);
      if (json?.confirmation_url) window.location.href = json.confirmation_url;
    } catch {
      showToast("Сервис временно недоступен. Попробуйте ещё раз");
      setPaying(false);
    }
  };

  const toggleAutoRenewal = async () => {
    setTogglingAuto(true);
    try {
      const res = await fetch("/api/billing/auto-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !autoRenewal }),
      });
      const json = (await res.json().catch(() => null)) as {
        message?: string;
        auto_renewal?: boolean;
      } | null;
      if (!res.ok) {
        showToast(json?.message ?? "Не удалось изменить автопродление");
        return;
      }
      setAutoRenewal(!!json?.auto_renewal);
      showToast(json?.auto_renewal ? "Автопродление включено" : "Автопродление отключено");
      track(goals.billingAutorenewToggle, { enabled: json?.auto_renewal });
    } finally {
      setTogglingAuto(false);
    }
  };

  const renewNow = async () => {
    setRenewing(true);
    try {
      const res = await fetch("/api/billing/auto-renew", { method: "POST" });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
        status?: string;
      } | null;
      if (!res.ok) {
        showToast(
          json?.error === "no_saved_payment_method"
            ? "Нет сохранённой карты. Оформите подписку заново — карта сохранится автоматически."
            : "Не удалось продлить подписку. Попробуйте позже"
        );
        return;
      }
      if (json?.status === "succeeded") {
        showToast("Подписка продлена");
        void load();
      } else {
        showToast("Ожидается списание средств — подтверждение обычно занимает пару минут");
      }
    } finally {
      setRenewing(false);
    }
  };

  // PRO и AI-юрист — независимые планы: бейджи и кнопки считаем по каждому.
  const activePro = active && plans.includes("pro");
  const activeAi = active && plans.includes("ai");
  const promo = isPromoActive();
  const price = currentProPrice();
  const savings = PRO_PRICE_OLD - PRO_PRICE;
  const statusConfig: Record<string, { label: string; variant: "green" | "amber" | "red" | "gray"; icon: typeof CheckCircle2 }> = {
    paid: { label: "Оплачен", variant: "green", icon: CheckCircle2 },
    pending: { label: "Ожидает", variant: "amber", icon: Clock },
    failed: { label: "Ошибка", variant: "red", icon: AlertCircle },
    canceled: { label: "Отменён", variant: "gray", icon: Clock },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="text-center mb-10">
          {promo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              Акция {PROMO_LABEL} — успевайте до 20 сентября
            </span>
          )}
          <h1 className="text-display-xl font-bold mt-5 text-gray-900">
            PRO-подписка для тех, кто составляет договоры всерьёз
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
            Автозаполнение по ИНН, сканер паспорта, экспорт в Word (DOCX), подписание вашей УКЭП через КриптоПро и согласование с контрагентом. Открывайте и подписывайте сделки за минуты.
          </p>
        </div>

        {justPaid && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-800">Оплата получена. Подписка активируется после подтверждения платежа — обычно в течение пары минут.</p>
          </div>
        )}

        {justRenewed && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <RefreshCw className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-800">Запрос на продление отправлен — подписка продлится после подтверждения платежа.</p>
          </div>
        )}

        {activePro && periodEnd && new Date(periodEnd).getTime() - Date.now() < 5 * 86400000 && new Date(periodEnd).getTime() >= Date.now() && (
          <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Подписка PRO истекает {new Date(periodEnd).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}.
              {autoRenewal ? " Продлите в один клик ниже." : " Включите автопродление или продлите подписку ниже."}
            </p>
          </div>
        )}

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* FREE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6">
              <h3 className="font-semibold text-slate-700">Бесплатный</h3>
              <p className="text-3xl font-bold text-slate-900 mt-2">0 ₽<span className="text-base font-normal text-slate-500"> / навсегда</span></p>
              <p className="text-sm text-slate-500 mt-1">Удобный старт</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-slate-600">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full mt-6" disabled>
                Всегда бесплатно
              </Button>
            </div>
          </div>

          {/* AI-ЮРИСТ */}
          <div className="bg-white rounded-2xl border-2 border-violet-400 shadow-lg overflow-hidden relative">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-violet-100 text-violet-900 text-[10px] font-bold">НОВОЕ</div>
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold opacity-90">AI-юрист</h3>
                {activeAi && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Активна
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold mt-2">
                {formatRub(AI_PLAN_PRICE_RUB)}
                <span className="text-base font-normal opacity-80"> / месяц</span>
              </p>
              <p className="text-sm opacity-90 mt-1">{AI_PLAN_QUESTIONS} вопросов в месяц со ссылками на статьи</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <><b>{AI_PLAN_QUESTIONS} вопросов в месяц</b> — ответы со ссылками на статьи НПА</>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Экспорт диалога в PDF и DOCX
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Приоритетная поддержка
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  Неиспользованные вопросы сгорают в конце месяца
                </li>
              </ul>

              {activeAi ? (
                <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-xs text-gray-600">
                    Тариф активен. Остаток вопросов на этот месяц смотрите на странице{" "}
                    <a href="/ai-yurist" className="text-brand-600 font-medium underline">AI-юриста</a>.
                    Вопросы сверх квоты — по 19 ₽ из баланса.
                  </p>
                </div>
              ) : (
                <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => { void pay("ai"); }} disabled={paying}>
                  <Sparkles className="w-4 h-4" />
                  {paying ? "Создаём платёж…" : `Оформить за ${formatRub(AI_PLAN_PRICE_RUB)}`}
                </Button>
              )}

              <p className="text-[11px] text-slate-500 mt-3 flex items-start gap-1.5">
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Оплата через ЮKassa: МИР, Visa, Mastercard, СБП. Отмена в любой момент.
              </p>
            </div>
          </div>

          {/* PRO */}
          <div className="bg-white rounded-2xl border-2 border-brand-500 shadow-lg overflow-hidden relative">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold">ПОПУЛЯРНО</div>
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold opacity-90">PRO</h3>
                {activePro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Активна
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold mt-2">
                {formatRub(price)}
                <span className="text-base font-normal opacity-80"> / месяц</span>
                {promo && (
                  <span className="ml-2 text-lg font-semibold opacity-60 line-through">{formatRub(PRO_PRICE_OLD)}</span>
                )}
              </p>
              {promo ? (
                <p className="text-sm opacity-90 mt-1">Экономия {formatRub(savings)} при оформлении сегодня</p>
              ) : (
                <p className="text-sm opacity-90 mt-1">Полный набор инструментов для договоров</p>
              )}
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-slate-700">
                {PRO_FEATURES.map((f) => (
                  <li key={f.lead ?? f.text} className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    {f.lead ? <><b>{f.lead}</b>{f.text}</> : f.text}
                  </li>
                ))}
              </ul>

              {activePro ? (
                <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <RefreshCw className="w-4 h-4 text-brand-500" />
                      Автопродление
                    </div>
                    <button
                      onClick={() => { void toggleAutoRenewal(); }}
                      disabled={togglingAuto}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenewal ? "bg-emerald-500" : "bg-gray-300"} disabled:opacity-50`}
                      title={autoRenewal ? "Выключить автопродление" : "Включить автопродление"}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${autoRenewal ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {autoRenewal && hasPaymentMethod && (
                    <button
                      onClick={() => { void renewNow(); }}
                      disabled={renewing}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <CalendarClock className="w-3.5 h-3.5 text-brand-500" />
                      {renewing ? "Продлеваем…" : "Продлить сейчас (списание с сохранённой карты)"}
                    </button>
                  )}
                  {periodEnd && (
                    <p className="text-xs text-gray-600">
                      Действует до:{" "}
                      <span className="font-medium text-gray-700">
                        {new Date(periodEnd).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600">
                    {autoRenewal
                      ? "Карта сохранена в ЮKassa. Продление в один клик — без повторного ввода данных. Отключить можно в любой момент."
                      : "Включите автопродление, чтобы продлевать PRO в один клик. Карта сохранится в ЮKassa."}
                  </p>
                </div>
              ) : (
                <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => { void pay(); }} disabled={paying}>
                  <Sparkles className="w-4 h-4" />
                  {paying ? "Создаём платёж…" : `Оформить PRO за ${formatRub(price)}`}
                </Button>
              )}

              <p className="text-[11px] text-slate-500 mt-3 flex items-start gap-1.5">
                <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Оплата через ЮKassa: МИР, Visa, Mastercard, СБП. Отмена в любой момент.
                {promo && ` После акции цена вернётся к ${formatRub(PRO_PRICE_OLD)}/мес.`}
              </p>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Сравнение возможностей</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="hidden sm:block">
              <Table variant="default">
                <TableHead>
                  <TableRow>
                    <TableHeader>Возможность</TableHeader>
                    <TableHeader className="text-center">Бесплатный</TableHeader>
                    <TableHeader className="text-center text-brand-600">PRO</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {COMPARISON.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className={`text-center ${row.free === "✓" ? "text-emerald-500" : row.free === "—" ? "text-slate-300" : "text-xs text-slate-500"}`}>
                        {row.free}
                      </TableCell>
                      <TableCell className={`text-center ${row.pro === "✓" ? "text-emerald-500" : row.pro === "—" ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                        {row.pro}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="sm:hidden divide-y divide-gray-100">
              {COMPARISON.map((row) => (
                <div key={row.label} className="px-4 py-3 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{row.label}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Бесплатный</span>
                    <span className={row.free === "✓" ? "text-emerald-500" : row.free === "—" ? "text-slate-300" : "text-slate-500"}>{row.free}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-600 font-medium">PRO</span>
                    <span className={row.pro === "✓" ? "text-emerald-500" : row.pro === "—" ? "text-slate-300" : "text-slate-700 font-medium"}>{row.pro}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.text} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <Icon className="w-6 h-6 text-brand-600 shrink-0" />
                <span className="text-xs text-slate-600">{t.text}</span>
              </div>
            );
          })}
        </section>

        {/* FAQ */}
        <section className="mt-14 mb-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="bg-white rounded-xl border border-slate-200 p-4">
                <summary className="font-medium cursor-pointer">{item.q}</summary>
                <p className="text-sm text-slate-600 mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* PAYMENT HISTORY */}
        {!loading && (
          <Card variant="default" padding="none" className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">История платежей</h2>
              <div className="flex items-center gap-1" role="group" aria-label="Фильтр по периоду">
                {([
                  ["30", "30 дн"],
                  ["90", "90 дн"],
                  ["365", "Год"],
                  ["all", "Всё"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriodFilter(value)}
                    aria-pressed={periodFilter === value}
                    className={`px-2.5 py-1 text-xs rounded-lg transition cursor-pointer ${
                      periodFilter === value
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-600">Всего: {payments.length}</span>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-600 py-8 text-center">Платежей пока нет — оформите PRO, и история появится здесь</p>
            ) : (
              <>
                <div className="hidden sm:block">
                  <Table variant="default">
                    <TableHead>
                      <TableRow>
                        <TableHeader>Дата</TableHeader>
                        <TableHeader>План</TableHeader>
                        <TableHeader>Сумма</TableHeader>
                        <TableHeader>Статус</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((p) => {
                        const status = statusConfig[p.status] ?? statusConfig.failed;
                        const StatusIcon = status.icon;
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="text-gray-600">{new Date(p.created_at).toLocaleDateString("ru-RU")}</TableCell>
                            <TableCell className="font-medium text-gray-900 capitalize">{p.meta?.plan ?? "PRO"}</TableCell>
                            <TableCell className="font-medium text-gray-900">{p.amount.toLocaleString("ru-RU")} ₽</TableCell>
                            <TableCell>
                              <Badge variant={status.variant} size="sm" dot>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="sm:hidden divide-y divide-gray-100">
                  {payments.map((p) => {
                    const status = statusConfig[p.status] ?? statusConfig.failed;
                    const StatusIcon = status.icon;
                    return (
                      <div key={p.id} className="px-4 py-3 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900">{new Date(p.created_at).toLocaleDateString("ru-RU")}</span>
                          <Badge variant={status.variant} size="sm" dot>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">План</span>
                          <span className="font-medium text-gray-900 capitalize">{p.meta?.plan ?? "PRO"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Сумма</span>
                          <span className="font-medium text-gray-900">{p.amount.toLocaleString("ru-RU")} ₽</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasMorePayments && (
                  <div className="px-6 py-3 border-t border-gray-100 text-center">
                    <button
                      type="button"
                      onClick={() => { void loadMore(); }}
                      disabled={loadingMore}
                      className="px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 rounded-xl hover:bg-brand-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loadingMore ? "Загрузка…" : "Загрузить ещё"}
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {loading && <p className="text-sm text-gray-600 py-10 text-center">Загрузка…</p>}

        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
