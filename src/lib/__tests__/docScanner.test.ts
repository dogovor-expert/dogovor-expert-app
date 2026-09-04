import { describe, expect, it } from "vitest";
import { getDocRequirements, getTemplateRoles } from "@/lib/docRequirements";
import {
  extractPassportData,
  extractVehicleData,
  applyPassportToRole,
  applyVehicleToTemplate,
} from "@/lib/docOcr";
import type { LegalTemplate, TemplateField } from "@/data/types";

const makeTemplate = (fields: TemplateField[]): LegalTemplate => ({
  id: "t",
  name: "Тест",
  category: "auto",
  actSource: "ГК РФ",
  lastUpdated: "2026-01-01",
  description: "",
  suggestedDocs: [],
  fields,
  previewTemplate: "{{seller_fio}}",
});

describe("getDocRequirements", () => {
  it("паспорт продавца и покупателя (разворот + прописка) для ДКП авто", () => {
    const t = makeTemplate([
      { id: "seller_fio", label: "ФИО", type: "text", category: "seller", defaultValue: "" },
      { id: "seller_passport_series", label: "Серия", type: "text", category: "seller", defaultValue: "" },
      { id: "seller_passport_number", label: "Номер", type: "text", category: "seller", defaultValue: "" },
      { id: "seller_address", label: "Адрес", type: "text", category: "seller", defaultValue: "" },
      { id: "buyer_fio", label: "ФИО", type: "text", category: "buyer", defaultValue: "" },
      { id: "buyer_passport", label: "Паспорт", type: "text", category: "buyer", defaultValue: "" },
      { id: "car_vin", label: "VIN", type: "text", category: "vehicle", defaultValue: "" },
      { id: "car_pts", label: "ПТС", type: "text", category: "vehicle", defaultValue: "" },
      { id: "car_sts", label: "СТС", type: "text", category: "vehicle", defaultValue: "" },
    ]);
    const slots = getDocRequirements(t);
    const labels = slots.map((s) => s.id);
    expect(labels).toContain("passport_seller_main");
    expect(labels).toContain("passport_seller_reg");
    expect(labels).toContain("passport_buyer_main");
    expect(labels).not.toContain("passport_buyer_reg");
    expect(labels).toContain("pts_front");
    expect(labels).toContain("pts_back");
    expect(labels).toContain("sts_front");
    expect(slots.find((s) => s.id === "passport_seller_main")?.rolePrefix).toBe("seller");
    expect(slots.find((s) => s.id === "passport_seller_main")?.ocrKind).toBe("passport");
  });

  it("без паспортных полей роли — слотов паспорта нет", () => {
    const t = makeTemplate([
      { id: "contract_price", label: "Цена", type: "number", category: "contract", defaultValue: "" },
    ]);
    expect(getDocRequirements(t)).toEqual([]);
  });

  it("ЭПТС вместо ПТС для нового авто", () => {
    const t = makeTemplate([
      { id: "seller_fio", label: "ФИО", type: "text", category: "seller", defaultValue: "" },
      { id: "seller_passport", label: "Паспорт", type: "text", category: "seller", defaultValue: "" },
      { id: "car_vin", label: "VIN", type: "text", category: "vehicle", defaultValue: "" },
      { id: "car_epts", label: "ЭПТС", type: "text", category: "vehicle", defaultValue: "" },
    ]);
    const ids = getDocRequirements(t).map((s) => s.id);
    expect(ids).toContain("epts");
    expect(ids).not.toContain("pts_front");
  });

  it("роли доверенности: owner + driver", () => {
    const t = makeTemplate([
      { id: "owner_fio", label: "ФИО", type: "text", category: "owner", defaultValue: "" },
      { id: "owner_passport", label: "Паспорт", type: "text", category: "owner", defaultValue: "" },
      { id: "owner_address", label: "Адрес", type: "text", category: "owner", defaultValue: "" },
      { id: "driver_fio", label: "ФИО", type: "text", category: "driver", defaultValue: "" },
      { id: "driver_passport", label: "Паспорт", type: "text", category: "driver", defaultValue: "" },
      { id: "car_vin", label: "VIN", type: "text", category: "vehicle", defaultValue: "" },
      { id: "car_sts", label: "СТС", type: "text", category: "vehicle", defaultValue: "" },
    ]);
    const roles = getTemplateRoles(t).map((r) => r.prefix);
    expect(roles).toEqual(expect.arrayContaining(["owner", "driver"]));
    const ids = getDocRequirements(t).map((s) => s.id);
    expect(ids).toContain("passport_owner_main");
    expect(ids).toContain("passport_owner_reg");
    expect(ids).toContain("passport_driver_main");
    expect(ids).toContain("vuc_driver");
  });
});

describe("extractPassportData", () => {
  const PASSPORT_TEXT = `
Паспорт
Российская Федерация
Иванов Иван Иванович
пол мужской
Дата рождения 15.03.1985
Место рождения гор. Москва
Выдан Отделом УФМС России по г. Москва 12.05.2010
Код подразделения 770-001
Серия 4510 № 123456
Зарегистрирован по адресу: г. Москва, ул. Ленина, д. 5, кв. 12
`;

  it("извлекает все ключевые поля паспорта", () => {
    const d = extractPassportData(PASSPORT_TEXT);
    expect(d.fio).toBe("Иванов Иван Иванович");
    expect(d.series).toBe("4510");
    expect(d.number).toBe("123456");
    expect(d.birthday).toBe("15.03.1985");
    expect(d.code).toBe("770-001");
    expect(d.issuedDate).toBe("12.05.2010");
    expect(d.address).toContain("ул. Ленина");
    expect(d.issuedBy).toContain("Отдел");
  });

  it("не путает короткие числа с серией", () => {
    const d = extractPassportData("Договор № 12 от 01.01.2026 г. Москва");
    expect(d.series).toBeUndefined();
    expect(d.number).toBeUndefined();
  });

  it("не подставляет случайное 12-значное как ИНН без маркера", () => {
    const d = extractPassportData(
      "Паспорт 4510 123456\nДата 01.01.2026\n123456789012 123456789013"
    );
    expect(d.inn).toBeUndefined();
  });

  it("подхватывает ИНН если маркер присутствует", () => {
    const d = extractPassportData(
      "Паспорт 4510 123456\nИНН 770123456789\nКод подразделения 770-001"
    );
    expect(d.inn).toBe("770123456789");
  });

  it("не подставляет серию 2+2+6 без контекста паспорта", () => {
    const d = extractPassportData(
      "Квитанция оплаты 1234 567890 от 01.01.2026\nСумма: 5000 руб."
    );
    expect(d.series).toBeUndefined();
    expect(d.number).toBeUndefined();
  });

  it("не подставляет код подразделения без маркера", () => {
    const d = extractPassportData(
      "Паспорт 4510 123456\nТелефон +7 903 123-456\nДата выдачи 01.01.2026"
    );
    expect(d.code).toBeUndefined();
  });
});

describe("extractVehicleData", () => {
  const PTS_TEXT = `
1. Марка, модель ТС: LADA GRANTA
2. Наименование (тип ТС): ЛЕГКОВОЙ
3. Категория ТС: B
4. Год выпуска: 2019
5. № двигателя: 21179 1234567
6. № шасси (рама): отсутствует
7. № кузова: XTA219010L1234567
8. Цвет: СЕРЕБРИСТЫЙ
Мощность двигателя 87 л.с. / 64 кВт
VIN XTA219010L1234567
Серия и № ПТС: 63 НУ 456789
Организация, выдавшая ПТС: АО «АВТОВАЗ»
Дата выдачи 12.05.2019
`;

  it("извлекает данные ПТС", () => {
    const d = extractVehicleData(PTS_TEXT);
    expect(d.vin).toBe("XTA219010L1234567");
    expect(d.brand).toContain("LADA");
    expect(d.year).toBe("2019");
    expect(d.engine).toContain("21179");
    expect(d.body).toContain("XTA219010L1234567");
    expect(d.color).toBe("СЕРЕБРИСТЫЙ");
    expect(d.powerHp).toBe("87");
    expect(d.powerKw).toBe("64");
    expect(d.ptsDate).toBe("12.05.2019");
  });

  it("извлекает номер ЭПТС (15 цифр)", () => {
    const d = extractVehicleData("Номер ЭПТС: 123456789012345, VIN XTA219010L1234567");
    expect(d.eptsNumber).toBe("123456789012345");
  });

  it("извлекает госномер и владельца из СТС", () => {
    const d = extractVehicleData(
      "Свидетельство о регистрации ТС 9912 345678, гос. номер А123ВС777, Владелец: Петров Пётр Петрович, VIN XTA219010L1234567"
    );
    expect(d.plate).toBe("А123ВС777");
    expect(d.ownerFio).toContain("Петров");
    expect(d.stsNumber).toBe("345678");
  });

  it("не подставляет ПТС-серии без контекста ПТС", () => {
    const d = extractVehicleData(
      "Квитанция 1234 567890 от 01.01.2026 VIN XTA219010L1234567"
    );
    expect(d.ptsSeries).toBeUndefined();
    expect(d.ptsNumber).toBeUndefined();
  });

  it("не подставляет ЭПТС без маркера при нескольких 15-значных", () => {
    const d = extractVehicleData(
      "Телефон 123456789012345Fax123456789012346 VIN XTA219010L1234567"
    );
    expect(d.eptsNumber).toBeUndefined();
  });

  it("подхватывает ЭПТС по маркеру даже среди чисел", () => {
    const d = extractVehicleData(
      "Телефон 123456789012345 ЭПТС 987654321098765 VIN XTA219010L1234567"
    );
    expect(d.eptsNumber).toBe("987654321098765");
  });
});

describe("applyPassportToRole", () => {
  const t = makeTemplate([
    { id: "seller_fio", label: "ФИО", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_passport_series", label: "Серия", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_passport_number", label: "Номер", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_passport_issued_by", label: "Кем выдан", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_passport_code", label: "Код", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_address", label: "Адрес", type: "text", category: "seller", defaultValue: "" },
  ]);

  it("заполняет поля именно роли seller", () => {
    const out = applyPassportToRole(t, "seller", {
      fio: "Иванов Иван Иванович",
      series: "4510",
      number: "123456",
      issuedBy: "УФМС",
      code: "770-001",
      address: "г. Москва, ул. Ленина, 5",
    });
    expect(out.seller_fio).toBe("Иванов Иван Иванович");
    expect(out.seller_passport_series).toBe("4510");
    expect(out.seller_passport_number).toBe("123456");
    expect(out.seller_passport_issued_by).toBe("УФМС");
    expect(out.seller_passport_code).toBe("770-001");
    expect(out.seller_address).toBe("г. Москва, ул. Ленина, 5");
    expect(out.buyer_fio).toBeUndefined();
  });

  it("составное поле паспорта собирается из серии и номера", () => {
    const t2 = makeTemplate([
      { id: "buyer_fio", label: "ФИО", type: "text", category: "buyer", defaultValue: "" },
      { id: "buyer_passport", label: "Паспорт", type: "text", category: "buyer", defaultValue: "" },
    ]);
    const out = applyPassportToRole(t2, "buyer", {
      fio: "Петров Пётр Петрович",
      series: "4509",
      number: "654321",
    });
    expect(out.buyer_passport).toBe("4509 654321");
  });
});

describe("applyVehicleToTemplate", () => {
  it("заполняет только существующие поля ТС", () => {
    const t = makeTemplate([
      { id: "car_vin", label: "VIN", type: "text", category: "vehicle", defaultValue: "" },
      { id: "car_pts", label: "ПТС", type: "text", category: "vehicle", defaultValue: "" },
    ]);
    const out = applyVehicleToTemplate(t, {
      vin: "XTA219010L1234567",
      ptsSeries: "63НУ",
      ptsNumber: "456789",
      plate: "А123ВС777",
    });
    expect(out.car_vin).toBe("XTA219010L1234567");
    expect(out.car_pts).toBe("63НУ 456789");
    expect(out.car_plate).toBeUndefined();
  });
});