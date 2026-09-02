import { requireAdminPage, getAdminUser } from "@/lib/admin-auth";
import { getDirectory } from "@/lib/admin-data";
import ExportButton from "@/components/admin/ExportButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import Link from "next/link";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export const dynamic = "force-dynamic";

async function toggleAdmin(userId: string, makeAdmin: boolean) {
  "use server";
  const admin = await getAdminUser();
  if (!admin) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ is_admin: makeAdmin }).eq("id", userId);
  if (!error) {
    await logAdminAction({
      adminId: admin.id,
      action: makeAdmin ? "grant_admin" : "revoke_admin",
      resource: "profiles",
      resourceId: userId,
    });
    revalidatePath("/admin/users");
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const perPage = 20;

  const { users, emailById: _emailById } = await getDirectory();
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id, plan, status, period_end")
    .order("created_at", { ascending: false });

  const subMap = new Map<string, { user_id: string; plan: string; status: string; period_end: string | null }>();
  for (const s of subs ?? []) {
    if (!subMap.has(s.user_id)) subMap.set(s.user_id, s);
  }

  const filtered = q
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.full_name.toLowerCase().includes(q) ||
          u.company.toLowerCase().includes(q)
      )
    : users;

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * perPage, current * perPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-gray-600 text-sm">Все зарегистрированные аккаунты. Смена роли админа — с аудитом.</p>
      </div>
      <ExportButton type="users" />
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Поиск по email / имени / компании"
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-72"
          />
          <Button type="submit" variant="secondary">Найти</Button>
        </form>
      </div>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Email</TableHeader>
              <TableHeader>Имя / Компания</TableHeader>
              <TableHeader>Регистрация</TableHeader>
              <TableHeader>Последний вход</TableHeader>
              <TableHeader>Подписка</TableHeader>
              <TableHeader>Роль</TableHeader>
              <TableHeader className="text-right">Действие</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => {
              const sub = subMap.get(u.id);
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-gray-900">
                    <Link href={`/admin/users/${u.id}`} className="text-brand-700 hover:underline">{u.email}</Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-800">{u.full_name || "—"}</div>
                    {u.company && <div className="text-xs text-gray-600">{u.company}</div>}
                  </TableCell>
                  <TableCell className="text-gray-600">{fmt(u.created_at)}</TableCell>
                  <TableCell className="text-gray-600">{fmt(u.last_sign_in_at)}</TableCell>
                  <TableCell>
                    {sub ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.status === "active" ? "green" : "gray"} size="sm">{sub.plan}</Badge>
                        <span className="text-xs text-gray-600">{sub.status}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.is_admin ? <Badge variant="purple" size="sm">админ</Badge> : <Badge variant="gray" size="sm">юзер</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleAdmin.bind(null, u.id, !u.is_admin)}>
                      <Button type="submit" size="sm" variant={u.is_admin ? "outline" : "primary"}>
                        {u.is_admin ? "Снять админа" : "Сделать админом"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-600 py-10">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?q=${encodeURIComponent(sp.q ?? "")}&page=${p}`}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                p === current ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
