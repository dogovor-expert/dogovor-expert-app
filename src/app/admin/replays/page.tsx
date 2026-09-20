import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { listReplaySessionsFiltered, type ReplaySessionRow } from "@/lib/replayQueries";
import { PlaySquare, Search } from "lucide-react";
import { ReplayDeleteButton, ReplayBulkDelete } from "@/components/admin/replay/ReplayActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Записи визитов" };

const PAGE_SIZE = 50;
const DAY_OPTIONS = [7, 30, 90] as const;
const DEVICE_LABELS: Record<string, string> = {
  mobile: "Телефон",
  tablet: "Планшет",
  desktop: "Компьютер",
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} Б`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} КБ`;
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(s: ReplaySessionRow): string {
  const ms = new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime();
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec} с`;
  return `${Math.floor(sec / 60)} мин ${sec % 60} с`;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function AdminReplaysPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage("admin");
  const sp = await searchParams;

  const daysRaw = Number(one(sp.days));
  const days = (DAY_OPTIONS as readonly number[]).includes(daysRaw) ? daysRaw : 30;
  const device = ["mobile", "tablet", "desktop"].includes(one(sp.device)) ? one(sp.device) : "";
  const query = one(sp.q).slice(0, 80);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { rows, total } = await listReplaySessionsFiltered({
    days,
    device: device || null,
    query: query || null,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (over: Record<string, string | number>): string => {
    const p = new URLSearchParams();
    p.set("days", String(days));
    if (device) p.set("device", device);
    if (query) p.set("q", query);
    for (const [k, v] of Object.entries(over)) p.set(k, String(v));
    return `/admin/replays?${p.toString()}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Записи визитов</h1>
        <p className="text-gray-600 text-sm">
          Записи поведения (rrweb) за последние {days} дней. Пишутся только по согласию, поля форм
          маскируются; разделы безопасности, биллинга и авторизации не записываются.
        </p>
      </div>

      <Card className="p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Период
            <select
              name="days"
              defaultValue={String(days)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} дней
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Устройство
            <select
              name="device"
              defaultValue={device}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            >
              <option value="">Все</option>
              <option value="mobile">Телефон</option>
              <option value="tablet">Планшет</option>
              <option value="desktop">Компьютер</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 flex-1 min-w-[200px]">
            Поиск
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="session_id или входной путь"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Search className="w-4 h-4" /> Найти
          </button>
          {(device || query) && (
            <Link href={buildHref({ device: "", q: "", page: 1 })} className="text-sm text-gray-500 hover:text-gray-700 py-2">
              Сбросить
            </Link>
          )}
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-gray-500">
          Найдено: <strong className="text-gray-800">{total}</strong>
        </span>
        <ReplayBulkDelete defaultDays={30} />
      </div>

      <Card padding="none" className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {device || query
              ? "По заданным фильтрам записей нет."
              : "Пока нет записей. Они появятся, когда посетители с принятой аналитикой проведут время на сайте."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Начало</TableHeader>
                  <TableHeader>Вход</TableHeader>
                  <TableHeader>Длительность</TableHeader>
                  <TableHeader>Устройство</TableHeader>
                  <TableHeader>Размер</TableHeader>
                  <TableHeader>Пользователь</TableHeader>
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.session_id}>
                    <TableCell className="whitespace-nowrap">{fmtDateTime(s.started_at)}</TableCell>
                    <TableCell className="text-gray-600 max-w-[220px] truncate">{s.entry_path ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{duration(s)}</TableCell>
                    <TableCell>{s.device ? DEVICE_LABELS[s.device] ?? s.device : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtBytes(s.size_bytes)}</TableCell>
                    <TableCell>
                      {s.user_id ? <Badge variant="green">вошёл</Badge> : <span className="text-gray-400 text-sm">аноним</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/replays/${s.session_id}`}
                          className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline px-2"
                        >
                          <PlaySquare className="w-4 h-4" />
                          Смотреть
                        </Link>
                        <ReplayDeleteButton sessionId={s.session_id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link href={buildHref({ page: page - 1 })} className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
              ← Назад
            </Link>
          )}
          <span className="text-gray-500">
            Страница {page} из {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildHref({ page: page + 1 })} className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
              Вперёд →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
