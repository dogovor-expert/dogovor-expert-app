import { describe, expect, it } from "vitest";
import { buildDiffReport } from "@/lib/diff";
import {
  EMPTY_PROTOCOL_META,
  buildProtocolRows,
  protocolFilename,
  protocolHtml,
  protocolTitle,
} from "@/lib/protocol";

const base = "1. Оплата в течение 5 дней.\n2. Срок — 30 дней.";

describe("buildProtocolRows", () => {
  it("из изменений строит строки с номером пункта и нашей редакцией", () => {
    const r = buildDiffReport(
      base,
      "1. Оплата в течение 10 дней.\n2. Срок — 30 дней."
    );
    const rows = buildProtocolRows(r.changes);
    expect(rows).toHaveLength(1);
    expect(rows[0].clause).toBe("1");
    expect(rows[0].ours).toContain("5 дней");
    expect(rows[0].theirs).toContain("10 дней");
    expect(rows[0].agreed).toContain("5 дней");
    expect(rows[0].critical).toBe(false);
  });

  it("добавленный пункт → согласованная редакция пуста (исключить)", () => {
    const r = buildDiffReport(base, `${base}\n3. Новый пункт.`);
    const rows = buildProtocolRows(r.changes);
    expect(rows[0].clause).toBe("3");
    expect(rows[0].agreed).toBe("");
  });

  it("удалённый пункт помечается критичным", () => {
    const r = buildDiffReport(`${base}\n3. Лишний пункт.`, base);
    const rows = buildProtocolRows(r.changes);
    expect(rows[0].critical).toBe(true);
    expect(rows[0].agreed).toContain("Лишний");
  });
});

describe("protocolTitle / protocolFilename", () => {
  const meta = {
    ...EMPTY_PROTOCOL_META,
    contractKind: "поставки",
    contractNumber: "12/2026",
  };

  it("заголовок грамматически корректен", () => {
    expect(protocolTitle(meta)).toBe(
      "Протокол разногласий к договору поставки № 12/2026"
    );
  });

  it("без типа и номера — просто «к договору»", () => {
    expect(protocolTitle(EMPTY_PROTOCOL_META)).toBe(
      "Протокол разногласий к договору"
    );
  });

  it("имя файла безопасно", () => {
    const f = protocolFilename(meta);
    expect(f).toMatch(/^[a-z0-9-]+$/);
    expect(f).toContain("protokol-raznoglasij");
  });
});

describe("protocolHtml", () => {
  it("содержит таблицу, стороны и согласованные редакции", () => {
    const r = buildDiffReport(
      base,
      "1. Оплата в течение 10 дней.\n2. Срок — 30 дней."
    );
    const html = protocolHtml({
      meta: {
        ...EMPTY_PROTOCOL_META,
        party1: "ООО «Альфа»",
        party2: "ИП Петров",
        city: "Москва",
        date: "22.09.2026",
      },
      rows: buildProtocolRows(r.changes),
    });
    expect(html).toContain("<table>");
    expect(html).toContain("ПРОТОКОЛ РАЗНОГЛАСИЙ");
    expect(html).toContain("ООО «Альфа»");
    expect(html).toContain("ИП Петров");
    expect(html).toContain("Москва");
    expect(html).toContain("Согласованная редакция");
  });

  it("экранирует HTML из пользовательских данных", () => {
    const html = protocolHtml({
      meta: { ...EMPTY_PROTOCOL_META, party1: "<script>alert(1)</script>" },
      rows: [
        { clause: "1", ours: "a<b", theirs: "", agreed: "", critical: false },
      ],
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a&lt;b");
  });

  it("пустая согласованная редакция → «Пункт исключить»", () => {
    const html = protocolHtml({
      meta: EMPTY_PROTOCOL_META,
      rows: [
        { clause: "1", ours: "x", theirs: "y", agreed: "", critical: false },
      ],
    });
    expect(html).toContain("Пункт исключить");
  });
});
