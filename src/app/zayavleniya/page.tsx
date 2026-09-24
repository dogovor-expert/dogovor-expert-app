import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Flame,
  Gavel,
  Briefcase,
  Home,
  Siren,
  Megaphone,
  Medal,
  Landmark,
  Search,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate, StatementGroup } from "@/data/types";
import { TEMPLATE_META } from "@/data/templatesMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = withSeo({
  path: "/zayavleniya",
  title: "Заявления — образцы и бланки 2026: ФССП, суды, работа, ЖКХ",
  description:
    "120+ заявлений с образцами заполнения и пустыми бланками: приставам, в суды, работодателю, ЖКХ, полицию. Заполнение онлайн за 5 минут, PDF и Word бесплатно.",
  keywords: [
    "заявления образцы",
    "бланки заявлений скачать",
    "заявление приставам образец",
    "жалоба в прокуратуру образец",
    "заявление на отпуск образец",
  ],
  robots: { index: true, follow: true },
  openGraph: { url: "/zayavleniya" },
});

const GROUPS: Array<{ id: StatementGroup; label: string; hint: string; icon: typeof FileText; tint: string }> = [
  { id: "fssp", label: "Приставам (ФССП)", hint: "возбуждение ИП, жалобы", icon: Landmark, tint: "bg-sky-50 text-sky-600" },
  { id: "courts", label: "В суды", hint: "иски, ходатайства", icon: Gavel, tint: "bg-violet-50 text-violet-600" },
  { id: "hr", label: "Работодателю", hint: "отпуск, увольнение", icon: Briefcase, tint: "bg-emerald-50 text-emerald-600" },
  { id: "housing", label: "ЖКХ и УК", hint: "перерасчёт, залив", icon: Home, tint: "bg-amber-50 text-amber-600" },
  { id: "police", label: "В полицию", hint: "кража, мошенничество", icon: Siren, tint: "bg-red-50 text-red-600" },
  { id: "oversight", label: "Жалобы в надзоры", hint: "прокуратура, РПН", icon: Megaphone, tint: "bg-indigo-50 text-indigo-600" },
  { id: "military", label: "Военкомат", hint: "отсрочка, АГС", icon: Medal, tint: "bg-teal-50 text-teal-600" },
  { id: "official-forms", label: "Госорганы (формы)", hint: "ЗАГС, МВД, ФНС", icon: Landmark, tint: "bg-gray-100 text-gray-500" },
];

const HUB_FAQ = [
  {
    q: "Чем заявление отличается от договора?",
    a: "Договор — это сделка между сторонами (продавец/покупатель, права и обязанности). Заявление — одностороннее обращение: шапка «куда/от кого», суть, «прошу», приложения, дата и подпись. Договоры собраны в разделе «Шаблоны», заявления — здесь.",
  },
  {
    q: "Образец, бланк и конструктор — в чём разница?",
    a: "Образец — заполненный пример, по которому видно, как писать. Пустой бланк — форма с линиями для ручного заполнения (раздел «Бланки», таб «Пустые бланки заявлений»). Конструктор — онлайн-заполнение: вводите данные, получаете готовый PDF/DOCX. Все три вида собираются из одного исходника и не расходятся.",
  },
  {
    q: "Это бесплатно?",
    a: "Да. Образцы, пустые бланки и онлайн-заполнение заявлений бесплатны, без регистрации. Файлы — в форматах PDF и Word.",
  },
];

function statements(): LegalTemplate[] {
  return LEGAL_TEMPLATES.filter((t) => t.kind === "statement");
}

export default function StatementsHubPage() {
  const stmts = statements();
  const byId = new Map(stmts.map((s) => [s.id, s]));
  const metaById = new Map(TEMPLATE_META.map((m) => [m.id, m]));
  const groupOf = (t: LegalTemplate) => t.statementGroup ?? "official-forms";

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Заявления — образцы и бланки",
            description:
              "Заявления в госорганы, суды, работодателю и ЖКХ: образцы заполнения, пустые бланки, онлайн-заполнение за 5 минут.",
            url: `${SITE_URL}/zayavleniya`,
            inLanguage: "ru",
            isPartOf: { "@type": "WebSite", name: "Dogovor.expert", url: SITE_URL },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: stmts.length,
              itemListElement: stmts.slice(0, 20).map((t, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/documents/${t.id}`,
                name: t.name,
              })),
            },
          },
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Заявления", path: "/zayavleniya" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: HUB_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
        <Link href="/" className="hover:text-brand-600">Главная</Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-600">Заявления</span>
      </nav>

      <section className="py-2 text-center">
        <h1 className="text-display-lg font-bold text-gray-900">
          Заявления — образцы и бланки 2026
        </h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-gray-600">
          Заявления в госорганы, суды, работодателю и в ЖКХ. Каждое — с образцом
          заполнения, пустым бланком и онлайн-заполнением за 5 минут. Отдельно
          от договоров: здесь обращения, а не сделки.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/blanks?kind=statement"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <FileText className="h-4 w-4" />
            Пустые бланки заявлений
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Договоры — в шаблонах
          </Link>
        </div>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: String(stmts.length), label: "заявлений" },
            { value: "PDF · Word", label: "2 формата" },
            { value: "0 ₽", label: "бесплатно" },
            { value: "~5 мин", label: "заполнить онлайн" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white px-3 py-4">
              <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Группы заявлений" className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Группы заявлений</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GROUPS.map((g) => {
            const count = stmts.filter((t) => groupOf(t) === g.id).length;
            return (
              <a
                key={g.id}
                href={`#group-${g.id}`}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${g.tint}`}>
                  <g.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold leading-snug text-gray-900">{g.label}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {g.hint} · {count}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Flame className="h-5 w-5 text-amber-600" />
          Выбирают чаще всего
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {stmts.slice(0, 4).map((t) => (
            <Link
              key={t.id}
              href={`/documents/${t.id}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-gray-900">{t.name}</span>
                <span className="text-xs text-gray-500">
                  ~{Math.max(3, Math.round(((metaById.get(t.id)?.fieldCount ?? 60) / 12)))} мин · бесплатно
                </span>
              </span>
              <span className="ml-auto flex-shrink-0 text-xs font-bold text-brand-600">Открыть →</span>
            </Link>
          ))}
        </div>
      </section>

      {GROUPS.map((g) => {
        const list = stmts.filter((t) => groupOf(t) === g.id);
        if (list.length === 0) return null;
        return (
          <section key={g.id} id={`group-${g.id}`} className="scroll-mt-24 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <g.icon className="h-5 w-5 text-brand-600" />
              {g.label}
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-600">
                {list.length}
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <Link
                    href={`/documents/${t.id}`}
                    className="text-sm font-semibold leading-snug text-gray-900 hover:text-brand-600"
                  >
                    {t.name}
                  </Link>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {t.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <Link
                      href={`/documents/${t.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Образец
                    </Link>
                    <Link
                      href={`/builder?template=${t.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Заполнить
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Не нашли нужное заявление?</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center sm:p-6">
          <MessageCircle className="mx-auto text-brand-500" size={32} />
          <p className="mx-auto mb-3.5 mt-2 max-w-md text-[13px] text-gray-500">
            Опишите ситуацию своими словами — AI-юрист подберёт заявление или составим индивидуально
          </p>
          <Link
            href="/ai-yurist"
            className="inline-flex min-h-[44px] items-center rounded-[10px] bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700"
          >
            Спросить AI-юриста — бесплатно
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-2.5">
          {HUB_FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-gray-200 bg-white px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex list-none cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-gray-800">
                {f.q}
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-600 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-gray-400">
        Ищете договор, а не заявление? <Link href="/templates" className="text-brand-600 underline underline-offset-2">Каталог шаблонов договоров</Link>
      </p>
      <p className="hidden">{byId.size} заявлений в индексе</p>
    </div>
  );
}
