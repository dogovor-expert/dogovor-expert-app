import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const ACTION_LABELS: Record<string, string> = {
  feedback_status: "Статус заявки",
  admin_role: "Смена роли",
  profile_update: "Редактирование профиля",
};

const ACTION_VARIANT: Record<string, "blue" | "purple" | "green"> = {
  feedback_status: "blue",
  admin_role: "purple",
  profile_update: "green",
};

type AuditRow = {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  created_at: string;
  meta: unknown;
};

type ProfileLite = { id: string; email: string | null; full_name: string | null };

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdminPage();
  const sb = createAdminClient();

  const { data: rows } = await sb
    .from("admin_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const ids = Array.from(new Set((rows ?? []).map((r: AuditRow) => r.admin_id)));
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids.length ? ids : ["__none__"]);

  const adminById = new Map(
    (profiles ?? []).map((p: ProfileLite) => [p.id, p.full_name || p.email] as const),
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Журнал действий</h1>
        <p className="text-gray-600 text-sm">Все мутации в админке: смена ролей, статусов заявок, редактирование профилей.</p>
      </div>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Дата</TableHeader>
              <TableHeader>Кто</TableHeader>
              <TableHeader>Действие</TableHeader>
              <TableHeader>Объект</TableHeader>
              <TableHeader>Детали</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows ?? []).map((r: AuditRow) => (
              <TableRow key={r.id}>
                <TableCell className="text-gray-600 whitespace-nowrap">{fmt(r.created_at)}</TableCell>
                <TableCell className="text-gray-700">{adminById.get(r.admin_id) || r.admin_id}</TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[r.action] || "gray"} size="sm">
                    {ACTION_LABELS[r.action] || r.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{r.resource}{r.resource_id ? ` · ${r.resource_id.slice(0, 8)}` : ""}</TableCell>
                <TableCell className="text-gray-600 max-w-[280px] truncate">
                  {r.meta ? JSON.stringify(r.meta) : "—"}
                </TableCell>
              </TableRow>
            ))}
            {!rows?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-600 py-10">Действий пока нет</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
