import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_TEMPLATES } from "@/data/templates";
import type { LegalTemplate } from "@/data/types";

export const metadata: Metadata = {
  title: "Скачать пустые бланки договоров — бесплатно PDF и Word",
  description:
    "Бесплатные пустые бланки договоров для ручного заполнения: ДКП автомобиля, договор аренды, подряда, расписка, счёт и ещё 360+ шаблонов. Скачайте в PDF или Word с dogovor.expert — без регистрации.",
  keywords: [
    "скачать бланк договора",
    "пустой бланк договора",
    "бланк договора аренды скачать",
    "бланк договора купли продажи",
    "пустые бланки документов",
    "образец бланка",
  ],
  alternates: { canonical: "/blanks" },
  openGraph: {
    title: "Скачать пустые бланки договоров — бесплатно PDF и Word",
    description:
      "Бесплатные пустые бланки договоров для ручного заполнения. PDF и Word, без регистрации.",
    url: "/blanks",
    type: "website",
  },
  robots: { index: true, follow: true },
};

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
  const groups = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    items: LEGAL_TEMPLATES.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
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

      {groups.map((group) => (
        <section key={group.id}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            {group.label}
            <span className="text-sm font-normal text-gray-400">
              ({group.items.length})
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((t: LegalTemplate) => (
              <Link
                key={t.id}
                href={`/blanks/${t.id}`}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 leading-snug">
                  {t.name}
                </p>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
                <p className="text-xs text-indigo-600 mt-2 font-medium">
                  Скачать бланк →
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
