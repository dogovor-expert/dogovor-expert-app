import type { LegalTemplate } from "../types";
import {
  sideFields,
  rentIntro,
  commonClauses,
  rentSign,
  pageShell,
  utilitiesSelect,
} from "./parts";

export const TEMPLATES_RENTALS: LegalTemplate[] = [
  {
    id: "rental-office",
    name: "Договор аренды офиса",
    category: "realty",
    actSource: "ст. 606–625, 650–655 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда офисного помещения: физлицо, ИП или организация сдают офис в аренду. Коммунальные платежи, обеспечительный платёж, срок и расторжение.",
    suggestedDocs: ["rental-commercial", "act-services", "terminate-rent"],
    printInstruction:
      "При сроке аренды от 12 месяцев договор подлежит государственной регистрации в Росреестре (ст. 609, 651 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "office_address", label: "Адрес офиса", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "area_sqm", label: "Площадь, кв.м", type: "number", defaultValue: "", category: "realty" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "размещение офиса", category: "contract" },
      { id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      utilitiesSelect,
      { id: "deposit_months", label: "Обеспечительный платёж (в месяцах аренды)", type: "number", defaultValue: "", category: "payment" },
      { id: "payment_day", label: "Срок оплаты (до N-го числа месяца)", type: "number", defaultValue: "5", category: "payment" },
      { id: "term_months", label: "Срок аренды (мес.)", type: "number", defaultValue: "11", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "30", category: "contract" },
      { id: "renovation", label: "Отделка и ремонт", type: "select", options: [
        { label: "Текущий ремонт — арендатор, капитальный — арендодатель", value: "Текущий ремонт — арендатор, капитальный — арендодатель" },
        { label: "Арендатор не производит ремонт", value: "Арендатор не производит ремонт" },
      ], defaultValue: "Текущий ремонт — арендатор, капитальный — арендодатель", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды офиса") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование офисное помещение площадью {{area_sqm}} кв.м по адресу: <strong>{{office_address}}</strong>, для цели: {{purpose}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Передача помещения оформляется актом приёма-передачи, который подписывается обеими сторонами и является неотъемлемой частью настоящего договора. Помещение считается переданным с момента подписания акта.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{rent_price_month}} руб.</strong> в месяц ({{rent_price_month_words}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. {{utilities}}. {{#deposit_months}}Обеспечительный платёж в размере {{deposit_months}} месячной(ых) арендной платы уплачивается при заключении договора и возвращается Арендатору при окончании срока аренды за вычетом задолженности и стоимости повреждений помещения.{{/deposit_months}}
  </p>
  <p class="mb-4 text-justify">
    2.3. Арендная плата вносится ежемесячно до {{payment_day}}-го числа текущего месяца.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Срок аренды: {{term_months}} месяцев с «{{start_date}}».
  </p>
  <p class="mb-4 text-justify">
    3.2. {{renovation}}.
  </p>
  <p class="mb-4 text-justify">
    3.3. Досрочное расторжение по инициативе любой из сторон — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. Арендодатель обязуется предоставить помещение в состоянии, соответствующем условиям договора и назначению имущества, и не препятствовать законному пользованию помещением.
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор обязуется использовать помещение в соответствии с целью, указанной в п. 1.1, поддерживать его в исправном состоянии, не производить перепланировок и неотделимых улучшений без письменного согласия Арендодателя.
  </p>
  <p class="mb-4 text-justify">
    4.3. Передача помещения в субаренду или перенаём допускается только с письменного согласия Арендодателя (п. 2 ст. 615 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. За просрочку внесения арендной платы Арендатор уплачивает неустойку в размере 0,1% от суммы задолженности за каждый день просрочки (ст. 330 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. При прекращении договора Арендатор обязан вернуть помещение по акту приёма-передачи в том состоянии, в котором его получил, с учётом нормального износа (ст. 622 ГК РФ).
  </p>` +
      commonClauses(10, " Споры о правах на недвижимое имущество рассматриваются по месту нахождения объекта (ст. 30 ГПК РФ).") +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "rental-warehouse",
    name: "Договор аренды склада",
    category: "realty",
    actSource: "ст. 606–625 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда складского помещения или склада целиком: характеристики объекта, режим доступа, охрана, коммунальные платежи, ответственность за сохранность товара.",
    suggestedDocs: ["rental-commercial", "goods-acceptance-act", "act-services"],
    printInstruction:
      "При сроке аренды от 12 месяцев договор подлежит государственной регистрации в Росреестре (ст. 609, 651 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "warehouse_address", label: "Адрес склада", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "area_sqm", label: "Площадь, кв.м", type: "number", defaultValue: "", category: "realty" },
      { id: "ceiling_height", label: "Высота потолков, м", type: "text", defaultValue: "", category: "realty" },
      { id: "floor_load", label: "Нагрузка на пол, кг/кв.м", type: "text", defaultValue: "", category: "realty" },
      { id: "gates", label: "Ворота (тип, размер)", type: "text", defaultValue: "", category: "realty" },
      { id: "heating", label: "Отопление", type: "select", options: [
        { label: "Отапливаемый склад", value: "Отапливаемый склад" },
        { label: "Неотапливаемый склад", value: "Неотапливаемый склад" },
      ], defaultValue: "Отапливаемый склад", category: "realty" },
      { id: "security", label: "Охрана и доступ", type: "text", defaultValue: "пропускной режим, видеонаблюдение", category: "contract" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "хранение товаров и материалов", category: "contract" },
      { id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      utilitiesSelect,
      { id: "deposit_months", label: "Обеспечительный платёж (в месяцах аренды)", type: "number", defaultValue: "", category: "payment" },
      { id: "payment_day", label: "Срок оплаты (до N-го числа месяца)", type: "number", defaultValue: "5", category: "payment" },
      { id: "term_months", label: "Срок аренды (мес.)", type: "number", defaultValue: "11", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "30", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды складского помещения") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование складское помещение по адресу: <strong>{{warehouse_address}}</strong>, со следующими характеристиками:
  </p>
  <table class="w-full border-collapse mb-4 text-xs">
    <tr><th class="border border-zinc-400 p-1 text-left">Площадь</th><td class="border border-zinc-400 p-1">{{area_sqm}} кв.м</td></tr>
    {{#ceiling_height}}<tr><th class="border border-zinc-400 p-1 text-left">Высота потолков</th><td class="border border-zinc-400 p-1">{{ceiling_height}} м</td></tr>{{/ceiling_height}}
    {{#floor_load}}<tr><th class="border border-zinc-400 p-1 text-left">Нагрузка на пол</th><td class="border border-zinc-400 p-1">{{floor_load}} кг/кв.м</td></tr>{{/floor_load}}
    {{#gates}}<tr><th class="border border-zinc-400 p-1 text-left">Ворота</th><td class="border border-zinc-400 p-1">{{gates}}</td></tr>{{/gates}}
    <tr><th class="border border-zinc-400 p-1 text-left">Отопление</th><td class="border border-zinc-400 p-1">{{heating}}</td></tr>
  </table>
  <p class="mb-4 text-justify">
    1.2. Цель использования: {{purpose}}. Передача склада оформляется актом приёма-передачи, являющимся неотъемлемой частью договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{rent_price_month}} руб.</strong> в месяц ({{rent_price_month_words}}) и вносится ежемесячно до {{payment_day}}-го числа текущего месяца.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{utilities}}. {{#deposit_months}}Обеспечительный платёж в размере {{deposit_months}} месячной(ых) арендной платы возвращается при окончании срока аренды за вычетом задолженности.{{/deposit_months}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Срок аренды: {{term_months}} месяцев с «{{start_date}}». Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок пользования и охрана</div>
  <p class="mb-4 text-justify">
    4.1. Доступ на склад осуществляется в порядке, установленном Арендодателем: {{security}}.
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор несёт ответственность за сохранность имущества, размещённого на складе, соблюдение противопожарных и санитарных норм, правил техники безопасности.
  </p>
  <p class="mb-4 text-justify">
    4.3. Хранение взрывоопасных, легковоспламеняющихся, токсичных и иных опасных веществ допускается только с письменного согласия Арендодателя.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. За просрочку внесения арендной платы Арендатор уплачивает неустойку в размере 0,1% от суммы задолженности за каждый день просрочки (ст. 330 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. При прекращении договора Арендатор обязан вернуть склад по акту приёма-передачи в состоянии, пригодном для дальнейшего использования, с учётом нормального износа (ст. 622 ГК РФ).
  </p>` +
      commonClauses(10, " Споры о правах на недвижимое имущество рассматриваются по месту нахождения объекта (ст. 30 ГПК РФ).") +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "rental-workplace",
    name: "Договор аренды рабочего места",
    category: "realty",
    actSource: "ст. 606–625 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда рабочего места в офисе или коворкинге: инфраструктура, часы доступа, общие зоны. Подходит для фрилансеров, стартапов и малого бизнеса.",
    suggestedDocs: ["rental-commercial", "act-services"],
    printInstruction: "Договор не подлежит госрегистрации (аренда части помещения). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "office_address", label: "Адрес офиса", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "places_count", label: "Количество рабочих мест", type: "number", defaultValue: "1", category: "realty", validation: { required: true } },
      { id: "workspace_desc", label: "Описание мест (номера, локация)", type: "text", defaultValue: "", category: "realty" },
      { id: "infrastructure", label: "Включено в аренду", type: "textarea", rows: 3, defaultValue: "стол, стул, доступ в интернет (Wi-Fi), электричество, вода, пользование переговорной и кухней по предварительному согласованию", category: "contract" },
      { id: "access_hours", label: "Часы доступа", type: "text", defaultValue: "ежедневно с 9:00 до 21:00", category: "contract" },
      { id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      utilitiesSelect,
      { id: "term_months", label: "Срок аренды (мес.)", type: "number", defaultValue: "1", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "14", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды рабочего места") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель предоставляет, а Арендатор принимает во временное пользование {{places_count}} рабочее(их) место(а) в офисе по адресу: <strong>{{office_address}}</strong>{{#workspace_desc}}, расположение: {{workspace_desc}}{{/workspace_desc}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. В арендную плату включено: {{infrastructure}}.
  </p>
  <p class="mb-4 text-justify">
    1.3. Часы доступа: {{access_hours}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{rent_price_month}} руб.</strong> в месяц ({{rent_price_month_words}}), {{utilities}}.
  </p>
  <p class="mb-4 text-justify">
    2.2. Арендная плата вносится ежемесячно до 5-го числа текущего месяца.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Срок аренды: {{term_months}} месяцев с «{{start_date}}». По истечении срока договор может быть продлён по соглашению сторон.
  </p>
  <p class="mb-4 text-justify">
    3.2. Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок пользования</div>
  <p class="mb-4 text-justify">
    4.1. Арендатор обязуется соблюдать правила внутреннего распорядка офиса, бережно относиться к имуществу, не нарушать тишину и не мешать работе других арендаторов.
  </p>
  <p class="mb-4 text-justify">
    4.2. Общие зоны (коридоры, санузлы, кухня, переговорные) используются совместно с другими арендаторами на условиях, установленных Арендодателем.
  </p>
  <p class="mb-4 text-justify">
    4.3. Проведение мероприятий с участием третьих лиц, а также передача рабочего места в субаренду допускаются только с письменного согласия Арендодателя.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. За просрочку внесения арендной платы Арендатор уплачивает неустойку в размере 0,1% от суммы задолженности за каждый день просрочки.
  </p>
  <p class="mb-4 text-justify">
    5.2. При прекращении договора Арендатор обязан освободить рабочее место и сдать его по акту в состоянии, пригодном для дальнейшего использования.
  </p>` +
      commonClauses() +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "rental-daily",
    name: "Договор посуточной аренды квартиры",
    category: "realty",
    actSource: "гл. 35 ГК РФ (ст. 671, 683)",
    lastUpdated: "Август 2026",
    description:
      "Посуточная аренда квартиры между собственником и гостем: сроки заезда и выезда, оплата, залог, правила проживания. Краткосрочный наём до 1 года — без госрегистрации.",
    suggestedDocs: ["rental-flat", "raspiska-money"],
    printInstruction: "Краткосрочный наём (до 1 года) не требует госрегистрации (ст. 683 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "landlord_name", label: "Наймодатель (ФИО)", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "landlord_passport", label: "Наймодатель: паспорт (серия и номер)", type: "text", defaultValue: "", category: "landlord" },
      { id: "landlord_phone", label: "Наймодатель: телефон", type: "text", defaultValue: "", category: "landlord" },
      { id: "tenant_name", label: "Наниматель (ФИО)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Наниматель: паспорт (серия и номер)", type: "text", defaultValue: "", category: "tenant" },
      { id: "tenant_phone", label: "Наниматель: телефон", type: "text", defaultValue: "", category: "tenant" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "guests_count", label: "Число гостей", type: "number", defaultValue: "1", category: "contract" },
      { id: "check_in", label: "Заезд (дата и время)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "check_out", label: "Выезд (дата и время)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "rent_price_day", label: "Арендная плата в сутки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deposit_sum", label: "Залог за сохранность (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "utilities_included", label: "Коммунальные и бытовые расходы", type: "select", options: [
        { label: "Включены в арендную плату", value: "Включены в арендную плату" },
        { label: "Оплачиваются нанимателем отдельно", value: "Оплачиваются нанимателем отдельно" },
      ], defaultValue: "Включены в арендную плату", category: "payment" },
      { id: "inventory", label: "Имущество в квартире (краткая опись)", type: "textarea", rows: 3, defaultValue: "", category: "contract" },
      { id: "rules", label: "Правила проживания", type: "textarea", rows: 3, defaultValue: "не курить в квартире, не шуметь с 23:00 до 8:00, без животных", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор посуточной аренды квартиры") +
      `
  <p class="mb-4 text-justify">
    <strong>{{landlord_name}}</strong>{{#landlord_passport}}, паспорт {{landlord_passport}}{{/landlord_passport}}, именуемый(ая) в дальнейшем «Наймодатель», с одной стороны, и <strong>{{tenant_name}}</strong>{{#tenant_passport}}, паспорт {{tenant_passport}}{{/tenant_passport}}, именуемый(ая) в дальнейшем «Наниматель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Наймодатель передаёт, а Наниматель принимает во временное владение и пользование квартиру по адресу: <strong>{{flat_address}}</strong>, для проживания {{guests_count}} человека(ек).
  </p>
  <p class="mb-4 text-justify">
    1.2. {{#inventory}}Имущество, находящееся в квартире, передаётся согласно описи: {{inventory}}.{{/inventory}}{{^inventory}}Имущество в квартире передаётся в состоянии, пригодном для проживания.{{/inventory}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок проживания</div>
  <p class="mb-4 text-justify">
    2.1. Срок проживания: с «{{check_in}}» до «{{check_out}}». Договор заключается на срок до одного года (краткосрочный наём, ст. 683 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Продление срока проживания — по соглашению сторон, оформленному дополнительным соглашением.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата и залог</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price_day}} руб.</strong> в сутки ({{rent_price_day_words}}) и уплачивается в полном объёме при заселении.
  </p>
  <p class="mb-4 text-justify">
    3.2. {{utilities_included}}.
  </p>
  <p class="mb-4 text-justify">
    3.3. {{#deposit_sum}}Залог за сохранность имущества в размере {{deposit_sum}} руб. уплачивается при заселении и возвращается при выезде при отсутствии повреждений и задолженности.{{/deposit_sum}}{{^deposit_sum}}Залог не взимается.{{/deposit_sum}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. Наниматель обязуется соблюдать правила проживания: {{rules}}, бережно относиться к имуществу, поддерживать чистоту.
  </p>
  <p class="mb-4 text-justify">
    4.2. Вселение иных лиц, помимо указанных в п. 1.1, допускается только с согласия Наймодателя.
  </p>
  <p class="mb-4 text-justify">
    4.3. Наймодатель обязуется передать квартиру в состоянии, пригодном для проживания, и не препятствовать проживанию в течение срока договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. За повреждение имущества Наниматель возмещает стоимость ремонта или ущерба в полном объёме.
  </p>
  <p class="mb-4 text-justify">
    5.2. При досрочном выезде Нанимателя уплаченная плата за неиспользованные сутки не возвращается, если иное не установлено соглашением сторон.
  </p>` +
      commonClauses() +
      rentSign("Наймодатель", "Наниматель"),
  },
  {
    id: "assign-rent-land",
    name: "Переуступка права аренды земельного участка",
    category: "realty",
    actSource: "ст. 615 ГК РФ, ст. 22 ЗК РФ",
    lastUpdated: "Август 2026",
    description:
      "Перенаём: арендатор передаёт новому арендатору права и обязанности по договору аренды земельного участка (с согласия арендодателя либо без него при сроке свыше 5 лет).",
    suggestedDocs: ["land-lease", "terminate-rent"],
    printInstruction: "При сроке аренды от 12 месяцев договор подлежит госрегистрации в Росреестре. Печатать в 3-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "assignor_name", label: "Арендатор (передаёт права)", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "assignor_inn", label: "Арендатор: ИНН", type: "text", defaultValue: "", category: "landlord" },
      { id: "assignee_name", label: "Новый арендатор (принимает права)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "assignee_inn", label: "Новый арендатор: ИНН", type: "text", defaultValue: "", category: "tenant" },
      { id: "main_lease_info", label: "Реквизиты основного договора аренды", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "landlord_name", label: "Арендодатель по основному договору", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "land_cadastral", label: "Кадастровый номер участка", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "land_location", label: "Местоположение участка", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "land_area", label: "Площадь участка, кв.м", type: "number", defaultValue: "", category: "realty" },
      { id: "consent_type", label: "Согласие арендодателя", type: "select", options: [
        { label: "Согласие арендодателя получено", value: "Согласие арендодателя получено" },
        { label: "Согласие не требуется (ст. 22 ЗК РФ, срок свыше 5 лет)", value: "Согласие не требуется (ст. 22 ЗК РФ, срок свыше 5 лет)" },
      ], defaultValue: "Согласие арендодателя получено", category: "contract" },
      { id: "rent_paid_until", label: "Арендная плата оплачена по дату", type: "date", defaultValue: "", category: "payment" },
      { id: "rights_scope", label: "Объём передаваемых прав", type: "textarea", rows: 3, defaultValue: "все права и обязанности арендатора по основному договору аренды", category: "contract" },
      { id: "transfer_date", label: "Дата передачи прав", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Договор переуступки права аренды земельного участка") +
      `
  <p class="mb-4 text-justify">
    <strong>{{assignor_name}}</strong>{{#assignor_inn}} (ИНН {{assignor_inn}}){{/assignor_inn}}, именуемый(ая) в дальнейшем «Арендатор», с одной стороны, и <strong>{{assignee_name}}</strong>{{#assignee_inn}} (ИНН {{assignee_inn}}){{/assignee_inn}}, именуемый(ая) в дальнейшем «Новый арендатор», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендатор передаёт, а Новый арендатор принимает в полном объёме права и обязанности арендатора по договору аренды земельного участка <strong>{{main_lease_info}}</strong>, заключённому с {{landlord_name}} (далее — «Арендодатель»), в отношении земельного участка с кадастровым номером <strong>{{land_cadastral}}</strong>, расположенного по адресу: {{land_location}}{{#land_area}}, площадью {{land_area}} кв.м{{/land_area}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. {{consent_type}}.
  </p>
  <p class="mb-4 text-justify">
    1.3. Объём передаваемых прав: {{rights_scope}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Расчёты и обязательства</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата по основному договору оплачена Арендатором по «{{rent_paid_until}}». С указанной даты обязанность по внесению арендной платы переходит к Новому арендатору.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{#main_lease_info}}Новый арендатор обязуется соблюдать все условия основного договора аренды и нести ответственность за их нарушение с даты перехода прав.{{/main_lease_info}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача прав</div>
  <p class="mb-4 text-justify">
    3.1. Права и обязанности по основному договору аренды переходят к Новому арендатору с «{{transfer_date}}».
  </p>
  <p class="mb-4 text-justify">
    3.2. Арендатор обязуется передать Новому арендатору оригинал основного договора аренды и все относящиеся к участку документы в течение 3 (трёх) рабочих дней с даты подписания настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    4.1. До даты передачи прав Арендатор несёт ответственность за исполнение обязательств по основному договору, после — Новый арендатор.
  </p>
  <p class="mb-4 text-justify">
    4.2. Передача прав, совершённая с нарушением требований о получении согласия Арендодателя, может быть признана недействительной (ст. 168 ГК РФ).
  </p>` +
      commonClauses() +
      `
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{assignor_name}}</strong></p>
      {{#assignor_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{assignor_inn}}</p>{{/assignor_inn}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">Новый арендатор:</div>
      <p class="mb-1"><strong>{{assignee_name}}</strong></p>
      {{#assignee_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{assignee_inn}}</p>{{/assignee_inn}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
  {
    id: "sublease-flat",
    name: "Договор субаренды квартиры",
    category: "realty",
    actSource: "ст. 615 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Субаренда квартиры: арендатор передаёт жильё в субаренду с согласия арендодателя. Срок субаренды не может превышать срок основного договора.",
    suggestedDocs: ["rental-flat", "terminate-sublease"],
    printInstruction: "Субаренда возможна только с согласия арендодателя (п. 2 ст. 615 ГК РФ). Печатать в 3-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Субарендодатель", "landlord"),
      ...sideFields("tenant", "Субарендатор", "tenant"),
      { id: "main_lease_info", label: "Реквизиты основного договора аренды", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "landlord_consent", label: "Согласие арендодателя", type: "select", options: [
        { label: "Согласие арендодателя получено", value: "Согласие арендодателя получено" },
        { label: "Арендодатель не возражает (ст. 615 ГК РФ)", value: "Арендодатель не возражает (ст. 615 ГК РФ)" },
      ], defaultValue: "Согласие арендодателя получено", category: "contract" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      utilitiesSelect,
      { id: "deposit_months", label: "Обеспечительный платёж (в месяцах аренды)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_months", label: "Срок субаренды (мес.)", type: "number", defaultValue: "11", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "30", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор субаренды квартиры") +
      rentIntro("Субарендодатель", "Субарендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Субарендодатель передаёт, а Субарендатор принимает во временное владение и пользование квартиру по адресу: <strong>{{flat_address}}</strong>, переданную Субарендодателю по договору аренды <strong>{{main_lease_info}}</strong>.
  </p>
  <p class="mb-4 text-justify">
    1.2. {{landlord_consent}}. К договору субаренды применяются правила о договорах аренды (п. 2 ст. 615 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок субаренды</div>
  <p class="mb-4 text-justify">
    2.1. Срок субаренды: {{term_months}} месяцев с «{{start_date}}». Срок субаренды не может превышать срок основного договора аренды.
  </p>
  <p class="mb-4 text-justify">
    2.2. Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price_month}} руб.</strong> в месяц ({{rent_price_month_words}}), {{utilities}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Арендная плата вносится ежемесячно до 5-го числа текущего месяца. {{#deposit_months}}Обеспечительный платёж в размере {{deposit_months}} месячной(ых) арендной платы возвращается при окончании срока субаренды.{{/deposit_months}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. Субарендатор обязуется пользоваться квартирой в соответствии с её назначением и соблюдать условия основного договора аренды, которые стали ему известны.
  </p>
  <p class="mb-4 text-justify">
    4.2. Передача квартиры в субаренду третьим лицам не допускается.
  </p>
  <p class="mb-4 text-justify">
    4.3. При прекращении основного договора аренды прекращается и настоящий договор субаренды; Субарендатор в этом случае не вправе требовать заключения договора с арендодателем.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">
    5.1. За просрочку внесения арендной платы Субарендатор уплачивает неустойку в размере 0,1% от суммы задолженности за каждый день просрочки.
  </p>
  <p class="mb-4 text-justify">
    5.2. При прекращении договора Субарендатор обязан вернуть квартиру по акту в состоянии, пригодном для проживания, с учётом нормального износа.
  </p>` +
      commonClauses() +
      rentSign("Субарендодатель", "Субарендатор"),
  },
  {
    id: "rental-car",
    name: "Договор аренды автомобиля без экипажа",
    category: "business",
    actSource: "ст. 642–648 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда автомобиля без экипажа: собственник передаёт авто, арендатор управляет самостоятельно и несёт расходы на содержание, страхование и ремонт (ст. 642–648 ГК РФ).",
    suggestedDocs: ["act-transfer-auto", "auto-condition-act"],
    printInstruction: "Письменная форма обязательна независимо от срока (ст. 643 ГК РФ); госрегистрация не требуется. Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "car_brand", label: "Марка, модель", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "car_year", label: "Год выпуска", type: "number", defaultValue: "", category: "realty" },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "realty" },
      { id: "car_plate", label: "Госномер", type: "text", defaultValue: "", category: "realty" },
      { id: "car_color", label: "Цвет", type: "text", defaultValue: "", category: "realty" },
      { id: "car_sts", label: "СТС (серия и номер)", type: "text", defaultValue: "", category: "realty" },
      { id: "mileage_start", label: "Пробег при передаче, км", type: "number", defaultValue: "", category: "realty" },
      { id: "mileage_limit", label: "Суточный лимит пробега, км (если есть)", type: "number", defaultValue: "", category: "contract" },
      { id: "period_type", label: "Период оплаты", type: "select", options: [
        { label: "В сутки", value: "в сутки" },
        { label: "В месяц", value: "в месяц" },
      ], defaultValue: "в сутки", category: "payment" },
      { id: "rent_price", label: "Арендная плата (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deposit_sum", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "insurance", label: "Страхование", type: "select", options: [
        { label: "ОСАГО — арендатор, КАСКО — по соглашению сторон", value: "ОСАГО — арендатор, КАСКО — по соглашению сторон" },
        { label: "ОСАГО и КАСКО — арендатор", value: "ОСАГО и КАСКО — арендатор" },
        { label: "ОСАГО и КАСКО — арендодатель", value: "ОСАГО и КАСКО — арендодатель" },
      ], defaultValue: "ОСАГО — арендатор, КАСКО — по соглашению сторон", category: "contract" },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Дата окончания аренды", type: "date", defaultValue: "", category: "contract" },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "3", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды автомобиля без экипажа") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель предоставляет, а Арендатор принимает во временное владение и пользование автомобиль:
  </p>
  <table class="w-full border-collapse mb-4 text-xs">
    <tr><th class="border border-zinc-400 p-1 text-left">Марка, модель</th><td class="border border-zinc-400 p-1">{{car_brand}}</td></tr>
    {{#car_year}}<tr><th class="border border-zinc-400 p-1 text-left">Год выпуска</th><td class="border border-zinc-400 p-1">{{car_year}}</td></tr>{{/car_year}}
    {{#car_vin}}<tr><th class="border border-zinc-400 p-1 text-left">VIN</th><td class="border border-zinc-400 p-1">{{car_vin}}</td></tr>{{/car_vin}}
    {{#car_plate}}<tr><th class="border border-zinc-400 p-1 text-left">Госномер</th><td class="border border-zinc-400 p-1">{{car_plate}}</td></tr>{{/car_plate}}
    {{#car_color}}<tr><th class="border border-zinc-400 p-1 text-left">Цвет</th><td class="border border-zinc-400 p-1">{{car_color}}</td></tr>{{/car_color}}
    {{#car_sts}}<tr><th class="border border-zinc-400 p-1 text-left">СТС</th><td class="border border-zinc-400 p-1">{{car_sts}}</td></tr>{{/car_sts}}
    {{#mileage_start}}<tr><th class="border border-zinc-400 p-1 text-left">Пробег при передаче</th><td class="border border-zinc-400 p-1">{{mileage_start}} км</td></tr>{{/mileage_start}}
  </table>
  <p class="mb-4 text-justify">
    1.2. Автомобиль передаётся по акту приёма-передачи с указанием технического состояния. Договор заключается в письменной форме (ст. 643 ГК РФ) и не подлежит государственной регистрации.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок аренды</div>
  <p class="mb-4 text-justify">
    2.1. Срок аренды: с «{{start_date}}»{{#end_date}} по «{{end_date}}»{{/end_date}}. Правила о возобновлении договора на неопределённый срок и преимущественном праве арендатора (ст. 621 ГК РФ) не применяются (п. 3 ст. 642 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price}} руб.</strong> {{period_type}} ({{rent_price_words}}).
  </p>
  <p class="mb-4 text-justify">
    3.2. {{#deposit_sum}}Обеспечительный платёж в размере {{deposit_sum}} руб. вносится при заключении договора и возвращается при возврате автомобиля в исправном состоянии.{{/deposit_sum}}{{^deposit_sum}}Обеспечительный платёж не взимается.{{/deposit_sum}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности арендатора</div>
  <p class="mb-4 text-justify">
    4.1. Арендатор в течение всего срока договора обязан поддерживать надлежащее состояние автомобиля, включая осуществление текущего и капитального ремонта (ст. 644 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор несёт расходы на содержание автомобиля, его страхование ({{insurance}}), а также расходы, возникающие в связи с его эксплуатацией, включая ГСМ и оплату штрафов за нарушения ПДД (ст. 646 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.3. Ответственность за вред, причинённый третьим лицам автомобилем, несёт Арендатор (ст. 648 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.4. {{#mileage_limit}}Суточный лимит пробега: {{mileage_limit}} км. Превышение лимита оплачивается дополнительно по соглашению сторон.{{/mileage_limit}}{{^mileage_limit}}Ограничения пробега не устанавливаются.{{/mileage_limit}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Возврат автомобиля</div>
  <p class="mb-4 text-justify">
    5.1. По истечении срока аренды Арендатор обязан возвратить автомобиль в том состоянии, в котором его получил, с учётом нормального износа, по акту приёма-передачи (ст. 622 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. За повреждение автомобиля сверх нормального износа Арендатор возмещает стоимость восстановительного ремонта, определяемую по соглашению сторон либо независимой оценкой.
  </p>` +
      commonClauses() +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "rental-movable",
    name: "Договор аренды движимого имущества",
    category: "business",
    actSource: "ст. 606–625 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда движимого имущества: оборудование, техника, мебель, инструменты. Текущий ремонт — арендатор, капитальный — арендодатель (ст. 616 ГК РФ).",
    suggestedDocs: ["equipment-rental", "act-services"],
    printInstruction: "Письменная форма — при сроке от 1 года или если одна из сторон — юрлицо (ст. 609 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "property_name", label: "Наименование имущества", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "property_desc", label: "Описание и характеристики", type: "textarea", rows: 3, defaultValue: "", category: "realty" },
      { id: "property_count", label: "Количество", type: "text", defaultValue: "1", category: "realty" },
      { id: "location", label: "Место передачи и использования", type: "text", defaultValue: "", category: "realty" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "", category: "contract" },
      { id: "period_type", label: "Период оплаты", type: "select", options: [
        { label: "В месяц", value: "в месяц" },
        { label: "В день", value: "в день" },
        { label: "Единовременно за весь срок", value: "единовременно за весь срок" },
      ], defaultValue: "в месяц", category: "payment" },
      { id: "rent_price", label: "Арендная плата (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deposit_sum", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "repair_responsibility", label: "Ремонт", type: "select", options: [
        { label: "Текущий ремонт — арендатор, капитальный — арендодатель (ст. 616 ГК РФ)", value: "Текущий ремонт — арендатор, капитальный — арендодатель (ст. 616 ГК РФ)" },
        { label: "Все виды ремонта — арендатор", value: "Все виды ремонта — арендатор" },
      ], defaultValue: "Текущий ремонт — арендатор, капитальный — арендодатель (ст. 616 ГК РФ)", category: "contract" },
      { id: "term_months", label: "Срок аренды (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "14", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды движимого имущества") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование имущество: <strong>{{property_name}}</strong> в количестве {{property_count}} шт.{{#property_desc}} Характеристики: {{property_desc}}.{{/property_desc}}
  </p>
  <p class="mb-4 text-justify">
    1.2. Имущество передаётся по акту приёма-передачи по адресу: {{location}}, и используется Арендатором в целях: {{purpose}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок аренды</div>
  <p class="mb-4 text-justify">
    2.1. {{#term_months}}Срок аренды: {{term_months}} месяцев с «{{start_date}}».{{/term_months}}{{^term_months}}Договор заключён на неопределённый срок, аренда начинается с «{{start_date}}».{{/term_months}}
  </p>
  <p class="mb-4 text-justify">
    2.2. Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price}} руб.</strong> {{period_type}} ({{rent_price_words}}).
  </p>
  <p class="mb-4 text-justify">
    3.2. {{#deposit_sum}}Обеспечительный платёж в размере {{deposit_sum}} руб. вносится при заключении договора и возвращается при возврате имущества в исправном состоянии.{{/deposit_sum}}{{^deposit_sum}}Обеспечительный платёж не взимается.{{/deposit_sum}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. {{repair_responsibility}}.
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор обязуется использовать имущество по назначению, обеспечивать его сохранность и не передавать в субаренду без письменного согласия Арендодателя.
  </p>
  <p class="mb-4 text-justify">
    4.3. Арендодатель отвечает за недостатки имущества, препятствующие его использованию, если они возникли до передачи имущества (ст. 612 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Возврат имущества</div>
  <p class="mb-4 text-justify">
    5.1. При прекращении договора Арендатор обязан вернуть имущество по акту приёма-передачи в том состоянии, в котором его получил, с учётом нормального износа (ст. 622 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. За повреждение имущества сверх нормального износа Арендатор возмещает стоимость восстановительного ремонта.
  </p>` +
      commonClauses() +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "rental-general",
    name: "Договор аренды (общий)",
    category: "business",
    actSource: "ст. 606–625 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Универсальный договор аренды любого имущества (движимого или недвижимого) между физлицами, ИП и организациями: срок, плата, ремонт, возврат, расторжение.",
    suggestedDocs: ["rental-movable", "rental-commercial", "terminate-rent"],
    printInstruction:
      "При аренде недвижимости сроком от 12 месяцев требуется госрегистрация (ст. 609 ГК РФ). Печатать в 2-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Арендодатель", "landlord"),
      ...sideFields("tenant", "Арендатор", "tenant"),
      { id: "property_type", label: "Тип имущества", type: "select", options: [
        { label: "Движимое имущество", value: "Движимое имущество" },
        { label: "Недвижимое имущество", value: "Недвижимое имущество" },
        { label: "Иное имущество", value: "Иное имущество" },
      ], defaultValue: "Движимое имущество", category: "realty" },
      { id: "property_name", label: "Наименование имущества", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "property_desc", label: "Описание и характеристики", type: "textarea", rows: 3, defaultValue: "", category: "realty" },
      { id: "location", label: "Место передачи и использования", type: "text", defaultValue: "", category: "realty" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "", category: "contract" },
      { id: "period_type", label: "Период оплаты", type: "select", options: [
        { label: "В месяц", value: "в месяц" },
        { label: "В день", value: "в день" },
        { label: "В год", value: "в год" },
      ], defaultValue: "в месяц", category: "payment" },
      { id: "rent_price", label: "Арендная плата (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deposit_sum", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_type", label: "Срок", type: "select", options: [
        { label: "Определённый срок", value: "fixed" },
        { label: "Неопределённый срок", value: "open" },
      ], defaultValue: "fixed", category: "contract" },
      { id: "term_months", label: "Срок (мес.), если определён", type: "number", defaultValue: "", category: "contract", dependsOn: [{ fieldId: "term_type", value: "fixed" }] },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "30", category: "contract" },
      { id: "autorenewal", label: "Автопролонгация", type: "checkbox", defaultValue: "false", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор аренды") +
      rentIntro("Арендодатель", "Арендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование {{property_type}}: <strong>{{property_name}}</strong>{{#property_desc}} (характеристики: {{property_desc}}){{/property_desc}}{{#location}}, по адресу: {{location}}{{/location}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Имущество используется Арендатором в целях: {{purpose}}. Передача оформляется актом приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок аренды</div>
  <p class="mb-4 text-justify">
    2.1. {{#term_type_is_fixed}}Срок аренды: {{term_months}} месяцев с «{{start_date}}».{{/term_type_is_fixed}}{{#term_type_is_open}}Договор заключён на неопределённый срок, аренда начинается с «{{start_date}}» (п. 2 ст. 610 ГК РФ).{{/term_type_is_open}}
  </p>
  <p class="mb-4 text-justify">
    2.2. {{#autorenewal_is_true}}По истечении срока договор автоматически продлевается на тот же срок, если ни одна из сторон не заявит о прекращении за {{notice_days}} дней до окончания срока (ст. 621 ГК РФ).{{/autorenewal_is_true}}{{^autorenewal_is_true}}Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.{{/autorenewal_is_true}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price}} руб.</strong> {{period_type}} ({{rent_price_words}}).
  </p>
  <p class="mb-4 text-justify">
    3.2. {{#deposit_sum}}Обеспечительный платёж в размере {{deposit_sum}} руб. возвращается при возврате имущества в исправном состоянии.{{/deposit_sum}}{{^deposit_sum}}Обеспечительный платёж не взимается.{{/deposit_sum}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    4.1. Текущий ремонт имущества производит Арендатор, капитальный — Арендодатель, если иное не установлено соглашением сторон (ст. 616 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Арендатор обязуется использовать имущество по назначению, обеспечивать его сохранность, не передавать в субаренду и не передавать свои права по договору без письменного согласия Арендодателя (ст. 615 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.3. Арендодатель отвечает за недостатки имущества, препятствующие его использованию, если они возникли до передачи имущества (ст. 612 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Возврат имущества</div>
  <p class="mb-4 text-justify">
    5.1. При прекращении договора Арендатор обязан вернуть имущество по акту приёма-передачи в том состоянии, в котором его получил, с учётом нормального износа (ст. 622 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    5.2. При просрочке возврата имущества Арендатор уплачивает арендную плату за всё время просрочки и возмещает убытки в части, не покрытой арендной платой (ст. 622 ГК РФ).
  </p>` +
      commonClauses() +
      rentSign("Арендодатель", "Арендатор"),
  },
  {
    id: "sublease-ts",
    name: "Договор субаренды транспортного средства",
    category: "business",
    actSource: "ст. 615, 642–648 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Субаренда автомобиля или транспортного средства: арендатор передаёт ТС в субаренду с согласия арендодателя. Расходы, ремонт и ответственность — на субарендаторе.",
    suggestedDocs: ["rental-car", "act-transfer-auto", "terminate-sublease"],
    printInstruction: "Письменная форма обязательна независимо от срока (ст. 643 ГК РФ). Печатать в 3-х экземплярах.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("landlord", "Субарендодатель", "landlord"),
      ...sideFields("tenant", "Субарендатор", "tenant"),
      { id: "main_lease_info", label: "Реквизиты основного договора аренды ТС", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "landlord_consent", label: "Согласие арендодателя", type: "select", options: [
        { label: "Согласие арендодателя получено", value: "Согласие арендодателя получено" },
        { label: "Арендодатель не возражает (ст. 615 ГК РФ)", value: "Арендодатель не возражает (ст. 615 ГК РФ)" },
      ], defaultValue: "Согласие арендодателя получено", category: "contract" },
      { id: "car_brand", label: "Марка, модель ТС", type: "text", defaultValue: "", category: "realty", validation: { required: true } },
      { id: "car_vin", label: "VIN", type: "text", defaultValue: "", category: "realty" },
      { id: "car_plate", label: "Госномер", type: "text", defaultValue: "", category: "realty" },
      { id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deposit_sum", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_months", label: "Срок субаренды (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата начала", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "14", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор субаренды транспортного средства") +
      rentIntro("Субарендодатель", "Субарендатор") +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Субарендодатель передаёт, а Субарендатор принимает во временное владение и пользование транспортное средство: <strong>{{car_brand}}</strong>{{#car_vin}} (VIN {{car_vin}}){{/car_vin}}{{#car_plate}}, госномер {{car_plate}}{{/car_plate}}, переданное Субарендодателю по договору аренды <strong>{{main_lease_info}}</strong>.
  </p>
  <p class="mb-4 text-justify">
    1.2. {{landlord_consent}}. Передача ТС оформляется актом приёма-передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок субаренды</div>
  <p class="mb-4 text-justify">
    2.1. {{#term_months}}Срок субаренды: {{term_months}} месяцев с «{{start_date}}». Срок субаренды не может превышать срок основного договора аренды.{{/term_months}}{{^term_months}}Субаренда начинается с «{{start_date}}» на срок, не превышающий срок основного договора аренды.{{/term_months}}
  </p>
  <p class="mb-4 text-justify">
    2.2. Досрочное расторжение — по письменному уведомлению за {{notice_days}} дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Арендная плата</div>
  <p class="mb-4 text-justify">
    3.1. Арендная плата составляет <strong>{{rent_price_month}} руб.</strong> в месяц ({{rent_price_month_words}}).
  </p>
  <p class="mb-4 text-justify">
    3.2. {{#deposit_sum}}Обеспечительный платёж в размере {{deposit_sum}} руб. возвращается при возврате ТС в исправном состоянии.{{/deposit_sum}}{{^deposit_sum}}Обеспечительный платёж не взимается.{{/deposit_sum}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности субарендатора</div>
  <p class="mb-4 text-justify">
    4.1. Субарендатор обязан поддерживать надлежащее состояние ТС, включая текущий и капитальный ремонт, и нести расходы на содержание, страхование и эксплуатацию (ст. 644–646 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.2. Ответственность за вред, причинённый третьим лицам ТС, несёт Субарендатор (ст. 648 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4.3. При прекращении основного договора аренды прекращается и настоящий договор субаренды.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Возврат транспортного средства</div>
  <p class="mb-4 text-justify">
    5.1. По окончании срока субаренды Субарендатор обязан возвратить ТС по акту приёма-передачи в том состоянии, в котором его получил, с учётом нормального износа (ст. 622 ГК РФ).
  </p>` +
      commonClauses() +
      rentSign("Субарендодатель", "Субарендатор"),
  },
];