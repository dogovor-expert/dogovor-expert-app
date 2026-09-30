import { GlobalWorkerOptions, getDocument, Util } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Воркер pdf.js подключаем через new URL(..., import.meta.url) — это
// рабочий способ для webpack 5 (Next.js). Вариант оригинала
// `import ... '?raw'` — директива Vite, в Next.js она не существует.
// Подход со Blob сохранён: воркер едет внутри бандла, обработка PDF не
// зависит от CDN и работает офлайн.
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export type Category = 'names' | 'emails' | 'phones' | 'financial' | 'addresses' | 'manual';

export interface Redaction {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  category: Category;
  label: string;
  selected: boolean;
}

export interface LocalPage {
  image: string;
  width: number;
  height: number;
  pdfWidth: number;
  pdfHeight: number;
}

export interface LocalDocument {
  name: string;
  size: number;
  kind: 'pdf' | 'image' | 'demo';
  pages: LocalPage[];
  redactions: Redaction[];
  original?: ArrayBuffer;
}

export const uid = () => crypto.randomUUID();

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось прочитать изображение. Попробуйте PNG, JPEG или WebP.'));
    image.src = source;
  });
}

export function canvasBlob(canvas: HTMLCanvasElement, mime = 'image/png', quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Браузер не смог сохранить изображение.')), mime, quality);
  });
}

export function createDemoDocument(): LocalDocument {
  const canvas = document.createElement('canvas');
  canvas.width = 1190;
  canvas.height = 1684;
  const context = canvas.getContext('2d')!;
  context.scale(2, 2);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 595, 842);
  const redactions: Redaction[] = [];
  const text = (value: string, x: number, y: number, size = 11, bold = false, color = '#363b37') => {
    context.font = `${bold ? 'bold ' : ''}${size}px Georgia, "Times New Roman", serif`;
    context.fillStyle = color;
    context.fillText(value, x, y);
  };
  const mark = (value: string, x: number, y: number, category: Category, size = 11) => {
    text(value, x, y, size);
    redactions.push({
      id: uid(), page: 0, x: (x - 2) / 595, y: (y - size - 1) / 842,
      width: (context.measureText(value).width + 5) / 595, height: (size + 7) / 842,
      category, label: value, selected: true,
    });
  };
  const heading = (value: string, y: number) => text(value, 53, y, 10.5, true);
  text('NORTH STUDIO', 53, 49, 10, true, '#455d4b');
  text('ЮРИДИЧЕСКИЕ ДОКУМЕНТЫ', 382, 49, 7, false, '#899087');
  context.strokeStyle = '#d5d9d2';
  context.lineWidth = 0.6;
  context.beginPath();
  context.moveTo(53, 64);
  context.lineTo(542, 64);
  context.stroke();
  text('ДОГОВОР', 53, 105, 24, true, '#2e3430');
  text('оказания услуг № 024/26', 53, 129, 12);
  text('г. Москва', 53, 168, 10);
  text('12 мая 2026 года', 445, 168, 10);
  heading('1. СТОРОНЫ ДОГОВОРА', 207);
  text('Общество с ограниченной ответственностью «Норт Студио»,', 53, 231);
  text('в лице директора', 53, 250);
  mark('Иванова Алексея Сергеевича', 145, 250, 'names');
  text('(Исполнитель),', 310, 250);
  text('и', 53, 269);
  mark('Смирнова Мария Андреевна', 63, 269, 'names');
  text('(Заказчик), заключили', 230, 269);
  text('настоящий договор о нижеследующем.', 53, 288);
  heading('2. ПРЕДМЕТ ДОГОВОРА', 328);
  text('2.1. Исполнитель обязуется оказать услуги по разработке визуальной', 53, 352);
  text('концепции проекта, а Заказчик обязуется принять и оплатить услуги', 53, 371);
  text('в порядке и на условиях, предусмотренных настоящим договором.', 53, 390);
  heading('3. СТОИМОСТЬ И ПОРЯДОК РАСЧЕТОВ', 429);
  text('3.1. Общая стоимость услуг составляет 48 000 (сорок восемь тысяч)', 53, 453);
  text('рублей. Оплата производится в течение 5 рабочих дней.', 53, 472);
  heading('4. КОНТАКТЫ И РЕКВИЗИТЫ', 512);
  text('ЗАКАЗЧИК', 53, 541, 9, true, '#6e766e');
  text('ИСПОЛНИТЕЛЬ', 321, 541, 9, true, '#6e766e');
  text('Паспорт:', 53, 566, 10);
  mark('4510 123456', 103, 566, 'financial', 10);
  text('ИНН:', 321, 566, 10);
  mark('7704123456', 354, 566, 'financial', 10);
  text('Email:', 53, 589, 10);
  mark('m.smirnova@example.ru', 91, 589, 'emails', 10);
  text('Р/с:', 321, 589, 10);
  mark('40702810900001234567', 347, 589, 'financial', 10);
  text('Тел.:', 53, 612, 10);
  mark('+7 (916) 123-45-67', 84, 612, 'phones', 10);
  text('Банк: АО «Пример Банк»', 321, 612, 10);
  text('Адрес:', 53, 635, 10);
  mark('г. Москва, ул. Лесная, д. 7', 94, 635, 'addresses', 10);
  text('БИК: 044525225', 321, 635, 10);
  context.strokeStyle = '#8a9289';
  context.beginPath();
  context.moveTo(53, 721);
  context.lineTo(229, 721);
  context.moveTo(321, 721);
  context.lineTo(497, 721);
  context.stroke();
  text('Заказчик', 53, 738, 9, false, '#8a9289');
  text('Исполнитель', 321, 738, 9, false, '#8a9289');
  context.strokeStyle = '#627eaa';
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(73, 713);
  context.bezierCurveTo(81, 698, 93, 723, 112, 693);
  context.bezierCurveTo(88, 730, 138, 698, 154, 707);
  context.bezierCurveTo(142, 720, 169, 705, 176, 710);
  context.stroke();
  context.save();
  context.translate(458, 700);
  context.rotate(-0.14);
  context.globalAlpha = 0.57;
  context.beginPath();
  context.arc(0, 0, 34, 0, Math.PI * 2);
  context.arc(0, 0, 29, 0, Math.PI * 2);
  context.stroke();
  text('НОРТ', -14, -3, 9, true, '#50749f');
  text('СТУДИО', -20, 10, 9, true, '#50749f');
  text('МОСКВА', -17, 23, 6, false, '#50749f');
  context.restore();
  text('Все данные вымышлены. Документ создан для демонстрации.', 53, 799, 7, false, '#9a9e98');
  text('01 / 01', 512, 799, 7, false, '#9a9e98');
  const image = canvas.toDataURL('image/png');
  return {
    name: 'Договор_услуг.pdf', size: Math.round(image.length * 0.75), kind: 'demo',
    pages: [{ image, width: canvas.width, height: canvas.height, pdfWidth: 595, pdfHeight: 842 }],
    redactions,
  };
}

/**
 * Автопоиск персональных данных.
 *
 * ⚠️ КРИТИЧНО, исправлено 30.09.2026.
 *
 * Раньше правила применялись по очереди, а перекрывающееся совпадение
 * просто ОТБРАСЫВАЛОСЬ (`if (occupied.some(...)) continue`).
 * Из-за этого «телефон» срабатывал первым и перехватывал кусок номера
 * счёта, после чего правило financial пропускало уже «занятый» диапазон:
 *
 *   «р/с 40702810900001234567»
 *     → phones:   «81090000123»   (цифры внутри номера счёта)
 *     → financial: ПРОПУЩЕНО
 *
 * Итог: закрашивался бессмысленный фрагмент, а сам номер счёта оставался
 * читаемым в PDF. Для инструмента обезличивания это обратная функция.
 *
 * Теперь совпадения сначала собираются ВСЕ, затем пересекающиеся
 * объединяются в единый прямоугольник (mergeSpans). Частичное перекрытие
 * больше невозможно: объединение всегда покрывает оба фрагмента целиком.
 *
 * Отдельно добавлены БИК (9 цифр), СНИЛС (11), ОГРН (13–15) и ИНН ИП:
 * раньше в шаблонах их не было вовсе, поэтому такие реквизиты оставались
 * в документе незамеченными.
 */

/** Правило поиска. `group` — индекс группы с самими данными, если она не совпадает со всем совпадением. */
interface Rule {
  category: Category;
  pattern: RegExp;
  group?: number;
}

/** Приоритет категории при объединении: чем меньше — тем важнее для пользователя. */
const CATEGORY_PRIORITY: Record<Category, number> = {
  financial: 0,
  emails: 1,
  phones: 1,
  names: 2,
  addresses: 3,
  manual: 4,
};

const rules: Rule[] = [
  // Контекстные правила — самые точные, поэтому идут первыми.
  { category: 'financial', pattern: /БИК\s*[:.]?\s*(\d{9})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /ИНН\s*[:.]?\s*(\d{10}|\d{12})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /(?:СНИЛС|С\.?\s*И\.?\s*Л\.?\s*С\.?)\s*[:.]?\s*([\d\s-]{11,14})/gi, group: 1 },
  { category: 'financial', pattern: /ОГРН(?:ИП)?\s*[:.]?\s*(\d{13,15})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /Паспорт\s*[:.]?\s*(\d{2,4}\s?\d{6})/gi, group: 1 },

  // Бесконтекстные правила реквизитов.
  { category: 'emails', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { category: 'financial', pattern: /\b\d{20}\b/g },        // расчётный счёт
  { category: 'financial', pattern: /\b\d{11}\b/g },        // СНИЛС
  { category: 'financial', pattern: /\b\d{12}\b/g },        // ИНН ИП, счёт
  { category: 'financial', pattern: /\b\d{10}\b/g },        // ИНН
  { category: 'financial', pattern: /\b\d{4}\s\d{6}\b/g },  // серия и номер паспорта
  { category: 'financial', pattern: /\b(?:\d{4}[ -]){3}\d{4}\b/g }, // карта
  { category: 'phones', pattern: /(?:\+\d{1,3}[\s(-]*|8[\s(-]*)\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g },
  { category: 'names', pattern: /[А-ЯЁ][а-яё]{2,}\s+[А-ЯЁ][а-яё]{2,}(?:\s+[А-ЯЁ][а-яё]{2,})?/g },
  { category: 'addresses', pattern: /(?:г\.\s*|ул\.\s*|город\s+)[А-ЯЁ][А-Яа-яЁё\d\s.,/-]{4,80}/g },
];

interface Span {
  start: number;
  end: number;
  category: Category;
}

/**
 * Объединяет пересекающиеся и соседние диапазоны.
 *
 * Именно здесь устраняется утечка: раньше перекрытие приводило к
 * отбрасыванию, теперь — к расширению покрытия до объединения.
 */
export function mergeSpans(spans: Span[]): Span[] {
  if (!spans.length) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Span[] = [{ ...sorted[0] }];
  for (let index = 1; index < sorted.length; index++) {
    const current = sorted[index];
    const last = merged[merged.length - 1];
    // `+ 1` склеивает и соприкасающиеся диапазоны, чтобы между словами
    // не оставалась незакрашенная полоска пробела.
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
      if (CATEGORY_PRIORITY[current.category] < CATEGORY_PRIORITY[last.category]) {
        last.category = current.category;
      }
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

/** Собирает все совпадения правил по строке и объединяет пересечения. */
export function findSpans(text: string): Span[] {
  const spans: Span[] = [];
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const whole = match.index ?? 0;
      // Смещение внутри совпадения до самих данных (для «БИК: 044525225»).
      const target = rule.group === undefined ? match[0] : match[rule.group];
      if (!target) continue;
      const offset = rule.group === undefined ? 0 : match[0].indexOf(target);
      if (offset < 0) continue;
      spans.push({ start: whole + offset, end: whole + offset + target.length, category: rule.category });
    }
  }
  return mergeSpans(spans);
}


/** Минимальный вид текстового элемента pdf.js, который нужен для расчёта. */
interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

/**
 * Превращает текстовые элементы страницы в области для закрашивания.
 *
 * Вынесено отдельно от `readLocalDocument`, потому что используется дважды:
 * при первом открытии файла и при повторном поиске по кнопке. Раньше кнопка
 * не пересчитывала ничего, а лишь показывала результат, полученный ранее.
 */
function scanTextItems(
  items: readonly unknown[],
  styles: Record<string, { fontFamily?: string } | undefined>,
  viewport: { width: number; height: number; transform: number[] },
  pageIndex: number,
  measure: CanvasRenderingContext2D,
): Redaction[] {
  const out: Redaction[] = [];
  for (const raw of items) {
    const item = raw as TextItemLike;
    if (!item || typeof item.str !== 'string' || !item.str.trim()) continue;
    const transform = Util.transform(viewport.transform, item.transform);
    const textHeight = Math.max(7, Math.hypot(transform[2], transform[3]));
    measure.font = `${textHeight}px ${styles[item.fontName]?.fontFamily ?? 'sans-serif'}`;
    const measuredWidth = measure.measureText(item.str).width || 1;
    const ratio = item.width / measuredWidth;
    const angle = Math.atan2(transform[1], transform[0]);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    // Все совпадения собираются и объединяются: частичное перекрытие невозможно.
    for (const span of findSpans(item.str)) {
      const prefix = measure.measureText(item.str.slice(0, span.start)).width * ratio;
      const length = measure.measureText(item.str.slice(span.start, span.end)).width * ratio;
      // Учитываем пропорциональные глифы и повёрнутый текст, а не считаем символы.
      const corners = [[prefix, -textHeight], [prefix + length, -textHeight], [prefix, 3], [prefix + length, 3]]
        .map(([dx, dy]) => ({ x: transform[4] + cosine * dx - sine * dy, y: transform[5] + sine * dx + cosine * dy }));
      const x = Math.max(0, Math.min(viewport.width, Math.min(...corners.map((p) => p.x)) - 3));
      const y = Math.max(0, Math.min(viewport.height, Math.min(...corners.map((p) => p.y)) - 3));
      const right = Math.min(viewport.width, Math.max(...corners.map((p) => p.x)) + 3);
      const bottom = Math.min(viewport.height, Math.max(...corners.map((p) => p.y)) + 3);
      if (right <= x || bottom <= y) continue;
      out.push({
        id: uid(), page: pageIndex, x: x / viewport.width, y: y / viewport.height,
        width: (right - x) / viewport.width, height: (bottom - y) / viewport.height,
        category: span.category, label: item.str.slice(span.start, span.end), selected: true,
      });
    }
  }
  return out;
}

/**
 * Повторный поиск по уже открытому документу.
 *
 * Перечитывает текст из сохранённого исходника (`original`), поэтому кнопка
 * «Найти чувствительные данные» действительно пересчитывает результат.
 * Страницы НЕ рендерятся заново — нужен только текст и геометрия, это быстро.
 */
export async function rescanDocument(doc: LocalDocument): Promise<Redaction[]> {
  if (doc.kind !== 'pdf' || !doc.original) return [];
  const task = getDocument({ data: new Uint8Array(doc.original.slice(0)), useWasm: false });
    const pdf = await task.promise;
  const measure = document.createElement('canvas').getContext('2d')!;
  const out: Redaction[] = [];
  try {
    for (let index = 0; index < pdf.numPages; index++) {
      const page = await pdf.getPage(index + 1);
      const content = await page.getTextContent();
      out.push(...scanTextItems(content.items, content.styles as never, page.getViewport({ scale: 1 }), index, measure));
    }
  } finally {
    await task.destroy();
  }
  return out;
}

/**
 * Лимиты, защищающие вкладку от переполнения памяти.
 *
 * Каждая страница рендерится в canvas до 1800×2400 и хранится в состоянии
 * как base64-PNG (это примерно в 1,4 раза тяжелее бинарного PNG). Без
 * ограничений документ на 200 страниц съедает сотни мегабайт и вкладка
 * падает без предупреждения — причём на файлах, которые человек как раз
 * собирался обезличить. Поэтому проверяем ДО чтения.
 */
export const MAX_FILE_BYTES = 120 * 1024 * 1024;
export const MAX_PAGES = 150;
export const MAX_PIXELS_PER_PAGE = 6_000_000;

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)} МБ`;
}

export async function readLocalDocument(file: File, onProgress?: (value: string) => void): Promise<LocalDocument> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`Файл ${formatMb(file.size)} слишком большой. Ограничение — ${formatMb(MAX_FILE_BYTES)}: документы большего размера перегружают память браузера.`);
  }
  const original = await file.arrayBuffer();
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const task = getDocument({
      data: new Uint8Array(original.slice(0)), useSystemFonts: true,
      useWasm: false,
    });
    const pdf = await task.promise;
    if (pdf.numPages > MAX_PAGES) {
      await task.destroy();
      throw new Error(`В документе ${pdf.numPages} страниц, а ограничение — ${MAX_PAGES}. Разбейте файл на части или оставьте нужные страницы.`);
    }
    const pages: LocalPage[] = [];
    const redactions: Redaction[] = [];
    try {
      for (let index = 0; index < pdf.numPages; index++) {
        onProgress?.(`Читаем страницу ${index + 1} из ${pdf.numPages}`);
        const page = await pdf.getPage(index + 1);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, 1800 / baseViewport.width, 2400 / baseViewport.height);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        // В pdf.js v6 render() возвращает RenderTask, а не промис, поэтому ждать
// нужно именно .promise — await на самом объекте не сработает.
await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
        pages.push({
          image: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height,
          pdfWidth: baseViewport.width, pdfHeight: baseViewport.height,
        });
        const content = await page.getTextContent();
        const measure = document.createElement('canvas').getContext('2d')!;
        redactions.push(...scanTextItems(content.items, content.styles as never, baseViewport, index, measure));
      }
    } finally {
      await task.destroy();
    }
    return { name: file.name, size: file.size, kind: 'pdf', pages, redactions, original };
  }
  if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name)) {
    throw new Error('Откройте PDF или изображение: PNG, JPEG, WebP, GIF, BMP, AVIF.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    return {
      name: file.name, size: file.size, kind: 'image', original, redactions: [],
      pages: [{ image: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height,
        pdfWidth: image.naturalWidth * 0.75, pdfHeight: image.naturalHeight * 0.75 }],
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function paintRedactions(page: LocalPage, redactions: Redaction[], color: string) {
  const image = await loadImage(page.image);
  const canvas = document.createElement('canvas');
  canvas.width = page.width;
  canvas.height = page.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  for (const area of redactions.filter((item) => item.selected)) {
    const left = Math.floor(area.x * canvas.width);
    const top = Math.floor(area.y * canvas.height);
    context.fillRect(left, top, Math.ceil(area.width * canvas.width) + 1, Math.ceil(area.height * canvas.height) + 1);
  }
  return canvas;
}

export async function exportRedactedDocument(doc: LocalDocument, areas: Redaction[], color: string, format: 'pdf' | 'png', removeMetadata: boolean) {
  if (format === 'png') {
    const canvas = await paintRedactions(doc.pages[0], areas.filter((area) => area.page === 0), color);
    return canvasBlob(canvas);
  }
  // Rebuild from pixels, rather than placing removable rectangles over sensitive text.
  const pdf = await PDFDocument.create();
  for (let index = 0; index < doc.pages.length; index++) {
    const page = doc.pages[index];
    const canvas = await paintRedactions(page, areas.filter((area) => area.page === index), color);
    const image = await pdf.embedPng(await (await canvasBlob(canvas)).arrayBuffer());
    const output = pdf.addPage([page.pdfWidth, page.pdfHeight]);
    output.drawImage(image, { x: 0, y: 0, width: page.pdfWidth, height: page.pdfHeight });
  }
  pdf.setProducer('offgrid - local processing');
  pdf.setCreator('offgrid');
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  if (!removeMetadata) {
    if (doc.kind === 'pdf' && doc.original) {
      const original = await PDFDocument.load(doc.original, { updateMetadata: false });
      pdf.setTitle(original.getTitle() ?? doc.name);
      pdf.setAuthor(original.getAuthor() ?? '');
      pdf.setSubject(original.getSubject() ?? '');
      pdf.setKeywords((original.getKeywords() ?? '').split(',').filter(Boolean));
    } else {
      pdf.setTitle(doc.name);
    }
  }
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

export function parsePageRange(value: string, count: number): number[] {
  const pages: number[] = [];
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Укажите страницы в формате 1-3, 5, 7-9.');
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end > count || start > end) throw new Error(`В документе ${count} стр. Проверьте диапазон.`);
    for (let page = start; page <= end; page++) {
      if (!pages.includes(page - 1)) pages.push(page - 1);
    }
  }
  if (!pages.length) throw new Error('Выберите хотя бы одну страницу.');
  return pages;
}

export function encodeWav(buffer: AudioBuffer, start: number, end: number, gain: number, mono: boolean): Blob {
  const firstFrame = Math.floor(start * buffer.sampleRate);
  const frameCount = Math.max(1, Math.min(buffer.length, Math.floor(end * buffer.sampleRate)) - firstFrame);
  const channels = mono ? 1 : buffer.numberOfChannels;
  const dataLength = frameCount * channels * 2;
  const bytes = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bytes);
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);
  const source = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  let offset = 44;
  for (let frame = 0; frame < frameCount; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const value = mono
        ? source.reduce((total, data) => total + data[firstFrame + frame], 0) / source.length
        : source[channel][firstFrame + frame];
      const sample = Math.max(-1, Math.min(1, value * gain));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([bytes], { type: 'audio/wav' });
}