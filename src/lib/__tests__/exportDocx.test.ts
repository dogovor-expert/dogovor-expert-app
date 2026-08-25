import { describe, it, expect } from "vitest";
import { parseHtmlToDocx, alignFrom } from "@/lib/exportDocx";
import { AlignmentType } from "docx";

function isTable(el: unknown): boolean {
  const e = el as { rootKey?: string; constructor?: { name?: string } };
  return e.rootKey === "table" || e.constructor?.name === "Table";
}

function mkEl(cls: string): HTMLElement {
  const d = document.createElement("div");
  d.className = cls;
  return d;
}

describe("DOCX parity: выравнивание (alignFrom)", () => {
  it("text-justify → JUSTIFIED, text-center → CENTER, text-right → RIGHT", () => {
    expect(alignFrom(mkEl("text-justify"))).toBe(AlignmentType.JUSTIFIED);
    expect(alignFrom(mkEl("text-center"))).toBe(AlignmentType.CENTER);
    expect(alignFrom(mkEl("text-right"))).toBe(AlignmentType.RIGHT);
  });

  it("без класса выравнивания → undefined (по умолчанию влево)", () => {
    expect(alignFrom(mkEl("font-bold"))).toBeUndefined();
    expect(alignFrom(mkEl("text-left"))).toBeUndefined();
  });
});

describe("DOCX parity: структура документа", () => {
  it("абзацы и таблицы корректно разбираются", () => {
    const html =
      '<div class="text-justify">Текст</div>' +
      "<table><thead><tr><th>Колонка</th></tr></thead>" +
      "<tbody><tr><td>значение</td></tr></tbody></table>";
    const els = parseHtmlToDocx(html);
    expect(els.some(isTable)).toBe(true);
    expect(els.length).toBeGreaterThanOrEqual(2);
  });

  it("жирный заголовок (font-bold) не ломает разбор", () => {
    const paras = parseHtmlToDocx('<div class="font-bold uppercase text-black mb-2">Заголовок</div>');
    expect(paras.length).toBeGreaterThanOrEqual(1);
  });
});
