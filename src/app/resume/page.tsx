import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Home,
  Mail,
  MousePointer2,
  PenLine,
  Phone,
  Zap,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_URL } from "@/lib/site";
import { truncateWord, composeTitle } from "@/lib/seo/docMeta";
import { TEMPLATES, demoForCategory } from "@/lib/resume/data";
import { buildResumeCardHtml } from "@/lib/resume/render";
import { RESUME_CSS } from "@/lib/resume/resumeCss";
import { ResumeCatalog, type CatalogItem } from "./catalog";
import { ResumeFaq } from "./faq";
import ResumeAtsChecker from "./ResumeAtsChecker";

const YEAR = new Date().getFullYear();
const COUNT = TEMPLATES.length;

const TITLE = composeTitle(`Конструктор резюме онлайн — ${COUNT} шаблона, экспорт в PDF (${YEAR})`);
const DESCRIPTION = truncateWord(
  `Бесплатный конструктор резюме онлайн: ${COUNT} профессиональных шаблона, подсказки по формулировкам достижений, проверка совместимости с ATS и экспорт в PDF и DOC. Заполняете форму — резюме обновляется мгновенно, без регистрации.`,
  160
);

// Интерактивный конструктор — клиентский остров. H1 и SEO-текст рендерятся на сервере,
// чтобы поисковики получали контент без исполнения JS (по аналогии с /autoteka).
const ResumeBuilder = dynamic(() => import("./ResumeBuilder"), {
  loading: () => (
    <div className="mx-auto max-w-5xl p-6" style={{ contain: "layout" }}>
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-soft">
        <div className="h-12 w-2/3 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  ),
});

const FAQ = [
  {
    q: "Правда ли, что шаблоны резюме бесплатны и без водяных знаков?",
    a: "Да, абсолютно. Все 10 шаблонов бланков резюме можно заполнить онлайн и скачать в форматах PDF и Word (DOCX) бесплатно. В файлах нет скрытых водяных знаков, логотипов или обязательной подписки.",
  },
  {
    q: "Что такое проверка ATS-сканером и почему это важно?",
    a: "ATS (Applicant Tracking System) — это автоматическая программа, которую используют HR-службы крупных компаний (Сбер, Яндекс, Т-Банк, X5 и др.) для первичного отсева кандидатов. Если резюме свёрстано в виде сложной таблицы или картинки, сканер не распознает текст и отсеет вас. Наши шаблоны оптимизированы по международным стандартам ATS: правильные теги, читаемый текст и высокая скорость индексации.",
  },
  {
    q: "В каком формате лучше отправлять резюме работодателю: PDF или Word?",
    a: "В 99% случаев идеален формат PDF: он сохраняет вёрстку, шрифты и структуру одинаково на iPhone, Android, Mac и Windows. Формат Word (DOCX) удобен, если кадровое агентство прямо просит прислать редактируемую версию или вы хотите внести быстрые правки в Office.",
  },
  {
    q: "Нужно ли добавлять фотографию в резюме в 2026 году?",
    a: "В российских компаниях наличие качественного делового фото повышает просмотры резюме на 35–40%, особенно в продажах, управлении, юриспруденции и клиентском сервисе. Для чисто технических ролей (DevOps, Data Science) фото не обязательно. В нашем конструкторе вы можете включить или скрыть фото одним кликом.",
  },
  {
    q: "Как правильно уместить опыт в 1–2 страницы?",
    a: "Золотой стандарт HR: 1 страница для специалистов с опытом до 5 лет, 2 страницы — для руководителей и опытных экспертов с 10+ годами стажа. Шаблоны Dogovor.expert автоматически распределяют информацию с идеальным интерлиньяжем, чтобы резюме смотрелось плотно, но воздушно.",
  },
  {
    q: "Помогает ли AI улучшить формулировки достижений?",
    a: "Да! В конструктор встроен алгоритм проверки резюме, который превращает скучные обязанности («занимался составлением договоров») в убедительные оцифрованные результаты («согласовал 1400+ контрактов, сократив срок сделки с 12 до 2 дней»).",
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "конструктор резюме",
    "составить резюме онлайн",
    "шаблоны резюме",
    "резюме для hh.ru",
    "скачать резюме PDF",
    "профессиональное резюме",
    "резюме ATS",
    "бланк резюме",
  ],
  alternates: { canonical: `${SITE_URL}/resume` },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: `${SITE_URL}/resume`,
    siteName: "Dogovor.expert",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Конструктор резюме онлайн" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

/* ─── Мини-листы для hero-визуала ─────────────────────────────────────────── */

interface Spec {
  initials: string;
  name: string;
  title: string;
  summary: string;
  experience: {
    role: string;
    place: string;
    period: string;
    desc: string;
  };
  skills: string[];
  languages: string[];
}

interface HeroTemplate {
  name: string;
  accent: string;
  text: string;
}

const heroTplExpert: HeroTemplate = {
  name: "Эксперт",
  accent: "border-t-4 border-indigo-600",
  text: "text-indigo-700",
};

const heroTplCreative: HeroTemplate = {
  name: "Креатив",
  accent: "border-t-4 border-violet-600",
  text: "text-violet-700",
};

function Line({ className, w = "w-full", h = "h-1.5" }: { className?: string; w?: string; h?: string }) {
  return <div className={["rounded-full bg-slate-200", w, h, className].filter(Boolean).join(" ")} />;
}

function SheetCol({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={["grid grid-cols-1", className].filter(Boolean).join(" ")}>{children}</div>;
}

function SheetContent({ spec, tpl }: { spec: Spec; tpl: HeroTemplate }) {
  const isColumn = tpl.name === "Эксперт";
  const showPhoto = tpl.name !== "Эксперт";

  return (
    <div className="aspect-[1/1.414] w-full rounded-[3px] border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
      <div className={["border-t-4", tpl.accent].join(" ")} />
      <div className="p-5">
        {/* Header */}
        <div className={["flex gap-4", !showPhoto && "items-center"].filter(Boolean).join(" ")}>
          {showPhoto && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              {spec.initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className={["text-base font-extrabold leading-tight", tpl.text].join(" ")}>{spec.name}</h4>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">{spec.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> example@mail.ru
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> +7 (999) 000-00-00
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-4 text-[10px] leading-relaxed text-slate-500">{spec.summary}</p>

        {/* Two-column */}
        <div className={["mt-5 grid gap-5", isColumn ? "grid-cols-[1.35fr_1fr]" : "grid-cols-1"].join(" ")}>
          <SheetCol className="space-y-5">
            <div>
              <div className={["text-[11px] font-bold uppercase tracking-widest", tpl.text].join(" ")}>Опыт работы</div>
              <div className="mt-2.5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{spec.experience.role}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{spec.experience.period}</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-600">{spec.experience.place}</div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{spec.experience.desc}</p>
                </div>
                <Line h="h-px" className="bg-slate-100" />
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="text-slate-500">Вакансия (предыдущая)</span>
                    <span className="text-[10px] font-semibold text-slate-500">4 года</span>
                  </div>
                  <Line className="mt-1.5 h-1.5 w-2/3" />
                  <Line className="mt-1 h-1.5 w-1/2" />
                  <Line className="mt-1 h-1.5 w-3/4" />
                </div>
              </div>
            </div>

            <div>
              <div className={["text-[11px] font-bold uppercase tracking-widest", tpl.text].join(" ")}>Образование</div>
              <div className="mt-2.5 space-y-1.5">
                <Line className="h-1.5 w-3/4" />
                <Line className="h-1.5 w-1/2" />
                <Line className="h-1.5 w-2/3" />
              </div>
            </div>
          </SheetCol>

          <SheetCol className="space-y-5">
            <div>
              <div className={["text-[11px] font-bold uppercase tracking-widest", tpl.text].join(" ")}>Навыки</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {spec.skills.map((s) => (
                  <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className={["text-[11px] font-bold uppercase tracking-widest", tpl.text].join(" ")}>Языки</div>
              <div className="mt-2 space-y-1.5 text-[10px] text-slate-600">
                {spec.languages.map((l) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </SheetCol>
        </div>
      </div>
    </div>
  );
}

const heroSpecElena: Spec = {
  initials: "Е",
  name: "Елена Марченко",
  title: "Старший юрист",
  summary:
    "Судебный юрист корпорации с 8-летним стажем. В арбитраже и защите компании в налоговых и корпоративных спорах — 85% дел закрыто в пользу доверителя.",
  experience: {
    role: "Старший юрист",
    place: "АО «Трайд»",
    period: "09.2018 – настоящее время",
    desc: "Ведение корпоративных споров, защита по госзаказам, подписание соглашений на 250+ млн ₽.",
  },
  skills: ["Арбитраж", "ГПХ", "ГК РФ", "НК РФ", "409 проверка"],
  languages: ["Русский", "Английский", "Немецкий"],
};

const heroSpecDesign: Spec = {
  initials: "А",
  name: "Алёна Петровская",
  title: "Арт-директор / Графический дизайнер",
  summary:
    "7 лет в дизайне интернет-агентств, работала с банками и ритейлом. Моя задача — привести ваш продукт к понятной визуальной логике.",
  experience: {
    role: "Арт-директор",
    place: "Digital-агентство «Перебежка»",
    period: "02.2019 – настоящее время",
    desc: "Руководство командой из 4 дизайнеров, переработка UI 12 кейсов, увеличение конверсии на 22%.",
  },
  skills: ["Figma", "Design-system", "Branding", "Print", "UX"],
  languages: ["Русский", "Английский"],
};

export default function ResumePage() {
  const items: CatalogItem[] = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    desc: t.desc,
    ats: t.ats,
    parse: t.parse,
    cats: [...t.tags, t.ats],
    // Компактное превью карточки (rc-*): рисуется сразу в размере ~220px, без scale.
    // Заголовков h1-h3 внутри нет — только div (аудит 28.09.2026).
    html: buildResumeCardHtml(demoForCategory(t.category), t.id),
    category: t.category,
    rating: t.rating,
    downloads: t.downloads,
    badge: t.badge,
  }));

  return (
    <div className="bg-white">
      <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Резюме", path: "/resume" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Конструктор резюме Dogovor.expert",
            url: `${SITE_URL}/resume`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "ru",
            description: DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Шаблоны резюме",
            itemListElement: TEMPLATES.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.name,
              description: t.desc,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-white pb-16 pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-transparent" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.28]" aria-hidden="true">
            <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(226,189,140,0.5)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.45fr_1fr]">
          <div>
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Хлебные крошки">
              <Link href="/" className="flex items-center gap-1 py-1 transition hover:text-slate-700">
                <Home className="h-3.5 w-3.5" />
                Главная
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-700">Конструктор резюме</span>
            </nav>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
              <Zap className="h-4 w-4" />
              {COUNT} шаблонов · PDF и Word · бесплатно
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Конструктор резюме онлайн
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
              Выберите один из {COUNT} профессиональных шаблонов, заполните поля и получите PDF за 5 минут.
              Сделайте резюме, которое прочтут до конца.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#templates"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-amber-700 to-orange-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-amber-600/25 transition hover:brightness-105"
              >
                Выбрать шаблон
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#studio"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Как составить за 5 минут
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-slate-100 pt-7">
              {[
                { v: String(COUNT), l: "стилей резюме" },
                { v: "5 мин", l: "на сборку" },
                { v: "0 ₽", l: "без регистрации" },
                { v: "2", l: "формата: PDF и DOCX" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold text-slate-900">{s.v}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: overlapping preview cards (декоративная иллюстрация) */}
          <div className="relative hidden h-[26rem] lg:block" aria-hidden="true">
            <div className="absolute inset-x-8 top-8 h-72 rounded-3xl bg-gradient-to-br from-amber-200/60 to-orange-200/40 blur-2xl" />
            <div
              className="absolute left-1/2 top-0 h-72 w-56 rounded-[3px] border border-amber-300/60 bg-white/95 shadow-2xl shadow-amber-900/15"
              style={{ transform: "translateX(-58%) rotate(-6deg)" }}
            >
              <SheetContent
                spec={heroSpecDesign}
                tpl={{ ...heroTplCreative, accent: "border-amber-500", text: "text-amber-700" }}
              />
            </div>
            <div
              className="absolute left-1/2 top-8 h-72 w-56 rounded-[3px] border border-indigo-200 bg-white/95 shadow-2xl shadow-indigo-900/15"
              style={{ transform: "translateX(-42%) rotate(5deg)" }}
            >
              <SheetContent
                spec={heroSpecElena}
                tpl={{ ...heroTplExpert, accent: "border-indigo-600", text: "text-indigo-700" }}
              />
            </div>
            <div
              className="absolute left-1/2 top-20 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-2xl border border-amber-200 bg-white shadow-xl shadow-amber-100"
              style={{ transform: "translateX(8%)" }}
            >
              <MousePointer2 className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE BUILDER STUDIO */}
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-4 px-6 py-12">
        <ResumeBuilder />
      </section>

      {/* 3. CATALOG OF RESUME TEMPLATES */}
      <section id="templates" className="scroll-mt-4 border-t border-slate-100 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <ResumeCatalog items={items} />
        </div>
      </section>

      {/* 4. ATS COMPLIANCE & AI ENHANCER */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Технологии и стандарты</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ваше резюме точно прочитает робот и заметит HR
            </h2>
            <p className="mt-4 text-base text-slate-500 sm:text-lg">
              В 2026 году до 75% откликов отсеиваются автоматическими фильтрами ATS. Мы проектируем бланки так,
              чтобы они гарантированно проходили первичный машинный скрининг.
            </p>
          </div>

          <div className="mt-14">
            <ResumeAtsChecker />
          </div>
        </div>
      </section>

      {/* 5. BLANK VS CONSTRUCTOR COMPARISON */}
      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">
              Два способа составить резюме
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Скачать пустой бланк или собрать в онлайн-конструкторе
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <FileText className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  Мгновенно
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Скачать образец бланка резюме</h3>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Готовые образцы в форматах DOCX (Word) и PDF с разметкой полей, блоками опыта и навыков.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300 sm:text-sm">
                {[
                  "Файлы совместимы с Microsoft Word, Apple Pages, Google Docs",
                  "Соблюдены стандартные отступы и размеры шрифтов по ГОСТ",
                  "Заполняйте в удобном редакторе офлайн на компьютере",
                  "100% бесплатно и без регистрации",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#templates"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Выбрать бланк в каталоге
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 shadow-2xl shadow-indigo-600/30">
              <span className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                Рекомендуем
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                <PenLine className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-white">Онлайн-конструктор Dogovor.expert</h3>
              <p className="mt-2 text-xs text-indigo-100 sm:text-sm">
                Пошаговый мастер составления с подсказками HR-алгоритма, проверкой ошибок и автоформатированием.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-indigo-50 sm:text-sm">
                {[
                  "Автоматическая вёрстка идеального одностраничного формата А4",
                  "Подсказки правильных формулировок достижений по методу STAR",
                  "Смена дизайна и цветовой палитры в 1 клик без потери введённых данных",
                  "Экспорт в резкий векторный PDF (300 DPI) без водяных знаков",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#studio"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Попробовать онлайн-конструктор
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HR GUIDE & TRENDS */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Советы экспертов</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Что ищут HR-директора в резюме в {YEAR} году
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: "01",
                title: "Оцифрованные результаты",
                desc: "Замените список обязанностей на глаголы действия с цифрами: «сократил на 30%», «привлек 15 млн руб», «внедрил за 2 месяца».",
              },
              {
                num: "02",
                title: "Правило одной страницы",
                desc: "Рекрутер тратит всего 6–8 секунд на первый скрининг резюме. Всё самое важное должно помещаться на первом экране.",
              },
              {
                num: "03",
                title: "Ключевые слова вакансии",
                desc: "Укажите технологии, стандарты и термины точно так, как они написаны в требованиях работодателя для идеального совпадения в ATS.",
              },
              {
                num: "04",
                title: "Актуальные контакты",
                desc: "Обязательно добавьте Telegram и ссылку на портфолио/GitHub — сегодня это самый быстрый канал связи с кандидатом.",
              },
            ].map((tip) => (
              <div
                key={tip.num}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-2xl font-black text-indigo-600/70">{tip.num}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{tip.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-[15px] leading-relaxed text-slate-600">
            Если вы только начинаете карьеру — выберите шаблон «Резюме выпускника» и пресет профессии. Ставка
            делается на образование, учебные проекты, курсы, стажировки и soft skills. Опыт можно усилить за счёт
            волонтёрства, фриланса и участия в олимпиадах и хакатонах.
          </p>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Вопросы и ответы</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Часто задаваемые вопросы о резюме
            </h2>
          </div>

          <ResumeFaq items={FAQ} />

          <AdSlot id="RESUME_INFEED" />
          <p className="mt-6 text-sm text-gray-500">
            Смотрите также:{" "}
            <Link href="/documents" className="inline-block py-1 text-brand-600 hover:underline">
              шаблоны документов
            </Link>{" "}
            и{" "}
            <Link href="/builder" className="inline-block py-1 text-brand-600 hover:underline">
              конструктор договоров
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-[50rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 lg:flex-row">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Создайте резюме своей мечты прямо сейчас
            </h2>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">
              {COUNT} профессиональных шаблонов, экспорт в PDF и Word. Бесплатно и без водяных знаков.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#studio"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-900 shadow-xl transition hover:bg-slate-100"
            >
              Собрать резюме онлайн
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#templates"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/5"
            >
              Каталог шаблонов
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
