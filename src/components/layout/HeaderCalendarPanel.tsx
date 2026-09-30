"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTHS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

function startOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1);
}

/** Сетка 6×7: понедельник первым, добиваем пустыми ячейками до 42. */
function buildGrid(year: number, month: number): (Date | null)[] {
  const first = startOfMonth(year, month);
  // JS: воскресенье=0, поэтому сдвигаем на индекс понедельника.
  const offset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  return cells;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Календарь в шапке: месяц, переход по стрелкам, «сегодня» возвращает
 * на текущий месяц. Даты выделены по системной локальной зоне.
 */
export default function HeaderCalendarPanel() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const grid = useMemo(() => buildGrid(view.y, view.m), [view]);
  const isCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();

  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <p className="text-sm font-semibold capitalize text-gray-900">
          {MONTHS[view.m]} {view.y}
        </p>
        <div className="flex items-center gap-1">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-50"
            >
              Сегодня
            </button>
          )}
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Предыдущий месяц"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Следующий месяц"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-[10px] font-semibold uppercase text-gray-400">
              {w}
            </div>
          ))}
          {grid.map((d, i) =>
            d ? (
              <div
                key={d.toISOString()}
                className={`flex h-8 items-center justify-center rounded-lg text-[13px] tabular-nums ${
                  sameDay(d, today)
                    ? "bg-brand-600 font-bold text-white"
                    : d.getDay() === 0 || d.getDay() === 6
                      ? "text-gray-400"
                      : "text-gray-800"
                }`}
              >
                {d.getDate()}
              </div>
            ) : (
              <div key={`e${i}`} aria-hidden className="h-8" />
            ),
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5">
        <p className="text-[11px] leading-relaxed text-gray-500">
          Сегодня {today.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
    </div>
  );
}