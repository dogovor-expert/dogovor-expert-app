import { describe, it, expect } from "vitest";
import { REGION_PM, FEDERAL_PM, findRegionPm, childPmForRegion } from "@/lib/legal/pm";
import { calcAlimonyFixed } from "@/lib/legal/calc";

describe("pm: справочник ПМ субъектов РФ (2026, СФР)", () => {
  it("содержит все 89+1 субъектов с положительными значениями", () => {
    expect(REGION_PM.length).toBeGreaterThanOrEqual(89);
    for (const r of REGION_PM) {
      expect(r.perCapita).toBeGreaterThan(0);
      expect(r.working).toBeGreaterThan(0);
      expect(r.child).toBeGreaterThan(0);
      expect(r.code).toMatch(/^\d{1,3}$/);
    }
  });

  it("нет дублей кодов и названий", () => {
    const codes = new Set(REGION_PM.map((r) => r.code));
    const names = new Set(REGION_PM.map((r) => r.name));
    expect(codes.size).toBe(REGION_PM.length);
    expect(names.size).toBe(REGION_PM.length);
  });

  it("контрольные значения: Москва и Чукотка", () => {
    expect(findRegionPm("77")?.child).toBe(21903);
    expect(findRegionPm("87")?.perCapita).toBe(49431);
  });
});

describe("childPmForRegion", () => {
  it("без региона — федеральная ПМ", () => {
    const r = childPmForRegion(null);
    expect(r.pm).toBe(FEDERAL_PM.child);
    expect(r.isFederal).toBe(true);
  });
  it("неизвестный код — федеральная ПМ", () => {
    expect(childPmForRegion("999")?.isFederal ?? true).toBe(true);
  });
  it("известный регион — региональный ПМ", () => {
    const r = childPmForRegion("50"); // Московская область
    expect(r.pm).toBe(19677);
    expect(r.isFederal).toBe(false);
  });
});

describe("calcAlimonyFixed (ст. 83, 117 СК РФ)", () => {
  it("1 ПМ на ребёнка в Москве", () => {
    const r = calcAlimonyFixed(21903, 1);
    expect(r.monthly).toBe(21903);
    expect(r.penalty).toBe(0);
  });
  it("0,5 ПМ — половина", () => {
    expect(calcAlimonyFixed(18371, 0.5).monthly).toBe(9185.5);
  });
  it("пени 0,5%/день от задолженности (ст. 115)", () => {
    const r = calcAlimonyFixed(10000, 1, 50000, 10);
    expect(r.penalty).toBe(2500);
  });
  it("некорректный ввод → нули", () => {
    expect(calcAlimonyFixed(0, 1).monthly).toBe(0);
    expect(calcAlimonyFixed(10000, 0).monthly).toBe(0);
    expect(calcAlimonyFixed(-1, 1).monthly).toBe(0);
  });
});
