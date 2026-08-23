"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Paperclip, Monitor, Mail, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";
import { bulkFeedbackStatus, replyFeedback } from "@/app/admin/feedback/actions";

interface Feedback {
  id: string;
  ticket_no: string;
  type: string;
  doc_slug: string | null;
  doc_name: string | null;
  tool: string | null;
  message: string;
  email: string;
  screenshots: string[] | null;
  tech: any;
  status: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  doc_error: "Ошибка в документе",
  site_bug: "Не работает функция",
  feature_request: "Новое / инструмент",
  other: "Другое",
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  doc_error: <Mail className="w-3.5 h-3.5" />,
  site_bug: <Mail className="w-3.5 h-3.5" />,
  feature_request: <Mail className="w-3.5 h-3.5" />,
  other: <Mail className="w-3.5 h-3.5" />,
};

const STATUS_VARIANT: Record<string, "blue" | "green" | "gray"> = {
  new: "blue",
  done: "green",
  spam: "gray",
};

const fmt = (s?: string) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function FeedbackAdminTable() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const res = await fetch(`/api/feedback?${params.toString()}`).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    }
    setLoading(false);
  }, [type, status]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const changeStatus = async (id: string, newStatus: string) => {
    setBusy(true);
    const res = await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setBusy(false);
    if (res.ok) {
      setData((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
      setSelectedRow((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
    }
  };

  const idsString = Array.from(selected).join(",");

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <Select
          label="Тип"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: "", label: "Все типы" },
            { value: "doc_error", label: "Ошибка в документе" },
            { value: "site_bug", label: "Не работает функция" },
            { value: "feature_request", label: "Новое / инструмент" },
            { value: "other", label: "Другое" },
          ]}
          className="w-64"
        />
        <Select
          label="Статус"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "", label: "Все статусы" },
            { value: "new", label: "Новая" },
            { value: "done", label: "Обработана" },
            { value: "spam", label: "Спам" },
          ]}
          className="w-48"
        />
        <button onClick={load} className="text-sm text-brand-600 hover:underline mb-1">
          Обновить
        </button>
      </div>

      {selected.size > 0 && (
        <form action={bulkFeedbackStatus} className="flex items-end gap-2 flex-wrap bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
          <input type="hidden" name="ids" value={idsString} />
          <span className="text-sm text-gray-600">Выбрано: <b>{selected.size}</b></span>
          <Select
            label=""
            name="status"
            value="done"
            onChange={() => {}}
            options={[
              { value: "new", label: "Новая" },
              { value: "done", label: "Обработана" },
              { value: "spam", label: "Спам" },
            ]}
            className="w-44"
          />
          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
            Применить
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="text-sm text-gray-600 hover:underline">
            Сбросить
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="w-10">
                <button onClick={() => setSelected(data.length ? new Set(data.map((d) => d.id)) : new Set())} title="Выбрать все" className="text-gray-600 hover:text-gray-700">
                  {selected.size === data.length && data.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
              </TableHeader>
              <TableHeader>№</TableHeader>
              <TableHeader>Тип</TableHeader>
              <TableHeader>Объект</TableHeader>
              <TableHeader>От</TableHeader>
              <TableHeader>Сообщение</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>Дата</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((f) => (
              <TableRow key={f.id} className="cursor-pointer hover:bg-brand-50/40">
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggle(f.id)} className="text-gray-600 hover:text-gray-700">
                    {selected.has(f.id) ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </TableCell>
                <TableCell className="font-medium text-gray-900 whitespace-nowrap" onClick={() => setSelectedRow(f)}>{f.ticket_no}</TableCell>
                <TableCell onClick={() => setSelectedRow(f)}>
                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                    {TYPE_ICON[f.type]}
                    {TYPE_LABELS[f.type] || f.type}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600 max-w-[180px] truncate" onClick={() => setSelectedRow(f)}>
                  {f.doc_name || f.tool || "—"}
                </TableCell>
                <TableCell className="text-gray-600 max-w-[180px] truncate" onClick={() => setSelectedRow(f)}>{f.email}</TableCell>
                <TableCell className="text-gray-600 max-w-[280px] truncate" onClick={() => setSelectedRow(f)}>{f.message}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <select
                    value={f.status}
                    disabled={busy}
                    onChange={(e) => changeStatus(f.id, e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="new">Новая</option>
                    <option value="done">Обработана</option>
                    <option value="spam">Спам</option>
                  </select>
                </TableCell>
                <TableCell className="text-gray-600 whitespace-nowrap" onClick={() => setSelectedRow(f)}>{fmt(f.created_at)}</TableCell>
              </TableRow>
            ))}
            {!loading && !data.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-600 py-10">Заявок нет</TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-600 py-10">Загрузка…</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedRow(null)} />
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">{selectedRow.ticket_no}</h2>
                <Badge variant={STATUS_VARIANT[selectedRow.status] || "gray"} size="sm">{selectedRow.status}</Badge>
              </div>
              <button onClick={() => setSelectedRow(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="blue" size="sm">{TYPE_LABELS[selectedRow.type] || selectedRow.type}</Badge>
                {selectedRow.doc_name && <Badge variant="gray" size="sm">Документ: {selectedRow.doc_name}</Badge>}
                {selectedRow.tool && <Badge variant="gray" size="sm">Инструмент: {selectedRow.tool}</Badge>}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Сообщение</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-3">{selectedRow.message}</p>
              </div>

              {selectedRow.screenshots?.length ? (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> Скриншоты ({selectedRow.screenshots.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRow.screenshots.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`screenshot-${i}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5" /> Техданные
                </p>
                <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 overflow-x-auto">{JSON.stringify(selectedRow.tech, null, 2)}</pre>
              </div>

              <div className="text-sm text-gray-600">
                От: <span className="text-gray-800">{selectedRow.email}</span> · {fmt(selectedRow.created_at)}
              </div>

              <form action={replyFeedback} className="border-t border-gray-100 pt-4 space-y-2">
                <input type="hidden" name="id" value={selectedRow.id} />
                <p className="text-xs font-semibold text-gray-600 uppercase">Ответить пользователю</p>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Текст ответа (придёт на email пользователя, заявка отметится обработанной)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  Отправить ответ
                </button>
              </form>

              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-600">Статус:</span>
                <select
                  value={selectedRow.status}
                  disabled={busy}
                  onChange={(e) => changeStatus(selectedRow.id, e.target.value)}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="new">Новая</option>
                  <option value="done">Обработана</option>
                  <option value="spam">Спам</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
