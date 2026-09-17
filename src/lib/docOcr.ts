import type { LegalTemplate } from "@/data/types";
import type { DocSlot } from "@/lib/docRequirements";
import type {
  PassportData,
  VehicleData,
  PersonEntity,
  VehicleEntity,
  CompanyEntity,
  LicenseEntity,
} from "@/lib/entities";
import {
  toDigits,
  normalizeDate,
  normalizeVin,
  normalizePlate,
  latinToCyrillic as latinToCyr,
} from "@/lib/ocrPostprocess";
import { mapEntityToFields } from "@/lib/fieldMap";

export type { PassportData, VehicleData, PersonEntity, VehicleEntity, CompanyEntity, LicenseEntity } from "@/lib/entities";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Приводит ФИО/название к нормальному виду «Иванов Иван Иванович»:
 * документы печатают ФИО ЗАГЛАВНЫМИ, а в договор нужно в обычном регистре.
 * Дефисные фамилии сохраняются: «ПЕТРОВА-СМИРНОВА» → «Петрова-Смирнова».
 */
function normalizePersonCase(s: string): string {
  return clean(s)
    .toLowerCase()
    .replace(/(^|[\s.-])([а-яёa-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Значения вида «ОТСУТСТВУЕТ» / «НЕ УСТАНОВЛЕН» / «НЕТ» — это НЕ номер.
 * Такие поля (шасси, кузов, двигатель) должны оставаться пустыми.
 */
function isPlaceholderValue(s: string | undefined): boolean {
  if (!s) return true;
  return /^(отсутству|не\s*установлен|нет|бн|без\s*номера|не\s*предусмотрен)/i.test(clean(s));
}

/**
 * ФИО из «размеченного» паспорта РФ: значения идут отдельными строками с
 * метками (ФАМИЛИЯ/ИМЯ/ОТЧЕСТВО), часто ЗАГЛАВНЫМИ, в любом порядке и с
 * двоеточием или без. Так выглядит вывод и Tesseract, и occular на реальных
 * документах — раньше такой формат не распознавался вообще (ФИО терялось).
 */
function extractLabeledFio(text: string): string | undefined {
  const grab = (label: RegExp): string | undefined => {
    const m = text.match(new RegExp(`${label.source}[^\\nА-ЯЁа-яё]{0,6}([А-ЯЁа-яё][А-ЯЁа-яё-]{1,40})`, "i"));
    if (!m) return undefined;
    const value = clean(m[1]);
    // Отсекаем случай, когда «значением» оказалась другая метка
    // (например, в шапке «Фамилия Имя Отчество» без значений).
    if (/^(фамилия|имя|отчество)$/i.test(value)) return undefined;
    return value;
  };
  const surname = grab(/фамили[яи]/);
  // \b у JS не работает для кириллицы (ASCII-\w), поэтому границы слова
  // задаём вручную: «имя» не должно быть частью другого слова.
  const name = grab(/(?:^|[^а-яё])имя(?![а-яё])/);
  const patronymic = grab(/отчество/);
  if (surname && name) {
    const parts = [surname, name, patronymic].filter(Boolean) as string[];
    return normalizePersonCase(parts.join(" "));
  }
  return undefined;
}

// Нормализация латиница→кириллица для омоглифов (ИBAHOB → ИВАНОВ и т.п.).
// Применяется только в extractPassportData: паспорт — чисто кириллический
// документ, а VIN/ГРЗ в extractVehicleData остаются латиницей (не трогаем).
const latinToCyrillic = latinToCyr;

/**
 * Проверяет, что перед совпадением regex в пределах `window` символов
 * встречается хотя бы одно из ключевых слов (по регулярному выражению).
 * Предотвращает ложные срабатывания «голых» числовых паттернов.
 */
function hasContextBefore(
  text: string,
  matchIndex: number,
  keywords: RegExp,
  window = 60
): boolean {
  const start = Math.max(0, matchIndex - window);
  const before = text.slice(start, matchIndex);
  return keywords.test(before);
}

/**
 * Достаёт адрес регистрации из построчного текста: OCR часто разрывает
 * «Зарегистрирован по адресу:» и сам адрес на разные строки.
 */
function extractAddressLine(text: string): string | undefined {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const idx = lines.findIndex((l) =>
    /зарегистрирован|место жительства|по адресу|адресу/i.test(l)
  );
  if (idx < 0) return undefined;
  const cur = lines[idx];
  // Вариант 1: адрес в той же строке после маркера.
  const inline = cur.match(/(?:по адресу|адресу)[:\s]*(.{5,})/i);
  if (inline && inline[1].replace(/[^А-ЯЁа-яё0-9]/g, "").length >= 5) {
    return clean(inline[1]).replace(/^по адресу:?\s*/i, "");
  }
  // Вариант 2: адрес на следующей непустой строке.
  const next = lines[idx + 1];
  if (
    next &&
    next.replace(/[^А-ЯЁа-яё0-9]/g, "").length >= 5 &&
    !/^(паспорт|выдан|серия|код|дата)/i.test(next)
  ) {
    return next;
  }
  return undefined;
}

export function extractPassportData(text: string, isRegistration = false): PassportData {
  const data: PassportData = {};
  text = latinToCyrillic(text);

  // Страница регистрации паспорта содержит ТОЛЬКО адрес и штамп.
  // ФИО/серия/номер — дубли с главной страницы, их извлекать не нужно.
  if (isRegistration) {
    const addr = extractAddressLine(text);
    if (addr) data.address = addr;
    return data;
  }

  // ФИО. Приоритет — размеченный формат (ФАМИЛИЯ/ИМЯ/ОТЧЕСТВО отдельными
  // строками): именно так печатает паспорт РФ и так его отдают оба движка.
  // Если меток нет — ищем трёхсловную последовательность в одной строке
  // («Иванов Иван Иванович» / «ИВАНОВ ИВАН ИВАНОВИЧ»).
  const labeledFio = extractLabeledFio(text);
  if (labeledFio) {
    data.fio = labeledFio;
  } else {
    const fioStop = /паспорт|российск|федераци|гражданин|фамилия|имя|отчество|пол|загран|серия|номер|зарегистрирован|выдан|выдач|адресу|рождения|родился|место|подразделения|москва|россии|отделом|управления|внутренних|министерств|района|города|области|края|республик|кем|дата|код/i;
    const fioCands: string[] = [];
    for (const ln of text.split(/\n/)) {
      const ms = ln.match(
        /([А-ЯЁ][А-ЯЁа-яё-]+\s+[А-ЯЁ][А-ЯЁа-яё-]+\s+[А-ЯЁ][А-ЯЁа-яё-]+)/g
      );
      if (ms) fioCands.push(...ms);
    }
    const validFio = fioCands.filter((m) => !fioStop.test(m));
    if (validFio.length > 0) {
      const v = clean(validFio[0]);
      data.fio = v === v.toUpperCase() ? normalizePersonCase(v) : v;
    }
  }

  const issuedIdx = text.toLowerCase().indexOf("выдан");
  const after = issuedIdx >= 0 ? text.slice(issuedIdx) : text;
  const before = issuedIdx >= 0 ? text.slice(0, issuedIdx) : text;

  const birthdayMatch = before.match(/(\d{2}[.\-/]\d{2}[.\-/]\d{4})/);
  if (birthdayMatch) data.birthday = normalizeDate(birthdayMatch[1]) || undefined;

  const birthPlaceMatch = before.match(
    /(?:место рождения|родил[а-яё]*)[:\s]*([А-ЯЁа-яё0-9.,\- ]{5,60})/
  );
  if (birthPlaceMatch) data.birthPlace = clean(birthPlaceMatch[1]);

  const seriesMatch =
    text.match(/(?:серия)[^0-9]{0,12}?(\d{2})\s?(\d{2})/i) ||
    (() => {
      // Голая строка «4512 123456» или «45 12 123456» (без слова «Серия») —
      // так паспорт печатает номер под фотографией и в MRZ-зоне. Требуем
      // паспортный контекст рядом и не цифры по краям, чтобы не ловить
      // произвольные числа (суммы, телефоны, даты).
      const cands = [
        text.match(/(\d{2})\s?(\d{2})\s?(\d{6})/),
        text.match(/(\d{4})\s(\d{6})/),
      ];
      for (const m of cands) {
        if (!m) continue;
        const idx = m.index ?? 0;
        const before = text[idx - 1] ?? "";
        const after = text[idx + m[0].length] ?? "";
        if (/\d/.test(before) || /\d/.test(after)) continue;
        if (!hasContextBefore(text, idx, /паспорт|серия|№|федераци|гражданин|выдан|росси/i, 120)) continue;
        if (m.length === 3) {
          return [m[0], m[1].slice(0, 2), m[1].slice(2), m[2]] as unknown as RegExpMatchArray;
        }
        return m;
      }
      return null;
    })();
  if (seriesMatch) {
    data.series = `${seriesMatch[1]}${seriesMatch[2]}`;
    if (seriesMatch[3]) data.number = seriesMatch[3];
  }
  // № (U+2116) и латинское "No" — одно и то же в документах; OCR выдаёт оба варианта.
  const numberMatch = text.match(/(?:номер|№|No|N[oо0]|n)[^0-9]{0,8}?(\d{6})/i);
  if (numberMatch && !data.number) data.number = numberMatch[1];
  // Char-confusion: в серии/номере бывают кириллические омоглифы цифр.
  if (data.series) data.series = toDigits(data.series).slice(0, 4);
  if (data.number) data.number = toDigits(data.number).slice(0, 6);

  const issuedByMatch = after.match(
    /(?:кем выдан|выдан)[:\s]*([А-ЯЁа-яё0-9.,\- ]{5,120}?)(?=\d{2}\.\d{2}\.\d{4}|\d{3}\s*[-–—]\s*\d{3}|$)/i
  );
  if (issuedByMatch) data.issuedBy = clean(issuedByMatch[1]);
  if (!data.issuedBy) {
    const fb = text.match(
      /(?:ОВД|ГИБДД|УФМС|УПРАВЛЕНИ|ОТДЕЛ|ОМВД|МВД)[А-ЯЁа-яё0-9.,\- ]{2,90}/i
    );
    if (fb) data.issuedBy = clean(fb[0]);
  }

  const codeMatch = (() => {
    const m = text.match(/(\d{3}\s*[-–—]\s*\d{3})/);
    if (!m || !hasContextBefore(text, m.index ?? 0, /подразделени/i, 50)) return null;
    return m;
  })();
  if (codeMatch) data.code = codeMatch[1].replace(/\s+/g, "");

  const issuedDateMatch = after.match(/(\d{2}[.\-/]\d{2}[.\-/]\d{4})/);
  if (issuedDateMatch) data.issuedDate = normalizeDate(issuedDateMatch[1]) || undefined;

  const addressMatch = text.match(
    /(?:зарегистрирован[а-яё]*|место жительства)[^]*?(?:по адресу:?\s*|:?\s*)([^\n]{5,180})/i
  );
  const addressFromMatch = addressMatch ? extractAddressLine(text) : undefined;
  if (addressFromMatch) {
    data.address = addressFromMatch;
  }

  const innMatch = text.match(/(?:инн)[:\s]{0,5}(\d{12})/i)
    || (() => {
      // Fallback: если в тексте ровно одна 12-значная последовательность
      // и нет явного маркера «ИНН», считаем её ИНН.
      const all12 = [...text.matchAll(/\b(\d{12})\b/g)];
      if (all12.length === 1) return all12[0];
      return null;
    })();
  if (innMatch) data.inn = innMatch[1];
  const snilsMatch = text.match(/\b(\d{3}-\d{3}-\d{3} \d{2})\b/);
  if (snilsMatch) data.snils = snilsMatch[1];

  return data;
}

export function extractVehicleData(text: string): VehicleData {
  const data: VehicleData = {};

  const vinMatch = text.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
  if (vinMatch) data.vin = normalizeVin(vinMatch[1]) ?? vinMatch[1].toUpperCase();

  const plateMatch = text.match(
    /([А-ЯЁA-Z]\d{3}[А-ЯЁA-Z]{2}\d{2,3})/
  );
  if (plateMatch) data.plate = normalizePlate(plateMatch[1]) ?? plateMatch[1].toUpperCase();

  const brandMatch = text.match(
    /(?:марка,\s*модель|марка|модель)(?:\s*тс)?[^:\n]{0,8}[:=\s]*([^\n]{3,60})/i
  );
  if (brandMatch) {
    // Снимаем возможный остаток метки: «ТС: LADA GRANTA» → «LADA GRANTA».
    data.brand = clean(brandMatch[1]).replace(/^(?:тс|ts)\s*[:-]?\s*/i, "");
  }

  const yearMatch = text.match(
    /(?:год выпуска|выпуска|год изготовления|изготовления)[:\s]*(\d{4})/i
  );
  if (yearMatch) data.year = yearMatch[1];

  // Номер двигателя — ВСЯ последовательность (модель + номер): раньше
  // терялся префикс («21179 1234567» → «21179»). Общий вариант «двигателя»
  // требуем с двоеточием, значением — не короче 5 символов и не строку про
  // мощность («Мощность двигателя, кВт: 64»), иначе получали ложное «64».
  // Значение «отсутствует» не пишем.
  const engineMatch =
    text.match(/№\s*двигателя[^:\n]{0,8}[:=\s]*([A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 ]{2,30})/i) ||
    (() => {
      const m = text.match(/двигател[ья][^:\n]{0,8}[:=]\s*([A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 ]{4,30})/i);
      if (!m) return null;
      const idx = m.index ?? 0;
      if (/мощност/i.test(text.slice(Math.max(0, idx - 20), idx))) return null;
      return m;
    })();
  const engine = engineMatch ? clean(engineMatch[1]).replace(/\s+/g, "").toUpperCase() : undefined;
  if (!isPlaceholderValue(engine)) data.engine = engine;

  const chassisMatch = text.match(
    /(?:шасси|рама)[^:\n]{0,8}[:=\s]*([A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 ]{2,30})/i
  );
  const chassis = chassisMatch ? clean(chassisMatch[1]).replace(/\s+/g, "").toUpperCase() : undefined;
  if (!isPlaceholderValue(chassis)) data.chassis = chassis;

  const bodyMatch = text.match(
    /(?:кузова|кузов)[^:\n]{0,8}[:=\s]*([A-ZА-ЯЁ0-9][A-ZА-ЯЁ0-9 ]{2,30})/i
  );
  const body = bodyMatch ? clean(bodyMatch[1]).replace(/\s+/g, "").toUpperCase() : undefined;
  if (!isPlaceholderValue(body)) data.body = body;

  const colorMatch = text.match(
    /(?:цвет)[:\s]*([а-яёА-ЯЁa-zA-Z -]{3,20})/i
  );
  if (colorMatch) data.color = clean(latinToCyrillic(colorMatch[1]));

  // Мощность: в ПТС/СТС встречаются оба порядка записи — «64 кВт» и
  // «Мощность двигателя, кВт: 64». Раньше парсился только первый.
  const powerKwMatch =
    text.match(/(\d{2,4}(?:\.\d+)?)\s*(?:квт|kw)/i) ||
    text.match(/(?:квт|kw)\s*[:=]?\s*(\d{2,4}(?:\.\d+)?)/i);
  if (powerKwMatch) data.powerKw = powerKwMatch[1];

  const powerHpMatch =
    text.match(/(\d{2,4})\s*(?:л\.?\s*с\.?|лс)/i) ||
    text.match(/(?:л\.?\s*с\.?|лс)\s*[:=]?\s*(\d{2,4})/i);
  if (powerHpMatch) data.powerHp = powerHpMatch[1];

  // ПТС и СТС различаются форматом серии:
  //   ПТС — 2 цифры + 2 БУКВЫ + 6 цифр («63 НУ 456789»);
  //   СТС — 2 цифры + 2 цифры + 6 цифр («77 12 345678»).
  // Раньше обе формы присваивались полям ПТС сразу, из-за чего номер СТС
  // попадал в ПТС (ложное срабатывание). Теперь вид номера решает КОНТЕКСТ.
  const ptsMarker = /птс|птр|паспорт\s*транспортн/i;
  const stsMarker = /свидетельств|стс|регистрац/i;

  const ptsWithLetters = text.match(/(\d{2})\s*([А-ЯЁ]{2})\s*(\d{6})/i);
  if (ptsWithLetters) {
    data.ptsSeries = `${ptsWithLetters[1]}${ptsWithLetters[2].toUpperCase()}`;
    data.ptsNumber = ptsWithLetters[3];
  } else {
    const digitsSeries = text.match(/(\d{2})\s?(\d{2})\s?(\d{6})/);
    if (digitsSeries) {
      const idx = digitsSeries.index ?? 0;
      const ctx = text.slice(Math.max(0, idx - 60), idx);
      if (ptsMarker.test(ctx)) {
        data.ptsSeries = `${digitsSeries[1]} ${digitsSeries[2]}`;
        data.ptsNumber = digitsSeries[3];
      } else if (stsMarker.test(ctx)) {
        data.stsSeries = `${digitsSeries[1]} ${digitsSeries[2]}`;
        data.stsNumber = digitsSeries[3];
      }
    }
  }

  const eptsMatch = text.match(/(?:эптс|номер эптс)[:\s]*(\d{15})/i)
    || (() => {
      // Fallback: единственная 15-значная последовательность в тексте.
      const all15 = [...text.matchAll(/\b(\d{15})\b/g)];
      if (all15.length === 1) return all15[0];
      return null;
    })();
  if (eptsMatch) data.eptsNumber = eptsMatch[1];

  // СТС: номер обычно разобран выше (формат «77 12 345678»). Если не найден —
  // берём 6 цифр после слова «Свидетельство». Буквенной эвристики для серии
  // СТС больше нет: серия СТС — цифры, а прежний фолбэк давал мусор («НУ»).
  if (!data.stsNumber) {
    const stsNumberMatch = text.match(/(?:свидетельство|СТС)[^\n]{0,40}?(\d{6})/i);
    if (stsNumberMatch) data.stsNumber = stsNumberMatch[1];
  }

  const ownerFioMatch = text.match(
    /(?:владелец|собственник)[:\s]*([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+)?)/i
  );
  if (ownerFioMatch) data.ownerFio = ownerFioMatch[1].trim();

  const issuedByMatch = text.match(
    /(?:кем выдан|выдан|выдано)[:\s]*([А-ЯЁа-яё0-9.,\- ]{5,100}?)(?=\d{2}\.\d{2}\.\d{4}|$)/i
  );
  if (issuedByMatch) data.ptsIssuedBy = clean(issuedByMatch[1]);

  const dateMatch = text.match(/(\d{2}[.\-/]\d{2}[.\-/]\d{4})/g);
  if (dateMatch) data.ptsDate = normalizeDate(dateMatch[dateMatch.length - 1]) || undefined;

  return data;
}

const findField = (
  template: LegalTemplate,
  candidates: string[]
): string | null =>
  candidates.find((id) => template.fields.some((f) => f.id === id)) || null;

function setValue(
  template: LegalTemplate,
  out: Record<string, string>,
  fieldId: string | null,
  value: string | undefined
) {
  if (fieldId && value && value.trim()) out[fieldId] = value.trim();
}

export function applyPassportToRole(
  template: LegalTemplate,
  prefix: string,
  data: PassportData
): Record<string, string> {
  const out: Record<string, string> = {};

  const combined = findField(template, [`${prefix}_passport`]);
  const seriesField = findField(template, [
    `${prefix}_passport_series`,
    `${prefix}_passport_seria`,
    `${prefix}_passport_ser`,
  ]);
  const numberField = findField(template, [
    `${prefix}_passport_number`,
    `${prefix}_passport_num`,
    `${prefix}_passport_no`,
  ]);

  if (combined) {
    setValue(
      template,
      out,
      combined,
      [data.series, data.number].filter(Boolean).join(" ")
    );
  } else {
    setValue(template, out, seriesField, data.series);
    setValue(template, out, numberField, data.number);
  }

  setValue(template, out, findField(template, [`${prefix}_fio`, `${prefix}_full_name`, `${prefix}_name`]), data.fio);
  setValue(template, out, findField(template, [`${prefix}_birthday`, `${prefix}_birth_date`, `${prefix}_birthdate`]), data.birthday);
  setValue(template, out, findField(template, [`${prefix}_birth_place`, `${prefix}_birthplace`]), data.birthPlace);
  setValue(template, out, findField(template, [`${prefix}_passport_issued_by`, `${prefix}_passport_by`, `${prefix}_passport_issued`]), data.issuedBy);
  setValue(template, out, findField(template, [`${prefix}_passport_date`, `${prefix}_passport_issued_date`, `${prefix}_passport_issue_date`]), data.issuedDate);
  setValue(template, out, findField(template, [`${prefix}_passport_code`]), data.code);
  setValue(template, out, findField(template, [`${prefix}_address`, `${prefix}_addr`, `${prefix}_registration`, `${prefix}_living_address`]), data.address);
  setValue(template, out, findField(template, [`${prefix}_inn`]), data.inn);
  setValue(template, out, findField(template, [`${prefix}_snils`]), data.snils);

  return out;
}

export function applyVehicleToTemplate(
  template: LegalTemplate,
  data: VehicleData
): Record<string, string> {
  const out: Record<string, string> = {};

  setValue(template, out, findField(template, ["car_vin", "vehicle_vin", "trailer_vin", "boat_vin"]), data.vin);
  setValue(template, out, findField(template, ["car_plate", "car_grz", "vehicle_plate"]), data.plate);
  setValue(template, out, findField(template, ["car_brand", "vehicle_brand", "trailer_brand", "car_make"]), data.brand);
  setValue(template, out, findField(template, ["car_year", "vehicle_year", "trailer_year"]), data.year);
  setValue(template, out, findField(template, ["car_engine", "car_engine_number"]), data.engine);
  setValue(template, out, findField(template, ["car_chassis", "car_chassis_number"]), data.chassis);
  setValue(template, out, findField(template, ["car_body", "car_body_number"]), data.body);
  setValue(template, out, findField(template, ["car_color", "car_colour"]), data.color);
  setValue(template, out, findField(template, ["car_power_kw", "car_engine_power_kw"]), data.powerKw);
  setValue(template, out, findField(template, ["car_power_hp", "car_engine_power_hp"]), data.powerHp);

  const ptsCombined = findField(template, ["car_pts"]);
  const ptsSeriesField = findField(template, ["pts_series"]);
  const ptsNumberField = findField(template, ["pts_number"]);
  if (ptsCombined) {
    setValue(template, out, ptsCombined, [data.ptsSeries, data.ptsNumber].filter(Boolean).join(" "));
  } else {
    setValue(template, out, ptsSeriesField, data.ptsSeries);
    setValue(template, out, ptsNumberField, data.ptsNumber);
  }

  setValue(template, out, findField(template, ["pts_date", "car_pts_date"]), data.ptsDate);
  setValue(template, out, findField(template, ["pts_issued_by", "car_pts_issued_by"]), data.ptsIssuedBy);

  const stsCombined = findField(template, ["car_sts"]);
  const stsSeriesField = findField(template, ["sts_series"]);
  const stsNumberField = findField(template, ["sts_number"]);
  if (stsCombined) {
    setValue(template, out, stsCombined, [data.stsSeries, data.stsNumber].filter(Boolean).join(" "));
  } else {
    setValue(template, out, stsSeriesField, data.stsSeries);
    setValue(template, out, stsNumberField, data.stsNumber);
  }

  setValue(template, out, findField(template, ["car_epts", "epts_number"]), data.eptsNumber);
  setValue(template, out, findField(template, ["owner_fio", "car_owner"]), data.ownerFio);

  return out;
}

export function applyVucToRole(
  template: LegalTemplate,
  prefix: string,
  text: string
): Record<string, string> {
  const out: Record<string, string> = {};
  const seriesNumber = (() => {
    const m = text.match(/(\d{2})\s?(\d{2})\s?(\d{6})/);
    if (!m || !hasContextBefore(text, m.index ?? 0, /водительское|удостоверение|ву|в\/у|лицензи/i, 150)) return null;
    return m;
  })();
  if (!seriesNumber) return out;
  const value = `${seriesNumber[1]}${seriesNumber[2]} ${seriesNumber[3]}`;
  setValue(
    template,
    out,
    findField(template, [
      `${prefix}_vuc`,
      `${prefix}_license`,
      `${prefix}_driver_license`,
      `${prefix}_vu`,
      `driver_vuc`,
      `driver_license`,
    ]),
    value
  );
  return out;
}

// Поля шаблона, которые слот потенциально заполняет. Нужно, чтобы при
// неудаче распознавания показать пользователю КОНКРЕТНЫЙ список того, что
// не найдено (вместо общей фразы). Возвращает только реально существующие
// в шаблоне поля.
export function expectedFields(
  template: LegalTemplate,
  slot: DocSlot
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  const push = (cands: string[]) => {
    for (const c of cands) {
      const f = template.fields.find((x) => x.id === c);
      if (f) out.push({ id: f.id, label: f.label });
    }
  };
  switch (slot.ocrKind) {
    case "passport":
    case "passportReg":
      if (slot.rolePrefix) {
        push([`${slot.rolePrefix}_passport`]);
        push([
          `${slot.rolePrefix}_passport_series`,
          `${slot.rolePrefix}_passport_seria`,
          `${slot.rolePrefix}_passport_ser`,
        ]);
        push([
          `${slot.rolePrefix}_passport_number`,
          `${slot.rolePrefix}_passport_num`,
          `${slot.rolePrefix}_passport_no`,
        ]);
        push([
          `${slot.rolePrefix}_fio`,
          `${slot.rolePrefix}_full_name`,
          `${slot.rolePrefix}_name`,
        ]);
        push([
          `${slot.rolePrefix}_birthday`,
          `${slot.rolePrefix}_birth_date`,
          `${slot.rolePrefix}_birthdate`,
        ]);
        push([
          `${slot.rolePrefix}_birth_place`,
          `${slot.rolePrefix}_birthplace`,
        ]);
        push([
          `${slot.rolePrefix}_passport_issued_by`,
          `${slot.rolePrefix}_passport_by`,
          `${slot.rolePrefix}_passport_issued`,
        ]);
        push([
          `${slot.rolePrefix}_passport_date`,
          `${slot.rolePrefix}_passport_issued_date`,
          `${slot.rolePrefix}_passport_issue_date`,
        ]);
        push([`${slot.rolePrefix}_passport_code`]);
        push([
          `${slot.rolePrefix}_address`,
          `${slot.rolePrefix}_addr`,
          `${slot.rolePrefix}_registration`,
          `${slot.rolePrefix}_living_address`,
        ]);
        push([`${slot.rolePrefix}_inn`]);
        push([`${slot.rolePrefix}_snils`]);
      }
      break;
    case "pts":
    case "sts":
    case "epts":
      push(["car_vin", "vehicle_vin", "trailer_vin", "boat_vin"]);
      push(["car_plate", "car_grz", "vehicle_plate"]);
      push(["car_brand", "vehicle_brand", "trailer_brand", "car_make"]);
      push(["car_year", "vehicle_year", "trailer_year"]);
      push(["car_engine", "car_engine_number"]);
      push(["car_chassis", "car_chassis_number"]);
      push(["car_body", "car_body_number"]);
      push(["car_color", "car_colour"]);
      push(["car_power_kw", "car_engine_power_kw"]);
      push(["car_power_hp", "car_engine_power_hp"]);
      push([
        "car_pts",
        "pts_series",
        "pts_number",
        "pts_date",
        "pts_issued_by",
        "car_pts_date",
      ]);
      push(["car_sts", "sts_series", "sts_number"]);
      push(["car_epts", "epts_number"]);
      push(["owner_fio", "car_owner"]);
      break;
    case "vuc":
      if (slot.rolePrefix) {
        push([
          `${slot.rolePrefix}_vuc`,
          `${slot.rolePrefix}_license`,
          `${slot.rolePrefix}_driver_license`,
          `${slot.rolePrefix}_vu`,
          `driver_vuc`,
          `driver_license`,
        ]);
      }
      break;
  }
  return out;
}