"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, MessageCircle } from "lucide-react";

interface ThreadPreview {
  visitorId: string;
  name: string | null;
  email: string | null;
  online: boolean;
  lastText: string | null;
  lastRole: "visitor" | "operator" | null;
  lastTs: number | null;
  total: number;
}

interface ChatMessage {
  id: string;
  role: "visitor" | "operator";
  text: string;
  ts: number;
  name?: string;
}

function fmtTs(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatInbox() {
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/chat", { cache: "no-store" });
      if (!r.ok) return;
      const j = (await r.json()) as { threads?: ThreadPreview[] };
      setThreads(j.threads ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (id: string) => {
    setHistoryLoading(true);
    try {
      const r = await fetch(`/api/admin/chat?visitorId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (!r.ok) return;
      const j = (await r.json()) as { messages?: ChatMessage[]; online?: boolean };
      setMessages(j.messages ?? []);
      setOnline(!!j.online);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
    const t = setInterval(() => { void loadThreads(); }, 15_000);
    return () => clearInterval(t);
  }, [loadThreads]);

  useEffect(() => {
    if (!selected) return;
    void loadHistory(selected);
    const t = setInterval(() => { void loadHistory(selected); }, 5_000);
    return () => clearInterval(t);
  }, [selected, loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-4 items-start">
      {/* Список диалогов */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Загрузка…
          </div>
        ) : threads.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Активных диалогов пока нет
          </div>
        ) : (
          threads.map((t) => (
            <button
              key={t.visitorId}
              onClick={() => setSelected(t.visitorId)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                selected === t.visitorId ? "bg-brand-50/60" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    t.online ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                  title={t.online ? "Онлайн" : "Оффлайн"}
                />
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {t.name || `Гость #${t.visitorId.slice(0, 6)}`}
                </p>
                <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
                  {fmtTs(t.lastTs)}
                </span>
              </div>
              {t.email && <p className="text-[11px] text-gray-500 truncate mt-0.5">{t.email}</p>}
              <p className="text-xs text-gray-600 truncate mt-1">
                {t.lastRole === "operator" ? "Вы: " : ""}
                {t.lastText ?? "—"}
              </p>
            </button>
          ))
        )}
      </div>

      {/* История */}
      <div className="bg-white border border-gray-200 rounded-xl flex flex-col max-h-[70vh]">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-400">
            <MessageCircle className="w-10 h-10 mb-3" />
            <p className="text-sm">Выберите диалог слева</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-gray-300"}`}
              />
              <p className="text-sm font-semibold text-gray-900">
                {selected.startsWith("v-") || selected.includes("-")
                  ? selected.slice(0, 8)
                  : selected}
              </p>
              <span className="text-xs text-gray-400">
                {online ? "онлайн" : "офлайн"}
              </span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {historyLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-10">Сообщений нет</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "operator" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "operator"
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.text}
                      <div
                        className={`text-[9px] mt-1 ${
                          m.role === "operator" ? "text-brand-200" : "text-gray-400"
                        }`}
                      >
                        {fmtTs(m.ts)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
