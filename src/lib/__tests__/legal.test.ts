import { describe, it, expect } from "vitest";
import { ndflTax, usnTax } from "@/lib/legal/fin";
import {
  KOAP_CHAPTER_12,
  fineWithDiscount,
  discountDeadline,
} from "@/lib/legal/koap";
import { calc395WithPayments } from "@/lib/legal/calc";

describe("НДФЛ: стандартные вычеты на детей (ст. 218 НК)", () => {
  it("без детей — 13% с полной суммы", () => {
    expect(ndflTax(1_000_000, 0)).toEqual({ tax: 130_000, deductions: 0 });
  });

  it("2 ребёнка, доход в пределе 450 000 — вычет 1400+2800 за 12 мес", () => {
    // (1_000_000 - (1400+2800)*12) * 0.13 = 349_600 * 0.13 = 45_448
    expect(ndflTax(400_000, 2)).toEqual({ tax: 45_448, deductions: 4200 });
  });

  it("доход свыше 450 000 — вычет не применяется (фазаут)", () => {
    expect(ndflTax(500_000, 1)).toEqual({ tax: 65_000, deductions: 0 });
  });
});

describe("УСН: пороги НДС 2026 (20 / 272,5 / 490,5 млн)", () => {
  it("доход 10 млн — без НДС", () => {
    const r = usnTax(10_000_000, 0, "income");
    expect(r.tax).toBe(600_000);
    expect(r.vatStatus).toBe("no");
    expect(r.usnLost).toBe(false);
  });

  it("доход 100 млн — НДС 5%", () => {
    const r = usnTax(100_000_000, 0, "income");
    expect(r.vatStatus).toBe("rate5");
    expect(r.vatRate).toBe(5);
  });

  it("доход 300 млн — НДС 7%", () => {
    const r = usnTax(300_000_000, 0, "income");
    expect(r.vatStatus).toBe("rate7");
    expect(r.vatRate).toBe(7);
  });

  it("доход 600 млн — утрата права на УСН", () => {
    expect(usnTax(600_000_000, 0, "income").usnLost).toBe(true);
  });
});

describe("Ст. 395 ГК: проценты по ключевой ставке с платежами", () => {
  it("один период, ставка 20% (22.02–11.04.2022), 41 день", () => {
    // 1 000 000 * 20% * 41/365 = 22 465,75
    const r = calc395WithPayments(1_000_000, "2022-03-01", "2022-04-10", []);
    expect(r.total).toBe(22465.75);
    expect(r.remainingDebt).toBe(1_000_000);
  });

  it("частичная оплата уменьшает остаток и пересчитывает проценты", () => {
    const r = calc395WithPayments(1_000_000, "2022-03-01", "2022-04-10", [
      { date: "2022-03-21", amount: 500_000 },
    ]);
    expect(r.total).toBeCloseTo(16712.33, 1);
    expect(r.remainingDebt).toBe(500_000);
  });
});

describe("КоАП: скидка 50% при оплате в 20 дней", () => {
  it("обычное превышение скорости — скидка 75% от fineMax", () => {
    const f = KOAP_CHAPTER_12.find((x) => x.article === "12.9" && x.part === 3)!;
    expect(fineWithDiscount(f)).toBe(Math.round(1500 * 0.75)); // 1125
  });

  it("опьянение (12.8 ч.1) — скидка не применяется", () => {
    const f = KOAP_CHAPTER_12.find((x) => x.article === "12.8" && x.part === 1)!;
    expect(f.noDiscount).toBe(true);
    expect(fineWithDiscount(f)).toBeNull();
  });

  it("повторное нарушение (12.9 ч.6) — без скидки", () => {
    const f = KOAP_CHAPTER_12.find((x) => x.article === "12.9" && x.part === 6)!;
    expect(fineWithDiscount(f)).toBeNull();
  });

  it("срок скидки +30 дней с учётом длины месяца", () => {
    expect(discountDeadline("2025-01-01")).toBe("2025-01-31");
    expect(discountDeadline("2025-01-15")).toBe("2025-02-14");
    expect(discountDeadline("2025-02-01")).toBe("2025-03-03"); // февраль 28 дней
  });
});
