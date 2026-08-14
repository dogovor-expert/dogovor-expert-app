import { LegalTemplate, TemplateField } from "@/data/types";
import { rublesToWords } from "@/lib/words";

export interface AuditResult {
  type: "error" | "warning" | "success";
  field: string;
  message: string;
}

const priceThresholds = {
  receipt: 100000,
  tax: 250000,
};

const ECO_CLASSES = ["Евро-0", "Евро-1", "Евро-2", "Евро-3", "Евро-4", "Евро-5", "Евро-6", "0", "1", "2", "3", "4", "5", "6"];
const VEHICLE_TYPES = ["Легковой", "Грузовой", "Автобус", "Мотоцикл", "Прицеп", "Мопед", "Трактор"];
const VEHICLE_CATEGORIES = ["A", "B", "C", "D", "E", "M", "A1", "B1", "C1", "D1"];
const STEERING_POSITIONS = ["Левое", "Правое", "Центральное", "Отсутствует"];
const DRIVE_TYPES = ["Передний", "Задний", "Полный"];
const ENGINE_TYPES = ["Бензин", "Дизель", "Электро", "Гибрид", "Газ"];
const TRANSMISSION_TYPES = ["Механическая", "Автоматическая", "Робот", "Вариатор"];
const DOCUMENT_TYPES = ["Паспорт гражданина РФ", "Заграничный паспорт", "Военный билет", "Паспорт иностранного гражданина", "Иной документ"];

const WMI_BRANDS: Record<string, string> = {
  "1F": "Ford",
  "1FT": "Ford",
  "1HG": "Honda",
  "1G1": "Chevrolet",
  "1G2": "Pontiac",
  "1GC": "Chevrolet",
  "1G4": "Buick",
  "1M4": "Dodge",
  "1M8": "Dodge",
  "1N4": "Nissan",
  "1N6": "Nissan",
  "1J4": "Jeep",
  "1J8": "Jeep",
  "1VW": "Volkswagen",
  "1XP": "Volvo",
  "2H": "Honda",
  "2T1": "Toyota",
  "2T3": "Toyota",
  "3N1": "Nissan",
  "3VW": "Volkswagen",
  "4J1": "BMW",
  "4T1": "Toyota",
  "4T3": "Toyota",
  "5N1": "Nissan",
  "5TD": "Hyundai",
  "5NP": "Hyundai",
  "5U5": "Kia",
  "5WY": "Kia",
  "JTM": "Toyota",
  "JTH": "Lexus",
  "JTD": "Toyota",
  "JN1": "Nissan",
  "JM1": "Mazda",
  "JS1": "Suzuki",
  "KMH": "Hyundai",
  "KNA": "Kia",
  "KN8": "Kia",
  "KPT": "Kia",
  "LTV": "BYD",
  "LVW": "BYD",
  "MNT": "Ravon",
  "WBA": "BMW",
  "WDB": "Mercedes-Benz",
  "WDC": "Mercedes-Benz",
  "WVW": "Volkswagen",
  "WV1": "Volkswagen",
  "WA0": "Audi",
  "W0L": "Opel",
  "WVG": "Volkswagen",
  "YS3": "Suzuki",
  "YS4": "Suzuki",
  "YS2": "Suzuki",
  "VF1": "Renault",
  "XTA": "АвтоВАЗ (Lada)",
  "X9U": "АвтоВАЗ (Lada)",
  "XW7": "Hyundai",
  "XW8": "Volkswagen",
  "Z94": "Hyundai",
  "Z87": "Chevrolet",
  "XUF": "Seat",
  "X7C": "УАЗ",
  "XTT": "Mazda",
  "X3M": "Geely",
  "XT3": "Citroën",
  "XW4": "Kia",
  "ZFA": "Fiat",
  "ZFC": "Fiat",
  "JM0": "Mazda",
  "TMB": "Škoda",
  "X9L": "ZAZ",
  "XWD": "Volkswagen",
  "VSS": "Škoda",
  "KM8": "Hyundai",
  "5UX": "BMW",
  "5YJ": "Tesla",
  "7A8": "Ford (Австралия)",
  "8AG": "Chery",
  "LVV": "Chery",
  "LGB": "Nissan (Dongfeng)",
  "LDC": "Dongfeng",
  "LH1": "BYD",
  "LFV": "FAW",
  "LGX": "BYD",
  "LSG": "GM (Китай)",
  "LVS": "Ford (Китай)",
  "LZG": "Changan",
  "LGW": "Great Wall",
  "LZW": "GM (Китай)",
};

const WMI_COUNTRIES: Record<string, string> = {
  "1": "США",
  "2": "Канада",
  "3": "Мексика",
  "4": "США",
  "5": "США",
  "6": "Австралия",
  "7": "Новая Зеландия",
  "8": "Аргентина",
  "9": "Бразилия",
  "J": "Япония",
  "K": "Южная Корея",
  "L": "Китай",
  "M": "Индия",
  "N": "Турция",
  "S": "Великобритания",
  "T": "Швейцария",
  "V": "Франция",
  "W": "Германия",
  "X": "Россия",
  "Y": "Швеция",
  "Z": "Италия",
  "H": "Восточная Европа",
};

export function isFieldVisible(
  field: TemplateField,
  values: Record<string, string>
): boolean {
  if (!field.dependsOn) return true;
  const depValue = values[field.dependsOn.fieldId] || "";
  if (field.dependsOn.values) {
    return field.dependsOn.values.includes(depValue);
  }
  return depValue === field.dependsOn.value;
}

export function normalizeOptions(
  options?: TemplateField["options"]
): { label: string; value: string }[] {
  if (!options) return [];
  return options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );
}

export function innChecksumValid(inn: string): boolean {
  const clean = inn.replace(/\D/g, "");
  if (/^\d{10}$/.test(clean)) {
    const d = clean.split("").map(Number);
    const w = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    const sum = d.slice(0, 9).reduce((acc, x, i) => acc + x * w[i], 0);
    return (sum % 11) % 10 === d[9];
  }
  if (/^\d{12}$/.test(clean)) {
    const d = clean.split("").map(Number);
    const w11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const w12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const n11 = d.slice(0, 10).reduce((acc, x, i) => acc + x * w11[i], 0) % 11 % 10;
    const n12 = d.slice(0, 11).reduce((acc, x, i) => acc + x * w12[i], 0) % 11 % 10;
    return n11 === d[10] && n12 === d[11];
  }
  return false;
}

export function ogrnChecksumValid(ogrn: string): boolean {
  const clean = ogrn.replace(/\D/g, "");
  if (/^\d{13}$/.test(clean)) {
    const check = Number(clean.slice(0, 12)) % 11 % 10;
    return check === Number(clean[12]);
  }
  if (/^\d{15}$/.test(clean)) {
    const check = Number(clean.slice(0, 14)) % 13 % 10;
    return check === Number(clean[14]);
  }
  return false;
}

export function snilsChecksumValid(snils: string): boolean {
  const clean = snils.replace(/\D/g, "");
  if (!/^\d{11}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(clean[i]) * (9 - i);
  }
  let ctrl = sum % 101;
  if (ctrl === 100) ctrl = 0;
  return Number(clean.slice(9, 11)) === ctrl;
}

export function runLegalAudit(
  template: LegalTemplate,
  values: Record<string, string>,
  visibleFieldIds?: string[]
): AuditResult[] {
  const results: AuditResult[] = [];

  const isVisible = (field: TemplateField): boolean => {
    if (!isFieldVisible(field, values)) return false;
    if (visibleFieldIds && !visibleFieldIds.includes(field.id)) return false;
    return true;
  };

  for (const field of template.fields) {
    if (!isVisible(field)) continue;

    const val = values[field.id] || "";
    const v = field.validation;

    if (v?.required && !val.trim()) {
      results.push({
        type: "error",
        field: field.id,
        message: `${field.label} — обязательно для заполнения`,
      });
      continue;
    }

    if (!val.trim()) continue;

    if (v?.minLength && val.length < v.minLength) {
      results.push({
        type: "error",
        field: field.id,
        message: `${field.label} — минимум ${v.minLength} символов (сейчас ${val.length})`,
      });
    }

    if (v?.maxLength && val.length > v.maxLength) {
      results.push({
        type: "error",
        field: field.id,
        message: `${field.label} — максимум ${v.maxLength} символов`,
      });
    }

    if (field.id === "car_vin" || field.id === "gift_car_vin" || field.id.endsWith("_vin")) {
      const vinClean = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (vinClean.length !== 17) {
        results.push({
          type: "error",
          field: field.id,
          message: `VIN должен содержать ровно 17 символов (сейчас ${vinClean.length})`,
        });
      } else if (!/^[A-Z0-9]{17}$/.test(vinClean)) {
        results.push({
          type: "warning",
          field: field.id,
          message: "VIN содержит нестандартные символы",
        });
      } else {
        const wp = vinClean.slice(0, 3);
        const ws = vinClean.slice(0, 2);
        const brand = WMI_BRANDS[wp] || WMI_BRANDS[ws];
        const country = WMI_COUNTRIES[vinClean[0]];
        if (brand || country) {
          const parts = [brand ? `производитель: ${brand}` : null, country ? `регион WMI: ${country}` : null].filter(Boolean);
          results.push({
            type: "success",
            field: field.id,
            message: `VIN распознан • ${parts.join(", ")}`,
          });
        }
      }
    }

    if (field.id.includes("passport_series")) {
      if (val && !/^\d{4}$/.test(val.replace(/\s/g, ""))) {
        results.push({
          type: "error",
          field: field.id,
          message: "Серия паспорта должна содержать 4 цифры",
        });
      }
    }

    if (field.id.includes("passport_number")) {
      if (val && !/^\d{6}$/.test(val.replace(/\s/g, ""))) {
        results.push({
          type: "error",
          field: field.id,
          message: "Номер паспорта должен содержать 6 цифр",
        });
      }
    }

    if (field.id.includes("inn")) {
      const clean = val.replace(/\D/g, "");
      if (!/^\d{10}$/.test(clean) && !/^\d{12}$/.test(clean)) {
        results.push({
          type: "error",
          field: field.id,
          message: "ИНН: 10 цифр (юрлицо) или 12 (физлицо/ИП)",
        });
      } else if (!innChecksumValid(clean)) {
        results.push({
          type: "warning",
          field: field.id,
          message: "ИНН не проходит проверку контрольного числа — проверьте правильность ввода",
        });
      }
    }

    if (field.id.includes("ogrn") && !field.id.includes("passport")) {
      const clean = val.replace(/\D/g, "");
      if (!/^\d{13}$/.test(clean) && !/^\d{15}$/.test(clean)) {
        results.push({
          type: "error",
          field: field.id,
          message: "ОГРН: 13 цифр (юрлицо) или 15 (ИП)",
        });
      } else if (!ogrnChecksumValid(clean)) {
        results.push({
          type: "warning",
          field: field.id,
          message: "ОГРН не проходит проверку контрольного числа — проверьте правильность ввода",
        });
      }
    }

    if (field.id.includes("snils")) {
      const clean = val.replace(/\D/g, "");
      if (clean && clean.length !== 11) {
        results.push({
          type: "error",
          field: field.id,
          message: "СНИЛС: 11 цифр (XXX-XXX-XXX XX)",
        });
      } else if (clean && !snilsChecksumValid(clean)) {
        results.push({
          type: "warning",
          field: field.id,
          message: "СНИЛС не проходит проверку контрольного числа",
        });
      }
    }

    if (field.id.includes("bik")) {
      const clean = val.replace(/\D/g, "");
      if (clean && !/^\d{9}$/.test(clean)) {
        results.push({
          type: "error",
          field: field.id,
          message: "БИК: 9 цифр",
        });
      }
    }

    if (field.id.includes("kpp") && !field.id.includes("bik")) {
      const clean = val.replace(/\D/g, "");
      if (clean && !/^\d{9}$/.test(clean)) {
        results.push({
          type: "error",
          field: field.id,
          message: "КПП: 9 цифр",
        });
      }
    }

    if (field.id.includes("fio")) {
      const words = val.trim().split(/\s+/);
      if (words.length < 2) {
        results.push({
          type: "warning",
          field: field.id,
          message: "Укажите ФИО полностью (Фамилия Имя Отчество)",
        });
      }
    }

    if (field.id.includes("department_code") || field.id.includes("code")) {
      if (val && !/^\d{3}-\d{3}$/.test(val.replace(/\s/g, ""))) {
        results.push({
          type: "warning",
          field: field.id,
          message: "Код подразделения в формате NNN-NNN",
        });
      }
    }

    if (field.id.includes("eco_class") && val) {
      if (!ECO_CLASSES.includes(val)) {
        results.push({
          type: "warning",
          field: field.id,
          message: "Нестандартный экологический класс",
        });
      }
    }

    if (field.id.includes("category") && val && template.category === "auto") {
      if (!VEHICLE_CATEGORIES.includes(val)) {
        results.push({
          type: "warning",
          field: field.id,
          message: `Допустимые категории: ${VEHICLE_CATEGORIES.join(", ")}`,
        });
      }
    }
  }

  const now = new Date();

  const passportDates = template.fields.filter((f) => f.id.toLowerCase().includes("passport_date"));
  for (const f of passportDates) {
    const dateRaw = values[f.id];
    if (!dateRaw) continue;
    const d = new Date(dateRaw);
    if (!isNaN(d.getTime()) && d > now) {
      results.push({
        type: "error",
        field: f.id,
        message: "Дата выдачи паспорта не может быть в будущем",
      });
    }
  }

  const pairsByPrefix = new Map<string, { birthday?: string; passportDate?: string }>();
  for (const f of template.fields) {
    const id = f.id.toLowerCase();
    const bIdx = id.indexOf("birthday");
    const pIdx = id.indexOf("passport_date");
    if (bIdx !== -1) {
      const prefix = f.id.slice(0, bIdx);
      const slot = pairsByPrefix.get(prefix) || {};
      slot.birthday = values[f.id];
      pairsByPrefix.set(prefix, slot);
    } else if (pIdx !== -1) {
      const prefix = f.id.slice(0, pIdx);
      const slot = pairsByPrefix.get(prefix) || {};
      slot.passportDate = values[f.id];
      pairsByPrefix.set(prefix, slot);
    }
  }
  for (const [prefix, pair] of pairsByPrefix) {
    const b = pair.birthday;
    const p = pair.passportDate;
    if (!b || !p) continue;
    const bDate = new Date(b);
    const pDate = new Date(p);
    if (isNaN(bDate.getTime()) || isNaN(pDate.getTime())) continue;
    if (pDate < bDate) {
      results.push({
        type: "error",
        field: `${prefix}passport_date`,
        message: "Дата выдачи паспорта раньше даты рождения",
      });
      continue;
    }
    let age = pDate.getFullYear() - bDate.getFullYear();
    if (
      pDate.getMonth() < bDate.getMonth() ||
      (pDate.getMonth() === bDate.getMonth() && pDate.getDate() < bDate.getDate())
    ) {
      age--;
    }
    if (age < 14) {
      results.push({
        type: "warning",
        field: `${prefix}birthday`,
        message: `На дату выдачи паспорта владельцу было ${age} лет — не соответствует российским требованиям`,
      });
    }
  }

  const leaseStartField = template.fields.find((f) => f.id === "lease_start");
  const leaseEndField = template.fields.find((f) => f.id === "lease_end");
  if (leaseStartField && leaseEndField) {
    const s = values.lease_start;
    const e = values.lease_end;
    if (s && e) {
      const sDate = new Date(s);
      const eDate = new Date(e);
      if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && eDate < sDate) {
        results.push({
          type: "error",
          field: "lease_end",
          message: "Дата окончания аренды раньше даты начала",
        });
      }
    }
  }

  for (const f of template.fields) {
    if (!f.id.toLowerCase().endsWith("account")) continue;
    const accRaw = values[f.id];
    if (!accRaw) continue;
    const base = f.id.slice(0, -"account".length);
    const bikRaw =
      values[base + "bik"] ||
      (base.endsWith("corr_")
        ? values[base.slice(0, -"corr_".length) + "bik"]
        : "");
    if (!bikRaw) continue;
    const bikClean = bikRaw.replace(/\D/g, "");
    const accClean = accRaw.replace(/\D/g, "");
    if (
      bikClean.length === 9 &&
      accClean.length >= 5 &&
      accClean.slice(0, 5) !== bikClean.slice(-5)
    ) {
      results.push({
        type: "warning",
        field: f.id,
        message:
          "Первые 5 цифр счёта не совпадают с последними 5 цифрами БИК — проверьте реквизиты",
      });
    }
  }

  // Повторяемые позиции (счёт на оплату): пустая таблица, незаполненное
  // наименование, некорректные количество/цена, несовпадение суммы.
  for (const field of template.fields) {
    if (field.type !== "repeating" || !field.repeatingFields || !isVisible(field)) continue;
    let items: Record<string, string>[] = [];
    try {
      items = JSON.parse(values[field.id] || "[]");
    } catch {
      items = [];
    }
    if (items.length === 0) {
      results.push({
        type: "warning",
        field: field.id,
        message: `${field.label}: добавьте хотя бы одну позицию`,
      });
      continue;
    }
    items.forEach((item, idx) => {
      const n = idx + 1;
      if (!String(item.name || "").trim()) {
        results.push({
          type: "error",
          field: field.id,
          message: `Позиция ${n}: укажите наименование`,
        });
      }
      const qtyText = String(item.qty || "");
      const priceText = String(item.price || "");
      if (qtyText !== "" && (!Number.isFinite(Number(qtyText)) || Number(qtyText) <= 0)) {
        results.push({
          type: "error",
          field: field.id,
          message: `Позиция ${n}: количество должно быть числом больше нуля`,
        });
      }
      if (priceText !== "" && (!Number.isFinite(Number(priceText)) || Number(priceText) < 0)) {
        results.push({
          type: "error",
          field: field.id,
          message: `Позиция ${n}: цена не может быть отрицательной`,
        });
      }
      if (
        qtyText !== "" &&
        priceText !== "" &&
        String(item.sum || "") !== "" &&
        Number.isFinite(Number(qtyText)) &&
        Number.isFinite(Number(priceText)) &&
        Number.isFinite(Number(item.sum)) &&
        Math.abs(Number(qtyText) * Number(priceText) - Number(item.sum)) > 0.01
      ) {
        results.push({
          type: "warning",
          field: field.id,
          message: `Позиция ${n}: сумма не совпадает с произведением количества и цены (рекомендуется ${(
            Number(qtyText) * Number(priceText)
          ).toLocaleString("ru-RU")})`,
        });
      }
    });
  }

  // Счёт на оплату: без банковских реквизитов платёж невозможен.
  if (template.id === "invoice") {
    const invoiceRequisites: [string, string][] = [
      ["seller_company", "Наименование продавца"],
      ["seller_inn", "ИНН продавца"],
      ["seller_bank", "Банк продавца"],
      ["seller_bik", "БИК"],
      ["seller_account", "Расчётный счёт"],
      ["seller_corr_account", "Корреспондентский счёт"],
    ];
    for (const [fid, label] of invoiceRequisites) {
      if (!values[fid]?.trim()) {
        results.push({
          type: "warning",
          field: fid,
          message: `${label}: без реквизитов платёж по счёту невозможен`,
        });
      }
    }
  }

  // Тепловизор рисков: совпадение сторон сделки.
  const partyPairs: [string, string, string][] = [
    ["seller_fio", "buyer_fio", "Продавец и Покупатель"],
    ["landlord_fio", "tenant_fio", "Арендодатель и Арендатор"],
    ["customer_fio", "executor_fio", "Заказчик и Исполнитель"],
    ["customer_company", "executor_company", "Заказчик и Исполнитель"],
    ["donor_fio", "donee_fio", "Даритель и Одаряемый"],
    ["principal_fio", "agent_fio", "Доверитель и Представитель"],
    ["shipper_company", "carrier_company", "Отправитель и Перевозчик"],
    ["lender_fio", "borrower_fio", "Заимодавец и Заёмщик"],
    ["employer_company", "employee_fio", "Работодатель и Работник"],
  ];
  for (const [aId, bId, label] of partyPairs) {
    const a = (values[aId] || "").trim();
    const b = (values[bId] || "").trim();
    if (!a || !b) continue;
    const norm = (s: string) => s.toLowerCase().replace(/[^а-яёa-z0-9 ]/g, "").replace(/\s+/g, " ");
    if (norm(a) === norm(b)) {
      results.push({
        type: "error",
        field: bId,
        message: `${label} совпадают — проверьте, это ошибка ввода или некорректная сделка`,
      });
    }
  }

  // Совпадение паспортов у разных сторон (признак подмены данных).
  const passportNumberIds = template.fields
    .filter((f) => /passport_number$/.test(f.id))
    .map((f) => f.id);
  const seenPassports = new Map<string, string>();
  for (const pid of passportNumberIds) {
    const clean = (values[pid] || "").replace(/\D/g, "");
    if (clean.length < 4) continue;
    if (seenPassports.has(clean)) {
      results.push({
        type: "error",
        field: pid,
        message: `Одинаковый номер паспорта у нескольких сторон (${seenPassports.get(clean)} и другое лицо)`,
      });
    } else {
      seenPassports.set(clean, pid.replace(/_passport_number$/, ""));
    }
  }

  // Срок действия доверенности: не более 3 лет (ст. 186 ГК РФ).
  if (template.id === "power-of-attorney-car" || template.id === "power-of-attorney-docs") {
    const issue = values.date;
    const until = values.valid_until;
    if (issue && until) {
      const i = new Date(issue);
      const u = new Date(until);
      if (!isNaN(i.getTime()) && !isNaN(u.getTime())) {
        const days = (u.getTime() - i.getTime()) / 86400000;
        if (days > 366 * 3) {
          results.push({
            type: "warning",
            field: "valid_until",
            message: "Срок доверенности более 3 лет — по ст. 186 ГК РФ доверенность, где срок не указан, действует 1 год, но юристы советуют не превышать 3 года",
          });
        }
      }
    }
  }

  // Аренда на срок более 1 года: обязательная госрегистрация (жильё — ст. 674, нежилое — ст. 651 ГК РФ).
  if (template.id === "rental-flat" || template.id === "lease-house" || template.id === "rental-commercial") {
    const start = values.rent_start || values.lease_start || values.term_start;
    const end = values.rent_end || values.lease_end;
    const months = Number(values.term_months);
    const isCommercial = template.id === "rental-commercial";
    const s = new Date(start);
    const days = end ? (new Date(end).getTime() - s.getTime()) / 86400000 : months > 0 ? months * 30.4 : 0;
    if (start && !isNaN(s.getTime()) && (days > 366 || months > 12)) {
      results.push({
        type: "warning",
        field: end ? (end === values.rent_end ? "rent_end" : "lease_end") : "term_months",
        message: isCommercial
          ? "Срок аренды более 1 года — договор аренды здания/сооружения подлежит государственной регистрации (ст. 651 ГК РФ)"
          : "Срок аренды более 1 года — договор подлежит государственной регистрации (ст. 674 ГК РФ)",
      });
    }
  }

  // Просроченный документ (срок действия истёк).
  const expiryFields = ["valid_until", "rent_end", "lease_end", "passport_valid_until", "contract_end"];
  for (const ef of expiryFields) {
    const raw = values[ef];
    if (!raw) continue;
    const d = new Date(raw);
    if (!isNaN(d.getTime()) && d < new Date()) {
      results.push({
        type: "warning",
        field: ef,
        message: "Срок действия указанного документа уже истёк — проверьте актуальность",
      });
    }
  }

  // Расхождение суммы и её прописью.
  const stripMoneySuffix = (s: string) => {
    const i = s.toLowerCase().indexOf("рубл");
    return (i >= 0 ? s.slice(0, i) : s).trim();
  };
  for (const f of template.fields) {
    if (!/_(amount|price|sum|cost)$/.test(f.id)) continue;
    if (!/^(text|number)$/.test(f.type)) continue;
    const numRaw = values[f.id];
    if (!numRaw || !/\d/.test(numRaw)) continue;
    const wordsField = f.id + "_words";
    const wordsVal = (values[wordsField] || "").trim();
    if (!wordsVal) continue;
    const generated = rublesToWords(numRaw);
    if (!generated) continue;
    const expect = stripMoneySuffix(generated).toLowerCase();
    const actual = stripMoneySuffix(wordsVal).toLowerCase();
    if (expect && actual && expect !== actual) {
      results.push({
        type: "warning",
        field: wordsField,
        message: "Сумма прописью не соответствует цифрам — исправьте, чтобы избежать споров",
      });
    }
  }

  // Договор на крупную сумму без расписки.
  const priceField = template.fields.find((f) => f.id === "contract_price");
  if (priceField) {
    const p = Number(values.contract_price || 0);
    if (Number.isFinite(p) && p >= 1000000) {
      results.push({
        type: "warning",
        field: "contract_price",
        message: "Сделка на 1 млн ₽ и более — оформите расписку и акт передачи, рассмотрите нотариальное удостоверение",
      });
    }
  }

  // Проверка согласия супруга при сделках с недвижимостью.
  if (template.category === "realty") {
    const hasSpouseConsent = template.suggestedDocs?.includes("spouse-consent-sell");
    if (!hasSpouseConsent) {
      results.push({
        type: "success",
        field: "_all",
        message: "Недвижимость: не забудьте согласие супруга, если продавец состоит в браке",
      });
    }
  }

  const price = Number(values.contract_price || 0);
  if (price > priceThresholds.receipt && price <= priceThresholds.tax) {
    results.push({
      type: "warning",
      field: "contract_price",
      message: `При сумме свыше ${priceThresholds.receipt.toLocaleString("ru-RU")} ₽ рекомендуется расписка`,
    });
  }

  if (price > priceThresholds.tax) {
    results.push({
      type: "warning",
      field: "contract_price",
      message: `При сумме свыше ${priceThresholds.tax.toLocaleString("ru-RU")} ₽ может потребоваться декларация 3-НДФЛ`,
    });
  }

  if (values.date) {
    const d = new Date(values.date);
    if (d > new Date()) {
      results.push({
        type: "warning",
        field: "date",
        message: "Дата договора указана в будущем",
      });
    }
  }

  const visibleFields = template.fields.filter((f) => isVisible(f));
  const filledRequired = visibleFields.filter(
    (f) => f.validation?.required && values[f.id]?.trim()
  ).length;
  const totalRequired = visibleFields.filter((f) => f.validation?.required).length;

  if (
    filledRequired === totalRequired &&
    results.filter((r) => r.type === "error").length === 0 &&
    totalRequired > 0
  ) {
    results.push({
      type: "success",
      field: "_all",
      message: "Все обязательные поля заполнены корректно",
    });
  }

  return results;
}
