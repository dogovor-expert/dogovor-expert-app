/**
 * Экспорт в DOCX с ленивой загрузкой библиотеки docx.
 * Используется для уменьшения начального бандла.
 * Функциональность идентична exportDocx.ts, но библиотеки загружаются динамически.
 */

import { A4_MM, mmToTwips } from "@/lib/page-geometry";
import { saveAs } from 'file-saver';
import {
  getDesign,
  sizeFromClass,
  lineHeightFromClass,
  type DesignId,
  type DesignTokens,
} from '@/lib/docDesign';
import { loadDocx } from './docx-loader';
import type { AlignmentType, Document } from 'docx';

/** Тип динамически загружаемого модуля docx (см. loadDocx). */
type DocxModule = Awaited<ReturnType<typeof loadDocx>>;

// Type aliases для конструкторов/констант docx — избегаем `any` при ленивой
// загрузке модуля и коллизий с именами параметров функций.
type HeaderClass = DocxModule["Header"];
type FooterClass = DocxModule["Footer"];
type ParagraphClass = DocxModule["Paragraph"];
type TextRunClass = DocxModule["TextRun"];
type AlignmentTypeClass = DocxModule["AlignmentType"];
type BorderStyleClass = DocxModule["BorderStyle"];
type PageNumberClass = DocxModule["PageNumber"];
type TabStopTypeClass = DocxModule["TabStopType"];
type ImageRunClass = DocxModule["ImageRun"];
type UnderlineTypeClass = DocxModule["UnderlineType"];
type TableClass = DocxModule["Table"];
type TableRowClass = DocxModule["TableRow"];
type TableCellClass = DocxModule["TableCell"];
type ShadingTypeClass = DocxModule["ShadingType"];
type WidthTypeClass = DocxModule["WidthType"];

type Align = (typeof AlignmentType)[keyof typeof AlignmentType] | undefined;

const BLOCK_TAGS = new Set([
  'div', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'section', 'article',
]);

interface InlineItem {
  text?: string;
  bold: boolean;
  italic: boolean;
  img?: { data: Uint8Array; width: number; height: number };
  blank?: number;
}

function hasClass(el: HTMLElement, token: string): boolean {
  const cls = el.className || '';
  return cls.split(/\s+/).includes(token);
}

function halfPoints(pt: number): number {
  return Math.round(pt * 2);
}

function lineUnits(design: DesignTokens, lh: number): number {
  return Math.round(240 * lh);
}

function collectInline(node: Node, bold = false, italic = false): InlineItem[] {
  const out: InlineItem[] = [];
  const walk = (n: Node, b: boolean, i: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent || '').replace(/\u00A0/g, ' ');
      if (t.trim()) out.push({ text: t, bold: b, italic: i });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') return;
    if (hasClass(el, 'blank-field')) {
      const style = el.getAttribute('style') || '';
      const m = style.match(/min-width:\s*(\d+)ch/i);
      const n = m ? Number(m[1]) : 0;
      if (n > 0) out.push({ bold: b, italic: i, blank: n });
      return;
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      const m = src.match(/^data:image\/png;base64,(.+)$/);
      if (m) {
        try {
          const bin = atob(m[1]);
          const data = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
          out.push({ bold: b, italic: i, img: { data, width: 100, height: 40 } });
        } catch {
          return;
        }
      }
      return;
    }
    const nb = b || tag === 'strong' || tag === 'b';
    const ni = i || tag === 'em' || tag === 'i';
    el.childNodes.forEach((c) => walk(c, nb, ni));
  };
  node.childNodes.forEach((c) => walk(c, bold, italic));
  return out;
}

function toRuns(
  items: InlineItem[],
  design: DesignTokens,
  opts: { size?: number; boldAll?: boolean; brand?: boolean; caps?: boolean } = {},
  TextRun: TextRunClass,
  ImageRun: ImageRunClass,
  UnderlineType: UnderlineTypeClass
): (InstanceType<TextRunClass> | InstanceType<ImageRunClass>)[] {
  return items.map((it) => {
    if (it.img) {
      return new ImageRun({
        type: 'png',
        data: it.img.data,
        transformation: { width: it.img.width, height: it.img.height },
      });
    }
    if (it.blank) {
      return new TextRun({
        text: '\u00A0'.repeat(it.blank),
        size: opts.size ?? halfPoints(design.bodyFontSize),
        font: design.fonts.officeFamily,
        bold: opts.boldAll ?? it.bold,
        italics: it.italic,
        underline: { type: UnderlineType.SINGLE, color: design.ruleColor === 'auto' ? undefined : design.ruleColor },
      });
    }
    return new TextRun({
      text: opts.caps && it.text ? it.text.toUpperCase() : it.text || '',
      size: opts.size ?? halfPoints(design.bodyFontSize),
      font: design.fonts.officeFamily,
      bold: opts.boldAll ?? it.bold,
      italics: it.italic,
      color: opts.brand ? design.accent : undefined,
    });
  });
}

function hasBlockDescendant(el: HTMLElement): boolean {
  return Array.from(el.children).some((c) => {
    const tag = (c as HTMLElement).tagName.toLowerCase();
    return tag === 'table' || BLOCK_TAGS.has(tag) || hasBlockDescendant(c as HTMLElement);
  });
}

function buildTable(el: HTMLTableElement, design: DesignTokens, Table: TableClass, TableRow: TableRowClass, TableCell: TableCellClass, BorderStyle: BorderStyleClass, ShadingType: ShadingTypeClass, WidthType: WidthTypeClass, Paragraph: ParagraphClass, TextRun: TextRunClass, ImageRun: ImageRunClass, UnderlineType: UnderlineTypeClass): InstanceType<TableClass> {
  const rows: InstanceType<TableRowClass>[] = [];
  const borderColor = design.tableBorderColor;
  const borders = design.tableBorders;
  const accent = design.accent;
  const base = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  const accentTop = { style: BorderStyle.SINGLE, size: 8, color: accent };

  const allBorders = {
    top: base, bottom: base, left: base, right: base,
    insideHorizontal: base, insideVertical: base,
  };
  const horizontalBorders = {
    top: base, bottom: base, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  const accentTopBorders = {
    top: accentTop, bottom: base, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  const tableBordersObj =
    borders === 'all' ? allBorders : borders === 'accent-top' ? accentTopBorders : horizontalBorders;

  const rowsArray = el.querySelectorAll('tr');
  for (const tr of Array.from(rowsArray)) {
    const cells: InstanceType<TableCellClass>[] = [];
    const tdElements = tr.querySelectorAll('td, th');
    for (const td of Array.from(tdElements)) {
      const isHead = td.tagName === 'TH';
      const items = collectInline(td, isHead).map((it) => ({
        ...it,
        bold: isHead || it.bold,
      }));
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: toRuns(items, design, {
                size: halfPoints(design.bodyFontSize),
                boldAll: isHead,
              }, TextRun, ImageRun, UnderlineType),
              spacing: { line: lineUnits(design, 1.15) },
            }),
          ],
          width: {
            size: Math.floor(100 / Math.max(tdElements.length, 1)),
            type: WidthType.PERCENTAGE,
          },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          ...(isHead && design.tableHeadFill
            ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill: design.tableHeadFill } }
            : {}),
        })
      );
    }
    if (cells.length) rows.push(new TableRow({ children: cells }));
  }
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBordersObj,
  });
}

function buildParagraph(
  items: InlineItem[],
  design: DesignTokens,
  Paragraph: ParagraphClass,
  TextRun: TextRunClass,
  AlignmentType: AlignmentTypeClass,
  TabStopType: TabStopTypeClass,
  BorderStyle: BorderStyleClass,
  ShadingType: ShadingTypeClass,
  ImageRun: ImageRunClass,
  UnderlineType: UnderlineTypeClass,
  opts: {
    align?: Align;
    size?: number;
    boldAll?: boolean;
    brand?: boolean;
    caps?: boolean;
    borderBottom?: boolean;
    borderLeftAccent?: boolean;
    box?: boolean;
    shading?: string;
    tabRight?: boolean;
    spaceBefore?: number;
    spaceAfter?: number;
    lh?: number;
  } = {}
): InstanceType<ParagraphClass> {
  const line = opts.lh ?? design.lineHeight;
  return new Paragraph({
    children: toRuns(items, design, opts, TextRun, ImageRun, UnderlineType),
    alignment: opts.align,
    spacing: {
      before: opts.spaceBefore ?? 40,
      after: opts.spaceAfter ?? 80,
      line: lineUnits(design, line),
    },
    ...(opts.borderBottom
      ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: design.ruleColor } } }
      : {}),
    ...(opts.borderLeftAccent
      ? { border: { left: { style: BorderStyle.SINGLE, size: 18, color: design.accent } } }
      : {}),
    ...(opts.box
      ? {
          border: {
            left: { style: BorderStyle.SINGLE, size: 8, color: design.accent },
            right: { style: BorderStyle.SINGLE, size: 8, color: design.accent },
            top: { style: BorderStyle.SINGLE, size: 8, color: design.accent },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: design.accent },
          },
        }
      : {}),
    ...(opts.shading
      ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill: opts.shading } }
      : {}),
    ...(opts.tabRight
      ? {
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: contentWidthTwips(design),
            },
          ],
        }
      : {}),
  });
}

function contentWidthTwips(design: DesignTokens): number {
  // Единый источник геометрии (см. exportDocx.ts) — вместо магических
  // «595.28 * 20» и «56.6929134», продублированных в обоих DOCX-движках.
  return mmToTwips(A4_MM.w) - mmToTwips(design.marginLeft) - mmToTwips(design.marginRight);
}

async function parseHtmlToDocx(
  html: string,
  design: DesignTokens,
  docxModule: DocxModule
): Promise<(InstanceType<ParagraphClass> | InstanceType<TableClass>)[]> {
  const {
    Paragraph, Table, TableRow, TableCell,
    TextRun, ImageRun, AlignmentType, BorderStyle, ShadingType,
    TabStopType, WidthType, TableBorders, UnderlineType,
  } = docxModule;

  const elements: (InstanceType<ParagraphClass> | InstanceType<TableClass>)[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const walk = async (
    el: HTMLElement,
    target: (InstanceType<ParagraphClass> | InstanceType<TableClass>)[]
  ) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style') return;

    if (tag === 'table') {
      const table = buildTable(el as HTMLTableElement, design, Table, TableRow, TableCell, BorderStyle, ShadingType, WidthType, Paragraph, TextRun, ImageRun, UnderlineType);
      target.push(table);
      target.push(new Paragraph({ children: [], spacing: { after: 80 } }));
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li'));
      for (const li of items) {
        const inlineItems = [
          { text: '\u2022  ', bold: false, italic: false },
          ...collectInline(li),
        ];
        target.push(
          buildParagraph(inlineItems, design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
            align: AlignmentType.LEFT,
            size: halfPoints(design.bodyFontSize),
          })
        );
      }
      return;
    }

    if (!BLOCK_TAGS.has(tag)) {
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.ELEMENT_NODE) await walk(child as HTMLElement, target);
      }
      return;
    }

    if (hasClass(el, 'border-b') && !el.textContent?.trim()) {
      target.push(
        buildParagraph([], design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
          size: halfPoints(design.tinyFontSize),
          borderBottom: true,
          spaceBefore: 0,
          spaceAfter: 80,
        })
      );
      return;
    }

    if (hasClass(el, 'doc-sides')) {
      const style = design.sideTitleStyle;
      const colWidths = Array.from(el.children).map(() => 50);
      const cells: InstanceType<ParagraphClass>[][] = [];
      for (const child of Array.from(el.children)) {
        const c = child as HTMLElement;
        const titleEl = c.querySelector('.doc-sides-title');
        const body = c.cloneNode(true) as HTMLElement;
        body.querySelectorAll('.doc-sides-title').forEach((n) => n.remove());
        const cellChildren: InstanceType<ParagraphClass>[] = [];
        if (titleEl) {
          cellChildren.push(
            buildParagraph(collectInline(titleEl), design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
              align: AlignmentType.LEFT,
              size: halfPoints(design.subheadingFontSize),
              boldAll: true,
              brand: true,
              caps: design.capSubheadings,
              shading: style === 'fill' && design.tableHeadFill ? design.tableHeadFill : undefined,
              borderLeftAccent: style === 'accent-bar',
              borderBottom: style === 'rule',
              spaceBefore: 0,
              spaceAfter: 80,
            })
          );
        }
        if (body.textContent?.trim()) {
          const sub: InstanceType<ParagraphClass>[] = [];
          await walk(body, sub);
          cellChildren.push(...sub.filter((x) => x instanceof Paragraph));
        }
        cells.push(cellChildren);
      }
      target.push(
        new Table({
          rows: [
            new TableRow({
              children: cells.map(
                (cellChildren, ci) =>
                  new TableCell({
                    children: cellChildren,
                    margins: { top: 40, bottom: 40, left: ci === 0 ? 0 : 160, right: ci === 0 ? 160 : 0 },
                    width: { size: colWidths[ci], type: WidthType.PERCENTAGE },
                  })
              ),
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: TableBorders.NONE,
        })
      );
      return;
    }

    if (hasClass(el, 'doc-price')) {
      const items = collectInline(el);
      if (items.length) {
        target.push(
          buildParagraph(items, design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
            align: AlignmentType.CENTER,
            size: halfPoints(design.bodyFontSize),
            boldAll: true,
            brand: true,
            box: true,
            spaceBefore: 200,
            spaceAfter: 200,
          })
        );
      }
      return;
    }

    const cls = el.className || '';
    const isRow = cls.includes('flex') && cls.includes('justify-between');
    if (isRow) {
      const parts = Array.from(el.children).filter((c) =>
        (c.textContent || '').trim()
      );
      if (parts.length >= 2) {
        const items: InlineItem[] = [];
        parts.forEach((p, idx) => {
          if (idx > 0) items.push({ text: '\t', bold: false, italic: false });
          items.push(...collectInline(p));
        });
        target.push(
          buildParagraph(items, design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
            align: AlignmentType.LEFT,
            size: halfPoints(design.smallFontSize),
            tabRight: true,
          })
        );
        return;
      }
    }

    if (hasBlockDescendant(el)) {
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.ELEMENT_NODE) await walk(child as HTMLElement, target);
      }
      return;
    }

    const items = collectInline(el);
    const isDocTitle = hasClass(el, 'doc-title');
    const isSubheading =
      cls.includes('font-bold') &&
      cls.includes('uppercase') &&
      (cls.includes('text-black') || cls.includes('mb-2'));
    const isHeading = cls.includes('text-center') && cls.includes('font-bold');

    if (items.length || (el.textContent || '').trim()) {
      target.push(
        buildParagraph(items, design, Paragraph, TextRun, AlignmentType, TabStopType, BorderStyle, ShadingType, ImageRun, UnderlineType, {
          align: AlignmentType.LEFT,
          size: isDocTitle
            ? halfPoints(design.titleFontSize)
            : isSubheading || isHeading
              ? halfPoints(design.subheadingFontSize)
              : halfPoints(sizeFromClass(cls, design, design.bodyFontSize)),
          boldAll: cls.includes('font-bold') || isDocTitle || isSubheading || isHeading,
          brand: isDocTitle || isSubheading || isHeading,
          caps: isDocTitle || (isSubheading && design.capSubheadings),
          lh: lineHeightFromClass(cls, design),
        })
      );
    }
  };

  for (const child of Array.from(tempDiv.children)) {
    await walk(child as HTMLElement, elements);
  }
  return elements;
}

function buildHeader(
  design: DesignTokens,
  Header: HeaderClass,
  Paragraph: ParagraphClass,
  TextRun: TextRunClass,
  AlignmentType: AlignmentTypeClass,
  BorderStyle: BorderStyleClass
): InstanceType<HeaderClass> {
  const align =
    design.headerAlign === 'center'
      ? AlignmentType.CENTER
      : design.headerAlign === 'left'
        ? AlignmentType.LEFT
        : AlignmentType.RIGHT;
  const strong = design.logoWeight === 'strong';
  const wordSize = halfPoints(strong ? design.smallFontSize : design.tinyFontSize);
  return new Header({
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 20, line: lineUnits(design, 1.1) },
        ...(design.id !== 'classic'
          ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: design.ruleColor } } }
          : {}),
        children: [
          new TextRun({
            text: design.wordmark,
            size: wordSize,
            font: design.fonts.officeFamily,
            bold: true,
            color: strong ? design.accent : undefined,
          }),
        ],
      }),
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 40, line: lineUnits(design, 1.1) },
        children: [
          new TextRun({
            text: design.tagline,
            size: halfPoints(design.tinyFontSize * 0.9),
            font: design.fonts.officeFamily,
            color: design.grayText,
          }),
        ],
      }),
    ],
  });
}

function buildFooter(
  design: DesignTokens,
  Footer: FooterClass,
  Paragraph: ParagraphClass,
  TextRun: TextRunClass,
  PageNumber: PageNumberClass,
  TabStopType: TabStopTypeClass,
  BorderStyle: BorderStyleClass
): InstanceType<FooterClass> {
  const size = halfPoints(design.tinyFontSize);
  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: design.ruleColor } },
        tabStops: [
          { type: TabStopType.RIGHT, position: contentWidthTwips(design) },
        ],
        spacing: { before: 80, after: 0, line: lineUnits(design, 1.1) },
        children: [
          new TextRun({ text: 'Стр. ', size, font: design.fonts.officeFamily, color: design.grayText }),
          new TextRun({ children: [PageNumber.CURRENT], size, font: design.fonts.officeFamily, color: design.grayText }),
          new TextRun({ text: ' из ', size, font: design.fonts.officeFamily, color: design.grayText }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size, font: design.fonts.officeFamily, color: design.grayText }),
          new TextRun({ text: '\t', size, font: design.fonts.officeFamily, color: design.grayText }),
          new TextRun({
            text: `Сформировано на ${design.siteUrl}`,
            size,
            font: design.fonts.officeFamily,
            color: design.grayText,
          }),
        ],
      }),
    ],
  });
}

export async function buildDocxDocumentLazy(html: string, options: { design?: DesignId } = {}): Promise<Document> {
  const docxModule = await loadDocx();
  const {
    Document, Header, Footer, Paragraph, TextRun,
    AlignmentType, BorderStyle, TabStopType, PageNumber,
  } = docxModule;

  const design = getDesign(options.design);
  const docElements = await parseHtmlToDocx(html, design, docxModule);
  const tw = (mm: number) => Math.round(mm * 56.6929134);

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: tw(design.marginTop),
              right: tw(design.marginRight),
              bottom: tw(design.marginBottom),
              left: tw(design.marginLeft),
            },
          },
        },
        headers: { default: buildHeader(design, Header, Paragraph, TextRun, AlignmentType, BorderStyle) },
        footers: { default: buildFooter(design, Footer, Paragraph, TextRun, PageNumber, TabStopType, BorderStyle) },
        children: docElements,
      },
    ],
  });
}

export async function exportToDocxLazy(
  html: string,
  filename: string,
  options: { design?: DesignId } = {}
): Promise<void> {
  const doc = await buildDocxDocumentLazy(html, options);
  const { Packer } = await loadDocx();
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}