/**
 * Извлечение текста из файла документа — ЦЕЛИКОМ В БРАУЗЕРЕ.
 *
 * Поддерживаются .docx (mammoth), .pdf (pdfjs-dist) и текстовые форматы.
 * Файлы не отправляются на сервер: это принципиально для сравнения
 * договоров с персональными данными и коммерческой тайной.
 *
 * Библиотеки грузятся динамически, чтобы не попадать в основной бандл.
 */

export const SUPPORTED_DOC_EXT = [".docx", ".pdf", ".txt", ".md", ".rtf"];

export function docExt(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? `.${m[1]}` : "";
}

export function isSupportedDocFile(file: File): boolean {
  return SUPPORTED_DOC_EXT.includes(docExt(file.name));
}

/**
 * Грубое преобразование HTML в текст: сохраняем переводы строк по блочным
 * тегам, декодируем базовые сущности. Нужно для mammoth (он отдаёт HTML).
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Минимальная типизация браузерной сборки mammoth (у пакета нет типов). */
interface MammothBrowser {
  convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}

async function extractDocx(file: File): Promise<string> {
  // Тот же браузерный путь, что и в конвертере (DocxToPrint).
  const mammoth = (await import(
    "mammoth/mammoth.browser"
  )) as unknown as MammothBrowser;
  const { value } = await mammoth.convertToHtml({
    arrayBuffer: await file.arrayBuffer(),
  });
  return htmlToText(value);
}

interface PdfTextItem {
  str?: string;
  transform?: number[];
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    // Реконструируем строки: группируем элементы по вертикали (y), внутри
    // строки сортируем по горизонтали (x).
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const raw of content.items as PdfTextItem[]) {
      const str = raw.str ?? "";
      if (!str.trim()) continue;
      const t = raw.transform ?? [1, 0, 0, 1, 0, 0];
      const y = Math.round(t[5]);
      const x = t[4];
      const bucket = rows.get(y) ?? [];
      bucket.push({ x, str });
      rows.set(y, bucket);
    }
    const lines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);
    pages.push(lines.join("\n"));
  }
  await task.destroy();
  return pages.join("\n\n");
}

/** Извлекает текст из файла. Бросает ошибку для неподдерживаемых форматов. */
export async function extractDocText(file: File): Promise<string> {
  const ext = docExt(file.name);
  if (ext === ".docx") return extractDocx(file);
  if (ext === ".pdf") return extractPdf(file);
  if (ext === ".txt" || ext === ".md" || ext === ".rtf") return file.text();
  throw new Error(
    "Поддерживаются форматы DOCX, PDF, TXT, MD. Для сканов используйте конвертер с распознаванием."
  );
}
