import { it } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DOC_DESIGNS, type DesignId } from "@/lib/docDesign";
import { buildPdf } from "@/lib/exportPdf";
import { buildDocxDocument } from "@/lib/exportDocx";
import { Packer } from "docx";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";

const ROOT = join(process.cwd(), "public", "fonts");
const OUT = join(process.cwd(), "samples");

function fontBytes(design: DesignId) {
  const d = DOC_DESIGNS[design];
  const read = (p: string) => new Uint8Array(readFileSync(join(ROOT, p.replace("/fonts/", ""))));
  return {
    regular: read(d.fonts.regular),
    bold: read(d.fonts.bold),
    italic: read(d.fonts.italic),
    bolditalic: read(d.fonts.bolditalic),
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
  seller_fio: "Иванов Иван Иванович",
  seller_passport_series: "4512",
  seller_passport_number: "123456",
  seller_passport_issued_by: "ОВД района Хамовники г. Москвы",
  seller_passport_code: "770-001",
  seller_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
  seller_phone: "+7 900 000-00-01",
  buyer_fio: "Петров Петр Петрович",
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

it("генерация 12 образцов (3 стиля × 2 документа × 2 формата)", { timeout: 300000 }, async () => {
  mkdirSync(OUT, { recursive: true });
  const docs: { id: string; values: Record<string, string> }[] = [
    { id: "claim-rent", values: CLAIM_VALUES },
    { id: "dkp-auto", values: DKP_VALUES },
  ];
  const names: DesignId[] = ["classic", "minimal", "brand"];

  for (const doc of docs) {
    const html = htmlFor(doc.id, doc.values);
    for (const d of names) {
      const { blob, pageCount } = await buildPdf(html, {
        design: d,
        fonts: fontBytes(d),
        title: doc.id === "claim-rent" ? "Претензия" : "Договор купли-продажи",
      });
      const pdfPath = join(OUT, `${doc.id}-${d}.pdf`);
      writeFileSync(pdfPath, Buffer.from(await blob.arrayBuffer()));
      console.log(`SAMPLE ${doc.id}-${d}.pdf  pages=${pageCount}  size=${(await blob.arrayBuffer()).byteLength}`);

      const docx = await buildDocxDocument(html, { design: d });
      const buf = await Packer.toBuffer(docx);
      const docxPath = join(OUT, `${doc.id}-${d}.docx`);
      writeFileSync(docxPath, Buffer.from(buf));
      console.log(`SAMPLE ${doc.id}-${d}.docx  size=${buf.byteLength}`);
    }
  }
});
