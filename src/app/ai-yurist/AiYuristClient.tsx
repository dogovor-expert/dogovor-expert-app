"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Scales,
  Wallet,
  Plus,
  PaperPlaneRight,
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
  UploadSimple,
  FileArrowUp,
  SpinnerGap,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { messagesForTopup, aiPriceFromLabel, AI_PRICE_AUDIT_LABEL, AI_PRICE_MESSAGE_RUB, AI_PLAN_PRICE_RUB, AI_PLAN_QUESTIONS } from "@/lib/ai/pricing";
import { formatRub } from "@/lib/pricing";
import {
  AUDIT_FILE_ACCEPT,
  AUDIT_FILE_MAX_BYTES,
  extractAuditText,
  unsupportedFileHint,
  type AuditExtractProgress,
} from "@/lib/ai/auditFile";

/** Лимит текста аудита (синхронно с aiChatSchema). ~10 страниц договора. */
const AUDIT_MAX = 20000;

interface Source {
  code: string;
  article: string;
  edition_date: string | null;
  source_url?: string | null;
  locator?: string | null;
}

interface AuditFinding {
  type: "critical" | "warning" | "good";
  clause: string;
  title: string;
  problem: string;
  law: string;
  fix: string;
}

interface AuditReport {
  score: number;
  verdict: string;
  summary: string;
  findings: AuditFinding[];
}

interface ChatMsg {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: Source[];
  confidence?: "high" | "low";
  audit?: AuditReport | null;
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

const AUDIT_PRESETS: Array<{ id: string; label: string; text: string }> = [
  {
    id: "rent",
    label: "Аренда — риски жильца",
    text: "4.2. Арендодатель вправе в любое время в одностороннем внесудебном порядке отказаться от исполнения договора, уведомив Арендатора за 3 календарных дня. При этом обеспечительный платеж (залог) Арендатору не возвращается и удерживается в качестве штрафа.\n5.4. В случае просрочки внесения арендной платы более чем на 2 дня, Арендатор уплачивает пеню в размере 1% от суммы задолженности за каждый день просрочки.\n6.1. Арендодатель имеет право посещать жилое помещение в любое время суток без предварительного уведомления Арендатора для проверки состояния имущества.\n7.3. Договор заключен сроком на 11 месяцев с момента подписания.",
  },
  {
    id: "podryad",
    label: "Подряд — риски исполнителя",
    text: "3.2. Заказчик рассматривает Акт сдачи-приемки выполненных работ в течение неограниченного времени до полного устранения всех возможных замечаний.\n4.1. Оплата производится в течение 90 банковских дней с момента подписания Акта при наличии финансирования от инвестора.\n8.2. Подрядчик несет ответственность за просрочку даже в случае непредоставления Заказчиком площадки и проектной документации.",
  },
  {
    id: "samozanyaty",
    label: "Самозанятый — переквалификация",
    text: "1.3. Исполнитель обязуется соблюдать правила внутреннего трудового распорядка и находиться в офисе с 09:00 до 18:00.\n3.1. Выплачивается фиксированное ежемесячное вознаграждение 85 000 руб. 5-го и 20-го числа каждого месяца.\n2.4. Исполнитель выполняет распоряжения руководителя отдела маркетинга.",
  },
];

function scrollToAudit() {
  document.getElementById("ai-audit")?.scrollIntoView({ behavior: "smooth" });
}

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

export default function AiYuristClient() {
  const [balance, setBalance] = useState<number | null>(null);
  const [freeAsked, setFreeAsked] = useState(0);
  const [quota, setQuota] = useState<{ total: number; left: number } | null>(null);
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
  const [authed, setAuthed] = useState<boolean | null>(null);
  // Покупка подписки «AI-юрист» (690 ₽/мес) прямо с этой страницы.
  // Раньше карточки тарифа здесь не было вовсе — был только блок пополнения
  // баланса, поэтому кнопка «купить подписку» никуда не вела и выглядела как баг.
  const [planBusy, setPlanBusy] = useState(false);
  const [planMsg, setPlanMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [topupDone, setTopupDone] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [auditText, setAuditText] = useState(AUDIT_PRESETS[0].text);
  const [auditPreset, setAuditPreset] = useState(AUDIT_PRESETS[0].id);
  const [auditSending, setAuditSending] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [auditSources, setAuditSources] = useState<Source[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditFile, setAuditFile] = useState<{ name: string; size: number } | null>(null);
  const [auditFileBusy, setAuditFileBusy] = useState(false);
  const [auditFileStage, setAuditFileStage] = useState<string | null>(null);
  const [auditFileError, setAuditFileError] = useState<string | null>(null);
  const [auditFileNote, setAuditFileNote] = useState<string | null>(null);
  const [auditDragOver, setAuditDragOver] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const auditFileRef = useRef<HTMLInputElement>(null);
  const restoredRef = useRef(false);

  const loadBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/balance", { credentials: "same-origin" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      if (!res.ok) return;
      const d = (await res.json()) as {
        balance_kopeks: number;
        free_asked: number;
        low: boolean;
        quota_total?: number;
        quota_left?: number;
      };
      setBalance(d.balance_kopeks);
      setFreeAsked(d.free_asked);
      setLow(d.low);
      setQuota(
        Number(d.quota_total ?? 0) > 0
          ? { total: Number(d.quota_total), left: Number(d.quota_left ?? 0) }
          : null,
      );
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
    // Возврат с ЮKassa (?topup=success). Читаем прямо из window.location.search
    // обычным useEffect, а НЕ через хук `useSearchParams` из next/navigation:
    // хук требует обёртки <Suspense> и делает маршрут динамическим, из-за чего
    // при корневом loading.tsx Next стримит шелл и весь блок metadata уезжает
    // из <head> в конец <body> (аудит 28.09.2026 — 17 meta-тегов вне head).
    // URL чистим, чтобы подтверждение не показывалось при перезагрузке.
    try {
      if (new URLSearchParams(window.location.search).get("topup") === "success") {
        setTopupDone(true);
        window.history.replaceState(null, "", "/ai-yurist");
      }
    } catch {
      /* невалидный URL — просто не показываем подтверждение */
    }
  }, []);

  useEffect(() => {
    // Аноним: не дёргаем защищённые /api/ai/* — иначе в консоли появляется 401
    // на каждый заход, в т.ч. при рендере краулером. Сессию определяем локально
    // по cookie (тем же приёмом, что и AutotekaClient) — без сетевого запроса.
    let cancelled = false;
    void (async () => {
      let session: unknown = null;
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        session = data.session;
      } catch {
        session = null;
      }
      if (cancelled) return;
      if (!session) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      void loadBalance();
      const list = await loadThreads();
      // Восстановление после перезагрузки: последний открытый диалог либо самый свежий.
      if (cancelled || restoredRef.current || list.length === 0) return;
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
    return () => {
      cancelled = true;
    };
  }, [loadBalance, loadThreads, openThread]);

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

  /** Загрузка договора: текст извлекается в браузере и попадает в поле аудита. */
  const handleAuditFile = useCallback(
    async (file: File) => {
      if (auditFileBusy) return;
      setAuditFileError(null);
      setAuditFileNote(null);
      if (file.size > AUDIT_FILE_MAX_BYTES) {
        setAuditFileError(
          `Файл больше ${Math.round(AUDIT_FILE_MAX_BYTES / (1024 * 1024))} МБ — уменьшите его и попробуйте снова.`
        );
        return;
      }
      setAuditFileBusy(true);
      setAuditFileStage("Готовим документ…");
      setAuditReport(null);
      try {
        const text = await extractAuditText(file, (p: AuditExtractProgress) =>
          setAuditFileStage(p.label)
        );
        if (text.trim().length < 200) {
          setAuditFileError(
            "Из документа извлечено слишком мало текста. Если это скан низкого качества — вставьте текст вручную."
          );
          setAuditFile(null);
          return;
        }
        const truncated = text.length > AUDIT_MAX;
        setAuditText(truncated ? text.slice(0, AUDIT_MAX) : text);
        setAuditPreset("");
        setAuditError(null);
        setAuditFile({ name: file.name, size: file.size });
        if (truncated) {
          setAuditFileNote(
            `Документ длиннее ${AUDIT_MAX.toLocaleString("ru-RU")} символов — в проверку взят первый фрагмент. Для полного разбора загрузите договор частями.`
          );
        }
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "IMAGE_DECODE") {
          setAuditFileError("Не удалось открыть изображение. Сохраните скан как JPG/PNG или PDF.");
        } else if (code === "OCR_FAILED") {
          setAuditFileError(
            "Не удалось распознать текст на скане. Загрузите PDF/DOCX с текстом или вставьте текст вручную."
          );
        } else {
          setAuditFileError(unsupportedFileHint(file.name));
        }
        setAuditFile(null);
      } finally {
        setAuditFileBusy(false);
        setAuditFileStage(null);
        if (auditFileRef.current) auditFileRef.current.value = "";
      }
    },
    [auditFileBusy]
  );

  /** Настоящий аудит договора: mode=audit, отчёт JSON парсится сервером. */
  const sendAudit = useCallback(async () => {
    const text = auditText.trim();
    if (!text || auditSending) return;
    if (text.length < 200) {
      setAuditError("Вставьте текст договора — минимум 200 символов, иначе это обычный вопрос для чата выше.");
      return;
    }
    if (!consent) {
      setAuditError("Поставьте галочку согласия на обработку данных в чате выше — она действует и для проверки.");
      return;
    }
    setAuditError(null);
    setAuditReport(null);
    setAuditSources([]);
    setAuditSending(true);
    try {
      const token = await fetchCsrf();
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ text, threadId, consent: true, mode: "audit" }),
      });
      if (res.status === 400) {
        setAuditError("Текст слишком короткий или некорректный. Минимум — 200 символов.");
        return;
      }
      if (res.status === 402) {
        setAuditError("Недостаточно средств на AI-балансе. Пополните — от 100 ₽, деньги не сгорают.");
        setTopupOpen(true);
        return;
      }
      if (res.status === 409) {
        setAuditError("Параллельный запрос изменил баланс. Нажмите «Проверить» ещё раз.");
        return;
      }
      if (!res.ok) {
        setAuditError("Сервис временно недоступен. Деньги не списаны — попробуйте позже.");
        return;
      }
      const d = (await res.json()) as {
        answer: string;
        sources: Source[];
        audit: AuditReport | null;
        thread_id: string;
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
      setAuditReport(d.audit);
      setAuditSources(d.sources ?? []);
      if (!d.audit) {
        setAuditError("Модель вернула ответ не в формате отчёта — попробуйте ещё раз или задайте вопрос в чате.");
      }
      void loadThreads();
      void loadBalance();
    } catch {
      setAuditError("Сеть недоступна. Деньги не списаны — попробуйте позже.");
    } finally {
      setAuditSending(false);
    }
  }, [auditText, auditSending, consent, threadId, loadBalance, loadThreads]);

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

  /**
   * Оплата подписки «AI-юрист» (690 ₽/мес, 200 вопросов).
   *
   * Тот же контракт, что у пополнения баланса: CSRF-токен, same-origin,
   * редирект на подтверждение ЮKassa. Отличия — план "ai" и понятные
   * сообщения об ошибках вместо молчаливого «не получилось».
   */
  const buyAiPlan = useCallback(async () => {
    setPlanMsg(null);
    if (authed === false) {
      setPlanMsg({ kind: "info", text: "Войдите или зарегистрируйтесь, чтобы оформить подписку." });
      return;
    }
    setPlanBusy(true);
    try {
      const token = await fetchCsrf();
      const res = await fetch("/api/billing/create-payment", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": token },
        body: JSON.stringify({ plan: "ai" }),
      });
      const d = (await res.json().catch(() => null)) as
        | { confirmation_url?: string; error?: string; detail?: string }
        | null;
      if (d?.confirmation_url) {
        window.location.href = d.confirmation_url;
        return;
      }
      if (res.status === 401 || d?.error === "unauthorized") {
        setPlanMsg({ kind: "info", text: "Войдите или зарегистрируйтесь, чтобы оформить подписку." });
      } else if (res.status === 503) {
        setPlanMsg({ kind: "error", text: "Оплата временно недоступна. Попробуйте позже." });
      } else {
        setPlanMsg({
          kind: "error",
          text: d?.detail ? `Не удалось создать платёж: ${d.detail}` : "Не удалось создать платёж. Попробуйте позже.",
        });
      }
    } catch {
      setPlanMsg({ kind: "error", text: "Сервис временно недоступен. Попробуйте ещё раз." });
    } finally {
      setPlanBusy(false);
    }
  }, [authed]);

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
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-indigo-300">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
            AI-Юрист — проверка и генерация документов за секунду
          </p>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Ваш личный юрист, <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">работающий 24/7</span>
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Проверьте договор, напишите претензию или соберите документ из простого описания ситуации.
            Каждый ответ — со <b className="text-slate-900">ссылками на статьи</b> действующих редакций 2026 года,
            а не «из головы». Стоит <b className="text-slate-900">{aiPriceFromLabel()}</b> — в разы дешевле живого юриста.
            И сразу превращает ответ в <b className="text-slate-900">готовый документ</b>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button onClick={scrollToChat}>Задать вопрос — бесплатно <ArrowRight size={16} weight="bold" /></Button>
            <Button variant="outline" onClick={scrollToAudit}>Проверить договор — {AI_PRICE_AUDIT_LABEL()}</Button>
            <Button variant="outline" onClick={() => document.getElementById("ai-tariffs")?.scrollIntoView({ behavior: "smooth" })}>Сколько стоит</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><CheckCircle size={15} weight="fill" className="text-emerald-600" /> На основе законов РФ</span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><CheckCircle size={15} weight="fill" className="text-emerald-600" /> 2 первых вопроса — 0 ₽, без карты</span>
            <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><CheckCircle size={15} weight="fill" className="text-emerald-600" /> 24/7, из любого часового пояса</span>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[13px] font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> AI-юрист онлайн
            <span className="ml-auto font-normal text-slate-500">RAG по кодексам</span>
          </div>
          <div className="p-4">
            <p className="mb-2.5 mr-10 rounded-xl rounded-tl-sm bg-brand-50 px-3.5 py-2.5 text-[13.5px]">Продал машину, а штрафы приходят мне. Что делать?</p>
            <div className="ml-10 rounded-xl rounded-tr-sm border border-slate-200 px-3.5 py-2.5 text-[13.5px]">
              Новый владелец обязан переоформить авто за <b>10 дней</b>. На 11-й день прекратите регистрацию сами через Госуслуги.
              <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                <b className="text-brand-700">п. 60 Правил № 1764</b> · «прежний владелец вправе прекратить регистрацию по истечении 10 суток» <span className="text-slate-500">· ред. 2026</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button onClick={scrollToChat} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">Составить документ →</button>
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">PDF</span>
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">DOCX</span>
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
              <Link href="/login?mode=login"><Button>Войти</Button></Link>
              <Link href="/login?mode=register"><Button variant="outline">Регистрация</Button></Link>
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
                {quota ? (
                  <>
                    <p className="flex items-center gap-1 font-bold"><Gift size={15} weight="fill" /> Тариф AI-юрист: осталось {quota.left} из {quota.total}</p>
                    <p className="mt-1 text-slate-600">Неиспользованные вопросы сгорают в конце месяца. Дальше {AI_PRICE_MESSAGE_RUB} ₽/сообщение.</p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-1 font-bold"><Gift size={15} weight="fill" /> {freeAsked < 2 ? `Осталось бесплатных: ${2 - freeAsked}` : "Бесплатные использованы"}</p>
                    <p className="mt-1 text-slate-600">Дальше {AI_PRICE_MESSAGE_RUB} ₽/сообщение. Баланс не сгорает.</p>
                  </>
                )}
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
                  <button onClick={scrollToAudit} title="Проверить договор — аудит по пунктам" className="rounded-xl border border-slate-200 p-3 text-brand-600 transition hover:bg-brand-50">
                    <MagnifyingGlass size={18} weight="bold" />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void send(draft); }}
                    placeholder="Опишите ситуацию своими словами…"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                    maxLength={4000}
                  />
                  <Button onClick={() => void send(draft)} disabled={sending} className="bg-gradient-to-br from-brand-600 to-indigo-600">
                    <PaperPlaneRight size={16} weight="bold" /> Спросить
                  </Button>
                </div>
                <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs text-slate-500">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                  Согласен на обработку вопроса (может содержать персональные данные). 1 сообщение = {AI_PRICE_MESSAGE_RUB} ₽ · первые 2 — бесплатно.
                </label>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck size={14} /> Информация общего характера, не юридическая консультация. Номера статей — только из проверенной базы.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Проверка договора */}
      <div id="ai-audit" className="scroll-mt-4 pt-8">
        <h2 className="text-xl font-extrabold">Проверка договора — найдём риски до подписания</h2>
        <p className="mb-3 mt-1 max-w-3xl text-sm text-slate-500">Загрузите договор (PDF, DOCX, фото скана или текстовый файл) либо вставьте текст — AI-юрист сверит пункты с действующими законами, выставит индекс безопасности и предложит безопасные формулировки. Файл обрабатывается прямо в браузере и никуда не отправляется. Требуется вход: 1 проверка = {AI_PRICE_AUDIT_LABEL()} или из бесплатных вопросов.</p>
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow">
                <MagnifyingGlass size={22} weight="bold" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-bold">Аудит договора <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">● Online</span></p>
                <p className="text-xs text-slate-500">RAG-поиск по кодексам + проверка цитат</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {AUDIT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setAuditPreset(p.id); setAuditText(p.text); setAuditReport(null); setAuditError(null); setAuditFile(null); setAuditFileNote(null); setAuditFileError(null); }}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold ${auditPreset === p.id ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Загрузить документ</span>
                <p className="mt-0.5 text-[11px] text-slate-400">PDF, DOCX, фото/скан или текстовый файл · до 20 МБ · обрабатывается в браузере</p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); if (!auditFileBusy) setAuditDragOver(true); }}
                onDragLeave={() => setAuditDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setAuditDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleAuditFile(f); }}
                className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${auditDragOver ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50/60"}`}
              >
                {auditFileBusy ? (
                  <div className="flex flex-col items-center gap-2 text-brand-700" role="status">
                    <SpinnerGap size={26} className="animate-spin" />
                    <span className="text-xs font-semibold">{auditFileStage ?? "Обрабатываем документ…"}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <UploadSimple size={26} weight="bold" className="text-brand-600" />
                    <p className="text-[13px] font-semibold text-slate-700">Перетащите договор сюда</p>
                    <p className="text-[11px] text-slate-500">или выберите файл — PDF, DOCX, фото скана, TXT</p>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => auditFileRef.current?.click()}>
                      <FileArrowUp size={15} weight="bold" /> Выбрать файл
                    </Button>
                    <input
                      ref={auditFileRef}
                      type="file"
                      accept={AUDIT_FILE_ACCEPT}
                      aria-label="Загрузить договор для проверки AI-юристом"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAuditFile(f); }}
                    />
                  </div>
                )}
              </div>

              {auditFile && !auditFileBusy && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                  <CheckCircle size={16} weight="fill" className="shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-emerald-800" title={auditFile.name}>{auditFile.name}</span>
                  <span className="shrink-0 text-emerald-700">{Math.max(1, Math.round(auditFile.size / 1024))} КБ</span>
                  <button type="button" aria-label="Убрать файл" onClick={() => { setAuditFile(null); setAuditFileNote(null); }} className="shrink-0 text-emerald-700 transition-colors hover:text-emerald-900">
                    <X size={15} />
                  </button>
                </div>
              )}

              {auditFileError && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
                  <Warning size={15} weight="fill" className="mt-0.5 shrink-0" /> {auditFileError}
                </p>
              )}
              {auditFileNote && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                  <Warning size={15} weight="fill" className="mt-0.5 shrink-0" /> {auditFileNote}
                </p>
              )}

              <div className="flex items-center justify-between pb-2 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Текст договора (до {AUDIT_MAX.toLocaleString("ru-RU")} символов)</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400"><ShieldCheck size={13} /> Данные в РФ</span>
              </div>
              <textarea
                value={auditText}
                onChange={(e) => setAuditText(e.target.value)}
                rows={9}
                maxLength={AUDIT_MAX}
                aria-label="Текст договора для проверки"
                placeholder="Вставьте сюда пункты договора или загрузите файл выше…"
                className="w-full flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[11px] text-slate-400">Символов: {auditText.length} / {AUDIT_MAX.toLocaleString("ru-RU")} · минимум 200</span>
                <Button onClick={() => void sendAudit()} disabled={auditSending} className="bg-gradient-to-br from-brand-600 to-indigo-600">
                  <MagnifyingGlass size={16} weight="bold" /> {auditSending ? "Проверяем…" : "Проверить договор — {AI_PRICE_AUDIT_LABEL()}"}
                </Button>
              </div>
              {auditSending && (
                <div className="mt-2 flex gap-1.5 rounded-xl border border-slate-200 px-4 py-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
                  <span className="ml-1 text-xs text-slate-500">RAG-поиск по кодексам → разбор рисков → проверка цитат…</span>
                </div>
              )}
              {auditError && (
                <p className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  <Warning size={16} weight="fill" /> {auditError}
                </p>
              )}
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">
              {!auditReport && !auditSending && (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-slate-400">
                  <MagnifyingGlass size={36} weight="bold" className="text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-600">Нажмите «Проверить договор — {AI_PRICE_AUDIT_LABEL()}»</p>
                  <p className="mt-1 text-xs">Настоящий разбор: RAG-поиск статей, индекс риска, безопасные формулировки.</p>
                </div>
              )}
              {auditReport && (
                <>
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Индекс безопасности</div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold ${auditReport.score < 50 ? "text-rose-600" : auditReport.score < 80 ? "text-amber-600" : "text-emerald-600"}`}>{auditReport.score} / 100</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${auditReport.score < 50 ? "bg-rose-100 text-rose-700" : auditReport.score < 80 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{auditReport.verdict}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {auditReport.findings.filter((f) => f.type === "critical").length > 0 && (
                        <span className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700">🔴 {auditReport.findings.filter((f) => f.type === "critical").length} критичных</span>
                      )}
                      {auditReport.findings.filter((f) => f.type === "warning").length > 0 && (
                        <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">⚠️ {auditReport.findings.filter((f) => f.type === "warning").length} замечаний</span>
                      )}
                      {auditReport.findings.filter((f) => f.type === "good").length > 0 && (
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">✅ {auditReport.findings.filter((f) => f.type === "good").length} ОК</span>
                      )}
                    </div>
                  </div>
                  {auditReport.summary && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
                      <span className="font-bold text-slate-900">Заключение AI-Юриста: </span>{auditReport.summary}
                    </div>
                  )}
                  <div className="mt-4 space-y-3">
                    {auditReport.findings.map((f, i) => (
                      <div key={i} className={`rounded-xl border p-3.5 ${f.type === "critical" ? "border-rose-200 bg-rose-50/40" : f.type === "warning" ? "border-amber-200 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/40"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${f.type === "critical" ? "bg-rose-600" : f.type === "warning" ? "bg-amber-500" : "bg-emerald-600"}`}>{f.type === "critical" ? "!" : f.type === "warning" ? "?" : "✓"}</span>
                            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700 shadow-sm">{f.clause}</span>
                            <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                          </div>
                          {f.law && <span className="shrink-0 text-[10px] font-semibold text-slate-500">{f.law}</span>}
                        </div>
                        {f.type === "good" ? (
                          <p className="mt-2 text-xs leading-relaxed text-emerald-800">{f.fix}</p>
                        ) : (
                          <>
                            {f.problem && <p className="mt-2 text-xs leading-relaxed text-slate-600">{f.problem}</p>}
                            {f.fix && (
                              <div className="mt-2.5 rounded-lg border border-slate-200/80 bg-white p-3">
                                <div className="text-[11px] font-bold text-brand-700">Безопасная формулировка от AI-юриста:</div>
                                <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-800">{f.fix}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {auditSources.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Нормы из базы ({auditSources.length})</p>
                      <div className="grid gap-1.5">
                        {auditSources.map((s, j) => (
                          <div key={j} className="rounded-lg border border-slate-200 border-l-4 border-l-brand-500 bg-white px-3 py-2 text-xs">
                            <b className="text-brand-700">{s.code}, {s.article}</b>
                            <span className="block text-slate-400">ред. {s.edition_date ?? "—"} · проверено по базе</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-center text-[13px] text-slate-300">Проверка сохранена в истории диалогов · Информация общего характера, не юридическая консультация</p>
                </>
              )}
            </div>
          </div>
        </Card>
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
        <h2 className="text-xl font-extrabold">Тарифы AI-юриста</h2>
        <p className="mb-4 mt-1 max-w-3xl text-sm text-slate-500">
          Выберите подписку, если спрашиваете часто, или пополните баланс под разовые вопросы.
          Баланс не сгорает. Оплата картой МИР, Visa, Mastercard или СБП через ЮKassa.
        </p>

        {/* ПОДПИСКА 690 ₽/мес — рабочая кнопка оплаты (раньше карточки не было) */}
        <Card className="mb-5 overflow-hidden border-2 border-brand-500 p-0">
          <div className="flex flex-col gap-4 bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold">Подписка «AI-юрист»</h3>
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-900">
                  Выгодно от 11 вопросов
                </span>
                {quota && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                    <CheckCircle size={13} weight="fill" /> Активна
                  </span>
                )}
              </div>
              <p className="mt-1 text-2xl font-extrabold">
                {formatRub(AI_PLAN_PRICE_RUB)}
                <span className="text-sm font-medium opacity-90"> / месяц</span>
              </p>
              <p className="mt-1 text-sm opacity-90">
                {AI_PLAN_QUESTIONS} вопросов в месяц со ссылками на статьи НПА
                {quota ? ` · осталось ${quota.left} из ${quota.total}` : ""}
              </p>
            </div>
            <div className="shrink-0 sm:w-64">
              {quota ? (
                <div className="rounded-xl bg-white/15 p-3 text-sm">
                  Тариф активен. Неиспользованные вопросы сгорают в конце месяца,
                  дальше — {aiPriceFromLabel()} из баланса.
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-white text-brand-700 shadow-lg hover:bg-white/90"
                  onClick={() => { void buyAiPlan(); }}
                  disabled={planBusy}
                  aria-busy={planBusy}
                >
                  {planBusy ? "Создаём платёж…" : `Оформить за ${formatRub(AI_PLAN_PRICE_RUB)}`}
                </Button>
              )}
            </div>
          </div>
          <ul className="grid gap-2.5 p-6 text-sm text-slate-700 sm:grid-cols-2">
            {[
              `${AI_PLAN_QUESTIONS} вопросов в месяц — по ${aiPriceFromLabel()} за вопрос`,
              "Ответы со ссылками на статьи НПА и цитатами",
              "Экспорт диалога в PDF и DOCX",
              "Разбор договоров: индекс риска и безопасные формулировки",
              "История вопросов сохраняется в аккаунте",
              "Приоритетная поддержка",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle size={17} weight="fill" className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {planMsg && (
            <p
              role="status"
              aria-live="polite"
              className={`mx-6 mb-5 rounded-xl border px-4 py-3 text-sm ${
                planMsg.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-brand-200 bg-brand-50 text-brand-800"
              }`}
            >
              {planMsg.text}
              {planMsg.kind === "info" && (
                <>
                  {" "}
                  <Link href="/login?mode=login" className="font-semibold underline">
                    Войти
                  </Link>{" "}
                  или{" "}
                  <Link href="/login?mode=register" className="font-semibold underline">
                    зарегистрироваться
                  </Link>
                  .
                </>
              )}
            </p>
          )}
          <p className="px-6 pb-5 text-[11px] text-slate-500">
            Неиспользованные вопросы в конце месяца сгорают. Отмена в любой момент —
            в разделе «Биллинг». Цена и количество вопросов берутся из единого
            источника истины, поэтому всегда совпадают с квитанцией.
          </p>
        </Card>

        <h3 className="mb-3 mt-6 text-base font-bold text-slate-700">
          Или пополните баланс — без подписки
        </h3>
        <p className="mb-3 max-w-3xl text-sm text-slate-500">Пополнили от 100 ₽ — тратите, пока не закончится. Чем больше сумма, тем больше бонус.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((p) => (
            p === 300 ? (
              <div key={p} className="relative rounded-2xl bg-slate-950 p-5 text-center text-white shadow-2xl lg:-translate-y-2">
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-0.5 text-[10.5px] font-extrabold uppercase text-slate-900">Берут чаще всего</p>
                <p className="text-2xl font-extrabold">{p} ₽</p>
                <p className="text-xl font-extrabold text-emerald-400">≈{messagesForTopup(p)} сообщений +10%</p>
                <Button className="mt-3 w-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => { setTopupSum(p); setTopupOpen(true); }}>Пополнить</Button>
              </div>
            ) : (
              <Card key={p} className="p-5 text-center">
                <p className="text-2xl font-extrabold">{p} ₽</p>
                <p className="text-xl font-extrabold text-emerald-600">≈{messagesForTopup(p)} сообщений{p >= 500 ? ` +${p >= 1000 ? "30" : "20"}%` : ""}</p>
                <p className="text-xs text-slate-500">бонус {p >= 1000 ? "+30%" : p >= 500 ? "+20%" : "—"}</p>
                <Button className="mt-3 w-full" variant="outline" onClick={() => { setTopupSum(p); setTopupOpen(true); }}>Пополнить</Button>
              </Card>
            )
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
                ["Ваш договор", "«В целом нормально», без норм", "Аудит по пунктам: индекс, риски, безопасные формулировки ↑"],
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
              <th className="px-4 py-2.5 font-semibold"><span className="sr-only">Критерий</span></th><th className="px-4 py-2.5 font-semibold">Наш AI-юрист</th><th className="px-4 py-2.5 font-semibold">Правовед.ru</th><th className="px-4 py-2.5 font-semibold">СберПраво</th><th className="px-4 py-2.5 font-semibold">Живой юрист</th>
            </tr></thead>
            <tbody>
              {[
                ["Цена вопроса", aiPriceFromLabel(), "от 89 ₽", "1 299 ₽", "от 1 000 ₽"],
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
        Аудит договоров: текст, PDF, DOCX и фото сканов уже работают ↑ · голосовые и видео — следите за обновлениями.
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
