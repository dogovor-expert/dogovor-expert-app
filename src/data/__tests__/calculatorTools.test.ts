import { describe, it, expect } from "vitest";
import { CALCULATOR_TOOLS, calcToolBySlug, calcToolById } from "@/data/calculator-tools";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

/**
 * id инструментов в components/utils/UtilsTools.tsx и ключи
 * components/calculator/CalculatorRunner.tsx. Тест фиксирует инвариант:
 * SEO-страница /utils/[tool] должна вести к реально существующему калькулятору.
 */
const EXPECTED_IDS = [
  "docs",
  "nds",
  "fee",
  "395",
  "236",
  "zhkh",
  "alimony",
  "penalty",
  "index",
  "ipfees",
  "ndfl",
  "ndflsale",
  "usnnpd",
  "vacation",
  "transport",
  "pdd",
  "utilsb",
  "customs",
  "kasko",
  "valid",
  "words",
  "days",
  "recon",
];

const ICON_NAMES = [
  "Landmark",
  "Percent",
  "Scale",
  "Banknote",
  "Home",
  "Baby",
  "FileWarning",
  "TrendingUp",
  "Briefcase",
  "Wallet",
  "CarTaxiFront",
  "Store",
  "Plane",
  "Car",
  "CarFront",
  "Recycle",
  "Ship",
  "ShieldQuestion",
  "Fingerprint",
  "Hash",
  "CalendarDays",
  "FileSpreadsheet",
];

describe("каталог калькуляторов (SEO-страницы /utils/[tool])", () => {
  it("содержит все 23 инструмента с уникальными id и slug", () => {
    expect(CALCULATOR_TOOLS).toHaveLength(23);

    const ids = new Set(CALCULATOR_TOOLS.map((t) => t.id));
    const slugs = new Set(CALCULATOR_TOOLS.map((t) => t.slug));
    expect(ids.size).toBe(CALCULATOR_TOOLS.length);
    expect(slugs.size).toBe(CALCULATOR_TOOLS.length);
  });

  it("id совпадают с id в UtilsTools и ключами CalculatorRunner", () => {
    const ids = CALCULATOR_TOOLS.map((t) => t.id).sort();
    expect(ids).toEqual([...EXPECTED_IDS].sort());
  });

  it("slug в формате en-lower-hyphens", () => {
    for (const t of CALCULATOR_TOOLS) {
      expect(t.slug, t.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("iconName существует в маппинге ICONS страницы", () => {
    for (const t of CALCULATOR_TOOLS) {
      expect(ICON_NAMES, `иконка ${t.iconName} (${t.slug})`).toContain(t.iconName);
    }
  });

  it("title ≤ 70 симв., description 120–175 симв.", () => {
    for (const t of CALCULATOR_TOOLS) {
      expect(t.title.length, `${t.slug}: title ${t.title.length}`).toBeLessThanOrEqual(70);
      expect(t.description.length, `${t.slug}: desc ${t.description.length}`).toBeGreaterThanOrEqual(120);
      expect(t.description.length, `${t.slug}: desc ${t.description.length}`).toBeLessThanOrEqual(175);
    }
  });

  it("title / h1 / description уникальны глобально", () => {
    for (const key of ["title", "h1", "description"] as const) {
      const values = new Set(CALCULATOR_TOOLS.map((t) => t[key]));
      expect(values.size, key).toBe(CALCULATOR_TOOLS.length);
    }
  });

  it("обязательные блоки заполнены", () => {
    for (const t of CALCULATOR_TOOLS) {
      expect(t.keywords.length, t.slug).toBeGreaterThanOrEqual(4);
      expect(t.norms.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.formula.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.howTo, t.slug).toHaveLength(3);
      expect(t.faq.length, t.slug).toBeGreaterThanOrEqual(3);
      expect(t.seoText.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(t.intro.length, t.slug).toBeGreaterThanOrEqual(60);
      expect(t.short.length, t.slug).toBeGreaterThan(0);
      for (const s of t.howTo) {
        expect(s.title.length, `${t.slug}: howTo.title`).toBeGreaterThan(0);
        expect(s.text.length, `${t.slug}: howTo.text`).toBeGreaterThan(30);
      }
      for (const f of t.faq) {
        expect(f.q.length, `${t.slug}: faq.q`).toBeGreaterThan(10);
        expect(f.a.length, `${t.slug}: faq.a`).toBeGreaterThan(60);
      }
      for (const p of t.seoText) {
        expect(p.length, `${t.slug}: seoText`).toBeGreaterThan(120);
      }
    }
  });

  it("related ссылаются на существующие слаги и не содержат самоссылок", () => {
    for (const t of CALCULATOR_TOOLS) {
      expect(t.related.length, t.slug).toBeGreaterThanOrEqual(2);
      for (const slug of t.related) {
        expect(slug, `${t.slug} → ${slug}`).not.toBe(t.slug);
        expect(calcToolBySlug(slug), `${t.slug} → ${slug}`).toBeDefined();
      }
    }
  });

  it("ctaTemplateId ссылается на существующий шаблон LEGAL_TEMPLATES", () => {
    const templateIds = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    for (const t of CALCULATOR_TOOLS) {
      if (!t.ctaTemplateId) continue;
      expect(templateIds, `${t.slug} → ${t.ctaTemplateId}`).toContain(t.ctaTemplateId);
    }
  });

  it("calcToolBySlug / calcToolById находят инструменты", () => {
    expect(calcToolBySlug("nds")?.id).toBe("nds");
    expect(calcToolById("395")?.slug).toBe("395-gk");
    expect(calcToolBySlug("no-such-tool")).toBeUndefined();
    expect(calcToolById("no-such-id")).toBeUndefined();
  });
});
