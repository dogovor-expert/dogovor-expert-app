import type { LegalTemplate, TemplateField } from "../types";
import {
  sideFields,
  pairSign,
  commonClauses,
  pageShell,
} from "./parts";

function claimHead(): string {
  return `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>{{recipient_name}}</p>
    <p>{{recipient_address}}</p>
    <p class="mt-2">от {{sender_name}}</p>
    <p>{{sender_address}}</p>
    <p class="mt-2">тел.: {{sender_phone}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Досудебная претензия</div>`;
}

function claimFields(extra: TemplateField[] = []): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "sender_name", label: "Кредитор (ФИО/название)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
    { id: "sender_address", label: "Адрес кредитора", type: "text", defaultValue: "", category: "sender" },
    { id: "sender_phone", label: "Телефон", type: "text", defaultValue: "", category: "sender" },
    { id: "recipient_name", label: "Должник (ФИО/название)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
    { id: "recipient_address", label: "Адрес должника", type: "text", defaultValue: "", category: "recipient" },
    { id: "contract_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "violation", label: "Нарушение обязательства", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
    { id: "sum", label: "Сумма требования (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
    { id: "deadline_days", label: "Срок для исполнения (дней)", type: "number", defaultValue: "10", category: "contract" },
    ...extra,
  ];
}

function claimSign(): string {
  return `
  <p class="mb-6 text-justify">
    Настоящая претензия направляется в порядке обязательного досудебного урегулирования спора. В случае неисполнения требований в указанный срок
    я буду вынужден(а) обратиться в суд с иском о взыскании задолженности, неустойки, убытков и судебных расходов.
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

function claimCommon(_sumWords: boolean): string {
  return `
  <p class="mb-4 text-justify">
    В связи с изложенным, руководствуясь ст. 309, 310 ГК РФ, требую: исполнить обязательство и уплатить денежные средства в размере
    <strong>{{sum}} ({{sum_words}})</strong> рублей в течение {{deadline_days}} календарных дней с момента получения настоящей претензии.
  </p>`;
}

function terminationFields(): LegalTemplate["fields"] {
  return [
    { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "date", label: "Дата соглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ...sideFields("party1", "Сторона 1", "contractor"),
    ...sideFields("party2", "Сторона 2", "contractor"),
    { id: "contract_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "termination_date", label: "Дата прекращения договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    { id: "mutual_settlement", label: "Взаиморасчёты сторон (кто кому что возвращает)", type: "textarea", defaultValue: "стороны не имеют друг к другу имущественных претензий", category: "contract" },
    { id: "return_item", label: "Возврат имущества/товара/результата", type: "textarea", defaultValue: "имущество, переданное по договору, подлежит возврату в срок до даты прекращения договора по акту приёма-передачи", category: "contract" },
  ];
}

function terminationBody(): string {
  return `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прекращение договора</div>
  <p class="mb-4 text-justify">
    1.1. Стороны пришли к соглашению о расторжении договора {{contract_doc}} с «{{termination_date}}» (п. 1 ст. 450 ГК РФ).
    Обязательства сторон по договору прекращаются с указанной даты (п. 3 ст. 453 ГК РФ), за исключением обязательств, связанных с расчётами и ответственностью за нарушение договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Взаиморасчёты</div>
  <p class="mb-4 text-justify">2.1. {{mutual_settlement}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Возврат имущества</div>
  <p class="mb-4 text-justify">3.1. {{return_item}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Прекращение обязательств</div>
  <p class="mb-4 text-justify">
    4.1. С момента прекращения договора стороны не вправе требовать исполнения его условий, за исключением условий, касающихся порядка расчётов и ответственности.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны</div>
  <p class="mb-2">Сторона 1:</p>
  {{#party1_status_is_person}}<p class="mb-1 text-sm"><strong>{{party1_name}}</strong></p>{{/party1_status_is_person}}
  {{#party1_status_is_ip}}<p class="mb-1 text-sm"><strong>ИП {{party1_name}}</strong></p>{{/party1_status_is_ip}}
  {{#party1_status_is_legal}}<p class="mb-1 text-sm"><strong>{{party1_name}}</strong></p>{{/party1_status_is_legal}}
  <p class="mb-2 mt-4">Сторона 2:</p>
  {{#party2_status_is_person}}<p class="mb-1 text-sm"><strong>{{party2_name}}</strong></p>{{/party2_status_is_person}}
  {{#party2_status_is_ip}}<p class="mb-1 text-sm"><strong>ИП {{party2_name}}</strong></p>{{/party2_status_is_ip}}
  {{#party2_status_is_legal}}<p class="mb-1 text-sm"><strong>{{party2_name}}</strong></p>{{/party2_status_is_legal}}`;
}

export const TEMPLATES_CLAIMS: LegalTemplate[] = [
  {
    id: "claim-rent",
    name: "Претензия по договору аренды",
    category: "legal",
    actSource: "ст. 614, 619, 620 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия арендодателя к арендатору: задолженность по арендной плате, коммунальным платежам, неустойка за просрочку.",
    suggestedDocs: ["terminate-rent", "claim-letter", "notice-rent-termination"],
    printInstruction:
      "Направить заказным письмом с описью вложения. Претензия — обязательный этап перед обращением в суд (для юрлиц и ИП по договору).",
    fields: claimFields([
      { id: "penalty", label: "Неустойка за просрочку (% в день или сумма)", type: "text", defaultValue: "0,1% от суммы задолженности за каждый день просрочки", category: "payment" },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор аренды {{contract_doc}}. В нарушение ст. 614 ГК РФ арендная плата (коммунальные платежи) не уплачивается (уплачивается не в полном объёме):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Задолженность по арендной плате составляет <strong>{{sum}} ({{sum_words}})</strong> рублей. На сумму долга подлежит начислению неустойка: {{penalty}} (ст. 330 ГК РФ, условия договора).
  </p>
  <p class="mb-4 text-justify">
    3. В случае неуплаты задолженности в установленный срок я оставляю за собой право обратиться в суд с иском о взыскании долга, неустойки,
    а также о расторжении договора аренды (ст. 619 ГК РФ) и выселении (возврате имущества, ст. 622 ГК РФ).
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "claim-loan",
    name: "Претензия по договору займа",
    category: "legal",
    actSource: "ст. 807–811 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия заимодавца: требование о возврате суммы займа, процентов, досрочный возврат при нарушении сроков (ст. 811 ГК РФ).",
    suggestedDocs: ["claim-letter", "loan-agreement", "court-order-app"],
    printInstruction:
      "Направить заказным письмом с описью вложения или вручить под расписку. По ст. 811 ГК РФ при просрочке процентов займодавец вправе требовать досрочного возврата займа.",
    fields: claimFields([
      { id: "loan_rate", label: "Проценты по договору (% годовых)", type: "text", defaultValue: "", category: "payment" },
      { id: "early_return", label: "Требовать досрочного возврата (ст. 811)", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Да, требовать досрочный возврат всей суммы", value: "yes" },
          { label: "Нет, только просроченные платежи", value: "no" },
        ] },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор займа {{contract_doc}}, по которому я передал(а) Вам денежные средства {{#loan_rate}}под {{loan_rate}}% годовых{{/loan_rate}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение условий договора и ст. 807–810 ГК РФ Вы не исполнили(а) обязательства по возврату займа (уплате процентов):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма задолженности составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. {{#early_return_is_yes}}На основании п. 2 ст. 811 ГК РФ требую досрочного возврата всей оставшейся суммы займа вместе с причитающимися процентами.{{/early_return_is_yes}}
    {{#early_return_is_no}}Требую возврата просроченной задолженности.{{/early_return_is_no}}
  </p>
  <p class="mb-4 text-justify">
    4. В случае неисполнения требований я обращусь в суд (в т.ч. с заявлением о выдаче судебного приказа) о взыскании долга, процентов и неустойки.
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "claim-sale",
    name: "Претензия по договору купли-продажи",
    category: "legal",
    actSource: "ст. 475–477 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия покупателя к продавцу: недостатки товара, возврат оплаты, замена товара, соразмерное уменьшение цены.",
    suggestedDocs: ["refund-claim", "claim-letter", "goods-sale"],
    printInstruction:
      "Направить заказным письмом с описью вложения. Для потребителей действует Закон о защите прав потребителей (срок ответа — 10 дней).",
    fields: claimFields([
      { id: "defect", label: "Характер недостатка (существенный/несущественный)", type: "select", defaultValue: "существенный", category: "contract",
        options: [
          { label: "Существенный (невозможно использовать товар)", value: "существенный" },
          { label: "Несущественный", value: "несущественный" },
        ] },
      { id: "demand_type", label: "Требование покупателя", type: "select", defaultValue: "возврат оплаты", category: "contract",
        options: [
          { label: "Возврат уплаченной суммы (отказ от договора)", value: "возврат оплаты" },
          { label: "Замена товара на аналогичный", value: "замена товара" },
          { label: "Соразмерное уменьшение цены", value: "уменьшение цены" },
          { label: "Безвозмездное устранение недостатков", value: "устранение недостатков" },
        ] },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор купли-продажи {{contract_doc}}.
  </p>
  <p class="mb-4 text-justify">
    При приёмке (эксплуатации) товара обнаружены недостатки, о которых не было оговорено при продаже (ст. 475 ГК РФ):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Недостаток является: {{defect}}. Стоимость товара (убытки) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании ст. 475, 476 ГК РФ требую: {{demand_type_label}}.
  </p>
  <p class="mb-4 text-justify">
    4. При отказе от удовлетворения требований я обращусь в суд с иском (для потребителей — также с требованием о компенсации морального вреда и штрафом 50%, п. 6 ст. 13 Закона о защите прав потребителей).
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "claim-works",
    name: "Претензия по договору подряда",
    category: "legal",
    actSource: "ст. 723–725 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия заказчика к подрядчику: недостатки результата работ, просрочка, требование об устранении или соразмерном уменьшении цены.",
    suggestedDocs: ["claim-letter", "act-works", "contract-works"],
    printInstruction:
      "Направить заказным письмом с описью вложения. Срок исковой давности по недостаткам работ — 1 год (ст. 725 ГК РФ).",
    fields: claimFields([
      { id: "defect_type", label: "Вид требования", type: "select", defaultValue: "безвозмездное устранение недостатков", category: "contract",
        options: [
          { label: "Безвозмездное устранение недостатков", value: "безвозмездное устранение недостатков" },
          { label: "Соразмерное уменьшение цены", value: "соразмерное уменьшение цены" },
          { label: "Возмещение расходов на устранение", value: "возмещение расходов" },
          { label: "Отказ от договора и возмещение убытков", value: "отказ от договора" },
        ] },
      { id: "penalty", label: "Неустойка за просрочку (% в день)", type: "text", defaultValue: "3% (для бытового подряда по п. 5 ст. 28 Закона о защите прав потребителей)", category: "payment" },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор подряда {{contract_doc}} на выполнение работ.
  </p>
  <p class="mb-4 text-justify">
    В нарушение ст. 721, 723 ГК РФ результат работ имеет недостатки (работы выполнены с нарушением сроков):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Размер убытков (расходов на устранение недостатков) составляет <strong>{{sum}} ({{sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3. На основании ст. 723 ГК РФ требую: {{defect_type_label}}. При просрочке выполнения работ требую уплаты неустойки: {{penalty}}.
  </p>
  <p class="mb-4 text-justify">
    4. В случае неисполнения требований я обращусь в суд с иском о взыскании убытков, неустойки и судебных расходов (ст. 724, 725 ГК РФ).
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "claim-supply",
    name: "Претензия по договору поставки",
    category: "legal",
    actSource: "ст. 518–524 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия по договору поставки: недопоставка, просрочка, несоответствие качества, требование об оплате товара.",
    suggestedDocs: ["claim-letter", "equipment-supply", "terminate-supply"],
    printInstruction:
      "Направить заказным письмом с описью вложения. Стороны по договору поставки обязаны соблюсти досудебный порядок (ст. 4 АПК РФ).",
    fields: claimFields([
      { id: "claim_kind", label: "Характер требования", type: "select", defaultValue: "оплата поставленного товара", category: "contract",
        options: [
          { label: "Оплата поставленного товара", value: "оплата поставленного товара" },
          { label: "Допоставка недостающего количества", value: "допоставка" },
          { label: "Замена некачественного товара", value: "замена товара" },
          { label: "Неустойка за просрочку поставки", value: "неустойка" },
        ] },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор поставки {{contract_doc}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение условий договора и ст. 506, 509, 516 ГК РФ Вами допущено нарушение обязательств:
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма требования составляет <strong>{{sum}} ({{sum_words}})</strong> рублей (ст. 518, 521, 524 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>
  <p class="mb-4 text-justify">
    4. В случае неисполнения требований я обращусь в арбитражный суд с иском о взыскании задолженности, неустойки и убытков,
    а также о расторжении договора поставки (ст. 523 ГК РФ).
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "claim-services",
    name: "Претензия по договору оказания услуг",
    category: "legal",
    actSource: "ст. 779–783 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебная претензия по договору оказания услуг: некачественные услуги, просрочка, отказ от договора, возврат оплаты.",
    suggestedDocs: ["claim-letter", "service-agreement", "act-services"],
    printInstruction:
      "Направить заказным письмом с описью вложения. Для потребителей действует Закон о защите прав потребителей (срок ответа — 10 дней).",
    fields: claimFields([
      { id: "claim_kind", label: "Характер требования", type: "select", defaultValue: "возврат оплаты за неоказанные услуги", category: "contract",
        options: [
          { label: "Возврат оплаты за неоказанные (некачественные) услуги", value: "возврат оплаты" },
          { label: "Повторное (дополнительное) оказание услуг", value: "повторное оказание" },
          { label: "Соразмерное уменьшение цены", value: "уменьшение цены" },
          { label: "Уплата неустойки за просрочку", value: "неустойка" },
        ] },
    ]),
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между мной и Вами заключён договор оказания услуг {{contract_doc}}.
  </p>
  <p class="mb-4 text-justify">
    В нарушение условий договора и ст. 779, 783 ГК РФ услуги оказаны ненадлежащим образом (не оказаны в срок):
  </p>
  <p class="mb-4 text-justify">1. {{violation}}.</p>
  <p class="mb-4 text-justify">
    2. Сумма требования составляет <strong>{{sum}} ({{sum_words}})</strong> рублей (ст. 782 ГК РФ, условия договора).
  </p>
  <p class="mb-4 text-justify">
    3. На основании изложенного требую: {{claim_kind_label}}.
  </p>
  <p class="mb-4 text-justify">
    4. В случае неисполнения требований я обращусь в суд с иском о взыскании уплаченных средств, неустойки и убытков.
  </p>`
      + claimCommon(true) +
      claimSign(),
  },
  {
    id: "terminate-dkp-realty",
    name: "Соглашение о расторжении ДКП недвижимости",
    category: "legal",
    actSource: "ст. 450, 453 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора купли-продажи недвижимости по соглашению сторон: возврат оплаты, возврат объекта, регистрация прекращения права.",
    suggestedDocs: ["termination-agreement", "dkp-flat", "raspiska-money"],
    printInstruction:
      "Если переход права собственности был зарегистрирован в Росреестре — соглашение подаётся для регистрации прекращения права. Печатать в 3-х экземплярах.",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора купли-продажи недвижимости") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Сторона 1», и {{party2_name}}, именуемый(ая) в дальнейшем «Сторона 2»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. Стороны обязуются подать настоящее соглашение в Росреестр для погашения записи о праве собственности Стороны 2 на объект недвижимости
    (при государственной регистрации перехода права) и осуществить возврат уплаченных денежных средств в соответствии с п. 2 настоящего соглашения.
  </p>`
      + commonClauses() +
      pairSign("party1", "Сторона 1", "party2", "Сторона 2"),
  },
  {
    id: "terminate-gift",
    name: "Соглашение о расторжении договора дарения",
    category: "legal",
    actSource: "ст. 450, 578 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора дарения по взаимному согласию дарителя и одаряемого: возврат дара, оформление перехода прав.",
    suggestedDocs: ["gift-agreement", "termination-agreement", "gift-flat"],
    printInstruction:
      "При дарении недвижимости соглашение подлежит регистрации в Росреестре. При отмене дарения по ст. 578 ГК РФ (недостойное поведение) применяется судебный порядок.",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора дарения") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Сторона 1», и {{party2_name}}, именуемый(ая) в дальнейшем «Сторона 2»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. В случае дарения недвижимости Стороны обязуются подать настоящее соглашение в Росреестр для погашения записи о праве собственности.
  </p>`
      + commonClauses() +
      pairSign("party1", "Сторона 1", "party2", "Сторона 2"),
  },
  {
    id: "terminate-loan",
    name: "Соглашение о расторжении договора займа",
    category: "legal",
    actSource: "ст. 450, 453 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора займа по соглашению сторон: прощение долга, возврат части средств, прекращение обязательств (ст. 415 ГК РФ).",
    suggestedDocs: ["loan-agreement", "termination-agreement", "raspiska-money"],
    printInstruction:
      "Печатать в 2-х экземплярах. Прощение долга оформляется безвозмездно и не должно нарушать права третьих лиц (ст. 415 ГК РФ).",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора займа") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Заимодавец», и {{party2_name}}, именуемый(ая) в дальнейшем «Заёмщик»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. Заимодавец подтверждает, что не имеет к Заёмщику требований по возврату суммы займа и процентов, кроме обязательств, указанных в п. 2 настоящего соглашения (ст. 415 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Заимодавец", "party2", "Заёмщик"),
  },
  {
    id: "terminate-sale",
    name: "Соглашение о расторжении договора купли-продажи",
    category: "legal",
    actSource: "ст. 450, 453 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора купли-продажи товара (движимого имущества) по соглашению сторон: возврат товара и уплаченных средств.",
    suggestedDocs: ["goods-sale", "termination-agreement", "raspiska-money"],
    printInstruction: "Печатать в 2-х экземплярах. Возврат товара оформляется актом приёма-передачи.",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора купли-продажи") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Продавец», и {{party2_name}}, именуемый(ая) в дальнейшем «Покупатель»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. Покупатель обязуется возвратить товар, переданный по договору, а Продавец — вернуть уплаченные денежные средства, в порядке, предусмотренном п. 2 и 3 настоящего соглашения.
  </p>`
      + commonClauses() +
      pairSign("party1", "Продавец", "party2", "Покупатель"),
  },
  {
    id: "terminate-works",
    name: "Соглашение о расторжении договора подряда",
    category: "legal",
    actSource: "ст. 450, 453, 717 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора подряда по соглашению сторон: оплата фактически выполненных работ, возврат результата и материалов.",
    suggestedDocs: ["contract-works", "termination-agreement", "act-works"],
    printInstruction:
      "Печатать в 2-х экземплярах. До сдачи результата заказчик вправе отказаться от договора, оплатив часть установленной цены пропорционально выполненной работе (ст. 717 ГК РФ).",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора подряда") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Заказчик», и {{party2_name}}, именуемый(ая) в дальнейшем «Подрядчик»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. Подрядчик передаёт, а Заказчик принимает фактически выполненную часть работ по акту. Неиспользованные материалы возвращаются Подрядчику.
  </p>`
      + commonClauses() +
      pairSign("party1", "Заказчик", "party2", "Подрядчик"),
  },
  {
    id: "terminate-services",
    name: "Соглашение о расторжении договора оказания услуг",
    category: "legal",
    actSource: "ст. 450, 453, 782 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Расторжение договора оказания услуг по соглашению сторон: оплата фактически оказанных услуг, отказ от договора.",
    suggestedDocs: ["service-agreement", "termination-agreement", "act-services"],
    printInstruction:
      "Печатать в 2-х экземплярах. Заказчик вправе отказаться от договора, оплатив фактически понесённые исполнителем расходы (ст. 782 ГК РФ).",
    fields: terminationFields(),
    previewTemplate:
      pageShell("Соглашение о расторжении договора оказания услуг") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Заказчик», и {{party2_name}}, именуемый(ая) в дальнейшем «Исполнитель»,
    заключили настоящее соглашение о нижеследующем:
  </p>`
      + terminationBody() +
      `
  <p class="mb-4 text-justify">
    4.2. Исполнитель передаёт, а Заказчик принимает акт о фактически оказанных услугах (ст. 782 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Заказчик", "party2", "Исполнитель"),
  },
  {
    id: "refuse-rent",
    name: "Уведомление об отказе от договора аренды",
    category: "legal",
    actSource: "ст. 610, 619, 620 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Уведомление арендодателя или арендатора об отказе от договора аренды: односторонний отказ, срок предупреждения, возврат имущества.",
    suggestedDocs: ["notice-rent-termination", "terminate-rent", "claim-rent"],
    printInstruction:
      "Договор аренды, заключённый на неопределённый срок, может быть расторгнут по инициативе любой стороны с предупреждением за 1 месяц (ст. 610 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sender_name", label: "Кто уведомляет (ФИО/название)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "recipient_name", label: "Кому уведомление (ФИО/название)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "contract_doc", label: "Договор аренды (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "object", label: "Объект аренды", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "termination_date", label: "Дата прекращения аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "reason", label: "Основание отказа", type: "select", defaultValue: "истечение срока / отказ от договора, заключённого на неопределённый срок (ст. 610 ГК РФ)", category: "contract",
        options: [
          { label: "Отказ от договора на неопределённый срок (ст. 610)", value: "неопределённый срок" },
          { label: "Существенное нарушение другой стороной (ст. 619, 620)", value: "существенное нарушение" },
        ] },
      { id: "return_days", label: "Срок возврата объекта (дней с даты прекращения)", type: "number", defaultValue: "1", category: "contract" },
    ],
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между нами заключён договор аренды {{contract_doc}} объекта: {{object}}.
  </p>
  <p class="mb-4 text-justify">
    Уведомляю Вас об отказе от исполнения указанного договора аренды на основании: {{reason}}.
  </p>
  <p class="mb-4 text-justify">
    Договор считается прекращённым с «{{termination_date}}». Прошу в срок до указанной даты освободить объект и передать его по акту приёма-передачи
    ({{return_days}} день с даты прекращения договора), а также погасить задолженность по арендной плате и коммунальным платежам, если таковая имеется (ст. 622 ГК РФ).
  </p>
  <p class="mb-6 text-justify">
    В случае неисполнения требований я буду вынужден(а) обратиться в суд с иском о возврате имущества и взыскании задолженности.
  </p>`
      + claimSign(),
  },
  {
    id: "refuse-lease",
    name: "Уведомление об отказе от договора найма",
    category: "legal",
    actSource: "ст. 674, 687 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Уведомление наймодателя или нанимателя об отказе от договора найма жилого помещения: срок предупреждения 3 месяца, расторжение.",
    suggestedDocs: ["rental-daily", "terminate-rent", "notice-rent-termination"],
    printInstruction:
      "Наниматель вправе расторгнуть договор найма, предупредив наймодателя за 3 месяца (п. 1 ст. 687 ГК РФ). Наймодатель предупреждает нанимателя за 3 месяца (п. 2 ст. 687 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sender_name", label: "Кто уведомляет (ФИО)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "recipient_name", label: "Кому уведомление (ФИО)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "contract_doc", label: "Договор найма (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "address", label: "Адрес жилого помещения", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "termination_date", label: "Дата прекращения найма", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "who_refuses", label: "Кто отказывается", type: "radio", defaultValue: "tenant", category: "contract",
        options: [
          { label: "Наниматель", value: "tenant" },
          { label: "Наймодатель", value: "landlord" },
        ] },
    ],
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между нами заключён договор найма жилого помещения {{contract_doc}} по адресу: {{address}}.
  </p>
  <p class="mb-4 text-justify">
    {{#who_refuses_is_tenant}}В соответствии с п. 1 ст. 687 ГК РФ уведомляю Вас об отказе от договора найма: договор будет расторгнут
    по истечении 3 месяцев с момента получения настоящего уведомления — «{{termination_date}}».{{/who_refuses_is_tenant}}
    {{#who_refuses_is_landlord}}В соответствии с п. 2 ст. 687 ГК РФ уведомляю Вас о расторжении договора найма: договор прекращается
    по истечении 3 месяцев с момента получения настоящего уведомления — «{{termination_date}}».{{/who_refuses_is_landlord}}
  </p>
  <p class="mb-4 text-justify">
    Прошу в указанный срок освободить жилое помещение, передать ключи и погасить задолженность по платежам (при наличии).
  </p>
  <p class="mb-6 text-justify">
    Настоящее уведомление направляется в порядке п. 1 (2) ст. 687 ГК РФ. При неисполнении требований я буду вынужден(а) обратиться в суд.
  </p>`
      + claimSign(),
  },
  {
    id: "refuse-works",
    name: "Уведомление об отказе от договора подряда",
    category: "legal",
    actSource: "ст. 715, 717 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Уведомление заказчика об отказе от договора подряда: отказ до сдачи результата, оплата пропорционально выполненным работам.",
    suggestedDocs: ["contract-works", "claim-works", "terminate-works"],
    printInstruction:
      "Заказчик вправе отказаться от договора до сдачи результата, оплатив часть цены пропорционально выполненной работе и возместив убытки в пределах цены (ст. 717 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sender_name", label: "Заказчик (ФИО/название)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "recipient_name", label: "Подрядчик (ФИО/название)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "contract_doc", label: "Договор подряда (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "work_desc", label: "Работы по договору", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "reason", label: "Причина отказа", type: "select", defaultValue: "отказ по инициативе заказчика (ст. 717 ГК РФ)", category: "contract",
        options: [
          { label: "Отказ по инициативе заказчика (ст. 717)", value: "ст. 717" },
          { label: "Несвоевременное начало работ / нарушение сроков (ст. 715)", value: "ст. 715" },
        ] },
      { id: "accept_date", label: "Дата передачи выполненной части работ", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между нами заключён договор подряда {{contract_doc}} на выполнение работ: {{work_desc}}.
  </p>
  <p class="mb-4 text-justify">
    Уведомляю Вас об отказе от исполнения договора подряда на основании: {{reason}}.
  </p>
  <p class="mb-4 text-justify">
    {{#accept_date}}Прошу в срок до «{{accept_date}}» передать результат фактически выполненной части работ по акту приёма-передачи.{{/accept_date}}
    Оплата будет произведена пропорционально фактически выполненной и принятой части работ (ст. 717 ГК РФ).
  </p>
  <p class="mb-6 text-justify">
    Неиспользованные материалы и оборудование прошу принять и вывезти. При неисполнении требований я буду вынужден(а) обратиться в суд.
  </p>`
      + claimSign(),
  },
  {
    id: "refuse-services",
    name: "Уведомление об отказе от договора оказания услуг",
    category: "legal",
    actSource: "ст. 782 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Уведомление заказчика или исполнителя об отказе от договора оказания услуг: оплата фактически оказанных услуг, возмещение расходов.",
    suggestedDocs: ["service-agreement", "claim-services", "terminate-services"],
    printInstruction:
      "Заказчик вправе отказаться от договора, оплатив фактически понесённые исполнителем расходы; исполнитель — возместив заказчику убытки (ст. 782 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sender_name", label: "Кто уведомляет (ФИО/название)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "recipient_name", label: "Кому уведомление (ФИО/название)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "contract_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "services_desc", label: "Услуги по договору", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "who_refuses", label: "Кто отказывается", type: "radio", defaultValue: "customer", category: "contract",
        options: [
          { label: "Заказчик", value: "customer" },
          { label: "Исполнитель", value: "executor" },
        ] },
      { id: "termination_date", label: "Дата прекращения договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      claimHead() +
      `
  <p class="mb-4 text-justify">
    Между нами заключён договор оказания услуг {{contract_doc}}: {{services_desc}}.
  </p>
  <p class="mb-4 text-justify">
    {{#who_refuses_is_customer}}В соответствии с п. 1 ст. 782 ГК РФ уведомляю Вас об отказе от исполнения договора оказания услуг.
    Договор прекращается с «{{termination_date}}». Обязуюсь оплатить фактически понесённые Вами расходы, связанные с исполнением обязательств по договору.{{/who_refuses_is_customer}}
    {{#who_refuses_is_executor}}В соответствии с п. 2 ст. 782 ГК РФ уведомляю Вас об отказе от исполнения договора оказания услуг.
    Договор прекращается с «{{termination_date}}». Обязуюсь возместить Вам убытки, причинённые отказом от исполнения договора.{{/who_refuses_is_executor}}
  </p>
  <p class="mb-4 text-justify">
    Прошу в срок до «{{termination_date}}» представить акт о фактически оказанных услугах (понесённых расходах) и завершить взаиморасчёты.
  </p>
  <p class="mb-6 text-justify">
    При неисполнении требований я буду вынужден(а) обратиться в суд.
  </p>`
      + claimSign(),
  },
];