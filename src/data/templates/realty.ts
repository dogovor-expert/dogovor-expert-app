import type { LegalTemplate } from "../types";

export const TEMPLATES_REALTY: LegalTemplate[] = [
{
    id: "dkp-flat",
    name: "ДКП квартиры (купля-продажа)",
    category: "realty",
    actSource: "ст. 549–558 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор купли-продажи квартиры между физическими лицами. Оформляется в 3-х экземплярах (продавец, покупатель, Росреестр).",
    suggestedDocs: ["raspiska-money", "dsp"],
    printInstruction: "Рекомендуется печатать на листах А4, количество страниц не ограничено",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract", validation: { required: true },
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-06-15",
        category: "contract", validation: { required: true },
      },
      {
        id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "Козлов Дмитрий Андреевич",
        category: "seller", validation: { required: true },
      },
      {
        id: "seller_birthday", label: "Дата рождения продавца", type: "date", defaultValue: "1985-03-12",
        category: "seller",
      },
      {
        id: "seller_passport_series", label: "Паспорт (Серия)", type: "text", defaultValue: "4610",
        category: "seller", validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "seller_passport_number", label: "Паспорт (Номер)", type: "text", defaultValue: "554321",
        category: "seller", validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "seller_passport_issued_by", label: "Кем выдан", type: "text", defaultValue: "ГУ МВД по г. Москве",
        category: "seller",
      },
      {
        id: "seller_passport_date", label: "Дата выдачи паспорта", type: "date", defaultValue: "2010-09-15",
        category: "seller",
      },
      {
        id: "seller_address", label: "Адрес регистрации продавца", type: "text",
        defaultValue: "г. Москва, ул. Тверская, д. 10, кв. 5", category: "seller",
        validation: { required: true },
      },
      {
        id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "Петрова Анна Сергеевна",
        category: "buyer", validation: { required: true },
      },
      {
        id: "buyer_birthday", label: "Дата рождения покупателя", type: "date", defaultValue: "1990-07-22",
        category: "buyer",
      },
      {
        id: "buyer_passport_series", label: "Паспорт (Серия)", type: "text", defaultValue: "4515",
        category: "buyer", validation: { minLength: 4, maxLength: 4 },
      },
      {
        id: "buyer_passport_number", label: "Паспорт (Номер)", type: "text", defaultValue: "112233",
        category: "buyer", validation: { minLength: 6, maxLength: 6 },
      },
      {
        id: "buyer_passport_issued_by", label: "Кем выдан", type: "text", defaultValue: "ГУ МВД по Московской области",
        category: "buyer",
      },
      {
        id: "buyer_passport_date", label: "Дата выдачи паспорта", type: "date", defaultValue: "2015-11-03",
        category: "buyer",
      },
      {
        id: "buyer_address", label: "Адрес регистрации покупателя", type: "text",
        defaultValue: "Московская обл., г. Подольск, ул. Мира, д. 25", category: "buyer",
        validation: { required: true },
      },
      {
        id: "flat_address", label: "Адрес квартиры", type: "text",
        defaultValue: "г. Москва, ул. Арбат, д. 15, кв. 42", category: "object",
        validation: { required: true },
      },
      {
        id: "flat_area", label: "Общая площадь (кв.м)", type: "number", defaultValue: "65.4",
        category: "object", validation: { required: true },
      },
      {
        id: "flat_living_area", label: "Жилая площадь (кв.м)", type: "number", defaultValue: "42.1",
        category: "object",
      },
      {
        id: "flat_rooms", label: "Количество комнат", type: "number", defaultValue: "2",
        category: "object",
      },
      {
        id: "flat_floor", label: "Этаж", type: "number", defaultValue: "5",
        category: "object",
      },
      {
        id: "flat_cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0012005:42",
        category: "object", validation: { required: true },
      },
      {
        id: "flat_doc_basis", label: "Основание возникновения права", type: "text",
        defaultValue: "Договор купли-продажи от 10.01.2018", category: "object",
      },
      {
        id: "flat_encumbrances", label: "Обременения (ипотека, арест и т.д.)", type: "text",
        defaultValue: "Отсутствуют", category: "object",
      },
      {
        id: "contract_price", label: "Стоимость квартиры (руб.)", type: "number", defaultValue: "12500000",
        category: "contract", validation: { required: true },
      },
      {
        id: "contract_price_words", label: "Стоимость прописью", type: "text",
        defaultValue: "Двенадцать миллионов пятьсот тысяч рублей", category: "contract",
      },
      {
        id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "банковский перевод",
        category: "contract",
        options: [
          { label: "Банковский перевод", value: "банковский перевод" },
          { label: "Наличными", value: "наличными" },
          { label: "Ячейка банка", value: "ячейка банка" },
          { label: "Аккредитив", value: "аккредитив" },
        ],
      },
      {
        id: "seller_has_spouse", label: "Продавец состоит в браке", type: "checkbox", defaultValue: "false",
        category: "seller",
      },
      {
        id: "seller_spouse_fio", label: "ФИО супруга(и) продавца", type: "text", defaultValue: "",
        category: "seller",
        dependsOn: { fieldId: "seller_has_spouse", value: "true" },
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи квартиры</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong>, {{{seller_birthday}}} года рождения, паспорт {{{seller_passport_series}}} № {{{seller_passport_number}}}, выдан {{{seller_passport_issued_by}}} {{{seller_passport_date}}}, зарегистрированный по адресу: {{{seller_address}}}, именуемый в дальнейшем «Продавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong>, {{{buyer_birthday}}} года рождения, паспорт {{{buyer_passport_series}}} № {{{buyer_passport_number}}}, выдан {{{buyer_passport_issued_by}}} {{{buyer_passport_date}}}, зарегистрированный по адресу: {{{buyer_address}}}, именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Продавец продал, а Покупатель купил квартиру, расположенную по адресу: <strong>{{{flat_address}}}</strong>, общей площадью {{{flat_area}}} кв.м, жилой площадью {{{flat_living_area}}} кв.м, {{{flat_rooms}}}-комнатную, этаж {{{flat_floor}}}, кадастровый номер {{{flat_cadastral_number}}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Указанная квартира принадлежит Продавцу на основании {{{flat_doc_basis}}}.
  </p>
  <p class="mb-4 text-justify">1.3. Квартира не обременена правами третьих лиц: {{{flat_encumbrances}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена договора и порядок оплаты</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость квартиры составляет <strong>{{{contract_price}}} рублей</strong> (прописью: {{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">
    2.2. Оплата производится путём {{{payment_method}}} в срок до подписания настоящего договора.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Реквизиты и подписи сторон</div>
  
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport_series}}} {{{seller_passport_number}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Продавца</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport_series}}} {{{buyer_passport_number}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_address}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись Покупателя</div>
    </div>
  </div>
</div>`,
  },
{
    id: "rental-flat",
    name: "Договор аренды квартиры",
    category: "realty",
    actSource: "ст. 671-688 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор найма жилого помещения между физическими лицами. Рекомендуется регистрация при сроке более 1 года.",
    suggestedDocs: ["akt-priema-kvartiry"],
    printInstruction: "Печатать в 2-х экземплярах (арендатор, арендодатель)",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "Санкт-Петербург",
        category: "contract", validation: { required: true },
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-06-15",
        category: "contract", validation: { required: true },
      },
      {
        id: "landlord_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "Сидоров Алексей Петрович",
        category: "landlord", validation: { required: true },
      },
      {
        id: "landlord_passport", label: "Паспорт арендодателя", type: "text",
        defaultValue: "серия 4012 № 998877, выдан ГУ МВД по г. Санкт-Петербургу",
        category: "landlord",
      },
      {
        id: "landlord_phone", label: "Телефон арендодателя", type: "text",
        defaultValue: "+7 (812) 555-12-34", category: "landlord",
      },
      {
        id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "Кузнецова Мария Ивановна",
        category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_passport", label: "Паспорт арендатора", type: "text",
        defaultValue: "серия 4515 № 112233, выдан ГУ МВД по Московской области",
        category: "tenant",
      },
      {
        id: "tenant_phone", label: "Телефон арендатора", type: "text",
        defaultValue: "+7 (916) 777-88-99", category: "tenant",
      },
      {
        id: "flat_address", label: "Адрес квартиры", type: "text",
        defaultValue: "г. Санкт-Петербург, Невский пр-т, д. 100, кв. 25", category: "object",
        validation: { required: true },
      },
      {
        id: "flat_area", label: "Площадь (кв.м)", type: "number", defaultValue: "54",
        category: "object",
      },
      {
        id: "lease_start", label: "Дата начала аренды", type: "date", defaultValue: "2026-07-01",
        category: "contract", validation: { required: true },
      },
      {
        id: "lease_end", label: "Дата окончания аренды", type: "date", defaultValue: "2027-06-30",
        category: "contract", validation: { required: true },
      },
      {
        id: "rent_amount", label: "Арендная плата (руб./мес.)", type: "number", defaultValue: "35000",
        category: "payment", validation: { required: true },
      },
      {
        id: "deposit_amount", label: "Залог (руб.)", type: "number", defaultValue: "35000",
        category: "payment",
      },
      {
        id: "utilities_included", label: "Коммунальные услуги включены в арендную плату", type: "checkbox",
        defaultValue: "true", category: "payment",
      },
      {
        id: "utilities_amount", label: "Коммунальные услуги (руб./мес.)", type: "number", defaultValue: "0",
        category: "payment",
        dependsOn: { fieldId: "utilities_included", value: "false" },
      },
      {
        id: "payment_day", label: "День оплаты", type: "number", defaultValue: "5",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор найма (аренды) квартиры</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong>, паспорт {{{landlord_passport}}}, именуемый в дальнейшем «Арендодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong>, паспорт {{{tenant_passport}}}, именуемый в дальнейшем «Арендатор», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное пользование квартиру по адресу: <strong>{{{flat_address}}}</strong>, площадью {{{flat_area}}} кв.м.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок и плата</div>
  <p class="mb-4 text-justify">
    2.1. Срок аренды: с «{{{lease_start}}}» по «{{{lease_end}}}»
  </p>
  <p class="mb-4 text-justify">
    2.2. Арендная плата составляет <strong>{{{rent_amount}}} руб./мес.</strong>, оплата не позднее {{{payment_day}}}-го числа каждого месяца.
  </p>
  <p class="mb-4 text-justify">2.3. Залоговый платёж: {{{deposit_amount}}} руб.</p>
  <p class="mb-4 text-justify">2.4. Коммунальные услуги: {{#utilities_included}}включены в арендную плату ({{{utilities_amount}}} руб./мес.){{/utilities_included}}{{^utilities_included}}оплачиваются отдельно в размере {{{utilities_amount}}} руб./мес.{{/utilities_included}}</p>
  
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
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{landlord_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Тел: {{{landlord_phone}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Тел: {{{tenant_phone}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dsp",
    name: "Договор социального найма (приватизация)",
    category: "realty",
    actSource: "ст. 60-91 ЖК РФ, Закон РФ от 04.07.1991 № 1541-1",
    lastUpdated: "Июнь 2026",
    description:
      "Договор передачи квартиры в собственность граждан (приватизация). Подписывается муниципалитетом и нанимателем.",
    suggestedDocs: ["dkp-flat"],
    printInstruction: "Печатать в 3-х экземплярах",
    fields: [
      {
        id: "city", label: "Город", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-06-15",
        category: "contract",
      },
      {
        id: "tenant_fio", label: "ФИО нанимателя", type: "text", defaultValue: "Козлов Дмитрий Андреевич",
        category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_passport", label: "Паспорт нанимателя", type: "text",
        defaultValue: "серия 4610 № 554321", category: "tenant",
      },
      {
        id: "flat_address", label: "Адрес квартиры", type: "text",
        defaultValue: "г. Москва, ул. Арбат, д. 15, кв. 42", category: "object",
        validation: { required: true },
      },
      {
        id: "flat_area", label: "Общая площадь (кв.м)", type: "number", defaultValue: "65.4",
        category: "object",
      },
      {
        id: "flat_cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0012005:42",
        category: "object",
      },
      {
        id: "order_number", label: "№ Распоряжения", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "order_date", label: "Дата распоряжения", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "municipality", label: "Наименование муниципального образования", type: "text",
        defaultValue: 'муниципальное образование город Москва', category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор передачи квартиры в собственность граждан</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{municipality}}}</strong> в лице уполномоченного органа, с одной стороны, и гражданин <strong>{{{tenant_fio}}}</strong>, паспорт {{{tenant_passport}}}, с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Муниципальное образование передаёт, а гражданин принимает в собственность бесплатно квартиру по адресу: <strong>{{{flat_address}}}</strong>, общей площадью {{{flat_area}}} кв.м, кадастровый номер {{{flat_cadastral_number}}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Основание: Распоряжение {{{order_number}}} от «{{{order_date}}}»
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Переход права собственности</div>
  <p class="mb-4 text-justify">
    2.1. Право собственности возникает с момента государственной регистрации в ЕГРН.
  </p>
  <div class="flex justify-between items-center text-xs mt-12 border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Наниматель:</div>
      <p><strong>{{{tenant_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div class="text-right">
      <div class="font-bold mb-1">Уполномоченный орган:</div>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>

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
</div>`,
  },
{
    id: "rental-commercial",
    name: "Договор аренды нежилого помещения",
    category: "realty",
    actSource: "ст. 606–670 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Аренда офиса или нежилого помещения между арендодателем и арендатором (юрлица и ИП).",
    suggestedDocs: ["rental-flat"],
    printInstruction: "Печатать в 2-х экземплярах",
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
        id: "landlord_company", label: "Наименование Арендодателя", type: "text",
        defaultValue: 'ООО "ПомещенияПлюс"', category: "landlord", validation: { required: true },
      },
      {
        id: "landlord_inn", label: "ИНН Арендодателя", type: "text", defaultValue: "7701112223",
        category: "landlord",
      },
      {
        id: "landlord_director", label: "Директор Арендодателя", type: "text",
        defaultValue: "Петров П.П.", category: "landlord",
      },
      {
        id: "tenant_company", label: "Наименование Арендатора", type: "text",
        defaultValue: 'ООО "Кофе-Нова"', category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_inn", label: "ИНН Арендатора", type: "text", defaultValue: "7703334445",
        category: "tenant",
      },
      {
        id: "tenant_director", label: "Директор Арендатора", type: "text",
        defaultValue: "Иванов И.И.", category: "tenant",
      },
      {
        id: "premises_address", label: "Адрес помещения", type: "text",
        defaultValue: "г. Москва, ул. Б. Дмитровка, д. 20, пом. IV, офис 302", category: "realty",
        validation: { required: true },
      },
      {
        id: "area_sqm", label: "Площадь (кв.м)", type: "number", defaultValue: "85",
        category: "realty",
      },
      {
        id: "purpose", label: "Цель использования", type: "text",
        defaultValue: "Размещение офиса компании", category: "contract",
      },
      {
        id: "rent_price_month", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "120000",
        category: "payment", validation: { required: true },
      },
      {
        id: "utilities", label: "Коммунальные платежи", type: "select",
        options: [
          { label: "Включены в арендную плату", value: "Включены в арендную плату" },
          { label: "Оплачиваются арендатором отдельно по счётчикам", value: "Оплачиваются арендатором отдельно по счётчикам" },
        ],
        defaultValue: "Включены в арендную плату", category: "payment",
      },
      {
        id: "deposit", label: "Обеспечительный платёж (мес.)", type: "number", defaultValue: "1",
        category: "payment",
      },
      {
        id: "term_months", label: "Срок аренды (мес.)", type: "number", defaultValue: "11",
        category: "contract",
      },
      {
        id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "2026-08-01",
        category: "contract",
      },
      {
        id: "notice_days", label: "Уведомление о расторжении (дней)", type: "number", defaultValue: "30",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды нежилого помещения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_company}}}</strong>, ИНН {{{landlord_inn}}}, в лице директора {{{landlord_director}}}, именуемый «Арендодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{tenant_company}}}</strong>, ИНН {{{tenant_inn}}}, в лице директора {{{tenant_director}}}, именуемый «Арендатор», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование помещение площадью {{{area_sqm}}} кв.м по адресу: <strong>{{{premises_address}}}</strong>, для цели: {{{purpose}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{{rent_price_month}}} руб.</strong> в месяц ({{{rent_price_month_words}}}), НДС не облагается.
  </p>
  <p class="mb-4 text-justify">
    2.2. {{{utilities}}}. Обеспечительный платёж: {{{deposit}}} месячной арендной платы, возвращается при окончании срока.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">
    3.1. Срок аренды: {{{term_months}}} месяцев с «{{{start_date}}}».
  </p>
  <p class="mb-4 text-justify">
    3.2. Досрочное расторжение — по письменному уведомлению за {{{notice_days}}} дней.
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
      <div class="font-bold mb-1">Арендодатель:</div>
      <p><strong>{{{landlord_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Арендатор:</div>
      <p><strong>{{{tenant_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "exchange-agreement",
    name: "Договор мены квартир",
    category: "realty",
    actSource: "ст. 567–571 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Обмен квартирами между физическими лицами с возможной доплатой. Сделка у нотариуса.",
    suggestedDocs: ["dkp-flat", "spouse-consent-sell"],
    printInstruction: "Договор в простой письменной форме; регистрация перехода права в Росреестре",
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
        id: "party1_fio", label: "ФИО Стороны 1", type: "text", defaultValue: "Иванов Иван Иванович",
        category: "seller", validation: { required: true },
      },
      {
        id: "party1_passport", label: "Паспорт Стороны 1", type: "text",
        defaultValue: "серия 4510 № 123456", category: "seller",
      },
      {
        id: "party1_flat", label: "Квартира Стороны 1", type: "textarea", rows: 3,
        defaultValue: "2-комн. квартира, 56 кв.м, г. Москва, ул. Тверская, д. 10, кв. 5",
        category: "realty", validation: { required: true },
      },
      {
        id: "party1_cadastral", label: "Кадастровый номер (Сторона 1)", type: "text",
        defaultValue: "77:01:0004022:5555", category: "realty",
      },
      {
        id: "party2_fio", label: "ФИО Стороны 2", type: "text", defaultValue: "Петров Петр Петрович",
        category: "buyer", validation: { required: true },
      },
      {
        id: "party2_passport", label: "Паспорт Стороны 2", type: "text",
        defaultValue: "серия 4510 № 654321", category: "buyer",
      },
      {
        id: "party2_flat", label: "Квартира Стороны 2", type: "textarea", rows: 3,
        defaultValue: "3-комн. квартира, 71 кв.м, г. Москва, ул. Арбат, д. 15, кв. 8",
        category: "realty", validation: { required: true },
      },
      {
        id: "party2_cadastral", label: "Кадастровый номер (Сторона 2)", type: "text",
        defaultValue: "77:01:0004022:6666", category: "realty",
      },
      {
        id: "surcharge", label: "Доплата (руб., 0 при равноценном обмене)", type: "number",
        defaultValue: "500000", category: "payment",
      },
      {
        id: "surcharge_payer", label: "Доплату вносит", type: "select",
        options: [
          { label: "Сторона 2", value: "Сторона 2" },
          { label: "Сторона 1", value: "Сторона 1" },
          { label: "Доплата не предусмотрена", value: "Доплата не предусмотрена" },
        ],
        defaultValue: "Сторона 2", category: "payment",
      },
      {
        id: "notary_note", label: "Нотариальное удостоверение", type: "select",
        options: [
          { label: "Обязуемся удостоверить у нотариуса", value: "Обязуемся удостоверить у нотариуса" },
          { label: "Простая письменная форма", value: "Простая письменная форма" },
        ],
        defaultValue: "Простая письменная форма", category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор мены</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{party1_fio}}}</strong>, паспорт {{{party1_passport}}}, именуемый «Сторона 1», и гражданин <strong>{{{party2_fio}}}</strong>, паспорт {{{party2_passport}}}, именуемый «Сторона 2», заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Сторона 1 передаёт в собственность Стороны 2: <strong>{{{party1_flat}}}</strong>, кадастровый номер {{{party1_cadastral}}}.
  </p>
  <p class="mb-4 text-justify">
    1.2. Сторона 2 передаёт в собственность Стороны 1: <strong>{{{party2_flat}}}</strong>, кадастровый номер {{{party2_cadastral}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Доплата</div>
  <p class="mb-4 text-justify">
    2.1. Ввиду неравноценности обмениваемого имущества {{{surcharge_payer}}} уплачивает доплату в размере <strong>{{{surcharge}}} руб.</strong> ({{{surcharge_words}}}).
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Переход права собственности</div>
  <p class="mb-4 text-justify">
    3.1. Право собственности переходит с момента государственной регистрации в Росреестре.
  </p>
  <p class="mb-4 text-justify">
    3.2. {{{notary_note}}}.
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
      <div class="font-bold mb-1">Сторона 1:</div>
      <p>{{{party1_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Сторона 2:</div>
      <p>{{{party2_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "akt-priema-kvartiry",
    name: "Акт приёма-передачи квартиры",
    category: "realty",
    actSource: "Приложение к договору купли-продажи недвижимости",
    lastUpdated: "Август 2026",
    description:
      "Акт подтверждает передачу квартиры от продавца покупателю и отсутствие взаимных претензий.",
    suggestedDocs: ["dkp-flat"],
    printInstruction: "Печатать в 2-х экземплярах",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата акта", type: "date", defaultValue: "2026-08-20",
        category: "contract",
      },
      {
        id: "contract_date", label: "Дата ДКП", type: "date", defaultValue: "2026-08-10",
        category: "contract",
      },
      {
        id: "seller_fio", label: "ФИО Продавца", type: "text", defaultValue: "Иванов Иван Иванович",
        category: "seller", validation: { required: true },
      },
      {
        id: "buyer_fio", label: "ФИО Покупателя", type: "text", defaultValue: "Петров Петр Петрович",
        category: "buyer", validation: { required: true },
      },
      {
        id: "flat_address", label: "Адрес квартиры", type: "text",
        defaultValue: "г. Москва, ул. Арбат, д. 15, кв. 42", category: "object",
        validation: { required: true },
      },
      {
        id: "flat_area", label: "Общая площадь (кв.м)", type: "number", defaultValue: "65.4",
        category: "object",
      },
      {
        id: "flat_cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0012005:42",
        category: "object",
      },
      {
        id: "keys_qty", label: "Количество комплектов ключей", type: "number", defaultValue: "2",
        category: "object",
      },
      {
        id: "meters_note", label: "Показания счётчиков", type: "text",
        defaultValue: "электроэнергия — 12 345, холодная вода — 80,2, горячая вода — 42,1",
        category: "object",
      },
      {
        id: "claim_note", label: "Претензии (или «не имеет»)", type: "text",
        defaultValue: "Претензий по состоянию, комплектности и расчетам не имеют друг к другу",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приёма-передачи квартиры</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Настоящий акт составлен о том, что Продавец <strong>{{{seller_fio}}}</strong> передал, а Покупатель <strong>{{{buyer_fio}}}</strong> принял в соответствии с договором купли-продажи от «{{{contract_date}}}» квартиру, расположенную по адресу: <strong>{{{flat_address}}}</strong>, общей площадью {{{flat_area}}} кв.м, кадастровый номер {{{flat_cadastral_number}}}.
  </p>
  <p class="mb-4 text-justify">
    Вместе с квартирой переданы ключи в количестве {{{keys_qty}}} комплекта. Показания приборов учёта: {{{meters_note}}}.
  </p>
  <p class="mb-4 text-justify">
    Стороны {{{claim_note}}}. Обязательства по договору купли-продажи сторонами исполнены; с момента подписания акта квартира считается переданной.
  </p>
  <div class="grid grid-cols-2 gap-6 mt-12 text-xs border-t border-zinc-300 pt-4">
    <div><div class="font-bold mb-1">Сдал Продавец:</div><p class="mb-6"><strong>{{{seller_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
    <div><div class="font-bold mb-1">Принял Покупатель:</div><p class="mb-6"><strong>{{{buyer_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
  </div>
</div>`,
  },
{
    id: "lease-house",
    name: "Договор аренды частного дома",
    category: "realty",
    actSource: "гл. 34 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда загородного дома или коттеджа: срок, плата, коммунальные платежи, обязанности сторон.",
    suggestedDocs: ["rental-flat", "akt-priema-kvartiry"],
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
        id: "landlord_fio", label: "ФИО Арендодателя", type: "text", defaultValue: "Смирнов Алексей Викторович",
        category: "landlord", validation: { required: true },
      },
      {
        id: "landlord_passport", label: "Паспорт Арендодателя", type: "text", defaultValue: "4519 741852",
        category: "landlord",
      },
      {
        id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "Кузнецова Ольга Сергеевна",
        category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_passport", label: "Паспорт Арендатора", type: "text", defaultValue: "4598 369258",
        category: "tenant",
      },
      {
        id: "house_address", label: "Адрес дома", type: "text", defaultValue: "Московская обл., д. Петрово, ул. Дачная, д. 12",
        category: "object", validation: { required: true },
      },
      {
        id: "house_area", label: "Площадь дома (кв.м)", type: "number", defaultValue: "120",
        category: "object",
      },
      {
        id: "plot_area", label: "Площадь участка (сот.)", type: "number", defaultValue: "10",
        category: "object",
      },
      {
        id: "rent_amount", label: "Арендная плата (руб./мес)", type: "number", defaultValue: "60000",
        category: "payment", validation: { required: true },
      },
      {
        id: "utilities_payer", label: "Кто платит коммунальные платежи", type: "select",
        defaultValue: "Арендатор оплачивает отдельно по счётчикам",
        category: "payment",
        options: [
          { label: "Арендодатель (включено в плату)", value: "включены в арендную плату" },
          { label: "Арендатор отдельно по счётчикам", value: "Арендатор оплачивает отдельно по счётчикам" },
        ],
      },
      {
        id: "deposit_amount", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "60000",
        category: "payment",
      },
      {
        id: "rent_start", label: "Начало аренды", type: "date", defaultValue: "2026-09-01",
        category: "contract",
      },
      {
        id: "rent_end", label: "Окончание аренды", type: "date", defaultValue: "2027-08-31",
        category: "contract",
      },
      {
        id: "guests_allowed", label: "Разрешено проживать с животными", type: "checkbox", defaultValue: "false",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды жилого дома</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_fio}}}</strong>, паспорт {{{landlord_passport}}}, именуемый(ая) в дальнейшем «Арендодатель», с одной стороны, и <strong>{{{tenant_fio}}}</strong>, паспорт {{{tenant_passport}}}, именуемый(ая) в дальнейшем «Арендатор», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование жилой дом, расположенный по адресу: <strong>{{{house_address}}}</strong>, общей площадью {{{house_area}}} кв.м на земельном участке {{{plot_area}}} соток.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{{rent_amount}}} рублей</strong> ({{{rent_amount_words}}}) в месяц. Коммунальные платежи: {{{utilities_payer}}}.
  </p>
  <p class="mb-4 text-justify">2.2. Обеспечительный платёж в размере {{{deposit_amount}}} рублей вносится при подписании договора и возвращается при отсутствии задолженности.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок аренды</div>
  <p class="mb-4 text-justify">3.1. Договор заключён на срок с {{{rent_start}}} по {{{rent_end}}} и может быть продлён по соглашению сторон.</p>
  <p class="mb-4 text-justify">3.2. {{#guests_allowed}}Проживание с домашними животными разрешено.{{/guests_allowed}}{{^guests_allowed}}Проживание с домашними животными запрещено.{{/guests_allowed}}</p>
  
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
    <div><div class="font-bold mb-1">Арендодатель:</div><p class="mb-1"><strong>{{{landlord_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Арендатор:</div><p class="mb-1"><strong>{{{tenant_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
  },
{
    id: "parking-lease",
    name: "Договор аренды машиноместа",
    category: "realty",
    actSource: "гл. 34 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Аренда машиноместа в паркинге: номер места, плата, правила пользования паркингом.",
    suggestedDocs: ["rental-auto"],
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
        id: "landlord_company", label: "Арендодатель (компания)", type: "text",
        defaultValue: 'ООО "Паркинг-МСК"', category: "landlord", validation: { required: true },
      },
      {
        id: "tenant_fio", label: "ФИО Арендатора", type: "text", defaultValue: "Морозов Игорь Павлович",
        category: "tenant", validation: { required: true },
      },
      {
        id: "tenant_phone", label: "Телефон Арендатора", type: "text", defaultValue: "89161234567",
        category: "tenant",
      },
      {
        id: "car_brand", label: "Марка ТС Арендатора", type: "text", defaultValue: "Toyota Camry",
        category: "vehicle",
      },
      {
        id: "car_plate", label: "Гос. знак ТС", type: "text", defaultValue: "А123ВС777", category: "vehicle",
      },
      {
        id: "parking_address", label: "Адрес паркинга", type: "text",
        defaultValue: "г. Москва, ул. Арбат, д. 15 (подземный паркинг, этаж -2)",
        category: "object", validation: { required: true },
      },
      {
        id: "spot_number", label: "Номер места", type: "text", defaultValue: "А-14", category: "object",
        validation: { required: true },
      },
      {
        id: "rent_amount", label: "Арендная плата (руб./мес)", type: "number", defaultValue: "8000",
        category: "payment", validation: { required: true },
      },
      {
        id: "rent_start", label: "Начало аренды", type: "date", defaultValue: "2026-09-01",
        category: "contract",
      },
      {
        id: "rent_end", label: "Окончание аренды", type: "date", defaultValue: "2027-08-31",
        category: "contract",
      },
      {
        id: "payment_day", label: "День оплаты (число)", type: "number", defaultValue: "5",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды машиноместа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_company}}}</strong>, именуемое в дальнейшем «Арендодатель», и <strong>{{{tenant_fio}}}</strong> (телефон {{{tenant_phone}}}), именуемый в дальнейшем «Арендатор», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Арендодатель передаёт Арендатору во временное пользование машиноместо № <strong>{{{spot_number}}}</strong>, расположенное по адресу: {{{parking_address}}}, для размещения транспортного средства {{{car_brand}}}, гос. номер {{{car_plate}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">
    2.1. Арендная плата составляет <strong>{{{rent_amount}}} рублей</strong> ({{{rent_amount_words}}}) в месяц и вносится ежемесячно не позднее {{{payment_day}}}-го числа текущего месяца.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок договора</div>
  <p class="mb-4 text-justify">3.1. Договор заключён на срок с {{{rent_start}}} по {{{rent_end}}}.</p>
  
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
    <div><div class="font-bold mb-1">Арендодатель:</div><p class="mb-1"><strong>{{{landlord_company}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Арендатор:</div><p class="mb-1"><strong>{{{tenant_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
  },
{
    id: "realty-services",
    name: "Договор оказания риэлторских услуг",
    category: "realty",
    actSource: "ст. 779 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с риэлтором на подбор и сопровождение сделки с недвижимостью: поиск объекта, показы, проверка документов, сопровождение сделки.",
    suggestedDocs: ["act-services"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "agent_fio", label: "Риэлтор (ФИО)", type: "text", defaultValue: "Смирнова Анна Викторовна", category: "agent", validation: { required: true } },
      { id: "agent_company", label: "Агентство (если есть)", type: "text", defaultValue: "ООО «Недвижимость Плюс»", category: "agent" },
      { id: "agent_license", label: "Лицензия/номер в реестре", type: "text", defaultValue: "реестровый № 0001", category: "agent" },
      { id: "client_fio", label: "Заказчик (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "customer" },
      { id: "deal_type", label: "Тип сделки", type: "select", defaultValue: "покупка", category: "items", options: [
        { label: "Покупка", value: "покупка" },
        { label: "Продажа", value: "продажа" },
        { label: "Аренда", value: "аренда" },
      ] },
      { id: "object_type", label: "Вид объекта", type: "select", defaultValue: "квартира", category: "object", options: [
        { label: "Квартира", value: "квартира" },
        { label: "Дом", value: "дом" },
        { label: "Участок", value: "земельный участок" },
        { label: "Коммерческая недвижимость", value: "коммерческая недвижимость" },
      ] },
      { id: "object_address", label: "Район/адрес объекта", type: "text", defaultValue: "г. Москва, ЦАО", category: "object" },
      { id: "budget", label: "Бюджет сделки (руб.)", type: "text", defaultValue: "12000000", category: "payment" },
      { id: "service_price", label: "Вознаграждение (руб.)", type: "text", defaultValue: "300000", category: "payment", validation: { required: true } },
      { id: "service_period", label: "Срок действия", type: "text", defaultValue: "3 месяца", category: "contract" },
      { id: "exclusive", label: "Эксклюзивность", type: "select", defaultValue: "нет", category: "contract", options: [
        { label: "Нет", value: "нет" },
        { label: "Да", value: "да" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания риэлторских услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{agent_fio}}}</strong> ({{{agent_company}}}, {{{agent_license}}}), именуемый «Агент», с одной стороны, и
    <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Агент обязуется оказать услуги по {{deal_type}} объекта недвижимости: {{{object_type}}} {{{#object_address}}}({{{object_address}}}){{{/object_address}}} с бюджетом {{{budget}}} руб.: подбор вариантов, организация показов, проверка юридической чистоты, сопровождение сделки.</p>
  <p class="font-bold mb-2">2. Вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Вознаграждение Агента составляет <strong>{{{service_price}} руб.</strong>} ({{{service_price_words}}}). Вознаграждение выплачивается после заключения сделки.</p>
  <p class="mb-3 text-justify">2.2. Эксклюзивность: {{{exclusive}}}. Договор носит эксклюзивный характер, если это указано в поле «Эксклюзивность».</p>
  <p class="font-bold mb-2">3. Срок действия</p>
  <p class="mb-3 text-justify">3.1. Договор действует {{{service_period}}} с даты подписания.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Агент несёт ответственность за достоверность предоставленной информации и качество услуг в соответствии с законодательством РФ.</p>
  
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
      <p class="font-bold mb-1">Агент:</p>
      <p class="mb-6">{{{agent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{client_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "repair-contract",
    name: "Договор подряда на ремонт квартиры",
    category: "realty",
    actSource: "ст. 702, 740 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на выполнение ремонтно-отделочных работ в квартире: перечень работ, смета, сроки, ответственность подрядчика.",
    suggestedDocs: ["act-works", "contract-works"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "contractor_fio", label: "Подрядчик (ФИО/название)", type: "text", defaultValue: "ИП Смирнов С.С.", category: "contractor", validation: { required: true } },
      { id: "contractor_inn", label: "ИНН подрядчика", type: "text", defaultValue: "7703123456", category: "contractor" },
      { id: "customer_fio", label: "Заказчик (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "customer", validation: { required: true } },
      { id: "flat_address", label: "Адрес объекта", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 12, кв. 45", category: "realty", validation: { required: true } },
      { id: "works_scope", label: "Перечень работ", type: "textarea", defaultValue: "демонтаж старых покрытий, стяжка пола, штукатурка стен, поклейка обоев, укладка ламината, покраска потолков", category: "items", rows: 3, validation: { required: true } },
      { id: "repair_price", label: "Стоимость работ (руб.)", type: "text", defaultValue: "450000", category: "payment", validation: { required: true } },
      { id: "materials_price", label: "Стоимость материалов (руб.)", type: "text", defaultValue: "300000", category: "payment" },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "2026-09-01", category: "contract" },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "2026-11-30", category: "contract" },
      { id: "payment_schedule", label: "График платежей", type: "text", defaultValue: "аванс 30%, далее поэтапно, финальный платёж по акту", category: "payment" },
      { id: "penalty_rate", label: "Неустойка за просрочку (% в день)", type: "text", defaultValue: "0,1", category: "contract" },
      { id: "warranty", label: "Гарантийный срок", type: "text", defaultValue: "24 месяца", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор подряда на ремонт квартиры</div>
  <p class="mb-4 text-justify">
    <strong>{{{contractor_fio}}}</strong> (ИНН {{{contractor_inn}}}), именуемый «Подрядчик», с одной стороны, и
    <strong>{{{customer_fio}}}</strong>, именуемый «Заказчик», с другой стороны, заключили настоящий договор (ст. 702, 740 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Подрядчик обязуется выполнить ремонтно-отделочные работы в квартире по адресу: {{{flat_address}}}: {{{works_scope}}}, а Заказчик — принять результат и оплатить.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Стоимость работ: <strong>{{{repair_price}} руб.</strong>} ({{{repair_price_words}}}), материалов: {{{materials_price}}} руб. График платежей: {{{payment_schedule}}}.</p>
  <p class="font-bold mb-2">3. Сроки выполнения</p>
  <p class="mb-3 text-justify">3.1. Начало: «{{{start_date}}}», окончание: «{{{end_date}}}». За просрочку Подрядчик уплачивает неустойку {{{penalty_rate}}}% от стоимости работ за каждый день просрочки (ст. 708 ГК РФ).</p>
  <p class="font-bold mb-2">4. Гарантии качества</p>
  <p class="mb-3 text-justify">4.1. Гарантийный срок: {{{warranty}}}. Недостатки, обнаруженные в этот период, устраняются Подрядчиком за свой счёт (ст. 723, 755 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Работы считаются принятыми с момента подписания акта выполненных работ.</p>
  
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
      <p class="font-bold mb-1">Подрядчик:</p>
      <p class="mb-6">{{{contractor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-nonresidential",
    name: "Договор купли-продажи нежилого помещения",
    category: "realty",
    actSource: "ст. 454, 549-558 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи нежилого помещения (офиса, магазина, склада) с обязательной госрегистрацией перехода права.",
    suggestedDocs: ["dkp-flat", "akt-priema-kvartiry", "spouse-consent-sell"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "seller_fio", label: "Продавец", type: "text", defaultValue: "ООО «КоммерсИнвест»", category: "seller", validation: { required: true } },
      { id: "seller_inn", label: "ИНН Продавца", type: "text", defaultValue: "7701112223", category: "seller" },
      { id: "buyer_fio", label: "Покупатель", type: "text", defaultValue: "ИП Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "buyer_inn", label: "ИНН Покупателя", type: "text", defaultValue: "770312345678", category: "buyer" },
      { id: "premises_address", label: "Адрес помещения", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 5, пом. I", category: "realty", validation: { required: true } },
      { id: "premises_area", label: "Площадь (кв. м)", type: "text", defaultValue: "120,5", category: "realty" },
      { id: "cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001001:1234", category: "realty" },
      { id: "dkp_price", label: "Цена (руб.)", type: "text", defaultValue: "25000000", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок расчётов", type: "text", defaultValue: "безналичный расчёт в течение 5 рабочих дней после госрегистрации", category: "payment" },
      { id: "transfer_date", label: "Дата передачи", type: "date", defaultValue: "2026-09-10", category: "contract" },
      { id: "encumbrances", label: "Обременения", type: "textarea", defaultValue: "отсутствуют", category: "realty", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи нежилого помещения</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (ИНН {{{seller_inn}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong> (ИНН {{{buyer_inn}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор (ст. 454, 549-558 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Продавец обязуется передать в собственность Покупателя нежилое помещение, расположенное по адресу: {{{premises_address}}}, общей площадью {{{premises_area}}} кв. м, кадастровый номер {{{cadastral_number}}}, а Покупатель — принять и оплатить его.</p>
  <p class="mb-3 text-justify">1.2. Обременения: {{{encumbrances}}}.</p>
  <p class="font-bold mb-2">2. Цена договора</p>
  <p class="mb-3 text-justify">2.1. Цена помещения: <strong>{{{dkp_price}} руб.</strong>} ({{{dkp_price_words}}}). Порядок расчётов: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Передача помещения</p>
  <p class="mb-3 text-justify">3.1. Помещение передаётся по передаточному акту не позднее «{{{transfer_date}}}» (ст. 556 ГК РФ).</p>
  <p class="font-bold mb-2">4. Государственная регистрация</p>
  <p class="mb-3 text-justify">4.1. Переход права собственности подлежит государственной регистрации в Росреестре (ст. 551 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Продавец:</p>
      <p class="mb-6">{{{seller_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Покупатель:</p>
      <p class="mb-6">{{{buyer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "gift-flat",
    name: "Договор дарения квартиры",
    category: "realty",
    actSource: "ст. 572-581 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор дарения квартиры между близкими родственниками или иными лицами с обязательной госрегистрацией перехода права.",
    suggestedDocs: ["gift-agreement", "akt-priema-kvartiry"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "donor_fio", label: "Даритель (ФИО)", type: "text", defaultValue: "Иванова Анна Петровна", category: "donor", validation: { required: true } },
      { id: "donor_passport", label: "Паспорт дарителя", type: "text", defaultValue: "45 09 111222, выдан ОВД «Мещанский» г. Москвы", category: "donor" },
      { id: "donee_fio", label: "Одаряемый (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "donee", validation: { required: true } },
      { id: "donee_passport", label: "Паспорт одаряемого", type: "text", defaultValue: "45 10 333444, выдан ОВД «Тверской» г. Москвы", category: "donee" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Примерная, д. 5, кв. 12", category: "realty", validation: { required: true } },
      { id: "flat_area", label: "Площадь (кв. м)", type: "text", defaultValue: "54,2", category: "realty" },
      { id: "cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001001:5678", category: "realty" },
      { id: "relationship", label: "Степень родства", type: "text", defaultValue: "мать — сын (близкие родственники, НДФЛ не уплачивается)", category: "family" },
      { id: "encumbrances", label: "Обременения", type: "textarea", defaultValue: "отсутствуют; в квартире зарегистрирован даритель", category: "realty", rows: 2 },
      { id: "retention_right", label: "Право проживания дарителя", type: "select", defaultValue: "да, сохраняется пожизненно", category: "realty", options: [
        { label: "Да, сохраняется пожизненно", value: "да, сохраняется пожизненно" },
        { label: "Нет, не сохраняется", value: "нет, не сохраняется" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения квартиры</div>
  <p class="mb-4 text-justify">
    Гражданка <strong>{{{donor_fio}}}</strong> (паспорт {{{donor_passport}}}), именуемая «Даритель», с одной стороны, и
    гражданин <strong>{{{donee_fio}}}</strong> (паспорт {{{donee_passport}}}), именуемый «Одаряемый», с другой стороны,
    заключили настоящий договор (ст. 572-581 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Даритель безвозмездно передаёт в собственность Одаряемого квартиру, расположенную по адресу: {{{flat_address}}}, общей площадью {{{flat_area}}} кв. м, кадастровый номер {{{cadastral_number}}}.</p>
  <p class="mb-3 text-justify">1.2. Обременения: {{{encumbrances}}}.</p>
  <p class="font-bold mb-2">2. Право проживания</p>
  <p class="mb-3 text-justify">2.1. {{{retention_right}}}.</p>
  <p class="font-bold mb-2">3. Стороны</p>
  <p class="mb-3 text-justify">3.1. Стороны: {{{relationship}}}. Настоящий договор не может быть расторгнут по требованию Дарителя, за исключением случаев, предусмотренных ст. 578 ГК РФ.</p>
  <p class="font-bold mb-2">4. Регистрация</p>
  <p class="mb-3 text-justify">4.1. Переход права собственности подлежит государственной регистрации в Росреестре (ст. 574 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Даритель:</p>
      <p class="mb-6">{{{donor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Одаряемый:</p>
      <p class="mb-6">{{{donee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "gift-land",
    name: "Договор дарения земельного участка",
    category: "realty",
    actSource: "ст. 572-581 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор дарения земельного участка: категория земель, кадастровый номер, госрегистрация перехода права.",
    suggestedDocs: ["gift-agreement", "dkp-land"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "donor_fio", label: "Даритель (ФИО)", type: "text", defaultValue: "Петров Николай Иванович", category: "donor", validation: { required: true } },
      { id: "donee_fio", label: "Одаряемый (ФИО)", type: "text", defaultValue: "Петрова Мария Николаевна", category: "donee", validation: { required: true } },
      { id: "land_address", label: "Адрес/местоположение участка", type: "text", defaultValue: "Московская обл., Раменский р-н, с/т «Берёзка», уч. 15", category: "realty", validation: { required: true } },
      { id: "land_area", label: "Площадь (соток/кв. м)", type: "text", defaultValue: "6 соток (600 кв. м)", category: "realty" },
      { id: "cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "50:23:0010203:45", category: "realty" },
      { id: "land_category", label: "Категория земель", type: "text", defaultValue: "земли сельскохозяйственного назначения", category: "realty" },
      { id: "permitted_use", label: "Вид разрешённого использования", type: "text", defaultValue: "для ведения садоводства", category: "realty" },
      { id: "buildings", label: "Строения на участке", type: "text", defaultValue: "садовый дом (без регистрации права)", category: "realty" },
      { id: "relationship", label: "Степень родства", type: "text", defaultValue: "отец — дочь", category: "family" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения земельного участка</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{donor_fio}}}</strong>, именуемый «Даритель», с одной стороны, и
    гражданка <strong>{{{donee_fio}}}</strong>, именуемая «Одаряемый», с другой стороны,
    заключили настоящий договор (ст. 572-581 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Даритель безвозмездно передаёт в собственность Одаряемого земельный участок, расположенный по адресу: {{{land_address}}}, площадью {{{land_area}}}, кадастровый номер {{{cadastral_number}}}, категория земель: {{{land_category}}}, вид разрешённого использования: {{{permitted_use}}}.</p>
  <p class="mb-3 text-justify">1.2. На участке расположены: {{{buildings}}}.</p>
  <p class="font-bold mb-2">2. Стороны</p>
  <p class="mb-3 text-justify">2.1. Стороны: {{{relationship}}}. Участок не обременён правами третьих лиц.</p>
  <p class="font-bold mb-2">3. Регистрация</p>
  <p class="mb-3 text-justify">3.1. Переход права собственности подлежит государственной регистрации в Росреестре (ст. 574 ГК РФ).</p>
  
  <p class="font-bold mb-2">4. Форс-мажор</p>
  <p class="mb-3 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">5. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Даритель:</p>
      <p class="mb-6">{{{donor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Одаряемый:</p>
      <p class="mb-6">{{{donee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "gift-house",
    name: "Договор дарения жилого дома",
    category: "realty",
    actSource: "ст. 572-581 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор дарения жилого дома с земельным участком: безвозмездная передача недвижимости с госрегистрацией.",
    suggestedDocs: ["gift-agreement", "gift-land"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "donor_fio", label: "Даритель (ФИО)", type: "text", defaultValue: "Иванов Иван Петрович", category: "donor", validation: { required: true } },
      { id: "donee_fio", label: "Одаряемый (ФИО)", type: "text", defaultValue: "Иванова Анна Ивановна", category: "donee", validation: { required: true } },
      { id: "house_address", label: "Адрес дома", type: "text", defaultValue: "Московская обл., г. Раменское, ул. Садовая, д. 8", category: "realty", validation: { required: true } },
      { id: "house_area", label: "Площадь дома (кв. м)", type: "text", defaultValue: "98,4", category: "realty" },
      { id: "land_area", label: "Площадь участка (соток)", type: "text", defaultValue: "10", category: "realty" },
      { id: "cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "50:23:0000000:123", category: "realty" },
      { id: "relationship", label: "Степень родства", type: "text", defaultValue: "отец — дочь", category: "family" },
      { id: "encumbrances", label: "Обременения", type: "textarea", defaultValue: "отсутствуют; в доме зарегистрирован даритель", category: "realty", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения жилого дома</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{donor_fio}}}</strong>, именуемый «Даритель», с одной стороны, и
    гражданка <strong>{{{donee_fio}}}</strong>, именуемая «Одаряемый», с другой стороны,
    заключили настоящий договор (ст. 572-581 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Даритель безвозмездно передаёт в собственность Одаряемого жилой дом, расположенный по адресу: {{{house_address}}}, общей площадью {{{house_area}}} кв. м, а также земельный участок площадью {{{land_area}}} соток, кадастровый номер {{{cadastral_number}}}, на котором расположен дом.</p>
  <p class="mb-3 text-justify">1.2. Обременения: {{{encumbrances}}}.</p>
  <p class="font-bold mb-2">2. Стороны</p>
  <p class="mb-3 text-justify">2.1. Стороны: {{{relationship}}}. Договор заключён безвозмездно (ст. 572 ГК РФ).</p>
  <p class="font-bold mb-2">3. Регистрация</p>
  <p class="mb-3 text-justify">3.1. Переход права собственности подлежит государственной регистрации в Росреестре.</p>
  
  <p class="font-bold mb-2">4. Форс-мажор</p>
  <p class="mb-3 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">5. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Даритель:</p>
      <p class="mb-6">{{{donor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Одаряемый:</p>
      <p class="mb-6">{{{donee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "land-lease",
    name: "Договор аренды земельного участка",
    category: "realty",
    actSource: "ст. 606-625 ГК РФ, ст. 22 ЗК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды земельного участка: цель использования, срок, арендная плата, регистрация долгосрочной аренды.",
    suggestedDocs: ["rental-commercial", "dkp-land"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "landlord_fio", label: "Арендодатель", type: "text", defaultValue: "Администрация г. Раменское", category: "landlord", validation: { required: true } },
      { id: "landlord_inn", label: "ИНН Арендодателя", type: "text", defaultValue: "5040000000", category: "landlord" },
      { id: "tenant_fio", label: "Арендатор", type: "text", defaultValue: "ИП Петров Пётр Петрович", category: "tenant", validation: { required: true } },
      { id: "tenant_inn", label: "ИНН Арендатора", type: "text", defaultValue: "770312345678", category: "tenant" },
      { id: "land_address", label: "Местоположение участка", type: "text", defaultValue: "Московская обл., Раменский р-н, вблизи д. Кузнецово", category: "realty", validation: { required: true } },
      { id: "land_area", label: "Площадь (кв. м)", type: "text", defaultValue: "1500", category: "realty" },
      { id: "cadastral_number", label: "Кадастровый номер", type: "text", defaultValue: "50:23:0010203:100", category: "realty" },
      { id: "land_use", label: "Цель использования", type: "text", defaultValue: "строительство склада", category: "realty", validation: { required: true } },
      { id: "rent_amount", label: "Арендная плата (руб./мес)", type: "text", defaultValue: "50000", category: "payment", validation: { required: true } },
      { id: "rent_period", label: "Срок аренды", type: "text", defaultValue: "11 месяцев", category: "contract" },
      { id: "payment_day", label: "Срок оплаты", type: "text", defaultValue: "до 10 числа текущего месяца", category: "payment" },
      { id: "penalty", label: "Неустойка (% в день)", type: "text", defaultValue: "0,1", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды земельного участка</div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_fio}}}</strong> (ИНН {{{landlord_inn}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{tenant_fio}}}</strong> (ИНН {{{tenant_inn}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор (ст. 606-625 ГК РФ, ст. 22 ЗК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель предоставляет Арендатору за плату во временное владение и пользование земельный участок, расположенный по адресу: {{{land_address}}}, площадью {{{land_area}}} кв. м, кадастровый номер {{{cadastral_number}}}, для использования в целях: {{{land_use}}}.</p>
  <p class="font-bold mb-2">2. Арендная плата</p>
  <p class="mb-3 text-justify">2.1. Арендная плата составляет <strong>{{{rent_amount}} руб.</strong>} в месяц, вносится {{{payment_day}}}. За просрочку начисляется неустойка {{{penalty}}}% в день (ст. 614 ГК РФ).</p>
  <p class="font-bold mb-2">3. Срок аренды</p>
  <p class="mb-3 text-justify">3.1. Срок аренды: {{{rent_period}}}. Договор подлежит государственной регистрации, если срок аренды составляет более года (ст. 26 ЗК РФ, ст. 651 ГК РФ).</p>
  <p class="font-bold mb-2">4. Обязанности Арендатора</p>
  <p class="mb-3 text-justify">4.1. Арендатор обязан использовать участок по целевому назначению, соблюдать требования законодательства, не допускать ухудшения состояния земель (ст. 42 ЗК РФ).</p>
  
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
      <p class="mb-6">{{{landlord_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "sublease",
    name: "Договор субаренды нежилого помещения",
    category: "realty",
    actSource: "ст. 615 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор субаренды нежилого помещения с согласия арендодателя: передача помещения в пользование субарендатору.",
    suggestedDocs: ["rental-commercial", "rental-flat"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "tenant_fio", label: "Арендатор (основной)", type: "text", defaultValue: "ООО «ТоргСервис»", category: "tenant", validation: { required: true } },
      { id: "tenant_inn", label: "ИНН Арендатора", type: "text", defaultValue: "7705556677", category: "tenant" },
      { id: "subtenant_fio", label: "Субарендатор", type: "text", defaultValue: "ИП Сидоров Сидор Сидорович", category: "tenant", validation: { required: true } },
      { id: "subtenant_inn", label: "ИНН Субарендатора", type: "text", defaultValue: "770988776655", category: "tenant" },
      { id: "main_lease", label: "Основной договор аренды", type: "text", defaultValue: "№ А-45 от 01.03.2026 с ООО «Владелец»", category: "contract" },
      { id: "consent", label: "Согласие арендодателя", type: "text", defaultValue: "получено письменно от 05.08.2026 № 12", category: "contract" },
      { id: "premises_address", label: "Адрес помещения", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 5, пом. II", category: "realty", validation: { required: true } },
      { id: "premises_area", label: "Площадь (кв. м)", type: "text", defaultValue: "60", category: "realty" },
      { id: "rent_amount", label: "Субарендная плата (руб./мес)", type: "text", defaultValue: "45000", category: "payment", validation: { required: true } },
      { id: "rent_period", label: "Срок субаренды", type: "text", defaultValue: "до окончания основного договора аренды (28.02.2027)", category: "contract" },
      { id: "use_purpose", label: "Цель использования", type: "text", defaultValue: "размещение офиса", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор субаренды нежилого помещения</div>
  <p class="mb-4 text-justify">
    <strong>{{{tenant_fio}}}</strong> (ИНН {{{tenant_inn}}}), именуемый «Арендатор», с одной стороны, и
    <strong>{{{subtenant_fio}}}</strong> (ИНН {{{subtenant_inn}}}), именуемый «Субарендатор», с другой стороны,
    заключили настоящий договор (ст. 615 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендатор передаёт Субарендатору во временное пользование нежилое помещение по адресу: {{{premises_address}}}, площадью {{{premises_area}}} кв. м, для использования в целях: {{{use_purpose}}}.</p>
  <p class="mb-3 text-justify">1.2. Помещение находится в аренде у Арендатора по договору {{{main_lease}}}. Согласие арендодателя на субаренду: {{{consent}}} (ст. 615 ГК РФ).</p>
  <p class="font-bold mb-2">2. Плата</p>
  <p class="mb-3 text-justify">2.1. Субарендная плата: <strong>{{{rent_amount}} руб.</strong>} в месяц, включая коммунальные услуги.</p>
  <p class="font-bold mb-2">3. Срок</p>
  <p class="mb-3 text-justify">3.1. Срок субаренды: {{{rent_period}}}. Договор субаренды прекращается при прекращении основного договора аренды.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За неисполнение обязательств стороны несут ответственность в соответствии с законодательством РФ.</p>
  
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
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Субарендатор:</p>
      <p class="mb-6">{{{subtenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "tenancy-room",
    name: "Договор найма комнаты",
    category: "realty",
    actSource: "ст. 671-688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор найма комнаты в коммунальной квартире или квартире: плата, срок, права и обязанности нанимателя и наймодателя.",
    suggestedDocs: ["rental-flat", "akt-priema-kvartiry"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "landlord_fio", label: "Наймодатель (ФИО)", type: "text", defaultValue: "Соколова Елена Викторовна", category: "landlord", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт наймодателя", type: "text", defaultValue: "45 07 223344, выдан ОВД «Аэропорт» г. Москвы", category: "landlord" },
      { id: "tenant_fio", label: "Наниматель (ФИО)", type: "text", defaultValue: "Козлов Дмитрий Андреевич", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт нанимателя", type: "text", defaultValue: "45 12 556677, выдан ОВД «Якиманка» г. Москвы", category: "tenant" },
      { id: "room_address", label: "Адрес", type: "text", defaultValue: "г. Москва, Ленинградский пр-т, д. 30, кв. 15", category: "realty", validation: { required: true } },
      { id: "room_desc", label: "Описание комнаты", type: "text", defaultValue: "комната 14 кв. м в 2-комнатной квартире", category: "realty" },
      { id: "rent_amount", label: "Плата (руб./мес)", type: "text", defaultValue: "25000", category: "payment", validation: { required: true } },
      { id: "rent_period", label: "Срок найма", type: "text", defaultValue: "11 месяцев", category: "contract" },
      { id: "payment_day", label: "Срок внесения платы", type: "text", defaultValue: "до 5 числа текущего месяца", category: "payment" },
      { id: "deposit", label: "Залог (руб.)", type: "text", defaultValue: "25000", category: "payment" },
      { id: "utilities", label: "Коммунальные платежи", type: "text", defaultValue: "включены в плату", category: "payment" },
      { id: "guests", label: "Проживание гостей", type: "text", defaultValue: "допускается с согласия наймодателя", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор найма комнаты</div>
  <p class="mb-4 text-justify">
    Гражданка <strong>{{{landlord_fio}}}</strong> (паспорт {{{landlord_passport}}}), именуемая «Наймодатель», с одной стороны, и
    гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}), именуемый «Наниматель», с другой стороны,
    заключили настоящий договор (ст. 671-688 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Наймодатель предоставляет Нанимателю за плату во владение и пользование жилое помещение: {{{room_desc}}}, расположенное по адресу: {{{room_address}}}.</p>
  <p class="font-bold mb-2">2. Плата</p>
  <p class="mb-3 text-justify">2.1. Плата за жилое помещение: <strong>{{{rent_amount}} руб.</strong>} в месяц, вносится {{{payment_day}}}. Коммунальные платежи: {{{utilities}}}. Залог: {{{deposit}}} руб., возвращается при выезде с учётом состояния помещения.</p>
  <p class="font-bold mb-2">3. Срок найма</p>
  <p class="mb-3 text-justify">3.1. Срок найма: {{{rent_period}}} (ст. 683 ГК РФ). Наймодатель вправе предупредить о расторжении договора за 3 месяца (ст. 684 ГК РФ).</p>
  <p class="font-bold mb-2">4. Обязанности Нанимателя</p>
  <p class="mb-3 text-justify">4.1. Наниматель обязан использовать помещение по назначению, соблюдать правила общежития, {{{guests}}}, поддерживать помещение в исправном состоянии.</p>
  
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
      <p class="font-bold mb-1">Наймодатель:</p>
      <p class="mb-6">{{{landlord_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Наниматель:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "tenancy-house",
    name: "Договор найма дома",
    category: "realty",
    actSource: "ст. 671-688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор найма жилого дома с придомовым участком: состав платы, срок, порядок расторжения.",
    suggestedDocs: ["rental-flat", "lease-house"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "landlord_fio", label: "Наймодатель (ФИО)", type: "text", defaultValue: "Морозов Сергей Алексеевич", category: "landlord", validation: { required: true } },
      { id: "tenant_fio", label: "Наниматель (ФИО)", type: "text", defaultValue: "Волкова Татьяна Игоревна", category: "tenant", validation: { required: true } },
      { id: "house_address", label: "Адрес дома", type: "text", defaultValue: "Московская обл., Истринский р-н, д. Дубровка, ул. Цветочная, д. 3", category: "realty", validation: { required: true } },
      { id: "house_desc", label: "Описание дома", type: "text", defaultValue: "двухэтажный дом 120 кв. м с участком 8 соток", category: "realty" },
      { id: "rent_amount", label: "Плата (руб./мес)", type: "text", defaultValue: "60000", category: "payment", validation: { required: true } },
      { id: "utilities", label: "Коммунальные платежи", type: "select", defaultValue: "оплачиваются нанимателем отдельно", category: "payment", options: [
        { label: "Включены в плату", value: "включены в плату" },
        { label: "Оплачиваются нанимателем отдельно", value: "оплачиваются нанимателем отдельно" },
      ] },
      { id: "rent_period", label: "Срок найма", type: "text", defaultValue: "11 месяцев", category: "contract" },
      { id: "payment_day", label: "Срок внесения платы", type: "text", defaultValue: "до 10 числа", category: "payment" },
      { id: "deposit", label: "Залог (руб.)", type: "text", defaultValue: "60000", category: "payment" },
      { id: "tenants_count", label: "Количество проживающих", type: "text", defaultValue: "2", category: "tenant" },
      { id: "pets", label: "Домашние животные", type: "select", defaultValue: "разрешены с согласия наймодателя", category: "contract", options: [
        { label: "Разрешены", value: "разрешены" },
        { label: "Разрешены с согласия наймодателя", value: "разрешены с согласия наймодателя" },
        { label: "Запрещены", value: "запрещены" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор найма дома</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong>, именуемый «Наймодатель», с одной стороны, и
    гражданка <strong>{{{tenant_fio}}}</strong>, именуемая «Наниматель», с другой стороны,
    заключили настоящий договор (ст. 671-688 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Наймодатель предоставляет Нанимателю за плату во владение и пользование жилой дом: {{{house_desc}}}, расположенный по адресу: {{{house_address}}}, для проживания {{{tenants_count}}} человек.</p>
  <p class="font-bold mb-2">2. Плата</p>
  <p class="mb-3 text-justify">2.1. Плата: <strong>{{{rent_amount}} руб.</strong>} в месяц, вносится {{{payment_day}}}. Коммунальные платежи: {{{utilities}}}. Залог: {{{deposit}}} руб.</p>
  <p class="font-bold mb-2">3. Срок найма</p>
  <p class="mb-3 text-justify">3.1. Срок найма: {{{rent_period}}} (ст. 683 ГК РФ). При отсутствии новых условий договор считается продлённым на тот же срок (ст. 684 ГК РФ).</p>
  <p class="font-bold mb-2">4. Особые условия</p>
  <p class="mb-3 text-justify">4.1. Домашние животные: {{{pets}}}. Наниматель обязан поддерживать дом и участок в надлежащем состоянии, производить текущий ремонт за свой счёт.</p>
  
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
      <p class="font-bold mb-1">Наймодатель:</p>
      <p class="mb-6">{{{landlord_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Наниматель:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "free-use-contract",
    name: "Договор безвозмездного пользования (ссуда)",
    category: "realty",
    actSource: "ст. 689-701 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор ссуды: ссудодатель передаёт вещь в безвозмездное временное пользование ссудополучателю.",
    suggestedDocs: ["rental-flat", "rental-commercial"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Ссудодатель", type: "text", defaultValue: "ООО «Владелец»", category: "landlord", validation: { required: true } },
      { id: "lender_inn", label: "ИНН Ссудодателя", type: "text", defaultValue: "7701112223", category: "landlord" },
      { id: "borrower_fio", label: "Ссудополучатель", type: "text", defaultValue: "ИП Петров Пётр Петрович", category: "tenant", validation: { required: true } },
      { id: "borrower_inn", label: "ИНН Ссудополучателя", type: "text", defaultValue: "770312345678", category: "tenant" },
      { id: "thing_desc", label: "Описание вещи", type: "textarea", defaultValue: "нежилое помещение площадью 40 кв. м по адресу: г. Москва, ул. Ленина, д. 10", category: "items", rows: 2, validation: { required: true } },
      { id: "use_purpose", label: "Цель использования", type: "text", defaultValue: "размещение шоурума", category: "contract", validation: { required: true } },
      { id: "loan_period", label: "Срок безвозмездного пользования", type: "text", defaultValue: "12 месяцев", category: "contract" },
      { id: "operating_costs", label: "Эксплуатационные расходы", type: "text", defaultValue: "несёт ссудополучатель", category: "payment" },
      { id: "repair_order", label: "Ремонт", type: "text", defaultValue: "текущий — ссудополучатель, капитальный — ссудодатель", category: "contract" },
      { id: "responsibility", label: "Ответственность за ущерб", type: "text", defaultValue: "ссудополучатель отвечает за ущерб при обычном использовании (ст. 697 ГК РФ)", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор безвозмездного пользования (ссуда)</div>
  <p class="mb-4 text-justify">
    <strong>{{{lender_fio}}}</strong> (ИНН {{{lender_inn}}}), именуемый «Ссудодатель», с одной стороны, и
    <strong>{{{borrower_fio}}}</strong> (ИНН {{{borrower_inn}}}), именуемый «Ссудополучатель», с другой стороны,
    заключили настоящий договор (ст. 689-701 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Ссудодатель передаёт в безвозмездное временное пользование Ссудополучателю: {{{thing_desc}}}, для использования в целях: {{{use_purpose}}}.</p>
  <p class="font-bold mb-2">2. Срок</p>
  <p class="mb-3 text-justify">2.1. Срок безвозмездного пользования: {{{loan_period}}}. Каждая сторона вправе отказаться от договора, предупредив другую сторону за 1 месяц (ст. 699 ГК РФ).</p>
  <p class="font-bold mb-2">3. Расходы и ремонт</p>
  <p class="mb-3 text-justify">3.1. Эксплуатационные расходы: {{{operating_costs}}}. Ремонт: {{{repair_order}}} (ст. 695 ГК РФ).</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. {{{responsibility}}}.</p>
  
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
      <p class="font-bold mb-1">Ссудодатель:</p>
      <p class="mb-6">{{{lender_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Ссудополучатель:</p>
      <p class="mb-6">{{{borrower_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "tenancy-flat",
    name: "Договор найма квартиры",
    category: "realty",
    actSource: "ст. 671-688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор найма жилого помещения между физическими лицами (наймодатель и наниматель).",
    suggestedDocs: ["Договор аренды квартиры", "Акт приёма-передачи квартиры", "Расписка"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "landlord_fio", label: "Наймодатель (ФИО)", type: "text", defaultValue: "Иванов Сергей Петрович", category: "landlord" },
      { id: "tenant_fio", label: "Наниматель (ФИО)", type: "text", defaultValue: "Смирнов Алексей Игоревич", category: "tenant" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Тверская, д. 10, кв. 5", category: "object" },
      { id: "rent_price", label: "Плата за наём (руб./мес.)", type: "number", defaultValue: "45000", category: "payment" },
      { id: "rent_deposit", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "45000", category: "payment" },
      { id: "rental_start", label: "Дата начала", type: "date", defaultValue: "2026-09-01", category: "contract" },
      { id: "rental_end", label: "Дата окончания", type: "date", defaultValue: "2027-08-31", category: "contract" },
      { id: "utilities_order", label: "Коммунальные платежи", type: "select", defaultValue: "оплачивает наниматель по счётчикам", options: ["оплачивает наниматель по счётчикам", "включены в плату", "оплачивает наймодатель"], category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор найма жилого помещения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong>, именуемый в дальнейшем «Наймодатель», и гражданин <strong>{{{tenant_fio}}}</strong>, именуемый в дальнейшем «Наниматель», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Наймодатель передаёт Нанимателю за плату во владение и пользование квартиру по адресу: <strong>{{{flat_address}}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Плата за наём</div>
  <p class="mb-4 text-justify">2.1. Плата за наём составляет {{{rent_price}}} руб. в месяц. Обеспечительный платёж — {{{rent_deposit}}} руб.</p>
  <p class="mb-4 text-justify">2.2. Коммунальные платежи: {{{utilities_order}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок договора</div>
  <p class="mb-4 text-justify">3.1. Срок найма: с «{{{rental_start}}}» по «{{{rental_end}}}» (ст. 671, 682 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Наймодатель:</div>
      <p class="mb-1"><strong>{{{landlord_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Наниматель:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "mandate-realty-sale",
    name: "Договор поручения на продажу недвижимости",
    category: "realty",
    actSource: "ст. 971-979 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поручения, по которому поверенный обязуется совершить сделки по продаже недвижимости доверителя.",
    suggestedDocs: ["Агентский договор", "Договор оказания риэлторских услуг", "Доверенность"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "principal_fio", label: "Доверитель (ФИО)", type: "text", defaultValue: "Иванов Сергей Петрович", category: "principal" },
      { id: "attorney_org", label: "Поверенный", type: "text", defaultValue: "ООО «РиэлтЦентр»", category: "agent" },
      { id: "property_name", label: "Объект недвижимости", type: "text", defaultValue: "трёхкомнатная квартира по адресу: г. Москва, ул. Садовая, д. 15, кв. 8", category: "realty" },
      { id: "sale_price", label: "Цена продажи (руб.)", type: "number", defaultValue: "12000000", category: "payment" },
      { id: "mandate_reward", label: "Вознаграждение (руб.)", type: "number", defaultValue: "240000", category: "payment" },
      { id: "mandate_period", label: "Срок поручения (мес.)", type: "number", defaultValue: "3", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поручения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{principal_fio}}}</strong>, именуемый в дальнейшем «Доверитель», и <strong>{{{attorney_org}}}</strong>, именуемое в дальнейшем «Поверенный», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Поверенный обязуется совершить от имени и за счёт Доверителя действия по продаже объекта: <strong>{{{property_name}}}</strong> по цене не ниже {{{sale_price}}} руб.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">2.1. Вознаграждение Поверенного составляет {{{mandate_reward}}} руб. и выплачивается после регистрации перехода права собственности (ст. 972 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Договор действует {{{mandate_period}}} месяца (ст. 971 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Доверитель:</div>
      <p class="mb-1"><strong>{{{principal_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Поверенный:</div>
      <p class="mb-1">{{{attorney_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "land-acceptance-act",
    name: "Акт приёма-передачи земельного участка (к ДКП)",
    category: "realty",
    actSource: "ст. 556 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Акт приёма-передачи земельного участка к договору купли-продажи.",
    suggestedDocs: ["ДКП земельного участка", "Акт приёма-передачи квартиры"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "seller_fio", label: "Продавец (ФИО)", type: "text", defaultValue: "Иванов Сергей Петрович", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "Петров Иван Сергеевич", category: "buyer" },
      { id: "land_address", label: "Участок (адрес, кадастровый номер)", type: "text", defaultValue: "МО, Раменский р-н, снт «Берёзка», уч. 12, КН 50:23:0040102:125", category: "realty" },
      { id: "land_area", label: "Площадь (соток)", type: "number", defaultValue: "8", category: "realty" },
      { id: "dkp_number", label: "Договор (номер, дата)", type: "text", defaultValue: "№ 1 от 01.08.2026", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приёма-передачи земельного участка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">к договору купли-продажи {{{dkp_number}}}. Продавец: <strong>{{{seller_fio}}}</strong>, Покупатель: <strong>{{{buyer_fio}}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Передано</div>
  <p class="mb-4 text-justify">Земельный участок: {{{land_address}}}, площадью {{{land_area}}} соток, в состоянии, пригодном для использования по назначению (ст. 556 ГК РФ).</p>
  <p class="mb-4 text-justify">Границы участка обозначены, претензий к передаваемому участку стороны не имеют.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Передал (Продавец):</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Принял (Покупатель):</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "ds-rent",
    name: "Допсоглашение к договору аренды",
    category: "realty",
    actSource: "ст. 450, 614 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Дополнительное соглашение к договору аренды (изменение арендной платы, срока, площади).",
    suggestedDocs: ["Договор аренды квартиры", "Договор аренды нежилого помещения"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "landlord_org", label: "Арендодатель", type: "text", defaultValue: "ИП Смирнов А.В.", category: "landlord" },
      { id: "tenant_org", label: "Арендатор", type: "text", defaultValue: "ООО «Кофейня»", category: "tenant" },
      { id: "rent_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "№ 7 от 01.01.2026", category: "contract" },
      { id: "new_rent", label: "Новый размер арендной платы (руб./мес.)", type: "number", defaultValue: "60000", category: "payment" },
      { id: "change_effect_date", label: "Дата вступления в силу", type: "date", defaultValue: "2026-10-01", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    к договору аренды {{{rent_contract}}}. Арендодатель: <strong>{{{landlord_org}}}</strong>, Арендатор: <strong>{{{tenant_org}}}</strong>, заключили настоящее соглашение:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения</div>
  <p class="mb-4 text-justify">1.1. Пункт 4.1 договора изложить в редакции: «Арендная плата составляет {{{new_rent}}} руб. в месяц».</p>
  <p class="mb-4 text-justify">1.2. Изменения вступают в силу с «{{{change_effect_date}}}» (ст. 614 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Остальные условия договора остаются неизменными (ст. 450 ГК РФ).</p>
  
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
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1">{{{landlord_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1">{{{tenant_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "terminate-rent",
    name: "Соглашение о расторжении договора аренды",
    category: "realty",
    actSource: "ст. 450, 452 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о расторжении договора аренды по соглашению сторон.",
    suggestedDocs: ["Договор аренды квартиры", "Договор аренды нежилого помещения", "Акт приёма-передачи"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "landlord_org", label: "Арендодатель", type: "text", defaultValue: "ИП Смирнов А.В.", category: "landlord" },
      { id: "tenant_org", label: "Арендатор", type: "text", defaultValue: "ООО «Кофейня»", category: "tenant" },
      { id: "rent_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "№ 7 от 01.01.2026", category: "contract" },
      { id: "termination_date", label: "Дата расторжения", type: "date", defaultValue: "2026-11-01", category: "contract" },
      { id: "settlement_note", label: "Взаиморасчёты", type: "text", defaultValue: "стороны претензий друг к другу не имеют", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о расторжении договора аренды</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Арендодатель: <strong>{{{landlord_org}}}</strong>, Арендатор: <strong>{{{tenant_org}}}</strong>, заключили настоящее соглашение о расторжении договора аренды {{{rent_contract}}} (ст. 450, 452 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Расторжение</div>
  <p class="mb-4 text-justify">1.1. Договор аренды {{{rent_contract}}} расторгается с «{{{termination_date}}}».</p>
  <p class="mb-4 text-justify">1.2. {{{settlement_note}}}.</p>
  <p class="mb-4 text-justify">1.3. Арендатор обязуется возвратить объект по акту приёма-передачи в срок до «{{{termination_date}}}».</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Обязательства сторон прекращаются с момента расторжения договора.</p>
  
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
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1">{{{landlord_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1">{{{tenant_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "terminate-sublease",
    name: "Соглашение о расторжении договора субаренды",
    category: "realty",
    actSource: "ст. 450, 452, 615 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о расторжении договора субаренды нежилого помещения по соглашению сторон.",
    suggestedDocs: ["Договор субаренды нежилого помещения", "Договор аренды нежилого помещения"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "sublessor_org", label: "Субарендодатель", type: "text", defaultValue: "ООО «Арендодатель»", category: "landlord" },
      { id: "subtenant_org", label: "Субарендатор", type: "text", defaultValue: "ООО «Салон»", category: "tenant" },
      { id: "sublease_contract", label: "Договор субаренды (номер, дата)", type: "text", defaultValue: "№ 3 от 01.03.2026", category: "contract" },
      { id: "termination_date", label: "Дата расторжения", type: "date", defaultValue: "2026-10-31", category: "contract" },
      { id: "settlement_note", label: "Взаиморасчёты", type: "text", defaultValue: "взаимные претензии отсутствуют, арендная плата уплачена полностью", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о расторжении договора субаренды</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Субарендодатель: <strong>{{{sublessor_org}}}</strong>, Субарендатор: <strong>{{{subtenant_org}}}</strong>, заключили настоящее соглашение о расторжении договора субаренды {{{sublease_contract}}} (ст. 450, 452, 615 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Расторжение</div>
  <p class="mb-4 text-justify">1.1. Договор субаренды {{{sublease_contract}}} расторгается с «{{{termination_date}}}».</p>
  <p class="mb-4 text-justify">1.2. {{{settlement_note}}}.</p>
  <p class="mb-4 text-justify">1.3. Помещение возвращается по акту приёма-передачи в день расторжения.</p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Форс-мажор</div>
  <p class="mb-4 text-justify">
    2.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    2.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    2.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    3.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    3.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Субарендодатель:</div>
      <p class="mb-1">{{{sublessor_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Субарендатор:</div>
      <p class="mb-1">{{{subtenant_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "preliminary-sale",
    name: "Предварительный договор купли-продажи квартиры",
    category: "realty",
    actSource: "ст. 429-431 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Предварительный договор о заключении в будущем основного договора купли-продажи квартиры с задатком или авансом (ст. 429, 380-381 ГК РФ).",
    suggestedDocs: ["deposit-agreement", "dkp-flat"],
    printInstruction: "Печать на листе А4; поля: левое 20 мм, правое 10 мм, верх/низ 20 мм; Times New Roman 12-14 пт, интервал 1,5",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "seller_fio", label: "Продавец (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "buyer" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "realty", validation: { required: true } },
      { id: "flat_area", label: "Площадь (кв. м)", type: "text", defaultValue: "54,3", category: "realty" },
      { id: "flat_price", label: "Стоимость квартиры (руб.)", type: "text", defaultValue: "9500000", category: "payment", validation: { required: true } },
      { id: "deposit_amount", label: "Сумма задатка/аванса (руб.)", type: "text", defaultValue: "100000", category: "payment" },
      { id: "deposit_type", label: "Тип обеспечительного платежа", type: "select", defaultValue: "задаток", category: "payment", options: [
        { label: "Задаток (ст. 380-381 ГК)", value: "задаток" },
        { label: "Аванс (возвратный)", value: "аванс" },
      ] },
      { id: "main_deal_date", label: "Срок заключения основного договора", type: "date", defaultValue: "2026-10-10", category: "contract" },
      { id: "penalty", label: "Неустойка при отказе (% от суммы)", type: "text", defaultValue: "0,1% в день", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Предварительный договор купли-продажи квартиры</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (паспорт: {{{seller_passport}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong> (паспорт: {{{buyer_passport}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 429-431 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Стороны обязуются заключить в будущем основной договор купли-продажи квартиры по адресу: {{{flat_address}}}, площадью {{{flat_area}}} кв. м (далее — «Основной договор»).</p>
  <p class="mb-3 text-justify">1.2. Стоимость квартиры составляет <strong>{{{flat_price}}} руб.</strong> ({{{flat_price_words}}}).</p>
  <p class="font-bold mb-2">2. Обеспечительный платёж</p>
  <p class="mb-3 text-justify">2.1. В обеспечение обязательств Покупатель передаёт Продавцу {{{deposit_amount}}} руб., что является {{{deposit_type}}} (ст. 380-381 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. При отказе Покупателя от заключения Основного договора {{{deposit_type}}} не возвращается. При отказе Продавца {{{deposit_type}}} возвращается в двойном размере. В случае прекращения обязательств по иным основаниям {{{deposit_type}}} подлежит возврату.</p>
  <p class="font-bold mb-2">3. Срок заключения основного договора</p>
  <p class="mb-3 text-justify">3.1. Основной договор заключается не позднее «{{{main_deal_date}}}». Если в этот срок он не заключён и ни одна сторона не направила предложение заключить его, обязательства по настоящему договору прекращаются.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За просрочку заключения Основного договора виновная сторона уплачивает неустойку в размере {{{penalty}}} (ст. 330 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу.</p>
  
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
      <p class="font-bold mb-1">Продавец:</p>
      <p class="mb-6">{{{seller_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Покупатель:</p>
      <p class="mb-6">{{{buyer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "deposit-agreement",
    name: "Соглашение о задатке при покупке квартиры",
    category: "realty",
    actSource: "ст. 380-381 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о задатке как обеспечении заключения основного договора купли-продажи квартиры: сумма, последствия отказа сторон (ст. 380-381 ГК РФ).",
    suggestedDocs: ["preliminary-sale", "dkp-flat"],
    printInstruction: "Печать на листе А4, Times New Roman 12-14 пт; обязательна письменная форма (иначе платёж считается авансом)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата соглашения", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "seller_fio", label: "Продавец (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "buyer" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "realty", validation: { required: true } },
      { id: "flat_price", label: "Стоимость квартиры (руб.)", type: "text", defaultValue: "9500000", category: "payment" },
      { id: "deposit_amount", label: "Сумма задатка (руб.)", type: "text", defaultValue: "100000", category: "payment", validation: { required: true } },
      { id: "main_deal_date", label: "Срок заключения основного договора", type: "date", defaultValue: "2026-10-10", category: "contract" },
      { id: "transfer_note", label: "Способ передачи задатка", type: "text", defaultValue: "наличными при подписании настоящего соглашения", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о задатке</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (паспорт: {{{seller_passport}}}), именуемый «Продавец», и
    <strong>{{{buyer_fio}}}</strong> (паспорт: {{{buyer_passport}}}), именуемый «Покупатель», заключили
    настоящее соглашение о нижеследующем (ст. 380-381 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет соглашения</p>
  <p class="mb-3 text-justify">1.1. В обеспечение обязательства Покупателя заключить с Продавцом основной договор купли-продажи квартиры по адресу: {{{flat_address}}}, стоимостью {{{flat_price}}} руб., Покупатель передаёт Продавцу задаток в размере <strong>{{{deposit_amount}}} руб.</strong> ({{{deposit_amount_words}}}).</p>
  <p class="mb-3 text-justify">1.2. Передача задатка производится {{{transfer_note}}}. Факт передачи удостоверяется настоящим соглашением и распиской.</p>
  <p class="font-bold mb-2">2. Последствия неисполнения обязательства</p>
  <p class="mb-3 text-justify">2.1. Если основной договор не будет заключён по вине Покупателя, задаток остаётся у Продавца (ст. 381 п. 2 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. Если основной договор не будет заключён по вине Продавца, он обязан уплатить Покупателю двойную сумму задатка (ст. 381 п. 2 ГК РФ).</p>
  <p class="mb-3 text-justify">2.3. Если обязательство прекращается по соглашению сторон либо вследствие невозможности исполнения, задаток подлежит возврату.</p>
  <p class="font-bold mb-2">3. Срок</p>
  <p class="mb-3 text-justify">3.1. Основной договор должен быть заключён не позднее «{{{main_deal_date}}}».</p>
  
  <p class="font-bold mb-2">4. Форс-мажор</p>
  <p class="mb-3 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">5. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Продавец:</p>
      <p class="mb-6">{{{seller_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Покупатель:</p>
      <p class="mb-6">{{{buyer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "rent-contract",
    name: "Договор ренты (пожизненное содержание с иждивением)",
    category: "realty",
    actSource: "ст. 583-605 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор ренты с пожизненным содержанием иждивенца: ежемесячные выплаты не менее двух величин прожиточного минимума, нотариальное удостоверение обязательно.",
    suggestedDocs: ["akt-priema-kvartiry"],
    printInstruction: "Печать на листе А4; договор подлежит обязательному нотариальному удостоверению (ст. 584 ГК РФ) и госрегистрации перехода права",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "recipient_fio", label: "Получатель ренты (ФИО)", type: "text", defaultValue: "Смирнова Анна Ивановна", category: "recipient", validation: { required: true } },
      { id: "recipient_passport", label: "Паспорт получателя ренты", type: "text", defaultValue: "45 08 123456, выдан ОВД «Арбат» г. Москвы", category: "recipient" },
      { id: "recipient_address", label: "Адрес получателя ренты", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "recipient" },
      { id: "payer_fio", label: "Плательщик ренты (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "payer", validation: { required: true } },
      { id: "payer_passport", label: "Паспорт плательщика ренты", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "payer" },
      { id: "property_address", label: "Адрес недвижимости", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "realty", validation: { required: true } },
      { id: "property_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001020:4521", category: "realty" },
      { id: "rent_amount", label: "Ежемесячная рента (руб.)", type: "text", defaultValue: "30000", category: "payment", validation: { required: true } },
      { id: "care_conditions", label: "Условия содержания и ухода", type: "textarea", defaultValue: "оплата коммунальных услуг, обеспечение питанием и лекарствами, помощь в быту и уход при болезни", category: "items", rows: 2 },
      { id: "notary", label: "Нотариус", type: "text", defaultValue: "нотариус г. Москвы Иванова М.С.", category: "notary" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор ренты с пожизненным содержанием с иждивением</div>
  <p class="mb-4 text-justify">
    <strong>{{{recipient_fio}}}</strong> (паспорт: {{{recipient_passport}}}, адрес: {{{recipient_address}}}),
    именуемый «Получатель ренты», и <strong>{{{payer_fio}}}</strong> (паспорт: {{{payer_passport}}}),
    именуемый «Плательщик ренты», заключили настоящий договор о нижеследующем (ст. 583-605 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Получатель ренты передаёт в собственность Плательщику ренты квартиру по адресу: {{{property_address}}} (кадастровый № {{{property_cadastral}}}), а Плательщик ренты обязуется выплачивать пожизненную ренту и осуществлять содержание с иждивением.</p>
  <p class="font-bold mb-2">2. Размер и порядок ренты</p>
  <p class="mb-3 text-justify">2.1. Ежемесячная рента составляет <strong>{{{rent_amount}}} руб.</strong>, что не менее двух величин прожиточного минимума (ст. 602 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. Плательщик ренты обеспечивает: {{{care_conditions}}}.</p>
  <p class="font-bold mb-2">3. Обеспечение исполнения</p>
  <p class="mb-3 text-justify">3.1. Плательщик ренты не вправе отчуждать полученное имущество без предварительного письменного согласия Получателя ренты (ст. 604 ГК РФ).</p>
  <p class="font-bold mb-2">4. Ответственность и прекращение</p>
  <p class="mb-3 text-justify">4.1. При существенном нарушении условий содержания Получатель ренты вправе требовать возврата квартиры (ст. 605 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Обязательства прекращаются со смертью Получателя ренты либо по основаниям, установленным законом.</p>
  <p class="mb-3 text-justify">4.3. Настоящий договор подлежит нотариальному удостоверению (ст. 584 ГК РФ) и государственной регистрации. Удостоверен {{{notary}}}.</p>
  
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
      <p class="font-bold mb-1">Получатель ренты:</p>
      <p class="mb-6">{{{recipient_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Плательщик ренты:</p>
      <p class="mb-6">{{{payer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "gift-share",
    name: "Договор дарения доли в квартире",
    category: "realty",
    actSource: "ст. 572-582 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор дарения доли в праве собственности на квартиру. При дарении не близким родственникам подлежит нотариальному удостоверению (п. 1.1 ст. 42 ФЗ-218).",
    suggestedDocs: ["gift-flat"],
    printInstruction: "Печать на листе А4; при дарении доли лицу, не являющемуся близким родственником, требуется нотариальное удостоверение и госрегистрация в Росреестре",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "donor_fio", label: "Даритель (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "donor", validation: { required: true } },
      { id: "donor_passport", label: "Паспорт дарителя", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "donor" },
      { id: "donee_fio", label: "Одаряемый (ФИО)", type: "text", defaultValue: "Иванов Пётр Иванович", category: "donee", validation: { required: true } },
      { id: "donee_passport", label: "Паспорт одаряемого", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "donee" },
      { id: "relationship", label: "Степень родства", type: "text", defaultValue: "сын", category: "family" },
      { id: "flat_address", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "realty", validation: { required: true } },
      { id: "flat_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001020:4521", category: "realty" },
      { id: "share_size", label: "Размер доли", type: "text", defaultValue: "1/2", category: "realty", validation: { required: true } },
      { id: "share_desc", label: "Характеристики доли", type: "text", defaultValue: "жилое помещение, общая площадь 54,3 кв. м", category: "realty" },
      { id: "notary", label: "Нотариус (если удостоверяется)", type: "text", defaultValue: "нотариус г. Москвы Иванова М.С.", category: "notary" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор дарения доли в квартире</div>
  <p class="mb-4 text-justify">
    <strong>{{{donor_fio}}}</strong> (паспорт: {{{donor_passport}}}), именуемый «Даритель», и
    <strong>{{{donee_fio}}}</strong> (паспорт: {{{donee_passport}}}), именуемый «Одаряемый»,
    заключили настоящий договор о нижеследующем (ст. 572 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Даритель безвозмездно передаёт в собственность Одаряемому долю в размере {{{share_size}}} в праве общей долевой собственности на квартиру по адресу: {{{flat_address}}} (кадастровый № {{{flat_cadastral}}}), {{{share_desc}}}.</p>
  <p class="mb-3 text-justify">1.2. Одаряемый — {{{relationship}}} Дарителя. {{#relationship}}Дарение осуществляется близкому родственнику, в связи с чем нотариальное удостоверение не требуется (п. 1.1 ст. 42 ФЗ-218).{{/relationship}}</p>
  <p class="font-bold mb-2">2. Права и обязанности сторон</p>
  <p class="mb-3 text-justify">2.1. Даритель гарантирует, что доля свободна от прав третьих лиц, в споре и под арестом не состоит, в залоге не находится (ст. 576 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. Одаряемый принимает долю и обязуется зарегистрировать переход права собственности в Росреестре.</p>
  <p class="font-bold mb-2">3. Отмена дарения</p>
  <p class="mb-3 text-justify">3.1. Дарение может быть отменено по основаниям, предусмотренным ст. 578 ГК РФ (покушение на жизнь дарителя, умышленное причинение вреда, неблагодарность).</p>
  <p class="mb-3 text-justify">3.2. Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу. {{{notary}}}</p>
  
  <p class="font-bold mb-2">4. Форс-мажор</p>
  <p class="mb-3 text-justify">
    4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">5. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Даритель:</p>
      <p class="mb-6">{{{donor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Одаряемый:</p>
      <p class="mb-6">{{{donee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "garage-lease",
    name: "Договор аренды гаража",
    category: "realty",
    actSource: "ст. 606-625 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды гаража или машиноместа: арендная плата, коммунальные платежи, порядок передачи, ответственность за сохранность.",
    suggestedDocs: ["parking-lease", "raspiska-money"],
    printInstruction: "Печать на листе А4; при сроке аренды 1 год и более в отношении капитального гаража требуется госрегистрация в Росреестре",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "landlord_fio", label: "Арендодатель (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "landlord", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "landlord" },
      { id: "tenant_fio", label: "Арендатор (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "tenant" },
      { id: "garage_address", label: "Адрес гаража", type: "text", defaultValue: "г. Москва, ГСК «Автолюбитель», бокс № 12", category: "object", validation: { required: true } },
      { id: "garage_type", label: "Тип гаража", type: "select", defaultValue: "металлический бокс", category: "object", options: [
        { label: "Капитальный гараж (недвижимость)", value: "капитальный гараж" },
        { label: "Металлический бокс", value: "металлический бокс" },
        { label: "Машиноместо", value: "машиноместо" },
      ] },
      { id: "rent_amount", label: "Арендная плата (руб./мес)", type: "text", defaultValue: "8000", category: "payment", validation: { required: true } },
      { id: "utilities_payer", label: "Кто оплачивает коммунальные услуги", type: "select", defaultValue: "Арендатор", category: "payment", options: [
        { label: "Арендатор", value: "Арендатор" },
        { label: "Арендодатель", value: "Арендодатель" },
      ] },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lease_term", label: "Срок аренды", type: "text", defaultValue: "11 месяцев", category: "contract" },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "ежемесячно не позднее 5 числа текущего месяца", category: "payment" },
      { id: "penalty", label: "Неустойка за просрочку", type: "text", defaultValue: "0,1% в день", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды гаража</div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_fio}}}</strong> (паспорт: {{{landlord_passport}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{tenant_fio}}}</strong> (паспорт: {{{tenant_passport}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 606 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование {{{garage_type}}} по адресу: {{{garage_address}}}.</p>
  <p class="mb-3 text-justify">1.2. Гараж передаётся по акту приёма-передачи, который является неотъемлемой частью настоящего договора.</p>
  <p class="font-bold mb-2">2. Арендная плата</p>
  <p class="mb-3 text-justify">2.1. Арендная плата составляет <strong>{{{rent_amount}}} руб.</strong> в месяц, оплачивается {{{payment_order}}}.</p>
  <p class="mb-3 text-justify">2.2. Коммунальные услуги и расходы на электроэнергию оплачивает: {{{utilities_payer}}}.</p>
  <p class="font-bold mb-2">3. Срок аренды</p>
  <p class="mb-3 text-justify">3.1. Договор заключён на срок {{{lease_term}}} с «{{{start_date}}}». Арендатор вправе использовать гараж для хранения личного автомобиля.</p>
  <p class="font-bold mb-2">4. Обязанности сторон</p>
  <p class="mb-3 text-justify">4.1. Арендодатель обязан передать гараж в состоянии, пригодном для использования. Арендатор обязан поддерживать гараж в исправном состоянии и вернуть его по акту по окончании срока.</p>
  <p class="font-bold mb-2">5. Ответственность</p>
  <p class="mb-3 text-justify">5.1. За просрочку арендной платы Арендатор уплачивает неустойку {{{penalty}}} от суммы задолженности.</p>
  <p class="mb-3 text-justify">5.2. Арендатор несёт ответственность за ущерб, причинённый гаражу, в пределах стоимости ремонта.</p>
  
  <p class="font-bold mb-2">6. Форс-мажор</p>
  <p class="mb-3 text-justify">
    6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">7. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Арендодатель:</p>
      <p class="mb-6">{{{landlord_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "garage-sale",
    name: "Договор купли-продажи гаража",
    category: "realty",
    actSource: "ст. 454-491 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи гаража: цена, порядок расчётов, передача по акту. Для капитального гаража — госрегистрация перехода права в Росреестре (ст. 551 ГК РФ).",
    suggestedDocs: ["garage-lease", "raspiska-money"],
    printInstruction: "Печать на листе А4; для капитального гаража (недвижимости) обязательна госрегистрация перехода права собственности",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "seller_fio", label: "Продавец (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "buyer" },
      { id: "garage_address", label: "Адрес/расположение гаража", type: "text", defaultValue: "г. Москва, ГСК «Автолюбитель», бокс № 12", category: "object", validation: { required: true } },
      { id: "garage_type", label: "Тип гаража", type: "select", defaultValue: "капитальный гараж", category: "object", options: [
        { label: "Капитальный гараж (недвижимость)", value: "капитальный гараж" },
        { label: "Металлический бокс", value: "металлический бокс" },
      ] },
      { id: "garage_cadastral", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001020:4521", category: "realty" },
      { id: "garage_area", label: "Площадь (кв. м)", type: "text", defaultValue: "18,5", category: "realty" },
      { id: "garage_price", label: "Цена (руб.)", type: "text", defaultValue: "650000", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок расчётов", type: "text", defaultValue: "100% оплата наличными при подписании договора", category: "payment" },
      { id: "transfer_date", label: "Дата передачи по акту", type: "date", defaultValue: "2026-08-10", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи гаража</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (паспорт: {{{seller_passport}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong> (паспорт: {{{buyer_passport}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 454 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Продавец передаёт в собственность Покупателя {{{garage_type}}} по адресу: {{{garage_address}}}, площадью {{{garage_area}}} кв. м (кадастровый № {{{garage_cadastral}}}).</p>
  <p class="mb-3 text-justify">1.2. Отчуждаемый гараж не продан, не заложен, в споре и под арестом не состоит, правами третьих лиц не обременён.</p>
  <p class="font-bold mb-2">2. Цена и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Цена гаража составляет <strong>{{{garage_price}}} руб.</strong> ({{{garage_price_words}}}) и уплачивается: {{{payment_order}}} (ст. 555 ГК РФ).</p>
  <p class="font-bold mb-2">3. Передача</p>
  <p class="mb-3 text-justify">3.1. Гараж передаётся по акту приёма-передачи «{{{transfer_date}}}». Риск случайной гибели переходит к Покупателю с момента передачи.</p>
  <p class="font-bold mb-2">4. Регистрация и ответственность</p>
  <p class="mb-3 text-justify">4.1. Переход права собственности на капитальный гараж подлежит государственной регистрации в Росреестре (ст. 551 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. За нарушение сроков передачи или оплаты виновная сторона уплачивает неустойку 0,1% от цены за каждый день просрочки (ст. 330 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Продавец:</p>
      <p class="mb-6">{{{seller_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Покупатель:</p>
      <p class="mb-6">{{{buyer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "dacha-lease",
    name: "Договор аренды дачи/садового участка",
    category: "realty",
    actSource: "ст. 606-625 ГК РФ, ст. 22 ЗК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды дачи или садового участка с постройками: целевое использование, арендная плата, коммунальные платежи, порядок возврата.",
    suggestedDocs: ["lease-house", "land-lease"],
    printInstruction: "Печать на листе А4; при сроке аренды участка 1 год и более обязательна госрегистрация в Росреестре",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "landlord_fio", label: "Арендодатель (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "landlord", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "landlord" },
      { id: "tenant_fio", label: "Арендатор (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "tenant" },
      { id: "plot_address", label: "Адрес участка", type: "text", defaultValue: "Московская обл., СНТ «Берёзка», уч. 15", category: "object", validation: { required: true } },
      { id: "plot_cadastral", label: "Кадастровый номер участка", type: "text", defaultValue: "50:12:0050203:45", category: "realty" },
      { id: "plot_area", label: "Площадь участка (соток)", type: "text", defaultValue: "8", category: "realty" },
      { id: "plot_purpose", label: "Целевое использование", type: "select", defaultValue: "ведение садоводства", category: "object", options: [
        { label: "Ведение садоводства", value: "ведение садоводства" },
        { label: "ИЖС (индивидуальное жилищное строительство)", value: "индивидуальное жилищное строительство" },
        { label: "Личное подсобное хозяйство", value: "личное подсобное хозяйство" },
      ] },
      { id: "buildings", label: "Постройки на участке", type: "text", defaultValue: "дачный дом 40 кв. м, баня, теплица", category: "object" },
      { id: "rent_amount", label: "Арендная плата (руб./сезон или мес)", type: "text", defaultValue: "60000 за сезон", category: "payment" },
      { id: "utilities_payer", label: "Кто оплачивает коммунальные услуги", type: "select", defaultValue: "Арендатор", category: "payment", options: [
        { label: "Арендатор", value: "Арендатор" },
        { label: "Арендодатель", value: "Арендодатель" },
      ] },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "2026-05-01", category: "contract" },
      { id: "end_date", label: "Дата окончания аренды", type: "date", defaultValue: "2026-10-01", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды дачи/садового участка</div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_fio}}}</strong> (паспорт: {{{landlord_passport}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{tenant_fio}}}</strong> (паспорт: {{{tenant_passport}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 606 ГК РФ, ст. 22 ЗК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель передаёт Арендатору во временное владение и пользование земельный участок площадью {{{plot_area}}} соток по адресу: {{{plot_address}}} (кадастровый № {{{plot_cadastral}}}), с расположенными на нём постройками: {{{buildings}}}.</p>
  <p class="mb-3 text-justify">1.2. Участок используется для: {{{plot_purpose}}}. Иное использование допускается только с письменного согласия Арендодателя.</p>
  <p class="font-bold mb-2">2. Арендная плата</p>
  <p class="mb-3 text-justify">2.1. Арендная плата составляет {{{rent_amount}}} и вносится в порядке, согласованном сторонами.</p>
  <p class="mb-3 text-justify">2.2. Коммунальные платежи (электроэнергия, вода, вывоз ТКО) оплачивает: {{{utilities_payer}}}.</p>
  <p class="font-bold mb-2">3. Срок аренды</p>
  <p class="mb-3 text-justify">3.1. Договор действует с «{{{start_date}}}» по «{{{end_date}}}». По истечении срока участок возвращается по акту приёма-передачи.</p>
  <p class="font-bold mb-2">4. Обязанности сторон</p>
  <p class="mb-3 text-justify">4.1. Арендатор обязан использовать участок по целевому назначению, не допускать порчи построек, возмещать ущерб, причинённый по его вине.</p>
  <p class="mb-3 text-justify">4.2. Арендодатель обязан передать участок и постройки в состоянии, пригодном для использования.</p>
  <p class="font-bold mb-2">5. Ответственность</p>
  <p class="mb-3 text-justify">5.1. За просрочку внесения арендной платы Арендатор уплачивает неустойку 0,1% от суммы задолженности за каждый день просрочки (ст. 330 ГК РФ).</p>
  
  <p class="font-bold mb-2">6. Форс-мажор</p>
  <p class="mb-3 text-justify">
    6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-3 text-justify">
    6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-3 text-justify">
    6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <p class="font-bold mb-2">7. Порядок разрешения споров</p>
  <p class="mb-3 text-justify">
    7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-3 text-justify">
    7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Арендодатель:</p>
      <p class="mb-6">{{{landlord_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{tenant_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "retail-space-lease",
    name: "Договор аренды торгового места",
    category: "realty",
    actSource: "ст. 606-625 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Аренда торгового места на рынке или в торговом центре: описание места, целевое использование, арендная плата и коммунальные платежи, срок аренды, порядок возврата.",
    suggestedDocs: ["lease-contract", "act-services"],
    printInstruction: "Печать на листе А4; схема и площадь торгового места оформляются приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "landlord_company", label: "Арендодатель", type: "text", defaultValue: "ООО «Рынок-Центр»", category: "landlord", validation: { required: true } },
      { id: "tenant_company", label: "Арендатор", type: "text", defaultValue: "ИП Петров Алексей Иванович", category: "tenant", validation: { required: true } },
      { id: "space_address", label: "Адрес торгового места", type: "text", defaultValue: "г. Москва, ул. Складочная, д. 1, стр. 1, павильон № 45", category: "realty" },
      { id: "space_area", label: "Площадь", type: "text", defaultValue: "12 кв. м", category: "realty" },
      { id: "purpose", label: "Целевое использование", type: "text", defaultValue: "розничная торговля продуктами питания", category: "items" },
      { id: "rent", label: "Арендная плата", type: "text", defaultValue: "35 000 руб. в месяц", category: "payment", validation: { required: true } },
      { id: "utilities", label: "Коммунальные платежи", type: "text", defaultValue: "электроэнергия и водоснабжение оплачиваются Арендатором отдельно по счётчикам", category: "payment" },
      { id: "lease_term", label: "Срок аренды", type: "text", defaultValue: "11 месяцев", category: "contract" },
      { id: "start_date", label: "Дата начала аренды", type: "date", defaultValue: "2026-09-01", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды торгового места</div>
  <p class="mb-4 text-justify">
    <strong>{{{landlord_company}}}</strong>, именуемое «Арендодатель», с одной стороны, и
    <strong>{{{tenant_company}}}</strong>, именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 606 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель передаёт, а Арендатор принимает во временное владение и пользование торговое место: {{{space_address}}}, площадью {{{space_area}}}.</p>
  <p class="mb-3 text-justify">1.2. Торговое место используется для: {{{purpose}}}.</p>
  <p class="font-bold mb-2">2. Арендная плата и платежи</p>
  <p class="mb-3 text-justify">2.1. Арендная плата: {{{rent}}}, вносится ежемесячно не позднее 5 числа. {{{utilities}}}.</p>
  <p class="font-bold mb-2">3. Обязанности сторон</p>
  <p class="mb-3 text-justify">3.1. Арендатор поддерживает место в надлежащем состоянии, соблюдает правила торговли и санитарные нормы.</p>
  <p class="mb-3 text-justify">3.2. Арендодатель обеспечивает беспрепятственный доступ и работоспособность инженерных коммуникаций.</p>
  <p class="font-bold mb-2">4. Срок действия и ответственность</p>
  <p class="mb-3 text-justify">4.1. Договор заключён на срок {{{lease_term}}} с «{{{start_date}}}» и может быть продлён сторонами.</p>
  <p class="mb-3 text-justify">4.2. За просрочку арендной платы Арендатор уплачивает неустойку 0,1% в день от суммы задолженности (ст. 330 ГК РФ).</p>
  
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
      <p class="mb-6">{{{landlord_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Арендатор:</p>
      <p class="mb-6">{{{tenant_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-apartment",
    name: "Договор купли-продажи квартиры",
    category: "realty",
    actSource: "ст. 549-558 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи квартиры между физическими лицами. Требуется нотариальное удостоверение только при долевой собственности или с участием несовершеннолетних.",
    suggestedDocs: ["dogovor-zadatka","akt-priema-kvartiry"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Петров Иван Сергеевич", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4512 098765, выдан ОУФМС России по г. Москве 12.05.2014, к.п. 770-001", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 5", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Смирнова Анна Петровна", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4513 112233, выдан ОУФМС России по г. Москве 03.03.2015, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Гагарина, д. 3, кв. 12", category: "buyer" },
      { id: "prop_rights", label: "Правоустанавливающий документ", type: "text", defaultValue: "Свидетельство о государственной регистрации права от 15.04.2019", category: "realty", validation: { required: true } },
      { id: "cadastre_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001234:5678", category: "realty", validation: { required: true } },
      { id: "appartment_addr", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Ленина, д. 10, кв. 25", category: "realty", validation: { required: true } },
      { id: "rooms_count", label: "Количество комнат", type: "number", defaultValue: "2", category: "realty" },
      { id: "area", label: "Площадь (кв. м)", type: "number", defaultValue: "54,3", category: "realty", validation: { required: true } },
      { id: "floor", label: "Этаж", type: "number", defaultValue: "5", category: "realty" },
      { id: "contract_price", label: "Цена (руб.)", type: "number", defaultValue: "8500000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Восемь миллионов пятьсот тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "payment_term", label: "Срок оплаты (дата)", type: "date", defaultValue: "2026-09-11", category: "payment" },
      { id: "transfer_term", label: "Срок передачи квартиры (дата)", type: "date", defaultValue: "2026-09-01", category: "realty" },
      { id: "has_encumbrance", label: "Обременения/аресты", type: "select", defaultValue: "нет", category: "realty", options: [ { label: "Нет", value: "нет" }, { label: "Ипотека", value: "ипотека" }, { label: "Залог", value: "залог" }, { label: "Аренда", value: "аренда" } ] },
      { id: "deposit_note", label: "Условие о задатке", type: "text", defaultValue: "Задаток в размере 100 000 рублей уплачен при подписании предварительного договора", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи квартиры</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец обязуется передать в собственность Покупателя квартиру, расположенную по адресу: {{{appartment_addr}}}, кадастровый номер {{{cadastre_number}}}, общей площадью {{{area}}} кв. м, а Покупатель обязуется принять квартиру и уплатить за неё цену в размере <strong>{{{contract_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. Квартира принадлежит Продавцу на праве собственности на основании: {{{prop_rights}}}.</p>
  <p class="mb-4 text-justify">1.3. На момент подписания договора квартира обременений и арестов не имеет, за исключением: {{{has_encumbrance}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена квартиры составляет <strong>{{{contract_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в срок до {{{payment_term}}}: {{{deposit_note}}}.</p>
  <p class="mb-4 text-justify">2.3. Расчёты между сторонами производятся в безналичном порядке по реквизитам Продавца либо в наличном порядке с составлением расписки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача квартиры</div>
  <p class="mb-4 text-justify">3.1. Продавец передаёт квартиру Покупателю в срок до {{{transfer_term}}} по акту приёма-передачи.</p>
  <p class="mb-4 text-justify">3.2. Обязательство по передаче считается исполненным с момента подписания акта приёма-передачи.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">4.1. Продавец гарантирует, что квартира не отчуждена, не заложена, в споре и под арестом не состоит.</p>
  <p class="mb-4 text-justify">4.2. Покупатель обязуется принять квартиру и произвести оплату в установленный срок.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За нарушение срока оплаты Покупатель уплачивает пени в размере 0,1% от неуплаченной суммы за каждый день просрочки.</p>
  <p class="mb-4 text-justify">5.2. За нарушение срока передачи квартиры Продавец уплачивает пени в размере 0,1% от цены договора за каждый день просрочки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-room",
    name: "Договор купли-продажи комнаты",
    category: "realty",
    actSource: "ст. 549-558 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи комнаты в коммунальной квартире или общежитии.",
    suggestedDocs: ["dkp-apartment"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Козлов Андрей Викторович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4509 554433, выдан ОУФМС России по г. Москве 20.01.2012, к.п. 770-001", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 8, комн. 14", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Иванова Ольга Дмитриевна", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4511 667788, выдан ОУФМС России по г. Москве 14.02.2013, к.п. 770-003", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 8, комн. 20", category: "buyer" },
      { id: "cadastre_number", label: "Кадастровый номер", type: "text", defaultValue: "77:01:0001234:9012", category: "realty", validation: { required: true } },
      { id: "room_addr", label: "Адрес комнаты", type: "text", defaultValue: "г. Москва, ул. Строителей, д. 8, комн. 14", category: "realty", validation: { required: true } },
      { id: "room_area", label: "Площадь комнаты (кв. м)", type: "number", defaultValue: "14,5", category: "realty", validation: { required: true } },
      { id: "apartment_area", label: "Площадь всей квартиры (кв. м)", type: "number", defaultValue: "62", category: "realty" },
      { id: "contract_price", label: "Цена (руб.)", type: "number", defaultValue: "2800000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Два миллиона восемьсот тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "payment_term", label: "Срок оплаты (дата)", type: "date", defaultValue: "2026-09-20", category: "payment" },
      { id: "other_owners", label: "Другие собственники (если есть)", type: "text", defaultValue: "Нет", category: "realty" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи комнаты</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец обязуется передать в собственность Покупателя комнату площадью {{{room_area}}} кв. м, расположенную по адресу: {{{room_addr}}}, кадастровый номер {{{cadastre_number}}}.</p>
  <p class="mb-4 text-justify">1.2. Комната продаётся в составе квартиры общей площадью {{{apartment_area}}} кв. м. Права на места общего пользования переходят к Покупателю в соответствии с законодательством.</p>
  <p class="mb-4 text-justify">1.3. Другие собственники комнат: {{{other_owners}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена комнаты составляет <strong>{{{contract_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в срок до {{{payment_term}}} в безналичном или наличном порядке с составлением расписки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Продавец гарантирует отсутствие обременений и прав третьих лиц на комнату.</p>
  <p class="mb-4 text-justify">3.2. Покупатель обязуется принять комнату и оплатить её в установленный срок.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При уклонении одной из сторон от регистрации перехода права собственности виновная сторона возмещает другой стороне причинённые убытки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-house",
    name: "Договор купли-продажи жилого дома с земельным участком",
    category: "realty",
    actSource: "ст. 549, 552 ГК РФ, ФЗ-218",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи жилого дома и земельного участка между физическими лицами.",
    suggestedDocs: ["dkp-land"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Сидоров Николай Павлович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4510 223344, выдан ОУФМС России по г. Москве 10.10.2011, к.п. 770-001", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Садовая, д. 4, кв. 9", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Фёдоров Дмитрий Алексеевич", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4512 998877, выдан ОУФМС России по г. Москве 25.05.2014, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Лесная, д. 11, кв. 2", category: "buyer" },
      { id: "house_addr", label: "Адрес дома", type: "text", defaultValue: "Московская обл., д. Дубки, ул. Центральная, д. 15", category: "realty", validation: { required: true } },
      { id: "house_area", label: "Площадь дома (кв. м)", type: "number", defaultValue: "96,5", category: "realty", validation: { required: true } },
      { id: "house_cadastre", label: "Кадастровый номер дома", type: "text", defaultValue: "50:12:0030456:110", category: "realty", validation: { required: true } },
      { id: "land_area", label: "Площадь участка (соток)", type: "number", defaultValue: "8", category: "realty", validation: { required: true } },
      { id: "land_cadastre", label: "Кадастровый номер участка", type: "text", defaultValue: "50:12:0030456:89", category: "realty", validation: { required: true } },
      { id: "land_purpose", label: "Категория/назначение участка", type: "text", defaultValue: "Земли населённых пунктов, для ведения личного подсобного хозяйства", category: "realty" },
      { id: "contract_price", label: "Цена (руб.)", type: "number", defaultValue: "9500000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Девять миллионов пятьсот тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "payment_term", label: "Срок оплаты (дата)", type: "date", defaultValue: "2026-10-01", category: "payment" },
      { id: "property_doc", label: "Правоустанавливающие документы", type: "text", defaultValue: "Выписка из ЕГРН от 01.07.2026", category: "realty", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи жилого дома и земельного участка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец обязуется передать в собственность Покупателя жилой дом площадью {{{house_area}}} кв. м, кадастровый номер {{{house_cadastre}}}, и земельный участок площадью {{{land_area}}} соток, кадастровый номер {{{land_cadastre}}}, расположенные по адресу: {{{house_addr}}}.</p>
  <p class="mb-4 text-justify">1.2. Земельный участок имеет категорию: {{{land_purpose}}}.</p>
  <p class="mb-4 text-justify">1.3. Право собственности подтверждено: {{{property_doc}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена объекта составляет <strong>{{{contract_price}}} ({{{price_words}}}) рублей</strong>, включая стоимость дома, участка и построек.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в срок до {{{payment_term}}}.</p>
  <p class="mb-4 text-justify">2.3. Расчёты производятся в безналичном порядке либо наличными с составлением расписки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Передача недвижимости</div>
  <p class="mb-4 text-justify">3.1. Передача дома и участка производится по передаточному акту, подписываемому сторонами.</p>
  <p class="mb-4 text-justify">3.2. Покупатель становится собственником с момента государственной регистрации перехода права собственности.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности продавца</div>
  <p class="mb-4 text-justify">4.1. Передать недвижимость свободной от прав третьих лиц и обременений.</p>
  <p class="mb-4 text-justify">4.2. Передать ключи, документы и техническую документацию на дом.</p>
  <p class="mb-4 text-justify">4.3. Нести расходы по снятию с регистрационного учёта лиц, проживающих в доме, до передачи объекта.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. При изъятии недвижимости у Покупателя третьими лицами Продавец возмещает убытки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dkp-land",
    name: "Договор купли-продажи земельного участка",
    category: "realty",
    actSource: "ст. 549-558 ГК РФ, ФЗ-218",
    lastUpdated: "Август 2026",
    description: "Договор купли-продажи земельного участка (ИЖС, СНТ, ЛПХ) между физическими лицами.",
    suggestedDocs: ["dkp-house"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Морозов Виктор Иванович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4508 776655, выдан ОУФМС России по Московской обл. 01.03.2010, к.п. 500-004", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "Московская обл., д. Дубки, ул. Центральная, д. 3", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Волкова Елена Сергеевна", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4513 445566, выдан ОУФМС России по г. Москве 17.08.2015, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Соколова, д. 7, кв. 41", category: "buyer" },
      { id: "land_addr", label: "Адрес участка", type: "text", defaultValue: "Московская обл., СНТ «Дубки», уч. 42", category: "realty", validation: { required: true } },
      { id: "land_area", label: "Площадь (соток)", type: "number", defaultValue: "6", category: "realty", validation: { required: true } },
      { id: "land_cadastre", label: "Кадастровый номер", type: "text", defaultValue: "50:12:0030456:77", category: "realty", validation: { required: true } },
      { id: "land_category", label: "Категория земель", type: "text", defaultValue: "Земли сельскохозяйственного назначения, для ведения садоводства", category: "realty", validation: { required: true } },
      { id: "land_price", label: "Цена (руб.)", type: "number", defaultValue: "1200000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Один миллион двести тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "payment_term", label: "Срок оплаты (дата)", type: "date", defaultValue: "2026-09-15", category: "payment" },
      { id: "has_buildings", label: "Строения на участке", type: "text", defaultValue: "Садовая бытовка", category: "realty" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи земельного участка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец обязуется передать в собственность Покупателя земельный участок площадью {{{land_area}}} соток, кадастровый номер {{{land_cadastre}}}, расположенный по адресу: {{{land_addr}}}.</p>
  <p class="mb-4 text-justify">1.2. Категория земель: {{{land_category}}}. На участке расположены строения: {{{has_buildings}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена участка составляет <strong>{{{land_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в срок до {{{payment_term}}} наличными с составлением расписки либо в безналичном порядке.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Продавец обязуется передать участок свободным от прав третьих лиц и обременений.</p>
  <p class="mb-4 text-justify">3.2. Покупатель обязуется принять участок и оплатить его в установленный срок.</p>
  <p class="mb-4 text-justify">3.3. Переход права собственности подлежит государственной регистрации в Росреестре.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. В случае нарушения условий договора виновная сторона возмещает причинённые убытки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dogovor-zadatka",
    name: "Договор задатка при покупке недвижимости",
    category: "realty",
    actSource: "ст. 380-381 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор о задатке при покупке квартиры, дома или участка. Обеспечивает исполнение обязательств по основному договору купли-продажи.",
    suggestedDocs: ["dkp-apartment","dogovor-avansa"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Крылова Мария Олеговна", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4510 135790, выдан ОУФМС России по г. Москве 12.02.2011, к.п. 770-001", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Кирова, д. 21, кв. 77", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Лебедев Павел Андреевич", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4512 246810, выдан ОУФМС России по г. Москве 08.04.2014, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Кирова, д. 21, кв. 78", category: "buyer" },
      { id: "object_desc", label: "Объект недвижимости", type: "text", defaultValue: "Квартира по адресу: г. Москва, ул. Кирова, д. 21, кв. 77, площадью 58 кв. м", category: "realty", validation: { required: true } },
      { id: "main_price", label: "Цена основного договора (руб.)", type: "number", defaultValue: "7800000", category: "payment", validation: { required: true } },
      { id: "deposit_amount", label: "Сумма задатка (руб.)", type: "number", defaultValue: "150000", category: "payment", validation: { required: true } },
      { id: "deposit_words", label: "Сумма задатка прописью", type: "text", defaultValue: "Сто пятьдесят тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "deposit_term", label: "Срок заключения основного договора (дата)", type: "date", defaultValue: "2026-09-25", category: "payment", validation: { required: true } },
      { id: "deposit_date", label: "Дата передачи задатка", type: "date", defaultValue: "2026-08-15", category: "payment" },
      { id: "receipt_note", label: "Расписка в получении задатка", type: "text", defaultValue: "Расписка от 15.08.2026 прилагается", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор задатка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Покупатель передаёт Продавцу задаток в размере <strong>{{{deposit_amount}}} ({{{deposit_words}}}) рублей</strong> в счёт причитающихся платежей по основному договору купли-продажи объекта: {{{object_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Цена объекта по основному договору составляет {{{main_price}}} рублей.</p>
  <p class="mb-4 text-justify">1.3. Задаток передаётся {{{deposit_date}}}: {{{receipt_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязательства сторон</div>
  <p class="mb-4 text-justify">2.1. Стороны обязуются заключить основной договор купли-продажи в срок до {{{deposit_term}}}.</p>
  <p class="mb-4 text-justify">2.2. Сумма задатка засчитывается в счёт оплаты цены объекта при заключении основного договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Последствия неисполнения обязательств</div>
  <p class="mb-4 text-justify">3.1. Если за неисполнение обязательств ответственен Покупатель, задаток остаётся у Продавца.</p>
  <p class="mb-4 text-justify">3.2. Если за неисполнение обязательств ответственен Продавец, он обязан вернуть Покупателю двойную сумму задатка.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Возврат задатка</div>
  <p class="mb-4 text-justify">4.1. Задаток подлежит возврату в полном объёме, если основной договор не был заключён по соглашению сторон либо вследствие невозможности исполнения, не связанной с виной сторон.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dogovor-avansa",
    name: "Договор аванса при покупке недвижимости",
    category: "realty",
    actSource: "ст. 380 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о передаче аванса (в отличие от задатка аванс всегда возвращается). Обычно используется как предварительный договор с авансовым платежом.",
    suggestedDocs: ["dogovor-zadatka","raspiska"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Гусева Наталья Викторовна", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4509 112358, выдан ОУФМС России по г. Москве 22.09.2010, к.п. 770-001", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Парковая, д. 3, кв. 15", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Соловьёв Артём Игоревич", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4511 314159, выдан ОУФМС России по г. Москве 30.11.2012, к.п. 770-003", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Парковая, д. 3, кв. 16", category: "buyer" },
      { id: "object_desc", label: "Объект недвижимости", type: "text", defaultValue: "Квартира по адресу: г. Москва, ул. Парковая, д. 3, кв. 15", category: "realty", validation: { required: true } },
      { id: "avans_amount", label: "Сумма аванса (руб.)", type: "number", defaultValue: "100000", category: "payment", validation: { required: true } },
      { id: "avans_words", label: "Сумма аванса прописью", type: "text", defaultValue: "Сто тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "main_price", label: "Цена основного договора (руб.)", type: "number", defaultValue: "6900000", category: "payment", validation: { required: true } },
      { id: "contract_term", label: "Срок заключения основного договора (дата)", type: "date", defaultValue: "2026-09-30", category: "payment", validation: { required: true } },
      { id: "return_rule", label: "Условие о возврате", type: "text", defaultValue: "Аванс возвращается в полном объёме при незаключении основного договора по любой причине", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аванса</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Покупатель передаёт Продавцу аванс в размере <strong>{{{avans_amount}}} ({{{avans_words}}}) рублей</strong> в счёт будущего договора купли-продажи объекта: {{{object_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Стороны обязуются заключить основной договор по цене {{{main_price}}} рублей в срок до {{{contract_term}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Возврат аванса</div>
  <p class="mb-4 text-justify">2.1. {{{return_rule}}}.</p>
  <p class="mb-4 text-justify">2.2. Аванс не является задатком (ст. 380 ГК РФ) и не выполняет обеспечительную функцию.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Продавец обязуется не отчуждать объект третьим лицам до заключения основного договора.</p>
  <p class="mb-4 text-justify">3.2. Покупатель обязуется в установленный срок заключить основной договор и оплатить оставшуюся сумму.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При уклонении от заключения основного договора виновная сторона возмещает убытки в размере, не превышающем суммы аванса.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "rental-residential",
    name: "Договор найма жилого помещения",
    category: "realty",
    actSource: "ст. 671-688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор найма жилого помещения (квартира, комната) между собственником и нанимателем. Безвозмездная регистрация в Росреестре не требуется, если срок до года.",
    suggestedDocs: ["dogovor-arendy-kvartiry","akt-priema-kvartiry"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "owner_fio", label: "ФИО наймодателя", type: "text", defaultValue: "Белова Татьяна Михайловна", category: "owner", validation: { required: true } },
      { id: "owner_passport", label: "Паспорт наймодателя", type: "text", defaultValue: "4510 159357, выдан ОУФМС России по г. Москве 05.05.2011, к.п. 770-001", category: "owner", validation: { required: true } },
      { id: "owner_addr", label: "Адрес наймодателя", type: "text", defaultValue: "г. Москва, ул. Весенняя, д. 6, кв. 30", category: "owner" },
      { id: "tenant_fio", label: "ФИО нанимателя", type: "text", defaultValue: "Данилов Кирилл Сергеевич", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт нанимателя", type: "text", defaultValue: "4513 456789, выдан ОУФМС России по г. Москве 19.07.2015, к.п. 770-002", category: "tenant", validation: { required: true } },
      { id: "tenant_addr", label: "Адрес регистрации нанимателя", type: "text", defaultValue: "г. Москва, ул. Зимняя, д. 2, кв. 8", category: "tenant" },
      { id: "flat_addr", label: "Адрес жилого помещения", type: "text", defaultValue: "г. Москва, ул. Весенняя, д. 6, кв. 30", category: "realty", validation: { required: true } },
      { id: "flat_area", label: "Площадь (кв. м)", type: "number", defaultValue: "42", category: "realty" },
      { id: "rent_amount", label: "Плата в месяц (руб.)", type: "number", defaultValue: "35000", category: "payment", validation: { required: true } },
      { id: "rent_words", label: "Плата прописью", type: "text", defaultValue: "Тридцать пять тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "1", category: "payment" },
      { id: "deposit", label: "Обеспечительный депозит (руб.)", type: "number", defaultValue: "35000", category: "payment" },
      { id: "term_start", label: "Дата начала найма", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания найма", type: "date", defaultValue: "2027-02-28", category: "contract", validation: { required: true } },
      { id: "utilities", label: "Коммунальные платежи", type: "text", defaultValue: "Оплачиваются нанимателем сверх платы по счётчикам", category: "payment" },
      { id: "guests", label: "Проживание третьих лиц", type: "text", defaultValue: "Разрешено только с письменного согласия наймодателя", category: "contract" },
      { id: "animals", label: "Домашние животные", type: "select", defaultValue: "запрещены", category: "contract", options: [ { label: "Запрещены", value: "запрещены" }, { label: "Разрешены (кошки)", value: "кошки" }, { label: "Разрешены", value: "разрешены" } ] },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор найма жилого помещения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{owner_fio}}}</strong> (паспорт {{{owner_passport}}}, адрес: {{{owner_addr}}}), именуемый в дальнейшем «Наймодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_addr}}}), именуемый в дальнейшем «Наниматель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Наймодатель передаёт, а Наниматель принимает во временное владение и пользование жилое помещение, расположенное по адресу: {{{flat_addr}}}, общей площадью {{{flat_area}}} кв. м.</p>
  <p class="mb-4 text-justify">1.2. Совместно с Нанимателем проживают лица: {{{guests}}}.</p>
  <p class="mb-4 text-justify">1.3. Домашние животные: {{{animals}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Плата и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Плата за пользование помещением составляет <strong>{{{rent_amount}}} ({{{rent_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Плата вносится ежемесячно до {{{pay_day}}} числа текущего месяца.</p>
  <p class="mb-4 text-justify">2.3. {{{utilities}}}.</p>
  <p class="mb-4 text-justify">2.4. Обеспечительный депозит {{{deposit}}} рублей оплачивается при заключении договора и возвращается при выселении при отсутствии задолженности и повреждений.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Наймодатель обязуется передать помещение в пригодном для проживания состоянии и производить капитальный ремонт.</p>
  <p class="mb-4 text-justify">3.2. Наниматель обязуется использовать помещение по назначению, поддерживать его в исправном состоянии, производить текущий ремонт, своевременно вносить плату.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия договора</div>
  <p class="mb-4 text-justify">4.1. Договор заключается на срок с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">4.2. По истечении срока договор может быть продлён по соглашению сторон.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. При просрочке внесения платы Наниматель уплачивает пени в размере 0,1% от суммы долга за каждый день просрочки.</p>
  <p class="mb-4 text-justify">5.2. В случае нарушения условий договора стороны несут ответственность в соответствии с законодательством РФ.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Наймодатель:</div>
      <p class="mb-1"><strong>{{{owner_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{owner_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{owner_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Наниматель:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "dogovor-arendy-kvartiry",
    name: "Договор аренды квартиры (помещения)",
    category: "realty",
    actSource: "ст. 606-625, 671-688 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды жилого помещения (квартиры, комнаты, апартаментов) для проживания или коммерческого использования.",
    suggestedDocs: ["rental-residential","akt-priema-kvartiry","dogovor-zadatka"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "landlord_fio", label: "ФИО арендодателя", type: "text", defaultValue: "Орлова Светлана Николаевна", category: "owner", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "4509 321654, выдан ОУФМС России по г. Москве 14.06.2010, к.п. 770-001", category: "owner", validation: { required: true } },
      { id: "landlord_addr", label: "Адрес арендодателя", type: "text", defaultValue: "г. Москва, ул. Полевая, д. 9, кв. 44", category: "owner" },
      { id: "tenant_fio", label: "ФИО арендатора", type: "text", defaultValue: "Романов Илья Викторович", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "4512 741852, выдан ОУФМС России по г. Москве 27.01.2014, к.п. 770-002", category: "tenant", validation: { required: true } },
      { id: "tenant_addr", label: "Адрес арендатора", type: "text", defaultValue: "г. Москва, ул. Северная, д. 4, кв. 19", category: "tenant" },
      { id: "premise_addr", label: "Адрес помещения", type: "text", defaultValue: "г. Москва, ул. Полевая, д. 9, кв. 44", category: "realty", validation: { required: true } },
      { id: "premise_area", label: "Площадь (кв. м)", type: "number", defaultValue: "38", category: "realty" },
      { id: "rent_amount", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "30000", category: "payment", validation: { required: true } },
      { id: "rent_words", label: "Плата прописью", type: "text", defaultValue: "Тридцать тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "5", category: "payment" },
      { id: "term_start", label: "Дата начала аренды", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания аренды", type: "date", defaultValue: "2027-08-31", category: "contract", validation: { required: true } },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "Для проживания арендатора", category: "contract", validation: { required: true } },
      { id: "utilities_note", label: "Коммунальные платежи", type: "text", defaultValue: "Оплачиваются арендатором отдельно по счётчикам", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды квартиры</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong> (паспорт {{{landlord_passport}}}, адрес: {{{landlord_addr}}}), именуемый в дальнейшем «Арендодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_addr}}}), именуемый в дальнейшем «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Арендодатель предоставляет, а Арендатор принимает во временное владение и пользование помещение по адресу: {{{premise_addr}}}, площадью {{{premise_area}}} кв. м, для цели: {{{purpose}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">2.1. Арендная плата составляет <strong>{{{rent_amount}}} ({{{rent_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Плата вносится ежемесячно до {{{pay_day}}} числа.</p>
  <p class="mb-4 text-justify">2.3. {{{utilities_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Арендодатель обязуется передать помещение в состоянии, соответствующем договору, и не препятствовать пользованию им.</p>
  <p class="mb-4 text-justify">3.2. Арендатор обязуется использовать помещение по назначению, поддерживать его в исправном состоянии, своевременно вносить арендную плату.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок договора</div>
  <p class="mb-4 text-justify">4.1. Договор действует с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">4.2. По истечении срока договор считается возобновлённым на тех же условиях, если ни одна из сторон не заявит о его прекращении.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку арендной платы Арендатор уплачивает пени 0,1% за каждый день просрочки.</p>
  <p class="mb-4 text-justify">5.2. Досрочное расторжение возможно по соглашению сторон или в судебном порядке.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{landlord_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{landlord_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{landlord_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "rental-garage",
    name: "Договор аренды гаража (машино-места)",
    category: "realty",
    actSource: "ст. 606-625 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды гаража, бокса или машино-места для хранения автомобиля.",
    suggestedDocs: ["dogovor-arendy-kvartiry"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "landlord_fio", label: "ФИО арендодателя", type: "text", defaultValue: "Кузнецов Сергей Владимирович", category: "owner", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "4510 159357, выдан ОУФМС России по г. Москве 25.12.2011, к.п. 770-001", category: "owner", validation: { required: true } },
      { id: "landlord_addr", label: "Адрес арендодателя", type: "text", defaultValue: "г. Москва, ул. Гаражная, д. 2, кв. 17", category: "owner" },
      { id: "tenant_fio", label: "ФИО арендатора", type: "text", defaultValue: "Никитин Павел Юрьевич", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "4512 753159, выдан ОУФМС России по г. Москве 30.04.2014, к.п. 770-002", category: "tenant", validation: { required: true } },
      { id: "tenant_addr", label: "Адрес арендатора", type: "text", defaultValue: "г. Москва, ул. Шоссейная, д. 8, кв. 31", category: "tenant" },
      { id: "garage_addr", label: "Адрес/расположение гаража", type: "text", defaultValue: "ГСК «Автолюбитель-3», бокс № 17, г. Москва, ул. Гаражная", category: "realty", validation: { required: true } },
      { id: "garage_area", label: "Площадь (кв. м)", type: "number", defaultValue: "18", category: "realty" },
      { id: "rent_amount", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "8000", category: "payment", validation: { required: true } },
      { id: "rent_words", label: "Плата прописью", type: "text", defaultValue: "Восемь тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "1", category: "payment" },
      { id: "term_start", label: "Дата начала аренды", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания аренды", type: "date", defaultValue: "2027-08-31", category: "contract", validation: { required: true } },
      { id: "utilities", label: "Коммунальные платежи", type: "text", defaultValue: "Оплата электроэнергии — по счётчику арендатором", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды гаража (машино-места)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong> (паспорт {{{landlord_passport}}}, адрес: {{{landlord_addr}}}), именуемый в дальнейшем «Арендодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_addr}}}), именуемый в дальнейшем «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Арендодатель предоставляет Арендатору во временное пользование гараж (машино-место), расположенный по адресу: {{{garage_addr}}}, площадью {{{garage_area}}} кв. м, для хранения автомобиля.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">2.1. Арендная плата составляет <strong>{{{rent_amount}}} ({{{rent_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Плата вносится ежемесячно до {{{pay_day}}} числа.</p>
  <p class="mb-4 text-justify">2.3. {{{utilities}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Арендодатель обязуется предоставить гараж в состоянии, пригодном для использования.</p>
  <p class="mb-4 text-justify">3.2. Арендатор обязуется поддерживать гараж в исправном состоянии, не хранить запрещённые вещества, своевременно вносить плату.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок договора</div>
  <p class="mb-4 text-justify">4.1. Договор действует с {{{term_start}}} по {{{term_end}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку арендной платы Арендатор уплачивает пени 0,1% за каждый день просрочки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{landlord_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{landlord_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{landlord_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "realty-agency",
    name: "Договор с риелтором (услуги по продаже недвижимости)",
    category: "realty",
    actSource: "ст. 779-783 ГК РФ, ФЗ-135 «Об оценочной деятельности»",
    lastUpdated: "Август 2026",
    description: "Договор возмездного оказания услуг с агентством недвижимости или частным риелтором на подбор/продажу объекта.",
    suggestedDocs: ["dkp-apartment","preliminary-sale"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "client_fio", label: "ФИО заказчика", type: "text", defaultValue: "Савельева Ирина Геннадьевна", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "4511 258147, выдан ОУФМС России по г. Москве 17.10.2012, к.п. 770-003", category: "customer", validation: { required: true } },
      { id: "client_addr", label: "Адрес заказчика", type: "text", defaultValue: "г. Москва, ул. Ореховая, д. 14, кв. 88", category: "customer" },
      { id: "agency_name", label: "Название агентства", type: "text", defaultValue: "ООО «Агентство недвижимости Престиж»", category: "contractor", validation: { required: true } },
      { id: "agency_inn", label: "ИНН агентства", type: "text", defaultValue: "7709876543", category: "contractor", validation: { required: true } },
      { id: "agency_addr", label: "Юр. адрес агентства", type: "text", defaultValue: "г. Москва, ул. Агентская, д. 1, офис 10", category: "contractor" },
      { id: "object_desc", label: "Объект недвижимости", type: "text", defaultValue: "Квартира, г. Москва, ул. Ореховая, д. 14, кв. 88, 2 комнаты, 50 кв. м", category: "realty", validation: { required: true } },
      { id: "sell_price", label: "Цена продажи (руб.)", type: "number", defaultValue: "7800000", category: "payment", validation: { required: true } },
      { id: "commission", label: "Вознаграждение (руб.)", type: "number", defaultValue: "78000", category: "payment", validation: { required: true } },
      { id: "commission_words", label: "Вознаграждение прописью", type: "text", defaultValue: "Семьдесят восемь тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок оказания услуг (дата)", type: "date", defaultValue: "2026-12-01", category: "contract", validation: { required: true } },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "Оценка объекта, фотосъёмка, размещение рекламы, показы, организация сделки, сопровождение регистрации перехода права", category: "contract", validation: { required: true } },
      { id: "exclusive", label: "Эксклюзивное поручение", type: "select", defaultValue: "да", category: "contract", options: [ { label: "Да", value: "да" }, { label: "Нет", value: "нет" } ] },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания риелторских услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}, адрес: {{{client_addr}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{agency_name}}}</strong> (ИНН {{{agency_inn}}}, адрес: {{{agency_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказать Заказчику услуги по продаже объекта: {{{object_desc}}}, а Заказчик обязуется оплатить услуги.</p>
  <p class="mb-4 text-justify">1.2. Перечень услуг: {{{services_list}}}.</p>
  <p class="mb-4 text-justify">1.3. Поручение является {{{exclusive}}} эксклюзивным.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">2.1. Вознаграждение Исполнителя составляет <strong>{{{commission}}} ({{{commission_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Вознаграждение выплачивается после подписания основного договора купли-продажи объекта.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется качественно и в срок оказать услуги, информировать Заказчика о ходе исполнения.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязуется предоставить документы и доступ в объект, не заключать аналогичные договоры с третьими лицами при эксклюзивном поручении.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия</div>
  <p class="mb-4 text-justify">4.1. Услуги оказываются в срок до {{{deadline}}}.</p>
  <p class="mb-4 text-justify">4.2. Договор может быть расторгнут по соглашению сторон.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. При неисполнении обязательств виновная сторона возмещает убытки в пределах суммы вознаграждения.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{client_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{client_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{client_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{agency_name}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{agency_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{agency_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "free-use-apartment",
    name: "Договор безвозмездного пользования квартирой (ссуды)",
    category: "realty",
    actSource: "ст. 689-701 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор безвозмездного пользования (ссуда) жилым помещением — передача квартиры в бесплатное пользование.",
    suggestedDocs: ["rental-residential"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "lender_fio", label: "ФИО ссудодателя", type: "text", defaultValue: "Мельникова Оксана Ивановна", category: "owner", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт ссудодателя", type: "text", defaultValue: "4509 852147, выдан ОУФМС России по г. Москве 06.08.2010, к.п. 770-001", category: "owner", validation: { required: true } },
      { id: "lender_addr", label: "Адрес ссудодателя", type: "text", defaultValue: "г. Москва, ул. Тихая, д. 6, кв. 22", category: "owner" },
      { id: "borrower_fio", label: "ФИО ссудополучателя", type: "text", defaultValue: "Галкин Роман Эдуардович", category: "borrower", validation: { required: true } },
      { id: "borrower_passport", label: "Паспорт ссудополучателя", type: "text", defaultValue: "4513 369258, выдан ОУФМС России по г. Москве 12.03.2016, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "borrower_addr", label: "Адрес ссудополучателя", type: "text", defaultValue: "г. Москва, ул. Громкая, д. 9, кв. 40", category: "borrower" },
      { id: "flat_addr", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Тихая, д. 6, кв. 22", category: "realty", validation: { required: true } },
      { id: "flat_area", label: "Площадь (кв. м)", type: "number", defaultValue: "46", category: "realty" },
      { id: "term_start", label: "Дата начала", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания", type: "date", defaultValue: "2027-08-31", category: "contract", validation: { required: true } },
      { id: "utilities_note", label: "Коммунальные платежи", type: "text", defaultValue: "Оплачиваются ссудополучателем", category: "payment" },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "Для постоянного проживания", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор безвозмездного пользования квартирой</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong> (паспорт {{{lender_passport}}}, адрес: {{{lender_addr}}}), именуемый в дальнейшем «Ссудодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{borrower_fio}}}</strong> (паспорт {{{borrower_passport}}}, адрес: {{{borrower_addr}}}), именуемый в дальнейшем «Ссудополучатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Ссудодатель передаёт в безвозмездное временное пользование квартиру по адресу: {{{flat_addr}}}, площадью {{{flat_area}}} кв. м.</p>
  <p class="mb-4 text-justify">1.2. Цель использования: {{{purpose}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Обязанности сторон</div>
  <p class="mb-4 text-justify">2.1. Ссудодатель обязуется передать квартиру в состоянии, пригодном для использования, и не препятствовать пользованию.</p>
  <p class="mb-4 text-justify">2.2. Ссудополучатель обязуется поддерживать квартиру в исправном состоянии, нести расходы на её содержание: {{{utilities_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок договора</div>
  <p class="mb-4 text-justify">3.1. Договор действует с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">3.2. Досрочный отказ от договора возможен по правилам ст. 698 ГК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За порчу квартиры ссудополучатель возмещает ущерб.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Ссудодатель:</div>
      <p class="mb-1"><strong>{{{lender_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lender_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lender_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Ссудополучатель:</div>
      <p class="mb-1"><strong>{{{borrower_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{borrower_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{borrower_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "mortgage-rent",
    name: "Договор аренды с правом выкупа",
    category: "realty",
    actSource: "ст. 624 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аренды жилого помещения с последующим выкупом (аренда с правом выкупа) — постепенный выкуп квартиры с зачётом арендных платежей.",
    suggestedDocs: ["rental-residential","dkp-apartment"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "landlord_fio", label: "ФИО арендодателя", type: "text", defaultValue: "Соболев Вадим Романович", category: "owner", validation: { required: true } },
      { id: "landlord_passport", label: "Паспорт арендодателя", type: "text", defaultValue: "4510 963741, выдан ОУФМС России по г. Москве 28.02.2011, к.п. 770-001", category: "owner", validation: { required: true } },
      { id: "landlord_addr", label: "Адрес арендодателя", type: "text", defaultValue: "г. Москва, ул. Берёзовая, д. 2, кв. 5", category: "owner" },
      { id: "tenant_fio", label: "ФИО арендатора", type: "text", defaultValue: "Прохорова Ксения Денисовна", category: "tenant", validation: { required: true } },
      { id: "tenant_passport", label: "Паспорт арендатора", type: "text", defaultValue: "4512 147258, выдан ОУФМС России по г. Москве 23.07.2014, к.п. 770-002", category: "tenant", validation: { required: true } },
      { id: "tenant_addr", label: "Адрес арендатора", type: "text", defaultValue: "г. Москва, ул. Кленовая, д. 4, кв. 66", category: "tenant" },
      { id: "flat_addr", label: "Адрес квартиры", type: "text", defaultValue: "г. Москва, ул. Берёзовая, д. 2, кв. 5", category: "realty", validation: { required: true } },
      { id: "buyout_price", label: "Выкупная цена (руб.)", type: "number", defaultValue: "9000000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Девять миллионов рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "monthly_pay", label: "Ежемесячный платёж (руб.)", type: "number", defaultValue: "50000", category: "payment", validation: { required: true } },
      { id: "pay_words", label: "Платёж прописью", type: "text", defaultValue: "Пятьдесят тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "10", category: "payment" },
      { id: "term_months", label: "Срок (месяцев)", type: "number", defaultValue: "60", category: "contract" },
      { id: "term_start", label: "Дата начала", type: "date", defaultValue: "2026-09-01", category: "contract", validation: { required: true } },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды с правом выкупа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{landlord_fio}}}</strong> (паспорт {{{landlord_passport}}}, адрес: {{{landlord_addr}}}), именуемый в дальнейшем «Арендодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{tenant_fio}}}</strong> (паспорт {{{tenant_passport}}}, адрес: {{{tenant_addr}}}), именуемый в дальнейшем «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Арендодатель передаёт Арендатору во временное владение и пользование квартиру по адресу: {{{flat_addr}}} с правом последующего выкупа.</p>
  <p class="mb-4 text-justify">1.2. Выкупная цена квартиры составляет <strong>{{{buyout_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">2.1. Арендная плата составляет <strong>{{{monthly_pay}}} ({{{pay_words}}}) рублей</strong> в месяц и вносится до {{{pay_day}}} числа каждого месяца.</p>
  <p class="mb-4 text-justify">2.2. Сумма арендных платежей в размере 100% засчитывается в счёт выкупной цены квартиры.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Выкуп квартиры</div>
  <p class="mb-4 text-justify">3.1. После внесения платежей, составляющих {{{buyout_price}}} рублей (включая зачёркнутые арендные платежи), Арендатор вправе потребовать заключения договора купли-продажи квартиры.</p>
  <p class="mb-4 text-justify">3.2. Срок выкупа: {{{term_months}}} месяцев с даты начала {{{term_start}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности сторон</div>
  <p class="mb-4 text-justify">4.1. Арендатор обязуется своевременно вносить платежи и содержать квартиру в надлежащем состоянии.</p>
  <p class="mb-4 text-justify">4.2. Арендодатель обязуется не отчуждать квартиру третьим лицам до исполнения условий договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. При просрочке платежей более 2 месяцев Арендодатель вправе расторгнуть договор, вернув уплаченные суммы за вычетом арендной платы.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендодатель:</div>
      <p class="mb-1"><strong>{{{landlord_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{landlord_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{landlord_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{tenant_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{tenant_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{tenant_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "realty-option",
    name: "Договор опциона на покупку недвижимости",
    category: "realty",
    actSource: "ст. 429.2, 429.3 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Опцион на заключение договора купли-продажи недвижимости — право покупателя купить объект по фиксированной цене в течение срока.",
    suggestedDocs: ["preliminary-sale","dkp-apartment"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "seller_fio", label: "ФИО продавца", type: "text", defaultValue: "Жуков Аркадий Борисович", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "4511 456123, выдан ОУФМС России по г. Москве 07.07.2013, к.п. 770-003", category: "seller", validation: { required: true } },
      { id: "seller_addr", label: "Адрес продавца", type: "text", defaultValue: "г. Москва, ул. Третья, д. 3, кв. 3", category: "seller" },
      { id: "buyer_fio", label: "ФИО покупателя", type: "text", defaultValue: "Лаврова Диана Артуровна", category: "buyer", validation: { required: true } },
      { id: "buyer_passport", label: "Паспорт покупателя", type: "text", defaultValue: "4513 789456, выдан ОУФМС России по г. Москве 19.09.2016, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "buyer_addr", label: "Адрес покупателя", type: "text", defaultValue: "г. Москва, ул. Четвёртая, д. 4, кв. 4", category: "buyer" },
      { id: "object_desc", label: "Объект недвижимости", type: "text", defaultValue: "Квартира по адресу: г. Москва, ул. Третья, д. 3, кв. 3, 60 кв. м", category: "realty", validation: { required: true } },
      { id: "fix_price", label: "Цена выкупа (руб.)", type: "number", defaultValue: "11000000", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "Одиннадцать миллионов рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "option_price", label: "Цена опциона (руб.)", type: "number", defaultValue: "50000", category: "payment" },
      { id: "option_term", label: "Срок опциона (дата)", type: "date", defaultValue: "2026-12-31", category: "contract", validation: { required: true } },
      { id: "exercise_term", label: "Срок заявления об акцепте (дней)", type: "number", defaultValue: "30", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор опциона на заключение договора купли-продажи</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}, адрес: {{{seller_addr}}}), именуемый в дальнейшем «Продавец», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{buyer_fio}}}</strong> (паспорт {{{buyer_passport}}}, адрес: {{{buyer_addr}}}), именуемый в дальнейшем «Покупатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет опциона</div>
  <p class="mb-4 text-justify">1.1. Покупатель приобретает право заключить договор купли-продажи объекта: {{{object_desc}}} по цене <strong>{{{fix_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. За предоставление опциона Покупатель уплачивает {{{option_price}}} рублей, которые засчитываются в счёт цены выкупа при реализации опциона.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок реализации опциона</div>
  <p class="mb-4 text-justify">2.1. Опцион может быть реализован в любой момент до {{{option_term}}}.</p>
  <p class="mb-4 text-justify">2.2. Для реализации опциона Покупатель направляет Продавцу заявление об акцепте не позднее чем за {{{exercise_term}}} дней до даты заключения договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Последствия нереализации</div>
  <p class="mb-4 text-justify">3.1. Если опцион не реализован до {{{option_term}}}, он прекращается, а уплаченная цена опциона не возвращается.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии продавца</div>
  <p class="mb-4 text-justify">4.1. Продавец гарантирует, что объект свободен от прав третьих лиц и обременений, и обязуется не отчуждать его до {{{option_term}}}.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1"><strong>{{{seller_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{seller_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{seller_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1"><strong>{{{buyer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{buyer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{buyer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "notice-rent-termination",
    name: "Уведомление о расторжении договора аренды",
    category: "realty",
    actSource: "ст. 610, 450.1 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Уведомление арендатора или арендодателя о расторжении договора аренды с указанием срока освобождения помещения.",
    suggestedDocs: ["rental-agreement","apartment-rental","claim-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "applicant_fio", label: "ФИО отправителя", type: "text", defaultValue: "Ковалёв Денис Викторович", category: "sender", validation: { required: true } },
      { id: "recipient", label: "Кому", type: "text", defaultValue: "Ковалёва Екатерина Игоревна", category: "recipient", validation: { required: true } },
      { id: "agreement", label: "Договор аренды", type: "text", defaultValue: "договор аренды квартиры от 01.02.2025 № 8", category: "contract", validation: { required: true } },
      { id: "termination_date", label: "Дата расторжения", type: "date", defaultValue: "2026-11-01", category: "contract", validation: { required: true } },
      { id: "reason", label: "Причина", type: "text", defaultValue: "истечение срока аренды", category: "contract", validation: { required: true } },
      { id: "vacate_date", label: "Срок освобождения", type: "date", defaultValue: "2026-10-31", category: "contract" },
      { id: "transfer_date", label: "Дата передачи помещения", type: "date", defaultValue: "2026-10-31", category: "contract" },
      { id: "send_method", label: "Способ направления", type: "text", defaultValue: "заказное письмо с уведомлением", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Уведомление о расторжении договора аренды</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>

  <div class="font-bold mb-2 text-black text-xs uppercase">1. Уведомление</div>
  <p class="mb-4 text-justify">1.1. Настоящим уведомляю о расторжении {{{agreement}}} с «{{{termination_date}}}» по причине: {{{reason}}}.</p>
  <p class="mb-4 text-justify">1.2. Прошу освободить помещение и передать его по акту приёма-передачи {{{transfer_date}}}.</p>
  <p class="mb-4 text-justify">1.3. Расчёты по арендной плате и коммунальным услугам произвести до {{{termination_date}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки</div>
  <p class="mb-4 text-justify">2.1. Уведомление направляется за {{{notice_days}}} дней до расторжения, что соответствует требованиям ст. 610 ГК РФ.</p>
  <p class="mb-4 text-justify">2.2. В случае неисполнения требования буду вынужден обратиться в суд за защитой своих прав.</p>

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
    id: "rent-agreement",
    name: "Договор ренты с пожизненным содержанием с иждивением",
    category: "realty",
    actSource: "ст. 583-605 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор пожизненной ренты с пожизненным содержанием с иждивением: передача квартиры в обмен на содержание и уход.",
    suggestedDocs: ["dkp-flat","gift-flat"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "recipient_fio", label: "ФИО получателя ренты", type: "text", defaultValue: "Смирнова Валентина Петровна", category: "recipient", validation: { required: true } },
      { id: "recipient_passport", label: "Паспорт получателя", type: "text", defaultValue: "4507 123456, выдан ОВД района Люблино г. Москвы 12.04.2007, к.п. 770-005", category: "recipient", validation: { required: true } },
      { id: "recipient_addr", label: "Адрес получателя", type: "text", defaultValue: "г. Москва, ул. Рентная, д. 1, кв. 8", category: "recipient" },
      { id: "payer_fio", label: "ФИО плательщика ренты", type: "text", defaultValue: "Никитин Андрей Сергеевич", category: "payer", validation: { required: true } },
      { id: "payer_passport", label: "Паспорт плательщика", type: "text", defaultValue: "4511 987654, выдан ОУФМС России по г. Москве 25.08.2013, к.п. 770-003", category: "payer", validation: { required: true } },
      { id: "payer_addr", label: "Адрес плательщика", type: "text", defaultValue: "г. Москва, ул. Рентная, д. 1, кв. 8", category: "payer" },
      { id: "property", label: "Предмет ренты", type: "text", defaultValue: "квартира по адресу: г. Москва, ул. Рентная, д. 1, кв. 8 (кадастровый номер 77:01:0000001:123)", category: "property", validation: { required: true } },
      { id: "rent_amount", label: "Размер ренты (руб./мес.)", type: "number", defaultValue: "45000", category: "payment", validation: { required: true } },
      { id: "rent_words", label: "Сумма прописью", type: "text", defaultValue: "Сорок пять тысяч рублей", category: "payment" },
      { id: "care_scope", label: "Объём содержания", type: "textarea", defaultValue: "обеспечение питанием, одеждой, уход, оплата жилищно-коммунальных услуг, медикаменты", category: "contract", validation: { required: true } },
      { id: "housing_right", label: "Право проживания", type: "text", defaultValue: "получатель ренты сохраняет право бесплатного пожизненного пользования квартирой", category: "contract" },
      { id: "notary_note", label: "Нотариальное удостоверение", type: "text", defaultValue: "договор подлежит нотариальному удостоверению и государственной регистрации", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор ренты с пожизненным содержанием с иждивением</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{recipient_fio}}}</strong> (паспорт {{{recipient_passport}}}, адрес: {{{recipient_addr}}}), именуемый в дальнейшем «Получатель ренты», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{payer_fio}}}</strong> (паспорт {{{payer_passport}}}, адрес: {{{payer_addr}}}), именуемый в дальнейшем «Плательщик ренты», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Получатель ренты передаёт Плательщику ренты в собственность: {{{property}}}.</p>
  <p class="mb-4 text-justify">1.2. Взамен Получатель ренты получает пожизненное содержание с иждивением: {{{care_scope}}}, а также денежные выплаты в размере {{{rent_amount}}} руб. ({{{rent_words}}}) ежемесячно.</p>
  <p class="mb-4 text-justify">1.3. {{{housing_right}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности</div>
  <p class="mb-4 text-justify">2.1. Плательщик ренты обязуется обеспечивать содержание и уход в полном объёме, своевременно выплачивать ренту.</p>
  <p class="mb-4 text-justify">2.2. Получатель ренты обязуется передать имущество по акту приёма-передачи.</p>
  <p class="mb-4 text-justify">2.3. {{{notary_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. При существенном нарушении обязательств получатель ренты вправе потребовать возврата имущества (ст. 605 ГК РФ) или выплаты выкупной цены.</p>
  <p class="mb-4 text-justify">3.2. По требованию получателя ренты плательщик предоставляет обеспечение исполнения обязательств.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Получатель ренты:</div>
      <p class="mb-1"><strong>{{{recipient_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{recipient_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{recipient_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Плательщик ренты:</div>
      <p class="mb-1"><strong>{{{payer_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{payer_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{payer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  }
];
