/**
 * Заметки и напоминания в шапке.
 *
 * Хранятся только в localStorage браузера: работают без входа в аккаунт,
 * ничего не уходит на сервер. Серверные уведомления (/api/notifications)
 * требуют авторизации и предназначены для событий аккаунта — здесь другая
 * задача: личные заметки «на полях» и напоминания о сроках.
 *
 * Ограничение честно отражено в UI: без service worker (он запрещён
 * правилами проекта) напоминание срабатывает, пока вкладка открыта. Поэтому
 * у каждой заметки со сроком есть экспорт .ics — системный календарь
 * напомнит о ней независимо от браузера.
 */

export const NOTES_KEY = "dogovor_header_notes_v1";
export const NOTES_MAX = 200;

export interface HeaderNote {
  id: string;
  text: string;
  /** ISO-время создания. */
  createdAt: string;
  /** ISO-момент напоминания или null, если без срока. */
  remindAt: string | null;
  done: boolean;
  /** ISO-момент, когда напоминание уже показали (чтобы не дублировать). */
  notifiedAt: string | null;
}

function isNote(value: unknown): value is HeaderNote {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.text === "string" &&
    typeof n.createdAt === "string" &&
    (n.remindAt === null || typeof n.remindAt === "string") &&
    typeof n.done === "boolean" &&
    (n.notifiedAt === null || typeof n.notifiedAt === "string")
  );
}

/** Читает заметки, отбрасывая мусор и битые записи. */
export function loadNotes(): HeaderNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNote).slice(0, NOTES_MAX);
  } catch {
    // localStorage может быть недоступен (приватный режим, переполнение) —
    // тогда работаем как пустой список, а не падаем.
    return [];
  }
}

export function saveNotes(notes: HeaderNote[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes.slice(0, NOTES_MAX)));
    return true;
  } catch {
    return false;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** `input` из datetime-local → ISO; пустая строка → null. */
export function toIso(localValue: string): string | null {
  if (!localValue) return null;
  const d = new Date(localValue);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → значение для datetime-local (локальная зона браузера). */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

export function createNote(text: string, remindAt: string | null): HeaderNote {
  return {
    id: newId(),
    text: text.trim().slice(0, 500),
    createdAt: new Date().toISOString(),
    remindAt,
    done: false,
    notifiedAt: null,
  };
}

export function toggleNote(notes: HeaderNote[], id: string): HeaderNote[] {
  return notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n));
}

export function deleteNote(notes: HeaderNote[], id: string): HeaderNote[] {
  return notes.filter((n) => n.id !== id);
}

/** Ближайшие ненапомнённые сроки, по возрастанию времени. */
export function dueNotes(notes: HeaderNote[], now = Date.now()): HeaderNote[] {
  return notes
    .filter((n) => !n.done && !n.notifiedAt && n.remindAt && new Date(n.remindAt).getTime() <= now)
    .sort((a, b) => new Date(a.remindAt ?? 0).getTime() - new Date(b.remindAt ?? 0).getTime());
}

/** Число заметок, по которым есть непрочитанное напоминание. */
export function pendingCount(notes: HeaderNote[]): number {
  return notes.filter((n) => !n.done && n.remindAt && !n.notifiedAt).length;
}

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Собирает .ics с одной заметкой-напоминанием. Напоминание ставим за 15 минут
 * до срока (стандартный VALARM), длительность — 30 минут на обработку.
 */
export function buildIcs(note: HeaderNote): string {
  const start = note.remindAt ?? note.createdAt;
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + 30 * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//dogovor.expert//Notes//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${note.id}@dogovor.expert`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(startDate.toISOString())}`,
    `DTEND:${icsStamp(endDate.toISOString())}`,
    `SUMMARY:${icsEscape(note.text)}`,
    "DESCRIPTION:Напоминание из заметок dogovor.expert",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(note.text)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Скачивает .ics через временный объект URL (работает без сервера). */
export function downloadIcs(note: HeaderNote): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([buildIcs(note)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `napominanie-${note.id.slice(0, 8)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Отпускаем URL позже — иначе Safari успевает прервать скачивание.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}