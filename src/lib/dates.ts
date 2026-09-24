// Даты «Месяц Год» → ISO. Вынесено из app/sitemap, чтобы клиентские
// компоненты (TemplateSelector) не тянули весь граф sitemap в бандл.

const MONTHS: Record<string, number> = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
  январь: 1, февраль: 2, март: 3, апрель: 4, май: 5, июнь: 6,
  июль: 7, август: 8, сентябрь: 9, октябрь: 10, ноябрь: 11, декабрь: 12,
};

export function parseLastUpdated(s: string): string | undefined {
  if (!s) return undefined;
  // ISO-даты блога (2026-09-22).
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = s.match(/([А-Яа-яё]+)\s+(\d{4})/);
  if (!m) return undefined;
  const month = MONTHS[m[1].toLowerCase()];
  if (!month) return undefined;
  return `${m[2]}-${String(month).padStart(2, "0")}-01`;
}
