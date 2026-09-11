import { describe, it, expect } from "vitest";
import { isWorkday, countWorkdays, shiftDeadline } from "@/lib/legal/prodkalendar";

function countYear(y: number): number {
  return countWorkdays(`${y}-01-01`, `${y}-12-31`);
}

describe("prodkalendar: официальные количества рабочих дней (5-дневка)", () => {
  it("2024 — 248 рабочих дней (консультант.ру: 366/248/118)", () => {
    expect(countYear(2024)).toBe(248);
  });
  it("2025 — 247 рабочих дней (консультант.ру)", () => {
    expect(countYear(2025)).toBe(247);
  });
  it("2026 — 247 рабочих дней (ПП 1466: 118 выходных)", () => {
    expect(countYear(2026)).toBe(247);
  });
});

describe("prodkalendar: праздники и переносы", () => {
  it("обычный сб/вс — выходной, пн-пт — рабочий", () => {
    expect(isWorkday("2026-09-11")).toBe(true); // пятница
    expect(isWorkday("2026-09-12")).toBe(false); // суббота
    expect(isWorkday("2026-09-13")).toBe(false); // воскресенье
  });
  it("2026: 9 января — выходной (перенос с 3 янв, ПП 1466)", () => {
    expect(isWorkday("2026-01-09")).toBe(false);
  });
  it("2026: 31 декабря — выходной (перенос с 4 янв, ПП 1466)", () => {
    expect(isWorkday("2026-12-31")).toBe(false);
  });
  it("2026: 11 мая — выходной (перенос 9 мая на пн по ч.2 ст.112)", () => {
    expect(isWorkday("2026-05-11")).toBe(false);
  });
  it("2025: 8 мая — выходной (перенос 23 фев, ПП 1335), 24 фев — рабочий", () => {
    expect(isWorkday("2025-05-08")).toBe(false);
    expect(isWorkday("2025-02-24")).toBe(true);
  });
  it("2024: 27 апреля — рабочая суббота (перенос на 29 апреля, ПП 1314)", () => {
    expect(isWorkday("2024-04-27")).toBe(true);
    expect(isWorkday("2024-04-29")).toBe(false);
    expect(isWorkday("2024-04-30")).toBe(false);
  });
  it("2025: 1 ноября — рабочая суббота (перенос на 3 ноября, ПП 1335)", () => {
    expect(isWorkday("2025-11-01")).toBe(true);
    expect(isWorkday("2025-11-03")).toBe(false);
  });
});

describe("prodkalendar: countWorkdays и ст. 193 ГК", () => {
  it("период включительно, with holidays", () => {
    // 1–11 января 2026 — все нерабочие (каникулы + переносы)
    expect(countWorkdays("2026-01-01", "2026-01-11")).toBe(0);
    // 12–16 января 2026: пн-пт, все рабочие (12 янв — понедельник)
    expect(countWorkdays("2026-01-12", "2026-01-16")).toBe(5);
  });
  it("from > to → 0", () => {
    expect(countWorkdays("2026-05-10", "2026-05-01")).toBe(0);
  });
  it("ст.193 ГК: последний день срока — выходной → следующий рабочий", () => {
    // 7 марта 2026 (вс) + праздник 8 марта (вс→пн 9) → срок сдвигается на 10.03 (вт)
    expect(shiftDeadline("2026-03-07")).toEqual({ date: "2026-03-10", shifted: true });
    expect(shiftDeadline("2026-03-10")).toEqual({ date: "2026-03-10", shifted: false });
    // 9 января 2026 (пт, перенесённый праздник) → 12 января (пн)
    expect(shiftDeadline("2026-01-09")).toEqual({ date: "2026-01-12", shifted: true });
  });
});
