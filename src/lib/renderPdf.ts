import {
  PDFDocument,
  rgb,
  StandardFonts,
  PageSizes,
  degrees,
} from "pdf-lib";
import { getDesign, type DesignTokens, type DesignId } from "./docDesign";

interface RenderPdfOptions {
  title: string;
  content: string; // HTML-like structured content
  designId?: DesignId;
  parties?: Array<{ role: string; name: string; inn?: string; address?: string }>;
  watermark?: string;
}

function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

function splitTextIntoLines(
  font: any,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function renderDocumentToPdf(
  html: string,
  options: RenderPdfOptions = { title: "", content: "" }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const design = getDesign(options.designId);

  // Регистрируем шрифты
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  // Парсим HTML в структурированные блоки (упрощённый парсер для MVP)
  const blocks = parseHtmlToBlocks(html);

  const pageWidth = PageSizes.A4[0];
  const pageHeight = PageSizes.A4[1];
  const marginLeft = mmToPt(design.marginLeft);
  const marginRight = mmToPt(design.marginRight);
  const marginTop = mmToPt(design.marginTop);
  const marginBottom = mmToPt(design.marginBottom);
  const contentWidth = pageWidth - marginLeft - marginRight;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const fontSize = design.bodyFontSize;
  const lineHeight = fontSize * (design.lineHeight || 1.3);
  const headingSizes = {
    h1: design.titleFontSize,
    h2: design.subheadingFontSize,
    h3: design.bodyFontSize + 2,
  };

  // Водяной знак (если есть)
  if (options.watermark) {
    const watermarkFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    for (const p of pages) {
      const { width, height } = p.getSize();
      p.drawText(options.watermark, {
        x: width / 2 - (watermarkFont.widthOfTextAtSize(options.watermark, 60) / 2),
        y: height / 2,
        size: 60,
        font: watermarkFont,
        color: rgb(0.9, 0.9, 0.9),
        rotate: degrees(30),
        opacity: 0.3,
      });
    }
  }

  for (const block of blocks) {
    if (block.type === "heading") {
      const level = block.level || 1;
      const size = headingSizes[`h${level}` as keyof typeof headingSizes] || fontSize + 4;
      const lines = splitTextIntoLines(fontBold, block.text || "", contentWidth, size);

      for (const line of lines) {
        if (y - size < marginBottom) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - marginTop;
        }
        page.drawText(line, {
          x: marginLeft,
          y,
          size,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        y -= size * 1.4;
      }
      y -= 4;
    } else if (block.type === "paragraph") {
      const lines = splitTextIntoLines(
        block.bold ? fontBold : fontRegular,
        block.text || "",
        contentWidth,
        fontSize
      );

      for (const line of lines) {
        if (y - fontSize < marginBottom) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - marginTop;
        }
        page.drawText(line, {
          x: marginLeft,
          y,
          size: fontSize,
          font: block.bold ? fontBold : fontRegular,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
      y -= 4;
    } else if (block.type === "list") {
      const items = block.items || [];
      for (const item of items) {
        const bullet = "•  ";
        const lines = splitTextIntoLines(fontRegular, bullet + item, contentWidth, fontSize);

        for (let i = 0; i < lines.length; i++) {
          if (y - fontSize < marginBottom) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - marginTop;
          }
          page.drawText(lines[i], {
            x: marginLeft + (i === 0 ? 12 : 12 + fontRegular.widthOfTextAtSize(bullet, fontSize)),
            y,
            size: fontSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }
      }
      y -= 4;
    } else if (block.type === "table") {
      // Упрощённый рендеринг таблицы
      const headers = block.headers || [];
      const rows = block.rows || [];
      const colCount = headers.length || (rows[0]?.length || 1);
      const colWidth = contentWidth / colCount;
      const cellPadding = 4;

      // Заголовок
      if (headers.length > 0) {
        if (y - fontSize * 2 < marginBottom) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - marginTop;
        }
        page.drawRectangle({
          x: marginLeft,
          y: y - fontSize * 1.5,
          width: contentWidth,
          height: fontSize * 1.8,
          color: rgb(0.95, 0.95, 0.95),
        });
        headers.forEach((header, i) => {
          page.drawText(header, {
            x: marginLeft + i * colWidth + cellPadding,
            y: y - fontSize * 1.2,
            size: fontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
        });
        y -= fontSize * 2;
      }

      // Строки
      for (const row of rows) {
        if (y - fontSize * 1.5 < marginBottom) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - marginTop;
        }
        row.forEach((cell, i) => {
          page.drawText(String(cell), {
            x: marginLeft + i * colWidth + cellPadding,
            y: y - fontSize * 1.1,
            size: fontSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
        });
        y -= fontSize * 1.6;
      }
      y -= 8;
    } else if (block.type === "hr") {
      if (y - 2 < marginBottom) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - marginTop;
      }
      page.drawLine({
        start: { x: marginLeft, y },
        end: { x: marginLeft + contentWidth, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 8;
    }
  }

  // Номера страниц
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const { width } = p.getSize();
    p.drawText(`${i + 1} / ${pages.length}`, {
      x: width / 2 - fontRegular.widthOfTextAtSize(`${i + 1} / ${pages.length}`, 8) / 2,
      y: marginBottom / 2,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return pdfDoc.save();
}

interface ParsedBlock {
  type: "heading" | "paragraph" | "list" | "table" | "hr";
  level?: number;
  text?: string;
  bold?: boolean;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

function parseHtmlToBlocks(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  function processNode(node: Node): ParsedBlock | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").trim();
      if (!text) return null;
      return { type: "paragraph", text };
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const level = parseInt(tag[1]) || 1;
      return { type: "heading", level, text: el.textContent?.trim() || "" };
    }
    if (tag === "p" || tag === "div" || tag === "section" || tag === "article") {
      const text = el.textContent?.trim() || "";
      if (!text) return null;
      const bold = el.classList.contains("font-bold") || getComputedStyle(el).fontWeight === "700";
      return { type: "paragraph", text, bold };
    }
    if (tag === "ul" || tag === "ol") {
      const items: string[] = [];
      el.querySelectorAll("li").forEach((li) => {
        const text = li.textContent?.trim() || "";
        if (text) items.push(text);
      });
      if (items.length > 0) return { type: "list", items };
      return null;
    }
    if (tag === "table") {
      const headers: string[] = [];
      const rows: string[][] = [];
      el.querySelectorAll("thead th").forEach((th) => {
        headers.push(th.textContent?.trim() || "");
      });
      el.querySelectorAll("tbody tr").forEach((tr) => {
        const row: string[] = [];
        tr.querySelectorAll("td, th").forEach((td) => {
          row.push(td.textContent?.trim() || "");
        });
        if (row.length > 0) rows.push(row);
      });
      if (headers.length > 0 || rows.length > 0) {
        return { type: "table", headers, rows };
      }
      return null;
    }
    if (tag === "hr") {
      return { type: "hr" };
    }
    if (tag === "br") return null;

    // Рекурсивно обрабатываем детей
    const childBlocks: ParsedBlock[] = [];
    for (const child of Array.from(el.childNodes)) {
      const block = processNode(child);
      if (block) childBlocks.push(block);
    }
    if (childBlocks.length === 1 && childBlocks[0].type === "paragraph") {
      return childBlocks[0];
    }
    return childBlocks.length > 0 ? { type: "paragraph", text: childBlocks.map((b) => b.text || "").join(" ") } : null;
  }

  for (const child of Array.from(body.childNodes)) {
    const block = processNode(child);
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block);
      } else {
        blocks.push(block);
      }
    }
  }

  return blocks;
}