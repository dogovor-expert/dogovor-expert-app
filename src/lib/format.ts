import type { LegalTemplate, TemplateField } from "@/data/types";

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function buildTemplateDefaults(template: LegalTemplate): Record<string, string> {
  const now = todayStr();
  const defaults: Record<string, string> = {};
  template.fields.forEach((f) => {
    if (
      f.type === "date" &&
      /^\d{4}-\d{2}-\d{2}$/.test(f.defaultValue) &&
      f.defaultValue < now
    ) {
      defaults[f.id] = now;
    } else {
      defaults[f.id] = f.defaultValue;
    }
  });
  return defaults;
}

/** Маски ввода: серия/номер паспорта, код подразделения, INN, VIN и т.д. */
export function applyFieldFormat(field: TemplateField, raw: string): string {
  const id = field.id;
  if (field.type === "date") return raw;

  if (field.type === "number") return raw.replace(/[^\d.,]/g, "").slice(0, 12);

  if (field.type === "checkbox") return raw;

  if (id.includes("vin") || id === "car_vin") {
    return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 17);
  }
  if (id.includes("car_plate")) {
    return raw.toUpperCase().slice(0, 9);
  }
  if (id.includes("passport_series")) {
    return raw.replace(/\D/g, "").slice(0, 4);
  }
  if (id.includes("passport_number")) {
    return raw.replace(/\D/g, "").slice(0, 6);
  }
  if (id.includes("department_code")) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
  }
  if (id.includes("snils")) {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    const p = digits.slice(0, 9);
    const c = digits.slice(9);
    const fmt = [p.slice(0, 3), p.slice(3, 6), p.slice(6, 9)].filter(Boolean).join("-");
    return c ? `${fmt} ${c}` : fmt;
  }
  if (id === "contract_price" || id.includes("price") || id.includes("amount") || id.includes("rent_amount") || id.includes("deposit_amount")) {
    return raw.replace(/[^\d.,]/g, "").slice(0, 12);
  }
  if (id.includes("inn")) {
    return raw.replace(/\D/g, "").slice(0, 12);
  }
  if (id.includes("kpp")) {
    return raw.replace(/\D/g, "").slice(0, 9);
  }
  if (id.includes("bik")) {
    return raw.replace(/\D/g, "").slice(0, 9);
  }
  if (id.includes("account") || id.includes("corr_account")) {
    return raw.replace(/\D/g, "").slice(0, 20);
  }
  if (id.includes("phone")) {
    return raw.replace(/\D/g, "").slice(0, 11);
  }
  return raw;
}

/** Нормализация типографики: «ёлочки», длинные тире, схлопывание пробелов. */
export function normalizeTypography(raw: string): string {
  const s = raw.replace(/\s{2,}/g, " ").trim();
  let open = true;
  const pieces: string[] = [];
  for (const ch of s) {
    if (ch === '"') {
      pieces.push(open ? "«" : "»");
      open = !open;
    } else {
      pieces.push(ch);
    }
  }
  let out = pieces.join("");
  out = out.replace(/\s+--+\s+/g, " — ");
  out = out.replace(/\s+-\s+/g, " — ");
  out = out.replace(/\s+^"/g, " \"");
  return out;
}
