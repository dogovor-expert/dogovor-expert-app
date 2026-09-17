import { describe, expect, it } from "vitest";
import { extractPassportData, extractVehicleData } from "@/lib/docOcr";

/**
 * Тесты извлечения полей — на РЕАЛЬНЫХ форматах OCR, а не на идеальном
 * размеченном тексте. Первый кейс — дословный вывод occular-OCR с синтетического
 * паспорта (6 строк, confidence 0.98–0.996): метка и значение в одной строке,
 * значения ЗАГЛАВНЫМИ. Именно на таком выводе прежняя версия теряла ФИО.
 */
describe("extractPassportData: форматы реального OCR", () => {
  const OCULAR_LABELED = [
    "ПАСПОРТ РОССИЙСКОЙ ФЕДЕРАЦИИ",
    "ФАМИЛИЯ: ИВАНОВ",
    "ИМЯ: ИВАН",
    "ОТЧЕСТВО: ИВАНОВИЧ",
    "Серия 4512 Номер 123456",
    "ИНН 7707083893 ОГРН 1027700132195",
  ].join("\n");

  it("собирает ФИО из размеченных строк (метка + значение)", () => {
    const d = extractPassportData(OCULAR_LABELED);
    expect(d.fio).toBe("Иванов Иван Иванович");
  });

  it("достаёт серию и номер из «Серия 4512 Номер 123456»", () => {
    const d = extractPassportData(OCULAR_LABELED);
    expect(d.series).toBe("4512");
    expect(d.number).toBe("123456");
  });

  it("не принимает шапку «Фамилия Имя Отчество» без значений за ФИО", () => {
    const d = extractPassportData("ФАМИЛИЯ\nИМЯ\nОТЧЕСТВО\nПАСПОРТ РФ");
    expect(d.fio).toBeUndefined();
  });

  it("нормализует ФИО, напечатанное ЗАГЛАВНЫМИ в одну строку", () => {
    const d = extractPassportData("ПАСПОРТ РОССИЙСКОЙ ФЕДЕРАЦИИ\nИВАНОВ ИВАН ИВАНОВИЧ");
    expect(d.fio).toBe("Иванов Иван Иванович");
  });

  it("сохраняет дефисную фамилию при нормализации регистра", () => {
    const d = extractPassportData("ПЕТРОВА-СМИРНОВА АННА ИВАНОВНА");
    expect(d.fio).toBe("Петрова-Смирнова Анна Ивановна");
  });

  it("берёт «голую» строку серии/номера при паспортном контексте", () => {
    const d = extractPassportData("ПАСПОРТ РОССИЙСКОЙ ФЕДЕРАЦИИ\n4512 123456");
    expect(d.series).toBe("4512");
    expect(d.number).toBe("123456");
  });

  it("не извлекает серию из квитанции без паспортного контекста", () => {
    const d = extractPassportData("Квитанция оплаты 1234 567890 от 01.01.2026\nСумма: 5000 руб.");
    expect(d.series).toBeUndefined();
    expect(d.number).toBeUndefined();
  });
});

describe("extractVehicleData: ПТС и СТС различаются контекстом", () => {
  const PTS = [
    "1. Марка, модель ТС: LADA GRANTA",
    "4. Год выпуска: 2019",
    "5. № двигателя: 21179 1234567",
    "6. № шасси (рама): отсутствует",
    "7. № кузова: XTA219010L1234567",
    "8. Цвет: СЕРЕБРИСТЫЙ",
    "Мощность двигателя, кВт: 64 / 87 л.с.",
    "VIN XTA219010L1234567",
    "Серия и № ПТС: 63 НУ 456789",
    "Дата выдачи 12.05.2019",
  ].join("\n");

  const STS = [
    "СВИДЕТЕЛЬСТВО О РЕГИСТРАЦИИ ТС",
    "Серия 77 12 345678",
    "VIN XTA219010L1234567",
    "Гос. номер А123ВС777",
    "Владелец: Петров Пётр Петрович",
  ].join("\n");

  it("ПТС: полный № двигателя (модель + номер), без потери префикса", () => {
    expect(extractVehicleData(PTS).engine).toBe("211791234567");
  });

  it("ПТС: мощность в кВт не попадает в № двигателя", () => {
    const d = extractVehicleData(PTS);
    expect(d.engine).not.toBe("64");
    expect(d.powerKw).toBe("64");
    expect(d.powerHp).toBe("87");
  });

  it("ПТС: «Марка, модель ТС» без остатка метки", () => {
    expect(extractVehicleData(PTS).brand).toBe("LADA GRANTA");
  });

  it("ПТС: полный номер кузова", () => {
    expect(extractVehicleData(PTS).body).toBe("XTA219010L1234567");
  });

  it("ПТС: серия с буквами, поля СТС не заполняются", () => {
    const d = extractVehicleData(PTS);
    expect(d.ptsSeries).toBe("63НУ");
    expect(d.ptsNumber).toBe("456789");
    expect(d.stsSeries).toBeUndefined();
    expect(d.stsNumber).toBeUndefined();
  });

  it("СТС: номер «77 12 345678» НЕ попадает в поля ПТС", () => {
    const d = extractVehicleData(STS);
    expect(d.stsSeries).toBe("77 12");
    expect(d.stsNumber).toBe("345678");
    expect(d.ptsSeries).toBeUndefined();
    expect(d.ptsNumber).toBeUndefined();
  });

  it("СТС: VIN, госномер и владелец", () => {
    const d = extractVehicleData(STS);
    expect(d.vin).toBe("XTA219010L1234567");
    expect(d.plate).toBe("А123ВС777");
    expect(d.ownerFio).toContain("Петров");
  });

  it("«отсутствует»/«не установлен» не становятся номером шасси/кузова", () => {
    const d = extractVehicleData("6. № шасси (рама): ОТСУТСТВУЕТ\n7. № кузова: НЕ УСТАНОВЛЕН");
    expect(d.chassis).toBeUndefined();
    expect(d.body).toBeUndefined();
  });
});
