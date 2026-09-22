import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { embedCms, preparePAdESPlaceholder } from "@/lib/embedPades";

/**
 * Контракт embedCms: длина CMS должна ТОЧНО совпадать с зарезервированным
 * Contents. Если вставить подпись другой длины, изменится размер файла и
 * позиции ByteRange — подпись станет невалидной. Эти тесты фиксируют контракт
 * и качество диагностики (раньше ошибка была невнятной).
 */
async function makePdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  return new Uint8Array(await pdf.save());
}

describe("embedCms — контракт длины плейсхолдера", () => {
  it("при точном совпадении длина файла сохраняется", async () => {
    const raw = await makePdf();
    const { placeholder } = await preparePAdESPlaceholder(raw, 128, {
      signerName: "Test",
      signingDate: new Date(),
    });
    const signed = embedCms(placeholder, "AB".repeat(64)); // 128 hex
    expect(signed.length).toBe(placeholder.length);
  });

  it("при несовпадении длины ошибка сообщает оба размера", async () => {
    const raw = await makePdf();
    const { placeholder } = await preparePAdESPlaceholder(raw, 128, {
      signerName: "Test",
      signingDate: new Date(),
    });
    // CMS короче резерва → вставлять нельзя (поедет ByteRange).
    expect(() => embedCms(placeholder, "AB".repeat(32))).toThrow(/128/);
  });

  it("preparePAdESPlaceholder возвращает signedContent без зазора под CMS", async () => {
    const raw = await makePdf();
    const { placeholder, signedContent } = await preparePAdESPlaceholder(raw, 128, {
      signerName: "Test",
      signingDate: new Date(),
    });
    // signedContent = файл минус зазор под CMS → он короче плейсхолдера.
    expect(signedContent.length).toBe(placeholder.length - 130);
  });
});
