import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, MousePointer2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_URL } from "@/lib/site";
import { truncateWord, composeTitle } from "@/lib/seo/docMeta";
import { PRESETS, PHRASES, SAMPLE_RESUME, TEMPLATES } from "@/lib/resume/data";
import { buildResumeHtml } from "@/lib/resume/render";
import { RESUME_CSS } from "@/lib/resume/resumeCss";
import { ResumeCatalog, PhraseTabs, type CatalogItem } from "./catalog";

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

const ATS_RULES = [
  { t: "Одна колонка для откликов", d: "ATS-парсеры читают сверху вниз. Одноколоночные шаблоны с меткой ✓ распознаются корректно в hh.ru и ATS." },
  { t: "Стандартные шрифты", d: "Никаких декоративных гарнитур: системы отбора могут не распознать текст и отбросить резюме до просмотра." },
  { t: "Без таблиц и графики", d: "Таблицы, диаграммы и текст внутри картинок — главная причина отсева: до 75% резюме фильтруются автоматически." },
  { t: "Обычные названия разделов", d: "«Опыт работы», «Образование», «Навыки» — робот ищет привычные заголовки, а не креативные." },
  { t: "Ключевые слова из вакансии", d: "Навыки и формулировки один в один как в описании вакансии повышают релевантность в выдаче ATS." },
];

const HR_TIPS = [
  { t: "Цифры в каждом достижении", d: "«Увеличил продажи на 30%», а не «занимался продажами». Рекрутер тратит 7 секунд на первый просмотр — цифры цепляют взгляд." },
  { t: "Одна страница — золотой стандарт", d: "Опыт до 10 лет умещается на один лист A4. Конструктор предупредит, если текст переполняет страницу." },
  { t: "Фото — только где уместно", d: "Для руководящих и клиентских позиций фото — плюс; для ATS-откликов и IT лучше отключить: в конструкторе это один чекбокс." },
  { t: "Хронология наоборот", d: "Сначала последнее место работы. Учебные проекты, курсы и стажировки вынесите в начало, если нет опыта — поможет шаблон «Резюме выпускника»." },
];

const FAQ = [
  {
    q: "Конструктор резюме бесплатный?",
    a: `Да. Все ${COUNT} шаблона, подсказки, метрика качества и экспорт в PDF и DOC доступны бесплатно и без регистрации. Данные не отправляются на сервер — резюме хранится в localStorage вашего браузера.`,
  },
  {
    q: "Сколько шаблонов доступно и чем они отличаются?",
    a: `Доступен ${COUNT} шаблона: строгие одноколоночные с меткой ATS-safe для откликов через hh.ru и системы отбора, креативные двухколоночные и с боковой панелью для прямого письма рекрутеру, плюс бланки для руководителей и выпускников.`,
  },
  {
    q: "Подойдёт ли резюме для hh.ru и Госуслуг?",
    a: "Да. Для сайтов поиска работы выбирайте ATS-safe шаблоны с одноколоночной вёрсткой — они корректно распознаются при загрузке в профиль.",
  },
  {
    q: "Как скачать резюме в PDF или DOC?",
    a: "Кнопка «Скачать PDF» формирует готовый файл A4 с текстовым слоем (корректно читается системами подбора). Кнопка «DOC» скачивает редактируемый документ для Word в том же оформлении, что и шаблон.",
  },
  {
    q: "Что делать, если нет достижений с цифрами?",
    a: "Опишите результат словами: сократили время на задачу, взяли дополнительную зону ответственности, обучили новых сотрудников. Конструктор подсказывает удачные формулировки для вашей профессии.",
  },
  {
    q: "Где хранятся мои данные?",
    a: "Только в вашем браузере. Мы не собираем персональные данные и не требуем регистрацию. Черновик сохраняется автоматически.",
  },
];

const PHRASE_KEYS = ["programmer", "sales", "lawyer"] as const;

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

const PAGE_CSS = `
.rs-hero{position:relative;overflow:hidden;background:#fff}
.rs-dots{position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:radial-gradient(#e2e8f0 1.2px,transparent 1.2px);background-size:22px 22px}
.rs-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid #fde68a;background:#fffbeb;color:#b45309;font-weight:600;font-size:13px;border-radius:999px;padding:6px 16px}
.rs-badge svg{width:15px;height:15px}
.rs-h1{margin:20px 0 0;font-size:40px;line-height:1.08;font-weight:800;letter-spacing:-.02em;color:#0f172a}
@media(min-width:640px){.rs-h1{font-size:52px}}
.rs-sub{margin:16px 0 0;max-width:36rem;font-size:18px;line-height:1.6;color:#64748b}
.rs-cta{display:flex;flex-direction:column;gap:12px;margin-top:32px}
@media(min-width:640px){.rs-cta{flex-direction:row}}
.rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:14px 28px;font-size:16px;font-weight:600;text-decoration:none;transition:filter .15s}
.rs-btn-p{color:#fff;background:linear-gradient(135deg,#d97706,#ea580c);box-shadow:0 12px 30px -8px rgba(217,119,6,.45)}
.rs-btn-p:hover{filter:brightness(1.08)}
.rs-btn-o{color:#334155;background:#fff;border:1px solid #e2e8f0}
.rs-btn-o:hover{background:#f8fafc}
.rs-btn svg{width:16px;height:16px}
.rs-stats{display:flex;flex-wrap:wrap;gap:16px 40px;margin-top:36px;padding-top:28px;border-top:1px solid #f1f5f9}
.rs-stats b{display:block;font-size:24px;font-weight:800;color:#0f172a}
.rs-stats span{font-size:12px;color:#64748b}
.rs-sheets{position:relative;display:none;height:26rem}
@media(min-width:1024px){.rs-sheets{display:block}}
.rs-sheet{position:absolute;top:0;width:224px;height:317px;overflow:hidden;border-radius:4px;background:#fff}
.rs-sheet-in{display:block;width:794px;transform:scale(.2822);transform-origin:top left}
.rs-h2{margin:8px 0 0;font-size:30px;font-weight:800;letter-spacing:-.01em;color:#0f172a}
@media(min-width:640px){.rs-h2{font-size:36px}}
.rs-lead{margin:12px 0 0;max-width:44rem;color:#64748b;font-size:16px;line-height:1.6}
.rs-kicker{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#d97706}
.rs-chips{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}
.rs-chip{border:1px solid #e2e8f0;background:#fff;color:#334155;font-size:13px;font-weight:600;border-radius:999px;padding:8px 16px;cursor:pointer}
.rs-chip.on{background:#0f172a;border-color:#0f172a;color:#fff}
.rs-grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.rs-card{border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff;transition:transform .2s,box-shadow .2s}
.rs-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(15,23,42,.25)}
.rs-shot{position:relative;display:block;height:303px;overflow:hidden;background:#f1f5f9;text-decoration:none}
.rs-shot-in{display:block;width:794px;transform:scale(.27);transform-origin:top left;pointer-events:none}
.rs-go{position:absolute;inset:auto 0 0 0;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,.55);color:#fff;font-size:13px;font-weight:700;opacity:0;transition:opacity .2s}
.rs-card:hover .rs-go{opacity:1}
.rs-meta{padding:16px}
.rs-name{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rs-name b{font-size:15px;color:#0f172a}
.rs-badge{font-size:11px;font-weight:700;border-radius:999px;padding:3px 10px;white-space:nowrap}
.rs-badge.safe{background:#ecfdf5;color:#047857}
.rs-badge.cre{background:#fff7ed;color:#c2410c}
.rs-meta p{margin:8px 0 0;font-size:12.5px;color:#64748b;line-height:1.55}
.rs-ba{margin-top:16px;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff}
.rs-ba-r{display:flex;gap:10px;padding:16px;font-size:14px;line-height:1.6}
.rs-ba-r .b{flex-shrink:0;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;font-size:12px;font-weight:800}
.rs-ba-r.bad{background:#fef2f2;color:#7f1d1d}
.rs-ba-r.bad .b{background:#fecaca;color:#991b1b}
.rs-ba-r.good{background:#f0fdf4;color:#14532d;border-top:1px solid #e2e8f0}
.rs-ba-r.good .b{background:#bbf7d0;color:#166534}
.rs-ba-foot{padding:12px 16px;border-top:1px solid #e2e8f0;background:#f8fafc}
.rs-copy{font-size:13px;font-weight:600;color:#0f172a;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px 16px;cursor:pointer}
.rs-copy:hover{background:#f1f5f9}
.rs-rule{display:flex;gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:14px;background:#fff}
.rs-rule svg{flex-shrink:0;width:18px;height:18px;color:#047857;margin-top:2px}
.rs-rule b{display:block;font-size:14px;color:#0f172a}
.rs-rule p{margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.55}
.rs-tip{border:1px solid #e2e8f0;border-radius:14px;padding:18px;background:#fff}
.rs-tip b{display:block;font-size:14.5px;color:#0f172a}
.rs-tip p{margin:6px 0 0;font-size:13.5px;color:#64748b;line-height:1.6}
.rs-faq{border:1px solid #e2e8f0;border-radius:14px;background:#fff;padding:18px}
.rs-faq h3{margin:0;font-size:15px;color:#0f172a}
.rs-faq p{margin:8px 0 0;font-size:14px;color:#64748b;line-height:1.6}
.rs-dark{background:#020617;color:#e2e8f0;border-radius:24px;padding:40px 28px}
@media(min-width:640px){.rs-dark{padding:52px}}
.rs-dark h2{margin:0;color:#fff;font-size:26px;font-weight:800}
@media(min-width:640px){.rs-dark h2{font-size:32px}}
.rs-dark p{color:#94a3b8}
.rs-dark .rs-cta{margin-top:28px}
`;

function SheetPreview({ tpl, label }: { tpl: "creative" | "expert"; label: string }) {
  return (
    <div className="rs-sheet" role="img" aria-label={label}>
      <span className="rs-sheet-in" aria-hidden="true">
        <span className={`a4 t-${tpl}`} dangerouslySetInnerHTML={{ __html: buildResumeHtml(SAMPLE_RESUME, tpl) }} />
      </span>
    </div>
  );
}

export default function ResumePage() {
  const items: CatalogItem[] = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    desc: t.desc,
    ats: t.ats,
    parse: t.parse,
    cats: [...t.tags, t.ats],
    html: buildResumeHtml(SAMPLE_RESUME, t.id),
  }));
  const phrases = PHRASE_KEYS.map((k) => ({
    key: k,
    label: PRESETS[k]?.label ?? k,
    bad: PHRASES[k]?.b ?? "",
    good: PHRASES[k]?.g ?? "",
  }));

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: RESUME_CSS + PAGE_CSS }} />
      <JsonLd
        data={[
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
      <section className="rs-hero">
        <div className="rs-dots" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-24 lg:grid-cols-2">
          <div>
            <span className="rs-badge"><Zap />{COUNT} шаблона · PDF и DOC · бесплатно</span>
            <h1 className="rs-h1">Конструктор резюме онлайн</h1>
            <p className="rs-sub">
              Выберите один из {COUNT} профессиональных шаблонов, заполните поля и получите PDF за 5 минут.
              Сделайте резюме, которое прочтут до конца.
            </p>
            <div className="rs-cta">
              <a href="#templates" className="rs-btn rs-btn-p">Выбрать шаблон<ArrowRight /></a>
              <a href="#studio" className="rs-btn rs-btn-o">Собрать за 5 минут</a>
            </div>
            <div className="rs-stats">
              {[[COUNT, "стилей резюме"], ["5 мин", "на сборку"], ["0 ₽", "без регистрации"], ["PDF и DOC", "два формата"]].map(([v, l]) => (
                <div key={l}><b>{v}</b><span>{l}</span></div>
              ))}
            </div>
          </div>
          <div className="rs-sheets" aria-hidden="true">
            <div style={{ position: "absolute", left: "8%", top: 0, transform: "rotate(-6deg)" }}>
              <SheetPreview tpl="creative" label="Шаблон Креатив" />
            </div>
            <div style={{ position: "absolute", left: "46%", top: 32, transform: "rotate(5deg)" }}>
              <SheetPreview tpl="expert" label="Шаблон Эксперт" />
            </div>
            <div style={{ position: "absolute", left: "62%", top: 220, width: 88, height: 88, borderRadius: 16, background: "#fff", border: "1px solid #fde68a", display: "grid", placeItems: "center", boxShadow: "0 12px 30px -12px rgba(217,119,6,.4)" }}>
              <MousePointer2 style={{ width: 26, height: 26, color: "#d97706" }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STUDIO */}
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-4 px-6 pb-4">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 24, background: "#fff", boxShadow: "0 24px 60px -30px rgba(15,23,42,.25)", overflow: "hidden" }}>
          <ResumeBuilder />
        </div>
      </section>

      {/* 3. CATALOG */}
      <section id="templates" className="scroll-mt-4 border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <span className="rs-kicker">Каталог</span>
          <h2 className="rs-h2">{COUNT} готовых бланка резюме для любых профессий</h2>
          <p className="rs-lead">Живое превью на ваших данных: выберите шаблон — конструктор выше сразу переключится. ATS-safe бланки с ✓ читаются роботами hh.ru, креативные с ⚠ — для прямого письма рекрутеру.</p>
          <ResumeCatalog items={items} />
        </div>
      </section>

      {/* 4. ATS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <span className="rs-kicker">ATS-проверка</span>
          <h2 className="rs-h2">Ваше резюме точно прочитает робот и заметит HR</h2>
          <p className="rs-lead">До 75% резюме отсеиваются автоматически, а 98% компаний из Fortune 500 используют ATS. Хуже всего распознаются таблицы, графики, колонки и текст внутри картинок — поэтому в одноколоночных шаблонах мы используем стандартные шрифты, обычные списки и привычные названия разделов.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="grid gap-4" style={{ alignContent: "start" }}>
              {ATS_RULES.map((r) => (
                <div key={r.t} className="rs-rule"><CheckCircle2 /><div><b>{r.t}</b><p>{r.d}</p></div></div>
              ))}
            </div>
            <div>
              <PhraseTabs items={phrases} />
              <p className="mt-3 text-[13px] text-slate-500">Конструктор считает цифры в достижениях автоматически: метрика «Достижения с цифрами» в панели качества.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DARK: blank or studio */}
      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="rs-dark">
          <span className="rs-kicker" style={{ color: "#fbbf24" }}>Быстрый старт</span>
          <h2>Соберите резюме в конструкторе за 5 минут</h2>
          <p className="mt-3 max-w-2xl">14 профессий с готовыми навыками и формулировками, живое превью, проверка качества и экспорт в PDF и DOC — всё в браузере, без регистрации.</p>
          <div className="rs-cta">
            <a href="#studio" className="rs-btn rs-btn-p"><Download />Открыть конструктор</a>
            <a href="#templates" className="rs-btn rs-btn-o" style={{ background: "transparent", color: "#fff", borderColor: "#334155" }}>Выбрать шаблон</a>
          </div>
        </div>
      </section>

      {/* 6. HR TIPS */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <span className="rs-kicker">Практика {YEAR}</span>
          <h2 className="rs-h2">Что ищут HR-директора в резюме в {YEAR} году</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {HR_TIPS.map((t) => (
              <div key={t.t} className="rs-tip"><b>{t.t}</b><p>{t.d}</p></div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Если вы только начинаете карьеру — выберите шаблон «Резюме выпускника» и пресет профессии.
            Ставка делается на образование, учебные проекты, курсы, стажировки и soft skills. Опыт
            можно усилить за счёт волонтёрства, фриланса и участия в олимпиадах и хакатонах.
          </p>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <span className="rs-kicker">FAQ</span>
          <h2 className="rs-h2">Часто задаваемые вопросы о резюме</h2>
          <div className="mt-8 grid gap-4">
            {FAQ.map((f) => (
              <div key={f.q} className="rs-faq"><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
          <AdSlot id="RESUME_INFEED" />
          <p className="mt-6 text-sm text-gray-500">
            Смотрите также: <Link href="/documents" className="text-brand-600 hover:underline">шаблоны документов</Link> и{" "}
            <Link href="/builder" className="text-brand-600 hover:underline">конструктор договоров</Link>.
          </p>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Создайте резюме своей мечты прямо сейчас</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">{COUNT} шаблона, проверка ATS, экспорт в PDF и DOC — бесплатно и без регистрации.</p>
          <div className="rs-cta" style={{ justifyContent: "center", flexDirection: "row" }}>
            <a href="#studio" className="rs-btn rs-btn-p"><Sparkles />Начать бесплатно</a>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-slate-500">
            <ShieldCheck style={{ width: 15, height: 15 }} />Данные хранятся только в вашем браузере
          </p>
        </div>
      </section>
    </div>
  );
}
