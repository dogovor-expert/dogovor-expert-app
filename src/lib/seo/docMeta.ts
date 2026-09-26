/**
 * Заголовки и описания для страниц документов/бланков.
 *
 * Зачем: в метаданных важное (год, «образец», форматы) должно стоять В НАЧАЛЕ
 * строки и не теряться при обрезке до лимита выдачи. До 2026-09 год и форматы
 * дописывались в конец описания и у длинных шаблонов отрезались целиком;
 * заголовок обрезался с «…», съедая ключевые слова (данные GSC: коммерческие
 * запросы на 1-й странице без кликов).
 */

export const SEO_YEAR = new Date().getFullYear();

const TITLE_MAX = 60;
const DESC_MAX = 160;

/** Обрезка по границе слова без «…» (Google сам добавляет троеточие). */
export function truncateWord(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const sp = cut.lastIndexOf(" ");
  const out = sp > max * 0.5 ? cut.slice(0, sp) : t.slice(0, max);
  return out.replace(/[\s,;:.!?–—-]+$/, "");
}

/**
 * Итоговый <title> с брендом, гарантированно ≤ max (по умолчанию 60).
 *
 * Зачем: в корневом layout задан `title.template = "%s | Dogovor.expert"`, но он
 * применяется не ко всем сегментам маршрута (под layout'ом с собственным title —
 * documents/, utils/ — суффикс не добавляется). Чтобы длина была предсказуемой,
 * собираем title сами и отдаём его как `absolute`: суффикс добавляется, только
 * если помещается; иначе заголовок обрезается по словам без бренда.
 */
export function composeTitle(raw: string, brand = "Dogovor.expert", max = 60): string {
  const t = raw.replace(/\s+/g, " ").trim();
  const suffix = ` | ${brand}`;
  if (t.length + suffix.length <= max) return `${t}${suffix}`;
  return truncateWord(t, max);
}

/** Убирает хвостовые скобки-уточнения: «Договор … (без экипажа)» → «Договор …». */
export function stripParenthetical(name: string): string {
  const cleaned = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return cleaned.length >= 18 ? cleaned : name.trim();
}

/**
 * Заголовок страницы документа. Приоритет: имя → год → «образец» → действие.
 * Длинное имя сначала «худеет» (снимаем скобки), затем — обрезка по словам.
 */
export function docTitle(name: string): string {
  const variants = [
    `${name}, образец ${SEO_YEAR} — скачать Word/PDF`,
    `${name}, образец ${SEO_YEAR} — скачать`,
    `${name}, образец ${SEO_YEAR}`,
  ];
  for (const v of variants) if (v.length <= TITLE_MAX) return v;
  // Имя не влезает: ужимаем ИМЯ, а не год (год обязан остаться в заголовке).
  const suffix = `, образец ${SEO_YEAR}`;
  const budget = Math.max(16, TITLE_MAX - suffix.length);
  const short = stripParenthetical(name);
  const nm = short.length <= budget ? short : truncateWord(short, budget);
  return `${nm}${suffix}`;
}

/**
 * Описание страницы документа: год и форматы впереди (переживут обрезку),
 * далее суть документа и призыв.
 */
export function docDesc(description: string): string {
  const base = `Образец ${SEO_YEAR} года (Word и PDF). ${description} Заполните онлайн за 5 минут — бесплатно, без регистрации.`;
  return truncateWord(base, DESC_MAX);
}

/** Заголовок страницы пустого бланка. */
export function blankTitle(name: string): string {
  const prefix = `Скачать бланк ${SEO_YEAR}: `;
  const suffix = ` — PDF и Word`;
  const budget = Math.max(12, TITLE_MAX - prefix.length - suffix.length);
  const nm = name.length <= budget ? name : truncateWord(stripParenthetical(name), budget);
  return `${prefix}${nm}${suffix}`;
}

/** Описание страницы пустого бланка. */
export function blankDesc(name: string): string {
  const base = `Пустой бланк ${SEO_YEAR} года для ручного заполнения. Скачайте «${name}» бесплатно в PDF и Word, без регистрации.`;
  return truncateWord(base, DESC_MAX);
}