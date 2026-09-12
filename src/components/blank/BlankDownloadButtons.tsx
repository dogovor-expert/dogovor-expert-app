"use client";

import { useState, useEffect, useRef } from "react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { saveAs } from "file-saver";
import { Download, FileText, FileType2, Loader2, Printer } from "lucide-react";

function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .replace(/\s+/g, "_")
    .trim();
  return `Бланк_${(cleaned || "dokument").slice(0, 60)}`;
}

export default function BlankDownloadButtons({ templateId }: { templateId: string }) {
  const [busy, setBusy] = useState<null | "pdf" | "docx" | "print">(null);
  const [done, setDone] = useState<null | "pdf" | "docx" | "print">(null);
  const [error, setError] = useState<string | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDone = (kind: "pdf" | "docx" | "print") => {
    setDone(kind);
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setDone(null), 2500);
  };

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  const handlePrint = async () => {
    setBusy("print");
    setError(null);
    let iframe: HTMLIFrameElement | null = null;
    let url = "";
    try {
      const t = LEGAL_TEMPLATES.find((x) => x.id === templateId);
      if (!t) throw new Error("Шаблон не найден");

      const { TEMPLATE_PREVIEWS } = await import("@/data/templatePreviews");
      const previewTemplate = TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate;
      const html = renderTemplateDocument(t, {}, {
        previewTemplate,
        blank: true,
        blankMode: "pdf",
      });

      const { buildPdf } = await import("@/lib/exportPdf");
      const { blob } = await buildPdf(html, {
        design: "classic",
        pageNumbers: true,
      });

      url = URL.createObjectURL(blob);
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "0";
      iframe.onload = () => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        } catch {
          /* ignore */
        }
        setTimeout(() => {
          if (url) URL.revokeObjectURL(url);
          iframe?.remove();
        }, 60000);
      };
      iframe.src = url;
      document.body.appendChild(iframe);
      markDone("print");
    } catch (e) {
      console.error("Blank print error:", e);
      setError("Не удалось подготовить печать. Попробуйте скачать PDF.");
      if (url) URL.revokeObjectURL(url);
      iframe?.remove();
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    setBusy(format);
    setError(null);
    try {
      const t = LEGAL_TEMPLATES.find((x) => x.id === templateId);
      if (!t) throw new Error("Шаблон не найден");

      const { TEMPLATE_PREVIEWS } = await import("@/data/templatePreviews");
      const previewTemplate = TEMPLATE_PREVIEWS[t.id] ?? t.previewTemplate;
      const html = renderTemplateDocument(t, {}, {
        previewTemplate,
        blank: true,
        blankMode: format,
      });

      const fileName = safeFileName(t.name);

      if (format === "pdf") {
        const { buildPdf } = await import("@/lib/exportPdf");
        const { blob } = await buildPdf(html, {
          design: "classic",
          pageNumbers: true,
        });
        saveAs(blob, `${fileName}.pdf`);
      } else {
        const { exportToDocxHtml } = await import("@/lib/exportDocx");
        await exportToDocxHtml(html, fileName, { design: "classic" });
      }
      markDone(format);
    } catch (e) {
      console.error("Blank download error:", e);
      setError("Не удалось сформировать файл. Попробуйте ещё раз.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void handleDownload("pdf")}
          disabled={busy !== null}
          aria-busy={busy === "pdf"}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {busy === "pdf" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
          {busy === "pdf" ? "Готовим PDF…" : done === "pdf" ? "Скачано ✓" : "Скачать PDF"}
        </button>
        <button
          type="button"
          onClick={() => void handleDownload("docx")}
          disabled={busy !== null}
          aria-busy={busy === "docx"}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 disabled:opacity-60 transition"
        >
          {busy === "docx" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileType2 className="w-5 h-5" />
          )}
          {busy === "docx" ? "Готовим Word…" : done === "docx" ? "Скачано ✓" : "Скачать Word"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => void handlePrint()}
        disabled={busy !== null}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 disabled:opacity-60 transition"
      >
{busy === "print" ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Printer className="w-5 h-5" />
      )}
      {busy === "print" ? "Готовим печать…" : done === "print" ? "Отправлено в печать ✓" : "Печатать пустой бланк"}
    </button>
      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <Download className="w-3.5 h-3.5" />
        Пустой бланк с адресом сайта dogovor.expert — заполняйте от руки или онлайн.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
