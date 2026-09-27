/** Паритет 12 шаблонов резюме: каждый шаблон покрыт HTML-превью, DOC-HTML и CSS. */
import { describe, expect, it } from "vitest";
import { SAMPLE_RESUME, TEMPLATES } from "../data";
import { buildResumeDocHtml, buildResumeHtml, fullName } from "../render";
import { RESUME_CSS } from "../resumeCss";
import type { ResumeData, TemplateId } from "../types";

const ALL: TemplateId[] = [
  "classic", "modern", "minimal", "executive", "gradient", "compact",
  "fresher", "timeline", "twocol", "academic", "expert", "creative",
];

const WITH_PHOTO: ResumeData = {
  ...SAMPLE_RESUME,
  personal: { ...SAMPLE_RESUME.personal, photo: "data:image/png;base64,iVBORw0KGgo=" },
};

describe("resume templates parity", () => {
  it("каталог содержит 12 уникальных шаблонов", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(ALL);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(12);
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

  it("expert: две колонки, акцентная полоса, без фото даже если оно загружено", () => {
    const html = buildResumeHtml(WITH_PHOTO, "expert");
    expect(html).toContain("xp2-grid");
    expect(html).toContain("strip");
    expect(html).not.toContain("doc-ph");
    expect(html).toContain("Навыки");
    expect(html).toContain("Языки");
  });

  it("creative: полоса, фото и языки инлайн", () => {
    const html = buildResumeHtml(WITH_PHOTO, "creative");
    expect(html).toContain("strip");
    expect(html).toContain("doc-ph");
    expect(html).toContain("lg inline");
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

  it("RESUME_CSS покрывает все 12 шаблонов", () => {
    for (const id of ALL) {
      expect(RESUME_CSS, id).toContain(`.t-${id}`);
    }
  });

  it("renderResumePdf собирает expert и creative в настоящий PDF", async () => {
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
      // PNG 1x1 — проверяет ветку встраивания фото в шапку creative.
      const tinyPng =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const withRealPhoto: ResumeData = {
        ...SAMPLE_RESUME,
        personal: { ...SAMPLE_RESUME.personal, photo: tinyPng },
      };
      for (const id of ["expert", "creative"] as TemplateId[]) {
        const blob = await renderResumePdf(withRealPhoto, id);
        expect(blob.size, id).toBeGreaterThan(5000);
        expect(await blob.slice(0, 5).text(), id).toBe("%PDF-");
      }
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});
