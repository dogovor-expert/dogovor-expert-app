"use client";

import { useCallback, useEffect, useRef } from "react";

interface PanelProps {
  id: string;
  label: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Выпадающая панель шапки.
 *
 * Общая обёртка для калькулятора, календаря и заметок: анимация выезда,
 * закрытие по Escape и клику вне, возврат фокуса на кнопку (APG).
 * Анимация отключается при prefers-reduced-motion — полоса в CSS.
 */
export default function HeaderPanel({ id, label, open, onClose, children }: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label={label}
      /* На узких экранах панель не может быть якорем к кнопке: группа кнопок
         шириной ~110px стоит левее центра, и панель в 22rem уезжала за левый
         край вьюпорта (на 390px — на 70px). Поэтому ниже sm это лист на всю
         ширину под шапкой, а от sm — выпадашка у кнопки. */
      className="hp-panel fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-slate-900/10 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[22rem]"
    >
      {children}
    </div>
  );
}

/** Шапка панели: заголовок + необязательное действие справа. */
export function PanelHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {action}
    </div>
  );
}