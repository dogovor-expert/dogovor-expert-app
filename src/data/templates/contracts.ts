import type { LegalTemplate } from "../types";
import {
  sideFields,
  sideBlock,
  pairIntro,
  pairSign,
  commonClauses,
  pageShell,
} from "./parts";

export const TEMPLATES_CONTRACTS: LegalTemplate[] = [
  {
    id: "selfemployed-contract",
    name: "Договор с самозанятым (НПД)",
    category: "business",
    actSource: "ГК РФ, 422-ФЗ (НПД)",
    lastUpdated: "Август 2026",
    description:
      "Договор ГПХ с исполнителем — плательщиком налога на профессиональный доход. Заказчик не платит НДФЛ и страховые взносы; исполнитель выдаёт чеки через приложение «Мой налог».",
    suggestedDocs: ["act-services", "service-agreement"],
    printInstruction:
      "Лимит дохода самозанятого — 2,4 млн руб. в год (422-ФЗ). Запрещено привлекать бывшего сотрудника, уволенного менее 2 лет назад. После каждой выплаты исполнитель обязан выдать чек через «Мой налог». Договор не должен содержать признаков трудовых отношений.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("executor", "Исполнитель (самозанятый)", "executor"),
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "work_type", label: "Вид услуг/работ", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "work_scope", label: "Содержание и объём работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "result_desc", label: "Конкретный результат (что передаётся Заказчику)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "price", label: "Вознаграждение (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "select", defaultValue: "после подписания акта", category: "payment",
        options: [
          { label: "После подписания акта", value: "после подписания акта" },
          { label: "Аванс 50%, остаток по акту", value: "аванс 50%" },
          { label: "Предоплата 100%", value: "предоплата" },
        ] },
      { id: "deadline", label: "Срок выполнения (до даты)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Договор оказания услуг с самозанятым") +
      pairIntro("customer", "Заказчик", "executor", "Исполнитель") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется по заданию Заказчика оказать услуги (выполнить работы): <strong>{{work_type}}</strong>, а Заказчик обязуется принять и оплатить их.
  </p>
  <p class="mb-4 text-justify">1.2. Содержание и объём работ: {{work_scope}}.</p>
  <p class="mb-4 text-justify">
    1.3. Конкретный результат, подлежащий передаче Заказчику: <strong>{{result_desc}}</strong>. Исполнитель действует самостоятельно,
    не подчиняется правилам внутреннего трудового распорядка Заказчика и не выполняет трудовую функцию по должности — отношения сторон регулируются гражданским законодательством.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок выполнения</div>
  <p class="mb-4 text-justify">2.1. Работы (услуги) должны быть выполнены в срок до «{{deadline}}».</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Стоимость и порядок оплаты</div>
  <p class="mb-4 text-justify">
    3.1. Вознаграждение Исполнителя составляет <strong>{{price}} ({{price_words}})</strong> рублей. Оплата производится: {{payment_order}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Исполнитель применяет специальный налоговый режим «Налог на профессиональный доход» (Федеральный закон от 27.11.2018 № 422-ФЗ).
    Заказчик не является налоговым агентом и не уплачивает страховые взносы.
  </p>
  <p class="mb-4 text-justify">
    3.3. Исполнитель обязан в момент расчёта сформировать чек в приложении «Мой налог» и передать его Заказчику
    (при безналичных расчётах — не позднее 9-го числа месяца, следующего за месяцем расчёта).
  </p>
  <p class="mb-4 text-justify">
    3.4. Исполнитель подтверждает, что его доход за текущий календарный год не превышает 2 400 000 рублей,
    он не состоит с Заказчиком в трудовых отношениях (в т.ч. в течение 2 лет после увольнения) и не привлекает наёмных работников по трудовым договорам.
    Об утрате права на применение НПД Исполнитель обязан немедленно уведомить Заказчика.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Приёмка работ</div>
  <p class="mb-4 text-justify">
    4.1. По завершении работ Исполнитель передаёт Заказчику результат и акт выполненных работ (оказанных услуг). Заказчик подписывает акт в течение 5 рабочих дней либо направляет мотивированный отказ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Исполнитель:</p>
  ${sideBlock("executor", "Исполнитель")}
  <p class="text-xs mt-2">ИНН исполнителя: {{executor_inn}}</p>`
      + commonClauses() +
      pairSign("customer", "Заказчик", "executor", "Исполнитель"),
  },
  {
    id: "contract-personal",
    name: "Договор подряда между физическими лицами",
    category: "business",
    actSource: "ст. 702–729 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор подряда между физлицами: строительные, ремонтные и иные работы без оформления ИП. Сроки, качество, порядок оплаты и приёмки.",
    suggestedDocs: ["act-works", "raspiska-money"],
    printInstruction:
      "Печатать в 2-х экземплярах. При регулярном выполнении работ для разных заказчиков подрядчику следует зарегистрироваться как самозанятый или ИП.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("contractor", "Подрядчик", "contractor"),
      { id: "work_scope", label: "Содержание работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "work_address", label: "Место выполнения работ", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "materials_owner", label: "Материалы предоставляет", type: "radio", defaultValue: "contractor", category: "contract",
        options: [
          { label: "Подрядчик (своими материалами)", value: "contractor" },
          { label: "Заказчик (из материалов заказчика)", value: "customer" },
        ] },
      { id: "price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "select", defaultValue: "по завершении работ", category: "payment",
        options: [
          { label: "По завершении работ", value: "по завершении работ" },
          { label: "Аванс 50%, остаток по завершении", value: "аванс 50%" },
        ] },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Договор подряда") +
      pairIntro("customer", "Заказчик", "contractor", "Подрядчик") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Подрядчик обязуется выполнить по заданию Заказчика следующие работы: {{work_scope}}, а Заказчик обязуется принять результат и оплатить его.
  </p>
  <p class="mb-4 text-justify">1.2. Место выполнения работ: {{work_address}}.</p>
  <p class="mb-4 text-justify">
    1.3. {{#materials_owner_is_contractor}}Работы выполняются из материалов Подрядчика; стоимость материалов входит в цену договора.{{/materials_owner_is_contractor}}
    {{#materials_owner_is_customer}}Работы выполняются из материалов Заказчика; Подрядчик обязан использовать материалы экономно и по завершении работ представить отчёт об их использовании.{{/materials_owner_is_customer}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки выполнения работ</div>
  <p class="mb-4 text-justify">
    2.1. Начало работ: «{{start_date}}», окончание работ: «{{end_date}}» (ст. 708 ГК РФ). Промежуточные сроки могут устанавливаться по соглашению сторон.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Стоимость и порядок оплаты</div>
  <p class="mb-4 text-justify">
    3.1. Стоимость работ составляет <strong>{{price}} ({{price_words}})</strong> рублей. Оплата производится: {{payment_order}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Цена работ может быть изменена по соглашению сторон. Подрядчик не вправе требовать увеличения цены, а Заказчик — её уменьшения, если иное не предусмотрено договором (ст. 710 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Качество и приёмка</div>
  <p class="mb-4 text-justify">
    4.1. Результат работ должен соответствовать требованиям качества (ст. 721 ГК РФ). Гарантийный срок на результат работ — 12 месяцев с момента приёмки, если иное не установлено законом.
  </p>
  <p class="mb-4 text-justify">
    4.2. Приёмка осуществляется по акту выполненных работ в течение 5 рабочих дней с момента уведомления о готовности результата (ст. 720 ГК РФ). Заказчик, обнаруживший недостатки, вправе требовать их безвозмездного устранения в разумный срок (ст. 723 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Подрядчик:</p>
  ${sideBlock("contractor", "Подрядчик")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "contractor", "Подрядчик"),
  },
  {
    id: "house-repair",
    name: "Договор подряда на ремонт дома",
    category: "business",
    actSource: "ст. 730–739 ГК РФ (бытовой подряд)",
    lastUpdated: "Август 2026",
    description:
      "Договор на ремонт жилого дома между заказчиком-гражданином и подрядчиком (ИП или организацией): смета, материалы, сроки, гарантия 2 года.",
    suggestedDocs: ["repair-contract", "act-works", "contract-personal"],
    printInstruction:
      "Бытовой подряд: гарантия на результат — 2 года (ст. 737 ГК РФ). По требованию заказчика составляется предварительная смета (ст. 733 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("contractor", "Подрядчик", "contractor"),
      { id: "house_address", label: "Адрес дома", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "work_list", label: "Перечень работ", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "estimate", label: "Смета (общая стоимость работ и материалов, руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "materials_owner", label: "Материалы предоставляет", type: "radio", defaultValue: "contractor", category: "contract",
        options: [
          { label: "Подрядчик", value: "contractor" },
          { label: "Заказчик", value: "customer" },
        ] },
      { id: "payment_order", label: "Порядок оплаты", type: "select", defaultValue: "по этапам (график)", category: "payment",
        options: [
          { label: "По этапам (график)", value: "по этапам" },
          { label: "Аванс 30%, остаток по завершении", value: "аванс 30%" },
          { label: "По завершении всех работ", value: "по завершении" },
        ] },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "guarantee_months", label: "Гарантийный срок (мес.)", type: "number", defaultValue: "24", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор подряда на ремонт жилого дома") +
      pairIntro("customer", "Заказчик", "contractor", "Подрядчик") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Подрядчик обязуется выполнить ремонтные работы в жилом доме по адресу: <strong>{{house_address}}</strong> в соответствии с утверждённым перечнем:
    {{work_list}}, а Заказчик обязуется принять результат и оплатить его (ст. 730 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    1.2. Общая стоимость работ и материалов (смета) составляет <strong>{{estimate}} ({{estimate_words}})</strong> рублей.
    Смета может быть изменена только с согласия Заказчика (ст. 733 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    1.3. {{#materials_owner_is_contractor}}Материалы и оборудование предоставляются Подрядчиком; их качество должно соответствовать требованиям законодательства (ст. 734 ГК РФ).{{/materials_owner_is_contractor}}
    {{#materials_owner_is_customer}}Материалы предоставляются Заказчиком; Подрядчик обязан предупредить Заказчика о непригодности материалов (ст. 716 ГК РФ) и представить отчёт об их использовании.{{/materials_owner_is_customer}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки выполнения работ</div>
  <p class="mb-4 text-justify">
    2.1. Начало работ: «{{start_date}}», окончание работ: «{{end_date}}». Просрочка даёт Заказчику право на неустойку в размере 3% от стоимости работ за каждый день просрочки (п. 5 ст. 28 Закона о защите прав потребителей), но не более общей цены заказа.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Оплата</div>
  <p class="mb-4 text-justify">3.1. Оплата производится: {{payment_order}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Качество и гарантия</div>
  <p class="mb-4 text-justify">
    4.1. Подрядчик гарантирует качество выполненных работ. Гарантийный срок на результат работ составляет <strong>{{guarantee_months}}</strong> месяцев (не менее 24 месяцев по ст. 737 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Недостатки, обнаруженные в течение гарантийного срока, устраняются Подрядчиком безвозмездно.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Подрядчик:</p>
  ${sideBlock("contractor", "Подрядчик")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "contractor", "Подрядчик"),
  },
  {
    id: "roof-repair",
    name: "Договор подряда на ремонт кровли",
    category: "business",
    actSource: "ст. 730–739, 740–757 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор на ремонт крыши (кровли) дома: замена покрытия, гидроизоляция, водосточная система. Смета, материалы, сроки, гарантия.",
    suggestedDocs: ["house-repair", "contract-works", "act-works"],
    printInstruction:
      "Печатать в 2-х экземплярах. Работы на высоте выполняются с соблюдением требований безопасности; подрядчик несёт ответственность за вред имуществу и третьим лицам.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("contractor", "Подрядчик", "contractor"),
      { id: "roof_address", label: "Адрес объекта (здания)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "roof_type", label: "Тип кровли и покрытие (например, мягкая, металлочерепица)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "roof_area", label: "Площадь кровли (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "work_list", label: "Перечень работ", type: "textarea", defaultValue: "демонтаж старого покрытия, устройство кровли, гидроизоляция, установка водосточной системы", category: "contract" },
      { id: "estimate", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "materials_owner", label: "Материалы предоставляет", type: "radio", defaultValue: "contractor", category: "contract",
        options: [
          { label: "Подрядчик", value: "contractor" },
          { label: "Заказчик", value: "customer" },
        ] },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "guarantee_months", label: "Гарантийный срок (мес.)", type: "number", defaultValue: "36", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор подряда на ремонт кровли") +
      pairIntro("customer", "Заказчик", "contractor", "Подрядчик") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Подрядчик обязуется выполнить работы по ремонту кровли <strong>{{roof_type}}</strong> площадью <strong>{{roof_area}}</strong> кв.м
    на объекте по адресу: <strong>{{roof_address}}</strong>, а Заказчик — принять результат и оплатить его.
  </p>
  <p class="mb-4 text-justify">1.2. Перечень работ: {{work_list}}.</p>
  <p class="mb-4 text-justify">
    1.3. Стоимость работ составляет <strong>{{estimate}} ({{estimate_words}})</strong> рублей.
    {{#materials_owner_is_contractor}}Материалы предоставляются Подрядчиком и входят в указанную стоимость.{{/materials_owner_is_contractor}}
    {{#materials_owner_is_customer}}Материалы предоставляются Заказчиком; Подрядчик предупреждает о непригодности материалов (ст. 716 ГК РФ).{{/materials_owner_is_customer}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки</div>
  <p class="mb-4 text-justify">
    2.1. Начало работ: «{{start_date}}», окончание работ: «{{end_date}}». При нарушении сроков по вине Подрядчика Заказчик вправе требовать неустойку (3% в день, но не более цены договора — для бытового подряда).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Безопасность и ответственность</div>
  <p class="mb-4 text-justify">
    3.1. Подрядчик обеспечивает безопасность работ, соблюдение требований охраны труда и техники безопасности при работе на высоте.
  </p>
  <p class="mb-4 text-justify">
    3.2. Подрядчик несёт ответственность за вред, причинённый имуществу Заказчика и третьих лиц в ходе выполнения работ (ст. 740 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Качество и гарантия</div>
  <p class="mb-4 text-justify">
    4.1. Гарантийный срок на результат работ — <strong>{{guarantee_months}}</strong> месяцев с момента подписания акта приёма-передачи. В течение гарантийного срока Подрядчик безвозмездно устраняет недостатки, включая протечки кровли.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Подрядчик:</p>
  ${sideBlock("contractor", "Подрядчик")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "contractor", "Подрядчик"),
  },
  {
    id: "contract-construction",
    name: "Договор строительного подряда",
    category: "business",
    actSource: "ст. 740–757 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор на строительство, реконструкцию или капитальный ремонт объекта: объём работ, смета, сроки, скрытые работы, гарантийный срок, сдача-приёмка.",
    suggestedDocs: ["contract-works", "act-works", "project-design"],
    printInstruction:
      "Печатать в 2-х экземплярах; приложить проектную документацию, смету и график производства работ. Гарантийный срок на объект — до 5 лет (ст. 756 ГК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("contractor", "Подрядчик", "contractor"),
      { id: "object_name", label: "Наименование объекта (строительство чего)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "object_address", label: "Место строительства (адрес)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "work_scope", label: "Объём работ (краткое описание)", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "price", label: "Цена договора (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_fix", label: "Тип цены", type: "radio", defaultValue: "fixed", category: "payment",
        options: [
          { label: "Твёрдая (фиксированная)", value: "fixed" },
          { label: "Приблизительная (уточняется по смете)", value: "approx" },
        ] },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "penalty_percent", label: "Неустойка за просрочку (% в день)", type: "number", defaultValue: "0.1", category: "contract" },
      { id: "guarantee_years", label: "Гарантийный срок (лет)", type: "number", defaultValue: "5", category: "contract" },
      { id: "insurance", label: "Страхование объекта", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Объект страхуется Подрядчиком", value: "yes" },
          { label: "Страхование не проводится", value: "no" },
        ] },
    ],
    previewTemplate:
      pageShell("Договор строительного подряда") +
      pairIntro("customer", "Заказчик", "contractor", "Подрядчик") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Подрядчик обязуется в установленный срок построить (реконструировать, выполнить капитальный ремонт) объект: <strong>{{object_name}}</strong>
    по адресу: <strong>{{object_address}}</strong>, в соответствии с проектной документацией и условиями настоящего договора,
    а Заказчик — создать Подрядчику необходимые условия, принять результат и уплатить обусловленную цену (ст. 740 ГК РФ).
  </p>
  <p class="mb-4 text-justify">1.2. Объём работ: {{work_scope}}.</p>
  <p class="mb-4 text-justify">
    1.3. {{#price_fix_is_fixed}}Цена договора является твёрдой и составляет <strong>{{price}} ({{price_words}})</strong> рублей (ст. 709 ГК РФ).{{/price_fix_is_fixed}}
    {{#price_fix_is_approx}}Цена договора является приблизительной: <strong>{{price}} ({{price_words}})</strong> рублей, и уточняется на основании сметы (ст. 709 ГК РФ).{{/price_fix_is_approx}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки и график</div>
  <p class="mb-4 text-justify">
    2.1. Начало работ: «{{start_date}}», окончание работ: «{{end_date}}» (ст. 708 ГК РФ). Календарный график производства работ оформляется приложением к договору.
  </p>
  <p class="mb-4 text-justify">
    2.2. За нарушение сроков по вине Подрядчика Заказчик вправе требовать неустойку в размере <strong>{{penalty_percent}}</strong>% от цены договора за каждый день просрочки, но не более 10% от цены договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обеспечение и страхование</div>
  <p class="mb-4 text-justify">
    3.1. {{#insurance_is_yes}}Подрядчик обязан застраховать объект строительства на период производства работ и представить Заказчику копию полиса (ст. 742 ГК РФ).{{/insurance_is_yes}}
    {{#insurance_is_no}}Страхование объекта не проводится; риски случайной гибели или повреждения объекта несёт Подрядчик до сдачи объекта (ст. 741 ГК РФ).{{/insurance_is_no}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Контроль и скрытые работы</div>
  <p class="mb-4 text-justify">
    4.1. Заказчик вправе осуществлять контроль и технический надзор за ходом работ, не вмешиваясь в оперативную деятельность Подрядчика (ст. 748 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Скрытые работы подлежат освидетельствованию с участием Заказчика; акты освидетельствования подписываются до закрытия работ (п. 4 ст. 753 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Сдача и приёмка объекта</div>
  <p class="mb-4 text-justify">
    5.1. Заказчик, получивший сообщение Подрядчика о готовности результата, обязан немедленно приступить к его приёмке (ст. 753 ГК РФ). Приёмка оформляется актом приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Гарантии качества</div>
  <p class="mb-4 text-justify">
    6.1. Гарантийный срок на результат работ составляет <strong>{{guarantee_years}}</strong> лет с момента подписания акта приёма-передачи (ст. 756, 724 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">7. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Подрядчик:</p>
  ${sideBlock("contractor", "Подрядчик")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "contractor", "Подрядчик"),
  },
  {
    id: "transport-services",
    name: "Договор оказания транспортных услуг",
    category: "business",
    actSource: "ст. 779–783, 785 ГК РФ, 259-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Транспортные услуги по перевозке пассажиров и грузов транспортом исполнителя: маршруты, график, ответственность, лицензирование.",
    suggestedDocs: ["freight-transport", "logistics-contract", "act-services"],
    printInstruction:
      "Перевозки пассажиров автобусами и грузов — лицензируемая деятельность (Постановление Правительства № 1952). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("executor", "Исполнитель", "executor"),
      { id: "service_type", label: "Вид услуг", type: "select", defaultValue: "пассажирские перевозки", category: "contract",
        options: [
          { label: "Пассажирские перевозки", value: "пассажирские перевозки" },
          { label: "Грузовые перевозки", value: "грузовые перевозки" },
          { label: "Перевозки для собственных нужд", value: "собственные нужды" },
        ] },
      { id: "route", label: "Маршрут / пункты подачи", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "schedule", label: "График и периодичность", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "vehicles", label: "Транспорт (тип, кол-во)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_type", label: "Оплата", type: "select", defaultValue: "за месяц", category: "payment",
        options: [
          { label: "Фиксированная за месяц", value: "за месяц" },
          { label: "За рейс", value: "за рейс" },
          { label: "По фактическому пробегу", value: "по пробегу" },
        ] },
      { id: "period", label: "Срок оказания услуг (с/по)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Договор оказания транспортных услуг") +
      pairIntro("customer", "Заказчик", "executor", "Исполнитель") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется оказывать Заказчику транспортные услуги: <strong>{{service_type}}</strong>, а Заказчик — принимать и оплачивать их.
  </p>
  <p class="mb-4 text-justify">
    1.2. Маршрут (пункты подачи): {{route}}. График и периодичность: {{schedule}}. Транспорт: {{vehicles}}.
  </p>
  <p class="mb-4 text-justify">
    1.3. Исполнитель гарантирует, что транспортные средства технически исправны, водители имеют необходимые категории прав,
    а деятельность по перевозкам ведётся при наличии необходимых разрешений (лицензий) в случаях, установленных законодательством.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности сторон</div>
  <p class="mb-4 text-justify">
    2.1. Исполнитель обеспечивает подачу транспорта в соответствии с графиком, соблюдение Правил дорожного движения и безопасность перевозок.
  </p>
  <p class="mb-4 text-justify">
    2.2. Заказчик обеспечивает доступ к пунктам погрузки (посадки) и соблюдает условия перевозки. При перевозке грузов стороны оформляют транспортные накладные.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Стоимость и порядок оплаты</div>
  <p class="mb-4 text-justify">
    3.1. Стоимость услуг: <strong>{{price}} ({{price_words}})</strong> рублей, оплата: {{price_type}}. Услуги оказываются в период: {{period}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. По окончании расчётного периода стороны подписывают акт оказанных услуг и (при необходимости) путевые листы.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность</div>
  <p class="mb-4 text-justify">
    4.1. Исполнитель несёт ответственность за сохранность груза с момента принятия его к перевозке до выдачи грузополучателю (ст. 796 ГК РФ) и за вред, причинённый пассажирам.
  </p>
  <p class="mb-4 text-justify">
    4.2. За задержку подачи транспорта по вине Исполнителя Заказчик вправе требовать неустойку в размере 0,5% от стоимости услуг за каждый час просрочки.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Исполнитель:</p>
  ${sideBlock("executor", "Исполнитель")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "executor", "Исполнитель"),
  },
  {
    id: "design-dev",
    name: "Договор на разработку дизайн-проекта",
    category: "business",
    actSource: "ст. 1288, 1296, 1255 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Разработка дизайн-проекта (интерьера, сайта, брендинга) с передачей исключительных прав на результат: этапы, правки, исходники, авторские права.",
    suggestedDocs: ["it-development", "website-support", "act-services"],
    printInstruction:
      "Исключительные права на результат переходят к Заказчику при оплате (ст. 1288, 1296 ГК РФ), если иное не указано в договоре. Приложите техническое задание.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("customer", "Заказчик", "customer"),
      ...sideFields("executor", "Исполнитель", "executor"),
      { id: "design_type", label: "Вид дизайна (интерьер, сайт, брендинг, полиграфия)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "design_object", label: "Объект дизайна (помещение, сайт и т.д.)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "stages", label: "Этапы и правки", type: "textarea", defaultValue: "концепция — 2 варианта, доработка, финальные макеты; 3 раунда правок включено", category: "contract" },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок сдачи (до даты)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "sources", label: "Передача исходников", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Да, исходные файлы передаются", value: "yes" },
          { label: "Нет, передаются только готовые макеты", value: "no" },
        ] },
      { id: "rights", label: "Исключительные права", type: "radio", defaultValue: "transfer", category: "contract",
        options: [
          { label: "Передаются Заказчику полностью", value: "transfer" },
          { label: "Остаются у Исполнителя (лицензия на использование)", value: "license" },
        ] },
    ],
    previewTemplate:
      pageShell("Договор на разработку дизайн-проекта") +
      pairIntro("customer", "Заказчик", "executor", "Исполнитель") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется разработать дизайн-проект: <strong>{{design_type}}</strong> для объекта: <strong>{{design_object}}</strong>
    в соответствии с техническим заданием (приложение № 1), а Заказчик — принять результат и оплатить его (ст. 1288 ГК РФ — договор авторского заказа).
  </p>
  <p class="mb-4 text-justify">1.2. Этапы и количество правок: {{stages}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки и порядок сдачи</div>
  <p class="mb-4 text-justify">
    2.1. Результат передаётся Заказчику в срок до «{{deadline}}» по акту приёма-передачи. Заказчик рассматривает результат в течение 5 рабочих дней и направляет замечания.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{#sources_is_yes}}Вместе с результатом Исполнитель передаёт исходные файлы (макеты в редактируемых форматах).{{/sources_is_yes}}
    {{#sources_is_no}}Заказчику передаются готовые макеты; исходные файлы остаются у Исполнителя.{{/sources_is_no}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Авторские права</div>
  <p class="mb-4 text-justify">
    3.1. {{#rights_is_transfer}}Исключительные права на созданный результат (ст. 1255, 1296 ГК РФ) полностью переходят к Заказчику после полной оплаты. Исполнитель сохраняет право указания своего авторства.{{/rights_is_transfer}}
    {{#rights_is_license}}Исключительные права остаются у Исполнителя; Заказчику предоставляется простая (неисключительная) лицензия на использование результата для целей, указанных в договоре.{{/rights_is_license}}
  </p>
  <p class="mb-4 text-justify">
    3.2. Исполнитель гарантирует, что результат не нарушает права третьих лиц и не содержит заимствований, в отношении которых у Заказчика могут возникнуть претензии.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стоимость и порядок оплаты</div>
  <p class="mb-4 text-justify">
    4.1. Стоимость разработки составляет <strong>{{price}} ({{price_words}})</strong> рублей. Оплата: аванс 50% при подписании договора, остаток — по подписании акта приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Заказчик:</p>
  ${sideBlock("customer", "Заказчик")}
  <p class="mb-2 mt-4">Исполнитель:</p>
  ${sideBlock("executor", "Исполнитель")}`
      + commonClauses() +
      pairSign("customer", "Заказчик", "executor", "Исполнитель"),
  },
  {
    id: "loan-use",
    name: "Договор безвозмездного пользования (ссуда)",
    category: "business",
    actSource: "ст. 689–701 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор ссуды: передача имущества (квартиры, автомобиля, оборудования) в безвозмездное пользование. Ремонт, содержание, возврат имущества.",
    suggestedDocs: ["rental-general", "loan-employee", "storage-agreement"],
    printInstruction:
      "Печатать в 2-х экземплярах. Текущий ремонт и содержание несёт ссудополучатель, капитальный — ссудодатель (ст. 695 ГК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("owner", "Ссудодатель", "owner"),
      ...sideFields("recipient", "Ссудополучатель", "recipient"),
      { id: "item_desc", label: "Имущество (описание)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "item_condition", label: "Состояние имущества при передаче", type: "text", defaultValue: "исправное, соответствующее назначению", category: "object" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term_type", label: "Срок пользования", type: "radio", defaultValue: "fixed", category: "contract",
        options: [
          { label: "Определённый срок (указать)", value: "fixed" },
          { label: "Без указания срока", value: "open" },
        ] },
      { id: "term_until", label: "Срок пользования (до даты)", type: "date", defaultValue: "", category: "contract",
        dependsOn: [{ fieldId: "term_type", value: "fixed" }] },
      { id: "return_days", label: "Уведомление о возврате (дней)", type: "number", defaultValue: "30", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор безвозмездного пользования (ссуда)") +
      pairIntro("owner", "Ссудодатель", "recipient", "Ссудополучатель") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Ссудодатель передаёт в безвозмездное пользование Ссудополучателю имущество: <strong>{{item_desc}}</strong>,
    в состоянии: {{item_condition}}, а Ссудополучатель обязуется вернуть его в том же состоянии с учётом нормального износа (ст. 689 ГК РФ).
  </p>
  <p class="mb-4 text-justify">1.2. Имущество используется для цели: {{purpose}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок пользования</div>
  <p class="mb-4 text-justify">
    {{#term_type_is_fixed}}2.1. Имущество передаётся в пользование до «{{term_until}}».{{/term_type_is_fixed}}
    {{#term_type_is_open}}2.1. Срок пользования не определён; договор считается заключённым на неопределённый срок (ст. 699 ГК РФ).{{/term_type_is_open}}
  </p>
  <p class="mb-4 text-justify">
    2.2. Каждая из сторон вправе отказаться от договора, заключённого без указания срока, известив другую сторону за {{return_days}} дней.
    Договор с указанием срока может быть расторгнут досрочно в случаях, предусмотренных ст. 698 ГК РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">
    3.1. Ссудополучатель обязан поддерживать имущество в исправном состоянии, нести расходы на его содержание и текущий ремонт (ст. 695 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3.2. Капитальный ремонт имущества осуществляет Ссудодатель, если иное не предусмотрено договором (ст. 695 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3.3. Ссудополучатель не вправе передавать имущество третьим лицам без согласия Ссудодателя (ст. 689, 690 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3.4. Ссудодатель отвечает за недостатки имущества, которые он умышленно или по грубой неосторожности не оговорил (ст. 693 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Возврат имущества</div>
  <p class="mb-4 text-justify">
    4.1. По истечении срока договора (или при отказе от него) Ссудополучатель возвращает имущество Ссудодателю по акту приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Ссудодатель:</p>
  ${sideBlock("owner", "Ссудодатель")}
  <p class="mb-2 mt-4">Ссудополучатель:</p>
  ${sideBlock("recipient", "Ссудополучатель")}`
      + commonClauses() +
      pairSign("owner", "Ссудодатель", "recipient", "Ссудополучатель"),
  },
];