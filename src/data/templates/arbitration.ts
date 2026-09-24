import type { LegalTemplate } from "../types";

/**
 * Арбитражный кластер (АПК РФ, ФЗ-127 «О несостоятельности (банкротстве)»).
 * Все — заявления/процессуальные документы в арбитражный суд: свободная форма
 * (formKind: "free"), kind: "statement", statementGroup: "courts" +
 * submitTo («Куда подавать») + sampleValues (режим «образец заполнения»).
 * Имена уникальны по каталогу и не дублируют процессуальные документы ГПК.
 */

function arbHead(title: string): string {
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

function arbSign(): string {
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

function arbBaseFields(): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "sender_name", label: "Заявитель (наименование/ФИО)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_address", label: "Адрес заявителя", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_phone", label: "Телефон заявителя", type: "text", defaultValue: "", category: "sender" },
    { id: "recipient_name", label: "Арбитражный суд (кому)", type: "text", defaultValue: "", category: "court", validation: { required: true } },
    { id: "recipient_address", label: "Адрес суда", type: "text", defaultValue: "", category: "court" },
  ];
}

export const TEMPLATES_ARBITRATION: LegalTemplate[] = [
  {
    id: "arbitration-response",
    name: "Отзыв на исковое заявление (арбитражный суд)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 131 АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Отзыв ответчика на иск в арбитражном суде: возражения по существу требований, ссылки на закон и доказательства, просьба отказать истцу. Обязанность направить отзыв — по ст. 131 АПК РФ.",
    suggestedDocs: ["arbitration-counterclaim", "claim-generic"],
    submitTo: {
      where: "в арбитражный суд, рассматривающий дело (через «Мой арбитр» или канцелярию)",
      term: "в срок, установленный судом в определении о принятии иска (обычно до заседания)",
      fee: "бесплатно",
      attach: "доказательства возражений; копию отзыва и приложений направить истцу и иным лицам (ст. 131 АПК)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-12345/2026",
      claimant_name: "ООО «Ромашка»",
      claim_subject: "взыскании 500 000 рублей по договору поставки № 12 от 10.02.2026",
      response_essence: "товар поставлен в полном объёме и принят истцом без замечаний, что подтверждается универсальными передаточными документами",
      evidence: "",
      request: "",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "claimant_name", label: "Истец", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "claim_subject", label: "Предмет иска", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "response_essence", label: "Существо возражений", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "evidence", label: "Доказательства в обоснование", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
      { id: "request", label: "Дополнительно прошу (если есть)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      arbHead("Отзыв<br>на исковое заявление") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится дело {{case_no}} по иску {{claimant_name}} к {{sender_name}} о {{claim_subject}}.
  </p>
  <p class="mb-4 text-justify">
    Возражаю против удовлетворения заявленных требований: {{response_essence}}.
  </p>
  {{#evidence}}<p class="mb-4 text-justify">
    В подтверждение изложенного прилагаю: {{evidence}}.
  </p>{{/evidence}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 131 Арбитражного процессуального кодекса Российской Федерации, прошу
    отказать {{claimant_name}} в удовлетворении исковых требований в полном объёме{{#request}}; {{request}}{{/request}}.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-counterclaim",
    name: "Встречный иск в арбитражный суд",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 132 АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Встречный иск ответчика для совместного рассмотрения с первоначальным иском в арбитражном суде: цена иска, основания требований, просьба принять встречный иск. Условия — ст. 132 АПК РФ.",
    suggestedDocs: ["arbitration-response", "lawsuit-statement"],
    submitTo: {
      where: "в арбитражный суд, рассматривающий первоначальный иск (через «Мой арбитр»)",
      term: "до принятия судебного акта, которым заканчивается рассмотрение дела по существу",
      fee: "государственная пошлина по ст. 333.21 НК РФ (от цены встречного иска)",
      attach: "документы в обоснование встречных требований; копии — истцу и иным лицам",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-12345/2026",
      original_claim: "иск ООО «Ромашка» о взыскании 500 000 рублей по договору поставки",
      opponent_name: "ООО «Ромашка»",
      claim_subject: "взыскании убытков, причинённых ненадлежащим качеством поставленного товара",
      sum: "180000",
      basis: "поставленный товар не соответствует согласованной спецификации, что подтверждается актом приёмки и заключением специалиста",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер первоначального дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "original_claim", label: "Первоначальный иск (суть)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "opponent_name", label: "Истец по первоначальному иску", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "claim_subject", label: "Предмет встречных требований", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sum", label: "Цена встречного иска (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "basis", label: "Основания требований", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      arbHead("Встречное исковое заявление") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится дело {{case_no}} по первоначальному иску {{original_claim}}.
  </p>
  <p class="mb-4 text-justify">
    Предъявляю к {{opponent_name}} встречные требования о {{claim_subject}} на сумму
    <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    Основания требований: {{basis}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 132 Арбитражного процессуального кодекса Российской Федерации, прошу
    принять встречное исковое заявление для совместного рассмотрения с первоначальным иском и взыскать с {{opponent_name}}
    <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-interim-measures",
    name: "Заявление об обеспечении иска (арбитражный суд)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "гл. 8 (ст. 90–99) АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Просьба принять обеспечительные меры в арбитражном процессе: арест денег или имущества ответчика, запрет распоряжаться им. Суд рассматривает заявление в день поступления без вызова сторон (ст. 93 АПК РФ).",
    suggestedDocs: ["arbitration-counterclaim", "claim-generic"],
    submitTo: {
      where: "в арбитражный суд вместе с иском или в ходе рассмотрения дела",
      term: "судья рассматривает заявление в день поступления без извещения сторон (ст. 93 АПК РФ)",
      fee: "государственная пошлина по ст. 333.21 НК РФ",
      attach: "доказательства необходимости мер и соразмерности; встречное обеспечение (если требуется)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-12345/2026",
      respondent_name: "ООО «Ромашка»",
      sum: "500000",
      measure: "наложить арест на денежные средства ООО «Ромашка», находящиеся на банковских счетах, в пределах 500 000 рублей",
      grounds: "ответчик активно выводит активы и реализует имущество, что подтверждается сведениями из открытых источников и выписками по расчётному счёту",
      counter_guarantee: "",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "respondent_name", label: "Ответчик", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "sum", label: "Цена иска / размер обеспечения (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "measure", label: "Обеспечительная мера, о которой просите", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "grounds", label: "Обоснование необходимости мер", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "counter_guarantee", label: "Встречное обеспечение (если предлагаете)", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      arbHead("Заявление<br>об обеспечении иска") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится дело {{case_no}}, цена иска — <strong>{{sum}} ({{sum_words}})</strong> рублей,
    ответчик — {{respondent_name}}.
  </p>
  <p class="mb-4 text-justify">
    Непринятие обеспечительных мер может затруднить или сделать невозможным исполнение судебного акта: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 90, 91 АПК РФ, прошу принять обеспечительные меры: {{measure}}.
  </p>
  {{#counter_guarantee}}<p class="mb-4 text-justify">
    В качестве встречного обеспечения предлагаю: {{counter_guarantee}}.
  </p>{{/counter_guarantee}}` +
      arbSign(),
  },
  {
    id: "arbitration-appeal",
    name: "Апелляционная жалоба в арбитражный суд",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "гл. 34 (ст. 257–272) АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Апелляционная жалоба на не вступившее в силу решение арбитражного суда: обжалуемое решение, нарушения норм материального и процессуального права, просьба отменить и принять новый акт. Срок — месяц (ст. 259 АПК РФ).",
    suggestedDocs: ["arbitration-cassation", "arbitration-response"],
    submitTo: {
      where: "через арбитражный суд, принявший решение (либо напрямую в апелляционный суд)",
      term: "месяц со дня принятия решения в полном объёме (ст. 259 АПК РФ); пропущенный срок — восстановим",
      fee: "государственная пошлина по ст. 333.21 НК РФ",
      attach: "копия обжалуемого решения, документы об уплате пошлины, копии жалобы для лиц, участвующих в деле",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Девятый арбитражный апелляционный суд",
      recipient_address: "г. Москва, ул. Верейская, д. 29",
      appeal_court: "Девятый арбитражный апелляционный суд",
      first_court: "Арбитражный суд города Москвы",
      case_no: "№ А40-12345/2026",
      judgment: "решение от 10.09.2026 по делу № А40-12345/2026",
      grounds: "суд не исследовал доказательства поставки товара надлежащего качества и не применил условия договора о приёмке, чем нарушил ст. 71, 170 АПК РФ",
      requests: "",
    },
    fields: [
      ...arbBaseFields(),
      { id: "appeal_court", label: "Апелляционный суд", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "first_court", label: "Суд первой инстанции", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "judgment", label: "Обжалуемое решение (дата, по какому делу)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Основания для отмены", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "requests", label: "Дополнительно прошу (если есть)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      arbHead("Апелляционная жалоба") +
      `
  <p class="mb-4 text-justify">
    Суд первой инстанции — {{first_court}} — принял судебный акт: {{judgment}} (дело {{case_no}}).
  </p>
  <p class="mb-4 text-justify">
    Считаю решение незаконным и необоснованным: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 257–260 Арбитражного процессуального кодекса Российской Федерации,
    прошу отменить {{judgment}} и принять по делу новый судебный акт{{#requests}}; {{requests}}{{/requests}}.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-cassation",
    name: "Кассационная жалоба в арбитражный суд",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "гл. 35 (ст. 273–291) АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Кассационная жалоба в арбитражный суд округа на вступившие в силу решение и апелляционное постановление: проверяет только законность, факты заново не устанавливает. Срок — 2 месяца (ст. 276 АПК РФ).",
    suggestedDocs: ["arbitration-appeal", "arbitration-response"],
    submitTo: {
      where: "в арбитражный суд кассационной инстанции (через суд, рассмотревший дело в первой инстанции)",
      term: "2 месяца со дня вступления в силу последнего судебного акта (ст. 276 АПК РФ)",
      fee: "государственная пошлина по ст. 333.21 НК РФ",
      attach: "копии обжалуемых актов, документ об уплате пошлины, копии жалобы участникам дела",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд Московского округа",
      recipient_address: "г. Москва, ул. Академика Королёва, д. 12",
      cassation_court: "Арбитражный суд Московского округа",
      case_no: "№ А40-12345/2026",
      acts: "решение от 10.09.2026 и постановление апелляции от 20.10.2026 по делу № А40-12345/2026",
      grounds: "апелляционный суд неправильно применил нормы материального права о качестве товара и не учёл условия договора о порядке приёмки (ст. 288 АПК РФ)",
      requests: "",
    },
    fields: [
      ...arbBaseFields(),
      { id: "cassation_court", label: "Кассационный суд", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "acts", label: "Обжалуемые судебные акты", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "grounds", label: "Основания для отмены (нарушения закона)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "requests", label: "Дополнительно прошу (если есть)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      arbHead("Кассационная жалоба") +
      `
  <p class="mb-4 text-justify">
    Обжалую судебные акты по делу {{case_no}}: {{acts}}.
  </p>
  <p class="mb-4 text-justify">
    Основания для отмены: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 273–277 АПК РФ, прошу отменить {{acts}} и направить дело на новое
    рассмотрение{{#requests}}; {{requests}}{{/requests}}.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-creditor-register",
    name: "Заявление о включении в реестр требований кредиторов",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 71, 100, 142 ФЗ № 127-ФЗ «О несостоятельности (банкротстве)»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление кредитора о включении долга в реестр требований кредиторов должника в деле о банкротстве: размер и основание долга, просьба включить в соответствующую очередь. Подаётся в арбитражный суд, рассматривающий дело о банкротстве.",
    suggestedDocs: ["arbitration-bankruptcy-debtor", "claim-letter"],
    submitTo: {
      where: "в арбитражный суд, рассматривающий дело о банкротстве (через «Мой арбитр»)",
      term: "в ходе наблюдения — 30 дней со дня публикации сведений; далее — до закрытия реестра",
      fee: "государственная пошлина не уплачивается (расходы возмещаются за счёт должника)",
      attach: "документы, подтверждающие долг (договор, накладные, решение суда), расчёт задолженности",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-99999/2026",
      debtor_name: "ООО «Ромашка»",
      debt_sum: "750000",
      debt_basis: "задолженность по договору поставки № 12 от 10.02.2026, подтверждённая решением арбитражного суда от 10.09.2026",
      claim_priority: "третьей очереди",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела о банкротстве", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "debtor_name", label: "Должник", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "debt_sum", label: "Размер требования (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "debt_basis", label: "Основание и подтверждение долга", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "claim_priority", label: "Очередь удовлетворения", type: "text", defaultValue: "третьей очереди", category: "contract" },
    ],
    previewTemplate:
      arbHead("Заявление<br>о включении в реестр<br>требований кредиторов") +
      `
  <p class="mb-4 text-justify">
    Решением арбитражного суда в отношении {{debtor_name}} введена процедура банкротства (дело {{case_no}}).
  </p>
  <p class="mb-4 text-justify">
    {{debtor_name}} имеет передо мной задолженность в размере <strong>{{debt_sum}} ({{debt_sum_words}})</strong> рублей.
    Основание: {{debt_basis}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 71, 100, 142 Федерального закона от 26.10.2002 № 127-ФЗ
    «О несостоятельности (банкротстве)», прошу включить указанное требование в реестр требований кредиторов
    {{debtor_name}} в составе {{claim_priority}}.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-bankruptcy-debtor",
    name: "Заявление кредитора о признании должника банкротом",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 7, 39–40 ФЗ № 127-ФЗ «О несостоятельности (банкротстве)»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление кредитора (юрлица или ИП) в арбитражный суд о признании должника банкротом: подтверждённый долг свыше 300 000 рублей и просрочка более 3 месяцев. Суд проверяет обоснованность заявления (ст. 42, 48 ФЗ-127).",
    suggestedDocs: ["arbitration-creditor-register", "claim-letter"],
    submitTo: {
      where: "в арбитражный суд по месту нахождения (регистрации) должника",
      term: "обоснованность заявления проверяется в заседании в течение 15 дней со дня принятия (ст. 42 ФЗ-127)",
      fee: "государственная пошлина 6 000 рублей (ст. 333.21 НК РФ)",
      attach: "вступившее в силу решение суда о взыскании, исполнительный лист, доказательства долга и просрочки свыше 3 месяцев",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      debtor_name: "ООО «Ромашка»",
      debtor_inn: "7701234567",
      debtor_address: "г. Москва, ул. Полевая, д. 3",
      debt_sum: "750000",
      debt_basis: "решение Арбитражного суда города Москвы от 10.09.2026 по делу № А40-12345/2026",
      overdue: "более трёх месяцев",
      executive_doc: "исполнительный лист ФС № 012345678 от 15.09.2026",
    },
    fields: [
      ...arbBaseFields(),
      { id: "debtor_name", label: "Должник (наименование)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "debtor_inn", label: "ИНН должника", type: "text", defaultValue: "", category: "recipient" },
      { id: "debtor_address", label: "Адрес должника", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "debt_sum", label: "Размер задолженности (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "debt_basis", label: "Основание долга (решение суда)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "overdue", label: "Период просрочки", type: "text", defaultValue: "более трёх месяцев", category: "contract" },
      { id: "executive_doc", label: "Исполнительный документ", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      arbHead("Заявление<br>о признании должника банкротом") +
      `
  <p class="mb-4 text-justify">
    {{debtor_name}} (ИНН {{debtor_inn}}, адрес: {{debtor_address}}) имеет передо мной задолженность в размере
    <strong>{{debt_sum}} ({{debt_sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    Основание задолженности: {{debt_basis}}. Просрочка составляет {{overdue}}, что превышает порог, установленный
    п. 2 ст. 33 Федерального закона от 26.10.2002 № 127-ФЗ «О несостоятельности (банкротстве)».
  </p>
  {{#executive_doc}}<p class="mb-4 text-justify">
    Задолженность подтверждена исполнительным документом: {{executive_doc}}.
  </p>{{/executive_doc}}
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 7, 39, 40 Федерального закона от 26.10.2002 № 127-ФЗ, прошу признать
    {{debtor_name}} несостоятельным (банкротом) и ввести процедуру наблюдения.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-challenge-transactions",
    name: "Заявление об оспаривании сделки должника (банкротство)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 61.2, 61.3, 61.8 ФЗ № 127-ФЗ «О несостоятельности (банкротстве)»",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление об оспаривании сделки должника в деле о банкротстве: подозрительная сделка (неравноценное встречное предоставление) или сделка с предпочтением. Подаётся арбитражным управляющим или кредитором в арбитражный суд.",
    suggestedDocs: ["arbitration-creditor-register", "arbitration-bankruptcy-debtor"],
    submitTo: {
      where: "в арбитражный суд в рамках дела о банкротстве должника",
      term: "подозрительные сделки — 1 год, сделки с предпочтением — 6 месяцев до принятия заявления о банкротстве (ст. 61.2, 61.3 ФЗ-127)",
      fee: "государственная пошлина 6 000 рублей (ст. 333.21 НК РФ)",
      attach: "договор (копия), доказательства неравноценности или предпочтения, иные документы по сделке",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-99999/2026",
      debtor_name: "ООО «Ромашка»",
      transaction: "договор купли-продажи нежилого помещения от 01.06.2026, заключённый между ООО «Ромашка» и ООО «Закат»",
      sum: "3000000",
      grounds: "имущество отчуждено по цене существенно ниже рыночной (рыночная стоимость — около 6 000 000 рублей), что указывает на неравноценное встречное предоставление",
      restore: "взыскать с ООО «Закат» действительную стоимость имущества",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела о банкротстве", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "debtor_name", label: "Должник", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "transaction", label: "Оспариваемая сделка (стороны, дата, предмет)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "sum", label: "Цена / стоимость по сделке (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "grounds", label: "Основания оспаривания", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "restore", label: "Последствия, о применении которых прошу", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      arbHead("Заявление<br>об оспаривании сделки должника") +
      `
  <p class="mb-4 text-justify">
    В рамках дела о банкротстве {{debtor_name}} ({{case_no}}) оспаривается сделка: {{transaction}}.
    Цена сделки — <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    Основания оспаривания: {{grounds}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 61.2, 61.3, 61.8 Федерального закона от 26.10.2002 № 127-ФЗ,
    прошу признать сделку недействительной{{#restore}} и применить последствия её недействительности: {{restore}}{{/restore}}.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-evidence-request",
    name: "Ходатайство об истребовании доказательств (арбитражный суд)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 66 АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Ходатайство в арбитражном суде об истребовании доказательств у лица, у которого они находятся: какие документы нужны, у кого, почему невозможно получить их самостоятельно. Суд выдаёт запрос (ст. 66 АПК РФ).",
    suggestedDocs: ["arbitration-response", "arbitration-appeal"],
    submitTo: {
      where: "в арбитражный суд, рассматривающий дело (до окончания рассмотрения дела по существу)",
      term: "рассматривается в заседании, по результатам выдаётся запрос либо выносится определение",
      fee: "бесплатно",
      attach: "доказательства невозможности самостоятельного получения; реквизиты истребуемого документа и место его нахождения",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-12345/2026",
      evidence: "акт приёмки товара по договору поставки № 12 от 10.02.2026 и товарно-транспортные накладные",
      authority: "ООО «Ромашка» (г. Москва, ул. Полевая, д. 3)",
      impossibility: "ответчик уклоняется от предоставления документов, самостоятельный запрос оставлен без ответа",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "evidence", label: "Какие доказательства истребовать", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "authority", label: "У кого находятся доказательства", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "impossibility", label: "Почему невозможно получить самостоятельно", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    ],
    previewTemplate:
      arbHead("Ходатайство<br>об истребовании доказательств") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится дело {{case_no}}.
  </p>
  <p class="mb-4 text-justify">
    Для правильного рассмотрения дела необходимы доказательства: {{evidence}}, находящиеся у {{authority}}.
    Самостоятельно получить их невозможно: {{impossibility}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 66 Арбитражного процессуального кодекса Российской Федерации, прошу
    истребовать у {{authority}} указанные доказательства и обязать представить их в суд.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-postpone-hearing",
    name: "Ходатайство об отложении заседания (арбитражный суд)",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "ст. 158 АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Ходатайство об отложении судебного разбирательства в арбитражном суде: уважительная причина (болезнь, командировка, отпуск представителя) и просьба назначить новую дату. Подаётся до заседания (ст. 158 АПК РФ).",
    suggestedDocs: ["arbitration-response", "arbitration-evidence-request"],
    submitTo: {
      where: "в арбитражный суд, рассматривающий дело",
      term: "подать до даты судебного заседания; суд разрешает ходатайство в заседании",
      fee: "бесплатно",
      attach: "документы, подтверждающие уважительную причину (листок нетрудоспособности, приказ о командировке)",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      case_no: "№ А40-12345/2026",
      hearing_date: "2026-10-05",
      reason: "представитель заявителя находится на больничном, что подтверждается листком нетрудоспособности",
    },
    fields: [
      ...arbBaseFields(),
      { id: "case_no", label: "Номер дела", type: "text", defaultValue: "", category: "court", validation: { required: true } },
      { id: "hearing_date", label: "Дата заседания", type: "date", defaultValue: "", category: "court", validation: { required: true } },
      { id: "reason", label: "Уважительная причина", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
    ],
    previewTemplate:
      arbHead("Ходатайство<br>об отложении заседания") +
      `
  <p class="mb-4 text-justify">
    В производстве суда находится дело {{case_no}}, судебное заседание назначено на «{{hearing_date}}».
  </p>
  <p class="mb-4 text-justify">
    Явиться в заседание не имею возможности по уважительной причине: {{reason}}.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 158 Арбитражного процессуального кодекса Российской Федерации, прошу
    отложить судебное разбирательство и назначить иную дату судебного заседания, о которой уведомить меня заблаговременно.
  </p>` +
      arbSign(),
  },
  {
    id: "arbitration-enforcement-award",
    name: "Заявление о выдаче исполнительного листа на решение третейского суда",
    category: "legal",
    kind: "statement",
    formKind: "free",
    statementGroup: "courts",
    actSource: "гл. 30 (ст. 236–240) АПК РФ",
    lastUpdated: "Сентябрь 2026",
    description:
      "Заявление в арбитражный суд о выдаче исполнительного листа на принудительное исполнение решения третейского суда: состав суда, решение, срок добровольного исполнения. Срок обращения — 3 месяца (ст. 238 АПК РФ).",
    suggestedDocs: ["arbitration-response", "claim-generic"],
    submitTo: {
      where: "в арбитражный суд по месту нахождения (жительства) должника либо месту нахождения его имущества",
      term: "3 месяца со дня истечения срока добровольного исполнения решения третейского суда (ст. 238 АПК РФ)",
      fee: "государственная пошлина 2 250 рублей (ст. 333.21 НК РФ)",
      attach: "решение третейского суда (оригинал) и его заверенная копия, доказательства уклонения должника от исполнения",
    },
    sampleValues: {
      city: "Москва",
      date: "2026-09-24",
      sender_name: "ООО «Василёк»",
      sender_address: "г. Москва, ул. Складская, д. 7, офис 12",
      sender_phone: "+7 (495) 000-00-00",
      recipient_name: "В Арбитражный суд города Москвы",
      recipient_address: "г. Москва, ул. Большая Тульская, д. 17",
      debtor_name: "ООО «Ромашка»",
      award: "решение третейского суда при ТПП РФ от 01.08.2026 по делу № ТС-123/2026",
      debt_sum: "500000",
      voluntary_term: "10.08.2026",
    },
    fields: [
      ...arbBaseFields(),
      { id: "debtor_name", label: "Должник", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "award", label: "Решение третейского суда (кем, когда, № дела)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "debt_sum", label: "Сумма, подлежащая взысканию (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "voluntary_term", label: "Дата истечения срока добровольного исполнения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      arbHead("Заявление<br>о выдаче исполнительного листа<br>на решение третейского суда") +
      `
  <p class="mb-4 text-justify">
    Третейским судом принято {{award}} о взыскании с {{debtor_name}} в мою пользу
    <strong>{{debt_sum}} ({{debt_sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    Срок добровольного исполнения решения истёк {{voluntary_term}}, однако {{debtor_name}} решение добровольно не исполнил.
  </p>
  <p class="mb-4 text-justify">
    На основании изложенного, руководствуясь ст. 236–238 Арбитражного процессуального кодекса Российской Федерации, прошу
    выдать исполнительный лист на принудительное исполнение {{award}}.
  </p>` +
      arbSign(),
  },
];