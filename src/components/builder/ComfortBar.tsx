import { BellRing, Focus, Minus, Plus } from "lucide-react";
import { BUILDER_THEMES, type BuilderTheme } from "@/lib/hooks/useBuilderTheme";

interface ComfortBarProps {
  theme: BuilderTheme;
  onThemeChange: (t: BuilderTheme) => void;
  formScale: number;
  onScaleChange: (v: number) => void;
  focusMode: boolean;
  onFocusToggle: () => void;
  breakReminder: boolean;
  onBreakToggle: () => void;
}

/**
 * Комфортная полоса над формой (A2 «Гид Премиум»): выбор светлой темы
 * рабочей области (доты-превью из BUILDER_THEMES), размер текста,
 * фокус-режим и напоминание о перерыве. Настройки — в localStorage.
 * Документ (превью/печать) темою не затрагивается — всегда белый.
 */
export default function ComfortBar({
  theme,
  onThemeChange,
  formScale,
  onScaleChange,
  focusMode,
  onFocusToggle,
  breakReminder,
  onBreakToggle,
}: ComfortBarProps) {
  return (
    <section
      aria-label="Комфорт и вид"
      className="a2-tools px-4 py-3 mb-5 flex flex-wrap items-center gap-x-5 gap-y-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-xs font-bold whitespace-nowrap"
          style={{ color: "var(--a2-sub)" }}
        >
          Фон:
        </span>
        <div
          className="flex items-center gap-1.5 flex-wrap"
          role="radiogroup"
          aria-label="Фон рабочей области"
        >
          {BUILDER_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              title={`${t.label} — ${t.hint}`}
              aria-label={`${t.label} — ${t.hint}`}
              onClick={() => onThemeChange(t.id)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                theme === t.id
                  ? "border-brand-500 scale-110 shadow-md"
                  : "border-black/10 hover:scale-105"
              }`}
              style={{ backgroundColor: t.swatch }}
            />
          ))}
        </div>
        <span
          className="text-[11px] whitespace-nowrap hidden sm:inline"
          style={{ color: "var(--a2-muted)" }}
          aria-live="polite"
        >
          {BUILDER_THEMES.find((t) => t.id === theme)?.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold whitespace-nowrap"
          style={{ color: "var(--a2-sub)" }}
        >
          Текст:
        </span>
        <button
          type="button"
          onClick={() => onScaleChange(formScale - 10)}
          className="a2-btn-ghost w-8 h-8 rounded-lg border grid place-items-center"
          aria-label="Уменьшить размер формы"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span
          className="text-xs font-bold tabular-nums min-w-[44px] text-center"
          style={{ color: "var(--a2-ink)" }}
          aria-live="polite"
        >
          {formScale}%
        </span>
        <button
          type="button"
          onClick={() => onScaleChange(formScale + 10)}
          className="a2-btn-ghost w-8 h-8 rounded-lg border grid place-items-center"
          aria-label="Увеличить размер формы"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={focusMode}
        onClick={onFocusToggle}
        className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap rounded-lg px-2.5 py-1.5 border transition-colors"
        style={{
          color: focusMode ? "#1d4ed8" : "var(--a2-sub)",
          borderColor: focusMode ? "#93c5fd" : "var(--a2-chip-bd)",
          backgroundColor: focusMode ? "#eff6ff" : "transparent",
        }}
      >
        <Focus className="w-3.5 h-3.5" />
        Фокус
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={breakReminder}
        onClick={onBreakToggle}
        className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap rounded-lg px-2.5 py-1.5 border transition-colors"
        style={{
          color: breakReminder ? "#1d4ed8" : "var(--a2-sub)",
          borderColor: breakReminder ? "#93c5fd" : "var(--a2-chip-bd)",
          backgroundColor: breakReminder ? "#eff6ff" : "transparent",
        }}
      >
        <BellRing className="w-3.5 h-3.5" />
        Перерывы
      </button>
    </section>
  );
}
