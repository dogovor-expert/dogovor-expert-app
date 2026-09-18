"use client";
import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Loader2, AlertCircle } from "lucide-react";
import { saveCalcResult, SAVE_CALC_ERRORS, type CalcKind } from "@/lib/calcDoc";

interface Props {
  kind: CalcKind;
  /** Заголовок будущего документа (напр. «Отпускные за 28 дн — 154 320 ₽»). */
  title: string;
  /** Строки протокола расчёта. */
  lines: string[];
  className?: string;
}

/**
 * 3.10 (аудит): сохраняет результат расчёта в «Мои документы» (/documents)
 * как текстовый протокол. Не требует, чтобы пользователь был залогинен
 * заранее: при 401 показывает ссылку на вход.
 */
export default function SaveCalcButton({ kind, title, lines, className }: Props) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  const onClick = async () => {
    if (state === "saving") return;
    setState("saving");
    setErrMsg(null);
    setNeedLogin(false);
    const res = await saveCalcResult(kind, title, lines);
    if (res.ok) {
      setState("saved");
      setTimeout(() => setState("idle"), 4000);
    } else {
      setState("error");
      setErrMsg(SAVE_CALC_ERRORS[res.error]);
      setNeedLogin(res.error === "unauthorized");
    }
  };

  const path = typeof window !== "undefined" ? window.location.pathname : "/utils";

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => { void onClick(); }}
        disabled={state === "saving"}
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
          state === "saved"
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : state === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-brand-400 hover:text-brand-700"
        }`}
      >
        {state === "saving" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : state === "saved" ? (
          <Check className="w-3.5 h-3.5" />
        ) : state === "error" ? (
          <AlertCircle className="w-3.5 h-3.5" />
        ) : (
          <BookmarkPlus className="w-3.5 h-3.5" />
        )}
        {state === "saved" ? "Сохранено" : state === "error" ? "Ошибка" : "В документы"}
      </button>
      {state === "saved" && (
        <Link href="/documents" className="text-[11px] font-medium text-brand-600 hover:underline">
          Открыть
        </Link>
      )}
      {state === "error" && errMsg && (
        <span className="text-[11px] text-red-600">
          {errMsg}
          {needLogin && (
            <>
              {" "}
              <Link
                href={`/login?next=${encodeURIComponent(path)}`}
                className="underline font-semibold"
              >
                Войти
              </Link>
            </>
          )}
        </span>
      )}
    </span>
  );
}
