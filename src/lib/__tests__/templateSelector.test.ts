import { describe, expect, it } from "vitest";
import { estimateMinutes } from "@/components/builder/TemplateSelector";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import { parseLastUpdated } from "@/lib/dates";

describe("template selector helpers", () => {
  it("estimateMinutes: минимум 3, ~12 полей в минуту", () => {
    expect(estimateMinutes(0)).toBe(3);
    expect(estimateMinutes(10)).toBe(3);
    expect(estimateMinutes(82)).toBe(7); // dkp-auto
    expect(estimateMinutes(120)).toBe(10);
  });

  it("все хиты существуют в каталоге", () => {
    const ids = new Set(TEMPLATE_META.map((t) => t.id));
    for (const id of POPULAR_TEMPLATE_IDS) {
      expect(ids.has(id), `хит ${id} отсутствует в TEMPLATE_META`).toBe(true);
    }
  });

  it("parseLastUpdated понимает формат каталога", () => {
    expect(parseLastUpdated("Апрель 2026")).toBe("2026-04-01");
    expect(parseLastUpdated("Январь 2026")).toBe("2026-01-01");
    expect(parseLastUpdated("")).toBeUndefined();
  });

  it("каталог не пуст и категории покрыты", () => {
    expect(TEMPLATE_META.length).toBeGreaterThan(300);
    const cats = new Set(TEMPLATE_META.map((t) => t.category));
    for (const c of ["auto", "realty", "business", "finance", "family", "legal", "migration", "postal", "other"]) {
      expect(cats.has(c), `пустая категория ${c}`).toBe(true);
    }
  });
});
