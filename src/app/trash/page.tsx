"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, RotateCcw, AlertTriangle, Clock, FileText, Info } from "lucide-react";
import { tokenGroups, textMatchesTokens } from "@/lib/search";

interface TrashedDoc {
  id: string;
  template_id: string;
  title: string;
  fields: Record<string, string>;
  status: string;
  deleted_at: string;
  created_at: string;
  updated_at: string;
}

const TEMPLATE_NAMES: Record<string, string> = {
  "dkp-auto": "ДКП автомобиля",
  "act-transfer-auto": "Акт приёма-передачи ТС",
  "power-of-attorney-auto": "Доверенность на авто",
  "loan-agreement": "Договор займа",
  "rental-flat": "Договор аренды квартиры",
  // ... можно расширить при необходимости
};

function getTemplateName(templateId: string, title: string): string {
  if (title) return title;
  return TEMPLATE_NAMES[templateId] || templateId;
}

function getTemplateType(templateId: string): string {
  if (templateId.includes("dkp") || templateId.includes("sale")) return "ДКП";
  if (templateId.includes("power") || templateId.includes("attorney")) return "Доверенность";
  if (templateId.includes("rental") || templateId.includes("lease")) return "Договор";
  if (templateId.includes("loan") || templateId.includes("receipt")) return "Расписка";
  if (templateId.includes("act") || templateId.includes("transfer")) return "Акт";
  if (templateId.includes("statement") || templateId.includes("application")) return "Заявление";
  if (templateId.includes("osago") || templateId.includes("insurance")) return "ОСАГО";
  return "Документ";
}

const typeColor: Record<string, "red" | "blue" | "green" | "purple" | "amber" | "gray"> = {
  ДКП: "red",
  Доверенность: "blue",
  Аренда: "green",
  Расписка: "purple",
  Акт: "amber",
  Договор: "amber",
  Заявление: "gray",
  ОСАГО: "red",
  default: "gray",
};

export default function TrashPage() {
  const [docs, setDocs] = useState<TrashedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "ok" | "error" } | null>(null);

  const showToast = (text: string, type: "ok" | "error" = "ok") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trash");
      if (!res.ok) throw new Error("Failed to load");
      const { data } = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      showToast("Не удалось загрузить корзину", "error");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(d => d.id)));
    }
  };

  const handleRestore = async () => {
    if (selected.size === 0) return;
    try {
      const res = await fetch("/api/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Restore failed");
      showToast(`Восстановлено: ${selected.size}`);
      setSelected(new Set());
      loadDocs();
    } catch {
      showToast("Не удалось восстановить", "error");
    }
  };

  const handlePermanentDelete = () => {
    setConfirmDelete(true);
  };

  const confirmPermanentDelete = async () => {
    if (selected.size === 0) return;
    try {
      const res = await fetch("/api/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Purge failed");
      showToast(`Навсегда удалено: ${selected.size}`);
      setSelected(new Set());
      setConfirmDelete(false);
      loadDocs();
    } catch {
      showToast("Не удалось удалить навсегда", "error");
      setConfirmDelete(false);
    }
  };

  const filtered = docs.filter(d => {
    const tokens = tokenGroups(search);
    if (tokens.length === 0) return true;
    const name = getTemplateName(d.template_id, d.title);
    return textMatchesTokens(`${name} ${getTemplateType(d.template_id)}`, tokens);
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatExpiry = (deletedAt: string) => {
    const d = new Date(deletedAt);
    const exp = new Date(d.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
    const isExpired = daysLeft < 0;
    return { text: isExpired ? "Просрочен" : isExpiringSoon ? `${daysLeft} дн.` : exp.toLocaleDateString("ru-RU"), isExpired, isExpiringSoon, daysLeft };
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto border-3 border-brand-500 border-t-transparent rounded-full" />
            <p className="mt-4 text-gray-600">Загрузка корзины…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Корзина</h1>
          <p className="text-gray-600 mt-1">Документы автоматически удаляются через 30 дней</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={selected.size === 0} onClick={handleRestore}>
            <RotateCcw className="w-4 h-4" />
            Восстановить ({selected.size})
          </Button>
          <Button variant="danger" size="sm" disabled={selected.size === 0} onClick={handlePermanentDelete}>
            <Trash2 className="w-4 h-4" />
            Удалить навсегда
          </Button>
        </div>
      </div>

      {confirmDelete && (
        <Card variant="default" padding="md" className="mb-6 border-red-200 bg-red-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-1">Подтвердите удаление</p>
              <p className="text-sm text-red-700 mb-3">Вы действительно хотите безвозвратно удалить {selected.size} документ(ов)? Это действие нельзя отменить.</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={confirmPermanentDelete}>
                  <Trash2 className="w-4 h-4" />
                  Удалить {selected.size} документ(ов)
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Отмена</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in ${toast.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text" placeholder="Поиск в корзине..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      <Card variant="default" padding="none">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 text-xs text-gray-600 font-medium uppercase tracking-wider">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} className="rounded border-gray-300" />
          </label>
          <span className="flex-1">Название</span>
          <span className="w-20 text-center hidden sm:block">Тип</span>
          <span className="w-36 text-center hidden md:block">Удалён</span>
          <span className="w-28 text-center hidden sm:block">Истекает</span>
          <span className="w-16 text-center">Размер</span>
          <span className="w-24 text-center">Действия</span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500">
              <Trash2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Корзина пуста</p>
            </div>
          ) : (
            filtered.map(doc => {
              const name = getTemplateName(doc.template_id, doc.title);
              const type = getTemplateType(doc.template_id);
              const { text: expText, isExpired, isExpiringSoon } = formatExpiry(doc.deleted_at);
              const typeVariant = typeColor[type] || "gray";
              return (
                <div key={doc.id} className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50/50 ${selected.has(doc.id) ? "bg-brand-50/50" : ""}`}>
                  <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleSelect(doc.id)} className="rounded border-gray-300" />
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-600">Удалён: {formatDate(doc.deleted_at)}</p>
                    </div>
                  </div>
                  <Badge variant={typeVariant} size="sm" className="hidden sm:inline-flex">{type}</Badge>
                  <span className="text-xs text-gray-600 w-28 text-center hidden md:block">{formatDate(doc.deleted_at)}</span>
                  <span className={`text-xs w-24 text-center flex items-center justify-center gap-1 hidden sm:flex ${isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-amber-700 font-medium" : "text-gray-600"}`}>
                    {expText}
                  </span>
                  <span className="text-xs text-gray-600 w-14 text-center">—</span>
                  <div className="flex items-center gap-1 w-24 justify-center">
                    <button
                      onClick={() => {
                        setSelected(new Set([doc.id]));
                        handleRestore();
                      }}
                      className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors" title="Восстановить"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(new Set([doc.id]));
                        setConfirmDelete(true);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Удалить навсегда"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>Показано: {filtered.length} из {docs.length}</span>
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Автоочистка через 30 дней
          </span>
        </div>
      </Card>
    </div>
  );
}