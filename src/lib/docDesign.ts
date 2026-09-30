import { A4_PT } from "@/lib/page-geometry";
/**
 * Единая дизайн-система документа (design tokens).
 *
 * ЕДИНСТВЕННЫЙ источник значений типографики и оформления для всех
 * генераторов документов: PDF (src/lib/exportPdf.ts) и DOCX
 * (src/lib/exportDocx.ts). Изменение токена здесь автоматически
 * синхронно применяется в обоих форматах — никаких независимых
 * наборов значений в рендерах быть не должно.
 *
 * Базовое правило перевода размеров: 1pt = 4/3px (px-классы tailwind
 * в шаблонах документов переводятся в pt умножением на 0.75).
 */

export type DesignId = "classic" | "minimal" | "brand";

export interface DesignFonts {
  /** Имена файлов в public/fonts (по 4 начертания) для pdf-lib. */
  regular: string;
  bold: string;
  italic: string;
  bolditalic: string;
  /** Имя семейства для DOCX/Word и печатного CSS. */
  family: string;
  /**
   * Системное семейство ТОЛЬКО для DOCX. Библиотека docx не встраивает
   * шрифты, поэтому здесь обязан быть шрифт, имеющийся на любой машине
   * (Word иначе делает подмену и документ выглядит «некорректно»).
   */
  officeFamily: string;
}

export interface FitCompression {
  /** Шаг уменьшения межстрочного интервала. */
  lineHeightStep: number;
  /** Шаг уменьшения кегля, pt. */
  fontSizeStep: number;
  /** Максимум шагов сжатия. */
  maxSteps: number;
}

export interface DesignTokens {
  id: DesignId;
  label: string;
  description: string;
  fonts: DesignFonts;

  /** Кегли, pt. */
  titleFontSize: number;
  subheadingFontSize: number;
  bodyFontSize: number;
  smallFontSize: number;
  tinyFontSize: number;

  /** Межстрочный интервал основного текста (множитель). */
  lineHeight: number;
  /** Минимальный межстрочный интервал при сжатии «на одну страницу». */
  minLineHeight: number;

  /** Поля страницы, мм. */
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;

  /** Цвета (hex без #). */
  accent: string;
  textColor: string;
  grayText: string;
  ruleColor: string;
  tableBorderColor: string;
  /** Заливка шапок таблиц и заголовков «Стороны» (null — без заливки). */
  tableHeadFill: string | null;

  /** Положение вордмарка в шапке страницы. */
  headerAlign: "left" | "center" | "right";
  /** brand: вордмарк акцентным цветом и чуть крупнее. */
  logoWeight: "normal" | "strong";
  /** Классика: подзаголовки разделов — капсом. */
  capSubheadings: boolean;

  /** Стиль таблиц. */
  tableBorders: "all" | "horizontal" | "accent-top";
  /** Стиль заголовков «Стороны» (doc-sides). */
  sideTitleStyle: "fill" | "rule" | "accent-bar";

  fit: FitCompression;

  wordmark: string;
  tagline: string;
  siteUrl: string;
}

export const MM_TO_PT = 2.834645669;
export const MM_TO_TWIPS = 56.6929134;
export const PT_TO_HALFPOINTS = 2;

/** px из tailwind-классов → pt (единое правило для PDF и DOCX). */
export function pxToPt(px: number): number {
  return px * 0.75;
}

/** Масштабированные токены для сжатия «уместить на страницу». */
export function scaleDesign(
  design: DesignTokens,
  step: number
): DesignTokens {
  const k = 1 - design.fit.fontSizeStep * step / 10;
  const lh = Math.max(
    design.minLineHeight,
    design.lineHeight - design.fit.lineHeightStep * step
  );
  return {
    ...design,
    lineHeight: lh,
    titleFontSize: Math.max(design.smallFontSize, design.titleFontSize * k),
    subheadingFontSize: Math.max(design.smallFontSize, design.subheadingFontSize * k),
    bodyFontSize: Math.max(design.smallFontSize, design.bodyFontSize * k),
    smallFontSize: Math.max(design.tinyFontSize, design.smallFontSize * k),
  };
}

/**
 * Семантический кегль по классам элемента (pt).
 * Единая функция для PDF- и DOCX-рендеров: классы в шаблонах документов
 * интерпретируются одинаково в обоих форматах.
 */
export function sizeFromClass(
  cls: string,
  design: DesignTokens,
  fallbackPt: number
): number {
  if (cls.includes("doc-title")) return design.titleFontSize;
  // Подзаголовки разделов: font-bold uppercase (text-black | text-xs | mb-2).
  if (
    cls.includes("font-bold") &&
    cls.includes("uppercase") &&
    (cls.includes("text-black") || cls.includes("text-xs") || cls.includes("mb-2"))
  ) {
    return design.subheadingFontSize;
  }
  const px = cls.match(/text-\[(\d+)px\]/);
  if (px) return pxToPt(parseInt(px[1], 10));
  if (cls.includes("text-xs")) return pxToPt(12);
  if (cls.includes("text-sm")) return pxToPt(14);
  if (cls.includes("text-base")) return pxToPt(16);
  if (cls.includes("text-lg")) return pxToPt(18);
  if (cls.includes("text-xl")) return pxToPt(20);
  if (cls.includes("text-2xl")) return pxToPt(24);
  return fallbackPt;
}

/** Межстрочный интервал (множитель) по классам. */
export function lineHeightFromClass(cls: string, design: DesignTokens): number {
  if (cls.includes("leading-normal")) return Math.max(1.15, design.lineHeight);
  if (cls.includes("leading-tight")) return Math.max(1.05, design.lineHeight - 0.08);
  if (cls.includes("leading-relaxed")) return Math.max(1.15, design.lineHeight + 0.1);
  return design.lineHeight;
}

const CLASSIC: DesignTokens = {
  id: "classic",
  label: "Классика",
  description:
    "PT Serif, тёмно-синий акцент, консервативный вид — как в госучреждениях и нотариате",
  fonts: {
    regular: "/fonts/pt-serif-regular.ttf",
    bold: "/fonts/pt-serif-bold.ttf",
    italic: "/fonts/pt-serif-italic.ttf",
    bolditalic: "/fonts/pt-serif-bolditalic.ttf",
    family: "Times New Roman",
    officeFamily: "Times New Roman",
  },
  titleFontSize: 16,
  subheadingFontSize: 13,
  bodyFontSize: 12,
  smallFontSize: 10,
  tinyFontSize: 9,
  lineHeight: 1.2,
  minLineHeight: 1.05,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 22,
  marginRight: 15,
  accent: "1A3C6C",
  textColor: "111111",
  grayText: "52525B",
  ruleColor: "C9CDD6",
  tableBorderColor: "B9BEC8",
  tableHeadFill: "EEF1F7",
  headerAlign: "right",
  logoWeight: "normal",
  capSubheadings: true,
  tableBorders: "all",
  sideTitleStyle: "fill",
  fit: { lineHeightStep: 0.06, fontSizeStep: 0.5, maxSteps: 2 },
  wordmark: "Dogovor.expert",
  tagline: "Юридические документы за 5 минут",
  siteUrl: "dogovor.expert",
};

const MINIMAL: DesignTokens = {
  id: "minimal",
  label: "Деловой минимализм",
  description:
    "Inter, больше воздуха, тонкие линии вместо рамок, спокойный тёмно-зелёный акцент",
  fonts: {
    regular: "/fonts/inter-regular.ttf",
    bold: "/fonts/inter-bold.ttf",
    italic: "/fonts/inter-italic.ttf",
    bolditalic: "/fonts/inter-bolditalic.ttf",
    family: "Inter",
    officeFamily: "Calibri",
  },
  titleFontSize: 16,
  subheadingFontSize: 13,
  bodyFontSize: 12,
  smallFontSize: 10,
  tinyFontSize: 9,
  lineHeight: 1.25,
  minLineHeight: 1.05,
  marginTop: 18,
  marginBottom: 18,
  marginLeft: 20,
  marginRight: 18,
  accent: "0F766E",
  textColor: "1A1A1A",
  grayText: "64748B",
  ruleColor: "E2E4E9",
  tableBorderColor: "D9DCE2",
  tableHeadFill: null,
  headerAlign: "center",
  logoWeight: "normal",
  capSubheadings: false,
  tableBorders: "horizontal",
  sideTitleStyle: "rule",
  fit: { lineHeightStep: 0.06, fontSizeStep: 0.5, maxSteps: 2 },
  wordmark: "Dogovor.expert",
  tagline: "Юридические документы за 5 минут",
  siteUrl: "dogovor.expert",
};

const BRAND: DesignTokens = {
  id: "brand",
  label: "Фирменный",
  description:
    "Inter, акцентный синий бренда dogovor.expert, заметный логотип в шапке",
  fonts: {
    regular: "/fonts/inter-regular.ttf",
    bold: "/fonts/inter-bold.ttf",
    italic: "/fonts/inter-italic.ttf",
    bolditalic: "/fonts/inter-bolditalic.ttf",
    family: "Inter",
    officeFamily: "Calibri",
  },
  titleFontSize: 16,
  subheadingFontSize: 13,
  bodyFontSize: 12,
  smallFontSize: 10,
  tinyFontSize: 9,
  lineHeight: 1.25,
  minLineHeight: 1.05,
  marginTop: 18,
  marginBottom: 18,
  marginLeft: 20,
  marginRight: 18,
  accent: "2563EB",
  textColor: "1A1A1A",
  grayText: "64748B",
  ruleColor: "E2E4E9",
  tableBorderColor: "D9DCE2",
  tableHeadFill: null,
  headerAlign: "right",
  logoWeight: "strong",
  capSubheadings: false,
  tableBorders: "accent-top",
  sideTitleStyle: "accent-bar",
  fit: { lineHeightStep: 0.06, fontSizeStep: 0.5, maxSteps: 2 },
  wordmark: "Dogovor.expert",
  tagline: "Юридические документы за 5 минут",
  siteUrl: "dogovor.expert",
};

export const DOC_DESIGNS: Record<DesignId, DesignTokens> = {
  classic: CLASSIC,
  minimal: MINIMAL,
  brand: BRAND,
};

export function getDesign(id?: DesignId | string): DesignTokens {
  if (id && id in DOC_DESIGNS) return DOC_DESIGNS[id as DesignId];
  return CLASSIC;
}

/** Геометрия страницы A4 в pt при токенах дизайна. */
export interface PageMetrics {
  w: number;
  h: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  /** Высота шапки (вордмарк + слоган + отступ). */
  headerHeight: number;
  /** Высота подвала (линия + номера). */
  footerHeight: number;
  /** Ширина контента. */
  availWidth: number;
  /** Высота контента на странице (за вычетом полей, шапки и подвала). */
  availHeight: number;
}

export function pageMetrics(design: DesignTokens): PageMetrics {
  // Геометрия листа — из единого источника (раньше 595.28/841.89 дублировались
  // в пяти файлах, и метрики разъезжались с фактическим размером страницы).
  const w = A4_PT.w;
  const h = A4_PT.h;
  const headerHeight = design.logoWeight === "strong"
    ? 9 * MM_TO_PT
    : 8 * MM_TO_PT;
  const footerHeight = 8 * MM_TO_PT;
  const marginLeft = design.marginLeft * MM_TO_PT;
  const marginRight = design.marginRight * MM_TO_PT;
  const marginTop = design.marginTop * MM_TO_PT;
  const marginBottom = design.marginBottom * MM_TO_PT;
  return {
    w,
    h,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    headerHeight,
    footerHeight,
    availWidth: w - marginLeft - marginRight,
    availHeight: h - marginTop - marginBottom - headerHeight - footerHeight,
  };
}

/** hex (#XXXXXX / XXXXXX) → [r, g, b] 0..1. */
export function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}