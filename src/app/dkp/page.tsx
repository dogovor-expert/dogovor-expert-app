import {
  Car,
  Check,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Printer,
  ScanLine,
  ShieldCheck,
  Download,
  Stamp,
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { renderTemplateDocument } from "@/lib/renderDocument";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/faq";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG (см. INVARIANTS.md).

const dkp = LEGAL_TEMPLATES.find((t) => t.id === "dkp-auto")!;

const DEMO_VALUES: Record<string, string> = {
  city: "Москва",
  date: "2026-08-14",
  copies_count: "3",
  seller_fio: "Иванов Иван Иванович",
  seller_passport_series: "4512",
  seller_passport_number: "123456",
  seller_passport_issued_by: "ОВД района «Тверской» города Москвы",
  seller_passport_code: "770-001",
  seller_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
  seller_phone: "+7 (900) 111-22-33",
  buyer_fio: "Петров Пётр Петрович",
  buyer_passport_series: "4615",
  buyer_passport_number: "987654",
  buyer_passport_issued_by: "ОВД района «Хамовники» города Москвы",
  buyer_passport_code: "770-022",
  buyer_address: "г. Москва, ул. Пушкина, д. 2, кв. 10",
  buyer_phone: "+7 (900) 444-55-66",
  car_brand: "Kia Rio",
  car_year: "2021",
  car_color: "Белый",
  car_vin: "Z94CB41ABMR123456",
  car_engine: "G4FL 123456",
  car_chassis: "—",
  car_plate: "А123ВС777",
  car_pts_type: "ПТС",
  car_pts: "78 УТ 456789",
  car_sts: "99 12 345678",
  contract_price: "1250000",
  contract_price_words: "один миллион двести пятьдесят тысяч рублей 00 копеек",
};

const demoHtml = renderTemplateDocument(dkp, DEMO_VALUES, {
  previewTemplate: TEMPLATE_PREVIEWS[dkp.id],
});

const STEPS = [
  {
    icon: Copy,
    title: "Заполните форму",
    text: "ФИО сторон, паспортные данные, автомобиль: марка, VIN, СТС и цена. Поля проверяются автоматически.",
  },
  {
    icon: ScanLine,
    title: "Проверьте документ",
    text: "Встроенный аудит подсветит ошибки: неверные серии паспорта, незаполненные обязательные поля.",
  },
  {
    icon: Printer,
    title: "Распечатайте и подпишите",
    text: "Экспорт в PDF или DOCX, печать на одном листе, 2–3 экземпляра по количеству сторон.",
  },
];

const INCLUDES = [
  "ФИО, паспорта и адреса продавца и покупателя",
  "Марка, модель, год, VIN, цвет и госномер ТС",
  "Номер ПТС или ЭПТС и свидетельства о регистрации",
  "Цена договора цифрами и прописью",
  "Оговорка о том, что ТС не в залоге и не под арестом",
  "Блоки подписей обеих сторон",
];

const FAQ = [
  {
    q: "Нужен ли нотариус для ДКП автомобиля?",
    a: "Нет. Сделка с физическими лицами заверяется простой письменной формой: обе стороны подписывают договор. Нотариальное заверение обязательно только при продаже доли в ТС, принадлежащем нескольким собственникам.",
  },
  {
    q: "Сколько экземпляров договора нужно?",
    a: "Обычно 3: по одному продавцу и покупателю, третий — при регистрации в ГИБДД (если продавец передаёт их новому владельцу). Форма позволяет выбрать 2 или 3 экземпляра.",
  },
  {
    q: "Что делать после подписания договора?",
    a: "Передать покупателю автомобиль, СТС, ПТС и ключи, получить деньги и в течение 10 дней собрать с покупателя подписанный договор — регистрацию в ГИБДД новый владелец оформляет самостоятельно.",
  },
  {
    q: "Можно ли указать любую цену в договоре?",
    a: "Да, цена определяется по соглашению сторон. Обратите внимание: при перепродаже по цене ниже рыночной у продавца могут возникнуть вопросы налоговой, а покупатель рискует при оспаривании сделки.",
  },
  {
    q: "Как проверить автомобиль перед покупкой?",
    a: "Сверьте VIN с ПТС и СТС, проверьте историю: розыск, залоги, ДТП, ограничения на регистрационные действия. Это можно сделать в разделе проверки истории автомобиля на этом сайте.",
  },
  {
    q: "Что считается моментом передачи ТС?",
    a: "Договор вступает в силу с момента подписания, но фактическая передача оформляется актом приёма-передачи. Его также можно сформировать здесь — он идёт дополнением к ДКП.",
  },
];

export default function DkpPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог шаблонов", path: "/templates" },
            { name: "Договор купли-продажи автомобиля (ДКП)", path: "/dkp" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 flex-shrink-0">
          <Car className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-700 mb-1">
            Бесплатно · Без регистрации · По ст. 454 ГК РФ
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Договор купли-продажи автомобиля (ДКП)
          </h1>
          <p className="text-sm text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
            Заполните форму — документ сформируется автоматически. Подходит для
            сделок между физическими лицами: легковые авто, мотоциклы и
            грузовики. Печать на одном листе А4, экспорт в PDF и DOCX.
          </p>
        </div>
        <a
          href="/builder?template=dkp-auto"
          className="sm:ml-auto inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition cursor-pointer flex-shrink-0"
        >
          Составить договор
          <ChevronRight className="w-4 h-4" />
        </a>
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: Clock, title: "5 минут", text: "на заполнение" },
          { icon: Stamp, title: "3 экземпляра", text: "для сторон и ГИБДД" },
          { icon: ShieldCheck, title: "0 рублей", text: "нотариус не нужен" },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white border border-gray-200 rounded-xl py-4 px-2"
          >
            <f.icon className="w-5 h-5 mx-auto text-indigo-500" />
            <p className="text-sm font-bold text-gray-900 mt-1.5">{f.title}</p>
            <p className="text-[11px] text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Как выглядит документ
          </h2>
          <span className="text-[10px] font-mono uppercase text-gray-600">
            Пример данных
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Это демонстрация с образцом данных — при заполнении формы подставятся
          ваши значения.
        </p>
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
          <div className="max-h-[540px] overflow-auto rounded-lg bg-white shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: demoHtml }} />
          </div>
        </div>
        <a
          href="/builder?template=dkp-auto"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          Заполнить своими данными
          <ChevronRight className="w-4 h-4" />
        </a>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Как это работает
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-indigo-500" />
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Что входит в договор
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <ul className="space-y-2.5">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Частые вопросы
        </h2>
        <div className="space-y-2.5">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group bg-white border border-gray-200 rounded-xl px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer text-sm font-semibold text-gray-800 list-none">
                {f.q}
                <ChevronRight className="w-4 h-4 text-gray-600 transition-transform group-open:rotate-90 flex-shrink-0" />
              </summary>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-indigo-600 rounded-2xl px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-white">
          Составьте договор за 5 минут
        </h2>
        <p className="text-sm text-indigo-200 mt-1.5 max-w-xl mx-auto">
          Никакой регистрации: откройте форму, введите данные сторон и
          автомобиля — документ готов к печати.
        </p>
        <a
          href="/builder?template=dkp-auto"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 font-bold text-sm transition cursor-pointer"
        >
          Составить договор бесплатно
          <ChevronRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}