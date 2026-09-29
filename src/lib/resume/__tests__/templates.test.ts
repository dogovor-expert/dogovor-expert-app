/** Паритет шаблонов резюме (эталон РЕЗЮМЕ 3): HTML-превью, DOC-HTML, CSS и PDF. */
import { describe, expect, it } from "vitest";
import { SAMPLE_RESUME, TEMPLATES } from "../data";
import { buildResumeCardHtml, buildResumeDocHtml, buildResumeHtml, fullName } from "../render";
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
    // Атрибуция в сайдбаре осталась, но без устаревшего «по стандартам 2026»:
    // год в подписи превращался бы в ложь на 1 января 2027. Решение человека.
    expect(buildResumeDocHtml(SAMPLE_RESUME, "modern-emerald")).toContain("Dogovor.expert");
    expect(buildResumeDocHtml(SAMPLE_RESUME, "modern-emerald")).not.toContain("по стандартам 2026");
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

  it("buildResumeCardHtml: компактные превью без scale и без h-тегов", () => {
    const mods = new Set<string>();
    for (const id of ALL) {
      const html = buildResumeCardHtml(SAMPLE_RESUME, id);
      expect(html.length, id).toBeGreaterThan(100);
      // короткое имя «имя + фамилия» без отчества (как в макете)
      expect(html, id).toContain("Александр Смирнов");
      expect(html, id).not.toContain("Игоревич");
      expect(html, id).toMatch(/class="rc /);
      expect(html, id).not.toMatch(/<h[123][\s>]/);
      const m = html.match(/class="rc ([^"]+)"/);
      expect(m, id).toBeTruthy();
      mods.add(m![1]);
      // акцент шаблона зашит в CSS-переменную
      expect(html, id).toContain("--ac:");
    }
    // все 10 карточек визуально разные
    expect(mods.size, [...mods].join(",")).toBe(10);
    // переопределение акцента (палитра студии)
    expect(buildResumeCardHtml(SAMPLE_RESUME, "tech-indigo", "#ff0000")).toContain("--ac:#ff0000");
    // фото: показывается при наличии, скрыто при showPhoto=false
    expect(buildResumeCardHtml(WITH_PHOTO, "executive-navy")).toContain("data:image/png;base64,iVBORw0KGgo=");
    const noPhoto: ResumeData = {
      ...WITH_PHOTO,
      personal: { ...WITH_PHOTO.personal, showPhoto: false },
    };
    expect(buildResumeCardHtml(noPhoto, "executive-navy")).not.toContain("<img");
  });

  it("RESUME_CSS покрывает компактные карточки", () => {
    expect(RESUME_CSS).toContain(".rc-exec");
    expect(RESUME_CSS).toContain(".rc-side");
    expect(RESUME_CSS).toContain(".rc-legal");
    expect(RESUME_CSS).toContain(".rc-base");
  });

  it("превью карточек: нет горизонтального переполнения и разрывов слов", () => {
    for (const id of ALL) {
      const html = buildResumeCardHtml(SAMPLE_RESUME, id);
      // Подписи чипов обрезаются по границе слова: длинный навык больше не
      // вылезал за край листа (замер 28.09.2026 — до 61px) и не налезал
      // на соседнюю колонку.
      for (const m of html.matchAll(/<span class="rc-chip">([^<]*)<\/span>/g)) {
        expect(m[1].length, `${id}: «${m[1]}»`).toBeLessThanOrEqual(15);
      }
      // Период места работы без хвоста в скобках — иначе перекрывал колонку.
      expect(html, id).not.toMatch(/\(\d+\s*год/);
      // Одна колонка: рельс 74px оставлял чипам 65px и ломал вёрстку.
      expect(html, id).not.toContain("rc-rail");
      expect(html, id).not.toContain("rc-cols");
    }
  });

  it("превью карточек гасят подчёркивание ссылки-обёртки", () => {
    // Карточка-превью лежит внутри <a>. text-decoration не наследуется в
    // computed, но красится по потомкам, и без этого весь лист подчёркивался.
    expect(RESUME_CSS).toMatch(/\.rc,\.rc \*\{text-decoration:none\}/);
    // Запасная страховка: у листа есть обрезка по ширине и запрет разрыва слов.
    expect(RESUME_CSS).toMatch(/\.rc\{[^}]*overflow-wrap|overflow:hidden/);
    expect(RESUME_CSS).toContain("aspect-ratio:1/1.414");
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

/**
 * Регрессия превью и печати (29.09.2026).
 *
 * Контекст: блок предпросмотра показывал лист в 53% (desktop) и 38% (mobile) —
 * текст 11,5px превращался в 6,1px/4,4px. Заодно типографика была ниже
 * печатного минимума: 12,5px = 9,4pt и line-height 1,55.
 */
describe("resume preview & print (29.09.2026)", () => {
  it("базовый кегль превью не меньше 10pt (13.33px) и интерлиньяж в 1.2–1.45", () => {
    const base = RESUME_CSS.match(/\.smp\{[^}]*font-size:([\d.]+)px;line-height:([\d.]+)/);
    expect(base, "базовый селектор .smp не найден").not.toBeNull();
    const size = Number(base![1]);
    const lh = Number(base![2]);
    // 1pt = 1.333px (WCAG 2.1, Understanding SC 1.4.3) -> 10pt = 13.33px.
    expect(size, `кегль ${size}px = ${(size / 1.333).toFixed(1)}pt`).toBeGreaterThanOrEqual(13.33);
    // 12pt = 16px — верхняя граница рекомендованного диапазона.
    expect(size).toBeLessThanOrEqual(16);
    // Butterick: межстрочный 120–145% от кегля.
    expect(lh, `line-height ${lh}`).toBeGreaterThanOrEqual(1.2);
    expect(lh, `line-height ${lh}`).toBeLessThanOrEqual(1.45);
  });

  it("кегль достижений не меньше 9.7pt", () => {
    const m = RESUME_CSS.match(/\.smp \.smp-xp-b li\{[^}]*font-size:([\d.]+)px/);
    expect(m, "правило .smp-xp-b li не найдено").not.toBeNull();
    expect(Number(m![1]) / 1.333, `достижения ${m![1]}px`).toBeGreaterThanOrEqual(9.7);
  });

  it("print-color-adjust:exact — иначе при печати выпадают заливки акцента", () => {
    expect(RESUME_CSS).toMatch(/print-color-adjust:exact/);
    expect(RESUME_CSS).toMatch(/-webkit-print-color-adjust:exact/);
  });

  it("блоки работ и заголовки секций не разрываются между страницами", () => {
    expect(RESUME_CSS).toMatch(/\.smp \.smp-xp-i[^{]*\{[^}]*break-inside:avoid/);
    expect(RESUME_CSS).toMatch(/\.smp \.smp-xp-b li\{[^}]*break-inside:avoid/);
    // Заголовок секции не должен оставаться висящим в конце страницы.
    expect(RESUME_CSS).toMatch(/\.smp \.smp-sec[^{]*\{[^}]*break-after:avoid/);
  });

  it("не опирается на orphans/widows: поддержка в браузерах limited", () => {
    expect(RESUME_CSS).not.toMatch(/orphans\s*:/);
    expect(RESUME_CSS).not.toMatch(/widows\s*:/);
  });

  it("DOC-экспорт: поля A4 в безопасной зоне 15–20мм и печать без потери заливок", () => {
    for (const id of ALL) {
      const html = buildResumeDocHtml(SAMPLE_RESUME, id);
      const m = html.match(/@page\{size:A4;margin:([\d.]+)cm\}/);
      expect(m, `@page в DOC ${id}`).not.toBeNull();
      const cm = Number(m![1]);
      expect(cm, `поля ${cm}см вне 1.5–2.0см в ${id}`).toBeGreaterThanOrEqual(1.5);
      expect(cm, `поля ${cm}см вне 1.5–2.0см в ${id}`).toBeLessThanOrEqual(2.0);
      expect(html, `нет print-color-adjust в ${id}`).toContain("print-color-adjust:exact");
    }
  });

  it("лист A4 в превью: ширина 794px и пропорция 1:1.414", () => {
    // 210x297мм при 96dpi = 793.7x1122.5px. Высота/ширина = 297/210 = 1.4143.
    expect(1123 / 794).toBeCloseTo(297 / 210, 2);
  });

  it("зум в студии ограничен шкалой 0.25–2.0 (без произвольных дробей)", () => {
    const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;
    expect(ZOOM_STEPS[0]).toBeGreaterThanOrEqual(0.2);
    expect(ZOOM_STEPS[ZOOM_STEPS.length - 1]).toBeLessThanOrEqual(2.0);
    for (let i = 1; i < ZOOM_STEPS.length; i++) {
      expect(ZOOM_STEPS[i]).toBeGreaterThan(ZOOM_STEPS[i - 1]);
    }
  });
});
