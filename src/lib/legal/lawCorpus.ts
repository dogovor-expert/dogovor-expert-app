/**
 * Корпус НПА для RAG AI-юриста: официальный источник pravo.gov.ru (IPS).
 *
 * Принципы:
 * 1. Только официальный открытый источник (publication.pravo.gov.ru / IPS pravo.gov.ru).
 * 2. Каждый снапшот фиксирует URL, дату скачивания, SHA-256 и версию парсера.
 * 3. Чанки не пересекают границы статей (норма = статья), локатор восстанавливаем.
 * 4. Активация редакции в RAG — отдельный юридический шаг (см. миграцию law_corpus).
 *
 * Модуль без side-effects: скрипты — тонкие CLI-обёртки (scripts/fetch-law-corpus.mts).
 */

import crypto from "node:crypto";

export const LAW_CORPUS_PARSER_VERSION = "2026-09-25.6";
export const OFFICIAL_SOURCE = "pravo.gov.ru";
export const OFFICIAL_IPS_BASE = "http://pravo.gov.ru/proxy/ips";

/**
 * Первый корпус намеренно ограничен базовыми законами, на которые уже
 * ссылаются шаблоны и статьи сайта. ND — внутренние номера официального IPS.
 * mustContain — структурные маркеры полноты: документ считается полным,
 * только если в тексте есть ВСЕ маркеры (защита от обрезанных страниц IPS).
 * Новые документы добавляются только после проверки актуальной редакции.
 */
export interface LawDocumentMeta {
  code: string;
  title: string;
  nd: string;
  officialSourceUrl: string;
  mustContain: string[];
}

export const LAW_DOCUMENTS: LawDocumentMeta[] = [
  { code: "ГК РФ часть 1", title: "Гражданский кодекс Российской Федерации (часть первая)", nd: "102033239", mustContain: ["Статья 1", "Статья 453"] },
  { code: "ГК РФ часть 2", title: "Гражданский кодекс Российской Федерации (часть вторая)", nd: "102039276", mustContain: ["Статья 454", "Статья 1109"] },
  { code: "ЖК РФ", title: "Жилищный кодекс Российской Федерации", nd: "102090645", mustContain: ["Статья 1", "Статья 192"] },
  { code: "ТК РФ", title: "Трудовой кодекс Российской Федерации", nd: "102074279", mustContain: ["Статья 1", "Статья 424"] },
  { code: "КоАП РФ", title: "Кодекс Российской Федерации об административных правонарушениях", nd: "102074277", mustContain: ["Статья 1.1", "Статья 12.37", "Статья 32.14"] },
  { code: "ЗоЗПП", title: "Закон Российской Федерации о защите прав потребителей", nd: "102014512", mustContain: ["Статья 1", "Статья 46"] },
  { code: "СК РФ", title: "Семейный кодекс Российской Федерации", nd: "102038925", mustContain: ["Статья 1", "Статья 34", "Статья 170"] },
  { code: "НК РФ часть 1", title: "Налоговый кодекс Российской Федерации (часть первая)", nd: "102054722", mustContain: ["Статья 1", "Статья 138"] },
  { code: "УК РФ", title: "Уголовный кодекс Российской Федерации", nd: "102041891", mustContain: ["Статья 1", "Статья 361"] },
].map((document) => ({
  ...document,
  officialSourceUrl: `${OFFICIAL_IPS_BASE}/?nd=${document.nd}`,
}));

/**
 * Полный текст документа — MHTML-архив (?savertf=&page=all).
 * ВАЖНО: постраничный HTML-просмотр (?doc_itself=&page=1) ОБРЕЗАН
 * (для КоАП отдаёт только начало до ст. 5.67) и для корпуса запрещён.
 */
export function buildArchiveUrl(nd: string): string {
  return `${OFFICIAL_IPS_BASE}/?savertf=&nd=${encodeURIComponent(nd)}&page=all`;
}

/** @deprecated Обрезанный постраничный просмотр — не использовать для корпуса. */
export function buildCurrentTextUrl(nd: string): string {
  return buildArchiveUrl(nd);
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (all: string, name: string) => named[name.toLowerCase()] ?? all);
}

function stripMarkup(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/?p\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

/**
 * Извлекает полный текст из MHTML-архива официального IPS (?savertf=&page=all):
 * multipart/related → text/html (quoted-printable, windows-1251) → чистый текст.
 * Постраничный HTML-просмотр здесь НЕ используется: он обрезан.
 */
export function extractArchiveText(archiveBytes: Uint8Array): { text: string; archiveSha256: string } {
  const raw = new TextDecoder("latin1").decode(archiveBytes);
  const partStart = raw.search(/Content-Type:\s*text\/html/i);
  if (partStart === -1) throw new Error("MHTML-архив не содержит text/html части");
  const headerEnd = raw.indexOf("\r\n\r\n", partStart);
  if (headerEnd === -1) throw new Error("MHTML-архив: повреждённые заголовки части");
  const headerBlock = raw.slice(partStart, headerEnd);
  const bodyStart = headerEnd + 4;
  // Граница части: boundary ищем в строке Content-Type заголовка ВСЕГО
  // архива (MIME-Version ... Content-Type: multipart/related), а НЕ первым
  // вхождением по всему тексту — значение boundary может случайно
  // встретиться внутри HTML-тела. Совпадение — только со знаком -- в начале
  // строки. Заголовка нет (IPS pravo.gov.ru) — тело идёт до конца архива.
  const topHeaders = raw.slice(0, partStart);
  const boundaryParam = topHeaders.match(/boundary="?([^"\s;]+)"?/i)?.[1];
  let partRaw: string;
  if (boundaryParam) {
    const marker = new RegExp(`^--${boundaryParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m");
    const mm = marker.exec(raw.slice(bodyStart));
    partRaw = mm ? raw.slice(bodyStart, bodyStart + mm.index) : raw.slice(bodyStart);
  } else {
    partRaw = raw.slice(bodyStart);
  }
  // Декодирование тела по Content-Transfer-Encoding (quoted-printable/base64/8bit).
  let html: string;
  if (/content-transfer-encoding:\s*base64/i.test(headerBlock)) {
    const b64 = partRaw.replace(/\s+/g, "");
    const bin = Uint8Array.from(Buffer.from(b64, "base64"));
    html = new TextDecoder("windows-1251").decode(bin);
  } else if (/content-transfer-encoding:\s*(binary|8bit|7bit)/i.test(headerBlock)) {
    const bytes = new Uint8Array(partRaw.length);
    for (let i = 0; i < partRaw.length; i++) bytes[i] = partRaw.charCodeAt(i) & 0xff;
    html = new TextDecoder("windows-1251").decode(bytes);
  } else {
    // quoted-printable (дефолт MHTML): =XX hex, мягкий перенос "=\n" отбрасываем.
    // Важно: \r\n нормализуем ПОСЛЕ декодирования, иначе =XX на границе строк рвётся.
    const out: number[] = [];
    for (let i = 0; i < partRaw.length; i++) {
      const ch = partRaw[i];
      if (ch === "=" && /^[0-9A-Fa-f]{2}$/.test(partRaw.slice(i + 1, i + 3))) {
        out.push(parseInt(partRaw.slice(i + 1, i + 3), 16));
        i += 2;
      } else if (ch === "=" && (partRaw[i + 1] === "\n" || (partRaw[i + 1] === "\r" && partRaw[i + 2] === "\n"))) {
        i += partRaw[i + 1] === "\r" ? 2 : 1;
      } else {
        out.push(partRaw.charCodeAt(i) & 0xff);
      }
    }
    html = new TextDecoder("windows-1251").decode(new Uint8Array(out));
  }

  const text = stripMarkup(html)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length < 5000) throw new Error(`Слишком короткий официальный текст: ${text.length} символов`);
  return { text, archiveSha256: sha256Bytes(archiveBytes) };
}

export function sha256Bytes(bytes: Uint8Array): string {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

/**
 * Gate полноты: все структурные маркеры обязаны присутствовать в тексте.
 * Ложное срабатывание безопасно (запрет активации), пропуск — нет.
 */
export function assertCompleteness(document: LawDocumentMeta, text: string): void {
  const missing = document.mustContain.filter((marker) => !text.includes(marker));
  if (missing.length > 0) {
    throw new Error(`Неполный текст ${document.code}: отсутствуют маркеры: ${missing.join(", ")}`);
  }
}

/**
 * @deprecated Постраничный просмотр обрезан (КоАП: только до ст. 5.67).
 * Оставлен для обратной совместимости тестов; корпус использует extractArchiveText.
 */
export function extractOfficialText(htmlBytes: Uint8Array): { text: string; htmlSha256: string } {
  const html = new TextDecoder("windows-1251").decode(htmlBytes);
  const textContentIndex = html.indexOf('id="text_content"');
  if (textContentIndex === -1) throw new Error('Официальная страница не содержит id="text_content"');

  const afterStart = html.slice(textContentIndex);
  const startTagEnd = afterStart.indexOf(">");
  const contentStart = textContentIndex + startTagEnd + 1;

  const htmlEnd = html.indexOf("</html>", contentStart);
  const rawContent = htmlEnd !== -1 ? html.slice(contentStart, htmlEnd + 7) : html.slice(contentStart);

  const text = stripMarkup(rawContent)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length < 500) throw new Error(`Слишком короткий официальный текст: ${text.length} символов`);
  return { text, htmlSha256: sha256(html) };
}

export interface LawChunkBuilt {
  article: string;
  heading: string;
  locator: string;
  chunk: string;
}

function slugArticle(article: string): string {
  return article.toLowerCase().replace(/[^\da-zа-яё]+/gi, "-");
}

/** Приводит метку статьи к каноничному виду «Статья N.M.». В официальном
 *  MHTML подномера отображаются с разрывом («Статья 26 1 .» вместо
 *  «Статья 26.1.»), поэтому собираем все числа заголовка через точку. */
export function normalizeArticleLabel(raw: string): string {
  const numbers = raw.match(/\d+/g);
  if (numbers && numbers.length > 0) return `Статья ${numbers.join(".")}.`;
  return raw.replace(/\s+/g, " ").trim();
}

/** Заголовок статьи: число может быть составным и в официальном тексте
 *  разделяться пробелами (артефакт вёрстки MHTML: «Статья 26 1 .»).
 *  Переводы строк внутри номера не допускаем — иначе захватим нумерацию
 *  пунктов следующего абзаца («Статья 5.\n\n1. …»). */
const ARTICLE_HEADING_RE =
  /(^|\n)\s*(Статья[ \t\u00a0]+\d+(?:[.\u0020\t\u00a0]+\d+)*[ \t\u00a0]*\.?)/giu;

/** Чанки не пересекают границы статей; длинные статьи режутся по абзацам,
 *  а гигантские абзацы без пустых строк (перечисления КоАП) — по предложениям.
 *  Гарантии: жёсткий кап под лимит эмбеддингов (8192 токена) + склейка
 *  дословная (без потерь символов и без вставки пробелов). */
export function buildLawChunks(text: string, { maxChars = 4200 }: { maxChars?: number } = {}): LawChunkBuilt[] {
  const matches = [...text.matchAll(ARTICLE_HEADING_RE)];
  if (matches.length === 0) throw new Error("Не найдены заголовки статей");
  const chunks: LawChunkBuilt[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const start = (matches[i].index ?? 0) + (matches[i][1]?.length ?? 0);
    const end = matches[i + 1]?.index ?? text.length;
    const articleText = text.slice(start, end).trim();
    const article = normalizeArticleLabel(matches[i][2]);
    const base = slugArticle(article);
    // Сплит С сохранением разделителей: склейка обязана быть дословной,
    // иначе граница «абзац → units-путь» съедает \n\n («ответственности1.»).
    const rawParts = articleText.split(/(\n{2,})/);
    const paragraphs: string[] = [];
    for (let k = 0; k < rawParts.length; k += 2) {
      const para = (rawParts[k] ?? "").trim();
      if (!para) continue;
      const sep = k > 0 ? (rawParts[k - 1] ?? "") : "";
      paragraphs.push(sep + para);
    }
    let buffer = article;
    let part = 0;
    const push = () => {
      if (buffer.length > article.length) {
        chunks.push({ article, heading: article, locator: `#${base}-${part}`, chunk: buffer.trim() });
        part += 1;
      }
    };
    const feed = (piece: string) => {
      if (piece.length <= maxChars) {
        if (buffer.length > article.length && buffer.length + piece.length + 1 > maxChars) {
          push();
          buffer = `${article}\n${piece.trimStart()}`;
        } else if (buffer === article || /^\s/.test(piece)) {
          buffer += buffer === article ? `\n${piece.trimStart()}` : piece;
        } else {
          buffer += `\n${piece}`;
        }
        return;
      }
      // Гигантский кусок без абзацев: режем на единицы «предложение +
      // ИСХОДНЫЙ разделитель» и склеиваем дословно — без вставки пробелов
      // там, где их не было (иначе «8.28» превратится в «8. 28»).
      // Разрывы между совпадениями (даты «26.07.2017», «ст.», «8.28»)
      // сохраняем отдельными единицами: потеря символов недопустима.
      const units: string[] = [];
      const re = /[^.!?;]+[.!?;]+["»)]?(?:\s+|$)/g;
      let m: RegExpExecArray | null;
      let last = 0;
      while ((m = re.exec(piece)) !== null) {
        if (m.index > last) units.push(piece.slice(last, m.index));
        units.push(m[0]);
        last = m.index + m[0].length;
      }
      if (last < piece.length) units.push(piece.slice(last));
      for (const unit of units) {
        if (!unit.trim()) continue;
        if (unit.length > maxChars) {
          // Внутри единицы нет границ: дословный рез по символам отдельными чанками.
          if (buffer.length > article.length) push();
          for (let k = 0; k < unit.length; k += maxChars) {
            buffer = `${article}\n${unit.slice(k, k + maxChars).trim()}`;
            push();
          }
          buffer = article;
          continue;
        }
        if (buffer === article) {
          buffer += `\n${unit.trimStart()}`;
        } else if (buffer.length + unit.length > maxChars) {
          push();
          buffer = `${article}\n${unit.trimStart()}`;
        } else {
          buffer += unit;
        }
      }
    };
    for (const paragraph of paragraphs) feed(paragraph);
    push();
  }
  return chunks;
}

export interface FetchedLawDocument extends LawDocumentMeta {
  /** Человекочитаемая карточка документа (для ссылок пользователям). */
  sourceUrl: string;
  /** Точный URL скачанного архива (для provenance байтов). */
  archiveUrl: string;
  sourceRetrievedAt: string;
  sourceSha256: string;
  contentSha256: string;
  parserVersion: string;
  text: string;
  chunks: LawChunkBuilt[];
}

async function fetchWithRetry(url: string, opts: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      try {
        return await fetch(url, { ...opts, signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.min(3000 * 2 ** (attempt - 1), 15000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function fetchOfficialDocument(
  document: LawDocumentMeta,
  fetchImpl: (url: string, opts: RequestInit) => Promise<Response> = fetchWithRetry
): Promise<FetchedLawDocument> {
  const archiveUrl = buildArchiveUrl(document.nd);
  const response = await fetchImpl(archiveUrl, {
    headers: { "User-Agent": "Dogovor.expert-law-corpus/1.0 (official-source; contact via dogovor.expert)" },
  });
  if (!response.ok) throw new Error(`Официальный источник вернул HTTP ${response.status}: ${archiveUrl}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const parsed = extractArchiveText(bytes);
  assertCompleteness(document, parsed.text);
  return {
    ...document,
    sourceUrl: document.officialSourceUrl,
    archiveUrl,
    sourceRetrievedAt: new Date().toISOString(),
    sourceSha256: parsed.archiveSha256,
    contentSha256: sha256(parsed.text),
    parserVersion: LAW_CORPUS_PARSER_VERSION,
    text: parsed.text,
    chunks: buildLawChunks(parsed.text),
  };
}
