/**
 * Общие функции для парсинга HTML-документов.
 * Используются в exportPdf, exportDocx и renderDocument для унификации.
 */

export function hasClass(el: HTMLElement, token: string): boolean {
  const cls = el.className || '';
  return cls.split(/\s+/).filter(Boolean).includes(token);
}

// Инлайновые теги, которые не должны разбивать абзац
export const INLINE_TAGS = new Set([
  'strong', 'b', 'em', 'i', 'span', 'u', 'a', 'br', 'small', 'sub', 'sup', 'mark', 'code', 'label', 'abbr',
]);

export function isBlockContainer(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'DIV' || tag === 'P' || tag === 'SECTION' || tag === 'ARTICLE';
}

/**
 * Собирает inline-элементы (текст, жирность, курсив) из узла.
 */
export function nodeRuns(node: Node): Array<{ text: string; bold: boolean; italic: boolean; blank?: number }> {
  const out: Array<{ text: string; bold: boolean; italic: boolean; blank?: number }> = [];
  const walk = (n: Node, bold: boolean, italic: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent || '').replace(/\u00A0/g, ' ');
      if (t.trim()) out.push({ text: t, bold, italic });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') return;
    if (hasClass(el, 'blank-field')) {
      const style = el.getAttribute('style') || '';
      const m = style.match(/min-width:\s*(\d+)ch/i);
      const n = m ? Number(m[1]) : 0;
      if (n > 0) out.push({ text: '', bold, italic, blank: n });
      return;
    }
    const nb = bold || tag === 'strong' || tag === 'b';
    const ni = italic || tag === 'em' || tag === 'i';
    el.childNodes.forEach((c) => walk(c, nb, ni));
  };
  node.childNodes.forEach((c) => walk(c, false, false));
  return out;
}

/**
 * Собирает inline-элементы с поддержкой изображений (для DOCX).
 */
export function collectInline(node: Node, bold = false, italic = false): Array<{
  text?: string;
  bold: boolean;
  italic: boolean;
  img?: { data: Uint8Array; width: number; height: number };
  blank?: number;
}> {
  const out: Array<{
    text?: string;
    bold: boolean;
    italic: boolean;
    img?: { data: Uint8Array; width: number; height: number };
    blank?: number;
  }> = [];
  const walk = (n: Node, b: boolean, i: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent || '').replace(/\u00A0/g, ' ');
      if (t.trim()) out.push({ text: t, bold: b, italic: i });
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') return;
    if (hasClass(el, 'blank-field')) {
      const style = el.getAttribute('style') || '';
      const m = style.match(/min-width:\s*(\d+)ch/i);
      const n = m ? Number(m[1]) : 0;
      if (n > 0) out.push({ bold: b, italic: i, blank: n });
      return;
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      const m = src.match(/^data:image\/png;base64,(.+)$/);
      if (m) {
        try {
          const bin = atob(m[1]);
          const data = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
          out.push({ bold: b, italic: i, img: { data, width: 100, height: 40 } });
        } catch {
          return;
        }
      }
      return;
    }
    const nb = b || tag === 'strong' || tag === 'b';
    const ni = i || tag === 'em' || tag === 'i';
    el.childNodes.forEach((c) => walk(c, nb, ni));
  };
  node.childNodes.forEach((c) => walk(c, bold, italic));
  return out;
}

/**
 * Проверяет, есть ли у элемента блочные потомки.
 */
export function hasBlockDescendant(el: HTMLElement): boolean {
  const BLOCK_TAGS = new Set([
    'div', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'section', 'article', 'table',
  ]);
  return Array.from(el.children).some((c) => {
    const tag = (c as HTMLElement).tagName.toLowerCase();
    return BLOCK_TAGS.has(tag) || hasBlockDescendant(c as HTMLElement);
  });
}

/**
 * Извлекает размер шрифта из класса Tailwind.
 */
export function sizeFromClass(cls: string, design: { bodyFontSize: number; smallFontSize: number; tinyFontSize: number; subheadingFontSize: number; titleFontSize?: number }, fallback: number): number {
  if (cls.includes('text-xs') || cls.includes('text-[10px]')) return design.tinyFontSize;
  if (cls.includes('text-sm')) return design.smallFontSize;
  if (cls.includes('text-lg') || cls.includes('text-xl')) return design.subheadingFontSize;
  if (cls.includes('text-2xl') || cls.includes('text-3xl')) return design.titleFontSize ?? design.subheadingFontSize * 1.5;
  return fallback;
}

/**
 * Извлекает межстрочный интервал из класса Tailwind.
 */
export function lineHeightFromClass(cls: string, design: { lineHeight: number }): number {
  if (cls.includes('leading-3')) return 1.1;
  if (cls.includes('leading-4')) return 1.2;
  if (cls.includes('leading-5')) return 1.3;
  if (cls.includes('leading-6')) return 1.4;
  if (cls.includes('leading-7')) return 1.5;
  if (cls.includes('leading-8')) return 1.6;
  return design.lineHeight;
}