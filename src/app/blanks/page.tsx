import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_TEMPLATES } from "@/data/templates";
import BlanksBrowser, { type BlankCategory, type BlankItem } from "@/components/blank/BlanksBrowser";
import { withSeo } from "@/lib/seo/withSeo";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export const metadata: Metadata = withSeo({
  path: "/blanks",
  title: "Скачать пустые бланки договоров — PDF и Word",
  description:
    "Бесплатные пустые бланки договоров для ручного заполнения: ДКП авто, аренда, подряд, расписка, счёт. 360+ шаблонов, PDF и Word, без регистрации.",
  keywords: [
    "скачать бланк договора",
    "пустой бланк договора",
    "бланк договора аренды скачать",
    "бланк договора купли продажи",
    "пустые бланки документов",
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

export default function BlanksIndexPage() {
  const items: BlankItem[] = LEGAL_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
  }));

  const categories: BlankCategory[] = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    count: LEGAL_TEMPLATES.filter((t) => t.category === cat).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Пустые бланки договоров",
          description:
            "Бесплатные пустые бланки договоров: ДКП авто, аренда, подряд, расписка, счёт. 360+ шаблонов, PDF и Word, без регистрации.",
          url: `${SITE_URL}/blanks`,
          inLanguage: "ru",
          isPartOf: { "@type": "WebSite", name: "Dogovor.expert", url: SITE_URL },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.slice(0, 25).map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/blanks/${t.id}`,
              name: t.name,
            })),
          },
        }}
      />
      <nav className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600">
          Главная
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Бланки</span>
      </nav>

      <section className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Пустые бланки договоров
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Скачайте готовый пустой бланк любого договора и заполните его от руки или
          на компьютере. Все файлы — в форматах PDF и Word, бесплатно и без
          регистрации. На каждом бланке указан адрес{" "}
          <span className="font-semibold text-indigo-600">dogovor.expert</span>.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/templates"
            className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Все шаблоны
          </Link>
          <Link
            href="/builder"
            className="px-5 py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition"
          >
            Заполнить онлайн
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-gray-900 mb-1">Как заполнить бланк от руки</p>
        <p>
          1. Скачайте бланк в PDF или Word.{" "}
          2. Печатайте или заполняйте от руки чёрной/синей ручкой в отведённых
          местах (линии для заполнения). 3. Впишите дату, реквизиты и подписи
          сторон. 4. При необходимости заверьте у нотариуса. Готовый документ
          можно подписать электронной подписью прямо на сайте.
        </p>
      </section>

      <PopularBlanks items={items} />

      <BlanksBrowser items={items} categories={categories} />
    </div>
  );
}

const POPULAR_IDS = [
  "dkp-auto",
  "dogovor-arendy-kvartiry",
  "raspiska-money",
  "akt-priema-kvartiry",
  "akt-naym",
  "raspiska-generic",
];

function PopularBlanks({ items }: { items: BlankItem[] }) {
  const popular = POPULAR_IDS.map((id) => items.find((i) => i.id === id)).filter(
    (x): x is BlankItem => Boolean(x)
  );
  if (popular.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Популярные бланки</h2>
      <div className="flex flex-wrap gap-2">
        {popular.map((t) => (
          <Link
            key={t.id}
            href={`/blanks/${t.id}`}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition"
          >
            {t.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
