import { describe, it, expect } from "vitest";
import { calculateCosts, numberToWords } from "@/lib/calculator";

describe("calculateCosts", () => {
  it("до 3 лет владения: НДФЛ с суммы свыше 250 000", () => {
    const r = calculateCosts(950000, 1);
    const tax = r.items.find((i) => i.label.includes("НДФЛ"));
    expect(tax?.amount).toBe(91000);
    expect(r.total).toBe(93850);
  });

  it("от 3 лет владения: налог 0", () => {
    const r = calculateCosts(950000, 5);
    const tax = r.items.find((i) => i.label.includes("НДФЛ"));
    expect(tax?.amount).toBe(0);
    expect(r.total).toBe(2850);
  });

  it("без указания срока: налог pending", () => {
    const r = calculateCosts(950000);
    const tax = r.items.find((i) => i.label.includes("НДФЛ"));
    expect(tax?.pending).toBe(true);
    expect(r.total).toBe(2850);
  });

  it("всегда есть госпошлина 2850 и итог", () => {
    const r = calculateCosts(50000);
    expect(r.items[0].amount).toBe(2850);
    expect(r.items[r.items.length - 1]).toMatchObject({ type: "total", amount: r.total });
  });
});

describe("numberToWords", () => {
  it("ноль", () => {
    expect(numberToWords(0)).toBe("Ноль рублей");
  });

  it("тысячи в женском роде", () => {
    expect(numberToWords(1000)).toBe("одна тысяча рублей");
    expect(numberToWords(2000)).toBe("две тысячи рублей");
  });

  it("миллионы", () => {
    expect(numberToWords(1200000)).toBe("один миллион двести тысяч рублей");
  });

  it("хвостовые рубли согласуются", () => {
    expect(numberToWords(1000001)).toBe("один миллион один рубль");
    expect(numberToWords(1100005)).toBe("один миллион сто тысяч пять рублей");
  });
});
