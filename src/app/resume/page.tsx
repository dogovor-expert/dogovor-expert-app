import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FileText, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

const YEAR = new Date().getFullYear();

const TITLE = `Конструктор резюме онлайн — 10 шаблонов, экспорт в PDF (${YEAR})`;
const DESCRIPTION =
  "Бесплатный конструктор резюме онлайн: 10 профессиональных шаблонов, подсказки по формулировкам достижений, проверка совместимости с ATS и экспорт в PDF. Заполняете форму — резюме обновляется мгновенно, без регистрации.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "конструктор резюме",
    "составить резюме онлайн",
    "шаблоны резюме",
    "резюме для hh.ru",
    "скачать резюме PDF",
    "профессиональное резюме",
    "резюме ATS",
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

const PERKS = [
  { icon: LayoutTemplate, title: "10 шаблонов", text: "Одноколоночные для ATS и креативные для прямого отклика — с живым превью." },
  { icon: Sparkles, title: "Подсказки по формулировкам", text: "Готовые примеры достижений для 14 профессий: «плохо → хорошо»." },
  { icon: ShieldCheck, title: "Проверка на ATS", text: "Метрика качества и метки совместимости с системами отбора кандидатов." },
  { icon: FileText, title: "Экспорт в PDF", text: "Резюме формата A4, готовое к печати и отправке. Данные — только в вашем браузере." },
];

const STEPS = [
  { t: "Выберите профессию", d: "Конструктор подставит типовые разделы, навыки и готовые формулировки." },
  { t: "Заполните контакты и «О себе»", d: "3–4 предложения об опыте и сильных сторонах." },
  { t: "Опишите опыт через результаты", d: "«Увеличил продажи на 30%», а не «занимался продажами»." },
  { t: "Добавьте навыки", d: "Ориентируйтесь на требования конкретной вакансии." },
  { t: "Выберите шаблон и скачайте PDF", d: "Проверьте метрику качества перед отправкой." },
];

const FAQ = [
  {
    q: "Конструктор резюме бесплатный?",
    a: "Да. Все 10 шаблонов, подсказки, метрика качества и экспорт в PDF доступны бесплатно и без регистрации. Данные не отправляются на сервер — резюме хранится в localStorage вашего браузера.",
  },
  {
    q: "Подойдёт ли резюме для hh.ru и Госуслуг?",
    a: "Да. Для сайтов поиска работы выбирайте ATS-safe шаблоны с одноколоночной вёрсткой — они корректно распознаются при загрузке в профиль.",
  },
  {
    q: "Как скачать резюме в PDF?",
    a: "Нажмите «Скачать PDF» — документ сформируется в вашем браузере и откроется системное окно печати. Выберите «Сохранить как PDF».",
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

export default function ResumePage() {
  return (
    <div>
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
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <div style={{ minHeight: "560px", contain: "layout" }}>
        <ResumeBuilder />
      </div>

      <section className="mx-auto max-w-3xl space-y-6 px-6 pb-12 text-gray-700 leading-relaxed">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Конструктор резюме онлайн — 10 шаблонов и экспорт в PDF
        </h1>
        <p>
          Соберите профессиональное резюме за 10–15 минут: заполняете форму — документ справа
          обновляется мгновенно. Выберите один из 10 шаблонов, воспользуйтесь подсказками по
          формулировкам достижений и скачайте готовый PDF. Регистрация не нужна: данные хранятся
          только в вашем браузере.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p.icon className="mb-2 h-5 w-5 text-brand-600" aria-hidden />
              <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
              <p className="mt-1 text-xs text-gray-600">{p.text}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900">Как составить резюме: 5 шагов</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span>
                <strong className="text-gray-900">{s.t}.</strong> <span className="text-gray-600">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>

        <h2 className="text-xl font-bold text-gray-900">Что такое ATS и почему это важно</h2>
        <p>
          ATS (Applicant Tracking System) — программа, через которую крупные компании фильтруют
          резюме до просмотра рекрутером. По оценке Jobscan, до 75% резюме отсеиваются автоматически,
          а 98% компаний из Fortune 500 используют такие системы. Хуже всего распознаются таблицы,
          графики, колонки и текст внутри картинок — поэтому в одноколоночных шаблонах мы используем
          стандартные шрифты, обычные списки и привычные названия разделов.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Резюме без опыта работы</h2>
        <p>
          Если вы только начинаете карьеру — выберите шаблон «Резюме выпускника» и пресет профессии.
          Ставка делается на образование, учебные проекты, курсы, стажировки и soft skills. Опыт
          можно усилить за счёт волонтёрства, фриланса и участия в олимпиадах и хакатонах.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-gray-900">{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Смотрите также: <Link href="/documents" className="text-brand-600 hover:underline">шаблоны документов</Link> и{" "}
          <Link href="/builder" className="text-brand-600 hover:underline">конструктор договоров</Link>.
        </p>
      </section>
    </div>
  );
}
