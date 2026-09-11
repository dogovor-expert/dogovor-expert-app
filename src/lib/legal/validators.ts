export interface ValidateResult {
  valid: boolean;
  message: string;
}

function digitsOnly(v: string): string {
  return v.replace(/[\s-]/g, "").replace(/\D/g, "");
}

/** СНИЛС: 11 цифр, контрольное число по весам 9..1, mod 101 (100/101 → 0). */
export function isSnils(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 11) return { valid: false, message: "Должно быть 11 цифр" };
  const n = d.split("").map(Number);
  let sum = 0;
  const weights = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  for (let i = 0; i < 9; i++) sum += n[i] * weights[i];
  let check = sum % 101;
  if (check === 100) check = 0;
  const control = n[9] * 10 + n[10];
  return check === control
    ? { valid: true, message: "СНИЛС корректен" }
    : { valid: false, message: "Контрольное число не совпадает" };
}

/** ОГРН: 13 цифр, последняя = (первые 12 mod 11) mod 10. */
export function isOgrn(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 13) return { valid: false, message: "Должно быть 13 цифр" };
  const check = (Number(d.slice(0, 12)) % 11) % 10;
  const last = Number(d[12]);
  return check === last
    ? { valid: true, message: `ОГРН корректен (${d.slice(0, 2)} год регистрации)` }
    : { valid: false, message: "Контрольная цифра не совпадает" };
}

/** ОГРНИП: 15 цифр, последняя = (первые 14 mod 13) mod 10. */
export function isOgrnip(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 15) return { valid: false, message: "Должно быть 15 цифр" };
  const check = (Number(d.slice(0, 14)) % 13) % 10;
  const last = Number(d[14]);
  return check === last
    ? { valid: true, message: "ОГРНИП корректен" }
    : { valid: false, message: "Контрольная цифра не совпадает" };
}

/** КПП: 9 цифр (формат) — контроль не предусмотрен. */
export function isKpp(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 9) return { valid: false, message: "Должно быть 9 цифр" };
  const ok =
    /^\d{4}[\dA-Z]{2}\d{3}$/.test(d.trim().toUpperCase()) || /^\d{9}$/.test(d);
  return ok ? { valid: true, message: "КПП по формату" } : { valid: false, message: "Неверный формат: 4 цифры + код + 3 цифры" };
}

/** БИК: 9 цифр, начинается с 04 (РФ). */
export function isBik(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 9) return { valid: false, message: "Должно быть 9 цифр" };
  if (!d.startsWith("04")) return { valid: false, message: "БИК РФ начинается с 04" };
  return { valid: true, message: "БИК корректен" };
}

/**
 * Расчётный/корреспондентский счёт: 20 цифр, контроль по весам 7,1,3... (mod 10).
 * Методика: «0» + символы 5–6 БИК (условный номер КО) + счёт, Σ(цифра×вес) mod 10 = 0.
 * Проверено на корсчетах Сбера, ВТБ, Альфы, ГПБ, Т-Банка, Райффайзена и др.
 * Казначейские счета (балансы 40101–40116, 03100) не имеют защитного ключа — проверка пропускается.
 */
export function isTreasuryAccount(v: string): boolean {
  return /^(4010[1-9]|4011[0-6]|03100)/.test(v);
}

export function isBankAccount(v: string, bik?: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 20) return { valid: false, message: "Должно быть 20 цифр" };
  if (isTreasuryAccount(d))
    return { valid: true, message: "Казначейский счёт: контрольный ключ не применяется" };
  if (!bik || bik.length !== 9) return { valid: false, message: "Укажите корректный БИК (9 цифр)" };
  const checksumStr = "0" + bik.slice(4, 6) + d;
  const weights = [7, 1, 3];
  let sum = 0;
  for (let i = 0; i < checksumStr.length; i++) sum += Number(checksumStr[i]) * weights[i % 3];
  const ok = sum % 10 === 0;
  return ok
    ? { valid: true, message: "Счёт корректен" }
    : { valid: false, message: "Контрольная сумма не сходится (проверьте БИК)" };
}

/** Алгоритм Луна (банковские карты). */
export function luhn(v: string): ValidateResult {
  const d = v.replace(/[\s-]/g, "");
  if (!/^\d{8,19}$/.test(d)) return { valid: false, message: "Введите 8–19 цифр" };
  let sum = 0;
  const parity = d.length % 2;
  for (let i = 0; i < d.length; i++) {
    let digit = Number(d[i]);
    if (i % 2 === parity) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0
    ? { valid: true, message: "Номер карты корректен (Luhn)" }
    : { valid: false, message: "Номер карты некорректен" };
}

/** ИНН (10/12 цифр) — переиспользуем из utils. */
export function isInn(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length !== 10 && d.length !== 12) return { valid: false, message: "10 или 12 цифр" };
  const n = d.split("").map(Number);
  if (n.length === 10) {
    const s = (n[0] * 2 + n[1] * 4 + n[2] * 10 + n[3] * 3 + n[4] * 5 + n[5] * 9 + n[6] * 4 + n[7] * 6 + n[8] * 8) % 11 % 10;
    return s === n[9] ? { valid: true, message: "ИНН юрлица корректен" } : { valid: false, message: "Контрольная цифра не совпадает" };
  }
  const s1 = (n[0] * 7 + n[1] * 2 + n[2] * 4 + n[3] * 10 + n[4] * 3 + n[5] * 5 + n[6] * 9 + n[7] * 4 + n[8] * 6 + n[9] * 8) % 11 % 10;
  const s2 = (n[0] * 3 + n[1] * 7 + n[2] * 2 + n[3] * 4 + n[4] * 10 + n[5] * 3 + n[6] * 5 + n[7] * 9 + n[8] * 4 + n[9] * 6 + n[10] * 8) % 11 % 10;
  return s1 === n[10] && s2 === n[11] ? { valid: true, message: "ИНН физлица/ИП корректен" } : { valid: false, message: "Контрольные цифры не совпадают" };
}

/**
 * Паспорт РФ (Приказ МВД РФ № 605 от 13.11.2017): серия — 4 цифры (2 цифры года +
 * 2 цифры кода подразделения), номер — 6 цифр, код подразделения — XXX-XXX,
 * дата выдачи — не ранее 14 лет с даты рождения (Приказ МВД № 851) и не в будущем.
 *
 * Параметры:
 *  - `series` — строка из 4 цифр (с пробелами или без)
 *  - `number` — строка из 6 цифр
 *  - `code`   — опционально, "123-456"
 *  - `issued` — опционально, дата выдачи в ISO ("YYYY-MM-DD")
 *  - `birthday` — опционально, дата рождения в ISO; используется для проверки
 *    минимального возраста 14 лет. Если не передана — проверяется только,
 *    что дата не в будущем.
 */
export function isPassport(args: {
  series: string;
  number: string;
  code?: string;
  issued?: string;
  birthday?: string;
}): ValidateResult {
  const ser = digitsOnly(args.series);
  const num = digitsOnly(args.number);
  if (ser.length !== 4) return { valid: false, message: "Серия: 4 цифры" };
  if (num.length !== 6) return { valid: false, message: "Номер: 6 цифр" };
  if (args.code !== undefined && args.code !== "") {
    const cd = args.code.replace(/\D/g, "");
    if (cd.length !== 6) return { valid: false, message: "Код подразделения: XXX-XXX" };
  }
  if (args.issued) {
    const d = new Date(args.issued);
    if (isNaN(d.getTime())) return { valid: false, message: "Дата выдачи: неверный формат" };
    const now = new Date();
    if (d.getTime() > now.getTime()) return { valid: false, message: "Дата выдачи не может быть в будущем" };
    if (args.birthday) {
      const b = new Date(args.birthday);
      if (!isNaN(b.getTime())) {
        const minAge = new Date(b.getTime());
        minAge.setFullYear(minAge.getFullYear() + 14);
        if (d.getTime() < minAge.getTime()) {
          return { valid: false, message: "Паспорт выдан ранее, чем владельцу исполнилось 14 лет" };
        }
      }
    }
  }
  return { valid: true, message: "Паспорт корректен" };
}

/**
 * Водительское удостоверение РФ (Приказ МВД РФ № 365, приложение к Положению):
 * пластиковое ВУ — четырёхзначная цифровая серия и шестизначный номер
 * (на оборотной стороне: «0011 223344», в строку — 10 цифр).
 *
 * Для проверки КБМ в базе АИС страховщиков (оператор — АО «НСИС»,
 * с 01.10.2024) требуется именно номер пластикового ВУ; бумажные ВУ
 * старого образца (серия из 2 букв + 6 цифр) с 2020 года недействительны.
 *
 * Принимает одно поле: «0011 223344», «0011223344», «0011-223344»,
 * «00 11 223344» — всё это нормализуется к 10 цифрам.
 */
export function isDriverLicense(v: string): ValidateResult {
  const d = digitsOnly(v);
  if (d.length === 0) return { valid: false, message: "Введите серию и номер ВУ" };
  if (d.length !== 10) {
    return { valid: false, message: `ВУ: 4 цифры серии + 6 цифр номера (всего 10), сейчас ${d.length}` };
  }
  const series = d.slice(0, 4);
  const number = d.slice(4);
  if (/^0{4}/.test(series)) return { valid: false, message: "Серия не может быть 0000" };
  return {
    valid: true,
    message: `ВУ корректно: серия ${series.slice(0, 2)} ${series.slice(2)}, номер ${number}`,
  };
}