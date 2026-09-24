import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  FileText,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { POPULAR_TEMPLATE_IDS } from "@/data/popular";
import BlanksBrowser, { type BlankCategory, type BlankItem } from "@/components/blank/BlanksBrowser";
import FormatBadges from "@/components/blank/FormatBadges";
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

  return (
    <div className="mx-auto max-w-5xl space-y-12 p-6">
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

      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
        <Link href="/" className="hover:text-brand-600">
          Главная
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-gray-600">Бланки</span>
      </nav>

      <section className="py-2 text-center">
        <h1 className="text-display-lg font-bold text-gray-900">
          Пустые бланки договоров и заявлений
        </h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-gray-600">
          Скачайте готовый пустой бланк любого договора или заявления и
          заполните его от руки или на компьютере. Все файлы — в форматах{" "}
          <span className="font-semibold text-gray-900">PDF и Word</span>,
          бесплатно и без регистрации. На каждом бланке указан адрес{" "}
          <span className="font-semibold text-brand-600">dogovor.expert</span>.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="#catalog"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <SearchIcon />
            Найти бланк
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Заполнить онлайн
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={items.length.toLocaleString("ru-RU")} label="бланков" />
          <Stat value="PDF · Word" label="2 формата" />
          <Stat value="0 ₽" label="бесплатно" />
          <Stat value="~5 мин" label="заполнить онлайн" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Step
          n={1}
          icon={<Download className="h-5 w-5" />}
          title="Скачайте бланк"
          text="PDF или Word, бесплатно и без регистрации — файл готов к печати на А4."
        />
        <Step
          n={2}
          icon={<PenLine className="h-5 w-5" />}
          title="Заполните"
          text="От руки или на компьютере: впишите дату, реквизиты сторон и подписи в отведённых полях."
        />
        <Step
          n={3}
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Подпишите"
          text="Проверьте реквизиты и подпишите. При необходимости заверьте у нотариуса или подпишите ЭП."
        />
      </section>

      <PopularBlanks items={items} />

      <div id="catalog" className="scroll-mt-24">
        <BlanksBrowser
          items={items}
          categories={categories}
          popularIds={POPULAR_TEMPLATE_IDS}
          initialKind={initialKind}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Бланк или онлайн-конструктор
        </h2>
        <p className="text-sm leading-relaxed text-gray-600">
          Если документ нужен один раз — скачайте пустой бланк: распечатайте,
          заполните от руки и подпишите. Если важна аккуратность и скорость —
          заполните онлайн: конструктор подскажет поля, проверит реквизиты и
          сформирует готовый PDF или Word в деловом оформлении. Оба способа
          бесплатны и не требуют регистрации.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-2.5">
          {INDEX_FAQ.map((f) => (
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

      <CtaBand itemsCount={items.length} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-4">
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
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

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-xs font-bold text-white">
          {n}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

function PopularBlanks({ items }: { items: BlankItem[] }) {
  const popular = POPULAR_TEMPLATE_IDS.map((id) => items.find((i) => i.id === id)).filter(
    (x): x is BlankItem => Boolean(x)
  );
  if (popular.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-900">Часто скачивают</h2>
        <a href="#catalog" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          Все бланки
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popular.map((t) => (
          <div
            key={t.id}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
          >
            <Link
              href={`/blanks/${t.id}`}
              className="text-sm font-semibold leading-snug text-gray-900 hover:text-brand-600"
            >
              {t.name}
            </Link>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {t.description}
            </p>
            <FormatBadges className="mb-auto mt-3" />
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <Link
                href={`/blanks/${t.id}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                <FileText className="h-3.5 w-3.5" />
                Скачать
              </Link>
              <Link
                href={`/builder?template=${t.id}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                <PenLine className="h-3.5 w-3.5" />
                Заполнить
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBand({ itemsCount }: { itemsCount: number }) {
  return (
    <section>
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
    </section>
  );
}