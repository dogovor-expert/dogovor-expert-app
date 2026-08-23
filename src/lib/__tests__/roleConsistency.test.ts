import { describe, expect, it } from "vitest";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { SIGNING_META } from "@/data/signingMeta";
import {
  getDocRequirements,
  getTemplateRoles,
} from "@/lib/docRequirements";
import { ROLE_REGISTRY } from "@/lib/roleRegistry";
import {
  resolveFieldLabel,
  tabRoleLabel,
  ROLE_COMPOSE_TEMPLATES,
} from "@/lib/roleLabels";
import { personToFields, roleToPerson } from "@/lib/personMapping";
import type { LegalTemplate, TemplateField } from "@/data/types";

const mkField = (id: string, label = id): TemplateField =>
  ({ id, label, type: "text", category: "owner", defaultValue: "" }) as TemplateField;

// Регрессионные тесты на единство ролей сторон сделки между каналами:
// форма (label поля) / сканер (docRequirements) / «Сохранённые лица»
// (personMapping) / блок подписания (signingMeta).
//
// См. баг-репорт: «Доверенность на управление ТС» — плитка «Фото водителя»
// появлялась для роли «Представитель» (хотя водителя в документе нет), а
// «Сохранённые лица» не заполняли паспорт из-за совмещённого поля.

const CORE_ROLES = [
  "seller",
  "buyer",
  "owner",
  "driver",
  "principal",
  "agent",
  "lender",
  "borrower",
  "donor",
  "donee",
  "landlord",
  "tenant",
  "employer",
  "employee",
  "executor",
  "customer",
  "contractor",
  "guarantor",
  "payer",
  "recipient",
  "sender",
];

describe("реестр ролей — единый источник правды", () => {
  it("покрывает все базовые роли сделки", () => {
    for (const p of CORE_ROLES) {
      expect(ROLE_REGISTRY[p], `роль ${p} отсутствует в roleRegistry`).toBeDefined();
    }
  });
});

describe("power-of-attorney-auto (конкретный баг-репорт)", () => {
  const t = LEGAL_TEMPLATES.find((x) => x.id === "power-of-attorney-auto") as
    | LegalTemplate
    | undefined;

  it("шаблон существует", () => {
    expect(t).toBeDefined();
  });

  it("НЕТ плитки «Фото водителя» (роль представителя не водитель)", () => {
    const slots = getDocRequirements(t!);
    expect(slots.find((s) => s.id.startsWith("vuc_"))).toBeUndefined();
  });

  it("роли сканера: Доверитель + Представитель", () => {
    const labels = getTemplateRoles(t!).map((r) => r.label);
    expect(labels).toContain("Доверителя");
    expect(labels).toContain("Представителя");
  });

  it("«Сохранённые лица» заполняют совмещённый паспорт и круговоротятся", () => {
    const person = {
      fio: "Иванов Иван Иванович",
      birthday: "",
      phone: "",
      passport_series: "4510",
      passport_number: "123456",
      passport_issued_by: "УФМС",
      passport_code: "770-001",
      address: "г. Москва, ул. Ленина, 5",
    };
    const out = personToFields(person, "owner", t!.fields);
    expect(out.owner_fio).toBe("Иванов Иван Иванович");
    expect(out.owner_passport).toBe("4510 123456");
    expect(out.owner_address).toBe("г. Москва, ул. Ленина, 5");

    const back = roleToPerson(out, "owner", t!.fields);
    expect(back.passport_series).toBe("4510");
    expect(back.passport_number).toBe("123456");
  });

  it("«Сохранённые лица»: полный цикл для Представителя (совмещённый паспорт)", () => {
    // 1) как savePerson: роль → сохраняемая карточка лица
    const formValues = {
      agent_fio: "Петров Пётр Петрович",
      agent_passport: "4510 123456",
      agent_address: "г. Москва, ул. Петрова, 1",
    };
    const saved = roleToPerson(formValues, "agent", t!.fields);
    expect(saved.fio).toBe("Петров Пётр Петрович");
    expect(saved.passport_series).toBe("4510");
    expect(saved.passport_number).toBe("123456");
    expect(saved.address).toBe("г. Москва, ул. Петрова, 1");

    // 2) как applyPersonToRole: карточка → обратно в поля формы
    const pairs = personToFields(
      {
        fio: saved.fio,
        birthday: "",
        phone: "",
        passport_series: saved.passport_series || "",
        passport_number: saved.passport_number || "",
        passport_issued_by: saved.passport_issued_by || "",
        passport_code: saved.passport_code || "",
        address: saved.address || "",
      },
      "agent",
      t!.fields
    );
    expect(pairs.agent_fio).toBe("Петров Пётр Петрович");
    expect(pairs.agent_passport).toBe("4510 123456");
    expect(pairs.agent_address).toBe("г. Москва, ул. Петрова, 1");
  });
});

describe("сканер: плитка ВУ только для реальных водителей (все шаблоны)", () => {
  it("ни один шаблон не показывает ВУ для не-waterительской роли", () => {
    const problems: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      const roles = getTemplateRoles(t);
      const driverPrefixes = new Set(
        roles.filter((r) => ROLE_REGISTRY[r.prefix]?.isDriver).map((r) => r.prefix)
      );
      for (const s of getDocRequirements(t)) {
        if (
          s.id.startsWith("vuc_") &&
          s.rolePrefix &&
          !driverPrefixes.has(s.rolePrefix)
        ) {
          problems.push(`${t.id}: ВУ для нероли-водителя ${s.rolePrefix}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("signingMeta согласован с шаблонами (все шаблоны)", () => {
  it("каждый signer указывает на существующее поле шаблона", () => {
    const problems: string[] = [];
    for (const [id, meta] of Object.entries(SIGNING_META)) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id);
      if (!t) {
        problems.push(`${id}: signingMeta ссылается на несуществующий шаблон`);
        continue;
      }
      const fieldIds = new Set(t.fields.map((f) => f.id));
      for (const s of meta.signers) {
        if (!fieldIds.has(s.fieldId)) {
          problems.push(`${id}: signer.fieldId ${s.fieldId} отсутствует в шаблоне`);
        }
        // Роль должна быть осмысленной (не плейсholder X_ и не пустая).
        if (!s.role || /^X_/.test(s.role)) {
          problems.push(`${id}: signer ${s.fieldId} имеет пустую/служебную роль`);
        }
      }
    }
    if (problems.length) {
      // Полный список — в выводе теста, чтобы аудит был виден.
      console.log("signingMeta problems:\n" + problems.join("\n"));
    }
    expect(problems).toEqual([]);
  });
});

describe("композиция лейблов формы из реестра (Вариант 1)", () => {
  it("все opt-in шаблоны из ROLE_COMPOSE_TEMPLATES реально существуют", () => {
    const ids = new Set(LEGAL_TEMPLATES.map((t) => t.id));
    const missing = [...ROLE_COMPOSE_TEMPLATES].filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });

  it("power-of-attorney-auto: лейблы и заголовки секций из реестра", () => {
    const tpl = "power-of-attorney-auto";
    expect(resolveFieldLabel(tpl, mkField("owner_fio", "старый"))).toBe(
      "ФИО Доверителя"
    );
    expect(resolveFieldLabel(tpl, mkField("agent_fio", "старый"))).toBe(
      "ФИО Представителя"
    );
    expect(resolveFieldLabel(tpl, mkField("agent_passport", "старый"))).toBe(
      "Паспорт Представителя"
    );
    expect(resolveFieldLabel(tpl, mkField("owner_address", "старый"))).toBe(
      "Адрес Доверителя"
    );
    // не-ролевое поле остаётся статичным
    expect(resolveFieldLabel(tpl, mkField("car_vin", "VIN"))).toBe("VIN");
    // заголовки секций
    expect(tabRoleLabel(tpl, "owner", "Владелец")).toBe("Доверитель");
    expect(tabRoleLabel(tpl, "agent", "Агент")).toBe("Представитель");
    expect(tabRoleLabel(tpl, "vehicle", "Транспортное средство")).toBe(
      "Транспортное средство"
    );
  });

  it("тело документа power-of-attorney-auto больше не содержит «Доверенное лицо»", () => {
    const t = LEGAL_TEMPLATES.find((x) => x.id === "power-of-attorney-auto")!;
    const preview = TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate ?? "";
    expect(preview).not.toContain("Доверенное лицо");
    expect(preview).toContain("Представитель");
  });

  it("для каждого opt-in шаблона ролевые поля компонуются в непустую строку", () => {
    const problems: string[] = [];
    for (const id of ROLE_COMPOSE_TEMPLATES) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id);
      if (!t) continue;
      for (const f of t.fields) {
        const lbl = resolveFieldLabel(id, f);
        if (!lbl || lbl.trim().length === 0) {
          problems.push(`${id}: пустой лейбл у поля ${f.id}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("композиция не порождает дубликатов и мусора (только изменённые лейблы)", () => {
    const problems: string[] = [];
    for (const id of ROLE_COMPOSE_TEMPLATES) {
      const t = LEGAL_TEMPLATES.find((x) => x.id === id);
      if (!t) continue;
      const composed = t.fields
        .map((f) => ({
          id: f.id,
          staticLabel: f.label,
          composed: resolveFieldLabel(id, f),
        }))
        .filter((x) => x.composed !== x.staticLabel)
        .map((x) => x.composed);
      const seen = new Set<string>();
      for (const lb of composed) {
        if (seen.has(lb))
          problems.push(`${id}: дубликат сгенерированного лейбла «${lb}»`);
        seen.add(lb);
        if (/Прочее/.test(lb))
          problems.push(`${id}: мусорный лейбл «Прочее…» (поле)`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("dkp-auto: ключевые ролевые лейблы из реестра, car_* статичны", () => {
    const id = "dkp-auto";
    expect(resolveFieldLabel(id, mkField("seller_fio", "x"))).toBe("ФИО Продавца");
    expect(resolveFieldLabel(id, mkField("buyer_fio", "x"))).toBe("ФИО Покупателя");
    expect(
      resolveFieldLabel(id, mkField("seller_passport_series", "x"))
    ).toBe("Серия паспорта Продавца");
    // ИНН организации / ИП остаются авторскими (не сливаются в «ИНН Продавца»)
    const orgInn = LEGAL_TEMPLATES.find((x) => x.id === id)!.fields.find(
      (f) => f.id === "seller_org_inn"
    )!;
    expect(resolveFieldLabel(id, orgInn)).toBe(orgInn.label);
    // не-ролевое поле остаётся статичным
    expect(resolveFieldLabel(id, mkField("car_vin", "VIN"))).toBe("VIN");
  });

  it("rental-auto: Владелец/Арендатор из реестра", () => {
    const id = "rental-auto";
    expect(resolveFieldLabel(id, mkField("owner_fio", "x"))).toBe("ФИО Владельца");
    expect(resolveFieldLabel(id, mkField("tenant_fio", "x"))).toBe(
      "ФИО Арендатора"
    );
    expect(resolveFieldLabel(id, mkField("owner_passport", "x"))).toBe(
      "Паспорт Владельца"
    );
  });
});

