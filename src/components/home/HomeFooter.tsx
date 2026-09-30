import Link from "next/link";
import Logo from "@/components/layout/Logo";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Документы",
    links: [
      { label: "Каталог шаблонов", href: "/templates" },
      { label: "Заявления", href: "/zayavleniya" },
      { label: "Бланки", href: "/blanks" },
      { label: "Конструктор", href: "/builder" },
    ],
  },
  {
    title: "Инструменты",
    links: [
      { label: "AI-юрист", href: "/ai-yurist" },
      { label: "Калькуляторы", href: "/utils" },
      { label: "Конвертер PDF", href: "/converter" },
      { label: "Сравнение договоров", href: "/sravnenie-dogovorov" },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "О сервисе", href: "/about" },
      { label: "Тарифы", href: "/billing" },
      { label: "Блог", href: "/blog" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  {
    title: "Правовая информация",
    links: [
      { label: "Пользовательское соглашение", href: "/terms" },
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "Помощь", href: "/help" },
    ],
  },
];

/** Футер главной — колонки ссылок + юридическая строка. */
export default function HomeFooter() {
  return (
    <footer className="bg-slate-950 pt-16 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="min-w-0">
            <Logo dark tagline={false} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Онлайн-конструктор юридических документов: договоры, иски, заявления и калькуляторы для дома и бизнеса.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-0">
              <h3 className="text-sm font-bold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                      <Link href={link.href} className="break-words text-sm text-slate-400 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-slate-500">
          <span>© 2026 «Dogovor.expert». Не является юридической консультацией.</span>
          <span className="inline-flex items-center gap-1.5">
            152-ФЗ · данные защищены
          </span>
        </div>
      </div>
    </footer>
  );
}
