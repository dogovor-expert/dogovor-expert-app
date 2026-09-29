/**
 * Регресс-тест экспорта DOCX.
 *
 * История: кнопка «DOC» отдавала new Blob(["\ufeff", html], {type:"application/msword"})
 * с расширением .doc. Это не документ Word — ни OLE2 (.doc), ни OOXML (.docx),
 * а HTML-файл, который Word открывал по запаху. Сайт при этом обещает
 * «2 формата: PDF и DOCX», то есть обещание не выполнялось, а поломка была
 * недетерминированной: файл «просто открывался», поэтому её не замечали.
 *
 * Тест проверяет байты настоящей сборки, а не факт вызова saveAs: сборка
 * отдаёт Blob наружу, поэтому сигнатуру можно проверить честно.
 */
import { describe, it, expect } from "vitest";
import { inflateRawSync } from "node:zlib";
import { buildResumeDocxBlob } from "@/lib/resume/resumeDocx";
import { buildResumeDocHtml } from "@/lib/resume/render";
import { SAMPLE_RESUME, TEMPLATES } from "@/lib/resume/data";
import type { TemplateId } from "@/lib/resume/types";

/** ZIP/OLE2-заголовки: так выглядит файл, который Word не признает. */
const NOT_ZIP = [0xd0, 0xcf, 0x11, 0xe0];

const u16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32 = (b: Uint8Array, o: number) =>
  (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

/**
 * Разбор zip центрального каталога вручную — тем же приёмом, что и
 * src/lib/__tests__/exportDocx.test.ts. adm-zip 0.6.1 не читает вывод
 * docx.js (getEntries() пуст), поэтому зависимость не используется.
 */
function zipEntries(b: Uint8Array): { name: string; read: () => string }[] {
  let eocd = -1;
  for (let i = b.length - 22; i >= 0 && i > b.length - 66000; i--) {
    if (u32(b, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("EOCD not found: это не zip");
  let off = u32(b, eocd + 16);
  const out: { name: string; read: () => string }[] = [];
  while (u32(b, off) === 0x02014b50) {
    const method = u16(b, off + 10);
    const compSize = u32(b, off + 20);
    const fnLen = u16(b, off + 28);
    const exLen = u16(b, off + 30);
    const cmLen = u16(b, off + 32);
    const localOff = u32(b, off + 42);
    const name = new TextDecoder().decode(b.subarray(off + 46, off + 46 + fnLen));
    out.push({
      name,
      read: () => {
        const lFn = u16(b, localOff + 26);
        const lEx = u16(b, localOff + 28);
        const start = localOff + 30 + lFn + lEx;
        const data = b.subarray(start, start + compSize);
        return (method === 8 ? inflateRawSync(Buffer.from(data)) : Buffer.from(data)).toString("utf8");
      },
    });
    off += 46 + fnLen + exLen + cmLen;
  }
  return out;
}

async function docxOf(tpl: TemplateId) {
  const html = buildResumeDocHtml(SAMPLE_RESUME, tpl);
  const blob = await buildResumeDocxBlob(html);
  return new Uint8Array(await blob.arrayBuffer());
}

describe("Экспорт DOCX: файл действительно OOXML, а не HTML с расширением .doc", () => {
  it("все шаблоны дают ZIP-подпись PK\\x03\\x04 и не OLE2", async () => {
    const bad: string[] = [];
    for (const t of TEMPLATES) {
      const b = await docxOf(t.id);
      const isZip = b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
      const isOle = NOT_ZIP.every((v, i) => b[i] === v);
      if (!isZip || isOle) bad.push(`${t.id}: ${Array.from(b.slice(0, 4)).map((x) => x.toString(16)).join(" ")}`);
    }
    expect(bad).toEqual([]);
  });

  it("файл не начинается с BOM и HTML (<!doctype)", async () => {
    const b = await docxOf(TEMPLATES[0].id);
    const headText = String.fromCharCode(...b.slice(0, 16));
    expect(headText.startsWith("\ufeff")).toBe(false);
    expect(headText.toLowerCase().startsWith("<!doc")).toBe(false);
  });

  it("внутри есть обязательные части OOXML", async () => {
    const names = zipEntries(await docxOf(TEMPLATES[0].id)).map((e) => e.name);
    expect(names).toContain("[Content_Types].xml");
    expect(names).toContain("word/document.xml");
  });

  it("у всех шаблонов нет служебных header*.xml / footer*.xml (бренд в шапке убран)", async () => {
    for (const t of TEMPLATES) {
      const names = zipEntries(await docxOf(t.id)).map((e) => e.name);
      const service = names.filter((n) => /header\d*\.xml|footer\d*\.xml/.test(n));
      expect(service, `шаблон ${t.id}`).toEqual([]);
    }
  });

  it("содержимое на месте: текст есть у каждого шаблона", async () => {
    for (const t of TEMPLATES) {
      const entries = zipEntries(await docxOf(t.id));
      const xml = entries.find((e) => e.name === "word/document.xml")!.read();
      const plain = xml.replace(/<[^>]+>/g, "").trim();
      // Имя кандидата обязано попасть в документ, а содержимое не должно
      // молча сократиться: порог ниже минимальной длины SAMPLE_RESUME.
      expect(plain.length, `шаблон ${t.id}`).toBeGreaterThan(1000);
    }
  });

  it("бренд в теле: только атрибуция Dogovor.expert, без устаревшего «по стандартам 2026»", async () => {
    // Осознанное поведение: в 2 шаблонах с layout:"sidebar" в ячейке сайдбара
    // печатается подпись "Dogovor.expert" — атрибуция бесплатного шаблона.
    // Ровно так же, как в PDF-экспорте (resumePdf.ts использует то же поле
    // sideFoot), поэтому PDF и DOCX согласованы.
    // Это НЕ шапка документа: отдельных word/header1.xml/footer1.xml нет,
    // что проверяется выше. Проверка существует, чтобы правка шаблона или
    // дизайн-токена не изменила это молча.
    for (const t of TEMPLATES) {
      const entries = zipEntries(await docxOf(t.id));
      const xml = entries.find((e) => e.name === "word/document.xml")!.read();
      const hits = xml.match(/Dogovor\.expert/g) ?? [];
      const allowed = t.id === "legal-counsel" || t.id === "modern-emerald";
      expect(hits.length, `шаблон ${t.id}`).toBe(allowed ? 1 : 0);
    }
  });

  it("устаревшая подпись «по стандартам 2026» не попадает ни в один документ", async () => {
    // Год в подписи стал бы ложью с 1 января 2027. Проверяем и HTML-экспорт,
    // и собранный DOCX, чтобы фраза не вернулась ни с одной стороны.
    for (const t of TEMPLATES) {
      expect(buildResumeDocHtml(SAMPLE_RESUME, t.id), `html ${t.id}`).not.toContain("по стандартам 2026");
      const entries = zipEntries(await docxOf(t.id));
      const xml = entries.find((e) => e.name === "word/document.xml")!.read();
      expect(xml, `docx ${t.id}`).not.toContain("по стандартам");
    }
  });
});
