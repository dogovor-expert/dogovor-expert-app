"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLL_MS = 2500;

interface ChatMessage {
  id: string;
  role: "visitor" | "operator";
  text: string;
  ts: number;
  name?: string;
}

interface Profile {
  name: string;
  email: string;
}

function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem("support_profile");
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export default function ChatPanel({ visitorId }: { visitorId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stage, setStage] = useState<"pre" | "chat">("pre");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // При монтировании — если профиль уже есть, сразу в чат.
  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setStage("chat");
    }
  }, []);

  // Поллинг сообщений (только в стадии чата).
  useEffect(() => {
    if (stage !== "chat") return;
    let active = true;
    let since = 0;

    const tick = async () => {
      try {
        const res = await fetch(
          `/api/chat?visitorId=${encodeURIComponent(visitorId)}&since=${since}&clear=1`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          if (res.status === 503) setUnavailable(true);
          return;
        }
        const data = await res.json();
        const incoming: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];
        if (incoming.length) {
          setMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const merged = [...prev, ...incoming.filter((m: ChatMessage) => !ids.has(m.id))];
            merged.sort((a, b) => a.ts - b.ts);
            return merged;
          });
          since = incoming[incoming.length - 1].ts;
        }
      } catch {
        /* сеть — следующий тик */
      }
    };

    tick();
    const iv = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [stage, visitorId]);

  // Автоскролл вниз.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const startChat = (p: Profile) => {
    localStorage.setItem("support_profile", JSON.stringify(p));
    setProfile(p);
    setStage("chat");
    setError(null);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !profile || sending) return;
    setSending(true);
    setError(null);
    const ctx = {
      url: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
      lang: typeof navigator !== "undefined" ? navigator.language : "",
    };
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          name: profile.name,
          email: profile.email,
          consent: true,
          text,
          ctx,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 503) {
          setUnavailable(true);
        } else {
          setError(data?.message || "Не удалось отправить. Попробуйте ещё раз.");
        }
        return;
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
      }
      setDraft("");
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  };

  if (stage === "pre") {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-600 mb-3">
          Оставьте контакт — мы ответим в чате в течение 24 часов в рабочий день.
        </p>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Ваше имя</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 mb-3"
        />
        <label className="block text-xs font-semibold text-slate-700 mb-1">Email для ответа</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 mb-3"
        />
        <label className="flex items-start gap-2 text-xs text-slate-600 mb-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Я согласен(а) на обработку персональных данных по{" "}
            <a href="/privacy" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">
              политике конфиденциальности
            </a>
            .
          </span>
        </label>
        <button
          type="button"
          disabled={!name.trim() || !EMAIL_RE.test(email.trim()) || !consent}
          onClick={() => startChat({ name: name.trim(), email: email.trim() })}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition"
        >
          Начать чат
        </button>
        <p className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Переписка поступает оператору в Telegram и хранится до 30 дней.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[min(70vh,520px)]">
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50">
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-500 mt-6">
            Напишите ваш вопрос — оператор получит его в Telegram.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.role === "visitor"
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {unavailable && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Чат временно недоступен. Опишите проблему через «Сообщить о проблеме».
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 p-3">
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ваше сообщение…"
            className="flex-1 resize-none px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 max-h-28"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || sending}
            className="inline-flex items-center justify-center w-10 h-10 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition flex-shrink-0"
            aria-label="Отправить"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
