import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { atLeast } from "@/lib/admin-rbac";
import { getDirectory } from "@/lib/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, ShieldCheck, Banknote, Package, MessageSquare, Inbox } from "lucide-react";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

type PaymentRow = { id: string; user_id: string; amount: number; status: string; created_at: string };
type FeedbackRow = { id: string; ticket_no: string | null; email: string; status: string };
type LeadRow = { id: string; brand: string; status: string; created_at: string };

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // 6.5 RBAC: обзор доступен любой роли, но PII-виджеты скрыты для модератора.
  const me = await requireAdminPage();
  const fullAccess = atLeast(me.role, "admin");
  const admin = createAdminClient();
  const { users, emailById } = await getDirectory();

  const [subsActive, paysPaid, leadsTotal, fbNew] = await Promise.all([
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
    admin.from("leads").select("id", { count: "exact", head: true }),
    admin.from("feedback").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const paysRes = fullAccess
    ? await admin.from("payments").select("id, user_id, amount, currency, provider, status, created_at").order("created_at", { ascending: false }).limit(5)
    : { data: [] as PaymentRow[] };
  const [leadsRes, fbRes] = await Promise.all([
    admin.from("leads").select("id, brand, status, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("feedback").select("id, ticket_no, type, email, status, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Пользователей", value: users.length, icon: Users, href: "/admin/users", adminOnly: true },
    { label: "Активных подписок", value: subsActive.count ?? 0, icon: ShieldCheck, href: "/admin/subscriptions", adminOnly: true },
    { label: "Оплат (paid)", value: paysPaid.count ?? 0, icon: Banknote, href: "/admin/payments", adminOnly: true },
    { label: "Лидов (растаможка)", value: leadsTotal.count ?? 0, icon: Package, href: "/admin/leads", adminOnly: false },
    { label: "Новых отзывов", value: fbNew.count ?? 0, icon: MessageSquare, href: "/admin/feedback", adminOnly: false },
  ].filter((s) => fullAccess || !s.adminOnly);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>
        <p className="text-gray-600 text-sm">
          Статистика и последняя активность{fullAccess ? "" : " · разделы модератора"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-600">{s.label}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fullAccess && (
          <Card className="p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> Новые пользователи
            </h2>
            <div className="divide-y divide-gray-100">
              {users.slice(0, 6).map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.email || u.full_name}</p>
                    <p className="text-xs text-gray-600">{fmt(u.created_at)}</p>
                  </div>
                  {u.is_admin && <Badge variant="purple" size="sm">админ</Badge>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {fullAccess && (
          <Card className="p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-brand-500" /> Последние платежи
            </h2>
          <div className="divide-y divide-gray-100">
            {(paysRes.data ?? []).map((p: PaymentRow) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{emailById.get(p.user_id) || p.user_id}</p>
                  <p className="text-xs text-gray-600">{fmt(p.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{(p.amount / 100).toLocaleString("ru-RU")} ₽</span>
                  <Badge variant={p.status === "paid" ? "green" : "amber"} size="sm">{p.status}</Badge>
                </div>
              </div>
            ))}
            {!paysRes.data?.length && <p className="text-sm text-gray-600 py-4 text-center">Нет платежей</p>}
          </div>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" /> Обратная связь
          </h2>
          <div className="divide-y divide-gray-100">
            {(fbRes.data ?? []).map((f: FeedbackRow) => (
              <div key={f.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.ticket_no}</p>
                  <p className="text-xs text-gray-600 truncate">{f.email}</p>
                </div>
                <Badge variant={f.status === "new" ? "blue" : "gray"} size="sm">{f.status}</Badge>
              </div>
            ))}
            {!fbRes.data?.length && <p className="text-sm text-gray-600 py-4 text-center">Нет заявок</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-brand-500" /> Лиды (растаможка)
          </h2>
          <div className="divide-y divide-gray-100">
            {(leadsRes.data ?? []).map((l: LeadRow) => (
              <div key={l.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{l.brand}</p>
                  <p className="text-xs text-gray-600">{fmt(l.created_at)}</p>
                </div>
                <Badge variant="gray" size="sm">{l.status}</Badge>
              </div>
            ))}
            {!leadsRes.data?.length && <p className="text-sm text-gray-600 py-4 text-center">Нет лидов</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
