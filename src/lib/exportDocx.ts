import { saveAs } from "file-saver";
import { getDesign, type DesignId, type DesignTokens } from "@/lib/docDesign";
import {
  hasClass,
  collectInline,
  hasBlockDescendant,
  sizeFromClass,
  lineHeightFromClass,
} from "@/lib/html-parser";
import {
  type Document as DocxDocument,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TabStopType,
  UnderlineType,
  WidthType,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  TableBorders,
  Paragraph,
  Header,
  Footer,
  PageNumber,
} from "docx";

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

const BLOCK_TAGS = new Set([
  "div", "p", "li", "h1", "h2", "h3", "h4", "section", "article",
]);

export interface DocxOptions {
  design?: DesignId;
}

interface InlineItem {
  text?: string;
  bold: boolean;
  italic: boolean;
  img?: { data: Uint8Array; width: number; height: number };
  /** Длина (в символах «0») линии для заполнения; рисуется подчёркиванием. */
  blank?: number;
}

/** pt → полупункты (docx.js size). */
function halfPoints(pt: number): number {
  return Math.round(pt * 2);
}

/** pt → двадцатые доли пункта (межстрочный). */
function lineUnits(design: DesignTokens, lh: number): number {
  return Math.round(240 * lh);
}

export function alignFrom(el: HTMLElement): Align | undefined {
  const cls = el.className || "";
  if (cls.includes("text-center")) return AlignmentType.CENTER;
  if (cls.includes("text-right")) return AlignmentType.RIGHT;
  if (cls.includes("text-justify")) return AlignmentType.JUSTIFIED;
  return undefined;
}

function toRuns(
  items: InlineItem[],
  design: DesignTokens,
  opts: { size?: number; boldAll?: boolean; brand?: boolean; caps?: boolean } = {}
): (TextRun | ImageRun)[] {
  return items.map((it) => {
    if (it.img) {
      return new ImageRun({
        type: "png",
        data: it.img.data,
        transformation: { width: it.img.width, height: it.img.height },
      });
    }
    if (it.blank) {
      return new TextRun({
        text: "\u00A0".repeat(it.blank),
        size: opts.size ?? halfPoints(design.bodyFontSize),
        font: design.fonts.family,
        bold: opts.boldAll ?? it.bold,
        italics: it.italic,
        underline: { type: UnderlineType.SINGLE, color: design.ruleColor === "auto" ? undefined : design.ruleColor },
      });
    }
    return new TextRun({
      text: opts.caps && it.text ? it.text.toUpperCase() : it.text || "",
      size: opts.size ?? halfPoints(design.bodyFontSize),
      font: design.fonts.family,
      bold: opts.boldAll ?? it.bold,
      italics: it.italic,
      color: opts.brand ? design.accent : undefined,
    });
  });
}

function buildTable(el: HTMLTableElement, design: DesignTokens): Table {
  const rows: TableRow[] = [];
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
    top: base, bottom: base, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
  const accentTopBorders = {
    top: accentTop, bottom: base, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
  const tableBorders =
    borders === "all" ? allBorders : borders === "accent-top" ? accentTopBorders : horizontalBorders;

  el.querySelectorAll("tr").forEach((tr, ri) => {
    const cells: TableCell[] = [];
    const tdElements = tr.querySelectorAll("td, th");
    tdElements.forEach((td) => {
      const isHead = td.tagName === "TH";
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
              }),
              spacing: { line: lineUnits(design, 1.15) },
            }),
          ],
          width: {
            size: Math.floor(100 / Math.max(tdElements.length, 1)),
            type: WidthType.PERCENTAGE,
          },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
          ...(ri === 0 && isHead && design.tableHeadFill
            ? { shading: { type: ShadingType.CLEAR, color: "auto", fill: design.tableHeadFill } }
            : {}),
        })
      );
    });
    if (cells.length) rows.push(new TableRow({ children: cells }));
  });
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
  });
}

function buildParagraph(
  items: InlineItem[],
  design: DesignTokens,
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
): Paragraph {
  const line = opts.lh ?? design.lineHeight;
  return new Paragraph({
    children: toRuns(items, design, opts),
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
      ? { shading: { type: ShadingType.CLEAR, color: "auto", fill: opts.shading } }
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
  const w = 595.28;
  const left = design.marginLeft * 56.6929134;
  const right = design.marginRight * 56.6929134;
  return Math.round((w - left - right) * 20);
}

export function parseHtmlToDocx(
  html: string,
  design: DesignTokens = getDesign()
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const walk = (el: HTMLElement, target: (Paragraph | Table)[]) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;

    if (tag === "table") {
      target.push(buildTable(el as HTMLTableElement, design));
      target.push(new Paragraph({ children: [], spacing: { after: 80 } }));
      return;
    }

    if (tag === "ul" || tag === "ol") {
      el.querySelectorAll(":scope > li").forEach((li) => {
        const items = [
          { text: "\u2022  ", bold: false, italic: false },
          ...collectInline(li),
        ];
        target.push(
          buildParagraph(items, design, {
            align: AlignmentType.LEFT,
            size: halfPoints(design.bodyFontSize),
          })
        );
      });
      return;
    }

    if (!BLOCK_TAGS.has(tag)) {
      el.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) walk(n as HTMLElement, target);
      });
      return;
    }

    if (hasClass(el, "border-b") && !el.textContent?.trim()) {
      target.push(
        buildParagraph([], design, {
          size: halfPoints(design.tinyFontSize),
          borderBottom: true,
          spaceBefore: 0,
          spaceAfter: 80,
        })
      );
      return;
    }

    if (hasClass(el, "doc-sides")) {
      const style = design.sideTitleStyle;
      const colWidths = Array.from(el.children).map(() => 50);
      const cells = Array.from(el.children).map((child) => {
        const c = child as HTMLElement;
        const titleEl = c.querySelector(".doc-sides-title");
        const body = c.cloneNode(true) as HTMLElement;
        body.querySelectorAll(".doc-sides-title").forEach((n) => n.remove());
        const cellChildren: Paragraph[] = [];
        if (titleEl) {
          cellChildren.push(
            buildParagraph(collectInline(titleEl), design, {
              align: AlignmentType.LEFT,
              size: halfPoints(design.subheadingFontSize),
              boldAll: true,
              brand: true,
              caps: design.capSubheadings,
              shading: style === "fill" && design.tableHeadFill ? design.tableHeadFill : undefined,
              borderLeftAccent: style === "accent-bar",
              borderBottom: style === "rule",
              spaceBefore: 0,
              spaceAfter: 80,
            })
          );
        }
        if (body.textContent?.trim()) {
          const sub: (Paragraph | Table)[] = [];
          walk(body, sub);
          cellChildren.push(...sub.filter((x): x is Paragraph => x instanceof Paragraph));
        }
        return cellChildren;
      });
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

    if (hasClass(el, "doc-price")) {
      const items = collectInline(el);
      if (items.length) {
        target.push(
          buildParagraph(items, design, {
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

    const cls = el.className || "";
    const isRow = cls.includes("flex") && cls.includes("justify-between");
    if (isRow) {
      const parts = Array.from(el.children).filter((c) =>
        (c.textContent || "").trim()
      );
      if (parts.length >= 2) {
        const items: InlineItem[] = [];
        parts.forEach((p, idx) => {
          if (idx > 0) items.push({ text: "\t", bold: false, italic: false });
          items.push(...collectInline(p));
        });
        target.push(
          buildParagraph(items, design, {
            align: AlignmentType.LEFT,
            size: halfPoints(design.smallFontSize),
            tabRight: true,
          })
        );
        return;
      }
    }

    if (hasBlockDescendant(el)) {
      el.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) walk(n as HTMLElement, target);
      });
      return;
    }

    const items = collectInline(el);
    const isDocTitle = hasClass(el, "doc-title");
    const isSubheading =
      cls.includes("font-bold") &&
      cls.includes("uppercase") &&
      (cls.includes("text-black") || cls.includes("mb-2"));
    const isHeading = cls.includes("text-center") && cls.includes("font-bold");

    if (items.length || (el.textContent || "").trim()) {
      target.push(
        buildParagraph(items, design, {
          align: alignFrom(el) ?? AlignmentType.LEFT,
          size: isDocTitle
            ? halfPoints(design.titleFontSize)
            : isSubheading || isHeading
              ? halfPoints(design.subheadingFontSize)
              : halfPoints(sizeFromClass(cls, design, design.bodyFontSize)),
          boldAll: cls.includes("font-bold") || isDocTitle || isSubheading || isHeading,
          brand: isDocTitle || isSubheading || isHeading,
          caps: isDocTitle || (isSubheading && design.capSubheadings),
          lh: lineHeightFromClass(cls, design),
        })
      );
    }
  };

  Array.from(tempDiv.children).forEach((n) => walk(n as HTMLElement, elements));
  return elements;
}

function buildHeader(design: DesignTokens): Header {  const align =
    design.headerAlign === "center"
      ? AlignmentType.CENTER
      : design.headerAlign === "left"
        ? AlignmentType.LEFT
        : AlignmentType.RIGHT;
  const strong = design.logoWeight === "strong";
  const wordSize = halfPoints(strong ? design.smallFontSize : design.tinyFontSize);
  return new Header({
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 20, line: lineUnits(design, 1.1) },
        ...(design.id !== "classic"
          ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: design.ruleColor } } }
          : {}),
        children: [
          new TextRun({
            text: design.wordmark,
            size: wordSize,
            font: design.fonts.family,
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
            font: design.fonts.family,
            color: design.grayText,
          }),
        ],
      }),
    ],
  });
}

function buildFooter(design: DesignTokens): Footer {
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
          new TextRun({ text: "Стр. ", size, font: design.fonts.family, color: design.grayText }),
          new TextRun({ children: [PageNumber.CURRENT], size, font: design.fonts.family, color: design.grayText }),
          new TextRun({ text: " из ", size, font: design.fonts.family, color: design.grayText }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size, font: design.fonts.family, color: design.grayText }),
          new TextRun({ text: "\t", size, font: design.fonts.family, color: design.grayText }),
          new TextRun({
            text: `Сформировано на ${design.siteUrl}`,
            size,
            font: design.fonts.family,
            color: design.grayText,
          }),
        ],
      }),
    ],
  });
}

/** Единая точка сборки DOCX-документа из HTML + дизайн-токенов. */
export async function buildDocxDocument(html: string, options: DocxOptions = {}): Promise<DocxDocument> {
  const [{ Document }] = await Promise.all([
    import("docx"),
  ]);

  const design = getDesign(options.design);
  const docElements = parseHtmlToDocx(html, design);
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
        headers: { default: buildHeader(design) },
        footers: { default: buildFooter(design) },
        children: docElements,
      },
    ],
  });
}

export async function exportToDocx(
  element: HTMLElement,
  filename: string,
  options: DocxOptions = {}
): Promise<void> {
  await exportToDocxHtml(element.innerHTML, filename, options);
}

/** №6 аудита: экспорт произвольного HTML (например, всех документов пакета). */
export async function exportToDocxHtml(
  html: string,
  filename: string,
  options: DocxOptions = {}
): Promise<void> {
  const doc = await buildDocxDocument(html, options);
  const [{ Packer }] = await Promise.all([import("docx")]);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}