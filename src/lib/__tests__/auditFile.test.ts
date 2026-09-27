import { describe, expect, it } from "vitest";
import {
  AUDIT_FILE_ACCEPT,
  AUDIT_FILE_MAX_BYTES,
  auditFileKind,
  looksLikeText,
  normalizeText,
  rtfToText,
  unsupportedFileHint,
} from "@/lib/ai/auditFile";

describe("auditFile: определение формата", () => {
  it("по расширению", () => {
    expect(auditFileKind({ name: "dogovor.pdf" })).toBe("pdf");
    expect(auditFileKind({ name: "dogovor.docx" })).toBe("docx");
    expect(auditFileKind({ name: "scan.JPG" })).toBe("image");
    expect(auditFileKind({ name: "notes.txt" })).toBe("text");
    expect(auditFileKind({ name: "page.html" })).toBe("html");
    expect(auditFileKind({ name: "archive.zip" })).toBe("unknown");
  });

  it("по MIME, когда расширения нет", () => {
    expect(auditFileKind({ name: "photo", type: "image/png" })).toBe("image");
    expect(auditFileKind({ name: "doc", type: "application/pdf" })).toBe("pdf");
    expect(auditFileKind({ name: "readme", type: "text/plain" })).toBe("text");
    expect(auditFileKind({ name: "bin", type: "application/octet-stream" })).toBe("unknown");
  });

  it("accept-строка содержит ключевые форматы", () => {
    expect(AUDIT_FILE_ACCEPT).toContain(".pdf");
    expect(AUDIT_FILE_ACCEPT).toContain(".docx");
    expect(AUDIT_FILE_ACCEPT).toContain("image/*");
  });

  it("лимит файла — 20 МБ", () => {
    expect(AUDIT_FILE_MAX_BYTES).toBe(20 * 1024 * 1024);
  });
});

describe("auditFile: нормализация и эвристики", () => {
  it("normalizeText: единые переводы строк, без пустых хвостов", () => {
    expect(normalizeText("a  b\r\n\r\n\r\nc")).toBe("a b\n\nc");
    expect(normalizeText("  текст  ")).toBe("текст");
    expect(normalizeText("x\u0000y")).toBe("xy");
  });

  it("looksLikeText: текст — да, бинарник — нет", () => {
    expect(looksLikeText("Договор аренды № 1 от 01.01.2026")).toBe(true);
    expect(looksLikeText("\u0000\u0001\u0002\u0000binary")).toBe(false);
    expect(looksLikeText("")).toBe(false);
  });
});

describe("auditFile: RTF", () => {
  it("убирает разметку и декодирует cp1251", () => {
    expect(rtfToText("{\\rtf1\\ansi Привет\\par Мир}")).toBe("Привет\nМир");
    expect(rtfToText("\\'cf\\'f0\\'e8\\'e2\\'e5\\'f2")).toBe("Привет");
  });

  it("декодирует Unicode-escape \\uN", () => {
    expect(rtfToText("\\u1055?\\u1088?\\u1080?")).toBe("При");
  });
});

describe("auditFile: подсказки по форматам", () => {
  it("для .doc советует сохранить как docx/pdf", () => {
    expect(unsupportedFileHint("stary.doc")).toMatch(/Word/i);
    expect(unsupportedFileHint("stary.doc")).toMatch(/docx/i);
  });

  it("для неизвестного — общая подсказка", () => {
    expect(unsupportedFileHint("file.xyz")).toMatch(/не поддерживается/i);
  });
});
