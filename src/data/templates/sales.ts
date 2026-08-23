import type { LegalTemplate } from "../types";
import {
  sideFields,
  sideBlock,
  saleIntro,
  commonClauses,
  saleSign,
  pageShell,
} from "./parts";

export const TEMPLATES_SALES: LegalTemplate[] = [
  {
    id: "dkp-parking",
    name: "Договор купли-продажи машино-места",
    category: "realty",
    actSource: "ст. 549–558 ГК РФ, 218-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Продажа машино-места в паркинге: физлица, ИП или организации. Переход права собственности регистрируется в Росреестре (машино-место — самостоятельный объект недвижимости).",
    suggestedDocs: ["raspiska-money", "dkp-property-general"],
    printInstruction:
      "Печатать в 3-х экземплярах (продавец, покупатель, Росреестр). Если машино-место зарегистрировано как доля в праве общей собственности — сделка подлежит нотариальному удостоверению.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "parking_building", label: "Здание паркинга (адрес)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "parking_spot", label: "Номер машино-места", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "parking_floor", label: "Этаж/уровень", type: "text", defaultValue: "", category: "object" },
      { id: "parking_area", label: "Площадь (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "parking_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "parking_encumbrances", label: "Обременения (ипотека, аренда и т.д.)", type: "text", defaultValue: "отсутствуют", category: "object" },
      { id: "parking_owned", label: "Машино-место: самостоятельный объект (радио)", type: "radio", defaultValue: "yes", category: "object",
        options: [
          { label: "Самостоятельный объект недвижимости", value: "yes" },
          { label: "Доля в праве общей собственности", value: "share" },
        ] },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "наличными", category: "contract",
        options: [
          { label: "Наличными при подписании", value: "наличными" },
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Рассрочка", value: "рассрочка" },
        ] },
      { id: "transfer_date", label: "Дата передачи по акту", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор купли-продажи машино-места") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателю, а Покупатель принимает и оплачивает машино-место № <strong>{{parking_spot}}</strong>
    {{#parking_floor}}на этаже/уровне <strong>{{parking_floor}}</strong> {{/parking_floor}}площадью <strong>{{parking_area}}</strong> кв.м,
    расположенное по адресу: <strong>{{parking_building}}</strong>, кадастровый номер: <strong>{{parking_cadastral}}</strong> (далее — «Машино-место»).
  </p>
  <p class="mb-4 text-justify">
    1.2. {{#parking_owned_is_yes}}Машино-место является самостоятельным объектом недвижимости, право собственности Продавца зарегистрировано в ЕГРН.{{/parking_owned_is_yes}}
    {{#parking_owned_is_share}}Машино-место принадлежит Продавцу на праве общей долевой собственности на здание (сооружение) паркинга; настоящий договор подлежит нотариальному удостоверению (ч. 1.1 ст. 42 Федерального закона № 218-ФЗ).{{/parking_owned_is_share}}
  </p>
  <p class="mb-4 text-justify">1.3. Обременения и ограничения: {{parking_encumbrances}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость Машино-места составляет <strong>{{contract_price}} ({{contract_price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">2.2. Оплата производится: {{payment_method}}.</p>
  <p class="mb-4 text-justify">
    2.3. Переход права собственности подлежит государственной регистрации в Росреестре. Расходы по регистрации несёт Покупатель, если иное не согласовано сторонами.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача машино-места</div>
  <p class="mb-4 text-justify">
    3.1. Передача Машино-места осуществляется по акту приёма-передачи {{#transfer_date}}не позднее «{{transfer_date}}»{{/transfer_date}}.
    Право собственности у Покупателя возникает с момента государственной регистрации в ЕГРН.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}
  <div class="font-bold mb-2 mt-6 text-black text-xs uppercase">5. Прочие условия</div>
  <p class="mb-4 text-justify">
    5.1. Продавец гарантирует, что до заключения настоящего договора Машино-место никому не продано, не заложено, в споре и под арестом (запрещением) не состоит.
  </p>
  <p class="mb-4 text-justify">
    5.2. Настоящий договор заключён в простой письменной форме и составлен в трёх экземплярах, имеющих равную юридическую силу, по одному для каждой из сторон и для органа регистрации.
  </p>`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "dkp-share-flat",
    name: "Договор купли-продажи доли в квартире",
    category: "realty",
    actSource: "ст. 246, 250 ГК РФ, ч. 1.1 ст. 42 218-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Продажа доли в праве общей собственности на квартиру. Сделка подлежит обязательному нотариальному удостоверению; учитывается преимущественное право покупки других сособственников (ст. 250 ГК РФ).",
    suggestedDocs: ["spouse-consent-sell", "raspiska-money"],
    printInstruction:
      "Договор доли оформляется ТОЛЬКО у нотариуса (ч. 1.1 ст. 42 218-ФЗ). Перед продажей постороннему лицу необходимо письменно известить остальных сособственников и выждать 1 месяц (ст. 250 ГК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "flat_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "flat_area", label: "Общая площадь квартиры (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "share_size", label: "Размер продаваемой доли (например, 1/2)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "coowners_refusal", label: "Отказ сособственников от покупки", type: "textarea", defaultValue: "остальные сособственники в установленном порядке извещены о продаже доли и от реализации преимущественного права покупки отказались", category: "contract" },
      { id: "contract_price", label: "Стоимость доли (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "наличными", category: "contract",
        options: [
          { label: "Наличными при подписании", value: "наличными" },
          { label: "Банковский перевод", value: "банковский перевод" },
        ] },
      { id: "transfer_date", label: "Дата передачи по акту", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор купли-продажи доли в квартире") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателю, а Покупатель принимает и оплачивает долю в размере <strong>{{share_size}}</strong>
    в праве общей собственности на квартиру по адресу: <strong>{{flat_address}}</strong>, кадастровый номер: <strong>{{flat_cadastral}}</strong>,
    общей площадью {{flat_area}} кв.м (далее — «Доля»).
  </p>
  <p class="mb-4 text-justify">
    1.2. Доля продаётся с соблюдением преимущественного права покупки (ст. 250 ГК РФ): {{coowners_refusal}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Нотариальное удостоверение</div>
  <p class="mb-4 text-justify">
    2.1. Настоящий договор подлежит обязательному нотариальному удостоверению в силу ч. 1.1 ст. 42 Федерального закона от 13.07.2015 № 218-ФЗ
    «О государственной регистрации недвижимости». Государственная регистрация перехода права собственности производится на основании нотариально удостоверенного договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    3.1. Стоимость Доли составляет <strong>{{contract_price}} ({{contract_price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">3.2. Оплата производится: {{payment_method}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Передача доли</div>
  <p class="mb-4 text-justify">
    4.1. Доля передаётся по акту приёма-передачи {{#transfer_date}}не позднее «{{transfer_date}}»{{/transfer_date}}.
    Право собственности у Покупателя возникает с момента государственной регистрации в ЕГРН.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "dkp-building",
    name: "Договор купли-продажи здания (нежилого)",
    category: "realty",
    actSource: "ст. 549–558 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Продажа нежилого здания (офисного, производственного, складского) вместе с земельным участком (ст. 552 ГК РФ). Регистрация перехода права в Росреестре.",
    suggestedDocs: ["raspiska-money", "dkp-property-general", "act-services"],
    printInstruction:
      "Печатать в 3-х экземплярах (продавец, покупатель, Росреестр). Право на земельный участок переходит к покупателю вместе со зданием (ст. 552 ГК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "building_address", label: "Адрес здания", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "building_area", label: "Площадь здания (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "building_cadastral", label: "Кадастровый номер здания", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_cadastral", label: "Кадастровый номер земельного участка", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_area", label: "Площадь земельного участка (кв.м)", type: "number", defaultValue: "", category: "object" },
      { id: "land_right", label: "Право на земельный участок", type: "select", defaultValue: "собственность", category: "object",
        options: [
          { label: "Собственность", value: "собственность" },
          { label: "Аренда (с согласия арендодателя)", value: "аренда" },
        ] },
      { id: "building_encumbrances", label: "Обременения (аренда, ипотека и т.д.)", type: "text", defaultValue: "отсутствуют", category: "object" },
      { id: "contract_price", label: "Стоимость здания (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "банковский перевод", category: "contract",
        options: [
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Наличными при подписании", value: "наличными" },
          { label: "Рассрочка", value: "рассрочка" },
        ] },
      { id: "transfer_date", label: "Дата передачи по акту", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор купли-продажи нежилого здания") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателю, а Покупатель принимает и оплачивает нежилое здание по адресу: <strong>{{building_address}}</strong>,
    площадью <strong>{{building_area}}</strong> кв.м, кадастровый номер: <strong>{{building_cadastral}}</strong> (далее — «Здание»).
  </p>
  <p class="mb-4 text-justify">
    1.2. Одновременно с передачей права собственности на Здание Покупателю переходит право на земельный участок,
    занятый Зданием и необходимый для его использования (ст. 552 ГК РФ): кадастровый номер <strong>{{land_cadastral}}</strong>
    {{#land_area}}площадью {{land_area}} кв.м {{/land_area}}на праве {{land_right}}.
  </p>
  <p class="mb-4 text-justify">1.3. Обременения и ограничения: {{building_encumbrances}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость Здания составляет <strong>{{contract_price}} ({{contract_price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">2.2. Оплата производится: {{payment_method}}.</p>
  <p class="mb-4 text-justify">
    2.3. Переход права собственности подлежит государственной регистрации в Росреестре.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача здания</div>
  <p class="mb-4 text-justify">
    3.1. Передача Здания осуществляется по передаточному акту {{#transfer_date}}не позднее «{{transfer_date}}»{{/transfer_date}}.
    Право собственности у Покупателя возникает с момента государственной регистрации в ЕГРН.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}
  <div class="font-bold mb-2 mt-6 text-black text-xs uppercase">5. Прочие условия</div>
  <p class="mb-4 text-justify">
    5.1. Продавец гарантирует, что до заключения настоящего договора Здание никому не продано, не заложено, в споре и под арестом (запрещением) не состоит.
  </p>
  <p class="mb-4 text-justify">
    5.2. Настоящий договор составлен в трёх экземплярах, имеющих равную юридическую силу, по одному для каждой из сторон и для органа регистрации.
  </p>`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "dkp-property-general",
    name: "Договор купли-продажи недвижимости (общий)",
    category: "realty",
    actSource: "ст. 549–558 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Универсальный договор купли-продажи любого объекта недвижимости: комнаты, дачи, гаража, нежилого помещения и др. Регистрация перехода права в Росреестре.",
    suggestedDocs: ["raspiska-money", "spouse-consent-sell"],
    printInstruction:
      "Печатать в 3-х экземплярах (продавец, покупатель, Росреестр). Для жилых помещений с долями и при участии несовершеннолетних требуется нотариус.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "object_type", label: "Вид объекта (комната, дача, гараж и т.д.)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "object_address", label: "Адрес объекта", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "object_area", label: "Площадь (кв.м)", type: "number", defaultValue: "", category: "object" },
      { id: "object_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "object_desc", label: "Иные характеристики", type: "text", defaultValue: "", category: "object" },
      { id: "object_encumbrances", label: "Обременения (аренда, ипотека и т.д.)", type: "text", defaultValue: "отсутствуют", category: "object" },
      { id: "contract_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "наличными", category: "contract",
        options: [
          { label: "Наличными при подписании", value: "наличными" },
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Рассрочка", value: "рассрочка" },
        ] },
      { id: "transfer_date", label: "Дата передачи по акту", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор купли-продажи недвижимости") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец передаёт в собственность Покупателю, а Покупатель принимает и оплачивает следующий объект недвижимости: <strong>{{object_type}}</strong>
    по адресу: <strong>{{object_address}}</strong>{{#object_area}}, площадью <strong>{{object_area}}</strong> кв.м{{/object_area}},
    кадастровый номер: <strong>{{object_cadastral}}</strong>.
  </p>
  {{#object_desc}}<p class="mb-4 text-justify">1.2. Иные характеристики объекта: {{object_desc}}.</p>{{/object_desc}}
  <p class="mb-4 text-justify">1.3. Обременения и ограничения: {{object_encumbrances}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость объекта составляет <strong>{{contract_price}} ({{contract_price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">2.2. Оплата производится: {{payment_method}}.</p>
  <p class="mb-4 text-justify">
    2.3. Переход права собственности подлежит государственной регистрации в Росреестре.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача объекта</div>
  <p class="mb-4 text-justify">
    3.1. Передача объекта осуществляется по передаточному акту {{#transfer_date}}не позднее «{{transfer_date}}»{{/transfer_date}}.
    Право собственности у Покупателя возникает с момента государственной регистрации в ЕГРН.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}
  <div class="font-bold mb-2 mt-6 text-black text-xs uppercase">5. Прочие условия</div>
  <p class="mb-4 text-justify">
    5.1. Продавец гарантирует, что до заключения настоящего договора объект никому не продан, не заложен, в споре и под арестом (запрещением) не состоит.
  </p>
  <p class="mb-4 text-justify">
    5.2. Настоящий договор составлен в трёх экземплярах, имеющих равную юридическую силу, по одному для каждой из сторон и для органа регистрации.
  </p>`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "prelim-house",
    name: "Предварительный договор купли-продажи дома",
    category: "realty",
    actSource: "ст. 429, 549–558 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Предварительный договор о заключении в будущем основного договора купли-продажи жилого дома с земельным участком. Задаток, срок и условия основного договора.",
    suggestedDocs: ["dkp-house", "raspiska-money"],
    printInstruction:
      "Предварительный договор обязывает стороны заключить основной договор на условиях, предусмотренных предварительным (ст. 429 ГК РФ). Укажите все существенные условия заранее.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "house_address", label: "Адрес дома", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "house_area", label: "Площадь дома (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "house_cadastral", label: "Кадастровый номер дома", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_cadastral", label: "Кадастровый номер земельного участка", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_area", label: "Площадь земельного участка (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "main_price", label: "Цена основного договора (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "deposit_amount", label: "Сумма задатка (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "main_term", label: "Срок заключения основного договора (до даты)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "refund_deposit", label: "Возврат задатка при отказе Продавца", type: "checkbox", defaultValue: "", category: "contract",
        options: [
          { label: "Задаток возвращается Покупателю в двойном размере", value: "yes" },
        ] },
    ],
    previewTemplate:
      pageShell("Предварительный договор купли-продажи дома") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Стороны обязуются заключить в будущем основной договор купли-продажи, по которому Продавец обязуется передать в собственность Покупателя,
    а Покупатель — принять и оплатить жилой дом по адресу: <strong>{{house_address}}</strong>, площадью <strong>{{house_area}}</strong> кв.м,
    кадастровый номер: <strong>{{house_cadastral}}</strong>, вместе с земельным участком кадастровый номер: <strong>{{land_cadastral}}</strong>,
    площадью <strong>{{land_area}}</strong> кв.м (далее — «Объект»).
  </p>
  <p class="mb-4 text-justify">
    1.2. Существенные условия основного договора согласованы сторонами: предмет — Объект, цена — <strong>{{main_price}} ({{main_price_words}})</strong> рублей.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок заключения основного договора</div>
  <p class="mb-4 text-justify">
    2.1. Основной договор должен быть заключён не позднее «{{main_term}}».
    Если в указанный срок основной договор не заключён по вине одной из сторон, применяются последствия, предусмотренные ст. 429 ГК РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Задаток</div>
  <p class="mb-4 text-justify">
    3.1. В обеспечение исполнения обязательств Покупатель передаёт Продавцу задаток в размере <strong>{{deposit_amount}} ({{deposit_amount_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3.2. Сумма задатка засчитывается в счёт оплаты по основному договору (ст. 380 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3.3. Если за неисполнение договора ответственен Продавец, он обязан вернуть Покупателю задаток в двойном размере (ст. 381 ГК РФ).
    {{#refund_deposit_is_yes}}Стороны подтверждают, что указанное правило действует в настоящем договоре.{{/refund_deposit_is_yes}}
  </p>
  <p class="mb-4 text-justify">
    3.4. Если за неисполнение договора ответственен Покупатель, задаток остаётся у Продавца.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "prelim-land",
    name: "Предварительный договор купли-продажи земли",
    category: "realty",
    actSource: "ст. 429 ГК РФ, ст. 37 ЗК РФ",
    lastUpdated: "Август 2026",
    description:
      "Предварительный договор о заключении основного договора купли-продажи земельного участка. Задаток, срок и условия основного договора.",
    suggestedDocs: ["dkp-land", "raspiska-money"],
    printInstruction:
      "Предварительный договор обязывает стороны заключить основной договор на условиях, предусмотренных предварительным (ст. 429 ГК РФ).",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "land_address", label: "Местоположение участка", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_area", label: "Площадь (кв.м)", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_category", label: "Категория земель", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "land_use", label: "Вид разрешённого использования", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "main_price", label: "Цена основного договора (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "deposit_amount", label: "Сумма задатка (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "main_term", label: "Срок заключения основного договора (до даты)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
    ],
    previewTemplate:
      pageShell("Предварительный договор купли-продажи земельного участка") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Стороны обязуются заключить в будущем основной договор купли-продажи земельного участка с кадастровым номером: <strong>{{land_cadastral}}</strong>,
    площадью <strong>{{land_area}}</strong> кв.м, категория земель: {{land_category}}, вид разрешённого использования: {{land_use}},
    местоположение: <strong>{{land_address}}</strong> (далее — «Участок»).
  </p>
  <p class="mb-4 text-justify">
    1.2. Существенные условия основного договора: предмет — Участок, цена — <strong>{{main_price}} ({{main_price_words}})</strong> рублей.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок заключения основного договора</div>
  <p class="mb-4 text-justify">
    2.1. Основной договор должен быть заключён не позднее «{{main_term}}».
    Если в указанный срок основной договор не заключён по вине одной из сторон, применяются последствия, предусмотренные ст. 429 ГК РФ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Задаток</div>
  <p class="mb-4 text-justify">
    3.1. В обеспечение исполнения обязательств Покупатель передаёт Продавцу задаток в размере <strong>{{deposit_amount}} ({{deposit_amount_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    3.2. Сумма задатка засчитывается в счёт оплаты по основному договору (ст. 380 ГК РФ). Если за неисполнение договора ответственен Продавец,
    он возвращает задаток в двойном размере; если ответственен Покупатель — задаток остаётся у Продавца (ст. 381 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "dkp-equipment",
    name: "Договор купли-продажи оборудования",
    category: "business",
    actSource: "ст. 454–491, 506 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Продажа оборудования (в том числе бывшего в употреблении): характеристика, состояние, комплектность, порядок передачи, монтаж и гарантии.",
    suggestedDocs: ["equipment-supply", "act-services", "invoice"],
    printInstruction:
      "Печатать в 2-х экземплярах. Для оборудования, бывшего в употреблении, подробно опишите состояние и комплектность — это ограничит споры о качестве.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "equipment_name", label: "Наименование оборудования", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "equipment_model", label: "Модель, марка", type: "text", defaultValue: "", category: "object" },
      { id: "equipment_sn", label: "Заводской/серийный номер", type: "text", defaultValue: "", category: "object" },
      { id: "equipment_year", label: "Год выпуска", type: "number", defaultValue: "", category: "object" },
      { id: "equipment_condition", label: "Состояние (новое, б/у, рабочее)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "equipment_completeness", label: "Комплектность", type: "text", defaultValue: "в соответствии с документацией производителя", category: "object" },
      { id: "equipment_location", label: "Место нахождения оборудования", type: "text", defaultValue: "", category: "object" },
      { id: "warranty", label: "Гарантия", type: "select", defaultValue: "manufacturer", category: "contract",
        options: [
          { label: "Гарантия производителя", value: "manufacturer" },
          { label: "Гарантия продавца (указать срок)", value: "seller" },
          { label: "Без гарантии", value: "none" },
        ] },
      { id: "warranty_months", label: "Срок гарантии (мес.)", type: "number", defaultValue: "", category: "contract",
        dependsOn: [{ fieldId: "warranty", value: "seller" }] },
      { id: "contract_price", label: "Цена оборудования (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "delivery_include", label: "Доставка включена в цену", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Да, доставка за счёт Продавца", value: "yes" },
          { label: "Нет, доставка за счёт Покупателя", value: "no" },
        ] },
      { id: "delivery_days", label: "Срок поставки/передачи (дней)", type: "number", defaultValue: "5", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор купли-продажи оборудования") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец обязуется передать в собственность Покупателя, а Покупатель — принять и оплатить оборудование:
    <strong>{{equipment_name}}</strong>{{#equipment_model}} модель <strong>{{equipment_model}}</strong>{{/equipment_model}}
    {{#equipment_sn}}, заводской (серийный) номер <strong>{{equipment_sn}}</strong>{{/equipment_sn}}
    {{#equipment_year}}, год выпуска <strong>{{equipment_year}}</strong>{{/equipment_year}} (далее — «Оборудование»).
  </p>
  <p class="mb-4 text-justify">1.2. Состояние Оборудования: {{equipment_condition}}. Комплектность: {{equipment_completeness}}.</p>
  {{#equipment_location}}<p class="mb-4 text-justify">1.3. Место нахождения Оборудования: {{equipment_location}}.</p>{{/equipment_location}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    2.1. Цена Оборудования составляет <strong>{{contract_price}} ({{contract_price_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{#delivery_include_is_yes}}Доставка включена в цену и осуществляется за счёт Продавца.{{/delivery_include_is_yes}}
    {{#delivery_include_is_no}}Доставка не входит в цену и осуществляется за счёт Покупателя.{{/delivery_include_is_no}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача оборудования</div>
  <p class="mb-4 text-justify">
    3.1. Оборудование передаётся в течение <strong>{{delivery_days}}</strong> рабочих дней с момента полной оплаты.
    Обязанность Продавца по передаче считается исполненной с момента подписания акта приёма-передачи.
  </p>
  <p class="mb-4 text-justify">
    3.2. Риск случайной гибели или повреждения Оборудования переходит на Покупателя с момента передачи.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии</div>
  <p class="mb-4 text-justify">
    4.1. Гарантия: {{warranty_label}}{{#warranty_months}} сроком {{warranty_months}} месяцев{{/warranty_months}}.
    {{#warranty_is_none}}Оборудование продаётся «как есть», без гарантийных обязательств Продавца.{{/warranty_is_none}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}`
      + commonClauses() +
      saleSign(),
  },
  {
    id: "international-sale",
    name: "Договор международной купли-продажи",
    category: "business",
    actSource: "Венская конвенция 1980, Инкотермс 2020",
    lastUpdated: "Август 2026",
    description:
      "Внешнеторговый контракт купли-продажи товаров: базис поставки Инкотермс 2020, валюта, переход рисков, применимое право, арбитраж.",
    suggestedDocs: ["invoice", "commission-contract"],
    printInstruction:
      "Печатать в 2-х экземплярах. Укажите базис поставки Инкотермс 2020 — он определяет переход рисков и распределение расходов. Рекомендуется привлекать юриста по ВЭД.",
    fields: [
      { id: "city", label: "Город заключения", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("seller", "Продавец", "seller"),
      ...sideFields("buyer", "Покупатель", "buyer"),
      { id: "goods_name", label: "Наименование товара", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "goods_qty", label: "Количество", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "goods_price", label: "Цена за единицу", type: "number", defaultValue: "", category: "object", validation: { required: true } },
      { id: "currency", label: "Валюта контракта", type: "text", defaultValue: "USD", category: "contract", validation: { required: true } },
      { id: "incoterms", label: "Базис поставки (Инкотермс 2020)", type: "select", defaultValue: "DAP", category: "contract",
        options: [
          { label: "EXW — франко завод", value: "EXW" },
          { label: "FOB — свободно на борту", value: "FOB" },
          { label: "CFR — стоимость и фрахт", value: "CFR" },
          { label: "CIF — стоимость, страхование и фрахт", value: "CIF" },
          { label: "DAP — поставка в поименованном месте", value: "DAP" },
          { label: "DDP — поставка с оплатой пошлин", value: "DDP" },
        ] },
      { id: "destination", label: "Пункт назначения (место поставки)", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "delivery_days", label: "Срок поставки (дней с момента оплаты)", type: "number", defaultValue: "30", category: "contract" },
      { id: "payment_method", label: "Форма расчётов", type: "select", defaultValue: "банковский перевод", category: "contract",
        options: [
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Аккредитив", value: "аккредитив" },
          { label: "Предоплата 100%", value: "предоплата" },
        ] },
      { id: "packing", label: "Упаковка и маркировка", type: "text", defaultValue: "экспортная упаковка, соответствующая международным требованиям", category: "contract" },
      { id: "governing_law", label: "Применимое право", type: "select", defaultValue: "Российская Федерация", category: "contract",
        options: [
          { label: "Российская Федерация", value: "Российская Федерация" },
          { label: "Право страны Покупателя", value: "право страны Покупателя" },
        ] },
      { id: "arbitration", label: "Разрешение споров", type: "select", defaultValue: "МКАС при ТПП РФ", category: "contract",
        options: [
          { label: "МКАС при ТПП РФ (Москва)", value: "МКАС при ТПП РФ" },
          { label: "Государственный суд по месту нахождения Ответчика", value: "государственный суд" },
        ] },
    ],
    previewTemplate:
      pageShell("Договор международной купли-продажи товаров") +
      saleIntro() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец обязуется передать в собственность Покупателя товар: <strong>{{goods_name}}</strong> в количестве <strong>{{goods_qty}}</strong>
    по цене <strong>{{goods_price}} {{currency}}</strong> за единицу (далее — «Товар»).
  </p>
  <p class="mb-4 text-justify">1.2. Общая стоимость Товара определяется как произведение цены за единицу на количество.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия поставки</div>
  <p class="mb-4 text-justify">
    2.1. Поставка осуществляется на базисе <strong>{{incoterms}}</strong> (Инкотермс 2020), место поставки: <strong>{{destination}}</strong>.
    Базис поставки определяет момент перехода рисков и распределение расходов между сторонами.
  </p>
  <p class="mb-4 text-justify">
    2.2. Срок поставки: <strong>{{delivery_days}}</strong> дней с момента поступления оплаты на счёт Продавца, если иное не согласовано сторонами.
  </p>
  <p class="mb-4 text-justify">2.3. Упаковка и маркировка: {{packing}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">
    3.1. Валюта контракта: {{currency}}. Оплата производится в форме: {{payment_method}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Таможенное оформление экспорта (импорта) осуществляется стороной, определяемой базисом поставки Инкотермс 2020.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Применимое право и разрешение споров</div>
  <p class="mb-4 text-justify">
    4.1. Поскольку стороны находятся в государствах — участниках Конвенции ООН о договорах международной купли-продажи товаров (Вена, 1980),
    к настоящему договору применяются положения Конвенции. В части, не урегулированной Конвенцией, применяется право: {{governing_law}}.
  </p>
  <p class="mb-4 text-justify">
    4.2. Споры разрешаются в порядке: {{arbitration}}. Досудебный (претензионный) порядок обязателен, срок рассмотрения претензии — 30 календарных дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Стороны договора</div>
  <p class="mb-2">Продавец:</p>
  ${sideBlock("seller", "Продавец")}
  <p class="mb-2 mt-4">Покупатель:</p>
  ${sideBlock("buyer", "Покупатель")}`
      + commonClauses(30) +
      saleSign(),
  },
  {
    id: "gift-money",
    name: "Договор дарения денежных средств",
    category: "family",
    actSource: "ст. 572, 574 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Дарение денег между родственниками или иными лицами. Между близкими родственниками дарение не облагается НДФЛ (п. 18.1 ст. 217 НК РФ).",
    suggestedDocs: ["gift-agreement", "raspiska-money"],
    printInstruction:
      "Письменная форма обязательна, если дарителем выступает юридическое лицо и стоимость дара превышает 3 000 руб. (п. 2 ст. 574 ГК РФ). При дарении не близкому родственнику у одаряемого возникает НДФЛ 13%.",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...sideFields("donor", "Даритель", "donor"),
      ...sideFields("donee", "Одаряемый", "donee"),
      { id: "gift_sum", label: "Сумма дара (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "transfer_method", label: "Способ передачи", type: "select", defaultValue: "наличными", category: "payment",
        options: [
          { label: "Наличными при подписании", value: "наличными" },
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Перевод на карту", value: "перевод на карту" },
        ] },
      { id: "relation", label: "Отношения сторон", type: "radio", defaultValue: "relative", category: "family",
        options: [
          { label: "Близкие родственники", value: "relative" },
          { label: "Не родственники", value: "stranger" },
        ] },
      { id: "purpose", label: "Назначение дара (необязательно)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор дарения денежных средств") +
      `
  <p class="mb-4 text-justify">
    {{#donor_status_is_person}}Гражданин(-ка) РФ <strong>{{donor_name}}</strong>{{/donor_status_is_person}}
    {{#donor_status_is_ip}}Индивидуальный предприниматель <strong>{{donor_name}}</strong>{{/donor_status_is_ip}}
    {{#donor_status_is_legal}}<strong>{{donor_name}}</strong>{{/donor_status_is_legal}}
    {{#donor_status_is_legal}}{{#donor_rep}}в лице {{donor_rep}}, действующего на основании {{donor_basis}},{{/donor_rep}}{{/donor_status_is_legal}}
    {{#donor_inn}}ИНН {{donor_inn}},{{/donor_inn}} именуемый(ая) в дальнейшем «Даритель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    {{#donee_status_is_person}}гражданин(-ка) РФ <strong>{{donee_name}}</strong>{{/donee_status_is_person}}
    {{#donee_status_is_ip}}индивидуальный предприниматель <strong>{{donee_name}}</strong>{{/donee_status_is_ip}}
    {{#donee_status_is_legal}}<strong>{{donee_name}}</strong>{{/donee_status_is_legal}}
    {{#donee_status_is_legal}}{{#donee_rep}}в лице {{donee_rep}}, действующего на основании {{donee_basis}},{{/donee_rep}}{{/donee_status_is_legal}}
    {{#donee_inn}}ИНН {{donee_inn}},{{/donee_inn}} именуемый(ая) в дальнейшем «Одаряемый», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Даритель безвозмездно передаёт Одаряемому денежные средства в размере <strong>{{gift_sum}} ({{gift_sum_words}})</strong> рублей.
  </p>
  <p class="mb-4 text-justify">
    1.2. Передача денежных средств осуществляется: {{transfer_method}}. Факт передачи подтверждается распиской либо иным письменным документом.
  </p>
  {{#purpose}}<p class="mb-4 text-justify">1.3. Назначение дара: {{purpose}}.</p>{{/purpose}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    2.1. Одаряемый вправе в любое время до передачи ему дара отказаться от него (ст. 573 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Даритель вправе отменить дарение в случаях, предусмотренных ст. 578 ГК РФ (умышленное причинение вреда, недостойное поведение и др.).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Налоговые последствия</div>
  <p class="mb-4 text-justify">
    {{#relation_is_relative}}3.1. Стороны являются близкими родственниками; доход в виде дара освобождается от налогообложения НДФЛ (п. 18.1 ст. 217 НК РФ).{{/relation_is_relative}}
    {{#relation_is_stranger}}3.1. Стороны не являются близкими родственниками; Одаряемому необходимо самостоятельно исчислить и уплатить НДФЛ 13% с суммы дара (п. 18.1 ст. 217 НК РФ).{{/relation_is_stranger}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стороны договора</div>
  <p class="mb-2">Даритель:</p>
  ${sideBlock("donor", "Даритель")}
  <p class="mb-2 mt-4">Одаряемый:</p>
  ${sideBlock("donee", "Одаряемый")}`
      + commonClauses() +
      `
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1 uppercase text-black">Даритель:</div>
      {{#donor_status_is_person}}<p class="mb-1"><strong>{{donor_name}}</strong></p>{{/donor_status_is_person}}
      {{#donor_status_is_ip}}<p class="mb-1"><strong>ИП {{donor_name}}</strong></p>{{/donor_status_is_ip}}
      {{#donor_status_is_legal}}<p class="mb-1"><strong>{{donor_name}}</strong></p>{{/donor_status_is_legal}}
      {{#donor_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{donor_inn}}</p>{{/donor_inn}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-1 uppercase text-black">Одаряемый:</div>
      {{#donee_status_is_person}}<p class="mb-1"><strong>{{donee_name}}</strong></p>{{/donee_status_is_person}}
      {{#donee_status_is_ip}}<p class="mb-1"><strong>ИП {{donee_name}}</strong></p>{{/donee_status_is_ip}}
      {{#donee_status_is_legal}}<p class="mb-1"><strong>{{donee_name}}</strong></p>{{/donee_status_is_legal}}
      {{#donee_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{donee_inn}}</p>{{/donee_inn}}
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
];