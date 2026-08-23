import Mustache from "mustache";
import type { LegalTemplate } from "@/data/types";
import { rublesToWords } from "@/lib/words";
import { declineFullName, looksLikeFullName } from "@/lib/names";

const RU_MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

// ГОСТ Р 7.0.97-2016, словесно-цифровой способ: «5 июня 2016 г.»
export function formatRuDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const monthIdx = Number(m[2]) - 1;
  if (monthIdx < 0 || monthIdx > 11) return iso;
  const day = String(Number(m[3]));
  return `${day}\u00A0${RU_MONTHS_GEN[monthIdx]}\u00A0${m[1]}\u00A0г.`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface RenderOptions {
  /** Готовый SVG QR-кода (для счёта, ГОСТ Р 56042-2014). */
  qrSvg?: string | null;
  /** Подписи сторон (dataURL картинок). */
  signSeller?: string | null;
  signBuyer?: string | null;
  /**
   * HTML-шаблон превью (Mustache). Выносится из объектов шаблонов в ленивый
   * модуль templatePreviews, чтобы не раздувать основной бандл конструктора.
   * Если не передан — используется template.previewTemplate (для тестов/SSR).
   */
  previewTemplate?: string;
}

/**
 * Синонимы полей для документов-спутников в пакете («паспорт сделки»):
 * значения из основной формы ДКП/аренды подставляются в поля расписки,
 * акта, согласия супруга, доверенности и т.п. Ключ — поле спутника,
 * значения — поля основной формы по приоритету.
 */
const PACK_FIELD_ALIASES: Record<string, string[]> = {
  seller_fio: ["recipient_fio", "donor_fio", "owner_fio", "lessor_fio", "landlord_fio", "principal_fio", "payer_fio", "party1_fio", "executor_fio", "guardian_fio", "applicant_fio"],
  buyer_fio: ["sender_fio", "donee_fio", "customer_fio", "borrower_fio", "lessee_fio", "tenant_fio", "agent_fio", "receiver_fio", "party2_fio", "keeper_fio"],
  seller_passport: ["recipient_passport", "donor_passport", "owner_passport", "landlord_passport", "principal_passport", "payer_passport", "party1_passport"],
  buyer_passport: ["sender_passport", "donee_passport", "customer_passport", "borrower_passport", "tenant_passport", "agent_passport", "receiver_passport", "party2_passport"],
  seller_address: ["sender_address", "donor_address", "owner_address", "landlord_address", "principal_address", "party1_address"],
  buyer_address: ["recipient_address", "customer_address", "borrower_address", "tenant_address", "agent_address"],
  seller_phone: ["sender_phone", "landlord_phone", "owner_phone", "principal_phone"],
  buyer_phone: ["recipient_phone", "tenant_phone", "agent_phone", "customer_phone"],
  applicant_fio: ["seller_fio", "owner_fio", "recipient_fio"],
  owner_phone: ["seller_phone"],
  car_brand: ["car_brand", "car_make", "car_model"],
  car_make: ["car_brand"],
  seller_company: ["executor_company", "supplier_company", "lender_company", "lessor_company", "landlord_company", "dev_company"],
  buyer_company: ["customer_company", "borrower_company", "lessee_company", "tenant_company", "client_company", "debtor_company"],
  seller_inn: ["executor_inn", "supplier_inn", "lender_inn", "dev_inn", "landlord_inn"],
  buyer_inn: ["customer_inn", "borrower_inn", "client_inn"],
  seller_director: ["executor_director", "supplier_director", "lender_director", "dev_director", "landlord_director"],
  buyer_director: ["customer_director", "borrower_director", "client_director"],
  seller_bank: ["executor_bank"],
  seller_bik: ["executor_bik"],
  seller_account: ["executor_account"],
  seller_corr_account: ["executor_corr_account"],
  contract_price: ["amount", "car_price", "loan_amount", "rent_amount", "storage_price", "freight_cost", "shoot_price", "service_price", "uc_amount", "loan_sum", "contract_sum"],
  contract_date: ["date", "dkp_date"],
  car_vin: ["car_vin"],
  car_plate: ["car_plate"],
  car_year: ["car_year"],
  car_sts: ["car_sts"],
  car_pts: ["car_pts", "car_pts_series"],
  car_grz: ["car_plate", "car_grz"],
  land_address: ["flat_address", "object_address", "house_address", "premises_address"],
  land_cadastral_number: ["flat_cadastral_number"],
  object_address: ["flat_address", "house_address", "premises_address", "land_address"],
  flat_cadastral_number: ["land_cadastral_number"],
  object_type: ["flat_address"],
  owner_fio: ["seller_fio", "sender_fio", "donor_fio", "landlord_fio"],
  spouse_fio: ["seller_spouse_fio", "party1_spouse_fio"],
  sum: ["contract_price", "amount"],
};

const PASSPORT_SUFFIXES = ["_series", "_number"];

export function buildPackValues(
  template: LegalTemplate,
  formValues: Record<string, string>
): Record<string, string> {
  const values: Record<string, string> = {};
  let changed = false;
  const collect = (f: { id: string }): string => {
    if (formValues[f.id]) return formValues[f.id];
    if (f.id.endsWith("_passport")) {
      const s = formValues[f.id + "_series"];
      const n = formValues[f.id + "_number"];
      if (s && n) return s + " " + n;
      const s2 = formValues[f.id.replace(/_passport$/, "") + "_passport_series"];
      const n2 = formValues[f.id.replace(/_passport$/, "") + "_passport_number"];
      if (s2 && n2) return s2 + " " + n2;
      const combined = PACK_FIELD_ALIASES[f.id] || [];
      const reverse = Object.keys(PACK_FIELD_ALIASES).filter((k) =>
        PACK_FIELD_ALIASES[k].includes(f.id)
      );
      for (const a of [...combined, ...reverse]) {
        const v = formValues[a] || "";
        if (v && !formValues[a + "_series"]) return v;
        if (formValues[a + "_series"] && formValues[a + "_number"])
          return formValues[a + "_series"] + " " + formValues[a + "_number"];
      }
      return "";
    }
    for (const a of [...(PACK_FIELD_ALIASES[f.id] || []), ...Object.keys(PACK_FIELD_ALIASES).filter((k) => PACK_FIELD_ALIASES[k].includes(f.id))]) {
      if (formValues[a]) return formValues[a];
    }
    return "";
  };
  for (const f of template.fields) {
    if (formValues[f.id]) continue;
    const v = collect(f);
    if (v) {
      values[f.id] = v;
      changed = true;
    }
  }
  return {
    ...formValues,
    ...(changed ? values : {}),
  };
}

/**
 * Единый движок рендера: собирает view из значений формы и прогоняет через
 * Mustache (экранирование {{field}} — защита от XSS), инжектирует QR-код и
 * подписи. Используется конструктором и страницами предпросмотра — чтобы
 * документ всегда выглядел одинаково.
 */
export function renderTemplateDocument(
  template: LegalTemplate,
  formValues: Record<string, string>,
  options: RenderOptions = {}
): string {
  const { qrSvg = null, signSeller = null, signBuyer = null } = options;
  try {
    const view: Record<string, unknown> = {};

    template.fields.forEach((f) => {
      const raw = formValues[f.id] || "";

      if (f.type === "checkbox") {
        view[f.id] = raw === "true";
        return;
      }

      if (f.type === "date" && raw) {
        view[f.id] = formatRuDate(raw);
        return;
      }

      if (f.type === "repeating") {
        let items: Record<string, unknown>[] = [];
        try {
          items = JSON.parse(raw || "[]");
        } catch {
          items = [];
        }
        items = items.map((item) => {
          const safe: Record<string, string> = {};
          Object.entries(item).forEach(([k, v]) => {
            safe[k] = String(v ?? "");
          });
          return safe;
        });
        items.forEach((item, idx) => {
          Object.entries(item).forEach(([k, v]) => {
            view[`${f.id}_${idx}_${k}`] = v;
          });
        });
        view[f.id] = items.map((item, idx) => ({
          num: idx + 1,
          ...item,
        }));
        return;
      }

      view[f.id] = raw;

      // Для select/radio дополнительно: label выбранной опции ({{{field_label}}})
      // и boolean-флаг вида {{{field_is_value}}} для условий Mustache {{#field_is_value}}.
      if (
        (f.type === "select" || f.type === "radio") &&
        f.options &&
        raw
      ) {
        const opts = (f.options as (string | { label: string; value: string })[]).map(
          (o) => (typeof o === "string" ? { label: o, value: o } : o)
        );
        const opt = opts.find((o) => o.value === raw);
        if (opt) view[`${f.id}_label`] = opt.label;
        if (/^[a-z0-9_]+$/i.test(raw)) {
          view[`${f.id}_is_${raw}`] = true;
        }
      }
    });

    const fieldIds = new Set(template.fields.map((f) => f.id));
    Object.entries(formValues).forEach(([key, value]) => {
      if (!fieldIds.has(key) && value && !(key in view)) {
        view[key] = String(value);
      }
    });

    // Автовычисляемые формы: «сумма прописью», родительный и творительный падежи ФИО.
    // Если в шаблоне есть явное поле (*_words / *_gen / *_ins), перезаписываем его,
    // когда значением осталось значение по умолчанию или пустота; явный ввод
    // пользователя сохраняется.
    const isUnset = (fieldId: string, f: { defaultValue: string }) => {
      if (!(fieldId in view)) return true;
      const v = view[fieldId];
      return !v || v === f.defaultValue;
    };
    for (const f of template.fields) {
      const raw = formValues[f.id] || "";
      if (!raw) continue;
      if (f.type === "date" || f.type === "checkbox") continue;

      const wordsField = `${f.id}_words`;
      if (!(wordsField in view) || isUnset(wordsField, f)) {
        const words = rublesToWords(raw);
        if (words) view[wordsField] = words;
      }

      if (looksLikeFullName(raw)) {
        const genField = `${f.id}_gen`;
        if (!(genField in view) || isUnset(genField, f)) {
          view[genField] = declineFullName(raw, "gen");
        }
        const insField = `${f.id}_ins`;
        if (!(insField in view) || isUnset(insField, f)) {
          view[insField] = declineFullName(raw, "ins");
        }
      }
    }

    // Итоги и НДС для счёта.
    if (template.id === "invoice") {
      let items: { sum?: number }[] = [];
      try {
        items = JSON.parse(formValues.items || "[]");
      } catch {
        items = [];
      }
      const total = items.reduce((s, it) => s + Number(it.sum || 0), 0);
      const rate = formValues.nds_rate || "20";
      const nds =
        rate === "без НДС" ? 0 : (total * Number(rate)) / (100 + Number(rate));
      const fmt = (n: number) =>
        n.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      view.invoice_total_pretty = fmt(total);
      view.invoice_nds_pretty = fmt(nds);
    }

    // Итоговая сумма для документов с таблицей позиций (УПД, графики, спецификации).
    if (
      template.id === "upd" || template.id === "loan-graph" ||
      template.id === "container-spec" || template.id === "work-plan" ||
      template.id === "customer-order" || template.id === "services-list" ||
      template.id === "property-list" || template.id === "website-development" ||
      template.id === "llc-establishment"
    ) {
      let items: { sum?: number }[] = [];
      try {
        items = JSON.parse(formValues.items || "[]");
      } catch {
        items = [];
      }
      const total = items.reduce((s, it) => s + Number(it.sum || 0), 0);
      view._total_pretty = total.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    let html = Mustache.render(options.previewTemplate ?? template.previewTemplate ?? "", view);

    // QR-код (ГОСТ Р 56042-2014) подменяет placeholder из шаблона.
    if (template.id === "invoice" && formValues.show_qr === "true" && qrSvg) {
      html = html.replace(
        '<div class="text-right" id="qr-placeholder"></div>',
        '<div class="text-right"><div id="qr-anchor">' + qrSvg + "</div>" +
          '<p class="text-[10px] text-zinc-400 mt-1">QR-код для оплаты</p></div>'
      );
    }

    const injectSign = (
      htmlStr: string,
      pattern: RegExp,
      src: string | null
    ): string => {
      if (!src) return htmlStr;
      const img =
        '<div class="text-left mb-1"><img src="' +
        src +
        '" alt="подпись" style="height:40px;max-width:140px;object-fit:contain;" /></div>';
      return pattern.test(htmlStr)
        ? htmlStr.replace(pattern, img + "$&")
        : htmlStr;
    };

    html = injectSign(
      html,
      /<div[^>]*class="[^"]*"[^>]*>\s*Подпись\s*Продавца\s*<\/div>/,
      signSeller
    );
    html = injectSign(
      html,
      /<div[^>]*class="[^"]*"[^>]*>\s*Подпись\s*Покупателя\s*<\/div>/,
      signBuyer
    );

    return html;
  } catch {
    let html = options.previewTemplate ?? template.previewTemplate ?? "";
    for (const [key, value] of Object.entries(formValues)) {
      html = html.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        escapeHtml(value || "___________________")
      );
    }
    return html;
  }
}