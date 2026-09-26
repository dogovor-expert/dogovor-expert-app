import type { LegalTemplate } from "../types";

export const TEMPLATES_OTHER: LegalTemplate[] = [
{
    id: "passport-intl-app",
    name: "Заявление на загранпаспорт (нового образца)",
    category: "other",
    actSource: "Приказ ФМС России от 26.03.2014 № 211",
    lastUpdated: "Июнь 2026",
    description:
      "Заявление на получение загранпаспорта нового поколения (биометрического) через ГУВМ МВД.",
    suggestedDocs: [],
    printInstruction: "Печатать на одном листе А4 с двух сторон",
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },      {
        id: "department", label: "Наименование подразделения", type: "text",
        defaultValue: "", category: "contract",
        validation: { required: true },
      },
      {
        id: "fio", label: "ФИО заявителя", type: "text", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "birthday", label: "Дата рождения", type: "date", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "birthplace", label: "Место рождения", type: "text", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "gender", label: "Пол", type: "radio", defaultValue: "М", category: "applicant",
        options: ["М", "Ж"],
      },
      {
        id: "citizenship", label: "Гражданство", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "passport_series", label: "Паспорт (Серия)", type: "text", defaultValue: "",
        category: "applicant", validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "passport_number", label: "Паспорт (Номер)", type: "text", defaultValue: "",
        category: "applicant", validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "passport_date", label: "Дата выдачи паспорта", type: "date", defaultValue: "",
        category: "applicant",
      },
      {
        id: "passport_issued_by", label: "Кем выдан паспорт", type: "text",
        defaultValue: "", category: "applicant",
      },
      {
        id: "registration_address", label: "Адрес регистрации", type: "text",
        defaultValue: "", category: "applicant",
        validation: { required: true },
      },
      {
        id: "phone", label: "Телефон", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "has_old_passport", label: "Есть действующий загранпаспорт", type: "checkbox",
        defaultValue: "false", category: "applicant",
      },
      {
        id: "old_passport_info", label: "Данные старого загранпаспорта", type: "text",
        defaultValue: "", category: "applicant",
        dependsOn: { fieldId: "has_old_passport", value: "true" },
      },
      {
        id: "purpose", label: "Цель получения", type: "select", defaultValue: "Частные",
        category: "contract",
        options: ["Частные", "Служебные", "Туризм", "Лечение", "Визит к родственникам"],
      },
    ],
    
  },
{
    id: "inn-application",
    name: "Заявление на получение ИНН",
    category: "other",
    actSource: "ст. 83 НК РФ, Приказ ФНС от 11.08.2011 ЯМВ-3-9/306@",
    lastUpdated: "Июнь 2026",
    description:
      "Заявление физического лица для постановки на учёт и получения ИНН (свидетельства о присвоении ИНН).",
    suggestedDocs: [],
    printInstruction: "Печатать на одном листе А4",
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },      {
        id: "department", label: "Наименование ИФНС", type: "text",
        defaultValue: "", category: "contract",
        validation: { required: true },
      },
      {
        id: "fio", label: "ФИО заявителя", type: "text", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "birthday", label: "Дата рождения", type: "date", defaultValue: "",
        category: "applicant", validation: { required: true },
      },
      {
        id: "birthplace", label: "Место рождения", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "citizenship", label: "Гражданство", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "passport_series", label: "Паспорт (Серия)", type: "text", defaultValue: "",
        category: "applicant", validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "passport_number", label: "Паспорт (Номер)", type: "text", defaultValue: "",
        category: "applicant", validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "passport_date", label: "Дата выдачи паспорта", type: "date", defaultValue: "",
        category: "applicant",
      },
      {
        id: "passport_issued_by", label: "Кем выдан", type: "text",
        defaultValue: "", category: "applicant",
      },
      {
        id: "registration_address", label: "Адрес регистрации", type: "text",
        defaultValue: "", category: "applicant",
        validation: { required: true },
      },
      {
        id: "phone", label: "Телефон", type: "text", defaultValue: "",
        category: "applicant",
      },
      {
        id: "email", label: "Email", type: "text", defaultValue: "", category: "applicant",
      },
    ],
    
  },
{
    id: "storage-agreement",
    name: "Договор хранения",
    category: "other",
    actSource: "ст. 886–926 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Хранение движимого имущества (мебели, бытовой техники, авто) физическим лицом или компанией.",
    suggestedDocs: ["raspiska-money"],
    printInstruction: "Печатать в 2-х экземплярах",
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
        id: "depositor_fio", label: "ФИО Поклажедателя", type: "text",
        defaultValue: "", category: "sender", validation: { required: true },
      },
      {
        id: "depositor_passport", label: "Паспорт Поклажедателя", type: "text",
        defaultValue: "", category: "sender",
      },
      {
        id: "keeper_fio", label: "ФИО Хранителя", type: "text",
        defaultValue: "", category: "recipient", validation: { required: true },
      },
      {
        id: "keeper_passport", label: "Паспорт Хранителя", type: "text",
        defaultValue: "", category: "recipient",
      },
      {
        id: "item_description", label: "Передаваемое имущество", type: "textarea", rows: 4,
        defaultValue: "",
        category: "items", validation: { required: true },
      },
      {
        id: "storage_address", label: "Адрес хранения", type: "text",
        defaultValue: "", category: "contract",
      },
      {
        id: "storage_start", label: "Начало хранения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "storage_end", label: "Окончание хранения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "storage_price", label: "Вознаграждение за месяц (руб., 0 — безвозмездно)", type: "number",
        defaultValue: "", category: "payment",
      },
      {
        id: "liability", label: "Ответственность Хранителя", type: "select",
        options: [
          { label: "В размере стоимости утраченного имущества", value: "В размере стоимости утраченного имущества" },
          { label: "В пределах фактического ущерба (не оценки)", value: "В пределах фактического ущерба (не оценки)" },
        ],
        defaultValue: "В размере стоимости утраченного имущества", category: "contract",
      },
    ],
    
  },
{
    id: "transport-agreement",
    name: "Договор перевозки груза",
    category: "other",
    actSource: "ст. 784–800 ГК РФ, Устав автомобильного транспорта",
    lastUpdated: "Июль 2026",
    description:
      "Перевозка груза автомобильным транспортом: маршрут, сроки, стоимость, ответственность перевозчика.",
    suggestedDocs: ["invoice", "raspiska-money"],
    printInstruction: "Печатать в 2-х экземплярах, оформить товарно-транспортную накладную",
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
        id: "shipper_company", label: "Наименование Отправителя", type: "text",
        defaultValue: "", category: "sender", validation: { required: true },
      },
      {
        id: "shipper_inn", label: "ИНН Отправителя", type: "text", defaultValue: "",
        category: "sender",
      },
      {
        id: "shipper_director", label: "Директор Отправителя", type: "text",
        defaultValue: "", category: "sender",
      },
      {
        id: "carrier_company", label: "Наименование Перевозчика", type: "text",
        defaultValue: "", category: "recipient", validation: { required: true },
      },
      {
        id: "carrier_inn", label: "ИНН Перевозчика", type: "text", defaultValue: "",
        category: "recipient",
      },
      {
        id: "carrier_director", label: "Директор Перевозчика", type: "text",
        defaultValue: "", category: "recipient",
      },
      {
        id: "cargo_description", label: "Описание груза", type: "textarea", rows: 3,
        defaultValue: "",
        category: "items", validation: { required: true },
      },
      {
        id: "route_from", label: "Пункт отправления", type: "text", defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "route_to", label: "Пункт назначения", type: "text", defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "loading_date", label: "Дата погрузки", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "delivery_date", label: "Срок доставки", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "freight_cost", label: "Стоимость перевозки (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "carrier_type", label: "Транспорт", type: "select",
        options: [
          { label: "Тентованная фура (20 т)", value: "Тентованная фура (20 т)" },
          { label: "Газель (1,5 т)", value: "Газель (1,5 т)" },
          { label: "Рефрижератор (20 т)", value: "Рефрижератор (20 т)" },
        ],
        defaultValue: "Тентованная фура (20 т)", category: "object",
      },
      {
        id: "compensation_note", label: "Компенсация при утрате груза", type: "text",
        defaultValue: "",
        category: "payment",
      },
    ],
    
  },
{
    id: "power-of-attorney-docs",
    name: "Доверенность на получение документов",
    category: "other",
    actSource: "ст. 185–189 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Доверенность на получение готовых документов (справок, свидетельств, удостоверений) в организациях.",
    suggestedDocs: [],
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата выдачи", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "principal_fio", label: "ФИО доверителя", type: "text", defaultValue: "",
        category: "owner", validation: { required: true },
      },
      {
        id: "principal_passport", label: "Паспорт доверителя (серия №)", type: "text",
        defaultValue: "", category: "owner",
      },
      {
        id: "principal_address", label: "Адрес регистрации доверителя", type: "text",
        defaultValue: "", category: "owner",
      },
      {
        id: "agent_fio", label: "ФИО представителя", type: "text", defaultValue: "",
        category: "representative", validation: { required: true },
      },
      {
        id: "agent_passport", label: "Паспорт представителя (серия №)", type: "text",
        defaultValue: "", category: "representative",
      },
      {
        id: "agent_address", label: "Адрес регистрации представителя", type: "text",
        defaultValue: "", category: "representative",
      },
      {
        id: "org_name", label: "Наименование организации", type: "text", defaultValue: "",
        category: "recipient", validation: { required: true },
      },
      {
        id: "docs_list", label: "Какие документы получать", type: "textarea", rows: 3,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "valid_until", label: "Действительна до", type: "date", defaultValue: "",
        category: "contract",
        hint: "ст. 186 ГК РФ: срок доверенности не может превышать 3 года; если срок не указан — доверенность действует 1 год",
      },
      {
        id: "has_substitution", label: "Право передоверия", type: "checkbox", defaultValue: "false",
        category: "contract",
      },
    ],
    
  },
{
    id: "privacy-policy",
    name: "Политика конфиденциальности",
    category: "other",
    actSource: "ст. 3, 9 ФЗ-152 «О персональных данных»",
    lastUpdated: "Август 2026",
    description: "Политика обработки персональных данных для сайта или интернет-сервиса.",
    suggestedDocs: ["Публичная оферта", "Согласие на обработку персональных данных"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "operator_name", label: "Оператор", type: "text", defaultValue: "", category: "executor" },
      { id: "site_url", label: "Сайт", type: "text", defaultValue: "", category: "contract" },
      { id: "pd_types", label: "Состав персональных данных", type: "text", defaultValue: "", category: "contract" },
      { id: "pd_purpose", label: "Цели обработки", type: "text", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "equipment-lease",
    name: "Договор аренды спецтехники/оборудования",
    category: "other",
    actSource: "ст. 632-649 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды спецтехники или оборудования: с экипажем (ст. 632-641) или без экипажа (ст. 642-649 ГК РФ), арендная плата, порядок передачи и возврата.",
    suggestedDocs: ["act-transfer-auto", "raspiska-money"],
    printInstruction: "Печать на листе А4; состояние техники при передаче и возврате фиксируется актами",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "lessor_fio", label: "Арендодатель (ФИО/компания)", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessee_fio", label: "Арендатор (ФИО/компания)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "lessee_inn", label: "ИНН арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "equipment_desc", label: "Описание техники/оборудования", type: "textarea", defaultValue: "", category: "object", rows: 2, validation: { required: true } },
      { id: "crew_type", label: "Условие об экипаже", type: "select", defaultValue: "без экипажа", category: "object", options: [
        { label: "Без экипажа (ст. 642-649 ГК)", value: "без экипажа" },
        { label: "С экипажем (ст. 632-641 ГК)", value: "с экипажем" },
      ] },
      { id: "rent_price", label: "Арендная плата", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "fuel_by", label: "ГСМ и расходные материалы за счёт", type: "select", defaultValue: "Арендатора", category: "payment", options: [
        { label: "Арендатора", value: "Арендатора" },
        { label: "Арендодателя", value: "Арендодателя" },
      ] },
      { id: "start_date", label: "Дата передачи техники", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Дата возврата", type: "date", defaultValue: "", category: "contract" },
      { id: "use_purpose", label: "Цель использования", type: "text", defaultValue: "", category: "items" },
      { id: "penalty", label: "Неустойка за просрочку оплаты", type: "text", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "transport-expedition",
    name: "Договор транспортной экспедиции",
    category: "other",
    actSource: "ст. 801-806 ГК РФ, ФЗ-87",
    lastUpdated: "Август 2026",
    description: "Договор транспортной экспедиции: экспедитор организует перевозку груза, оформляет документы, несёт ответственность за утрату и повреждение груза (ст. 803 ГК РФ).",
    suggestedDocs: ["transport-agreement", "act-services", "invoice"],
    printInstruction: "Печать на листе А4; поручение экспедитору и экспедиторская расписка оформляются как приложения",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "forwarder_company", label: "Экспедитор", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "forwarder_inn", label: "ИНН экспедитора", type: "text", defaultValue: "", category: "executor" },
      { id: "client_company", label: "Клиент", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_inn", label: "ИНН клиента", type: "text", defaultValue: "", category: "customer" },
      { id: "cargo_desc", label: "Описание груза", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "route", label: "Маршрут перевозки", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "delivery_date", label: "Срок доставки", type: "date", defaultValue: "", category: "contract" },
      { id: "freight_cost", label: "Стоимость экспедирования (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "cargo_value", label: "Объявленная стоимость груза (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "insurance", label: "Страхование груза", type: "text", defaultValue: "", category: "other" },
    ],
    
  },
{
    id: "waste-removal",
    name: "Договор на вывоз ТКО",
    category: "other",
    actSource: "ФЗ-89, ПП РФ № 1156",
    lastUpdated: "Август 2026",
    description: "Договор на оказание услуг по обращению с твёрдыми коммунальными отходами с региональным оператором: объём и периодичность вывоза, порядок расчётов, перерасчёт при неоказании.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; объём и периодичность вывоза оформляются приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "operator_company", label: "Региональный оператор", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "operator_inn", label: "ИНН оператора", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Потребитель", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН потребителя", type: "text", defaultValue: "", category: "customer" },
      { id: "object_address", label: "Адрес объекта", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "volume", label: "Объём накопления ТКО", type: "text", defaultValue: "", category: "items" },
      { id: "rate", label: "Тариф (руб./м³ или руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_terms", label: "Порядок расчётов", type: "text", defaultValue: "", category: "payment" },
      { id: "start_date", label: "Начало оказания услуг", type: "date", defaultValue: "", category: "contract" },
      { id: "contract_type", label: "Тип договора", type: "select", defaultValue: "публичный (типовой)", category: "contract", options: [
        { label: "Публичный (типовой)", value: "публичный (типовой)" },
        { label: "Индивидуальный", value: "индивидуальный" },
      ] },
    ],
    
  },
{
    id: "passport-replace-app",
    name: "Заявление на замену паспорта РФ",
    category: "other",
    actSource: "ПП РФ № 828, админрегламент МВД",
    lastUpdated: "Август 2026",
    description: "Заявление о замене паспорта гражданина РФ: причина замены, данные заявителя, прилагаемые документы. Госпошлина: 300 руб. (замена), 1500 руб. (взамен утраченного/испорченного).",
    suggestedDocs: [],
    printInstruction: "Печать на листе А4; подаётся в МВД в течение 90 дней со дня наступления основания (иначе штраф по ст. 19.15 КоАП); прилагаются 2 фото 35×45 мм и квитанция об оплате госпошлины",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата подачи", type: "date", defaultValue: "", category: "contract" },
      { id: "applicant_fio", label: "Заявитель (ФИО)", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birthday", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant" },
      { id: "applicant_birthplace", label: "Место рождения", type: "text", defaultValue: "", category: "applicant" },
      { id: "applicant_address", label: "Адрес регистрации", type: "text", defaultValue: "", category: "applicant" },
      { id: "old_passport", label: "Заменяемый паспорт", type: "text", defaultValue: "", category: "other" },
      { id: "replace_reason", label: "Причина замены", type: "select", defaultValue: "достижение 45 лет", category: "other", options: [
        { label: "Достижение 45 лет", value: "достижение 45 лет" },
        { label: "Достижение 20 лет", value: "достижение 20 лет" },
        { label: "Смена фамилии, имени, отчества", value: "смена фамилии, имени, отчества" },
        { label: "Утрата (похищение) паспорта", value: "утрата (похищение) паспорта" },
        { label: "Порча паспорта", value: "порча паспорта" },
        { label: "Изменение внешности / иные причины", value: "изменение внешности, иные причины" },
      ] },
      { id: "fee", label: "Госпошлина (руб.)", type: "select", defaultValue: "300", category: "payment", options: [
        { label: "300 руб. — замена", value: "300" },
        { label: "1500 руб. — взамен утраченного/испорченного", value: "1500" },
      ] },
      { id: "attach_docs", label: "Прилагаемые документы", type: "textarea", defaultValue: "", category: "other", rows: 2 },
    ],
    
  },
{
    id: "tax-deduction-app",
    name: "Заявление на налоговый вычет (3-НДФЛ)",
    category: "other",
    actSource: "ст. 220 НК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление в ФНС о возврате НДФЛ в связи с имущественным налоговым вычетом (при покупке жилья, проценты по ипотеке). Подаётся с декларацией 3-НДФЛ (ст. 220 НК РФ).",
    suggestedDocs: ["dkp-flat"],
    printInstruction: "Печать на листе А4; подаётся в ФНС с декларацией 3-НДФЛ, договором, платёжными документами и справкой о доходах; срок возврата — до 3 месяцев",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата заявления", type: "date", defaultValue: "", category: "contract" },
      { id: "tax_office", label: "Налоговый орган", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "applicant_fio", label: "Заявитель (ФИО)", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_inn", label: "ИНН", type: "text", defaultValue: "", category: "applicant" },
      { id: "applicant_passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant" },
      { id: "applicant_address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "tax_year", label: "Налоговый период (год)", type: "text", defaultValue: "", category: "contract" },
      { id: "deduction_base", label: "Основание вычета", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "deduction_amount", label: "Сумма вычета (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "refund_amount", label: "Сумма к возврату (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "bank_details", label: "Банковские реквизиты для возврата", type: "textarea", defaultValue: "", category: "payment", rows: 2 },
      { id: "attachments", label: "Приложения", type: "text", defaultValue: "", category: "other" },
    ],
    
  },
{
    id: "guarantee-letter",
    name: "Гарантийное письмо",
    category: "other",
    actSource: "ст. 160, 368-377 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Гарантийное письмо организации об оплате товаров, работ или услуг в установленный срок с обязательством исполнения.",
    suggestedDocs: ["claim-generic","invoice"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "Организация / ФИО", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "recipient", label: "Кому", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "guarantee_subject", label: "Предмет гарантии", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "amount", label: "Сумма (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "amount_words", label: "Сумма прописью", type: "text", defaultValue: "", category: "payment" },
      { id: "deadline", label: "Срок оплаты", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "bank_details", label: "Реквизиты", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
    ],
    
  },
{
    id: "self-employed-registration",
    name: "Заявление о постановке на учёт самозанятого",
    category: "other",
    actSource: "ФЗ № 422-ФЗ «О проведении эксперимента по установлению специального налогового режима НПД»",
    lastUpdated: "Август 2026",
    description: "Заявление о постановке на учёт в качестве налогоплательщика налога на профессиональный доход (самозанятого).",
    suggestedDocs: ["inn-application","tax-deduction-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "inn", label: "ИНН", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "phone", label: "Телефон", type: "text", defaultValue: "", category: "applicant" },
      { id: "activity", label: "Вид деятельности", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "registration_region", label: "Регион постановки на учёт", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "reg_method", label: "Способ постановки на учёт", type: "text", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "ip-registration",
    name: "Заявление о регистрации в качестве ИП",
    category: "other",
    actSource: "ФЗ № 129-ФЗ «О государственной регистрации юридических лиц и индивидуальных предпринимателей», форма Р21001",
    lastUpdated: "Август 2026",
    description: "Заявление о государственной регистрации физического лица в качестве индивидуального предпринимателя (форма Р21001).",
    suggestedDocs: ["inn-application","self-employed-registration"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "inn", label: "ИНН", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес регистрации", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "phone", label: "Телефон", type: "text", defaultValue: "", category: "applicant" },
      { id: "activity", label: "Основной вид деятельности (код ОКВЭД)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "tax_system", label: "Налоговый режим", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "submission", label: "Способ подачи", type: "text", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "personal-data-consent",
    name: "Согласие на обработку персональных данных",
    category: "other",
    actSource: "ст. 9 ФЗ № 152-ФЗ «О персональных данных»",
    lastUpdated: "Август 2026",
    description: "Согласие на обработку персональных данных: перечень данных, цели обработки, срок действия, порядок отзыва.",
    suggestedDocs: ["privacy-policy","resignation-letter"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО субъекта ПДн", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "", category: "applicant" },
      { id: "operator", label: "Оператор", type: "text", defaultValue: "", category: "other", validation: { required: true } },
      { id: "purpose", label: "Цели обработки", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "data_list", label: "Перечень данных", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term", label: "Срок действия", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "transfer", label: "Передача третьим лицам", type: "text", defaultValue: "", category: "contract" },
    ],
    
  },
{
    id: "resignation-letter",
    name: "Заявление об увольнении по собственному желанию",
    seoTitle: "Заявление об увольнении по собственному желанию, 2026",
    category: "other",
    actSource: "ст. 80 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление работника об увольнении по собственному желанию с указанием даты и оснований (отработка 2 недели).",
    suggestedDocs: ["employment-contract","transfer-order-t5"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "applicant", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employer", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "last_day", label: "Дата увольнения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "reason", label: "Причина", type: "text", defaultValue: "", category: "contract" },
      { id: "workout", label: "Отработка", type: "text", defaultValue: "", category: "contract" },
    ],
    
  }
];
