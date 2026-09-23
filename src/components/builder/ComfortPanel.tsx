import { BellRing, Focus, Minus, Moon, Plus, Sun, Sunset } from "lucide-react";
import type { BuilderTheme } from "@/lib/hooks/useBuilderTheme";

interface ComfortPanelProps {
  theme: BuilderTheme;
  onThemeChange: (t: BuilderTheme) => void;
  formScale: number;
  onScaleChange: (v: number) => void;
  focusMode: boolean;
  onFocusToggle: () => void;
  breakReminder: boolean;
  onBreakToggle: () => void;
}

const THEMES: { id: BuilderTheme; label: string; hint: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Светлая", hint: "как обычно", Icon: Sun },
  { id: "sepia", label: "Сепия", hint: "мягче для глаз", Icon: Sunset },
  { id: "dark", label: "Тёмная", hint: "для вечера", Icon: Moon },
];

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-brand-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/**
 * Панель «Комфорт и вид»: тема рабочей области, размер текста,
 * фокус-режим и напоминание о перерыве. Настройки живут в localStorage.
 * Документ (превью/печать) темою не затрагивается — всегда белый.
 */
export default function ComfortPanel({
  theme,
  onThemeChange,
  formScale,
  onScaleChange,
  focusMode,
  onFocusToggle,
  breakReminder,
  onBreakToggle,
}: ComfortPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1.5">
          Фон рабочей области
        </p>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Фон рабочей области">
          {THEMES.map(({ id, label, hint, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={theme === id}
              onClick={() => onThemeChange(id)}
              className={`rounded-xl border px-2 py-2 text-center transition-colors ${
                theme === id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="block text-[11px] font-bold leading-tight">{label}</span>
              <span className="block text-[10px] leading-tight opacity-80">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1.5">
          Размер текста в форме
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onScaleChange(formScale - 10)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-lg leading-none font-bold"
            aria-label="Уменьшить размер формы"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <span className="flex-1 text-center text-sm font-bold tabular-nums" aria-live="polite">
            {formScale}%
          </span>
          <button
            type="button"
            onClick={() => onScaleChange(formScale + 10)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-lg leading-none font-bold"
            aria-label="Увеличить размер формы"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">
          90–140%. Сохраняется на этом устройстве.
        </p>
      </div>

      <div className="flex items-start gap-2.5 pt-1 border-t border-gray-100">
        <Focus className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700">Фокус-режим</p>
          <p className="text-[11px] text-gray-500">
            Прячет боковую панель — только форма во всю ширину.
          </p>
        </div>
        <Toggle on={focusMode} onClick={onFocusToggle} label="Фокус-режим" />
      </div>

      <div className="flex items-start gap-2.5">
        <BellRing className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700">Напоминать о перерыве</p>
          <p className="text-[11px] text-gray-500">
            Раз в час: посмотреть вдаль 20 секунд.
          </p>
        </div>
        <Toggle on={breakReminder} onClick={onBreakToggle} label="Напоминать о перерыве" />
      </div>
    </div>
  );
}
