"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store", signal });
      if (!r.ok) return;
      const j = await r.json();
      setItems(j.notifications ?? []);
      setUnread(j.unread ?? 0);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      // offline — молча пропускаем опрос
    }
  }, []);

  useEffect(() => {
    let controller: AbortController | null = null;

    const poll = () => {
      if (document.hidden) return; // не опрашиваем скрытую вкладку
      controller?.abort();
      controller = new AbortController();
      void load(AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]));
    };

    poll();
    const t = setInterval(poll, POLL_MS);
    const onVisibility = () => {
      if (!document.hidden) poll();
    };

    document.addEventListener("visibilitychange", onVisibility);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);

    return () => {
      controller?.abort();
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    buttonRef.current?.focus(); // возврат фокуса на кнопку (APG)
  }, []);

  // Клик вне меню закрывает и возвращает фокус
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, close]);

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(items.length > 0 ? 0 : -1);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const count = items.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) => (p + 1) % Math.max(count, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) => (p - 1 + Math.max(count, 1)) % Math.max(count, 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(count > 0 ? 0 : -1);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(count - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // фокус уходит за пределы меню — закрываем
      close();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex] && !items[activeIndex].read_at) {
        void markOne(items[activeIndex].id);
      }
    }
  };

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => null);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  };

  const markOne = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="notifications-menu"
        className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
        aria-label="Уведомления"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-menu"
          role="menu"
          aria-label="Уведомления"
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
          onKeyDown={handleMenuKeyDown}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Уведомления</p>
            {unread > 0 && (
              <button
                role="menuitem"
                onClick={markAll}
                className="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Прочитать все
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-gray-500">Пока нет уведомлений</p>
            ) : (
              items.map((n, i) => (
                <button
                  key={n.id}
                  role="menuitem"
                  tabIndex={activeIndex === i ? 0 : -1}
                  onClick={() => !n.read_at && markOne(n.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${!n.read_at ? "bg-brand-50/40" : ""}`}
                >
                  <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    {!n.read_at && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
                    {n.title}
                  </p>
                  {n.body && <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.body}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
