import { describe, it, expect } from "vitest";
import {
  ndflSaleCalc,
  CAR_DEDUCTION,
  REALTY_DEDUCTION,
  FAMILY_DEDUCTION_PER_CHILD,
  FREE_SALE_YEARS,
  FREE_SALE_YEARS_REALTY,
} from "@/lib/legal/ndflSale";

describe("ndflSaleCalc: иное имущество (3 года, 250 000)", () => {
  it("после 3+ лет — освобождение", () => {
    const r = ndflSaleCalc({ sellPrice: 1_000_000, buyPrice: 500_000, yearsOwned: 3 });
    expect(r.exempt).toBe(true);
    expect(r.exemptReason).toBe("ownership_term");
    expect(r.tax).toBe(0);
  });

  it("до 3 лет, 1 000 000 ₽ — нормативный вычет 250 000, налог 97 500", () => {
    // (1 000 000 - 250 000) * 0.13 = 97 500
    const r = ndflSaleCalc({ sellPrice: 1_000_000, buyPrice: null, yearsOwned: 1 });
    expect(r.exempt).toBe(false);
    expect(r.deductionType).toBe("fixed");
    expect(r.deductionUsed).toBe(CAR_DEDUCTION);
    expect(r.tax).toBe(97_500);
  });

  it("до 3 лет, фактические расходы > норматива — вычет по расходам", () => {
    // Купил за 800 000, продал за 1 000 000, 1 год.
    // (1 000 000 - 800 000) * 0.13 = 26 000
    const r = ndflSaleCalc({ sellPrice: 1_000_000, buyPrice: 800_000, yearsOwned: 1 });
    expect(r.deductionType).toBe("expenses");
    expect(r.deductionUsed).toBe(800_000);
    expect(r.tax).toBe(26_000);
  });

  it("до 3 лет, фактические расходы < норматива — нормативный вычет", () => {
    // Купил за 100 000, продал за 1 000 000, 1 год.
    // max(250 000, 100 000) → нормативный 250 000 → налог 97 500.
    const r = ndflSaleCalc({ sellPrice: 1_000_000, buyPrice: 100_000, yearsOwned: 1 });
    expect(r.deductionType).toBe("fixed");
    expect(r.tax).toBe(97_500);
  });
});

describe("ndflSaleCalc: недвижимость (5 лет, 1 000 000)", () => {
  it("5+ лет — освобождение", () => {
    const r = ndflSaleCalc({ sellPrice: 5_000_000, buyPrice: 3_000_000, yearsOwned: 5, assetType: "realty" });
    expect(r.exempt).toBe(true);
    expect(r.exemptReason).toBe("ownership_term");
  });

  it("4 года — не освобождено, нормативный 1 000 000", () => {
    // (5 000 000 - 1 000 000) = 4 000 000, по прогрессивной шкале 2025+:
    // 4 000 000 × 15% − 48 000 = 552 000
    const r = ndflSaleCalc({ sellPrice: 5_000_000, buyPrice: null, yearsOwned: 4, assetType: "realty" });
    expect(r.exempt).toBe(false);
    expect(r.deductionUsed).toBe(REALTY_DEDUCTION);
    expect(r.tax).toBe(552_000);
  });

  it("если кадастровая × 0.7 > цена — база по кадастровой (ст. 214.10 НК)", () => {
    // Цена договора 3 000 000, кадастровая 6 000 000 → база 6 000 000 × 0.7 = 4 200 000.
    // Вычет 1 000 000 → база 3 200 000 → по шкале 3 200 000 × 15% − 48 000 = 432 000.
    const r = ndflSaleCalc({
      sellPrice: 3_000_000,
      buyPrice: null,
      yearsOwned: 4,
      assetType: "realty",
      cadastralValue: 6_000_000,
    });
    expect(r.taxableBase).toBe(3_200_000);
    expect(r.tax).toBe(432_000);
    expect(r.notes?.some((n) => n.includes("кадастровой"))).toBe(true);
  });

  it("3 года владения НЕ освобождает недвижимость (общее правило)", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 3, assetType: "realty" });
    expect(r.exempt).toBe(false);
    expect(r.tax).toBeGreaterThan(0);
    expect(r.notes?.some((n) => n.includes(`${FREE_SALE_YEARS_REALTY} лет`))).toBe(true);
  });
});

describe("ndflSaleCalc: семья с 2+ детьми (п. 2.1 ст. 220 НК)", () => {
  it("2 ребёнка — вычет 2 000 000 ₽, срок не важен", () => {
    // Продал за 3 000 000, 1 год владения — без льготы было бы
    // (3 000 000 - 1 000 000) * 0.13 = 260 000. С льготой: 3 000 000 - 2 000 000 = 1 000 000 * 0.13 = 130 000.
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 1, childrenCount: 2 });
    expect(r.deductionType).toBe("family");
    expect(r.deductionUsed).toBe(2 * FAMILY_DEDUCTION_PER_CHILD);
    expect(r.tax).toBe(130_000);
  });

  it("1 ребёнок — льгота НЕ применяется", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 1, childrenCount: 1 });
    expect(r.deductionType).not.toBe("family");
    expect(r.deductionType).toBe("fixed");
  });

  it("льгота при 1 годе владения — срок не важен", () => {
    const r = ndflSaleCalc({ sellPrice: 5_000_000, buyPrice: null, yearsOwned: 0, childrenCount: 2, assetType: "realty" });
    expect(r.exempt).toBe(false);
    expect(r.deductionType).toBe("family");
  });

  it("вычет не превышает цену продажи", () => {
    const r = ndflSaleCalc({ sellPrice: 500_000, buyPrice: null, yearsOwned: 1, childrenCount: 3 });
    expect(r.deductionUsed).toBe(500_000);
    expect(r.tax).toBe(0);
  });
});

describe("ndflSaleCalc: обратная совместимость", () => {
  it("без assetType — иное имущество (3 года, 250 000)", () => {
    const r = ndflSaleCalc({ sellPrice: 1_000_000, buyPrice: null, yearsOwned: 1 });
    expect(r.fixedDeductionNorm).toBe(CAR_DEDUCTION);
    expect(r.deductionUsed).toBe(CAR_DEDUCTION);
  });

  it("FREE_SALE_YEARS экспортируется для обратной совместимости (= 3)", () => {
    expect(FREE_SALE_YEARS).toBe(3);
  });
});
