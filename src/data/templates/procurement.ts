import type { LegalTemplate } from "../types";

/**
 * Кластер «Госзакупки» (44-ФЗ, 223-ФЗ, ФЗ-135).
 * Жалобы в ФАС, запросы разъяснений, протокол разногласий, претензия о неустойке,
 * возражение на РНП, уведомление об одностороннем отказе от контракта.
 * Все — свободная форма (formKind: "free"), kind: "statement",
 * statementGroup: "procurement" + submitTo («Куда подавать») + sampleValues.
 * Имена уникальны по каталогу.
 */

function procHead(title: string): string {
  return `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold text-right">
    <p>{{recipient_name}}</p>
    {{#recipient_address}}<p>{{recipient_address}}</p>{{/recipient_address}}
    <p class="mt-2">от {{sender_name}}</p>
    {{#sender_address}}<p>{{sender_address}}</p>{{/sender_address}}
    {{#sender_phone}}<p class="mt-1">тел.: {{sender_phone}}</p>{{/sender_phone}}
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">${title}</div>`;
}

function procSign(): string {
  return `
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">{{sender_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись / ЭП</p>
      <p class="mt-2">«{{date}}»</p>
    </div>
  </div>
</div>`;
}

function procBaseFields(): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "sender_name", label: "Заявитель (наименование/ФИО)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_address", label: "Адрес заявителя", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_phone", label: "Телефон/эл. почта заявителя", type: "text", defaultValue: "", category: "sender" },
    { id: "recipient_name", label: "Кому (орган/заказчик)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
    { id: "recipient_address", label: "Адрес получателя", type: "text", defaultValue: "", category: "recipient" },
  ];
}

export const TEMPLATES_PROCUREMENT: LegalTemplate[] = [
  {
    id: "procurement-fas-complaint-44",
    name: "Жалоба в ФАС на действия заказчика (44-ФЗ)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 105 ФЗ № 44-ФЗ «О контрактной системе»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в антимонопольную службу на действия (бездействие) заказчика, комиссии или оператора электронной площадки при закупке по 44-ФЗ: описание нарушения, доводы, требования. Подаётся через ЕИС в течение 10 дней.",
    suggestedDocs: ["procurement-fas-complaint-223", "procurement-clarification-44"],
    submitTo: {
      where: "территориальный орган ФАС России (либо ФАС России) — через ЕИС (zakupki.gov.ru), подписывается электронной подписью",
      term: "не позднее 10 дней с даты размещения в ЕИС протокола (итогов) либо со дня, когда заявитель узнал о нарушении; жалоба рассматривается в течение 5 рабочих дней",
      fee: "бесплатно",
      attach: "документы и сведения, подтверждающие доводы жалобы; данные извещения о закупке (через ЕИС прикладываются автоматически)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Поставщик»",
      sender_address: "г. Москва, ул. Деловая, д. 10, офис 5",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "Управление Федеральной антимонопольной службы по г. Москве",
      recipient_address: "г. Москва, ул. Мясницкая, д. 1",
      purchase_no: "№ 0123456789012345678",
      purchase_object: "поставке офисной мебели",
      customer_name: "ГБУ «Городской центр»",
      violation: "заказчик необоснованно отклонил заявку заявителя по основанию, не предусмотренному документацией",
      requirement: "признать жалобу обоснованной, выдать заказчику предписание об устранении нарушения",
      evidence: "заявка, протокол рассмотрения заявок, положение документации",
    },
    fields: [
      ...procBaseFields(),
      { id: "purchase_no", label: "Номер извещения о закупке", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "purchase_object", label: "Предмет закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "violation", label: "Существо нарушения", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "requirement", label: "Требования заявителя", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "evidence", label: "Прилагаемые доказательства", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate:
      procHead("Жалоба<br>на действия заказчика (44-ФЗ)") +
      `
  <p class="mb-4 text-justify">
    В рамках закупки {{purchase_no}} на {{purchase_object}}, заказчик — {{customer_name}},
    допущено нарушение законодательства о контрактной системе: {{violation}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    В подтверждение доводов прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 105 Федерального закона от 05.04.2013 № 44-ФЗ
    «О контрактной системе в сфере закупок товаров, работ, услуг для обеспечения государственных
    и муниципальных нужд», прошу {{requirement}}.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-fas-complaint-223",
    name: "Жалоба в ФАС на закупку по 223-ФЗ",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 5.1 ФЗ № 223-ФЗ; ст. 18.1 ФЗ № 135-ФЗ «О защите конкуренции»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в ФАС на действия заказчика при закупке по 223-ФЗ: нарушения положения о закупке, документации, порядка оценки заявок. Рассматривается по правилам ст. 18.1 Закона о защите конкуренции.",
    suggestedDocs: ["procurement-fas-complaint-44", "procurement-clarification-223"],
    submitTo: {
      where: "территориальный орган ФАС России — через ЕИС, подписывается электронной подписью",
      term: "не позднее 10 дней со дня, когда заявитель узнал о нарушении; жалоба рассматривается в течение 5 рабочих дней",
      fee: "бесплатно",
      attach: "документы, подтверждающие доводы; положение о закупке и документацию (при необходимости)",
    },
    sampleValues: {
      city: "Санкт-Петербург",
      date: "2026-09-24",
      sender_name: "ООО «Подрядчик»",
      sender_address: "г. Санкт-Петербург, Невский пр., д. 100, офис 20",
      sender_phone: "+7 (812) 000-00-00",
      recipient_name: "Управление ФАС по Санкт-Петербургу",
      recipient_address: "г. Санкт-Петербург, 4-я линия В.О., д. 13",
      purchase_no: "№ 3231234567890",
      purchase_object: "выполнению работ по капитальному ремонту",
      customer_name: "АО «Заказчик»",
      violation: "заказчик неверно применил критерии оценки заявок, установленные положением о закупке, что повлияло на определение победителя",
      requirement: "признать жалобу обоснованной и выдать предписание об устранении нарушения",
      evidence: "",
    },
    fields: [
      ...procBaseFields(),
      { id: "purchase_no", label: "Номер закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "purchase_object", label: "Предмет закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "violation", label: "Существо нарушения", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "requirement", label: "Требования заявителя", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "evidence", label: "Прилагаемые доказательства", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate:
      procHead("Жалоба<br>в ФАС (223-ФЗ)") +
      `
  <p class="mb-4 text-justify">
    В закупке {{purchase_no}} на {{purchase_object}}, проводимой заказчиком {{customer_name}},
    допущено нарушение требований законодательства и положения о закупке: {{violation}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    В подтверждение прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 5.1 Федерального закона от 18.07.2011 № 223-ФЗ
    «О закупках товаров, работ, услуг отдельными видами юридических лиц» и ст. 18.1 Федерального
    закона «О защите конкуренции», прошу {{requirement}}.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-clarification-44",
    name: "Запрос разъяснений положений извещения (44-ФЗ)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 42 ФЗ № 44-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Запрос заказчику о разъяснении положений извещения и документации о закупке по 44-ФЗ. Заказчик обязан разместить разъяснения в ЕИС в течение двух рабочих дней.",
    suggestedDocs: ["procurement-clarification-223", "procurement-fas-complaint-44"],
    submitTo: {
      where: "заказчику через ЕИС (функционал «Запрос разъяснений»), подписывается электронной подписью",
      term: "запрос подаётся не позднее чем за 3 дня до даты окончания срока подачи заявок; заказчик размещает разъяснения в течение 2 рабочих дней",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Участник»",
      sender_address: "г. Москва, ул. Примерная, д. 1",
      sender_phone: "+7 (495) 111-22-33",
      recipient_name: "ГБУ «Городской центр»",
      recipient_address: "г. Москва, ул. Центральная, д. 5",
      purchase_no: "№ 0123456789012345678",
      subject: "поставке офисной мебели",
      question: "какие именно характеристики товара по позиции № 3 являются критичными для оценки соответствия документации",
    },
    fields: [
      ...procBaseFields(),
      { id: "purchase_no", label: "Номер извещения о закупке", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "subject", label: "Предмет закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "question", label: "Вопрос по положениям документации", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      procHead("Запрос<br>о разъяснении положений извещения") +
      `
  <p class="mb-4 text-justify">
    Прошу дать разъяснения по положениям извещения {{purchase_no}} и документации о закупке
    на {{subject}}: {{question}}.
  </p>
  <p class="mb-4 text-justify">
    Разъяснения прошу разместить в единой информационной системе в порядке и сроки,
    установленные ст. 42 Федерального закона от 05.04.2013 № 44-ФЗ.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-clarification-223",
    name: "Запрос разъяснений документации о закупке (223-ФЗ)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 3.2 ФЗ № 223-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Запрос заказчику о разъяснении положений документации о закупке по 223-ФЗ. Сроки и порядок ответа определяются положением о закупке, а при их отсутствии — законом.",
    suggestedDocs: ["procurement-clarification-44", "procurement-fas-complaint-223"],
    submitTo: {
      where: "заказчику через ЕИС или иной электронный ресурс, указанный в положении о закупке",
      term: "сроки подачи запроса и ответа устанавливаются положением о закупке; если не установлены — заказчик отвечает в течение 3 рабочих дней",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Екатеринбург",
      date: "2026-09-24",
      sender_name: "ООО «Снабженец»",
      sender_address: "г. Екатеринбург, ул. Уральская, д. 12",
      sender_phone: "+7 (343) 222-33-44",
      recipient_name: "АО «Заказчик»",
      recipient_address: "г. Екатеринбург, ул. Промышленная, д. 3",
      purchase_no: "№ 3231234567890",
      subject: "выполнению работ по капитальному ремонту",
      question: "разъясните порядок подтверждения опыта исполнения аналогичных договоров по критерию «квалификация участника»",
    },
    fields: [
      ...procBaseFields(),
      { id: "purchase_no", label: "Номер закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "subject", label: "Предмет закупки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "question", label: "Вопрос по документации", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      procHead("Запрос<br>разъяснений документации о закупке") +
      `
  <p class="mb-4 text-justify">
    Прошу разъяснить положения документации о закупке {{purchase_no}} на {{subject}}:
    {{question}}.
  </p>
  <p class="mb-4 text-justify">
    Ответ прошу направить в порядке и сроки, предусмотренные положением о закупке
    и ст. 3.2 Федерального закона от 18.07.2011 № 223-ФЗ.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-protocol-disagreements",
    name: "Протокол разногласий к проекту контракта (44-ФЗ)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 83.2 ФЗ № 44-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Протокол разногласий победителя закупки к проекту контракта, размещённому заказчиком в ЕИС: изложение замечаний и предложений по условиям проекта. Заказчик рассматривает в течение трёх рабочих дней.",
    suggestedDocs: ["procurement-fas-complaint-44", "procurement-penalty-claim"],
    submitTo: {
      where: "заказчику через ЕИС (оператора электронной площадки), подписывается электронной подписью",
      term: "направляется в срок, установленный документацией (как правило, не позднее 5 дней с даты размещения проекта контракта); заказчик рассматривает 3 рабочих дня",
      fee: "бесплатно",
      attach: "документы, подтверждающие необходимость изменения условий (при наличии)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Поставщик»",
      sender_address: "г. Москва, ул. Деловая, д. 10, офис 5",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "ГБУ «Городской центр»",
      recipient_address: "г. Москва, ул. Центральная, д. 5",
      purchase_no: "№ 0123456789012345678",
      contract_subject: "поставке офисной мебели",
      disagreements: "пункт 3.2 проекта контракта устанавливает срок поставки 10 дней, что не соответствует извещению (30 дней); просим привести в соответствие",
      evidence: "",
    },
    fields: [
      ...procBaseFields(),
      { id: "purchase_no", label: "Номер извещения о закупке", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_subject", label: "Предмет контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "disagreements", label: "Замечания к проекту контракта", type: "textarea", defaultValue: "", category: "contract", rows: 4, validation: { required: true } },
      { id: "evidence", label: "Приложения", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate:
      procHead("Протокол разногласий<br>к проекту контракта") +
      `
  <p class="mb-4 text-justify">
    Рассмотрев проект контракта по закупке {{purchase_no}} на {{contract_subject}},
    заявляем следующие разногласия: {{disagreements}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    К протоколу разногласий прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 83.2 Федерального закона от 05.04.2013 № 44-ФЗ,
    прошу рассмотреть настоящий протокол разногласий и внести соответствующие изменения
    в проект контракта.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-penalty-claim",
    name: "Требование об уплате неустойки по контракту (госзакупки)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 34 ФЗ № 44-ФЗ; ст. 330, 331 ГК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Досудебное требование об уплате пени (неустойки) за просрочку исполнения или штрафа за ненадлежащее исполнение контракта по госзакупке. Содержит расчёт и реквизиты для перечисления.",
    suggestedDocs: ["claim-generic", "procurement-supplier-termination"],
    submitTo: {
      where: "стороне контракта (заказчику или поставщику) по адресу, указанному в контракте",
      term: "претензия рассматривается в срок, установленный контрактом; если срок не установлен — в течение 30 календарных дней со дня её направления",
      fee: "бесплатно",
      attach: "расчёт неустойки; документы, подтверждающие нарушение (акты, протоколы)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ГБУ «Городской центр»",
      sender_address: "г. Москва, ул. Центральная, д. 5",
      sender_phone: "+7 (495) 333-44-55",
      recipient_name: "ООО «Поставщик»",
      recipient_address: "г. Москва, ул. Деловая, д. 10, офис 5",
      contract_no: "№ 124/2026",
      contract_date: "2026-03-01",
      contract_subject: "поставке офисной мебели",
      violation: "поставка товара осуществлена с просрочкой на 15 календарных дней",
      sum: "45000",
      calculation: "по формуле П = Ц × 1/300 × СЦБ × Д, где Ц — цена контракта, Д — количество дней просрочки",
      deadline_days: "10",
    },
    fields: [
      ...procBaseFields(),
      { id: "contract_no", label: "Номер контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_date", label: "Дата контракта", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_subject", label: "Предмет контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "violation", label: "Существо нарушения", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "sum", label: "Сумма неустойки, руб.", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "calculation", label: "Расчёт неустойки", type: "textarea", defaultValue: "", category: "payment", rows: 2 },
      { id: "deadline_days", label: "Срок оплаты по претензии, дней", type: "number", defaultValue: "10", category: "payment" },
    ],
    previewTemplate:
      procHead("Требование (претензия)<br>об уплате неустойки") +
      `
  <p class="mb-4 text-justify">
    Между сторонами заключён контракт {{contract_no}} от {{contract_date}} на {{contract_subject}}.
    Со стороны {{recipient_name}} допущено нарушение: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    Согласно условиям контракта и ст. 34 Федерального закона от 05.04.2013 № 44-ФЗ
    начислена неустойка в размере {{sum}} ({{sum_words}}) рублей.
  </p>
  {{#calculation}}<p class="mb-4 text-justify">
    Расчёт: {{calculation}}.
  </p>{{/calculation}}
  <p class="mb-4 text-justify">
    На основании изложенного требую уплатить указанную сумму в течение {{deadline_days}}
    дней со дня получения настоящей претензии. В случае неоплаты буду вынужден обратиться
    в арбитражный суд с требованием о взыскании неустойки и судебных расходов.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-rnp-objection",
    name: "Возражение на включение в реестр недобросовестных поставщиков",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 104 ФЗ № 44-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Возражение поставщика в ФАС против включения сведений в реестр недобросовестных поставщиков (РНП): обоснование добросовестности, доказательства отсутствия вины, доводы против обращения заказчика.",
    suggestedDocs: ["procurement-supplier-termination", "procurement-fas-complaint-44"],
    submitTo: {
      where: "ФАС России (территориальное управление), рассматривающая обращение заказчика; копию — заказчику",
      term: "представляется к заседанию комиссии ФАС; срок указывается в уведомлении о времени и месте рассмотрения обращения",
      fee: "бесплатно",
      attach: "документы, подтверждающие добросовестность и отсутствие вины (переписка, акты, платёжные документы)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Подрядчик»",
      sender_address: "г. Москва, ул. Строителей, д. 8",
      sender_phone: "+7 (495) 444-55-66",
      recipient_name: "Управление ФАС России по г. Москве",
      recipient_address: "г. Москва, ул. Мясницкая, д. 1",
      customer_name: "ГБУ «Городской центр»",
      contract_no: "№ 124/2026",
      rnp_reason: "уклонение от исполнения контракта вследствие одностороннего отказа заказчика",
      objection_essence: "нарушение вызвано действиями самого заказчика, не передавшего исходные документы; поставщик неоднократно уведомлял заказчика о препятствиях",
      evidence: "переписка сторон, акты о приостановке работ, уведомления заказчика",
    },
    fields: [
      ...procBaseFields(),
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "contract_no", label: "Номер контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "rnp_reason", label: "Основание обращения заказчика", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "objection_essence", label: "Существо возражений", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "evidence", label: "Подтверждающие документы", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate:
      procHead("Возражение<br>на включение в реестр недобросовестных поставщиков") +
      `
  <p class="mb-4 text-justify">
    Заказчик {{customer_name}} обратился в антимонопольный орган с целью включения сведений
    об {{sender_name}} в реестр недобросовестных поставщиков по контракту {{contract_no}}.
    Основание обращения: {{rnp_reason}}.
  </p>
  <p class="mb-4 text-justify">
    Возражаю против включения сведений в реестр: {{objection_essence}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    В подтверждение прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 104 Федерального закона от 05.04.2013 № 44-ФЗ,
    прошу отказать во включении сведений в реестр недобросовестных поставщиков.
  </p>` +
      procSign(),
  },
  {
    id: "procurement-supplier-termination",
    name: "Уведомление об одностороннем отказе от контракта (поставщик)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "procurement",
    actSource: "ст. 95 ФЗ № 44-ФЗ; ст. 450.1, 715, 717 ГК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Уведомление заказчика об одностороннем отказе поставщика (подрядчика) от исполнения контракта по 44-ФЗ: причины отказа, требование о расчётах, правовые основания. Направляется через ЕИС.",
    suggestedDocs: ["procurement-penalty-claim", "procurement-rnp-objection"],
    submitTo: {
      where: "заказчику по адресу из контракта и через ЕИС (при технической возможности)",
      term: "уведомление направляется заблаговременно; расторжение контракта производится по правилам ст. 95 44-ФЗ с учётом даты уведомления",
      fee: "бесплатно",
      attach: "документы, подтверждающие основания отказа (акты, переписка, заключения)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Подрядчик»",
      sender_address: "г. Москва, ул. Строителей, д. 8",
      sender_phone: "+7 (495) 444-55-66",
      recipient_name: "ГБУ «Городской центр»",
      recipient_address: "г. Москва, ул. Центральная, д. 5",
      contract_no: "№ 124/2026",
      contract_subject: "выполнению работ по капитальному ремонту",
      reason: "заказчик не передал техническую документацию и не обеспечил доступ на объект, что делает исполнение контракта невозможным",
      requirement: "произвести расчёты за фактически выполненные работы",
      evidence: "уведомления о приостановке работ, акты, переписка",
    },
    fields: [
      ...procBaseFields(),
      { id: "contract_no", label: "Номер контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_subject", label: "Предмет контракта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "reason", label: "Основания отказа от исполнения", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "requirement", label: "Требование к заказчику", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "evidence", label: "Прилагаемые документы", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate:
      procHead("Уведомление<br>об одностороннем отказе от контракта") +
      `
  <p class="mb-4 text-justify">
    Между сторонами заключён контракт {{contract_no}} на {{contract_subject}}.
    В ходе его исполнения установлены обстоятельства, препятствующие дальнейшему исполнению: {{reason}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    В подтверждение прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 95 Федерального закона от 05.04.2013 № 44-ФЗ
    и ст. 450.1, 715, 717 Гражданского кодекса Российской Федерации, уведомляю об одностороннем
    отказе от исполнения контракта и требую {{requirement}}.
  </p>` +
      procSign(),
  },
];