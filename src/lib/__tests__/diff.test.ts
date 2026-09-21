import { describe, expect, it } from "vitest";
import {
  buildDiffReport,
  clauseNumber,
  diffWords,
  normalizeText,
  splitBlocks,
} from "@/lib/diff";

describe("normalizeText", () => {
  it("убирает \\r и хвостовые пробелы", () => {
    expect(normalizeText("а  \r\nб\t\r\n")).toBe("а\nб");
  });
});

describe("splitBlocks", () => {
  it("режет по пустым строкам", () => {
    expect(splitBlocks("Абзац один.\n\nАбзац два.")).toEqual([
      "Абзац один.",
      "Абзац два.",
    ]);
  });

  it("режет по началу нумерованного пункта", () => {
    expect(
      splitBlocks("1. Первый пункт\n1.1. Подпункт\n2. Второй пункт")
    ).toEqual(["1. Первый пункт", "1.1. Подпункт", "2. Второй пункт"]);
  });

  it("многострочный абзац без нумерации остаётся одним блоком", () => {
    expect(splitBlocks("Первая строка\nвторая строка")).toEqual([
      "Первая строка\nвторая строка",
    ]);
  });
});

describe("clauseNumber", () => {
  it("извлекает номер пункта", () => {
    expect(clauseNumber("2.3. Исполнитель обязан")).toBe("2.3");
    expect(clauseNumber("1) Общие положения")).toBe("1");
  });

  it("возвращает null без номера", () => {
    expect(clauseNumber("Пункт без номера")).toBeNull();
  });
});

describe("diffWords", () => {
  it("находит замену числа и сохраняет общий контекст", () => {
    const segs = diffWords(
      "оплата в течение 5 дней",
      "оплата в течение 10 дней"
    );
    const del = segs
      .filter((s) => s.op === "delete")
      .map((s) => s.text.trim())
      .join("");
    const ins = segs
      .filter((s) => s.op === "insert")
      .map((s) => s.text.trim())
      .join("");
    expect(del).toBe("5");
    expect(ins).toBe("10");
    expect(
      segs.some((s) => s.op === "equal" && s.text.includes("дней"))
    ).toBe(true);
  });

  it("одинаковые строки — только equal", () => {
    const segs = diffWords("текст", "текст");
    expect(segs.every((s) => s.op === "equal")).toBe(true);
  });
});

describe("buildDiffReport", () => {
  const base = "1. Оплата в течение 5 дней.\n2. Срок — 30 дней.";

  it("идентичные редакции → нет изменений", () => {
    const r = buildDiffReport(base, base);
    expect(r.changes).toHaveLength(0);
    expect(r.stats.unchanged).toBe(r.stats.total);
  });

  it("изменённый пункт → changed с пословным диффом", () => {
    const r = buildDiffReport(
      base,
      "1. Оплата в течение 10 дней.\n2. Срок — 30 дней."
    );
    expect(r.stats.changed).toBe(1);
    expect(r.stats.unchanged).toBe(1);
    expect(r.changes[0].kind).toBe("changed");
    expect(r.changes[0].segments?.length).toBeGreaterThan(0);
    expect(r.changes[0].similarity).toBeGreaterThan(0.5);
  });

  it("добавленный пункт → added", () => {
    const r = buildDiffReport(
      base,
      `${base}\n3. Новый пункт о штрафах.`
    );
    expect(r.stats.added).toBe(1);
    expect(r.changes[0].kind).toBe("added");
    expect(r.changes[0].b).toContain("штрафах");
  });

  it("удалённый пункт → removed", () => {
    const r = buildDiffReport(
      `${base}\n3. Лишний пункт.`,
      base
    );
    expect(r.stats.removed).toBe(1);
    expect(r.changes[0].kind).toBe("removed");
    expect(r.changes[0].a).toContain("Лишний");
  });

  it("несколько изменений подряд парируются 1:1", () => {
    const r = buildDiffReport(
      "1. А\n2. Б",
      "1. Аа\n2. Бб"
    );
    expect(r.stats.changed).toBe(2);
  });

  it("статистика согласована", () => {
    const r = buildDiffReport(base, "1. Оплата в течение 10 дней.");
    expect(r.stats.total).toBe(
      r.stats.unchanged + r.stats.added + r.stats.removed + r.stats.changed
    );
  });
});
