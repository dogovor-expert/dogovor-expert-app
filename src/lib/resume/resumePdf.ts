/**
 * Рендер резюме в PDF на pdf-lib: настоящий A4, текстовый слой (не картинка),
 * фирменный акцент и раскладка, повторяющая превью шаблона.
 *
 * Отдельный от exportPdf.ts рендер, потому что тот парсит HTML по классам
 * документов (doc-title/doc-sides/…), а у резюме своя семантика и 10 макетов.
 */
import { PDFDocument, rgb, type Color, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ResumeData, TemplateId } from "./types";
import { fullName, hardSkills } from "./render";

const A4 = { w: 595.28, h: 841.89 };

type RGB = Color;
const BLACK: RGB = rgb(0.07, 0.07, 0.09);
const GRAY: RGB = rgb(0.42, 0.45, 0.5);
const LIGHT: RGB = rgb(0.85, 0.87, 0.9);

interface TemplateStyle {
  accent: RGB;
  layout: "single" | "sidebar";
  serif?: boolean;
  headerBand?: RGB;
  sideBg?: RGB;
  sideFg?: RGB;
  sideAccent?: RGB;
  sideDark?: boolean;
  centerHeader?: boolean;
}

const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const STYLES: Record<TemplateId, TemplateStyle> = {
  classic: { accent: hex("#0f172a"), layout: "single", serif: true, centerHeader: true },
  modern: { accent: hex("#2563eb"), layout: "single" },
  minimal: { accent: hex("#9ca3af"), layout: "single" },
  executive: { accent: hex("#c9a227"), layout: "sidebar", serif: true, sideBg: hex("#0b1220"), sideFg: hex("#e2e8f0"), sideAccent: hex("#e7c55a"), sideDark: true },
  gradient: { accent: hex("#6d28d9"), layout: "single", headerBand: hex("#4c1d95") },
  compact: { accent: hex("#2563eb"), layout: "sidebar", sideBg: hex("#f9fafb"), sideFg: hex("#334155"), sideAccent: hex("#2563eb") },
  fresher: { accent: hex("#6d28d9"), layout: "single" },
  timeline: { accent: hex("#2563eb"), layout: "single" },
  twocol: { accent: hex("#2563eb"), layout: "single", headerBand: hex("#0f172a") },
  academic: { accent: hex("#111827"), layout: "single", serif: true, centerHeader: true },
};

const FONT_CACHE = new Map<string, ArrayBuffer>();
async function loadFontBytes(url: string): Promise<ArrayBuffer> {
  const cached = FONT_CACHE.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Не удалось загрузить шрифт ${url}`);
  const buf = await res.arrayBuffer();
  FONT_CACHE.set(url, buf);
  return buf;
}

interface Fonts { regular: PDFFont; bold: PDFFont }

class Doc {
  doc!: PDFDocument;
  page!: PDFPage;
  regular!: PDFFont;
  bold!: PDFFont;
  y = 0;
  left = 0;
  right = 0;
  width = 0;
  bottom = 0;

  async init(fonts: Fonts, margins: { left: number; right: number; top: number; bottom: number }) {
    this.doc = await PDFDocument.create();
    this.regular = fonts.regular;
    this.bold = fonts.bold;
    this.page = this.doc.addPage([A4.w, A4.h]);
    this.left = margins.left;
    this.right = A4.w - margins.right;
    this.width = this.right - this.left;
    this.bottom = margins.bottom;
    this.y = A4.h - margins.top;
  }

  newPage(margins: { left: number; right: number; top: number; bottom: number }) {
    this.page = this.doc.addPage([A4.w, A4.h]);
    this.y = A4.h - margins.top;
  }

  ensure(h: number, margins: { left: number; right: number; top: number; bottom: number }) {
    if (this.y - h < this.bottom) this.newPage(margins);
  }

  wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const probe = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(probe, size) <= maxWidth || !line) line = probe;
      else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  text(value: string, opts: { size: number; font?: PDFFont; color?: RGB; x?: number; maxWidth?: number; lineHeight?: number }) {
    const font = opts.font ?? this.regular;
    const size = opts.size;
    const color = opts.color ?? BLACK;
    const x = opts.x ?? this.left;
    const maxWidth = opts.maxWidth ?? this.width;
    const lh = opts.lineHeight ?? size * 1.35;
    const lines = this.wrap(value, font, size, maxWidth);
    for (const line of lines) {
      this.page.drawText(line, { x, y: this.y - size, size, font, color });
      this.y -= lh;
    }
  }

  gap(v: number) { this.y -= v; }
}

interface Ctx { data: ResumeData; style: TemplateStyle; margins: { left: number; right: number; top: number; bottom: number } }

function sectionTitle(d: Doc, ctx: Ctx, title: string) {
  d.ensure(26, ctx.margins);
  d.gap(6);
  const size = 10.5;
  d.page.drawText(title.toUpperCase(), { x: d.left, y: d.y - size, size, font: d.bold, color: ctx.style.accent });
  d.gap(size + 4);
  d.page.drawLine({ start: { x: d.left, y: d.y }, end: { x: d.right, y: d.y }, thickness: 0.8, color: LIGHT });
  d.gap(6);
}

function contactsLine(data: ResumeData): string {
  const p = data.personal;
  return [p.city, p.phone, p.email, p.link].filter(Boolean).join("   ·   ");
}

function drawHeader(d: Doc, ctx: Ctx) {
  const { data, style } = ctx;
  const name = fullName(data) || "Ваше имя";
  if (style.headerBand) {
    const bandH = 92;
    d.page.drawRectangle({ x: 0, y: A4.h - bandH, width: A4.w, height: bandH, color: style.headerBand });
    d.y = A4.h - 34;
    d.page.drawText(name, { x: d.left, y: d.y - 24, size: 24, font: d.bold, color: rgb(1, 1, 1) });
    d.y -= 30;
    if (data.personal.role) d.text(data.personal.role, { size: 11.5, color: rgb(0.88, 0.9, 1), maxWidth: d.width });
    d.gap(3);
    const c = contactsLine(data);
    if (c) d.text(c, { size: 9, color: rgb(0.82, 0.85, 0.95), maxWidth: d.width });
    d.y = A4.h - bandH - 16;
    return;
  }
  if (style.layout === "sidebar") {
    // Имя/роль рисуются в сайдбаре — здесь только отступ.
    d.y = A4.h - ctx.margins.top;
    return;
  }
  // Single-column
  if (style.centerHeader) {
    const cx = A4.w / 2;
    const nameSize = 22;
    const nw = d.bold.widthOfTextAtSize(name, nameSize);
    d.page.drawText(name, { x: cx - nw / 2, y: d.y - nameSize, size: nameSize, font: d.bold, color: style.accent });
    d.y -= nameSize + 6;
    if (data.personal.role) {
      const rs = 10.5;
      const rw = d.regular.widthOfTextAtSize(data.personal.role, rs);
      d.page.drawText(data.personal.role, { x: cx - rw / 2, y: d.y - rs, size: rs, font: d.regular, color: GRAY });
      d.y -= rs + 6;
    }
    const c = contactsLine(data);
    if (c) {
      const cs = 9;
      const cw = d.regular.widthOfTextAtSize(c, cs);
      d.page.drawText(c, { x: cx - cw / 2, y: d.y - cs, size: cs, font: d.regular, color: GRAY });
      d.y -= cs + 4;
    }
    d.gap(4);
    d.page.drawLine({ start: { x: d.left, y: d.y }, end: { x: d.right, y: d.y }, thickness: 1.2, color: style.accent });
    d.gap(12);
    return;
  }
  // modern / minimal / timeline / fresher
  d.page.drawRectangle({ x: d.left, y: d.y - 30, width: 3, height: 30, color: style.accent });
  d.page.drawText(name, { x: d.left + 12, y: d.y - 22, size: 22, font: d.bold, color: BLACK });
  d.y -= 28;
  if (data.personal.role) d.text(data.personal.role, { size: 11, color: style.accent, x: d.left + 12, maxWidth: d.width - 12 });
  const c = contactsLine(data);
  if (c) d.text(c, { size: 9, color: GRAY, x: d.left + 12, maxWidth: d.width - 12 });
  d.gap(10);
}

function drawSummary(d: Doc, ctx: Ctx) {
  if (!ctx.data.summary) return;
  sectionTitle(d, ctx, "О себе");
  d.text(ctx.data.summary, { size: 10, color: hex("#4b5563") });
}

function drawExperience(d: Doc, ctx: Ctx) {
  if (!ctx.data.experience.length) return;
  sectionTitle(d, ctx, "Опыт работы");
  for (const e of ctx.data.experience) {
    d.ensure(40, ctx.margins);
    d.text(e.position || "Должность", { size: 11, font: d.bold, color: BLACK });
    const meta = [e.company, e.period].filter(Boolean).join("  ·  ");
    if (meta) d.text(meta, { size: 9.5, color: ctx.style.accent });
    if (e.bullets?.length) {
      for (const b of e.bullets) {
        d.ensure(16, ctx.margins);
        d.page.drawCircle({ x: d.left + 2.5, y: d.y - 4, size: 1.6, color: GRAY });
        d.text(b, { size: 9.5, color: hex("#4b5563"), x: d.left + 12, maxWidth: d.width - 12, lineHeight: 13 });
      }
    }
    d.gap(6);
  }
}

function drawEducation(d: Doc, ctx: Ctx) {
  if (!ctx.data.education.length) return;
  sectionTitle(d, ctx, "Образование");
  for (const e of ctx.data.education) {
    d.ensure(30, ctx.margins);
    d.text(e.institution || "Учебное заведение", { size: 10.5, font: d.bold, color: BLACK });
    const line = [e.field, e.degree, [e.start, e.end].filter(Boolean).join("—")].filter(Boolean).join("  ·  ");
    if (line) d.text(line, { size: 9.5, color: GRAY });
    d.gap(4);
  }
}

function drawChips(d: Doc, ctx: Ctx, items: string[]) {
  if (!items.length) return;
  const size = 9;
  const padX = 6;
  const h = size + 8;
  let x = d.left;
  d.ensure(h + 4, ctx.margins);
  for (const item of items) {
    const w = d.regular.widthOfTextAtSize(item, size) + padX * 2;
    if (x + w > d.right) { x = d.left; d.y -= h + 5; d.ensure(h + 4, ctx.margins); }
    d.page.drawRectangle({ x, y: d.y - h, width: w, height: h, color: hex("#f3f4f6"), borderColor: LIGHT, borderWidth: 0.6 });
    d.page.drawText(item, { x: x + padX, y: d.y - h + 4, size, font: d.regular, color: hex("#374151") });
    x += w + 5;
  }
  d.y -= h + 4;
}

function drawSkillsAndLangs(d: Doc, ctx: Ctx) {
  const hard = hardSkills(ctx.data);
  if (hard.length) { sectionTitle(d, ctx, "Навыки"); drawChips(d, ctx, hard); }
  if (ctx.data.skills.soft.length) { sectionTitle(d, ctx, "Личные качества"); drawChips(d, ctx, ctx.data.skills.soft); }
  if (ctx.data.languages.length) {
    sectionTitle(d, ctx, "Языки");
    d.text(ctx.data.languages.map((l) => `${l.name} — ${l.level}`).join("   ·   "), { size: 10, color: hex("#4b5563") });
  }
}

function drawSidebar(d: Doc, ctx: Ctx) {
  const { data, style } = ctx;
  const sideW = 200;
  // Фон сайдбара на всю высоту страницы.
  d.page.drawRectangle({ x: 0, y: 0, width: sideW, height: A4.h, color: style.sideBg ?? hex("#f9fafb") });
  const fg = style.sideFg ?? hex("#334155");
  const ac = style.sideAccent ?? style.accent;
  const sx = 24;
  const sw = sideW - 48;
  let sy = A4.h - 40;

  const put = (value: string, size: number, font: PDFFont, color: RGB, gap = 4) => {
    const lines = d.wrap(value, font, size, sw);
    for (const line of lines) { d.page.drawText(line, { x: sx, y: sy - size, size, font, color }); sy -= size * 1.35; }
    sy -= gap;
  };

  put(fullName(data) || "Ваше имя", 16, d.bold, style.sideDark ? rgb(1, 1, 1) : BLACK, 2);
  if (data.personal.role) put(data.personal.role, 9, d.bold, ac, 10);

  for (const line of [data.personal.city, data.personal.phone, data.personal.email, data.personal.link].filter(Boolean)) {
    put(String(line), 9, d.regular, fg, 2);
  }
  sy -= 8;

  const block = (title: string, items: string[], asTags: boolean) => {
    if (!items.length) return;
    d.page.drawText(title.toUpperCase(), { x: sx, y: sy - 8, size: 8, font: d.bold, color: ac });
    sy -= 16;
    if (asTags) {
      let x = sx;
      for (const it of items) {
        const w = d.regular.widthOfTextAtSize(it, 8.5) + 12;
        if (x + w > sx + sw) { x = sx; sy -= 16; }
        d.page.drawRectangle({ x, y: sy - 12, width: w, height: 14, color: hex("#ffffff"), borderColor: LIGHT, borderWidth: 0.5 });
        d.page.drawText(it, { x: x + 6, y: sy - 9, size: 8.5, font: d.regular, color: fg });
        x += w + 4;
      }
      sy -= 20;
    } else {
      for (const it of items) put(it, 9, d.regular, fg, 2);
      sy -= 6;
    }
  };

  block("Навыки", hardSkills(data), true);
  block("Качества", data.skills.soft, true);
  block("Языки", data.languages.map((l) => `${l.name} — ${l.level}`), false);

  // Правая колонка
  d.left = sideW + 28;
  d.right = A4.w - ctx.margins.right;
  d.width = d.right - d.left;
  d.y = A4.h - ctx.margins.top;
  drawSummary(d, ctx);
  drawExperience(d, ctx);
  drawEducation(d, ctx);
}

export async function renderResumePdf(data: ResumeData, tpl: TemplateId): Promise<Blob> {
  const style = STYLES[tpl] ?? STYLES.classic;
  const family = style.serif ? "pt-serif" : "inter";
  const [regBytes, boldBytes] = await Promise.all([
    loadFontBytes(`/fonts/${family}-regular.ttf`),
    loadFontBytes(`/fonts/${family}-bold.ttf`),
  ]);
  const d = new Doc();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(regBytes, { subset: false });
  const bold = await pdf.embedFont(boldBytes, { subset: false });

  const margins = { left: 48, right: 48, top: 46, bottom: 44 };
  // init переиспользует созданный документ: подменяем ссылку.
  d.doc = pdf;
  d.regular = regular;
  d.bold = bold;
  d.page = pdf.addPage([A4.w, A4.h]);
  d.left = margins.left;
  d.right = A4.w - margins.right;
  d.width = d.right - d.left;
  d.bottom = margins.bottom;
  d.y = A4.h - margins.top;

  const ctx: Ctx = { data, style, margins };
  if (style.layout === "sidebar") {
    drawSidebar(d, ctx);
  } else {
    drawHeader(d, ctx);
    drawSummary(d, ctx);
    drawExperience(d, ctx);
    drawEducation(d, ctx);
    drawSkillsAndLangs(d, ctx);
  }

  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
