"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X, MessageCircle, Bug, Headphones } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { createClient } from "@/lib/supabase/client";

const FeedbackForm = dynamic(() => import("@/components/feedback/FeedbackForm"), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-slate-600">Загрузка формы…</div>,
});

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "1";
const VISITOR_KEY = "support_visitor_id";
const HIDDEN_KEY = "support_launcher_hidden";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

/**
 * Для залогиненного пользователя visitorId = user.id (Supabase auth UUID):
 * переписка не теряется при смене устройства/очистке cookie, а админ может
 * открыть чат напрямую из карточки /admin/users/[id]. Гости — анонимный ID.
 */
async function resolveVisitorId(): Promise<string> {
  try {
    const { data } = await createClient().auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    // не залогинен / supabase недоступен — анонимный ID
  }
  return getVisitorId();
}

type Tab = "chat" | "problem";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function SupportPanel({
  tab,
  setTab,
  onClose,
  visitorId,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onClose: () => void;
  visitorId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((n) => !n.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-panel-title"
      className="fixed bottom-[calc(4.75rem+3.5rem+0.75rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1rem+3.5rem+0.75rem)] right-4 z-50 w-[min(92vw,380px)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 pb-safe support-panel-grow"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="flex items-center gap-1 px-2 py-2 border-b border-slate-100 bg-white">
        <span id="support-panel-title" className="sr-only">Поддержка</span>
        {CHAT_ENABLED && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === "chat"}
            onClick={() => setTab("chat")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-sm font-semibold transition ${
              tab === "chat" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Чат
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={tab === "problem"}
          onClick={() => setTab("problem")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-sm font-semibold transition ${
            tab === "problem" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Bug className="w-4 h-4" />
          Проблема
        </button>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {tab === "chat" ? (
        <ChatPanel visitorId={visitorId} />
      ) : (
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <FeedbackForm
            compact
            onSuccess={() => setTimeout(() => onClose(), 2500)}
          />
        </div>
      )}
    </div>
  );
}

/** Программно открыть чат (используется в help/page.tsx и др.). */
export function openChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("open-support-chat"));
}

export default function SupportLauncher() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState<Tab>(CHAT_ENABLED ? "chat" : "problem");
  const [visitorId, setVisitorId] = useState<string>("");
  const [unread, setUnread] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hiddenRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void resolveVisitorId().then(setVisitorId);
  }, []);

  // «Скрытый» режим читаем из localStorage после гидратации (SSR рендерит видимую кнопку).
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      /* localStorage недоступен */
    }
  }, []);

  const hide = () => {
    setHidden(true);
    setOpen(false);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const show = () => {
    if (hidden) setHidden(false);
    try {
      localStorage.setItem(HIDDEN_KEY, "0");
    } catch {
      /* ignore */
    }
  };

  // Возвращаем фокус на видимый триггер при закрытии панели (1.11).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      if (hidden) hiddenRef.current?.focus();
      else triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open, hidden]);

  // При скрытии/показе переводим фокус на актуальный элемент.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (hidden) hiddenRef.current?.focus();
    else triggerRef.current?.focus();
  }, [hidden]);

  const closePanel = () => {
    setOpen(false);
    setTab(CHAT_ENABLED ? "chat" : "problem");
  };

  // Слушаем программное открытие (openChat()).
  useEffect(() => {
    const handler = () => {
      setTab(CHAT_ENABLED ? "chat" : "problem");
      setHidden(false);
      setOpen(true);
    };
    window.addEventListener("open-support-chat", handler);
    return () => window.removeEventListener("open-support-chat", handler);
  }, []);

  // Опрос непрочитанных (пока панель закрыта).
  useEffect(() => {
    if (open || !CHAT_ENABLED || !visitorId) return;
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chat?visitorId=${encodeURIComponent(visitorId)}&meta=1`, {
          cache: "no-store",
        });
        if (res.ok) {
          const d = (await res.json()) as { unread?: unknown };
          if (active) setUnread(Number(d.unread) || 0);
        }
      } catch {
        /* ignore */
      }
    };
    void tick();
    const iv = setInterval(() => { void tick(); }, 12000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [open, visitorId]);

  const handleOpen = (t: Tab) => {
    setTab(t);
    setOpen(true);
    setUnread(0);
  };

  const basePos = "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-4";
  const showFab = !hidden;

  return (
    <>
      {/* FAB-кнопка поддержки — правый нижний угол (над MobileTabBar на мобиле).
          Панель позиционируется выше кнопки — «растёт» из неё. */}
      {showFab && (
        <div className={`fixed right-4 z-40 ${basePos}`}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => handleOpen(CHAT_ENABLED ? "chat" : "problem")}
            className="relative inline-flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg shadow-brand-600/30 bg-gradient-to-b from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            aria-label="Открыть чат поддержки"
          >
            <Headphones className="w-6 h-6" aria-hidden />
            {unread > 0 && !open && (
              <>
                <span className="absolute inset-0 rounded-full support-fab-pulse" aria-hidden />
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold bg-red-500 text-white rounded-full ring-2 ring-white/70 absolute -top-1 -right-1">
                  {unread > 9 ? "9+" : unread}
                </span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={hide}
            className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-slate-500 border border-slate-200 shadow-md transition hover:text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label="Скрыть кнопку поддержки"
            title="Скрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Точка на краю — когда поддержку свернули: лёгкий доступ, бейдж не теряется */}
      {!showFab && (
        <button
          ref={hiddenRef}
          type="button"
          onClick={show}
          className={`fixed right-3 z-40 inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500/70 backdrop-blur-sm shadow-md hover:bg-brand-600/90 hover:scale-110 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${basePos}`}
          aria-label="Показать кнопку поддержки"
          title="Показать поддержку"
        >
          {unread > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full ring-2 ring-white/70 absolute -top-2 -right-2">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <SupportPanel
          tab={tab}
          setTab={setTab}
          onClose={closePanel}
          visitorId={visitorId}
        />
      )}
    </>
  );
}
