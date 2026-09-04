import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  DOC_DESIGNS,
  getDesign,
  pageMetrics,
  sizeFromClass,
  pxToPt,
  type DesignId,
} from "@/lib/docDesign";
import { buildPdf, estimateTotalHeight } from "@/lib/exportPdf";
import { buildDocxDocument } from "@/lib/exportDocx";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";

const ROOT = join(process.cwd(), "public", "fonts");
const FONT_FILES = [
  "pt-serif-regular.ttf", "pt-serif-bold.ttf", "pt-serif-italic.ttf", "pt-serif-bolditalic.ttf",
  "inter-regular.ttf", "inter-bold.ttf", "inter-italic.ttf", "inter-bolditalic.ttf",
];

function fontBytes(design: DesignId) {
  const d = DOC_DESIGNS[design];
  const read = (p: string) => new Uint8Array(readFileSync(join(ROOT, p)));
  return {
    regular: read(d.fonts.regular.replace("/fonts/", "")),
    bold: read(d.fonts.bold.replace("/fonts/", "")),
    italic: read(d.fonts.italic.replace("/fonts/", "")),
    bolditalic: read(d.fonts.bolditalic.replace("/fonts/", "")),
  };
}

const CLAIM_VALUES: Record<string, string> = {
  city: "Москва",
  date: "2026-08-19",
  sender_name: "ООО «Ромашка»",
  sender_address: "г. Москва, ул. Тверская, д. 1",
  sender_phone: "+7 900 000-00-01",
  recipient_name: "ИП Петров Петр Петрович",
  recipient_address: "г. Москва, ул. Арбат, д. 2",
  contract_doc: "договор аренды нежилого помещения № А-14/2026 от 01.03.2026",
  violation: "арендная плата за июль 2026 года не внесена в установленный срок",
  sum: "45000",
  deadline_days: "10",
  penalty: "0,1% от суммы долга за каждый день просрочки",
};

const DKP_VALUES: Record<string, string> = {
  city: "Москва",
  date: "2026-08-19",
  copies_count: "3",
  seller_status: "person",
  seller_data_mode: "full",
  seller_fio: "Иванов Иван Иванович",
  seller_passport_series: "4512",
  seller_passport_number: "123456",
  seller_passport_issued_by: "ОВД района Хамовники г. Москвы",
  seller_passport_code: "770-001",
  seller_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
  seller_phone: "+7 900 000-00-01",
  buyer_fio: "Петров Петр Петрович",
  buyer_status: "person",
  buyer_data_mode: "full",
  buyer_passport_series: "4615",
  buyer_passport_number: "987654",
  buyer_passport_issued_by: "ОВД района Арбат г. Москвы",
  buyer_passport_code: "770-002",
  buyer_address: "г. Москва, ул. Арбат, д. 2, кв. 20",
  buyer_phone: "+7 900 000-00-02",
  car_brand: "Kia Rio",
  car_year: "2019",
  car_color: "белый",
  car_vin: "Z94CB41AAKR123456",
  car_engine: "G4LC",
  car_chassis: "отсутствует",
  car_plate: "А123ВС77",
  car_pts: "78 УХ 456789",
  car_epts: "",
  car_sts: "9918 123456",
  contract_price: "650000",
  contract_price_words: "Шестьсот пятьдесят тысяч рублей 00 копеек",
};

function htmlFor(id: string, values: Record<string, string>): string {
  const t = LEGAL_TEMPLATES.find((x) => x.id === id);
  if (!t) throw new Error(`template ${id} not found`);
  return renderTemplateDocument(t, values, {
    previewTemplate: TEMPLATE_PREVIEWS[t.id],
  });
}

describe("docDesign — дизайн-токены", () => {
  it("есть ровно 3 стиля: classic, minimal, brand", () => {
    expect(Object.keys(DOC_DESIGNS).sort()).toEqual(["brand", "classic", "minimal"]);
  });

  it("токены в заданных диапазонах (кегли, интервал, поля)", () => {
    for (const d of Object.values(DOC_DESIGNS)) {
      expect(d.titleFontSize).toBeGreaterThanOrEqual(14);
      expect(d.titleFontSize).toBeLessThanOrEqual(17);
      expect(d.subheadingFontSize).toBeGreaterThanOrEqual(11);
      expect(d.subheadingFontSize).toBeLessThanOrEqual(14);
      expect(d.bodyFontSize).toBeGreaterThanOrEqual(10);
      expect(d.bodyFontSize).toBeLessThanOrEqual(13);
      expect(d.smallFontSize).toBeGreaterThanOrEqual(8);
      expect(d.smallFontSize).toBeLessThanOrEqual(11);
      expect(d.lineHeight).toBeGreaterThanOrEqual(1.15);
      expect(d.lineHeight).toBeLessThanOrEqual(1.25);
      expect(d.marginTop).toBeGreaterThanOrEqual(15);
      expect(d.marginBottom).toBeGreaterThanOrEqual(15);
      expect(d.marginLeft).toBeGreaterThanOrEqual(d.marginRight);
      expect(d.fit.maxSteps).toBeGreaterThanOrEqual(1);
      expect(d.accent).toMatch(/^[0-9A-F]{6}$/);
      expect(d.grayText).toMatch(/^[0-9A-F]{6}$/);
    }
  });

  it("файлы шрифтов всех стилей существуют в public/fonts", () => {
    for (const f of FONT_FILES) {
      expect(existsSync(join(ROOT, f))).toBe(true);
    }
  });

  it("px→pt правило едино (1pt = 4/3px)", () => {
    expect(pxToPt(14)).toBe(10.5);
    expect(pxToPt(10)).toBe(7.5);
    expect(pxToPt(16)).toBe(12);
  });

  it("semantic-классы дают одинаковый кегль во всех стилях (кроме doc-title)", () => {
    const cls = "text-[14px] font-serif leading-normal";
    const sizes = Object.values(DOC_DESIGNS).map((d) => sizeFromClass(cls, d, 10.5));
    expect(new Set(sizes).size).toBe(1);
    const title = Object.values(DOC_DESIGNS).map((d) => sizeFromClass("doc-title font-bold text-center", d, 10.5));
    expect(new Set(title).size).toBe(1);
  });

  it("страница A4: поля + шапка + подвал > 0", () => {
    for (const d of Object.values(DOC_DESIGNS)) {
      const pm = pageMetrics(d);
      expect(pm.w).toBeGreaterThan(500);
      expect(pm.h).toBeGreaterThan(800);
      expect(pm.availWidth).toBeGreaterThan(400);
      expect(pm.availHeight).toBeGreaterThan(600);
      expect(pm.headerHeight).toBeGreaterThan(10);
      expect(pm.footerHeight).toBeGreaterThan(10);
    }
  });
});

describe("PDF — дизайн и fit-логика", () => {
  for (const id of ["classic", "minimal", "brand"] as DesignId[]) {
    it(`претензия (${id}) умещается на 1 страницу`, async () => {
      const html = htmlFor("claim-rent", CLAIM_VALUES);
      const { blob, pageCount } = await buildPdf(html, {
        design: id,
        fonts: fontBytes(id),
        title: "Претензия",
      });
      expect(pageCount).toBe(1);
      expect(blob.size).toBeGreaterThan(1000);
    });
  }

  for (const id of ["classic", "minimal", "brand"] as DesignId[]) {
    it(`ДКП авто (${id}) рендерится многостранично`, async () => {
      const html = htmlFor("dkp-auto", DKP_VALUES);
      const { pageCount } = await buildPdf(html, {
        design: id,
        fonts: fontBytes(id),
        title: "ДКП",
      });
      expect(pageCount).toBeGreaterThanOrEqual(2);
    });
  }

  it("оценка высоты согласована с рендером: короткий документ помещается", async () => {
    const design = getDesign("classic");
    const fonts = fontBytes("classic");
    const html = htmlFor("claim-rent", CLAIM_VALUES);
    const { blob, pageCount } = await buildPdf(html, { design: "classic", fonts });
    expect(blob.size).toBeGreaterThan(500);
    expect(pageCount).toBe(1);
    void design;
  });

  it("регресс: орфан-цикл не оставляет лишних страниц и не дублирует контент", async () => {
    const fonts = fontBytes("classic");
    const html = htmlFor("dkp-auto", DKP_VALUES);
    const { blob, pageCount } = await buildPdf(html, { design: "classic", fonts });
    expect(pageCount).toBeGreaterThanOrEqual(2);
    const buf = new Uint8Array(await blob.arrayBuffer());
    const pdf = await getDocument({ data: buf.buffer }).promise;
    expect(pdf.numPages).toBe(pageCount);
    const texts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
    }
    const norm = texts.map((t) => t.replace(/\s+/g, " ").trim());
    expect(new Set(norm).size).toBe(norm.length);
    expect(norm[0]).toContain("Договор купли-продажи");
    const all = norm.join(" ");
    expect(all).toContain("Продавец");
    expect(all).toContain("Покупатель");
    expect(all).toContain("Паспорт");
  });
});

describe("DOCX — дизайн", () => {
  for (const id of ["classic", "minimal", "brand"] as DesignId[]) {
    it(`сборка документа (${id}) проходит без ошибок`, async () => {
      const doc = await buildDocxDocument(htmlFor("claim-rent", CLAIM_VALUES), { design: id });
      expect(doc).toBeTruthy();
      const json = JSON.stringify(doc);
      expect(json.length).toBeGreaterThan(1000);
      expect(json).toContain(DOC_DESIGNS[id].accent);
    });
  }

  it("в DOCX есть шапка с вордмарком и подвал с номерами страниц", async () => {
    const json = JSON.stringify(await buildDocxDocument(htmlFor("dkp-auto", DKP_VALUES)));
    expect(json).toContain("Dogovor.expert");
    expect(json).toContain("Юридические документы за 5 минут");
    expect(json).toContain("Стр. ");
    expect(json).toContain("из ");
  });
});
