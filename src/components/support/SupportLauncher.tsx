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
      className="fixed bottom-4 right-4 z-50 w-[min(92vw,380px)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 pb-safe"
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
  const [tab, setTab] = useState<Tab>(CHAT_ENABLED ? "chat" : "problem");
  const [visitorId, setVisitorId] = useState<string>("");
  const [unread, setUnread] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    resolveVisitorId().then(setVisitorId);
  }, []);

  // Возвращаем фокус на trigger при закрытии панели (1.11).
  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

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
          const d = await res.json();
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
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => handleOpen(CHAT_ENABLED ? "chat" : "problem")}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-colors pb-safe"
          aria-label="Поддержка"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Поддержка</span>
          {unread > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold bg-red-500 text-white rounded-full">
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
