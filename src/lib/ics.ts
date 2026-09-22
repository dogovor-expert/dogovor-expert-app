export interface IcsEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  /** Дата начала, YYYY-MM-DD (целодневное событие). */
  start: string;
  /** Дата окончания (эксклюзив, YYYY-MM-DD). По умолчанию следующая за start. */
  end?: string;
  /** Напоминания: минуты до начала события (напр. [1440] — за сутки). */
  alarmsMin?: number[];
  categories?: string[];
  url?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
}

const PRODUCT_ID = "-//Dogovor Expert//Functions//RU";
const LINE_BREAK = "\r\n";

/** Экранирование ICS-текста: обратная косая, точка с запятой, запятая, перевод строки. */
export function escapeIcsText(raw: string): string {
  return raw
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** YYYY-MM-DD → YYYYMMDD. Возвращает "" для пустого/невалидного значения. */
export function toIcsDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${y}${mo}${d}`;
}

/** Следующая календарная дата (эксклюзивный конец целодневного события). */
export function nextDayIso(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return "";
  const [, y, mo, d] = m;
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/** Текущая метка времени в формате ICS (UTC). */
export function nowStamp(): string {
  const s = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return s; // YYYYMMDDTHHMMSSZ
}

/** Фолдинг строк: RFC 5545 — максимум 75 октетов на физическую строку
 *  (CRLF не входит в лимит); каждая строка-продолжение начинается с пробела. */
export function foldLines(raw: string): string {
  const encoder = new TextEncoder();
  const foldOne = (line: string): string => {
    if (encoder.encode(line).length <= 75) return line;
    const chunks: string[] = [];
    let current = "";
    let currentLen = 0;
    for (const ch of line) {
      const chLen = encoder.encode(ch).length;
      const max = chunks.length === 0 ? 75 : 74;
      if (chLen > max) {
        chunks.push(current);
        chunks.push(ch);
        current = "";
        currentLen = 0;
        continue;
      }
      if (currentLen + chLen > max) {
        chunks.push(current);
        current = ch;
        currentLen = chLen;
      } else {
        current += ch;
        currentLen += chLen;
      }
    }
    if (current) chunks.push(current);
    if (chunks.length === 0) return line;
    const [head, ...tail] = chunks;
    return [head, ...tail.map((c) => " " + c)].join(LINE_BREAK);
  };
  return raw
    .split(LINE_BREAK)
    .map((l) => foldOne(l))
    .join(LINE_BREAK);
}

function valarmBlock(minutes: number): string {
  return [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:" + "Напоминание",
    `TRIGGER:-PT${minutes}M`,
    "END:VALARM",
  ].join(LINE_BREAK);
}

/** Сериализация одного VEVENT. */
export function eventBlock(ev: IcsEvent): string {
  const startIcs = toIcsDate(ev.start);
  if (!startIcs) throw new Error(`Невалидная дата события: ${ev.start}`);
  const endIcs = toIcsDate(ev.end ?? nextDayIso(ev.start) ?? "") || nextDayIso(startIcs);
  const lines: string[] = [
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART;VALUE=DATE:${startIcs}`,
    `DTEND;VALUE=DATE:${endIcs}`,
    `SUMMARY:${escapeIcsText(ev.summary)}`,
  ];
  if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
  if (ev.categories && ev.categories.length > 0) {
    lines.push(`CATEGORIES:${ev.categories.map(escapeIcsText).join(",")}`);
  }
  if (ev.url) lines.push(`URL:${ev.url}`);
  if (ev.status) lines.push(`STATUS:${ev.status}`);
  for (const mins of ev.alarmsMin ?? []) {
    lines.push(valarmBlock(mins));
  }
  lines.push("END:VEVENT");
  return lines.join(LINE_BREAK);
}

export interface IcsBuildOptions {
  events: IcsEvent[];
  name?: string;
}

/** Сборка VCALENDAR (метод PUBLISH, целодневные события). */
export function buildIcs({ events, name = "Напоминания" }: IcsBuildOptions): string {
  const blocks = events.map(eventBlock);
  const cal = [
    "BEGIN:VCALENDAR",
    `PRODID:${PRODUCT_ID}`,
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(name)}`,
    ...blocks,
    "END:VCALENDAR",
  ].join(LINE_BREAK);
  return foldLines(cal) + LINE_BREAK;
}

/** Имена полей-дедлайнов: для них добавляем напоминания за 2 суток и за 1 день. */
const DEADLINE_MARKERS = [
  "end",
  "deadline",
  "term",
  "valid_until",
  "delivery_date",
  "loan_term",
  "pay",
  "return",
  "effect",
];

export function isDeadlineField(fieldId: string): boolean {
  const id = fieldId.toLowerCase();
  return DEADLINE_MARKERS.some((m) => id.includes(m));
}