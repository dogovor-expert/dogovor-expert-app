"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Search, Trash2, RotateCcw, AlertTriangle, Clock, FileText, Info } from "lucide-react";
import { tokenGroups, textMatchesTokens } from "@/lib/search";

interface DeletedDoc {
  id: number;
  name: string;
  type: string;
  deletedBy: string;
  deletedAt: string;
  expiresAt: string;
  size: string;
}

const initialDocs: DeletedDoc[] = [
  { id: 1, name: "ДКП на Lada Vesta (черновик)", type: "ДКП", deletedBy: "Иван И.", deletedAt: "24.05.2026 15:30", expiresAt: "24.06.2026", size: "1.2 MB" },
  { id: 2, name: "Старая доверенность 2024", type: "Доверенность", deletedBy: "Петр П.", deletedAt: "22.05.2026 11:20", expiresAt: "22.06.2026", size: "0.8 MB" },
  { id: 3, name: "Заявление в ГИБДД (дубль)", type: "ГИБДД", deletedBy: "Сидор С.", deletedAt: "20.05.2026 09:15", expiresAt: "20.06.2026", size: "1.5 MB" },
  { id: 4, name: "Акт осмотра от 15.03.2026", type: "Акт", deletedBy: "Иван И.", deletedAt: "18.05.2026 16:45", expiresAt: "18.06.2026", size: "0.6 MB" },
  { id: 5, name: "ДКП на мотоцикл (старый)", type: "ДКП", deletedBy: "Петр П.", deletedAt: "15.05.2026 14:00", expiresAt: "15.06.2026", size: "2.1 MB" },
  { id: 6, name: "Договор аренды (отменён)", type: "Договор", deletedBy: "Анна К.", deletedAt: "12.05.2026 10:30", expiresAt: "12.06.2026", size: "1.8 MB" },
  { id: 7, name: "Черновик заявления от 05.05", type: "Заявление", deletedBy: "Сидор С.", deletedAt: "10.05.2026 08:00", expiresAt: "10.06.2026", size: "0.4 MB" },
  { id: 8, name: "Уведомление о ДТП (тест)", type: "ОСАГО", deletedBy: "Мария С.", deletedAt: "08.05.2026 17:50", expiresAt: "08.06.2026", size: "0.9 MB" },
];

const typeColor: Record<string, "red" | "blue" | "green" | "purple" | "amber" | "gray"> = {
  ДКП: "red",
  Доверенность: "blue",
  ГИБДД: "green",
  Акт: "purple",
  Договор: "amber",
  Заявление: "gray",
  ОСАГО: "red",
};

export default function TrashPage() {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleSelect = (id: number) => {
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

  const handleRestore = () => {
    setDocs(prev => prev.filter(d => !selected.has(d.id)));
    setSelected(new Set());
  };

  const handlePermanentDelete = () => {
    setConfirmDelete(true);
  };

  const confirmPermanentDelete = () => {
    setDocs(prev => prev.filter(d => !selected.has(d.id)));
    setSelected(new Set());
    setConfirmDelete(false);
  };

  const filtered = docs.filter(d => {
    const tokens = tokenGroups(search);
    if (tokens.length === 0) return true;
    return textMatchesTokens(`${d.name} ${d.type}`, tokens);
  });

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
          {filtered.map(doc => {
            const expDate = new Date(doc.expiresAt.split(".").reverse().join("-"));
            const now = new Date();
            const daysLeft = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7;
            const isExpired = daysLeft < 0;
            return (
              <div key={doc.id} className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50/50 ${selected.has(doc.id) ? "bg-brand-50/50" : ""}`}>
                <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleSelect(doc.id)} className="rounded border-gray-300" />
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-600">Удалил: {doc.deletedBy}</p>
                  </div>
                </div>
                <Badge variant={typeColor[doc.type] || "gray"} size="sm" className="hidden sm:inline-flex">{doc.type}</Badge>
                <span className="text-xs text-gray-600 w-28 text-center hidden md:block">{doc.deletedAt}</span>
                <span className={`text-xs w-24 text-center flex items-center justify-center gap-1 hidden sm:flex ${isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-amber-700 font-medium" : "text-gray-600"}`}>
                  {isExpired ? <>Просрочен</> : isExpiringSoon ? <><Clock className="w-3 h-3" />{daysLeft} дн.</> : doc.expiresAt}
                </span>
                <span className="text-xs text-gray-600 w-14 text-center">{doc.size}</span>
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
          })}
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
