import type { LegalTemplate, TemplateField } from "@/data/types";

export const dkpLikeFields: TemplateField[] = [
  { id: "seller_fio", label: "ФИО продавца", type: "text", category: "seller", defaultValue: "Иванов Иван Иванович", validation: { required: true } },
  { id: "seller_passport_series", label: "Серия паспорта продавца", type: "text", category: "seller", defaultValue: "" },
  { id: "seller_passport_number", label: "Номер паспорта продавца", type: "text", category: "seller", defaultValue: "" },
  { id: "city", label: "Город", type: "text", category: "contract", defaultValue: "Москва" },
  { id: "date", label: "Дата договора", type: "date", category: "contract", defaultValue: "" },
  { id: "contract_price", label: "Цена автомобиля", type: "number", category: "contract", defaultValue: "950000" },
  { id: "car_vin", label: "VIN", type: "text", category: "vehicle", defaultValue: "" },
  { id: "agreed", label: "Согласен", type: "checkbox", category: "contract", defaultValue: "false" },
  {
    id: "items",
    label: "Услуги",
    type: "repeating",
    category: "items",
    defaultValue: "",
    repeatingFields: [
      { id: "name", label: "Наименование", type: "text" },
      { id: "sum", label: "Сумма", type: "number" },
    ],
  },
  { id: "comment", label: "Комментарий", type: "textarea", category: "other", defaultValue: "" },
  {
    id: "is_company",
    label: "Продавец — организация",
    type: "select",
    category: "seller",
    defaultValue: "false",
    options: [
      { label: "Физлицо", value: "false" },
      { label: "Организация", value: "true" },
    ],
  },
  { id: "seller_inn", label: "ИНН продавца", type: "text", category: "seller", defaultValue: "", dependsOn: { fieldId: "is_company", value: "true" } },
  { id: "ogrn", label: "ОГРН", type: "text", category: "seller", defaultValue: "" },
  { id: "snils", label: "СНИЛС", type: "text", category: "seller", defaultValue: "" },
  { id: "bik", label: "БИК", type: "text", category: "payment", defaultValue: "" },
  { id: "kpp", label: "КПП", type: "text", category: "payment", defaultValue: "" },
  { id: "title", label: "Краткое описание", type: "text", category: "contract", defaultValue: "", validation: { minLength: 3 } },
];

export const dkpLikeTemplate: LegalTemplate = {
  id: "dkp-test",
  name: "ДКП тест",
  category: "auto",
  actSource: "ГК РФ",
  lastUpdated: "2026-01-01",
  description: "Тестовый шаблон",
  suggestedDocs: [],
  fields: dkpLikeFields,
  previewTemplate: [
    "<div>Продавец: {{seller_fio}}</div>",
    "<div>{{seller_fio_gen}}</div>",
    "<div>Дата: {{date}}</div>",
    "<div>Цена: {{contract_price}} ({{contract_price_words}})</div>",
    "<div>Город: {{city}}</div>",
    "{{#agreed}}ДА{{/agreed}}",
    "<table>{{#items}}<tr><td>{{num}}</td><td>{{name}}</td><td>{{sum}}</td></tr>{{/items}}</table>",
    "<div class=\"sig\">Подпись Продавца</div>",
    "<div>{{comment}}</div>",
  ].join("\n"),
};

export const invoiceTemplate: LegalTemplate = {
  id: "invoice",
  name: "Счёт на оплату",
  category: "business",
  actSource: "ФЗ-54",
  lastUpdated: "2026-01-01",
  description: "Счёт",
  suggestedDocs: [],
  fields: [
    {
      id: "items",
      label: "Позиции",
      type: "repeating",
      category: "items",
      defaultValue: "",
      repeatingFields: [
        { id: "name", label: "Наименование", type: "text" },
        { id: "sum", label: "Сумма", type: "number" },
      ],
    },
    {
      id: "nds_rate",
      label: "НДС",
      type: "select",
      category: "payment",
      defaultValue: "20",
      options: ["20", "10", "0", "без НДС"],
    },
    { id: "show_qr", label: "Показать QR", type: "checkbox", category: "payment", defaultValue: "false" },
  ],
  previewTemplate: [
    "<div class=\"text-right\" id=\"qr-placeholder\"></div>",
    "{{#items}}<p>{{name}} — {{sum}}</p>{{/items}}",
    "Итого: {{invoice_total_pretty}}, НДС: {{invoice_nds_pretty}}",
  ].join("\n"),
};

export const receiptTemplate: LegalTemplate = {
  id: "receipt-test",
  name: "Расписка тест",
  category: "auto",
  actSource: "ГК РФ",
  lastUpdated: "2026-01-01",
  description: "Расписка",
  suggestedDocs: [],
  fields: [
    { id: "seller_fio", label: "ФИО продавца", type: "text", category: "seller", defaultValue: "" },
    { id: "seller_passport", label: "Паспорт продавца", type: "text", category: "seller", defaultValue: "" },
    { id: "buyer_fio", label: "ФИО покупателя", type: "text", category: "buyer", defaultValue: "" },
    { id: "city", label: "Город", type: "text", category: "contract", defaultValue: "" },
    { id: "date", label: "Дата", type: "date", category: "contract", defaultValue: "" },
    { id: "contract_price", label: "Сумма", type: "number", category: "contract", defaultValue: "" },
  ],
  previewTemplate: "{{seller_fio}} — {{seller_passport}} — {{contract_price}}",
};
