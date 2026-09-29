import type { LegalTemplate } from "../types";

export const TEMPLATES_FAMILY: LegalTemplate[] = [
{
    id: "spouse-consent-sell",
    name: "Согласие супруга(и) на продажу имущества",
    category: "family",
    actSource: "ст. 34, 35 Семейного кодекса РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Нотариальное согласие супруга(и) на продажу совместно нажитого имущества (недвижимость, ТС).",
    suggestedDocs: ["dkp-flat", "dkp-auto"],
    printInstruction: "Оформляется у нотариуса",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата согласия", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "spouse_fio", label: "ФИО супруга(и), дающего согласие", type: "text",
        defaultValue: "", category: "spouse", validation: { required: true },
      },
      {
        id: "spouse_passport", label: "Паспорт супруга(и)", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "spouse_address", label: "Адрес супруга(и)", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "owner_fio", label: "ФИО супруга(и) — собственника", type: "text",
        defaultValue: "", category: "owner", validation: { required: true },
      },
      {
        id: "object_type", label: "Тип имущества", type: "radio", defaultValue: "Квартира",
        category: "contract",
        options: [
          { label: "Квартира", value: "Квартира" },
          { label: "Земельный участок", value: "Земельный участок" },
          { label: "Транспортное средство", value: "Транспортное средство" },
        ],
      },
      {
        id: "object_address", label: "Адрес / описание имущества", type: "text",
        defaultValue: "", category: "contract",
        validation: { required: true },
      },
      {
        id: "buyer_fio", label: "ФИО покупателя (если известен)", type: "text",
        defaultValue: "", category: "buyer",
      },
    ],
    
  },
{
    id: "marriage-contract",
    name: "Брачный договор",
    category: "family",
    actSource: "ст. 40–44 СК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Брачный договор, определяющий имущественные права супругов в браке и при его расторжении.",
    suggestedDocs: [],
    printInstruction: "Требуется нотариальное удостоверение (ст. 41 СК РФ)",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "spouse1_fio", label: "ФИО Супруга", type: "text", defaultValue: "",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse1_passport", label: "Паспорт Супруга", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "spouse2_fio", label: "ФИО Супруги", type: "text", defaultValue: "",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse2_passport", label: "Паспорт Супруги", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "regime", label: "Режим имущества", type: "select",
        options: [
          { label: "Раздельная собственность на всё имущество", value: "Раздельная собственность на всё имущество" },
          { label: "Смешанный режим (указано в п. 2.2)", value: "Смешанный режим (указано в п. 2.2)" },
          { label: "Совместная собственность (по умолчанию)", value: "Совместная собственность (по умолчанию)" },
        ],
        defaultValue: "Совместная собственность (по умолчанию)", category: "family",
      },
      {
        id: "property_list", label: "Имущество, на которое распространяется режим", type: "textarea", rows: 4,
        defaultValue: "",
        category: "family",
      },
      {
        id: "mixed_notes", label: "Особенности смешанного режима", type: "textarea", rows: 3,
        defaultValue: "",
        category: "family",
        dependsOn: { fieldId: "regime", value: "Смешанный режим (указано в п. 2.2)" },
      },
      {
        id: "children_note", label: "Условия о детях (необязательно)", type: "text",
        defaultValue: "", category: "family",
      },
    ],
    
  },
{
    id: "alimony-agreement",
    name: "Соглашение об уплате алиментов",
    category: "family",
    actSource: "ст. 99–105 СК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Нотариальное соглашение родителей об уплате алиментов на ребёнка (фикс. сумма или доля дохода).",
    suggestedDocs: [],
    printInstruction: "Требуется нотариальное удостоверение, имеет силу исполнительного листа",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата соглашения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "payer_fio", label: "ФИО плательщика алиментов", type: "text",
        defaultValue: "", category: "recipient", validation: { required: true },
      },
      {
        id: "payer_passport", label: "Паспорт плательщика", type: "text",
        defaultValue: "", category: "recipient",
      },
      {
        id: "receiver_fio", label: "ФИО получателя алиментов", type: "text",
        defaultValue: "", category: "sender", validation: { required: true },
      },
      {
        id: "receiver_passport", label: "Паспорт получателя", type: "text",
        defaultValue: "", category: "sender",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "",
        category: "family", validation: { required: true },
      },
      {
        id: "child_birthday", label: "Дата рождения ребёнка", type: "date", defaultValue: "",
        category: "family",
      },
      {
        id: "amount_mode", label: "Способ расчёта алиментов", type: "select",
        options: [
          { label: "Твёрдая денежная сумма", value: "Твёрдая денежная сумма" },
          { label: "Доля от дохода (1/4 — 1/6)", value: "Доля от дохода (1/4 — 1/6)" },
        ],
        defaultValue: "Твёрдая денежная сумма", category: "payment",
      },
      {
        id: "amount_fixed", label: "Сумма в месяц (руб.)", type: "number", defaultValue: "",
        category: "payment",
        dependsOn: { fieldId: "amount_mode", value: "Твёрдая денежная сумма" },
      },
      {
        id: "amount_share", label: "Доля дохода (текстом)", type: "select",
        options: [
          { label: "1/4 дохода", value: "1/4 дохода" },
          { label: "1/3 дохода", value: "1/3 дохода" },
          { label: "1/2 дохода", value: "1/2 дохода" },
        ],
        defaultValue: "1/4 дохода", category: "payment",
        dependsOn: { fieldId: "amount_mode", value: "Доля от дохода (1/4 — 1/6)" },
      },
      {
        id: "pay_day", label: "День ежемесячной оплаты", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "until_note", label: "Срок уплаты", type: "select",
        options: [
          { label: "До совершеннолетия (18 лет)", value: "До совершеннолетия (18 лет)" },
          { label: "До 23 лет (при очном обучении)", value: "До 23 лет (при очном обучении)" },
        ],
        defaultValue: "До совершеннолетия (18 лет)", category: "family",
      },
    ],
    
  },
{
    id: "gift-agreement",
    name: "Договор дарения",
    category: "family",
    actSource: "ст. 572–582 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Договор дарения имущества (квартиры, автомобиля, денег) между родственниками и не только.",
    suggestedDocs: ["dkp-flat", "dkp-auto"],
    printInstruction: "Дарение недвижимости — требуется нотариус при долевой собственности",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "donor_fio", label: "ФИО Дарителя", type: "text", defaultValue: "",
        category: "donor", validation: { required: true },
      },
      {
        id: "donor_passport", label: "Паспорт Дарителя", type: "text",
        defaultValue: "", category: "donor",
      },
      {
        id: "donee_fio", label: "ФИО Одаряемого", type: "text", defaultValue: "",
        category: "donee", validation: { required: true },
      },
      {
        id: "donee_passport", label: "Паспорт Одаряемого", type: "text",
        defaultValue: "", category: "donee",
      },
      {
        id: "relation", label: "Степень родства", type: "select",
        options: [
          { label: "Супруг/супруга", value: "Супруг/супруга" },
          { label: "Родитель/ребёнок", value: "Родитель/ребёнок" },
          { label: "Дедушка/бабушка — внуки", value: "Дедушка/бабушка — внуки" },
          { label: "Брат/сестра", value: "Брат/сестра" },
          { label: "Иные лица", value: "Иные лица" },
        ],
        defaultValue: "Родитель/ребёнок", category: "family",
      },
      {
        id: "gift_type", label: "Предмет дарения", type: "select",
        options: [
          { label: "Квартира / доля", value: "Квартира / доля" },
          { label: "Жилой дом", value: "Жилой дом" },
          { label: "Земельный участок", value: "Земельный участок" },
          { label: "Автомобиль", value: "Автомобиль" },
          { label: "Денежные средства", value: "Денежные средства" },
        ],
        defaultValue: "Квартира / доля", category: "object",
      },
      {
        id: "gift_description", label: "Описание предмета дарения", type: "textarea", rows: 3,
        defaultValue: "",
        category: "object", validation: { required: true },
      },
      {
        id: "cadastral_number", label: "Кадастровый номер (для недвижимости)", type: "text",
        defaultValue: "", category: "object",
        dependsOn: { fieldId: "gift_type", values: ["Квартира / доля", "Жилой дом", "Земельный участок"] },
      },
      {
        id: "gift_car_vin", label: "VIN автомобиля", type: "text", defaultValue: "",
        category: "vehicle",
        dependsOn: { fieldId: "gift_type", value: "Автомобиль" },
      },
      {
        id: "gift_money", label: "Сумма денежного дара (руб.)", type: "number", defaultValue: "",
        category: "payment",
        dependsOn: { fieldId: "gift_type", value: "Денежные средства" },
      },
      {
        id: "tax_note", label: "Примечание (налог 13%)", type: "text",
        defaultValue: "",
        category: "family",
      },
    ],
    
  },
{
    id: "child-travel-consent",
    name: "Согласие на выезд ребёнка за границу",
    category: "family",
    actSource: "ст. 20, 21 ФЗ-114 «О порядке выезда из РФ»",
    lastUpdated: "Август 2026",
    description:
      "Согласие одного родителя на выезд несовершеннолетнего ребёнка за границу с указанием страны, срока и сопровождающего.",
    suggestedDocs: ["passport-intl-app"],
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата составления", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "parent_fio", label: "ФИО родителя (согласие)", type: "text", defaultValue: "",
        category: "spouse", validation: { required: true },
      },
      {
        id: "parent_passport", label: "Паспорт родителя (серия №)", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "parent_address", label: "Адрес регистрации родителя", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "",
        category: "family", validation: { required: true },
      },
      {
        id: "child_birthday", label: "Дата рождения ребёнка", type: "date", defaultValue: "",
        category: "family",
      },
      {
        id: "child_passport", label: "Свидетельство о рождении / паспорт", type: "text",
        defaultValue: "", category: "family",
      },
      {
        id: "country", label: "Страна выезда", type: "text", defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "travel_dates", label: "Период поездки", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "companion_fio", label: "Сопровождающее лицо", type: "text",
        defaultValue: "", category: "contract",
      },
    ],
    
  },
{
    id: "property-division",
    name: "Соглашение о разделе совместно нажитого имущества",
    category: "family",
    actSource: "ст. 38 СК РФ",
    lastUpdated: "Август 2026",
    description:
      "Досудебное соглашение супругов о разделе имущества: недвижимость, автомобиль, денежные средства.",
    suggestedDocs: ["marriage-contract", "spouse-consent-sell"],
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата соглашения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "spouse1_fio", label: "ФИО Супруга", type: "text", defaultValue: "",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse1_passport", label: "Паспорт Супруга", type: "text", defaultValue: "",
        category: "spouse",
      },
      {
        id: "spouse1_address", label: "Адрес Супруга", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "spouse2_fio", label: "ФИО Супруги", type: "text", defaultValue: "",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse2_passport", label: "Паспорт Супруги", type: "text", defaultValue: "",
        category: "spouse",
      },
      {
        id: "spouse2_address", label: "Адрес Супруги", type: "text",
        defaultValue: "", category: "spouse",
      },
      {
        id: "marriage_date", label: "Дата заключения брака", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "property_list", label: "Перечень разделяемого имущества", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "children_note", label: "Дети (учесть интересы)", type: "text", defaultValue: "",
        category: "contract",
      },
    ],
    
  },
{
    id: "nanny-agreement",
    name: "Договор с няней (присмотр за ребёнком)",
    category: "family",
    actSource: "гл. 39 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор возмездного оказания услуг няни: график, оплата, обязанности по присмотру и безопасности ребёнка.",
    suggestedDocs: ["employment-contract", "gpa-contract"],
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "customer_fio", label: "ФИО Заказчика (родителя)", type: "text", defaultValue: "",
        category: "customer", validation: { required: true },
      },
      {
        id: "executor_fio", label: "ФИО Няни", type: "text", defaultValue: "",
        category: "executor", validation: { required: true },
      },
      {
        id: "executor_passport", label: "Паспорт Няни", type: "text", defaultValue: "",
        category: "executor",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "",
        category: "family", validation: { required: true },
      },
      {
        id: "child_age", label: "Возраст ребёнка (лет)", type: "number", defaultValue: "",
        category: "family",
      },
      {
        id: "work_hours", label: "График работы", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "work_address", label: "Место работы", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "service_price", label: "Оплата (руб./час или мес)", type: "text", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "duties_list", label: "Обязанности", type: "textarea", rows: 3,
        defaultValue: "",
        category: "contract",
      },
      {
        id: "medical_book", label: "Медицинская книжка", type: "checkbox", defaultValue: "true",
        category: "executor",
      },
    ],
    
  },
{
      id: "will",
    name: "Завещание",
    category: "family",
    actSource: "ст. 1118-1131 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Распоряжение имуществом на случай смерти: наследники, доли, завещательный отказ. Удостоверяется нотариусом.",
    suggestedDocs: [],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "testator_fio", label: "Завещатель (ФИО)", type: "text", defaultValue: "", category: "testator", validation: { required: true } },
      { id: "testator_birthdate", label: "Дата рождения", type: "date", defaultValue: "", category: "testator" },
      { id: "testator_passport", label: "Паспорт завещателя", type: "text", defaultValue: "", category: "testator" },
      { id: "testator_living_address", label: "Адрес регистрации", type: "text", defaultValue: "", category: "testator" },
      { id: "heir1_fio", label: "Наследник 1 (ФИО)", type: "text", defaultValue: "", category: "heir", validation: { required: true } },
      { id: "heir1_share", label: "Доля наследника 1", type: "text", defaultValue: "", category: "heir" },
      { id: "heir2_fio", label: "Наследник 2 (ФИО)", type: "text", defaultValue: "", category: "heir" },
      { id: "heir2_share", label: "Доля наследника 2", type: "text", defaultValue: "", category: "heir" },
      { id: "property_desc", label: "Описание имущества", type: "textarea", defaultValue: "", category: "property", rows: 2, validation: { required: true } },
      { id: "legacy_refusal", label: "Завещательный отказ / иные распоряжения", type: "textarea", defaultValue: "", category: "property", rows: 2 },
      { id: "notary", label: "Нотариус (ФИО)", type: "text", defaultValue: "", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "", category: "notary" },
    ],
    
  },
{
      id: "inheritance-acceptance",
    name: "Заявление о принятии наследства",
    category: "family",
    actSource: "ст. 1153-1154 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление нотариусу о принятии наследства (ст. 1153 ГК РФ): наследник, наследодатель, состав наследства.",
    suggestedDocs: [],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "", category: "notary" },
      { id: "heir_fio", label: "Наследник (ФИО)", type: "text", defaultValue: "", category: "heir", validation: { required: true } },
      { id: "heir_address", label: "Адрес наследника", type: "text", defaultValue: "", category: "heir" },
      { id: "testator_fio", label: "Наследодатель (ФИО)", type: "text", defaultValue: "", category: "testator", validation: { required: true } },
      { id: "testator_death_date", label: "Дата смерти", type: "date", defaultValue: "", category: "testator" },
      { id: "relation", label: "Родство", type: "text", defaultValue: "", category: "testator" },
      { id: "property_desc", label: "Состав наследства", type: "textarea", defaultValue: "", category: "property", rows: 2, validation: { required: true } },
      { id: "other_heirs", label: "Другие наследники", type: "text", defaultValue: "", category: "heir" },
    ],
    
  },
{
      id: "inheritance-refusal",
    name: "Отказ от наследства",
    category: "family",
    actSource: "ст. 1157-1158 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление нотариусу об отказе от наследства (ст. 1157 ГК РФ) в пользу других наследников.",
    suggestedDocs: [],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "", category: "notary" },
      { id: "heir_fio", label: "Наследник (ФИО)", type: "text", defaultValue: "", category: "heir", validation: { required: true } },
      { id: "heir_address", label: "Адрес наследника", type: "text", defaultValue: "", category: "heir" },
      { id: "testator_fio", label: "Наследодатель (ФИО)", type: "text", defaultValue: "", category: "testator", validation: { required: true } },
      { id: "testator_death_date", label: "Дата смерти", type: "date", defaultValue: "", category: "testator" },
      { id: "refuse_to_fio", label: "В чью пользу отказ (если есть)", type: "text", defaultValue: "", category: "heir" },
      { id: "property_desc", label: "Состав наследства", type: "textarea", defaultValue: "", category: "property", rows: 2 },
    ],
    
  },
{
    id: "spouse-consent-purchase",
    name: "Согласие супруга на покупку недвижимости",
    category: "family",
    actSource: "ст. 35 СК РФ, ст. 256 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Нотариальное согласие супруга на приобретение недвижимости за счёт общих средств брака: описание объекта, срок действия, удостоверение (п. 3 ст. 35 СК РФ).",
    suggestedDocs: ["dkp-flat", "spouse-consent-sell"],
    printInstruction: "Печать на листе А4; для сделок с недвижимостью согласие подлежит нотариальному удостоверению (п. 3 ст. 35 СК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата согласия", type: "date", defaultValue: "", category: "contract" },
      { id: "spouse1_fio", label: "Супруг 1 (дающий согласие)", type: "text", defaultValue: "", category: "spouse1", validation: { required: true } },
      { id: "spouse1_passport", label: "Паспорт супруга 1", type: "text", defaultValue: "", category: "spouse1" },
      { id: "spouse2_fio", label: "Супруг 2 (покупатель)", type: "text", defaultValue: "", category: "spouse2", validation: { required: true } },
      { id: "spouse2_passport", label: "Паспорт супруга 2", type: "text", defaultValue: "", category: "spouse2" },
      { id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "", category: "family" },
      { id: "property_desc", label: "Приобретаемый объект", type: "textarea", defaultValue: "", category: "realty", rows: 2, validation: { required: true } },
      { id: "consent_term", label: "Срок действия согласия", type: "text", defaultValue: "", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "", category: "notary" },
    ],
    
  },
{
    id: "guardianship-agreement",
    name: "Договор с опекуном (попечителем)",
    category: "family",
    actSource: "ФЗ-48 «Об опеке и попечительстве», СК РФ",
    lastUpdated: "Август 2026",
    description: "Предварительный договор об осуществлении опеки или попечительства (назначение опекуна над ребёнком или недееспособным лицом).",
    suggestedDocs: ["alimony-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "authority_name", label: "Орган опеки", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "authority_inn", label: "ИНН органа (если юрлицо)", type: "text", defaultValue: "", category: "other" },
      { id: "authority_addr", label: "Адрес органа опеки", type: "text", defaultValue: "", category: "other" },
      { id: "guardian_fio", label: "ФИО опекуна", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "guardian_passport", label: "Паспорт опекуна", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "guardian_addr", label: "Адрес опекуна", type: "text", defaultValue: "", category: "other" },
      { id: "ward_fio", label: "ФИО подопечного", type: "text", defaultValue: "", category: "child", validation: { required: true } },
      { id: "ward_birth", label: "Дата рождения подопечного", type: "date", defaultValue: "", category: "child", validation: { required: true } },
      { id: "basis", label: "Основание назначения", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term_start", label: "Дата начала", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания", type: "date", defaultValue: "", category: "contract" },
      { id: "payment", label: "Вознаграждение опекуна", type: "text", defaultValue: "", category: "payment" },
      { id: "duties", label: "Обязанности опекуна", type: "textarea", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "spouse-consent-pledge",
    name: "Согласие супруга на залог имущества",
    category: "family",
    actSource: "ст. 35 СК РФ",
    lastUpdated: "Август 2026",
    description: "Нотариальное согласие супруга на передачу общего имущества в залог (квартира, автомобиль, доля).",
    suggestedDocs: ["pledge-agreement","spouse-consent-sell"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "consenting_fio", label: "ФИО супруга, дающего согласие", type: "text", defaultValue: "", category: "spouse1", validation: { required: true } },
      { id: "consenting_passport", label: "Паспорт супруга", type: "text", defaultValue: "", category: "spouse1", validation: { required: true } },
      { id: "consenting_addr", label: "Адрес супруга", type: "text", defaultValue: "", category: "spouse1" },
      { id: "spouse_fio", label: "ФИО супруга-залогодателя", type: "text", defaultValue: "", category: "spouse2", validation: { required: true } },
      { id: "spouse_passport", label: "Паспорт супруга-залогодателя", type: "text", defaultValue: "", category: "spouse2", validation: { required: true } },
      { id: "spouse_addr", label: "Адрес супруга-залогодателя", type: "text", defaultValue: "", category: "spouse2" },
      { id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "", category: "family", validation: { required: true } },
      { id: "marriage_cert", label: "Свидетельство о браке", type: "text", defaultValue: "", category: "family", validation: { required: true } },
      { id: "property", label: "Имущество", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "secured_debt", label: "Обеспечиваемое обязательство", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "pledgee", label: "Залогодержатель", type: "text", defaultValue: "", category: "other", validation: { required: true } },
    ],
    
  },
{
    id: "pension-app",
    name: "Заявление о назначении пенсии",
    category: "family",
    actSource: "ФЗ-400 «О страховых пенсиях»",
    lastUpdated: "Август 2026",
    description: "Заявление в Социальный фонд России (СФР) о назначении страховой пенсии по старости, инвалидности или по случаю потери кормильца.",
    suggestedDocs: ["passport-intl-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sfr_office", label: "Отделение СФР", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "phone", label: "Телефон", type: "text", defaultValue: "", category: "applicant" },
      { id: "pension_type", label: "Вид пенсии", type: "select", defaultValue: "страховая по старости", category: "contract", options: [ { label: "Страховая по старости", value: "страховая по старости" }, { label: "Страховая по инвалидности", value: "страховая по инвалидности" }, { label: "По случаю потери кормильца", value: "по случаю потери кормильца" }, { label: "Социальная", value: "социальная" } ], validation: { required: true } },
      { id: "work_experience", label: "Страховой стаж (лет)", type: "number", defaultValue: "", category: "applicant" },
      { id: "ipc", label: "ИПК (баллы)", type: "number", defaultValue: "", category: "applicant" },
      { id: "app_date", label: "Дата обращения", type: "date", defaultValue: "", category: "contract" },
      { id: "delivery_method", label: "Способ доставки", type: "select", defaultValue: "на банковский счёт", category: "contract", options: [ { label: "На банковский счёт", value: "на банковский счёт" }, { label: "Через Почту России", value: "через Почту России" }, { label: "Через организацию", value: "через организацию" } ] },
    ],
    
  },
{
    id: "maternity-payment-app",
    name: "Заявление на выплату пособия (декретные)",
    category: "family",
    actSource: "ФЗ-255, ФЗ-81 «О государственных пособиях»",
    lastUpdated: "Август 2026",
    description: "Заявление о назначении пособия по беременности и родам или единовременного пособия при рождении ребёнка.",
    suggestedDocs: [],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "employer_name", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "benefit_type", label: "Вид пособия", type: "select", defaultValue: "по беременности и родам", category: "contract", options: [ { label: "По беременности и родам", value: "по беременности и родам" }, { label: "При рождении ребёнка", value: "при рождении ребёнка" }, { label: "По уходу до 1,5 лет", value: "по уходу до 1,5 лет" }, { label: "Ежемесячное на ребёнка", value: "ежемесячное на ребёнка" } ], validation: { required: true } },
      { id: "sick_list", label: "Листок нетрудоспособности", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "maternity_start", label: "Дата начала отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "maternity_end", label: "Дата окончания отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "bank_details", label: "Реквизиты для перечисления", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "child_birth", label: "Дата рождения ребёнка (для пособия при рождении)", type: "date", defaultValue: "", category: "child" },
      { id: "app_date", label: "Дата заявления", type: "date", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "family-budget-note",
    name: "Соглашение о порядке несения семейных расходов",
    category: "family",
    actSource: "ст. 42, 256 СК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение супругов о порядке несения общих расходов (содержание жилья, детей, образование) и распределении семейного бюджета.",
    suggestedDocs: ["marriage-contract","alimony-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "husband_fio", label: "ФИО супруга", type: "text", defaultValue: "", category: "spouse1", validation: { required: true } },
      { id: "husband_passport", label: "Паспорт супруга", type: "text", defaultValue: "", category: "spouse1", validation: { required: true } },
      { id: "husband_addr", label: "Адрес супруга", type: "text", defaultValue: "", category: "spouse1" },
      { id: "wife_fio", label: "ФИО супруги", type: "text", defaultValue: "", category: "spouse2", validation: { required: true } },
      { id: "wife_passport", label: "Паспорт супруги", type: "text", defaultValue: "", category: "spouse2", validation: { required: true } },
      { id: "wife_addr", label: "Адрес супруги", type: "text", defaultValue: "", category: "spouse2" },
      { id: "expenses_list", label: "Общие расходы", type: "textarea", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "split", label: "Распределение", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "household_duty", label: "Ведение хозяйства", type: "text", defaultValue: "", category: "family" },
      { id: "savings", label: "Накопления", type: "text", defaultValue: "", category: "payment" },
      { id: "term_end", label: "Срок действия (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "maternity-capital-app",
    name: "Заявление о распоряжении материнским капиталом",
    category: "family",
    actSource: "ФЗ № 256-ФЗ «О дополнительных мерах государственной поддержки семей»",
    lastUpdated: "Август 2026",
    description: "Заявление о распоряжении средствами материнского (семейного) капитала: улучшение жилищных условий, образование, пособие.",
    suggestedDocs: ["maternity-payment-app","pension-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "certificate", label: "Сертификат МСК", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "direction", label: "Направление средств", type: "select", defaultValue: "улучшение жилищных условий", category: "contract", options: [ { label: "Улучшение жилищных условий", value: "улучшение жилищных условий" }, { label: "Образование ребёнка", value: "образование ребёнка" }, { label: "Ежемесячная выплата", value: "ежемесячная выплата" }, { label: "Социальная адаптация детей-инвалидов", value: "социальная адаптация детей-инвалидов" } ], validation: { required: true } },
      { id: "amount", label: "Сумма (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "purpose_details", label: "Цель использования", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "children", label: "Дети", type: "text", defaultValue: "", category: "child", validation: { required: true } },
    ],
    
  },
{
    id: "adoption-consent",
    name: "Согласие на усыновление (удочерение) ребёнка",
    category: "family",
    actSource: "ст. 129-131 СК РФ",
    lastUpdated: "Август 2026",
    description: "Согласие родителя на усыновление (удочерение) ребёнка, оформляемое в органе опеки или у нотариуса.",
    suggestedDocs: ["guardianship-agreement","alimony-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО родителя", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "child", label: "Ребёнок", type: "text", defaultValue: "", category: "child", validation: { required: true } },
      { id: "adopter", label: "Усыновитель", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "consent_type", label: "Вид согласия", type: "text", defaultValue: "", category: "contract" },
    ],
    
  }
];
