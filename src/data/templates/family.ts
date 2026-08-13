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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата согласия", type: "date", defaultValue: "2026-06-15",
        category: "contract",
      },
      {
        id: "spouse_fio", label: "ФИО супруга(и), дающего согласие", type: "text",
        defaultValue: "Козлова Елена Дмитриевна", category: "spouse", validation: { required: true },
      },
      {
        id: "spouse_passport", label: "Паспорт супруга(и)", type: "text",
        defaultValue: "серия 4610 № 112233", category: "spouse",
      },
      {
        id: "spouse_address", label: "Адрес супруга(и)", type: "text",
        defaultValue: "г. Москва, ул. Тверская, д. 10, кв. 5", category: "spouse",
      },
      {
        id: "owner_fio", label: "ФИО супруга(и) — собственника", type: "text",
        defaultValue: "Козлов Дмитрий Андреевич", category: "owner", validation: { required: true },
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
        defaultValue: "г. Москва, ул. Арбат, д. 15, кв. 42", category: "contract",
        validation: { required: true },
      },
      {
        id: "buyer_fio", label: "ФИО покупателя (если известен)", type: "text",
        defaultValue: "Петрова Анна Сергеевна", category: "buyer",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие супруга(и) на продажу имущества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, гражданин <strong>{{{spouse_fio}}}</strong>, паспорт {{{spouse_passport}}}, зарегистрированный по адресу: {{{spouse_address}}}, являясь супругом(ой) гражданина <strong>{{{owner_fio}}}</strong>, настоящим даю согласие на продажу следующего имущества:
  </p>
  <p class="mb-4 text-justify">
    <strong>Тип:</strong> {{{object_type}}}, <strong>Описание:</strong> {{{object_address}}}
  </p>
  <p class="mb-4 text-justify">
    {{{#buyer_fio}}}Покупатель: {{{buyer_fio}}}{{{/buyer_fio}}}
  </p>
  <p class="mb-4 text-justify">
    Настоящее согласие действует в течение всего срока действия сделки по продаже указанного имущества.
  </p>
  <div class="flex justify-end mt-12 text-xs">
    <div class="text-right">
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Подпись / {{{spouse_fio}}}</p>
    </div>
  </div>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-07-20",
        category: "contract",
      },
      {
        id: "spouse1_fio", label: "ФИО Супруга", type: "text", defaultValue: "Иванов Иван Иванович",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse1_passport", label: "Паспорт Супруга", type: "text",
        defaultValue: "серия 4510 № 123456", category: "spouse",
      },
      {
        id: "spouse2_fio", label: "ФИО Супруги", type: "text", defaultValue: "Иванова Мария Петровна",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse2_passport", label: "Паспорт Супруги", type: "text",
        defaultValue: "серия 4510 № 654321", category: "spouse",
      },
      {
        id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "2015-06-01",
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
        defaultValue: "Квартира по адресу г. Москва, ул. Пушкина, д. 10 (приобретена в браке)",
        category: "family",
      },
      {
        id: "mixed_notes", label: "Особенности смешанного режима", type: "textarea", rows: 3,
        defaultValue: "Личное имущество: доли в ООО «Север», автомобиль Тойота. Общее: квартира, банковские вклады.",
        category: "family",
        dependsOn: { fieldId: "regime", value: "Смешанный режим (указано в п. 2.2)" },
      },
      {
        id: "children_note", label: "Условия о детях (необязательно)", type: "text",
        defaultValue: "На детей условия не распространяются", category: "family",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Брачный договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{spouse1_fio}}}</strong>, паспорт {{{spouse1_passport}}}, и гражданка <strong>{{{spouse2_fio}}}</strong>, паспорт {{{spouse2_passport}}}, состоящие в браке, зарегистрированном «{{{marriage_date}}}», именуемые вместе «Супруги», заключили настоящий договор:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">
    1.1. Настоящий договор определяет имущественные права и обязанности Супругов в браке и (или) в случае его расторжения.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Режим собственности</div>
  <p class="mb-4 text-justify">
    2.1. На имущество, нажитое супругами во время брака, устанавливается режим: {{{regime}}}.
  </p>
  <p class="mb-4 text-justify">
    2.2. Имущество, на которое распространяется режим: {{{property_list}}}.
  </p>
  {{#mixed_notes}}
  <p class="mb-4 text-justify">
    2.3. Особенности режима: {{{mixed_notes}}}.
  </p>
  {{/mixed_notes}}
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прочие условия</div>
  <p class="mb-4 text-justify">
    3.1. {{{children_note}}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Договор подлежит нотариальному удостоверению и вступает в силу с момента его удостоверения.
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
      <div class="font-bold mb-1">{{{spouse1_fio}}}:</div>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">{{{spouse2_fio}}}:</div>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата соглашения", type: "date", defaultValue: "2026-07-20",
        category: "contract",
      },
      {
        id: "payer_fio", label: "ФИО плательщика алиментов", type: "text",
        defaultValue: "Сидоров Алексей Викторович", category: "recipient", validation: { required: true },
      },
      {
        id: "payer_passport", label: "Паспорт плательщика", type: "text",
        defaultValue: "серия 4510 № 555666", category: "recipient",
      },
      {
        id: "receiver_fio", label: "ФИО получателя алиментов", type: "text",
        defaultValue: "Сидорова Ольга Николаевна", category: "sender", validation: { required: true },
      },
      {
        id: "receiver_passport", label: "Паспорт получателя", type: "text",
        defaultValue: "серия 4510 № 777888", category: "sender",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "Сидорова Анна Алексеевна",
        category: "family", validation: { required: true },
      },
      {
        id: "child_birthday", label: "Дата рождения ребёнка", type: "date", defaultValue: "2018-03-12",
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
        id: "amount_fixed", label: "Сумма в месяц (руб.)", type: "number", defaultValue: "30000",
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
        id: "pay_day", label: "День ежемесячной оплаты", type: "number", defaultValue: "5",
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
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение об уплате алиментов</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{payer_fio}}}</strong>, паспорт {{{payer_passport}}}, именуемый «Плательщик», и гражданка <strong>{{{receiver_fio}}}</strong>, паспорт {{{receiver_passport}}}, именуемая «Получатель», заключили соглашение об уплате алиментов на содержание ребёнка:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">
    1.1. Плательщик обязуется уплачивать алименты на содержание <strong>{{{child_fio}}}</strong>, {{{child_birthday}}} года рождения, а Получатель — принимать их.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Размер алиментов</div>
  {{#amount_fixed}}
  <p class="mb-4 text-justify">
    2.1. Алименты уплачиваются в твёрдой денежной сумме: <strong>{{{amount_fixed}}} руб.</strong> ({{{amount_fixed_words}}}) ежемесячно.
  </p>
  {{/amount_fixed}}
  {{#amount_share}}
  <p class="mb-4 text-justify">
    2.1. Алименты уплачиваются в размере <strong>{{{amount_share}}}</strong> от всех видов заработка Плательщика.
  </p>
  {{/amount_share}}
  <p class="mb-4 text-justify">
    2.2. Оплата производится не позднее {{{pay_day}}}-го числа каждого месяца.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">
    3.1. Уплата производится {{{until_note}}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Соглашение подлежит нотариальному удостоверению и имеет силу исполнительного листа.
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
      <div class="font-bold mb-1">Плательщик:</div>
      <p>{{{payer_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Получатель:</div>
      <p>{{{receiver_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-07-20",
        category: "contract",
      },
      {
        id: "donor_fio", label: "ФИО Дарителя", type: "text", defaultValue: "Петров Петр Петрович",
        category: "donor", validation: { required: true },
      },
      {
        id: "donor_passport", label: "Паспорт Дарителя", type: "text",
        defaultValue: "серия 4510 № 222333", category: "donor",
      },
      {
        id: "donee_fio", label: "ФИО Одаряемого", type: "text", defaultValue: "Петрова Анна Петровна",
        category: "donee", validation: { required: true },
      },
      {
        id: "donee_passport", label: "Паспорт Одаряемого", type: "text",
        defaultValue: "серия 4510 № 444555", category: "donee",
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
        defaultValue: "Квартира общей площадью 62,5 кв.м по адресу: г. Москва, ул. Пушкина, д. 5, кв. 14",
        category: "object", validation: { required: true },
      },
      {
        id: "cadastral_number", label: "Кадастровый номер (для недвижимости)", type: "text",
        defaultValue: "77:01:0004022:1234", category: "object",
        dependsOn: { fieldId: "gift_type", values: ["Квартира / доля", "Жилой дом", "Земельный участок"] },
      },
      {
        id: "gift_car_vin", label: "VIN автомобиля", type: "text", defaultValue: "",
        category: "vehicle",
        dependsOn: { fieldId: "gift_type", value: "Автомобиль" },
      },
      {
        id: "gift_money", label: "Сумма денежного дара (руб.)", type: "number", defaultValue: "0",
        category: "payment",
        dependsOn: { fieldId: "gift_type", value: "Денежные средства" },
      },
      {
        id: "tax_note", label: "Примечание (налог 13%)", type: "text",
        defaultValue: "Близкие родственники освобождаются от НДФЛ (п. 18.1 ст. 217 НК РФ)",
        category: "family",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{donor_fio}}}</strong>, паспорт {{{donor_passport}}}, именуемый «Даритель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{donee_fio}}}</strong>, паспорт {{{donee_passport}}}, именуемый «Одаряемый», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Даритель безвозмездно передаёт в собственность Одаряемого: <strong>{{{gift_description}}}</strong>.
  </p>
  {{#cadastral_number}}
  <p class="mb-4 text-justify">1.2. Кадастровый номер: {{{cadastral_number}}}.</p>
  {{/cadastral_number}}
  {{#gift_car_vin}}
  <p class="mb-4 text-justify">1.2. VIN: {{{gift_car_vin}}}.</p>
  {{/gift_car_vin}}
  {{#gift_money}}
  <p class="mb-4 text-justify">
    1.2. Сумма денежных средств: <strong>{{{gift_money}}} руб.</strong> ({{{gift_money_words}}}).
  </p>
  {{/gift_money}}
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Отношения сторон</div>
  <p class="mb-4 text-justify">
    2.1. Одаряемый состоит с Дарителем в родстве: {{{relation}}}.
  </p>
  <p class="mb-4 text-justify">2.2. {{{tax_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прочие условия</div>
  <p class="mb-4 text-justify">
    3.1. Договор не содержит условий о передаче имущества после смерти Дарителя (обещание дарения на случай смерти ничтожно).
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
      <div class="font-bold mb-1">Даритель:</div>
      <p>{{{donor_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Одаряемый:</div>
      <p>{{{donee_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-10",
        category: "contract",
      },
      {
        id: "parent_fio", label: "ФИО родителя (согласие)", type: "text", defaultValue: "Сергеева Мария Ивановна",
        category: "spouse", validation: { required: true },
      },
      {
        id: "parent_passport", label: "Паспорт родителя (серия №)", type: "text",
        defaultValue: "4504 789123", category: "spouse",
      },
      {
        id: "parent_address", label: "Адрес регистрации родителя", type: "text",
        defaultValue: "г. Москва, ул. Ленина, д. 1, кв. 10", category: "spouse",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "Сергеев Артём Дмитриевич",
        category: "family", validation: { required: true },
      },
      {
        id: "child_birthday", label: "Дата рождения ребёнка", type: "date", defaultValue: "2014-03-15",
        category: "family",
      },
      {
        id: "child_passport", label: "Свидетельство о рождении / паспорт", type: "text",
        defaultValue: "свидетельство о рождении II-МЮ № 123456", category: "family",
      },
      {
        id: "country", label: "Страна выезда", type: "text", defaultValue: "Турция",
        category: "contract", validation: { required: true },
      },
      {
        id: "travel_dates", label: "Период поездки", type: "text", defaultValue: "с 15.08.2026 по 29.08.2026",
        category: "contract",
      },
      {
        id: "companion_fio", label: "Сопровождающее лицо", type: "text",
        defaultValue: "Сергеев Дмитрий Олегович (отец)", category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие на выезд несовершеннолетнего ребёнка за границу</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{parent_fio}}}</strong>, паспорт {{{parent_passport}}}, зарегистрированная(ый) по адресу: {{{parent_address}}}, даю согласие на выезд из Российской Федерации моего(ей) несовершеннолетнего(ей) сына (дочери) <strong>{{{child_fio}}}</strong>, {{{child_birthday}}} года рождения, {{{child_passport}}}, в страну <strong>{{{country}}}</strong> на период {{{travel_dates}}}.
  </p>
  <p class="mb-4 text-justify">
    Выезд осуществляется в сопровождении {{{companion_fio}}}.
  </p>
  <p class="mb-4 text-justify">Согласие удостоверено нотариусом, настоящее согласие выдано для предъявления в органы пограничного контроля.</p>
  <div class="border-b border-zinc-950 w-56 h-5 mt-6"></div>
  <p class="text-xs"><strong>{{{parent_fio}}}</strong></p>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата соглашения", type: "date", defaultValue: "2026-08-10",
        category: "contract",
      },
      {
        id: "spouse1_fio", label: "ФИО Супруга", type: "text", defaultValue: "Волков Андрей Николаевич",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse1_passport", label: "Паспорт Супруга", type: "text", defaultValue: "4510 111222",
        category: "spouse",
      },
      {
        id: "spouse1_address", label: "Адрес Супруга", type: "text",
        defaultValue: "г. Москва, ул. Ленина, д. 5, кв. 12", category: "spouse",
      },
      {
        id: "spouse2_fio", label: "ФИО Супруги", type: "text", defaultValue: "Волкова Анна Игоревна",
        category: "spouse", validation: { required: true },
      },
      {
        id: "spouse2_passport", label: "Паспорт Супруги", type: "text", defaultValue: "4598 333444",
        category: "spouse",
      },
      {
        id: "spouse2_address", label: "Адрес Супруги", type: "text",
        defaultValue: "г. Москва, ул. Ленина, д. 5, кв. 12", category: "spouse",
      },
      {
        id: "marriage_date", label: "Дата заключения брака", type: "date", defaultValue: "2010-06-20",
        category: "contract",
      },
      {
        id: "property_list", label: "Перечень разделяемого имущества", type: "textarea", rows: 4,
        defaultValue: "квартира по адресу г. Москва, ул. Ленина, д. 5, кв. 12 (переходит В.А.Н.); автомобиль Kia Rio, гос. номер А111ВС777 (переходит В.И.); денежные средства на счёте в размере 500 000 руб. (делятся поровну)",
        category: "contract", validation: { required: true },
      },
      {
        id: "children_note", label: "Дети (учесть интересы)", type: "text", defaultValue: "Общих несовершеннолетних детей нет",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о разделе совместно нажитого имущества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{spouse1_fio}}}</strong>, паспорт {{{spouse1_passport}}}, зарегистрированный по адресу: {{{spouse1_address}}}, и гражданка <strong>{{{spouse2_fio}}}</strong>, паспорт {{{spouse2_passport}}}, зарегистрированная по адресу: {{{spouse2_address}}}, состоящие в зарегистрированном браке с {{{marriage_date}}}, в соответствии со ст. 38 СК РФ заключили настоящее соглашение о разделе имущества, нажитого в период брака:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Разделяемое имущество</div>
  <p class="mb-4 text-justify">1.1. Стороны произвели раздел следующего совместно нажитого имущества: {{{property_list}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{children_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок вступления в силу</div>
  <p class="mb-4 text-justify">2.1. Соглашение вступает в силу с момента подписания (при разделе недвижимости — с момента государственной регистрации права).</p>
  <p class="mb-4 text-justify">2.2. В остальном, что не предусмотрено настоящим соглашением, стороны руководствуются законодательством РФ.</p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">
    3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div><div class="font-bold mb-1">Супруг:</div><p class="mb-1"><strong>{{{spouse1_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Супруга:</div><p class="mb-1"><strong>{{{spouse2_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
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
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10",
        category: "contract",
      },
      {
        id: "customer_fio", label: "ФИО Заказчика (родителя)", type: "text", defaultValue: "Егорова Наталья Викторовна",
        category: "customer", validation: { required: true },
      },
      {
        id: "executor_fio", label: "ФИО Няни", type: "text", defaultValue: "Соколова Светлана Андреевна",
        category: "executor", validation: { required: true },
      },
      {
        id: "executor_passport", label: "Паспорт Няни", type: "text", defaultValue: "4521 555666",
        category: "executor",
      },
      {
        id: "child_fio", label: "ФИО ребёнка", type: "text", defaultValue: "Егоров Марк Александрович",
        category: "family", validation: { required: true },
      },
      {
        id: "child_age", label: "Возраст ребёнка (лет)", type: "number", defaultValue: "3",
        category: "family",
      },
      {
        id: "work_hours", label: "График работы", type: "text", defaultValue: "понедельник–пятница, 9:00–19:00",
        category: "contract",
      },
      {
        id: "work_address", label: "Место работы", type: "text", defaultValue: "г. Москва, ул. Мира, д. 10, кв. 25",
        category: "contract",
      },
      {
        id: "service_price", label: "Оплата (руб./час или мес)", type: "text", defaultValue: "30 000 руб. в месяц",
        category: "payment", validation: { required: true },
      },
      {
        id: "duties_list", label: "Обязанности", type: "textarea", rows: 3,
        defaultValue: "присмотр и уход, кормление, прогулки, развивающие занятия, поддержание порядка в детской комнате",
        category: "contract",
      },
      {
        id: "medical_book", label: "Медицинская книжка", type: "checkbox", defaultValue: "true",
        category: "executor",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания услуг няни</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_fio}}}</strong>, именуемая в дальнейшем «Заказчик», с одной стороны, и <strong>{{{executor_fio}}}</strong>, паспорт {{{executor_passport}}}, именуемая в дальнейшем «Исполнитель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется осуществлять присмотр и уход за ребёнком <strong>{{{child_fio}}}</strong>, {{{child_age}}} лет, на условиях настоящего договора.</p>
  <p class="mb-4 text-justify">1.2. Место оказания услуг: {{{work_address}}}. График: {{{work_hours}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности Исполнителя</div>
  <p class="mb-4 text-justify">2.1. Исполнитель обязуется: {{{duties_list}}}; обеспечивать безопасность ребёнка, незамедлительно сообщать Заказчику о происшествиях.</p>
  <p class="mb-4 text-justify">2.2. {{#medical_book}}Исполнитель имеет действующую медицинскую книжку и обязуется предоставлять её по требованию Заказчика.{{/medical_book}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Оплата услуг</div>
  <p class="mb-4 text-justify">3.1. Стоимость услуг составляет: {{{service_price}}}. Оплата производится ежемесячно не позднее 5 числа следующего месяца.</p>
  
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
    <div><div class="font-bold mb-1">Заказчик:</div><p class="mb-1"><strong>{{{customer_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Исполнитель:</div><p class="mb-1"><strong>{{{executor_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
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
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "testator_fio", label: "Завещатель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "testator", validation: { required: true } },
      { id: "testator_birthdate", label: "Дата рождения", type: "date", defaultValue: "1970-01-15", category: "testator" },
      { id: "testator_passport", label: "Паспорт завещателя", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "testator" },
      { id: "testator_living_address", label: "Адрес регистрации", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "testator" },
      { id: "heir1_fio", label: "Наследник 1 (ФИО)", type: "text", defaultValue: "Петрова Анна Петровна", category: "heir", validation: { required: true } },
      { id: "heir1_share", label: "Доля наследника 1", type: "text", defaultValue: "1/2", category: "heir" },
      { id: "heir2_fio", label: "Наследник 2 (ФИО)", type: "text", defaultValue: "Петров Алексей Петрович", category: "heir" },
      { id: "heir2_share", label: "Доля наследника 2", type: "text", defaultValue: "1/2", category: "heir" },
      { id: "property_desc", label: "Описание имущества", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Примерная, д. 5, кв. 12; автомобиль Kia Rio, гос. номер А123ВС777", category: "property", rows: 2, validation: { required: true } },
      { id: "legacy_refusal", label: "Завещательный отказ / иные распоряжения", type: "textarea", defaultValue: "", category: "property", rows: 2 },
      { id: "notary", label: "Нотариус (ФИО)", type: "text", defaultValue: "Иванова Мария Сергеевна", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "Московский городской нотариальный округ", category: "notary" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Завещание</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{testator_fio}}}</strong>, {{{testator_birthdate}}} года рождения,
    паспорт: {{{testator_passport}}}, зарегистрированный по адресу: {{{testator_living_address}}},
    настоящим завещанием делаю следующее распоряжение (ст. 1118-1120 ГК РФ):
  </p>
  <p class="mb-4 text-justify font-bold">1. Распоряжение об имуществе</p>
  <p class="mb-3 text-justify">Всё имущество, какое на день моей смерти окажется мне принадлежащим, в том числе:
    {{{property_desc}}}, я завещаю:</p>
  <p class="mb-2 text-justify">— {{{heir1_fio}}} — {{{heir1_share}}} (доли);</p>
  {{{#heir2_fio}}}<p class="mb-3 text-justify">— {{{heir2_fio}}} — {{{heir2_share}}} (доли).</p>{{{/heir2_fio}}}
  {{{#legacy_refusal}}}<p class="mb-3 text-justify font-bold">2. Иные распоряжения:</p>
  <p class="mb-3 text-justify">{{{legacy_refusal}}}.</p>{{{/legacy_refusal}}}
  <p class="mb-3 text-justify">
    Содержание ст. 1149 ГК РФ (право на обязательную долю) мне нотариусом разъяснено.
    Настоящее завещание удостоверяется в присутствии нотариуса; личностно совершено в одном экземпляре (ст. 1125 ГК РФ).
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-6">Завещатель: {{{testator_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Удостоверительная надпись</p>
      <p class="text-[10px] text-zinc-500">Нотариус: {{{notary}}} {{{#notary_district}}}<br/>{{{notary_district}}}{{{/notary_district}}}
      <br/>Зарегистрировано в реестре № __________</p>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "Ивановой Марии Сергеевне", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "Московского городского нотариального округа", category: "notary" },
      { id: "heir_fio", label: "Наследник (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "heir", validation: { required: true } },
      { id: "heir_address", label: "Адрес наследника", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "heir" },
      { id: "testator_fio", label: "Наследодатель (ФИО)", type: "text", defaultValue: "Петрова Мария Ивановна", category: "testator", validation: { required: true } },
      { id: "testator_death_date", label: "Дата смерти", type: "date", defaultValue: "2026-05-20", category: "testator" },
      { id: "relation", label: "Родство", type: "text", defaultValue: "мать", category: "testator" },
      { id: "property_desc", label: "Состав наследства", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Примерная, д. 5, кв. 12; денежные вклады в ПАО «Сбербанк»", category: "property", rows: 2, validation: { required: true } },
      { id: "other_heirs", label: "Другие наследники", type: "text", defaultValue: "Петрова Анна Петровна (дочь)", category: "heir" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-8 text-xs font-semibold">
    <p>Нотариусу {{{notary}}}</p>
    <p>{{{notary_district}}}</p>
    <p class="mt-2">от {{{heir_fio}}}</p>
    <p>адрес: {{{heir_address}}}</p>
    <p>тел.: ______________</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о принятии наследства</div>
  <p class="mb-4 text-justify">
    {{{testator_death_date}}} умер(ла) {{{testator_fio}}}, {{{relation}}} наследодателя,
    что подтверждается свидетельством о смерти серия __ № ______.
  </p>
  <p class="mb-4 text-justify">
    На основании ст. 1153 ГК РФ <strong>принимаю</strong> причитающееся мне наследство, которое состоит из:
    {{{property_desc}}}.
  </p>
  <p class="mb-4 text-justify">
    Других наследников не имеется, за исключением: {{{other_heirs}}}.
  </p>
  <p class="mb-4 text-justify">
    Настоящее заявление подаю в течение установленного шестимесячного срока (ст. 1154 ГК РФ).
  </p>
  <div class="flex justify-end text-xs mt-10">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}» г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{heir_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "Ивановой Марии Сергеевне", category: "notary" },
      { id: "notary_district", label: "Нотариальный округ", type: "text", defaultValue: "Московского городского нотариального округа", category: "notary" },
      { id: "heir_fio", label: "Наследник (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "heir", validation: { required: true } },
      { id: "heir_address", label: "Адрес наследника", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "heir" },
      { id: "testator_fio", label: "Наследодатель (ФИО)", type: "text", defaultValue: "Петрова Мария Ивановна", category: "testator", validation: { required: true } },
      { id: "testator_death_date", label: "Дата смерти", type: "date", defaultValue: "2026-05-20", category: "testator" },
      { id: "refuse_to_fio", label: "В чью пользу отказ (если есть)", type: "text", defaultValue: "Петровой Анны Петровны", category: "heir" },
      { id: "property_desc", label: "Состав наследства", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Примерная, д. 5, кв. 12", category: "property", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-8 text-xs font-semibold">
    <p>Нотариусу {{{notary}}}</p>
    <p>{{{notary_district}}}</p>
    <p class="mt-2">от {{{heir_fio}}}</p>
    <p>адрес: {{{heir_address}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление об отказе от наследства</div>
  <p class="mb-4 text-justify">
    {{{testator_death_date}}} умер(ла) {{{testator_fio}}}.
  </p>
  <p class="mb-4 text-justify">
    Я, {{{heir_fio}}}, являясь наследником по закону (завещанию), на основании ст. 1157-1158 ГК РФ
    <strong>отказываюсь от причитающегося мне наследства</strong>, состоящего из: {{{property_desc}}}.
  </p>
  {{{#refuse_to_fio}}}<p class="mb-4 text-justify">Отказ совершён в пользу: {{{refuse_to_fio}}}.</p>{{{/refuse_to_fio}}}
  <p class="mb-4 text-justify">
    Последствия отказа мне разъяснены и понятны. Отказ является безоговорочным и не может быть впоследствии изменён или взят обратно.
  </p>
  <div class="flex justify-end text-xs mt-10">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}» г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{heir_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата согласия", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "spouse1_fio", label: "Супруг 1 (дающий согласие)", type: "text", defaultValue: "Иванов Иван Иванович", category: "spouse1", validation: { required: true } },
      { id: "spouse1_passport", label: "Паспорт супруга 1", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "spouse1" },
      { id: "spouse2_fio", label: "Супруг 2 (покупатель)", type: "text", defaultValue: "Иванова Мария Петровна", category: "spouse2", validation: { required: true } },
      { id: "spouse2_passport", label: "Паспорт супруга 2", type: "text", defaultValue: "45 08 123456, выдан ОВД «Арбат» г. Москвы", category: "spouse2" },
      { id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "2018-06-15", category: "family" },
      { id: "property_desc", label: "Приобретаемый объект", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Ленина, д. 10, кв. 25, площадью 54,3 кв. м, стоимостью 9 500 000 руб., за счёт общих средств супругов", category: "realty", rows: 2, validation: { required: true } },
      { id: "consent_term", label: "Срок действия согласия", type: "text", defaultValue: "6 месяцев с даты удостоверения", category: "contract" },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "нотариус г. Москвы Иванова М.С.", category: "notary" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие супруга на приобретение недвижимости</div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{spouse1_fio}}}</strong> (паспорт: {{{spouse1_passport}}}), состоящий(ая) в зарегистрированном браке
    с <strong>{{{spouse2_fio}}}</strong> (паспорт: {{{spouse2_passport}}}), зарегистрированном {{{marriage_date}}},
    настоящим даю своё нотариальное согласие на приобретение моим(ей) супругом(ой) {{{spouse2_fio}}}:
  </p>
  <p class="font-bold mb-2">Предмет согласия</p>
  <p class="mb-3 text-justify">1. {{{property_desc}}} (ст. 35 СК РФ, ст. 256 ГК РФ).</p>
  <p class="mb-3 text-justify">2. Согласие даётся на совершение сделки купли-продажи на любых условиях по усмотрению супруга(и), в том числе с использованием кредитных (ипотечных) средств.</p>
  <p class="font-bold mb-2">Срок действия</p>
  <p class="mb-3 text-justify">3. Настоящее согласие действительно в течение {{{consent_term}}}.</p>
  <p class="mb-3 text-justify">4. Согласие удостоверено {{{notary}}}. Содержание статей 35 СК РФ, 256 ГК РФ нотариусом разъяснено.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Супруг(а), дающий(ая) согласие: {{{spouse1_fio}}}</p>
    <div class="border-b border-zinc-950 w-56 h-5 mt-5 mb-1"></div>
    <p class="text-zinc-400 text-[10px]">подпись</p>
  </div>
</div>`,
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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "authority_name", label: "Орган опеки", type: "text", defaultValue: "Управление опеки и попечительства района Хамовники г. Москвы", category: "other", validation: { required: true } },
      { id: "authority_inn", label: "ИНН органа (если юрлицо)", type: "text", defaultValue: "7703123456", category: "other" },
      { id: "authority_addr", label: "Адрес органа опеки", type: "text", defaultValue: "г. Москва, ул. Опекина, д. 5", category: "other" },
      { id: "guardian_fio", label: "ФИО опекуна", type: "text", defaultValue: "Савина Ирина Петровна", category: "other", validation: { required: true } },
      { id: "guardian_passport", label: "Паспорт опекуна", type: "text", defaultValue: "4512 963258, выдан ОУФМС России по г. Москве 17.07.2014, к.п. 770-002", category: "other", validation: { required: true } },
      { id: "guardian_addr", label: "Адрес опекуна", type: "text", defaultValue: "г. Москва, ул. Опекунская, д. 8, кв. 12", category: "other" },
      { id: "ward_fio", label: "ФИО подопечного", type: "text", defaultValue: "Савин Николай Алексеевич", category: "child", validation: { required: true } },
      { id: "ward_birth", label: "Дата рождения подопечного", type: "date", defaultValue: "2015-01-10", category: "child", validation: { required: true } },
      { id: "basis", label: "Основание назначения", type: "text", defaultValue: "Решение органа опеки №15 от 01.08.2026, постановление о назначении опекуна", category: "contract", validation: { required: true } },
      { id: "term_start", label: "Дата начала", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания", type: "date", defaultValue: "2028-09-01", category: "contract" },
      { id: "payment", label: "Вознаграждение опекуна", type: "text", defaultValue: "Безвозмездная опека. Ежемесячная выплата на содержание подопечного — 15 000 рублей", category: "payment" },
      { id: "duties", label: "Обязанности опекуна", type: "textarea", defaultValue: "Заботиться о содержании, воспитании, образовании, охранять права и интересы подопечного", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор об осуществлении опеки</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{authority_name}}}</strong> (ИНН {{{authority_inn}}}, адрес: {{{authority_addr}}}), именуемое в дальнейшем «Орган опеки», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{guardian_fio}}}</strong> (паспорт {{{guardian_passport}}}, адрес: {{{guardian_addr}}}), именуемый в дальнейшем «Опекун», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. На основании {{{basis}}} Орган опеки передаёт, а Опекун принимает на себя обязанности по опеке (попечительству) над подопечным {{{ward_fio}}}, {{{ward_birth}}} г.р.</p>
  <p class="mb-4 text-justify">1.2. Срок действия: с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{payment}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности опекуна</div>
  <p class="mb-4 text-justify">2.1. {{{duties}}}.</p>
  <p class="mb-4 text-justify">2.2. Опекун обязан представлять отчёт об использовании имущества подопечного.</p>
  <p class="mb-4 text-justify">2.3. Опекун не вправе совершать сделки с имуществом подопечного без согласия органа опеки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права органа опеки</div>
  <p class="mb-4 text-justify">3.1. Орган опеки вправе осуществлять контроль за условиями жизни подопечного, требовать отчёты.</p>
  <p class="mb-4 text-justify">3.2. Орган опеки вправе досрочно расторгнуть договор при ненадлежащем исполнении обязанностей.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Прекращение договора</div>
  <p class="mb-4 text-justify">4.1. Договор прекращается по истечении срока, при освобождении или отстранении опекуна.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Орган опеки:</div>
      <p class="mb-1"><strong>{{{authority_name}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{authority_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{authority_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Опекун:</div>
      <p class="mb-1"><strong>{{{guardian_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{guardian_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{guardian_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "consenting_fio", label: "ФИО супруга, дающего согласие", type: "text", defaultValue: "Гришина Марина Олеговна", category: "spouse1", validation: { required: true } },
      { id: "consenting_passport", label: "Паспорт супруга", type: "text", defaultValue: "4512 741963, выдан ОУФМС России по г. Москве 22.06.2014, к.п. 770-002", category: "spouse1", validation: { required: true } },
      { id: "consenting_addr", label: "Адрес супруга", type: "text", defaultValue: "г. Москва, ул. Супружеская, д. 2, кв. 9", category: "spouse1" },
      { id: "spouse_fio", label: "ФИО супруга-залогодателя", type: "text", defaultValue: "Гришин Олег Владимирович", category: "spouse2", validation: { required: true } },
      { id: "spouse_passport", label: "Паспорт супруга-залогодателя", type: "text", defaultValue: "4511 654321, выдан ОУФМС России по г. Москве 05.09.2013, к.п. 770-003", category: "spouse2", validation: { required: true } },
      { id: "spouse_addr", label: "Адрес супруга-залогодателя", type: "text", defaultValue: "г. Москва, ул. Супружеская, д. 2, кв. 9", category: "spouse2" },
      { id: "marriage_date", label: "Дата регистрации брака", type: "date", defaultValue: "2015-07-12", category: "family", validation: { required: true } },
      { id: "marriage_cert", label: "Свидетельство о браке", type: "text", defaultValue: "Серия V-МЮ № 123456, выдано 12.07.2015", category: "family", validation: { required: true } },
      { id: "property", label: "Имущество", type: "text", defaultValue: "Квартира по адресу: г. Москва, ул. Супружеская, д. 2, кв. 9", category: "object", validation: { required: true } },
      { id: "secured_debt", label: "Обеспечиваемое обязательство", type: "text", defaultValue: "Кредитный договор с ПАО «Сбербанк» №12345 от 01.08.2026", category: "contract", validation: { required: true } },
      { id: "pledgee", label: "Залогодержатель", type: "text", defaultValue: "ПАО «Сбербанк»", category: "other", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие супруга на залог имущества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{consenting_fio}}}</strong> (паспорт {{{consenting_passport}}}, адрес: {{{consenting_addr}}}), именуемый в дальнейшем «Согласие даёт», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{spouse_fio}}}</strong> (паспорт {{{spouse_passport}}}, адрес: {{{spouse_addr}}}), именуемый в дальнейшем «Супруг (залогодатель)», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет согласия</div>
  <p class="mb-4 text-justify">1.1. Я, {{{consenting_fio}}}, состоящий(ая) в браке с {{{spouse_fio}}} (свидетельство {{{marriage_cert}}} от {{{marriage_date}}}), даю согласие на передачу в залог совместно нажитого имущества: {{{property}}}.</p>
  <p class="mb-4 text-justify">1.2. Обеспечиваемое обязательство: {{{secured_debt}}} перед {{{pledgee}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия</div>
  <p class="mb-4 text-justify">2.1. Согласие даётся на условиях, которые будут определены договором залога.</p>
  <p class="mb-4 text-justify">2.2. Настоящее согласие действительно в течение 6 месяцев с момента выдачи, если иное не установлено.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Подтверждение</div>
  <p class="mb-4 text-justify">3.1. Настоящим подтверждаю, что понимаю правовые последствия передачи имущества в залог, в том числе возможность обращения взыскания на имущество.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Согласие даёт:</div>
      <p class="mb-1"><strong>{{{consenting_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{consenting_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{consenting_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Супруг (залогодатель):</div>
      <p class="mb-1"><strong>{{{spouse_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{spouse_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{spouse_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "sfr_office", label: "Отделение СФР", type: "text", defaultValue: "Отделение СФР по г. Москве и Московской области", category: "other", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Филиппов Борис Геннадьевич", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "1961-04-02", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "123-456-789 01", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "4508 123456, выдан ОУФМС России по г. Москве 15.06.2009, к.п. 770-001", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Пенсионная, д. 4, кв. 77", category: "applicant" },
      { id: "phone", label: "Телефон", type: "text", defaultValue: "+7 (903) 111-22-33", category: "applicant" },
      { id: "pension_type", label: "Вид пенсии", type: "select", defaultValue: "страховая по старости", category: "contract", options: [ { label: "Страховая по старости", value: "страховая по старости" }, { label: "Страховая по инвалидности", value: "страховая по инвалидности" }, { label: "По случаю потери кормильца", value: "по случаю потери кормильца" }, { label: "Социальная", value: "социальная" } ], validation: { required: true } },
      { id: "work_experience", label: "Страховой стаж (лет)", type: "number", defaultValue: "34", category: "applicant" },
      { id: "ipc", label: "ИПК (баллы)", type: "number", defaultValue: "52", category: "applicant" },
      { id: "app_date", label: "Дата обращения", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "delivery_method", label: "Способ доставки", type: "select", defaultValue: "на банковский счёт", category: "contract", options: [ { label: "На банковский счёт", value: "на банковский счёт" }, { label: "Через Почту России", value: "через Почту России" }, { label: "Через организацию", value: "через организацию" } ] },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о назначении пенсии</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу назначить {{{pension_type}}} в соответствии с законодательством РФ.</p>
  <p class="mb-4 text-justify">1.2. Страховой стаж: {{{work_experience}}} лет, ИПК: {{{ipc}}} баллов.</p>
  <p class="mb-4 text-justify">1.3. Способ доставки: {{{delivery_method}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Прилагаемые документы</div>
  <p class="mb-4 text-justify">2.1. Паспорт, СНИЛС, трудовая книжка, справки о стаже и заработке.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Подтверждение</div>
  <p class="mb-4 text-justify">3.1. Обо всех изменениях, влияющих на размер пенсии, обязуюсь сообщать в СФР.</p>

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
    id: "maternity-payment-app",
    name: "Заявление на выплату пособия (декретные)",
    category: "family",
    actSource: "ФЗ-255, ФЗ-81 «О государственных пособиях»",
    lastUpdated: "Август 2026",
    description: "Заявление о назначении пособия по беременности и родам или единовременного пособия при рождении ребёнка.",
    suggestedDocs: ["maternity-leave-app"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "employer_name", label: "Работодатель", type: "text", defaultValue: "ООО «Косметик-Трейд»", category: "employer", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Семёнова Алина Игоревна", category: "applicant", validation: { required: true } },
      { id: "position", label: "Должность", type: "text", defaultValue: "Менеджер отдела продаж", category: "employee" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "4513 456123, выдан ОУФМС России по г. Москве 10.01.2016, к.п. 770-002", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "987-654-321 00", category: "applicant", validation: { required: true } },
      { id: "benefit_type", label: "Вид пособия", type: "select", defaultValue: "по беременности и родам", category: "contract", options: [ { label: "По беременности и родам", value: "по беременности и родам" }, { label: "При рождении ребёнка", value: "при рождении ребёнка" }, { label: "По уходу до 1,5 лет", value: "по уходу до 1,5 лет" }, { label: "Ежемесячное на ребёнка", value: "ежемесячное на ребёнка" } ], validation: { required: true } },
      { id: "sick_list", label: "Листок нетрудоспособности", type: "text", defaultValue: "ЭЛН № 910-123-456 78 от 01.08.2026", category: "contract", validation: { required: true } },
      { id: "maternity_start", label: "Дата начала отпуска", type: "date", defaultValue: "2026-08-01", category: "contract" },
      { id: "maternity_end", label: "Дата окончания отпуска", type: "date", defaultValue: "2026-12-18", category: "contract" },
      { id: "bank_details", label: "Реквизиты для перечисления", type: "text", defaultValue: "Сбербанк, счёт 40817810000000000000, БИК 044525225", category: "payment", validation: { required: true } },
      { id: "child_birth", label: "Дата рождения ребёнка (для пособия при рождении)", type: "date", defaultValue: "2026-08-05", category: "child" },
      { id: "app_date", label: "Дата заявления", type: "date", defaultValue: "2026-08-11", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о назначении пособия</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу назначить и выплатить пособие: {{{benefit_type}}}.</p>
  <p class="mb-4 text-justify">1.2. Листок нетрудоспособности: {{{sick_list}}} (период {{{maternity_start}}} — {{{maternity_end}}}).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Реквизиты</div>
  <p class="mb-4 text-justify">2.1. Перечисление прошу производить: {{{bank_details}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, СНИЛС, справка о рождении ребёнка (при необходимости), заявление на отпуск по беременности и родам.</p>

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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "husband_fio", label: "ФИО супруга", type: "text", defaultValue: "Дорохов Игорь Валентинович", category: "spouse1", validation: { required: true } },
      { id: "husband_passport", label: "Паспорт супруга", type: "text", defaultValue: "4511 321987, выдан ОУФМС России по г. Москве 12.02.2013, к.п. 770-003", category: "spouse1", validation: { required: true } },
      { id: "husband_addr", label: "Адрес супруга", type: "text", defaultValue: "г. Москва, ул. Бюджетная, д. 1, кв. 33", category: "spouse1" },
      { id: "wife_fio", label: "ФИО супруги", type: "text", defaultValue: "Дорохова Юлия Андреевна", category: "spouse2", validation: { required: true } },
      { id: "wife_passport", label: "Паспорт супруги", type: "text", defaultValue: "4513 789123, выдан ОУФМС России по г. Москве 03.04.2016, к.п. 770-002", category: "spouse2", validation: { required: true } },
      { id: "wife_addr", label: "Адрес супруги", type: "text", defaultValue: "г. Москва, ул. Бюджетная, д. 1, кв. 33", category: "spouse2" },
      { id: "expenses_list", label: "Общие расходы", type: "textarea", defaultValue: "Ипотека (50 000), коммунальные (8 000), продукты (40 000), образование детей (25 000), отдых (20 000)", category: "payment", validation: { required: true } },
      { id: "split", label: "Распределение", type: "text", defaultValue: "Супруг — 60%, Супруга — 40% от суммы общих расходов", category: "payment", validation: { required: true } },
      { id: "household_duty", label: "Ведение хозяйства", type: "text", defaultValue: "Ведение домашнего хозяйства — обязанности Супруги, ремонт и технические работы — Супруга", category: "family" },
      { id: "savings", label: "Накопления", type: "text", defaultValue: "10% от доходов каждого ежемесячно на общий сберегательный счёт", category: "payment" },
      { id: "term_end", label: "Срок действия (дата)", type: "date", defaultValue: "2027-08-11", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о несении семейных расходов</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{husband_fio}}}</strong> (паспорт {{{husband_passport}}}, адрес: {{{husband_addr}}}), именуемый в дальнейшем «Супруг», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{wife_fio}}}</strong> (паспорт {{{wife_passport}}}, адрес: {{{wife_addr}}}), именуемый в дальнейшем «Супруга», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">1.1. Супруги устанавливают порядок несения общих семейных расходов: {{{expenses_list}}}.</p>
  <p class="mb-4 text-justify">1.2. Распределение: {{{split}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{savings}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности сторон</div>
  <p class="mb-4 text-justify">2.1. {{{household_duty}}}.</p>
  <p class="mb-4 text-justify">2.2. Каждый супруг вправе распоряжаться личными доходами по своему усмотрению, не ущемляя общих обязательств.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Соглашение действует до {{{term_end}}} и может быть изменено по взаимному согласию.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Супруг:</div>
      <p class="mb-1"><strong>{{{husband_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{husband_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{husband_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Супруга:</div>
      <p class="mb-1"><strong>{{{wife_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{wife_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{wife_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО заявителя", type: "text", defaultValue: "Крылова Ольга Валерьевна", category: "applicant", validation: { required: true } },
      { id: "snils", label: "СНИЛС", type: "text", defaultValue: "123-456-789 01", category: "applicant", validation: { required: true } },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "4513 654123, выдан ОУФМС России по г. Москве 22.05.2016, к.п. 770-002", category: "applicant", validation: { required: true } },
      { id: "certificate", label: "Сертификат МСК", type: "text", defaultValue: "Сертификат № МК-10-123456 от 15.04.2022", category: "contract", validation: { required: true } },
      { id: "direction", label: "Направление средств", type: "select", defaultValue: "улучшение жилищных условий", category: "contract", options: [ { label: "Улучшение жилищных условий", value: "улучшение жилищных условий" }, { label: "Образование ребёнка", value: "образование ребёнка" }, { label: "Ежемесячная выплата", value: "ежемесячная выплата" }, { label: "Социальная адаптация детей-инвалидов", value: "социальная адаптация детей-инвалидов" } ], validation: { required: true } },
      { id: "amount", label: "Сумма (руб.)", type: "number", defaultValue: "300000", category: "payment", validation: { required: true } },
      { id: "purpose_details", label: "Цель использования", type: "textarea", defaultValue: "погашение основного долга по ипотечному кредиту по договору от 10.03.2022 № 14/22", category: "contract", validation: { required: true } },
      { id: "children", label: "Дети", type: "text", defaultValue: "Крылова Алиса Андреевна, 10.02.2020 г.р.; Крылов Марк Андреевич, 05.07.2022 г.р.", category: "child", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление о распоряжении средствами материнского капитала</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Прошу</div>
  <p class="mb-4 text-justify">1.1. Прошу направить средства материнского (семейного) капитала на: {{{direction}}}.</p>
  <p class="mb-4 text-justify">1.2. Сумма: {{{amount}}} руб. Цель использования: {{{purpose_details}}}.</p>
  <p class="mb-4 text-justify">1.3. Сертификат: {{{certificate}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сведения</div>
  <p class="mb-4 text-justify">2.1. Дети: {{{children}}}.</p>
  <p class="mb-4 text-justify">2.2. Обязуюсь оформить жилое помещение в общую собственность всех членов семьи в установленный срок.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прилагаемые документы</div>
  <p class="mb-4 text-justify">3.1. Паспорт, СНИЛС, сертификат МСК, документы по сделке (кредитный договор, выписка из ЕГРН), свидетельства о рождении детей.</p>

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
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО родителя", type: "text", defaultValue: "Соколова Ирина Михайловна", category: "applicant", validation: { required: true } },
      { id: "applicant_birth", label: "Дата рождения", type: "date", defaultValue: "1987-03-25", category: "applicant" },
      { id: "passport", label: "Паспорт", type: "text", defaultValue: "4510 789456, выдан ОУФМС России по г. Москве 10.10.2011, к.п. 770-001", category: "applicant", validation: { required: true } },
      { id: "address", label: "Адрес", type: "text", defaultValue: "г. Москва, ул. Усыновительная, д. 4, кв. 29", category: "applicant" },
      { id: "child", label: "Ребёнок", type: "text", defaultValue: "Соколова Вероника Дмитриевна, 01.01.2015 г.р.", category: "child", validation: { required: true } },
      { id: "adopter", label: "Усыновитель", type: "text", defaultValue: "Орлов Михаил Александрович", category: "other", validation: { required: true } },
      { id: "consent_type", label: "Вид согласия", type: "text", defaultValue: "безусловное согласие на усыновление без указания конкретного лица", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Согласие на усыновление (удочерение) ребёнка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Согласие</div>
  <p class="mb-4 text-justify">1.1. Я, {{{applicant_fio}}}, даю согласие на усыновление (удочерение) моего ребёнка {{{child}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{consent_type}}}. Усыновитель: {{{adopter}}}.</p>
  <p class="mb-4 text-justify">1.3. Согласие дано добровольно, без принуждения, после разъяснения правовых последствий усыновления.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Подтверждение</div>
  <p class="mb-4 text-justify">2.1. Мне известно, что усыновление прекращает правовую связь между мной и ребёнком, а также личные неимущественные и имущественные права (ст. 137 СК РФ).</p>
  <p class="mb-4 text-justify">2.2. Согласие может быть отозвано до вынесения решения суда об усыновлении.</p>
  <p class="mb-4 text-justify">2.3. Согласие дано в присутствии должностного лица органа опеки и попечительства / удостоверено нотариусом.</p>

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
