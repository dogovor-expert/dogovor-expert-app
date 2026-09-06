"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Search, AlertTriangle, Check, Loader2, Car, FileText, Shield, CreditCard, RefreshCw,
  Banknote, ShieldCheck, History, Zap, Link2, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { track, goals } from "@/lib/analytics";
const STD_PRICE = 199;
const PREM_PRICE = 299;

type CheckStatus = "idle" | "unpaid" | "pending" | "ready" | "failed";
type Tariff = "std" | "prem";

interface ReportPayload {
  vindecode?: unknown;
  gibddhistory2?: unknown;
  dtp?: unknown;
  zalog?: unknown;
  api?: unknown;
  premium?: unknown;
}

interface ReportItem {
  id: string;
  vin: string;
  status: string;
  created_at: string;
}

function deepFind(obj: unknown, names: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const lower = names.map((n) => n.toLowerCase());
  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [k, v] of entries) {
    if (lower.includes(k.toLowerCase())) return v;
  }
  for (const [, v] of entries) {
    if (v && typeof v === "object") {
      const r = deepFind(v, names);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

function extractSummary(payload: ReportPayload) {
  // TRONK reportjson — единый полный отчёт (ГИБДД, ДТП, розыск, залоги, VIN).
  const rj = (payload as any)?.reportjson;

  const vin = (deepFind(rj, ["vin"]) as string) ?? "";
  const brand = (deepFind(rj, ["marka", "brand", "марка"]) as string) ?? "";
  const model = (deepFind(rj, ["model", "модель"]) as string) ?? "";
  const yearRaw = deepFind(rj, ["year", "modelyear", "год"]);
  const year = typeof yearRaw === "number" || typeof yearRaw === "string" ? yearRaw : "";

  const status = (deepFind(rj, ["registration", "статусучёта", "статус"]) as string) ?? "";
  const theft = (deepFind(rj, ["wanted", "розыск", "theft", "poisk"]) as string) ?? "";

  const dtpRaw = deepFind(rj, ["dtp", "дтп", "accidents", "accident"]);
  let dtpCount: unknown = "";
  if (Array.isArray(dtpRaw)) dtpCount = dtpRaw.length;
  else if (dtpRaw && typeof dtpRaw === "object") dtpCount = "1";
  else if (dtpRaw === true || dtpRaw === "true") dtpCount = "1";
  else dtpCount = "0";

  const pledgeRaw = deepFind(rj, ["zalog", "залог", "pledge", "обременение"]);
  const pledge =
    pledgeRaw === true || pledgeRaw === "true"
      ? "Да"
      : pledgeRaw === false || pledgeRaw === "false"
        ? "Нет"
        : (pledgeRaw as string) ?? "";

  return { vin, brand, model, year, status, theft, dtpCount, pledge };
}

function statusLabel(s: string): string {
  if (s === "ready") return "Готов";
  if (s === "pending") return "В обработке";
  if (s === "failed") return "Ошибка";
  return "Не оплачен";
}

export default function AutotekaClient() {
  const vinId = useId();
  const [vin, setVin] = useState("");
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [history, setHistory] = useState<ReportItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [tariff, setTariff] = useState<Tariff>("std");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const price = tariff === "prem" ? PREM_PRICE : STD_PRICE;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const check = useCallback(async (v: string, poll = false) => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/autoteka/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: v }),
      });
      if (res.status === 401) {
        setStatus("idle");
        setError("Войдите в аккаунт, чтобы проверить автомобиль");
        return;
      }
      if (res.status === 503) {
        setStatus("idle");
        setError("Проверка временно недоступна — попробуйте позже");
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) {
        setStatus("idle");
        setError("Не удалось проверить VIN. Попробуйте ещё раз");
        return;
      }
      setStatus(json.status);
      if (json.status === "ready" && json.report?.payload) {
        setPayload(json.report.payload as ReportPayload);
        if (poll && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch {
      setStatus("idle");
      setError("Сервис временно недоступен. Попробуйте ещё раз");
    } finally {
      setChecking(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/autoteka/history");
      if (res.status === 401) {
        setIsAuthed(false);
        return;
      }
      const json = await res.json().catch(() => null);
      if (json?.reports) setHistory(json.reports as ReportItem[]);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handleCheck = () => {
    if (vin.length !== 17) return;
    setPayload(null);
    setStatus("idle");
    check(vin);
  };

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/autoteka/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin, premium: tariff === "prem" }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setError("Войдите или зарегистрируйтесь, чтобы купить отчёт и сохранить его в истории");
        return;
      }
      if (res.status === 409) {
        setError("Отчёт по этому VIN уже куплен — обновите страницу");
        return;
      }
      if (res.status === 503 || !res.ok) {
        if (json?.error === "payment_unavailable") {
          setError("Оплата временно недоступна — попробуйте позже");
        } else if (json?.error === "quota_exceeded") {
          setError(`Лимит бесплатных отчётов PRO (${json.free_limit}/мес) исчерпан — оформите платный отчёт`);
        } else {
          setError(json?.detail ? `Ошибка оплаты: ${json.detail}` : "Не удалось создать платёж. Попробуйте позже");
        }
        return;
      }
      track(goals.autotekaOrderStart, { tariff });
      if (json.free) {
        setStatus("pending");
        check(vin);
        return;
      }
      window.location.href = json.confirmation_url;
    } catch {
      setError("Сервис временно недоступен. Попробуйте ещё раз");
    } finally {
      setPaying(false);
    }
  };

  const openReport = (v: string) => {
    setPayload(null);
    setStatus("idle");
    setVin(v.toUpperCase());
    check(v.toUpperCase());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectTariff = (t: Tariff) => setTariff(t);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("success") && q.get("vin")) {
      const v = (q.get("vin") ?? "").toUpperCase();
      setVin(v);
      setStatus("pending");
      check(v, true);
      pollRef.current = setInterval(() => check(v, true), 3000);
      window.history.replaceState({}, "", "/autoteka");
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [check]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/autoteka/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: "X" }),
        });
        if (res.status === 401) {
          setIsAuthed(false);
          return;
        }
        setIsAuthed(true);
        loadHistory();
      } catch {
        setIsAuthed(null);
      }
    })();
  }, [loadHistory]);

  const summary = payload ? extractSummary(payload) : null;
  const unpaid = status === "unpaid";

  return (
    <div className="relative p-6 space-y-16">
      <div className="pointer-events-none absolute -top-10 -right-16 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-20 w-60 h-60 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ГИБДД · ФНП · ЕАИСТО — напрямую
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Автотека — проверка истории <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">автомобиля по VIN</span>
          </h1>
          <p className="mt-2 text-gray-600">VIN, ДТП, залоги, розыск и реальный пробег из официальных источников.</p>
        </div>

        {isAuthed === false && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 mt-6">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Войдите или зарегистрируйтесь, чтобы покупать отчёты и сохранять их в истории.{" "}
              <Link href="/login" className="font-semibold underline">Войти / Регистрация</Link>
            </span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft mt-6 ring-1 ring-brand-100">
          <label htmlFor={vinId} className="text-xs font-bold text-gray-700 uppercase tracking-wide">Введите VIN номер</label>
          <div className="flex gap-3 mt-3">
            <input
              id={vinId}
              type="text" placeholder="17 символов VIN" value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              className="flex-1 bg-gray-50 border border-gray-200 text-sm py-3 px-4 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-500 font-mono tracking-wider"
            />
            <button
              onClick={handleCheck}
              disabled={vin.length !== 17 || checking || status === "pending"}
              className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {checking || status === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {status === "pending" ? "Ждём отчёт…" : "Проверить"}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-2">VIN должен содержать ровно 17 символов · пример: WAUZZZ4F05N092041</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mt-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {status === "pending" && (
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-4 text-sm text-brand-700 mt-4">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Оплата получена — формируем отчёт по VIN. Обычно это занимает до 30 секунд.
          </div>
        )}

        {unpaid && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Car className="h-6 w-6 text-brand-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Отчёт по VIN {vin}</h3>
                <p className="text-sm text-gray-600">Статус учёта, розыск, ДТП, залоги — из официальных источников</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "История регистрации ГИБДД",
                "Участие в ДТП",
                "Наличие залогов",
                "Расшифровка VIN (марка, модель, год)",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Выберите тариф</p>
              <div className="grid sm:grid-cols-2 gap-3 items-start">
                <div
                  onClick={() => selectTariff("std")}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition flex flex-col ${tariff === "std" ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200" : "border-gray-200 hover:border-brand-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Стандарт</span>
                    <span className="text-xs text-gray-500">базовый</span>
                  </div>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{STD_PRICE}</span>
                    <span className="text-gray-500 font-bold">₽</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
                    {[
                      "История регистраций ГИБДД",
                      "ДТП, розыск, ограничения",
                      "Залоги и обременения (ФНП)",
                      "Расшифровка VIN (марка, модель, год)",
                      "ТО и пробег (ЕАИСТО), ОСАГО",
                    ].map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  onClick={() => selectTariff("prem")}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition flex flex-col ${tariff === "prem" ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200" : "border-gray-200 hover:border-purple-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Премиум</span>
                    <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">всё включено</span>
                  </div>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{PREM_PRICE}</span>
                    <span className="text-gray-500 font-bold">₽</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-700">
                    {[
                      "Всё из Стандарта",
                      "Сервисная история (СТО, ремонты, запчасти)",
                      "Фото авто + SVG-схемы ДТП",
                      "График пробега и детекция скруток",
                      "Такси / каршеринг / лизинг",
                      "ПТС/ЭПТС, таможня, оценка ремонта",
                      "Брендированный PDF-отчёт",
                    ].map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold text-sm rounded-xl hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              {paying ? "Создаём платёж…" : `Купить отчёт за ${price} ₽`}
            </button>
            <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Оплата через ЮKassa: МИР, Visa, Mastercard, СБП. Отчёт придёт сразу после оплаты и сохранится в вашей истории.
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mt-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Не удалось получить данные по этому VIN — мы вернули оплату. Попробуйте другой VIN или{" "}
            <Link href="/contacts#feedback" className="font-semibold underline">сообщите о проблеме</Link>.
          </div>
        )}

        {status === "ready" && summary && payload && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft mt-4 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {summary.brand || "Автомобиль"} {summary.model && <span>{summary.model}</span>} {summary.year && <span>, {summary.year}</span>}
                </h3>
                <p className="text-xs text-gray-500 font-mono">VIN: {summary.vin || vin}</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Данные найдены
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Статус учёта", value: String(summary.status ?? ""), ok: true },
                { label: "Розыск", value: String(summary.theft ?? ""), ok: true },
                { label: "ДТП", value: String(summary.dtpCount ?? ""), ok: !summary.dtpCount || summary.dtpCount === "0" },
                { label: "Залоги", value: String(summary.pledge ?? ""), ok: true },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] text-gray-600 uppercase font-mono">{item.label}</p>
                  <p className={`text-lg font-bold ${item.value && item.value !== "0" && item.value.toLowerCase() !== "нет" && item.value.toLowerCase() !== "не заложен" ? "text-amber-700" : "text-emerald-600"}`}>
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Это базовая сводка. Полный отчёт с сервисной историей, фото и графиком пробега — после покупки Премиум.</p>
            <button
              onClick={() => {
                if (!summary) return;
                window.dispatchEvent(new CustomEvent("autofill", { detail: { brand: summary.brand, vin: summary.vin || vin, year: summary.year ? Number(summary.year) : undefined } }));
                showToast("Данные перенесены в договор ДКП");
              }}
              className="w-full py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" /> Перенести данные в договор ДКП
            </button>
          </div>
        )}

        {isAuthed && history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft mt-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">История отчётов</h3>
            <div className="space-y-2">
              {history.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openReport(r.vin)}
                  className="w-full flex items-center justify-between gap-3 text-left bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:border-brand-300 transition cursor-pointer"
                >
                  <span className="font-mono text-sm text-gray-900">{r.vin}</span>
                  <span className="text-xs text-gray-600">
                    {new Date(r.created_at).toLocaleDateString("ru-RU")}
                  </span>
                  <span className={`text-xs font-semibold ${r.status === "ready" ? "text-emerald-600" : r.status === "failed" ? "text-red-600" : "text-amber-600"}`}>
                    {statusLabel(r.status)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === "idle" && !payload && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-center mt-4">
            <p className="text-xs text-brand-600">
              <Shield className="h-3.5 w-3.5 inline mr-1" />
              Данные предоставлены на основании официальных источников: ГИБДД, ФНП, страховых баз
            </p>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </div>

      <Marketing />
    </div>
  );
}

/* ---------- Маркетинговые блоки (не мешают работе инструмента) ---------- */

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildReportSvg(opts: {
  title: string;
  vin: string;
  tag: string;
  sub: string;
  stats: [string, string, "ok" | "bad" | "premium"][];
  accent: string;
}) {
  const { title, vin, tag, sub, stats, accent } = opts;
  const cardW = 300, cardH = 96, gapX = 24, gapY = 20, x0 = 52, y0 = 212;
  let cards = "";
  stats.forEach((s, i) => {
    const cx = x0 + (i % 2) * (cardW + gapX);
    const cy = y0 + Math.floor(i / 2) * (cardH + gapY);
    const valColor = s[2] === "bad" ? "#b45309" : s[2] === "premium" ? accent : "#059669";
    cards +=
      `<rect x='${cx}' y='${cy}' width='${cardW}' height='${cardH}' rx='16' fill='#f8fafc' stroke='#e2e8f0'/>` +
      `<text x='${cx + 18}' y='${cy + 30}' fill='#64748b' font-family='monospace' font-size='11' letter-spacing='1'>${escXml(s[0].toUpperCase())}</text>` +
      `<text x='${cx + 18}' y='${cy + 62}' fill='${valColor}' font-family='Inter, sans-serif' font-size='22' font-weight='800'>${escXml(s[1])}</text>`;
  });
  const rows = Math.ceil(stats.length / 2);
  const footY = y0 + rows * (cardH + gapY) - gapY + 40;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='760' height='${footY + 70}' viewBox='0 0 760 ${footY + 70}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='${accent}'/><stop offset='1' stop-color='#7c3aed'/></linearGradient></defs>` +
    `<rect width='760' height='${footY + 70}' fill='#f8fafc'/>` +
    `<rect x='24' y='24' width='712' height='${footY + 22}' rx='24' fill='#ffffff' stroke='#e2e8f0'/>` +
    `<rect x='24' y='24' width='712' height='96' rx='24' fill='url(#g)'/>` +
    `<rect x='24' y='88' width='712' height='32' fill='url(#g)'/>` +
    `<text x='52' y='62' fill='#ffffff' font-family='Inter, sans-serif' font-size='22' font-weight='700'>Dogovor.expert · Отчёт по VIN</text>` +
    `<text x='52' y='92' fill='#dbeafe' font-family='monospace' font-size='13'>${escXml(vin)}</text>` +
    `<text x='52' y='156' fill='#0f172a' font-family='Inter, sans-serif' font-size='26' font-weight='800'>${escXml(title)}</text>` +
    `<text x='52' y='182' fill='#64748b' font-family='Inter, sans-serif' font-size='13'>${escXml(sub)}</text>` +
    `<rect x='${x0}' y='${y0 - 60}' width='${cardW}' height='26' rx='13' fill='${accent}1a'/><text x='${x0 + 14}' y='${y0 - 42}' fill='${accent}' font-family='Inter, sans-serif' font-size='13' font-weight='700'>${escXml(tag)}</text>` +
    cards +
    `<text x='52' y='${footY}' fill='#94a3b8' font-family='Inter, sans-serif' font-size='12'>Источники: ГИБДД · ФНП · ЕАИСТО · РСА · Росстандарт</text>` +
    `<text x='52' y='${footY + 22}' fill='#94a3b8' font-family='Inter, sans-serif' font-size='12'>dogovor.expert — перенос данных в договор ДКП в один клик</text>` +
    `</svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const SAMPLE_SLIDES = [
  buildReportSvg({
    title: "AUDI A6, 2005",
    vin: "WAUZZZ4F05N092041",
    tag: "Стандарт",
    sub: "ГИБДД, ДТП, залоги, расшифровка VIN, ЕАИСТО",
    accent: "#2563eb",
    stats: [
      ["Статус учёта", "Чисто", "ok"],
      ["Розыск", "Нет", "ok"],
      ["ДТП", "2", "bad"],
      ["Залоги", "Нет", "ok"],
    ],
  }),
  buildReportSvg({
    title: "AUDI A6, 2005",
    vin: "WAUZZZ4F05N092041",
    tag: "Премиум",
    sub: "Всё из Стандарта + сервисная история, фото, пробег",
    accent: "#7c3aed",
    stats: [
      ["Статус учёта", "Чисто", "ok"],
      ["Розыск", "Нет", "ok"],
      ["ДТП", "2 (схемы)", "bad"],
      ["Залоги", "Нет", "ok"],
      ["Сервисная история", "3 ремонта", "premium"],
      ["Пробег", "Подтверждён", "ok"],
    ],
  }),
];

function Marketing() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const slides = SAMPLE_SLIDES;

  const close = () => setOpen(false);
  const next = () => setSlide((s) => (s + 1) % slides.length);
  const prev = () => setSlide((s) => (s - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const whyCards = [
    { icon: Banknote, color: "brand", title: "Дешевле на 40–60%", text: "Тот же объём данных, что у конкурентов за 499 ₽, у нас стоит 199–299 ₽. Прямая закупка без наценки." },
    { icon: FileText, color: "purple", title: "Брендированный отчёт", text: "Премиум — это готовый PDF/HTML на вашем домене. Перенос данных в договор ДКП в один клик." },
    { icon: ShieldCheck, color: "emerald", title: "50+ источников данных", text: "ГИБДД, ЕАИСТО, ФНП, РСА, Росстандарт, ФТС, Федресурс — всё в одном отчёте без доплат." },
    { icon: History, color: "brand", title: "История сохраняется", text: "Все купленные отчёты видны в личном кабинете. Обновили страницу — данные на месте." },
    { icon: Zap, color: "purple", title: "Мгновенно и честно", text: "Оплата через ЮKassa (МИР, Visa, СБП). Отчёт приходит через 30 секунд после оплаты." },
    { icon: Link2, color: "emerald", title: "Привязка к договору", text: "Переносите марку, VIN и год прямо в шаблон договора купли-продажи на том же сайте." },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    brand: { bg: "bg-brand-50", text: "text-brand-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  };

  const bars = [
    { name: "Автокод", price: 499, ours: false },
    { name: "Авто.ру", price: 179, ours: false },
    { name: "Автотека", price: 179, ours: false },
    { name: "Дром", price: 180, ours: false },
    { name: "Наш Стандарт", price: 199, ours: true, accent: "brand" },
    { name: "Наш Премиум", price: 299, ours: true, accent: "purple" },
  ];
  const maxPrice = 499;

  return (
    <section className="max-w-7xl mx-auto space-y-16">
      {/* Блок 1 — Почему выгоднее */}
      <div>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Почему <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">Dogovor.expert</span> выгоднее
          </h2>
          <p className="mt-4 text-gray-600">Мы берём данные напрямую у первоисточника (TRONK), минуя посредников, и передаём экономию вам.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((c) => {
            const Icon = c.icon;
            const cm = colorMap[c.color];
            return (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft hover:-translate-y-1.5 hover:shadow-lg transition">
                <div className={`w-12 h-12 rounded-xl ${cm.bg} flex items-center justify-center ${cm.text} mb-4`}>
                  <Icon width={24} height={24} />
                </div>
                <h3 className="font-bold text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Блок 2 — Цена против конкурентов */}
      <div>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Цена <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">против конкурентов</span>
          </h2>
          <p className="mt-4 text-gray-600">Базовый одиночный отчёт у лидеров рынка против наших тарифов.</p>
        </div>
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="space-y-4">
            {bars.map((b) => {
              const w = Math.round((b.price / maxPrice) * 100);
              const barColor = b.accent === "purple"
                ? "bg-gradient-to-r from-purple-500 to-purple-600"
                : b.accent === "brand"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600"
                  : "bg-gray-300";
              const nameColor = b.ours ? (b.accent === "purple" ? "text-purple-700 font-bold" : "text-brand-700 font-bold") : "text-gray-700 font-medium";
              return (
                <div key={b.name} className="flex items-center gap-4">
                  <div className={`w-28 text-sm text-right ${nameColor}`}>{b.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-9 overflow-hidden">
                    <div className={`h-full rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold ${barColor}`} style={{ width: `${w}%` }}>
                      {b.price} ₽
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-sm text-gray-500">При сопоставимом объёме данных Премиум в 1.7× дешевле Автокода и богаче базовых отчётов Авто.ру и Автотеки.</p>
        </div>
      </div>

      {/* Блок 3 — Сравнение возможностей */}
      <div>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Что входит в каждый тариф</h2>
          <p className="mt-4 text-gray-600">Открытый образец отчёта — листайте стрелками или кликом по краям.</p>
        </div>
        <div
          className="mt-12 overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Сравнение возможностей тарифов"
        >
          <table className="w-full max-w-4xl mx-auto text-sm border-collapse">
            <thead>
              <tr className="text-gray-600">
                <th className="text-left font-medium py-3 px-4">Возможность</th>
                <th className="text-center font-semibold py-3 px-4 text-gray-700">Авто.ру / Автотека</th>
                <th className="text-center font-semibold py-3 px-4 text-brand-700">Наш Стандарт</th>
                <th className="text-center font-semibold py-3 px-4 text-purple-700">Наш Премиум</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-t border-gray-100"><td className="py-3 px-4">История ГИБДД</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600 font-semibold">✓</td><td className="text-center text-emerald-600">✓</td></tr>
              <tr className="border-t border-gray-100 bg-gray-50"><td className="py-3 px-4">ДТП + схемы повреждений</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-purple-600 font-semibold">✓ + SVG</td></tr>
              <tr className="border-t border-gray-100"><td className="py-3 px-4">Залоги / обременения</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-emerald-600">✓</td></tr>
              <tr className="border-t border-gray-100 bg-gray-50"><td className="py-3 px-4">Сервисная история (СТО)</td><td className="text-center text-gray-400">—</td><td className="text-center text-gray-400">—</td><td className="text-center text-purple-600 font-semibold">✓</td></tr>
              <tr className="border-t border-gray-100"><td className="py-3 px-4">Фото + история объявлений</td><td className="text-center text-gray-400">частично</td><td className="text-center text-gray-400">—</td><td className="text-center text-purple-600 font-semibold">✓</td></tr>
              <tr className="border-t border-gray-100 bg-gray-50"><td className="py-3 px-4">График пробега + скрутки</td><td className="text-center text-amber-600">базово</td><td className="text-center text-emerald-600">✓</td><td className="text-center text-purple-600 font-semibold">✓+</td></tr>
              <tr className="border-t border-gray-100"><td className="py-3 px-4">Брендированный PDF</td><td className="text-center text-gray-400">—</td><td className="text-center text-gray-400">—</td><td className="text-center text-purple-600 font-semibold">✓</td></tr>
              <tr className="border-t border-gray-100"><td className="py-3 px-4 font-semibold text-gray-900">Цена</td><td className="text-center font-semibold">179 ₽</td><td className="text-center font-bold text-brand-700">199 ₽</td><td className="text-center font-bold text-purple-700">299 ₽</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => { setSlide(0); setOpen(true); }}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-lg hover:-translate-y-0.5 transition"
          >
            <FileText className="h-4 w-4" /> Открыть образец отчёта
          </button>
          <p className="text-xs text-gray-500">Листайте ← → или кликайте по краям изображения</p>
        </div>
      </div>

      {/* Лайтбокс — слайды образца отчёта */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={close}>
          <button onClick={close} aria-label="Закрыть" className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-7 h-7" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Назад" className="absolute left-3 sm:left-6 text-white/80 hover:text-white">
            <ChevronLeft className="w-9 h-9 sm:w-11 sm:h-11" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Вперёд" className="absolute right-3 sm:right-6 text-white/80 hover:text-white">
            <ChevronRight className="w-9 h-9 sm:w-11 sm:h-11" />
          </button>
          <img
            src={slides[slide]}
            alt="Образец отчёта Dogovor.expert"
            className="max-h-[88vh] max-w-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === slide ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
