import type { LegalTemplate } from "../types";

export const TEMPLATES_BUSINESS: LegalTemplate[] = [
{
    id: "service-agreement",
    name: "Договор оказания услуг",
    category: "business",
    actSource: "ст. 779–783 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор возмездного оказания услуг между юридическими лицами или ИП.",
    suggestedDocs: ["act-services", "invoice"],
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
        id: "executor_company", label: "Наименование Исполнителя", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "executor_inn", label: "ИНН Исполнителя", type: "text", defaultValue: "",
        category: "executor",
      },
      {
        id: "executor_address", label: "Адрес Исполнителя", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "executor_director", label: "Директор Исполнителя", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "customer_company", label: "Наименование Заказчика", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "customer_inn", label: "ИНН Заказчика", type: "text", defaultValue: "",
        category: "customer",
      },
      {
        id: "customer_address", label: "Адрес Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "customer_director", label: "Директор Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "service_description", label: "Описание услуг", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "contract_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "payment_terms", label: "Условия оплаты", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "start_date", label: "Дата начала работ", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "end_date", label: "Дата окончания работ", type: "date", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong>, ИНН {{{executor_inn}}}, в лице директора {{{executor_director}}}, именуемый «Исполнитель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong>, ИНН {{{customer_inn}}}, в лице директора {{{customer_director}}}, именуемый «Заказчик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется оказать Заказчику следующие услуги: <strong>{{{service_description}}}</strong>
  </p>
  <p class="mb-4 text-justify">
    1.2. Срок оказания услуг: с «{{{start_date}}}» по «{{{end_date}}}»
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок оплаты</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость услуг составляет <strong>{{{contract_price}}} руб.</strong>
  </p>
  <p class="mb-4 text-justify">2.2. Порядок оплаты: {{{payment_terms}}}.</p>
  
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
      <div class="font-bold mb-1">Исполнитель:</div>
      <p><strong>{{{executor_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Заказчик:</div>
      <p><strong>{{{customer_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "contract-works",
    name: "Договор подряда (строительные работы)",
    category: "business",
    actSource: "ст. 702–729 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор подряда на выполнение строительно-ремонтных работ между заказчиком и подрядчиком.",
    suggestedDocs: ["act-works", "invoice"],
    printInstruction: "Печатать в 2-х экземплярах, приложить смету",
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
        id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "",
        category: "customer", validation: { required: true },
      },
      {
        id: "customer_passport", label: "Паспорт Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "customer_address", label: "Адрес Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "contractor_company", label: "Наименование Подрядчика", type: "text",
        defaultValue: "", category: "contractor", validation: { required: true },
      },
      {
        id: "contractor_inn", label: "ИНН Подрядчика", type: "text", defaultValue: "",
        category: "contractor",
      },
      {
        id: "contractor_director", label: "Директор Подрядчика", type: "text",
        defaultValue: "", category: "contractor",
      },
      {
        id: "work_description", label: "Описание работ", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "work_address", label: "Адрес выполнения работ", type: "text",
        defaultValue: "", category: "contract",
        validation: { required: true },
      },
      {
        id: "contract_price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "payment_terms", label: "Условия оплаты", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "start_date", label: "Дата начала работ", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "end_date", label: "Дата окончания работ", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "warranty_period", label: "Гарантийный период (мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор подряда</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{customer_fio}}}</strong>, паспорт {{{customer_passport}}}, зарегистрированный по адресу: {{{customer_address}}}, именуемый «Заказчик», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{contractor_company}}}</strong>, ИНН {{{contractor_inn}}}, в лице директора {{{contractor_director}}}, именуемый «Подрядчик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Подрядчик обязуется выполнить следующие работы: <strong>{{{work_description}}}</strong>
  </p>
  <p class="mb-4 text-justify">1.2. Место выполнения работ: {{{work_address}}}</p>
  <p class="mb-4 text-justify">1.3. Сроки: с «{{{start_date}}}» по «{{{end_date}}}»</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и оплата</div>
  <p class="mb-4 text-justify">
    2.1. Стоимость работ: <strong>{{{contract_price}}} руб.</strong>
  </p>
  <p class="mb-4 text-justify">2.2. Порядок оплаты: {{{payment_terms}}}</p>
  <p class="mb-4 text-justify">2.3. Гарантийный период: {{{warranty_period}}} месяцев.</p>
  
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
      <div class="font-bold mb-1">Заказчик:</div>
      <p><strong>{{{customer_fio}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Подрядчик:</div>
      <p><strong>{{{contractor_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "supply-contract",
    name: "Договор поставки товаров",
    category: "business",
    actSource: "ст. 506–524 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Договор поставки товаров между поставщиком и покупателем (юридические лица, ИП).",
    suggestedDocs: ["invoice", "act-transfer-auto"],
    printInstruction: "Печатать в 2-х экземплярах, спецификацию приложить",
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
        id: "supplier_company", label: "Наименование Поставщика", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "supplier_inn", label: "ИНН Поставщика", type: "text", defaultValue: "",
        category: "executor",
      },
      {
        id: "supplier_director", label: "Директор Поставщика", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "buyer_company", label: "Наименование Покупателя", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "buyer_inn", label: "ИНН Покупателя", type: "text", defaultValue: "",
        category: "customer",
      },
      {
        id: "buyer_director", label: "Директор Покупателя", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "goods_description", label: "Товар (наименование, ассортимент)", type: "textarea", rows: 4,
        defaultValue: "",
        category: "items", validation: { required: true },
      },
      {
        id: "goods_quantity", label: "Количество", type: "text",
        defaultValue: "", category: "items",
      },
      {
        id: "contract_price", label: "Сумма поставки (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "delivery_terms", label: "Условия поставки", type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "delivery_address", label: "Адрес доставки", type: "text",
        defaultValue: "", category: "contract",
      },
      {
        id: "payment_terms", label: "Условия оплаты", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "warranty_period", label: "Гарантийный срок (мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поставки</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_company}}}</strong>, ИНН {{{supplier_inn}}}, в лице директора {{{supplier_director}}}, действующего на основании Устава, именуемый «Поставщик», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{buyer_company}}}</strong>, ИНН {{{buyer_inn}}}, в лице директора {{{buyer_director}}}, действующего на основании Устава, именуемый «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Поставщик обязуется передать в собственность Покупателя товар: <strong>{{{goods_description}}}</strong>, в количестве {{{goods_quantity}}}, а Покупатель — принять и оплатить его.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и оплата</div>
  <p class="mb-4 text-justify">
    2.1. Общая стоимость товара составляет <strong>{{{contract_price}}}</strong> ({{{contract_price_words}}}) .
  </p>
  <p class="mb-4 text-justify">2.2. Порядок оплаты: {{{payment_terms}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Поставка и приёмка</div>
  <p class="mb-4 text-justify">
    3.1. Условия поставки: {{{delivery_terms}}}. Доставка осуществляется по адресу: {{{delivery_address}}}.
  </p>
  <p class="mb-4 text-justify">
    3.2. Приёмка товара подтверждается подписанием товарной накладной (УПД) в день доставки.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантия и ответственность</div>
  <p class="mb-4 text-justify">
    4.1. Гарантийный срок на товар составляет {{{warranty_period}}} месяцев с момента передачи.
  </p>
  <p class="mb-4 text-justify">
    4.2. За просрочку поставки или оплаты виновная сторона уплачивает неустойку в размере 0,1% от суммы договора за каждый день просрочки.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Поставщик:</div>
      <p><strong>{{{supplier_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Покупатель:</div>
      <p><strong>{{{buyer_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "agreement-confidentiality",
    name: "Соглашение о конфиденциальности (NDA)",
    category: "business",
    actSource: "ст. 1465–1470 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Двустороннее соглашение о неразглашении конфиденциальной информации между компаниями.",
    suggestedDocs: [],
    printInstruction: "Печатать в 2-х экземплярах",
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
        id: "party_a_company", label: "Сторона А (наименование)", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "party_a_inn", label: "ИНН Стороны А", type: "text", defaultValue: "",
        category: "executor",
      },
      {
        id: "party_a_director", label: "Директор Стороны А", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "party_b_company", label: "Сторона Б (наименование)", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "party_b_inn", label: "ИНН Стороны Б", type: "text", defaultValue: "",
        category: "customer",
      },
      {
        id: "party_b_director", label: "Директор Стороны Б", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "subject", label: "Предмет сотрудничества", type: "text",
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "cover_subject", label: "Что является конфиденциальным", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract",
      },
      {
        id: "duration_months", label: "Срок действия обязательства (мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "penalty", label: "Неустойка за разглашение (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о конфиденциальности</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{party_a_company}}}</strong>, ИНН {{{party_a_inn}}}, в лице директора {{{party_a_director}}}, именуемая «Сторона А», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{party_b_company}}}</strong>, ИНН {{{party_b_inn}}}, в лице директора {{{party_b_director}}}, именуемая «Сторона Б», с другой стороны, заключили настоящее соглашение о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет</div>
  <p class="mb-4 text-justify">
    1.1. В связи с {{{subject}}} Стороны обязуются не разглашать конфиденциальную информацию, полученную друг от друга.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Состав конфиденциальной информации</div>
  <p class="mb-4 text-justify">
    2.1. К конфиденциальной информации относятся: {{{cover_subject}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязательства сторон</div>
  <p class="mb-4 text-justify">
    3.1. Стороны обязуются использовать информацию исключительно в целях сотрудничества и обеспечивать её охрану наравне с собственной конфиденциальной информацией.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия и ответственность</div>
  <p class="mb-4 text-justify">
    4.1. Обязательства действуют в течение {{{duration_months}}} месяцев после прекращения сотрудничества.
  </p>
  <p class="mb-4 text-justify">
    4.2. За разглашение информации виновная сторона уплачивает другой стороне штраф в размере {{{penalty}}} руб. и возмещает причинённые убытки.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Сторона А:</div>
      <p><strong>{{{party_a_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Сторона Б:</div>
      <p><strong>{{{party_b_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "it-development",
    name: "Договор на разработку ПО",
    category: "business",
    actSource: "ст. 702, 1235–1236 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Договор разработки программного обеспечения: предмет, этапы, права на код, гарантия.",
    suggestedDocs: ["act-transfer-auto", "agreement-confidentiality"],
    printInstruction: "Печатать в 2-х экземплярах, техническое задание приложить",
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
        id: "dev_company", label: "Наименование Исполнителя (разработчик)", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "dev_inn", label: "ИНН Исполнителя", type: "text", defaultValue: "",
        category: "executor",
      },
      {
        id: "dev_director", label: "Директор Исполнителя", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "client_company", label: "Наименование Заказчика", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "client_inn", label: "ИНН Заказчика", type: "text", defaultValue: "",
        category: "customer",
      },
      {
        id: "client_director", label: "Директор Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "project_scope", label: "Описание функциональности", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "tech_stack", label: "Технологии", type: "text",
        defaultValue: "", category: "contract",
      },
      {
        id: "deadline", label: "Срок разработки (дней)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "contract_price", label: "Стоимость разработки (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "payment_stages", label: "Порядок оплаты (этапы)", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "warranty_months", label: "Гарантийная поддержка (мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "ip_rights", label: "Права на результат", type: "select",
        options: [
          { label: "Передаются Заказчику в полном объёме", value: "Передаются Заказчику в полном объёме" },
          { label: "Исключительные права остаются у Исполнителя", value: "Исключительные права остаются у Исполнителя" },
          { label: "Неисключительная лицензия Заказчику", value: "Неисключительная лицензия Заказчику" },
        ],
        defaultValue: "Передаются Заказчику в полном объёме", category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на разработку программного обеспечения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{dev_company}}}</strong>, ИНН {{{dev_inn}}}, в лице директора {{{dev_director}}}, именуемый «Исполнитель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{client_company}}}</strong>, ИНН {{{client_inn}}}, в лице директора {{{client_director}}}, именуемый «Заказчик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется разработать ПО: <strong>{{{project_scope}}}</strong> на технологиях {{{tech_stack}}}, а Заказчик — принять и оплатить результат.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Сроки и стоимость</div>
  <p class="mb-4 text-justify">
    2.1. Срок разработки: {{{deadline}}} календарных дней с момента получения аванса.
  </p>
  <p class="mb-4 text-justify">
    2.2. Стоимость работ составляет <strong>{{{contract_price}}} руб.</strong> ({{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">2.3. Порядок оплаты: {{{payment_stages}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права на результат</div>
  <p class="mb-4 text-justify">
    3.1. {{{ip_rights}}}. Результаты передаются по акту, в состав входят исходные коды и техническая документация.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии</div>
  <p class="mb-4 text-justify">
    4.1. Исполнитель обеспечивает устранение ошибок в течение {{{warranty_months}}} месяцев после приёмки без дополнительной оплаты.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Исполнитель:</div>
      <p><strong>{{{dev_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Заказчик:</div>
      <p><strong>{{{client_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "employment-contract",
    name: "Трудовой договор",
    category: "business",
    actSource: "ст. 56-71 ТК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Трудовой договор с работником: условия, оплата, испытательный срок, дистанционная работа.",
    suggestedDocs: [],
    printInstruction: "Печатать в 2-х экземплярах (один — работнику)",
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
        id: "employer_company", label: "Наименование Работодателя", type: "text",
        defaultValue: "", category: "employer", validation: { required: true },
      },
      {
        id: "employer_inn", label: "ИНН Работодателя", type: "text", defaultValue: "",
        category: "employer",
      },
      {
        id: "employer_address", label: "Юридический адрес Работодателя", type: "text",
        defaultValue: "", category: "employer",
      },
      {
        id: "employer_director", label: "Руководитель Работодателя", type: "text",
        defaultValue: "", category: "employer",
      },
      {
        id: "employee_fio", label: "ФИО Работника", type: "text",
        defaultValue: "", category: "employee",
        validation: { required: true },
      },
      {
        id: "employee_passport", label: "Паспорт Работника", type: "text",
        defaultValue: "", category: "employee",
      },
      {
        id: "employee_address", label: "Адрес регистрации Работника", type: "text",
        defaultValue: "", category: "employee",
      },
      {
        id: "position", label: "Должность", type: "text", defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "department", label: "Подразделение", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "start_date", label: "Дата начала работы", type: "date", defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "salary", label: "Оклад (руб. в месяц)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "bonus", label: "Премии и надбавки", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "schedule", label: "Режим работы", type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "probation", label: "Испытательный срок", type: "select",
        options: [
          { label: "Без испытательного срока", value: "Без испытательного срока" },
          { label: "1 месяц", value: "1 месяц" },
          { label: "3 месяца", value: "3 месяца" },
        ],
        defaultValue: "3 месяца", category: "contract",
      },
      {
        id: "remote", label: "Формат работы", type: "select",
        options: [
          { label: "В офисе работодателя", value: "В офисе работодателя" },
          { label: "Дистанционно", value: "Дистанционно" },
          { label: "Гибридный (офис + удалённо)", value: "Гибридный (офис + удалённо)" },
        ],
        defaultValue: "В офисе работодателя", category: "contract",
      },
      {
        id: "vacation_days", label: "Отпуск (календарных дней)", type: "number", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Трудовой договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong>, ИНН {{{employer_inn}}}, юридический адрес: {{{employer_address}}}, в лице {{{employer_director}}}, действующего на основании Устава, именуемый «Работодатель», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{employee_fio}}}</strong>, паспорт {{{employee_passport}}}, зарегистрированный по адресу: {{{employee_address}}}, именуемый «Работник», с другой стороны, заключили настоящий трудовой договор:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Работник принимается на работу в {{{department}}} на должность <strong>{{{position}}}</strong> с «{{{start_date}}}».
  </p>
  <p class="mb-4 text-justify">
    1.2. {{{probation}}}. 1.3. Формат работы: {{{remote}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Оплата труда</div>
  <p class="mb-4 text-justify">
    2.1. Работнику устанавливается оклад <strong>{{{salary}}} руб.</strong> в месяц ({{{salary_words}}}).
  </p>
  <p class="mb-4 text-justify">2.2. {{{bonus}}}. Заработная плата выплачивается 2 раза в месяц.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Рабочее время и отдых</div>
  <p class="mb-4 text-justify">
    3.1. {{{schedule}}}. Ежегодный оплачиваемый отпуск — {{{vacation_days}}} календарных дней.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Заключительные положения</div>
  <p class="mb-4 text-justify">
    4.1. Договор заключён на неопределённый срок. Изменения — только по соглашению сторон в письменной форме.
  </p>
  
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">
    5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.
  </p>
  <p class="mb-4 text-justify">
    5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление либо несвоевременное уведомление лишает сторону права ссылаться на форс-мажор как на основание освобождения от ответственности.
  </p>
  <p class="mb-4 text-justify">
    5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.
  </p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">
    6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.
  </p>
  <p class="mb-4 text-justify">
    6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.
  </p>
<div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-1">Работодатель:</div>
      <p><strong>{{{employer_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Работник:</div>
      <p>{{{employee_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "gpa-contract",
    name: "Договор ГПХ (услуги физлица)",
    category: "business",
    actSource: "ст. 702, 779–783 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Договор гражданско-правового характера с физическим лицом (услуги/подряд), без трудовых гарантий.",
    suggestedDocs: ["act-transfer-auto", "invoice"],
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
        id: "customer_company", label: "Наименование Заказчика", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "customer_inn", label: "ИНН Заказчика", type: "text", defaultValue: "",
        category: "customer",
      },
      {
        id: "customer_director", label: "Директор Заказчика", type: "text",
        defaultValue: "", category: "customer",
      },
      {
        id: "executor_fio", label: "ФИО Исполнителя", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "executor_passport", label: "Паспорт Исполнителя", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "executor_address", label: "Адрес Исполнителя", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "work_description", label: "Содержание работ/услуг", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "contract_price", label: "Вознаграждение (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "payment_terms", label: "Порядок оплаты", type: "text",
        defaultValue: "",
        category: "payment",
      },
      {
        id: "start_date", label: "Начало работ", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "end_date", label: "Окончание работ", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "tax_note", label: "Налоги с вознаграждения", type: "text",
        defaultValue: "",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор возмездного оказания услуг (ГПХ)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong>, ИНН {{{customer_inn}}}, в лице директора {{{customer_director}}}, именуемый «Заказчик», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{executor_fio}}}</strong>, паспорт {{{executor_passport}}}, зарегистрированный по адресу: {{{executor_address}}}, именуемый «Исполнитель», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Исполнитель обязуется по заданию Заказчика оказать услуги: <strong>{{{work_description}}}</strong>, а Заказчик — принять результат и оплатить.
  </p>
  <p class="mb-4 text-justify">
    1.2. Срок оказания услуг: с «{{{start_date}}}» по «{{{end_date}}}».
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и оплата</div>
  <p class="mb-4 text-justify">
    2.1. Вознаграждение составляет <strong>{{{contract_price}}} руб.</strong> ({{{contract_price_words}}}).
  </p>
  <p class="mb-4 text-justify">2.2. {{{payment_terms}}}.</p>
  <p class="mb-4 text-justify">2.3. {{{tax_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Приёмка</div>
  <p class="mb-4 text-justify">
    3.1. Результат оформляется двусторонним актом. При отсутствии мотивированных возражений в течение 5 рабочих дней услуги считаются принятыми.
  </p>
  <p class="mb-4 text-justify">
    3.2. Настоящий договор не порождает трудовых отношений.
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
      <div class="font-bold mb-1">Заказчик:</div>
      <p><strong>{{{customer_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Исполнитель:</div>
      <p>{{{executor_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "act-services",
    name: "Акт оказанных услуг",
    category: "business",
    actSource: "ст. 779–783 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Акт приёма-сдачи услуг по договору оказания услуг: перечень, стоимость, отсутствие претензий.",
    suggestedDocs: ["service-agreement", "gpa-contract", "it-development"],
    printInstruction: "Печатать в 2-х экземплярах, приложить к договору",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата акта", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "contract_date", label: "Дата договора", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "executor_company", label: "Наименование Исполнителя", type: "text",
        defaultValue: "", category: "executor", validation: { required: true },
      },
      {
        id: "executor_fio", label: "ФИО Исполнителя (если физлицо)", type: "text",
        defaultValue: "", category: "executor",
      },
      {
        id: "customer_company", label: "Наименование Заказчика", type: "text",
        defaultValue: "", category: "customer", validation: { required: true },
      },
      {
        id: "service_results", label: "Перечень оказанных услуг", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "contract_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "claim_note", label: "Претензии (или «не имеет»)", type: "text",
        defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приёма-сдачи оказанных услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Настоящий акт составлен о том, что Исполнитель <strong>{{{executor_company}}} {{{executor_fio}}}</strong> оказал, а Заказчик <strong>{{{customer_company}}}</strong> принял следующие услуги по договору от «{{{contract_date}}}»:
  </p>
  <p class="mb-4 text-justify">
    {{{service_results}}}
  </p>
  <p class="mb-4 text-justify">
    Стоимость оказанных услуг составляет <strong>{{{contract_price}}} руб.</strong> ({{{contract_price_words}}}). Услуги оказаны полностью и в срок.
  </p>
  <p class="mb-4 text-justify">
    Стороны {{{claim_note}}}.
  </p>
  <div class="grid grid-cols-2 gap-6 mt-12 text-xs border-t border-zinc-300 pt-4">
    <div><div class="font-bold mb-1">Исполнитель:</div><p class="mb-6">{{{executor_company}}} {{{executor_fio}}}</p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
    <div><div class="font-bold mb-1">Заказчик:</div><p class="mb-6"><strong>{{{customer_company}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
  </div>
</div>`,
  },
{
    id: "act-works",
    name: "Акт выполненных работ (подряд)",
    category: "business",
    actSource: "ст. 702–729 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Акт приёмки строительно-ремонтных работ по договору подряда: объект, перечень, гарантия.",
    suggestedDocs: ["contract-works"],
    printInstruction: "Печатать в 2-х экземплярах",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "date", label: "Дата акта", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "contract_date", label: "Дата договора подряда", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "",
        category: "customer", validation: { required: true },
      },
      {
        id: "contractor_company", label: "Наименование Подрядчика", type: "text",
        defaultValue: "", category: "contractor", validation: { required: true },
      },
      {
        id: "work_description", label: "Перечень выполненных работ", type: "textarea", rows: 4,
        defaultValue: "",
        category: "contract", validation: { required: true },
      },
      {
        id: "work_address", label: "Объект (адрес)", type: "text",
        defaultValue: "", category: "contract",
      },
      {
        id: "contract_price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "warranty_period", label: "Гарантийный срок (мес.)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "claim_note", label: "Претензии (или «не имеет»)", type: "text",
        defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приёмки выполненных работ</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Настоящий акт составлен о том, что Подрядчик <strong>{{{contractor_company}}}</strong> выполнил, а Заказчик <strong>{{{customer_fio}}}</strong> принял работы по договору подряда от «{{{contract_date}}}» на объекте: {{{work_address}}}.
  </p>
  <p class="mb-4 text-justify">
    Выполнены работы: {{{work_description}}}.
  </p>
  <p class="mb-4 text-justify">
    Стоимость выполненных работ составляет <strong>{{{contract_price}}} руб.</strong> ({{{contract_price_words}}}). Работы выполнены полностью в установленный срок.
  </p>
  <p class="mb-4 text-justify">
    Гарантийный срок на выполненные работы — {{{warranty_period}}} месяца. Заказчик {{{claim_note}}}.
  </p>
  <div class="grid grid-cols-2 gap-6 mt-12 text-xs border-t border-zinc-300 pt-4">
    <div><div class="font-bold mb-1">Сдал Подрядчик:</div><p class="mb-6"><strong>{{{contractor_company}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
    <div><div class="font-bold mb-1">Принял Заказчик:</div><p class="mb-6">{{{customer_fio}}}</p><div class="border-b border-zinc-950 w-44 h-5"></div></div>
  </div>
</div>`,
  },
{
    id: "photo-shoot-agreement",
    name: "Договор на проведение фотосъёмки",
    category: "business",
    actSource: "гл. 39 ГК РФ, ст. 152.1 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Договор фотографа с заказчиком: формат съёмки, сроки, использование и публикация фотографий.",
    suggestedDocs: ["act-services", "invoice"],
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
        id: "executor_fio", label: "ФИО Фотографа", type: "text", defaultValue: "",
        category: "executor", validation: { required: true },
      },
      {
        id: "customer_fio", label: "ФИО Заказчика", type: "text", defaultValue: "",
        category: "customer", validation: { required: true },
      },
      {
        id: "shoot_date", label: "Дата съёмки", type: "date", defaultValue: "",
        category: "contract",
      },
      {
        id: "shoot_time", label: "Время съёмки", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "shoot_location", label: "Место съёмки", type: "text", defaultValue: "",
        category: "contract",
      },
      {
        id: "shoot_type", label: "Тип съёмки", type: "select", defaultValue: "Семейная",
        category: "contract",
        options: [
          { label: "Семейная", value: "Семейная" },
          { label: "Свадебная", value: "Свадебная" },
          { label: "Детская", value: "Детская" },
          { label: "Портретная", value: "Портретная" },
          { label: "Контентная", value: "Контентная" },
        ],
      },
      {
        id: "photos_qty", label: "Количество обработанных фото", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "shoot_price", label: "Стоимость (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "prepayment", label: "Предоплата (руб.)", type: "number", defaultValue: "",
        category: "payment",
      },
      {
        id: "delivery_days", label: "Срок сдачи фото (дней)", type: "number", defaultValue: "",
        category: "contract",
      },
      {
        id: "use_rights", label: "Разрешение на публикацию", type: "checkbox", defaultValue: "true",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на проведение фотосъёмки</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_fio}}}</strong>, именуемый в дальнейшем «Фотограф», и <strong>{{{customer_fio}}}</strong>, именуемая в дальнейшем «Заказчик», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Фотограф обязуется провести {{{shoot_type}}} фотосъёмку {{{shoot_date}}} в {{{shoot_time}}} по адресу: {{{shoot_location}}}, обработать и передать Заказчику {{{photos_qty}}} фотографий в электронном виде в течение {{{delivery_days}}} дней после съёмки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{shoot_price}}} рублей</strong> ({{{shoot_price_words}}}). Предоплата {{{prepayment}}} рублей вносится при подписании договора, остаток — в день передачи фотографий.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Авторские и смежные права</div>
  <p class="mb-4 text-justify">3.1. Исключительные авторские права на фотографии принадлежат Фотографу. Заказчик вправе использовать фотографии в личных целях.</p>
  <p class="mb-4 text-justify">3.2. {{#use_rights}}Заказчик даёт согласие на публикацию фотографий в портфолио Фотографа и социальных сетях.{{/use_rights}}{{^use_rights}}Публикация фотографий без отдельного письменного согласия Заказчика запрещена.{{/use_rights}}</p>
  
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
    <div><div class="font-bold mb-1">Фотограф:</div><p class="mb-1"><strong>{{{executor_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Заказчик:</div><p class="mb-1"><strong>{{{customer_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
  },
{
    id: "llc-share-purchase",
    name: "Договор купли-продажи доли в уставном капитале ООО",
    category: "business",
    actSource: "ст. 21 ФЗ «Об ООО»",
    lastUpdated: "Август 2026",
    description:
      "Договор купли-продажи доли в уставном капитале ООО между участниками: размер доли, цена, порядок перехода прав.",
    suggestedDocs: [],
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
        id: "company_name", label: "Наименование ООО", type: "text", defaultValue: "",
        category: "business", validation: { required: true },
      },
      {
        id: "company_inn", label: "ИНН ООО", type: "text", defaultValue: "", category: "business",
      },
      {
        id: "uc_amount", label: "Уставный капитал (руб.)", type: "number", defaultValue: "",
        category: "business",
      },
      {
        id: "seller_fio", label: "ФИО Продавца доли", type: "text", defaultValue: "",
        category: "seller", validation: { required: true },
      },
      {
        id: "seller_share", label: "Размер доли Продавца (%)", type: "number", defaultValue: "",
        category: "seller",
      },
      {
        id: "buyer_fio", label: "ФИО Покупателя доли", type: "text", defaultValue: "",
        category: "buyer", validation: { required: true },
      },
      {
        id: "contract_price", label: "Цена доли (руб.)", type: "number", defaultValue: "",
        category: "payment", validation: { required: true },
      },
      {
        id: "payment_method", label: "Порядок оплаты", type: "select", defaultValue: "наличными",
        category: "payment",
        options: [
          { label: "Наличными", value: "наличными" },
          { label: "Банковский перевод", value: "банковским переводом" },
          { label: "Нотариальный депозит", value: "через депозит нотариуса" },
        ],
      },
      {
        id: "waiver_note", label: "Отказ других участников от преимущественного права", type: "text",
        defaultValue: "",
        category: "contract",
      },
      {
        id: "notary_required", label: "Требуется нотариальное удостоверение", type: "checkbox", defaultValue: "true",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи доли в уставном капитале</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{seller_fio}}}</strong>, именуемый в дальнейшем «Продавец», с одной стороны, и гражданин <strong>{{{buyer_fio}}}</strong>, именуемый в дальнейшем «Покупатель», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Продавец продаёт, а Покупатель покупает долю в размере <strong>{{{seller_share}}}%</strong> уставного капитала <strong>{{{company_name}}}</strong> (ИНН {{{company_inn}}}), равную номинальной стоимости {{{uc_amount}}} рублей.</p>
  <p class="mb-4 text-justify">1.2. {{{waiver_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена доли составляет <strong>{{{contract_price}}} рублей</strong> ({{{contract_price_words}}}), оплата производится {{{payment_method}}}.</p>
  <p class="mb-4 text-justify">2.2. {{#notary_required}}Настоящий договор подлежит нотариальному удостоверению; право на долю переходит к Покупателю с момента внесения соответствующей записи в ЕГРЮЛ.{{/notary_required}}</p>
  
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
    <div><div class="font-bold mb-1">Продавец:</div><p class="mb-1"><strong>{{{seller_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
    <div><div class="font-bold mb-1">Покупатель:</div><p class="mb-1"><strong>{{{buyer_fio}}}</strong></p><div class="border-b border-zinc-950 w-44 h-5 mt-8"></div></div>
  </div>
</div>`,
  },
{
      id: "labour-contract",
    name: "Трудовой договор (бессрочный)",
    category: "business",
    actSource: "ст. 56-71 ТК РФ",
    lastUpdated: "Август 2026",
    description:
      "Бессрочный трудовой договор между работником и работодателем: условия оплаты, рабочее время, отпуск, обязанности сторон (ст. 56-68 ТК РФ).",
    suggestedDocs: ["hire-order"],
    printInstruction: "Печатать в двух экземплярах, один — работнику под подпись",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата заключения", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_company", label: "Работодатель (полное наименование)", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_inn", label: "ИНН работодателя", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_address", label: "Адрес работодателя", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_director", label: "Генеральный директор", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_director_base", label: "Действует на основании", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_passport", label: "Паспорт работника", type: "text", defaultValue: "", category: "employee" },
      { id: "employee_address", label: "Адрес регистрации работника", type: "text", defaultValue: "", category: "employee" },
      { id: "employee_inn", label: "ИНН работника", type: "text", defaultValue: "", category: "employee" },
      { id: "employee_snils", label: "СНИЛС работника", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "department", label: "Структурное подразделение", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата начала работы", type: "date", defaultValue: "", category: "contract" },
      { id: "salary", label: "Оклад (руб./мес)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "salary_words", label: "Оклад прописью", type: "text", defaultValue: "", category: "contract" },
      { id: "bonus_conditions", label: "Премии и надбавки (условия)", type: "textarea", defaultValue: "", category: "contract", rows: 3 },
      { id: "work_hours", label: "Рабочее время", type: "text", defaultValue: "", category: "contract" },
      { id: "vacation_days", label: "Отпуск (календарных дней)", type: "number", defaultValue: "", category: "contract" },
      { id: "probation", label: "Испытательный срок (мес.)", type: "text", defaultValue: "", category: "contract" },
      { id: "employee_duties", label: "Трудовые обязанности (кратко)", type: "textarea", defaultValue: "", category: "contract", rows: 3 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Трудовой договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong>, ИНН {{{employer_inn}}}, адрес: {{{employer_address}}}, в лице
    генерального директора <strong>{{{employer_director}}}</strong>, действующего на основании {{{employer_director_base}}},
    именуемое в дальнейшем «Работодатель», с одной стороны, и гражданин(ка) РФ
    <strong>{{{employee_fio}}}</strong>, паспорт {{{employee_passport}}}, зарегистрированный(ая) по адресу:
    {{{employee_address}}}, ИНН {{{employee_inn}}}, СНИЛС {{{employee_snils}}}, именуемый(ая) в дальнейшем
    «Работник», с другой стороны, совместно именуемые «Стороны», заключили настоящий договор о нижеследующем:
  </p>
  <p class="font-bold mb-2">1. Общие положения</p>
  <p class="mb-3 text-justify">
    1.1. Работник принимается на работу в {{{employer_company}}} на должность <strong>{{{position}}}</strong>
    в {{{department}}}. Настоящий договор заключён на неопределённый срок.
  </p>
  <p class="mb-3 text-justify">
    1.2. Дата начала работы: {{{start_date}}}. {{{#probation}}}
    <span>1.3. Работнику устанавливается испытательный срок продолжительностью {{{probation}}}.</span>
    {{{/probation}}}
  </p>
  <p class="font-bold mb-2">2. Права и обязанности сторон</p>
  <p class="mb-3 text-justify">
    2.1. Работник обязуется лично выполнять трудовую функцию: {{{employee_duties}}}, соблюдать
    правила внутреннего трудового распорядка, трудовую дисциплину и требования охраны труда.
  </p>
  <p class="mb-3 text-justify">
    2.2. Работодатель обязуется предоставить работу, обеспечить условия труда, своевременно и
    полностью выплачивать заработную плату, предоставлять отпуск и иные гарантии, предусмотренные
    Трудовым кодексом РФ и локальными нормативными актами.
  </p>
  <p class="font-bold mb-2">3. Оплата труда</p>
  <p class="mb-3 text-justify">
    3.1. За выполнение трудовых обязанностей Работнику устанавливается должностной оклад в размере
    <strong>{{{salary}}} ({{{salary_words}}}) рублей</strong> в месяц.
  </p>
  <p class="mb-3 text-justify">
    3.2. {{{#bonus_conditions}}}Премирование: {{{bonus_conditions}}}. {{{/bonus_conditions}}}
    Заработная плата выплачивается два раза в месяц: аванс — до 25 числа текущего месяца,
    окончательный расчёт — до 10 числа следующего месяца.
  </p>
  <p class="font-bold mb-2">4. Рабочее время и отдых</p>
  <p class="mb-3 text-justify">
    4.1. Работнику устанавливается следующий режим рабочего времени: {{{work_hours}}}.
  </p>
  <p class="mb-3 text-justify">
    4.2. Работнику предоставляется ежегодный оплачиваемый отпуск продолжительностью {{{vacation_days}}}
    календарных дней.
  </p>
  <p class="font-bold mb-2">5. Прочие условия</p>
  <p class="mb-3 text-justify">
    5.1. Настоящий договор вступает в силу со дня его подписания обеими сторонами.
  </p>
  <p class="mb-3 text-justify">
    5.2. Все изменения и дополнения оформляются дополнительными соглашениями.
  </p>
  <p class="mb-3 text-justify">
    5.3. Во всём, что не предусмотрено настоящим договором, стороны руководствуются Трудовым кодексом РФ.
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">ген. директор {{{employer_director}}}</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись и расшифровка</p>
    </div>
  </div>
  <p class="mt-6 text-[10px] text-zinc-400">
    Один экземпляр договора получен работником на руки: ______ / {{{employee_fio}}} / «___» __________ 20___ г.
  </p>
</div>`,
  },
{
      id: "gph-contract",
    name: "Договор ГПХ (подряд/услуги с физлицом)",
    category: "business",
    actSource: "ст. 702-729, 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description:
      "Гражданско-правовой договор с физическим лицом (не сотрудником): выполнение работ или оказание услуг без записи в трудовую книжку.",
    suggestedDocs: ["act-services", "act-works"],
    printInstruction: "Печатать в двух экземплярах",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата заключения", type: "date", defaultValue: "", category: "contract" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_address", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_director", label: "Руководитель заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_fio", label: "ФИО исполнителя", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_passport", label: "Паспорт исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_address", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "work_description", label: "Предмет договора (работы/услуги)", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "contract_price", label: "Вознаграждение (руб.)", type: "number", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contract_price_words", label: "Вознаграждение прописью", type: "text", defaultValue: "", category: "contract" },
      { id: "payment_terms", label: "Порядок оплаты", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Срок сдачи", type: "date", defaultValue: "", category: "contract" },
      { id: "penalty_rate", label: "Неустойка за просрочку (% в день)", type: "text", defaultValue: "", category: "contract" },
      { id: "is_selfemployed", label: "Исполнитель — самозанятый/ИП", type: "checkbox", defaultValue: "false", category: "contract" },
      { id: "ndfl_note", label: "Особые условия (НДФЛ и т.п.)", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор возмездного оказания услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong>, ИНН {{{customer_inn}}}, адрес: {{{customer_address}}}, в лице
    {{{customer_director}}}, действующего на основании Устава, именуемое в дальнейшем «Заказчик», с одной стороны,
    и <strong>{{{executor_fio}}}</strong>, паспорт {{{executor_passport}}}, зарегистрированный(ая) по адресу:
    {{{executor_address}}}, ИНН {{{executor_inn}}}, именуемый(ая) в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">
    1.1. Исполнитель обязуется по заданию Заказчика оказать следующие услуги (выполнить работы):
    {{{work_description}}}.
  </p>
  <p class="mb-3 text-justify">
    1.2. Сроки оказания услуг: с {{{start_date}}} по {{{end_date}}}.
  </p>
  <p class="mb-3 text-justify">
    1.3. Результат оформляется актом приёма-передачи, подписываемым обеими сторонами.
  </p>
  <p class="font-bold mb-2">2. Стоимость и порядок расчётов</p>
  <p class="mb-3 text-justify">
    2.1. Стоимость услуг составляет <strong>{{{contract_price}}} ({{{contract_price_words}}}) рублей</strong>.
  </p>
  <p class="mb-3 text-justify">
    2.2. {{{payment_terms}}}.
  </p>
  <p class="font-bold mb-2">3. Ответственность сторон</p>
  <p class="mb-3 text-justify">
    3.1. За нарушение сроков оказания услуг Исполнитель уплачивает Заказчику неустойку в размере
    {{{penalty_rate}}} от стоимости услуг за каждый день просрочки.
  </p>
  <p class="mb-3 text-justify">
    3.2. Исполнитель несёт ответственность за качество услуг в соответствии с Гражданским кодексом РФ.
  </p>
  <p class="font-bold mb-2">4. Особые условия</p>
  <p class="mb-3 text-justify">4.1. {{{ndfl_note}}}.</p>
  <p class="mb-3 text-justify">
    4.2. Настоящий договор не является трудовым и не порождает трудовых отношений
    (ст. 15, 16 ТК РФ).
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{customer_director}}}</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись и расшифровка</p>
    </div>
  </div>
</div>`,
  },
{
      id: "labour-addendum",
    name: "Допсоглашение к трудовому договору",
    category: "business",
    actSource: "ст. 72 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Изменение условий трудового договора: должность, оклад, режим работы, место работы.",
    suggestedDocs: [],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата соглашения", type: "date", defaultValue: "", category: "contract" },
      { id: "td_number", label: "Номер трудового договора", type: "text", defaultValue: "", category: "contract" },
      { id: "td_date", label: "Дата трудового договора", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_director", label: "Руководитель", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "change_position", label: "Новая должность (если меняется)", type: "text", defaultValue: "", category: "contract" },
      { id: "change_salary", label: "Новый оклад (если меняется)", type: "text", defaultValue: "", category: "contract" },
      { id: "change_work_hours", label: "Новый режим работы (если меняется)", type: "text", defaultValue: "", category: "contract" },
      { id: "change_place", label: "Новое место работы (если меняется)", type: "text", defaultValue: "", category: "contract" },
      { id: "other_terms", label: "Иные изменения", type: "textarea", defaultValue: "", category: "contract", rows: 3 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение № 1</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong> в лице {{{employer_director}}}, действующего на основании Устава,
    именуемое «Работодатель», и <strong>{{{employee_fio}}}</strong>, именуемый «Работник»,
    заключили настоящее дополнительное соглашение к трудовому договору № {{{td_number}}} от {{{td_date}}}
    о нижеследующем:
  </p>
  <p class="font-bold mb-2">1. Внести в трудовой договор следующие изменения:</p>
  <p class="mb-3 text-justify">
    {{{#change_position}}}1.1. Пункт о должности изложить в редакции: «Работник принимается на должность {{{change_position}}}». {{{/change_position}}}
    {{{#change_salary}}}1.2. Пункт об оплате труда изложить в редакции: «Работнику устанавливается должностной оклад в размере {{{change_salary}}} рублей в месяц». {{{/change_salary}}}
    {{{#change_work_hours}}}1.3. Пункт о режиме рабочего времени изложить в редакции: «{{{change_work_hours}}}». {{{/change_work_hours}}}
    {{{#change_place}}}1.4. Пункт о месте работы изложить в редакции: «Место работы: {{{change_place}}}». {{{/change_place}}}
    {{{#other_terms}}}1.5. {{{other_terms}}} {{{/other_terms}}}
  </p>
  <p class="mb-3 text-justify">2. Остальные условия трудового договора остаются неизменными и обязательными для сторон.</p>
  <p class="mb-3 text-justify">3. Настоящее соглашение вступает в силу с момента его подписания и является неотъемлемой частью трудового договора № {{{td_number}}} от {{{td_date}}} (ст. 72 ТК РФ).</p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{employer_director}}}</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись и расшифровка</p>
    </div>
  </div>
</div>`,
  },
{
      id: "hire-order",
    name: "Приказ о приёме на работу (Т-1)",
    category: "business",
    actSource: "ст. 68 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Приказ о приёме работника на работу (форма Т-1): должность, оклад, дата начала, испытательный срок.",
    suggestedDocs: ["labour-contract"],
    fields: [
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_table", label: "Табельный номер", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "start_date", label: "Дата начала работы", type: "date", defaultValue: "", category: "contract" },
      { id: "salary", label: "Тарифная ставка (оклад)", type: "text", defaultValue: "", category: "contract" },
      { id: "probation", label: "Испытательный срок", type: "text", defaultValue: "", category: "contract" },
      { id: "td_number", label: "Трудовой договор №", type: "text", defaultValue: "", category: "contract" },
      { id: "td_date", label: "Дата трудового договора", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-2 text-xs font-semibold">
    <div>ОКУД 0301006</div>
    <div>Код по ОКПО ____________</div>
  </div>
  <div class="text-center mb-6">
    <p class="font-bold text-base text-black uppercase mb-2">Приказ (распоряжение) о приёме работника на работу</p>
    <div class="flex justify-between text-xs font-semibold">
      <div>{{{employer_company}}}</div>
      <div>№ {{{order_number}}} от {{{order_date}}}</div>
    </div>
  </div>
  <p class="mb-4 text-justify">ПРИНЯТЬ НА РАБОТУ:</p>
  <p class="mb-3 text-justify">
    Фамилия, имя, отчество: <strong>{{{employee_fio}}}</strong>. Табельный номер: {{{employee_table}}}.
  </p>
  <p class="mb-3 text-justify">
    В {{{department}}} на должность (профессию): <strong>{{{position}}}</strong>.
  </p>
  <p class="mb-3 text-justify">
    Дата начала работы: {{{start_date}}}. {{{#probation}}}
    <span>Испытательный срок: {{{probation}}}.</span> {{{/probation}}}
  </p>
  <p class="mb-3 text-justify">
    Тарифная ставка (оклад): {{{salary}}}, надбавки: согласно штатному расписанию.
  </p>
  <p class="mb-3 text-justify">
    Основание: трудовой договор от {{{td_date}}} № {{{td_number}}}.
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div>
      <p class="font-bold mb-1">Руководитель организации:</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">должность / подпись / расшифровка</p>
    </div>
    <div>
      <p class="font-bold mb-1">С приказом ознакомлен(а):</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{employee_fio}}} / «___» __________ 20___ г.</p>
    </div>
  </div>
</div>`,
  },
{
      id: "firing-order",
    name: "Приказ об увольнении (Т-8)",
    category: "business",
    actSource: "ст. 77, 84.1 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Приказ о прекращении трудового договора (форма Т-8): основание увольнения, дата, выплаты.",
    suggestedDocs: ["resignation-letter"],
    fields: [
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_table", label: "Табельный номер", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "contract" },
      { id: "td_number", label: "Трудовой договор №", type: "text", defaultValue: "", category: "contract" },
      { id: "td_date", label: "Дата трудового договора", type: "date", defaultValue: "", category: "contract" },
      { id: "firing_date", label: "Дата увольнения", type: "date", defaultValue: "", category: "contract" },
      { id: "firing_reason", label: "Основание увольнения", type: "select", defaultValue: "По инициативе работника (ст. 77 ч.1 п.3 ТК РФ)", category: "contract", options: [
        { label: "По инициативе работника (ст. 77 ч.1 п.3 ТК РФ)", value: "По инициативе работника (ст. 77 ч.1 п.3 ТК РФ)" },
        { label: "Соглашение сторон (ст. 78 ТК РФ)", value: "Соглашение сторон (ст. 78 ТК РФ)" },
        { label: "Истечение срока договора (ст. 79 ТК РФ)", value: "Истечение срока договора (ст. 79 ТК РФ)" },
        { label: "Сокращение штата (ст. 81 ч.1 п.2 ТК РФ)", value: "Сокращение штата (ст. 81 ч.1 п.2 ТК РФ)" },
      ] },
      { id: "firing_base", label: "Документ-основание", type: "text", defaultValue: "", category: "contract" },
      { id: "payments_note", label: "Выплаты при увольнении", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-2 text-xs font-semibold">
    <div>ОКУД 0301008</div>
    <div>Код по ОКПО ____________</div>
  </div>
  <div class="text-center mb-6">
    <p class="font-bold text-base text-black uppercase mb-2">Приказ (распоряжение) о прекращении трудового договора с работником</p>
    <div class="flex justify-between text-xs font-semibold">
      <div>{{{employer_company}}}</div>
      <div>№ {{{order_number}}} от {{{order_date}}}</div>
    </div>
  </div>
  <p class="mb-3 text-justify">
    Фамилия, имя, отчество: <strong>{{{employee_fio}}}</strong>. Табельный номер: {{{employee_table}}}.
  </p>
  <p class="mb-3 text-justify">
    {{{department}}}, должность: {{{position}}}.
  </p>
  <p class="mb-3 text-justify">
    Прекратить действие трудового договора от {{{td_date}}} № {{{td_number}}}, уволить
    <strong>{{{date}}}</strong> {{{firing_date}}}.
  </p>
  <p class="mb-3 text-justify">
    Основание прекращения (увольнения): {{{firing_reason}}}.
  </p>
  <p class="mb-3 text-justify">
    Основание (документ): {{{firing_base}}}.
  </p>
  <p class="mb-3 text-justify">
    {{{#payments_note}}}Работнику причитаются выплаты: {{{payments_note}}}. {{{/payments_note}}}
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div>
      <p class="font-bold mb-1">Руководитель организации:</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">должность / подпись / расшифровка</p>
    </div>
    <div>
      <p class="font-bold mb-1">С приказом ознакомлен(а):</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{employee_fio}}} / «___» __________ 20___ г.</p>
    </div>
  </div>
</div>`,
  },
{
      id: "vacation-letter",
    name: "Заявление на отпуск",
    category: "business",
    actSource: "ст. 122-123 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Заявление работника о предоставлении ежегодного оплачиваемого отпуска.",
    suggestedDocs: ["vacation-order"],
    fields: [
      { id: "employer_company", label: "Работодатель (кому)", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_director", label: "Руководитель", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "ФИО работника (от кого)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата заявления", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_start", label: "Начало отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_end", label: "Конец отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_days", label: "Кол-во дней", type: "number", defaultValue: "", category: "contract" },
      { id: "year_note", label: "За рабочий год (период)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-8 text-xs font-semibold">
    <div class="w-1/2">
      <p>Генеральному директору {{{employer_company}}}</p>
      <p>{{{employer_director}}}</p>
    </div>
    <div class="w-1/2 text-left">
      <p>от {{{employee_fio}}}</p>
      <p>{{{employee_position}}}</p>
    </div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Заявление</div>
  <p class="mb-4 text-justify">
    Прошу предоставить мне ежегодный оплачиваемый отпуск на {{{vacation_days}}} календарных дней
    с {{{vacation_start}}} по {{{vacation_end}}} за {{{year_note}}}.
  </p>
  <div class="flex justify-end text-xs mt-10">
    <div class="text-right">
      <p class="mb-1">«{{{date}}}»  г. {{{city}}}</p>
      <div class="flex items-end justify-between gap-16">
        <p>{{{employee_fio}}}</p>
        <div class="border-b border-zinc-950 w-48 h-5"></div>
      </div>
      <p class="text-zinc-400 text-[10px] mt-1">подпись</p>
    </div>
  </div>
</div>`,
  },
{
      id: "vacation-order",
    name: "Приказ о предоставлении отпуска (Т-6)",
    category: "business",
    actSource: "ст. 122 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Приказ о предоставлении ежегодного оплачиваемого отпуска работнику (форма Т-6).",
    suggestedDocs: ["vacation-letter"],
    fields: [
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_table", label: "Табельный номер", type: "text", defaultValue: "", category: "employee" },
      { id: "department", label: "Подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "contract" },
      { id: "vacation_start", label: "Начало отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_end", label: "Конец отпуска", type: "date", defaultValue: "", category: "contract" },
      { id: "vacation_days", label: "Кол-во дней", type: "number", defaultValue: "", category: "contract" },
      { id: "year_note", label: "Рабочий год", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-2 text-xs font-semibold">
    <div>ОКУД 0301005</div>
    <div>Код по ОКПО ____________</div>
  </div>
  <div class="text-center mb-6">
    <p class="font-bold text-base text-black uppercase mb-2">Приказ (распоряжение) о предоставлении отпуска работнику</p>
    <div class="flex justify-between text-xs font-semibold">
      <div>{{{employer_company}}}</div>
      <div>№ {{{order_number}}} от {{{order_date}}}</div>
    </div>
  </div>
  <p class="mb-4 text-justify">ПРЕДОСТАВИТЬ ОТПУСК:</p>
  <p class="mb-3 text-justify">
    Фамилия, имя, отчество: <strong>{{{employee_fio}}}</strong>. Табельный номер: {{{employee_table}}}.
  </p>
  <p class="mb-3 text-justify">
    {{{department}}}, должность: {{{position}}}.
  </p>
  <p class="mb-3 text-justify">
    Ежегодный основной оплачиваемый отпуск на {{{vacation_days}}} календарных дней
    с {{{vacation_start}}} по {{{vacation_end}}} за {{{year_note}}}.
  </p>
  <div class="flex justify-between mt-10 text-xs">
    <div>
      <p class="font-bold mb-1">Руководитель организации:</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">должность / подпись / расшифровка</p>
    </div>
    <div>
      <p class="font-bold mb-1">С приказом ознакомлен(а):</p>
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{employee_fio}}} / «___» __________ 20___ г.</p>
    </div>
  </div>
</div>`,
  },
{
      id: "labour-contract-fixed",
    name: "Трудовой договор (срочный)",
    category: "business",
    actSource: "ст. 56-59 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Срочный трудовой договор: на определённый срок (ст. 59 ТК РФ), с испытательным сроком и условиями оплаты.",
    suggestedDocs: [],
    fields: [
      { id: "city", label: "Город заключения", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_director", label: "Руководитель", type: "text", defaultValue: "", category: "employer" },
      { id: "employer_attrs", label: "Реквизиты работодателя", type: "textarea", defaultValue: "", category: "employer", rows: 2 },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_passport", label: "Паспорт работника", type: "text", defaultValue: "", category: "employee" },
      { id: "employee_living_address", label: "Адрес регистрации", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "place", label: "Место работы", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата начала работы", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Дата окончания (для срочного)", type: "date", defaultValue: "", category: "contract" },
      { id: "term_reason", label: "Основание срочности", type: "select", defaultValue: "По соглашению сторон (ст. 59 ч.2 ТК РФ)", category: "contract", options: [
        { label: "По соглашению сторон (ст. 59 ч.2 ТК РФ)", value: "По соглашению сторон (ст. 59 ч.2 ТК РФ)" },
        { label: "Сезонные работы (ст. 59 ч.1 ТК РФ)", value: "Сезонные работы (ст. 59 ч.1 ТК РФ)" },
        { label: "Замещение временно отсутствующего работника", value: "Замещение временно отсутствующего работника" },
      ] },
      { id: "probation", label: "Испытательный срок", type: "text", defaultValue: "", category: "contract" },
      { id: "salary", label: "Оклад (руб.)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "work_hours", label: "Режим работы", type: "text", defaultValue: "", category: "contract" },
      { id: "vacation_days", label: "Отпуск (дней)", type: "text", defaultValue: "", category: "contract" },
      { id: "duties", label: "Обязанности работника", type: "textarea", defaultValue: "", category: "contract", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Трудовой договор (срочный)</div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong> в лице {{{employer_director}}}, действующего на основании Устава,
    именуемое «Работодатель», и <strong>{{{employee_fio}}}</strong> (паспорт: {{{employee_passport}}},
    зарегистрирован по адресу: {{{employee_living_address}}}), именуемый «Работник», заключили настоящий
    договор о нижеследующем:
  </p>
  <p class="font-bold mb-2">1. Общие положения</p>
  <p class="mb-3 text-justify">Договор заключён на срок: до {{{end_date}}} {{{#term_reason}}}(основание: {{{term_reason}}}) {{{/term_reason}}}.</p>
  <p class="font-bold mb-2">2. Трудовая функция</p>
  <p class="mb-3 text-justify">Работник принимается на должность {{{position}}} {{{#place}}} с местом работы {{{place}}} {{{/place}}}.</p>
  <p class="font-bold mb-2">3. Оплата и режим труда</p>
  <p class="mb-3 text-justify">Оклад {{{salary}}} руб. в месяц. {{{#work_hours}}}Режим работы: {{{work_hours}}}. {{{/work_hours}}}
    Ежегодный отпуск {{{vacation_days}}} календарных дней. {{{#probation}}}Испытательный срок: {{{probation}}}. {{{/probation}}}</p>
  <p class="font-bold mb-2">4. Права и обязанности</p>
  <p class="mb-3 text-justify">Работник обязан добросовестно выполнять трудовые обязанности: {{{duties}}}. Стороны руководствуются ТК РФ (ст. 56-59, 67-68 ТК РФ).</p>
  <p class="mb-3 text-justify">Договор вступает в силу с {{{start_date}}} (ст. 61 ТК РФ).</p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_company}}}</p>
      <p class="text-[10px] text-zinc-500">{{{employer_attrs}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">{{{employer_director}}}</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <p class="text-[10px] text-zinc-500">Паспорт: {{{employee_passport}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
      id: "loan-contract",
    name: "Договор займа (с процентами)",
    category: "business",
    actSource: "ст. 807-810 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор займа между физлицами: сумма, проценты, срок возврата, ответственность. Альтернатива расписке.",
    suggestedDocs: ["raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "lender_fio", label: "Займодавец (ФИО)", type: "text", defaultValue: "", category: "lender", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт займодавца", type: "text", defaultValue: "", category: "lender" },
      { id: "lender_living_address", label: "Адрес займодавца", type: "text", defaultValue: "", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "", category: "borrower", validation: { required: true } },
      { id: "borrower_passport", label: "Паспорт заёмщика", type: "text", defaultValue: "", category: "borrower" },
      { id: "borrower_living_address", label: "Адрес заёмщика", type: "text", defaultValue: "", category: "borrower" },
      { id: "amount", label: "Сумма займа (руб.)", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "percent", label: "Проценты годовых", type: "text", defaultValue: "", category: "contract" },
      { id: "percent_free", label: "Беспроцентный", type: "select", defaultValue: "Нет", category: "contract", options: [
        { label: "Нет", value: "Нет" },
        { label: "Да", value: "Да" },
      ] },
      { id: "return_date", label: "Дата возврата", type: "date", defaultValue: "", category: "contract" },
      { id: "transfer_method", label: "Способ передачи денег", type: "text", defaultValue: "", category: "contract" },
      { id: "penalty", label: "Неустойка (% в день)", type: "text", defaultValue: "", category: "contract" },
      { id: "purpose", label: "Цель займа", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа</div>
  <p class="mb-4 text-justify">
    <strong>{{{lender_fio}}}</strong> (паспорт: {{{lender_passport}}}, адрес: {{{lender_living_address}}}),
    именуемый «Займодавец», и <strong>{{{borrower_fio}}}</strong> (паспорт: {{{borrower_passport}}},
    адрес: {{{borrower_living_address}}}), именуемый «Заёмщик», заключили настоящий договор (ст. 807-810 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">Займодавец передаёт Заёмщику денежные средства в размере
    <strong>{{{amount}}} (_______________) рублей</strong>, а Заёмщик обязуется возвратить сумму займа
    и уплатить проценты в срок до {{{return_date}}}.</p>
  <p class="font-bold mb-2">2. Проценты</p>
  <p class="mb-3 text-justify">
    {{{#percent_free}}}Заём является беспроцентным (ст. 809 ГК РФ). {{{/percent_free}}}
    {{{#percent}}}За пользование займом уплачиваются проценты в размере {{{percent}}}% годовых (ст. 809 ГК РФ). {{{/percent}}}
  </p>
  <p class="font-bold mb-2">3. Порядок передачи и возврата</p>
  <p class="mb-3 text-justify">Денежные средства передаются {{{transfer_method}}}. {{{#purpose}}}Цель займа: {{{purpose}}}. {{{/purpose}}}</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">В случае просрочки возврата суммы займа Заёмщик уплачивает неустойку в размере {{{penalty}}}% от суммы займа за каждый день просрочки (ст. 330, 811 ГК РФ).</p>
  <p class="mb-3 text-justify">Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу.</p>
  <div class="flex justify-between mt-10 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">Займодавец:</p>
      <p class="mb-6">{{{lender_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заёмщик:</p>
      <p class="mb-6">{{{borrower_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "consulting-services",
    name: "Договор оказания консультационных услуг",
    category: "business",
    actSource: "ст. 779 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на оказание консультационных (юридических, бухгалтерских, управленческих) услуг с фиксированной стоимостью.",
    suggestedDocs: ["act-services", "invoice"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_fio", label: "Исполнитель (ФИО/название)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_passport", label: "Паспорт/реквизиты исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_fio", label: "Заказчик (ФИО/название)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН Заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "consult_type", label: "Вид консультаций", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "consult_price", label: "Стоимость (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "start_date", label: "Начало оказания", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Окончание оказания", type: "date", defaultValue: "", category: "contract" },
      { id: "consult_count", label: "Количество консультаций/часов", type: "text", defaultValue: "", category: "items" },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "responsibility", label: "Ответственность исполнителя", type: "textarea", defaultValue: "", category: "other", rows: 2 },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания консультационных услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_fio}}}</strong> ({{{executor_passport}}}), именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_fio}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказать Заказчику консультационные услуги: {{{consult_type}}}, в объёме {{{consult_count}}}, а Заказчик обязуется оплатить их.</p>
  <p class="font-bold mb-2">2. Сроки и стоимость</p>
  <p class="mb-3 text-justify">2.1. Срок оказания услуг: с «{{{start_date}}}» по «{{{end_date}}}». Стоимость услуг составляет <strong>{{{consult_price}}} руб.</strong> ({{{consult_price_words}}}).</p>
  <p class="mb-3 text-justify">2.2. Оплата производится: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Обязанности сторон</p>
  <p class="mb-3 text-justify">3.1. Исполнитель обязан оказывать консультации качественно и в срок; Заказчик — предоставить необходимые документы и оплатить услуги.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Исполнитель несёт ответственность {{{responsibility}}} (ст. 401, 779 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Услуги считаются оказанными с момента подписания акта оказанных услуг.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_fio}}}</p>
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
    id: "info-services",
    name: "Договор на оказание информационных услуг",
    category: "business",
    actSource: "ст. 779 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на предоставление информационных услуг: справки, мониторинг, подбор информации, аналитические материалы.",
    suggestedDocs: ["act-services"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_fio", label: "Исполнитель (ФИО/название)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН Исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_fio", label: "Заказчик (ФИО/название)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "info_subject", label: "Предмет информации", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "info_volume", label: "Объём/форма предоставления", type: "text", defaultValue: "", category: "items" },
      { id: "info_price", label: "Стоимость (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок предоставления", type: "text", defaultValue: "", category: "contract" },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание информационных услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_fio}}}</strong> (ИНН {{{executor_inn}}}), именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_fio}}}</strong>, именуемый «Заказчик», с другой стороны, заключили настоящий договор (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется предоставить Заказчику информацию: {{{info_subject}}}, в объёме {{{info_volume}}}, а Заказчик — оплатить её.</p>
  <p class="font-bold mb-2">2. Сроки и стоимость</p>
  <p class="mb-3 text-justify">2.1. Срок предоставления: {{{deadline}}}. Стоимость: <strong>{{{info_price}} руб.</strong>} ({{{info_price_words}}}).</p>
  <p class="mb-3 text-justify">2.2. Оплата: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Порядок сдачи</p>
  <p class="mb-3 text-justify">3.1. Информация передаётся в согласованной форме; факт оказания подтверждается актом.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Исполнитель не несёт ответственности за последствия использования информации Заказчиком, если информация предоставлена в полном объёме и без искажений.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_fio}}}</p>
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
    id: "household-contract",
    name: "Договор бытового подряда",
    category: "business",
    actSource: "ст. 730-739 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на выполнение работ для личных, семейных, домашних нужд: ремонт, изготовление мебели, мелкий ремонт техники.",
    suggestedDocs: ["act-works", "raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "contractor_fio", label: "Подрядчик (ФИО)", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_passport", label: "Паспорт подрядчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "customer_fio", label: "Заказчик (ФИО)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "work_desc", label: "Описание работ", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "work_price", label: "Цена работ (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "material_source", label: "Материалы", type: "select", defaultValue: "из материалов заказчика", category: "items", options: [
        { label: "Из материалов заказчика", value: "из материалов заказчика" },
        { label: "Из материалов подрядчика", value: "из материалов подрядчика" },
      ] },
      { id: "start_date", label: "Дата начала", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Дата окончания", type: "date", defaultValue: "", category: "contract" },
      { id: "warranty", label: "Гарантийный срок", type: "text", defaultValue: "", category: "contract" },
      { id: "advance", label: "Аванс (руб.)", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор бытового подряда</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{contractor_fio}}}</strong> (паспорт {{{contractor_passport}}}), именуемый «Подрядчик», с одной стороны, и
    гражданин <strong>{{{customer_fio}}}</strong> (паспорт {{{customer_passport}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор (ст. 730-739 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Подрядчик обязуется выполнить по заданию Заказчика следующие работы: {{{work_desc}}}, и сдать их результат Заказчику, а Заказчик — принять и оплатить.</p>
  <p class="mb-3 text-justify">1.2. Работы выполняются {{{material_source}}}.</p>
  <p class="font-bold mb-2">2. Цена и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Цена работ составляет <strong>{{{work_price}} руб.</strong>} ({{{work_price_words}}}). Аванс: {{{advance}}} руб. Остаток — после подписания акта.</p>
  <p class="font-bold mb-2">3. Сроки</p>
  <p class="mb-3 text-justify">3.1. Начало работ: «{{{start_date}}}», окончание: «{{{end_date}}}». Досрочное выполнение поощряется, нарушение сроков влечёт неустойку 0,1% в день (ст. 708 ГК РФ).</p>
  <p class="font-bold mb-2">4. Гарантии</p>
  <p class="mb-3 text-justify">4.1. Гарантийный срок на выполненные работы: {{{warranty}}}. Заказчик вправе предъявлять требования о недостатках в этот период (ст. 737 ГК РФ).</p>
  
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
    id: "subcontract",
    name: "Договор субподряда",
    category: "business",
    actSource: "ст. 706 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор между подрядчиком и субподрядчиком на выполнение части работ по основному договору подряда.",
    suggestedDocs: ["act-works", "contract-works"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "contractor_fio", label: "Подрядчик (организация)", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_inn", label: "ИНН Подрядчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "subcontractor_fio", label: "Субподрядчик (организация)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "subcontractor_inn", label: "ИНН Субподрядчика", type: "text", defaultValue: "", category: "executor" },
      { id: "main_contract", label: "Основной договор (реквизиты)", type: "text", defaultValue: "", category: "contract" },
      { id: "works_scope", label: "Объём работ субподрядчика", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "subcontract_price", label: "Стоимость (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract" },
      { id: "acceptance_order", label: "Порядок приёмки", type: "text", defaultValue: "", category: "contract" },
      { id: "penalty", label: "Неустойка (% в день)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор субподряда</div>
  <p class="mb-4 text-justify">
    <strong>{{{contractor_fio}}}</strong> (ИНН {{{contractor_inn}}}), именуемый «Подрядчик», с одной стороны, и
    <strong>{{{subcontractor_fio}}}</strong> (ИНН {{{subcontractor_inn}}}), именуемый «Субподрядчик», с другой стороны,
    заключили настоящий договор (ст. 706 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Субподрядчик обязуется выполнить часть работ по основному договору {{{main_contract}}}: {{{works_scope}}}, а Подрядчик — принять и оплатить.</p>
  <p class="font-bold mb-2">2. Стоимость</p>
  <p class="mb-3 text-justify">2.1. Стоимость работ Субподрядчика: <strong>{{{subcontract_price}} руб.</strong>} ({{{subcontract_price_words}}}) — НДС не облагается.</p>
  <p class="font-bold mb-2">3. Сроки</p>
  <p class="mb-3 text-justify">3.1. Начало: «{{{start_date}}}», окончание: «{{{end_date}}}». Приёмка: {{{acceptance_order}}}.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За просрочку Субподрядчик уплачивает неустойку {{{penalty}}}% в день от стоимости невыполненных работ. Подрядчик отвечает перед Заказчиком за действия Субподрядчика как за свои (ст. 706 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Субподрядчик:</p>
      <p class="mb-6">{{{subcontractor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "parttime-contract",
    name: "Трудовой договор по совместительству",
    category: "business",
    actSource: "ст. 282-288 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Трудовой договор с работником по совместительству: режим работы, оплата, основания прекращения по ТК РФ.",
    suggestedDocs: ["hire-order", "employment-contract"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_fio", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employer_inn", label: "ИНН Работодателя", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "Работник (ФИО)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_passport", label: "Паспорт работника", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "salary", label: "Оклад (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "work_schedule", label: "Режим работы", type: "text", defaultValue: "", category: "contract" },
      { id: "main_job", label: "Основное место работы", type: "text", defaultValue: "", category: "contract" },
      { id: "contract_period", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Трудовой договор по совместительству</div>
  <p class="mb-4 text-justify">
    {{{employer_fio}}} (ИНН {{{employer_inn}}}), именуемый «Работодатель», с одной стороны, и
    гражданин <strong>{{{employee_fio}}}</strong> (паспорт {{{employee_passport}}}), именуемый «Работник», с другой стороны,
    заключили настоящий договор (ст. 56, 282-288 ТК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Работник принимается на работу по совместительству на должность {{{position}}}. Основное место работы: {{{main_job}}}.</p>
  <p class="font-bold mb-2">2. Режим работы и отдыха</p>
  <p class="mb-3 text-justify">2.1. Режим работы: {{{work_schedule}}}. Продолжительность рабочего времени при совместительстве не должна превышать 4 часов в день (ст. 284 ТК РФ).</p>
  <p class="font-bold mb-2">3. Оплата труда</p>
  <p class="mb-3 text-justify">3.1. Работнику устанавливается оплата в размере <strong>{{{salary}} руб.</strong>} в месяц пропорционально отработанному времени.</p>
  <p class="font-bold mb-2">4. Срок действия</p>
  <p class="mb-3 text-justify">4.1. Договор заключён на срок: {{{contract_period}}}. Договор может быть прекращён при приёме на работу работника, для которого эта работа будет основной (ст. 288 ТК РФ).</p>
  
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
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "remote-contract",
    name: "Трудовой договор (дистанционный)",
    category: "business",
    actSource: "ст. 312.1-312.5 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Трудовой договор с дистанционным работником: удалённая работа, электронный документооборот, режим рабочего времени.",
    suggestedDocs: ["hire-order"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_fio", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employee_fio", label: "Работник (ФИО)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_passport", label: "Паспорт работника", type: "text", defaultValue: "", category: "employee" },
      { id: "position", label: "Должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "salary", label: "Оклад (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "remote_place", label: "Место дистанционной работы", type: "text", defaultValue: "", category: "contract" },
      { id: "remote_schedule", label: "Режим рабочего времени", type: "text", defaultValue: "", category: "contract" },
      { id: "edm", label: "Электронный документооборот", type: "select", defaultValue: "да", category: "contract", options: [
        { label: "Да, через ЭДО", value: "да" },
        { label: "Нет, на бумаге", value: "нет" },
      ] },
      { id: "equipment", label: "Обеспечение оборудованием", type: "select", defaultValue: "работодатель предоставляет", category: "contract", options: [
        { label: "Работодатель предоставляет", value: "работодатель предоставляет" },
        { label: "Используется оборудование работника", value: "используется оборудование работника" },
      ] },
      { id: "contract_period", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Трудовой договор (дистанционный)</div>
  <p class="mb-4 text-justify">
    {{{employer_fio}}}, именуемый «Работодатель», с одной стороны, и
    гражданин <strong>{{{employee_fio}}}</strong> (паспорт {{{employee_passport}}}), именуемый «Работник», с другой стороны,
    заключили настоящий договор о дистанционной работе (ст. 312.1-312.5 ТК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Работник принимается на дистанционную работу на должность {{{position}}}. Место работы: {{{remote_place}}}.</p>
  <p class="font-bold mb-2">2. Режим работы</p>
  <p class="mb-3 text-justify">2.1. Режим рабочего времени: {{{remote_schedule}}} (ст. 312.4 ТК РФ).</p>
  <p class="font-bold mb-2">3. Оплата труда</p>
  <p class="mb-3 text-justify">3.1. Работнику устанавливается оклад в размере <strong>{{{salary}} руб.</strong>} в месяц.</p>
  <p class="font-bold mb-2">4. Оборудование и документооборот</p>
  <p class="mb-3 text-justify">4.1. {{{equipment}}}. {{{edm}}}: обмен документами осуществляется в электронной форме с усиленной квалифицированной электронной подписью (ст. 312.3 ТК РФ).</p>
  <p class="font-bold mb-2">5. Срок действия</p>
  <p class="mb-3 text-justify">5.1. Договор заключён на срок: {{{contract_period}}}.</p>
  
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
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "equipment-supply",
    name: "Договор поставки оборудования",
    category: "business",
    actSource: "ст. 506-524 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поставки оборудования: спецификация, условия доставки, монтаж, гарантия, порядок приёмки.",
    suggestedDocs: ["supply-contract", "invoice"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "supplier_fio", label: "Поставщик", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "supplier_inn", label: "ИНН Поставщика", type: "text", defaultValue: "", category: "seller" },
      { id: "customer_fio", label: "Покупатель", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН Покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "equipment_desc", label: "Оборудование (спецификация)", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "equipment_price", label: "Цена (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "delivery_terms", label: "Условия поставки", type: "text", defaultValue: "", category: "contract" },
      { id: "delivery_date", label: "Срок поставки", type: "text", defaultValue: "", category: "contract" },
      { id: "install_terms", label: "Монтаж и пусконаладка", type: "select", defaultValue: "включены в стоимость", category: "contract", options: [
        { label: "Включены в стоимость", value: "включены в стоимость" },
        { label: "Оплачиваются отдельно", value: "оплачиваются отдельно" },
        { label: "Не входят", value: "не входят" },
      ] },
      { id: "warranty", label: "Гарантия (мес.)", type: "text", defaultValue: "", category: "contract" },
      { id: "payment_order", label: "Условия оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "penalty", label: "Неустойка (% в день)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поставки оборудования</div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_fio}}}</strong> (ИНН {{{supplier_inn}}}), именуемый «Поставщик», с одной стороны, и
    <strong>{{{customer_fio}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор (ст. 506-524 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Поставщик обязуется передать в собственность Покупателя оборудование: {{{equipment_desc}}}, а Покупатель — принять и оплатить его.</p>
  <p class="font-bold mb-2">2. Цена и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Цена договора: <strong>{{{equipment_price}} руб.</strong>} ({{{equipment_price_words}}}). Условия оплаты: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Условия поставки</p>
  <p class="mb-3 text-justify">3.1. Поставка: {{{delivery_terms}}}, срок: {{{delivery_date}}}. Монтаж и пусконаладка: {{{install_terms}}}.</p>
  <p class="font-bold mb-2">4. Гарантии</p>
  <p class="mb-3 text-justify">4.1. Гарантийный срок на оборудование: {{{warranty}}} месяцев с даты поставки. В гарантийный период Поставщик устраняет дефекты за свой счёт.</p>
  <p class="font-bold mb-2">5. Ответственность</p>
  <p class="mb-3 text-justify">5.1. За просрочку поставки Поставщик уплачивает неустойку {{{penalty}}}% от стоимости непоставленного оборудования за каждый день просрочки (ст. 521 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Поставщик:</p>
      <p class="mb-6">{{{supplier_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Покупатель:</p>
      <p class="mb-6">{{{customer_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "goods-sale",
    name: "Договор купли-продажи товара",
    category: "business",
    actSource: "ст. 454-491 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Универсальный договор купли-продажи товара между физлицами и организациями: предмет, цена, порядок передачи, ответственность.",
    suggestedDocs: ["raspiska-money", "invoice"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "seller_fio", label: "Продавец", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_passport", label: "Паспорт продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "Покупатель", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "buyer_inn", label: "ИНН покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "goods_desc", label: "Описание товара", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "goods_qty", label: "Количество", type: "text", defaultValue: "", category: "items" },
      { id: "goods_price", label: "Цена (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "delivery_order", label: "Порядок передачи", type: "text", defaultValue: "", category: "contract" },
      { id: "quality_guarantee", label: "Гарантия качества", type: "select", defaultValue: "товар соответствует заявленным характеристикам", category: "contract", options: [
        { label: "Товар соответствует заявленным характеристикам", value: "товар соответствует заявленным характеристикам" },
        { label: "Гарантия производителя", value: "гарантия производителя" },
        { label: "Продавец не отвечает за недостатки", value: "продавец не отвечает за недостатки" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор купли-продажи товара</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (паспорт {{{seller_passport}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong> (ИНН {{{buyer_inn}}}), именуемый «Покупатель», с другой стороны,
    заключили настоящий договор (ст. 454-491 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Продавец обязуется передать в собственность Покупателя товар: {{{goods_desc}}}, в количестве {{{goods_qty}}}, а Покупатель — принять и оплатить его.</p>
  <p class="font-bold mb-2">2. Цена и порядок расчётов</p>
  <p class="mb-3 text-justify">2.1. Цена товара: <strong>{{{goods_price}} руб.</strong>} ({{{goods_price_words}}}). Оплата: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Передача товара</p>
  <p class="mb-3 text-justify">3.1. {{{delivery_order}}}. Риск случайной гибели переходит к Покупателю с момента передачи (ст. 459 ГК РФ).</p>
  <p class="font-bold mb-2">4. Качество</p>
  <p class="mb-3 text-justify">4.1. {{{quality_guarantee}}}. Покупатель вправе предъявить требования при обнаружении недостатков (ст. 475 ГК РФ).</p>
  
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
    id: "retail-sale",
    name: "Договор розничной купли-продажи",
    category: "business",
    actSource: "ст. 492-505 ГК РФ, Закон «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description: "Договор розничной купли-продажи с потребителем: публичный характер договора, права потребителя на возврат и обмен товара.",
    suggestedDocs: ["goods-sale", "invoice"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "seller_fio", label: "Продавец", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "seller_inn", label: "ИНН Продавца", type: "text", defaultValue: "", category: "seller" },
      { id: "seller_address", label: "Адрес магазина", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_fio", label: "Покупатель (ФИО)", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "goods_desc", label: "Товар", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "goods_price", label: "Цена (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "warranty", label: "Гарантийный срок", type: "text", defaultValue: "", category: "contract" },
      { id: "return_rights", label: "Право на возврат", type: "select", defaultValue: "товар надлежащего качества, не подлежит возврату (электроника)", category: "contract", options: [
        { label: "Товар надлежащего качества, возврат в 14 дней", value: "товар надлежащего качества, возврат в 14 дней" },
        { label: "Товар не подлежит возврату (перечень ПП №2463)", value: "товар не подлежит возврату (перечень ПП №2463)" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор розничной купли-продажи</div>
  <p class="mb-4 text-justify">
    <strong>{{{seller_fio}}}</strong> (ИНН {{{seller_inn}}}, адрес: {{{seller_address}}}), именуемый «Продавец», с одной стороны, и
    <strong>{{{buyer_fio}}}</strong>, именуемый «Покупатель», с другой стороны,
    заключили настоящий договор (ст. 492-505 ГК РФ, Закон «О защите прав потребителей»):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Продавец обязуется передать Покупателю товар: {{{goods_desc}}}, предназначенный для личного, семейного, домашнего использования, а Покупатель — оплатить его.</p>
  <p class="font-bold mb-2">2. Цена</p>
  <p class="mb-3 text-justify">2.1. Цена товара: <strong>{{{goods_price}} руб.</strong>} ({{{goods_price_words}}}). Оплата производится наличными/банковской картой на кассе.</p>
  <p class="font-bold mb-2">3. Гарантия</p>
  <p class="mb-3 text-justify">3.1. Гарантийный срок: {{{warranty}}}. При обнаружении недостатков Покупатель вправе требовать замены, ремонта, соразмерного уменьшения цены или возврата денег (ст. 18 Закона о ЗПП).</p>
  <p class="font-bold mb-2">4. Возврат товара</p>
  <p class="mb-3 text-justify">4.1. {{{return_rights}}}.</p>
  
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
    id: "agency-contract",
    name: "Агентский договор",
    category: "business",
    actSource: "ст. 1005-1011 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Агентский договор: агент за вознаграждение совершает юридические и фактические действия от своего имени или от имени принципала.",
    suggestedDocs: ["service-agreement", "act-services"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "principal_fio", label: "Принципал", type: "text", defaultValue: "", category: "principal", validation: { required: true } },
      { id: "principal_inn", label: "ИНН Принципала", type: "text", defaultValue: "", category: "principal" },
      { id: "agent_fio", label: "Агент", type: "text", defaultValue: "", category: "agent", validation: { required: true } },
      { id: "agent_inn", label: "ИНН Агента", type: "text", defaultValue: "", category: "agent" },
      { id: "agency_actions", label: "Действия агента", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "in_own_name", label: "От чьего имени действует агент", type: "select", defaultValue: "от имени принципала", category: "contract", options: [
        { label: "От имени принципала", value: "от имени принципала" },
        { label: "От своего имени", value: "от своего имени" },
      ] },
      { id: "reward_type", label: "Вознаграждение", type: "select", defaultValue: "процент от сделок", category: "payment", options: [
        { label: "Фиксированная сумма", value: "фиксированная сумма" },
        { label: "Процент от сделок", value: "процент от сделок" },
      ] },
      { id: "reward_amount", label: "Размер вознаграждения", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "agent_period", label: "Срок действия", type: "text", defaultValue: "", category: "contract" },
      { id: "territory", label: "Территория", type: "text", defaultValue: "", category: "contract" },
      { id: "report_period", label: "Отчётность агента", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Агентский договор</div>
  <p class="mb-4 text-justify">
    <strong>{{{principal_fio}}}</strong> (ИНН {{{principal_inn}}}), именуемый «Принципал», с одной стороны, и
    <strong>{{{agent_fio}}}</strong> (ИНН {{{agent_inn}}}), именуемый «Агент», с другой стороны,
    заключили настоящий договор (ст. 1005-1011 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Агент обязуется за вознаграждение совершать по поручению Принципала следующие действия: {{{agency_actions}}}, {{{in_own_name}}}, на территории {{{territory}}}.</p>
  <p class="font-bold mb-2">2. Вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Вознаграждение Агента: {{{reward_amount}}}. Отчётность: {{{report_period}}} (ст. 1008 ГК РФ).</p>
  <p class="font-bold mb-2">3. Срок действия</p>
  <p class="mb-3 text-justify">3.1. Договор действует {{{agent_period}}}. Каждая из сторон вправе отказаться от договора, уведомив другую сторону за 30 дней (ст. 1010 ГК РФ).</p>
  <p class="font-bold mb-2">4. Обязанности сторон</p>
  <p class="mb-3 text-justify">4.1. Принципал обязан предоставить Агенту необходимые материалы и информацию, выплатить вознаграждение; Агент — исполнять поручения добросовестно и отчитываться.</p>
  
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
      <p class="font-bold mb-1">Принципал:</p>
      <p class="mb-6">{{{principal_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Агент:</p>
      <p class="mb-6">{{{agent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "commission-contract",
    name: "Договор комиссии",
    category: "business",
    actSource: "ст. 990-1004 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор комиссии: комиссионер обязуется от своего имени совершить сделку по поручению комитента за вознаграждение.",
    suggestedDocs: ["agency-contract", "act-services"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "principal_fio", label: "Комитент", type: "text", defaultValue: "", category: "principal", validation: { required: true } },
      { id: "principal_inn", label: "ИНН Комитента", type: "text", defaultValue: "", category: "principal" },
      { id: "agent_fio", label: "Комиссионер", type: "text", defaultValue: "", category: "agent", validation: { required: true } },
      { id: "agent_inn", label: "ИНН Комиссионера", type: "text", defaultValue: "", category: "agent" },
      { id: "commission_action", label: "Поручение комиссионеру", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "min_price", label: "Минимальная цена продажи (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "reward_amount", label: "Вознаграждение", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "extra_benefit", label: "Дополнительная выгода", type: "select", defaultValue: "делится пополам", category: "payment", options: [
        { label: "Принадлежит комиссионеру", value: "принадлежит комиссионеру" },
        { label: "Делится пополам", value: "делится пополам" },
        { label: "Принадлежит комитенту", value: "принадлежит комитенту" },
      ] },
      { id: "commission_period", label: "Срок исполнения", type: "text", defaultValue: "", category: "contract" },
      { id: "report_period", label: "Отчётность", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор комиссии</div>
  <p class="mb-4 text-justify">
    <strong>{{{principal_fio}}}</strong> (ИНН {{{principal_inn}}}), именуемый «Комитент», с одной стороны, и
    <strong>{{{agent_fio}}}</strong> (ИНН {{{agent_inn}}}), именуемый «Комиссионер», с другой стороны,
    заключили настоящий договор (ст. 990-1004 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Комиссионер обязуется от своего имени, но за счёт Комитента совершить сделку: {{{commission_action}}}, по цене не ниже {{{min_price}}} руб., в срок {{{commission_period}}}.</p>
  <p class="font-bold mb-2">2. Вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Вознаграждение Комиссионера: {{{reward_amount}}}. Дополнительная выгода: {{{extra_benefit}}} (ст. 992 ГК РФ).</p>
  <p class="font-bold mb-2">3. Отчётность</p>
  <p class="mb-3 text-justify">3.1. Комиссионер представляет отчёт: {{{report_period}}}. Комитент обязан рассмотреть отчёт и уведомить о возражениях в течение 30 дней (ст. 999 ГК РФ).</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Имущество, поступившее к Комиссионеру от Комитента либо приобретённое для него, является собственностью Комитента (ст. 996 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Комитент:</p>
      <p class="mb-6">{{{principal_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Комиссионер:</p>
      <p class="mb-6">{{{agent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "mandate-contract",
    name: "Договор поручения",
    category: "business",
    actSource: "ст. 971-979 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поручения: поверенный совершает юридические действия от имени и за счёт доверителя на основании доверенности.",
    suggestedDocs: ["power-of-attorney-docs", "agency-contract"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "principal_fio", label: "Доверитель", type: "text", defaultValue: "", category: "principal", validation: { required: true } },
      { id: "principal_passport", label: "Паспорт доверителя", type: "text", defaultValue: "", category: "principal" },
      { id: "agent_fio", label: "Поверенный", type: "text", defaultValue: "", category: "agent", validation: { required: true } },
      { id: "agent_passport", label: "Паспорт поверенного", type: "text", defaultValue: "", category: "agent" },
      { id: "mandate_actions", label: "Юридические действия", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "reward_type", label: "Вознаграждение", type: "select", defaultValue: "безвозмездно", category: "payment", options: [
        { label: "Безвозмездно", value: "безвозмездно" },
        { label: "За вознаграждение", value: "за вознаграждение" },
      ] },
      { id: "reward_amount", label: "Размер вознаграждения", type: "text", defaultValue: "", category: "payment" },
      { id: "mandate_period", label: "Срок действия", type: "text", defaultValue: "", category: "contract" },
      { id: "power_of_attorney", label: "Доверенность", type: "text", defaultValue: "", category: "contract" },
      { id: "expenses", label: "Расходы поверенного", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поручения</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{principal_fio}}}</strong> (паспорт {{{principal_passport}}}), именуемый «Доверитель», с одной стороны, и
    гражданин <strong>{{{agent_fio}}}</strong> (паспорт {{{agent_passport}}}), именуемый «Поверенный», с другой стороны,
    заключили настоящий договор (ст. 971-979 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Поверенный обязуется от имени и за счёт Доверителя совершить следующие юридические действия: {{{mandate_actions}}}. Для исполнения поручения {{{power_of_attorney}}}.</p>
  <p class="font-bold mb-2">2. Вознаграждение и расходы</p>
  <p class="mb-3 text-justify">2.1. Договор исполняется {{{reward_type}}}: {{{reward_amount}}}. Расходы Поверенного: {{{expenses}}}.</p>
  <p class="font-bold mb-2">3. Срок действия</p>
  <p class="mb-3 text-justify">3.1. Договор действует {{{mandate_period}}}. Доверитель вправе отменить поручение, а Поверенный — отказаться от него в любое время (ст. 977 ГК РФ).</p>
  <p class="font-bold mb-2">4. Отчётность</p>
  <p class="mb-3 text-justify">4.1. Поверенный обязан представлять отчёт о выполнении поручения и передавать всё полученное по сделкам (ст. 974 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Доверитель:</p>
      <p class="mb-6">{{{principal_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Поверенный:</p>
      <p class="mb-6">{{{agent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "license-contract",
    name: "Лицензионный договор",
    category: "business",
    actSource: "ст. 1235-1239 ГК РФ (ч. IV)",
    lastUpdated: "Август 2026",
    description: "Лицензионный договор о предоставлении права использования произведения, программы, товарного знака: срок, территория, вознаграждение.",
    suggestedDocs: ["it-development", "agreement-confidentiality"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "licensor_fio", label: "Лицензиар", type: "text", defaultValue: "", category: "seller", validation: { required: true } },
      { id: "licensor_inn", label: "ИНН Лицензиара", type: "text", defaultValue: "", category: "seller" },
      { id: "licensee_fio", label: "Лицензиат", type: "text", defaultValue: "", category: "buyer", validation: { required: true } },
      { id: "licensee_inn", label: "ИНН Лицензиата", type: "text", defaultValue: "", category: "buyer" },
      { id: "intellectual_object", label: "Объект прав", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "license_type", label: "Вид лицензии", type: "select", defaultValue: "неисключительная (простая)", category: "contract", options: [
        { label: "Неисключительная (простая)", value: "неисключительная (простая)" },
        { label: "Исключительная", value: "исключительная" },
      ] },
      { id: "license_scope", label: "Способ использования", type: "text", defaultValue: "", category: "contract" },
      { id: "license_territory", label: "Территория", type: "text", defaultValue: "", category: "contract" },
      { id: "license_fee", label: "Вознаграждение (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "license_period", label: "Срок действия", type: "text", defaultValue: "", category: "contract" },
      { id: "fee_order", label: "Порядок выплат", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Лицензионный договор</div>
  <p class="mb-4 text-justify">
    <strong>{{{licensor_fio}}}</strong> (ИНН {{{licensor_inn}}}), именуемый «Лицензиар», с одной стороны, и
    <strong>{{{licensee_fio}}}</strong> (ИНН {{{licensee_inn}}}), именуемый «Лицензиат», с другой стороны,
    заключили настоящий договор (ст. 1235-1239 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Лицензиар предоставляет Лицензиату {{{license_type}}} лицензию на использование: {{{intellectual_object}}}, способами: {{{license_scope}}}, на территории {{{license_territory}}}.</p>
  <p class="font-bold mb-2">2. Вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Вознаграждение: <strong>{{{license_fee}} руб.</strong>} ({{{license_fee_words}}}). {{{fee_order}}}.</p>
  <p class="font-bold mb-2">3. Срок</p>
  <p class="mb-3 text-justify">3.1. Срок действия договора: {{{license_period}}} (ст. 1235 ГК РФ).</p>
  <p class="font-bold mb-2">4. Гарантии</p>
  <p class="mb-3 text-justify">4.1. Лицензиар гарантирует, что обладает правами на объект и не передавал их третьим лицам, если это не противоречит условиям настоящего договора.</p>
  
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
      <p class="font-bold mb-1">Лицензиар:</p>
      <p class="mb-6">{{{licensor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Лицензиат:</p>
      <p class="mb-6">{{{licensee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "author-order",
    name: "Договор авторского заказа",
    category: "business",
    actSource: "ст. 1288-1291 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор авторского заказа: автор обязуется создать произведение (текст, дизайн, фото) и передать права заказчику.",
    suggestedDocs: ["it-development", "license-contract"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "author_fio", label: "Автор", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "author_passport", label: "Паспорт автора", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_fio", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН Заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "work_desc", label: "Описание произведения", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "work_deadline", label: "Срок создания", type: "date", defaultValue: "", category: "contract" },
      { id: "work_fee", label: "Вознаграждение (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "rights_transfer", label: "Передача исключительного права", type: "select", defaultValue: "передаётся заказчику после полной оплаты", category: "contract", options: [
        { label: "Передаётся заказчику после полной оплаты", value: "передаётся заказчику после полной оплаты" },
        { label: "Остаётся у автора (простая лицензия)", value: "остаётся у автора (простая лицензия)" },
      ] },
      { id: "author_support", label: "Право на доработку", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор авторского заказа</div>
  <p class="mb-4 text-justify">
    Гражданка <strong>{{{author_fio}}}</strong> (паспорт {{{author_passport}}}), именуемая «Автор», с одной стороны, и
    <strong>{{{customer_fio}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор (ст. 1288-1291 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Автор обязуется по заказу Заказчика создать произведение: {{{work_desc}}}, и передать Заказчику права на его использование.</p>
  <p class="font-bold mb-2">2. Срок создания</p>
  <p class="mb-3 text-justify">2.1. Срок создания произведения: до «{{{work_deadline}}}». {{{author_support}}}.</p>
  <p class="font-bold mb-2">3. Вознаграждение</p>
  <p class="mb-3 text-justify">3.1. Вознаграждение Автора: <strong>{{{work_fee}} руб.</strong>} ({{{work_fee_words}}}).</p>
  <p class="font-bold mb-2">4. Права на произведение</p>
  <p class="mb-3 text-justify">4.1. {{{rights_transfer}}} (ст. 1288, 1291 ГК РФ). Личные неимущественные права (авторство, имя) сохраняются за Автором.</p>
  
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
      <p class="font-bold mb-1">Автор:</p>
      <p class="mb-6">{{{author_fio}}}</p>
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
    id: "goods-power-of-attorney",
    name: "Доверенность на получение товара",
    category: "business",
    actSource: "ст. 185-189 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Доверенность на получение товара и подписание документов: передача полномочий сотруднику или представителю.",
    suggestedDocs: ["power-of-attorney-docs", "goods-sale"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract" },
      { id: "principal_fio", label: "Доверитель (организация)", type: "text", defaultValue: "", category: "principal", validation: { required: true } },
      { id: "principal_inn", label: "ИНН Доверителя", type: "text", defaultValue: "", category: "principal" },
      { id: "representative_fio", label: "Представитель (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "representative_passport", label: "Паспорт представителя", type: "text", defaultValue: "", category: "representative" },
      { id: "goods_desc", label: "Товар к получению", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "supplier_name", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "poa_period", label: "Срок действия", type: "text", defaultValue: "", category: "contract" },
      { id: "rights_scope", label: "Дополнительные полномочия", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center text-xs font-semibold mb-4">
    <p>г. {{{city}}}</p>
    <p>«{{{date}}}»</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Доверенность</div>
  <p class="mb-4 text-justify">
    <strong>{{{principal_fio}}}</strong> (ИНН {{{principal_inn}}}), в лице представителя, настоящей доверенностью уполномочивает
    гражданина <strong>{{{representative_fio}}}</strong> (паспорт {{{representative_passport}}}) представлять интересы Общества.
  </p>
  <p class="mb-4 text-justify">
    Представитель уполномочен получать у {{{supplier_name}}} товар: {{{goods_desc}}}, а также {{{rights_scope}}} (ст. 185 ГК РФ).
  </p>
  <p class="mb-4 text-justify">
    Доверенность выдана сроком {{{poa_period}}} без права передоверия. Подпись представителя: {{{representative_fio}}} _______________.
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">Доверитель:</p>
      <p class="mb-6">{{{principal_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "sign-power-of-attorney",
    name: "Доверенность на подписание договора",
    category: "business",
    actSource: "ст. 185-189 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Доверенность на право подписания договоров и первичных документов от имени организации.",
    suggestedDocs: ["power-of-attorney-docs", "goods-power-of-attorney"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract" },
      { id: "principal_fio", label: "Доверитель (организация)", type: "text", defaultValue: "", category: "principal", validation: { required: true } },
      { id: "principal_inn", label: "ИНН Доверителя", type: "text", defaultValue: "", category: "principal" },
      { id: "representative_fio", label: "Представитель (ФИО)", type: "text", defaultValue: "", category: "representative", validation: { required: true } },
      { id: "representative_passport", label: "Паспорт представителя", type: "text", defaultValue: "", category: "representative" },
      { id: "representative_position", label: "Должность представителя", type: "text", defaultValue: "", category: "representative" },
      { id: "poa_scope", label: "Полномочия", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "counterparty_limit", label: "Ограничение по сумме", type: "text", defaultValue: "", category: "contract" },
      { id: "poa_period", label: "Срок действия", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center text-xs font-semibold mb-4">
    <p>г. {{{city}}}</p>
    <p>«{{{date}}}»</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Доверенность на подписание договора</div>
  <p class="mb-4 text-justify">
    <strong>{{{principal_fio}}}</strong> (ИНН {{{principal_inn}}}), настоящей доверенностью уполномочивает
    гражданина <strong>{{{representative_fio}}}</strong> (паспорт {{{representative_passport}}}), {{{representative_position}}},
    на совершение следующих действий: {{{poa_scope}}}.
  </p>
  <p class="mb-4 text-justify">
    Ограничение по сумме сделок: {{{counterparty_limit}}}. Доверенность выдана сроком {{{poa_period}}} с правом передоверия/без права передоверия (нужное отметить) (ст. 185-187 ГК РФ).
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">Доверитель:</p>
      <p class="mb-6">{{{principal_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "addendum-generic",
    name: "Дополнительное соглашение (универсальное)",
    category: "business",
    actSource: "ст. 450-453 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Универсальное дополнительное соглашение к любому договору: изменение условий, сроков, стоимости.",
    suggestedDocs: ["labour-addendum", "service-agreement"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "party1", label: "Сторона 1", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "party2", label: "Сторона 2", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "base_contract", label: "Основной договор", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "change_reason", label: "Причина изменений", type: "text", defaultValue: "", category: "contract" },
      { id: "change_items", label: "Изменения", type: "textarea", defaultValue: "", category: "contract", rows: 3, validation: { required: true } },
      { id: "other_terms", label: "Прочие условия", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение № ___</div>
  <p class="mb-4 text-justify">
    к {{{base_contract}}}
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{party1}}}</strong>, именуемый «Сторона 1», и <strong>{{{party2}}}</strong>, именуемый «Сторона 2»,
    заключили настоящее дополнительное соглашение (ст. 450-453 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Основание изменений</p>
  <p class="mb-3 text-justify">1.1. В связи с {{{change_reason}}} стороны договорились о внесении следующих изменений в {{{base_contract}}}.</p>
  <p class="font-bold mb-2">2. Вносимые изменения</p>
  <p class="mb-3 text-justify">2.1. {{{change_items}}}</p>
  <p class="font-bold mb-2">3. Прочие условия</p>
  <p class="mb-3 text-justify">3.1. {{{other_terms}}}. Настоящее соглашение является неотъемлемой частью {{{base_contract}}} и вступает в силу с даты подписания.</p>
  
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
      <p class="font-bold mb-1">Сторона 1:</p>
      <p class="mb-6">{{{party1}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Сторона 2:</p>
      <p class="mb-6">{{{party2}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "termination-agreement",
    name: "Соглашение о расторжении договора (универсальное)",
    category: "business",
    actSource: "ст. 450-453 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Универсальное соглашение о расторжении любого договора: прекращение обязательств, взаимные расчёты, отсутствие претензий.",
    suggestedDocs: ["addendum-generic", "claim-letter"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "party1", label: "Сторона 1", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "party2", label: "Сторона 2", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "base_contract", label: "Расторгаемый договор", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "termination_date", label: "Дата расторжения", type: "date", defaultValue: "", category: "contract" },
      { id: "settlements", label: "Взаимные расчёты", type: "text", defaultValue: "", category: "payment" },
      { id: "reasons", label: "Причина расторжения", type: "text", defaultValue: "", category: "contract" },
      { id: "return_obligations", label: "Возврат имущества/документов", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о расторжении договора</div>
  <p class="mb-4 text-justify">
    <strong>{{{party1}}}</strong>, именуемый «Сторона 1», и <strong>{{{party2}}}</strong>, именуемый «Сторона 2»,
    заключили настоящее соглашение о расторжении {{{base_contract}}} (ст. 450-453 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Расторжение договора</p>
  <p class="mb-3 text-justify">1.1. {{{base_contract}}} расторгается с «{{{termination_date}}}» {{{reasons}}}.</p>
  <p class="font-bold mb-2">2. Расчёты</p>
  <p class="mb-3 text-justify">2.1. {{{settlements}}}.</p>
  <p class="font-bold mb-2">3. Возврат имущества</p>
  <p class="mb-3 text-justify">3.1. {{{return_obligations}}}.</p>
  <p class="font-bold mb-2">4. Заключительные положения</p>
  <p class="mb-3 text-justify">4.1. С момента расторжения обязательства сторон по договору прекращаются. Соглашение составлено в двух экземплярах, имеющих равную юридическую силу.</p>
  
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
      <p class="font-bold mb-1">Сторона 1:</p>
      <p class="mb-6">{{{party1}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Сторона 2:</p>
      <p class="mb-6">{{{party2}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "refuse-notice",
    name: "Уведомление об отказе от договора (универсальное)",
    category: "business",
    actSource: "ст. 450.1, 782 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Уведомление об одностороннем отказе от исполнения договора: досрочное прекращение обязательств по предусмотренным основаниям.",
    suggestedDocs: ["termination-agreement", "claim-letter"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "", category: "contract" },
      { id: "sender_fio", label: "Отправитель (Сторона)", type: "text", defaultValue: "", category: "sender", validation: { required: true } },
      { id: "sender_inn", label: "ИНН отправителя", type: "text", defaultValue: "", category: "sender" },
      { id: "recipient_fio", label: "Получатель (Сторона)", type: "text", defaultValue: "", category: "recipient", validation: { required: true } },
      { id: "recipient_inn", label: "ИНН получателя", type: "text", defaultValue: "", category: "recipient" },
      { id: "base_contract", label: "Договор", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "refuse_reason", label: "Основание отказа", type: "textarea", defaultValue: "", category: "contract", rows: 2, validation: { required: true } },
      { id: "refuse_effective", label: "Дата вступления в силу", type: "text", defaultValue: "", category: "contract" },
      { id: "settlements", label: "Расчёты при отказе", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="mb-4 text-xs font-semibold">
    <p>{{{recipient_fio}}}</p>
    <p>ИНН {{{recipient_inn}}}</p>
    <p class="mt-2">от {{{sender_fio}}}</p>
    <p>ИНН {{{sender_inn}}}</p>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Уведомление об отказе от договора</div>
  <p class="mb-4 text-justify">
    Настоящим уведомляю об одностороннем отказе от исполнения {{{base_contract}}}.
  </p>
  <p class="mb-4 text-justify">
    Основание: {{{refuse_reason}}}.
  </p>
  <p class="mb-4 text-justify">
    В соответствии со ст. 450.1 ГК РФ договор считается расторгнутым {{{refuse_effective}}}.
  </p>
  <p class="mb-4 text-justify">
    {{{settlements}}}.
  </p>
  <p class="mb-6 text-justify">
    Уведомление направляется заказным письмом с описью вложения и по электронной почте.
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">{{{sender_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "pupil-contract",
    name: "Ученический договор",
    category: "business",
    actSource: "ст. 198-208 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Договор профессионального обучения сотрудника за счёт работодателя с обязанностью отработать после обучения.",
    suggestedDocs: ["Трудовой договор", "Договор оказания услуг"],
    fields: [
      { id: "employer_org", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "pupil_fio", label: "Обучающийся (ФИО)", type: "text", defaultValue: "", category: "employee" },
      { id: "pupil_passport", label: "Паспорт обучающегося", type: "text", defaultValue: "", category: "employee" },
      { id: "specialty", label: "Специальность (профессия)", type: "text", defaultValue: "", category: "contract" },
      { id: "study_period", label: "Срок обучения (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "study_form", label: "Форма обучения", type: "select", defaultValue: "с отрывом от работы", options: ["с отрывом от работы", "без отрыва от работы"], category: "contract" },
      { id: "work_period", label: "Срок отработки после обучения (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "stipend_amount", label: "Стипендия (руб./мес.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Ученический договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_org}}}</strong>, именуемое в дальнейшем «Работодатель», с одной стороны, и гражданин <strong>{{{pupil_fio}}}</strong>, паспорт {{{pupil_passport}}}, именуемый в дальнейшем «Обучающийся», с другой стороны, заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Работодатель организует профессиональное обучение Обучающегося по профессии <strong>{{{specialty}}}</strong> {{#study_form}}с отрывом от работы{{/study_form}}{{^study_form}}без отрыва от работы{{/study_form}} в течение {{{study_period}}} месяцев.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">2.1. Работодатель обязан обеспечить условия для обучения и выплачивать Обучающемуся стипендию в размере {{{stipend_amount}}} руб. в месяц.</p>
  <p class="mb-4 text-justify">2.2. Обучающийся обязан пройти обучение в полном объёме и отработать у Работодателя {{{work_period}}} месяцев после окончания обучения.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. В случае отчисления или отказа приступить к работе Обучающийся возмещает Работодателю расходы на обучение (ст. 249 ТК РФ).</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Работодатель:</div>
      <p class="mb-1">{{{employer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Обучающийся:</div>
      <p class="mb-1"><strong>{{{pupil_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "ds-transfer",
    name: "Допсоглашение о переводе на другую должность",
    category: "business",
    actSource: "ст. 72.1 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Дополнительное соглашение к трудовому договору о переводе сотрудника на другую должность или в другое подразделение.",
    suggestedDocs: ["Трудовой договор", "Допсоглашение к трудовому договору", "Приказ о переводе"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "employer_org", label: "Работодатель", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "Работник (ФИО)", type: "text", defaultValue: "", category: "employee" },
      { id: "td_number", label: "Номер трудового договора", type: "text", defaultValue: "", category: "contract" },
      { id: "new_position", label: "Новая должность", type: "text", defaultValue: "", category: "contract" },
      { id: "new_department", label: "Новое подразделение", type: "text", defaultValue: "", category: "contract" },
      { id: "new_salary", label: "Новый оклад (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "transfer_date", label: "Дата перевода", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_org}}}</strong> в лице генерального директора, действующего на основании Устава, именуемое в дальнейшем «Работодатель», и <strong>{{{employee_fio}}}</strong>, именуемый в дальнейшем «Работник», заключили настоящее дополнительное соглашение к трудовому договору {{{td_number}}} о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Условия перевода</div>
  <p class="mb-4 text-justify">1.1. С «{{{transfer_date}}}» Работник переводится на должность <strong>{{{new_position}}}</strong> в {{{new_department}}}.</p>
  <p class="mb-4 text-justify">1.2. Работнику устанавливается должностной оклад в размере {{{new_salary}}} руб. в месяц.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Остальные условия трудового договора {{{td_number}}} остаются неизменными.</p>
  <p class="mb-4 text-justify">2.2. Настоящее соглашение является неотъемлемой частью трудового договора (ст. 72.1 ТК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Работодатель:</div>
      <p class="mb-1">{{{employer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Работник:</div>
      <p class="mb-1"><strong>{{{employee_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "supply-spare-parts",
    name: "Договор поставки запасных частей",
    category: "business",
    actSource: "ст. 506-524 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поставки автозапчастей и комплектующих для техники и автомобилей.",
    suggestedDocs: ["Договор поставки товара", "Спецификация", "ТОРГ-12", "Акт приёма-передачи товара"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "parts_name", label: "Наименование запчастей", type: "text", defaultValue: "", category: "items" },
      { id: "parts_qty", label: "Количество (шт.)", type: "number", defaultValue: "", category: "items" },
      { id: "supply_price", label: "Цена партии (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "supply_period", label: "Срок поставки (дней)", type: "number", defaultValue: "", category: "contract" },
      { id: "supply_conditions", label: "Условия оплаты", type: "select", defaultValue: "предоплата 100%", options: ["предоплата 100%", "отсрочка платежа 30 дней", "по факту поставки"], category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поставки запасных частей</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_org}}}</strong>, именуемое в дальнейшем «Поставщик», и <strong>{{{buyer_org}}}</strong>, именуемое в дальнейшем «Покупатель», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Поставщик обязуется передать Покупателю запасные части: <strong>{{{parts_name}}}</strong> в количестве {{{parts_qty}}} шт. (далее — Товар).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена Товара составляет {{{supply_price}}} руб. Условия оплаты: {{{supply_conditions}}}.</p>
  <p class="mb-4 text-justify">2.2. НДС не облагается (ст. 346.11 НК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок и порядок поставки</div>
  <p class="mb-4 text-justify">3.1. Поставка осуществляется в течение {{{supply_period}}} рабочих дней с момента получения предоплаты (ст. 506 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "supply-b2b",
    name: "Договор поставки между ООО",
    category: "business",
    actSource: "ст. 506-524 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поставки товара между двумя юридическими лицами (ООО) с учётом НДС.",
    suggestedDocs: ["Договор поставки товара", "Спецификация", "ТОРГ-12"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "supplier_inn", label: "ИНН поставщика", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "buyer_inn", label: "ИНН покупателя", type: "text", defaultValue: "", category: "buyer" },
      { id: "goods_name", label: "Наименование товара", type: "text", defaultValue: "", category: "items" },
      { id: "goods_qty", label: "Количество", type: "number", defaultValue: "", category: "items" },
      { id: "goods_price", label: "Цена (руб., без НДС)", type: "number", defaultValue: "", category: "payment" },
      { id: "payment_deadline", label: "Срок оплаты (дней с отгрузки)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поставки</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_org}}}</strong> (ИНН {{{supplier_inn}}}), именуемое в дальнейшем «Поставщик», и <strong>{{{buyer_org}}}</strong> (ИНН {{{buyer_inn}}}), именуемое в дальнейшем «Покупатель», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Поставщик обязуется поставить, а Покупатель — принять и оплатить товар: <strong>{{{goods_name}}}</strong> в количестве {{{goods_qty}}} ед.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена единицы товара — {{{goods_price}}} руб. без НДС. Стоимость партии определяется спецификацией.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в течение {{{payment_deadline}}} календарных дней с момента отгрузки товара.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Качество и гарантии</div>
  <p class="mb-4 text-justify">3.1. Товар должен соответствовать ГОСТ и техническим условиям. Гарантия качества — 12 месяцев с момента поставки.</p>
  <p class="mb-4 text-justify">3.2. Споры разрешаются в Арбитражном суде по месту нахождения ответчика (ст. 506 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "supply-products",
    name: "Договор поставки продукции",
    category: "business",
    actSource: "ст. 506-524 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор поставки партий продукции с ежемесячными отгрузками по заявкам покупателя.",
    suggestedDocs: ["Договор поставки товара", "Спецификация", "ТОРГ-12"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "product_name", label: "Наименование продукции", type: "text", defaultValue: "", category: "items" },
      { id: "monthly_qty", label: "Ежемесячный объём (тонн)", type: "number", defaultValue: "", category: "items" },
      { id: "unit_price", label: "Цена за тонну (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "contract_term", label: "Срок действия (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "delivery_type", label: "Тип доставки", type: "select", defaultValue: "самовывоз", options: ["самовывоз", "доставка поставщиком"], category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поставки продукции</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_org}}}</strong>, именуемое в дальнейшем «Поставщик», и <strong>{{{buyer_org}}}</strong>, именуемое в дальнейшем «Покупатель», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Поставщик обязуется поставлять продукцию: <strong>{{{product_name}}}</strong> ежемесячно в объёме {{{monthly_qty}}} тонн, а Покупатель — принимать и оплачивать её.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и расчёты</div>
  <p class="mb-4 text-justify">2.1. Цена за единицу — {{{unit_price}}} руб. за тонну, включает НДС.</p>
  <p class="mb-4 text-justify">2.2. Оплата — 100% предоплата за партию в течение 3 банковских дней.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок поставки</div>
  <p class="mb-4 text-justify">3.1. Поставка: {{{delivery_type}}}. Отгрузка производится на основании заявки Покупателя.</p>
  <p class="mb-4 text-justify">3.2. Договор действует {{{contract_term}}} месяцев с даты подписания (ст. 506 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "services-b2b",
    name: "Договор оказания услуг между юридическими лицами",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор оказания услуг между двумя организациями с актом сдачи-приёмки.",
    suggestedDocs: ["Договор оказания услуг", "Акт оказанных услуг"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "executor_org", label: "Исполнитель", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_org", label: "Заказчик", type: "text", defaultValue: "", category: "customer" },
      { id: "service_name", label: "Наименование услуг", type: "text", defaultValue: "", category: "contract" },
      { id: "service_scope", label: "Объём услуг", type: "textarea", defaultValue: "", category: "contract" },
      { id: "service_price", label: "Стоимость (руб./мес.)", type: "number", defaultValue: "", category: "payment" },
      { id: "service_period", label: "Срок оказания (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "pay_order", label: "Порядок оплаты", type: "select", defaultValue: "ежемесячно по акту", options: ["ежемесячно по акту", "по предоплате", "по окончании"], category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_org}}}</strong>, именуемое в дальнейшем «Исполнитель», и <strong>{{{customer_org}}}</strong>, именуемое в дальнейшем «Заказчик», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказать услуги: <strong>{{{service_name}}}</strong>, а именно: {{{service_scope}}}, а Заказчик — принять и оплатить их.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг — {{{service_price}}} руб. в месяц, порядок оплаты: {{{pay_order}}}.</p>
  <p class="mb-4 text-justify">2.2. Услуги считаются оказанными после подписания акта сдачи-приёмки (ст. 779 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Договор действует {{{service_period}}} месяцев и может быть продлён.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1">{{{executor_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1">{{{customer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "commission-sale",
    name: "Договор комиссии на реализацию товара",
    category: "business",
    actSource: "ст. 990-1004 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор комиссии, по которому комиссионер обязуется продать товар комитента за вознаграждение.",
    suggestedDocs: ["Договор комиссии", "Агентский договор", "Отчёт комиссионера"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "committent_org", label: "Комитент", type: "text", defaultValue: "", category: "principal" },
      { id: "commissioner_org", label: "Комиссионер", type: "text", defaultValue: "", category: "agent" },
      { id: "goods_name", label: "Наименование товара", type: "text", defaultValue: "", category: "items" },
      { id: "min_price", label: "Минимальная цена продажи (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "commission_pct", label: "Вознаграждение (% от продажи)", type: "number", defaultValue: "", category: "payment" },
      { id: "realization_period", label: "Срок реализации (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "report_order", label: "Отчётность", type: "select", defaultValue: "ежемесячный отчёт", options: ["ежемесячный отчёт", "отчёт после каждой продажи"], category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор комиссии на реализацию товара</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{committent_org}}}</strong>, именуемое в дальнейшем «Комитент», и <strong>{{{commissioner_org}}}</strong>, именуемое в дальнейшем «Комиссионер», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Комиссионер обязуется от своего имени, но за счёт Комитента реализовать товар: <strong>{{{goods_name}}}</strong> по цене не ниже {{{min_price}}} руб. за единицу.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">2.1. Вознаграждение Комиссионера составляет {{{commission_pct}}}% от суммы каждой продажи.</p>
  <p class="mb-4 text-justify">2.2. Отчётность: {{{report_order}}} (ст. 999 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Договор действует {{{realization_period}}} месяцев (ст. 990 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Комитент:</div>
      <p class="mb-1">{{{committent_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Комиссионер:</div>
      <p class="mb-1">{{{commissioner_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "agent-goods-sale",
    name: "Агентский договор на продажу товара",
    category: "business",
    actSource: "ст. 1005-1011 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Агентский договор, по которому агент обязуется найти покупателей и продать товар принципала.",
    suggestedDocs: ["Агентский договор", "Договор комиссии", "Отчёт агента"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "principal_org", label: "Принципал", type: "text", defaultValue: "", category: "principal" },
      { id: "agent_org", label: "Агент", type: "text", defaultValue: "", category: "agent" },
      { id: "goods_name", label: "Наименование товара", type: "text", defaultValue: "", category: "items" },
      { id: "goods_volume", label: "Объём реализации (руб./мес.)", type: "number", defaultValue: "", category: "payment" },
      { id: "agent_reward", label: "Вознаграждение (% от оборота)", type: "number", defaultValue: "", category: "payment" },
      { id: "agent_period", label: "Срок договора (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "territory", label: "Территория действия", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Агентский договор на продажу товара</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{principal_org}}}</strong>, именуемое в дальнейшем «Принципал», и <strong>{{{agent_org}}}</strong>, именуемое в дальнейшем «Агент», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Агент обязуется от имени и за счёт Принципала осуществлять продажу товара: <strong>{{{goods_name}}}</strong> на территории: {{{territory}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">2.1. Плановый объём реализации — {{{goods_volume}}} руб. в месяц. Вознаграждение Агента — {{{agent_reward}}}% от суммы продаж.</p>
  <p class="mb-4 text-justify">2.2. Агент предоставляет отчёт Принципалу ежемесячно (ст. 1008 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Договор действует {{{agent_period}}} месяцев (ст. 1005 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Принципал:</div>
      <p class="mb-1">{{{principal_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Агент:</div>
      <p class="mb-1">{{{agent_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "public-offer",
    name: "Публичная оферта",
    category: "business",
    actSource: "ст. 435, 437, 494 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Публичная оферта о заключении договора на оказание услуг с неопределённым кругом лиц.",
    suggestedDocs: ["Политика конфиденциальности", "Договор оказания услуг"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "offerer_org", label: "Исполнитель (компания)", type: "text", defaultValue: "", category: "executor" },
      { id: "offer_site", label: "Сайт/сервис", type: "text", defaultValue: "", category: "contract" },
      { id: "offer_services", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "contract" },
      { id: "offer_price", label: "Стоимость услуг (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "pay_method", label: "Способы оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "accepted_order", label: "Момент акцепта", type: "select", defaultValue: "оплата услуг", options: ["оплата услуг", "регистрация на сайте", "заключение договора"], category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Публичная оферта</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{offerer_org}}}</strong>, именуемый в дальнейшем «Исполнитель», настоящей публичной офертой (ст. 437 ГК РФ) предлагает любому физическому лицу заключить договор на оказание услуг: {{{offer_services}}}, размещённых на сайте {{{offer_site}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">1.1. Акцептом оферты признаётся {{{accepted_order}}}. Договор считается заключённым с момента акцепта.</p>
  <p class="mb-4 text-justify">1.2. Оферта является бессрочной и действует до отмены Исполнителем.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и оплата</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг — {{{offer_price}}} руб. Способы оплаты: {{{pay_method}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Заключительные положения</div>
  <p class="mb-4 text-justify">3.1. Все споры разрешаются в порядке, установленном законодательством РФ.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
    <p class="mb-1">{{{offerer_org}}}</p>
    <p class="text-zinc-500 text-[11px]">подпись</p>
  </div>

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
</div>`,
  },
{
    id: "charter-llc",
    name: "Устав ООО",
    category: "business",
    actSource: "ст. 12, 52 ГК РФ, ФЗ-14 «Об ООО»",
    lastUpdated: "Август 2026",
    description: "Устав общества с ограниченной ответственностью (типовой шаблон).",
    suggestedDocs: ["Решение единственного участника", "Протокол собрания ООО", "Корпоративный договор"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "company_name", label: "Полное наименование", type: "text", defaultValue: "", category: "business" },
      { id: "company_short", label: "Краткое наименование", type: "text", defaultValue: "", category: "business" },
      { id: "company_address", label: "Юридический адрес", type: "text", defaultValue: "", category: "business" },
      { id: "authorized_capital", label: "Уставный капитал (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "founder_fio", label: "Участник (ФИО)", type: "text", defaultValue: "", category: "business" },
      { id: "director_fio", label: "Генеральный директор (ФИО)", type: "text", defaultValue: "", category: "business" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">УСТАВ</div>
  <p class="text-center mb-1 font-semibold">{{{company_name}}}</p>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">1.1. {{{company_name}}} (далее — Общество), создано в соответствии с ГК РФ и ФЗ-14 «Об ООО».</p>
  <p class="mb-4 text-justify">1.2. Место нахождения Общества: {{{company_address}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Уставный капитал</div>
  <p class="mb-4 text-justify">2.1. Уставный капитал Общества составляет {{{authorized_capital}}} руб. Участник: {{{founder_fio}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Органы управления</div>
  <p class="mb-4 text-justify">3.1. Высший орган — Общее собрание участников. Единоличный исполнительный орган — Генеральный директор {{{director_fio}}} (ст. 40 ФЗ-14).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Заключительные положения</div>
  <p class="mb-4 text-justify">4.1. Изменения в Устав вносятся по решению Общего собрания с государственной регистрацией (ст. 12 ФЗ-14).</p>
</div>`,
  },
{
    id: "corporate-agreement",
    name: "Корпоративный договор",
    category: "business",
    actSource: "ст. 67.2 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Корпоративный договор участников ООО о порядке осуществления корпоративных прав.",
    suggestedDocs: ["Устав ООО", "Протокол собрания ООО"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "company_name", label: "Общество", type: "text", defaultValue: "", category: "business" },
      { id: "member1_fio", label: "Участник 1 (ФИО)", type: "text", defaultValue: "", category: "business" },
      { id: "member1_share", label: "Доля участника 1 (%)", type: "number", defaultValue: "", category: "business" },
      { id: "member2_fio", label: "Участник 2 (ФИО)", type: "text", defaultValue: "", category: "business" },
      { id: "member2_share", label: "Доля участника 2 (%)", type: "number", defaultValue: "", category: "business" },
      { id: "vote_order", label: "Порядок голосования", type: "select", defaultValue: "единогласно", options: ["единогласно", "по долям"], category: "business" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Корпоративный договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Участники {{{company_name}}}: <strong>{{{member1_fio}}}</strong> (доля {{{member1_share}}}%) и <strong>{{{member2_fio}}}</strong> (доля {{{member2_share}}}%), заключили настоящий корпоративный договор (ст. 67.2 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет</div>
  <p class="mb-4 text-justify">1.1. Участники обязуются осуществлять корпоративные права в порядке, установленном настоящим договором.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Голосование</div>
  <p class="mb-4 text-justify">2.1. Решения на Общем собрании принимаются: {{{vote_order}}}.</p>
  <p class="mb-4 text-justify">2.2. Отчуждение долей — по преимущественному праву покупки других участников.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. Нарушение договора влечёт возмещение убытков по ст. 67.2 ГК РФ.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Участник 1:</div>
      <p class="mb-1"><strong>{{{member1_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Участник 2:</div>
      <p class="mb-1"><strong>{{{member2_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "sole-member-decision",
    name: "Решение единственного участника ООО",
    category: "business",
    actSource: "ст. 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Август 2026",
    description: "Решение единственного участника ООО (универсальное: утверждение результатов, распределение прибыли, назначение директора).",
    suggestedDocs: ["Устав ООО", "Протокол собрания ООО"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "company_name", label: "Общество", type: "text", defaultValue: "", category: "business" },
      { id: "member_fio", label: "Единственный участник", type: "text", defaultValue: "", category: "business" },
      { id: "decision_subject", label: "Повестка решения", type: "select", defaultValue: "утверждение годовых результатов и распределение прибыли", options: ["утверждение годовых результатов и распределение прибыли", "назначение генерального директора", "увеличение уставного капитала", "утверждение Устава в новой редакции"], category: "business" },
      { id: "director_fio", label: "Генеральный директор (ФИО)", type: "text", defaultValue: "", category: "business" },
      { id: "profit_amount", label: "Сумма прибыли к распределению (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Решение единственного участника</div>
  <p class="text-center mb-4 font-semibold">{{{company_name}}}</p>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">Единственный участник {{{company_name}}} <strong>{{{member_fio}}}</strong> (ст. 39 ФЗ-14 «Об ООО»):</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Постановил:</div>
  <p class="mb-4 text-justify">1. {{{decision_subject}}}.</p>
  <p class="mb-4 text-justify">2. Распределить чистую прибыль Общества за отчётный период в сумме {{{profit_amount}}} руб. пропорционально долям участников.</p>
  <p class="mb-4 text-justify">3. Продлить полномочия Генерального директора {{{director_fio}}}.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Единственный участник: <strong>{{{member_fio}}}</strong></p>
    <p class="text-zinc-500 text-[11px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "llc-meeting-minutes",
    name: "Протокол общего собрания участников ООО",
    category: "business",
    actSource: "ст. 37, 39 ФЗ-14 «Об ООО»",
    lastUpdated: "Август 2026",
    description: "Протокол общего собрания участников ООО (универсальный: утверждение результатов, назначение директора, одобрение сделок).",
    suggestedDocs: ["Устав ООО", "Решение единственного участника"],
    fields: [
      { id: "company_name", label: "Общество", type: "text", defaultValue: "", category: "business" },
      { id: "members_list", label: "Список участников", type: "textarea", defaultValue: "", category: "business" },
      { id: "chairman_fio", label: "Председатель собрания", type: "text", defaultValue: "", category: "business" },
      { id: "secretary_fio", label: "Секретарь собрания", type: "text", defaultValue: "", category: "business" },
      { id: "agenda", label: "Повестка дня", type: "textarea", defaultValue: "", category: "business" },
      { id: "profit_amount", label: "Прибыль к распределению (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "director_fio", label: "Генеральный директор (ФИО)", type: "text", defaultValue: "", category: "business" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Протокол общего собрания участников</div>
  <p class="text-center mb-4 font-semibold">{{{company_name}}}</p>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Состав участников</div>
  <p class="mb-4 text-justify">1.1. Присутствовали участники: {{{members_list}}}. Председатель — {{{chairman_fio}}}, секретарь — {{{secretary_fio}}} (ст. 37 ФЗ-14).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Повестка дня</div>
  <p class="mb-4 text-justify">2.1. {{{agenda}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Принятые решения</div>
  <p class="mb-4 text-justify">3.1. Утвердить годовые результаты деятельности Общества.</p>
  <p class="mb-4 text-justify">3.2. Распределить чистую прибыль в сумме {{{profit_amount}}} руб. пропорционально долям.</p>
  <p class="mb-4 text-justify">3.3. Продлить полномочия Генерального директора {{{director_fio}}} на следующий срок.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Председатель: <strong>{{{chairman_fio}}}</strong></p>
    <p class="mb-1">Секретарь: <strong>{{{secretary_fio}}}</strong></p>
  </div>
</div>`,
  },
{
    id: "ip-assignment",
    name: "Договор об отчуждении исключительного права",
    category: "business",
    actSource: "ст. 1234, 1285, 1388 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор о передаче исключительного права на произведение или иной результат интеллектуальной деятельности.",
    suggestedDocs: ["Лицензионный договор", "Договор авторского заказа"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "rightsholder_fio", label: "Правообладатель", type: "text", defaultValue: "", category: "executor" },
      { id: "acquirer_org", label: "Приобретатель", type: "text", defaultValue: "", category: "customer" },
      { id: "ip_object", label: "Результат ИД (произведение)", type: "text", defaultValue: "", category: "contract" },
      { id: "ip_price", label: "Цена отчуждения (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "ip_territory", label: "Территория действия", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор об отчуждении исключительного права</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{rightsholder_fio}}}</strong>, именуемый в дальнейшем «Правообладатель», и <strong>{{{acquirer_org}}}</strong>, именуемое в дальнейшем «Приобретатель», заключили настоящий договор (ст. 1234 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Правообладатель передаёт Приобретателю в полном объёме исключительное право на результат интеллектуальной деятельности: <strong>{{{ip_object}}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена</div>
  <p class="mb-4 text-justify">2.1. Цена отчуждения составляет {{{ip_price}}} руб. и уплачивается единовременно.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Действие договора</div>
  <p class="mb-4 text-justify">3.1. Договор действует на {{{ip_territory}}} (ст. 1234 ГК РФ).</p>
  <p class="mb-4 text-justify">3.2. Права переходят с момента государственной регистрации, если объект подлежит регистрации.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Правообладатель:</div>
      <p class="mb-1"><strong>{{{rightsholder_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Приобретатель:</div>
      <p class="mb-1">{{{acquirer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "sublicense",
    name: "Сублицензионный договор",
    category: "business",
    actSource: "ст. 1238 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор о предоставлении права использования РИД в пределах лицензии, полученной лицензиатом.",
    suggestedDocs: ["Лицензионный договор", "Договор об отчуждении исключительного права"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "sublicensor_org", label: "Лицензиат (сублицензиар)", type: "text", defaultValue: "", category: "executor" },
      { id: "sublicensee_org", label: "Сублицензиат", type: "text", defaultValue: "", category: "customer" },
      { id: "ip_object", label: "Результат ИД", type: "text", defaultValue: "", category: "contract" },
      { id: "use_scope", label: "Способы использования", type: "textarea", defaultValue: "", category: "contract" },
      { id: "license_price", label: "Вознаграждение (руб./год)", type: "number", defaultValue: "", category: "payment" },
      { id: "license_period", label: "Срок (мес.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Сублицензионный договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{sublicensor_org}}}</strong>, именуемое в дальнейшем «Лицензиат», и <strong>{{{sublicensee_org}}}</strong>, именуемое в дальнейшем «Сублицензиат», заключили настоящий договор (ст. 1238 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Лицензиат предоставляет Сублицензиату право использования результата интеллектуальной деятельности: <strong>{{{ip_object}}}</strong> способами: {{{use_scope}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Вознаграждение</div>
  <p class="mb-4 text-justify">2.1. Вознаграждение составляет {{{license_price}}} руб. в год.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Срок действия</div>
  <p class="mb-4 text-justify">3.1. Договор действует {{{license_period}}} месяцев и не может превышать срок действия лицензионного договора (ст. 1238 ГК РФ).</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Лицензиат:</div>
      <p class="mb-1">{{{sublicensor_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Сублицензиат:</div>
      <p class="mb-1">{{{sublicensee_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "specification-supply",
    name: "Спецификация к договору поставки",
    category: "business",
    actSource: "ст. 506 ГК РФ (приложение к договору)",
    lastUpdated: "Август 2026",
    description: "Спецификация (приложение к договору поставки) с перечнем товара, количеством, ценой и сроками.",
    suggestedDocs: ["Договор поставки товара", "ТОРГ-12"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "supply_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "", category: "contract" },
      { id: "item1", label: "Позиция 1", type: "text", defaultValue: "", category: "items" },
      { id: "item2", label: "Позиция 2", type: "text", defaultValue: "", category: "items" },
      { id: "spec_total", label: "Итого (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "delivery_period", label: "Срок поставки", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Спецификация № 1</div>
  <p class="text-center mb-4 font-semibold">к договору поставки {{{supply_contract}}}</p>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">Поставщик: <strong>{{{supplier_org}}}</strong>. Покупатель: <strong>{{{buyer_org}}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Перечень товара</div>
  <p class="mb-2 text-justify">1. {{{item1}}}</p>
  <p class="mb-2 text-justify">2. {{{item2}}}</p>
  <p class="mb-4 text-justify">Итого по спецификации: <strong>{{{spec_total}}} руб.</strong></p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Условия</div>
  <p class="mb-4 text-justify">Срок поставки: {{{delivery_period}}}. Спецификация является неотъемлемой частью договора (ст. 506 ГК РФ).</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "torg-12",
    name: "ТОРГ-12 (товарная накладная)",
    category: "business",
    actSource: "Постановление Госкомстата РФ № 132 от 25.12.1998",
    lastUpdated: "Август 2026",
    description: "Товарная накладная по унифицированной форме ТОРГ-12 для учёта операций по продаже товарно-материальных ценностей.",
    suggestedDocs: ["Договор поставки товара", "Спецификация", "Акт приёма-передачи товара"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "goods_line", label: "Товар", type: "text", defaultValue: "", category: "items" },
      { id: "torg_total", label: "Сумма с НДС (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "supply_contract", label: "Основание (договор)", type: "text", defaultValue: "", category: "contract" },
      { id: "torg_number", label: "Номер накладной", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Товарная накладная</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div class="uppercase font-bold">ТОРГ-12 {{{torg_number}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">Поставщик: <strong>{{{supplier_org}}}</strong>. Покупатель: <strong>{{{buyer_org}}}</strong>.</p>
  <p class="mb-4 text-justify">Основание: {{{supply_contract}}}.</p>
  <table class="w-full text-xs mb-4 border-collapse">
    <thead><tr class="border-b border-zinc-400"><th class="text-left py-1">Наименование</th><th class="text-left py-1">Кол-во</th><th class="text-left py-1">Цена</th><th class="text-left py-1">Сумма</th></tr></thead>
    <tbody><tr class="border-b border-zinc-300"><td class="py-1">{{{goods_line}}}</td><td class="py-1">—</td><td class="py-1">—</td><td class="py-1">{{{torg_total}}} руб.</td></tr></tbody>
  </table>
  <p class="mb-4 text-justify">Всего на сумму: {{{torg_total}}} руб. с НДС. Отпуск груза произвёл: {{{supplier_org}}}. Груз принял: {{{buyer_org}}}.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Отпустил:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Принял:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "goods-acceptance-act",
    name: "Акт приёма-передачи товара (к договору поставки)",
    category: "business",
    actSource: "ст. 506, 513 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Акт приёма-передачи товара как приложение к договору поставки.",
    suggestedDocs: ["Договор поставки товара", "ТОРГ-12"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "goods_list", label: "Передаваемый товар", type: "textarea", defaultValue: "", category: "items" },
      { id: "supply_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "", category: "contract" },
      { id: "acceptance_result", label: "Результат приёмки", type: "select", defaultValue: "товар принят без замечаний", options: ["товар принят без замечаний", "товар принят с замечаниями", "выявлены недостатки"], category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Акт приёма-передачи товара</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">к договору поставки {{{supply_contract}}}. Поставщик: <strong>{{{supplier_org}}}</strong>, Покупатель: <strong>{{{buyer_org}}}</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Передано</div>
  <p class="mb-4 text-justify">{{{goods_list}}}</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">Результат приёмки</div>
  <p class="mb-4 text-justify">{{{acceptance_result}}} (ст. 513 ГК РФ).</p>
  <p class="mb-4 text-justify">Претензий к качеству и комплектности не имеется, либо замечания указаны в приложении к акту.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Передал (Поставщик):</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Принял (Покупатель):</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "ds-purchase",
    name: "Допсоглашение к договору купли-продажи",
    category: "business",
    actSource: "ст. 450 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Дополнительное соглашение к договору купли-продажи (изменение цены, сроков, условий).",
    suggestedDocs: ["Договор купли-продажи товара", "Дополнительное соглашение (универсальное)"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "seller_org", label: "Продавец", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "base_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "", category: "contract" },
      { id: "change_subject", label: "Что изменяется", type: "textarea", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    к договору купли-продажи {{{base_contract}}}. Продавец: <strong>{{{seller_org}}}</strong>, Покупатель: <strong>{{{buyer_org}}}</strong>, заключили настоящее соглашение:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения</div>
  <p class="mb-4 text-justify">1.1. Внести в договор {{{base_contract}}} следующие изменения: {{{change_subject}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Остальные условия договора остаются неизменными (ст. 450 ГК РФ).</p>
  <p class="mb-4 text-justify">2.2. Настоящее соглашение является неотъемлемой частью договора.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Продавец:</div>
      <p class="mb-1">{{{seller_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "ds-services",
    name: "Допсоглашение к договору оказания услуг",
    category: "business",
    actSource: "ст. 450 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Дополнительное соглашение к договору оказания услуг (изменение объёма, стоимости, сроков).",
    suggestedDocs: ["Договор оказания услуг", "Акт оказанных услуг"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "executor_org", label: "Исполнитель", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_org", label: "Заказчик", type: "text", defaultValue: "", category: "customer" },
      { id: "services_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "", category: "contract" },
      { id: "new_scope", label: "Новый объём услуг", type: "textarea", defaultValue: "", category: "contract" },
      { id: "new_price", label: "Новая стоимость (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дополнительное соглашение</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    к договору оказания услуг {{{services_contract}}}. Исполнитель: <strong>{{{executor_org}}}</strong>, Заказчик: <strong>{{{customer_org}}}</strong>, заключили настоящее соглашение:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Изменения</div>
  <p class="mb-4 text-justify">1.1. Расширить объём услуг по договору: {{{new_scope}}}.</p>
  <p class="mb-4 text-justify">1.2. Стоимость услуг составляет {{{new_price}}} руб. (ст. 450 ГК РФ).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Остальные условия договора остаются неизменными.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1">{{{executor_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1">{{{customer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "terminate-supply",
    name: "Соглашение о расторжении договора поставки",
    category: "business",
    actSource: "ст. 450, 452 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о расторжении договора поставки по соглашению сторон.",
    suggestedDocs: ["Договор поставки товара", "Уведомление об отказе от договора"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract" },      { id: "supplier_org", label: "Поставщик", type: "text", defaultValue: "", category: "seller" },
      { id: "buyer_org", label: "Покупатель", type: "text", defaultValue: "", category: "buyer" },
      { id: "supply_contract", label: "Договор (номер, дата)", type: "text", defaultValue: "", category: "contract" },
      { id: "termination_date", label: "Дата расторжения", type: "date", defaultValue: "", category: "contract" },
      { id: "settlement_note", label: "Взаиморасчёты", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о расторжении договора поставки</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Поставщик: <strong>{{{supplier_org}}}</strong>, Покупатель: <strong>{{{buyer_org}}}</strong>, заключили настоящее соглашение о расторжении договора поставки {{{supply_contract}}} (ст. 450, 452 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Расторжение</div>
  <p class="mb-4 text-justify">1.1. Договор поставки {{{supply_contract}}} расторгается с «{{{termination_date}}}».</p>
  <p class="mb-4 text-justify">1.2. {{{settlement_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Заключительные положения</div>
  <p class="mb-4 text-justify">2.1. Стороны не имеют друг к другу претензий, вытекающих из договора.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1">{{{supplier_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Покупатель:</div>
      <p class="mb-1">{{{buyer_org}}}</p>
      <p class="text-zinc-500 text-[11px]">М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "legal-services-contract",
    name: "Договор на оказание юридических услуг",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с юристом/юридической компанией: консультации, подготовка документов, представительство в суде. Обязателен детальный перечень услуг (ст. 779 ГК РФ).",
    suggestedDocs: ["act-services", "invoice", "power-of-attorney-docs"],
    printInstruction: "Печать на листе А4; для представительства в суде дополнительно оформляется доверенность (ст. 53 ГПК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_fio", label: "Исполнитель (юрист/компания)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_fio", label: "Заказчик (ФИО)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", rows: 3, validation: { required: true } },
      { id: "service_price", label: "Стоимость услуг (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "start_date", label: "Начало оказания", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Окончание оказания", type: "date", defaultValue: "", category: "contract" },
      { id: "confidentiality", label: "Конфиденциальность", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание юридических услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_fio}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, действующего на основании Устава,
    именуемый «Исполнитель», с одной стороны, и <strong>{{{customer_fio}}}</strong> (паспорт: {{{customer_passport}}}),
    именуемый «Заказчик», с другой стороны, заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказать Заказчику юридические услуги: {{{services_list}}}, а Заказчик обязуется оплатить их.</p>
  <p class="mb-3 text-justify">1.2. Для представительства в суде Заказчик оформляет доверенность на представителя (ст. 53 ГПК РФ).</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг составляет <strong>{{{service_price}}}</strong> руб. ({{{service_price_words}}}). Оплата: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Сроки</p>
  <p class="mb-3 text-justify">3.1. Услуги оказываются в период с «{{{start_date}}}» по «{{{end_date}}}». Услуги считаются оказанными после подписания акта.</p>
  <p class="font-bold mb-2">4. Обязанности и ответственность</p>
  <p class="mb-3 text-justify">4.1. Заказчик обязан предоставить документы и сведения, необходимые для оказания услуг, и оплатить их в установленном порядке.</p>
  <p class="mb-3 text-justify">4.2. Исполнитель несёт ответственность за качество оказанных услуг в пределах их стоимости. Сведения, полученные при исполнении договора: {{{confidentiality}}}.</p>
  <p class="mb-3 text-justify">4.3. За просрочку оплаты Заказчик уплачивает неустойку 0,1% от суммы задолженности за каждый день просрочки (ст. 330 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_fio}}}</p>
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
    id: "accounting-services",
    name: "Договор на бухгалтерское обслуживание",
    category: "business",
    actSource: "ст. 779-783 ГК РФ, ФЗ-402 «О бухучёте»",
    lastUpdated: "Август 2026",
    description: "Договор на бухгалтерский аутсорсинг: ведение учёта, налоговые декларации, отчётность. Ответственность исполнителя ограничивается размером годовой оплаты.",
    suggestedDocs: ["act-services", "invoice", "agreement-confidentiality"],
    printInstruction: "Печать на листе А4; приложением к договору оформляется перечень передаваемых документов и график отчётности",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (компания)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик (компания)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "customer_director", label: "Руководитель заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "tax_system", label: "Система налогообложения", type: "select", defaultValue: "УСН 6%", category: "other", options: [
        { label: "УСН 6%", value: "УСН 6%" },
        { label: "УСН 15%", value: "УСН 15%" },
        { label: "ОСНО", value: "ОСНО" },
      ] },
      { id: "monthly_fee", label: "Ежемесячная оплата (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "term", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Начало обслуживания", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на бухгалтерское обслуживание</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, действующего на основании Устава,
    именуемый «Исполнитель», с одной стороны, и <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}),
    в лице {{{customer_director}}}, именуемый «Заказчик», с другой стороны, заключили настоящий договор (ст. 779 ГК РФ, п. 3 ст. 7 ФЗ-402):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказывать услуги по бухгалтерскому и налоговому сопровождению: {{{services_list}}}. Система налогообложения: {{{tax_system}}}.</p>
  <p class="mb-3 text-justify">1.2. Перечень передаваемых документов и график отчётности оформляются приложением к настоящему договору.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Ежемесячная оплата составляет <strong>{{{monthly_fee}}} руб.</strong> ({{{monthly_fee_words}}}). Оплата: {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Срок действия</p>
  <p class="mb-3 text-justify">3.1. Договор заключён на срок {{{term}}} с «{{{start_date}}}». Договор автоматически продлевается, если ни одна сторона не заявит о прекращении.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Исполнитель несёт ответственность за убытки, причинённые вследствие ошибок в учёте, в пределах суммы годовой оплаты по договору.</p>
  <p class="mb-3 text-justify">4.2. За просрочку оплаты Заказчик уплачивает неустойку 0,1% за каждый день просрочки. Информация о деятельности Заказчика конфиденциальна.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "cleaning-services",
    name: "Договор на клининговые услуги",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на профессиональную уборку помещений: перечень работ, периодичность, приёмка по чек-листу, ответственность за ущерб.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; перечень помещений и видов уборки оформляется приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (клининговая компания)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "cleaning_area", label: "Объекты уборки", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "work_list", label: "Виды работ", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "frequency", label: "Периодичность", type: "select", defaultValue: "ежедневно (пн-пт)", category: "items", options: [
        { label: "Ежедневно (пн-пт)", value: "ежедневно (пн-пт)" },
        { label: "2-3 раза в неделю", value: "2-3 раза в неделю" },
        { label: "Еженедельно", value: "еженедельно" },
        { label: "Разово", value: "разово" },
      ] },
      { id: "monthly_price", label: "Стоимость (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "inventory_by", label: "Инвентарь и химия за счёт", type: "select", defaultValue: "Исполнителя", category: "items", options: [
        { label: "Исполнителя", value: "Исполнителя" },
        { label: "Заказчика", value: "Заказчика" },
      ] },
      { id: "start_date", label: "Начало оказания", type: "date", defaultValue: "", category: "contract" },
      { id: "term", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на клининговые услуги</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказывать услуги по уборке: {{{work_list}}}, на объектах: {{{cleaning_area}}}. Периодичность: {{{frequency}}}.</p>
  <p class="mb-3 text-justify">1.2. Инвентарь и химические средства предоставляет: {{{inventory_by}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_price}}} руб.</strong> ({{{monthly_price_words}}}) в месяц, оплачивается ежемесячно.</p>
  <p class="font-bold mb-2">3. Порядок приёмки</p>
  <p class="mb-3 text-justify">3.1. Услуги считаются оказанными после подписания акта (чек-листа) уполномоченным представителем Заказчика. Претензии по качеству заявляются в течение 24 часов.</p>
  <p class="font-bold mb-2">4. Срок и ответственность</p>
  <p class="mb-3 text-justify">4.1. Договор заключён на срок {{{term}}} с «{{{start_date}}}».</p>
  <p class="mb-3 text-justify">4.2. Исполнитель несёт ответственность за ущерб имуществу Заказчика, причинённый по вине его персонала; факт ущерба фиксируется актом. Персонал Исполнителя не состоит с Заказчиком в трудовых отношениях.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "security-services",
    name: "Договор охраны объекта (ЧОП)",
    category: "business",
    actSource: "ст. 779-783 ГК РФ, Закон РФ № 2487-1",
    lastUpdated: "Август 2026",
    description: "Договор с частным охранным предприятием: физическая охрана или пультовая охрана (ПЦО), перечень постов, ответственность за сохранность имущества.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; перечень охраняемых объектов и постов оформляется приложением № 1",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (ЧОП)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_license", label: "Лицензия ЧОП", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель ЧОП", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "security_type", label: "Вид охраны", type: "select", defaultValue: "физическая охрана", category: "items", options: [
        { label: "Физическая охрана постов", value: "физическая охрана" },
        { label: "Пультовая охрана (ПЦО)", value: "пультовая охрана (ПЦО)" },
        { label: "Комбинированная", value: "комбинированная охрана" },
      ] },
      { id: "object_list", label: "Охраняемые объекты", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "monthly_price", label: "Стоимость (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "liability_limit", label: "Предел ответственности при хищении (руб.)", type: "text", defaultValue: "", category: "other" },
      { id: "start_date", label: "Начало охраны", type: "date", defaultValue: "", category: "contract" },
      { id: "term", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор охраны объекта</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (лицензия: {{{executor_license}}}), в лице {{{executor_director}}}, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ, Закон РФ № 2487-1):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель оказывает услуги по {{{security_type}}} на объектах: {{{object_list}}} (приложение № 1).</p>
  <p class="mb-3 text-justify">1.2. Исполнитель обязуется обеспечить сохранность материальных ценностей Заказчика и пропускной режим на объекте.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_price}}} руб.</strong> ({{{monthly_price_words}}}) в месяц, оплачивается ежемесячно до 5 числа.</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. При хищении имущества с охраняемого объекта вследствие ненадлежащего исполнения обязанностей Исполнитель возмещает ущерб в пределах {{{liability_limit}}} руб., подтверждённый документами правоохранительных органов.</p>
  <p class="font-bold mb-2">4. Срок действия</p>
  <p class="mb-3 text-justify">4.1. Договор заключён на срок {{{term}}} с «{{{start_date}}}» и считается продлённым, если ни одна сторона не заявит о прекращении за 30 дней.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "advertising-services",
    name: "Договор на рекламные услуги (интернет-реклама)",
    category: "business",
    actSource: "ст. 779-783 ГК РФ, ФЗ-38 «О рекламе»",
    lastUpdated: "Август 2026",
    description: "Договор на размещение интернет-рекламы: площадки, форматы, сроки кампании, отчётность, обязательная маркировка рекламы и передача данных в ЕРИР (ст. 18.1 ФЗ-38).",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; с 01.09.2022 обязательна маркировка интернет-рекламы и передача данных в ЕРИР — в договоре определяется ответственный",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (рекламное агентство)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "campaign_desc", label: "Описание кампании", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "budget", label: "Бюджет размещения (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "agency_fee", label: "Вознаграждение агентства (руб./мес)", type: "text", defaultValue: "", category: "payment" },
      { id: "start_date", label: "Старт кампании", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Окончание кампании", type: "date", defaultValue: "", category: "contract" },
      { id: "marking_by", label: "Ответственный за маркировку рекламы (ЕРИР)", type: "select", defaultValue: "Исполнитель", category: "other", options: [
        { label: "Исполнитель", value: "Исполнитель" },
        { label: "Заказчик", value: "Заказчик" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание рекламных услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ, ФЗ-38 «О рекламе»):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель оказывает услуги по размещению и ведению рекламной кампании: {{{campaign_desc}}}.</p>
  <p class="mb-3 text-justify">1.2. Маркировку интернет-рекламы и передачу данных в ЕРИР обеспечивает: {{{marking_by}}} (ст. 18.1 ФЗ-38).</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Бюджет размещения: <strong>{{{budget}}} руб.</strong> ({{{budget_words}}}) в месяц. Вознаграждение Исполнителя: {{{agency_fee}}} руб. в месяц.</p>
  <p class="mb-3 text-justify">2.2. Оплата производится ежемесячно до 5 числа на основании отчёта о размещении.</p>
  <p class="font-bold mb-2">3. Сроки и отчётность</p>
  <p class="mb-3 text-justify">3.1. Кампания проводится с «{{{start_date}}}» по «{{{end_date}}}». Исполнитель ежемесячно предоставляет статистику и скриншоты размещений.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Исполнитель несёт ответственность за ненадлежащее исполнение обязательств в пределах стоимости услуг за месяц.</p>
  <p class="mb-3 text-justify">4.2. Рекламные материалы подлежат согласованию с Заказчиком. За недостоверность данных, предоставленных Заказчиком, ответственность несёт Заказчик.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "event-organization",
    name: "Договор на организацию мероприятия",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с ивент-агентством: дата, место, программа мероприятия, кейтеринг и техника, аванс и возврат при отмене, форс-мажор.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; программа и смета мероприятия оформляются приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Организатор (агентство)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН организатора", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель организатора", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "event_name", label: "Название мероприятия", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "event_date", label: "Дата и время проведения", type: "text", defaultValue: "", category: "items" },
      { id: "event_place", label: "Место проведения", type: "text", defaultValue: "", category: "items" },
      { id: "guests_count", label: "Количество гостей", type: "text", defaultValue: "", category: "items" },
      { id: "program", label: "Программа мероприятия", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "total_price", label: "Стоимость (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "prepay", label: "Аванс (руб., %) и срок", type: "text", defaultValue: "", category: "payment" },
      { id: "cancel_terms", label: "Условия отмены/переноса", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на организацию мероприятия</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, именуемый «Организатор», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Организатор обязуется организовать и провести мероприятие «{{{event_name}}}» {{{event_date}}} по адресу: {{{event_place}}}, для {{{guests_count}}} гостей.</p>
  <p class="mb-3 text-justify">1.2. Программа и смета мероприятия: {{{program}}} (приложение № 1 к договору).</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг составляет <strong>{{{total_price}}} руб.</strong> ({{{total_price_words}}}). Аванс: {{{prepay}}}. Остаток — не позднее чем за 3 дня до мероприятия.</p>
  <p class="font-bold mb-2">3. Отмена и перенос</p>
  <p class="mb-3 text-justify">3.1. {{{cancel_terms}}}. При отмене мероприятия по инициативе Организатора аванс возвращается в полном объёме.</p>
  <p class="mb-3 text-justify">3.2. Стороны освобождаются от ответственности при форс-мажорных обстоятельствах (пожары, стихийные бедствия, введённые ограничения органов власти).</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Организатор несёт ответственность за качество оказанных услуг. Услуги считаются оказанными после подписания акта.</p>
  
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
      <p class="font-bold mb-1">Организатор:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "medical-services",
    name: "Договор на платные медицинские услуги",
    category: "business",
    actSource: "ст. 779-783 ГК РФ, ПП РФ № 1006, ФЗ-323",
    lastUpdated: "Август 2026",
    description: "Договор с медицинской клиникой: перечень услуг, стоимость, порядок оплаты и возврата, информированное добровольное согласие, реквизиты лицензии.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; к договору прилагается информированное добровольное согласие на медицинское вмешательство (ст. 20 ФЗ-323)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "clinic_name", label: "Медицинская организация", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "clinic_license", label: "Лицензия на медицинскую деятельность", type: "text", defaultValue: "", category: "executor" },
      { id: "clinic_address", label: "Адрес клиники", type: "text", defaultValue: "", category: "executor" },
      { id: "patient_fio", label: "Пациент (ФИО)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "patient_birthday", label: "Дата рождения пациента", type: "date", defaultValue: "", category: "customer" },
      { id: "patient_passport", label: "Паспорт пациента", type: "text", defaultValue: "", category: "customer" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "service_price", label: "Стоимость услуг (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "service_date", label: "Дата оказания", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание платных медицинских услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{clinic_name}}}</strong> (лицензия: {{{clinic_license}}}, адрес: {{{clinic_address}}}), именуемая «Исполнитель», с одной стороны, и
    <strong>{{{patient_fio}}}</strong> (паспорт: {{{patient_passport}}}, дата рождения: {{{patient_birthday}}}),
    именуемый «Пациент», с другой стороны, заключили настоящий договор (ст. 779 ГК РФ, ПП РФ № 1006, ФЗ-323):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказать медицинские услуги: {{{services_list}}}, а Пациент обязуется оплатить их.</p>
  <p class="mb-3 text-justify">1.2. Перед вмешательством Пациент подписывает информированное добровольное согласие (ст. 20 ФЗ-323).</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг составляет <strong>{{{service_price}}} руб.</strong> ({{{service_price_words}}}). {{{payment_order}}}.</p>
  <p class="mb-3 text-justify">2.2. При отказе Пациента от услуг до начала оказания оплата возвращается в полном объёме, после начала — пропорционально неоказанной части (ПП РФ № 1006).</p>
  <p class="font-bold mb-2">3. Права и обязанности</p>
  <p class="mb-3 text-justify">3.1. Услуги оказываются «{{{service_date}}}» по назначению врача. Сведения о состоянии здоровья Пациента составляют врачебную тайну.</p>
  <p class="mb-3 text-justify">3.2. Пациент вправе получить бесплатную медицинскую помощь в рамках программы ОМС, о чём ему разъяснено.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За качество медицинских услуг Исполнитель несёт ответственность в соответствии с законодательством РФ.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{clinic_name}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Пациент:</p>
      <p class="mb-6">{{{patient_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "website-support",
    name: "Договор на разработку и обслуживание сайта",
    category: "business",
    actSource: "ст. 702-729, 1286-1295 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на разработку сайта и его поддержку: этапы работ, исключительные права (ст. 1295 ГК РФ), хостинг и домен, SLA, пролонгация.",
    suggestedDocs: ["act-works", "act-services", "agreement-confidentiality"],
    printInstruction: "Печать на листе А4; техническое задание и SLA (время реакции, аптайм) оформляются приложениями к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "dev_company", label: "Исполнитель (студия)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "dev_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "dev_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "client_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "site_desc", label: "Описание сайта", type: "textarea", defaultValue: "", category: "items", rows: 2, validation: { required: true } },
      { id: "dev_price", label: "Стоимость разработки (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "dev_terms", label: "Срок разработки", type: "text", defaultValue: "", category: "contract" },
      { id: "support_price", label: "Поддержка (руб./мес)", type: "text", defaultValue: "", category: "payment" },
      { id: "support_scope", label: "Объём поддержки (SLA)", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "domain_owner", label: "Владелец домена", type: "select", defaultValue: "Заказчик", category: "other", options: [
        { label: "Заказчик", value: "Заказчик" },
        { label: "Исполнитель (до окончания договора)", value: "Исполнитель" },
      ] },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на разработку и обслуживание сайта</div>
  <p class="mb-4 text-justify">
    <strong>{{{dev_company}}}</strong> (ИНН {{{dev_inn}}}), в лице {{{dev_director}}}, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{client_company}}}</strong> (ИНН {{{client_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 702, 1286 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется разработать сайт: {{{site_desc}}}, и оказывать услуги по его технической поддержке, а Заказчик — принять и оплатить.</p>
  <p class="mb-3 text-justify">1.2. Работы выполняются по техническому заданию (приложение № 1) в срок {{{dev_terms}}} с «{{{start_date}}}».</p>
  <p class="font-bold mb-2">2. Исключительные права</p>
  <p class="mb-3 text-justify">2.1. Исключительное право на созданный сайт и его элементы переходит к Заказчику с момента полной оплаты (ст. 1295 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. Владелец домена: {{{domain_owner}}}.</p>
  <p class="font-bold mb-2">3. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">3.1. Стоимость разработки: <strong>{{{dev_price}}} руб.</strong> ({{{dev_price_words}}}). Оплата: 50% предоплата, 50% — после приёмки по акту.</p>
  <p class="mb-3 text-justify">3.2. Ежемесячная оплата поддержки: {{{support_price}}} руб. Объём поддержки: {{{support_scope}}}.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. При нарушении SLA ({{{support_scope}}}) Исполнитель уплачивает неустойку 0,5% от месячной оплаты за каждый день нарушения.</p>
  <p class="mb-3 text-justify">4.2. Договор действует до полного исполнения обязательств и продлевается на каждый следующий год, если ни одна сторона не заявит о прекращении.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{dev_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{client_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "franchise-agreement",
    name: "Договор франчайзинга (коммерческая концессия)",
    category: "business",
    actSource: "ст. 1027-1040 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор коммерческой концессии: передача товарного знака, ноу-хау и коммерческого опыта, паушальный взнос и роялти, субконцессия, регистрация в Роспатенте.",
    suggestedDocs: ["agreement-confidentiality", "license-contract"],
    printInstruction: "Печать на листе А4; договор подлежит госрегистрации в Роспатенте (ст. 1028 ГК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "franchisor_company", label: "Правообладатель (франчайзер)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "franchisor_tm", label: "Товарный знак", type: "text", defaultValue: "", category: "items" },
      { id: "franchisor_director", label: "Руководитель правообладателя", type: "text", defaultValue: "", category: "executor" },
      { id: "franchisee_company", label: "Пользователь (франчайзи)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "franchisee_inn", label: "ИНН пользователя", type: "text", defaultValue: "", category: "customer" },
      { id: "territory", label: "Территория использования", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "rights_list", label: "Передаваемые права", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "lump_sum", label: "Паушальный взнос (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "royalty", label: "Роялти (% от выручки/мес)", type: "text", defaultValue: "", category: "payment" },
      { id: "term", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата вступления в силу", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор коммерческой концессии (франчайзинга)</div>
  <p class="mb-4 text-justify">
    <strong>{{{franchisor_company}}}</strong> в лице {{{franchisor_director}}}, именуемый «Правообладатель», с одной стороны, и
    <strong>{{{franchisee_company}}}</strong> (ИНН {{{franchisee_inn}}}), именуемый «Пользователь», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 1027-1040 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Правообладатель предоставляет Пользователю право использования в предпринимательской деятельности на территории {{{territory}}} комплекса исключительных прав: {{{rights_list}}} ({{{franchisor_tm}}}).</p>
  <p class="mb-3 text-justify">1.2. Срок использования: {{{term}}} с «{{{start_date}}}».</p>
  <p class="font-bold mb-2">2. Вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Пользователь уплачивает паушальный взнос в размере <strong>{{{lump_sum}}} руб.</strong> ({{{lump_sum_words}}}) при подписании договора и роялти: {{{royalty}}}.</p>
  <p class="font-bold mb-2">3. Обязанности сторон</p>
  <p class="mb-3 text-justify">3.1. Правообладатель обязан передать техническую и коммерческую документацию, оказывать консультационную поддержку, обеспечить регистрацию договора (ст. 1028 ГК РФ).</p>
  <p class="mb-3 text-justify">3.2. Пользователь обязан соблюдать качество товаров/услуг, инструкции и стандарты Правообладателя, не разглашать ноу-хау, не конкурировать на территории.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. Правообладатель несёт субсидиарную ответственность по требованиям к качеству товаров (услуг), продаваемых (оказываемых) Пользователем (ст. 1034 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. Договор подлежит государственной регистрации в Роспатенте; до регистрации договор действует как неотъемлемая часть обязательств сторон.</p>
  
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
      <p class="font-bold mb-1">Правообладатель:</p>
      <p class="mb-6">{{{franchisor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Пользователь:</p>
      <p class="mb-6">{{{franchisee_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "rental-contract",
    name: "Договор проката",
    category: "business",
    actSource: "ст. 626-631 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор проката имущества: публичный договор на срок не более 1 года, арендная плата, обязанность арендодателя проверить исправность при выдаче (ст. 626-631 ГК РФ).",
    suggestedDocs: ["raspiska-money", "act-transfer-auto"],
    printInstruction: "Печать на листе А4; письменная форма обязательна — при её несоблюдении договор недействителен (п. 3 ст. 626 ГК РФ)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "lessor_company", label: "Арендодатель (прокатная организация)", type: "text", defaultValue: "", category: "landlord", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН арендодателя", type: "text", defaultValue: "", category: "landlord" },
      { id: "lessee_fio", label: "Арендатор (ФИО)", type: "text", defaultValue: "", category: "tenant", validation: { required: true } },
      { id: "lessee_passport", label: "Паспорт арендатора", type: "text", defaultValue: "", category: "tenant" },
      { id: "item_desc", label: "Предмет проката", type: "textarea", defaultValue: "", category: "object", rows: 2, validation: { required: true } },
      { id: "item_value", label: "Оценочная стоимость предмета (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "rent_price", label: "Плата за прокат (руб./сутки)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "rent_period", label: "Срок проката", type: "text", defaultValue: "", category: "contract" },
      { id: "start_date", label: "Дата выдачи", type: "date", defaultValue: "", category: "contract" },
      { id: "deposit", label: "Залог (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "penalty", label: "Неустойка за просрочку возврата (руб./день)", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор проката</div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_company}}}</strong> (ИНН {{{lessor_inn}}}), именуемый «Арендодатель», с одной стороны, и
    <strong>{{{lessee_fio}}}</strong> (паспорт: {{{lessee_passport}}}), именуемый «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 626-631 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Арендодатель предоставляет Арендатору во временное владение и пользование: {{{item_desc}}}. Оценочная стоимость: {{{item_value}}} руб.</p>
  <p class="mb-3 text-justify">1.2. Предмет проката выдан в исправном состоянии, что проверено сторонами при передаче (ст. 628 ГК РФ).</p>
  <p class="font-bold mb-2">2. Плата за прокат</p>
  <p class="mb-3 text-justify">2.1. Плата составляет <strong>{{{rent_price}}} руб.</strong> ({{{rent_price_words}}}) за сутки, вносится при получении предмета проката.</p>
  <p class="mb-3 text-justify">2.2. Залог: {{{deposit}}} руб., возвращается при возврате предмета в исправном состоянии.</p>
  <p class="font-bold mb-2">3. Срок проката</p>
  <p class="mb-3 text-justify">3.1. Предмет проката выдаётся «{{{start_date}}}» на срок {{{rent_period}}}. Прокат на срок более 1 года не допускается (ст. 627 ГК РФ).</p>
  <p class="font-bold mb-2">4. Обязанности и ответственность</p>
  <p class="mb-3 text-justify">4.1. Арендатор обязан использовать предмет по назначению, не передавать третьим лицам, при обнаружении недостатков немедленно сообщить Арендодателю (ст. 629-630 ГК РФ).</p>
  <p class="mb-3 text-justify">4.2. За просрочку возврата Арендатор уплачивает {{{penalty}}} руб. за каждый день просрочки; при утрате или повреждении — оценочную стоимость предмета.</p>
  
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
      <p class="mb-6">{{{lessor_company}}}</p>
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
    id: "reconciliation-statement",
    name: "Акт сверки взаимных расчётов",
    category: "business",
    actSource: "ст. 9 ФЗ-402, ст. 203 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Акт сверки взаимных расчётов между контрагентами: таблица операций за период, сальдо на начало и конец, подтверждение долга (подписанный акт прерывает срок исковой давности, ст. 203 ГК РФ).",
    suggestedDocs: ["invoice", "torg-12", "act-services"],
    printInstruction: "Печать на листе А4; таблица сверки оформляется по дебету/кредиту счёта 60/62, подписывается обеими сторонами с печатями",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата акта", type: "date", defaultValue: "", category: "contract" },
      { id: "company1", label: "Организация 1 (инициатор)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "company1_inn", label: "ИНН организации 1", type: "text", defaultValue: "", category: "executor" },
      { id: "company1_director", label: "Руководитель организации 1", type: "text", defaultValue: "", category: "executor" },
      { id: "company2", label: "Организация 2", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "company2_inn", label: "ИНН организации 2", type: "text", defaultValue: "", category: "customer" },
      { id: "company2_director", label: "Руководитель организации 2", type: "text", defaultValue: "", category: "customer" },
      { id: "contract_doc", label: "Договор/основание", type: "text", defaultValue: "", category: "contract" },
      { id: "period_start", label: "Период сверки: начало", type: "date", defaultValue: "", category: "contract" },
      { id: "period_end", label: "Период сверки: конец", type: "date", defaultValue: "", category: "contract" },
      { id: "opening_balance", label: "Сальдо на начало периода (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "operations", label: "Операции за период (дата, № док., описание, сумма)", type: "repeating", defaultValue: "", category: "payment", repeatingFields: [
        { id: "op_date", label: "Дата", type: "text", defaultValue: "01.01.2026", width: "90px" },
        { id: "op_doc", label: "№ документа", type: "text", defaultValue: "", width: "120px" },
        { id: "op_desc", label: "Описание операции", type: "text", defaultValue: "", width: "200px" },
        { id: "op_amount", label: "Сумма", type: "text", defaultValue: "", width: "100px" },
      ] },
      { id: "closing_balance", label: "Сальдо на конец периода (руб.)", type: "text", defaultValue: "", category: "payment" },
      { id: "disagreement", label: "Расхождения", type: "select", defaultValue: "Расхождений нет", category: "other", options: [
        { label: "Расхождений нет", value: "Расхождений нет" },
        { label: "Имеются расхождения", value: "Имеются расхождения" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-4 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-4 text-black uppercase">Акт сверки взаимных расчётов</div>
  <p class="mb-4 text-justify text-xs">Между <strong>{{{company1}}}</strong> (ИНН {{{company1_inn}}}) и <strong>{{{company2}}}</strong> (ИНН {{{company2_inn}}}) по обязательству: {{{contract_doc}}}, за период с {{{period_start}}} по {{{period_end}}}.</p>
  <table class="w-full text-xs mb-4 border-collapse">
    <thead>
      <tr class="font-bold border border-zinc-950">
        <td class="border border-zinc-950 px-2 py-1 w-16">№</td>
        <td class="border border-zinc-950 px-2 py-1 w-20">Дата</td>
        <td class="border border-zinc-950 px-2 py-1 w-32">№ документа</td>
        <td class="border border-zinc-950 px-2 py-1">Описание операции</td>
        <td class="border border-zinc-950 px-2 py-1 w-28">Сумма, руб.</td>
      </tr>
    </thead>
    <tbody>
      {{#operations}}
      <tr>
        <td class="border border-zinc-950 px-2 py-1">{{num}}</td>
        <td class="border border-zinc-950 px-2 py-1">{{op_date}}</td>
        <td class="border border-zinc-950 px-2 py-1">{{op_doc}}</td>
        <td class="border border-zinc-950 px-2 py-1">{{op_desc}}</td>
        <td class="border border-zinc-950 px-2 py-1 text-right">{{op_amount}}</td>
      </tr>
      {{/operations}}
    </tbody>
  </table>
  <p class="mb-1 text-justify text-xs">Сальдо на начало периода: {{{opening_balance}}} руб.</p>
  <p class="mb-1 text-justify text-xs">Сальдо на конец периода: <strong>{{{closing_balance}}} руб.</strong> ({{{closing_balance_words}}}).</p>
  <p class="mb-4 text-justify text-xs">{{{disagreement}}}. Настоящий акт подтверждает состояние расчётов сторон и является признанием долга (ст. 203 ГК РФ).</p>
  <div class="flex justify-between mt-8 text-xs">
    <div class="w-1/2 pr-4">
      <p class="font-bold mb-1">{{{company1}}}</p>
      <p class="mb-6">{{{company1_director}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись / М.П.</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">{{{company2}}}</p>
      <p class="mb-6">{{{company2_director}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись / М.П.</p>
    </div>
  </div>
</div>`,
  },
{
    id: "transfer-order-t5",
    name: "Приказ о переводе на другую должность (Т-5)",
    category: "business",
    actSource: "Постановление Госкомстата № 1 от 05.01.2004",
    lastUpdated: "Август 2026",
    description: "Приказ о переводе работника на другую должность (форма Т-5): прежнее и новое место работы, оклад, основание (заявление, допсоглашение), отметка об ознакомлении.",
    suggestedDocs: ["ds-transfer", "employment-contract"],
    printInstruction: "Печать на листе А4; форма Т-5, обязательна отметка «С приказом работник ознакомлен» с подписью и датой",
    fields: [
      { id: "company_name", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_tab_number", label: "Табельный номер", type: "text", defaultValue: "", category: "employee" },
      { id: "old_department", label: "Прежнее подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "old_position", label: "Прежняя должность", type: "text", defaultValue: "", category: "employee" },
      { id: "new_department", label: "Новое подразделение", type: "text", defaultValue: "", category: "employee" },
      { id: "new_position", label: "Новая должность", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "new_salary", label: "Новый оклад (руб.)", type: "text", defaultValue: "", category: "employee" },
      { id: "transfer_date", label: "Дата перевода", type: "date", defaultValue: "", category: "contract" },
      { id: "basis", label: "Основание перевода", type: "text", defaultValue: "", category: "employee" },
      { id: "director_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <p class="text-center text-xs mb-2">Унифицированная форма № Т-5 (утв. Постановлением Госкомстата РФ от 05.01.2004 № 1)</p>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">{{{company_name}}}</div>
  <div class="font-bold text-base mb-2 text-black uppercase">Приказ о переводе работника на другую работу № {{{order_number}}} от «{{{order_date}}}»</div>
  <p class="mb-3 text-justify">ПРИКАЗЫВАЮ:</p>
  <p class="mb-2 text-justify"><strong>{{{employee_fio}}}</strong> (табельный № {{{employee_tab_number}}}), занимающего(ую) должность {{{old_position}}} в {{{old_department}}}, перевести на должность {{{new_position}}} в {{{new_department}}} с «{{{transfer_date}}}» с должностным окладом <strong>{{{new_salary}}} руб.</strong> ({{{new_salary_words}}}).</p>
  <p class="mb-2 text-justify">Основание: {{{basis}}}.</p>
  <div class="flex justify-between mt-8 text-xs">
    <div class="w-1/2 pr-4">
      <p class="mb-6">Руководитель: {{{director_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="mb-6">С приказом работник ознакомлен:</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись, дата</p>
    </div>
  </div>
</div>`,
  },
{
    id: "liability-agreement",
    name: "Соглашение о полной материальной ответственности",
    category: "business",
    actSource: "ст. 242-244 ТК РФ, Постановление Минтруда № 85",
    lastUpdated: "Август 2026",
    description: "Договор о полной материальной ответственности работника: заключается с работниками, непосредственно обслуживающими материальные ценности (перечень — Постановление Минтруда № 85 от 31.12.2002).",
    suggestedDocs: ["employment-contract"],
    printInstruction: "Печать на листе А4; заключается только с работниками должностей из Перечня Постановления Минтруда № 85 (иначе — недействительно)",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "employer_company", label: "Работодатель", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "employer_director", label: "Руководитель", type: "text", defaultValue: "", category: "employer" },
      { id: "employee_fio", label: "Работник (ФИО)", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "assets_desc", label: "Вверенные ценности", type: "text", defaultValue: "", category: "items" },
      { id: "liability_scope", label: "Сфера ответственности", type: "text", defaultValue: "", category: "employee" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор о полной материальной ответственности</div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong> в лице {{{employer_director}}}, именуемый «Работодатель», с одной стороны, и
    <strong>{{{employee_fio}}}</strong>, занимающий(ая) должность {{{employee_position}}}, именуемый «Работник», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 242-244 ТК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Работник принимает на себя полную материальную ответственность за недостачу вверенных ему материальных ценностей: {{{assets_desc}}}.</p>
  <p class="mb-3 text-justify">1.2. Работник несёт материальную ответственность в размере {{{liability_scope}}} (ст. 242 ТК РФ).</p>
  <p class="font-bold mb-2">2. Обязанности сторон</p>
  <p class="mb-3 text-justify">2.1. Работник обязан бережно относиться к вверенным ценностям, своевременно сообщать о фактах, угрожающих их сохранности, вести учёт и отчётность.</p>
  <p class="mb-3 text-justify">2.2. Работодатель обязан создавать условия для сохранности ценностей, проводить инвентаризации и проверки.</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. Размер ущерба определяется по фактическим потерям на день его причинения (ст. 246 ТК РФ); до принятия решения о возмещении Работодатель проводит проверку с истребованием объяснения (ст. 247 ТК РФ).</p>
  <p class="mb-3 text-justify">3.2. Договор действует с момента подписания и расторгается по основаниям трудового законодательства.</p>
  
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
      <p class="font-bold mb-1">Работодатель:</p>
      <p class="mb-6">{{{employer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись / М.П.</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Работник:</p>
      <p class="mb-6">{{{employee_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "business-trip-order",
    name: "Приказ о командировке (Т-9)",
    category: "business",
    actSource: "Постановление Госкомстата № 1 от 05.01.2004",
    lastUpdated: "Август 2026",
    description: "Приказ о направлении работника в служебную командировку (форма Т-9): место назначения, срок, цель, основание, служебное задание (Т-10а).",
    suggestedDocs: ["employment-contract"],
    printInstruction: "Печать на листе А4; к приказу оформляется служебное задание (Т-10а), по возвращении — отчёт о выполнении",
    fields: [
      { id: "company_name", label: "Организация", type: "text", defaultValue: "", category: "employer", validation: { required: true } },
      { id: "order_number", label: "Номер приказа", type: "text", defaultValue: "", category: "contract" },
      { id: "order_date", label: "Дата приказа", type: "date", defaultValue: "", category: "contract" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "", category: "employee", validation: { required: true } },
      { id: "employee_tab_number", label: "Табельный номер", type: "text", defaultValue: "", category: "employee" },
      { id: "employee_position", label: "Должность", type: "text", defaultValue: "", category: "employee" },
      { id: "trip_destination", label: "Место назначения", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "trip_start", label: "Дата начала", type: "date", defaultValue: "", category: "contract" },
      { id: "trip_end", label: "Дата окончания", type: "date", defaultValue: "", category: "contract" },
      { id: "trip_purpose", label: "Цель командировки", type: "text", defaultValue: "", category: "contract" },
      { id: "basis", label: "Основание", type: "text", defaultValue: "", category: "contract" },
      { id: "travel_pay", label: "Оплата проезда и суточные", type: "text", defaultValue: "", category: "employee" },
      { id: "director_fio", label: "Руководитель (ФИО)", type: "text", defaultValue: "", category: "employer" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <p class="text-center text-xs mb-2">Унифицированная форма № Т-9 (утв. Постановлением Госкомстата РФ от 05.01.2004 № 1)</p>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">{{{company_name}}}</div>
  <div class="font-bold text-base mb-2 text-black uppercase">Приказ о направлении работника в командировку № {{{order_number}}} от «{{{order_date}}}»</div>
  <p class="mb-3 text-justify">ПРИКАЗЫВАЮ:</p>
  <p class="mb-2 text-justify">Направить <strong>{{{employee_fio}}}</strong> (табельный № {{{employee_tab_number}}}), {{{employee_position}}}, в командировку в {{{trip_destination}}} на срок {{{trip_start}}} — {{{trip_end}}} с целью: {{{trip_purpose}}}.</p>
  <p class="mb-2 text-justify">Условия: {{{travel_pay}}}.</p>
  <p class="mb-2 text-justify">Основание: {{{basis}}}.</p>
  <div class="flex justify-between mt-8 text-xs">
    <div class="w-1/2 pr-4">
      <p class="mb-6">Руководитель: {{{director_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="mb-6">С приказом работник ознакомлен:</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись, дата</p>
    </div>
  </div>
</div>`,
  },
{
    id: "tutor-contract",
    name: "Договор с репетитором (образовательные услуги)",
    category: "business",
    actSource: "ст. 779-783 ГК РФ, 273-ФЗ «Об образовании»",
    lastUpdated: "Август 2026",
    description: "Договор на оказание образовательных услуг (занятия с репетитором): предмет, график занятий, стоимость, отмена/перенос, порядок оплаты.",
    suggestedDocs: ["act-services", "raspiska-money"],
    printInstruction: "Печать на листе А4; рекомендуется указывать формат занятий (очно/онлайн), график и стоимость одного занятия",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "tutor_fio", label: "Репетитор (ФИО)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "tutor_passport", label: "Паспорт репетитора", type: "text", defaultValue: "", category: "executor" },
      { id: "student_fio", label: "Ученик (ФИО)", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "student_age", label: "Возраст/класс", type: "text", defaultValue: "", category: "customer" },
      { id: "parent_fio", label: "Родитель/законный представитель", type: "text", defaultValue: "", category: "customer" },
      { id: "subject", label: "Предмет", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "format", label: "Формат занятий", type: "select", defaultValue: "онлайн (видеосвязь)", category: "items", options: [
        { label: "Онлайн (видеосвязь)", value: "онлайн (видеосвязь)" },
        { label: "Очно (у ученика)", value: "очно (у ученика)" },
        { label: "Очно (у репетитора)", value: "очно (у репетитора)" },
      ] },
      { id: "lessons_count", label: "Количество занятий", type: "text", defaultValue: "", category: "items" },
      { id: "lesson_price", label: "Стоимость занятия (руб.)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "start_date", label: "Начало занятий", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Окончание занятий", type: "date", defaultValue: "", category: "contract" },
      { id: "cancel_terms", label: "Отмена занятий", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание образовательных услуг (с репетитором)</div>
  <p class="mb-4 text-justify">
    <strong>{{{tutor_fio}}}</strong> (паспорт: {{{tutor_passport}}}), именуемый «Исполнитель», с одной стороны, и
    <strong>{{{parent_fio}}}</strong> — родитель ученика {{{student_fio}}} ({{{student_age}}}), именуемый «Заказчик»,
    с другой стороны, заключили настоящий договор (ст. 779 ГК РФ, 273-ФЗ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется проводить занятия по предмету: {{{subject}}}, в формате {{{format}}}, {{{lessons_count}}}, а Заказчик — оплачивать их.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость одного занятия: <strong>{{{lesson_price}}} руб.</strong> ({{{lesson_price_words}}}). {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Срок и условия</p>
  <p class="mb-3 text-justify">3.1. Занятия проводятся в период с «{{{start_date}}}» по «{{{end_date}}}».</p>
  <p class="mb-3 text-justify">3.2. {{{cancel_terms}}}.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. При пропуске занятия по вине Исполнителя занятие переносится или оплата возвращается. При отказе Заказчика от занятий оплата возвращается пропорционально неоказанным занятиям.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{tutor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{parent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "seo-contract",
    name: "Договор на SEO-продвижение сайта",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на поисковое продвижение сайта: перечень работ, KPI (позиции, трафик), отчётность, стоимость, сроки, ответственность за результат.",
    suggestedDocs: ["act-services", "invoice", "agreement-confidentiality"],
    printInstruction: "Печать на листе А4; KPI и перечень работ оформляются приложением к договору; рекомендуется фиксировать порядок приёмки отчётов",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (SEO-агентство)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "executor_director", label: "Руководитель исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "site_url", label: "Продвигаемый сайт", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "region", label: "Регион продвижения", type: "text", defaultValue: "", category: "items" },
      { id: "query_list", label: "Ключевые запросы (перечень)", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "work_list", label: "Перечень работ", type: "textarea", defaultValue: "", category: "items", rows: 2 },
      { id: "monthly_fee", label: "Стоимость (руб./мес)", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract" },
      { id: "term", label: "Срок договора", type: "text", defaultValue: "", category: "contract" },
      { id: "report_order", label: "Отчётность", type: "text", defaultValue: "", category: "items" },
      { id: "kpi_note", label: "KPI/гарантии", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на SEO-продвижение сайта</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), в лице {{{executor_director}}}, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказать услуги по поисковому продвижению сайта {{{site_url}}} в регионе {{{region}}}: {{{work_list}}}. Перечень ключевых запросов — {{{query_list}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг: <strong>{{{monthly_fee}}} руб.</strong> ({{{monthly_fee_words}}}) в месяц, оплачивается до 5 числа текущего месяца.</p>
  <p class="font-bold mb-2">3. Сроки и отчётность</p>
  <p class="mb-3 text-justify">3.1. Договор заключён на срок {{{term}}} с «{{{start_date}}}». {{{report_order}}}.</p>
  <p class="font-bold mb-2">4. KPI и ответственность</p>
  <p class="mb-3 text-justify">4.1. {{{kpi_note}}}.</p>
  <p class="mb-3 text-justify">4.2. За просрочку оплаты Заказчик уплачивает неустойку 0,1% в день от суммы задолженности.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "courier-contract",
    name: "Договор на курьерские услуги",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на доставку корреспонденции и грузов курьером: адреса отправки и доставки, сроки, стоимость, ответственность за утрату/повреждение вложений.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; опись вложений и сроки доставки оформляются заявкой к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_company", label: "Исполнитель (курьерская служба)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "service_scope", label: "Объём услуг", type: "text", defaultValue: "", category: "items" },
      { id: "tariff", label: "Тариф", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "delivery_time", label: "Сроки доставки", type: "text", defaultValue: "", category: "contract" },
      { id: "liability", label: "Ответственность при утрате", type: "text", defaultValue: "", category: "other" },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "start_date", label: "Начало оказания", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание курьерских услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}), именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}), именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется доставлять корреспонденцию и посылки Заказчика: {{{service_scope}}}. Содержание отправлений фиксируется описью вложений.</p>
  <p class="mb-3 text-justify">1.2. Сроки доставки: {{{delivery_time}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Тариф: {{{tariff}}}. {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. При утрате или повреждении отправлений Исполнитель возмещает ущерб: {{{liability}}}.</p>
  <p class="mb-3 text-justify">3.2. За просрочку оплаты Заказчик уплачивает неустойку 0,1% в день от суммы задолженности (ст. 330 ГК РФ).</p>
  <p class="font-bold mb-2">4. Срок действия</p>
  <p class="mb-3 text-justify">4.1. Услуги оказываются с «{{{start_date}}}». Договор действует до конца календарного года и продлевается автоматически.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "translator-contract",
    name: "Договор на услуги перевода",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на письменный или устный перевод: языки, объём, сроки, стоимость за страницу, конфиденциальность и ответственность за качество перевода.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; объём и сроки перевода фиксируются в приложении-заявке",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "executor_name", label: "Переводчик (ФИО или организация)", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "langs", label: "Языки перевода", type: "text", defaultValue: "", category: "items" },
      { id: "scope", label: "Объём работ", type: "text", defaultValue: "", category: "items" },
      { id: "deadline", label: "Сроки", type: "text", defaultValue: "", category: "contract" },
      { id: "rate", label: "Стоимость", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "accuracy", label: "Гарантия качества", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор возмездного оказания услуг перевода</div>
  <p class="mb-4 text-justify">
    <strong>{{{executor_name}}}</strong>, именуемый «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong>, именуемый «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется оказать услуги по переводу: {{{langs}}}. Объём работ: {{{scope}}}.</p>
  <p class="mb-3 text-justify">1.2. Сроки оказания: {{{deadline}}}.</p>
  <p class="font-bold mb-2">2. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Стоимость услуг: {{{rate}}}. {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Качество и ответственность</p>
  <p class="mb-3 text-justify">3.1. Перевод должен быть точным и соответствовать нормам русского языка. {{{accuracy}}}.</p>
  <p class="mb-3 text-justify">3.2. Стороны обеспечивают конфиденциальность полученных материалов; передача третьим лицам возможна только с письменного согласия.</p>
  <p class="font-bold mb-2">4. Прочие условия</p>
  <p class="mb-3 text-justify">4.1. Услуги считаются оказанными после подписания акта. Договор действует до исполнения обязательств сторонами.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{executor_name}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "audit-contract",
    name: "Договор на проведение аудита",
    category: "business",
    actSource: "ФЗ-307 «Об аудиторской деятельности», ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с аудиторской организацией на проверку бухгалтерской отчётности: объём и период проверки, аудиторское заключение, права и обязанности сторон, ответственность за недостоверное заключение.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; объём проверки и отчётность фиксируются в приложении к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "auditor_company", label: "Аудиторская организация", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "auditor_sro", label: "СРО аудиторов", type: "text", defaultValue: "", category: "executor" },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "audit_period", label: "Проверяемый период", type: "text", defaultValue: "", category: "items" },
      { id: "audit_scope", label: "Объём проверки", type: "text", defaultValue: "", category: "items" },
      { id: "start_date", label: "Начало проверки", type: "date", defaultValue: "", category: "contract" },
      { id: "end_date", label: "Срок выдачи заключения", type: "date", defaultValue: "", category: "contract" },
      { id: "price", label: "Стоимость аудита", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание аудиторских услуг</div>
  <p class="mb-4 text-justify">
    <strong>{{{auditor_company}}}</strong> (член {{{auditor_sro}}}), именуемое «Аудиторская организация», с одной стороны, и
    <strong>{{{customer_company}}}</strong>, именуемое «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ, ФЗ-307):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Аудиторская организация обязуется провести аудит {{{audit_scope}}} Заказчика за период {{{audit_period}}} и подготовить аудиторское заключение.</p>
  <p class="mb-3 text-justify">1.2. Сроки: начало проверки с «{{{start_date}}}», аудиторское заключение — не позднее «{{{end_date}}}».</p>
  <p class="font-bold mb-2">2. Права и обязанности сторон</p>
  <p class="mb-3 text-justify">2.1. Заказчик предоставляет документацию и сведения, необходимые для проверки, и создаёт условия для работы аудиторов (ст. 14 ФЗ-307).</p>
  <p class="mb-3 text-justify">2.2. Аудиторская организация вправе получать разъяснения, знакомиться с отчётностью и привлекать экспертов (ст. 13 ФЗ-307).</p>
  <p class="font-bold mb-2">3. Стоимость и порядок оплаты</p>
  <p class="mb-3 text-justify">3.1. Стоимость услуг: {{{price}}}. {{{payment_order}}}.</p>
  <p class="font-bold mb-2">4. Конфиденциальность и ответственность</p>
  <p class="mb-3 text-justify">4.1. Стороны обеспечивают конфиденциальность сведений (аудиторская тайна, ст. 9 ФЗ-307).</p>
  <p class="mb-3 text-justify">4.2. За необоснованность аудиторского заключения Аудиторская организация несёт ответственность в соответствии с законодательством РФ.</p>
  
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
      <p class="font-bold mb-1">Аудиторская организация:</p>
      <p class="mb-6">{{{auditor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "recruiting-contract",
    name: "Договор на подбор персонала",
    category: "business",
    actSource: "ст. 779-783 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с кадровым агентством на подбор персонала: критерии вакансии, сроки подбора, стоимость (процент от оклада), гарантийный период бесплатной замены кандидата.",
    suggestedDocs: ["act-services", "invoice"],
    printInstruction: "Печать на листе А4; критерии вакансии оформляются заявкой-приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "agency_company", label: "Кадровое агентство", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "customer_company", label: "Заказчик", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "vacancy", label: "Вакансия", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "criteria", label: "Требования к кандидатам", type: "text", defaultValue: "", category: "items" },
      { id: "deadline", label: "Срок подбора", type: "text", defaultValue: "", category: "contract" },
      { id: "salary", label: "Оклад кандидата", type: "text", defaultValue: "", category: "payment" },
      { id: "fee", label: "Вознаграждение", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "guarantee", label: "Гарантийный период", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание услуг по подбору персонала</div>
  <p class="mb-4 text-justify">
    <strong>{{{agency_company}}}</strong>, именуемое «Исполнитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong>, именуемое «Заказчик», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 779 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Исполнитель обязуется подобрать кандидатов на вакансии: {{{vacancy}}}. Требования: {{{criteria}}}.</p>
  <p class="mb-3 text-justify">1.2. Срок подбора: {{{deadline}}}.</p>
  <p class="font-bold mb-2">2. Вознаграждение и порядок оплаты</p>
  <p class="mb-3 text-justify">2.1. Оклад кандидата: {{{salary}}}. Вознаграждение Исполнителя: {{{fee}}}, оплачивается в течение 5 рабочих дней после выхода кандидата на работу.</p>
  <p class="font-bold mb-2">3. Гарантии</p>
  <p class="mb-3 text-justify">3.1. {{{guarantee}}}.</p>
  <p class="mb-3 text-justify">3.2. Информация о кандидатах предоставляется только с их согласия на обработку персональных данных.</p>
  <p class="font-bold mb-2">4. Прочие условия</p>
  <p class="mb-3 text-justify">4.1. Услуги считаются оказанными после подписания акта. Договор действует до исполнения обязательств сторонами.</p>
  
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
      <p class="font-bold mb-1">Исполнитель:</p>
      <p class="mb-6">{{{agency_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Заказчик:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "warehouse-storage",
    name: "Договор ответственного хранения",
    category: "business",
    actSource: "ст. 886-926 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор хранения товара на складе: опись передаваемого имущества, место и срок хранения, вознаграждение, обязанности хранителя и ответственность за утрату или повреждение.",
    suggestedDocs: ["act-services", "warehouse-rent"],
    printInstruction: "Печать на листе А4; передача имущества оформляется описью (актом приёма-передачи) к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract" },
      { id: "keeper_company", label: "Хранитель", type: "text", defaultValue: "", category: "executor", validation: { required: true } },
      { id: "customer_company", label: "Поклажедатель", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "goods", label: "Имущество на хранение", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "storage_address", label: "Адрес склада", type: "text", defaultValue: "", category: "realty" },
      { id: "storage_term", label: "Срок хранения", type: "text", defaultValue: "", category: "contract" },
      { id: "fee", label: "Вознаграждение", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "payment_order", label: "Порядок оплаты", type: "text", defaultValue: "", category: "payment" },
      { id: "liability", label: "Ответственность хранителя", type: "text", defaultValue: "", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор хранения</div>
  <p class="mb-4 text-justify">
    <strong>{{{keeper_company}}}</strong>, именуемое «Хранитель», с одной стороны, и
    <strong>{{{customer_company}}}</strong>, именуемое «Поклажедатель», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 886 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Хранитель обязуется хранить переданное Поклажедателем имущество и возвратить его в сохранности: {{{goods}}}.</p>
  <p class="mb-3 text-justify">1.2. Имущество хранится по адресу: {{{storage_address}}}. Передача оформляется описью (актом приёма-передачи).</p>
  <p class="font-bold mb-2">2. Срок хранения и вознаграждение</p>
  <p class="mb-3 text-justify">2.1. Срок хранения: {{{storage_term}}}. Вознаграждение: {{{fee}}}. {{{payment_order}}}.</p>
  <p class="font-bold mb-2">3. Обязанности и ответственность хранителя</p>
  <p class="mb-3 text-justify">3.1. Хранитель обеспечивает сохранность имущества, не пользуется им без согласия Поклажедателя (ст. 891, 892 ГК РФ).</p>
  <p class="mb-3 text-justify">3.2. При утрате, недостаче или повреждении имущества Хранитель возмещает: {{{liability}}} (ст. 901, 902 ГК РФ).</p>
  <p class="font-bold mb-2">4. Прочие условия</p>
  <p class="mb-3 text-justify">4.1. Имущество возвращается по первому требованию Поклажедателя; вывоз осуществляется за его счёт.</p>
  
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
      <p class="font-bold mb-1">Хранитель:</p>
      <p class="mb-6">{{{keeper_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Поклажедатель:</p>
      <p class="mb-6">{{{customer_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "freight-transport",
    name: "Договор перевозки груза автомобильным транспортом",
    category: "business",
    actSource: "гл. 40 ГК РФ, ФЗ-259 «Устав автомобильного транспорта»",
    lastUpdated: "Август 2026",
    description: "Договор перевозки груза автотранспортом: перевозчик обязуется доставить груз в пункт назначения, заказчик — оплатить перевозку.",
    suggestedDocs: ["transport-expedition","torg-12"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "carrier_company", label: "Компания перевозчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "carrier_inn", label: "ИНН перевозчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "carrier_addr", label: "Юр. адрес перевозчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "cargo_desc", label: "Описание груза", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "pickup_addr", label: "Пункт погрузки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "drop_addr", label: "Пункт выгрузки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "pickup_date", label: "Дата погрузки", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "drop_date", label: "Дата выгрузки", type: "date", defaultValue: "", category: "contract" },
      { id: "vehicle_req", label: "Требование к транспорту", type: "text", defaultValue: "", category: "vehicle" },
      { id: "freight_price", label: "Стоимость перевозки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pay_term", label: "Срок оплаты (дней после выгрузки)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор перевозки груза</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{carrier_company}}}</strong> (ИНН {{{carrier_inn}}}, адрес: {{{carrier_addr}}}), именуемое в дальнейшем «Перевозчик», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Перевозчик обязуется доставить вверенный груз: {{{cargo_desc}}}, по маршруту: {{{pickup_addr}}} → {{{drop_addr}}}, а Заказчик — оплатить перевозку.</p>
  <p class="mb-4 text-justify">1.2. Дата погрузки: {{{pickup_date}}}, дата выгрузки: {{{drop_date}}}.</p>
  <p class="mb-4 text-justify">1.3. Требование к транспортному средству: {{{vehicle_req}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость перевозки составляет <strong>{{{freight_price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в течение {{{pay_term}}} рабочих дней после подписания акта об оказании услуг и предоставления ТТН.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности перевозчика</div>
  <p class="mb-4 text-justify">3.1. Подать транспортное средство в исправном состоянии в срок.</p>
  <p class="mb-4 text-justify">3.2. Доставить груз в пункт назначения и выдать его уполномоченному лицу.</p>
  <p class="mb-4 text-justify">3.3. Обеспечить сохранность груза в пути.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности заказчика</div>
  <p class="mb-4 text-justify">4.1. Подготовить груз к перевозке и оформить сопроводительные документы.</p>
  <p class="mb-4 text-justify">4.2. Обеспечить погрузку/выгрузку и своевременно оплатить перевозку.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За утрату или повреждение груза Перевозчик возмещает стоимость груза в соответствии со ст. 796 ГК РФ.</p>
  <p class="mb-4 text-justify">5.2. За просрочку доставки Перевозчик уплачивает штраф в размере 10% от стоимости перевозки.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Перевозчик:</div>
      <p class="mb-1"><strong>{{{carrier_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{carrier_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{carrier_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "simple-partnership",
    name: "Договор простого товарищества (совместной деятельности)",
    category: "business",
    actSource: "гл. 55 ГК РФ (ст. 1041-1054)",
    lastUpdated: "Август 2026",
    description: "Договор простого товарищества: двое и более лиц обязуются соединить вклады и действовать совместно для достижения общей цели без образования юрлица.",
    suggestedDocs: ["addendum-generic","termination-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "partner1_company", label: "Компания товарища 1", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "partner1_inn", label: "ИНН товарища 1", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "partner1_addr", label: "Юр. адрес товарища 1", type: "text", defaultValue: "", category: "business" },
      { id: "partner2_company", label: "Компания товарища 2", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "partner2_inn", label: "ИНН товарища 2", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "partner2_addr", label: "Юр. адрес товарища 2", type: "text", defaultValue: "", category: "business" },
      { id: "common_goal", label: "Общая цель", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "contribution1", label: "Вклад товарища 1", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "contribution2", label: "Вклад товарища 2", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "share1", label: "Доля в прибыли товарища 1 (%)", type: "number", defaultValue: "", category: "business" },
      { id: "share2", label: "Доля в прибыли товарища 2 (%)", type: "number", defaultValue: "", category: "business" },
      { id: "term_end", label: "Срок действия (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "managing_partner", label: "Уполномоченный товарищ (ведение общих дел)", type: "text", defaultValue: "", category: "business" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор простого товарищества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{partner1_company}}}</strong> (ИНН {{{partner1_inn}}}, адрес: {{{partner1_addr}}}), именуемое в дальнейшем «Товарищ 1», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{partner2_company}}}</strong> (ИНН {{{partner2_inn}}}, адрес: {{{partner2_addr}}}), именуемое в дальнейшем «Товарищ 2», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Общие положения</div>
  <p class="mb-4 text-justify">1.1. Стороны обязуются соединить вклады и совместно действовать без образования юридического лица для достижения цели: {{{common_goal}}}.</p>
  <p class="mb-4 text-justify">1.2. Вклад Товарища 1: {{{contribution1}}}.</p>
  <p class="mb-4 text-justify">1.3. Вклад Товарища 2: {{{contribution2}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Ведение общих дел</div>
  <p class="mb-4 text-justify">2.1. Ведение общих дел осуществляется: {{{managing_partner}}}.</p>
  <p class="mb-4 text-justify">2.2. Совершение сделок в интересах товарищества возможно только с согласия всех товарищей, если иное не предусмотрено настоящим договором.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Прибыль и убытки</div>
  <p class="mb-4 text-justify">3.1. Прибыль распределяется пропорционально стоимости вкладов: Товарищ 1 — {{{share1}}}%, Товарищ 2 — {{{share2}}}%.</p>
  <p class="mb-4 text-justify">3.2. Убытки распределяются в том же порядке.</p>
  <p class="mb-4 text-justify">3.3. Ответственность по общим обязательствам — солидарная, в пределах стоимости вкладов.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок и прекращение договора</div>
  <p class="mb-4 text-justify">4.1. Договор заключён до {{{term_end}}}.</p>
  <p class="mb-4 text-justify">4.2. Договор может быть расторгнут по соглашению сторон либо в судебном порядке.</p>
  <p class="mb-4 text-justify">4.3. При прекращении договора имущество возвращается товарищам в порядке раздела общего имущества.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Товарищ 1:</div>
      <p class="mb-1"><strong>{{{partner1_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{partner1_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{partner1_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Товарищ 2:</div>
      <p class="mb-1"><strong>{{{partner2_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{partner2_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{partner2_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "barter-agreement",
    name: "Договор мены (бартера) товаров",
    category: "business",
    actSource: "гл. 31 ГК РФ (ст. 567-571)",
    lastUpdated: "Август 2026",
    description: "Договор мены товаров между организациями или ИП с возможной доплатой за разницу в стоимости.",
    suggestedDocs: ["goods-sale","torg-12"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "side1_company", label: "Компания стороны 1", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "side1_inn", label: "ИНН стороны 1", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "side1_addr", label: "Юр. адрес стороны 1", type: "text", defaultValue: "", category: "business" },
      { id: "side2_company", label: "Компания стороны 2", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "side2_inn", label: "ИНН стороны 2", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "side2_addr", label: "Юр. адрес стороны 2", type: "text", defaultValue: "", category: "business" },
      { id: "goods1", label: "Товар стороны 1", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "goods1_price", label: "Стоимость товара стороны 1 (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "goods2", label: "Товар стороны 2", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "goods2_price", label: "Стоимость товара стороны 2 (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "extra_pay", label: "Доплата (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "exchange_term", label: "Срок обмена (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "transfer_place", label: "Место передачи", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор мены товаров</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{side1_company}}}</strong> (ИНН {{{side1_inn}}}, адрес: {{{side1_addr}}}), именуемое в дальнейшем «Сторона 1», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{side2_company}}}</strong> (ИНН {{{side2_inn}}}, адрес: {{{side2_addr}}}), именуемое в дальнейшем «Сторона 2», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Сторона 1 передаёт Стороне 2 товар: {{{goods1}}}, стоимостью <strong>{{{goods1_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. Сторона 2 передаёт Стороне 1 товар: {{{goods2}}}, стоимостью <strong>{{{goods2_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.3. Доплата в размере {{{extra_pay}}} рублей (при неравноценном обмене).</p>
  <p class="mb-4 text-justify">1.4. Обмен производится в срок до {{{exchange_term}}} по адресу: {{{transfer_place}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок передачи</div>
  <p class="mb-4 text-justify">2.1. Передача товаров оформляется актами приёма-передачи и товарными накладными (ТОРГ-12).</p>
  <p class="mb-4 text-justify">2.2. Право собственности на обмениваемые товары переходит одновременно после исполнения обязательств по передаче.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Качество товаров</div>
  <p class="mb-4 text-justify">3.1. Каждая сторона обязана передать товар надлежащего качества, соответствующий ГОСТ и ТУ.</p>
  <p class="mb-4 text-justify">3.2. При передаче товара ненадлежащего качества применяются правила ст. 475 ГК РФ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При нарушении срока передачи виновная сторона уплачивает пени 0,1% от стоимости не переданного товара за каждый день просрочки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Сторона 1:</div>
      <p class="mb-1"><strong>{{{side1_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{side1_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{side1_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Сторона 2:</div>
      <p class="mb-1"><strong>{{{side2_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{side2_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{side2_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "equipment-rental",
    name: "Договор аренды оборудования",
    category: "business",
    actSource: "гл. 34 ГК РФ (ст. 606-625, 642-670)",
    lastUpdated: "Август 2026",
    description: "Договор аренды оборудования, техники, инструмента для бизнеса. Возможно с экипажем (обслуживающим персоналом).",
    suggestedDocs: ["act-works","addendum-generic"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_company", label: "Компания арендодателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН арендодателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessor_addr", label: "Юр. адрес арендодателя", type: "text", defaultValue: "", category: "business" },
      { id: "lessee_company", label: "Компания арендатора", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessee_inn", label: "ИНН арендатора", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessee_addr", label: "Юр. адрес арендатора", type: "text", defaultValue: "", category: "business" },
      { id: "equipment_desc", label: "Оборудование", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "rent_amount", label: "Арендная плата в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "rent_words", label: "Плата прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "", category: "payment" },
      { id: "deposit", label: "Обеспечительный платёж (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_start", label: "Дата начала аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания аренды", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "delivery_addr", label: "Место эксплуатации", type: "text", defaultValue: "", category: "contract" },
      { id: "maintenance", label: "Обслуживание", type: "text", defaultValue: "", category: "contract" },
      { id: "crew", label: "Услуги экипажа", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аренды оборудования</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_company}}}</strong> (ИНН {{{lessor_inn}}}, адрес: {{{lessor_addr}}}), именуемое в дальнейшем «Арендодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{lessee_company}}}</strong> (ИНН {{{lessee_inn}}}, адрес: {{{lessee_addr}}}), именуемое в дальнейшем «Арендатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Арендодатель предоставляет Арендатору во временное владение и пользование оборудование: {{{equipment_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Место эксплуатации: {{{delivery_addr}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{crew}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Арендная плата</div>
  <p class="mb-4 text-justify">2.1. Арендная плата составляет <strong>{{{rent_amount}}} ({{{rent_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Плата вносится ежемесячно до {{{pay_day}}} числа.</p>
  <p class="mb-4 text-justify">2.3. Обеспечительный платёж {{{deposit}}} рублей возвращается при возврате оборудования в исправном состоянии.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обслуживание и ремонт</div>
  <p class="mb-4 text-justify">3.1. {{{maintenance}}}.</p>
  <p class="mb-4 text-justify">3.2. Арендатор обязан содержать оборудование в исправном состоянии и нести расходы на текущее обслуживание.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок и возврат</div>
  <p class="mb-4 text-justify">4.1. Договор действует с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">4.2. Возврат оборудования оформляется актом возврата с указанием состояния.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку арендной платы Арендатор уплачивает пени 0,1% в день.</p>
  <p class="mb-4 text-justify">5.2. За утрату или повреждение оборудования Арендатор возмещает его стоимость.</p>

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
      <p class="mb-1"><strong>{{{lessor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{lessor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Арендатор:</div>
      <p class="mb-1"><strong>{{{lessee_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{lessee_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessee_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "maintenance-service",
    name: "Договор технического обслуживания оборудования",
    category: "business",
    actSource: "гл. 39 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор ТО оборудования: периодическое сервисное обслуживание, профилактические работы, устранение неисправностей.",
    suggestedDocs: ["act-works","equipment-rental"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Компания исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес исполнителя", type: "text", defaultValue: "", category: "contractor" },
      { id: "equipment_list", label: "Перечень оборудования", type: "textarea", defaultValue: "", category: "object", validation: { required: true } },
      { id: "to_frequency", label: "Периодичность ТО", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "to_price", label: "Стоимость ТО за период (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "contract_term", label: "Срок договора (дата окончания)", type: "date", defaultValue: "", category: "contract" },
      { id: "response_time", label: "Время реакции на заявку (часов)", type: "number", defaultValue: "", category: "contract" },
      { id: "spare_parts", label: "Запасные части", type: "text", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор технического обслуживания</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется проводить техническое обслуживание оборудования: {{{equipment_list}}}.</p>
  <p class="mb-4 text-justify">1.2. Периодичность ТО: {{{to_frequency}}}.</p>
  <p class="mb-4 text-justify">1.3. Время реакции на заявку: {{{response_time}}} часов.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость ТО составляет <strong>{{{to_price}}} ({{{price_words}}}) рублей</strong> за период.</p>
  <p class="mb-4 text-justify">2.2. {{{spare_parts}}}.</p>
  <p class="mb-4 text-justify">2.3. Оплата производится ежемесячно в течение 5 рабочих дней после подписания акта.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности исполнителя</div>
  <p class="mb-4 text-justify">3.1. Проводить ТО в соответствии с регламентом производителя, устранять выявленные неисправности.</p>
  <p class="mb-4 text-justify">3.2. Предоставлять отчёты о выполненных работах.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности заказчика</div>
  <p class="mb-4 text-justify">4.1. Обеспечить доступ к оборудованию, предоставить техническую документацию.</p>
  <p class="mb-4 text-justify">4.2. Своевременно оплачивать услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За нарушение сроков ТО Исполнитель уплачивает пени 0,1% в день от стоимости невыполненных работ.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "outsourcing-contract",
    name: "Договор аутсорсинга персонала",
    category: "business",
    actSource: "гл. 39 ГК РФ, ст. 56.1 ТК РФ",
    lastUpdated: "Август 2026",
    description: "Договор аутсорсинга: компания передаёт вспомогательные функции (бухгалтерия, IT, клининг, кадры) внешнему исполнителю.",
    suggestedDocs: ["accounting-services","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Компания исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес исполнителя", type: "text", defaultValue: "", category: "contractor" },
      { id: "functions", label: "Передаваемые функции", type: "textarea", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "staff_count", label: "Количество сотрудников", type: "number", defaultValue: "", category: "business" },
      { id: "monthly_fee", label: "Ежемесячная стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "fee_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "slа_note", label: "Условия о конфиденциальности", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор аутсорсинга</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказывать услуги по выполнению функций: {{{functions}}}.</p>
  <p class="mb-4 text-justify">1.2. Количество привлекаемых специалистов: {{{staff_count}}}.</p>
  <p class="mb-4 text-justify">1.3. {{slа_note}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_fee}}} ({{{fee_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Оплата вносится ежемесячно до {{{pay_day}}} числа.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности исполнителя</div>
  <p class="mb-4 text-justify">3.1. Оказывать услуги качественно и в срок, нести ответственность за действия своих сотрудников.</p>
  <p class="mb-4 text-justify">3.2. Обеспечить замену специалиста при необходимости.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности заказчика</div>
  <p class="mb-4 text-justify">4.1. Предоставлять документы и доступ, необходимые для оказания услуг.</p>
  <p class="mb-4 text-justify">4.2. Своевременно оплачивать услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За некачественное оказание услуг Исполнитель устраняет недостатки за свой счёт.</p>
  <p class="mb-4 text-justify">5.2. За просрочку оплаты Заказчик уплачивает пени 0,1% в день.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "appraiser-contract",
    name: "Договор на оценку имущества",
    category: "business",
    actSource: "ФЗ-135 «Об оценочной деятельности»",
    lastUpdated: "Август 2026",
    description: "Договор на проведение независимой оценки имущества: отчёт об оценке для сделки, оспаривания кадастровой стоимости, суда.",
    suggestedDocs: ["act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "client_fio", label: "ФИО заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_addr", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "appraiser_company", label: "Оценочная компания", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "appraiser_inn", label: "ИНН оценочной компании", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "appraiser_addr", label: "Юр. адрес оценочной компании", type: "text", defaultValue: "", category: "contractor" },
      { id: "object_desc", label: "Объект оценки", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "purpose", label: "Цель оценки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "valuation_type", label: "Вид стоимости", type: "text", defaultValue: "", category: "contract" },
      { id: "price", label: "Стоимость оценки (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "report_term", label: "Срок отчёта (дней)", type: "number", defaultValue: "", category: "contract" },
      { id: "report_use", label: "Допустимое использование отчёта", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на оказание оценочных услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}, адрес: {{{client_addr}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{appraiser_company}}}</strong> (ИНН {{{appraiser_inn}}}, адрес: {{{appraiser_addr}}}), именуемое в дальнейшем «Оценщик», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Оценщик обязуется провести оценку объекта: {{{object_desc}}}, и составить отчёт об оценке.</p>
  <p class="mb-4 text-justify">1.2. Цель оценки: {{{purpose}}}. Вид стоимости: {{{valuation_type}}}.</p>
  <p class="mb-4 text-justify">1.3. Допустимое использование отчёта: {{{report_use}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Отчёт предоставляется в течение {{{report_term}}} рабочих дней с момента получения документов и оплаты.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Оценщик обязан соблюдать стандарты оценки и саморегулируемой организации, застраховать ответственность.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязан предоставить документы об объекте и оплатить услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Оценщик несёт ответственность за достоверность отчёта в соответствии с ФЗ-135.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{client_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{client_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{client_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Оценщик:</div>
      <p class="mb-1"><strong>{{{appraiser_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{appraiser_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{appraiser_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "furniture-custom",
    name: "Договор на изготовление мебели по индивидуальному заказу",
    category: "business",
    actSource: "гл. 37 ГК РФ, Закон «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description: "Договор бытового подряда на изготовление кухни, шкафа-купе и другой мебели по индивидуальным размерам.",
    suggestedDocs: ["act-works","household-contract"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "client_fio", label: "ФИО заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_addr", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Мебельная компания", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН компании", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес компании", type: "text", defaultValue: "", category: "contractor" },
      { id: "furniture_desc", label: "Изделие", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "dimensions", label: "Размеры", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "materials", label: "Материалы", type: "text", defaultValue: "", category: "items" },
      { id: "price", label: "Цена (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Цена прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "advance", label: "Аванс (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "deadline", label: "Срок изготовления (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "delivery_addr", label: "Адрес доставки и монтажа", type: "text", defaultValue: "", category: "contract" },
      { id: "warranty", label: "Гарантия (мес.)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на изготовление мебели</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}, адрес: {{{client_addr}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется изготовить и установить мебель: {{{furniture_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Размеры: {{{dimensions}}}. Материалы: {{{materials}}}.</p>
  <p class="mb-4 text-justify">1.3. Место установки: {{{delivery_addr}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Цена и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Цена изделия составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Аванс {{{advance}}} рублей уплачивается при подписании договора, остаток — после установки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Сроки и порядок сдачи</div>
  <p class="mb-4 text-justify">3.1. Изготовление и установка — в срок до {{{deadline}}}.</p>
  <p class="mb-4 text-justify">3.2. Сдача работ оформляется актом приёма-передачи после установки.</p>
  <p class="mb-4 text-justify">3.3. При просрочке Заказчик вправе требовать неустойку в соответствии с Законом о защите прав потребителей.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантия</div>
  <p class="mb-4 text-justify">4.1. Гарантия на изделие и работы — {{{warranty}}} месяцев.</p>
  <p class="mb-4 text-justify">4.2. Гарантия не распространяется на механические повреждения по вине Заказчика.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
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
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "repair-appliance",
    name: "Договор ремонта бытовой техники",
    category: "business",
    actSource: "гл. 37 ГК РФ, Закон «О защите прав потребителей»",
    lastUpdated: "Август 2026",
    description: "Договор бытового подряда на ремонт бытовой техники (стиральные машины, холодильники, телевизоры) с выдачей гарантии на работы.",
    suggestedDocs: ["act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "client_fio", label: "ФИО заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_addr", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Сервисная компания", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН компании", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес компании", type: "text", defaultValue: "", category: "contractor" },
      { id: "appliance", label: "Техника", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "defect", label: "Неисправность", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "work_list", label: "Выполняемые работы", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "price", label: "Стоимость ремонта (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок выполнения (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "warranty", label: "Гарантия на работы (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "address_visit", label: "Место ремонта", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор ремонта бытовой техники</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}, адрес: {{{client_addr}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется выполнить ремонт техники: {{{appliance}}}.</p>
  <p class="mb-4 text-justify">1.2. Заявленная неисправность: {{{defect}}}.</p>
  <p class="mb-4 text-justify">1.3. Выполняемые работы: {{{work_list}}}.</p>
  <p class="mb-4 text-justify">1.4. Место ремонта: {{{address_visit}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и сроки</div>
  <p class="mb-4 text-justify">2.1. Стоимость ремонта составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Срок выполнения — до {{{deadline}}}. Услуги оплачиваются после сдачи работ.</p>
  <p class="mb-4 text-justify">2.3. Если в ходе ремонта выявлены дополнительные неисправности, Исполнитель согласовывает работы с Заказчиком.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Гарантия</div>
  <p class="mb-4 text-justify">3.1. Гарантия на выполненные работы и установленные запчасти — {{{warranty}}} месяцев.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При нарушении срока ремонта Исполнитель уплачивает неустойку в соответствии с Законом о защите прав потребителей (3% в день от стоимости работ).</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
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
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "installation-works",
    name: "Договор монтажных работ",
    category: "business",
    actSource: "гл. 37 ГК РФ (строительный подряд)",
    lastUpdated: "Август 2026",
    description: "Договор подряда на монтажные работы: установка оборудования, конструкций, инженерных систем на объекте.",
    suggestedDocs: ["act-works","contract-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "contractor_company", label: "Компания подрядчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_inn", label: "ИНН подрядчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_addr", label: "Юр. адрес подрядчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "works_list", label: "Перечень работ", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "object_addr", label: "Объект/адрес", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "advance", label: "Аванс (%)", type: "number", defaultValue: "", category: "payment" },
      { id: "guarantee", label: "Гарантийный срок (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "materials_by", label: "Материалы предоставляет", type: "select", defaultValue: "подрядчик", category: "contract", options: [ { label: "Подрядчик", value: "подрядчик" }, { label: "Заказчик", value: "заказчик" }, { label: "Смешанно", value: "смешанно" } ] },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор монтажных работ</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{contractor_company}}}</strong> (ИНН {{{contractor_inn}}}, адрес: {{{contractor_addr}}}), именуемое в дальнейшем «Подрядчик», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Подрядчик обязуется выполнить монтажные работы: {{{works_list}}}, на объекте: {{{object_addr}}}.</p>
  <p class="mb-4 text-justify">1.2. Материалы и оборудование предоставляет: {{{materials_by}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Аванс {{{advance}}}% от стоимости работ уплачивается при подписании договора, окончательный расчёт — после подписания акта выполненных работ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Сроки выполнения работ</div>
  <p class="mb-4 text-justify">3.1. Начало работ: {{{start_date}}}, окончание: {{{end_date}}}.</p>
  <p class="mb-4 text-justify">3.2. Досрочное выполнение работ допускается с согласия Заказчика.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности сторон</div>
  <p class="mb-4 text-justify">4.1. Подрядчик обязан выполнить работы качественно, в срок, обеспечить безопасность на объекте.</p>
  <p class="mb-4 text-justify">4.2. Заказчик обязан предоставить фронт работ, принять результат по акту, оплатить работы.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Гарантия и ответственность</div>
  <p class="mb-4 text-justify">5.1. Гарантийный срок на выполненные работы — {{{guarantee}}} месяцев.</p>
  <p class="mb-4 text-justify">5.2. За просрочку работ Подрядчик уплачивает пени 0,1% от стоимости работ за каждый день просрочки.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Подрядчик:</div>
      <p class="mb-1"><strong>{{{contractor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{contractor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{contractor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "project-design",
    name: "Договор на выполнение проектных работ",
    category: "business",
    actSource: "гл. 37 ГК РФ (ст. 758-762)",
    lastUpdated: "Август 2026",
    description: "Договор подряда на проектирование: разработка проектной и рабочей документации для строительства или реконструкции.",
    suggestedDocs: ["installation-works","act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "designer_company", label: "Проектная организация", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "designer_inn", label: "ИНН проектной организации", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "designer_addr", label: "Юр. адрес проектной организации", type: "text", defaultValue: "", category: "contractor" },
      { id: "object_desc", label: "Объект проектирования", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "doc_list", label: "Состав документации", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "stage_terms", label: "Сроки по этапам", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "expertise", label: "Экспертиза", type: "text", defaultValue: "", category: "contract" },
      { id: "agreement_term", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на выполнение проектных работ</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{designer_company}}}</strong> (ИНН {{{designer_inn}}}, адрес: {{{designer_addr}}}), именуемое в дальнейшем «Проектировщик», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Проектировщик обязуется разработать проектную документацию для объекта: {{{object_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Состав документации: {{{doc_list}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{expertise}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость проектных работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится по этапам согласно графику: {{{stage_terms}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Проектировщик обязан разработать документацию в соответствии с ТЗ, техническими регламентами и нормами.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязан передать исходные данные, принять результат по акту, оплатить работы.</p>
  <p class="mb-4 text-justify">3.3. Исключительные права на документацию переходят к Заказчику после полной оплаты.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия</div>
  <p class="mb-4 text-justify">4.1. Договор действует до {{{agreement_term}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За недостатки документации Проектировщик безвозмездно устраняет их.</p>
  <p class="mb-4 text-justify">5.2. За просрочку сдачи работ Проектировщик уплачивает пени 0,1% в день от стоимости этапа.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Проектировщик:</div>
      <p class="mb-1"><strong>{{{designer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{designer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{designer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "survey-works",
    name: "Договор геодезических (кадастровых) работ",
    category: "business",
    actSource: "ФЗ-221 «О кадастровой деятельности»",
    lastUpdated: "Август 2026",
    description: "Договор на выполнение геодезических и кадастровых работ: межевание, вынос границ, кадастровый план, технический план.",
    suggestedDocs: ["act-works","dkp-land"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "client_fio", label: "ФИО заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_passport", label: "Паспорт заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "client_addr", label: "Адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Кадастровая компания", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН компании", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес компании", type: "text", defaultValue: "", category: "contractor" },
      { id: "land_desc", label: "Земельный участок", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "works_list", label: "Виды работ", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "price", label: "Стоимость работ (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок выполнения (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "advance", label: "Аванс (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на выполнение геодезических и кадастровых работ</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{client_fio}}}</strong> (паспорт {{{client_passport}}}, адрес: {{{client_addr}}}), именуемый в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется выполнить кадастровые работы в отношении участка: {{{land_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Виды работ: {{{works_list}}}.</p>
  <p class="mb-4 text-justify">1.3. Результат — межевой план в электронном виде и постановка на кадастровый учёт.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Аванс {{{advance}}} рублей уплачивается при подписании договора, остаток — после сдачи результата.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель (кадастровый инженер) несёт ответственность за достоверность сведений в межевом плане.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязан предоставить документы на участок и обеспечить доступ на местность.</p>
  <p class="mb-4 text-justify">3.3. Срок выполнения работ: {{{deadline}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За недостатки работ Исполнитель устраняет их безвозмездно.</p>
  <p class="mb-4 text-justify">4.2. За просрочку Исполнитель уплачивает пени 0,1% в день от стоимости работ.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
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
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "landscaping-works",
    name: "Договор благоустройства территории",
    category: "business",
    actSource: "гл. 37 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор подряда на благоустройство: озеленение, укладка тротуарной плитки, монтаж малых архитектурных форм, освещение.",
    suggestedDocs: ["installation-works","act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "contractor_company", label: "Компания подрядчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_inn", label: "ИНН подрядчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "contractor_addr", label: "Юр. адрес подрядчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "territory", label: "Территория", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "works_list", label: "Состав работ", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "start_date", label: "Начало работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Окончание работ", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "guarantee", label: "Гарантия (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "agreement_term", label: "Срок действия договора (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на благоустройство территории</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{contractor_company}}}</strong> (ИНН {{{contractor_inn}}}, адрес: {{{contractor_addr}}}), именуемое в дальнейшем «Подрядчик», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Подрядчик обязуется выполнить работы по благоустройству территории: {{{territory}}}.</p>
  <p class="mb-4 text-justify">1.2. Состав работ: {{{works_list}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится поэтапно: 30% аванс, далее — по актам выполненных работ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Сроки и порядок сдачи</div>
  <p class="mb-4 text-justify">3.1. Начало работ: {{{start_date}}}, окончание: {{{end_date}}}.</p>
  <p class="mb-4 text-justify">3.2. Сдача — по актам выполненных работ формы КС-2, КС-3.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии</div>
  <p class="mb-4 text-justify">4.1. Гарантийный срок на работы — {{{guarantee}}} месяцев.</p>
  <p class="mb-4 text-justify">4.2. В гарантийный срок Подрядчик устраняет недостатки за свой счёт.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку работ Подрядчик уплачивает пени 0,1% в день от стоимости невыполненных работ.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Подрядчик:</div>
      <p class="mb-1"><strong>{{{contractor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{contractor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{contractor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "exhibition-participation",
    name: "Договор участия в выставке (ярмарке)",
    category: "business",
    actSource: "гл. 39 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на участие в выставке: аренда стенда, регистрационный взнос, организационные услуги организатора.",
    suggestedDocs: ["advertising-services","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "participant_company", label: "Компания участника", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "participant_inn", label: "ИНН участника", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "participant_addr", label: "Юр. адрес участника", type: "text", defaultValue: "", category: "customer" },
      { id: "organizer_company", label: "Компания организатора", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "organizer_inn", label: "ИНН организатора", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "organizer_addr", label: "Юр. адрес организатора", type: "text", defaultValue: "", category: "contractor" },
      { id: "expo_name", label: "Название выставки", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "expo_dates", label: "Даты проведения", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "expo_place", label: "Место проведения", type: "text", defaultValue: "", category: "contract" },
      { id: "stand", label: "Стенд", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "stand_price", label: "Стоимость стенда (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "reg_fee", label: "Регистрационный взнос (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "advance", label: "Аванс (%)", type: "number", defaultValue: "", category: "payment" },
      { id: "equipment", label: "Доп. оборудование", type: "text", defaultValue: "", category: "items" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор участия в выставке</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{participant_company}}}</strong> (ИНН {{{participant_inn}}}, адрес: {{{participant_addr}}}), именуемое в дальнейшем «Участник», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{organizer_company}}}</strong> (ИНН {{{organizer_inn}}}, адрес: {{{organizer_addr}}}), именуемое в дальнейшем «Организатор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Организатор предоставляет Участнику право участия в выставке {{{expo_name}}}, проводимой {{{expo_dates}}} в {{{expo_place}}}.</p>
  <p class="mb-4 text-justify">1.2. Предоставляемый стенд: {{{stand}}}, оборудование: {{{equipment}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость стенда — <strong>{{{stand_price}}} рублей</strong>, регистрационный взнос — {{{reg_fee}}} рублей.</p>
  <p class="mb-4 text-justify">2.2. Аванс {{{advance}}}% уплачивается при подписании договора, остаток — до {{{expo_dates}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Организатор обязуется обеспечить стенд, охрану, уборку, участие в каталоге.</p>
  <p class="mb-4 text-justify">3.2. Участник обязуется соблюдать правила выставки, не передавать стенд третьим лицам без согласия.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При отказе Участника от участия позднее чем за 30 дней до начала выставки взносы не возвращаются.</p>
  <p class="mb-4 text-justify">4.2. При отмене выставки по вине Организатора взносы возвращаются полностью.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Участник:</div>
      <p class="mb-1"><strong>{{{participant_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{participant_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{participant_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Организатор:</div>
      <p class="mb-1"><strong>{{{organizer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{organizer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{organizer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "corporate-training",
    name: "Договор обучения (повышения квалификации)",
    category: "business",
    actSource: "гл. 39 ГК РФ, ФЗ-273 «Об образовании»",
    lastUpdated: "Август 2026",
    description: "Договор на корпоративное обучение сотрудников: семинары, тренинги, курсы повышения квалификации с выдачей удостоверений.",
    suggestedDocs: ["act-services","tutor-contract"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Образовательный центр", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН образовательного центра", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес образовательного центра", type: "text", defaultValue: "", category: "contractor" },
      { id: "course", label: "Программа обучения", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "format", label: "Формат", type: "select", defaultValue: "очно", category: "contract", options: [ { label: "Очно", value: "очно" }, { label: "Онлайн (вебинар)", value: "онлайн" }, { label: "Дистанционно", value: "дистанционно" } ] },
      { id: "students_count", label: "Количество слушателей", type: "number", defaultValue: "", category: "business" },
      { id: "start_date", label: "Дата начала", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "end_date", label: "Дата окончания", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "documents", label: "Выдаваемые документы", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания образовательных услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется провести обучение по программе: {{{course}}}, в формате: {{{format}}}.</p>
  <p class="mb-4 text-justify">1.2. Количество слушателей: {{{students_count}}}. Сроки: {{{start_date}}} — {{{end_date}}}.</p>
  <p class="mb-4 text-justify">1.3. По итогам выдаются документы: {{{documents}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость обучения составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в течение 5 банковских дней с момента подписания договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется провести обучение в соответствии с утверждённой программой и лицензией.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязуется обеспечить посещение занятий слушателями и оплатить обучение.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. При неоказании услуг Исполнитель возвращает оплату за вычетом фактически оказанных услуг.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "marketing-services",
    name: "Договор маркетинговых услуг",
    category: "business",
    actSource: "гл. 39 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на маркетинговое сопровождение: разработка стратегии, анализ рынка, продвижение бренда, управление рекламными кампаниями.",
    suggestedDocs: ["advertising-services","seo-contract","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Маркетинговое агентство", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН агентства", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес агентства", type: "text", defaultValue: "", category: "contractor" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "monthly_fee", label: "Ежемесячная стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "fee_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "reporting", label: "Отчётность", type: "text", defaultValue: "", category: "contract" },
      { id: "budget", label: "Рекламный бюджет (руб./мес., если управляется)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания маркетинговых услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказать маркетинговые услуги: {{{services_list}}}.</p>
  <p class="mb-4 text-justify">1.2. Отчётность: {{{reporting}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_fee}}} ({{{fee_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Оплата вносится до {{{pay_day}}} числа текущего месяца.</p>
  <p class="mb-4 text-justify">2.3. Рекламный бюджет {{{budget}}} рублей оплачивается Заказчиком отдельно.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется оказывать услуги качественно, предоставлять отчёты, согласовывать рекламные материалы.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязуется предоставлять информацию о продукте и своевременно оплачивать услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За неоказание услуг в полном объёме Исполнитель возвращает пропорциональную часть оплаты.</p>
  <p class="mb-4 text-justify">4.2. Договор действует до {{{term_end}}}.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "pr-services",
    name: "Договор PR-сопровождения (связи с общественностью)",
    category: "business",
    actSource: "гл. 39 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на PR-сопровождение компании: взаимодействие со СМИ, пресс-релизы, управление репутацией, антикризисный PR.",
    suggestedDocs: ["marketing-services","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "PR-агентство", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН PR-агентства", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес PR-агентства", type: "text", defaultValue: "", category: "contractor" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "monthly_fee", label: "Ежемесячная стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "fee_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "kpi", label: "Ключевые показатели", type: "text", defaultValue: "", category: "contract" },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор PR-сопровождения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказывать PR-услуги: {{{services_list}}}.</p>
  <p class="mb-4 text-justify">1.2. Ключевые показатели: {{{kpi}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_fee}}} ({{{fee_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Оплата вносится до {{{pay_day}}} числа текущего месяца.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется согласовывать материалы с Заказчиком и соблюдать его политику конфиденциальности.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязуется предоставлять информацию о компании и своевременно оплачивать услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Договор действует до {{{term_end}}}. При невыполнении KPI стоимость пропорционально снижается.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "content-services",
    name: "Договор на создание контента (копирайтинг)",
    category: "business",
    actSource: "гл. 39, ст. 1288 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на создание текстового контента: статьи, посты, описания товаров, с передачей исключительных прав.",
    suggestedDocs: ["author-order","ip-assignment","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_fio", label: "ФИО исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_passport", label: "Паспорт исполнителя", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Адрес исполнителя", type: "text", defaultValue: "", category: "contractor" },
      { id: "content_list", label: "Перечень контента", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "topics", label: "Темы и ТЗ", type: "text", defaultValue: "", category: "contract" },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок сдачи (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "edits", label: "Количество правок", type: "number", defaultValue: "", category: "contract" },
      { id: "rights", label: "Передача прав", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на создание контента</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{executor_fio}}}</strong> (паспорт {{{executor_passport}}}, адрес: {{{executor_addr}}}), именуемый в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется создать контент: {{{content_list}}}. Темы: {{{topics}}}.</p>
  <p class="mb-4 text-justify">1.2. Срок сдачи: {{{deadline}}}.</p>
  <p class="mb-4 text-justify">1.3. {{{rights}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Оплата производится в течение 5 рабочих дней после приёмки контента по акту.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок сдачи и приёмки</div>
  <p class="mb-4 text-justify">3.1. Контент передаётся в электронном виде; Заказчик вправе запросить до {{{edits}}} раундов правок.</p>
  <p class="mb-4 text-justify">3.2. Работы считаются принятыми при отсутствии мотивированных замечаний в течение 5 рабочих дней.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За просрочку сдачи Исполнитель уплачивает пени 0,1% в день от стоимости заказа.</p>
  <p class="mb-4 text-justify">4.2. Исполнитель гарантирует уникальность контента и отсутствие плагиата.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{executor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "mobile-app-dev",
    name: "Договор разработки мобильного приложения",
    category: "business",
    actSource: "гл. 37, 1288 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на разработку мобильного приложения (iOS/Android): проектирование, разработка, тестирование, поддержка, передача прав.",
    suggestedDocs: ["it-development","act-works","ip-assignment"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Компания разработчик", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН разработчика", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес разработчика", type: "text", defaultValue: "", category: "contractor" },
      { id: "app_desc", label: "Описание приложения", type: "textarea", defaultValue: "", category: "object", validation: { required: true } },
      { id: "platforms", label: "Платформы", type: "text", defaultValue: "", category: "items" },
      { id: "stages", label: "Этапы работ", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок завершения (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "support", label: "Поддержка после релиза (мес.)", type: "number", defaultValue: "", category: "contract" },
      { id: "rights", label: "Передача исключительных прав", type: "text", defaultValue: "", category: "contract" },
      { id: "advance", label: "Аванс (%)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор разработки мобильного приложения</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется разработать мобильное приложение: {{{app_desc}}}.</p>
  <p class="mb-4 text-justify">1.2. Этапы: {{{stages}}}. Платформы: {{{platforms}}}.</p>
  <p class="mb-4 text-justify">1.3. Срок завершения: {{{deadline}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость разработки составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Аванс {{{advance}}}%, далее — оплата по этапам согласно графику.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права на результат</div>
  <p class="mb-4 text-justify">3.1. {{{rights}}}.</p>
  <p class="mb-4 text-justify">3.2. Исполнитель вправе использовать наработки и библиотеки общего назначения, созданные до договора.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Гарантии и поддержка</div>
  <p class="mb-4 text-justify">4.1. Гарантийная поддержка после релиза — {{{support}}} месяцев: устранение ошибок бесплатно.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку сдачи этапов Исполнитель уплачивает пени 0,1% в день от стоимости этапа.</p>

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
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "api-integration",
    name: "Договор интеграции программных продуктов (API)",
    category: "business",
    actSource: "гл. 37, 39 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор на интеграцию API: подключение CRM, 1С, платёжных систем, маркетплейсов и внешних сервисов к информационным системам.",
    suggestedDocs: ["it-development","act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Компания-интегратор", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН интегратора", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес интегратора", type: "text", defaultValue: "", category: "contractor" },
      { id: "systems", label: "Интегрируемые системы", type: "textarea", defaultValue: "", category: "object", validation: { required: true } },
      { id: "works_list", label: "Состав работ", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "price", label: "Стоимость (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "price_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "deadline", label: "Срок выполнения (дата)", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "hosting", label: "Размещение сервиса", type: "text", defaultValue: "", category: "contract" },
      { id: "support_days", label: "Бесплатная поддержка после сдачи (дней)", type: "number", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор на выполнение работ по интеграции</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется выполнить интеграцию систем: {{{systems}}}.</p>
  <p class="mb-4 text-justify">1.2. Состав работ: {{{works_list}}}.</p>
  <p class="mb-4 text-justify">1.3. Размещение сервиса: {{{hosting}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость работ составляет <strong>{{{price}}} ({{{price_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Аванс 50% при подписании, остаток — после приёмки работ.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок сдачи-приёмки</div>
  <p class="mb-4 text-justify">3.1. Работы сдаются по акту после успешного тестирования на тестовом контуре и демонстрации Заказчику.</p>
  <p class="mb-4 text-justify">3.2. После сдачи — {{{support_days}}} дней бесплатной поддержки.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. Срок выполнения: {{{deadline}}}. За просрочку — пени 0,1% в день от стоимости работ.</p>
  <p class="mb-4 text-justify">4.2. Исполнитель не отвечает за сбои сторонних сервисов (платёжных шлюзов, маркетплейсов).</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "distributor-agreement",
    name: "Дистрибьюторский договор",
    category: "business",
    actSource: "гл. 49, 51 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Дистрибьюторский договор: поставщик передаёт дистрибьютору право продажи товара на определённой территории с квотами закупок.",
    suggestedDocs: ["supply-contract","agency-contract"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "supplier_company", label: "Компания поставщика", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "supplier_inn", label: "ИНН поставщика", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "supplier_addr", label: "Юр. адрес поставщика", type: "text", defaultValue: "", category: "business" },
      { id: "distributor_company", label: "Компания дистрибьютора", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "distributor_inn", label: "ИНН дистрибьютора", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "distributor_addr", label: "Юр. адрес дистрибьютора", type: "text", defaultValue: "", category: "business" },
      { id: "products", label: "Товары", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "territory", label: "Территория", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "quota", label: "Годовая квота закупок (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "discount", label: "Дисконт дистрибьютора (%)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "exclusive", label: "Эксклюзивность", type: "select", defaultValue: "неэксклюзивный", category: "contract", options: [ { label: "Эксклюзивный", value: "эксклюзивный" }, { label: "Неэксклюзивный", value: "неэксклюзивный" } ] },
      { id: "min_order", label: "Минимальный заказ (руб.)", type: "number", defaultValue: "", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Дистрибьюторский договор</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{supplier_company}}}</strong> (ИНН {{{supplier_inn}}}, адрес: {{{supplier_addr}}}), именуемое в дальнейшем «Поставщик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{distributor_company}}}</strong> (ИНН {{{distributor_inn}}}, адрес: {{{distributor_addr}}}), именуемое в дальнейшем «Дистрибьютор», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Поставщик обязуется передавать Дистрибьютору товары: {{{products}}}, для продажи на территории: {{{territory}}}.</p>
  <p class="mb-4 text-justify">1.2. Договор является {{{exclusive}}}.</p>
  <p class="mb-4 text-justify">1.3. Дистрибьютор закупает товары по дисконту {{{discount}}}% от рекомендуемой розничной цены.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия закупок</div>
  <p class="mb-4 text-justify">2.1. Минимальный заказ: {{{min_order}}} рублей.</p>
  <p class="mb-4 text-justify">2.2. Годовая квота закупок: {{{quota}}} рублей.</p>
  <p class="mb-4 text-justify">2.3. Условия поставки и оплаты указываются в спецификациях к настоящему договору.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности дистрибьютора</div>
  <p class="mb-4 text-justify">3.1. Продвигать товары на территории, поддерживать складской запас, соблюдать ценовую политику.</p>
  <p class="mb-4 text-justify">3.2. Не продавать товары за пределами территории без согласия Поставщика.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности поставщика</div>
  <p class="mb-4 text-justify">4.1. Поставлять товары надлежащего качества, предоставлять маркетинговую поддержку, обеспечивать рекламные материалы.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. При невыполнении квоты Поставщик вправе пересмотреть условия дисконта.</p>
  <p class="mb-4 text-justify">5.2. Договор действует до {{{term_end}}} и может быть пролонгирован.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Поставщик:</div>
      <p class="mb-1"><strong>{{{supplier_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{supplier_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{supplier_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Дистрибьютор:</div>
      <p class="mb-1"><strong>{{{distributor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{distributor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{distributor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "exclusive-dealer",
    name: "Договор эксклюзивного дилера",
    category: "business",
    actSource: "гл. 49 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор с эксклюзивным дилером: продажа продукции под товарным знаком производителя на исключительной основе на территории.",
    suggestedDocs: ["distributor-agreement","supply-contract"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "manufacturer_company", label: "Компания производителя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "manufacturer_inn", label: "ИНН производителя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "manufacturer_addr", label: "Юр. адрес производителя", type: "text", defaultValue: "", category: "business" },
      { id: "dealer_company", label: "Компания дилера", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "dealer_inn", label: "ИНН дилера", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "dealer_addr", label: "Юр. адрес дилера", type: "text", defaultValue: "", category: "business" },
      { id: "products", label: "Продукция", type: "text", defaultValue: "", category: "items", validation: { required: true } },
      { id: "territory", label: "Территория", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "status", label: "Статус дилера", type: "text", defaultValue: "", category: "contract" },
      { id: "target", label: "Объём закупок в год (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "discount", label: "Дилерская скидка (%)", type: "number", defaultValue: "", category: "payment" },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "standards", label: "Требования к дилеру", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор эксклюзивного дилера</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{manufacturer_company}}}</strong> (ИНН {{{manufacturer_inn}}}, адрес: {{{manufacturer_addr}}}), именуемое в дальнейшем «Производитель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{dealer_company}}}</strong> (ИНН {{{dealer_inn}}}, адрес: {{{dealer_addr}}}), именуемое в дальнейшем «Дилер», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Производитель предоставляет Дилеру {{{status}}} право продажи продукции: {{{products}}}, на территории: {{{territory}}}.</p>
  <p class="mb-4 text-justify">1.2. Дилерская скидка: {{{discount}}}% от прайса производителя.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Объёмы и квоты</div>
  <p class="mb-4 text-justify">2.1. Годовой объём закупок: {{{target}}} рублей.</p>
  <p class="mb-4 text-justify">2.2. При невыполнении объёма в течение 2 кварталов подряд Производитель вправе прекратить эксклюзивный статус.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности дилера</div>
  <p class="mb-4 text-justify">3.1. Соблюдать требования: {{{standards}}}.</p>
  <p class="mb-4 text-justify">3.2. Использовать фирменный стиль производителя, участвовать в выставках, вести активные продажи.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Обязанности производителя</div>
  <p class="mb-4 text-justify">4.1. Поставлять продукцию надлежащего качества, обучать персонал дилера, обеспечивать рекламной продукцией.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. Договор действует до {{{term_end}}}. За нарушение условий виновная сторона возмещает убытки.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Производитель:</div>
      <p class="mb-1"><strong>{{{manufacturer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{manufacturer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{manufacturer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Дилер:</div>
      <p class="mb-1"><strong>{{{dealer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{dealer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{dealer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "logistics-contract",
    name: "Договор логистических услуг",
    category: "business",
    actSource: "гл. 39, 41 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор комплексного логистического обслуживания: складирование, обработка, доставка грузов, управление запасами.",
    suggestedDocs: ["warehouse-storage","transport-expedition","act-services"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "customer_company", label: "Компания заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_inn", label: "ИНН заказчика", type: "text", defaultValue: "", category: "customer", validation: { required: true } },
      { id: "customer_addr", label: "Юр. адрес заказчика", type: "text", defaultValue: "", category: "customer" },
      { id: "executor_company", label: "Логистический оператор", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_inn", label: "ИНН оператора", type: "text", defaultValue: "", category: "contractor", validation: { required: true } },
      { id: "executor_addr", label: "Юр. адрес оператора", type: "text", defaultValue: "", category: "contractor" },
      { id: "services_list", label: "Перечень услуг", type: "textarea", defaultValue: "", category: "items", validation: { required: true } },
      { id: "monthly_fee", label: "Стоимость в месяц (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "fee_words", label: "Стоимость прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "term_end", label: "Срок договора (дата)", type: "date", defaultValue: "", category: "contract" },
      { id: "pay_day", label: "День оплаты (число)", type: "number", defaultValue: "", category: "payment" },
      { id: "reporting", label: "Отчётность", type: "text", defaultValue: "", category: "contract" },
      { id: "insurance", label: "Страхование груза", type: "text", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор оказания логистических услуг</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{customer_company}}}</strong> (ИНН {{{customer_inn}}}, адрес: {{{customer_addr}}}), именуемое в дальнейшем «Заказчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{executor_company}}}</strong> (ИНН {{{executor_inn}}}, адрес: {{{executor_addr}}}), именуемое в дальнейшем «Исполнитель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Исполнитель обязуется оказывать логистические услуги: {{{services_list}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{insurance}}}.</p>
  <p class="mb-4 text-justify">1.3. Отчётность: {{{reporting}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Стоимость и порядок расчётов</div>
  <p class="mb-4 text-justify">2.1. Стоимость услуг составляет <strong>{{{monthly_fee}}} ({{{fee_words}}}) рублей</strong> в месяц.</p>
  <p class="mb-4 text-justify">2.2. Оплата вносится до {{{pay_day}}} числа месяца, следующего за отчётным.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Исполнитель обязуется обеспечить сохранность товара, соблюдать требования к хранению, своевременно обрабатывать заказы.</p>
  <p class="mb-4 text-justify">3.2. Заказчик обязуется предоставлять достоверные данные о товаре и оплачивать услуги.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. За утрату или повреждение товара Исполнитель возмещает стоимость в соответствии с актом.</p>
  <p class="mb-4 text-justify">4.2. Договор действует до {{{term_end}}}.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заказчик:</div>
      <p class="mb-1"><strong>{{{customer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{customer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{customer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Исполнитель:</div>
      <p class="mb-1"><strong>{{{executor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{executor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{executor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "financial-lease",
    name: "Договор финансовой аренды (лизинга) оборудования",
    category: "business",
    actSource: "ФЗ-164 «О финансовой аренде (лизинге)», ст. 665-670 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор лизинга: лизингодатель приобретает оборудование у продавца и передаёт лизингополучателю во временное владение с правом выкупа.",
    suggestedDocs: ["equipment-rental","goods-sale"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "", category: "contract", validation: { required: true } },
      { id: "lessor_company", label: "Компания лизингодателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН лизингодателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessor_addr", label: "Юр. адрес лизингодателя", type: "text", defaultValue: "", category: "business" },
      { id: "lessee_company", label: "Компания лизингополучателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessee_inn", label: "ИНН лизингополучателя", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "lessee_addr", label: "Юр. адрес лизингополучателя", type: "text", defaultValue: "", category: "business" },
      { id: "supplier", label: "Продавец оборудования", type: "text", defaultValue: "", category: "business", validation: { required: true } },
      { id: "equipment_desc", label: "Предмет лизинга", type: "text", defaultValue: "", category: "object", validation: { required: true } },
      { id: "equipment_price", label: "Стоимость оборудования (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "advance", label: "Авансовый платёж (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "monthly_pay", label: "Ежемесячный платёж (руб.)", type: "number", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "pay_words", label: "Платёж прописью", type: "text", defaultValue: "", category: "payment", validation: { required: true } },
      { id: "lease_term", label: "Срок лизинга (месяцев)", type: "number", defaultValue: "", category: "contract" },
      { id: "buyout_price", label: "Выкупная стоимость (руб.)", type: "number", defaultValue: "", category: "payment" },
      { id: "delivery_term", label: "Срок поставки (дата)", type: "date", defaultValue: "", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор финансовой аренды (лизинга)</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_company}}}</strong> (ИНН {{{lessor_inn}}}, адрес: {{{lessor_addr}}}), именуемое в дальнейшем «Лизингодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{lessee_company}}}</strong> (ИНН {{{lessee_inn}}}, адрес: {{{lessee_addr}}}), именуемое в дальнейшем «Лизингополучатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Лизингодатель обязуется приобрести у продавца {{{supplier}}} и передать Лизингополучателю во временное владение и пользование имущество: {{{equipment_desc}}}, стоимостью <strong>{{{equipment_price}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. Срок поставки: {{{delivery_term}}}.</p>
  <p class="mb-4 text-justify">1.3. По окончании договора Лизингополучатель вправе выкупить имущество за {{{buyout_price}}} рублей.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Лизинговые платежи</div>
  <p class="mb-4 text-justify">2.1. Авансовый платёж: <strong>{{{advance}}} рублей</strong>.</p>
  <p class="mb-4 text-justify">2.2. Ежемесячный лизинговый платёж: <strong>{{{monthly_pay}}} ({{{pay_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">2.3. Срок лизинга: {{{lease_term}}} месяцев.</p>
  <p class="mb-4 text-justify">2.4. Платежи вносятся ежемесячно до 10 числа текущего месяца.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Лизингодатель приобретает имущество и передаёт его Лизингополучателю в состоянии, соответствующем условиям договора.</p>
  <p class="mb-4 text-justify">3.2. Лизингополучатель принимает имущество, вносит платежи, несёт расходы по эксплуатации и страхованию имущества.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Право собственности</div>
  <p class="mb-4 text-justify">4.1. Имущество является собственностью Лизингодателя до полной выплаты выкупной стоимости.</p>
  <p class="mb-4 text-justify">4.2. После уплаты всех платежей и выкупной стоимости право собственности переходит к Лизингополучателю.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">5. Ответственность сторон</div>
  <p class="mb-4 text-justify">5.1. За просрочку лизинговых платежей Лизингополучатель уплачивает пени 0,1% в день от суммы задолженности.</p>
  <p class="mb-4 text-justify">5.2. Лизингодатель отвечает за выбор продавца, если выбор был поручен ему (ст. 665 ГК РФ).</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Форс-мажор</div>
  <p class="mb-4 text-justify">6.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">6.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">6.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">7. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">7.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">7.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Лизингодатель:</div>
      <p class="mb-1"><strong>{{{lessor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{lessor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Лизингополучатель:</div>
      <p class="mb-1"><strong>{{{lessee_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{lessee_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lessee_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  }
];
