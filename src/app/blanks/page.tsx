import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Download,
  FileText,
  Home,
  Layers,
  PenLine,
  Sparkles,
  Stamp,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import BlanksBrowser, { type BlankCategory, type BlankItem } from "@/components/blank/BlanksBrowser";
import { withSeo } from "@/lib/seo/withSeo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export const metadata: Metadata = withSeo({
  path: "/blanks",
  title: "Скачать пустые бланки договоров и заявлений — PDF и Word",
  description:
    "Бесплатные пустые бланки договоров и заявлений для ручного заполнения: ДКП авто, аренда, расписка, заявления в ФССП, суд, работодателю. 370+ шаблонов, PDF и Word, без регистрации.",
  keywords: [
    "скачать бланк договора",
    "пустой бланк договора",
    "бланк договора аренды скачать",
    "бланк договора купли продажи",
    "пустые бланки документов",
    "пустые бланки заявлений",
    "бланк заявления скачать",
    "образец бланка",
  ],
  robots: { index: true, follow: true },
  openGraph: { url: "/blanks" },
});

const CATEGORY_ORDER = [
  "realty",
  "business",
  "auto",
  "finance",
  "family",
  "legal",
  "migration",
  "postal",
  "other",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  realty: "Недвижимость",
  business: "Бизнес и ИП",
  auto: "Авто",
  finance: "Финансы и займы",
  family: "Семейные",
  legal: "Судебные",
  migration: "Миграция",
  postal: "Почта России",
  other: "Прочее",
};

const SHEET_ACCENTS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-500",
  "from-sky-500 to-cyan-600",
];

const INDEX_FAQ = [
  {
    q: "Чем пустой бланк отличается от готового документа?",
    a: "Бланк — это форма без заполненного содержания: поля под Вас, данные сторон, подписи. Готовый документ конструктор собирает сам, если внести данные в форме на сайте. Бланк удобен для ручного заполнения, конструктор — если важна скорость. Пустые бланки заявлений собраны отдельным табом «Пустые бланки заявлений».",
  },
  {
    q: "Скачивание бланков действительно бесплатно?",
    a: "Да. Все пустые бланки скачиваются бесплатно, без регистрации и без ограничений в форматах PDF и Word. Нужно заполнить документ онлайн — это тоже бесплатно.",
  },
  {
    q: "В каких форматах скачать бланк?",
    a: "Каждый бланк доступен в двух форматах: PDF — как есть, с деловым оформлением, и Word — если нужно подправить формулировки перед печатью. Файлы готовы к печати на формате А4.",
  },
  {
    q: "Бланк, заполненный от руки, имеет юридическую силу?",
    a: "Да, если соблюдены требования закона: заполнены обязательные реквизиты, есть дата и подписи сторон. Подписать можно от руки, усиленной неквалифицированной подписью или ЭП — в некоторых случаях документ дополнительно заверяют у нотариуса.",
  },
  {
    q: "Пустой бланк — не проще заполнить онлайн?",
    a: "Если документ нужен один раз — бланк удобен. Если таких документов несколько или важна аккуратность — откройте конструктор: он подскажет поля, проверит ИНН и реквизиты и соберёт готовый PDF или Word за несколько минут.",
  },
];

export default async function BlanksIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ kind?: string }>;
}) {
  const kindParam = (await searchParams)?.kind;
  const initialKind: "all" | "contract" | "statement" =
    kindParam === "statement" ? "statement" : kindParam === "contract" ? "contract" : "all";
  const items: BlankItem[] = LEGAL_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    lastUpdated: t.lastUpdated,
    kind: t.kind ?? "contract",
  }));

  const categories: BlankCategory[] = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    count: LEGAL_TEMPLATES.filter((t) => t.category === cat).length,
  })).filter((c) => c.count > 0);

  const visibleIds = [...POPULAR_TEMPLATE_IDS];
  for (const it of items) if (!visibleIds.includes(it.id)) visibleIds.push(it.id);
  const visible20 = visibleIds.slice(0, 20);
  const byId = new Map(items.map((i) => [i.id, i]));
  const popular = POPULAR_TEMPLATE_IDS.map((id) => byId.get(id)).filter(
    (x): x is BlankItem => Boolean(x)
  );

  return (
    <div className="overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Пустые бланки договоров и заявлений",
            description:
              "Бесплатные пустые бланки договоров и заявлений: ДКП авто, аренда, расписка, заявления в ФССП, суд, работодателю. 370+ шаблонов, PDF и Word, без регистрации.",
            url: `${SITE_URL}/blanks`,
            inLanguage: "ru",
            isPartOf: { "@type": "WebSite", name: "Dogovor.expert", url: SITE_URL },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: visible20.map((id, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_URL}/blanks/${id}`,
                name: byId.get(id)?.name ?? id,
              })),
            },
          },
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Бланки", path: "/blanks" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: INDEX_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <section className="relative pt-32 pb-14">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-14rem] h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-100 via-purple-50 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500">
            <Link href="/" className="flex items-center gap-1 transition hover:text-brand-600">
              <Home className="h-3.5 w-3.5" />
              Главная
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-700">Бланки</span>
          </nav>

          <div className="mt-6 grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
                <FileText className="h-4 w-4" />
                {items.length.toLocaleString("ru-RU")} бланков · PDF и Word · бесплатно
              </span>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Скачать пустые бланки
                <span className="text-brand-600"> договоров и заявлений</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                Готовые пустые формы для печати и заполнения: договоры, расписки,
                доверенности, акты и заявления. Два формата — PDF и Word — без
                регистрации.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  <SearchIcon />
                  Найти бланк
                </Link>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Заполнить онлайн
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-gray-100 pt-7">
                <Stat value={items.length.toLocaleString("ru-RU")} label="бланков в каталоге" />
                <Stat value="PDF · Word" label="2 формата" />
                <Stat value="0 ₽" label="без регистрации" />
                <Stat value="~5 мин" label="заполнить онлайн" />
              </div>
            </div>

            <SheetStack />
          </div>

          {popular.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-7">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Самые скачиваемые:
              </span>
              {popular.map((b) => (
                <Link
                  key={b.id}
                  href={`/blanks/${b.id}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div id="catalog" className="scroll-mt-24">
            <BlanksBrowser
              items={items}
              categories={categories}
              popularIds={POPULAR_TEMPLATE_IDS}
              initialKind={initialKind}
            />
          </div>

          <aside className="space-y-6 lg:pt-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-600" />
                <h2 className="text-base font-bold text-gray-900">Как использовать бланк</h2>
              </div>
              <ol className="mt-5 space-y-5">
                <SidebarStep
                  n={1}
                  title="Скачайте файл"
                  text="Выберите формат: PDF для печати или Word для редактирования."
                />
                <SidebarStep
                  n={2}
                  title="Заполните поля"
                  text="Впишите реквизиты сторон, суммы и даты в отведённых графах."
                />
                <SidebarStep
                  n={3}
                  title="Подпишите"
                  text="Распечатайте и подпишите от руки или усиленной ЭП в конструкторе."
                />
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <PenLine className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-bold text-gray-900">
                Не хотите заполнять вручную?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                Откройте тот же документ в конструкторе: пошаговые вопросы,
                автозаполнение полей и готовый PDF за 5 минут.
              </p>
              <Link
                href="/builder"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-800"
              >
                Открыть конструктор
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-800">
                <BadgeCheck className="h-4 w-4" />
                Форматы PDF и Word
              </div>
              <p className="mt-2 text-xs leading-relaxed text-brand-700/80">
                Файлы открываются на любом устройстве: Adobe Acrobat, Word, Google
                Docs, Pages и в онлайн-редакторах. Шрифт — Times New Roman, поля — по
                ГОСТ.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <ComparisonBand />

      <section className="bg-gray-50/60 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Вопросы и ответы
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              О бланках и их использовании
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {INDEX_FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-gray-200 bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900">
                  {f.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand itemsCount={items.length} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-gray-500">{label}</div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SidebarStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-gray-500">{text}</div>
      </div>
    </li>
  );
}

function SheetStack() {
  return (
    <div className="relative hidden h-[26rem] lg:block" aria-hidden="true">
      <div className="absolute inset-x-6 top-10 h-72 rounded-3xl bg-gradient-to-br from-brand-200/70 to-purple-100/40 blur-2xl" />
      <div
        className="absolute left-1/2 top-6 h-72 w-56 rounded-[3px] border border-gray-200 bg-white shadow-2xl shadow-gray-900/15"
        style={{ transform: "translateX(-58%) rotate(-7deg)" }}
      >
        <SheetBody accent={SHEET_ACCENTS[0]} />
      </div>
      <div
        className="absolute left-1/2 top-16 h-72 w-56 rounded-[3px] border border-gray-200 bg-white shadow-2xl shadow-gray-900/15"
        style={{ transform: "translateX(-44%) rotate(5deg)" }}
      >
        <SheetBody accent={SHEET_ACCENTS[2]} />
      </div>
      <div
        className="absolute left-1/2 top-4 flex h-40 w-40 items-center justify-center rounded-2xl border border-brand-100 bg-white shadow-xl shadow-brand-600/15"
        style={{ transform: "translateX(-95%) translateY(18rem) rotate(-4deg)" }}
      >
        <div className="text-center">
          <Download className="mx-auto h-7 w-7 text-brand-600" />
          <div className="mt-2 text-sm font-bold text-gray-900">Готово к скачиванию</div>
          <div className="text-xs text-gray-400">PDF · Word</div>
        </div>
      </div>
    </div>
  );
}

function SheetBody({ accent }: { accent: string }) {
  return (
    <div className="p-5">
      <div className={`h-2 w-[64%] rounded-full bg-gradient-to-r ${accent}`} />
      <div className="mt-3 space-y-1.5">
        <div className="h-1 w-full rounded-full bg-gray-200" />
        <div className="h-1 w-11/12 rounded-full bg-gray-200" />
        <div className="h-1 w-4/5 rounded-full bg-gray-200" />
        <div className="h-1 w-full rounded-full bg-gray-200" />
        <div className="h-1 w-10/12 rounded-full bg-gray-200" />
        <div className="h-1 w-3/4 rounded-full bg-gray-200" />
      </div>
      <div className="mt-5 flex gap-4">
        <div className="flex-1">
          <div className="border-t border-dashed border-gray-300" />
          <div className="mt-1 h-1 w-8 rounded-full bg-gray-100" />
        </div>
        <div className="flex-1">
          <div className="border-t border-dashed border-gray-300" />
          <div className="mt-1 h-1 w-8 rounded-full bg-gray-100" />
        </div>
      </div>
      <Stamp className="absolute bottom-3 right-3 h-5 w-5 text-gray-200" />
    </div>
  );
}

function ComparisonBand() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brand-400">
            Бланк или конструктор
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Два способа получить готовый документ
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                <FileText className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                Бесплатно
              </span>
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">Скачать бланк</h3>
            <ul className="mt-5 space-y-3 text-sm text-gray-300">
              {[
                "Мгновенное скачивание без регистрации",
                "Файлы PDF и Word для любых редакторов",
                "Подходит, если заполняете от руки или печатаете",
                "Можно редактировать в Word без ограничений",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-brand-400/30 bg-gradient-to-br from-brand-600 to-purple-700 p-8 shadow-2xl shadow-brand-600/25">
            <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
              Рекомендуем
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <PenLine className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-white">Конструктор Dogovor.expert</h3>
            <ul className="mt-5 space-y-3 text-sm text-brand-50">
              {[
                "Пошаговые вопросы вместо пустых граф",
                "Автозаполнение адресов и связанных полей",
                "Проверка условий алгоритмом-юристом",
                "Подписание УКЭП и отправка контрагенту",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/builder"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
            >
              Попробовать конструктор
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ itemsCount }: { itemsCount: number }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.35)] sm:p-10">
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-brand-500 to-purple-600"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[-10%] top-[-40%] h-[180%] w-[52%] bg-[radial-gradient(ellipse,rgba(37,99,235,0.10),transparent_62%)]"
          />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-600">
                <Sparkles className="h-3.5 w-3.5" />
                Готовый документ за 5 минут
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Нужен готовый документ, а{" "}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  не пустой бланк?
                </span>
              </h2>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-gray-600">
                Заполните онлайн: конструктор подскажет поля, проверит ИНН и
                реквизиты контрагента и соберёт аккуратный документ в деловом
                оформлении. {itemsCount.toLocaleString("ru-RU")} документов доступно
                прямо сейчас — сохраните в PDF или Word без водяных знаков.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Подсказки по каждому полю — ничего не перепутаете",
                  "Проверка ИНН и реквизитов контрагента",
                  "Экспорт в PDF и Word без водяных знаков",
                ].map((li) => (
                  <li key={li} className="relative pl-8 text-sm text-gray-700">
                    <span className="absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-600">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {li}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-600/30"
                >
                  Открыть конструктор
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
                >
                  Готовые шаблоны
                </Link>
                <Link
                  href="/zayavleniya"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Заявления — образцы и бланки
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div
              className="relative mx-auto hidden h-[292px] w-[230px] -rotate-2 rounded-2xl border border-gray-200 bg-white pt-14 lg:block"
              aria-hidden="true"
            >
              <div className="mx-5 mb-4 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 opacity-90" />
              <div className="mx-5 mb-2.5 h-2 w-full rounded bg-gray-200" />
              <div className="mx-5 mb-2.5 h-2 w-3/5 rounded bg-gray-200" />
              <div className="mx-5 mb-2.5 h-2 w-full rounded bg-gray-200" />
              <div className="mx-5 mb-2.5 h-2 w-3/5 rounded bg-gray-200" />
              <div className="mx-5 h-2 w-4/5 rounded bg-gray-200" />
              <span className="absolute left-[-26px] top-4 animate-float rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-600 shadow-lg">
                PDF
              </span>
              <span className="absolute -right-7 top-32 animate-float rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-600 shadow-lg [animation-delay:0.5s]">
                WORD
              </span>
              <span className="absolute -left-4 bottom-8 animate-float rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg [animation-delay:1s]">
                ✓ Готово
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}