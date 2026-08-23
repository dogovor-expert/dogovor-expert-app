import { requireAdminPage } from "@/lib/admin-auth";
import { getDirectory } from "@/lib/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import ExportButton from "@/components/admin/ExportButton";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim().toLowerCase();

  const admin = createAdminClient();
  const { emailById } = await getDirectory();
  const { data: subs } = await admin
    .from("subscriptions")
    .select("id, user_id, plan, status, period_start, period_end, auto_renewal, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const filtered = (subs ?? []).filter(
    (s: any) =>
      (!status || s.status === status) &&
      (!q || (emailById.get(s.user_id) ?? "").toLowerCase().includes(q))
  );

  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "trialing", label: "Trialing" },
    { value: "canceled", label: "Canceled" },
    { value: "past_due", label: "Past due" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Подписки</h1>
        <ExportButton type="subscriptions" />
      </div>

      <form method="get" className="flex items-end gap-3 flex-wrap">
        <Select
          label="Статус"
          name="status"
          options={statusOptions}
          defaultValue={status}
          className="w-56"
        />
        <Input name="q" defaultValue={sp.q ?? ""} placeholder="Поиск по email" className="w-72" />
        <Button type="submit" variant="secondary">Фильтр</Button>
        <a href="/admin/subscriptions" className="text-sm text-gray-600 hover:underline self-center">Сброс</a>
      </form>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Пользователь</TableHeader>
              <TableHeader>План</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Старт</TableHeader>
              <TableHeader>Конец</TableHeader>
              <TableHeader>Авто-продление</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-gray-900">{emailById.get(s.user_id) || s.user_id}</TableCell>
                <TableCell>{s.plan}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "active" ? "green" : s.status === "trialing" ? "blue" : "gray"} size="sm">
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{fmt(s.period_start)}</TableCell>
                <TableCell className="text-gray-600">{fmt(s.period_end)}</TableCell>
                <TableCell>
                  <Badge variant={s.auto_renewal ? "green" : "gray"} size="sm">
                    {s.auto_renewal ? "вкл" : "выкл"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-600 py-10">
                  Подписки не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
