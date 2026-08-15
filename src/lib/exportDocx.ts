import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];

const FONT = "PT Astra Sans";
const BRAND = "1A3C6C";
const CONTENT_WIDTH_TWIPS = 9921;
const BLOCK_TAGS = new Set([
  "div", "p", "li", "h1", "h2", "h3", "h4", "section", "article",
]);

interface InlineItem {
  text?: string;
  bold: boolean;
  italic: boolean;
  img?: { data: Uint8Array; width: number; height: number };
}

function hasClass(el: HTMLElement, token: string): boolean {
  const cls = el.className || "";
  return cls.split(/\s+/).includes(token) || cls.includes(token);
}

function sizeFrom(el: HTMLElement, fallback: number): number {
  const cls = el.className || "";
  if (cls.includes("text-[10px]")) return 20;
  if (cls.includes("text-[11px]")) return 22;
  if (cls.includes("text-[12px]")) return 24;
  if (cls.includes("text-[13px]")) return 26;
  if (cls.includes("text-[14px]")) return 28;
  if (cls.includes("text-[16px]")) return 32;
  if (cls.includes("text-[18px]")) return 36;
  if (cls.includes("text-xs")) return 18;
  if (cls.includes("text-sm")) return 21;
  if (cls.includes("text-base")) return 24;
  if (cls.includes("text-lg")) return 27;
  if (cls.includes("text-xl")) return 30;
  if (cls.includes("text-2xl")) return 36;
  return fallback;
}

function alignFrom(el: HTMLElement): Align | undefined {
  const cls = el.className || "";
  if (cls.includes("text-center")) return AlignmentType.CENTER;
  if (cls.includes("text-right")) return AlignmentType.RIGHT;
  if (cls.includes("text-justify")) return AlignmentType.JUSTIFIED;
  return undefined;
}

function collectInline(node: Node, bold = false, italic = false): InlineItem[] {
  const out: InlineItem[] = [];
  const walk = (n: Node, b: boolean, i: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent || "").replace(/\u00A0/g, " ");
      if (t.trim()) out.push({ text: t, bold: b, italic: i });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") return;
    if (tag === "img") {
      const src = el.getAttribute("src") || "";
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
    const nb = b || tag === "strong" || tag === "b";
    const ni = i || tag === "em" || tag === "i";
    el.childNodes.forEach((c) => walk(c, nb, ni));
  };
  node.childNodes.forEach((c) => walk(c, bold, italic));
  return out;
}

function toRuns(
  items: InlineItem[],
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
    return new TextRun({
      text: opts.caps && it.text ? it.text.toUpperCase() : it.text || "",
      size: opts.size ?? 24,
      font: FONT,
      bold: opts.boldAll ?? it.bold,
      italics: it.italic,
      color: opts.brand ? BRAND : undefined,
    });
  });
}

function hasBlockDescendant(el: HTMLElement): boolean {
  return Array.from(el.children).some((c) => {
    const tag = (c as HTMLElement).tagName.toLowerCase();
    return tag === "table" || BLOCK_TAGS.has(tag) || hasBlockDescendant(c as HTMLElement);
  });
}

function buildTable(el: HTMLTableElement): Table {
  const rows: TableRow[] = [];
  el.querySelectorAll("tr").forEach((tr) => {
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
              children: toRuns(items, { size: sizeFrom(el, 22) }),
              spacing: { line: 300 },
            }),
          ],
          width: {
            size: Math.floor(100 / Math.max(tdElements.length, 1)),
            type: WidthType.PERCENTAGE,
          },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
        })
      );
    });
    if (cells.length) rows.push(new TableRow({ children: cells }));
  });
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
    },
  });
}

function buildParagraph(
  items: InlineItem[],
  opts: {
    align?: Align;
    size?: number;
    boldAll?: boolean;
    brand?: boolean;
    caps?: boolean;
    borderBottom?: boolean;
    box?: boolean;
    shading?: string;
    tabRight?: boolean;
    spaceBefore?: number;
    spaceAfter?: number;
  } = {}
): Paragraph {
  return new Paragraph({
    children: toRuns(items, opts),
    alignment: opts.align,
    spacing: {
      before: opts.spaceBefore ?? 60,
      after: opts.spaceAfter ?? 120,
      line: 360,
    },
    ...(opts.borderBottom
      ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "A1A1AA" } } }
      : {}),
    ...(opts.box
      ? {
          border: {
            left: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
            right: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
            top: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND },
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
              position: CONTENT_WIDTH_TWIPS,
            },
          ],
        }
      : {}),
  });
}

export function parseHtmlToDocx(html: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const walk = (el: HTMLElement, target: (Paragraph | Table)[]) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style") return;

    if (tag === "table") {
      target.push(buildTable(el as HTMLTableElement));
      target.push(new Paragraph({ children: [], spacing: { after: 120 } }));
      return;
    }

    if (tag === "ul" || tag === "ol") {
      el.querySelectorAll(":scope > li").forEach((li) => {
        const items = [
          { text: "\u2022  ", bold: false, italic: false },
          ...collectInline(li),
        ];
        target.push(
          buildParagraph(items, {
            align: AlignmentType.LEFT,
            size: sizeFrom(el, 24),
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
        buildParagraph([], {
          size: sizeFrom(el, 12),
          borderBottom: true,
          spaceBefore: 0,
          spaceAfter: sizeFrom(el, 12),
        })
      );
      return;
    }

    if (hasClass(el, "doc-sides")) {
      Array.from(el.children).forEach((child) => {
        const c = child as HTMLElement;
        const titleEl = c.querySelector(".doc-sides-title") as HTMLElement | null;
        const body = c.cloneNode(true) as HTMLElement;
        body.querySelectorAll(".doc-sides-title").forEach((n) => n.remove());
        if (titleEl) {
          target.push(
            buildParagraph(collectInline(titleEl), {
              align: AlignmentType.LEFT,
              size: sizeFrom(titleEl, 20),
              boldAll: true,
              brand: true,
              caps: true,
              shading: "EEF1F7",
              spaceBefore: 200,
              spaceAfter: 80,
            })
          );
        }
        if (body.textContent?.trim()) {
          walk(body, target);
        }
      });
      return;
    }

    if (hasClass(el, "doc-price")) {
      const items = collectInline(el);
      if (items.length) {
        target.push(
          buildParagraph(items, {
            align: AlignmentType.CENTER,
            size: sizeFrom(el, 28),
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
          buildParagraph(items, {
            align: AlignmentType.LEFT,
            size: sizeFrom(el, 18),
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
        buildParagraph(items, {
          align: alignFrom(el) ?? AlignmentType.LEFT,
          size: isDocTitle ? 28 : isSubheading ? sizeFrom(el, 20) : sizeFrom(el, 24),
          boldAll: cls.includes("font-bold") || isDocTitle || isSubheading || isHeading,
          brand: isDocTitle || isSubheading || isHeading,
          caps: isDocTitle || isSubheading,
        })
      );
    }
  };

  Array.from(tempDiv.children).forEach((n) => walk(n as HTMLElement, elements));
  return elements;
}

export async function exportToDocx(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const html = element.innerHTML;
  const docElements = parseHtmlToDocx(html);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              right: 851,
              bottom: 1134,
              left: 1134,
            },
          },
        },
        children: docElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}