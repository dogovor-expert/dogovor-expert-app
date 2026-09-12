import { describe, it, expect } from "vitest";
import { ndflTax, usnTax, vacationPayWithBonuses } from "@/lib/legal/fin";
import {
  KOAP_CHAPTER_12,
  fineWithDiscount,
  discountDeadline,
} from "@/lib/legal/koap";
import {
  calc395WithPayments,
  calcZhkhPenalty,
  calcContractPenalty,
  calcSalaryDelayPeriods,
  courtFeeNonProperty,
  courtFeeAppeal,
  courtFeeCassation,
} from "@/lib/legal/calc";
import { isPassport, isInn, isSnils, isOgrn, isOgrnip, isKpp, isBik, isBankAccount, isDriverLicense } from "@/lib/legal/validators";

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

  it("управление лишённым прав (12.7 ч.2, 30 000 ₽) — скидка НЕ в исключениях ст. 32.2 ч.1.3, действует", () => {
    const f = KOAP_CHAPTER_12.find((x) => x.article === "12.7" && x.part === 2)!;
    expect(f.noDiscount).toBeUndefined();
    expect(fineWithDiscount(f)).toBe(Math.round(30000 * 0.75)); // 22500
  });

  it("повторная регистрация (12.1 ч.1.1) и алкоголь после ДТП (12.27 ч.3) — в исключениях, без скидки", () => {
    const f1 = KOAP_CHAPTER_12.find((x) => x.article === "12.1" && x.part === 1.1)!;
    const f3 = KOAP_CHAPTER_12.find((x) => x.article === "12.27" && x.part === 3)!;
    expect(f1).toBeDefined();
    expect(f3).toBeDefined();
    expect(fineWithDiscount(f1)).toBeNull();
    expect(fineWithDiscount(f3)).toBeNull();
  });

  it("срок скидки +30 дней с учётом длины месяца", () => {
    expect(discountDeadline("2025-01-01")).toBe("2025-01-31");
    expect(discountDeadline("2025-01-15")).toBe("2025-02-14");
    expect(discountDeadline("2025-02-01")).toBe("2025-03-03"); // февраль 28 дней
  });
});

describe("ЖКХ пени (ч. 14 ст. 155 ЖК РФ): ставка по дням + льготный период 2022–2026", () => {
  it("период внутри льготного окна: ставка ограничена min(9,5%, ставка на дату оплаты)", () => {
    // 100 000 ₽, 01.06–01.09.2024 (93 дня). Весь период в льготном окне → 9,5%.
    // 1/300 за 31–90 день (60 дн) + 1/130 за 91–93 день (3 дн) = 1900 + 219,23 = 2119,23
    const r = calcZhkhPenalty(100000, "2024-06-01", "2024-09-01");
    expect(r.days).toBe(93);
    expect(r.total).toBeCloseTo(2119.23, 1);
  });

  it("исторический период вне льготного окна считается по ставке того времени, а не сегодняшней", () => {
    // 100 000 ₽, 01.04–15.05.2021 (45 дней) → ставка 4,5% (до 26.07.2021).
    // 1/300 за 31–45 день (15 дн): 100000*4,5/100/300*15 = 225
    const r = calcZhkhPenalty(100000, "2021-04-01", "2021-05-15");
    expect(r.total).toBeCloseTo(225, 1);
  });
});

describe("Пени по договору (ст. 330 ГК): ключевая ставка по дням", () => {
  it("f300 считается по исторической ставке периода, а не по сегодняшней", () => {
    // 100 000 ₽, 30 дней с 01.06.2024 → ставка 16% (до 29.07.2024). 100000*16/100/300*30 = 1600
    const r = calcContractPenalty(100000, 0, "f300", 30, "2024-06-01");
    expect(r).toBeCloseTo(1600, 1);
  });
});

describe("Ст. 236 ТК: компенсация за задержку зарплаты (1/150, +1 день выплаты)", () => {
  it("включает день выплаты: 31 день по ставке 16%", () => {
    // 100 000 ₽, 01.01–31.01.2024 (31 день), ставка 16%. 100000*16/100/150*31 = 3306,67
    const r = calcSalaryDelayPeriods(100000, "2024-01-01", "2024-01-31");
    expect(r.days).toBe(31);
    expect(r.total).toBeCloseTo(3306.67, 1);
  });
});

describe("Госпошлины (ст. 333.19 НК РФ, ред. ФЗ № 259-ФЗ от 08.08.2024)", () => {
  it("неимущественный иск: физлицо 3000, организация 20000", () => {
    expect(courtFeeNonProperty()).toEqual({ child: 3000, org: 20000 });
  });
  it("апелляционная жалоба: фиксированная 3000/15000 (НЕ 50% от неимущественной)", () => {
    expect(courtFeeAppeal()).toEqual({ child: 3000, org: 15000 });
  });
  it("кассационная жалоба: фиксированная 5000/20000", () => {
    expect(courtFeeCassation()).toEqual({ child: 5000, org: 20000 });
  });
});

describe("isPassport: Приказ МВД № 605 (серия/номер/код/дата ≥14 лет)", () => {
  it("валидный паспорт 18-летнего", () => {
    const r = isPassport({ series: "4521", number: "123456", code: "770-001", issued: "2020-06-15", birthday: "2002-01-01" });
    expect(r.valid).toBe(true);
  });

  it("отрицает серию ≠ 4 цифр", () => {
    expect(isPassport({ series: "452", number: "123456" }).valid).toBe(false);
  });

  it("отрицает номер ≠ 6 цифр", () => {
    expect(isPassport({ series: "4521", number: "12345" }).valid).toBe(false);
  });

  it("отрицает код подразделения ≠ XXX-XXX", () => {
    expect(isPassport({ series: "4521", number: "123456", code: "7700" }).valid).toBe(false);
  });

  it("отрицает дату выдачи в будущем", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const fIso = future.toISOString().slice(0, 10);
    const r = isPassport({ series: "4521", number: "123456", issued: fIso });
    expect(r.valid).toBe(false);
  });

  it("отрицает выдачу ранее 14-летия", () => {
    const r = isPassport({ series: "4521", number: "123456", issued: "2015-06-15", birthday: "2010-01-01" });
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/14 лет/);
  });

  it("позволяет выдачу в день 14-летия включительно", () => {
    const r = isPassport({ series: "4521", number: "123456", issued: "2024-01-01", birthday: "2010-01-01" });
    expect(r.valid).toBe(true);
  });

  it("без birthday проверяет только формат и «не в будущем»", () => {
    const r = isPassport({ series: "4521", number: "123456", issued: "2010-06-15" });
    expect(r.valid).toBe(true);
  });

  it("схлопывает пробелы и дефисы в серии/номере", () => {
    const r = isPassport({ series: "45 21", number: "123-456" });
    expect(r.valid).toBe(true);
  });
});

describe("isDriverLicense: ВУ по Приказу МВД № 365 (серия 4 + номер 6)", () => {
  it("пластик «77 01 123456» — корректно", () => {
    expect(isDriverLicense("77 01 123456").valid).toBe(true);
  });
  it("сплошные 10 цифр — корректно", () => {
    expect(isDriverLicense("7701123456").valid).toBe(true);
  });
  it("дефисы схлопываются", () => {
    expect(isDriverLicense("77-01-123456").valid).toBe(true);
  });
  it("9 цифр — невалидно", () => {
    const r = isDriverLicense("770112345");
    expect(r.valid).toBe(false);
    expect(r.message).toContain("10");
  });
  it("11 цифр — невалидно", () => {
    expect(isDriverLicense("77011234567").valid).toBe(false);
  });
  it("серия 0000 — невалидно", () => {
    expect(isDriverLicense("0000123456").valid).toBe(false);
  });
  it("пустая строка — невалидно", () => {
    expect(isDriverLicense("").valid).toBe(false);
  });
  it("в сообщении — нормализованные серия/номер", () => {
    const r = isDriverLicense("9910 000123");
    expect(r.message).toContain("99 10");
    expect(r.message).toContain("000123");
  });
});

describe("validators: re-exports для регрессии", () => {
  it("isInn: 7707083893 (Сбер) — корректный", () => {
    expect(isInn("7707083893").valid).toBe(true);
  });
  it("isSnils: 112-233-445 95 — корректный", () => {
    expect(isSnils("112-233-445 95").valid).toBe(true);
  });
  it("isOgrn: 13 цифр с верной контрольной", () => {
    // 1027700132195 — КонсультантПлюс
    expect(isOgrn("1027700132195").valid).toBe(true);
  });
  it("isKpp: 770401001 — корректный", () => {
    expect(isKpp("770401001").valid).toBe(true);
  });
  it("isBik: 044525225 (Сбер) — корректный", () => {
    expect(isBik("044525225").valid).toBe(true);
  });
  it("isBankAccount: не 20 цифр — фейл", () => {
    expect(isBankAccount("12345", "044525225").valid).toBe(false);
  });
  it("isBankAccount: без БИК — фейл (для обычного счёта)", () => {
    const r = isBankAccount("40817810099910000000");
    expect(r.valid).toBe(false);
  });
  it("isBankAccount: казначейский счёт — пропускается без БИК", () => {
    expect(isBankAccount("40101810845250001001").valid).toBe(true);
  });
});

describe("vacationPayWithBonuses: премии по п.15 ПП №540", () => {
  it("полный период, годовая премия — включается полностью", () => {
    // 900000 оклад + 100000 годовая, 28 дней
    const r = vacationPayWithBonuses({ salary12: 900000, annualBonus: 100000 }, 28)!;
    // СДЗ = (900000+100000) / (29.3*12) = 1000000 / 351.6 = 2844.14
    expect(r.denominator).toBeCloseTo(351.6, 1);
    expect(r.bonusesIncluded).toBeCloseTo(100000, 2);
    expect(r.sdz).toBeCloseTo(2844.14, 1);
  });

  it("неполный период (9/12) — не-пропорциональные премии режутся", () => {
    const r = vacationPayWithBonuses({
      salary12: 675000, annualBonus: 100000, fullyWorkedMonths: 9, partialMonthDays: 0,
    }, 28)!;
    // workedFraction = 29.3*9 / 351.6 = 263.7/351.6 = 0.75
    expect(r.workedFraction).toBeCloseTo(0.75, 2);
    // годовая премия пропорционально: 100000*0.75 = 75000
    expect(r.bonusesIncluded).toBeCloseTo(75000, 0);
  });

  it("флаг «премии уже пропорциональны» — берём полностью", () => {
    const r = vacationPayWithBonuses({
      salary12: 675000, annualBonus: 75000, fullyWorkedMonths: 9, bonusesAlreadyProportional: true,
    }, 28)!;
    expect(r.bonusesIncluded).toBeCloseTo(75000, 0);
  });

  it("без премий = базовая формула 29.3", () => {
    const r = vacationPayWithBonuses({ salary12: 900000 }, 28)!;
    const s = 900000 / (29.3 * 12);
    expect(r.sdz).toBeCloseTo(Math.round(s * 100) / 100, 1);
  });

  it("нулевой знаменатель (0 месяцев) → null", () => {
    expect(vacationPayWithBonuses({ salary12: 100000, fullyWorkedMonths: 0 }, 28)).toBeNull();
  });
});
