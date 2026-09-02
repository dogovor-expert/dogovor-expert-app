"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, CheckCircle2, Upload, X, Loader2, ShieldCheck, Bug, Lightbulb, FileText, HelpCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TemplateSummary {
  id: string;
  name: string;
  category: string;
}

type FeedbackType = "doc_error" | "site_bug" | "feature_request" | "other";

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: typeof Bug; hint: string }[] = [
  { value: "doc_error", label: "Ошибка в документе", icon: FileText, hint: "Опечатка, неверная формулировка, не работает поле шаблона" },
  { value: "site_bug", label: "Не работает функция сайта", icon: Bug, hint: "Сломалась кнопка, страница, инструмент" },
  { value: "feature_request", label: "Хочу новый документ или инструмент", icon: Lightbulb, hint: "Какого шаблона или функции не хватает" },
  { value: "other", label: "Другое", icon: HelpCircle, hint: "Любой другой вопрос" },
];

const TOOLS = ["Автотека", "ОСАГО", "Конвертер", "Калькуляторы", "Сканер документов", "Личный кабинет", "Другое"];
const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLACEHOLDERS: Record<FeedbackType, string> = {
  doc_error: "Какая именно ошибка: что не так в тексте/поле, где именно?",
  site_bug: "Что вы делали, что ожидали увидеть, что увидели на самом деле?",
  feature_request: "Какой документ/функция нужны и для какой ситуации?",
  other: "Опишите ваш вопрос или предложение",
};

interface Props {
  /** Автоподстановка документа, если форма открыта со страницы документа. */
  defaultDocSlug?: string;
  /** Закрыть модалку после успеха. */
  onSuccess?: (ticketNo: string) => void;
  /** Компактный режим (без заголовка) для модалки. */
  compact?: boolean;
}

export default function FeedbackForm({ defaultDocSlug, onSuccess, compact }: Props) {
  const [type, setType] = useState<FeedbackType | "">("");
  const [docQuery, setDocQuery] = useState("");
  const [docSlug, setDocSlug] = useState<string>("");
  const [docName, setDocName] = useState<string>("");
  const [tool, setTool] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [ticketNo, setTicketNo] = useState("");
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docList, setDocList] = useState<TemplateSummary[]>([]);
  const [docListLoaded, setDocListLoaded] = useState(false);

  // Загрузить лёгкий список шаблонов только когда он реально нужен
  // (выбран тип «Ошибка в документе» или форма открыта со страницы документа).
  const ensureDocList = async () => {
    if (docListLoaded) return;
    try {
      const res = await fetch("/api/templates/summary");
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        setDocList(json.data);
        setDocListLoaded(true);
      }
    } catch {
      /* оставим поле пустым, автодополнение не критично */
    }
  };

  // Автоподстановка email для залогина и документа со страницы.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    if (defaultDocSlug) {
      setType("doc_error");
      ensureDocList().then(() => {
        const t = docList.find((x) => x.id === defaultDocSlug);
        if (t) {
          setDocSlug(t.id);
          setDocName(t.name);
          setDocQuery(t.name);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDocSlug]);

  // Подгружаем список при выборе типа «Ошибка в документе».
  useEffect(() => {
    if (type === "doc_error") ensureDocList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const docMatches = useMemo(() => {
    if (!docQuery.trim() || docSlug) return [];
    const q = docQuery.toLowerCase();
    return docList.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [docQuery, docSlug, docList]);

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const next: File[] = [];
    const errs: string[] = [];
    for (const f of incoming) {
      if (files.length + next.length >= MAX_FILES) { errs.push(`Не более ${MAX_FILES} файлов`); break; }
      if (!ACCEPT.includes(f.type)) { errs.push(`«${f.name}» — только PNG/JPG/WEBP`); continue; }
      if (f.size > MAX_FILE_BYTES) { errs.push(`«${f.name}» больше 5 МБ`); continue; }
      next.push(f);
    }
    if (next.length) setFiles((prev) => [...prev, ...next]);
    setErrors((e) => ({ ...e, files: errs[0] || "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!type) e.type = "Выберите тип обращения";
    if (type === "doc_error" && !docSlug) e.doc = "Укажите документ";
    if (type === "site_bug" && !tool) e.tool = "Укажите инструмент/страницу";
    if (message.trim().length < 5) e.message = "Опишите подробнее (минимум 5 символов)";
    else if (message.length > 5000) e.message = "Слишком длинное сообщение (до 5000 символов)";
    if (!email.trim()) e.email = "Укажите email для ответа";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Некорректный email";
    if (!consent) e.consent = "Нужно согласие на обработку данных";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (status === "submitting") return;
    if (!validate()) return;
    setStatus("submitting");
    setSubmitError("");
    try {
      const tech = {
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
        language: typeof navigator !== "undefined" ? navigator.language : "",
        siteVersion: process.env.NEXT_PUBLIC_SITE_VERSION || "",
        timestamp: new Date().toISOString(),
      };
      const screenshots = await Promise.all(
        files.map(
          (f) =>
            new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve({ name: f.name, type: f.type, dataUrl: String(r.result) });
              r.onerror = reject;
              r.readAsDataURL(f);
            })
        )
      );
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          docSlug,
          docName,
          tool,
          message: message.trim(),
          email: email.trim(),
          consent: true,
          tech,
          screenshots,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "request_failed");
      setTicketNo(data.ticket_no || "");
      setStatus("success");
      onSuccess?.(data.ticket_no || "");
    } catch {
      setStatus("error");
      setSubmitError("Не удалось отправить. Проверьте соединение и попробуйте ещё раз.");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center py-8"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Спасибо, обращение принято</h3>
        <p className="mt-2 text-sm text-slate-600">
          {ticketNo ? (
            <>Номер обращения: <span className="font-semibold text-slate-700">{ticketNo}</span>. </>
          ) : null}
          Ответим в течение 24 часов в рабочий день.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "max-w-2xl mx-auto"}>
      {!compact && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Сообщить о проблеме или предложить идею</h1>
          <p className="text-sm text-slate-600 mt-1">
            Опишите суть — мы получим уведомление и ответим в течение 24 часов в рабочий день.
          </p>
        </div>
      )}

      {/* Тип обращения — радио-карточки (правильный ARIA radiogroup pattern) */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700 mb-2">Тип обращения</legend>
        <div
          role="radiogroup"
          aria-label="Тип обращения"
          aria-required="true"
          aria-invalid={!!errors.type}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {TYPE_OPTIONS.map((o) => {
            const active = type === o.value;
            return (
              <div
                key={o.value}
                role="radio"
                tabIndex={active || (!type && o === TYPE_OPTIONS[0]) ? 0 : -1}
                aria-checked={active}
                aria-label={o.label}
                onClick={() => setType(o.value)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setType(o.value);
                  }
                }}
                className={`text-left rounded-xl border px-3.5 py-3 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                  active
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-slate-900 text-sm">
                  <o.icon className={`w-4 h-4 ${active ? "text-brand-600" : "text-slate-600"}`} />
                  {o.label}
                </span>
                <span className="block text-xs text-slate-600 mt-1">{o.hint}</span>
              </div>
            );
          })}
        </div>
        {errors.type && (
          <p id="fb-type-err" role="alert" className="text-xs text-red-600 mt-1">
            {errors.type}
          </p>
        )}
      </fieldset>

      {/* Документ (doc_error) */}
      {type === "doc_error" && (
        <div className="mt-4 relative">
          <label htmlFor="fb-doc" className="text-sm font-semibold text-slate-700 block mb-1.5">
            Какой документ
          </label>
          <input
            id="fb-doc"
            value={docQuery}
            onChange={(e) => { setDocQuery(e.target.value); setDocSlug(""); setDocName(""); }}
            placeholder="Начните вводить название шаблона…"
            aria-describedby={docSlug ? "fb-doc-selected" : errors.doc ? "fb-doc-err" : undefined}
            aria-invalid={!!errors.doc}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {docSlug && (
            <p id="fb-doc-selected" className="text-xs text-brand-700 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Выбран: {docName}
            </p>
          )}
          {docMatches.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {docMatches.map((t: TemplateSummary) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => { setDocSlug(t.id); setDocName(t.name); setDocQuery(t.name); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
                  >
                    <span className="font-medium text-slate-800">{t.name}</span>
                    <span className="block text-xs text-slate-600">{t.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.doc && (
            <p id="fb-doc-err" role="alert" className="text-xs text-red-600 mt-1">
              {errors.doc}
            </p>
          )}
        </div>
      )}

      {/* Инструмент (site_bug) */}
      {type === "site_bug" && (
        <div className="mt-4">
          <span id="fb-tool-label" className="text-sm font-semibold text-slate-700 block mb-1.5">
            Какой инструмент/страница
          </span>
          <div role="radiogroup" aria-labelledby="fb-tool-label" aria-required="true" className="flex flex-wrap gap-2">
            {TOOLS.map((t) => {
              const active = tool === t;
              return (
                <div
                  key={t}
                  role="radio"
                  tabIndex={active || (!tool && t === TOOLS[0]) ? 0 : -1}
                  aria-checked={active}
                  aria-label={t}
                  onClick={() => setTool(t)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setTool(t);
                    }
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${
                    active
                      ? "bg-brand-50 border-brand-300 text-brand-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t}
                </div>
              );
            })}
          </div>
          {errors.tool && (
            <p id="fb-tool-err" role="alert" className="text-xs text-red-600 mt-1">
              {errors.tool}
            </p>
          )}
        </div>
      )}

      {/* Сообщение */}
      <div className="mt-4">
        <label htmlFor="fb-message" className="text-sm font-semibold text-slate-700 block mb-1.5">
          Опишите подробнее
        </label>
        <textarea
          id="fb-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={type ? PLACEHOLDERS[type] : "В чём суть обращения?"}
          aria-describedby={errors.message ? "fb-message-err" : undefined}
          aria-invalid={!!errors.message}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-y"
        />
        {errors.message && (
          <p id="fb-message-err" role="alert" className="text-xs text-red-600 mt-1">
            {errors.message}
          </p>
        )}
      </div>

      {/* Раскрывашка: скриншоты + техданные */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
        >
          {showDetails ? "Скрыть дополнительно" : "Подробнее (скриншоты, техданные)"}
          <span className={`transition-transform ${showDetails ? "rotate-180" : ""}`}>▾</span>
        </button>

        {showDetails && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1.5">
                Скриншоты (необязательно)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600 bg-white transition"
              >
                <Upload className="w-4 h-4" />
                До {MAX_FILES} файлов, PNG/JPG/WEBP, до 5 МБ каждый
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                      <span className="truncate pr-2">{f.name}</span>
                      <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.files && <p className="text-xs text-red-600 mt-1">{errors.files}</p>}
            </div>
            <p className="text-xs text-slate-600 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
              Вместе с сообщением мы получим техническую информацию о вашем браузере (адрес страницы, браузер, устройство) — это поможет быстрее разобраться. Данные обрабатываются по&nbsp;
              <a href="/privacy" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">политике конфиденциальности</a>.
            </p>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mt-4">
        <label htmlFor="fb-email" className="text-sm font-semibold text-slate-700 block mb-1.5">
          Email для ответа
        </label>
        <input
          id="fb-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? "fb-email-err" : undefined}
          aria-invalid={!!errors.email}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        {errors.email && (
          <p id="fb-email-err" role="alert" className="text-xs text-red-600 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Согласие */}
      <div className="mt-3">
        <label htmlFor="fb-consent" className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            id="fb-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-describedby={errors.consent ? "fb-consent-err" : undefined}
            aria-invalid={!!errors.consent}
            className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Я согласен(а) на обработку персональных данных (email и текста обращения) по&nbsp;
            <a href="/privacy" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">
              политике конфиденциальности
              <span className="sr-only"> (откроется в новой вкладке)</span>
            </a>.
          </span>
        </label>
        {errors.consent && (
          <p id="fb-consent-err" role="alert" className="text-xs text-red-600 mt-1">
            {errors.consent}
          </p>
        )}
      </div>

      {status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{submitError}</span>
          <button onClick={submit} className="font-semibold underline">Повторить</button>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        aria-disabled={status === "submitting"}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 transition"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Отправляем…
          </>
        ) : (
          <>Отправить обращение</>
        )}
      </button>
    </div>
  );
}
