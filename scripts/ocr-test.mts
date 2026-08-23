import { extractPassportData, extractVehicleData } from "../src/lib/docOcr.ts";

const idealPassport = `ПАСПОРТ
РОССИЙСКОЙ ФЕДЕРАЦИИ
Фамилия Иванов
Имя Иван
Отчество Иванович
Иванов Иван Иванович
Дата рождения 15.05.1985
Место рождения г. Москва
Серия 45 10 Номер 123456
Выдан ОВД района Хамовники г. Москвы
Дата выдачи 20.06.2015
Код подразделения 770-001
Зарегистрирован по адресу: г. Москва, ул. Ленина, д. 1, кв. 5
ИНН 123456789012
СНИЛС 123-456-789 01`;

const noisyPassport = `POCCИCKOЙ ФEДEPAЦИИ
ИBAHOB ИBAH ИBAHOBИЧ
15.05.1985
MOCKBA
4510 123456
OBД XAMOBHИKИ
20.06.2015
770-001
r. MOCKBA yn. Лeнинa д.1`;

const idealPts = `ПАСПОРТ ТРАНСПОРТНОГО СРЕДСТВА
Марка, модель: LADA VESTA
Идентификационный номер (VIN): XTA210B0JU0123456
Год выпуска: 2020
Двигатель: 21129
Шасси: отсутствует
Кузов: XTA210B0JU0123456
Цвет: БЕЛЫЙ
Мощность двигателя 106 л.с.
Серия 77 ЗС Номер 123456
Выдан ГИБДД г. Москвы
Дата 20.06.2020
Свидетельство о регистрации (СТС) 123456`;

const noisyPts = `ПACПOPT TPAHCП OPTHOГO CPEДCTBA
Марка, модель LADA VESTA
VIN XTA210B0JU0123456
Год выпуска 2020
Двuгameль 21129
Цвem БEЛЫЙ
77 3C 123456
ГИБДД
20.06.2020`;

const show = (name, data) => {
  console.log("=== " + name + " ===");
  console.log(JSON.stringify(data, null, 1));
  const filled = Object.entries(data).filter(([, v]) => v && String(v).trim()).length;
  console.log("FILLED_FIELDS: " + filled + "/" + Object.keys(data).length);
  console.log("");
};

show("PASSPORT ideal", extractPassportData(idealPassport));
show("PASSPORT noisy (OCR)", extractPassportData(noisyPassport));
show("PTS ideal", extractVehicleData(idealPts));
show("PTS noisy (OCR)", extractVehicleData(noisyPts));
