// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSaveAs, resolveSaveAs } from "@/lib/download";

const saveAsMock = vi.fn();

// Шпионим за реальным file-saver, сохраняя его именованные экспорты:
// под vite/vitest они есть (CJS pre-bundle), под webpack — только default,
// и именно этот случай покрывают чистые тесты resolveSaveAs ниже.
vi.mock("file-saver", async (importOriginal) => {
  const actual = await importOriginal<typeof import("file-saver")>();
  return { ...actual, saveAs: saveAsMock };
});

vi.mock("@/lib/exportPdf", () => ({
  buildPdf: async () => ({
    blob: new Blob(["fake-pdf"], { type: "application/pdf" }),
    pageCount: 1,
  }),
}));

describe("resolveSaveAs", () => {
  it("берёт именованный экспорт (ESM-форма)", () => {
    const fn: (blob: Blob, filename?: string) => void = () => {};
    expect(resolveSaveAs({ saveAs: fn })).toBe(fn);
  });
  it("берёт default-функцию (CJS module.exports = fn)", () => {
    const fn: (blob: Blob, filename?: string) => void = () => {};
    expect(resolveSaveAs({ default: fn })).toBe(fn);
  });
  it("берёт default.saveAs (webpack-форма UMD: только default, без именованных)", () => {
    const fn: (blob: Blob, filename?: string) => void = () => {};
    expect(resolveSaveAs({ default: { saveAs: fn } })).toBe(fn);
  });
  it("возвращает undefined, если saveAs нет нигде", () => {
    expect(resolveSaveAs({})).toBeUndefined();
  });
});

describe("loadSaveAs + downloadChatPdf (проводка)", () => {
  beforeEach(() => saveAsMock.mockClear());
  it("loadSaveAs возвращает вызываемую функцию", async () => {
    const fn = await loadSaveAs();
    expect(typeof fn).toBe("function");
  });
  it("downloadChatPdf скачивает PDF через резолвленный saveAs", async () => {
    const { downloadChatPdf } = await import("@/lib/ai/chatExport");
    await downloadChatPdf("<div><p>hi</p></div>", "test-doc");
    expect(saveAsMock).toHaveBeenCalledTimes(1);
    const [blob, name] = saveAsMock.mock.calls[0] as [Blob, string];
    expect(blob).toBeInstanceOf(Blob);
    expect(name).toBe("test-doc.pdf");
  });
});
