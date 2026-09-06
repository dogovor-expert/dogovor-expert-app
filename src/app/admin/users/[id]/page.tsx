import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { updateProfile, toggleAdminUser, updateSubscription, giftSubscriptionExtension } from "./actions";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const money = (amount: number, currency: string) =>
  currency === "RUB" ? `${(amount / 100).toLocaleString("ru-RU")} ₽` : `${(amount / 100).toLocaleString("ru-RU")} ${currency}`;

type PaymentRow = { id: string; amount: number; currency: string; provider: string; status: string; created_at: string };
type LeadRow = { id: string; service: string; brand: string | null; vin: string | null; status: string; created_at: string };
type FeedbackRow = { id: string; ticket_no: string | null; type: string; message: string | null; status: string; created_at: string };

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  const sb = createAdminClient();

  const [{ data: authUser }, { data: profile }] = await Promise.all([
    sb.auth.admin.getUserById(id),
    sb.from("profiles").select("*").eq("id", id).maybeSingle(),
  ]);

  const email = authUser?.user?.email ?? profile?.email ?? "—";

  const [{ data: sub }, { data: pays }, { data: leads }, { data: feedback }] = await Promise.all([
    sb.from("subscriptions").select("*").eq("user_id", id).maybeSingle(),
    sb.from("payments").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    sb.from("leads").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    sb.from("feedback").select("*").eq("email", email).order("created_at", { ascending: false }).limit(50),
  ]);

  const isAdmin = !!profile?.is_admin;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/users" className="text-sm text-brand-600 hover:underline">← Все пользователи</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{profile?.full_name || email}</h1>
          <p className="text-gray-600 text-sm">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isAdmin ? "purple" : "gray"} size="sm">{isAdmin ? "Админ" : "Пользователь"}</Badge>
          {id !== admin.id && (
            <form action={toggleAdminUser}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="make_admin" value={isAdmin ? "false" : "true"} />
              <button type="submit" className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {isAdmin ? "Снять админа" : "Сделать админом"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Профиль</h2>
        <form action={updateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="hidden" name="id" value={id} />
          <label className="text-sm text-gray-600 flex flex-col gap-1">
            Имя
            <input name="full_name" defaultValue={profile?.full_name ?? ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
          </label>
          <label className="text-sm text-gray-600 flex flex-col gap-1">
            Компания
            <input name="company" defaultValue={profile?.company ?? ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
          </label>
          <label className="text-sm text-gray-600 flex flex-col gap-1">
            ИНН
            <input name="inn" defaultValue={profile?.inn ?? ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
          </label>
          <label className="text-sm text-gray-600 flex flex-col gap-1">
            Телефон
            <input name="phone" defaultValue={profile?.phone ?? ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
          </label>
          <div className="sm:col-span-2 text-xs text-gray-600">
            Зарегистрирован: {fmt(authUser?.user?.created_at)} · Последний вход: {fmt(authUser?.user?.last_sign_in_at)}
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Сохранить
            </button>
          </div>
        </form>
      </Card>

      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Подписка</h2>
        {sub ? (
          <form action={updateSubscription} className="space-y-3">
            <input type="hidden" name="user_id" value={id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 flex flex-col gap-1">
                План
                <input name="plan" defaultValue={sub.plan ?? ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
              </label>
              <label className="text-sm text-gray-600 flex flex-col gap-1">
                Статус
                <select name="status" defaultValue={sub.status ?? "active"} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="trialing">trialing</option>
                  <option value="canceled">canceled</option>
                  <option value="past_due">past_due</option>
                </select>
              </label>
              <label className="text-sm text-gray-600 flex flex-col gap-1">
                Действует по
                <input type="date" name="period_end" defaultValue={sub.period_end ? sub.period_end.slice(0, 10) : ""} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
              </label>
              <label className="text-sm text-gray-600 flex items-center gap-2 pt-6">
                <input type="checkbox" name="auto_renewal" value="true" defaultChecked={!!sub.auto_renewal} className="w-4 h-4" />
                Автопродление
              </label>
            </div>
            <div className="text-xs text-gray-600">С: {fmt(sub.period_start)} · Текущий статус: {sub.status}</div>
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Сохранить подписку
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">Нет активной подписки</p>
        )}
      </Card>

      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-1">🎁 Подарочное продление</h2>
        <p className="text-xs text-gray-600 mb-3">
          Продлевает подписку бесплатно (или запускает новую PRO). Пользователь
          получит уведомление в колокольчике и письмо. Факт фиксируется в аудите.
        </p>
        <form action={giftSubscriptionExtension} className="space-y-3">
          <input type="hidden" name="user_id" value={id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm text-gray-600 flex flex-col gap-1">
              Срок
              <select name="months" defaultValue="1" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="1">1 месяц</option>
                <option value="2">2 месяца</option>
                <option value="3">3 месяца</option>
                <option value="6">6 месяцев</option>
              </select>
            </label>
            <label className="text-sm text-gray-600 flex flex-col gap-1">
              Причина (для аудита и письма)
              <input name="reason" required minLength={3} maxLength={300} placeholder="Например: компенсация за сбой" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20" />
            </label>
          </div>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            <input type="checkbox" name="notify" value="true" defaultChecked className="w-4 h-4" />
            Уведомить пользователя письмом
          </label>
          <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            Подарить продление
          </button>
        </form>
      </Card>

      <Card padding="none">
        <h2 className="font-semibold text-gray-900 p-4 pb-2">Платежи ({pays?.length ?? 0})</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Сумма</TableHeader>
              <TableHeader>Провайдер</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Дата</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(pays ?? []).map((p: PaymentRow) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-gray-900">{money(p.amount, p.currency)}</TableCell>
                <TableCell className="text-gray-600">{p.provider}</TableCell>
                <TableCell><Badge variant={p.status === "paid" ? "green" : "gray"} size="sm">{p.status}</Badge></TableCell>
                <TableCell className="text-gray-600">{fmt(p.created_at)}</TableCell>
              </TableRow>
            ))}
            {!pays?.length && <TableRow><TableCell colSpan={4} className="text-center text-gray-600 py-6">Нет платежей</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Card padding="none">
        <h2 className="font-semibold text-gray-900 p-4 pb-2">Лиды ({leads?.length ?? 0})</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Услуга</TableHeader>
              <TableHeader>Бренд / VIN</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Дата</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(leads ?? []).map((l: LeadRow) => (
              <TableRow key={l.id}>
                <TableCell className="text-gray-700">{l.service}</TableCell>
                <TableCell className="text-gray-600">{l.brand || l.vin || "—"}</TableCell>
                <TableCell><Badge variant={l.status === "new" ? "blue" : "gray"} size="sm">{l.status}</Badge></TableCell>
                <TableCell className="text-gray-600">{fmt(l.created_at)}</TableCell>
              </TableRow>
            ))}
            {!leads?.length && <TableRow><TableCell colSpan={4} className="text-center text-gray-600 py-6">Нет лидов</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Card padding="none">
        <h2 className="font-semibold text-gray-900 p-4 pb-2">Обратная связь ({feedback?.length ?? 0})</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>№</TableHeader>
              <TableHeader>Тип</TableHeader>
              <TableHeader>Сообщение</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Дата</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(feedback ?? []).map((f: FeedbackRow) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium text-gray-900">{f.ticket_no}</TableCell>
                <TableCell className="text-gray-600">{f.type}</TableCell>
                <TableCell className="text-gray-600 max-w-[260px] truncate">{f.message}</TableCell>
                <TableCell><Badge variant={f.status === "new" ? "blue" : f.status === "done" ? "green" : "gray"} size="sm">{f.status}</Badge></TableCell>
                <TableCell className="text-gray-600">{fmt(f.created_at)}</TableCell>
              </TableRow>
            ))}
            {!feedback?.length && <TableRow><TableCell colSpan={5} className="text-center text-gray-600 py-6">Нет обращений</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
