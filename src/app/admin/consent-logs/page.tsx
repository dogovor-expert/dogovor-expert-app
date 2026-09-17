import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

type ConsentLogRow = {
  id: string;
  user_id: string;
  action: string;
  consent_version: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

type ProfileLite = { id: string; email: string | null; full_name: string | null };

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const inputCls =
  "px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export default async function ConsentLogsPage({
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
  const userId = str("user_id");
  const cursor = str("cursor");

  const sb = createAdminClient();

  let query = sb
    .from("ocr_consent_log")
    .select("id, user_id, action, consent_version, ip, user_agent, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (action) query = query.eq("action", action.slice(0, 20));
  if (userId) query = query.eq("user_id", userId.slice(0, 60));

  if (cursor) {
    const [cCreated, cId] = cursor.split("|");
    const validCursor =
      /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(cCreated ?? "") && /^[0-9a-f-]{36}$/i.test(cId ?? "");
    if (validCursor) {
      query = query.or(`created_at.lt.${cCreated},and(created_at.eq.${cCreated},id.lt.${cId})`);
    }
  }

  const [{ data: rows, error }] = await Promise.all([
    query.limit(PAGE_SIZE + 1) as unknown as Promise<{ data: ConsentLogRow[] | null; error: { message: string } | null }>,
  ]);
  if (error) throw new Error(error.message);

  const pageRows = rows ?? [];
  const hasMore = pageRows.length > PAGE_SIZE;
  const list = hasMore ? pageRows.slice(0, PAGE_SIZE) : pageRows;
  const last = list[list.length - 1];
  const nextCursor = hasMore && last ? `${last.created_at}|${last.id}` : null;

  const ids = Array.from(new Set(list.map((r) => r.user_id)));
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ids.length ? ids : ["__none__"]);

  const userById = new Map(
    (profiles ?? []).map((p: ProfileLite) => [p.id, p.full_name || p.email] as const),
  );

  const buildQs = (over: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { from, to, action, user_id: userId, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `?${s}` : "";
  };

  const hasActiveFilters = !!(from || to || action || userId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Согласия OCR — аудит</h1>
        <p className="text-gray-600 text-sm">
          Append-only журнал согласий на серверный OCR (152-ФЗ ст.9). IP, UA, версия текста.
        </p>
      </div>

      <Card>
        <form method="GET" action="/admin/consent-logs" className="flex flex-wrap items-end gap-3">
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
              <option value="grant">Согласие</option>
              <option value="revoke">Отзыв</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors">
              Применить
            </button>
            {hasActiveFilters && (
              <a href="/admin/consent-logs" className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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
              <TableHeader>Пользователь</TableHeader>
              <TableHeader>Действие</TableHeader>
              <TableHeader>IP</TableHeader>
              <TableHeader>Версия</TableHeader>
              <TableHeader>UA</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-gray-600 whitespace-nowrap">{fmt(r.created_at)}</TableCell>
                <TableCell className="text-gray-700">{userById.get(r.user_id) || r.user_id.slice(0, 8)}</TableCell>
                <TableCell>
                  <Badge variant={r.action === "grant" ? "green" : "blue"} size="sm">
                    {r.action === "grant" ? "Согласие" : "Отзыв"}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 font-mono text-xs">{r.ip ?? "—"}</TableCell>
                <TableCell className="text-gray-600">{r.consent_version}</TableCell>
                <TableCell className="text-gray-600 max-w-[200px] truncate text-xs" title={r.user_agent ?? undefined}>
                  {r.user_agent ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            {!list.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-600 py-10">
                  {hasActiveFilters ? "По фильтрам ничего не найдено" : "Записей пока нет"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {list.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{hasMore ? `Показано ${PAGE_SIZE}· есть ещё` : `Показано ${list.length}`}</span>
            {nextCursor && (
              <a
                href={`/admin/consent-logs${buildQs({ cursor: nextCursor })}`}
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
