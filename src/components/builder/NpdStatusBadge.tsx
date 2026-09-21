"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { isNpdInn } from "@/lib/npd";

type NpdUiState =
  | "idle"
  | "loading"
  | "self-employed"
  | "not-self-employed"
  | "invalid"
  | "unavailable"
  | "rate-limited";

interface NpdApiResponse {
  state?: NpdUiState;
  message?: string;
  date?: string;
}

/**
 * Бейдж статуса самозанятого (НПД) для поля ИНН. Проверка идёт через наш
 * серверный прокси `/api/npd` (у публичного API ФНС нет CORS). Показывается
 * только для 12-значных ИНН физлиц — у юрлиц (10 цифр) НПД не бывает.
 */
export default function NpdStatusBadge({ inn }: { inn: string }) {
  const [state, setState] = useState<NpdUiState>("idle");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!isNpdInn(inn)) {
      setState("idle");
      return;
    }
    const digits = inn.replace(/\D/g, "");
    const controller = new AbortController();
    // Небольшая задержка: не дёргаем ФНС на каждый введённый символ.
    const timer = setTimeout(() => {
      setState("loading");
      fetch("/api/npd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inn: digits }),
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = (await res.json().catch(() => null)) as
            | NpdApiResponse
            | null;
          setMessage(data?.message ?? "");
          setDate(data?.date ?? "");
          setState(data?.state ?? "unavailable");
        })
        .catch((err: unknown) => {
          if ((err as Error)?.name === "AbortError") return;
          setState("unavailable");
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inn]);

  if (state === "idle") return null;

  const base =
    "inline-flex items-start gap-1.5 mt-1 text-xs rounded-lg px-2.5 py-1.5 border";

  if (state === "loading") {
    return (
      <p className={`${base} bg-gray-50 border-gray-200 text-gray-600`}>
        <Loader2 className="w-3.5 h-3.5 flex-shrink-0 mt-px animate-spin" />
        <span>Проверяем статус самозанятого в ФНС…</span>
      </p>
    );
  }
  if (state === "self-employed") {
    return (
      <p className={`${base} bg-emerald-50 border-emerald-200 text-emerald-800`}>
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
        <span>
          Самозанятый (НПД) — подтверждено ФНС
          {date ? ` на ${date}` : ""}
        </span>
      </p>
    );
  }
  if (state === "not-self-employed") {
    return (
      <p className={`${base} bg-yellow-50 border-yellow-200 text-yellow-800`}>
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
        <span>
          Не является плательщиком НПД
          {date ? ` на ${date}` : ""}
        </span>
      </p>
    );
  }
  if (state === "invalid") {
    return (
      <p className={`${base} bg-red-50 border-red-200 text-red-700`}>
        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
        <span>{message || "ИНН не прошёл проверку"}</span>
      </p>
    );
  }
  if (state === "rate-limited") {
    return (
      <p className={`${base} bg-gray-50 border-gray-200 text-gray-600`}>
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
        <span>Слишком много проверок — попробуйте через минуту</span>
      </p>
    );
  }
  return (
    <p className={`${base} bg-gray-50 border-gray-200 text-gray-600`}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
      <span>Сервис ФНС недоступен, проверьте позже</span>
    </p>
  );
}
