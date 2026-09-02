"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X, MessageCircle, Bug, Headphones } from "lucide-react";
import ChatPanel from "./ChatPanel";

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

type Tab = "chat" | "problem";

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

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

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
          type="button"
          onClick={() => handleOpen(CHAT_ENABLED ? "chat" : "problem")}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-colors"
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
        <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,380px)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Шапка с вкладками */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-slate-100 bg-white">
            {CHAT_ENABLED && (
              <button
                type="button"
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
              onClick={() => setTab("problem")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-sm font-semibold transition ${
                tab === "problem" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bug className="w-4 h-4" />
              Проблема
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
                onSuccess={() => setTimeout(() => setOpen(false), 2500)}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
