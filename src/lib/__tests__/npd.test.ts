import { describe, expect, it } from "vitest";
import {
  NPD_MIN_DATE,
  buildNpdPayload,
  interpretNpdResponse,
  isNpdInn,
  normalizeNpdDate,
  todayMoscow,
} from "@/lib/npd";

describe("todayMoscow", () => {
  it("возвращает дату в формате YYYY-MM-DD", () => {
    expect(todayMoscow(new Date("2026-09-22T12:00:00Z"))).toBe("2026-09-22");
  });

  it("учитывает часовой пояс Москвы (UTC+3)", () => {
    // 21:30 UTC = 00:30 следующего дня по Москве.
    expect(todayMoscow(new Date("2026-09-22T21:30:00Z"))).toBe("2026-09-23");
  });
});

describe("normalizeNpdDate", () => {
  const now = new Date("2026-09-22T12:00:00Z");

  it("пустая дата → сегодня", () => {
    expect(normalizeNpdDate(undefined, now)).toBe("2026-09-22");
  });

  it("прошлая дата в диапазоне принимается", () => {
    expect(normalizeNpdDate("2020-01-15", now)).toBe("2020-01-15");
  });

  it("минимальная дата принимается", () => {
    expect(normalizeNpdDate(NPD_MIN_DATE, now)).toBe("2019-01-01");
  });

  it("дата раньше 01.01.2019 отклоняется", () => {
    expect(normalizeNpdDate("2018-12-31", now)).toBeNull();
  });

  it("будущая дата отклоняется", () => {
    expect(normalizeNpdDate("2026-09-23", now)).toBeNull();
  });

  it("несуществующая дата (31 февраля) отклоняется", () => {
    expect(normalizeNpdDate("2026-02-31", now)).toBeNull();
  });

  it("битый формат → подставляется сегодня", () => {
    expect(normalizeNpdDate("22.09.2026", now)).toBe("2026-09-22");
  });
});

describe("interpretNpdResponse", () => {
  it("200 + status:true → самозанятый", () => {
    const r = interpretNpdResponse(200, {
      status: true,
      message: "является плательщиком НПД",
    });
    expect(r.state).toBe("self-employed");
    expect(r.isSelfEmployed).toBe(true);
    expect(r.message).toContain("НПД");
  });

  it("200 + status:false → не самозанятый", () => {
    const r = interpretNpdResponse(200, {
      status: false,
      message: "не является плательщиком",
    });
    expect(r.state).toBe("not-self-employed");
    expect(r.isSelfEmployed).toBe(false);
  });

  it("422 validation.failed → invalid", () => {
    const r = interpretNpdResponse(422, {
      code: "validation.failed",
      message: "Указан некорректный ИНН",
    });
    expect(r.state).toBe("invalid");
    expect(r.message).toContain("ИНН");
  });

  it("422 limited → rate-limited", () => {
    expect(
      interpretNpdResponse(422, {
        code: "taxpayer.status.service.limited.error",
      }).state
    ).toBe("rate-limited");
  });

  it("422 unavailable → unavailable", () => {
    expect(
      interpretNpdResponse(422, {
        code: "taxpayer.status.service.unavailable.error",
      }).state
    ).toBe("unavailable");
  });

  it("500 / пустое тело → unavailable", () => {
    expect(interpretNpdResponse(500, null).state).toBe("unavailable");
    expect(interpretNpdResponse(200, {}).state).toBe("unavailable");
    expect(interpretNpdResponse(200, "мусор").state).toBe("unavailable");
  });
});

describe("buildNpdPayload", () => {
  it("формирует тело запроса к сервису ФНС", () => {
    expect(buildNpdPayload("500100732259", "2026-09-22")).toEqual({
      inn: "500100732259",
      requestDate: "2026-09-22",
    });
  });
});

describe("isNpdInn", () => {
  it("12 цифр с корректным контрольным числом → true", () => {
    expect(isNpdInn("500100732259")).toBe(true);
  });

  it("10 цифр (юрлицо) → false", () => {
    expect(isNpdInn("7707083893")).toBe(false);
  });

  it("12 цифр с битым контрольным числом → false", () => {
    expect(isNpdInn("500100732258")).toBe(false);
  });

  it("маска/разделители не мешают", () => {
    expect(isNpdInn("500 100 732 259")).toBe(true);
  });
});
