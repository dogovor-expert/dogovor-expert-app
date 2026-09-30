"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Delete, Equal } from "lucide-react";

type Op = "+" | "−" | "×" | "÷";

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

/** Аккуратный формат: до 10 знаков, без хвостовых нулей. */
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "Ошибка";
  const r = Math.round(n * 1e10) / 1e10;
  return r.toLocaleString("ru-RU", { maximumFractionDigits: 10 });
}

const KEYS: { label: string; kind: "digit" | "op" | "eq" | "clear" | "sign" }[] = [
  { label: "C", kind: "clear" },
  { label: "±", kind: "sign" },
  { label: "÷", kind: "op" },
  { label: "×", kind: "op" },
  { label: "7", kind: "digit" },
  { label: "8", kind: "digit" },
  { label: "9", kind: "digit" },
  { label: "−", kind: "op" },
  { label: "4", kind: "digit" },
  { label: "5", kind: "digit" },
  { label: "6", kind: "digit" },
  { label: "+", kind: "op" },
  { label: "1", kind: "digit" },
  { label: "2", kind: "digit" },
  { label: "3", kind: "digit" },
  { label: "0", kind: "digit" },
  { label: ",", kind: "digit" },
  { label: "⌫", kind: "clear" },
  { label: "=", kind: "eq" },
];

/**
 * Быстрый калькулятор в шапке.
 *
 * Считает локально, без сети. Полные 23 калькулятора с актуальными ставками
 * живут в /utils — отсюда ссылка туда.
 */
export default function HeaderCalculatorPanel() {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const press = useCallback(
    (key: (typeof KEYS)[number]) => {
      setDisplay((d) => {
        if (key.kind === "clear") {
          if (key.label === "⌫") {
            if (fresh) return "0";
            const next = d.length > 1 ? d.slice(0, -1) : "0";
            return next === "-" ? "0" : next;
          }
          setAcc(null);
          setOp(null);
          setFresh(true);
          return "0";
        }
        if (key.kind === "sign") {
          if (d === "0") return d;
          return d.startsWith("-") ? d.slice(1) : `-${d}`;
        }
        if (key.kind === "digit") {
          if (fresh) {
            setFresh(false);
            return key.label === "," ? "0," : key.label;
          }
          if (key.label === ",") return d.endsWith(",") || d.includes(".") ? d : `${d},`;
          return d.replace(/^-/, "").length >= 14 ? d : `${d}${key.label}`;
        }
        if (key.kind === "op") {
          const nextOp = key.label as Op;
          const value = parseFloat(d.replace(",", "."));
          if (acc !== null && op && !fresh) {
            const result = apply(acc, value, op);
            setAcc(result);
            setDisplay(fmt(result));
            setOp(nextOp);
            setFresh(true);
            return fmt(result);
          }
          setAcc(value);
          setOp(nextOp);
          setFresh(true);
          return d;
        }
        // "="
        const value = parseFloat(d.replace(",", "."));
        if (acc === null || !op) return d;
        const result = apply(acc, value, op);
        setAcc(null);
        setOp(null);
        setFresh(true);
        return fmt(result);
      });
    },
    [acc, op, fresh],
  );

  // Клавиатура: работает, пока панель открыта (слушатель вешает родитель).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (/^[0-9]$/.test(e.key)) press({ label: e.key, kind: "digit" });
      else if (e.key === "," || e.key === ".") press({ label: ",", kind: "digit" });
      else if (e.key === "+") press({ label: "+", kind: "op" });
      else if (e.key === "-") press({ label: "−", kind: "op" });
      else if (e.key === "*" || e.key === "x") press({ label: "×", kind: "op" });
      else if (e.key === "/") press({ label: "÷", kind: "op" });
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        press({ label: "=", kind: "eq" });
      } else if (e.key === "Backspace") press({ label: "⌫", kind: "clear" });
      else if (e.key === "Escape" || e.key.toLowerCase() === "c") press({ label: "C", kind: "clear" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div>
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">Калькулятор</p>
        <p
          ref={liveRef}
          aria-live="polite"
          className="mt-1 truncate text-right text-2xl font-bold tabular-nums text-gray-900"
        >
          {display}
        </p>
        {acc !== null && op && (
          <p className="text-right text-[11px] tabular-nums text-gray-500">
            {fmt(acc)} {op}
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-3">
        {KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => press(k)}
            aria-label={k.label}
            className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
              k.kind === "eq"
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : k.kind === "op"
                  ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  : k.kind === "clear" || k.kind === "sign"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-900 hover:bg-gray-100"
            }`}
          >
            {k.label === "⌫" ? <Delete className="h-4 w-4" aria-hidden /> : k.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
          <Equal className="h-3 w-3" aria-hidden />
          Считает на устройстве
        </span>
        <Link
          href="/utils"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Все 23 калькулятора
        </Link>
      </div>
    </div>
  );
}