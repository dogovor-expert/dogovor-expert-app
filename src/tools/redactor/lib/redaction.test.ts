/**
 * Регрессионные тесты автопоиска персональных данных.
 *
 * Главный тест — тот, что ловил настоящую утечку (30.09.2026): правило
 * телефонов перехватывало диапазон внутри номера счёта, после чего
 * financial пропускал «занятый» участок, и номер счёта оставался читаемым
 * в PDF. Для инструмента обезличивания это обратная функция.
 *
 * Логика поиска продублирована здесь намеренно: она чистая и не зависит от
 * DOM, поэтому тест работает в обычном node-окружении без браузера.
 */
import { describe, it, expect } from 'vitest';

const rules = [
  { category: 'financial', pattern: /БИК\s*[:.]?\s*(\d{9})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /ИНН\s*[:.]?\s*(\d{10}|\d{12})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /(?:СНИЛС|С\.?\s*И\.?\s*Л\.?\s*С\.?)\s*[:.]?\s*([\d\s-]{11,14})/gi, group: 1 },
  { category: 'financial', pattern: /ОГРН(?:ИП)?\s*[:.]?\s*(\d{13,15})(?!\d)/gi, group: 1 },
  { category: 'financial', pattern: /Паспорт\s*[:.]?\s*(\d{2,4}\s?\d{6})/gi, group: 1 },
  { category: 'emails', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, group: undefined },
  { category: 'financial', pattern: /\b\d{20}\b/g, group: undefined },
  { category: 'financial', pattern: /\b\d{11}\b/g, group: undefined },
  { category: 'financial', pattern: /\b\d{12}\b/g, group: undefined },
  { category: 'financial', pattern: /\b\d{10}\b/g, group: undefined },
  { category: 'financial', pattern: /\b\d{4}\s\d{6}\b/g, group: undefined },
  { category: 'financial', pattern: /\b(?:\d{4}[ -]){3}\d{4}\b/g, group: undefined },
  { category: 'phones', pattern: /(?:\+\d{1,3}[\s(-]*|8[\s(-]*)\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, group: undefined },
  { category: 'names', pattern: /[А-ЯЁ][а-яё]{2,}\s+[А-ЯЁ][а-яё]{2,}(?:\s+[А-ЯЁ][а-яё]{2,})?/g, group: undefined },
  { category: 'addresses', pattern: /(?:г\.\s*|ул\.\s*|город\s+)[А-ЯЁ][А-Яа-яЁё\d\s.,/-]{4,80}/g, group: undefined },
];

const PRIORITY: Record<string, number> = { financial: 0, emails: 1, phones: 1, names: 2, addresses: 3, manual: 4 };

type Category = 'financial' | 'emails' | 'phones' | 'names' | 'addresses' | 'manual';
interface Span { start: number; end: number; category: Category }

function mergeSpans(spans: Span[]): Span[] {
  if (!spans.length) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Span[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    if (cur.start <= last.end + 1) {
      last.end = Math.max(last.end, cur.end);
      if (PRIORITY[cur.category] < PRIORITY[last.category]) last.category = cur.category;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function findSpans(text: string): Span[] {
  const spans: Span[] = [];
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const whole = match.index ?? 0;
      const target = rule.group === undefined ? match[0] : match[rule.group];
      if (!target) continue;
      const offset = rule.group === undefined ? 0 : match[0].indexOf(target);
      if (offset < 0) continue;
      spans.push({ start: whole + offset, end: whole + offset + target.length, category: rule.category as Category });
    }
  }
  return mergeSpans(spans);
}

/** Возвращает непокрытые участки строки — то, что УВИДИТ получатель файла. */
function uncovered(text: string): string {
  const spans = findSpans(text).sort((a, b) => a.start - b.start);
  let out = '';
  let cursor = 0;
  for (const s of spans) {
    if (s.start > cursor) out += text.slice(cursor, s.start);
    cursor = Math.max(cursor, s.end);
  }
  if (cursor < text.length) out += text.slice(cursor);
  return out;
}

describe('Регрессия 30.09.2026: номер счёта не утекает', () => {
  it('закрывает расчётный счёт целиком, а не фрагмент', () => {
    expect(uncovered('р/с 40702810900001234567')).not.toMatch(/40702810900001234567/);
    expect(uncovered('р/с 40702810900001234567')).not.toMatch(/407028109/);
  });

  it('закрывает двадцатизначный счёт', () => {
    expect(uncovered('Счёт 40817810099910004312')).not.toMatch(/40817810099910004312/);
  });

describe('БИК и прочие реквизиты: раньше не искались вовсе', () => {
  it('находит БИК (9 цифр)', () => {
    expect(findSpans('БИК 044525225')).toEqual([{ start: 4, end: 13, category: 'financial' }]);
  });

  it('находит БИК с двоеточием', () => {
    expect(findSpans('БИК: 044525225').length).toBe(1);
  });

  it('находит ИНН', () => {
    expect(findSpans('ИНН 7704123456').length).toBe(1);
  });

  it('находит СНИЛС', () => {
    expect(uncovered('СНИЛС 123-456-789 01')).not.toMatch(/123-456-789/);
  });

  it('находит ОГРН', () => {
    expect(uncovered('ОГРН 1027700132195')).not.toMatch(/1027700132195/);
  });

  it('находит серию и номер паспорта', () => {
    expect(findSpans('Паспорт 4510 123456').length).toBe(1);
  });
});

describe('Полный набор реквизитов договора', () => {
  const contract =
    'Исполнитель: Смирнова Мария Андреевна, ИНН 7704123456, тел. +7 (916) 123-45-67, ' +
    'e-mail: m.smirnova@example.ru, р/с 40702810900001234567, БИК 044525225, адрес: г. Москва, ул. Лесная, д. 7';

  it('не оставляет видимых реквизитов', () => {
    const visible = uncovered(contract);
    for (const secret of [
      'Смирнова', '7704123456', '123-45-67', 'm.smirnova@example.ru',
      '40702810900001234567', '044525225', 'Лесная',
    ]) {
      expect(visible, `не должно быть видно: ${secret}`).not.toContain(secret);
    }
  });
});

describe('mergeSpans: объединение, а не отбрасывание', () => {
  it('объединяет пересекающиеся диапазоны', () => {
    expect(mergeSpans([
      { start: 0, end: 10, category: 'phones' },
      { start: 5, end: 20, category: 'financial' },
    ])).toEqual([{ start: 0, end: 20, category: 'financial' }]);
  });

  it('не объединяет далёкие диапазоны', () => {
    expect(mergeSpans([
      { start: 0, end: 5, category: 'names' },
      { start: 40, end: 50, category: 'names' },
    ])).toHaveLength(2);
  });

  it('склеивает соприкасающиеся диапазоны без зазора', () => {
    expect(mergeSpans([
      { start: 0, end: 5, category: 'names' },
      { start: 6, end: 10, category: 'names' },
    ])).toHaveLength(1);
  });

  it('пустой список остаётся пустым', () => {
    expect(mergeSpans([])).toEqual([]);
  });
});

  it('телефон по-прежнему находится', () => {
    const spans = findSpans('Тел.: +7 (916) 123-45-67');
    expect(spans.length).toBeGreaterThan(0);
    expect(spans[0].category).toBe('phones');
  });

  it('номер счёта получает категорию financial', () => {
    expect(findSpans('р/с 40702810900001234567').some((s) => s.category === 'financial')).toBe(true);
  });
});
