import type { LegalTemplate } from "../types";

export const TEMPLATES_LEGAL: LegalTemplate[] = [
{
      id: "claim-letter",
    name: "Досудебная претензия по договору",
    category: "legal",
    actSource: "ст. 452, 483 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Претензия контрагенту: нарушение сроков, качества, оплаты. Требование с сроком ответа — обязательный этап до суда.",
    suggestedDocs: ["lawsuit-statement"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата претензии", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "sender_fio", label: "Ваши ФИО / организация", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "sender_address", label: "Ваш адрес", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "buyer" },
      { id: "recipient_company", label: "Кому (организация / ФИО)", type: "text", defaultValue: "ООО «СтройГарант»", category: "seller", validation: { required: true } },
      { id: "recipient_director", label: "Руководитель (если есть)", type: "text", defaultValue: "Иванов Иван Иванович", category: "seller" },
      { id: "recipient_address", label: "Адрес получателя", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 10", category: "seller" },
      { id: "contract_number", label: "№ договора", type: "text", defaultValue: "Д-45/2026", category: "contract" },
      { id: "contract_date", label: "Дата договора", type: "date", defaultValue: "2026-05-15", category: "contract" },
      { id: "subject", label: "Предмет договора", type: "text", defaultValue: "выполнение ремонтных работ", category: "contract" },
      { id: "violation_note", label: "В чём нарушение", type: "textarea", defaultValue: "работы не выполнены в срок, предусмотренный договором (п. 3.1)", category: "contract", rows: 2, validation: { required: true } },
      { id: "demand", label: "Ваше требование", type: "textarea", defaultValue: "выполнить работы в полном объёме и передать результат в течение 10 календарных дней", category: "contract", rows: 2, validation: { required: true } },
      { id: "amount", label: "Сумма требования (если денежное)", type: "text", defaultValue: "", category: "contract" },
      { id: "answer_days", label: "Срок ответа (дней)", type: "number", defaultValue: "10", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-8 text-xs font-semibold">
    <div class="w-1/2">
      <p class="font-bold">{{{recipient_company}}}</p>
      {{{#recipient_director}}}<p>{{{recipient_director}}}</p>{{{/recipient_director}}}
      <p>{{{recipient_address}}}</p>
    </div>
    <div class="w-1/2 text-left">
      <p>от: {{{sender_fio}}}</p>
      <p>адрес: {{{sender_address}}}</p>
      <p>тел.: ______________</p>
    </div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Претензия</div>
  <p class="mb-4 text-justify">
    Между мной и {{{recipient_company}}} заключён договор от {{{contract_date}}} № {{{contract_number}}}
    на {{{subject}}}.
  </p>
  <p class="mb-4 text-justify">
    Условия договора нарушены: {{{violation_note}}}.
  </p>
  <p class="mb-4 text-justify font-bold">На основании ст. 452, 483 ГК РФ требую:</p>
  <p class="mb-4 text-justify">
    {{{demand}}}. {{{#amount}}}В связи с этим прошу уплатить {{{amount}}} руб.{{{/amount}}}
  </p>
  <p class="mb-4 text-justify">
    Ответ прошу направить в течение {{{answer_days}}} календарных дней с момента получения настоящей претензии.
    В случае неудовлетворения требований я буду вынужден обратиться в суд с иском, а также взыскать
    неустойку, убытки и судебные расходы.
  </p>
  <div class="flex justify-end text-xs mt-10">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}» г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{sender_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
  },
{
      id: "lawsuit-statement",
    name: "Исковое заявление о взыскании долга",
    category: "legal",
    actSource: "ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Иск о взыскании долга по договору или расписке: сумма, неустойка, госпошлина, расчёт.",
    suggestedDocs: ["claim-letter"],
    fields: [
      { id: "court_name", label: "Наименование суда", type: "text", defaultValue: "Тверской районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 10", category: "court" },
      { id: "plaintiff_fio", label: "Истец (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "plaintiff_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "buyer" },
      { id: "plaintiff_phone", label: "Телефон истца", type: "text", defaultValue: "+7 (900) 123-45-67", category: "buyer" },
      { id: "defendant_fio", label: "Ответчик (ФИО)", type: "text", defaultValue: "Сидоров Сидор Сидорович", category: "seller", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 3, кв. 45", category: "seller" },
      { id: "base_doc", label: "Основание долга (договор/расписка)", type: "text", defaultValue: "расписка от 01.06.2026", category: "contract" },
      { id: "base_doc_date", label: "Дата документа", type: "date", defaultValue: "2026-06-01", category: "contract" },
      { id: "debt_amount", label: "Сумма долга (руб.)", type: "text", defaultValue: "500000", category: "contract", validation: { required: true } },
      { id: "return_date", label: "Срок возврата (дата)", type: "date", defaultValue: "2026-07-01", category: "contract" },
      { id: "penalty", label: "Неустойка / проценты (руб.)", type: "text", defaultValue: "15000", category: "contract" },
      { id: "legal_costs", label: "Судебные расходы (руб.)", type: "text", defaultValue: "5000", category: "contract" },
      { id: "legal_costs_note", label: "Из чего расходы", type: "text", defaultValue: "услуги юриста по составлению иска", category: "contract" },
      { id: "city", label: "Город подачи", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-10", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center text-xs font-semibold mb-4">
    <p>В {{{court_name}}}</p>
    {{{#court_address}}}<p>адрес суда: {{{court_address}}}</p>{{{/court_address}}}
  </div>
  <div class="mb-6 text-xs font-semibold">
    <p>Истец: {{{plaintiff_fio}}}</p>
    <p>адрес: {{{plaintiff_address}}}</p>
    {{{#plaintiff_phone}}}<p>тел.: {{{plaintiff_phone}}}</p>{{{/plaintiff_phone}}}
    <p class="mt-2">Ответчик: {{{defendant_fio}}}</p>
    <p>адрес: {{{defendant_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о взыскании долга</div>
  <p class="mb-4 text-justify">
    {{{base_doc_date}}} года я передал {{{defendant_fio}}} денежные средства в размере
    <strong>{{{debt_amount}}} руб.</strong>, что подтверждается {{{base_doc}}}.
  </p>
  <p class="mb-4 text-justify">
    По условиям {{{base_doc}}} ответчик обязался вернуть долг до {{{return_date}}}, однако до настоящего
    времени денежные средства не возвращены. {{{#penalty}}}За просрочку возврата подлежат уплате проценты
    в размере {{{penalty}}} руб.{{{/penalty}}}
  </p>
  <p class="mb-4 text-justify">На основании ст. 309, 310, 807-810 ГК РФ, руководствуясь ст. 131, 132 ГПК РФ, прошу:</p>
  <p class="mb-2 text-justify">1. Взыскать с {{{defendant_fio}}} в мою пользу сумму долга в размере {{{debt_amount}}} руб.;</p>
  {{{#penalty}}}<p class="mb-2 text-justify">2. Взыскать неустойку в размере {{{penalty}}} руб.;</p>{{{/penalty}}}
  {{{#legal_costs}}}<p class="mb-4 text-justify">{{{penalty}}}3. Взыскать судебные расходы в размере {{{legal_costs}}} руб.{{{/legal_costs}}}</p>
  <p class="mb-6 text-justify">
    {{{#legal_costs}}}<span>Судебные расходы: {{{legal_costs_note}}}.</span>{{{/legal_costs}}}
    Цена иска: {{{debt_amount}}} руб. Государственная пошлина: __________ руб.
  </p>
  <div class="mb-6 text-xs">
    <p>Приложения:</p>
    <p>1. Копия {{{base_doc}}};</p>
    <p>2. Расчёт цены иска;</p>
    <p>3. Квитанция об уплате госпошлины;</p>
    <p>4. Копия искового заявления для ответчика.</p>
  </div>
  <div class="flex justify-end text-xs">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}» г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{plaintiff_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "claim-generic",
    name: "Претензия (универсальная)",
    category: "legal",
    actSource: "ст. 4 АПК РФ, ст. 132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Универсальная досудебная претензия к контрагенту: требование об исполнении обязательства, возврате денег, уплате неустойки.",
    suggestedDocs: ["claim-letter", "lawsuit-statement"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "sender_fio", label: "Кредитор (ФИО/название)", type: "text", defaultValue: "ООО «Кредитор»", category: "sender", validation: { required: true } },
      { id: "sender_inn", label: "ИНН кредитора", type: "text", defaultValue: "7705556677", category: "sender" },
      { id: "recipient_fio", label: "Должник (ФИО/название)", type: "text", defaultValue: "ООО «Должник»", category: "recipient", validation: { required: true } },
      { id: "recipient_inn", label: "ИНН должника", type: "text", defaultValue: "7701112223", category: "recipient" },
      { id: "base_doc", label: "Основание (договор/событие)", type: "text", defaultValue: "договор поставки № 25 от 01.03.2026", category: "contract", validation: { required: true } },
      { id: "violation", label: "Нарушение", type: "textarea", defaultValue: "не поставлен товар на сумму 350000 руб. в срок до 01.07.2026", category: "contract", rows: 2, validation: { required: true } },
      { id: "demand", label: "Требование", type: "textarea", defaultValue: "поставить товар в течение 10 дней либо вернуть предоплату 350000 руб. и уплатить неустойку 0,1% в день", category: "contract", rows: 2, validation: { required: true } },
      { id: "deadline", label: "Срок исполнения требования", type: "text", defaultValue: "10 рабочих дней с даты получения претензии", category: "contract" },
      { id: "consequences", label: "Последствия неисполнения", type: "text", defaultValue: "обращение в суд с требованием о взыскании долга, неустойки и судебных расходов", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>{{{recipient_fio}}}</p>
    <p>ИНН {{{recipient_inn}}}</p>
    <p class="mt-2">от {{{sender_fio}}}</p>
    <p>ИНН {{{sender_inn}}}</p>
    <p class="mt-2">исх. № ___ от «{{{date}}}»</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Претензия</div>
  <p class="mb-4 text-justify">
    Между {{{sender_fio}}} и {{{recipient_fio}}} заключён {{{base_doc}}}.
  </p>
  <p class="mb-4 text-justify">
    Вашей организацией нарушены условия обязательства: {{{violation}}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 309, 310 ГК РФ, требую: {{{demand}}}.
  </p>
  <p class="mb-4 text-justify">
    Прошу исполнить требование в срок {{{deadline}}}.
  </p>
  <p class="mb-4 text-justify">
    В случае неисполнения настоящей претензии {{{consequences}}}. Досудебный порядок урегулирования спора является обязательным (ст. 4 АПК РФ).
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">{{{sender_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "court-order-app",
    name: "Заявление о выдаче судебного приказа",
    category: "legal",
    actSource: "ст. 121-130 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление о выдаче судебного приказа о взыскании денежных сумм по бесспорным требованиям (долг, алименты, задолженность).",
    suggestedDocs: ["lawsuit-statement", "claim-generic"],
    fields: [
      { id: "court_name", label: "Мировой суд", type: "text", defaultValue: "мировому судье судебного участка № 1 Тверского района г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "г. Москва, ул. 1-я Тверская-Ямская, д. 2", category: "court" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "claimant_fio", label: "Взыскатель", type: "text", defaultValue: "Иванов Иван Иванович", category: "applicant", validation: { required: true } },
      { id: "claimant_address", label: "Адрес взыскателя", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "applicant" },
      { id: "defendant_fio", label: "Должник", type: "text", defaultValue: "Петров Пётр Петрович", category: "recipient", validation: { required: true } },
      { id: "defendant_address", label: "Адрес должника", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 3, кв. 45", category: "recipient" },
      { id: "claim_amount", label: "Сумма требования (руб.)", type: "text", defaultValue: "150000", category: "payment", validation: { required: true } },
      { id: "base_doc", label: "Основание", type: "textarea", defaultValue: "договор займа от 10.02.2026, денежные средства в срок не возвращены", category: "contract", rows: 2, validation: { required: true } },
      { id: "proof", label: "Доказательства", type: "text", defaultValue: "расписка от 10.02.2026, выписка по счёту", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>В {{{court_name}}}</p>
    <p>{{{court_address}}}</p>
    <p class="mt-2">Взыскатель: {{{claimant_fio}}}</p>
    <p>адрес: {{{claimant_address}}}</p>
    <p class="mt-2">Должник: {{{defendant_fio}}}</p>
    <p>адрес: {{{defendant_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о выдаче судебного приказа</div>
  <p class="mb-4 text-justify">
    {{{base_doc}}}. Сумма задолженности составляет <strong>{{{claim_amount}} руб.</strong>} ({{{claim_amount_words}}}).
  </p>
  <p class="mb-4 text-justify">
    Доказательства: {{{proof}}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 121-126 ГПК РФ прошу выдать судебный приказ о взыскании с {{{defendant_fio}}} в пользу {{{claimant_fio}}} денежных средств в размере {{{claim_amount}}} руб., а также расходов по уплате государственной пошлины.
  </p>
  <p class="mb-6 text-justify">
    Приложения: 1) копия {{{base_doc}}}; 2) расчёт задолженности; 3) квитанция об уплате госпошлины; 4) копия заявления для должника.
  </p>
  <div class="flex justify-end text-xs">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}»</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{claimant_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "refund-claim",
    name: "Претензия на возврат товара",
    category: "legal",
    actSource: "ст. 18-24 Закона «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description: "Претензия продавцу о возврате денег за товар ненадлежащего качества: недостатки, требование, сроки возврата.",
    suggestedDocs: ["claim-generic", "retail-sale"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "seller_fio", label: "Продавец", type: "text", defaultValue: "ООО «Магазин Техники»", category: "seller", validation: { required: true } },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 1", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "buyer_phone", label: "Телефон покупателя", type: "text", defaultValue: "+7 (900) 123-45-67", category: "buyer" },
      { id: "goods_desc", label: "Товар", type: "text", defaultValue: "холодильник LG GA-B419, серийный номер 12345", category: "items", validation: { required: true } },
      { id: "purchase_date", label: "Дата покупки", type: "date", defaultValue: "2026-05-15", category: "contract" },
      { id: "goods_price", label: "Цена (руб.)", type: "text", defaultValue: "65000", category: "payment", validation: { required: true } },
      { id: "defects", label: "Недостатки", type: "textarea", defaultValue: "не работает компрессор, товар не охлаждает", category: "items", rows: 2, validation: { required: true } },
      { id: "demand_type", label: "Требование", type: "select", defaultValue: "возврат денежных средств", category: "contract", options: [
        { label: "Возврат денежных средств", value: "возврат денежных средств" },
        { label: "Замена товара", value: "замена товара" },
        { label: "Бесплатный ремонт", value: "бесплатный ремонт" },
        { label: "Соразмерное уменьшение цены", value: "соразмерное уменьшение цены" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>{{{seller_fio}}}</p>
    <p>адрес: {{{seller_address}}}</p>
    <p class="mt-2">от {{{buyer_fio}}}</p>
    <p>тел.: {{{buyer_phone}}}</p>
    <p class="mt-2">исх. № ___ от «{{{date}}}»</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Претензия о возврате товара</div>
  <p class="mb-4 text-justify">
    «{{{purchase_date}}}» я приобрёл(а) у Вас товар: {{{goods_desc}}}, стоимостью <strong>{{{goods_price}} руб.</strong>}, что подтверждается кассовым чеком.
  </p>
  <p class="mb-4 text-justify">
    В процессе эксплуатации обнаружен недостаток: {{{defects}}}, что делает невозможным использование товара по назначению.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 18 Закона «О защите прав потребителей» требую: {{{demand_type}}} в течение 10 дней с даты получения настоящей претензии.
  </p>
  <p class="mb-4 text-justify">
    Товар готов передать для проверки качества. В случае неудовлетворения требования буду вынужден(а) обратиться в суд с требованием о возврате денежных средств, неустойки и компенсации морального вреда.
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">{{{buyer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "debt-lawsuit",
    name: "Исковое заявление о взыскании задолженности",
    category: "legal",
    actSource: "ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Исковое заявление в суд о взыскании задолженности по договору: долг, неустойка, проценты, судебные расходы.",
    suggestedDocs: ["lawsuit-statement", "claim-generic"],
    fields: [

      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "court_name", label: "Суд", type: "text", defaultValue: "Тверской районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "г. Москва, ул. Цветной бульвар, д. 25", category: "court" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "plaintiff_fio", label: "Истец", type: "text", defaultValue: "ООО «Кредитор»", category: "applicant", validation: { required: true } },
      { id: "plaintiff_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 1", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "ООО «Должник»", category: "recipient", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 3", category: "recipient" },
      { id: "debt_amount", label: "Сумма долга (руб.)", type: "text", defaultValue: "750000", category: "payment", validation: { required: true } },
      { id: "base_doc", label: "Основание", type: "textarea", defaultValue: "договор оказания услуг № 15 от 01.03.2026, акты оказанных услуг, счёт на оплату", category: "contract", rows: 2, validation: { required: true } },
      { id: "penalty_amount", label: "Неустойка (руб.)", type: "text", defaultValue: "45000", category: "payment" },
      { id: "claim_total", label: "Цена иска (руб.)", type: "text", defaultValue: "795000", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>В {{{court_name}}}</p>
    <p>адрес: {{{court_address}}}</p>
    <p class="mt-2">Истец: {{{plaintiff_fio}}}</p>
    <p>адрес: {{{plaintiff_address}}}</p>
    <p class="mt-2">Ответчик: {{{defendant_fio}}}</p>
    <p>адрес: {{{defendant_address}}}</p>
    <p class="mt-2">Цена иска: {{{claim_total}}} руб.</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о взыскании задолженности</div>
  <p class="mb-4 text-justify">
    Между истцом и ответчиком заключён {{{base_doc}}}. Истец исполнил обязательства в полном объёме.
  </p>
  <p class="mb-4 text-justify">
    Ответчик обязательства по оплате не исполнил, задолженность составляет <strong>{{{debt_amount}} руб.</strong>} ({{{debt_amount_words}}}). {{{#penalty_amount}}}За просрочку оплаты подлежит уплате неустойка в размере {{{penalty_amount}}} руб.{{{/penalty_amount}}}
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 309, 310, 330, 779 ГК РФ, ст. 131, 132 ГПК РФ прошу:
  </p>
  <p class="mb-2 text-justify">1. Взыскать с {{{defendant_fio}}} в пользу {{{plaintiff_fio}}} задолженность в размере {{{debt_amount}}} руб.;</p>
  {{{#penalty_amount}}}<p class="mb-2 text-justify">2. Взыскать неустойку в размере {{{penalty_amount}}} руб.;</p>{{{/penalty_amount}}}
  <p class="mb-6 text-justify">3. Взыскать судебные расходы по уплате государственной пошлины.</p>
  <p class="mb-6 text-justify">
    Приложения: копии договора, актов, счёта, расчёт задолженности, квитанция об уплате госпошлины, копия иска для ответчика.
  </p>
  <div class="flex justify-end text-xs">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}» г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{plaintiff_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "objection-debt-claim",
    name: "Возражение на исковое заявление о взыскании задолженности",
    category: "legal",
    actSource: "ст. 149 АПК РФ, ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Возражения ответчика на исковое заявление о взыскании задолженности по договору.",
    suggestedDocs: ["Исковое заявление о взыскании задолженности", "Исковое заявление о взыскании долга"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "court_name", label: "Суд", type: "text", defaultValue: "Арбитражный суд г. Москвы", category: "court" },
      { id: "plaintiff_org", label: "Истец", type: "text", defaultValue: "ООО «Кредитор»", category: "contract" },
      { id: "defendant_org", label: "Ответчик", type: "text", defaultValue: "ООО «Должник»", category: "contract" },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "А40-12345/2026", category: "court" },
      { id: "objection_reason", label: "Доводы возражения", type: "textarea", defaultValue: "истцом не соблюдён досудебный порядок, услуги оказаны в полном объёме, задолженность отсутствует", category: "contract" },
      { id: "evidence", label: "Доказательства", type: "text", defaultValue: "акты оказанных услуг, платёжные поручения", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Возражение на исковое заявление</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">В <strong>{{{court_name}}}</strong></p>
  <p class="mb-4 text-justify">По делу № {{{case_number}}}. Истец: {{{plaintiff_org}}}. Ответчик: {{{defendant_org}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Возражения</div>
  <p class="mb-4 text-justify">1. Истец заявил о взыскании задолженности, однако: {{{objection_reason}}}.</p>
  <p class="mb-4 text-justify">2. В подтверждение возражений ответчик представляет: {{{evidence}}} (ст. 131-132 ГПК РФ).</p>
  <p class="mb-4 text-justify">3. На основании изложенного просим суд отказать в удовлетворении исковых требований в полном объёме.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Ответчик: {{{defendant_org}}}</p>
    <p class="text-zinc-500 text-[11px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "divorce-lawsuit",
    name: "Исковое заявление о расторжении брака и взыскании алиментов",
    category: "legal",
    actSource: "ст. 21-23 СК РФ, ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Исковое заявление в мировой суд о расторжении брака и взыскании алиментов на ребёнка: реквизиты суда и сторон, основания, требования, приложения (ст. 21 СК, ст. 131 ГПК).",
    suggestedDocs: ["alimony-agreement", "property-division"],
    printInstruction: "Печать на листе А4; госпошлина 600 руб. (ст. 333.19 НК РФ), при взыскании алиментов пошлина не уплачивается (пп. 15 п. 1 ст. 333.36 НК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Мировой судья судебного участка № 123 района «Тверской» г. Москвы", category: "court", validation: { required: true } },
      { id: "plaintiff_fio", label: "Истец (ФИО)", type: "text", defaultValue: "Смирнова Анна Ивановна", category: "applicant", validation: { required: true } },
      { id: "plaintiff_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 10, кв. 5", category: "applicant" },
      { id: "plaintiff_phone", label: "Телефон истца", type: "text", defaultValue: "+7 (900) 123-45-67", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик (ФИО)", type: "text", defaultValue: "Смирнов Пётр Петрович", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Пушкина, д. 20, кв. 8", category: "other" },
      { id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "2018-06-15", category: "family" },
      { id: "marriage_place", label: "Орган ЗАГС", type: "text", defaultValue: "ЗАГС «Тверской» г. Москвы", category: "family" },
      { id: "children_info", label: "Дети (ФИО, даты рождения)", type: "textarea", defaultValue: "Смирнова Мария Петровна, 12.03.2019 г.р.; Смирнов Алексей Петрович, 05.07.2022 г.р.", category: "child", rows: 2, validation: { required: true } },
      { id: "divorce_reason", label: "Причины расторжения брака", type: "textarea", defaultValue: "семейные отношения прекращены, общее хозяйство не ведётся, примирение невозможно", category: "family", rows: 2 },
      { id: "alimony_claim", label: "Требование об алиментах", type: "select", defaultValue: "1/3 заработка на двух детей", category: "family", options: [
        { label: "1/4 заработка на одного ребёнка", value: "1/4 заработка на одного ребёнка" },
        { label: "1/3 заработка на двух детей", value: "1/3 заработка на двух детей" },
        { label: "1/2 заработка на трёх и более детей", value: "1/2 заработка на трёх и более детей" },
      ] },
      { id: "alimony_start", label: "С какого момента взыскивать алименты", type: "text", defaultValue: "с момента подачи искового заявления", category: "family" },
      { id: "attachments", label: "Приложения", type: "textarea", defaultValue: "свидетельство о заключении брака, свидетельства о рождении детей, справка о доходах истца, копия иска для ответчика, квитанция об уплате госпошлины", category: "other", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о расторжении брака и взыскании алиментов</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">В <strong>{{{court_name}}}</strong></p>
  <p class="mb-1 text-justify">Истец: {{{plaintiff_fio}}}, адрес: {{{plaintiff_address}}}, тел. {{{plaintiff_phone}}}</p>
  <p class="mb-1 text-justify">Ответчик: {{{defendant_fio}}}, адрес: {{{defendant_address}}}</p>
  <p class="mb-4 text-justify">Цена иска: _______________ руб. (размер алиментов за год)</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Исковое заявление</div>
  <p class="mb-3 text-justify">1. «{{{marriage_date}}}» между Истцом и Ответчиком зарегистрирован брак ({{{marriage_place}}}). От брака имеются дети: {{{children_info}}}.</p>
  <p class="mb-3 text-justify">2. {{{divorce_reason}}} (ст. 21 СК РФ).</p>
  <p class="mb-3 text-justify">3. Дети проживают с Истцом и находятся на его иждивении; Ответчик участия в содержании детей не принимает (ст. 80 СК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">На основании изложенного прошу:</div>
  <p class="mb-3 text-justify">1) расторгнуть брак между Истцом и Ответчиком, зарегистрированный {{{marriage_date}}};</p>
  <p class="mb-3 text-justify">2) взыскать с Ответчика алименты на содержание детей в размере {{{alimony_claim}}} начиная с {{{alimony_start}}} (ст. 81 СК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attachments}}}.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Истец: {{{plaintiff_fio}}}</p>
    <p class="text-zinc-500 text-[11px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "consumer-lawsuit",
    name: "Исковое заявление о защите прав потребителей",
    category: "legal",
    actSource: "Закон РФ «О защите прав потребителей», ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Иск потребителя: недостатки товара/услуги, требования (возврат денег, неустойка, компенсация морального вреда). Подсудность — по выбору истца (ст. 17), госпошлина до 1 млн руб. не уплачивается.",
    suggestedDocs: ["refund-claim", "claim-generic"],
    printInstruction: "Печать на листе А4; иск подаётся в суд по выбору истца (ст. 17 ЗоЗПП); госпошлина при цене иска до 1 млн руб. не уплачивается",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Тверской районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "plaintiff_fio", label: "Истец (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "applicant", validation: { required: true } },
      { id: "plaintiff_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Пушкина, д. 20, кв. 8", category: "applicant" },
      { id: "plaintiff_phone", label: "Телефон истца", type: "text", defaultValue: "+7 (900) 123-45-67", category: "applicant" },
      { id: "defendant_org", label: "Ответчик (продавец/исполнитель)", type: "text", defaultValue: "ООО «МагазинТехники»", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 1", category: "other" },
      { id: "defendant_inn", label: "ИНН ответчика", type: "text", defaultValue: "7701234567", category: "other" },
      { id: "product_desc", label: "Товар/услуга", type: "text", defaultValue: "стиральная машина Bosch WLL24266, стоимостью 45 000 руб., приобретена 01.06.2026 по чеку № 1234", category: "items", validation: { required: true } },
      { id: "defect_desc", label: "Недостатки", type: "textarea", defaultValue: "не работает отжим, появился посторонний шум, недостаток выявлен на 5-й день эксплуатации", category: "items", rows: 2, validation: { required: true } },
      { id: "claim_date", label: "Дата досудебной претензии", type: "date", defaultValue: "2026-07-10", category: "contract" },
      { id: "price", label: "Цена товара (руб.)", type: "text", defaultValue: "45000", category: "payment", validation: { required: true } },
      { id: "penalty_rate", label: "Неустойка (1% в день, ст. 23 ЗоЗПП)", type: "text", defaultValue: "1% от цены товара за каждый день просрочки", category: "payment" },
      { id: "claims_list", label: "Исковые требования", type: "textarea", defaultValue: "1) расторгнуть договор купли-продажи; 2) взыскать уплаченные 45 000 руб.; 3) взыскать неустойку 1% в день с 20.07.2026; 4) компенсацию морального вреда 10 000 руб.; 5) штраф 50% (п. 6 ст. 13 ЗоЗПП)", category: "items", rows: 3, validation: { required: true } },
      { id: "attachments", label: "Приложения", type: "textarea", defaultValue: "копия чека, копия претензии, акт сервисного центра, расчёт неустойки, копии иска", category: "other", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о защите прав потребителей</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">В <strong>{{{court_name}}}</strong></p>
  <p class="mb-1 text-justify">Истец: {{{plaintiff_fio}}}, адрес: {{{plaintiff_address}}}, тел. {{{plaintiff_phone}}}</p>
  <p class="mb-4 text-justify">Ответчик: {{{defendant_org}}}, адрес: {{{defendant_address}}}, ИНН {{{defendant_inn}}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Исковое заявление</div>
  <p class="mb-3 text-justify">1. «{{{date}}}» истец приобрёл товар: {{{product_desc}}}. Стоимость: {{{price}}} руб. (ст. 454, 492 ГК РФ).</p>
  <p class="mb-3 text-justify">2. В процессе эксплуатации выявлены недостатки: {{{defect_desc}}} (ст. 18 ЗоЗПП).</p>
  <p class="mb-3 text-justify">3. «{{{claim_date}}}» ответчику направлена досудебная претензия, требования не удовлетворены.</p>
  <p class="mb-3 text-justify">4. Неустойка за просрочку удовлетворения требований: {{{penalty_rate}}} (ст. 23 ЗоЗПП).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">На основании изложенного прошу (ст. 17 ЗоЗПП):</div>
  <p class="mb-3 text-justify">{{{claims_list}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attachments}}}. Госпошлина при цене иска до 1 млн руб. не уплачивается (п. 3 ст. 17 ЗоЗПП).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Истец: {{{plaintiff_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "appeal-complaint",
    name: "Апелляционная жалоба",
    category: "legal",
    actSource: "ст. 320-322 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Апелляционная жалоба на решение суда первой инстанции: реквизиты суда, решение, на которое подаётся, доводы, требования. Срок подачи — 1 месяц (ст. 321 ГПК РФ).",
    suggestedDocs: ["debt-lawsuit", "divorce-lawsuit"],
    printInstruction: "Печать на листе А4; срок подачи — 1 месяц со дня принятия решения в окончательной форме (ст. 321 ГПК РФ); прикладываются копии по числу лиц",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "court_name", label: "Апелляционный суд", type: "text", defaultValue: "Московский городской суд", category: "court", validation: { required: true } },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "2-1234/2026", category: "court" },
      { id: "appellant_fio", label: "Заявитель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "applicant", validation: { required: true } },
      { id: "appellant_status", label: "Процессуальное положение", type: "text", defaultValue: "ответчик", category: "applicant" },
      { id: "other_party", label: "Другие лица по делу", type: "text", defaultValue: "ООО «Кредитор» (истец)", category: "other" },
      { id: "decision_info", label: "Обжалуемое решение", type: "text", defaultValue: "решение Тверского районного суда г. Москвы от 15.07.2026 по гражданскому делу № 2-1234/2026", category: "court", validation: { required: true } },
      { id: "decision_date", label: "Дата решения в окончательной форме", type: "date", defaultValue: "2026-07-20", category: "court" },
      { id: "grounds", label: "Доводы жалобы", type: "textarea", defaultValue: "суд неполно исследовал доказательства, не применил срок исковой давности, выводы суда не соответствуют обстоятельствам дела", category: "items", rows: 3, validation: { required: true } },
      { id: "prayer", label: "Просительная часть", type: "text", defaultValue: "отменить решение суда и принять новое решение об отказе в удовлетворении иска", category: "items" },
      { id: "attachments", label: "Приложения", type: "text", defaultValue: "копия решения суда, квитанция об уплате госпошлины (50% от пошлины при подаче иска), копии жалобы по числу лиц", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Апелляционная жалоба</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">В <strong>{{{court_name}}}</strong></p>
  <p class="mb-1 text-justify">По делу № {{{case_number}}}. Заявитель: {{{appellant_fio}}} ({{{appellant_status}}}).</p>
  <p class="mb-4 text-justify">Другие лица: {{{other_party}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Апелляционная жалоба</div>
  <p class="mb-3 text-justify">1. «{{{decision_date}}}» {{{decision_info}}}, которым иск удовлетворён.</p>
  <p class="mb-3 text-justify">2. С решением не согласен, считаю его незаконным и необоснованным: {{{grounds}}}.</p>
  <p class="mb-3 text-justify">3. Жалоба подаётся в срок 1 месяц со дня принятия решения в окончательной форме (ст. 321 ГПК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">На основании изложенного прошу (ст. 320-322 ГПК РФ):</div>
  <p class="mb-3 text-justify">{{{prayer}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attachments}}}.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Заявитель: {{{appellant_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "ddu-penalty-lawsuit",
    name: "Исковое о взыскании неустойки по ДДУ",
    category: "legal",
    actSource: "214-ФЗ, ст. 131-132 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Иск участника долевого строительства о взыскании неустойки за просрочку передачи квартиры: 1/150 ставки рефинансирования для физлиц за каждый день просрочки (ч. 2 ст. 6 214-ФЗ).",
    suggestedDocs: ["dkp-flat", "consumer-lawsuit"],
    printInstruction: "Печать на листе А4; неустойка для физлиц — 1/150 ставки ЦБ за каждый день просрочки (ч. 2 ст. 6 214-ФЗ); госпошлина до 1 млн руб. не уплачивается (ЗоЗПП)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Тверской районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "plaintiff_fio", label: "Истец (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "applicant", validation: { required: true } },
      { id: "plaintiff_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Пушкина, д. 20, кв. 8", category: "applicant" },
      { id: "defendant_org", label: "Ответчик (застройщик)", type: "text", defaultValue: "ООО «СтройИнвест»", category: "other", validation: { required: true } },
      { id: "defendant_inn", label: "ИНН застройщика", type: "text", defaultValue: "7701112223", category: "other" },
      { id: "ddu_number", label: "Номер ДДУ", type: "text", defaultValue: "ДДУ № 45/2024 от 15.03.2024", category: "contract", validation: { required: true } },
      { id: "flat_desc", label: "Объект", type: "text", defaultValue: "квартира в ЖК «Солнечный», корп. 2, секция 1, этаж 7, № 45, по адресу: г. Москва, ул. Новая, д. 1", category: "realty" },
      { id: "ddu_price", label: "Цена ДДУ (руб.)", type: "text", defaultValue: "11000000", category: "payment", validation: { required: true } },
      { id: "transfer_deadline", label: "Срок передачи (по ДДУ)", type: "date", defaultValue: "2025-12-31", category: "contract" },
      { id: "actual_date", label: "Дата фактической передачи (если была)", type: "date", defaultValue: "2026-05-01", category: "contract" },
      { id: "key_rate", label: "Ключевая ставка ЦБ (% годовых)", type: "text", defaultValue: "21", category: "payment" },
      { id: "delay_days", label: "Дней просрочки", type: "text", defaultValue: "121", category: "contract" },
      { id: "penalty_amount", label: "Расчёт неустойки (руб.)", type: "textarea", defaultValue: "11 000 000 × 21% × 1/150 × 121 дн. = 1 863 400 руб. (для физлиц — 1/150, ч. 2 ст. 6 214-ФЗ)", category: "payment", rows: 2, validation: { required: true } },
      { id: "claims", label: "Требования", type: "text", defaultValue: "взыскать неустойку 1 863 400 руб., компенсацию морального вреда 50 000 руб., штраф 50% (п. 6 ст. 13 ЗоЗПП)", category: "items" },
      { id: "attachments", label: "Приложения", type: "text", defaultValue: "копия ДДУ, акт приёма-передачи, претензия застройщику, расчёт неустойки", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о взыскании неустойки по договору долевого участия</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">В <strong>{{{court_name}}}</strong></p>
  <p class="mb-1 text-justify">Истец: {{{plaintiff_fio}}}, адрес: {{{plaintiff_address}}}</p>
  <p class="mb-4 text-justify">Ответчик: {{{defendant_org}}}, ИНН {{{defendant_inn}}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Исковое заявление</div>
  <p class="mb-3 text-justify">1. Между сторонами заключён {{{ddu_number}}} на квартиру: {{{flat_desc}}}. Цена договора: {{{ddu_price}}} руб.</p>
  <p class="mb-3 text-justify">2. Объект должен был быть передан не позднее «{{{transfer_deadline}}}», фактически передан «{{{actual_date}}}». Просрочка составила {{{delay_days}}} дней.</p>
  <p class="mb-3 text-justify">3. Расчёт неустойки: {{{penalty_amount}}} (ч. 2 ст. 6 214-ФЗ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">На основании изложенного прошу:</div>
  <p class="mb-3 text-justify">{{{claims}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attachments}}}. Госпошлина при цене иска до 1 млн руб. не уплачивается (п. 3 ст. 17 ЗоЗПП).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Истец: {{{plaintiff_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "bankruptcy-app",
    name: "Заявление о признании гражданина банкротом",
    category: "legal",
    actSource: "ст. 213.3-213.4 ФЗ-127 «О несостоятельности (банкротстве)»",
    lastUpdated: "Август 2026",
    description: "Заявление физлица в арбитражный суд о признании банкротом: сумма и перечень долгов, просрочка более 3 месяцев, невозможность исполнения обязательств, приложения и просьба о процедуре реализации имущества.",
    suggestedDocs: ["ddu-penalty-lawsuit", "consumer-lawsuit"],
    printInstruction: "Печать на листе А4; госпошлина — 300 руб., прикладываются список кредиторов, опись имущества и документы о задолженности",
    fields: [
      { id: "court", label: "Арбитражный суд", type: "text", defaultValue: "Арбитражный суд г. Москвы, 115225, г. Москва, ул. Большая Тульская, д. 17", category: "court" },
      { id: "date", label: "Дата подачи заявления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "fio", label: "Заявитель (ФИО)", type: "text", defaultValue: "Смирнова Анна Павловна", category: "applicant", validation: { required: true } },
      { id: "birth_date", label: "Дата рождения", type: "text", defaultValue: "12.05.1980", category: "applicant" },
      { id: "birth_place", label: "Место рождения", type: "text", defaultValue: "г. Тверь", category: "applicant" },
      { id: "inn", label: "ИНН", type: "text", defaultValue: "771234567890", category: "applicant" },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "123-456-789 01", category: "applicant" },
      { id: "address", label: "Адрес регистрации", type: "text", defaultValue: "г. Москва, ул. Весенняя, д. 15, кв. 42", category: "applicant" },
      { id: "debt_sum", label: "Сумма задолженности", type: "text", defaultValue: "1 450 000 руб.", category: "other", validation: { required: true } },
      { id: "debt_reasons", label: "Основания задолженности", type: "text", defaultValue: "кредиты в ПАО «Сбербанк» — 850 000 руб., ПАО «ВТБ» — 600 000 руб.", category: "other" },
      { id: "arrears_period", label: "Период просрочки", type: "text", defaultValue: "с марта 2025 года, более 3 месяцев", category: "other" },
      { id: "income", label: "Доход и имущество", type: "text", defaultValue: "доход 45 000 руб./мес., квартира 42 кв. м — единственное жильё, автомобиль отсутствует", category: "other" },
      { id: "sro", label: "Саморегулируемая организация", type: "text", defaultValue: "Ассоциация «СРО АУ «Меркурий»", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6">
    <p class="mb-1">В {{{court}}}</p>
    <p>от <strong>{{{fio}}}</strong></p>
    <p>дата рождения: {{{birth_date}}}, место рождения: {{{birth_place}}}</p>
    <p>ИНН: {{{inn}}}, СНИЛС: {{{snils}}}</p>
    <p>адрес: {{{address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о признании гражданина банкротом</div>
  <p class="mb-3 text-justify">
    В соответствии со ст. 213.4 ФЗ «О несостоятельности (банкротстве)» заявляю о своей неспособности удовлетворить
    требования кредиторов по денежным обязательствам в общей сумме {{{debt_sum}}}.
  </p>
  <p class="mb-3 text-justify">
    Задолженность возникла в связи с: {{{debt_reasons}}}. Срок просрочки исполнения обязательств: {{{arrears_period}}}.
  </p>
  <p class="mb-3 text-justify">
    Исполнение обязательств невозможно, поскольку размер дохода и состав имущества не позволяют погасить задолженность:
    {{{income}}}. К заявлению прилагаются список кредиторов и должников, опись имущества и документы, подтверждающие задолженность.
  </p>
  <p class="mb-3 text-justify">
    На основании изложенного прошу:
  </p>
  <p class="mb-3 text-justify">
    1. Признать меня несостоятельным (банкротом) и ввести процедуру реализации имущества гражданина;
  </p>
  <p class="mb-3 text-justify">
    2. Утвердить финансового управляющего из числа членов СРО: {{{sro}}}.
  </p>
  <div class="mt-10 text-xs">
    <p class="mb-6">Приложения: 1) список кредиторов; 2) опись имущества; 3) документы о задолженности; 4) квитанция об уплате госпошлины (300 руб.).</p>
    <div class="flex justify-between">
      <div class="w-1/2 pr-4">
        <p class="font-bold mb-1">Заявитель:</p>
        <p class="mb-6">{{{fio}}}</p>
        <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
        <p class="text-zinc-400 text-[10px]">подпись</p>
      </div>
      <div class="w-1/2 pl-4">
        <p class="font-bold mb-1">Дата:</p>
        <p class="mb-6">«{{{date}}}»</p>
        <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
        <p class="text-zinc-400 text-[10px]">(при подаче в суд)</p>
      </div>
    </div>
  </div>
</div>`,
  },
{
    id: "cassation-complaint",
    name: "Кассационная жалоба",
    category: "legal",
    actSource: "гл. 41 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Кассационная жалоба на решение суда, вступившее в законную силу, с указанием оснований для отмены судебных постановлений.",
    suggestedDocs: ["appeal-complaint","objection-debt-claim"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Курочкина Виктория Сергеевна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес заявителя", type: "text", defaultValue: "г. Москва, ул. Кассационная, д. 8, кв. 12", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (903) 444-55-66", category: "applicant" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Судебная коллегия по гражданским делам Верховного Суда РФ", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "121260, г. Москва, ул. Поварская, д. 15", category: "court" },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "2-3456/2026", category: "contract" },
      { id: "judgments", label: "Обжалуемые постановления", type: "text", defaultValue: "решение Замоскворецкого районного суда г. Москвы от 20.03.2026, апелляционное определение Московского городского суда от 25.05.2026", category: "contract", validation: { required: true } },
      { id: "violated_rights", label: "Нарушенные права", type: "text", defaultValue: "право на всестороннее и полное исследование доказательств, нарушение норм материального права (ст. 15 ГК РФ)", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Основания для отмены", type: "textarea", defaultValue: "Суды неправильно применили нормы материального права и не дали оценки представленным доказательствам", category: "contract", validation: { required: true } },
      { id: "lower_instances", label: "Досудебное обжалование", type: "text", defaultValue: "Решение и апелляционное определение обжаловались в апелляционном порядке, апелляционная жалоба оставлена без удовлетворения", category: "contract" },
      { id: "violation_period", label: "Пропущен ли срок", type: "text", defaultValue: "Нет, срок подачи жалобы не пропущен", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Заявитель: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Дело № {{{case_number}}}</p></p>
  <p class="mb-1 text-justify">Судебные постановления: {{{judgments}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Кассационная жалоба</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. «{{{decision_date}}}» судом вынесено решение: {{{judgments}}}, которым разрешён спор по существу.</p>
  <p class="mb-4 text-justify">1.2. С состоявшимися судебными постановлениями не согласен, считаю их незаконными и подлежащими отмене по следующим основаниям: {{{grounds}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Нарушения судов</div>
  <p class="mb-4 text-justify">2.1. При рассмотрении дела судами допущены существенные нарушения норм права: {{{violated_rights}}}.</p>
  <p class="mb-4 text-justify">2.2. Судами не приняты во внимание обстоятельства: {{{ignored_facts}}}, имеющие значение для правильного разрешения дела.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Отменить {{{judgments}}} и направить дело на новое рассмотрение (либо принять по делу новое решение).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия кассационной жалобы по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Копии судебных постановлений, принятых по делу;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины (при необходимости).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "counterclaim",
    name: "Встречное исковое заявление",
    category: "legal",
    actSource: "ст. 137, 138 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Встречное исковое заявление, предъявляемое ответчиком для совместного рассмотрения с первоначальным иском.",
    suggestedDocs: ["debt-lawsuit","claim-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца по встречному иску", type: "text", defaultValue: "Григорьев Павел Николаевич", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Встречная, д. 3, кв. 45", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (916) 222-33-44", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Смирнова Ольга Викторовна", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Мирная, д. 12, кв. 3", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Тверской районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "127051, г. Москва, ул. Цветной бульвар, д. 25А", category: "court" },
      { id: "original_claim", label: "Первоначальный иск", type: "text", defaultValue: "исковое заявление Смирновой О.В. о взыскании задолженности по договору займа от 10.01.2026", category: "contract", validation: { required: true } },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "2-5678/2026", category: "contract" },
      { id: "claim_total", label: "Цена встречного иска (руб.)", type: "number", defaultValue: "180000", category: "payment", validation: { required: true } },
      { id: "claim_total_words", label: "Сумма прописью", type: "text", defaultValue: "Сто восемьдесят тысяч рублей 00 копеек", category: "payment" },
      { id: "basis", label: "Основания требований", type: "textarea", defaultValue: "Сторонами заключено соглашение о зачёте встречных однородных требований, которое ответчик не исполнил", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Встречное исковое заявление</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. В производстве суда находится гражданское дело № {{{case_number}}} по иску {{{defendant_fio}}} к {{{applicant_fio}}} о {{{original_claim}}}.</p>
  <p class="mb-4 text-justify">1.2. У ответчика по первоначальному иску имеются встречные требования к истцу: {{{basis}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания встречного иска</div>
  <p class="mb-4 text-justify">2.1. Требования {{{applicant_fio}}} основаны на {{{contract_basis}}}, что подтверждается прилагаемыми документами.</p>
  <p class="mb-4 text-justify">2.2. Совместное рассмотрение первоначального и встречного исков соответствует требованиям ст. 138 ГПК РФ, поскольку встречное требование направлено к зачёту первоначального.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Взыскать с {{{defendant_fio}}} в пользу {{{applicant_fio}}} {{{claim_total}}} руб. ({{{claim_total_words}}}), а также расходы по уплате государственной пошлины.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "claim-labor",
    name: "Исковое заявление о восстановлении на работе",
    category: "legal",
    actSource: "ст. 391, 394 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Иск работника о восстановлении на работе, взыскании среднего заработка за время вынужденного прогула и компенсации морального вреда.",
    suggestedDocs: ["claim-generic","objection-debt-claim"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО работника", type: "text", defaultValue: "Ершова Анна Павловна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Трудовая, д. 5, кв. 67", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (905) 777-88-99", category: "applicant" },
      { id: "defendant_fio", label: "Работодатель", type: "text", defaultValue: "ООО «Вектор Плюс»", category: "employer", validation: { required: true } },
      { id: "defendant_address", label: "Адрес работодателя", type: "text", defaultValue: "г. Москва, ул. Бизнес-центр, д. 1, оф. 301", category: "employer" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Басманный районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "107078, г. Москва, ул. Каланчёвская, д. 43", category: "court" },
      { id: "position", label: "Должность", type: "text", defaultValue: "старший менеджер", category: "employee", validation: { required: true } },
      { id: "dismissal_date", label: "Дата увольнения", type: "date", defaultValue: "2026-06-15", category: "contract", validation: { required: true } },
      { id: "dismissal_reason", label: "Основание увольнения", type: "text", defaultValue: "п. 2 ч. 1 ст. 81 ТК РФ (сокращение штата)", category: "contract", validation: { required: true } },
      { id: "salary", label: "Средний заработок (руб./мес.)", type: "number", defaultValue: "85000", category: "payment", validation: { required: true } },
      { id: "avg_earnings", label: "Средний заработок за время прогула", type: "textarea", defaultValue: "85 000 руб. за каждый месяц вынужденного прогула с 16.06.2026 по дату восстановления", category: "payment" },
      { id: "grounds", label: "Основания незаконности увольнения", type: "textarea", defaultValue: "Увольнение произведено с нарушением порядка: не предложены вакантные должности, сокращение проведено без учёта преимущественного права", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о восстановлении на работе</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. Истец с «{{{hire_date}}}» работал у ответчика в должности {{{position}}}.</p>
  <p class="mb-4 text-justify">1.2. Приказом от {{{dismissal_date}}} истец уволен по {{{dismissal_reason}}}.</p>
  <p class="mb-4 text-justify">1.3. Увольнение считаю незаконным: {{{grounds}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Нарушенные права</div>
  <p class="mb-4 text-justify">2.1. Увольнение произведено без соблюдения порядка, установленного Трудовым кодексом РФ.</p>
  <p class="mb-4 text-justify">2.2. В результате незаконного увольнения истец лишён заработка и испытывает нравственные страдания.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Восстановить {{{applicant_fio}}} на работе в должности {{{position}}};</p>
  <p class="mb-4 text-justify">Взыскать с {{{defendant_fio}}} средний заработок за время вынужденного прогула в размере {{{avg_earnings}}};</p>
  <p class="mb-4 text-justify">Взыскать компенсацию морального вреда в размере {{{moral_damage}}} руб.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия приказа о приёме на работу;</p>
  <p class="mb-4 text-justify">Копия приказа об увольнении;</p>
  <p class="mb-4 text-justify">Расчёт среднего заработка за время вынужденного прогула;</p>
  <p class="mb-4 text-justify">Копия искового заявления для ответчика.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "inheritance-claim",
    name: "Исковое заявление о признании права собственности в порядке наследования",
    category: "legal",
    actSource: "ст. 1111, 1152-1154 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Иск наследника о признании права собственности на наследственное имущество, включении имущества в наследственную массу.",
    suggestedDocs: ["claim-generic","notary-power-of-attorney"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца (наследника)", type: "text", defaultValue: "Лебедев Артём Игоревич", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Наследственная, д. 9, кв. 21", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (926) 555-11-22", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Лебедева Марина Сергеевна", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Наследственная, д. 9, кв. 21", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Хорошёвский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "125319, г. Москва, ул. Лётчика Бабушкина, д. 39", category: "court" },
      { id: "testator", label: "Наследодатель", type: "text", defaultValue: "Лебедев Игорь Викторович", category: "testator", validation: { required: true } },
      { id: "death_date", label: "Дата смерти", type: "date", defaultValue: "2026-02-14", category: "contract", validation: { required: true } },
      { id: "property", label: "Наследственное имущество", type: "text", defaultValue: "квартира по адресу: г. Москва, ул. Наследственная, д. 9, кв. 21", category: "property", validation: { required: true } },
      { id: "property_value", label: "Кадастровая стоимость (руб.)", type: "number", defaultValue: "9800000", category: "payment" },
      { id: "inheritance_basis", label: "Основание наследования", type: "text", defaultValue: "завещание от 10.01.2019", category: "contract", validation: { required: true } },
      { id: "acceptance", label: "Принятие наследства", type: "text", defaultValue: "фактически принял наследство: проживал в квартире, оплачивал коммунальные услуги", category: "contract" },
      { id: "notary_refusal", label: "Отказ нотариуса", type: "text", defaultValue: "нотариус отказал в выдаче свидетельства о праве на наследство, поскольку срок принятия наследства пропущен", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о признании права собственности в порядке наследования</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. «{{{death_date}}}» умер {{{testator}}} — наследодатель.</p>
  <p class="mb-4 text-justify">1.2. Истец является наследником по {{{inheritance_basis}}}.</p>
  <p class="mb-4 text-justify">1.3. Наследственное имущество: {{{property}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Принятие наследства</div>
  <p class="mb-4 text-justify">2.1. Истец принял наследство: {{{acceptance}}}.</p>
  <p class="mb-4 text-justify">2.2. {{{notary_refusal}}}, в связи с чем право собственности может быть признано только в судебном порядке.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Признать за {{{applicant_fio}}} право собственности в порядке наследования на {{{property}}};</p>
  <p class="mb-4 text-justify">Включить {{{property}}} в состав наследственного имущества {{{testator}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия свидетельства о смерти наследодателя;</p>
  <p class="mb-4 text-justify">Копия документа, подтверждающего родство;</p>
  <p class="mb-4 text-justify">Копия завещания (при наличии);</p>
  <p class="mb-4 text-justify">Выписка из ЕГРН;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "eviction-claim",
    name: "Исковое заявление о выселении",
    category: "legal",
    actSource: "ст. 35 ЖК РФ, ст. 688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Иск собственника жилого помещения о выселении нанимателя и членов его семьи без предоставления другого жилого помещения.",
    suggestedDocs: ["claim-generic","housing-claim"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Романов Дмитрий Алексеевич", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Жилищная, д. 4, кв. 88", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (909) 123-45-67", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Петров Сергей Иванович", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Жилищная, д. 4, кв. 88", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Симоновский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "115280, г. Москва, ул. Восточная, д. 4", category: "court" },
      { id: "housing", label: "Жилое помещение", type: "text", defaultValue: "квартира по адресу: г. Москва, ул. Жилищная, д. 4, кв. 88", category: "property", validation: { required: true } },
      { id: "ownership_basis", label: "Основание владения", type: "text", defaultValue: "свидетельство о праве собственности от 10.03.2018", category: "contract", validation: { required: true } },
      { id: "tenancy_basis", label: "Основание проживания ответчика", type: "text", defaultValue: "договор найма жилого помещения от 01.02.2023", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Основания выселения", type: "textarea", defaultValue: "срок договора найма истёк, ответчик освободить помещение отказывается", category: "contract", validation: { required: true } },
      { id: "warn_date", label: "Дата предупреждения", type: "date", defaultValue: "2026-05-20", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о выселении</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. Истец является собственником жилого помещения: {{{housing}}}, на основании {{{ownership_basis}}}.</p>
  <p class="mb-4 text-justify">1.2. Ответчик проживает в указанном помещении на основании {{{tenancy_basis}}}.</p>
  <p class="mb-4 text-justify">1.3. Основанием для выселения является: {{{grounds}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Досудебные меры</div>
  <p class="mb-4 text-justify">2.1. «{{{warn_date}}}» ответчику направлено требование об освобождении жилого помещения в срок до {{{vacate_deadline}}}.</p>
  <p class="mb-4 text-justify">2.2. До настоящего времени требование ответчиком не исполнено.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Выселить {{{defendant_fio}}} из {{{housing}}} без предоставления другого жилого помещения;</p>
  <p class="mb-4 text-justify">Взыскать с ответчика расходы по уплате государственной пошлины.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "alimony-claim",
    name: "Исковое заявление о взыскании алиментов",
    category: "legal",
    actSource: "ст. 80-83 СК РФ",
    lastUpdated: "Август 2026",
    description: "Иск о взыскании алиментов на несовершеннолетних детей в твёрдой денежной сумме или в долях к заработку родителя.",
    suggestedDocs: ["divorce-lawsuit","alimony-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Волкова Екатерина Сергеевна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Семейная, д. 7, кв. 14", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (903) 111-22-33", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Волков Андрей Олегович", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Семейная, д. 7, кв. 14", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Кунцевский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "121351, г. Москва, ул. Молодогвардейская, д. 13", category: "court" },
      { id: "child1", label: "Ребёнок", type: "text", defaultValue: "Волкова Софья Андреевна, 12.04.2014 г.р.", category: "child", validation: { required: true } },
      { id: "child2", label: "Ребёнок (при наличии)", type: "text", defaultValue: "Волков Матвей Андреевич, 02.09.2017 г.р.", category: "child" },
      { id: "marriage_status", label: "Статус брака", type: "text", defaultValue: "брак расторгнут 15.05.2020, дети проживают с истцом", category: "family", validation: { required: true } },
      { id: "defendant_income", label: "Доход ответчика", type: "text", defaultValue: "заработная плата 60 000 руб. в месяц", category: "payment" },
      { id: "alimony_form", label: "Форма алиментов", type: "text", defaultValue: "в долях к заработку: 1/3 часть всех видов заработка", category: "payment", validation: { required: true } },
      { id: "help", label: "Помощь ответчика", type: "text", defaultValue: "материальную помощь ответчик не оказывает", category: "family" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о взыскании алиментов</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. От брака с ответчиком имеются несовершеннолетние дети: {{{child1}}}{{#child2}}, {{{child2}}}{{/child2}}.</p>
  <p class="mb-4 text-justify">1.2. {{{marriage_status}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{help}}}. Ответчик обязательства по содержанию детей не исполняет.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания требований</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 80 СК РФ родители обязаны содержать своих несовершеннолетних детей.</p>
  <p class="mb-4 text-justify">2.2. Алименты прошу взыскивать в размере: {{{alimony_form}}}, поскольку {{{defendant_income}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Взыскать с {{{defendant_fio}}} алименты на содержание детей {{{child1}}}{{#child2}}, {{{child2}}}{{/child2}} в размере {{{alimony_form}}}, начиная с даты подачи искового заявления и до совершеннолетия детей;</p>
  <p class="mb-4 text-justify">Взыскать с ответчика расходы по уплате государственной пошлины (по требованиям о взыскании алиментов истец освобождён от уплаты пошлины — ст. 333.36 НК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия свидетельства о рождении ребёнка;</p>
  <p class="mb-4 text-justify">Копия свидетельства о расторжении брака;</p>
  <p class="mb-4 text-justify">Справка о регистрации детей по месту жительства;</p>
  <p class="mb-4 text-justify">Копия искового заявления для ответчика.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "property-claim",
    name: "Исковое заявление о разделе совместно нажитого имущества",
    category: "legal",
    actSource: "ст. 38, 39 СК РФ",
    lastUpdated: "Август 2026",
    description: "Иск супруга о разделе совместно нажитого имущества с определением долей и порядка выдела имущества в натуре.",
    suggestedDocs: ["divorce-lawsuit","property-division"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Соколова Ирина Владимировна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Раздельная, д. 2, кв. 56", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (926) 888-99-00", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Соколов Пётр Дмитриевич", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Раздельная, д. 2, кв. 56", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Мещанский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "129090, г. Москва, ул. Каланчёвская, д. 43А", category: "court" },
      { id: "marriage_date", label: "Дата брака", type: "date", defaultValue: "2012-06-09", category: "family", validation: { required: true } },
      { id: "marriage_end", label: "Прекращение брака", type: "text", defaultValue: "брак расторгнут 10.04.2026", category: "family", validation: { required: true } },
      { id: "property_list", label: "Совместное имущество", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Раздельная, д. 2, кв. 56 (кадастровая стоимость 9 500 000 руб.); автомобиль Kia Sportage, 2021 г.в. (1 800 000 руб.)", category: "property", validation: { required: true } },
      { id: "claim_total", label: "Цена иска (руб.)", type: "number", defaultValue: "5650000", category: "payment", validation: { required: true } },
      { id: "claim_total_words", label: "Сумма прописью", type: "text", defaultValue: "Пять миллионов шестьсот пятьдесят тысяч рублей 00 копеек", category: "payment" },
      { id: "wanted_split", label: "Желаемый раздел", type: "textarea", defaultValue: "квартиру оставить истцу с выплатой компенсации ответчику; автомобиль передать ответчику с выплатой компенсации истцу", category: "property", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о разделе совместно нажитого имущества</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. С {{{marriage_date}}} стороны состояли в зарегистрированном браке; {{{marriage_end}}}.</p>
  <p class="mb-4 text-justify">1.2. В период брака супругами приобретено совместное имущество: {{{property_list}}}.</p>
  <p class="mb-4 text-justify">1.3. Соглашение о разделе имущества между сторонами не достигнуто.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания требований</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 38, 39 СК РФ доли супругов в совместно нажитом имуществе признаются равными.</p>
  <p class="mb-4 text-justify">2.2. Желаемый порядок раздела: {{{wanted_split}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Взыскать с {{{defendant_fio}}} в пользу {{{applicant_fio}}} {{{claim_total}}} руб. ({{{claim_total_words}}}), а также расходы по уплате государственной пошлины.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "housing-claim",
    name: "Исковое заявление о признании права пользования жилым помещением",
    category: "legal",
    actSource: "ст. 69, 70 ЖК РФ",
    lastUpdated: "Август 2026",
    description: "Иск о признании права пользования жилым помещением и вселении, если право пользования оспаривается.",
    suggestedDocs: ["eviction-claim","claim-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Козлов Иван Петрович", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Проживания, д. 6, кв. 41", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (915) 444-77-88", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Козлова Татьяна Николаевна", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Проживания, д. 6, кв. 41", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Чертановский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "113105, г. Москва, Варшавское шоссе, д. 38", category: "court" },
      { id: "housing", label: "Жилое помещение", type: "text", defaultValue: "квартира по адресу: г. Москва, ул. Проживания, д. 6, кв. 41", category: "property", validation: { required: true } },
      { id: "right_basis", label: "Основание права пользования", type: "textarea", defaultValue: "истец вселён как член семьи нанимателя, зарегистрирован по месту жительства, участвует в оплате коммунальных услуг", category: "contract", validation: { required: true } },
      { id: "conflict", label: "Конфликт", type: "textarea", defaultValue: "ответчик препятствует проживанию, поменял замки, чинит препятствия во вселении", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о признании права пользования жилым помещением</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. Истец проживает в {{{housing}}} на основании: {{{right_basis}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{conflict}}}.</p>
  <p class="mb-4 text-justify">1.3. Право истца на пользование жилым помещением подтверждается: {{{evidence}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания требований</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 69, 70 ЖК РФ члены семьи нанимателя имеют равное с нанимателем право пользования жилым помещением.</p>
  <p class="mb-4 text-justify">2.2. Действия ответчика нарушают жилищные права истца.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Признать за {{{applicant_fio}}} право пользования жилым помещением: {{{housing}}};</p>
  <p class="mb-4 text-justify">Вселить {{{applicant_fio}}} в указанное жилое помещение;</p>
  <p class="mb-4 text-justify">Обязать {{{defendant_fio}}} не чинить препятствий в пользовании жилым помещением.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "recovery-loss-claim",
    name: "Исковое заявление о взыскании убытков",
    category: "legal",
    actSource: "ст. 15, 393 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Иск о взыскании убытков, причинённых неисполнением или ненадлежащим исполнением обязательств, включая упущенную выгоду.",
    suggestedDocs: ["debt-lawsuit","claim-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Морозов Кирилл Андреевич", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес истца", type: "text", defaultValue: "г. Москва, ул. Убыточная, д. 3, кв. 9", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (903) 333-22-11", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "ООО «СтройГарант»", category: "contractor", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 15, оф. 7", category: "contractor" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Пресненский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "123242, г. Москва, ул. Зоологическая, д. 20", category: "court" },
      { id: "base_doc", label: "Основание обязательства", type: "text", defaultValue: "договор подряда от 12.01.2026 № 14", category: "contract", validation: { required: true } },
      { id: "violation", label: "Нарушение", type: "textarea", defaultValue: "работы по договору не выполнены в срок, результат не соответствует техническому заданию", category: "contract", validation: { required: true } },
      { id: "losses", label: "Убытки", type: "textarea", defaultValue: "стоимость устранения недостатков 120 000 руб.; расходы на экспертизу 25 000 руб.", category: "payment", validation: { required: true } },
      { id: "lost_profit", label: "Упущенная выгода", type: "text", defaultValue: "недополученный доход от аренды 60 000 руб.", category: "payment" },
      { id: "claim_total", label: "Цена иска (руб.)", type: "number", defaultValue: "205000", category: "payment", validation: { required: true } },
      { id: "claim_total_words", label: "Сумма прописью", type: "text", defaultValue: "Двести пять тысяч рублей 00 копеек", category: "payment" },
      { id: "demand", label: "Досудебное требование", type: "text", defaultValue: "претензия от 10.06.2026 оставлена без ответа", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о взыскании убытков</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства дела</div>
  <p class="mb-4 text-justify">1.1. Между сторонами заключён {{{base_doc}}}.</p>
  <p class="mb-4 text-justify">1.2. Ответчик допустил нарушение обязательства: {{{violation}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{demand}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Размер убытков</div>
  <p class="mb-4 text-justify">2.1. В результате нарушения обязательства истцу причинены убытки: {{{losses}}}.</p>
  <p class="mb-4 text-justify">2.2. Упущенная выгода: {{{lost_profit}}}. Общая сумма убытков составляет {{{claim_total}}} руб. ({{{claim_total_words}}}).</p>
  <p class="mb-4 text-justify">2.3. Размер убытков подтверждается: {{{loss_evidence}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Взыскать с {{{defendant_fio}}} в пользу {{{applicant_fio}}} {{{claim_total}}} руб. ({{{claim_total_words}}}), а также расходы по уплате государственной пошлины.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "court-power-of-attorney",
    name: "Доверенность на ведение дела в суде",
    category: "legal",
    actSource: "ст. 185-187 ГК РФ, ст. 53 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Доверенность на представительство в суде: ведение дела, подача документов, получение решений и исполнительных листов.",
    suggestedDocs: ["power-of-attorney-docs", "postal-power-of-attorney"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "principal_fio", label: "ФИО доверителя", type: "text", defaultValue: "Назарова Елена Юрьевна", category: "applicant", validation: { required: true } },
      { id: "principal_passport", label: "Паспорт доверителя", type: "text", defaultValue: "4512 654987, выдан ОУФМС России по г. Москве 14.03.2014, к.п. 770-002", category: "applicant", validation: { required: true } },
      { id: "principal_addr", label: "Адрес доверителя", type: "text", defaultValue: "г. Москва, ул. Доверенная, д. 10, кв. 3", category: "applicant" },
      { id: "agent_fio", label: "ФИО представителя", type: "text", defaultValue: "Сидоров Максим Юрьевич", category: "agent", validation: { required: true } },
      { id: "agent_passport", label: "Паспорт представителя", type: "text", defaultValue: "4510 123789, выдан ОУФМС России по г. Москве 05.09.2011, к.п. 770-001", category: "agent", validation: { required: true } },
      { id: "agent_addr", label: "Адрес представителя", type: "text", defaultValue: "г. Москва, ул. Юридическая, д. 1, кв. 77", category: "agent" },
      { id: "case_info", label: "Дело", type: "text", defaultValue: "гражданское дело № 2-1234/2026 в Тверском районном суде г. Москвы", category: "contract", validation: { required: true } },
      { id: "powers", label: "Полномочия", type: "textarea", defaultValue: "знакомиться с материалами дела, подавать заявления и ходатайства, предъявлять иски, обжаловать судебные постановления, получать копии документов, исполнительные листы и присуждённое имущество или деньги", category: "contract", validation: { required: true } },
      { id: "valid_until", label: "Срок действия", type: "text", defaultValue: "один год с правом передоверия полномочий", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Доверенность на ведение дела в суде</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{principal_fio}}}</strong>, паспорт: {{{principal_passport}}}, зарегистрированная по адресу: {{{principal_addr}}},
    настоящей доверенностью уполномочиваю <strong>{{{agent_fio}}}</strong>, паспорт: {{{agent_passport}}},
    зарегистрированного по адресу: {{{agent_addr}}}, быть представителем по {{{case_info}}} (ст. 53 ГПК РФ).
  </p>
  <p class="mb-4 text-justify">Для чего предоставляю право: {{{powers}}}, а также совершать все необходимые процессуальные действия, расписываться за меня и выполнять все действия, связанные с данным поручением.</p>
  <p class="mb-4 text-justify">Доверенность выдана на срок: {{{valid_until}}}. Содержание статей 185-189 ГК РФ мне известно. Доверенность может быть отменена в любое время (ст. 188 ГК РФ).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Доверитель: {{{principal_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "renunciation-inheritance",
    name: "Заявление об отказе от наследства",
    category: "legal",
    actSource: "ст. 1157-1158 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление наследника об отказе от наследства, подаваемое нотариусу по месту открытия наследства.",
    suggestedDocs: ["inheritance-claim","power-of-attorney-docs"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО наследника", type: "text", defaultValue: "Иванова Мария Петровна", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "1975-04-12", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "4509 234567, выдан ОУФМС России по г. Москве 12.09.2011, к.п. 770-001", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Отказная, д. 3, кв. 18", category: "applicant" },
      { id: "testator", label: "Наследодатель", type: "text", defaultValue: "Иванов Пётр Сергеевич", category: "testator", validation: { required: true } },
      { id: "death_date", label: "Дата смерти", type: "date", defaultValue: "2026-05-30", category: "contract", validation: { required: true } },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "нотариус г. Москвы Смирнова А.А.", category: "notary", validation: { required: true } },
      { id: "notary_address", label: "Адрес нотариальной конторы", type: "text", defaultValue: "г. Москва, ул. Нотариальная, д. 1", category: "notary" },
      { id: "refusal_basis", label: "Основание отказа", type: "text", defaultValue: "не желаю принимать наследство, так как не имею намерения распоряжаться наследственным имуществом", category: "contract", validation: { required: true } },
      { id: "favor_person", label: "В пользу кого отказ (при отказе в пользу другого наследника)", type: "text", defaultValue: "—", category: "other" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление об отказе от наследства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Отказываюсь от причитающегося мне наследства после смерти {{{testator}}}, умершего {{{death_date}}}.</p>
  <p class="mb-4 text-justify">1.2. Отказ заявлен по следующему основанию: {{{refusal_basis}}}.</p>
  <p class="mb-4 text-justify">1.3. {{#favor_person}}Отказ сделан в пользу {{{favor_person}}}.{{/favor_person}}{{^favor_person}}Отказ сделан без указания лиц, в пользу которых он совершается.{{/favor_person}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Подтверждение</div>
  <p class="mb-4 text-justify">2.1. Мне известно, что в соответствии со ст. 1157 ГК РФ отказ от наследства не может быть впоследствии изменён или взят обратно.</p>
  <p class="mb-4 text-justify">2.2. Отказ от наследства подан нотариусу {{{notary}}} по адресу: {{{notary_address}}}.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "paternity-claim",
    name: "Исковое заявление об установлении отцовства",
    category: "legal",
    actSource: "ст. 49, 53 СК РФ",
    lastUpdated: "Август 2026",
    description: "Иск об установлении отцовства в отношении ребёнка и взыскании алиментов, если отец не записан в свидетельстве о рождении.",
    suggestedDocs: ["alimony-claim","claim-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО матери", type: "text", defaultValue: "Белова Анастасия Дмитриевна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Материнская, д. 3, кв. 51", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (903) 222-33-44", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик (предполагаемый отец)", type: "text", defaultValue: "Белов Николай Алексеевич", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Отцовская, д. 11, кв. 5", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Измайловский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "105187, г. Москва, ул. Почтовая, д. 9", category: "court" },
      { id: "child", label: "Ребёнок", type: "text", defaultValue: "Белов Артём Николаевич, 12.03.2022 г.р.", category: "child", validation: { required: true } },
      { id: "relationship", label: "Отношения с ответчиком", type: "text", defaultValue: "состояли в фактических брачных отношениях с 2019 по 2023 год", category: "family", validation: { required: true } },
      { id: "evidence", label: "Доказательства", type: "textarea", defaultValue: "совместные фотографии, переписка, свидетельские показания, биологическая экспертиза (по ходатайству)", category: "contract", validation: { required: true } },
      { id: "support", label: "Материальная помощь", type: "text", defaultValue: "ответчик материальную помощь на содержание ребёнка не оказывает", category: "family" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление об установлении отцовства</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. {{{relationship}}}. От данных отношений родился ребёнок: {{{child}}}.</p>
  <p class="mb-4 text-justify">1.2. Сведения об отце в свидетельстве о рождении записаны со слов матери.</p>
  <p class="mb-4 text-justify">1.3. {{{support}}}. Ответчик отцом ребёнка себя признаёт (не признаёт), добровольно установить отцовство в ЗАГСе отказывается.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 49 СК РФ при рождении ребёнка у родителей, не состоящих в браке, и при отсутствии совместного заявления родителей отцовство устанавливается в судебном порядке.</p>
  <p class="mb-4 text-justify">2.2. Доказательства: {{{evidence}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Установить, что {{{defendant_fio}}}, {{{defendant_birth}}} года рождения, является отцом {{{child}}};</p>
  <p class="mb-4 text-justify">Внести изменения в запись акта о рождении {{{child}}}, указав отцом {{{defendant_fio}}};</p>
  <p class="mb-4 text-justify">Взыскать с ответчика алименты на содержание {{{child}}} в размере 1/4 части всех видов заработка.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "child-residence-claim",
    name: "Исковое заявление об определении места жительства ребёнка",
    category: "legal",
    actSource: "ст. 65 СК РФ",
    lastUpdated: "Август 2026",
    description: "Иск об определении места жительства несовершеннолетнего ребёнка при раздельном проживании родителей.",
    suggestedDocs: ["divorce-lawsuit","parenting-plan"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Егорова Мария Владимировна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Родительская, д. 2, кв. 78", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (915) 666-77-88", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "Егоров Сергей Игоревич", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Родительская, д. 2, кв. 78", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Останкинский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "129515, г. Москва, ул. Останкинская, д. 17", category: "court" },
      { id: "child", label: "Ребёнок", type: "text", defaultValue: "Егорова Алиса Сергеевна, 05.06.2016 г.р.", category: "child", validation: { required: true } },
      { id: "marriage_status", label: "Статус брака", type: "text", defaultValue: "брак расторгнут 20.02.2024", category: "family", validation: { required: true } },
      { id: "conditions", label: "Условия проживания истца", type: "textarea", defaultValue: "квартира 52 кв.м, ребёнок обеспечен отдельной комнатой, режим дня соблюдается, школа рядом", category: "contract", validation: { required: true } },
      { id: "defendant_conditions", label: "Условия проживания ответчика", type: "text", defaultValue: "ответчик работает вахтовым методом, проживает в общежитии", category: "contract" },
      { id: "child_opinion", label: "Мнение ребёнка", type: "text", defaultValue: "ребёнок выражает желание проживать с матерью", category: "family" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление об определении места жительства ребёнка</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. {{{marriage_status}}}. От брака имеется ребёнок: {{{child}}}.</p>
  <p class="mb-4 text-justify">1.2. Ребёнок в настоящее время фактически проживает с {{{child_residence}}}.</p>
  <p class="mb-4 text-justify">1.3. Условия проживания: истец — {{{conditions}}}; ответчик — {{{defendant_conditions}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 65 СК РФ место жительства ребёнка при раздельном проживании родителей определяется соглашением родителей, а при отсутствии соглашения — судом, исходя из интересов ребёнка.</p>
  <p class="mb-4 text-justify">2.2. {{{child_opinion}}}. Проживание с матерью соответствует интересам ребёнка.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Определить место жительства {{{child}}} с {{{applicant_fio}}} по адресу: {{{applicant_address}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "invalid-transaction-claim",
    name: "Исковое заявление о признании сделки недействительной",
    category: "legal",
    actSource: "ст. 166-179 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Иск о признании сделки недействительной и применении последствий её недействительности (ничтожная или оспоримая сделка).",
    suggestedDocs: ["claim-generic","property-claim"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО истца", type: "text", defaultValue: "Фёдоров Алексей Викторович", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Сделочная, д. 8, кв. 61", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (926) 333-44-55", category: "applicant" },
      { id: "defendant_fio", label: "Ответчик", type: "text", defaultValue: "ООО «Финанс-Инвест»", category: "other", validation: { required: true } },
      { id: "defendant_address", label: "Адрес ответчика", type: "text", defaultValue: "г. Москва, ул. Инвестиционная, д. 5, оф. 100", category: "other" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Зюзинский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "117463, г. Москва, ул. Голубинская, д. 3", category: "court" },
      { id: "deal", label: "Сделка", type: "text", defaultValue: "договор купли-продажи недвижимости от 15.01.2026 № 7", category: "contract", validation: { required: true } },
      { id: "deal_date", label: "Дата сделки", type: "date", defaultValue: "2026-01-15", category: "contract" },
      { id: "grounds", label: "Основания недействительности", type: "textarea", defaultValue: "сделка совершена под влиянием обмана и существенного заблуждения о предмете сделки", category: "contract", validation: { required: true } },
      { id: "claim_total", label: "Цена иска (руб.)", type: "number", defaultValue: "4500000", category: "payment", validation: { required: true } },
      { id: "claim_total_words", label: "Сумма прописью", type: "text", defaultValue: "Четыре миллиона пятьсот тысяч рублей 00 копеек", category: "payment" },
      { id: "limitation", label: "Срок исковой давности", type: "text", defaultValue: "срок исковой давности не пропущен", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Истец: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Ответчик: {{{defendant_fio}}}</p></p>
  <p class="mb-1 text-justify">адрес: {{{defendant_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Цена иска: {{{claim_total}}} руб.</p></p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Исковое заявление о признании сделки недействительной</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. «{{{deal_date}}}» между истцом и ответчиком заключена сделка: {{{deal}}}.</p>
  <p class="mb-4 text-justify">1.2. Сделка является недействительной по следующим основаниям: {{{grounds}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{limitation}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Правовое обоснование</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 166-179 ГК РФ сделка, совершённая под влиянием обмана, насилия, угрозы или заблуждения, может быть признана судом недействительной.</p>
  <p class="mb-4 text-justify">2.2. Совершённый по сделке платёж составляет {{{claim_total}}} руб. ({{{claim_total_words}}}), что подтверждается прилагаемыми документами.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Признать {{{deal}}} от «{{{deal_date}}}» недействительной;</p>
  <p class="mb-4 text-justify">Применить последствия недействительности сделки: вернуть стороны в первоначальное положение.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия искового заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Квитанция об уплате государственной пошлины;</p>
  <p class="mb-4 text-justify">Копии документов, подтверждающих обстоятельства, на которых основаны требования.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "private-complaint",
    name: "Частная жалоба на определение суда",
    category: "legal",
    actSource: "ст. 331-335 ГПК РФ",
    lastUpdated: "Август 2026",
    description: "Частная жалоба на определение суда первой инстанции (об отказе в удовлетворении ходатайства, о наложении штрафа и др.).",
    suggestedDocs: ["appeal-complaint","cassation-complaint"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Киселёва Татьяна Андреевна", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Жалобная, д. 6, кв. 34", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (905) 111-99-88", category: "applicant" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Люблинский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "109651, г. Москва, ул. Люблинская, д. 8", category: "court" },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "2-7890/2026", category: "contract" },
      { id: "other_party", label: "Другие лица", type: "text", defaultValue: "истец — ООО «Меркурий»", category: "other" },
      { id: "ruling", label: "Обжалуемое определение", type: "text", defaultValue: "определение об отказе в привлечении третьего лица от 05.07.2026", category: "contract", validation: { required: true } },
      { id: "ruling_date", label: "Дата определения", type: "date", defaultValue: "2026-07-05", category: "contract" },
      { id: "grounds", label: "Несогласие", type: "textarea", defaultValue: "определение вынесено с нарушением норм процессуального права, суд не учёл ходатайство о приобщении доказательств", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Заявитель: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Дело № {{{case_number}}}</p></p>
  <p class="mb-1 text-justify">Заинтересованные лица: {{{other_party}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Частная жалоба на определение суда</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. В производстве {{{court_name}}} находится гражданское дело № {{{case_number}}}.</p>
  <p class="mb-4 text-justify">1.2. «{{{ruling_date}}}» судом вынесено определение: {{{ruling}}}.</p>
  <p class="mb-4 text-justify">1.3. С указанным определением не согласна по следующим основаниям: {{{grounds}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Основания жалобы</div>
  <p class="mb-4 text-justify">2.1. Определение нарушает право на защиту и препятствует дальнейшему движению дела.</p>
  <p class="mb-4 text-justify">2.2. Согласно ст. 331 ГПК РФ на определение суда первой инстанции может быть подана частная жалоба.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Отменить определение {{{court_name}}} от «{{{ruling_date}}}» по делу № {{{case_number}}} и разрешить вопрос по существу.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия частной жалобы по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Копия обжалуемого определения;</p>
  <p class="mb-4 text-justify">Документы, подтверждающие доводы жалобы.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  },
{
    id: "enforcement-suspension-app",
    name: "Заявление о приостановлении исполнительного производства",
    category: "legal",
    actSource: "ст. 39, 40 ФЗ «Об исполнительном производстве»",
    lastUpdated: "Август 2026",
    description: "Заявление о приостановлении исполнительного производства (оспоривание исполнительного документа, подача иска и др.).",
    suggestedDocs: ["debt-lawsuit","objection-debt-claim"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Гордеев Илья Викторович", category: "applicant", validation: { required: true } },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Исполнительная, д. 4, кв. 90", category: "applicant" },
      { id: "applicant_phone", label: "Телефон", type: "text", defaultValue: "+7 (909) 555-12-34", category: "applicant" },
      { id: "court_name", label: "Суд", type: "text", defaultValue: "Нагатинский районный суд г. Москвы", category: "court", validation: { required: true } },
      { id: "court_address", label: "Адрес суда", type: "text", defaultValue: "115446, г. Москва, ул. Коломенская, д. 4", category: "court" },
      { id: "case_number", label: "Номер дела", type: "text", defaultValue: "2-1112/2025", category: "contract" },
      { id: "enforcement_number", label: "Исполнительное производство", type: "text", defaultValue: "45876/26/77001-ИП", category: "contract", validation: { required: true } },
      { id: "claimant", label: "Взыскатель", type: "text", defaultValue: "ПАО «Банк»", category: "other", validation: { required: true } },
      { id: "debtor", label: "Должник", type: "text", defaultValue: "Гордеев Илья Викторович", category: "applicant" },
      { id: "grounds", label: "Основания приостановления", type: "textarea", defaultValue: "подано исковое заявление об оспаривании исполнительного документа, на основании которого возбуждено исполнительное производство", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-6 text-xs">
  <p class="mb-1 text-justify">В {{{court_name}}}</p>
  <p class="mb-1 text-justify">адрес: {{{court_address}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Заявитель: <strong>{{{applicant_fio}}}</strong></p></p>
  <p class="mb-1 text-justify">адрес: {{{applicant_address}}}, тел.: {{{applicant_phone}}}</p>
  <p class="mb-1 text-justify"><p class="mt-2">Дело № {{{case_number}}}</p></p>
  <p class="mb-1 text-justify">Исполнительное производство № {{{enforcement_number}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о приостановлении исполнительного производства</div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Обстоятельства</div>
  <p class="mb-4 text-justify">1.1. В отношении заявителя возбуждено исполнительное производство № {{{enforcement_number}}} по взысканию в пользу {{{claimant}}}.</p>
  <p class="mb-4 text-justify">1.2. Основанием для приостановления является: {{{grounds}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Правовое обоснование</div>
  <p class="mb-4 text-justify">2.1. Согласно ст. 39 ФЗ «Об исполнительном производстве» исполнительное производство подлежит приостановлению судом в случае оспаривания исполнительного документа.</p>
  <p class="mb-4 text-justify">2.2. Неприостановление исполнительного производства может привести к необоснованному взысканию денежных средств.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прошу</div>
  <p class="mb-4 text-justify">Приостановить исполнительное производство № {{{enforcement_number}}} до разрешения дела по существу.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приложения</div>
  <p class="mb-4 text-justify">Копия заявления по числу лиц, участвующих в деле;</p>
  <p class="mb-4 text-justify">Копия постановления о возбуждении исполнительного производства;</p>
  <p class="mb-4 text-justify">Копия документа, подтверждающего основание приостановления.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">undefined: {{{applicant_fio}}}</p>
    <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
  </div>
</div>`,
  }
];
