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
    name: "Заявление о предоставлении отпуска (вне графика)",
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
  {
    id: "stmt-fssp-minimum",
    name: "Заявление приставу о сохранении прожиточного минимума",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ «Об исполнительном производстве» (ст. 30, 64.1, 101), ГПК РФ (ст. 446)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление судебному приставу о сохранении зарплаты и иных доходов в размере прожиточного минимума: пристав выносит постановление, банк снимает ограничения сверх минимума.",
    suggestedDocs: ["stmt-fssp-execution", "lawsuit-statement"],
    submitTo: {
      where: "судебному приставу, ведущему исполнительное производство",
      term: "рассмотрение ходатайства — до 10 дней (ст. 64.1 закона № 229-ФЗ)",
      fee: "бесплатно",
      attach: "справка о доходах, реквизиты счёта, на который поступает зарплата",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      income: "заработная плата в ПАО «Банк» на счёт № 40817810XXXXXXXXXXXXXX",
      pm: "17 733 рубля (прожиточный минимум трудоспособного населения)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "income", label: "Источник дохода и счёт (зарплата, пенсия)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pm", label: "Размер прожиточного минимума (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о сохранении заработной платы в размере прожиточного минимума") +
      `
  <p class="mb-4 text-justify">
    В Вашем производстве находится исполнительное производство {{case_no}}.
    Обращение взыскания производится на мой доход: {{income}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 4, 30, 64.1, 101 Федерального закона от 02.10.2007 № 229-ФЗ «Об исполнительном производстве»
    и ст. 446 Гражданского процессуального кодекса Российской Федерации прошу сохранить мне {{pm}}
    и вынести постановление об обращении взыскания с учётом сохранения прожиточного минимума.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> справка о доходах, выписка по счёту.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-delay",
    name: "Заявление об отсрочке или рассрочке исполнения",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 37), ГПК РФ (ст. 203)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба в суд об отсрочке или рассрочке исполнения решения: тяжёлое материальное положение, болезнь, иные уважительные обстоятельства. Пристав исполнение не откладывает — решает суд.",
    suggestedDocs: ["stmt-fssp-execution", "lawsuit-statement"],
    submitTo: {
      where: "в суд, вынесший решение (или по месту исполнения)",
      term: "суд рассматривает в судебном заседании с извещением сторон",
      fee: "бесплатно",
      attach: "документы о материальном положении, болезни, иждивенцах",
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
      mode: "рассрочку исполнения решения ежемесячными платежами по 10 000 рублей сроком на 12 месяцев",
      grounds: "единственный доход — пенсия 18 000 рублей, на иждивении несовершеннолетний ребёнок",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела / исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "mode", label: "Что просите (отсрочка до даты / рассрочка платежами)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
      { id: "grounds", label: "Обстоятельства, затрудняющие исполнение", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об отсрочке (рассрочке) исполнения судебного решения") +
      `
  <p class="mb-4 text-justify">
    Судом вынесено решение по делу {{case_no}}, возбуждено исполнительное производство.
    Исполнить решение единовременно не могу: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 37 Федерального закона «Об исполнительном производстве» и ст. 203 Гражданского процессуального
    кодекса Российской Федерации прошу предоставить {{mode}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> документы, подтверждающие обстоятельства.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-complaint",
    name: "Жалоба на действия судебного пристава",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 121–126)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба старшему судебному приставу на действие/бездействие пристава: срок подачи — 10 дней с момента нарушения, рассмотрение — 10 дней. Либо сразу в суд.",
    suggestedDocs: ["stmt-fssp-execution", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "старшему судебному приставу ОСП (или в суд по месту нахождения ОСП)",
      term: "10 дней на подачу жалобы, 10 дней на рассмотрение (ст. 122, 126 закона № 229-ФЗ)",
      fee: "бесплатно",
      attach: "копия постановления/акта пристава, доказательства нарушения сроков",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Старшему судебному приставу ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      violation: "постановление о возбуждении исполнительного производства не направлено должнику, арест наложен на счёт с детскими пособиями",
      demand: "признать действия незаконными, снять арест со счёта с пособиями и вернуть удержанные суммы",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "violation", label: "Какие действия/бездействие обжалуете", type: "textarea", defaultValue: "", category: "court", rows: 3, validation: { required: true } },
      { id: "demand", label: "Что просите (отменить, обязать, вернуть)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на действия (бездействие) судебного пристава-исполнителя") +
      `
  <p class="mb-4 text-justify">
    В производстве пристава находится исполнительное производство {{case_no}}. Считаю действия пристава незаконными: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 121–124 Федерального закона от 02.10.2007 № 229-ФЗ «Об исполнительном производстве» прошу: {{demand}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-evidence",
    name: "Ходатайство об истребовании доказательств",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 57), АПК РФ (ст. 66)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба к суду запросить доказательства, которые вы не можете получить сами: выписки, записи, документы у ответчика или госорганов. Укажите, что доказывает и где находится.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-postpone"],
    submitTo: {
      where: "в суд, рассматривающий дело (можно заявить устно в заседании)",
      term: "суд разрешает ходатайство сразу после заслушивания сторон",
      fee: "бесплатно",
      attach: "отказы в выдаче документов (если обращались сами)",
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
      evidence: "выписку по счёту ответчика за период с 01.01.2025 по 01.01.2026, подтверждающую переводы по договору займа",
      holder: "ПАО «Банк», г. Москва",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "evidence", label: "Какое доказательство истребовать и что оно подтверждает", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
      { id: "holder", label: "У кого находится (организация, адрес)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об истребовании доказательств") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится гражданское дело {{case_no}}.
    Для установления обстоятельств дела необходимо {{evidence}}.
  </p>
  <p class="mb-4 text-justify">
    Самостоятельно получить указанное доказательство не могу, оно находится у {{holder}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 57 Гражданского процессуального кодекса Российской Федерации прошу истребовать указанное доказательство у {{holder}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-expertise",
    name: "Ходатайство о назначении судебной экспертизы",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 79, 80, 98)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба назначить экспертизу (почерковедческую, строительную, оценочную): формулируйте вопросы эксперту сами — суд ставит их с учётом вашего списка. Расходы — с проигравшей стороны.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-evidence"],
    submitTo: {
      where: "в суд, рассматривающий дело",
      term: "суд выносит определение; производство по делу обычно приостанавливается",
      fee: "экспертиза оплачивается заявителем, взыскивается с проигравшей стороны (ст. 98 ГПК)",
      attach: "документы для исследования, предложения по экспертной организации",
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
      kind: "почерковедческую экспертизу подписи ответчика в договоре займа от 10.01.2025",
      questions: "1) выполнена ли подпись ответчиком? 2) одним ли лицом выполнены подпись и расшифровка?",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "kind", label: "Вид экспертизы и объект исследования", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "questions", label: "Вопросы эксперту", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о назначении судебной экспертизы") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится гражданское дело {{case_no}}. Для разрешения вопросов, требующих специальных знаний,
    необходима {{kind}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 79 Гражданского процессуального кодекса Российской Федерации прошу назначить экспертизу,
    поставив перед экспертом вопросы: {{questions}}.
  </p>
  <p class="mb-4 text-justify">
    Оплату экспертизы гарантирую, с последующим отнесением расходов на проигравшую сторону (ст. 98 ГПК РФ).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-fee-delay",
    name: "Ходатайство об отсрочке уплаты госпошлины",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 90), НК РФ (ст. 333.20, 333.41)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба отсрочить/рассрочить госпошлину или уменьшить её размер: прикладывается к иску. Нужны доказательства тяжёлого материального положения.",
    suggestedDocs: ["lawsuit-statement", "claim-generic"],
    submitTo: {
      where: "в суд вместе с исковым заявлением",
      term: "суд разрешает при принятии иска; отсрочка — до 1 года (ст. 333.41 НК)",
      fee: "бесплатно (само ходатайство)",
      attach: "справка о доходах, выписки по счетам, документы об иждивенцах",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      amount: "8 400 рублей",
      ask: "отсрочить уплату государственной пошлины до вынесения решения по делу",
      grounds: "единственный доход — пенсия, на счетах отсутствуют средства для единовременной уплаты",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "amount", label: "Размер госпошлины (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "ask", label: "Что просите (отсрочка / рассрочка / уменьшение)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "grounds", label: "Материальное положение (доходы, иждивенцы)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об отсрочке уплаты государственной пошлины") +
      `
  <p class="mb-4 text-justify">
    Мною подаётся исковое заявление, размер подлежащей уплате государственной пошлины составляет {{amount}}.
    Уплатить её единовременно не могу: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 90 Гражданского процессуального кодекса Российской Федерации и ст. 333.20, 333.41 Налогового
    кодекса Российской Федерации прошу {{ask}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> документы, подтверждающие материальное положение.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-security",
    name: "Заявление об обеспечении иска",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 139–142)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба арестовать имущество ответчика или запретить ему действия до решения суда: иначе ответчик успеет продать квартиру или вывести деньги. Суд решает в день подачи.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-expertise"],
    submitTo: {
      where: "в суд вместе с иском или в ходе процесса",
      term: "судья рассматривает в день поступления, без извещения ответчика (ст. 141 ГПК)",
      fee: "бесплатно",
      attach: "доказательства риска (объявления о продаже, выписки о движении средств)",
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
      measure: "наложить арест на квартиру ответчика по адресу: г. Москва, ул. Ленина, д. 1, кв. 10",
      grounds: "ответчик разместил объявление о продаже квартиры, непринятие мер сделает исполнение решения невозможным",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела (если уже возбуждено)", type: "text", defaultValue: "", category: "court" },
      { id: "measure", label: "Мера обеспечения (арест, запрет действий)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
      { id: "grounds", label: "Почему без обеспечения решение не исполнить", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об обеспечении иска") +
      `
  <p class="mb-4 text-justify">
    Мною предъявлен иск (дело {{case_no}}). Непринятие мер по обеспечению иска может затруднить или сделать невозможным
    исполнение решения суда: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 139–140 Гражданского процессуального кодекса Российской Федерации прошу: {{measure}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-quality",
    name: "Жалоба на некачественные коммунальные услуги",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ПП РФ № 354 (п. 104–113), ЖК РФ (ст. 157)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в УК на некачественную услугу (холодные батареи, грязная вода, неубранный подъезд): требуйте акт проверки, перерасчёт и устранение. УК обязана проверить в течение 2 часов.",
    suggestedDocs: ["stmt-housing-recalc", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "управляющая компания / ТСЖ (если игнор — в ГЖИ)",
      term: "проверка факта — до 2 часов; перерасчёт — в течение 5 рабочих дней",
      fee: "бесплатно",
      attach: "фото/видео, показания свидетелей, заявки в аварийную службу",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      problem: "с 10.09.2026 температура в квартире не поднимается выше +16°C при норме +18°C, заявки в аварийную службу № 45, 47 результата не дали",
      demand: "провести проверку, составить акт, устранить нарушение и произвести перерасчёт платы за отопление",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "problem", label: "Что случилось (услуга, даты, заявки)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "demand", label: "Что требуете (акт, устранить, перерасчёт)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на ненадлежащее качество коммунальных услуг") +
      `
  <p class="mb-4 text-justify">
    Довожу до Вашего сведения: {{problem}}.
  </p>
  <p class="mb-4 text-justify">
    На основании п. 104–113 Правил предоставления коммунальных услуг (ПП РФ от 06.05.2011 № 354)
    и ст. 157 Жилищного кодекса Российской Федерации прошу: {{demand}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-flood",
    name: "Заявление о заливе квартиры (составление акта)",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ПП РФ № 491 (п. 152), ГК РФ (ст. 1064), ЖК РФ (ст. 161)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в УК о заливе квартиры: требуйте составить акт осмотра в течение 12 часов — без акта суд не взыщет ущерб. Фиксируйте всё на фото до прихода комиссии.",
    suggestedDocs: ["stmt-housing-quality", "lawsuit-statement"],
    submitTo: {
      where: "управляющая компания / ТСЖ (акт составляет комиссия с вашим участием)",
      term: "акт — в течение 12 часов с момента обращения (п. 152 ПП № 491)",
      fee: "бесплатно",
      attach: "фото/видео залива, чеки на имущество (для последующей оценки ущерба)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      fact: "24.09.2026 в 08:00 обнаружен залив квартиры из квартиры № 10 сверху (прорвало гибкую подводку), повреждены потолок в кухне (~4 кв.м), ламинат в коридоре",
      demand: "направить комиссию для составления акта осмотра в течение 12 часов, установить причину залива и виновное лицо",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Когда и как произошёл залив, что повреждено", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "demand", label: "Что требуете (акт, причина, виновник)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о заливе жилого помещения") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании п. 152 Правил содержания общего имущества (ПП РФ от 13.08.2006 № 491)
    и ст. 161 Жилищного кодекса Российской Федерации прошу: {{demand}}.
  </p>
  <p class="mb-4 text-justify">
    Возмещение ущерба буду требовать с виновного лица на основании ст. 1064 Гражданского кодекса Российской Федерации.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-rospotrebnadzor",
    name: "Жалоба в Роспотребнадзор",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ № 59-ФЗ, Закон «О защите прав потребителей» (ст. 40), ФЗ № 52-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в Роспотребнадзор на продавца/исполнителя: обсчёт, просрочка, отказ в возврате, антисанитария. Сначала направьте претензию продавцу — это усилит жалобу.",
    suggestedDocs: ["claim-generic", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "территориальный орган Роспотребнадзора (лично, почтой, через сайт)",
      term: "30 дней со дня регистрации обращения",
      fee: "бесплатно",
      attach: "претензия продавцу с отметкой, чеки, договор, фото товара",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Руководителю Управления Роспотребнадзора по г. Москве",
      recipient_address: "г. Москва",
      violation: "магазин ООО «Торг» 10.09.2026 продал холодильник с неработающей морозильной камерой, претензию от 12.09.2026 о возврате денег проигнорировал",
      demand: "провести проверку, привлечь к административной ответственности и обязать вернуть денежные средства",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "violation", label: "Кто и как нарушил ваши права (даты, суммы)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "demand", label: "Что просите (проверка, штраф, обязать вернуть)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>в Роспотребнадзор") +
      `
  <p class="mb-4 text-justify">
    Довожу до Вашего сведения: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 40 Закона Российской Федерации «О защите прав потребителей» и Федерального закона от 02.05.2006
    № 59-ФЗ прошу: {{demand}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> копии претензии, чеков, договора.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-gti-complaint",
    name: "Жалоба в трудовую инспекцию (ГИТ)",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ТК РФ (ст. 356–357), ФЗ № 59-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в ГИТ на работодателя: задержка зарплаты, неоформление, незаконное увольнение. Можно просить не разглашать имя работодателю — инспекция обязана сохранить конфиденциальность.",
    suggestedDocs: ["stmt-vacation", "lawsuit-statement"],
    submitTo: {
      where: "государственная инспекция труда региона (лично, почтой, через онлайнинспекция.рф)",
      term: "30 дней; проверка работодателя — до 20 рабочих дней",
      fee: "бесплатно",
      attach: "трудовой договор, расчётные листки, приказы, переписка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Руководителю Государственной инспекции труда в г. Москве",
      recipient_address: "г. Москва",
      employer: "ООО «Ромашка», г. Москва",
      violation: "задержка выплаты заработной платы за июль–август 2026 года на общую сумму 140 000 рублей, расчётные листки не выдаются",
      demand: "провести проверку, обязать выплатить задолженность с компенсацией по ст. 236 ТК РФ и привлечь к ответственности",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "employer", label: "Работодатель (наименование, адрес)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "violation", label: "Нарушение трудовых прав (что, когда, суммы)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "demand", label: "Что просите (проверка, выплатить, привлечь)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>в государственную инспекцию труда") +
      `
  <p class="mb-4 text-justify">
    Я работаю в {{employer}}. Работодателем допущены нарушения трудового законодательства: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 356–357 Трудового кодекса Российской Федерации прошу: {{demand}}.
  </p>
  <p class="mb-4 text-justify">
    Прошу не разглашать мои данные работодателю (ст. 358 ТК РФ).
  </p>` +
      stmtSign(),
  },
  // NOTE: stmt-hr-dismiss дублирует id resignation-letter? Нет: resignation-letter — старый contract-id,
  // stmt-hr-dismiss — новый statement-id. Имена должны различаться для уникальности FAQ (faq.test.ts).
  {
    id: "stmt-hr-dismiss",
    name: "Заявление об увольнении по собственному желанию (в период отпуска)",
    seoTitle: "Заявление об увольнении в период отпуска, образец 2026",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 80)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление об увольнении по собственному желанию: предупреждение за 2 недели, в последний день — трудовая и полный расчёт. До истечения срока можно отозвать.",
    suggestedDocs: ["stmt-vacation", "employment-contract"],
    submitTo: {
      where: "руководителю организации (регистрируйте копию с отметкой о принятии)",
      term: "увольнение через 2 недели; расчёт и документы — в последний день (ст. 84.1, 140 ТК)",
      fee: "бесплатно",
      attach: "не требуется",
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
      last_day: "2026-10-08",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "position", label: "Должность заявителя", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "last_day", label: "Дата увольнения (последний рабочий день)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об увольнении по собственному желанию") +
      `
  <p class="mb-4 text-justify">
    Прошу уволить меня по собственному желанию «{{last_day}}» (ст. 80 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Должность заявителя: {{position}}. Прошу в последний рабочий день выдать трудовую книжку (сведения о трудовой
    деятельности) и произвести полный расчёт.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-salary",
    name: "Заявление о выплате задержанной зарплаты",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 142, 236)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Требование работодателю погасить долг по зарплате с компенсацией: за каждый день просрочки — 1/150 ключевой ставки ЦБ. При задержке over 15 дней можно приостановить работу.",
    suggestedDocs: ["stmt-gti-complaint", "lawsuit-statement"],
    submitTo: {
      where: "руководителю организации (копия с отметкой — себе)",
      term: "зарплата — каждые полмесяца; при нарушении — компенсация по ст. 236 ТК",
      fee: "бесплатно",
      attach: "расчётные листки, трудовой договор, выписка по счёту",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      debt: "заработная плата за июль–август 2026 года в размере 140 000 рублей",
      days: "45",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "debt", label: "Какая задолженность (период, сумма)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "days", label: "Дней просрочки", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о выплате задержанной заработной платы") +
      `
  <p class="mb-4 text-justify">
    Прошу выплатить мне {{debt}}. Просрочка составляет {{days}} дней.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 142, 236 Трудового кодекса Российской Федерации прошу также начислить и выплатить денежную
    компенсацию за каждый день задержки в размере не ниже 1/150 ключевой ставки ЦБ РФ.
  </p>
  <p class="mb-4 text-justify">
    В случае невыплаты буду вынужден обратиться в ГИТ, прокуратуру и суд.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-theft",
    name: "Заявление в полицию о краже",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141, 144), УК РФ (ст. 158)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление о краже: дежурная часть обязана принять в любое время, выдать талон-уведомление. Решение о возбуждении дела — за 3 суток (до 30 при проверке).",
    suggestedDocs: ["stmt-police-fraud", "lawsuit-statement"],
    submitTo: {
      where: "дежурная часть отдела полиции по месту кражи (лично или через 102)",
      term: "решение о возбуждении дела — 3 суток, при проверке — до 10–30 суток (ст. 144 УПК)",
      fee: "бесплатно",
      attach: "документы на похищенное, чеки, фото, записи камер",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "24.09.2026 в период с 09:00 до 18:00 из квартиры по адресу: г. Москва, ул. Ленина, д. 1, кв. 5 путём взлома замка похищены ноутбук (стоимость 80 000 рублей) и 30 000 рублей наличными",
      damage: "110 000 рублей, ущерб является для меня значительным",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Когда, откуда и что похищено", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "damage", label: "Сумма ущерба (значительность)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о преступлении (кража)") +
      `
  <p class="mb-4 text-justify">
    {{fact}}. Общий ущерб составил {{damage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу зарегистрировать настоящее
    заявление, провести проверку и возбудить уголовное дело по ст. 158 Уголовного кодекса Российской Федерации.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-fraud",
    name: "Заявление в полицию о мошенничестве",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141, 144), УК РФ (ст. 159)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление о мошенничестве (включая онлайн/телефонное): распишите, как вошли в доверие и куда ушли деньги. Приложите переписку, чеки переводов, номера телефонов.",
    suggestedDocs: ["stmt-police-theft", "lawsuit-statement"],
    submitTo: {
      where: "дежурная часть отдела полиции (кибермошенничество — также через сайт МВД)",
      term: "решение о возбуждении дела — 3 суток, при проверке — до 10–30 суток",
      fee: "бесплатно",
      attach: "переписка, скриншоты, чеки переводов, номера телефонов/счетов",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "20.09.2026 неизвестный, представившись сотрудником банка по телефону, убедил перевести 95 000 рублей на «безопасный счёт» № 40817810XXXXXXXXXXXXXX",
      damage: "95 000 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Как ввели в заблуждение, куда ушли деньги", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "damage", label: "Сумма ущерба", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о преступлении (мошенничество)") +
      `
  <p class="mb-4 text-justify">
    {{fact}}. Ущерб составил {{damage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу зарегистрировать настоящее
    заявление, провести проверку и     возбудить уголовное дело по ст. 159 Уголовного кодекса Российской Федерации.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-missing",
    name: "Заявление в полицию о пропаже человека",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), ФЗ «О полиции» (ст. 12)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление о безвестном исчезновении: подавайте сразу, правило «ждать 3 дня» — миф. Укажите приметы, одежду, телефон, последнее место. Примут в любом отделе.",
    suggestedDocs: ["stmt-police-theft", "stmt-police-fraud"],
    submitTo: {
      where: "любой отдел полиции (дежурная часть), сразу после исчезновения",
      term: "приём немедленно, розыскное дело — после проверки; детей ищут в первую очередь",
      fee: "бесплатно",
      attach: "фото пропавшего, номера телефонов, данные о транспорте/маршруте",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      person: "Иванов Иван Иванович, 1985 г.р.: рост 180 см, тёмные волосы, был одет в синюю куртку и джинсы, при себе телефон +7 (900) 765-43-21",
      lastseen: "24.09.2026 около 08:00 вышел из дома по адресу: г. Москва, ул. Ленина, д. 1 и не вернулся, телефон недоступен",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "person", label: "Кто пропал (ФИО, возраст, приметы, одежда, телефон)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "lastseen", label: "Когда и где видели в последний раз", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о безвестном исчезновении человека") +
      `
  <p class="mb-4 text-justify">
    Прошу принять меры к розыску: {{person}}.
  </p>
  <p class="mb-4 text-justify">
    Обстоятельства исчезновения: {{lastseen}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 12 Федерального закона «О полиции» прошу зарегистрировать заявление и организовать розыскные мероприятия.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-maternity",
    name: "Заявление о предоставлении отпуска по уходу за ребёнком",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 256), ФЗ № 255-ФЗ (ст. 11.1–11.2)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление на отпуск по уходу до 1,5/3 лет + пособие: подаёт мать, отец, бабушка — любой фактически ухаживающий. Пособие — 40% заработка. Место сохраняется.",
    suggestedDocs: ["stmt-vacation", "stmt-hr-dismiss"],
    submitTo: {
      where: "руководителю организации (кадры)",
      term: "пособие назначается в течение 10 дней; отпуск — со дня подачи",
      fee: "бесплатно",
      attach: "свидетельство о рождении, справка с места работы второго родителя о неиспользовании отпуска",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      child: "Иванов Пётр Иванович, 01.06.2026 г.р. (свидетельство о рождении № 12345)",
      period: "с 25.09.2026 до достижения ребёнком возраста трёх лет (с назначением пособия до 1,5 лет)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "child", label: "Ребёнок (ФИО, дата рождения, свидетельство)", type: "text", defaultValue: "", category: "child", validation: { required: true } },
      { id: "period", label: "Период отпуска (до 1,5 / до 3 лет)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении отпуска по уходу за ребёнком") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить мне отпуск по уходу за ребёнком — {{child}} — {{period}} (ст. 256 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Прошу назначить ежемесячное пособие по уходу за ребёнком (ст. 11.1 Федерального закона от 29.12.2006 № 255-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> копия свидетельства о рождении, справка с места работы второго родителя.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-remote",
    name: "Заявление о переводе на дистанционную работу",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 72, гл. 49.1, ст. 312.1–312.9)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба перевести на удалёнку: по соглашению сторон или временно (до 6 месяцев). Временный перевод по инициативе работодателя — только в исключительных случаях.",
    suggestedDocs: ["stmt-vacation", "employment-contract"],
    submitTo: {
      where: "руководителю организации",
      term: "по соглашению сторон — в любой срок; временный — до 6 месяцев",
      fee: "бесплатно",
      attach: "не требуется (основание для временного перевода указывает работодатель)",
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
      mode: "постоянную дистанционную работу с 01.10.2026 с сохранением должностных обязанностей и размера оплаты труда",
      grounds: "переезд в другой город, обязанности позволяют выполнять работу удалённо",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "position", label: "Должность заявителя", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "mode", label: "Какой перевод просите (постоянный / временный, с какой даты)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Причина перевода", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о переводе на дистанционную работу") +
      `
  <p class="mb-4 text-justify">
    Прошу перевести меня ({{position}}) на {{mode}} (ст. 72, гл. 49.1 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Основание: {{grounds}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-witness",
    name: "Ходатайство о вызове свидетелей",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 55, 69), АПК РФ (ст. 56, 88)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба допросить свидетелей: укажите ФИО, адрес и какие факты подтвердит каждый. Без пояснения «что подтвердит» суд может отказать.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-evidence"],
    submitTo: {
      where: "в суд, рассматривающий дело (письменно или устно в заседании)",
      term: "суд разрешает сразу; свидетели извещаются повестками",
      fee: "бесплатно",
      attach: "не требуется",
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
      witnesses: "Сидоров С.С. (г. Москва, ул. Мира, д. 2, кв. 3) — подтвердит передачу денег по расписке; Кузнецова А.А. (г. Москва, ул. Мира, д. 2, кв. 7) — присутствовала при разговоре о сроке возврата",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "witnesses", label: "Свидетели (ФИО, адрес, что подтвердят)", type: "textarea", defaultValue: "", category: "court", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о вызове свидетелей") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится гражданское дело {{case_no}}. Для установления обстоятельств дела прошу вызвать
    и допросить в качестве свидетелей: {{witnesses}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 55, 69 Гражданского процессуального кодекса Российской Федерации прошу удовлетворить настоящее ходатайство.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-docs",
    name: "Заявление о выдаче судебного решения и исполнительных документов",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 214, 428–429), АПК РФ (ст. 319)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба выдать копию решения и исполнительный лист: без исполнительного листа приставы не возбудят производство. Подаётся после вступления решения в силу.",
    suggestedDocs: ["stmt-fssp-execution", "lawsuit-statement"],
    submitTo: {
      where: "в канцелярию суда, вынесшего решение",
      term: "копия решения — в течение 5 дней; исполнительный лист — после вступления в силу",
      fee: "бесплатно",
      attach: "не требуется (паспорт для получения)",
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
      what: "заверенную копию решения суда и исполнительный лист для предъявления в службу судебных приставов",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "what", label: "Что выдать (копия решения / исполнительный лист / судебный приказ)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о выдаче судебных документов") +
      `
  <p class="mb-4 text-justify">
    Судом рассмотрено гражданское дело {{case_no}} с вынесением решения в мою пользу. Решение вступило в законную силу.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 214, 428 Гражданского процессуального кодекса Российской Федерации прошу выдать мне {{what}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-appeal",
    name: "Апелляционная жалоба на решение суда",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 320–322, 328)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба на решение мирового/районного суда в апелляцию: срок — месяц со дня принятия в окончательной форме. Подаётся через суд, вынесший решение. Новые доказательства — только если не могли представить раньше.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-postpone"],
    submitTo: {
      where: "через суд, принявший решение (адресуется в апелляционную инстанцию)",
      term: "месяц со дня принятия решения в окончательной форме (ст. 321 ГПК)",
      fee: "госпошлина — 50% от пошлины по иску (ст. 333.19 НК)",
      attach: "копия решения, квитанция о пошлине, новые доказательства с обоснованием",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Московский городской суд (через Пресненский районный суд г. Москвы)",
      recipient_address: "г. Москва",
      decision: "решение Пресненского районного суда г. Москвы от 10.09.2026 по делу № 2-1234/2026 об отказе во взыскании долга",
      errors: "суд не исследовал расписку от 10.01.2025 и показания свидетеля Сидорова С.С., неправильно применил ст. 807–808 ГК РФ",
      ask: "решение отменить и принять новое — о взыскании 250 000 рублей и процентов",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "decision", label: "Какое решение обжалуете (суд, дата, дело, суть)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "errors", label: "В чём незаконность (факты, нормы)", type: "textarea", defaultValue: "", category: "court", rows: 3, validation: { required: true } },
      { id: "ask", label: "Что просите (отменить / изменить, новое решение)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Апелляционная жалоба") +
      `
  <p class="mb-4 text-justify">
    {{decision}}. С решением не согласен: {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 320–322 Гражданского процессуального кодекса Российской Федерации прошу: {{ask}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> копия решения, квитанция об уплате госпошлины, копии жалобы по числу лиц.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-order-cancel",
    name: "Возражение на судебный приказ (отмена)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 128–130)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Отмена судебного приказа одним заявлением: срок — 10 дней с получения. Мотивировать не нужно — достаточно «не согласен». Суд отменяет, взыскатель идёт с иском.",
    suggestedDocs: ["lawsuit-statement", "stmt-appeal"],
    submitTo: {
      where: "мировому судье, вынесшему приказ",
      term: "10 дней со дня получения приказа (ст. 128 ГПК); пропуск — восстанавливайте",
      fee: "бесплатно",
      attach: "конверт со штемпелем (доказательство даты получения)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      order: "судебный приказ от 15.09.2026 по делу № 2-500/2026 о взыскании 60 000 рублей в пользу ООО «Кредит», получен 20.09.2026",
      disagree: "с требованиями не согласен, имеется спор о размере задолженности и начисленных процентах",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "order", label: "Какой приказ (суд, дата, дело, сумма, дата получения)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "disagree", label: "Почему не согласны (кратко, можно без мотивов)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Возражения<br>относительно исполнения судебного приказа") +
      `
  <p class="mb-4 text-justify">
    {{order}}.
  </p>
  <p class="mb-4 text-justify">
    {{disagree}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 128–129 Гражданского процессуального кодекса Российской Федерации прошу судебный приказ отменить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-search",
    name: "Заявление о розыске должника и его имущества",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 65)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба объявить розыск должника/ребёнка/имущества: пристав выносит постановление в 3-дневный срок. По алиментам и возмещению вреда — розыск обязателен.",
    suggestedDocs: ["stmt-fssp-execution", "stmt-fssp-complaint"],
    submitTo: {
      where: "судебному приставу, ведущему производство",
      term: "постановление о розыске — в течение 3 дней (ст. 65 закона № 229-ФЗ)",
      fee: "бесплатно",
      attach: "известные адреса, телефоны, данные об имуществе/авто должника",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      who: "должника Петрова П.П. и его автомобиля (госномер А123БВ777), местонахождение неизвестно с августа 2026 года",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "who", label: "Кого/что разыскивать (данные, последнее место)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об объявлении розыска") +
      `
  <p class="mb-4 text-justify">
    В Вашем производстве находится исполнительное производство {{case_no}}. Местонахождение {{who}} неизвестно,
    самостоятельно установить его не могу.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 65 Федерального закона от 02.10.2007 № 229-ФЗ «Об исполнительном производстве» прошу объявить розыск.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-travel-ban",
    name: "Заявление об ограничении выезда должника",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 67)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба запретить должнику выезд за границу: порог — 30 000 ₽ (10 000 ₽ по алиментам и возмещению вреда). Пристав обязан рассмотреть и вынести постановление.",
    suggestedDocs: ["stmt-fssp-execution", "stmt-fssp-search"],
    submitTo: {
      where: "судебному приставу, ведущему производство",
      term: "постановление — по инициативе пристава или по вашему заявлению (ст. 67 закона № 229-ФЗ)",
      fee: "бесплатно",
      attach: "расчёт задолженности, данные о загранпоездках должника (если есть)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      debt: "задолженность 250 000 рублей не погашена более 6 месяцев, должник уклоняется и планирует выезд за границу",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "debt", label: "Задолженность и уклонение (сумма, срок, факты)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об установлении временного ограничения на выезд должника") +
      `
  <p class="mb-4 text-justify">
    В Вашем производстве находится исполнительное производство {{case_no}}: {{debt}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 67 Федерального закона от 02.10.2007 № 229-ФЗ «Об исполнительном производстве» прошу установить
    должнику временное ограничение на выезд из Российской Федерации.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-meter",
    name: "Заявление о вводе счётчиков в эксплуатацию (опломбировка)",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ПП РФ № 354 (п. 81–81(9))",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявка в УК на ввод ИПУ в эксплуатацию: после установки счётчиков без акта их не примут к расчётам. УК обязана прийти в согласованную дату.",
    suggestedDocs: ["stmt-housing-recalc", "stmt-housing-quality"],
    submitTo: {
      where: "управляющая компания / ТСЖ / ресурсоснабжающая организация",
      term: "ввод в эксплуатацию — в согласованную дату, не позднее чем через месяц после заявки",
      fee: "бесплатно (первичный ввод)",
      attach: "паспорта счётчиков, акт установки (если ставил подрядчик)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      meters: "два счётчика холодной и горячей воды (зав. № 111, 222), установлены 20.09.2026",
      day: "30.09.2026 после 18:00",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "meters", label: "Какие счётчики (тип, номера, дата установки)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "day", label: "Удобная дата и время визита", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявка<br>на ввод приборов учёта в эксплуатацию") +
      `
  <p class="mb-4 text-justify">
    Прошу ввести в эксплуатацию приборы учёта: {{meters}} — по адресу: {{sender_address}}.
  </p>
  <p class="mb-4 text-justify">
    Прошу согласовать визит {{day}} (п. 81 Правил № 354). Паспорта приборов учёта прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-capital",
    name: "Заявление о проведении капремонта / жалоба на его отсутствие",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ЖК РФ (ст. 166–174, 189–191)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Обращение о капремонте дома: взносы платят все, а ремонт откладывают. Требуйте включить дом в краткосрочную программу или перенести сроки.",
    suggestedDocs: ["stmt-housing-quality", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "региональный оператор капремонта / администрация (копия — в ГЖИ)",
      term: "ответ по 59-ФЗ — 30 дней; решение о переносе сроков — через комиссию",
      fee: "бесплатно",
      attach: "фото износа, акты УК, квитанции о взносах",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Руководителю Фонда капитального ремонта",
      recipient_address: "г. Москва",
      problem: "кровля дома 1975 года постройки протекает с 2023 года, ремонт запланирован на 2035 год, взносы уплачиваю исправно",
      demand: "перенести срок капремонта кровли на ближайшую краткосрочную программу и провести обследование",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "problem", label: "Что изношено, какой срок стоит в программе", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "demand", label: "Что просите (обследование, перенос сроков)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о капитальном ремонте общего имущества") +
      `
  <p class="mb-4 text-justify">
    {{problem}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 166–174, 189–191 Жилищного кодекса Российской Федерации прошу: {{demand}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-mil-postpone",
    name: "Заявление об отсрочке от призыва",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "military",
    actSource: "ФЗ № 53-ФЗ «О воинской обязанности» (ст. 24)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в призывную комиссию об отсрочке: учёба, здоровье, семейные обстоятельства. Прикладывайте документы заранее — комиссия решает на основании дела.",
    suggestedDocs: ["stmt-mil-appeal", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "призывная комиссия (через военкомат по месту учёта)",
      term: "решение принимается при прохождении призывных мероприятий",
      fee: "бесплатно",
      attach: "справка с места учёбы, медицинские документы, свидетельства о детях",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю призывной комиссии района",
      recipient_address: "г. Москва",
      grounds: "обучаюсь по очной форме в вузе с госаккредитацией (справка прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "grounds", label: "Основание отсрочки (учёба, здоровье, семья)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении отсрочки от призыва") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить мне отсрочку от призыва на военную службу: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 24 Федерального закона от 28.03.1998 № 53-ФЗ «О воинской обязанности и военной службе» прошу
    рассмотреть настоящее заявление на заседании призывной комиссии.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> подтверждающие документы.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-mil-appeal",
    name: "Жалоба на решение призывной комиссии",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "military",
    actSource: "ФЗ № 53-ФЗ (ст. 28), КАС РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Обжалование решения о призыве: в вышестоящую комиссию или в суд. Подача жалобы приостанавливает отправку до рассмотрения.",
    suggestedDocs: ["stmt-mil-postpone", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "призывная комиссия субъекта РФ или суд (на выбор)",
      term: "выполнение решения приостанавливается до рассмотрения жалобы (ст. 28 закона № 53-ФЗ)",
      fee: "бесплатно (в комиссию); в суд — госпошлина 300 ₽",
      attach: "копия решения комиссии, медицинские документы, повестки",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю призывной комиссии г. Москвы",
      recipient_address: "г. Москва",
      decision: "решение районной призывной комиссии от 20.09.2026 о призыве на военную службу",
      errors: "не учтено заболевание (категория «В» по заключению врачей), документы не приобщены к делу",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "decision", label: "Какое решение обжалуете (комиссия, дата)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "errors", label: "В чём незаконность", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на решение призывной комиссии") +
      `
  <p class="mb-4 text-justify">
    {{decision}}. С решением не согласен: {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 28 Федерального закона «О воинской обязанности и военной службе» прошу решение отменить.
    Выполнение обжалуемого решения прошу приостановить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-notary-inherit",
    name: "Заявление нотариусу о принятии наследства",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ГК РФ (ст. 1112–1115, 1152–1154)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление нотариусу о принятии наследства: срок — 6 месяцев со дня смерти. Пропустили срок — только через суд (восстановление) или фактическое принятие с доказательствами.",
    suggestedDocs: ["lawsuit-statement", "claim-generic"],
    submitTo: {
      where: "нотариус по последнему месту жительства наследодателя",
      term: "6 месяцев со дня открытия наследства (ст. 1154 ГК); свидетельство — после 6 месяцев",
      fee: "тариф + госпошлина 0,3% (близким) / 0,6% (остальным) от стоимости",
      attach: "свидетельство о смерти, документы о родстве/завещание, документы на имущество",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Нотариусу г. Москвы Петровой А.А.",
      recipient_address: "г. Москва",
      deceased: "Петров Петр Петрович, умер 10.08.2026 (свидетельство о смерти № 999)",
      relation: "сын (свидетельство о рождении № 111)",
      estate: "квартира по адресу: г. Москва, ул. Ленина, д. 1, кв. 10",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "deceased", label: "Наследодатель (ФИО, дата смерти, свидетельство)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "relation", label: "Родство / завещание", type: "text", defaultValue: "", category: "heir", validation: { required: true } },
      { id: "estate", label: "Наследственное имущество", type: "textarea", defaultValue: "", category: "property", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о принятии наследства") +
      `
  <p class="mb-4 text-justify">
    {{deceased}}. Я являюсь наследником: {{relation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1112, 1152–1154 Гражданского кодекса Российской Федерации принимаю наследство, в том числе: {{estate}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> свидетельство о смерти, документы о родстве, документы на имущество.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-divorce-alimony-order",
    name: "Заявление о взыскании алиментов (судебный приказ)",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "СК РФ (ст. 80–83, 106–108), ГПК РФ (ст. 122–124)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Алименты в долях через судебный приказ — за 5 дней без заседаний: 1/4 на одного ребёнка, 1/3 на двоих, 1/2 на троих. Если нужна твёрдая сумма — подавайте иск.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-order-cancel"],
    submitTo: {
      where: "мировой судья по вашему месту жительства или месту жительства должника",
      term: "приказ выносится за 5 дней без вызова сторон (ст. 126 ГПК)",
      fee: "по требованиям об алиментах истец освобождён от пошлины (ст. 333.36 НК)",
      attach: "свидетельства о рождении детей, справка о составе семьи",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      debtor: "Иванов Иван Иванович, г. Москва",
      kids: "Иванов Пётр Иванович, 01.06.2020 г.р. (свидетельство № 12345)",
      share: "1/4 (одной четверти) всех видов заработка и иного дохода ежемесячно",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "debtor", label: "Должник (ФИО, адрес)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "kids", label: "Дети (ФИО, даты рождения, свидетельства)", type: "textarea", defaultValue: "", category: "child", rows: 2, validation: { required: true } },
      { id: "share", label: "Доля (1/4 — один ребёнок, 1/3 — двое, 1/2 — трое+)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о вынесении судебного приказа о взыскании алиментов") +
      `
  <p class="mb-4 text-justify">
    Должник {{debtor}} не предоставляет содержание несовершеннолетним детям: {{kids}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 80–83, 122 Семейного кодекса Российской Федерации и ст. 122–124 Гражданского процессуального
    кодекса Российской Федерации прошу взыскать алименты в размере {{share}} — начиная со дня подачи заявления
    и до совершеннолетия детей.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-bank-chargeback",
    name: "Заявление в банк об оспаривании операции (чарджбэк)",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 161-ФЗ «О НПС» (ст. 9), ГК РФ (ст. 854, 1102)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Оспаривание списания: несанкционированная операция или неоказанная услуга. По 161-ФЗ сообщите банку немедленно — иначе в возмещении могут отказать.",
    suggestedDocs: ["stmt-police-fraud", "claim-generic"],
    submitTo: {
      where: "в свой банк (отделение, приложение, горячая линия)",
      term: "сообщить — не позднее дня, следующего за днём получения уведомления (ст. 9 закона № 161-ФЗ)",
      fee: "бесплатно",
      attach: "выписка, чеки, переписка с продавцом, претензия продавцу",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ПАО «Банк»",
      recipient_address: "г. Москва",
      op: "24.09.2026 со счёта № 40817810XXXXXXXXXXXXXX списано 25 000 рублей в пользу неизвестного получателя (операцию не совершал, карту не передавал)",
      ask: "признать операцию несанкционированной, вернуть 25 000 рублей и заблокировать карту",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "op", label: "Операция (дата, сумма, счёт, что не так)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите (вернуть, заблокировать, расследовать)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об оспаривании операции по счёту") +
      `
  <p class="mb-4 text-justify">
    {{op}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 9 Федерального закона «О национальной платёжной системе» и ст. 854 Гражданского кодекса
    Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-bank-restructure",
    name: "Заявление о реструктуризации кредита / кредитных каникулах",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 353-ФЗ «О потребительском кредите» (ст. 6.1-1, 6.1-2)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба о кредитных каникулах или реструктуризации: при падении дохода на 30%+ имеете право на льготный период до 6 месяцев. Банк обязан рассмотреть за 5 дней.",
    suggestedDocs: ["stmt-bank-chargeback", "claim-generic"],
    submitTo: {
      where: "в банк-кредитор (любым способом из договора)",
      term: "рассмотрение требования о каникулах — 5 дней (ст. 6.1-1 закона № 353-ФЗ)",
      fee: "бесплатно",
      attach: "документы о падении дохода, болезни, потере работы",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ПАО «Банк»",
      recipient_address: "г. Москва",
      loan: "кредитный договор № 777 от 10.01.2025, остаток 400 000 рублей, платёж 15 000 рублей",
      grounds: "доход упал более чем на 30% (увольнение, справка из ЦЗН прилагается)",
      ask: "предоставить льготный период на 6 месяцев (кредитные каникулы)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "loan", label: "Кредитный договор (№, дата, остаток, платёж)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "grounds", label: "Трудная ситуация (доходы, болезнь, увольнение)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите (каникулы / снижение платежа / продление срока)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении льготного периода (кредитные каникулы)") +
      `
  <p class="mb-4 text-justify">
    {{loan}}. В настоящее время: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 6.1-1 Федерального закона «О потребительском кредите (займе)» прошу {{ask}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> подтверждающие документы.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-insurance-refuse",
    name: "Заявление об отказе от страховки по кредиту (период охлаждения)",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "Указание ЦБ № 3854-У, ГК РФ (ст. 958)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Отказ от навязанной страховки: 30 дней на возврат полной премии (если не было страховых случаев). Деньги возвращают за 7 рабочих дней.",
    suggestedDocs: ["stmt-bank-restructure", "stmt-rospotrebnadzor"],
    submitTo: {
      where: "в страховую компанию (или через банк, если договор коллективный)",
      term: "30 календарных дней с заключения; возврат — за 7 рабочих дней",
      fee: "бесплатно",
      attach: "полис/договор страхования, квитанция об оплате премии",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ООО «СК Страховщик»",
      recipient_address: "г. Москва",
      policy: "договор страхования № 555 от 20.09.2026, премия 40 000 рублей, страховых случаев не было",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "policy", label: "Договор страхования (№, дата, премия)", type: "text", defaultValue: "", category: "insurance", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об отказе от договора страхования") +
      `
  <p class="mb-4 text-justify">
    {{policy}}.
  </p>
  <p class="mb-4 text-justify">
    На основании Указания Банка России от 20.11.2015 № 3854-У и ст. 958 Гражданского кодекса Российской Федерации
    отказываюсь от договора страхования и прошу вернуть уплаченную страховую премию в полном объёме
    на мой счёт в течение 7 рабочих дней.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-rent-deposit",
    name: "Требование о возврате залога за аренду",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ГК РФ (ст. 329, 381.1, 622)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Досудебное требование арендодателю вернуть обеспечительный платёж: квартира сдана без замечаний, удержание незаконно. Следующий шаг — суд с процентами.",
    suggestedDocs: ["stmt-housing-recalc", "lawsuit-statement"],
    submitTo: {
      where: "арендодателю (заказным письмом или вручите под подпись)",
      term: "срок возврата — из договора; разумный срок для ответа — 10–14 дней",
      fee: "бесплатно",
      attach: "договор аренды, акт приёма-передачи при выезде, расписка о залоге",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Сидорову С.С.",
      recipient_address: "г. Москва",
      fact: "по договору аренды от 01.09.2025 внесён обеспечительный платёж 50 000 рублей; квартира возвращена 20.09.2026 по акту без замечаний, залог не возвращён",
      ask: "вернуть обеспечительный платёж 50 000 рублей в течение 10 дней",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Договор, залог, возврат квартиры (даты, суммы)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что требуете (сумма, срок)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Требование<br>о возврате обеспечительного платежа") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 329, 381.1 Гражданского кодекса Российской Федерации требую: {{ask}}.
    В противном случае обращусь в суд с требованием о взыскании залога, процентов (ст. 395 ГК РФ) и судебных расходов.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-tax-deduction",
    name: "Заявление на налоговый вычет (ИИС/имущественный/социальный)",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "НК РФ (ст. 78, 219–221)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в налоговую о возврате НДФЛ: имущественный (покупка жилья), социальный (лечение, обучение), инвестиционный (ИИС). Подаётся с декларацией 3-НДФЛ.",
    suggestedDocs: ["stmt-bank-chargeback", "claim-generic"],
    submitTo: {
      where: "в налоговую инспекцию (лично, почтой, через ЛК налогоплательщика)",
      term: "камеральная проверка — 3 месяца; возврат — в течение месяца после неё",
      fee: "бесплатно",
      attach: "декларация 3-НДФЛ, договор, чеки, справка 2-НДФЛ",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ИФНС России № 1 по г. Москве",
      recipient_address: "г. Москва",
      kind: "имущественный налоговый вычет по расходам на покупку квартиры (договор от 10.01.2025, 3 000 000 рублей)",
      amount: "260 000 рублей",
      account: "счёт № 40817810XXXXXXXXXXXXXX в ПАО «Банк»",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "kind", label: "Какой вычет (имущественный / социальный / ИИС)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "amount", label: "Сумма к возврату (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "account", label: "Счёт для возврата налога", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о возврате налога (налоговый вычет)") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить {{kind}} за 2025 год и вернуть излишне уплаченный НДФЛ в сумме {{amount}}
    (ст. 78, 219–221 Налогового кодекса Российской Федерации, декларация 3-НДФЛ прилагается).
  </p>
  <p class="mb-4 text-justify">
    Прошу перечислить денежные средства на {{account}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-cb-complaint",
    name: "Жалоба в Банк России (на банк/МФО/страховую)",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ № 86-ФЗ (ст. 4, 76.1), ФЗ № 59-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в ЦБ на финансовую организацию: навязывание услуг, блокировка счёта, отказ в каникулах. ЦБ не решает денежные споры, но штрафует и обязывает устранить нарушение.",
    suggestedDocs: ["stmt-bank-chargeback", "stmt-fin-ombudsman"],
    submitTo: {
      where: "в Банк России (интернет-приёмная cbr.ru)",
      term: "30 дней со дня регистрации обращения",
      fee: "бесплатно",
      attach: "договор, переписка с организацией, её ответ (или отказ)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Банк России (интернет-приёмная)",
      recipient_address: "",
      org: "ПАО «Банк»",
      violation: "банк отказал в кредитных каникулах без объяснения причин, хотя доход упал более чем на 30% и документы приложены",
      ask: "провести проверку и обязать рассмотреть требование по ст. 6.1-1 закона № 353-ФЗ",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "org", label: "Организация (банк/МФО/СК)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "violation", label: "Нарушение (что, когда, чем подтверждается)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>в Банк России") +
      `
  <p class="mb-4 text-justify">
    {{org}}: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании Федерального закона от 02.05.2006 № 59-ФЗ прошу: {{ask}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> копии договора, переписки, ответа организации.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fin-ombudsman",
    name: "Обращение к финансовому уполномоченному",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ № 123-ФЗ «Об уполномоченном по правам потребителей финансовых услуг»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Досудебное взыскание с банка/СК/МФО до 500 000 ₽: решение омбудсмена обязательно для организации (как исполнительный документ). В суд — только после омбудсмена.",
    suggestedDocs: ["stmt-cb-complaint", "stmt-bank-chargeback"],
    submitTo: {
      where: "финансовому уполномоченному (finombudsman.ru, лично, почтой)",
      term: "решение — 15–30 рабочих дней; обязательно для финансовой организации",
      fee: "бесплатно",
      attach: "претензия организации с отметкой, её ответ, договор, расчёты",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Финансовому уполномоченному",
      recipient_address: "",
      org: "ООО «СК Страховщик»",
      claim: "отказ в выплате страхового возмещения 120 000 рублей по договору № 555 (претензию от 01.09.2026 проигнорировали)",
      ask: "взыскать 120 000 рублей страхового возмещения и неустойку",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "org", label: "Финансовая организация", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim", label: "Суть требования (сумма, претензия, ответ)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите взыскать", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Обращение<br>к финансовому уполномоченному") +
      `
  <p class="mb-4 text-justify">
    {{org}}: {{claim}}.
  </p>
  <p class="mb-4 text-justify">
    На основании Федерального закона от 04.06.2018 № 123-ФЗ прошу: {{ask}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> претензия, ответ организации, договор, расчёты.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-gibdd-appeal",
    name: "Жалоба на постановление ГИБДД (штраф)",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "КоАП РФ (ст. 30.1–30.3)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Обжалование штрафа ГИБДД: 10 суток с получения. Вышестоящему должностному лицу или в суд — на выбор. Камера ошиблась, за рулём были не вы — шансы высоки.",
    suggestedDocs: ["stmt-prosecutor-complaint", "claim-generic"],
    submitTo: {
      where: "вышестоящему должностному лицу ГИБДД или в районный суд по месту нарушения",
      term: "10 суток на подачу (ст. 30.3 КоАП); рассмотрение — 10 дней / 2 месяца в суде",
      fee: "бесплатно (госпошлина не взимается)",
      attach: "копия постановления, фото/схема, записи регистратора, договор продажи авто",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ГИБДД (вышестоящему должностному лицу)",
      recipient_address: "г. Москва",
      ticket: "постановление № 12345 от 15.09.2026 о штрафе 5 000 рублей за превышение скорости (камера, А123БВ777)",
      grounds: "автомобиль 01.09.2026 продан по ДКП (копия прилагается), за рулём находился новый собственник",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "ticket", label: "Постановление (№, дата, сумма, нарушение)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Почему незаконно (продажа, ошибка камеры, не вы за рулём)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на постановление по делу об административном правонарушении") +
      `
  <p class="mb-4 text-justify">
    {{ticket}}. С постановлением не согласен: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 30.1–30.3 Кодекса Российской Федерации об административных правонарушениях прошу постановление отменить,
    производство по делу прекратить.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> копия постановления, подтверждающие документы.
  </p>` +
      stmtSign(),
  },
  // ================= ВОЛНА 4: +100 заявлений =================
  {
    id: "stmt-fssp-excess-return",
    name: "Заявление о возврате излишне удержанных приставом сумм",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 70, 110–111)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Возврат переплаты: пристав удержал больше долга или списал с защищённых выплат (пособия, алименты). Деньги возвращают с депозита ОСП, а если ушли взыскателю — через суд.",
    suggestedDocs: ["stmt-fssp-complaint", "stmt-fssp-minimum"],
    submitTo: {
      where: "судебному приставу, ведущему производство",
      term: "возврат с депозита — до 5 операционных дней после заявления",
      fee: "бесплатно",
      attach: "выписки по счетам, расчёт переплаты, документы о защищённых выплатах",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      over: "удержано 320 000 рублей при долге 250 000 рублей; переплата 70 000 рублей подтверждается выпиской",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "over", label: "Сколько излишне удержано (расчёт, выписки)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о возврате излишне взысканных денежных средств") +
      `
  <p class="mb-4 text-justify">
    В рамках исполнительного производства {{case_no}} {{over}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 70, 110 Федерального закона от 02.10.2007 № 229-ФЗ прошу вернуть излишне взысканные средства
    на мой счёт. В случае перечисления средств взыскателю прошу выдать справку для обращения в суд.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-seizure-lift",
    name: "Заявление о снятии ареста со счёта и имущества пристава",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 80–81)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Снятие ареста после погашения долга — или с защищённых счетов (зарплатные, детские пособия). Пристав снимает арест постановлением в день погашения.",
    suggestedDocs: ["stmt-fssp-execution", "stmt-fssp-excess-return"],
    submitTo: {
      where: "судебному приставу, наложившему арест",
      term: "снятие ареста — в день погашения долга или поступления документов о защищённых выплатах",
      fee: "бесплатно",
      attach: "квитанция о погашении / справка о назначении счёта (зарплата, пособия)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      what: "арест со счёта № 40817810XXXXXXXXXXXXXX (зарплатный) и запрет регистрационных действий на автомобиль",
      grounds: "задолженность погашена полностью 20.09.2026 (квитанция прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "what", label: "С чего снять арест (счёт, имущество)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "grounds", label: "Основание (погашение / защищённые выплаты)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о снятии ареста") +
      `
  <p class="mb-4 text-justify">
    В рамках исполнительного производства {{case_no}} прошу снять {{what}}: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 80–81 Федерального закона от 02.10.2007 № 229-ФЗ прошу вынести постановление о снятии ареста
    и направить его в банк / ГИБДД.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-alimony-debt",
    name: "Заявление о расчёте задолженности по алиментам",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "СК РФ (ст. 113), ФЗ № 229-ФЗ (ст. 102)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Расчёт долга по алиментам от пристава: постановление нужно для неустойки (0,1% в день), лишения прав и уголовной статьи 157 УК. Обжалуется в суде за 10 дней.",
    suggestedDocs: ["stmt-divorce-alimony-order", "lawsuit-statement"],
    submitTo: {
      where: "судебному приставу, ведущему производство",
      term: "постановление о расчёте — по вашему заявлению, без фиксированного срока (требуйте письменно)",
      fee: "бесплатно",
      attach: "исполнительный документ, данные о платежах должника (если платил частично)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 54321/26/77000-ИП",
      period: "с 01.03.2026 по 24.09.2026 платежи не поступали, официальный доход должника неизвестен",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "period", label: "Период неуплаты и что известно о доходах", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о расчёте задолженности по алиментам") +
      `
  <p class="mb-4 text-justify">
    В Вашем производстве находится исполнительное производство {{case_no}} о взыскании алиментов. {{period}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 113 Семейного кодекса Российской Федерации и ст. 102 Федерального закона «Об исполнительном
    производстве» прошу вынести постановление о расчёте задолженности.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-wage-garnish",
    name: "Заявление о направлении взыскания на зарплату должника",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 98–99)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Взыскание через работодателя должника: до 50% зарплаты (70% по алиментам и возмещению вреда). Работает, даже если счетов и имущества у должника нет.",
    suggestedDocs: ["stmt-fssp-execution", "stmt-fssp-alimony-debt"],
    submitTo: {
      where: "судебному приставу, ведущему производство",
      term: "постановление направляется работодателю после установления места работы",
      fee: "бесплатно",
      attach: "данные о месте работы должника (если известны)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП",
      job: "должник Петров П.П. работает в ООО «Ромашка» (г. Москва)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер исполнительного производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "job", label: "Место работы должника (если известно)", type: "text", defaultValue: "", category: "employer" },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об обращении взыскания на заработную плату должника") +
      `
  <p class="mb-4 text-justify">
    В Вашем производстве находится исполнительное производство {{case_no}}. {{job}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 98–99 Федерального закона от 02.10.2007 № 229-ФЗ прошу обратить взыскание на заработную плату
    и иные доходы должника.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-info-request",
    name: "Запрос взыскателя о ходе исполнительного производства",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 50), ФЗ № 59-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Запрос материалов производства: что сделал пристав за полгода — запросы, аресты, выходы. Молчание пристава — основание для жалобы старшему приставу и в суд.",
    suggestedDocs: ["stmt-fssp-complaint", "stmt-fssp-search"],
    submitTo: {
      where: "судебному приставу, ведущему производство (или через Госуслуги)",
      term: "ответ на обращение — 30 дней; ознакомление с материалами — в день обращения",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 12345/26/77000-ИП от 01.03.2026, за 6 месяцев взыскано 0 рублей, о действиях пристава не уведомлён",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер и дата производства, что известно", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении информации о ходе исполнительного производства") +
      `
  <p class="mb-4 text-justify">
    Исполнительное производство {{case_no}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 50 Федерального закона «Об исполнительном производстве» прошу предоставить для ознакомления
    материалы производства и сообщить: какие меры принудительного исполнения приняты, какие запросы направлены,
    какое имущество выявлено.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-cassation",
    name: "Кассационная жалоба на судебные акты",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 376–378, 390.8)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Третья инстанция после апелляции: проверяет только нарушения закона, факты заново не устанавливает. Срок — 3 месяца со дня апелляции. Подаётся через первый суд.",
    suggestedDocs: ["stmt-appeal", "lawsuit-statement"],
    submitTo: {
      where: "через суд первой инстанции в кассационный суд общей юрисдикции",
      term: "3 месяца со дня апелляционного определения (ст. 376.1 ГПК)",
      fee: "госпошлина как за апелляцию (ст. 333.19 НК)",
      attach: "заверенные копии решения и апелляции, квитанция о пошлине",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Во Второй кассационный суд общей юрисдикции (через Пресненский районный суд г. Москвы)",
      recipient_address: "г. Москва",
      acts: "решение от 10.06.2026 и апелляционное определение от 20.08.2026 по делу № 2-1234/2026",
      errors: "суды не применили ст. 1102 ГК РФ о неосновательном обогащении и не дали оценки расписке",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "acts", label: "Какие акты обжалуете (решение, апелляция, даты)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "errors", label: "Существенные нарушения норм права", type: "textarea", defaultValue: "", category: "court", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Кассационная жалоба") +
      `
  <p class="mb-4 text-justify">
    Обжалую {{acts}}. Допущены существенные нарушения норм материального и процессуального права: {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 376–378 Гражданского процессуального кодекса Российской Федерации прошу судебные акты отменить
    и направить дело на новое рассмотрение.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> заверенные копии актов, квитанция о госпошлине.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-private-complaint",
    name: "Частная жалоба на определение суда первой инстанции",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 331–334)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Обжалование промежуточных определений (возврат иска, отказ в обеспечении, приостановка): срок — 15 дней. Подаётся через суд, вынесший определение.",
    suggestedDocs: ["stmt-appeal", "stmt-court-security"],
    submitTo: {
      where: "через суд, вынесший определение, — в вышестоящий суд",
      term: "15 дней со дня вынесения определения (ст. 332 ГПК)",
      fee: "госпошлиной не облагается (ст. 333.36 НК)",
      attach: "копия определения",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Московский городской суд (через Пресненский районный суд г. Москвы)",
      recipient_address: "г. Москва",
      ruling: "определение от 15.09.2026 о возврате искового заявления по делу № М-100/2026",
      errors: "суд необоснованно посчитал, что спор подсуден другому суду, хотя ответчик зарегистрирован в данном районе",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "ruling", label: "Какое определение (суд, дата, суть)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "errors", label: "Почему незаконно", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Частная жалоба<br>на определение суда") +
      `
  <p class="mb-4 text-justify">
    {{ruling}}. С определением не согласен: {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 331–334 Гражданского процессуального кодекса Российской Федерации прошу определение отменить
    и разрешить вопрос по существу.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-default-cancel",
    name: "Заявление об отмене заочного решения",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 237–242)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Отмена заочного решения (вынесено без вас): 7 дней с получения копии. Докажите уважительность неявки + приложите возражения. Затем дело рассмотрят заново.",
    suggestedDocs: ["stmt-appeal", "stmt-court-postpone"],
    submitTo: {
      where: "в суд, вынесший заочное решение",
      term: "7 дней со дня вручения копии решения (ст. 237 ГПК)",
      fee: "бесплатно",
      attach: "доказательства уважительности неявки, возражения и доказательства по существу",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      decision: "заочное решение от 10.09.2026 по делу № 2-1234/2026, копию получил 20.09.2026",
      cause: "повестки не получал (был в командировке), о решении узнал только при получении копии",
      merits: "с иском не согласен: долг погашён 01.08.2026 (квитанция прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "decision", label: "Заочное решение (суд, дата, дело, дата получения)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "cause", label: "Почему не явились (уважительность)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
      { id: "merits", label: "Возражения по существу + доказательства", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об отмене заочного решения суда") +
      `
  <p class="mb-4 text-justify">
    {{decision}}. О времени и месте заседания извещён не был: {{cause}}.
  </p>
  <p class="mb-4 text-justify">
    {{merits}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 237–242 Гражданского процессуального кодекса Российской Федерации прошу заочное решение отменить
    и возобновить рассмотрение дела.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-costs",
    name: "Заявление о взыскании судебных расходов",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 98–103)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Возврат трат выигравшей стороны: госпошлина, юрист, экспертиза, проезд. Подаётся в тот же суд за 3 месяца со дня последнего акта. Нужны чеки и договор с юристом.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-docs"],
    submitTo: {
      where: "в суд, рассмотревший дело (можно после вступления решения в силу)",
      term: "3 месяца со дня последнего судебного акта (ст. 103.1 ГПК)",
      fee: "бесплатно",
      attach: "чеки, договор с юристом, акты, билеты, заключение эксперта со счётом",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      case_no: "№ 2-1234/2026 (решение в мою пользу вступило в силу 01.09.2026)",
      costs: "госпошлина 8 400 рублей, услуги представителя 40 000 рублей, почтовые расходы 500 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела и итог", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "costs", label: "Расходы (пошлина, юрист, экспертиза — суммами)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о взыскании судебных расходов") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}}. Мною понесены расходы: {{costs}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 98–100 Гражданского процессуального кодекса Российской Федерации прошу взыскать судебные расходы
    с проигравшей стороны.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> чеки, договор с представителем, акты.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-settlement",
    name: "Ходатайство об утверждении мирового соглашения",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 39, 153.8–153.11, 173)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Мир вместо решения: стороны договариваются, суд утверждает определением (сила исполнительного листа). Пропишите сроки, суммы и отказ от остальных требований.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-costs"],
    submitTo: {
      where: "в суд, рассматривающий дело (совместно или от одной стороны с проектом)",
      term: "суд проверяет законность и утверждает в том же заседании",
      fee: "госпошлина возвращается частично (ст. 333.40 НК)",
      attach: "проект мирового соглашения в 3 экземплярах",
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
      terms: "ответчик выплачивает 200 000 рублей до 01.11.2026, истец отказывается от остальной части требований",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "terms", label: "Условия соглашения (суммы, сроки, отказы)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об утверждении мирового соглашения") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} сторонами достигнуто соглашение: {{terms}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 39, 173 Гражданского процессуального кодекса Российской Федерации прошу утвердить мировое
    соглашение и прекратить производство по делу. Последствия прекращения производства (ст. 221 ГПК) мне известны.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-work-book",
    name: "Заявление о выдаче трудовой книжки и документов при увольнении",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 62, 84.1)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Требование выдать трудовую, приказы, справки 2-НДФЛ и о заработке: в последний день или за 3 дня по запросу. За задержку — средний заработок за каждый день.",
    suggestedDocs: ["stmt-hr-dismiss", "stmt-hr-salary"],
    submitTo: {
      where: "руководителю организации (кадры)",
      term: "в день увольнения; по запросу после — за 3 рабочих дня (ст. 62 ТК)",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      docs: "трудовую книжку, приказы о приёме и увольнении, справки 2-НДФЛ и о среднем заработке за 2 года",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "docs", label: "Какие документы (трудовая, приказы, справки)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о выдаче документов, связанных с работой") +
      `
  <p class="mb-4 text-justify">
    На основании ст. 62, 84.1 Трудового кодекса Российской Федерации прошу выдать мне: {{docs}}.
  </p>
  <p class="mb-4 text-justify">
    Документы прошу выдать надлежащим образом заверенными, в установленный законом срок.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-unpaid-leave",
    name: "Заявление на отпуск без сохранения зарплаты (по семейным обстоятельствам)",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 128)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Отпуск за свой счёт: по семейным обстоятельствам — по соглашению, а ветеранам, инвалидам, при рождении/смерти — работодатель отказать не вправе.",
    suggestedDocs: ["stmt-vacation", "stmt-hr-dismiss"],
    submitTo: {
      where: "руководителю организации",
      term: "по соглашению сторон; льготным категориям — в обязательном порядке (ст. 128 ТК)",
      fee: "бесплатно",
      attach: "документы о льготе (при наличии права на обязательный отпуск)",
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
      period: "с 05.10.2026 по 09.10.2026 (5 календарных дней) по семейным обстоятельствам",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "position", label: "Должность заявителя", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "period", label: "Период и причина", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении отпуска без сохранения заработной платы") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить мне ({{position}}) отпуск без сохранения заработной платы {{period}}
    (ст. 128 Трудового кодекса Российской Федерации).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-transfer",
    name: "Заявление о переводе на другую должность",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 72, 72.1)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба о переводе (постоянном или временном): только с письменного согласия, кроме чрезвычайных случаев. Оформляется допсоглашением и приказом.",
    suggestedDocs: ["stmt-hr-remote", "employment-contract"],
    submitTo: {
      where: "руководителю организации (по вопросу перевода)",
      term: "по соглашению сторон — в любой срок; оформляется допсоглашением",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      from_to: "с должности менеджера отдела продаж на должность старшего менеджера с 01.10.2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "from_to", label: "С какой на какую должность (с какой даты)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о переводе на другую работу") +
      `
  <p class="mb-4 text-justify">
    Прошу перевести меня {{from_to}} (ст. 72, 72.1 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    С изменением трудовой функции и условий трудового договора согласен(а), готов(а) подписать дополнительное соглашение.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-overtime-pay",
    name: "Заявление об оплате сверхурочной работы",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 99, 152)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Требование оплатить переработки: первые 2 часа — в полуторном размере, дальше — в двойном. Лимит — 120 часов в год. Фиксируйте приказы и табели.",
    suggestedDocs: ["stmt-hr-salary", "stmt-gti-complaint"],
    submitTo: {
      where: "руководителю организации",
      term: "оплата вместе с зарплатой; при отказе — в ГИТ или суд (год на споры о зарплате)",
      fee: "бесплатно",
      attach: "приказы о сверхурочных, табели, переписка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      hours: "в сентябре 2026 года — 20 часов сверхурочно (приказы № 10–14), оплачены как обычные",
      ask: "доплатить разницу по ст. 152 ТК РФ вместе с ближайшей зарплатой",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "hours", label: "Переработки (месяц, часы, приказы)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об оплате сверхурочной работы") +
      `
  <p class="mb-4 text-justify">
    {{hours}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 152 Трудового кодекса Российской Федерации прошу {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-discipline-appeal",
    name: "Объяснительная и возражение на дисциплинарное взыскание",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 192–193)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Письменное объяснение + несогласие с выговором: работодатель обязан запросить объяснение и дать 2 дня. Без этого взыскание незаконно — обжалуется в ГИТ и суде.",
    suggestedDocs: ["stmt-gti-complaint", "lawsuit-statement"],
    submitTo: {
      where: "руководителю организации (в ответ на требование о даче объяснений)",
      term: "объяснение — в течение 2 рабочих дней; взыскание — в течение месяца со дня проступка",
      fee: "бесплатно",
      attach: "документы, подтверждающие уважительность (больничный, билеты)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      fact: "опоздание 20.09.2026 на 30 минут из-за остановки метро (справка дептранса прилагается)",
      ask: "учесть уважительность причины и не применять взыскание",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что произошло и почему (уважительность)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Объяснительная<br>по факту нарушения трудовой дисциплины") +
      `
  <p class="mb-4 text-justify">
    По факту {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 192–193 Трудового кодекса Российской Федерации прошу {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-beating",
    name: "Заявление в полицию о побоях / угрозе убийством",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), УК РФ (ст. 115–117, 119)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление о побоях или угрозах: сначала в травмпункт (снимите побои!), затем в полицию. Приложите медсправку — без неё дело почти не возбудят.",
    suggestedDocs: ["stmt-police-theft", "lawsuit-statement"],
    submitTo: {
      where: "дежурная часть отдела полиции по месту происшествия",
      term: "решение — 3 суток (до 30 при проверке); побои фиксируйте в травмпункте сразу",
      fee: "бесплатно",
      attach: "справка из травмпункта, фото травм, данные свидетелей",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "23.09.2026 около 22:00 сожитель Сидоров С.С. в квартире избил меня (удары по лицу и телу), угрожал убийством; побои зафиксированы в травмпункте № 1 (справка прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Кто, когда, где, что сделал + медфиксация", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о преступлении") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу зарегистрировать заявление,
    провести проверку и решить вопрос о возбуждении уголовного дела.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-car-theft",
    name: "Заявление в полицию об угоне автомобиля",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), УК РФ (ст. 158, 166)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление об угоне: звоните 102 сразу, затем письменно в дежурную часть. Укажите VIN, госномер, приметы, сигнализацию, КАСКО. Объявляют план «Перехват».",
    suggestedDocs: ["stmt-police-theft", "stmt-gibdd-appeal"],
    submitTo: {
      where: "дежурная часть отдела полиции по месту угона (сначала звонок на 102)",
      term: "немедленно; розыск объявляют в день обращения",
      fee: "бесплатно",
      attach: "СТС/ПТС (копии), ключи, полис КАСКО, фото авто, записи камер",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      car: "Kia Rio, госномер А123БВ777, VIN XXXXXXXXXXXXXXX, 2020 г.в., серебристый; припаркован 23.09.2026 в 22:00 у дома, утром 24.09.2026 отсутствует; второй комплект ключей на руках",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "car", label: "Авто (марка, номер, VIN, где стоял, что с ключами)", type: "textarea", defaultValue: "", category: "vehicle", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об угоне транспортного средства") +
      `
  <p class="mb-4 text-justify">
    {{car}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу зарегистрировать заявление,
    объявить автомобиль в розыск и возбудить уголовное дело.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-noise",
    name: "Заявление участковому на шумных соседей",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "КоАП РФ (региональный закон о тишине), ФЗ «О полиции» (ст. 12)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба на шум ночью (ремонт, музыка): фиксируйте вызовы 102, соберите подписи соседей. Штраф — по региональному закону о тишине (в Москве — ст. 3.13 КоАП г. Москвы).",
    suggestedDocs: ["stmt-police-beating", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "участковому уполномоченному (или дежурная часть, вызов 102 в момент шума)",
      term: "ответ на обращение — 30 дней; выезд на вызов — немедленно",
      fee: "бесплатно",
      attach: "аудио/видео, номера вызовов 102, подписи соседей",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Участковому уполномоченному ОМВД по району",
      recipient_address: "г. Москва",
      fact: "соседи из кв. 10 систематически с 23:00 до 03:00 включают громкую музыку (12, 18, 23 сентября 2026 года, вызовы 102 № 111, 222, 333), на замечания не реагируют",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Кто шумит, когда, вызовы, свидетели", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о нарушении тишины") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    Прошу провести проверку, привлечь виновных к административной ответственности и разъяснить недопустимость
    нарушения тишины в ночное время.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-gzhi-complaint",
    name: "Жалоба в жилищную инспекцию (ГЖИ) на УК",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ЖК РФ (ст. 20), ФЗ № 59-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба в ГЖИ, когда УК игнорирует: грязный подъезд, разбитые окна, текущий подвал. ГЖИ штрафует и выдаёт предписание — работает лучше повторных писем в УК.",
    suggestedDocs: ["stmt-housing-quality", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "государственная жилищная инспекция региона (лично, почтой, ГИС ЖКХ)",
      term: "30 дней; при угрозе — проверка с выездом",
      fee: "бесплатно",
      attach: "обращения в УК с отметками (или игнор), фото нарушений, ответы УК",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику Государственной жилищной инспекции г. Москвы",
      recipient_address: "г. Москва",
      org: "ООО «УК Жилсервис»",
      violation: "с июля 2026 года не убирается подъезд, разбиты 3 окна на лестничной клетке, обращения от 01.08 и 05.09.2026 проигнорированы",
      ask: "провести проверку, выдать предписание и привлечь к административной ответственности",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "org", label: "Управляющая компания", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "violation", label: "Нарушения и обращения в УК (даты, игнор)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>в жилищную инспекцию") +
      `
  <p class="mb-4 text-justify">
    {{org}}: {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 20 Жилищного кодекса Российской Федерации и Федерального закона от 02.05.2006 № 59-ФЗ прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fas-complaint",
    name: "Жалоба в ФАС на рекламу и навязывание услуг",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ «О рекламе» (ст. 5, 18, 28), ФЗ № 135-ФЗ «О защите конкуренции»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Жалоба на спам-звонки, недостоверную рекламу, навязанную страховку: ФАС штрафует до 500 000 ₽. Приложите скриншоты, записи звонков, детализацию.",
    suggestedDocs: ["stmt-rospotrebnadzor", "stmt-cb-complaint"],
    submitTo: {
      where: "территориальное управление ФАС (лично, почтой, сайт fas.gov.ru)",
      term: "30 дней; при признаках нарушения — возбуждение дела",
      fee: "бесплатно",
      attach: "скриншоты, записи, детализация звонков, договор с навязанной услугой",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Руководителю УФАС по г. Москве",
      recipient_address: "г. Москва",
      violation: "ООО «Кредит» ежедневно звонит с рекламой займов без моего согласия (детализация прилагается), отозвать согласие по телефону отказываются",
      ask: "провести проверку и привлечь к ответственности за нарушение законодательства о рекламе",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "violation", label: "Нарушение (спам, реклама, навязывание — факты)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>в антимонопольный орган") +
      `
  <p class="mb-4 text-justify">
    {{violation}}.
  </p>
  <p class="mb-4 text-justify">
    На основании Федерального закона «О рекламе» и Федерального закона от 02.05.2006 № 59-ФЗ прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-family-divorce-joint",
    name: "Заявление о расторжении брака по взаимному согласию (в ЗАГС)",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "СК РФ (ст. 19–20), ФЗ № 143-ФЗ «Об актах гражданского состояния»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Развод через ЗАГС за месяц: только если нет общих несовершеннолетних детей и оба согласны. Иначе — через мировой суд. Пошлина — 650 ₽ с каждого.",
    suggestedDocs: ["stmt-divorce-alimony-order", "lawsuit-statement"],
    submitTo: {
      where: "ЗАГС по месту жительства или регистрации брака (или через Госуслуги)",
      term: "месяц со дня подачи заявления (ст. 19 СК)",
      fee: "госпошлина 650 ₽ с каждого супруга",
      attach: "паспорта, свидетельство о браке",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович и Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отдел ЗАГС г. Москвы",
      recipient_address: "г. Москва",
      marriage: "брак зарегистрирован 10.06.2015 отделом ЗАГС г. Москвы (свидетельство № 777), общих несовершеннолетних детей нет, споров о разделе нет",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "marriage", label: "Брак (когда, где, дети, споры)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о расторжении брака") +
      `
  <p class="mb-4 text-justify">
    {{marriage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 19 Семейного кодекса Российской Федерации просим расторгнуть брак. Взаимное согласие подтверждаем,
    фамилию после развода просим оставить без изменения.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-family-paternity",
    name: "Заявление об установлении отцовства (совместное)",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "СК РФ (ст. 48–50), ФЗ № 143-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Совместное заявление родителей в ЗАГС: отец признаёт ребёнка, в свидетельство вписывают его данные. Если мать против — только через суд с экспертизой ДНК.",
    suggestedDocs: ["stmt-family-divorce-joint", "stmt-divorce-alimony-order"],
    submitTo: {
      where: "ЗАГС по месту жительства родителей или регистрации рождения",
      term: "в день обращения (можно до рождения ребёнка — ст. 48 СК)",
      fee: "госпошлина 350 ₽",
      attach: "паспорта, свидетельство о рождении, согласие матери (если в браке с другим — его согласие)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отдел ЗАГС г. Москвы",
      recipient_address: "г. Москва",
      child: "Иванов Пётр Иванович, 01.06.2026 г.р. (свидетельство № 12345), мать — Иванова М.И., в браке не состоим",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "child", label: "Ребёнок (ФИО, дата рождения, свидетельство, мать)", type: "textarea", defaultValue: "", category: "child", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об установлении отцовства") +
      `
  <p class="mb-4 text-justify">
    Просим установить отцовство в отношении ребёнка: {{child}}.
  </p>
  <p class="mb-4 text-justify">
    Я, {{sender_name}}, признаю себя отцом ребёнка. На основании ст. 48 Семейного кодекса Российской Федерации просим
    внести сведения об отце в запись акта о рождении.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-family-child-meet",
    name: "Заявление об определении порядка общения с ребёнком",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "СК РФ (ст. 61–67)",
    lastUpdated: "Сентябрь 2026",
    description:
      "График встреч отдельно живущего родителя: дни, часы, отпуск, праздники. Сначала опека, затем суд. Конкретика в графике — ключ к исполнению.",
    suggestedDocs: ["stmt-divorce-alimony-order", "lawsuit-statement"],
    submitTo: {
      where: "орган опеки (попытка соглашения), затем — районный суд",
      term: "опека — 30 дней; суд — до 2 месяцев",
      fee: "по искам о детях истец освобождён от пошлины",
      attach: "свидетельство о рождении, график встреч, характеристики, сведения о жилье",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      child: "Иванов Пётр Иванович, 01.06.2020 г.р., проживает с матерью",
      schedule: "еженедельно по субботам с 10:00 до 18:00, половина каникул и 14 дней отпуска летом, день рождения ребёнка — совместно",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "child", label: "Ребёнок (ФИО, возраст, с кем живёт)", type: "text", defaultValue: "", category: "child", validation: { required: true } },
      { id: "schedule", label: "Предлагаемый график общения", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>об определении порядка общения с ребёнком") +
      `
  <p class="mb-4 text-justify">
    Я являюсь отцом: {{child}}. Мать препятствует общению, соглашение не достигнуто.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 61–67 Семейного кодекса Российской Федерации прошу установить порядок общения: {{schedule}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-inherit-accept-fact",
    name: "Заявление о фактическом принятии наследства",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 1152–1155)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Пропустили 6 месяцев у нотариуса, но жили в квартире и платили коммуналку? Суд признает фактическое принятие — приложите квитанции, чеки ремонта, показания соседей.",
    suggestedDocs: ["stmt-notary-inherit", "lawsuit-statement"],
    submitTo: {
      where: "районный суд по месту нахождения наследства",
      term: "общий срок исковой давности — 3 года",
      fee: "госпошлина от цены иска (ст. 333.19 НК)",
      attach: "квитанции ЖКУ, чеки ремонта, показания свидетелей, документы на имущество",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      fact: "отец Петров П.П. умер 10.02.2025; я проживаю в его квартире, оплачиваю ЖКУ, сделал ремонт на 150 000 рублей, к нотариусу в 6-месячный срок не обращался",
      estate: "квартира по адресу: г. Москва, ул. Ленина, д. 1, кв. 10",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Как фактически приняли (проживание, платежи, ремонт)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "estate", label: "Наследственное имущество", type: "text", defaultValue: "", category: "property", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об установлении факта принятия наследства") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1152–1155 Гражданского кодекса Российской Федерации прошу установить факт принятия мною
    наследства: {{estate}}.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> квитанции, чеки, показания свидетелей.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-inherit-missed-term",
    name: "Заявление о восстановлении срока принятия наследства",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 1155)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Пропустили 6 месяцев по уважительной причине (болезнь, не знали о смерти)? Суд восстановит срок, если обратитесь в течение 6 месяцев после того, как причина отпала.",
    suggestedDocs: ["stmt-inherit-accept-fact", "stmt-notary-inherit"],
    submitTo: {
      where: "районный суд по месту нахождения наследства",
      term: "обратиться — в течение 6 месяцев после отпадения уважительной причины",
      fee: "госпошлина от цены иска",
      attach: "больничные, командировочные, доказательства незнания о смерти",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      cause: "о смерти отца узнал только 01.09.2026 (проживаем в разных городах, не общались с 2020 года), сразу обратился к нотариусу — получил отказ из-за пропуска срока",
      estate: "квартира по адресу: г. Москва, ул. Ленина, д. 1, кв. 10",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "cause", label: "Почему пропустили срок (уважительность)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "estate", label: "Наследственное имущество", type: "text", defaultValue: "", category: "property", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о восстановлении срока принятия наследства") +
      `
  <p class="mb-4 text-justify">
    {{cause}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1155 Гражданского кодекса Российской Федерации прошу восстановить срок принятия наследства
    ({{estate}}) и признать меня принявшим наследство.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-auto-osago-claim",
    name: "Заявление в страховую о выплате по ОСАГО",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 40-ФЗ «Об ОСАГО» (ст. 11–12), Положение ЦБ № 431-П",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление о страховом возмещении после ДТП: 5 рабочих дней на подачу, осмотр за 5 дней, выплата за 20 дней (деньгами или ремонтом). Европротокол — тоже сюда.",
    suggestedDocs: ["stmt-gibdd-appeal", "stmt-police-car-theft"],
    submitTo: {
      where: "в свою страховую (прямое возмещение) или виновника",
      term: "заявление — 5 рабочих дней; выплата/ремонт — 20 дней (ст. 12 закона № 40-ФЗ)",
      fee: "бесплатно",
      attach: "извещение о ДТП/протокол, СТС, права, реквизиты или направление на ремонт",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ООО «СК Страховщик» (полис ХХХ № 12345)",
      recipient_address: "г. Москва",
      accident: "ДТП 20.09.2026 на ул. Мира: виновник Сидоров С.С. (полис YYY № 999), повреждён передний бампер и фара моего Kia Rio А123БВ777",
      ask: "произвести страховую выплату / выдать направление на ремонт",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "accident", label: "ДТП (дата, место, виновник, повреждения)", type: "textarea", defaultValue: "", category: "vehicle", rows: 3, validation: { required: true } },
      { id: "ask", label: "Выплата деньгами или ремонт", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о страховом возмещении по ОСАГО") +
      `
  <p class="mb-4 text-justify">
    {{accident}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 11–12 Федерального закона «Об обязательном страховании гражданской ответственности владельцев
    транспортных средств» прошу {{ask}}. Автомобиль для осмотра предоставлю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-auto-tax-refund",
    name: "Заявление о перерасчёте транспортного налога",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "НК РФ (ст. 52, 78, 358–362)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Налог пришёл за проданную машину или с ошибкой в мощности? Требуйте перерасчёт: приложите ДКП и справку ГИБДД о снятии с учёта.",
    suggestedDocs: ["stmt-tax-deduction", "stmt-gibdd-appeal"],
    submitTo: {
      where: "в налоговую инспекцию (лично, почтой, ЛК налогоплательщика)",
      term: "перерасчёт — за 3 года; ответ — 30 дней",
      fee: "бесплатно",
      attach: "ДКП, справка ГИБДД, ПТС с отметкой, расчёт",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ИФНС России № 1 по г. Москве",
      recipient_address: "г. Москва",
      error: "налог за 2025 год начислен за полный год, хотя автомобиль продан 01.03.2025 (ДКП и снятие с учёта в ГИБДД прилагаются)",
      ask: "произвести перерасчёт за 2 месяца владения и вернуть переплату",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "error", label: "Ошибка (продажа, мощность, льгота — факты)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите (перерасчёт / возврат)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о перерасчёте транспортного налога") +
      `
  <p class="mb-4 text-justify">
    {{error}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 52, 78, 362 Налогового кодекса Российской Федерации прошу {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-migration-registration",
    name: "Заявление о регистрации по месту жительства (прописка)",
    category: "migration",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "Закон № 5242-1, ПП РФ № 713, Приказ МВД № 984",
    lastUpdated: "Сентябрь 2026",
    description:
      "Прописка постоянная и временная: собственник пишет согласие, вы — заявление. Через Госуслуги — без очередей, штамп за 3–8 дней. Штрафа нет, если уложились в 7 дней.",
    suggestedDocs: ["stmt-tax-deduction", "claim-generic"],
    submitTo: {
      where: "МВД (через Госуслуги, МФЦ или паспортный стол УК)",
      term: "7 дней на регистрацию после переезда; оформление — 3–8 дней",
      fee: "бесплатно",
      attach: "паспорт, основание для вселения (собственность/договор/согласие)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ОВМ ОМВД России по району г. Москвы",
      recipient_address: "г. Москва",
      address: "г. Москва, ул. Ленина, д. 1, кв. 5 (собственник — Сидоров С.С., согласие прилагается)",
      kind: "постоянную регистрацию по месту жительства",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "address", label: "Адрес и основание (собственность/договор/согласие)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "kind", label: "Постоянная или временная", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о регистрации по месту жительства") +
      `
  <p class="mb-4 text-justify">
    Прошу оформить мне {{kind}} по адресу: {{address}}.
  </p>
  <p class="mb-4 text-justify">
    Основание и согласие собственника прилагаю. С ответственностью за фиктивную регистрацию (ст. 322.2 УК РФ) ознакомлен(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-edu-school-place",
    name: "Заявление о приёме ребёнка в школу / сад",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 273-ФЗ «Об образовании» (ст. 55, 67), Приказ Минпросвещения № 458",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в школу по прописке (отказать не вправе) или в сад через очередь: подаётся лично или через Госуслуги. Отказ — только если мест нет, с направлением в другую школу.",
    suggestedDocs: ["stmt-prosecutor-complaint", "claim-generic"],
    submitTo: {
      where: "в школу (лично) / в сад — через Госуслуги или управление образования",
      term: "1 класс по прописке — с 1 апреля по 30 июня; приказ о зачислении — за 3 дня",
      fee: "бесплатно",
      attach: "свидетельство о рождении, регистрация ребёнка, паспорт родителя",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору школы № 100 г. Москвы",
      recipient_address: "г. Москва",
      child: "Иванов Пётр Иванович, 01.06.2019 г.р., зарегистрирован по адресу школы (справка прилагается)",
      class: "1 класс 2026/2027 учебного года",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "child", label: "Ребёнок (ФИО, возраст, регистрация)", type: "text", defaultValue: "", category: "child", validation: { required: true } },
      { id: "class", label: "Класс/группа, учебный год", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о приёме в образовательную организацию") +
      `
  <p class="mb-4 text-justify">
    Прошу принять моего ребёнка {{child}} в {{class}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 55, 67 Федерального закона «Об образовании в Российской Федерации» прошу зачислить ребёнка.
    Документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-med-attach",
    name: "Заявление о прикреплении к поликлинике",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 323-ФЗ (ст. 19, 21, 84), Приказ Минздрава № 406н",
    lastUpdated: "Сентябрь 2026",
    description:
      "Прикрепление к любой поликлинике (не только по прописке): менять можно раз в год. Отказ — только если плановая мощность превышена, и то с направлением.",
    suggestedDocs: ["stmt-prosecutor-complaint", "claim-generic"],
    submitTo: {
      where: "в выбранную поликлинику (лично или через Госуслуги)",
      term: "прикрепление — в день обращения; смена — раз в год (чаще — при переезде)",
      fee: "бесплатно",
      attach: "паспорт, полис ОМС, СНИЛС",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Главному врачу поликлиники № 10 г. Москвы",
      recipient_address: "г. Москва",
      policy: "полис ОМС № 123456789, фактически проживаю рядом с поликлиникой",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "policy", label: "Полис ОМС и основание выбора", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о прикреплении к медицинской организации") +
      `
  <p class="mb-4 text-justify">
    На основании ст. 21 Федерального закона «Об основах охраны здоровья граждан» прошу прикрепить меня к Вашей
    организации для получения первичной медико-санитарной помощи. {{policy}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-med-complaint",
    name: "Жалоба на врача / качество медпомощи",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "ФЗ № 323-ФЗ (ст. 19, 70, 88), ФЗ № 59-ФЗ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Лестница жалоб: главврач → страховая → Росздравнадзор → прокуратура. Начните с главврача и страховой — экспертиза качества бесплатна для вас.",
    suggestedDocs: ["stmt-med-attach", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "главному врачу → в страховую компанию → в Росздравнадзор",
      term: "ответ — 30 дней; экспертиза страховой — до 30 дней",
      fee: "бесплатно",
      attach: "выписки, назначения, чеки на лекарства, переписка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Главному врачу больницы № 5 г. Москвы",
      recipient_address: "г. Москва",
      fact: "10.09.2026 врач отказал в направлении на УЗИ, диагноз поставлен без обследования, состояние ухудшилось",
      ask: "провести проверку, дать оценку действиям врача и организовать обследование",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что случилось (дата, врач, в чём нарушение)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на качество медицинской помощи") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 19, 70 Федерального закона «Об основах охраны здоровья граждан» прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-sfr-benefit",
    name: "Заявление на детское пособие / единую выплату (СФР)",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 81-ФЗ, ФЗ № 178-ФЗ, ПП РФ № 2330",
    lastUpdated: "Сентябрь 2026",
    description:
      "Единое пособие на детей и беременным через СФР/Госуслуги: нуждаемость проверяют сами по доходам. Отказ — обжалуйте с расчётом среднедушевого дохода.",
    suggestedDocs: ["stmt-tax-deduction", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "СФР (через Госуслуги, МФЦ, лично)",
      term: "решение — 10 рабочих дней (+20 при запросе данных)",
      fee: "бесплатно",
      attach: "обычно не нужны — СФР запрашивает сам; при отказе приложите расчёт доходов",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отделение СФР по г. Москве",
      recipient_address: "г. Москва",
      kind: "единое пособие на ребёнка Иванова П.И., 2020 г.р.",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "kind", label: "Какое пособие (единое / по уходу / беременным)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о назначении пособия") +
      `
  <p class="mb-4 text-justify">
    Прошу назначить {{kind}} (Федеральный закон от 19.05.1995 № 81-ФЗ, Постановление Правительства РФ от 16.12.2022 № 2330).
  </p>
  <p class="mb-4 text-justify">
    Сведения о доходах и составе семьи разрешаю запросить в порядке межведомственного взаимодействия.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-pension-recalc",
    name: "Заявление о перерасчёте пенсии",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 400-ФЗ (ст. 23), Приказ Минтруда № 600н",
    lastUpdated: "Сентябрь 2026",
    description:
      "Не учли стаж, зарплату, иждивенца? Требуйте перерасчёт: приложите трудовую, справки о зарплате, свидетельства. Перерасчёт — с месяца обращения (по вине фонда — с даты ошибки).",
    suggestedDocs: ["stmt-sfr-benefit", "stmt-prosecutor-complaint"],
    submitTo: {
      where: "СФР (лично, почтой, Госуслуги)",
      term: "решение — 5 рабочих дней; перерасчёт — с месяца обращения",
      fee: "бесплатно",
      attach: "трудовая, справки о зарплате/стаже, свидетельства об иждивенцах",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отделение СФР по г. Москве",
      recipient_address: "г. Москва",
      grounds: "не учтён стаж 1995–2000 годов (справка работодателя прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "grounds", label: "Что не учтено (стаж, зарплата, иждивенец)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о перерасчёте страховой пенсии") +
      `
  <p class="mb-4 text-justify">
    Являюсь получателем страховой пенсии по старости. Прошу произвести перерасчёт: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 23 Федерального закона «О страховых пенсиях» прошу пересчитать размер пенсии.
    Подтверждающие документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-nalog-complaint",
    name: "Жалоба на налоговую инспекцию (вышестоящему органу)",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "oversight",
    actSource: "НК РФ (ст. 137–140)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Досудебное обжалование обязательно: сначала УФНС, только потом суд. Срок — год с решения, исполнение взыскания приостанавливается по заявлению.",
    suggestedDocs: ["stmt-tax-deduction", "stmt-auto-tax-refund"],
    submitTo: {
      where: "в УФНС через инспекцию, чьё решение обжалуете",
      term: "год на подачу; рассмотрение — месяц (ст. 140 НК)",
      fee: "бесплатно",
      attach: "обжалуемое решение/требование, возражения, документы",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В УФНС России по г. Москве (через ИФНС № 1)",
      recipient_address: "г. Москва",
      act: "решение ИФНС № 1 от 10.09.2026 о доначислении 45 000 рублей НДФЛ",
      errors: "инспекция не учла имущественный вычет по квартире (декларация и документы поданы 01.07.2026)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "act", label: "Какой акт обжалуете (решение, требование)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "errors", label: "В чём незаконность", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Жалоба<br>на акт налогового органа") +
      `
  <p class="mb-4 text-justify">
    {{act}}. С актом не согласен: {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 137–139 Налогового кодекса Российской Федерации прошу акт отменить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-nalog-overpay",
    name: "Заявление о возврате переплаты по налогам",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "НК РФ (ст. 78–79)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Возврат переплаты с ЕНС: сначала зачтут долги, остаток вернут по заявлению за дни. Срок на возврат — 3 года с переплаты.",
    suggestedDocs: ["stmt-nalog-complaint", "stmt-tax-deduction"],
    submitTo: {
      where: "в налоговую инспекцию (ЛК налогоплательщика — быстрее всего)",
      term: "возврат — в течение месяца после заявления; срок давности — 3 года",
      fee: "бесплатно",
      attach: "расчёт переплаты, реквизиты счёта",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ИФНС России № 1 по г. Москве",
      recipient_address: "г. Москва",
      over: "переплата 12 000 рублей (двойная уплата транспортного налога за 2025 год)",
      account: "счёт № 40817810XXXXXXXXXXXXXX в ПАО «Банк»",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "over", label: "Переплата (налог, сумма, причина)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "account", label: "Счёт для возврата", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о возврате переплаты") +
      `
  <p class="mb-4 text-justify">
    {{over}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 78 Налогового кодекса Российской Федерации прошу вернуть переплату на {{account}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-nalog-benefit",
    name: "Заявление о налоговой льготе (имущество/транспорт/земля)",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "НК РФ (ст. 361.1, 396–397, 407)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Пенсионерам, инвалидам, многодетным: льгота не всегда назначается автоматически — подайте заявление раз, дальше продлевается сама. Приложите удостоверение.",
    suggestedDocs: ["stmt-nalog-overpay", "stmt-auto-tax-refund"],
    submitTo: {
      where: "в любую налоговую инспекцию (ЛК, МФЦ, почта)",
      term: "льгота — с месяца возникновения права; перерасчёт — за 3 года",
      fee: "бесплатно",
      attach: "пенсионное удостоверение / справка МСЭ / удостоверения многодетных",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ИФНС России № 1 по г. Москве",
      recipient_address: "г. Москва",
      benefit: "льготу по транспортному налогу как пенсионеру (удостоверение № 111) на автомобиль Kia Rio А123БВ777 с 2025 года",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "benefit", label: "Льгота (категория, объект, с какого года)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении налоговой льготы") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить {{benefit}} (ст. 361.1, 407 Налогового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Документы, подтверждающие право на льготу, прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-quit-no-workoff",
    name: "Заявление об увольнении без отработки (льготные случаи)",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 80)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Увольнение одним днём: зачисление в вуз, выход на пенсию, переезд супруга-военного, нарушение работодателем ТК. Без причины — только по соглашению.",
    suggestedDocs: ["stmt-hr-dismiss", "stmt-hr-work-book"],
    submitTo: {
      where: "руководителю организации",
      term: "в дату, указанную в заявлении (при подтверждённой невозможности продолжать работу)",
      fee: "бесплатно",
      attach: "справка о зачислении / пенсионное / документы о нарушении ТК",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      cause: "зачисление на очную форму вуза с 01.10.2026 (справка прилагается) — продолжать работу невозможно",
      day: "30.09.2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "cause", label: "Причина невозможности отработки", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "day", label: "Дата увольнения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об увольнении без отработки") +
      `
  <p class="mb-4 text-justify">
    Прошу уволить меня по собственному желанию «{{day}}» без отработки: {{cause}} (ч. 3 ст. 80 Трудового кодекса
    Российской Федерации).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-vacation-pay",
    name: "Заявление о замене отпуска денежной компенсацией",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 126)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Компенсация только за дни сверх 28: основной отпуск отгулять обязаны (беременным и несовершеннолетним — вообще нельзя заменять). При увольнении — за все неиспользованные дни.",
    suggestedDocs: ["stmt-vacation", "stmt-hr-dismiss"],
    submitTo: {
      where: "руководителю организации (по вопросу компенсации отпуска)",
      term: "по соглашению; при увольнении — в день расчёта автоматически",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      days: "7 календарных дней дополнительного отпуска за 2026 год",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "days", label: "Сколько дней и какого отпуска", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о замене отпуска денежной компенсацией") +
      `
  <p class="mb-4 text-justify">
    Прошу заменить денежной компенсацией часть ежегодного оплачиваемого отпуска, превышающую 28 календарных дней: {{days}}
    (ст. 126 Трудового кодекса Российской Федерации).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-schedule-change",
    name: "Заявление об изменении режима рабочего времени",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 93, 100–102)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Неполный день, гибкий график, смена начала/конца: беременным, родителям детей до 14 лет и ухаживающим за больным — работодатель отказать не вправе.",
    suggestedDocs: ["stmt-hr-remote", "stmt-hr-maternity"],
    submitTo: {
      where: "руководителю организации",
      term: "по соглашению; льготным категориям — в обязательном порядке (ст. 93 ТК)",
      fee: "бесплатно",
      attach: "справка о беременности / свидетельство о рождении / медзаключение",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      mode: "неполное рабочее время (4 часа в день, с 09:00 до 13:00) с 01.10.2026 в связи с наличием ребёнка до 14 лет",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "mode", label: "Какой режим просите и основание", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об установлении неполного рабочего времени") +
      `
  <p class="mb-4 text-justify">
    Прошу установить мне {{mode}} (ст. 93 Трудового кодекса Российской Федерации).
  </p>
  <p class="mb-4 text-justify">
    Подтверждающие документы прилагаю. Оплату прошу производить пропорционально отработанному времени.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-sick-pay",
    name: "Заявление об оплате больничного (несвоевременная выплата)",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ФЗ № 255-ФЗ (ст. 13–15), ТК РФ (ст. 183)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Больничный не оплатили за 10 дней? Требуйте выплату + компенсацию по 236 ТК. Электронный больничный работодатель видит сам — номер сообщать не обязательно.",
    suggestedDocs: ["stmt-hr-salary", "stmt-gti-complaint"],
    submitTo: {
      where: "руководителю организации (кадры/бухгалтерия)",
      term: "назначение — 10 дней; выплата — в ближайшую зарплату",
      fee: "бесплатно",
      attach: "номер ЭЛН / бумажный больничный, реквизиты",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      sick: "электронный больничный № 12345 за период 01–10.09.2026 до сих пор не оплачен",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "sick", label: "Больничный (номер, период, что не выплачено)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об оплате пособия по временной нетрудоспособности") +
      `
  <p class="mb-4 text-justify">
    {{sick}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 183 Трудового кодекса Российской Федерации и ст. 13–15 Федерального закона № 255-ФЗ прошу
    назначить и выплатить пособие, а также компенсацию за задержку (ст. 236 ТК РФ).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-extremism-threats",
    name: "Заявление в полицию об угрозах и вымогательстве",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), УК РФ (ст. 119, 163)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Угрожают расправой или требуют деньги/имущество: фиксируйте всё (записи, переписка, свидетели). Отличие угрозы от вымогательства распишите подробно — это разные статьи.",
    suggestedDocs: ["stmt-police-beating", "stmt-police-fraud"],
    submitTo: {
      where: "дежурная часть отдела полиции",
      term: "решение — 3 суток (до 30 при проверке)",
      fee: "бесплатно",
      attach: "записи разговоров, переписка, данные свидетелей",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "20.09.2026 Сидоров С.С. потребовал 100 000 рублей, угрожая сжечь автомобиль; разговор записан, свидетелем был сосед Кузнецов А.А.",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Кто, что требует, чем угрожает + доказательства", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о вымогательстве и угрозах") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу провести проверку и решить вопрос
    о возбуждении уголовного дела (ст. 119, 163 УК РФ).
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-dacha-theft",
    name: "Заявление в полицию о краже с дачи / из квартиры (взлом)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), УК РФ (ст. 158 ч. 3 — с проникновением)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Кража со взломом — тяжкий состав (до 6 лет): ничего не трогайте до приезда полиции, вызывайте 102. Перепишите серийники техники заранее — это ускорит розыск.",
    suggestedDocs: ["stmt-police-theft", "stmt-police-car-theft"],
    submitTo: {
      where: "дежурная часть по месту кражи (сначала звонок 102, место не трогать)",
      term: "следственно-оперативная группа выезжает немедленно",
      fee: "бесплатно",
      attach: "документы на похищенное, серийники, фото, записи камер СНТ",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "24.09.2026 обнаружил взлом дачного дома (СНТ «Ромашка», уч. 10): выставлено окно, похищены телевизор (50 000 рублей) и инструменты (30 000 рублей)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что взломано, что похищено (суммы, серийники)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о краже с незаконным проникновением") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу провести проверку и возбудить
    уголовное дело по п. «а» ч. 3 ст. 158 УК РФ.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-doc-loss",
    name: "Заявление в полицию об утере паспорта / документов",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "Положение о паспорте (ПП РФ № 828), КоАП РФ (ст. 19.16)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Потеряли паспорт — идите в полицию за талоном-уведомлением, затем в МВД/МФЦ за новым. Талон защитит от кредитов на ваше имя. Штраф за утерю — 100–300 ₽.",
    suggestedDocs: ["stmt-police-theft", "stmt-migration-registration"],
    submitTo: {
      where: "любой отдел полиции (талон) → МВД/МФЦ (новый паспорт)",
      term: "талон — в день обращения; новый паспорт — 5–30 дней",
      fee: "госпошлина за новый паспорт 1500 ₽; штраф за утерю 100–300 ₽",
      attach: "фото, свидетельство о рождении, военный билет (что есть)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      what: "паспорт гражданина РФ на имя Иванова И.И., утерян 23.09.2026 в районе станции метро (кражи не было)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "what", label: "Что утеряно (паспорт/документы, обстоятельства)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об утрате документов") +
      `
  <p class="mb-4 text-justify">
    {{what}}.
  </p>
  <p class="mb-4 text-justify">
    Прошу зарегистрировать настоящее заявление и выдать талон-уведомление для оформления нового документа.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-divorce-court",
    name: "Исковое заявление о расторжении брака (через суд)",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "СК РФ (ст. 21–25), ГПК РФ (ст. 23, 28)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Развод через суд: есть дети до 18 или второй против. Мировой — без спора о детях, районный — со спором. Срок на примирение — до 3 месяцев.",
    suggestedDocs: ["stmt-family-divorce-joint", "stmt-divorce-alimony-order"],
    submitTo: {
      where: "мировой судья (без спора о детях) или районный суд (со спором)",
      term: "месяц со дня подачи; примирение — до 3 месяцев (ст. 22 СК)",
      fee: "госпошлина 600 ₽ (ст. 333.19 НК)",
      attach: "свидетельство о браке, свидетельства о рождении детей, квитанция",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      marriage: "брак с Ивановым И.И. с 10.06.2015, общий ребёнок Иванов П.И., 2020 г.р.; совместная жизнь не сложилась, примирение невозможно, спора о детях нет",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "marriage", label: "Брак, дети, почему развод, есть ли спор", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о расторжении брака") +
      `
  <p class="mb-4 text-justify">
    {{marriage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 21–23 Семейного кодекса Российской Федерации прошу брак расторгнуть.
  </p>
  <p class="mb-4 text-justify">
    <strong>Приложение:</strong> свидетельство о браке, свидетельства о рождении детей, квитанция о госпошлине.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-debt-note",
    name: "Исковое заявление о взыскании долга по расписке",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 807–811, 395), ГПК РФ (ст. 23, 28)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Долг по расписке: прикладывайте оригинал + расчёт процентов (ключевая ставка ЦБ). До 100 000 ₽ — мировой судья, свыше — районный. Досудебная претензия усилит позицию.",
    suggestedDocs: ["stmt-court-order-cancel", "stmt-court-docs"],
    submitTo: {
      where: "мировой судья (до 100 000 ₽) или районный суд (свыше)",
      term: "мировой — месяц; районный — 2 месяца",
      fee: "госпошлина от цены иска (ст. 333.19 НК)",
      attach: "оригинал расписки/договор займа, расчёт процентов, претензия, квитанция",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      loan: "10.01.2025 передал Петрову П.П. 250 000 рублей (расписка прилагается), срок возврата — 10.07.2025, не вернул",
      calc: "долг 250 000 + проценты по ст. 395 ГК 15 000 + госпошлина",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "loan", label: "Заём (дата, сумма, срок, возврат)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
      { id: "calc", label: "Расчёт требований (долг + проценты + пошлина)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о взыскании долга по договору займа") +
      `
  <p class="mb-4 text-justify">
    {{loan}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 807–811, 395 Гражданского кодекса Российской Федерации прошу взыскать: {{calc}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-privatization",
    name: "Заявление о приватизации квартиры",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "Закон № 1541-1 «О приватизации жилищного фонда»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Приватизация муниципального жилья: бесплатно один раз в жизни. Нужны согласия всех зарегистрированных (отказы — нотариально). Срок оформления — 2 месяца.",
    suggestedDocs: ["stmt-migration-registration", "stmt-housing-recalc"],
    submitTo: {
      where: "администрация / департамент жилья (или МФЦ)",
      term: "рассмотрение — 2 месяца (ст. 8 закона № 1541-1)",
      fee: "бесплатно (госпошлина за регистрацию права 2000 ₽)",
      attach: "договор соцнайма, выписка из домовой книги, отказы/согласия, паспорта",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Департамент городского имущества г. Москвы",
      recipient_address: "г. Москва",
      flat: "квартира по адресу: г. Москва, ул. Ленина, д. 1, кв. 5 (договор соцнайма № 100), зарегистрированы двое, все согласны",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "flat", label: "Квартира и зарегистрированные (согласия/отказы)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о приватизации жилого помещения") +
      `
  <p class="mb-4 text-justify">
    Прошу передать в собственность в порядке приватизации: {{flat}}.
  </p>
  <p class="mb-4 text-justify">
    Ранее право приватизации не использовал(а). На основании Закона РФ от 04.07.1991 № 1541-1 прошу заключить договор
    передачи. Документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-subsidy",
    name: "Заявление на субсидию на оплату ЖКУ",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ЖК РФ (ст. 159), ПП РФ № 761",
    lastUpdated: "Сентябрь 2026",
    description:
      "Субсидия, если коммуналка съедает over 22% дохода семьи (в Москве — 10%): назначается на 6 месяцев, продлевается. Подаётся через Госуслуги/МФЦ.",
    suggestedDocs: ["stmt-housing-recalc", "stmt-sfr-benefit"],
    submitTo: {
      where: "соцзащита / МФЦ / Госуслуги",
      term: "решение — 10 рабочих дней; назначается на 6 месяцев",
      fee: "бесплатно",
      attach: "доходы семьи за 6 месяцев, квитанции ЖКУ, состав семьи",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отдел соцзащиты района г. Москвы",
      recipient_address: "г. Москва",
      family: "семья из 3 человек, доход 60 000 рублей, плата за ЖКУ 15 000 рублей (25% дохода)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "family", label: "Состав семьи, доходы, плата за ЖКУ", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении субсидии на оплату ЖКУ") +
      `
  <p class="mb-4 text-justify">
    {{family}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 159 Жилищного кодекса Российской Федерации и Правил № 761 прошу предоставить субсидию на оплату
    жилого помещения и коммунальных услуг. Документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-neighbour-flood-claim",
    name: "Претензия соседу о возмещении ущерба от залива",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ГК РФ (ст. 1064, 1082)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Досудебная претензия виновнику залива: акт УК + оценка ущерба + требование. Добровольно не платит — в суд с теми же документами плюс госпошлина.",
    suggestedDocs: ["stmt-housing-flood", "lawsuit-statement"],
    submitTo: {
      where: "виновнику (вручите под подпись или заказным письмом)",
      term: "разумный срок ответа — 10–30 дней; затем — в суд",
      fee: "бесплатно",
      attach: "акт УК, отчёт об оценке, чеки, фото",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Сидорову С.С. (кв. 10)",
      recipient_address: "г. Москва, ул. Ленина, д. 1, кв. 10",
      damage: "залив 24.09.2026 из кв. 10 (акт УК № 5), ущерб по оценке 85 000 рублей (отчёт прилагается)",
      ask: "возместить 85 000 рублей в течение 14 дней",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "damage", label: "Залив и ущерб (акт, оценка)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требование (сумма, срок)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>о возмещении ущерба от залива") +
      `
  <p class="mb-4 text-justify">
    {{damage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1064 Гражданского кодекса Российской Федерации требую: {{ask}}.
    При отказе обращусь в суд с взысканием ущерба, расходов на оценку, госпошлины и компенсации морального вреда.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-severance",
    name: "Заявление о выплате выходного пособия при сокращении",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 178, 180)",
    lastUpdated: "Сентябрь 2026",
    description:
      "При сокращении положено: средний месячный заработок + сохранение за 2 месяца (3-й — через ЦЗН). Увольнение раньше 2 месяцев — плюс компенсация.",
    suggestedDocs: ["stmt-hr-dismiss", "stmt-hr-work-book"],
    submitTo: {
      where: "руководителю организации",
      term: "предупреждение — за 2 месяца; выплаты — в день увольнения и по месяцам",
      fee: "бесплатно",
      attach: "уведомление о сокращении, приказ (если есть)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      fact: "уведомлён о сокращении с 01.12.2026 (уведомление № 7 от 24.09.2026)",
      ask: "произвести все причитающиеся выплаты по ст. 178 ТК РФ в день увольнения",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Сокращение (уведомление, дата)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "ask", label: "Что просите", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о выплатах при сокращении") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 178, 180 Трудового кодекса Российской Федерации прошу {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-maternity-benefit",
    name: "Заявление о назначении пособия по беременности и родам",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ФЗ № 255-ФЗ (ст. 10–11), ТК РФ (ст. 255)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Декретные: 140 дней (194 при многоплодной), 100% среднего заработка. Электронный больничный — заявление короткое, деньги платит СФР через работодателя.",
    suggestedDocs: ["stmt-hr-maternity", "stmt-sfr-benefit"],
    submitTo: {
      where: "руководителю организации (кадры)",
      term: "назначение — 10 дней; выплата — в ближайшую зарплату",
      fee: "бесплатно",
      attach: "электронный больничный (номер), заявление о замене лет (для увеличения пособия)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      sick: "электронный больничный № 999 с 01.10.2026 на 140 календарных дней",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "sick", label: "Больничный (номер, срок)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении отпуска по беременности и родам") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить отпуск по беременности и родам: {{sick}} — и назначить пособие (ст. 255 ТК РФ, ФЗ № 255-ФЗ).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-police-cyber-fraud",
    name: "Заявление в полицию о взломе аккаунта / краже с карты онлайн",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "police",
    actSource: "УПК РФ (ст. 141), УК РФ (ст. 158 ч. 3 п. «г», 159.3, 272)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Взлом Госуслуг, соцсетей, кража с карты через фишинг: меняйте пароли, блокируйте карты, затем в полицию. Укажите IP/номера/ссылки — это улики.",
    suggestedDocs: ["stmt-police-fraud", "stmt-bank-chargeback"],
    submitTo: {
      where: "дежурная часть / отдел «К» (киберпреступления) через сайт МВД",
      term: "решение — 3 суток (до 30 при проверке)",
      fee: "бесплатно",
      attach: "скриншоты, ссылки, номера, выписки, заявление в банк",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Начальнику ОМВД России по району",
      recipient_address: "г. Москва",
      fact: "23.09.2026 взломан аккаунт на Госуслугах (фишинговое SMS), с карты списано 40 000 рублей; карту заблокировал, в банк обратился",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что взломано, что похищено, следы", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о киберпреступлении") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 141 Уголовно-процессуального кодекса Российской Федерации прошу провести проверку и решить вопрос
    о возбуждении уголовного дела.
  </p>
  <p class="mb-4 text-justify">
    Об уголовной ответственности за заведомо ложный донос по ст. 306 УК РФ предупреждён(а).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-alimony-fixed",
    name: "Иск о взыскании алиментов в твёрдой сумме",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "СК РФ (ст. 83, 117)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Должник без официального дохода, ИП или в валюте? Просите твёрдую сумму — не ниже прожиточного минимума на ребёнка. Индексируется приставом автоматически.",
    suggestedDocs: ["stmt-divorce-alimony-order", "stmt-fssp-alimony-debt"],
    submitTo: {
      where: "мировой судья по вашему месту жительства или месту жительства ответчика",
      term: "месяц со дня подачи",
      fee: "истец освобождён от пошлины",
      attach: "свидетельства о рождении, расчёт расходов на ребёнка, данные о доходах ответчика",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      grounds: "ответчик официально не работает, доход нерегулярный; расходы на ребёнка 30 000 рублей в месяц (расчёт прилагается)",
      amount: "17 000 рублей ежемесячно (прожиточный минимум на ребёнка) с индексацией",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "grounds", label: "Почему доля невозможна (доходы ответчика, расходы на ребёнка)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "amount", label: "Сумма и индексация", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о взыскании алиментов в твёрдой денежной сумме") +
      `
  <p class="mb-4 text-justify">
    {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 83 Семейного кодекса Российской Федерации прошу взыскать алименты в размере {{amount}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-zpp-defect",
    name: "Иск о возврате денег за товар с недостатками (ЗПП)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "Закон «О защите прав потребителей» (ст. 18–24), ГПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Брак, отказ в возврате: цена + неустойка 1% в день + штраф 50% + моральный вред. Потребитель освобождён от пошлины до 1 млн ₽, иск — по своему адресу.",
    suggestedDocs: ["stmt-rospotrebnadzor", "claim-generic"],
    submitTo: {
      where: "мировой (до 100 000 ₽) или районный суд — по вашему адресу, адресу продавца или покупки",
      term: "мировой — месяц; районный — 2 месяца",
      fee: "освобождены при цене иска до 1 млн ₽ (ст. 333.36 НК)",
      attach: "чек/договор, претензия с отметкой, экспертиза (если есть), переписка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      goods: "холодильник за 60 000 рублей (чек от 10.08.2026), морозилка не работает; претензию от 12.09.2026 проигнорировали",
      ask: "взыскать 60 000 рублей, неустойку 1% в день, штраф 50% и 10 000 рублей морального вреда",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "goods", label: "Товар, цена, недостаток, претензия", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требования (цена + неустойка + штраф + моралка)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о защите прав потребителя") +
      `
  <p class="mb-4 text-justify">
    {{goods}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 18–24 Закона «О защите прав потребителей» прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-labor-reinstate",
    name: "Иск о восстановлении на работе и оплате прогула",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ТК РФ (ст. 391–395), ГПК РФ (ст. 28)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Незаконное увольнение: срок — месяц с приказа/трудовой! Восстановление + средний заработок за прогул + моралка. Участвует прокурор.",
    suggestedDocs: ["stmt-gti-complaint", "stmt-hr-discipline-appeal"],
    submitTo: {
      where: "районный суд по вашему адресу или адресу работодателя",
      term: "месяц со дня увольнения (ст. 392 ТК) — пропуск почти не восстанавливают!",
      fee: "работник освобождён от пошлины и расходов (ст. 393 ТК)",
      attach: "приказ об увольнении, трудовая, трудовой договор, расчёты",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      firing: "уволен 15.09.2026 за прогул, хотя больничный с 14.09.2026 сдан в кадры (копия прилагается); объяснения не запрашивали",
      ask: "восстановить на работе, взыскать средний заработок за прогул и 30 000 рублей морального вреда",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "firing", label: "Увольнение и в чём незаконность", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Требования", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о восстановлении на работе") +
      `
  <p class="mb-4 text-justify">
    {{firing}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 391–395 Трудового кодекса Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-bank-account-close",
    name: "Заявление о закрытии счёта и возврате остатка",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ГК РФ (ст. 859), Инструкция ЦБ № 204-И",
    lastUpdated: "Сентябрь 2026",
    description:
      "Закрытие счёта по вашему заявлению — в любой момент, без объяснений. Остаток выдают наличными или переводят. Комиссию за закрытие брать не вправе.",
    suggestedDocs: ["stmt-bank-chargeback", "stmt-cb-complaint"],
    submitTo: {
      where: "в банк (отделение или приложение)",
      term: "остаток — в течение 7 дней после заявления (ст. 859 ГК)",
      fee: "бесплатно",
      attach: "паспорт; реквизиты для перевода остатка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ПАО «Банк»",
      recipient_address: "г. Москва",
      account: "счёт № 40817810XXXXXXXXXXXXXX; остаток прошу перевести на счёт № 40817810YYYYYYYYYYYYYY",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "account", label: "Счёт и куда вернуть остаток", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о закрытии банковского счёта") +
      `
  <p class="mb-4 text-justify">
    На основании ст. 859 Гражданского кодекса Российской Федерации прошу закрыть {{account}} и выдать справку
    о закрытии.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-zpp-service",
    name: "Иск о некачественной услуге (ремонт, стройка, сервис)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "Закон «О защите прав потребителей» (ст. 27–31)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Сорваны сроки, брак в работе: уменьшение цены, неустойка 3% в день, расторжение + штраф 50%. Экспертиза докажет брак лучше слов.",
    suggestedDocs: ["stmt-court-zpp-defect", "stmt-rospotrebnadzor"],
    submitTo: {
      where: "мировой (до 100 000 ₽) или районный суд — по вашему адресу",
      term: "мировой — месяц; районный — 2 месяца",
      fee: "освобождены при цене иска до 1 млн ₽",
      attach: "договор, акты, претензия, экспертиза, переписка",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      work: "ремонт квартиры по договору от 01.06.2026 (300 000 рублей): сроки сорваны на 2 месяца, плитка уложена с перепадами (экспертиза прилагается)",
      ask: "взыскать неустойку 3% в день, 50 000 рублей на устранение и штраф 50%",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "work", label: "Работа, договор, недостатки, претензия", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Требования", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о защите прав потребителя (услуги)") +
      `
  <p class="mb-4 text-justify">
    {{work}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 27–31 Закона «О защите прав потребителей» прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-housing-eviction-neighbour",
    name: "Иск о выселении / нечинении препятствий в пользовании жильём",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ЖК РФ (ст. 31, 35, 83–91), ГК РФ (ст. 304)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Бывший член семьи не съезжает или чинит препятствия: только через суд, участковый не выселит. Приложите выписку из домовой книги и акты о непроживании/препятствиях.",
    suggestedDocs: ["stmt-housing-recalc", "stmt-police-noise"],
    submitTo: {
      where: "районный суд по месту нахождения квартиры",
      term: "2 месяца; участвует прокурор (по выселению)",
      fee: "госпошлина 300 ₽ (неимущественное требование)",
      attach: "выписка ЕГРН/ордер, домовая книга, акты, решения о разводе",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      fact: "бывший супруг после развода (решение от 01.06.2026) в квартире не проживает с июля, но сняться с учёта отказывается, коммунальные не оплачивает",
      ask: "признать утратившим право пользования и снять с регистрационного учёта",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Кто, почему утратил право, доказательства", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Требования", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о признании утратившим право пользования") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 31, 35 Жилищного кодекса Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-family-alimony-agreement-end",
    name: "Заявление об отмене алиментов при усыновлении / совершеннолетии",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "СК РФ (ст. 114–120)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Алименты прекращаются не сами: ребёнку 18, усыновление, смерть, восстановление трудоспособности. Подайте в суд — пристав закроет производство по решению.",
    suggestedDocs: ["stmt-divorce-alimony-order", "stmt-fssp-alimony-debt"],
    submitTo: {
      where: "мировой судья, выносивший приказ / районный суд",
      term: "месяц; прекращение — со дня решения (задолженность не списывается!)",
      fee: "госпошлина 300 ₽",
      attach: "свидетельства, решение об усыновлении, доказательства",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Мировому судье судебного участка № 100 г. Москвы",
      recipient_address: "г. Москва",
      grounds: "сын Иванов П.И. достиг 18 лет 01.06.2026 (свидетельство прилагается), приказ от 01.03.2020 прошу отменить с 01.06.2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "grounds", label: "Основание прекращения (18 лет, усыновление, смерть)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о прекращении взыскания алиментов") +
      `
  <p class="mb-4 text-justify">
    {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 120 Семейного кодекса Российской Федерации прошу прекратить взыскание алиментов.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-salary-index",
    name: "Заявление об индексации зарплаты",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 130, 134)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Работодатель обязан индексировать зарплату при росте цен — порядок пишет в локальных актах. Нет индексации годами — требуйте письменно, затем в ГИТ и суд.",
    suggestedDocs: ["stmt-hr-salary", "stmt-gti-complaint"],
    submitTo: {
      where: "руководителю организации",
      term: "по порядку из колдоговора/положения; при отказе — в ГИТ или суд",
      fee: "бесплатно",
      attach: "справка об инфляции (Росстат), локальные акты об индексации",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      fact: "зарплата не индексировалась с 2022 года при инфляции over 30%, положение об индексации в компании отсутствует",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Сколько лет без индексации, инфляция, акты", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об индексации заработной платы") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 130, 134 Трудового кодекса Российской Федерации прошу установить порядок индексации
    и произвести индексацию моей заработной платы.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-bank-card-block-appeal",
    name: "Заявление о разблокировке счёта (115-ФЗ)",
    category: "finance",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 115-ФЗ (ст. 7–7.2), Положение ЦБ № 375-П",
    lastUpdated: "Сентябрь 2026",
    description:
      "Банк заблокировал счёт по антиотмывочному закону: несите документы о происхождении денег (договоры, справки). Отказ — в межведомственную комиссию ЦБ, затем в суд.",
    suggestedDocs: ["stmt-bank-account-close", "stmt-cb-complaint"],
    submitTo: {
      where: "в банк (документы) → межведомственная комиссия ЦБ → суд",
      term: "банк рассматривает документы — 7 рабочих дней",
      fee: "бесплатно",
      attach: "договоры, акты, справки о доходах, пояснения по операциям",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ПАО «Банк»",
      recipient_address: "г. Москва",
      block: "счёт № 40817810XXXXXXXXXXXXXX заблокирован 20.09.2026, операции — оплата подрядчикам по договорам (копии прилагаются)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "block", label: "Блокировка и экономический смысл операций", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о снятии ограничений по счёту (115-ФЗ)") +
      `
  <p class="mb-4 text-justify">
    {{block}}.
  </p>
  <p class="mb-4 text-justify">
    Операции имеют прозрачный экономический смысл и не связаны с легализацией доходов. На основании ФЗ № 115-ФЗ
    прошу снять ограничения. Документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-auto-dtp-europrotocol",
    name: "Извещение о ДТП (европротокол) — инструкция и заполнение",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 40-ФЗ (ст. 11.1), ПДД (п. 2.6.1)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Без ГИБДД при 4 условиях: 2 авто, ОСАГО у обоих, ущерб до 100 000 ₽ (до 400 000 ₽ с фотофиксацией), пострадавших нет. Разъезжайтесь только после фото и извещения.",
    suggestedDocs: ["stmt-auto-osago-claim", "stmt-gibdd-appeal"],
    submitTo: {
      where: "в свою страховую вместе с заявлением о выплате (5 рабочих дней)",
      term: "извещение — на месте ДТП; выплата — за 20 дней",
      fee: "бесплатно",
      attach: "извещение о ДТП, фото/видео, приложение «Помощник ОСАГО»",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ООО «СК Страховщик»",
      recipient_address: "г. Москва",
      accident: "ДТП 24.09.2026 на ул. Мира: Kia Rio А123БВ777 и Lada В456ГД777, вина второго признана обоюдно, пострадавших нет, ущерб ~50 000 рублей, оформлено извещение + фото",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "accident", label: "ДТП (участники, вина, ущерб, фотофиксация)", type: "textarea", defaultValue: "", category: "vehicle", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о ДТП, оформленном без ГИБДД (европротокол)") +
      `
  <p class="mb-4 text-justify">
    {{accident}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 11.1 ФЗ «Об ОСАГО» направляю извещение о ДТП и прошу произвести страховое возмещение.
    Извещение и фотофиксация прилагаются.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-travel-tour-refund",
    name: "Претензия туроператору о возврате за отменённый тур",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 132-ФЗ «Об основах туристской деятельности» (ст. 10–10.1), Закон о ЗПП (ст. 32)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Тур не состоялся или сорван: требуйте возврат + неустойку. Отказ от тура по своей инициативе — возврат за вычетом фактических расходов (требуйте их доказать).",
    suggestedDocs: ["stmt-rospotrebnadzor", "stmt-court-zpp-defect"],
    submitTo: {
      where: "туроператору (заказным письмом)",
      term: "ответ — 10 дней; возврат — 10 дней после решения",
      fee: "бесплатно",
      attach: "договор, чеки, переписка, доказательства отмены",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Генеральному директору ООО «Тур»",
      recipient_address: "г. Москва",
      tour: "тур в Турцию с 01.10.2026 (договор № 50, 120 000 рублей) отменён оператором 20.09.2026",
      ask: "вернуть 120 000 рублей в течение 10 дней",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "tour", label: "Тур, договор, что случилось", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требование", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>о возврате стоимости тура") +
      `
  <p class="mb-4 text-justify">
    {{tour}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 10 ФЗ «Об основах туристской деятельности» требую: {{ask}}.
    При отказе обращусь в суд с неустойкой, штрафом 50% и моральным вредом.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-telecom-spam-stop",
    name: "Заявление оператору о блокировке спама и платных подписок",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ «О связи» (ст. 44–44.1), ФЗ «О рекламе» (ст. 18), ПП РФ № 1342",
    lastUpdated: "Сентябрь 2026",
    description:
      "Снимают за подписки, которых не подключали, звонят с рекламой: требуйте детализацию, отключение и возврат. Не помогло — в Роскомнадзор и суд.",
    suggestedDocs: ["stmt-fas-complaint", "stmt-rospotrebnadzor"],
    submitTo: {
      where: "оператору связи (салон, приложение, претензия)",
      term: "ответ на претензию — 30 дней (60 — по роумингу)",
      fee: "бесплатно",
      attach: "детализация, скриншоты подписок, номера спамеров",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 111-22-33",
      recipient_name: "Генеральному директору ООО «Оператор»",
      recipient_address: "г. Москва",
      problem: "с номера +7 (900) 111-22-33 списано 900 рублей за подписки, которых не подключал; согласие на рекламу не давал",
      ask: "отключить подписки и рекламу, вернуть 900 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "problem", label: "Списания/спам (номер, суммы, подписки)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что требуете", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>оператору связи") +
      `
  <p class="mb-4 text-justify">
    {{problem}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 44 ФЗ «О связи» и ст. 18 ФЗ «О рекламе» требую: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-med-tax-refund",
    name: "Заявление на вычет за лечение и лекарства",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "НК РФ (ст. 219)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Возврат 13% за лечение (своё, детей, родителей, супруга): обычное — до 150 000 ₽ расходов, дорогостоящее — без лимита. Справка из клиники — главный документ.",
    suggestedDocs: ["stmt-tax-deduction", "stmt-med-complaint"],
    submitTo: {
      where: "в налоговую (ЛК, лично, почта) с декларацией 3-НДФЛ",
      term: "проверка — 3 месяца; возврат — месяц",
      fee: "бесплатно",
      attach: "договор с клиникой, справка об оплате, чеки, лицензия, 2-НДФЛ",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ИФНС России № 1 по г. Москве",
      recipient_address: "г. Москва",
      treatment: "лечение в ООО «Клиника» на 120 000 рублей в 2025 году (договор, справка, чеки прилагаются)",
      amount: "15 600 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "treatment", label: "Лечение (клиника, сумма, год)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "amount", label: "Сумма к возврату", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о социальном вычете на лечение") +
      `
  <p class="mb-4 text-justify">
    {{treatment}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 219 Налогового кодекса Российской Федерации прошу предоставить социальный вычет и вернуть {{amount}}
    (декларация 3-НДФЛ прилагается).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-inheritance-dispute",
    name: "Иск о разделе наследственного имущества",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 252, 1141–1149, 1164–1170)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Наследники не договорились: раздел через суд с учётом долей, преимущественного права (кто жил/пользовался) и компенсации. Оценка имущества обязательна.",
    suggestedDocs: ["stmt-notary-inherit", "stmt-inherit-accept-fact"],
    submitTo: {
      where: "районный суд по месту нахождения недвижимости (или ответчика)",
      term: "2 месяца; экспертиза оценки — по необходимости",
      fee: "госпошлина от цены иска",
      attach: "свидетельства о праве на наследство, оценка, документы на имущество",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      heirs: "наследники по 1/2: я и брат Сидоров С.С.; квартира 60 кв.м (оценка 12 млн рублей), соглашение не достигнуто",
      ask: "выделить мне квартиру с выплатой брату компенсации 6 млн рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "heirs", label: "Наследники, доли, имущество, оценка", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Вариант раздела", type: "textarea", defaultValue: "", category: "property", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о разделе наследственного имущества") +
      `
  <p class="mb-4 text-justify">
    {{heirs}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 252, 1164–1170 Гражданского кодекса Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-criminal-compensation",
    name: "Гражданский иск в уголовном деле (возмещение вреда)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "УПК РФ (ст. 44), ГК РФ (ст. 1064, 1100–1101)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Вред от преступления взыскивайте прямо в уголовном деле — без отдельного иска и пошлины. Заявите следователю или в суде до удаления в совещательную.",
    suggestedDocs: ["stmt-police-theft", "stmt-police-fraud"],
    submitTo: {
      where: "следователю/дознавателю или в суд, рассматривающий уголовное дело",
      term: "до удаления суда в совещательную комнату",
      fee: "госпошлиной не облагается",
      attach: "документы о вреде: чеки, оценки, медсправки",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Следователю ОМВД по району г. Москвы",
      recipient_address: "г. Москва",
      harm: "кражей причинён ущерб 110 000 рублей (уголовное дело № 12345), подтверждается протоколом и оценкой",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "harm", label: "Вред (сумма, дело, чем подтверждается)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Гражданский иск<br>в уголовном деле") +
      `
  <p class="mb-4 text-justify">
    {{harm}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 44 Уголовно-процессуального кодекса Российской Федерации и ст. 1064 Гражданского кодекса
    Российской Федерации прошу взыскать причинённый преступлением вред в полном объёме.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-admin-sue",
    name: "Административный иск на госорган (КАС)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "КАС РФ (ст. 124–127, 218–220)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Оспаривание действий чиновников, отказов, бездействия: 3 месяца с нарушения. Суд сам истребует доказательства у органа — бремя доказывания на нём.",
    suggestedDocs: ["stmt-prosecutor-complaint", "stmt-nalog-complaint"],
    submitTo: {
      where: "районный суд по вашему адресу или адресу органа",
      term: "3 месяца со дня нарушения прав (ст. 219 КАС)",
      fee: "госпошлина 300 ₽",
      attach: "оспариваемый отказ/акт, обращения, ответы",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      act: "отказ администрации от 10.09.2026 в согласовании перепланировки без законных оснований",
      ask: "признать отказ незаконным и обязать согласовать",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "act", label: "Акт/бездействие органа (дата, суть)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Что просите", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Административное исковое заявление") +
      `
  <p class="mb-4 text-justify">
    {{act}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 218–220 Кодекса административного судопроизводства Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-postal-lost-claim",
    name: "Претензия Почте России за утерю / повреждение отправления",
    category: "postal",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ «О почтовой связи» (ст. 34), Приказ Минцифры № 234",
    lastUpdated: "Сентябрь 2026",
    description:
      "Потеряли посылку или разбили: компенсация — объявленная ценность + тариф. Претензия — за 6 месяцев, ответ — месяц. Затем — суд по ЗПП.",
    suggestedDocs: ["stmt-rospotrebnadzor", "stmt-court-zpp-defect"],
    submitTo: {
      where: "в отделение или онлайн (претензия обязательна до суда)",
      term: "претензия — 6 месяцев; ответ — 30 дней",
      fee: "бесплатно",
      attach: "квитанция, трек-номер, опись, фото повреждений",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Руководителю отделения Почты России",
      recipient_address: "г. Москва",
      loss: "посылка № 12345 (объявленная ценность 20 000 рублей) от 01.09.2026 утеряна, розыск результата не дал",
      ask: "выплатить 20 000 рублей + тариф 500 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "loss", label: "Отправление (трек, ценность, что случилось)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требование", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>к оператору почтовой связи") +
      `
  <p class="mb-4 text-justify">
    {{loss}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 34 Федерального закона «О почтовой связи» требую: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-moral-harm-police",
    name: "Иск о компенсации за незаконные действия полиции / задержание",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 1069–1071, 1100–1101), УПК РФ (гл. 18 — реабилитация)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Незаконное задержание, обыск, уголовное преследование с оправданием: вред возмещает казна, вина не доказывается. Сначала добейтесь признания действий незаконными.",
    suggestedDocs: ["stmt-prosecutor-complaint", "stmt-police-beating"],
    submitTo: {
      where: "районный суд по вашему адресу (ответчик — казна в лице Минфина)",
      term: "общий срок — 3 года; по реабилитации — без срока на извинения",
      fee: "госпошлиной не облагается (реабилитация) / 300 ₽",
      attach: "постановления о прекращении/оправдании, справки о задержании",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      fact: "незаконно задержан 10.09.2026 на 48 часов, уголовное дело прекращено 20.09.2026 за отсутствием состава (право на реабилитацию признано)",
      ask: "взыскать 100 000 рублей морального вреда и утраченный заработок 20 000 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что произошло, чем подтверждена незаконность", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "ask", label: "Требования", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о компенсации вреда от незаконных действий") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1069–1071, 1100–1101 Гражданского кодекса Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-other-name-change",
    name: "Заявление о перемене имени",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 143-ФЗ (ст. 58–63), СК РФ (ст. 59)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Смена ФИО с 14 лет (до 18 — с согласия родителей/опеки): месяц на рассмотрение. Затем месяц на замену паспорта — иначе штраф за недействительный паспорт.",
    suggestedDocs: ["stmt-migration-registration", "stmt-police-doc-loss"],
    submitTo: {
      where: "ЗАГС по месту жительства или регистрации рождения",
      term: "месяц (+2 при запросах в другие органы)",
      fee: "госпошлина 1600 ₽",
      attach: "паспорт, свидетельство о рождении, согласие родителей (до 18)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отдел ЗАГС г. Москвы",
      recipient_address: "г. Москва",
      newname: "прошу переменить имя Иван на Пётр (причина — неблагозвучность, насмешки)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "newname", label: "Новое имя и причина", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о перемене имени") +
      `
  <p class="mb-4 text-justify">
    {{newname}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 58 Федерального закона «Об актах гражданского состояния» прошу произвести государственную
    регистрацию перемены имени. Документы прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-other-pensioner-benefit-region",
    name: "Заявление на региональные льготы (ветеран труда / пенсионер)",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ФЗ № 5-ФЗ «О ветеранах», региональные законы о соцподдержке",
    lastUpdated: "Сентябрь 2026",
    description:
      "ЕДВ, компенсация ЖКУ 50%, льготный проезд: звание «ветеран труда» — через соцзащиту, льготы — заявлением. Отказ обжалуйте с расчётом стажа.",
    suggestedDocs: ["stmt-pension-recalc", "stmt-housing-subsidy"],
    submitTo: {
      where: "соцзащита / МФЦ / Госуслуги",
      term: "решение — 10–30 дней; льготы — с месяца обращения",
      fee: "бесплатно",
      attach: "удостоверение ветерана/пенсионное, трудовая, награды",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В отдел соцзащиты района г. Москвы",
      recipient_address: "г. Москва",
      benefit: "ежемесячную денежную выплату и компенсацию 50% ЖКУ как ветерану труда (удостоверение № 222)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "benefit", label: "Льготы (ЕДВ, ЖКУ, проезд — какие)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о предоставлении мер социальной поддержки") +
      `
  <p class="mb-4 text-justify">
    Прошу предоставить мне {{benefit}}.
  </p>
  <p class="mb-4 text-justify">
    Документы, подтверждающие право, прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-establish-fact",
    name: "Заявление об установлении юридического факта",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 264–268)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Родство, иждивение, трудовой стаж без записей, принадлежность документов: только если иначе (внесудебно) установить нельзя. Опишите, зачем нужен факт.",
    suggestedDocs: ["stmt-inherit-accept-fact", "stmt-pension-recalc"],
    submitTo: {
      where: "районный суд по вашему адресу (кроме недвижимости — по её адресу)",
      term: "2 месяца",
      fee: "госпошлина 300 ₽",
      attach: "отказы органов, косвенные доказательства, свидетели",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      fact: "нахождение на иждивении отца (справки о переводах, совместное проживание) — для оформления пенсии по потере кормильца; СФР отказал без судебного акта",
      purpose: "назначение пенсии по случаю потери кормильца",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Какой факт и доказательства", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "purpose", label: "Зачем нужен (пенсия, наследство, документы)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об установлении факта, имеющего юридическое значение") +
      `
  <p class="mb-4 text-justify">
    {{fact}}. Установить факт во внесудебном порядке невозможно.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 264–268 Гражданского процессуального кодекса Российской Федерации прошу установить факт
    для {{purpose}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-defamation",
    name: "Иск о защите чести и достоинства (клевета в интернете)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГК РФ (ст. 152), ГПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Порочащий пост/отзыв: заверьте у нотариуса (скриншоты тают), требуйте удаления + опровержения + компенсацию. Ответчик доказывает правдивость, вы — факт публикации.",
    suggestedDocs: ["stmt-police-beating", "stmt-court-moral-harm-police"],
    submitTo: {
      where: "районный суд по вашему адресу или адресу ответчика",
      term: "2 месяца",
      fee: "госпошлина 300 ₽",
      attach: "нотариальный протокол осмотра, ссылки, экспертиза лингвиста",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      post: "ответчик опубликовал пост с ложью о моей судимости (нотариальный протокол от 20.09.2026 прилагается), сведения не соответствуют действительности",
      ask: "обязать удалить и опровергнуть, взыскать 200 000 рублей морального вреда",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "post", label: "Публикация (где, что, чем заверена)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требования", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Исковое заявление<br>о защите чести, достоинства и деловой репутации") +
      `
  <p class="mb-4 text-justify">
    {{post}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 152 Гражданского кодекса Российской Федерации прошу: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-mil-ags",
    name: "Заявление о замене военной службы альтернативной (АГС)",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "military",
    actSource: "ФЗ № 113-ФЗ «Об альтернативной гражданской службе», Конституция (ст. 59)",
    lastUpdated: "Сентябрь 2026",
    description:
      "АГС по убеждениям: подавайте за 6 месяцев до призыва, обоснуйте убеждения подробно. Отказ — обжалуйте в суд, отправку приостановят.",
    suggestedDocs: ["stmt-mil-postpone", "stmt-mil-appeal"],
    submitTo: {
      where: "военкомат по месту учёта (заявление о замене службы)",
      term: "за 6 месяцев до призыва; решение — за месяц до призыва",
      fee: "бесплатно",
      attach: "автобиография, характеристика, доказательства убеждений",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю призывной комиссии района г. Москвы",
      recipient_address: "г. Москва",
      beliefs: "по религиозным убеждениям не могу брать в руки оружие (прихожанин с 2015 года, справка общины прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "beliefs", label: "Убеждения и чем подтверждаются", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о замене военной службы альтернативной гражданской службой") +
      `
  <p class="mb-4 text-justify">
    {{beliefs}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 59 Конституции Российской Федерации и ФЗ «Об альтернативной гражданской службе» прошу заменить
    военную службу по призыву альтернативной гражданской службой.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-mil-health-review",
    name: "Заявление о направлении на медосвидетельствование / переосвидетельствование",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "military",
    actSource: "ФЗ № 53-ФЗ (ст. 5.1), ПП РФ № 565 (Расписание болезней)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Не согласны с категорией годности? Требуйте направления к профильному врачу и приобщения новых диагнозов. КМО вышестоящей комиссии — тоже по заявлению.",
    suggestedDocs: ["stmt-mil-postpone", "stmt-mil-appeal"],
    submitTo: {
      where: "председателю призывной комиссии / военкому",
      term: "в период призывных мероприятий",
      fee: "бесплатно",
      attach: "выписки, МРТ/анализы, заключения врачей",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю призывной комиссии района г. Москвы",
      recipient_address: "г. Москва",
      health: "диагноз «сколиоз 2 степени» (выписка прилагается) не учтён, категория «А» выставлена без направления к ортопеду",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "health", label: "Диагнозы и что не учтено", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о медицинском освидетельствовании") +
      `
  <p class="mb-4 text-justify">
    {{health}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 5.1 ФЗ «О воинской обязанности и военной службе» прошу направить меня на обследование
    и приобщить медицинские документы к личному делу призывника.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-hr-reference",
    name: "Заявление о выдаче характеристики / рекомендации с работы",
    category: "business",
    kind: "statement",
    formKind: "free",
    statementGroup: "hr",
    actSource: "ТК РФ (ст. 62)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Характеристика для суда, опеки, нового работодателя: выдаётся за 3 дня по письменному запросу. Отказ — нарушение ст. 62 ТК.",
    suggestedDocs: ["stmt-hr-work-book", "stmt-hr-dismiss"],
    submitTo: {
      where: "руководителю организации (кадры)",
      term: "3 рабочих дня (ст. 62 ТК)",
      fee: "бесплатно",
      attach: "не требуется",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "",
      sender_phone: "",
      recipient_name: "Генеральному директору ООО «Ромашка» Сидорову С.С.",
      recipient_address: "",
      purpose: "для представления в суд (характеристика с места работы)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "purpose", label: "Куда нужна (суд, опека, работодатель)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о выдаче характеристики") +
      `
  <p class="mb-4 text-justify">
    На основании ст. 62 Трудового кодекса Российской Федерации прошу выдать мне характеристику {{purpose}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-zpp-airline-delay",
    name: "Претензия авиакомпании за задержку / отмену рейса",
    category: "other",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "Воздушный кодекс (ст. 120–126), Закон о ЗПП, Монреальская конвенция",
    lastUpdated: "Сентябрь 2026",
    description:
      "Рейс задержан over 2 часов — положены вода, питание, отель; отмена — возврат + 25% штрафа + убытки. Внутренний рейс — претензия за 6 месяцев.",
    suggestedDocs: ["stmt-travel-tour-refund", "stmt-rospotrebnadzor"],
    submitTo: {
      where: "авиакомпании (онлайн-претензия)",
      term: "внутренние рейсы — 6 месяцев; международные — 7–21 день (конвенция)",
      fee: "бесплатно",
      attach: "билеты, посадочные, чеки на отель/еду, справки о задержке",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Генеральному директору ПАО «Авиакомпания»",
      recipient_address: "г. Москва",
      flight: "рейс № 100 Москва–Сочи 20.09.2026 задержан на 8 часов, питание и отель не предоставлены (расходы 8 000 рублей, чеки прилагаются)",
      ask: "выплатить штраф 25% тарифа, 8 000 рублей убытков и 20 000 рублей морального вреда",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "flight", label: "Рейс, задержка, расходы", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требования", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>о задержке рейса") +
      `
  <p class="mb-4 text-justify">
    {{flight}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 120 Воздушного кодекса Российской Федерации требую: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-auto-insurance-kasko-dispute",
    name: "Претензия по КАСКО (занижение / отказ)",
    category: "auto",
    kind: "statement",
    formKind: "free",
    statementGroup: "official-forms",
    actSource: "ГК РФ (ст. 929–943), Закон о ЗПП",
    lastUpdated: "Сентябрь 2026",
    description:
      "Страховая занизила выплату или отказала: независимая экспертиза + претензия с расчётом. Затем — финомбудсмен (бесплатно) и суд со штрафом 50%.",
    suggestedDocs: ["stmt-auto-osago-claim", "stmt-fin-ombudsman"],
    submitTo: {
      where: "в страховую → финомбудсмен → суд",
      term: "ответ на претензию — 10 дней (ЗПП); выплата — по правилам страхования",
      fee: "бесплатно",
      attach: "полис, акт осмотра, независимая экспертиза, чеки ремонта",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В ООО «СК Страховщик» (полис КАСКО № 777)",
      recipient_address: "г. Москва",
      damage: "ущерб 200 000 рублей (независимая экспертиза прилагается), выплачено 120 000 рублей без обоснования",
      ask: "доплатить 80 000 рублей, неустойку и компенсировать экспертизу 10 000 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "damage", label: "Ущерб, выплата, экспертиза", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
      { id: "ask", label: "Требования", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Претензия<br>по договору КАСКО") +
      `
  <p class="mb-4 text-justify">
    {{damage}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 929 ГК РФ и Закона «О защите прав потребителей» требую: {{ask}}.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-today-repair-current",
    name: "Заявление о текущем ремонте подъезда",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ПП РФ № 491 (п. 18), ЖК РФ (ст. 161, 165)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Облезшие стены, разбитые почтовые ящики, текущие трубы: текущий ремонт — обязанность УК за счёт содержания жилья. Раз в 3–5 лет — плановый ремонт подъезда.",
    suggestedDocs: ["stmt-housing-quality", "stmt-gzhi-complaint"],
    submitTo: {
      where: "управляющая компания / ТСЖ",
      term: "ответ — 10 дней (ЗПП); аварийные — немедленно",
      fee: "бесплатно (включено в содержание жилья)",
      attach: "фото, акты, подписи соседей",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      works: "в подъезде № 2 облупилась краска, разбиты 5 почтовых ящиков, не работает доводчик (фото прилагаются)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "works", label: "Что отремонтировать (фото, подписи)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о текущем ремонте общего имущества") +
      `
  <p class="mb-4 text-justify">
    {{works}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 161 ЖК РФ и Правил № 491 прошу выполнить текущий ремонт. Фото прилагаю.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-fssp-exempt-protect",
    name: "Заявление о снятии взыскания с детских пособий и соцвыплат",
    category: "family",
    kind: "statement",
    formKind: "free",
    statementGroup: "fssp",
    actSource: "ФЗ № 229-ФЗ (ст. 101), ГПК РФ (ст. 446)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Списали пособия, алименты, маткапитал? Это незаконно (ст. 101): несите справку о назначении выплат — пристав обязан вернуть за дни. Коды «2» в платёжках — ваша защита.",
    suggestedDocs: ["stmt-fssp-excess-return", "stmt-fssp-minimum"],
    submitTo: {
      where: "судебному приставу + в банк (справку о назначении счёта)",
      term: "возврат — немедленно после подтверждения назначения выплат",
      fee: "бесплатно",
      attach: "справка СФР/соцзащиты о выплатах, выписка с кодом «2»",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванова Мария Ивановна",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Судебному приставу-исполнителю ОСП по г. Москве",
      recipient_address: "г. Москва",
      case_no: "№ 54321/26/77000-ИП",
      what: "20.09.2026 списаны детские пособия 17 000 рублей со счёта (справка СФР прилагается)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер производства", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "what", label: "Какие выплаты списаны (справки)", type: "textarea", defaultValue: "", category: "payment", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о снятии взыскания с социальных выплат") +
      `
  <p class="mb-4 text-justify">
    В рамках производства {{case_no}} {{what}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 101 Федерального закона «Об исполнительном производстве» указанные выплаты взысканию не подлежат.
    Прошу вернуть списанные средства и исключить счёт из-под взыскания.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-video",
    name: "Ходатайство о видеоконференц-связи (ВКС) в суде",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 155.1), АПК РФ (ст. 153.1), КАС РФ (ст. 142)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Живёте в другом городе? Участвуйте по видео из ближайшего суда: подайте ходатайство заранее, укажите суд для связи. Отказ — только если нет технической возможности.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-postpone"],
    submitTo: {
      where: "в суд, рассматривающий дело (заранее, до заседания)",
      term: "суд разрешает при назначении заседания",
      fee: "бесплатно",
      attach: "документы о проживании в другом городе (по желанию)",
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
      via: "через районный суд г. Казани (проживаю в Казани, явиться лично не могу)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "via", label: "Через какой суд подключаться (почему)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об участии в заседании по видеосвязи") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} прошу обеспечить моё участие в судебных заседаниях путём использования видеоконференц-связи
    {{via}} (ст. 155.1 ГПК РФ).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-language",
    name: "Ходатайство о переводчике в суде",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 9), КАС РФ (ст. 12)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Не владеете русским? Суд обязан предоставить переводчика бесплатно — достаточно заявить. Отказ — грубое нарушение, основание для отмены решения.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-motion-video"],
    submitTo: {
      where: "в суд, рассматривающий дело (устно или письменно)",
      term: "суд разрешает немедленно; переводчик — за счёт бюджета",
      fee: "бесплатно",
      attach: "не требуется",
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
      lang: "таджикский язык (русским владею недостаточно для участия в процессе)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "lang", label: "Язык и почему нужен переводчик", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о предоставлении переводчика") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} прошу предоставить мне переводчика с {{lang}} (ст. 9 ГПК РФ).
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-recusal",
    name: "Заявление об отводе судьи",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 16–19)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Судья — родственник стороны, уже участвовал в деле или заинтересован? Заявляйте отвод до начала рассмотрения по существу. Мотивируйте фактами, а не эмоциями.",
    suggestedDocs: ["stmt-appeal", "stmt-court-private-complaint"],
    submitTo: {
      where: "в тот же суд (рассматривает тот же судья или председатель)",
      term: "до начала рассмотрения по существу; при поздних основаниях — сразу как узнали",
      fee: "бесплатно",
      attach: "доказательства заинтересованности (родство, участие, высказывания)",
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
      grounds: "судья ранее представлял интересы ответчика как адвокат (подтверждается ордером из другого дела)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "grounds", label: "Основание отвода (факты, доказательства)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об отводе судьи") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} заявляю отвод судье: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 16–19 Гражданского процессуального кодекса Российской Федерации прошу отвод удовлетворить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-postpone-appeal",
    name: "Ходатайство о приостановлении исполнения решения (апелляция)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 326.2)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Подали апелляцию, а приставы уже списывают? Просите апелляцию приостановить исполнение: приложите доказательства несоразмерности и гарантию (депозит, поручительство).",
    suggestedDocs: ["stmt-appeal", "stmt-fssp-delay"],
    submitTo: {
      where: "в апелляционный суд (через первый суд)",
      term: "суд решает быстро; действует до конца апелляции",
      fee: "бесплатно",
      attach: "доказательства ущерба от исполнения, депозит/поручительство (по возможности)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Московский городской суд (через Пресненский районный суд)",
      recipient_address: "г. Москва",
      case_no: "№ 2-1234/2026 (апелляция подана 20.09.2026)",
      harm: "исполнение (продажа квартиры с торгов) сделает поворот исполнения невозможным",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Дело и апелляция", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "harm", label: "Почему исполнение нельзя допустить", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о приостановлении исполнения решения") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}}. {{harm}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 326.2 Гражданского процессуального кодекса Российской Федерации прошу приостановить исполнение
    решения до окончания апелляционного производства.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-restore-term",
    name: "Ходатайство о восстановлении пропущенного срока",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 109–112)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Пропустили срок (апелляция, отмена приказа)? Просите восстановить + совершайте само действие (приложите жалобу). Болезнь, командировка, неполучение почты — уважительно.",
    suggestedDocs: ["stmt-appeal", "stmt-court-order-cancel"],
    submitTo: {
      where: "в суд, где нужно совершить действие",
      term: "вместе с самим действием (жалобой/заявлением)",
      fee: "бесплатно",
      attach: "больничные, командировочные, конверты, справки",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      term: "срок подачи апелляционной жалобы по делу № 2-1234/2026 (решение получил 25.09.2026, лежал в больнице)",
      proof: "выписка из больницы за 01–24.09.2026 прилагается; жалоба прилагается",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "term", label: "Какой срок и по какому делу", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "proof", label: "Уважительность + само действие", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о восстановлении пропущенного процессуального срока") +
      `
  <p class="mb-4 text-justify">
    Пропущен {{term}}.
  </p>
  <p class="mb-4 text-justify">
    {{proof}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 109–112 Гражданского процессуального кодекса Российской Федерации прошу срок восстановить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-housing-common-meeting",
    name: "Требование о проведении общего собрания собственников (ОСС)",
    category: "realty",
    kind: "statement",
    formKind: "free",
    statementGroup: "housing",
    actSource: "ЖК РФ (ст. 44–48)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Хотите сменить УК, шлагбаум, тариф? 10% собственников требуют собрания письменно — УК обязана провести за 45 дней. Игнор — жалуйтесь в ГЖИ.",
    suggestedDocs: ["stmt-housing-quality", "stmt-gzhi-complaint"],
    submitTo: {
      where: "в УК / ТСЖ (подписи 10% собственников)",
      term: "собрание — в течение 45 дней с обращения (ст. 45 ЖК)",
      fee: "бесплатно",
      attach: "подписи собственников, повестка, проекты решений",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович (и ещё 15 собственников, подписи прилагаются)",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Директору ООО «УК Жилсервис»",
      recipient_address: "г. Москва",
      agenda: "смена управляющей компании и отчёт о расходах за 2025 год",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "agenda", label: "Повестка собрания", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Требование<br>о проведении общего собрания собственников") +
      `
  <p class="mb-4 text-justify">
    Мы, собственники помещений (более 10% голосов, подписи прилагаются), требуем провести общее собрание
    с повесткой: {{agenda}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 45 Жилищного кодекса Российской Федерации прошу провести собрание в течение 45 дней.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-claim-secure-evidence",
    name: "Заявление об обеспечении доказательств (осмотр до суда)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 64–66)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Доказательство исчезнет до суда (зальют, снесут, удалят)? Просите суд зафиксировать заранее: осмотр, экспертиза, запрос. Подаётся до иска или в процессе.",
    suggestedDocs: ["stmt-court-evidence", "stmt-housing-flood"],
    submitTo: {
      where: "в суд (до иска — по месту нахождения доказательства)",
      term: "суд решает быстро; определение исполняется немедленно",
      fee: "госпошлина 300 ₽ (до иска)",
      attach: "описание доказательства и риска утраты",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      evidence: "следы залива в квартире (ответчик начал ремонт и скроет следы); прошу осмотреть и зафиксировать",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "evidence", label: "Доказательство и риск утраты", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об обеспечении доказательств") +
      `
  <p class="mb-4 text-justify">
    {{evidence}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 64–66 Гражданского процессуального кодекса Российской Федерации прошу принять меры
    по обеспечению доказательств.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-third-party",
    name: "Ходатайство о привлечении третьего лица / соответчика",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 40–43)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение затронет ещё кого-то (сособственника, страховую, работодателя)? Просите привлечь третьим лицом или соответчиком — иначе потом судиться заново.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-evidence"],
    submitTo: {
      where: "в суд, рассматривающий дело",
      term: "до вынесения решения (лучше — на ранней стадии)",
      fee: "бесплатно",
      attach: "документы о связи лица со спором",
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
      person: "страховую компанию (ответственность виновника застрахована, полис прилагается) — третьим лицом",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "person", label: "Кого привлечь и почему", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о привлечении к участию в деле") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} прошу привлечь {{person}} (ст. 40–43 ГПК РФ): решение повлияет на его права и обязанности.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-doc-copies",
    name: "Заявление о выдаче копий материалов дела для ознакомления",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 35)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Знакомьтесь с делом свободно: фотографируйте всё, копии — за свой счёт. Отказ — обжалуйте председателю суда. Доверенность представителя приложите.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-docs"],
    submitTo: {
      where: "в канцелярию / архив суда",
      term: "ознакомление — в день обращения (по записи суда)",
      fee: "бесплатно (копии — за свой счёт)",
      attach: "паспорт; представителю — доверенность",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю Пресненского районного суда г. Москвы",
      recipient_address: "г. Москва",
      case_no: "№ 2-1234/2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об ознакомлении с материалами дела") +
      `
  <p class="mb-4 text-justify">
    На основании ст. 35 Гражданского процессуального кодекса Российской Федерации прошу предоставить мне для
    ознакомления материалы дела {{case_no}} с правом фотографирования и снятия копий.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-correct-error",
    name: "Заявление об исправлении описки в решении суда",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 200)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Опечатка в ФИО, сумме, адресе мешает исполнению? Суд исправляет определением без нового разбирательства. Суть решения менять нельзя — только описку.",
    suggestedDocs: ["stmt-court-docs", "stmt-fssp-execution"],
    submitTo: {
      where: "в суд, вынесший решение",
      term: "суд рассматривает в заседании (могут без вызова); определение — за дни",
      fee: "бесплатно",
      attach: "копия решения с опиской, правильные данные",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      error: "в решении по делу № 2-1234/2026 сумма указана 25 000 вместо 250 000 рублей (описка, подтверждается протоколом и иском)",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "error", label: "Описка (дело, что неверно, как правильно)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>об исправлении описки") +
      `
  <p class="mb-4 text-justify">
    {{error}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 200 Гражданского процессуального кодекса Российской Федерации прошу исправить описку.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-additional-decision",
    name: "Заявление о дополнительном решении суда",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 201)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Суд забыл взыскать пошлину, расходы или решить часть требований? Просите дополнительное решение — до вступления в силу или в апелляции.",
    suggestedDocs: ["stmt-court-costs", "stmt-court-motion-correct-error"],
    submitTo: {
      where: "в суд, вынесший решение (до вступления в силу)",
      term: "суд разрешает в заседании",
      fee: "бесплатно",
      attach: "копия решения, расчёты забытых требований",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      missed: "решением по делу № 2-1234/2026 иск удовлетворён, но не разрешён вопрос о возврате госпошлины 8 400 рублей",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "missed", label: "Что суд не разрешил (пошлина, расходы, требование)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о принятии дополнительного решения") +
      `
  <p class="mb-4 text-justify">
    {{missed}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 201 Гражданского процессуального кодекса Российской Федерации прошу принять дополнительное решение.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-explain",
    name: "Заявление о разъяснении решения суда",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 202)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение неясно приставам или сторонам (порядок, сроки, доли)? Просите разъяснить — изменить суть суд не вправе, только уточнить формулировки.",
    suggestedDocs: ["stmt-court-motion-correct-error", "stmt-fssp-execution"],
    submitTo: {
      where: "в суд, вынесший решение (пока не исполнено)",
      term: "суд разрешает в заседании",
      fee: "бесплатно",
      attach: "копия решения, описание неясности",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      unclear: "в решении по делу № 2-1234/2026 неясен порядок выплаты (единовременно или частями) — пристав приостановил исполнение",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "unclear", label: "Что неясно в решении", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о разъяснении решения суда") +
      `
  <p class="mb-4 text-justify">
    {{unclear}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 202 Гражданского процессуального кодекса Российской Федерации прошу разъяснить решение,
    не изменяя его содержания.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-turnaround",
    name: "Заявление о повороте исполнения решения",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 443–445)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Решение исполнили, а апелляция/кассация его отменила? Требуйте вернуть всё обратно (деньги, имущество). Подаётся в первый суд.",
    suggestedDocs: ["stmt-appeal", "stmt-court-cassation"],
    submitTo: {
      where: "в суд первой инстанции",
      term: "суд разрешает в заседании после отмены",
      fee: "бесплатно",
      attach: "отменённое решение, доказательства исполнения, акт апелляции",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "В Пресненский районный суд г. Москвы",
      recipient_address: "г. Москва",
      fact: "по отменённому решению по делу № 2-1234/2026 с меня взыскано 250 000 рублей (платёжка прилагается), апелляция решение отменила 20.09.2026",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "fact", label: "Что исполнено и чем отмена подтверждена", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Заявление<br>о повороте исполнения решения суда") +
      `
  <p class="mb-4 text-justify">
    {{fact}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 443–445 Гражданского процессуального кодекса Российской Федерации прошу произвести поворот
    исполнения и вернуть взысканное.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-leave-no-consider",
    name: "Ходатайство об оставлении иска без рассмотрения",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 222–223)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Истец дважды не явился, досудебный порядок не соблюдён, дело уже в другом суде? Просите оставить без рассмотрения — после устранения препятствий можно подать заново.",
    suggestedDocs: ["lawsuit-statement", "stmt-court-postpone"],
    submitTo: {
      where: "в суд, рассматривающий дело",
      term: "суд разрешает в заседании",
      fee: "бесплатно",
      attach: "доказательства основания (неявки, другой процесс)",
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
      grounds: "истец дважды не явился в заседания 10 и 20.09.2026 без уважительных причин, рассмотреть по существу не просил",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "grounds", label: "Основание (неявки, досудебка, другой суд)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>об оставлении заявления без рассмотрения") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 222 Гражданского процессуального кодекса Российской Федерации прошу оставить заявление
    без рассмотрения.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-terminate",
    name: "Ходатайство о прекращении производства по делу",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 220–221)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Мировое, отказ от иска, смерть стороны без правопреемства, уже есть решение по тому же спору? Просите прекратить — повторно с тем же иском уже не обратиться.",
    suggestedDocs: ["stmt-court-settlement", "stmt-court-motion-leave-no-consider"],
    submitTo: {
      where: "в суд, рассматривающий дело",
      term: "суд разрешает в заседании",
      fee: "бесплатно",
      attach: "отказ от иска / мировое / решение по тождественному спору",
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
      grounds: "ответчик добровольно выплатил 250 000 рублей 20.09.2026 (расписка прилагается), от иска отказываюсь",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "grounds", label: "Основание (отказ, мировое, оплата)", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Ходатайство<br>о прекращении производства по делу") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    Последствия отказа от иска и прекращения производства (ст. 221 ГПК) мне известны. На основании ст. 220 ГПК
    прошу производство прекратить.
  </p>` +
      stmtSign(),
  },
  {
    id: "stmt-court-motion-audio-protocol",
    name: "Заявление о замечаниях на протокол / выдаче аудиозаписи заседания",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ГПК РФ (ст. 231–232)",
    lastUpdated: "Сентябрь 2026",
    description:
      "Протокол исказил показания? Замечания — за 5 дней с подписания. Аудиозапись заседания выдадут по заявлению — сверьте с протоколом перед апелляцией.",
    suggestedDocs: ["stmt-court-motion-doc-copies", "stmt-appeal"],
    submitTo: {
      where: "в суд, рассмотревший дело (председателю/судье)",
      term: "замечания — 5 дней с подписания протокола; аудио — по готовности",
      fee: "бесплатно",
      attach: "сверка с аудиозаписью (по возможности)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "Иванов Иван Иванович",
      sender_address: "г. Москва, ул. Ленина, д. 1, кв. 5",
      sender_phone: "+7 (900) 123-45-67",
      recipient_name: "Председателю Пресненского районного суда г. Москвы",
      recipient_address: "г. Москва",
      case_no: "№ 2-1234/2026 (заседание 20.09.2026)",
      errors: "в протоколе отсутствуют показания свидетеля Сидорова о передаче денег, хотя в аудиозаписи они есть",
    },
    fields: [
      ...stmtBaseFields(),
      { id: "case_no", label: "Дело и заседание", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "errors", label: "Неточности протокола / просьба выдать аудио", type: "textarea", defaultValue: "", category: "court", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      stmtHead("Замечания<br>на протокол судебного заседания") +
      `
  <p class="mb-4 text-justify">
    По делу {{case_no}} {{errors}}.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 231 Гражданского процессуального кодекса Российской Федерации прошу замечания удостоверить
    и приобщить к делу, а также выдать копию аудиозаписи заседания.
  </p>` +
      stmtSign(),
  },
];
