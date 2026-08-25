import type { LegalTemplate, TemplateField } from "../types";
import {
  sideFields,
  pairSign,
  commonClauses,
  pageShell,
} from "./parts";

function itemsRepeating(
  nameLabel: string,
  unitLabel = "Ед.",
  priceLabel = "Цена, руб.",
  sumLabel = "Сумма, руб."
): TemplateField {
  return {
    id: "items",
    label: "Позиции (нажмите «Добавить»)",
    type: "repeating",
    defaultValue: "",
    category: "items",
    repeatingFields: [
      { id: "name", label: nameLabel, type: "text", defaultValue: "", width: "40%" },
      { id: "unit", label: unitLabel, type: "text", defaultValue: "шт", width: "10%" },
      { id: "qty", label: "Кол-во", type: "number", defaultValue: "1", width: "12%" },
      { id: "price", label: priceLabel, type: "number", defaultValue: "0", width: "18%" },
      { id: "sum", label: sumLabel, type: "number", defaultValue: "0", width: "20%" },
    ],
  };
}

function itemsTable(): string {
  return `
  <table class="w-full text-xs border border-zinc-300 mb-4 bg-white">
    <thead>
      <tr class="bg-zinc-50">
        <th class="p-2 border border-zinc-300 text-left w-8">№</th>
        <th class="p-2 border border-zinc-300 text-left">Наименование</th>
        <th class="p-2 border border-zinc-300 text-center w-12">Ед.</th>
        <th class="p-2 border border-zinc-300 text-center w-14">Кол-во</th>
        <th class="p-2 border border-zinc-300 text-right w-20">Цена</th>
        <th class="p-2 border border-zinc-300 text-right w-24">Сумма</th>
      </tr>
    </thead>
    <tbody>
      {{#items}}
      <tr>
        <td class="p-2 border border-zinc-300 text-center">{{num}}</td>
        <td class="p-2 border border-zinc-300">{{name}}</td>
        <td class="p-2 border border-zinc-300 text-center">{{unit}}</td>
        <td class="p-2 border border-zinc-300 text-center">{{qty}}</td>
        <td class="p-2 border border-zinc-300 text-right">{{price}}</td>
        <td class="p-2 border border-zinc-300 text-right">{{sum}}</td>
      </tr>
      {{/items}}
    </tbody>
    <tfoot>
      <tr class="bg-zinc-50 font-bold">
        <td colspan="5" class="p-2 border border-zinc-300 text-right">Итого:</td>
        <td class="p-2 border border-zinc-300 text-right">{{_total_pretty}}</td>
      </tr>
    </tfoot>
  </table>`;
}

function signPairLeft(field1: string, label1: string, field2: string, label2: string): string {
  return `
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4 mt-10">
    <div>
      <p class="font-bold mb-1">{{${field1}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">${label1}</p>
    </div>
    <div class="text-right">
      <p class="font-bold mb-1">{{${field2}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">${label2}</p>
    </div>
  </div>`;
}

export const TEMPLATES_FINANCE_ACTS: LegalTemplate[] = [
  {
    id: "upd",
    name: "Универсальный передаточный документ (УПД)",
    category: "finance",
    actSource: "ст. 169 НК РФ; Прил. № 1 к Письму ФНС России от 21.10.2013 № ММВ-20-3/96@",
    lastUpdated: "Август 2026",
    description:
      "УПД — счёт-фактура и передаточный документ в одном: отгрузка товаров, работ, услуг с НДС и без. Статус 1 — для НДС, статус 2 — только передача.",
    suggestedDocs: ["torg-12", "specification-supply", "invoice"],
    printInstruction:
      "УПД со статусом 1 заменяет счёт-фактуру и передаточный акт. Статус 2 применяется, когда НДС не требуется (без НДС, УСН). Хранится 4 года.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "upd_number", label: "Номер УПД", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "status", label: "Статус УПД", type: "radio", defaultValue: "1", category: "contract",
        options: [
          { label: "1 — счёт-фактура и передаточный документ", value: "1" },
          { label: "2 — только передаточный документ", value: "2" },
        ] },
      { id: "seller_org", label: "Продавец", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_inn", label: "ИНН продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_inn", label: "ИНН покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_address", label: "Адрес покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "base_doc", label: "Основание передачи (договор, счёт, накладная)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "vat_rate", label: "НДС (ставка)", type: "select", defaultValue: "20", category: "payment",
        options: [
          { label: "20%", value: "20" },
          { label: "10%", value: "10" },
          { label: "5%", value: "5" },
          { label: "0%", value: "0" },
          { label: "Без НДС", value: "none" },
        ] },
      itemsRepeating("Наименование товара (работы, услуги)", "Ед."),
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-2 text-xs font-semibold">
    <div>Статус: {{status}}</div>
    <div>Универсальный передаточный документ № {{upd_number}} от «{{date}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-2 text-black uppercase">Универсальный передаточный документ</div>
  <p class="text-center mb-6 text-xs">Счёт-фактура № {{upd_number}} от «{{date}}» {{#vat_rate_is_none}}(без НДС){{/vat_rate_is_none}}{{^vat_rate_is_none}}— НДС {{vat_rate}}%{{/vat_rate_is_none}}</p>
  <div class="mb-4 text-xs">
    <p>Продавец: <strong>{{seller_org}}</strong>{{#seller_inn}}, ИНН {{seller_inn}}{{/seller_inn}}{{#seller_address}}, {{seller_address}}{{/seller_address}}</p>
    <p>Покупатель: <strong>{{buyer_org}}</strong>{{#buyer_inn}}, ИНН {{buyer_inn}}{{/buyer_inn}}{{#buyer_address}}, {{buyer_address}}{{/buyer_address}}</p>
    <p>Основание передачи: {{base_doc}}.</p>
  </div>`
      + itemsTable() +
      `
  <p class="text-xs mb-4">
    Отпуск разрешил / товар (работы, услуги) передал: {{seller_org}} — <span class="border-b border-zinc-950 inline-block w-40"></span>
  </p>
  <p class="text-xs mb-10">
    Товар (работы, услуги) принял: {{buyer_org}} — <span class="border-b border-zinc-950 inline-block w-40"></span>
  </p>
  <div class="flex justify-between text-xs">
    <div>г. {{city}}</div>
    <div>«{{date}}»</div>
  </div>
</div>`,
  },
  {
    id: "loan-graph",
    name: "График возврата займа",
    category: "finance",
    actSource: "ст. 809–811 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Приложение к договору займа: график погашения по датам и суммам. Равными долями, аннуитет или с процентами в конце.",
    suggestedDocs: ["loan-agreement", "percent-loan", "zero-loan"],
    printInstruction:
      "Является приложением к договору займа. При просрочке платежа заимодавец вправе требовать досрочного возврата всей суммы (ст. 811 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lender_name", label: "Заимодавец", type: "text", defaultValue: "", category: "lender", validation: { required: true } },
      { id: "borrower_name", label: "Заёмщик", type: "text", defaultValue: "", category: "borrower", validation: { required: true } },
      { id: "loan_doc", label: "Договор займа (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "loan_amount", label: "Сумма займа (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "rate", label: "Проценты (% годовых)", type: "text", defaultValue: "0", category: "payment" },
      { id: "pay_type", label: "Порядок платежей", type: "select", defaultValue: "equal", category: "payment",
        options: [
          { label: "Равными долями вместе с процентами", value: "equal" },
          { label: "Основной долг равными долями, проценты отдельно", value: "separate" },
          { label: "Проценты в конце срока", value: "end" },
        ] },
      { id: "early_note", label: "Особые условия (досрочное погашение и др.)", type: "textarea", defaultValue: "Заёмщик вправе вернуть сумму займа досрочно с уплатой процентов за фактический срок пользования (ст. 809, 810 ГК РФ).", category: "contract", rows: 2 },
      itemsRepeating("Дата платежа / назначение", "—", "Сумма платежа"),
    ],
    previewTemplate:
      pageShell("График возврата займа") +
      `
  <p class="text-center mb-4 font-semibold">к договору займа {{loan_doc}}</p>
  <p class="mb-4 text-justify">Заимодавец: <strong>{{lender_name}}</strong>. Заёмщик: <strong>{{borrower_name}}</strong>.</p>
  <p class="mb-4 text-justify">
    Сумма займа: <strong>{{loan_amount}} ({{loan_amount_words}})</strong> рублей. Проценты: {{rate}}% годовых.
    Порядок платежей: {{pay_type_label}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">График платежей</div>`
      + itemsTable() +
      `
  <p class="text-xs mb-8">{{early_note}}</p>
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4">
    <div>
      <p class="font-bold mb-1">{{lender_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Заимодавец</p>
    </div>
    <div class="text-right">
      <p class="font-bold mb-1">{{borrower_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Заёмщик</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "container-spec",
    name: "Спецификация тары",
    category: "business",
    actSource: "ст. 517 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Приложение к договору поставки: тара и упаковка, возвратная или одноразовая, залоговая стоимость и сроки возврата.",
    suggestedDocs: ["specification-supply", "supply-contract", "torg-12"],
    printInstruction:
      "Возвратная тара подлежит возврату поставщику в сроки и порядке, установленные договором (ст. 517 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "base_doc", label: "Договор поставки (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "returnable", label: "Тара", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Возвратная (подлежит возврату)", value: "yes" },
          { label: "Одноразовая (невозвратная)", value: "no" },
        ] },
      { id: "return_days", label: "Срок возврата тары (дней)", type: "number", defaultValue: "30", category: "contract", dependsOn: { fieldId: "returnable", value: "yes" } },
      { id: "deposit_sum", label: "Залоговая стоимость тары (руб.)", type: "text", defaultValue: "", category: "payment" },
      itemsRepeating("Вид тары (наименование)", "шт"),
    ],
    previewTemplate:
      pageShell("Спецификация тары") +
      `
  <p class="text-center mb-4 font-semibold">к договору поставки {{base_doc}}</p>
  <p class="mb-4 text-justify">Поставщик: <strong>{{supplier_org}}</strong>. Покупатель: <strong>{{buyer_org}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Перечень тары</div>`
      + itemsTable() +
      `
  <p class="mb-4 text-justify text-xs">
    {{#returnable_is_yes}}Тара является возвратной: покупатель обязан возвратить её поставщику в течение {{return_days}} дней с момента получения товара.
    {{#deposit_sum}}Залоговая стоимость тары: {{deposit_sum}} руб. — возвращается после возврата тары.{{/deposit_sum}}{{/returnable_is_yes}}
    {{#returnable_is_no}}Тара является одноразовой (невозвратной): её стоимость включена в цену товара и возврату не подлежит (ст. 517 ГК РФ).{{/returnable_is_no}}
  </p>`
      + signPairLeft("supplier_org", "Поставщик", "buyer_org", "Покупатель") +
      `
</div>`,
  },
  {
    id: "task-services",
    name: "Задание на оказание услуг",
    category: "business",
    actSource: "ст. 779, 783 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Приложение к договору оказания услуг: детализация объёма услуг, требования к результату, сроки и стоимость.",
    suggestedDocs: ["service-agreement", "services-list", "act-services"],
    printInstruction: "Является приложением к договору услуг и уточняет его предмет (ст. 779 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "executor_name", label: "Исполнитель", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "base_doc", label: "Договор услуг (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "task_text", label: "Описание задания (объём услуг)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "results", label: "Требования к результату", type: "text", defaultValue: "", category: "contract" },
      { id: "deadline", label: "Срок выполнения", type: "text", defaultValue: "", category: "contract" },
      { id: "task_price", label: "Стоимость задания (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Задание на оказание услуг") +
      `
  <p class="text-center mb-4 font-semibold">к договору оказания услуг {{base_doc}}</p>
  <p class="mb-4 text-justify">Исполнитель: <strong>{{executor_name}}</strong>. Заказчик: <strong>{{customer_name}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Содержание задания</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказать услуги согласно заданию:</p>
  <p class="mb-4 text-justify">{{task_text}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Требования к результату</div>
  <p class="mb-4 text-justify">2.1. {{results}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок и стоимость</div>
  <p class="mb-4 text-justify">3.1. Срок выполнения: {{deadline}}. Стоимость: {{#task_price}}<strong>{{task_price}} ({{task_price_words}})</strong> рублей{{/task_price}}{{^task_price}}— в соответствии с договором{{/task_price}}.</p>
  <p class="mb-8 text-justify text-xs">Задание является неотъемлемой частью договора оказания услуг {{base_doc}}.</p>`
      + signPairLeft("executor_name", "Исполнитель", "customer_name", "Заказчик") +
      `
</div>`,
  },
  {
    id: "work-plan",
    name: "Календарный план работ",
    category: "business",
    actSource: "ст. 708 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Приложение к договору подряда: этапы работ, сроки выполнения и стоимость каждого этапа.",
    suggestedDocs: ["contract-works", "house-repair", "act-works"],
    printInstruction:
      "Сроки выполнения работ являются существенным условием договора подряда (ст. 708 ГК РФ). Изменение плана — дополнительным соглашением.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contractor_name", label: "Подрядчик", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "base_doc", label: "Договор подряда (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      itemsRepeating("Этап работ", "—", "Стоимость этапа"),
    ],
    previewTemplate:
      pageShell("Календарный план работ") +
      `
  <p class="text-center mb-4 font-semibold">к договору подряда {{base_doc}}</p>
  <p class="mb-4 text-justify">Подрядчик: <strong>{{contractor_name}}</strong>. Заказчик: <strong>{{customer_name}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Этапы и сроки выполнения работ</div>`
      + itemsTable() +
      `
  <p class="text-xs mb-8">
    Нарушение конечного срока выполнения работ влечёт ответственность подрядчика (ст. 708 ГК РФ). План является неотъемлемой частью договора {{base_doc}}.
  </p>`
      + signPairLeft("contractor_name", "Подрядчик", "customer_name", "Заказчик") +
      `
</div>`,
  },
  {
    id: "customer-order",
    name: "Заявка заказчика",
    category: "business",
    actSource: "ст. 435, 506 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Заявка на поставку товаров или оказание услуг в рамках рамочного договора: перечень позиций, количество, срок и адрес поставки.",
    suggestedDocs: ["supply-contract", "specification-supply", "torg-12"],
    printInstruction:
      "Заявка является офертой (ст. 435 ГК РФ) и подтверждается поставщиком. Рекомендуется направлять по электронной почте или через ЭДО.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата заявки", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "order_number", label: "Номер заявки", type: "text", defaultValue: "", category: "contract" },
      { id: "customer_org", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "base_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract" },
      { id: "delivery_date", label: "Срок поставки", type: "text", defaultValue: "", category: "contract" },
      { id: "delivery_address", label: "Адрес поставки", type: "text", defaultValue: "", category: "contract" },
      itemsRepeating("Товар (работа, услуга)"),
    ],
    previewTemplate:
      pageShell("Заявка заказчика") +
      `
  <p class="mb-4 text-justify">Заказчик: <strong>{{customer_org}}</strong>. Поставщик: <strong>{{supplier_org}}</strong>{{#base_doc}}, по договору {{base_doc}}{{/base_doc}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Прошу поставить (оказать) в срок {{delivery_date}}:</div>`
      + itemsTable() +
      `
  <p class="mb-4 text-justify text-xs">Адрес поставки: {{delivery_address}}.</p>
  <p class="mb-8 text-justify text-xs">
    Настоящая заявка является офертой (ст. 435 ГК РФ). Поставщик подтверждает заявку в срок, установленный договором.
  </p>`
      + signPairLeft("supplier_org", "Поставщик", "customer_org", "Заказчик") +
      `
</div>`,
  },
  {
    id: "services-list",
    name: "Перечень оказываемых услуг",
    category: "business",
    actSource: "ст. 779 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Приложение к договору оказания услуг: перечень услуг с объёмом и стоимостью каждой позиции.",
    suggestedDocs: ["service-agreement", "task-services", "act-services"],
    printInstruction: "Является приложением к договору услуг и определяет его предмет (ст. 779 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "executor_name", label: "Исполнитель", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "customer_name", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "base_doc", label: "Договор услуг (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      itemsRepeating("Наименование услуги", "—", "Стоимость"),
    ],
    previewTemplate:
      pageShell("Перечень оказываемых услуг") +
      `
  <p class="text-center mb-4 font-semibold">к договору оказания услуг {{base_doc}}</p>
  <p class="mb-4 text-justify">Исполнитель: <strong>{{executor_name}}</strong>. Заказчик: <strong>{{customer_name}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Перечень услуг</div>`
      + itemsTable() +
      `
  <p class="text-xs mb-8">
    Услуги считаются оказанными после подписания акта об оказании услуг. Перечень является неотъемлемой частью договора {{base_doc}} (ст. 779 ГК РФ).
  </p>`
      + signPairLeft("executor_name", "Исполнитель", "customer_name", "Заказчик") +
      `
</div>`,
  },
  {
    id: "property-list",
    name: "Перечень передаваемого имущества",
    category: "business",
    actSource: "ст. 606, 607 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Опись имущества, передаваемого в аренду, наём или по договору: наименование, количество и состояние на момент передачи.",
    suggestedDocs: ["akt-naym", "rental-general", "act-transfer-auto"],
    printInstruction:
      "Опись имущества прикладывается к договору аренды/найма и позволяет вернуть имущество в том же состоянии (ст. 622, 678 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "party1_name", label: "Передающая сторона", type: "text", defaultValue: "", category: "owner", validation: { required: true } },
      { id: "party2_name", label: "Принимающая сторона", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "base_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      itemsRepeating("Наименование имущества", "шт"),
      { id: "condition_note", label: "Состояние и повреждения", type: "textarea", defaultValue: "имущество находится в исправном состоянии, видимых повреждений не имеет", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Перечень передаваемого имущества") +
      `
  <p class="text-center mb-4 font-semibold">к договору {{base_doc}}</p>
  <p class="mb-4 text-justify">Передающая сторона: <strong>{{party1_name}}</strong>. Принимающая сторона: <strong>{{party2_name}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Перечень имущества</div>`
      + itemsTable() +
      `
  <p class="mb-4 text-justify text-xs">Состояние имущества на момент передачи: {{condition_note}}.</p>
  <p class="mb-8 text-justify text-xs">
    Перечень является неотъемлемой частью договора {{base_doc}}. Имущество подлежит возврату в том же состоянии с учётом нормального износа (ст. 622 ГК РФ).
  </p>`
      + signPairLeft("party1_name", "Сторона 1", "party2_name", "Сторона 2") +
      `
</div>`,
  },
  {
    id: "ds-loan",
    name: "Допсоглашение к договору займа",
    category: "finance",
    actSource: "ст. 450, 809, 810 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Изменение условий договора займа: срок возврата, процентная ставка, порядок платежей, сумма.",
    suggestedDocs: ["loan-agreement", "percent-loan", "loan-graph"],
    printInstruction:
      "Изменения договора оформляются в той же форме, что и договор (п. 1 ст. 452 ГК РФ). Рекомендуется печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата допсоглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("party1", "Заимодавец", "lender"),
      ...sideFields("party2", "Заёмщик", "borrower"),
      { id: "base_doc", label: "Договор займа (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "change_type", label: "Что изменяем", type: "select", defaultValue: "срок возврата", category: "contract",
        options: [
          { label: "Срок возврата займа", value: "срок возврата" },
          { label: "Процентная ставка", value: "ставка" },
          { label: "Порядок платежей (график)", value: "график" },
          { label: "Иные условия", value: "иные условия" },
        ] },
      { id: "new_term", label: "Новый срок возврата (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "new_rate", label: "Новая ставка (% годовых)", type: "text", defaultValue: "", category: "payment" },
      { id: "change_text", label: "Суть изменений", type: "textarea", defaultValue: "стороны изменили условия договора займа", category: "contract", rows: 2 },
      { id: "effect_date", label: "Дата вступления в силу", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Дополнительное соглашение к договору займа") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Заимодавец», и {{party2_name}}, именуемый(ая) в дальнейшем «Заёмщик»,
    заключили настоящее дополнительное соглашение к договору займа {{base_doc}} о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения условий</div>
  <p class="mb-4 text-justify">1.1. Изменяются следующие условия договора займа {{base_doc}}: {{change_type_label}} — {{change_text}}.</p>
  {{#new_term}}<p class="mb-4 text-justify">1.2. Срок возврата займа устанавливается до «{{new_term}}» (ст. 810 ГК РФ).</p>{{/new_term}}
  {{#new_rate}}<p class="mb-4 text-justify">1.3. Проценты за пользование займом устанавливаются в размере {{new_rate}}% годовых (ст. 809 ГК РФ).</p>{{/new_rate}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вступление в силу</div>
  <p class="mb-4 text-justify">
    2.1. Настоящее допсоглашение вступает в силу с «{{effect_date}}»{{^effect_date}} с даты подписания{{/effect_date}} и является неотъемлемой частью договора займа {{base_doc}}.
  </p>
  <p class="mb-6 text-justify">
    2.2. Условия договора займа, не затронутые настоящим допсоглашением, сохраняют свою силу (п. 1 ст. 450, ст. 453 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Заимодавец", "party2", "Заёмщик"),
  },
  {
    id: "ds-works",
    name: "Допсоглашение к договору подряда",
    category: "business",
    actSource: "ст. 450, 708, 709 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Изменение условий договора подряда: сроки работ, стоимость, объём работ.",
    suggestedDocs: ["contract-works", "house-repair", "work-plan"],
    printInstruction:
      "Изменения договора оформляются в той же форме, что и договор (п. 1 ст. 452 ГК РФ). Сроки работ — существенное условие (ст. 708 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата допсоглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("party1", "Заказчик", "customer"),
      ...sideFields("party2", "Подрядчик", "contractor"),
      { id: "base_doc", label: "Договор подряда (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "change_type", label: "Что изменяем", type: "select", defaultValue: "сроки работ", category: "contract",
        options: [
          { label: "Сроки выполнения работ", value: "сроки работ" },
          { label: "Стоимость работ", value: "стоимость" },
          { label: "Объём работ", value: "объём работ" },
          { label: "Иные условия", value: "иные условия" },
        ] },
      { id: "new_deadline", label: "Новый срок окончания работ (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "new_price", label: "Новая стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "change_text", label: "Суть изменений", type: "textarea", defaultValue: "стороны изменили условия договора подряда", category: "contract", rows: 2 },
      { id: "effect_date", label: "Дата вступления в силу", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Дополнительное соглашение к договору подряда") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Заказчик», и {{party2_name}}, именуемый(ая) в дальнейшем «Подрядчик»,
    заключили настоящее дополнительное соглашение к договору подряда {{base_doc}} о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения условий</div>
  <p class="mb-4 text-justify">1.1. Изменяются следующие условия договора подряда {{base_doc}}: {{change_type_label}} — {{change_text}}.</p>
  {{#new_deadline}}<p class="mb-4 text-justify">1.2. Срок окончания работ устанавливается до «{{new_deadline}}» (ст. 708 ГК РФ).</p>{{/new_deadline}}
  {{#new_price}}<p class="mb-4 text-justify">1.3. Стоимость работ устанавливается в размере {{new_price}} ({{new_price_words}}) рублей (ст. 709 ГК РФ).</p>{{/new_price}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вступление в силу</div>
  <p class="mb-4 text-justify">
    2.1. Настоящее допсоглашение вступает в силу с «{{effect_date}}»{{^effect_date}} с даты подписания{{/effect_date}} и является неотъемлемой частью договора подряда {{base_doc}}.
  </p>
  <p class="mb-6 text-justify">
    2.2. Условия договора подряда, не затронутые настоящим допсоглашением, сохраняют свою силу (п. 1 ст. 450, ст. 453 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Заказчик", "party2", "Подрядчик"),
  },
  {
    id: "ds-supply",
    name: "Допсоглашение к договору поставки",
    category: "business",
    actSource: "ст. 450, 506 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Изменение условий договора поставки: сроки поставки, ассортимент, цена товара.",
    suggestedDocs: ["supply-contract", "equipment-supply", "specification-supply"],
    printInstruction:
      "Изменения договора оформляются в той же форме, что и договор (п. 1 ст. 452 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата допсоглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("party1", "Поставщик", "seller"),
      ...sideFields("party2", "Покупатель", "buyer"),
      { id: "base_doc", label: "Договор поставки (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "change_type", label: "Что изменяем", type: "select", defaultValue: "сроки поставки", category: "contract",
        options: [
          { label: "Сроки поставки", value: "сроки поставки" },
          { label: "Ассортимент и количество", value: "ассортимент" },
          { label: "Цена товара", value: "цена" },
          { label: "Иные условия", value: "иные условия" },
        ] },
      { id: "new_delivery_date", label: "Новый срок поставки (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "price_change", label: "Новая цена", type: "text", defaultValue: "", category: "payment" },
      { id: "change_text", label: "Суть изменений", type: "textarea", defaultValue: "стороны изменили условия договора поставки", category: "contract", rows: 2 },
      { id: "effect_date", label: "Дата вступления в силу", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Дополнительное соглашение к договору поставки") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Поставщик», и {{party2_name}}, именуемый(ая) в дальнейшем «Покупатель»,
    заключили настоящее дополнительное соглашение к договору поставки {{base_doc}} о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения условий</div>
  <p class="mb-4 text-justify">1.1. Изменяются следующие условия договора поставки {{base_doc}}: {{change_type_label}} — {{change_text}}.</p>
  {{#new_delivery_date}}<p class="mb-4 text-justify">1.2. Срок поставки устанавливается до «{{new_delivery_date}}».</p>{{/new_delivery_date}}
  {{#price_change}}<p class="mb-4 text-justify">1.3. Цена товара устанавливается: {{price_change}}.</p>{{/price_change}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вступление в силу</div>
  <p class="mb-4 text-justify">
    2.1. Настоящее допсоглашение вступает в силу с «{{effect_date}}»{{^effect_date}} с даты подписания{{/effect_date}} и является неотъемлемой частью договора поставки {{base_doc}}.
  </p>
  <p class="mb-6 text-justify">
    2.2. Условия договора поставки, не затронутые настоящим допсоглашением, сохраняют свою силу (п. 1 ст. 450, ст. 453 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Поставщик", "party2", "Покупатель"),
  },
  {
    id: "ds-rent-extend",
    name: "Допсоглашение о продлении аренды",
    category: "business",
    actSource: "ст. 450, 610, 621 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Продление договора аренды на новый срок: срок продления, условия, изменение арендной платы.",
    suggestedDocs: ["rental-general", "rental-office", "notice-rent-termination"],
    printInstruction:
      "При продлении на неопределённый срок каждая сторона вправе отказаться от договора, предупредив другую за 1 месяц (ст. 610 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата допсоглашения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("party1", "Арендодатель", "landlord"),
      ...sideFields("party2", "Арендатор", "tenant"),
      { id: "base_doc", label: "Договор аренды (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "extend_kind", label: "Срок продления", type: "radio", defaultValue: "fixed", category: "contract",
        options: [
          { label: "На определённый срок", value: "fixed" },
          { label: "На неопределённый срок", value: "indefinite" },
        ] },
      { id: "new_end_date", label: "Дата окончания нового срока", type: "date", defaultValue: "", category: "contract", dependsOn: { fieldId: "extend_kind", value: "fixed" } },
      { id: "new_rent", label: "Новая арендная плата (руб./мес.)", type: "number", defaultValue: "", category: "payment" },
      { id: "other_terms", label: "Иные изменения условий", type: "textarea", defaultValue: "остальные условия договора аренды не изменяются", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Дополнительное соглашение о продлении аренды") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Арендодатель», и {{party2_name}}, именуемый(ая) в дальнейшем «Арендатор»,
    заключили настоящее дополнительное соглашение к договору аренды {{base_doc}} о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Продление срока</div>
  <p class="mb-4 text-justify">
    1.1. Стороны продлевают срок действия договора аренды {{base_doc}}
    {{#extend_kind_is_fixed}}до «{{new_end_date}}»{{/extend_kind_is_fixed}}
    {{#extend_kind_is_indefinite}}на неопределённый срок (ст. 610 ГК РФ){{/extend_kind_is_indefinite}}.
  </p>
  {{#new_rent}}<p class="mb-4 text-justify">1.2. Арендная плата устанавливается в размере {{new_rent}} ({{new_rent_words}}) рублей в месяц (ст. 614 ГК РФ).</p>{{/new_rent}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Прочие условия</div>
  <p class="mb-4 text-justify">2.1. {{other_terms}}.</p>
  <p class="mb-4 text-justify">
    2.2. Арендатор, надлежащим образом исполнявший обязанности, при прочих равных условиях имеет преимущественное право на заключение договора аренды на новый срок (ст. 621 ГК РФ).
  </p>
  <p class="mb-6 text-justify">
    2.3. Настоящее допсоглашение вступает в силу с даты подписания и является неотъемлемой частью договора аренды {{base_doc}} (п. 1 ст. 450 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Арендодатель", "party2", "Арендатор"),
  },
  {
    id: "akt-naym",
    name: "Акт передачи жилого помещения в наём",
    category: "realty",
    actSource: "ст. 676, 678 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Акт передачи квартиры/комнаты нанимателю: состояние помещения, показания счётчиков, опись мебели, комплект ключей.",
    suggestedDocs: ["rental-general", "rental-daily", "raspiska-money"],
    printInstruction:
      "Акт фиксирует состояние помещения и имущества на момент передачи — при выселении по нему определяется нормальный износ (ст. 678 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата передачи", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "landlord_name", label: "Наймодатель", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "tenant_name", label: "Наниматель", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "contract_doc", label: "Договор найма (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "address", label: "Адрес жилого помещения", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "condition", label: "Состояние помещения", type: "textarea", defaultValue: "помещение передано в исправном состоянии, пригодно для проживания", category: "contract", rows: 2 },
      { id: "meters", label: "Показания счётчиков (электроэнергия, вода)", type: "text", defaultValue: "", category: "contract" },
      { id: "utilities", label: "Порядок оплаты коммунальных услуг", type: "text", defaultValue: "коммунальные услуги оплачивает наниматель отдельно от платы за наём", category: "contract" },
      { id: "furniture", label: "Мебель и техника в помещении", type: "textarea", defaultValue: "перечень передаваемой мебели и техники указан сторонами дополнительно", category: "contract", rows: 2 },
      { id: "keys_qty", label: "Количество комплектов ключей", type: "text", defaultValue: "1", category: "contract" },
      { id: "damage_note", label: "Повреждения и недостатки", type: "text", defaultValue: "видимых повреждений не обнаружено", category: "contract" },
      { id: "return_note", label: "Условия возврата", type: "text", defaultValue: "помещение подлежит возврату в том же состоянии с учётом нормального износа", category: "contract" },
    ],
    previewTemplate:
      pageShell("Акт передачи жилого помещения в наём") +
      `
  <p class="mb-4 text-justify">
    {{landlord_name}} («Наймодатель») передал, а {{tenant_name}} («Наниматель») принял во временное владение и пользование
    жилое помещение по адресу: {{address}}, по договору найма {{contract_doc}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Состояние помещения</div>
  <p class="mb-4 text-justify">1.1. {{condition}}. Повреждения и недостатки: {{damage_note}} (ст. 678 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Счётчики и коммунальные услуги</div>
  <p class="mb-4 text-justify">2.1. Показания счётчиков на дату передачи: {{meters}}.</p>
  <p class="mb-4 text-justify">2.2. {{utilities}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Мебель, техника, ключи</div>
  <p class="mb-4 text-justify">3.1. {{furniture}}.</p>
  <p class="mb-4 text-justify">3.2. Передано комплектов ключей: {{keys_qty}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Возврат</div>
  <p class="mb-6 text-justify">4.1. {{return_note}} (ст. 678 ГК РФ).</p>`
      + signPairLeft("landlord_name", "Наймодатель", "tenant_name", "Наниматель") +
      `
</div>`,
  },
];