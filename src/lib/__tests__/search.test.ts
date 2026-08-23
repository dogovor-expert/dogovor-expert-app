import { describe, it, expect } from "vitest";
import {
  tokenGroups,
  textMatchesTokens,
  scoreText,
  highlightSegments,
  normalizeText,
  translitRuToLat,
} from "@/lib/search";

describe("normalizeText", () => {
  it("схлопывает дефисы и скобки", () => {
    expect(normalizeText("Договор купли-продажи (ДКП) — авто")).toBe(
      "договор купли продажи дкп авто"
    );
  });

  it("заменяет ё на е", () => {
    expect(normalizeText("Ёжик")).toBe("ежик");
  });
});

describe("translitRuToLat", () => {
  it("транслитерирует ДКП в dkp", () => {
    expect(translitRuToLat("ДКП")).toBe("dkp");
  });
});

describe("tokenGroups", () => {
  it("расширяет синонимы ДКП", () => {
    const groups = tokenGroups("дкп");
    expect(groups[0]).toContain("договор");
    expect(groups[0]).toContain("купли");
  });

  it("расширяет аренда → найм", () => {
    const groups = tokenGroups("аренда");
    expect(groups[0]).toContain("найм");
  });

  it("не смешивает слова запроса", () => {
    const groups = tokenGroups("аренда авто");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toContain("найм");
    expect(groups[1]).toEqual(["авто"]);
  });
});

describe("textMatchesTokens", () => {
  it("находит по синониму дкп", () => {
    expect(
      textMatchesTokens(
        "Договор купли-продажи автомобиля (ДКП)",
        tokenGroups("дкп")
      )
    ).toBe(true);
  });

  it("находит по транслиту dkp", () => {
    expect(
      textMatchesTokens("Договор купли-продажи автомобиля", tokenGroups("dkp"))
    ).toBe(true);
  });

  it("находит по всем словам запроса", () => {
    expect(
      textMatchesTokens(
        "Договор аренды автомобиля без экипажа",
        tokenGroups("аренда авто")
      )
    ).toBe(true);
  });

  it("не находит при отсутствии слов", () => {
    expect(
      textMatchesTokens("Договор дарения", tokenGroups("аренда авто"))
    ).toBe(false);
  });

  it("учитывает падежи (аренда → аренды)", () => {
    expect(
      textMatchesTokens("Договор аренды ТС", tokenGroups("аренда"))
    ).toBe(true);
  });

  it("кириллица находит латиницу (вин → VIN)", () => {
    expect(
      textMatchesTokens("Проверка истории автомобиля по VIN-номеру", tokenGroups("вин"))
    ).toBe(true);
  });

  it("короткие предлоги не матчатся с длинными словами (в → страховка)", () => {
    expect(
      textMatchesTokens("Договор купли-продажи, нажмите сформировать", tokenGroups("осаго"))
    ).toBe(false);
  });
});

describe("scoreText", () => {
  it("точное совпадение имени имеет высший балл", () => {
    const q = "договор купли-продажи";
    const exact = scoreText("Договор купли-продажи автомобиля (ДКП)", tokenGroups(q));
    const partial = scoreText("Акт приёма-передачи", tokenGroups(q));
    expect(exact).toBeGreaterThan(partial);
  });

  it("совпадение в начале имени выше, чем в конце описания", () => {
    const groups = tokenGroups("аренда");
    expect(scoreText("Договор аренды ТС", groups)).toBeGreaterThan(
      scoreText("Расписка при аренде", groups)
    );
  });
});

describe("highlightSegments", () => {
  it("размечает совпадения", () => {
    const segments = highlightSegments("Договор аренды автомобиля", "аренда");
    expect(segments.some((s) => s.hit && s.text === "аренды")).toBe(true);
  });

  it("без запроса возвращает один сегмент", () => {
    const segments = highlightSegments("Текст", "");
    expect(segments).toEqual([{ text: "Текст", hit: false }]);
  });

  it("подсвечивает латиницу по кириллице (вин → VIN)", () => {
    const segments = highlightSegments("Проверка по VIN-номеру", "вин");
    expect(segments.some((s) => s.hit && s.text === "VIN")).toBe(true);
  });
});