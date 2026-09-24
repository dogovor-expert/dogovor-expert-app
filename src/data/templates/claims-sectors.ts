import type { LegalTemplate, TemplateField } from "../types";

function sectorHead(): string {
  return `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>{{recipient_name}}</p>
    <p>{{recipient_address}}</p>
    <p class="mt-2">от {{sender_name}}</p>
    <p>{{sender_address}}</p>
    <p class="mt-2">тел.: {{sender_phone}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Претензия (досудебное требование)</div>`;
}

function sectorFields(extra: TemplateField[] = []): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "sender_name", label: "Заявитель (ФИО/название)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_address", label: "Адрес заявителя", type: "text", defaultValue: "", category: "sender" },
    { id: "sender_phone", label: "Телефон", type: "text", defaultValue: "", category: "sender" },
    { id: "recipient_name", label: "Адресат (ФИО/название)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
    { id: "recipient_address", label: "Адрес адресата", type: "text", defaultValue: "", category: "recipient" },
    { id: "contract_doc", label: "Договор/документ-основание (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "violation", label: "Нарушение (обстоятельства)", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    { id: "sum", label: "Сумма требования (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
    { id: "deadline_days", label: "Срок для исполнения (дней)", type: "number", defaultValue: "10", category: "contract" },
    ...extra,
  ];
}

function sectorCommon(): string {
  return `
  <p class="mb-4 text-justify">
    В связи с изложенным, руководствуясь ст. 309, 310 ГК РФ, требую исполнить законные требования и уплатить денежные средства в размере
    <strong>{{sum}} ({{sum_words}})</strong> рублей в течение {{deadline_days}} календарных дней с момента получения настоящей претензии.
  </p>`;
}

function sectorSign(): string {
  return `
  <p class="mb-6 text-justify">
    Настоящая претензия направляется в порядке обязательного досудебного урегулирования спора. В случае неисполнения требований в указанный срок
    я буду вынужден(а) обратиться в суд (для споров с участием потребителей — с иском о защите прав потребителей, включая требования о компенсации
    морального вреда и штрафа по п. 6 ст. 13 Закона РФ «О защите прав потребителей»).
  </p>
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

export const TEMPLATES_SECTOR_CLAIMS: LegalTemplate[] = [
  {
    id: "claim-telecom",
    name: "Претензия оператору связи",
    category: "legal",
    actSource: "ст. 44–46 ФЗ «О связи»; Закон РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия оператору связи: ненадлежащее качество услуг (интернет, мобильная связь, ТВ), необоснованное списание средств, требование перерасчёта или возврата.",
    suggestedDocs: ["claim-services", "claim-generic", "refund-claim"],
    printInstruction:
      "Оператор обязан рассмотреть претензию в течение 30 дней (п. 1 ст. 55 ФЗ «О связи»), для претензий потребителей — в сроки Закона о защите прав потребителей. Направить заказным письмом с описью вложения.",
    fields: sectorFields([
      { id: "service_type", label: "Услуга связи", type: "select", defaultValue: "доступ в интернет", category: "contract",
        options: [
          { label: "Доступ в интернет", value: "доступ в интернет" },
          { label: "Мобильная связь", value: "мобильная связь" },
          { label: "Телевидение", value: "телевидение" },
          { label: "Телефонная связь", value: "телефонная связь" },
        ] },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "перерасчёт стоимости услуг", category: "contract",
        options: [
          { label: "Перерасчёт стоимости услуг за период сбоя", value: "перерасчёт стоимости услуг" },
          { label: "Возврат необоснованно списанных средств", value: "возврат списанных средств" },
          { label: "Безвозмездное устранение неисправности", value: "устранение неисправности" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор об оказании услуг связи {{contract_doc}} (услуга: {{service_type}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение условий договора, ст. 44, 46 ФЗ «О связи» и Закона РФ «О защите прав потребителей» услуги оказываются ненадлежащего качества:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Размер причинённых мне убытков (стоимость неоказанных (некачественно оказанных) услуг) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-medical",
    name: "Претензия медицинской организации",
    category: "legal",
    actSource: "ст. 98 ФЗ № 323-ФЗ; ст. 4, 29 Закона РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия платной медицинской организации: некачественная медицинская услуга, требование возврата средств, устранения недостатков, возмещения вреда здоровью.",
    suggestedDocs: ["claim-services", "claim-generic", "refund-claim"],
    printInstruction:
      "Приложить копии договора, чеков об оплате и медицинских документов. Для установления недостатков оказанной услуги возможно проведение экспертизы (п. 5 ст. 29 Закона о защите прав потребителей).",
    fields: sectorFields([
      { id: "service_type", label: "Медицинская услуга", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат уплаченных средств", category: "contract",
        options: [
          { label: "Возврат уплаченных средств", value: "возврат уплаченных средств" },
          { label: "Безвозмездное устранение недостатков", value: "устранение недостатков" },
          { label: "Возмещение вреда здоровью", value: "возмещение вреда здоровью" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор на оказание платных медицинских услуг {{contract_doc}}: {{service_type}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 4, 29 Закона РФ «О защите прав потребителей», Правил предоставления медицинскими организациями платных медицинских услуг
    (постановление Правительства РФ от 11.05.2023 № 736) и ст. 98 ФЗ № 323-ФЗ услуга оказана с недостатками:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Материальные затраты (убытки) составляют <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-education",
    name: "Претензия образовательной организации",
    category: "legal",
    actSource: "ст. 61 ФЗ № 273-ФЗ; ст. 32 Закона РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия образовательной организации: досрочное прекращение договора об обучении, возврат стоимости обучения, перерасчёт за фактически оказанные услуги.",
    suggestedDocs: ["claim-services", "claim-generic", "refund-claim"],
    printInstruction:
      "Обучающийся вправе расторгнуть договор об оказании платных образовательных услуг с зачётом фактически понесённых исполнителем расходов (ст. 61 ФЗ № 273-ФЗ).",
    fields: sectorFields([
      { id: "program", label: "Образовательная программа", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат стоимости обучения", category: "contract",
        options: [
          { label: "Возврат стоимости обучения за неоказанные услуги", value: "возврат стоимости обучения" },
          { label: "Перерасчёт стоимости обучения", value: "перерасчёт стоимости обучения" },
          { label: "Устранение недостатков оказания услуг", value: "устранение недостатков" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор об оказании платных образовательных услуг {{contract_doc}} по программе: {{program}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 61 ФЗ № 273-ФЗ «Об образовании в Российской Федерации» и Закона РФ «О защите прав потребителей» обязательства исполнены ненадлежащим образом:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Стоимость оплаченных, но не оказанных услуг (убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}} (с учётом фактически понесённых исполнителем расходов).
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-insurance-property",
    name: "Претензия страховой по имущественному страхованию",
    category: "legal",
    actSource: "ст. 929, 943 ГК РФ; ст. 10 Закона РФ № 4015-1; Закон РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия страховой компании по имущественному страхованию: отказ или неполная страховая выплата, требование доплаты возмещения и неустойки.",
    suggestedDocs: ["claim-generic", "claim-services", "refund-claim"],
    printInstruction:
      "Приложить полис, документы о наступлении страхового случая и переписку со страховщиком. Срок рассмотрения — 30 дней (для ОСАГО — 20 дней), по потребительским спорам — 10 дней.",
    fields: sectorFields([
      { id: "policy", label: "Полис (номер, дата)", type: "text", defaultValue: "", category: "insurance", validation: { required: true } },
      { id: "event", label: "Страховой случай (дата, обстоятельства)", type: "textarea", defaultValue: "", category: "insurance", rows: 2, validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "выплата страхового возмещения", category: "insurance",
        options: [
          { label: "Выплата страхового возмещения", value: "выплата страхового возмещения" },
          { label: "Доплата страхового возмещения", value: "доплата страхового возмещения" },
          { label: "Выплата возмещения и неустойки", value: "выплата возмещения и неустойки" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами (страховщиком) заключён договор имущественного страхования — полис {{policy}} (в рамках договора {{contract_doc}}).
  </p>
  <p class="mb-4 text-justify">
    Наступил страховой случай: {{event}}. В нарушение ст. 929, 943 ГК РФ и Закона РФ № 4015-1 «Об организации страхового дела в Российской Федерации»
    страховое возмещение не выплачено (выплачено не в полном объёме):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма невыплаченного (недоплаченного) страхового возмещения и убытков составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-bank",
    name: "Претензия банку по навязанным услугам",
    category: "legal",
    actSource: "ст. 16 Закона РФ «О защите прав потребителей»; ст. 819, 859 ГК РФ; ФЗ № 395-1",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия банку: возврат страховой премии по навязанному страхованию при кредите, возврат незаконных комиссий, исключение навязанных условий из договора.",
    suggestedDocs: ["claim-generic", "refund-claim", "claim-services"],
    printInstruction:
      "Приложить кредитный договор, договор страхования, выписки по счёту. Банк России рассматривает обращения граждан через интернет-приёмную Банка России.",
    fields: sectorFields([
      { id: "bank_product", label: "Продукт/договор", type: "text", defaultValue: "кредитный договор", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат страховой премии", category: "payment",
        options: [
          { label: "Возврат уплаченной страховой премии", value: "возврат страховой премии" },
          { label: "Возврат незаконно удержанной комиссии", value: "возврат комиссии" },
          { label: "Исключение навязанного условия из договора", value: "исключение навязанного условия" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён {{bank_product}} {{contract_doc}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 16 Закона РФ «О защите прав потребителей» при заключении договора мне были навязаны дополнительные услуги (условия),
    не являющиеся необходимыми, что повлекло причинение убытков:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма неосновательно удержанных (уплаченных) денежных средств составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-marketplace",
    name: "Претензия маркетплейсу (продавцу)",
    category: "legal",
    actSource: "ст. 26.1 Закона РФ «О защите прав потребителей»; Правила продажи ПП № 2463",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия маркетплейсу или продавцу: отказ в возврате товара, некачественный товар, неисполнение заказа, возврат денежных средств.",
    suggestedDocs: ["claim-sale", "refund-claim", "claim-generic"],
    printInstruction:
      "При дистанционной покупке потребитель вправе отказаться от товара в течение 7 дней (ст. 26.1 Закона о защите прав потребителей). Приложить скриншоты заказа и переписки.",
    fields: sectorFields([
      { id: "order_no", label: "Номер заказа", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат денежных средств", category: "payment",
        options: [
          { label: "Возврат уплаченных денежных средств", value: "возврат денежных средств" },
          { label: "Замена товара на аналогичный", value: "замена товара" },
          { label: "Соразмерное уменьшение цены", value: "уменьшение цены" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор купли-продажи товара дистанционным способом (заказ № {{order_no}}, документ {{contract_doc}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 26.1 Закона РФ «О защите прав потребителей» и Правил продажи товаров по договору розничной купли-продажи (ПП РФ № 2463) Вами допущено нарушение:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Стоимость товара (убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-fitness",
    name: "Претензия фитнес-клубу",
    category: "legal",
    actSource: "ст. 32 Закона РФ «О защите прав потребителей»; ст. 782 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия фитнес-клубу (спортклубу): возврат стоимости абонемента за неиспользованный период, отказ от договора оказания услуг.",
    suggestedDocs: ["claim-services", "refund-claim", "claim-generic"],
    printInstruction:
      "Потребитель вправе отказаться от исполнения договора в любое время при оплате фактически понесённых исполнителем расходов (ст. 32 Закона о защите прав потребителей).",
    fields: sectorFields([
      { id: "membership", label: "Абонемент (номер, срок)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат за неиспользованный период", category: "payment",
        options: [
          { label: "Возврат стоимости за неиспользованный период", value: "возврат за неиспользованный период" },
          { label: "Возврат полной стоимости абонемента", value: "возврат полной стоимости" },
          { label: "Расторжение договора без удержаний", value: "расторжение договора" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор об оказании физкультурно-оздоровительных услуг {{contract_doc}} (абонемент {{membership}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 32 Закона РФ «О защите прав потребителей» и ст. 782 ГК РФ при отказе от исполнения договора Вами неправомерно удерживается
    стоимость неоказанных услуг:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Стоимость неиспользованного периода (убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-autoservice",
    name: "Претензия автосервису",
    category: "legal",
    actSource: "ст. 18, 29 Закона РФ «О защите прав потребителей»; ст. 723 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия автосервису (станции техобслуживания): некачественный ремонт, требование устранения недостатков, возврата средств или возмещения расходов.",
    suggestedDocs: ["claim-works", "claim-generic", "refund-claim"],
    printInstruction:
      "Приложить заказ-наряд, акт выполненных работ, чеки и (при наличии) заключение независимой технической экспертизы. Срок устранения недостатков — 20 дней.",
    fields: sectorFields([
      { id: "work_order", label: "Заказ-наряд (номер, дата)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "vehicle", label: "Автомобиль (марка, гос. номер)", type: "text", defaultValue: "", category: "vehicle", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "безвозмездное устранение недостатков", category: "payment",
        options: [
          { label: "Безвозмездное устранение недостатков", value: "безвозмездное устранение недостатков" },
          { label: "Возмещение расходов на устранение недостатков", value: "возмещение расходов" },
          { label: "Возврат уплаченных средств", value: "возврат средств" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор на выполнение работ по ремонту (обслуживанию) автомобиля {{vehicle}} — заказ-наряд {{work_order}} (договор {{contract_doc}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 29 Закона РФ «О защите прав потребителей» и ст. 723 ГК РФ работы выполнены с недостатками:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Стоимость устранения недостатков (убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}} в установленный законом срок.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-developer",
    name: "Претензия застройщику (неустойка по ДДУ)",
    category: "legal",
    actSource: "ст. 6, 9 ФЗ № 214-ФЗ; ст. 23 Закона РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия застройщику о выплате неустойки за нарушение срока передачи объекта долевого строительства, возмещении убытков.",
    suggestedDocs: ["claim-generic", "dkp-flat", "claim-services"],
    printInstruction:
      "Неустойка рассчитывается как 1/150 ключевой ставки Банка России от цены договора за каждый день просрочки (ч. 2 ст. 6 ФЗ № 214-ФЗ). Приложить ДДУ и платёжные документы.",
    fields: sectorFields([
      { id: "ddu", label: "ДДУ (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "object", label: "Объект долевого строительства", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "due_date", label: "Срок передачи объекта по ДДУ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "penalty", label: "Неустойка (формула/период)", type: "text", defaultValue: "1/150 ключевой ставки ЦБ РФ от цены договора за каждый день просрочки (ч. 2 ст. 6 ФЗ № 214-ФЗ)", category: "payment" },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор участия в долевом строительстве {{ddu}} в отношении объекта: {{object}} (договор {{contract_doc}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение ч. 1 ст. 6 ФЗ № 214-ФЗ объект долевого строительства не передан в предусмотренный договором срок (срок передачи — «{{due_date}}»):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. На основании ч. 2 ст. 6 ФЗ № 214-ФЗ подлежит уплате неустойка: {{penalty}}. Общая сумма требования составляет
    <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую уплатить неустойку и возместить убытки в указанном размере.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-management-company",
    name: "Претензия управляющей компании (ЖКХ)",
    category: "legal",
    actSource: "ст. 161 ЖК РФ; Правила ПП № 354, № 491; Закон РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия управляющей компании (ТСЖ): перерасчёт платы за некачественные коммунальные услуги, устранение недостатков содержания общего имущества, возмещение ущерба.",
    suggestedDocs: ["claim-services", "claim-generic", "refund-claim"],
    printInstruction:
      "Приложить акты о качестве услуг (при отсутствии — составить с соседями), выписки ЕПД и квитанции. За некачественную услугу плата снижается за каждый час (ПП № 354). Обращение — через ГИС ЖКХ или заказным письмом.",
    fields: sectorFields([
      { id: "address", label: "Адрес помещения", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "service", label: "Коммунальная услуга / работа", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "перерасчёт размера платы", category: "payment",
        options: [
          { label: "Перерасчёт размера платы", value: "перерасчёт размера платы" },
          { label: "Устранение недостатков содержания общего имущества", value: "устранение недостатков" },
          { label: "Возмещение причинённого ущерба", value: "возмещение ущерба" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Я являюсь собственником (пользователем) помещения по адресу: {{address}}. Ваша организация осуществляет управление многоквартирным домом
    (договор {{contract_doc}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 161 ЖК РФ и Правил предоставления коммунальных услуг (ПП РФ № 354) услуга (работа) «{{service}}» оказывается ненадлежащего качества:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Размер необоснованно начисленной платы (ущерба, убытков) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-carrier",
    name: "Претензия транспортной компании (повреждение груза)",
    category: "legal",
    actSource: "ст. 796, 797 ГК РФ; УЖТ РФ / КТМ РФ; ФЗ «О транспортно-экспедиционной деятельности»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия перевозчику (транспортной компании): повреждение, утрата или недостача груза, требование возмещения стоимости груза и убытков.",
    suggestedDocs: ["claim-supply", "claim-generic", "refund-claim"],
    printInstruction:
      "До предъявления иска перевозчику обязателен досудебный претензионный порядок (ст. 797 ГК РФ). Срок исковой давности по перевозке — 1 год (для автомобильных перевозок). Приложить накладную, коммерческий акт, фотографии.",
    fields: sectorFields([
      { id: "waybill", label: "Транспортная накладная (номер, дата)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "cargo", label: "Груз (описание, стоимость)", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возмещение стоимости повреждённого груза", category: "payment",
        options: [
          { label: "Возмещение стоимости повреждённого (утраченного) груза", value: "возмещение стоимости груза" },
          { label: "Возмещение объявленной ценности груза", value: "возмещение объявленной ценности" },
          { label: "Возврат провозной платы", value: "возврат провозной платы" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор перевозки (транспортной экспедиции) {{contract_doc}} — накладная {{waybill}}. Передан груз: {{cargo}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 796 ГК РФ груз был повреждён (утрачен) при перевозке:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма ущерба (стоимость груза и убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании ст. 796, 797 ГК РФ требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
  {
    id: "claim-hotel",
    name: "Претензия отелю",
    category: "legal",
    actSource: "Правила предоставления гостиничных услуг ПП № 1853; Закон РФ «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия гостинице (отелю): некачественное оказание услуг проживания, отказ в возврате предоплаты, возмещение ущерба и убытков.",
    suggestedDocs: ["claim-services", "claim-generic", "refund-claim"],
    printInstruction:
      "Согласно Правилам предоставления гостиничных услуг (ПП РФ № 1853) потребитель вправе отказаться от услуг с оплатой фактически понесённых исполнителем расходов. Приложить бронь, документы об оплате и подтверждение недостатков.",
    fields: sectorFields([
      { id: "booking", label: "Бронирование (номер, дата заезда)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "claim_kind", label: "Требование", type: "select", defaultValue: "возврат стоимости проживания", category: "payment",
        options: [
          { label: "Возврат стоимости проживания (предоплаты)", value: "возврат стоимости проживания" },
          { label: "Перерасчёт стоимости номера", value: "перерасчёт стоимости" },
          { label: "Возмещение причинённого ущерба", value: "возмещение ущерба" },
        ] },
    ]),
    previewTemplate:
      sectorHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор об оказании гостиничных услуг {{contract_doc}} (бронирование {{booking}}).
  </p>
  <p class="mb-4 text-justify">
    В нарушение Правил предоставления гостиничных услуг в Российской Федерации (ПП РФ № 1853) и Закона РФ «О защите прав потребителей» услуги оказаны ненадлежащего качества (не оказаны):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма неосновательно удержанных средств (убытков) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>`
      + sectorCommon() +
      sectorSign(),
  },
];