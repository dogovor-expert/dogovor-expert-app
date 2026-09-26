"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Scales,
  Wallet,
  Plus,
  PaperPlaneRight,
  Paperclip,
  ShieldCheck,
  Star,
  ChatsCircle,
  FilePlus,
  Warning,
  CheckCircle,
  Gift,
  X,
  BookBookmark,
  Quotes,
  ArrowRight,
  ArrowSquareOut,
  FilePdf,
  FileDoc,
  MagnifyingGlass,
  Clock,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { messagesForTopup } from "@/lib/ai/pricing";

interface Source {
  code: string;
  article: string;
  edition_date: string | null;
  source_url?: string | null;
  locator?: string | null;
}

interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: Source[];
  confidence?: "high" | "low";
}

interface Thread {
  id: string;
  title: string;
  created_at: string;
}

const EXAMPLES = [
  "Продал машину, а штрафы приходят мне. Что делать?",
  "Задаток за квартиру не возвращают",
  "Могут ли уволить без отработки?",
  "Сосед залил — кто платит?",
];

const PACKS = [100, 300, 500, 1000];

/** Ключ последнего открытого диалога — чтобы восстанавливать чат после F5. */
const LAST_THREAD_KEY = "ai_last_thread";

const TRUST = [
  { icon: BookBookmark, title: "Отвечает по текстам законов", text: "RAG по действующим редакциям ГК, ЖК, ТК, КоАП — а не по памяти модели" },
  { icon: Quotes, title: "Цитата в каждом ответе", text: "Статья + дословная цитата + дата редакции. Нет цитаты — нет ответа" },
  { icon: ShieldCheck, title: "Двойная проверка", text: "Номера статей сверяются с базой, ответ прогоняется верификатором" },
  { icon: FilePlus, title: "Сразу в документ", text: "Кнопка «Составить» превращает ответ в договор из 570 шаблонов" },
];

const STEPS = [
  { title: "Поиск по кодексам", text: "Вопрос превращается в вектор, находим топ-5 статей в действующих редакциях" },
  { title: "Ответ только по найденному", text: "Модели запрещено цитировать статьи по памяти. Нет в базе — честно говорит «не знаю»" },
  { title: "Проверка цитат", text: "Каждая «ст. N» сверяется с базой: существует ли такая статья" },
  { title: "Карточка источников", text: "Статья + цитата + дата редакции под каждым ответом" },
];

const FAQ: Array<[string, string]> = [
  ["Это официальная юридическая консультация?", "Нет. Это информация общего характера по действующим законам — для ориентира и подготовки к визиту. Для суда и сложных споров нужен живой юрист: кнопка «Уточнить у поддержки» под каждым ответом."],
  ["Откуда берутся статьи? Они актуальны?", "Из официальных текстов кодексов в действующих редакциях. Под каждой цитатой — дата редакции. База обновляется при изменении законов."],
  ["Что будет, если ИИ не знает ответа?", "Он так и скажет — «в базе нет подходящей нормы», и предложит уточнить вопрос или написать в поддержку. Выдумывать номера статей ему запрещено настройками."],
  ["А почему не спросить бесплатно в обычном чат-боте?", "Бесплатный бот отвечает по памяти и выдумывает номера статей, не знает свежих редакций, а на выходе даёт только текст. У нас — цитаты из кодексов, проверка и готовый документ в 1 клик. Проверьте сами: первые 2 вопроса бесплатно."],
  ["Мои данные в безопасности?", "Переписка хранится в РФ, для обучения моделей не используется. Паспортные данные и адреса в вопросах лучше маскировать — для ответа они не нужны."],
  ["Баланс сгорит? Можно вернуть деньги?", "Баланс не сгорает никогда. Непотраченный остаток возвращается по заявлению в поддержку."],
];

async function fetchCsrf(): Promise<string> {
  const res = await fetch("/api/csrf", { credentials: "same-origin" });
  const data = (await res.json().catch(() => ({}))) as { token?: string };
  return data.token ?? "";
}

function scrollToChat() {
  document.getElementById("ai-chat")?.scrollIntoView({ behavior: "smooth" });
}

export default function AiYuristClient({
  initialAuthed = null,
}: {
  initialAuthed?: boolean | null;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [freeAsked, setFreeAsked] = useState(0);
  const [low, setLow] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupSum, setTopupSum] = useState(300);
  const [topupBusy, setTopupBusy] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(initialAuthed);
  const [topupDone, setTopupDone] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  const searchParams = useSearchParams();

  const loadBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/balance", { credentials: "same-origin" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      if (!res.ok) return;
      const d = (await res.json()) as { balance_kopeks: number; free_asked: number; low: boolean };
      setBalance(d.balance_kopeks);
      setFreeAsked(d.free_asked);
      setLow(d.low);
    } catch {
      /* ignore */
    }
  }, []);

  const openThread = useCallback(async (id: string) => {
    setThreadId(id);
    setError(null);
    try {
      window.localStorage.setItem(LAST_THREAD_KEY, id);
    } catch {
      /* приватный режим — не критично */
    }
    try {
      const token = await fetchCsrf();
      const res = await fetch("/api/ai/threads", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ threadId: id }),
      });
      if (!res.ok) return;
      const d = (await res.json()) as { messages: ChatMsg[] };
      setMsgs(d.messages ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  const newChat = useCallback(() => {
    setThreadId(null);
    setMsgs([]);
    setError(null);
    try {
      window.localStorage.removeItem(LAST_THREAD_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /** Список диалогов. Возвращает список — нужен для восстановления при загрузке. */
  const loadThreads = useCallback(async (): Promise<Thread[]> => {
    try {
      const res = await fetch("/api/ai/threads", { credentials: "same-origin" });
      if (!res.ok) return [];
      const d = (await res.json()) as { threads: Thread[] };
      setThreads(d.threads ?? []);
      return d.threads ?? [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    // Аноним (по данным сервера): не дёргаем защищённые /api/ai/* — иначе в
    // консоли появляются 401 на каждый заход, в т.ч. при рендере краулером.
    if (initialAuthed === false) return;
    void loadBalance();
    void (async () => {
      const list = await loadThreads();
      // Восстановление после перезагрузки: последний открытый диалог либо самый свежий.
      if (restoredRef.current || list.length === 0) return;
      restoredRef.current = true;
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(LAST_THREAD_KEY);
      } catch {
        /* ignore */
      }
      const target = stored && list.some((t) => t.id === stored) ? stored : list[0].id;
      await openThread(target);
    })();
    // Возврат с ЮKassa: показываем подтверждение один раз, чистим URL.
    if (searchParams.get("topup") === "success") {
      setTopupDone(true);
      window.history.replaceState(null, "", "/ai-yurist");
    }
  }, [initialAuthed, loadBalance, loadThreads, openThread, searchParams]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  /** Экспорт сообщения или всего диалога в фирменный PDF/DOCX (ленивая загрузка библиотек). */
  const exportMessages = useCallback(
    async (list: ChatMsg[], kind: "chat" | "message", fmt: "pdf" | "docx") => {
      setExporting(fmt);
      setError(null);
      try {
        const mod = await import("@/lib/ai/chatExport");
        const date = new Date().toLocaleDateString("ru-RU");
        const html = mod.buildChatHtml(list, { date });
        const name = mod.chatExportFilename(kind, new Date().toISOString().slice(0, 10));
        if (fmt === "pdf") await mod.downloadChatPdf(html, name);
        else await mod.downloadChatDocx(html, name);
      } catch {
        setError("Не удалось сформировать файл. Попробуйте ещё раз.");
      } finally {
        setExporting(null);
      }
    },
    []
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || sending) return;
      if (!consent) {
        setError("Поставьте галочку согласия на обработку данных — вопрос может содержать персональные данные.");
        return;
      }
      setError(null);
      setSending(true);
      setMsgs((m) => [...m, { role: "user", content: q }]);
      setDraft("");
      try {
        const token = await fetchCsrf();
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "x-csrf-token": token },
          body: JSON.stringify({ text: q, threadId, consent: true }),
        });
        if (res.status === 402) {
          setError("Недостаточно средств на AI-балансе. Пополните — от 100 ₽, деньги не сгорают.");
          setTopupOpen(true);
          setMsgs((m) => m.slice(0, -1));
          return;
        }
        if (res.status === 409) {
          setError("Параллельный запрос изменил баланс. Нажмите «Спросить» ещё раз.");
          setMsgs((m) => m.slice(0, -1));
          return;
        }
        if (!res.ok) {
          setError("Сервис временно недоступен. Деньги не списаны — попробуйте позже.");
          setMsgs((m) => m.slice(0, -1));
          return;
        }
        const d = (await res.json()) as {
          answer: string;
          sources: Source[];
          confidence: "high" | "low";
          thread_id: string;
          free: boolean;
          balance_kopeks: number;
        };
        setThreadId(d.thread_id);
        try {
          window.localStorage.setItem(LAST_THREAD_KEY, d.thread_id);
        } catch {
          /* ignore */
        }
        setBalance(d.balance_kopeks);
        setLow(d.balance_kopeks < 2000);
        setMsgs((m) => [...m, { role: "assistant", content: d.answer, sources: d.sources, confidence: d.confidence }]);
        void loadThreads();
        void loadBalance();
      } catch {
        setError("Сеть недоступна. Деньги не списаны — попробуйте позже.");
        setMsgs((m) => m.slice(0, -1));
      } finally {
        setSending(false);
      }
    },
    [consent, sending, threadId, loadBalance, loadThreads]
  );

  const doTopup = useCallback(async () => {
    setTopupBusy(true);
    try {
      const token = await fetchCsrf();
      const res = await fetch("/api/ai/topup", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ amountRub: topupSum }),
      });
      const d = (await res.json().catch(() => null)) as { confirmation_url?: string; error?: string } | null;
      if (d?.confirmation_url) {
        window.location.href = d.confirmation_url;
      } else {
        setError("Не удалось создать платёж. Попробуйте позже.");
      }
    } catch {
      setError("Не удалось создать платёж. Попробуйте позже.");
    } finally {
      setTopupBusy(false);
    }
  }, [topupSum]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Шапка */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <Scales size={26} weight="fill" className="text-brand-600" />
          AI-юрист
        </h1>
        <Badge>ответы по действующим законам</Badge>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold">
          <Wallet size={17} weight="fill" className="text-amber-600" />
          {balance === null ? "…" : `${Math.floor(balance / 100)} ₽`}
          <Button size="sm" onClick={() => setTopupOpen(true)}>Пополнить</Button>
        </div>
      </div>

      {/* Hero */}
      <div className="grid items-center gap-6 py-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-700">
            <Scales size={15} weight="fill" /> AI-юрист · отвечает по действующим законам
          </p>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Спросите по-русски — <span className="text-brand-600">ответим по закону</span> за 10 секунд
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Каждый ответ — со <b className="text-slate-900">ссылками на статьи</b> действующих редакций 2026 года,
            а не «из головы». Стоит <b className="text-slate-900">от 14 ₽</b> — в разы дешевле живого юриста.
            И сразу превращает ответ в <b className="text-slate-900">готовый документ</b>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button onClick={scrollToChat}>Задать вопрос — бесплатно <ArrowRight size={16} weight="bold" /></Button>
            <Button variant="outline" onClick={() => document.getElementById("ai-tariffs")?.scrollIntoView({ behavior: "smooth" })}>Сколько стоит</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-slate-600">
            <span className="flex items-center gap-1.5"><CheckCircle size={16} weight="fill" className="text-emerald-600" /> 2 первых вопроса — 0 ₽</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} weight="fill" className="text-emerald-600" /> Без подписки, баланс не сгорает</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} weight="fill" className="text-emerald-600" /> Цитаты статей в каждом ответе</span>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[13px] font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> AI-юрист онлайн
            <span className="ml-auto font-normal text-slate-400">RAG по кодексам</span>
          </div>
          <div className="p-4">
            <p className="mb-2.5 mr-10 rounded-xl rounded-tl-sm bg-brand-50 px-3.5 py-2.5 text-[13.5px]">Продал машину, а штрафы приходят мне. Что делать?</p>
            <div className="ml-10 rounded-xl rounded-tr-sm border border-slate-200 px-3.5 py-2.5 text-[13.5px]">
              Новый владелец обязан переоформить авто за <b>10 дней</b>. На 11-й день прекратите регистрацию сами через Госуслуги.
              <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                <b className="text-brand-700">п. 60 Правил № 1764</b> · «прежний владелец вправе прекратить регистрацию по истечении 10 суток» <span className="text-slate-400">· ред. 2026</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Преимущества */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map((t) => (
          <Card key={t.title} className="p-4">
            <t.icon size={22} weight="fill" className="text-brand-600" />
            <p className="mb-1 mt-2 text-[13.5px] font-bold">{t.title}</p>
            <p className="text-xs text-slate-500">{t.text}</p>
          </Card>
        ))}
      </div>

      {/* Инструмент */}
      <div id="ai-chat" className="scroll-mt-4 pt-6">
        <h2 className="text-xl font-extrabold">Попробуйте прямо здесь</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">Живой сервис: баланс, списание и пополнение работают по-настоящему.</p>

        {topupDone && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            <CheckCircle size={18} weight="fill" />
            Оплата прошла, баланс пополнен. Приятных вопросов!
            <button className="ml-auto text-emerald-600 underline" onClick={() => setTopupDone(false)}>Скрыть</button>
          </div>
        )}

        {low && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            <Warning size={18} weight="fill" />
            Баланс меньше 20 ₽ — хватит на 1 сообщение.
            <button className="ml-auto font-bold text-brand-700 underline" onClick={() => setTopupOpen(true)}>Пополнить</button>
          </div>
        )}

        {authed === false ? (
          <Card className="p-8 text-center">
            <Scales size={40} weight="fill" className="mx-auto text-brand-200" />
            <p className="mt-2 font-bold">Войдите, чтобы задавать вопросы</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Баланс и история привязаны к аккаунту. Это минута.</p>
            <div className="mt-4 flex justify-center gap-2.5">
              <Link href="/login"><Button>Войти</Button></Link>
              <Link href="/register"><Button variant="outline">Регистрация</Button></Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <details className="h-fit rounded-2xl border border-slate-200 bg-white p-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-bold">
                История диалогов{threads.length > 0 ? ` (${threads.length})` : ""}
              </summary>
              <div className="mt-2">
                <Button className="w-full" onClick={newChat}>
                  <Plus size={16} weight="bold" /> Новый вопрос
                </Button>
                {threads.length === 0 && <p className="mt-2 px-1 text-xs text-slate-500">Пока пусто — задайте первый вопрос.</p>}
                {threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => void openThread(t.id)}
                    className={`mt-1 block w-full truncate rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-slate-100 ${t.id === threadId ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600"}`}
                  >
                    {t.title}
                  </button>
                ))}
                {msgs.length > 0 && (
                  <div className="mt-3 grid gap-1.5">
                    <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => void exportMessages(msgs, "chat", "pdf")}>
                      <FilePdf size={14} /> Скачать диалог PDF
                    </Button>
                    <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => void exportMessages(msgs, "chat", "docx")}>
                      <FileDoc size={14} /> Скачать диалог DOCX
                    </Button>
                  </div>
                )}
              </div>
            </details>

            <Card className="hidden h-fit p-3 lg:block">
              <Button className="w-full" onClick={newChat}>
                <Plus size={16} weight="bold" /> Новый вопрос
              </Button>
              <p className="mb-1 mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">История</p>
              {threads.length === 0 && <p className="px-1 text-xs text-slate-500">Пока пусто — задайте первый вопрос.</p>}
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => void openThread(t.id)}
                  className={`mb-1 block w-full truncate rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-slate-100 ${t.id === threadId ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600"}`}
                >
                  {t.title}
                </button>
              ))}
              {msgs.length > 0 && (
                <div className="mt-3 grid gap-1.5">
                  <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => void exportMessages(msgs, "chat", "pdf")}>
                    <FilePdf size={14} /> Скачать диалог PDF
                  </Button>
                  <Button size="sm" variant="outline" disabled={exporting !== null} onClick={() => void exportMessages(msgs, "chat", "docx")}>
                    <FileDoc size={14} /> Скачать диалог DOCX
                  </Button>
                </div>
              )}
              <div className="mt-3 rounded-xl bg-gradient-to-br from-brand-50 to-emerald-50 p-3 text-xs">
                <p className="flex items-center gap-1 font-bold"><Gift size={15} weight="fill" /> {freeAsked < 2 ? `Осталось бесплатных: ${2 - freeAsked}` : "Бесплатные использованы"}</p>
                <p className="mt-1 text-slate-600">Дальше 19 ₽/сообщение. Баланс не сгорает.</p>
              </div>
            </Card>

            <Card className="flex min-h-[480px] flex-col p-0">
              <div ref={boxRef} className="max-h-[440px] flex-1 overflow-y-auto p-5">
                {msgs.length === 0 && (
                  <div className="py-6 text-center">
                    <Scales size={40} weight="fill" className="mx-auto text-brand-200" />
                    <p className="mt-2 font-bold">Опишите ситуацию своими словами</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                      Отвечаю по текстам действующих законов — со статьями и цитатами, а не «из головы».
                    </p>
                  </div>
                )}
                {msgs.map((m, i) =>
                  m.role === "user" ? (
                    <p key={i} className="mb-3 ml-10 rounded-xl rounded-tr-sm bg-brand-50 px-4 py-2.5 text-[14px]">{m.content}</p>
                  ) : (
                    <div key={i} className="mb-2 mr-10">
                      <div className="whitespace-pre-wrap rounded-xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-[14px]">{m.content}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 grid gap-1.5">
                          {m.sources.map((s, j) => {
                            const body = (
                              <>
                                <b className="text-brand-700">{s.code}, {s.article}</b>
                                <span className="block text-slate-400">ред. {s.edition_date ?? "—"} · проверено по базе</span>
                              </>
                            );
                            return s.source_url ? (
                              <a
                                key={j}
                                href={s.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-slate-200 border-l-4 border-l-brand-500 bg-slate-50 px-3 py-2 text-xs transition hover:border-brand-300 hover:bg-white"
                              >
                                {body}
                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                                  Открыть в источнике <ArrowSquareOut size={12} weight="bold" />
                                </span>
                              </a>
                            ) : (
                              <div key={j} className="rounded-lg border border-slate-200 border-l-4 border-l-brand-500 bg-slate-50 px-3 py-2 text-xs">
                                {body}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className={`rounded-md px-1.5 py-0.5 font-bold ${m.confidence === "high" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {m.confidence === "high" ? "Проверено · высокая" : "Проверьте у юриста · средняя"}
                        </span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Link href="/builder"><Button size="sm"><FilePlus size={14} weight="fill" /> Составить документ</Button></Link>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={exporting !== null}
                          onClick={() => void exportMessages(i > 0 && msgs[i - 1].role === "user" ? [msgs[i - 1], m] : [m], "message", "pdf")}
                        >
                          <FilePdf size={14} /> PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={exporting !== null}
                          onClick={() => void exportMessages(i > 0 && msgs[i - 1].role === "user" ? [msgs[i - 1], m] : [m], "message", "docx")}
                        >
                          <FileDoc size={14} /> DOCX
                        </Button>
                        <Button size="sm" variant="outline"><Star size={14} /> В избранное</Button>
                        <Button size="sm" variant="outline"><ChatsCircle size={14} /> Уточнить у поддержки</Button>
                      </div>
                    </div>
                  )
                )}
                {sending && (
                  <div className="mb-3 mr-10 flex gap-1.5 rounded-xl border border-slate-200 px-4 py-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                  </div>
                )}
              </div>

              {msgs.length === 0 && (
                <div className="flex flex-wrap gap-2 px-5 pb-2">
                  {EXAMPLES.map((e) => (
                    <button key={e} onClick={() => void send(e)} className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs text-brand-700 hover:bg-brand-100">
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p className="mx-5 mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  <Warning size={16} weight="fill" /> {error}
                </p>
              )}

              <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <button title="Прикрепить файл — скоро" className="rounded-xl border border-slate-200 p-3 text-slate-400" disabled>
                    <Paperclip size={18} weight="bold" />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void send(draft); }}
                    placeholder="Опишите ситуацию своими словами…"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                    maxLength={4000}
                  />
                  <Button onClick={() => void send(draft)} disabled={sending}>
                    <PaperPlaneRight size={16} weight="bold" /> Спросить
                  </Button>
                </div>
                <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                  Согласен на обработку вопроса (может содержать персональные данные). 1 сообщение = 19 ₽ · первые 2 — бесплатно.
                </label>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck size={14} /> Информация общего характера, не юридическая консультация. Номера статей — только из проверенной базы.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Почему точнее */}
      <div className="pt-8">
        <h2 className="text-xl font-extrabold">Почему точнее, чем обычный чат-бот</h2>
        <p className="mb-3 mt-1 max-w-3xl text-sm text-slate-500">Обычный ИИ отвечает по памяти — и выдумывает номера статей (за это юристов уже штрафуют в судах). Наш — по текстам законов:</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-4">
              <span className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-[13px] font-extrabold text-white">{i + 1}</span>
              <p className="mb-1 text-[13.5px] font-bold">{s.title}</p>
              <p className="text-xs text-slate-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Тарифы */}
      <div id="ai-tariffs" className="scroll-mt-4 pt-8">
        <h2 className="text-xl font-extrabold">Цены: баланс, без подписки</h2>
        <p className="mb-3 mt-1 max-w-3xl text-sm text-slate-500">Пополнили от 100 ₽ — тратите, пока не закончится. Баланс не сгорает. Чем больше сумма, тем больше бонус. Оплата картой МИР, Visa, СБП через ЮKassa.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((p) => (
            <Card key={p} className={`p-5 text-center ${p === 300 ? "border-2 border-brand-500" : ""}`}>
              {p === 300 && <p className="-mt-8 mb-2 inline-block rounded-full bg-brand-600 px-3 py-0.5 text-[10.5px] font-extrabold text-white">БЕРУТ ЧАЩЕ ВСЕГО</p>}
              <p className="text-2xl font-extrabold">{p} ₽</p>
              <p className="text-xl font-extrabold text-emerald-600">≈{messagesForTopup(p)} сообщений</p>
              <p className="text-xs text-slate-500">бонус {p >= 1000 ? "+30%" : p >= 500 ? "+20%" : p >= 300 ? "+10%" : "—"}</p>
              <Button className="mt-3 w-full" variant={p === 300 ? "primary" : "outline"} onClick={() => { setTopupSum(p); setTopupOpen(true); }}>Пополнить</Button>
            </Card>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
          <Gift size={19} weight="fill" /> <span><b>Первые 2 вопроса — бесплатно</b>, без карты. История списаний — каждый рубль видно.</span>
        </p>
      </div>

      {/* Почему не бесплатный чат */}
      <div className="pt-8">
        <h2 className="text-xl font-extrabold">«А почему не спросить бесплатно в ChatGPT?»</h2>
        <p className="mb-3 mt-1 max-w-3xl text-sm text-slate-500">Спросите. А потом проверьте номер каждой статьи, которую он назовёт. Вот разница:</p>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-[13px]">
            <tbody>
              {[
                ["Откуда статьи", "Из памяти — номера выдумываются", "Из кодексов: статья + цитата + дата редакции"],
                ["Законы 2026", "Срез знаний устаревает", "База обновляется при изменении законов"],
                ["На выходе", "Текст — проверяйте и перепечатывайте сами", "Готовый документ в 1 клик, 570 шаблонов"],
                ["Ваш договор", "«В целом нормально», без норм", "Разбор по пунктам со статьями и рисками — скоро"],
                ["Память дела", "Каждый раз с нуля", "История, черновики, контекст ваших сделок"],
                ["Ваши данные", "Уходят на обучение модели", "Не используются для обучения, файлы — 24 часа"],
              ].map(([label, free, us]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-500">{label}</td>
                  <td className="px-4 py-2.5 text-slate-400">{free}</td>
                  <td className="bg-brand-50/60 px-4 py-2.5 font-semibold text-brand-800">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-[13px] text-brand-800">
          <MagnifyingGlass size={19} weight="fill" /> <span><b>Проверьте сами за 0 ₽:</b> задайте один вопрос нам и бесплатному боту — и сверьте номера статей. Разница видна сразу.</span>
        </p>
      </div>

      {/* Дешевле платных */}
      <div className="pt-8">
        <h2 className="text-xl font-extrabold">Дешевле всех платных</h2>
        <Card className="mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead><tr className="bg-slate-900 text-left text-white">
              <th className="px-4 py-2.5 font-semibold"></th><th className="px-4 py-2.5 font-semibold">Наш AI-юрист</th><th className="px-4 py-2.5 font-semibold">Правовед.ru</th><th className="px-4 py-2.5 font-semibold">СберПраво</th><th className="px-4 py-2.5 font-semibold">Живой юрист</th>
            </tr></thead>
            <tbody>
              {[
                ["Цена вопроса", "от 14 ₽", "от 89 ₽", "1 299 ₽", "от 1 000 ₽"],
                ["Скорость", "~10 секунд", "часы, иногда дни", "по записи", "по записи"],
                ["Сразу в документ", "1 клик", "нет", "нет", "нет"],
                ["Ночью и в выходные", "да", "очередь", "нет", "нет"],
              ].map(([label, us, p, s, h]) => (
                <tr key={label} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-500">{label}</td>
                  <td className="bg-brand-50/60 px-4 py-2.5 font-bold text-brand-800">{us}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p}</td>
                  <td className="px-4 py-2.5 text-slate-500">{s}</td>
                  <td className="px-4 py-2.5 text-slate-500">{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* В документ */}
      <div className="mt-6 grid items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-700 to-indigo-600 p-7 text-white lg:grid-cols-[1fr_auto]">
        <div>
          <h3 className="text-xl font-extrabold">Ответ получен — документ соберём сами</h3>
          <p className="mt-1 text-[13.5px] opacity-85">Жалоба на штраф, претензия, договор задатка — 570 проверенных шаблонов за 5–7 минут.</p>
        </div>
        <Link href="/builder"><Button variant="secondary">Выбрать шаблон →</Button></Link>
      </div>

      {/* FAQ */}
      <div className="pt-8">
        <h2 className="mb-3 text-xl font-extrabold">Частые вопросы</h2>
        <div className="grid gap-2.5">
          {FAQ.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-[13.5px] font-bold">{q}</summary>
              <p className="mt-2 text-[13px] text-slate-500">{a}</p>
            </details>
          ))}
        </div>
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Clock size={17} weight="fill" className="text-slate-400" />
        Скоро: разбор договоров и фото, голосовые и видео. Следите за обновлениями.
      </p>

      {topupOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onClick={() => setTopupOpen(false)}>
          <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Пополнить AI-баланс</h3>
              <button onClick={() => setTopupOpen(false)} aria-label="Закрыть"><X size={20} /></button>
            </div>
            <p className="mb-3 text-[13px] text-slate-500">Деньги не сгорают. МИР, Visa, СБП через ЮKassa.</p>
            <div className="grid gap-2">
              {PACKS.map((p) => (
                <button
                  key={p}
                  onClick={() => setTopupSum(p)}
                  className={`flex justify-between rounded-xl border px-4 py-2.5 text-sm font-bold ${topupSum === p ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200"}`}
                >
                  {p} ₽ <span className="font-normal text-emerald-600">≈{messagesForTopup(p)} сообщений{p >= 300 ? " с бонусом" : ""}</span>
                </button>
              ))}
            </div>
            <Button className="mt-3 w-full" disabled={topupBusy} onClick={() => void doTopup()}>
              {topupBusy ? "Создаём платёж…" : `Оплатить ${topupSum} ₽ →`}
            </Button>
            <p className="mt-2 text-center text-[11px] text-slate-400">Чек придёт на почту · возврат остатка по заявлению</p>
          </Card>
        </div>
      )}
    </div>
  );
}
