"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Search, AlertTriangle, Check, Loader2, Car, FileText, Shield, CreditCard, RefreshCw } from "lucide-react";

const REPORT_PRICE = 199;

type CheckStatus = "idle" | "unpaid" | "pending" | "ready" | "failed";

interface ReportPayload {
  sources: Record<string, unknown>;
}

function pick(obj: unknown, paths: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const p of paths) {
    const parts = p.split(".");
    let cur: unknown = obj;
    let ok = true;
    for (const part of parts) {
      if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && cur !== null && cur !== undefined && cur !== "") {
      const v = String(cur);
      if (v && v !== "null" && v !== "undefined") return v;
    }
  }
  return null;
}

function extractSummary(payload: ReportPayload) {
  const s = payload.sources ?? {};
  const vin = pick(s.vindecode, ["vin", "result.vin", "data.vin"]) ?? "";
  const brand = pick(s.vindecode, ["brand", "mark", "result.brand", "result.mark", "data.brand", "data.mark", "model.brand"]) ?? "";
  const model = pick(s.vindecode, ["model", "result.model", "data.model"]) ?? "";
  const year = pick(s.vindecode, ["year", "result.year", "data.year", "build_year"]) ?? "";
  const status = pick(s.gibddhistory2, ["status", "result.status", "data.status", "reg_status", "account_status"]) ?? "";
  const theft = pick(s.gibddhistory2, ["theft", "wanted", "result.theft", "data.theft", "is_theft"]) ?? "";
  const dtpCount = pick(s.dtp, ["count", "total", "accidents", "result.count", "data.count", "dtp_count"]) ?? "";
  const pledge = pick(s.zalog, ["pledge", "pledged", "result.pledge", "data.pledge", "has_pledge", "status"]) ?? "";
  return { vin, brand, model, year, status, theft, dtpCount, pledge };
}

export default function AutotekaPage() {
  const [vin, setVin] = useState("");
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        body: JSON.stringify({ vin }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setError("Войдите в аккаунт, чтобы купить отчёт");
        return;
      }
      if (res.status === 409) {
        setError("Отчёт по этому VIN уже куплен — обновите страницу");
        return;
      }
      if (res.status === 503 || !res.ok) {
        setError(json?.error === "payment_unavailable" ? "Оплата временно недоступна — попробуйте позже" : "Не удалось создать платёж. Попробуйте позже");
        return;
      }
      window.location.href = json.confirmation_url;
    } catch {
      setError("Сервис временно недоступен. Попробуйте ещё раз");
    } finally {
      setPaying(false);
    }
  };

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

  const summary = payload ? extractSummary(payload) : null;
  const unpaid = status === "unpaid";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Автотека — проверка истории автомобиля</h1>
          <p className="text-sm text-gray-600">VIN, ДТП, залоги, розыск</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <label className="text-xs font-bold text-gray-700 uppercase">Введите VIN номер</label>
        <div className="flex gap-3">
          <input
            type="text" placeholder="17 символов VIN" value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            maxLength={17}
            className="flex-1 bg-gray-50 border border-gray-200 text-sm py-3 px-4 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono tracking-wider"
          />
          <button
            onClick={handleCheck}
            disabled={vin.length !== 17 || checking || status === "pending"}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {checking || status === "pending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {status === "pending" ? "Ждём отчёт…" : "Проверить"}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 font-mono">VIN должен содержать ровно 17 символов</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {status === "pending" && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-4 text-sm text-indigo-700">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Оплата получена — формируем отчёт по VIN. Обычно это занимает до 30 секунд.
        </div>
      )}

      {unpaid && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Car className="h-6 w-6 text-indigo-500 flex-shrink-0" />
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
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3 bg-indigo-500 text-white font-bold text-sm rounded-xl hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            {paying ? "Создаём платёж…" : `Купить отчёт за ${REPORT_PRICE} ₽`}
          </button>
          <p className="text-[11px] text-gray-600 flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Оплата через ЮKassa: МИР, Visa, Mastercard, СБП. Отчёт придёт сразу после оплаты.
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Не удалось получить данные по этому VIN — мы вернули оплату. Попробуйте другой VIN или{" "}
          <Link href="/contacts#feedback" className="font-semibold underline">сообщите о проблеме</Link>.
        </div>
      )}

      {status === "ready" && summary && payload && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Car className="h-8 w-8 text-indigo-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {summary.brand || "Автомобиль"} {summary.model && <span>{summary.model}</span>} {summary.year && <span>, {summary.year}</span>}
              </h3>
              <p className="text-xs text-gray-600">VIN: {summary.vin || vin}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Статус учёта", value: summary.status, ok: true },
              { label: "Розыск", value: summary.theft, ok: true },
              { label: "ДТП", value: summary.dtpCount, ok: !summary.dtpCount || summary.dtpCount === "0" },
              { label: "Залоги", value: summary.pledge, ok: true },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-[10px] text-gray-600 uppercase font-mono">{item.label}</p>
                <p className={`text-lg font-bold ${item.value && item.value !== "0" && item.value.toLowerCase() !== "нет" && item.value.toLowerCase() !== "не заложен" ? "text-amber-700" : "text-emerald-600"}`}>
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
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

      {status === "idle" && !payload && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-indigo-600">
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
  );
}