import { describe, it, expect } from "vitest";
import {
  ndflSaleCalc,
  CAR_DEDUCTION,
  REALTY_DEDUCTION,
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

describe("ndflSaleCalc: недвижимость, 3-летний срок (п. 3 ст. 217.1 НК)", () => {
  it("единственное жильё — 3 года достаточно", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 3, assetType: "realty", realtyThreeYearReason: "sole-home" });
    expect(r.exempt).toBe(true);
    expect(r.exemptReason).toBe("ownership_term");
  });

  it("наследство — 3 года достаточно", () => {
    const r = ndflSaleCalc({ sellPrice: 2_000_000, buyPrice: null, yearsOwned: 3, assetType: "realty", realtyThreeYearReason: "inheritance-or-relative" });
    expect(r.exempt).toBe(true);
  });

  it("без основания 3 года НЕ освобождает", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 3, assetType: "realty" });
    expect(r.exempt).toBe(false);
  });
});

describe("ndflSaleCalc: семья с 2+ детьми (п. 2.1 ст. 217.1 НК — полное освобождение жилья)", () => {
  it("жильё + 2 детей + покупка большего — освобождение, срок не важен", () => {
    const r = ndflSaleCalc({ sellPrice: 8_000_000, buyPrice: null, yearsOwned: 1, assetType: "realty", childrenCount: 2, familyBuyBiggerHome: true });
    expect(r.exempt).toBe(true);
    expect(r.exemptReason).toBe("family_with_children");
    expect(r.tax).toBe(0);
    expect(r.mustFile).toBe(false);
  });

  it("жильё + 2 детей без подтверждения переезда — НЕ освобождает, но даёт памятку", () => {
    const r = ndflSaleCalc({ sellPrice: 5_000_000, buyPrice: null, yearsOwned: 0, assetType: "realty", childrenCount: 2 });
    expect(r.exempt).toBe(false);
    expect(r.deductionType).toBe("fixed");
    expect(r.notes?.some((n) => n.includes("4 месяцев"))).toBe(true);
  });

  it("автомобиль + 2 детей — льгота не применяется (только жильё)", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 1, childrenCount: 2 });
    expect(r.deductionType).not.toBe("family");
    expect(r.deductionType).toBe("fixed");
    expect(r.notes?.some((n) => n.includes("только к продаже жилья"))).toBe(true);
  });

  it("1 ребёнок — льгота НЕ применяется", () => {
    const r = ndflSaleCalc({ sellPrice: 3_000_000, buyPrice: null, yearsOwned: 1, assetType: "realty", childrenCount: 1 });
    expect(r.deductionType).not.toBe("family");
    expect(r.deductionType).toBe("fixed");
  });

  it("вычет не превышает цену продажи и обнуляет декларацию", () => {
    const r = ndflSaleCalc({ sellPrice: 200_000, buyPrice: null, yearsOwned: 1 });
    expect(r.deductionUsed).toBe(200_000);
    expect(r.tax).toBe(0);
    expect(r.mustFile).toBe(false);
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
