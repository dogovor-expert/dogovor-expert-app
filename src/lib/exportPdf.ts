import { saveAs } from "file-saver";
import {
  getDesign,
  pageMetrics,
  sizeFromClass,
  lineHeightFromClass,
  hexToRgb01,
  type DesignId,
  type DesignTokens,
  type PageMetrics,
} from "@/lib/docDesign";
import type { PDFImage, PDFFont, PDFPage, RGB, PDFDocument } from "pdf-lib";

const A4 = { w: 595.28, h: 841.89 };

export interface ExportPdfOptions {
  /** Водяной знак для free-пользователя (рисуется над подвалом каждой страницы). */
  watermark?: string;
  /** Рисовать «Стр. N из M» внизу каждой страницы. По умолчанию true. */
  pageNumbers?: boolean;
  /** Поля страницы в миллиметрах (переопределяют токены дизайна). */
  margin?: Partial<{ top: number; bottom: number; left: number; right: number }>;
  /** Название документа (Title в свойствах PDF). */
  title?: string;
  /** Дизайн документа (по умолчанию «classic»). */
  design?: DesignId;
  /** Готовые байты шрифтов (для генерации вне браузера, напр. образцы). */
  fonts?: DesignFontBytes;
}

export interface DesignFontBytes {
  regular: ArrayBuffer | Uint8Array;
  bold: ArrayBuffer | Uint8Array;
  italic: ArrayBuffer | Uint8Array;
  bolditalic: ArrayBuffer | Uint8Array;
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
  | { kind: "sides"; leftTitle: string; leftBlocks: Block[]; rightTitle: string; rightBlocks: Block[]; fontSize: number; marginBottom: number }
  | { kind: "pricebox"; runs: Run[]; fontSize: number; marginBottom: number };

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  bolditalic: PDFFont;
}

let fontBytesCache: Record<string, DesignFontBytes> = {};

async function fetchFontBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font not found: ${url}`);
  return res.arrayBuffer();
}

async function getFontBytes(
  design: DesignTokens,
  provided?: DesignFontBytes
): Promise<DesignFontBytes> {
  if (provided) return provided;
  const key = design.id;
  if (!fontBytesCache[key]) {
    const [regular, bold, italic, bolditalic] = await Promise.all([
      fetchFontBytes(design.fonts.regular),
      fetchFontBytes(design.fonts.bold),
      fetchFontBytes(design.fonts.italic),
      fetchFontBytes(design.fonts.bolditalic),
    ]);
    fontBytesCache[key] = { regular, bold, italic, bolditalic };
  }
  return fontBytesCache[key];
}

/** Ширина текста — по метрикам встроенного шрифта (без Canvas, работает и в Node). */
function measureText(
  fonts: FontSet,
  text: string,
  fontSize: number,
  bold: boolean,
  italic: boolean
): number {
  const font = italic && bold ? fonts.bolditalic : italic ? fonts.italic : bold ? fonts.bold : fonts.regular;
  return font.widthOfTextAtSize(text, fontSize);
}

type Measure = (text: string, fontSize: number, bold: boolean, italic: boolean) => number;

interface Line {
  words: Word[];
  widths: number[];
  totalWidth: number;
}

function layoutLines(words: Word[], fontSize: number, maxWidth: number, measure: Measure): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  let curWidths: number[] = [];
  let curWidth = 0;
  let pendingSpace = false;
  const spaceWidth = measure(" ", fontSize, false, false);

  // №8 аудита: слово шире строки разрезается посимвольно, иначе оно
  // вылезает за правое поле и обрезается при печати.
  const expanded: Word[] = [];
  for (const w of words) {
    if (measure(w.text, fontSize, w.bold, w.italic) <= maxWidth) {
      expanded.push(w);
      continue;
    }
    let chunk = "";
    for (const ch of w.text) {
      if (measure(chunk + ch, fontSize, w.bold, w.italic) > maxWidth && chunk) {
        expanded.push({ text: chunk, bold: w.bold, italic: w.italic });
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    if (chunk) expanded.push({ text: chunk, bold: w.bold, italic: w.italic });
  }

  for (const w of expanded) {
    const ww = measure(w.text, fontSize, w.bold, w.italic);
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

/** Сжатие «уместить на страницу»: множитель кегля и межстрочный интервал. */
interface Compressed {
  k: number;
  lh: number;
}

function compress(design: DesignTokens, step: number): Compressed {
  return {
    k: 1 - (design.fit.fontSizeStep * step) / 10,
    lh: Math.max(
      design.minLineHeight,
      design.lineHeight - design.fit.lineHeightStep * step
    ),
  };
}

/** Полная высота контента — зеркалит математику Renderer (для fit-логики). */
export function estimateTotalHeight(
  blocks: Block[],
  fonts: FontSet,
  design: DesignTokens,
  comp: Compressed,
  pm: PageMetrics
): number {
  const est = new LayoutEstimator(fonts, design, comp, pm);
  blocks.forEach((b) => est.add(b));
  return est.height;
}

class LayoutEstimator {
  private fonts: FontSet;
  private design: DesignTokens;
  private comp: Compressed;
  private pm: PageMetrics;
  height = 0;

  constructor(fonts: FontSet, design: DesignTokens, comp: Compressed, pm: PageMetrics) {
    this.fonts = fonts;
    this.design = design;
    this.comp = comp;
    this.pm = pm;
  }

  private sz(base: number): number {
    return base * this.comp.k;
  }
  private lh(): number {
    return this.comp.lh;
  }
  private measure: Measure = (text, size, bold, italic) =>
    measureText(this.fonts, text, size, bold, italic);

  add(block: Block, width?: number): void {
    const w = width ?? this.pm.availWidth;
    switch (block.kind) {
      case "paragraph": {
        if (block.runs.length === 0) {
          this.height += this.sz(block.fontSize);
          return;
        }
        const fontSize = this.sz(block.fontSize);
        const maxW = w - block.indent - (block.bullet ? fontSize * 1.2 : 0);
        const lines = layoutLines(toWords(block.runs), fontSize, maxW, this.measure);
        this.height += lines.length * fontSize * this.lh() + block.marginBottom;
        return;
      }
      case "row": {
        const fontSize = this.sz(block.fontSize);
        const leftLines = layoutLines(toWords(block.leftRuns), fontSize, w * 0.5, this.measure);
        const rightLines = layoutLines(toWords(block.rightRuns), fontSize, w * 0.5, this.measure);
        this.height += Math.max(leftLines.length, rightLines.length) * fontSize * this.lh() + block.marginBottom;
        return;
      }
      case "columns": {
        const gap = 8;
        const colW = (w - gap * (block.cols.length - 1)) / block.cols.length;
        const sub = new LayoutEstimator(this.fonts, this.design, this.comp, this.pm);
        block.cols.forEach((col) => col.forEach((b) => sub.add(b, colW)));
        this.height += sub.height + block.marginBottom;
        return;
      }
      case "table": {
        const cols = block.rows[0]?.cells.length || 1;
        const colW = w / cols;
        const pad = 4;
        const fontSize = this.sz(block.fontSize);
        const lh = fontSize * 1.3;
        for (const row of block.rows) {
          let rowLines = 1;
          for (const cell of row.cells) {
            const words = toWords(cell.runs).map((wd) => (cell.bold ? { ...wd, bold: true } : wd));
            const lines = layoutLines(words, fontSize, colW - pad * 2, this.measure);
            rowLines = Math.max(rowLines, lines.length);
          }
          this.height += Math.max(lh, rowLines * lh) + pad * 2;
        }
        this.height += block.marginBottom;
        return;
      }
      case "image":
        this.height += block.height + block.marginBottom;
        return;
      case "line":
        this.height += this.sz(block.fontSize) * this.lh() + 12 + block.marginBottom;
        return;
      case "sides": {
        const gap = 10;
        const colW = (w - gap) / 2;
        const sub = new LayoutEstimator(this.fonts, this.design, this.comp, this.pm);
        block.leftBlocks.forEach((b) => sub.add(b, colW));
        block.rightBlocks.forEach((b) => sub.add(b, colW));
        const titleH = this.sz(block.fontSize || 10) * this.lh() + 8;
        this.height += titleH + sub.height + block.marginBottom;
        return;
      }
      case "pricebox": {
        const pad = 8;
        const fontSize = this.sz(block.fontSize);
        const lines = layoutLines(toWords(block.runs), fontSize, w - pad * 2, this.measure);
        this.height += Math.max(24, lines.length * fontSize * this.lh() + pad * 2) + block.marginBottom;
        return;
      }
    }
  }
}

class Renderer {
  private doc: PDFDocument;
  private fonts: FontSet;
  private design: DesignTokens;
  private pm: PageMetrics;
  private comp: Compressed;
  private rgb: (r: number, g: number, b: number) => RGB;
  private pages: PDFPage[] = [];
  private page: PDFPage;
  private y: number;
  private pageIndex = 0;
  pageCount = 1;
  /** Доля контента на последней странице (0..1) — для орфан-контроля. */
  lastPageUsed = 1;

  constructor(doc: PDFDocument, fonts: FontSet, pm: PageMetrics, design: DesignTokens, comp: Compressed, rgb: (r: number, g: number, b: number) => RGB) {
    this.doc = doc;
    this.fonts = fonts;
    this.pm = pm;
    this.design = design;
    this.comp = comp;
    this.rgb = rgb;
    this.page = doc.addPage([A4.w, A4.h]);
    this.pages.push(this.page);
    this.y = A4.h - pm.marginTop - pm.headerHeight;
  }

  private get availWidth(): number {
    return this.pm.availWidth;
  }
  private get bottomLimit(): number {
    return this.pm.marginBottom + this.pm.footerHeight;
  }
  private sz(base: number): number {
    return base * this.comp.k;
  }
  private lh(): number {
    return this.comp.lh;
  }
  private measure: Measure = (text, size, bold, italic) =>
    measureText(this.fonts, text, size, bold, italic);

  private accentRgb(): RGB {
    const [r, g, b] = hexToRgb01(this.design.accent);
    return this.rgb(r, g, b);
  }
  private grayRgb(): RGB {
    const [r, g, b] = hexToRgb01(this.design.grayText);
    return this.rgb(r, g, b);
  }
  private ruleRgb(): RGB {
    const [r, g, b] = hexToRgb01(this.design.ruleColor);
    return this.rgb(r, g, b);
  }

  drawHeader() {
    const pm = this.pm;
    const strong = this.design.logoWeight === "strong";
    const wordSize = strong ? this.design.smallFontSize : this.design.tinyFontSize;
    const tagSize = this.design.tinyFontSize * 0.9;
    const top = A4.h - pm.marginTop;
    const wordmark = this.design.wordmark;
    const tagline = this.design.tagline;
    const ww = this.measure(wordmark, wordSize, true, false);
    const tw = this.measure(tagline, tagSize, false, false);
    const blockW = Math.max(ww, tw);

    let x = pm.marginLeft;
    if (this.design.headerAlign === "right") x = A4.w - pm.marginRight - blockW;
    else if (this.design.headerAlign === "center") x = pm.marginLeft + (pm.availWidth - blockW) / 2;

    const wordColor = strong ? this.accentRgb() : this.rgb(0.15, 0.15, 0.17);
    this.page.drawText(wordmark, {
      x,
      y: top - wordSize - 2,
      size: wordSize,
      font: this.fonts.bold,
      color: wordColor,
    });
    this.page.drawText(tagline, {
      x: x + (blockW - tw),
      y: top - wordSize - tagSize - 5,
      size: tagSize,
      font: this.fonts.regular,
      color: this.grayRgb(),
    });

    // Тонкая линия под шапкой (минимализм и фирменный).
    if (this.design.id !== "classic") {
      const ly = top - pm.headerHeight + 3;
      this.page.drawLine({
        start: { x: pm.marginLeft, y: ly },
        end: { x: A4.w - pm.marginRight, y: ly },
        thickness: 0.5,
        color: this.ruleRgb(),
      });
    }
  }

  private drawFooter(page: PDFPage, index: number, total: number, watermark?: string) {
    const pm = this.pm;
    const size = this.design.tinyFontSize;
    const lineY = pm.marginBottom + pm.footerHeight - 5;
    page.drawLine({
      start: { x: pm.marginLeft, y: lineY },
      end: { x: A4.w - pm.marginRight, y: lineY },
      thickness: 0.5,
      color: this.ruleRgb(),
    });
    const textY = pm.marginBottom + 3;
    const label = `Стр. ${index + 1} из ${total}`;
    page.drawText(label, {
      x: pm.marginLeft,
      y: textY,
      size,
      font: this.fonts.regular,
      color: this.grayRgb(),
    });
    const site = `Сформировано на ${this.design.siteUrl}`;
    const sw = this.measure(site, size, false, false);
    page.drawText(site, {
      x: A4.w - pm.marginRight - sw,
      y: textY,
      size,
      font: this.fonts.regular,
      color: this.grayRgb(),
    });
    if (watermark) {
      const ww = this.measure(watermark, size, false, false);
      page.drawText(watermark, {
        x: pm.marginLeft + (pm.availWidth - ww) / 2,
        y: lineY + 2,
        size,
        font: this.fonts.regular,
        color: this.rgb(0.55, 0.55, 0.6),
      });
    }
  }

  ensureSpace(needed: number) {
    if (this.y - needed < this.bottomLimit) {
      this.lastPageUsed =
        (A4.h - this.pm.marginTop - this.pm.headerHeight - this.y) /
        Math.max(1, this.pm.availHeight);
      this.page = this.doc.addPage([A4.w, A4.h]);
      this.pages.push(this.page);
      this.pageIndex++;
      this.y = A4.h - this.pm.marginTop - this.pm.headerHeight;
      this.drawHeader();
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
    const spaceWidth = this.measure(" ", fontSize, false, false);
    const spaces = line.words.length - 1;
    let lineWidth = line.totalWidth;
    let extraSpace = 0;
    if (align === "justify" && !isLastLine && spaces > 0) {
      const free = maxWidth - lineWidth;
      extraSpace = free / spaces;
    }
    if (align === "center") x += (maxWidth - lineWidth) / 2;
    if (align === "right") x += maxWidth - lineWidth;

    const sameStyle = line.words.every(
      (wd) => wd.bold === line.words[0].bold && wd.italic === line.words[0].italic
    );
    if (sameStyle) {
      const first = line.words[0];
      const font = first.italic && first.bold ? this.fonts.bolditalic : first.italic ? this.fonts.italic : first.bold ? this.fonts.bold : this.fonts.regular;
      this.page.drawText(line.words.map((wd) => wd.text).join(" "), {
        x,
        y,
        size: fontSize,
        font,
        ...(color ? { color } : {}),
      });
      return;
    }

    let cursor = x;
    line.words.forEach((wd, i) => {
      const font = wd.italic && wd.bold ? this.fonts.bolditalic : wd.italic ? this.fonts.italic : wd.bold ? this.fonts.bold : this.fonts.regular;
      this.page.drawText(wd.text, { x: cursor, y, size: fontSize, font, ...(color ? { color } : {}) });
      cursor += line.widths[i] + (i < line.words.length - 1 ? spaceWidth + extraSpace : 0);
    });
  }

  private paragraph(block: Extract<Block, { kind: "paragraph" }>) {
    const words = toWords(block.runs);
    const fontSize = this.sz(block.fontSize);
    if (words.length === 0) {
      this.y -= fontSize;
      return;
    }
    const indent = block.indent;
    const maxWidth = this.availWidth - indent;
    const lines = layoutLines(words, fontSize, maxWidth, this.measure);
    const lineHeight = fontSize * this.lh();
    lines.forEach((line, i) => {
      const isLast = i === lines.length - 1;
      this.ensureSpace(lineHeight);
      const x = this.pm.marginLeft + indent + (block.bullet ? fontSize * 1.2 : 0);
      this.drawLineOfWords(
        line,
        fontSize,
        x,
        this.y - fontSize,
        block.align,
        isLast || block.align !== "justify",
        maxWidth - (block.bullet ? fontSize * 1.2 : 0),
        block.color === "brand" ? this.accentRgb() : undefined
      );
      if (block.bullet && i === 0) {
        this.page.drawText("•", {
          x: this.pm.marginLeft + indent,
          y: this.y - fontSize,
          size: fontSize,
          font: this.fonts.regular,
          ...(block.color === "brand" ? { color: this.accentRgb() } : {}),
        });
      }
      this.y -= lineHeight;
    });
    this.y -= block.marginBottom;
  }

  private row(block: Extract<Block, { kind: "row" }>) {
    const fontSize = this.sz(block.fontSize);
    const lineHeight = fontSize * this.lh();
    this.ensureSpace(lineHeight);
    const leftWords = toWords(block.leftRuns);
    const rightWords = toWords(block.rightRuns);
    const leftLines = layoutLines(leftWords, fontSize, this.availWidth * 0.5, this.measure);
    const rightLines = layoutLines(rightWords, fontSize, this.availWidth * 0.5, this.measure);
    const maxLines = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < maxLines; i++) {
      this.ensureSpace(lineHeight);
      const y = this.y - fontSize;
      const left = leftLines[i];
      const right = rightLines[i];
      if (left) this.drawLineOfWords(left, fontSize, this.pm.marginLeft, y, "left", true, this.availWidth * 0.5);
      if (right) {
        const xRight = this.pm.marginLeft + this.availWidth;
        const width = this.availWidth * 0.5;
        const rightX = xRight - width;
        this.drawLineOfWords(right, fontSize, rightX, y, "right", true, width);
      }
      this.y -= lineHeight;
    }
    this.y -= block.marginBottom;
  }

  private columns(block: Extract<Block, { kind: "columns" }>) {
    const gap = 8;
    const colWidth = (this.availWidth - gap * (block.cols.length - 1)) / block.cols.length;
    const colHeights = block.cols.map((col) => {
      const sub = new LayoutEstimator(this.fonts, this.design, this.comp, this.pm);
      col.forEach((b) => sub.add(b, colWidth));
      return sub.height;
    });
    const maxColHeight = Math.max(0, ...colHeights);
    this.ensureSpace(maxColHeight);
    const startY = this.y;
    block.cols.forEach((col, ci) => {
      const x = this.pm.marginLeft + ci * (colWidth + gap);
      this.y = startY;
      col.forEach((b) => this.renderBlockWithWidth(b, x, colWidth));
    });
    this.y = startY - maxColHeight - block.marginBottom;
  }

  private renderBlockWithWidth(block: Block, x: number, width: number) {
    if (block.kind === "paragraph") {
      const words = toWords(block.runs);
      const fontSize = this.sz(block.fontSize);
      const lines = layoutLines(words, fontSize, width - block.indent, this.measure);
      const lineHeight = fontSize * this.lh();
      lines.forEach((line, i) => {
        const isLast = i === lines.length - 1;
        const indent = block.indent + (block.bullet ? fontSize * 1.2 : 0);
        this.drawLineOfWords(
          line,
          fontSize,
          x + indent,
          this.y - fontSize,
          block.align,
          isLast || block.align !== "justify",
          width - indent,
          block.color === "brand" ? this.accentRgb() : undefined
        );
        if (block.bullet && i === 0) {
          this.page.drawText("•", {
            x: x + block.indent,
            y: this.y - fontSize,
            size: fontSize,
            font: this.fonts.regular,
            ...(block.color === "brand" ? { color: this.accentRgb() } : {}),
          });
        }
        this.y -= lineHeight;
      });
      this.y -= block.marginBottom;
    } else if (block.kind === "line") {
      const fontSize = this.sz(block.fontSize);
      const lineHeight = fontSize * this.lh();
      const ly = this.y - lineHeight - 8;
      this.page.drawLine({ start: { x, y: ly }, end: { x: x + Math.min(width, 120), y: ly }, thickness: 0.7, color: this.ruleRgb() });
      this.drawLabel(block.label, x, this.y - fontSize, fontSize, this.grayRgb());
      this.y -= lineHeight + block.marginBottom + 12;
    } else if (block.kind === "row") {
      const fontSize = this.sz(block.fontSize);
      const half = width / 2;
      const lineHeight = fontSize * this.lh();
      const leftLines = layoutLines(toWords(block.leftRuns), fontSize, half, this.measure);
      const rightLines = layoutLines(toWords(block.rightRuns), fontSize, half, this.measure);
      const lines = Math.max(leftLines.length, rightLines.length);
      for (let i = 0; i < lines; i++) {
        if (leftLines[i]) {
          this.drawLineOfWords(leftLines[i], fontSize, x, this.y - fontSize - i * lineHeight, "left", true, half);
        }
        if (rightLines[i]) {
          this.drawLineOfWords(rightLines[i], fontSize, x + half, this.y - fontSize - i * lineHeight, "left", true, half);
        }
      }
      this.y -= lines * lineHeight + block.marginBottom;
    } else if (block.kind === "image") {
      this.page.drawImage(block.img, { x, y: this.y - block.height, width: block.width, height: block.height });
      this.y -= block.height + block.marginBottom;
    } else if (block.kind === "table") {
      this.table(block, x, width);
    } else if (block.kind === "sides") {
      this.sides(block, x, width);
    } else if (block.kind === "pricebox") {
      this.pricebox(block, x, width);
    }
  }

  private sides(block: Extract<Block, { kind: "sides" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const x0 = fixedX ?? this.pm.marginLeft;
    const width = fixedWidth ?? this.availWidth;
    const gap = 10;
    const colWidth = (width - gap) / 2;
    const colHeights = [block.leftBlocks, block.rightBlocks].map((col) => {
      const sub = new LayoutEstimator(this.fonts, this.design, this.comp, this.pm);
      col.forEach((b) => sub.add(b, colWidth));
      return sub.height;
    });
    const titleSize = this.sz(block.fontSize || 10);
    const titleHeight = titleSize * this.lh() + 8;
    const maxColHeight = Math.max(0, ...colHeights);
    this.ensureSpace(titleHeight + maxColHeight);
    const startY = this.y;
    const style = this.design.sideTitleStyle;
    const drawCol = (title: string, blocks: Block[], x: number) => {
      if (title) {
        if (style === "fill" && this.design.tableHeadFill) {
          const [r, g, b] = hexToRgb01(this.design.tableHeadFill);
          this.page.drawRectangle({
            x,
            y: startY - titleHeight,
            width: colWidth,
            height: titleHeight,
color: this.rgb(r, g, b),
          });
          this.page.drawText(title, {
            x: x + 6,
            y: startY - (titleHeight + titleSize) / 2,
            size: titleSize,
            font: this.fonts.bold,
            color: this.accentRgb(),
          });
        } else if (style === "rule") {
          this.page.drawText(title, {
            x,
            y: startY - (titleHeight + titleSize) / 2,
            size: titleSize,
            font: this.fonts.bold,
            color: this.accentRgb(),
          });
          this.page.drawLine({
            start: { x, y: startY - titleHeight + 1 },
            end: { x: x + colWidth, y: startY - titleHeight + 1 },
            thickness: 0.6,
            color: this.ruleRgb(),
          });
        } else {
          this.page.drawRectangle({
            x,
            y: startY - titleHeight + 4,
            width: 2.2,
            height: titleHeight - 8,
            color: this.accentRgb(),
          });
          this.page.drawText(title, {
            x: x + 8,
            y: startY - (titleHeight + titleSize) / 2,
            size: titleSize,
            font: this.fonts.bold,
            color: this.accentRgb(),
          });
        }
      }
      this.y = startY - titleHeight;
      blocks.forEach((b) => this.renderBlockWithWidth(b, x, colWidth));
    };
    drawCol(block.leftTitle, block.leftBlocks, x0);
    this.y = startY;
    drawCol(block.rightTitle, block.rightBlocks, x0 + colWidth + gap);
    this.y = startY - titleHeight - maxColHeight - block.marginBottom;
  }

  private pricebox(block: Extract<Block, { kind: "pricebox" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const x0 = fixedX ?? this.pm.marginLeft;
    const width = fixedWidth ?? this.availWidth;
    const pad = 8;
    const fontSize = this.sz(block.fontSize);
    const words = toWords(block.runs);
    const lines = layoutLines(words, fontSize, width - pad * 2, this.measure);
    const height = Math.max(24, lines.length * fontSize * this.lh() + pad * 2);
    this.ensureSpace(height);
    this.page.drawRectangle({
      x: x0,
      y: this.y - height,
      width,
      height,
      borderColor: this.accentRgb(),
      borderWidth: 0.8,
    });
    lines.forEach((line, i) => {
      this.drawLineOfWords(line, fontSize, x0 + pad, this.y - pad - fontSize - i * fontSize * this.lh(), "left", true, width - pad * 2, this.accentRgb());
    });
    this.y -= height + block.marginBottom;
  }

  private table(block: Extract<Block, { kind: "table" }>, fixedX: number | null = null, fixedWidth: number | null = null) {
    const cols = block.rows[0]?.cells.length || 1;
    const x0 = fixedX ?? this.pm.marginLeft;
    const width = fixedWidth ?? this.availWidth;
    const colWidth = width / cols;
    const cellPad = 4;
    const fontSize = this.sz(block.fontSize);
    const lineHeight = fontSize * 1.3;
    const borderColor = this.tableBorderRgb();
    const borders = this.design.tableBorders;
    const accent = this.accentRgb();

    block.rows.forEach((row, ri) => {
      const cells = row.cells;
      const rowLines = cells.map((cell) => {
        const words = toWords(cell.runs).map((wd) => (cell.bold ? { ...wd, bold: true } : wd));
        return layoutLines(words, fontSize, colWidth - cellPad * 2, this.measure);
      });
      const rowHeight = Math.max(lineHeight, ...rowLines.map((l) => l.length * lineHeight)) + cellPad * 2;
      this.ensureSpace(rowHeight);
      const yTop = this.y;
      const yBottom = this.y - rowHeight;

      if (borders === "all") {
        cells.forEach((cell, ci) => {
          const cx = x0 + ci * colWidth;
          this.page.drawRectangle({
            x: cx,
            y: yBottom,
            width: colWidth,
            height: rowHeight,
            borderColor,
            borderWidth: 0.5,
          });
        });
      } else {
        const isFirst = ri === 0;
        const isLast = ri === block.rows.length - 1;
        if (borders === "accent-top" && isFirst) {
          this.page.drawLine({ start: { x: x0, y: yTop }, end: { x: x0 + width, y: yTop }, thickness: 1, color: accent });
        } else if (isFirst) {
          this.page.drawLine({ start: { x: x0, y: yTop }, end: { x: x0 + width, y: yTop }, thickness: 0.5, color: borderColor });
        }
        if (isLast) {
          this.page.drawLine({ start: { x: x0, y: yBottom }, end: { x: x0 + width, y: yBottom }, thickness: 0.5, color: borderColor });
        }
      }

      // Заливка шапки таблицы.
      if (ri === 0 && this.design.tableHeadFill && borders === "all") {
        const [r, g, b] = hexToRgb01(this.design.tableHeadFill);
        this.page.drawRectangle({
          x: x0,
          y: yBottom,
          width,
          height: rowHeight,
          color: this.rgb(r, g, b),
        });
      }

      cells.forEach((cell, ci) => {
        const cx = x0 + ci * colWidth;
        const lines = rowLines[ci];
        lines.forEach((line, li) => {
          const ly = yTop - cellPad - lineHeight * li - fontSize;
          this.drawLineOfWords(line, fontSize, cx + cellPad, ly, "left", true, colWidth - cellPad * 2, cell.bold ? this.accentRgb() : undefined);
        });
      });
      this.y = yBottom;
    });
    this.y -= block.marginBottom;
  }

  private tableBorderRgb(): RGB {
    const [r, g, b] = hexToRgb01(this.design.tableBorderColor);
    return this.rgb(r, g, b);
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
        this.page.drawImage(block.img, { x: this.pm.marginLeft, y: this.y - block.height, width: block.width, height: block.height });
        this.y -= block.height + block.marginBottom;
        break;
      }
      case "line": {
        const fontSize = this.sz(block.fontSize);
        const lineHeight = fontSize * this.lh();
        this.ensureSpace(lineHeight + 12);
        const ly = this.y - lineHeight - 8;
        this.page.drawLine({ start: { x: this.pm.marginLeft, y: ly }, end: { x: this.pm.marginLeft + Math.min(this.availWidth, 120), y: ly }, thickness: 0.7, color: this.ruleRgb() });
        this.drawLabel(block.label, this.pm.marginLeft, this.y - fontSize, fontSize, this.grayRgb());
        this.y -= lineHeight + block.marginBottom + 12;
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

  private drawLabel(text: string, x: number, y: number, fontSize: number, color?: RGB) {
    const words = toWords([{ text, bold: false, italic: false }]);
    const lines = layoutLines(words, fontSize, this.availWidth, this.measure);
    lines.forEach((line) => this.drawLineOfWords(line, fontSize, x, y, "left", true, this.availWidth, color));
  }

  finalize(watermark?: string, pageNumbers = true) {
    this.pageCount = this.pages.length;
    this.lastPageUsed =
      (A4.h - this.pm.marginTop - this.pm.headerHeight - this.y) /
      Math.max(1, this.pm.availHeight);
    this.pages.forEach((page, i) => {
      this.drawFooter(page, i, this.pageCount, watermark);
    });
  }
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
  return cls.split(/\s+/).filter(Boolean).includes(token);
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

function collectBlocks(
  root: HTMLElement,
  design: DesignTokens,
  imgResolver: (src: string) => Promise<PDFImage | null>
): Promise<Block[]> {
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
        target.push({ kind: "table", rows, fontSize: design.bodyFontSize, marginBottom: 12 });
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
          fontSize: design.bodyFontSize,
          marginBottom: 4,
        });
      });
      target.push({ kind: "paragraph", runs: [{ text: "", bold: false, italic: false }], align: "left", indent: 0, bullet: false, fontSize: 4, marginBottom: 4 });
      return;
    }

    if (isBlockContainer(el)) {
      const cls = el.className || "";

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
            fontSize: design.subheadingFontSize,
            marginBottom: 12,
          });
        }
        return;
      }

      if (hasClass(el, "doc-price")) {
        const runs = nodeRuns(el);
        if (runs.length) {
          target.push({ kind: "pricebox", runs, fontSize: design.bodyFontSize, marginBottom: 12 });
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
            fontSize: sizeFromClass(cls, design, design.smallFontSize),
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
                b.push({ kind: "line", label: (sc.textContent || "").trim(), fontSize: sizeFromClass(sc.className || "", design, design.tinyFontSize), marginBottom: 6 });
              } else {
                const runs = nodeRuns(sc);
                if (runs.length) b.push({ kind: "paragraph", runs, align: "left", indent: 0, bullet: false, fontSize: sizeFromClass(sc.className || "", design, design.smallFontSize), marginBottom: marginFrom(sc, 4) });
              }
            });
          } else if (hasClass(c, "border-b")) {
            b.push({ kind: "line", label: (c.textContent || "").trim(), fontSize: sizeFromClass(c.className || "", design, design.tinyFontSize), marginBottom: 6 });
          } else {
            const runs = nodeRuns(c);
            if (runs.length) b.push({ kind: "paragraph", runs, align: "left", indent: 0, bullet: false, fontSize: sizeFromClass(c.className || "", design, design.smallFontSize), marginBottom: 2 });
          }
          cols[target].push(...b);
          return Promise.all(loaders).then(() => undefined);
        };
        await Promise.all(children.map((c, i) => addInline(c, i % n)));
        if (cols.some((c) => c.length)) {
          target.push({ kind: "columns", cols, fontSize: design.smallFontSize, marginBottom: 12 });
        }
        return;
      }

      const isSubheading =
        cls.includes("font-bold") && cls.includes("uppercase") && (cls.includes("text-black") || cls.includes("mb-2"));
      const isHeading = cls.includes("text-center") && cls.includes("font-bold");
      const isDocTitle = hasClass(el, "doc-title");

      if (hasClass(el, "border-b")) {
        target.push({
          kind: "line",
          label: (el.textContent || "").trim(),
          fontSize: sizeFromClass(cls, design, design.tinyFontSize),
          marginBottom: marginFrom(el, 6),
        });
        return;
      }

      if (children.length === 0) {
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
            fontSize: isDocTitle
              ? design.titleFontSize
              : isSubheading || isHeading
                ? design.subheadingFontSize
                : sizeFromClass(cls, design, design.bodyFontSize),
            marginBottom: marginFrom(el, 12),
            color: isDocTitle || isHeading || isSubheading ? "brand" : undefined,
          });
        }
        return;
      }

      const clone = el.cloneNode(true) as HTMLElement;
      Array.from(clone.children).forEach((c) => c.remove());
      const directRuns = nodeRuns(clone);
      if (directRuns.length) {
        const align = cls.includes("text-center") ? "center" : cls.includes("text-right") ? "right" : "justify";
        target.push({
          kind: "paragraph",
          runs: directRuns,
          align,
          indent: 0,
          bullet: false,
          fontSize: sizeFromClass(cls, design, design.bodyFontSize),
          marginBottom: marginFrom(el, 6),
        });
      }
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
          fontSize: sizeFromClass(cls, design, design.bodyFontSize),
          marginBottom: marginFrom(el, 12),
        });
      }
      return;
    }

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

  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ]);

  const design = getDesign(options.design);
  const pm = pageMetrics(design);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle(options.title || "Договор");
  pdfDoc.setAuthor("Dogovor.expert");
  pdfDoc.setCreator("Dogovor.expert");
  pdfDoc.setProducer("pdf-lib");
  pdfDoc.setSubject("Юридический документ, сформированный на Dogovor.expert");
  pdfDoc.setKeywords(["договор", "документ", "dogovor"]);
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());
  const bytes = await getFontBytes(design, options.fonts);
  const fonts: FontSet = {
    regular: await pdfDoc.embedFont(bytes.regular, { subset: true }),
    bold: await pdfDoc.embedFont(bytes.bold, { subset: true }),
    italic: await pdfDoc.embedFont(bytes.italic, { subset: true }),
    bolditalic: await pdfDoc.embedFont(bytes.bolditalic, { subset: true }),
  };

  const margin = {
    top: (options.margin?.top ?? design.marginTop) * 2.834645669,
    bottom: (options.margin?.bottom ?? design.marginBottom) * 2.834645669,
    left: (options.margin?.left ?? design.marginLeft) * 2.834645669,
    right: (options.margin?.right ?? design.marginRight) * 2.834645669,
  };
  const usedPm: PageMetrics = { ...pm, ...margin };

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

  const blocks: Block[] = [];
  for (const htmlStr of list) {
    const root = new DOMParser().parseFromString(htmlStr, "text/html").body.firstElementChild as HTMLElement | null;
    if (root) {
      const collected = await collectBlocks(root, design, imgResolver);
      blocks.push(...collected);
    }
  }

  // Логика «уместить на страницу»: сначала оценка, затем рендер.
  const render = (step: number) => {
    const comp = compress(design, step);
    const renderer = new Renderer(pdfDoc, fonts, usedPm, design, comp, rgb);
    renderer.drawHeader();
    blocks.forEach((b) => renderer.renderBlock(b));
    renderer.finalize(options.watermark, options.pageNumbers !== false);
    return renderer;
  };

  let step = 0;
  const cap1 = usedPm.availHeight;
  if (estimateTotalHeight(blocks, fonts, design, compress(design, 0), usedPm) > cap1) {
    for (let s = 1; s <= design.fit.maxSteps; s++) {
      if (estimateTotalHeight(blocks, fonts, design, compress(design, s), usedPm) <= cap1) {
        step = s;
        break;
      }
    }
  }

  let renderer = render(step);
  // Орфан-контроль: последняя страница почти пустая (только подписи/дата) —
  // сжимаем, чтобы не оставлять «сиротскую» страницу. Каждая попытка рендера
  // добавляет страницы в тот же pdfDoc — предыдущий прогон удаляем, иначе
  // страницы документируются дважды.
  let guard = 0;
  while (
    renderer.pageCount > 1 &&
    renderer.lastPageUsed < 0.3 &&
    step < design.fit.maxSteps &&
    guard < design.fit.maxSteps
  ) {
    step++;
    guard++;
    const prevCount = pdfDoc.getPageCount();
    renderer = render(step);
    for (let i = 0; i < prevCount; i++) pdfDoc.removePage(0);
  }

  const bytesOut = await pdfDoc.save();
  return {
    blob: new Blob([bytesOut as unknown as BlobPart], { type: "application/pdf" }),
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