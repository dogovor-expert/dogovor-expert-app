import type { LegalTemplate } from "../types";

/**
 * Пилотные заявления (волна 0): все — свободная форма (formKind: "free"),
 * максимум пользы, ноль риска с официальными бланками ведомств.
 * kind: "statement" + statementGroup + submitTo («Куда подавать») +
 * sampleValues (режим «образец заполнения»).
 */

function stmtHead(title: string): string {
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

function stmtSign(): string {
  return `
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">{{sender_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
      <p class="mt-2">«{{date}}»</p>
    </div>
  </div>
</div>`;
}

function stmtBaseFields(): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "sender_name", label: "Заявитель (ФИО)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_address", label: "Адрес заявителя", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_phone", label: "Телефон заявителя", type: "text", defaultValue: "", category: "sender" },
    { id: "recipient_name", label: "Кому (орган/должностное лицо)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
    { id: "recipient_address", label: "Адрес получателя", type: "text", defaultValue: "", category: "recipient" },
  ];
}

export const TEMPLATES_STATEMENTS: LegalTemplate[] = [
  {
    id: "stmt-fssp-execution",
    name: "Заявление о возбуждении исполнительного производства",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ «Об исполнительном производстве» (ст. 30)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление судебному приставу о возбуждении исполнительного производства: шапка «куда/от кого», основание (исполнительный лист), сумма, реквизиты для перечисления. Пристав возбуждает ИП за 3 дня.",
    suggestedDocs: ["claim-generic", "lawsuit-statement"],
    submitTo: {
      where: "ОСП по месту жительства должника (или нахождения его имущества)",
      term: "пристав возбуждает ИП за 3 дня со дня поступления заявления",
      fee: "бесплатно",
      attach: "исполнительный лист (оригинал)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОСП по г. Москве",
      recipient_address: "г. Москва",
      exec_doc: "исполнительный лист № 123456, выданный 10.01.2026 Пресненским районным судом г. Москвы по делу № 2-1234/2026",
      debtor_name: "Петров Петр Петрович",
      sum: "250000",
      account: "№ 40817810XXXXXXXXXXXXXX в ПАО «Банк»",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "exec_doc", label: "Исполнительный документ (№, дата, кем выдан)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "debtor_name", label: "Должник (ФИО/наименование)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "sum", label: "Сумма взыскания (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "account", label: "Счёт для перечисления взысканного", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о возбуждении исполнительного производства") +
      `
  <p class="mb-4 text-justify">
    Прошу возбудить исполнительное производство на основании {{exec_doc}} о взыскании с {{debtor_name}} в мою пользу
    <strong>{{sum}} ({{sum_words}})</strong> рублей (ст. 30 Федерального закона от 02.10.2007 № 229-ФЗ «Об исполнительном производстве»).
  </p>
  <p class="mb-4 text-justify">
    Прошу перечислить взысканные денежные средства на мой счёт {{account}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> исполнительный документ (оригинал).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-prosecutor-complaint",
    name: "Жалоба в прокуратуру",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ № 59-ФЗ «О порядке рассмотрения обращений граждан», ФЗ «О прокуратуре РФ»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в прокуратуру на нарушение прав: шапка, суть нарушения, какие законы нарушены, требование провести проверку. Срок рассмотрения — 30 дней.",
    suggestedDocs: ["claim-generic", "lawsuit-statement"],
    submitTo: {
      where: "прокуратура по месту нарушения (лично, почтой или через интернет-приёмную)",
      term: "30 дней со дня регистрации обращения",
      fee: "бесплатно",
      attach: "копии документов, подтверждающих нарушение",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Прокурору г. Москвы",
      recipient_address: "г. Москва",
      violation: "управляющая компания ООО «Жилсервис» с января 2026 года начисляет плату за отопление по нормативу при наличии общедомового прибора учёта",
      laws: "ст. 157 ЖК РФ, п. 42(1) Правил № 354",
      demand: "провести проверку, обязать произвести перерасчёт и привлечь виновных к ответственности",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "violation", label: "Суть нарушения (что, где, когда)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "laws", label: "Какие нормы нарушены (статьи)", type: "text", defaultValue: "", category: "contract" },
      { id: "demand", label: "Что просите (проверка, перерасчёт, привлечь к ответственности)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба") +
      `
  <p class="mb-4 text-justify">
    Довожу до Вашего сведения о нарушении моих прав: {{violation}}.
  </p>
  {{#laws}}<p class="mb-4 text-justify">
    Указанные действия нарушают: {{laws}}.
  </p>{{/laws}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь Федеральным законом от 02.05.2006 № 59-ФЗ «О порядке рассмотрения обращений граждан Российской Федерации»
    и Федеральным законом «О прокуратуре Российской Федерации», прошу: {{demand}}.
  </p>
  <p class="mb-4 text-justify">
    О результатах проверки и принятом решении прошу сообщить мне в установленный законом срок.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-vacation",
    name: "Заявление о предоставлении отпуска",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 114, 122–123)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление работодателю о предоставлении ежегодного оплачиваемого отпуска: даты начала и длительность. Оплачиваемый отпуск — 28 календарных дней в год.",
    suggestedDocs: ["employment-contract", "vacation-order"],
    submitTo: {
      where: "руководителю организации (через отдел кадров)",
      term: "отпускные выплачиваются за 3 дня до начала отпуска",
      fee: "бесплатно",
      attach: "не требуется (по графику отпусков)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      position: "менеджер отдела продаж",
      start_date: "2026-10-12",
      days: "14",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "position", label: "Должность заявителя", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "start_date", label: "Дата начала отпуска", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "days", label: "Количество календарных дней", type: "number", defaultValue: "14", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении отпуска") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить мне ежегодный оплачиваемый отпуск продолжительностью {{days}} календарных дней с «{{start_date}}»
    (ст. 114, 122 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Должность заявителя: {{position}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-recalc",
    name: "Заявление о перерасчёте платы за ЖКУ",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ПП РФ № 354 (п. 86–97), ЖК РФ (ст. 157)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в управляющую компанию о перерасчёте платы за коммунальные услуги: временное отсутствие, некачественная услуга или ошибка в начислениях.",
    suggestedDocs: ["claim-generic", "lawsuit-statement"],
    submitTo: {
      where: "управляющая компания / ТСЖ / ресурсоснабжающая организация",
      term: "перерасчёт в течение 5 рабочих дней после обращения",
      fee: "бесплатно",
      attach: "документы, подтверждающие основание (билеты, акт, счета)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      reason: "временное отсутствие в жилом помещении с 01.08.2026 по 20.08.2026 (командировка)",
      service: "холодное и горячее водоснабжение, водоотведение",
      period: "с 01.08.2026 по 20.08.2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "reason", label: "Основание перерасчёта (отсутствие, качество, ошибка)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "service", label: "Коммунальная услуга", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "period", label: "Период перерасчёта", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о перерасчёте платы за коммунальные услуги") +
      `
  <p class="mb-4 text-justify">
    Прошу произвести перерасчёт платы за коммунальные услуги ({{service}}) за период {{period}} в связи с тем, что {{reason}}
    (п. 86–97 Правил предоставления коммунальных услуг, утв. Постановлением Правительства РФ от 06.05.2011 № 354; ст. 157 Жилищного кодекса РФ).
  </p>
  <p class="mb-4 text-justify">
    Подтверждающие документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-postpone",
    name: "Ходатайство об отложении судебного заседания",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 167), АПК РФ (ст. 158)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Ходатайство в суд об отложении заседания: уважительная причина (болезнь, командировка) + просьба не рассматривать без участия. Подаётся до заседания.",
    suggestedDocs: ["lawsuit-statement", "objection-debt-claim"],
    submitTo: {
      where: "в суд, рассматривающий дело (через канцелярию или ГАС «Правосудие»)",
      term: "суд разрешает ходатайство в том же заседании",
      fee: "бесплатно",
      attach: "документы, подтверждающие уважительность причины",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      case_no: "№ 2-1234/2026",
      hearing_date: "2026-09-30",
      cause: "нахождение на стационарном лечении с 28.09.2026 (листок нетрудоспособности прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "hearing_date", label: "Дата заседания", type: "date", defaultValue: "", category: "court", validation: { required: true } },
      { id: "cause", label: "Уважительная причина", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об отложении судебного заседания") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится гражданское дело {{case_no}}. Судебное заседание назначено на «{{hearing_date}}».
  </p>
  <p class="mb-4 text-justify">
    Явиться в судебное заседание не могу по уважительной причине: {{cause}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 167 Гражданского процессуального кодекса Российской Федерации, прошу:
    отложить судебное заседание по делу {{case_no}} и не рассматривать дело в моё отсутствие.
  </p>
  <p class="mb-4 text-justify">
    Подтверждающие документы прилагаю.
  </p>` +
      stmtSign(),
  },
];
