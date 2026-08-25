"use client";
import { useEffect, useRef, useState } from "react";
import { getDesign, type DesignId } from "@/lib/docDesign";
import { Loader2 } from "lucide-react";

let pdfjsReady = false;
async function getPdfjs(): Promise<any> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjsReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.min.mjs";
    pdfjsReady = true;
  }
  return pdfjs;
}

export interface PdfPreviewProps {
  docs: string[];
  design?: DesignId;
  watermark?: string;
  onPagesChange?: (n: number) => void;
}

/**
 * Предпросмотр, идентичный скачанному PDF: генерируем тот же самый PDF
 * (buildPdf) и отрисовываем страницы через pdf.js. Пагинация, шрифты,
 * акценты и логика «уместить на страницу» совпадают с экспортом на 100%.
 */
export default function PdfPreview({ docs, design, watermark, onPagesChange }: PdfPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);
  const sig = docs.join("");

  useEffect(() => {
    const id = ++reqId.current;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { buildPdf } = await import("@/lib/exportPdf");
        const { blob } = await buildPdf(docs, {
          design: getDesign(design).id,
          watermark,
          pageNumbers: true,
        });
        if (cancelled || reqId.current !== id) return;
        const buf = await blob.arrayBuffer();
        if (cancelled || reqId.current !== id) return;
        const pdfjs = await getPdfjs();
        const task = pdfjs.getDocument({ data: buf });
        const doc = await task.promise;
        if (cancelled || reqId.current !== id) {
          await task.destroy();
          return;
        }
        const total = doc.numPages;
        const imgs: string[] = [];
        const scale = 2;
        for (let i = 1; i <= total; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) break;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, viewport }).promise;
          page.cleanup();
          imgs.push(canvas.toDataURL("image/jpeg", 0.92));
          if (cancelled || reqId.current !== id) break;
        }
        await task.destroy();
        if (cancelled || reqId.current !== id) return;
        setPages(imgs);
        onPagesChange?.(imgs.length || total);
      } catch (e) {
        console.error("PdfPreview error", e);
      } finally {
        if (!cancelled && reqId.current === id) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, design, watermark, onPagesChange]);

  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs">Подготовка предпросмотра…</span>
      </div>
    );
  }

  return (
    <div id="print-root" className="flex flex-col items-center gap-6 py-4">
      {pages.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={"Страница " + (i + 1)} className="a4-sheet-img" />
      ))}
    </div>
  );
}
