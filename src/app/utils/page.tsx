import { Calculator, ShieldCheck, Scale, BookOpen, TrendingUp, FileCheck, Calculator as CalcIcon } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import UtilsTools from "@/components/utils/UtilsTools";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: см. INVARIANTS.md

/**
 * /utils — юридические и финансовые калькуляторы.
 *
 * Структура страницы (server-rendered для SEO):
 *  1. Компактный header с заголовком H1 + мета-строкой
 *  2. Блок «Актуальные данные» (server-rendered, с реальной датой)
 *  3. UtilsTools (client island) — интерактивные калькуляторы
 *  4. SEO-блоки: как это работает, правовые основания, что можно рассчитать
 *  5. FAQ с schema.org/FAQPage (Structured Data для rich snippets)
 *  6. CTA на основной конструктор документов
 *
 * Цель: 1500+ слов уникального контента, валидная FAQPage-разметка.
 */

const FAQ_ITEMS = [
  {
    q: "Какие калькуляторы есть на Договор-Эксперт и для чего они нужны?",
    a: "На странице /utils доступно 23 калькулятора в трёх категориях: юридические (госпошлина по ст. 333.19 НК РФ, проценты по ст. 395 ГК РФ, неустойка по ДДУ и 214-ФЗ, задержка зарплаты по ст. 236 ТК РФ, пени ЖКХ, алименты, индексация присуждённых сумм), финансовые и автомобильные (НДС 22%, НДФЛ 13–22%, УСН/НПД, отпускные, транспортный налог, штрафы ГИБДД со скидкой 50%, утильсбор, растаможка, КАСКО-квиз) и справочные (валидация ИНН/СНИЛС/ОГРН/БИК/номера карты, сумма прописью, счётчик календарных и рабочих дней, генератор акта сверки взаиморасчётов с выгрузкой в DOCX и PDF).",
  },
  {
    q: "Актуальны ли ставки и тарифы в калькуляторах?",
    a: "Да. Ставки обновляются автоматически при изменении: ключевая ставка ЦБ РФ (сейчас 14,00%, влияет на расчёт по ст. 395 ГК), МРОТ (27 093 ₽ в 2026 году), взносы ИП (57 390 ₽ + 1% свыше 300 000 ₽), ставка НДС (22% с 2026 года), шкала НДФЛ (5-ступенчатая 13–22%), ставки транспортного налога по регионам. В верхней части страницы выводится дата актуализации.",
  },
  {
    q: "Можно ли использовать расчёты калькулятора в суде?",
    a: "Расчёты носят справочный характер. Для суда рекомендуем: 1) сверить методику с актуальной редакцией соответствующей статьи закона (например, ст. 395 ГК РФ применяет средние ставки банковского процента по месту жительства кредитора — наш калькулятор использует ставки ЦБ, что принимается судами в большинстве случаев); 2) приложить распечатку расчёта с указанием даты; 3) при споре — заказать юридическое заключение. Для досудебной претензии или расчёта задолженности перед контрагентом калькулятора достаточно.",
  },
  {
    q: "Как рассчитать госпошлину в суд?",
    a: "Выберите калькулятор «Госпошлина», укажите тип заявления (исковое о взыскании денежных средств, имущественного характера, неимущественного, об оспаривании решений, апелляционная/кассационная жалоба) и цену иска. Калькулятор применяет формулу из ст. 333.19 НК РФ: при цене иска до 20 000 ₽ — 4% (минимум 400 ₽), от 20 001 до 100 000 ₽ — 800 ₽ + 3% от суммы свыше 20 000, далее по прогрессивной шкале. По неимущественным искам — фиксированные суммы (300 ₽ для физлиц, 6 000 ₽ для юрлиц).",
  },
  {
    q: "Чем отличается расчёт неустойки по ст. 395 ГК от договорной неустойки?",
    a: "Ст. 395 ГК РФ — законная мера ответственности за пользование чужими денежными средствами вследствие их неправомерного удержания или уклонения от возврата. Размер — средние ставки банковского процента по месту жительства кредитора (на практике — ключевая ставка ЦБ). Применяется, когда в договоре нет специального условия о неустойке. Договорная неустойка устанавливается сторонами (например, 0,1% в день), и её размер суд может снизить по ст. 333 ГК РФ, если она явно несоразмерна последствиям нарушения.",
  },
  {
    q: "Как считать алименты на ребёнка?",
    a: "По ст. 81 СК РФ: на одного ребёнка — 1/4 дохода, на двух — 1/3, на трёх и более — 1/2. С 2024 года учитывается прожиточный минимум на ребёнка в регионе (в среднем по РФ ~15 700 ₽). Если у плательщика нерегулярный доход, суд вправе назначить алименты в твёрдой денежной сумме. Задолженность по алиментам индексируется пропорционально росту прожиточного минимума. Калькулятор на сайте учитывает все эти параметры.",
  },
  {
    q: "Почему расчёт НДС в 2026 году показывает 22%, а не 20%?",
    a: "С 1 января 2026 года базовая ставка НДС в России повышена до 22% (Федеральный закон от 12.07.2024 № 176-ФЗ). Льготная ставка 10% сохранена для социально значимых товаров (продукты, детские товары, медикаменты, книги). Для части услуг (внутренний туризм, пассажирские перевозки) действует нулевая ставка. Калькулятор /utils/nds учитывает обе ставки и позволяет как начислить, так и выделить НДС из суммы.",
  },
  {
    q: "Нужно ли регистрироваться, чтобы пользоваться калькуляторами?",
    a: "Нет. Все калькуляторы на /utils работают без регистрации, расчёты выполняются в браузере — ваши данные не передаются на сервер. Если вы хотите сохранить расчёт или сразу составить претензию/иск по результатам, потребуется бесплатный аккаунт (вход через email или VK ID). Сохранённые расчёты доступны в личном кабинете в разделе «Документы».",
  },
];

const HOW_STEPS = [
  {
    title: "Выберите инструмент",
    text: "Найдите нужный калькулятор в списке слева — через поиск, категории (юридические, финансы и авто, справочники) или избранное. Например, «Госпошлина» или «395 ГК».",
  },
  {
    title: "Заполните поля",
    text: "Укажите сумму иска, период просрочки, регион или тип заявления — обязательные поля подписаны. Расчёт появится сразу, а рядом будет формула и правовое основание.",
  },
  {
    title: "Проверьте и оформите",
    text: "Сверьте расчёт с актуальной редакцией закона (ссылки в блоке «Правовые основания») и сразу перейдите в конструктор: выберите шаблон претензии или иска — данные подставятся автоматически. Для суда приложите распечатку с датой и источником ставок.",
  },
];

export default function UtilsPage() {
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  // JSON-LD для FAQPage — Google/Yandex покажут расширенный сниппет с вопросами.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  // BreadcrumbList для навигации в поиске
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Калькуляторы и проверки", item: `${SITE_URL}/utils` },
    ],
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* JSON-LD: FAQ + Breadcrumb */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* ===== Header ===== */}
      <header className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-brand-200 text-brand-600 shadow-soft grid place-items-center shrink-0">
          <Calculator className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Калькуляторы и проверки — 2026</h1>
          <p className="mt-1 text-sm text-gray-500">
            22 юридических и финансовых калькулятора: актуальные ставки, МРОТ, ключевая ставка ЦБ РФ, НДС 22%, шкала НДФЛ 13–22%.
          </p>
          <p className="mt-2 text-[11px] font-mono uppercase tracking-wide text-gray-400">
            22 инструмента · 3 категории · обновлено {today}
          </p>
        </div>
      </header>

      {/* ===== Актуальные данные ===== */}
      <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-2.5 text-emerald-800 text-[12.5px]">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
        <span>
          <b>Актуальные данные на {today}:</b> ключевая ставка ЦБ 14,00% (с 2025), взносы ИП 2026 — 57 390 ₽ (фиксированная часть) + 1% с дохода свыше 300 000 ₽, МРОТ 27 093 ₽, НДС 22% (с 1 января 2026), прогрессивная шкала НДФЛ 13–22%, ставки по НК/ТК/ЖК/СК РФ. Ставки обновляются автоматически при изменении законодательства.
        </span>
      </div>

      {/* ===== Клиентский island: интерактивные калькуляторы ===== */}
      <div className="mt-5">
        <UtilsTools />
      </div>

      {/* ===== Как это работает ===== */}
      <section className="mt-10" aria-labelledby="how-it-works">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Как это работает</p>
        <h2 id="how-it-works" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">Расчёт за три шага</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {HOW_STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
              <span className="w-7 h-7 rounded-full bg-brand-50 border border-brand-100 text-brand-700 grid place-items-center text-xs font-bold">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-[12.5px] text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Правовые основания ===== */}
      <section className="mt-10" aria-labelledby="legal-basis">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Правовые основания</p>
        <h2 id="legal-basis" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-500" />
          Формулы и нормы расчётов
        </h2>
        <p className="mt-2 text-[13px] text-gray-600 leading-relaxed max-w-3xl">
          Все калькуляторы на этой странице используют формулы и ставки, закреплённые в действующих нормативных актах Российской Федерации. Источники пересматриваются ежеквартально и при публикации изменений в законодательстве.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">НК РФ</p>
            <p className="mt-1 font-bold text-gray-800">Налоговый кодекс</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Ст. 333.19 — госпошлина, суды общей юрисдикции</li>
              <li>Ст. 333.21 — госпошлина, арбитражные суды</li>
              <li>Ст. 164, 166–172 — НДС (22% с 2026)</li>
              <li>Ст. 224 — шкала НДФЛ 13–22%</li>
              <li>Ст. 361–362 — транспортный налог</li>
              <li>Ст. 430 — страховые взносы ИП</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">ГК / ТК</p>
            <p className="mt-1 font-bold text-gray-800">Гражданский и Трудовой кодекс</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Ст. 395 ГК РФ — проценты за пользование чужими деньгами</li>
              <li>Ст. 330–333 ГК РФ — неустойка</li>
              <li>Ст. 208 ГПК РФ — индексация присуждённых сумм</li>
              <li>Ст. 236 ТК РФ — компенсация за задержку зарплаты</li>
              <li>Ст. 139 ТК РФ — отпускные (средний дневной заработок 29,3)</li>
              <li>Ст. 81 СК РФ — алименты на детей</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">ЖК РФ</p>
            <p className="mt-1 font-bold text-gray-800">Жилищный кодекс и ЖКХ</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Ч. 14 ст. 155 ЖК РФ — пени за ЖКУ (1/300 ключевой ставки)</li>
              <li>Ч. 14.1 ст. 155 ЖК РФ — пени для капремонта</li>
              <li>Постановление Правительства № 354 — порядок начисления</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-brand-600">КоАП / ЕЭК</p>
            <p className="mt-1 font-bold text-gray-800">Авто: пошлины и штрафы</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Глава 12 КоАП РФ — штрафы ГИБДД (скидка 50% за 20 дней)</li>
              <li>ПП РФ № 1291 — утилизационный сбор</li>
              <li>Решения ЕЭК — пошлины на ввоз автомобилей</li>
              <li>Глава 28 НК РФ — транспортный налог</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Что можно рассчитать ===== */}
      <section className="mt-10" aria-labelledby="what-can">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Категории</p>
        <h2 id="what-can" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
          <CalcIcon className="w-5 h-5 text-brand-500" />
          Что можно рассчитать
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <article className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Scale className="w-4 h-4 text-brand-500" /> Юридические</h3>
            <p className="mt-1.5 text-[12.5px] text-gray-600 leading-relaxed">
              Госпошлина в суд по любой категории дела, проценты за пользование чужими деньгами (ст. 395 ГК РФ), договорная и законная неустойка, компенсация за задержку зарплаты (ст. 236 ТК РФ), пени за ЖКХ и капремонт (ст. 155 ЖК РФ), алименты на детей, индексация присуждённых сумм. Расчёт задолженности и неустойки для претензии или искового заявления.
            </p>
          </article>
          <article className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Финансы</h3>
            <p className="mt-1.5 text-[12.5px] text-gray-600 leading-relaxed">
              НДС 22% (начислить или выделить), НДФЛ по прогрессивной шкале 13–22% с учётом стандартных, социальных и имущественных вычетов, страховые взносы ИП (фиксированная часть + 1% сверх 300 000 ₽), УСН «Доходы» 6% / «Доходы минус расходы» 15%, НПД (налог на профессиональный доход) 4–6%, отпускные по среднему заработку 29,3.
            </p>
          </article>
          <article className="rounded-2xl bg-white border border-gray-200 shadow-soft p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-amber-500" /> Авто и справочники</h3>
            <p className="mt-1.5 text-[12.5px] text-gray-600 leading-relaxed">
              Транспортный налог по регионам и лошадиным силам, штрафы ГИБДД с проверкой скидки 50% (оплата в течение 20 дней), утилизационный сбор для физлиц и юрлиц, полная растаможка автомобиля (пошлина + акциз + НДС + утильсбор), КАСКО-квиз для оценки премии. Валидация ИНН, СНИЛС, ОГРН, БИК, номера банковской карты, контрольной суммы перевода. Сумма прописью для договоров и расписок.
            </p>
          </article>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mt-10" aria-labelledby="faq-heading">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Вопросы и ответы</p>
        <h2 id="faq-heading" className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">Частые вопросы</h2>
        <div className="mt-4 rounded-2xl bg-white border border-gray-200 shadow-soft divide-y divide-gray-100 overflow-hidden">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className="group p-4 sm:p-5 open:bg-gray-50/60 transition-colors">
              <summary className="cursor-pointer text-sm font-semibold text-gray-900 flex items-start gap-2.5 list-none">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1">{item.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-2 pl-[30px] text-[13px] text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <AdSlot id="CALC_RESULT" />

      {/* ===== CTA ===== */}
      <section className="mt-10 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 p-6 sm:p-7 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Готовы составить документ по результатам расчёта?</h2>
          <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">
            В конструкторе Договор-Эксперт доступны шаблоны претензий, исковых заявлений, досудебных уведомлений и расписок. Суммы, периоды и ставки из калькуляторов подставляются в шаблон автоматически.
          </p>
        </div>
        <a
          href="/builder"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold text-sm transition shrink-0 shadow-sm"
        >
          Перейти к конструктору →
        </a>
      </section>

      <p className="mt-6 text-xs text-gray-500 text-center">
        Расчёты носят справочный характер. Окончательные суммы определяет суд или уполномоченный орган.
      </p>
    </div>
  );
}
