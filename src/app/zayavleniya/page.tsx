"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  MessageCircle,
  Download,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import StatementsSelector from "@/components/statements/StatementsSelector";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { SITE_URL } from "@/lib/site";

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

const FAV_KEY = "dogovor-statement-favorites-v1";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return new Set();
    return new Set((JSON.parse(raw) as string[]).filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export default function StatementsHubPage() {
  const stmts = LEGAL_TEMPLATES.filter((t) => t.kind === "statement");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(loadFavorites());
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* offline/private — избранное просто не сохранится */
      }
      return next;
    });
  };

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
          Заявления — образцы 2026
        </h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-gray-600">
          Заявления в госорганы, суды, работодателю и в ЖКХ. Каждое — с образцом
          заполнения и онлайн-заполнением за 5 минут. Нужна пустая форма для
          ручного заполнения — она в разделе «Бланки».
        </p>
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

      {/* Каталог заявлений — как выбор документа в builder. */}
      {mounted && <StatementsSelector favorites={favorites} onToggleFavorite={toggleFavorite} />}

      {/* Пустые бланки живут отдельно — в разделе «Бланки». */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white text-gray-500">
            <Download className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900">Нужна пустая форма для печати?</p>
            <p className="text-xs text-gray-500">Пустые бланки заявлений — отдельно в разделе «Бланки»</p>
          </div>
          <Link
            href="/blanks?kind=statement"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            <FileText className="h-4 w-4" />
            Бланки заявлений
          </Link>
        </div>
      </section>

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
    </div>
  );
}
