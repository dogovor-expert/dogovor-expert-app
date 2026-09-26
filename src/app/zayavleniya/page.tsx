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
        <ChevronRight className="h-3 w-3 text-gray-500" />
        <span className="text-gray-600">Заявления</span>
      </nav>

      <section className="py-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          {stmts.length} заявлений · образцы + онлайн-заполнение · бесплатно
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Заявления в госорганы, суды и на работу —{" "}
          <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            без очередей и юриста
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-gray-600">
          Готовый образец + конструктор: 5 минут — и документ с правильной шапкой
          «куда/от кого» у вас на руках.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="#katalog"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Выбрать заявление →
          </a>
          <Link
            href="/blanks?kind=statement"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-brand-300"
          >
            Пустые бланки для печати
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Порядок подачи и формы — по состоянию на сентябрь 2026
        </p>
      </section>

      {/* Живая полоса: только честные факты, без выдуманных счётчиков. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 flex-none">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60"></span>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500"></span>
          </span>
          <p className="min-w-0 text-xs text-gray-500">
            Каждое заявление — <b className="text-gray-900">с заполненным образцом</b> и онлайн-заполнением
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <a href="#faq" className="font-semibold text-brand-600">
            Как это работает →
          </a>
        </div>
      </div>

      {/* Bento: тёмная плитка хитов + цифры. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm sm:col-span-2 sm:row-span-2">
          <div
            className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)" }}
          />
          <div className="relative">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-xl">
              🔥
            </div>
            <h2 className="text-xl font-bold">Выбирают чаще всего</h2>
            <p className="mt-1 text-sm text-slate-400">Готовые образцы — открывайте и заполняйте</p>
            <div className="mt-4 flex flex-col gap-1.5">
              {stmts.slice(0, 5).map((t, i) => (
                <Link
                  key={t.id}
                  href={`/documents/${t.id}`}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/5"
                >
                  <span
                    className={`grid h-8 w-8 flex-none place-items-center rounded-lg bg-gradient-to-br text-sm text-white ${
                      [
                        "from-sky-500 to-blue-600",
                        "from-indigo-500 to-purple-600",
                        "from-emerald-500 to-green-600",
                        "from-amber-500 to-orange-600",
                        "from-rose-500 to-red-600",
                      ][i % 5]
                    }`}
                  >
                    📄
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{t.name}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm">
          <div className="text-4xl font-extrabold tracking-tight text-brand-700">{stmts.length}</div>
          <p className="mt-1 text-sm text-gray-600">заявлений с образцами</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-4xl font-extrabold tracking-tight text-gray-900">0 ₽</div>
          <p className="mt-1 text-sm text-gray-600">бесплатно, без регистрации</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-4xl font-extrabold tracking-tight text-gray-900">~5 мин</div>
          <p className="mt-1 text-sm text-gray-600">от выбора до файла</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-4xl font-extrabold tracking-tight text-gray-900">PDF·Word</div>
          <p className="mt-1 text-sm text-gray-600">два формата на выбор</p>
        </div>
      </div>

      {/* Trust-полоса: только проверяемые факты. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { title: "Куда подавать", sub: "орган, срок, пошлина", grad: "from-emerald-500 to-teal-600" },
          { title: "Шапка «куда/от кого»", sub: "соберётся сама", grad: "from-brand-500 to-indigo-600" },
          { title: "Ссылки на законы", sub: "основание в каждом образце", grad: "from-purple-500 to-purple-700" },
          { title: "Срок и пошлина", sub: "на каждой карточке", grad: "from-amber-400 to-orange-500" },
        ].map((c) => (
          <div key={c.title} className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm">
            <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl bg-gradient-to-br text-sm text-white ${c.grad}`}>
              ✓
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold text-gray-900">{c.title}</span>
              <span className="block truncate text-[11px] text-gray-500">{c.sub}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Каталог заявлений — как выбор документа в builder. */}
      <div id="katalog" className="scroll-mt-4">
        {mounted && <StatementsSelector favorites={favorites} onToggleFavorite={toggleFavorite} />}
      </div>

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

      <section id="faq" className="scroll-mt-4 space-y-4">
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

      <p className="text-center text-xs text-gray-500">
        Ищете договор, а не заявление? <Link href="/templates" className="text-brand-600 underline underline-offset-2">Каталог шаблонов договоров</Link>
      </p>
    </div>
  );
}
