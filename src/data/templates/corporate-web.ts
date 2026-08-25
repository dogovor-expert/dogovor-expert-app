import type { LegalTemplate, TemplateField } from "../types";
import {
  sideFields,
  pairSign,
  commonClauses,
  pageShell,
} from "./parts";

function partyFields(prefix: string, label: string, cat: TemplateField["category"]): TemplateField[] {
  return sideFields(prefix, label, cat);
}

function itemsRepeating(
  nameLabel: string,
  unitLabel = "—",
  priceLabel = "Стоимость, руб."
): TemplateField {
  return {
    id: "items",
    label: "Позиции (нажмите «Добавить»)",
    type: "repeating",
    defaultValue: "",
    category: "items",
    repeatingFields: [
      { id: "name", label: nameLabel, type: "text", defaultValue: "", width: "55%" },
      { id: "unit", label: unitLabel, type: "text", defaultValue: "шт", width: "10%" },
      { id: "qty", label: "Кол-во", type: "number", defaultValue: "1", width: "10%" },
      { id: "price", label: priceLabel, type: "number", defaultValue: "0", width: "12%" },
      { id: "sum", label: "Сумма, руб.", type: "number", defaultValue: "0", width: "13%" },
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

function signPairLeft(side1: string, label1: string, side2: string, label2: string): string {
  return `
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4 mt-10">
    <div>
      <p class="font-bold mb-1">{{${side1}_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">${label1}</p>
    </div>
    <div class="text-right">
      <p class="font-bold mb-1">{{${side2}_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">${label2}</p>
    </div>
  </div>`;
}

function operatorSign(): string {
  return `
  <div class="border-t border-zinc-300 pt-4 mt-10 text-xs">
    <p class="font-bold mb-1">Оператор:</p>
    <p class="mb-1">{{company}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>`;
}

function foundersSign(): string {
  return `
  <div class="border-t border-zinc-300 pt-4 mt-10 text-xs">
    <p class="font-bold mb-3">Подписи учредителей:</p>
    {{#items}}
    <div class="flex justify-between items-end mb-4">
      <div>
        <p class="font-bold mb-1">{{name}}</p>
        <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
        <p class="text-zinc-400 text-[10px]">подпись</p>
      </div>
      <div class="text-right text-zinc-500">{{unit}} · доля {{qty}}% · {{price}} руб.</div>
    </div>
    {{/items}}
  </div>`;
}

export const TEMPLATES_CORPORATE_WEB: LegalTemplate[] = [
  {
    id: "nda-employee",
    name: "Соглашение о неразглашении (NDA) с сотрудником",
    category: "business",
    actSource: "ст. 1465–1470 ГК РФ; ФЗ от 29.07.2004 № 98-ФЗ (ред. от 08.08.2024); ч. 4 ст. 57 ТК РФ",
    lastUpdated: "Август 2026",
    description:
      "Защита коммерческой тайны и конфиденциальной информации работодателя: перечень сведений, обязанности сотрудника, срок действия (в т.ч. 3 года после увольнения) и ответственность.",
    suggestedDocs: ["agreement-confidentiality", "employment-contract", "gpa-contract"],
    printInstruction:
      "Перед подписанием сотрудник должен быть ознакомлен под расписку с перечнем сведений, составляющих коммерческую тайну (п. 1 ст. 11 ФЗ № 98-ФЗ). Носители информации маркируются грифом «Коммерческая тайна» (ст. 10 ФЗ № 98-ФЗ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("party1", "Работодатель", "employer"),
      { id: "party2_name", label: "Сотрудник (ФИО)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "party2_passport", label: "Паспорт сотрудника (серия, номер)", type: "text", defaultValue: "", category: "employee" },
      { id: "party2_address", label: "Адрес сотрудника", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность сотрудника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "secret_list", label: "Перечень конфиденциальных сведений", type: "textarea", defaultValue: "клиентская база, коммерческие условия, цены, данные о доходах, технология производства, персональные данные работников", category: "contract", rows: 3, validation: { required: true } },
      { id: "nda_years", label: "Срок неразглашения после увольнения (лет)", type: "number", defaultValue: "3", category: "contract" },
      { id: "penalty", label: "Неустойка за разглашение (руб.)", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate:
      pageShell("Соглашение о неразглашении (NDA)") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Работодатель», и {{party2_name}}, именуемый(ая) в дальнейшем «Работник»,
    заключили настоящее соглашение о неразглашении конфиденциальной информации и коммерческой тайны (ст. 1465–1470 ГК РФ, ФЗ от 29.07.2004 № 98-ФЗ) о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет</div>
  <p class="mb-4 text-justify">
    1.1. Работник, исполняющий трудовые обязанности по должности {{position}}, получает доступ к информации, составляющей коммерческую тайну Работодателя и его контрагентов, а также к иной конфиденциальной информации.
  </p>
  <p class="mb-4 text-justify">
    1.2. К конфиденциальной информации относятся сведения, имеющие действительную или потенциальную коммерческую ценность в силу неизвестности третьим лицам (ст. 1465 ГК РФ), в том числе: {{secret_list}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности работника</div>
  <p class="mb-4 text-justify">
    2.1. Работник обязуется: не разглашать конфиденциальную информацию без согласия Работодателя; не использовать её в личных целях; выполнять установленный режим коммерческой тайны; при прекращении трудового договора передать материальные носители информации Работодателю (п. 3 ст. 11 ФЗ № 98-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    2.2. Обязательство неразглашения действует в течение всего срока действия режима коммерческой тайны, в том числе в течение {{nda_years}} лет после прекращения трудового договора (п. 2 ч. 3 ст. 11 ФЗ № 98-ФЗ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">
    3.1. За разглашение конфиденциальной информации работник несёт дисциплинарную, материальную, административную (ст. 13.14 КоАП РФ) и уголовную (ст. 183 УК РФ) ответственность.
  </p>
  {{#penalty}}<p class="mb-4 text-justify">3.2. При виновном разглашении работник уплачивает неустойку в размере {{penalty}} ({{penalty_words}}) рублей, а также возмещает причинённые убытки (п. 3 ч. 3 ст. 11 ФЗ № 98-ФЗ).</p>{{/penalty}}
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Заключительные положения</div>
  <p class="mb-4 text-justify">
    4.1. Настоящее соглашение является приложением к трудовому договору (ч. 4 ст. 57 ТК РФ) и составлено в двух экземплярах, имеющих равную юридическую силу.
  </p>
  <p class="mb-6 text-justify">
    4.2. Во всём, что не предусмотрено соглашением, стороны руководствуются законодательством Российской Федерации.
  </p>
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4 mt-10">
    <div>
      <p class="font-bold mb-1">Работодатель: {{party1_name}}</p>
      {{#party1_status_is_legal}}{{#party1_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{party1_inn}}</p>{{/party1_inn}}{{/party1_status_is_legal}}
      {{#party1_status_is_ip}}{{#party1_inn}}<p class="text-zinc-500 text-[11px]">ИНН: {{party1_inn}}</p>{{/party1_inn}}{{/party1_status_is_ip}}
      {{#party1_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{party1_address}}</p>{{/party1_address}}
      <div class="border-b border-zinc-950 w-56 h-5 mb-1 mt-6"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="text-right">
      <p class="font-bold mb-1">Работник: {{party2_name}}</p>
      {{#party2_passport}}<p class="text-zinc-500 text-[11px]">Паспорт: {{party2_passport}}</p>{{/party2_passport}}
      {{#party2_address}}<p class="text-zinc-500 text-[11px]">Адрес: {{party2_address}}</p>{{/party2_address}}
      <div class="border-b border-zinc-950 w-56 h-5 mb-1 mt-6"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "user-agreement",
    name: "Пользовательское соглашение",
    category: "business",
    actSource: "ст. 437, 438, 1286.1 ГК РФ; ФЗ от 27.07.2006 № 152-ФЗ; ст. 18.1 ФЗ от 13.03.2006 № 38-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Публичная оферта для сайта или приложения: порядок акцепта, права и обязанности пользователя и оператора, интеллектуальная собственность, ответственность. Актуально для 2026 года (согласие на ПДн оформляется отдельно).",
    suggestedDocs: ["privacy-policy", "cookie-policy", "personal-data-consent"],
    printInstruction:
      "Согласие на обработку персональных данных с 01.09.2025 оформляется отдельным документом — не объединяйте его с пользовательским соглашением (ст. 9 ФЗ № 152-ФЗ). При регистрации/использовании сайта фиксируйте факт акцепта (ст. 438 ГК РФ).",
    fields: [
      { id: "company", label: "Оператор (компания / ИП)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "director", label: "В лице (руководитель)", type: "text", defaultValue: "", category: "contract" },
      { id: "site_url", label: "Сайт / приложение", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "service_desc", label: "Предмет (что предоставляет сервис)", type: "textarea", defaultValue: "доступ к функциональным возможностям сервиса", category: "contract", rows: 2 },
      { id: "user_types", label: "Кто может пользоваться", type: "text", defaultValue: "дееспособные физические лица и юридические лица, достигшие 18 лет", category: "contract" },
      { id: "reg_required", label: "Регистрация", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Требуется регистрация аккаунта", value: "yes" },
          { label: "Без регистрации", value: "no" },
        ] },
      { id: "license_note", label: "Условия использования контента и ПО", type: "textarea", defaultValue: "пользователю предоставляется простая (неисключительная) лицензия на использование сервиса (ст. 1286.1 ГК РФ)", category: "contract", rows: 2 },
      { id: "ads_yes", label: "На сервисе размещается реклама", type: "radio", defaultValue: "no", category: "contract",
        options: [
          { label: "Да, размещается", value: "yes" },
          { label: "Нет", value: "no" },
        ] },
      { id: "pd_note", label: "Персональные данные", type: "textarea", defaultValue: "обработка персональных данных осуществляется на основании отдельного согласия в соответствии с политикой обработки персональных данных", category: "contract", rows: 2 },
    ],
    previewTemplate:
      pageShell("Пользовательское соглашение") +
      `
  <p class="mb-4 text-justify">
    {{company}}{{#director}}, в лице {{director}},{{/director}} (далее — «Оператор»), публикует настоящее Пользовательское соглашение, определяющее условия использования сервиса {{site_url}} (далее — «Сервис»).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящее соглашение является публичной офертой (п. 2 ст. 437 ГК РФ). Акцептом признаётся совершение пользователем действий по использованию Сервиса: регистрация, вход, просмотр и использование контента — в соответствии с п. 3 ст. 438 ГК РФ.
  </p>
  <p class="mb-4 text-justify">1.2. Предмет: {{service_desc}}.</p>
  <p class="mb-4 text-justify">1.3. Пользователями могут быть {{user_types}}.</p>
  {{#reg_required_is_yes}}<p class="mb-4 text-justify">1.4. Для использования Сервиса требуется регистрация. Пользователь несёт ответственность за сохранность данных своего аккаунта.</p>{{/reg_required_is_yes}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">
    2.1. Пользователь обязуется: не нарушать законодательство РФ; не распространять вредоносное ПО; не нарушать права третьих лиц, включая права на результаты интеллектуальной деятельности.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{license_note}}. Использование контента Сервиса допускается только в личных некоммерческих целях, если иное не установлено отдельными условиями.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Персональные данные</div>
  <p class="mb-4 text-justify">
    3.1. {{pd_note}}. Согласие на обработку персональных данных оформляется отдельно (ст. 9 ФЗ № 152-ФЗ) и может быть отозвано в любой момент.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Реклама</div>
  <p class="mb-4 text-justify">
    {{#ads_yes_is_yes}}4.1. На Сервисе размещается реклама в соответствии с маркировкой «Реклама» и токеном ERID, отчёты передаются через оператора рекламных данных (ст. 18.1 ФЗ № 38-ФЗ).{{/ads_yes_is_yes}}
    {{#ads_yes_is_no}}4.1. Оператор вправе размещать на Сервисе рекламу с соблюдением требований законодательства о рекламе.{{/ads_yes_is_no}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность</div>
  <p class="mb-4 text-justify">
    5.1. Сервис предоставляется «как есть». Оператор не отвечает за убытки, возникшие в результате неправомерных действий пользователей или действий третьих лиц.
  </p>
  <p class="mb-4 text-justify">
    5.2. Оператор вправе изменять условия настоящего соглашения. Изменения вступают в силу с момента публикации; продолжение использования Сервиса означает согласие с новой редакцией.
  </p>
  <p class="mb-6 text-justify">
    5.3. Все споры разрешаются путём переговоров, при недостижении согласия — в судебном порядке по месту нахождения Оператора.
  </p>`
      + operatorSign() +
      `
</div>`,
  },
  {
    id: "cookie-policy",
    name: "Политика обработки cookie",
    category: "business",
    actSource: "ст. 9, 18.1 ФЗ от 27.07.2006 № 152-ФЗ; позиция Роскомнадзора (cookie приравниваются к персональным данным)",
    lastUpdated: "Август 2026",
    description:
      "Политика использования файлов cookie для сайта: категории (функциональные, аналитические, маркетинговые), правовые основания, управление настройками. Штрафы по ст. 13.11 КоАП РФ — до 700 000 руб.",
    suggestedDocs: ["privacy-policy", "user-agreement", "personal-data-consent"],
    printInstruction:
      "Разместите политику cookie в открытом доступе и показывайте баннер при первом посещении с возможностью выбора категорий (принять / отказаться от необязательных). Галочки не должны стоять по умолчанию (ст. 9 ФЗ № 152-ФЗ).",
    fields: [
      { id: "company", label: "Оператор (компания / ИП)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "site_url", label: "Сайт", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "functional_note", label: "Функциональные cookie", type: "text", defaultValue: "необходимы для корректной работы сайта (авторизация, корзина, язык); обработка без согласия (ст. 6 ФЗ № 152-ФЗ)", category: "contract" },
      { id: "analytic_note", label: "Аналитические cookie", type: "text", defaultValue: "Яндекс.Метрика (данные хранятся на серверах в РФ), статистика посещаемости, поведение пользователей", category: "contract" },
      { id: "marketing_note", label: "Маркетинговые cookie", type: "text", defaultValue: "рекламные сети и ретаргетинг; передача данных третьим лицам возможна только с согласия пользователя", category: "contract" },
      { id: "storage_days", label: "Срок хранения cookie (дней)", type: "text", defaultValue: "365", category: "contract" },
      { id: "cross_border", label: "Трансграничная передача", type: "radio", defaultValue: "no", category: "contract",
        options: [
          { label: "Данные за рубеж не передаются", value: "no" },
          { label: "Передаются (указать в политике)", value: "yes" },
        ] },
    ],
    previewTemplate:
      pageShell("Политика обработки cookie") +
      `
  <p class="mb-4 text-justify">
    Настоящая Политика описывает, как {{company}} (далее — «Оператор») использует файлы cookie и иные технологии на сайте {{site_url}} (далее — «Сайт»). Cookie-файлы, по которым можно установить пользователя, приравниваются к персональным данным и обрабатываются в соответствии с ФЗ от 27.07.2006 № 152-ФЗ.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Категории cookie</div>
  <p class="mb-4 text-justify">1.1. Функциональные: {{functional_note}}.</p>
  <p class="mb-4 text-justify">1.2. Аналитические: {{analytic_note}}.</p>
  <p class="mb-4 text-justify">1.3. Маркетинговые: {{marketing_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки и правовые основания</div>
  <p class="mb-4 text-justify">
    2.1. Срок хранения cookie — {{storage_days}} дней. Обработка осуществляется на основании согласия пользователя (ст. 9 ФЗ № 152-ФЗ), выражаемого через настройки cookie-баннера, либо без согласия — если cookie необходимы для функционирования Сайта (п. 2 ч. 1 ст. 6 ФЗ № 152-ФЗ).
  </p>
  <p class="mb-4 text-justify">
    {{#cross_border_is_no}}2.2. Трансграничная передача данных не осуществляется; данные хранятся на серверах на территории Российской Федерации (ст. 18 ФЗ № 152-ФЗ).{{/cross_border_is_no}}
    {{#cross_border_is_yes}}2.2. Данные могут передаваться за пределы Российской Федерации с уведомлением и в порядке, установленном ст. 12 ФЗ № 152-ФЗ.{{/cross_border_is_yes}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Управление cookie</div>
  <p class="mb-4 text-justify">
    3.1. Пользователь может отключить cookie в настройках браузера или отказаться от необязательных категорий в cookie-баннере. Отключение функциональных cookie может ограничить работу Сайта.
  </p>
  <p class="mb-4 text-justify">
    3.2. Отказ от обработки персональных данных не лишает пользователя иных прав, предусмотренных ФЗ № 152-ФЗ.
  </p>
  <p class="mb-6 text-justify">
    3.3. По вопросам обработки данных можно обратиться по контактам Оператора. Политика размещена в открытом доступе и ссылка на неё размещена на всех страницах Сайта (ст. 18.1 ФЗ № 152-ФЗ).
  </p>`
      + operatorSign() +
      `
</div>`,
  },
  {
    id: "website-development",
    name: "Договор на разработку сайта",
    category: "business",
    actSource: "ст. 702–729, 1235, 1286, 1296 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Разработка сайта для ИП и малого бизнеса: этапы, техническое задание, права на исходники и контент, домен, приёмка по акту.",
    suggestedDocs: ["site-acceptance-act", "design-development", "agreement-confidentiality"],
    printInstruction:
      "Исключительное право на сайт переходит к заказчику с момента полной оплаты (ст. 1296 ГК РФ) — укажите это в договоре. Техническое задание оформляется приложением.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("party1", "Исполнитель", "executor"),
      ...partyFields("party2", "Заказчик", "customer"),
      { id: "site_desc", label: "Описание сайта", type: "textarea", defaultValue: "корпоративный сайт (лендинг) с формой обратной связи", category: "items", rows: 2, validation: { required: true } },
      { id: "domain_name", label: "Домен сайта", type: "text", defaultValue: "", category: "contract" },
      { id: "tech_spec", label: "Техническое задание", type: "textarea", defaultValue: "техническое задание является приложением № 1 к договору", category: "contract", rows: 2 },
      { id: "dev_price", label: "Стоимость разработки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "prepay", label: "Предоплата (%)", type: "number", defaultValue: "50", category: "payment" },
      { id: "dev_days", label: "Срок разработки (дней)", type: "number", defaultValue: "30", category: "contract", validation: { required: true } },
      { id: "corrections", label: "Кругов правок", type: "number", defaultValue: "2", category: "contract" },
      { id: "hosting_note", label: "Хостинг и домен (кто оплачивает)", type: "text", defaultValue: "хостинг и домен оплачивает заказчик самостоятельно", category: "contract" },
      itemsRepeating("Этап работ", "этап", "Стоимость этапа"),
    ],
    previewTemplate:
      pageShell("Договор на разработку сайта") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Исполнитель», и {{party2_name}}, именуемый(ая) в дальнейшем «Заказчик»,
    заключили настоящий договор о нижеследующем (ст. 702 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется разработать сайт: {{site_desc}}, а Заказчик — принять результат и оплатить.</p>
  <p class="mb-4 text-justify">1.2. Работы выполняются по техническому заданию ({{tech_spec}}) в срок {{dev_days}} календарных дней с даты подписания договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Этапы работ</div>`
      + itemsTable() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Исключительные права</div>
  <p class="mb-4 text-justify">
    3.1. Исключительное право на созданный сайт, его структуру, дизайн и программный код переходит к Заказчику с момента полной оплаты работ (ст. 1296 ГК РФ). Права на используемые сторонние библиотеки и шрифты не передаются.
  </p>
  <p class="mb-4 text-justify">3.2. Домен сайта: {{domain_name}}. {{hosting_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стоимость и оплата</div>
  <p class="mb-4 text-justify">
    4.1. Стоимость разработки: <strong>{{dev_price}} ({{dev_price_words}})</strong> рублей. Предоплата: {{prepay}}%, остаток — после приёмки по акту.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Приёмка</div>
  <p class="mb-4 text-justify">
    5.1. Приёмка осуществляется по акту. Заказчик вправе требовать до {{corrections}} кругов правок по выявленным замечаниям.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Ответственность</div>
  <p class="mb-4 text-justify">
    6.1. За нарушение срока разработки Исполнитель уплачивает неустойку 0,1% от стоимости за каждый день просрочки, но не более 10% от стоимости работ (ст. 708 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Исполнитель", "party2", "Заказчик"),
  },
  {
    id: "design-development",
    name: "Договор на разработку дизайна",
    category: "business",
    actSource: "ст. 702–729, 1259, 1296 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Разработка дизайн-макетов (сайт, логотип, фирменный стиль, полиграфия): этапы, круги правок, передача исключительных прав после полной оплаты.",
    suggestedDocs: ["website-development", "site-acceptance-act", "agreement-confidentiality"],
    printInstruction:
      "Дизайн-макеты охраняются авторским правом (ст. 1259 ГК РФ). Исключительные права передаются заказчику после полной оплаты (ст. 1296 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("party1", "Исполнитель (дизайнер)", "executor"),
      ...partyFields("party2", "Заказчик", "customer"),
      { id: "design_desc", label: "Что разрабатываем", type: "textarea", defaultValue: "дизайн-макеты главной и внутренних страниц сайта (5 макетов)", category: "items", rows: 2, validation: { required: true } },
      { id: "design_price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "design_days", label: "Срок (дней)", type: "number", defaultValue: "14", category: "contract", validation: { required: true } },
      { id: "revisions", label: "Кругов правок", type: "number", defaultValue: "2", category: "contract" },
      { id: "extra_work", label: "Доработки сверх объёма (руб./макет)", type: "text", defaultValue: "согласовываются сторонами дополнительно", category: "contract" },
      { id: "formats", label: "Форматы передачи макетов", type: "text", defaultValue: "исходные файлы (figma, ai, psd) и готовые форматы (png, jpg, svg, pdf)", category: "contract" },
    ],
    previewTemplate:
      pageShell("Договор на разработку дизайна") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Исполнитель», и {{party2_name}}, именуемый(ая) в дальнейшем «Заказчик»,
    заключили настоящий договор о нижеследующем (ст. 702 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется разработать: {{design_desc}}, а Заказчик — принять и оплатить результат.</p>
  <p class="mb-4 text-justify">1.2. Срок выполнения работ: {{design_days}} календарных дней с даты подписания договора (ст. 708 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок работы</div>
  <p class="mb-4 text-justify">
    2.1. Исполнитель предоставляет до {{revisions}} кругов правок по замечаниям Заказчика. Доработки сверх этого объёма: {{extra_work}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Исключительные права</div>
  <p class="mb-4 text-justify">
    3.1. Исключительное право на созданные дизайн-макеты переходит к Заказчику с момента полной оплаты (ст. 1296 ГК РФ). До оплаты макеты могут использоваться Исполнителем в портфолио с согласия Заказчика.
  </p>
  <p class="mb-4 text-justify">3.2. Передача результатов: {{formats}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Стоимость и оплата</div>
  <p class="mb-4 text-justify">
    4.1. Стоимость работ: <strong>{{design_price}} ({{design_price_words}})</strong> рублей. Порядок оплаты: предоплата 50%, остаток — после приёмки.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность</div>
  <p class="mb-4 text-justify">
    5.1. За нарушение срока Исполнитель уплачивает неустойку 0,1% от стоимости за каждый день просрочки, но не более 10% (ст. 708 ГК РФ).
  </p>`
      + commonClauses() +
      pairSign("party1", "Исполнитель", "party2", "Заказчик"),
  },
  {
    id: "power-attorney",
    name: "Доверенность (типовая)",
    category: "business",
    actSource: "ст. 185–189 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Универсальная доверенность на представительство: перечень полномочий, срок действия (не более 3 лет), передоверие. Для сделок, требующих нотариальной формы, — доверенность должна быть нотариальной.",
    suggestedDocs: ["power-of-attorney-docs", "sign-power-of-attorney", "goods-power-of-attorney"],
    printInstruction:
      "Срок действия доверенности не может превышать 3 лет; если срок не указан, она действует 1 год (ст. 186 ГК РФ). Для сделок, требующих нотариальной формы, доверенность удостоверяется нотариусом (п. 1 ст. 185.1 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("principal", "Доверитель", "principal"),
      { id: "agent_name", label: "Представитель (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "agent_passport", label: "Паспорт представителя (серия, номер)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "agent_address", label: "Адрес представителя", type: "text", defaultValue: "", category: "representative" },
      { id: "powers", label: "Полномочия", type: "textarea", defaultValue: "представлять интересы доверителя в организациях и государственных органах, подписывать документы, подавать и получать заявления и справки, совершать иные юридически значимые действия", category: "contract", rows: 3, validation: { required: true } },
      { id: "valid_until", label: "Срок действия (до даты)", type: "date", defaultValue: "", category: "contract" },
      { id: "transfer", label: "Передоверие", type: "radio", defaultValue: "no", category: "contract",
        options: [
          { label: "Не допускается", value: "no" },
          { label: "Допускается (указать представителя)", value: "yes" },
        ] },
      { id: "sample_sign", label: "Образец подписи представителя", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Доверенность") +
      `
  <p class="mb-4 text-justify">
    {{principal_name}}, именуемый(ая) в дальнейшем «Доверитель»,
    уполномочивает {{agent_name}}, паспорт {{agent_passport}}{{#agent_address}}, проживающего(ую) по адресу: {{agent_address}}{{/agent_address}},
    (далее — «Представитель») представлять интересы Доверителя.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Полномочия</div>
  <p class="mb-4 text-justify">1. {{powers}} (ст. 185 ГК РФ).</p>
  <p class="mb-4 text-justify">
    2. Доверенность выдана{{#valid_until}} сроком до «{{valid_until}}»{{/valid_until}}{{^valid_until}} сроком на один год{{/valid_until}} (ст. 186 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    3. Передоверие {{#transfer_is_no}}не допускается{{/transfer_is_no}}{{#transfer_is_yes}}допускается{{/transfer_is_yes}} (ст. 187 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    4. Доверитель вправе отменить доверенность в любое время; Представитель вправе отказаться от неё с обязательным уведомлением (ст. 188 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Подписи</div>
  <p class="mb-4 text-justify">Доверитель: {{principal_name}}.</p>
  <p class="mb-6 text-justify">Образец подписи Представителя: {{sample_sign}}.</p>`
      + signPairLeft("principal", "Доверитель", "agent", "Представитель") +
      `
</div>`,
  },
  {
    id: "power-attorney-interests",
    name: "Доверенность на представление интересов",
    category: "business",
    actSource: "ст. 185–189 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Доверенность для представления интересов в государственных органах, судах и организациях: процессуальные и внесудебные полномочия.",
    suggestedDocs: ["power-attorney", "court-power-of-attorney", "power-of-attorney-docs"],
    printInstruction:
      "Для участия в гражданском процессе доверенность оформляется по ст. 53 ГПК РФ (нотариальная или от организации). Доверенность на представление интересов в налоговых органах — по ст. 29 НК РФ.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("principal", "Доверитель", "principal"),
      { id: "agent_name", label: "Представитель (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "agent_passport", label: "Паспорт представителя (серия, номер)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "agent_address", label: "Адрес представителя", type: "text", defaultValue: "", category: "representative" },
      { id: "orgs", label: "В каких органах/организациях (укажите с предлогом, напр. «в органах…»)", type: "text", defaultValue: "в государственных и муниципальных органах, судах, банках и организациях всех организационно-правовых форм", category: "contract", validation: { required: true } },
      { id: "judicial", label: "Процессуальные полномочия", type: "radio", defaultValue: "yes", category: "contract",
        options: [
          { label: "Полный объём (в т.ч. в судах)", value: "yes" },
          { label: "Без судов", value: "no" },
        ] },
      { id: "valid_until", label: "Срок действия (до даты)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Доверенность на представление интересов") +
      `
  <p class="mb-4 text-justify">
    {{principal_name}}, именуемый(ая) в дальнейшем «Доверитель»,
    уполномочивает {{agent_name}}, паспорт {{agent_passport}},
    представлять интересы Доверителя {{#orgs}}{{orgs}}{{/orgs}} по всем вопросам.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Полномочия</div>
  <p class="mb-4 text-justify">
    1. Подавать и получать заявления, жалобы, справки и иные документы; давать объяснения; подписывать и заверять документы; получать решения, акты и уведомления (ст. 185 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    2. {{#judicial_is_yes}}Представитель вправе вести дела в судах общей юрисдикции и арбитражных судах со всеми процессуальными правами: знакомиться с материалами дела, заявлять ходатайства, предъявлять иски и встречные иски, отказываться от исковых требований, заключать мировые соглашения (ст. 53, 54 ГПК РФ; ст. 61, 62 АПК РФ).{{/judicial_is_yes}}
    {{#judicial_is_no}}Представительство в судах настоящей доверенностью не предусмотрено.{{/judicial_is_no}}
  </p>
  <p class="mb-4 text-justify">
    3. Доверенность выдана{{#valid_until}} сроком до «{{valid_until}}»{{/valid_until}}{{^valid_until}} сроком на один год{{/valid_until}} (ст. 186 ГК РФ).
  </p>
  <p class="mb-6 text-justify">4. Передоверие не допускается (ст. 187 ГК РФ). Доверитель вправе отменить доверенность в любое время (ст. 188 ГК РФ).</p>`
      + signPairLeft("principal", "Доверитель", "agent", "Представитель") +
      `
</div>`,
  },
  {
    id: "power-attorney-mail",
    name: "Доверенность на получение почты",
    category: "business",
    actSource: "ст. 185–189 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Доверенность на получение корреспонденции, ценных писем, бандеролей и посылок в почтовых отделениях и от курьерских служб.",
    suggestedDocs: ["power-attorney", "goods-power-of-attorney", "power-of-attorney-docs"],
    printInstruction:
      "Для получения простой корреспонденции обычно достаточно доверенности в простой письменной форме (ст. 185 ГК РФ), однако Почта России и курьерские службы вправе потребовать заверенную доверенность: нотариально или удостоверенную по месту работы, учёбы или лечения (Правила оказания услуг почтовой связи, приказ Минцифры № 484 от 17.04.2023). Доверенность от юридического лица заверяется подписью руководителя и печатью.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("principal", "Доверитель", "principal"),
      { id: "agent_name", label: "Представитель (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "agent_passport", label: "Паспорт представителя (серия, номер)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "mail_types", label: "Что получает", type: "text", defaultValue: "простые, заказные и ценные письма, бандероли, посылки, уведомления, судебную и иную корреспонденцию", category: "contract", validation: { required: true } },
      { id: "post_offices", label: "Где получает (укажите с предлогом, напр. «в отделениях…»)", type: "text", defaultValue: "в отделениях почтовой связи и у курьерских служб на территории Российской Федерации", category: "contract" },
      { id: "valid_until", label: "Срок действия (до даты)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate:
      pageShell("Доверенность на получение почты") +
      `
  <p class="mb-4 text-justify">
    {{principal_name}}, именуемый(ая) в дальнейшем «Доверитель»,
    уполномочивает {{agent_name}}, паспорт {{agent_passport}},
    получать {{post_offices}} адресованную Доверителю корреспонденцию.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Полномочия</div>
  <p class="mb-4 text-justify">
    1. Получать {{mail_types}} (ст. 185 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    2. Подписывать документы, связанные с получением корреспонденции, и совершать иные действия, необходимые для её получения.
  </p>
  <p class="mb-4 text-justify">
    3. Доверенность выдана{{#valid_until}} сроком до «{{valid_until}}»{{/valid_until}}{{^valid_until}} сроком на один год{{/valid_until}} (ст. 186 ГК РФ).
  </p>
  <p class="mb-6 text-justify">4. Передоверие не допускается (ст. 187 ГК РФ). Доверенность может быть отменена Доверителем в любое время (ст. 188 ГК РФ).</p>
  <p class="mb-4 text-justify text-xs">Примечание: оператор почтовой связи вправе потребовать доверенность, заверенную нотариально или удостоверенную по месту работы, учёбы или лечения Доверителя.</p>`
      + signPairLeft("principal", "Доверитель", "agent", "Представитель") +
      `
</div>`,
  },
  {
    id: "letter-of-intent",
    name: "Соглашение о намерениях (MOA)",
    category: "business",
    actSource: "ст. 429, 434.1 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Меморандум о взаимопонимании: фиксация намерений сторон до заключения основного договора, принципы добросовестных переговоров, конфиденциальность.",
    suggestedDocs: ["simple-partnership", "corporate-agreement", "agreement-confidentiality"],
    printInstruction:
      "Соглашение о намерениях не является предварительным договором (ст. 429 ГК РФ) и не создаёт обязанности заключить основной договор. Стороны несут ответственность за недобросовестное ведение переговоров (ст. 434.1 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("party1", "Сторона 1", "business"),
      ...partyFields("party2", "Сторона 2", "business"),
      { id: "intent_text", label: "Предмет намерений", type: "textarea", defaultValue: "заключение договора о совместной разработке и продвижении программного продукта", category: "contract", rows: 3, validation: { required: true } },
      { id: "plan_terms", label: "Ориентировочные условия будущего договора", type: "textarea", defaultValue: "стороны определят при подготовке основного договора", category: "contract", rows: 2 },
      { id: "mou_until", label: "Срок действия (до даты)", type: "date", defaultValue: "", category: "contract" },
      { id: "confidential", label: "Конфиденциальность переговоров", type: "text", defaultValue: "условия переговоров и материалы, обмен которых происходит в рамках настоящего соглашения, не подлежат разглашению", category: "contract" },
      { id: "exclusivity", label: "Эксклюзивность переговоров", type: "radio", defaultValue: "no", category: "contract",
        options: [
          { label: "Не ограничены (стороны могут вести переговоры с третьими лицами)", value: "no" },
          { label: "Эксклюзивно в течение срока соглашения", value: "yes" },
        ] },
    ],
    previewTemplate:
      pageShell("Соглашение о намерениях") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}}, именуемый(ая) в дальнейшем «Сторона 1», и {{party2_name}}, именуемый(ая) в дальнейшем «Сторона 2»,
    заключили настоящее соглашение о намерениях о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет</div>
  <p class="mb-4 text-justify">1.1. Стороны намерены заключить договор по предмету: {{intent_text}}.</p>
  <p class="mb-4 text-justify">1.2. Ориентировочные условия будущего договора: {{plan_terms}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Правовой статус</div>
  <p class="mb-4 text-justify">
    2.1. Настоящее соглашение не является предварительным договором (ст. 429 ГК РФ) и не создаёт обязанности заключить основной договор, если стороны не достигнут договорённости.
  </p>
  <p class="mb-4 text-justify">
    2.2. Стороны несут ответственность за недобросовестное ведение переговоров и раскрытие полученной информации (ст. 434.1 ГК РФ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Конфиденциальность</div>
  <p class="mb-4 text-justify">3.1. {{confidential}}.</p>
  <p class="mb-4 text-justify">
    3.2. {{#exclusivity_is_no}}Стороны вправе вести переговоры с третьими лицами по аналогичным вопросам.{{/exclusivity_is_no}}
    {{#exclusivity_is_yes}}В течение срока действия соглашения Стороны не ведут переговоры с третьими лицами по предмету настоящего соглашения.{{/exclusivity_is_yes}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия</div>
  <p class="mb-6 text-justify">4.1. Соглашение действует до «{{mou_until}}»{{^mou_until}} до даты заключения основного договора или прекращения переговоров{{/mou_until}}, но может быть прекращено любой из сторон с письменным уведомлением.</p>`
      + commonClauses() +
      pairSign("party1", "Сторона 1", "party2", "Сторона 2"),
  },
  {
    id: "llc-establishment",
    name: "Договор об учреждении ООО",
    category: "business",
    actSource: "ст. 89 ГК РФ; ст. 11, 16 ФЗ от 08.02.1998 № 14-ФЗ",
    lastUpdated: "Август 2026",
    description:
      "Договор между учредителями о создании ООО: размер уставного капитала, доли участников, порядок и сроки оплаты. Заключается в письменной форме, не является учредительным документом.",
    suggestedDocs: ["charter-llc", "sole-member-decision", "llc-meeting-minutes"],
    printInstruction:
      "Договор об учреждении заключается в письменной форме (п. 5 ст. 11 ФЗ № 14-ФЗ), не является учредительным документом. Решение о создании ООО нотариального удостоверения не требует (разъяснение ФНС). Доли оплачиваются в срок не более 4 месяцев с момента регистрации (ст. 16 ФЗ № 14-ФЗ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "llc_name", label: "Полное наименование ООО", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "llc_short", label: "Сокращённое наименование", type: "text", defaultValue: "", category: "contract" },
      { id: "location", label: "Место нахождения", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "capital", label: "Уставный капитал (руб., не менее 10 000)", type: "number", defaultValue: "10000", category: "payment", validation: { required: true } },
      { id: "director", label: "Генеральный директор (ФИО)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "pay_days", label: "Срок оплаты долей (дней с регистрации)", type: "number", defaultValue: "120", category: "contract" },
      { id: "property_note", label: "Оплата неденежными средствами", type: "text", defaultValue: "доли оплачиваются денежными средствами", category: "contract" },
      { id: "items", label: "Учредители (добавить)", type: "repeating", defaultValue: "", category: "items",
        repeatingFields: [
          { id: "name", label: "Учредитель", type: "text", defaultValue: "", width: "45%" },
          { id: "unit", label: "Паспорт / ОГРН", type: "text", defaultValue: "", width: "30%" },
          { id: "qty", label: "Доля, %", type: "number", defaultValue: "0", width: "10%" },
          { id: "price", label: "Номинал, руб.", type: "number", defaultValue: "0", width: "15%" },
          { id: "sum", label: "Сумма, руб.", type: "number", defaultValue: "0", width: "0%" },
        ] },
    ],
    previewTemplate:
      pageShell("Договор об учреждении ООО") +
      `
  <p class="mb-4 text-justify">
    Мы, нижеподписавшиеся учредители, заключили настоящий договор об учреждении общества с ограниченной ответственностью
    {{llc_name}} ({{llc_short}}) (ст. 89 ГК РФ, п. 5 ст. 11 ФЗ № 14-ФЗ) о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Создание общества</div>
  <p class="mb-4 text-justify">
    1.1. Учредители обязуются создать ООО {{llc_name}}, место нахождения: {{location}}, и зарегистрировать его в установленном законом порядке.
  </p>
  <p class="mb-4 text-justify">1.2. Уставный капитал: <strong>{{capital}} ({{capital_words}})</strong> рублей.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Доли учредителей</div>`
      + itemsTable() +
      `
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок оплаты долей</div>
  <p class="mb-4 text-justify">
    3.1. Доли оплачиваются в течение {{pay_days}} дней с момента государственной регистрации общества, но не более четырёх месяцев (ст. 16 ФЗ № 14-ФЗ). {{property_note}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Органы управления</div>
  <p class="mb-4 text-justify">
    4.1. Единоличный исполнительный орган — генеральный директор {{director}}. Решение об учреждении принято учредителями единогласно (п. 3 ст. 11 ФЗ № 14-ФЗ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность учредителей</div>
  <p class="mb-4 text-justify">
    5.1. Учредители несут солидарную ответственность по обязательствам, связанным с учреждением общества и возникшим до его государственной регистрации (п. 6 ст. 11 ФЗ № 14-ФЗ).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Заключительные положения</div>
  <p class="mb-6 text-justify">
    6.1. Настоящий договор не является учредительным документом общества (п. 5 ст. 11 ФЗ № 14-ФЗ) и действует до полного исполнения обязательств учредителей.
  </p>`
      + foundersSign() +
      `
</div>`,
  },
  {
    id: "collective-agreement",
    name: "Коллективный договор",
    category: "other",
    actSource: "гл. 7 ТК РФ (ст. 40–51)",
    lastUpdated: "Август 2026",
    description:
      "Коллективный договор между работодателем и работниками: оплата труда, рабочее время, отпуска, гарантии и льготы, охрана труда. Срок действия — до 3 лет.",
    suggestedDocs: ["employment-contract", "liability-agreement", "gpa-contract"],
    printInstruction:
      "Коллективный договор заключается на срок не более 3 лет (ст. 43 ТК РФ). Уведомление о заключении направляется в орган по труду в течение 7 дней (ст. 50 ТК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата заключения", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "company_name", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "company_director", label: "Представитель работодателя (руководитель)", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "workers_rep", label: "Представитель работников", type: "text", defaultValue: "выборный орган первичной профсоюзной организации", category: "employee", validation: { required: true } },
      { id: "workers_count", label: "Численность работников", type: "text", defaultValue: "", category: "employee" },
      { id: "pay_note", label: "Оплата труда", type: "textarea", defaultValue: "заработная плата выплачивается не реже двух раз в месяц; индексация — в порядке, установленном ст. 134 ТК РФ", category: "contract", rows: 2 },
      { id: "hours_note", label: "Рабочее время", type: "text", defaultValue: "нормальная продолжительность 40 часов в неделю (ст. 91 ТК РФ)", category: "contract" },
      { id: "vacation_note", label: "Отпуска", type: "text", defaultValue: "ежегодный оплачиваемый отпуск 28 календарных дней (ст. 115 ТК РФ)", category: "contract" },
      { id: "benefits_note", label: "Гарантии и льготы", type: "textarea", defaultValue: "дополнительное обучение за счёт работодателя, материальная помощь в случае рождения ребёнка", category: "contract", rows: 2 },
      { id: "safety_note", label: "Охрана труда", type: "text", defaultValue: "обязанности работодателя по ст. 212 ТК РФ, средства индивидуальной защиты за счёт работодателя", category: "contract" },
      { id: "years", label: "Срок действия (лет, до 3)", type: "number", defaultValue: "3", category: "contract" },
    ],
    previewTemplate:
      pageShell("Коллективный договор") +
      `
  <p class="mb-4 text-justify">
    {{company_name}} в лице {{company_director}} (далее — «Работодатель») и работники в лице {{workers_rep}} (далее — «Работники»)
    заключили настоящий коллективный договор о нижеследующем (гл. 7 ТК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">1.1. Договор заключён на срок {{years}} лет (ст. 43 ТК РФ) и действует со дня подписания сторонами.</p>
  <p class="mb-4 text-justify">1.2. Действие договора распространяется на всех работников организации (ст. 43 ТК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Оплата труда</div>
  <p class="mb-4 text-justify">2.1. {{pay_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Рабочее время и время отдыха</div>
  <p class="mb-4 text-justify">3.1. {{hours_note}}.</p>
  <p class="mb-4 text-justify">3.2. {{vacation_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии и льготы</div>
  <p class="mb-4 text-justify">4.1. {{benefits_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Охрана труда</div>
  <p class="mb-4 text-justify">5.1. {{safety_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">6. Контроль и ответственность</div>
  <p class="mb-4 text-justify">
    6.1. Контроль за исполнением договора осуществляется сторонами и органом по труду. Уведомление о заключении договора направляется работодателем в течение 7 дней (ст. 50 ТК РФ).
  </p>
  <p class="mb-6 text-justify">
    6.2. Лица, виновные в нарушении коллективного договора, несут ответственность в соответствии с законодательством (ст. 55 ТК РФ).
  </p>
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4 mt-10">
    <div>
      <p class="font-bold mb-1">{{company_name}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Работодатель</p>
    </div>
    <div class="text-right">
      <p class="font-bold mb-1">{{workers_rep}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Представитель работников</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "site-acceptance-act",
    name: "Акт приёмки разработанного сайта",
    category: "business",
    actSource: "ст. 720, 1296 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Акт сдачи-приёмки сайта по договору разработки: соответствие техническому заданию, замечания, срок устранения, момент перехода исключительных прав.",
    suggestedDocs: ["website-development", "website-support", "act-works"],
    printInstruction:
      "Подписание акта фиксирует переход исключительных прав после полной оплаты (ст. 1296 ГК РФ) и срок заявления претензий по качеству (ст. 720 ГК РФ).",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата акта", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      ...partyFields("party1", "Исполнитель", "executor"),
      ...partyFields("party2", "Заказчик", "customer"),
      { id: "base_doc", label: "Договор (дата, номер)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "site_desc", label: "Разработанный сайт", type: "textarea", defaultValue: "сайт (лендинг) с формой обратной связи, домен введён в эксплуатацию", category: "items", rows: 2, validation: { required: true } },
      { id: "compliance", label: "Соответствие ТЗ", type: "radio", defaultValue: "ok", category: "contract",
        options: [
          { label: "Соответствует — претензий нет", value: "ok" },
          { label: "Есть замечания (указать ниже)", value: "comments" },
        ] },
      { id: "comments", label: "Замечания", type: "textarea", defaultValue: "замечаний нет", category: "contract", rows: 2 },
      { id: "fix_days", label: "Срок устранения замечаний (дней)", type: "number", defaultValue: "5", category: "contract", dependsOn: { fieldId: "compliance", value: "comments" } },
      { id: "full_paid", label: "Оплата произведена", type: "radio", defaultValue: "yes", category: "payment",
        options: [
          { label: "Да, полностью", value: "yes" },
          { label: "Нет (оплата позже)", value: "no" },
        ] },
    ],
    previewTemplate:
      pageShell("Акт приёмки разработанного сайта") +
      `
  <p class="mb-4 text-justify">
    {{party1_name}} («Исполнитель») передал, а {{party2_name}} («Заказчик») принял результат работ по договору {{base_doc}} (ст. 720 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Результат работ</div>
  <p class="mb-4 text-justify">1.1. {{site_desc}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Приёмка</div>
  <p class="mb-4 text-justify">
    2.1. {{#compliance_is_ok}}Результат работ соответствует техническому заданию, претензий к качеству не заявлено.{{/compliance_is_ok}}
    {{#compliance_is_comments}}Выявлены замечания: {{comments}}. Срок устранения — {{fix_days}} календарных дней.{{/compliance_is_comments}}
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Исключительные права</div>
  <p class="mb-4 text-justify">
    3.1. {{#full_paid_is_yes}}Работы оплачены полностью, исключительное право на сайт перешло к Заказчику (ст. 1296 ГК РФ).{{/full_paid_is_yes}}
    {{#full_paid_is_no}}Оплата не произведена: исключительное право переходит к Заказчику с момента полной оплаты (ст. 1296 ГК РФ).{{/full_paid_is_no}}
  </p>
  <p class="mb-6 text-justify">
    3.2. Обязательства сторон по договору {{base_doc}} в части разработки считаются исполненными с даты подписания настоящего акта.
  </p>`
      + signPairLeft("party1", "Исполнитель", "party2", "Заказчик") +
      `
</div>`,
  },
];