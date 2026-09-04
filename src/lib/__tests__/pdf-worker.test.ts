import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";

/**
 * Тесты для логики, которая вызывается из pdf.worker.ts.
 * Сам Worker не запускаем в unit-тестах (нужен браузер/Playwright);
 * проверяем инварианты, которые worker должен соблюдать: копирование страниц,
 * embedPng/embedJpg, сохранение в ArrayBuffer.
 */
describe("pdf worker invariants", () => {
  it("PDFDocument.create + copyPages → сохраняемый ArrayBuffer", async () => {
    // Создаём исходный PDF с 3 страницами
    const src = await PDFDocument.create();
    src.addPage([200, 200]);
    src.addPage([300, 300]);
    src.addPage([400, 400]);
    const srcBytes = await src.save();

    // Копируем страницы (как делает worker в handleMerge)
    const out = await PDFDocument.create();
    const loaded = await PDFDocument.load(srcBytes);
    const pages = await out.copyPages(loaded, loaded.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    const saved = await out.save({ useObjectStreams: true });

    // Uint8Array → ArrayBuffer как в воркере
    const ab = saved.buffer.slice(
      saved.byteOffset,
      saved.byteOffset + saved.byteLength
    ) as ArrayBuffer;
    expect(ab).toBeInstanceOf(ArrayBuffer);
    expect(ab.byteLength).toBeGreaterThan(0);

    // Проверяем, что выходной PDF можно загрузить и в нём 3 страницы
    const verify = await PDFDocument.load(ab);
    expect(verify.getPageCount()).toBe(3);
    expect(verify.getPage(0).getWidth()).toBeCloseTo(200, 1);
    expect(verify.getPage(1).getWidth()).toBeCloseTo(300, 1);
    expect(verify.getPage(2).getWidth()).toBeCloseTo(400, 1);
  });

  it("embedPng: минимальный PNG → PDF", async () => {
    // 1x1 PNG (красный пиксель)
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x5b, 0x9b, 0xa2, 0x4e, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const out = await PDFDocument.create();
    const pngEmbed = await out.embedPng(png);
    const page = out.addPage([100, 100]);
    page.drawImage(pngEmbed, { x: 0, y: 0, width: 50, height: 50 });
    const saved = await out.save();
    const verify = await PDFDocument.load(saved);
    expect(verify.getPageCount()).toBe(1);
  });

  it("copyPages: одна страница → одна страница", async () => {
    const src = await PDFDocument.create();
    src.addPage([200, 200]);
    const srcBytes = await src.save();
    const out = await PDFDocument.create();
    const loaded = await PDFDocument.load(srcBytes);
    const pages = await out.copyPages(loaded, loaded.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    const saved = await out.save();
    const verify = await PDFDocument.load(saved);
    expect(verify.getPageCount()).toBe(1);
  });
});
