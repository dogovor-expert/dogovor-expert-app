import { describe, it, expect } from "vitest";
import { inflateRawSync } from "node:zlib";
import { parseHtmlToDocx, alignFrom, buildDocxDocument } from "@/lib/exportDocx";
import { getDesign, type DesignId } from "@/lib/docDesign";
import { Packer, AlignmentType } from "docx";

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

/** Минимальный ZIP-ридер для DOCX (raw deflate через node:zlib, без зависимостей). */
function getDocumentXml(buf: Uint8Array): string {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const u32 = (o: number) => dv.getUint32(o, true);
  const u16 = (o: number) => dv.getUint16(o, true);
  // EOCD: ищем сигнатуру PK\x05\x06 с конца.
  let eocd = -1;
  for (let o = buf.length - 22; o >= Math.max(0, buf.length - 66000); o--) {
    if (u32(o) === 0x06054b50) { eocd = o; break; }
  }
  expect(eocd).toBeGreaterThanOrEqual(0);
  const cdCount = u16(eocd + 10);
  let cdOff = u32(eocd + 16);
  const dec = new TextDecoder();
  for (let i = 0; i < cdCount; i++) {
    expect(u32(cdOff)).toBe(0x02014b50);
    const fnLen = u16(cdOff + 28);
    const name = dec.decode(buf.subarray(cdOff + 46, cdOff + 46 + fnLen));
    const method = u16(cdOff + 10);
    const compSize = u32(cdOff + 24);
    const localOff = u32(cdOff + 42);
    cdOff += 46 + fnLen + u16(cdOff + 30) + u16(cdOff + 32);
    if (name !== "word/document.xml") continue;
    expect(u32(localOff)).toBe(0x04034b50);
    const lFn = u16(localOff + 26);
    const lEx = u16(localOff + 28);
    const data = buf.subarray(localOff + 30 + lFn + lEx, localOff + 30 + lFn + lEx + compSize);
    const raw = method === 8
      ? inflateRawSync(Buffer.from(data))
      : Buffer.from(data);
    return raw.toString("utf8");
  }
  throw new Error("word/document.xml not found in docx");
}

const SYSTEM_FONTS = new Set(["Calibri", "Times New Roman", "Arial"]);

describe("DOCX: офисный шрифт (officeFamily)", () => {
  it("у всех дизайнов officeFamily — системный шрифт, а не Inter", () => {
    for (const id of ["classic", "minimal", "brand"] as DesignId[]) {
      const fam = getDesign(id).fonts.officeFamily;
      expect(SYSTEM_FONTS.has(fam)).toBe(true);
      expect(fam).not.toBe("Inter");
    }
    expect(getDesign("classic").fonts.officeFamily).toBe("Times New Roman");
    expect(getDesign("brand").fonts.officeFamily).toBe("Calibri");
  });

  it("brand-документ содержит Calibri и не содержит Inter", async () => {
    const doc = await buildDocxDocument(
      '<div class="doc-title">Вопрос</div><div>Ответ юриста</div>',
      { design: "brand" }
    );
    const xml = getDocumentXml(new Uint8Array(await Packer.toBuffer(doc)));
    expect(xml).toContain('w:ascii="Calibri"');
    expect(xml).not.toContain('w:ascii="Inter"');
  });

  it("classic-документ содержит Times New Roman", async () => {
    const doc = await buildDocxDocument("<div>Текст договора</div>", { design: "classic" });
    const xml = getDocumentXml(new Uint8Array(await Packer.toBuffer(doc)));
    expect(xml).toContain('w:ascii="Times New Roman"');
  });
});
