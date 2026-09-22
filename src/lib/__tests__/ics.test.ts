import { describe, it, expect } from "vitest";

import {
  buildIcs,
  escapeIcsText,
  toIcsDate,
  nextDayIso,
  foldLines,
  isDeadlineField,
  type IcsEvent,
} from "../ics";

describe("toIcsDate", () => {
  it("переводит ISO дату в формат ICS", () => {
    expect(toIcsDate("2026-09-22")).toBe("20260922");
  });
  it("возвращает пустую строку для мусора", () => {
    expect(toIcsDate("22.09.2026")).toBe("");
    expect(toIcsDate("")).toBe("");
    expect(toIcsDate("abc")).toBe("");
  });
});

describe("nextDayIso", () => {
  it("считает следующий календарный день", () => {
    expect(nextDayIso("2026-09-22")).toBe("2026-09-23");
    expect(nextDayIso("2026-12-31")).toBe("2027-01-01");
    expect(nextDayIso("2028-02-28")).toBe("2028-02-29");
  });
  it("невалидное значение -> пусто", () => {
    expect(nextDayIso("")).toBe("");
  });
});

describe("escapeIcsText", () => {
  it("экранирует спецсимволы", () => {
    expect(escapeIcsText("a,b;c\\d")).toBe("a\\,b\\;c\\\\d");
    expect(escapeIcsText("Новая\nстрока")).toBe("Новая\\nстрока");
    expect(escapeIcsText("обычный текст")).toBe("обычный текст");
  });
});

describe("foldLines", () => {
  it("фолдит длинные строки с пробелом-продолжением", () => {
    const long = "X".repeat(200);
    const folded = foldLines(long);
    const lines = folded.split("\r\n");
    for (const l of lines) {
      expect(l.length).toBeLessThanOrEqual(75);
    }
    const rejoin = lines.map((l) => (l.startsWith(" ") ? l.slice(1) : l)).join("");
    expect(rejoin).toBe(long);
  });
});

describe("isDeadlineField", () => {
  it("определяет дедлайн-поля по имени", () => {
    expect(isDeadlineField("end_date")).toBe(true);
    expect(isDeadlineField("deadline")).toBe(true);
    expect(isDeadlineField("loan_term")).toBe(true);
    expect(isDeadlineField("valid_until")).toBe(true);
    expect(isDeadlineField("payment_date")).toBe(true);
  });
  it("не считает обычные поля дедлайнами", () => {
    expect(isDeadlineField("date")).toBe(false);
    expect(isDeadlineField("city")).toBe(false);
    expect(isDeadlineField("name")).toBe(false);
  });
});

describe("buildIcs", () => {
  const ev: IcsEvent = {
    uid: "test-1@dogovor.expert",
    summary: "Окончание аренды",
    start: "2026-10-01",
    alarmsMin: [1440, 2880],
    description: "Договор аренды №1",
  };

  it("собирает корректный VCALENDAR", () => {
    const ics = buildIcs({ events: [ev], name: "Мои напоминания" });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("METHOD:PUBLISH");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261001");
    expect(ics).toContain("DTEND;VALUE=DATE:20261002");
    expect(ics).toContain("SUMMARY:Окончание аренды");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT1440M");
    expect(ics).toContain("TRIGGER:-PT2880M");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("каждая строка не длиннее 75 символов (фолдинг)", () => {
    const longSummary = "Д".repeat(120);
    const ics = buildIcs({
      events: [{ ...ev, summary: longSummary, uid: "long@x" }],
    });
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it("одно событие без end — DTEND следующего дня", () => {
    const ics = buildIcs({
      events: [{ uid: "u@x", summary: "С", start: "2026-12-31" }],
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
  });
});