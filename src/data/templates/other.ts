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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о выдаче паспорта гражданина РФ для выезда за границу</div>
  <div class="mb-4 text-xs">
    <p>В подразделение: <strong>{{{department}}}</strong></p>
  </div>
  <div class="mb-6 text-xs">
    <p>Заявитель: <strong>{{{fio}}}</strong></p>
    <p>Дата рождения: {{{birthday}}}</p>
    <p>Место рождения: {{{birthplace}}}</p>
    <p>Пол: {{{gender}}}</p>
    <p>Гражданство: {{{citizenship}}}</p>
    <p>Паспорт: {{{passport_series}}} № {{{passport_number}}}, выдан {{{passport_issued_by}}} {{{passport_date}}}</p>
    <p>Адрес регистрации: {{{registration_address}}}</p>
    <p>Телефон: {{{phone}}}</p>
  </div>
  {{#has_old_passport}}
  <div class="mb-4 text-xs">
    <p>Действующий загранпаспорт: {{{old_passport_info}}}</p>
  </div>
  {{/has_old_passport}}
  <div class="mb-6 text-xs">
    <p>Цель получения: <strong>{{{purpose}}}</strong></p>
  </div>
  <p class="text-xs mb-8">Паспорт прошу выдать сроком на 10 лет (биометрический).</p>
  <div class="flex justify-between items-center text-xs mt-12 border-t border-zinc-300 pt-4">
    <div>« {{{date}}} »</div>
    <div class="text-right">
      <div class="border-b border-zinc-950 w-44 h-5 inline-block"></div>
      <p class="text-[10px] text-zinc-500 mt-1">Подпись</p>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о постановке на учёт</div>
  <div class="mb-4 text-xs">
    <p>В <strong>{{{department}}}</strong></p>
    <p class="mt-4">Заявитель: <strong>{{{fio}}}</strong></p>
    <p>Дата рождения: {{{birthday}}}</p>
    <p>Место рождения: {{{birthplace}}}</p>
    <p>Гражданство: {{{citizenship}}}</p>
    <p>Паспорт: {{{passport_series}}} № {{{passport_number}}}, выдан {{{passport_issued_by}}} {{{passport_date}}}</p>
    <p>Адрес регистрации: {{{registration_address}}}</p>
    <p>Телефон: {{{phone}}}</p>
    {{#email}}<p>Email: {{{email}}}</p>{{/email}}
  </div>
  <p class="text-xs mb-8">Прошу поставить меня на налоговый учёт и выдать свидетельство о присвоении ИНН (или уведомить об ошибках).</p>
  <div class="flex justify-between items-center text-xs mt-12 border-t border-zinc-300 pt-4">
    <div>« {{{date}}} »</div>
    <div class="text-right">
      <div class="border-b border-zinc-950 w-44 h-5 inline-block"></div>
      <p class="text-[10px] text-zinc-500 mt-1">Подпись</p>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор хранения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{depositor_fio}}}</strong>, паспорт {{{depositor_passport}}}, именуемый «Поклажедатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{keeper_fio}}}</strong>, паспорт {{{keeper_passport}}}, именуемый «Хранитель», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Поклажедатель передаёт, а Хранитель принимает на хранение имущество: <strong>{{{item_description}}}</strong>.
  </p>
  <p class="mb-4 text-justify">
    1.2. Хранение осуществляется по адресу: {{{storage_address}}}, в период с «{{{storage_start}}}» по «{{{storage_end}}}».
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">
    2.1. Вознаграждение за хранение составляет <strong>{{{storage_price}}} руб.</strong> в месяц ({{{storage_price_words}}}).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">
    3.1. {{{liability}}}. Хранитель не отвечает за естественную порчу имущества.
  </p>
  <p class="mb-4 text-justify">
    3.2. При прекращении договора Поклажедатель обязан забрать имущество, иначе Хранитель вправе требовать оплаты хранения за весь срок.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Поклажедатель:</div>
      <p>{{{depositor_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Хранитель:</div>
      <p>{{{keeper_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор перевозки груза</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{shipper_company}}}</strong>, ИНН {{{shipper_inn}}}, в лице директора {{{shipper_director}}}, именуемый «Отправитель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{carrier_company}}}</strong>, ИНН {{{carrier_inn}}}, в лице директора {{{carrier_director}}}, именуемый «Перевозчик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Перевозчик обязуется доставить вверенный ему груз: <strong>{{{cargo_description}}}</strong>, из {{{route_from}}} в {{{route_to}}}, и выдать его уполномоченному лицу.
  </p>
  <p class="mb-4 text-justify">
    1.2. Перевозка выполняется транспортом: {{{carrier_type}}}. Погрузка: «{{{loading_date}}}», доставка: «{{{delivery_date}}}».
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и оплата</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость перевозки составляет <strong>{{{freight_cost}}} руб.</strong> ({{{freight_cost_words}}}), оплачивается после доставки по акту.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">
    3.1. {{{compensation_note}}}. За просрочку доставки — неустойка 0,1% от стоимости перевозки за каждый день.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Отправитель:</div>
      <p><strong>{{{shipper_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Перевозчик:</div>
      <p><strong>{{{carrier_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "power-of-attorney-docs",
    name: "Доверенность на получение документов",
    category: "other",
    actSource: "ст. 185 ГК РФ",
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
      },
      {
        id: "has_substitution", label: "Право передоверия", type: "checkbox", defaultValue: "false",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Доверенность</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, гражданин <strong>{{{principal_fio}}}</strong>, паспорт {{{principal_passport}}}, зарегистрированный по адресу: {{{principal_address}}}, настоящей доверенностью уполномочиваю гражданина <strong>{{{agent_fio}}}</strong>, паспорт {{{agent_passport}}}, зарегистрированного по адресу: {{{agent_address}}}, получить в <strong>{{{org_name}}}</strong> следующие документы: {{{docs_list}}}.
  </p>
  <p class="mb-4 text-justify">Для чего предоставляю право расписываться за меня и совершать все действия, связанные с получением указанных документов.</p>
  <p class="mb-4 text-justify">Доверенность выдана сроком до «{{{valid_until}}}» {{#has_substitution}}с правом передоверия полномочий третьим лицам{{/has_substitution}}{{^has_substitution}}без права передоверия полномочий третьим лицам{{/has_substitution}}.</p>
  <div class="border-b border-zinc-950 w-56 h-5 mt-6"></div>
  <p class="text-xs"><strong>{{{principal_fio}}}</strong></p>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Политика конфиденциальности</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">1. Настоящая Политика определяет порядок обработки персональных данных пользователей сайта {{{site_url}}} оператором <strong>{{{operator_name}}}</strong> (ст. 3 ФЗ-152).</p>
  <p class="mb-4 text-justify">2. Оператор обрабатывает следующие данные: {{{pd_types}}}.</p>
  <p class="mb-4 text-justify">3. Цели обработки: {{{pd_purpose}}}.</p>
  <p class="mb-4 text-justify">4. Оператор не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
  <p class="mb-4 text-justify">5. Пользователь вправе отозвать согласие на обработку персональных данных (ст. 9 ФЗ-152).</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <div class="font-bold mb-2 uppercase text-black">Оператор:</div>
    <p class="mb-1">{{{operator_name}}}</p>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды спецтехники (оборудования)</div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_fio}}}</strong> (ИНН {{{lessor_inn}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{lessee_fio}}}</strong> (ИНН {{{lessee_inn}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 606 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель передаёт Арендатору во временное владение и пользование: {{{equipment_desc}}}. Условие об экипаже: {{{crew_type}}}.</p>
  <p class="mb-3 text-justify">1.2. Техника передаётся для использования в целях: {{{use_purpose}}}, по акту приёма-передачи, фиксирующему её состояние.</p>
  <p class="font-bold mb-2">2. Арендная плата</p>
  <p class="mb-3 text-justify">2.1. Арендная плата составляет: {{{rent_price}}}, и вносится ежемесячно на основании актов.</p>
  <p class="mb-3 text-justify">2.2. ГСМ и расходные материалы оплачивает: {{{fuel_by}}}.</p>
  <p class="font-bold mb-2">3. Срок аренды</p>
  <p class="mb-3 text-justify">3.1. Техника передаётся «{{{start_date}}}» и возвращается «{{{end_date}}}» по акту возврата. Досрочный возврат возможен с уведомлением за 3 дня.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Арендатор несёт ответственность за сохранность техники и ущерб, причинённый по его вине ({{{crew_type}}} — {{#crew_type}}при аренде без экипажа технику эксплуатирует и обслуживает сам Арендатор{{/crew_type}}).</p>
  <p class="mb-3 text-justify">4.2. За просрочку оплаты Арендатор уплачивает неустойку {{{penalty}}} от суммы задолженности (ст. 330 ГК РФ).</p>
  
  <p class="font-bold mb-2">5. Форс-мажор</p>
  <p class="mb-3 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">6. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Арендодатель:</p>
      <p class="mb-6">{{{lessor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{lessee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор транспортной экспедиции</div>
  <p class="mb-4 text-justify">
    <strong>{{{forwarder_company}}}</strong> (ИНН {{{forwarder_inn}}}), именуемый «Экспедитор», с одной стороны, и
    <strong>{{{client_company}}}</strong> (ИНН {{{client_inn}}}), именуемый «Клиент», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 801 ГК РФ, ФЗ-87):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Экспедитор обязуется за вознаграждение организовать перевозку груза: {{{cargo_desc}}}, по маршруту {{{route}}}, а также оказать сопутствующие услуги (оформление документов, погрузка, страхование).</p>
  <p class="mb-3 text-justify">1.2. Объявленная стоимость груза: {{{cargo_value}}} руб. {{{insurance}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Вознаграждение Экспедитора составляет <strong>{{{freight_cost}}} руб.</strong> ({{{freight_cost_words}}}). {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Обязанности сторон</p>
  <p class="mb-3 text-justify">3.1. Экспедитор обязан доставить груз в срок до «{{{delivery_date}}}», Клиент — передать груз и необходимые документы.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За утрату, недостачу или повреждение груза Экспедитор несёт ответственность в размере объявленной стоимости (ст. 803 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Исковая давность по требованиям к Экспедитору — 1 год (ст. 13 ФЗ-87).</p>
  
  <p class="font-bold mb-2">5. Форс-мажор</p>
  <p class="mb-3 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">6. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Экспедитор:</p>
      <p class="mb-6">{{{forwarder_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Клиент:</p>
      <p class="mb-6">{{{client_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание услуг по обращению с ТКО</div>
  <p class="mb-4 text-justify">
    <strong>{{{operator_company}}}</strong> (ИНН {{{operator_inn}}}), именуемый «Региональный оператор», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Потребитель», с другой стороны,
    заключили настоящий договор (ст. 24.6-24.7 ФЗ-89, ПП РФ № 1156):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Региональный оператор обязуется оказывать услуги по обращению с ТКО по адресу: {{{object_address}}}. Объём накопления: {{{volume}}}.</p>
  <p class="mb-3 text-justify">1.2. Договор заключается в порядке {{{contract_type}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Тариф: {{{rate}}}. {{{payment_terms}}}.</p>
  <p class="mb-3 text-justify">2.2. При неоказании услуг оператор производит перерасчёт пропорционально неоказанному объёму.</p>
  <p class="font-bold mb-2">3. Обязанности сторон</p>
  <p class="mb-3 text-justify">3.1. Региональный оператор обязан вывозить отходы по установленному графику и содержать контейнерные площадки. Потребитель обязан обеспечивать доступ к площадкам и складировать отходы в контейнеры.</p>
  <p class="font-bold mb-2">4. Срок действия</p>
  <p class="mb-3 text-justify">4.1. Услуги оказываются с «{{{start_date}}}». Договор считается заключённым на неопределённый срок и может быть расторгнут в порядке, установленном ПП РФ № 1156.</p>
  
  <p class="font-bold mb-2">5. Форс-мажор</p>
  <p class="mb-3 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">6. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Региональный оператор:</p>
      <p class="mb-6">{{{operator_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Потребитель:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о замене паспорта гражданина РФ</div>
  <p class="mb-4 text-justify">В отдел по вопросам миграции УВМ МВД России по городу {{{city}}}</p>
  <p class="mb-1 text-justify">Заявитель: {{{applicant_fio}}}, {{{applicant_birthday}}} г.р., место рождения: {{{applicant_birthplace}}}</p>
  <p class="mb-4 text-justify">Адрес регистрации: {{{applicant_address}}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Заявление</div>
  <p class="mb-3 text-justify">1. Прошу заменить паспорт гражданина РФ {{{old_passport}}} в связи с: {{{replace_reason}}} (ПП РФ № 828).</p>
  <p class="mb-3 text-justify">2. Госпошлина в размере {{{fee}}} руб. оплачена (ст. 333.33 НК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attach_docs}}}.</p>
  <p class="mb-4 text-justify">Заявление подано в течение 90 дней со дня наступления основания, предусмотренного законом.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Заявитель: {{{applicant_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о возврате налога на доходы физических лиц</div>
  <p class="mb-4 text-justify">В {{{tax_office}}}</p>
  <p class="mb-1 text-justify">От: {{{applicant_fio}}}, ИНН {{{applicant_inn}}}</p>
  <p class="mb-1 text-justify">Паспорт: {{{applicant_passport}}}</p>
  <p class="mb-4 text-justify">Адрес: {{{applicant_address}}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Заявление</div>
  <p class="mb-3 text-justify">1. В соответствии со ст. 220 НК РФ прошу предоставить имущественный налоговый вычет за {{{tax_year}}} год по основанию: {{{deduction_base}}}. Сумма вычета: {{{deduction_amount}}} руб.</p>
  <p class="mb-3 text-justify">2. Прошу возвратить излишне уплаченный налог в сумме <strong>{{{refund_amount}}} руб.</strong> ({{{refund_amount_words}}}) на реквизиты: {{{bank_details}}} (ст. 78 НК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Приложения:</div>
  <p class="mb-4 text-justify">{{{attachments}}}.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Заявитель: {{{applicant_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
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
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Гарантийное письмо</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Гарантия</div>
  <p class="mb-4 text-justify">1.1. {{{applicant_fio}}} гарантирует {{{recipient}}} оплату {{{guarantee_subject}}} в размере <strong>{{{amount}}} ({{{amount_words}}}) рублей</strong> в срок: {{{deadline}}}.</p>
  <p class="mb-4 text-justify">1.2. В случае нарушения срока обязуемся уплатить неустойку в размере 0,1% от суммы задолженности за каждый день просрочки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Реквизиты</div>
  <p class="mb-4 text-justify">2.1. {{{bank_details}}}.</p>
  <p class="mb-4 text-justify">2.2. Настоящее письмо является обязательством и составлено в соответствии со ст. 160 ГК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Подтверждение</div>
  <p class="mb-4 text-justify">3.1. Подтверждаем, что указанные сведения достоверны, и обязуемся исполнить гарантию в полном объёме.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о постановке на учёт в качестве налогоплательщика НПД</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу поставить меня на учёт в качестве налогоплательщика налога на профессиональный доход в {{{registration_region}}}.</p>
  <p class="mb-4 text-justify">1.2. Планируемый вид деятельности: {{{activity}}}.</p>
  <p class="mb-4 text-justify">1.3. Постановка на учёт осуществляется через {{{reg_method}}} (ст. 5 ФЗ № 422-ФЗ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Подтверждение</div>
  <p class="mb-4 text-justify">2.1. Подтверждаю, что не являюсь наёмным работником по месту оказания услуг и не имею работодателя, с которым заключён трудовой договор на данный вид деятельности.</p>
  <p class="mb-4 text-justify">2.2. Обязуюсь вести учёт доходов и уплачивать налог в порядке, установленном законодательством.</p>
  <p class="mb-4 text-justify">2.3. Согласен на обработку персональных данных в соответствии с законодательством РФ.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о государственной регистрации в качестве индивидуального предпринимателя</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу зарегистрировать меня в качестве индивидуального предпринимателя в соответствии со ст. 22.1 ФЗ № 129-ФЗ.</p>
  <p class="mb-4 text-justify">1.2. Основной вид деятельности: {{{activity}}}.</p>
  <p class="mb-4 text-justify">1.3. Заявление подаётся {{{submission}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения</div>
  <p class="mb-4 text-justify">2.1. Налоговый режим: {{{tax_system}}}.</p>
  <p class="mb-4 text-justify">2.2. Подтверждаю достоверность сведений, указанных в настоящем заявлении.</p>
  <p class="mb-4 text-justify">2.3. Обязуюсь в установленный срок встать на учёт в налоговом органе и уплачивать налоги и страховые взносы.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, ИНН, квитанция об уплате государственной пошлины, заявление по форме Р21001.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие на обработку персональных данных</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Согласие</div>
  <p class="mb-4 text-justify">1.1. Даю согласие {{{operator}}} на обработку моих персональных данных: {{{data_list}}}.</p>
  <p class="mb-4 text-justify">1.2. Цели обработки: {{{purpose}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{transfer}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия</div>
  <p class="mb-4 text-justify">2.1. Согласие действует в течение {{{term}}}.</p>
  <p class="mb-4 text-justify">2.2. Согласие может быть отозвано путём подачи письменного заявления оператору (ст. 9 ФЗ № 152-ФЗ).</p>
  <p class="mb-4 text-justify">2.3. Оператор обязуется обеспечивать конфиденциальность и защиту персональных данных.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Подтверждение</div>
  <p class="mb-4 text-justify">3.1. Подтверждаю достоверность указанных сведений и осведомлённость о правах субъекта персональных данных.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "resignation-letter",
    name: "Заявление об увольнении по собственному желанию",
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
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление об увольнении по собственному желанию</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу уволить меня по собственному желанию (п. 3 ч. 1 ст. 77 ТК РФ) «{{{last_day}}}».</p>
  <p class="mb-4 text-justify">1.2. {{{workout}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{reason}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Подтверждение</div>
  <p class="mb-4 text-justify">2.1. Прошу выдать трудовую книжку (сведения о трудовой деятельности) и произвести полный расчёт в день увольнения.</p>
  <p class="mb-4 text-justify">2.2. Заявление подано лично, копию с отметкой о принятии прошу вернуть.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="mt-8 border-t border-zinc-300 pt-4 text-xs">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заявитель:</div>
      <p class="mb-1"><strong>{{{applicant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  }
];
