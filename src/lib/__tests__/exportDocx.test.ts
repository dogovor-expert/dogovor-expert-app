import { describe, it, expect, vi } from "vitest";
import { Paragraph, Table } from "docx";
import { TEMPLATES_AUTO } from "@/data/templates/auto";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { parseHtmlToDocx, exportToDocx } from "@/lib/exportDocx";

const saved = vi.hoisted(() => ({ blob: null as Blob | null }));
vi.mock("file-saver", () => ({
  saveAs: (blob: Blob) => {
    saved.blob = blob;
  },
}));

const VALUES: Record<string, string> = {
  city: "Москва",
  date: "2026-08-14",
  copies_count: "3",
  seller_fio: "Иванов Иван Иванович",
  seller_passport_series: "4512",
  seller_passport_number: "123456",
  seller_passport_issued_by: "Отделом УФМС России по г. Москве",
  seller_passport_code: "770-001",
  seller_address: "г. Москва, ул. Тверская, д. 1, кв. 5",
  seller_phone: "+7 (900) 111-22-33",
  buyer_fio: "Петров Петр Петрович",
  buyer_passport_series: "4615",
  buyer_passport_number: "987654",
  buyer_passport_issued_by: "Отделом УФМС России по г. Москве",
  buyer_passport_code: "770-022",
  buyer_address: "г. Москва, ул. Арбат, д. 2, кв. 10",
  buyer_phone: "+7 (900) 444-55-66",
  car_brand: "Kia Rio",
  car_year: "2021",
  car_color: "Белый",
  car_vin: "Z94CB41BARR123456",
  car_plate: "А123ВС77",
  car_pts_type: "ПТС",
  car_pts: "77 УР 123456",
  car_sts: "9923 456789",
  car_engine: "G4FA A1234567",
  contract_price: "850000",
};

function dkpHtml(): string {
  const dkp = TEMPLATES_AUTO.find((t) => t.id === "dkp-auto");
  if (!dkp) throw new Error("dkp-auto not found");
  return renderTemplateDocument(dkp, VALUES, {
    previewTemplate: TEMPLATE_PREVIEWS[dkp.id],
  });
}

describe("parseHtmlToDocx", () => {
  it("разбирает документ на блоки, а не сливает в один абзац", () => {
    const elements = parseHtmlToDocx(dkpHtml());
    const paragraphs = elements.filter((e) => e instanceof Paragraph);
    expect(paragraphs.length).toBeGreaterThan(20);
    expect(paragraphs.some((p) => p instanceof Paragraph)).toBe(true);
  });

  it("сохраняет таблицу транспортного средства", () => {
    const elements = parseHtmlToDocx(dkpHtml());
    const tables = elements.filter((e) => e instanceof Table);
    expect(tables.length).toBeGreaterThanOrEqual(1);
  });

  it("выравнивает заголовок по центру", () => {
    const elements = parseHtmlToDocx(dkpHtml());
    const json = JSON.stringify(elements);
    expect(json).toContain("center");
  });

  it("применяет фирменный цвет заголовков", () => {
    const elements = parseHtmlToDocx(dkpHtml());
    expect(JSON.stringify(elements)).toContain("1A3C6C");
  });
});

describe("exportToDocx", () => {
  it("формирует валидный DOCX-файл (ZIP с OOXML)", async () => {
    const div = document.createElement("div");
    div.innerHTML = dkpHtml();
    await exportToDocx(div, "dkp-test");
    expect(saved.blob).toBeTruthy();
    const bytes = new Uint8Array(await saved.blob!.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(1000);
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
  });
});