/** Паритет 22 шаблонов резюме: каждый шаблон покрыт HTML-превью, DOC-HTML и CSS. */
import { describe, expect, it } from "vitest";
import { SAMPLE_RESUME, TEMPLATES } from "../data";
import { buildResumeDocHtml, buildResumeHtml, fullName } from "../render";
import { RESUME_CSS } from "../resumeCss";
import type { ResumeData, TemplateId } from "../types";

const ALL: TemplateId[] = [
  "classic", "modern", "minimal", "executive", "gradient", "compact",
  "fresher", "timeline", "twocol", "academic", "expert", "creative",
  "corporate", "techpro", "legal", "nordic", "sidebarpro",
  "ocean", "terracotta", "graphite", "forest", "wine",
];

const WITH_PHOTO: ResumeData = {
  ...SAMPLE_RESUME,
  personal: { ...SAMPLE_RESUME.personal, photo: "data:image/png;base64,iVBORw0KGgo=" },
};

describe("resume templates parity", () => {
  it("каталог содержит 22 уникальных шаблона", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(ALL);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(22);
  });

  it("мета новых шаблонов: expert — двухколоночный для руководителей, creative — одноколоночный", () => {
    const expert = TEMPLATES.find((t) => t.id === "expert");
    const creative = TEMPLATES.find((t) => t.id === "creative");
    expect(expert?.ats).toBe("creative");
    expect(expert?.tags).toContain("exec");
    expect(creative?.ats).toBe("safe");
    expect(creative?.tags).toContain("creative");
  });

  it("buildResumeHtml: все шаблоны непустые и содержат имя", () => {
    for (const id of ALL) {
      const html = buildResumeHtml(SAMPLE_RESUME, id);
      expect(html.length, id).toBeGreaterThan(100);
      expect(html, id).toContain(fullName(SAMPLE_RESUME));
    }
  });

  it("эталонные раскладки: exec/side/base присутствуют и содержат имя", () => {
    expect(buildResumeHtml(SAMPLE_RESUME, "corporate")).toContain("smp-exec");
    expect(buildResumeHtml(SAMPLE_RESUME, "sidebarpro")).toContain("smp-side");
    expect(buildResumeHtml(SAMPLE_RESUME, "techpro")).toContain("smp-base");
  });

  it("фото показывается во ВСЕХ шаблонах, если загружено", () => {
    for (const id of ALL) {
      const html = buildResumeHtml(WITH_PHOTO, id);
      expect(html, id).toMatch(/smp-ph|smp-top-ph|smp-bar-ph/);
      expect(html, id).toContain("data:image/png;base64,iVBORw0KGgo=");
    }
  });

  it("фото скрыто во всех шаблонах при showPhoto=false", () => {
    const noPhoto: ResumeData = { ...WITH_PHOTO, personal: { ...WITH_PHOTO.personal, showPhoto: false } };
    for (const id of ALL) {
      const html = buildResumeHtml(noPhoto, id);
      expect(html, id).not.toMatch(/smp-ph|smp-top-ph|smp-bar-ph/);
    }
  });

  it("exec (corporate): баннер, пилюли контактов, рейл с иконками", () => {
    const html = buildResumeHtml(WITH_PHOTO, "corporate");
    expect(html).toContain("smp-hd");
    expect(html).toContain("smp-pills");
    expect(html).toContain("smp-rail");
    expect(html).toContain("Ключевые навыки");
    expect(html).toContain("smp-ph");
  });

  it("side (sidebarpro тёмный, forest светлый): сайдбар, подпись", () => {
    const dark = buildResumeHtml(SAMPLE_RESUME, "sidebarpro");
    expect(dark).toContain("smp-bar");
    expect(dark).toContain("по стандартам 2026");
    expect(dark).not.toContain("smp-light");
    const light = buildResumeHtml(SAMPLE_RESUME, "forest");
    expect(light).toContain("smp-side");
    expect(light).toContain("smp-light");
  });

  it("base (techpro/legal/nordic): шапка, контактная полоса, две колонки", () => {
    for (const id of ["techpro", "legal", "nordic", "expert", "creative", "terracotta", "graphite"] as TemplateId[]) {
      const html = buildResumeHtml(SAMPLE_RESUME, id);
      expect(html, id).toContain("smp-base");
      expect(html, id).toContain("smp-cbar");
      expect(html, id).toContain("smp-cols");
    }
  });

  it("techpro помечен как tech (моно-чипы), legal — serif", () => {
    expect(buildResumeHtml(SAMPLE_RESUME, "techpro")).toContain("smp-tech");
    expect(buildResumeHtml(SAMPLE_RESUME, "legal")).toContain("smp-serif");
  });

  it("buildResumeDocHtml: акценты и флаги новых шаблонов", () => {
    const dots: Array<[TemplateId, string]> = [
      ["corporate", "#1e293b"], ["techpro", "#4f46e5"], ["legal", "#0f172a"],
      ["nordic", "#0d9488"], ["ocean", "#0369a1"], ["terracotta", "#9a3412"],
      ["graphite", "#3f3f46"], ["wine", "#881337"],
    ];
    for (const [id, accent] of dots) {
      const doc = buildResumeDocHtml(SAMPLE_RESUME, id);
      expect(doc, id).toContain(accent);
    }
    expect(buildResumeDocHtml(SAMPLE_RESUME, "corporate")).toContain("border-left");
    expect(buildResumeDocHtml(SAMPLE_RESUME, "sidebarpro")).toContain("по стандартам 2026");
    expect(buildResumeDocHtml(SAMPLE_RESUME, "forest")).toContain("#f0fdf4");
  });

  it("buildResumeDocHtml: A4, акцент и полоса у новых шаблонов", () => {
    const expert = buildResumeDocHtml(SAMPLE_RESUME, "expert");
    expect(expert).toContain("@page");
    expect(expert).toContain("A4");
    expect(expert).toContain("#4f46e5");
    expect(expert).toContain('width="64%"');
    const creative = buildResumeDocHtml(SAMPLE_RESUME, "creative");
    expect(creative).toContain("#ea580c");
    expect(creative).toContain(fullName(SAMPLE_RESUME));
  });

  it("buildResumeDocHtml: DOC без flex/grid — таблицы и инлайн-стили", () => {
    for (const id of ALL) {
      const doc = buildResumeDocHtml(SAMPLE_RESUME, id);
      expect(doc, id).not.toMatch(/display:\s*flex/);
      expect(doc, id).not.toMatch(/display:\s*grid/);
    }
  });

  it("RESUME_CSS покрывает все 22 шаблона", () => {
    for (const id of ALL) {
      expect(RESUME_CSS, id).toContain(`.t-${id}`);
    }
  });

  it("renderResumePdf: все 22 шаблона собираются в одностраничный A4-PDF", async () => {    const { readFile } = await import("node:fs/promises");
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
      // PNG 1x1 — проверяет ветку встраивания фото во все шапки.
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
