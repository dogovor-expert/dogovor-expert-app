import { PDFDocument, PDFFont, PDFImage, rgb, type RGB, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { saveAs } from "file-saver";

const A4 = { w: 595.28, h: 841.89 };
const MM = 2.834645669;

interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const DEFAULT_MARGIN: Margin = {
  top: 20 * MM,
  bottom: 20 * MM,
  left: 20 * MM,
  right: 15 * MM,
};

/** Фирменный цвет #1a3c6c (тёмно-синий). */
const BRAND = rgb(0x1a / 255, 0x3c / 255, 0x6c / 255);
/** Светло-серый фон заголовков «Стороны» (#eef1f7). */
const SIDE_FILL = rgb(0xee / 255, 0xf1 / 255, 0xf7 / 255);

export interface ExportPdfOptions {
  /** Водяной знак для free-пользователя (рисуется внизу каждой страницы). */
  watermark?: string;
  /** Рисовать «Стр. N из M» внизу каждой страницы. По умолчанию true. */
  pageNumbers?: boolean;
  /** Поля страницы в миллиметрах. По умолчанию как в шаблоне договора. */
  margin?: Partial<Margin>;
}

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface Word {
  text: string;
  bold: boolean;
  italic: boolean;
}

type Block =
  | { kind: "paragraph"; runs: Run[]; align: "left" | "center" | "right" | "justify"; indent: number; bullet: boolean; fontSize: number; marginBottom: number; color?: "brand" }
  | { kind: "row"; leftRuns: Run[]; rightRuns: Run[]; fontSize: number; marginBottom: number }
  | { kind: "columns"; cols: Block[][]; fontSize: number; marginBottom: number }
  | { kind: "table"; rows: { cells: { runs: Run[]; bold: boolean }[] }[]; fontSize: number; marginBottom: number }
  | { kind: "image"; img: PDFImage; width: number; height: number; marginBottom: number }
  | { kind: "line"; label: string; fontSize: number; marginBottom: number }
  | { kind: "sides"; leftTitle: string; leftBlocks: Block[]; rightTitle: string; rightBlocks: Block[]; marginBottom: number }
  | { kind: "pricebox"; runs: Run[]; fontSize: number; marginBottom: number };

let fontBytesCache: { regular?: ArrayBuffer; bold?: ArrayBuffer; italic?: ArrayBuffer; bolditalic?: ArrayBuffer } = {};

async function getFontBytes(): Promise<{
  regular: ArrayBuffer;
  bold: ArrayBuffer;
  italic: ArrayBuffer;
  bolditalic: ArrayBuffer;
}> {
  if (!fontBytesCache.regular) {
    const [regular, bold, italic, bolditalic] = await Promise.all([
      fetch("/fonts/pt-serif-regular.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/pt-serif-bold.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/pt-serif-italic.ttf").then((r) => r.arrayBuffer()),
      fetch("/fonts/pt-serif-bolditalic.ttf").then((r) => r.arrayBuffer()),
    ]);
    fontBytesCache = { regular, bold, italic, bolditalic };
  }
  return fontBytesCache as { regular: ArrayBuffer; bold: ArrayBuffer; italic: ArrayBuffer; bolditalic: ArrayBuffer };
}

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  bolditalic: PDFFont;
}

let measurer: CanvasRenderingContext2D | null = null;

function getMeasurer(): CanvasRenderingContext2D {
  if (!measurer) {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 100;
    measurer = canvas.getContext("2d");
  }
  return measurer!;
}

function measureText(text: string, fontSize: number, bold: boolean, italic: boolean): number {
  const ctx = getMeasurer();
  const style = `${italic ? "italic " : ""}${bold ? "bold " : ""}${fontSize}px "PT Serif", serif`;
  ctx.font = style;
  return ctx.measureText(text).width;
}

function nodeRuns(node: Node): Run[] {
  const out: Run[] = [];
  const walk = (n: Node, bold: boolean, italic: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent || "").replace(/\u00A0/g, " ");
      if (t.trim()) out.push({ text: t, bold, italic });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") return;
    const nb = bold || tag === "strong" || tag === "b";
    const ni = italic || tag === "em" || tag === "i";
    el.childNodes.forEach((c) => walk(c, nb, ni));
  };
  node.childNodes.forEach((c) => walk(c, false, false));
  return out;
}

function hasClass(el: HTMLElement, token: string): boolean {
  const cls = el.className || "";
  return cls.split(/\s+/).includes(token) || cls.includes(token);
}

function fontSizeFrom(el: HTMLElement, fallback: number): number {
  const cls = el.className || "";
  if (cls.includes("text-[10px]")) return 7.5;
  if (cls.includes("text-[11px]")) return 8.25;
  if (cls.includes("text-[12px]")) return 9;
  if (cls.includes("text-[13px]")) return 9.75;
  if (cls.includes("text-[14px]")) return 10.5;
  if (cls.includes("text-[16px]")) return 12;
  if (cls.includes("text-[18px]")) return 13.5;
  if (cls.includes("text-xs")) return 9;
  if (cls.includes("text-sm")) return 10.5;
  if (cls.includes("text-base")) return 12;
  if (cls.includes("text-lg")) return 13.5;
  if (cls.includes("text-xl")) return 15;
  if (cls.includes("text-2xl")) return 18;
  return fallback;
}

function marginFrom(el: HTMLElement, fallback: number): number {
  const cls = el.className || "";
  if (cls.includes("mb-8")) return 24;
  if (cls.includes("mb-6")) return 18;
  if (cls.includes("mb-4")) return 12;
  if (cls.includes("mb-3")) return 9;
  if (cls.includes("mb-2")) return 6;
  if (cls.includes("mb-1")) return 3;
  if (cls.includes("mb-0")) return 0;
  if (cls.includes("mt-8")) return 18;
  if (cls.includes("mt-4")) return 12;
  if (cls.includes("mt-6")) return 18;
  if (cls.includes("mt-2")) return 6;
  if (cls.includes("mt-1")) return 3;
  return fallback;
}

function toWords(runs: Run[]): Word[] {
  const words: Word[] = [];
  for (const r of runs) {
    let i = 0;
    const text = r.text;
    while (i < text.length) {
      const ch = text[i];
      if (ch === " " || ch === "\n" || ch === "\t") {
        i++;
        continue;
      }
      let j = i;
      while (j < text.length && text[j] !== " " && text[j] !== "\n" && text[j] !== "\t") j++;
      words.push({ text: text.slice(i, j), bold: r.bold, italic: r.italic });
      i = j;
    }
  }
  return words;
}

interface Line {
  words: Word[];
  widths: number[];
  totalWidth: number;
}

function layoutLines(words: Word[], fontSize: number, maxWidth: number): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  let curWidths: number[] = [];
  let curWidth = 0;
  let pendingSpace = false;
  const spaceWidth = measureText(" ", fontSize, false, false);

  for (const w of words) {
    const ww = measureText(w.text, fontSize, w.bold, w.italic);
    const add = pendingSpace ? ww + spaceWidth : ww;
    if (cur.length && curWidth + add > maxWidth) {
      lines.push({ words: cur, widths: curWidths, totalWidth: curWidth });
      cur = [w];
      curWidths = [ww];
      curWidth = ww;
      pendingSpace = false;
    } else {
      if (pendingSpace) curWidth += spaceWidth;
      cur.push(w);
      curWidths.push(ww);
      curWidth += ww;
      pendingSpace = false;
    }
  }
  if (cur.length) lines.push({ words: cur, widths: curWidths, totalWidth: curWidth });
  return lines;
}

class Renderer {
  private doc: PDFDocument;
  private fonts: FontSet;
  private pages: PDFPage[] = [];
  private page: PDFPage;
  private margin: Margin;
  private y: number;
  private pageIndex = 0;
  pageCount = 1;

  constructor(doc: PDFDocument, fonts: FontSet, margin: Margin) {
    this.doc = doc;
    this.fonts = fonts;
    this.margin = margin;
    this.page = doc.addPage([A4.w, A4.h]);
    this.pages.push(this.page);
    this.y = margin.top;
  }

  private get availWidth(): number {
    return A4.w - this.margin.left - this.margin.right;
  }

  ensureSpace(needed: number) {
    const bottom = A4.h - this.margin.bottom;
    if (this.y + needed > bottom) {
      this.page = this.doc.addPage([A4.w, A4.h]);
      this.pages.push(this.page);
      this.pageIndex++;
      this.y = this.margin.top;
    }
  }

  private drawLineOfWords(
    line: Line,
    fontSize: number,
    x: number,
    y: number,
    align: "left" | "center" | "right" | "justify",
    isLastLine: boolean,
    maxWidth: number,
    color?: RGB
  ) {
    const spaceWidth = measureText(" ", fontSize, false, false);
    const spaces = line.words.length - 1;
    let lineWidth = line.totalWidth;
    let extraSpace = 0;
    if (align === "justify" && !isLastLine && spaces > 0) {
      const free = maxWidth - lineWidth;
      extraSpace = free / spaces;
    }
    if (align === "center") x += (maxWidth - lineWidth) / 2;
    if (align === "right") x += maxWidth - lineWidth;

    let cursor = x;
    line.words.forEach((w, i) => {
      const font = w.italic && w.bold ? this.fonts.bolditalic : w.italic ? this.fonts.italic : w.bold ? this.fonts.bold : this.fonts.regular;
      this.page.drawText(w.text, { x: cursor, y, size: fontSize, font, ...(color ? { color } : {}) });
      cursor += line.widths[i] + (i < line.words.length - 1 ? spaceWidth + extraSpace : 0);
    });
  }

  private paragraph(block: Extract<Block, { kind: "paragraph" }>) {
    const words = toWords(block.runs);
    if (words.length === 0) {
      this.y += block.fontSize;
      return;
    }
    const indent = block.indent;
    const maxWidth = this.availWidth - indent;
    const lines = layoutLines(words, block.fontSize, maxWidth);
    const lineHeight = block.fontSize * 1.4;
    lines.forEach((line, i) => {
      const isLast = i === lines.length - 1;
      this.ensureSpace(lineHeight);
      const x = this.margin.left + indent + (block.bullet ? block.fontSize * 1.2 : 0);
      this.drawLineOfWords(line, block.fontSize, x, this.y + block.fontSize, block.align, isLast || block.align !== "justify", maxWidth - (block.bullet ? block.fontSize * 1.2 : 0), block.color === "brand" ? BRAND : undefined);
      if (block.bullet && i === 0) {
        this.page.drawText("•", { x: this.margin.left + indent, y: this.y + block.fontSize, size: block.fontSize, font: this.fonts.regular, ...(block.color === "brand" ? { color: BRAND } : {}) });
      }
      this.y += lineHeight;
    });
    this.y += block.marginBottom;
  }

  private row(block: Extract<Block, { kind: "row" }>) {
    const fontSize = block.fontSize;
    const lineHeight = fontSize * 1.4;
    this.ensureSpace(lineHeight);
    const leftWords = toWords(block.leftRuns);
    const rightWords = toWords(block.rightRuns);
    const leftLines = layoutLines(leftWords, fontSize, this.availWidth * 0.5);
    const rightLines = layoutLines(rightWords, fontSize, this.availWidth * 0.5);
    const maxLines = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < maxLines; i++) {
      this.ensureSpace(lineHeight);
      const y = this.y + fontSize;
      const left = leftLines[i];
      const right = rightLines[i];
      if (left) this.drawLineOfWords(left, fontSize, this.margin.left, y, "left", true, this.availWidth * 0.5);
      if (right) {
        const xRight = this.margin.left + this.availWidth;
        const width = this.availWidth * 0.5;
        const rightX = xRight - width;
        this.drawLineOfWords(right, fontSize, rightX, y, "right", true, width);
      }
      this.y += lineHeight;
    }
    this.y += block.marginBottom;
  }

  private columns(block: Extract<Block, { kind: "columns" }>) {
    const gap = 8;
    const colWidth = (this.availWidth - gap * (block.cols.length - 1)) / block.cols.length;
    const estimateHeight = (col: Block[]): number =>
      col.reduce((acc, b) => {
        if (b.kind === "paragraph") {
          const lines = layoutLines(toWords(b.runs), b.fontSize, colWidth - b.indent);
          return acc + lines.length * b.fontSize * 1.4 + b.marginBottom;
        }
        if (b.kind === "line") return acc + b.fontSize * 1.4 + 12 + b.marginBottom;
        if (b.kind === "image") return acc + b.height + b.marginBottom;
        if (b.kind === "table") return acc + b.rows.length * (b.fontSize * 1.3 + 8) + b.marginBottom;
        if (b.kind === "sides") return acc + 120 + b.marginBottom;
        if (b.kind === "pricebox") return acc + layoutLines(toWords(b.runs), b.fontSize, colWidth).length * b.fontSize * 1.4 + 16 + b.marginBottom;
        return acc + b.fontSize * 1.4 + b.marginBottom;
      }, 0);
    const colHeights = block.cols.map((col) => estimateHeight(col));
    const maxColHeight = Math.max(0, ...colHeights);
    this.ensureSpace(maxColHeight);
    const startY = this.y;
    block.cols.forEach((col, ci) => {
      const x = this.margin.left + ci * (colWidth + gap);
      this.y = startY;
      col.forEach((b) => this.renderBlockWithWidth(b, x, colWidth));
    });
    this.y = startY + maxColHeight + block.marginBottom;
  }

  private renderBlockWithWidth(block: Block, x: number, width: number) {
    if (block.kind === "paragraph") {
      const words = toWords(block.runs);
      const lines = layoutLines(words, block.fontSize, width - block.indent);
      const lineHeight = block.fontSize * 1.4;
      lines.forEach((line, i) => {
        const isLast = i === lines.length - 1;
        const indent = block.indent + (block.bullet ? block.fontSize * 1.2 : 0);
        this.drawLineOfWords(line, block.fontSize, x + indent, this.y + block.fontSize, block.align, isLast || block.align !== "justify", width - indent, block.color === "brand" ? BRAND : undefined);
        if (block.bullet && i === 0) {
          this.page.drawText("•", { x: x + block.indent, y: this.y + block.fontSize, size: block.fontSize, font: this.fonts.regular, ...(block.color === "brand" ? { color: BRAND } : {}) });
        }
        this.y += lineHeight;
      });
      this.y += block.marginBottom;
    } else if (block.kind === "line") {
      const lineHeight = block.fontSize * 1.4;
      const ly = this.y + lineHeight + 8;
      this.page.drawLine({ start: { x, y: ly }, end: { x: x + Math.min(width, 120), y: ly }, thickness: 0.7, color: rgb(0.1, 0.1, 0.1) });
      this.page.drawText(block.label, { x, y: this.y + block.fontSize, size: block.fontSize, font: this.fonts.regular, color: rgb(0.45, 0.45, 0.5) });
      this.y += lineHeight + block.marginBottom + 12;
    } else if (block.kind === "image") {
      this.page.drawImage(block.img, { x, y: this.y, width: block.width, height: block.height });
      this.y += block.height + block.marginBottom;
    } else if (block.kind === "table") {
      this.table(block, x, width);
    } else if (block.kind === "sides") {
      this.sides(block, x, width);
    } else if (block.kind === "pricebox") {
      this.pricebox(block, x, width);
    }
  }

  private sides(block: Extract<Block, { kind: "sides" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const x0 = fixedX ?? this.margin.left;
    const width = fixedWidth ?? this.availWidth;
    const gap = 10;
    const colWidth = (width - gap) / 2;
    const estimateHeight = (blocks: Block[]): number =>
      blocks.reduce((acc, b) => {
        if (b.kind === "paragraph") {
          const lines = layoutLines(toWords(b.runs), b.fontSize, colWidth - b.indent);
          return acc + lines.length * b.fontSize * 1.4 + b.marginBottom;
        }
        if (b.kind === "line") return acc + b.fontSize * 1.4 + 12 + b.marginBottom;
        if (b.kind === "image") return acc + b.height + b.marginBottom;
        if (b.kind === "table") return acc + b.rows.length * (b.fontSize * 1.3 + 8) + b.marginBottom;
        if (b.kind === "pricebox") return acc + layoutLines(toWords(b.runs), b.fontSize, colWidth).length * b.fontSize * 1.4 + 12 + b.marginBottom;
        if (b.kind === "sides") return acc + 120 + b.marginBottom;
        return acc + b.fontSize * 1.4 + b.marginBottom;
      }, 0);
    const titleHeight = 10 * 1.4 + 8;
    const colHeights = [block.leftBlocks, block.rightBlocks].map((c) => estimateHeight(c));
    const maxColHeight = Math.max(0, ...colHeights);
    this.ensureSpace(titleHeight + maxColHeight);
    const startY = this.y;
    const drawCol = (title: string, blocks: Block[], x: number) => {
      this.page.drawRectangle({
        x,
        y: startY,
        width: colWidth,
        height: titleHeight,
        color: SIDE_FILL,
      });
      const ty = startY + (titleHeight - 10) / 2;
      this.page.drawText(title, { x: x + 6, y: ty, size: 10, font: this.fonts.bold, color: BRAND });
      this.y = startY + titleHeight;
      blocks.forEach((b) => this.renderBlockWithWidth(b, x, colWidth));
    };
    drawCol(block.leftTitle, block.leftBlocks, x0);
    this.y = startY;
    drawCol(block.rightTitle, block.rightBlocks, x0 + colWidth + gap);
    this.y = startY + titleHeight + maxColHeight + block.marginBottom;
  }

  private pricebox(block: Extract<Block, { kind: "pricebox" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const x0 = fixedX ?? this.margin.left;
    const width = fixedWidth ?? this.availWidth;
    const pad = 8;
    const words = toWords(block.runs);
    const lines = layoutLines(words, block.fontSize, width - pad * 2);
    const height = Math.max(24, lines.length * block.fontSize * 1.4 + pad * 2);
    this.ensureSpace(height);
    this.page.drawRectangle({
      x: x0,
      y: this.y,
      width,
      height,
      borderColor: BRAND,
      borderWidth: 0.8,
    });
    lines.forEach((line, i) => {
      this.drawLineOfWords(line, block.fontSize, x0 + pad, this.y + pad + block.fontSize + i * block.fontSize * 1.4, "left", true, width - pad * 2, BRAND);
    });
    this.y += height + block.marginBottom;
  }

  private table(block: Extract<Block, { kind: "table" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const cols = block.rows[0]?.cells.length || 1;
    const x0 = fixedX ?? this.margin.left;
    const width = fixedWidth ?? this.availWidth;
    const colWidth = width / cols;
    const cellPad = 4;
    const lineHeight = block.fontSize * 1.3;

    block.rows.forEach((row) => {
      const cells = row.cells;
      const rowLines = cells.map((cell) => {
        const words = toWords(cell.runs).map((w) => (cell.bold ? { ...w, bold: true } : w));
        return layoutLines(words, block.fontSize, colWidth - cellPad * 2);
      });
      const rowHeight = Math.max(lineHeight, ...rowLines.map((l) => l.length * lineHeight)) + cellPad * 2;
      this.ensureSpace(rowHeight);
      const yTop = this.y;
      const yBottom = this.y + rowHeight;
      cells.forEach((cell, ci) => {
        const cx = x0 + ci * colWidth;
        this.page.drawRectangle({
          x: cx,
          y: yTop,
          width: colWidth,
          height: rowHeight,
          borderColor: rgb(0.6, 0.6, 0.6),
          borderWidth: 0.5,
        });
        const lines = rowLines[ci];
        lines.forEach((line, li) => {
          const ly = yTop + cellPad + lineHeight * li + block.fontSize;
          this.drawLineOfWords(line, block.fontSize, cx + cellPad, ly, "left", true, colWidth - cellPad * 2);
        });
      });
      this.y = yBottom;
    });
    this.y += block.marginBottom;
  }

  renderBlock(block: Block) {
    switch (block.kind) {
      case "paragraph":
        this.paragraph(block);
        break;
      case "row":
        this.row(block);
        break;
      case "columns":
        this.columns(block);
        break;
      case "table":
        this.table(block);
        break;
      case "image": {
        this.ensureSpace(block.height);
        this.page.drawImage(block.img, { x: this.margin.left, y: this.y, width: block.width, height: block.height });
        this.y += block.height + block.marginBottom;
        break;
      }
      case "line": {
        const lineHeight = block.fontSize * 1.4;
        this.ensureSpace(lineHeight + 12);
        const ly = this.y + lineHeight + 8;
        this.page.drawLine({ start: { x: this.margin.left, y: ly }, end: { x: this.margin.left + Math.min(this.availWidth, 120), y: ly }, thickness: 0.7, color: rgb(0.1, 0.1, 0.1) });
        this.page.drawText(block.label, { x: this.margin.left, y: this.y + block.fontSize, size: block.fontSize, font: this.fonts.regular, color: rgb(0.45, 0.45, 0.5) });
        this.y += lineHeight + block.marginBottom + 12;
        break;
      }
      case "sides":
        this.sides(block);
        break;
      case "pricebox":
        this.pricebox(block);
        break;
    }
  }

  finalize(watermark?: string, pageNumbers = true) {
    this.pageCount = this.pages.length;
    this.pages.forEach((page, i) => {
      if (pageNumbers) {
        const label = `Стр. ${i + 1} из ${this.pageCount}`;
        const lw = measureText(label, 7.5, false, false);
        page.drawText(label, {
          x: A4.w - this.margin.right - lw,
          y: 14,
          size: 7.5,
          font: this.fonts.regular,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      const brand = "Сформировано на Dogovor.expert";
      page.drawText(brand, {
        x: this.margin.left,
        y: 14,
        size: 7.5,
        font: this.fonts.regular,
        color: rgb(0.45, 0.45, 0.55),
      });
      if (watermark) {
        page.drawText(watermark, {
          x: this.margin.left,
          y: 26,
          size: 7.5,
          font: this.fonts.regular,
          color: rgb(0.55, 0.55, 0.6),
        });
      }
    });
  }
}

function collectBlocks(root: HTMLElement, imgResolver: (src: string) => Promise<PDFImage | null>): Promise<Block[]> {
  const blocks: Block[] = [];

  const isBlockContainer = (el: HTMLElement) =>
    el.tagName === "DIV" || el.tagName === "P" || el.tagName === "SECTION" || el.tagName === "ARTICLE";

  const extractChildren = (el: HTMLElement): HTMLElement[] => {
    const out: HTMLElement[] = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) out.push(n as HTMLElement);
    });
    return out;
  };

  const collectInto = async (el: HTMLElement, target: Block[]): Promise<void> => {
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;

    if (tag === "table") {
      const rows: { cells: { runs: Run[]; bold: boolean }[] }[] = [];
      el.querySelectorAll("tr").forEach((tr) => {
        const cells: { runs: Run[]; bold: boolean }[] = [];
        tr.querySelectorAll("td, th").forEach((td) => {
          cells.push({ runs: nodeRuns(td), bold: td.tagName === "TH" });
        });
        rows.push({ cells });
      });
      if (rows.length) {
        target.push({ kind: "table", rows, fontSize: 9, marginBottom: 12 });
      }
      return;
    }

    if (tag === "img") {
      const src = el.getAttribute("src") || "";
      const img = await imgResolver(src);
      if (img) {
        const w = img.width || 140;
        const h = img.height || 40;
        const scale = Math.min(1, 140 / Math.max(w, 1));
        target.push({ kind: "image", img, width: w * scale, height: h * scale, marginBottom: 4 });
      }
      return;
    }

    if (tag === "ul" || tag === "ol") {
      el.querySelectorAll(":scope > li").forEach((li) => {
        target.push({
          kind: "paragraph",
          runs: nodeRuns(li),
          align: "left",
          indent: 14,
          bullet: true,
          fontSize: fontSizeFrom(el, 10.5),
          marginBottom: 4,
        });
      });
      target.push({ kind: "paragraph", runs: [{ text: "", bold: false, italic: false }], align: "left", indent: 0, bullet: false, fontSize: 4, marginBottom: 4 });
      return;
    }

    if (isBlockContainer(el)) {
      const cls = el.className || "";

      // Вложенный контейнер без собственного текста — проходим глубже.
      const children = extractChildren(el);
      const ownText = (el.textContent || "").trim();

      if (hasClass(el, "doc-sides")) {
        const parts = children.filter((c) => (c.textContent || "").trim());
        const mid = Math.ceil(parts.length / 2);
        const buildCol = async (arr: HTMLElement[]) => {
          const colBlocks: Block[] = [];
          let title = "";
          for (const c of arr) {
            if (hasClass(c, "doc-sides-title")) {
              if (!title) title = c.textContent || "";
              continue;
            }
            const t = c.querySelector?.(".doc-sides-title") as HTMLElement | null;
            if (t && !title) title = t.textContent || "";
            const clone = c.cloneNode(true) as HTMLElement;
            clone.querySelectorAll(".doc-sides-title").forEach((n) => n.remove());
            await collectInto(clone, colBlocks);
          }
          return { title, blocks: colBlocks };
        };
        const left = await buildCol(parts.slice(0, mid));
        const right = await buildCol(parts.slice(mid));
        if (left.blocks.length || right.blocks.length) {
          target.push({
            kind: "sides",
            leftTitle: left.title,
            leftBlocks: left.blocks,
            rightTitle: right.title,
            rightBlocks: right.blocks,
            marginBottom: 12,
          });
        }
        return;
      }

      if (hasClass(el, "doc-price")) {
        const runs = nodeRuns(el);
        if (runs.length) {
          target.push({ kind: "pricebox", runs, fontSize: fontSizeFrom(el, 11), marginBottom: 12 });
        }
        return;
      }

      if (cls.includes("flex") && cls.includes("justify-between")) {
        const parts = children.filter((c) => (c.textContent || "").trim());
        if (parts.length >= 2) {
          target.push({
            kind: "row",
            leftRuns: nodeRuns(parts[0]),
            rightRuns: nodeRuns(parts[parts.length - 1]),
            fontSize: fontSizeFrom(el, 9),
            marginBottom: marginFrom(el, 12),
          });
          return;
        }
      }

      if (cls.includes("grid") && (cls.includes("grid-cols-2") || cls.includes("grid-cols-3"))) {
        const n = cls.includes("grid-cols-3") ? 3 : 2;
        const cols: Block[][] = Array.from({ length: n }, () => []);
        const addInline = (c: HTMLElement, target: number): Promise<void> => {
          const imgSrc = c.tagName === "IMG" ? (c.getAttribute("src") || "") : "";
          const innerImgs = c.tagName === "DIV" ? Array.from(c.querySelectorAll("img")) : [];
          const loaders: Promise<void>[] = [];
          const b: Block[] = [];
          const pushImg = (src: string) => {
            loaders.push(
              imgResolver(src).then((img) => {
                if (img) b.push({ kind: "image", img, width: Math.min(img.width || 140, 140), height: Math.min(img.height || 40, 40), marginBottom: 4 });
              })
            );
          };
          if (imgSrc) pushImg(imgSrc);
          innerImgs.forEach((im) => pushImg(im.getAttribute("src") || ""));
          const sub = c.tagName === "DIV" ? extractChildren(c) : [];
          if (sub.length) {
            sub.forEach((sc) => {
              if (sc.tagName === "IMG") {
                pushImg(sc.getAttribute("src") || "");
              } else if (hasClass(sc, "border-b")) {
                b.push({ kind: "line", label: (sc.textContent || "").trim(), fontSize: fontSizeFrom(sc, 8.25), marginBottom: 6 });
              } else {
                const runs = nodeRuns(sc);
                if (runs.length) b.push({ kind: "paragraph", runs, align: "left", indent: 0, bullet: false, fontSize: fontSizeFrom(sc, 9), marginBottom: marginFrom(sc, 4) });
              }
            });
          } else {
            const runs = nodeRuns(c);
            if (runs.length) b.push({ kind: "paragraph", runs, align: "left", indent: 0, bullet: false, fontSize: fontSizeFrom(c, 9), marginBottom: 2 });
          }
          cols[target].push(...b);
          return Promise.all(loaders).then(() => undefined);
        };
        await Promise.all(children.map((c, i) => addInline(c, i % n)));
        if (cols.some((c) => c.length)) {
          target.push({ kind: "columns", cols, fontSize: 9, marginBottom: 12 });
        }
        return;
      }

      const isSubheading =
        cls.includes("font-bold") && cls.includes("uppercase") && (cls.includes("text-black") || cls.includes("mb-2"));
      const isHeading = cls.includes("text-center") && cls.includes("font-bold");
      const isDocTitle = hasClass(el, "doc-title");

      if (hasClass(el, "border-b")) {
        target.push({ kind: "line", label: (el.textContent || "").trim(), fontSize: fontSizeFrom(el, 8.25), marginBottom: marginFrom(el, 6) });
        return;
      }

      if (children.length === 0 || ownText) {
        const runs = nodeRuns(el);
        if (runs.length || ownText) {
          const align = cls.includes("text-center") ? "center" : cls.includes("text-right") ? "right" : "justify";
          const boldAll = cls.includes("font-bold") || isDocTitle;
          if (boldAll) runs.forEach((r) => (r.bold = true));
          target.push({
            kind: "paragraph",
            runs,
            align: isDocTitle ? "center" : align,
            indent: 0,
            bullet: false,
            fontSize: isDocTitle ? 14 : isSubheading || isHeading ? fontSizeFrom(el, 10.5) : fontSizeFrom(el, 12),
            marginBottom: marginFrom(el, 12),
            color: isDocTitle || isHeading || isSubheading ? "brand" : undefined,
          });
        }
        return;
      }

      // Контейнер с детьми — рекурсивно
      for (const child of children) {
        await collectInto(child, target);
      }
      return;
    }

    if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const runs = nodeRuns(el);
      if (runs.length) {
        const cls = el.className || "";
        target.push({
          kind: "paragraph",
          runs,
          align: "justify",
          indent: 0,
          bullet: false,
          fontSize: fontSizeFrom(el, 12),
          marginBottom: marginFrom(el, 12),
        });
      }
      return;
    }

    // Прочие — рекурсивно по детям.
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) void collectInto(n as HTMLElement, target);
    });
  };

  return collectInto(root, blocks).then(() => blocks);
}

export interface PdfResult {
  blob: Blob;
  pageCount: number;
}

export async function buildPdf(
  html: string | string[],
  options: ExportPdfOptions = {}
): Promise<PdfResult> {
  const list = Array.isArray(html) ? html : [html];
  if (list.length === 0) {
    return { blob: new Blob([], { type: "application/pdf" }), pageCount: 0 };
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const { regular, bold, italic, bolditalic } = await getFontBytes();
  const fonts: FontSet = {
    regular: await pdfDoc.embedFont(regular, { subset: true }),
    bold: await pdfDoc.embedFont(bold, { subset: true }),
    italic: await pdfDoc.embedFont(italic, { subset: true }),
    bolditalic: await pdfDoc.embedFont(bolditalic, { subset: true }),
  };
  const margin: Margin = {
    top: options.margin?.top ?? DEFAULT_MARGIN.top,
    bottom: options.margin?.bottom ?? DEFAULT_MARGIN.bottom,
    left: options.margin?.left ?? DEFAULT_MARGIN.left,
    right: options.margin?.right ?? DEFAULT_MARGIN.right,
  };
  const renderer = new Renderer(pdfDoc, fonts, margin);

  const imgResolver = async (src: string): Promise<PDFImage | null> => {
    if (!src.startsWith("data:image/")) return null;
    const m = src.match(/^data:image\/(png|jpe?g);base64,(.+)$/);
    if (!m) return null;
    try {
      const bin = atob(m[2]);
      const data = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
      const format = m[1] === "png" ? "png" : "jpg";
      return await pdfDoc.embedPng(data).catch(() => (format === "png" ? null : pdfDoc.embedJpg(data).catch(() => null)));
    } catch {
      return null;
    }
  };

  for (const htmlStr of list) {
    const root = new DOMParser().parseFromString(htmlStr, "text/html").body.firstElementChild as HTMLElement | null;
    if (root) {
      const blocks = await collectBlocks(root, imgResolver);
      blocks.forEach((b) => renderer.renderBlock(b));
      renderer.ensureSpace(12);
    }
  }

  renderer.finalize(options.watermark, options.pageNumbers !== false);
  const bytes = await pdfDoc.save();
  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    pageCount: renderer.pageCount,
  };
}

export async function exportToPdf(
  html: string | string[],
  filename: string,
  options: ExportPdfOptions = {}
): Promise<number> {
  const { blob, pageCount } = await buildPdf(html, options);
  saveAs(blob, `${filename}.pdf`);
  return pageCount;
}