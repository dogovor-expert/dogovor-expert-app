/** Паритет шаблонов резюме (эталон РЕЗЮМЕ 3): HTML-превью, DOC-HTML, CSS и PDF. */
import { describe, expect, it } from "vitest";
import { SAMPLE_RESUME, TEMPLATES } from "../data";
import { buildResumeDocHtml, buildResumeHtml, fullName } from "../render";
import { RESUME_CSS } from "../resumeCss";
import type { ResumeData, TemplateId } from "../types";

const ALL: TemplateId[] = [
  "executive-navy",
  "tech-indigo",
  "classic-legal",
  "nordic-minimal",
  "modern-emerald",
  "creative-coral",
  "junior-launch",
  "corporate-slate",
  "data-mono",
  "legal-counsel",
];

const WITH_PHOTO: ResumeData = {
  ...SAMPLE_RESUME,
  personal: { ...SAMPLE_RESUME.personal, photo: "data:image/png;base64,iVBORw0KGgo=" },
};

describe("resume templates parity (РЕЗЮМЕ 3)", () => {
  it("каталог содержит 10 уникальных шаблонов эталона", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(ALL);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(10);
  });

  it("мета шаблонов повторяет макет: категории, бейджи, рейтинги, скачивания", () => {
    const exec = TEMPLATES.find((t) => t.id === "executive-navy");
    expect(exec?.category).toBe("Руководители");
    expect(exec?.layout).toBe("executive-header");
    expect(exec?.badge).toBe("Выбор HR-директоров");
    expect(exec?.rating).toBeGreaterThan(4.9);
    expect(exec?.downloads).toContain("тыс.");
    const tech = TEMPLATES.find((t) => t.id === "tech-indigo");
    expect(tech?.layout).toBe("tech-split");
    expect(tech?.badge).toBe("Хит для IT");
    expect(tech?.tags).toContain("creative");
    const junior = TEMPLATES.find((t) => t.id === "junior-launch");
    expect(junior?.tags).toContain("first");
  });

  it("buildResumeHtml: все шаблоны непустые и содержат имя", () => {
    for (const id of ALL) {
      const html = buildResumeHtml(SAMPLE_RESUME, id);
      expect(html.length, id).toBeGreaterThan(100);
      expect(html, id).toContain(fullName(SAMPLE_RESUME));
    }
  });

  it("эталонные раскладки: exec/side/base + serif/tech-варианты", () => {
    expect(buildResumeHtml(SAMPLE_RESUME, "executive-navy")).toContain("smp-exec");
    expect(buildResumeHtml(SAMPLE_RESUME, "modern-emerald")).toContain("smp-side");
    expect(buildResumeHtml(SAMPLE_RESUME, "legal-counsel")).toContain("smp-side");
    expect(buildResumeHtml(SAMPLE_RESUME, "tech-indigo")).toContain("smp-base");
    expect(buildResumeHtml(SAMPLE_RESUME, "tech-indigo")).toContain("smp-tech");
    expect(buildResumeHtml(SAMPLE_RESUME, "data-mono")).toContain("smp-tech");
    expect(buildResumeHtml(SAMPLE_RESUME, "classic-legal")).toContain("smp-serif");
    expect(buildResumeHtml(SAMPLE_RESUME, "corporate-slate")).toContain("smp-serif");
  });

  it("фото показывается, если загружено, и скрыто при showPhoto=false", () => {
    for (const id of ALL) {
      const html = buildResumeHtml(WITH_PHOTO, id);
      expect(html, id).toMatch(/smp-ph|smp-top-ph|smp-bar-ph/);
      expect(html, id).toContain("data:image/png;base64,iVBORw0KGgo=");
      const noPhoto: ResumeData = {
        ...WITH_PHOTO,
        personal: { ...WITH_PHOTO.personal, showPhoto: false },
      };
      expect(buildResumeHtml(noPhoto, id), id).not.toContain("data:image/png;base64,iVBORw0KGgo=");
    }
  });

  it("buildResumeDocHtml: акценты и флаги шаблонов", () => {
    const dots: Array<[TemplateId, string]> = [
      ["executive-navy", "#1e293b"],
      ["tech-indigo", "#4f46e5"],
      ["classic-legal", "#0f172a"],
      ["nordic-minimal", "#0d9488"],
      ["modern-emerald", "#059669"],
      ["creative-coral", "#ea580c"],
      ["junior-launch", "#2563eb"],
      ["corporate-slate", "#334155"],
      ["data-mono", "#7c3aed"],
      ["legal-counsel", "#1e3a8a"],
    ];
    for (const [id, accent] of dots) {
      const doc = buildResumeDocHtml(SAMPLE_RESUME, id);
      expect(doc, id).toContain(accent);
    }
    expect(buildResumeDocHtml(SAMPLE_RESUME, "modern-emerald")).toContain("по стандартам 2026");
    expect(buildResumeDocHtml(SAMPLE_RESUME, "classic-legal")).toContain("Times New Roman");
  });

  it("buildResumeDocHtml: DOC без flex/grid — таблицы и инлайн-стили", () => {
    for (const id of ALL) {
      const doc = buildResumeDocHtml(SAMPLE_RESUME, id);
      expect(doc, id).not.toMatch(/display:\s*flex/);
      expect(doc, id).not.toMatch(/display:\s*grid/);
    }
  });

  it("RESUME_CSS покрывает эталонные раскладки", () => {
    expect(RESUME_CSS).toContain(".smp-base");
    expect(RESUME_CSS).toContain(".smp-exec");
    expect(RESUME_CSS).toContain(".smp-side");
    expect(RESUME_CSS).toContain(".smp-serif");
    expect(RESUME_CSS).toContain(".smp-tech");
  });

  it("renderResumePdf: все шаблоны собираются в одностраничный A4-PDF", async () => {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const origFetch = globalThis.fetch;
    const root = join(process.cwd(), "public", "fonts");
    globalThis.fetch = (async (url: unknown) => {
      const name = String(url).split("/").pop() ?? "";
      const buf = await readFile(join(root, name));
      return new Response(buf);
    }) as typeof fetch;
    try {
      const { renderResumePdf } = await import("../resumePdf");
      const { PDFDocument } = await import("pdf-lib");
      const tinyPng =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const withRealPhoto: ResumeData = {
        ...SAMPLE_RESUME,
        personal: { ...SAMPLE_RESUME.personal, photo: tinyPng },
      };
      for (const id of ALL) {
        const blob = await renderResumePdf(withRealPhoto, id);
        expect(blob.size, id).toBeGreaterThan(5000);
        expect(await blob.slice(0, 5).text(), id).toBe("%PDF-");
        const pdf = await PDFDocument.load(await blob.arrayBuffer());
        expect(pdf.getPageCount(), `страниц PDF ${id}`).toBe(1);
        const { width, height } = pdf.getPage(0).getSize();
        expect(Math.round(width), `ширина A4 ${id}`).toBe(595);
        expect(Math.round(height), `высота A4 ${id}`).toBe(842);
      }
    } finally {
      globalThis.fetch = origFetch;
    }
  }, 180000);
});
