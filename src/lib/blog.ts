import type { BlogPost } from "@/data/blog/posts";

export const CATEGORY_LABELS: Record<string, string> = {
  аренда: "Аренда жилья",
  авто: "Автомобили",
  бизнес: "Бизнес и ГПХ",
  финансы: "Долги и расписки",
  право: "Право",
};

export const CATEGORY_ORDER: string[] = ["аренда", "авто", "бизнес", "финансы", "право"];

const SHORT_MONTHS = [
  "янв", "фев", "мар", "апр", "мая", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

const LONG_MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** «20 авг 2026» */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const idx = Number(m) - 1;
  return `${Number(d)} ${SHORT_MONTHS[idx] ?? m} ${y}`;
}

/** «20 августа 2026» */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const idx = Number(m) - 1;
  return `${Number(d)} ${LONG_MONTHS[idx] ?? m} ${y}`;
}

export function postWordCount(post: BlogPost): number {
  let n = post.title.split(/\s+/).length + post.description.split(/\s+/).length;
  for (const s of post.sections) {
    n += s.h.split(/\s+/).length;
    for (const p of s.p) n += p.split(/\s+/).length;
  }
  for (const f of post.faq) n += f.q.split(/\s+/).length + f.a.split(/\s+/).length;
  return n;
}

export function postReadMinutes(post: BlogPost): number {
  return Math.max(3, Math.round(postWordCount(post) / 130));
}