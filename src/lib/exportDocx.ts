import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  Packer,
  TableRow,
  TableCell,
  Table,
  WidthType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";

function parseHtmlToDocx(html: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text, size: 24, font: "PT Astra Sans" })],
            spacing: { after: 100, line: 360 },
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const text = el.textContent?.trim();

    if (tag === "div" || tag === "p" || tag === "li") {
      const children: (TextRun | ImageRun)[] = [];
      const isHeading = tag === "div" && el.className?.includes("font-bold");

      const processInline = (inlineNode: Node) => {
        if (inlineNode.nodeType === Node.TEXT_NODE) {
          const t = inlineNode.textContent || "";
          if (t.trim()) {
            children.push(
              new TextRun({
                text: t,
                size: 24, font: "PT Astra Sans",
                bold: isHeading ||
                  (inlineNode.parentElement as HTMLElement)?.tagName === "STRONG" ||
                  (inlineNode.parentElement as HTMLElement)?.tagName === "B",
                color: isHeading ? "1A3C6C" : undefined,
              })
            );
          }
        } else if (inlineNode.nodeType === Node.ELEMENT_NODE) {
          const inlineEl = inlineNode as HTMLElement;
          const isBold =
            isHeading || inlineEl.tagName === "STRONG" || inlineEl.tagName === "B";
          const isItalic =
            inlineEl.tagName === "EM" || inlineEl.tagName === "I";

          if (inlineEl.tagName === "IMG") {
            const src = inlineEl.getAttribute("src") || "";
            const m = src.match(/^data:image\/png;base64,(.+)$/);
            if (m) {
              try {
                const bin = atob(m[1]);
                const data = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
                children.push(
                  new ImageRun({
                    type: "png",
                    data,
                    transformation: { width: 100, height: 40 },
                  })
                );
              } catch {
                // РїСЂРѕРїСѓСЃРєР°РµРј Р±РёС‚С‹Рµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
              }
            }
            return;
          }

          if (inlineEl.childNodes.length > 0) {
            inlineEl.childNodes.forEach(processInline);
          } else {
            const t = inlineEl.textContent || "";
            if (t.trim()) {
              children.push(
                new TextRun({
                  text: t,
                  size: 24, font: "PT Astra Sans",
                  bold: isBold,
                  italics: isItalic,
                  color: isHeading ? "1A3C6C" : undefined,
                })
              );
            }
          }
        }
      };

      el.childNodes.forEach(processInline);

      if (children.length === 0 && text) {
        children.push(new TextRun({ text, size: 24, font: "PT Astra Sans" }));
      }

      if (children.length > 0) {
        const isHeading = tag === "div" && el.className?.includes("font-bold");

        elements.push(
          new Paragraph({
            children,
            spacing: { after: 120, line: 360 },
            heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
          })
        );
      }
    } else if (tag === "table") {
      const rows: TableRow[] = [];
      const trElements = el.querySelectorAll("tr");

      trElements.forEach((tr) => {
        const cells: TableCell[] = [];
        const tdElements = tr.querySelectorAll("td, th");

        tdElements.forEach((td) => {
          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: td.textContent?.trim() || "",
                      size: 22, font: "PT Astra Sans",
                      bold: td.tagName === "TH",
                    }),
                  ],
                }),
              ],
              width: {
                size: Math.floor(100 / Math.max(tdElements.length, 1)),
                type: WidthType.PERCENTAGE,
              },
            })
          );
        });

        if (cells.length > 0) {
          rows.push(new TableRow({ children: cells }));
        }
      });

      if (rows.length > 0) {
        elements.push(
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        elements.push(new Paragraph({ children: [], spacing: { after: 120, line: 360 } }));
      }
    } else {
      el.childNodes.forEach(walk);
    }
  };

  tempDiv.childNodes.forEach(walk);
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
                top: 1134, // 20 mm = 1134 twips
                right: 851, // 15 mm
                bottom: 1134, // 20 mm
                left: 1134, // 20 mm
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
