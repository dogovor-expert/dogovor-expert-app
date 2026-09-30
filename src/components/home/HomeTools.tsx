import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calculator,
  Eraser,
  FileStack,
  Fingerprint,
  GitCompare,
  ScanText,
  Signature,
  type LucideIcon,
} from "lucide-react";

interface ToolEntry {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  badge?: string;
  accent: string;
}

const TOOLS: ToolEntry[] = [
  {
    icon: FileStack,
    title: "Конструктор документов",
    desc: "570+ шаблонов, подпись УКЭП через КриптоПро, экспорт в PDF и Word. Заполняете поля — получаете готовый документ.",
    href: "/builder",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    icon: Bot,
    title: "AI-юрист",
    desc: "Отвечает по текстам действующих законов с цитатами статей, разбирает вашу ситуацию и готовит документ в один клик.",
    href: "/ai-yurist",
    badge: "NEW",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Signature,
    title: "Конструктор резюме",
    desc: "Резюме из вашего опыта: 10 профессиональных макетов, проверка ATS и выгрузка в DOCX и PDF.",
    href: "/resume",
    accent: "from-sky-500 to-cyan-600",
  },
  {
    icon: Calculator,
    title: "23 правовых калькулятора",
    desc: "Госпошлины, пени по ст. 395 ГК, НДС, отпускные, алименты, ОСАГО и КБМ — с актуальными ставками.",
    href: "/utils",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: ScanText,
    title: "Конвертер и OCR",
    desc: "15 инструментов: DOCX ↔ PDF, объединение и разделение PDF, изображения в PDF, распознавание текста со сканов.",
    href: "/converter",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: Eraser,
    title: "Обезличиватель",
    desc: "Находит и закрывает ФИО, паспорт, ИНН, СНИЛС, БИК и расчётные счета в PDF и картинках. Файлы не покидают браузер.",
    href: "/redactor",
    badge: "NEW",
    accent: "from-rose-500 to-pink-600",
  },
  {
    icon: Fingerprint,
    title: "Контроль оферт",
    desc: "Фиксирует версию документа по SHA-256 и показывает, что именно изменилось между двумя редакциями.",
    href: "/notary",
    badge: "NEW",
    accent: "from-amber-600 to-yellow-700",
  },
  {
    icon: GitCompare,
    title: "Сравнение договоров",
    desc: "Находит различающиеся условия и риски в двух версиях или в вашем договоре и типовом шаблоне.",
    href: "/sravnenie-dogovorov",
    accent: "from-blue-500 to-indigo-600",
  },
];

/**
 * Каталог инструментов — точки входа со главной.
 *
 * Каждая карточка ведёт на рабочий раздел с собственным описанием: с главной
 * теперь можно перейти в любой инструмент в один клик, не пользуясь меню.
 */
export default function HomeTools() {
  return (
    <section id="tools" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Инструменты</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Начните с нужного инструмента
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Восемь рабочих разделов: от подготовки документа до проверки чужой версии договора.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group no-underline relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 hover:no-underline"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${t.accent} opacity-0 blur-3xl transition duration-500 group-hover:opacity-10`}
                aria-hidden="true"
              />
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.accent} shadow-lg`}
              >
                <t.icon className="h-6 w-6 text-white" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                  {t.badge && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  Открыть
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}