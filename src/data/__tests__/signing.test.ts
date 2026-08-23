import { describe, it, expect } from "vitest";
import { LEGAL_TEMPLATES } from "../templates";
import { SIGNING_META, getSigning, canShowSignSheet } from "../signingMeta";

describe("signingMeta (аудит №1)", () => {
  it("каждый шаблон имеет запись метаданных", () => {
    const missing = LEGAL_TEMPLATES.filter((t) => !SIGNING_META[t.id]);
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it("лист подписания доступен только классу E", () => {
    for (const t of LEGAL_TEMPLATES) {
      const meta = getSigning(t.id);
      if (meta.signingClass === "E") {
        expect(canShowSignSheet(t.id), t.id).toBe(true);
      } else {
        expect(canShowSignSheet(t.id), t.id).toBe(false);
      }
    }
    // Классы B и C не должны получать лист подписания даже случайно.
    const bc = LEGAL_TEMPLATES.filter(
      (t) => getSigning(t.id).signingClass === "B" || getSigning(t.id).signingClass === "C"
    );
    expect(bc.length).toBeGreaterThan(0);
    for (const t of bc) expect(canShowSignSheet(t.id)).toBe(false);
  });

  it("у каждого шаблона класса E заполнены подписанты с существующими полями", () => {
    const problems: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      const meta = getSigning(t.id);
      if (meta.signingClass !== "E") continue;
      if (!meta.signers.length) problems.push(`${t.id}: нет подписантов`);
      const ids = new Set(t.fields.map((f) => f.id));
      for (const s of meta.signers) {
        if (!s.role) problems.push(`${t.id}: пустая роль у ${s.fieldId}`);
        if (!ids.has(s.fieldId)) problems.push(`${t.id}: поле ${s.fieldId} не существует`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("роли подписей соответствуют типу документа (нет утечки чужих ролей)", () => {
    // «Продавец/Покупатель» допустимы только в документах купли-продажи
    // и сделочно-сопроводительных (задаток, аванс, выкуп, опцион, УПД…);
    // это ловит повторение бага с захардкоженными ролями в претензиях/аренде.
    const saleRe = /купл|продаж|дкп|trade-in|комиссионн|buyout|выкуп|задатк|аванс|avansa|zadatka|опцион|option|raspiska-money|auto-condition-act|upd|передаточн/i;
    const problems: string[] = [];
    for (const t of LEGAL_TEMPLATES) {
      const { signers } = getSigning(t.id);
      for (const s of signers) {
        if (/^продавец/i.test(s.role) && !saleRe.test(t.name + " " + t.id)) {
          problems.push(`${t.id}: роль «${s.role}» в несделочном документе`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
