import { describe, expect, it } from "vitest";
import {
  buildIcs,
  createNote,
  deleteNote,
  dueNotes,
  NOTES_MAX,
  pendingCount,
  toIso,
  toLocalInput,
  toggleNote,
  type HeaderNote,
} from "@/lib/header-notes";

const base: HeaderNote = {
  id: "n1",
  text: "Подписать акт",
  createdAt: "2026-01-10T10:00:00.000Z",
  remindAt: "2026-01-15T09:00:00.000Z",
  done: false,
  notifiedAt: null,
};

describe("createNote", () => {
  it("обрезает пробелы и лишнюю длину", () => {
    expect(createNote("  hello  ", null).text).toBe("hello");
    expect(createNote("x".repeat(900), null).text).toHaveLength(500);
  });

  it("новую заметку помечает как невыполненную без напоминания", () => {
    const n = createNote("тест", null);
    expect(n.done).toBe(false);
    expect(n.remindAt).toBeNull();
    expect(n.notifiedAt).toBeNull();
    expect(n.id).toBeTruthy();
  });

  it("даёт уникальные id", () => {
    const ids = new Set(Array.from({ length: 50 }, () => createNote("a", null).id));
    expect(ids.size).toBe(50);
  });
});

describe("toIso / toLocalInput", () => {
  it("пустая строка даёт null", () => {
    expect(toIso("")).toBeNull();
  });

  it("некорректная дата даёт null, а не Invalid Date", () => {
    expect(toIso("не дата")).toBeNull();
  });

  it("корректное локальное время конвертируется в ISO", () => {
    const iso = toIso("2026-03-15T09:30");
    expect(iso).not.toBeNull();
    expect(new Date(iso!).getFullYear()).toBe(2026);
    expect(new Date(iso!).getMonth()).toBe(2);
    expect(new Date(iso!).getDate()).toBe(15);
  });

  it("обратный разбор даёт формат для datetime-local", () => {
    expect(toLocalInput(null)).toBe("");
    expect(toLocalInput("мусор")).toBe("");
    expect(toLocalInput("2026-03-15T09:30:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe("toggleNote / deleteNote", () => {
  it("переключает выполнение", () => {
    const on = toggleNote([base], "n1");
    expect(on[0].done).toBe(true);
    expect(toggleNote(on, "n1")[0].done).toBe(false);
  });

  it("не трогает остальные заметки", () => {
    const two = [base, { ...base, id: "n2" }];
    expect(toggleNote(two, "n1")[1].done).toBe(false);
  });

  it("удаляет по id", () => {
    const two = [base, { ...base, id: "n2" }];
    expect(deleteNote(two, "n1").map((n) => n.id)).toEqual(["n2"]);
  });
});

describe("dueNotes", () => {
  const now = new Date("2026-01-15T10:00:00.000Z").getTime();

  it("берёт только наступившие и ненапомнённые", () => {
    const notes: HeaderNote[] = [
      { ...base, id: "past", remindAt: "2026-01-15T09:00:00.000Z" },
      { ...base, id: "future", remindAt: "2026-01-15T11:00:00.000Z" },
      { ...base, id: "notified", remindAt: "2026-01-15T09:30:00.000Z", notifiedAt: "2026-01-15T09:30:00.000Z" },
      { ...base, id: "done", remindAt: "2026-01-15T08:00:00.000Z", done: true },
      { ...base, id: "none", remindAt: null },
    ];
    expect(dueNotes(notes, now).map((n) => n.id)).toEqual(["past"]);
  });

  it("сортирует по времени напоминания", () => {
    const notes: HeaderNote[] = [
      { ...base, id: "late", remindAt: "2026-01-15T09:59:00.000Z" },
      { ...base, id: "early", remindAt: "2026-01-15T08:00:00.000Z" },
    ];
    expect(dueNotes(notes, now).map((n) => n.id)).toEqual(["early", "late"]);
  });
});

describe("pendingCount", () => {
  it("считает только будущие/наступившие ненапомнённые сроки", () => {
    const notes: HeaderNote[] = [
      base,
      { ...base, id: "a", notifiedAt: "2026-01-15T09:00:00.000Z" },
      { ...base, id: "b", done: true },
      { ...base, id: "c", remindAt: null },
    ];
    expect(pendingCount(notes)).toBe(1);
  });
});

describe("buildIcs", () => {
  it("валидная структура календаря с напоминанием за 15 минут", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT15M");
    expect(ics.split("\r\n").every((l) => l.length > 0)).toBe(true);
  });

  it("экранирует спецсимволы по RFC 5545", () => {
    const ics = buildIcs({ ...base, text: "Оплата 1,5 млн; акт\\подписать" });
    expect(ics).toContain("Оплата 1\\,5 млн\\; акт\\\\подписать");
  });

  it("без срока ставит начало по времени создания", () => {
    const ics = buildIcs({ ...base, remindAt: null });
    expect(ics).toContain(`DTSTART:${base.createdAt.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`);
  });
});

describe("лимиты", () => {
  it("NOTES_MAX положителен и разумный", () => {
    expect(NOTES_MAX).toBeGreaterThan(0);
    expect(NOTES_MAX).toBeLessThanOrEqual(1000);
  });
});