// Сгенерировано scripts/generate-templates-meta.mts — НЕ редактировать вручную.
// Лёгкий индекс шаблонов для клиентских компонентов (поиск, каталог, главная).
// Полные данные (fields, previewTemplate) — в src/data/templates/*.ts.

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  actSource: string;
  lastUpdated: string;
  suggestedDocs: string[];
  fieldCount: number;
  kind?: "contract" | "statement";
  formKind?: "official" | "free";
  statementGroup?: string;
}

export const TEMPLATE_META: TemplateMeta[] = [
  {
    "id": "dkp-auto",
    "name": "Договор купли-продажи автомобиля (ДКП)",
    "category": "auto",
    "description": "Полный договор купли-продажи транспортного средства для физических лиц, ИП и юридических лиц: статусы сторон, пробег, техническое состояние, обременения, согласие супруга, порядок оплаты и передачи, ответственность. Составляется в 3-х экземплярах.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Апрель 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "gibdd-reg-app",
      "power-of-attorney-auto"
    ],
    "fieldCount": 82
  },
  {
    "id": "act-transfer-auto",
    "name": "Акт приёма-передачи транспортного средства",
    "category": "auto",
    "description": "Акт подтверждает фактическую передачу автомобиля от продавца покупателю, а также отсутствие взаимных претензий.",
    "actSource": "Приложение к договору купли-продажи ТС",
    "lastUpdated": "Январь 2026",
    "suggestedDocs": [
      "dkp-auto",
      "raspiska-money"
    ],
    "fieldCount": 10
  },
  {
    "id": "gibdd-reg-app",
    "name": "Заявление на регистрацию ТС в ГИБДД",
    "category": "auto",
    "description": "Официальный бланк заявления для подачи в ГИБДД (МРЭО) на постановку автомобиля на учёт, внесение изменений или прекращение регистрации.",
    "actSource": "Приказ МВД России № 950",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 63
  },
  {
    "id": "rental-auto",
    "name": "Договор аренды автомобиля",
    "category": "auto",
    "description": "Договор проката (аренды) транспортного средства между физическими лицами без экипажа.",
    "actSource": "ст. 632 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "dkp-auto"
    ],
    "fieldCount": 14
  },
  {
    "id": "power-of-attorney-auto",
    "name": "Доверенность на управление ТС",
    "category": "auto",
    "description": "Доверенность на право управления, распоряжения транспортным средством и прохождения регистрационных действий.",
    "actSource": "ст. 185–189 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "dkp-auto",
      "gibdd-reg-app"
    ],
    "fieldCount": 17
  },
  {
    "id": "auto-lease",
    "name": "Договор аренды автомобиля между физическими лицами (без экипажа)",
    "category": "auto",
    "description": "Аренда легкового автомобиля между физическими лицами без предоставления услуг по управлению.",
    "actSource": "ст. 642–649 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "rental-auto",
      "raspiska-money"
    ],
    "fieldCount": 17
  },
  {
    "id": "car-installment",
    "name": "Купля-продажа авто в рассрочку",
    "category": "auto",
    "description": "ДКП автомобиля с оплатой в рассрочку: первоначальный взнос, ежемесячные платежи, неустойка.",
    "actSource": "ст. 454–491 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "dkp-auto",
      "raspiska-money",
      "spouse-consent-sell"
    ],
    "fieldCount": 17
  },
  {
    "id": "power-of-attorney-car",
    "name": "Доверенность на управление и распоряжение автомобилем",
    "category": "auto",
    "description": "Доверенность на право управления ТС, подписи в ГИБДД, получения страхового возмещения и постановки на учёт.",
    "actSource": "ст. 185 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto"
    ],
    "fieldCount": 16
  },
  {
    "id": "gift-car",
    "name": "Договор дарения автомобиля",
    "category": "auto",
    "description": "Договор дарения транспортного средства: безвозмездная передача автомобиля, переоформление в ГИБДД.",
    "actSource": "ст. 572-581 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 12
  },
  {
    "id": "towing-services",
    "name": "Договор на эвакуацию транспортного средства",
    "category": "auto",
    "description": "Договор на услуги эвакуатора: марка и госномер ТС, точка эвакуации и пункт доставки, тариф, фиксация состояния ТС, ответственность за повреждения.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 12
  },
  {
    "id": "car-lease-buyout",
    "name": "Договор аренды автомобиля с правом выкупа",
    "category": "auto",
    "description": "Договор аренды автомобиля с правом последующего выкупа: арендная плата, выкупная цена, переход права собственности после оплаты (ст. 624 ГК РФ). Отличие от лизинга — продавец выбирает сам арендодатель.",
    "actSource": "ст. 624, 642-649 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "auto-lease",
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 15
  },
  {
    "id": "dkp-trailer",
    "name": "Договор купли-продажи прицепа",
    "category": "auto",
    "description": "Договор купли-продажи прицепа к легковому автомобилю: характеристики прицепа (марка, год, VIN, госномер), цена, передача. Регистрация в ГИБДД — в течение 10 дней.",
    "actSource": "ст. 454 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 13
  },
  {
    "id": "dkp-car-credit",
    "name": "Договор купли-продажи автомобиля в кредит",
    "category": "auto",
    "description": "Договор купли-продажи автомобиля с оплатой за счёт кредитных средств банка. Учитывает переход залога на авто к банку до полной оплаты.",
    "actSource": "ст. 454, 488 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "gibdd-reg-app"
    ],
    "fieldCount": 19
  },
  {
    "id": "car-rental-daily",
    "name": "Договор проката автомобиля (посуточно)",
    "category": "auto",
    "description": "Договор проката автомобиля без экипажа посуточно. Подходит для краткосрочной аренды частным лицам.",
    "actSource": "ст. 626 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "power-attorney"
    ],
    "fieldCount": 17
  },
  {
    "id": "car-lease-crew",
    "name": "Договор аренды автомобиля с экипажем",
    "category": "auto",
    "description": "Аренда автомобиля с водителем (экипажем). Услуги по управлению и технической эксплуатации оказывает арендодатель.",
    "actSource": "ст. 632 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "dkp-moto",
    "name": "Договор купли-продажи мотоцикла",
    "category": "auto",
    "description": "Договор купли-продажи мотоцикла, мопеда или мототехники между физическими лицами. Аналогичен ДКП автомобиля.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "gibdd-reg-app"
    ],
    "fieldCount": 16
  },
  {
    "id": "dkp-atv",
    "name": "Договор купли-продажи квадроцикла (снегохода)",
    "category": "auto",
    "description": "Договор купли-продажи квадроцикла, снегохода или иной внедорожной мототехники между физическими лицами.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "gibdd-reg-app"
    ],
    "fieldCount": 15
  },
  {
    "id": "car-repair",
    "name": "Договор на ремонт автомобиля (СТО)",
    "category": "auto",
    "description": "Договор на техническое обслуживание и ремонт автомобиля в автосервисе. Составляется между владельцем ТС и исполнителем (СТО).",
    "actSource": "ст. 702, 730 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "raspiska-money"
    ],
    "fieldCount": 16
  },
  {
    "id": "car-storage",
    "name": "Договор хранения автомобиля",
    "category": "auto",
    "description": "Договор хранения транспортного средства на охраняемой стоянке (платная парковка, гараж).",
    "actSource": "ст. 886 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "car-free-use",
    "name": "Договор безвозмездного пользования автомобилем",
    "category": "auto",
    "description": "Договор ссуды — передача автомобиля в безвозмездное временное пользование. Подходит для передачи авто родственникам и знакомым.",
    "actSource": "ст. 689 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto"
    ],
    "fieldCount": 13
  },
  {
    "id": "car-trade-in",
    "name": "Договор купли-продажи авто по схеме трейд-ин",
    "category": "auto",
    "description": "Договор покупки нового автомобиля с зачётом стоимости старого по схеме trade-in. Заключается между автодилером и покупателем.",
    "actSource": "ст. 454, 453 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "dkp-auto",
      "gibdd-reg-app"
    ],
    "fieldCount": 16
  },
  {
    "id": "car-commission",
    "name": "Договор комиссии на продажу автомобиля",
    "category": "auto",
    "description": "Договор комиссии: комиссионер продаёт автомобиль комитента за вознаграждение. Подходит для продажи авто через салоны и посредников.",
    "actSource": "ст. 990 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "commission-sale"
    ],
    "fieldCount": 13
  },
  {
    "id": "dkp-truck",
    "name": "Договор купли-продажи грузового автомобиля",
    "category": "auto",
    "description": "Договор купли-продажи грузового автомобиля (тягача, фургона, самосвала) между физическими лицами.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money",
      "gibdd-reg-app"
    ],
    "fieldCount": 15
  },
  {
    "id": "dkp-bus",
    "name": "Договор купли-продажи автобуса",
    "category": "auto",
    "description": "Договор купли-продажи автобуса или микроавтобуса между физическими лицами.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "dkp-watercraft",
    "name": "Договор купли-продажи гидроцикла",
    "category": "auto",
    "description": "Договор купли-продажи гидроцикла или маломерного судна, подлежащего регистрации в ГИМС.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "taxi-lease",
    "name": "Договор аренды автомобиля под такси",
    "category": "auto",
    "description": "Договор аренды автомобиля без экипажа для работы в такси с указанием требований к водителю и лицензии.",
    "actSource": "ст. 642 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 16
  },
  {
    "id": "car-leasing",
    "name": "Договор лизинга автомобиля (физлицо)",
    "category": "auto",
    "description": "Договор финансовой аренды (лизинга) легкового автомобиля для физического лица с правом выкупа.",
    "actSource": "ст. 665 ГК РФ, ФЗ-164 «О финансовой аренде (лизинге)»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 16
  },
  {
    "id": "car-relocation",
    "name": "Договор на перегон автомобиля",
    "category": "auto",
    "description": "Договор оказания услуг по перегону (доставке) автомобиля из другого города. Ответственность перегонщика за сохранность ТС.",
    "actSource": "ст. 779 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "spouse-consent-car-sale",
    "name": "Согласие супруга на продажу автомобиля",
    "category": "auto",
    "description": "Нотариальное согласие супруга(и) на продажу автомобиля, приобретённого в браке. Требуется для сделок с ТС, находящимся в совместной собственности.",
    "actSource": "ст. 35 Семейного кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "dkp-truck"
    ],
    "fieldCount": 11
  },
  {
    "id": "car-warranty-order",
    "name": "Заказ-наряд на ремонт автомобиля (СТО)",
    "category": "auto",
    "description": "Заказ-наряд на техническое обслуживание и ремонт автомобиля в автосервисе — первичный документ приёмки ТС в ремонт.",
    "actSource": "ст. 730 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "car-repair",
      "act-works",
      "raspiska-money"
    ],
    "fieldCount": 17
  },
  {
    "id": "car-selection",
    "name": "Договор на подбор автомобиля (автоподбор)",
    "category": "auto",
    "description": "Договор оказания услуг по подбору автомобиля с пробегом: проверка юридической чистоты, диагностика, торг с продавцом.",
    "actSource": "ст. 779 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 12
  },
  {
    "id": "car-buyout",
    "name": "Договор выкупа автомобиля (срочный выкуп)",
    "category": "auto",
    "description": "Договор срочного выкупа автомобиля: владелец продаёт авто с дисконтом за скорость расчёта. Расчёт в день подписания.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "car-pledge",
    "name": "Договор залога автомобиля",
    "category": "auto",
    "description": "Договор залога транспортного средства в обеспечение обязательств по займу. Уведомление о залоге регистрируется в реестре ФНС.",
    "actSource": "ст. 334 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "dkp-moped",
    "name": "Договор купли-продажи мопеда (скутера)",
    "category": "auto",
    "description": "Договор купли-продажи мопеда, скутера или электроскутера между физическими лицами.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "car-insurance-claim",
    "name": "Заявление о страховой выплате (ОСАГО/КАСКО)",
    "category": "auto",
    "description": "Заявление в страховую компанию о наступлении страхового случая по ОСАГО или КАСКО (ДТП, ущерб, угон).",
    "actSource": "ст. 11 ФЗ-40 «Об ОСАГО», ст. 961 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "spravka-gibdd"
    ],
    "fieldCount": 16
  },
  {
    "id": "car-detailing",
    "name": "Договор на детейлинг (мойку) автомобиля",
    "category": "auto",
    "description": "Договор на оказание услуг по детейлингу: мойка, полировка, химчистка, нанесение защитных покрытий.",
    "actSource": "ст. 779 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "car-equipment-install",
    "name": "Договор на установку дополнительного оборудования",
    "category": "auto",
    "description": "Договор на установку сигнализации, ГБО, тонировки, фаркопа и другого дополнительного оборудования на автомобиль.",
    "actSource": "ст. 730 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "car-repair",
      "act-works"
    ],
    "fieldCount": 14
  },
  {
    "id": "auto-condition-act",
    "name": "Акт осмотра технического состояния автомобиля",
    "category": "auto",
    "description": "Акт осмотра автомобиля при покупке б/у: фиксация пробега, кузова, двигателя, комплектации, дефектов и комплектности.",
    "actSource": "ст. 456, 469 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-auto",
      "act-transfer-auto"
    ],
    "fieldCount": 16
  },
  {
    "id": "dkp-auto-short",
    "name": "ДКП авто — Краткий (1 стр.)",
    "category": "auto",
    "description": "Краткая форма договора купли-продажи автомобиля на одной странице. Содержит только обязательные сведения: стороны, транспортное средство и цену.",
    "actSource": "ст. 454 Гражданского кодекса РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 19
  },
  {
    "id": "raspiska-money",
    "name": "Расписка в получении денежных средств",
    "category": "finance",
    "description": "Официальное письменное подтверждение того, что Продавец принял от Покупателя полную стоимость автомобиля.",
    "actSource": "ст. 162 Гражданского кодекса РФ",
    "lastUpdated": "Февраль 2026",
    "suggestedDocs": [
      "dkp-auto"
    ],
    "fieldCount": 9
  },
  {
    "id": "raspiska-generic",
    "name": "Расписка универсальная (о получении денег/товара/документов)",
    "category": "finance",
    "description": "Универсальная расписка для подтверждения получения денежных средств, товаров или документов.",
    "actSource": "ст. 162 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "dkp-auto"
    ],
    "fieldCount": 11
  },
  {
    "id": "invoice",
    "name": "Счёт на оплату",
    "category": "finance",
    "description": "Счёт на оплату товаров или услуг для юридических и физических лиц. Автоматически формирует таблицу позиций.",
    "actSource": "ст. 487 ГК РФ, НК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [],
    "fieldCount": 18
  },
  {
    "id": "loan-agreement",
    "name": "Договор займа денежных средств",
    "category": "finance",
    "description": "Договор займа между физическими лицами. При сумме более 100 000 руб. рекомендуется нотариальное заверение.",
    "actSource": "ст. 807–811 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "raspiska-generic"
    ],
    "fieldCount": 14
  },
  {
    "id": "loan-company",
    "name": "Договор займа между организациями",
    "category": "finance",
    "description": "Договор займа между юридическими лицами с процентами или на беспроцентной основе.",
    "actSource": "ст. 807–818 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "invoice",
      "guarantee-agreement"
    ],
    "fieldCount": 14
  },
  {
    "id": "guarantee-agreement",
    "name": "Договор поручительства",
    "category": "finance",
    "description": "Поручитель отвечает перед кредитором за исполнение обязательств заёмщика по договору займа.",
    "actSource": "ст. 361–367 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "loan-agreement",
      "loan-company"
    ],
    "fieldCount": 14
  },
  {
    "id": "credit-agreement",
    "name": "Кредитный договор (заёмщик — физлицо)",
    "category": "finance",
    "description": "Кредитный договор между банком (кредитором) и физическим лицом: сумма, ставка, график платежей, полная стоимость кредита.",
    "actSource": "ст. 819-821 ГК РФ, ФЗ-353 «О потребительском кредите»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "percent-loan",
    "name": "Договор процентного займа",
    "category": "finance",
    "description": "Договор займа с процентами между физлицами и/или организациями: ставка, срок, порядок возврата, проценты за просрочку.",
    "actSource": "ст. 807-818 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-contract",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "zero-loan",
    "name": "Договор беспроцентного займа",
    "category": "finance",
    "description": "Беспроцентный договор займа: возврат без процентов, распространён между родственниками, учредителем и компанией.",
    "actSource": "ст. 807-818 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-contract",
      "raspiska-money"
    ],
    "fieldCount": 9
  },
  {
    "id": "cession-contract",
    "name": "Договор уступки права требования (цессии)",
    "category": "finance",
    "description": "Договор цессии: передача права требования долга от цедента цессионарию с уведомлением должника.",
    "actSource": "ст. 382-390 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "money-return-receipt",
    "name": "Расписка о возврате денежных средств",
    "category": "finance",
    "description": "Расписка займодавца о получении денежных средств в счёт возврата долга: подтверждение исполнения обязательства.",
    "actSource": "ст. 408, 810 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "loan-contract"
    ],
    "fieldCount": 9
  },
  {
    "id": "loan-individuals",
    "name": "Договор займа между физическими лицами",
    "category": "finance",
    "description": "Договор займа денежных средств между двумя физическими лицами.",
    "actSource": "ст. 807-810 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор займа",
      "Расписка в получении денежных средств"
    ],
    "fieldCount": 10
  },
  {
    "id": "refuse-loan-notice",
    "name": "Уведомление об отказе от договора займа",
    "category": "finance",
    "description": "Уведомление займодавца об отказе от договора займа (досрочное истребование или отказ).",
    "actSource": "ст. 450.1, 810 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор займа",
      "Уведомление об отказе от договора (универсальное)"
    ],
    "fieldCount": 8
  },
  {
    "id": "leasing-agreement",
    "name": "Договор лизинга (финансовой аренды)",
    "category": "finance",
    "description": "Договор финансовой аренды (лизинга): лизингодатель приобретает имущество у продавца и передаёт лизингополучателю, график платежей, выкупная стоимость, страхование.",
    "actSource": "ст. 665-670 ГК РФ, ФЗ-164",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "invoice"
    ],
    "fieldCount": 14
  },
  {
    "id": "novation-agreement",
    "name": "Договор новации долга",
    "category": "finance",
    "description": "Соглашение о замене первоначального обязательства новым (новация, ст. 414 ГК РФ). Новация займа в заёмное обязательство требует письменной формы (ст. 818 ГК РФ).",
    "actSource": "ст. 414, 818 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 11
  },
  {
    "id": "compensation-agreement",
    "name": "Соглашение об отступном",
    "category": "finance",
    "description": "Соглашение о прекращении обязательства предоставлением отступного (деньги, имущество, услуги). Обязательство прекращается с момента фактического предоставления (ст. 409 ГК РФ).",
    "actSource": "ст. 409 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "act-transfer-auto"
    ],
    "fieldCount": 11
  },
  {
    "id": "donation-agreement",
    "name": "Договор пожертвования",
    "category": "finance",
    "description": "Договор пожертвования в общеполезных целях: предмет, целевое назначение, обязанность одаряемого отчитываться об использовании, отмена пожертвования (ст. 582 ГК РФ).",
    "actSource": "ст. 582 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 10
  },
  {
    "id": "mortgage-loan",
    "name": "Договор займа под залог недвижимости",
    "category": "finance",
    "description": "Договор займа с обеспечением ипотекой (залогом недвижимости): сумма, проценты, предмет залога, оценка, регистрация обременения в Росреестре (ст. 339 ГК РФ, ФЗ-102).",
    "actSource": "ст. 334-358, 339 ГК РФ, ФЗ-102",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "dkp-flat"
    ],
    "fieldCount": 13
  },
  {
    "id": "debt-restructuring",
    "name": "Соглашение о реструктуризации долга",
    "category": "finance",
    "description": "Соглашение о реструктуризации задолженности: новый график платежей, отсрочка, изменение условий по долгу.",
    "actSource": "ст. 414, 450 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-acknowledgment",
      "payment-deferral",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "payment-deferral",
    "name": "Соглашение о рассрочке (отсрочке) платежа",
    "category": "finance",
    "description": "Соглашение о рассрочке оплаты товаров, работ или услуг: стороны изменяют сроки и разбивают платеж на части.",
    "actSource": "ст. 450, 489 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-acknowledgment",
      "act-works"
    ],
    "fieldCount": 15
  },
  {
    "id": "offset-agreement",
    "name": "Соглашение о зачёте взаимных требований",
    "category": "finance",
    "description": "Соглашение о зачёте встречных однородных требований между сторонами: прекращает взаимные обязательства в части совпадающих сумм.",
    "actSource": "ст. 410 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-acknowledgment",
      "reconciliation-statement"
    ],
    "fieldCount": 13
  },
  {
    "id": "debt-acknowledgment",
    "name": "Акт сверки и признания долга",
    "category": "finance",
    "description": "Соглашение о признании долга: фиксирует размер задолженности и прерывает срок исковой давности.",
    "actSource": "ст. 203 ГК РФ (перерыв течения срока исковой давности)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-restructuring",
      "payment-deferral",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "currency-exchange",
    "name": "Договор мены валюты между физическими лицами",
    "category": "finance",
    "description": "Договор обмена валюты (рубли ↔ доллары/евро) между физическими лицами по согласованному курсу.",
    "actSource": "ст. 567 ГК РФ, ФЗ-173 «О валютном регулировании»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "bank-deposit-agreement",
    "name": "Договор банковского вклада (депозита)",
    "category": "finance",
    "description": "Договор банковского вклада: размещение денежных средств в банке под проценты с выдачей сберегательного сертификата или открытием счёта.",
    "actSource": "гл. 44 ГК РФ (ст. 834-844), ФЗ-395-1",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "loan-employee",
    "name": "Договор займа работнику организации",
    "category": "finance",
    "description": "Договор беспроцентного или процентного займа от работодателя работнику (на жильё, обучение, бытовые нужды) с удержанием из зарплаты.",
    "actSource": "ст. 807-810 ГК РФ, ТК РФ (ст. 248)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "raspiska-money"
    ],
    "fieldCount": 16
  },
  {
    "id": "pledge-agreement",
    "name": "Договор залога имущества",
    "category": "finance",
    "description": "Договор залога движимого имущества (автомобиль, техника, товары) в обеспечение исполнения обязательств.",
    "actSource": "ст. 334-356 ГК РФ, ФЗ-367",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "guarantee-agreement"
    ],
    "fieldCount": 14
  },
  {
    "id": "debt-transfer-agreement",
    "name": "Договор перевода долга",
    "category": "finance",
    "description": "Договор перевода долга: перевод обязательства должника на третье лицо с согласия кредитора.",
    "actSource": "ст. 391 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "offset-agreement",
      "cession-contract"
    ],
    "fieldCount": 16
  },
  {
    "id": "movable-pledge",
    "name": "Договор залога движимого имущества",
    "category": "finance",
    "description": "Договор залога движимого имущества (автомобиль, техника, товары в обороте) в обеспечение обязательств должника.",
    "actSource": "ст. 334-356 ГК РФ, ФЗ № 367-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "pledge-agreement",
      "car-pledge"
    ],
    "fieldCount": 14
  },
  {
    "id": "dkp-flat",
    "name": "ДКП квартиры (купля-продажа)",
    "category": "realty",
    "description": "Договор купли-продажи квартиры между физическими лицами. Оформляется в 3-х экземплярах (продавец, покупатель, Росреестр).",
    "actSource": "ст. 549–558 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "raspiska-money",
      "dsp"
    ],
    "fieldCount": 29
  },
  {
    "id": "rental-flat",
    "name": "Договор аренды квартиры",
    "category": "realty",
    "description": "Договор найма жилого помещения между физическими лицами. Рекомендуется регистрация при сроке более 1 года.",
    "actSource": "ст. 671-688 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "akt-priema-kvartiry"
    ],
    "fieldCount": 18
  },
  {
    "id": "dsp",
    "name": "Договор социального найма (приватизация)",
    "category": "realty",
    "description": "Договор передачи квартиры в собственность граждан (приватизация). Подписывается муниципалитетом и нанимателем.",
    "actSource": "ст. 60-91 ЖК РФ, Закон РФ от 04.07.1991 № 1541-1",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "dkp-flat"
    ],
    "fieldCount": 11
  },
  {
    "id": "rental-commercial",
    "name": "Договор аренды нежилого помещения",
    "category": "realty",
    "description": "Аренда офиса или нежилого помещения между арендодателем и арендатором (юрлица и ИП).",
    "actSource": "ст. 606–670 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "rental-flat"
    ],
    "fieldCount": 17
  },
  {
    "id": "exchange-agreement",
    "name": "Договор мены квартир",
    "category": "realty",
    "description": "Обмен квартирами между физическими лицами с возможной доплатой. Сделка у нотариуса.",
    "actSource": "ст. 567–571 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "dkp-flat",
      "spouse-consent-sell"
    ],
    "fieldCount": 13
  },
  {
    "id": "akt-priema-kvartiry",
    "name": "Акт приёма-передачи квартиры",
    "category": "realty",
    "description": "Акт подтверждает передачу квартиры от продавца покупателю и отсутствие взаимных претензий.",
    "actSource": "Приложение к договору купли-продажи недвижимости",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat"
    ],
    "fieldCount": 11
  },
  {
    "id": "lease-house",
    "name": "Договор аренды частного дома",
    "category": "realty",
    "description": "Аренда загородного дома или коттеджа: срок, плата, коммунальные платежи, обязанности сторон.",
    "actSource": "гл. 34 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "akt-priema-kvartiry"
    ],
    "fieldCount": 15
  },
  {
    "id": "parking-lease",
    "name": "Договор аренды машиноместа",
    "category": "realty",
    "description": "Аренда машиноместа в паркинге: номер места, плата, правила пользования паркингом.",
    "actSource": "гл. 34 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-auto"
    ],
    "fieldCount": 13
  },
  {
    "id": "realty-services",
    "name": "Договор оказания риэлторских услуг",
    "category": "realty",
    "description": "Договор с риэлтором на подбор и сопровождение сделки с недвижимостью: поиск объекта, показы, проверка документов, сопровождение сделки.",
    "actSource": "ст. 779 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services"
    ],
    "fieldCount": 14
  },
  {
    "id": "repair-contract",
    "name": "Договор подряда на ремонт квартиры",
    "category": "realty",
    "description": "Договор на выполнение ремонтно-отделочных работ в квартире: перечень работ, смета, сроки, ответственность подрядчика.",
    "actSource": "ст. 702, 740 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "contract-works"
    ],
    "fieldCount": 14
  },
  {
    "id": "dkp-nonresidential",
    "name": "Договор купли-продажи нежилого помещения",
    "category": "realty",
    "description": "Договор купли-продажи нежилого помещения (офиса, магазина, склада) с обязательной госрегистрацией перехода права.",
    "actSource": "ст. 454, 549-558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat",
      "akt-priema-kvartiry",
      "spouse-consent-sell"
    ],
    "fieldCount": 13
  },
  {
    "id": "gift-flat",
    "name": "Договор дарения квартиры",
    "category": "realty",
    "description": "Договор дарения квартиры между близкими родственниками или иными лицами с обязательной госрегистрацией перехода права.",
    "actSource": "ст. 572-581 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-agreement",
      "akt-priema-kvartiry"
    ],
    "fieldCount": 12
  },
  {
    "id": "gift-land",
    "name": "Договор дарения земельного участка",
    "category": "realty",
    "description": "Договор дарения земельного участка: категория земель, кадастровый номер, госрегистрация перехода права.",
    "actSource": "ст. 572-581 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-agreement",
      "dkp-land"
    ],
    "fieldCount": 11
  },
  {
    "id": "gift-house",
    "name": "Договор дарения жилого дома",
    "category": "realty",
    "description": "Договор дарения жилого дома с земельным участком: безвозмездная передача недвижимости с госрегистрацией.",
    "actSource": "ст. 572-581 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-agreement",
      "gift-land"
    ],
    "fieldCount": 10
  },
  {
    "id": "land-lease",
    "name": "Договор аренды земельного участка",
    "category": "realty",
    "description": "Договор аренды земельного участка: цель использования, срок, арендная плата, регистрация долгосрочной аренды.",
    "actSource": "ст. 606-625 ГК РФ, ст. 22 ЗК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-commercial",
      "dkp-land"
    ],
    "fieldCount": 14
  },
  {
    "id": "sublease",
    "name": "Договор субаренды нежилого помещения",
    "category": "realty",
    "description": "Договор субаренды нежилого помещения с согласия арендодателя: передача помещения в пользование субарендатору.",
    "actSource": "ст. 615 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-commercial",
      "rental-flat"
    ],
    "fieldCount": 13
  },
  {
    "id": "tenancy-room",
    "name": "Договор найма комнаты",
    "category": "realty",
    "description": "Договор найма комнаты в коммунальной квартире или квартире: плата, срок, права и обязанности нанимателя и наймодателя.",
    "actSource": "ст. 671-688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "akt-priema-kvartiry"
    ],
    "fieldCount": 14
  },
  {
    "id": "tenancy-house",
    "name": "Договор найма дома",
    "category": "realty",
    "description": "Договор найма жилого дома с придомовым участком: состав платы, срок, порядок расторжения.",
    "actSource": "ст. 671-688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "lease-house"
    ],
    "fieldCount": 13
  },
  {
    "id": "free-use-contract",
    "name": "Договор безвозмездного пользования имуществом (простая ссуда)",
    "category": "realty",
    "description": "Договор ссуды: ссудодатель передаёт вещь в безвозмездное временное пользование ссудополучателю.",
    "actSource": "ст. 689-701 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "rental-commercial"
    ],
    "fieldCount": 12
  },
  {
    "id": "tenancy-flat",
    "name": "Договор найма квартиры",
    "category": "realty",
    "description": "Договор найма жилого помещения между физическими лицами (наймодатель и наниматель).",
    "actSource": "ст. 671-688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор аренды квартиры",
      "Акт приёма-передачи квартиры",
      "Расписка"
    ],
    "fieldCount": 10
  },
  {
    "id": "mandate-realty-sale",
    "name": "Договор поручения на продажу недвижимости",
    "category": "realty",
    "description": "Договор поручения, по которому поверенный обязуется совершить сделки по продаже недвижимости доверителя.",
    "actSource": "ст. 971-979 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Агентский договор",
      "Договор оказания риэлторских услуг",
      "Доверенность"
    ],
    "fieldCount": 8
  },
  {
    "id": "land-acceptance-act",
    "name": "Акт приёма-передачи земельного участка (к ДКП)",
    "category": "realty",
    "description": "Акт приёма-передачи земельного участка к договору купли-продажи.",
    "actSource": "ст. 556 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "ДКП земельного участка",
      "Акт приёма-передачи квартиры"
    ],
    "fieldCount": 7
  },
  {
    "id": "ds-rent",
    "name": "Допсоглашение к договору аренды",
    "category": "realty",
    "description": "Дополнительное соглашение к договору аренды (изменение арендной платы, срока, площади).",
    "actSource": "ст. 450, 614 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор аренды квартиры",
      "Договор аренды нежилого помещения"
    ],
    "fieldCount": 7
  },
  {
    "id": "terminate-rent",
    "name": "Соглашение о расторжении договора аренды",
    "category": "realty",
    "description": "Соглашение о расторжении договора аренды по соглашению сторон.",
    "actSource": "ст. 450, 452 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор аренды квартиры",
      "Договор аренды нежилого помещения",
      "Акт приёма-передачи"
    ],
    "fieldCount": 7
  },
  {
    "id": "terminate-sublease",
    "name": "Соглашение о расторжении договора субаренды",
    "category": "realty",
    "description": "Соглашение о расторжении договора субаренды нежилого помещения по соглашению сторон.",
    "actSource": "ст. 450, 452, 615 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор субаренды нежилого помещения",
      "Договор аренды нежилого помещения"
    ],
    "fieldCount": 7
  },
  {
    "id": "preliminary-sale",
    "name": "Предварительный договор купли-продажи квартиры",
    "category": "realty",
    "description": "Предварительный договор о заключении в будущем основного договора купли-продажи квартиры с задатком или авансом (ст. 429, 380-381 ГК РФ).",
    "actSource": "ст. 429-431 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "deposit-agreement",
      "dkp-flat"
    ],
    "fieldCount": 13
  },
  {
    "id": "deposit-agreement",
    "name": "Соглашение о задатке при покупке квартиры",
    "category": "realty",
    "description": "Соглашение о задатке как обеспечении заключения основного договора купли-продажи квартиры: сумма, последствия отказа сторон (ст. 380-381 ГК РФ).",
    "actSource": "ст. 380-381 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "preliminary-sale",
      "dkp-flat"
    ],
    "fieldCount": 11
  },
  {
    "id": "rent-contract",
    "name": "Договор ренты (пожизненное содержание с иждивением)",
    "category": "realty",
    "description": "Договор ренты с пожизненным содержанием иждивенца: ежемесячные выплаты не менее двух величин прожиточного минимума, нотариальное удостоверение обязательно.",
    "actSource": "ст. 583-605 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "akt-priema-kvartiry"
    ],
    "fieldCount": 12
  },
  {
    "id": "gift-share",
    "name": "Договор дарения доли в квартире",
    "category": "realty",
    "description": "Договор дарения доли в праве собственности на квартиру. При дарении не близким родственникам подлежит нотариальному удостоверению (п. 1.1 ст. 42 ФЗ-218).",
    "actSource": "ст. 572-582 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-flat"
    ],
    "fieldCount": 12
  },
  {
    "id": "garage-lease",
    "name": "Договор аренды гаража",
    "category": "realty",
    "description": "Договор аренды гаража или машиноместа: арендная плата, коммунальные платежи, порядок передачи, ответственность за сохранность.",
    "actSource": "ст. 606-625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "parking-lease",
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "garage-sale",
    "name": "Договор купли-продажи гаража",
    "category": "realty",
    "description": "Договор купли-продажи гаража: цена, порядок расчётов, передача по акту. Для капитального гаража — госрегистрация перехода права в Росреестре (ст. 551 ГК РФ).",
    "actSource": "ст. 454-491 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "garage-lease",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "dacha-lease",
    "name": "Договор аренды дачи/садового участка",
    "category": "realty",
    "description": "Договор аренды дачи или садового участка с постройками: целевое использование, арендная плата, коммунальные платежи, порядок возврата.",
    "actSource": "ст. 606-625 ГК РФ, ст. 22 ЗК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "lease-house",
      "land-lease"
    ],
    "fieldCount": 15
  },
  {
    "id": "retail-space-lease",
    "name": "Договор аренды торгового места",
    "category": "realty",
    "description": "Аренда торгового места на рынке или в торговом центре: описание места, целевое использование, арендная плата и коммунальные платежи, срок аренды, порядок возврата.",
    "actSource": "ст. 606-625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "lease-contract",
      "act-services"
    ],
    "fieldCount": 11
  },
  {
    "id": "dkp-apartment",
    "name": "Договор купли-продажи квартиры",
    "category": "realty",
    "description": "Договор купли-продажи квартиры между физическими лицами. Требуется нотариальное удостоверение только при долевой собственности или с участием несовершеннолетних.",
    "actSource": "ст. 549-558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dogovor-zadatka",
      "akt-priema-kvartiry"
    ],
    "fieldCount": 20
  },
  {
    "id": "dkp-room",
    "name": "Договор купли-продажи комнаты",
    "category": "realty",
    "description": "Договор купли-продажи комнаты в коммунальной квартире или общежитии.",
    "actSource": "ст. 549-558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-apartment"
    ],
    "fieldCount": 16
  },
  {
    "id": "dkp-house",
    "name": "Договор купли-продажи жилого дома с земельным участком",
    "category": "realty",
    "description": "Договор купли-продажи жилого дома и земельного участка между физическими лицами.",
    "actSource": "ст. 549, 552 ГК РФ, ФЗ-218",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-land"
    ],
    "fieldCount": 18
  },
  {
    "id": "dkp-land",
    "name": "Договор купли-продажи земельного участка",
    "category": "realty",
    "description": "Договор купли-продажи земельного участка (ИЖС, СНТ, ЛПХ) между физическими лицами.",
    "actSource": "ст. 549-558 ГК РФ, ФЗ-218",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-house"
    ],
    "fieldCount": 16
  },
  {
    "id": "dogovor-zadatka",
    "name": "Договор задатка при покупке недвижимости",
    "category": "realty",
    "description": "Договор о задатке при покупке квартиры, дома или участка. Обеспечивает исполнение обязательств по основному договору купли-продажи.",
    "actSource": "ст. 380-381 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-apartment",
      "dogovor-avansa"
    ],
    "fieldCount": 15
  },
  {
    "id": "dogovor-avansa",
    "name": "Договор аванса при покупке недвижимости",
    "category": "realty",
    "description": "Соглашение о передаче аванса (в отличие от задатка аванс всегда возвращается). Обычно используется как предварительный договор с авансовым платежом.",
    "actSource": "ст. 380 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dogovor-zadatka",
      "raspiska"
    ],
    "fieldCount": 14
  },
  {
    "id": "rental-residential",
    "name": "Договор найма жилого помещения",
    "category": "realty",
    "description": "Договор найма жилого помещения (квартира, комната) между собственником и нанимателем. Безвозмездная регистрация в Росреестре не требуется, если срок до года.",
    "actSource": "ст. 671-688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dogovor-arendy-kvartiry",
      "akt-priema-kvartiry"
    ],
    "fieldCount": 19
  },
  {
    "id": "dogovor-arendy-kvartiry",
    "name": "Договор аренды квартиры (помещения)",
    "category": "realty",
    "description": "Договор аренды жилого помещения (квартиры, комнаты, апартаментов) для проживания или коммерческого использования.",
    "actSource": "ст. 606-625, 671-688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-residential",
      "akt-priema-kvartiry",
      "dogovor-zadatka"
    ],
    "fieldCount": 17
  },
  {
    "id": "rental-garage",
    "name": "Договор аренды гаража (машино-места)",
    "category": "realty",
    "description": "Договор аренды гаража, бокса или машино-места для хранения автомобиля.",
    "actSource": "ст. 606-625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dogovor-arendy-kvartiry"
    ],
    "fieldCount": 16
  },
  {
    "id": "realty-agency",
    "name": "Договор с риелтором (услуги по продаже недвижимости)",
    "category": "realty",
    "description": "Договор возмездного оказания услуг с агентством недвижимости или частным риелтором на подбор/продажу объекта.",
    "actSource": "ст. 779-783 ГК РФ, ФЗ-135 «Об оценочной деятельности»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-apartment",
      "preliminary-sale"
    ],
    "fieldCount": 15
  },
  {
    "id": "free-use-apartment",
    "name": "Договор безвозмездного пользования квартирой (ссуды)",
    "category": "realty",
    "description": "Договор безвозмездного пользования (ссуда) жилым помещением — передача квартиры в бесплатное пользование.",
    "actSource": "ст. 689-701 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-residential"
    ],
    "fieldCount": 14
  },
  {
    "id": "mortgage-rent",
    "name": "Договор аренды с правом выкупа",
    "category": "realty",
    "description": "Договор аренды жилого помещения с последующим выкупом (аренда с правом выкупа) — постепенный выкуп квартиры с зачётом арендных платежей.",
    "actSource": "ст. 624 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-residential",
      "dkp-apartment"
    ],
    "fieldCount": 16
  },
  {
    "id": "realty-option",
    "name": "Договор опциона на покупку недвижимости",
    "category": "realty",
    "description": "Опцион на заключение договора купли-продажи недвижимости — право покупателя купить объект по фиксированной цене в течение срока.",
    "actSource": "ст. 429.2, 429.3 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "preliminary-sale",
      "dkp-apartment"
    ],
    "fieldCount": 14
  },
  {
    "id": "notice-rent-termination",
    "name": "Уведомление о расторжении договора аренды",
    "category": "realty",
    "description": "Уведомление арендатора или арендодателя о расторжении договора аренды с указанием срока освобождения помещения.",
    "actSource": "ст. 610, 450.1 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-agreement",
      "apartment-rental",
      "claim-generic"
    ],
    "fieldCount": 10
  },
  {
    "id": "rent-agreement",
    "name": "Договор ренты с пожизненным содержанием с иждивением",
    "category": "realty",
    "description": "Договор пожизненной ренты с пожизненным содержанием с иждивением: передача квартиры в обмен на содержание и уход.",
    "actSource": "ст. 583-605 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat",
      "gift-flat"
    ],
    "fieldCount": 14
  },
  {
    "id": "service-agreement",
    "name": "Договор оказания услуг",
    "category": "business",
    "description": "Договор возмездного оказания услуг между юридическими лицами или ИП.",
    "actSource": "ст. 779–783 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 15
  },
  {
    "id": "contract-works",
    "name": "Договор подряда (строительные работы)",
    "category": "business",
    "description": "Договор подряда на выполнение строительно-ремонтных работ между заказчиком и подрядчиком.",
    "actSource": "ст. 702–729 ГК РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "act-works",
      "invoice"
    ],
    "fieldCount": 15
  },
  {
    "id": "supply-contract",
    "name": "Договор поставки товаров",
    "category": "business",
    "description": "Договор поставки товаров между поставщиком и покупателем (юридические лица, ИП).",
    "actSource": "ст. 506–524 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "invoice",
      "act-transfer-auto"
    ],
    "fieldCount": 15
  },
  {
    "id": "agreement-confidentiality",
    "name": "Соглашение о конфиденциальности (NDA)",
    "category": "business",
    "description": "Двустороннее соглашение о неразглашении конфиденциальной информации между компаниями.",
    "actSource": "ст. 1465–1470 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [],
    "fieldCount": 12
  },
  {
    "id": "it-development",
    "name": "Договор на разработку ПО",
    "category": "business",
    "description": "Договор разработки программного обеспечения: предмет, этапы, права на код, гарантия.",
    "actSource": "ст. 702, 1235–1236 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "agreement-confidentiality"
    ],
    "fieldCount": 15
  },
  {
    "id": "employment-contract",
    "name": "Трудовой договор",
    "category": "business",
    "description": "Трудовой договор с работником: условия, оплата, испытательный срок, дистанционная работа.",
    "actSource": "ст. 56-71 ТК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [],
    "fieldCount": 18
  },
  {
    "id": "gpa-contract",
    "name": "Договор ГПХ (услуги физлица)",
    "category": "business",
    "description": "Договор гражданско-правового характера с физическим лицом (услуги/подряд), без трудовых гарантий.",
    "actSource": "ст. 702, 779–783 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "invoice"
    ],
    "fieldCount": 14
  },
  {
    "id": "act-services",
    "name": "Акт оказанных услуг",
    "category": "business",
    "description": "Акт приёма-сдачи услуг по договору оказания услуг: перечень, стоимость, отсутствие претензий.",
    "actSource": "ст. 779–783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "gpa-contract",
      "it-development"
    ],
    "fieldCount": 9
  },
  {
    "id": "act-works",
    "name": "Акт выполненных работ (подряд)",
    "category": "business",
    "description": "Акт приёмки строительно-ремонтных работ по договору подряда: объект, перечень, гарантия.",
    "actSource": "ст. 702–729 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works"
    ],
    "fieldCount": 10
  },
  {
    "id": "photo-shoot-agreement",
    "name": "Договор на проведение фотосъёмки",
    "category": "business",
    "description": "Договор фотографа с заказчиком: формат съёмки, сроки, использование и публикация фотографий.",
    "actSource": "гл. 39 ГК РФ, ст. 152.1 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "llc-share-purchase",
    "name": "Договор купли-продажи доли в уставном капитале ООО",
    "category": "business",
    "description": "Договор купли-продажи доли в уставном капитале ООО между участниками: размер доли, цена, порядок перехода прав.",
    "actSource": "ст. 21 ФЗ «Об ООО»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 12
  },
  {
    "id": "labour-contract",
    "name": "Трудовой договор (бессрочный)",
    "category": "business",
    "description": "Бессрочный трудовой договор между работником и работодателем: условия оплаты, рабочее время, отпуск, обязанности сторон (ст. 56-68 ТК РФ).",
    "actSource": "ст. 56-71 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "hire-order"
    ],
    "fieldCount": 22
  },
  {
    "id": "gph-contract",
    "name": "Договор ГПХ (подряд/услуги с физлицом)",
    "category": "business",
    "description": "Гражданско-правовой договор с физическим лицом (не сотрудником): выполнение работ или оказание услуг без записи в трудовую книжку.",
    "actSource": "ст. 702-729, 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "act-works"
    ],
    "fieldCount": 19
  },
  {
    "id": "labour-addendum",
    "name": "Допсоглашение к трудовому договору",
    "category": "business",
    "description": "Изменение условий трудового договора: должность, оклад, режим работы, место работы.",
    "actSource": "ст. 72 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 12
  },
  {
    "id": "hire-order",
    "name": "Приказ о приёме на работу (Т-1)",
    "category": "business",
    "description": "Приказ о приёме работника на работу (форма Т-1): должность, оклад, дата начала, испытательный срок.",
    "actSource": "ст. 68 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "labour-contract"
    ],
    "fieldCount": 12
  },
  {
    "id": "firing-order",
    "name": "Приказ об увольнении (Т-8)",
    "category": "business",
    "description": "Приказ о прекращении трудового договора (форма Т-8): основание увольнения, дата, выплаты.",
    "actSource": "ст. 77, 84.1 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "resignation-letter"
    ],
    "fieldCount": 13
  },
  {
    "id": "vacation-letter",
    "name": "Заявление на отпуск",
    "category": "business",
    "description": "Заявление работника о предоставлении ежегодного оплачиваемого отпуска.",
    "actSource": "ст. 122-123 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "vacation-order"
    ],
    "fieldCount": 10
  },
  {
    "id": "vacation-order",
    "name": "Приказ о предоставлении отпуска (Т-6)",
    "category": "business",
    "description": "Приказ о предоставлении ежегодного оплачиваемого отпуска работнику (форма Т-6).",
    "actSource": "ст. 122 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "vacation-letter"
    ],
    "fieldCount": 11
  },
  {
    "id": "labour-contract-fixed",
    "name": "Трудовой договор (срочный)",
    "category": "business",
    "description": "Срочный трудовой договор: на определённый срок (ст. 59 ТК РФ), с испытательным сроком и условиями оплаты.",
    "actSource": "ст. 56-59 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 18
  },
  {
    "id": "loan-contract",
    "name": "Договор займа (с процентами)",
    "category": "business",
    "description": "Договор займа между физлицами: сумма, проценты, срок возврата, ответственность. Альтернатива расписке.",
    "actSource": "ст. 807-810 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "consulting-services",
    "name": "Договор оказания консультационных услуг",
    "category": "business",
    "description": "Договор на оказание консультационных (юридических, бухгалтерских, управленческих) услуг с фиксированной стоимостью.",
    "actSource": "ст. 779 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "info-services",
    "name": "Договор на оказание информационных услуг",
    "category": "business",
    "description": "Договор на предоставление информационных услуг: справки, мониторинг, подбор информации, аналитические материалы.",
    "actSource": "ст. 779 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services"
    ],
    "fieldCount": 10
  },
  {
    "id": "household-contract",
    "name": "Договор бытового подряда",
    "category": "business",
    "description": "Договор на выполнение работ для личных, семейных, домашних нужд: ремонт, изготовление мебели, мелкий ремонт техники.",
    "actSource": "ст. 730-739 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "subcontract",
    "name": "Договор субподряда",
    "category": "business",
    "description": "Договор между подрядчиком и субподрядчиком на выполнение части работ по основному договору подряда.",
    "actSource": "ст. 706 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "contract-works"
    ],
    "fieldCount": 13
  },
  {
    "id": "parttime-contract",
    "name": "Трудовой договор по совместительству",
    "category": "business",
    "description": "Трудовой договор с работником по совместительству: режим работы, оплата, основания прекращения по ТК РФ.",
    "actSource": "ст. 282-288 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "hire-order",
      "employment-contract"
    ],
    "fieldCount": 11
  },
  {
    "id": "remote-contract",
    "name": "Трудовой договор (дистанционный)",
    "category": "business",
    "description": "Трудовой договор с дистанционным работником: удалённая работа, электронный документооборот, режим рабочего времени.",
    "actSource": "ст. 312.1-312.5 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "hire-order"
    ],
    "fieldCount": 12
  },
  {
    "id": "equipment-supply",
    "name": "Договор поставки оборудования",
    "category": "business",
    "description": "Договор поставки оборудования: спецификация, условия доставки, монтаж, гарантия, порядок приёмки.",
    "actSource": "ст. 506-524 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "supply-contract",
      "invoice"
    ],
    "fieldCount": 14
  },
  {
    "id": "goods-sale",
    "name": "Договор купли-продажи товара",
    "category": "business",
    "description": "Универсальный договор купли-продажи товара между физлицами и организациями: предмет, цена, порядок передачи, ответственность.",
    "actSource": "ст. 454-491 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "invoice"
    ],
    "fieldCount": 12
  },
  {
    "id": "retail-sale",
    "name": "Договор розничной купли-продажи",
    "category": "business",
    "description": "Договор розничной купли-продажи с потребителем: публичный характер договора, права потребителя на возврат и обмен товара.",
    "actSource": "ст. 492-505 ГК РФ, Закон «О защите прав потребителей»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "goods-sale",
      "invoice"
    ],
    "fieldCount": 10
  },
  {
    "id": "agency-contract",
    "name": "Агентский договор",
    "category": "business",
    "description": "Агентский договор: агент за вознаграждение совершает юридические и фактические действия от своего имени или от имени принципала.",
    "actSource": "ст. 1005-1011 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "act-services"
    ],
    "fieldCount": 13
  },
  {
    "id": "commission-contract",
    "name": "Договор комиссии",
    "category": "business",
    "description": "Договор комиссии: комиссионер обязуется от своего имени совершить сделку по поручению комитента за вознаграждение.",
    "actSource": "ст. 990-1004 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "agency-contract",
      "act-services"
    ],
    "fieldCount": 12
  },
  {
    "id": "mandate-contract",
    "name": "Договор поручения",
    "category": "business",
    "description": "Договор поручения: поверенный совершает юридические действия от имени и за счёт доверителя на основании доверенности.",
    "actSource": "ст. 971-979 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs",
      "agency-contract"
    ],
    "fieldCount": 12
  },
  {
    "id": "license-contract",
    "name": "Лицензионный договор",
    "category": "business",
    "description": "Лицензионный договор о предоставлении права использования произведения, программы, товарного знака: срок, территория, вознаграждение.",
    "actSource": "ст. 1235-1239 ГК РФ (ч. IV)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "it-development",
      "agreement-confidentiality"
    ],
    "fieldCount": 13
  },
  {
    "id": "author-order",
    "name": "Договор авторского заказа",
    "category": "business",
    "description": "Договор авторского заказа: автор обязуется создать произведение (текст, дизайн, фото) и передать права заказчику.",
    "actSource": "ст. 1288-1291 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "it-development",
      "license-contract"
    ],
    "fieldCount": 11
  },
  {
    "id": "goods-power-of-attorney",
    "name": "Доверенность на получение товара",
    "category": "business",
    "description": "Доверенность на получение товара и подписание документов: передача полномочий сотруднику или представителю.",
    "actSource": "ст. 185-189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs",
      "goods-sale"
    ],
    "fieldCount": 10
  },
  {
    "id": "sign-power-of-attorney",
    "name": "Доверенность на подписание договора",
    "category": "business",
    "description": "Доверенность на право подписания договоров и первичных документов от имени организации.",
    "actSource": "ст. 185-189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs",
      "goods-power-of-attorney"
    ],
    "fieldCount": 11
  },
  {
    "id": "addendum-generic",
    "name": "Дополнительное соглашение (универсальное)",
    "category": "business",
    "description": "Универсальное дополнительное соглашение к любому договору: изменение условий, сроков, стоимости.",
    "actSource": "ст. 450-453 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "labour-addendum",
      "service-agreement"
    ],
    "fieldCount": 8
  },
  {
    "id": "termination-agreement",
    "name": "Соглашение о расторжении договора (универсальное)",
    "category": "business",
    "description": "Универсальное соглашение о расторжении любого договора: прекращение обязательств, взаимные расчёты, отсутствие претензий.",
    "actSource": "ст. 450-453 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "addendum-generic",
      "claim-letter"
    ],
    "fieldCount": 9
  },
  {
    "id": "refuse-notice",
    "name": "Уведомление об отказе от договора (универсальное)",
    "category": "business",
    "description": "Уведомление об одностороннем отказе от исполнения договора: досрочное прекращение обязательств по предусмотренным основаниям.",
    "actSource": "ст. 450.1, 782 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "termination-agreement",
      "claim-letter"
    ],
    "fieldCount": 10
  },
  {
    "id": "pupil-contract",
    "name": "Ученический договор",
    "category": "business",
    "description": "Договор профессионального обучения сотрудника за счёт работодателя с обязанностью отработать после обучения.",
    "actSource": "ст. 198-208 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Трудовой договор",
      "Договор оказания услуг"
    ],
    "fieldCount": 8
  },
  {
    "id": "ds-transfer",
    "name": "Допсоглашение о переводе на другую должность",
    "category": "business",
    "description": "Дополнительное соглашение к трудовому договору о переводе сотрудника на другую должность или в другое подразделение.",
    "actSource": "ст. 72.1 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Трудовой договор",
      "Допсоглашение к трудовому договору",
      "Приказ о переводе"
    ],
    "fieldCount": 9
  },
  {
    "id": "supply-spare-parts",
    "name": "Договор поставки запасных частей",
    "category": "business",
    "description": "Договор поставки автозапчастей и комплектующих для техники и автомобилей.",
    "actSource": "ст. 506-524 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "Спецификация",
      "ТОРГ-12",
      "Акт приёма-передачи товара"
    ],
    "fieldCount": 9
  },
  {
    "id": "supply-b2b",
    "name": "Договор поставки между ООО",
    "category": "business",
    "description": "Договор поставки товара между двумя юридическими лицами (ООО) с учётом НДС.",
    "actSource": "ст. 506-524 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "Спецификация",
      "ТОРГ-12"
    ],
    "fieldCount": 10
  },
  {
    "id": "supply-products",
    "name": "Договор поставки продукции",
    "category": "business",
    "description": "Договор поставки партий продукции с ежемесячными отгрузками по заявкам покупателя.",
    "actSource": "ст. 506-524 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "Спецификация",
      "ТОРГ-12"
    ],
    "fieldCount": 9
  },
  {
    "id": "services-b2b",
    "name": "Договор оказания услуг между юридическими лицами",
    "category": "business",
    "description": "Договор оказания услуг между двумя организациями с актом сдачи-приёмки.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор оказания услуг",
      "Акт оказанных услуг"
    ],
    "fieldCount": 9
  },
  {
    "id": "commission-sale",
    "name": "Договор комиссии на реализацию товара",
    "category": "business",
    "description": "Договор комиссии, по которому комиссионер обязуется продать товар комитента за вознаграждение.",
    "actSource": "ст. 990-1004 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор комиссии",
      "Агентский договор",
      "Отчёт комиссионера"
    ],
    "fieldCount": 9
  },
  {
    "id": "agent-goods-sale",
    "name": "Агентский договор на продажу товара",
    "category": "business",
    "description": "Агентский договор, по которому агент обязуется найти покупателей и продать товар принципала.",
    "actSource": "ст. 1005-1011 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Агентский договор",
      "Договор комиссии",
      "Отчёт агента"
    ],
    "fieldCount": 9
  },
  {
    "id": "public-offer",
    "name": "Публичная оферта",
    "category": "business",
    "description": "Публичная оферта о заключении договора на оказание услуг с неопределённым кругом лиц.",
    "actSource": "ст. 435, 437, 494 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Политика конфиденциальности",
      "Договор оказания услуг"
    ],
    "fieldCount": 8
  },
  {
    "id": "charter-llc",
    "name": "Устав ООО",
    "category": "business",
    "description": "Устав общества с ограниченной ответственностью (типовой шаблон).",
    "actSource": "ст. 12, 52 ГК РФ, ФЗ-14 «Об ООО»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Решение единственного участника",
      "Протокол собрания ООО",
      "Корпоративный договор"
    ],
    "fieldCount": 8
  },
  {
    "id": "corporate-agreement",
    "name": "Корпоративный договор",
    "category": "business",
    "description": "Корпоративный договор участников ООО о порядке осуществления корпоративных прав.",
    "actSource": "ст. 67.2 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Устав ООО",
      "Протокол собрания ООО"
    ],
    "fieldCount": 8
  },
  {
    "id": "sole-member-decision",
    "name": "Решение единственного участника ООО",
    "category": "business",
    "description": "Решение единственного участника ООО (универсальное: утверждение результатов, распределение прибыли, назначение директора).",
    "actSource": "ст. 39 ФЗ-14 «Об ООО»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Устав ООО",
      "Протокол собрания ООО"
    ],
    "fieldCount": 7
  },
  {
    "id": "llc-meeting-minutes",
    "name": "Протокол общего собрания участников ООО",
    "category": "business",
    "description": "Протокол общего собрания участников ООО (универсальный: утверждение результатов, назначение директора, одобрение сделок).",
    "actSource": "ст. 37, 39 ФЗ-14 «Об ООО»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Устав ООО",
      "Решение единственного участника"
    ],
    "fieldCount": 7
  },
  {
    "id": "ip-assignment",
    "name": "Договор об отчуждении исключительного права",
    "category": "business",
    "description": "Договор о передаче исключительного права на произведение или иной результат интеллектуальной деятельности.",
    "actSource": "ст. 1234, 1285, 1388 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Лицензионный договор",
      "Договор авторского заказа"
    ],
    "fieldCount": 7
  },
  {
    "id": "sublicense",
    "name": "Сублицензионный договор",
    "category": "business",
    "description": "Договор о предоставлении права использования РИД в пределах лицензии, полученной лицензиатом.",
    "actSource": "ст. 1238 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Лицензионный договор",
      "Договор об отчуждении исключительного права"
    ],
    "fieldCount": 8
  },
  {
    "id": "specification-supply",
    "name": "Спецификация к договору поставки",
    "category": "business",
    "description": "Спецификация (приложение к договору поставки) с перечнем товара, количеством, ценой и сроками.",
    "actSource": "ст. 506 ГК РФ (приложение к договору)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "ТОРГ-12"
    ],
    "fieldCount": 9
  },
  {
    "id": "torg-12",
    "name": "ТОРГ-12 (товарная накладная)",
    "category": "business",
    "description": "Товарная накладная по унифицированной форме ТОРГ-12 для учёта операций по продаже товарно-материальных ценностей.",
    "actSource": "Постановление Госкомстата РФ № 132 от 25.12.1998",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "Спецификация",
      "Акт приёма-передачи товара"
    ],
    "fieldCount": 7
  },
  {
    "id": "goods-acceptance-act",
    "name": "Акт приёма-передачи товара (к договору поставки)",
    "category": "business",
    "description": "Акт приёма-передачи товара как приложение к договору поставки.",
    "actSource": "ст. 506, 513 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "ТОРГ-12"
    ],
    "fieldCount": 7
  },
  {
    "id": "ds-purchase",
    "name": "Допсоглашение к договору купли-продажи",
    "category": "business",
    "description": "Дополнительное соглашение к договору купли-продажи (изменение цены, сроков, условий).",
    "actSource": "ст. 450 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор купли-продажи товара",
      "Дополнительное соглашение (универсальное)"
    ],
    "fieldCount": 6
  },
  {
    "id": "ds-services",
    "name": "Допсоглашение к договору оказания услуг",
    "category": "business",
    "description": "Дополнительное соглашение к договору оказания услуг (изменение объёма, стоимости, сроков).",
    "actSource": "ст. 450 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор оказания услуг",
      "Акт оказанных услуг"
    ],
    "fieldCount": 7
  },
  {
    "id": "terminate-supply",
    "name": "Соглашение о расторжении договора поставки",
    "category": "business",
    "description": "Соглашение о расторжении договора поставки по соглашению сторон.",
    "actSource": "ст. 450, 452 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Договор поставки товара",
      "Уведомление об отказе от договора"
    ],
    "fieldCount": 7
  },
  {
    "id": "legal-services-contract",
    "name": "Договор на оказание юридических услуг",
    "category": "business",
    "description": "Договор с юристом/юридической компанией: консультации, подготовка документов, представительство в суде. Обязателен детальный перечень услуг (ст. 779 ГК РФ).",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice",
      "power-of-attorney-docs"
    ],
    "fieldCount": 13
  },
  {
    "id": "accounting-services",
    "name": "Договор на бухгалтерское обслуживание",
    "category": "business",
    "description": "Договор на бухгалтерский аутсорсинг: ведение учёта, налоговые декларации, отчётность. Ответственность исполнителя ограничивается размером годовой оплаты.",
    "actSource": "ст. 779-783 ГК РФ, ФЗ-402 «О бухучёте»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice",
      "agreement-confidentiality"
    ],
    "fieldCount": 14
  },
  {
    "id": "cleaning-services",
    "name": "Договор на клининговые услуги",
    "category": "business",
    "description": "Договор на профессиональную уборку помещений: перечень работ, периодичность, приёмка по чек-листу, ответственность за ущерб.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 14
  },
  {
    "id": "security-services",
    "name": "Договор охраны объекта (ЧОП)",
    "category": "business",
    "description": "Договор с частным охранным предприятием: физическая охрана или пультовая охрана (ПЦО), перечень постов, ответственность за сохранность имущества.",
    "actSource": "ст. 779-783 ГК РФ, Закон РФ № 2487-1",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "advertising-services",
    "name": "Договор на рекламные услуги (интернет-реклама)",
    "category": "business",
    "description": "Договор на размещение интернет-рекламы: площадки, форматы, сроки кампании, отчётность, обязательная маркировка рекламы и передача данных в ЕРИР (ст. 18.1 ФЗ-38).",
    "actSource": "ст. 779-783 ГК РФ, ФЗ-38 «О рекламе»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "event-organization",
    "name": "Договор на организацию мероприятия",
    "category": "business",
    "description": "Договор с ивент-агентством: дата, место, программа мероприятия, кейтеринг и техника, аванс и возврат при отмене, форс-мажор.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 15
  },
  {
    "id": "medical-services",
    "name": "Договор на платные медицинские услуги",
    "category": "business",
    "description": "Договор с медицинской клиникой: перечень услуг, стоимость, порядок оплаты и возврата, информированное добровольное согласие, реквизиты лицензии.",
    "actSource": "ст. 779-783 ГК РФ, ПП РФ № 1006, ФЗ-323",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 12
  },
  {
    "id": "website-support",
    "name": "Договор на разработку и обслуживание сайта",
    "category": "business",
    "description": "Договор на разработку сайта и его поддержку: этапы работ, исключительные права (ст. 1295 ГК РФ), хостинг и домен, SLA, пролонгация.",
    "actSource": "ст. 702-729, 1286-1295 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "act-services",
      "agreement-confidentiality"
    ],
    "fieldCount": 14
  },
  {
    "id": "franchise-agreement",
    "name": "Договор франчайзинга (коммерческая концессия)",
    "category": "business",
    "description": "Договор коммерческой концессии: передача товарного знака, ноу-хау и коммерческого опыта, паушальный взнос и роялти, субконцессия, регистрация в Роспатенте.",
    "actSource": "ст. 1027-1040 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "agreement-confidentiality",
      "license-contract"
    ],
    "fieldCount": 13
  },
  {
    "id": "rental-contract",
    "name": "Договор проката",
    "category": "business",
    "description": "Договор проката имущества: публичный договор на срок не более 1 года, арендная плата, обязанность арендодателя проверить исправность при выдаче (ст. 626-631 ГК РФ).",
    "actSource": "ст. 626-631 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "act-transfer-auto"
    ],
    "fieldCount": 13
  },
  {
    "id": "reconciliation-statement",
    "name": "Акт сверки взаимных расчётов",
    "category": "business",
    "description": "Акт сверки взаимных расчётов между контрагентами: таблица операций за период, сальдо на начало и конец, подтверждение долга (подписанный акт прерывает срок исковой давности, ст. 203 ГК РФ).",
    "actSource": "ст. 9 ФЗ-402, ст. 203 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "invoice",
      "torg-12",
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "transfer-order-t5",
    "name": "Приказ о переводе на другую должность (Т-5)",
    "category": "business",
    "description": "Приказ о переводе работника на другую должность (форма Т-5): прежнее и новое место работы, оклад, основание (заявление, допсоглашение), отметка об ознакомлении.",
    "actSource": "Постановление Госкомстата № 1 от 05.01.2004",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "ds-transfer",
      "employment-contract"
    ],
    "fieldCount": 13
  },
  {
    "id": "liability-agreement",
    "name": "Соглашение о полной материальной ответственности",
    "category": "business",
    "description": "Договор о полной материальной ответственности работника: заключается с работниками, непосредственно обслуживающими материальные ценности (перечень — Постановление Минтруда № 85 от 31.12.2002).",
    "actSource": "ст. 242-244 ТК РФ, Постановление Минтруда № 85",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract"
    ],
    "fieldCount": 8
  },
  {
    "id": "business-trip-order",
    "name": "Приказ о командировке (Т-9)",
    "category": "business",
    "description": "Приказ о направлении работника в служебную командировку (форма Т-9): место назначения, срок, цель, основание, служебное задание (Т-10а).",
    "actSource": "Постановление Госкомстата № 1 от 05.01.2004",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract"
    ],
    "fieldCount": 13
  },
  {
    "id": "tutor-contract",
    "name": "Договор с репетитором (образовательные услуги)",
    "category": "business",
    "description": "Договор на оказание образовательных услуг (занятия с репетитором): предмет, график занятий, стоимость, отмена/перенос, порядок оплаты.",
    "actSource": "ст. 779-783 ГК РФ, 273-ФЗ «Об образовании»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "raspiska-money"
    ],
    "fieldCount": 15
  },
  {
    "id": "seo-contract",
    "name": "Договор на SEO-продвижение сайта",
    "category": "business",
    "description": "Договор на поисковое продвижение сайта: перечень работ, KPI (позиции, трафик), отчётность, стоимость, сроки, ответственность за результат.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice",
      "agreement-confidentiality"
    ],
    "fieldCount": 16
  },
  {
    "id": "courier-contract",
    "name": "Договор на курьерские услуги",
    "category": "business",
    "description": "Договор на доставку корреспонденции и грузов курьером: адреса отправки и доставки, сроки, стоимость, ответственность за утрату/повреждение вложений.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 12
  },
  {
    "id": "translator-contract",
    "name": "Договор на услуги перевода",
    "category": "business",
    "description": "Договор на письменный или устный перевод: языки, объём, сроки, стоимость за страницу, конфиденциальность и ответственность за качество перевода.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 10
  },
  {
    "id": "audit-contract",
    "name": "Договор на проведение аудита",
    "category": "business",
    "description": "Договор с аудиторской организацией на проверку бухгалтерской отчётности: объём и период проверки, аудиторское заключение, права и обязанности сторон, ответственность за недостоверное заключение.",
    "actSource": "ФЗ-307 «Об аудиторской деятельности», ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 11
  },
  {
    "id": "recruiting-contract",
    "name": "Договор на подбор персонала",
    "category": "business",
    "description": "Договор с кадровым агентством на подбор персонала: критерии вакансии, сроки подбора, стоимость (процент от оклада), гарантийный период бесплатной замены кандидата.",
    "actSource": "ст. 779-783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 10
  },
  {
    "id": "warehouse-storage",
    "name": "Договор ответственного хранения",
    "category": "business",
    "description": "Договор хранения товара на складе: опись передаваемого имущества, место и срок хранения, вознаграждение, обязанности хранителя и ответственность за утрату или повреждение.",
    "actSource": "ст. 886-926 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "warehouse-rent"
    ],
    "fieldCount": 10
  },
  {
    "id": "freight-transport",
    "name": "Договор перевозки груза автомобильным транспортом",
    "category": "business",
    "description": "Договор перевозки груза автотранспортом: перевозчик обязуется доставить груз в пункт назначения, заказчик — оплатить перевозку.",
    "actSource": "гл. 40 ГК РФ, ФЗ-259 «Устав автомобильного транспорта»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "transport-expedition",
      "torg-12"
    ],
    "fieldCount": 17
  },
  {
    "id": "simple-partnership",
    "name": "Договор простого товарищества (совместной деятельности)",
    "category": "business",
    "description": "Договор простого товарищества: двое и более лиц обязуются соединить вклады и действовать совместно для достижения общей цели без образования юрлица.",
    "actSource": "гл. 55 ГК РФ (ст. 1041-1054)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "addendum-generic",
      "termination-agreement"
    ],
    "fieldCount": 15
  },
  {
    "id": "barter-agreement",
    "name": "Договор мены (бартера) товаров",
    "category": "business",
    "description": "Договор мены товаров между организациями или ИП с возможной доплатой за разницу в стоимости.",
    "actSource": "гл. 31 ГК РФ (ст. 567-571)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "goods-sale",
      "torg-12"
    ],
    "fieldCount": 15
  },
  {
    "id": "equipment-rental",
    "name": "Договор аренды оборудования",
    "category": "business",
    "description": "Договор аренды оборудования, техники, инструмента для бизнеса. Возможно с экипажем (обслуживающим персоналом).",
    "actSource": "гл. 34 ГК РФ (ст. 606-625, 642-670)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "addendum-generic"
    ],
    "fieldCount": 18
  },
  {
    "id": "maintenance-service",
    "name": "Договор технического обслуживания оборудования",
    "category": "business",
    "description": "Договор ТО оборудования: периодическое сервисное обслуживание, профилактические работы, устранение неисправностей.",
    "actSource": "гл. 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "equipment-rental"
    ],
    "fieldCount": 15
  },
  {
    "id": "outsourcing-contract",
    "name": "Договор аутсорсинга персонала",
    "category": "business",
    "description": "Договор аутсорсинга: компания передаёт вспомогательные функции (бухгалтерия, IT, клининг, кадры) внешнему исполнителю.",
    "actSource": "гл. 39 ГК РФ, ст. 56.1 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "accounting-services",
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "appraiser-contract",
    "name": "Договор на оценку имущества",
    "category": "business",
    "description": "Договор на проведение независимой оценки имущества: отчёт об оценке для сделки, оспаривания кадастровой стоимости, суда.",
    "actSource": "ФЗ-135 «Об оценочной деятельности»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "furniture-custom",
    "name": "Договор на изготовление мебели по индивидуальному заказу",
    "category": "business",
    "description": "Договор бытового подряда на изготовление кухни, шкафа-купе и другой мебели по индивидуальным размерам.",
    "actSource": "гл. 37 ГК РФ, Закон «О защите прав потребителей»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "household-contract"
    ],
    "fieldCount": 17
  },
  {
    "id": "repair-appliance",
    "name": "Договор ремонта бытовой техники",
    "category": "business",
    "description": "Договор бытового подряда на ремонт бытовой техники (стиральные машины, холодильники, телевизоры) с выдачей гарантии на работы.",
    "actSource": "гл. 37 ГК РФ, Закон «О защите прав потребителей»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works"
    ],
    "fieldCount": 16
  },
  {
    "id": "installation-works",
    "name": "Договор монтажных работ",
    "category": "business",
    "description": "Договор подряда на монтажные работы: установка оборудования, конструкций, инженерных систем на объекте.",
    "actSource": "гл. 37 ГК РФ (строительный подряд)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "contract-works"
    ],
    "fieldCount": 17
  },
  {
    "id": "project-design",
    "name": "Договор на выполнение проектных работ",
    "category": "business",
    "description": "Договор подряда на проектирование: разработка проектной и рабочей документации для строительства или реконструкции.",
    "actSource": "гл. 37 ГК РФ (ст. 758-762)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "installation-works",
      "act-works"
    ],
    "fieldCount": 15
  },
  {
    "id": "survey-works",
    "name": "Договор геодезических (кадастровых) работ",
    "category": "business",
    "description": "Договор на выполнение геодезических и кадастровых работ: межевание, вынос границ, кадастровый план, технический план.",
    "actSource": "ФЗ-221 «О кадастровой деятельности»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "dkp-land"
    ],
    "fieldCount": 14
  },
  {
    "id": "landscaping-works",
    "name": "Договор благоустройства территории",
    "category": "business",
    "description": "Договор подряда на благоустройство: озеленение, укладка тротуарной плитки, монтаж малых архитектурных форм, освещение.",
    "actSource": "гл. 37 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "installation-works",
      "act-works"
    ],
    "fieldCount": 16
  },
  {
    "id": "exhibition-participation",
    "name": "Договор участия в выставке (ярмарке)",
    "category": "business",
    "description": "Договор на участие в выставке: аренда стенда, регистрационный взнос, организационные услуги организатора.",
    "actSource": "гл. 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "advertising-services",
      "act-services"
    ],
    "fieldCount": 16
  },
  {
    "id": "corporate-training",
    "name": "Договор обучения (повышения квалификации)",
    "category": "business",
    "description": "Договор на корпоративное обучение сотрудников: семинары, тренинги, курсы повышения квалификации с выдачей удостоверений.",
    "actSource": "гл. 39 ГК РФ, ФЗ-273 «Об образовании»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "tutor-contract"
    ],
    "fieldCount": 16
  },
  {
    "id": "marketing-services",
    "name": "Договор маркетинговых услуг",
    "category": "business",
    "description": "Договор на маркетинговое сопровождение: разработка стратегии, анализ рынка, продвижение бренда, управление рекламными кампаниями.",
    "actSource": "гл. 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "advertising-services",
      "seo-contract",
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "pr-services",
    "name": "Договор PR-сопровождения (связи с общественностью)",
    "category": "business",
    "description": "Договор на PR-сопровождение компании: взаимодействие со СМИ, пресс-релизы, управление репутацией, антикризисный PR.",
    "actSource": "гл. 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "marketing-services",
      "act-services"
    ],
    "fieldCount": 14
  },
  {
    "id": "content-services",
    "name": "Договор на создание контента (копирайтинг)",
    "category": "business",
    "description": "Договор на создание текстового контента: статьи, посты, описания товаров, с передачей исключительных прав.",
    "actSource": "гл. 39, ст. 1288 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "author-order",
      "ip-assignment",
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "mobile-app-dev",
    "name": "Договор разработки мобильного приложения",
    "category": "business",
    "description": "Договор на разработку мобильного приложения (iOS/Android): проектирование, разработка, тестирование, поддержка, передача прав.",
    "actSource": "гл. 37, 1288 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "it-development",
      "act-works",
      "ip-assignment"
    ],
    "fieldCount": 17
  },
  {
    "id": "api-integration",
    "name": "Договор интеграции программных продуктов (API)",
    "category": "business",
    "description": "Договор на интеграцию API: подключение CRM, 1С, платёжных систем, маркетплейсов и внешних сервисов к информационным системам.",
    "actSource": "гл. 37, 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "it-development",
      "act-works"
    ],
    "fieldCount": 15
  },
  {
    "id": "distributor-agreement",
    "name": "Дистрибьюторский договор",
    "category": "business",
    "description": "Дистрибьюторский договор: поставщик передаёт дистрибьютору право продажи товара на определённой территории с квотами закупок.",
    "actSource": "гл. 49, 51 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "supply-contract",
      "agency-contract"
    ],
    "fieldCount": 15
  },
  {
    "id": "exclusive-dealer",
    "name": "Договор эксклюзивного дилера",
    "category": "business",
    "description": "Договор с эксклюзивным дилером: продажа продукции под товарным знаком производителя на исключительной основе на территории.",
    "actSource": "гл. 49 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "distributor-agreement",
      "supply-contract"
    ],
    "fieldCount": 15
  },
  {
    "id": "logistics-contract",
    "name": "Договор логистических услуг",
    "category": "business",
    "description": "Договор комплексного логистического обслуживания: складирование, обработка, доставка грузов, управление запасами.",
    "actSource": "гл. 39, 41 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "warehouse-storage",
      "transport-expedition",
      "act-services"
    ],
    "fieldCount": 15
  },
  {
    "id": "financial-lease",
    "name": "Договор финансовой аренды (лизинга) оборудования",
    "category": "business",
    "description": "Договор лизинга: лизингодатель приобретает оборудование у продавца и передаёт лизингополучателю во временное владение с правом выкупа.",
    "actSource": "ФЗ-164 «О финансовой аренде (лизинге)», ст. 665-670 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "equipment-rental",
      "goods-sale"
    ],
    "fieldCount": 17
  },
  {
    "id": "enterprise-sale",
    "name": "Договор купли-продажи предприятия",
    "category": "business",
    "description": "Договор купли-продажи предприятия как имущественного комплекса (ст. 560 ГК РФ). Обязательные приложения: акт инвентаризации, бухгалтерский баланс, перечень долгов, реестр претензий.",
    "actSource": "ст. 560–566 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-inventory",
      "balance-sheet",
      "debt-register"
    ],
    "fieldCount": 16
  },
  {
    "id": "rental-office",
    "name": "Договор аренды офиса",
    "category": "realty",
    "description": "Аренда офисного помещения: физлицо, ИП или организация сдают офис в аренду. Коммунальные платежи, обеспечительный платёж, срок и расторжение.",
    "actSource": "ст. 606–625, 650–655 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-commercial",
      "act-services",
      "terminate-rent"
    ],
    "fieldCount": 29
  },
  {
    "id": "rental-warehouse",
    "name": "Договор аренды склада",
    "category": "realty",
    "description": "Аренда складского помещения или склада целиком: характеристики объекта, режим доступа, охрана, коммунальные платежи, ответственность за сохранность товара.",
    "actSource": "ст. 606–625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-commercial",
      "goods-acceptance-act",
      "act-services"
    ],
    "fieldCount": 33
  },
  {
    "id": "rental-workplace",
    "name": "Договор аренды рабочего места",
    "category": "realty",
    "description": "Аренда рабочего места в офисе или коворкинге: инфраструктура, часы доступа, общие зоны. Подходит для фрилансеров, стартапов и малого бизнеса.",
    "actSource": "ст. 606–625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-commercial",
      "act-services"
    ],
    "fieldCount": 28
  },
  {
    "id": "rental-daily",
    "name": "Договор посуточной аренды квартиры",
    "category": "realty",
    "description": "Посуточная аренда квартиры между собственником и гостем: сроки заезда и выезда, оплата, залог, правила проживания. Краткосрочный наём до 1 года — без госрегистрации.",
    "actSource": "гл. 35 ГК РФ (ст. 671, 683)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "raspiska-money"
    ],
    "fieldCount": 17
  },
  {
    "id": "assign-rent-land",
    "name": "Переуступка права аренды земельного участка",
    "category": "realty",
    "description": "Перенаём: арендатор передаёт новому арендатору права и обязанности по договору аренды земельного участка (с согласия арендодателя либо без него при сроке свыше 5 лет).",
    "actSource": "ст. 615 ГК РФ, ст. 22 ЗК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "land-lease",
      "terminate-rent"
    ],
    "fieldCount": 15
  },
  {
    "id": "sublease-flat",
    "name": "Договор субаренды квартиры",
    "category": "realty",
    "description": "Субаренда квартиры: арендатор передаёт жильё в субаренду с согласия арендодателя. Срок субаренды не может превышать срок основного договора.",
    "actSource": "ст. 615 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-flat",
      "terminate-sublease"
    ],
    "fieldCount": 27
  },
  {
    "id": "rental-car",
    "name": "Договор аренды автомобиля без экипажа",
    "category": "business",
    "description": "Аренда автомобиля без экипажа: собственник передаёт авто, арендатор управляет самостоятельно и несёт расходы на содержание, страхование и ремонт (ст. 642–648 ГК РФ).",
    "actSource": "ст. 642–648 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "auto-condition-act"
    ],
    "fieldCount": 33
  },
  {
    "id": "rental-movable",
    "name": "Договор аренды движимого имущества",
    "category": "business",
    "description": "Аренда движимого имущества: оборудование, техника, мебель, инструменты. Текущий ремонт — арендатор, капитальный — арендодатель (ст. 616 ГК РФ).",
    "actSource": "ст. 606–625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "equipment-rental",
      "act-services"
    ],
    "fieldCount": 30
  },
  {
    "id": "rental-general",
    "name": "Договор аренды (общий)",
    "category": "business",
    "description": "Универсальный договор аренды любого имущества (движимого или недвижимого) между физлицами, ИП и организациями: срок, плата, ремонт, возврат, расторжение.",
    "actSource": "ст. 606–625 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-movable",
      "rental-commercial",
      "terminate-rent"
    ],
    "fieldCount": 31
  },
  {
    "id": "sublease-ts",
    "name": "Договор субаренды транспортного средства",
    "category": "business",
    "description": "Субаренда автомобиля или транспортного средства: арендатор передаёт ТС в субаренду с согласия арендодателя. Расходы, ремонт и ответственность — на субарендаторе.",
    "actSource": "ст. 615, 642–648 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-car",
      "act-transfer-auto",
      "terminate-sublease"
    ],
    "fieldCount": 28
  },
  {
    "id": "dkp-parking",
    "name": "Договор купли-продажи машино-места",
    "category": "realty",
    "description": "Продажа машино-места в паркинге: физлица, ИП или организации. Переход права собственности регистрируется в Росреестре (машино-место — самостоятельный объект недвижимости).",
    "actSource": "ст. 549–558 ГК РФ, 218-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "dkp-property-general"
    ],
    "fieldCount": 28
  },
  {
    "id": "dkp-share-flat",
    "name": "Договор купли-продажи доли в квартире",
    "category": "realty",
    "description": "Продажа доли в праве общей собственности на квартиру. Сделка подлежит обязательному нотариальному удостоверению; учитывается преимущественное право покупки других сособственников (ст. 250 ГК РФ).",
    "actSource": "ст. 246, 250 ГК РФ, ч. 1.1 ст. 42 218-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "spouse-consent-sell",
      "raspiska-money"
    ],
    "fieldCount": 26
  },
  {
    "id": "dkp-building",
    "name": "Договор купли-продажи здания (нежилого)",
    "category": "realty",
    "description": "Продажа нежилого здания (офисного, производственного, складского) вместе с земельным участком (ст. 552 ГК РФ). Регистрация перехода права в Росреестре.",
    "actSource": "ст. 549–558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "dkp-property-general",
      "act-services"
    ],
    "fieldCount": 28
  },
  {
    "id": "dkp-property-general",
    "name": "Договор купли-продажи недвижимости (общий)",
    "category": "realty",
    "description": "Универсальный договор купли-продажи любого объекта недвижимости: комнаты, дачи, гаража, нежилого помещения и др. Регистрация перехода права в Росреестре.",
    "actSource": "ст. 549–558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "raspiska-money",
      "spouse-consent-sell"
    ],
    "fieldCount": 27
  },
  {
    "id": "prelim-house",
    "name": "Предварительный договор купли-продажи дома",
    "category": "realty",
    "description": "Предварительный договор о заключении в будущем основного договора купли-продажи жилого дома с земельным участком. Задаток, срок и условия основного договора.",
    "actSource": "ст. 429, 549–558 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-house",
      "raspiska-money"
    ],
    "fieldCount": 27
  },
  {
    "id": "prelim-land",
    "name": "Предварительный договор купли-продажи земли",
    "category": "realty",
    "description": "Предварительный договор о заключении основного договора купли-продажи земельного участка. Задаток, срок и условия основного договора.",
    "actSource": "ст. 429 ГК РФ, ст. 37 ЗК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-land",
      "raspiska-money"
    ],
    "fieldCount": 26
  },
  {
    "id": "dkp-equipment",
    "name": "Договор купли-продажи оборудования",
    "category": "business",
    "description": "Продажа оборудования (в том числе бывшего в употреблении): характеристика, состояние, комплектность, порядок передачи, монтаж и гарантии.",
    "actSource": "ст. 454–491, 506 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "equipment-supply",
      "act-services",
      "invoice"
    ],
    "fieldCount": 30
  },
  {
    "id": "international-sale",
    "name": "Договор международной купли-продажи",
    "category": "business",
    "description": "Внешнеторговый контракт купли-продажи товаров: базис поставки Инкотермс 2020, валюта, переход рисков, применимое право, арбитраж.",
    "actSource": "Венская конвенция 1980, Инкотермс 2020",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "invoice",
      "commission-contract"
    ],
    "fieldCount": 29
  },
  {
    "id": "gift-money",
    "name": "Договор дарения денежных средств",
    "category": "family",
    "description": "Дарение денег между родственниками или иными лицами. Между близкими родственниками дарение не облагается НДФЛ (п. 18.1 ст. 217 НК РФ).",
    "actSource": "ст. 572, 574 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-agreement",
      "raspiska-money"
    ],
    "fieldCount": 22
  },
  {
    "id": "selfemployed-contract",
    "name": "Договор с самозанятым (НПД)",
    "category": "business",
    "description": "Договор ГПХ с исполнителем — плательщиком налога на профессиональный доход. Заказчик не платит НДФЛ и страховые взносы; исполнитель выдаёт чеки через приложение «Мой налог».",
    "actSource": "ГК РФ, 422-ФЗ (НПД)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "service-agreement"
    ],
    "fieldCount": 26
  },
  {
    "id": "contract-personal",
    "name": "Договор подряда между физическими лицами",
    "category": "business",
    "description": "Договор подряда между физлицами: строительные, ремонтные и иные работы без оформления ИП. Сроки, качество, порядок оплаты и приёмки.",
    "actSource": "ст. 702–729 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-works",
      "raspiska-money"
    ],
    "fieldCount": 26
  },
  {
    "id": "house-repair",
    "name": "Договор подряда на ремонт дома",
    "category": "business",
    "description": "Договор на ремонт жилого дома между заказчиком-гражданином и подрядчиком (ИП или организацией): смета, материалы, сроки, гарантия 2 года.",
    "actSource": "ст. 730–739 ГК РФ (бытовой подряд)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "repair-contract",
      "act-works",
      "contract-personal"
    ],
    "fieldCount": 27
  },
  {
    "id": "roof-repair",
    "name": "Договор подряда на ремонт кровли",
    "category": "business",
    "description": "Договор на ремонт крыши (кровли) дома: замена покрытия, гидроизоляция, водосточная система. Смета, материалы, сроки, гарантия.",
    "actSource": "ст. 730–739, 740–757 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "house-repair",
      "contract-works",
      "act-works"
    ],
    "fieldCount": 28
  },
  {
    "id": "contract-construction",
    "name": "Договор строительного подряда",
    "category": "business",
    "description": "Договор на строительство, реконструкцию или капитальный ремонт объекта: объём работ, смета, сроки, скрытые работы, гарантийный срок, сдача-приёмка.",
    "actSource": "ст. 740–757 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works",
      "act-works",
      "project-design"
    ],
    "fieldCount": 29
  },
  {
    "id": "transport-services",
    "name": "Договор оказания транспортных услуг",
    "category": "business",
    "description": "Транспортные услуги по перевозке пассажиров и грузов транспортом исполнителя: маршруты, график, ответственность, лицензирование.",
    "actSource": "ст. 779–783, 785 ГК РФ, 259-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "freight-transport",
      "logistics-contract",
      "act-services"
    ],
    "fieldCount": 26
  },
  {
    "id": "design-dev",
    "name": "Договор на разработку дизайн-проекта",
    "category": "business",
    "description": "Разработка дизайн-проекта (интерьера, сайта, брендинга) с передачей исключительных прав на результат: этапы, правки, исходники, авторские права.",
    "actSource": "ст. 1288, 1296, 1255 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "it-development",
      "website-support",
      "act-services"
    ],
    "fieldCount": 26
  },
  {
    "id": "loan-use",
    "name": "Договор безвозмездного пользования (ссуда)",
    "category": "business",
    "description": "Договор ссуды: передача имущества (квартиры, автомобиля, оборудования) в безвозмездное пользование. Ремонт, содержание, возврат имущества.",
    "actSource": "ст. 689–701 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-general",
      "loan-employee",
      "storage-agreement"
    ],
    "fieldCount": 24
  },
  {
    "id": "job-description",
    "name": "Должностная инструкция",
    "category": "business",
    "description": "Должностная инструкция работника: обязанности, права, ответственность, квалификационные требования. Оформляется как приложение к трудовому договору или самостоятельный документ.",
    "actSource": "ТК РФ (ст. 57, 68)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "hire-order",
      "internal-rules"
    ],
    "fieldCount": 9
  },
  {
    "id": "director-contract",
    "name": "Трудовой договор с директором",
    "category": "business",
    "description": "Трудовой договор с руководителем организации (единоличным исполнительным органом): полномочия, ответственность, испытательный срок до 6 месяцев, основания увольнения.",
    "actSource": "ТК РФ (ст. 273–281)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "liability-agreement",
      "termination-agreement"
    ],
    "fieldCount": 25
  },
  {
    "id": "foreign-employee-contract",
    "name": "Трудовой договор с иностранным гражданином",
    "category": "business",
    "description": "Трудовой договор с иностранным работником: патент или разрешение на работу, медосмотр, полис ДМС, уведомление МВД о заключении договора.",
    "actSource": "ТК РФ (ст. 327.1–327.7), 115-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "foreign-employee-reg",
      "pdn-policy"
    ],
    "fieldCount": 27
  },
  {
    "id": "internal-rules",
    "name": "Правила внутреннего трудового распорядка",
    "category": "business",
    "description": "ПВТР: режим рабочего времени и отдыха, порядок приёма и увольнения, дисциплина труда, поощрения и взыскания. Утверждаются работодателем с учётом мнения профсоюза.",
    "actSource": "ТК РФ (ст. 189–190)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "job-description",
      "termination-agreement"
    ],
    "fieldCount": 10
  },
  {
    "id": "termination-employment",
    "name": "Соглашение о расторжении трудового договора",
    "category": "business",
    "description": "Расторжение трудового договора по соглашению сторон: дата увольнения, выплаты и компенсации, отсутствие взаимных претензий.",
    "actSource": "ТК РФ (ст. 78, п. 1 ч. 1 ст. 77)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "firing-order",
      "employment-contract",
      "ds-services"
    ],
    "fieldCount": 22
  },
  {
    "id": "pdn-policy",
    "name": "Положение о защите персональных данных",
    "category": "business",
    "description": "Положение об обработке и защите персональных данных работников и клиентов: перечень данных, правовые основания, порядок сбора, хранения и уничтожения, ответственный за ПДн.",
    "actSource": "152-ФЗ, ст. 86–90 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "personal-data-consent",
      "internal-rules",
      "job-description"
    ],
    "fieldCount": 7
  },
  {
    "id": "internship-contract",
    "name": "Договор со стажёром",
    "category": "business",
    "description": "Трудовой договор со стажёром по ст. 351.9 ТК РФ (введена 246-ФЗ, вступает в силу с 01.03.2027). Срок стажировки не может превышать 6 месяцев. До 01.03.2027 шаблон носит превентивный характер.",
    "actSource": "ст. 351.9 ТК РФ (Федеральный закон от 01.03.2027 № 246-ФЗ)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "personal-data-consent",
      "internal-rules"
    ],
    "fieldCount": 20
  },
  {
    "id": "claim-rent",
    "name": "Претензия по договору аренды",
    "category": "legal",
    "description": "Досудебная претензия арендодателя к арендатору: задолженность по арендной плате, коммунальным платежам, неустойка за просрочку.",
    "actSource": "ст. 614, 619, 620 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "terminate-rent",
      "claim-letter",
      "notice-rent-termination"
    ],
    "fieldCount": 12
  },
  {
    "id": "claim-loan",
    "name": "Претензия по договору займа",
    "category": "legal",
    "description": "Досудебная претензия заимодавца: требование о возврате суммы займа, процентов, досрочный возврат при нарушении сроков (ст. 811 ГК РФ).",
    "actSource": "ст. 807–811 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter",
      "loan-agreement",
      "court-order-app"
    ],
    "fieldCount": 13
  },
  {
    "id": "claim-sale",
    "name": "Претензия по договору купли-продажи",
    "category": "legal",
    "description": "Досудебная претензия покупателя к продавцу: недостатки товара, возврат оплаты, замена товара, соразмерное уменьшение цены.",
    "actSource": "ст. 475–477 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "refund-claim",
      "claim-letter",
      "goods-sale"
    ],
    "fieldCount": 13
  },
  {
    "id": "claim-works",
    "name": "Претензия по договору подряда",
    "category": "legal",
    "description": "Досудебная претензия заказчика к подрядчику: недостатки результата работ, просрочка, требование об устранении или соразмерном уменьшении цены.",
    "actSource": "ст. 723–725 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter",
      "act-works",
      "contract-works"
    ],
    "fieldCount": 13
  },
  {
    "id": "claim-supply",
    "name": "Претензия по договору поставки",
    "category": "legal",
    "description": "Досудебная претензия по договору поставки: недопоставка, просрочка, несоответствие качества, требование об оплате товара.",
    "actSource": "ст. 518–524 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter",
      "equipment-supply",
      "terminate-supply"
    ],
    "fieldCount": 12
  },
  {
    "id": "claim-services",
    "name": "Претензия по договору оказания услуг",
    "category": "legal",
    "description": "Досудебная претензия по договору оказания услуг: некачественные услуги, просрочка, отказ от договора, возврат оплаты.",
    "actSource": "ст. 779–783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter",
      "service-agreement",
      "act-services"
    ],
    "fieldCount": 12
  },
  {
    "id": "terminate-dkp-realty",
    "name": "Соглашение о расторжении ДКП недвижимости",
    "category": "legal",
    "description": "Расторжение договора купли-продажи недвижимости по соглашению сторон: возврат оплаты, возврат объекта, регистрация прекращения права.",
    "actSource": "ст. 450, 453 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "termination-agreement",
      "dkp-flat",
      "raspiska-money"
    ],
    "fieldCount": 22
  },
  {
    "id": "terminate-gift",
    "name": "Соглашение о расторжении договора дарения",
    "category": "legal",
    "description": "Расторжение договора дарения по взаимному согласию дарителя и одаряемого: возврат дара, оформление перехода прав.",
    "actSource": "ст. 450, 578 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "gift-agreement",
      "termination-agreement",
      "gift-flat"
    ],
    "fieldCount": 22
  },
  {
    "id": "terminate-loan",
    "name": "Соглашение о расторжении договора займа",
    "category": "legal",
    "description": "Расторжение договора займа по соглашению сторон: прощение долга, возврат части средств, прекращение обязательств (ст. 415 ГК РФ).",
    "actSource": "ст. 450, 453 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "termination-agreement",
      "raspiska-money"
    ],
    "fieldCount": 22
  },
  {
    "id": "terminate-sale",
    "name": "Соглашение о расторжении договора купли-продажи",
    "category": "legal",
    "description": "Расторжение договора купли-продажи товара (движимого имущества) по соглашению сторон: возврат товара и уплаченных средств.",
    "actSource": "ст. 450, 453 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "goods-sale",
      "termination-agreement",
      "raspiska-money"
    ],
    "fieldCount": 22
  },
  {
    "id": "terminate-works",
    "name": "Соглашение о расторжении договора подряда",
    "category": "legal",
    "description": "Расторжение договора подряда по соглашению сторон: оплата фактически выполненных работ, возврат результата и материалов.",
    "actSource": "ст. 450, 453, 717 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works",
      "termination-agreement",
      "act-works"
    ],
    "fieldCount": 22
  },
  {
    "id": "terminate-services",
    "name": "Соглашение о расторжении договора оказания услуг",
    "category": "legal",
    "description": "Расторжение договора оказания услуг по соглашению сторон: оплата фактически оказанных услуг, отказ от договора.",
    "actSource": "ст. 450, 453, 782 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "termination-agreement",
      "act-services"
    ],
    "fieldCount": 22
  },
  {
    "id": "refuse-rent",
    "name": "Уведомление об отказе от договора аренды",
    "category": "legal",
    "description": "Уведомление арендодателя или арендатора об отказе от договора аренды: односторонний отказ, срок предупреждения, возврат имущества.",
    "actSource": "ст. 610, 619, 620 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "notice-rent-termination",
      "terminate-rent",
      "claim-rent"
    ],
    "fieldCount": 9
  },
  {
    "id": "refuse-lease",
    "name": "Уведомление об отказе от договора найма",
    "category": "legal",
    "description": "Уведомление наймодателя или нанимателя об отказе от договора найма жилого помещения: срок предупреждения 3 месяца, расторжение.",
    "actSource": "ст. 674, 687 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-daily",
      "terminate-rent",
      "notice-rent-termination"
    ],
    "fieldCount": 8
  },
  {
    "id": "refuse-works",
    "name": "Уведомление об отказе от договора подряда",
    "category": "legal",
    "description": "Уведомление заказчика об отказе от договора подряда: отказ до сдачи результата, оплата пропорционально выполненным работам.",
    "actSource": "ст. 715, 717 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works",
      "claim-works",
      "terminate-works"
    ],
    "fieldCount": 8
  },
  {
    "id": "refuse-services",
    "name": "Уведомление об отказе от договора оказания услуг",
    "category": "legal",
    "description": "Уведомление заказчика или исполнителя об отказе от договора оказания услуг: оплата фактически оказанных услуг, возмещение расходов.",
    "actSource": "ст. 782 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "claim-services",
      "terminate-services"
    ],
    "fieldCount": 8
  },
  {
    "id": "upd",
    "name": "Универсальный передаточный документ (УПД)",
    "category": "finance",
    "description": "УПД — счёт-фактура и передаточный документ в одном: отгрузка товаров, работ, услуг с НДС и без. Статус 1 — для НДС, статус 2 — только передача.",
    "actSource": "ст. 169 НК РФ; Прил. № 1 к Письму ФНС России от 21.10.2013 № ММВ-20-3/96@",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "torg-12",
      "specification-supply",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "loan-graph",
    "name": "График возврата займа",
    "category": "finance",
    "description": "Приложение к договору займа: график погашения по датам и суммам. Равными долями, аннуитет или с процентами в конце.",
    "actSource": "ст. 809–811 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "percent-loan",
      "zero-loan"
    ],
    "fieldCount": 10
  },
  {
    "id": "container-spec",
    "name": "Спецификация тары",
    "category": "business",
    "description": "Приложение к договору поставки: тара и упаковка, возвратная или одноразовая, залоговая стоимость и сроки возврата.",
    "actSource": "ст. 517 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "specification-supply",
      "supply-contract",
      "torg-12"
    ],
    "fieldCount": 9
  },
  {
    "id": "task-services",
    "name": "Задание на оказание услуг",
    "category": "business",
    "description": "Приложение к договору оказания услуг: детализация объёма услуг, требования к результату, сроки и стоимость.",
    "actSource": "ст. 779, 783 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "services-list",
      "act-services"
    ],
    "fieldCount": 9
  },
  {
    "id": "work-plan",
    "name": "Календарный план работ",
    "category": "business",
    "description": "Приложение к договору подряда: этапы работ, сроки выполнения и стоимость каждого этапа.",
    "actSource": "ст. 708 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works",
      "house-repair",
      "act-works"
    ],
    "fieldCount": 6
  },
  {
    "id": "customer-order",
    "name": "Заявка заказчика",
    "category": "business",
    "description": "Заявка на поставку товаров или оказание услуг в рамках рамочного договора: перечень позиций, количество, срок и адрес поставки.",
    "actSource": "ст. 435, 506 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "supply-contract",
      "specification-supply",
      "torg-12"
    ],
    "fieldCount": 9
  },
  {
    "id": "services-list",
    "name": "Перечень оказываемых услуг",
    "category": "business",
    "description": "Приложение к договору оказания услуг: перечень услуг с объёмом и стоимостью каждой позиции.",
    "actSource": "ст. 779 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "service-agreement",
      "task-services",
      "act-services"
    ],
    "fieldCount": 6
  },
  {
    "id": "property-list",
    "name": "Перечень передаваемого имущества",
    "category": "business",
    "description": "Опись имущества, передаваемого в аренду, наём или по договору: наименование, количество и состояние на момент передачи.",
    "actSource": "ст. 606, 607 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "akt-naym",
      "rental-general",
      "act-transfer-auto"
    ],
    "fieldCount": 7
  },
  {
    "id": "ds-loan",
    "name": "Допсоглашение к договору займа",
    "category": "finance",
    "description": "Изменение условий договора займа: срок возврата, процентная ставка, порядок платежей, сумма.",
    "actSource": "ст. 450, 809, 810 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "loan-agreement",
      "percent-loan",
      "loan-graph"
    ],
    "fieldCount": 24
  },
  {
    "id": "ds-works",
    "name": "Допсоглашение к договору подряда",
    "category": "business",
    "description": "Изменение условий договора подряда: сроки работ, стоимость, объём работ.",
    "actSource": "ст. 450, 708, 709 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "contract-works",
      "house-repair",
      "work-plan"
    ],
    "fieldCount": 24
  },
  {
    "id": "ds-supply",
    "name": "Допсоглашение к договору поставки",
    "category": "business",
    "description": "Изменение условий договора поставки: сроки поставки, ассортимент, цена товара.",
    "actSource": "ст. 450, 506 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "supply-contract",
      "equipment-supply",
      "specification-supply"
    ],
    "fieldCount": 24
  },
  {
    "id": "ds-rent-extend",
    "name": "Допсоглашение о продлении аренды",
    "category": "business",
    "description": "Продление договора аренды на новый срок: срок продления, условия, изменение арендной платы.",
    "actSource": "ст. 450, 610, 621 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-general",
      "rental-office",
      "notice-rent-termination"
    ],
    "fieldCount": 23
  },
  {
    "id": "akt-naym",
    "name": "Акт передачи жилого помещения в наём",
    "category": "realty",
    "description": "Акт передачи квартиры/комнаты нанимателю: состояние помещения, показания счётчиков, опись мебели, комплект ключей.",
    "actSource": "ст. 676, 678 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "rental-general",
      "rental-daily",
      "raspiska-money"
    ],
    "fieldCount": 13
  },
  {
    "id": "nda-employee",
    "name": "Соглашение о неразглашении (NDA) с сотрудником",
    "category": "business",
    "description": "Защита коммерческой тайны и конфиденциальной информации работодателя: перечень сведений, обязанности сотрудника, срок действия (в т.ч. 3 года после увольнения) и ответственность.",
    "actSource": "ст. 1465–1470 ГК РФ; ФЗ от 29.07.2004 № 98-ФЗ (ред. от 08.08.2024); ч. 4 ст. 57 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "agreement-confidentiality",
      "employment-contract",
      "gpa-contract"
    ],
    "fieldCount": 17
  },
  {
    "id": "user-agreement",
    "name": "Пользовательское соглашение",
    "category": "business",
    "description": "Публичная оферта для сайта или приложения: порядок акцепта, права и обязанности пользователя и оператора, интеллектуальная собственность, ответственность. Актуально для 2026 года (согласие на ПДн оформляется отдельно).",
    "actSource": "ст. 437, 438, 1286.1 ГК РФ; ФЗ от 27.07.2006 № 152-ФЗ; ст. 18.1 ФЗ от 13.03.2006 № 38-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "privacy-policy",
      "cookie-policy",
      "personal-data-consent"
    ],
    "fieldCount": 9
  },
  {
    "id": "cookie-policy",
    "name": "Политика обработки cookie",
    "category": "business",
    "description": "Политика использования файлов cookie для сайта: категории (функциональные, аналитические, маркетинговые), правовые основания, управление настройками. Штрафы по ст. 13.11 КоАП РФ — до 700 000 руб.",
    "actSource": "ст. 9, 18.1 ФЗ от 27.07.2006 № 152-ФЗ; позиция Роскомнадзора (cookie приравниваются к персональным данным)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "privacy-policy",
      "user-agreement",
      "personal-data-consent"
    ],
    "fieldCount": 7
  },
  {
    "id": "website-development",
    "name": "Договор на разработку сайта",
    "category": "business",
    "description": "Разработка сайта для ИП и малого бизнеса: этапы, техническое задание, права на исходники и контент, домен, приёмка по акту.",
    "actSource": "ст. 702–729, 1235, 1286, 1296 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "site-acceptance-act",
      "design-development",
      "agreement-confidentiality"
    ],
    "fieldCount": 27
  },
  {
    "id": "design-development",
    "name": "Договор на разработку дизайна",
    "category": "business",
    "description": "Разработка дизайн-макетов (сайт, логотип, фирменный стиль, полиграфия): этапы, круги правок, передача исключительных прав после полной оплаты.",
    "actSource": "ст. 702–729, 1259, 1296 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "website-development",
      "site-acceptance-act",
      "agreement-confidentiality"
    ],
    "fieldCount": 24
  },
  {
    "id": "power-attorney",
    "name": "Доверенность (типовая)",
    "category": "business",
    "description": "Универсальная доверенность на представительство: перечень полномочий, срок действия (не более 3 лет), передоверие. Для сделок, требующих нотариальной формы, — доверенность должна быть нотариальной.",
    "actSource": "ст. 185–189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs",
      "sign-power-of-attorney",
      "goods-power-of-attorney"
    ],
    "fieldCount": 17
  },
  {
    "id": "power-attorney-interests",
    "name": "Доверенность на представление интересов",
    "category": "business",
    "description": "Доверенность для представления интересов в государственных органах, судах и организациях: процессуальные и внесудебные полномочия.",
    "actSource": "ст. 185–189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-attorney",
      "court-power-of-attorney",
      "power-of-attorney-docs"
    ],
    "fieldCount": 16
  },
  {
    "id": "power-attorney-mail",
    "name": "Доверенность на получение почты",
    "category": "business",
    "description": "Доверенность на получение корреспонденции, ценных писем, бандеролей и посылок в почтовых отделениях и от курьерских служб.",
    "actSource": "ст. 185–189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-attorney",
      "goods-power-of-attorney",
      "power-of-attorney-docs"
    ],
    "fieldCount": 15
  },
  {
    "id": "letter-of-intent",
    "name": "Соглашение о намерениях (MOA)",
    "category": "business",
    "description": "Меморандум о взаимопонимании: фиксация намерений сторон до заключения основного договора, принципы добросовестных переговоров, конфиденциальность.",
    "actSource": "ст. 429, 434.1 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "simple-partnership",
      "corporate-agreement",
      "agreement-confidentiality"
    ],
    "fieldCount": 23
  },
  {
    "id": "llc-establishment",
    "name": "Договор об учреждении ООО",
    "category": "business",
    "description": "Договор между учредителями о создании ООО: размер уставного капитала, доли участников, порядок и сроки оплаты. Заключается в письменной форме, не является учредительным документом.",
    "actSource": "ст. 89 ГК РФ; ст. 11, 16 ФЗ от 08.02.1998 № 14-ФЗ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "charter-llc",
      "sole-member-decision",
      "llc-meeting-minutes"
    ],
    "fieldCount": 10
  },
  {
    "id": "collective-agreement",
    "name": "Коллективный договор",
    "category": "other",
    "description": "Коллективный договор между работодателем и работниками: оплата труда, рабочее время, отпуска, гарантии и льготы, охрана труда. Срок действия — до 3 лет.",
    "actSource": "гл. 7 ТК РФ (ст. 40–51)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "liability-agreement",
      "gpa-contract"
    ],
    "fieldCount": 12
  },
  {
    "id": "site-acceptance-act",
    "name": "Акт приёмки разработанного сайта",
    "category": "business",
    "description": "Акт сдачи-приёмки сайта по договору разработки: соответствие техническому заданию, замечания, срок устранения, момент перехода исключительных прав.",
    "actSource": "ст. 720, 1296 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "website-development",
      "website-support",
      "act-works"
    ],
    "fieldCount": 24
  },
  {
    "id": "spouse-consent-sell",
    "name": "Согласие супруга(и) на продажу имущества",
    "category": "family",
    "description": "Нотариальное согласие супруга(и) на продажу совместно нажитого имущества (недвижимость, ТС).",
    "actSource": "ст. 34, 35 Семейного кодекса РФ",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [
      "dkp-flat",
      "dkp-auto"
    ],
    "fieldCount": 9
  },
  {
    "id": "marriage-contract",
    "name": "Брачный договор",
    "category": "family",
    "description": "Брачный договор, определяющий имущественные права супругов в браке и при его расторжении.",
    "actSource": "ст. 40–44 СК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [],
    "fieldCount": 11
  },
  {
    "id": "alimony-agreement",
    "name": "Соглашение об уплате алиментов",
    "category": "family",
    "description": "Нотариальное соглашение родителей об уплате алиментов на ребёнка (фикс. сумма или доля дохода).",
    "actSource": "ст. 99–105 СК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [],
    "fieldCount": 13
  },
  {
    "id": "gift-agreement",
    "name": "Договор дарения",
    "category": "family",
    "description": "Договор дарения имущества (квартиры, автомобиля, денег) между родственниками и не только.",
    "actSource": "ст. 572–582 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "dkp-flat",
      "dkp-auto"
    ],
    "fieldCount": 13
  },
  {
    "id": "child-travel-consent",
    "name": "Согласие на выезд ребёнка за границу",
    "category": "family",
    "description": "Согласие одного родителя на выезд несовершеннолетнего ребёнка за границу с указанием страны, срока и сопровождающего.",
    "actSource": "ст. 20, 21 ФЗ-114 «О порядке выезда из РФ»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "passport-intl-app"
    ],
    "fieldCount": 11
  },
  {
    "id": "property-division",
    "name": "Соглашение о разделе совместно нажитого имущества",
    "category": "family",
    "description": "Досудебное соглашение супругов о разделе имущества: недвижимость, автомобиль, денежные средства.",
    "actSource": "ст. 38 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "marriage-contract",
      "spouse-consent-sell"
    ],
    "fieldCount": 11
  },
  {
    "id": "nanny-agreement",
    "name": "Договор с няней (присмотр за ребёнком)",
    "category": "family",
    "description": "Договор возмездного оказания услуг няни: график, оплата, обязанности по присмотру и безопасности ребёнка.",
    "actSource": "гл. 39 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "gpa-contract"
    ],
    "fieldCount": 12
  },
  {
    "id": "will",
    "name": "Завещание",
    "category": "family",
    "description": "Распоряжение имуществом на случай смерти: наследники, доли, завещательный отказ. Удостоверяется нотариусом.",
    "actSource": "ст. 1118-1131 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 14
  },
  {
    "id": "inheritance-acceptance",
    "name": "Заявление о принятии наследства",
    "category": "family",
    "description": "Заявление нотариусу о принятии наследства (ст. 1153 ГК РФ): наследник, наследодатель, состав наследства.",
    "actSource": "ст. 1153-1154 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 11
  },
  {
    "id": "inheritance-refusal",
    "name": "Отказ от наследства",
    "category": "family",
    "description": "Заявление нотариусу об отказе от наследства (ст. 1157 ГК РФ) в пользу других наследников.",
    "actSource": "ст. 1157-1158 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 10
  },
  {
    "id": "spouse-consent-purchase",
    "name": "Согласие супруга на покупку недвижимости",
    "category": "family",
    "description": "Нотариальное согласие супруга на приобретение недвижимости за счёт общих средств брака: описание объекта, срок действия, удостоверение (п. 3 ст. 35 СК РФ).",
    "actSource": "ст. 35 СК РФ, ст. 256 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat",
      "spouse-consent-sell"
    ],
    "fieldCount": 10
  },
  {
    "id": "guardianship-agreement",
    "name": "Договор с опекуном (попечителем)",
    "category": "family",
    "description": "Предварительный договор об осуществлении опеки или попечительства (назначение опекуна над ребёнком или недееспособным лицом).",
    "actSource": "ФЗ-48 «Об опеке и попечительстве», СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "alimony-agreement"
    ],
    "fieldCount": 15
  },
  {
    "id": "spouse-consent-pledge",
    "name": "Согласие супруга на залог имущества",
    "category": "family",
    "description": "Нотариальное согласие супруга на передачу общего имущества в залог (квартира, автомобиль, доля).",
    "actSource": "ст. 35 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "pledge-agreement",
      "spouse-consent-sell"
    ],
    "fieldCount": 13
  },
  {
    "id": "pension-app",
    "name": "Заявление о назначении пенсии",
    "category": "family",
    "description": "Заявление в Социальный фонд России (СФР) о назначении страховой пенсии по старости, инвалидности или по случаю потери кормильца.",
    "actSource": "ФЗ-400 «О страховых пенсиях»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "passport-intl-app"
    ],
    "fieldCount": 14
  },
  {
    "id": "maternity-payment-app",
    "name": "Заявление на выплату пособия (декретные)",
    "category": "family",
    "description": "Заявление о назначении пособия по беременности и родам или единовременного пособия при рождении ребёнка.",
    "actSource": "ФЗ-255, ФЗ-81 «О государственных пособиях»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "maternity-leave-app"
    ],
    "fieldCount": 14
  },
  {
    "id": "family-budget-note",
    "name": "Соглашение о порядке несения семейных расходов",
    "category": "family",
    "description": "Соглашение супругов о порядке несения общих расходов (содержание жилья, детей, образование) и распределении семейного бюджета.",
    "actSource": "ст. 42, 256 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "marriage-contract",
      "alimony-agreement"
    ],
    "fieldCount": 13
  },
  {
    "id": "maternity-capital-app",
    "name": "Заявление о распоряжении материнским капиталом",
    "category": "family",
    "description": "Заявление о распоряжении средствами материнского (семейного) капитала: улучшение жилищных условий, образование, пособие.",
    "actSource": "ФЗ № 256-ФЗ «О дополнительных мерах государственной поддержки семей»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "maternity-payment-app",
      "pension-app"
    ],
    "fieldCount": 10
  },
  {
    "id": "adoption-consent",
    "name": "Согласие на усыновление (удочерение) ребёнка",
    "category": "family",
    "description": "Согласие родителя на усыновление (удочерение) ребёнка, оформляемое в органе опеки или у нотариуса.",
    "actSource": "ст. 129-131 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "guardianship-agreement",
      "alimony-agreement"
    ],
    "fieldCount": 9
  },
  {
    "id": "passport-intl-app",
    "name": "Заявление на загранпаспорт (нового образца)",
    "category": "other",
    "description": "Заявление на получение загранпаспорта нового поколения (биометрического) через ГУВМ МВД.",
    "actSource": "Приказ ФМС России от 26.03.2014 № 211",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [],
    "fieldCount": 16
  },
  {
    "id": "inn-application",
    "name": "Заявление на получение ИНН",
    "category": "other",
    "description": "Заявление физического лица для постановки на учёт и получения ИНН (свидетельства о присвоении ИНН).",
    "actSource": "ст. 83 НК РФ, Приказ ФНС от 11.08.2011 ЯМВ-3-9/306@",
    "lastUpdated": "Июнь 2026",
    "suggestedDocs": [],
    "fieldCount": 13
  },
  {
    "id": "storage-agreement",
    "name": "Договор хранения",
    "category": "other",
    "description": "Хранение движимого имущества (мебели, бытовой техники, авто) физическим лицом или компанией.",
    "actSource": "ст. 886–926 ГК РФ",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "raspiska-money"
    ],
    "fieldCount": 12
  },
  {
    "id": "transport-agreement",
    "name": "Договор перевозки груза",
    "category": "other",
    "description": "Перевозка груза автомобильным транспортом: маршрут, сроки, стоимость, ответственность перевозчика.",
    "actSource": "ст. 784–800 ГК РФ, Устав автомобильного транспорта",
    "lastUpdated": "Июль 2026",
    "suggestedDocs": [
      "invoice",
      "raspiska-money"
    ],
    "fieldCount": 16
  },
  {
    "id": "power-of-attorney-docs",
    "name": "Доверенность на получение документов",
    "category": "other",
    "description": "Доверенность на получение готовых документов (справок, свидетельств, удостоверений) в организациях.",
    "actSource": "ст. 185–189 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 12
  },
  {
    "id": "privacy-policy",
    "name": "Политика конфиденциальности",
    "category": "other",
    "description": "Политика обработки персональных данных для сайта или интернет-сервиса.",
    "actSource": "ст. 3, 9 ФЗ-152 «О персональных данных»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Публичная оферта",
      "Согласие на обработку персональных данных"
    ],
    "fieldCount": 6
  },
  {
    "id": "equipment-lease",
    "name": "Договор аренды спецтехники/оборудования",
    "category": "other",
    "description": "Договор аренды спецтехники или оборудования: с экипажем (ст. 632-641) или без экипажа (ст. 642-649 ГК РФ), арендная плата, порядок передачи и возврата.",
    "actSource": "ст. 632-649 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-transfer-auto",
      "raspiska-money"
    ],
    "fieldCount": 14
  },
  {
    "id": "transport-expedition",
    "name": "Договор транспортной экспедиции",
    "category": "other",
    "description": "Договор транспортной экспедиции: экспедитор организует перевозку груза, оформляет документы, несёт ответственность за утрату и повреждение груза (ст. 803 ГК РФ).",
    "actSource": "ст. 801-806 ГК РФ, ФЗ-87",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "transport-agreement",
      "act-services",
      "invoice"
    ],
    "fieldCount": 13
  },
  {
    "id": "waste-removal",
    "name": "Договор на вывоз ТКО",
    "category": "other",
    "description": "Договор на оказание услуг по обращению с твёрдыми коммунальными отходами с региональным оператором: объём и периодичность вывоза, порядок расчётов, перерасчёт при неоказании.",
    "actSource": "ФЗ-89, ПП РФ № 1156",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "act-services",
      "invoice"
    ],
    "fieldCount": 12
  },
  {
    "id": "passport-replace-app",
    "name": "Заявление на замену паспорта РФ",
    "category": "other",
    "description": "Заявление о замене паспорта гражданина РФ: причина замены, данные заявителя, прилагаемые документы. Госпошлина: 300 руб. (замена), 1500 руб. (взамен утраченного/испорченного).",
    "actSource": "ПП РФ № 828, админрегламент МВД",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [],
    "fieldCount": 10
  },
  {
    "id": "tax-deduction-app",
    "name": "Заявление на налоговый вычет (3-НДФЛ)",
    "category": "other",
    "description": "Заявление в ФНС о возврате НДФЛ в связи с имущественным налоговым вычетом (при покупке жилья, проценты по ипотеке). Подаётся с декларацией 3-НДФЛ (ст. 220 НК РФ).",
    "actSource": "ст. 220 НК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat"
    ],
    "fieldCount": 13
  },
  {
    "id": "guarantee-letter",
    "name": "Гарантийное письмо",
    "category": "other",
    "description": "Гарантийное письмо организации об оплате товаров, работ или услуг в установленный срок с обязательством исполнения.",
    "actSource": "ст. 160, 368-377 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "invoice"
    ],
    "fieldCount": 9
  },
  {
    "id": "self-employed-registration",
    "name": "Заявление о постановке на учёт самозанятого",
    "category": "other",
    "description": "Заявление о постановке на учёт в качестве налогоплательщика налога на профессиональный доход (самозанятого).",
    "actSource": "ФЗ № 422-ФЗ «О проведении эксперимента по установлению специального налогового режима НПД»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "inn-application",
      "tax-deduction-app"
    ],
    "fieldCount": 10
  },
  {
    "id": "ip-registration",
    "name": "Заявление о регистрации в качестве ИП",
    "category": "other",
    "description": "Заявление о государственной регистрации физического лица в качестве индивидуального предпринимателя (форма Р21001).",
    "actSource": "ФЗ № 129-ФЗ «О государственной регистрации юридических лиц и индивидуальных предпринимателей», форма Р21001",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "inn-application",
      "self-employed-registration"
    ],
    "fieldCount": 11
  },
  {
    "id": "personal-data-consent",
    "name": "Согласие на обработку персональных данных",
    "category": "other",
    "description": "Согласие на обработку персональных данных: перечень данных, цели обработки, срок действия, порядок отзыва.",
    "actSource": "ст. 9 ФЗ № 152-ФЗ «О персональных данных»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "privacy-policy",
      "resignation-letter"
    ],
    "fieldCount": 10
  },
  {
    "id": "resignation-letter",
    "name": "Заявление об увольнении по собственному желанию",
    "category": "other",
    "description": "Заявление работника об увольнении по собственному желанию с указанием даты и оснований (отработка 2 недели).",
    "actSource": "ст. 80 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "employment-contract",
      "transfer-order-t5"
    ],
    "fieldCount": 8
  },
  {
    "id": "visa-invitation",
    "name": "Визовое приглашение для иностранного гражданина",
    "category": "migration",
    "description": "Приглашение на въезд иностранного гражданина в РФ: приглашающая сторона, данные гостя, цель и сроки поездки.",
    "actSource": "ФЗ-114 «О порядке выезда из РФ и въезда в РФ»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "passport-intl-app"
    ],
    "fieldCount": 13
  },
  {
    "id": "migration-notification",
    "name": "Уведомление о прибытии иностранного гражданина (форма № 7)",
    "category": "migration",
    "description": "Уведомление о прибытии иностранного гражданина в место пребывания (форма № 7): данные принимающей стороны и иностранца, миграционная карта, адрес пребывания. Срок подачи — 7 рабочих дней.",
    "actSource": "ФЗ-109 «О миграционном учёте», приказ МВД № 856",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "visa-invitation"
    ],
    "fieldCount": 13
  },
  {
    "id": "temp-registration-consent",
    "name": "Согласие собственника на временную регистрацию",
    "category": "migration",
    "description": "Согласие собственника жилого помещения на временную регистрацию по месту пребывания: данные собственника и вселяемого, адрес, срок регистрации, основание права собственности.",
    "actSource": "ст. 80 ЖК РФ, Постановление Правительства РФ № 713, Приказ МВД России № 984",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "migration-notification"
    ],
    "fieldCount": 10
  },
  {
    "id": "temporary-residence-app",
    "name": "Заявление о выдаче разрешения на временное проживание (РВП)",
    "category": "migration",
    "description": "Заявление иностранного гражданина о выдаче разрешения на временное проживание в РФ (РВП) с указанием оснований.",
    "actSource": "ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "visa-invitation",
      "patent-app"
    ],
    "fieldCount": 14
  },
  {
    "id": "citizenship-app",
    "name": "Заявление о приёме в гражданство РФ",
    "category": "migration",
    "description": "Заявление о приёме в гражданство РФ в общем или упрощённом порядке с указанием оснований и биографических данных.",
    "actSource": "ФЗ № 62-ФЗ «О гражданстве Российской Федерации»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "temporary-residence-app",
      "patent-app"
    ],
    "fieldCount": 13
  },
  {
    "id": "patent-app",
    "name": "Заявление на патент для работы в РФ",
    "category": "migration",
    "description": "Заявление иностранного гражданина о выдаче патента для осуществления трудовой деятельности в РФ.",
    "actSource": "ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "visa-invitation",
      "temporary-residence-app"
    ],
    "fieldCount": 12
  },
  {
    "id": "residence-permit-app",
    "name": "Заявление о выдаче вида на жительство",
    "category": "migration",
    "description": "Заявление о выдаче вида на жительство в РФ: основания, биографические данные, доход, обязательства.",
    "actSource": "ст. 8 ФЗ № 115-ФЗ «О правовом положении иностранных граждан»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "temporary-residence-app",
      "citizenship-app"
    ],
    "fieldCount": 13
  },
  {
    "id": "claim-letter",
    "name": "Досудебная претензия по договору",
    "category": "legal",
    "description": "Претензия контрагенту: нарушение сроков, качества, оплаты. Требование с сроком ответа — обязательный этап до суда.",
    "actSource": "ст. 452, 483 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "lawsuit-statement"
    ],
    "fieldCount": 14
  },
  {
    "id": "lawsuit-statement",
    "name": "Исковое заявление о взыскании долга",
    "category": "legal",
    "description": "Иск о взыскании долга по договору или расписке: сумма, неустойка, госпошлина, расчёт.",
    "actSource": "ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter"
    ],
    "fieldCount": 16
  },
  {
    "id": "claim-generic",
    "name": "Претензия (универсальная)",
    "category": "legal",
    "description": "Универсальная досудебная претензия к контрагенту: требование об исполнении обязательства, возврате денег, уплате неустойки.",
    "actSource": "ст. 4 АПК РФ, ст. 132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-letter",
      "lawsuit-statement"
    ],
    "fieldCount": 11
  },
  {
    "id": "court-order-app",
    "name": "Заявление о выдаче судебного приказа",
    "category": "legal",
    "description": "Заявление о выдаче судебного приказа о взыскании денежных сумм по бесспорным требованиям (долг, алименты, задолженность).",
    "actSource": "ст. 121-130 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "claim-generic"
    ],
    "fieldCount": 10
  },
  {
    "id": "refund-claim",
    "name": "Претензия на возврат товара",
    "category": "legal",
    "description": "Претензия продавцу о возврате денег за товар ненадлежащего качества: недостатки, требование, сроки возврата.",
    "actSource": "ст. 18-24 Закона «О защите прав потребителей»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "retail-sale"
    ],
    "fieldCount": 11
  },
  {
    "id": "debt-lawsuit",
    "name": "Исковое заявление о взыскании задолженности",
    "category": "legal",
    "description": "Исковое заявление в суд о взыскании задолженности по договору: долг, неустойка, проценты, судебные расходы.",
    "actSource": "ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "claim-generic"
    ],
    "fieldCount": 12
  },
  {
    "id": "objection-debt-claim",
    "name": "Возражение на исковое заявление о взыскании задолженности",
    "category": "legal",
    "description": "Возражения ответчика на исковое заявление о взыскании задолженности по договору.",
    "actSource": "ст. 149 АПК РФ, ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "Исковое заявление о взыскании задолженности",
      "Исковое заявление о взыскании долга"
    ],
    "fieldCount": 8
  },
  {
    "id": "divorce-lawsuit",
    "name": "Исковое заявление о расторжении брака и взыскании алиментов",
    "category": "legal",
    "description": "Исковое заявление в мировой суд о расторжении брака и взыскании алиментов на ребёнка: реквизиты суда и сторон, основания, требования, приложения (ст. 21 СК, ст. 131 ГПК).",
    "actSource": "ст. 21-23 СК РФ, ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "alimony-agreement",
      "property-division"
    ],
    "fieldCount": 15
  },
  {
    "id": "consumer-lawsuit",
    "name": "Исковое заявление о защите прав потребителей",
    "category": "legal",
    "description": "Иск потребителя: недостатки товара/услуги, требования (возврат денег, неустойка, компенсация морального вреда). Подсудность — по выбору истца (ст. 17), госпошлина до 1 млн руб. не уплачивается.",
    "actSource": "Закон РФ «О защите прав потребителей», ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "refund-claim",
      "claim-generic"
    ],
    "fieldCount": 16
  },
  {
    "id": "appeal-complaint",
    "name": "Апелляционная жалоба",
    "category": "legal",
    "description": "Апелляционная жалоба на решение суда первой инстанции: реквизиты суда, решение, на которое подаётся, доводы, требования. Срок подачи — 1 месяц (ст. 321 ГПК РФ).",
    "actSource": "ст. 320-322 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-lawsuit",
      "divorce-lawsuit"
    ],
    "fieldCount": 12
  },
  {
    "id": "ddu-penalty-lawsuit",
    "name": "Исковое о взыскании неустойки по ДДУ",
    "category": "legal",
    "description": "Иск участника долевого строительства о взыскании неустойки за просрочку передачи квартиры: 1/150 ставки рефинансирования для физлиц за каждый день просрочки (ч. 2 ст. 6 214-ФЗ).",
    "actSource": "214-ФЗ, ст. 131-132 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "dkp-flat",
      "consumer-lawsuit"
    ],
    "fieldCount": 17
  },
  {
    "id": "bankruptcy-app",
    "name": "Заявление о признании гражданина банкротом",
    "category": "legal",
    "description": "Заявление физлица в арбитражный суд о признании банкротом: сумма и перечень долгов, просрочка более 3 месяцев, невозможность исполнения обязательств, приложения и просьба о процедуре реализации имущества.",
    "actSource": "ст. 213.3-213.4 ФЗ-127 «О несостоятельности (банкротстве)»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "ddu-penalty-lawsuit",
      "consumer-lawsuit"
    ],
    "fieldCount": 13
  },
  {
    "id": "cassation-complaint",
    "name": "Кассационная жалоба",
    "category": "legal",
    "description": "Кассационная жалоба на решение суда, вступившее в законную силу, с указанием оснований для отмены судебных постановлений.",
    "actSource": "гл. 41 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "appeal-complaint",
      "objection-debt-claim"
    ],
    "fieldCount": 13
  },
  {
    "id": "counterclaim",
    "name": "Встречное исковое заявление",
    "category": "legal",
    "description": "Встречное исковое заявление, предъявляемое ответчиком для совместного рассмотрения с первоначальным иском.",
    "actSource": "ст. 137, 138 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-lawsuit",
      "claim-generic"
    ],
    "fieldCount": 14
  },
  {
    "id": "claim-labor",
    "name": "Исковое заявление о восстановлении на работе",
    "category": "legal",
    "description": "Иск работника о восстановлении на работе, взыскании среднего заработка за время вынужденного прогула и компенсации морального вреда.",
    "actSource": "ст. 391, 394 ТК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "objection-debt-claim"
    ],
    "fieldCount": 15
  },
  {
    "id": "inheritance-claim",
    "name": "Исковое заявление о признании права собственности в порядке наследования",
    "category": "legal",
    "description": "Иск наследника о признании права собственности на наследственное имущество, включении имущества в наследственную массу.",
    "actSource": "ст. 1111, 1152-1154 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "notary-power-of-attorney"
    ],
    "fieldCount": 16
  },
  {
    "id": "eviction-claim",
    "name": "Исковое заявление о выселении",
    "category": "legal",
    "description": "Иск собственника жилого помещения о выселении нанимателя и членов его семьи без предоставления другого жилого помещения.",
    "actSource": "ст. 35 ЖК РФ, ст. 688 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "housing-claim"
    ],
    "fieldCount": 14
  },
  {
    "id": "alimony-claim",
    "name": "Исковое заявление о взыскании алиментов",
    "category": "legal",
    "description": "Иск о взыскании алиментов на несовершеннолетних детей в твёрдой денежной сумме или в долях к заработку родителя.",
    "actSource": "ст. 80-83 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "divorce-lawsuit",
      "alimony-agreement"
    ],
    "fieldCount": 15
  },
  {
    "id": "property-claim",
    "name": "Исковое заявление о разделе совместно нажитого имущества",
    "category": "legal",
    "description": "Иск супруга о разделе совместно нажитого имущества с определением долей и порядка выдела имущества в натуре.",
    "actSource": "ст. 38, 39 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "divorce-lawsuit",
      "property-division"
    ],
    "fieldCount": 15
  },
  {
    "id": "housing-claim",
    "name": "Исковое заявление о признании права пользования жилым помещением",
    "category": "legal",
    "description": "Иск о признании права пользования жилым помещением и вселении, если право пользования оспаривается.",
    "actSource": "ст. 69, 70 ЖК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "eviction-claim",
      "claim-generic"
    ],
    "fieldCount": 12
  },
  {
    "id": "recovery-loss-claim",
    "name": "Исковое заявление о взыскании убытков",
    "category": "legal",
    "description": "Иск о взыскании убытков, причинённых неисполнением или ненадлежащим исполнением обязательств, включая упущенную выгоду.",
    "actSource": "ст. 15, 393 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-lawsuit",
      "claim-generic"
    ],
    "fieldCount": 16
  },
  {
    "id": "court-power-of-attorney",
    "name": "Доверенность на ведение дела в суде",
    "category": "legal",
    "description": "Доверенность на представительство в суде: ведение дела, подача документов, получение решений и исполнительных листов.",
    "actSource": "ст. 185-187 ГК РФ, ст. 53 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs",
      "postal-power-of-attorney"
    ],
    "fieldCount": 11
  },
  {
    "id": "renunciation-inheritance",
    "name": "Заявление об отказе от наследства",
    "category": "legal",
    "description": "Заявление наследника об отказе от наследства, подаваемое нотариусу по месту открытия наследства.",
    "actSource": "ст. 1157-1158 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "inheritance-claim",
      "power-of-attorney-docs"
    ],
    "fieldCount": 12
  },
  {
    "id": "paternity-claim",
    "name": "Исковое заявление об установлении отцовства",
    "category": "legal",
    "description": "Иск об установлении отцовства в отношении ребёнка и взыскании алиментов, если отец не записан в свидетельстве о рождении.",
    "actSource": "ст. 49, 53 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "alimony-claim",
      "claim-generic"
    ],
    "fieldCount": 13
  },
  {
    "id": "child-residence-claim",
    "name": "Исковое заявление об определении места жительства ребёнка",
    "category": "legal",
    "description": "Иск об определении места жительства несовершеннолетнего ребёнка при раздельном проживании родителей.",
    "actSource": "ст. 65 СК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "divorce-lawsuit",
      "parenting-plan"
    ],
    "fieldCount": 14
  },
  {
    "id": "invalid-transaction-claim",
    "name": "Исковое заявление о признании сделки недействительной",
    "category": "legal",
    "description": "Иск о признании сделки недействительной и применении последствий её недействительности (ничтожная или оспоримая сделка).",
    "actSource": "ст. 166-179 ГК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "claim-generic",
      "property-claim"
    ],
    "fieldCount": 15
  },
  {
    "id": "private-complaint",
    "name": "Частная жалоба на определение суда",
    "category": "legal",
    "description": "Частная жалоба на определение суда первой инстанции (об отказе в удовлетворении ходатайства, о наложении штрафа и др.).",
    "actSource": "ст. 331-335 ГПК РФ",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "appeal-complaint",
      "cassation-complaint"
    ],
    "fieldCount": 12
  },
  {
    "id": "enforcement-suspension-app",
    "name": "Заявление о приостановлении исполнительного производства",
    "category": "legal",
    "description": "Заявление о приостановлении исполнительного производства (оспоривание исполнительного документа, подача иска и др.).",
    "actSource": "ст. 39, 40 ФЗ «Об исполнительном производстве»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "debt-lawsuit",
      "objection-debt-claim"
    ],
    "fieldCount": 12
  },
  {
    "id": "postal-power-of-attorney",
    "name": "Доверенность на получение почтовых отправлений",
    "category": "postal",
    "description": "Доверенность на получение почтовых отправлений в отделении Почты России: ФИО и паспорт представителя, перечень отправлений, срок действия. Может удостоверяться оператором бесплатно.",
    "actSource": "ст. 185-189 ГК РФ, ФЗ-176 «О почтовой связи»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "power-of-attorney-docs"
    ],
    "fieldCount": 12
  },
  {
    "id": "postal-search-app",
    "name": "Заявление на розыск почтового отправления",
    "category": "postal",
    "description": "Заявление о розыске почтового отправления в отделении Почты России: трек-номер, дата отправки, адреса отправителя и получателя, сумма объявленной ценности.",
    "actSource": "ст. 37 ФЗ-176 «О почтовой связи»",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "postal-power-of-attorney"
    ],
    "fieldCount": 12
  },
  {
    "id": "mail-notice",
    "name": "Уведомление о получении почтового отправления",
    "category": "postal",
    "description": "Уведомление отправителя о получении почтового отправления адресатом с указанием номера отправления и даты получения.",
    "actSource": "Правила оказания услуг почтовой связи (Приказ Минцифры России)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "postal-power-of-attorney",
      "postal-search-app"
    ],
    "fieldCount": 10
  },
  {
    "id": "mail-return-app",
    "name": "Заявление на возврат почтового отправления",
    "category": "postal",
    "description": "Заявление отправителя о возврате почтового отправления отправителю либо об изменении адреса доставки.",
    "actSource": "Правила оказания услуг почтовой связи (Приказ Минцифры России)",
    "lastUpdated": "Август 2026",
    "suggestedDocs": [
      "postal-search-app",
      "postal-power-of-attorney"
    ],
    "fieldCount": 10
  },
  {
    "id": "stmt-fssp-execution",
    "name": "Заявление о возбуждении исполнительного производства",
    "category": "legal",
    "description": "Заявление судебному приставу о возбуждении исполнительного производства: шапка «куда/от кого», основание (исполнительный лист), сумма, реквизиты для перечисления. Пристав возбуждает ИП за 3 дня.",
    "actSource": "ФЗ № 229-ФЗ «Об исполнительном производстве» (ст. 30)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "claim-generic",
      "lawsuit-statement"
    ],
    "fieldCount": 11,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-prosecutor-complaint",
    "name": "Жалоба в прокуратуру",
    "category": "legal",
    "description": "Жалоба в прокуратуру на нарушение прав: шапка, суть нарушения, какие законы нарушены, требование провести проверку. Срок рассмотрения — 30 дней.",
    "actSource": "ФЗ № 59-ФЗ «О порядке рассмотрения обращений граждан», ФЗ «О прокуратуре РФ»",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "claim-generic",
      "lawsuit-statement"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-vacation",
    "name": "Заявление о предоставлении отпуска (вне графика)",
    "category": "business",
    "description": "Заявление работодателю о предоставлении ежегодного оплачиваемого отпуска: даты начала и длительность. Оплачиваемый отпуск — 28 календарных дней в год.",
    "actSource": "ТК РФ (ст. 114, 122–123)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "employment-contract",
      "vacation-order"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-housing-recalc",
    "name": "Заявление о перерасчёте платы за ЖКУ",
    "category": "realty",
    "description": "Заявление в управляющую компанию о перерасчёте платы за коммунальные услуги: временное отсутствие, некачественная услуга или ошибка в начислениях.",
    "actSource": "ПП РФ № 354 (п. 86–97), ЖК РФ (ст. 157)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "claim-generic",
      "lawsuit-statement"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-court-postpone",
    "name": "Ходатайство об отложении судебного заседания",
    "category": "legal",
    "description": "Ходатайство в суд об отложении заседания: уважительная причина (болезнь, командировка) + просьба не рассматривать без участия. Подаётся до заседания.",
    "actSource": "ГПК РФ (ст. 167), АПК РФ (ст. 158)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "objection-debt-claim"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-fssp-minimum",
    "name": "Заявление приставу о сохранении прожиточного минимума",
    "category": "legal",
    "description": "Заявление судебному приставу о сохранении зарплаты и иных доходов в размере прожиточного минимума: пристав выносит постановление, банк снимает ограничения сверх минимума.",
    "actSource": "ФЗ № 229-ФЗ «Об исполнительном производстве» (ст. 30, 64.1, 101), ГПК РФ (ст. 446)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "lawsuit-statement"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-delay",
    "name": "Заявление об отсрочке или рассрочке исполнения",
    "category": "legal",
    "description": "Просьба в суд об отсрочке или рассрочке исполнения решения: тяжёлое материальное положение, болезнь, иные уважительные обстоятельства. Пристав исполнение не откладывает — решает суд.",
    "actSource": "ФЗ № 229-ФЗ (ст. 37), ГПК РФ (ст. 203)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "lawsuit-statement"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-complaint",
    "name": "Жалоба на действия судебного пристава",
    "category": "legal",
    "description": "Жалоба старшему судебному приставу на действие/бездействие пристава: срок подачи — 10 дней с момента нарушения, рассмотрение — 10 дней. Либо сразу в суд.",
    "actSource": "ФЗ № 229-ФЗ (ст. 121–126)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-court-evidence",
    "name": "Ходатайство об истребовании доказательств",
    "category": "legal",
    "description": "Просьба к суду запросить доказательства, которые вы не можете получить сами: выписки, записи, документы у ответчика или госорганов. Укажите, что доказывает и где находится.",
    "actSource": "ГПК РФ (ст. 57), АПК РФ (ст. 66)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-postpone"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-expertise",
    "name": "Ходатайство о назначении судебной экспертизы",
    "category": "legal",
    "description": "Просьба назначить экспертизу (почерковедческую, строительную, оценочную): формулируйте вопросы эксперту сами — суд ставит их с учётом вашего списка. Расходы — с проигравшей стороны.",
    "actSource": "ГПК РФ (ст. 79, 80, 98)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-evidence"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-fee-delay",
    "name": "Ходатайство об отсрочке уплаты госпошлины",
    "category": "legal",
    "description": "Просьба отсрочить/рассрочить госпошлину или уменьшить её размер: прикладывается к иску. Нужны доказательства тяжёлого материального положения.",
    "actSource": "ГПК РФ (ст. 90), НК РФ (ст. 333.20, 333.41)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "claim-generic"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-security",
    "name": "Заявление об обеспечении иска",
    "category": "legal",
    "description": "Просьба арестовать имущество ответчика или запретить ему действия до решения суда: иначе ответчик успеет продать квартиру или вывести деньги. Суд решает в день подачи.",
    "actSource": "ГПК РФ (ст. 139–142)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-expertise"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-housing-quality",
    "name": "Жалоба на некачественные коммунальные услуги",
    "category": "realty",
    "description": "Жалоба в УК на некачественную услугу (холодные батареи, грязная вода, неубранный подъезд): требуйте акт проверки, перерасчёт и устранение. УК обязана проверить в течение 2 часов.",
    "actSource": "ПП РФ № 354 (п. 104–113), ЖК РФ (ст. 157)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-recalc",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-housing-flood",
    "name": "Заявление о заливе квартиры (составление акта)",
    "category": "realty",
    "description": "Заявление в УК о заливе квартиры: требуйте составить акт осмотра в течение 12 часов — без акта суд не взыщет ущерб. Фиксируйте всё на фото до прихода комиссии.",
    "actSource": "ПП РФ № 491 (п. 152), ГК РФ (ст. 1064), ЖК РФ (ст. 161)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-quality",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-rospotrebnadzor",
    "name": "Жалоба в Роспотребнадзор",
    "category": "legal",
    "description": "Жалоба в Роспотребнадзор на продавца/исполнителя: обсчёт, просрочка, отказ в возврате, антисанитария. Сначала направьте претензию продавцу — это усилит жалобу.",
    "actSource": "ФЗ № 59-ФЗ, Закон «О защите прав потребителей» (ст. 40), ФЗ № 52-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "claim-generic",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-gti-complaint",
    "name": "Жалоба в трудовую инспекцию (ГИТ)",
    "category": "business",
    "description": "Жалоба в ГИТ на работодателя: задержка зарплаты, неоформление, незаконное увольнение. Можно просить не разглашать имя работодателю — инспекция обязана сохранить конфиденциальность.",
    "actSource": "ТК РФ (ст. 356–357), ФЗ № 59-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "lawsuit-statement"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-hr-dismiss",
    "name": "Заявление об увольнении по собственному желанию (в период отпуска)",
    "category": "business",
    "description": "Заявление об увольнении по собственному желанию: предупреждение за 2 недели, в последний день — трудовая и полный расчёт. До истечения срока можно отозвать.",
    "actSource": "ТК РФ (ст. 80)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "employment-contract"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-salary",
    "name": "Заявление о выплате задержанной зарплаты",
    "category": "business",
    "description": "Требование работодателю погасить долг по зарплате с компенсацией: за каждый день просрочки — 1/150 ключевой ставки ЦБ. При задержке over 15 дней можно приостановить работу.",
    "actSource": "ТК РФ (ст. 142, 236)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-gti-complaint",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-police-theft",
    "name": "Заявление в полицию о краже",
    "category": "legal",
    "description": "Заявление о краже: дежурная часть обязана принять в любое время, выдать талон-уведомление. Решение о возбуждении дела — за 3 суток (до 30 при проверке).",
    "actSource": "УПК РФ (ст. 141, 144), УК РФ (ст. 158)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-fraud",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-fraud",
    "name": "Заявление в полицию о мошенничестве",
    "category": "legal",
    "description": "Заявление о мошенничестве (включая онлайн/телефонное): распишите, как вошли в доверие и куда ушли деньги. Приложите переписку, чеки переводов, номера телефонов.",
    "actSource": "УПК РФ (ст. 141, 144), УК РФ (ст. 159)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-missing",
    "name": "Заявление в полицию о пропаже человека",
    "category": "legal",
    "description": "Заявление о безвестном исчезновении: подавайте сразу, правило «ждать 3 дня» — миф. Укажите приметы, одежду, телефон, последнее место. Примут в любом отделе.",
    "actSource": "УПК РФ (ст. 141), ФЗ «О полиции» (ст. 12)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "stmt-police-fraud"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-hr-maternity",
    "name": "Заявление о предоставлении отпуска по уходу за ребёнком",
    "category": "business",
    "description": "Заявление на отпуск по уходу до 1,5/3 лет + пособие: подаёт мать, отец, бабушка — любой фактически ухаживающий. Пособие — 40% заработка. Место сохраняется.",
    "actSource": "ТК РФ (ст. 256), ФЗ № 255-ФЗ (ст. 11.1–11.2)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "stmt-hr-dismiss"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-remote",
    "name": "Заявление о переводе на дистанционную работу",
    "category": "business",
    "description": "Просьба перевести на удалёнку: по соглашению сторон или временно (до 6 месяцев). Временный перевод по инициативе работодателя — только в исключительных случаях.",
    "actSource": "ТК РФ (ст. 72, гл. 49.1, ст. 312.1–312.9)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "employment-contract"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-court-witness",
    "name": "Ходатайство о вызове свидетелей",
    "category": "legal",
    "description": "Просьба допросить свидетелей: укажите ФИО, адрес и какие факты подтвердит каждый. Без пояснения «что подтвердит» суд может отказать.",
    "actSource": "ГПК РФ (ст. 55, 69), АПК РФ (ст. 56, 88)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-evidence"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-docs",
    "name": "Заявление о выдаче судебного решения и исполнительных документов",
    "category": "legal",
    "description": "Просьба выдать копию решения и исполнительный лист: без исполнительного листа приставы не возбудят производство. Подаётся после вступления решения в силу.",
    "actSource": "ГПК РФ (ст. 214, 428–429), АПК РФ (ст. 319)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-appeal",
    "name": "Апелляционная жалоба на решение суда",
    "category": "legal",
    "description": "Жалоба на решение мирового/районного суда в апелляцию: срок — месяц со дня принятия в окончательной форме. Подаётся через суд, вынесший решение. Новые доказательства — только если не могли представить раньше.",
    "actSource": "ГПК РФ (ст. 320–322, 328)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-postpone"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-order-cancel",
    "name": "Возражение на судебный приказ (отмена)",
    "category": "legal",
    "description": "Отмена судебного приказа одним заявлением: срок — 10 дней с получения. Мотивировать не нужно — достаточно «не согласен». Суд отменяет, взыскатель идёт с иском.",
    "actSource": "ГПК РФ (ст. 128–130)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-appeal"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-fssp-search",
    "name": "Заявление о розыске должника и его имущества",
    "category": "legal",
    "description": "Просьба объявить розыск должника/ребёнка/имущества: пристав выносит постановление в 3-дневный срок. По алиментам и возмещению вреда — розыск обязателен.",
    "actSource": "ФЗ № 229-ФЗ (ст. 65)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "stmt-fssp-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-travel-ban",
    "name": "Заявление об ограничении выезда должника",
    "category": "legal",
    "description": "Просьба запретить должнику выезд за границу: порог — 30 000 ₽ (10 000 ₽ по алиментам и возмещению вреда). Пристав обязан рассмотреть и вынести постановление.",
    "actSource": "ФЗ № 229-ФЗ (ст. 67)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "stmt-fssp-search"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-housing-meter",
    "name": "Заявление о вводе счётчиков в эксплуатацию (опломбировка)",
    "category": "realty",
    "description": "Заявка в УК на ввод ИПУ в эксплуатацию: после установки счётчиков без акта их не примут к расчётам. УК обязана прийти в согласованную дату.",
    "actSource": "ПП РФ № 354 (п. 81–81(9))",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-recalc",
      "stmt-housing-quality"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-housing-capital",
    "name": "Заявление о проведении капремонта / жалоба на его отсутствие",
    "category": "realty",
    "description": "Обращение о капремонте дома: взносы платят все, а ремонт откладывают. Требуйте включить дом в краткосрочную программу или перенести сроки.",
    "actSource": "ЖК РФ (ст. 166–174, 189–191)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-quality",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-mil-postpone",
    "name": "Заявление об отсрочке от призыва",
    "category": "other",
    "description": "Заявление в призывную комиссию об отсрочке: учёба, здоровье, семейные обстоятельства. Прикладывайте документы заранее — комиссия решает на основании дела.",
    "actSource": "ФЗ № 53-ФЗ «О воинской обязанности» (ст. 24)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-mil-appeal",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "military"
  },
  {
    "id": "stmt-mil-appeal",
    "name": "Жалоба на решение призывной комиссии",
    "category": "other",
    "description": "Обжалование решения о призыве: в вышестоящую комиссию или в суд. Подача жалобы приостанавливает отправку до рассмотрения.",
    "actSource": "ФЗ № 53-ФЗ (ст. 28), КАС РФ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-mil-postpone",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "military"
  },
  {
    "id": "stmt-notary-inherit",
    "name": "Заявление нотариусу о принятии наследства",
    "category": "family",
    "description": "Заявление нотариусу о принятии наследства: срок — 6 месяцев со дня смерти. Пропустили срок — только через суд (восстановление) или фактическое принятие с доказательствами.",
    "actSource": "ГК РФ (ст. 1112–1115, 1152–1154)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "claim-generic"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-divorce-alimony-order",
    "name": "Заявление о взыскании алиментов (судебный приказ)",
    "category": "family",
    "description": "Алименты в долях через судебный приказ — за 5 дней без заседаний: 1/4 на одного ребёнка, 1/3 на двоих, 1/2 на троих. Если нужна твёрдая сумма — подавайте иск.",
    "actSource": "СК РФ (ст. 80–83, 106–108), ГПК РФ (ст. 122–124)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-order-cancel"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-bank-chargeback",
    "name": "Заявление в банк об оспаривании операции (чарджбэк)",
    "category": "finance",
    "description": "Оспаривание списания: несанкционированная операция или неоказанная услуга. По 161-ФЗ сообщите банку немедленно — иначе в возмещении могут отказать.",
    "actSource": "ФЗ № 161-ФЗ «О НПС» (ст. 9), ГК РФ (ст. 854, 1102)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-fraud",
      "claim-generic"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-bank-restructure",
    "name": "Заявление о реструктуризации кредита / кредитных каникулах",
    "category": "finance",
    "description": "Просьба о кредитных каникулах или реструктуризации: при падении дохода на 30%+ имеете право на льготный период до 6 месяцев. Банк обязан рассмотреть за 5 дней.",
    "actSource": "ФЗ № 353-ФЗ «О потребительском кредите» (ст. 6.1-1, 6.1-2)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-chargeback",
      "claim-generic"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-insurance-refuse",
    "name": "Заявление об отказе от страховки по кредиту (период охлаждения)",
    "category": "finance",
    "description": "Отказ от навязанной страховки: 30 дней на возврат полной премии (если не было страховых случаев). Деньги возвращают за 7 рабочих дней.",
    "actSource": "Указание ЦБ № 3854-У, ГК РФ (ст. 958)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-restructure",
      "stmt-rospotrebnadzor"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-rent-deposit",
    "name": "Требование о возврате залога за аренду",
    "category": "realty",
    "description": "Досудебное требование арендодателю вернуть обеспечительный платёж: квартира сдана без замечаний, удержание незаконно. Следующий шаг — суд с процентами.",
    "actSource": "ГК РФ (ст. 329, 381.1, 622)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-recalc",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-tax-deduction",
    "name": "Заявление на налоговый вычет (ИИС/имущественный/социальный)",
    "category": "other",
    "description": "Заявление в налоговую о возврате НДФЛ: имущественный (покупка жилья), социальный (лечение, обучение), инвестиционный (ИИС). Подаётся с декларацией 3-НДФЛ.",
    "actSource": "НК РФ (ст. 78, 219–221)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-chargeback",
      "claim-generic"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-cb-complaint",
    "name": "Жалоба в Банк России (на банк/МФО/страховую)",
    "category": "finance",
    "description": "Жалоба в ЦБ на финансовую организацию: навязывание услуг, блокировка счёта, отказ в каникулах. ЦБ не решает денежные споры, но штрафует и обязывает устранить нарушение.",
    "actSource": "ФЗ № 86-ФЗ (ст. 4, 76.1), ФЗ № 59-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-chargeback",
      "stmt-fin-ombudsman"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-fin-ombudsman",
    "name": "Обращение к финансовому уполномоченному",
    "category": "finance",
    "description": "Досудебное взыскание с банка/СК/МФО до 500 000 ₽: решение омбудсмена обязательно для организации (как исполнительный документ). В суд — только после омбудсмена.",
    "actSource": "ФЗ № 123-ФЗ «Об уполномоченном по правам потребителей финансовых услуг»",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-cb-complaint",
      "stmt-bank-chargeback"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-gibdd-appeal",
    "name": "Жалоба на постановление ГИБДД (штраф)",
    "category": "auto",
    "description": "Обжалование штрафа ГИБДД: 10 суток с получения. Вышестоящему должностному лицу или в суд — на выбор. Камера ошиблась, за рулём были не вы — шансы высоки.",
    "actSource": "КоАП РФ (ст. 30.1–30.3)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-prosecutor-complaint",
      "claim-generic"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-fssp-excess-return",
    "name": "Заявление о возврате излишне удержанных приставом сумм",
    "category": "legal",
    "description": "Возврат переплаты: пристав удержал больше долга или списал с защищённых выплат (пособия, алименты). Деньги возвращают с депозита ОСП, а если ушли взыскателю — через суд.",
    "actSource": "ФЗ № 229-ФЗ (ст. 70, 110–111)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-complaint",
      "stmt-fssp-minimum"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-seizure-lift",
    "name": "Заявление о снятии ареста со счёта и имущества пристава",
    "category": "legal",
    "description": "Снятие ареста после погашения долга — или с защищённых счетов (зарплатные, детские пособия). Пристав снимает арест постановлением в день погашения.",
    "actSource": "ФЗ № 229-ФЗ (ст. 80–81)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "stmt-fssp-excess-return"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-alimony-debt",
    "name": "Заявление о расчёте задолженности по алиментам",
    "category": "family",
    "description": "Расчёт долга по алиментам от пристава: постановление нужно для неустойки (0,1% в день), лишения прав и уголовной статьи 157 УК. Обжалуется в суде за 10 дней.",
    "actSource": "СК РФ (ст. 113), ФЗ № 229-ФЗ (ст. 102)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-divorce-alimony-order",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-wage-garnish",
    "name": "Заявление о направлении взыскания на зарплату должника",
    "category": "legal",
    "description": "Взыскание через работодателя должника: до 50% зарплаты (70% по алиментам и возмещению вреда). Работает, даже если счетов и имущества у должника нет.",
    "actSource": "ФЗ № 229-ФЗ (ст. 98–99)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-execution",
      "stmt-fssp-alimony-debt"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-fssp-info-request",
    "name": "Запрос взыскателя о ходе исполнительного производства",
    "category": "legal",
    "description": "Запрос материалов производства: что сделал пристав за полгода — запросы, аресты, выходы. Молчание пристава — основание для жалобы старшему приставу и в суд.",
    "actSource": "ФЗ № 229-ФЗ (ст. 50), ФЗ № 59-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-complaint",
      "stmt-fssp-search"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-court-cassation",
    "name": "Кассационная жалоба на судебные акты",
    "category": "legal",
    "description": "Третья инстанция после апелляции: проверяет только нарушения закона, факты заново не устанавливает. Срок — 3 месяца со дня апелляции. Подаётся через первый суд.",
    "actSource": "ГПК РФ (ст. 376–378, 390.8)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-private-complaint",
    "name": "Частная жалоба на определение суда первой инстанции",
    "category": "legal",
    "description": "Обжалование промежуточных определений (возврат иска, отказ в обеспечении, приостановка): срок — 15 дней. Подаётся через суд, вынесший определение.",
    "actSource": "ГПК РФ (ст. 331–334)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-court-security"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-default-cancel",
    "name": "Заявление об отмене заочного решения",
    "category": "legal",
    "description": "Отмена заочного решения (вынесено без вас): 7 дней с получения копии. Докажите уважительность неявки + приложите возражения. Затем дело рассмотрят заново.",
    "actSource": "ГПК РФ (ст. 237–242)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-court-postpone"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-costs",
    "name": "Заявление о взыскании судебных расходов",
    "category": "legal",
    "description": "Возврат трат выигравшей стороны: госпошлина, юрист, экспертиза, проезд. Подаётся в тот же суд за 3 месяца со дня последнего акта. Нужны чеки и договор с юристом.",
    "actSource": "ГПК РФ (ст. 98–103)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-docs"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-settlement",
    "name": "Ходатайство об утверждении мирового соглашения",
    "category": "legal",
    "description": "Мир вместо решения: стороны договариваются, суд утверждает определением (сила исполнительного листа). Пропишите сроки, суммы и отказ от остальных требований.",
    "actSource": "ГПК РФ (ст. 39, 153.8–153.11, 173)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-costs"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-hr-work-book",
    "name": "Заявление о выдаче трудовой книжки и документов при увольнении",
    "category": "business",
    "description": "Требование выдать трудовую, приказы, справки 2-НДФЛ и о заработке: в последний день или за 3 дня по запросу. За задержку — средний заработок за каждый день.",
    "actSource": "ТК РФ (ст. 62, 84.1)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-dismiss",
      "stmt-hr-salary"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-unpaid-leave",
    "name": "Заявление на отпуск без сохранения зарплаты (по семейным обстоятельствам)",
    "category": "business",
    "description": "Отпуск за свой счёт: по семейным обстоятельствам — по соглашению, а ветеранам, инвалидам, при рождении/смерти — работодатель отказать не вправе.",
    "actSource": "ТК РФ (ст. 128)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "stmt-hr-dismiss"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-transfer",
    "name": "Заявление о переводе на другую должность",
    "category": "business",
    "description": "Просьба о переводе (постоянном или временном): только с письменного согласия, кроме чрезвычайных случаев. Оформляется допсоглашением и приказом.",
    "actSource": "ТК РФ (ст. 72, 72.1)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-remote",
      "employment-contract"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-overtime-pay",
    "name": "Заявление об оплате сверхурочной работы",
    "category": "business",
    "description": "Требование оплатить переработки: первые 2 часа — в полуторном размере, дальше — в двойном. Лимит — 120 часов в год. Фиксируйте приказы и табели.",
    "actSource": "ТК РФ (ст. 99, 152)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-salary",
      "stmt-gti-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-discipline-appeal",
    "name": "Объяснительная и возражение на дисциплинарное взыскание",
    "category": "business",
    "description": "Письменное объяснение + несогласие с выговором: работодатель обязан запросить объяснение и дать 2 дня. Без этого взыскание незаконно — обжалуется в ГИТ и суде.",
    "actSource": "ТК РФ (ст. 192–193)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-gti-complaint",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-police-beating",
    "name": "Заявление в полицию о побоях / угрозе убийством",
    "category": "legal",
    "description": "Заявление о побоях или угрозах: сначала в травмпункт (снимите побои!), затем в полицию. Приложите медсправку — без неё дело почти не возбудят.",
    "actSource": "УПК РФ (ст. 141), УК РФ (ст. 115–117, 119)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "lawsuit-statement"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-car-theft",
    "name": "Заявление в полицию об угоне автомобиля",
    "category": "auto",
    "description": "Заявление об угоне: звоните 102 сразу, затем письменно в дежурную часть. Укажите VIN, госномер, приметы, сигнализацию, КАСКО. Объявляют план «Перехват».",
    "actSource": "УПК РФ (ст. 141), УК РФ (ст. 158, 166)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "stmt-gibdd-appeal"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-noise",
    "name": "Заявление участковому на шумных соседей",
    "category": "legal",
    "description": "Жалоба на шум ночью (ремонт, музыка): фиксируйте вызовы 102, соберите подписи соседей. Штраф — по региональному закону о тишине (в Москве — ст. 3.13 КоАП г. Москвы).",
    "actSource": "КоАП РФ (региональный закон о тишине), ФЗ «О полиции» (ст. 12)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-beating",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-gzhi-complaint",
    "name": "Жалоба в жилищную инспекцию (ГЖИ) на УК",
    "category": "realty",
    "description": "Жалоба в ГЖИ, когда УК игнорирует: грязный подъезд, разбитые окна, текущий подвал. ГЖИ штрафует и выдаёт предписание — работает лучше повторных писем в УК.",
    "actSource": "ЖК РФ (ст. 20), ФЗ № 59-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-quality",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 10,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-fas-complaint",
    "name": "Жалоба в ФАС на рекламу и навязывание услуг",
    "category": "legal",
    "description": "Жалоба на спам-звонки, недостоверную рекламу, навязанную страховку: ФАС штрафует до 500 000 ₽. Приложите скриншоты, записи звонков, детализацию.",
    "actSource": "ФЗ «О рекламе» (ст. 5, 18, 28), ФЗ № 135-ФЗ «О защите конкуренции»",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-rospotrebnadzor",
      "stmt-cb-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-family-divorce-joint",
    "name": "Заявление о расторжении брака по взаимному согласию (в ЗАГС)",
    "category": "family",
    "description": "Развод через ЗАГС за месяц: только если нет общих несовершеннолетних детей и оба согласны. Иначе — через мировой суд. Пошлина — 650 ₽ с каждого.",
    "actSource": "СК РФ (ст. 19–20), ФЗ № 143-ФЗ «Об актах гражданского состояния»",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-divorce-alimony-order",
      "lawsuit-statement"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-family-paternity",
    "name": "Заявление об установлении отцовства (совместное)",
    "category": "family",
    "description": "Совместное заявление родителей в ЗАГС: отец признаёт ребёнка, в свидетельство вписывают его данные. Если мать против — только через суд с экспертизой ДНК.",
    "actSource": "СК РФ (ст. 48–50), ФЗ № 143-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-family-divorce-joint",
      "stmt-divorce-alimony-order"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-family-child-meet",
    "name": "Заявление об определении порядка общения с ребёнком",
    "category": "family",
    "description": "График встреч отдельно живущего родителя: дни, часы, отпуск, праздники. Сначала опека, затем суд. Конкретика в графике — ключ к исполнению.",
    "actSource": "СК РФ (ст. 61–67)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-divorce-alimony-order",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-inherit-accept-fact",
    "name": "Заявление о фактическом принятии наследства",
    "category": "family",
    "description": "Пропустили 6 месяцев у нотариуса, но жили в квартире и платили коммуналку? Суд признает фактическое принятие — приложите квитанции, чеки ремонта, показания соседей.",
    "actSource": "ГК РФ (ст. 1152–1155)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-notary-inherit",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-inherit-missed-term",
    "name": "Заявление о восстановлении срока принятия наследства",
    "category": "family",
    "description": "Пропустили 6 месяцев по уважительной причине (болезнь, не знали о смерти)? Суд восстановит срок, если обратитесь в течение 6 месяцев после того, как причина отпала.",
    "actSource": "ГК РФ (ст. 1155)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-inherit-accept-fact",
      "stmt-notary-inherit"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-auto-osago-claim",
    "name": "Заявление в страховую о выплате по ОСАГО",
    "category": "auto",
    "description": "Заявление о страховом возмещении после ДТП: 5 рабочих дней на подачу, осмотр за 5 дней, выплата за 20 дней (деньгами или ремонтом). Европротокол — тоже сюда.",
    "actSource": "ФЗ № 40-ФЗ «Об ОСАГО» (ст. 11–12), Положение ЦБ № 431-П",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-gibdd-appeal",
      "stmt-police-car-theft"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-auto-tax-refund",
    "name": "Заявление о перерасчёте транспортного налога",
    "category": "auto",
    "description": "Налог пришёл за проданную машину или с ошибкой в мощности? Требуйте перерасчёт: приложите ДКП и справку ГИБДД о снятии с учёта.",
    "actSource": "НК РФ (ст. 52, 78, 358–362)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-tax-deduction",
      "stmt-gibdd-appeal"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-migration-registration",
    "name": "Заявление о регистрации по месту жительства (прописка)",
    "category": "migration",
    "description": "Прописка постоянная и временная: собственник пишет согласие, вы — заявление. Через Госуслуги — без очередей, штамп за 3–8 дней. Штрафа нет, если уложились в 7 дней.",
    "actSource": "Закон № 5242-1, ПП РФ № 713, Приказ МВД № 984",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-tax-deduction",
      "claim-generic"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-edu-school-place",
    "name": "Заявление о приёме ребёнка в школу / сад",
    "category": "other",
    "description": "Заявление в школу по прописке (отказать не вправе) или в сад через очередь: подаётся лично или через Госуслуги. Отказ — только если мест нет, с направлением в другую школу.",
    "actSource": "ФЗ № 273-ФЗ «Об образовании» (ст. 55, 67), Приказ Минпросвещения № 458",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-prosecutor-complaint",
      "claim-generic"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-med-attach",
    "name": "Заявление о прикреплении к поликлинике",
    "category": "other",
    "description": "Прикрепление к любой поликлинике (не только по прописке): менять можно раз в год. Отказ — только если плановая мощность превышена, и то с направлением.",
    "actSource": "ФЗ № 323-ФЗ (ст. 19, 21, 84), Приказ Минздрава № 406н",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-prosecutor-complaint",
      "claim-generic"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-med-complaint",
    "name": "Жалоба на врача / качество медпомощи",
    "category": "other",
    "description": "Лестница жалоб: главврач → страховая → Росздравнадзор → прокуратура. Начните с главврача и страховой — экспертиза качества бесплатна для вас.",
    "actSource": "ФЗ № 323-ФЗ (ст. 19, 70, 88), ФЗ № 59-ФЗ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-med-attach",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-sfr-benefit",
    "name": "Заявление на детское пособие / единую выплату (СФР)",
    "category": "family",
    "description": "Единое пособие на детей и беременным через СФР/Госуслуги: нуждаемость проверяют сами по доходам. Отказ — обжалуйте с расчётом среднедушевого дохода.",
    "actSource": "ФЗ № 81-ФЗ, ФЗ № 178-ФЗ, ПП РФ № 2330",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-tax-deduction",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-pension-recalc",
    "name": "Заявление о перерасчёте пенсии",
    "category": "other",
    "description": "Не учли стаж, зарплату, иждивенца? Требуйте перерасчёт: приложите трудовую, справки о зарплате, свидетельства. Перерасчёт — с месяца обращения (по вине фонда — с даты ошибки).",
    "actSource": "ФЗ № 400-ФЗ (ст. 23), Приказ Минтруда № 600н",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-sfr-benefit",
      "stmt-prosecutor-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-nalog-complaint",
    "name": "Жалоба на налоговую инспекцию (вышестоящему органу)",
    "category": "other",
    "description": "Досудебное обжалование обязательно: сначала УФНС, только потом суд. Срок — год с решения, исполнение взыскания приостанавливается по заявлению.",
    "actSource": "НК РФ (ст. 137–140)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-tax-deduction",
      "stmt-auto-tax-refund"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "oversight"
  },
  {
    "id": "stmt-nalog-overpay",
    "name": "Заявление о возврате переплаты по налогам",
    "category": "other",
    "description": "Возврат переплаты с ЕНС: сначала зачтут долги, остаток вернут по заявлению за дни. Срок на возврат — 3 года с переплаты.",
    "actSource": "НК РФ (ст. 78–79)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-nalog-complaint",
      "stmt-tax-deduction"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-nalog-benefit",
    "name": "Заявление о налоговой льготе (имущество/транспорт/земля)",
    "category": "other",
    "description": "Пенсионерам, инвалидам, многодетным: льгота не всегда назначается автоматически — подайте заявление раз, дальше продлевается сама. Приложите удостоверение.",
    "actSource": "НК РФ (ст. 361.1, 396–397, 407)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-nalog-overpay",
      "stmt-auto-tax-refund"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-hr-quit-no-workoff",
    "name": "Заявление об увольнении без отработки (льготные случаи)",
    "category": "business",
    "description": "Увольнение одним днём: зачисление в вуз, выход на пенсию, переезд супруга-военного, нарушение работодателем ТК. Без причины — только по соглашению.",
    "actSource": "ТК РФ (ст. 80)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-dismiss",
      "stmt-hr-work-book"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-vacation-pay",
    "name": "Заявление о замене отпуска денежной компенсацией",
    "category": "business",
    "description": "Компенсация только за дни сверх 28: основной отпуск отгулять обязаны (беременным и несовершеннолетним — вообще нельзя заменять). При увольнении — за все неиспользованные дни.",
    "actSource": "ТК РФ (ст. 126)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-vacation",
      "stmt-hr-dismiss"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-schedule-change",
    "name": "Заявление об изменении режима рабочего времени",
    "category": "business",
    "description": "Неполный день, гибкий график, смена начала/конца: беременным, родителям детей до 14 лет и ухаживающим за больным — работодатель отказать не вправе.",
    "actSource": "ТК РФ (ст. 93, 100–102)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-remote",
      "stmt-hr-maternity"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-sick-pay",
    "name": "Заявление об оплате больничного (несвоевременная выплата)",
    "category": "business",
    "description": "Больничный не оплатили за 10 дней? Требуйте выплату + компенсацию по 236 ТК. Электронный больничный работодатель видит сам — номер сообщать не обязательно.",
    "actSource": "ФЗ № 255-ФЗ (ст. 13–15), ТК РФ (ст. 183)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-salary",
      "stmt-gti-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-police-extremism-threats",
    "name": "Заявление в полицию об угрозах и вымогательстве",
    "category": "legal",
    "description": "Угрожают расправой или требуют деньги/имущество: фиксируйте всё (записи, переписка, свидетели). Отличие угрозы от вымогательства распишите подробно — это разные статьи.",
    "actSource": "УПК РФ (ст. 141), УК РФ (ст. 119, 163)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-beating",
      "stmt-police-fraud"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-dacha-theft",
    "name": "Заявление в полицию о краже с дачи / из квартиры (взлом)",
    "category": "legal",
    "description": "Кража со взломом — тяжкий состав (до 6 лет): ничего не трогайте до приезда полиции, вызывайте 102. Перепишите серийники техники заранее — это ускорит розыск.",
    "actSource": "УПК РФ (ст. 141), УК РФ (ст. 158 ч. 3 — с проникновением)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "stmt-police-car-theft"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-police-doc-loss",
    "name": "Заявление в полицию об утере паспорта / документов",
    "category": "other",
    "description": "Потеряли паспорт — идите в полицию за талоном-уведомлением, затем в МВД/МФЦ за новым. Талон защитит от кредитов на ваше имя. Штраф за утерю — 100–300 ₽.",
    "actSource": "Положение о паспорте (ПП РФ № 828), КоАП РФ (ст. 19.16)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "stmt-migration-registration"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-court-divorce-court",
    "name": "Исковое заявление о расторжении брака (через суд)",
    "category": "family",
    "description": "Развод через суд: есть дети до 18 или второй против. Мировой — без спора о детях, районный — со спором. Срок на примирение — до 3 месяцев.",
    "actSource": "СК РФ (ст. 21–25), ГПК РФ (ст. 23, 28)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-family-divorce-joint",
      "stmt-divorce-alimony-order"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-debt-note",
    "name": "Исковое заявление о взыскании долга по расписке",
    "category": "finance",
    "description": "Долг по расписке: прикладывайте оригинал + расчёт процентов (ключевая ставка ЦБ). До 100 000 ₽ — мировой судья, свыше — районный. Досудебная претензия усилит позицию.",
    "actSource": "ГК РФ (ст. 807–811, 395), ГПК РФ (ст. 23, 28)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-order-cancel",
      "stmt-court-docs"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-housing-privatization",
    "name": "Заявление о приватизации квартиры",
    "category": "realty",
    "description": "Приватизация муниципального жилья: бесплатно один раз в жизни. Нужны согласия всех зарегистрированных (отказы — нотариально). Срок оформления — 2 месяца.",
    "actSource": "Закон № 1541-1 «О приватизации жилищного фонда»",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-migration-registration",
      "stmt-housing-recalc"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-housing-subsidy",
    "name": "Заявление на субсидию на оплату ЖКУ",
    "category": "realty",
    "description": "Субсидия, если коммуналка съедает over 22% дохода семьи (в Москве — 10%): назначается на 6 месяцев, продлевается. Подаётся через Госуслуги/МФЦ.",
    "actSource": "ЖК РФ (ст. 159), ПП РФ № 761",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-recalc",
      "stmt-sfr-benefit"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-housing-neighbour-flood-claim",
    "name": "Претензия соседу о возмещении ущерба от залива",
    "category": "realty",
    "description": "Досудебная претензия виновнику залива: акт УК + оценка ущерба + требование. Добровольно не платит — в суд с теми же документами плюс госпошлина.",
    "actSource": "ГК РФ (ст. 1064, 1082)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-flood",
      "lawsuit-statement"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-hr-severance",
    "name": "Заявление о выплате выходного пособия при сокращении",
    "category": "business",
    "description": "При сокращении положено: средний месячный заработок + сохранение за 2 месяца (3-й — через ЦЗН). Увольнение раньше 2 месяцев — плюс компенсация.",
    "actSource": "ТК РФ (ст. 178, 180)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-dismiss",
      "stmt-hr-work-book"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-hr-maternity-benefit",
    "name": "Заявление о назначении пособия по беременности и родам",
    "category": "business",
    "description": "Декретные: 140 дней (194 при многоплодной), 100% среднего заработка. Электронный больничный — заявление короткое, деньги платит СФР через работодателя.",
    "actSource": "ФЗ № 255-ФЗ (ст. 10–11), ТК РФ (ст. 255)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-maternity",
      "stmt-sfr-benefit"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-police-cyber-fraud",
    "name": "Заявление в полицию о взломе аккаунта / краже с карты онлайн",
    "category": "legal",
    "description": "Взлом Госуслуг, соцсетей, кража с карты через фишинг: меняйте пароли, блокируйте карты, затем в полицию. Укажите IP/номера/ссылки — это улики.",
    "actSource": "УПК РФ (ст. 141), УК РФ (ст. 158 ч. 3 п. «г», 159.3, 272)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-fraud",
      "stmt-bank-chargeback"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "police"
  },
  {
    "id": "stmt-court-alimony-fixed",
    "name": "Иск о взыскании алиментов в твёрдой сумме",
    "category": "family",
    "description": "Должник без официального дохода, ИП или в валюте? Просите твёрдую сумму — не ниже прожиточного минимума на ребёнка. Индексируется приставом автоматически.",
    "actSource": "СК РФ (ст. 83, 117)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-divorce-alimony-order",
      "stmt-fssp-alimony-debt"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-zpp-defect",
    "name": "Иск о возврате денег за товар с недостатками (ЗПП)",
    "category": "legal",
    "description": "Брак, отказ в возврате: цена + неустойка 1% в день + штраф 50% + моральный вред. Потребитель освобождён от пошлины до 1 млн ₽, иск — по своему адресу.",
    "actSource": "Закон «О защите прав потребителей» (ст. 18–24), ГПК РФ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-rospotrebnadzor",
      "claim-generic"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-labor-reinstate",
    "name": "Иск о восстановлении на работе и оплате прогула",
    "category": "business",
    "description": "Незаконное увольнение: срок — месяц с приказа/трудовой! Восстановление + средний заработок за прогул + моралка. Участвует прокурор.",
    "actSource": "ТК РФ (ст. 391–395), ГПК РФ (ст. 28)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-gti-complaint",
      "stmt-hr-discipline-appeal"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-bank-account-close",
    "name": "Заявление о закрытии счёта и возврате остатка",
    "category": "finance",
    "description": "Закрытие счёта по вашему заявлению — в любой момент, без объяснений. Остаток выдают наличными или переводят. Комиссию за закрытие брать не вправе.",
    "actSource": "ГК РФ (ст. 859), Инструкция ЦБ № 204-И",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-chargeback",
      "stmt-cb-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-court-zpp-service",
    "name": "Иск о некачественной услуге (ремонт, стройка, сервис)",
    "category": "legal",
    "description": "Сорваны сроки, брак в работе: уменьшение цены, неустойка 3% в день, расторжение + штраф 50%. Экспертиза докажет брак лучше слов.",
    "actSource": "Закон «О защите прав потребителей» (ст. 27–31)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-zpp-defect",
      "stmt-rospotrebnadzor"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-housing-eviction-neighbour",
    "name": "Иск о выселении / нечинении препятствий в пользовании жильём",
    "category": "realty",
    "description": "Бывший член семьи не съезжает или чинит препятствия: только через суд, участковый не выселит. Приложите выписку из домовой книги и акты о непроживании/препятствиях.",
    "actSource": "ЖК РФ (ст. 31, 35, 83–91), ГК РФ (ст. 304)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-recalc",
      "stmt-police-noise"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-family-alimony-agreement-end",
    "name": "Заявление об отмене алиментов при усыновлении / совершеннолетии",
    "category": "family",
    "description": "Алименты прекращаются не сами: ребёнку 18, усыновление, смерть, восстановление трудоспособности. Подайте в суд — пристав закроет производство по решению.",
    "actSource": "СК РФ (ст. 114–120)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-divorce-alimony-order",
      "stmt-fssp-alimony-debt"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-hr-salary-index",
    "name": "Заявление об индексации зарплаты",
    "category": "business",
    "description": "Работодатель обязан индексировать зарплату при росте цен — порядок пишет в локальных актах. Нет индексации годами — требуйте письменно, затем в ГИТ и суд.",
    "actSource": "ТК РФ (ст. 130, 134)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-salary",
      "stmt-gti-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-bank-card-block-appeal",
    "name": "Заявление о разблокировке счёта (115-ФЗ)",
    "category": "finance",
    "description": "Банк заблокировал счёт по антиотмывочному закону: несите документы о происхождении денег (договоры, справки). Отказ — в межведомственную комиссию ЦБ, затем в суд.",
    "actSource": "ФЗ № 115-ФЗ (ст. 7–7.2), Положение ЦБ № 375-П",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-bank-account-close",
      "stmt-cb-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-auto-dtp-europrotocol",
    "name": "Извещение о ДТП (европротокол) — инструкция и заполнение",
    "category": "auto",
    "description": "Без ГИБДД при 4 условиях: 2 авто, ОСАГО у обоих, ущерб до 100 000 ₽ (до 400 000 ₽ с фотофиксацией), пострадавших нет. Разъезжайтесь только после фото и извещения.",
    "actSource": "ФЗ № 40-ФЗ (ст. 11.1), ПДД (п. 2.6.1)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-auto-osago-claim",
      "stmt-gibdd-appeal"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-travel-tour-refund",
    "name": "Претензия туроператору о возврате за отменённый тур",
    "category": "other",
    "description": "Тур не состоялся или сорван: требуйте возврат + неустойку. Отказ от тура по своей инициативе — возврат за вычетом фактических расходов (требуйте их доказать).",
    "actSource": "ФЗ № 132-ФЗ «Об основах туристской деятельности» (ст. 10–10.1), Закон о ЗПП (ст. 32)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-rospotrebnadzor",
      "stmt-court-zpp-defect"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-telecom-spam-stop",
    "name": "Заявление оператору о блокировке спама и платных подписок",
    "category": "other",
    "description": "Снимают за подписки, которых не подключали, звонят с рекламой: требуйте детализацию, отключение и возврат. Не помогло — в Роскомнадзор и суд.",
    "actSource": "ФЗ «О связи» (ст. 44–44.1), ФЗ «О рекламе» (ст. 18), ПП РФ № 1342",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fas-complaint",
      "stmt-rospotrebnadzor"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-med-tax-refund",
    "name": "Заявление на вычет за лечение и лекарства",
    "category": "other",
    "description": "Возврат 13% за лечение (своё, детей, родителей, супруга): обычное — до 150 000 ₽ расходов, дорогостоящее — без лимита. Справка из клиники — главный документ.",
    "actSource": "НК РФ (ст. 219)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-tax-deduction",
      "stmt-med-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-court-inheritance-dispute",
    "name": "Иск о разделе наследственного имущества",
    "category": "family",
    "description": "Наследники не договорились: раздел через суд с учётом долей, преимущественного права (кто жил/пользовался) и компенсации. Оценка имущества обязательна.",
    "actSource": "ГК РФ (ст. 252, 1141–1149, 1164–1170)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-notary-inherit",
      "stmt-inherit-accept-fact"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-criminal-compensation",
    "name": "Гражданский иск в уголовном деле (возмещение вреда)",
    "category": "legal",
    "description": "Вред от преступления взыскивайте прямо в уголовном деле — без отдельного иска и пошлины. Заявите следователю или в суде до удаления в совещательную.",
    "actSource": "УПК РФ (ст. 44), ГК РФ (ст. 1064, 1100–1101)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-theft",
      "stmt-police-fraud"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-admin-sue",
    "name": "Административный иск на госорган (КАС)",
    "category": "legal",
    "description": "Оспаривание действий чиновников, отказов, бездействия: 3 месяца с нарушения. Суд сам истребует доказательства у органа — бремя доказывания на нём.",
    "actSource": "КАС РФ (ст. 124–127, 218–220)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-prosecutor-complaint",
      "stmt-nalog-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-postal-lost-claim",
    "name": "Претензия Почте России за утерю / повреждение отправления",
    "category": "postal",
    "description": "Потеряли посылку или разбили: компенсация — объявленная ценность + тариф. Претензия — за 6 месяцев, ответ — месяц. Затем — суд по ЗПП.",
    "actSource": "ФЗ «О почтовой связи» (ст. 34), Приказ Минцифры № 234",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-rospotrebnadzor",
      "stmt-court-zpp-defect"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-court-moral-harm-police",
    "name": "Иск о компенсации за незаконные действия полиции / задержание",
    "category": "legal",
    "description": "Незаконное задержание, обыск, уголовное преследование с оправданием: вред возмещает казна, вина не доказывается. Сначала добейтесь признания действий незаконными.",
    "actSource": "ГК РФ (ст. 1069–1071, 1100–1101), УПК РФ (гл. 18 — реабилитация)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-prosecutor-complaint",
      "stmt-police-beating"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-other-name-change",
    "name": "Заявление о перемене имени",
    "category": "other",
    "description": "Смена ФИО с 14 лет (до 18 — с согласия родителей/опеки): месяц на рассмотрение. Затем месяц на замену паспорта — иначе штраф за недействительный паспорт.",
    "actSource": "ФЗ № 143-ФЗ (ст. 58–63), СК РФ (ст. 59)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-migration-registration",
      "stmt-police-doc-loss"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-other-pensioner-benefit-region",
    "name": "Заявление на региональные льготы (ветеран труда / пенсионер)",
    "category": "other",
    "description": "ЕДВ, компенсация ЖКУ 50%, льготный проезд: звание «ветеран труда» — через соцзащиту, льготы — заявлением. Отказ обжалуйте с расчётом стажа.",
    "actSource": "ФЗ № 5-ФЗ «О ветеранах», региональные законы о соцподдержке",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-pension-recalc",
      "stmt-housing-subsidy"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-court-establish-fact",
    "name": "Заявление об установлении юридического факта",
    "category": "legal",
    "description": "Родство, иждивение, трудовой стаж без записей, принадлежность документов: только если иначе (внесудебно) установить нельзя. Опишите, зачем нужен факт.",
    "actSource": "ГПК РФ (ст. 264–268)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-inherit-accept-fact",
      "stmt-pension-recalc"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-defamation",
    "name": "Иск о защите чести и достоинства (клевета в интернете)",
    "category": "legal",
    "description": "Порочащий пост/отзыв: заверьте у нотариуса (скриншоты тают), требуйте удаления + опровержения + компенсацию. Ответчик доказывает правдивость, вы — факт публикации.",
    "actSource": "ГК РФ (ст. 152), ГПК РФ",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-police-beating",
      "stmt-court-moral-harm-police"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-mil-ags",
    "name": "Заявление о замене военной службы альтернативной (АГС)",
    "category": "other",
    "description": "АГС по убеждениям: подавайте за 6 месяцев до призыва, обоснуйте убеждения подробно. Отказ — обжалуйте в суд, отправку приостановят.",
    "actSource": "ФЗ № 113-ФЗ «Об альтернативной гражданской службе», Конституция (ст. 59)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-mil-postpone",
      "stmt-mil-appeal"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "military"
  },
  {
    "id": "stmt-mil-health-review",
    "name": "Заявление о направлении на медосвидетельствование / переосвидетельствование",
    "category": "other",
    "description": "Не согласны с категорией годности? Требуйте направления к профильному врачу и приобщения новых диагнозов. КМО вышестоящей комиссии — тоже по заявлению.",
    "actSource": "ФЗ № 53-ФЗ (ст. 5.1), ПП РФ № 565 (Расписание болезней)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-mil-postpone",
      "stmt-mil-appeal"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "military"
  },
  {
    "id": "stmt-hr-reference",
    "name": "Заявление о выдаче характеристики / рекомендации с работы",
    "category": "business",
    "description": "Характеристика для суда, опеки, нового работодателя: выдаётся за 3 дня по письменному запросу. Отказ — нарушение ст. 62 ТК.",
    "actSource": "ТК РФ (ст. 62)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-hr-work-book",
      "stmt-hr-dismiss"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "hr"
  },
  {
    "id": "stmt-zpp-airline-delay",
    "name": "Претензия авиакомпании за задержку / отмену рейса",
    "category": "other",
    "description": "Рейс задержан over 2 часов — положены вода, питание, отель; отмена — возврат + 25% штрафа + убытки. Внутренний рейс — претензия за 6 месяцев.",
    "actSource": "Воздушный кодекс (ст. 120–126), Закон о ЗПП, Монреальская конвенция",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-travel-tour-refund",
      "stmt-rospotrebnadzor"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-auto-insurance-kasko-dispute",
    "name": "Претензия по КАСКО (занижение / отказ)",
    "category": "auto",
    "description": "Страховая занизила выплату или отказала: независимая экспертиза + претензия с расчётом. Затем — финомбудсмен (бесплатно) и суд со штрафом 50%.",
    "actSource": "ГК РФ (ст. 929–943), Закон о ЗПП",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-auto-osago-claim",
      "stmt-fin-ombudsman"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "official-forms"
  },
  {
    "id": "stmt-housing-today-repair-current",
    "name": "Заявление о текущем ремонте подъезда",
    "category": "realty",
    "description": "Облезшие стены, разбитые почтовые ящики, текущие трубы: текущий ремонт — обязанность УК за счёт содержания жилья. Раз в 3–5 лет — плановый ремонт подъезда.",
    "actSource": "ПП РФ № 491 (п. 18), ЖК РФ (ст. 161, 165)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-quality",
      "stmt-gzhi-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-fssp-exempt-protect",
    "name": "Заявление о снятии взыскания с детских пособий и соцвыплат",
    "category": "family",
    "description": "Списали пособия, алименты, маткапитал? Это незаконно (ст. 101): несите справку о назначении выплат — пристав обязан вернуть за дни. Коды «2» в платёжках — ваша защита.",
    "actSource": "ФЗ № 229-ФЗ (ст. 101), ГПК РФ (ст. 446)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-fssp-excess-return",
      "stmt-fssp-minimum"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "fssp"
  },
  {
    "id": "stmt-court-motion-video",
    "name": "Ходатайство о видеоконференц-связи (ВКС) в суде",
    "category": "legal",
    "description": "Живёте в другом городе? Участвуйте по видео из ближайшего суда: подайте ходатайство заранее, укажите суд для связи. Отказ — только если нет технической возможности.",
    "actSource": "ГПК РФ (ст. 155.1), АПК РФ (ст. 153.1), КАС РФ (ст. 142)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-postpone"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-language",
    "name": "Ходатайство о переводчике в суде",
    "category": "legal",
    "description": "Не владеете русским? Суд обязан предоставить переводчика бесплатно — достаточно заявить. Отказ — грубое нарушение, основание для отмены решения.",
    "actSource": "ГПК РФ (ст. 9), КАС РФ (ст. 12)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-motion-video"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-recusal",
    "name": "Заявление об отводе судьи",
    "category": "legal",
    "description": "Судья — родственник стороны, уже участвовал в деле или заинтересован? Заявляйте отвод до начала рассмотрения по существу. Мотивируйте фактами, а не эмоциями.",
    "actSource": "ГПК РФ (ст. 16–19)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-court-private-complaint"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-postpone-appeal",
    "name": "Ходатайство о приостановлении исполнения решения (апелляция)",
    "category": "legal",
    "description": "Подали апелляцию, а приставы уже списывают? Просите апелляцию приостановить исполнение: приложите доказательства несоразмерности и гарантию (депозит, поручительство).",
    "actSource": "ГПК РФ (ст. 326.2)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-fssp-delay"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-restore-term",
    "name": "Ходатайство о восстановлении пропущенного срока",
    "category": "legal",
    "description": "Пропустили срок (апелляция, отмена приказа)? Просите восстановить + совершайте само действие (приложите жалобу). Болезнь, командировка, неполучение почты — уважительно.",
    "actSource": "ГПК РФ (ст. 109–112)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-court-order-cancel"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-housing-common-meeting",
    "name": "Требование о проведении общего собрания собственников (ОСС)",
    "category": "realty",
    "description": "Хотите сменить УК, шлагбаум, тариф? 10% собственников требуют собрания письменно — УК обязана провести за 45 дней. Игнор — жалуйтесь в ГЖИ.",
    "actSource": "ЖК РФ (ст. 44–48)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-housing-quality",
      "stmt-gzhi-complaint"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "housing"
  },
  {
    "id": "stmt-court-motion-claim-secure-evidence",
    "name": "Заявление об обеспечении доказательств (осмотр до суда)",
    "category": "legal",
    "description": "Доказательство исчезнет до суда (зальют, снесут, удалят)? Просите суд зафиксировать заранее: осмотр, экспертиза, запрос. Подаётся до иска или в процессе.",
    "actSource": "ГПК РФ (ст. 64–66)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-evidence",
      "stmt-housing-flood"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-third-party",
    "name": "Ходатайство о привлечении третьего лица / соответчика",
    "category": "legal",
    "description": "Решение затронет ещё кого-то (сособственника, страховую, работодателя)? Просите привлечь третьим лицом или соответчиком — иначе потом судиться заново.",
    "actSource": "ГПК РФ (ст. 40–43)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-evidence"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-doc-copies",
    "name": "Заявление о выдаче копий материалов дела для ознакомления",
    "category": "legal",
    "description": "Знакомьтесь с делом свободно: фотографируйте всё, копии — за свой счёт. Отказ — обжалуйте председателю суда. Доверенность представителя приложите.",
    "actSource": "ГПК РФ (ст. 35)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-docs"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-correct-error",
    "name": "Заявление об исправлении описки в решении суда",
    "category": "legal",
    "description": "Опечатка в ФИО, сумме, адресе мешает исполнению? Суд исправляет определением без нового разбирательства. Суть решения менять нельзя — только описку.",
    "actSource": "ГПК РФ (ст. 200)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-docs",
      "stmt-fssp-execution"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-additional-decision",
    "name": "Заявление о дополнительном решении суда",
    "category": "legal",
    "description": "Суд забыл взыскать пошлину, расходы или решить часть требований? Просите дополнительное решение — до вступления в силу или в апелляции.",
    "actSource": "ГПК РФ (ст. 201)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-costs",
      "stmt-court-motion-correct-error"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-explain",
    "name": "Заявление о разъяснении решения суда",
    "category": "legal",
    "description": "Решение неясно приставам или сторонам (порядок, сроки, доли)? Просите разъяснить — изменить суть суд не вправе, только уточнить формулировки.",
    "actSource": "ГПК РФ (ст. 202)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-motion-correct-error",
      "stmt-fssp-execution"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-turnaround",
    "name": "Заявление о повороте исполнения решения",
    "category": "legal",
    "description": "Решение исполнили, а апелляция/кассация его отменила? Требуйте вернуть всё обратно (деньги, имущество). Подаётся в первый суд.",
    "actSource": "ГПК РФ (ст. 443–445)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-appeal",
      "stmt-court-cassation"
    ],
    "fieldCount": 8,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-leave-no-consider",
    "name": "Ходатайство об оставлении иска без рассмотрения",
    "category": "legal",
    "description": "Истец дважды не явился, досудебный порядок не соблюдён, дело уже в другом суде? Просите оставить без рассмотрения — после устранения препятствий можно подать заново.",
    "actSource": "ГПК РФ (ст. 222–223)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "lawsuit-statement",
      "stmt-court-postpone"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-terminate",
    "name": "Ходатайство о прекращении производства по делу",
    "category": "legal",
    "description": "Мировое, отказ от иска, смерть стороны без правопреемства, уже есть решение по тому же спору? Просите прекратить — повторно с тем же иском уже не обратиться.",
    "actSource": "ГПК РФ (ст. 220–221)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-settlement",
      "stmt-court-motion-leave-no-consider"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  },
  {
    "id": "stmt-court-motion-audio-protocol",
    "name": "Заявление о замечаниях на протокол / выдаче аудиозаписи заседания",
    "category": "legal",
    "description": "Протокол исказил показания? Замечания — за 5 дней с подписания. Аудиозапись заседания выдадут по заявлению — сверьте с протоколом перед апелляцией.",
    "actSource": "ГПК РФ (ст. 231–232)",
    "lastUpdated": "Сентябрь 2026",
    "suggestedDocs": [
      "stmt-court-motion-doc-copies",
      "stmt-appeal"
    ],
    "fieldCount": 9,
    "kind": "statement",
    "formKind": "free",
    "statementGroup": "courts"
  }
];
