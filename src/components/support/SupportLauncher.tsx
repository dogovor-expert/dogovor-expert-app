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
const COLLAPSE_KEY = "support_launcher_collapsed";

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
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-4 right-4 z-50 w-[min(92vw,380px)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 pb-safe"
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
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<Tab>(CHAT_ENABLED ? "chat" : "problem");
  const [visitorId, setVisitorId] = useState<string>("");
  const [unread, setUnread] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const collapsedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void resolveVisitorId().then(setVisitorId);
  }, []);

  // Свёрнутое состояние читаем из localStorage после гидратации (SSR рендерит развёрнутый вид).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* localStorage недоступен */
    }
  }, []);

  const collapse = () => {
    setCollapsed(true);
    try {
      localStorage.setItem(COLLAPSE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const expand = () => {
    setCollapsed(false);
    try {
      localStorage.setItem(COLLAPSE_KEY, "0");
    } catch {
      /* ignore */
    }
  };

  // Возвращаем фокус на видимый триггер при закрытии панели (1.11).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      if (collapsed) collapsedRef.current?.focus();
      else triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open, collapsed]);

  // При сворачивании/разворачивании переводим фокус на актуальный элемент.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (collapsed) collapsedRef.current?.focus();
    else triggerRef.current?.focus();
  }, [collapsed]);

  const closePanel = () => {
    setOpen(false);
    setTab(CHAT_ENABLED ? "chat" : "problem");
  };

  // Слушаем программное открытие (openChat()).
  useEffect(() => {
    const handler = () => {
      setTab(CHAT_ENABLED ? "chat" : "problem");
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

  return (
    <>
      {/* Плавающая кнопка поддержки (внизу справа) */}
      {!open && !collapsed && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-4 right-4 z-40 pb-safe">
          <div className="relative group">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => handleOpen(CHAT_ENABLED ? "chat" : "problem")}
              className="relative inline-flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full text-white font-semibold shadow-lg shadow-brand-600/30 bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 hover:shadow-xl hover:shadow-brand-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              aria-label="Поддержка"
            >
              {unread > 0 && (
                <span
                  className="absolute inset-0 rounded-full bg-brand-400/40 animate-ping"
                  aria-hidden="true"
                />
              )}
              <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 ring-1 ring-white/25">
                <Headphones className="w-5 h-5" />
              </span>
              <span className="relative text-sm hidden sm:inline">Поддержка</span>
              {unread > 0 && (
                <span className="relative ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold bg-red-500 text-white rounded-full ring-2 ring-white/80">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={collapse}
              className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-slate-500 border border-slate-200 shadow-md opacity-90 transition hover:text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label="Скрыть кнопку поддержки"
              title="Скрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Свёрнутая тонкая вкладка у правого края */}
      {!open && collapsed && (
        <button
          ref={collapsedRef}
          type="button"
          onClick={expand}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 inline-flex flex-col items-center gap-2 px-2 py-4 rounded-l-2xl text-white shadow-lg shadow-brand-600/30 bg-gradient-to-b from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 hover:pr-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Развернуть кнопку поддержки"
          title="Поддержка"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180">
            Поддержка
          </span>
          {unread > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold bg-red-500 text-white rounded-full">
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
