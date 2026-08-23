"use client";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Inbox, Phone, Package } from "lucide-react";

interface Lead {
  id: string;
  service: "docs" | "full";
  brand: string;
  vin: string;
  phone: string;
  status: "new" | "paid" | "docs" | "filed" | "done" | "canceled";
  created_at: string;
}

const STATUS_LABELS: Record<Lead["status"], { label: string; variant: "amber" | "green" | "blue" | "teal" | "gray" | "red" }> = {
  new: { label: "Новая", variant: "amber" },
  paid: { label: "Оплачена", variant: "green" },
  docs: { label: "Документы готовы", variant: "blue" },
  filed: { label: "Подано на таможню", variant: "teal" },
  done: { label: "Завершена", variant: "gray" },
  canceled: { label: "Отменена", variant: "red" },
};

const SERVICE_LABELS: Record<Lead["service"], string> = {
  docs: "Комплект документов · 3 990 ₽",
  full: "Под ключ · 9 990 ₽",
};

export default function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/leads").catch(() => null);
    if (res?.ok) {
      const { data } = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: string, status: Lead["status"]) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-brand-500" />
          Заявки на растаможку
          <Badge variant="blue" size="sm">{leads.length}</Badge>
        </h2>
        <button onClick={load} className="text-xs text-brand-600 hover:underline">
          Обновить
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 py-6 text-center">Загрузка заявок…</p>
      ) : leads.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-800 mb-1">Заявок пока нет</p>
          <p className="text-xs text-gray-600">Новые заявки из калькулятора «Растаможка» появятся здесь</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{l.brand}</p>
                <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{l.phone}</span>
                  <span className="inline-flex items-center gap-1"><Package className="w-3 h-3" />{SERVICE_LABELS[l.service]}</span>
                  <span className="text-gray-600">{new Date(l.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </p>
                {l.vin && <p className="text-[11px] text-gray-600 mt-0.5 font-mono">VIN: {l.vin}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={STATUS_LABELS[l.status].variant} size="sm" dot>
                  {STATUS_LABELS[l.status].label}
                </Badge>
                <select
                  value={l.status}
                  onChange={(e) => changeStatus(l.id, e.target.value as Lead["status"])}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  <option value="new">Новая</option>
                  <option value="paid">Оплачена</option>
                  <option value="docs">Документы готовы</option>
                  <option value="filed">Подано на таможню</option>
                  <option value="done">Завершена</option>
                  <option value="canceled">Отменена</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}