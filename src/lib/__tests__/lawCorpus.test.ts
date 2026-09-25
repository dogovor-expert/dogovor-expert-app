import { describe, expect, it } from "vitest";
import {
  LAW_DOCUMENTS,
  assertCompleteness,
  buildArchiveUrl,
  buildCurrentTextUrl,
  buildLawChunks,
  extractArchiveText,
  extractOfficialText,
  sha256,
} from "@/lib/legal/lawCorpus";

/**
 * TextEncoder умеет только UTF-8, а парсер декодирует windows-1251.
 * Для детерминированного теста все не-ASCII символы фикстуры переводим
 * в числовые HTML-сущности: байты становятся чистым ASCII, декодирование
 * windows-1251 идентично, а кириллица восстанавливается decodeHtmlEntities.
 */
function toEntities(input: string): string {
  return [...input].map((ch) => (ch.charCodeAt(0) > 127 ? `&#${ch.charCodeAt(0)};` : ch)).join("");
}

function fixtureDoc(body: string): Uint8Array {
  const html = `<html><body><div id="text_content">${body}</div><div>Футер</div></body></html>`;
  return new TextEncoder().encode(html);
}

describe("law-corpus: происхождение и официальный источник", () => {
  it("базовые НПА: уникальные ND и коды, официальный URL pravo.gov.ru, маркеры полноты", () => {
    const nds = new Set<string>();
    const codes = new Set<string>();
    for (const doc of LAW_DOCUMENTS) {
      expect(nds.has(doc.nd)).toBe(false);
      expect(codes.has(doc.code)).toBe(false);
      nds.add(doc.nd);
      codes.add(doc.code);
      expect(doc.officialSourceUrl).toContain("pravo.gov.ru");
      expect(doc.officialSourceUrl).toContain(doc.nd);
      expect(doc.mustContain.length).toBeGreaterThan(0);
    }
    expect(LAW_DOCUMENTS.length).toBe(7);
  });

  it("buildArchiveUrl ведёт на полный MHTML-архив, а не на обрезанный page=1", () => {
    const url = buildArchiveUrl("102074277");
    expect(url).toContain("savertf=");
    expect(url).toContain("page=all");
    expect(url).not.toContain("doc_itself=");
    // buildCurrentTextUrl оставлен как алиас архива (обратная совместимость).
    expect(buildCurrentTextUrl("102074277")).toBe(url);
  });

  it("assertCompleteness: полный текст проходит, обрезанный (без ст. 12.37) — нет", () => {
    const koap = LAW_DOCUMENTS.find((d) => d.code === "КоАП РФ")!;
    expect(() => assertCompleteness(koap, "Статья 1.1 ... Статья 12.37 ... Статья 32.14.")).not.toThrow();
    expect(() => assertCompleteness(koap, "Статья 1.1 ... Статья 5.67.")).toThrow(/12\.37/);
  });
});

describe("law-corpus: MHTML-архив официального IPS", () => {
  function fixtureArchive(innerHtml: string): Uint8Array {
    const part =
      `Content-Type: text/html; charset="windows-1251"\r\n` +
      `Content-Transfer-Encoding: quoted-printable\r\n\r\n` +
      innerHtml;
    const mhtml =
      `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="----=_TestBoundary"\r\n\r\n` +
      `------=_TestBoundary\r\n${part}\r\n------=_TestBoundary--\r\n`;
    return new TextEncoder().encode(mhtml);
  }

  it("извлекает текст из quoted-printable части и чистит разметку", () => {
    const body = toEntities(
      "Статья 1. Основные положения\n" + "Текст первой статьи закона для тестирования. ".repeat(200)
    );
    const bytes = fixtureArchive(`<html><body><p>${body}</p><script>alert(1);</script></body></html>`);

    const { text, archiveSha256 } = extractArchiveText(bytes);

    expect(text).toContain("Статья 1. Основные положения");
    expect(text).toContain("Текст первой статьи закона");
    expect(text).not.toContain("alert(1)");
    expect(archiveSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("архив без text/html части отклоняется", () => {
    const bytes = new TextEncoder().encode("MIME-Version: 1.0\r\n\r\nпусто");
    expect(() => extractArchiveText(bytes)).toThrow(/text\/html/);
  });
});

describe("law-corpus: парсер официального HTML", () => {
  it("извлекает текст, убирает script/теги, восстанавливает сущности", () => {
    const body = toEntities(
      "Статья 1. Основные положения\n" + "Текст первой статьи закона для тестирования парсера. ".repeat(12)
    ).repeat(3);
    const bytes = fixtureDoc(body);

    const { text, htmlSha256 } = extractOfficialText(bytes);

    expect(text).toContain("Статья 1. Основные положения");
    expect(text).toContain("Текст первой статьи закона");
    expect(text).not.toContain("<p>");
    expect(text).not.toContain("Футер"); // контент после #text_content не попадает
    expect(htmlSha256).toBe(sha256(new TextDecoder("windows-1251").decode(bytes)));
  });

  it("выбрасывает понятную ошибку, если официальная страница без text_content", () => {
    const bytes = new TextEncoder().encode("<html><body>служебная страница</body></html>");
    expect(() => extractOfficialText(bytes)).toThrow(/text_content/);
  });
});

describe("law-corpus: чанкинг по статьям", () => {
  const sampleLawText = [
    "Статья 1. Сфера действия закона",
    "Настоящий закон регулирует отношения между потребителями и продавцами.",
    "Каждый гражданин имеет право на качество.",
    "",
    "Статья 2. Международные договоры",
    "Если международным договором установлены иные правила, применяются они.",
    "",
    "Статья 3. Право на просвещение",
    "Потребители имеют право на получение информации.",
  ].join("\n");

  it("режет строго по статьям, локаторы восстанавливаемы", () => {
    const chunks = buildLawChunks(sampleLawText);

    expect(chunks.map((c) => c.article)).toEqual(["Статья 1.", "Статья 2.", "Статья 3."]);
    expect(chunks[0].locator).toBe("#статья-1--0");
    expect(chunks[1].locator).toBe("#статья-2--0");
    expect(chunks[2].locator).toBe("#статья-3--0");
    expect(chunks[0].chunk).toContain("Сфера действия закона");
    expect(chunks[0].chunk).not.toContain("Международные договоры"); // границы статей не пересекаются
  });

  it("длинная статья делится на части с продолжением локатора", () => {
    const longParagraph = "Очень длинный абзац нормы права. ".repeat(60); // ~2000 символов
    const text = ["Статья 15. Ответственность продавца", longParagraph, "", "Второй абзац статьи с продолжением правил."].join("\n");

    const chunks = buildLawChunks(text, { maxChars: 2000 });

    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.article).toBe("Статья 15.");
      expect(c.locator).toMatch(/^#статья-15--\d+$/);
    }
    expect(chunks[0].chunk).toContain("Очень длинный абзац");
    expect(chunks[chunks.length - 1].chunk).toContain("Второй абзац");
  });

  it("гигантский абзац без пустых строк (перечисления КоАП) режется по предложениям с капом", () => {
    const giant = `Статья 3.5. Административный штраф\n${"Штраф назначается за нарушение. "}Ссылка на ст. 8.28 и даты 26.07.2017, 14.11.2017. ${"Длинное перечисление нормы. ".repeat(120)}`;
    const normSrc = giant.replace(/\s+/g, " ");
    const chunks = buildLawChunks(giant, { maxChars: 2000 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.article).toBe("Статья 3.5.");
      expect(c.chunk.length).toBeLessThanOrEqual(2000 + 500); // кап + заголовок статьи
      expect(c.locator).toMatch(/^#статья-3-5--\d+$/);
      // Дословность: тело чанка (без prepend-метки) — подмножество источника.
      // Особо проверяем, что «8.28» не превратилось в «8. 28».
      const body = c.chunk.split("\n").slice(1).join(" ").replace(/\s+/g, " ").trim();
      expect(normSrc.includes(body)).toBe(true);
    }
    expect(chunks.some((c) => c.chunk.includes("8.28"))).toBe(true);
  });

  it("переход «абзац → units-путь» сохраняет разделитель (регрессия: «ответственности1.»)", () => {
    const header = "Статья 4.5. Давность привлечения";
    const tail = `1. ${"Постановление по делу не может быть вынесено. ".repeat(120)}`;
    const src = `${header}\n\n${tail}`;
    const normSrc = src.replace(/\s+/g, " ");
    const chunks = buildLawChunks(src, { maxChars: 2000 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      const body = c.chunk.split("\n").slice(1).join(" ").replace(/\s+/g, " ").trim();
      expect(normSrc.includes(body)).toBe(true);
    }
    // Разделитель между заголовком и пунктом не съеден.
    expect(chunks.some((c) => /привлечения\s+1\./.test(c.chunk))).toBe(true);
  });

  it("без статей парсер честно падает (не молча пропускает документ)", () => {
    expect(() => buildLawChunks("Просто текст без структуры статей. ".repeat(30))).toThrow(/заголовки статей/);
  });

  it("подномера с артефактом вёрстки «Статья 26 1 .» нормализуются в «Статья 26.1.»", () => {
    // Официальный MHTML ЗоЗПП отдаёт подномер через разрыв: «Статья 26 1 .».
    const text = [
      "Статья 26. Утратила силу",
      "Текст утратившей силу статьи.",
      "",
      "Статья 26 1 . Дистанционный способ продажи товара",
      "Договор розничной купли-продажи может быть заключён на основании ознакомления.",
      "",
      "Статья 26 2 . Правила продажи отдельных видов товаров",
      "Правила продажи утверждаются Правительством.",
      "",
      "Статья 27. Сроки выполнения работ",
      "Исполнитель обязан выполнить работу в срок.",
    ].join("\n");

    const chunks = buildLawChunks(text);
    const labels = chunks.map((c) => c.article);
    expect(labels).toEqual(["Статья 26.", "Статья 26.1.", "Статья 26.2.", "Статья 27."]);
    expect(chunks[1].locator).toMatch(/^#статья-26-1-/);
    expect(chunks[2].locator).toMatch(/^#статья-26-2-/);
    expect(chunks[1].chunk).toContain("Дистанционный способ продажи");
  });

  it("нумерация пунктов следующего абзаца не втягивается в заголовок статьи", () => {
    const text = [
      "Статья 5. Понятия, применяемые в настоящем Кодексе",
      "",
      "1. В настоящем Кодексе применяются понятия:",
      "2. Иные понятия применяются в значении, установленном законом.",
    ].join("\n");
    const chunks = buildLawChunks(text);
    expect(chunks.map((c) => c.article)).toEqual(["Статья 5."]);
    expect(chunks[0].chunk).toContain("1. В настоящем Кодексе");
  });
});
