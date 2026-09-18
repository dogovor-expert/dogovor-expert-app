import { Calculator, ShieldCheck, Scale, BookOpen, TrendingUp, FileCheck, Calculator as CalcIcon } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import UtilsTools from "@/components/utils/UtilsTools";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: см. INVARIANTS.md

/**
 * /utils — юридические и финансовые калькуляторы.
 *
 * Структура страницы (server-rendered для SEO):
 *  1. Header с заголовком H1 + краткое описание
 *  2. Блок «Актуальные данные» (server-rendered, с реальной датой)
 *  3. UtilsTools (client island) — интерактивные калькуляторы
 *  4. SEO-блок: что можно рассчитать, правовые основания
 *  5. FAQ с schema.org/FAQPage (Structured Data для rich snippets)
 *  6. CTA на основной конструктор документов
 *
 * Цель: 1500+ слов уникального контента, валидная FAQPage-разметка.
 */

const FAQ_ITEMS = [
  {
    q: "Какие калькуляторы есть на Договор-Эксперт и для чего они нужны?",
    a: "На странице /utils доступно 22 калькулятора в трёх категориях: юридические (госпошлина по ст. 333.19 НК РФ, проценты по ст. 395 ГК РФ, неустойка по ДДУ и 214-ФЗ, задержка зарплаты по ст. 236 ТК РФ, пени ЖКХ, алименты, индексация присуждённых сумм), финансовые и автомобильные (НДС 22%, НДФЛ 13–22%, УСН/НПД, отпускные, транспортный налог, штрафы ГИБДД со скидкой 50%, утильсбор, растаможка, КАСКО-квиз) и справочные (валидация ИНН/СНИЛС/ОГРН/БИК/номера карты, сумма прописью, счётчик календарных и рабочих дней).",
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* JSON-LD: FAQ + Breadcrumb */}
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Калькуляторы и проверки — 2026</h1>
          <p className="text-sm text-gray-600">22 юридических и финансовых калькулятора. Актуальные ставки, МРОТ, ключевая ставка ЦБ РФ.</p>
        </div>
      </header>

      <div className="rounded-xl p-3 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
        <span>
          <b>Актуальные данные на {today}:</b> ключевая ставка ЦБ 14,00% (с 2025), взносы ИП 2026 — 57 390 ₽ (фиксированная часть) + 1% с дохода свыше 300 000 ₽, МРОТ 27 093 ₽, НДС 22% (с 1 января 2026), прогрессивная шкала НДФЛ 13–22%, ставки по НК/ТК/ЖК/СК РФ. Ставки обновляются автоматически при изменении законодательства.
        </span>
      </div>

      {/* Клиентский island: интерактивные калькуляторы */}
      <UtilsTools />

      {/* ===== SEO-БЛОК: правовые основания и описание категорий ===== */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5" aria-labelledby="legal-basis">
        <h2 id="legal-basis" className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          Правовые основания расчётов
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Все калькуляторы на этой странице используют формулы и ставки, закреплённые в действующих нормативных актах Российской Федерации. Источники пересматриваются ежеквартально и при публикации изменений в законодательстве. Ниже — основные правовые акты, на которые опираются расчёты.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1">Налоговый кодекс РФ</p>
            <ul className="space-y-0.5 text-gray-700 list-disc list-inside">
              <li>Ст. 333.19 — госпошлина в суды общей юрисдикции</li>
              <li>Ст. 333.21 — госпошлина в арбитражные суды</li>
              <li>Ст. 164, 166–172 — НДС (22% с 2026)</li>
              <li>Ст. 224 — шкала НДФЛ 13–22%</li>
              <li>Ст. 361–362 — транспортный налог</li>
              <li>Ст. 430 — страховые взносы ИП</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1">Гражданский и Трудовой кодекс</p>
            <ul className="space-y-0.5 text-gray-700 list-disc list-inside">
              <li>Ст. 395 ГК РФ — проценты за пользование чужими деньгами</li>
              <li>Ст. 330–333 ГК РФ — неустойка</li>
              <li>Ст. 208 ГПК РФ — индексация присуждённых сумм</li>
              <li>Ст. 236 ТК РФ — компенсация за задержку зарплаты</li>
              <li>Ст. 139 ТК РФ — расчёт отпускных (средний дневной заработок 29,3)</li>
              <li>Ст. 81 СК РФ — алименты на детей</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1">Жилищный кодекс и ЖКХ</p>
            <ul className="space-y-0.5 text-gray-700 list-disc list-inside">
              <li>Ч. 14 ст. 155 ЖК РФ — пени за ЖКУ (1/300 ключевой ставки)</li>
              <li>Ч. 14.1 ст. 155 ЖК РФ — пени для капремонта</li>
              <li>Постановление Правительства № 354 — порядок начисления</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1">Авто: пошлины и штрафы</p>
            <ul className="space-y-0.5 text-gray-700 list-disc list-inside">
              <li>Глава 12 КоАП РФ — штрафы ГИБДД (скидка 50% за 20 дней)</li>
              <li>ПП РФ № 1291 — утилизационный сбор</li>
              <li>Решения ЕЭК — пошлины на ввоз автомобилей</li>
              <li>Глава 28 НК РФ — транспортный налог</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3" aria-labelledby="what-can">
        <h2 id="what-can" className="text-base font-bold text-gray-900 flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-brand-500" />
          Что можно рассчитать
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <article>
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-indigo-500" /> Юридические</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Госпошлина в суд по любой категории дела, проценты за пользование чужими деньгами (ст. 395 ГК РФ), договорная и законная неустойка, компенсация за задержку зарплаты (ст. 236 ТК РФ), пени за ЖКХ и капремонт (ст. 155 ЖК РФ), алименты на детей, индексация присуждённых сумм. Расчёт задолженности и неустойки для претензии или искового заявления.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Финансы</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              НДС 22% (начислить или выделить), НДФЛ по прогрессивной шкале 13–22% с учётом стандартных, социальных и имущественных вычетов, страховые взносы ИП (фиксированная часть + 1% сверх 300 000 ₽), УСН «Доходы» 6% / «Доходы минус расходы» 15%, НПД (налог на профессиональный доход) 4–6%, отпускные по среднему заработку 29,3.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-amber-500" /> Авто и справочники</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              Транспортный налог по регионам и лошадиным силам, штрафы ГИБДД с проверкой скидки 50% (оплата в течение 20 дней), утилизационный сбор для физлиц и юрлиц, полная растаможка автомобиля (пошлина + акциз + НДС + утильсбор), КАСКО-квиз для оценки премии. Валидация ИНН, СНИЛС, ОГРН, БИК, номера банковской карты, контрольной суммы перевода. Сумма прописью для договоров и расписок.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3" aria-labelledby="how-to-use">
        <h2 id="how-to-use" className="text-base font-bold text-gray-900">Как использовать расчёты</h2>
        <ol className="text-sm text-gray-700 leading-relaxed space-y-2 list-decimal list-inside">
          <li>Выберите нужный калькулятор из списка выше (например, «Госпошлина» или «395 ГК»).</li>
          <li>Заполните обязательные поля — сумму иска, период просрочки, регион, тип заявления.</li>
          <li>Получите расчёт и сверьте его с актуальной редакцией закона (ссылки в блоке «Правовые основания»).</li>
          <li>Для досудебной претензии — сразу перейдите к конструктору: выберите шаблон «Претензия о взыскании» или «Исковое заявление», данные подставятся автоматически.</li>
          <li>При подаче в суд — приложите распечатку расчёта с указанием даты и источника ставок.</li>
        </ol>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-base font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className="group bg-gray-50 border border-gray-200 rounded-lg p-4 open:bg-white open:border-brand-200 transition-colors"
            >
              <summary className="cursor-pointer text-sm font-semibold text-gray-900 flex items-start gap-2 list-none">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1">{item.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-2 pl-7 text-sm text-gray-700 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 rounded-xl p-6 text-center space-y-3">
        <h2 className="text-base font-bold text-gray-900">Готовы составить документ по результатам расчёта?</h2>
        <p className="text-sm text-gray-700 max-w-2xl mx-auto">
          В конструкторе Договор-Эксперт доступны шаблоны претензий, исковых заявлений, досудебных уведомлений и расписок. Суммы, периоды и ставки из калькуляторов подставляются в шаблон автоматически.
        </p>
        <a
          href="/builder"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-semibold text-sm transition"
        >
          Перейти к конструктору документов →
        </a>
      </section>

      <p className="text-xs text-gray-500 text-center">
        Расчёты носят справочный характер. Окончательные суммы определяет суд или уполномоченный орган.
      </p>
    </div>
  );
}
