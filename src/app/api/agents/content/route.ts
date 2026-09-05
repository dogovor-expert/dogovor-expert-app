import { LEGAL_TEMPLATES } from "@/data/templates";
import { BLOG_POSTS } from "@/data/blog/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  AUTO: "Авто",
  FINANCE: "Финансы",
  REALTY: "Недвижимость",
  BUSINESS: "Бизнес",
  RENTALS: "Аренда",
  SALES: "Продажи",
  CONTRACTS: "Договоры",
  HR: "Кадры",
  CLAIMS: "Претензии",
  FINANCE_ACTS: "Акты",
  CORPORATE_WEB: "Корпоративные",
  FAMILY: "Семья",
  OTHER: "Прочее",
  MIGRATION: "Миграция",
  LEGAL: "Право",
  POSTAL: "Почта",
};

function formatTemplates(): string {
  const byCategory = new Map<string, typeof LEGAL_TEMPLATES>();
  for (const t of LEGAL_TEMPLATES) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t);
    byCategory.set(t.category, arr);
  }

  const sections: string[] = [];
  for (const [cat, items] of byCategory) {
    const label = CATEGORY_LABELS[cat] ?? cat;
    sections.push(`\n## ${label} (${items.length})\n`);
    for (const t of items) {
      sections.push(`- [${t.name}](${SITE_URL}/documents/${t.id}) — ${t.description}`);
    }
  }
  return sections.join("\n");
}

function formatBlog(): string {
  return BLOG_POSTS.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}) — ${p.description}`)
    .join("\n");
}

export function GET(): Response {
  const templatesCount = LEGAL_TEMPLATES.length;
  const blogCount = BLOG_POSTS.length;

  const body = `# Dogovor.expert — Каталог дмов и юридических статей

> Источник: ${SITE_URL}
> API: ${SITE_URL}/api/agents/content
> Шаблонов: ${templatesCount}. Статей в блоге: ${blogCount}.
> Обновлено: ${new Date().toISOString()}

## О проекте

Dogovor.expert — онлайн-конструктор документов для физических лиц, ИП и ООО.
Заполнение онлайн за 5 минут, скачивание PDF/DOCX, без регистрации.

- Главная: ${SITE_URL}/
- Каталог шаблонов: ${SITE_URL}/templates
- Бланки для печати: ${SITE_URL}/blanks
- Конструктор: ${SITE_URL}/builder
- Блог: ${SITE_URL}/blog

## Каталог шаблонов

${formatTemplates()}

## Блог (юридические статьи)

${formatBlog()}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Vary": "Accept",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}