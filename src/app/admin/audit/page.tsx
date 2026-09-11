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

const PAGE_SIZE = 50;

const inputCls =
  "px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage("admin");
  const sp = await searchParams;
  const str = (k: string) => {
    const v = sp[k];
    return typeof v === "string" && v.trim() ? v.trim() : "";
  };

  const from = str("from");
  const to = str("to");
  const action = str("action");
  const adminId = str("admin_id");
  const resource = str("resource");
  const cursor = str("cursor");

  const sb = createAdminClient();

  let query = sb
    .from("admin_audit")
    .select("id, admin_id, action, resource, resource_id, created_at, meta")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (action) query = query.eq("action", action.slice(0, 60));
  if (adminId) query = query.eq("admin_id", adminId.slice(0, 60));
  if (resource) query = query.eq("resource", resource.slice(0, 60));

  // Композитный курсор (created_at, id) — стабилен при коллизиях created_at.
  if (cursor) {
    const [cCreated, cId] = cursor.split("|");
    const validCursor =
      /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(cCreated ?? "") && /^[0-9a-f-]{36}$/i.test(cId ?? "");
    if (validCursor) {
      query = query.or(`created_at.lt.${cCreated},and(created_at.eq.${cCreated},id.lt.${cId})`);
    }
  }

  const [{ data: rows, error }, { data: allActions }, { data: allResources }] = await Promise.all([
    query.limit(PAGE_SIZE + 1) as unknown as Promise<{ data: AuditRow[] | null; error: { message: string } | null }>,
    sb.from("admin_audit").select("action").limit(1000),
    sb.from("admin_audit").select("resource").limit(1000),
  ]);
  if (error) throw new Error(error.message);

  const pageRows = rows ?? [];
  const hasMore = pageRows.length > PAGE_SIZE;
  const list = hasMore ? pageRows.slice(0, PAGE_SIZE) : pageRows;
  const last = list[list.length - 1];
  const nextCursor = hasMore && last ? `${last.created_at}|${last.id}` : null;

  const ids = Array.from(new Set(list.map((r) => r.admin_id)));
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids.length ? ids : ["__none__"]);

  const adminById = new Map(
    (profiles ?? []).map((p: ProfileLite) => [p.id, p.full_name || p.email] as const),
  );
  // Куратор списка админов для селекта — только те, кто уже светился в журнале.
  const adminOptions = (profiles ?? []).map((p: ProfileLite) => ({
    id: p.id,
    label: p.full_name || p.email || p.id.slice(0, 8),
  }));
  const actionOptions = Array.from(
    new Set((allActions ?? []).map((a: { action: string }) => a.action)),
  );
  const resourceOptions = Array.from(
    new Set((allResources ?? []).map((r: { resource: string }) => r.resource)),
  );

  const buildQs = (over: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { from, to, action, admin_id: adminId, resource, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const hasActiveFilters = !!(from || to || action || adminId || resource);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Журнал действий</h1>
        <p className="text-gray-600 text-sm">Все мутации в админке: смена ролей, статусов заявок, редактирование профилей.</p>
      </div>

      {/* 6.3 (аудит): GET-форма фильтров — работает без JS, состояние в URL. */}
      <Card>
        <form method="GET" action="/admin/audit" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="f-from" className="text-[10px] font-mono uppercase text-gray-500">Период с</label>
            <input id="f-from" name="from" type="date" defaultValue={from} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-to" className="text-[10px] font-mono uppercase text-gray-500">по</label>
            <input id="f-to" name="to" type="date" defaultValue={to} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-action" className="text-[10px] font-mono uppercase text-gray-500">Действие</label>
            <select id="f-action" name="action" defaultValue={action} className={inputCls}>
              <option value="">все</option>
              {actionOptions.map((a) => (
                <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-resource" className="text-[10px] font-mono uppercase text-gray-500">Объект</label>
            <select id="f-resource" name="resource" defaultValue={resource} className={inputCls}>
              <option value="">все</option>
              {resourceOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="f-admin" className="text-[10px] font-mono uppercase text-gray-500">Админ</label>
            <select id="f-admin" name="admin_id" defaultValue={adminId} className={inputCls}>
              <option value="">все</option>
              {adminOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors">
              Применить
            </button>
            {hasActiveFilters && (
              <a href="/admin/audit" className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Сбросить
              </a>
            )}
          </div>
        </form>
      </Card>

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
            {list.map((r) => (
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
            {!list.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-600 py-10">
                  {hasActiveFilters ? "По фильтрам ничего не найдено" : "Действий пока нет"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* 6.7 (аудит): cursor-пагинация вместо среза limit 300 */}
        {list.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{hasMore ? `Показано ${PAGE_SIZE}· есть ещё` : `Показано ${list.length}`}</span>
            {nextCursor && (
              <a
                href={`/admin/audit${buildQs({ cursor: nextCursor })}`}
                className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
              >
                Следующая страница →
              </a>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
