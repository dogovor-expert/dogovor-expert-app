import { it } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DOC_DESIGNS } from "@/lib/docDesign";
import { buildPdf } from "@/lib/exportPdf";
import { buildDocxDocument } from "@/lib/exportDocx";
import { Packer } from "docx";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";

const ROOT = join(process.cwd(), "public", "fonts");
const OUT = join(process.cwd(), "samples", "10-docs");

function fontBytes() {
  const d = DOC_DESIGNS.classic;
  const read = (p: string) => new Uint8Array(readFileSync(join(ROOT, p.replace("/fonts/", ""))));
  return {
    regular: read(d.fonts.regular),
    bold: read(d.fonts.bold),
    italic: read(d.fonts.italic),
    bolditalic: read(d.fonts.bolditalic),
  };
}

const PASSPORT_S = "45 12 123456, выдан ОВД района Хамовники г. Москвы, 20.05.2012";
const PASSPORT_B = "46 15 987654, выдан ОВД района Арбат г. Москвы, 14.11.2014";

const DOCS: { id: string; title: string; values: Record<string, string> }[] = [
  {
    id: "dkp-auto",
    title: "Договор купли-продажи автомобиля (ДКП)",
    values: {
      city: "Москва", date: "2026-08-19", copies_count: "3",
      seller_status: "person", seller_data_mode: "full",
      seller_fio: "Иванов Иван Иванович", seller_birthday: "1975-04-12",
      seller_passport_series: "4512", seller_passport_number: "123456",
      seller_passport_issued_by: "ОВД района Хамовники г. Москвы", seller_passport_code: "770-001",
      seller_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
      seller_living_address_same: "true", seller_phone: "+7 900 000-00-01",
      buyer_status: "person", buyer_data_mode: "full",
      buyer_fio: "Петров Петр Петрович", buyer_birthday: "1980-09-23",
      buyer_passport_series: "4615", buyer_passport_number: "987654",
      buyer_passport_issued_by: "ОВД района Арбат г. Москвы", buyer_passport_code: "770-002",
      buyer_address: "г. Москва, ул. Арбат, д. 2, кв. 20", buyer_phone: "+7 900 000-00-02",
      car_brand: "Kia Rio", car_year: "2019", car_color: "белый",
      car_vin: "Z94CB41AAKR123456", car_engine: "G4LC", car_chassis: "отсутствует",
      car_plate: "А123ВС77", car_pts_type: "ПТС", car_pts: "78 УХ 456789",
      car_sts: "9918 123456", car_mileage: "45000",
      car_condition: "ok", car_encumbrance: "none",
      seller_marital_status: "marital", seller_spouse_fio: "Иванова Мария Ивановна",
      seller_spouse_consent: "true", car_history_guarantee: "yes",
      vat: "none", payment_order: "signing", payment_method: "cash",
      hidden_defects: "475", dispute_court: "defendant", claim_period: "10",
      contract_price: "650000", contract_price_words: "Шестьсот пятьдесят тысяч рублей 00 копеек",
    },
  },
  {
    id: "act-transfer-auto",
    title: "Акт приёма-передачи транспортного средства",
    values: {
      city: "Москва", date: "2026-08-19", dkp_date: "2026-08-19",
      seller_fio: "Иванов Иван Иванович", buyer_fio: "Петров Петр Петрович",
      car_brand: "Kia Rio", car_year: "2019", car_vin: "Z94CB41AAKR123456",
      car_plate: "А123ВС77", car_keys_qty: "2",
    },
  },
  {
    id: "raspiska-money",
    title: "Расписка в получении денежных средств",
    values: {
      city: "Москва", date: "2026-08-19",
      seller_fio: "Иванов Иван Иванович", seller_passport: PASSPORT_S,
      buyer_fio: "Петров Петр Петрович", buyer_passport: PASSPORT_B,
      car_brand: "Kia Rio", contract_price: "650000",
      contract_price_words: "Шестьсот пятьдесят тысяч рублей 00 копеек",
    },
  },
  {
    id: "raspiska-generic",
    title: "Расписка универсальная",
    values: {
      city: "Москва", date: "2026-08-19",
      recipient_fio: "Иванов Иван Иванович", recipient_passport: PASSPORT_S,
      sender_fio: "Петров Петр Петрович", sender_passport: PASSPORT_B,
      receipt_type: "Денежные средства", amount: "50000",
      amount_words: "Пятьдесят тысяч рублей 00 копеек",
      purpose: "передача займа по договору займа № 3 от 01.07.2026",
    },
  },
  {
    id: "dkp-flat",
    title: "ДКП квартиры",
    values: {
      city: "Москва", date: "2026-08-19",
      seller_fio: "Иванов Иван Иванович", seller_birthday: "1975-04-12",
      seller_passport_series: "4512", seller_passport_number: "123456",
      seller_passport_issued_by: "ОВД района Хамовники г. Москвы", seller_passport_date: "2012-05-20",
      seller_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
      buyer_fio: "Петров Петр Петрович", buyer_birthday: "1980-09-23",
      buyer_passport_series: "4615", buyer_passport_number: "987654",
      buyer_passport_issued_by: "ОВД района Арбат г. Москвы", buyer_passport_date: "2014-11-14",
      buyer_address: "г. Москва, ул. Арбат, д. 2, кв. 20",
      flat_address: "г. Москва, ул. Тверская, д. 1, кв. 42",
      flat_area: "54.3", flat_living_area: "38.2", flat_rooms: "2", flat_floor: "5",
      flat_cadastral_number: "77:01:0001234:567",
      flat_doc_basis: "договор купли-продажи от 15.03.2015",
      flat_encumbrances: "не зарегистрировано",
      contract_price: "9500000", contract_price_words: "Девять миллионов пятьсот тысяч рублей 00 копеек",
      payment_method: "банковский перевод",
      seller_has_spouse: "true", seller_spouse_fio: "Иванова Мария Ивановна",
    },
  },
  {
    id: "rental-flat",
    title: "Договор аренды квартиры",
    values: {
      city: "Москва", date: "2026-08-19",
      landlord_fio: "Смирнова Ольга Сергеевна",
      landlord_passport: "4507 334455, выдан ОВД района Пресненский г. Москвы, 11.03.2013",
      landlord_phone: "+7 925 111-22-33",
      tenant_fio: "Кузнецов Дмитрий Андреевич",
      tenant_passport: "4610 778899, выдан ОВД района Хамовники г. Москвы, 02.07.2015",
      tenant_phone: "+7 916 444-55-66",
      flat_address: "г. Москва, ул. Арбат, д. 5, кв. 12", flat_area: "46",
      lease_start: "2026-09-01", lease_end: "2027-08-31",
      rent_amount: "45000", deposit_amount: "45000",
      utilities_included: "true", utilities_amount: "3500", payment_day: "5",
    },
  },
  {
    id: "service-agreement",
    title: "Договор оказания услуг",
    values: {
      city: "Москва", date: "2026-08-19",
      executor_company: "ООО «Альфа-Сервис»", executor_inn: "7701234567",
      executor_address: "г. Москва, ул. Садовническая, д. 10, оф. 5",
      executor_director: "Соколов Андрей Викторович",
      customer_company: "ООО «Ромашка»", customer_inn: "7707654321",
      customer_address: "г. Москва, ул. Тверская, д. 1, оф. 3",
      customer_director: "Иванов Иван Иванович",
      service_description:
        "ежемесячное бухгалтерское и налоговое сопровождение деятельности заказчика: учёт операций, подготовка и сдача отчётности, расчёт заработной платы, консультации",
      contract_price: "60000",
      payment_terms: "100% предоплата до 5 числа текущего месяца",
      start_date: "2026-09-01", end_date: "2027-08-31",
    },
  },
  {
    id: "contract-works",
    title: "Договор подряда (строительные работы)",
    values: {
      city: "Москва", date: "2026-08-19",
      customer_fio: "Кузнецов Дмитрий Андреевич",
      customer_passport: "4610 778899, выдан ОВД района Хамовники г. Москвы, 02.07.2015",
      customer_address: "г. Москва, ул. Арбат, д. 5, кв. 12",
      contractor_company: "ООО «СтройГарант»", contractor_inn: "7712345678",
      contractor_director: "Соколов Андрей Викторович",
      work_description: "комплексный ремонт квартиры: демонтаж, электрика, сантехника, отделка стен и потолков, укладка напольных покрытий",
      work_address: "г. Москва, ул. Арбат, д. 5, кв. 12",
      contract_price: "850000",
      payment_terms: "предоплата 30%, остальное — по подписанным актам",
      start_date: "2026-09-01", end_date: "2026-12-01", warranty_period: "12",
    },
  },
  {
    id: "gift-money",
    title: "Договор дарения денежных средств",
    values: {
      city: "Москва", date: "2026-08-19",
      donor_status: "person", donor_name: "Иванов Иван Иванович", donor_inn: "770112345678",
      donor_passport: PASSPORT_S, donor_address: "г. Москва, ул. Тверская, д. 1, кв. 10",
      donor_phone: "+7 900 000-00-01",
      donee_status: "person", donee_name: "Иванова Мария Ивановна", donee_inn: "770198765432",
      donee_passport: "4509 556677, выдан ОВД района Хамовники г. Москвы, 03.03.2011",
      donee_address: "г. Москва, ул. Тверская, д. 1, кв. 10", donee_phone: "+7 900 000-00-03",
      gift_sum: "1000000", transfer_method: "банковский перевод",
      relation: "relative", purpose: "дар в связи с годовщиной брака",
    },
  },
  {
    id: "claim-rent",
    title: "Претензия по договору аренды",
    values: {
      city: "Москва", date: "2026-08-19",
      sender_name: "ООО «Ромашка»", sender_address: "г. Москва, ул. Тверская, д. 1",
      sender_phone: "+7 900 000-00-01",
      recipient_name: "ИП Петров Петр Петрович", recipient_address: "г. Москва, ул. Арбат, д. 2",
      contract_doc: "договор аренды нежилого помещения № А-14/2026 от 01.03.2026",
      violation: "арендная плата за июль 2026 года не внесена в установленный срок",
      sum: "45000", deadline_days: "10",
      penalty: "0,1% от суммы долга за каждый день просрочки",
    },
  },
];

it("генерация 10 образцов разных документов (classic, PDF+DOCX)", { timeout: 300000 }, async () => {
  mkdirSync(OUT, { recursive: true });
  const fonts = fontBytes();
  for (const doc of DOCS) {
    const t = LEGAL_TEMPLATES.find((x) => x.id === doc.id);
    if (!t) throw new Error(`template ${doc.id} not found`);
    const html = renderTemplateDocument(t, doc.values, {
      previewTemplate: TEMPLATE_PREVIEWS[t.id],
    });

    const { blob, pageCount } = await buildPdf(html, { design: "classic", fonts, title: doc.title });
    const pdfPath = join(OUT, `${doc.id}.pdf`);
    writeFileSync(pdfPath, Buffer.from(await blob.arrayBuffer()));
    console.log(`SAMPLE ${doc.id}.pdf  pages=${pageCount}  size=${(await blob.arrayBuffer()).byteLength}`);

    const docx = await buildDocxDocument(html, { design: "classic" });
    const buf = await Packer.toBuffer(docx);
    writeFileSync(join(OUT, `${doc.id}.docx`), Buffer.from(buf));
    console.log(`SAMPLE ${doc.id}.docx  size=${buf.byteLength}`);
  }
});