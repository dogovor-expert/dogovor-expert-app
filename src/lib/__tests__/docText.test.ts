import { describe, expect, it } from "vitest";
import {
  docExt,
  htmlToText,
  isSupportedDocFile,
  SUPPORTED_DOC_EXT,
} from "@/lib/docText";

const fakeFile = (name: string) => ({ name } as File);

describe("docExt", () => {
  it("возвращает расширение в нижнем регистре", () => {
    expect(docExt("Договор.DOCX")).toBe(".docx");
    expect(docExt("скан.pdf")).toBe(".pdf");
    expect(docExt("без-расширения")).toBe("");
  });
});

describe("isSupportedDocFile", () => {
  it("распознаёт поддерживаемые форматы", () => {
    expect(isSupportedDocFile(fakeFile("a.docx"))).toBe(true);
    expect(isSupportedDocFile(fakeFile("a.PDF"))).toBe(true);
    expect(isSupportedDocFile(fakeFile("a.txt"))).toBe(true);
    expect(isSupportedDocFile(fakeFile("a.md"))).toBe(true);
  });

  it("отклоняет прочие форматы", () => {
    expect(isSupportedDocFile(fakeFile("a.jpg"))).toBe(false);
    expect(isSupportedDocFile(fakeFile("a"))).toBe(false);
  });

  it("список расширений не пуст", () => {
    expect(SUPPORTED_DOC_EXT.length).toBeGreaterThanOrEqual(4);
  });
});

describe("htmlToText", () => {
  it("превращает абзацы в строки", () => {
    expect(htmlToText("<p>Привет</p><p>Мир</p>")).toBe("Привет\nМир");
  });

  it("списки сохраняют маркеры", () => {
    expect(htmlToText("<ul><li>Раз</li><li>Два</li></ul>")).toBe(
      "• Раз\n• Два"
    );
  });

  it("декодирует сущности", () => {
    expect(htmlToText("&amp; &laquo;тест&raquo;")).toBe("& «тест»");
  });

  it("схлопывает множество пустых абзацев до одного разделителя", () => {
    expect(htmlToText("<p>А</p><p></p><p></p><p></p><p>Б</p>")).toBe("А\n\nБ");
  });
});
