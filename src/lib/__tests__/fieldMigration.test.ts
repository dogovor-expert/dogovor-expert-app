import { describe, it, expect } from "vitest";
import { migrateFieldValues } from "@/lib/fieldMigration";
import type { LegalTemplate, TemplateField } from "@/data/types";

const f = (id: string, type: TemplateField["type"] = "text"): TemplateField => ({
  id,
  label: id,
  type,
  defaultValue: "",
  category: "seller",
});

const tpl = (id: string, fields: TemplateField[]): LegalTemplate => ({
  id,
  name: id,
  category: "auto",
  description: "",
  lastUpdated: "2026",
  actSource: "",
  suggestedDocs: [],
  fields,
  previewTemplate: "",
});

describe("migrateFieldValues: точное совпадение id", () => {
  it("копирует значения с тем же id", () => {
    const prev = tpl("a", [f("seller_inn"), f("seller_fio")]);
    const next = tpl("b", [f("seller_inn"), f("seller_fio")]);
    const prevValues = { seller_inn: "7707083893", seller_fio: "Иванов" };
    const r = migrateFieldValues(prevValues, prev, next);
    expect(r.migratedIds).toContain("seller_inn");
    expect(r.migratedIds).toContain("seller_fio");
    expect(r.values.seller_inn).toBe("7707083893");
    expect(r.values.seller_fio).toBe("Иванов");
  });
});

describe("migrateFieldValues: роль+тип миграция (внутри одной роли)", () => {
  it("seller_inn переносится при совпадении роли и типа", () => {
    const prev = tpl("a", [f("seller_inn")]);
    const next = tpl("b", [f("seller_inn"), f("seller_fio")]);
    const r = migrateFieldValues({ seller_inn: "7707083893" }, prev, next);
    expect(r.values.seller_inn).toBe("7707083893");
  });
});

describe("migrateFieldValues: НЕ мигрирует между разными ролями", () => {
  it("seller_inn НЕ копируется в buyer_inn (разные стороны)", () => {
    const prev = tpl("a", [f("seller_inn")]);
    const next = tpl("b", [f("buyer_inn")]);
    const r = migrateFieldValues({ seller_inn: "7707083893" }, prev, next);
    expect(r.migratedIds).not.toContain("buyer_inn");
    expect(r.values.buyer_inn).toBeUndefined();
  });

  it("owner_phone НЕ копируется в tenant_phone", () => {
    const prev = tpl("a", [f("owner_phone")]);
    const next = tpl("b", [f("tenant_phone")]);
    const r = migrateFieldValues({ owner_phone: "+7 925 123-45-67" }, prev, next);
    expect(r.migratedIds).not.toContain("tenant_phone");
  });
});

describe("migrateFieldValues: не переносит пустые", () => {
  it("seller_inn = '' → seller_inn остаётся пустым", () => {
    const prev = tpl("a", [f("seller_inn")]);
    const next = tpl("b", [f("seller_inn")]);
    const r = migrateFieldValues({ seller_inn: "" }, prev, next);
    expect(r.values.seller_inn).toBeUndefined();
  });
});

describe("migrateFieldValues: разные типы не мигрируют", () => {
  it("seller_inn НЕ → seller_phone", () => {
    const prev = tpl("a", [f("seller_inn")]);
    const next = tpl("b", [f("seller_phone")]);
    const r = migrateFieldValues({ seller_inn: "123" }, prev, next);
    expect(r.migratedIds).not.toContain("seller_phone");
  });
});

describe("migrateFieldValues: signer_* (вложенная роль)", () => {
  it("seller_signer_fio → buyer_signer_fio (разные стороны, signer-роль)", () => {
    const prev = tpl("a", [f("seller_signer_fio")]);
    const next = tpl("b", [f("buyer_signer_fio")]);
    const r = migrateFieldValues({ seller_signer_fio: "Петров П.П." }, prev, next);
    // signer_* — это sub-роль, signer_fio — тип; разные signers у разных
    // сторон (seller_signer vs buyer_signer) — НЕ переносим.
    expect(r.migratedIds).not.toContain("buyer_signer_fio");
  });
});

describe("migrateFieldValues: contract_* поля без роли", () => {
  it("contract_price переносится по id (точное совпадение)", () => {
    const prev = tpl("a", [f("contract_price", "number")]);
    const next = tpl("b", [f("contract_price", "number")]);
    const r = migrateFieldValues({ contract_price: "1000000" }, prev, next);
    expect(r.values.contract_price).toBe("1000000");
  });
});

describe("migrateFieldValues: totalFields", () => {
  it("возвращает totalNextFields", () => {
    const prev = tpl("a", [f("a"), f("b")]);
    const next = tpl("b", [f("a"), f("b"), f("c"), f("d")]);
    const r = migrateFieldValues({ a: "x" }, prev, next);
    expect(r.totalNextFields).toBe(4);
  });
});
