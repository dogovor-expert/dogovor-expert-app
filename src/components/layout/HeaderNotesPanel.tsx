"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, CalendarPlus, Check, Trash2 } from "lucide-react";
import {
  createNote,
  deleteNote,
  downloadIcs,
  dueNotes,
  loadNotes,
  pendingCount,
  saveNotes,
  toIso,
  toggleNote,
  type HeaderNote,
} from "@/lib/header-notes";

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const date = d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${date}, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Заметки и напоминания в шапке.
 *
 * Всё живёт в localStorage — без входа в аккаунт и без сети. Напоминание
 * показывается, пока вкладка открыта (service worker в проекте запрещён),
 * поэтому у заметки со сроком есть экспорт в календарь телефона/компьютера:
 * системное напоминание придёт, даже если сайт закрыт.
 */
export default function HeaderNotesPanel({ onNotifyChange }: { onNotifyChange?: (n: number) => void }) {
  const [notes, setNotes] = useState<HeaderNote[]>([]);
  const [text, setText] = useState("");
  const [when, setWhen] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [fired, setFired] = useState<HeaderNote[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNotes(loadNotes());
    if (typeof Notification === "undefined") setPermission("unsupported");
    else setPermission(Notification.permission);
  }, []);

  const persist = useCallback(
    (next: HeaderNote[]) => {
      setNotes(next);
      saveNotes(next);
      onNotifyChange?.(pendingCount(next));
    },
    [onNotifyChange],
  );

  // Таймер напоминаний: проверяем раз в 20 секунд, пока вкладка видима.
  useEffect(() => {
    const check = () => {
      const current = loadNotes();
      const due = dueNotes(current);
      if (!due.length) return;
      const next = current.map((n) =>
        due.some((d) => d.id === n.id) ? { ...n, notifiedAt: new Date().toISOString() } : n,
      );
      saveNotes(next);
      setNotes(next);
      setFired(due);
      onNotifyChange?.(pendingCount(next));
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const n = due[0];
        try {
          new Notification("Напоминание · dogovor.expert", { body: n.text, tag: n.id });
        } catch {
          // некоторые браузеры требуют service worker — просто молчим
        }
      }
    };
    const id = window.setInterval(() => {
      if (!document.hidden) check();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [onNotifyChange]);

  // Тост о сработавшем напоминании живёт 8 секунд.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const askPermission = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
    } catch {
      setPermission("denied");
    }
  };

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    persist([createNote(trimmed, toIso(when)), ...notes]);
    setText("");
    setWhen("");
    inputRef.current?.focus();
  };

  const active = notes.filter((n) => !n.done);
  const done = notes.filter((n) => n.done);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">Заметки и напоминания</p>
        {notes.length > 0 && (
          <span className="text-[11px] text-gray-500">
            {active.length} активных
          </span>
        )}
      </div>

      {/* Форма добавления */}
      <div className="border-b border-gray-100 p-3">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          maxLength={500}
          placeholder="Например: подписать акт до 15 числа"
          aria-label="Текст заметки"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-label="Напомнить"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={add}
            disabled={!text.trim()}
            className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Добавить
          </button>
        </div>
        {permission !== "granted" && permission !== "unsupported" && (
          <button
            type="button"
            onClick={() => void askPermission()}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-600 hover:underline"
          >
            <BellRing className="h-3 w-3" aria-hidden />
            Разрешить уведомления на этом устройстве
          </button>
        )}
      </div>

      {/* Список */}
      <div className="max-h-72 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-500">
            Пока пусто. Добавьте заметку — она сохранится только в вашем браузере.
          </p>
        ) : (
          <>
            {active.map((n) => (
              <div key={n.id} className="flex items-start gap-2 border-b border-gray-50 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => persist(toggleNote(notes, n.id))}
                  aria-label={n.done ? "Вернуть в работу" : "Отметить выполненной"}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 text-transparent transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <Check className="h-3 w-3" aria-hidden />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-gray-900">{n.text}</p>
                  {n.remindAt && (
                    <p className="mt-0.5 text-[11px] text-brand-600">
                      {n.notifiedAt ? "Напомнили" : "Напомнить"}: {fmtWhen(n.remindAt)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {n.remindAt && (
                    <button
                      type="button"
                      onClick={() => downloadIcs(n)}
                      title="Добавить в календарь устройства"
                      aria-label="Добавить в календарь устройства"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => persist(deleteNote(notes, n.id))}
                    title="Удалить"
                    aria-label="Удалить заметку"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
            {done.length > 0 && (
              <details className="px-4 py-2">
                <summary className="cursor-pointer text-[11px] font-semibold text-gray-500">
                  Выполнено: {done.length}
                </summary>
                <div className="mt-2 space-y-2">
                  {done.map((n) => (
                    <div key={n.id} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => persist(toggleNote(notes, n.id))}
                        aria-label="Вернуть в работу"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-brand-500 bg-brand-500 text-white"
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </button>
                      <p className="min-w-0 flex-1 text-[13px] leading-snug text-gray-400 line-through">
                        {n.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => persist(deleteNote(notes, n.id))}
                        aria-label="Удалить заметку"
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5">
        <p className="text-[11px] leading-relaxed text-gray-500">
          Хранится только в вашем браузере. Напоминание сработает, пока открыта вкладка;{" "}
          <span className="text-gray-600">иконка календаря</span> добавляет напоминание
          в системный календарь — тогда оно придёт даже без сайта.
        </p>
      </div>

      {/* Тост о сработавшем напоминании */}
      {toast && fired.length > 0 && (
        <div
          role="status"
          className="border-t border-brand-100 bg-brand-50 px-4 py-2.5 text-[12px] text-brand-900"
        >
          <p className="font-semibold">Напоминание</p>
          <p className="mt-0.5 text-brand-800">{fired[0].text}</p>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {fired.length > 0 ? `Сработало напоминание: ${fired[0].text}` : ""}
      </span>
    </div>
  );
}