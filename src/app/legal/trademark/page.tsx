import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";
import { SITE_URL } from "@/lib/site";
import { ShieldCheck, AlertTriangle, Mail, BookOpen, Globe } from "lucide-react";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = withSeo({
  path: "/legal/trademark",
  title: "Товарный знак Dogovor-Эксперт™ — правила использования",
  description:
    "Товарный знак Dogovor-Эксперт™ принадлежит ООО «Договор-Эксперт». Правила использования, разрешённые случаи и контакты для согласования. Запрещено несанкционированное коммерческое использование.",
});

/**
 * Страница с правилами использования товарного знака.
 *
 * Контент носит информационный характер: до получения свидетельства Роспатента
 * используется символ ™ (право на основании ст. 6 Закона о товарных знаках — факт
 * использования в РФ). После регистрации — ® с указанием номера.
 *
 * Структура:
 *  1. Что защищено (словесный знак, логотип, домен)
 *  2. Что можно без согласования (ссылки, упоминания в прессе, некоммерческие обзоры)
 *  3. Что нельзя (использование в своих сервисах, реклама, дропшиппинг, пародии)
 *  4. Контакты для согласования
 */
export default function TrademarkPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Товарный знак Dogovor-Эксперт™</h1>
        </div>
        <p className="text-sm text-gray-600">
          Правила использования и контакты для согласования. Последнее обновление: {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      </header>

      {/* Что защищено */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          Что является товарным знаком
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Обозначение <b>«Dogovor-Эксперт»</b> (кириллица и латиница: <i>Dogovor.expert</i>, <i>Dogovor-Expert</i>, <i>Договор-Эксперт</i>) и связанные с ним графические элементы (логотип с буквой «D» в градиентной плашке, цветовая схема brand-500/purple-600) используются как средства индивидуализации сервиса автоматизированной подготовки юридических документов,           расположенного по адресу <a href={SITE_URL} className="text-brand-600 hover:underline">dogovor.expert</a>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          В настоящее время товарный знак используется на основании факта применения в гражданском обороте на территории Российской Федерации (ст. 6 Закона о товарных знаках — приоритет по дате использования). Ведётся подготовка заявки в Роспатент (классы МКТУ 9, 35, 38, 42, 45). После получения свидетельства обозначение будет использоваться с символом ® и указанием номера.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          <b>Не являются товарным знаком:</b> общеупотребительные слова «договор», «эксперт», «конструктор документов», «шаблон договора» — они могут свободно использоваться в своей продукции, если не создаётся смешение с нашим сервисом.
        </p>
      </section>

      {/* Что можно */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          Что можно без согласования
        </h2>
        <ul className="text-sm text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
          <li>Ссылаться на наш сервис в публикациях, обзорах, подкастах, видео (в том числе с использованием логотипа и скриншотов интерфейса).</li>
          <li>Размещать на своём сайте текстовую ссылку вида «Создать договор на Dogovor.expert» с гиперссылкой на главную или конкретный шаблон.</li>
          <li>Упоминать сервис в новостных и аналитических материалах, в том числе в негативном ключе (добросовестное использование, ст. 1229 ГК РФ).</li>
          <li>Делиться скриншотами в социальных сетях и мессенджерах с указанием источника.</li>
        </ul>
      </section>

      {/* Что нельзя */}
      <section className="bg-white border border-amber-200 bg-amber-50/30 rounded-xl p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Что нельзя без письменного согласия
        </h2>
        <ul className="text-sm text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
          <li>Использовать название «Dogovor-Эксперт», «Договор-Эксперт», «Dogovor.expert» (и созвучные варианты) в названии своего сервиса, мобильного приложения, Telegram-бота, канала в соцсетях.</li>
          <li>Размещать логотип «D» в фирменной плашке на своих материалах (реклама, визитки, упаковка, сайт) — даже со ссылкой на нас.</li>
          <li>Создавать сайты-зеркала, пародийные клоны или агрегаторы, использующие наш бренд для привлечения трафика.</li>
          <li>Продавать «франшизу Dogovor-Эксперт», «партнёрские аккаунты», «прокси-доступ к Dogovor.expert».</li>
          <li>Регистрировать доменные имена второго уровня с корнем «dogovor-expert», «dogovorexpert», «dgev» в любых зонах (.ru, .com, .app и т. д.) — мы оставляем за собой право на защиту в UDRP/ПРИБ и в суде.</li>
        </ul>
        <p className="text-sm text-gray-700 leading-relaxed pt-2">
          За нарушение этих правил предусмотрена ответственность по ст. 1515 ГК РФ: возмещение убытков или выплата компенсации в размере до 5 000 000 ₽ (либо в двукратном размере стоимости товаров/услуг, на которых размещён товарный знак).
        </p>
      </section>

      {/* Контакты */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-500" />
          Согласование и сообщения о нарушениях
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          По вопросам согласования коммерческого использования товарного знака (партнёрство, рекламные материалы, интеграции) пишите на <a href="mailto:legal@dogovor.expert" className="text-brand-600 hover:underline">legal@dogovor.expert</a>. Срок ответа — 5 рабочих дней.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Если вы обнаружили нарушение прав на товарный знак (поддельный сайт, пародийный клон, несанкционированное использование логотипа) — также пишите на <a href="mailto:legal@dogovor.expert" className="text-brand-600 hover:underline">legal@dogovor.expert</a> с темой «Нарушение ТЗ» и ссылкой на материал. Претензии рассматриваются в приоритетном порядке.
        </p>
      </section>

      <p className="text-xs text-gray-500 text-center">
        Товарный знак «Dogovor-Эксперт»™. Все упомянутые товарные знаки и сервисы являются собственностью их владельцев.
      </p>
    </div>
  );
}
