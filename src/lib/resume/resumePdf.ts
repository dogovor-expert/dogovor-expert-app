/**
 * Рендер резюме в PDF на pdf-lib: настоящий A4, текстовый слой (не картинка),
 * фирменный акцент и раскладка, повторяющая превью шаблона.
 *
 * Отдельный от exportPdf.ts рендер, потому что тот парсит HTML по классам
 * документов (doc-title/doc-sides/…), а у резюме своя семантика и 22 макета.
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
  layout: "single" | "sidebar" | "columns";
  serif?: boolean;
  headerBand?: RGB;
  sideBg?: RGB;
  sideFg?: RGB;
  sideAccent?: RGB;
  sideDark?: boolean;
  centerHeader?: boolean;
  /** Акцентная полоса сверху страницы (мокапы «Эксперт»/«Креатив»). */
  topStrip?: RGB;
  /** Фото справа в шапке (шаблон «Креатив»). */
  photoInHeader?: boolean;
  /** Таймлайн опыта: акцентная точка перед каждой записью. */
  expDots?: boolean;
  /** Квадрат-маркер перед заголовком секции (рейл Executive Corporate). */
  railIcons?: boolean;
  /** Подпись внизу сайдбара (Modern Sidebar). */
  sideFoot?: string;
}

const hex = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const STYLES: Record<TemplateId, TemplateStyle> = {
  "executive-navy": { accent: hex("#1e293b"), layout: "columns", headerBand: hex("#1e293b"), photoInHeader: true, expDots: true, railIcons: true },
  "tech-indigo": { accent: hex("#4f46e5"), layout: "columns", expDots: true },
  "classic-legal": { accent: hex("#0f172a"), layout: "single", serif: true, centerHeader: true },
  "nordic-minimal": { accent: hex("#0d9488"), layout: "single" },
  "modern-emerald": { accent: hex("#059669"), layout: "sidebar", sideBg: hex("#059669"), sideFg: hex("#ffffff"), sideAccent: hex("#a7f3d0"), sideDark: true, sideFoot: "Dogovor.expert · резюме по стандартам 2026" },
  "creative-coral": { accent: hex("#ea580c"), layout: "single", topStrip: hex("#ea580c"), photoInHeader: true },
  "junior-launch": { accent: hex("#2563eb"), layout: "single" },
  "corporate-slate": { accent: hex("#334155"), layout: "single", serif: true, centerHeader: true },
  "data-mono": { accent: hex("#7c3aed"), layout: "columns", expDots: true },
  "legal-counsel": { accent: hex("#1e3a8a"), layout: "sidebar", sideBg: hex("#1e3a8a"), sideFg: hex("#ffffff"), sideAccent: hex("#93c5fd"), sideDark: true, sideFoot: "Dogovor.expert · резюме по стандартам 2026" },
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

interface Ctx { data: ResumeData; style: TemplateStyle; margins: { left: number; right: number; top: number; bottom: number }; pdf: PDFDocument }

function sectionTitle(d: Doc, ctx: Ctx, title: string) {
  d.ensure(26, ctx.margins);
  d.gap(6);
  const size = 10.5;
  const tx = ctx.style.railIcons ? d.left + 11 : d.left;
  if (ctx.style.railIcons) {
    d.page.drawRectangle({ x: d.left, y: d.y - size - 1, width: size - 3, height: size - 3, color: ctx.style.accent });
  }
  d.page.drawText(title.toUpperCase(), { x: tx, y: d.y - size, size, font: d.bold, color: ctx.style.accent });
  d.gap(size + 4);
  d.page.drawLine({ start: { x: d.left, y: d.y }, end: { x: d.right, y: d.y }, thickness: 0.8, color: LIGHT });
  d.gap(6);
}

function contactsLine(data: ResumeData): string {
  const p = data.personal;
  return [p.city, p.phone, p.email, p.link].filter(Boolean).join("   ·   ");
}

/** Показывать ли фото (учитывает галочку). */
function pdfShowPhoto(data: ResumeData): boolean {
  return Boolean(data.personal.photo && data.personal.showPhoto !== false);
}

/**
 * Рисует фото в правом верхнем углу шапки/баннера и возвращает занятую ширину,
 * чтобы текст не наезжал. Возвращает 0, если фото нет или формат не поддержан.
 */
async function drawCornerPhoto(d: Doc, ctx: Ctx, box: number, topY: number, onBand: boolean): Promise<number> {
  const url = pdfShowPhoto(ctx.data) ? ctx.data.personal.photo : "";
  if (!url || !url.startsWith("data:image/")) return 0;
  try {
    const bytes = await (await fetch(url)).arrayBuffer();
    const img = url.includes("png") ? await ctx.pdf.embedPng(bytes) : await ctx.pdf.embedJpg(bytes);
    const s = box / Math.max(img.width, img.height);
    const w = img.width * s;
    const h = img.height * s;
    const px = d.right - box;
    const py = topY - box;
    d.page.drawRectangle({ x: px - 2, y: py - 2, width: box + 4, height: box + 4, borderColor: onBand ? rgb(1, 1, 1) : LIGHT, borderWidth: 1.5 });
    d.page.drawImage(img, { x: px + (box - w) / 2, y: py + (box - h) / 2, width: w, height: h });
    return box + 14;
  } catch {
    return 0;
  }
}

async function drawHeader(d: Doc, ctx: Ctx) {
  const { data, style } = ctx;
  const name = fullName(data) || "Ваше имя";
  if (style.topStrip) {
    // Шапка мокапов «Эксперт»/«Креатив»: полоса + имя акцентным цветом.
    d.page.drawRectangle({ x: 0, y: A4.h - 5, width: A4.w, height: 5, color: style.topStrip });
    d.y = A4.h - 5 - 32;
    const photoTop = d.y;
    let textW = d.width;
    let photoBox = 0;
    const photoUrl = style.photoInHeader ? data.personal.photo : "";
    if (photoUrl && photoUrl.startsWith("data:image/")) {
      try {
        const bytes = await (await fetch(photoUrl)).arrayBuffer();
        const img = photoUrl.includes("png") ? await ctx.pdf.embedPng(bytes) : await ctx.pdf.embedJpg(bytes);
        const box = 62;
        const s = box / Math.max(img.width, img.height);
        const w = img.width * s;
        const h = img.height * s;
        const px = d.right - box;
        d.page.drawRectangle({ x: px, y: d.y - box, width: box, height: box, borderColor: style.accent, borderWidth: 1.5 });
        d.page.drawImage(img, { x: px + (box - w) / 2, y: d.y - box + (box - h) / 2, width: w, height: h });
        textW = d.width - box - 16;
        photoBox = box;
      } catch {
        // Неподдерживаемый формат фото — шапка без фото, как заглушка мокапа.
      }
    }
    d.page.drawText(name, { x: d.left, y: d.y - 24, size: 24, font: d.bold, color: style.accent, maxWidth: textW });
    d.y -= 30;
    if (data.personal.role) d.text(data.personal.role, { size: 11, font: d.bold, color: hex("#374151"), maxWidth: textW });
    const c = contactsLine(data);
    if (c) d.text(c, { size: 9, color: GRAY, maxWidth: textW });
    d.y = Math.min(d.y, photoTop - photoBox - 12);
    return;
  }
  if (style.headerBand) {
    const bandH = 92;
    d.page.drawRectangle({ x: 0, y: A4.h - bandH, width: A4.w, height: bandH, color: style.headerBand });
    d.y = A4.h - 34;
    const used = await drawCornerPhoto(d, ctx, 62, A4.h - 14, true);
    const tw = d.width - used;
    d.page.drawText(name, { x: d.left, y: d.y - 24, size: 24, font: d.bold, color: rgb(1, 1, 1), maxWidth: tw });
    d.y -= 30;
    if (data.personal.role) d.text(data.personal.role, { size: 11.5, color: rgb(0.88, 0.9, 1), maxWidth: tw });
    d.gap(3);
    const c = contactsLine(data);
    if (c) d.text(c, { size: 9, color: rgb(0.82, 0.85, 0.95), maxWidth: tw });
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
    await drawCornerPhoto(d, ctx, 70, d.y, false);
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
  const usedW = await drawCornerPhoto(d, ctx, 70, d.y, false);
  d.page.drawRectangle({ x: d.left, y: d.y - 30, width: 3, height: 30, color: style.accent });
  d.page.drawText(name, { x: d.left + 12, y: d.y - 22, size: 22, font: d.bold, color: BLACK, maxWidth: d.width - 12 - usedW });
  d.y -= 28;
  if (data.personal.role) d.text(data.personal.role, { size: 11, color: style.accent, x: d.left + 12, maxWidth: d.width - 12 - usedW });
  const c = contactsLine(data);
  if (c) d.text(c, { size: 9, color: GRAY, x: d.left + 12, maxWidth: d.width - 12 - usedW });
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
    const ix = ctx.style.expDots ? d.left + 12 : d.left;
    const iw = ctx.style.expDots ? d.width - 12 : d.width;
    if (ctx.style.expDots) {
      d.page.drawCircle({ x: d.left + 3, y: d.y - 5, size: 2.2, color: ctx.style.accent });
    }
    d.text(e.position || "Должность", { size: 11, font: d.bold, color: BLACK, x: ix, maxWidth: iw });
    const meta = [e.company, e.period].filter(Boolean).join("  ·  ");
    if (meta) d.text(meta, { size: 9.5, color: ctx.style.accent, x: ix, maxWidth: iw });
    if (e.bullets?.length) {
      for (const b of e.bullets) {
        d.ensure(16, ctx.margins);
        d.page.drawCircle({ x: ix + 2.5, y: d.y - 4, size: 1.6, color: GRAY });
        d.text(b, { size: 9.5, color: hex("#4b5563"), x: ix + 12, maxWidth: iw - 12, lineHeight: 13 });
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

function drawChips(d: Doc, ctx: Ctx, items: string[], tone?: { bg: RGB; border: RGB; fg: RGB }) {
  if (!items.length) return;
  const bg = tone?.bg ?? hex("#f3f4f6");
  const border = tone?.border ?? LIGHT;
  const fg = tone?.fg ?? hex("#374151");
  const size = 9;
  const padX = 6;
  const h = size + 8;
  let x = d.left;
  d.ensure(h + 4, ctx.margins);
  for (const item of items) {
    const w = d.regular.widthOfTextAtSize(item, size) + padX * 2;
    if (x + w > d.right) { x = d.left; d.y -= h + 5; d.ensure(h + 4, ctx.margins); }
    d.page.drawRectangle({ x, y: d.y - h, width: w, height: h, color: bg, borderColor: border, borderWidth: 0.6 });
    d.page.drawText(item, { x: x + padX, y: d.y - h + 4, size, font: d.regular, color: fg });
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

  if (style.sideFoot) {
    d.page.drawLine({ start: { x: sx, y: 44 }, end: { x: sx + sw, y: 44 }, thickness: 0.6, color: ac });
    d.page.drawText(style.sideFoot, { x: sx, y: 30, size: 7.5, font: d.regular, color: fg });
  }

  // Правая колонка
  d.left = sideW + 28;
  d.right = A4.w - ctx.margins.right;
  d.width = d.right - d.left;
  d.y = A4.h - ctx.margins.top;
  drawSummary(d, ctx);
  drawExperience(d, ctx);
  drawEducation(d, ctx);
}

/**
 * Две колонки в основной области (шаблон «Эксперт»: слева опыт+образование,
 * справа рейл с навыками и языками). Колонки рисуются строго на одной странице:
 * перед стартом требуем запас места, иначе уходим на новую страницу целиком.
 */
function drawColumns(d: Doc, ctx: Ctx) {
  d.ensure(380, ctx.margins);
  const y0 = d.y;
  const gap = 28;
  const leftW = (d.width - gap) * (1.35 / 2.35);
  const savedL = d.left;
  const savedR = d.right;
  const scope = (left: number, right: number) => { d.left = left; d.right = right; d.width = right - left; };

  scope(savedL, savedL + leftW);
  drawExperience(d, ctx);
  drawEducation(d, ctx);
  const yLeft = d.y;

  d.y = y0;
  scope(savedL + leftW + gap, savedR);
  const tone = { bg: hex("#eef2ff"), border: hex("#e0e7ff"), fg: hex("#4338ca") };
  const hard = hardSkills(ctx.data);
  if (hard.length) { sectionTitle(d, ctx, "Навыки"); drawChips(d, ctx, hard, tone); }
  if (ctx.data.skills.soft.length) { sectionTitle(d, ctx, "Личные качества"); drawChips(d, ctx, ctx.data.skills.soft, tone); }
  if (ctx.data.languages.length) {
    sectionTitle(d, ctx, "Языки");
    for (const l of ctx.data.languages) {
      d.ensure(15, ctx.margins);
      d.page.drawCircle({ x: d.left + 2.5, y: d.y - 4, size: 1.8, color: ctx.style.accent });
      d.text(`${l.name} — ${l.level}`, { size: 9.5, color: hex("#4b5563"), x: d.left + 12, maxWidth: d.width - 12, lineHeight: 13 });
    }
  }

  scope(savedL, savedR);
  d.y = Math.min(yLeft, d.y);
}

export async function renderResumePdf(data: ResumeData, tpl: TemplateId, accent?: string): Promise<Blob> {
  const baseStyle = STYLES[tpl] ?? STYLES["classic-legal"];
  const style: TemplateStyle = accent
    ? {
        ...baseStyle,
        accent: hex(accent),
        ...(baseStyle.headerBand ? { headerBand: hex(accent) } : {}),
        ...(baseStyle.topStrip ? { topStrip: hex(accent) } : {}),
        ...(baseStyle.sideBg ? { sideBg: hex(accent) } : {}),
      }
    : baseStyle;
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

  const ctx: Ctx = { data, style, margins, pdf };
  if (style.layout === "sidebar") {
    drawSidebar(d, ctx);
  } else if (style.layout === "columns") {
    await drawHeader(d, ctx);
    drawSummary(d, ctx);
    drawColumns(d, ctx);
  } else {
    await drawHeader(d, ctx);
    drawSummary(d, ctx);
    drawExperience(d, ctx);
    drawEducation(d, ctx);
    drawSkillsAndLangs(d, ctx);
  }

  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
