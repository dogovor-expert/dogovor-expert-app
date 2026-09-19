import { describe, it, expect } from "vitest";
import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFDict, PDFRef } from "pdf-lib";

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

  it("compress-inplace: подмена image-стрима под той же ссылкой не ломает PDF", async () => {
    // Собираем PDF с embedded JPEG (как делает handleCompress при пережатии).
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
      0x00, 0x80, 0x37, 0x92, 0x0a, 0x4a, 0x26, 0x49, 0xa5, 0x80, 0xbf, 0x45,
      0x53, 0xd9, 0x22, 0x30, 0x45, 0x06, 0x0a, 0x87, 0x52, 0x6b, 0x7a, 0x21,
      0x36, 0xd9, 0x22, 0xed, 0x28, 0x8b, 0x87, 0xc8, 0xd5, 0x99, 0xc3, 0xdb,
      0x2e, 0xaf, 0xa5, 0x3e, 0x8a, 0x7b, 0x4c, 0xf9, 0x0f, 0x6e, 0x35, 0xdd,
      0x1e, 0x78, 0x9a, 0x83, 0xff, 0xd9,
    ]);
    const src = await PDFDocument.create();
    const img = await src.embedJpg(jpeg);
    const page = src.addPage([100, 100]);
    page.drawImage(img, { x: 0, y: 0, width: 100, height: 100 });
    const srcBytes = await src.save();

    // Загружаем и находим image-стрим (Subtype=Image, DCTDecode).
    const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true, updateMetadata: false });
    const context = doc.context;
    const targets = context.enumerateIndirectObjects().filter(
      (entry): entry is [PDFRef, PDFRawStream] =>
        entry[1] instanceof PDFRawStream &&
        entry[1].dict.lookup(PDFName.of("Subtype")) === PDFName.of("Image")
    );
    expect(targets.length).toBe(1);
    const [ref, stream] = targets[0];

    // Имитируем замену потока меньшим JPEG под той же ссылкой.
    const newDict = PDFDict.withContext(context);
    for (const [k, v] of stream.dict.entries()) {
      if (k === PDFName.of("Length")) continue;
      if (k === PDFName.of("Filter") || k === PDFName.of("DecodeParms")) continue;
      if (k === PDFName.of("Width") || k === PDFName.of("Height")) continue;
      newDict.set(k, v);
    }
    newDict.set(PDFName.of("Width"), PDFNumber.of(1));
    newDict.set(PDFName.of("Height"), PDFNumber.of(1));
    newDict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
    newDict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
    newDict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
    context.assign(ref, PDFRawStream.of(newDict, jpeg));

    const saved = await doc.save({ useObjectStreams: true });
    const verify = await PDFDocument.load(saved);
    expect(verify.getPageCount()).toBe(1);
    // Текстовая интерпретация уцелела: у страницы есть объект /XObject.
    const pageObj = verify.getPage(0);
    expect(pageObj.getWidth()).toBeCloseTo(100, 1);
    expect(verify.context.enumerateIndirectObjects().filter(
      ([, o]) => o instanceof PDFRawStream && o.dict.lookup(PDFName.of("Subtype")) === PDFName.of("Image")
    ).length).toBe(1);
  });
});
