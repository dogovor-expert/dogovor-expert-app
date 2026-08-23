import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DOC_DESIGNS, getDesign, type DesignId } from "@/lib/docDesign";
import { buildPdf } from "@/lib/exportPdf";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { buildTemplateDefaults } from "@/lib/format";
import { getSigning } from "@/data/signingMeta";

const ROOT = join(process.cwd(), "public", "fonts");

function fontBytes(design: DesignId) {
  const d = getDesign(design);
  const read = (p: string) => new Uint8Array(readFileSync(join(ROOT, p.replace("/fonts/", ""))));
  return {
    regular: read(d.fonts.regular),
    bold: read(d.fonts.bold),
    italic: read(d.fonts.italic),
    bolditalic: read(d.fonts.bolditalic),
  };
}

/** Репрезентативная выборка: все классы подписания, категории и краевые случаи
 *  (доверенности, строгая форма, ЭДО, длинные поля, таблицы, стороны-блоки). */
const GOLDEN_IDS = [
  "dkp-auto",
  "dkp-moto",
  "rental-flat",
  "rental-auto",
  "invoice",
  "act-services",
  "upd",
  "service-agreement",
  "contract-personal",
  "court-power-of-attorney",
  "power-of-attorney-auto",
  "goods-power-of-attorney",
  "sign-power-of-attorney",
  "power-attorney-mail",
  "power-attorney-interests",
  "will",
  "marriage-contract",
  "spouse-consent-sell",
  "dogovor-zadatka",
  "raspiska-money",
  "claim-letter",
  "lawsuit-statement",
  "ddu-penalty-lawsuit",
  "nda-employee",
];

function valuesFor(id: string): Record<string, string> {
  const t = LEGAL_TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`template ${id} not found`);
  const values = buildTemplateDefaults(t);
  for (const f of t.fields) {
    if (!values[f.id] && f.validation?.required && f.type !== "checkbox") {
      if (f.type === "date") values[f.id] = "2026-08-21";
      else if (f.type === "number") values[f.id] = "1000";
      else values[f.id] = "Иванов Иван Иванович";
    }
  }
  return values;
}

describe("golden-render (аудит №8/№14)", () => {
  it("выборка покрывает ≥20 шаблонов и все классы подписания", () => {
    expect(GOLDEN_IDS.length).toBeGreaterThanOrEqual(20);
    const classes = new Set(GOLDEN_IDS.map((id) => getSigning(id).signingClass));
    expect([...classes].sort()).toEqual(["A", "B", "C", "D", "E"]);
  });

  for (const design of ["classic", "modern"] as DesignId[]) {
    it(`[${design}] HTML без незаполненных плейсхолдеров, PDF собирается, высота конечна`, async () => {
      for (const id of GOLDEN_IDS) {
        const t = LEGAL_TEMPLATES.find((x) => x.id === id)!;
        const html = renderTemplateDocument(t, valuesFor(id), {
          previewTemplate: TEMPLATE_PREVIEWS[t.id],
        });
        expect(html.includes("{{"), `${id}: не подставлен плейсхолдер`).toBe(false);
        expect(html.length, `${id}: пустой HTML`).toBeGreaterThan(200);

        const { blob, pageCount } = await buildPdf([html], {
          design,
          fonts: fontBytes(design),
          title: t.name,
          watermark: undefined,
        });
        expect(pageCount, `${id}: страниц должно быть ≥1`).toBeGreaterThanOrEqual(1);
        expect(blob.size, `${id}: пустой PDF`).toBeGreaterThan(1000);
      }
    }, 240000);
  }

  it("пагинация детерминирована (два прогона — одинаковое число страниц)", async () => {
    const t = LEGAL_TEMPLATES.find((x) => x.id === "dkp-auto")!;
    const html = renderTemplateDocument(t, valuesFor("dkp-auto"), {
      previewTemplate: TEMPLATE_PREVIEWS[t.id],
    });
    const a = await buildPdf([html], { design: "classic", fonts: fontBytes("classic") });
    const b = await buildPdf([html], { design: "classic", fonts: fontBytes("classic") });
    expect(a.pageCount).toBe(b.pageCount);
  });
});
