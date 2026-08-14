import { createAdminClient } from "@/lib/supabase/admin";
import LeadsPanel from "@/components/dashboard/LeadsPanel";
import { Users, CreditCard, ShieldCheck, Banknote } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = createAdminClient();

  const [usersRes, subsRes, paysRes, leadsRes] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("plan", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    admin.from("leads").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Пользователей", value: usersRes.count ?? 0, icon: Users },
    { label: "Активных подписок", value: subsRes.count ?? 0, icon: ShieldCheck },
    { label: "Оплат (paid)", value: paysRes.count ?? 0, icon: Banknote },
    { label: "Заявок на растаможку", value: leadsRes.count ?? 0, icon: CreditCard },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
        <p className="text-gray-500 text-sm">Статистика и управление заявками</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <LeadsPanel />
    </div>
  );
}