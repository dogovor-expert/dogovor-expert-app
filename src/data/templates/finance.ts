import type { LegalTemplate } from "../types";

export const TEMPLATES_FINANCE: LegalTemplate[] = [
{
    id: "raspiska-money",
    name: "Расписка в получении денежных средств",
    category: "finance",
    actSource: "ст. 162 Гражданского кодекса РФ",
    lastUpdated: "Февраль 2026",
    description:
      "Официальное письменное подтверждение того, что Продавец принял от Покупателя полную стоимость автомобиля.",
    suggestedDocs: ["dkp-auto"],
    supportsOcr: true,
    printInstruction: "Печатать на одном листе А4",
    fields: [
      {
        id: "city",
        label: "Город составления",
        type: "text",
        defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date",
        label: "Дата расписки",
        type: "date",
        defaultValue: "2026-05-27",
        category: "contract",
      },
      {
        id: "seller_fio",
        label: "ФИО Продавца",
        type: "text",
        defaultValue: "Иванов Петр Сергеевич",
        category: "seller",
      },
      {
        id: "seller_passport",
        label: "Паспорт продавца",
        type: "text",
        defaultValue:
          "серия 4512 № 348912, выдан Отделом УФМС России по г. Москве",
        category: "seller",
      },
      {
        id: "buyer_fio",
        label: "ФИО Покупателя",
        type: "text",
        defaultValue: "Смирнов Алексей Викторович",
        category: "buyer",
      },
      {
        id: "buyer_passport",
        label: "Паспорт покупателя",
        type: "text",
        defaultValue:
          "серия 4615 № 887213, выдан ГУ МВД по Московской области",
        category: "buyer",
      },
      {
        id: "car_brand",
        label: "Марка и модель ТС",
        type: "text",
        defaultValue: "Hyundai Solaris",
        category: "vehicle",
      },
      {
        id: "contract_price",
        label: "Сумма (руб.)",
        type: "number",
        defaultValue: "950000",
        category: "contract",
      },
      {
        id: "contract_price_words",
        label: "Сумма прописью",
        type: "text",
        defaultValue: "Девятьсот пятьдесят тысяч рублей",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Расписка в получении денежных средств</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, гражданин <strong>{{{seller_fio}}}</strong>, паспорт {{{seller_passport}}}, настоящей распиской подтверждаю, что получил от гражданина <strong>{{{buyer_fio}}}</strong>, паспорт {{{buyer_passport}}}, денежную сумму в размере:
  </p>
  <p class="text-center font-bold text-black border-y border-zinc-300 py-3 my-4 text-base">
    {{{contract_price}}} рублей ({{{contract_price_words}}})
  </p>
  <p class="mb-4 text-justify">
    Указанная сумма выплачена мне наличными денежными средствами в полном объеме в качестве окончательного платежа за проданное транспортное средство <strong>{{{car_brand}}}</strong> в соответствии с подписанным Договором купли-продажи ТС от «{{{date}}}»
  </p>
  <div class="font-bold mt-12 text-xs text-right">
    <p>Продавец:</p>
    <div class="mt-8 border-b border-zinc-950 w-64 inline-block h-5"></div>
  </div>
</div>`,
  },
{
    id: "raspiska-generic",
    name: "Расписка универсальная (о получении денег/товара/документов)",
    category: "finance",
    actSource: "ст. 162 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Универсальная расписка для подтверждения получения денежных средств, товаров или документов.",
    suggestedDocs: ["dkp-auto"],
    printInstruction: "Печатать на одном листе А4",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата расписки", type: "date", defaultValue: "2026-06-15",
        category: "contract",
      },
      {
        id: "recipient_fio", label: "ФИО получателя (пишет расписку)", type: "text",
        defaultValue: "Иванов Петр Сергеевич", category: "recipient", validation: { required: true },
      },
      {
        id: "recipient_passport", label: "Паспорт получателя", type: "text",
        defaultValue: "серия 4512 № 348912, выдан ГУ МВД по г. Москве",
        category: "recipient",
      },
      {
        id: "sender_fio", label: "ФИО того, кто передаёт", type: "text",
        defaultValue: "Смирнов Алексей Викторович", category: "sender", validation: { required: true },
      },
      {
        id: "sender_passport", label: "Паспорт того, кто передаёт", type: "text",
        defaultValue: "серия 4615 № 887213, выдан ГУ МВД по Московской области",
        category: "sender",
      },
      {
        id: "receipt_type", label: "Тип расписки", type: "radio", defaultValue: "Денежные средства",
        category: "contract",
        options: [
          { label: "Денежные средства", value: "Денежные средства" },
          { label: "Товар", value: "Товар" },
          { label: "Документы", value: "Документы" },
        ],
      },
      {
        id: "amount", label: "Сумма (руб.)", type: "number", defaultValue: "50000",
        category: "contract",
      },
      {
        id: "amount_words", label: "Сумма прописью", type: "text", defaultValue: "Пятьдесят тысяч рублей",
        category: "contract",
      },
      {
        id: "purpose", label: "Цель передачи", type: "text",
        defaultValue: "в качестве предоплаты за автомобиль", category: "contract",
      },
      {
        id: "dkp_reference", label: "Ссылка на ДКП (если есть)", type: "text", defaultValue: "",
        category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Расписка</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{recipient_fio}}}</strong>, паспорт {{{recipient_passport}}}, настоящей распиской подтверждаю получение от <strong>{{{sender_fio}}}</strong>, паспорт {{{sender_passport}}}, {{{receipt_type}}} в размере/количестве:
  </p>
  <p class="text-center font-bold text-black border-y border-zinc-300 py-3 my-4 text-base">
    {{{amount}}} руб. ({{{amount_words}}})
  </p>
  <p class="mb-4 text-justify">Вышеуказанная сумма получена мной {{{purpose}}} {{{#dkp_reference}}}по договору {{{dkp_reference}}}{{{/dkp_reference}}}.</p>
  <p class="mb-4 text-justify">Претензий к {{{sender_fio}}} не имею.</p>
  <div class="flex justify-end mt-12 text-xs">
    <div class="text-right">
      <div class="border-b border-zinc-950 w-64 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">Подпись / ФИО получателя</p>
    </div>
  </div>
</div>`,
  },
{
    id: "invoice",
    name: "Счёт на оплату",
    category: "finance",
    actSource: "ст. 487 ГК РФ, НК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Счёт на оплату товаров или услуг для юридических и физических лиц. Автоматически формирует таблицу позиций.",
    suggestedDocs: [],
    printInstruction: "Печатать на бланке организации при наличии",
    fields: [
      {
        id: "invoice_number", label: "Номер счёта", type: "text", defaultValue: "001",
        category: "invoice", validation: { required: true },
      },
      {
        id: "date", label: "Дата счёта", type: "date", defaultValue: "2026-06-15",
        category: "invoice", validation: { required: true },
      },
      {
        id: "seller_company", label: "Наименование продавца", type: "text",
        defaultValue: 'ООО "Рога и Копыта"', category: "seller", validation: { required: true },
      },
      {
        id: "seller_inn", label: "ИНН продавца", type: "text", defaultValue: "7701234567",
        category: "seller", validation: { minLength: 10, maxLength: 12 },
      },
      {
        id: "seller_kpp", label: "КПП продавца", type: "text", defaultValue: "770101001",
        category: "seller",
      },
      {
        id: "seller_address", label: "Адрес продавца", type: "text",
        defaultValue: "123456, г. Москва, ул. Ленина, д. 1", category: "seller",
      },
      {
        id: "seller_bank", label: "Банк продавца", type: "text",
        defaultValue: "ПАО Сбербанк", category: "seller",
      },
      {
        id: "seller_bik", label: "БИК", type: "text", defaultValue: "044525225",
        category: "seller",
      },
      {
        id: "seller_account", label: "Р/с продавца", type: "text",
        defaultValue: "40702810138000012345", category: "seller",
      },
      {
        id: "seller_corr_account", label: "К/с продавца", type: "text",
        defaultValue: "30101810400000000225", category: "seller",
      },
      {
        id: "buyer_fio", label: "Наименование покупателя", type: "text",
        defaultValue: "ИП Иванов И.И.", category: "buyer", validation: { required: true },
      },
      {
        id: "buyer_inn", label: "ИНН покупателя", type: "text", defaultValue: "770987654321",
        category: "buyer",
      },
      {
        id: "buyer_address", label: "Адрес покупателя", type: "text",
        defaultValue: "123456, г. Москва, ул. Пушкина, д. 10", category: "buyer",
      },
      {
        id: "items", label: "Позиции счёта", type: "repeating", defaultValue: "[]",
        category: "items",
        repeatingFields: [
          { id: "name", label: "Наименование", type: "text", defaultValue: "Услуга", width: "40%" },
          { id: "unit", label: "Ед.", type: "text", defaultValue: "шт", width: "10%" },
          { id: "qty", label: "Кол-во", type: "number", defaultValue: "1", width: "12%" },
          { id: "price", label: "Цена", type: "number", defaultValue: "0", width: "18%" },
          { id: "sum", label: "Сумма", type: "number", defaultValue: "0", width: "20%" },
        ],
      },
      {
        id: "show_nds", label: "Показать НДС", type: "checkbox", defaultValue: "true",
        category: "payment",
      },
      {
        id: "nds_rate", label: "Ставка НДС (%)", type: "select", defaultValue: "20",
        category: "payment",
        options: ["0", "5", "7", "10", "20", "без НДС"],
        dependsOn: { fieldId: "show_nds", value: "true" },
      },
      {
        id: "payment_terms", label: "Условия оплаты", type: "text",
        defaultValue: "Оплата производится в течение 5 банковских дней",
        category: "payment",
      },
      {
        id: "show_qr", label: "Показать QR-код для оплаты", type: "checkbox", defaultValue: "true",
        category: "payment",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Счёт на оплату № {{{invoice_number}}}</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div></div>
    <div>от «{{{date}}}»</div>
  </div>
  <div class="mb-4 text-xs">
    <p class="font-bold mb-1">Поставщик:</p>
    <p>{{{seller_company}}}, ИНН {{{seller_inn}}}, КПП {{{seller_kpp}}}</p>
    <p>{{{seller_address}}}</p>
    <p>Банк: {{{seller_bank}}}, БИК {{{seller_bik}}}</p>
    <p>Р/с {{{seller_account}}}, К/с {{{seller_corr_account}}}</p>
  </div>
  <div class="mb-4 text-xs">
    <p class="font-bold mb-1">Покупатель:</p>
    <p>{{{buyer_fio}}}</p>
    {{{#buyer_inn}}}<p>ИНН: {{{buyer_inn}}}</p>{{{/buyer_inn}}}
    <p>{{{buyer_address}}}</p>
  </div>
  <table class="w-full text-xs border border-zinc-300 mb-4 bg-white" id="invoice-items-table">
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
        <td colspan="5" class="p-2 border border-zinc-300 text-right">ИТОГО:</td>
        <td class="p-2 border border-zinc-300 text-right">{{{invoice_total_pretty}}}</td>
      </tr>
      {{#show_nds}}
      <tr class="bg-zinc-50 font-bold">
        <td colspan="5" class="p-2 border border-zinc-300 text-right">В т.ч. НДС {{{nds_rate}}}%:</td>
        <td class="p-2 border border-zinc-300 text-right">{{{invoice_nds_pretty}}}</td>
      </tr>
      {{/show_nds}}
    </tfoot>
  </table>
  <p class="text-xs mb-8">{{{payment_terms}}}</p>
  <div class="flex justify-between items-end text-xs border-t border-zinc-300 pt-4">
    <div>
      <p>Руководитель / ИП</p>
      <div class="mt-8 border-b border-zinc-950 w-64 h-5 inline-block"></div>
      <span class="text-zinc-400 ml-2">/ {{{seller_company}}} /</span>
    </div>
    {{#show_qr}}
    <div class="text-right" id="qr-placeholder"></div>
    {{/show_qr}}
  </div>
</div>`,
  },
{
    id: "loan-agreement",
    name: "Договор займа денежных средств",
    category: "finance",
    actSource: "ст. 807–811 ГК РФ",
    lastUpdated: "Июнь 2026",
    description:
      "Договор займа между физическими лицами. При сумме более 100 000 руб. рекомендуется нотариальное заверение.",
    suggestedDocs: ["raspiska-generic"],
    printInstruction: "Печатать в 2-х экземплярах",
    fields: [
      {
        id: "city", label: "Город составления", type: "text", defaultValue: "Москва",
        category: "contract",
      },
      {
        id: "date", label: "Дата договора", type: "date", defaultValue: "2026-06-15",
        category: "contract",
      },
      {
        id: "lender_fio", label: "ФИО Заимодавца", type: "text", defaultValue: "Смирнов Алексей Викторович",
        category: "lender", validation: { required: true },
      },
      {
        id: "lender_passport", label: "Паспорт Заимодавца", type: "text",
        defaultValue: "серия 4615 № 887213", category: "lender",
      },
      {
        id: "lender_address", label: "Адрес Заимодавца", type: "text",
        defaultValue: "Московская обл., г. Химки", category: "lender",
      },
      {
        id: "borrower_fio", label: "ФИО Заёмщика", type: "text", defaultValue: "Иванов Петр Сергеевич",
        category: "borrower", validation: { required: true },
      },
      {
        id: "borrower_passport", label: "Паспорт Заёмщика", type: "text",
        defaultValue: "серия 4512 № 348912", category: "borrower",
      },
      {
        id: "borrower_address", label: "Адрес Заёмщика", type: "text",
        defaultValue: "г. Москва, ул. Ленина, д. 12", category: "borrower",
      },
      {
        id: "loan_amount", label: "Сумма займа (руб.)", type: "number", defaultValue: "500000",
        category: "contract", validation: { required: true },
      },
      {
        id: "loan_amount_words", label: "Сумма прописью", type: "text",
        defaultValue: "Пятьсот тысяч рублей", category: "contract",
      },
      {
        id: "interest_rate", label: "Процентная ставка (% годовых)", type: "number", defaultValue: "0",
        category: "contract",
      },
      {
        id: "loan_start", label: "Дата выдачи", type: "date", defaultValue: "2026-06-15",
        category: "contract",
      },
      {
        id: "loan_end", label: "Дата возврата", type: "date", defaultValue: "2026-12-15",
        category: "contract", validation: { required: true },
      },
      {
        id: "payment_schedule", label: "Порядок возврата", type: "select", defaultValue: "единовременно",
        category: "contract",
        options: [
          { label: "Единовременно", value: "единовременно" },
          { label: "Ежемесячными платежами", value: "ежемесячными платежами" },
        ],
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа денежных средств</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong>, паспорт {{{lender_passport}}}, зарегистрированный по адресу: {{{lender_address}}}, именуемый «Заимодавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{borrower_fio}}}</strong>, паспорт {{{borrower_passport}}}, зарегистрированный по адресу: {{{borrower_address}}}, именуемый «Заёмщик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Заимодавец передаёт, а Заёмщик принимает денежные средства в размере <strong>{{{loan_amount}}} руб.</strong> (прописью: {{{loan_amount_words}}}) и обязуется вернуть их в срок до «{{{loan_end}}}»
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Проценты</div>
  <p class="mb-4 text-justify">
    2.1. Процентная ставка составляет <strong>{{{interest_rate}}}% годовых</strong>.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Порядок возврата</div>
  <p class="mb-4 text-justify">
    3.1. Возврат осуществляется {{{payment_schedule}}}.
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
      <div class="font-bold mb-2">Заимодавец:</div>
      <p><strong>{{{lender_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lender_passport}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-2">Заёмщик:</div>
      <p><strong>{{{borrower_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{borrower_passport}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "loan-company",
    name: "Договор займа между организациями",
    category: "finance",
    actSource: "ст. 807–818 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Договор займа между юридическими лицами с процентами или на беспроцентной основе.",
    suggestedDocs: ["invoice", "guarantee-agreement"],
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
        id: "lender_company", label: "Наименование Заимодавца", type: "text",
        defaultValue: 'АО "ФинансГарант"', category: "lender", validation: { required: true },
      },
      {
        id: "lender_inn", label: "ИНН Заимодавца", type: "text", defaultValue: "7701112223",
        category: "lender",
      },
      {
        id: "lender_director", label: "Директор Заимодавца", type: "text",
        defaultValue: "Петров П.П.", category: "lender",
      },
      {
        id: "borrower_company", label: "Наименование Заёмщика", type: "text",
        defaultValue: 'ООО "СтройИнвест"', category: "borrower", validation: { required: true },
      },
      {
        id: "borrower_inn", label: "ИНН Заёмщика", type: "text", defaultValue: "7703334445",
        category: "borrower",
      },
      {
        id: "borrower_director", label: "Директор Заёмщика", type: "text",
        defaultValue: "Иванов И.И.", category: "borrower",
      },
      {
        id: "loan_amount", label: "Сумма займа (руб.)", type: "number", defaultValue: "1500000",
        category: "payment", validation: { required: true },
      },
      {
        id: "loan_term_months", label: "Срок возврата (мес.)", type: "number", defaultValue: "12",
        category: "contract",
      },
      {
        id: "interest_mode", label: "Проценты", type: "select",
        options: [
          { label: "Процентный заём (ключевая ставка ЦБ)", value: "Процентный заём (ключевая ставка ЦБ)" },
          { label: "Беспроцентный заём", value: "Беспроцентный заём" },
          { label: "Фиксированный процент (указать ниже)", value: "Фиксированный процент (указать ниже)" },
        ],
        defaultValue: "Процентный заём (ключевая ставка ЦБ)", category: "payment",
      },
      {
        id: "interest_rate", label: "Ставка % годовых (если фикс.)", type: "number", defaultValue: "8",
        category: "payment",
        dependsOn: { fieldId: "interest_mode", value: "Фиксированный процент (указать ниже)" },
      },
      {
        id: "repayment_schedule", label: "График возврата", type: "select",
        options: [
          { label: "Единовременно в конце срока", value: "Единовременно в конце срока" },
          { label: "Ежемесячными платежами", value: "Ежемесячными платежами" },
        ],
        defaultValue: "Единовременно в конце срока", category: "payment",
      },
      {
        id: "purpose", label: "Цель займа", type: "text",
        defaultValue: "Пополнение оборотных средств", category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{lender_company}}}</strong>, ИНН {{{lender_inn}}}, в лице директора {{{lender_director}}}, именуемый «Заимодавец», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{borrower_company}}}</strong>, ИНН {{{borrower_inn}}}, в лице директора {{{borrower_director}}}, именуемый «Заёмщик», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Заимодавец передаёт Заёмщику денежные средства в размере <strong>{{{loan_amount}}} руб.</strong> ({{{loan_amount_words}}}), а Заёмщик обязуется возвратить сумму займа и уплатить проценты в срок, установленный договором.
  </p>
  <p class="mb-4 text-justify">1.2. Цель займа: {{{purpose}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Проценты и порядок возврата</div>
  <p class="mb-4 text-justify">
    2.1. {{{interest_mode}}}; ставка — {{{interest_rate}}}% годовых.
  </p>
  <p class="mb-4 text-justify">
    2.2. Срок возврата: {{{loan_term_months}}} месяцев. Порядок возврата: {{{repayment_schedule}}}.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">
    3.1. При просрочке возврата Заёмщик уплачивает неустойку 0,1% от суммы задолженности за каждый день просрочки.
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
      <div class="font-bold mb-1">Заимодавец:</div>
      <p><strong>{{{lender_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Заёмщик:</div>
      <p><strong>{{{borrower_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "guarantee-agreement",
    name: "Договор поручительства",
    category: "finance",
    actSource: "ст. 361–367 ГК РФ",
    lastUpdated: "Июль 2026",
    description:
      "Поручитель отвечает перед кредитором за исполнение обязательств заёмщика по договору займа.",
    suggestedDocs: ["loan-agreement", "loan-company"],
    printInstruction: "Печатать в 3-х экземплярах",
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
        id: "creditor_company", label: "Наименование Кредитора", type: "text",
        defaultValue: 'АО "ФинансГарант"', category: "lender", validation: { required: true },
      },
      {
        id: "creditor_inn", label: "ИНН Кредитора", type: "text", defaultValue: "7701112223",
        category: "lender",
      },
      {
        id: "creditor_director", label: "Директор Кредитора", type: "text",
        defaultValue: "Петров П.П.", category: "lender",
      },
      {
        id: "debtor_company", label: "Наименование Заёмщика (должника)", type: "text",
        defaultValue: 'ООО "СтройИнвест"', category: "borrower", validation: { required: true },
      },
      {
        id: "debtor_inn", label: "ИНН Заёмщика", type: "text", defaultValue: "7703334445",
        category: "borrower",
      },
      {
        id: "guarantor_fio", label: "ФИО Поручителя", type: "text",
        defaultValue: "Николаев Николай Николаевич", category: "guarantor", validation: { required: true },
      },
      {
        id: "guarantor_passport", label: "Паспорт Поручителя", type: "text",
        defaultValue: "серия 4510 № 998877", category: "guarantor",
      },
      {
        id: "guarantor_address", label: "Адрес Поручителя", type: "text",
        defaultValue: "г. Москва, ул. Тверская, д. 5", category: "guarantor",
      },
      {
        id: "loan_amount", label: "Сумма обязательства (руб.)", type: "number", defaultValue: "1500000",
        category: "payment", validation: { required: true },
      },
      {
        id: "loan_date", label: "Дата основного договора займа", type: "date", defaultValue: "2026-06-01",
        category: "contract",
      },
      {
        id: "loan_due", label: "Срок исполнения обязательства", type: "date", defaultValue: "2027-06-01",
        category: "contract",
      },
      {
        id: "liability_scope", label: "Объём ответственности", type: "select",
        options: [
          { label: "Солидарная с должником", value: "Солидарная с должником" },
          { label: "Субсидиарная", value: "Субсидиарная" },
        ],
        defaultValue: "Солидарная с должником", category: "contract",
      },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор поручительства</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{creditor_company}}}</strong>, ИНН {{{creditor_inn}}}, в лице директора {{{creditor_director}}}, именуемый «Кредитор», с одной стороны, и
  </p>
  <p class="mb-4 text-justify">
    гражданин <strong>{{{guarantor_fio}}}</strong>, паспорт {{{guarantor_passport}}}, зарегистрированный по адресу: {{{guarantor_address}}}, именуемый «Поручитель», с другой стороны, заключили договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">
    1.1. Поручитель обязуется отвечать перед Кредитором за исполнение <strong>{{{debtor_company}}}</strong> (ИНН {{{debtor_inn}}}) обязательств по договору займа от «{{{loan_date}}}» на сумму <strong>{{{loan_amount}}} руб.</strong> ({{{loan_amount_words}}}) со сроком исполнения до «{{{loan_due}}}».
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Ответственность поручителя</div>
  <p class="mb-4 text-justify">
    2.1. Ответственность Поручителя: {{{liability_scope}}} ответственность с должником. При неисполнении обязательств Кредитор вправе требовать их исполнения от Поручителя.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права поручителя</div>
  <p class="mb-4 text-justify">
    3.1. К Поручителю, исполнившему обязательство, переходят права Кредитора по этому обязательству.
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Срок действия</div>
  <p class="mb-4 text-justify">
    4.1. Поручительство действует до «{{{loan_due}}}». Если Кредитор не предъявит иск в течение года после наступления срока, поручительство прекращается.
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
      <div class="font-bold mb-1">Кредитор:</div>
      <p><strong>{{{creditor_company}}}</strong></p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
    <div>
      <div class="font-bold mb-1">Поручитель:</div>
      <p>{{{guarantor_fio}}}</p>
      <div class="mt-8 border-b border-zinc-950 w-44 h-5"></div>
    </div>
  </div>
</div>`,
  },
{
    id: "credit-agreement",
    name: "Кредитный договор (заёмщик — физлицо)",
    category: "finance",
    actSource: "ст. 819-821 ГК РФ, ФЗ-353 «О потребительском кредите»",
    lastUpdated: "Август 2026",
    description: "Кредитный договор между банком (кредитором) и физическим лицом: сумма, ставка, график платежей, полная стоимость кредита.",
    suggestedDocs: ["loan-agreement", "raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Кредитор (банк)", type: "text", defaultValue: "АО «Банк Доверие»", category: "lender", validation: { required: true } },
      { id: "lender_license", label: "Лицензия ЦБ РФ", type: "text", defaultValue: "№ 1234 от 01.01.2000", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "Смирнов Игорь Олегович", category: "borrower", validation: { required: true } },
      { id: "borrower_passport", label: "Паспорт заёмщика", type: "text", defaultValue: "45 10 998877, выдан ОВД «Хорошёвский» г. Москвы", category: "borrower" },
      { id: "credit_amount", label: "Сумма кредита (руб.)", type: "text", defaultValue: "1000000", category: "payment", validation: { required: true } },
      { id: "credit_rate", label: "Процентная ставка (% годовых)", type: "text", defaultValue: "18,5", category: "contract" },
      { id: "credit_term", label: "Срок (мес.)", type: "text", defaultValue: "60", category: "contract" },
      { id: "credit_purpose", label: "Цель кредита", type: "text", defaultValue: "на потребительские нужды", category: "contract" },
      { id: "payment_method", label: "Порядок погашения", type: "text", defaultValue: "аннуитетные платежи ежемесячно до 25 числа", category: "payment" },
      { id: "penalty_rate", label: "Неустойка за просрочку (% в день)", type: "text", defaultValue: "0,1", category: "contract" },
      { id: "insurance", label: "Страхование", type: "select", defaultValue: "добровольное", category: "insurance", options: [
        { label: "Обязательное", value: "обязательное" },
        { label: "Добровольное", value: "добровольное" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Кредитный договор</div>
  <p class="mb-4 text-justify">
    <strong>{{{lender_fio}}}</strong> (лицензия ЦБ РФ {{{lender_license}}}), именуемый «Кредитор», с одной стороны, и
    гражданин <strong>{{{borrower_fio}}}</strong> (паспорт {{{borrower_passport}}}), именуемый «Заёмщик», с другой стороны,
    заключили настоящий договор (ст. 819-821 ГК РФ, ФЗ-353 «О потребительском кредите»):
  </p>
  <p class="font-bold mb-2">1. Условия кредита</p>
  <p class="mb-3 text-justify">1.1. Сумма кредита: <strong>{{{credit_amount}} руб.</strong>} ({{{credit_amount_words}}}). Ставка: {{{credit_rate}}}% годовых. Срок: {{{credit_term}}} месяцев. Цель: {{{credit_purpose}}}.</p>
  <p class="font-bold mb-2">2. Порядок погашения</p>
  <p class="mb-3 text-justify">2.1. {{{payment_method}}}. Полная стоимость кредита указана в графике платежей.</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. За просрочку уплачивается неустойка {{{penalty_rate}}}% от просроченной суммы за каждый день (ст. 330, 811 ГК РФ).</p>
  <p class="font-bold mb-2">4. Страхование</p>
  <p class="mb-3 text-justify">4.1. {{{insurance}}}. Заёмщик вправе досрочно вернуть кредит полностью или частично с уведомлением Кредитора.</p>
  
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
      <p class="font-bold mb-1">Кредитор:</p>
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
    id: "percent-loan",
    name: "Договор процентного займа",
    category: "finance",
    actSource: "ст. 807-818 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор займа с процентами между физлицами и/или организациями: ставка, срок, порядок возврата, проценты за просрочку.",
    suggestedDocs: ["loan-contract", "raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Займодавец", type: "text", defaultValue: "Иванов Иван Иванович", category: "lender", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт займодавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик", type: "text", defaultValue: "ООО «Производственная компания»", category: "borrower", validation: { required: true } },
      { id: "borrower_inn", label: "ИНН Заёмщика", type: "text", defaultValue: "7707778899", category: "borrower" },
      { id: "loan_sum", label: "Сумма займа (руб.)", type: "text", defaultValue: "1500000", category: "payment", validation: { required: true } },
      { id: "percent_rate", label: "Проценты (% годовых)", type: "text", defaultValue: "15", category: "contract", validation: { required: true } },
      { id: "return_date", label: "Дата возврата", type: "date", defaultValue: "2027-08-10", category: "contract" },
      { id: "transfer_method", label: "Способ передачи", type: "text", defaultValue: "перечисление на расчётный счёт", category: "contract" },
      { id: "interest_payment", label: "Порядок уплаты процентов", type: "text", defaultValue: "ежемесячно, не позднее 10 числа", category: "payment" },
      { id: "penalty_rate", label: "Неустойка за просрочку (% в день)", type: "text", defaultValue: "0,1", category: "contract" },
      { id: "early_return", label: "Досрочный возврат", type: "select", defaultValue: "допускается с согласия займодавца", category: "contract", options: [
        { label: "Допускается", value: "допускается" },
        { label: "Допускается с согласия займодавца", value: "допускается с согласия займодавца" },
        { label: "Запрещён", value: "запрещён" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор процентного займа</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong> (паспорт {{{lender_passport}}}), именуемый «Займодавец», с одной стороны, и
    <strong>{{{borrower_fio}}}</strong> (ИНН {{{borrower_inn}}}), именуемый «Заёмщик», с другой стороны,
    заключили настоящий договор (ст. 807-818 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Займодавец передаёт Заёмщику денежные средства в размере <strong>{{{loan_sum}} руб.</strong>} ({{{loan_sum_words}}}), а Заёмщик обязуется возвратить сумму займа и уплатить проценты в срок до «{{{return_date}}}».</p>
  <p class="mb-3 text-justify">1.2. Передача денег осуществляется {{{transfer_method}}}.</p>
  <p class="font-bold mb-2">2. Проценты</p>
  <p class="mb-3 text-justify">2.1. За пользование займом уплачиваются проценты в размере {{{percent_rate}}}% годовых (ст. 809 ГК РФ). {{{#interest_payment}}}Проценты уплачиваются: {{{interest_payment}}}.{{{/interest_payment}}}</p>
  <p class="font-bold mb-2">3. Ответственность</p>
  <p class="mb-3 text-justify">3.1. При просрочке возврата начисляется неустойка {{{penalty_rate}}}% от невозвращённой суммы за каждый день просрочки (ст. 811 ГК РФ).</p>
  <p class="font-bold mb-2">4. Досрочный возврат</p>
  <p class="mb-3 text-justify">4.1. Досрочный возврат: {{{early_return}}}.</p>
  
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
    id: "zero-loan",
    name: "Договор беспроцентного займа",
    category: "finance",
    actSource: "ст. 807-818 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Беспроцентный договор займа: возврат без процентов, распространён между родственниками, учредителем и компанией.",
    suggestedDocs: ["loan-contract", "raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Займодавец", type: "text", defaultValue: "Петров Пётр Петрович", category: "lender", validation: { required: true } },
      { id: "borrower_fio", label: "Заёмщик", type: "text", defaultValue: "ООО «Стартап»", category: "borrower", validation: { required: true } },
      { id: "borrower_inn", label: "ИНН Заёмщика", type: "text", defaultValue: "7708889900", category: "borrower" },
      { id: "loan_sum", label: "Сумма займа (руб.)", type: "text", defaultValue: "500000", category: "payment", validation: { required: true } },
      { id: "return_date", label: "Дата возврата", type: "date", defaultValue: "2027-02-10", category: "contract" },
      { id: "transfer_method", label: "Способ передачи", type: "text", defaultValue: "безналичным перечислением на расчётный счёт", category: "contract" },
      { id: "relation", label: "Особые отношения сторон", type: "text", defaultValue: "учредитель — собственная компания", category: "other" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор беспроцентного займа</div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong>, именуемый «Займодавец», с одной стороны, и
    <strong>{{{borrower_fio}}}</strong> (ИНН {{{borrower_inn}}}), именуемый «Заёмщик», с другой стороны,
    заключили настоящий договор (ст. 807-818 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Займодавец передаёт Заёмщику денежные средства в размере <strong>{{{loan_sum}} руб.</strong>} ({{{loan_sum_words}}}) {{{transfer_method}}}, а Заёмщик обязуется возвратить их в срок до «{{{return_date}}}».</p>
  <p class="font-bold mb-2">2. Беспроцентность</p>
  <p class="mb-3 text-justify">2.1. Заём является беспроцентным: проценты за пользование суммой займа не начисляются и не уплачиваются (ст. 809 ГК РФ).</p>
  <p class="font-bold mb-2">3. Особые условия</p>
  <p class="mb-3 text-justify">3.1. {{{relation}}}. Договор вступает в силу с момента передачи денежных средств.</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. При просрочке возврата Займодавец вправе требовать уплаты процентов по ст. 395 ГК РФ.</p>
  
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
    id: "cession-contract",
    name: "Договор уступки права требования (цессии)",
    category: "finance",
    actSource: "ст. 382-390 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор цессии: передача права требования долга от цедента цессионарию с уведомлением должника.",
    suggestedDocs: ["loan-agreement", "raspiska-money"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "cedent_fio", label: "Цедент (кредитор)", type: "text", defaultValue: "ООО «Кредитор»", category: "seller", validation: { required: true } },
      { id: "cedent_inn", label: "ИНН Цедента", type: "text", defaultValue: "7701112223", category: "seller" },
      { id: "cessionary_fio", label: "Цессионарий (новый кредитор)", type: "text", defaultValue: "ООО «Взыскатель»", category: "buyer", validation: { required: true } },
      { id: "cessionary_inn", label: "ИНН Цессионария", type: "text", defaultValue: "7703334445", category: "buyer" },
      { id: "debtor_fio", label: "Должник", type: "text", defaultValue: "ООО «Должник»", category: "borrower", validation: { required: true } },
      { id: "debtor_inn", label: "ИНН Должника", type: "text", defaultValue: "7705556677", category: "borrower" },
      { id: "base_doc", label: "Основание требования", type: "text", defaultValue: "договор займа № 12 от 01.02.2026", category: "contract" },
      { id: "debt_amount", label: "Сумма требования (руб.)", type: "text", defaultValue: "800000", category: "payment", validation: { required: true } },
      { id: "cession_price", label: "Цена уступки (руб.)", type: "text", defaultValue: "700000", category: "payment", validation: { required: true } },
      { id: "notice_debtor", label: "Уведомление должника", type: "text", defaultValue: "направляется цедентом в течение 5 рабочих дней", category: "contract" },
      { id: "rights_scope", label: "Объём передаваемых прав", type: "text", defaultValue: "сумма долга, проценты по ст. 395 ГК РФ, неустойка", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор уступки права требования (цессии)</div>
  <p class="mb-4 text-justify">
    <strong>{{{cedent_fio}}}</strong> (ИНН {{{cedent_inn}}}), именуемый «Цедент», с одной стороны, и
    <strong>{{{cessionary_fio}}}</strong> (ИНН {{{cessionary_inn}}}), именуемый «Цессионарий», с другой стороны,
    заключили настоящий договор (ст. 382-390 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Цедент уступает, а Цессионарий принимает право требования к {{{debtor_fio}}} (ИНН {{{debtor_inn}}}) по {{{base_doc}}} на сумму <strong>{{{debt_amount}} руб.</strong>} ({{{debt_amount_words}}}).</p>
  <p class="mb-3 text-justify">1.2. Передаваемые права включают: {{{rights_scope}}} (ст. 384 ГК РФ).</p>
  <p class="font-bold mb-2">2. Цена уступки</p>
  <p class="mb-3 text-justify">2.1. Цена уступки права требования: <strong>{{{cession_price}} руб.</strong>} ({{{cession_price_words}}}), подлежит уплате в течение 10 рабочих дней.</p>
  <p class="font-bold mb-2">3. Уведомление должника</p>
  <p class="mb-3 text-justify">3.1. {{{notice_debtor}}} (ст. 385 ГК РФ). Должник вправе не исполнять обязательство новому кредитору до получения уведомления.</p>
  <p class="font-bold mb-2">4. Ответственность цедента</p>
  <p class="mb-3 text-justify">4.1. Цедент отвечает за действительность уступаемого требования, но не отвечает за неисполнение должником (ст. 390 ГК РФ).</p>
  
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
      <p class="font-bold mb-1">Цедент:</p>
      <p class="mb-6">{{{cedent_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Цессионарий:</p>
      <p class="mb-6">{{{cessionary_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "money-return-receipt",
    name: "Расписка о возврате денежных средств",
    category: "finance",
    actSource: "ст. 408, 810 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Расписка займодавца о получении денежных средств в счёт возврата долга: подтверждение исполнения обязательства.",
    suggestedDocs: ["raspiska-money", "loan-contract"],
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Займодавец (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "lender", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт займодавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "borrower", validation: { required: true } },
      { id: "return_sum", label: "Сумма возврата (руб.)", type: "text", defaultValue: "300000", category: "payment", validation: { required: true } },
      { id: "base_doc", label: "Основание (договор/расписка)", type: "text", defaultValue: "договор займа от 10.02.2026", category: "contract" },
      { id: "return_method", label: "Способ передачи", type: "text", defaultValue: "наличными", category: "contract" },
      { id: "interest_returned", label: "Проценты возвращены", type: "select", defaultValue: "да, в полном объёме", category: "contract", options: [
        { label: "Да, в полном объёме", value: "да, в полном объёме" },
        { label: "Нет", value: "нет" },
      ] },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Расписка о возврате денежных средств</div>
  <p class="mb-4 text-justify">
    Я, <strong>{{{lender_fio}}}</strong> (паспорт {{{lender_passport}}}), получил(а) от <strong>{{{borrower_fio}}}</strong>
    денежные средства в размере <strong>{{{return_sum}} руб.</strong>} ({{{return_sum_words}}}) в счёт возврата долга
    по {{{base_doc}}}.
  </p>
  <p class="mb-3 text-justify">
    Денежные средства переданы {{{return_method}}}. {{{#interest_returned}}}Проценты по договору возвращены в полном объёме.{{{/interest_returned}}}
  </p>
  <p class="mb-4 text-justify">
    Претензий к Заёмщику не имею. Обязательства по {{{base_doc}}} считаются исполненными в полном объёме (ст. 408 ГК РФ).
  </p>
  <p class="mb-2 text-justify">
    Настоящая расписка составлена в одном экземпляре, хранится у Заёмщика {{{borrower_fio}}}.
  </p>
  <div class="flex justify-end mt-10 text-xs">
    <div class="text-right w-1/2">
      <p class="font-bold mb-1">Получил(а):</p>
      <p class="mb-6">{{{lender_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "loan-individuals",
    name: "Договор займа между физическими лицами",
    category: "finance",
    actSource: "ст. 807-810 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор займа денежных средств между двумя физическими лицами.",
    suggestedDocs: ["Договор займа", "Расписка в получении денежных средств"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "lender_fio", label: "Займодавец (ФИО)", type: "text", defaultValue: "Иванов Сергей Петрович", category: "lender" },
      { id: "lender_passport", label: "Паспорт займодавца", type: "text", defaultValue: "серия 4509 № 123456, выдан ОВД по г. Москве", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "Петров Иван Сергеевич", category: "borrower" },
      { id: "borrower_passport", label: "Паспорт заёмщика", type: "text", defaultValue: "серия 4510 № 654321, выдан ОВД по г. Москве", category: "borrower" },
      { id: "loan_amount", label: "Сумма займа (руб.)", type: "number", defaultValue: "300000", category: "payment" },
      { id: "loan_term", label: "Срок возврата (мес.)", type: "number", defaultValue: "12", category: "contract" },
      { id: "return_schedule", label: "Порядок возврата", type: "select", defaultValue: "единовременно по истечении срока", options: ["единовременно по истечении срока", "ежемесячными платежами"], category: "contract" },
      { id: "loan_purpose", label: "Цель займа", type: "text", defaultValue: "на личные нужды", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong>, паспорт {{{lender_passport}}}, именуемый в дальнейшем «Займодавец», и гражданин <strong>{{{borrower_fio}}}</strong>, паспорт {{{borrower_passport}}}, именуемый в дальнейшем «Заёмщик», заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Займодавец передаёт Заёмщику денежные средства в размере <strong>{{{loan_amount}}} руб.</strong> ({{{loan_amount_words}}}), на {{{loan_purpose}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Срок и порядок возврата</div>
  <p class="mb-4 text-justify">2.1. Заёмщик обязуется возвратить сумму займа в течение {{{loan_term}}} месяцев, порядок возврата: {{{return_schedule}}} (ст. 810 ГК РФ).</p>
  <p class="mb-4 text-justify">2.2. Заём является беспроцентным, если иное не указано в договоре.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. При просрочке возврата начисляются проценты по ст. 395 ГК РФ.</p>
  
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
      <div class="font-bold mb-2 uppercase text-black">Займодавец:</div>
      <p class="mb-1"><strong>{{{lender_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Заёмщик:</div>
      <p class="mb-1"><strong>{{{borrower_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "refuse-loan-notice",
    name: "Уведомление об отказе от договора займа",
    category: "finance",
    actSource: "ст. 450.1, 810 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Уведомление займодавца об отказе от договора займа (досрочное истребование или отказ).",
    suggestedDocs: ["Договор займа", "Уведомление об отказе от договора (универсальное)"],
    fields: [

      { id: "date", label: "Дата составления", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract" },      { id: "lender_fio", label: "Займодавец (ФИО)", type: "text", defaultValue: "Иванов Сергей Петрович", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "Петров Иван Сергеевич", category: "borrower" },
      { id: "loan_contract", label: "Договор займа (номер, дата)", type: "text", defaultValue: "№ 5 от 01.05.2026", category: "contract" },
      { id: "loan_amount", label: "Сумма займа (руб.)", type: "number", defaultValue: "200000", category: "payment" },
      { id: "return_deadline", label: "Срок возврата", type: "text", defaultValue: "в течение 30 дней с момента получения уведомления", category: "contract" },
      { id: "refuse_reason", label: "Основание", type: "select", defaultValue: "досрочное истребование займа", options: ["досрочное истребование займа", "отказ от договора до передачи суммы"], category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Уведомление об отказе от договора займа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Займодавец <strong>{{{lender_fio}}}</strong> уведомляет Заёмщика <strong>{{{borrower_fio}}}</strong> о следующем (ст. 450.1, 810 ГК РФ):
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Уведомление</div>
  <p class="mb-4 text-justify">1.1. {{{refuse_reason}}} по договору займа {{{loan_contract}}} на сумму {{{loan_amount}}} руб.</p>
  <p class="mb-4 text-justify">1.2. Заёмщику надлежит возвратить сумму займа {{{return_deadline}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Последствия</div>
  <p class="mb-4 text-justify">2.1. При неисполнении требования Займодавец обратится в суд с исковым заявлением о взыскании задолженности.</p>
  <div class="mt-8 text-xs border-t border-zinc-300 pt-4">
    <p class="mb-1">Займодавец: <strong>{{{lender_fio}}}</strong></p>
    <p class="text-zinc-500 text-[11px]">подпись</p>
  </div>
</div>`,
  },
{
    id: "leasing-agreement",
    name: "Договор лизинга (финансовой аренды)",
    category: "finance",
    actSource: "ст. 665-670 ГК РФ, ФЗ-164",
    lastUpdated: "Август 2026",
    description: "Договор финансовой аренды (лизинга): лизингодатель приобретает имущество у продавца и передаёт лизингополучателю, график платежей, выкупная стоимость, страхование.",
    suggestedDocs: ["act-transfer-auto", "invoice"],
    printInstruction: "Печать на листе А4; график лизинговых платежей оформляется приложением к договору",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lessor_company", label: "Лизингодатель", type: "text", defaultValue: "ООО «Лизинг-Финанс»", category: "landlord", validation: { required: true } },
      { id: "lessor_inn", label: "ИНН лизингодателя", type: "text", defaultValue: "7701234567", category: "landlord" },
      { id: "lessee_company", label: "Лизингополучатель", type: "text", defaultValue: "ООО «Транспорт»", category: "tenant", validation: { required: true } },
      { id: "lessee_inn", label: "ИНН лизингополучателя", type: "text", defaultValue: "7701112223", category: "tenant" },
      { id: "property_desc", label: "Предмет лизинга", type: "textarea", defaultValue: "седельный тягач КамАЗ-5490, 2026 г.в., стоимость 7 800 000 руб., продавец: ООО «КамАЗ-Трейд»", category: "object", rows: 2, validation: { required: true } },
      { id: "seller_name", label: "Продавец имущества", type: "text", defaultValue: "ООО «КамАЗ-Трейд»", category: "other" },
      { id: "lease_term", label: "Срок лизинга", type: "text", defaultValue: "36 месяцев", category: "contract" },
      { id: "monthly_payment", label: "Лизинговый платёж (руб./мес)", type: "text", defaultValue: "245000", category: "payment", validation: { required: true } },
      { id: "prepay", label: "Аванс (руб.)", type: "text", defaultValue: "1170000", category: "payment" },
      { id: "buyout_price", label: "Выкупная стоимость (руб.)", type: "text", defaultValue: "15000", category: "payment" },
      { id: "insurance_by", label: "Страхование предмета лизинга", type: "text", defaultValue: "КАСКО на весь срок лизинга, оплата — Лизингополучателем", category: "other" },
      { id: "start_date", label: "Дата передачи предмета лизинга", type: "date", defaultValue: "2026-09-01", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор лизинга (финансовой аренды)</div>
  <p class="mb-4 text-justify">
    <strong>{{{lessor_company}}}</strong> (ИНН {{{lessor_inn}}}), именуемый «Лизингодатель», с одной стороны, и
    <strong>{{{lessee_company}}}</strong> (ИНН {{{lessee_inn}}}), именуемый «Лизингополучатель», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 665 ГК РФ, ФЗ-164):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Лизингодатель обязуется приобрести в собственность у продавца {{{seller_name}}} и предоставить Лизингополучателю во временное владение и пользование: {{{property_desc}}}.</p>
  <p class="mb-3 text-justify">1.2. Предмет лизинга передаётся по акту приёма-передачи «{{{start_date}}}».</p>
  <p class="font-bold mb-2">2. Лизинговые платежи</p>
  <p class="mb-3 text-justify">2.1. Аванс: {{{prepay}}} руб. Ежемесячный лизинговый платёж: <strong>{{{monthly_payment}}} руб.</strong> ({{{monthly_payment_words}}}). График платежей — приложение № 1.</p>
  <p class="mb-3 text-justify">2.2. По окончании срока {{{lease_term}}} Лизингополучатель вправе выкупить предмет лизинга по выкупной стоимости {{{buyout_price}}} руб.</p>
  <p class="font-bold mb-2">3. Страхование</p>
  <p class="mb-3 text-justify">3.1. {{{insurance_by}}}.</p>
  <p class="font-bold mb-2">4. Права, обязанности и ответственность</p>
  <p class="mb-3 text-justify">4.1. Лизингополучатель несёт ответственность за сохранность предмета лизинга и обязан поддерживать его в исправном состоянии.</p>
  <p class="mb-3 text-justify">4.2. За просрочку лизинговых платежей уплачивается неустойка 0,1% от суммы задолженности за каждый день просрочки. Лизингодатель вправе изъять предмет лизинга при просрочке свыше 2 платежей.</p>
  
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
      <p class="font-bold mb-1">Лизингодатель:</p>
      <p class="mb-6">{{{lessor_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Лизингополучатель:</p>
      <p class="mb-6">{{{lessee_company}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "novation-agreement",
    name: "Договор новации долга",
    category: "finance",
    actSource: "ст. 414, 818 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о замене первоначального обязательства новым (новация, ст. 414 ГК РФ). Новация займа в заёмное обязательство требует письменной формы (ст. 818 ГК РФ).",
    suggestedDocs: ["loan-agreement", "raspiska-money"],
    printInstruction: "Печать на листе А4; обязательно прямое указание намерения сторон заменить обязательство новым",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата соглашения", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "creditor_fio", label: "Кредитор (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "lender", validation: { required: true } },
      { id: "creditor_passport", label: "Паспорт кредитора", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "lender" },
      { id: "debtor_fio", label: "Должник (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "borrower", validation: { required: true } },
      { id: "debtor_passport", label: "Паспорт должника", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "borrower" },
      { id: "original_doc", label: "Первоначальное обязательство", type: "text", defaultValue: "договор поставки № 15 от 01.03.2026, задолженность за поставленный товар", category: "contract", validation: { required: true } },
      { id: "debt_amount", label: "Размер долга (руб.)", type: "text", defaultValue: "350000", category: "payment", validation: { required: true } },
      { id: "new_obligation", label: "Новое обязательство", type: "textarea", defaultValue: "Должник обязуется возвратить Кредитору денежную сумму 350 000 руб. в срок до 01.12.2026 с уплатой 12% годовых (заёмное обязательство)", category: "contract", rows: 2, validation: { required: true } },
      { id: "return_date", label: "Срок исполнения нового обязательства", type: "date", defaultValue: "2026-12-01", category: "contract" },
      { id: "interest", label: "Проценты за пользование", type: "text", defaultValue: "12% годовых", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о новации долга</div>
  <p class="mb-4 text-justify">
    <strong>{{{creditor_fio}}}</strong> (паспорт: {{{creditor_passport}}}), именуемый «Кредитор», и
    <strong>{{{debtor_fio}}}</strong> (паспорт: {{{debtor_passport}}}), именуемый «Должник», заключили
    настоящее соглашение о нижеследующем (ст. 414 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Первоначальное обязательство</p>
  <p class="mb-3 text-justify">1.1. Должник имеет перед Кредитором задолженность по обязательству: {{{original_doc}}}, в размере <strong>{{{debt_amount}}} руб.</strong> ({{{debt_amount_words}}}).</p>
  <p class="font-bold mb-2">2. Новация</p>
  <p class="mb-3 text-justify">2.1. Стороны договорились о замене указанного обязательства новым: {{{new_obligation}}}.</p>
  <p class="mb-3 text-justify">2.2. С момента подписания настоящего соглашения первоначальное обязательство прекращается и возникают обязательства по новому договору займа (ст. 818 ГК РФ).</p>
  <p class="font-bold mb-2">3. Срок и проценты</p>
  <p class="mb-3 text-justify">3.1. Должник обязан исполнить новое обязательство в срок до «{{{return_date}}}». За пользование денежными средствами уплачиваются проценты: {{{interest}}} (ст. 809 ГК РФ).</p>
  <p class="mb-3 text-justify">3.2. Настоящее соглашение составлено в двух экземплярах, имеющих равную юридическую силу.</p>
  
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
      <p class="font-bold mb-1">Кредитор:</p>
      <p class="mb-6">{{{creditor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Должник:</p>
      <p class="mb-6">{{{debtor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "compensation-agreement",
    name: "Соглашение об отступном",
    category: "finance",
    actSource: "ст. 409 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о прекращении обязательства предоставлением отступного (деньги, имущество, услуги). Обязательство прекращается с момента фактического предоставления (ст. 409 ГК РФ).",
    suggestedDocs: ["raspiska-money", "act-transfer-auto"],
    printInstruction: "Печать на листе А4; при передаче недвижимости в качестве отступного — госрегистрация перехода права",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата соглашения", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "creditor_fio", label: "Кредитор (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "lender", validation: { required: true } },
      { id: "creditor_passport", label: "Паспорт кредитора", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "lender" },
      { id: "debtor_fio", label: "Должник (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "borrower", validation: { required: true } },
      { id: "debtor_passport", label: "Паспорт должника", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "borrower" },
      { id: "original_doc", label: "Основание долга", type: "text", defaultValue: "договор займа от 01.02.2026", category: "contract", validation: { required: true } },
      { id: "debt_amount", label: "Размер долга (руб.)", type: "text", defaultValue: "500000", category: "payment", validation: { required: true } },
      { id: "compensation", label: "Предмет отступного", type: "textarea", defaultValue: "передача в собственность автомобиля Hyundai Solaris, гос. № А123ВС777, оценочной стоимостью 500 000 руб.", category: "items", rows: 2, validation: { required: true } },
      { id: "transfer_date", label: "Дата предоставления отступного", type: "date", defaultValue: "2026-08-20", category: "contract" },
      { id: "compensation_value", label: "Стоимость отступного (руб.)", type: "text", defaultValue: "500000", category: "payment" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение об отступном</div>
  <p class="mb-4 text-justify">
    <strong>{{{creditor_fio}}}</strong> (паспорт: {{{creditor_passport}}}), именуемый «Кредитор», и
    <strong>{{{debtor_fio}}}</strong> (паспорт: {{{debtor_passport}}}), именуемый «Должник», заключили
    настоящее соглашение о нижеследующем (ст. 409 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет соглашения</p>
  <p class="mb-3 text-justify">1.1. Должник имеет перед Кредитором денежное обязательство в размере <strong>{{{debt_amount}}} руб.</strong> ({{{debt_amount_words}}}) по обязательству: {{{original_doc}}}.</p>
  <p class="mb-3 text-justify">1.2. В качестве отступного Должник предоставляет Кредитору: {{{compensation}}}, стоимостью {{{compensation_value}}} руб.</p>
  <p class="font-bold mb-2">2. Порядок предоставления</p>
  <p class="mb-3 text-justify">2.1. Отступное предоставляется «{{{transfer_date}}}» и оформляется актом приёма-передачи.</p>
  <p class="mb-3 text-justify">2.2. Обязательство прекращается с момента фактического предоставления отступного (ст. 409 ГК РФ). С указанного момента стороны не имеют взаимных претензий по обязательству.</p>
  <p class="font-bold mb-2">3. Заключительные положения</p>
  <p class="mb-3 text-justify">3.1. Настоящее соглашение составлено в двух экземплярах, имеющих равную юридическую силу.</p>
  
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
      <p class="font-bold mb-1">Кредитор:</p>
      <p class="mb-6">{{{creditor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
    <div class="w-1/2 pl-4">
      <p class="font-bold mb-1">Должник:</p>
      <p class="mb-6">{{{debtor_fio}}}</p>
      <div class="border-b border-zinc-950 w-56 h-5 mb-1"></div>
      <p class="text-zinc-400 text-[10px]">подпись</p>
    </div>
  </div>
</div>`,
  },
{
    id: "donation-agreement",
    name: "Договор пожертвования",
    category: "finance",
    actSource: "ст. 582 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор пожертвования в общеполезных целях: предмет, целевое назначение, обязанность одаряемого отчитываться об использовании, отмена пожертвования (ст. 582 ГК РФ).",
    suggestedDocs: ["raspiska-money"],
    printInstruction: "Печать на листе А4; письменная форма обязательна при пожертвовании недвижимости или от юрлица на сумму свыше 3000 руб.",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "donor_fio", label: "Жертвователь (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "donor", validation: { required: true } },
      { id: "donor_passport", label: "Паспорт жертвователя", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "donor" },
      { id: "donee_fio", label: "Одаряемый", type: "text", defaultValue: "Благотворительный фонд «Помощь детям»", category: "donee", validation: { required: true } },
      { id: "donee_inn", label: "ИНН одаряемого", type: "text", defaultValue: "7701112223", category: "donee" },
      { id: "donation_item", label: "Предмет пожертвования", type: "textarea", defaultValue: "денежные средства в размере 100 000 руб., перечисляемые на расчётный счёт Одаряемого", category: "items", rows: 2, validation: { required: true } },
      { id: "purpose", label: "Цель использования", type: "text", defaultValue: "приобретение медицинского оборудования для детского отделения", category: "items", validation: { required: true } },
      { id: "report_order", label: "Порядок отчётности", type: "text", defaultValue: "Одаряемый предоставляет письменный отчёт об использовании средств не позднее 30 дней после расходования", category: "other" },
      { id: "transfer_date", label: "Дата передачи", type: "date", defaultValue: "2026-08-15", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор пожертвования</div>
  <p class="mb-4 text-justify">
    <strong>{{{donor_fio}}}</strong> (паспорт: {{{donor_passport}}}), именуемый «Жертвователь», с одной стороны, и
    <strong>{{{donee_fio}}}</strong> (ИНН {{{donee_inn}}}), именуемый «Одаряемый», с другой стороны,
    заключили настоящий договор о нижеследующем (ст. 582 ГК РФ):
  </p>
  <p class="font-bold mb-2">1. Предмет договора</p>
  <p class="mb-3 text-justify">1.1. Жертвователь безвозмездно передаёт Одаряемому в общеполезных целях: {{{donation_item}}}.</p>
  <p class="mb-3 text-justify">1.2. Передача осуществляется «{{{transfer_date}}}».</p>
  <p class="font-bold mb-2">2. Целевое назначение</p>
  <p class="mb-3 text-justify">2.1. Имущество должно использоваться исключительно в целях: {{{purpose}}}.</p>
  <p class="mb-3 text-justify">2.2. {{{report_order}}}.</p>
  <p class="font-bold mb-2">3. Отмена пожертвования</p>
  <p class="mb-3 text-justify">3.1. При использовании имущества не по назначению Жертвователь вправе требовать отмены пожертвования (ст. 582 п. 5 ГК РФ).</p>
  <p class="mb-3 text-justify">3.2. Настоящий договор составлен в двух экземплярах, имеющих равную юридическую силу.</p>
  
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
      <p class="font-bold mb-1">Жертвователь:</p>
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
    id: "mortgage-loan",
    name: "Договор займа под залог недвижимости",
    category: "finance",
    actSource: "ст. 334-358, 339 ГК РФ, ФЗ-102",
    lastUpdated: "Август 2026",
    description: "Договор займа с обеспечением ипотекой (залогом недвижимости): сумма, проценты, предмет залога, оценка, регистрация обременения в Росреестре (ст. 339 ГК РФ, ФЗ-102).",
    suggestedDocs: ["loan-agreement", "dkp-flat"],
    printInstruction: "Печать на листе А4; договор ипотеки подлежит нотариальному удостоверению при залоге долей; закладная и обременение регистрируются в Росреестре",
    fields: [
      { id: "city", label: "Город", type: "text", defaultValue: "Москва", category: "contract" },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-10", category: "contract" },
      { id: "lender_fio", label: "Займодавец (ФИО)", type: "text", defaultValue: "Иванов Иван Иванович", category: "lender", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт займодавца", type: "text", defaultValue: "45 10 987654, выдан ОВД «Тверской» г. Москвы", category: "lender" },
      { id: "borrower_fio", label: "Заёмщик (ФИО)", type: "text", defaultValue: "Петров Пётр Петрович", category: "borrower", validation: { required: true } },
      { id: "borrower_passport", label: "Паспорт заёмщика", type: "text", defaultValue: "45 09 654321, выдан ОВД «Басманный» г. Москвы", category: "borrower" },
      { id: "loan_amount", label: "Сумма займа (руб.)", type: "text", defaultValue: "3000000", category: "payment", validation: { required: true } },
      { id: "interest_rate", label: "Проценты (% годовых)", type: "text", defaultValue: "10", category: "payment" },
      { id: "return_date", label: "Срок возврата", type: "date", defaultValue: "2028-08-10", category: "contract" },
      { id: "pledge_desc", label: "Предмет залога", type: "textarea", defaultValue: "квартира по адресу: г. Москва, ул. Ленина, д. 10, кв. 25, кадастровый № 77:01:0001020:4521, принадлежащая Заёмщику на праве собственности", category: "realty", rows: 2, validation: { required: true } },
      { id: "pledge_value", label: "Оценочная стоимость залога (руб.)", type: "text", defaultValue: "9500000", category: "payment" },
      { id: "pledge_reg", label: "Регистрация ипотеки", type: "text", defaultValue: "ипотека в силу договора подлежит госрегистрации в Росреестре (ФЗ-102)", category: "contract" },
      { id: "penalty", label: "Неустойка", type: "text", defaultValue: "0,1% в день", category: "contract" },
    ],
    previewTemplate: `
<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа с обеспечением ипотекой</div>
  <p class="mb-4 text-justify">
    <strong>{{{lender_fio}}}</strong> (паспорт: {{{lender_passport}}}), именуемый «Займодавец», и
    <strong>{{{borrower_fio}}}</strong> (паспорт: {{{borrower_passport}}}), именуемый «Заёмщик», заключили
    настоящий договор о нижеследующем (ст. 807, 334 ГК РФ, ФЗ-102):
  </p>
  <p class="font-bold mb-2">1. Заём</p>
  <p class="mb-3 text-justify">1.1. Займодавец передаёт Заёмщику денежные средства в размере <strong>{{{loan_amount}}} руб.</strong> ({{{loan_amount_words}}}) под {{{interest_rate}}}% годовых на срок до «{{{return_date}}}».</p>
  <p class="font-bold mb-2">2. Обеспечение исполнения</p>
  <p class="mb-3 text-justify">2.1. Исполнение обязательств обеспечивается ипотекой (залогом) недвижимого имущества: {{{pledge_desc}}}. Оценочная стоимость предмета залога: {{{pledge_value}}} руб. (ст. 339 ГК РФ).</p>
  <p class="mb-3 text-justify">2.2. {{{pledge_reg}}}. Ипотека возникает с момента государственной регистрации (ст. 11 ФЗ-102).</p>
  <p class="font-bold mb-2">3. Обращение взыскания</p>
  <p class="mb-3 text-justify">3.1. При неисполнении обязательств Займодавец вправе обратить взыскание на предмет залога (ст. 348-349 ГК РФ, ст. 50-51 ФЗ-102).</p>
  <p class="font-bold mb-2">4. Ответственность</p>
  <p class="mb-3 text-justify">4.1. За просрочку возврата займа Заёмщик уплачивает неустойку {{{penalty}}} от суммы задолженности за каждый день просрочки (ст. 330, 811 ГК РФ).</p>
  
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
    id: "debt-restructuring",
    name: "Соглашение о реструктуризации долга",
    category: "finance",
    actSource: "ст. 414, 450 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о реструктуризации задолженности: новый график платежей, отсрочка, изменение условий по долгу.",
    suggestedDocs: ["debt-acknowledgment","payment-deferral","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "creditor_fio", label: "ФИО кредитора", type: "text", defaultValue: "Анисимова Лариса Викторовна", category: "lender", validation: { required: true } },
      { id: "creditor_passport", label: "Паспорт кредитора", type: "text", defaultValue: "4509 654321, выдан ОУФМС России по г. Москве 03.03.2010, к.п. 770-001", category: "lender", validation: { required: true } },
      { id: "creditor_addr", label: "Адрес кредитора", type: "text", defaultValue: "г. Москва, ул. Долговая, д. 2, кв. 10", category: "lender" },
      { id: "debtor_fio", label: "ФИО должника", type: "text", defaultValue: "Рожков Степан Олегович", category: "borrower", validation: { required: true } },
      { id: "debtor_passport", label: "Паспорт должника", type: "text", defaultValue: "4512 852963, выдан ОУФМС России по г. Москве 20.04.2014, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "debtor_addr", label: "Адрес должника", type: "text", defaultValue: "г. Москва, ул. Платежная, д. 5, кв. 33", category: "borrower" },
      { id: "basis_doc", label: "Основание долга", type: "text", defaultValue: "Договор займа от 15.03.2025, расписка от 15.03.2025", category: "contract", validation: { required: true } },
      { id: "debt_total", label: "Сумма долга (руб.)", type: "number", defaultValue: "450000", category: "payment", validation: { required: true } },
      { id: "debt_words", label: "Сумма прописью", type: "text", defaultValue: "Четыреста пятьдесят тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "new_schedule", label: "Новый график платежей", type: "textarea", defaultValue: "Ежемесячно по 25 000 рублей, не позднее 5 числа каждого месяца, начиная с 01.09.2026", category: "payment", validation: { required: true } },
      { id: "last_pay", label: "Дата окончательного расчёта", type: "date", defaultValue: "2028-02-05", category: "payment", validation: { required: true } },
      { id: "percent_change", label: "Изменение процентов/неустойки", type: "text", defaultValue: "Неустойка за просрочку отменяется, проценты по ст. 395 не начисляются", category: "payment" },
      { id: "rights_note", label: "Сохраняются права кредитора", type: "text", defaultValue: "Все обеспечительные меры и поручительства сохраняют силу", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о реструктуризации долга</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{creditor_fio}}}</strong> (паспорт {{{creditor_passport}}}, адрес: {{{creditor_addr}}}), именуемый в дальнейшем «Кредитор», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{debtor_fio}}}</strong> (паспорт {{{debtor_passport}}}, адрес: {{{debtor_addr}}}), именуемый в дальнейшем «Должник», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">1.1. Стороны подтверждают наличие задолженности Должника перед Кредитором в размере <strong>{{{debt_total}}} ({{{debt_words}}}) рублей</strong>, возникшей на основании: {{{basis_doc}}}.</p>
  <p class="mb-4 text-justify">1.2. Стороны договариваются о реструктуризации долга на условиях, установленных настоящим соглашением.</p>
  <p class="mb-4 text-justify">1.3. {{{rights_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия реструктуризации</div>
  <p class="mb-4 text-justify">2.1. Новый график платежей: {{{new_schedule}}}.</p>
  <p class="mb-4 text-justify">2.2. Окончательный расчёт — до {{{last_pay}}}.</p>
  <p class="mb-4 text-justify">2.3. {{{percent_change}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязательства должника</div>
  <p class="mb-4 text-justify">3.1. Должник обязуется соблюдать новый график платежей.</p>
  <p class="mb-4 text-justify">3.2. При просрочке более 60 дней Кредитор вправе требовать досрочного погашения всей суммы долга.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Ответственность сторон</div>
  <p class="mb-4 text-justify">4.1. В случае неисполнения соглашения задолженность подлежит взысканию в полном объёме в судебном порядке.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Кредитор:</div>
      <p class="mb-1"><strong>{{{creditor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{creditor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{creditor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Должник:</div>
      <p class="mb-1"><strong>{{{debtor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{debtor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{debtor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "payment-deferral",
    name: "Соглашение о рассрочке (отсрочке) платежа",
    category: "finance",
    actSource: "ст. 450, 489 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о рассрочке оплаты товаров, работ или услуг: стороны изменяют сроки и разбивают платеж на части.",
    suggestedDocs: ["debt-acknowledgment","act-works"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "creditor_company", label: "Компания кредитора", type: "text", defaultValue: "ООО «Поставщик-Строй»", category: "lender", validation: { required: true } },
      { id: "creditor_inn", label: "ИНН кредитора", type: "text", defaultValue: "7712345678", category: "lender", validation: { required: true } },
      { id: "creditor_addr", label: "Юр. адрес кредитора", type: "text", defaultValue: "г. Москва, ул. Оптовая, д. 3", category: "lender" },
      { id: "debtor_company", label: "Компания должника", type: "text", defaultValue: "ООО «СтройПодряд»", category: "borrower", validation: { required: true } },
      { id: "debtor_inn", label: "ИНН должника", type: "text", defaultValue: "7723456789", category: "borrower", validation: { required: true } },
      { id: "debtor_addr", label: "Юр. адрес должника", type: "text", defaultValue: "г. Москва, ул. Подрядная, д. 9", category: "borrower" },
      { id: "basis_doc", label: "Основание задолженности", type: "text", defaultValue: "Договор поставки №14 от 10.06.2026, счёт-фактура №87 от 15.06.2026", category: "contract", validation: { required: true } },
      { id: "debt_total", label: "Сумма долга (руб.)", type: "number", defaultValue: "1200000", category: "payment", validation: { required: true } },
      { id: "debt_words", label: "Сумма прописью", type: "text", defaultValue: "Один миллион двести тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "installments", label: "График платежей", type: "textarea", defaultValue: "5 равных платежей по 240 000 рублей ежемесячно до 20 числа, начиная с 20.08.2026", category: "payment", validation: { required: true } },
      { id: "first_pay", label: "Дата первого платежа", type: "date", defaultValue: "2026-08-20", category: "payment", validation: { required: true } },
      { id: "last_pay", label: "Дата последнего платежа", type: "date", defaultValue: "2026-12-20", category: "payment", validation: { required: true } },
      { id: "penalty", label: "Неустойка за просрочку", type: "text", defaultValue: "0,1% от суммы просроченного платежа за каждый день", category: "payment" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о рассрочке платежа</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{creditor_company}}}</strong> (ИНН {{{creditor_inn}}}, адрес: {{{creditor_addr}}}), именуемое в дальнейшем «Кредитор», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{debtor_company}}}</strong> (ИНН {{{debtor_inn}}}, адрес: {{{debtor_addr}}}), именуемое в дальнейшем «Должник», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">1.1. Стороны подтверждают наличие задолженности Должника в размере <strong>{{{debt_total}}} ({{{debt_words}}}) рублей</strong> по обязательству: {{{basis_doc}}}.</p>
  <p class="mb-4 text-justify">1.2. Кредитор предоставляет Должнику рассрочку погашения задолженности на условиях настоящего соглашения.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок погашения</div>
  <p class="mb-4 text-justify">2.1. График платежей: {{{installments}}}.</p>
  <p class="mb-4 text-justify">2.2. Первый платёж — {{{first_pay}}}, окончательный расчёт — {{{last_pay}}}.</p>
  <p class="mb-4 text-justify">2.3. Должник вправе погасить задолженность досрочно полностью или частично.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. {{{penalty}}}.</p>
  <p class="mb-4 text-justify">3.2. При просрочке двух платежей подряд Кредитор вправе потребовать досрочного погашения всей суммы.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Кредитор:</div>
      <p class="mb-1"><strong>{{{creditor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{creditor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{creditor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Должник:</div>
      <p class="mb-1"><strong>{{{debtor_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{debtor_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{debtor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "offset-agreement",
    name: "Соглашение о зачёте взаимных требований",
    category: "finance",
    actSource: "ст. 410 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Соглашение о зачёте встречных однородных требований между сторонами: прекращает взаимные обязательства в части совпадающих сумм.",
    suggestedDocs: ["debt-acknowledgment","reconciliation-statement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "side1_company", label: "Компания стороны 1", type: "text", defaultValue: "ООО «ТоргСеть»", category: "business", validation: { required: true } },
      { id: "side1_inn", label: "ИНН стороны 1", type: "text", defaultValue: "7734567890", category: "business", validation: { required: true } },
      { id: "side1_addr", label: "Юр. адрес стороны 1", type: "text", defaultValue: "г. Москва, ул. Сетевая, д. 1", category: "business" },
      { id: "side2_company", label: "Компания стороны 2", type: "text", defaultValue: "ООО «Логистик-Групп»", category: "business", validation: { required: true } },
      { id: "side2_inn", label: "ИНН стороны 2", type: "text", defaultValue: "7745678901", category: "business", validation: { required: true } },
      { id: "side2_addr", label: "Юр. адрес стороны 2", type: "text", defaultValue: "г. Москва, ул. Групповая, д. 7", category: "business" },
      { id: "claim1", label: "Требование стороны 1", type: "textarea", defaultValue: "Оплата по договору поставки №21 от 01.04.2026 — 350 000 рублей", category: "contract", validation: { required: true } },
      { id: "claim2", label: "Требование стороны 2", type: "textarea", defaultValue: "Оплата по договору перевозки №9 от 10.05.2026 — 350 000 рублей", category: "contract", validation: { required: true } },
      { id: "offset_sum", label: "Сумма зачёта (руб.)", type: "number", defaultValue: "350000", category: "payment", validation: { required: true } },
      { id: "offset_words", label: "Сумма прописью", type: "text", defaultValue: "Триста пятьдесят тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "remainder", label: "Остаток после зачёта", type: "text", defaultValue: "Остатков нет. Обязательства сторон прекращены в полном объёме", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о зачёте взаимных требований</div>
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
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">1.1. Сторона 1 имеет требование к Стороне 2: {{{claim1}}}.</p>
  <p class="mb-4 text-justify">1.2. Сторона 2 имеет требование к Стороне 1: {{{claim2}}}.</p>
  <p class="mb-4 text-justify">1.3. Стороны производят зачёт встречных однородных требований на сумму <strong>{{{offset_sum}}} ({{{offset_words}}}) рублей</strong>.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок зачёта</div>
  <p class="mb-4 text-justify">2.1. С момента вступления настоящего соглашения в силу встречные требования прекращаются в сумме зачёта.</p>
  <p class="mb-4 text-justify">2.2. {{{remainder}}}.</p>
  <p class="mb-4 text-justify">2.3. Соглашение является документом, подтверждающим прекращение обязательств (ст. 410 ГК РФ).</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">3. Форс-мажор</div>
  <p class="mb-4 text-justify">3.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">3.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">3.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">4.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">4.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
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
    id: "debt-acknowledgment",
    name: "Акт сверки и признания долга",
    category: "finance",
    actSource: "ст. 203 ГК РФ (перерыв течения срока исковой давности)",
    lastUpdated: "Август 2026",
    description: "Соглашение о признании долга: фиксирует размер задолженности и прерывает срок исковой давности.",
    suggestedDocs: ["debt-restructuring","payment-deferral","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "creditor_fio", label: "ФИО кредитора", type: "text", defaultValue: "Ефимова Полина Андреевна", category: "lender", validation: { required: true } },
      { id: "creditor_passport", label: "Паспорт кредитора", type: "text", defaultValue: "4510 741258, выдан ОУФМС России по г. Москве 12.05.2011, к.п. 770-001", category: "lender", validation: { required: true } },
      { id: "creditor_addr", label: "Адрес кредитора", type: "text", defaultValue: "г. Москва, ул. Кредитная, д. 4, кв. 12", category: "lender" },
      { id: "debtor_fio", label: "ФИО должника", type: "text", defaultValue: "Захаров Тимофей Артёмович", category: "borrower", validation: { required: true } },
      { id: "debtor_passport", label: "Паспорт должника", type: "text", defaultValue: "4512 369852, выдан ОУФМС России по г. Москве 18.08.2014, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "debtor_addr", label: "Адрес должника", type: "text", defaultValue: "г. Москва, ул. Задолженская, д. 6, кв. 40", category: "borrower" },
      { id: "basis_doc", label: "Основание долга", type: "text", defaultValue: "Расписка от 10.10.2024, договор займа от 10.10.2024", category: "contract", validation: { required: true } },
      { id: "debt_sum", label: "Сумма долга (руб.)", type: "number", defaultValue: "250000", category: "payment", validation: { required: true } },
      { id: "debt_words", label: "Сумма прописью", type: "text", defaultValue: "Двести пятьдесят тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "due_date", label: "Срок возврата (дата)", type: "date", defaultValue: "2026-12-31", category: "payment" },
      { id: "acknowledge_note", label: "Заявление о признании", type: "text", defaultValue: "Должник признаёт долг в полном объёме без претензий", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Соглашение о признании долга</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{creditor_fio}}}</strong> (паспорт {{{creditor_passport}}}, адрес: {{{creditor_addr}}}), именуемый в дальнейшем «Кредитор», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{debtor_fio}}}</strong> (паспорт {{{debtor_passport}}}, адрес: {{{debtor_addr}}}), именуемый в дальнейшем «Должник», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет соглашения</div>
  <p class="mb-4 text-justify">1.1. Должник признаёт наличие задолженности перед Кредитором в размере <strong>{{{debt_sum}}} ({{{debt_words}}}) рублей</strong>, возникшей на основании: {{{basis_doc}}}.</p>
  <p class="mb-4 text-justify">1.2. {{{acknowledge_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия возврата</div>
  <p class="mb-4 text-justify">2.1. Задолженность подлежит возврату в срок до {{{due_date}}}.</p>
  <p class="mb-4 text-justify">2.2. Допускается досрочное погашение без дополнительных санкций.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Юридические последствия</div>
  <p class="mb-4 text-justify">3.1. Подписание настоящего соглашения является признанием долга и в соответствии со ст. 203 ГК РФ прерывает течение срока исковой давности.</p>
  <p class="mb-4 text-justify">3.2. В случае невозврата долга в срок Кредитор вправе обратиться в суд.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Кредитор:</div>
      <p class="mb-1"><strong>{{{creditor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{creditor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{creditor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Должник:</div>
      <p class="mb-1"><strong>{{{debtor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{debtor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{debtor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "currency-exchange",
    name: "Договор мены валюты между физическими лицами",
    category: "finance",
    actSource: "ст. 567 ГК РФ, ФЗ-173 «О валютном регулировании»",
    lastUpdated: "Август 2026",
    description: "Договор обмена валюты (рубли ↔ доллары/евро) между физическими лицами по согласованному курсу.",
    suggestedDocs: ["raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "side1_fio", label: "ФИО стороны 1", type: "text", defaultValue: "Гончаров Виктор Леонидович", category: "seller", validation: { required: true } },
      { id: "side1_passport", label: "Паспорт стороны 1", type: "text", defaultValue: "4511 147852, выдан ОУФМС России по г. Москве 25.09.2013, к.п. 770-003", category: "seller", validation: { required: true } },
      { id: "side1_addr", label: "Адрес стороны 1", type: "text", defaultValue: "г. Москва, ул. Валютная, д. 8, кв. 5", category: "seller" },
      { id: "side2_fio", label: "ФИО стороны 2", type: "text", defaultValue: "Логинова Анжелика Романовна", category: "buyer", validation: { required: true } },
      { id: "side2_passport", label: "Паспорт стороны 2", type: "text", defaultValue: "4513 258369, выдан ОУФМС России по г. Москве 07.02.2016, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "side2_addr", label: "Адрес стороны 2", type: "text", defaultValue: "г. Москва, ул. Обменная, д. 2, кв. 15", category: "buyer" },
      { id: "currency1", label: "Валюта стороны 1 (отдаёт)", type: "text", defaultValue: "Доллары США — 1 000 USD", category: "contract", validation: { required: true } },
      { id: "currency2", label: "Валюта стороны 2 (отдаёт)", type: "text", defaultValue: "Рубли — 85 000 рублей", category: "contract", validation: { required: true } },
      { id: "rate", label: "Курс обмена", type: "text", defaultValue: "85 рублей за 1 доллар США", category: "payment", validation: { required: true } },
      { id: "exchange_date", label: "Дата обмена", type: "date", defaultValue: "2026-08-11", category: "contract" },
      { id: "notes", label: "Особые условия", type: "text", defaultValue: "Банкноты образца 2013 года и старше, все купюры проверены на подлинность при обмене", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор мены валюты</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{side1_fio}}}</strong> (паспорт {{{side1_passport}}}, адрес: {{{side1_addr}}}), именуемый в дальнейшем «Сторона 1», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{side2_fio}}}</strong> (паспорт {{{side2_passport}}}, адрес: {{{side2_addr}}}), именуемый в дальнейшем «Сторона 2», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Сторона 1 передаёт Стороне 2: {{{currency1}}}.</p>
  <p class="mb-4 text-justify">1.2. Сторона 2 передаёт Стороне 1: {{{currency2}}}.</p>
  <p class="mb-4 text-justify">1.3. Курс обмена: {{{rate}}}. Дата обмена: {{{exchange_date}}}.</p>
  <p class="mb-4 text-justify">1.4. {{{notes}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок исполнения</div>
  <p class="mb-4 text-justify">2.1. Обмен производится одновременно при подписании настоящего договора.</p>
  <p class="mb-4 text-justify">2.2. Претензии по подлинности и качеству банкнот не принимаются после передачи средств.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность сторон</div>
  <p class="mb-4 text-justify">3.1. Стороны несут ответственность за достоверность предоставляемой информации.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Сторона 1:</div>
      <p class="mb-1"><strong>{{{side1_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{side1_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{side1_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Сторона 2:</div>
      <p class="mb-1"><strong>{{{side2_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{side2_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{side2_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "bank-deposit-agreement",
    name: "Договор банковского вклада (депозита)",
    category: "finance",
    actSource: "гл. 44 ГК РФ (ст. 834-844), ФЗ-395-1",
    lastUpdated: "Август 2026",
    description: "Договор банковского вклада: размещение денежных средств в банке под проценты с выдачей сберегательного сертификата или открытием счёта.",
    suggestedDocs: ["loan-agreement","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "depositor_fio", label: "ФИО вкладчика", type: "text", defaultValue: "Матвеева Дарья Сергеевна", category: "customer", validation: { required: true } },
      { id: "depositor_passport", label: "Паспорт вкладчика", type: "text", defaultValue: "4512 963741, выдан ОУФМС России по г. Москве 14.07.2014, к.п. 770-002", category: "customer", validation: { required: true } },
      { id: "depositor_addr", label: "Адрес вкладчика", type: "text", defaultValue: "г. Москва, ул. Вкладная, д. 3, кв. 9", category: "customer" },
      { id: "bank_name", label: "Банк", type: "text", defaultValue: "АО «КредитБанк»", category: "business", validation: { required: true } },
      { id: "bank_inn", label: "ИНН банка", type: "text", defaultValue: "7702345678", category: "business", validation: { required: true } },
      { id: "bank_addr", label: "Юр. адрес банка", type: "text", defaultValue: "г. Москва, ул. Банковская, д. 1", category: "business" },
      { id: "deposit_sum", label: "Сумма вклада (руб.)", type: "number", defaultValue: "1000000", category: "payment", validation: { required: true } },
      { id: "deposit_words", label: "Сумма прописью", type: "text", defaultValue: "Один миллион рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "rate", label: "Процентная ставка (% годовых)", type: "number", defaultValue: "16", category: "payment", validation: { required: true } },
      { id: "term_start", label: "Дата открытия вклада", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "term_end", label: "Дата окончания вклада", type: "date", defaultValue: "2027-08-11", category: "contract", validation: { required: true } },
      { id: "interest_pay", label: "Выплата процентов", type: "text", defaultValue: "Ежемесячно на счёт вкладчика", category: "payment" },
      { id: "withdrawal", label: "Условия досрочного снятия", type: "text", defaultValue: "При досрочном снятии проценты пересчитываются по ставке до востребования", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор банковского вклада</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{depositor_fio}}}</strong> (паспорт {{{depositor_passport}}}, адрес: {{{depositor_addr}}}), именуемый в дальнейшем «Вкладчик», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    <strong>{{{bank_name}}}</strong> (ИНН {{{bank_inn}}}, адрес: {{{bank_addr}}}), именуемое в дальнейшем «Банк», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Вкладчик вносит, а Банк принимает денежные средства в размере <strong>{{{deposit_sum}}} ({{{deposit_words}}}) рублей</strong> во вклад на срок с {{{term_start}}} по {{{term_end}}}.</p>
  <p class="mb-4 text-justify">1.2. Процентная ставка: {{{rate}}}% годовых.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Проценты</div>
  <p class="mb-4 text-justify">2.1. {{{interest_pay}}}.</p>
  <p class="mb-4 text-justify">2.2. Проценты начисляются со дня, следующего за днём поступления средств, по день возврата включительно.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. Банк обязуется вернуть сумму вклада и проценты в порядке, предусмотренном договором.</p>
  <p class="mb-4 text-justify">3.2. {{{withdrawal}}}.</p>
  <p class="mb-4 text-justify">3.3. Вклад застрахован государственной системой страхования вкладов (АСВ, до 1,4 млн рублей).</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Вкладчик:</div>
      <p class="mb-1"><strong>{{{depositor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{depositor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{depositor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Банк:</div>
      <p class="mb-1"><strong>{{{bank_name}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{bank_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{bank_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "loan-employee",
    name: "Договор займа работнику организации",
    category: "finance",
    actSource: "ст. 807-810 ГК РФ, ТК РФ (ст. 248)",
    lastUpdated: "Август 2026",
    description: "Договор беспроцентного или процентного займа от работодателя работнику (на жильё, обучение, бытовые нужды) с удержанием из зарплаты.",
    suggestedDocs: ["loan-agreement","raspiska-money"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "employer_company", label: "Компания работодателя", type: "text", defaultValue: "ООО «Промышленные Решения»", category: "employer", validation: { required: true } },
      { id: "employer_inn", label: "ИНН работодателя", type: "text", defaultValue: "7756789012", category: "employer", validation: { required: true } },
      { id: "employer_addr", label: "Юр. адрес работодателя", type: "text", defaultValue: "г. Москва, ул. Промышленная, д. 10", category: "employer" },
      { id: "employee_fio", label: "ФИО работника", type: "text", defaultValue: "Сухов Максим Денисович", category: "employee", validation: { required: true } },
      { id: "employee_passport", label: "Паспорт работника", type: "text", defaultValue: "4513 741852, выдан ОУФМС России по г. Москве 21.11.2016, к.п. 770-002", category: "employee", validation: { required: true } },
      { id: "employee_addr", label: "Адрес работника", type: "text", defaultValue: "г. Москва, ул. Рабочая, д. 5, кв. 22", category: "employee" },
      { id: "position", label: "Должность работника", type: "text", defaultValue: "Инженер-технолог", category: "employee" },
      { id: "loan_sum", label: "Сумма займа (руб.)", type: "number", defaultValue: "300000", category: "payment", validation: { required: true } },
      { id: "loan_words", label: "Сумма прописью", type: "text", defaultValue: "Триста тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "purpose", label: "Цель займа", type: "text", defaultValue: "Приобретение жилья (льготный заём)", category: "contract" },
      { id: "percent", label: "Проценты (% годовых)", type: "number", defaultValue: "0", category: "payment", validation: { required: true } },
      { id: "return_term", label: "Срок возврата (дата)", type: "date", defaultValue: "2028-08-11", category: "payment", validation: { required: true } },
      { id: "repayment", label: "Порядок возврата", type: "text", defaultValue: "Ежемесячное удержание 5 000 рублей из заработной платы", category: "payment", validation: { required: true } },
      { id: "agreement_term", label: "Срок договора (дата)", type: "date", defaultValue: "2028-08-11", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор займа работнику</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    <strong>{{{employer_company}}}</strong> (ИНН {{{employer_inn}}}, адрес: {{{employer_addr}}}), именуемое в дальнейшем «Работодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{employee_fio}}}</strong> (паспорт {{{employee_passport}}}, адрес: {{{employee_addr}}}), именуемый в дальнейшем «Работник», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Работодатель передаёт Работнику заём в размере <strong>{{{loan_sum}}} ({{{loan_words}}}) рублей</strong> на цель: {{{purpose}}}.</p>
  <p class="mb-4 text-justify">1.2. Проценты за пользование займом: {{{percent}}}% годовых.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Порядок возврата</div>
  <p class="mb-4 text-justify">2.1. {{{repayment}}}.</p>
  <p class="mb-4 text-justify">2.2. Срок полного возврата: {{{return_term}}}.</p>
  <p class="mb-4 text-justify">2.3. Работник вправе вернуть заём досрочно без дополнительных санкций.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Права и обязанности сторон</div>
  <p class="mb-4 text-justify">3.1. При увольнении Работника до полного погашения займа остаток удерживается при окончательном расчёте, при недостаточности — возмещается Работником.</p>
  <p class="mb-4 text-justify">3.2. Работодатель вправе требовать досрочного возврата при нарушении условий договора.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Работодатель:</div>
      <p class="mb-1"><strong>{{{employer_company}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">ИНН: {{{employer_inn}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{employer_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Работник:</div>
      <p class="mb-1"><strong>{{{employee_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{employee_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{employee_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "pledge-agreement",
    name: "Договор залога имущества",
    category: "finance",
    actSource: "ст. 334-356 ГК РФ, ФЗ-367",
    lastUpdated: "Август 2026",
    description: "Договор залога движимого имущества (автомобиль, техника, товары) в обеспечение исполнения обязательств.",
    suggestedDocs: ["loan-agreement","guarantee-agreement"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "pledgor_fio", label: "ФИО залогодателя", type: "text", defaultValue: "Соколов Денис Михайлович", category: "seller", validation: { required: true } },
      { id: "pledgor_passport", label: "Паспорт залогодателя", type: "text", defaultValue: "4512 654789, выдан ОУФМС России по г. Москве 16.05.2014, к.п. 770-002", category: "seller", validation: { required: true } },
      { id: "pledgor_addr", label: "Адрес залогодателя", type: "text", defaultValue: "г. Москва, ул. Залоговая, д. 7, кв. 14", category: "seller" },
      { id: "pledgee_fio", label: "ФИО залогодержателя", type: "text", defaultValue: "Овчинников Артём Викторович", category: "buyer", validation: { required: true } },
      { id: "pledgee_passport", label: "Паспорт залогодержателя", type: "text", defaultValue: "4513 321654, выдан ОУФМС России по г. Москве 09.03.2016, к.п. 770-002", category: "buyer", validation: { required: true } },
      { id: "pledgee_addr", label: "Адрес залогодержателя", type: "text", defaultValue: "г. Москва, ул. Обеспеченная, д. 1, кв. 3", category: "buyer" },
      { id: "secured_debt", label: "Обеспечиваемое обязательство", type: "text", defaultValue: "Договор займа от 11.08.2026 на 500 000 рублей", category: "contract", validation: { required: true } },
      { id: "debt_sum", label: "Сумма обязательства (руб.)", type: "number", defaultValue: "500000", category: "payment", validation: { required: true } },
      { id: "pledge_item", label: "Предмет залога", type: "text", defaultValue: "Автомобиль Hyundai Solaris, 2021 г.в., VIN Z94C241BBMR123456, гос. номер А123ВС77", category: "object", validation: { required: true } },
      { id: "pledge_value", label: "Оценочная стоимость предмета залога (руб.)", type: "number", defaultValue: "1100000", category: "payment", validation: { required: true } },
      { id: "due_date", label: "Срок исполнения обязательства (дата)", type: "date", defaultValue: "2027-08-11", category: "contract", validation: { required: true } },
      { id: "possession", label: "Оставление предмета залога", type: "text", defaultValue: "Предмет залога остаётся у Залогодателя с правом пользования", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор залога имущества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{pledgor_fio}}}</strong> (паспорт {{{pledgor_passport}}}, адрес: {{{pledgor_addr}}}), именуемый в дальнейшем «Залогодатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{pledgee_fio}}}</strong> (паспорт {{{pledgee_passport}}}, адрес: {{{pledgee_addr}}}), именуемый в дальнейшем «Залогодержатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. В обеспечение обязательства: {{{secured_debt}}} на сумму <strong>{{{debt_sum}}} рублей</strong>, Залогодатель передаёт Залогодержателю в залог имущество: {{{pledge_item}}}.</p>
  <p class="mb-4 text-justify">1.2. Оценочная стоимость предмета залога: {{{pledge_value}}} рублей.</p>
  <p class="mb-4 text-justify">1.3. {{{possession}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Условия залога</div>
  <p class="mb-4 text-justify">2.1. Срок исполнения обеспечиваемого обязательства: {{{due_date}}}.</p>
  <p class="mb-4 text-justify">2.2. Залогодержатель вправе обратить взыскание на предмет залога при неисполнении обязательства (ст. 348 ГК РФ).</p>
  <p class="mb-4 text-justify">2.3. Учёт залога регистрируется в Реестре уведомлений о залоге движимого имущества (ФНП).</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Обязанности залогодателя</div>
  <p class="mb-4 text-justify">3.1. Не отчуждать предмет залога без согласия Залогодержателя, страховать его, содержать в исправном состоянии.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">4. Прекращение залога</div>
  <p class="mb-4 text-justify">4.1. Залог прекращается с исполнением обеспечиваемого обязательства.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Форс-мажор</div>
  <p class="mb-4 text-justify">5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">5.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">5.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">6. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">6.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">6.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Залогодатель:</div>
      <p class="mb-1"><strong>{{{pledgor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{pledgor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{pledgor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Залогодержатель:</div>
      <p class="mb-1"><strong>{{{pledgee_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{pledgee_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{pledgee_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "debt-transfer-agreement",
    name: "Договор перевода долга",
    category: "finance",
    actSource: "ст. 391 ГК РФ",
    lastUpdated: "Август 2026",
    description: "Договор перевода долга: перевод обязательства должника на третье лицо с согласия кредитора.",
    suggestedDocs: ["loan-agreement","offset-agreement","cession-contract"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "creditor_fio", label: "ФИО кредитора", type: "text", defaultValue: "Андреев Павел Олегович", category: "lender", validation: { required: true } },
      { id: "creditor_passport", label: "Паспорт кредитора", type: "text", defaultValue: "4510 321654, выдан ОУФМС России по г. Москве 14.02.2012, к.п. 770-001", category: "lender", validation: { required: true } },
      { id: "creditor_addr", label: "Адрес кредитора", type: "text", defaultValue: "г. Москва, ул. Долговая, д. 7, кв. 12", category: "lender" },
      { id: "debtor_fio", label: "ФИО первоначального должника", type: "text", defaultValue: "Соловьёв Егор Максимович", category: "borrower", validation: { required: true } },
      { id: "debtor_passport", label: "Паспорт должника", type: "text", defaultValue: "4512 741852, выдан ОУФМС России по г. Москве 03.06.2014, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "debtor_addr", label: "Адрес должника", type: "text", defaultValue: "г. Москва, ул. Платёжная, д. 2, кв. 44", category: "borrower" },
      { id: "newdebtor_fio", label: "ФИО нового должника", type: "text", defaultValue: "Филиппов Денис Аркадьевич", category: "borrower", validation: { required: true } },
      { id: "newdebtor_passport", label: "Паспорт нового должника", type: "text", defaultValue: "4513 369258, выдан ОУФМС России по г. Москве 17.09.2016, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "newdebtor_addr", label: "Адрес нового должника", type: "text", defaultValue: "г. Москва, ул. Новая, д. 9, кв. 77", category: "borrower" },
      { id: "basis", label: "Основание долга", type: "text", defaultValue: "договор займа от 10.05.2025", category: "contract", validation: { required: true } },
      { id: "debt_amount", label: "Сумма долга (руб.)", type: "number", defaultValue: "300000", category: "payment", validation: { required: true } },
      { id: "debt_words", label: "Сумма прописью", type: "text", defaultValue: "Триста тысяч рублей 00 копеек", category: "payment", validation: { required: true } },
      { id: "pay_deadline", label: "Срок погашения", type: "text", defaultValue: "не позднее 01.12.2026", category: "contract" },
      { id: "consent", label: "Согласие кредитора", type: "text", defaultValue: "кредитор даёт согласие на перевод долга", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор перевода долга</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{creditor_fio}}}</strong> (паспорт {{{creditor_passport}}}, адрес: {{{creditor_addr}}}), именуемый в дальнейшем «Кредитор», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{debtor_fio}}}</strong> (паспорт {{{debtor_passport}}}, адрес: {{{debtor_addr}}}), именуемый в дальнейшем «Первоначальный должник», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{newdebtor_fio}}}</strong> (паспорт {{{newdebtor_passport}}}, адрес: {{{newdebtor_addr}}}), именуемый в дальнейшем «Новый должник»,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Первоначальный должник переводит на Нового должника обязательство по {{{basis}}} в размере <strong>{{{debt_amount}}} ({{{debt_words}}}) рублей</strong>.</p>
  <p class="mb-4 text-justify">1.2. {{{consent}}}. Кредитор настоящим договором подтверждает согласие на перевод долга.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности</div>
  <p class="mb-4 text-justify">2.1. Новый должник обязуется исполнить обязательство в срок: {{{pay_deadline}}}.</p>
  <p class="mb-4 text-justify">2.2. Первоначальный должник несёт ответственность за действительность переведённого долга, но освобождается от исполнения обязательства перед кредитором.</p>
  <p class="mb-4 text-justify">2.3. Кредитор сохраняет права, связанные с обязательством (неустойка, проценты), если иное не предусмотрено настоящим договором.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Заключительные положения</div>
  <p class="mb-4 text-justify">3.1. Договор вступает в силу с момента подписания всеми сторонами.</p>
  <p class="mb-4 text-justify">3.2. Перевод долга, основанный на сделке, требующей государственной регистрации, подлежит регистрации в установленном порядке.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Кредитор:</div>
      <p class="mb-1"><strong>{{{creditor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{creditor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{creditor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Первоначальный должник:</div>
      <p class="mb-1"><strong>{{{debtor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{debtor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{debtor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Новый должник:</div>
      <p class="mb-1"><strong>{{{newdebtor_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{newdebtor_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{newdebtor_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  },
{
    id: "movable-pledge",
    name: "Договор залога движимого имущества",
    category: "finance",
    actSource: "ст. 334-356 ГК РФ, ФЗ № 367-ФЗ",
    lastUpdated: "Август 2026",
    description: "Договор залога движимого имущества (автомобиль, техника, товары в обороте) в обеспечение обязательств должника.",
    suggestedDocs: ["loan-agreement","pledge-agreement","car-pledge"],
    supportsOcr: true,
    printInstruction: "Печать на одном листе А4",
    fields: [
      { id: "city", label: "Город составления", type: "text", defaultValue: "Москва", category: "contract", validation: { required: true } },
      { id: "date", label: "Дата договора", type: "date", defaultValue: "2026-08-11", category: "contract", validation: { required: true } },
      { id: "lender_fio", label: "ФИО залогодержателя", type: "text", defaultValue: "Ковалёв Виктор Иванович", category: "lender", validation: { required: true } },
      { id: "lender_passport", label: "Паспорт залогодержателя", type: "text", defaultValue: "4509 852147, выдан ОУФМС России по г. Москве 21.10.2010, к.п. 770-001", category: "lender", validation: { required: true } },
      { id: "lender_addr", label: "Адрес залогодержателя", type: "text", defaultValue: "г. Москва, ул. Залоговая, д. 3, кв. 15", category: "lender" },
      { id: "pledger_fio", label: "ФИО залогодателя", type: "text", defaultValue: "Дмитриев Антон Владимирович", category: "borrower", validation: { required: true } },
      { id: "pledger_passport", label: "Паспорт залогодателя", type: "text", defaultValue: "4512 963852, выдан ОУФМС России по г. Москве 08.01.2015, к.п. 770-002", category: "borrower", validation: { required: true } },
      { id: "pledger_addr", label: "Адрес залогодателя", type: "text", defaultValue: "г. Москва, ул. Залоговая, д. 3, кв. 15", category: "borrower" },
      { id: "secured_deal", label: "Обеспечиваемое обязательство", type: "text", defaultValue: "договор займа от 01.07.2026 на сумму 500 000 руб.", category: "contract", validation: { required: true } },
      { id: "secured_amount", label: "Сумма обеспеченного обязательства (руб.)", type: "number", defaultValue: "500000", category: "payment", validation: { required: true } },
      { id: "pledged_item", label: "Предмет залога", type: "text", defaultValue: "автомобиль Toyota Camry, 2021 г.в., VIN XW7BF4FK50S123456", category: "items", validation: { required: true } },
      { id: "pledged_value", label: "Оценка предмета залога (руб.)", type: "number", defaultValue: "2800000", category: "payment", validation: { required: true } },
      { id: "storage", label: "Хранение предмета залога", type: "text", defaultValue: "предмет залога остаётся у залогодателя по месту его жительства", category: "contract" },
      { id: "register_note", label: "Регистрация уведомления", type: "text", defaultValue: "уведомление о залоге подлежит регистрации в реестре залогов движимого имущества", category: "contract" },
    ],
    previewTemplate: `<div class="pl-[35mm] pr-[8mm] pt-[20mm] pb-[19mm] font-serif text-base leading-normal text-zinc-900 bg-white shadow-lg border border-zinc-200">
  <div class="text-center font-bold text-base mb-6 text-black uppercase">Договор залога движимого имущества</div>
  <div class="flex justify-between mb-6 text-xs font-semibold">
    <div>г. {{{city}}}</div>
    <div>«{{{date}}}»</div>
  </div>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{lender_fio}}}</strong> (паспорт {{{lender_passport}}}, адрес: {{{lender_addr}}}), именуемый в дальнейшем «Залогодержатель», с одной стороны,
  </p>
  <p class="mb-4 text-justify">
    Гражданин <strong>{{{pledger_fio}}}</strong> (паспорт {{{pledger_passport}}}, адрес: {{{pledger_addr}}}), именуемый в дальнейшем «Залогодатель», с другой стороны,
    заключили настоящий договор о нижеследующем:
  </p>
  <div class="font-bold mb-2 text-black text-xs uppercase">1. Предмет договора</div>
  <p class="mb-4 text-justify">1.1. Залогодатель передаёт в залог Залогодержателю имущество: {{{pledged_item}}}, оценочной стоимостью {{{pledged_value}}} руб.</p>
  <p class="mb-4 text-justify">1.2. Залог обеспечивает исполнение обязательства по {{{secured_deal}}} на сумму {{{secured_amount}}} руб.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">2. Права и обязанности</div>
  <p class="mb-4 text-justify">2.1. {{{storage}}}. Залогодатель не вправе отчуждать предмет залога без согласия Залогодержателя.</p>
  <p class="mb-4 text-justify">2.2. При неисполнении обеспеченного обязательства Залогодержатель вправе обратить взыскание на предмет залога во внесудебном или судебном порядке (ст. 349-350 ГК РФ).</p>
  <p class="mb-4 text-justify">2.3. {{{register_note}}}.</p>
  <div class="font-bold mb-2 text-black text-xs uppercase">3. Ответственность</div>
  <p class="mb-4 text-justify">3.1. При утрате или повреждении предмета залога залогодатель вправе заменить его равноценным имуществом с согласия залогодержателя.</p>
  <p class="mb-4 text-justify">3.2. Удовлетворение требований залогодержателя производится из стоимости предмета залога преимущественно перед другими кредиторами.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">4. Форс-мажор</div>
  <p class="mb-4 text-justify">4.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему договору, если оно явилось следствием обстоятельств непреодолимой силы (форс-мажора): стихийных бедствий, пожаров, наводнений, землетрясений, эпидемий, военных действий, решений органов государственной власти, а также иных обстоятельств, которые стороны не могли предвидеть и предотвратить разумными мерами.</p>
  <p class="mb-4 text-justify">4.2. Сторона, для которой создалась невозможность исполнения обязательств, обязана незамедлительно, но не позднее 10 (десяти) календарных дней с момента наступления таких обстоятельств, письменно уведомить другую сторону об их возникновении. Неуведомление лишает сторону права ссылаться на форс-мажор.</p>
  <p class="mb-4 text-justify">4.3. Если обстоятельства непреодолимой силы действуют более 60 (шестидесяти) календарных дней, каждая из сторон вправе в одностороннем порядке отказаться от исполнения настоящего договора, письменно уведомив другую сторону.</p>

  <div class="font-bold mb-2 text-black text-xs uppercase">5. Порядок разрешения споров</div>
  <p class="mb-4 text-justify">5.1. Все споры и разногласия, возникающие из настоящего договора или в связи с ним, стороны разрешают путём переговоров. Срок рассмотрения письменной претензии — 10 (десять) календарных дней с момента её получения.</p>
  <p class="mb-4 text-justify">5.2. При недостижении согласия споры разрешаются в судебном порядке в соответствии с действующим законодательством Российской Федерации.</p>
  <div class="grid grid-cols-2 gap-6 mt-8 text-xs border-t border-zinc-300 pt-4">
    <div>
      <div class="font-bold mb-2 uppercase text-black">Залогодержатель:</div>
      <p class="mb-1"><strong>{{{lender_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{lender_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{lender_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
    <div>
      <div class="font-bold mb-2 uppercase text-black">Залогодатель:</div>
      <p class="mb-1"><strong>{{{pledger_fio}}}</strong></p>
      <p class="text-zinc-500 text-[11px]">Паспорт: {{{pledger_passport}}}</p>
      <p class="text-zinc-500 text-[11px]">Адрес: {{{pledger_addr}}}</p>
      <div class="mt-8 border-b border-zinc-900 w-44 h-5 flex justify-end items-end text-[10px] text-zinc-400">Подпись</div>
    </div>
  </div>
</div>`,
  }
];
