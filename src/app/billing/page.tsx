"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useCallback, useEffect, useState } from "react";
import { Banknote, CreditCard, CheckCircle2, Clock, AlertCircle, ShieldCheck, Lock } from "lucide-react";

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  provider: string;
  meta: { plan?: string } | null;
  created_at: string;
}

const PRO_PRICE = 990;

export default function BillingPage() {
  const [plan, setPlan] = useState("free");
  const [active, setActive] = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    const sRes = await fetch("/api/subscription-status").catch(() => null);
    if (sRes?.ok) {
      const s = await sRes.json();
      setPlan(s.plan ?? "free");
      setActive(!!s.subscription_active);
    }
    const hRes = await fetch("/api/billing/history").catch(() => null);
    if (hRes?.ok) {
      const { data } = await hRes.json();
      setPayments(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (new URLSearchParams(window.location.search).get("success")) {
      setJustPaid(true);
      window.history.replaceState({}, "", "/billing");
    }
  }, [load]);

  const pay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/billing/create-payment", { method: "POST" });
      if (res.status === 503) {
        showToast("Оплата станет доступна совсем скоро — модуль в разработке");
        setPaying(false);
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(json?.error === "unauthorized" ? "Войдите в аккаунт, чтобы оформить подписку" : "Не удалось создать платёж. Попробуйте позже");
        setPaying(false);
        return;
      }
      window.location.href = json.confirmation_url;
    } catch {
      showToast("Сервис временно недоступен. Попробуйте ещё раз");
      setPaying(false);
    }
  };

  const activePlan = active && plan !== "free";
  const statusConfig: Record<string, { label: string; variant: "green" | "amber" | "red" | "gray"; icon: typeof CheckCircle2 }> = {
    paid: { label: "Оплачен", variant: "green", icon: CheckCircle2 },
    pending: { label: "Ожидает", variant: "amber", icon: Clock },
    failed: { label: "Ошибка", variant: "red", icon: AlertCircle },
    canceled: { label: "Отменён", variant: "gray", icon: Clock },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <Banknote className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Платежи и счета</h1>
          <p className="text-gray-500 text-sm">Подписка PRO и история оплат</p>
        </div>
      </div>

      {justPaid && (
        <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-800">Оплата получена. Подписка PRO активируется после подтверждения платежа — обычно в течение пары минут.</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">Загрузка…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card variant="default" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    Тариф PRO
                  </h2>
                  {activePlan && <Badge variant="green" size="sm" dot>Активен</Badge>}
                </div>
                <div className={`p-4 rounded-xl mb-4 ${activePlan ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-brand-500 to-brand-600"} text-white`}>
                  <p className="text-sm font-medium opacity-90">{activePlan ? "PRO" : "Бесплатный"}</p>
                  <p className="text-2xl font-bold mt-1">{activePlan ? "990 ₽" : "0 ₽"}<span className="text-base font-normal opacity-80"> / месяц</span></p>
                  {!activePlan && <p className="text-sm opacity-80 mt-1">Переходите на PRO — оформите за минуту</p>}
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Неограниченные расчёты без рекламы",
                    "Экспорт расчётов в PDF",
                    "История расчётов и избранное",
                    "Все калькуляторы и справочники",
                    "Приоритетная поддержка",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" size="md" onClick={pay} disabled={paying || activePlan} className="w-full">
                  <CreditCard className="w-4 h-4" />
                  {paying ? "Создаём платёж…" : activePlan ? "Подписка активна" : `Оформить PRO за 990 ₽`}
                </Button>
                <p className="text-[11px] text-gray-400 mt-3 flex items-start gap-1.5">
                  <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Оплата через ЮKassa: МИР, Visa, Mastercard, СБП. Подписка продлевается вручную — автопродление не настроено.
                </p>
              </Card>
            </div>

            <Card variant="default" padding="md" className="h-full">
              <h2 className="font-semibold text-gray-900 mb-4">Текущий тариф</h2>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4">
                <p className="text-xs text-gray-500">Ваш план</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5 capitalize">{plan}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activePlan ? "действует сейчас" : "удобный старт — бесплатно"}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                В PRO входят все калькуляторы: НДС, штрафы ГИБДД, утильсбор, растаможка, КАСКО и другие — без ограничений.
              </p>
            </Card>
          </div>

          <Card variant="default" padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">История платежей</h2>
              <span className="text-xs text-gray-500">Всего: {payments.length}</span>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Платежей пока нет — оформите PRO, и история появится здесь</p>
            ) : (
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
            )}
          </Card>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}